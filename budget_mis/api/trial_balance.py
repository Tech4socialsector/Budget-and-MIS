import json
import os

import frappe

from budget_mis.utils import guest_api
from budget_mis.api.helper import get_peoplesoft_prod_credentials

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

# Stand-in for the real PeopleSoft trial balance pull, which isn't wired up
# yet - a realistic {business_unit, category, amount} dataset built from a
# sample trial balance export, mapped onto each of the 10 real Unit doctype
# records (different amounts per unit), so the page/table can be exercised
# end-to-end before that API exists. Delete TEST_DATA_PATH and this fallback
# once _fetch_trial_balance_from_erp_raw does a real fetch.
TEST_DATA_PATH = os.path.join(os.path.dirname(__file__), "trial_balance_test_data.json")


def _load_test_rows():
    with open(TEST_DATA_PATH) as f:
        return json.load(f)


@guest_api
def get_trial_balance_from_erp(fiscal_year, accounting_period):
    username, password = get_peoplesoft_prod_credentials()

    if not username or not password:
        frappe.throw("ERP credentials are not configured")

    # TODO: once the real trial balance pull is wired up, build `rows` as a
    # list of {"business_unit": ..., "gl_code": ..., "account": ...,
    # "amount": ...} dicts (no "category"/"head"/"sub_head" - those, and the
    # whole per-unit drill-down tree, are resolved from gl_code inside
    # build_trial_balance_table via the real GL code Mapping -> Expenses
    # join) and pass them in instead of _load_test_rows().
    rows = _load_test_rows()

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "table": build_trial_balance_table(rows),
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
