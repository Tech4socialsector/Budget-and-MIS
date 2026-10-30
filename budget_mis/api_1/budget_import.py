"""Upload side of Budget Import Template (frontend/src/pages/BudgetImportUpload.vue)
- parses a filled-in .xlsx (the exact shape budget_mis.api_1.budget_import_template
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
COL_COST_CENTER = 2
COL_LOCATION_CODE = 5
COL_FINANCIAL_YEAR = 9
COL_TYPE_OF_EXPENSE_ID = 11
COL_MONTH_START = 15  # April .. March = columns 15-26 inclusive


def _read_rows(file_url):
	file_doc = frappe.get_doc("File", {"file_url": file_url})
	content = file_doc.get_content()

	import io
	workbook = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
	worksheet = workbook.worksheets[0]

	rows = []
	group = None  # last non-blank (unit, cost_center, location_code, financial_year)

	for excel_row_num, row in enumerate(worksheet.iter_rows(min_row=2, values_only=True), start=2):
		if row is None or all(v in (None, "") for v in row):
			continue

		unit = row[COL_UNIT] or (group["unit"] if group else None)
		cost_center = row[COL_COST_CENTER] or (group["cost_center"] if group else None)
		location_code = row[COL_LOCATION_CODE] or (group["location_code"] if group else None)
		financial_year = row[COL_FINANCIAL_YEAR] or (group["financial_year"] if group else None)

		if row[COL_UNIT]:
			group = {
				"unit": unit,
				"cost_center": cost_center,
				"location_code": location_code,
				"financial_year": financial_year,
			}

		type_of_expense_id = row[COL_TYPE_OF_EXPENSE_ID]
		months = {}
		for i, month in enumerate(MONTH_COLUMNS):
			val = row[COL_MONTH_START + i]
			try:
				months[month] = float(val) if val not in (None, "") else 0.0
			except (TypeError, ValueError):
				months[month] = None  # flagged as an error below

		rows.append({
			"excel_row": excel_row_num,
			"unit": str(unit).strip() if unit else None,
			"cost_center": str(cost_center).strip() if cost_center else None,
			"location_code": str(location_code).strip() if location_code else None,
			"financial_year": str(financial_year).strip() if financial_year else None,
			"type_of_expense_id": str(type_of_expense_id).strip() if type_of_expense_id else None,
			"months": months,
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


@frappe.whitelist()
def preview_budget_import(file_url):
	"""Parses and validates only - makes no changes. Returns a summary the
	frontend shows the user before they confirm."""
	user = frappe.session.user
	rows = _read_rows(file_url)
	valid_rows, errors = _validate_rows(rows, user)

	to_create = 0
	to_update = 0
	for row in valid_rows:
		existing = frappe.db.get_value(
			"Finance Budget",
			{
				"set_id": row["unit"],
				"cost_center": row["cost_center"],
				"location_code": row["location_code"],
				"financial_year": row["financial_year"],
			},
			"name",
		)
		if existing:
			to_update += 1
		else:
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
		else:
			doc = frappe.new_doc("Finance Budget")
			doc.set_id = unit
			doc.cost_center = cost_center
			doc.location_code = location_code
			doc.financial_year = financial_year
			created += 1

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

	frappe.db.commit()

	return {
		"status": "success",
		"finance_budgets_created": created,
		"finance_budgets_updated": updated,
		"rows_imported": len(valid_rows),
	}
