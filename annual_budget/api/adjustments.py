from annual_budget.utils import guest_api
import frappe
from collections import defaultdict


@guest_api
def get_adjustments_month_wise(financial_year=None, month=None):

    month_map = {
        "April": 1, "May": 2, "June": 3, "July": 4,
        "August": 5, "September": 6, "October": 7,
        "November": 8, "December": 9,
        "January": 10, "February": 11, "March": 12
    }

    if month is not None:
        try:
            month = int(month)
            if not (1 <= month <= 12):
                frappe.throw("Month must be between 1 and 12")
        except (ValueError, TypeError):
            frappe.throw("Invalid month format. Must be integer 1–12")

    filters = {}
    if financial_year:
        filters["financial_year"] = financial_year

    docs = frappe.get_all(
        "Monthly Adjustment",
        filters=filters,
        fields=["name", "month"]
    )

    if not docs:
        return []

    # Group amounts by (key, period) — no cumulative, just per-period sums
    grouped_data = defaultdict(lambda: defaultdict(float))

    for doc in docs:
        if isinstance(doc.month, int):
            period = doc.month
        elif str(doc.month).isdigit():
            period = int(doc.month)
        else:
            period = month_map.get(doc.month)

        if not period:
            continue

        # ✅ Include periods 1 up to requested month (all of them separately)
        if month is not None and period > month:
            continue

        full_doc = frappe.get_doc("Monthly Adjustment", doc.name)

        for row in full_doc.adjustment_line_items:
            amount = row.adjustment_amount or 0
            if row.adjustment_type == "Minus":
                amount = -amount

            key = (
                row.unit,
                row.gl_code,
                getattr(row, "location_code_erp", None) or row.location_code,
                getattr(row, "cost_center_erp", None) or row.cost_center
            )

            # ✅ Sum by period separately — no running total
            grouped_data[key][period] += amount

    fiscal_year_label = financial_year if financial_year else ""
    result = []

    for key, period_totals in grouped_data.items():
        # ✅ Each period becomes its own row with just that period's amount
        for period in sorted(period_totals.keys()):
            result.append({
                "business_unit": key[0],
                "ledger": "ADJUSTMENT",
                "account": key[1],
                "deptid": key[3],
                "operating_unit": key[2],
                "accounting_period": str(period),
                "fiscal_year": fiscal_year_label,
                "is_adjustment": 1,
                "posted_total_amt": round(period_totals[period], 2)
            })

    frappe.logger().debug(f"Total month-wise records: {len(result)}")
    return result




import frappe
from collections import defaultdict


@guest_api
def get_monthly_adjustments(financial_year=None, month=None):

    month_map = {
        "April": 1, "May": 2, "June": 3, "July": 4,
        "August": 5, "September": 6, "October": 7,
        "November": 8, "December": 9,
        "January": 10, "February": 11, "March": 12
    }

    if month is not None:
        try:
            month = int(month)
            if not (1 <= month <= 12):
                frappe.throw("Month must be between 1 and 12")
        except (ValueError, TypeError):
            frappe.throw("Invalid month format. Must be integer 1–12")

    filters = {}
    if financial_year:
        filters["financial_year"] = financial_year

    docs = frappe.get_all(
        "Monthly Adjustment",
        filters=filters,
        fields=["name", "month"]
    )

    if not docs:
        return []

    grouped_data = defaultdict(float)

    for doc in docs:
        if isinstance(doc.month, int):
            period = doc.month
        elif str(doc.month).isdigit():
            period = int(doc.month)
        else:
            period = month_map.get(doc.month)

        if not period:
            continue

        if month is not None and period > month:
            continue

        full_doc = frappe.get_doc("Monthly Adjustment", doc.name)

        for row in full_doc.adjustment_line_items:
            amount = row.adjustment_amount or 0
            if row.adjustment_type == "Minus":
                amount = -amount

            key = (
                row.unit,
                row.gl_code,
                getattr(row, "location_code_erp", None) or row.location_code,
                getattr(row, "cost_center_erp", None) or row.cost_center
            )

            grouped_data[key] += amount

    result = []

    for key, total in grouped_data.items():
        result.append({
            "business_unit": key[0],
            "ledger": "ADJUSTMENT",
            "account": key[1],
            "deptid": key[3],
            "operating_unit": key[2],
            "accounting_period": str(month) if month else "",
            "fiscal_year": financial_year if financial_year else "",  # ✅
            "is_adjustment": 1,
            "posted_total_amt": round(total, 2)                       # ✅
        })

    frappe.logger().info(f"Total grouped records: {len(result)}")
    return result

