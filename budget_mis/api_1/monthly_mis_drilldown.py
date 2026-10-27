import frappe

from budget_mis.utils import guest_api
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


# Resolves one grouped_units entry (a single unit + its cost_centers/locations lists, from the "Define by Cost Centre and Location Code" leaf type) into its own head/sub-head/item actuals tree, and labels it by its cost-center/location pairing for display as a level-3 drill-down row.
def _leaf_unit_node(gu, financial_year, month, grouped_actuals_data):
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

    cc_label = ", ".join(gu.get("cost_centers") or []) or "-"
    loc_label = ", ".join(gu.get("locations") or []) or "-"
    label = f"{gu.get('unit') or '-'} · CC {cc_label} · Loc {loc_label}"

    return {
        "label": label,
        "unit": gu.get("unit"),
        "cost_centers": gu.get("cost_centers") or [],
        "locations": gu.get("locations") or [],
        "actuals": actuals,
        "children": [],
    }


# Walks a resolve_grouped_units_tree() node bottom-up, building a drill-down node at every level: a leaf ("Define by Cost Centre and Location Code") node becomes one row per grouped_units entry (level 3/4 - a single unit+cost-center+location slice, with its own line-item actuals); a "Define by Card Mapping" node recurses into each child, then sums all descendants' actuals together via _consolidate_actuals into its own node's "actuals" (so every level, from the top-level card down to each cost-center+location pair, carries both its own totals AND its children for the next drill-down step).
def _build_drilldown_node(tree_node, financial_year, month, grouped_actuals_data):
    if tree_node["children"]:
        children = [
            _build_drilldown_node(child, financial_year, month, grouped_actuals_data)
            for child in tree_node["children"]
        ]
        actuals = _consolidate_actuals([c["actuals"] for c in children])
        return {
            "label": tree_node["label"],
            "settings_doc": tree_node["settings_doc"],
            "actuals": actuals,
            "children": children,
        }

    leaf_children = [
        _leaf_unit_node(gu, financial_year, month, grouped_actuals_data)
        for gu in tree_node["grouped_units"]
    ]
    actuals = _consolidate_actuals([c["actuals"] for c in leaf_children])
    return {
        "label": tree_node["label"],
        "settings_doc": tree_node["settings_doc"],
        "actuals": actuals,
        "children": leaf_children,
    }


# Top-level entry point: for every card tagged under table_name_filter, resolves its full sub-item hierarchy (card -> sub-items -> ... -> cost-center+location pairs) with EVERY level's own actuals computed bottom-up from the same per-leaf get_combined_actuals calls get_monthly_mis_break_up already makes - no actuals are re-queried per level, only summed in memory - so a Vue drill-down UI can navigate from a card's total down to a single cost-center+location's line items without any further API calls.
@guest_api
def get_monthly_mis_drilldown_tree(financial_year, month, table_name_filter=None, is_previous=None, _grouped_actuals_data=None):

    if is_previous == 1:
        financial_year = get_previous_financial_year(financial_year)

    raw_settings = get_combination_table_settings_test(table_name_filter)

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
            node = _build_drilldown_node(tree, financial_year, month, grouped_actuals_data)
            node["table_name"] = table_name
            node["is_this_sub_item"] = entry.get("combination_settings", {}).get("is_this_sub_item")
            node["sequence_id"] = entry.get("combination_settings", {}).get("sequence_id")
            result[table_name].append(node)

    return result
