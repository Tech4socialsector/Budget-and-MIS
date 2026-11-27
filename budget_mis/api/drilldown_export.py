"""Excel / PDF export for the drill-down modals.

Every drill-down (BudgetDrilldownModal, TrialBalanceDrilldownModal,
AdjustmentDrilldownModal) sends the view it is currently showing - header,
summary figures, table columns, rows and TOTAL footer - and this module
renders that same view as a styled .xlsx sheet or PDF page. It only formats
data the caller already has on screen (fetched through each modal's own
permission-scoped endpoint), so it does no data lookup or scoping itself.

Payload shape (all keys optional except columns/rows):
    {
      "filename": "Drilldown_Education",
      "eyebrow": "Drill Down",
      "title": "Education",
      "subtitle": "YTD October 2026-27",
      "breadcrumb": ["Education", "Karnataka"],
      "summary": [{"label": "Total", "value": 123.0, "kind": "amount"},
                  {"label": "Sub Heads", "value": 4}],
      "section": "Sub Heads",
      "amount_mode": "full" | "cr",
      "columns": [{"label": "Sub Heads", "kind": "text" | "amount" | "percent",
                   "align": "left" | "right", "bar": true (share bar, PDF)}],
      "rows": [{"cells": [<value or {"main": ..., "sub": ...}>, ...],
                "color": "#2a78d6"}],
      "footer": [<value>, ...]
    }
"""

import base64
import html
import io
import os
import re

import frappe
from frappe.utils import now_datetime

MAX_ROWS = 20000

# Same colours as the on-screen drill-down tables
HEADER_BG = "F9FAFB"      # gray-50
HEADER_FG = "6B7280"      # gray-500
BORDER = "E5E7EB"         # gray-200
STRIPE_BG = "FAFBFC"      # even rows, gray-50/60
GRAND_BG = "1E5FA8"       # .fc-row-grand
TITLE_FG = "111827"       # gray-900
MUTED_FG = "6B7280"


@frappe.whitelist()
def export_drilldown(payload, export_format="excel"):
    payload = frappe.parse_json(payload) if isinstance(payload, str) else (payload or {})
    payload = frappe._dict(payload)
    columns = payload.get("columns") or []
    rows = payload.get("rows") or []
    if not columns:
        frappe.throw("Nothing to export")
    if len(rows) > MAX_ROWS:
        frappe.throw(f"Too many rows to export (max {MAX_ROWS})")

    base = _safe_filename(payload.get("filename") or payload.get("title") or "Drilldown")
    fmt = str(export_format or "excel").lower()
    if fmt == "pdf":
        content = _build_pdf(payload)
        filename, mimetype = base + ".pdf", "application/pdf"
    else:
        content = _build_xlsx(payload)
        filename = base + ".xlsx"
        mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    return {
        "filename": filename,
        "mimetype": mimetype,
        "data": base64.b64encode(content).decode("utf-8"),
    }


# ---------------------------------------------------------------------------
# Value helpers
# ---------------------------------------------------------------------------

def _safe_filename(name):
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", str(name)).strip("_")
    return (name or "Drilldown")[:120]


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _indian_group(n):
    """1234567 -> '12,34,567' (en-IN grouping, same as the on-screen Intl format)."""
    s = str(int(round(abs(n))))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:])
            head = head[:-2]
        if head:
            parts.insert(0, head)
        s = ",".join(parts) + "," + tail
    return ("-" if n < 0 and round(abs(n)) else "") + s


def _format_amount(v, mode):
    """Mirrors formatINR / formatCr in frontend/src/data/budgetTotals.js."""
    n = _num(v)
    if n is None:
        return "-" if v in (None, "") else str(v)
    if mode == "cr":
        return "₹" + _indian_group(n / 1e7) + " Cr"
    return "₹" + _indian_group(n)


def _format_cell(value, kind, mode):
    if isinstance(value, dict):
        return _format_cell(value.get("main"), kind, mode)
    if kind == "amount":
        return _format_amount(value, mode)
    if kind == "percent":
        n = _num(value)
        return "" if n is None else f"{n:g}%"
    return "" if value is None else str(value)


def _cell_sub(value):
    return value.get("sub") if isinstance(value, dict) else None


def _summary_text(item, mode):
    if item.get("kind") == "amount":
        return _format_amount(item.get("value"), mode)
    if item.get("kind") == "percent":
        n = _num(item.get("value"))
        return "" if n is None else f"{n:g}%"
    return "" if item.get("value") is None else str(item.get("value"))


def _generated_at():
    return now_datetime().strftime("%d %b %Y, %I:%M %p")


# ---------------------------------------------------------------------------
# Excel
# ---------------------------------------------------------------------------

def _build_xlsx(p):
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.utils import get_column_letter

    mode = p.get("amount_mode") or "full"
    columns = p.get("columns") or []
    ncols = len(columns)
    # Amounts are written as real numbers; Cr mode stores the value in crores
    # with the same "₹… Cr" display the screen uses.
    amount_fmt = '"₹"#,##0" Cr";-"₹"#,##0" Cr"' if mode == "cr" else '"₹"#,##0;-"₹"#,##0'

    wb = Workbook()
    ws = wb.active
    ws.title = "Drill Down"
    ws.sheet_view.showGridLines = False

    thin = Side(style="thin", color=BORDER)
    grand_side = Side(style="thin", color="1A5493")
    box = Border(left=thin, right=thin, top=thin, bottom=thin)
    span = max(ncols, 2)

    def merged(row, text, font, height=None):
        ws.cell(row=row, column=1, value=text).font = font
        ws.cell(row=row, column=1).alignment = Alignment(vertical="center")
        if span > 1:
            ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=span)
        if height:
            ws.row_dimensions[row].height = height

    r = 1
    if p.get("eyebrow"):
        merged(r, str(p.eyebrow).upper(), Font(size=9, bold=True, color=TITLE_FG))
        r += 1
    merged(r, p.get("title") or "", Font(size=15, bold=True, color=TITLE_FG), 22)
    r += 1
    if p.get("subtitle"):
        merged(r, p.subtitle, Font(size=10, color=MUTED_FG))
        r += 1
    if p.get("breadcrumb") and len(p.breadcrumb) > 1:
        merged(r, "  ›  ".join(str(b) for b in p.breadcrumb), Font(size=10, color="1E5FA8"))
        r += 1
    r += 1

    # Summary card: label / value pairs side by side, in a gray box
    summary = p.get("summary") or []
    if summary:
        fill = PatternFill("solid", fgColor=HEADER_BG)
        for i, item in enumerate(summary):
            c = 1 + i * 2
            lab = ws.cell(row=r, column=c, value=str(item.get("label") or "").upper())
            lab.font = Font(size=8, bold=True, color=TITLE_FG)
            val_raw = item.get("value")
            if item.get("kind") == "amount" and _num(val_raw) is not None:
                v = _num(val_raw) / 1e7 if mode == "cr" else _num(val_raw)
                val = ws.cell(row=r + 1, column=c, value=v)
                val.number_format = amount_fmt
            else:
                val = ws.cell(row=r + 1, column=c, value=_summary_text(item, mode))
            val.font = Font(size=14, bold=True, color=TITLE_FG)
            val.alignment = Alignment(horizontal="left")
        last_col = max(span, len(summary) * 2)
        for rr in (r, r + 1):
            for cc in range(1, last_col + 1):
                ws.cell(row=rr, column=cc).fill = fill
        ws.row_dimensions[r + 1].height = 22
        r += 3

    if p.get("section"):
        ws.cell(row=r, column=1, value=str(p.section).upper()).font = Font(size=9, bold=True, color=TITLE_FG)
        r += 1

    # Table header
    header_row = r
    header_fill = PatternFill("solid", fgColor=HEADER_BG)
    for ci, col in enumerate(columns, start=1):
        cell = ws.cell(row=r, column=ci, value=col.get("label") or "")
        cell.font = Font(bold=True, color=HEADER_FG)
        cell.fill = header_fill
        cell.border = box
        cell.alignment = Alignment(horizontal="right" if col.get("align") == "right" else "left", vertical="center")
    ws.row_dimensions[r].height = 20
    r += 1

    widths = [len(str(c.get("label") or "")) for c in columns]
    stripe = PatternFill("solid", fgColor=STRIPE_BG)

    def write_value(row_idx, ci, col, value):
        kind = col.get("kind") or "text"
        sub = _cell_sub(value)
        raw = value.get("main") if isinstance(value, dict) else value
        if kind == "amount" and _num(raw) is not None:
            v = _num(raw) / 1e7 if mode == "cr" else _num(raw)
            cell = ws.cell(row=row_idx, column=ci, value=v)
            cell.number_format = amount_fmt
            text_len = len(_format_amount(raw, mode))
        elif kind == "percent" and _num(raw) is not None:
            cell = ws.cell(row=row_idx, column=ci, value=_num(raw) / 100)
            cell.number_format = "0.0%"
            text_len = 6
        else:
            text = "" if raw is None else str(raw)
            if kind == "amount" and text == "":
                text = "-"
            if sub:
                text = f"{text}\n{sub}"
            cell = ws.cell(row=row_idx, column=ci, value=text)
            text_len = max((len(t) for t in text.split("\n")), default=0)
        align = "right" if col.get("align") == "right" else "left"
        cell.alignment = Alignment(horizontal=align, vertical="top", wrap_text=bool(sub))
        widths[ci - 1] = max(widths[ci - 1], text_len)
        return cell

    for i, row in enumerate(p.get("rows") or []):
        cells = row.get("cells") if isinstance(row, dict) else row
        has_sub = False
        for ci, col in enumerate(columns, start=1):
            value = cells[ci - 1] if ci - 1 < len(cells) else None
            cell = write_value(r, ci, col, value)
            cell.border = box
            if i % 2 == 1:
                cell.fill = stripe
            if col.get("kind") == "amount":
                cell.font = Font(bold=True, color=TITLE_FG)
            has_sub = has_sub or bool(_cell_sub(value))
        if has_sub:
            ws.row_dimensions[r].height = 30
        r += 1

    footer = p.get("footer")
    if footer:
        grand_fill = PatternFill("solid", fgColor=GRAND_BG)
        grand_box = Border(left=grand_side, right=grand_side, top=grand_side, bottom=grand_side)
        for ci, col in enumerate(columns, start=1):
            value = footer[ci - 1] if ci - 1 < len(footer) else None
            if value in (None, ""):
                cell = ws.cell(row=r, column=ci, value=None)
            else:
                cell = write_value(r, ci, col if ci > 1 else {"kind": "text"}, value)
            cell.fill = grand_fill
            cell.font = Font(bold=True, color="FFFFFF")
            cell.border = grand_box
        r += 1

    r += 1
    ws.cell(row=r, column=1, value=f"Generated {_generated_at()}").font = Font(size=8, italic=True, color=MUTED_FG)

    for ci, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(ci)].width = min(max(w + 3, 10), 60)

    ws.freeze_panes = ws.cell(row=header_row + 1, column=1)
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_title_rows = f"{header_row}:{header_row}"

    stream = io.BytesIO()
    wb.save(stream)
    return stream.getvalue()


# ---------------------------------------------------------------------------
# PDF
# ---------------------------------------------------------------------------

def _logo_data_uri():
    path = frappe.get_app_path("budget_mis", "public", "images", "apf_logo.png")
    if os.path.isfile(path):
        with open(path, "rb") as f:
            return "data:image/png;base64," + base64.b64encode(f.read()).decode()
    return None


def _build_pdf(p):
    from frappe.utils.pdf import get_pdf

    mode = p.get("amount_mode") or "full"
    columns = p.get("columns") or []
    esc = lambda v: html.escape("" if v is None else str(v))  # noqa: E731

    head_cells = "".join(
        f'<th class="{"r" if c.get("align") == "right" else "l"}">{esc(c.get("label"))}</th>' for c in columns
    )

    body = []
    for i, row in enumerate(p.get("rows") or []):
        cells = row.get("cells") if isinstance(row, dict) else row
        color = row.get("color") if isinstance(row, dict) else None
        tds = []
        for ci, col in enumerate(columns):
            value = cells[ci] if ci < len(cells) else None
            kind = col.get("kind") or "text"
            text = esc(_format_cell(value, kind, mode))
            sub = _cell_sub(value)
            cls = ["r" if col.get("align") == "right" else "l"]
            if kind == "amount":
                cls.append("amt")
            inner = text
            if ci == 0 and color:
                inner = f'<span class="dot" style="background:{esc(color)}"></span>{inner}'
            if kind == "percent" and col.get("bar") and _num(value) is not None:
                pct = max(0.0, min(100.0, _num(value)))
                bar_color = esc(color or "#2a78d6")
                inner = (
                    f'<span class="pct">{text}</span>'
                    f'<span class="bar"><span style="width:{pct}%;background:{bar_color}"></span></span>'
                )
            if sub:
                inner += f'<div class="sub">{esc(sub)}</div>'
            tds.append(f'<td class="{" ".join(cls)}">{inner}</td>')
        body.append(f'<tr class="{"even" if i % 2 else "odd"}">{"".join(tds)}</tr>')

    footer_html = ""
    if p.get("footer"):
        tds = []
        for ci, col in enumerate(columns):
            value = p.footer[ci] if ci < len(p.footer) else None
            kind = "text" if ci == 0 else (col.get("kind") or "text")
            text = "" if value in (None, "") else esc(_format_cell(value, kind, mode))
            tds.append(f'<td class="{"r" if col.get("align") == "right" else "l"}">{text}</td>')
        footer_html = f'<tfoot><tr class="grand">{"".join(tds)}</tr></tfoot>'

    summary_html = ""
    if p.get("summary"):
        items = "".join(
            f'<div class="stat"><div class="lab">{esc(s.get("label"))}</div>'
            f'<div class="val{" neg" if s.get("kind") == "amount" and (_num(s.get("value")) or 0) < 0 else ""}">'
            f'{esc(_summary_text(s, mode))}</div></div>'
            for s in p.summary
        )
        summary_html = f'<div class="summary">{items}</div>'

    crumbs = ""
    if p.get("breadcrumb") and len(p.breadcrumb) > 1:
        crumbs = '<div class="crumbs">' + ' <span class="sep">›</span> '.join(esc(b) for b in p.breadcrumb) + "</div>"

    logo = _logo_data_uri()
    logo_html = f'<img class="logo" src="{logo}">' if logo else ""

    doc = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * {{ box-sizing: border-box; }}
  body {{ font-family: "Inter", "Helvetica Neue", Arial, sans-serif; color: #111827; font-size: 11px; margin: 0; }}
  .top {{ display: table; width: 100%; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; margin-bottom: 14px; }}
  .top > div {{ display: table-cell; vertical-align: top; }}
  .top .right {{ text-align: right; width: 140px; }}
  .logo {{ height: 34px; }}
  .eyebrow {{ font-size: 9px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }}
  h1 {{ font-size: 18px; margin: 2px 0 2px; font-weight: 600; }}
  .subtitle {{ color: #6b7280; font-size: 11px; }}
  .crumbs {{ color: #1e5fa8; font-size: 10.5px; margin-top: 6px; }}
  .crumbs .sep {{ color: #9ca3af; padding: 0 3px; }}
  .summary {{ background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; }}
  .stat {{ display: inline-block; margin-right: 36px; vertical-align: top; }}
  .stat .lab {{ font-size: 9px; letter-spacing: .05em; text-transform: uppercase; }}
  .stat .val {{ font-size: 18px; font-weight: 600; margin-top: 2px; }}
  .neg {{ color: #dc2626; }}
  .section {{ font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; margin: 0 0 6px; }}
  table {{ width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; }}
  thead {{ display: table-header-group; }}
  tfoot {{ display: table-row-group; }}
  tr {{ page-break-inside: avoid; }}
  th {{ background: #f9fafb; color: #6b7280; font-weight: 500; padding: 7px 10px; border-bottom: 1px solid #e5e7eb; border-left: 1px solid #e5e7eb; }}
  td {{ padding: 6px 10px; border-top: 1px solid #f3f4f6; border-left: 1px solid #f3f4f6; vertical-align: top; color: #374151; }}
  th:first-child, td:first-child {{ border-left: none; }}
  tr.even td {{ background: #fafbfc; }}
  .l {{ text-align: left; }}
  .r {{ text-align: right; }}
  td.amt {{ font-weight: 600; color: #111827; }}
  .sub {{ color: #6b7280; font-size: 9.5px; margin-top: 1px; }}
  .dot {{ display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 6px; }}
  .pct {{ color: #6b7280; font-size: 10px; }}
  .bar {{ display: inline-block; width: 44px; height: 5px; background: #e5e7eb; border-radius: 3px; margin-left: 6px; vertical-align: middle; overflow: hidden; }}
  .bar span {{ display: block; height: 100%; border-radius: 3px; }}
  tr.grand td {{ background: #1e5fa8; color: #fff; font-weight: 700; border-top: 1px solid #1a5493; border-left: 1px solid rgba(255,255,255,.2); }}
  .generated {{ color: #9ca3af; font-size: 9px; margin-top: 10px; }}
</style></head>
<body>
  <div class="top">
    <div>
      {f'<div class="eyebrow">{esc(p.eyebrow)}</div>' if p.get("eyebrow") else ""}
      <h1>{esc(p.get("title"))}</h1>
      {f'<div class="subtitle">{esc(p.subtitle)}</div>' if p.get("subtitle") else ""}
      {crumbs}
    </div>
    <div class="right">{logo_html}</div>
  </div>
  {summary_html}
  {f'<div class="section">{esc(p.section)}</div>' if p.get("section") else ""}
  <table>
    <thead><tr>{head_cells}</tr></thead>
    <tbody>{"".join(body)}</tbody>
    {footer_html}
  </table>
  <div class="generated">Generated {esc(_generated_at())}</div>
</body></html>"""

    return get_pdf(doc, {
        "orientation": "Landscape",
        "page-size": "A4",
        "margin-top": "12mm",
        "margin-bottom": "12mm",
        "margin-left": "10mm",
        "margin-right": "10mm",
    })
