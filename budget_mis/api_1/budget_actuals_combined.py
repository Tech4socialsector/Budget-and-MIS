import copy
from decimal import Decimal, ROUND_HALF_UP

import frappe

from budget_mis.api_1.budget_summary import get_budget_ytd_by_sequence


def _to_decimal(value):
    try:
        return Decimal(str(value or 0))
    except Exception:
        return Decimal("0")


def _to_float(value):
    return float(value.quantize(Decimal("0.01"), ROUND_HALF_UP))


def _to_list(value):
    if value is None:
        return None
    if isinstance(value, str):
        return [v.strip() for v in value.split(",") if v.strip()]
    if isinstance(value, (list, tuple)):
        return [str(v).strip() for v in value if v]
    return None


_MOVE_UNDER_OPERATING = [
    "OTHER  OPERATING EXPENSES",
    "Medical Expenses"
]

_CAPITAL_HEAD = "CAPITAL  EXPENSES"
_OPERATING_HEAD = "OPERATING  EXPENSES"
_COVID_HEAD = "COVID SUPPORT"

# Process-local cache for the head/sub-head/item skeleton built from the
# Expenses doctype - pure master data with no dependency on financial_year/
# unit/cost_center/etc, but get_combined_actuals previously rebuilt it from
# scratch (a frappe.get_all + nested dict construction + sort) on EVERY
# call, and this function is called once per grouped_units row - a single
# Monthly MIS page load fans out to ~1900 get_combined_actuals calls
# (confirmed via profiling: ~12s of a warm-cache page load was this
# function, ~8s of that in redundant Expenses queries alone). Cached in a
# plain module-level dict (not frappe.cache(), since this never needs to be
# shared across workers/processes - each worker rebuilds it once on first
# use and keeps it for the worker's lifetime) and invalidated whenever an
# Expenses doc is saved/deleted (see startup.py's
# clear_expense_structure_cache, wired via hooks.py doc_events), so an edit
# to the Expenses master takes effect immediately rather than waiting for a
# worker restart. Every caller gets its OWN deep copy before mutating it
# (item["ytd"]/item["total_posted_amt"] etc below) - the cached skeleton
# itself is never mutated, so concurrent/sequential calls can never see
# each other's partially-filled totals.
_expense_structure_cache = {}


def _build_expense_structure():
    expense_rows = frappe.get_all(
        "Expenses",
        fields=[
            "head_of_expense",
            "sub_head_of_expense",
            "type_of_expense",
            "gl_code",
            "sequence_id"
        ],
        order_by="sequence_id asc"
    )

    heads = {}

    for row in expense_rows:

        head_name = (row.head_of_expense or "").strip()
        sub_name = (row.sub_head_of_expense or "").strip()
        expense_name = (row.type_of_expense or "").strip()
        seq = row.sequence_id or 9999

        if not head_name or not expense_name:
            continue

        if head_name in _MOVE_UNDER_OPERATING:
            sub_name = head_name
            head_name = _OPERATING_HEAD

        head_obj = heads.setdefault(head_name, {
            "name": head_name,
            "sequence_id": seq,
            "sub_heads": {},
            "items": [],
            "ytd": Decimal("0"),
            "total_posted_amt_ytd": Decimal("0")
        })

        item_data = {
            "name": expense_name,
            "sequence_id": seq,
            "gl_code": row.gl_code or "",
            "ytd": Decimal("0"),
            "total_posted_amt": Decimal("0")
        }

        if head_name in [_CAPITAL_HEAD, _COVID_HEAD]:
            head_obj["items"].append(item_data)
        else:
            if sub_name:
                sub_obj = head_obj["sub_heads"].setdefault(sub_name, {
                    "name": sub_name,
                    "sequence_id": seq,
                    "items": [],
                    "ytd": Decimal("0"),
                    "total_posted_amt_ytd": Decimal("0")
                })
                sub_obj["items"].append(item_data)
            else:
                head_obj["items"].append(item_data)

    structure = []

    for head in sorted(heads.values(), key=lambda x: x["sequence_id"]):
        head["sub_heads"] = sorted(
            head["sub_heads"].values(),
            key=lambda x: x["sequence_id"]
        )
        structure.append(head)

    return structure


def _get_expense_structure():
    site = frappe.local.site
    cached = _expense_structure_cache.get(site)
    if cached is not None:
        return cached
    structure = _build_expense_structure()
    _expense_structure_cache[site] = structure
    return structure


# doc_events on_update/on_trash hook target for "Expenses" (see hooks.py) -
# drops the in-process skeleton cache above so the next get_combined_actuals
# call on this worker rebuilds it from the now-current Expenses doctype.
def clear_expense_structure_cache(doc=None, method=None):
    _expense_structure_cache.pop(frappe.local.site, None)


# The merge point: builds one head/sub-head/item tree from the Expenses schema, fills "ytd" from get_budget_ytd_by_sequence (budget) and "total_posted_amt"/"total_posted_amt_ytd" from grouped_actuals_data (real ERP actuals, e.g. group_actuals_ytd's own output, pre-filtered to this unit/cost-center/location slice) side by side on the same nodes.
def get_combined_actuals(
    financial_year=None,
    month=None,
    unit=None,
    cost_center=None,
    location_code=None,
    erp_loc_value=None,
    erp_cost_center_value=None,
    grouped_actuals_data=None
):
    # Each call gets its own deep copy - the cached skeleton is never
    # mutated, so no two calls (sequential or concurrent) can ever see each
    # other's in-progress totals.
    structure = copy.deepcopy(_get_expense_structure())

    # --------------------------------------------------
    # Budget Lookup
    # --------------------------------------------------

    budget_lookup = {}

    budget_data = get_budget_ytd_by_sequence(
        financial_year=financial_year,
        units=unit,
        cost_center=cost_center,
        location_code=location_code,
        month=month
    )

    for head in budget_data or []:
        for item in head.get("items", []):
            key = (item.get("sequence_id"), item.get("name"))
            budget_lookup[key] = _to_decimal(item.get("ytd"))

        for sub in head.get("sub_heads", []):
            for item in sub.get("items", []):
                key = (item.get("sequence_id"), item.get("name"))
                budget_lookup[key] = _to_decimal(item.get("ytd"))

    # --------------------------------------------------
    # Actual Lookup (filtered to this unit/cost-center/location slice)
    # --------------------------------------------------

    units = set(_to_list(unit) or [])
    ccs = set(_to_list(erp_cost_center_value) or [])
    locs = set(_to_list(erp_loc_value) or [])

    filtered_data = grouped_actuals_data or []

    if units:
        filtered_data = [d for d in filtered_data if d.get("business_unit") in units]

    if ccs:
        filtered_data = [d for d in filtered_data if d.get("deptid") in ccs]

    if locs:
        filtered_data = [d for d in filtered_data if d.get("operating_unit") in locs]

    actual_lookup = {}

    for row in filtered_data:
        key = (
            row.get("sequence_id"),
            row.get("type_of_expense")
        )
        actual_lookup[key] = actual_lookup.get(key, Decimal("0")) + _to_decimal(
            row.get("total_posted_amt")
        )

    # --------------------------------------------------
    # Inject Budget + Actual Totals onto the same nodes
    # --------------------------------------------------

    for head in structure:

        head_budget_total = Decimal("0")
        head_actual_total = Decimal("0")

        for item in head["items"]:
            key = (item["sequence_id"], item["name"])

            item["ytd"] = budget_lookup.get(key, Decimal("0"))
            item["total_posted_amt"] = actual_lookup.get(key, Decimal("0"))

            head_budget_total += item["ytd"]
            head_actual_total += item["total_posted_amt"]

        for sub in head["sub_heads"]:

            sub_budget_total = Decimal("0")
            sub_actual_total = Decimal("0")

            for item in sub["items"]:
                key = (item["sequence_id"], item["name"])

                item["ytd"] = budget_lookup.get(key, Decimal("0"))
                item["total_posted_amt"] = actual_lookup.get(key, Decimal("0"))

                sub_budget_total += item["ytd"]
                sub_actual_total += item["total_posted_amt"]

            sub["ytd"] = sub_budget_total
            sub["total_posted_amt_ytd"] = sub_actual_total

            head_budget_total += sub_budget_total
            head_actual_total += sub_actual_total

        head["ytd"] = head_budget_total
        head["total_posted_amt_ytd"] = head_actual_total

    # --------------------------------------------------
    # Convert Decimal -> float for JSON serialization
    # --------------------------------------------------

    for head in structure:

        head["ytd"] = _to_float(head["ytd"])
        head["total_posted_amt_ytd"] = _to_float(head["total_posted_amt_ytd"])

        for item in head["items"]:
            item["ytd"] = _to_float(item["ytd"])
            item["total_posted_amt"] = _to_float(item["total_posted_amt"])

        for sub in head["sub_heads"]:
            sub["ytd"] = _to_float(sub.get("ytd", Decimal("0")))
            sub["total_posted_amt_ytd"] = _to_float(sub.get("total_posted_amt_ytd", Decimal("0")))

            for item in sub["items"]:
                item["ytd"] = _to_float(item["ytd"])
                item["total_posted_amt"] = _to_float(item["total_posted_amt"])

    return structure
