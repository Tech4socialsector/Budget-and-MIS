import frappe
import requests

from budget_mis.utils import guest_api
from budget_mis.api.helper import get_accounting_period_from_month, get_previous_financial_year, get_actuals_cache_duration_seconds, _safe_join, to_number, normalize, calculate_totals, calculate_grand_total, consolidate_actuals
from budget_mis.api.grouped_actuals import group_actuals_ytd
from budget_mis.api.number_card_settings import get_combination_table_settings_1
from budget_mis.api.budget_actuals_combined import get_combined_actuals
from budget_mis.api.budget_summary import get_budget_summary
from budget_mis.api.erp_actuals import fetch_actuals_month_wise

# Reuses already-fixed primitives (group_actuals_ytd's own cache,
# get_combined_actuals' expense-structure cache, number_card_settings'
# cached + correctness-fixed resolve_grouped_units) throughout. Each
# *_page_data entrypoint below mirrors api/monthly_mis.py's
# get_monthly_mis_page_data pattern: fetch ERP actuals ONCE per financial
# year this tab needs, then thread that same fetched data through every
# function this tab's frontend needs, instead of each one independently
# re-fetching. FoundationConsolidated.vue's 6 tabs are lazy-loaded per-tab
# (unlike Monthly MIS, which loads everything at once), so this is 6
# combined entrypoints - one per tab - not one for the whole page: a single
# all-tabs call would force every tab's data to be computed up front even
# if the user only ever opens one.
#
# Tabs 1 (PPT), 2 (Summary INR), and 6 (Budget & Actuals) all share ONE
# core, get_foundation_budget_vs_actual - always current FY's budget vs
# previous FY's actuals (tab 1's "Foundation Overall" cards additionally
# get a previous-FY-budget-vs-previous-FY-actuals block alongside it) -
# rather than each tab independently fetching actuals and pairing years its
# own way. Tabs 3 (Headcount), 4 (Annual Budget), 5 (Actuals) are simpler
# single-purpose entrypoints with no year-pairing logic of their own.


# Caches a whole *_page_data entrypoint's combined response (not just the
# underlying ERP fetch, which group_actuals_ytd already caches on its own) -
# so a second user (or the same user re-opening a tab) opening the SAME
# financial_year gets the finished, already-consolidated tree back instantly
# instead of re-running the ~1900-call get_combined_actuals fan-out described
# in api/budget_actuals_combined.py's own header comment. Shares its TTL
# with the ERP actuals fetch itself (ERP Credentials.actuals_cache_duration_minutes)
# rather than inventing a second cache lifetime: this response can never be
# any fresher than the actuals data it's built from, so there's no reason for
# it to expire on a different schedule. Invalidated the same way
# group_actuals_ytd is - naturally, by that shared TTL elapsing - and also
# whenever "Overview number cards settings" changes, since every entrypoint
# here ultimately depends on get_combination_table_settings_1/_test (see
# those functions' own cache-invalidation hook in startup.py).
def _page_data_cache(fn):
    import functools

    @functools.wraps(fn)
    def wrapper(financial_year, *args, **kwargs):
        cache_key = f"budget_mis:foundation_consolidated:{fn.__name__}:{financial_year}"
        cached = frappe.cache().get_value(cache_key)
        if cached is not None:
            return cached
        result = fn(financial_year, *args, **kwargs)
        frappe.cache().set_value(cache_key, result, expires_in_sec=get_actuals_cache_duration_seconds())
        return result

    return wrapper


# The shared core for tabs 1/2/6 (PPT, Summary INR, Budget & Actuals): always
# fetches the PREVIOUS financial year's actuals (the only actuals year any of
# the three tabs ever shows - none of them display current-year actuals),
# then builds a current-FY-budget-vs-previous-FY-actuals tree via
# get_unit_wise_actuals_breakup. When include_previous_year_budget=True (PPT
# tab's "Foundation Overall" cards only), also builds a second tree pairing
# the PREVIOUS financial year's own budget against that SAME previous-year
# actuals data, so both blocks share one ERP fetch rather than two.
#
# get_unit_wise_actuals_breakup's financial_year and _grouped_actuals_data
# params are independent of each other (get_combined_actuals pairs whatever
# financial_year you pass for the budget side with whatever
# grouped_actuals_data you pass for the actuals side) - this is what makes a
# cross-year budget-vs-actual pairing possible without forking
# get_unit_wise_actuals_breakup itself.
def get_foundation_budget_vs_actual(financial_year, table_name_filter, include_previous_year_budget=False):
    previous_financial_year = get_previous_financial_year(financial_year)
    formatted = get_accounting_period_from_month("March", previous_financial_year)
    previous_actuals_data = group_actuals_ytd(
        fiscal_year=formatted.get("fiscal_year"),
        accounting_period=formatted.get("accounting_period"),
    ).get("data", [])

    current_year_tree = get_unit_wise_actuals_breakup(
        financial_year, "March", table_name_filter=table_name_filter,
        _grouped_actuals_data=previous_actuals_data,
    )

    if not include_previous_year_budget:
        return {"current_year": current_year_tree}

    previous_year_tree = get_unit_wise_actuals_breakup(
        previous_financial_year, "March", table_name_filter=table_name_filter,
        _grouped_actuals_data=previous_actuals_data,
    )
    return {"current_year": current_year_tree, "previous_year": previous_year_tree}


# ---------------------------------------------------------------------------
# PPT tab: current FY budget vs previous FY actuals, AND previous FY budget
# vs that same previous FY's actuals, for "Foundation Overall" cards (both
# blocks shown side by side); current FY budget vs previous FY actuals only
# for "Opex Capex" cards (no previous-year-budget block needed there - the
# frontend's own breakdown table only ever shows one budget column) +
# get_budget_summary.
# ---------------------------------------------------------------------------
# FoundationConsolidated.vue's loadPpt() reads each "Foundation Overall" row
# as e.current_year / e.previous_year (per-row nested actuals trees, each fed
# into buildPptRows/buildEducationGroups via cfg.key) - NOT as two separate
# top-level arrays. get_foundation_budget_vs_actual returns the latter (one
# flat row-array per year), so this zips the two same-length, same-order
# row-arrays (identical settings/table_name_filter on both calls -> same row
# identity/order) into that single merged-row shape the frontend expects.
def _zip_current_and_previous_year_rows(current_year_rows, previous_year_rows):
    merged = []
    for i, row in enumerate(current_year_rows):
        prev_row = previous_year_rows[i] if i < len(previous_year_rows) else {}
        merged.append({
            "settings_doc": row.get("settings_doc"),
            "label": row.get("label"),
            "table_name": row.get("table_name"),
            "sequence_id": row.get("sequence_id"),
            "is_this_sub_item": row.get("is_this_sub_item"),
            "current_year": row.get("actuals", []),
            "previous_year": prev_row.get("actuals", []),
        })
    return merged


@guest_api
@_page_data_cache
def get_ppt_page_data(financial_year):
    foundation_overall = get_foundation_budget_vs_actual(
        financial_year, table_name_filter="Foundation Overall", include_previous_year_budget=True,
    )
    opex_capex = get_foundation_budget_vs_actual(financial_year, table_name_filter="Opex Capex")
    consolidated_report = get_budget_summary(financial_year=financial_year)

    return {
        "foundation_overall": _zip_current_and_previous_year_rows(
            foundation_overall["current_year"], foundation_overall["previous_year"],
        ),
        "opex_capex_previous": opex_capex["current_year"],
        "consolidated_report": consolidated_report,
    }


# ---------------------------------------------------------------------------
# Summary INR tab: current FY budget vs previous FY actuals for "Unit Wise
# Plan" cards, plus Headcount + get_budget_summary + the previous FY's
# quarter/month breakdown. The quarter/month-wise total and get_budget_summary
# results are also reused as-is by the Actuals and Annual Budget tabs
# respectively (see those entrypoints below), rather than each independently
# recomputing them.
# ---------------------------------------------------------------------------
@guest_api
@_page_data_cache
def get_summary_inr_page_data(financial_year):
    unit_wise_plan = get_foundation_budget_vs_actual(financial_year, table_name_filter="Unit Wise Plan")
    headcount = get_headcount_with_plan_data(financial_year, "March", table_name_filter="Unit Wise Plan")
    consolidated_report = get_budget_summary(financial_year=financial_year)

    previous_financial_year = get_previous_financial_year(financial_year)
    actuals_quarter_month_total = get_actuals_quarter_and_month_breakup(
        fiscal_year=int(previous_financial_year.split("-")[0]), accounting_period=12,
    )

    return {
        "unit_wise_plan_previous": unit_wise_plan["current_year"],
        "headcount": headcount,
        "consolidated_report": consolidated_report,
        "actuals_quarter_month_total": actuals_quarter_month_total,
    }


# ---------------------------------------------------------------------------
# Headcount tab - unchanged single-call shape, just moved + repointed at
# this module's own get_unit_wise_actuals_breakup for its internal plan_data lookup.
# ---------------------------------------------------------------------------
@guest_api
@_page_data_cache
def get_headcount_page_data(financial_year):
    return get_headcount_with_plan_data(financial_year, "March", table_name_filter="Unit Wise Plan")


# ---------------------------------------------------------------------------
# Annual Budget tab - get_budget_summary is the SAME call Summary INR's
# combined entrypoint already makes; kept as its own entrypoint (this tab is
# lazy-loaded independently and may be opened without Summary INR ever having
# been opened first) but not duplicated as a separate implementation.
# ---------------------------------------------------------------------------
@guest_api
@_page_data_cache
def get_annual_budget_page_data(financial_year):
    return get_budget_summary(financial_year=financial_year)


# ---------------------------------------------------------------------------
# Actuals tab - get_actuals_quarter_and_month_breakup is the SAME
# call Summary INR's combined entrypoint already makes (identical args: the
# previous FY's fiscal_year, period 12); kept as its own entrypoint for the
# same lazy-load-independence reason as Annual Budget above.
# ---------------------------------------------------------------------------
@guest_api
@_page_data_cache
def get_actuals_page_data(financial_year):
    previous_financial_year = get_previous_financial_year(financial_year)
    return get_actuals_quarter_and_month_breakup(
        fiscal_year=int(previous_financial_year.split("-")[0]), accounting_period=12,
    )


# ---------------------------------------------------------------------------
# Budget & Actuals tab: current FY budget vs previous FY actuals for
# "Budget & Estimate" cards, matching tabs 1/2's own year pairing. Previously
# queried previous_financial_year's own budget (not financial_year's)
# against previous_financial_year's actuals - previous-vs-previous, not
# current-vs-previous like every other tab on this page - a real bug, fixed
# here by going through the same shared get_foundation_budget_vs_actual core
# tabs 1/2 already use instead of this tab having its own separate (and
# differently-year-paired) fetch logic.
# ---------------------------------------------------------------------------
@guest_api
@_page_data_cache
def get_budget_actuals_page_data(financial_year):
    result = get_foundation_budget_vs_actual(financial_year, table_name_filter="Budget & Estimate")
    return result["current_year"]


# =============================================================================
# Shared worker functions below - used by the *_page_data entrypoints above,
# all built on the already-fixed/cached primitives this file imports
# (get_combination_table_settings_1, group_actuals_ytd, get_combined_actuals),
# each accepting an optional _grouped_actuals_data override so a caller that
# already fetched the right period's actuals never triggers a redundant fetch.
# =============================================================================


# Foundation Consolidated's per-table-group budget-vs-actuals breakdown (CAPEX/OPEX/overall totals plus a main_item_breakdown for non-sub-item entries) - foundation_consolidated's own version of the same shape monthly_mis.py's get_monthly_mis_break_up produces, built on the SAME get_combined_actuals/get_combination_table_settings_1 calls but with no unit-access scoping of its own (unlike get_monthly_mis_break_up, which restricts grouped_units to the caller's allowed units on a direct HTTP call) - also reused directly by get_headcount_with_plan_data below and by monthly_mis_export.py's export_monthly_mis (imported there as get_unit_wise_plan).
@guest_api
def get_unit_wise_actuals_breakup(financial_year, month, table_name_filter=None, is_previous=None, _grouped_actuals_data=None):
    if is_previous == 1:
        financial_year = get_previous_financial_year(financial_year)
    settings = get_combination_table_settings_1(table_name_filter)

    formatted = get_accounting_period_from_month(month, financial_year)

    if _grouped_actuals_data is not None:
        grouped_actuals_data = _grouped_actuals_data
    else:
        grouped_actuals_data = group_actuals_ytd(
            fiscal_year=formatted.get("fiscal_year"),
            accounting_period=formatted.get("accounting_period"),
        ).get("data", [])

    final_results = []

    overall_ytd = 0
    overall_actual = 0
    capex_total_ytd = 0
    capex_total_actual = 0
    opex_total_ytd = 0
    opex_total_actual = 0

    all_consolidated_for_breakdown = []

    for s in settings:
        for combo in s.get("combination_settings", []):
            all_unit_actuals = []

            for gu in s.get("grouped_units", []):
                actuals = get_combined_actuals(
                    financial_year=financial_year,
                    month=month,
                    unit=gu.get("unit"),
                    cost_center=_safe_join(gu.get("cost_centers")),
                    location_code=_safe_join(gu.get("locations")),
                    erp_cost_center_value=_safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=_safe_join(gu.get("locations_erp")),
                    grouped_actuals_data=grouped_actuals_data,
                )
                actuals = calculate_totals(actuals)
                all_unit_actuals.append(actuals)

            consolidated = consolidate_actuals(all_unit_actuals)
            totals = calculate_grand_total(consolidated)

            capex_local = 0
            capex_actual_local = 0
            opex_local = 0
            opex_actual_local = 0

            for head in consolidated:
                name = (head.get("name") or "").upper()
                if "CAPITAL" in name:
                    capex_local += head.get("ytd", 0)
                    capex_actual_local += head.get("total_posted_amt_ytd", 0)
                elif "OPERATING" in name:
                    opex_local += head.get("ytd", 0)
                    opex_actual_local += head.get("total_posted_amt_ytd", 0)

            if combo.get("is_this_sub_item") == 0:
                overall_ytd += totals["grand_total_ytd"]
                overall_actual += totals["grand_total_actual"]
                capex_total_ytd += capex_local
                capex_total_actual += capex_actual_local
                opex_total_ytd += opex_local
                opex_total_actual += opex_actual_local
                all_consolidated_for_breakdown.append(list(consolidated))

            consolidated.append({
                "name": "GRAND TOTAL",
                "sequence_id": 9999,
                "sub_heads": [],
                "items": [],
                "ytd": totals["grand_total_ytd"],
                "total_posted_amt_ytd": totals["grand_total_actual"],
            })

            final_results.append({
                "settings_doc": s.get("settings_doc"),
                "label": s.get("label"),
                "table_name": combo.get("table_name"),
                "sequence_id": combo.get("sequence_id"),
                "is_this_sub_item": combo.get("is_this_sub_item"),
                "actuals": consolidated,
            })

    final_results.append({
        "settings_doc": "CONSOLIDATED",
        "label": "CONSOLIDATED TOTAL",
        "table_name": "CONSOLIDATED",
        "sequence_id": 9999,
        "is_this_sub_item": 0,
        "actuals": [
            {"name": "CAPEX TOTAL", "ytd": round(capex_total_ytd, 2), "total_posted_amt_ytd": round(capex_total_actual, 2)},
            {"name": "OPEX TOTAL", "ytd": round(opex_total_ytd, 2), "total_posted_amt_ytd": round(opex_total_actual, 2)},
            {"name": "OVERALL GRAND TOTAL", "ytd": round(overall_ytd, 2), "total_posted_amt_ytd": round(overall_actual, 2)},
        ],
        "main_item_breakdown": consolidate_actuals(all_consolidated_for_breakdown),
    })

    return final_results


# Pairs raw Headcount doctype data (that financial year plus the next two, each with its own Headcount Operating Units child rows) with the SAME budget-vs-actuals plan_data get_unit_wise_actuals_breakup produces - two unrelated data sources bolted together into one response purely so the frontend can render both in one panel without a second round trip; swallows any error into a {"status": "error"} payload instead of raising, so a Headcount query failure doesn't take down the whole page.
@guest_api
def get_headcount_with_plan_data(financial_year=None, month=None, table_name_filter=None, is_previous=None, _grouped_actuals_data=None):
    try:
        filters = {}

        if financial_year:
            fy_list = frappe.get_all(
                "Financial Year List",
                fields=["name"],
                order_by="creation desc",
            )
            fy_names_all = [fy["name"] for fy in fy_list]

            if financial_year in fy_names_all:
                index = fy_names_all.index(financial_year)
                fy_names = fy_names_all[index:index + 3]
            else:
                fy_names = [financial_year]

            filters["financial_year"] = ["in", fy_names]

        docs = frappe.get_all(
            "Headcount",
            filters=filters,
            fields=["name", "financial_year", "total_head_count"],
            order_by="creation desc",
        )

        for doc in docs:
            units = frappe.get_all(
                "Headcount Operating Units",
                filters={"parent": doc["name"], "parenttype": "Headcount"},
                fields=["unit", "total_headcount", "unit_description"],
            )
            doc["units"] = units

        plan_data = []
        if financial_year and month:
            plan_data = get_unit_wise_actuals_breakup(
                financial_year,
                month,
                table_name_filter,
                is_previous,
                _grouped_actuals_data=_grouped_actuals_data,
            )

        return {
            "status": "success",
            "headcount_data": docs,
            "plan_data": plan_data,
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Headcount API Error")
        return {
            "status": "error",
            "message": str(e),
        }


# Builds the head/sub-head/item actuals tree with EVERY individual month (1-12) and quarter total populated, not just a single YTD figure - built directly from raw month-wise ERP rows (fetch_actuals_month_wise, GL-code-mapped to Expenses inline here) rather than reusing group_actuals_ytd/group_actuals_month_wise from erp_actuals.py, since those collapse the period dimension away before this function would get a chance to split it back out by month.
@guest_api
def get_actuals_quarter_and_month_breakup(fiscal_year, accounting_period, _grouped_actuals_data=None):
    try:

        def empty_months():
            return {
                "1": 0.0, "2": 0.0, "3": 0.0,
                "4": 0.0, "5": 0.0, "6": 0.0,
                "7": 0.0, "8": 0.0, "9": 0.0,
                "10": 0.0, "11": 0.0, "12": 0.0,
            }

        def calculate_quarters(obj):
            m = obj["months"]
            obj["Q1"] = m["4"] + m["5"] + m["6"]
            obj["Q2"] = m["7"] + m["8"] + m["9"]
            obj["Q3"] = m["10"] + m["11"] + m["12"]
            obj["Q4"] = m["1"] + m["2"] + m["3"]

        expense_rows = frappe.get_all(
            "Expenses",
            fields=["name", "head_of_expense", "sub_head_of_expense", "type_of_expense", "sequence_id"],
            order_by="sequence_id asc",
        ) or []

        expense_lookup = {e["name"]: e for e in expense_rows}

        gl_rows = frappe.get_all("GL code Mapping", fields=["parent", "gl_code_map"]) or []

        gl_parent_map = {}
        for row in gl_rows:
            gl = str(row.get("gl_code_map") or "").strip()
            parent = str(row.get("parent") or "").strip()
            if gl and parent:
                gl_parent_map[gl] = parent

        heads = {}
        MAIN_HEADS = ["CAPITAL EXPENSES", "OPERATING EXPENSES", "COVID SUPPORT"]

        for e in expense_rows:
            raw_head = normalize(e.get("head_of_expense"))
            sub_head = normalize(e.get("sub_head_of_expense"))
            item_name = str(e.get("type_of_expense") or "UNKNOWN ITEM").strip()
            seq = int(e.get("sequence_id") or 9999)

            if raw_head in MAIN_HEADS:
                parent_head = raw_head
            else:
                parent_head = "OPERATING EXPENSES"
                sub_head = raw_head

            if parent_head not in heads:
                heads[parent_head] = {
                    "name": parent_head,
                    "sequence_id": seq,
                    "Q1": 0.0, "Q2": 0.0, "Q3": 0.0, "Q4": 0.0,
                    "months": empty_months(),
                    "items": {},
                    "sub_heads": {},
                }

            if parent_head in ["CAPITAL EXPENSES", "COVID SUPPORT"]:
                heads[parent_head]["items"][item_name] = {
                    "name": item_name,
                    "sequence_id": seq,
                    "gl_code": None,
                    "Q1": 0.0, "Q2": 0.0, "Q3": 0.0, "Q4": 0.0,
                    "months": empty_months(),
                }
            else:
                if sub_head not in heads[parent_head]["sub_heads"]:
                    heads[parent_head]["sub_heads"][sub_head] = {
                        "name": sub_head,
                        "sequence_id": seq,
                        "Q1": 0.0, "Q2": 0.0, "Q3": 0.0, "Q4": 0.0,
                        "months": empty_months(),
                        "items": {},
                    }
                heads[parent_head]["sub_heads"][sub_head]["items"][item_name] = {
                    "name": item_name,
                    "sequence_id": seq,
                    "gl_code": None,
                    "Q1": 0.0, "Q2": 0.0, "Q3": 0.0, "Q4": 0.0,
                    "months": empty_months(),
                }

        if _grouped_actuals_data is not None:
            erp_data = _grouped_actuals_data
        else:
            response = fetch_actuals_month_wise(fiscal_year, accounting_period)
            if "message" in response:
                response = response["message"]
            erp_data = response.get("data") if response.get("status") == "success" else []

        for row in erp_data:
            try:
                period = row.get("accounting_period")
                account = str(row.get("account") or "").strip()
                amount = to_number(row.get("posted_total_amt"))

                if not period or account not in gl_parent_map:
                    continue

                month = str(period)
                if month == "0":
                    continue

                parent_expense_name = gl_parent_map.get(account)
                expense = expense_lookup.get(parent_expense_name)
                if not expense:
                    continue

                raw_head = normalize(expense.get("head_of_expense"))
                sub_head = normalize(expense.get("sub_head_of_expense"))
                item_name = str(expense.get("type_of_expense") or "").strip()

                if raw_head in MAIN_HEADS:
                    parent_head = raw_head
                else:
                    parent_head = "OPERATING EXPENSES"
                    sub_head = raw_head

                heads[parent_head]["months"][month] += amount

                if parent_head in ["CAPITAL EXPENSES", "COVID SUPPORT"]:
                    if item_name in heads[parent_head]["items"]:
                        item = heads[parent_head]["items"][item_name]
                        item["months"][month] += amount
                        item["gl_code"] = account
                else:
                    if sub_head in heads[parent_head]["sub_heads"]:
                        sub = heads[parent_head]["sub_heads"][sub_head]
                        sub["months"][month] += amount
                        if item_name in sub["items"]:
                            item = sub["items"][item_name]
                            item["months"][month] += amount
                            item["gl_code"] = account

            except Exception:
                continue

        for head in heads.values():
            calculate_quarters(head)
            for sub in head["sub_heads"].values():
                calculate_quarters(sub)
                for item in sub["items"].values():
                    calculate_quarters(item)
            for item in head["items"].values():
                calculate_quarters(item)

        final = []
        for head in sorted(heads.values(), key=lambda x: x["sequence_id"]):
            head["items"] = sorted(head["items"].values(), key=lambda x: x["sequence_id"])

            sorted_subs = []
            for sub in head["sub_heads"].values():
                sub["items"] = sorted(sub["items"].values(), key=lambda x: x["sequence_id"])
                sorted_subs.append(sub)

            head["sub_heads"] = sorted(sorted_subs, key=lambda x: x["sequence_id"])
            final.append(head)

        return {
            "status": "success",
            "fiscal_year": fiscal_year,
            "data": final,
        }

    except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
        frappe.log_error("ERP Timeout", "Request timed out")
        return {
            "status": "error",
            "message": "The ERP system did not respond in time. Please try again in a few minutes.",
        }

    except Exception:
        frappe.log_error(frappe.get_traceback(), "Actuals API Error")
        return {
            "status": "error",
            "message": "Unable to fetch actuals data. Please contact your administrator.",
        }


# Budget-vs-actuals breakdown by number-card table group for
# BudgetDashboard.vue specifically (a different page from the Foundation
# Consolidated page's own 6 tabs above, kept as its own entrypoint for that
# reason) - moved here from the old foundation_consolidated_report.py file,
# now using the same shared _safe_join/calculate_totals/calculate_grand_total/
# consolidate_actuals helper.py functions every other entrypoint in this file
# already uses, instead of its own separate local copies. Calls
# get_combined_actuals with no grouped_actuals_data at all (budget-only: the
# actuals side always resolves to an empty filtered_data list, so every
# total_posted_amt stays 0) - this function only ever reads/returns the
# budget ("ytd") side, never actuals, matching its own name.
@guest_api
def get_unit_wise_plan_budget(financial_year, month, table_name_filter=None):
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
                    cost_center=_safe_join(gu.get("cost_centers")),
                    location_code=_safe_join(gu.get("locations")),
                    erp_cost_center_value=_safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=_safe_join(gu.get("locations_erp")),
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
                "ytd": totals["grand_total_ytd"],
            })

            final_results.append({
                "settings_doc": s.get("settings_doc"),
                "label": s.get("label"),
                "table_name": combo.get("table_name"),
                "sequence_id": combo.get("sequence_id"),
                "is_this_sub_item": combo.get("is_this_sub_item"),
                "actuals": consolidated,
            })

    # CONSOLIDATED TOTAL row: re-consolidates every non-sub-item entry's own
    # actuals (minus their own trailing GRAND TOTAL row, sliced off here)
    # into one final tree, then appends CAPEX/OPEX/OVERALL as synthetic rows
    # onto that SAME actuals list - a different shape from the other
    # *_page_data entrypoints' CONSOLIDATED entry above (which puts
    # CAPEX/OPEX/OVERALL in their own separate "actuals" list, not appended
    # to a real tree) - kept exactly as BudgetDashboard.vue already expects it.
    final_consolidated_actuals = consolidate_actuals([
        result["actuals"][:-1]
        for result in final_results
        if result.get("label") != "CONSOLIDATED TOTAL" and result.get("is_this_sub_item") == 0
    ])
    final_consolidated_totals = calculate_grand_total(final_consolidated_actuals)

    final_results.append({
        "settings_doc": "CONSOLIDATED",
        "label": "CONSOLIDATED TOTAL",
        "table_name": "CONSOLIDATED",
        "sequence_id": 9999,
        "is_this_sub_item": 0,
        "actuals": final_consolidated_actuals + [
            {"name": "CAPEX TOTAL", "sequence_id": 9997, "sub_heads": [], "items": [], "ytd": round(capex_total_ytd, 2)},
            {"name": "OPEX TOTAL", "sequence_id": 9998, "sub_heads": [], "items": [], "ytd": round(opex_total_ytd, 2)},
            {"name": "OVERALL GRAND TOTAL", "sequence_id": 9999, "sub_heads": [], "items": [], "ytd": round(final_consolidated_totals["grand_total_ytd"], 2)},
        ],
    })

    return final_results
