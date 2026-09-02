"""Generates the structural-reference section of the AI Assistant Guide
from live doctype metadata, instead of hand-written prose that drifts out
of sync the next time a doctype's fields change.

Run regenerate_structure_guide() (from bench console, or via the whitelisted
regenerate_ai_guide_structure) after any change to a doctype listed in
ai.tools.ALLOWED_DOCTYPES - it overwrites only the single AI Assistant Guide
record named STRUCTURE_SECTION_TITLE, leaving every other (hand-written)
guide section untouched.
"""

import frappe

from annual_budget.ai.tools import ALLOWED_DOCTYPES

STRUCTURE_SECTION_TITLE = "App Data Structure (auto-generated)"
# Sorts after hand-written behavioral sections (which should use lower
# numbers), so the model reads "how to behave" before "what the data
# looks like".
STRUCTURE_SECTION_SORT_ORDER = 100

SKIP_FIELDTYPES = {"Section Break", "Column Break", "Tab Break", "HTML", "Heading", "Button"}

# Doctypes worth calling out by name as "master data" vs "budget/transaction
# data" in the generated notes - purely a documentation grouping, not a
# permission or behavior distinction (ALLOWED_DOCTYPES/get_allowed_units
# remain the actual enforcement).
MASTER_DOCTYPES = {
	"Cost Center", "Unit", "State", "Location Code", "GL code",
	"Financial Year List", "Months List", "Expenses", "Import Templates",
	"Grant Division Details", "Finance user access",
}
BUDGET_DOCTYPES = {"Finance Budget", "Monthly Adjustment", "Headcount"}


def _describe_doctype_points(doctype):
	"""One point per field (plus a leading header point naming the
	doctype), instead of one block of text - so each fact is its own row
	in the Points child table and can be reordered/edited independently."""
	meta = frappe.get_meta(doctype)
	points = [f"{doctype}:"]
	for f in meta.fields:
		if f.fieldtype in SKIP_FIELDTYPES or f.hidden:
			continue
		bits = [f.fieldtype]
		if f.fieldtype == "Link" and f.options:
			bits.append(f"-> {f.options}")
		elif f.fieldtype == "Table" and f.options:
			bits.append(f"(child table: {f.options})")
		elif f.fieldtype == "Select" and f.options:
			opts = [o for o in f.options.splitlines() if o.strip()]
			if opts:
				bits.append("one of: " + ", ".join(opts))
		if f.reqd:
			bits.append("required")
		points.append(f"{doctype}.{f.fieldname} ({f.label or f.fieldname}): {' '.join(bits)}")
	return points


def _budget_response_shape_points():
	return [
		'get_budget_summary tool response shape: {"financial_year": "2026-27", '
		'"unit": "all units you have access to" | "UNIT1,UNIT2", '
		'"grand_total": (number, the ONLY correct total), '
		'"heads": [ { "head": "CAPITAL EXPENSES" | "OPERATING EXPENSES" | "COVID SUPPORT", "total": (number) } ] }',
		"get_budget_summary's response is a pre-aggregated summary - never recompute grand_total yourself, read it directly.",
		"Finance Budget is one record per unit/cost-center/financial-year combination - there are many such records per financial year.",
		"Finance Budget's own total_budget field is that ONE record's total, not an org-wide or unit-wide aggregate.",
		"Finance Budget's actual monthly figures live in its child table Finance Budget Amounts (one row per expense type, with april..march columns).",
		"get_budget_summary already sums every matching Finance Budget record and every month correctly - that is why it must always be used instead of reading Finance Budget records directly for totals.",
	]


def _actuals_response_shape_points():
	return [
		'get_actuals_summary tool response shape: {"financial_year": "2026-27", "month": "september", '
		'"unit": "all units you have access to" | "UNIT1,UNIT2", '
		'"grand_total_ytd": (number, the ONLY correct actual/spent total), '
		'"heads": [ { "head": "CAPITAL EXPENSES" | "OPERATING EXPENSES" | "COVID SUPPORT", "total_ytd": (number) } ] }',
		"get_actuals_summary answers ACTUAL/spent/utilized/posted-expenditure questions - get_budget_summary answers BUDGETED/allocated/sanctioned/planned questions. Never mix the two up, and never diff or compare them yourself without the user asking for a comparison.",
		"get_actuals_summary requires a month argument (full month name, April through March) - actuals are always reported year-to-date THROUGH that month, never for the whole year unless the month given is March. If the user does not name a month, ask them which month instead of guessing or defaulting silently.",
		"Actual expenditure data ultimately comes from one live PeopleSoft ERP query (Z_MIS_ACTUALS_BY_PERIOD), plus any manually recorded 'Monthly Adjustment' correction entries merged in - not from any doctype the assistant can search directly.",
		"Never use search_records or get_record on 'Finance Budget' or 'Monthly Adjustment' to compute an actuals total yourself - get_actuals_summary already correctly aggregates every underlying record and month for you.",
		"A PeopleSoft accounting period of 0 is the fiscal year's opening/beginning balance, not real spending activity - get_actuals_summary already excludes it from every total.",
	]


def build_structure_points():
	"""Flat, ordered list of point strings covering master doctypes, budget
	doctypes, and the get_budget_summary response shape - each entry becomes
	one row in the generated section's Points child table."""
	points = ["Master data doctypes (reference/lookup data):"]
	for dt in sorted(MASTER_DOCTYPES & ALLOWED_DOCTYPES):
		try:
			points.extend(_describe_doctype_points(dt))
		except Exception:
			continue

	points.append("Budget / transactional doctypes:")
	for dt in sorted(BUDGET_DOCTYPES & ALLOWED_DOCTYPES):
		try:
			points.extend(_describe_doctype_points(dt))
		except Exception:
			continue

	points.extend(_budget_response_shape_points())
	points.extend(_actuals_response_shape_points())
	return points


def regenerate_structure_guide():
	"""Create or overwrite the single AI Assistant Guide record that holds
	the auto-generated structure section, leaving every other (hand-written)
	guide record completely untouched. Each fact becomes its own Point row
	(editable_grid child table) rather than one long text block."""
	points = build_structure_points()

	if frappe.db.exists("AI Assistant Guide", STRUCTURE_SECTION_TITLE):
		doc = frappe.get_doc("AI Assistant Guide", STRUCTURE_SECTION_TITLE)
		doc.set("points", [])
	else:
		doc = frappe.get_doc({
			"doctype": "AI Assistant Guide",
			"title": STRUCTURE_SECTION_TITLE,
			"is_active": 1,
			"sort_order": STRUCTURE_SECTION_SORT_ORDER,
			"points": [],
		})

	for i, point in enumerate(points):
		doc.append("points", {"point": point, "is_active": 1, "sort_order": i})

	if doc.name:
		doc.save(ignore_permissions=True)
	else:
		doc.insert(ignore_permissions=True)

	frappe.cache().delete_value("annual_budget_ai_assistant_guide")
	frappe.db.commit()
	return [p.point for p in doc.points]


@frappe.whitelist()
def regenerate_ai_guide_structure():
	"""Admin-triggered regeneration, callable from Desk/console/a future
	Settings button - kept separate from the plain function so it can carry
	its own permission check without affecting bench console usage."""
	if not frappe.has_permission("AI Assistant Guide", "write"):
		frappe.throw("You do not have permission to update the AI Assistant Guide", frappe.PermissionError)
	regenerate_structure_guide()
	return {"status": "ok"}
