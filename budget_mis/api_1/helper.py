import re
from decimal import Decimal

import frappe


# Safely converts a value (including None or malformed numeric strings) to a float, returning 0.0 on any failure.
def to_number(x):
    if x is None:
        return 0.0
    try:
        return float(Decimal(str(x)))
    except Exception:
        return 0.0


# Collapses repeated whitespace and uppercases a value, for case/spacing-insensitive head/sub-head/item name comparisons.
def normalize(val):
    return re.sub(r"\s+", " ", str(val or "")).strip().upper()


# Returns (user_name, password) for the PeopleSoft production endpoints from the ERP Credentials singleton.
def get_peoplesoft_prod_credentials():
    doc = frappe.get_single("ERP Credentials")
    return doc.peoplesoft_erp_user_name_prod, doc.get_password("peoplesoft_erp_password_prod")


# Formats a 4-digit calendar year as this app's "YYYY-YY" financial-year string.
def format_financial_year(year):
    year = int(year)
    return f"{year}-{str(year + 1)[-2:]}"


# Converts a month name + financial year into an accounting_period number (April=1 ... March=12) and the fiscal year start.
def get_accounting_period_from_month(month, financial_year=None):
    month_map = {
        "march": 12,
        "april": 1,
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


# Returns the financial year immediately before the given one, in the same "YYYY-YY" format.
def get_previous_financial_year(financial_year):
    start_year = int(financial_year.split("-")[0])
    prev_start = start_year - 1
    prev_end = str(prev_start + 1)[-2:]

    return f"{prev_start}-{prev_end}"
