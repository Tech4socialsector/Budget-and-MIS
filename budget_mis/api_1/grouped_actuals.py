from collections import defaultdict

import frappe

from budget_mis.utils import guest_api
from budget_mis.api_1.erp_actuals import get_actuals_from_erp_month_wise


# Drops PeopleSoft's opening-balance period "0" and sums duplicate (unit, account, dept, operating_unit, period) rows into one.
@guest_api
def group_actuals_by_dimension(fiscal_year, accounting_period):
    month_wise = get_actuals_from_erp_month_wise(fiscal_year, accounting_period)

    if month_wise.get("status") != "success":
        return month_wise

    grouped = {}
    for row_data in month_wise.get("data", []):
        if str(row_data.get("accounting_period")) == "0":
            continue

        key = (
            row_data.get("business_unit"),
            row_data.get("account"),
            row_data.get("deptid"),
            row_data.get("operating_unit"),
            row_data.get("accounting_period")
        )

        amt = float(row_data.get("posted_total_amt") or 0)

        if key not in grouped:
            grouped[key] = {
                "business_unit": key[0],
                "account": key[1],
                "deptid": key[2],
                "operating_unit": key[3],
                "accounting_period": key[4],
                "posted_total_amt": amt
            }
        else:
            grouped[key]["posted_total_amt"] += amt

    result = list(grouped.values())

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "count": len(result),
        "data": result
    }


# Joins each row's GL account against GL code Mapping + Expenses to attach head_of_expense/sub_head_of_expense/type_of_expense/sequence_id, dropping unmapped accounts.
@guest_api
def group_actuals_by_gl_mapping(fiscal_year, accounting_period):
    erp_response = group_actuals_by_dimension(fiscal_year, accounting_period)

    if "message" in erp_response:
        erp_data = erp_response.get("message", {}).get("data", [])
    else:
        erp_data = erp_response.get("data", [])

    if not erp_data:
        return {
            "status": "success",
            "fiscal_year": fiscal_year,
            "accounting_period": accounting_period,
            "data": [],
            "count": 0
        }

    expenses = frappe.get_all(
        "Expenses",
        fields=[
            "name",
            "head_of_expense",
            "sub_head_of_expense",
            "type_of_expense",
            "sequence_id"
        ]
    )

    expense_lookup = {str(e.name): e for e in expenses}

    child_rows = frappe.get_all(
        "GL code Mapping",
        fields=["parent", "gl_code_map"]
    )

    gl_parent_map = {str(row.gl_code_map).strip(): str(row.parent) for row in child_rows}

    grouped = defaultdict(float)

    for record in erp_data:
        account = str(record.get("account", "")).strip()
        period = record.get("accounting_period")
        amount = float(record.get("posted_total_amt", 0) or 0)

        parent = gl_parent_map.get(account)
        if not parent:
            continue

        expense = expense_lookup.get(parent)
        if not expense:
            continue

        key = (
            period,
            record.get("business_unit"),
            record.get("deptid"),
            record.get("operating_unit"),
            account,
            expense.head_of_expense,
            expense.sub_head_of_expense,
            expense.type_of_expense,
            expense.sequence_id
        )

        grouped[key] += amount

    final_output = []

    for (
        period,
        business_unit,
        deptid,
        operating_unit,
        account,
        head_of_expense,
        sub_head_of_expense,
        type_of_expense,
        sequence_id
    ), total_sum in grouped.items():

        final_output.append({
            "sequence_id": sequence_id,
            "accounting_period": period,
            "account": account,
            "business_unit": business_unit,
            "deptid": deptid,
            "operating_unit": operating_unit,
            "head_of_expense": head_of_expense,
            "sub_head_of_expense": sub_head_of_expense,
            "type_of_expense": type_of_expense,
            "actuals_type_of_expenses": type_of_expense,
            "total_posted_amt": round(total_sum, 2)
        })

    final_output.sort(key=lambda x: (x.get("sequence_id") or 0))

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "data": final_output,
        "count": len(final_output)
    }


# Collapses month_wise's per-month, per-GL-code rows into one YTD total per (unit, dept, operating_unit, head/sub-head/type).
@guest_api
def group_actuals_ytd(fiscal_year, accounting_period):
    month_wise = group_actuals_by_gl_mapping(fiscal_year, accounting_period)

    if month_wise.get("status") != "success":
        return {"status": month_wise.get("status", "failed"), "fiscal_year": fiscal_year, "data": []}

    grouped = defaultdict(float)
    meta_by_key = {}

    for record in month_wise.get("data", []):
        key = (
            record.get("business_unit"),
            record.get("deptid"),
            record.get("operating_unit"),
            record.get("head_of_expense"),
            record.get("sub_head_of_expense"),
            record.get("type_of_expense"),
            record.get("sequence_id"),
        )
        grouped[key] += float(record.get("total_posted_amt") or 0)
        meta_by_key.setdefault(key, record.get("actuals_type_of_expenses"))

    final_output = []
    for (
        business_unit,
        deptid,
        operating_unit,
        head_of_expense,
        sub_head_of_expense,
        type_of_expense,
        sequence_id,
    ), total_sum in grouped.items():
        final_output.append({
            "sequence_id": sequence_id,
            "business_unit": business_unit,
            "deptid": deptid,
            "operating_unit": operating_unit,
            "head_of_expense": head_of_expense,
            "sub_head_of_expense": sub_head_of_expense,
            "type_of_expense": type_of_expense,
            "actuals_type_of_expenses": meta_by_key.get((
                business_unit, deptid, operating_unit, head_of_expense,
                sub_head_of_expense, type_of_expense, sequence_id,
            )) or type_of_expense,
            "total_posted_amt": round(total_sum, 2)
        })

    final_output.sort(key=lambda x: (x.get("sequence_id") or 0))

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "data": final_output
    }
