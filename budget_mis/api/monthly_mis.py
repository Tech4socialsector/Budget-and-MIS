import frappe

from budget_mis.utils import guest_api, get_allowed_units
from budget_mis.api.response_crypto import is_direct_http_call
from budget_mis.api.helper import get_accounting_period_from_month, get_previous_financial_year, _safe_join, calculate_totals, calculate_grand_total, consolidate_actuals
from budget_mis.api.grouped_actuals import group_actuals_ytd
from budget_mis.api.number_card_settings import get_combination_table_settings_test, resolve_grouped_units_tree
from budget_mis.api.budget_actuals_combined import get_combined_actuals


# Top-level Monthly MIS Breakup report: for each number-card table group, builds every entry's combined budget+actuals tree (one get_combined_actuals call per grouped unit), consolidates units together, appends a GRAND TOTAL row per entry and a CONSOLIDATED TOTAL (CAPEX/OPEX/overall) row per table group.
@guest_api
def get_monthly_mis_break_up(financial_year, month, table_name_filter=None, is_previous=None, _grouped_actuals_data=None, _force_scope_to_allowed_units=None):

    if is_previous == 1:
        financial_year = get_previous_financial_year(financial_year)

    raw_settings = get_combination_table_settings_test(table_name_filter)

    # get_combination_table_settings_test's grouped_units come from admin-
    # configured report settings, not from anything the caller chose - on a
    # genuine direct HTTP call this restricts each entry's own fan-out to
    # only the units the calling user is allowed to see (same
    # require_unit_access/get_allowed_units convention used everywhere else
    # in this app), rather than always returning the full org-wide
    # breakdown regardless of the caller's own Finance user access.
    #
    # is_direct_http_call(get_monthly_mis_break_up) alone is NOT enough:
    # when this function is reached through a public wrapper (e.g.
    # get_monthly_mis_break_up_with_prev_year, get_monthly_mis_page_data),
    # frappe.local.form_dict.cmd holds the WRAPPER's dotted path, not this
    # function's own - so that check silently returns False and the real
    # HTTP request goes unscoped even though it IS one. Every public
    # wrapper below passes its own is_direct_http_call(<itself>) result
    # down via _force_scope_to_allowed_units instead of relying on this
    # function to re-derive it from a cmd name it was never dispatched
    # under. A plain internal caller (no wrapper in between, like
    # get_monthly_mis_page_data's own direct fan-out) leaves this None and
    # falls back to its own (correct, False) is_direct_http_call check.
    if _force_scope_to_allowed_units is not None:
        scope_to_allowed_units = _force_scope_to_allowed_units
    else:
        scope_to_allowed_units = is_direct_http_call(get_monthly_mis_break_up)
    allowed_units = get_allowed_units() if scope_to_allowed_units else None

    formatted = get_accounting_period_from_month(month, financial_year)
    if _grouped_actuals_data is not None:
        grouped_actuals_data = _grouped_actuals_data
    else:
        grouped_actuals_data = group_actuals_ytd(
            fiscal_year=formatted.get("fiscal_year"),
            accounting_period=formatted.get("accounting_period")
        ).get("data", [])

    result = {}

    if not isinstance(raw_settings, dict):
        return result

    for table_name, entries in raw_settings.items():

        result[table_name] = []

        overall_ytd = 0
        overall_actual = 0
        capex_total_ytd = 0
        capex_total_actual = 0
        opex_total_ytd = 0
        opex_total_actual = 0

        for entry in entries:

            combo = entry.get("combination_settings", {})
            seq_id = combo.get("sequence_id", 0)
            is_sub = combo.get("is_this_sub_item", 0)

            all_unit_actuals = []

            for gu in entry.get("grouped_units", []):
                if allowed_units is not None and str(gu.get("unit")) not in allowed_units:
                    continue
                actuals = get_combined_actuals(
                    financial_year=financial_year,
                    month=month,
                    unit=gu.get("unit"),
                    cost_center=_safe_join(gu.get("cost_centers")),
                    location_code=_safe_join(gu.get("locations")),
                    erp_cost_center_value=_safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=_safe_join(gu.get("locations_erp")),
                    grouped_actuals_data=grouped_actuals_data
                )
                actuals = calculate_totals(actuals)
                all_unit_actuals.append(actuals)

            consolidated = consolidate_actuals(all_unit_actuals)
            totals = calculate_grand_total(consolidated)

            if is_sub == 0:
                overall_ytd += totals["grand_total_ytd"]
                overall_actual += totals["grand_total_actual"]
                for head in consolidated:
                    name = (head.get("name") or "").upper()
                    if "CAPITAL" in name:
                        capex_total_ytd += head.get("ytd", 0)
                        capex_total_actual += head.get("total_posted_amt_ytd", 0)
                    elif "OPERATING" in name:
                        opex_total_ytd += head.get("ytd", 0)
                        opex_total_actual += head.get("total_posted_amt_ytd", 0)

            consolidated.append({
                "name": "GRAND TOTAL",
                "sequence_id": 9999,
                "sub_heads": [],
                "items": [],
                "ytd": totals["grand_total_ytd"],
                "total_posted_amt_ytd": totals["grand_total_actual"]
            })

            result[table_name].append({
                "settings_doc": entry.get("settings_doc"),
                "label": entry.get("label"),
                "table_name": table_name,
                "sequence_id": seq_id,
                "is_this_sub_item": is_sub,
                "actuals": consolidated
            })

        result[table_name].append({
            "settings_doc": "CONSOLIDATED",
            "label": "CONSOLIDATED TOTAL",
            "table_name": table_name,
            "sequence_id": 9999,
            "is_this_sub_item": 0,
            "actuals": [
                {
                    "name": "CAPEX TOTAL",
                    "ytd": round(capex_total_ytd, 2),
                    "total_posted_amt_ytd": round(capex_total_actual, 2)
                },
                {
                    "name": "OPEX TOTAL",
                    "ytd": round(opex_total_ytd, 2),
                    "total_posted_amt_ytd": round(opex_total_actual, 2)
                },
                {
                    "name": "OVERALL GRAND TOTAL",
                    "ytd": round(overall_ytd, 2),
                    "total_posted_amt_ytd": round(overall_actual, 2)
                }
            ]
        })

    return result


# Single-call variant for pages (e.g. the Monthly MIS Vue page) that need
# both the current and previous financial year's breakup side by side for
# a YoY comparison - runs get_monthly_mis_break_up for financial_year and
# again for get_previous_financial_year(financial_year), as one HTTP round
# trip instead of two.
@guest_api
def get_monthly_mis_break_up_with_prev_year(financial_year, month, table_name_filter=None):
    scope = is_direct_http_call(get_monthly_mis_break_up_with_prev_year)
    current = get_monthly_mis_break_up(financial_year, month, table_name_filter, _force_scope_to_allowed_units=scope)
    previous = get_monthly_mis_break_up(
        get_previous_financial_year(financial_year), month, table_name_filter, _force_scope_to_allowed_units=scope
    )
    return {"current": current, "previous": previous}


# Resolves one grouped-unit-shaped entry (a unit + its cost_centers/locations
# lists - either a merged-by-unit grouped_units entry, or a single-row
# grouped_rows entry with exactly one cost_center/location_code each) into
# its own head/sub-head/item actuals tree, and labels it by its
# cost-center/location pairing for display as a drill-down row.
def _leaf_entity_node(gu, financial_year, month, grouped_actuals_data):
    actuals = get_combined_actuals(
        financial_year=financial_year,
        month=month,
        unit=gu.get("unit"),
        cost_center=_safe_join(gu.get("cost_centers")),
        location_code=_safe_join(gu.get("locations")),
        erp_cost_center_value=_safe_join(gu.get("cost_centers_erp")),
        erp_loc_value=_safe_join(gu.get("locations_erp")),
        grouped_actuals_data=grouped_actuals_data
    )
    actuals = calculate_totals(actuals)

    # grouped_rows (one raw row per entry - always exactly one cost_center
    # and one location_code, each with its own ERP code and description)
    # gets the "Unit - Description(ERP code) - Description(ERP code)" label
    # format. A merged grouped_units entry (multiple cost centers/locations
    # folded into one unit-wide total, used for intermediate-level totals,
    # never shown as its own row) falls back to the old comma-joined format
    # since there's no single description/ERP code to attach per value.
    ccs = gu.get("cost_centers") or []
    locs = gu.get("locations") or []
    ccs_erp = gu.get("cost_centers_erp") or []
    locs_erp = gu.get("locations_erp") or []
    cc_desc = gu.get("cost_center_description")
    loc_desc = gu.get("location_code_description")

    if len(ccs) <= 1 and len(locs) <= 1:
        cc_name = cc_desc or (ccs[0] if ccs else "-")
        cc_part = f"{cc_name}({ccs_erp[0]})" if ccs_erp else cc_name
        loc_name = loc_desc or (locs[0] if locs else "-")
        loc_part = f"{loc_name}({locs_erp[0]})" if locs_erp else loc_name
        label = f"{gu.get('unit') or '-'} - {cc_part} - {loc_part}"
    else:
        cc_label = ", ".join(ccs) or "-"
        loc_label = ", ".join(locs) or "-"
        if cc_desc:
            cc_label = f"{cc_label} ({cc_desc})"
        if loc_desc:
            loc_label = f"{loc_label} ({loc_desc})"
        label = f"{gu.get('unit') or '-'} · CC {cc_label} · Loc {loc_label}"

    return {
        "label": label,
        "unit": gu.get("unit"),
        "cost_centers": gu.get("cost_centers") or [],
        "locations": gu.get("locations") or [],
        "actuals": actuals,
        "children": [],
    }


# Walks a resolve_grouped_units_tree() node bottom-up, building a drill-down node at every level: a "Define by Card Mapping" node recurses into each child, then sums all descendants' actuals together via consolidate_actuals into its own node's "actuals". A leaf ("Define by Cost Centre and Location Code") node is TWO levels: the leaf itself gets its own total from grouped_units (merged by unit - the same math get_monthly_mis_break_up already verifies), but its drill-down children come from grouped_rows (one real cost_center+location_code pair per row, NOT merged) so a card with e.g. 3 cost centers x 3 locations shows all 9 real combinations instead of one collapsed row - each with its own line items. Every level, from the top-level card down to a single raw row, carries both its own totals AND its children for the next drill-down step.
def _build_drilldown_node(tree_node, financial_year, month, grouped_actuals_data, allowed_units=None):
    if tree_node["children"]:
        children = [
            _build_drilldown_node(child, financial_year, month, grouped_actuals_data, allowed_units)
            for child in tree_node["children"]
        ]
        actuals = consolidate_actuals([c["actuals"] for c in children])
        return {
            "label": tree_node["label"],
            "settings_doc": tree_node["settings_doc"],
            "actuals": actuals,
            "children": children,
        }

    # allowed_units is None for an admin/internal caller (no restriction);
    # for a scoped direct HTTP call it narrows this leaf-level card's own
    # grouped_units/grouped_rows fan-out to only units the calling user can
    # see - same convention as get_monthly_mis_break_up's own scoping.
    grouped_units = tree_node["grouped_units"]
    grouped_rows = tree_node["grouped_rows"]
    if allowed_units is not None:
        grouped_units = [gu for gu in grouped_units if str(gu.get("unit")) in allowed_units]
        grouped_rows = [row for row in grouped_rows if str(row.get("unit")) in allowed_units]

    unit_nodes = [
        _leaf_entity_node(gu, financial_year, month, grouped_actuals_data)
        for gu in grouped_units
    ]
    actuals = consolidate_actuals([n["actuals"] for n in unit_nodes])

    row_children = [
        _leaf_entity_node(row, financial_year, month, grouped_actuals_data)
        for row in grouped_rows
    ]
    return {
        "label": tree_node["label"],
        "settings_doc": tree_node["settings_doc"],
        "actuals": actuals,
        "children": row_children,
    }


# Top-level entry point: for every card tagged under table_name_filter, resolves its full sub-item hierarchy (card -> sub-items -> ... -> cost-center+location pairs) with EVERY level's own actuals computed bottom-up from the same per-leaf get_combined_actuals calls get_monthly_mis_break_up already makes - no actuals are re-queried per level, only summed in memory - so a Vue drill-down UI can navigate from a card's total down to a single cost-center+location's line items without any further API calls.
@guest_api
def get_monthly_mis_drilldown_tree(financial_year, month, table_name_filter=None, is_previous=None, _grouped_actuals_data=None, _force_scope_to_allowed_units=None):

    if is_previous == 1:
        financial_year = get_previous_financial_year(financial_year)

    raw_settings = get_combination_table_settings_test(table_name_filter)

    # See get_monthly_mis_break_up's own (longer) comment on
    # _force_scope_to_allowed_units - a public wrapper reaching this
    # function (e.g. get_monthly_mis_page_data) must pass its own
    # is_direct_http_call(<itself>) result down explicitly, since this
    # function's cmd-name check would otherwise silently miss a genuine
    # HTTP request dispatched under the wrapper's own name.
    if _force_scope_to_allowed_units is not None:
        scope_to_allowed_units = _force_scope_to_allowed_units
    else:
        scope_to_allowed_units = is_direct_http_call(get_monthly_mis_drilldown_tree)
    allowed_units = get_allowed_units() if scope_to_allowed_units else None

    formatted = get_accounting_period_from_month(month, financial_year)
    if _grouped_actuals_data is not None:
        grouped_actuals_data = _grouped_actuals_data
    else:
        grouped_actuals_data = group_actuals_ytd(
            fiscal_year=formatted.get("fiscal_year"),
            accounting_period=formatted.get("accounting_period")
        ).get("data", [])

    result = {}

    if not isinstance(raw_settings, dict):
        return result

    for table_name, entries in raw_settings.items():
        result[table_name] = []
        for entry in entries:
            settings_doc_name = entry.get("settings_doc")
            if not settings_doc_name:
                continue
            doc = frappe.get_doc("Overview number cards settings", settings_doc_name)
            tree = resolve_grouped_units_tree(doc)
            node = _build_drilldown_node(tree, financial_year, month, grouped_actuals_data, allowed_units)
            node["table_name"] = table_name
            node["is_this_sub_item"] = entry.get("combination_settings", {}).get("is_this_sub_item")
            node["sequence_id"] = entry.get("combination_settings", {}).get("sequence_id")
            result[table_name].append(node)

    return result


# Combines get_monthly_mis_break_up_with_prev_year and
# get_monthly_mis_drilldown_tree into ONE call, fetching ERP actuals
# (group_actuals_ytd -> get_actuals_from_erp_month_wise, the real
# PeopleSoft HTTP call) exactly ONCE per period - once for financial_year,
# once for get_previous_financial_year(financial_year) - and passing each
# fetch's result into every function that needs that period via their own
# _grouped_actuals_data param, instead of each function independently
# re-fetching (or racing each other to fetch, if called concurrently - the
# bug this function replaces: the Vue page previously called the break-up
# and drill-down endpoints as two separate HTTP requests in parallel, both
# needing the SAME current-period actuals, so both could hit PeopleSoft at
# the same time before either's cache write landed). drilldown_table_filter
# narrows the (slower) drill-down tree computation to just the one table
# group that actually needs it (Monthly MIS Capex & Opex), while
# table_name_filter still covers every table the break-up/breakup-section
# data needs - the drill-down tree is never built for tables nothing
# navigates into.
@guest_api
def get_monthly_mis_page_data(financial_year, month, table_name_filter=None, drilldown_table_filter=None):
    previous_financial_year = get_previous_financial_year(financial_year)

    current_formatted = get_accounting_period_from_month(month, financial_year)
    previous_formatted = get_accounting_period_from_month(month, previous_financial_year)

    # Current-year and previous-year actuals are two INDEPENDENT ERP fetches
    # (different fiscal_year/accounting_period, so different cache keys).
    # These USED to run concurrently in their own threads to shorten this
    # page's own worst-case wall-clock time - but the real PeopleSoft
    # endpoint (api/erp_actuals.py's own _get_actuals_from_erp_month_wise_raw,
    # a single shared ERP server, each query scanning up to 100,000 rows)
    # cannot handle two of these heavy queries landing on it at once: under
    # concurrent load, BOTH requests slow down and the 100s wrapper timeout
    # trips before either one finishes (confirmed in production logs - a
    # TimeoutError on current_future.result(timeout=100), not a clean
    # ERP-side failure). Fetching one at a time is slower in the sum-of-both
    # sense, but each individual fetch actually completes within its own
    # normal (cached-hit-fast, cold-cache-up-to-120s) time instead of both
    # starving each other into timing out entirely.
    current_actuals_data = group_actuals_ytd(
        fiscal_year=current_formatted.get("fiscal_year"), accounting_period=current_formatted.get("accounting_period")
    ).get("data", [])
    previous_actuals_data = group_actuals_ytd(
        fiscal_year=previous_formatted.get("fiscal_year"), accounting_period=previous_formatted.get("accounting_period")
    ).get("data", [])

    scope = is_direct_http_call(get_monthly_mis_page_data)
    current_break_up = get_monthly_mis_break_up(
        financial_year, month, table_name_filter, _grouped_actuals_data=current_actuals_data, _force_scope_to_allowed_units=scope
    )
    previous_break_up = get_monthly_mis_break_up(
        previous_financial_year, month, table_name_filter, _grouped_actuals_data=previous_actuals_data, _force_scope_to_allowed_units=scope
    )

    drilldown_tree = get_monthly_mis_drilldown_tree(
        financial_year,
        month,
        drilldown_table_filter if drilldown_table_filter is not None else table_name_filter,
        _grouped_actuals_data=current_actuals_data,
        _force_scope_to_allowed_units=scope,
    )

    return {
        "current": current_break_up,
        "previous": previous_break_up,
        "drilldown": drilldown_tree,
    }
