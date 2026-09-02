import frappe
import frappe.sessions

# The CSRF token below is per-session - if this page were cached (Frappe's
# default for website pages), the very first visitor's token would get
# baked into the cached HTML and served to every session afterward,
# defeating the whole point of a per-session token. frappe.www.desk sets
# the same flag for the same reason.
no_cache = 1


def get_context(context):
	"""The generic website boot data (frappe.website.utils.get_boot_data)
	deliberately excludes the CSRF token - it's a desk-only concern in
	Frappe core. But frappe-ui's frappeRequest sends every API call as a
	POST (regardless of the underlying method), which Frappe's CSRF check
	then validates against the session's saved token whenever one already
	exists - so a logged-in user opening this app without a matching
	X-Frappe-CSRF-Token header hits a CSRFTokenError. Adding it here is
	exactly what frappe.www.desk's own get_context does for the same reason.
	"""
	if context.boot is None:
		context.boot = {}
	context.boot["csrf_token"] = frappe.sessions.get_csrf_token()

	# `no_cache = 1` above only stops FRAPPE's own server-side render cache
	# from serving one session's rendered HTML (with ITS csrf_token/boot
	# data baked in) to a different session - it sends no browser-facing
	# HTTP header at all. Explicitly telling the browser/any proxy not to
	# store this response is a second, independent layer against the same
	# stale-session-HTML class of bug (on top of the app's own JS-side
	# pageshow/bfcache reload in main.js and the logout-time service worker
	# cache purge in data/session.js) - this one specifically guards a plain
	# HTTP/proxy cache replay, which neither of those two covers.
	frappe.local.response_headers["Cache-Control"] = "no-store, must-revalidate"
	return context
