from annual_budget.utils import guest_api, get_allowed_units
import frappe

@frappe.whitelist()
def get_all_finance_budgets():
    """Return all Finance Budget records with all fields and child tables,
    scoped to the caller's Finance user access mapping."""
    try:
        filters = {}
        allowed_units = get_allowed_units()
        if allowed_units is not None:
            if not allowed_units:
                return []
            filters["set_id"] = ["in", list(allowed_units)]

        docs = frappe.get_all("Finance Budget", filters=filters, pluck="name")
        data = []
        for name in docs:
            doc = frappe.get_doc("Finance Budget", name)
            data.append(doc.as_dict())
        return data
    except Exception as e:
        frappe.log_error("Finance Budget API Error", str(e))
        frappe.throw("Unable to fetch Finance Budget records. Please contact your administrator.")


@guest_api
def get_consolidated_report(financial_year=None):
    """
    Consolidated Budget Report grouped by:
    Entity → Cost Center → Expense Type

    Adds totals for:
    - Each Cost Center (already)
    - Each Entity (sum of all its cost centers)
    """

    filters = {}
    if financial_year:
        filters["financial_year"] = financial_year

    # 1️⃣ Fetch all Finance Budgets
    budgets = frappe.get_all(
        "Finance Budget",
        filters=filters,
        fields=[
            "name",
            "financial_year",
            "set_id",
            "entity__unit_decription",
            "cost_center",
            "cc_descr",
            "total_budget"
        ]
    )

    if not budgets:
        return {"entities": []}

    expense_gl_lookup = {
        e.name: e.gl_code
        for e in frappe.get_all("Expenses", fields=["name", "gl_code"])
    }

    response = {"entities": []}

    # 2️⃣ Group data by entity
    for budget in budgets:
        entity_name = (
            budget.get("entity__unit_decription")
            or budget.get("set_id")
            or "Unknown Entity"
        )

        # Find or create entity group
        entity = next((e for e in response["entities"] if e["name"] == entity_name), None)
        if not entity:
            entity = {
                "name": entity_name,
                "cost_centers": [],
                "totals": {   # ✅ Added
                    "budget": 0.0,
                    "actuals": 0.0,
                    "previous_year": 0.0
                }
            }
            response["entities"].append(entity)

        # 3️⃣ Use Cost Center Description (cc_descr) instead of cost_center
        cost_center_name = (
            budget.get("cc_descr")
            or budget.get("cost_center")
            or "Unnamed Cost Center"
        )

        cost_center = {
            "name": cost_center_name,
            "budget": budget["name"],
            "data": [],
            "total_budget": 0.0,
            "total_actuals": 0.0,
            "total_previous_year": 0.0
        }

        # 4️⃣ Fetch Budget Amount details from child table
        details = frappe.get_all(
            "Finance Budget Amounts",
            filters={"parent": budget["name"]},
            fields=[
                "type_of_expense_id",
                "type_of_expense",
                "head_of_expense",
                "sub_head_of_expense",
                "quarter_1",
                "quarter_2",
                "quarter_3",
                "quarter_4",
                "year"
            ]
        )

        # 5️⃣ Compute totals for this cost center
        total_budget = 0.0
        total_actuals = 0.0
        total_previous = 0.0

        for d in details:
            yearly_total = float(d.get("year") or 0)
            # placeholders (in future can be replaced by linked Doctype data)
            actuals_value = 0.0
            previous_year_value = 0.0

            total_budget += yearly_total
            total_actuals += actuals_value
            total_previous += previous_year_value

            cost_center["data"].append({
                "type_of_expense": d.get("type_of_expense"),
                "head_of_expense": d.get("head_of_expense"),
                "sub_head_of_expense": d.get("sub_head_of_expense"),
                "gl_code": expense_gl_lookup.get(d.get("type_of_expense_id")),
                "budget": yearly_total,
                "actuals": actuals_value,
                "previous_year": previous_year_value
            })

        # 6️⃣ Assign totals to cost center
        cost_center["total_budget"] = total_budget
        cost_center["total_actuals"] = total_actuals
        cost_center["total_previous_year"] = total_previous

        # 7️⃣ Add cost center to entity
        entity["cost_centers"].append(cost_center)

        # 8️⃣ Accumulate totals for entity
        entity["totals"]["budget"] += total_budget
        entity["totals"]["actuals"] += total_actuals
        entity["totals"]["previous_year"] += total_previous

    # 9️⃣ Return structured response
    return {"entities": response["entities"]}