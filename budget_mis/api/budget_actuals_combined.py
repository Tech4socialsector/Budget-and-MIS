from decimal import Decimal, ROUND_HALF_UP

import frappe

from budget_mis.api.budget_summary import get_budget_ytd_by_sequence


def _to_decimal(value):
    try:
        return Decimal(str(value or 0))
    except Exception:
        return Decimal("0")


_ZERO = Decimal("0")


def _to_float(value):
    # Most leaf items in any single get_combined_actuals call are zero -
    # this unit/cost-center/location slice simply has no budget/actual
    # figure for most of the ~185 expense line items in the full skeleton.
    # Decimal.quantize() is real, measurable work (confirmed via profiling:
    # ~5.9M calls across a full Monthly MIS page, at 3.9s of the page's own
    # total time) - skipping it for the exact-zero case, which needs no
    # rounding at all, cuts that cost for the (large) majority of calls
    # without changing the ROUND_HALF_UP behavior for any actual non-zero
    # amount.
    if value == _ZERO:
        return 0.0
    return float(value.quantize(Decimal("0.01"), ROUND_HALF_UP))


def _to_list(value):
    if value is None:
        return None
    if isinstance(value, str):
        return [v.strip() for v in value.split(",") if v.strip()]
    if isinstance(value, (list, tuple)):
        return [str(v).strip() for v in value if v]
    return None


# Request-scoped index cache for grouped_actuals_data, keyed by id() of the
# list object itself - every call in a single page's fan-out (e.g.
# monthly_mis.py's own ~1900-call loop across all table sections) passes
# the EXACT SAME list object (fetched once at the top of
# get_monthly_mis_break_up/get_combined_actuals_report, never rebuilt per
# unit), so id() is a safe, cheap key for "have we already indexed this
# exact dataset" WITHIN one request. Previously, get_combined_actuals
# filtered this list (a linear scan over every row, three times - once per
# unit/cc/loc independently) FRESH on every one of those ~1900+ calls - the
# real dominant cost in a full page load, confirmed via profiling (a
# single table section alone fans out to ~1900 grouped-unit entries, and a
# full page has ~22 sections).
#
# Stored in frappe.local.request_cache (freshly recreated by Frappe itself
# on every request/job - see budget_summary.py's _get_cached_budget_ytd for
# the fuller explanation), NOT a plain module-level dict the way an
# earlier version of this cache was. That earlier version's own id()-keyed
# module-level dict was a REAL, confirmed cross-request data-leakage bug,
# not just a theoretical one: CPython reuses a freed short-lived list's
# memory address for a later allocation extremely often in practice
# (confirmed directly - 99,999 of 100,000 same-shaped short-lived list
# allocations in a tight loop reused the immediately-preceding address).
# A module-level cache never cleared between requests could therefore
# serve request B a cache "hit" that was actually request A's own index -
# built from a different period's, or a different user's, actuals data -
# purely because B's freshly-allocated grouped_actuals_data list happened
# to land at the same address A's already-freed list used. Scoping this to
# frappe.local.request_cache makes that impossible: the whole cache is
# wiped before any request could ever look up an id() left over from a
# previous one.
#
# Indexed by business_unit ALONE (not the full unit+cc+loc triple) into
# {business_unit: [row, row, ...]} - every real caller (monthly_mis.py's
# own per-grouped-unit loop, budget_vs_actual.py's get_combined_actuals_
# report) passes exactly ONE unit per call (a comma-joined multi-unit
# `unit` string is possible in principle but never actually used that way
# in this codebase's own call sites), so splitting by unit alone cuts each
# call's own working set from "every row in the whole dataset" (5,000+)
# down to just that one unit's own rows (typically a few hundred) BEFORE
# the existing cc/loc filtering runs over that already-small subset - the
# same "index by the thing that's almost always singular per call" idea
# already applied to Finance Budget rows in budget_summary.py's
# _get_finance_budget_rows_by_unit.
_INDEX_CACHE_BUCKET = "budget_mis_grouped_actuals_index"


def _index_grouped_actuals_data(grouped_actuals_data):
    cache_key = id(grouped_actuals_data)
    bucket = frappe.local.request_cache[_INDEX_CACHE_BUCKET]
    cached = bucket.get(cache_key)
    if cached is not None:
        return cached

    rows_by_unit = {}
    for row in grouped_actuals_data or []:
        rows_by_unit.setdefault(row.get("business_unit"), []).append(row)

    # Keep this bucket from growing across a single request serving more
    # than one distinct grouped_actuals_data dataset (e.g.
    # get_monthly_mis_page_data's own current-year + previous-year calls,
    # each with their own list) - only the single most recent dataset is
    # ever needed at a time within one request, so this clears rather than
    # accumulating entries for the request's remaining lifetime.
    bucket.clear()
    bucket[cache_key] = rows_by_unit
    return rows_by_unit


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


# Request-scoped result cache for get_combined_actuals, keyed by its own
# call signature (plus id(grouped_actuals_data), since the same params can
# legitimately mean different data across different periods/requests).
# Confirmed via direct instrumentation that a single Monthly MIS page load
# calls get_combined_actuals 15,321 times for only 1,249 DISTINCT call
# signatures - a ~12x duplication ratio, since the same (unit, cost_center,
# location_code) combination is routinely asked for by more than one table
# section on the same page (e.g. a unit's own breakdown table AND a
# consolidated "Foundation Overall" table both ask for it).
#
# Stored in frappe.local.request_cache (frappe/__init__.py's init_request -
# a plain defaultdict(dict), freshly recreated by Frappe itself on every
# request/job) rather than a module-level dict keyed by id(frappe.local):
# frappe.local is ONE Local() object created at import time and reused for
# the worker's entire lifetime (confirmed directly - id(frappe.local) does
# NOT change between requests on the same worker), so a module-level cache
# keyed that way would never actually reset and would silently serve
# stale data (a sync job's/Finance Budget edit's new data invisible until
# the worker restarts) forever after the first request. request_cache IS
# genuinely request-scoped - this is the same mechanism Frappe's own
# frappe.utils.caching.request_cache decorator uses.
_CACHE_BUCKET = "budget_mis_combined_actuals"


def _copy_combined_actuals_structure(structure):
    # A cheap top-level copy, NOT a deep recursive one - every caller in
    # this codebase (calculate_totals, consolidate_actuals) only ever
    # reads or overwrites head["ytd"]/head["total_posted_amt_ytd"] and the
    # equivalent sub-head fields, never the nested items lists, so copying
    # each head/sub-head dict (so a caller's own field writes can never be
    # seen by another caller sharing the same cached result) is enough -
    # the items lists themselves are shared read-only.
    return [
        {
            **head,
            "sub_heads": [dict(sub) for sub in head["sub_heads"]],
        }
        for head in structure
    ]


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
    cache_key = (
        financial_year, month, unit, cost_center, location_code,
        erp_loc_value, erp_cost_center_value, id(grouped_actuals_data),
    )
    entries = frappe.local.request_cache[_CACHE_BUCKET]
    cached = entries.get(cache_key)
    if cached is not None:
        return _copy_combined_actuals_structure(cached)

    result = _build_combined_actuals(
        financial_year=financial_year,
        month=month,
        unit=unit,
        cost_center=cost_center,
        location_code=location_code,
        erp_loc_value=erp_loc_value,
        erp_cost_center_value=erp_cost_center_value,
        grouped_actuals_data=grouped_actuals_data,
    )
    entries[cache_key] = result
    return _copy_combined_actuals_structure(result)


def _build_combined_actuals(
    financial_year=None,
    month=None,
    unit=None,
    cost_center=None,
    location_code=None,
    erp_loc_value=None,
    erp_cost_center_value=None,
    grouped_actuals_data=None
):
    # Each call gets its own fresh structure - the cached skeleton is never
    # mutated, so no two calls (sequential or concurrent) can ever see each
    # other's in-progress totals. Rebuilt via a plain walk rather than
    # copy.deepcopy(): deepcopy's generic recursive/memoizing machinery is
    # far more expensive than directly constructing the (small, known-
    # shape) per-call dicts this function actually needs - confirmed as a
    # real, significant per-call cost via profiling on a page whose own
    # fan-out calls this 1,000+ times.
    structure = [
        {
            "name": head["name"],
            "sequence_id": head["sequence_id"],
            "items": [
                {
                    "name": item["name"],
                    "sequence_id": item["sequence_id"],
                    "gl_code": item["gl_code"],
                }
                for item in head["items"]
            ],
            "sub_heads": [
                {
                    "name": sub["name"],
                    "sequence_id": sub["sequence_id"],
                    "items": [
                        {
                            "name": item["name"],
                            "sequence_id": item["sequence_id"],
                            "gl_code": item["gl_code"],
                        }
                        for item in sub["items"]
                    ],
                }
                for sub in head["sub_heads"]
            ],
        }
        for head in _get_expense_structure()
    ]

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

    # Narrow to just this call's own unit(s) first via the pre-built index -
    # cuts the working set from the whole dataset (5,000+ rows) down to the
    # handful of rows belonging to the unit(s) actually being asked for,
    # before the existing cc/loc filters (unchanged semantics - independent
    # set-membership, ANDed together) run over that already-small subset.
    # When no unit filter is given at all (units is empty), every row is in
    # scope, exactly as before.
    if units:
        rows_by_unit = _index_grouped_actuals_data(grouped_actuals_data)
        filtered_data = [row for u in units for row in rows_by_unit.get(u, [])]
    else:
        filtered_data = grouped_actuals_data or []

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
