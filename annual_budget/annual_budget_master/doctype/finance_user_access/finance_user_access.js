// Copyright (c) 2025, Augustin Moses and contributors
// For license information, please see license.txt

frappe.ui.form.on("Finance user access", {
    import_template_id: function(frm) {
        if (frm.doc.import_template_id) {
            frm.clear_table('useraccess_child_table');  
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Import Templates",
                    name: frm.doc.import_template_id
                },
                callback: function(r) {
                    if (r.message) {
                        let template = r.message;
                        template.import_template_item_list.forEach(function(row) {
                            let child = frm.add_child('use_template_item_list'); 
                            child.type_of_expense_id = row.type_of_expense_id;
                            child.sequence_id = row.sequence_id;  
                            child.type_of_expense = row.type_of_expense;
                            child.sub_head_of_expense = row.sub_head_of_expense;
                            child.head_of_expense = row.head_of_expense;
                            child.actuals_type_of_expenses=row.actuals_type_of_expenses
                        });
                        frm.refresh_field('use_template_item_list');
                    }
                }
            });
        }
    }

});
