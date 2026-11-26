"""Public branding info (app title/logo) for the Vue frontend's login page
and browser tab, which render before a user is authenticated. Deliberately
its own guest-allowed endpoint, separate from Master Settings' other
fields (financial year, AI assistant config/keys), none of which should
ever be readable by a guest.
"""

import frappe


@frappe.whitelist(allow_guest=True)
def get_app_branding():
	settings = frappe.get_single("Master Settings")
	return {
		"app_title": settings.app_title or "Annual Budget MIS",
		"app_logo": _guest_visible_logo(settings.app_logo),
	}


def _guest_visible_logo(app_logo):
	"""A guest browsing the login page can only ever fetch a public file
	URL - if app_logo was uploaded as a private attachment (the Attach
	Image field's default unless "Is Private" is unchecked), returning it
	here just hands the frontend a URL that 403s. None is safer: the
	frontend already falls back to its own bundled default logo."""
	if not app_logo:
		return None
	if app_logo.startswith("/private/"):
		return None
	return app_logo


@frappe.whitelist()
def get_app_config():
	"""Settings that need a logged-in session but are still safe for every
	user to read (unlike the AI provider's base URL/model/key) - kept apart
	from get_app_branding so a guest can never reach this."""
	settings = frappe.get_single("Master Settings")
	return {
		"helpdesk_url": settings.helpdesk_url or None,
		# Only System Manager (the doctype's one write role) can actually
		# save Master Settings - frappe.has_permission is the real,
		# per-user check (unlike the doctype meta's permissions array,
		# which just lists every role a rule exists for, not whether this
		# user holds one), so the frontend can safely gate the settings
		# panel on this instead of hardcoding a role name.
		"can_manage_settings": frappe.has_permission("Master Settings", "write"),
	}
