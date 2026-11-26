// // Copyright (c) 2025, Augustin Moses and contributors
// // For license information, please see license.txt
// frappe.ui.form.on('Finance Budget', {
//       refresh: function(frm) {
//         //  if (frappe.user.has_role("Finance Field Offecier")) {
//         //     frm.fields_dict.set_id.df.read_only = 1;
//         //     frm.refresh_field("set_id");
//         //     frm.fields_dict.cost_center.df.read_only = 1;
//         //     frm.refresh_field("cost_center");
//         //     frm.fields_dict.location_code.df.read_only = 1;
//         //     frm.refresh_field("location_code");
            
//         // }
//         if (frm.doc.set_id) {
//             frm.fields_dict['cost_center'].get_query = function() {
//                 return {
//                     filters: {
//                         set_id: frm.doc.set_id
//                     }
//                 };
//             };

//             frm.fields_dict['location_code'].get_query = function() {
//                 return {
//                     filters: {
//                         unit: frm.doc.set_id
//                     }
//                 };
//             };

//             frm.refresh_field('cost_center');
//             frm.refresh_field('location_code');
//         }
       
//     },

//     set_id: function(frm) {
//         frm.set_value('cost_center', '');
//         frm.set_value('location_code', '');
//         if (frm.doc.set_id) {
//             frm.fields_dict['cost_center'].get_query = function() {
//                 return {
//                     filters: {
//                         set_id: frm.doc.set_id
//                     }
//                 };
//             };

//             frm.fields_dict['location_code'].get_query = function() {
//                 return {
//                     filters: {
//                         unit: frm.doc.set_id
//                     }
//                 };
//             };
//             frm.refresh_field('cost_center');
//             frm.refresh_field('location_code');
//         }
//     },
// });

// frappe.ui.form.on('Finance Budget Amounts', {

//     gl_code: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];
//         if (row.gl_code) {
//             frappe.db.get_value('Expenses', { gl_code: row.gl_code }, [
//                 'type_of_expense',
//                 'sub_head_of_expense',
//                 'head_of_expense'
//             ]).then(response => {
//                 if (response.message) {
//                     frappe.model.set_value(cdt, cdn, 'type_of_expense', response.message.type_of_expense);
//                     frappe.model.set_value(cdt, cdn, 'sub_head_of_expense', response.message.sub_head_of_expense);
//                     frappe.model.set_value(cdt, cdn, 'head_of_expense', response.message.head_of_expense);
//                 } else {
//                     frappe.msgprint('No matching Expense found for GL Code: ' + row.gl_code);
//                 }
//             }).catch(error => {
//                 frappe.msgprint('Error fetching GL Code: ' + error.message);
//             });
//         }
//     },

   
// });


frappe.ui.form.on('Finance Budget', {
    refresh(frm) {
        set_cost_filters(frm);
        clean_and_recalculate_all(frm);
    },

    set_id(frm) {
        frm.set_value('cost_center', '');
        frm.set_value('location_code', '');
        set_cost_filters(frm);
    },

    budget_amounts_add(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        recalc_row_totals(frm, row);
        update_total_budget(frm);
    },

    budget_amounts_remove(frm) {
        update_total_budget(frm);
    }
});

frappe.ui.form.on('Finance Budget Amounts', {
    april: month_changed,
    may: month_changed,
    june: month_changed,
    july: month_changed,
    august: month_changed,
    september: month_changed,
    october: month_changed,
    november: month_changed,
    december: month_changed,
    january: month_changed,
    february: month_changed,
    march: month_changed,

    gl_code(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (!row.gl_code) return;

        frappe.db.get_value('Expenses', { gl_code: row.gl_code }, [
            'type_of_expense', 'sub_head_of_expense', 'head_of_expense'
        ]).then(r => {
            if (r.message) {
                frappe.model.set_value(cdt, cdn, 'type_of_expense', r.message.type_of_expense);
                frappe.model.set_value(cdt, cdn, 'sub_head_of_expense', r.message.sub_head_of_expense);
                frappe.model.set_value(cdt, cdn, 'head_of_expense', r.message.head_of_expense);
            }
        });
    }
});

function safeNum(val) {
    let n = Number(val);
    return isFinite(n) ? n : 0;
}

function roundNumber(num, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
}

function month_changed(frm, cdt, cdn) {
    update_row_and_parent(frm, cdt, cdn);
}

function set_cost_filters(frm) {
    if (frm.doc.set_id) {
        frm.fields_dict['cost_center'].get_query = () => ({ filters: { set_id: frm.doc.set_id } });
        frm.fields_dict['location_code'].get_query = () => ({ filters: { unit: frm.doc.set_id } });
    }
}

function recalc_row_totals(frm, row) {
    if (!row) return;
    compute_quarters_and_year(row);
    update_total_budget(frm);
}

function update_row_and_parent(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    if (!row) return;
    compute_quarters_and_year(row);
    update_total_budget(frm);
}

function compute_quarters_and_year(row) {
    let q1 = safeNum(row.april) + safeNum(row.may) + safeNum(row.june);
    let q2 = safeNum(row.july) + safeNum(row.august) + safeNum(row.september);
    let q3 = safeNum(row.october) + safeNum(row.november) + safeNum(row.december);
    let q4 = safeNum(row.january) + safeNum(row.february) + safeNum(row.march);

    q1 = roundNumber(q1, 2);
    q2 = roundNumber(q2, 2);
    q3 = roundNumber(q3, 2);
    q4 = roundNumber(q4, 2);
    const year_total = roundNumber(q1 + q2 + q3 + q4, 2);

    frappe.model.set_value(row.doctype, row.name, 'quarter_1', q1);
    frappe.model.set_value(row.doctype, row.name, 'quarter_2', q2);
    frappe.model.set_value(row.doctype, row.name, 'quarter_3', q3);
    frappe.model.set_value(row.doctype, row.name, 'quarter_4', q4);
    frappe.model.set_value(row.doctype, row.name, 'year', year_total);
}

function update_total_budget(frm) {
    const rows = frm.doc.budget_amounts || [];
    const seen = new Set();
    let total = 0;

    rows.forEach((r, idx) => {
        const key = r.name || `local_${idx}`;
        if (seen.has(key)) return;
        seen.add(key);

        const year_val = safeNum(r.april) + safeNum(r.may) + safeNum(r.june)
                       + safeNum(r.july) + safeNum(r.august) + safeNum(r.september)
                       + safeNum(r.october) + safeNum(r.november) + safeNum(r.december)
                       + safeNum(r.january) + safeNum(r.february) + safeNum(r.march);

        total += roundNumber(year_val, 2);
        console.log(year_val,"year")
    });

    frm.set_value('total_budget', roundNumber(total, 2));
}

// 🧹 Force full recompute of all quarterly + yearly fields
function clean_and_recalculate_all(frm) {
    const rows = frm.doc.budget_amounts || [];
    rows.forEach(r => {
        compute_quarters_and_year(r);
    });
    update_total_budget(frm);
}

