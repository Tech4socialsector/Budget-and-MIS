import functools

import frappe

from annual_budget.api.response_crypto import require_login, encrypted_response_if_direct_call, is_direct_http_call


def guest_api(func):
	"""Whitelist a method for guest access, gated by testing_mode, with its
	response AES-GCM encrypted outside of testing_mode.

	Replaces `@frappe.whitelist(allow_guest=True)` for endpoints that were
	opened up for testing/local development. The endpoint is always
	registered with allow_guest so Frappe dispatches the request to it;
	require_login() then rejects guest callers unless testing_mode is on
	(checked per-request, so toggling the checkbox takes effect immediately).

	Many of these endpoints call each other directly as plain Python
	functions (not via HTTP), so encryption only applies when this call is
	the actual HTTP dispatch (encrypted_response_if_direct_call) — otherwise
	an internal caller would receive an encrypted envelope instead of the
	real data it expects to read.
	"""
	@functools.wraps(func)
	def wrapper(*args, **kwargs):
		require_login()
		return func(*args, **kwargs)

	return frappe.whitelist(allow_guest=True)(encrypted_response_if_direct_call(wrapper))


def get_peoplesoft_uat_credentials():
	"""Return (user_name, password) for the PeopleSoft UAT endpoints.

	Not currently called anywhere - every actuals fetch in
	annual_budget/api/actuals.py is consolidated onto a single PROD path
	(get_actuals_from_erp_month_wise, via get_peoplesoft_prod_credentials).
	Kept only because the ERP Credentials doctype still has UAT fields for
	admins to fill in if a UAT-backed path is ever reintroduced."""
	doc = frappe.get_single("ERP Credentials")
	return doc.peoplesoft_erp_user_name_uat, doc.get_password("peoplesoft_erp_password_uat")


def get_peoplesoft_prod_credentials():
	"""Return (user_name, password) for the PeopleSoft production endpoints."""
	doc = frappe.get_single("ERP Credentials")
	return doc.peoplesoft_erp_user_name_prod, doc.get_password("peoplesoft_erp_password_prod")


def is_finance_admin(user=None):
	"""Whether user (default: current session user) sees all units unscoped."""
	roles = frappe.get_roles(user or frappe.session.user)
	return "System Manager" in roles or "Finance MIS Admin" in roles


def get_allowed_units(user=None):
	"""Units the given user (default: current session user) may access via
	their Finance user access mapping. Returns None for admins, meaning
	"no restriction" — callers should treat None as unscoped access."""
	user = user or frappe.session.user
	if is_finance_admin(user):
		return None

	finance_docs = frappe.get_all("Finance user access", filters={"user": user}, fields=["name"])

	allowed_units = set()
	for finance in finance_docs:
		doc = frappe.get_doc("Finance user access", finance.name)
		for row in doc.mapping:
			if row.unit:
				allowed_units.add(row.unit)

	return allowed_units


def require_unit_access(units):
	"""Throw a PermissionError unless the current user is allowed to see
	every unit in `units` (a string, comma-separated string, or iterable of
	unit names). No-ops for admins and when `units` is empty."""
	if not units:
		return

	if isinstance(units, str):
		requested = {u.strip() for u in units.split(",") if u.strip()}
	else:
		requested = {str(u).strip() for u in units if u}

	if not requested:
		return

	allowed = get_allowed_units()
	if allowed is None:
		return

	if not requested.issubset(allowed):
		frappe.throw(
			"You do not have access to one or more of the requested units.",
			frappe.PermissionError,
			title="Not Permitted",
		)
