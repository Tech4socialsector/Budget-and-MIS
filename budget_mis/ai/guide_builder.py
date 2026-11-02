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

from budget_mis.ai.tools import ALLOWED_DOCTYPES

STRUCTURE_SECTION_TITLE = "App Data Structure (auto-generated)"
# Sorts after hand-written behavioral sections (which should use lower
# numbers), so the model reads "how to behave" before "what the data
# looks like".
STRUCTURE_SECTION_SORT_ORDER = 100

# Hand-written (not derived from doctype metadata, unlike the structure
# section above) - tells the model what backend surface exists and how
# fresh/cached the numbers it reports actually are, so it can answer a
# user's own questions about either ("which APIs back this?", "why does
# this look a few minutes stale?") accurately instead of guessing or
# inventing an explanation. Still just a seed: an admin can edit/disable
# individual points afterward via the AI Assistant Guide doctype same as
# any other guide content - re-running seed_api_and_caching_guide() only
# overwrites this one record, identified by its own title below.
API_AND_CACHING_SECTION_TITLE = "Backend APIs and Caching (reference)"
API_AND_CACHING_SECTION_SORT_ORDER = 50

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


def _monthly_mis_response_shape_points():
	return [
		'get_monthly_mis_summary tool response shape: {"financial_year": "2026-27", "month": "September", '
		'"tables": [ { "table_name": "Health" | "Education" | ..., "rows": [ { "label": (section/unit name), '
		'"operating_expense_budget": (number), "operating_expense_actuals": (number), '
		'"capital_expense_budget": (number), "capital_expense_actuals": (number), '
		'"total_expense_budget": (number), "total_expense_actuals": (number) } ] } ] }',
		"get_monthly_mis_summary answers Monthly MIS questions (Operating Expense / Capital Expense / Total Expense, budget vs actuals, by section such as Health or Education) - this is a different report from get_budget_summary and get_actuals_summary, which report org-wide totals without this Monthly MIS section breakdown. Use get_monthly_mis_summary whenever the user mentions 'Monthly MIS', 'MIS report', or asks for a breakdown by section/area of work.",
		"get_monthly_mis_summary's `section` argument accepts: health, education, university, livelihoods, enablers (case-insensitive) - always use this for a named area of work rather than guessing a raw table_name_filter value, since the page's own section groupings (e.g. 'Health') are made up of several differently-named underlying tables the tool resolves for you.",
		"get_monthly_mis_summary requires a month argument (full month name, April through March) - figures are always year-to-date through that month, same convention as get_actuals_summary.",
		"get_monthly_mis_summary's figures match the Monthly MIS page exactly, including its own server-side cache of the same underlying ERP actuals data - never recompute these figures from search_records or get_record.",
		"get_monthly_mis_summary currently applies no per-user unit restriction (it mirrors the Monthly MIS page itself, which any logged-in user who can open it sees in full) - do not claim it is scoped to the asking user's own units the way get_budget_summary/get_actuals_summary are.",
	]


SELF_IMPROVEMENT_SECTION_TITLE = "Self-Improvement via propose_guide_point"
SELF_IMPROVEMENT_SECTION_SORT_ORDER = 10


def build_self_improvement_points():
	return [
		"You have a propose_guide_point tool to suggest a new instruction for yourself when you genuinely hit a gap in your own instructions during a real conversation - you had to guess, the user corrected a mistake, or you noticed a question type you have no clear guidance for.",
		"Never call propose_guide_point for a question you already answered correctly using existing instructions - it is for genuine gaps only, not a routine logging mechanism.",
		"A proposal you submit is never active immediately and never affects the current or any other conversation right away - an admin must review and approve it first. If you mention the proposal to the user, say you've noted it for review, never that you've already learned or remembered it.",
		"Do not call propose_guide_point more than once or twice in a single conversation, even if several gaps come up - prefer the single clearest/most useful one.",
	]


def build_api_and_caching_points():
	"""Hand-written facts about the three tools' own backend data sources
	and cache lifetimes - the model should cite these when a user asks
	"where does this number come from" or "how fresh is this", rather than
	speculating."""
	return [
		"This assistant has exactly three data-reporting tools: get_budget_summary (budgeted/allocated/sanctioned amounts), get_actuals_summary (actual/spent/posted expenditure), and get_monthly_mis_summary (Monthly MIS section breakdown, budget vs actuals together). Every number they return is read from this app's own backend APIs - the assistant never computes a total by itself from raw records.",
		"get_budget_summary reads from Finance Budget records (via budget_mis.api_1.budget_summary) - a document-based doctype, not an external system, so its numbers are always exactly as current as the latest saved Finance Budget record, with no caching delay at all.",
		"get_actuals_summary and get_monthly_mis_summary both ultimately read from one shared, server-side cached PeopleSoft ERP fetch (budget_mis.api_1.erp_actuals.get_actuals_from_erp_month_wise and budget_mis.api_1.grouped_actuals.group_actuals_ytd) - the SAME cached data the Monthly MIS and Budget vs Actuals pages in this app also read, not a separate or duplicate pull.",
		"That ERP cache's lifetime is controlled by the 'ERP Credentials' doctype's actuals_cache_duration_minutes setting (an admin-configurable value, read fresh on every request) - if a user asks how fresh actuals data is, say it is cached for up to that many minutes and shared across every user asking about the same financial year/month, not fetched fresh on every single question.",
		"A logged-in user's own first page view (or login) pre-warms this same ERP cache for the two periods the app's own Monthly MIS page defaults to (the current financial year's most recently completed month, and the same month one financial year earlier) - so those two specific periods are very likely to already be cached and fast; any other period may trigger a slower first fetch (the underlying PeopleSoft call itself can take up to about 90 seconds) that is then cached for every subsequent asker.",
		"If two different users (or this assistant and a page load) ask for the exact same uncached financial-year/month at the same moment, the backend is built so only ONE real request to PeopleSoft is made - the other caller automatically waits for and reuses that same in-flight result, rather than triggering a second redundant external call. This means a brief delay on an uncached question is normal and does not mean anything is broken.",
		"get_monthly_mis_summary additionally keeps its own short-lived cached copy of its already-formatted response (same TTL as the ERP cache above), separate from the raw ERP cache - so a second, similarly-phrased Monthly MIS question can return instantly without re-deriving the section breakdown from scratch.",
		"None of this assistant's tools make a live network call while you are waiting for a reply if the relevant period is already cached - only a genuinely new/uncached financial-year/month combination can take noticeably longer to answer.",
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
	points.extend(_monthly_mis_response_shape_points())
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

	frappe.cache().delete_value("budget_mis_ai_assistant_guide")
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


def seed_api_and_caching_guide():
	"""Create or overwrite the single AI Assistant Guide record holding the
	hand-written API/caching reference points - same create-or-overwrite-by-
	title pattern as regenerate_structure_guide(), so re-running this is
	always safe and never duplicates or touches any other guide record."""
	points = build_api_and_caching_points()

	if frappe.db.exists("AI Assistant Guide", API_AND_CACHING_SECTION_TITLE):
		doc = frappe.get_doc("AI Assistant Guide", API_AND_CACHING_SECTION_TITLE)
		doc.set("points", [])
	else:
		doc = frappe.get_doc({
			"doctype": "AI Assistant Guide",
			"title": API_AND_CACHING_SECTION_TITLE,
			"is_active": 1,
			"sort_order": API_AND_CACHING_SECTION_SORT_ORDER,
			"points": [],
		})

	for i, point in enumerate(points):
		doc.append("points", {"point": point, "is_active": 1, "sort_order": i})

	if doc.name:
		doc.save(ignore_permissions=True)
	else:
		doc.insert(ignore_permissions=True)

	frappe.cache().delete_value("budget_mis_ai_assistant_guide")
	frappe.db.commit()
	return [p.point for p in doc.points]


@frappe.whitelist()
def regenerate_ai_guide_api_and_caching():
	"""Admin-triggered (re)seed of the hand-written API/caching guide
	section - same permission gate as regenerate_ai_guide_structure."""
	if not frappe.has_permission("AI Assistant Guide", "write"):
		frappe.throw("You do not have permission to update the AI Assistant Guide", frappe.PermissionError)
	seed_api_and_caching_guide()
	return {"status": "ok"}


def seed_self_improvement_guide():
	"""Create or overwrite the single AI Assistant Guide record holding the
	propose_guide_point usage instructions - same create-or-overwrite-by-
	title pattern as the other seed functions in this file."""
	points = build_self_improvement_points()

	if frappe.db.exists("AI Assistant Guide", SELF_IMPROVEMENT_SECTION_TITLE):
		doc = frappe.get_doc("AI Assistant Guide", SELF_IMPROVEMENT_SECTION_TITLE)
		doc.set("points", [])
	else:
		doc = frappe.get_doc({
			"doctype": "AI Assistant Guide",
			"title": SELF_IMPROVEMENT_SECTION_TITLE,
			"is_active": 1,
			"sort_order": SELF_IMPROVEMENT_SECTION_SORT_ORDER,
			"points": [],
		})

	for i, point in enumerate(points):
		doc.append("points", {"point": point, "is_active": 1, "sort_order": i})

	if doc.name:
		doc.save(ignore_permissions=True)
	else:
		doc.insert(ignore_permissions=True)

	frappe.cache().delete_value("budget_mis_ai_assistant_guide")
	frappe.db.commit()
	return [p.point for p in doc.points]


@frappe.whitelist()
def regenerate_ai_guide_self_improvement():
	"""Admin-triggered (re)seed of the propose_guide_point usage guide
	section - same permission gate as the other regenerate_* functions."""
	if not frappe.has_permission("AI Assistant Guide", "write"):
		frappe.throw("You do not have permission to update the AI Assistant Guide", frappe.PermissionError)
	seed_self_improvement_guide()
	return {"status": "ok"}
