from budget_mis.utils import guest_api
from budget_mis.api_1.helper import get_accounting_period_from_month, get_previous_financial_year
from budget_mis.api_1.grouped_actuals import group_actuals_ytd
from budget_mis.api_1.number_card_settings import get_combination_table_settings_test
from budget_mis.api_1.budget_actuals_combined import get_combined_actuals
from budget_mis.api_1.monthly_mis_drilldown import get_monthly_mis_drilldown_tree


def _safe_join(arr):
    return ",".join([str(x).strip() for x in (arr or []) if x])


# Rolls item ytd/total_posted_amt up into sub-head and head totals (in place), rounded to 2 decimals.
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


# Sums head-level ytd/total_posted_amt_ytd across all heads into a single grand total pair.
def _calculate_grand_total(actuals):
    grand_ytd = 0
    grand_actual = 0
    for head in actuals:
        grand_ytd += head.get("ytd", 0) or 0
        grand_actual += head.get("total_posted_amt_ytd", 0) or 0
    return {
        "grand_total_ytd": round(grand_ytd, 2),
        "grand_total_actual": round(grand_actual, 2)
    }


# Merges several units' head/sub-head/item trees into one, summing ytd/total_posted_amt at every matching node by name.
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


# Top-level Monthly MIS Breakup report: for each number-card table group, builds every entry's combined budget+actuals tree (one get_combined_actuals call per grouped unit), consolidates units together, appends a GRAND TOTAL row per entry and a CONSOLIDATED TOTAL (CAPEX/OPEX/overall) row per table group.
@guest_api
def get_monthly_mis_break_up(financial_year, month, table_name_filter=None, is_previous=None, _grouped_actuals_data=None):

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
                all_unit_actuals.append(actuals)

            consolidated = _consolidate_actuals(all_unit_actuals)
            totals = _calculate_grand_total(consolidated)

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
    current = get_monthly_mis_break_up(financial_year, month, table_name_filter)
    previous = get_monthly_mis_break_up(
        get_previous_financial_year(financial_year), month, table_name_filter
    )
    return {"current": current, "previous": previous}


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
    current_actuals_data = group_actuals_ytd(
        fiscal_year=current_formatted.get("fiscal_year"),
        accounting_period=current_formatted.get("accounting_period")
    ).get("data", [])

    previous_formatted = get_accounting_period_from_month(month, previous_financial_year)
    previous_actuals_data = group_actuals_ytd(
        fiscal_year=previous_formatted.get("fiscal_year"),
        accounting_period=previous_formatted.get("accounting_period")
    ).get("data", [])

    current_break_up = get_monthly_mis_break_up(
        financial_year, month, table_name_filter, _grouped_actuals_data=current_actuals_data
    )
    previous_break_up = get_monthly_mis_break_up(
        previous_financial_year, month, table_name_filter, _grouped_actuals_data=previous_actuals_data
    )

    drilldown_tree = get_monthly_mis_drilldown_tree(
        financial_year,
        month,
        drilldown_table_filter if drilldown_table_filter is not None else table_name_filter,
        _grouped_actuals_data=current_actuals_data,
    )

    return {
        "current": current_break_up,
        "previous": previous_break_up,
        "drilldown": drilldown_tree,
    }
