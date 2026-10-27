# Copyright (c) 2026, Augustin Moses and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

from budget_mis.api.icons import ICON_ALIASES, VALID_LUCIDE_ICONS


class AppModuleDocTypeItem(Document):
	def validate(self):
		if not self.icon or self.icon in VALID_LUCIDE_ICONS:
			return
		suggestion = ICON_ALIASES.get(self.icon)
		if suggestion:
			frappe.throw(
				_("\"{0}\" isn't a Lucide icon this app can render - did you mean \"{1}\"?").format(
					self.icon, suggestion
				)
			)
		frappe.throw(_("\"{0}\" isn't a Lucide icon this app can render. Pick a different one from the icon picker.").format(self.icon))
