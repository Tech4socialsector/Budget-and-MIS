import frappe
import json

def execute(filters=None):
    if not filters:
        filters = {}

    columns = get_columns()
    data = get_data(filters)
    return columns, data


def get_columns():
    """Define columns for consolidated report (with Quarterly totals)."""
    return [
        {"label": "Type of Expense", "fieldname": "type_of_expense", "fieldtype": "Link", "options": "Expenses", "width": 250},
        {"label": "Head of Expense", "fieldname": "head_of_expense", "fieldtype": "Data", "width": 250},
        {"label": "Sub Head", "fieldname": "sub_head_of_expense", "fieldtype": "Data", "width": 250},

        # Monthly columns
        *[
            {"label": m, "fieldname": m.lower(), "fieldtype": "Currency", "width": 250}
            for m in [
                "April", "May", "June", "July", "August", "September",
                "October", "November", "December", "January", "February", "March"
            ]
        ],

        # Quarterly + Year Total
        {"label": "Quarter 1 (Apr–Jun)", "fieldname": "quarter_1", "fieldtype": "Currency", "width": 200},
        {"label": "Quarter 2 (Jul–Sep)", "fieldname": "quarter_2", "fieldtype": "Currency", "width": 200},
        {"label": "Quarter 3 (Oct–Dec)", "fieldname": "quarter_3", "fieldtype": "Currency", "width": 200},
        {"label": "Quarter 4 (Jan–Mar)", "fieldname": "quarter_4", "fieldtype": "Currency", "width": 200},
        {"label": "Year Total", "fieldname": "year_total", "fieldtype": "Currency", "width": 150},
    ]


# ---------- Helper Functions ----------

def normalize_filter(value):
    """Normalize filter inputs (list, JSON, or comma string) into Python list."""
    if not value:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
        return [v.strip() for v in value.split(",") if v.strip()]
    return []


# ---------- Core Logic ----------

def get_data(filters):
    """Fetch consolidated data according to Financial Year, Unit, Cost Center, and Location Code filters."""

    # Mandatory Financial Year
    if not filters.get("financial_year"):
        frappe.throw("Please select a Financial Year.")

    financial_year = filters.get("financial_year")

    # Normalize all filters
    unit_list = normalize_filter(filters.get("set_id"))
    cost_center_list = normalize_filter(filters.get("cost_center"))
    location_list = normalize_filter(filters.get("location_code"))

    # Build dynamic conditions with bound parameters (no string interpolation)
    conditions = ["fb.financial_year = %s"]
    values = [financial_year]

    if unit_list:
        placeholders = ", ".join(["%s"] * len(unit_list))
        conditions.append(f"fb.set_id IN ({placeholders})")
        values.extend(unit_list)

    if cost_center_list:
        placeholders = ", ".join(["%s"] * len(cost_center_list))
        conditions.append(f"fb.cost_center IN ({placeholders})")
        values.extend(cost_center_list)

    if location_list:
        placeholders = ", ".join(["%s"] * len(location_list))
        conditions.append(f"fb.location_code IN ({placeholders})")
        values.extend(location_list)

    where_clause = "WHERE " + " AND ".join(conditions)

    # Main query
    query = f"""
        SELECT
            fba.type_of_expense,
            fba.head_of_expense,
            fba.sub_head_of_expense,
            SUM(fba.april) AS april,
            SUM(fba.may) AS may,
            SUM(fba.june) AS june,
            SUM(fba.july) AS july,
            SUM(fba.august) AS august,
            SUM(fba.september) AS september,
            SUM(fba.october) AS october,
            SUM(fba.november) AS november,
            SUM(fba.december) AS december,
            SUM(fba.january) AS january,
            SUM(fba.february) AS february,
            SUM(fba.march) AS march
        FROM
            `tabFinance Budget` fb
        INNER JOIN
            `tabFinance Budget Amounts` fba
            ON fba.parent = fb.name
        {where_clause}
        GROUP BY
            fba.type_of_expense, fba.head_of_expense, fba.sub_head_of_expense
        ORDER BY
            fba.type_of_expense
    """

    data = frappe.db.sql(query, values, as_dict=True)

    # Calculate quarters & yearly total
    for row in data:
        row["quarter_1"] = sum(float(row.get(m) or 0) for m in ["april", "may", "june"])
        row["quarter_2"] = sum(float(row.get(m) or 0) for m in ["july", "august", "september"])
        row["quarter_3"] = sum(float(row.get(m) or 0) for m in ["october", "november", "december"])
        row["quarter_4"] = sum(float(row.get(m) or 0) for m in ["january", "february", "march"])
        row["year_total"] = (
            row["quarter_1"]
            + row["quarter_2"]
            + row["quarter_3"]
            + row["quarter_4"]
        )

    return data
