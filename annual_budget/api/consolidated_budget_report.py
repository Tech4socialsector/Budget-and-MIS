from annual_budget.utils import guest_api, get_allowed_units
import frappe

@guest_api
def get_consolidated_report(financial_year=None):
    """
    Consolidated Budget Report grouped by:
    Entity → Cost Center → Head of Expense → Line Items

    Each level includes totals for:
    - Expense Head (sum of all items)
    - Cost Center (sum of all heads)
    - Entity (sum of all cost centers)
    """

    filters = {}
    if financial_year:
        filters["financial_year"] = financial_year

    allowed_units = get_allowed_units()
    if allowed_units is not None:
        if not allowed_units:
            return {"entities": []}
        filters["set_id"] = ["in", list(allowed_units)]

    # 1️⃣ Fetch all Finance Budgets (Parent records)
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

    # 2️⃣ Group by Entity
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
                "totals": {
                    "budget": 0.0,
                    "actuals": 0.0,
                    "previous_year": 0.0
                }
            }
            response["entities"].append(entity)

        # 3️⃣ Get cost center info
        cost_center_name = (
            budget.get("cc_descr")
            or budget.get("cost_center")
            or "Unnamed Cost Center"
        )

        cost_center = {
            "name": cost_center_name,
            "budget_id": budget["name"],
            "groups": [],  # ✅ Holds grouped expense heads
            "total_budget": 0.0,
            "total_actuals": 0.0,
            "total_previous_year": 0.0
        }

        # 4️⃣ Fetch child table data (Finance Budget Amounts)
        details = frappe.get_all(
            "Finance Budget Amounts",
            filters={"parent": budget["name"]},
            fields=[
                "type_of_expense_id",
                "type_of_expense",
                "head_of_expense",
                "sub_head_of_expense",
                "year"
            ]
        )

        # 5️⃣ Group by Head of Expense
        grouped = {}
        for d in details:
            head = d.get("head_of_expense") or "Uncategorized"
            if head not in grouped:
                grouped[head] = {
                    "head_of_expense": head,
                    "total_expense": 0.0,
                    "items": []
                }

            yearly_total = float(d.get("year") or 0)
            actuals_value = 0.0  # placeholder (future enhancement)
            previous_year_value = 0.0  # placeholder

            # Add line item
            grouped[head]["items"].append({
                "type_of_expense": d.get("type_of_expense"),
                "sub_head_of_expense": d.get("sub_head_of_expense"),
                "gl_code": expense_gl_lookup.get(d.get("type_of_expense_id")),
                "head_of_expense": head,   # ✅ included in each item
                "budget": yearly_total,
                "actuals": actuals_value,
                "previous_year": previous_year_value
            })

            # Increment totals
            grouped[head]["total_expense"] += yearly_total
            cost_center["total_budget"] += yearly_total
            cost_center["total_actuals"] += actuals_value
            cost_center["total_previous_year"] += previous_year_value

        # 6️⃣ Add grouped expense heads to cost center
        cost_center["groups"] = list(grouped.values())

        # 7️⃣ Add cost center to its entity
        entity["cost_centers"].append(cost_center)

        # 8️⃣ Update entity-level totals
        entity["totals"]["budget"] += cost_center["total_budget"]
        entity["totals"]["actuals"] += cost_center["total_actuals"]
        entity["totals"]["previous_year"] += cost_center["total_previous_year"]

    # 9️⃣ Return final grouped structure
    return response
