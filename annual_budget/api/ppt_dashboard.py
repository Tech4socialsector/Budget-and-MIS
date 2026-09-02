from annual_budget.utils import guest_api
import frappe
from frappe import _
from frappe.utils import flt
import frappe
from annual_budget.api.actual_format import get_actuals_university_ppt



@guest_api
def get_university_budget_summary(financial_year=None, month=None, entity=None):
    if not financial_year:
        frappe.throw("Financial year is required")

    # -------------------------------------------------------
    # Cache for Cost Center lookups (to avoid repeated DB hits)
    # -------------------------------------------------------
    cost_center_cache = {}

    def get_cost_center_from_doctype(cost_center_id):
        if cost_center_id in cost_center_cache:
            return cost_center_cache[cost_center_id]

        cost_center_doc = frappe.get_list(
            "Cost Center",
            fields=["name", "cost_center"],
            filters={"name": cost_center_id},
            ignore_permissions=True
        )

        if cost_center_doc:
            cost_center_cache[cost_center_id] = cost_center_doc[0]
        else:
            cost_center_cache[cost_center_id] = {
                "name": cost_center_id,
                "cost_center": None
            }

        return cost_center_cache[cost_center_id]

    # -------------------------------------------------------
    # Fiscal year months (April → March)
    # -------------------------------------------------------
    valid_months = [
        "april", "may", "june", "july", "august", "september",
        "october", "november", "december", "january", "february", "march"
    ]

    ytd_months = []
    if month:
        month_field = month.strip().lower()
        if month_field not in valid_months:
            frappe.throw(f"Invalid month name. Must be one of: {', '.join(valid_months)}")
        ytd_months = valid_months[:valid_months.index(month_field) + 1]

    if ytd_months:
        sum_expr = " + ".join([f"COALESCE(fba.{m}, 0)" for m in ytd_months])
        select_amount = f"SUM({sum_expr}) AS total_amount"
    else:
        select_amount = "SUM(fba.year) AS total_amount"

    # -------------------------------------------------------
    # Prepare filters
    # -------------------------------------------------------
    conditions = ["fb.financial_year = %s"]
    params = [financial_year]

    entity_list = []
    if entity:
        if isinstance(entity, str):
            entity_list = [e.strip() for e in entity.split(",") if e.strip()]
        elif isinstance(entity, list):
            entity_list = entity

        if entity_list:
            placeholders = ", ".join(["%s"] * len(entity_list))
            conditions.append(f"fb.set_id IN ({placeholders})")
            params.extend(entity_list)

    where_clause = " AND ".join(conditions)

    # -------------------------------------------------------
    # SQL Query
    # -------------------------------------------------------
    query = f"""
        SELECT
            fb.set_id AS entity,
            fb.entity__unit_decription AS entity_description,
            fb.cc_descr AS cost_description,
            fb.cost_center AS cost_center_id,
            fba.head_of_expense,
            {select_amount}
        FROM
            `tabFinance Budget` fb
        INNER JOIN
            `tabFinance Budget Amounts` fba
            ON fba.parent = fb.name
        WHERE
            {where_clause}
        GROUP BY
            fb.set_id, fb.cc_descr, fb.cost_center, fba.head_of_expense
        ORDER BY
            fb.set_id, fb.cc_descr
    """

    data = frappe.db.sql(query, tuple(params), as_dict=True)

    # -------------------------------------------------------
    # Process result
    # -------------------------------------------------------
    entity_map = {}

    for row in data:
        entity_name = row.entity or "Unknown Entity"
        entity_descr = row.entity_description or ""
        cost_descr = row.cost_description or "Unknown"
        cost_center_id = row.cost_center_id or "Unknown"

        # 🔥 Fetch Cost Center value from Doctype
        cc_doc = get_cost_center_from_doctype(cost_center_id)
        cost_center_value = cc_doc.get("cost_center") or cost_center_id

        if entity_name not in entity_map:
            entity_map[entity_name] = {
                "entity": entity_name,
                "entity_description": entity_descr,
                "cost_centers": {}
            }

        if cost_descr not in entity_map[entity_name]["cost_centers"]:
            entity_map[entity_name]["cost_centers"][cost_descr] = {
                "cost_description": cost_descr,
                "cost_center_id": cost_center_id,
                "cost_center": cost_center_value,
                "capital_total": 0,
                "operating_total": 0,
                "grand_total": 0
            }

        head = (row.head_of_expense or "").strip().lower()
        amount = row.total_amount or 0

        if "capital" in head:
            entity_map[entity_name]["cost_centers"][cost_descr]["capital_total"] += amount
        else:
            entity_map[entity_name]["cost_centers"][cost_descr]["operating_total"] += amount

        entry = entity_map[entity_name]["cost_centers"][cost_descr]
        entry["grand_total"] = entry["capital_total"] + entry["operating_total"]

    # -------------------------------------------------------
    # Final Output
    # -------------------------------------------------------
    result = []
    for entity_name, data_dict in entity_map.items():
        result.append({
            "entity": entity_name,
            "entity_description": data_dict["entity_description"],
            "cost_centers": list(data_dict["cost_centers"].values())
        })

    return result


@frappe.whitelist()
def get_school_budget_summary(financial_year=None, month=None, cost_center=None):
    """
    Returns combined Capital, Operating, and Grand totals grouped by State (YTD up to given month).
    Filters:
      - financial_year: required
      - month: optional (for YTD totals, e.g. 'September')
      - cost_center: optional (comma-separated list -> filters Finance Budget parent)
    """
    if not financial_year:
        frappe.throw(_("Financial Year is required"))

    # Canonical month order (ERPNext fiscal year Apr–Mar)
    months_order = [
        "april", "may", "june",
        "july", "august", "september",
        "october", "november", "december",
        "january", "february", "march"
    ]

    # Determine active (YTD) months
    if month:
        m = month.strip().lower()
        if m not in months_order:
            frappe.throw(_("Invalid month name. Must be one of: {0}")
                         .format(", ".join(months_order)))
        active_months = months_order[: months_order.index(m) + 1]
    else:
        active_months = months_order[:]  # full year

    # Build YTD expression once: COALESCE(april,0)+COALESCE(may,0)+...
    ytd_expr = " + ".join([f"COALESCE(fba.`{m}`, 0)" for m in active_months])

    # Prepare filters & params
    params = {"financial_year": financial_year}
    cost_centers = None
    if cost_center:
        cost_centers = [cc.strip() for cc in cost_center.split(",") if cc.strip()]
        if cost_centers:
            params["cost_centers"] = tuple(cost_centers)

    # NOTE:
    # - Join parent (Finance Budget) and child (Finance Budget Amounts)
    # - total_ytd: sum over all heads
    # - capital_ytd: sum only rows whose head_of_expense contains 'capital' (case-insensitive)
    # - operating_ytd derived in Python as total - capital (avoids mislabels)
    # - state normalized via COALESCE
    sql = f"""
        SELECT
            COALESCE(fb.state, 'Unknown') AS state,
            SUM( {ytd_expr} )                             AS total_ytd,
            SUM( CASE
                    WHEN LOWER(COALESCE(fba.head_of_expense, '')) LIKE '%%capital%%'
                        THEN ({ytd_expr})
                    ELSE 0
                END )                                     AS capital_ytd
        FROM `tabFinance Budget` fb
        JOIN `tabFinance Budget Amounts` fba
              ON fba.parent = fb.name
        WHERE fb.financial_year = %(financial_year)s
        { "AND fb.cost_center IN %(cost_centers)s" if cost_centers else "" }
        GROUP BY COALESCE(fb.state, 'Unknown')
        ORDER BY COALESCE(fb.state, 'Unknown') ASC
    """

    rows = frappe.db.sql(sql, params, as_dict=True)

    # Format results
    result = []
    for r in rows:
        total = flt(r.get("total_ytd") or 0)
        capital = flt(r.get("capital_ytd") or 0)
        operating = total - capital
        result.append({
            "state": r.get("state") or "Unknown",
            "capital_total": round(capital, 2),
            "operating_total": round(operating, 2),
            "grand_total": round(total, 2),
        })

    return {"message": result}


import frappe

@guest_api
def get_both_methods_data(financial_year=None, month=None, entity=None):

    # Call budget method
    budget_data = get_university_budget_summary(
        financial_year=financial_year,
        month=month,
        entity=entity
    )

    # Call actuals method
    actuals_data = get_actuals_university_ppt(
        fiscal_year=financial_year,
        accounting_period=month,
        Unit=entity
    )

    # Just return both responses to check what you are getting
    return {
        "budget_data": budget_data,
        "actuals_data": actuals_data
    }


import frappe

@guest_api
def get_combined_university_budget_and_actuals(financial_year=None, month=None, entity=None):

    # First call: this already returns both datasets
    data = get_both_methods_data(financial_year, month, entity)
    # where get_both_methods_data is the method that returned:
    # {
    #   "budget_data": [...],
    #   "actuals_data": { "status": "", "count": , "data": [...] }
    # }

    budget_list = data.get("budget_data", [])
    actuals_list = data.get("actuals_data", {}).get("data", [])

    # Build lookup: deptid → actuals row
    actuals_lookup = {
        str(row["deptid"]): row
        for row in actuals_list
        if row.get("deptid")
    }

    combined = []

    for entity_data in budget_list:
        new_entity = {
            "entity": entity_data.get("entity"),
            "entity_description": entity_data.get("entity_description", ""),
            "cost_centers": []
        }

        for cc in entity_data.get("cost_centers", []):
            cost_center = str(cc.get("cost_center"))

            if cost_center in actuals_lookup:
                actual = actuals_lookup[cost_center]

                new_entity["cost_centers"].append({
                    "cost_description": cc.get("cost_description"),
                    "cost_center_id": cc.get("cost_center_id"),
                    "cost_center": cost_center,
                    "deptid": actual.get("deptid"),

                    # Budget totals
                    "budget_capital_total": cc.get("capital_total", 0),
                    "budget_operating_total": cc.get("operating_total", 0),
                    "budget_grand_total": cc.get("grand_total", 0),

                    # Actual totals
                    "actual_capital_total": actual.get("capital_total", 0),
                    "actual_operating_total": actual.get("operating_total", 0),
                    "actual_grand_total": actual.get("grand_total", 0),
                })

        if new_entity["cost_centers"]:
            combined.append(new_entity)

    # IMPORTANT: return only the list, not {"message": ...}
    return combined
