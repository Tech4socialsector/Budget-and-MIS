from budget_mis.utils import guest_api, get_allowed_units, require_unit_access
from budget_mis.api.response_crypto import is_direct_http_call

import frappe
from budget_mis.api.erp_actuals import group_actuals_ytd
from budget_mis.api.erp_actuals import group_actuals_by_gl_code
from budget_mis.api.helper import get_accounting_period_from_month, get_previous_financial_year


# Thin wrapper around erp_actuals.group_actuals_ytd (month/year resolved via get_accounting_period_from_month above), then filters the resulting rows in Python by unit/cost_center(deptid)/location_code(operating_unit) - despite the name this is YTD data, not a single month's actuals, and cost_center/location_code here are matched against the raw ERP deptid/operating_unit fields already present on each row, not resolved doc names.
@guest_api
def get_filtered_actuals(month,financial_year,unit=None,cost_center=None,location_code=None):
    # Previously unscoped: an omitted `unit` meant "no filter" and returned
    # every unit's actuals org-wide to any logged-in user. Only scope on a
    # genuine direct HTTP call - internal callers (sum_of_actuals_by_
    # sequence, etc.) pass their own already-resolved unit through.
    if is_direct_http_call(get_filtered_actuals):
        if unit:
            require_unit_access(unit)
        else:
            allowed_units = get_allowed_units()
            if allowed_units is not None:
                if not allowed_units:
                    return {"status": "success", "data": [], "filtered_record_count": 0}
                unit = ",".join(sorted(allowed_units))

    formatted = get_accounting_period_from_month(
        month,
        financial_year
    )
    accounting_period = formatted.get("accounting_period")
    fiscal_year = formatted.get("fiscal_year")

    result = group_actuals_ytd(
        fiscal_year,accounting_period
    )

    data = result.get("data", [])
    def to_list(value):
        if value is None:
            return None
        if isinstance(value, str):
            return [value.strip() for value in value.split(",") if value.strip()]
        if isinstance(value, (list, tuple)):
            return [str(v).strip() for v in value if v]
        return None
    units = to_list(unit)
    if units:
        data = [d for d in data if d.get("business_unit") in units]

    ccs = to_list(cost_center)
    if ccs:
        data = [d for d in data if d.get("deptid") in ccs]

    locs = to_list(location_code)
    if locs:
        data = [d for d in data if d.get("operating_unit") in locs]

    result["data"] = data
    result["filtered_record_count"] = len(data)

    return result


@guest_api
def get_gl_breakup_for_item(month, financial_year, sequence_id, unit=None, cost_center=None, location_code=None):
    """GL-code-level breakdown of a single budget line item (by sequence_id)
    for the drill-down modal - the item-level rows in get_combined_actuals
    only carry a totalled `total_posted_amt`, this exposes the underlying
    per-GL-code amounts that get summed into it."""
    # Same unit-access scoping as get_filtered_actuals above - previously
    # had none, so an omitted/blank unit returned every unit's GL-code
    # breakdown for this sequence_id org-wide.
    if is_direct_http_call(get_gl_breakup_for_item):
        if unit:
            require_unit_access(unit)
        else:
            allowed_units = get_allowed_units()
            if allowed_units is not None:
                if not allowed_units:
                    return {"status": "success", "fiscal_year": financial_year, "data": []}
                unit = ",".join(sorted(allowed_units))

    formatted = get_accounting_period_from_month(month, financial_year)
    accounting_period = formatted.get("accounting_period")
    fiscal_year = formatted.get("fiscal_year")

    result = group_actuals_by_gl_code(fiscal_year, accounting_period)
    data = result.get("data", [])

    def to_list(value):
        if value is None:
            return None
        if isinstance(value, str):
            return [v.strip() for v in value.split(",") if v.strip()]
        if isinstance(value, (list, tuple)):
            return [str(v).strip() for v in value if v]
        return None

    try:
        seq_id = int(sequence_id)
    except (TypeError, ValueError):
        seq_id = sequence_id
    data = [d for d in data if d.get("sequence_id") == seq_id]

    units = to_list(unit)
    if units:
        data = [d for d in data if d.get("business_unit") in units]

    ccs = to_list(cost_center)
    if ccs:
        data = [d for d in data if d.get("deptid") in ccs]

    locs = to_list(location_code)
    if locs:
        data = [d for d in data if d.get("operating_unit") in locs]

    merged = {}
    for record in data:
        gl_code = record.get("gl_code") or "Unspecified"
        if gl_code not in merged:
            merged[gl_code] = {"gl_code": gl_code, "total_posted_amt": 0}
        merged[gl_code]["total_posted_amt"] += record.get("total_posted_amt", 0)

    rows = sorted(merged.values(), key=lambda r: r["total_posted_amt"], reverse=True)
    for r in rows:
        r["total_posted_amt"] = round(r["total_posted_amt"], 2)

    return {
        "status": "success",
        "fiscal_year": financial_year,
        "accounting_period": accounting_period,
        "data": rows,
    }


# Calls get_filtered_actuals internally and collapses its rows to one total posted_total_amt per budget line item (sequence_id) - a further aggregation step on top of get_filtered_actuals, not a separate data source.
@guest_api
def sum_of_actuals_by_sequence(month, financial_year, unit=None, cost_center=None, location_code=None):
    # Same unit-access scoping as get_filtered_actuals/get_gl_breakup_for_
    # item above - this function calls get_filtered_actuals INTERNALLY
    # (a different dispatched cmd name), so get_filtered_actuals' own check
    # does not fire for this call path - this function must scope itself.
    if is_direct_http_call(sum_of_actuals_by_sequence):
        if unit:
            require_unit_access(unit)
        else:
            allowed_units = get_allowed_units()
            if allowed_units is not None:
                if not allowed_units:
                    return {"status": "success", "data": []}
                unit = ",".join(sorted(allowed_units))

    response = get_filtered_actuals(month, financial_year, unit, cost_center, location_code)

    # DO NOT use response["message"]
    data = response.get("data", [])

    merged_data = {}

    for record in data:
        seq_id = record.get("sequence_id")

        if seq_id not in merged_data:
            merged_data[seq_id] = record.copy()
        else:
            merged_data[seq_id]["total_posted_amt"] += record.get("total_posted_amt", 0)

    return {
        "status": "success",
        "fiscal_year": response.get("fiscal_year"),
        "accounting_period": response.get("accounting_period"),
        "data": list(merged_data.values()),
        "filtered_record_count": len(merged_data)
    }
