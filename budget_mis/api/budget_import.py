"""Upload side of Budget Import Template (frontend/src/pages/BudgetImportUpload.vue)
- parses a filled-in .xlsx (the exact shape budget_mis.api.budget_import_template
.generate_budget_template produces) and upserts Finance Budget /
Finance Budget Amounts records from it.

Net-new: no prior import/upload backend existed anywhere in this app before
this file - generate_budget_template only ever produced the download, and
Finance Budget's own doctype json sets allow_import=1 but nothing in this
app ever wired Frappe's generic Data Import tool to it (confirmed: no
importable_doctypes entry in hooks.py, no custom import mapper).

Two-step flow (preview, then confirm) rather than import-on-upload, so a
wrong file never silently overwrites real budget data:
  1. preview_budget_import(file_url) - parses and validates only, returns a
     summary (rows to create/update, totals, any errors) plus the parsed
     rows themselves so the frontend can show them back to the user.
  2. commit_budget_import(file_url) - re-parses (never trusts a client-held
     copy of parsed rows - the file is the only source of truth) and
     actually writes Finance Budget / Finance Budget Amounts.

Column layout matches generate_budget_template's `headers` list exactly,
by fixed 0-based index (not by header-name lookup, since the sheet's
header row is locked/not meant to be edited, but being defensive about
column *values* still matters - a renamed/reordered header would otherwise
silently misparse every row):
  0 unit (doc name)            6 location_code_erp (display only)
  1 unit_description (ignored) 7 location_description (ignored)
  2 cost_center (doc name)     8 state (ignored)
  3 cost_center_erp (ignored)  9 financial_year
  4 cost_center_description    10 uploaded_by (ignored - recomputed as the
                                    actual uploading user, not trusted from
                                    the file, which could be stale/forged)
  5 location_code (doc name)   11 type_of_expense_id (Link to Expenses)
                                12-14 head/sub_head/type_of_expense (ignored
                                    - descriptive only, re-fetched from
                                    type_of_expense_id's own doc)
                                15-26 April..March monthly amounts
                                27-31 Q1-Q4/Year (ignored - ALWAYS
                                    recomputed server-side from the 12
                                    monthly values, since Excel formula
                                    results in an uploaded file can be
                                    stale/zero if a user edited months
                                    without the workbook recalculating, or
                                    the file was produced by a tool that
                                    doesn't evaluate formulas at all)

A "parent" row (one per unit/cost_center/location_code/financial_year
group) only carries columns 0-10 on its FIRST line - generate_budget_template
leaves them blank on every subsequent line of the same group - so parsing
forward-fills the last non-blank group identity across consecutive rows,
same convention the template itself was written with.
"""

import frappe
import openpyxl

from frappe.utils import get_fullname, now_datetime, get_datetime_str

from budget_mis.utils import (
	is_finance_admin,
	get_allowed_units,
	get_allowed_cost_centers,
	get_allowed_location_codes,
)

MONTH_COLUMNS = [
	"april", "may", "june", "july", "august", "september",
	"october", "november", "december", "january", "february", "march",
]

# 0-based column indices, matching generate_budget_template's `headers` list.
COL_UNIT = 0
COL_UNIT_DESCRIPTION = 1
COL_COST_CENTER = 2
COL_COST_CENTER_ERP = 3
COL_COST_CENTER_DESCRIPTION = 4
COL_LOCATION_CODE = 5
COL_LOCATION_CODE_ERP = 6
COL_LOCATION_DESCRIPTION = 7
COL_STATE = 8
COL_FINANCIAL_YEAR = 9
# COL 10 (Uploaded By) is read from the file only to forward-fill the parent
# group's own identity below - never trusted as the row's real uploader
# (see commit_budget_import, which always uses the actual logged-in user
# instead). Exposed in the preview purely as a display field.
COL_UPLOADED_BY = 10
COL_TYPE_OF_EXPENSE_ID = 11
COL_HEAD_OF_EXPENSE = 12
COL_SUB_HEAD_OF_EXPENSE = 13
COL_TYPE_OF_EXPENSE = 14
COL_MONTH_START = 15  # April .. March = columns 15-26 inclusive


def _read_rows(file_url):
	file_doc = frappe.get_doc("File", {"file_url": file_url})
	content = file_doc.get_content()

	import io
	workbook = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
	worksheet = workbook.worksheets[0]

	rows = []
	# Carries both the real identity fields (unit/cost_center/location_code/
	# financial_year - what a row is actually matched/written against) and
	# the PURELY DISPLAY fields the file carries alongside them (unit
	# description, cost center/location ERP codes and descriptions, state,
	# uploaded_by) - generate_budget_template leaves all of these blank on
	# every row of a group after its first, so every one of them needs the
	# same forward-fill, not just the identity fields.
	group = None

	for excel_row_num, row in enumerate(worksheet.iter_rows(min_row=2, values_only=True), start=2):
		if row is None or all(v in (None, "") for v in row):
			continue

		unit = row[COL_UNIT] or (group["unit"] if group else None)
		cost_center = row[COL_COST_CENTER] or (group["cost_center"] if group else None)
		location_code = row[COL_LOCATION_CODE] or (group["location_code"] if group else None)
		financial_year = row[COL_FINANCIAL_YEAR] or (group["financial_year"] if group else None)
		unit_description = row[COL_UNIT_DESCRIPTION] or (group["unit_description"] if group else None)
		cost_center_erp = row[COL_COST_CENTER_ERP] or (group["cost_center_erp"] if group else None)
		cost_center_description = row[COL_COST_CENTER_DESCRIPTION] or (group["cost_center_description"] if group else None)
		location_code_erp = row[COL_LOCATION_CODE_ERP] or (group["location_code_erp"] if group else None)
		location_description = row[COL_LOCATION_DESCRIPTION] or (group["location_description"] if group else None)
		state = row[COL_STATE] or (group["state"] if group else None)
		uploaded_by = row[COL_UPLOADED_BY] or (group["uploaded_by"] if group else None)

		if row[COL_UNIT]:
			group = {
				"unit": unit,
				"cost_center": cost_center,
				"location_code": location_code,
				"financial_year": financial_year,
				"unit_description": unit_description,
				"cost_center_erp": cost_center_erp,
				"cost_center_description": cost_center_description,
				"location_code_erp": location_code_erp,
				"location_description": location_description,
				"state": state,
				"uploaded_by": uploaded_by,
			}

		type_of_expense_id = row[COL_TYPE_OF_EXPENSE_ID]
		months = {}
		for i, month in enumerate(MONTH_COLUMNS):
			val = row[COL_MONTH_START + i]
			try:
				months[month] = float(val) if val not in (None, "") else 0.0
			except (TypeError, ValueError):
				months[month] = None  # flagged as an error below

		def _s(value):
			return str(value).strip() if value not in (None, "") else None

		rows.append({
			"excel_row": excel_row_num,
			"unit": _s(unit),
			"cost_center": _s(cost_center),
			"location_code": _s(location_code),
			"financial_year": _s(financial_year),
			"type_of_expense_id": _s(type_of_expense_id),
			"months": months,
			# Parent (Finance Budget) display fields - purely descriptive,
			# never used for matching/writing (commit_budget_import's own
			# matching is still by the real doc-name identity fields above).
			"unit_description": _s(unit_description),
			"cost_center_erp": _s(cost_center_erp),
			"cost_center_description": _s(cost_center_description),
			"location_code_erp": _s(location_code_erp),
			"location_description": _s(location_description),
			"state": _s(state),
			"uploaded_by": _s(uploaded_by),
			# Child (Finance Budget Amounts) display fields.
			"head_of_expense": _s(row[COL_HEAD_OF_EXPENSE]),
			"sub_head_of_expense": _s(row[COL_SUB_HEAD_OF_EXPENSE]),
			"type_of_expense": _s(row[COL_TYPE_OF_EXPENSE]),
		})

	return rows


def _validate_rows(rows, user):
	"""Checks each row for missing identity fields, unknown Links, and
	(for a non-admin) access outside their own Finance user access mapping
	- returns (valid_rows, errors), errors being {excel_row, message}."""
	is_admin = is_finance_admin(user)
	allowed_units = None if is_admin else get_allowed_units(user)
	allowed_cost_centers = None if is_admin else get_allowed_cost_centers(user)
	allowed_locations = None if is_admin else get_allowed_location_codes(user)

	valid_rows = []
	errors = []

	for row in rows:
		missing = [
			f for f in ("unit", "cost_center", "location_code", "financial_year", "type_of_expense_id")
			if not row.get(f)
		]
		if missing:
			errors.append({"excel_row": row["excel_row"], "message": f"Missing required value(s): {', '.join(missing)}"})
			continue

		if None in row["months"].values():
			errors.append({"excel_row": row["excel_row"], "message": "One or more monthly amounts are not valid numbers"})
			continue

		if not frappe.db.exists("Unit", row["unit"]):
			errors.append({"excel_row": row["excel_row"], "message": f"Unknown Unit: {row['unit']}"})
			continue
		if not frappe.db.exists("Cost Center", row["cost_center"]):
			errors.append({"excel_row": row["excel_row"], "message": f"Unknown Cost Center: {row['cost_center']}"})
			continue
		if not frappe.db.exists("Location Code", row["location_code"]):
			errors.append({"excel_row": row["excel_row"], "message": f"Unknown Location Code: {row['location_code']}"})
			continue
		if not frappe.db.exists("Financial Year List", row["financial_year"]):
			errors.append({"excel_row": row["excel_row"], "message": f"Unknown Financial Year: {row['financial_year']}"})
			continue
		if not frappe.db.exists("Expenses", row["type_of_expense_id"]):
			errors.append({"excel_row": row["excel_row"], "message": f"Unknown Type of Expense: {row['type_of_expense_id']}"})
			continue

		if allowed_units is not None and row["unit"] not in allowed_units:
			errors.append({"excel_row": row["excel_row"], "message": f"You do not have access to unit {row['unit']}"})
			continue
		if allowed_cost_centers is not None and row["cost_center"] not in allowed_cost_centers:
			errors.append({"excel_row": row["excel_row"], "message": f"You do not have access to cost center {row['cost_center']}"})
			continue
		if allowed_locations is not None and row["location_code"] not in allowed_locations:
			errors.append({"excel_row": row["excel_row"], "message": f"You do not have access to location code {row['location_code']}"})
			continue

		valid_rows.append(row)

	return valid_rows, errors


def _row_total(months):
	return sum(months.values())


def _existing_finance_budget_keys(valid_rows):
	"""One batch query (not one-per-row) returning the set of (unit,
	cost_center, location_code, financial_year) keys among valid_rows that
	already have a matching Finance Budget - the same identity
	commit_budget_import itself groups/upserts by. Used to tag each row/group
	as a create ("new") or update ("existing") before any write happens, so
	preview_budget_import and commit_budget_import agree on the same
	new-vs-update classification shown to the user."""
	group_keys = {(r["unit"], r["cost_center"], r["location_code"], r["financial_year"]) for r in valid_rows}
	if not group_keys:
		return set()

	existing = frappe.get_all(
		"Finance Budget",
		filters={
			"set_id": ["in", list({k[0] for k in group_keys})],
			"cost_center": ["in", list({k[1] for k in group_keys})],
			"location_code": ["in", list({k[2] for k in group_keys})],
			"financial_year": ["in", list({k[3] for k in group_keys})],
		},
		fields=["set_id", "cost_center", "location_code", "financial_year"],
	)
	existing_keys = {(e.set_id, e.cost_center, e.location_code, e.financial_year) for e in existing}
	return group_keys & existing_keys


@frappe.whitelist()
def preview_budget_import(file_url):
	"""Parses and validates only - makes no changes. Returns a summary the
	frontend shows the user before they confirm."""
	user = frappe.session.user
	rows = _read_rows(file_url)
	valid_rows, errors = _validate_rows(rows, user)

	existing_keys = _existing_finance_budget_keys(valid_rows)

	to_create = 0
	to_update = 0
	for row in valid_rows:
		key = (row["unit"], row["cost_center"], row["location_code"], row["financial_year"])
		if key in existing_keys:
			row["import_type"] = "update"
			to_update += 1
		else:
			row["import_type"] = "new"
			to_create += 1

	return {
		"status": "success",
		"total_rows": len(rows),
		"valid_rows": len(valid_rows),
		"error_count": len(errors),
		"errors": errors,
		"finance_budgets_to_create": to_create,
		"finance_budgets_to_update": to_update,
		"total_amount": sum(_row_total(r["months"]) for r in valid_rows),
		"rows": valid_rows,
	}


def _parse_email_list(raw):
	if not raw:
		return []
	parts = raw.replace(",", "\n").splitlines()
	return [p.strip() for p in parts if p.strip()]


def _render_groups_table(group_results):
	"""Pre-rendered HTML fragment listing every Finance Budget parent
	group touched by this import, each tagged New/Updated - exposed as the
	{{ groups_table }} placeholder so an admin's own free-form email_body
	template can drop in this breakdown without having to hand-write a
	Jinja for-loop themselves in the Desk editor."""
	if not group_results:
		return ""
	rows_html = "".join(
		"<tr>"
		f"<td style='padding:4px 8px;border:1px solid #ddd;'>{'New' if g['import_type'] == 'new' else 'Updated'}</td>"
		f"<td style='padding:4px 8px;border:1px solid #ddd;'>{frappe.utils.escape_html(g['unit'])}</td>"
		f"<td style='padding:4px 8px;border:1px solid #ddd;'>{frappe.utils.escape_html(g['cost_center'])}</td>"
		f"<td style='padding:4px 8px;border:1px solid #ddd;'>{frappe.utils.escape_html(g['location_code'])}</td>"
		f"<td style='padding:4px 8px;border:1px solid #ddd;'>{frappe.utils.escape_html(g['financial_year'])}</td>"
		"</tr>"
		for g in group_results
	)
	return (
		"<table style='border-collapse:collapse;font-size:12px;'>"
		"<tr>"
		"<th style='padding:4px 8px;border:1px solid #ddd;text-align:left;'>Type</th>"
		"<th style='padding:4px 8px;border:1px solid #ddd;text-align:left;'>Unit</th>"
		"<th style='padding:4px 8px;border:1px solid #ddd;text-align:left;'>Cost Center</th>"
		"<th style='padding:4px 8px;border:1px solid #ddd;text-align:left;'>Location Code</th>"
		"<th style='padding:4px 8px;border:1px solid #ddd;text-align:left;'>Financial Year</th>"
		"</tr>" + rows_html + "</table>"
	)


def _send_import_confirmation_email(user, financial_years, created, updated, rows_imported, group_results=None):
	"""Fire-and-forget confirmation email for a just-completed budget import,
	per Budget Import Email Settings (a singleton, System Manager-configurable
	in Desk). Never raises - a notification failure must not undo or appear
	to undo an already-committed import, so any error here is logged and
	swallowed rather than surfaced to the caller."""
	try:
		settings = frappe.get_cached_doc("Budget Import Email Settings")
	except Exception:
		return

	if not settings.send_notification:
		return

	recipients = _parse_email_list(settings.cc_emails)

	if settings.notify_importing_user:
		user_email = frappe.db.get_value("User", user, "email") or user
		if user_email and user_email not in recipients:
			recipients.append(user_email)

	if not recipients:
		return

	context = {
		"uploaded_by": get_fullname(user),
		"uploaded_by_email": user,
		"financial_year": ", ".join(sorted(financial_years)) or "—",
		"finance_budgets_created": created,
		"finance_budgets_updated": updated,
		"rows_imported": rows_imported,
		"import_datetime": get_datetime_str(now_datetime()),
		"groups_table": _render_groups_table(group_results or []),
	}

	subject_template = settings.email_subject or "Budget Import Completed"
	body_template = settings.email_body or ""

	try:
		subject = frappe.render_template(subject_template, context)
		message = frappe.render_template(body_template, context)
		frappe.sendmail(recipients=recipients, subject=subject, message=message, now=True)
	except Exception:
		frappe.log_error("Budget Import Email Failed", frappe.get_traceback())


@frappe.whitelist()
def commit_budget_import(file_url):
	"""Re-parses file_url (never trusts a client-held copy of previously
	-previewed rows) and writes Finance Budget / Finance Budget Amounts.
	One Finance Budget parent per (unit, cost_center, location_code,
	financial_year) group - an existing parent is reused and updated in
	place (its budget_amounts child row for this type_of_expense_id is
	replaced, others left untouched); a new parent is created otherwise."""
	user = frappe.session.user
	rows = _read_rows(file_url)
	valid_rows, errors = _validate_rows(rows, user)

	if errors:
		return {
			"status": "failed",
			"error": "File still has validation errors - re-run preview and fix them before importing.",
			"errors": errors,
		}

	created = 0
	updated = 0
	groups = {}
	for row in valid_rows:
		key = (row["unit"], row["cost_center"], row["location_code"], row["financial_year"])
		groups.setdefault(key, []).append(row)

	# Per-group new-vs-update breakdown (not just the aggregate created/updated
	# counts) - shown in the Import Log and the confirmation email so a user
	# can see exactly which Unit/Cost Center/Location/Financial Year
	# combinations were newly created vs which existing ones were touched,
	# same classification preview_budget_import already showed before commit.
	group_results = []

	for (unit, cost_center, location_code, financial_year), group_rows in groups.items():
		existing_name = frappe.db.get_value(
			"Finance Budget",
			{
				"set_id": unit,
				"cost_center": cost_center,
				"location_code": location_code,
				"financial_year": financial_year,
			},
			"name",
		)

		if existing_name:
			doc = frappe.get_doc("Finance Budget", existing_name)
			updated += 1
			import_type = "update"
		else:
			doc = frappe.new_doc("Finance Budget")
			doc.set_id = unit
			doc.cost_center = cost_center
			doc.location_code = location_code
			doc.financial_year = financial_year
			created += 1
			import_type = "new"

		doc.uploaded_by = user

		existing_amounts_by_expense = {r.type_of_expense_id: r for r in (doc.budget_amounts or [])}

		for row in group_rows:
			months = row["months"]
			quarter_1 = months["april"] + months["may"] + months["june"]
			quarter_2 = months["july"] + months["august"] + months["september"]
			quarter_3 = months["october"] + months["november"] + months["december"]
			quarter_4 = months["january"] + months["february"] + months["march"]
			year_total = quarter_1 + quarter_2 + quarter_3 + quarter_4

			amount_row = existing_amounts_by_expense.get(row["type_of_expense_id"])
			if amount_row is None:
				amount_row = doc.append("budget_amounts", {})
				amount_row.type_of_expense_id = row["type_of_expense_id"]
				existing_amounts_by_expense[row["type_of_expense_id"]] = amount_row

			for month in MONTH_COLUMNS:
				amount_row.set(month, months[month])
			amount_row.quarter_1 = quarter_1
			amount_row.quarter_2 = quarter_2
			amount_row.quarter_3 = quarter_3
			amount_row.quarter_4 = quarter_4
			amount_row.year = year_total

		doc.total_budget = sum(r.year for r in doc.budget_amounts)

		doc.save(ignore_permissions=True)

		group_results.append({
			"unit": unit,
			"cost_center": cost_center,
			"location_code": location_code,
			"financial_year": financial_year,
			"import_type": import_type,
			"finance_budget": doc.name,
		})

	frappe.db.commit()

	financial_years = {row["financial_year"] for row in valid_rows}
	_send_import_confirmation_email(user, financial_years, created, updated, len(valid_rows), group_results)

	return {
		"status": "success",
		"finance_budgets_created": created,
		"finance_budgets_updated": updated,
		"rows_imported": len(valid_rows),
		"groups": group_results,
	}
