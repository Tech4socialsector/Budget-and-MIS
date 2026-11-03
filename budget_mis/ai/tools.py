"""Tool implementations the AI assistant can call.

Every function here executes as `frappe.session.user` - never
`ignore_permissions=True`, never a user switch. Frappe's own permission
system (frappe.has_permission / frappe.get_list's built-in permission
filtering / doc.insert() / doc.save()) is the enforcement boundary, exactly
as it is for every other part of this app. A tool never does anything a
doctype list/form click couldn't already do for that same user.

Every tool also validates its `doctype` argument against ALLOWED_DOCTYPES
below before touching Frappe at all. This is a belt-and-suspenders layer on
top of role permissions: it stops the assistant from ever operating on a
doctype this app hasn't chosen to expose (e.g. User, Role, ERP Credentials),
even if the model hallucinates one or the calling user's role technically
has access to it elsewhere in Frappe.

This is a static list for now - the sidebar's own navigation is still a
placeholder (see frontend/src/data/nav.js) with no dynamic module/doctype
config yet. Once real nav-driven pages exist, this should be replaced with
a lookup against whatever config drives the sidebar, so the two never drift
apart - the same reasoning chw's dynamic get_app_modules() lookup follows.
"""

import frappe
from frappe import _

from budget_mis.utils import get_allowed_units, is_finance_admin

ALLOWED_DOCTYPES = {
	"Cost Center",
	"Unit",
	"State",
	"Location Code",
	"GL code",
	"Financial Year List",
	"Months List",
	"Expenses",
	"Import Templates",
	"Grant Division Details",
	"Finance user access",
	"Finance Budget",
	"Monthly Adjustment",
	"Headcount",
}


def _require_allowed_doctype(doctype):
	if doctype not in ALLOWED_DOCTYPES:
		frappe.throw(_("{0} is not available to the assistant").format(doctype), frappe.PermissionError)


def list_doctypes():
	"""Doctypes the assistant is allowed to work with - its grounding for
	"what data exists here"."""
	return sorted(ALLOWED_DOCTYPES)


SKIP_FIELDTYPES = {"Section Break", "Column Break", "Tab Break", "HTML", "Heading", "Button"}


def get_doctype_meta(doctype):
	"""Trimmed field list for `doctype` - fieldname/label/fieldtype/required/
	options only, so the assistant knows exactly what fields exist without
	being handed the full internal doctype definition."""
	_require_allowed_doctype(doctype)
	meta = frappe.get_meta(doctype)
	fields = []
	for f in meta.fields:
		if f.fieldtype in SKIP_FIELDTYPES or f.hidden or f.fieldtype == "Table":
			continue
		fields.append({
			"fieldname": f.fieldname,
			"label": f.label,
			"fieldtype": f.fieldtype,
			"required": bool(f.reqd),
			"options": f.options if f.fieldtype in ("Select", "Link") else None,
		})
	return {"doctype": doctype, "fields": fields}


def get_my_access():
	"""What the *current* user can see in this app - their own admin status
	and, if not an admin, exactly which units their Finance user access
	mapping grants them. This is the tool that should back any "what can I
	see", "why don't I have access to X", or "is this total scoped to me"
	question, so the assistant never has to infer permission behavior from
	other tools' results or make it up."""
	admin = is_finance_admin()
	allowed_units = get_allowed_units()
	return {
		"user": frappe.session.user,
		"is_finance_admin": admin,
		"unit_restricted": allowed_units is not None,
		"allowed_units": sorted(allowed_units) if allowed_units is not None else None,
		"note": (
			"Unrestricted - can see all units and budget data."
			if allowed_units is None
			else (
				"No units are mapped to this user - they cannot see any budget data yet."
				if not allowed_units
				else "Restricted to the listed units only - budget totals and records for this user cover only these units."
			)
		),
	}


PROPOSED_GUIDE_SECTION_TITLE = "AI-Proposed Instructions (pending review)"


def propose_guide_point(point, reason):
	"""Lets the assistant suggest a new instruction for itself, based on
	something it actually ran into in a real conversation (it had to guess,
	got corrected by the user, or found its own instructions incomplete/
	wrong) - never a general-purpose "remember this fact" tool.

	The suggestion is NEVER immediately active: it is always created with
	status=Pending on the "AI-Proposed Instructions (pending review)" guide
	section (auto-created the first time this is called, Inactive by
	default so even an accidentally-approved stray point can't reach the
	live prompt without an admin also switching the whole section on), and
	_load_guide() only ever reads status=Approved points. An admin reviews
	every proposal (point text + reason + which user's conversation
	prompted it) via the doctype/admin review page and explicitly approves
	or rejects it - this function itself has no path to make a suggestion
	live on its own.
	"""
	point = (point or "").strip()
	reason = (reason or "").strip()
	if not point:
		frappe.throw(_("A point is required."))
	if not reason:
		frappe.throw(_("A reason is required - explain what prompted this suggestion."))

	if frappe.db.exists("AI Assistant Guide", PROPOSED_GUIDE_SECTION_TITLE):
		section = frappe.get_doc("AI Assistant Guide", PROPOSED_GUIDE_SECTION_TITLE)
	else:
		section = frappe.get_doc({
			"doctype": "AI Assistant Guide",
			"title": PROPOSED_GUIDE_SECTION_TITLE,
			# Inactive by default: belt-and-suspenders alongside each point's
			# own status=Pending gate - an admin must turn BOTH the section
			# and the individual point on before anything here reaches the
			# live prompt, matching how every other guide section already
			# needs is_active=1 at the section level too.
			"is_active": 0,
			"sort_order": 200,
		})
		section.insert(ignore_permissions=True)

	section.append("points", {
		"point": point,
		"is_active": 1,
		"sort_order": len(section.points),
		"status": "Pending",
		"proposed_by": frappe.session.user,
		"proposed_reason": reason,
	})
	section.save(ignore_permissions=True)

	return {
		"status": "submitted_for_review",
		"note": "This suggestion has been recorded for an admin to review and approve - it is not active yet and will not affect this or any other conversation until approved.",
	}


def list_users(filters=None, limit=20):
	"""Look up which users exist and their roles - restricted to users who
	can read the User doctype (System Manager / HR-type roles in Frappe's
	own default setup), the same as browsing the User list in Desk. Never
	returns a password, API key, or other secret field - only name,
	full_name, roles, and enabled status."""
	if not frappe.has_permission("User", ptype="read"):
		frappe.throw(_("You do not have permission to view users"), frappe.PermissionError)

	limit = min(int(limit or 20), 50)
	users = frappe.get_list(
		"User",
		filters=filters or {},
		fields=["name", "full_name", "enabled"],
		limit_page_length=limit,
	)
	for u in users:
		u["roles"] = sorted(frappe.get_roles(u["name"]))
	return users


def get_budget_summary(financial_year=None, unit=None, operating_unit=None, cost_center=None, location_code=None):
	"""The authoritative aggregate budget total for a financial year -
	built the same way the Budget Summary page computes its grand total
	(summing every expense head's monthly q1-q4 figures from the
	consolidated report), not by reading or summing raw "Finance Budget"
	records one at a time. A single Finance Budget record's own
	total_budget field is one line item, never the org-wide total - the
	assistant must never treat it as one.

	Pass EITHER `unit` (a literal Unit code like "APU") OR `operating_unit`
	(a name from list_operating_units, e.g. "Azim Premji School") - never
	pass an Operating Unit's display name into `unit`, it will not match any
	real Unit and silently returns a 0.00 total instead of an error.
	`cost_center`/`location_code` narrow further (the plain code shown in
	the real page's own filter dropdowns, e.g. "111100"/"1001" - pass them
	exactly as given) and work even with no unit/operating_unit at all.

	Always scoped to the calling user's own unit access (never the
	internal/admin-unscoped default get_consolidated_report falls back to
	for non-HTTP callers), so a restricted Finance user asking this
	assistant never sees more than their own list views already show
	them.
	"""
	from budget_mis.utils import get_allowed_cost_centers, get_allowed_location_codes
	from budget_mis.api_1.budget_summary import get_budget_summary
	from budget_mis.api_1.filter_options import get_theme_mappings

	if not financial_year:
		financial_year = frappe.db.get_single_value("Master Settings", "current_financial_year")
	if not financial_year:
		frappe.throw(_("No financial year was given, and none is set as current in Master Settings."))

	if unit and operating_unit:
		frappe.throw(_("Pass either unit or operating_unit, not both."))

	if operating_unit:
		theme_name = _resolve_operating_unit_name(operating_unit)
		mapping = get_theme_mappings(theme_name)
		unit = ",".join(sorted({u["value"] for u in mapping.get("units") or [] if u.get("value")})) or None
		cost_center = ",".join(sorted({c["value"] for c in mapping.get("cost_centers") or [] if c.get("value")})) or None
		location_code = ",".join(sorted({l["value"] for l in mapping.get("location_codes") or [] if l.get("value")})) or None
		if not unit:
			frappe.throw(_("Operating Unit '{0}' has no units configured.").format(operating_unit))

	# Budget-side data ("Finance Budget" records) is keyed entirely by doc
	# name throughout get_budget_summary's own filters - unlike actuals
	# (get_actuals_summary), there's no separate ERP-code form to resolve
	# here, just the plain code -> doc name lookup.
	if cost_center and not operating_unit:
		requested_codes = [c.strip() for c in str(cost_center).split(",") if c.strip()]
		cc_docs = frappe.get_all("Cost Center", filters={"cost_center": ["in", requested_codes]}, fields=["name", "cost_center"])
		missing = set(requested_codes) - {str(d.cost_center) for d in cc_docs}
		if missing:
			frappe.throw(_("Unknown cost center code(s): {0}").format(", ".join(sorted(missing))))
		cost_center = ",".join(str(d.name) for d in cc_docs)

	if location_code and not operating_unit:
		requested_codes = [l.strip() for l in str(location_code).split(",") if l.strip()]
		loc_docs = frappe.get_all("Location Code", filters={"location_code": ["in", requested_codes]}, fields=["name", "location_code"])
		missing = set(requested_codes) - {str(d.location_code) for d in loc_docs}
		if missing:
			frappe.throw(_("Unknown location code(s): {0}").format(", ".join(sorted(missing))))
		location_code = ",".join(str(d.name) for d in loc_docs)

	allowed_units = get_allowed_units()
	if allowed_units is not None:
		if unit:
			requested = {u.strip() for u in str(unit).split(",") if u.strip()}
			if not requested.issubset(allowed_units):
				frappe.throw(_("You do not have access to one or more of the requested units."), frappe.PermissionError)
		elif not allowed_units and not cost_center and not location_code:
			return {
				"financial_year": financial_year,
				"grand_total": 0,
				"heads": [],
				"note": "You do not have access to any budget units.",
			}
		elif not operating_unit and not cost_center and not location_code:
			unit = ",".join(sorted(allowed_units))

	if cost_center:
		allowed_cost_centers = get_allowed_cost_centers()
		if allowed_cost_centers is not None:
			requested = {c.strip() for c in str(cost_center).split(",") if c.strip()}
			if not requested.issubset(allowed_cost_centers):
				frappe.throw(_("You do not have access to one or more of the requested cost centers."), frappe.PermissionError)

	if location_code:
		allowed_location_codes = get_allowed_location_codes()
		if allowed_location_codes is not None:
			requested = {l.strip() for l in str(location_code).split(",") if l.strip()}
			if not requested.issubset(allowed_location_codes):
				frappe.throw(_("You do not have access to one or more of the requested location codes."), frappe.PermissionError)

	heads = get_budget_summary(financial_year=financial_year, units=unit, cost_center=cost_center, location_code=location_code) or []

	def _row_total(row):
		return sum(sum(row.get(q, [0, 0, 0])) for q in ("q1", "q2", "q3", "q4"))

	head_summaries = []
	grand_total = 0.0
	for head in heads:
		total = _row_total(head)
		grand_total += total
		head_summaries.append({"head": head.get("name"), "total": round(total, 2)})

	return {
		"financial_year": financial_year,
		"unit": operating_unit or unit or "all units you have access to",
		"grand_total": round(grand_total, 2),
		"heads": head_summaries,
	}


MONTHS_IN_ORDER = [
	"april", "may", "june",
	"july", "august", "september",
	"october", "november", "december",
	"january", "february", "march",
]


def list_operating_units():
	"""Operating Units are a different, higher-level grouping than a raw
	Unit - each one (e.g. "Azim Premji School", "Azim Premji University")
	resolves to a whole SET of Unit/Cost Center/Location Code values, not a
	single Unit code. They're "Overview number cards settings" records
	tagged via combination_table_settings.table_name == "Operating Unit
	Filter Option" - the same records the Budget vs Actuals and Budget
	Summary pages' own "Operating Units" filter dropdown lists. Call this
	FIRST whenever the user names an Operating Unit (as opposed to a literal
	Unit code like "APU") in a budget/actuals question, to get its real
	name for resolve_operating_unit/get_actuals_summary's operating_unit
	argument - never pass the Operating Unit's own display title straight
	into get_actuals_summary's `unit` argument, it is not a Unit code and
	will silently match nothing (reads as a correct 0.00 answer instead of
	an error)."""
	from budget_mis.api_1.filter_options import get_theme

	return get_theme()


def resolve_operating_unit(operating_unit):
	"""Resolve one Operating Unit (by its number_card_title OR its doctype
	name, as returned by list_operating_units) into the real Unit/Cost
	Center/Location Code values it covers - both the budget-side values and
	their ERP-side equivalents, matching exactly what get_actuals_summary's
	own operating_unit argument resolves internally. Mainly useful to show
	the user what an Operating Unit actually covers; get_actuals_summary
	resolves it directly, so this tool is for inspection, not a required
	first step before calling that one."""
	from budget_mis.api_1.filter_options import get_theme, get_theme_mappings

	theme_name = _resolve_operating_unit_name(operating_unit)
	mapping = get_theme_mappings(theme_name)
	# resolve_grouped_units (underlying get_theme_mappings) returns one
	# entry per underlying row, so the same unit/cost-center/location can
	# legitimately repeat several times - deduped here since this tool is
	# purely for a human-readable "what does this cover" answer, not a
	# per-row computation like get_actuals_summary's own internal use.
	return {
		"operating_unit": operating_unit,
		"resolved_theme": theme_name,
		"units": sorted({u["value"] for u in mapping.get("units") or [] if u.get("value")}),
		"cost_centers": sorted({c["value"] for c in mapping.get("cost_centers") or [] if c.get("value")}),
		"location_codes": sorted({l["value"] for l in mapping.get("location_codes") or [] if l.get("value")}),
	}


def _resolve_operating_unit_name(operating_unit):
	"""Operating Unit names are matched case-insensitively against either
	the doctype's own `name` or its human `number_card_title` - the model
	is only ever shown number_card_title (via list_operating_units), but a
	user might also type the raw name, so both are accepted."""
	from budget_mis.api_1.filter_options import get_theme

	operating_unit = str(operating_unit or "").strip()
	if not operating_unit:
		frappe.throw(_("An operating_unit name is required."))

	needle = operating_unit.lower()
	for card in get_theme():
		if str(card["name"]).lower() == needle or (card.get("number_card_title") or "").lower() == needle:
			return card["name"]

	frappe.throw(
		_("'{0}' is not a known Operating Unit. Call list_operating_units to see the available ones.").format(operating_unit)
	)


def get_actuals_summary(financial_year=None, month=None, unit=None, operating_unit=None, cost_center=None, location_code=None):
	"""The authoritative year-to-date ACTUAL spend total (as opposed to
	get_budget_summary's BUDGETED/planned total) for a financial year,
	through a given month. Built the same way the Budget Dashboard's
	"Budget vs Actuals" tab computes it (phase_sheet.get_combined_actuals,
	itself sourced from the single consolidated PeopleSoft actuals path -
	see budget_mis/api/actuals.py), not by reading or summing raw
	"Finance Budget", "Monthly Adjustment", or any other doctype's records
	directly. Never confuse this with get_budget_summary - "actual"/"spent"/
	"utilized"/"expenditure so far" means this tool; "budget"/"allocated"/
	"sanctioned"/"planned" means get_budget_summary.

	Pass EITHER `unit` (a literal Unit code like "APU") OR `operating_unit`
	(a name from list_operating_units, e.g. "Azim Premji School") - never
	pass an Operating Unit's display name into `unit`, it will not match any
	real Unit and silently returns a 0.00 total instead of an error. When
	the user names something that isn't an obvious short Unit code, call
	list_operating_units first to check whether it's actually an Operating
	Unit. `cost_center`/`location_code` narrow further within whichever of
	those you picked (both are the plain code the user sees in the Cost
	Center/Location Code dropdowns on the real Budget vs Actuals page, e.g.
	"111100"/"1001" - pass them exactly as given, do not translate or guess
	a different value) - they work even with no unit/operating_unit at all,
	scoped only by this user's own cost-center/location access.

	Always scoped to the calling user's own unit/cost-center/location access
	(get_combined_actuals itself applies no such scoping when called
	internally), so a restricted Finance user asking this assistant never
	sees more than their own list views already show them.
	"""
	from budget_mis.utils import get_allowed_cost_centers, get_allowed_location_codes
	from budget_mis.api.phase_sheet import get_combined_actuals
	from budget_mis.api_1.filter_options import get_theme_mappings

	if not financial_year:
		financial_year = frappe.db.get_single_value("Master Settings", "current_financial_year")
	if not financial_year:
		frappe.throw(_("No financial year was given, and none is set as current in Master Settings."))

	if not month:
		frappe.throw(_("A month is required (e.g. 'september') - actuals are always reported year-to-date through a specific month."))
	month = str(month).strip().lower()
	if month not in MONTHS_IN_ORDER:
		frappe.throw(_("Invalid month '{0}'. Use a full month name, April through March.").format(month))

	if unit and operating_unit:
		frappe.throw(_("Pass either unit or operating_unit, not both."))

	erp_cost_center_value = None
	erp_loc_value = None

	if operating_unit:
		theme_name = _resolve_operating_unit_name(operating_unit)
		mapping = get_theme_mappings(theme_name)
		unit = ",".join(sorted({u["value"] for u in mapping.get("units") or [] if u.get("value")})) or None
		cost_center = ",".join(sorted({c["value"] for c in mapping.get("cost_centers") or [] if c.get("value")})) or None
		location_code = ",".join(sorted({l["value"] for l in mapping.get("location_codes") or [] if l.get("value")})) or None
		erp_cost_center_value = ",".join(sorted({
			c["erp_cost_center_value"] for c in mapping.get("cost_centers") or [] if c.get("erp_cost_center_value")
		})) or None
		erp_loc_value = ",".join(sorted({
			l["erp_loc_value"] for l in mapping.get("location_codes") or [] if l.get("erp_loc_value")
		})) or None
		if not unit and not erp_cost_center_value and not erp_loc_value:
			frappe.throw(_("Operating Unit '{0}' has no units/cost centers/location codes configured.").format(operating_unit))

	# Resolve a plain user-given cost_center/location_code (e.g. "111100",
	# "1001" - the ERP code shown in the real page's own filter dropdowns,
	# which is also each Cost Center/Location Code doc's own `cost_center`/
	# `location_code` field, NOT its Frappe doc name) into BOTH forms the
	# underlying report needs: the budget-side doc name (get_combined_actuals'
	# own cost_center/location_code params, used only for the budget-side
	# comparison figures) and the ERP code itself (erp_cost_center_value/
	# erp_loc_value, the ONLY thing sum_of_actuals_by_sequence's actuals
	# lookup actually filters by - passing just the doc name here, as this
	# tool previously did, left the real actuals total completely
	# unfiltered: a confirmed bug, not a permission issue). operating_unit's
	# own resolution above already produces both forms directly from
	# get_theme_mappings, so this only runs for a plain, non-Operating-Unit
	# cost_center/location_code.
	if cost_center and not operating_unit:
		requested_codes = [c.strip() for c in str(cost_center).split(",") if c.strip()]
		cc_docs = frappe.get_all("Cost Center", filters={"cost_center": ["in", requested_codes]}, fields=["name", "cost_center"])
		found_codes = {str(d.cost_center) for d in cc_docs}
		missing = set(requested_codes) - found_codes
		if missing:
			frappe.throw(_("Unknown cost center code(s): {0}").format(", ".join(sorted(missing))))
		cost_center = ",".join(str(d.name) for d in cc_docs)
		erp_cost_center_value = ",".join(requested_codes)

	if location_code and not operating_unit:
		requested_codes = [l.strip() for l in str(location_code).split(",") if l.strip()]
		loc_docs = frappe.get_all("Location Code", filters={"location_code": ["in", requested_codes]}, fields=["name", "location_code"])
		found_codes = {str(d.location_code) for d in loc_docs}
		missing = set(requested_codes) - found_codes
		if missing:
			frappe.throw(_("Unknown location code(s): {0}").format(", ".join(sorted(missing))))
		location_code = ",".join(str(d.name) for d in loc_docs)
		erp_loc_value = ",".join(requested_codes)

	allowed_units = get_allowed_units()
	if allowed_units is not None:
		if unit:
			requested = {u.strip() for u in str(unit).split(",") if u.strip()}
			if not requested.issubset(allowed_units):
				frappe.throw(_("You do not have access to one or more of the requested units."), frappe.PermissionError)
		elif not allowed_units and not cost_center and not location_code:
			return {
				"financial_year": financial_year,
				"month": month,
				"grand_total_ytd": 0,
				"heads": [],
				"note": "You do not have access to any budget units.",
			}
		elif not operating_unit and not cost_center and not location_code:
			unit = ",".join(sorted(allowed_units))

	if cost_center:
		allowed_cost_centers = get_allowed_cost_centers()
		if allowed_cost_centers is not None:
			requested = {c.strip() for c in str(cost_center).split(",") if c.strip()}
			if not requested.issubset(allowed_cost_centers):
				frappe.throw(_("You do not have access to one or more of the requested cost centers."), frappe.PermissionError)

	if location_code:
		allowed_location_codes = get_allowed_location_codes()
		if allowed_location_codes is not None:
			requested = {l.strip() for l in str(location_code).split(",") if l.strip()}
			if not requested.issubset(allowed_location_codes):
				frappe.throw(_("You do not have access to one or more of the requested location codes."), frappe.PermissionError)

	heads = get_combined_actuals(
		financial_year=financial_year,
		month=month,
		unit=unit,
		cost_center=cost_center,
		location_code=location_code,
		erp_cost_center_value=erp_cost_center_value,
		erp_loc_value=erp_loc_value,
	) or []

	head_summaries = []
	grand_total = 0.0
	for head in heads:
		total = float(head.get("total_posted_amt_ytd") or 0)
		grand_total += total
		head_summaries.append({"head": head.get("name"), "total_ytd": round(total, 2)})

	return {
		"financial_year": financial_year,
		"month": month,
		"unit": operating_unit or unit or "all units you have access to",
		"grand_total_ytd": round(grand_total, 2),
		"heads": head_summaries,
	}


# The Monthly MIS page's own human-facing section names (shown as card/
# breakup-table headings) are a FRONTEND-ONLY grouping of several raw
# `table_name` values the backend actually understands - see
# frontend/src/pages/MonthlyMis.vue's own buildBreakupSections() calls
# (healthBreakup/eduBreakup/univBreakup/etc), which this mirrors exactly so
# the assistant can accept the same human name a person looking at the page
# would use, without needing to know or guess the underlying raw table
# names itself.
MONTHLY_MIS_SECTIONS = {
	"health": [
		"Urban Primary care work", "Rural Primary care work", "Central Initiatives",
		"Hospital", "Health Programs Team & Enablers",
	],
	"education": ["Education - District Institutes", "Education- Azim Premji Schools"],
	"university": [
		"Azim Premji University (Bangalore Campus)", "Azim Premji University (Bhopal Campus)",
		"Azim Premji University (Ranchi Campus)", "Azim Premji University (Guwahati Campus)",
	],
	"livelihoods": ["Livelihoods"],
	"enablers": ["Enablers"],
}


def get_monthly_mis_summary(financial_year=None, month=None, section=None, table_name_filter=None):
	"""The authoritative Monthly MIS Operating/Capital Expense break-up - the
	same computation and the same shared server-side ERP actuals cache
	(budget_mis.api_1.erp_actuals, TTL from ERP Credentials.
	actuals_cache_duration_minutes) the Monthly MIS page itself reads, not a
	re-derivation from raw doctype records. Returns current and previous
	financial-year figures for the given month, broken down per table/
	section with each row's Operating/Capital/Total Expense budget, actuals,
	and % of budget - the same shape the Monthly MIS page's own breakup
	tables show.

	`section` accepts the same human-facing name shown on the Monthly MIS
	page (health/education/university/livelihoods/enablers, case
	-insensitive) and expands it to the underlying raw table_name_filter
	group via MONTHLY_MIS_SECTIONS above - pass this instead of guessing raw
	table names. table_name_filter is still available directly for any
	other raw table name shown in the page's own "Foundation Overall" table
	(e.g. a specific unit). If both are omitted, every table is returned.

	The underlying page itself applies no per-user unit scoping (any logged
	-in user who can open Monthly MIS sees the same foundation-wide figures,
	same as get_monthly_mis_page_data's own HTTP endpoint) - this tool
	matches that exactly rather than inventing a stricter scope the page
	doesn't itself enforce. It does NOT expose anything beyond what the
	Monthly MIS page already shows any logged-in user: no line-item detail,
	no PII, no ERP credentials.

	The tool's OWN summarized response (not just the underlying ERP fetch)
	is cached server-side, shared across users and separate from the raw
	ERP cache, so repeated/similar assistant questions about the same
	financial_year+month+table_name_filter don't redo the aggregation work
	- same TTL as the ERP actuals cache, since it's only ever as fresh as
	that underlying data anyway.
	"""
	from budget_mis.api_1.helper import get_actuals_cache_duration_seconds
	from budget_mis.api_1.monthly_mis import get_monthly_mis_break_up

	if not financial_year:
		financial_year = frappe.db.get_single_value("Master Settings", "current_financial_year")
	if not financial_year:
		frappe.throw(_("No financial year was given, and none is set as current in Master Settings."))
	if not month:
		frappe.throw(_("A month is required (e.g. 'September') - Monthly MIS is always reported year-to-date through a specific month."))

	if section:
		section_key = str(section).strip().lower()
		section_tables = MONTHLY_MIS_SECTIONS.get(section_key)
		if not section_tables:
			frappe.throw(_("Unknown section '{0}'. Valid sections: {1}").format(
				section, ", ".join(sorted(MONTHLY_MIS_SECTIONS))
			))
		table_name_filter = ",".join(section_tables)

	cache_key = f"budget_mis:ai_monthly_mis_summary:{financial_year}:{month}:{table_name_filter or ''}"
	cached = frappe.cache().get_value(cache_key)
	if cached is not None:
		return cached

	break_up = get_monthly_mis_break_up(financial_year, month, table_name_filter) or {}

	# Real ERP head names come through with inconsistent internal spacing
	# (e.g. "OPERATING  EXPENSES", double space) - collapsed here the same
	# way the frontend's own normName() does, rather than matching the
	# exact literal string, which would silently zero out every row like
	# this tool's first version did.
	def _norm(name):
		return " ".join(str(name or "").split()).upper()

	tables = []
	for table_name, entries in break_up.items():
		rows = []
		for entry in entries:
			# is_this_sub_item rows are already folded into their parent's
			# own totals (same convention as the page's own breakup tables -
			# see BreakupTable.vue) - listing them separately here would
			# double count. The synthetic "CONSOLIDATED TOTAL" entry
			# (settings_doc == "CONSOLIDATED") uses different head names
			# entirely (CAPEX TOTAL/OPEX TOTAL/OVERALL GRAND TOTAL) and
			# carries no per-entry OPERATING/CAPITAL/GRAND TOTAL heads at
			# all, so including it here would add an all-zero row.
			if entry.get("is_this_sub_item") or entry.get("settings_doc") == "CONSOLIDATED":
				continue
			actuals = {_norm(a.get("name")): a for a in entry.get("actuals", [])}
			opex = actuals.get("OPERATING EXPENSES") or {}
			capex = actuals.get("CAPITAL EXPENSES") or {}
			grand = actuals.get("GRAND TOTAL") or {}
			rows.append({
				"label": entry.get("label"),
				"operating_expense_budget": opex.get("ytd", 0),
				"operating_expense_actuals": opex.get("total_posted_amt_ytd", 0),
				"capital_expense_budget": capex.get("ytd", 0),
				"capital_expense_actuals": capex.get("total_posted_amt_ytd", 0),
				"total_expense_budget": grand.get("ytd", 0),
				"total_expense_actuals": grand.get("total_posted_amt_ytd", 0),
			})
		tables.append({"table_name": table_name, "rows": rows})

	result = {
		"financial_year": financial_year,
		"month": month,
		"tables": tables,
		"note": "Figures are in raw rupees, year-to-date through the given month, same as the Monthly MIS page.",
	}
	frappe.cache().set_value(cache_key, result, expires_in_sec=get_actuals_cache_duration_seconds())
	return result


MAX_EXPORT_ROWS = 5000


def export_to_excel(title, columns, rows):
	"""Builds a real .xlsx file from a flat table the model itself assembles
	(a column header list + a list of row value lists) and saves it as a
	private File attached to a throwaway 'AI Assistant Export' log document
	owned by the calling user - Frappe's own File/permission system is what
	actually protects it (only the owner, plus anyone with read on that log
	doctype, can ever fetch the URL), not any bespoke access check here.

	Deliberately generic rather than tool-result-shape-aware: every data
	tool's own response shape differs (get_budget_summary's heads list vs
	get_monthly_mis_summary's per-table rows vs search_records' arbitrary
	fields), so asking the model to flatten whatever result it already has
	into columns/rows itself is far simpler and more robust than writing
	(and maintaining, as new tools are added) a separate auto-flattener per
	tool shape here.

	No unit/role re-scoping happens in this function itself - by the time
	the model calls this, the DATA already came from an earlier tool call
	that applied its own access scoping (get_budget_summary/
	get_actuals_summary's own get_allowed_units checks, search_records'
	own frappe.get_list permission filtering, etc) - this only turns
	already-permitted data into a downloadable file, it is not itself a
	new data-access point.
	"""
	import openpyxl
	from frappe.utils.file_manager import save_file

	if not columns or not isinstance(columns, (list, tuple)):
		frappe.throw(_("columns must be a non-empty list of column header strings."))
	if not isinstance(rows, (list, tuple)):
		frappe.throw(_("rows must be a list of row value lists."))
	if len(rows) > MAX_EXPORT_ROWS:
		frappe.throw(_("Too many rows to export ({0}) - ask a narrower question first.").format(len(rows)))

	wb = openpyxl.Workbook()
	ws = wb.active
	ws.title = (str(title or "Export"))[:31] or "Export"
	ws.append([str(c) for c in columns])
	for row in rows:
		ws.append(list(row) if isinstance(row, (list, tuple)) else [row])
	for i, _col in enumerate(columns, start=1):
		ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width = 22

	import io
	buf = io.BytesIO()
	wb.save(buf)

	# A lightweight log doctype (not a real business record) purely to give
	# the saved File something to attach to and be permission-scoped
	# against - frappe.get_doc(ignore_permissions) here is the same pattern
	# Frappe's own background/system-generated attachments use (e.g. a
	# scheduled report's output), not a bypass of the calling user's own
	# access: the log doc's own permissions still gate who can later open
	# the File through it, and it is always created as/for the current
	# session user, never on anyone else's behalf.
	log = frappe.get_doc({
		"doctype": "AI Assistant Export",
		"user": frappe.session.user,
		"title": title or "Export",
	})
	log.insert(ignore_permissions=True)

	file_name = f"{(title or 'export').strip().replace(' ', '_')}.xlsx"
	file_doc = save_file(file_name, buf.getvalue(), "AI Assistant Export", log.name, is_private=1)

	return {
		"file_url": file_doc.file_url,
		"file_name": file_doc.file_name,
		"row_count": len(rows),
	}


def search_records(doctype, filters=None, fields=None, limit=20):
	"""List records the current user can read, permission-filtered by
	frappe.get_list exactly as the app's own list views are."""
	_require_allowed_doctype(doctype)
	limit = min(int(limit or 20), 50)
	if not fields:
		meta = frappe.get_meta(doctype)
		fields = ["name"] + [f.fieldname for f in meta.fields if f.in_list_view][:6]
		fields = list(dict.fromkeys(fields))
	return frappe.get_list(
		doctype,
		filters=filters or {},
		fields=fields,
		limit_page_length=limit,
	)


def get_record(doctype, name):
	"""A single record's data, only if the current user can read it."""
	_require_allowed_doctype(doctype)
	if not frappe.has_permission(doctype, ptype="read", doc=name):
		frappe.throw(_("You do not have permission to view this record"), frappe.PermissionError)
	doc = frappe.get_doc(doctype, name)
	data = doc.as_dict()
	# Drop framework/internal bookkeeping fields and any Table (child) rows -
	# keep the payload small and focused on the record's own field values.
	for key in list(data.keys()):
		if key.startswith("_") or key in ("doctype", "owner", "idx", "docstatus"):
			data.pop(key, None)
		elif isinstance(data.get(key), list):
			data.pop(key, None)
	return data


def create_record(doctype, values):
	"""Create a record as the current user - frappe.new_doc().insert() applies
	the same create-permission check a form's save button does."""
	_require_allowed_doctype(doctype)
	if not frappe.has_permission(doctype, ptype="create"):
		frappe.throw(_("You do not have permission to create {0}").format(doctype), frappe.PermissionError)
	doc = frappe.new_doc(doctype)
	doc.update(values or {})
	doc.insert()
	return {"doctype": doctype, "name": doc.name}


def update_record(doctype, name, values):
	"""Update a record as the current user - doc.save() applies the same
	write-permission check a form's save button does."""
	_require_allowed_doctype(doctype)
	if not frappe.has_permission(doctype, ptype="write", doc=name):
		frappe.throw(_("You do not have permission to edit this record"), frappe.PermissionError)
	doc = frappe.get_doc(doctype, name)
	doc.update(values or {})
	doc.save()
	return {"doctype": doctype, "name": doc.name}


TOOL_FUNCTIONS = {
	"list_doctypes": list_doctypes,
	"get_doctype_meta": get_doctype_meta,
	"get_my_access": get_my_access,
	"propose_guide_point": propose_guide_point,
	"list_users": list_users,
	"list_operating_units": list_operating_units,
	"resolve_operating_unit": resolve_operating_unit,
	"get_budget_summary": get_budget_summary,
	"get_actuals_summary": get_actuals_summary,
	"get_monthly_mis_summary": get_monthly_mis_summary,
	"export_to_excel": export_to_excel,
	"search_records": search_records,
	"get_record": get_record,
	"create_record": create_record,
	"update_record": update_record,
}


TOOL_SCHEMAS = [
	{
		"type": "function",
		"function": {
			"name": "list_doctypes",
			"description": "List the data types (doctypes) available to the assistant in this budget app. Call this first if unsure what data exists.",
			"parameters": {"type": "object", "properties": {}},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "get_doctype_meta",
			"description": "Get the field list (name, label, type, required) for a doctype. Always call this before create_record or update_record so you know which fields are required and never guess a required value the user has not given you - ask them instead.",
			"parameters": {
				"type": "object",
				"properties": {"doctype": {"type": "string"}},
				"required": ["doctype"],
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "get_my_access",
			"description": (
				"Get the current user's own permission scope: whether they are a finance admin (unrestricted) "
				"or restricted to specific units, and which units if so. Call this whenever the user asks what "
				"they can see, why a result seems limited, or whether an answer is scoped to them - never guess "
				"or infer their access from other tool results."
			),
			"parameters": {"type": "object", "properties": {}},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "propose_guide_point",
			"description": (
				"Suggest a new instruction for yourself for an admin to review and approve - use this ONLY when you "
				"actually hit a real gap in your own instructions during this conversation: you had to guess at "
				"something your instructions don't cover, the user corrected a mistake you made, or you noticed a "
				"recurring type of question you don't have clear guidance for. Do NOT call this for routine questions "
				"you already answered correctly, and do not call it more than once or twice in a conversation. The "
				"suggestion is never active immediately - it only takes effect after an admin approves it, so tell the "
				"user (if relevant) that you've noted this for review, not that you've already learned it."
			),
			"parameters": {
				"type": "object",
				"properties": {
					"point": {
						"type": "string",
						"description": "The proposed instruction itself, written the same way an existing guide point would be (a single, self-contained statement).",
					},
					"reason": {
						"type": "string",
						"description": "What in this conversation prompted the suggestion - be specific (e.g. 'User asked about X and I had no guidance on which tool to use').",
					},
				},
				"required": ["point", "reason"],
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "list_users",
			"description": (
				"Look up app users and their roles (name, full name, enabled status, roles). Only works if the "
				"current user has permission to view users (e.g. an admin) - if denied, tell the user plainly "
				"rather than retrying. Never returns passwords, API keys, or other secrets."
			),
			"parameters": {
				"type": "object",
				"properties": {
					"filters": {
						"type": "object",
						"description": 'Frappe filter dict, e.g. {"enabled": 1}. Omit for no filter.',
					},
					"limit": {"type": "integer", "description": "Max rows, default 20, hard cap 50."},
				},
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "list_operating_units",
			"description": (
				"List the available Operating Units (e.g. 'Azim Premji School', 'Azim Premji University') - a "
				"higher-level grouping distinct from a raw Unit code, each covering a whole set of Units/Cost "
				"Centers/Location Codes. Call this whenever the user names something that might be an Operating "
				"Unit rather than a literal Unit code, before passing it to get_actuals_summary's operating_unit "
				"argument or get_budget_summary's unit argument - never guess at whether a name is a real Unit "
				"code or an Operating Unit."
			),
			"parameters": {"type": "object", "properties": {}},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "resolve_operating_unit",
			"description": (
				"Show exactly which Units/Cost Centers/Location Codes one Operating Unit (from list_operating_units) "
				"covers. Use this only when the user asks what an Operating Unit actually includes - get_actuals_summary "
				"and get_budget_summary already resolve an operating_unit/unit argument internally, so this is not a "
				"required first step before calling those."
			),
			"parameters": {
				"type": "object",
				"properties": {
					"operating_unit": {
						"type": "string",
						"description": "An Operating Unit's name, as returned by list_operating_units.",
					},
				},
				"required": ["operating_unit"],
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "get_budget_summary",
			"description": (
				"The ONLY correct source for a budget total, grand total, or per-head total for a financial year. "
				"Always call this for any question about how much budget is allocated, sanctioned, or planned - "
				"never compute a total yourself and never use search_records or get_record on 'Finance Budget' "
				"for this, since each 'Finance Budget' record is a single line item, not an aggregate. "
				"If the user doesn't name a financial year, call this with no financial_year argument - it defaults "
				"to the app's current financial year, and its reply tells you which year that was. If the user names "
				"an Operating Unit (e.g. 'Azim Premji School') rather than a literal Unit code, pass it as "
				"operating_unit, never as unit - call list_operating_units first if unsure which one a name is."
			),
			"parameters": {
				"type": "object",
				"properties": {
					"financial_year": {
						"type": ["string", "null"],
						"description": "e.g. '2026-27'. Omit or pass null to use the app's current financial year.",
					},
					"unit": {
						"type": ["string", "null"],
						"description": "Optional comma-separated literal Unit code(s) (e.g. 'APU') to scope the total to. Omit or pass null for all units the current user can access. Never pass an Operating Unit's name here - use operating_unit instead.",
					},
					"operating_unit": {
						"type": ["string", "null"],
						"description": "Optional Operating Unit name, as returned by list_operating_units (e.g. 'Azim Premji School'), to scope the total to. Mutually exclusive with unit.",
					},
					"cost_center": {
						"type": ["string", "null"],
						"description": "Optional comma-separated Cost Center code(s) (e.g. '111100'), exactly as the user gives them. Narrows further within unit/operating_unit if given, or works alone with no unit at all.",
					},
					"location_code": {
						"type": ["string", "null"],
						"description": "Optional comma-separated Location Code(s) (e.g. '1001'), exactly as the user gives them. Narrows further within unit/operating_unit if given, or works alone with no unit at all.",
					},
				},
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "get_actuals_summary",
			"description": (
				"The ONLY correct source for an ACTUAL/spent/utilized expenditure total, as opposed to a budgeted/"
				"planned total (use get_budget_summary for that instead). Always call this for any question about "
				"how much has actually been spent, utilized, or posted so far - never compute a total yourself and "
				"never use search_records or get_record on 'Finance Budget' or 'Monthly Adjustment' for this. "
				"Actuals are always reported year-to-date through a specific month, so a month is required - if the "
				"user doesn't name one, ask them which month instead of guessing. If the user names an Operating "
				"Unit (e.g. 'Azim Premji School') rather than a literal Unit code, pass it as operating_unit, never "
				"as unit - passing an Operating Unit's name as unit will not match anything and silently returns a "
				"0.00 total instead of an error. Call list_operating_units first if unsure which one a name is."
			),
			"parameters": {
				"type": "object",
				"properties": {
					"financial_year": {
						"type": ["string", "null"],
						"description": "e.g. '2026-27'. Omit or pass null to use the app's current financial year.",
					},
					"month": {
						"type": "string",
						"description": "Required. Full month name (e.g. 'september'), April through March. Actuals are reported year-to-date through this month.",
					},
					"unit": {
						"type": ["string", "null"],
						"description": "Optional comma-separated literal Unit code(s) (e.g. 'APU') to scope the total to. Omit or pass null for all units the current user can access. Never pass an Operating Unit's name here - use operating_unit instead.",
					},
					"operating_unit": {
						"type": ["string", "null"],
						"description": "Optional Operating Unit name, as returned by list_operating_units (e.g. 'Azim Premji School'), to scope the total to. Mutually exclusive with unit.",
					},
					"cost_center": {
						"type": ["string", "null"],
						"description": "Optional comma-separated Cost Center code(s) (e.g. '111100'), exactly as the user gives them - never translate, reformat, or guess a different value. Narrows further within unit/operating_unit if given, or works alone with no unit at all.",
					},
					"location_code": {
						"type": ["string", "null"],
						"description": "Optional comma-separated Location Code(s) (e.g. '1001'), exactly as the user gives them. Narrows further within unit/operating_unit if given, or works alone with no unit at all.",
					},
				},
				"required": ["month"],
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "get_monthly_mis_summary",
			"description": (
				"The ONLY correct source for Monthly MIS Operating/Capital/Total Expense figures (budget, actuals, "
				"% of budget) for a financial year, reported year-to-date through a given month. Always call this "
				"for any Monthly MIS question - never compute this yourself from search_records or get_record. "
				"A month is required. If the user doesn't name a financial year, omit it to use the app's current "
				"financial year. Use `section` for a human-named area of work (health/education/university/"
				"livelihoods/enablers) - never guess at a raw table_name_filter value for these."
			),
			"parameters": {
				"type": "object",
				"properties": {
					"financial_year": {
						"type": ["string", "null"],
						"description": "e.g. '2026-27'. Omit or pass null to use the app's current financial year.",
					},
					"month": {
						"type": "string",
						"description": "Required. Full month name (e.g. 'September'). Figures are year-to-date through this month.",
					},
					"section": {
						"type": ["string", "null"],
						"description": "One of: health, education, university, livelihoods, enablers (case-insensitive). Omit or pass null for every section/table.",
					},
					"table_name_filter": {
						"type": ["string", "null"],
						"description": "Advanced: a specific raw table/unit name as shown in the page's own 'Foundation Overall' table (e.g. a specific unit name), comma-separated for several. Prefer `section` for a named area of work. Omit or pass null for every table.",
					},
				},
				"required": ["month"],
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "export_to_excel",
			"description": (
				"Build a downloadable Excel (.xlsx) file from data you already have (from an earlier tool call in this "
				"same conversation) and get back a link the user can click to download it. Use this whenever the user "
				"asks to export, download, or 'send as excel/spreadsheet', or whenever a result you are about to show "
				"has many rows (more than about 15-20) and would be easier as a file than a long chat message - in "
				"that case, still give a short one- or two-sentence summary in your reply AND call this tool, rather "
				"than pasting every row into the chat. You must flatten the data yourself into a plain column header "
				"list and a list of row value lists - do not pass a tool's raw JSON result as-is."
			),
			"parameters": {
				"type": "object",
				"properties": {
					"title": {"type": "string", "description": "Short file/sheet title, e.g. 'Budget Summary 2026-27'."},
					"columns": {
						"type": "array",
						"items": {"type": "string"},
						"description": "Column header names, in order.",
					},
					"rows": {
						"type": "array",
						"items": {"type": "array"},
						"description": "One array per row, values in the same order as columns.",
					},
				},
				"required": ["title", "columns", "rows"],
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "search_records",
			"description": "Search/list records of a doctype the user can see, optionally filtered. Use this for lookups and counts of individual records - never for budget totals, actual/spend totals, or any other aggregate (use get_budget_summary or get_actuals_summary for those).",
			"parameters": {
				"type": "object",
				"properties": {
					"doctype": {"type": "string"},
					"filters": {
						"type": "object",
						"description": 'Frappe filter dict, e.g. {"financial_year": "2025-26"}. Omit for no filter.',
					},
					"fields": {
						"type": "array",
						"items": {"type": "string"},
						"description": "Fieldnames to return. Omit to use the doctype's default list columns.",
					},
					"limit": {"type": "integer", "description": "Max rows, default 20, hard cap 50."},
				},
				"required": ["doctype"],
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "get_record",
			"description": "Get the full field values of one specific record by name.",
			"parameters": {
				"type": "object",
				"properties": {
					"doctype": {"type": "string"},
					"name": {"type": "string"},
				},
				"required": ["doctype", "name"],
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "create_record",
			"description": "Create a new record. Call get_doctype_meta first, confirm the values with the user in plain language, and only then call this. Never invent a value for a required field - ask the user for it instead.",
			"parameters": {
				"type": "object",
				"properties": {
					"doctype": {"type": "string"},
					"values": {"type": "object", "description": "fieldname -> value map"},
				},
				"required": ["doctype", "values"],
			},
		},
	},
	{
		"type": "function",
		"function": {
			"name": "update_record",
			"description": "Update fields on an existing record. Confirm the change with the user before calling this.",
			"parameters": {
				"type": "object",
				"properties": {
					"doctype": {"type": "string"},
					"name": {"type": "string"},
					"values": {"type": "object", "description": "fieldname -> new value map"},
				},
				"required": ["doctype", "name", "values"],
			},
		},
	},
]
