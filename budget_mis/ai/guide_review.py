"""Admin review endpoints for AI-proposed guide points (see
ai/tools.py's propose_guide_point) - list every pending suggestion across
all AI Assistant Guide sections, and approve/reject one.

Approving a point only ever flips its own status field to Approved - it
never changes is_active, so a suggestion proposed under an Inactive section
(see propose_guide_point's own PROPOSED_GUIDE_SECTION_TITLE default) still
needs an admin to separately activate that section before any of its
approved points reach the live prompt. This is intentional: approving a
suggestion's CONTENT and deciding to switch a whole section live are two
different judgment calls, and conflating them would let one approval
accidentally activate every other point already sitting (inactive) in the
same section.
"""

import frappe
from frappe import _


def _require_guide_write_permission():
	if not frappe.has_permission("AI Assistant Guide", "write"):
		frappe.throw(_("You do not have permission to review AI assistant suggestions"), frappe.PermissionError)


@frappe.whitelist()
def list_pending_guide_suggestions():
	_require_guide_write_permission()
	rows = frappe.get_all(
		"AI Assistant Guide Point",
		filters={"status": "Pending"},
		fields=["name", "parent", "point", "proposed_by", "proposed_reason", "creation"],
		order_by="creation desc",
	)
	parent_titles = {
		d.name: d.title
		for d in frappe.get_all("AI Assistant Guide", filters={"name": ["in", [r.parent for r in rows]]}, fields=["name", "title"])
	} if rows else {}
	for row in rows:
		row["section_title"] = parent_titles.get(row["parent"], row["parent"])
	return rows


@frappe.whitelist()
def approve_guide_suggestion(parent, row_name):
	_require_guide_write_permission()
	doc = frappe.get_doc("AI Assistant Guide", parent)
	point_row = next((p for p in doc.points if p.name == row_name), None)
	if not point_row:
		frappe.throw(_("That suggestion no longer exists."))
	point_row.status = "Approved"
	doc.save()
	frappe.cache().delete_value("budget_mis_ai_assistant_guide")
	return {"status": "approved"}


@frappe.whitelist()
def reject_guide_suggestion(parent, row_name):
	_require_guide_write_permission()
	doc = frappe.get_doc("AI Assistant Guide", parent)
	point_row = next((p for p in doc.points if p.name == row_name), None)
	if not point_row:
		frappe.throw(_("That suggestion no longer exists."))
	point_row.status = "Rejected"
	point_row.is_active = 0
	doc.save()
	frappe.cache().delete_value("budget_mis_ai_assistant_guide")
	return {"status": "rejected"}
