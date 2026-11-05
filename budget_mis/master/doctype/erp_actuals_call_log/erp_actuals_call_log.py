# Copyright (c) 2026, Augustin Moses and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ERPActualsCallLog(Document):
	pass


# Single entry point every caller (get_actuals_from_erp_month_wise, the
# aggregations built on top of it, and startup.py's warm_actuals_cache) goes
# through to record a call - a plain frappe.get_doc(...).insert() wrapped in
# its own try/except so a logging failure (e.g. a DB hiccup) can never take
# down the real actuals call it's describing. ignore_permissions=True since
# this fires from background jobs and guest-reachable whitelisted endpoints
# alike, neither of which has Create rights on this System-Manager-only
# doctype otherwise.
def log_call(
	call_type,
	fiscal_year=None,
	accounting_period=None,
	cache_result=None,
	status="Success",
	duration_ms=None,
	source=None,
	modules=None,
	error_message=None,
):
	try:
		frappe.get_doc({
			"doctype": "ERP Actuals Call Log",
			"call_type": call_type,
			"fiscal_year": fiscal_year,
			"accounting_period": accounting_period,
			"cache_result": cache_result,
			"status": status,
			"duration_ms": duration_ms,
			"source": source,
			"modules": modules,
			"triggered_by": frappe.session.user,
			"error_message": error_message,
		}).insert(ignore_permissions=True)
	except Exception:
		frappe.log_error(title="ERP Actuals Call Log insert failed", message=frappe.get_traceback())
