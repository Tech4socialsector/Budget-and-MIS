from annual_budget.utils import guest_api

import frappe
from annual_budget.api.actuals import get_actuals_from_erp
from annual_budget.api.actuals import get_grouped_actuals
from annual_budget.api.actuals import get_actuals_by_gl_code


@guest_api
def get_actuals_university_ppt(fiscal_year, accounting_period, Unit):
    expenses = frappe.get_list(
        "Expenses",
        fields=["gl_code", "head_of_expense"],
        ignore_permissions=True
    )

    gl_head_map = {}
    for e in expenses:
        gl = e.get("gl_code")
        head = (e.get("head_of_expense") or "").strip().lower()
        if gl:
            gl_head_map[gl] = head

    result = get_accounting_period_from_month(accounting_period, fiscal_year)
    accounting_period = result.get("accounting_period")
    fiscal_year = result.get("fiscal_year")
    actuals_response = get_actuals_from_erp(fiscal_year, accounting_period)

    if actuals_response.get("status") != "success":
        frappe.throw("Failed to fetch Actuals from ERP")

    actual_rows = actuals_response.get("data", [])

    grouped_data = {}

    for row in actual_rows:
        business_unit = row.get("business_unit") or "UNKNOWN"
        deptid = row.get("deptid") or "UNKNOWN"
        gl_code = row.get("account")
        amount = float(row.get("posted_total_amt") or 0)

        head = gl_head_map.get(gl_code, "operating")

        key = f"{business_unit}::{deptid}"

        if key not in grouped_data:
            grouped_data[key] = {
                "business_unit": business_unit,
                "deptid": deptid,
                "capital_total": 0,
                "operating_total": 0,
                "grand_total": 0
            }

        if "capital" in head:
            grouped_data[key]["capital_total"] += amount
        else:
            grouped_data[key]["operating_total"] += amount

        grouped_data[key]["grand_total"] = (
            grouped_data[key]["capital_total"] +
            grouped_data[key]["operating_total"]
        )

    unit_list = [u.strip() for u in Unit.split(",")] if Unit else []

    filtered_data = [
        v for v in grouped_data.values()
        if not unit_list or v.get("business_unit") in unit_list
    ]
    return {
        "status": "success",
        "count": len(filtered_data),
        "data": filtered_data
    }


@guest_api
def get_accounting_period_from_month(month, financial_year=None):
    month_map = {
        "march":12,
        "april":1 ,
        "may": 2,
        "june": 3,
        "july": 4,
        "august": 5,
        "september": 6,
        "october": 7,
        "november": 8,
        "december": 9,
        "january": 10,
        "february": 11,
    }

    month = (month or "").strip().lower()
    financial_year = (financial_year or "").strip()

    if month not in month_map:
        frappe.throw("Invalid month. Use April to March")

    accounting_period = month_map[month]

    fiscal_year_start = None
    if financial_year:
        try:
            fiscal_year_start = int(financial_year.split("-")[0])
        except Exception:
            frappe.throw("Invalid Financial Year format. Use format like 2025-26")

    return {
        "accounting_period": accounting_period,
        "fiscal_year": fiscal_year_start
    }

@guest_api
def get_previous_financial_year(financial_year):

    start_year = int(financial_year.split("-")[0])
    prev_start = start_year - 1
    prev_end = str(prev_start + 1)[-2:]

    return f"{prev_start}-{prev_end}"


@guest_api
def get_filtered_actuals(month,financial_year,unit=None,cost_center=None,location_code=None):
    formatted = get_accounting_period_from_month(
        month,
        financial_year
    )
    accounting_period = formatted.get("accounting_period")
    fiscal_year = formatted.get("fiscal_year")

    result = get_grouped_actuals(
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
    formatted = get_accounting_period_from_month(month, financial_year)
    accounting_period = formatted.get("accounting_period")
    fiscal_year = formatted.get("fiscal_year")

    result = get_actuals_by_gl_code(fiscal_year, accounting_period)
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


@guest_api
def sum_of_actuals_by_sequence(month, financial_year, unit=None, cost_center=None, location_code=None):

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
