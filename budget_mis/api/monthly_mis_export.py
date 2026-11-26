# =============================================================================
# File: apps/budget_mis/budget_mis/api/monthly_mis_export.py
# Endpoint: /api/method/budget_mis.api.monthly_mis_export.export_monthly_mis
# =============================================================================

import frappe
import io
import requests
from frappe.utils import flt


@frappe.whitelist()
def export_monthly_mis(financial_year, month, export_format="excel", show_full_numbers=0):
    """Fetches the same current/previous-year actuals ONCE (group_actuals_ytd) and reuses it across both get_unit_wise_actuals_breakup (foundation_consolidated.py, imported here as get_unit_wise_plan) and get_monthly_mis_break_up (monthly_mis.py) to render the whole Monthly MIS report as a styled Excel workbook or a PDF of rendered slide HTML - show_full_numbers toggles between whole rupees and Cr (crore, /10,000,000) display scaling throughout."""
    show_full_numbers = int(show_full_numbers or 0)
    try:
        import openpyxl
        from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
    except ImportError:
        frappe.throw("openpyxl required. Run: bench pip install openpyxl")

    from budget_mis.api.foundation_consolidated import get_unit_wise_actuals_breakup as get_unit_wise_plan
    from budget_mis.api.monthly_mis import get_monthly_mis_break_up

    # ── Palette ───────────────────────────────────────────────────────────────
    C_BLUE   = "1565C0"
    C_ORANGE = "F26B21"
    C_LTBLUE = "E3F2FD"
    C_WHITE  = "FFFFFF"
    C_GREY   = "F0F4FF"
    C_SUBROW = "F8F9FA"
    C_BLACK  = "000000"

    # ── Style cache (Fix 3: create once, reuse — much faster) ─────────────────
    _fill_cache  = {}
    _border_cache = {}
    _font_cache  = {}

    def _fill(c):
        if c not in _fill_cache:
            _fill_cache[c] = PatternFill("solid", fgColor=c)
        return _fill_cache[c]

    def _font(bold=False, color=C_BLACK, size=9, italic=False, underline=None):
        key = (bold, color, size, italic, underline)
        if key not in _font_cache:
            _font_cache[key] = Font(name="Arial", bold=bold, color=color,
                                     size=size, italic=italic,
                                     underline=underline or "none" if underline else None)
        return _font_cache[key]

    def _border(color=C_BLACK):
        if color not in _border_cache:
            s = Side(style="thin", color=color)
            _border_cache[color] = Border(left=s, right=s, top=s, bottom=s)
        return _border_cache[color]

    def _align(h="left", v="center"):
        return Alignment(horizontal=h, vertical=v, wrap_text=False)

    def prev_fy(fy):
        p = fy.split("-")
        return f"{int(p[0])-1}-{str(int(p[1])-1).zfill(2)}"

    def is_covid(lbl):
        return "COVID" in (lbl or "").upper()

    def to_cr(paisa):
        if not paisa: return None
        if show_full_numbers:
            v = round(flt(paisa))
        else:
            v = round(flt(paisa) / 10_000_000, 1)
        return v if v else None

    def _scale(paisa):
        """Convert a raw rupee amount to the display unit (Cr, or full rupees
        when show_full_numbers is set) -- used wherever values are pre-divided
        into sub_heads/items structures before later rounding."""
        v = flt(paisa)
        return v if show_full_numbers else v / 10_000_000

    def pct_val(act, bud):
        if not bud: return None
        p = round(flt(act) / flt(bud) * 100, 1)
        return p if p else None

    def rnd(v):
        """Round an already-scaled monetary value for display: whole rupees
        when show_full_numbers is set, else 1 decimal place (Cr)."""
        if v is None: return v
        return round(v) if show_full_numbers else round(v, 1)

    PREV_FY     = prev_fy(financial_year)
    CUR_LBL     = f"Current Year YTD  {financial_year}"
    PREV_LBL    = f"Last Year YTD  {PREV_FY}"
    GRANTS_NAME = "Grants & Donations"

    # ── Fetch ─────────────────────────────────────────────────────────────────
    # The current-year ERP actuals (group_actuals_ytd) are needed by both
    # get_unit_wise_plan and get_monthly_mis_break_up below; fetching them
    # once here and passing them through avoids a second ~15s live ERP round
    # trip for data that's identical for the same financial_year/month.
    #
    # The previous-year fetch (for prev_raw) is genuinely different data -
    # last year's YTD actuals - so it can't be shared with the above, but it
    # IS fully independent of it: nothing about fetching current-year
    # actuals depends on last year's, or vice versa. Each one is a real,
    # uncached-on-a-cold-key PeopleSoft HTTP round trip (12-32s observed via
    # ERP Actuals Call Log), and running them sequentially (as this used to)
    # means every export pays the sum of both. They're fetched concurrently
    # instead, each in its own thread with its own frappe.init/connect (a
    # thread does not inherit the request's frappe.local - Frappe's db/cache
    # handles are thread-local, not shared - so each worker here needs its
    # own site connection, same as any other genuinely multi-threaded Frappe
    # code), cutting the wait to roughly the SLOWER of the two instead of
    # their sum.
    from budget_mis.api.erp_actuals import group_actuals_ytd
    from budget_mis.api.helper import get_accounting_period_from_month as _acct_period
    import threading

    _cur_period = _acct_period(month, financial_year)
    _prev_period = _acct_period(month, PREV_FY)
    _site = frappe.local.site
    _fetch_results, _fetch_errors = {}, {}

    def _fetch_grouped_actuals(key, fiscal_year_arg, accounting_period_arg):
        frappe.init(site=_site)
        frappe.connect()
        try:
            _fetch_results[key] = group_actuals_ytd(
                fiscal_year=fiscal_year_arg,
                accounting_period=accounting_period_arg,
            ).get("data", [])
            # group_actuals_ytd's own ERP Actuals Call Log write (and
            # anything else transactional it touches, e.g. a fresh cache
            # miss's log_call insert) happens on THIS thread's own DB
            # connection - unlike a normal request, nothing auto-commits
            # it when the thread exits, so it must be committed explicitly
            # here or it's silently rolled back by frappe.destroy() below.
            frappe.db.commit()
        except Exception as e:  # noqa: BLE001 - re-raised on the main thread below
            _fetch_errors[key] = e
        finally:
            frappe.destroy()

    _threads = [
        threading.Thread(target=_fetch_grouped_actuals, args=(
            "cur", _cur_period.get("fiscal_year"), _cur_period.get("accounting_period"))),
        threading.Thread(target=_fetch_grouped_actuals, args=(
            "prev", _prev_period.get("fiscal_year"), _prev_period.get("accounting_period"))),
    ]
    for t in _threads:
        t.start()
    for t in _threads:
        t.join()

    if "cur" in _fetch_errors or "prev" in _fetch_errors:
        err = _fetch_errors.get("cur") or _fetch_errors.get("prev")
        if isinstance(err, (requests.exceptions.Timeout, requests.exceptions.ConnectionError)):
            frappe.log_error("ERP Timeout", "Request timed out")
            frappe.throw("The ERP system did not respond in time. Please try again in a few minutes.")
        raise err

    shared_grouped_actuals = _fetch_results["cur"]
    prev_grouped_actuals = _fetch_results["prev"]

    cur_raw  = get_unit_wise_plan(financial_year, month,
                                   table_name_filter="Monthly MIS Capex & Opex",
                                   _grouped_actuals_data=shared_grouped_actuals)
    prev_raw = get_unit_wise_plan(PREV_FY, month,
                                   table_name_filter="Monthly MIS Capex & Opex",
                                   _grouped_actuals_data=prev_grouped_actuals)
    BREAKUP_LABELS = (
        "Education - District Institutes,Education- Azim Premji Schools,"
        "Azim Premji University (Bangalore Campus),"
        "Azim Premji University (Bhopal Campus),"
        "Azim Premji University (Ranchi Campus),"
        "Enablers,Livelihoods,"
        "Urban Primary care work,Rural Primary care work,"
        "Central Initiatives,Hospital,Health Programs Team & Enablers"
    )
    breakup_raw = get_monthly_mis_break_up(
        financial_year, month,
        table_name_filter=BREAKUP_LABELS,
        _grouped_actuals_data=shared_grouped_actuals,
    ) or {}

    def parse_main(raw):
        out, order, seen = {}, [], set()
        for row in sorted(raw or [], key=lambda x: x.get("sequence_id", 0)):
            lbl = (row.get("label") or "").strip()
            if not lbl or row.get("sequence_id") == 9999: continue
            r = dict(ob=0, oa=0, cb=0, ca=0, vb=0, va=0, tb=0, ta=0,
                     is_sub=int(row.get("is_this_sub_item") or 0),
                     hide_number=int(row.get("hide_number") or 0), sub_heads=[])
            for sec in sorted(row.get("actuals") or [],
                               key=lambda x: x.get("sequence_id", 0)):
                nm = (sec.get("name") or "").replace("  ", " ").strip().upper()
                b  = flt(sec.get("ytd") or 0)
                a  = flt(sec.get("total_posted_amt_ytd") or 0)
                if nm == "OPERATING EXPENSES":
                    r["ob"] += b; r["oa"] += a
                    for sh in sorted(sec.get("sub_heads") or [],
                                      key=lambda x: x.get("sequence_id", 0)):
                        sn = (sh.get("name") or "").strip()
                        if not sn: continue
                        items = []
                        for it in sorted(sh.get("items") or [],
                                          key=lambda x: x.get("sequence_id", 0)):
                            iname = (it.get("name") or "").strip()
                            if iname:
                                items.append(dict(
                                    name=iname,
                                    b=_scale(it.get("ytd") or 0),
                                    a=_scale(it.get("total_posted_amt") or 0),
                                ))
                        r["sub_heads"].append(dict(
                            name=sn,
                            b=_scale(sh.get("ytd") or 0),
                            a=_scale(sh.get("total_posted_amt_ytd") or 0),
                            items=items,
                        ))
                elif nm == "CAPITAL EXPENSES":
                    r["cb"] += b; r["ca"] += a
                elif "COVID" in nm:
                    r["vb"] += b; r["va"] += a
                    # Include COVID in opex total (matches extractSection OPEX_NAMES logic)
                    r["ob"] += b; r["oa"] += a
            r["tb"] = r["ob"] + r["cb"]   # ob already includes covid
            r["ta"] = r["oa"] + r["ca"]
            out[lbl] = r
            if lbl not in seen:
                order.append(lbl); seen.add(lbl)
        return out, order

    cur_map, order = parse_main(cur_raw)
    prev_map, _    = parse_main(prev_raw)

    def get_breakup_entries(key):
        """
        Find entries for a given label key from breakup_raw.
        Handles multiple response shapes:
          1. { "table_name": { "label": [entries] } }   ← nested dict of dicts
          2. { "label": [entries] }                       ← flat dict
          3. { "table_name": [entries_with_label_field] } ← list of dicts
        """
        def _filter(entries):
            if not isinstance(entries, list):
                return []
            return [e for e in sorted(entries, key=lambda x: x.get("sequence_id", 0))
                    if (e.get("label") or "") not in ("CONSOLIDATED TOTAL", "")
                    and e.get("settings_doc") != "CONSOLIDATED"]

        if not breakup_raw:
            return []

        # Shape 1: flat dict with key directly
        if key in breakup_raw:
            val = breakup_raw[key]
            if isinstance(val, list):
                return _filter(val)
            if isinstance(val, dict):
                # value is a sub-dict; entries might be inside
                return _filter(list(val.values()))

        # Shape 2: nested — iterate over top-level values
        for grp in breakup_raw.values():
            if isinstance(grp, dict):
                if key in grp:
                    return _filter(grp[key] if isinstance(grp[key], list) else [])
            elif isinstance(grp, list):
                # List of entries — filter by label field
                matched = [e for e in grp
                           if (e.get("label") or "").strip() == key
                           and (e.get("label") or "") not in ("CONSOLIDATED TOTAL",)
                           and e.get("settings_doc") != "CONSOLIDATED"]
                if matched:
                    return sorted(matched, key=lambda x: x.get("sequence_id", 0))

        return []

    def exAct(actuals):
        ob = oa = cb = ca = 0.0
        for sec in sorted(actuals or [], key=lambda x: x.get("sequence_id", 0)):
            nm = (sec.get("name") or "").replace("  ", " ").strip().upper()
            b  = _scale(sec.get("ytd") or 0)
            a  = _scale(sec.get("total_posted_amt_ytd") or 0)
            if not b and not a:
                for sh in (sec.get("sub_heads") or []):
                    b += _scale(sh.get("ytd") or 0)
                    a += _scale(sh.get("total_posted_amt_ytd") or 0)
            if nm == "OPERATING EXPENSES":   ob += b; oa += a
            elif nm == "CAPITAL EXPENSES":   cb += b; ca += a
        return dict(ob=ob, oa=oa, cb=cb, ca=ca, tb=ob+cb, ta=oa+ca)

    # ── Workbook — columns A-G (card 1) + spacer H + I-O (card 2) ────────────
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Monthly MIS"
    ws.sheet_view.showGridLines = False
    # Card 1: A-G (cols 1-7)
    ws.column_dimensions["A"].width = 30
    for col in list("BCDEFG"): ws.column_dimensions[col].width = 11
    # Spacer: H (col 8)
    ws.column_dimensions["H"].width = 2
    # Card 2: I-O (cols 9-15)
    ws.column_dimensions["I"].width = 30
    for col in ["J","K","L","M","N","O"]: ws.column_dimensions[col].width = 11

    # ── Cell helpers — offset-aware ───────────────────────────────────────────
    def _cell(r, c, val, bg, bold=False, fg=C_BLACK, size=9, h="left", italic=False, is_pct=False):
        cell = ws.cell(row=r, column=c, value=val)
        cell.fill      = _fill(bg)
        cell.font      = _font(bold=bold, color=fg, size=size, italic=italic)
        cell.alignment = _align(
            h if h != "auto" else
            ("right" if isinstance(val, (int, float)) and val is not None else "left"),
            "center"
        )
        cell.border    = _border(C_WHITE if bg in (C_BLUE, C_ORANGE) else C_BLACK)
        if isinstance(val, float):
            if is_pct:
                cell.number_format = "#,##0.0"
            else:
                cell.number_format = "#,##0" if show_full_numbers else "#,##0.0"
        return cell

    def hdr(r, c, val, bg, fg=C_WHITE, h="center"):
        return _cell(r, c, val, bg, bold=True, fg=fg, size=9, h=h)

    def dat(r, c, val, bg=C_WHITE, bold=False, is_pct=False):
        return _cell(r, c, val, bg, bold=bold, fg=C_WHITE if bg==C_BLUE else C_BLACK,
                     size=9, h="auto", is_pct=is_pct)

    # Merge helper
    def merge(r, c1, c2):
        from openpyxl.utils import get_column_letter
        ws.merge_cells(
            f"{get_column_letter(c1)}{r}:{get_column_letter(c2)}{r}"
        )

    # ── Layout builders — offset = 0 (left card) or 8 (right card, skip H) ──
    def section_title(r, text, c_start=1, c_end=7):
        merge(r, c_start, c_end)
        c = ws.cell(row=r, column=c_start, value=text.upper())
        c.fill = _fill(C_WHITE)
        c.font = Font(name="Arial", bold=True, color=C_BLUE, size=11, underline="single")
        c.alignment = _align("left", "center")
        thick = Side(style="medium", color=C_BLUE)
        none  = Side(style=None)
        from openpyxl.styles import Border as B2
        c.border = B2(bottom=thick, left=none, right=none, top=none)
        for col in range(c_start+1, c_end+1):
            ws.cell(row=r, column=col).fill   = _fill(C_WHITE)
            ws.cell(row=r, column=col).border = B2(bottom=thick, left=none, right=none, top=none)
        ws.row_dimensions[r].height = 18
        return r + 1

    def two_row_hdr(r, col_label, grp1, grp2, off=0):
        # off=0 → cols 1-7, off=8 → cols 9-15
        c = off + 1
        merge(r, c, c); merge(r+1, c, c)
        hdr(r, c, col_label, C_BLUE, h="left")
        hdr(r+1, c, "", C_BLUE, h="left")
        merge(r, c+1, c+3); hdr(r, c+1, grp1, C_BLUE, h="center")
        merge(r, c+4, c+6); hdr(r, c+4, grp2, C_BLUE, h="center")
        for i, lbl in enumerate(["Budget","Actuals","% of Budget",
                                   "Budget","Actuals","% of Budget"]):
            hdr(r+1, c+1+i, lbl, C_ORANGE, h="center")
        ws.row_dimensions[r].height   = 14
        ws.row_dimensions[r+1].height = 14
        return r + 2

    def section_hdr_row(r, text, c_start=1, c_end=7):
        merge(r, c_start, c_end)
        c = ws.cell(row=r, column=c_start, value=text)
        c.fill = _fill(C_GREY); c.font = _font(bold=True, color=C_BLUE, size=9)
        c.alignment = _align("left", "center")
        for col in range(c_start+1, c_end+1):
            ws.cell(row=r, column=col).fill   = _fill(C_GREY)
            ws.cell(row=r, column=col).border = _border()
        return r + 1

    def data_row_7(r, lbl, v1, v2, v3, v4, v5, v6, off=0, bg=C_WHITE, bold=False):
        c = off + 1
        dat(r, c,   lbl, bg, bold=bold)
        for i, v in enumerate([v1,v2,v3,v4,v5,v6]):
            dat(r, c+1+i, v, bg, bold=bold, is_pct=(i in (2, 5)))

    def total_row_7(r, cb, ca, pb, pa, off=0, bg=C_LTBLUE):
        c = off + 1
        dat(r, c, "Total", bg, bold=True)
        vals = [rnd(cb), rnd(ca), pct_val(ca,cb), rnd(pb), rnd(pa), pct_val(pa,pb)]
        for i, v in enumerate(vals):
            dat(r, c+1+i, v, bg, bold=True, is_pct=(i in (2, 5)))

    def grand_row_7(r, label, cb, ca, pb, pa, off=0):
        c = off + 1
        for col in range(c, c+7):
            ws.cell(row=r, column=col).fill   = _fill(C_BLUE)
            ws.cell(row=r, column=col).font   = _font(bold=True, color=C_WHITE, size=9)
            ws.cell(row=r, column=col).border = _border(C_WHITE)
            ws.cell(row=r, column=col).alignment = _align("right","center")
        ws.cell(row=r, column=c).value     = label
        ws.cell(row=r, column=c).alignment = _align("left","center")
        for i, v in enumerate([rnd(cb), rnd(ca), pct_val(ca,cb), rnd(pb), rnd(pa), pct_val(pa,pb)]):
            ws.cell(row=r, column=c+1+i).value = v
            if isinstance(v, float):
                is_pct = i in (2, 5)
                ws.cell(row=r, column=c+1+i).number_format = (
                    "#,##0.0" if is_pct else ("#,##0" if show_full_numbers else "#,##0.0")
                )

    # ── SECTION WRITERS ───────────────────────────────────────────────────────

    def write_main_section(row, title, bk, ak):
        row = section_title(row, title)
        row = two_row_hdr(row, "Unit", CUR_LBL, PREV_LBL)
        tCB = tCA = tPB = tPA = 0.0
        cv_cb = cv_ca = cv_pb = cv_pa = 0.0
        for lbl in order:
            cm = cur_map.get(lbl, {}); pm = prev_map.get(lbl, {})
            is_sub = cm.get("is_sub",0) or pm.get("is_sub",0)
            # "Hide number?" on this combination's own Combination of unit
            # settings row - matches ExpenseTable.vue/buildExpTotals'
            # exact behavior: this row's own cells render blank (not a
            # real 0, which would look like a genuine zero) and it's
            # excluded from Total/Grand Total, but the row's label still
            # shows - same as the live page, NOT the same as the
            # Operating Expenses Breakdown cards, which never apply this
            # flag at all (see write_unit_card/card_rows).
            hide_number = cm.get("hide_number", 0) or pm.get("hide_number", 0)
            bg  = C_SUBROW if is_sub else C_WHITE
            cb  = to_cr(cm.get(bk,0)); ca = to_cr(cm.get(ak,0))
            pb  = to_cr(pm.get(bk,0)); pa = to_cr(pm.get(ak,0))
            # Covid-19 is pulled out of the main list entirely (matching
            # _build_pptx's main_slide()) and held aside for its own row
            # below - "Total" is every OTHER top-level unit, "Grand Total"
            # is Total + Covid-19, same as the reference Excel layout.
            if is_covid(lbl):
                cv_cb, cv_ca, cv_pb, cv_pa = flt(cb), flt(ca), flt(pb), flt(pa)
                continue
            if hide_number:
                data_row_7(row, ("  " if is_sub else "")+lbl,
                           None, None, None, None, None, None, bg=bg)
                row += 1
                continue
            data_row_7(row, ("  " if is_sub else "")+lbl,
                       cb, ca, pct_val(ca,cb), pb, pa, pct_val(pa,pb), bg=bg)
            row += 1
            if not is_sub:
                tCB+=flt(cb); tCA+=flt(ca); tPB+=flt(pb); tPA+=flt(pa)
        total_row_7(row, tCB, tCA, tPB, tPA)
        row += 1
        data_row_7(row, "Covid-19", rnd(cv_cb), rnd(cv_ca), pct_val(cv_ca,cv_cb),
                   rnd(cv_pb), rnd(cv_pa), pct_val(cv_pa,cv_pb))
        row += 1
        grand_row_7(row, "Grand Total",
                    tCB+cv_cb, tCA+cv_ca, tPB+cv_pb, tPA+cv_pa)
        row += 2
        return row

    def write_breakup_section(row, title, keys, col_label="Areas of Work"):
        row = section_title(row, title)
        row = two_row_hdr(row, col_label, "Operating Expense", "Capital Expense")
        # BreakupTable.vue only shows a key's own "Total" subtotal row when
        # that key has more than 1 row (sec.rows.length > 1) - a 1-row
        # section's own "Total" would just repeat that single row's own
        # numbers. ADDITIONALLY (singleQualifyingSectionLabel in
        # BreakupTable.vue), if exactly ONE key across this whole section
        # ends up with >1 row, that one key's own subtotal is ALSO
        # identical to the section's final "Total {title}" grand-total row
        # (nothing else contributes more than a single row to sum), so it
        # must be suppressed too - only the grand-total row should show.
        # get_breakup_entries(key) is pure/cheap (just filters the already-
        # fetched breakup_raw dict, no new fetch), so calling it twice per
        # key (once here to count, once below to render) duplicates no
        # expensive work.
        qualifying_keys = [k for k in keys if len([
            e for e in get_breakup_entries(k) if (e.get("label") or "").strip()
        ]) > 1]
        single_qualifying_key = qualifying_keys[0] if len(qualifying_keys) == 1 else None
        g_ob=g_oa=g_cb=g_ca=0.0
        for key in keys:
            entries = get_breakup_entries(key)
            row = section_hdr_row(row, key)
            s_ob=s_oa=s_cb=s_ca=0.0
            n_key_rows = 0
            for e in entries:
                lbl2 = (e.get("label") or "").strip()
                if not lbl2: continue
                v = exAct(e.get("actuals",[]))
                data_row_7(row, "  "+lbl2,
                           rnd(v["ob"]), rnd(v["oa"]), pct_val(v["oa"],v["ob"]),
                           rnd(v["cb"]), rnd(v["ca"]), pct_val(v["ca"],v["cb"]))
                row += 1
                s_ob+=v["ob"]; s_oa+=v["oa"]; s_cb+=v["cb"]; s_ca+=v["ca"]
                n_key_rows += 1
            if n_key_rows > 1 and key != single_qualifying_key:
                total_row_7(row, s_ob, s_oa, s_cb, s_ca)
                row += 1
            g_ob+=s_ob; g_oa+=s_oa; g_cb+=s_cb; g_ca+=s_ca
        grand_row_7(row, f"Total {title}", g_ob, g_oa, g_cb, g_ca)
        row += 2
        return row

    def write_unit_card(ws_row, start_col, display_lbl,
                        sub_heads_cur, sub_heads_prev, opex_bud, opex_act,
                        prev_opex_bud, prev_opex_act):
        """Write one breakdown card starting at (ws_row, start_col)."""
        off = start_col - 1   # offset: 0 for left (col1), 8 for right (col9)
        c_start = start_col; c_end = start_col + 6
        row = section_hdr_row(ws_row, display_lbl, c_start, c_end)
        row = two_row_hdr(row, "Expense Category", CUR_LBL, PREV_LBL, off=off)
        prev_sh_map = {sh["name"]: sh for sh in (sub_heads_prev or [])}
        for sh in (sub_heads_cur or []):
            sn = sh["name"]; psh = prev_sh_map.get(sn, {"b":0,"a":0,"items":[]})
            # Skip check must use the RAW sub-head totals (sh["b"]/sh["a"],
            # which include Grants) rather than dcb/dca (the Grants-
            # subtracted display values) - see the matching PPTX fix in
            # card_rows() above for the full reasoning: a category whose
            # own direct amount is 0 but whose nested Grants item isn't
            # (e.g. "Supporting Madrasas") has a non-zero raw total but an
            # all-zero dcb/dca, so checking dcb/dca here was dropping the
            # whole category (and its Grants row) instead of just truly
            # empty ones.
            if not any([sh.get("b", 0), sh.get("a", 0), psh.get("b", 0), psh.get("a", 0)]):
                continue
            g_cb=g_ca=g_pb=g_pa=0.0
            if sn.upper().replace("  "," ") == "PROGRAM EXPENSES":
                for it in sh.get("items",[]):
                    if it["name"]==GRANTS_NAME: g_cb=it["b"]; g_ca=it["a"]
                for it in psh.get("items",[]):
                    if it["name"]==GRANTS_NAME: g_pb=it["b"]; g_pa=it["a"]
            dcb=sh["b"]-g_cb; dca=sh["a"]-g_ca; dpb=psh["b"]-g_pb; dpa=psh["a"]-g_pa
            data_row_7(row, sn, rnd(dcb), rnd(dca), pct_val(dca,dcb),
                       rnd(dpb), rnd(dpa), pct_val(dpa,dpb), off=off)
            row += 1
            if g_cb or g_ca or g_pb or g_pa:
                data_row_7(row, "  Grants", rnd(g_cb), rnd(g_ca), pct_val(g_ca,g_cb),
                           rnd(g_pb), rnd(g_pa), pct_val(g_pa,g_pb), off=off)
                row += 1
        total_row_7(row, opex_bud, opex_act, prev_opex_bud, prev_opex_act, off=off)
        row += 1
        return row

    def write_breakdown_section(start_row):
        """Fix 4: two unit cards side-by-side per row."""
        start_row = section_title(start_row, "Operating Expenses Breakdown", 1, 15)

        # Aggregate for Total Foundation (items merged by name across units,
        # not overwritten -- otherwise only the last unit's Grants/etc. survive)
        def merge_items(dst_items, src_items):
            idx = {it["name"]: it for it in dst_items}
            for it in (src_items or []):
                if it["name"] not in idx:
                    new_it = dict(name=it["name"], b=0.0, a=0.0)
                    dst_items.append(new_it)
                    idx[it["name"]] = new_it
                idx[it["name"]]["b"] += it.get("b", 0) or 0
                idx[it["name"]]["a"] += it.get("a", 0) or 0

        agg_cur, agg_prev = {}, {}
        for lbl in order:
            if cur_map.get(lbl,{}).get("is_sub"): continue
            for sh in cur_map.get(lbl,{}).get("sub_heads",[]):
                if sh["name"] not in agg_cur:
                    agg_cur[sh["name"]] = dict(name=sh["name"],b=0.0,a=0.0,items=[])
                agg_cur[sh["name"]]["b"] += sh["b"]; agg_cur[sh["name"]]["a"] += sh["a"]
                merge_items(agg_cur[sh["name"]]["items"], sh.get("items"))
            for sh in prev_map.get(lbl,{}).get("sub_heads",[]):
                if sh["name"] not in agg_prev:
                    agg_prev[sh["name"]] = dict(name=sh["name"],b=0.0,a=0.0,items=[])
                agg_prev[sh["name"]]["b"] += sh["b"]; agg_prev[sh["name"]]["a"] += sh["a"]
                merge_items(agg_prev[sh["name"]]["items"], sh.get("items"))

        tf_cb  = to_cr(sum(cm.get("ob",0) for cm in cur_map.values()  if not cm.get("is_sub")))
        tf_ca  = to_cr(sum(cm.get("oa",0) for cm in cur_map.values()  if not cm.get("is_sub")))
        tf_pb  = to_cr(sum(pm.get("ob",0) for pm in prev_map.values() if not pm.get("is_sub")))
        tf_pa  = to_cr(sum(pm.get("oa",0) for pm in prev_map.values() if not pm.get("is_sub")))

        # Build unit list: Total Foundation first, then all units
        cards = [("Total Foundation",
                  list(agg_cur.values()), list(agg_prev.values()),
                  tf_cb, tf_ca, tf_pb, tf_pa)]
        for lbl in order:
            cm = cur_map.get(lbl,{}); pm = prev_map.get(lbl,{})
            cards.append((lbl, cm.get("sub_heads",[]), pm.get("sub_heads",[]),
                          to_cr(cm.get("ob",0)), to_cr(cm.get("oa",0)),
                          to_cr(pm.get("ob",0)), to_cr(pm.get("oa",0))))

        # Write in pairs (left col=1, right col=9)
        row = start_row
        i = 0
        while i < len(cards):
            left  = cards[i]
            right = cards[i+1] if i+1 < len(cards) else None
            # Find max row both cards will reach
            row_l = write_unit_card(row, 1, left[0],  left[1],  left[2],
                                    left[3],  left[4],  left[5],  left[6])
            if right:
                row_r = write_unit_card(row, 9, right[0], right[1], right[2],
                                        right[3], right[4], right[5], right[6])
                row = max(row_l, row_r)
            else:
                row = row_l
            row += 1
            i += 2
        return row

    # ── TITLE ROW (Fix 1: smaller text) ──────────────────────────────────────
    row = 1
    # Full width title covers A to O (cols 1-15)
    for col in range(1, 16):
        ws.cell(row=row, column=col).fill = _fill(C_BLUE)
    ws.merge_cells("A1:O1")
    unit_lbl = "₹" if show_full_numbers else "₹ Cr."
    t = ws.cell(row=1, column=1,
                value=f"MIS – Azim Premji Foundation   |   YTD {month}-{financial_year.split('-')[0]}   |   {unit_lbl}")
    t.font      = _font(bold=True, size=10, color=C_WHITE)   # Fix 1: size 10 (was 13)
    t.alignment = _align("center", "center")
    ws.row_dimensions[1].height = 20
    row = 3   # blank row 2 then start

    # ── WRITE ALL SECTIONS ────────────────────────────────────────────────────
    row = write_main_section(row, "Operating Expense",  "ob", "oa")
    row = write_main_section(row, "Capital Expense",    "cb", "ca")
    row = write_main_section(row, "Overall Foundation", "tb", "ta")
    row = write_breakup_section(row, "Education",
          ["Education - District Institutes","Education- Azim Premji Schools"],"States")
    row = write_breakup_section(row, "Health",
          ["Urban Primary care work","Rural Primary care work",
           "Central Initiatives","Hospital","Health Programs Team & Enablers"],"Areas of Work")
    row = write_breakup_section(row, "Livelihoods", ["Livelihoods"], "States")
    row = write_breakup_section(row, "University",
          ["Azim Premji University (Bangalore Campus)",
           "Azim Premji University (Bhopal Campus)",
           "Azim Premji University (Ranchi Campus)"], "Campus / Unit")
    row = write_breakup_section(row, "Enablers", ["Enablers"], "Functions")
    row = write_breakdown_section(row)   # Fix 4: 2 cards per row

    # ── Freeze & finish ───────────────────────────────────────────────────────
    ws.freeze_panes = "A3"
    ws.row_dimensions[1].height = 20

    # Fix 2: Portrait page setup for PDF export
    from openpyxl.worksheet.page import PageMargins, PrintPageSetup
    ws.page_setup.orientation = ws.ORIENTATION_PORTRAIT
    ws.page_setup.fitToPage   = True
    ws.page_setup.fitToWidth  = 1
    ws.page_setup.fitToHeight = 0
    ws.page_margins = PageMargins(left=0.4, right=0.4, top=0.5, bottom=0.5)
    ws.print_title_rows = "1:2"   # repeat title on every page

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    excel_bytes = buf.read()

    fname_base = f"MIS_APF_{financial_year}_YTD_{month}"

    if str(export_format).lower() == "pdf":
        html = _build_slide_pdf_html(
            financial_year=financial_year, month=month, unit_lbl=unit_lbl,
            order=order, cur_map=cur_map, prev_map=prev_map,
            get_breakup_entries=get_breakup_entries, exAct=exAct,
            to_cr=to_cr, rnd=rnd, pct_val=pct_val, GRANTS_NAME=GRANTS_NAME,
        )
        from frappe.utils.pdf import get_pdf
        # Landscape, matching the 13.333x7.5in slide aspect ratio used by the
        # PowerPoint export, so PDF and PPTX show the same slide-by-slide layout.
        pdf_bytes = get_pdf(html, {
            "page-width": "338.667mm",
            "page-height": "190.5mm",
            "margin-top": "0mm",
            "margin-bottom": "0mm",
            "margin-left": "0mm",
            "margin-right": "0mm",
        })
        frappe.response["filename"]    = fname_base + ".pdf"
        frappe.response["filecontent"] = pdf_bytes
        frappe.response["type"]        = "binary"
        frappe.response["doctype"]     = None
    elif str(export_format).lower() in ("pptx", "ppt", "powerpoint"):
        try:
            import pptx  # noqa: F401
        except ImportError:
            frappe.throw("python-pptx required. Run: bench pip install python-pptx")
        pptx_bytes = _build_pptx(
            financial_year=financial_year, month=month, unit_lbl=unit_lbl,
            order=order, cur_map=cur_map, prev_map=prev_map,
            get_breakup_entries=get_breakup_entries, exAct=exAct,
            to_cr=to_cr, rnd=rnd, pct_val=pct_val, GRANTS_NAME=GRANTS_NAME,
        )
        frappe.response["filename"]    = fname_base + ".pptx"
        frappe.response["filecontent"] = pptx_bytes
        frappe.response["type"]        = "binary"
        frappe.response["doctype"]     = None
    else:
        frappe.response["filename"]    = fname_base + ".xlsx"
        frappe.response["filecontent"] = excel_bytes
        frappe.response["type"]        = "binary"
        frappe.response["doctype"]     = None


def _build_pptx(financial_year, month, unit_lbl, order, cur_map, prev_map,
                 get_breakup_entries, exAct, to_cr, rnd, pct_val, GRANTS_NAME):
    """Build the Monthly MIS as a native PowerPoint deck, matching the
    reference deck's style: a title slide, then one slide per section with
    a blue/orange table (Operating/Capital/Overall Foundation with Total/
    Covid-19/Grand Total rows, the Education/Health/Livelihoods/University/
    Enablers breakup tables, and the Expense Category breakdown cards)."""
    from pptx import Presentation
    from pptx.util import Inches, Pt, Emu
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN

    # Matches the real Azim Premji Foundation logo's own colors (sampled
    # directly from apf_logo.png: a bright cyan-blue square + an orange
    # dot) instead of the generic navy-blue/orange this deck used before -
    # C_ORANGE was already a near-exact match (F26B21 vs the logo's
    # F07025), kept as-is; C_BLUE changed from 1565C0 (navy) to 008FC9
    # (the logo's real blue), with C_LTBLUE/C_GREY re-tinted from that same
    # new blue at the same tint ratios the old navy-based ones used (~92%/
    # ~95% toward white), so the whole table's blue family stays internally
    # consistent instead of just swapping the one color that's visible in
    # the header bar.
    C_BLUE   = RGBColor(0x00, 0x8F, 0xC9)
    C_ORANGE = RGBColor(0xF2, 0x6B, 0x21)
    C_LTBLUE = RGBColor(0xEB, 0xF6, 0xFB)
    C_WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
    C_GREY   = RGBColor(0xF3, 0xFA, 0xFD)
    C_BLACK  = RGBColor(0x00, 0x00, 0x00)

    def prev_fy(fy):
        p = fy.split("-")
        return f"{int(p[0])-1}-{str(int(p[1])-1).zfill(2)}"

    PREV_FY  = prev_fy(financial_year)
    CUR_LBL  = f"Current Year YTD {financial_year}"
    PREV_LBL = f"Last Year YTD {PREV_FY}"
    YTD_LBL  = f"YTD {month}-{financial_year.split('-')[0]}"

    def is_covid(lbl):
        return "COVID" in (lbl or "").upper()

    def fmt(v):
        if v is None:
            return "-"
        return f"{v:,.0f}" if float(v).is_integer() else f"{v:,.1f}"

    def fmt_pct(v):
        return "-" if v is None else f"{v:.1f}%"

    import os
    LOGO_PATH = frappe.get_app_path("budget_mis", "public", "images", "apf_logo.png")
    has_logo = os.path.isfile(LOGO_PATH)

    prs = Presentation()
    prs.slide_width  = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def add_slide():
        return prs.slides.add_slide(blank_layout)

    def add_logo(slide, width=Inches(1.4), top=Inches(0.15)):
        if not has_logo:
            return
        left = prs.slide_width - width - Inches(0.3)
        slide.shapes.add_picture(LOGO_PATH, left, top, width=width)

    def add_accent_bar(slide, top=Inches(0.95)):
        """Thin orange bar under the header, matching the reference deck."""
        bar = slide.shapes.add_shape(1, Emu(0), top, prs.slide_width, Pt(4))
        bar.fill.solid(); bar.fill.fore_color.rgb = C_ORANGE
        bar.line.fill.background()
        bar.shadow.inherit = False

    def add_header(slide, title, subtitle=None):
        tb = slide.shapes.add_textbox(Inches(0.4), Inches(0.15), Inches(10), Inches(0.5))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]
        run = p.add_run(); run.text = title
        run.font.size = Pt(24); run.font.bold = True; run.font.color.rgb = C_BLACK
        if subtitle:
            sb = slide.shapes.add_textbox(Inches(0.4), Inches(0.62), Inches(10), Inches(0.3))
            stf = sb.text_frame
            sp = stf.paragraphs[0]
            srun = sp.add_run(); srun.text = subtitle
            srun.font.size = Pt(13); srun.font.italic = True; srun.font.color.rgb = C_BLACK
        add_logo(slide)
        add_accent_bar(slide)

    # python-pptx has no high-level API for a table cell's own border, and
    # leaving it unset doesn't mean "no border" - PowerPoint/LibreOffice/
    # OnlyOffice then fall back to a bold default grid line of their own
    # (worse once _strip_table_style below has already removed the table's
    # styleId, which is exactly the thick-grid-line look seen in the real
    # exported deck). EMU_PER_PT matches openpyxl's own "thin" Excel border
    # in visual weight (0.75pt) so the PPTX and Excel exports read the same.
    EMU_PER_PT = 12700
    THIN_BORDER_EMU = int(0.75 * EMU_PER_PT)
    BORDER_GRAY = "D9D9D9"

    def _set_thin_cell_border(cell):
        from pptx.oxml.ns import qn
        tcPr = cell._tc.get_or_add_tcPr()
        # CT_TableCellProperties requires lnL/lnR/lnT/lnB (in that order)
        # to come before any fill child already on tcPr (set_cell always
        # calls cell.fill.solid() before this) - inserting each at index 0
        # in reverse tag order produces that required order regardless of
        # what's already there.
        for tag in ("lnB", "lnT", "lnR", "lnL"):
            for existing in tcPr.findall(qn(f"a:{tag}")):
                tcPr.remove(existing)
            ln = tcPr.makeelement(qn(f"a:{tag}"), {"w": str(THIN_BORDER_EMU), "cap": "flat"})
            fill = ln.makeelement(qn("a:solidFill"), {})
            color = fill.makeelement(qn("a:srgbClr"), {"val": BORDER_GRAY})
            fill.append(color)
            ln.append(fill)
            tcPr.insert(0, ln)

    def set_cell(cell, text, bg=None, fg=C_BLACK, bold=False, size=10, align=PP_ALIGN.RIGHT):
        cell.text = "" if text is None else str(text)
        if bg is not None:
            cell.fill.solid(); cell.fill.fore_color.rgb = bg
        else:
            cell.fill.solid(); cell.fill.fore_color.rgb = C_WHITE
        _set_thin_cell_border(cell)
        cell.margin_left = Pt(3); cell.margin_right = Pt(3)
        cell.margin_top = Pt(1); cell.margin_bottom = Pt(1)
        for p in cell.text_frame.paragraphs:
            p.alignment = align
            for r in p.runs:
                r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = fg
            if not p.runs:
                r = p.add_run(); r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = fg

    def _strip_table_style(tbl):
        """Disable PowerPoint's default table style (banding/border theme
        applied via <a:tblPr firstRow/bandRow> + a built-in styleId) so our
        own per-cell fills are the ONLY thing rendered - otherwise the theme
        still draws its own row-band borders UNDER/THROUGH a vertically
        merged cell (e.g. the "Unit"/col_label header cell spanning the two
        header rows), showing as a stray horizontal seam line across it that
        the orange header row next to it doesn't have, since that row isn't
        merged. python-pptx has no high-level API for this - it has to be
        done by editing the table's <a:tblPr> directly."""
        from pptx.oxml.ns import qn
        tbl_pr = tbl._tbl.find(qn("a:tblPr"))
        if tbl_pr is None:
            return
        tbl_pr.set("firstRow", "0")
        tbl_pr.set("bandRow", "0")
        style_id = tbl_pr.find(qn("a:tableStyleId"))
        if style_id is not None:
            tbl_pr.remove(style_id)

    TABLE_TOP = Inches(1.15)
    TABLE_BOTTOM_MARGIN = Inches(0.2)

    def fit_table_geometry(n_rows, ideal_row_h=Inches(0.3), ideal_font_pt=10, min_font_pt=6, available=None):
        """Shrink row height (and font size proportionally) so a table with
        n_rows actually fits in `available` height (defaults to the space
        between TABLE_TOP and the bottom of the slide), instead of silently
        overflowing past the slide edge for large sections (Health,
        University) or stacked card grids that have many rows."""
        if available is None:
            available = prs.slide_height - TABLE_TOP - TABLE_BOTTOM_MARGIN
        ideal_total = ideal_row_h * n_rows
        if ideal_total <= available:
            return ideal_row_h, ideal_font_pt
        scale = available / ideal_total
        row_h = Emu(int(ideal_row_h * scale))
        font_pt = max(min_font_pt, int(ideal_font_pt * scale))
        return row_h, font_pt

    # ── Title slide ───────────────────────────────────────────────────────
    slide = add_slide()
    tb = slide.shapes.add_textbox(Inches(1.5), Inches(2.8), Inches(10.3), Inches(1.5))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    run = p.add_run(); run.text = "MIS – Azim Premji Foundation"
    run.font.size = Pt(32); run.font.bold = True; run.font.color.rgb = C_BLACK
    p2 = tf.add_paragraph(); p2.alignment = PP_ALIGN.CENTER
    run2 = p2.add_run(); run2.text = YTD_LBL
    run2.font.size = Pt(32); run2.font.bold = True; run2.font.color.rgb = C_BLACK
    # Same logo size/position and accent-bar position as every content
    # slide's header (add_header's own add_logo()/add_accent_bar() calls) -
    # the title slide previously used a much larger logo (2.2in vs 1.4in
    # wide) with the bar left at its default top, which cut straight
    # through the middle of the bigger logo.
    add_logo(slide)
    add_accent_bar(slide)

    # ── Main section slide (Operating/Capital/Overall Foundation) ──────────
    def main_slide(title, bk, ak):
        slide = add_slide()
        add_header(slide, title, f"Budget vs. Actuals – {YTD_LBL}")

        rows_data = []
        tCB = tCA = tPB = tPA = 0.0
        cv_cb = cv_ca = cv_pb = cv_pa = None
        for lbl in order:
            cm = cur_map.get(lbl, {}); pm = prev_map.get(lbl, {})
            is_sub = cm.get("is_sub", 0) or pm.get("is_sub", 0)
            # Same hide_number handling as write_main_section (Excel
            # builder) - blank this row's own cells and exclude it from
            # Total/Grand Total, matching ExpenseTable.vue exactly.
            hide_number = cm.get("hide_number", 0) or pm.get("hide_number", 0)
            cb = to_cr(cm.get(bk, 0)); ca = to_cr(cm.get(ak, 0))
            pb = to_cr(pm.get(bk, 0)); pa = to_cr(pm.get(ak, 0))
            if is_covid(lbl):
                cv_cb, cv_ca, cv_pb, cv_pa = cb or 0, ca or 0, pb or 0, pa or 0
                continue
            if hide_number:
                rows_data.append((lbl, is_sub, None, None, None, None))
                continue
            if not is_sub:
                tCB += flt(cb); tCA += flt(ca); tPB += flt(pb); tPA += flt(pa)
            rows_data.append((lbl, is_sub, cb, ca, pb, pa))
        cv_cb = cv_cb or 0; cv_ca = cv_ca or 0; cv_pb = cv_pb or 0; cv_pa = cv_pa or 0
        gCB, gCA, gPB, gPA = tCB + cv_cb, tCA + cv_ca, tPB + cv_pb, tPA + cv_pa

        n_rows = 2 + len(rows_data) + 3  # 2 header rows + data + total/covid/grand
        row_h, fs = fit_table_geometry(n_rows)
        tbl_shape = slide.shapes.add_table(n_rows, 7, Inches(0.4), TABLE_TOP,
                                            Inches(12.5), row_h * n_rows)
        tbl = tbl_shape.table
        _strip_table_style(tbl)
        for rr in tbl.rows:
            rr.height = row_h
        tbl.columns[0].width = Inches(3.5)
        for c in range(1, 7):
            tbl.columns[c].width = Inches(1.5)

        tbl.cell(0, 0).merge(tbl.cell(1, 0))
        set_cell(tbl.cell(0, 0), "Unit", bg=C_BLUE, fg=C_WHITE, bold=True, align=PP_ALIGN.LEFT, size=fs)
        tbl.cell(0, 1).merge(tbl.cell(0, 3))
        set_cell(tbl.cell(0, 1), CUR_LBL, bg=C_BLUE, fg=C_WHITE, bold=True, align=PP_ALIGN.CENTER, size=fs)
        tbl.cell(0, 4).merge(tbl.cell(0, 6))
        set_cell(tbl.cell(0, 4), PREV_LBL, bg=C_BLUE, fg=C_WHITE, bold=True, align=PP_ALIGN.CENTER, size=fs)
        for i, h in enumerate(["Budget", "Actuals", "% of Budget"] * 2):
            set_cell(tbl.cell(1, i + 1), h, bg=C_ORANGE, fg=C_WHITE, bold=True, align=PP_ALIGN.CENTER, size=fs)

        r = 2
        for lbl, is_sub, cb, ca, pb, pa in rows_data:
            bg = C_GREY if is_sub else C_WHITE
            set_cell(tbl.cell(r, 0), ("  " if is_sub else "") + lbl, bg=bg, align=PP_ALIGN.LEFT, size=fs)
            set_cell(tbl.cell(r, 1), fmt(cb) if cb is not None else "-", bg=bg, size=fs)
            set_cell(tbl.cell(r, 2), fmt(ca) if ca is not None else "-", bg=bg, size=fs)
            set_cell(tbl.cell(r, 3), fmt_pct(pct_val(ca, cb)), bg=bg, size=fs)
            set_cell(tbl.cell(r, 4), fmt(pb) if pb is not None else "-", bg=bg, size=fs)
            set_cell(tbl.cell(r, 5), fmt(pa) if pa is not None else "-", bg=bg, size=fs)
            set_cell(tbl.cell(r, 6), fmt_pct(pct_val(pa, pb)), bg=bg, size=fs)
            r += 1

        for label, cb, ca, pb, pa, bg, fg, bold in [
            ("Total", tCB, tCA, tPB, tPA, C_LTBLUE, C_BLACK, True),
            ("Covid-19", cv_cb, cv_ca, cv_pb, cv_pa, C_WHITE, C_BLACK, False),
            ("Grand Total", gCB, gCA, gPB, gPA, C_BLUE, C_WHITE, True),
        ]:
            set_cell(tbl.cell(r, 0), label, bg=bg, fg=fg, bold=bold, align=PP_ALIGN.LEFT, size=fs)
            set_cell(tbl.cell(r, 1), fmt(rnd(cb)), bg=bg, fg=fg, bold=bold, size=fs)
            set_cell(tbl.cell(r, 2), fmt(rnd(ca)), bg=bg, fg=fg, bold=bold, size=fs)
            set_cell(tbl.cell(r, 3), fmt_pct(pct_val(ca, cb)), bg=bg, fg=fg, bold=bold, size=fs)
            set_cell(tbl.cell(r, 4), fmt(rnd(pb)), bg=bg, fg=fg, bold=bold, size=fs)
            set_cell(tbl.cell(r, 5), fmt(rnd(pa)), bg=bg, fg=fg, bold=bold, size=fs)
            set_cell(tbl.cell(r, 6), fmt_pct(pct_val(pa, pb)), bg=bg, fg=fg, bold=bold, size=fs)
            r += 1

    # ── Breakup slide (Education/Health/Livelihoods/University/Enablers) ───
    def breakup_slide(title, keys, col_label):
        slide = add_slide()
        add_header(slide, title, f"Budget vs. Actuals – {YTD_LBL}")

        rows_data = []  # (kind, payload)
        g_ob = g_oa = g_cb = g_ca = 0.0
        # Same singleQualifyingSectionLabel suppression as BreakupTable.vue
        # / write_breakup_section above: a key's own "Total" row only shows
        # when it has >1 row, AND (additionally) when it's not the sole key
        # in this whole section with >1 row - in that case its subtotal
        # would be numerically identical to the final "Total {title}" row
        # below it, since nothing else contributes more than a single row.
        qualifying_keys = [k for k in keys if len([
            e for e in get_breakup_entries(k) if (e.get("label") or "").strip()
        ]) > 1]
        single_qualifying_key = qualifying_keys[0] if len(qualifying_keys) == 1 else None
        for key in keys:
            entries = get_breakup_entries(key)
            rows_data.append(("sec", key))
            s_ob = s_oa = s_cb = s_ca = 0.0
            n_key_rows = 0
            for e in entries:
                lbl2 = (e.get("label") or "").strip()
                if not lbl2:
                    continue
                v = exAct(e.get("actuals", []))
                rows_data.append(("row", (lbl2, v)))
                s_ob += v["ob"]; s_oa += v["oa"]; s_cb += v["cb"]; s_ca += v["ca"]
                n_key_rows += 1
            s_tb, s_ta = s_ob + s_cb, s_oa + s_ca
            if n_key_rows > 1 and key != single_qualifying_key:
                rows_data.append(("tot", ("Total", s_ob, s_oa, s_cb, s_ca, s_tb, s_ta)))
            g_ob += s_ob; g_oa += s_oa; g_cb += s_cb; g_ca += s_ca
        g_tb, g_ta = g_ob + g_cb, g_oa + g_ca

        n_rows = 2 + len(rows_data) + 1
        row_h, fs = fit_table_geometry(n_rows, ideal_row_h=Inches(0.28))
        tbl_shape = slide.shapes.add_table(n_rows, 10, Inches(0.3), TABLE_TOP,
                                            Inches(12.7), row_h * n_rows)
        tbl = tbl_shape.table
        _strip_table_style(tbl)
        for rr in tbl.rows:
            rr.height = row_h
        tbl.columns[0].width = Inches(2.8)
        for c in range(1, 10):
            tbl.columns[c].width = Inches(1.1)

        tbl.cell(0, 0).merge(tbl.cell(1, 0))
        set_cell(tbl.cell(0, 0), col_label, bg=C_BLUE, fg=C_WHITE, bold=True, align=PP_ALIGN.LEFT, size=fs)
        for i, (grp, c0) in enumerate([("Operating Expense", 1), ("Capital Expense", 4), ("Total Expense", 7)]):
            tbl.cell(0, c0).merge(tbl.cell(0, c0 + 2))
            set_cell(tbl.cell(0, c0), grp, bg=C_BLUE, fg=C_WHITE, bold=True, align=PP_ALIGN.CENTER, size=fs)
        for i, h in enumerate(["Budget", "Actuals", "% of Budget"] * 3):
            set_cell(tbl.cell(1, i + 1), h, bg=C_ORANGE, fg=C_WHITE, bold=True, align=PP_ALIGN.CENTER, size=fs)

        def fill_row(r, lbl, ob, oa, cb, ca, tb, ta, bg, fg=C_BLACK, bold=False, indent=False):
            set_cell(tbl.cell(r, 0), ("  " if indent else "") + lbl, bg=bg, fg=fg, bold=bold, align=PP_ALIGN.LEFT, size=fs)
            vals = [rnd(ob), rnd(oa), pct_val(oa, ob), rnd(cb), rnd(ca), pct_val(ca, cb), rnd(tb), rnd(ta), pct_val(ta, tb)]
            for i, v in enumerate(vals):
                txt = fmt_pct(v) if i in (2, 5, 8) else fmt(v)
                set_cell(tbl.cell(r, i + 1), txt, bg=bg, fg=fg, bold=bold, size=fs)

        r = 2
        for kind, payload in rows_data:
            if kind == "sec":
                tbl.cell(r, 0).merge(tbl.cell(r, 9))
                set_cell(tbl.cell(r, 0), payload, bg=C_GREY, bold=True, align=PP_ALIGN.LEFT, size=fs)
            elif kind == "row":
                lbl2, v = payload
                fill_row(r, lbl2, v["ob"], v["oa"], v["cb"], v["ca"], v["tb"], v["ta"], C_WHITE, indent=True)
            else:
                lbl2, ob, oa, cb, ca, tb, ta = payload
                fill_row(r, lbl2, ob, oa, cb, ca, tb, ta, C_LTBLUE, bold=True)
            r += 1
        fill_row(r, f"Total {title}", g_ob, g_oa, g_cb, g_ca, g_tb, g_ta, C_BLUE, fg=C_WHITE, bold=True)

    main_slide("Operating Expense", "ob", "oa")
    main_slide("Capital Expense", "cb", "ca")
    main_slide("Overall Foundation", "tb", "ta")
    breakup_slide("Education",
        ["Education - District Institutes", "Education- Azim Premji Schools"], "States")
    breakup_slide("Health",
        ["Urban Primary care work", "Rural Primary care work",
         "Central Initiatives", "Hospital", "Health Programs Team & Enablers"], "Areas of Work")
    breakup_slide("Livelihoods", ["Livelihoods"], "States")
    breakup_slide("University",
        ["Azim Premji University (Bangalore Campus)",
         "Azim Premji University (Bhopal Campus)",
         "Azim Premji University (Ranchi Campus)"], "Campus / Unit")
    breakup_slide("Enablers", ["Enablers"], "Functions")

    # ── Operating Expenses Breakdown (Expense Category per unit) ──────────
    def is_grants_item(name):
        n = (name or "").strip().upper().replace("  ", " ")
        return n in ("GRANTS & DONATIONS", "GRANTS AND DONATIONS", "GRANTS")

    def merge_items(dst_items, src_items):
        idx = {it["name"]: it for it in dst_items}
        for it in (src_items or []):
            if it["name"] not in idx:
                new_it = dict(name=it["name"], b=0.0, a=0.0)
                dst_items.append(new_it)
                idx[it["name"]] = new_it
            idx[it["name"]]["b"] += it.get("b", 0) or 0
            idx[it["name"]]["a"] += it.get("a", 0) or 0

    agg_cur, agg_prev = {}, {}
    for lbl in order:
        if cur_map.get(lbl, {}).get("is_sub"):
            continue
        for sh in cur_map.get(lbl, {}).get("sub_heads", []):
            if sh["name"] not in agg_cur:
                agg_cur[sh["name"]] = dict(name=sh["name"], b=0.0, a=0.0, items=[])
            agg_cur[sh["name"]]["b"] += sh["b"]; agg_cur[sh["name"]]["a"] += sh["a"]
            merge_items(agg_cur[sh["name"]]["items"], sh.get("items"))
        for sh in prev_map.get(lbl, {}).get("sub_heads", []):
            if sh["name"] not in agg_prev:
                agg_prev[sh["name"]] = dict(name=sh["name"], b=0.0, a=0.0, items=[])
            agg_prev[sh["name"]]["b"] += sh["b"]; agg_prev[sh["name"]]["a"] += sh["a"]
            merge_items(agg_prev[sh["name"]]["items"], sh.get("items"))

    tf_cb = to_cr(sum(cm.get("ob", 0) for cm in cur_map.values() if not cm.get("is_sub"))) or 0
    tf_ca = to_cr(sum(cm.get("oa", 0) for cm in cur_map.values() if not cm.get("is_sub"))) or 0
    tf_pb = to_cr(sum(pm.get("ob", 0) for pm in prev_map.values() if not pm.get("is_sub"))) or 0
    tf_pa = to_cr(sum(pm.get("oa", 0) for pm in prev_map.values() if not pm.get("is_sub"))) or 0

    cards = [("Total Foundation", list(agg_cur.values()), list(agg_prev.values()), tf_cb, tf_ca, tf_pb, tf_pa)]
    for lbl in order:
        if is_covid(lbl):
            continue
        cm = cur_map.get(lbl, {}); pm = prev_map.get(lbl, {})
        cards.append((lbl, cm.get("sub_heads", []), pm.get("sub_heads", []),
                      to_cr(cm.get("ob", 0)) or 0, to_cr(cm.get("oa", 0)) or 0,
                      to_cr(pm.get("ob", 0)) or 0, to_cr(pm.get("oa", 0)) or 0))

    def card_rows(sub_heads_cur, sub_heads_prev):
        prev_sh_map = {sh["name"]: sh for sh in (sub_heads_prev or [])}
        out = []
        for sh in (sub_heads_cur or []):
            sn = sh["name"]
            psh = prev_sh_map.get(sn, {"b": 0, "a": 0, "items": []})
            # Skip check must use the RAW sub-head totals (sh["b"]/sh["a"],
            # which already include Grants) - not dcb/dca (the Grants-
            # subtracted display values computed below), matching the
            # equivalent web-app logic in monthlyMisData.js's buildCard
            # (`if (!c.b && !c.a && !p.b && !p.a) continue`, checked
            # before its own Grants subtraction). A category like
            # "Supporting Madrasas"'s PROGRAM EXPENSES, whose own direct
            # amount is 0 but whose nested Grants item isn't, has a
            # non-zero RAW total but an all-zero dcb/dca once Grants is
            # subtracted out - checking dcb/dca here incorrectly dropped
            # the whole category (and its Grants row right after it)
            # instead of just skipping it when truly empty.
            if not any([sh.get("b", 0), sh.get("a", 0), psh.get("b", 0), psh.get("a", 0)]):
                continue
            g_cb = g_ca = g_pb = g_pa = 0.0
            if sn.upper().replace("  ", " ") == "PROGRAM EXPENSES":
                for it in sh.get("items", []):
                    if it["name"] == GRANTS_NAME:
                        g_cb, g_ca = it["b"], it["a"]
                for it in psh.get("items", []):
                    if it["name"] == GRANTS_NAME:
                        g_pb, g_pa = it["b"], it["a"]
            dcb, dca = sh["b"] - g_cb, sh["a"] - g_ca
            dpb, dpa = psh["b"] - g_pb, psh["a"] - g_pa
            out.append((sn, dcb, dca, dpb, dpa, False))
            if g_cb or g_ca or g_pb or g_pa:
                out.append(("Grants", g_cb, g_ca, g_pb, g_pa, True))
        return out

    def add_card_table(slide, left, top, width, display_lbl, sub_heads_cur, sub_heads_prev, opex_bud, opex_act, prev_opex_bud, prev_opex_act, max_height=None):
        rows = card_rows(sub_heads_cur, sub_heads_prev)
        n_rows = 1 + 2 + len(rows) + 1  # title row + 2 header rows + data + total
        row_h, fs = fit_table_geometry(n_rows, ideal_row_h=Inches(0.26), ideal_font_pt=9, min_font_pt=5,
                                        available=max_height)
        tbl_shape = slide.shapes.add_table(n_rows, 7, left, top, width, row_h * n_rows)
        tbl = tbl_shape.table
        _strip_table_style(tbl)
        for rr in tbl.rows:
            rr.height = row_h
        tbl.columns[0].width = int(width * 0.34)
        for c in range(1, 7):
            tbl.columns[c].width = int(width * 0.11)

        title_fs = max(fs, 11)
        tbl.cell(0, 0).merge(tbl.cell(0, 6))
        set_cell(tbl.cell(0, 0), display_lbl, bg=C_GREY, fg=C_BLUE, bold=True, align=PP_ALIGN.LEFT, size=title_fs)
        tbl.cell(1, 0).merge(tbl.cell(2, 0))
        set_cell(tbl.cell(1, 0), "Expense Category", bg=C_BLUE, fg=C_WHITE, bold=True, align=PP_ALIGN.LEFT, size=fs)
        tbl.cell(1, 1).merge(tbl.cell(1, 3))
        set_cell(tbl.cell(1, 1), CUR_LBL, bg=C_BLUE, fg=C_WHITE, bold=True, align=PP_ALIGN.CENTER, size=fs)
        tbl.cell(1, 4).merge(tbl.cell(1, 6))
        set_cell(tbl.cell(1, 4), PREV_LBL, bg=C_BLUE, fg=C_WHITE, bold=True, align=PP_ALIGN.CENTER, size=fs)
        for i, h in enumerate(["Budget", "Actuals", "% of Budget"] * 2):
            set_cell(tbl.cell(2, i + 1), h, bg=C_ORANGE, fg=C_WHITE, bold=True, align=PP_ALIGN.CENTER, size=fs)

        r = 3
        for sn, dcb, dca, dpb, dpa, indent in rows:
            set_cell(tbl.cell(r, 0), ("  " if indent else "") + sn, align=PP_ALIGN.LEFT, size=fs)
            set_cell(tbl.cell(r, 1), fmt(rnd(dcb)), size=fs)
            set_cell(tbl.cell(r, 2), fmt(rnd(dca)), size=fs)
            set_cell(tbl.cell(r, 3), fmt_pct(pct_val(dca, dcb)), size=fs)
            set_cell(tbl.cell(r, 4), fmt(rnd(dpb)), size=fs)
            set_cell(tbl.cell(r, 5), fmt(rnd(dpa)), size=fs)
            set_cell(tbl.cell(r, 6), fmt_pct(pct_val(dpa, dpb)), size=fs)
            r += 1
        set_cell(tbl.cell(r, 0), "Total", bg=C_LTBLUE, bold=True, align=PP_ALIGN.LEFT, size=fs)
        for i, v in enumerate([rnd(opex_bud), rnd(opex_act), pct_val(opex_act, opex_bud),
                                rnd(prev_opex_bud), rnd(prev_opex_act), pct_val(prev_opex_act, prev_opex_bud)]):
            txt = fmt_pct(v) if i in (2, 5) else fmt(v)
            set_cell(tbl.cell(r, i + 1), txt, bg=C_LTBLUE, bold=True, size=fs)

    # 4 cards per slide, 2x2 grid
    CARDS_PER_SLIDE = 4
    GRID_GAP = Inches(0.2)
    row_height = Emu(int((prs.slide_height - TABLE_TOP - TABLE_BOTTOM_MARGIN - GRID_GAP) / 2))
    positions = [
        (Inches(0.3), TABLE_TOP),
        (Inches(6.8), TABLE_TOP),
        (Inches(0.3), Emu(TABLE_TOP + row_height + GRID_GAP)),
        (Inches(6.8), Emu(TABLE_TOP + row_height + GRID_GAP)),
    ]
    total_slides = -(-len(cards) // CARDS_PER_SLIDE)
    for s_idx in range(total_slides):
        slide = add_slide()
        sub = f"Budget vs. Actuals – {YTD_LBL}"
        add_header(slide, f"Operating Expenses Breakdown – {s_idx+1}/{total_slides}", sub)
        batch = cards[s_idx * CARDS_PER_SLIDE:(s_idx + 1) * CARDS_PER_SLIDE]
        for (left, top), card in zip(positions, batch):
            add_card_table(slide, left, top, Inches(6.2), *card, max_height=row_height)

    buf = io.BytesIO()
    prs.save(buf)
    buf.seek(0)
    return buf.read()


def _build_slide_pdf_html(financial_year, month, unit_lbl, order, cur_map, prev_map,
                           get_breakup_entries, exAct, to_cr, rnd, pct_val, GRANTS_NAME):
    """Build the Monthly MIS as a PDF with the same slide-by-slide visual
    design as the PowerPoint export (one slide = one landscape page, logo,
    title slide, blue/orange tables) -- a from-scratch HTML/wkhtmltopdf
    rendering rather than a literal .pptx-to-PDF conversion (no office
    engine is installed on this server), built from the same data so the
    two formats stay in lockstep."""
    import os
    import base64

    LOGO_PATH = frappe.get_app_path("budget_mis", "public", "images", "apf_logo.png")
    logo_data_uri = None
    if os.path.isfile(LOGO_PATH):
        with open(LOGO_PATH, "rb") as f:
            logo_data_uri = "data:image/png;base64," + base64.b64encode(f.read()).decode()

    def prev_fy(fy):
        p = fy.split("-")
        return f"{int(p[0])-1}-{str(int(p[1])-1).zfill(2)}"

    PREV_FY  = prev_fy(financial_year)
    CUR_LBL  = f"Current Year YTD {financial_year}"
    PREV_LBL = f"Last Year YTD {PREV_FY}"
    YTD_LBL  = f"YTD {month}-{financial_year.split('-')[0]}"

    def is_covid(lbl):
        return "COVID" in (lbl or "").upper()

    def fmt(v):
        if v is None:
            return "-"
        return f"{v:,.0f}" if float(v).is_integer() else f"{v:,.1f}"

    def fmt_pct(v):
        return "-" if v is None else f"{v:.1f}%"

    def pair_cell(v):
        return "-" if v is None else fmt(v)

    # Slide canvas: 1280x720px (16:9, matches the 13.333x7.5in PPTX) --
    # wkhtmltopdf page is set to the same aspect ratio in the caller.
    SLIDE_W, SLIDE_H = 1280, 720
    SLIDE_PAD_V = 24  # .slide { padding: 24px 28px } -- top+bottom, must be
    SLIDE_PAD_H = 28  # subtracted from SLIDE_H/SLIDE_W or the table's real
                       # available space is overestimated and it silently
                       # overflows past the slide's clipped edge (this is what
                       # let "Total University" get cut off even though the
                       # row-count math looked like it fit).
    HEADER_H = 110  # title + subtitle + accent bar reserved height
    BOTTOM_PAD = 36  # extra safety margin -- the row-height model is an
                      # approximation of wkhtmltopdf's real text layout, so a
                      # bigger cushion here is cheaper than a clipped table

    # Actual per-row height = font-size * line-height(1.1) + vertical padding
    # (1px top + 1px bottom, per the td/th CSS) + top+bottom border (1px each).
    # Deriving row height FROM font size (instead of guessing both independently)
    # keeps the two numbers from drifting out of sync, which is what let rows
    # silently render taller than planned and overflow past the slide edge.
    # ROW_FUDGE calibrated empirically against wkhtmltopdf's real output: a
    # 12-row table measured ~10% taller than this formula predicted before
    # the fudge factor was added (253.5px actual vs. 230.4px modelled).
    ROW_OVERHEAD_PX = 6
    ROW_FUDGE = 1.1

    def row_px_for_font(font_px):
        return (font_px * 1.1 + ROW_OVERHEAD_PX) * ROW_FUDGE

    def est_lines(text, font_px, col_width_px):
        """Estimate how many lines `text` wraps to at font_px in a column
        col_width_px wide, using an average-glyph-width approximation (Arial
        digits/letters average ~0.55em). Used to budget extra row height for
        the single longest label, instead of assuming every row is one line
        (which is what let wrapped rows overflow the slide before)."""
        if not text:
            return 1
        avg_char_px = font_px * 0.55
        usable = max(col_width_px - 8, avg_char_px)  # minus ~padding
        chars_per_line = max(1, int(usable / avg_char_px))
        import math
        return max(1, math.ceil(len(text) / chars_per_line))

    def fit_font(n_rows, ideal_font_px=15, min_font_px=7, extra_top=0,
                 longest_label="", label_col_frac=0.3, total_width_px=None):
        """Shrink font/row-height until n_rows fit in the available space,
        budgeting extra height for however many lines the single longest
        label actually needs to wrap to at the chosen font size (rows can
        no longer clip overflowing text -- wkhtmltopdf doesn't reliably
        honour overflow:hidden on table cells -- so wrapping must be
        accounted for up front rather than discovered after the fact)."""
        available = SLIDE_H - (SLIDE_PAD_V * 2) - HEADER_H - BOTTOM_PAD - extra_top
        total_width_px = total_width_px or (SLIDE_W - (SLIDE_PAD_H * 2))
        label_col_px = total_width_px * label_col_frac
        font_px = ideal_font_px
        while font_px > min_font_px:
            lines = est_lines(longest_label, font_px, label_col_px)
            row_px = row_px_for_font(font_px) * max(1, lines)
            if row_px * n_rows <= available:
                break
            font_px -= 1
        font_px = max(min_font_px, font_px)
        lines = est_lines(longest_label, font_px, label_col_px)
        row_px = row_px_for_font(font_px) * max(1, lines)
        return row_px, font_px

    logo_html = (f'<img class="logo" src="{logo_data_uri}">' if logo_data_uri else "")

    parts = [f"""
    <html><head><meta charset="utf-8"><style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: Arial, sans-serif; }}
        .slide {{ width: {SLIDE_W}px; height: {SLIDE_H}px; position: relative;
                  page-break-after: always; overflow: hidden; padding: 24px 28px; }}
        .slide:last-child {{ page-break-after: avoid; }}
        .logo {{ position: absolute; top: 14px; right: 24px; height: 70px; }}
        .accent {{ height: 4px; background: #F26B21; margin: 8px 0 14px 0; }}
        h1.slide-title {{ font-size: 26px; color: #000; font-weight: bold; }}
        .slide-sub {{ font-size: 14px; font-style: italic; color: #000; margin-top: 4px; }}
        table {{ border-collapse: collapse; width: 100%; table-layout: fixed; }}
        /* Text wraps instead of being clipped -- wkhtmltopdf does not
           reliably honour overflow:hidden on table cells, and relying on it
           let long labels/numbers visually bleed into the next cell. */
        th, td {{ border: 1px solid #000; padding: 1px 4px; text-align: right;
                  overflow-wrap: break-word; word-break: break-word;
                  white-space: normal; line-height: 1.1; vertical-align: middle; }}
        th {{ background: #1565C0; color: #fff; text-align: center; }}
        tr.hdr2 th {{ background: #F26B21; }}
        td.lbl {{ text-align: left; }}
        tr.sub td.lbl {{ padding-left: 16px; background: #F8F9FA; }}
        tr.total td {{ background: #E3F2FD; font-weight: bold; }}
        tr.covid td {{ font-style: italic; }}
        tr.grand td {{ background: #1565C0; color: #fff; font-weight: bold; }}
        .sec-hdr td {{ background: #F0F4FF; font-weight: bold; text-align: left; }}
        .title-slide {{ display: flex; flex-direction: column; align-items: center;
                        justify-content: center; height: 100%; }}
        .title-slide .big {{ font-size: 40px; font-weight: bold; text-align: center; }}
    </style></head><body>
    """]

    # ── Title slide ──────────────────────────────────────────────────────
    parts.append(f"""
    <div class="slide">
        {logo_html}
        <div class="title-slide">
            <div class="big">MIS &ndash; Azim Premji Foundation</div>
            <div class="big">{YTD_LBL}</div>
        </div>
    </div>
    """)

    def slide_header(title, subtitle):
        return f"""
        {logo_html}
        <h1 class="slide-title">{title}</h1>
        <div class="slide-sub">{subtitle}</div>
        <div class="accent"></div>
        """

    def main_slide(title, bk, ak):
        rows_data = []
        tCB = tCA = tPB = tPA = 0.0
        cv_cb = cv_ca = cv_pb = cv_pa = None
        for lbl in order:
            cm = cur_map.get(lbl, {}); pm = prev_map.get(lbl, {})
            is_sub = cm.get("is_sub", 0) or pm.get("is_sub", 0)
            # Same hide_number handling as write_main_section/_build_pptx's
            # own main_slide - blank this row's own cells and exclude it
            # from Total/Grand Total, matching ExpenseTable.vue exactly.
            hide_number = cm.get("hide_number", 0) or pm.get("hide_number", 0)
            cb = to_cr(cm.get(bk, 0)); ca = to_cr(cm.get(ak, 0))
            pb = to_cr(pm.get(bk, 0)); pa = to_cr(pm.get(ak, 0))
            if is_covid(lbl):
                cv_cb, cv_ca, cv_pb, cv_pa = cb or 0, ca or 0, pb or 0, pa or 0
                continue
            if hide_number:
                rows_data.append((lbl, is_sub, None, None, None, None))
                continue
            if not is_sub:
                tCB += flt(cb); tCA += flt(ca); tPB += flt(pb); tPA += flt(pa)
            rows_data.append((lbl, is_sub, cb, ca, pb, pa))
        cv_cb = cv_cb or 0; cv_ca = cv_ca or 0; cv_pb = cv_pb or 0; cv_pa = cv_pa or 0
        gCB, gCA, gPB, gPA = tCB + cv_cb, tCA + cv_ca, tPB + cv_pb, tPA + cv_pa

        n_rows = 2 + len(rows_data) + 3
        longest_label = max((lbl for lbl, *_ in rows_data), key=len, default="")
        row_h, fs = fit_font(n_rows, longest_label=longest_label, label_col_frac=0.34)
        rows_html = []
        for lbl, is_sub, cb, ca, pb, pa in rows_data:
            cls = "sub" if is_sub else ""
            rows_html.append(f"""<tr class="{cls}" style="height:{row_h}px;">
                <td class="lbl">{'&nbsp;&nbsp;' if is_sub else ''}{lbl}</td>
                <td>{pair_cell(cb)}</td><td>{pair_cell(ca)}</td><td>{fmt_pct(pct_val(ca,cb))}</td>
                <td>{pair_cell(pb)}</td><td>{pair_cell(pa)}</td><td>{fmt_pct(pct_val(pa,pb))}</td>
                </tr>""")
        return f"""
        <div class="slide" style="font-size:{fs}px;">
        {slide_header(title.upper(), f"Budget vs. Actuals &ndash; {YTD_LBL}")}
        <table>
        <colgroup><col style="width:34%;">{'<col style="width:11%;">' * 6}</colgroup>
        <thead>
        <tr style="height:{row_h}px;"><th rowspan="2">Unit</th><th colspan="3">{CUR_LBL}</th><th colspan="3">{PREV_LBL}</th></tr>
        <tr class="hdr2" style="height:{row_h}px;"><th>Budget</th><th>Actuals</th><th>% of Budget</th>
            <th>Budget</th><th>Actuals</th><th>% of Budget</th></tr>
        </thead>
        <tbody>
        {''.join(rows_html)}
        <tr class="total" style="height:{row_h}px;"><td class="lbl">Total</td>
            <td>{fmt(rnd(tCB))}</td><td>{fmt(rnd(tCA))}</td><td>{fmt_pct(pct_val(tCA,tCB))}</td>
            <td>{fmt(rnd(tPB))}</td><td>{fmt(rnd(tPA))}</td><td>{fmt_pct(pct_val(tPA,tPB))}</td></tr>
        <tr class="covid" style="height:{row_h}px;"><td class="lbl">Covid-19</td>
            <td>{fmt(rnd(cv_cb))}</td><td>{fmt(rnd(cv_ca))}</td><td>{fmt_pct(pct_val(cv_ca,cv_cb))}</td>
            <td>{fmt(rnd(cv_pb))}</td><td>{fmt(rnd(cv_pa))}</td><td>{fmt_pct(pct_val(cv_pa,cv_pb))}</td></tr>
        <tr class="grand" style="height:{row_h}px;"><td class="lbl">Grand Total</td>
            <td>{fmt(rnd(gCB))}</td><td>{fmt(rnd(gCA))}</td><td>{fmt_pct(pct_val(gCA,gCB))}</td>
            <td>{fmt(rnd(gPB))}</td><td>{fmt(rnd(gPA))}</td><td>{fmt_pct(pct_val(gPA,gPB))}</td></tr>
        </tbody>
        </table>
        </div>
        """

    MAX_ROWS_PER_SLIDE = 20  # empirically wkhtmltopdf's real row heights run
    # noticeably taller than the row_px_for_font/est_lines model predicts
    # (wrapped section labels, border/line-height rounding), so a table that
    # the font-fitting math says "fits" can still overflow and silently lose
    # its bottom rows (this is what dropped the Ranchi campus + grand total
    # from the University slide). Capping rows per slide and splitting into
    # continuation slides is more robust than trying to model wkhtmltopdf's
    # exact layout.

    def breakup_slide(title, keys, col_label):
        # Build one (kind, payload) list per key/section, so sections can be
        # grouped onto slides without ever splitting a section across two.
        sections = []
        g_ob = g_oa = g_cb = g_ca = 0.0
        # Same singleQualifyingSectionLabel suppression as BreakupTable.vue
        # / write_breakup_section / the PPTX breakup_slide above: a key's
        # own "Total" row only shows when it has >1 row, AND when it's not
        # the sole key in this whole section with >1 row - in that case its
        # subtotal would be numerically identical to the final
        # "Total {title}" grand-total row, since nothing else contributes
        # more than a single row to sum.
        qualifying_keys = [k for k in keys if len([
            e for e in get_breakup_entries(k) if (e.get("label") or "").strip()
        ]) > 1]
        single_qualifying_key = qualifying_keys[0] if len(qualifying_keys) == 1 else None
        for key in keys:
            entries = get_breakup_entries(key)
            sec_rows = [("sec", key)]
            s_ob = s_oa = s_cb = s_ca = 0.0
            n_key_rows = 0
            for e in entries:
                lbl2 = (e.get("label") or "").strip()
                if not lbl2:
                    continue
                v = exAct(e.get("actuals", []))
                sec_rows.append(("row", (lbl2, v)))
                s_ob += v["ob"]; s_oa += v["oa"]; s_cb += v["cb"]; s_ca += v["ca"]
                n_key_rows += 1
            s_tb, s_ta = s_ob + s_cb, s_oa + s_ca
            if n_key_rows > 1 and key != single_qualifying_key:
                sec_rows.append(("tot", ("Total", s_ob, s_oa, s_cb, s_ca, s_tb, s_ta)))
            g_ob += s_ob; g_oa += s_oa; g_cb += s_cb; g_ca += s_ca
            sections.append(sec_rows)
        g_tb, g_ta = g_ob + g_cb, g_oa + g_ca
        grand_row = ("tot", (f"Total {title}", g_ob, g_oa, g_cb, g_ca, g_tb, g_ta))

        # Group sections into slide batches, respecting MAX_ROWS_PER_SLIDE.
        # The grand total only ever lands on the last batch.
        batches = []
        cur_batch, cur_count = [], 0
        for sec_rows in sections:
            if cur_batch and cur_count + len(sec_rows) > MAX_ROWS_PER_SLIDE:
                batches.append(cur_batch)
                cur_batch, cur_count = [], 0
            cur_batch.extend(sec_rows)
            cur_count += len(sec_rows)
        if cur_batch:
            batches.append(cur_batch)
        if not batches:
            batches = [[]]
        batches[-1] = batches[-1] + [("grand", grand_row[1])]

        def fmt_row(lbl, ob, oa, cb, ca, tb, ta, cls, indent=False):
            vals = [rnd(ob), rnd(oa), pct_val(oa, ob), rnd(cb), rnd(ca), pct_val(ca, cb), rnd(tb), rnd(ta), pct_val(ta, tb)]
            cells = "".join(
                f"<td>{fmt_pct(v) if i in (2,5,8) else fmt(v)}</td>" for i, v in enumerate(vals)
            )
            return f"""<tr class="{cls}" style="height:{row_h}px;">
                <td class="lbl">{'&nbsp;&nbsp;' if indent else ''}{lbl}</td>{cells}</tr>"""

        multi = len(batches) > 1
        slides_html = []
        for b_idx, rows_meta in enumerate(batches):
            n_rows = 2 + len(rows_meta)
            row_labels = [payload[0] for kind, payload in rows_meta if kind in ("row", "tot", "grand")]
            longest_label = max(row_labels, key=len, default="")
            row_h, fs = fit_font(n_rows, ideal_font_px=13, min_font_px=6,
                                  longest_label=longest_label, label_col_frac=0.26)

            body = []
            for kind, payload in rows_meta:
                if kind == "sec":
                    body.append(f'<tr class="sec-hdr" style="height:{row_h}px;"><td colspan="10">{payload}</td></tr>')
                elif kind == "row":
                    lbl2, v = payload
                    body.append(fmt_row(lbl2, v["ob"], v["oa"], v["cb"], v["ca"], v["tb"], v["ta"], "", indent=True))
                else:
                    lbl2, ob, oa, cb, ca, tb, ta = payload
                    cls = "grand" if kind == "grand" else "total"
                    body.append(fmt_row(lbl2, ob, oa, cb, ca, tb, ta, cls))

            slide_title = title.upper() + (f" ({b_idx + 1}/{len(batches)})" if multi else "")
            slides_html.append(f"""
            <div class="slide" style="font-size:{fs}px;">
            {slide_header(slide_title, f"Budget vs. Actuals &ndash; {YTD_LBL}")}
            <table>
            <colgroup><col style="width:26%;">{'<col style="width:8.22%;">' * 9}</colgroup>
            <thead>
            <tr style="height:{row_h}px;"><th rowspan="2">{col_label}</th><th colspan="3">Operating Expense</th>
                <th colspan="3">Capital Expense</th><th colspan="3">Total Expense</th></tr>
            <tr class="hdr2" style="height:{row_h}px;">
                <th>Budget</th><th>Actuals</th><th>% of Budget</th>
                <th>Budget</th><th>Actuals</th><th>% of Budget</th>
                <th>Budget</th><th>Actuals</th><th>% of Budget</th></tr>
            </thead>
            <tbody>
            {''.join(body)}
            </tbody>
            </table>
            </div>
            """)
        return slides_html

    parts.append(main_slide("Operating Expense", "ob", "oa"))
    parts.append(main_slide("Capital Expense", "cb", "ca"))
    parts.append(main_slide("Overall Foundation", "tb", "ta"))
    parts.extend(breakup_slide("Education",
        ["Education - District Institutes", "Education- Azim Premji Schools"], "States"))
    parts.extend(breakup_slide("Health",
        ["Urban Primary care work", "Rural Primary care work",
         "Central Initiatives", "Hospital", "Health Programs Team & Enablers"], "Areas of Work"))
    parts.extend(breakup_slide("Livelihoods", ["Livelihoods"], "States"))
    parts.extend(breakup_slide("University",
        ["Azim Premji University (Bangalore Campus)",
         "Azim Premji University (Bhopal Campus)",
         "Azim Premji University (Ranchi Campus)"], "Campus / Unit"))
    parts.extend(breakup_slide("Enablers", ["Enablers"], "Functions"))

    # ── Operating Expenses Breakdown (Expense Category per unit) ──────────
    def merge_items(dst_items, src_items):
        idx = {it["name"]: it for it in dst_items}
        for it in (src_items or []):
            if it["name"] not in idx:
                new_it = dict(name=it["name"], b=0.0, a=0.0)
                dst_items.append(new_it)
                idx[it["name"]] = new_it
            idx[it["name"]]["b"] += it.get("b", 0) or 0
            idx[it["name"]]["a"] += it.get("a", 0) or 0

    agg_cur, agg_prev = {}, {}
    for lbl in order:
        if cur_map.get(lbl, {}).get("is_sub"):
            continue
        for sh in cur_map.get(lbl, {}).get("sub_heads", []):
            if sh["name"] not in agg_cur:
                agg_cur[sh["name"]] = dict(name=sh["name"], b=0.0, a=0.0, items=[])
            agg_cur[sh["name"]]["b"] += sh["b"]; agg_cur[sh["name"]]["a"] += sh["a"]
            merge_items(agg_cur[sh["name"]]["items"], sh.get("items"))
        for sh in prev_map.get(lbl, {}).get("sub_heads", []):
            if sh["name"] not in agg_prev:
                agg_prev[sh["name"]] = dict(name=sh["name"], b=0.0, a=0.0, items=[])
            agg_prev[sh["name"]]["b"] += sh["b"]; agg_prev[sh["name"]]["a"] += sh["a"]
            merge_items(agg_prev[sh["name"]]["items"], sh.get("items"))

    tf_cb = to_cr(sum(cm.get("ob", 0) for cm in cur_map.values() if not cm.get("is_sub"))) or 0
    tf_ca = to_cr(sum(cm.get("oa", 0) for cm in cur_map.values() if not cm.get("is_sub"))) or 0
    tf_pb = to_cr(sum(pm.get("ob", 0) for pm in prev_map.values() if not pm.get("is_sub"))) or 0
    tf_pa = to_cr(sum(pm.get("oa", 0) for pm in prev_map.values() if not pm.get("is_sub"))) or 0

    cards = [("Total Foundation", list(agg_cur.values()), list(agg_prev.values()), tf_cb, tf_ca, tf_pb, tf_pa)]
    for lbl in order:
        if is_covid(lbl):
            continue
        cm = cur_map.get(lbl, {}); pm = prev_map.get(lbl, {})
        cards.append((lbl, cm.get("sub_heads", []), pm.get("sub_heads", []),
                      to_cr(cm.get("ob", 0)) or 0, to_cr(cm.get("oa", 0)) or 0,
                      to_cr(pm.get("ob", 0)) or 0, to_cr(pm.get("oa", 0)) or 0))

    def card_rows(sub_heads_cur, sub_heads_prev):
        prev_sh_map = {sh["name"]: sh for sh in (sub_heads_prev or [])}
        out = []
        for sh in (sub_heads_cur or []):
            sn = sh["name"]
            psh = prev_sh_map.get(sn, {"b": 0, "a": 0, "items": []})
            # Skip check must use the RAW sub-head totals (sh["b"]/sh["a"],
            # which already include Grants) - not dcb/dca (the Grants-
            # subtracted display values computed below), matching the
            # equivalent web-app logic in monthlyMisData.js's buildCard
            # (`if (!c.b && !c.a && !p.b && !p.a) continue`, checked
            # before its own Grants subtraction). A category like
            # "Supporting Madrasas"'s PROGRAM EXPENSES, whose own direct
            # amount is 0 but whose nested Grants item isn't, has a
            # non-zero RAW total but an all-zero dcb/dca once Grants is
            # subtracted out - checking dcb/dca here incorrectly dropped
            # the whole category (and its Grants row right after it)
            # instead of just skipping it when truly empty.
            if not any([sh.get("b", 0), sh.get("a", 0), psh.get("b", 0), psh.get("a", 0)]):
                continue
            g_cb = g_ca = g_pb = g_pa = 0.0
            if sn.upper().replace("  ", " ") == "PROGRAM EXPENSES":
                for it in sh.get("items", []):
                    if it["name"] == GRANTS_NAME:
                        g_cb, g_ca = it["b"], it["a"]
                for it in psh.get("items", []):
                    if it["name"] == GRANTS_NAME:
                        g_pb, g_pa = it["b"], it["a"]
            dcb, dca = sh["b"] - g_cb, sh["a"] - g_ca
            dpb, dpa = psh["b"] - g_pb, psh["a"] - g_pa
            out.append((sn, dcb, dca, dpb, dpa, False))
            if g_cb or g_ca or g_pb or g_pa:
                out.append(("Grants", g_cb, g_ca, g_pb, g_pa, True))
        return out

    def card_html(display_lbl, sub_heads_cur, sub_heads_prev, opex_bud, opex_act, prev_opex_bud, prev_opex_act, fs, row_h):
        rows = card_rows(sub_heads_cur, sub_heads_prev)
        rows_html = []
        for sn, dcb, dca, dpb, dpa, indent in rows:
            rows_html.append(f"""<tr style="height:{row_h}px;">
                <td class="lbl">{'&nbsp;&nbsp;' if indent else ''}{sn}</td>
                <td>{fmt(rnd(dcb))}</td><td>{fmt(rnd(dca))}</td><td>{fmt_pct(pct_val(dca,dcb))}</td>
                <td>{fmt(rnd(dpb))}</td><td>{fmt(rnd(dpa))}</td><td>{fmt_pct(pct_val(dpa,dpb))}</td></tr>""")
        return f"""
        <table style="font-size:{fs}px;">
        <colgroup><col style="width:40%;">{'<col style="width:10%;">' * 6}</colgroup>
        <thead>
        <tr style="height:{row_h+4}px;"><th colspan="7" style="background:#F0F4FF;color:#1565C0;text-align:left;">{display_lbl}</th></tr>
        <tr style="height:{row_h}px;"><th rowspan="2">Expense Category</th><th colspan="3">{CUR_LBL}</th><th colspan="3">{PREV_LBL}</th></tr>
        <tr class="hdr2" style="height:{row_h}px;"><th>Budget</th><th>Actuals</th><th>% of Budget</th>
            <th>Budget</th><th>Actuals</th><th>% of Budget</th></tr>
        </thead>
        <tbody>
        {''.join(rows_html)}
        <tr class="total" style="height:{row_h}px;"><td class="lbl">Total</td>
            <td>{fmt(rnd(opex_bud))}</td><td>{fmt(rnd(opex_act))}</td><td>{fmt_pct(pct_val(opex_act,opex_bud))}</td>
            <td>{fmt(rnd(prev_opex_bud))}</td><td>{fmt(rnd(prev_opex_act))}</td><td>{fmt_pct(pct_val(prev_opex_act,prev_opex_bud))}</td></tr>
        </tbody>
        </table>
        """

    # 4 cards per slide, 2x2 grid
    CARDS_PER_SLIDE = 4
    GRID_GAP_PX = 10
    total_slides = -(-len(cards) // CARDS_PER_SLIDE)
    for s_idx in range(total_slides):
        batch = cards[s_idx * CARDS_PER_SLIDE:(s_idx + 1) * CARDS_PER_SLIDE]
        # Each grid cell hosts up to 2 STACKED cards (top row, bottom row) side
        # by side with another column, so the real constraint is that each
        # row's tallest table must fit in half the available height (minus the
        # gap between rows) -- not that the two rows' heights merely sum to
        # less than the full slide (that undercounts and let the bottom-row
        # table's last row get clipped).
        row1, row2 = batch[:2], batch[2:]
        # +1 padding row per stacked table: wkhtmltopdf's real row heights run
        # taller than the row_px_for_font model predicts (same underestimate
        # that clipped the University/Health breakup slides), and here that
        # error applies independently to EACH stacked table rather than once
        # across the whole slide, so it needs its own safety margin.
        max_rows_r1 = max((1 + 2 + len(card_rows(c[1], c[2])) + 1 for c in row1), default=0) + 1
        max_rows_r2 = (max((1 + 2 + len(card_rows(c[1], c[2])) + 1 for c in row2), default=0) + 1) if row2 else 0
        n_rows = max(max_rows_r1, max_rows_r2) * (2 if row2 else 1)
        longest_label = max(
            (sn for c in batch for sn, *_ in card_rows(c[1], c[2])), key=len, default=""
        )
        extra_top = GRID_GAP_PX if row2 else 0
        row_h, fs = fit_font(n_rows, ideal_font_px=12, min_font_px=6, extra_top=extra_top,
                              longest_label=longest_label, label_col_frac=0.40,
                              total_width_px=(SLIDE_W - (SLIDE_PAD_H * 2)) * 0.48)
        cells_html = "".join(
            f'<div style="width:48%; margin-bottom:{GRID_GAP_PX}px;">{card_html(*c, fs=fs, row_h=row_h)}</div>'
            for c in batch
        )
        parts.append(f"""
        <div class="slide">
        {slide_header(f"Operating Expenses Breakdown &ndash; {s_idx+1}/{total_slides}", f"Budget vs. Actuals &ndash; {YTD_LBL}")}
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; gap:0 2%;">
        {cells_html}
        </div>
        </div>
        """)

    parts.append("</body></html>")
    return "\n".join(parts)