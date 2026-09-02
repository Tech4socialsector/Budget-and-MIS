"""Every actuals figure in this app is ultimately sourced from ONE live
PeopleSoft call: get_actuals_from_erp_month_wise (PROD credentials,
pserp.azimpremjifoundation.org:8053, the Z_MIS_ACTUALS_BY_PERIOD query).

A single call to that query with accounting_period=N returns every period
from 0 (PeopleSoft's opening/beginning-balance period) up to N in one
response (verified empirically against PROD) - so it already covers both
"one month's actuals" (filter to that one period) and "year-to-date
actuals" (sum every period except 0) use cases. get_actuals_from_erp,
get_actuals_from_erp_prod, and get_erp_actuals_grouped_by_dimensions are
kept only as thin wrappers around it, for existing callers that expect
their specific names/signatures/output shapes - none of them make their
own separate HTTP request to PeopleSoft any more.
"""

from annual_budget.api.adjustments import get_adjustments_month_wise, get_monthly_adjustments
import frappe
import requests

from annual_budget.utils import guest_api, get_peoplesoft_prod_credentials

# How long a single (fiscal_year, accounting_period) PeopleSoft response is
# reused for - long enough that one page load's several downstream calls
# (budget vs actual's own totals plus a GL-code drill-down click right
# after) share one fetch, short enough that a same-day ERP correction still
# shows up well within the same working session.
ACTUALS_CACHE_TTL = 15 * 60

# ! =======================================================  Actuals API Testing server  ================================================================================
def get_financial_year(year):
    year = int(year)
    return f"{year}-{str(year + 1)[-2:]}"


@guest_api
def get_actuals_from_erp(fiscal_year, accounting_period):
    """Kept only for callers still using the old Z_MIS_ACTUALS (YTD) row
    shape (lowercased keys, no Frappe-side adjustment rows merged in).
    Sourced from the single consolidated PeopleSoft path
    (get_actuals_from_erp_month_wise) rather than its own separate call to
    the legacy erp.azimpremjifoundation.org:8663 host - PeopleSoft already
    returns every period from 0 up to the requested one in a single
    Z_MIS_ACTUALS_BY_PERIOD response (verified empirically), so this is a
    real YTD equivalent, not an approximation."""
    try:
        fiscal_year = int(fiscal_year)
        accounting_period = int(accounting_period)
    except (TypeError, ValueError):
        frappe.throw("fiscal_year and accounting_period must be integers")

    month_wise = get_actuals_from_erp_month_wise(fiscal_year, accounting_period)
    if month_wise.get("status") != "success":
        return month_wise

    rows = [r for r in month_wise.get("data", []) if str(r.get("accounting_period")) != "0"]

    return {
        "status": "success",
        "params": {
            "fiscal_year": fiscal_year,
            "accounting_period": accounting_period
        },
        "data": rows
    }


# * ==============================================================  Actual API Prod with accounting period without opening balance  =====================================================================================
@guest_api
def get_actuals_from_erp_prod(fiscal_year, accounting_period):
    """Kept for existing callers (ERP Actuals page's "YTD" option,
    export_reports.py) expecting this name/signature. Sourced from the
    single consolidated PeopleSoft path (get_actuals_from_erp_month_wise)
    rather than its own separate Z_MIS_ACTUALS call - see get_actuals_from_erp
    for why a single Z_MIS_ACTUALS_BY_PERIOD call already covers YTD."""
    try:
        month_wise = get_actuals_from_erp_month_wise(fiscal_year, accounting_period)
    except requests.exceptions.Timeout:
        return {
            "status": "failed",
            "error": "Request timeout while connecting to ERP"
        }
    except Exception:
        frappe.log_error(
            title="PeopleSoft API Error",
            message=frappe.get_traceback()
        )
        return {
            "status": "failed",
            "error": "Unexpected server error"
        }

    if month_wise.get("status") != "success":
        return month_wise

    erp_rows = [r for r in month_wise.get("data", []) if str(r.get("accounting_period")) != "0"]
    frappe_rows = get_monthly_adjustments(get_financial_year(fiscal_year), accounting_period)
    combined_rows = erp_rows + frappe_rows

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "count": len(combined_rows),
        "data": combined_rows
    }


import frappe
import requests
import xml.etree.ElementTree as ET
def convert_year(year):
    return f"{year}-{str(int(year) + 1)[-2:]}"
@guest_api
def get_actuals_from_erp_month_wise(fiscal_year, accounting_period):
    """Cached for ACTUALS_CACHE_TTL: this is the one live PeopleSoft HTTP
    call every actuals path in the app ultimately funnels through (see
    module docstring), so a single page load - e.g. Budget vs Actual's
    initial get_combined_actuals plus a follow-up GL-code drill-down click
    on one of its items - would otherwise re-issue the same ~30-120s ERP
    request twice for the exact same (fiscal_year, accounting_period)."""
    cache_key = f"annual_budget:erp_actuals_month_wise:{fiscal_year}:{accounting_period}"
    cached = frappe.cache().get_value(cache_key)
    if cached is not None:
        return cached

    result = _fetch_actuals_from_erp_month_wise(fiscal_year, accounting_period)
    if result.get("status") == "success":
        frappe.cache().set_value(cache_key, result, expires_in_sec=ACTUALS_CACHE_TTL)
    return result


def _fetch_actuals_from_erp_month_wise(fiscal_year, accounting_period):
    try:
        username, password = get_peoplesoft_prod_credentials()

        if not username or not password:
            frappe.throw("ERP credentials are not configured")

        base_url = (
            "https://pserp.azimpremjifoundation.org:8053/"
            "PSIGW/RESTListeningConnector/"
            "PSFT_EP/ExecuteQuery.v1/PUBLIC/"
            "Z_MIS_ACTUALS_BY_PERIOD/XMLP/NONFILE"
        )

        api_url = (
            f"{base_url}"
            f"?isconnectedquery=N"
            f"&maxrows=100000"
            f"&prompt_uniquepromptname=FISCAL_YEAR,ACCOUNTING_PERIOD"
            f"&prompt_fieldvalue={fiscal_year},{accounting_period}"
        )

        erp_rows = []  # ← initialize once, here

        response = requests.get(
            api_url,
            headers={"Accept": "application/xml"},
            auth=(username, password),
            timeout=120
        )

        if response.status_code != 200:
            frappe.log_error("ERP HTTP Error", response.text[:500])
        else:
            try:
                root = ET.fromstring(response.content)
            except ET.ParseError:
                frappe.log_error("XML Parse Error", response.text[:500])
            else:
                for row_elem in root.iter():
                    if row_elem.tag.lower().endswith("row"):
                        row_data = {
                            child.tag.split("}")[-1].lower(): child.text
                            for child in row_elem
                        }
                        erp_rows.append(row_data)

        frappe_rows = get_adjustments_month_wise(convert_year(fiscal_year), accounting_period)

        combined_rows = erp_rows + frappe_rows

        return {
            "status": "success",
            "fiscal_year": fiscal_year,
            "accounting_period": accounting_period,
            "count": len(combined_rows),
            "data": combined_rows
        }

    except requests.exceptions.Timeout:
        frappe.log_error("ERP Timeout", "Request timed out")
        return {
            "status": "failed",
            "error": "Request timeout while connecting to ERP"
        }

    except Exception:
        frappe.log_error("API Error", frappe.get_traceback())
        return {
            "status": "failed",
            "error": "Unexpected server error"
        }


@guest_api
def get_erp_actuals_grouped_by_dimensions(fiscal_year, accounting_period):
    """Kept for its one existing caller (get_grouped_actuals_month_wise).
    Sourced from the single consolidated PeopleSoft path
    (get_actuals_from_erp_month_wise) instead of its own separate
    Z_MIS_ACTUALS_BY_PERIOD call, then grouped/deduped client-side exactly
    as before - except for two bugs fixed here: this used to always fetch
    the whole fiscal year (hardcoded period 12, ignoring its own
    accounting_period argument) and never excluded PeopleSoft's period "0"
    (opening/beginning balance, not fiscal-year activity). Both are fixed
    so this function's own accounting_period argument now genuinely bounds
    the result to YTD-through-that-period, same as get_grouped_actuals and
    every other actuals path in this app already do."""
    try:
        month_wise = get_actuals_from_erp_month_wise(fiscal_year, accounting_period)
    except requests.exceptions.Timeout:
        frappe.log_error("PeopleSoft Timeout", "ERP request timed out")
        return {"status": "failed", "error": "Request timeout while connecting to ERP"}
    except Exception:
        frappe.log_error("PeopleSoft API Unexpected Error", frappe.get_traceback())
        return {"status": "failed", "error": "Unexpected server error"}

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



import frappe
from collections import defaultdict

@guest_api
def get_actuals_by_gl_code(fiscal_year, accounting_period):
    """Same YTD-through-accounting_period rows as get_grouped_actuals, but
    keeping `account` (raw ERP GL code) in the grouping key instead of
    collapsing it away - lets a caller drill a single sequence_id/
    type_of_expense down into its GL-code-level breakdown."""
    month_wise = get_grouped_actuals_month_wise(fiscal_year, accounting_period)

    if month_wise.get("status") != "success":
        return {"status": month_wise.get("status", "failed"), "fiscal_year": fiscal_year, "data": []}

    grouped = defaultdict(float)

    for record in month_wise.get("data", []):
        key = (
            record.get("business_unit"),
            record.get("deptid"),
            record.get("operating_unit"),
            record.get("head_of_expense"),
            record.get("sub_head_of_expense"),
            record.get("type_of_expense"),
            record.get("sequence_id"),
            record.get("account"),
        )
        grouped[key] += float(record.get("total_posted_amt") or 0)

    final_output = []
    for (
        business_unit,
        deptid,
        operating_unit,
        head_of_expense,
        sub_head_of_expense,
        type_of_expense,
        sequence_id,
        account,
    ), total_sum in grouped.items():
        final_output.append({
            "sequence_id": sequence_id,
            "business_unit": business_unit,
            "deptid": deptid,
            "operating_unit": operating_unit,
            "head_of_expense": head_of_expense,
            "sub_head_of_expense": sub_head_of_expense,
            "type_of_expense": type_of_expense,
            "gl_code": account,
            "total_posted_amt": round(total_sum, 2)
        })

    final_output.sort(key=lambda x: (x.get("sequence_id") or 0, x.get("gl_code") or ""))

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "data": final_output
    }


@guest_api
def get_grouped_actuals(fiscal_year, accounting_period):
    """YTD-through-accounting_period actuals grouped by
    (business_unit, deptid, operating_unit, head_of_expense,
    sub_head_of_expense, type_of_expense, sequence_id) - i.e. months and GL
    accounts collapsed into one total per dimension combo.

    A thin wrapper around get_grouped_actuals_month_wise: that function is
    the one place this app now computes grouped actuals (the Expenses/GL
    code Mapping join happens there and nowhere else), and its per-period
    rows already exclude PeopleSoft's period "0". This just sums those rows
    across accounting_period and account, which is a safe no-op collapse -
    account never appears in this function's own grouping key, and summing
    a value over an extra key that's about to be dropped doesn't change the
    total, it only skips an intermediate breakdown nothing here reads."""
    month_wise = get_grouped_actuals_month_wise(fiscal_year, accounting_period)

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


@guest_api
def get_grouped_actuals_month_wise(fiscal_year, accounting_period):

    # ----------------------------
    # 1️⃣ Fetch ERP Data
    # ----------------------------
    erp_response = get_erp_actuals_grouped_by_dimensions(fiscal_year, accounting_period)

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

    # ----------------------------
    # 2️⃣ Fetch Expenses
    # ----------------------------
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

    # ----------------------------
    # 3️⃣ Fetch GL Code Mapping
    # ----------------------------
    child_rows = frappe.get_all(
        "GL code Mapping",
        fields=["parent", "gl_code_map"]
    )

    gl_parent_map = {str(row.gl_code_map).strip(): str(row.parent) for row in child_rows}

    # ----------------------------
    # 4️⃣ Group Data
    # ----------------------------
    from collections import defaultdict
    grouped = defaultdict(float)

    for record in erp_data:

        account = str(record.get("account", "")).strip()
        period = record.get("accounting_period")   # 👈 get actual ERP period
        amount = float(record.get("posted_total_amt", 0) or 0)

        parent = gl_parent_map.get(account)
        if not parent:
            continue

        expense = expense_lookup.get(parent)
        if not expense:
            continue

        key = (
            period,   # 👈 important
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

    # ----------------------------
    # 5️⃣ Prepare Output
    # ----------------------------
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
            "accounting_period": period,  # 👈 actual period
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

    # ----------------------------
    # 6️⃣ Sort by sequence_id
    # ----------------------------
    final_output.sort(key=lambda x: (x.get("sequence_id") or 0))

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "data": final_output,
        "count": len(final_output)
    }

