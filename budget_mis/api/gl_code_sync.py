import xml.etree.ElementTree as ET

import frappe
import requests

from budget_mis.api.helper import get_peoplesoft_prod_credentials

# GL Account Masters - the full chart of accounts PeopleSoft knows about
# (SETID/ACCOUNT/EFFDT/EFF_STATUS/DESCR/DESCRSHORT per row), confirmed via
# a real live call to carry 672 unique ACCOUNT values, no duplicates. This
# is a reference/master list, NOT period-scoped actuals or trial balance
# data, so unlike erp_actuals.py's own ERP calls it is never stored in ERP
# Data and has no "stale after N minutes" concept - a System Manager syncs
# it on demand (via the Expenses Line Items list view's own "Fetch Missing
# GL Codes" button, Fetch Missing Expenses Line Items below) whenever they
# know PeopleSoft has added new accounts, not on a recurring schedule.
_GL_ACCOUNT_MASTERS_URL = (
	"https://pserp.azimpremjifoundation.org:8053/"
	"PSIGW/RESTListeningConnector/"
	"PSFT_EP/ExecuteQuery.v1/PUBLIC/"
	"Z_MIS_ACCOUNT/XMLP/NONFILE"
	"?isconnectedquery=N&maxrows=10000"
)


def _fetch_gl_account_masters_raw():
	username, password = get_peoplesoft_prod_credentials()
	if not username or not password:
		frappe.throw("ERP credentials are not configured")

	response = requests.get(
		_GL_ACCOUNT_MASTERS_URL,
		headers={"Accept": "application/xml"},
		auth=(username, password),
		timeout=90,
	)
	response.raise_for_status()

	root = ET.fromstring(response.content)
	rows = []
	for row_elem in root.iter():
		if row_elem.tag.lower().endswith("row"):
			rows.append({
				child.tag.split("}")[-1].lower(): child.text
				for child in row_elem
			})
	return rows


# Fetches the full live GL Account Masters list from PeopleSoft, diffs it
# against every Expenses Line Items record that already exists (by name,
# which this app's own convention always sets equal to the raw GL code -
# e.g. "80004"), and creates ONE NEW record per account the feed has that
# this doctype doesn't yet - name/gl_code set to the account code,
# type_of_expense set to the feed's own DESCR (its only descriptive field),
# head_of_expense/sub_head_of_expense left blank since PeopleSoft's own
# feed carries no such business categorization - a human still needs to
# classify a brand-new GL code into a head/sub-head afterward in Desk.
# Never touches an EXISTING record (no overwrite of gl_code/type_of_expense
# /head_of_expense/sub_head_of_expense on a match) - this is purely an
# add-what's-missing sync, confirmed as the explicit requirement (no
# duplicates, no clobbering of already-classified codes).
@frappe.whitelist()
def sync_missing_expenses_line_items():
	if "System Manager" not in frappe.get_roles():
		frappe.throw(
			"Only a System Manager can sync GL Account Masters.",
			frappe.PermissionError,
		)

	rows = _fetch_gl_account_masters_raw()
	existing = set(frappe.get_all("Expenses Line Items", pluck="name"))

	created = []
	for row in rows:
		account = (row.get("account") or "").strip()
		if not account or account in existing:
			continue
		doc = frappe.new_doc("Expenses Line Items")
		doc.name = account
		doc.gl_code = account
		doc.type_of_expense = row.get("descr") or ""
		doc.insert(ignore_permissions=True)
		existing.add(account)
		created.append(account)

	frappe.db.commit()
	return {
		"fetched": len(rows),
		"already_existing": len(rows) - len(created),
		"created": created,
		"created_count": len(created),
	}
