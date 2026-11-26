import frappe

from budget_mis.utils import guest_api
from budget_mis.api.response_crypto import is_direct_http_call
from budget_mis.api.helper import (
    get_peoplesoft_prod_credentials,
    get_actuals_cache_duration_seconds,
    cache_with_single_flight,
)
from budget_mis.api.erp_actuals import fetch_trial_balance_from_erp_raw
from budget_mis.master.doctype.erp_actuals_call_log.erp_actuals_call_log import log_call

# Column order for the Trial Balance Check table, short code -> full
# head/sub-head name shown as the column header, grouped under the same 2
# main heads the real Expenses doctype uses: Capital Expenses stands alone
# (no sub-heads), Operating Expenses has 6 real sub-heads. "Total Opex" sums
# those 6 sub-head columns, "Grand Total" sums Capital Expenses + that Total
# Opex, both computed per row rather than read from raw data.
OPEX_SUB_ROWS = ["prog", "prtnr", "ppl", "trv", "std", "oth opex"]
CATEGORY_COLUMNS = ["capex", *OPEX_SUB_ROWS]
CATEGORY_LABELS = {
    "capex": "Capital Expenses",
    "prog": "Program Expenses",
    "prtnr": "Partner Expenses",
    "ppl": "People Expenses",
    "trv": "Travel Expenses",
    "std": "Student Support Expenses",
    "oth opex": "Other Operating Expenses",
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

# Operating Expenses (the table column group) spans 2 real head_of_expense
# values - OPERATING  EXPENSES (Program/Partner/People/Travel/Student
# Support) and OTHER  OPERATING EXPENSES (oth opex) are two distinct heads
# in the real Expenses doctype data, both shown together under this one
# column group per the business's own request to fold "Other Operating" in
# as one of Operating Expenses' own sub-heads rather than a 3rd main head.
MAIN_HEADS = [
    {"key": "capex", "label": "Capital Expenses", "head_names": ["CAPITAL  EXPENSES"], "columns": ["capex"]},
    {"key": "opex", "label": "Operating Expenses", "head_names": ["OPERATING  EXPENSES", "OTHER  OPERATING EXPENSES"], "columns": OPEX_SUB_ROWS},
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
@guest_api
def get_trial_balance_from_erp(fiscal_year, accounting_period):
    if is_direct_http_call(get_trial_balance_from_erp) and "System Manager" not in frappe.get_roles():
        frappe.throw("Not permitted", frappe.PermissionError)

    username, password = get_peoplesoft_prod_credentials()

    if not username or not password:
        frappe.throw("ERP credentials are not configured")

    cache_key = f"budget_mis:trial_balance:{fiscal_year}:{accounting_period}"
    was_cached = frappe.cache().get_value(cache_key) is not None

    start = frappe.utils.now_datetime()
    result = cache_with_single_flight(
        cache_key,
        fetch_fn=lambda: fetch_trial_balance_from_erp_raw(fiscal_year, accounting_period),
        is_cacheable=lambda result: result.get("status") == "success",
        expires_in_sec=get_actuals_cache_duration_seconds(),
    )
    duration_ms = int((frappe.utils.now_datetime() - start).total_seconds() * 1000)

    log_call(
        call_type="Fetch",
        fiscal_year=fiscal_year,
        accounting_period=accounting_period,
        cache_result="Hit" if was_cached else "Miss (fetched)",
        status="Success" if result.get("status") == "success" else "Failed",
        duration_ms=duration_ms,
        source="get_trial_balance_from_erp",
        error_message=result.get("error") if result.get("status") != "success" else None,
    )

    if result.get("status") != "success":
        return {
            "status": result.get("status", "failed"),
            "fiscal_year": fiscal_year,
            "accounting_period": accounting_period,
            "error": result.get("error"),
        }

    rows = result.get("data", [])

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "table": build_trial_balance_table(rows),
    }


# Diagnostic passthrough - returns the untouched PeopleSoft rows for one
# fiscal_year/accounting_period exactly as Z_MIS_TB_BY_PERIOD sent them
# (business_unit/account/deptid/operating_unit/posted_total_amt, lower-
# cased tag names, no remapping/pivoting at all), for inspecting the real
# field names/values directly (e.g. confirming whether a given
# accounting_period value shows up in this query's response at all) rather
# than only ever seeing them already resolved into the Trial Balance Check
# table's own shape. Same cache key as get_trial_balance_from_erp above, so
# calling both for the same fiscal_year/accounting_period only ever
# triggers one real ERP fetch between them, whichever is called first -
# and same System-Manager-only + ERP-credentials-configured gating, since
# this is still real org-wide financial data, just unprocessed.
@guest_api
def get_trial_balance_raw_from_erp(fiscal_year, accounting_period):
    if is_direct_http_call(get_trial_balance_raw_from_erp) and "System Manager" not in frappe.get_roles():
        frappe.throw("Not permitted", frappe.PermissionError)

    username, password = get_peoplesoft_prod_credentials()

    if not username or not password:
        frappe.throw("ERP credentials are not configured")

    cache_key = f"budget_mis:trial_balance:{fiscal_year}:{accounting_period}"
    was_cached = frappe.cache().get_value(cache_key) is not None

    start = frappe.utils.now_datetime()
    result = cache_with_single_flight(
        cache_key,
        fetch_fn=lambda: fetch_trial_balance_from_erp_raw(fiscal_year, accounting_period),
        is_cacheable=lambda result: result.get("status") == "success",
        expires_in_sec=get_actuals_cache_duration_seconds(),
    )
    duration_ms = int((frappe.utils.now_datetime() - start).total_seconds() * 1000)

    log_call(
        call_type="Fetch",
        fiscal_year=fiscal_year,
        accounting_period=accounting_period,
        cache_result="Hit" if was_cached else "Miss (fetched)",
        status="Success" if result.get("status") == "success" else "Failed",
        duration_ms=duration_ms,
        source="get_trial_balance_raw_from_erp",
        error_message=result.get("error") if result.get("status") != "success" else None,
    )

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
def build_trial_balance_table(rows):
    unit_labels = _get_unit_labels()
    gl_to_expense = _get_gl_code_expenses()

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

        # (category) -> summed amount, for this unit's column cells.
        totals = {}
        for r in unit_rows:
            expense = gl_to_expense.get(str(r.get("gl_code") or "").strip())
            category = _category_for_expense(expense) if expense else None
            if category not in CATEGORY_COLUMNS:
                continue
            totals[category] = totals.get(category, 0) + (r.get("amount") or 0)

        values = {c: round(totals.get(c, 0), 2) or None for c in CATEGORY_COLUMNS}
        total_opex = round(sum(totals.get(c, 0) for c in OPEX_SUB_ROWS), 2)
        grand_total = round(totals.get("capex", 0) + total_opex, 2)
        values["total opex"] = total_opex or None
        values["grand total"] = grand_total or None

        table_rows.append({
            "unit": unit_labels.get(bu, bu),
            "values": values,
            "tree": _build_unit_drilldown_tree(unit_rows, gl_to_expense),
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
    columns.append({"key": "grand total", "label": "Total"})
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
    if not category and head in ("OPERATING  EXPENSES", "OTHER  OPERATING EXPENSES"):
        category = "oth opex"
    return category


# Builds the 4-level drill-down tree for one unit's GL lines, matching
# budget_actuals_combined.py's own _build_expense_structure shape exactly
# (head_of_expense -> sub_head_of_expense -> item named by type_of_expense,
# carrying sequence_id -> that item's own real GL codes as its `items`) so
# it opens directly in the shared BudgetDrilldownModal with no reshaping on
# the frontend. Unlike the real Budget vs Actuals flow (which fetches the
# GL-code level on demand via get_actual_gl_breakup), every GL line is
# already in hand here, so the whole tree - all 4 levels - is built
# up-front in one pass.
def _build_unit_drilldown_tree(unit_rows, gl_to_expense):
    heads = {}
    for r in unit_rows:
        gl_code = str(r.get("gl_code") or "").strip()
        expense = gl_to_expense.get(gl_code)
        if not expense:
            continue

        head_name = expense.head_of_expense
        sub_head_name = expense.sub_head_of_expense
        type_name = expense.type_of_expense
        amount = r.get("amount") or 0

        head = heads.setdefault(head_name, {"name": head_name, "sub_heads": {}, "ytd": 0})
        head["ytd"] += amount

        sub_head = head["sub_heads"].setdefault(sub_head_name, {"name": sub_head_name, "items": {}, "ytd": 0})
        sub_head["ytd"] += amount

        item = sub_head["items"].setdefault(
            type_name,
            {"name": type_name, "sequence_id": expense.sequence_id, "gl_lines": {}, "ytd": 0},
        )
        item["ytd"] += amount

        # Keyed by gl_code (not appended as a new line every time) so the
        # SAME GL code seen across several units in `unit_rows` (e.g. when
        # this is called with every unit's rows at once for the
        # consolidated/column-header drill-downs) sums into one GL line
        # instead of showing as several confusing duplicate-looking rows -
        # a no-op for a single unit's own tree, which never has more than
        # one row per GL code to begin with.
        gl_line = item["gl_lines"].setdefault(gl_code, {"account": r.get("account") or "", "ytd": 0})
        gl_line["ytd"] += amount

    return [{
        "name": head["name"],
        "ytd": round(head["ytd"], 2),
        "sub_heads": [{
            "name": sub_head["name"],
            "ytd": round(sub_head["ytd"], 2),
            "items": [{
                "name": item["name"],
                "sequence_id": item["sequence_id"],
                "ytd": round(item["ytd"], 2),
                "items": [
                    {"name": f"{gl_code} - {line['account']}".strip(" -"), "ytd": round(line["ytd"], 2)}
                    for gl_code, line in item["gl_lines"].items()
                ],
            } for item in sub_head["items"].values()],
        } for sub_head in head["sub_heads"].values()],
    } for head in heads.values()]
