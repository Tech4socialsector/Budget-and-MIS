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

from annual_budget.utils import get_allowed_units, is_finance_admin

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


def get_budget_summary(financial_year=None, unit=None):
	"""The authoritative aggregate budget total for a financial year -
	built the same way the Budget Summary page computes its grand total
	(summing every expense head's monthly q1-q4 figures from the
	consolidated report), not by reading or summing raw "Finance Budget"
	records one at a time. A single Finance Budget record's own
	total_budget field is one line item, never the org-wide total - the
	assistant must never treat it as one.

	Always scoped to the calling user's own unit access (never the
	internal/admin-unscoped default get_consolidated_report falls back to
	for non-HTTP callers), so a restricted Finance user asking this
	assistant never sees more than their own list views already show
	them.
	"""
	from annual_budget.api.phase_sheet import get_consolidated_report

	if not financial_year:
		financial_year = frappe.db.get_single_value("Master Settings", "current_financial_year")
	if not financial_year:
		frappe.throw(_("No financial year was given, and none is set as current in Master Settings."))

	allowed_units = get_allowed_units()
	if allowed_units is not None:
		if unit:
			requested = {u.strip() for u in str(unit).split(",") if u.strip()}
			if not requested.issubset(allowed_units):
				frappe.throw(_("You do not have access to one or more of the requested units."), frappe.PermissionError)
		elif not allowed_units:
			return {
				"financial_year": financial_year,
				"grand_total": 0,
				"heads": [],
				"note": "You do not have access to any budget units.",
			}
		else:
			unit = ",".join(sorted(allowed_units))

	heads = get_consolidated_report(financial_year=financial_year, units=unit) or []

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
		"unit": unit or "all units you have access to",
		"grand_total": round(grand_total, 2),
		"heads": head_summaries,
	}


MONTHS_IN_ORDER = [
	"april", "may", "june",
	"july", "august", "september",
	"october", "november", "december",
	"january", "february", "march",
]


def get_actuals_summary(financial_year=None, month=None, unit=None):
	"""The authoritative year-to-date ACTUAL spend total (as opposed to
	get_budget_summary's BUDGETED/planned total) for a financial year,
	through a given month. Built the same way the Budget Dashboard's
	"Budget vs Actuals" tab computes it (phase_sheet.get_combined_actuals,
	itself sourced from the single consolidated PeopleSoft actuals path -
	see annual_budget/api/actuals.py), not by reading or summing raw
	"Finance Budget", "Monthly Adjustment", or any other doctype's records
	directly. Never confuse this with get_budget_summary - "actual"/"spent"/
	"utilized"/"expenditure so far" means this tool; "budget"/"allocated"/
	"sanctioned"/"planned" means get_budget_summary.

	Always scoped to the calling user's own unit access (get_combined_actuals
	itself applies no such scoping when called internally), so a restricted
	Finance user asking this assistant never sees more than their own list
	views already show them.
	"""
	from annual_budget.api.phase_sheet import get_combined_actuals

	if not financial_year:
		financial_year = frappe.db.get_single_value("Master Settings", "current_financial_year")
	if not financial_year:
		frappe.throw(_("No financial year was given, and none is set as current in Master Settings."))

	if not month:
		frappe.throw(_("A month is required (e.g. 'september') - actuals are always reported year-to-date through a specific month."))
	month = str(month).strip().lower()
	if month not in MONTHS_IN_ORDER:
		frappe.throw(_("Invalid month '{0}'. Use a full month name, April through March.").format(month))

	allowed_units = get_allowed_units()
	if allowed_units is not None:
		if unit:
			requested = {u.strip() for u in str(unit).split(",") if u.strip()}
			if not requested.issubset(allowed_units):
				frappe.throw(_("You do not have access to one or more of the requested units."), frappe.PermissionError)
		elif not allowed_units:
			return {
				"financial_year": financial_year,
				"month": month,
				"grand_total_ytd": 0,
				"heads": [],
				"note": "You do not have access to any budget units.",
			}
		else:
			unit = ",".join(sorted(allowed_units))

	heads = get_combined_actuals(financial_year=financial_year, month=month, unit=unit) or []

	head_summaries = []
	grand_total = 0.0
	for head in heads:
		total = float(head.get("total_posted_amt_ytd") or 0)
		grand_total += total
		head_summaries.append({"head": head.get("name"), "total_ytd": round(total, 2)})

	return {
		"financial_year": financial_year,
		"month": month,
		"unit": unit or "all units you have access to",
		"grand_total_ytd": round(grand_total, 2),
		"heads": head_summaries,
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
	"list_users": list_users,
	"get_budget_summary": get_budget_summary,
	"get_actuals_summary": get_actuals_summary,
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
			"name": "get_budget_summary",
			"description": (
				"The ONLY correct source for a budget total, grand total, or per-head total for a financial year. "
				"Always call this for any question about how much budget is allocated, sanctioned, or planned - "
				"never compute a total yourself and never use search_records or get_record on 'Finance Budget' "
				"for this, since each 'Finance Budget' record is a single line item, not an aggregate. "
				"If the user doesn't name a financial year, call this with no financial_year argument - it defaults "
				"to the app's current financial year, and its reply tells you which year that was."
			),
			"parameters": {
				"type": "object",
				"properties": {
					"financial_year": {
						"type": "string",
						"description": "e.g. '2026-27'. Omit to use the app's current financial year.",
					},
					"unit": {
						"type": "string",
						"description": "Optional comma-separated unit name(s) to scope the total to. Omit for all units the current user can access.",
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
				"user doesn't name one, ask them which month instead of guessing."
			),
			"parameters": {
				"type": "object",
				"properties": {
					"financial_year": {
						"type": "string",
						"description": "e.g. '2026-27'. Omit to use the app's current financial year.",
					},
					"month": {
						"type": "string",
						"description": "Required. Full month name (e.g. 'september'), April through March. Actuals are reported year-to-date through this month.",
					},
					"unit": {
						"type": "string",
						"description": "Optional comma-separated unit name(s) to scope the total to. Omit for all units the current user can access.",
					},
				},
				"required": ["month"],
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
