// Copyright (c) 2025, Augustin Moses and contributors
// For license information, please see license.txt

frappe.ui.form.on("Master Settings", {
	refresh(frm) {
		frm.add_custom_button(__("Test AI Connection"), () => {
			frappe.call({
				method: "budget_mis.ai.assistant.test_connection",
				args: {
					base_url: frm.doc.ai_api_base_url,
					model: frm.doc.ai_model,
					api_key: frm.doc.ai_api_key,
				},
				freeze: true,
				freeze_message: __("Testing connection..."),
				callback: (r) => {
					const result = r.message || {};
					if (result.ok) {
						frappe.msgprint({
							title: __("Connection Successful"),
							indicator: "green",
							message: result.message,
						});
					} else {
						frappe.msgprint({
							title: __("Connection Failed"),
							indicator: "red",
							message: result.message,
						});
					}
				},
			});
		}).addClass("btn-primary");
	},
});
