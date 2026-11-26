import frappe

from budget_mis.utils import guest_api
from budget_mis.api.response_crypto import is_direct_http_call
from budget_mis.api.erp_data import get_trial_balance_data
from budget_mis.api.helper import format_financial_year
from budget_mis.api.grouped_actuals import group_actuals_ytd
from budget_mis.api.budget_actuals_combined import get_combined_actuals
from budget_mis.api.adjustments import get_monthly_adjustments

# ERP accounting_period (1-12, April-start) -> the month name
# get_combined_actuals/get_budget_ytd_by_sequence expect - same convention
# as erp_data.py's own ERP Data doctype's _PERIOD_MONTH_NAMES, just inlined
# here rather than imported since this module only needs the name, not the
# doctype's own period_label computation.
_PERIOD_MONTH_NAMES = {
    1: "April", 2: "May", 3: "June", 4: "July", 5: "August", 6: "September",
    7: "October", 8: "November", 9: "December", 10: "January", 11: "February", 12: "March",
}

# Column order for the Trial Balance Check table, short code -> full
# head/sub-head name shown as the column header, grouped under the same 2
# main heads the real Expenses doctype uses: Capital Expenses stands alone
# (no sub-heads), Operating Expenses has 7 real sub-heads (confirmed against
# Budget vs Actuals' own drill-down, which shows Medical Expenses as a
# sub-head of Operating Expenses alongside the other 6). "Total Opex" sums
# those 7 sub-head columns, "Grand Total" sums Capital Expenses + that Total
# Opex, both computed per row rather than read from raw data.
OPEX_SUB_ROWS = ["prog", "prtnr", "ppl", "trv", "std", "oth opex", "medical"]
CATEGORY_COLUMNS = ["capex", *OPEX_SUB_ROWS]
CATEGORY_LABELS = {
    "capex": "Capital Expenses",
    "prog": "Program Expenses",
    "prtnr": "Partner Expenses",
    "ppl": "People Expenses",
    "trv": "Travel Expenses",
    "std": "Student Support Expenses",
    "oth opex": "Other Operating Expenses",
    "medical": "Medical Expenses",
}

# head_of_expense / sub_head_of_expense (as stored on the real Expenses
# doctype) -> this table's short category code, and back again - same GL
# code -> "GL code Mapping" child table -> Expenses join
# api/erp_actuals.py's own group_actuals_month_wise uses for Budget
# Summary/Budget vs Actuals. A GL code with no mapping row, or whose mapped
# parent doesn't resolve to a real Expenses doc, is silently dropped, same
# as that function's own documented behavior. The real head/sub-head
# strings (not CATEGORY_LABELS' own display labels) are what
# _build_unit_drilldown_tree's nodes are actually named by, so
# MAIN_HEADS/_column_list expose them too - letting a column-header
# drill-down look its matching node up by real name instead of the
# frontend needing its own separate copy of this mapping.
_HEAD_TO_CATEGORY = {"CAPITAL  EXPENSES": "capex"}
_SUB_HEAD_TO_CATEGORY = {
    "PROGRAM  EXPENSES": "prog",
    "PARTNER  EXPENSES": "prtnr",
    "PEOPLE  EXPENSES": "ppl",
    "TRAVEL  EXPENSES": "trv",
    "STUDENT SUPPORT EXPENSES": "std",
}
CATEGORY_SUB_HEAD_NAMES = {v: k for k, v in _SUB_HEAD_TO_CATEGORY.items()}
CATEGORY_SUB_HEAD_NAMES["oth opex"] = "OTHER  OPERATING EXPENSES"
CATEGORY_SUB_HEAD_NAMES["medical"] = "Medical Expenses"

# Operating Expenses (the table column group) spans 2 real head_of_expense
# values - OPERATING  EXPENSES (Program/Partner/People/Travel/Student
# Support) and OTHER  OPERATING EXPENSES (oth opex) are two distinct heads
# in the real Expenses doctype data, both shown together under this one
# column group per the business's own request to fold "Other Operating" in
# as one of Operating Expenses' own sub-heads rather than a 3rd main head.
MAIN_HEADS = [
    {"key": "capex", "label": "Capital Expenses", "head_names": ["CAPITAL  EXPENSES"], "columns": ["capex"]},
    {"key": "opex", "label": "Operating Expenses", "head_names": ["OPERATING  EXPENSES", "OTHER  OPERATING EXPENSES", "Medical Expenses"], "columns": OPEX_SUB_ROWS},
]

# Trial Balance Check is a System-Manager-only tab inside Monthly MIS -
# that restriction lived purely in the frontend (the tab was only ever
# rendered for a System Manager, same gating App Module Setting.
# restrict_by_role already uses elsewhere in this app) until now, which per
# this app's own documented trap (a frontend restriction is not a backend
# permission check) meant any logged-in user who knew this method's name
# could call it directly and get the same org-wide trial balance data. Only
# checked on a genuine direct HTTP call, so internal Python callers (none
# today, but matching the rest of this app's convention) aren't blocked.
#
# Reads from the persisted ERP Data store (data_type="Trial Balance", kept
# fresh by the same scheduled sync job that refreshes the "Actuals"
# data_type - see erp_data_sync.refresh_erp_data) instead of live-fetching
# PeopleSoft on every call - same shift actuals already made away from the old
# per-request Redis cache_with_single_flight. There is deliberately no
# live-ERP fallback here; a period that hasn't been backfilled/synced yet
# just returns "failed" with an honest message (get_trial_balance_data's
# own documented behavior).
@guest_api
def get_trial_balance_from_erp(fiscal_year, accounting_period):
    if is_direct_http_call(get_trial_balance_from_erp) and "System Manager" not in frappe.get_roles():
        frappe.throw("Not permitted", frappe.PermissionError)

    result = get_trial_balance_data(fiscal_year, accounting_period)

    if result.get("status") != "success":
        return {
            "status": result.get("status", "failed"),
            "fiscal_year": fiscal_year,
            "accounting_period": accounting_period,
            "error": result.get("error"),
        }

    rows = result.get("data", [])
    rows = rows + _get_opening_balance_rows(fiscal_year)

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "table": build_trial_balance_table(
            rows,
            mis_actuals_by_unit=_get_mis_actuals_by_unit(fiscal_year, accounting_period),
            adjustments_by_unit=_get_adjustments_by_unit(fiscal_year, accounting_period),
        ),
    }


# Fixed column order for the Adjustment Breakup table below Trial Balance
# Check - the same 5 real options Adjustment Items.adjustment_method itself
# has (see child/doctype/adjustment_items/adjustment_items.json), in that
# same order, so a method with zero YTD activity for every unit still gets
# its own (empty) column rather than disappearing.
ADJUSTMENT_METHODS = [
    "Deletion",
    "Profit on sale of assets",
    "Inter entity rent",
    "Inter-entity transfers",
    "Capital Advance",
]

# Trial Balance Check's own sibling table: one ROW per the SAME fixed
# category codes its own columns use (CATEGORY_COLUMNS: capex/prog/prtnr/
# ppl/trv/std/oth opex, plus the computed "total opex"/"grand total" rows),
# one COLUMN per Adjustment Method - the business's own explicit row order,
# matching Trial Balance Check's own column order exactly so the two
# tables read as mirror images of each other. Each GL-code-level cell is
# resolved to its category via the SAME GL code -> Expenses join
# (_get_gl_code_expenses/_category_for_expense) build_trial_balance_table
# itself uses, applied here to each Adjustment Item's own gl_code (a Link
# to Expenses Line Items, same doctype trial balance's own GL codes
# resolve through) - an item whose gl_code doesn't resolve to one of these
# categories is silently dropped, same documented behavior as
# build_trial_balance_table's own GL-code categorization. Each cell is the
# YTD (cumulative up to and including accounting_period, same semantics as
# get_monthly_adjustments) sum of that category+method's adjustment_amount,
# signed by adjustment_type (Add/Minus) exactly like get_monthly_adjustments
# /get_adjustments_month_wise already do elsewhere in this app. Reads
# Monthly Adjustment/Adjustment Items directly (not via get_monthly_
# adjustments, which groups by GL code/cost center/location/unit instead of
# category+adjustment_method) since no existing function exposes this
# particular grouping.
@guest_api
def get_adjustment_breakup(financial_year, month):
    if is_direct_http_call(get_adjustment_breakup) and "System Manager" not in frappe.get_roles():
        frappe.throw("Not permitted", frappe.PermissionError)

    month = int(month)

    docs = frappe.get_all(
        "Monthly Adjustment",
        filters={"financial_year": financial_year},
        fields=["name", "month"],
    )

    month_map = {
        "April": 1, "May": 2, "June": 3, "July": 4,
        "August": 5, "September": 6, "October": 7,
        "November": 8, "December": 9,
        "January": 10, "February": 11, "March": 12,
    }

    gl_to_expense = _get_gl_code_expenses()

    totals = {c: {} for c in CATEGORY_COLUMNS}  # category -> {method: amount}
    for doc in docs:
        if isinstance(doc.month, int):
            period = doc.month
        elif str(doc.month).isdigit():
            period = int(doc.month)
        else:
            period = month_map.get(doc.month)

        if not period or period > month:
            continue

        full_doc = frappe.get_doc("Monthly Adjustment", doc.name)
        for row in full_doc.adjustment_line_items:
            expense = gl_to_expense.get(str(row.gl_code or "").strip())
            category = _category_for_expense(expense) if expense else None
            if category not in CATEGORY_COLUMNS:
                continue

            amount = row.adjustment_amount or 0
            if row.adjustment_type == "Minus":
                amount = -amount

            method = row.adjustment_method or ""
            totals[category][method] = totals[category].get(method, 0) + amount

    table_rows = []
    total_opex_values = {m: 0 for m in ADJUSTMENT_METHODS}
    grand_total_values = {m: 0 for m in ADJUSTMENT_METHODS}
    for category in CATEGORY_COLUMNS:
        method_totals = totals[category]
        values = {m: round(method_totals.get(m, 0), 2) or None for m in ADJUSTMENT_METHODS}
        values["total"] = round(sum(method_totals.values()), 2) or None

        for m in ADJUSTMENT_METHODS:
            grand_total_values[m] += method_totals.get(m, 0)
            if category in OPEX_SUB_ROWS:
                total_opex_values[m] += method_totals.get(m, 0)

        table_rows.append({
            "category": category,
            "label": CATEGORY_LABELS[category],
            "values": values,
        })

    total_opex_row_values = {m: round(v, 2) or None for m, v in total_opex_values.items()}
    total_opex_row_values["total"] = round(sum(total_opex_values.values()), 2) or None
    table_rows.append({
        "category": "total opex",
        "label": "Total Operating Expenses",
        "values": total_opex_row_values,
    })

    grand_total_row_values = {m: round(v, 2) or None for m, v in grand_total_values.items()}
    grand_total_row_values["total"] = round(sum(grand_total_values.values()), 2) or None
    table_rows.append({
        "category": "grand total",
        "label": "Grand Total",
        "values": grand_total_row_values,
        "is_total": True,
    })

    return {
        "status": "success",
        "financial_year": financial_year,
        "month": month,
        "columns": [{"key": m, "label": m} for m in ADJUSTMENT_METHODS] + [{"key": "total", "label": "Total"}],
        "rows": table_rows,
    }


# Per-unit YTD Monthly Adjustment total (business_mis.api.adjustments.
# get_monthly_adjustments, the SAME cumulative-to-this-period adjustments
# figure that already feeds into actuals elsewhere in this app, e.g.
# erp_actuals.py's group_actuals_ytd), shown as this table's own
# "Adjustment" column. get_monthly_adjustments is called as an internal
# Python call (is_direct_http_call is False here, same convention as
# _get_mis_actuals_by_unit's own get_combined_actuals call), so it returns
# every unit's adjustments unscoped rather than being re-scoped to this
# request's own (non-existent) calling user.
def _get_adjustments_by_unit(fiscal_year, accounting_period):
    financial_year = format_financial_year(fiscal_year)
    rows = get_monthly_adjustments(financial_year=financial_year, month=accounting_period)

    totals = {}
    for row in rows:
        unit = row.get("business_unit")
        if not unit:
            continue
        totals[unit] = totals.get(unit, 0) + (row.get("posted_total_amt") or 0)
    return totals


# Per-unit YTD actuals total from the SAME engine Monthly MIS's own
# get_monthly_mis_break_up uses (group_actuals_ytd -> get_combined_actuals
# per unit, summing each head's total_posted_amt_ytd) - shown as this
# table's own "MIS" column so a System Manager can see the two figures
# side by side instead of cross-checking them in two separate tabs. This
# already includes Monthly Adjustment rows (merged in at the source by
# erp_actuals._get_actuals_from_erp_month_wise_raw - `combined_rows =
# erp_rows + frappe_rows`, frappe_rows from get_adjustments_month_wise -
# before group_actuals_ytd ever sees it), so it is NOT added to
# adjustments_by_unit's own figure a second time (that would double-count
# the adjustment - confirmed as a real bug introduced and then reverted in
# this exact spot). Only the actuals side is used here (financial_year/
# month are still passed through to get_combined_actuals since it computes
# budget totals too, but those are simply not read) - a unit with no
# card-mapped actuals at all for this period is left out, matching Monthly
# MIS's own behavior.
def _get_mis_actuals_by_unit(fiscal_year, accounting_period):
    financial_year = format_financial_year(fiscal_year)
    month = _PERIOD_MONTH_NAMES.get(int(accounting_period))
    if not month:
        return {}

    grouped_actuals_data = group_actuals_ytd(
        fiscal_year=fiscal_year, accounting_period=accounting_period
    ).get("data", [])

    totals = {}
    for unit in frappe.get_all("Unit", pluck="name"):
        structure = get_combined_actuals(
            financial_year=financial_year,
            month=month,
            unit=unit,
            grouped_actuals_data=grouped_actuals_data,
        )
        totals[unit] = sum(h.get("total_posted_amt_ytd") or 0 for h in structure)
    return totals


# Opening Balance docs are entered once per financial_year (e.g. "2026-27"),
# with no month/period of their own - an opening balance is a starting-point
# adjustment for the WHOLE year, so every accounting_period within that
# financial_year applies the exact same set of deltas, not just one period.
# Returned in the same flat {"business_unit", "gl_code", "account", "amount"}
# shape fetch_trial_balance_from_erp_raw's own rows use, so they can simply
# be appended to those rows before build_trial_balance_table groups
# everything by (unit, GL code) and sums.
#
# Capital Expenses is special-cased: the business's own stated formula for
# Capex is "debit - credit - opening balance", i.e. the opening balance is
# ALWAYS subtracted from the period's net Capex movement, regardless of
# this item's own Add/Minus type - Add/Minus only matters for every other
# (Opex) category, where the item's own type decides the sign as entered.
# gl_to_expense/_category_for_expense (the same GL-code -> category
# resolution build_trial_balance_table itself uses) decide which rows get
# this treatment, so a GL code's categorization can never disagree between
# the two.
#
# unit/gl_code on Opening Balance Items are the same raw Unit doc name /
# Expenses Line Items name values trial balance rows already use as
# business_unit/gl_code (confirmed when this data was imported - both sides
# use identical raw codes), so no extra resolution is needed here.
def _get_opening_balance_rows(fiscal_year):
    financial_year = format_financial_year(fiscal_year)
    opening_balance_names = frappe.get_all(
        "Opening Balance", filters={"financial_year": financial_year}, pluck="name"
    )

    gl_to_expense = _get_gl_code_expenses()

    rows = []
    for name in opening_balance_names:
        items = frappe.get_all(
            "Opening Balance Items",
            filters={"parent": name, "parenttype": "Opening Balance"},
            fields=["unit", "gl_code", "opening_balance_type", "opening_balance_amount"],
        )
        for item in items:
            amount = item.opening_balance_amount or 0
            expense = gl_to_expense.get(str(item.gl_code or "").strip())
            category = _category_for_expense(expense) if expense else None

            if category == "capex":
                amount = -amount
            elif item.opening_balance_type == "Minus":
                amount = -amount

            rows.append({
                "business_unit": item.unit,
                "gl_code": item.gl_code,
                "account": None,
                "amount": amount,
                # Marks this row as opening-balance-derived (as opposed to a
                # real ERP trial balance movement) - read by
                # _build_gl_code_table below to show Opening Balance as its
                # own column instead of folding it into Debit/Credit, since
                # it's a starting position, not a movement within this
                # period.
                "is_opening_balance": True,
            })
    return rows


# Diagnostic passthrough - returns the untouched PeopleSoft rows for one
# fiscal_year/accounting_period exactly as Z_MIS_TB_BY_PERIOD sent them
# (business_unit/account/deptid/operating_unit/posted_total_amt, lower-
# cased tag names, no remapping/pivoting at all), for inspecting the real
# field names/values directly (e.g. confirming whether a given
# accounting_period value shows up in this query's response at all) rather
# than only ever seeing them already resolved into the Trial Balance Check
# table's own shape. Reads the SAME stored ERP Data record as
# get_trial_balance_from_erp above (its response_json carries both `data`
# and `raw_rows` from the one fetch that produced it), and same
# System-Manager-only gating, since this is still real org-wide financial
# data, just unprocessed.
@guest_api
def get_trial_balance_raw_from_erp(fiscal_year, accounting_period):
    if is_direct_http_call(get_trial_balance_raw_from_erp) and "System Manager" not in frappe.get_roles():
        frappe.throw("Not permitted", frappe.PermissionError)

    result = get_trial_balance_data(fiscal_year, accounting_period)

    if result.get("status") != "success":
        return {
            "status": result.get("status", "failed"),
            "fiscal_year": fiscal_year,
            "accounting_period": accounting_period,
            "error": result.get("error"),
        }

    raw_rows = result.get("raw_rows", [])

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "count": len(raw_rows),
        "rows": raw_rows,
    }


# Pivots flat {"business_unit", "gl_code", "account", "amount"} rows (the
# real PeopleSoft trial balance response shape - no category field) into the
# table shown on the Trial Balance Check page: one ROW per Unit (shown via
# its own unit_decription field, e.g. "APF - Azim Premji Foundation", not
# just its raw code - same "{name} - {unit_decription}" convention already
# used by api/filter_options.py's own Unit dropdown), one COLUMN per expense
# head/sub-head (Capital/Program/Partner/People/Travel/Student Support/
# Other Operating Expenses, plus computed Total Opex/Grand Total) - every GL
# line for that unit is resolved to its category via gl_code and summed, so
# this is a unit-wise main-head/sub-head bifurcation, not a GL-code-level
# listing. Each row also carries its own 4-level drill-down tree
# (head_of_expense -> sub_head_of_expense -> type_of_expense -> gl_code) via
# `tree`, built from that unit's own GL lines, so clicking the unit opens
# the shared BudgetDrilldownModal with no second round trip.
def build_trial_balance_table(rows, mis_actuals_by_unit=None, adjustments_by_unit=None):
    unit_labels = _get_unit_labels()
    gl_to_expense = _get_gl_code_expenses()
    mis_actuals_by_unit = mis_actuals_by_unit or {}
    adjustments_by_unit = adjustments_by_unit or {}

    rows_by_unit = {}
    units_seen = []
    for r in rows:
        bu = r.get("business_unit")
        if not bu:
            continue
        if bu not in units_seen:
            units_seen.append(bu)
        rows_by_unit.setdefault(bu, []).append(r)

    table_rows = []
    for bu in units_seen:
        unit_rows = rows_by_unit[bu]

        # (category) -> {"debit": sum of positive amounts, "credit": sum of
        # |negative amounts|} for this unit's column cells - the business's
        # own explicit debit/credit convention (a positive posted_total_amt
        # is a debit, a negative one a credit, same sign PeopleSoft itself
        # already uses), kept as two separate running totals rather than
        # one signed sum so "debit - credit" is a literal formula or this
        # table rather than an unexplained net figure. Mathematically
        # identical to the old plain signed sum (debit - credit always
        # equals sum of signed amounts), just computed explicitly.
        dc_totals = {c: {"debit": 0, "credit": 0} for c in CATEGORY_COLUMNS}
        for r in unit_rows:
            expense = gl_to_expense.get(str(r.get("gl_code") or "").strip())
            category = _category_for_expense(expense) if expense else None
            if category not in CATEGORY_COLUMNS:
                continue
            amount = r.get("amount") or 0
            if amount >= 0:
                dc_totals[category]["debit"] += amount
            else:
                dc_totals[category]["credit"] += -amount

        # Net = debit - credit, same net amount the category's own column
        # has always shown - Capex additionally subtracts the Opening
        # Balance (already merged into unit_rows with its own sign flipped
        # for Capex in _get_opening_balance_rows, so it already landed in
        # debit or credit above; "debit - credit" alone already reflects
        # it - this net IS the full "debit - credit - opening" figure, not
        # a figure still needing a further subtraction).
        totals = {c: dc_totals[c]["debit"] - dc_totals[c]["credit"] for c in CATEGORY_COLUMNS}

        values = {c: round(totals.get(c, 0), 2) or None for c in CATEGORY_COLUMNS}
        total_opex = round(sum(totals.get(c, 0) for c in OPEX_SUB_ROWS), 2)
        grand_total = round(totals.get("capex", 0) + total_opex, 2)
        values["total opex"] = total_opex or None
        values["grand total"] = grand_total or None
        # "MIS" is the Actuals figure, same engine Monthly MIS itself uses
        # (group_actuals_ytd -> get_combined_actuals) - NOT added to
        # adjustments_by_unit a second time here. The raw actuals data this
        # already reads (backfilled by erp_actuals._get_actuals_from_erp_
        # month_wise_raw, confirmed directly: `combined_rows = erp_rows +
        # frappe_rows` where frappe_rows comes from get_adjustments_month_
        # wise) already has Monthly Adjustment rows merged in at the
        # source, per period, before this function ever sees it - so this
        # "MIS" figure already includes adjustments; adding
        # adjustments_by_unit's own (separately-sourced, cumulative-YTD)
        # figure on top double-counted it. The "Adjustment" column stays,
        # purely as its own independent, separately-sourced display figure
        # for cross-checking - not a component this MIS figure is built
        # from.
        values["mis"] = round(mis_actuals_by_unit[bu], 2) if bu in mis_actuals_by_unit else None
        values["adjustment"] = round(adjustments_by_unit[bu], 2) if bu in adjustments_by_unit else None

        table_rows.append({
            "unit": unit_labels.get(bu, bu),
            "values": values,
            "tree": _build_unit_drilldown_tree(unit_rows, gl_to_expense),
            "cost_center_breakdown": _build_cost_center_breakdown(unit_rows, gl_to_expense),
            "gl_code_table": _build_gl_code_table(unit_rows, gl_to_expense),
        })

    # Same 4-level tree, but across every unit's rows at once - the source
    # column-header drill-downs (Capital Expenses/Operating Expenses/its
    # sub-heads/Total) consolidate from, since a column spans all units
    # rather than belonging to one row. _build_unit_drilldown_tree takes any
    # flat row list, unit-specific or not, so this is the exact same
    # function applied to the full, unfiltered `rows`.
    consolidated_tree = _build_unit_drilldown_tree(rows, gl_to_expense)

    # Trailing "Total" row - every unit's own column summed, with the same
    # consolidated_tree as its own drill-down (so clicking this row behaves
    # exactly like clicking the Total column header, just reached from the
    # row instead).
    grand_row_values = {c: 0 for c in CATEGORY_COLUMNS}
    for row in table_rows:
        for c in CATEGORY_COLUMNS:
            grand_row_values[c] += row["values"].get(c) or 0
    grand_row_total_opex = round(sum(grand_row_values[c] for c in OPEX_SUB_ROWS), 2)
    grand_row_values = {c: round(v, 2) or None for c, v in grand_row_values.items()}
    grand_row_values["total opex"] = grand_row_total_opex or None
    grand_row_values["grand total"] = round(
        (grand_row_values.get("capex") or 0) + grand_row_total_opex, 2
    ) or None
    grand_row_values["mis"] = round(sum(mis_actuals_by_unit.get(bu, 0) for bu in units_seen), 2) or None
    grand_row_values["adjustment"] = round(sum(adjustments_by_unit.get(bu, 0) for bu in units_seen), 2) or None
    table_rows.append({
        "unit": "TOTAL",
        "values": grand_row_values,
        "tree": consolidated_tree,
        "is_total": True,
    })

    return {
        "columns": _column_list(),
        "main_heads": MAIN_HEADS,
        "rows": table_rows,
        "consolidated_tree": consolidated_tree,
    }


def _column_list():
    columns = [
        {"key": c, "label": CATEGORY_LABELS[c], "sub_head_name": CATEGORY_SUB_HEAD_NAMES.get(c)}
        for c in CATEGORY_COLUMNS
    ]
    columns.append({"key": "total opex", "label": "Total Operating Expenses"})
    columns.append({"key": "grand total", "label": "Total Trial Balance"})
    columns.append({"key": "adjustment", "label": "Adjustment"})
    columns.append({"key": "mis", "label": "MIS"})
    return columns


def _get_unit_labels():
    units = frappe.get_all("Unit", fields=["name", "unit_decription"])
    return {u.name: f"{u.name} - {u.unit_decription}" if u.unit_decription else u.name for u in units}


# Resolves every GL code to its real Expenses doctype row (head_of_expense/
# sub_head_of_expense/type_of_expense/sequence_id) via the GL code -> "GL
# code Mapping" child table (gl_code_map field, parent links to Expenses)
# join - the exact same lookup api/erp_actuals.py's group_actuals_month_wise
# uses for Budget Summary/Budget vs Actuals, so both the table's category
# columns AND the unit-level drill-down tree below stay consistent with how
# every other report in this app categorizes a GL code. A GL code with no
# mapping row, or whose mapped parent doesn't resolve to a real Expenses
# doc, is silently dropped, same as that function's own documented
# behavior.
def _get_gl_code_expenses():
    gl_map_rows = frappe.get_all("GL code Mapping", fields=["parent", "gl_code_map"])
    gl_to_parent = {str(row.gl_code_map).strip(): row.parent for row in gl_map_rows}

    expenses = frappe.get_all(
        "Expenses",
        fields=["name", "head_of_expense", "sub_head_of_expense", "type_of_expense", "sequence_id"],
    )
    expense_lookup = {e.name: e for e in expenses}

    gl_to_expense = {}
    for gl_code, parent in gl_to_parent.items():
        expense = expense_lookup.get(parent)
        if expense:
            gl_to_expense[gl_code] = expense
    return gl_to_expense


def _category_for_expense(expense):
    head = (expense.head_of_expense or "").strip()
    sub_head = (expense.sub_head_of_expense or "").strip()
    category = _HEAD_TO_CATEGORY.get(head) or _SUB_HEAD_TO_CATEGORY.get(sub_head)
    if not category and head == "Medical Expenses":
        category = "medical"
    elif not category and head in ("OPERATING  EXPENSES", "OTHER  OPERATING EXPENSES"):
        category = "oth opex"
    return category


# GL code -> its own description, read from Expenses Line Items (the GL
# code master doctype - type_of_expense there is its real human
# description, e.g. "40118" -> "Freehold Land", confirmed when this
# doctype was synced from PeopleSoft's own GL Account Masters feed). Trial
# balance rows themselves never carry a real GL description of their own
# (fetch_trial_balance_from_erp_raw's own `account` field is always None -
# PeopleSoft's trial balance query has no separate description field), so
# this is the only source for one.
def _get_gl_code_descriptions():
    rows = frappe.get_all("Expenses Line Items", fields=["name", "type_of_expense"])
    return {r.name: r.type_of_expense for r in rows if r.type_of_expense}


# Trial Balance Check's own flat GL-code table (the drill-down modal's
# first tab) - one ROW per GL code actually seen in `scoped_rows` (a
# unit's own rows, or one cost-center+location node's own subset), columns
# gl_code/description/debit/credit/opening_balance/net, plus a `total`
# summed across every row shown. Restricted to the same Capex/Opex-mapped
# GL codes the main table's own category columns count (via
# _category_for_expense/CATEGORY_COLUMNS - excludes an unmapped/
# balance-sheet GL code, AND excludes a GL code mapped to "Medical
# Expenses"/"COVID SUPPORT", neither of which the main table's Grand Total
# counts either), so this tab's own `total.net` always sums back to the
# main table's "Total Trial Balance" figure for the same unit/cost-center-
# location slice - same guarantee _build_cost_center_breakdown's own `ytd`
# now has. (This tab was briefly left deliberately unfiltered - showing
# every raw GL code regardless of category - but that made its own total
# disagree with, and sometimes flip the sign of, the figure everywhere
# else on this page, so it's scoped the same way now.)
#
# Debit/Credit here are from REAL ERP movement rows ONLY
# (is_opening_balance not set) - an Opening Balance row NEVER contributes to
# either, even though _get_opening_balance_rows pre-negates a Capex entry's
# sign the same way a real credit would look. Folding that pre-negated
# amount into Credit (an earlier version of this function did) made Debit
# and Credit both show the SAME real-world figure for a GL code whose only
# ERP movement exactly equals its own opening balance - mechanically
# correct for Net, but genuinely misleading: the API never reported any
# credit at all, so showing one implied real ERP activity that never
# happened. Opening Balance stays its own separate column (summed only from
# rows _get_opening_balance_rows produced), and Net is now the explicit
# formula itself (debit - credit - opening_balance for Capex, debit -
# credit for everything else) rather than relying on debit/credit already
# having silently absorbed it - same final Net figure either way (just
# computed as a visible 3rd step for Capex instead of folded in), but Debit/
# Credit now only ever reflect what the ERP itself actually returned. A
# cost-center+location node's own scoped_rows never contains an opening-
# balance row for a real (non-"Unspecisfied") pair (Opening Balance Items
# carry no cost-center/location of their own), so its own gl_code_table
# naturally shows blank Opening Balance everywhere except the "Unspecified"
# node that is where _build_cost_center_breakdown groups them.
def _build_gl_code_table(scoped_rows, gl_to_expense):
    gl_descriptions = _get_gl_code_descriptions()

    totals = {}
    order = []
    for r in scoped_rows:
        gl_code = str(r.get("gl_code") or "").strip()
        if not gl_code:
            continue

        expense = gl_to_expense.get(gl_code)
        category = _category_for_expense(expense) if expense else None
        if category not in CATEGORY_COLUMNS:
            continue

        if gl_code not in totals:
            totals[gl_code] = {"debit": 0, "credit": 0, "opening_balance": 0}
            order.append(gl_code)

        amount = r.get("amount") or 0
        if r.get("is_opening_balance"):
            totals[gl_code]["opening_balance"] += amount
        elif amount >= 0:
            totals[gl_code]["debit"] += amount
        else:
            totals[gl_code]["credit"] += -amount

    rows_out = []
    grand = {"debit": 0, "credit": 0, "opening_balance": 0, "net": 0}
    for gl_code in order:
        t = totals[gl_code]
        expense = gl_to_expense.get(gl_code)
        description = gl_descriptions.get(gl_code) or (expense.type_of_expense if expense else "") or ""

        # Net = debit - credit, plus the opening balance for a Capex GL code
        # - "plus", not "minus", because _get_opening_balance_rows already
        # negates a Capex entry's own amount before it ever reaches this
        # function (so t["opening_balance"] is already e.g. -292,181.94 for
        # an opening balance of +292,181.94); adding that already-negated
        # figure IS the subtraction the business's own "debit - credit -
        # opening balance" formula means - the explicit 3-term version of
        # what build_trial_balance_table's own dc_totals arrives at via
        # sign-folding instead, spelled out directly here since Debit/
        # Credit no longer carry the opening balance's own contribution.
        category = _category_for_expense(expense) if expense else None
        net = t["debit"] - t["credit"]
        if category == "capex":
            net += t["opening_balance"]

        grand["debit"] += t["debit"]
        grand["credit"] += t["credit"]
        grand["opening_balance"] += t["opening_balance"]
        grand["net"] += net

        rows_out.append({
            "gl_code": gl_code,
            "description": description,
            "debit": round(t["debit"], 2) or None,
            "credit": round(t["credit"], 2) or None,
            "opening_balance": round(t["opening_balance"], 2) or None,
            "net": round(net, 2) or None,
        })

    return {
        "rows": rows_out,
        "total": {
            "debit": round(grand["debit"], 2) or None,
            "credit": round(grand["credit"], 2) or None,
            "opening_balance": round(grand["opening_balance"], 2) or None,
            "net": round(grand["net"], 2) or None,
        },
    }


# Builds the 4-level drill-down tree for one unit's GL lines, matching
# budget_actuals_combined.py's own _build_expense_structure shape exactly
# (head_of_expense -> sub_head_of_expense -> item named by type_of_expense,
# carrying sequence_id -> that item's own real GL codes as its `items`) so
# it opens directly in the shared BudgetDrilldownModal with no reshaping on
# the frontend. Unlike the real Budget vs Actuals flow (which fetches the
# GL-code level on demand via get_actual_gl_breakup), every GL line is
# already in hand here, so the whole tree - all 4 levels - is built
# up-front in one pass.
#
# Ordering matches _build_expense_structure's own convention exactly:
# heads sorted by their own sequence_id, sub_heads within a head sorted by
# theirs, items within a sub_head sorted by theirs too - NOT the order
# trial balance rows happen to arrive in (which is PeopleSoft's own fetch
# order, meaningless for display). Every head/sub-head/item's sequence_id
# is the Expenses master's own row id for that expense category (same
# "first GL code assigns the sequence_id" rule _build_expense_structure
# itself follows, via gl_to_expense's per-row expense.sequence_id), so a
# head/sub-head/item built from ANY of its own GL codes always sorts the
# same way Budget vs Actuals' own tree does for the identical category.
def _build_unit_drilldown_tree(unit_rows, gl_to_expense):
    gl_descriptions = _get_gl_code_descriptions()
    heads = {}
    for r in unit_rows:
        gl_code = str(r.get("gl_code") or "").strip()
        expense = gl_to_expense.get(gl_code)
        if not expense:
            continue

        head_name = expense.head_of_expense
        sub_head_name = expense.sub_head_of_expense
        type_name = expense.type_of_expense
        seq = expense.sequence_id or 9999
        amount = r.get("amount") or 0

        # "OTHER  OPERATING EXPENSES" and "Medical Expenses" are not their
        # own top-level heads - same _MOVE_UNDER_OPERATING rewrite
        # budget_actuals_combined.py's own _build_expense_structure applies
        # (confirmed live: Budget vs Actuals' own drill-down shows Medical
        # Expenses as a sub-head of Operating Expenses, alongside Program/
        # Partner/People/Travel/Student Support/Other Operating). Both fold
        # in as their own sub-head of OPERATING  EXPENSES rather than
        # appearing as a 3rd/4th sibling head alongside Capital/Operating
        # Expenses, matching Budget vs Actuals' exact grouping - this table's
        # own drill-down tree must read the same as that one for the same
        # unit's data.
        if head_name in ("OTHER  OPERATING EXPENSES", "Medical Expenses"):
            sub_head_name = head_name
            head_name = "OPERATING  EXPENSES"

        head = heads.setdefault(head_name, {"name": head_name, "sequence_id": seq, "sub_heads": {}, "ytd": 0})
        head["ytd"] += amount

        # CAPITAL EXPENSES has no real sub-head level - its own GL codes'
        # sub_head_of_expense values are placeholders, same reason
        # budget_actuals_combined.py's own _build_expense_structure
        # special-cases head_name in [_CAPITAL_HEAD, _COVID_HEAD] to attach
        # items straight to the head. Keying item_bucket on the head
        # itself (rather than a sub_head dict) here is that exact same
        # bypass, so Capital Expenses renders as Head -> Item -> GL (3
        # levels), matching Budget vs Actuals' own tree shape precisely
        # instead of inventing an extra, meaningless Sub Heads screen.
        if head_name == "CAPITAL  EXPENSES":
            item_bucket = head.setdefault("items", {})
        else:
            sub_head = head["sub_heads"].setdefault(
                sub_head_name, {"name": sub_head_name, "sequence_id": seq, "items": {}, "ytd": 0}
            )
            sub_head["ytd"] += amount
            item_bucket = sub_head["items"]

        item = item_bucket.setdefault(
            type_name,
            {"name": type_name, "sequence_id": seq, "gl_lines": {}, "ytd": 0},
        )
        item["ytd"] += amount

        # Keyed by gl_code (not appended as a new line every time) so the
        # SAME GL code seen across several units in `unit_rows` (e.g. when
        # this is called with every unit's rows at once for the
        # consolidated/column-header drill-downs) sums into one GL line
        # instead of showing as several confusing duplicate-looking rows -
        # a no-op for a single unit's own tree, which never has more than
        # one row per GL code to begin with. `account` now prefers the real
        # GL code description (gl_descriptions) over the trial balance
        # row's own always-empty `account` field, falling back to it only
        # for a GL code with no Expenses Line Items description either.
        gl_line = item["gl_lines"].setdefault(
            gl_code,
            {"account": gl_descriptions.get(gl_code) or r.get("account") or "", "ytd": 0},
        )
        gl_line["ytd"] += amount

    def _render_item(item):
        return {
            "name": item["name"],
            "sequence_id": item["sequence_id"],
            "ytd": round(item["ytd"], 2),
            "items": [
                {"name": f"{gl_code} - {line['account']}".strip(" -"), "ytd": round(line["ytd"], 2)}
                for gl_code, line in item["gl_lines"].items()
            ],
        }

    sorted_heads = sorted(heads.values(), key=lambda h: h["sequence_id"])
    result = []
    for head in sorted_heads:
        node = {"name": head["name"], "ytd": round(head["ytd"], 2)}
        if "items" in head:
            # CAPITAL EXPENSES: flat Head -> Item -> GL, no Sub Heads level
            # (see this function's own comment above on why).
            node["items"] = [_render_item(item) for item in sorted(head["items"].values(), key=lambda i: i["sequence_id"])]
        else:
            node["sub_heads"] = [{
                "name": sub_head["name"],
                "ytd": round(sub_head["ytd"], 2),
                "items": [_render_item(item) for item in sorted(sub_head["items"].values(), key=lambda i: i["sequence_id"])],
            } for sub_head in sorted(head["sub_heads"].values(), key=lambda s: s["sequence_id"])]
        result.append(node)
    return result


# Resolves every Cost Center/Location Code's own real ERP code (deptid /
# operating_unit on a trial balance row - PeopleSoft's raw field names,
# carried through by fetch_trial_balance_from_erp_raw) to a human label,
# same "code - description" convention _get_unit_labels already uses for
# Unit.
def _get_cost_center_labels():
    rows = frappe.get_all("Cost Center", fields=["cost_center", "cc_descr"])
    return {
        str(r.cost_center): f"{r.cost_center} - {r.cc_descr}" if r.cc_descr else str(r.cost_center)
        for r in rows if r.cost_center
    }


def _get_location_code_labels():
    rows = frappe.get_all("Location Code", fields=["location_code", "decription"])
    return {
        str(r.location_code): f"{r.location_code} - {r.decription}" if r.decription else str(r.location_code)
        for r in rows if r.location_code
    }


# Trial Balance Check's own Level 2 drill-down: one node per (cost center,
# location code) pair actually seen in this unit's own rows (deptid/
# operating_unit, the same raw ERP codes every other actuals-side filter in
# this app keys on - see CLAUDE.md's own documented Cost Center/Location
# Code doc-name-vs-ERP-code trap), each carrying its own 4-level head/
# sub-head/item/GL `__lineItems` tree (the SAME shape/builder as the unit's
# own top-level tree, just scoped to this one cost-center+location slice
# instead of the whole unit) - so BudgetDrilldownModal's existing hierarchy-
# children + __lineItems convention (see monthly_mis.py's own
# _leaf_entity_node/_build_drilldown_node, which this mirrors) can render
# it as "Level 1: Unit -> consolidated line items" / "Level 2: Cost
# Center/Location rows -> each one's own line items" with no new frontend
# concept - the modal already knows how to walk a node with `children`.
# A GL line with no deptid/operating_unit at all (should not happen for a
# real PeopleSoft row, but defensively handled) is grouped under
# ("Unspecified", "Unspecified") rather than dropped.
def _build_cost_center_breakdown(unit_rows, gl_to_expense):
    cc_labels = _get_cost_center_labels()
    loc_labels = _get_location_code_labels()

    rows_by_cc_loc = {}
    order = []
    for r in unit_rows:
        cc = str(r.get("deptid") or "").strip() or "Unspecified"
        loc = str(r.get("operating_unit") or "").strip() or "Unspecified"
        key = (cc, loc)
        if key not in rows_by_cc_loc:
            rows_by_cc_loc[key] = []
            order.append(key)
        rows_by_cc_loc[key].append(r)

    nodes = []
    for cc, loc in order:
        leaf_rows = rows_by_cc_loc[(cc, loc)]
        line_items = _build_unit_drilldown_tree(leaf_rows, gl_to_expense)
        # Same Capex/Opex-category-mapped-only total the main table's own
        # dc_totals loop uses (a GL code with no "GL code Mapping" row, or
        # whose mapped parent doesn't resolve to a real Expenses doc, never
        # counts toward it) - summing leaf_rows' raw `amount` directly here
        # instead was a real bug: every unmapped/balance-sheet GL code's
        # amount leaked in, AND every Opening Balance row (which carries no
        # deptid/operating_unit of its own, so it always lands in this
        # function's own "Unspecified" bucket) counted its full amount
        # again on top of what it already contributes to the main table's
        # own category totals - together these could make the "Unspecified"
        # node's own total wildly disagree with (even flip the sign of) the
        # unit's real "Total Trial Balance" figure. Restricted to only the
        # 2 head names CATEGORY_COLUMNS itself covers (CAPITAL  EXPENSES,
        # OPERATING  EXPENSES - which OTHER  OPERATING EXPENSES already
        # folds into) - _build_unit_drilldown_tree's own tree ALSO includes
        # "Medical Expenses"/"COVID SUPPORT" as their own separate heads,
        # neither of which CATEGORY_COLUMNS/the main table's own Grand Total
        # ever counts, so summing every head here (not just these 2) still
        # disagreed with the main table by exactly those 2 heads' own
        # totals.
        total_ytd = round(
            sum(head["ytd"] for head in line_items if head["name"] in ("CAPITAL  EXPENSES", "OPERATING  EXPENSES")),
            2,
        )
        cc_label = cc_labels.get(cc, cc)
        loc_label = loc_labels.get(loc, loc)
        nodes.append({
            "name": f"{cc_label} · {loc_label}",
            "ytd": total_ytd,
            "children": [],
            "__lineItems": line_items,
            "gl_code_table": _build_gl_code_table(leaf_rows, gl_to_expense),
        })
    return nodes
