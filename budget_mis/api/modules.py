"""Dynamic sidebar navigation for the Vue frontend: which modules (sidebar
sections) and which DocTypes within them a logged-in user should see,
driven entirely by the App Module Setting doctype rather than a hardcoded
nav list. Mirrors chw's App Module Setting / get_app_modules() pattern.
"""

import frappe
from frappe import _

from budget_mis.api.icons import valid_icon as _valid_icon


def _doctype_icon(doctype_name):
	"""A DocType's own `icon` meta field (set in Desk under DocType > Icon),
	when it's a plain Lucide name this app's frontend can actually render.
	Frappe's older built-in doctypes (User, Role, ...) set this using the
	legacy Font Awesome syntax (e.g. "fa fa-user") instead, which valid_icon
	also rejects - falls through to the existing item/module/default
	fallback chain instead of breaking the icon outright."""
	if not doctype_name:
		return None
	try:
		icon = frappe.get_meta(doctype_name).icon
	except Exception:
		return None
	return _valid_icon(icon)


def module_visible_to_user(module_doc, user_roles):
	"""An App Module Setting doc is visible if enabled and either
	role-restriction is off or its `roles` child table shares at least one
	role with the current user."""
	if not module_doc.enabled:
		return False
	if not module_doc.restrict_by_role:
		return True
	allowed_roles = {r.role for r in (module_doc.roles or [])}
	return bool(allowed_roles & user_roles)


def _direct_payload(module_doc):
	"""The single destination a non-sidebar module's own Home tile opens,
	in the same {type, ...} shape for all three direct_item_type options so
	the frontend can switch on `type` alone."""
	if module_doc.direct_item_type == "Page":
		if not module_doc.direct_page_route:
			return None
		return {"type": "Page", "page_route": module_doc.direct_page_route}
	if module_doc.direct_item_type == "DocType":
		if not module_doc.direct_doctype_name:
			return None
		return {
			"type": "DocType",
			"doctype_name": module_doc.direct_doctype_name,
			"route": module_doc.direct_route or frappe.scrub(module_doc.direct_doctype_name).replace("_", "-"),
		}
	if module_doc.direct_item_type == "URL":
		if not module_doc.direct_url:
			return None
		return {"type": "URL", "url": module_doc.direct_url}
	return None


@frappe.whitelist()
def get_app_modules():
	"""Return the Vue app's navigation modules (from the App Module Setting
	doctype), filtered to those enabled and visible to the current user's
	roles. A sidebar module (is_sidebar_module) lists the sidebar DocTypes
	it exposes; a direct module instead resolves to the single Page/DocType/
	URL destination its own Home tile opens."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Not permitted"), frappe.PermissionError)

	user_roles = set(frappe.get_roles())
	names = frappe.get_all("App Module Setting", pluck="name", order_by="sort_order asc")

	modules = []
	for name in names:
		module_doc = frappe.get_cached_doc("App Module Setting", name)
		if not module_visible_to_user(module_doc, user_roles):
			continue

		module_icon = _valid_icon(module_doc.icon)

		if not module_doc.is_sidebar_module:
			direct = _direct_payload(module_doc)
			if not direct:
				continue
			modules.append({
				"name": module_doc.name,
				"label": module_doc.label,
				"icon": module_icon or "file-text",
				"is_sidebar_module": False,
				"direct": direct,
			})
			continue

		doctypes = []
		for item in module_doc.doctypes or []:
			if item.item_type == "SPA Page":
				if not item.page_route:
					continue
				doctypes.append({
					"page_route": item.page_route,
					"label": item.label or item.page_route,
					"icon": _valid_icon(item.icon) or module_icon or "file-text",
				})
			elif item.doctype_name:
				doctypes.append({
					"doctype_name": item.doctype_name,
					"label": item.label or item.doctype_name,
					"icon": _valid_icon(item.icon) or _doctype_icon(item.doctype_name) or module_icon or "file-text",
					"route": item.route or frappe.scrub(item.doctype_name).replace("_", "-"),
				})
		if not doctypes:
			continue
		modules.append({
			"name": module_doc.name,
			"label": module_doc.label,
			"icon": module_icon or "file-text",
			"is_sidebar_module": True,
			"doctypes": doctypes,
		})
	return modules
