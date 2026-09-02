frappe.query_reports["Consolidated Budget Unit"] = {
    onload: function (report) {
        // Optional: Auto-fill the Financial Year from Master Settings
        frappe.db.get_single_value("Master Settings", "current_financial_year").then((fy) => {
            if (fy) {
                report.set_filter_value("financial_year", fy);
            }
        });

        // Watch for Unit filter change
        report.page.fields_dict.set_id.df.onchange = () => {
            const selected_units = report.get_values().set_id || [];

            // Clear dependent field when Units change
            report.set_filter_value("cost_center", []);

            // Update cost center filter dynamically
            report.page.fields_dict.cost_center.df.get_data = function (txt) {
                if (selected_units.length) {
                    return frappe.db.get_link_options("Cost Center", txt, {
                        set_id: ["in", selected_units],
                    });
                } else {
                    return frappe.db.get_link_options("Cost Center", txt);
                }
            };

            report.page.fields_dict.cost_center.refresh();
        };
    },

    filters: [
        {
            fieldname: "financial_year",
            label: "Financial Year",
            fieldtype: "Link",
            options: "Financial year list",
            reqd: 1,
            default: get_default_financial_year,
        },
        {
            fieldname: "set_id",
            label: "Entity / Unit",
            fieldtype: "MultiSelectList",
            options: "Unit",
            get_data: function (txt) {
                return frappe.db.get_link_options("Unit", txt);
            },
        },
        {
            fieldname: "cost_center",
            label: "Cost Center",
            fieldtype: "MultiSelectList",
            options: "Cost Center",
            get_data: function (txt) {
                return frappe.db.get_link_options("Cost Center", txt);
            },
        },
    ],
};

function get_default_financial_year() {
    return frappe.db
        .get_single_value("Master Settings", "current_financial_year")
        .then((fy) => {
            if (fy) return fy;
        });
}
