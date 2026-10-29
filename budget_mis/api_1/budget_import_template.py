"""Budget import template generation/download - serves both the legacy
"Budget Import Template" Desk Page
(budget_mis/main/page/import_template/import_template.js) and its Vue port
(frontend/src/pages/BudgetImportTemplate.vue). api_1's replacement for
budget_mis.api.export_reports's start_budget_template_generation /
generate_budget_template / download_generated_template.

The generation/download trio is a pure relocation, not a correctness fix: no
scoping, caching strategy, or behavior has changed from the original. The
per-user "is the file ready yet" flag still lives in frappe.cache() under
the same budget_template_{user} key (a 1-hour TTL, matching the long-running
enqueue job that writes it), and start_budget_template_generation still
enqueues generate_budget_template by its own dotted path - that string has
been updated to point here instead of budget_mis.api.export_reports.

is_import_template_admin is new (the legacy Desk JS re-checked "System
Manager" in frappe.get_roles() inline instead of calling a shared helper,
and never exposed the result to its own frontend at all - it only used it
server-side-equivalent, client-side, by comparing against hardcoded role
lists); the Vue page needs it as an explicit boolean to decide whether to
render the multi-user/admin view (global search, expand-all, one card per
user) or the single-user view, without re-deriving role logic in the
frontend.

has_import_template_linked is also new, fixing a real bug carried over from
the legacy page: its own pre-download check called frappe.client.get_value
on "Finance user access", a doctype whose only read permission is granted
to System Manager (confirmed via this doctype's own permissions) - so that
check throws frappe.PermissionError for every non-admin "Finance Unit
Coordinator" user, the exact audience the check exists for. This wrapper
reads the field the same way get_user_mappings/generate_budget_template
already do (frappe.get_doc, no permission check on the child doctype
itself), but still enforces that a non-admin can only ever ask about their
own user - the one thing frappe.client.get_value's blanket PermissionError
accidentally also prevented, so this keeps that boundary deliberately
instead of dropping it along with the bug.
"""

import frappe
import tempfile
import xlsxwriter
from frappe.utils import nowdate

from budget_mis.utils import is_finance_admin


@frappe.whitelist()
def is_import_template_admin():
	return bool(is_finance_admin())


@frappe.whitelist()
def has_import_template_linked(user=None):
	current_user = frappe.session.user
	user = user or current_user

	if user != current_user and not is_finance_admin(current_user):
		frappe.throw("You do not have access to this user's data.", frappe.PermissionError)

	doc_name = frappe.db.get_value("Finance user access", {"user": user}, "name")
	if not doc_name:
		return False

	import_template_id = frappe.db.get_value("Finance user access", doc_name, "import_template_id")
	return bool(import_template_id)


@frappe.whitelist()
def start_budget_template_generation(entity_data=None):

	user = frappe.session.user

	frappe.enqueue(
		"budget_mis.api_1.budget_import_template.generate_budget_template",
		queue="long",
		timeout=1800,
		user=user,
		entity_data=entity_data
	)

	return {"status": "started"}


def generate_budget_template(user=None, entity_data=None):

	user = user or frappe.session.user

	# ── Parse entity_data ─────────────────────────────────
	if entity_data and isinstance(entity_data, str):
		entity_data = frappe.parse_json(entity_data)

	if isinstance(entity_data, dict):
		entity_data = [entity_data]

	# ── Fetch Finance User Access ─────────────────────────
	doc_name = frappe.db.get_value(
		"Finance user access",
		{"user": user},
		"name"
	)

	access_doc = frappe.get_doc("Finance user access", doc_name) if doc_name else None

	if not access_doc:
		return

	allow_edit = access_doc.allow_edit_template or 0

	# ── Import Template ───────────────────────────────────
	import_template = frappe.get_doc(
		"Import Templates",
		access_doc.import_template_id
	)

	template_items = import_template.import_template_item_list

	financial_year = frappe.db.get_single_value(
		"Master Settings",
		"current_financial_year"
	)

	# ── Decide mappings source ─────────────────────────────
	if entity_data:
		mappings = entity_data
		use_dict = True
	else:
		mappings = access_doc.mapping
		use_dict = False

	# ── Helper ────────────────────────────────────────────
	def get_field(frontend_key, child_key, mapping):
		if use_dict:
			return mapping.get(frontend_key) or ""
		return getattr(mapping, child_key, "") or ""

	# ── Create Excel ──────────────────────────────────────
	tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")

	workbook  = xlsxwriter.Workbook(tmp.name)
	worksheet = workbook.add_worksheet("Finance Budget Import")

	header_format = workbook.add_format({"bold": True, "locked": True})

	if allow_edit:
		locked = workbook.add_format({"locked": False})
		unlocked = workbook.add_format({"locked": False, "num_format": "0.00"})
	else:
		locked = workbook.add_format({"locked": True})
		unlocked = workbook.add_format({"locked": False, "num_format": "0.00"})

	headers = [
		"Entity / Unit",
		"Entity / Unit Description",
		"Cost Center",
		"Cost Center(Original)",
		"Cost Center Description",
		"Location code",
		"Location code(Original)",
		"Location Description",
		"State",
		"Financial year",
		"Uploaded By",
		"Type of expense ID (Budget Amounts)",
		"Head of expense (Budget Amounts)",
		"Sub head of expense (Budget Amounts)",
		"Type of expense (Budget Amounts)",
		"April (Budget Amounts)",
		"May (Budget Amounts)",
		"June (Budget Amounts)",
		"July (Budget Amounts)",
		"August (Budget Amounts)",
		"September (Budget Amounts)",
		"October (Budget Amounts)",
		"November (Budget Amounts)",
		"December (Budget Amounts)",
		"January (Budget Amounts)",
		"February (Budget Amounts)",
		"March (Budget Amounts)",
		"Quarter 1 Total Amount (Budget Amounts)",
		"Quarter 2 Total Amount (Budget Amounts)",
		"Quarter 3 Total Amount (Budget Amounts)",
		"Quarter 4 Total Amount (Budget Amounts)",
		"Year Total Amount (Budget Amounts)"
	]

	col_widths = [len(h) for h in headers]

	for col, header in enumerate(headers):
		worksheet.write(0, col, header, header_format)

	worksheet.freeze_panes(1, 0)

	row_index = 1

	for mapping in mappings:

		first_row = True

		for item in template_items:

			if first_row:
				parent_values = [
					get_field("unit", "unit", mapping),
					get_field("unit_description", "unit_description", mapping),

					# ✅ FIXED COST CENTER
					get_field("cost_center_id", "cost_center", mapping),
					get_field("cost_center", "cost_center_erp", mapping),

					get_field("cost_center_description", "cost_center_description", mapping),

					# ✅ FIXED LOCATION
					get_field("location_code_id", "location_code", mapping),
					get_field("location_code", "location_code_erp", mapping),

					get_field("location_description", "location_description", mapping),
					get_field("state", "state", mapping),
					financial_year,
					user
				]
				first_row = False
			else:
				parent_values = [""] * 11

			row = parent_values + [
				item.type_of_expense_id,
				item.head_of_expense,
				item.sub_head_of_expense,
				item.type_of_expense
			]

			for col, val in enumerate(row):
				worksheet.write(row_index, col, val, locked)
				if val:
					col_widths[col] = max(col_widths[col], len(str(val)))

			# Editable monthly fields
			for col in range(15, 27):
				worksheet.write(row_index, col, 0, unlocked)

			r = row_index + 1
			worksheet.write_formula(row_index, 27, f"=SUM(P{r}:R{r})")
			worksheet.write_formula(row_index, 28, f"=SUM(S{r}:U{r})")
			worksheet.write_formula(row_index, 29, f"=SUM(V{r}:X{r})")
			worksheet.write_formula(row_index, 30, f"=SUM(Y{r}:AA{r})")
			worksheet.write_formula(row_index, 31, f"=SUM(AB{r}:AE{r})")

			row_index += 1

	if not allow_edit:
		worksheet.protect("[REDACTED-PASSWORD]")

	for i, width in enumerate(col_widths):
		worksheet.set_column(i, i, width + 3)

	workbook.close()

	frappe.cache().set_value(
		f"budget_template_{user}",
		tmp.name,
		expires_in_sec=3600
	)


@frappe.whitelist()
def download_generated_template():

	user = frappe.session.user

	path = frappe.cache().get_value(f"budget_template_{user}")

	if not path:
		return {"status": "processing"}

	with open(path, "rb") as f:
		frappe.response["filename"]    = f"Budget_mis_Import_{nowdate()}.xlsx"
		frappe.response["filecontent"] = f.read()
		frappe.response["type"]        = "download"
