import xml.etree.ElementTree as ET

import frappe
import requests

from budget_mis.api_1.adjustments import get_adjustments_month_wise
from budget_mis.utils import guest_api
from budget_mis.api_1.helper import get_peoplesoft_prod_credentials, format_financial_year

#========================================= ERP Actuals API Month wise =======================================================================
# Raw PeopleSoft pull for one fiscal_year/accounting_period, merged with Frappe-side adjustment rows for the same period.
@guest_api
def get_actuals_from_erp_month_wise(fiscal_year, accounting_period):

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

        frappe_rows = get_adjustments_month_wise(format_financial_year(fiscal_year), accounting_period)

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
