import frappe


def get_peoplesoft_uat_credentials():
    """Return (user_name, password) for the PeopleSoft UAT endpoints.

    Not currently called anywhere - every actuals fetch in
    budget_mis/api/erp_actuals.py is consolidated onto a single PROD path
    (fetch_actuals_month_wise, via get_peoplesoft_prod_credentials).
    Kept only because the ERP Credentials doctype still has UAT fields for
    admins to fill in if a UAT-backed path is ever reintroduced."""
    doc = frappe.get_single("ERP Credentials")
    return doc.peoplesoft_erp_user_name_uat, doc.get_password("peoplesoft_erp_password_uat")


def get_peoplesoft_prod_credentials():
    """Return (user_name, password) for the PeopleSoft production endpoints."""
    doc = frappe.get_single("ERP Credentials")
    return doc.peoplesoft_erp_user_name_prod, doc.get_password("peoplesoft_erp_password_prod")


def financial_year_label(year):
    """Format a 4-digit calendar year as this app's "YYYY-YY" financial-year string."""
    year = int(year)
    return f"{year}-{str(year + 1)[-2:]}"
