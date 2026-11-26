"""Dynamic sidebar navigation for the Vue frontend: which modules (sidebar
sections) and which DocTypes within them a logged-in user should see,
driven entirely by the App Module Setting doctype rather than a hardcoded
nav list. Mirrors chw's App Module Setting / get_app_modules() pattern.
"""

import frappe
from frappe import _


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


@frappe.whitelist()
def get_app_modules():
	"""Return the Vue app's navigation modules (from the App Module Setting
	doctype), filtered to those enabled and visible to the current user's
	roles. Each module lists the sidebar DocTypes it exposes."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Not permitted"), frappe.PermissionError)

	user_roles = set(frappe.get_roles())
	names = frappe.get_all("App Module Setting", pluck="name", order_by="sort_order asc")

	modules = []
	for name in names:
		module_doc = frappe.get_cached_doc("App Module Setting", name)
		if not module_visible_to_user(module_doc, user_roles):
			continue
		doctypes = []
		for item in module_doc.doctypes or []:
			if item.item_type == "SPA Page":
				if not item.page_route:
					continue
				doctypes.append({
					"page_route": item.page_route,
					"label": item.label or item.page_route,
					"icon": item.icon or module_doc.icon or "file-text",
				})
			elif item.doctype_name:
				doctypes.append({
					"doctype_name": item.doctype_name,
					"label": item.label or item.doctype_name,
					"icon": item.icon or module_doc.icon or "file-text",
					"route": item.route or frappe.scrub(item.doctype_name).replace("_", "-"),
				})
		if not doctypes:
			continue
		modules.append({
			"label": module_doc.label,
			"icon": module_doc.icon or "file-text",
			"doctypes": doctypes,
		})
	return modules
