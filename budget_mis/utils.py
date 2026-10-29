import functools

import frappe

from budget_mis.api.response_crypto import require_login, encrypted_response_if_direct_call, is_direct_http_call


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


def _get_allowed_values(user, field):
	"""Shared walk of the current user's Finance user access mapping rows,
	collecting one field's values (cost_center/location_code) - same
	fetch-once-per-call shape as get_allowed_units, just generalized so
	get_allowed_cost_centers/get_allowed_location_codes below don't each
	re-walk the same doc rows with their own copy of this loop (the
	previous api/filter_options.py functions each did exactly that, inline,
	6 separate times)."""
	user = user or frappe.session.user
	if is_finance_admin(user):
		return None

	finance_docs = frappe.get_all("Finance user access", filters={"user": user}, fields=["name"])

	allowed = set()
	for finance in finance_docs:
		doc = frappe.get_doc("Finance user access", finance.name)
		for row in doc.mapping:
			value = getattr(row, field, None)
			if value:
				allowed.add(value)

	return allowed


def get_allowed_cost_centers(user=None):
	"""Cost Center doc names the given user may access via their Finance
	user access mapping. Returns None for admins (unscoped), same
	convention as get_allowed_units."""
	return _get_allowed_values(user, "cost_center")


def get_allowed_location_codes(user=None):
	"""Location Code doc names the given user may access via their Finance
	user access mapping. Returns None for admins (unscoped), same
	convention as get_allowed_units."""
	return _get_allowed_values(user, "location_code")


def get_allowed_cost_centers_erp(user=None):
	"""ERP cost-center codes (Finance user access mapping row's own
	cost_center_erp, a fetch_from snapshot of the linked Cost Center doc's
	ERP code) the given user may access. Returns None for admins (unscoped).
	Needed alongside get_allowed_cost_centers because a mapping row's
	reference_for can be "Actual"-only, in which case resolve_grouped_units
	only ever carries the ERP-code form (cost_centers_erp), never the doc
	-name form (cost_centers) - scoping actuals-side data against doc names
	would silently miss those rows."""
	return _get_allowed_values(user, "cost_center_erp")


def get_allowed_location_codes_erp(user=None):
	"""ERP location codes (Finance user access mapping row's own
	location_code_erp) the given user may access. Returns None for admins
	(unscoped). See get_allowed_cost_centers_erp's docstring for why this
	ERP-code-keyed sibling of get_allowed_location_codes is needed."""
	return _get_allowed_values(user, "location_code_erp")


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
