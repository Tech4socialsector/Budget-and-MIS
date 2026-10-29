import frappe

from budget_mis.utils import guest_api, get_allowed_units
from budget_mis.api.response_crypto import is_direct_http_call
from budget_mis.api_1.helper import get_accounting_period_from_month, get_previous_financial_year
from budget_mis.api_1.grouped_actuals import group_actuals_ytd
from budget_mis.api_1.number_card_settings import get_combination_table_settings_test, resolve_grouped_units_tree
from budget_mis.api_1.budget_actuals_combined import get_combined_actuals


def _safe_join(arr):
    return ",".join([str(x).strip() for x in (arr or []) if x])


# Rolls item ytd/total_posted_amt up into sub-head and head totals (in place), rounded to 2 decimals - same shape/behavior as monthly_mis.py's own _calculate_totals.
def _calculate_totals(actuals):
    for head in actuals:
        total_ytd = 0
        total_actual = 0
        if head.get("sub_heads"):
            for sub in head.get("sub_heads", []):
                sub_ytd = 0
                sub_actual = 0
                for item in sub.get("items", []):
                    sub_ytd += item.get("ytd", 0) or 0
                    sub_actual += item.get("total_posted_amt", 0) or 0
                sub["ytd"] = round(sub_ytd, 2)
                sub["total_posted_amt_ytd"] = round(sub_actual, 2)
                total_ytd += sub_ytd
                total_actual += sub_actual
        else:
            for item in head.get("items", []):
                total_ytd += item.get("ytd", 0) or 0
                total_actual += item.get("total_posted_amt", 0) or 0
        head["ytd"] = round(total_ytd, 2)
        head["total_posted_amt_ytd"] = round(total_actual, 2)
    return actuals


# Merges several units' head/sub-head/item trees into one, summing ytd/total_posted_amt at every matching node by name - same logic as monthly_mis.py's own _consolidate_actuals.
def _consolidate_actuals(all_unit_actuals):
    head_map = {}
    for unit_data in all_unit_actuals:
        for head in unit_data:
            key = head["name"]
            if key not in head_map:
                head_map[key] = {
                    "name": head["name"],
                    "sequence_id": head["sequence_id"],
                    "sub_heads": [],
                    "items": [],
                    "ytd": 0,
                    "total_posted_amt_ytd": 0
                }
            head_map[key]["ytd"] += head.get("ytd", 0)
            head_map[key]["total_posted_amt_ytd"] += head.get("total_posted_amt_ytd", 0)

            if head.get("sub_heads"):
                sub_map = {s["name"]: s for s in head_map[key]["sub_heads"]}
                for sub in head.get("sub_heads", []):
                    if sub["name"] not in sub_map:
                        new_sub = {
                            "name": sub["name"],
                            "sequence_id": sub["sequence_id"],
                            "items": [],
                            "ytd": 0,
                            "total_posted_amt_ytd": 0
                        }
                        head_map[key]["sub_heads"].append(new_sub)
                        sub_map[sub["name"]] = new_sub
                    sub_map[sub["name"]]["ytd"] += sub.get("ytd", 0)
                    sub_map[sub["name"]]["total_posted_amt_ytd"] += sub.get("total_posted_amt_ytd", 0)
                    item_map = {i["name"]: i for i in sub_map[sub["name"]]["items"]}
                    for item in sub.get("items", []):
                        if item["name"] not in item_map:
                            new_item = {
                                "name": item["name"],
                                "sequence_id": item["sequence_id"],
                                "gl_code": item.get("gl_code"),
                                "ytd": 0,
                                "total_posted_amt": 0
                            }
                            sub_map[sub["name"]]["items"].append(new_item)
                            item_map[item["name"]] = new_item
                        item_map[item["name"]]["ytd"] += item.get("ytd", 0)
                        item_map[item["name"]]["total_posted_amt"] += item.get("total_posted_amt", 0)
            else:
                item_map = {i["name"]: i for i in head_map[key]["items"]}
                for item in head.get("items", []):
                    if item["name"] not in item_map:
                        new_item = {
                            "name": item["name"],
                            "sequence_id": item["sequence_id"],
                            "gl_code": item.get("gl_code"),
                            "ytd": 0,
                            "total_posted_amt": 0
                        }
                        head_map[key]["items"].append(new_item)
                        item_map[item["name"]] = new_item
                    item_map[item["name"]]["ytd"] += item.get("ytd", 0)
                    item_map[item["name"]]["total_posted_amt"] += item.get("total_posted_amt", 0)

    return list(head_map.values())


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
    actuals = _calculate_totals(actuals)

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


# Walks a resolve_grouped_units_tree() node bottom-up, building a drill-down node at every level: a "Define by Card Mapping" node recurses into each child, then sums all descendants' actuals together via _consolidate_actuals into its own node's "actuals". A leaf ("Define by Cost Centre and Location Code") node is TWO levels: the leaf itself gets its own total from grouped_units (merged by unit - the same math get_monthly_mis_break_up already verifies), but its drill-down children come from grouped_rows (one real cost_center+location_code pair per row, NOT merged) so a card with e.g. 3 cost centers x 3 locations shows all 9 real combinations instead of one collapsed row - each with its own line items. Every level, from the top-level card down to a single raw row, carries both its own totals AND its children for the next drill-down step.
def _build_drilldown_node(tree_node, financial_year, month, grouped_actuals_data, allowed_units=None):
    if tree_node["children"]:
        children = [
            _build_drilldown_node(child, financial_year, month, grouped_actuals_data, allowed_units)
            for child in tree_node["children"]
        ]
        actuals = _consolidate_actuals([c["actuals"] for c in children])
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
    actuals = _consolidate_actuals([n["actuals"] for n in unit_nodes])

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
