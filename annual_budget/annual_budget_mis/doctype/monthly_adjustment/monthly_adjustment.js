// Copyright (c) 2026, Augustin Moses and contributors
// For license information, please see license.txt


frappe.ui.form.on("Monthly Adjustment", {
    onload: function(frm) {
        if (frm.is_new()) {
            const today = frappe.datetime.now_datetime();
            
            // 1. Set Month (Full Name)
            if (!frm.doc.month) {
                const monthName = moment(today).format('MMMM'); 
                frm.set_value('month', monthName);
            }

            // 2. Set Financial Year (Format: 2025-26)
            if (!frm.doc.financial_year) {
                const currentYear = moment(today).year();
                const currentMonth = moment(today).month(); // 0-indexed (Jan=0, Apr=3)
                
                let finYear = "";
                if (currentMonth >= 3) { // April or later
                    const nextYearShort = (currentYear + 1).toString().slice(-2);
                    finYear = `${currentYear}-${nextYearShort}`;
                } else { // Jan, Feb, Mar
                    const prevYear = currentYear - 1;
                    const currentYearShort = currentYear.toString().slice(-2);
                    finYear = `${prevYear}-${currentYearShort}`;
                }
                
                frm.set_value('financial_year', finYear);
            }
        }
    }
});