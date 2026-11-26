// Copyright (c) 2026, Augustin Moses and contributors
// For license information, please see license.txt

frappe.ui.form.on("ERP Data", {
	refresh(frm) {
		if (frm.is_new()) return;

		frm.add_custom_button(__("Sync Now"), () => {
			frappe.call({
				method: "budget_mis.api.erp_data_backfill.sync_now",
				args: {
					fiscal_year: frm.doc.fiscal_year,
					accounting_period: frm.doc.accounting_period,
					data_type: frm.doc.data_type,
				},
				// A real PeopleSoft fetch can take up to ~120s in the
				// documented worst case - freeze the form so a second
				// click on THIS tab can't fire a second concurrent fetch
				// while this one is still running. The server side also
				// takes a shared lock against the scheduled sync job and
				// any OTHER tab/user's own manual sync
				// (erp_data_backfill.sync_now) - this freeze is a UX
				// nicety on top of that, not the only thing preventing a
				// collision.
				freeze: true,
				freeze_message: __("Fetching from ERP - this can take up to a couple of minutes..."),
				callback: (r) => {
					const result = r.message || {};
					frm.reload_doc();
					if (result.ok) {
						frappe.show_alert({
							message: __("Synced successfully - {0} rows", [result.row_count]),
							indicator: "green",
						});
					} else {
						frappe.msgprint({
							title: __("Sync Failed"),
							indicator: "red",
							message: __(
								"The ERP fetch failed - see this record's Status and the ERP Actuals Call Log for details."
							),
						});
					}
				},
			});
		}).addClass("btn-primary");
	},
});
