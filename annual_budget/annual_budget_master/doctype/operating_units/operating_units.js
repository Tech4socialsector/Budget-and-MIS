// Copyright (c) 2025, Augustin Moses and contributors
// For license information, please see license.txt

frappe.ui.form.on("Operating Units", {
	refresh(frm) {

	},
        units: function (frm) {
        console.log("class_days changed:", frm.doc.units);
     
        let selected_item = (frm.doc.units || []).map(row => row.unit);
        console.log("Selected days array:", selected_item);
        // let class_days_string = selected_days.join(", ");
        // frm.set_value("class_day", class_days_string);
    },
});
