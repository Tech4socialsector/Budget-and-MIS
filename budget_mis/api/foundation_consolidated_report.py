from budget_mis.utils import guest_api
from budget_mis.api.actual_format import get_previous_financial_year
from budget_mis.api_1.number_card_settings import get_combination_table_settings_1
from budget_mis.api_1.budget_actuals_combined import get_combined_actuals

# Every function that used to live in this file (get_grouped_actuals_quarter_and_month_wise_total,
# format_api, the local get_combined_actuals/get_combination_table_settings_1/
# get_combination_table_settings_test/resolve_grouped_units/
# warn_on_overlapping_main_items, get_unit_wise_plan, get_foundation_overall,
# get_headcount, and a dead get_monthly_mis_break_up copy) has moved to
# budget_mis.api_1.foundation_consolidated, which FoundationConsolidated.vue
# now calls via 6 combined per-tab endpoints (get_ppt_page_data,
# get_summary_inr_page_data, etc.) instead of this file's old one-function-
# per-piece-of-data shape. Those api_1 versions also fixed a real
# over-counting bug in resolve_grouped_units (see
# api_1/number_card_settings.py's own comment) and added response-level
# caching - this file's old versions are gone, not duplicated.
#
# get_unit_wise_plan_budget is the one function that STAYS here: it's still
# called directly by BudgetDashboard.vue (a different page, out of scope for
# the Foundation Consolidated move), repointed below at the same api_1
# primitives everything else now uses instead of its own local copies.


@guest_api
def get_unit_wise_plan_budget(financial_year, month, table_name_filter=None):

    def safe_join(arr):
        return ",".join([str(x).strip() for x in (arr or []) if x])

    # ---------------- TOTAL CALCULATIONS ----------------

    def calculate_totals(actuals):

        for head in actuals:
            total_ytd = 0

            if head.get("sub_heads"):

                for sub in head.get("sub_heads", []):
                    sub_ytd = 0

                    for item in sub.get("items", []):
                        sub_ytd += item.get("ytd", 0) or 0

                    sub["ytd"] = round(sub_ytd, 2)
                    total_ytd += sub_ytd

                head["sub_heads"] = sorted(
                    head.get("sub_heads", []),
                    key=lambda x: x.get("sequence_id", 0)
                )

            else:
                for item in head.get("items", []):
                    total_ytd += item.get("ytd", 0) or 0

                head["items"] = sorted(
                    head.get("items", []),
                    key=lambda x: x.get("sequence_id", 0)
                )

            head["ytd"] = round(total_ytd, 2)

        return sorted(
            actuals,
            key=lambda x: x.get("sequence_id", 0)
        )

    def calculate_grand_total(actuals):

        grand_ytd = 0

        for head in actuals:
            grand_ytd += head.get("ytd", 0) or 0

        return {
            "grand_total_ytd": round(grand_ytd, 2)
        }

    # ---------------- CONSOLIDATION ----------------

    def consolidate_actuals(all_unit_actuals):

        head_map = {}

        for unit_data in all_unit_actuals:

            for head in unit_data:
                key = head["name"]

                if key not in head_map:
                    head_map[key] = {
                        "name": head["name"],
                        "sequence_id": head.get("sequence_id", 0),
                        "sub_heads": [],
                        "items": [],
                        "ytd": 0
                    }

                head_map[key]["ytd"] += head.get("ytd", 0)

                # ---------------- SUB HEADS ----------------

                if head.get("sub_heads"):

                    sub_map = {
                        s["name"]: s
                        for s in head_map[key]["sub_heads"]
                    }

                    for sub in head.get("sub_heads", []):

                        if sub["name"] not in sub_map:
                            new_sub = {
                                "name": sub["name"],
                                "sequence_id": sub.get("sequence_id", 0),
                                "items": [],
                                "ytd": 0
                            }

                            head_map[key]["sub_heads"].append(new_sub)
                            sub_map[sub["name"]] = new_sub

                        sub_map[sub["name"]]["ytd"] += sub.get("ytd", 0)

                        item_map = {
                            i["name"]: i
                            for i in sub_map[sub["name"]]["items"]
                        }

                        for item in sub.get("items", []):

                            if item["name"] not in item_map:
                                new_item = {
                                    "name": item["name"],
                                    "sequence_id": item.get("sequence_id", 0),
                                    "gl_code": item.get("gl_code"),
                                    "ytd": 0
                                }

                                sub_map[sub["name"]]["items"].append(new_item)
                                item_map[item["name"]] = new_item

                            item_map[item["name"]]["ytd"] += item.get("ytd", 0)

                        sub_map[sub["name"]]["items"] = sorted(
                            sub_map[sub["name"]]["items"],
                            key=lambda x: x.get("sequence_id", 0)
                        )

                    head_map[key]["sub_heads"] = sorted(
                        head_map[key]["sub_heads"],
                        key=lambda x: x.get("sequence_id", 0)
                    )

                # ---------------- DIRECT ITEMS ----------------

                else:
                    item_map = {
                        i["name"]: i
                        for i in head_map[key]["items"]
                    }

                    for item in head.get("items", []):

                        if item["name"] not in item_map:
                            new_item = {
                                "name": item["name"],
                                "sequence_id": item.get("sequence_id", 0),
                                "gl_code": item.get("gl_code"),
                                "ytd": 0
                            }

                            head_map[key]["items"].append(new_item)
                            item_map[item["name"]] = new_item

                        item_map[item["name"]]["ytd"] += item.get("ytd", 0)

                    head_map[key]["items"] = sorted(
                        head_map[key]["items"],
                        key=lambda x: x.get("sequence_id", 0)
                    )

        return sorted(
            list(head_map.values()),
            key=lambda x: x.get("sequence_id", 0)
        )

    # ---------------- MAIN ----------------

    previous_financial_year = get_previous_financial_year(financial_year)
    settings = get_combination_table_settings_1(table_name_filter)

    final_results = []

    overall_ytd = 0
    capex_total_ytd = 0
    opex_total_ytd = 0

    for s in settings:

        for combo in s.get("combination_settings", []):

            all_unit_actuals = []

            for gu in s.get("grouped_units", []):

                actuals = get_combined_actuals(
                    financial_year=financial_year,
                    month=month,
                    unit=gu.get("unit"),
                    cost_center=safe_join(gu.get("cost_centers")),
                    location_code=safe_join(gu.get("locations")),
                    erp_cost_center_value=safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=safe_join(gu.get("locations_erp"))
                )

                actuals = calculate_totals(actuals)
                all_unit_actuals.append(actuals)

            consolidated = consolidate_actuals(all_unit_actuals)
            totals = calculate_grand_total(consolidated)

            capex_local = 0
            opex_local = 0

            for head in consolidated:
                name = (head.get("name") or "").upper()

                if "CAPITAL" in name:
                    capex_local += head.get("ytd", 0)

                elif "OPERATING" in name:
                    opex_local += head.get("ytd", 0)

            if combo.get("is_this_sub_item") == 0:
                overall_ytd += totals["grand_total_ytd"]
                capex_total_ytd += capex_local
                opex_total_ytd += opex_local

            consolidated.append({
                "name": "GRAND TOTAL",
                "sequence_id": 9999,
                "sub_heads": [],
                "items": [],
                "ytd": totals["grand_total_ytd"]
            })

            final_results.append({
                "settings_doc": s.get("settings_doc"),
                "label": s.get("label"),
                "table_name": combo.get("table_name"),
                "sequence_id": combo.get("sequence_id"),
                "is_this_sub_item": combo.get("is_this_sub_item"),
                "actuals": consolidated
            })

    # ---------------- FINAL CONSOLIDATED TOTAL ----------------

    final_consolidated_actuals = consolidate_actuals(
        [
            result["actuals"][:-1]   # remove GRAND TOTAL row
            for result in final_results
            if result.get("label") != "CONSOLIDATED TOTAL"
            and result.get("is_this_sub_item") == 0
        ]
    )

    final_consolidated_totals = calculate_grand_total(
        final_consolidated_actuals
    )

    final_results.append({
        "settings_doc": "CONSOLIDATED",
        "label": "CONSOLIDATED TOTAL",
        "table_name": "CONSOLIDATED",
        "sequence_id": 9999,
        "is_this_sub_item": 0,
        "actuals": final_consolidated_actuals + [
            {
                "name": "CAPEX TOTAL",
                "sequence_id": 9997,
                "sub_heads": [],
                "items": [],
                "ytd": round(capex_total_ytd, 2)
            },
            {
                "name": "OPEX TOTAL",
                "sequence_id": 9998,
                "sub_heads": [],
                "items": [],
                "ytd": round(opex_total_ytd, 2)
            },
            {
                "name": "OVERALL GRAND TOTAL",
                "sequence_id": 9999,
                "sub_heads": [],
                "items": [],
                "ytd": round(
                    final_consolidated_totals["grand_total_ytd"], 2
                )
            }
        ]
    })

    return final_results
