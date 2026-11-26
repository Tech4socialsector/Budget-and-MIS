# Copyright (c) 2026, Augustin Moses and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime, add_to_date

from annual_budget.api.response_crypto import DEFAULT_TESTING_MODE_MAX_MINUTES


class ERPCredentials(Document):
	def before_save(self):
		previous_value = frappe.db.get_single_value("ERP Credentials", "testing_mode")

		if self.testing_mode and not previous_value:
			self.testing_mode_enabled_at = now_datetime()
		elif not self.testing_mode:
			self.testing_mode_enabled_at = None
			self.testing_mode_expires_at = None

		if self.testing_mode and self.testing_mode_enabled_at:
			duration = self.testing_mode_duration_minutes or DEFAULT_TESTING_MODE_MAX_MINUTES
			self.testing_mode_expires_at = add_to_date(self.testing_mode_enabled_at, minutes=duration)
