import frappe

from annual_budget.api.response_crypto import _testing_mode_expired


def expire_testing_mode():
	"""Scheduled hourly: turn off ERP Credentials.testing_mode once it has
	been on longer than its configured testing_mode_duration_minutes, so it
	can't be left on indefinitely by accident."""
	doc = frappe.get_single("ERP Credentials")
	if doc.testing_mode and _testing_mode_expired(doc):
		doc.testing_mode = 0
		doc.testing_mode_enabled_at = None
		doc.save(ignore_permissions=True)
		frappe.db.commit()
