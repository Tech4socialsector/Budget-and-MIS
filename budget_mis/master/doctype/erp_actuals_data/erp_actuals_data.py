# Copyright (c) 2026, Augustin Moses and contributors
# For license information, please see license.txt

from frappe.model.document import Document

from budget_mis.api.helper import format_financial_year

# April-start accounting period -> month name, matching the same convention
# used throughout budget_mis (e.g. budget_mis.startup's own helpers):
# accounting period 1 = April, ..., 12 = March.
_PERIOD_MONTH_NAMES = {
	1: "April", 2: "May", 3: "June", 4: "July", 5: "August", 6: "September",
	7: "October", 8: "November", 9: "December", 10: "January", 11: "February", 12: "March",
}


class ERPActualsData(Document):
	def before_insert(self):
		self._set_computed_fields()

	def validate(self):
		self._set_computed_fields()

	def _set_computed_fields(self):
		self.period_key = f"{int(self.fiscal_year)}-{int(self.accounting_period):02d}"
		month_name = _PERIOD_MONTH_NAMES.get(int(self.accounting_period), "")
		# fiscal_year here is the ERP's own raw calendar-year value (e.g.
		# 2026) - format_financial_year turns that into this app's own
		# "2026-27" financial-year string, matching every other period
		# label shown elsewhere in the app.
		self.period_label = f"{month_name} {format_financial_year(self.fiscal_year)}".strip()
