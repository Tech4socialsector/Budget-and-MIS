// Copyright (c) 2026, Augustin Moses and contributors
// For license information, please see license.txt

frappe.listview_settings["Expenses Line Items"] = {
	onload(listview) {
		listview.page.add_inner_button(__("Fetch Missing GL Codes"), () => {
			frappe.call({
				method: "budget_mis.api.gl_code_sync.sync_missing_expenses_line_items",
				// A real PeopleSoft fetch of the full GL Account Masters list
				// is a single, already-bounded call (not a multi-period loop
				// the way erp_data_backfill's own fetches are), but still a
				// live HTTP round trip - freeze the list so a second click
				// can't fire a second concurrent fetch while this one is
				// still running.
				freeze: true,
				freeze_message: __("Fetching GL Account Masters from ERP..."),
				callback: (r) => {
					const result = r.message || {};
					listview.refresh();
					if (result.created_count) {
						frappe.show_alert({
							message: __("Added {0} new GL code(s) - {1}", [
								result.created_count,
								result.created.join(", "),
							]),
							indicator: "green",
						});
					} else {
						frappe.show_alert({
							message: __("No new GL codes found - {0} already up to date", [
								result.already_existing,
							]),
							indicator: "blue",
						});
					}
				},
			});
		}, null, "primary");
	},
};
