import frappe
from budget_mis.utils import guest_api, get_allowed_units, require_unit_access
from budget_mis.api.response_crypto import is_direct_http_call
from budget_mis.api_1.helper import get_accounting_period_from_month
from budget_mis.api_1.grouped_actuals import group_actuals_ytd
from budget_mis.api_1.budget_actuals_combined import get_combined_actuals


@guest_api
def get_combined_actuals_report(
    financial_year=None,
    month=None,
    unit=None,
    cost_center=None,
    location_code=None,
    erp_loc_value=None,
    erp_cost_center_value=None,
):
    if not financial_year:
        frappe.throw("Financial Year is required")
    if not month:
        frappe.throw("Month is required")

    # Only scope on a genuine direct HTTP call - internal callers pass
    # unit=None intentionally to get an unscoped result and must not be
    # narrowed by whatever the current session user happens to be (same
    # convention as get_budget_ytd_by_sequence in api_1/budget_summary.py).
    if is_direct_http_call(get_combined_actuals_report):
        if unit:
            require_unit_access(unit)
        else:
            allowed_units = get_allowed_units()
            if allowed_units is not None:
                if not allowed_units:
                    return []
                unit = ",".join(sorted(allowed_units))

    # group_actuals_ytd (api_1/grouped_actuals.py) already checks its own
    # server-side cache first and only redoes the real ERP fetch + GL-code/
    # Expenses join/aggregation when nothing cached is found for this exact
    # (fiscal_year, accounting_period) - shared across every caller
    # (Monthly MIS, this report, etc), not something this file needs its
    # own separate cache for.
    formatted = get_accounting_period_from_month(month, financial_year)
    actuals_response = group_actuals_ytd(
        fiscal_year=formatted.get("fiscal_year"),
        accounting_period=formatted.get("accounting_period"),
    )
    grouped_actuals_data = actuals_response.get("data", [])

    return get_combined_actuals(
        financial_year=financial_year,
        month=month,
        unit=unit,
        cost_center=cost_center,
        location_code=location_code,
        erp_loc_value=erp_loc_value,
        erp_cost_center_value=erp_cost_center_value,
        grouped_actuals_data=grouped_actuals_data,
    )
