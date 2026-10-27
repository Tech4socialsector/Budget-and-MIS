# Copyright (c) 2026, Augustin Moses and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

from budget_mis.api.icons import ICON_ALIASES, VALID_LUCIDE_ICONS


class AppModuleSetting(Document):
	def validate(self):
		if not self.icon:
			return
		# Desk's own Icon picker offers icons from non-Lucide sets that look
		# similar but won't render in the app (see api/icons.py) - rejecting
		# outright here rather than silently aliasing at read time, so a
		# mistaken pick is caught immediately instead of only showing up as
		# a blank icon on Home later.
		if self.icon in VALID_LUCIDE_ICONS:
			return
		suggestion = ICON_ALIASES.get(self.icon)
		if suggestion:
			frappe.throw(
				_("\"{0}\" isn't a Lucide icon this app can render - did you mean \"{1}\"?").format(
					self.icon, suggestion
				)
			)
		frappe.throw(_("\"{0}\" isn't a Lucide icon this app can render. Pick a different one from the icon picker.").format(self.icon))
