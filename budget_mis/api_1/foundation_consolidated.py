import re
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from decimal import Decimal

import frappe
import requests

from budget_mis.utils import guest_api
from budget_mis.api_1.helper import get_accounting_period_from_month, get_previous_financial_year, get_actuals_cache_duration_seconds
from budget_mis.api_1.grouped_actuals import group_actuals_ytd
from budget_mis.api_1.number_card_settings import get_combination_table_settings_1
from budget_mis.api_1.budget_actuals_combined import get_combined_actuals
from budget_mis.api_1.budget_summary import get_budget_summary
from budget_mis.api.erp_actuals import fetch_actuals_month_wise

# Ported from budget_mis.api.foundation_consolidated_report, reusing the
# already-fixed api_1 primitives (group_actuals_ytd's own cache,
# get_combined_actuals' expense-structure cache, number_card_settings'
# cached + correctness-fixed resolve_grouped_units) instead of the older
# api/ versions these functions used to call. Each *_page_data entrypoint
# below mirrors api_1/monthly_mis.py's get_monthly_mis_page_data pattern:
# fetch ERP actuals ONCE per financial year this tab needs (concurrently,
# with a bounded .result(timeout=...) so a slow/stuck ERP call surfaces a
# clean error instead of hanging the request - see monthly_mis.py's own
# comment on why an unbounded future.result() can silently outlive a
# proxy/gunicorn timeout and drop the connection with no response at all),
# then thread that same fetched data through every function this tab's old
# frontend code called separately. FoundationConsolidated.vue's 6 tabs are
# lazy-loaded per-tab (unlike Monthly MIS, which loads everything at once),
# so this is 6 combined entrypoints - one per tab - not one for the whole
# page: a single all-tabs call would force every tab's data to be computed
# up front even if the user only ever opens one.


def _safe_join(arr):
    return ",".join([str(x).strip() for x in (arr or []) if x])


# Caches a whole *_page_data entrypoint's combined response (not just the
# underlying ERP fetch, which group_actuals_ytd already caches on its own) -
# so a second user (or the same user re-opening a tab) opening the SAME
# financial_year gets the finished, already-consolidated tree back instantly
# instead of re-running the ~1900-call get_combined_actuals fan-out described
# in api_1/budget_actuals_combined.py's own header comment. Shares its TTL
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


def _fetch_grouped_actuals_in_worker(site, fiscal_year, accounting_period):
    """Same thread-local pattern as api_1/monthly_mis.py's
    _group_actuals_ytd_in_worker - frappe.local is thread-local, so a plain
    thread needs its own frappe.init/connect before touching the DB/cache."""
    frappe.init(site, force=True)
    frappe.connect()
    try:
        return group_actuals_ytd(fiscal_year=fiscal_year, accounting_period=accounting_period).get("data", [])
    finally:
        frappe.destroy()


def _fetch_current_and_previous_actuals(financial_year, month):
    """Fetches group_actuals_ytd for financial_year and its previous year
    CONCURRENTLY (two threads, each with its own frappe connection), with a
    bounded wait - mirrors get_monthly_mis_page_data exactly, including the
    100s ceiling (10s above the ERP request's own 90s timeout) and the clean
    frappe.throw on FutureTimeoutError instead of letting an unbounded
    .result() hang the request past a hosting proxy's own timeout."""
    previous_financial_year = get_previous_financial_year(financial_year)
    current_formatted = get_accounting_period_from_month(month, financial_year)
    previous_formatted = get_accounting_period_from_month(month, previous_financial_year)

    site = frappe.local.site
    with ThreadPoolExecutor(max_workers=2) as pool:
        current_future = pool.submit(
            _fetch_grouped_actuals_in_worker, site, current_formatted.get("fiscal_year"), current_formatted.get("accounting_period")
        )
        previous_future = pool.submit(
            _fetch_grouped_actuals_in_worker, site, previous_formatted.get("fiscal_year"), previous_formatted.get("accounting_period")
        )
        try:
            current_actuals_data = current_future.result(timeout=100)
            previous_actuals_data = previous_future.result(timeout=100)
        except FutureTimeoutError:
            frappe.log_error("ERP Timeout", "Foundation Consolidated actuals fetch exceeded the worker timeout")
            frappe.throw("The ERP system did not respond in time. Please try again in a few minutes.")

    return previous_financial_year, current_actuals_data, previous_actuals_data


# ---------------------------------------------------------------------------
# PPT tab: get_foundation_overall_current_vs_previous_year (current vs previous FY) + get_unit_wise_actuals_breakup
# (Opex Capex, CURRENT FY) + get_budget_summary. Previously 2 parallel
# frontend calls (get_foundation_overall_current_vs_previous_year, get_unit_wise_actuals_breakup) each
# independently fetching ERP actuals; now ONE call, actuals fetched once.
#
# Opex Capex deliberately queries the CURRENT financial_year, not
# previous_financial_year - this table is titled "OPERATING/CAPITAL EXPENSES
# {current FY}" on the frontend (FoundationConsolidated.vue's loadPpt(),
# buildBreakdownTable(uwp, kind, curFY)), and was previously fetching
# previous-year data under that current-year label - a long-standing bug
# also present in the original Desk page (consolidated_budget.js's own
# buildOpexBudgetTable/buildCapexBudgetTable calls, which pass curFY as the
# title while fetching with is_previous:1) that the api_1 port initially
# carried over faithfully rather than introducing. Confirmed with the user
# this table should show real current-year data, not previous-year data
# mislabeled as current.
# ---------------------------------------------------------------------------
@guest_api
@_page_data_cache
def get_ppt_page_data(financial_year):
    month = "March"
    previous_financial_year, current_actuals_data, previous_actuals_data = _fetch_current_and_previous_actuals(
        financial_year, month
    )

    foundation_overall = get_foundation_overall_current_vs_previous_year(
        financial_year, month, table_name_filter="Foundation Overall",
        _grouped_actuals_data=current_actuals_data, _previous_grouped_actuals_data=previous_actuals_data,
    )
    opex_capex_previous = get_unit_wise_actuals_breakup(
        financial_year, month, table_name_filter="Opex Capex",
        _grouped_actuals_data=current_actuals_data,
    )
    consolidated_report = get_budget_summary(financial_year=financial_year)

    return {
        "foundation_overall": foundation_overall,
        "opex_capex_previous": opex_capex_previous,
        "consolidated_report": consolidated_report,
    }


# ---------------------------------------------------------------------------
# Summary INR tab: get_unit_wise_actuals_breakup (Unit Wise Plan, CURRENT FY) +
# get_headcount_with_plan_data + get_budget_summary + get_actuals_quarter_and_month_breakup
# (previous FY, period 12/March). Previously 4 parallel frontend calls; now
# ONE call. The quarter/month-wise total and get_budget_summary results are
# also reused as-is by the Actuals and Annual Budget tabs respectively (see
# those entrypoints below), rather than each independently recomputing them.
#
# Unit Wise Plan deliberately queries the CURRENT financial_year, not
# previous_financial_year - sections B ("Breakdown of Unit Wise Plan") and H
# ("Capital Expenditure") on SummaryInrTab.vue both display this under a
# current-FY "Plan" column header (pLbl = `${financialYear} Budget`), and
# were previously showing previous-year data under that label - the same
# long-standing mislabeling bug as get_ppt_page_data's Opex Capex table
# above (see that function's own comment), now fixed the same way per
# explicit confirmation that this table should show real current-year data.
# ---------------------------------------------------------------------------
@guest_api
@_page_data_cache
def get_summary_inr_page_data(financial_year):
    month = "March"
    previous_financial_year, current_actuals_data, previous_actuals_data = _fetch_current_and_previous_actuals(
        financial_year, month
    )

    unit_wise_plan_previous = get_unit_wise_actuals_breakup(
        financial_year, month, table_name_filter="Unit Wise Plan",
        _grouped_actuals_data=current_actuals_data,
    )
    headcount = get_headcount_with_plan_data(
        financial_year, month, table_name_filter="Unit Wise Plan",
        _grouped_actuals_data=current_actuals_data,
    )
    consolidated_report = get_budget_summary(financial_year=financial_year)
    actuals_quarter_month_total = get_actuals_quarter_and_month_breakup(
        fiscal_year=int(previous_financial_year.split("-")[0]), accounting_period=12,
    )

    return {
        "unit_wise_plan_previous": unit_wise_plan_previous,
        "headcount": headcount,
        "consolidated_report": consolidated_report,
        "actuals_quarter_month_total": actuals_quarter_month_total,
    }


# ---------------------------------------------------------------------------
# Headcount tab - unchanged single-call shape, just moved + repointed at
# api_1's own get_unit_wise_actuals_breakup for its internal plan_data lookup.
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
# Budget vs Actuals tab - get_unit_wise_actuals_breakup (Budget & Estimate, previous FY).
# ---------------------------------------------------------------------------
@guest_api
@_page_data_cache
def get_budget_actuals_page_data(financial_year):
    month = "March"
    previous_financial_year = get_previous_financial_year(financial_year)
    formatted = get_accounting_period_from_month(month, previous_financial_year)
    grouped_actuals_data = group_actuals_ytd(
        fiscal_year=formatted.get("fiscal_year"), accounting_period=formatted.get("accounting_period"),
    ).get("data", [])

    return get_unit_wise_actuals_breakup(
        previous_financial_year, month, table_name_filter="Budget & Estimate",
        _grouped_actuals_data=grouped_actuals_data,
    )


# =============================================================================
# Ported worker functions below - same logic as their api/
# foundation_consolidated_report.py namesakes, with internal calls repointed
# to the already-fixed/cached api_1 equivalents (get_combination_table_settings_1,
# group_actuals_ytd, get_combined_actuals - see this file's own header
# comment for why that's a deliberate improvement, not a drop-in copy) and,
# where the api/ version had no way to accept pre-fetched actuals at all,
# the same _grouped_actuals_data override param every other ported function
# here already supports.
# =============================================================================


def _calculate_totals_with_actuals(actuals):
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


def _calculate_grand_total_with_actuals(actuals):
    grand_ytd = 0
    grand_actual = 0
    for head in actuals:
        grand_ytd += head.get("ytd", 0) or 0
        grand_actual += head.get("total_posted_amt_ytd", 0) or 0
    return {
        "grand_total_ytd": round(grand_ytd, 2),
        "grand_total_actual": round(grand_actual, 2),
    }


def _consolidate_actuals_with_totals(all_unit_actuals):
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
                    "total_posted_amt_ytd": 0,
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
                            "total_posted_amt_ytd": 0,
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
                                "total_posted_amt": 0,
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
                            "total_posted_amt": 0,
                        }
                        head_map[key]["items"].append(new_item)
                        item_map[item["name"]] = new_item
                    item_map[item["name"]]["ytd"] += item.get("ytd", 0)
                    item_map[item["name"]]["total_posted_amt"] += item.get("total_posted_amt", 0)

    return list(head_map.values())


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
                actuals = _calculate_totals_with_actuals(actuals)
                all_unit_actuals.append(actuals)

            consolidated = _consolidate_actuals_with_totals(all_unit_actuals)
            totals = _calculate_grand_total_with_actuals(consolidated)

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
        "main_item_breakdown": _consolidate_actuals_with_totals(all_consolidated_for_breakdown),
    })

    return final_results


@guest_api
def get_foundation_overall_current_vs_previous_year(financial_year, month, table_name_filter=None, _grouped_actuals_data=None, _previous_grouped_actuals_data=None):

    def calculate_totals(actuals):
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

    def consolidate_actuals(all_unit_actuals):
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
                        "total_posted_amt_ytd": 0,
                    }
                head_map[key]["ytd"] += head.get("ytd", 0)
                head_map[key]["total_posted_amt_ytd"] += head.get("total_posted_amt_ytd", 0)
        return list(head_map.values())

    def calculate_grand_total(data):
        return {
            "name": "GRAND TOTAL",
            "sequence_id": 9999,
            "ytd": round(sum(d.get("ytd", 0) for d in data), 2),
            "total_posted_amt_ytd": round(sum(d.get("total_posted_amt_ytd", 0) for d in data), 2),
        }

    previous_financial_year = get_previous_financial_year(financial_year)
    settings = get_combination_table_settings_1(table_name_filter)

    # _grouped_actuals_data is the CURRENT FY's fetch, _previous_grouped_actuals_data
    # the previous FY's - both optional so this function still works as a
    # standalone call (falls back to its own fetch), but get_ppt_page_data
    # above always supplies both, since it has already fetched exactly these
    # two datasets via _fetch_current_and_previous_actuals.
    if _grouped_actuals_data is not None:
        current_grouped_actuals_data = _grouped_actuals_data
    else:
        current_formatted = get_accounting_period_from_month(month, financial_year)
        current_grouped_actuals_data = group_actuals_ytd(
            fiscal_year=current_formatted.get("fiscal_year"),
            accounting_period=current_formatted.get("accounting_period"),
        ).get("data", [])

    if _previous_grouped_actuals_data is not None:
        previous_grouped_actuals_data = _previous_grouped_actuals_data
    else:
        previous_formatted = get_accounting_period_from_month(month, previous_financial_year)
        previous_grouped_actuals_data = group_actuals_ytd(
            fiscal_year=previous_formatted.get("fiscal_year"),
            accounting_period=previous_formatted.get("accounting_period"),
        ).get("data", [])

    final_results = []

    for s in settings:
        for combo in s.get("combination_settings", []):
            current_all = []
            previous_all = []

            for gu in s.get("grouped_units", []):
                current_actuals = get_combined_actuals(
                    financial_year=financial_year,
                    month=month,
                    unit=gu.get("unit"),
                    cost_center=_safe_join(gu.get("cost_centers")),
                    location_code=_safe_join(gu.get("locations")),
                    erp_cost_center_value=_safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=_safe_join(gu.get("locations_erp")),
                    grouped_actuals_data=current_grouped_actuals_data,
                )
                previous_actuals = get_combined_actuals(
                    financial_year=previous_financial_year,
                    month=month,
                    unit=gu.get("unit"),
                    cost_center=_safe_join(gu.get("cost_centers")),
                    location_code=_safe_join(gu.get("locations")),
                    erp_cost_center_value=_safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=_safe_join(gu.get("locations_erp")),
                    grouped_actuals_data=previous_grouped_actuals_data,
                )

                current_actuals = calculate_totals(current_actuals)
                previous_actuals = calculate_totals(previous_actuals)

                current_all.append(current_actuals)
                previous_all.append(previous_actuals)

            current_final = consolidate_actuals(current_all)
            previous_final = consolidate_actuals(previous_all)

            current_final.append(calculate_grand_total(current_final))
            previous_final.append(calculate_grand_total(previous_final))

            final_results.append({
                "settings_doc": s.get("settings_doc"),
                "label": s.get("label"),
                "table_name": combo.get("table_name"),
                "sequence_id": combo.get("sequence_id"),
                "is_this_sub_item": combo.get("is_this_sub_item"),
                "current_year": current_final,
                "previous_year": previous_final,
            })

    return final_results


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


@guest_api
def get_actuals_quarter_and_month_breakup(fiscal_year, accounting_period, _grouped_actuals_data=None):
    try:

        def _num(x):
            try:
                return float(Decimal(str(x or 0)))
            except Exception:
                return 0.0

        def normalize(text):
            return re.sub(r"\s+", " ", str(text or "")).strip().upper()

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
                amount = _num(row.get("posted_total_amt"))

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
