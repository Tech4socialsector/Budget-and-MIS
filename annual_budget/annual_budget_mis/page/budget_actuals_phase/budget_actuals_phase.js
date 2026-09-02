// frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {
//     const style = `
//     <style>
//     #tables-container { 
//         margin: 20px; 
//         background-color: #ffffff; 
//         border-radius: 8px; 
//         padding: 8px; 
//     }

//     #controls-row {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 12px;
//         padding: 6px 10px;
//         background: #f7f9fb;
//         border: 1px solid #dcdcdc;
//         border-radius: 6px;
//     }

//     #global-search-box { 
//         width: 280px; 
//         padding: 7px 12px; 
//         border: 1px solid #aaa; 
//         border-radius: 6px; 
//         font-size: 13px;
//     }

//     .scroll-wrapper { 
//         border: 1px solid #ccc; 
//         border-radius: 6px; 
//         overflow-x: auto; 
//         overflow-y: auto; 
//         max-height: 70vh; 
//         background: #fff; 
//     }

//     table.university-table { 
//         min-width: 1200px; 
//         width: 100%; 
//         border-collapse: collapse; 
//         font-size: 13px; 
//     }

//     table.university-table th, 
//     table.university-table td {
//         border: 1px solid #ddd;
//         padding: 8px 10px;
//         white-space: nowrap;
//         vertical-align: middle;
//         text-align: center;
//         background:#fff !important;
//     }

//     table.university-table th:first-child,
//     table.university-table td:first-child { 
//         text-align: left !important; 
//     }

//     table.university-table thead tr.main-row th { 
//         background-color: #0076B6 !important; 
//         color: #fff !important; 
//         position: sticky; 
//         top: 0; 
//         z-index: 25; 
//     }

//     tr.expense-head { 
//         font-weight: 700; 
//         cursor: pointer; 
//     }

//     tr.expense-head:hover td {
//         background: #F4F9FD !important;
//     }

//     tr.sub-head { 
//         background-color: #FFF3E6 !important;
//         font-weight: 600; 
//         cursor: pointer;
//     }

//     tr.sub-head:hover td {
//         background-color: #FFEAD5 !important;
//     }

//     tr.line-item td:first-child { 
//         padding-left: 35px !important; 
//     }

//     tr.sub-head td:first-child { 
//         padding-left: 20px !important; 
//     }

//     .text-blue { 
//         color: #0076B6; 
//         font-weight: 600; 
//     }

//     tr.grand-total-row td {
//         background:#003B63 !important;
//         color:#fff !important;
//         font-weight:700 !important;
//     }

//     .card-row{
//         display:grid;
//         grid-template-columns: repeat(4, 1fr);
//         gap:14px;
//         margin:14px 20px;
//     }

//     .number-card{
//         background:#ffffff;
//         border:1px solid #dcdcdc;
//         border-radius:8px;
//         padding:14px 16px;
//         box-shadow:0 2px 6px rgba(0,0,0,.06);
//         transition:.15s ease;
//     }

//     .number-card:hover{
//         transform:translateY(-2px);
//         box-shadow:0 6px 14px rgba(0,0,0,.12);
//     }

//     .number-title{
//         font-size:12px;
//         font-weight:600;
//         color:#666;
//         text-transform:uppercase;
//         margin-bottom:6px;
//     }

//     .number-value{
//         font-size:20px;
//         font-weight:700;
//         color:#0076B6;
//     }

//     .number-card.grand{
//         border:2px solid #0076B6;
//         background:#F4F9FD;
//     }

//     .number-card.grand .number-value{
//         font-size:24px;
//         font-weight:800;
//     }
//     </style>
//     `;


//         $('head').append(style);
//             if (!$("#global-loader").length) {
//         $("body").append(`
//             <div id="global-loader" class="loader-overlay">
//                 <div class="loader-box">
//                     <img src="/files/apf.png" class="loader-logo">
//                     <div class="loader-text">Loading, please wait…</div>
//                 </div>
//             </div>
//         `);
//     }

//     /* Always hide on page load */
//     $("#global-loader").hide();
//     const Loader = {
//         show(message = "Loading, please wait…") {
//             const loader = $("#global-loader");
//             if (!loader.length) return;

//             loader.find(".loader-text").text(message);
//             loader.fadeIn(200);
//         },

//         hide() {
//             const loader = $("#global-loader");
//             if (!loader.length) return;

//             loader.fadeOut(200);
//         }
//     };
//     /* =====================================================
//        PAGE
//     =====================================================*/
//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget vs Actuals Face Sheet',
//         single_column: true
//     });
//     /* ------------------------------------------------
//        FILTER SECTION
//     --------------------------------------------------*/
//     let filter_section = $(`
//         <div class="frappe-control-group row custom-filter-row"></div>
//     `).appendTo(page.body);

//     $(`<style>
//         .custom-filter-row {
//             padding: 15px 20px;
//             background: #fff;
//             border-radius: 6px;
//             margin-top: 10px;
//         }
//         .custom-filter-row.row {
//             margin-left: 0;
//             margin-right: 0;
//         }
//         .custom-filter-row .col-md-4,
//         .custom-filter-row .col-sm-12 {
//             padding-left: 8px;
//             padding-right: 8px;
//         }
                
//                     /* Full screen overlay – soft light black glass look */
//         #global-loader.loader-overlay {
//             position: fixed;
//             inset: 0;
//             width: 100vw;
//             height: 100vh;
//             background: rgba(18, 18, 18, 0.92); /* light black */
//             backdrop-filter: blur(6px);
//             display: none;
//             z-index: 999999;

//             /* Perfect center */
//             display: flex;
//             align-items: center;
//             justify-content: center;
//         }

//         /* Center container */
//         .loader-box {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             gap: 14px;
//         }

//         /* Rounded logo */
//         .loader-logo {
//             width: 90px;
//             height: 90px;
//             border-radius: 50%;
//             background: linear-gradient(145deg, #ffffff, #eaeaea);
//             padding: 14px;
//             object-fit: contain;
//             box-shadow: 
//                 0 10px 30px rgba(0, 0, 0, 0.35),
//                 0 0 0 4px rgba(255, 255, 255, 0.08);
//             animation: pulse 1.6s infinite ease-in-out;
//         }

//         /* Loader text */
//         .loader-text {
//             margin-top: 6px;
//             font-size: 14px;
//             color: #ffffff; /* white text */
//             font-weight: 600;
//             letter-spacing: 0.5px;
//             text-align: center;
//             opacity: 0.85;
//         }

//         /* Subtle loading dots animation (optional, looks premium) */
//         .loader-text::after {
//             content: "";
//             display: inline-block;
//             width: 1em;
//             animation: dots 1.5s infinite;
//         }

//         /* Pulse animation */
//         @keyframes pulse {
//             0% {
//                 transform: scale(1);
//                 opacity: 0.8;
//                 box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
//             }
//             50% {
//                 transform: scale(1.08);
//                 opacity: 1;
//                 box-shadow: 0 0 20px 8px rgba(255, 255, 255, 0.15);
//             }
//             100% {
//                 transform: scale(1);
//                 opacity: 0.8;
//                 box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
//             }
//         }

//         /* Loading dots animation */
//         @keyframes dots {
//             0%   { content: ""; }	
//             33%  { content: "."; }
//             66%  { content: ".."; }
//             100% { content: "..."; }
//         }
//     .kpi-row,
//     .kpi-bottom{
//         display:flex;
//         justify-content:space-between;
//         margin-top:8px;
//     }

//     .kpi-block{
//         text-align:left;
//     }

//     .kpi-label{
//         font-size:11px;
//         color:#777;
//         text-transform:uppercase;
//     }

//     .kpi-value{
//         font-size:14px;
//         font-weight:700;
//         color:#000;
//     }

//     .kpi-bottom{
//         margin-top:10px;
//         padding-top:8px;
//         border-top:1px solid #eee;
//     }

//     .number-card.sub{
//         background:#fafafa;
//         border-left:4px solid #ccc;
//     }

        
//     </style>`).appendTo("head");

//     function make_field() {
//         return $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);
//     }

//     function mergeSelectedOptions(control, new_options) {
//         let selected = (control.get_value() || []).map(String);
//         let existing = control.df.options || [];
//         let map = {};

//         existing.forEach(o => map[String(o.value)] = o);
//         new_options.forEach(o => map[String(o.value)] = o);

//         selected.forEach(v => {
//             if (!map[v]) {
//                 map[v] = { label: v, value: v, description: "" };
//             }
//         });

//         return Object.values(map);
//     }
//     function add_select_all_button(multiselect_control) {

//             multiselect_control.$wrapper.on("click", function () {

//                 setTimeout(() => {

//                     let dropdown = multiselect_control.$wrapper.find(".multiselect-list");

//                     if (!dropdown.length) return;

//                     // Prevent duplicate button
//                     if (dropdown.find(".select-all-btn").length) return;

//                     let select_all_btn = $(`
//                         <button type="button"
//                             class="btn btn-xs btn-default select-all-btn"
//                             style="margin-right: 5px;">
//                             Select All
//                         </button>
//                     `);

//                     select_all_btn.on("click", async function (e) {
//                         e.stopPropagation();

//                         let values = [];

//                         // If dynamic get_data exists
//                         if (multiselect_control.get_data) {
//                             let data = await multiselect_control.get_data();
//                             values = data.map(d => String(d.value));
//                         }
//                         // If static options
//                         else if (multiselect_control.df.options) {
//                             values = multiselect_control.df.options.map(o => 
//                                 typeof o === "object" ? String(o.value) : String(o)
//                             );
//                         }

//                         multiselect_control.set_value(values);
//                     });

//                     dropdown.find(".dropdown-footer").prepend(select_all_btn);

//                 }, 200);
//             });
//     }

//     /* ------------------------------------------------
//        FINANCIAL YEAR
//     --------------------------------------------------*/
//     let fy_col = make_field();
//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: fy_col,
//         df: {
//             label: "Financial Year",
//             fieldtype: "Select",
//             fieldname: "financial_year",
//             options: ["2025-26", "2026-27"].join("\n"),
//             default: "2025-26",
//             reqd: 1,
//             change() {
//                 loadData();
//             }
//         },
//         render_input: true
//     });
//     let month_col = make_field();
//    // Get current month name
// let currentMonth = new Date().toLocaleString('default', { month: 'long' });

// let month_filter = frappe.ui.form.make_control({
//     parent: month_col,
//     df: {
//         label: "YTD Month",
//         fieldtype: "Select",
//         fieldname: "month",
//         options: [
//             "January",
//             "February",
//             "March",
//             "April",
//             "May",
//             "June",
//             "July",
//             "August",
//             "September",
//             "October",
//             "November",
//             "December"
//         ].join("\n"),
//         reqd: 1,
//         change() {
//             loadData();
//         }
//     },
//     render_input: true
// });

// // ✅ FORCE SET DEFAULT VALUE
// month_filter.set_value(currentMonth);


//     /* ------------------------------------------------
//        UNIT (MULTI SELECT)
//     --------------------------------------------------*/
//     let unit_col = make_field();
//     let unit_filter = frappe.ui.form.make_control({
//         parent: unit_col,
//         df: {
//             label: "Unit",
//             fieldtype: "MultiSelectList",
//             fieldname: "unit",
//             reqd: 1,
//             get_data() {
//                 return frappe.call({
//                     method: "annual_budget.api.filter_options.get_units"
//                 }).then(r => {
//                     return (r.message?.data || [])
//                         .filter(d => d.value)
//                         .map(d => ({
//                             label: d.label,
//                             value: String(d.value),
//                             description: ""
//                         }));
//                 });
//             },
//             change() {
//                 units = unit_filter.get_value().map(String);
//                 cost_center_filter.set_value([]);
//                 location_code_filter.df.options = [];
//                 location_code_filter.refresh();
//                 cost_center_filter.df.options = [];
//                 cost_center_filter.refresh();
//                 if (units.length) {
//                     loadCostCenters(units);
//                     loadLocationCodes(units);
//                         // loadData();
//                 }
//             }
//         },
//         render_input: true
//     });
// add_select_all_button(unit_filter);

//     /* ------------------------------------------------
//        COST CENTER (MULTI SELECT)
//     --------------------------------------------------*/
//     let cc_col = make_field();
//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: cc_col,
//         df: {
//             label: "Cost Center",
//             fieldtype: "MultiSelectList",
//             fieldname: "cost_center",
//             options: [],
//             change() {
//                 // loadData();
//             }
//         },
//         render_input: true
//     });
// add_select_all_button(cost_center_filter);

//     /* ------------------------------------------------
//        LOCATION CODE (MULTI SELECT)
//     --------------------------------------------------*/
//     let lc_col = make_field();
//     let location_code_filter = frappe.ui.form.make_control({
//         parent: lc_col,
//         df: {
//             label: "Location Code",
//             fieldtype: "MultiSelectList",
//             fieldname: "location_code",
//             options: [],
//             change() {
//                 // loadData();
//             }
//         },
//         render_input: true
//     });
// add_select_all_button(location_code_filter);

// // 🔹 Add Select All inside dropdown
// // location_code_filter.$wrapper.on("click", function () {

// //     setTimeout(() => {

// //         let dropdown = location_code_filter.$wrapper.find(".multiselect-list");

// //         if (!dropdown.length) return;

// //         // Avoid duplicate button
// //         if (dropdown.find(".select-all-btn").length) return;

// //         let select_all_btn = $(`
// //             <button type="button"
// //                 class="btn btn-xs btn-default select-all-btn"
// //                 style="margin-right: 5px;">
// //                 Select All
// //             </button>
// //         `);

// //         select_all_btn.on("click", async function (e) {
// //             e.stopPropagation();

// //             let values = [];

// //             // If using get_data (dynamic data)
// //             if (location_code_filter.get_data) {
// //                 let data = await location_code_filter.get_data();
// //                 values = data.map(d => d.value);
// //             } 
// //             // If using static options
// //             else if (location_code_filter.df.options) {
// //                 values = location_code_filter.df.options;
// //             }

// //             location_code_filter.set_value(values);
// //         });

// //         // Add button before Clear All
// //         dropdown.find(".dropdown-footer").prepend(select_all_btn);

// //     }, 200);
// // });

//     let btn_col = make_field();

//     let load_button = frappe.ui.form.make_control({
//         parent: btn_col,
//         df: {
//             label: " ",
//             fieldtype: "Button",
//             fieldname: "load_button",
//             click() {
//                 loadData();
//             }
//         },
//         render_input: true
//     });

//     load_button.$input.addClass("btn-primary");
//     load_button.$input.text("Get Report");

//     // 🔥 Only for button
//     load_button.$wrapper.css("margin-top", "26px");

//     /* ------------------------------------------------
//        LOAD COST CENTERS
//     --------------------------------------------------*/
//     function loadCostCenters(units) {
// 				    cost_center_filter.set_value([]);

//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 let api_options = (r.message?.data || [])
//                     .filter(d => d.value)
//                     .map(d => ({
//                         label: d.label,
//                         value: String(d.value),
//                         description: "",
//                         erp_cost_center_value: String(d.erp_cost_center_value)

//                     }));

//                 cost_center_filter.df.options =
//                     mergeSelectedOptions(cost_center_filter, api_options);

//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     /* ------------------------------------------------
//        LOAD LOCATION CODES
//     --------------------------------------------------*/
//     function loadLocationCodes(units) {
// 		     location_code_filter.set_value([]);
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 let api_options = (r.message?.data || [])
//                     .filter(d => d.value)
//                     .map(d => ({
//                         label: d.label,
//                         value: String(d.value),
//                         description: "",
//                         erp_loc_value: String(d.erp_loc_value)
//                     }));

//                 location_code_filter.df.options =
//                     mergeSelectedOptions(location_code_filter, api_options);

//                 location_code_filter.refresh();
//             }
//         });
//     }
// // const container = $(`
// //     <div id="tables-container">
// //         <div class="card-row" id="cards-container"></div>
// //         <div id="controls-row">
// //             <input id="global-search-box" type="text"
// //                 placeholder="Search Expense / Sub Head / Item...">
// //         </div>
// //         <div class="scroll-wrapper">
// //             <table class="university-table" id="phase-table"></table>
// //         </div>

// //     </div>
// // `);
// frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", function () {
//     console.log("XLSX Loaded");
// });
// const container = $(`
//     <div id="tables-container">
//         <div class="card-row" id="cards-container"></div>

//         <div id="controls-row">
//             <input id="global-search-box" type="text"
//                 placeholder="Search Expense / Sub Head / Item...">
//             <button id="export-excel-btn">Export to Excel</button>
//         </div>

//         <div class="scroll-wrapper">
//             <table class="university-table" id="phase-table"></table>
//         </div>
//     </div>
// `);

// $(page.body).append(container);
// $(document).on('click', '#export-excel-btn', function () {
//     exportTableToExcel();
// });
// // function exportTableToExcel() {

// //     if (typeof XLSX === "undefined") {
// //         frappe.msgprint("Excel library not loaded yet.");
// //         return;
// //     }

// //     const table = document.getElementById("phase-table");

// //     if (!table || table.rows.length === 0) {
// //         frappe.msgprint("No data available to export.");
// //         return;
// //     }

// //     const wb = XLSX.utils.table_to_book(table, { sheet: "Expense Report" });
// //     XLSX.writeFile(wb, "Expense_Report.xlsx");
// // }
// function exportTableToExcel() {

//     if (typeof XLSX === "undefined") {
//         frappe.msgprint("Excel library not loaded.");
//         return;
//     }

//     let data = [];

//     // Header Row
//     data.push([
//         "Expense Head",
//         "Budget",
//         "Actuals",
//         "Util %",
//         "Variance"
//     ]);

//     let grand_budget = 0;
//     let grand_actuals = 0;

//     expense_heads.forEach(head => {

//         const headBudget = Number(head.ytd || 0);
//         const headActual = Number(head.total_posted_amt_ytd || 0);
//         const headVariance = headBudget - headActual;
//         const headPer = safePercentage(headBudget, headActual);

//         grand_budget += headBudget;
//         grand_actuals += headActual;

//         // Main Head Row
//         data.push([
//             head.name,
//             headBudget,
//             headActual,
//             headPer,
//             headVariance
//         ]);

//         // Sub Heads
//         (head.sub_heads || []).forEach(sub => {

//             const subBudget = Number(sub.ytd || 0);
//             const subActual = Number(sub.total_posted_amt_ytd || 0);
//             const subVariance = subBudget - subActual;
//             const subPer = safePercentage(subBudget, subActual);

//             data.push([
//                 "   " + sub.name,   // Indentation
//                 subBudget,
//                 subActual,
//                 subPer,
//                 subVariance
//             ]);

//             // Items inside Sub Head
//             (sub.items || []).forEach(item => {

//                 const budget = Number(item.ytd || 0);
//                 const actual = Number(item.total_posted_amt || 0);
//                 const variance = budget - actual;
//                 const per = safePercentage(budget, actual);

//                 data.push([
//                     "      " + item.name,   // More indentation
//                     budget,
//                     actual,
//                     per,
//                     variance
//                 ]);
//             });

//         });

//         // Items directly under Head
//         (head.items || []).forEach(item => {

//             const budget = Number(item.ytd || 0);
//             const actual = Number(item.total_posted_amt || 0);
//             const variance = budget - actual;
//             const per = safePercentage(budget, actual);

//             data.push([
//                 "   " + item.name,
//                 budget,
//                 actual,
//                 per,
//                 variance
//             ]);
//         });

//     });

//     // Grand Total Row
//     const grandVariance = grand_budget - grand_actuals;
//     const grandPer = safePercentage(grand_budget, grand_actuals);

//     data.push([
//         "GRAND TOTAL",
//         grand_budget,
//         grand_actuals,
//         grandPer,
//         grandVariance
//     ]);

//     // Create worksheet
//     const ws = XLSX.utils.aoa_to_sheet(data);

//     // Auto column width
//     ws["!cols"] = [
//         { wch: 40 },
//         { wch: 15 },
//         { wch: 15 },
//         { wch: 10 },
//         { wch: 15 }
//     ];

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Expense Report");

//     XLSX.writeFile(wb, "Expense_Report.xlsx");
// }
//     /* =====================================================
//        STATE
//     =====================================================*/
//     let expense_heads = [];
//     let expandedHeads = [];
//     let expandedSubHeads = [];
//     let searchText = "";

//     const formatNumber = n =>
//         (Number(n) || 0).toLocaleString('en-IN', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });

//     function matchesSearch(...values) {
//         return values.some(v =>
//             String(v || "").toLowerCase().includes(searchText.toLowerCase())
//         );
//     }
// /* ------------------------------------------------
//    HELPER — GET SELECTED WITH EXTRA KEY
// --------------------------------------------------*/
// function getSelectedWithKey(control, key) {
//     return (control.get_value() || [])
//         .map(val => {
//             let option = control.df.options.find(
//                 o => String(o.value) === String(val)
//             );
//             return option?.[key];
//         })
//         .filter(Boolean);
// }

// function loadData() {

//     let financial_year = fiscal_year_filter.get_value();
//     let month = month_filter.get_value();
//     // let unit = (unit_filter.get_value() || [])[0] || null;
//     // let location_code =getSelectedWithKey(location_code_filter, "value")[18] || null;

//     // let cost_center =getSelectedWithKey(cost_center_filter, "value")[0] || null;
//     let erp_cost_center_value =getSelectedWithKey(cost_center_filter, "erp_cost_center_value")[0] || null;
//     let erp_loc_value =getSelectedWithKey(location_code_filter, "erp_loc_value")[0] || null;

//     let unit = (unit_filter.get_value() || []).join(",") || null;
//     let location_code = (getSelectedWithKey(location_code_filter, "value") || []).join(",") || null;
//     let cost_center = (getSelectedWithKey(cost_center_filter, "value") || []).join(",") || null;
//     // let erp_cost_center_value = (getSelectedWithKey(cost_center_filter, "erp_cost_center_value") || []).join(",") || null;
//     // let erp_loc_value = (getSelectedWithKey(location_code_filter, "erp_loc_value") || []).join(",") || null;

//     console.log(erp_cost_center_value,"erp_cost_center_value");
//     console.log(cost_center,"cost_center_value")
//     console.log(location_code,"loc_value")

//     let missing = [];
//     if (!financial_year) missing.push("Financial Year");
//     if (!month) missing.push("Month");
//     if (!unit) missing.push("Unit");
//     // if (!erp_cost_center_value) missing.push("Cost Center");

//     if (missing.length) {
//         console.warn("⚠ Missing Filters:", missing.join(", "));
//         return;
//     }

//     Loader.show("We're crafting your report with care");

//     frappe.call({
//         method: "annual_budget.api.phase_sheet.get_combined_actuals",
//         args: {
//             financial_year,
//             month,
//             unit,
//             cost_center,
//             location_code,
//             erp_loc_value,
//             erp_cost_center_value,
            
//         }
//     })
//     .done(function(r) {

//         // Safe API parsing
//         expense_heads = Array.isArray(r.message)
//             ? r.message
//             : (r.message?.message || []);

//         expandedHeads = [];
//         expandedSubHeads = [];
//         console.log(r,"API response")
//         renderTable();

//     })
//     .fail(function(err) {

//         console.error("API Error:", err);

//         frappe.msgprint({
//             title: "Error",
//             message: "Failed to load data. Please try again.",
//             indicator: "red"
//         });

//     })
//     .always(function() {
//         Loader.hide();
//     });
// }


// function safePercentage(budget, actual) {
//     if (!budget || budget === 0) return "0.00";
//     return ((actual / budget) * 100).toFixed(2);
// }


// function renderTable() {

//     renderCards(expense_heads);

//     const $table = $('#phase-table');
//     $table.html('');

//     if (!expense_heads || !expense_heads.length) {
//         $table.append(`<tr><td colspan="5">No Data Found</td></tr>`);
//         return;
//     }

//     $table.append(`
//         <thead>
//             <tr class="main-row">
//                 <th>Expense Head</th>
//                 <th>Budget</th>
//                 <th>Actuals</th>
//                 <th>Util %</th>
//                 <th>Variance</th>
//             </tr>
//         </thead>
//     `);

//     const $tbody = $('<tbody></tbody>');

//     let grand_budget = 0;
//     let grand_actuals = 0;

//     expense_heads.forEach(head => {

//         if (
//             searchText &&
//             !matchesSearch(head.name) &&
//             !(head.items || []).some(i => matchesSearch(i.name)) &&
//             !(head.sub_heads || []).some(s =>
//                 matchesSearch(s.name) ||
//                 (s.items || []).some(i => matchesSearch(i.name))
//             )
//         ) return;

//         const headBudget = Number(head.ytd || 0);
//         const headActual = Number(head.total_posted_amt_ytd || 0);
//         const headTotal = headBudget - headActual;
//         const headPer = safePercentage(headBudget, headActual);

//         grand_budget += headBudget;
//         grand_actuals += headActual;

//         $tbody.append(`
//             <tr class="expense-head" data-head="${head.name}">
//                 <td>
//                     ${(head.items?.length || head.sub_heads?.length)
//                         ? (expandedHeads.includes(head.name) ? '▼' : '▶')
//                         : ''
//                     }
//                     ${head.name}
//                 </td>
//                 <td>${formatNumber(headBudget)}</td>
//                 <td>${formatNumber(headActual)}</td>
//                 <td class="text-blue">${headPer} %</td>
//                 <td class="text-blue">${formatNumber(headTotal)}</td>
//             </tr>
//         `);

//         /* ===== Expand Head ===== */
//         if (expandedHeads.includes(head.name)) {

//             (head.items || []).forEach(item => {

//                 if (searchText && !matchesSearch(item.name)) return;

//                 const budget = Number(item.ytd || 0);
//                 const actual = Number(item.total_posted_amt || 0);
//                 const total = budget - actual;
//                 const total_per = safePercentage(budget, actual);

//                 $tbody.append(`
//                     <tr class="line-item">
//                         <td style="padding-left:35px">${item.name}</td>
//                         <td>${formatNumber(budget)}</td>
//                         <td>${formatNumber(actual)}</td>
//                         <td>${total_per} %</td>
//                         <td>${formatNumber(total)}</td>
//                     </tr>
//                 `);
//             });

//             (head.sub_heads || []).forEach(sub => {

//                 const key = head.name + "__" + sub.name;

//                 const subBudget = Number(sub.ytd || 0);
//                 const subActual = Number(sub.total_posted_amt_ytd || 0);
//                 const subTotal = subBudget - subActual;
//                 const subTotal_per = safePercentage(subBudget, subActual);

//                 $tbody.append(`
//                     <tr class="sub-head" data-sub="${key}">
//                         <td style="padding-left:20px">
//                             ${(sub.items?.length)
//                                 ? (expandedSubHeads.includes(key) ? '▼' : '▶')
//                                 : ''
//                             }
//                             ${sub.name}
//                         </td>
//                         <td>${formatNumber(subBudget)}</td>
//                         <td>${formatNumber(subActual)}</td>
//                         <td class="text-blue">${subTotal_per} %</td>
//                         <td class="text-blue">${formatNumber(subTotal)}</td>
//                     </tr>
//                 `);

//                 if (expandedSubHeads.includes(key)) {

//                     (sub.items || []).forEach(item => {

//                         const budget = Number(item.ytd || 0);
//                         const actual = Number(item.total_posted_amt || 0);
//                         const total = budget - actual;
//                         const total_per1 = safePercentage(budget, actual);

//                         $tbody.append(`
//                             <tr class="line-item">
//                                 <td style="padding-left:55px">${item.name}</td>
//                                 <td>${formatNumber(budget)}</td>
//                                 <td>${formatNumber(actual)}</td>
//                                 <td>${total_per1} %</td>
//                                 <td>${formatNumber(total)}</td>
//                             </tr>
//                         `);
//                     });
//                 }
//             });
//         }
//     });

//     const grand_total = grand_budget - grand_actuals;
//     const grandPer = safePercentage(grand_budget, grand_actuals);

//     $tbody.append(`
//         <tr class="grand-total-row">
//             <td>GRAND TOTAL</td>
//             <td>${formatNumber(grand_budget)}</td>
//             <td>${formatNumber(grand_actuals)}</td>
//             <td>${grandPer} %</td>
//             <td>${formatNumber(grand_total)}</td>
//         </tr>
//     `);

//     $table.append($tbody);

//     /* Toggle Head */
//     $('.expense-head').off('click').on('click', function () {

//         const name = $(this).data('head');

//         expandedHeads = expandedHeads.includes(name)
//             ? expandedHeads.filter(x => x !== name)
//             : [...expandedHeads, name];

//         renderTable();
//     });

//     /* Toggle Sub Head */
//     $('.sub-head').off('click').on('click', function () {

//         const key = $(this).data('sub');

//         expandedSubHeads = expandedSubHeads.includes(key)
//             ? expandedSubHeads.filter(x => x !== key)
//             : [...expandedSubHeads, key];

//         renderTable();
//     });
// }

// function renderCards(data){

//     const cards_container = $('#cards-container');
//     cards_container.empty();

//     let grand_budget = 0;
//     let grand_actual = 0;
//     let cards_html = "";

//     /* ===== Grand Total Calculation ===== */
//     data.forEach(head => {
//         grand_budget += Number(head.ytd || 0);
//         grand_actual += Number(head.total_posted_amt_ytd || 0);
//     });

//     const grand_variance = grand_budget - grand_actual;

//     /* ===== GRAND TOTAL CARD ===== */
//     cards_html += createCard("Grand Total", grand_budget, grand_actual, grand_variance, true);

//     /* ===== Heads + Sub Heads ===== */
//     data.forEach(head => {

//         const headBudget = Number(head.ytd || 0);
//         const headActual = Number(head.total_posted_amt_ytd || 0);
//         const headVariance = headBudget - headActual;

//         cards_html += createCard(head.name, headBudget, headActual, headVariance);

//         (head.sub_heads || []).forEach(sub => {

//             const subBudget = Number(sub.ytd || 0);
//             const subActual = Number(sub.total_posted_amt_ytd || 0);
//             const subVariance = subBudget - subActual;

//             cards_html += createCard(sub.name, subBudget, subActual, subVariance, false, true);
//         });
//     });

//     cards_container.append(cards_html);
// }


// function createCard(title, budget, actual, variance, isGrand = false, isSub = false){

//     const utilization = budget > 0 
//         ? ((actual / budget) * 100).toFixed(2) 
//         : "0.00";

//     return `
//         <div class="number-card ${isGrand ? 'grand' : ''} ${isSub ? 'sub' : ''}">
            
//             <div class="number-title">${title}</div>

//             <div class="kpi-row">
//                 <div class="kpi-block">
//                     <div class="kpi-label">Budget</div>
//                     <div class="kpi-value">${formatNumber(budget)}</div>
//                 </div>

//                 <div class="kpi-block">
//                     <div class="kpi-label">Actual</div>
//                     <div class="kpi-value">${formatNumber(actual)}</div>
//                 </div>
//             </div>

//             <div class="kpi-bottom">
//                 <div class="kpi-block">
//                     <div class="kpi-label">Variance</div>
//                     <div class="kpi-value">${formatNumber(variance)}</div>
//                 </div>

//                 <div class="kpi-block">
//                     <div class="kpi-label">Util %</div>
//                     <div class="kpi-value">${utilization} %</div>
//                 </div>
//             </div>

//         </div>
//     `;
// }



// };














// frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {
//     const style = `
//     <style>
//     #tables-container { 
//         margin: 20px; 
//         background-color: #ffffff; 
//         border-radius: 8px; 
//         padding: 8px; 
//     }

//     #controls-row {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 12px;
//         padding: 6px 10px;
//         background: #f7f9fb;
//         border: 1px solid #dcdcdc;
//         border-radius: 6px;
//     }

//     #global-search-box { 
//         width: 280px; 
//         padding: 7px 12px; 
//         border: 1px solid #aaa; 
//         border-radius: 6px; 
//         font-size: 13px;
//     }

//     .scroll-wrapper { 
//         border: 1px solid #ccc; 
//         border-radius: 6px; 
//         overflow-x: auto; 
//         overflow-y: auto; 
//         max-height: 70vh; 
//         background: #fff; 
//     }

//     table.university-table { 
//         min-width: 1200px; 
//         width: 100%; 
//         border-collapse: collapse; 
//         font-size: 13px; 
//     }

//     table.university-table th, 
//     table.university-table td {
//         border: 1px solid #ddd;
//         padding: 8px 10px;
//         white-space: nowrap;
//         vertical-align: middle;
//         text-align: center;
//         background:#fff !important;
//     }

//     table.university-table th:first-child,
//     table.university-table td:first-child { 
//         text-align: left !important; 
//     }

//     table.university-table thead tr.main-row th { 
//         background-color: #0076B6 !important; 
//         color: #fff !important; 
//         position: sticky; 
//         top: 0; 
//         z-index: 25; 
//     }

//     tr.expense-head { 
//         font-weight: 700; 
//         cursor: pointer; 
//     }

//     tr.expense-head:hover td {
//         background: #F4F9FD !important;
//     }

//     tr.sub-head { 
//         background-color: #FFF3E6 !important;
//         font-weight: 600; 
//         cursor: pointer;
//     }

//     tr.sub-head:hover td {
//         background-color: #FFEAD5 !important;
//     }

//     tr.line-item td:first-child { 
//         padding-left: 35px !important; 
//     }

//     tr.sub-head td:first-child { 
//         padding-left: 20px !important; 
//     }

//     .text-blue { 
//         color: #0076B6; 
//         font-weight: 600; 
//     }

//     tr.grand-total-row td {
//         background:#003B63 !important;
//         color:#fff !important;
//         font-weight:700 !important;
//     }

//     .card-row{
//         display:grid;
//         grid-template-columns: repeat(4, 1fr);
//         gap:14px;
//         margin:14px 20px;
//     }

//     .number-card{
//         background:#ffffff;
//         border:1px solid #dcdcdc;
//         border-radius:8px;
//         padding:14px 16px;
//         box-shadow:0 2px 6px rgba(0,0,0,.06);
//         transition:.15s ease;
//     }

//     .number-card:hover{
//         transform:translateY(-2px);
//         box-shadow:0 6px 14px rgba(0,0,0,.12);
//     }

//     .number-title{
//         font-size:12px;
//         font-weight:600;
//         color:#666;
//         text-transform:uppercase;
//         margin-bottom:6px;
//     }

//     .number-value{
//         font-size:20px;
//         font-weight:700;
//         color:#0076B6;
//     }

//     .number-card.grand{
//         border:2px solid #0076B6;
//         background:#F4F9FD;
//     }

//     .number-card.grand .number-value{
//         font-size:24px;
//         font-weight:800;
//     }
//     </style>
//     `;

//     $('head').append(style);

//     if (!$("#global-loader").length) {
//         $("body").append(`
//             <div id="global-loader" class="loader-overlay">
//                 <div class="loader-box">
//                     <img src="/files/apf.png" class="loader-logo">
//                     <div class="loader-text">Loading, please wait…</div>
//                 </div>
//             </div>
//         `);
//     }

//     /* Always hide on page load */
//     $("#global-loader").hide();

//     const Loader = {
//         show(message = "Loading, please wait…") {
//             const loader = $("#global-loader");
//             if (!loader.length) return;

//             loader.find(".loader-text").text(message);
//             loader.fadeIn(200);
//         },

//         hide() {
//             const loader = $("#global-loader");
//             if (!loader.length) return;

//             loader.fadeOut(200);
//         }
//     };

//     /* =====================================================
//        PAGE
//     =====================================================*/
//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget vs Actuals Face Sheet',
//         single_column: true
//     });

//     /* ------------------------------------------------
//        FILTER SECTION
//     --------------------------------------------------*/
//     let filter_section = $(`
//         <div class="frappe-control-group row custom-filter-row"></div>
//     `).appendTo(page.body);

//     $(`<style>
//         .custom-filter-row {
//             padding: 15px 20px;
//             background: #fff;
//             border-radius: 6px;
//             margin-top: 10px;
//         }
//         .custom-filter-row.row {
//             margin-left: 0;
//             margin-right: 0;
//         }
//         .custom-filter-row .col-md-4,
//         .custom-filter-row .col-sm-12 {
//             padding-left: 8px;
//             padding-right: 8px;
//         }
                
//         /* Full screen overlay – soft light black glass look */
//         #global-loader.loader-overlay {
//             position: fixed;
//             inset: 0;
//             width: 100vw;
//             height: 100vh;
//             background: rgba(18, 18, 18, 0.92);
//             backdrop-filter: blur(6px);
//             display: none;
//             z-index: 999999;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//         }

//         .loader-box {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             gap: 14px;
//         }

//         .loader-logo {
//             width: 90px;
//             height: 90px;
//             border-radius: 50%;
//             background: linear-gradient(145deg, #ffffff, #eaeaea);
//             padding: 14px;
//             object-fit: contain;
//             box-shadow: 
//                 0 10px 30px rgba(0, 0, 0, 0.35),
//                 0 0 0 4px rgba(255, 255, 255, 0.08);
//             animation: pulse 1.6s infinite ease-in-out;
//         }

//         .loader-text {
//             margin-top: 6px;
//             font-size: 14px;
//             color: #ffffff;
//             font-weight: 600;
//             letter-spacing: 0.5px;
//             text-align: center;
//             opacity: 0.85;
//         }

//         .loader-text::after {
//             content: "";
//             display: inline-block;
//             width: 1em;
//             animation: dots 1.5s infinite;
//         }

//         @keyframes pulse {
//             0% {
//                 transform: scale(1);
//                 opacity: 0.8;
//                 box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
//             }
//             50% {
//                 transform: scale(1.08);
//                 opacity: 1;
//                 box-shadow: 0 0 20px 8px rgba(255, 255, 255, 0.15);
//             }
//             100% {
//                 transform: scale(1);
//                 opacity: 0.8;
//                 box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
//             }
//         }

//         @keyframes dots {
//             0%   { content: ""; }	
//             33%  { content: "."; }
//             66%  { content: ".."; }
//             100% { content: "..."; }
//         }

//         .kpi-row,
//         .kpi-bottom{
//             display:flex;
//             justify-content:space-between;
//             margin-top:8px;
//         }

//         .kpi-block{
//             text-align:left;
//         }

//         .kpi-label{
//             font-size:11px;
//             color:#777;
//             text-transform:uppercase;
//         }

//         .kpi-value{
//             font-size:14px;
//             font-weight:700;
//             color:#000;
//         }

//         .kpi-bottom{
//             margin-top:10px;
//             padding-top:8px;
//             border-top:1px solid #eee;
//         }

//         .number-card.sub{
//             background:#fafafa;
//             border-left:4px solid #ccc;
//         }
//     </style>`).appendTo("head");

//     function make_field() {
//         return $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);
//     }

//     function mergeSelectedOptions(control, new_options) {
//         let selected = (control.get_value() || []).map(String);
//         let existing = control.df.options || [];
//         let map = {};

//         existing.forEach(o => map[String(o.value)] = o);
//         new_options.forEach(o => map[String(o.value)] = o);

//         selected.forEach(v => {
//             if (!map[v]) {
//                 map[v] = { label: v, value: v, description: "" };
//             }
//         });

//         return Object.values(map);
//     }

//     function add_select_all_button(multiselect_control) {
//         multiselect_control.$wrapper.on("click", function () {
//             setTimeout(() => {
//                 let dropdown = multiselect_control.$wrapper.find(".multiselect-list");

//                 if (!dropdown.length) return;

//                 if (dropdown.find(".select-all-btn").length) return;

//                 let select_all_btn = $(`
//                     <button type="button"
//                         class="btn btn-xs btn-default select-all-btn"
//                         style="margin-right: 5px;">
//                         Select All
//                     </button>
//                 `);

//                 select_all_btn.on("click", async function (e) {
//                     e.stopPropagation();

//                     let values = [];

//                     if (multiselect_control.get_data) {
//                         let data = await multiselect_control.get_data();
//                         values = data.map(d => String(d.value));
//                     }
//                     else if (multiselect_control.df.options) {
//                         values = multiselect_control.df.options.map(o => 
//                             typeof o === "object" ? String(o.value) : String(o)
//                         );
//                     }

//                     multiselect_control.set_value(values);
//                 });

//                 dropdown.find(".dropdown-footer").prepend(select_all_btn);
//             }, 200);
//         });
//     }

//     /* ------------------------------------------------
//        FINANCIAL YEAR
//     --------------------------------------------------*/
//     let fy_col = make_field();
//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: fy_col,
//         df: {
//             label: "Financial Year",
//             fieldtype: "Select",
//             fieldname: "financial_year",
//             options: ["2025-26", "2026-27"].join("\n"),
//             default: "2025-26",
//             reqd: 1,
//             change() {
//                 loadData();
//             }
//         },
//         render_input: true
//     });

//     let month_col = make_field();
//     let currentMonth = new Date().toLocaleString('default', { month: 'long' });

//     let month_filter = frappe.ui.form.make_control({
//         parent: month_col,
//         df: {
//             label: "YTD Month",
//             fieldtype: "Select",
//             fieldname: "month",
//             options: [
//                 "January",
//                 "February",
//                 "March",
//                 "April",
//                 "May",
//                 "June",
//                 "July",
//                 "August",
//                 "September",
//                 "October",
//                 "November",
//                 "December"
//             ].join("\n"),
//             reqd: 1,
//             change() {
//                 loadData();
//             }
//         },
//         render_input: true
//     });

//     month_filter.set_value(currentMonth);

//     /* ------------------------------------------------
//        UNIT (MULTI SELECT)
//     --------------------------------------------------*/
//     let unit_col = make_field();
//     let unit_filter = frappe.ui.form.make_control({
//         parent: unit_col,
//         df: {
//             label: "Unit",
//             fieldtype: "MultiSelectList",
//             fieldname: "unit",
//             reqd: 1,
//             get_data() {
//                 return frappe.call({
//                     method: "annual_budget.api.filter_options.get_units"
//                 }).then(r => {
//                     return (r.message?.data || [])
//                         .filter(d => d.value)
//                         .map(d => ({
//                             label: d.label,
//                             value: String(d.value),
//                             description: ""
//                         }));
//                 });
//             },
//             change() {
//                 units = unit_filter.get_value().map(String);
//                 cost_center_filter.set_value([]);
//                 location_code_filter.df.options = [];
//                 location_code_filter.refresh();
//                 cost_center_filter.df.options = [];
//                 cost_center_filter.refresh();
//                 if (units.length) {
//                     loadCostCenters(units);
//                     loadLocationCodes(units);
//                 }
//             }
//         },
//         render_input: true
//     });
//     add_select_all_button(unit_filter);

//     /* ------------------------------------------------
//        COST CENTER (MULTI SELECT)
//     --------------------------------------------------*/
//     let cc_col = make_field();
//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: cc_col,
//         df: {
//             label: "Cost Center",
//             fieldtype: "MultiSelectList",
//             fieldname: "cost_center",
//             options: [],
//             change() {
//                 // loadData();
//             }
//         },
//         render_input: true
//     });
//     add_select_all_button(cost_center_filter);

//     /* ------------------------------------------------
//        LOCATION CODE (MULTI SELECT)
//     --------------------------------------------------*/
//     let lc_col = make_field();
//     let location_code_filter = frappe.ui.form.make_control({
//         parent: lc_col,
//         df: {
//             label: "Location Code",
//             fieldtype: "MultiSelectList",
//             fieldname: "location_code",
//             options: [],
//             change() {
//                 // loadData();
//             }
//         },
//         render_input: true
//     });
//     add_select_all_button(location_code_filter);

//     let btn_col = make_field();

//     let load_button = frappe.ui.form.make_control({
//         parent: btn_col,
//         df: {
//             label: " ",
//             fieldtype: "Button",
//             fieldname: "load_button",
//             click() {
//                 loadData();
//             }
//         },
//         render_input: true
//     });

//     // ────────────────────────────────────────
//     // FIXED: $input doesn't exist on button control
//     // Use $wrapper.find('button') instead
//     // ────────────────────────────────────────
//     load_button.$wrapper.find('button').addClass("btn-primary");
//     load_button.$wrapper.find('button').text("Get Report");

//     load_button.$wrapper.css("margin-top", "26px");

//     /* ------------------------------------------------
//        LOAD COST CENTERS
//     --------------------------------------------------*/
//     function loadCostCenters(units) {
//         cost_center_filter.set_value([]);

//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 let api_options = (r.message?.data || [])
//                     .filter(d => d.value)
//                     .map(d => ({
//                         label: d.label,
//                         value: String(d.value),
//                         description: "",
//                         erp_cost_center_value: String(d.erp_cost_center_value)
//                     }));

//                 cost_center_filter.df.options =
//                     mergeSelectedOptions(cost_center_filter, api_options);

//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     /* ------------------------------------------------
//        LOAD LOCATION CODES
//     --------------------------------------------------*/
//     function loadLocationCodes(units) {
//         location_code_filter.set_value([]);

//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 let api_options = (r.message?.data || [])
//                     .filter(d => d.value)
//                     .map(d => ({
//                         label: d.label,
//                         value: String(d.value),
//                         description: "",
//                         erp_loc_value: String(d.erp_loc_value)
//                     }));

//                 location_code_filter.df.options =
//                     mergeSelectedOptions(location_code_filter, api_options);

//                 location_code_filter.refresh();
//             }
//         });
//     }

//     frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", function () {
//         console.log("XLSX Loaded");
//     });

//     const container = $(`
//         <div id="tables-container">
//             <div class="card-row" id="cards-container"></div>
//             <div id="controls-row">
//                 <input id="global-search-box" type="text"
//                     placeholder="Search Expense / Sub Head / Item...">
//                 <button id="export-excel-btn">Export to Excel</button>
//             </div>
//             <div class="scroll-wrapper">
//                 <table class="university-table" id="phase-table"></table>
//             </div>
//         </div>
//     `);

//     $(page.body).append(container);

//     $(document).on('click', '#export-excel-btn', function () {
//         exportTableToExcel();
//     });

//     function exportTableToExcel() {
//         if (typeof XLSX === "undefined") {
//             frappe.msgprint("Excel library not loaded.");
//             return;
//         }

//         let data = [];

//         data.push([
//             "Expense Items",
//             "Budget",
//             "Actuals",
//             "Util %",
//             "Variance"
//         ]);

//         let grand_budget = 0;
//         let grand_actuals = 0;

//         expense_heads.forEach(head => {
//             const headBudget = Number(head.ytd || 0);
//             const headActual = Number(head.total_posted_amt_ytd || 0);
//             const headVariance = headBudget - headActual;
//             const headPer = safePercentage(headBudget, headActual);

//             grand_budget += headBudget;
//             grand_actuals += headActual;

//             data.push([
//                 head.name,
//                 headBudget,
//                 headActual,
//                 headPer,
//                 headVariance
//             ]);

//             (head.sub_heads || []).forEach(sub => {
//                 const subBudget = Number(sub.ytd || 0);
//                 const subActual = Number(sub.total_posted_amt_ytd || 0);
//                 const subVariance = subBudget - subActual;
//                 const subPer = safePercentage(subBudget, subActual);

//                 data.push([
//                     "   " + sub.name,
//                     subBudget,
//                     subActual,
//                     subPer,
//                     subVariance
//                 ]);

//                 (sub.items || []).forEach(item => {
//                     const budget = Number(item.ytd || 0);
//                     const actual = Number(item.total_posted_amt || 0);
//                     const variance = budget - actual;
//                     const per = safePercentage(budget, actual);

//                     data.push([
//                         "      " + item.name,
//                         budget,
//                         actual,
//                         per,
//                         variance
//                     ]);
//                 });
//             });

//             (head.items || []).forEach(item => {
//                 const budget = Number(item.ytd || 0);
//                 const actual = Number(item.total_posted_amt || 0);
//                 const variance = budget - actual;
//                 const per = safePercentage(budget, actual);

//                 data.push([
//                     "   " + item.name,
//                     budget,
//                     actual,
//                     per,
//                     variance
//                 ]);
//             });
//         });

//         const grandVariance = grand_budget - grand_actuals;
//         const grandPer = safePercentage(grand_budget, grand_actuals);

//         data.push([
//             "GRAND TOTAL",
//             grand_budget,
//             grand_actuals,
//             grandPer,
//             grandVariance
//         ]);

//         const ws = XLSX.utils.aoa_to_sheet(data);

//         ws["!cols"] = [
//             { wch: 40 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 10 },
//             { wch: 15 }
//         ];

//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Expense Report");

//         XLSX.writeFile(wb, "Expense_Report.xlsx");
//     }

//     /* =====================================================
//        STATE
//     =====================================================*/
//     let expense_heads = [];
//     let expandedHeads = [];
//     let expandedSubHeads = [];
//     let searchText = "";

//     const formatNumber = n =>
//         (Number(n) || 0).toLocaleString('en-IN', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });

//     function matchesSearch(...values) {
//         return values.some(v =>
//             String(v || "").toLowerCase().includes(searchText.toLowerCase())
//         );
//     }

//     /* ------------------------------------------------
//        HELPER — GET SELECTED WITH EXTRA KEY
//     --------------------------------------------------*/
//     function getSelectedWithKey(control, key) {
//         if (!control || !control.get_value) return [];
//         return (control.get_value() || [])
//             .map(val => {
//                 let option = (control.df?.options || []).find(
//                     o => String(o?.value) === String(val)
//                 );
//                 return option?.[key] || null;
//             })
//             .filter(Boolean);
//     }

//     function loadData() {
//         let financial_year = fiscal_year_filter.get_value();
//         let month = month_filter.get_value();

//         // ────────────────────────────────────────
//         // FIXED: safe array handling + no [0]
//         // ────────────────────────────────────────
//         let unit = (unit_filter.get_value() || []).join(",") || null;
//         let location_code = (getSelectedWithKey(location_code_filter, "value") || []).join(",") || null;
//         let cost_center = (getSelectedWithKey(cost_center_filter, "value") || []).join(",") || null;
//         let erp_cost_center_value = (getSelectedWithKey(cost_center_filter, "erp_cost_center_value") || []).join(",") || null;
//         let erp_loc_value = (getSelectedWithKey(location_code_filter, "erp_loc_value") || []).join(",") || null;

//         console.log(erp_cost_center_value, "erp_cost_center_value");
//         console.log(cost_center, "cost_center_value");
//         console.log(location_code, "loc_value");

//         let missing = [];
//         if (!financial_year) missing.push("Financial Year");
//         if (!month) missing.push("Month");
//         if (!unit) missing.push("Unit");

//         if (missing.length) {
//             console.warn("⚠ Missing Filters:", missing.join(", "));
//             return;
//         }

//         Loader.show("We're crafting your report with care");

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_combined_actuals",
//             args: {
//                 financial_year,
//                 month,
//                 unit,
//                 cost_center,
//                 location_code,
//                 erp_loc_value,
//                 erp_cost_center_value,
//             }
//         })
//         .done(function(r) {
//             expense_heads = Array.isArray(r.message)
//                 ? r.message
//                 : (r.message?.message || []);

//             expandedHeads = [];
//             expandedSubHeads = [];
//             console.log(r, "API response");
//             renderTable();
//         })
//         .fail(function(err) {
//             console.error("API Error:", err);
//             frappe.msgprint({
//                 title: "Error",
//                 message: "Failed to load data. Please try again.",
//                 indicator: "red"
//             });
//         })
//         .always(function() {
//             Loader.hide();
//         });
//     }

//     function safePercentage(budget, actual) {
//         if (!budget || budget === 0) return "0.00";
//         return ((actual / budget) * 100).toFixed(2);
//     }

//     function renderTable() {
//         renderCards(expense_heads);

//         const $table = $('#phase-table');
//         $table.html('');

//         if (!expense_heads || !expense_heads.length) {
//             $table.append(`<tr><td colspan="5">No Data Found</td></tr>`);
//             return;
//         }

//         $table.append(`
//             <thead>
//                 <tr class="main-row">
//                     <th>Expense Head</th>
//                     <th>Budget</th>
//                     <th>Actuals</th>
//                     <th>Util %</th>
//                     <th>Variance</th>
//                 </tr>
//             </thead>
//         `);

//         const $tbody = $('<tbody></tbody>');

//         let grand_budget = 0;
//         let grand_actuals = 0;

//         expense_heads.forEach(head => {
//             if (
//                 searchText &&
//                 !matchesSearch(head.name) &&
//                 !(head.items || []).some(i => matchesSearch(i.name)) &&
//                 !(head.sub_heads || []).some(s =>
//                     matchesSearch(s.name) ||
//                     (s.items || []).some(i => matchesSearch(i.name))
//                 )
//             ) return;

//             const headBudget = Number(head.ytd || 0);
//             const headActual = Number(head.total_posted_amt_ytd || 0);
//             const headTotal = headBudget - headActual;
//             const headPer = safePercentage(headBudget, headActual);

//             grand_budget += headBudget;
//             grand_actuals += headActual;

//             $tbody.append(`
//                 <tr class="expense-head" data-head="${head.name}">
//                     <td>
//                         ${(head.items?.length || head.sub_heads?.length)
//                             ? (expandedHeads.includes(head.name) ? '▼' : '▶')
//                             : ''
//                         }
//                         ${head.name}
//                     </td>
//                     <td>${formatNumber(headBudget)}</td>
//                     <td>${formatNumber(headActual)}</td>
//                     <td class="text-blue">${headPer} %</td>
//                     <td class="text-blue">${formatNumber(headTotal)}</td>
//                 </tr>
//             `);

//             if (expandedHeads.includes(head.name)) {
//                 (head.items || []).forEach(item => {
//                     if (searchText && !matchesSearch(item.name)) return;

//                     const budget = Number(item.ytd || 0);
//                     const actual = Number(item.total_posted_amt || 0);
//                     const total = budget - actual;
//                     const total_per = safePercentage(budget, actual);

//                     $tbody.append(`
//                         <tr class="line-item">
//                             <td style="padding-left:35px">${item.name}</td>
//                             <td>${formatNumber(budget)}</td>
//                             <td>${formatNumber(actual)}</td>
//                             <td>${total_per} %</td>
//                             <td>${formatNumber(total)}</td>
//                         </tr>
//                     `);
//                 });

//                 (head.sub_heads || []).forEach(sub => {
//                     const key = head.name + "__" + sub.name;

//                     const subBudget = Number(sub.ytd || 0);
//                     const subActual = Number(sub.total_posted_amt_ytd || 0);
//                     const subTotal = subBudget - subActual;
//                     const subTotal_per = safePercentage(subBudget, subActual);

//                     $tbody.append(`
//                         <tr class="sub-head" data-sub="${key}">
//                             <td style="padding-left:20px">
//                                 ${(sub.items?.length)
//                                     ? (expandedSubHeads.includes(key) ? '▼' : '▶')
//                                     : ''
//                                 }
//                                 ${sub.name}
//                             </td>
//                             <td>${formatNumber(subBudget)}</td>
//                             <td>${formatNumber(subActual)}</td>
//                             <td class="text-blue">${subTotal_per} %</td>
//                             <td class="text-blue">${formatNumber(subTotal)}</td>
//                         </tr>
//                     `);

//                     if (expandedSubHeads.includes(key)) {
//                         (sub.items || []).forEach(item => {
//                             const budget = Number(item.ytd || 0);
//                             const actual = Number(item.total_posted_amt || 0);
//                             const total = budget - actual;
//                             const total_per1 = safePercentage(budget, actual);

//                             $tbody.append(`
//                                 <tr class="line-item">
//                                     <td style="padding-left:55px">${item.name}</td>
//                                     <td>${formatNumber(budget)}</td>
//                                     <td>${formatNumber(actual)}</td>
//                                     <td>${total_per1} %</td>
//                                     <td>${formatNumber(total)}</td>
//                                 </tr>
//                             `);
//                         });
//                     }
//                 });
//             }
//         });

//         const grand_total = grand_budget - grand_actuals;
//         const grandPer = safePercentage(grand_budget, grand_actuals);

//         $tbody.append(`
//             <tr class="grand-total-row">
//                 <td>GRAND TOTAL</td>
//                 <td>${formatNumber(grand_budget)}</td>
//                 <td>${formatNumber(grand_actuals)}</td>
//                 <td>${grandPer} %</td>
//                 <td>${formatNumber(grand_total)}</td>
//             </tr>
//         `);

//         $table.append($tbody);

//         $('.expense-head').off('click').on('click', function () {
//             const name = $(this).data('head');

//             expandedHeads = expandedHeads.includes(name)
//                 ? expandedHeads.filter(x => x !== name)
//                 : [...expandedHeads, name];

//             renderTable();
//         });

//         $('.sub-head').off('click').on('click', function () {
//             const key = $(this).data('sub');

//             expandedSubHeads = expandedSubHeads.includes(key)
//                 ? expandedSubHeads.filter(x => x !== key)
//                 : [...expandedSubHeads, key];

//             renderTable();
//         });
//     }

//     function renderCards(data){
//         const cards_container = $('#cards-container');
//         cards_container.empty();

//         let grand_budget = 0;
//         let grand_actual = 0;
//         let cards_html = "";

//         data.forEach(head => {
//             grand_budget += Number(head.ytd || 0);
//             grand_actual += Number(head.total_posted_amt_ytd || 0);
//         });

//         const grand_variance = grand_budget - grand_actual;

//         cards_html += createCard("Grand Total", grand_budget, grand_actual, grand_variance, true);

//         data.forEach(head => {
//             const headBudget = Number(head.ytd || 0);
//             const headActual = Number(head.total_posted_amt_ytd || 0);
//             const headVariance = headBudget - headActual;

//             cards_html += createCard(head.name, headBudget, headActual, headVariance);

//             (head.sub_heads || []).forEach(sub => {
//                 const subBudget = Number(sub.ytd || 0);
//                 const subActual = Number(sub.total_posted_amt_ytd || 0);
//                 const subVariance = subBudget - subActual;

//                 cards_html += createCard(sub.name, subBudget, subActual, subVariance, false, true);
//             });
//         });

//         cards_container.append(cards_html);
//     }

//     function createCard(title, budget, actual, variance, isGrand = false, isSub = false){
//         const utilization = budget > 0 
//             ? ((actual / budget) * 100).toFixed(2) 
//             : "0.00";

//         return `
//             <div class="number-card ${isGrand ? 'grand' : ''} ${isSub ? 'sub' : ''}">
//                 <div class="number-title">${title}</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${formatNumber(budget)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${formatNumber(actual)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${formatNumber(variance)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value">${utilization} %</div>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }
// };















// frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {
//     const style = `
//     <style>
//     #tables-container { 
//         margin: 20px; 
//         background-color: #ffffff; 
//         border-radius: 8px; 
//         padding: 8px; 
//     }

//     #controls-row {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 12px;
//         padding: 6px 10px;
//         background: #f7f9fb;
//         border: 1px solid #dcdcdc;
//         border-radius: 6px;
//     }

//     #global-search-box { 
//         width: 280px; 
//         padding: 7px 12px; 
//         border: 1px solid #aaa; 
//         border-radius: 6px; 
//         font-size: 13px;
//     }

//     /* ── Expand-All checkbox ── */
//     #expand-all-wrapper {
//         display: flex;
//         align-items: center;
//         gap: 7px;
//         font-size: 13px;
//         font-weight: 600;
//         color: #444;
//         cursor: pointer;
//         user-select: none;
//     }

//     #expand-all-checkbox {
//         width: 16px;
//         height: 16px;
//         accent-color: #0076B6;
//         cursor: pointer;
//     }

//     /* ── Export button – Frappe primary style ── */
//     #export-excel-btn {
//         display: inline-flex;
//         align-items: center;
//         gap: 6px;
//         padding: 6px 14px;
//         font-size: 13px;
//         font-weight: 600;
//         color: #fff !important;
//         background-color: #0076B6;
//         border: 1px solid #0076B6;
//         border-radius: 6px;
//         cursor: pointer;
//         transition: background .15s ease, box-shadow .15s ease;
//         white-space: nowrap;
//         line-height: 1.5;
//         box-shadow: 0 1px 3px rgba(0,0,0,.12);
//         text-decoration: none;
//     }

//     #export-excel-btn:hover {
//         background-color: #005f94;
//         border-color: #005f94;
//         box-shadow: 0 3px 8px rgba(0,118,182,.35);
//     }

//     #export-excel-btn:active {
//         background-color: #004f7a;
//         border-color: #004f7a;
//         box-shadow: none;
//     }

//     .scroll-wrapper { 
//         border: 1px solid #ccc; 
//         border-radius: 6px; 
//         overflow-x: auto; 
//         overflow-y: auto; 
//         max-height: 70vh; 
//         background: #fff; 
//     }

//     table.university-table { 
//         min-width: 1200px; 
//         width: 100%; 
//         border-collapse: collapse; 
//         font-size: 13px; 
//     }

//     table.university-table th, 
//     table.university-table td {
//         border: 1px solid #ddd;
//         padding: 8px 10px;
//         white-space: nowrap;
//         vertical-align: middle;
//         text-align: center;
//         background:#fff !important;
//     }

//     table.university-table th:first-child,
//     table.university-table td:first-child { 
//         text-align: left !important; 
//     }

//     table.university-table thead tr.main-row th { 
//         background-color: #0076B6 !important; 
//         color: #fff !important; 
//         position: sticky; 
//         top: 0; 
//         z-index: 25; 
//     }

//     tr.expense-head { 
//         font-weight: 700; 
//         cursor: pointer; 
//     }

//     tr.expense-head:hover td {
//         background: #F4F9FD !important;
//     }

//     tr.sub-head { 
//         background-color: #FFF3E6 !important;
//         font-weight: 600; 
//         cursor: pointer;
//     }

//     tr.sub-head:hover td {
//         background-color: #FFEAD5 !important;
//     }

//     tr.line-item td:first-child { 
//         padding-left: 35px !important; 
//     }

//     tr.sub-head td:first-child { 
//         padding-left: 20px !important; 
//     }

//     .text-blue { 
//         color: #0076B6; 
//         font-weight: 600; 
//     }

//     tr.grand-total-row td {
//         background:#003B63 !important;
//         color:#fff !important;
//         font-weight:700 !important;
//     }

//     .card-row{
//         display:grid;
//         grid-template-columns: repeat(4, 1fr);
//         gap:14px;
//         margin:14px 20px;
//     }

//     .number-card{
//         background:#ffffff;
//         border:1px solid #dcdcdc;
//         border-radius:8px;
//         padding:14px 16px;
//         box-shadow:0 2px 6px rgba(0,0,0,.06);
//         transition:.15s ease;
//     }

//     .number-card:hover{
//         transform:translateY(-2px);
//         box-shadow:0 6px 14px rgba(0,0,0,.12);
//     }

//     .number-title{
//         font-size:12px;
//         font-weight:600;
//         color:#666;
//         text-transform:uppercase;
//         margin-bottom:6px;
//     }

//     .number-value{
//         font-size:20px;
//         font-weight:700;
//         color:#0076B6;
//     }

//     .number-card.grand{
//         border:2px solid #0076B6;
//         background:#F4F9FD;
//     }

//     .number-card.grand .number-value{
//         font-size:24px;
//         font-weight:800;
//     }
//     </style>
//     `;

//     $('head').append(style);

//     if (!$("#global-loader").length) {
//         $("body").append(`
//             <div id="global-loader" class="loader-overlay">
//                 <div class="loader-box">
//                     <img src="/files/apf.png" class="loader-logo">
//                     <div class="loader-text">Loading, please wait…</div>
//                 </div>
//             </div>
//         `);
//     }

//     /* Always hide on page load */
//     $("#global-loader").hide();

//     const Loader = {
//         show(message = "Loading, please wait…") {
//             const loader = $("#global-loader");
//             if (!loader.length) return;

//             loader.find(".loader-text").text(message);
//             loader.fadeIn(200);
//         },

//         hide() {
//             const loader = $("#global-loader");
//             if (!loader.length) return;

//             loader.fadeOut(200);
//         }
//     };

//     /* =====================================================
//        PAGE
//     =====================================================*/
//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget vs Actuals Face Sheet',
//         single_column: true
//     });

//     /* ------------------------------------------------
//        FILTER SECTION
//     --------------------------------------------------*/
//     let filter_section = $(`
//         <div class="frappe-control-group row custom-filter-row"></div>
//     `).appendTo(page.body);

//     $(`<style>
//         .custom-filter-row {
//             padding: 15px 20px;
//             background: #fff;
//             border-radius: 6px;
//             margin-top: 10px;
//         }
//         .custom-filter-row.row {
//             margin-left: 0;
//             margin-right: 0;
//         }
//         .custom-filter-row .col-md-4,
//         .custom-filter-row .col-sm-12 {
//             padding-left: 8px;
//             padding-right: 8px;
//         }
                
//         /* Full screen overlay – soft light black glass look */
//         #global-loader.loader-overlay {
//             position: fixed;
//             inset: 0;
//             width: 100vw;
//             height: 100vh;
//             background: rgba(18, 18, 18, 0.92);
//             backdrop-filter: blur(6px);
//             display: none;
//             z-index: 999999;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//         }

//         .loader-box {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             gap: 14px;
//         }

//         .loader-logo {
//             width: 90px;
//             height: 90px;
//             border-radius: 50%;
//             background: linear-gradient(145deg, #ffffff, #eaeaea);
//             padding: 14px;
//             object-fit: contain;
//             box-shadow: 
//                 0 10px 30px rgba(0, 0, 0, 0.35),
//                 0 0 0 4px rgba(255, 255, 255, 0.08);
//             animation: pulse 1.6s infinite ease-in-out;
//         }

//         .loader-text {
//             margin-top: 6px;
//             font-size: 14px;
//             color: #ffffff;
//             font-weight: 600;
//             letter-spacing: 0.5px;
//             text-align: center;
//             opacity: 0.85;
//         }

//         .loader-text::after {
//             content: "";
//             display: inline-block;
//             width: 1em;
//             animation: dots 1.5s infinite;
//         }

//         @keyframes pulse {
//             0% {
//                 transform: scale(1);
//                 opacity: 0.8;
//                 box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
//             }
//             50% {
//                 transform: scale(1.08);
//                 opacity: 1;
//                 box-shadow: 0 0 20px 8px rgba(255, 255, 255, 0.15);
//             }
//             100% {
//                 transform: scale(1);
//                 opacity: 0.8;
//                 box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
//             }
//         }

//         @keyframes dots {
//             0%   { content: ""; }	
//             33%  { content: "."; }
//             66%  { content: ".."; }
//             100% { content: "..."; }
//         }

//         .kpi-row,
//         .kpi-bottom{
//             display:flex;
//             justify-content:space-between;
//             margin-top:8px;
//         }

//         .kpi-block{
//             text-align:left;
//         }

//         .kpi-label{
//             font-size:11px;
//             color:#777;
//             text-transform:uppercase;
//         }

//         .kpi-value{
//             font-size:14px;
//             font-weight:700;
//             color:#000;
//         }

//         .kpi-bottom{
//             margin-top:10px;
//             padding-top:8px;
//             border-top:1px solid #eee;
//         }

//         .number-card.sub{
//             background:#fafafa;
//             border-left:4px solid #ccc;
//         }
//     </style>`).appendTo("head");

//     function make_field() {
//         return $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);
//     }

//     function mergeSelectedOptions(control, new_options) {
//         let selected = (control.get_value() || []).map(String);
//         let existing = control.df.options || [];
//         let map = {};

//         existing.forEach(o => map[String(o.value)] = o);
//         new_options.forEach(o => map[String(o.value)] = o);

//         selected.forEach(v => {
//             if (!map[v]) {
//                 map[v] = { label: v, value: v, description: "" };
//             }
//         });

//         return Object.values(map);
//     }

//     function add_select_all_button(multiselect_control) {
//         multiselect_control.$wrapper.on("click", function () {
//             setTimeout(() => {
//                 let dropdown = multiselect_control.$wrapper.find(".multiselect-list");

//                 if (!dropdown.length) return;

//                 if (dropdown.find(".select-all-btn").length) return;

//                 let select_all_btn = $(`
//                     <button type="button"
//                         class="btn btn-xs btn-default select-all-btn"
//                         style="margin-right: 5px;">
//                         Select All
//                     </button>
//                 `);

//                 select_all_btn.on("click", async function (e) {
//                     e.stopPropagation();

//                     let values = [];

//                     if (multiselect_control.get_data) {
//                         let data = await multiselect_control.get_data();
//                         values = data.map(d => String(d.value));
//                     }
//                     else if (multiselect_control.df.options) {
//                         values = multiselect_control.df.options.map(o => 
//                             typeof o === "object" ? String(o.value) : String(o)
//                         );
//                     }

//                     multiselect_control.set_value(values);
//                 });

//                 dropdown.find(".dropdown-footer").prepend(select_all_btn);
//             }, 200);
//         });
//     }

//     /* ------------------------------------------------
//        FINANCIAL YEAR
//     --------------------------------------------------*/
//     let fy_col = make_field();
//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: fy_col,
//         df: {
//             label: "Financial Year",
//             fieldtype: "Select",
//             fieldname: "financial_year",
//             options: ["2025-26", "2026-27"].join("\n"),
//             default: "2025-26",
//             reqd: 1,
//             change() {
//                 loadData();
//             }
//         },
//         render_input: true
//     });

//     let month_col = make_field();
//     let currentMonth = new Date().toLocaleString('default', { month: 'long' });

//     let month_filter = frappe.ui.form.make_control({
//         parent: month_col,
//         df: {
//             label: "YTD Month",
//             fieldtype: "Select",
//             fieldname: "month",
//             options: [
//                 "January",
//                 "February",
//                 "March",
//                 "April",
//                 "May",
//                 "June",
//                 "July",
//                 "August",
//                 "September",
//                 "October",
//                 "November",
//                 "December"
//             ].join("\n"),
//             reqd: 1,
//             change() {
//                 loadData();
//             }
//         },
//         render_input: true
//     });

//     month_filter.set_value(currentMonth);

//     /* ------------------------------------------------
//        UNIT (MULTI SELECT)
//     --------------------------------------------------*/
//     let unit_col = make_field();
//     let unit_filter = frappe.ui.form.make_control({
//         parent: unit_col,
//         df: {
//             label: "Unit",
//             fieldtype: "MultiSelectList",
//             fieldname: "unit",
//             reqd: 1,
//             get_data() {
//                 return frappe.call({
//                     method: "annual_budget.api.filter_options.get_units"
//                 }).then(r => {
//                     return (r.message?.data || [])
//                         .filter(d => d.value)
//                         .map(d => ({
//                             label: d.label,
//                             value: String(d.value),
//                             description: ""
//                         }));
//                 });
//             },
//             change() {
//                 units = unit_filter.get_value().map(String);
//                 cost_center_filter.set_value([]);
//                 location_code_filter.df.options = [];
//                 location_code_filter.refresh();
//                 cost_center_filter.df.options = [];
//                 cost_center_filter.refresh();
//                 if (units.length) {
//                     loadCostCenters(units);
//                     loadLocationCodes(units);
//                 }
//             }
//         },
//         render_input: true
//     });
//     add_select_all_button(unit_filter);

//     /* ------------------------------------------------
//        COST CENTER (MULTI SELECT)
//     --------------------------------------------------*/
//     let cc_col = make_field();
//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: cc_col,
//         df: {
//             label: "Cost Center",
//             fieldtype: "MultiSelectList",
//             fieldname: "cost_center",
//             options: [],
//             change() {
//                 // loadData();
//             }
//         },
//         render_input: true
//     });
//     add_select_all_button(cost_center_filter);

//     /* ------------------------------------------------
//        LOCATION CODE (MULTI SELECT)
//     --------------------------------------------------*/
//     let lc_col = make_field();
//     let location_code_filter = frappe.ui.form.make_control({
//         parent: lc_col,
//         df: {
//             label: "Location Code",
//             fieldtype: "MultiSelectList",
//             fieldname: "location_code",
//             options: [],
//             change() {
//                 // loadData();
//             }
//         },
//         render_input: true
//     });
//     add_select_all_button(location_code_filter);

//     let btn_col = make_field();

//     let load_button = frappe.ui.form.make_control({
//         parent: btn_col,
//         df: {
//             label: " ",
//             fieldtype: "Button",
//             fieldname: "load_button",
//             click() {
//                 loadData();
//             }
//         },
//         render_input: true
//     });

//     load_button.$wrapper.find('button').addClass("btn-primary");
//     load_button.$wrapper.find('button').text("Get Report");
//     load_button.$wrapper.css("margin-top", "26px");

//     /* ------------------------------------------------
//        LOAD COST CENTERS
//     --------------------------------------------------*/
//     function loadCostCenters(units) {
//         cost_center_filter.set_value([]);

//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 let api_options = (r.message?.data || [])
//                     .filter(d => d.value)
//                     .map(d => ({
//                         label: d.label,
//                         value: String(d.value),
//                         description: "",
//                         erp_cost_center_value: String(d.erp_cost_center_value)
//                     }));

//                 cost_center_filter.df.options =
//                     mergeSelectedOptions(cost_center_filter, api_options);

//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     /* ------------------------------------------------
//        LOAD LOCATION CODES
//     --------------------------------------------------*/
//     function loadLocationCodes(units) {
//         location_code_filter.set_value([]);

//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 let api_options = (r.message?.data || [])
//                     .filter(d => d.value)
//                     .map(d => ({
//                         label: d.label,
//                         value: String(d.value),
//                         description: "",
//                         erp_loc_value: String(d.erp_loc_value)
//                     }));

//                 location_code_filter.df.options =
//                     mergeSelectedOptions(location_code_filter, api_options);

//                 location_code_filter.refresh();
//             }
//         });
//     }

//     frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", function () {
//         console.log("XLSX Loaded");
//     });

//     const container = $(`
//         <div id="tables-container">
//             <div class="card-row" id="cards-container"></div>
//             <div id="controls-row">
//                 <input id="global-search-box" type="text"
//                     placeholder="Search Expense / Sub Head / Item...">
//                 <div style="display:flex; align-items:center; gap:14px;">
//                     <label id="expand-all-wrapper">
//                         <input type="checkbox" id="expand-all-checkbox">
//                         Expand All
//                     </label>
//                     <button id="export-excel-btn">&#8595; Export to Excel</button>
//                 </div>
//             </div>
//             <div class="scroll-wrapper">
//                 <table class="university-table" id="phase-table"></table>
//             </div>
//         </div>
//     `);

//     $(page.body).append(container);

//     /* ------------------------------------------------
//        EXPAND ALL CHECKBOX
//     --------------------------------------------------*/
//     $(document).on('change', '#expand-all-checkbox', function () {
//         const isChecked = $(this).is(':checked');

//         if (isChecked) {
//             // Expand every head
//             expandedHeads = expense_heads.map(h => h.name);

//             // Expand every sub-head
//             expandedSubHeads = [];
//             expense_heads.forEach(head => {
//                 (head.sub_heads || []).forEach(sub => {
//                     expandedSubHeads.push(head.name + "__" + sub.name);
//                 });
//             });
//         } else {
//             // Collapse everything
//             expandedHeads = [];
//             expandedSubHeads = [];
//         }

//         renderTable();
//     });

//     /* ------------------------------------------------
//        EXPORT TO EXCEL
//     --------------------------------------------------*/
//     $(document).on('click', '#export-excel-btn', function () {
//         exportTableToExcel();
//     });

//     function exportTableToExcel() {
//         if (typeof XLSX === "undefined") {
//             frappe.msgprint("Excel library not loaded.");
//             return;
//         }

//         let data = [];

//         data.push([
//             "Expense Items",
//             "Budget",
//             "Actuals",
//             "Util %",
//             "Variance"
//         ]);

//         let grand_budget = 0;
//         let grand_actuals = 0;

//         expense_heads.forEach(head => {
//             const headBudget = Number(head.ytd || 0);
//             const headActual = Number(head.total_posted_amt_ytd || 0);
//             const headVariance = headBudget - headActual;
//             const headPer = safePercentage(headBudget, headActual);

//             grand_budget += headBudget;
//             grand_actuals += headActual;

//             data.push([
//                 head.name,
//                 headBudget,
//                 headActual,
//                 headPer,
//                 headVariance
//             ]);

//             (head.sub_heads || []).forEach(sub => {
//                 const subBudget = Number(sub.ytd || 0);
//                 const subActual = Number(sub.total_posted_amt_ytd || 0);
//                 const subVariance = subBudget - subActual;
//                 const subPer = safePercentage(subBudget, subActual);

//                 data.push([
//                     "   " + sub.name,
//                     subBudget,
//                     subActual,
//                     subPer,
//                     subVariance
//                 ]);

//                 (sub.items || []).forEach(item => {
//                     const budget = Number(item.ytd || 0);
//                     const actual = Number(item.total_posted_amt || 0);
//                     const variance = budget - actual;
//                     const per = safePercentage(budget, actual);

//                     data.push([
//                         "      " + item.name,
//                         budget,
//                         actual,
//                         per,
//                         variance
//                     ]);
//                 });
//             });

//             (head.items || []).forEach(item => {
//                 const budget = Number(item.ytd || 0);
//                 const actual = Number(item.total_posted_amt || 0);
//                 const variance = budget - actual;
//                 const per = safePercentage(budget, actual);

//                 data.push([
//                     "   " + item.name,
//                     budget,
//                     actual,
//                     per,
//                     variance
//                 ]);
//             });
//         });

//         const grandVariance = grand_budget - grand_actuals;
//         const grandPer = safePercentage(grand_budget, grand_actuals);

//         data.push([
//             "GRAND TOTAL",
//             grand_budget,
//             grand_actuals,
//             grandPer,
//             grandVariance
//         ]);

//         const ws = XLSX.utils.aoa_to_sheet(data);

//         ws["!cols"] = [
//             { wch: 40 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 10 },
//             { wch: 15 }
//         ];

//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Expense Report");

//         XLSX.writeFile(wb, "Expense_Report.xlsx");
//     }

//     /* =====================================================
//        STATE
//     =====================================================*/
//     let expense_heads = [];
//     let expandedHeads = [];
//     let expandedSubHeads = [];
//     let searchText = "";

//     const formatNumber = n =>
//         (Number(n) || 0).toLocaleString('en-IN', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });

//     function matchesSearch(...values) {
//         return values.some(v =>
//             String(v || "").toLowerCase().includes(searchText.toLowerCase())
//         );
//     }

//     /* ------------------------------------------------
//        GLOBAL SEARCH  (bound directly after container append)
//     --------------------------------------------------*/
//     container.find('#global-search-box').on('input keyup', function () {
//         searchText = $(this).val().trim();

//         // Auto-expand all heads & sub-heads when searching so results are visible
//         if (searchText) {
//             expandedHeads = expense_heads.map(h => h.name);
//             expandedSubHeads = [];
//             expense_heads.forEach(head => {
//                 (head.sub_heads || []).forEach(sub => {
//                     expandedSubHeads.push(head.name + "__" + sub.name);
//                 });
//             });
//         } else {
//             // Restore collapsed state when search is cleared
//             expandedHeads = [];
//             expandedSubHeads = [];
//             $('#expand-all-checkbox').prop('checked', false);
//         }

//         renderTable();
//     });

//     /* ------------------------------------------------
//        HELPER — GET SELECTED WITH EXTRA KEY
//     --------------------------------------------------*/
//     function getSelectedWithKey(control, key) {
//         if (!control || !control.get_value) return [];
//         return (control.get_value() || [])
//             .map(val => {
//                 let option = (control.df?.options || []).find(
//                     o => String(o?.value) === String(val)
//                 );
//                 return option?.[key] || null;
//             })
//             .filter(Boolean);
//     }

//     function loadData() {
//         let financial_year = fiscal_year_filter.get_value();
//         let month = month_filter.get_value();

//         let unit = (unit_filter.get_value() || []).join(",") || null;
//         let location_code = (getSelectedWithKey(location_code_filter, "value") || []).join(",") || null;
//         let cost_center = (getSelectedWithKey(cost_center_filter, "value") || []).join(",") || null;
//         let erp_cost_center_value = (getSelectedWithKey(cost_center_filter, "erp_cost_center_value") || []).join(",") || null;
//         let erp_loc_value = (getSelectedWithKey(location_code_filter, "erp_loc_value") || []).join(",") || null;

//         console.log(erp_cost_center_value, "erp_cost_center_value");
//         console.log(cost_center, "cost_center_value");
//         console.log(location_code, "loc_value");

//         let missing = [];
//         if (!financial_year) missing.push("Financial Year");
//         if (!month) missing.push("Month");
//         if (!unit) missing.push("Unit");

//         if (missing.length) {
//             console.warn("⚠ Missing Filters:", missing.join(", "));
//             return;
//         }

//         Loader.show("We're crafting your report with care");

//         // Reset checkbox & expanded state on fresh load
//         $('#expand-all-checkbox').prop('checked', false);
//         expandedHeads = [];
//         expandedSubHeads = [];

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_combined_actuals",
//             args: {
//                 financial_year,
//                 month,
//                 unit,
//                 cost_center,
//                 location_code,
//                 erp_loc_value,
//                 erp_cost_center_value,
//             }
//         })
//         .done(function(r) {
//             expense_heads = Array.isArray(r.message)
//                 ? r.message
//                 : (r.message?.message || []);

//             console.log(r, "API response");
//             renderTable();
//         })
//         .fail(function(err) {
//             console.error("API Error:", err);
//             frappe.msgprint({
//                 title: "Error",
//                 message: "Failed to load data. Please try again.",
//                 indicator: "red"
//             });
//         })
//         .always(function() {
//             Loader.hide();
//         });
//     }

//     function safePercentage(budget, actual) {
//         if (!budget || budget === 0) return "0.00";
//         return ((actual / budget) * 100).toFixed(2);
//     }

//     function renderTable() {
//         renderCards(expense_heads);

//         const $table = $('#phase-table');
//         $table.html('');

//         if (!expense_heads || !expense_heads.length) {
//             $table.append(`<tr><td colspan="5">No Data Found</td></tr>`);
//             return;
//         }

//         $table.append(`
//             <thead>
//                 <tr class="main-row">
//                     <th>Expense Head</th>
//                     <th>Budget</th>
//                     <th>Actuals</th>
//                     <th>Util %</th>
//                     <th>Variance</th>
//                 </tr>
//             </thead>
//         `);

//         const $tbody = $('<tbody></tbody>');

//         let grand_budget = 0;
//         let grand_actuals = 0;

//         expense_heads.forEach(head => {
//             if (
//                 searchText &&
//                 !matchesSearch(head.name) &&
//                 !(head.items || []).some(i => matchesSearch(i.name)) &&
//                 !(head.sub_heads || []).some(s =>
//                     matchesSearch(s.name) ||
//                     (s.items || []).some(i => matchesSearch(i.name))
//                 )
//             ) return;

//             const headBudget = Number(head.ytd || 0);
//             const headActual = Number(head.total_posted_amt_ytd || 0);
//             const headTotal = headBudget - headActual;
//             const headPer = safePercentage(headBudget, headActual);

//             grand_budget += headBudget;
//             grand_actuals += headActual;

//             $tbody.append(`
//                 <tr class="expense-head" data-head="${head.name}">
//                     <td>
//                         ${(head.items?.length || head.sub_heads?.length)
//                             ? (expandedHeads.includes(head.name) ? '▼' : '▶')
//                             : ''
//                         }
//                         ${head.name}
//                     </td>
//                     <td>${formatNumber(headBudget)}</td>
//                     <td>${formatNumber(headActual)}</td>
//                     <td class="text-blue">${headPer} %</td>
//                     <td class="text-blue">${formatNumber(headTotal)}</td>
//                 </tr>
//             `);

//             if (expandedHeads.includes(head.name)) {
//                 (head.items || []).forEach(item => {
//                     if (searchText && !matchesSearch(item.name)) return;

//                     const budget = Number(item.ytd || 0);
//                     const actual = Number(item.total_posted_amt || 0);
//                     const total = budget - actual;
//                     const total_per = safePercentage(budget, actual);

//                     $tbody.append(`
//                         <tr class="line-item">
//                             <td style="padding-left:35px">${item.name}</td>
//                             <td>${formatNumber(budget)}</td>
//                             <td>${formatNumber(actual)}</td>
//                             <td>${total_per} %</td>
//                             <td>${formatNumber(total)}</td>
//                         </tr>
//                     `);
//                 });

//                 (head.sub_heads || []).forEach(sub => {
//                     const key = head.name + "__" + sub.name;

//                     const subBudget = Number(sub.ytd || 0);
//                     const subActual = Number(sub.total_posted_amt_ytd || 0);
//                     const subTotal = subBudget - subActual;
//                     const subTotal_per = safePercentage(subBudget, subActual);

//                     $tbody.append(`
//                         <tr class="sub-head" data-sub="${key}">
//                             <td style="padding-left:20px">
//                                 ${(sub.items?.length)
//                                     ? (expandedSubHeads.includes(key) ? '▼' : '▶')
//                                     : ''
//                                 }
//                                 ${sub.name}
//                             </td>
//                             <td>${formatNumber(subBudget)}</td>
//                             <td>${formatNumber(subActual)}</td>
//                             <td class="text-blue">${subTotal_per} %</td>
//                             <td class="text-blue">${formatNumber(subTotal)}</td>
//                         </tr>
//                     `);

//                     if (expandedSubHeads.includes(key)) {
//                         (sub.items || []).forEach(item => {
//                             const budget = Number(item.ytd || 0);
//                             const actual = Number(item.total_posted_amt || 0);
//                             const total = budget - actual;
//                             const total_per1 = safePercentage(budget, actual);

//                             $tbody.append(`
//                                 <tr class="line-item">
//                                     <td style="padding-left:55px">${item.name}</td>
//                                     <td>${formatNumber(budget)}</td>
//                                     <td>${formatNumber(actual)}</td>
//                                     <td>${total_per1} %</td>
//                                     <td>${formatNumber(total)}</td>
//                                 </tr>
//                             `);
//                         });
//                     }
//                 });
//             }
//         });

//         const grand_total = grand_budget - grand_actuals;
//         const grandPer = safePercentage(grand_budget, grand_actuals);

//         $tbody.append(`
//             <tr class="grand-total-row">
//                 <td>GRAND TOTAL</td>
//                 <td>${formatNumber(grand_budget)}</td>
//                 <td>${formatNumber(grand_actuals)}</td>
//                 <td>${grandPer} %</td>
//                 <td>${formatNumber(grand_total)}</td>
//             </tr>
//         `);

//         $table.append($tbody);

//         /* ── keep checkbox in sync when user manually clicks individual rows ── */
//         const allHeads = expense_heads.map(h => h.name);
//         const allSubKeys = [];
//         expense_heads.forEach(h => {
//             (h.sub_heads || []).forEach(s => {
//                 allSubKeys.push(h.name + "__" + s.name);
//             });
//         });

//         const allExpanded =
//             allHeads.every(n => expandedHeads.includes(n)) &&
//             allSubKeys.every(k => expandedSubHeads.includes(k));

//         $('#expand-all-checkbox').prop('checked', allExpanded);

//         $('.expense-head').off('click').on('click', function () {
//             const name = $(this).data('head');

//             expandedHeads = expandedHeads.includes(name)
//                 ? expandedHeads.filter(x => x !== name)
//                 : [...expandedHeads, name];

//             renderTable();
//         });

//         $('.sub-head').off('click').on('click', function () {
//             const key = $(this).data('sub');

//             expandedSubHeads = expandedSubHeads.includes(key)
//                 ? expandedSubHeads.filter(x => x !== key)
//                 : [...expandedSubHeads, key];

//             renderTable();
//         });
//     }

//     function renderCards(data){
//         const cards_container = $('#cards-container');
//         cards_container.empty();

//         let grand_budget = 0;
//         let grand_actual = 0;
//         let cards_html = "";

//         data.forEach(head => {
//             grand_budget += Number(head.ytd || 0);
//             grand_actual += Number(head.total_posted_amt_ytd || 0);
//         });

//         const grand_variance = grand_budget - grand_actual;

//         cards_html += createCard("Grand Total", grand_budget, grand_actual, grand_variance, true);

//         data.forEach(head => {
//             const headBudget = Number(head.ytd || 0);
//             const headActual = Number(head.total_posted_amt_ytd || 0);
//             const headVariance = headBudget - headActual;

//             cards_html += createCard(head.name, headBudget, headActual, headVariance);

//             (head.sub_heads || []).forEach(sub => {
//                 const subBudget = Number(sub.ytd || 0);
//                 const subActual = Number(sub.total_posted_amt_ytd || 0);
//                 const subVariance = subBudget - subActual;

//                 cards_html += createCard(sub.name, subBudget, subActual, subVariance, false, true);
//             });
//         });

//         cards_container.append(cards_html);
//     }

//     function createCard(title, budget, actual, variance, isGrand = false, isSub = false){
//         const utilization = budget > 0 
//             ? ((actual / budget) * 100).toFixed(2) 
//             : "0.00";

//         return `
//             <div class="number-card ${isGrand ? 'grand' : ''} ${isSub ? 'sub' : ''}">
//                 <div class="number-title">${title}</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${formatNumber(budget)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${formatNumber(actual)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${formatNumber(variance)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value">${utilization} %</div>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }
// };



// frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {
//     const style = `
//     <style>

//     /* ══════════════════════════════════════════
//        BASE / DESKTOP
//     ══════════════════════════════════════════ */

//     #tables-container {
//         margin: 20px;
//         background-color: #ffffff;
//         border-radius: 8px;
//         padding: 8px;
//     }

//     /* ── Controls row ── */
//     #controls-row {
//         display: flex;
//         flex-wrap: wrap;
//         justify-content: space-between;
//         align-items: center;
//         gap: 8px;
//         margin-bottom: 12px;
//         padding: 8px 10px;
//         background: #f7f9fb;
//         border: 1px solid #dcdcdc;
//         border-radius: 6px;
//     }

//     #global-search-box {
//         flex: 1 1 200px;
//         min-width: 0;
//         max-width: 320px;
//         padding: 7px 12px;
//         border: 1px solid #aaa;
//         border-radius: 6px;
//         font-size: 13px;
//         box-sizing: border-box;
//     }

//     #controls-right {
//         display: flex;
//         flex-wrap: wrap;
//         align-items: center;
//         gap: 12px;
//     }

//     /* ── Expand-All checkbox ── */
//     #expand-all-wrapper {
//         display: flex;
//         align-items: center;
//         gap: 7px;
//         font-size: 13px;
//         font-weight: 600;
//         color: #444;
//         cursor: pointer;
//         user-select: none;
//         white-space: nowrap;
//     }

//     #expand-all-checkbox {
//         width: 16px;
//         height: 16px;
//         accent-color: #0076B6;
//         cursor: pointer;
//     }

//     /* ── Export button – Frappe primary style ── */
//     #export-excel-btn {
//         display: inline-flex;
//         align-items: center;
//         gap: 6px;
//         padding: 6px 14px;
//         font-size: 13px;
//         font-weight: 600;
//         color: #fff !important;
//         background-color: #0076B6;
//         border: 1px solid #0076B6;
//         border-radius: 6px;
//         cursor: pointer;
//         transition: background .15s ease, box-shadow .15s ease;
//         white-space: nowrap;
//         line-height: 1.5;
//         box-shadow: 0 1px 3px rgba(0,0,0,.12);
//         text-decoration: none;
//     }

//     #export-excel-btn:hover {
//         background-color: #005f94;
//         border-color: #005f94;
//         box-shadow: 0 3px 8px rgba(0,118,182,.35);
//     }

//     #export-excel-btn:active {
//         background-color: #004f7a;
//         border-color: #004f7a;
//         box-shadow: none;
//     }

//     /* ── Table wrapper ── */
//     .scroll-wrapper {
//         border: 1px solid #ccc;
//         border-radius: 6px;
//         overflow-x: auto;
//         overflow-y: auto;
//         max-height: 70vh;
//         background: #fff;
//         -webkit-overflow-scrolling: touch;
//     }

//     table.university-table {
//         min-width: 700px;
//         width: 100%;
//         border-collapse: collapse;
//         font-size: 13px;
//     }

//     table.university-table th,
//     table.university-table td {
//         border: 1px solid #ddd;
//         padding: 8px 10px;
//         white-space: nowrap;
//         vertical-align: middle;
//         text-align: center;
//         background: #fff !important;
//     }

//     table.university-table th:first-child,
//     table.university-table td:first-child {
//         text-align: left !important;
//     }

//     table.university-table thead tr.main-row th {
//         background-color: #0076B6 !important;
//         color: #fff !important;
//         position: sticky;
//         top: 0;
//         z-index: 25;
//     }

//     tr.expense-head {
//         font-weight: 700;
//         cursor: pointer;
//     }

//     tr.expense-head:hover td {
//         background: #F4F9FD !important;
//     }

//     tr.sub-head {
//         background-color: #FFF3E6 !important;
//         font-weight: 600;
//         cursor: pointer;
//     }

//     tr.sub-head:hover td {
//         background-color: #FFEAD5 !important;
//     }

//     tr.line-item td:first-child {
//         padding-left: 35px !important;
//     }

//     tr.sub-head td:first-child {
//         padding-left: 20px !important;
//     }

//     .text-blue {
//         color: #0076B6;
//         font-weight: 600;
//     }

//     tr.grand-total-row td {
//         background: #003B63 !important;
//         color: #fff !important;
//         font-weight: 700 !important;
//     }

//     /* ── Cards ── */
//     .card-row {
//         display: grid;
//         grid-template-columns: repeat(4, 1fr);
//         gap: 14px;
//         margin: 14px 20px;
//     }

//     .number-card {
//         background: #ffffff;
//         border: 1px solid #dcdcdc;
//         border-radius: 8px;
//         padding: 14px 16px;
//         box-shadow: 0 2px 6px rgba(0,0,0,.06);
//         transition: .15s ease;
//     }

//     .number-card:hover {
//         transform: translateY(-2px);
//         box-shadow: 0 6px 14px rgba(0,0,0,.12);
//     }

//     .number-title {
//         font-size: 12px;
//         font-weight: 600;
//         color: #666;
//         text-transform: uppercase;
//         margin-bottom: 6px;
//     }

//     .number-value {
//         font-size: 20px;
//         font-weight: 700;
//         color: #0076B6;
//     }

//     .number-card.grand {
//         border: 2px solid #0076B6;
//         background: #F4F9FD;
//     }

//     .number-card.grand .number-value {
//         font-size: 24px;
//         font-weight: 800;
//     }

//     /* ══════════════════════════════════════════
//        TABLET  ≤ 1024px  →  2-col cards
//     ══════════════════════════════════════════ */
//     @media (max-width: 1024px) {
//         .card-row {
//             grid-template-columns: repeat(2, 1fr);
//         }
//         #global-search-box {
//             max-width: 100%;
//         }
//     }

//     /* ══════════════════════════════════════════
//        MOBILE  ≤ 600px  →  single column
//     ══════════════════════════════════════════ */
//     @media (max-width: 600px) {
//         #tables-container {
//             margin: 8px;
//             padding: 6px;
//         }
//         #controls-row {
//             flex-direction: column;
//             align-items: stretch;
//             gap: 8px;
//             padding: 8px;
//         }
//         #global-search-box {
//             max-width: 100%;
//             width: 100%;
//         }
//         #controls-right {
//             justify-content: space-between;
//             width: 100%;
//         }
//         #export-excel-btn {
//             flex: 1;
//             justify-content: center;
//         }
//         .card-row {
//             grid-template-columns: 1fr;
//             margin: 8px;
//             gap: 10px;
//         }
//         .number-card.grand .number-value {
//             font-size: 20px;
//         }
//         table.university-table {
//             font-size: 12px;
//         }
//         table.university-table th,
//         table.university-table td {
//             padding: 6px 8px;
//         }
//         tr.line-item td:first-child {
//             padding-left: 20px !important;
//         }
//         tr.sub-head td:first-child {
//             padding-left: 14px !important;
//         }
//     }

//     </style>
//     `;

//     $('head').append(style);

//     if (!$("#global-loader").length) {
//         $("body").append(`
//             <div id="global-loader" class="loader-overlay">
//                 <div class="loader-box">
//                     <img src="/files/APF logo.png" class="loader-logo">
//                     <div class="loader-text">Loading, please wait…</div>
//                 </div>
//             </div>
//         `);
//     }

//     $("#global-loader").hide();

//     const Loader = {
//         show(message = "Loading, please wait…") {
//             const loader = $("#global-loader");
//             if (!loader.length) return;
//             loader.find(".loader-text").text(message);
//             loader.fadeIn(200);
//         },
//         hide() {
//             const loader = $("#global-loader");
//             if (!loader.length) return;
//             loader.fadeOut(200);
//         }
//     };

//     /* =====================================================
//        PAGE
//     =====================================================*/
//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget vs Actuals Face Sheet',
//         single_column: true
//     });

//     /* ------------------------------------------------
//        FILTER SECTION
//     --------------------------------------------------*/
//     let filter_section = $(`
//         <div class="frappe-control-group row custom-filter-row"></div>
//     `).appendTo(page.body);

//     $(`<style>
//         .custom-filter-row {
//             padding: 15px 20px;
//             background: #fff;
//             border-radius: 6px;
//             margin-top: 10px;
//         }
//         .custom-filter-row.row {
//             margin-left: 0;
//             margin-right: 0;
//         }
//         .custom-filter-row .col-md-4,
//         .custom-filter-row .col-sm-12 {
//             padding-left: 8px;
//             padding-right: 8px;
//         }

//         /* Full screen loader overlay */
//         #global-loader.loader-overlay {
//             position: fixed;
//             inset: 0;
//             width: 100vw;
//             height: 100vh;
//             background: rgba(18, 18, 18, 0.92);
//             backdrop-filter: blur(6px);
//             display: none;
//             z-index: 999999;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//         }

//         .loader-box {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             gap: 14px;
//         }

//         .loader-logo {
//             width: 90px;
//             height: 90px;
//             border-radius: 50%;
//             background: linear-gradient(145deg, #ffffff, #eaeaea);
//             padding: 14px;
//             object-fit: contain;
//             box-shadow: 0 10px 30px rgba(0,0,0,.35), 0 0 0 4px rgba(255,255,255,.08);
//             animation: pulse 1.6s infinite ease-in-out;
//         }

//         .loader-text {
//             margin-top: 6px;
//             font-size: 14px;
//             color: #ffffff;
//             font-weight: 600;
//             letter-spacing: 0.5px;
//             text-align: center;
//             opacity: 0.85;
//         }

//         .loader-text::after {
//             content: "";
//             display: inline-block;
//             width: 1em;
//             animation: dots 1.5s infinite;
//         }

//         @keyframes pulse {
//             0%   { transform: scale(1);    opacity: 0.8; box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
//             50%  { transform: scale(1.08); opacity: 1;   box-shadow: 0 0 20px 8px rgba(255,255,255,0.15); }
//             100% { transform: scale(1);    opacity: 0.8; box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
//         }

//         @keyframes dots {
//             0%   { content: ""; }
//             33%  { content: "."; }
//             66%  { content: ".."; }
//             100% { content: "..."; }
//         }

//         .kpi-row,
//         .kpi-bottom {
//             display: flex;
//             justify-content: space-between;
//             margin-top: 8px;
//         }

//         .kpi-block { text-align: left; }

//         .kpi-label {
//             font-size: 11px;
//             color: #777;
//             text-transform: uppercase;
//         }

//         .kpi-value {
//             font-size: 14px;
//             font-weight: 700;
//             color: #000;
//         }

//         .kpi-bottom {
//             margin-top: 10px;
//             padding-top: 8px;
//             border-top: 1px solid #eee;
//         }

//         .number-card.sub {
//             background: #fafafa;
//             border-left: 4px solid #ccc;
//         }

//         /* Filter row responsive */
//         @media (max-width: 768px) {
//             .custom-filter-row { padding: 10px; }
//             .custom-filter-row .col-md-4 { width: 100%; margin-bottom: 8px; }
//         }
//     </style>`).appendTo("head");

//     // function make_field() {
//     //     return $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);
//     // }

//     // function mergeSelectedOptions(control, new_options) {
//     //     let selected = (control.get_value() || []).map(String);
//     //     let existing = control.df.options || [];
//     //     let map = {};
//     //     existing.forEach(o => map[String(o.value)] = o);
//     //     new_options.forEach(o => map[String(o.value)] = o);
//     //     selected.forEach(v => {
//     //         if (!map[v]) map[v] = { label: v, value: v, description: "" };
//     //     });
//     //     return Object.values(map);
//     // }

//     // function add_select_all_button(multiselect_control) {
//     //     multiselect_control.$wrapper.on("click", function () {
//     //         setTimeout(() => {
//     //             let dropdown = multiselect_control.$wrapper.find(".multiselect-list");
//     //             if (!dropdown.length) return;
//     //             if (dropdown.find(".select-all-btn").length) return;

//     //             let select_all_btn = $(`
//     //                 <button type="button" class="btn btn-xs btn-default select-all-btn"
//     //                     style="margin-right:5px;">Select All</button>
//     //             `);

//     //             select_all_btn.on("click", async function (e) {
//     //                 e.stopPropagation();
//     //                 let values = [];
//     //                 if (multiselect_control.get_data) {
//     //                     let data = await multiselect_control.get_data();
//     //                     values = data.map(d => String(d.value));
//     //                 } else if (multiselect_control.df.options) {
//     //                     values = multiselect_control.df.options.map(o =>
//     //                         typeof o === "object" ? String(o.value) : String(o)
//     //                     );
//     //                 }
//     //                 multiselect_control.set_value(values);
//     //             });

//     //             dropdown.find(".dropdown-footer").prepend(select_all_btn);
//     //         }, 200);
//     //     });
//     // }

//     // /* ── Financial Year ── */
//     // let fy_col = make_field();
//     // let fiscal_year_filter = frappe.ui.form.make_control({
//     //     parent: fy_col,
//     //     df: {
//     //         label: "Financial Year",
//     //         fieldtype: "Select",
//     //         fieldname: "financial_year",
//     //         options: ["2025-26", "2026-27"].join("\n"),
//     //         default: "2025-26",
//     //         reqd: 1,
//     //         change() { loadData(); }
//     //     },
//     //     render_input: true
//     // });

//     // /* ── YTD Month ── */
//     // let month_col = make_field();
//     // let currentMonth = new Date().toLocaleString('default', { month: 'long' });
//     // let month_filter = frappe.ui.form.make_control({
//     //     parent: month_col,
//     //     df: {
//     //         label: "YTD Month",
//     //         fieldtype: "Select",
//     //         fieldname: "month",
//     //         options: [
//     //             "January","February","March","April","May","June",
//     //             "July","August","September","October","November","December"
//     //         ].join("\n"),
//     //         reqd: 1,
//     //         change() { loadData(); }
//     //     },
//     //     render_input: true
//     // });
//     // month_filter.set_value(currentMonth);

//     // /* ── Unit ── */
//     // let unit_col = make_field();
//     // let unit_filter = frappe.ui.form.make_control({
//     //     parent: unit_col,
//     //     df: {
//     //         label: "Unit",
//     //         fieldtype: "MultiSelectList",
//     //         fieldname: "unit",
//     //         reqd: 1,
//     //         get_data() {
//     //             return frappe.call({
//     //                 method: "annual_budget.api.filter_options.get_units"
//     //             }).then(r => {
//     //                 return (r.message?.data || [])
//     //                     .filter(d => d.value)
//     //                     .map(d => ({ label: d.label, value: String(d.value), description: "" }));
//     //             });
//     //         },
//     //         change() {
//     //             units = unit_filter.get_value().map(String);
//     //             cost_center_filter.set_value([]);
//     //             location_code_filter.df.options = [];
//     //             location_code_filter.refresh();
//     //             cost_center_filter.df.options = [];
//     //             cost_center_filter.refresh();
//     //             if (units.length) {
//     //                 loadCostCenters(units);
//     //                 loadLocationCodes(units);
//     //             }
//     //         }
//     //     },
//     //     render_input: true
//     // });
//     // add_select_all_button(unit_filter);

//     // /* ── Cost Center ── */
//     // let cc_col = make_field();
//     // let cost_center_filter = frappe.ui.form.make_control({
//     //     parent: cc_col,
//     //     df: {
//     //         label: "Cost Center",
//     //         fieldtype: "MultiSelectList",
//     //         fieldname: "cost_center",
//     //         options: [],
//     //         change() {}
//     //     },
//     //     render_input: true
//     // });
//     // add_select_all_button(cost_center_filter);

//     // /* ── Location Code ── */
//     // let lc_col = make_field();
//     // let location_code_filter = frappe.ui.form.make_control({
//     //     parent: lc_col,
//     //     df: {
//     //         label: "Location Code",
//     //         fieldtype: "MultiSelectList",
//     //         fieldname: "location_code",
//     //         options: [],
//     //         change() {}
//     //     },
//     //     render_input: true
//     // });
//     // add_select_all_button(location_code_filter);

//     // /* ── Get Report button ── */
//     // let btn_col = make_field();
//     // let load_button = frappe.ui.form.make_control({
//     //     parent: btn_col,
//     //     df: {
//     //         label: " ",
//     //         fieldtype: "Button",
//     //         fieldname: "load_button",
//     //         click() { loadData(); }
//     //     },
//     //     render_input: true
//     // });
//     // load_button.$wrapper.find('button').addClass("btn-primary").text("Get Report");
//     // load_button.$wrapper.css("margin-top", "26px");

//     function make_field() {
//         return $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);
//     }

//     function mergeSelectedOptions(control, new_options) {
//         let selected = (control.get_value() || []).map(String);
//         let existing = control.df.options || [];
//         let map = {};
//         existing.forEach(o => map[String(o.value)] = o);
//         new_options.forEach(o => map[String(o.value)] = o);
//         selected.forEach(v => {
//             if (!map[v]) map[v] = { label: v, value: v, description: "" };
//         });
//         return Object.values(map);
//     }

//     // ──────────────────────────────────────────────────────────────
//     // IMPROVED: Add Select All using MutationObserver – reliable on Cloud
//     // ──────────────────────────────────────────────────────────────
//     function addSelectAllButton(control) {
//         if (!control || !control.$wrapper) return;

//         const observer = new MutationObserver(() => {
//             const footer = control.$wrapper.find('.dropdown-footer');
//             const list = control.$wrapper.find('.multiselect-list');

//             if (footer.length && list.length && !footer.find('.select-all-btn').length) {
//                 let btn = $(`
//                     <button type="button" class="btn btn-xs btn-default select-all-btn"
//                         style="margin-right:5px; margin-left:5px;">
//                         Select All
//                     </button>
//                 `);

//                 btn.on("click", async function (e) {
//                     e.stopPropagation();
//                     e.preventDefault();

//                     let values = [];
//                     try {
//                         if (control.get_data) {
//                             // async get_data – most common in Frappe MultiSelectList with dynamic source
//                             let data = await control.get_data();
//                             values = data.map(d => String(d.value || d));
//                         } else if (control.df.options) {
//                             values = control.df.options.map(o =>
//                                 String(typeof o === "object" ? (o.value || o) : o)
//                             );
//                         }
//                         control.set_value(values);
//                         // Optional: close dropdown after action
//                         // control.$wrapper.find('input').blur();
//                     } catch (err) {
//                         console.error("Select All failed:", err);
//                     }
//                 });

//                 footer.prepend(btn);
//                 // You can keep observing or disconnect after first add:
//                 // observer.disconnect();
//             }
//         });

//         observer.observe(control.$wrapper[0], {
//             childList: true,
//             subtree: true,
//             attributes: false
//         });
//     }

//     /* ── Financial Year ── */
//     let fy_col = make_field();
//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: fy_col,
//         df: {
//             label: "Financial Year",
//             fieldtype: "Select",
//             fieldname: "financial_year",
//             options: ["2025-26", "2026-27"].join("\n"),
//             default: "2025-26",
//             reqd: 1,
//             change() { loadData(); }
//         },
//         render_input: true
//     });

//     /* ── YTD Month ── */
//     let month_col = make_field();
//     let currentMonth = new Date().toLocaleString('default', { month: 'long' });
//     let month_filter = frappe.ui.form.make_control({
//         parent: month_col,
//         df: {
//             label: "YTD Month",
//             fieldtype: "Select",
//             fieldname: "month",
//             options: [
//                 "January","February","March","April","May","June",
//                 "July","August","September","October","November","December"
//             ].join("\n"),
//             reqd: 1,
//             change() { loadData(); }
//         },
//         render_input: true
//     });
//     month_filter.set_value(currentMonth);

//     /* ── Unit ── */
//     let unit_col = make_field();
//     let unit_filter = frappe.ui.form.make_control({
//         parent: unit_col,
//         df: {
//             label: "Unit",
//             fieldtype: "MultiSelectList",
//             fieldname: "unit",
//             reqd: 1,
//             get_data() {
//                 return frappe.call({
//                     method: "annual_budget.api.filter_options.get_units"
//                 }).then(r => {
//                     return (r.message?.data || [])
//                         .filter(d => d.value)
//                         .map(d => ({ label: d.label, value: String(d.value), description: "" }));
//                 });
//             },
//             change() {
//                 units = unit_filter.get_value().map(String);
//                 cost_center_filter.set_value([]);
//                 location_code_filter.df.options = [];
//                 location_code_filter.refresh();
//                 cost_center_filter.df.options = [];
//                 cost_center_filter.refresh();
//                 if (units.length) {
//                     loadCostCenters(units);
//                     loadLocationCodes(units);
//                 }
//             }
//         },
//         render_input: true
//     });
//     addSelectAllButton(unit_filter);

//     /* ── Cost Center ── */
//     let cc_col = make_field();
//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: cc_col,
//         df: {
//             label: "Cost Center",
//             fieldtype: "MultiSelectList",
//             fieldname: "cost_center",
//             options: [],
//             change() {}
//         },
//         render_input: true
//     });
//     addSelectAllButton(cost_center_filter);

//     /* ── Location Code ── */
//     let lc_col = make_field();
//     let location_code_filter = frappe.ui.form.make_control({
//         parent: lc_col,
//         df: {
//             label: "Location Code",
//             fieldtype: "MultiSelectList",
//             fieldname: "location_code",
//             options: [],
//             change() {}
//         },
//         render_input: true
//     });
//     addSelectAllButton(location_code_filter);

//     /* ── Get Report button ── */
//     let btn_col = make_field();
//     let load_button = frappe.ui.form.make_control({
//         parent: btn_col,
//         df: {
//             label: " ",
//             fieldtype: "Button",
//             fieldname: "load_button",
//             click() { loadData(); }
//         },
//         render_input: true
//     });
//     load_button.$wrapper.find('button').addClass("btn-primary").text("Get Report");
//     load_button.$wrapper.css("margin-top", "26px");
//     /* ------------------------------------------------
//        LOAD COST CENTERS
//     --------------------------------------------------*/
//     function loadCostCenters(units) {
//         cost_center_filter.set_value([]);
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 let api_options = (r.message?.data || [])
//                     .filter(d => d.value)
//                     .map(d => ({
//                         label: d.label,
//                         value: String(d.value),
//                         description: "",
//                         erp_cost_center_value: String(d.erp_cost_center_value)
//                     }));
//                 cost_center_filter.df.options = mergeSelectedOptions(cost_center_filter, api_options);
//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     /* ------------------------------------------------
//        LOAD LOCATION CODES
//     --------------------------------------------------*/
//     function loadLocationCodes(units) {
//         location_code_filter.set_value([]);
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 let api_options = (r.message?.data || [])
//                     .filter(d => d.value)
//                     .map(d => ({
//                         label: d.label,
//                         value: String(d.value),
//                         description: "",
//                         erp_loc_value: String(d.erp_loc_value)
//                     }));
//                 location_code_filter.df.options = mergeSelectedOptions(location_code_filter, api_options);
//                 location_code_filter.refresh();
//             }
//         });
//     }

//     frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", function () {
//         console.log("XLSX Loaded");
//     });

//     /* ------------------------------------------------
//        MAIN CONTAINER
//     --------------------------------------------------*/
//     const container = $(`
//         <div id="tables-container">
//             <div class="card-row" id="cards-container"></div>
//             <div id="controls-row">
//                 <input id="global-search-box" type="text"
//                     placeholder="Search Expense / Sub Head / Item...">
//                 <div id="controls-right">
//                     <label id="expand-all-wrapper">
//                         <input type="checkbox" id="expand-all-checkbox">
//                         Expand All
//                     </label>
//                     <button id="export-excel-btn">&#8595; Export to Excel</button>
//                 </div>
//             </div>
//             <div class="scroll-wrapper">
//                 <table class="university-table" id="phase-table"></table>
//             </div>
//         </div>
//     `);

//     $(page.body).append(container);

//     /* ------------------------------------------------
//        SEARCH — bound directly to element (fixes event loss)
//     --------------------------------------------------*/
//     container.find('#global-search-box').on('input keyup', function () {
//         searchText = $(this).val().trim();

//         if (searchText) {
//             // Auto-expand everything so matches are visible
//             expandedHeads = expense_heads.map(h => h.name);
//             expandedSubHeads = [];
//             expense_heads.forEach(head => {
//                 (head.sub_heads || []).forEach(sub => {
//                     expandedSubHeads.push(head.name + "__" + sub.name);
//                 });
//             });
//         } else {
//             // Clear search → collapse back to default
//             expandedHeads = [];
//             expandedSubHeads = [];
//             $('#expand-all-checkbox').prop('checked', false);
//         }

//         renderTable();
//     });

//     /* ------------------------------------------------
//        EXPAND ALL CHECKBOX
//     --------------------------------------------------*/
//     $(document).on('change', '#expand-all-checkbox', function () {
//         const isChecked = $(this).is(':checked');
//         if (isChecked) {
//             expandedHeads = expense_heads.map(h => h.name);
//             expandedSubHeads = [];
//             expense_heads.forEach(head => {
//                 (head.sub_heads || []).forEach(sub => {
//                     expandedSubHeads.push(head.name + "__" + sub.name);
//                 });
//             });
//         } else {
//             expandedHeads = [];
//             expandedSubHeads = [];
//         }
//         renderTable();
//     });

//     /* ------------------------------------------------
//        EXPORT TO EXCEL
//     --------------------------------------------------*/
//     $(document).on('click', '#export-excel-btn', function () {
//         exportTableToExcel();
//     });

//     function exportTableToExcel() {
//         if (typeof XLSX === "undefined") {
//             frappe.msgprint("Excel library not loaded.");
//             return;
//         }

//         let data = [["Expense Items", "Budget", "Actuals", "Util %", "Variance"]];
//         let grand_budget = 0;
//         let grand_actuals = 0;

//         expense_heads.forEach(head => {
//             const hB = Number(head.ytd || 0);
//             const hA = Number(head.total_posted_amt_ytd || 0);
//             grand_budget  += hB;
//             grand_actuals += hA;
//             data.push([head.name, hB, hA, safePercentage(hB, hA), hB - hA]);

//             (head.sub_heads || []).forEach(sub => {
//                 const sB = Number(sub.ytd || 0);
//                 const sA = Number(sub.total_posted_amt_ytd || 0);
//                 data.push(["   " + sub.name, sB, sA, safePercentage(sB, sA), sB - sA]);
//                 (sub.items || []).forEach(item => {
//                     const b = Number(item.ytd || 0);
//                     const a = Number(item.total_posted_amt || 0);
//                     data.push(["      " + item.name, b, a, safePercentage(b, a), b - a]);
//                 });
//             });

//             (head.items || []).forEach(item => {
//                 const b = Number(item.ytd || 0);
//                 const a = Number(item.total_posted_amt || 0);
//                 data.push(["   " + item.name, b, a, safePercentage(b, a), b - a]);
//             });
//         });

//         data.push(["GRAND TOTAL", grand_budget, grand_actuals,
//             safePercentage(grand_budget, grand_actuals), grand_budget - grand_actuals]);

//         const ws = XLSX.utils.aoa_to_sheet(data);
//         ws["!cols"] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
//         XLSX.writeFile(wb, "Expense_Report.xlsx");
//     }

//     /* =====================================================
//        STATE
//     =====================================================*/
//     let expense_heads    = [];
//     let expandedHeads    = [];
//     let expandedSubHeads = [];
//     let searchText       = "";

//     const formatNumber = n =>
//         (Number(n) || 0).toLocaleString('en-IN', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });

//     function matchesSearch(...values) {
//         return values.some(v =>
//             String(v || "").toLowerCase().includes(searchText.toLowerCase())
//         );
//     }

//     /* ------------------------------------------------
//        HELPER — GET SELECTED WITH EXTRA KEY
//     --------------------------------------------------*/
//     function getSelectedWithKey(control, key) {
//         if (!control || !control.get_value) return [];
//         return (control.get_value() || [])
//             .map(val => {
//                 let option = (control.df?.options || []).find(
//                     o => String(o?.value) === String(val)
//                 );
//                 return option?.[key] || null;
//             })
//             .filter(Boolean);
//     }

//     /* ------------------------------------------------
//        LOAD DATA
//     --------------------------------------------------*/
//     function loadData() {
//         let financial_year       = fiscal_year_filter.get_value();
//         let month                = month_filter.get_value();
//         let unit                 = (unit_filter.get_value() || []).join(",") || null;
//         let location_code        = (getSelectedWithKey(location_code_filter, "value") || []).join(",") || null;
//         let cost_center          = (getSelectedWithKey(cost_center_filter, "value") || []).join(",") || null;
//         let erp_cost_center_value = (getSelectedWithKey(cost_center_filter, "erp_cost_center_value") || []).join(",") || null;
//         let erp_loc_value        = (getSelectedWithKey(location_code_filter, "erp_loc_value") || []).join(",") || null;

//         console.log(erp_cost_center_value, "erp_cost_center_value");
//         console.log(cost_center, "cost_center_value");
//         console.log(location_code, "loc_value");

//         let missing = [];
//         if (!financial_year) missing.push("Financial Year");
//         if (!month)          missing.push("Month");
//         if (!unit)           missing.push("Unit");

//         if (missing.length) {
//             console.warn("⚠ Missing Filters:", missing.join(", "));
//             return;
//         }

//         Loader.show("We're crafting your report with care");

//         // Reset state on fresh load
//         $('#expand-all-checkbox').prop('checked', false);
//         $('#global-search-box').val("");
//         expandedHeads    = [];
//         expandedSubHeads = [];
//         searchText       = "";

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_combined_actuals",
//             args: { financial_year, month, unit, cost_center, location_code, erp_loc_value, erp_cost_center_value }
//         })
//         .done(function(r) {
//             expense_heads = Array.isArray(r.message)
//                 ? r.message
//                 : (r.message?.message || []);
//             console.log(r, "API response");
//             renderTable();
//         })
//         .fail(function(err) {
//             console.error("API Error:", err);
//             frappe.msgprint({ title: "Error", message: "Failed to load data. Please try again.", indicator: "red" });
//         })
//         .always(function() {
//             Loader.hide();
//         });
//     }

//     function safePercentage(budget, actual) {
//         if (!budget || budget === 0) return "0.00";
//         return ((actual / budget) * 100).toFixed(2);
//     }

//     /* ------------------------------------------------
//        RENDER TABLE
//     --------------------------------------------------*/
//     function renderTable() {
//         renderCards(expense_heads);

//         const $table = $('#phase-table');
//         $table.html('');

//         if (!expense_heads || !expense_heads.length) {
//             $table.append(`<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No Data Found</td></tr>`);
//             return;
//         }

//         $table.append(`
//             <thead>
//                 <tr class="main-row">
//                     <th>Expense Head</th>
//                     <th>Budget</th>
//                     <th>Actuals</th>
//                     <th>Util %</th>
//                     <th>Variance</th>
//                 </tr>
//             </thead>
//         `);

//         const $tbody     = $('<tbody></tbody>');
//         let grand_budget  = 0;
//         let grand_actuals = 0;

//         expense_heads.forEach(head => {
//             if (
//                 searchText &&
//                 !matchesSearch(head.name) &&
//                 !(head.items || []).some(i => matchesSearch(i.name)) &&
//                 !(head.sub_heads || []).some(s =>
//                     matchesSearch(s.name) ||
//                     (s.items || []).some(i => matchesSearch(i.name))
//                 )
//             ) return;

//             const headBudget = Number(head.ytd || 0);
//             const headActual = Number(head.total_posted_amt_ytd || 0);
//             const headTotal  = headBudget - headActual;
//             const headPer    = safePercentage(headBudget, headActual);

//             grand_budget  += headBudget;
//             grand_actuals += headActual;

//             $tbody.append(`
//                 <tr class="expense-head" data-head="${head.name}">
//                     <td>
//                         ${(head.items?.length || head.sub_heads?.length)
//                             ? (expandedHeads.includes(head.name) ? '▼' : '▶')
//                             : ''}
//                         ${head.name}
//                     </td>
//                     <td>${formatNumber(headBudget)}</td>
//                     <td>${formatNumber(headActual)}</td>
//                     <td class="text-blue">${headPer} %</td>
//                     <td class="text-blue">${formatNumber(headTotal)}</td>
//                 </tr>
//             `);

//             if (expandedHeads.includes(head.name)) {

//                 (head.items || []).forEach(item => {
//                     if (searchText && !matchesSearch(item.name)) return;
//                     const budget    = Number(item.ytd || 0);
//                     const actual    = Number(item.total_posted_amt || 0);
//                     const total     = budget - actual;
//                     const total_per = safePercentage(budget, actual);
//                     $tbody.append(`
//                         <tr class="line-item">
//                             <td style="padding-left:35px">${item.name}</td>
//                             <td>${formatNumber(budget)}</td>
//                             <td>${formatNumber(actual)}</td>
//                             <td>${total_per} %</td>
//                             <td>${formatNumber(total)}</td>
//                         </tr>
//                     `);
//                 });

//                 (head.sub_heads || []).forEach(sub => {
//                     const key       = head.name + "__" + sub.name;
//                     const subBudget = Number(sub.ytd || 0);
//                     const subActual = Number(sub.total_posted_amt_ytd || 0);
//                     const subTotal  = subBudget - subActual;
//                     const subPer    = safePercentage(subBudget, subActual);

//                     $tbody.append(`
//                         <tr class="sub-head" data-sub="${key}">
//                             <td style="padding-left:20px">
//                                 ${(sub.items?.length)
//                                     ? (expandedSubHeads.includes(key) ? '▼' : '▶')
//                                     : ''}
//                                 ${sub.name}
//                             </td>
//                             <td>${formatNumber(subBudget)}</td>
//                             <td>${formatNumber(subActual)}</td>
//                             <td class="text-blue">${subPer} %</td>
//                             <td class="text-blue">${formatNumber(subTotal)}</td>
//                         </tr>
//                     `);

//                     if (expandedSubHeads.includes(key)) {
//                         (sub.items || []).forEach(item => {
//                             const budget    = Number(item.ytd || 0);
//                             const actual    = Number(item.total_posted_amt || 0);
//                             const total     = budget - actual;
//                             const total_per = safePercentage(budget, actual);
//                             $tbody.append(`
//                                 <tr class="line-item">
//                                     <td style="padding-left:55px">${item.name}</td>
//                                     <td>${formatNumber(budget)}</td>
//                                     <td>${formatNumber(actual)}</td>
//                                     <td>${total_per} %</td>
//                                     <td>${formatNumber(total)}</td>
//                                 </tr>
//                             `);
//                         });
//                     }
//                 });
//             }
//         });

//         const grand_total = grand_budget - grand_actuals;
//         const grandPer    = safePercentage(grand_budget, grand_actuals);

//         $tbody.append(`
//             <tr class="grand-total-row">
//                 <td>GRAND TOTAL</td>
//                 <td>${formatNumber(grand_budget)}</td>
//                 <td>${formatNumber(grand_actuals)}</td>
//                 <td>${grandPer} %</td>
//                 <td>${formatNumber(grand_total)}</td>
//             </tr>
//         `);

//         $table.append($tbody);

//         /* ── Sync Expand All checkbox ── */
//         const allHeads   = expense_heads.map(h => h.name);
//         const allSubKeys = [];
//         expense_heads.forEach(h => {
//             (h.sub_heads || []).forEach(s => allSubKeys.push(h.name + "__" + s.name));
//         });
//         const allExpanded =
//             allHeads.length > 0 &&
//             allHeads.every(n => expandedHeads.includes(n)) &&
//             allSubKeys.every(k => expandedSubHeads.includes(k));
//         $('#expand-all-checkbox').prop('checked', allExpanded);

//         /* ── Row click handlers ── */
//         $('.expense-head').off('click').on('click', function () {
//             const name = $(this).data('head');
//             expandedHeads = expandedHeads.includes(name)
//                 ? expandedHeads.filter(x => x !== name)
//                 : [...expandedHeads, name];
//             renderTable();
//         });

//         $('.sub-head').off('click').on('click', function () {
//             const key = $(this).data('sub');
//             expandedSubHeads = expandedSubHeads.includes(key)
//                 ? expandedSubHeads.filter(x => x !== key)
//                 : [...expandedSubHeads, key];
//             renderTable();
//         });
//     }

//     /* ------------------------------------------------
//        RENDER CARDS
//     --------------------------------------------------*/
//     function renderCards(data) {
//         const cards_container = $('#cards-container');
//         cards_container.empty();

//         let grand_budget = 0;
//         let grand_actual = 0;
//         let cards_html   = "";

//         data.forEach(head => {
//             grand_budget += Number(head.ytd || 0);
//             grand_actual += Number(head.total_posted_amt_ytd || 0);
//         });

//         cards_html += createCard("Grand Total", grand_budget, grand_actual, grand_budget - grand_actual, true);

//         data.forEach(head => {
//             const hB = Number(head.ytd || 0);
//             const hA = Number(head.total_posted_amt_ytd || 0);
//             cards_html += createCard(head.name, hB, hA, hB - hA);

//             (head.sub_heads || []).forEach(sub => {
//                 const sB = Number(sub.ytd || 0);
//                 const sA = Number(sub.total_posted_amt_ytd || 0);
//                 cards_html += createCard(sub.name, sB, sA, sB - sA, false, true);
//             });
//         });

//         cards_container.append(cards_html);
//     }

//     function createCard(title, budget, actual, variance, isGrand = false, isSub = false) {
//         const utilization = budget > 0 ? ((actual / budget) * 100).toFixed(2) : "0.00";
//         return `
//             <div class="number-card ${isGrand ? 'grand' : ''} ${isSub ? 'sub' : ''}">
//                 <div class="number-title">${title}</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${formatNumber(budget)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${formatNumber(actual)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${formatNumber(variance)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value">${utilization} %</div>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }
// };





// frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {
//     const style = `
//     <style>

//     /* ══════════════════════════════════════════
//        BASE / DESKTOP
//     ══════════════════════════════════════════ */

//     #tables-container {
//         margin: 20px;
//         background-color: #ffffff;
//         border-radius: 8px;
//         padding: 8px;
//     }

//     /* ── Controls row ── */
//     #controls-row {
//         display: flex;
//         flex-wrap: wrap;
//         justify-content: space-between;
//         align-items: center;
//         gap: 8px;
//         margin-bottom: 12px;
//         padding: 8px 10px;
//         background: #f7f9fb;
//         border: 1px solid #dcdcdc;
//         border-radius: 6px;
//     }

//     #global-search-box {
//         flex: 1 1 200px;
//         min-width: 0;
//         max-width: 320px;
//         padding: 7px 12px;
//         border: 1px solid #aaa;
//         border-radius: 6px;
//         font-size: 13px;
//         box-sizing: border-box;
//     }

//     #controls-right {
//         display: flex;
//         flex-wrap: wrap;
//         align-items: center;
//         gap: 12px;
//     }

//     /* ── Expand-All checkbox ── */
//     #expand-all-wrapper {
//         display: flex;
//         align-items: center;
//         gap: 7px;
//         font-size: 13px;
//         font-weight: 600;
//         color: #444;
//         cursor: pointer;
//         user-select: none;
//         white-space: nowrap;
//     }

//     #expand-all-checkbox {
//         width: 16px;
//         height: 16px;
//         accent-color: #0076B6;
//         cursor: pointer;
//     }

//     /* ── Export button – Frappe primary style ── */
//     #export-excel-btn {
//         display: inline-flex;
//         align-items: center;
//         gap: 6px;
//         padding: 6px 14px;
//         font-size: 13px;
//         font-weight: 600;
//         color: #fff !important;
//         background-color: #0076B6;
//         border: 1px solid #0076B6;
//         border-radius: 6px;
//         cursor: pointer;
//         transition: background .15s ease, box-shadow .15s ease;
//         white-space: nowrap;
//         line-height: 1.5;
//         box-shadow: 0 1px 3px rgba(0,0,0,.12);
//         text-decoration: none;
//     }

//     #export-excel-btn:hover {
//         background-color: #005f94;
//         border-color: #005f94;
//         box-shadow: 0 3px 8px rgba(0,118,182,.35);
//     }

//     #export-excel-btn:active {
//         background-color: #004f7a;
//         border-color: #004f7a;
//         box-shadow: none;
//     }

//     /* ── Table wrapper ── */
//     .scroll-wrapper {
//         border: 1px solid #ccc;
//         border-radius: 6px;
//         overflow-x: auto;
//         overflow-y: auto;
//         max-height: 70vh;
//         background: #fff;
//         -webkit-overflow-scrolling: touch;
//     }

//     table.university-table {
//         min-width: 700px;
//         width: 100%;
//         border-collapse: collapse;
//         font-size: 13px;
//     }

//     table.university-table th,
//     table.university-table td {
//         border: 1px solid #ddd;
//         padding: 8px 10px;
//         white-space: nowrap;
//         vertical-align: middle;
//         text-align: center;
//         background: #fff !important;
//     }

//     table.university-table th:first-child,
//     table.university-table td:first-child {
//         text-align: left !important;
//     }

//     table.university-table thead tr.main-row th {
//         background-color: #0076B6 !important;
//         color: #fff !important;
//         position: sticky;
//         top: 0;
//         z-index: 25;
//     }

//     tr.expense-head {
//         font-weight: 700;
//         cursor: pointer;
//     }

//     tr.expense-head:hover td {
//         background: #F4F9FD !important;
//     }

//     tr.sub-head {
//         background-color: #FFF3E6 !important;
//         font-weight: 600;
//         cursor: pointer;
//     }

//     tr.sub-head:hover td {
//         background-color: #FFEAD5 !important;
//     }

//     tr.line-item td:first-child {
//         padding-left: 35px !important;
//     }

//     tr.sub-head td:first-child {
//         padding-left: 20px !important;
//     }

//     .text-blue {
//         color: #0076B6;
//         font-weight: 600;
//     }

//     tr.grand-total-row td {
//         background: #003B63 !important;
//         color: #fff !important;
//         font-weight: 700 !important;
//     }

//     /* ── Cards ── */
//     .card-row {
//         display: grid;
//         grid-template-columns: repeat(4, 1fr);
//         gap: 14px;
//         margin: 14px 20px;
//     }

//     .number-card {
//         background: #ffffff;
//         border: 1px solid #dcdcdc;
//         border-radius: 8px;
//         padding: 14px 16px;
//         box-shadow: 0 2px 6px rgba(0,0,0,.06);
//         transition: .15s ease;
//     }

//     .number-card:hover {
//         transform: translateY(-2px);
//         box-shadow: 0 6px 14px rgba(0,0,0,.12);
//     }

//     .number-title {
//         font-size: 12px;
//         font-weight: 600;
//         color: #666;
//         text-transform: uppercase;
//         margin-bottom: 6px;
//     }

//     .number-value {
//         font-size: 20px;
//         font-weight: 700;
//         color: #0076B6;
//     }

//     .number-card.grand {
//         border: 2px solid #0076B6;
//         background: #F4F9FD;
//     }

//     .number-card.grand .number-value {
//         font-size: 24px;
//         font-weight: 800;
//     }

//     /* ══════════════════════════════════════════
//        TABLET  ≤ 1024px  →  2-col cards
//     ══════════════════════════════════════════ */
//     @media (max-width: 1024px) {
//         .card-row {
//             grid-template-columns: repeat(2, 1fr);
//         }
//         #global-search-box {
//             max-width: 100%;
//         }
//     }

//     /* ══════════════════════════════════════════
//        MOBILE  ≤ 600px  →  single column
//     ══════════════════════════════════════════ */
//     @media (max-width: 600px) {
//         #tables-container {
//             margin: 8px;
//             padding: 6px;
//         }
//         #controls-row {
//             flex-direction: column;
//             align-items: stretch;
//             gap: 8px;
//             padding: 8px;
//         }
//         #global-search-box {
//             max-width: 100%;
//             width: 100%;
//         }
//         #controls-right {
//             justify-content: space-between;
//             width: 100%;
//         }
//         #export-excel-btn {
//             flex: 1;
//             justify-content: center;
//         }
//         .card-row {
//             grid-template-columns: 1fr;
//             margin: 8px;
//             gap: 10px;
//         }
//         .number-card.grand .number-value {
//             font-size: 20px;
//         }
//         table.university-table {
//             font-size: 12px;
//         }
//         table.university-table th,
//         table.university-table td {
//             padding: 6px 8px;
//         }
//         tr.line-item td:first-child {
//             padding-left: 20px !important;
//         }
//         tr.sub-head td:first-child {
//             padding-left: 14px !important;
//         }
//     }

//     </style>
//     `;

//     $('head').append(style);

//     if (!$("#global-loader").length) {
//         $("body").append(`
//             <div id="global-loader" class="loader-overlay">
//                 <div class="loader-box">
//                     <img src="/files/APF logo.png" class="loader-logo">
//                     <div class="loader-text">Loading, please wait…</div>
//                 </div>
//             </div>
//         `);
//     }

//     $("#global-loader").hide();

//     const Loader = {
//         show(message = "Loading, please wait…") {
//             const loader = $("#global-loader");
//             if (!loader.length) return;
//             loader.find(".loader-text").text(message);
//             loader.fadeIn(200);
//         },
//         hide() {
//             const loader = $("#global-loader");
//             if (!loader.length) return;
//             loader.fadeOut(200);
//         }
//     };

//     /* =====================================================
//        PAGE
//     =====================================================*/
//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget vs Actuals Face Sheet',
//         single_column: true
//     });

//     /* ------------------------------------------------
//        FILTER SECTION
//     --------------------------------------------------*/
//     let filter_section = $(`
//         <div class="frappe-control-group row custom-filter-row"></div>
//     `).appendTo(page.body);

//     $(`<style>
//         .custom-filter-row {
//             padding: 15px 20px;
//             background: #fff;
//             border-radius: 6px;
//             margin-top: 10px;
//         }
//         .custom-filter-row.row {
//             margin-left: 0;
//             margin-right: 0;
//         }
//         .custom-filter-row .col-md-4,
//         .custom-filter-row .col-sm-12 {
//             padding-left: 8px;
//             padding-right: 8px;
//         }

//         /* Full screen loader overlay */
//         #global-loader.loader-overlay {
//             position: fixed;
//             inset: 0;
//             width: 100vw;
//             height: 100vh;
//             background: rgba(18, 18, 18, 0.92);
//             backdrop-filter: blur(6px);
//             display: none;
//             z-index: 999999;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//         }

//         .loader-box {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             gap: 14px;
//         }

//         .loader-logo {
//             width: 90px;
//             height: 90px;
//             border-radius: 50%;
//             background: linear-gradient(145deg, #ffffff, #eaeaea);
//             padding: 14px;
//             object-fit: contain;
//             box-shadow: 0 10px 30px rgba(0,0,0,.35), 0 0 0 4px rgba(255,255,255,.08);
//             animation: pulse 1.6s infinite ease-in-out;
//         }

//         .loader-text {
//             margin-top: 6px;
//             font-size: 14px;
//             color: #ffffff;
//             font-weight: 600;
//             letter-spacing: 0.5px;
//             text-align: center;
//             opacity: 0.85;
//         }

//         .loader-text::after {
//             content: "";
//             display: inline-block;
//             width: 1em;
//             animation: dots 1.5s infinite;
//         }

//         @keyframes pulse {
//             0%   { transform: scale(1);    opacity: 0.8; box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
//             50%  { transform: scale(1.08); opacity: 1;   box-shadow: 0 0 20px 8px rgba(255,255,255,0.15); }
//             100% { transform: scale(1);    opacity: 0.8; box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
//         }

//         @keyframes dots {
//             0%   { content: ""; }
//             33%  { content: "."; }
//             66%  { content: ".."; }
//             100% { content: "..."; }
//         }

//         .kpi-row,
//         .kpi-bottom {
//             display: flex;
//             justify-content: space-between;
//             margin-top: 8px;
//         }

//         .kpi-block { text-align: left; }

//         .kpi-label {
//             font-size: 11px;
//             color: #777;
//             text-transform: uppercase;
//         }

//         .kpi-value {
//             font-size: 14px;
//             font-weight: 700;
//             color: #000;
//         }

//         .kpi-bottom {
//             margin-top: 10px;
//             padding-top: 8px;
//             border-top: 1px solid #eee;
//         }

//         .number-card.sub {
//             background: #fafafa;
//             border-left: 4px solid #ccc;
//         }

//         /* Filter row responsive */
//         @media (max-width: 768px) {
//             .custom-filter-row { padding: 10px; }
//             .custom-filter-row .col-md-4 { width: 100%; margin-bottom: 8px; }
//         }
//     </style>`).appendTo("head");

//     function make_field() {
//         return $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);
//     }

//     function mergeSelectedOptions(control, new_options) {
//         let selected = (control.get_value() || []).map(String);
//         let existing = control.df.options || [];
//         let map = {};
//         existing.forEach(o => map[String(o.value)] = o);
//         new_options.forEach(o => map[String(o.value)] = o);
//         selected.forEach(v => {
//             if (!map[v]) map[v] = { label: v, value: v, description: "" };
//         });
//         return Object.values(map);
//     }

//     // ──────────────────────────────────────────────────────────────
//     // IMPROVED Select All – with fallback polling + debug logs
//     // ──────────────────────────────────────────────────────────────
//     // function addSelectAllButton(control, fieldnameForDebug = '') {
//     //     if (!control || !control.$wrapper) {
//     //         console.warn(`addSelectAllButton: No wrapper for ${fieldnameForDebug}`);
//     //         return;
//     //     }

//     //     let buttonAdded = false;

//     //     // 1. MutationObserver – primary method
//     //     const observer = new MutationObserver((mutations) => {
//     //         if (buttonAdded) return;

//     //         const footer = control.$wrapper.find('.dropdown-footer');
//     //         const list   = control.$wrapper.find('.multiselect-list, .awesomplete, .dropdown-menu');

//     //         if (footer.length && list.length && !footer.find('.select-all-btn').length) {
//     //             console.log(`[${fieldnameForDebug}] Dropdown footer detected → adding Select All`);
//     //             addTheButton(footer);
//     //             buttonAdded = true;
//     //             observer.disconnect();
//     //         } else if (footer.length || list.length) {
//     //             console.log(`[${fieldnameForDebug}] Partial dropdown found (footer:${footer.length}, list:${list.length})`);
//     //         }
//     //     });

//     //     observer.observe(control.$wrapper[0], {
//     //         childList: true,
//     //         subtree: true,
//     //         attributes: true,
//     //         characterData: true
//     //     });

//     //     // 2. Fallback polling (every 300ms for ~5 seconds)
//     //     let pollCount = 0;
//     //     const pollInterval = setInterval(() => {
//     //         pollCount++;
//     //         if (buttonAdded || pollCount > 15) {
//     //             clearInterval(pollInterval);
//     //             return;
//     //         }

//     //         const footer = control.$wrapper.find('.dropdown-footer');
//     //         if (footer.length && !footer.find('.select-all-btn').length) {
//     //             console.log(`[${fieldnameForDebug}] Polling success – footer appeared`);
//     //             addTheButton(footer);
//     //             buttonAdded = true;
//     //             clearInterval(pollInterval);
//     //             observer.disconnect();
//     //         }
//     //     }, 300);

//     //     // Helper: create & attach button
//     //     function addTheButton(footer) {
//     //         let btn = $(`
//     //             <button type="button" class="btn btn-xs btn-default select-all-btn"
//     //                 style="margin: 4px 6px;">
//     //                 Select All
//     //             </button>
//     //         `);

//     //         btn.on("click", async function (e) {
//     //             e.stopPropagation();
//     //             e.preventDefault();

//     //             console.log(`[${fieldnameForDebug}] Select All clicked`);

//     //             let values = [];
//     //             try {
//     //                 if (control.get_data) {
//     //                     let data = await control.get_data();
//     //                     values = data.map(d => String(d.value || d));
//     //                 } else if (control.df && control.df.options) {
//     //                     values = control.df.options.map(o => String(typeof o === "object" ? o.value : o));
//     //                 }
//     //                 if (values.length) {
//     //                     control.set_value(values);
//     //                     console.log(`[${fieldnameForDebug}] Selected ${values.length} items`);
//     //                 } else {
//     //                     console.warn(`[${fieldnameForDebug}] No values to select`);
//     //                 }
//     //             } catch (err) {
//     //                 console.error(`[${fieldnameForDebug}] Select All error:`, err);
//     //             }
//     //         });

//     //         footer.prepend(btn);
//     //         console.log(`[${fieldnameForDebug}] Select All button added`);
//     //     }

//     //     // Initial delayed check
//     //     setTimeout(() => {
//     //         const footer = control.$wrapper.find('.dropdown-footer');
//     //         if (footer.length && !footer.find('.select-all-btn').length) {
//     //             console.log(`[${fieldnameForDebug}] Initial check success`);
//     //             addTheButton(footer);
//     //             buttonAdded = true;
//     //         }
//     //     }, 800);
//     // }
// function addSelectAllButton(control, fieldnameForDebug = '') {
//     if (!control || !control.$input) return;

//     control.$input.on("focus", function () {

//         setTimeout(() => {

//             const dropdown = $('.multiselect-dropdown:visible').last();
//             if (!dropdown.length) return;

//             const actions = dropdown.find('.multiselect-actions');
//             if (!actions.length) return;

//             // 🔥 Remove any existing injected buttons first
//             actions.find('.custom-select-all-btn').remove();

//             const btn = $(`
//                 <button type="button"
//                     class="btn btn-xs btn-default custom-select-all-btn"
//                     style="margin-right:8px;">
//                     Select All
//                 </button>
//             `);

//             btn.on("click", async function (e) {
//                 e.stopPropagation();
//                 e.preventDefault();

//                 let values = [];

//                 try {
//                     if (control.get_data) {
//                         let data = await control.get_data();
//                         values = data.map(d => String(d.value || d));
//                     } else if (control.df && control.df.options) {
//                         values = control.df.options.map(o =>
//                             String(typeof o === "object" ? o.value : o)
//                         );
//                     }

//                     if (values.length) {
//                         control.set_value(values);
//                     }

//                 } catch (err) {
//                     console.error(err);
//                 }
//             });

//             // Insert beside Clear All
//             actions.prepend(btn);

//         }, 120);
//     });
// }
//     /* ── Financial Year ── */
//     let fy_col = make_field();
//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: fy_col,
//         df: {
//             label: "Financial Year",
//             fieldtype: "Select",
//             fieldname: "financial_year",
//             options: ["2024-25","2025-26", "2026-27","2027-28"].join("\n"),
//             default: "2025-26",
//             reqd: 1,
//             change() { 

//              }
//         },
//         render_input: true
//     });

//     /* ── YTD Month ── */
//     let month_col = make_field();
//     let currentMonth = new Date().toLocaleString('default', { month: 'long' });
//     let month_filter = frappe.ui.form.make_control({
//         parent: month_col,
//         df: {
//             label: "YTD Month",
//             fieldtype: "Select",
//             fieldname: "month",
//             options: [
//                 "January","February","March","April","May","June",
//                 "July","August","September","October","November","December"
//             ].join("\n"),
//             reqd: 1,
//             change() { 
                
//              }
//         },
//         render_input: true
//     });
//     month_filter.set_value(currentMonth);


//     /* ── Theme ── */
// let theme_col = make_field();

// let theme_filter = frappe.ui.form.make_control({
//     parent: theme_col,
//     df: {
//         label: "Theme",
//         fieldtype: "MultiSelectList",
//         fieldname: "theme",
//         reqd: 1,

//         get_data() {
//             return frappe.call({
//                 method: "annual_budget.api.filter_options.get_overview_number_cards"
//             }).then(r => {

//                 return (r.message || []).map(d => ({
//                     label: d.number_card_title,  // what user sees
//                     value: d.name,               // actual value
//                     description: ""
//                 }));

//             });
//         },

//         change() {
//             let selected_themes = theme_filter.get_value().map(String);
//             console.log("Selected:", selected_themes);

//             // Example usage
//             // You can reload cards here if needed
//         }
//     },
//     render_input: true
// });
//     /* ── Unit ── */
//     let unit_col = make_field();
//     let unit_filter = frappe.ui.form.make_control({
//         parent: unit_col,
//         df: {
//             label: "Unit",
//             fieldtype: "MultiSelectList",
//             fieldname: "unit",
//             reqd: 1,
//             get_data() {
//                 return frappe.call({
//                     method: "annual_budget.api.filter_options.get_units"
//                 }).then(r => {
//                     return (r.message?.data || [])
//                         .filter(d => d.value)
//                         .map(d => ({ label: d.label, value: String(d.value), description: "" }));
//                 });
//             },
//             change() {
//                 units = unit_filter.get_value().map(String);
//                 cost_center_filter.set_value([]);
//                 location_code_filter.df.options = [];
//                 location_code_filter.refresh();
//                 cost_center_filter.df.options = [];
//                 cost_center_filter.refresh();
//                 if (units.length) {
//                     loadCostCenters(units);
//                     loadLocationCodes(units);
//                 }
//             }
//         },
//         render_input: true
//     });

//     addSelectAllButton(unit_filter, "Unit");

//     /* ── Cost Center ── */
//     let cc_col = make_field();
//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: cc_col,
//         df: {
//             label: "Cost Center",
//             fieldtype: "MultiSelectList",
//             fieldname: "cost_center",
//             options: [],
//             change() {}
//         },
//         render_input: true
//     });
//     addSelectAllButton(cost_center_filter, "Cost Center");

//     /* ── Location Code ── */
//     let lc_col = make_field();
//     let location_code_filter = frappe.ui.form.make_control({
//         parent: lc_col,
//         df: {
//             label: "Location Code",
//             fieldtype: "MultiSelectList",
//             fieldname: "location_code",
//             options: [],
//             change() {}
//         },
//         render_input: true
//     });
//     addSelectAllButton(location_code_filter, "Location Code");

//     /* ── Get Report button ── */
//     let btn_col = make_field();
//     let load_button = frappe.ui.form.make_control({
//         parent: btn_col,
//         df: {
//             label: " ",
//             fieldtype: "Button",
//             fieldname: "load_button",
//             click() { loadData(); }
//         },
//         render_input: true
//     });
//     load_button.$wrapper.find('button').addClass("btn-primary").text("Get Report");
//     load_button.$wrapper.css("margin-top", "26px");

//     frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", function () {
//         console.log("XLSX Loaded");
//     });

//     /* ------------------------------------------------
//        MAIN CONTAINER
//     --------------------------------------------------*/
//     const container = $(`
//         <div id="tables-container">
//             <div class="card-row" id="cards-container"></div>
//             <div id="controls-row">
//                 <input id="global-search-box" type="text"
//                     placeholder="Search Expense / Sub Head / Item...">
//                 <div id="controls-right">
//                     <label id="expand-all-wrapper">
//                         <input type="checkbox" id="expand-all-checkbox">
//                         Expand All
//                     </label>
//                     <button id="export-excel-btn">↓ Export to Excel</button>
//                 </div>
//             </div>
//             <div class="scroll-wrapper">
//                 <table class="university-table" id="phase-table"></table>
//             </div>
//         </div>
//     `);

//     $(page.body).append(container);

//     /* ------------------------------------------------
//        SEARCH
//     --------------------------------------------------*/
//     container.find('#global-search-box').on('input keyup', function () {
//         searchText = $(this).val().trim();

//         if (searchText) {
//             expandedHeads = expense_heads.map(h => h.name);
//             expandedSubHeads = [];
//             expense_heads.forEach(head => {
//                 (head.sub_heads || []).forEach(sub => {
//                     expandedSubHeads.push(head.name + "__" + sub.name);
//                 });
//             });
//         } else {
//             expandedHeads = [];
//             expandedSubHeads = [];
//             $('#expand-all-checkbox').prop('checked', false);
//         }

//         renderTable();
//     });

//     /* ------------------------------------------------
//        EXPAND ALL CHECKBOX
//     --------------------------------------------------*/
//     $(document).on('change', '#expand-all-checkbox', function () {
//         const isChecked = $(this).is(':checked');
//         if (isChecked) {
//             expandedHeads = expense_heads.map(h => h.name);
//             expandedSubHeads = [];
//             expense_heads.forEach(head => {
//                 (head.sub_heads || []).forEach(sub => {
//                     expandedSubHeads.push(head.name + "__" + sub.name);
//                 });
//             });
//         } else {
//             expandedHeads = [];
//             expandedSubHeads = [];
//         }
//         renderTable();
//     });

//     /* ------------------------------------------------
//        EXPORT TO EXCEL
//     --------------------------------------------------*/
//     $(document).on('click', '#export-excel-btn', function () {
//         exportTableToExcel();
//     });

//     function exportTableToExcel() {
//         if (typeof XLSX === "undefined") {
//             frappe.msgprint("Excel library not loaded.");
//             return;
//         }

//         let data = [["Expense Items", "Budget", "Actuals", "Util %", "Variance"]];
//         let grand_budget = 0;
//         let grand_actuals = 0;

//         expense_heads.forEach(head => {
//             const hB = Number(head.ytd || 0);
//             const hA = Number(head.total_posted_amt_ytd || 0);
//             grand_budget  += hB;
//             grand_actuals += hA;
//             data.push([head.name, hB, hA, safePercentage(hB, hA), hB - hA]);

//             (head.sub_heads || []).forEach(sub => {
//                 const sB = Number(sub.ytd || 0);
//                 const sA = Number(sub.total_posted_amt_ytd || 0);
//                 data.push(["   " + sub.name, sB, sA, safePercentage(sB, sA), sB - sA]);
//                 (sub.items || []).forEach(item => {
//                     const b = Number(item.ytd || 0);
//                     const a = Number(item.total_posted_amt || 0);
//                     data.push(["      " + item.name, b, a, safePercentage(b, a), b - a]);
//                 });
//             });

//             (head.items || []).forEach(item => {
//                 const b = Number(item.ytd || 0);
//                 const a = Number(item.total_posted_amt || 0);
//                 data.push(["   " + item.name, b, a, safePercentage(b, a), b - a]);
//             });
//         });

//         data.push(["GRAND TOTAL", grand_budget, grand_actuals,
//             safePercentage(grand_budget, grand_actuals), grand_budget - grand_actuals]);

//         const ws = XLSX.utils.aoa_to_sheet(data);
//         ws["!cols"] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
//         XLSX.writeFile(wb, "Expense_Report.xlsx");
//     }

//     /* =====================================================
//        STATE
//     =====================================================*/
//     let expense_heads    = [];
//     let expandedHeads    = [];
//     let expandedSubHeads = [];
//     let searchText       = "";

//     const formatNumber = n =>
//         (Number(n) || 0).toLocaleString('en-IN', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });

//     function matchesSearch(...values) {
//         return values.some(v =>
//             String(v || "").toLowerCase().includes(searchText.toLowerCase())
//         );
//     }

//     function getSelectedWithKey(control, key) {
//         if (!control || !control.get_value) return [];
//         return (control.get_value() || [])
//             .map(val => {
//                 let option = (control.df?.options || []).find(
//                     o => String(o?.value) === String(val)
//                 );
//                 return option?.[key] || null;
//             })
//             .filter(Boolean);
//     }

//     /* ------------------------------------------------
//        LOAD COST CENTERS / LOCATION CODES
//     --------------------------------------------------*/
//     function loadCostCenters(units) {
//         cost_center_filter.set_value([]);
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 let api_options = (r.message?.data || [])
//                     .filter(d => d.value)
//                     .map(d => ({
//                         label: d.label,
//                         value: String(d.value),
//                         description: "",
//                         erp_cost_center_value: String(d.erp_cost_center_value)
//                     }));
//                 cost_center_filter.df.options = mergeSelectedOptions(cost_center_filter, api_options);
//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     function loadLocationCodes(units) {
//         location_code_filter.set_value([]);
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 let api_options = (r.message?.data || [])
//                     .filter(d => d.value)
//                     .map(d => ({
//                         label: d.label,
//                         value: String(d.value),
//                         description: "",
//                         erp_loc_value: String(d.erp_loc_value)
//                     }));
//                 location_code_filter.df.options = mergeSelectedOptions(location_code_filter, api_options);
//                 location_code_filter.refresh();
//             }
//         });
//     }

//     /* ------------------------------------------------
//        LOAD DATA
//     --------------------------------------------------*/
//     function loadData() {
//         let financial_year       = fiscal_year_filter.get_value();
//         let month                = month_filter.get_value();
//         let unit                 = (unit_filter.get_value() || []).join(",") || null;
//         let location_code        = (getSelectedWithKey(location_code_filter, "value") || []).join(",") || null;
//         let cost_center          = (getSelectedWithKey(cost_center_filter, "value") || []).join(",") || null;
//         let erp_cost_center_value = (getSelectedWithKey(cost_center_filter, "erp_cost_center_value") || []).join(",") || null;
//         let erp_loc_value        = (getSelectedWithKey(location_code_filter, "erp_loc_value") || []).join(",") || null;

//         let missing = [];
//         if (!financial_year) missing.push("Financial Year");
//         if (!month)          missing.push("Month");
//         if (!unit)           missing.push("Unit");

//         if (missing.length) {
//             console.warn("⚠ Missing Filters:", missing.join(", "));
//             return;
//         }

//         Loader.show("We're crafting your report with care");

//         $('#expand-all-checkbox').prop('checked', false);
//         $('#global-search-box').val("");
//         expandedHeads    = [];
//         expandedSubHeads = [];
//         searchText       = "";

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_combined_actuals",
//             args: { financial_year, month, unit, cost_center, location_code, erp_loc_value, erp_cost_center_value }
//         })
//         .done(function(r) {
//             expense_heads = Array.isArray(r.message)
//                 ? r.message
//                 : (r.message?.message || []);
//             console.log(r, "API response");
//             renderTable();
//         })
//         .fail(function(err) {
//             console.error("API Error:", err);
//             frappe.msgprint({ title: "Error", message: "Failed to load data. Please try again.", indicator: "red" });
//         })
//         .always(function() {
//             Loader.hide();
//         });
//     }

//     function safePercentage(budget, actual) {
//         if (!budget || budget === 0) return "0.00";
//         return ((actual / budget) * 100).toFixed(2);
//     }

//     /* ------------------------------------------------
//        RENDER TABLE
//     --------------------------------------------------*/
//     function renderTable() {
//         renderCards(expense_heads);

//         const $table = $('#phase-table');
//         $table.html('');

//         if (!expense_heads || !expense_heads.length) {
//             $table.append(`<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No Data Found</td></tr>`);
//             return;
//         }

//         $table.append(`
//             <thead>
//                 <tr class="main-row">
//                     <th>Expense Head</th>
//                     <th>Budget</th>
//                     <th>Actuals</th>
//                     <th>Util %</th>
//                     <th>Variance</th>
//                 </tr>
//             </thead>
//         `);

//         const $tbody     = $('<tbody></tbody>');
//         let grand_budget  = 0;
//         let grand_actuals = 0;

//         expense_heads.forEach(head => {
//             if (
//                 searchText &&
//                 !matchesSearch(head.name) &&
//                 !(head.items || []).some(i => matchesSearch(i.name)) &&
//                 !(head.sub_heads || []).some(s =>
//                     matchesSearch(s.name) ||
//                     (s.items || []).some(i => matchesSearch(i.name))
//                 )
//             ) return;

//             const headBudget = Number(head.ytd || 0);
//             const headActual = Number(head.total_posted_amt_ytd || 0);
//             const headTotal  = headBudget - headActual;
//             const headPer    = safePercentage(headBudget, headActual);

//             grand_budget  += headBudget;
//             grand_actuals += headActual;

//             $tbody.append(`
//                 <tr class="expense-head" data-head="${head.name}">
//                     <td>
//                         ${(head.items?.length || head.sub_heads?.length)
//                             ? (expandedHeads.includes(head.name) ? '▼' : '▶')
//                             : ''}
//                         ${head.name}
//                     </td>
//                     <td>${formatNumber(headBudget)}</td>
//                     <td>${formatNumber(headActual)}</td>
//                     <td class="text-blue">${headPer} %</td>
//                     <td class="text-blue">${formatNumber(headTotal)}</td>
//                 </tr>
//             `);

//             if (expandedHeads.includes(head.name)) {

//                 (head.items || []).forEach(item => {
//                     if (searchText && !matchesSearch(item.name)) return;
//                     const budget    = Number(item.ytd || 0);
//                     const actual    = Number(item.total_posted_amt || 0);
//                     const total     = budget - actual;
//                     const total_per = safePercentage(budget, actual);
//                     $tbody.append(`
//                         <tr class="line-item">
//                             <td style="padding-left:35px">${item.name}</td>
//                             <td>${formatNumber(budget)}</td>
//                             <td>${formatNumber(actual)}</td>
//                             <td>${total_per} %</td>
//                             <td>${formatNumber(total)}</td>
//                         </tr>
//                     `);
//                 });

//                 (head.sub_heads || []).forEach(sub => {
//                     const key       = head.name + "__" + sub.name;
//                     const subBudget = Number(sub.ytd || 0);
//                     const subActual = Number(sub.total_posted_amt_ytd || 0);
//                     const subTotal  = subBudget - subActual;
//                     const subPer    = safePercentage(subBudget, subActual);

//                     $tbody.append(`
//                         <tr class="sub-head" data-sub="${key}">
//                             <td style="padding-left:20px">
//                                 ${(sub.items?.length)
//                                     ? (expandedSubHeads.includes(key) ? '▼' : '▶')
//                                     : ''}
//                                 ${sub.name}
//                             </td>
//                             <td>${formatNumber(subBudget)}</td>
//                             <td>${formatNumber(subActual)}</td>
//                             <td class="text-blue">${subPer} %</td>
//                             <td class="text-blue">${formatNumber(subTotal)}</td>
//                         </tr>
//                     `);

//                     if (expandedSubHeads.includes(key)) {
//                         (sub.items || []).forEach(item => {
//                             const budget    = Number(item.ytd || 0);
//                             const actual    = Number(item.total_posted_amt || 0);
//                             const total     = budget - actual;
//                             const total_per = safePercentage(budget, actual);
//                             $tbody.append(`
//                                 <tr class="line-item">
//                                     <td style="padding-left:55px">${item.name}</td>
//                                     <td>${formatNumber(budget)}</td>
//                                     <td>${formatNumber(actual)}</td>
//                                     <td>${total_per} %</td>
//                                     <td>${formatNumber(total)}</td>
//                                 </tr>
//                             `);
//                         });
//                     }
//                 });
//             }
//         });

//         const grand_total = grand_budget - grand_actuals;
//         const grandPer    = safePercentage(grand_budget, grand_actuals);

//         $tbody.append(`
//             <tr class="grand-total-row">
//                 <td>GRAND TOTAL</td>
//                 <td>${formatNumber(grand_budget)}</td>
//                 <td>${formatNumber(grand_actuals)}</td>
//                 <td>${grandPer} %</td>
//                 <td>${formatNumber(grand_total)}</td>
//             </tr>
//         `);

//         $table.append($tbody);

//         /* ── Sync Expand All checkbox ── */
//         const allHeads   = expense_heads.map(h => h.name);
//         const allSubKeys = [];
//         expense_heads.forEach(h => {
//             (h.sub_heads || []).forEach(s => allSubKeys.push(h.name + "__" + s.name));
//         });
//         const allExpanded =
//             allHeads.length > 0 &&
//             allHeads.every(n => expandedHeads.includes(n)) &&
//             allSubKeys.every(k => expandedSubHeads.includes(k));
//         $('#expand-all-checkbox').prop('checked', allExpanded);

//         /* ── Row click handlers ── */
//         $('.expense-head').off('click').on('click', function () {
//             const name = $(this).data('head');
//             expandedHeads = expandedHeads.includes(name)
//                 ? expandedHeads.filter(x => x !== name)
//                 : [...expandedHeads, name];
//             renderTable();
//         });

//         $('.sub-head').off('click').on('click', function () {
//             const key = $(this).data('sub');
//             expandedSubHeads = expandedSubHeads.includes(key)
//                 ? expandedSubHeads.filter(x => x !== key)
//                 : [...expandedSubHeads, key];
//             renderTable();
//         });
//     }

//     /* ------------------------------------------------
//        RENDER CARDS
//     --------------------------------------------------*/
//     function renderCards(data) {
//         const cards_container = $('#cards-container');
//         cards_container.empty();

//         let grand_budget = 0;
//         let grand_actual = 0;
//         let cards_html   = "";

//         data.forEach(head => {
//             grand_budget += Number(head.ytd || 0);
//             grand_actual += Number(head.total_posted_amt_ytd || 0);
//         });

//         cards_html += createCard("Grand Total", grand_budget, grand_actual, grand_budget - grand_actual, true);

//         data.forEach(head => {
//             const hB = Number(head.ytd || 0);
//             const hA = Number(head.total_posted_amt_ytd || 0);
//             cards_html += createCard(head.name, hB, hA, hB - hA);

//             (head.sub_heads || []).forEach(sub => {
//                 const sB = Number(sub.ytd || 0);
//                 const sA = Number(sub.total_posted_amt_ytd || 0);
//                 cards_html += createCard(sub.name, sB, sA, sB - sA, false, true);
//             });
//         });

//         cards_container.append(cards_html);
//     }

//     function createCard(title, budget, actual, variance, isGrand = false, isSub = false) {
//         const utilization = budget > 0 ? ((actual / budget) * 100).toFixed(2) : "0.00";
//         return `
//             <div class="number-card ${isGrand ? 'grand' : ''} ${isSub ? 'sub' : ''}">
//                 <div class="number-title">${title}</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${formatNumber(budget)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${formatNumber(actual)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${formatNumber(variance)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value">${utilization} %</div>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }
// };






// frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {

//     /* =====================================================
//        STYLES
//     ===================================================== */
//     const style = `<style>
//     /* ══════════════════════════════════════════
//        BASE / DESKTOP
//     ══════════════════════════════════════════ */
//     #tables-container {
//         margin: 20px;
//         background-color: #ffffff;
//         border-radius: 8px;
//         padding: 8px;
//     }

//     /* ── Controls row ── */
//     #controls-row {
//         display: flex;
//         flex-wrap: wrap;
//         justify-content: space-between;
//         align-items: center;
//         gap: 8px;
//         margin-bottom: 12px;
//         padding: 8px 10px;
//         background: #f7f9fb;
//         border: 1px solid #dcdcdc;
//         border-radius: 6px;
//     }

//     #global-search-box {
//         flex: 1 1 200px;
//         min-width: 0;
//         max-width: 320px;
//         padding: 7px 12px;
//         border: 1px solid #aaa;
//         border-radius: 6px;
//         font-size: 13px;
//         box-sizing: border-box;
//     }

//     #controls-right {
//         display: flex;
//         flex-wrap: wrap;
//         align-items: center;
//         gap: 12px;
//     }

//     /* ── Expand-All checkbox ── */
//     #expand-all-wrapper {
//         display: flex;
//         align-items: center;
//         gap: 7px;
//         font-size: 13px;
//         font-weight: 600;
//         color: #444;
//         cursor: pointer;
//         user-select: none;
//         white-space: nowrap;
//     }

//     #expand-all-checkbox {
//         width: 16px;
//         height: 16px;
//         accent-color: #0076B6;
//         cursor: pointer;
//     }

//     /* ── Export button ── */
//     #export-excel-btn {
//         display: inline-flex;
//         align-items: center;
//         gap: 6px;
//         padding: 6px 14px;
//         font-size: 13px;
//         font-weight: 600;
//         color: #fff !important;
//         background-color: #0076B6;
//         border: 1px solid #0076B6;
//         border-radius: 6px;
//         cursor: pointer;
//         transition: background .15s ease, box-shadow .15s ease;
//         white-space: nowrap;
//         line-height: 1.5;
//         box-shadow: 0 1px 3px rgba(0,0,0,.12);
//         text-decoration: none;
//     }

//     #export-excel-btn:hover {
//         background-color: #005f94;
//         border-color: #005f94;
//         box-shadow: 0 3px 8px rgba(0,118,182,.35);
//     }

//     #export-excel-btn:active {
//         background-color: #004f7a;
//         border-color: #004f7a;
//         box-shadow: none;
//     }

//     /* ── Table wrapper ── */
//     .scroll-wrapper {
//         border: 1px solid #ccc;
//         border-radius: 6px;
//         overflow-x: auto;
//         overflow-y: auto;
//         max-height: 70vh;
//         background: #fff;
//         -webkit-overflow-scrolling: touch;
//     }

//     table.university-table {
//         min-width: 600px;
//         width: 100%;
//         border-collapse: collapse;
//         font-size: 13px;
//     }

//     table.university-table th,
//     table.university-table td {
//         border: 1px solid #ddd;
//         padding: 8px 10px;
//         white-space: nowrap;
//         vertical-align: middle;
//         text-align: center;
//         background: #fff !important;
//     }

//     table.university-table th:first-child,
//     table.university-table td:first-child {
//         text-align: left !important;
//         white-space: normal;
//         word-break: break-word;
//     }

//     table.university-table thead tr.main-row th {
//         background-color: #0076B6 !important;
//         color: #fff !important;
//         position: sticky;
//         top: 0;
//         z-index: 25;
//     }

//     tr.expense-head {
//         font-weight: 700;
//         cursor: pointer;
//     }

//     tr.expense-head:hover td {
//         background: #F4F9FD !important;
//     }

//     tr.sub-head {
//         background-color: #FFF3E6 !important;
//         font-weight: 600;
//         cursor: pointer;
//     }

//     tr.sub-head:hover td {
//         background-color: #FFEAD5 !important;
//     }

//     tr.line-item td:first-child {
//         padding-left: 35px !important;
//     }

//     tr.sub-head td:first-child {
//         padding-left: 20px !important;
//     }

//     .text-blue {
//         color: #0076B6;
//         font-weight: 600;
//     }

//     tr.grand-total-row td {
//         background: #003B63 !important;
//         color: #fff !important;
//         font-weight: 700 !important;
//     }

//     /* ── Cards ── */
//     .card-row {
//         display: grid;
//         grid-template-columns: repeat(4, 1fr);
//         gap: 14px;
//         margin: 14px 0;
//         margin-bottom: 16px;
//     }

//     .number-card {
//         background: #ffffff;
//         border: 1px solid #dcdcdc;
//         border-radius: 8px;
//         padding: 14px 16px;
//         box-shadow: 0 2px 6px rgba(0,0,0,.06);
//         transition: transform .15s ease, box-shadow .15s ease;
//     }

//     .number-card:hover {
//         transform: translateY(-2px);
//         box-shadow: 0 6px 14px rgba(0,0,0,.12);
//     }

//     .number-title {
//         font-size: 12px;
//         font-weight: 600;
//         color: #666;
//         text-transform: uppercase;
//         margin-bottom: 6px;
//         overflow: hidden;
//         text-overflow: ellipsis;
//         white-space: nowrap;
//     }

//     .number-value {
//         font-size: 20px;
//         font-weight: 700;
//         color: #0076B6;
//     }

//     .number-card.grand {
//         border: 2px solid #0076B6;
//         background: #F4F9FD;
//     }

//     .number-card.grand .number-value {
//         font-size: 24px;
//         font-weight: 800;
//     }

//     .number-card.sub {
//         background: #fafafa;
//         border-left: 4px solid #ccc;
//     }

//     .kpi-row,
//     .kpi-bottom {
//         display: flex;
//         justify-content: space-between;
//         margin-top: 8px;
//     }

//     .kpi-block { text-align: left; }

//     .kpi-label {
//         font-size: 11px;
//         color: #777;
//         text-transform: uppercase;
//     }

//     .kpi-value {
//         font-size: 14px;
//         font-weight: 700;
//         color: #000;
//     }

//     .kpi-bottom {
//         margin-top: 10px;
//         padding-top: 8px;
//         border-top: 1px solid #eee;
//     }

//     /* ── Loader ── */
//     #global-loader.loader-overlay {
//         position: fixed;
//         inset: 0;
//         width: 100vw;
//         height: 100vh;
//         background: rgba(18,18,18,0.92);
//         backdrop-filter: blur(6px);
//         z-index: 999999;
//         display: none;
//         align-items: center;
//         justify-content: center;
//     }

//     #global-loader.loader-overlay.active {
//         display: flex;
//     }

//     .loader-box {
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: center;
//         gap: 14px;
//     }

//     .loader-logo {
//         width: 90px;
//         height: 90px;
//         border-radius: 50%;
//         background: linear-gradient(145deg, #ffffff, #eaeaea);
//         padding: 14px;
//         object-fit: contain;
//         box-shadow: 0 10px 30px rgba(0,0,0,.35), 0 0 0 4px rgba(255,255,255,.08);
//         animation: pulse 1.6s infinite ease-in-out;
//     }

//     .loader-text {
//         margin-top: 6px;
//         font-size: 14px;
//         color: #ffffff;
//         font-weight: 600;
//         letter-spacing: 0.5px;
//         text-align: center;
//         opacity: 0.85;
//     }

//     @keyframes pulse {
//         0%   { transform: scale(1);    opacity: 0.8; }
//         50%  { transform: scale(1.08); opacity: 1; }
//         100% { transform: scale(1);    opacity: 0.8; }
//     }

//     /* ── Filter row ── */
//     .custom-filter-row {
//         padding: 15px 20px;
//         background: #fff;
//         border-radius: 6px;
//         margin-top: 10px;
//     }
//     .custom-filter-row.row {
//         margin-left: 0;
//         margin-right: 0;
//     }

//     /* ── Select All button ── */
//     .custom-select-all-btn {
//         margin-right: 8px;
//     }

//     /* ══════════════════════════════════════════
//        TABLET  ≤ 1024px
//     ══════════════════════════════════════════ */
//     @media (max-width: 1024px) {
//         .card-row {
//             grid-template-columns: repeat(2, 1fr);
//         }
//         #global-search-box {
//             max-width: 100%;
//         }
//     }

//     /* ══════════════════════════════════════════
//        MOBILE  ≤ 768px
//     ══════════════════════════════════════════ */
//     @media (max-width: 768px) {
//         #tables-container {
//             margin: 6px;
//             padding: 6px;
//         }

//         #controls-row {
//             flex-direction: column;
//             align-items: stretch;
//             padding: 8px;
//         }

//         #global-search-box {
//             max-width: 100%;
//             width: 100%;
//         }

//         #controls-right {
//             justify-content: space-between;
//             width: 100%;
//         }

//         #export-excel-btn {
//             flex: 1;
//             justify-content: center;
//         }

//         .card-row {
//             grid-template-columns: 1fr 1fr;
//             margin: 6px 0;
//             gap: 8px;
//         }

//         .number-card {
//             padding: 10px 12px;
//         }

//         .number-card.grand .number-value {
//             font-size: 18px;
//         }

//         .number-value {
//             font-size: 16px;
//         }

//         table.university-table {
//             font-size: 11px;
//         }

//         table.university-table th,
//         table.university-table td {
//             padding: 5px 6px;
//         }

//         tr.line-item td:first-child {
//             padding-left: 20px !important;
//         }

//         tr.sub-head td:first-child {
//             padding-left: 14px !important;
//         }

//         .custom-filter-row {
//             padding: 10px;
//         }

//         .custom-filter-row .col-md-4 {
//             width: 100%;
//             margin-bottom: 8px;
//         }
//     }

//     /* ══════════════════════════════════════════
//        SMALL MOBILE  ≤ 480px
//     ══════════════════════════════════════════ */
//     @media (max-width: 480px) {
//         .card-row {
//             grid-template-columns: 1fr;
//         }

//         #controls-right {
//             flex-direction: column;
//             gap: 8px;
//         }

//         #expand-all-wrapper {
//             width: 100%;
//         }

//         #export-excel-btn {
//             width: 100%;
//         }

//         table.university-table {
//             font-size: 10px;
//             min-width: 420px;
//         }

//         table.university-table th,
//         table.university-table td {
//             padding: 4px 5px;
//         }
//     }
//     </style>`;

//     $('head').append(style);

//     /* ── Loader element (create once) ── */
//     if (!$("#global-loader").length) {
//         $("body").append(`
//             <div id="global-loader" class="loader-overlay">
//                 <div class="loader-box">
//                     <img src="/files/APF logo.png" class="loader-logo" alt="Loading">
//                     <div class="loader-text">Loading, please wait…</div>
//                 </div>
//             </div>
//         `);
//     }

//     /* FIX: loader was using display:none + display:flex conflict.
//        Use a CSS class toggle instead. */
//     const Loader = {
//         show(message = "Loading, please wait…") {
//             const $loader = $("#global-loader");
//             $loader.find(".loader-text").text(message);
//             $loader.addClass("active");
//         },
//         hide() {
//             $("#global-loader").removeClass("active");
//         }
//     };

//     /* =====================================================
//        PAGE
//     ===================================================== */
//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget vs Actuals Face Sheet',
//         single_column: true
//     });

//     /* ─────────────────────────────────────────────────────
//        FILTER SECTION
//     ───────────────────────────────────────────────────── */
//     let filter_section = $(`<div class="frappe-control-group row custom-filter-row"></div>`)
//         .appendTo(page.body);

//     function make_field() {
//         return $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);
//     }

//     /* FIX: mergeSelectedOptions – guard against missing control.df.options */
//     function mergeSelectedOptions(control, new_options) {
//         let selected = (control.get_value() || []).map(String);
//         let existing = (control.df && control.df.options) ? control.df.options : [];
//         let map = {};
//         existing.forEach(o => { if (o && o.value != null) map[String(o.value)] = o; });
//         new_options.forEach(o => { if (o && o.value != null) map[String(o.value)] = o; });
//         selected.forEach(v => {
//             if (!map[v]) map[v] = { label: v, value: v, description: "" };
//         });
//         return Object.values(map);
//     }

//     /* FIX: addSelectAllButton – attach on focus safely, handle async get_data properly */
//     function addSelectAllButton(control, fieldnameForDebug) {
//         if (!control || !control.$input) return;

//         control.$input.on("focus", function () {
//             setTimeout(function () {
//                 const $dropdown = $('.multiselect-dropdown:visible').last();
//                 if (!$dropdown.length) return;

//                 const $actions = $dropdown.find('.multiselect-actions');
//                 if (!$actions.length) return;

//                 /* Remove stale injected buttons */
//                 $actions.find('.custom-select-all-btn').remove();

//                 const $btn = $(`
//                     <button type="button"
//                         class="btn btn-xs btn-default custom-select-all-btn">
//                         Select All
//                     </button>
//                 `);

//                 $btn.on("click", function (e) {
//                     e.stopPropagation();
//                     e.preventDefault();

//                     /* FIX: handle both Promise-returning get_data and plain arrays */
//                     function applyValues(data) {
//                         let values = data.map(d => String(d.value != null ? d.value : d));
//                         if (values.length) control.set_value(values);
//                     }

//                     if (control.get_data) {
//                         let result = control.get_data();
//                         if (result && typeof result.then === "function") {
//                             result.then(applyValues).catch(function (err) {
//                                 console.error("[" + fieldnameForDebug + "] Select All error:", err);
//                             });
//                         } else if (Array.isArray(result)) {
//                             applyValues(result);
//                         }
//                     } else if (control.df && Array.isArray(control.df.options)) {
//                         applyValues(control.df.options.map(o =>
//                             typeof o === "object" ? o : { value: o }
//                         ));
//                     }
//                 });

//                 $actions.prepend($btn);
//             }, 120);
//         });
//     }

//     /* ── Financial Year ── */
//     // let fy_col = make_field();
//     // let fiscal_year_filter = frappe.ui.form.make_control({
//     //     parent: fy_col,
//     //     df: {
//     //         label: "Financial Year",
//     //         fieldtype: "Select",
//     //         fieldname: "financial_year",
//     //         options: ["2024-25", "2025-26", "2026-27", "2027-28"].join("\n"),
//     //         default: "2025-26",
//     //         reqd: 1
//     //     },
//     //     render_input: true
//     // });
//     // fiscal_year_filter.set_value("2025-26");
//     let fy_col = make_field();

//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: fy_col,
//         df: {
//             label: "Financial Year",
//             fieldtype: "Select",
//             fieldname: "financial_year",
//             reqd: 1,
//             change() {
//                 let y = this.get_value();
//                 if (!y) return;

//                 updatePageTitle(y);
//                 TabLoader.resetAll();

//                 let activeTab = $('#cb-tab-nav .cb-tab-link.active').data('tab');
//                 if (activeTab) {
//                     TabLoader.trigger(activeTab);
//                 }
//             }
//         },
//         render_input: true
//     });

//     fiscal_year_filter.refresh();


//     // ---------- Fetch FY from API ----------
//     frappe.call({
//         method: "annual_budget.api.filter_options.get_financial_year_list",
//         callback: function (r) {

//             if (r.message && r.message.length) {

//                 let years = r.message.map(d => d.financial_year);

//                 // set dropdown options
//                 fiscal_year_filter.df.options = years.join("\n");
//                 fiscal_year_filter.refresh();


//                 // ---------- Calculate Current FY ----------
//                 let today = new Date();
//                 let year = today.getFullYear();
//                 let month = today.getMonth() + 1;

//                 let currentFY;

//                 if (month >= 4) {
//                     currentFY = year + "-" + String(year + 1).slice(-2);
//                 } else {
//                     currentFY = (year - 1) + "-" + String(year).slice(-2);
//                 }


//                 // ---------- Set Default ----------
//                 if (years.includes(currentFY)) {
//                     fiscal_year_filter.set_value(currentFY);
//                     updatePageTitle(currentFY);
//                 } else {
//                     fiscal_year_filter.set_value(years[0]);
//                     updatePageTitle(years[0]);
//                 }
//             }
//         }
//     });

//     /* ── YTD Month ── */
//     let month_col = make_field();
//     let currentMonth = new Date().toLocaleString('default', { month: 'long' });
//     let month_filter = frappe.ui.form.make_control({
//         parent: month_col,
//         df: {
//             label: "YTD Month",
//             fieldtype: "Select",
//             fieldname: "month",
//             options: [
//                 "January","February","March","April","May","June",
//                 "July","August","September","October","November","December"
//             ].join("\n"),
//             reqd: 1
//         },
//         render_input: true
//     });
//     month_filter.set_value(currentMonth);

//     /* ── Theme ── */
//     let theme_col = make_field();
//     let theme_filter = frappe.ui.form.make_control({
//         parent: theme_col,
//         df: {
//             label: "Operating Units",
//             fieldtype: "MultiSelectList",
//             fieldname: "theme",
//             get_data: function () {
//                 return frappe.call({
//                     method: "annual_budget.api.filter_options.get_theme"
//                 }).then(function (r) {
//                     return (r.message || []).map(function (d) {
//                         return {
//                             label: d.number_card_title,
//                             value: d.name,
//                             description: ""
//                         };
//                     });
//                 });
//             }
//         },
//         render_input: true
//     });
//     addSelectAllButton(theme_filter, "Operating Units");

//     /* ── Unit ── */
//     let unit_col = make_field();
//     let unit_filter = frappe.ui.form.make_control({
//         parent: unit_col,
//         df: {
//             label: "Unit",
//             fieldtype: "MultiSelectList",
//             fieldname: "unit",
//             reqd: 1,
//             get_data: function () {
//                 return frappe.call({
//                     method: "annual_budget.api.filter_options.get_units"
//                 }).then(function (r) {
//                     return (r.message && r.message.data ? r.message.data : [])
//                         .filter(function (d) { return d.value; })
//                         .map(function (d) {
//                             return { label: d.label, value: String(d.value), description: "" };
//                         });
//                 });
//             },
//             change: function () {
//                 let units = (unit_filter.get_value() || []).map(String);
//                 cost_center_filter.set_value([]);
//                 location_code_filter.set_value([]);
//                 cost_center_filter.df.options = [];
//                 cost_center_filter.refresh();
//                 location_code_filter.df.options = [];
//                 location_code_filter.refresh();
//                 if (units.length) {
//                     loadCostCenters(units);
//                     loadLocationCodes(units);
//                 }
//             }
//         },
//         render_input: true
//     });
//     addSelectAllButton(unit_filter, "Unit");

//     /* ── Cost Center ── */
//     let cc_col = make_field();
//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: cc_col,
//         df: {
//             label: "Cost Center",
//             fieldtype: "MultiSelectList",
//             fieldname: "cost_center",
//             options: []
//         },
//         render_input: true
//     });
//     addSelectAllButton(cost_center_filter, "Cost Center");

//     /* ── Location Code ── */
//     let lc_col = make_field();
//     let location_code_filter = frappe.ui.form.make_control({
//         parent: lc_col,
//         df: {
//             label: "Location Code",
//             fieldtype: "MultiSelectList",
//             fieldname: "location_code",
//             options: []
//         },
//         render_input: true
//     });
//     addSelectAllButton(location_code_filter, "Location Code");

//     /* ── Get Report button ── */
//     let btn_col = make_field();
//     let load_button = frappe.ui.form.make_control({
//         parent: btn_col,
//         df: {
//             label: " ",
//             fieldtype: "Button",
//             fieldname: "load_button",
//             click: function () { loadData(); }
//         },
//         render_input: true
//     });
//     load_button.$wrapper.find('button').addClass("btn-primary").text("Get Report");
//     load_button.$wrapper.css("margin-top", "26px");

//     /* ── XLSX library ── */
//     frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", function () {
//         console.log("XLSX Loaded");
//     });

//     /* ─────────────────────────────────────────────────────
//        MAIN CONTAINER
//     ───────────────────────────────────────────────────── */
//     const $container = $(`
//         <div id="tables-container">
//             <div class="card-row" id="cards-container"></div>
//             <div id="controls-row">
//                 <input id="global-search-box" type="text"
//                     placeholder="Search Expense / Sub Head / Item…">
//                 <div id="controls-right">
//                     <label id="expand-all-wrapper">
//                         <input type="checkbox" id="expand-all-checkbox">
//                         Expand All
//                     </label>
//                     <button id="export-excel-btn">↓ Export to Excel</button>
//                 </div>
//             </div>
//             <div class="scroll-wrapper">
//                 <table class="university-table" id="phase-table"></table>
//             </div>
//         </div>
//     `);
//     $(page.body).append($container);

//     /* ─────────────────────────────────────────────────────
//        STATE
//     ───────────────────────────────────────────────────── */
//     let expense_heads    = [];
//     let expandedHeads    = [];
//     let expandedSubHeads = [];
//     let searchText       = "";

//     /* ─────────────────────────────────────────────────────
//        HELPERS
//     ───────────────────────────────────────────────────── */
//     const formatNumber = function (n) {
//         return (Number(n) || 0).toLocaleString('en-IN', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });
//     };

//     function safePercentage(budget, actual) {
//         budget = Number(budget) || 0;
//         actual = Number(actual) || 0;
//         if (!budget) return "0.00";
//         return ((actual / budget) * 100).toFixed(2);
//     }

//     function matchesSearch() {
//         var args = Array.prototype.slice.call(arguments);
//         var q = searchText.toLowerCase();
//         return args.some(function (v) {
//             return String(v || "").toLowerCase().includes(q);
//         });
//     }

//     /* FIX: getSelectedWithKey – safe option lookup for custom key */
//     function getSelectedWithKey(control, key) {
//         if (!control || !control.get_value) return [];
//         let selected = (control.get_value() || []).map(String);
//         let options  = (control.df && Array.isArray(control.df.options))
//             ? control.df.options : [];
//         return selected.map(function (val) {
//             let opt = options.find(function (o) {
//                 return o && String(o.value) === val;
//             });
//             return opt && opt[key] ? opt[key] : null;
//         }).filter(Boolean);
//     }

//     /* ─────────────────────────────────────────────────────
//        SEARCH
//     ───────────────────────────────────────────────────── */
//     $container.find('#global-search-box').on('input keyup', function () {
//         searchText = $(this).val().trim();

//         if (searchText) {
//             expandedHeads = expense_heads.map(function (h) { return h.name; });
//             expandedSubHeads = [];
//             expense_heads.forEach(function (head) {
//                 (head.sub_heads || []).forEach(function (sub) {
//                     expandedSubHeads.push(head.name + "__" + sub.name);
//                 });
//             });
//         } else {
//             expandedHeads    = [];
//             expandedSubHeads = [];
//             $('#expand-all-checkbox').prop('checked', false);
//         }
//         renderTable();
//     });

//     /* ─────────────────────────────────────────────────────
//        EXPAND ALL
//     ───────────────────────────────────────────────────── */
//     $(document).on('change', '#expand-all-checkbox', function () {
//         if ($(this).is(':checked')) {
//             expandedHeads = expense_heads.map(function (h) { return h.name; });
//             expandedSubHeads = [];
//             expense_heads.forEach(function (head) {
//                 (head.sub_heads || []).forEach(function (sub) {
//                     expandedSubHeads.push(head.name + "__" + sub.name);
//                 });
//             });
//         } else {
//             expandedHeads    = [];
//             expandedSubHeads = [];
//         }
//         renderTable();
//     });

//     /* ─────────────────────────────────────────────────────
//        EXPORT TO EXCEL
//     ───────────────────────────────────────────────────── */
//     $(document).on('click', '#export-excel-btn', function () {
//         exportTableToExcel();
//     });

//     function exportTableToExcel() {
//         if (typeof XLSX === "undefined") {
//             frappe.msgprint("Excel library not loaded yet. Please wait a moment and try again.");
//             return;
//         }

//         let data = [["Expense Items", "Budget", "Actuals", "Util %", "Variance"]];
//         let grand_budget  = 0;
//         let grand_actuals = 0;

//         expense_heads.forEach(function (head) {
//             let hB = Number(head.ytd || 0);
//             let hA = Number(head.total_posted_amt_ytd || 0);
//             grand_budget  += hB;
//             grand_actuals += hA;
//             data.push([head.name, hB, hA, safePercentage(hB, hA), hB - hA]);

//             (head.sub_heads || []).forEach(function (sub) {
//                 let sB = Number(sub.ytd || 0);
//                 let sA = Number(sub.total_posted_amt_ytd || 0);
//                 data.push(["   " + sub.name, sB, sA, safePercentage(sB, sA), sB - sA]);
//                 (sub.items || []).forEach(function (item) {
//                     let b = Number(item.ytd || 0);
//                     let a = Number(item.total_posted_amt || 0);
//                     data.push(["      " + item.name, b, a, safePercentage(b, a), b - a]);
//                 });
//             });

//             (head.items || []).forEach(function (item) {
//                 let b = Number(item.ytd || 0);
//                 let a = Number(item.total_posted_amt || 0);
//                 data.push(["   " + item.name, b, a, safePercentage(b, a), b - a]);
//             });
//         });

//         data.push(["GRAND TOTAL", grand_budget, grand_actuals,
//             safePercentage(grand_budget, grand_actuals), grand_budget - grand_actuals]);

//         let ws = XLSX.utils.aoa_to_sheet(data);
//         ws["!cols"] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
//         let wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
//         XLSX.writeFile(wb, "Expense_Report.xlsx");
//     }

//     /* ─────────────────────────────────────────────────────
//        LOAD COST CENTERS / LOCATION CODES
//     ───────────────────────────────────────────────────── */
//     function loadCostCenters(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback: function (r) {
//                 let api_options = (r.message && r.message.data ? r.message.data : [])
//                     .filter(function (d) { return d.value; })
//                     .map(function (d) {
//                         return {
//                             label: d.label,
//                             value: String(d.value),
//                             description: "",
//                             erp_cost_center_value: String(d.erp_cost_center_value || "")
//                         };
//                     });
//                 cost_center_filter.df.options = mergeSelectedOptions(cost_center_filter, api_options);
//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     function loadLocationCodes(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback: function (r) {
//                 let api_options = (r.message && r.message.data ? r.message.data : [])
//                     .filter(function (d) { return d.value; })
//                     .map(function (d) {
//                         return {
//                             label: d.label,
//                             value: String(d.value),
//                             description: "",
//                             erp_loc_value: String(d.erp_loc_value || "")
//                         };
//                     });
//                 location_code_filter.df.options = mergeSelectedOptions(location_code_filter, api_options);
//                 location_code_filter.refresh();
//             }
//         });
//     }

//     /* ─────────────────────────────────────────────────────
//        LOAD DATA
//     ───────────────────────────────────────────────────── */
//     function loadData() {
//         let financial_year        = fiscal_year_filter.get_value();
//         let month                 = month_filter.get_value();
//         let unit                  = (unit_filter.get_value() || []).join(",") || null;
//         let cost_center           = (getSelectedWithKey(cost_center_filter, "value") || []).join(",") || null;
//         let location_code         = (getSelectedWithKey(location_code_filter, "value") || []).join(",") || null;
//         let erp_cost_center_value = (getSelectedWithKey(cost_center_filter, "erp_cost_center_value") || []).join(",") || null;
//         let erp_loc_value         = (getSelectedWithKey(location_code_filter, "erp_loc_value") || []).join(",") || null;

//         let missing = [];
//         if (!financial_year) missing.push("Financial Year");
//         if (!month)          missing.push("Month");
//         if (!unit)           missing.push("Unit");

//         if (missing.length) {
//             frappe.msgprint({
//                 title: "Required Filters",
//                 message: "Please select: " + missing.join(", "),
//                 indicator: "orange"
//             });
//             return;
//         }

//         Loader.show("We're crafting your report with care…");

//         $('#expand-all-checkbox').prop('checked', false);
//         $('#global-search-box').val("");
//         expandedHeads    = [];
//         expandedSubHeads = [];
//         searchText       = "";

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_combined_actuals",
//             args: { financial_year, month, unit, cost_center, location_code, erp_loc_value, erp_cost_center_value }
//         })
//         .done(function (r) {
//             expense_heads = Array.isArray(r.message)
//                 ? r.message
//                 : (r.message && r.message.message ? r.message.message : []);
//             renderTable();
//         })
//         .fail(function (err) {
//             console.error("API Error:", err);
//             frappe.msgprint({
//                 title: "Error",
//                 message: "Failed to load data. Please try again.",
//                 indicator: "red"
//             });
//         })
//         .always(function () {
//             Loader.hide();
//         });
//     }

//     /* ─────────────────────────────────────────────────────
//        RENDER TABLE
//     ───────────────────────────────────────────────────── */
//     function renderTable() {
//         renderCards(expense_heads);

//         let $table = $('#phase-table');
//         $table.html('');

//         if (!expense_heads || !expense_heads.length) {
//             $table.append(`<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No Data Found</td></tr>`);
//             return;
//         }

//         $table.append(`
//             <thead>
//                 <tr class="main-row">
//                     <th>Expense Head</th>
//                     <th>Budget</th>
//                     <th>Actuals</th>
//                     <th>Util %</th>
//                     <th>Variance</th>
//                 </tr>
//             </thead>
//         `);

//         let $tbody        = $('<tbody></tbody>');
//         let grand_budget  = 0;
//         let grand_actuals = 0;

//         expense_heads.forEach(function (head) {
//             /* Search filter */
//             if (searchText &&
//                 !matchesSearch(head.name) &&
//                 !(head.items || []).some(function (i) { return matchesSearch(i.name); }) &&
//                 !(head.sub_heads || []).some(function (s) {
//                     return matchesSearch(s.name) ||
//                         (s.items || []).some(function (i) { return matchesSearch(i.name); });
//                 })
//             ) return;

//             let headBudget = Number(head.ytd || 0);
//             let headActual = Number(head.total_posted_amt_ytd || 0);
//             let headTotal  = headBudget - headActual;
//             let headPer    = safePercentage(headBudget, headActual);

//             grand_budget  += headBudget;
//             grand_actuals += headActual;

//             let hasChildren = (head.items && head.items.length) || (head.sub_heads && head.sub_heads.length);
//             let isExpanded  = expandedHeads.includes(head.name);

//             $tbody.append(`
//                 <tr class="expense-head" data-head="${frappe.utils.escape_html(head.name)}">
//                     <td>
//                         ${hasChildren ? (isExpanded ? '▼ ' : '▶ ') : ''}
//                         ${frappe.utils.escape_html(head.name)}
//                     </td>
//                     <td>${formatNumber(headBudget)}</td>
//                     <td>${formatNumber(headActual)}</td>
//                     <td class="text-blue">${headPer}%</td>
//                     <td class="text-blue">${formatNumber(headTotal)}</td>
//                 </tr>
//             `);

//             if (isExpanded) {
//                 /* Direct items under head */
//                 (head.items || []).forEach(function (item) {
//                     if (searchText && !matchesSearch(item.name)) return;
//                     let b = Number(item.ytd || 0);
//                     let a = Number(item.total_posted_amt || 0);
//                     $tbody.append(`
//                         <tr class="line-item">
//                             <td>${frappe.utils.escape_html(item.name)}</td>
//                             <td>${formatNumber(b)}</td>
//                             <td>${formatNumber(a)}</td>
//                             <td>${safePercentage(b, a)}%</td>
//                             <td>${formatNumber(b - a)}</td>
//                         </tr>
//                     `);
//                 });

//                 /* Sub-heads */
//                 (head.sub_heads || []).forEach(function (sub) {
//                     let key       = head.name + "__" + sub.name;
//                     let subBudget = Number(sub.ytd || 0);
//                     let subActual = Number(sub.total_posted_amt_ytd || 0);
//                     let subPer    = safePercentage(subBudget, subActual);
//                     let subExp    = expandedSubHeads.includes(key);
//                     let subHasItems = sub.items && sub.items.length;

//                     $tbody.append(`
//                         <tr class="sub-head" data-sub="${frappe.utils.escape_html(key)}">
//                             <td>
//                                 ${subHasItems ? (subExp ? '▼ ' : '▶ ') : ''}
//                                 ${frappe.utils.escape_html(sub.name)}
//                             </td>
//                             <td>${formatNumber(subBudget)}</td>
//                             <td>${formatNumber(subActual)}</td>
//                             <td class="text-blue">${subPer}%</td>
//                             <td class="text-blue">${formatNumber(subBudget - subActual)}</td>
//                         </tr>
//                     `);

//                     if (subExp) {
//                         (sub.items || []).forEach(function (item) {
//                             let b = Number(item.ytd || 0);
//                             let a = Number(item.total_posted_amt || 0);
//                             $tbody.append(`
//                                 <tr class="line-item">
//                                     <td style="padding-left:55px">${frappe.utils.escape_html(item.name)}</td>
//                                     <td>${formatNumber(b)}</td>
//                                     <td>${formatNumber(a)}</td>
//                                     <td>${safePercentage(b, a)}%</td>
//                                     <td>${formatNumber(b - a)}</td>
//                                 </tr>
//                             `);
//                         });
//                     }
//                 });
//             }
//         });

//         /* Grand Total row */
//         $tbody.append(`
//             <tr class="grand-total-row">
//                 <td>GRAND TOTAL</td>
//                 <td>${formatNumber(grand_budget)}</td>
//                 <td>${formatNumber(grand_actuals)}</td>
//                 <td>${safePercentage(grand_budget, grand_actuals)}%</td>
//                 <td>${formatNumber(grand_budget - grand_actuals)}</td>
//             </tr>
//         `);

//         $table.append($tbody);

//         /* Sync Expand All checkbox */
//         let allHeads = expense_heads.map(function (h) { return h.name; });
//         let allSubKeys = [];
//         expense_heads.forEach(function (h) {
//             (h.sub_heads || []).forEach(function (s) {
//                 allSubKeys.push(h.name + "__" + s.name);
//             });
//         });
//         let allExpanded =
//             allHeads.length > 0 &&
//             allHeads.every(function (n) { return expandedHeads.includes(n); }) &&
//             allSubKeys.every(function (k) { return expandedSubHeads.includes(k); });
//         $('#expand-all-checkbox').prop('checked', allExpanded);

//         /* Row click handlers – use delegated events to avoid duplicate bindings */
//         $tbody.on('click', '.expense-head', function () {
//             let name = $(this).data('head');
//             if (expandedHeads.includes(name)) {
//                 expandedHeads = expandedHeads.filter(function (x) { return x !== name; });
//             } else {
//                 expandedHeads.push(name);
//             }
//             renderTable();
//         });

//         $tbody.on('click', '.sub-head', function () {
//             let key = $(this).data('sub');
//             if (expandedSubHeads.includes(key)) {
//                 expandedSubHeads = expandedSubHeads.filter(function (x) { return x !== key; });
//             } else {
//                 expandedSubHeads.push(key);
//             }
//             renderTable();
//         });
//     }

//     /* ─────────────────────────────────────────────────────
//        RENDER CARDS
//     ───────────────────────────────────────────────────── */
//     function renderCards(data) {
//         let $cards = $('#cards-container');
//         $cards.empty();

//         if (!data || !data.length) return;

//         let grand_budget = 0;
//         let grand_actual = 0;
//         data.forEach(function (head) {
//             grand_budget += Number(head.ytd || 0);
//             grand_actual += Number(head.total_posted_amt_ytd || 0);
//         });

//         let cards_html = createCard("Grand Total", grand_budget, grand_actual, grand_budget - grand_actual, true);

//         data.forEach(function (head) {
//             let hB = Number(head.ytd || 0);
//             let hA = Number(head.total_posted_amt_ytd || 0);
//             cards_html += createCard(head.name, hB, hA, hB - hA, false, false);

//             (head.sub_heads || []).forEach(function (sub) {
//                 let sB = Number(sub.ytd || 0);
//                 let sA = Number(sub.total_posted_amt_ytd || 0);
//                 cards_html += createCard(sub.name, sB, sA, sB - sA, false, true);
//             });
//         });

//         $cards.append(cards_html);
//     }

//     function createCard(title, budget, actual, variance, isGrand, isSub) {
//         let utilization = budget > 0 ? ((actual / budget) * 100).toFixed(2) : "0.00";
//         return `
//             <div class="number-card ${isGrand ? 'grand' : ''} ${isSub ? 'sub' : ''}">
//                 <div class="number-title" title="${frappe.utils.escape_html(title)}">${frappe.utils.escape_html(title)}</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${formatNumber(budget)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${formatNumber(actual)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${formatNumber(variance)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value">${utilization}%</div>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }
// };




// frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {

//     $(`<style>
//     #tables-container {
//         margin: 20px;
//         background: #fff;
//         border-radius: 8px;
//         padding: 8px;
//     }
//     #controls-row {
//         display: flex;
//         flex-wrap: wrap;
//         justify-content: space-between;
//         align-items: center;
//         gap: 8px;
//         margin-bottom: 12px;
//         padding: 8px 10px;
//         background: #f7f9fb;
//         border: 1px solid #dcdcdc;
//         border-radius: 6px;
//     }
//     #global-search-box {
//         flex: 1 1 200px; min-width: 0; max-width: 320px;
//         padding: 7px 12px; border: 1px solid #aaa;
//         border-radius: 6px; font-size: 13px; box-sizing: border-box;
//     }
//     #controls-right { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
//     #expand-all-wrapper {
//         display: flex; align-items: center; gap: 7px;
//         font-size: 13px; font-weight: 600; color: #444;
//         cursor: pointer; user-select: none; white-space: nowrap;
//     }
//     #expand-all-checkbox { width:16px; height:16px; accent-color:#0076B6; cursor:pointer; }
//     #export-excel-btn {
//         display: inline-flex; align-items: center; gap: 6px;
//         padding: 6px 14px; font-size: 13px; font-weight: 600;
//         color: #fff !important; background: #0076B6;
//         border: 1px solid #0076B6; border-radius: 6px;
//         cursor: pointer; white-space: nowrap; line-height: 1.5;
//         box-shadow: 0 1px 3px rgba(0,0,0,.12); text-decoration: none;
//         transition: background .15s ease;
//     }
//     #export-excel-btn:hover { background:#005f94; border-color:#005f94; }

//     .scroll-wrapper {
//         border: 1px solid #ccc; border-radius: 6px;
//         overflow-x: auto; overflow-y: auto; max-height: 70vh;
//         background: #fff; -webkit-overflow-scrolling: touch;
//     }
//     table.university-table {
//         min-width: 600px; width: 100%;
//         border-collapse: collapse; font-size: 13px;
//     }
//     table.university-table th,
//     table.university-table td {
//         border: 1px solid #ddd; padding: 8px 10px;
//         white-space: nowrap; vertical-align: middle;
//         text-align: center; background: #fff !important;
//     }
//     table.university-table th:first-child,
//     table.university-table td:first-child { text-align:left !important; white-space:normal; word-break:break-word; }
//     table.university-table thead tr.main-row th {
//         background: #0076B6 !important; color: #fff !important;
//         position: sticky; top: 0; z-index: 25;
//     }
//     tr.expense-head { font-weight:700; cursor:pointer; }
//     tr.expense-head:hover td { background:#F4F9FD !important; }
//     tr.sub-head { background:#FFF3E6 !important; font-weight:600; cursor:pointer; }
//     tr.sub-head:hover td { background:#FFEAD5 !important; }
//     tr.line-item td:first-child { padding-left:35px !important; }
//     tr.sub-head td:first-child { padding-left:20px !important; }
//     .text-blue { color:#0076B6; font-weight:600; }
//     tr.grand-total-row td { background:#003B63 !important; color:#fff !important; font-weight:700 !important; }

//     #summary-area { display:block; width:100%; box-sizing:border-box; margin-bottom:18px; }
//     .cards-col { display:block; width:100%; box-sizing:border-box; }

//     .cards-section-label {
//         font-size: 11px; font-weight: 700; letter-spacing: .8px;
//         text-transform: uppercase; color: #888;
//         margin: 16px 0 8px; padding-left: 2px;
//     }
//     .cards-section-label:first-child { margin-top: 0; }

//     .grand-card {
//         border: 1px solid #d0d0d0;
//         border-left: 4px solid #0076B6;
//         border-radius: 8px;
//         padding: 16px 20px;
//         display: grid;
//         grid-template-columns: repeat(4, 1fr);
//         gap: 0;
//         margin-bottom: 16px;
//         background: #fff;
//     }
//     .grand-card-block { padding-right: 14px; }
//     .grand-card-block + .grand-card-block { border-left: 1px solid #eee; padding-left: 14px; padding-right: 0; }
//     .grand-card-block .gc-label {
//         font-size: 10px; font-weight: 600; text-transform: uppercase;
//         letter-spacing: .6px; color: #888; margin-bottom: 5px;
//     }
//     .grand-card-block .gc-value { font-size: 18px; font-weight: 700; color: #111; letter-spacing: -.3px; }

//     /* 4-col grid — shared by main heads and sub heads */
//     .card-row-grid {
//         display: grid !important;
//         grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
//         gap: 10px;
//         margin-bottom: 14px;
//         width: 100%;
//         box-sizing: border-box;
//     }
//     .card-row-grid.sub-grid {
//         gap: 8px;
//         margin-bottom: 14px;
//     }

//     /* Base card — border-left-color always set via inline style */
//     .number-card {
//         border: 1px solid #e0e0e0;
//         border-left: 3px solid #ccc; /* overridden inline */
//         border-radius: 8px;
//         padding: 13px 15px;
//         background: #fff;
//         box-sizing: border-box;
//         min-width: 0;
//         overflow: hidden;
//         word-break: break-word;
//         transition: box-shadow .15s ease;
//     }
//     .number-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.08); }

//     /* Sub card — slightly muted surface */
//     .number-card.sub {
//         background: #fafafa;
//         border-color: #ebebeb;
//         border-left-width: 3px; /* color overridden inline */
//         border-radius: 7px;
//         padding: 11px 13px;
//     }

//     .number-title {
//         font-size: 11px; font-weight: 600; color: #555;
//         text-transform: uppercase; letter-spacing: .5px;
//         margin-bottom: 9px;
//         overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
//     }
//     .number-card.sub .number-title { font-size: 10px; color: #777; }

//     .kpi-row { display:flex; justify-content:space-between; margin-top:4px; }
//     .kpi-block { text-align:left; }
//     .kpi-label { font-size:10px; color:#aaa; text-transform:uppercase; letter-spacing:.4px; }
//     .kpi-value { font-size:14px; font-weight:700; color:#111; }
//     .number-card.sub .kpi-value { font-size:13px; }

//     .kpi-bottom {
//         display:flex; justify-content:space-between;
//         margin-top:8px; padding-top:7px;
//         border-top:1px solid #f0f0f0;
//     }

//     .util-bar-wrap { margin-top:9px; padding-top:8px; border-top:1px solid #f0f0f0; }
//     .util-bar-bg { width:100%; height:4px; background:#f0f0ed; border-radius:2px; overflow:hidden; }
//     .util-bar { height:100%; border-radius:2px; transition:width .4s ease; }

//     #global-loader.loader-overlay {
//         position:fixed; inset:0; width:100vw; height:100vh;
//         background:rgba(18,18,18,.92); backdrop-filter:blur(6px);
//         z-index:999999; display:none; align-items:center; justify-content:center;
//     }
//     #global-loader.loader-overlay.active { display:flex; }
//     .loader-box { display:flex; flex-direction:column; align-items:center; gap:14px; }
//     .loader-logo {
//         width:90px; height:90px; border-radius:50%;
//         background:linear-gradient(145deg,#fff,#eaeaea); padding:14px;
//         object-fit:contain; box-shadow:0 10px 30px rgba(0,0,0,.35);
//         animation:pulse 1.6s infinite ease-in-out;
//     }
//     .loader-text { font-size:14px; color:#fff; font-weight:600; opacity:.85; }
//     @keyframes pulse { 0%,100%{transform:scale(1);opacity:.8;} 50%{transform:scale(1.08);opacity:1;} }

//     .custom-filter-row { padding:15px 20px; background:#fff; border-radius:6px; margin-top:10px; }
//     .custom-filter-row.row { margin-left:0; margin-right:0; }
//     .custom-select-all-btn { margin-right:8px; }

//     @media(max-width:1100px) {
//         .card-row-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
//         .grand-card { grid-template-columns: repeat(2, 1fr); gap:12px; }
//     }
//     @media(max-width:768px) {
//         #tables-container { margin:6px; padding:6px; }
//         #controls-row { flex-direction:column; align-items:stretch; }
//         #global-search-box { max-width:100%; width:100%; }
//         .card-row-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
//         .grand-card { grid-template-columns: 1fr 1fr; }
//         .custom-filter-row { padding:10px; }
//         .custom-filter-row .col-md-4 { width:100%; margin-bottom:8px; }
//         table.university-table { font-size:11px; }
//         table.university-table th, table.university-table td { padding:5px 6px; }
//     }
//     @media(max-width:480px) {
//         .card-row-grid { grid-template-columns: 1fr !important; }
//         .grand-card { grid-template-columns: 1fr; }
//         #export-excel-btn { width:100%; }
//     }
//     </style>`).appendTo('head');

//     if (!$("#global-loader").length) {
//         $("body").append(`
//             <div id="global-loader" class="loader-overlay">
//                 <div class="loader-box">
//                     <img src="/files/APF logo.png" class="loader-logo" alt="Loading">
//                     <div class="loader-text">Loading, please wait…</div>
//                 </div>
//             </div>
//         `);
//     }
//     const Loader = {
//         show(msg = "Loading, please wait…") { $("#global-loader").find(".loader-text").text(msg); $("#global-loader").addClass("active"); },
//         hide() { $("#global-loader").removeClass("active"); }
//     };

//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget vs Actuals Face Sheet',
//         single_column: true
//     });

//     function updatePageTitle(fy) {
//         page.set_title('Budget vs Actuals Face Sheet' + (fy ? ' – ' + fy : ''));
//     }

//     /* ── Filters ── */
//     let filter_section = $(`<div class="frappe-control-group row custom-filter-row"></div>`).appendTo(page.body);
//     const make_field = () => $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);

//     function mergeSelectedOptions(ctrl, new_opts) {
//         let selected = (ctrl.get_value() || []).map(String);
//         let map = {};
//         ((ctrl.df && ctrl.df.options) ? ctrl.df.options : []).forEach(o => { if (o?.value != null) map[String(o.value)] = o; });
//         new_opts.forEach(o => { if (o?.value != null) map[String(o.value)] = o; });
//         selected.forEach(v => { if (!map[v]) map[v] = { label:v, value:v, description:"" }; });
//         return Object.values(map);
//     }

//     function addSelectAllButton(ctrl, label) {
//         if (!ctrl?.$input) return;
//         ctrl.$input.on("focus", function () {
//             setTimeout(function () {
//                 let $dd = $('.multiselect-dropdown:visible').last();
//                 if (!$dd.length) return;
//                 let $act = $dd.find('.multiselect-actions');
//                 if (!$act.length) return;
//                 $act.find('.custom-select-all-btn').remove();
//                 let $btn = $(`<button type="button" class="btn btn-xs btn-default custom-select-all-btn">Select All</button>`);
//                 $btn.on("click", function (e) {
//                     e.stopPropagation(); e.preventDefault();
//                     function apply(data) { let vals = data.map(d => String(d.value ?? d)); if (vals.length) ctrl.set_value(vals); }
//                     if (ctrl.get_data) {
//                         let r = ctrl.get_data();
//                         r && typeof r.then === "function" ? r.then(apply).catch(err => console.error(label, err)) : Array.isArray(r) && apply(r);
//                     } else if (Array.isArray(ctrl.df?.options)) {
//                         apply(ctrl.df.options.map(o => typeof o === "object" ? o : { value:o }));
//                     }
//                 });
//                 $act.prepend($btn);
//             }, 120);
//         });
//     }

//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Financial Year", fieldtype:"Select", fieldname:"financial_year", reqd:1,
//             change() { let y = this.get_value(); if (y) updatePageTitle(y); }
//         }, render_input:true
//     });
//     fiscal_year_filter.refresh();
//     frappe.call({
//         method: "annual_budget.api.filter_options.get_financial_year_list",
//         callback(r) {
//             if (!r.message?.length) return;
//             let years = r.message.map(d => d.financial_year);
//             fiscal_year_filter.df.options = years.join("\n"); fiscal_year_filter.refresh();
//             let now = new Date(), m = now.getMonth()+1, y = now.getFullYear();
//             let fy = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             let def = years.includes(fy) ? fy : years[0];
//             fiscal_year_filter.set_value(def); updatePageTitle(def);
//         }
//     });

//     let month_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"YTD Month", fieldtype:"Select", fieldname:"month", reqd:1,
//             options:["January","February","March","April","May","June","July","August","September","October","November","December"].join("\n")
//         }, render_input:true
//     });
//     month_filter.set_value(new Date().toLocaleString('default', { month:'long' }));

//     let theme_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Operating Units", fieldtype:"MultiSelectList", fieldname:"theme",
//             get_data() { return frappe.call({ method:"annual_budget.api.filter_options.get_theme" }).then(r => (r.message||[]).map(d => ({ label:d.number_card_title, value:d.name, description:"" }))); }
//         }, render_input:true
//     });
//     addSelectAllButton(theme_filter, "Operating Units");

//     let unit_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Unit", fieldtype:"MultiSelectList", fieldname:"unit", reqd:1,
//             get_data() { return frappe.call({ method:"annual_budget.api.filter_options.get_units" }).then(r => (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:"" }))); },
//             change() {
//                 let units = (unit_filter.get_value()||[]).map(String);
//                 cost_center_filter.set_value([]); location_code_filter.set_value([]);
//                 cost_center_filter.df.options = []; cost_center_filter.refresh();
//                 location_code_filter.df.options = []; location_code_filter.refresh();
//                 if (units.length) { loadCostCenters(units); loadLocationCodes(units); }
//             }
//         }, render_input:true
//     });
//     addSelectAllButton(unit_filter, "Unit");

//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Cost Center", fieldtype:"MultiSelectList", fieldname:"cost_center", options:[] },
//         render_input:true
//     });
//     addSelectAllButton(cost_center_filter, "Cost Center");

//     let location_code_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Location Code", fieldtype:"MultiSelectList", fieldname:"location_code", options:[] },
//         render_input:true
//     });
//     addSelectAllButton(location_code_filter, "Location Code");

//     let load_button = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:" ", fieldtype:"Button", fieldname:"load_button", click() { loadData(); } },
//         render_input:true
//     });
//     load_button.$wrapper.find('button').addClass("btn-primary").text("Get Report");
//     load_button.$wrapper.css("margin-top", "26px");

//     frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");

//     const $container = $(`
//         <div id="tables-container">
//             <div id="summary-area">
//                 <div class="cards-col" id="cards-area"></div>
//             </div>
//             <div id="controls-row">
//                 <input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item…">
//                 <div id="controls-right">
//                     <label id="expand-all-wrapper">
//                         <input type="checkbox" id="expand-all-checkbox"> Expand All
//                     </label>
//                     <button id="export-excel-btn">↓ Export to Excel</button>
//                 </div>
//             </div>
//             <div class="scroll-wrapper">
//                 <table class="university-table" id="phase-table"></table>
//             </div>
//         </div>
//     `);
//     $(page.body).append($container);

//     /* ── State ── */
//     let expense_heads = [], expandedHeads = [], expandedSubHeads = [], searchText = "";

//     /* ── Palette: one colour per expense head index ── */
//     const PALETTE = [
//         '#0076B6','#f58020','#2ecc71','#9b59b6',
//         '#e74c3c','#1abc9c','#e67e22','#2980b9',
//         '#8e44ad','#27ae60','#c0392b','#16a085'
//     ];
//     const headColor = i => PALETTE[i % PALETTE.length];

//     /* util bar colour */
//     function utilColor(u) {
//         if (u > 100) return '#c0392b';
//         if (u >= 60)  return '#e07c3a';
//         return '#27ae60';
//     }

//     /* ── Helpers ── */
//     const fmt  = n => Math.round(Number(n)||0).toLocaleString('en-IN', { maximumFractionDigits:0 });
//     const rnd  = n => Math.round(Number(n)||0);
//     const pct  = (b, a) => { b = rnd(b); a = rnd(a); return b ? Math.round((a/b)*100) : 0; };
//     const mtch = (...v) => v.some(x => String(x||'').toLowerCase().includes(searchText.toLowerCase()));

//     function getKey(ctrl, key) {
//         let sel = (ctrl.get_value()||[]).map(String);
//         let opts = Array.isArray(ctrl.df?.options) ? ctrl.df.options : [];
//         return sel.map(v => { let o = opts.find(o => o && String(o.value)===v); return o?.[key]||null; }).filter(Boolean);
//     }

//     /* ── Events ── */
//     $container.find('#global-search-box').on('input', function () {
//         searchText = $(this).val().trim();
//         if (searchText) {
//             expandedHeads    = expense_heads.map(h => h.name);
//             expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads||[]).map(s => h.name+"__"+s.name));
//         } else {
//             expandedHeads = []; expandedSubHeads = [];
//             $('#expand-all-checkbox').prop('checked', false);
//         }
//         renderTable();
//     });

//     $(document).on('change', '#expand-all-checkbox', function () {
//         if ($(this).is(':checked')) {
//             expandedHeads    = expense_heads.map(h => h.name);
//             expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads||[]).map(s => h.name+"__"+s.name));
//         } else { expandedHeads = []; expandedSubHeads = []; }
//         renderTable();
//     });

//     $(document).on('click', '#export-excel-btn', exportToExcel);

//     function exportToExcel() {
//         if (typeof XLSX === "undefined") { frappe.msgprint("Excel library not loaded yet."); return; }
//         let data = [["Expense Items","Budget","Actuals","Util %","Variance"]];
//         let gB = 0, gA = 0;
//         expense_heads.forEach(h => {
//             let hB = rnd(h.ytd), hA = rnd(h.total_posted_amt_ytd);
//             gB += hB; gA += hA;
//             data.push([h.name, hB, hA, pct(hB,hA)+"%", hB-hA]);
//             (h.sub_heads||[]).forEach(s => {
//                 let sB = rnd(s.ytd), sA = rnd(s.total_posted_amt_ytd);
//                 data.push(["   "+s.name, sB, sA, pct(sB,sA)+"%", sB-sA]);
//                 (s.items||[]).forEach(i => { let b=rnd(i.ytd),a=rnd(i.total_posted_amt); data.push(["      "+i.name,b,a,pct(b,a)+"%",b-a]); });
//             });
//             (h.items||[]).forEach(i => { let b=rnd(i.ytd),a=rnd(i.total_posted_amt); data.push(["   "+i.name,b,a,pct(b,a)+"%",b-a]); });
//         });
//         data.push(["GRAND TOTAL", gB, gA, pct(gB,gA)+"%", gB-gA]);
//         let ws = XLSX.utils.aoa_to_sheet(data);
//         ws["!cols"] = [{wch:40},{wch:15},{wch:15},{wch:10},{wch:15}];
//         let wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
//         XLSX.writeFile(wb, "Expense_Report.xlsx");
//     }

//     /* ── Dependent filters ── */
//     function loadCostCenters(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 let opts = (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:"", erp_cost_center_value:String(d.erp_cost_center_value||"") }));
//                 cost_center_filter.df.options = mergeSelectedOptions(cost_center_filter, opts);
//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     function loadLocationCodes(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 let opts = (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:"", erp_loc_value:String(d.erp_loc_value||"") }));
//                 location_code_filter.df.options = mergeSelectedOptions(location_code_filter, opts);
//                 location_code_filter.refresh();
//             }
//         });
//     }

//     /* ── Load data ── */
//     function loadData() {
//         let fy   = fiscal_year_filter.get_value();
//         let mon  = month_filter.get_value();
//         let unit = (unit_filter.get_value()||[]).join(",") || null;
//         let missing = [];
//         if (!fy)   missing.push("Financial Year");
//         if (!mon)  missing.push("Month");
//         if (!unit) missing.push("Unit");
//         if (missing.length) { frappe.msgprint({ title:"Required Filters", message:"Please select: "+missing.join(", "), indicator:"orange" }); return; }

//         Loader.show("We're crafting your report with care…");
//         $('#expand-all-checkbox').prop('checked', false);
//         $('#global-search-box').val("");
//         expandedHeads = []; expandedSubHeads = []; searchText = "";

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_combined_actuals",
//             args: {
//                 financial_year: fy, month: mon, unit,
//                 cost_center:           (getKey(cost_center_filter,"value")||[]).join(",") || null,
//                 location_code:         (getKey(location_code_filter,"value")||[]).join(",") || null,
//                 erp_cost_center_value: (getKey(cost_center_filter,"erp_cost_center_value")||[]).join(",") || null,
//                 erp_loc_value:         (getKey(location_code_filter,"erp_loc_value")||[]).join(",") || null
//             }
//         })
//         .done(r => {
//             expense_heads = Array.isArray(r.message) ? r.message : (r.message?.message || []);
//             renderCards(expense_heads);
//             renderTable();
//         })
//         .fail(() => frappe.msgprint({ title:"Error", message:"Failed to load data.", indicator:"red" }))
//         .always(() => Loader.hide());
//     }

//     /* ─────────────────────────────────────────────────────
//        BUILD CARD
//        color  — the palette colour for this expense head
//        isSub  — true for sub head cards (smaller, muted bg)
//     ───────────────────────────────────────────────────── */
//     function buildCard(name, budget, actual, color, isSub) {
//         let u   = pct(budget, actual);
//         let bw  = Math.min(u, 100);
//         let uc  = utilColor(u);
//         let cls = isSub ? 'number-card sub' : 'number-card';

//         return $(`
//             <div class="${cls}" style="border-left-color:${color};">
//                 <div class="number-title" title="${frappe.utils.escape_html(name)}">${frappe.utils.escape_html(name)}</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${fmt(budget)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${fmt(actual)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${fmt(budget - actual)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value" style="color:${uc};">${u}%</div>
//                     </div>
//                 </div>
//                 <div class="util-bar-wrap">
//                     <div class="util-bar-bg">
//                         <div class="util-bar" style="width:${bw}%; background:${uc};"></div>
//                     </div>
//                 </div>
//             </div>
//         `);
//     }

//     /* ─────────────────────────────────────────────────────
//        RENDER CARDS
//     ───────────────────────────────────────────────────── */
//     function renderCards(data) {
//         let $area = $('#cards-area');
//         $area.empty();
//         if (!data?.length) return;

//         /* Grand total */
//         let gB = 0, gA = 0;
//         data.forEach(h => { gB += rnd(h.ytd); gA += rnd(h.total_posted_amt_ytd); });
//         $area.append(`<div class="cards-section-label">Grand Total</div>`);
//         $area.append(`
//             <div class="grand-card">
//                 <div class="grand-card-block"><div class="gc-label">Total Budget</div><div class="gc-value">${fmt(gB)}</div></div>
//                 <div class="grand-card-block"><div class="gc-label">Actuals</div><div class="gc-value">${fmt(gA)}</div></div>
//                 <div class="grand-card-block"><div class="gc-label">Variance</div><div class="gc-value">${fmt(gB-gA)}</div></div>
//                 <div class="grand-card-block"><div class="gc-label">Util %</div><div class="gc-value">${pct(gB,gA)}%</div></div>
//             </div>
//         `);

//         /* Main head cards */
//         let mainHeads = data.filter(h => rnd(h.ytd) !== 0);
//         if (!mainHeads.length) return;

//         $area.append(`<div class="cards-section-label">Expense Heads</div>`);
//         let $mainGrid = $('<div class="card-row-grid"></div>');
//         mainHeads.forEach((h, i) => {
//             /* each head gets its palette colour */
//             $mainGrid.append(buildCard(h.name, rnd(h.ytd), rnd(h.total_posted_amt_ytd), headColor(i), false));
//         });
//         $area.append($mainGrid);

//         /* Sub head cards — inherit the same colour as their parent head */
//         mainHeads.forEach((h, i) => {
//             let color     = headColor(i);                                      // ← same index as parent
//             let validSubs = (h.sub_heads||[]).filter(s => rnd(s.ytd) !== 0);
//             if (!validSubs.length) return;

//             $area.append(`
//                 <div class="cards-section-label" style="color:${color};">
//                     <span style="opacity:.45; color:#888;">Sub Heads —</span>
//                     ${frappe.utils.escape_html(h.name)}
//                 </div>
//             `);
//             let $subGrid = $('<div class="card-row-grid sub-grid"></div>');
//             validSubs.forEach(s => {
//                 /* pass the parent's colour so border-left matches */
//                 $subGrid.append(buildCard(s.name, rnd(s.ytd), rnd(s.total_posted_amt_ytd), color, true));
//             });
//             $area.append($subGrid);
//         });
//     }

//     /* ─────────────────────────────────────────────────────
//        RENDER TABLE
//     ───────────────────────────────────────────────────── */
//     function renderTable() {
//         let $table = $('#phase-table');
//         $table.html('');

//         if (!expense_heads?.length) {
//             $table.append(`<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No Data Found</td></tr>`);
//             return;
//         }

//         $table.append(`
//             <thead>
//                 <tr class="main-row">
//                     <th>Expense Head</th><th>Budget</th><th>Actuals</th><th>Util %</th><th>Variance</th>
//                 </tr>
//             </thead>
//         `);

//         let $tbody = $('<tbody></tbody>');
//         let gB = 0, gA = 0;

//         expense_heads.forEach(head => {
//             if (searchText &&
//                 !mtch(head.name) &&
//                 !(head.items||[]).some(i => mtch(i.name)) &&
//                 !(head.sub_heads||[]).some(s => mtch(s.name) || (s.items||[]).some(i => mtch(i.name)))
//             ) return;

//             let hB = rnd(head.ytd), hA = rnd(head.total_posted_amt_ytd);
//             gB += hB; gA += hA;
//             let exp  = expandedHeads.includes(head.name);
//             let hasC = head.items?.length || head.sub_heads?.length;

//             $tbody.append(`
//                 <tr class="expense-head" data-head="${frappe.utils.escape_html(head.name)}">
//                     <td>${hasC ? (exp?'▼ ':'▶ ') : ''}${frappe.utils.escape_html(head.name)}</td>
//                     <td>${fmt(hB)}</td><td>${fmt(hA)}</td>
//                     <td class="text-blue">${pct(hB,hA)}%</td>
//                     <td class="text-blue">${fmt(hB-hA)}</td>
//                 </tr>
//             `);

//             if (exp) {
//                 (head.items||[]).forEach(item => {
//                     if (searchText && !mtch(item.name)) return;
//                     let b = rnd(item.ytd), a = rnd(item.total_posted_amt);
//                     $tbody.append(`<tr class="line-item"><td>${frappe.utils.escape_html(item.name)}</td><td>${fmt(b)}</td><td>${fmt(a)}</td><td>${pct(b,a)}%</td><td>${fmt(b-a)}</td></tr>`);
//                 });

//                 (head.sub_heads||[]).forEach(sub => {
//                     let key  = head.name+"__"+sub.name;
//                     let sB   = rnd(sub.ytd), sA = rnd(sub.total_posted_amt_ytd);
//                     let sExp = expandedSubHeads.includes(key);
//                     $tbody.append(`
//                         <tr class="sub-head" data-sub="${frappe.utils.escape_html(key)}">
//                             <td>${sub.items?.length ? (sExp?'▼ ':'▶ ') : ''}${frappe.utils.escape_html(sub.name)}</td>
//                             <td>${fmt(sB)}</td><td>${fmt(sA)}</td>
//                             <td class="text-blue">${pct(sB,sA)}%</td>
//                             <td class="text-blue">${fmt(sB-sA)}</td>
//                         </tr>
//                     `);
//                     if (sExp) {
//                         (sub.items||[]).forEach(item => {
//                             let b = rnd(item.ytd), a = rnd(item.total_posted_amt);
//                             $tbody.append(`<tr class="line-item"><td style="padding-left:55px">${frappe.utils.escape_html(item.name)}</td><td>${fmt(b)}</td><td>${fmt(a)}</td><td>${pct(b,a)}%</td><td>${fmt(b-a)}</td></tr>`);
//                         });
//                     }
//                 });
//             }
//         });

//         $tbody.append(`
//             <tr class="grand-total-row">
//                 <td>GRAND TOTAL</td><td>${fmt(gB)}</td><td>${fmt(gA)}</td>
//                 <td>${pct(gB,gA)}%</td><td>${fmt(gB-gA)}</td>
//             </tr>
//         `);
//         $table.append($tbody);

//         let allH = expense_heads.map(h=>h.name);
//         let allS = expense_heads.flatMap(h=>(h.sub_heads||[]).map(s=>h.name+"__"+s.name));
//         $('#expand-all-checkbox').prop('checked',
//             allH.length > 0 && allH.every(n=>expandedHeads.includes(n)) && allS.every(k=>expandedSubHeads.includes(k))
//         );

//         $tbody.on('click','.expense-head', function () {
//             let n = $(this).data('head');
//             expandedHeads.includes(n) ? expandedHeads=expandedHeads.filter(x=>x!==n) : expandedHeads.push(n);
//             renderTable();
//         });
//         $tbody.on('click','.sub-head', function () {
//             let k = $(this).data('sub');
//             expandedSubHeads.includes(k) ? expandedSubHeads=expandedSubHeads.filter(x=>x!==k) : expandedSubHeads.push(k);
//             renderTable();
//         });
//     }
// };

// frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {

//     $(`<style>
//     #tables-container {
//         margin: 20px;
//         background: #fff;
//         border-radius: 8px;
//         padding: 8px;
//     }
//     #controls-row {
//         display: flex; flex-wrap: wrap;
//         justify-content: space-between; align-items: center;
//         gap: 8px; margin-bottom: 12px; padding: 8px 10px;
//         background: #f7f9fb; border: 1px solid #dcdcdc; border-radius: 6px;
//     }
//     #global-search-box {
//         flex: 1 1 200px; min-width: 0; max-width: 320px;
//         padding: 7px 12px; border: 1px solid #aaa;
//         border-radius: 6px; font-size: 13px; box-sizing: border-box;
//     }
//     #controls-right { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
//     #expand-all-wrapper {
//         display: flex; align-items: center; gap: 7px;
//         font-size: 13px; font-weight: 600; color: #444;
//         cursor: pointer; user-select: none; white-space: nowrap;
//     }
//     #expand-all-checkbox { width:16px; height:16px; accent-color:#0076B6; cursor:pointer; }
//     #export-excel-btn {
//         display: inline-flex; align-items: center; gap: 6px;
//         padding: 6px 14px; font-size: 13px; font-weight: 600;
//         color: #fff !important; background: #0076B6;
//         border: 1px solid #0076B6; border-radius: 6px;
//         cursor: pointer; white-space: nowrap; line-height: 1.5;
//         box-shadow: 0 1px 3px rgba(0,0,0,.12); text-decoration: none;
//         transition: background .15s ease;
//     }
//     #export-excel-btn:hover { background:#005f94; border-color:#005f94; }

//     .scroll-wrapper {
//         border: 1px solid #ccc; border-radius: 6px;
//         overflow-x: auto; overflow-y: auto; max-height: 70vh;
//         background: #fff; -webkit-overflow-scrolling: touch;
//     }
//     table.university-table { min-width: 600px; width: 100%; border-collapse: collapse; font-size: 13px; }
//     table.university-table th, table.university-table td {
//         border: 1px solid #ddd; padding: 8px 10px;
//         white-space: nowrap; vertical-align: middle;
//         text-align: center; background: #fff !important;
//     }
//     table.university-table th:first-child,
//     table.university-table td:first-child { text-align:left !important; white-space:normal; word-break:break-word; }
//     table.university-table thead tr.main-row th {
//         background: #0076B6 !important; color: #fff !important;
//         position: sticky; top: 0; z-index: 25;
//     }
//     tr.expense-head { font-weight:700; cursor:pointer; }
//     tr.expense-head:hover td { background:#F4F9FD !important; }
//     tr.sub-head { background:#FFF3E6 !important; font-weight:600; cursor:pointer; }
//     tr.sub-head:hover td { background:#FFEAD5 !important; }
//     tr.line-item td:first-child { padding-left:35px !important; }
//     tr.sub-head td:first-child { padding-left:20px !important; }
//     .text-blue { color:#0076B6; font-weight:600; }
//     tr.grand-total-row td { background:#003B63 !important; color:#fff !important; font-weight:700 !important; }

//     /* ══ SUMMARY LAYOUT ══ */
//     #summary-area {
//         display: grid;
//         grid-template-columns: 1fr 500px;
//         gap: 0 20px;
//         align-items: start;
//         margin-bottom: 18px;
//     }

//     /* ── Cards column ── */
//     #cards-area { min-width: 0; }

//     .cards-section-label {
//         font-size: 11px; font-weight: 700; letter-spacing: .8px;
//         text-transform: uppercase; color: #888;
//         margin: 14px 0 7px; padding-left: 2px;
//     }
//     .cards-section-label:first-child { margin-top: 0; }

//     /* Grand total card — identical structure to expense head .number-card */
//     .grand-total-summary-card {
//         border: 1px solid #e0e0e0;
//         border-left: 4px solid #0076B6;
//         border-radius: 8px;
//         padding: 12px 14px;
//         background: #fff;
//         box-sizing: border-box;
//         min-width: 0;
//         overflow: hidden;
//         word-break: break-word;
//         transition: box-shadow .15s ease;
//         display: flex;
//         flex-direction: column;
//         margin-bottom: 14px;
//     }
//     .grand-total-summary-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.08); }
//     .grand-total-summary-card .number-title {
//         font-size: 11px; font-weight: 600; color: #555;
//         text-transform: uppercase; letter-spacing: .5px;
//         margin-bottom: 8px; min-height: 16px;
//         overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
//     }

//     /* Expense heads: 2 per row */
//     .card-row-grid {
//         display: grid !important;
//         grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
//         gap: 10px; margin-bottom: 12px;
//         width: 100%; box-sizing: border-box;
//     }
//     /* Sub heads: 3 per row */
//     .card-row-grid.sub-grid {
//         grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
//         gap: 8px;
//     }

//     /* Base card */
//     .number-card {
//         border: 1px solid #e0e0e0;
//         border-left: 3px solid #ccc;
//         border-radius: 8px; padding: 12px 14px;
//         background: #fff; box-sizing: border-box;
//         min-width: 0; overflow: hidden; word-break: break-word;
//         transition: box-shadow .15s ease;
//         display: flex; flex-direction: column;
//     }
//     .number-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.08); }
//     .number-card.sub {
//         background: #fafafa; border-color: #ebebeb;
//         border-left-width: 3px; border-radius: 7px; padding: 10px 12px;
//         display: flex; flex-direction: column;
//     }

//     .number-title {
//         font-size: 11px; font-weight: 600; color: #555;
//         text-transform: uppercase; letter-spacing: .5px;
//         margin-bottom: 8px;
//         overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
//         min-height: 16px;
//     }
//     .number-card.sub .number-title { font-size: 10px; color: #777; }

//     .kpi-row { display: flex; justify-content: space-between; margin-top: 4px; }
//     .kpi-block { text-align: left; }
//     .kpi-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: .4px; }
//     .kpi-value { font-size: 14px; font-weight: 700; color: #111; }
//     .number-card.sub .kpi-value { font-size: 13px; }

//     .kpi-bottom {
//         display: flex; justify-content: space-between;
//         margin-top: 8px; padding-top: 7px;
//         border-top: 1px solid #f0f0f0;
//     }

//     .util-bar-wrap {
//         margin-top: auto; padding-top: 8px;
//         border-top: 1px solid #f0f0f0;
//     }
//     .util-bar-bg { width:100%; height:4px; background:#f0f0ed; border-radius:2px; overflow:hidden; }
//     .util-bar { height:100%; border-radius:2px; transition:width .4s ease; }

//     /* ── Charts column ── */
//     #charts-row {
//         display: flex; flex-direction: column;
//         gap: 14px; min-width: 0;margin-top:23px;
        
//     }
//     .pie-card {
//         background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
//         padding: 14px 16px; box-sizing: border-box;
//         display: grid;
//         grid-template-columns: 220px 1fr;
//         grid-template-rows: auto 1fr;
//         column-gap: 16px; align-items: start;
//         overflow: visible; position: relative;
//     }
//     .pie-title {
//         grid-column: 1 / -1;
//         font-size: 11px; font-weight: 700; color: #444;
//         text-transform: uppercase; letter-spacing: .6px;
//         margin-bottom: 10px;
//     }
//     .pie-canvas-wrap {
//         width: 220px; height: 220px;
//         position: relative; overflow: visible;
//     }
//     .pie-canvas-wrap canvas {
//         width: 220px !important;
//         height: 220px !important;
//     }
//     .pie-legend {
//         display: flex; flex-direction: column;
//         gap: 5px; align-self: center; min-width: 0;
//     }
//     .pie-legend-item {
//         display: grid;
//         grid-template-columns: 10px 1fr auto;
//         align-items: center; gap: 5px;
//         font-size: 11px; color: #555; min-width: 0;
//     }
//     .pie-legend-dot { width:10px; height:10px; border-radius:2px; flex-shrink:0; }
//     .pie-legend-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
//     .pie-legend-pct { font-weight:700; color:#222; white-space:nowrap; padding-left:4px; min-width:36px; text-align:right; }

//     /* ── Loader ── */
//     #global-loader.loader-overlay {
//         position:fixed; inset:0; width:100vw; height:100vh;
//         background:rgba(18,18,18,.92); backdrop-filter:blur(6px);
//         z-index:999999; display:none; align-items:center; justify-content:center;
//     }
//     #global-loader.loader-overlay.active { display:flex; }
//     .loader-box { display:flex; flex-direction:column; align-items:center; gap:14px; }
//     .loader-logo {
//         width:90px; height:90px; border-radius:50%;
//         background:linear-gradient(145deg,#fff,#eaeaea); padding:14px;
//         object-fit:contain; box-shadow:0 10px 30px rgba(0,0,0,.35);
//         animation:pulse 1.6s infinite ease-in-out;
//     }
//     .loader-text { font-size:14px; color:#fff; font-weight:600; opacity:.85; }
//     @keyframes pulse { 0%,100%{transform:scale(1);opacity:.8;} 50%{transform:scale(1.08);opacity:1;} }

//     .custom-filter-row { padding:15px 20px; background:#fff; border-radius:6px; margin-top:10px; }
//     .custom-filter-row.row { margin-left:0; margin-right:0; }
//     .custom-select-all-btn { margin-right:8px; }

//     /* ── Responsive ── */
//     @media(max-width:1280px) {
//         #summary-area { grid-template-columns: 1fr 460px; }
//         .pie-canvas-wrap, .pie-canvas-wrap canvas { width:200px !important; height:200px !important; }
//         .pie-card { grid-template-columns: 200px 1fr; }
//     }
//     @media(max-width:1024px) {
//         #summary-area { grid-template-columns: 1fr; }
//         #charts-row { flex-direction: row; }
//         .pie-card { grid-template-columns: 180px 1fr; }
//         .pie-canvas-wrap, .pie-canvas-wrap canvas { width:180px !important; height:180px !important; }
//     }
//     @media(max-width:768px) {
//         #tables-container { margin:6px; padding:6px; }
//         #controls-row { flex-direction:column; align-items:stretch; }
//         #global-search-box { max-width:100%; width:100%; }
//         #summary-area { grid-template-columns: 1fr; }
//         #charts-row { flex-direction: column; }
//         .card-row-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
//         .card-row-grid.sub-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
//         .pie-card { grid-template-columns: 1fr; }
//         .pie-canvas-wrap { width:100%; height:200px; }
//         .pie-canvas-wrap canvas { width:100% !important; height:200px !important; }
//         .custom-filter-row { padding:10px; }
//         .custom-filter-row .col-md-4 { width:100%; margin-bottom:8px; }
//         table.university-table { font-size:11px; }
//         table.university-table th, table.university-table td { padding:5px 6px; }
//     }
//     @media(max-width:480px) {
//         .card-row-grid, .card-row-grid.sub-grid { grid-template-columns: 1fr !important; }
//         #export-excel-btn { width:100%; }
//     }
//     </style>`).appendTo('head');

//     if (!$("#global-loader").length) {
//         $("body").append(`
//             <div id="global-loader" class="loader-overlay">
//                 <div class="loader-box">
//                     <img src="/files/APF logo.png" class="loader-logo" alt="Loading">
//                     <div class="loader-text">Loading, please wait…</div>
//                 </div>
//             </div>
//         `);
//     }
//     const Loader = {
//         show(msg = "Loading, please wait…") { $("#global-loader").find(".loader-text").text(msg); $("#global-loader").addClass("active"); },
//         hide() { $("#global-loader").removeClass("active"); }
//     };

//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget vs Actuals Face Sheet',
//         single_column: true
//     });

//     function updatePageTitle(fy) {
//         page.set_title('Budget vs Actuals Face Sheet' + (fy ? ' – ' + fy : ''));
//     }

//     /* ── Filters ── */
//     let filter_section = $(`<div class="frappe-control-group row custom-filter-row"></div>`).appendTo(page.body);
//     const make_field = () => $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);

//     function mergeSelectedOptions(ctrl, new_opts) {
//         let selected = (ctrl.get_value() || []).map(String);
//         let map = {};
//         ((ctrl.df && ctrl.df.options) ? ctrl.df.options : []).forEach(o => { if (o?.value != null) map[String(o.value)] = o; });
//         new_opts.forEach(o => { if (o?.value != null) map[String(o.value)] = o; });
//         selected.forEach(v => { if (!map[v]) map[v] = { label:v, value:v, description:"" }; });
//         return Object.values(map);
//     }

//     function addSelectAllButton(ctrl, label) {
//         if (!ctrl?.$input) return;
//         ctrl.$input.on("focus", function () {
//             setTimeout(function () {
//                 let $dd = $('.multiselect-dropdown:visible').last();
//                 if (!$dd.length) return;
//                 let $act = $dd.find('.multiselect-actions');
//                 if (!$act.length) return;
//                 $act.find('.custom-select-all-btn').remove();
//                 let $btn = $(`<button type="button" class="btn btn-xs btn-default custom-select-all-btn">Select All</button>`);
//                 $btn.on("click", function (e) {
//                     e.stopPropagation(); e.preventDefault();
//                     function apply(data) { let vals = data.map(d => String(d.value ?? d)); if (vals.length) ctrl.set_value(vals); }
//                     if (ctrl.get_data) {
//                         let r = ctrl.get_data();
//                         r && typeof r.then === "function" ? r.then(apply).catch(err => console.error(label, err)) : Array.isArray(r) && apply(r);
//                     } else if (Array.isArray(ctrl.df?.options)) {
//                         apply(ctrl.df.options.map(o => typeof o === "object" ? o : { value:o }));
//                     }
//                 });
//                 $act.prepend($btn);
//             }, 120);
//         });
//     }

//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Financial Year", fieldtype:"Select", fieldname:"financial_year", reqd:1,
//             change() { let y = this.get_value(); if (y) updatePageTitle(y); }
//         }, render_input:true
//     });
//     fiscal_year_filter.refresh();
//     frappe.call({
//         method: "annual_budget.api.filter_options.get_financial_year_list",
//         callback(r) {
//             if (!r.message?.length) return;
//             let years = r.message.map(d => d.financial_year);
//             fiscal_year_filter.df.options = years.join("\n"); fiscal_year_filter.refresh();
//             let now = new Date(), m = now.getMonth()+1, y = now.getFullYear();
//             let fy = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             let def = years.includes(fy) ? fy : years[0];
//             fiscal_year_filter.set_value(def); updatePageTitle(def);
//         }
//     });

//     let month_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"YTD Month", fieldtype:"Select", fieldname:"month", reqd:1,
//             options:["January","February","March","April","May","June","July","August","September","October","November","December"].join("\n")
//         }, render_input:true
//     });
//     month_filter.set_value(new Date().toLocaleString('default', { month:'long' }));

//     let theme_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Operating Units", fieldtype:"MultiSelectList", fieldname:"theme",
//             get_data() { return frappe.call({ method:"annual_budget.api.filter_options.get_theme" }).then(r => (r.message||[]).map(d => ({ label:d.number_card_title, value:d.name, description:"" }))); }
//         }, render_input:true
//     });
//     addSelectAllButton(theme_filter, "Operating Units");

//     let unit_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Unit", fieldtype:"MultiSelectList", fieldname:"unit", reqd:1,
//             get_data() { return frappe.call({ method:"annual_budget.api.filter_options.get_units" }).then(r => (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:"" }))); },
//             change() {
//                 let units = (unit_filter.get_value()||[]).map(String);
//                 cost_center_filter.set_value([]); location_code_filter.set_value([]);
//                 cost_center_filter.df.options = []; cost_center_filter.refresh();
//                 location_code_filter.df.options = []; location_code_filter.refresh();
//                 if (units.length) { loadCostCenters(units); loadLocationCodes(units); }
//             }
//         }, render_input:true
//     });
//     addSelectAllButton(unit_filter, "Unit");

//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Cost Center", fieldtype:"MultiSelectList", fieldname:"cost_center", options:[] },
//         render_input:true
//     });
//     addSelectAllButton(cost_center_filter, "Cost Center");

//     let location_code_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Location Code", fieldtype:"MultiSelectList", fieldname:"location_code", options:[] },
//         render_input:true
//     });
//     addSelectAllButton(location_code_filter, "Location Code");

//     let load_button = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:" ", fieldtype:"Button", fieldname:"load_button", click() { loadData(); } },
//         render_input:true
//     });
//     load_button.$wrapper.find('button').addClass("btn-primary").text("Get Report");
//     load_button.$wrapper.css("margin-top", "26px");

//     frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");

//     const $container = $(`
//         <div id="tables-container">
//             <div id="summary-area">
//                 <div class="cards-col" id="cards-area"></div>
//                 <div id="charts-row">
//                     <div class="pie-card">
//                         <div class="pie-title">Budget Breakdown</div>
//                         <div class="pie-canvas-wrap"><canvas id="budget-pie"></canvas></div>
//                         <div class="pie-legend" id="budget-legend"></div>
//                     </div>
//                     <div class="pie-card">
//                         <div class="pie-title">Actuals Breakdown</div>
//                         <div class="pie-canvas-wrap"><canvas id="actuals-pie"></canvas></div>
//                         <div class="pie-legend" id="actuals-legend"></div>
//                     </div>
//                 </div>
//             </div>
//             <div id="controls-row">
//                 <input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item…">
//                 <div id="controls-right">
//                     <label id="expand-all-wrapper">
//                         <input type="checkbox" id="expand-all-checkbox"> Expand All
//                     </label>
//                     <button id="export-excel-btn">↓ Export to Excel</button>
//                 </div>
//             </div>
//             <div class="scroll-wrapper">
//                 <table class="university-table" id="phase-table"></table>
//             </div>
//         </div>
//     `);
//     $(page.body).append($container);

//     /* ── State ── */
//     let expense_heads = [], expandedHeads = [], expandedSubHeads = [], searchText = "";

//     const PALETTE = [
//         '#0076B6','#f58020','#2ecc71','#9b59b6',
//         '#e74c3c','#1abc9c','#e67e22','#2980b9',
//         '#8e44ad','#27ae60','#c0392b','#16a085'
//     ];
//     const headColor = i => PALETTE[i % PALETTE.length];

//     function utilColor(u) {
//         if (u > 100) return '#c0392b';
//         if (u >= 60)  return '#e07c3a';
//         return '#27ae60';
//     }

//     const fmt  = n => Math.round(Number(n)||0).toLocaleString('en-IN', { maximumFractionDigits:0 });
//     const rnd  = n => Math.round(Number(n)||0);
//     const pct  = (b, a) => { b = rnd(b); a = rnd(a); return b ? Math.round((a/b)*100) : 0; };
//     const mtch = (...v) => v.some(x => String(x||'').toLowerCase().includes(searchText.toLowerCase()));

//     function getKey(ctrl, key) {
//         let sel = (ctrl.get_value()||[]).map(String);
//         let opts = Array.isArray(ctrl.df?.options) ? ctrl.df.options : [];
//         return sel.map(v => { let o = opts.find(o => o && String(o.value)===v); return o?.[key]||null; }).filter(Boolean);
//     }

//     /* ── Events ── */
//     $container.find('#global-search-box').on('input', function () {
//         searchText = $(this).val().trim();
//         if (searchText) {
//             expandedHeads    = expense_heads.map(h => h.name);
//             expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads||[]).map(s => h.name+"__"+s.name));
//         } else {
//             expandedHeads = []; expandedSubHeads = [];
//             $('#expand-all-checkbox').prop('checked', false);
//         }
//         renderTable();
//     });

//     $(document).on('change', '#expand-all-checkbox', function () {
//         if ($(this).is(':checked')) {
//             expandedHeads    = expense_heads.map(h => h.name);
//             expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads||[]).map(s => h.name+"__"+s.name));
//         } else { expandedHeads = []; expandedSubHeads = []; }
//         renderTable();
//     });

//     $(document).on('click', '#export-excel-btn', exportToExcel);

//     function exportToExcel() {
//         if (typeof XLSX === "undefined") { frappe.msgprint("Excel library not loaded yet."); return; }
//         let data = [["Expense Items","Budget","Actuals","Util %","Variance"]];
//         let gB = 0, gA = 0;
//         expense_heads.forEach(h => {
//             let hB = rnd(h.ytd), hA = rnd(h.total_posted_amt_ytd);
//             gB += hB; gA += hA;
//             data.push([h.name, hB, hA, pct(hB,hA)+"%", hB-hA]);
//             (h.sub_heads||[]).forEach(s => {
//                 let sB = rnd(s.ytd), sA = rnd(s.total_posted_amt_ytd);
//                 data.push(["   "+s.name, sB, sA, pct(sB,sA)+"%", sB-sA]);
//                 (s.items||[]).forEach(i => { let b=rnd(i.ytd),a=rnd(i.total_posted_amt); data.push(["      "+i.name,b,a,pct(b,a)+"%",b-a]); });
//             });
//             (h.items||[]).forEach(i => { let b=rnd(i.ytd),a=rnd(i.total_posted_amt); data.push(["   "+i.name,b,a,pct(b,a)+"%",b-a]); });
//         });
//         data.push(["GRAND TOTAL", gB, gA, pct(gB,gA)+"%", gB-gA]);
//         let ws = XLSX.utils.aoa_to_sheet(data);
//         ws["!cols"] = [{wch:40},{wch:15},{wch:15},{wch:10},{wch:15}];
//         let wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
//         XLSX.writeFile(wb, "Expense_Report.xlsx");
//     }

//     function loadCostCenters(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 let opts = (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:"", erp_cost_center_value:String(d.erp_cost_center_value||"") }));
//                 cost_center_filter.df.options = mergeSelectedOptions(cost_center_filter, opts);
//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     function loadLocationCodes(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 let opts = (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:"", erp_loc_value:String(d.erp_loc_value||"") }));
//                 location_code_filter.df.options = mergeSelectedOptions(location_code_filter, opts);
//                 location_code_filter.refresh();
//             }
//         });
//     }

//     function loadData() {
//         let fy   = fiscal_year_filter.get_value();
//         let mon  = month_filter.get_value();
//         let unit = (unit_filter.get_value()||[]).join(",") || null;
//         let missing = [];
//         if (!fy)   missing.push("Financial Year");
//         if (!mon)  missing.push("Month");
//         if (!unit) missing.push("Unit");
//         if (missing.length) { frappe.msgprint({ title:"Required Filters", message:"Please select: "+missing.join(", "), indicator:"orange" }); return; }

//         Loader.show("We're crafting your report with care…");
//         $('#expand-all-checkbox').prop('checked', false);
//         $('#global-search-box').val("");
//         expandedHeads = []; expandedSubHeads = []; searchText = "";

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_combined_actuals",
//             args: {
//                 financial_year: fy, month: mon, unit,
//                 cost_center:           (getKey(cost_center_filter,"value")||[]).join(",") || null,
//                 location_code:         (getKey(location_code_filter,"value")||[]).join(",") || null,
//                 erp_cost_center_value: (getKey(cost_center_filter,"erp_cost_center_value")||[]).join(",") || null,
//                 erp_loc_value:         (getKey(location_code_filter,"erp_loc_value")||[]).join(",") || null
//             }
//         })
//         .done(r => {
//             expense_heads = Array.isArray(r.message) ? r.message : (r.message?.message || []);
//             renderCards(expense_heads);
//             renderTable();
//         })
//         .fail(() => frappe.msgprint({ title:"Error", message:"Failed to load data.", indicator:"red" }))
//         .always(() => Loader.hide());
//     }

//     /* ── Build card ── */
//     function buildCard(name, budget, actual, color, isSub) {
//         let u  = pct(budget, actual);
//         let bw = Math.min(u, 100);
//         let uc = utilColor(u);
//         let cls = isSub ? 'number-card sub' : 'number-card';
//         return $(`
//             <div class="${cls}" style="border-left-color:${color};">
//                 <div class="number-title" title="${frappe.utils.escape_html(name)}">${frappe.utils.escape_html(name)}</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${fmt(budget)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${fmt(actual)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${fmt(budget - actual)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value" style="color:${uc};">${u}%</div>
//                     </div>
//                 </div>
//                 <div class="util-bar-wrap">
//                     <div class="util-bar-bg">
//                         <div class="util-bar" style="width:${bw}%; background:${uc};"></div>
//                     </div>
//                 </div>
//             </div>
//         `);
//     }

//     /* ── Pie charts ── */
//     let _budgetPie = null, _actualsPie = null;

//     function renderPieCharts(data) {
//         function draw() {
//             const BUDGET_COLORS = [
//                 '#4361EE','#3A0CA3','#7209B7','#F72585',
//                 '#4CC9F0','#4895EF','#560BAD','#B5179E',
//                 '#3F37C9','#480CA8','#6A0572','#D62828'
//             ];
//             const ACTUAL_COLORS = [
//                 '#2D6A4F','#40916C','#52B788','#74C69D',
//                 '#F4A261','#E76F51','#E9C46A','#264653',
//                 '#2A9D8F','#8AB17D','#BABB74','#E07A5F'
//             ];

//             let labels = [], budgets = [], actuals = [];
//             (data||[]).forEach(h => {
//                 let validSubs = (h.sub_heads||[]).filter(s => rnd(s.ytd) !== 0 || rnd(s.total_posted_amt_ytd) !== 0);
//                 if (validSubs.length) {
//                     validSubs.forEach(s => { labels.push(s.name); budgets.push(rnd(s.ytd)); actuals.push(rnd(s.total_posted_amt_ytd)); });
//                 } else {
//                     labels.push(h.name); budgets.push(rnd(h.ytd)); actuals.push(rnd(h.total_posted_amt_ytd));
//                 }
//             });

//             const budgetColors = labels.map((_, i) => BUDGET_COLORS[i % BUDGET_COLORS.length]);
//             const actualColors = labels.map((_, i) => ACTUAL_COLORS[i % ACTUAL_COLORS.length]);

//             const pctPlugin = {
//                 id: 'pctLabels',
//                 afterDatasetDraw(chart) {
//                     let { ctx, data } = chart;
//                     let ds = data.datasets[0];
//                     let total = ds.data.reduce((a,b)=>a+b,0);
//                     if (!total) return;
//                     let meta = chart.getDatasetMeta(0);
//                     ctx.save();
//                     meta.data.forEach((arc, i) => {
//                         let p = Math.round((ds.data[i]/total)*100);
//                         if (p < 4) return;
//                         let { x, y } = arc.tooltipPosition();
//                         ctx.fillStyle = '#fff';
//                         ctx.font = 'bold 11px sans-serif';
//                         ctx.textAlign = 'center';
//                         ctx.textBaseline = 'middle';
//                         ctx.fillText(p + '%', x, y);
//                     });
//                     ctx.restore();
//                 }
//             };

//             function buildLegend(id, values, colors) {
//                 let total = values.reduce((a,b)=>a+b,0);
//                 let $leg = $('#' + id).empty();
//                 labels.forEach((lbl, i) => {
//                     let p = total ? Math.round((values[i]/total)*100) : 0;
//                     $leg.append(`
//                         <div class="pie-legend-item">
//                             <div class="pie-legend-dot" style="background:${colors[i]};"></div>
//                             <span class="pie-legend-name" title="${frappe.utils.escape_html(lbl)}">${frappe.utils.escape_html(lbl)}</span>
//                             <span class="pie-legend-pct">${p}%</span>
//                         </div>
//                     `);
//                 });
//             }

//             function makePie(canvasId, values, colors, existing) {
//                 if (existing) existing.destroy();
//                 let ctx = document.getElementById(canvasId)?.getContext('2d');
//                 if (!ctx) return null;
//                 return new Chart(ctx, {
//                     type: 'doughnut',
//                     data: { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: '#fff', borderWidth: 2, hoverOffset: 10 }] },
//                     options: {
//                         responsive: false,
//                         cutout: '50%',
//                         animation: { animateRotate: true, duration: 600 },
//                         layout: { padding: 10 },
//                         plugins: {
//                             legend: { display: false },
//                             tooltip: {
//                                 enabled: true,
//                                 mode: 'nearest',
//                                 intersect: true,
//                                 position: 'average',
//                                 callbacks: {
//                                     title(items) { return items[0]?.label || ''; },
//                                     label(ctx) {
//                                         let total = ctx.dataset.data.reduce((a,b)=>a+b,0);
//                                         let p = total ? Math.round((ctx.parsed/total)*100) : 0;
//                                         return ` ₹${ctx.parsed.toLocaleString('en-IN')}  (${p}%)`;
//                                     }
//                                 }
//                             }
//                         }
//                     },
//                     plugins: [pctPlugin]
//                 });
//             }

//             _budgetPie  = makePie('budget-pie',  budgets, budgetColors, _budgetPie);
//             _actualsPie = makePie('actuals-pie', actuals, actualColors, _actualsPie);
//             buildLegend('budget-legend',  budgets, budgetColors);
//             buildLegend('actuals-legend', actuals, actualColors);
//         }

//         if (window.Chart) { draw(); return; }
//         let s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         s.onload = draw;
//         document.head.appendChild(s);
//     }

//     /* ── Render cards ── */
//     function renderCards(data) {
//         let $area = $('#cards-area');
//         $area.empty();
//         if (!data?.length) return;

//         let gB = 0, gA = 0;
//         data.forEach(h => { gB += rnd(h.ytd); gA += rnd(h.total_posted_amt_ytd); });

//         // Grand Total card — same structure as buildCard()
//         let gU  = pct(gB, gA);
//         let gBw = Math.min(gU, 100);
//         let gUc = utilColor(gU);

//         $area.append(`<div class="cards-section-label">Grand Total</div>`);
//         $area.append(`
//             <div class="grand-total-summary-card">
//                 <div class="number-title">Grand Total</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${fmt(gB)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${fmt(gA)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${fmt(gB - gA)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value" style="color:${gUc};">${gU}%</div>
//                     </div>
//                 </div>
//                 <div class="util-bar-wrap">
//                     <div class="util-bar-bg">
//                         <div class="util-bar" style="width:${gBw}%; background:${gUc};"></div>
//                     </div>
//                 </div>
//             </div>
//         `);

//         // Expense head cards
//         let mainHeads = data.filter(h => rnd(h.ytd) !== 0);
//         if (!mainHeads.length) {
//             requestAnimationFrame(() => requestAnimationFrame(() => renderPieCharts(data)));
//             return;
//         }

//         $area.append(`<div class="cards-section-label">Expense Heads</div>`);
//         let $mainGrid = $('<div class="card-row-grid"></div>');
//         mainHeads.forEach((h, i) => {
//             $mainGrid.append(buildCard(h.name, rnd(h.ytd), rnd(h.total_posted_amt_ytd), headColor(i), false));
//         });
//         $area.append($mainGrid);

//         // Sub head cards
//         mainHeads.forEach((h, i) => {
//             let color     = headColor(i);
//             let validSubs = (h.sub_heads||[]).filter(s => rnd(s.ytd) !== 0);
//             if (!validSubs.length) return;
//             $area.append(`
//                 <div class="cards-section-label" style="color:${color};">
//                     <span style="opacity:.45; color:#888;">Sub Heads —</span>
//                     ${frappe.utils.escape_html(h.name)}
//                 </div>
//             `);
//             let $subGrid = $('<div class="card-row-grid sub-grid"></div>');
//             validSubs.forEach(s => {
//                 $subGrid.append(buildCard(s.name, rnd(s.ytd), rnd(s.total_posted_amt_ytd), color, true));
//             });
//             $area.append($subGrid);
//         });

//         // Charts render only after cards are fully painted to the DOM
//         requestAnimationFrame(() => requestAnimationFrame(() => renderPieCharts(data)));
//     }

//     /* ── Render table ── */
//     function renderTable() {
//         let $table = $('#phase-table');
//         $table.html('');

//         if (!expense_heads?.length) {
//             $table.append(`<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No Data Found</td></tr>`);
//             return;
//         }

//         $table.append(`
//             <thead>
//                 <tr class="main-row">
//                     <th>Expense Head</th><th>Budget</th><th>Actuals</th><th>Util %</th><th>Variance</th>
//                 </tr>
//             </thead>
//         `);

//         let $tbody = $('<tbody></tbody>');
//         let gB = 0, gA = 0;

//         expense_heads.forEach(head => {
//             if (searchText &&
//                 !mtch(head.name) &&
//                 !(head.items||[]).some(i => mtch(i.name)) &&
//                 !(head.sub_heads||[]).some(s => mtch(s.name) || (s.items||[]).some(i => mtch(i.name)))
//             ) return;

//             let hB = rnd(head.ytd), hA = rnd(head.total_posted_amt_ytd);
//             gB += hB; gA += hA;
//             let exp  = expandedHeads.includes(head.name);
//             let hasC = head.items?.length || head.sub_heads?.length;

//             $tbody.append(`
//                 <tr class="expense-head" data-head="${frappe.utils.escape_html(head.name)}">
//                     <td>${hasC ? (exp?'▼ ':'▶ ') : ''}${frappe.utils.escape_html(head.name)}</td>
//                     <td>${fmt(hB)}</td><td>${fmt(hA)}</td>
//                     <td class="text-blue">${pct(hB,hA)}%</td>
//                     <td class="text-blue">${fmt(hB-hA)}</td>
//                 </tr>
//             `);

//             if (exp) {
//                 (head.items||[]).forEach(item => {
//                     if (searchText && !mtch(item.name)) return;
//                     let b = rnd(item.ytd), a = rnd(item.total_posted_amt);
//                     $tbody.append(`<tr class="line-item"><td>${frappe.utils.escape_html(item.name)}</td><td>${fmt(b)}</td><td>${fmt(a)}</td><td>${pct(b,a)}%</td><td>${fmt(b-a)}</td></tr>`);
//                 });
//                 (head.sub_heads||[]).forEach(sub => {
//                     let key  = head.name+"__"+sub.name;
//                     let sB   = rnd(sub.ytd), sA = rnd(sub.total_posted_amt_ytd);
//                     let sExp = expandedSubHeads.includes(key);
//                     $tbody.append(`
//                         <tr class="sub-head" data-sub="${frappe.utils.escape_html(key)}">
//                             <td>${sub.items?.length ? (sExp?'▼ ':'▶ ') : ''}${frappe.utils.escape_html(sub.name)}</td>
//                             <td>${fmt(sB)}</td><td>${fmt(sA)}</td>
//                             <td class="text-blue">${pct(sB,sA)}%</td>
//                             <td class="text-blue">${fmt(sB-sA)}</td>
//                         </tr>
//                     `);
//                     if (sExp) {
//                         (sub.items||[]).forEach(item => {
//                             let b = rnd(item.ytd), a = rnd(item.total_posted_amt);
//                             $tbody.append(`<tr class="line-item"><td style="padding-left:55px">${frappe.utils.escape_html(item.name)}</td><td>${fmt(b)}</td><td>${fmt(a)}</td><td>${pct(b,a)}%</td><td>${fmt(b-a)}</td></tr>`);
//                         });
//                     }
//                 });
//             }
//         });

//         $tbody.append(`
//             <tr class="grand-total-row">
//                 <td>GRAND TOTAL</td><td>${fmt(gB)}</td><td>${fmt(gA)}</td>
//                 <td>${pct(gB,gA)}%</td><td>${fmt(gB-gA)}</td>
//             </tr>
//         `);
//         $table.append($tbody);

//         let allH = expense_heads.map(h=>h.name);
//         let allS = expense_heads.flatMap(h=>(h.sub_heads||[]).map(s=>h.name+"__"+s.name));
//         $('#expand-all-checkbox').prop('checked',
//             allH.length > 0 && allH.every(n=>expandedHeads.includes(n)) && allS.every(k=>expandedSubHeads.includes(k))
//         );

//         $tbody.on('click','.expense-head', function () {
//             let n = $(this).data('head');
//             expandedHeads.includes(n) ? expandedHeads=expandedHeads.filter(x=>x!==n) : expandedHeads.push(n);
//             renderTable();
//         });
//         $tbody.on('click','.sub-head', function () {
//             let k = $(this).data('sub');
//             expandedSubHeads.includes(k) ? expandedSubHeads=expandedSubHeads.filter(x=>x!==k) : expandedSubHeads.push(k);
//             renderTable();
//         });
//     }
// };

















// old code 
// frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {

//     $(`<style>
//     #tables-container {
//         margin: 20px;
//         background: #fff;
//         border-radius: 8px;
//         padding: 8px;
//     }
//     #controls-row {
//         display: flex; flex-wrap: wrap;
//         justify-content: space-between; align-items: center;
//         gap: 8px; margin-bottom: 12px; padding: 8px 10px;
//         background: #f7f9fb; border: 1px solid #dcdcdc; border-radius: 6px;
//     }
//     #global-search-box {
//         flex: 1 1 200px; min-width: 0; max-width: 320px;
//         padding: 7px 12px; border: 1px solid #aaa;
//         border-radius: 6px; font-size: 13px; box-sizing: border-box;
//     }
//     #controls-right { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
//     #expand-all-wrapper {
//         display: flex; align-items: center; gap: 7px;
//         font-size: 13px; font-weight: 600; color: #444;
//         cursor: pointer; user-select: none; white-space: nowrap;
//     }
//     #expand-all-checkbox { width:16px; height:16px; accent-color:#0076B6; cursor:pointer; }
//     #export-excel-btn {
//         display: inline-flex; align-items: center; gap: 6px;
//         padding: 6px 14px; font-size: 13px; font-weight: 600;
//         color: #fff !important; background: #0076B6;
//         border: 1px solid #0076B6; border-radius: 6px;
//         cursor: pointer; white-space: nowrap; line-height: 1.5;
//         box-shadow: 0 1px 3px rgba(0,0,0,.12); text-decoration: none;
//         transition: background .15s ease;
//     }
//     #export-excel-btn:hover { background:#005f94; border-color:#005f94; }

//     .scroll-wrapper {
//         border: 1px solid #ccc; border-radius: 6px;
//         overflow-x: auto; overflow-y: auto; max-height: 70vh;
//         background: #fff; -webkit-overflow-scrolling: touch;
//     }
//     table.university-table { min-width: 600px; width: 100%; border-collapse: collapse; font-size: 13px; }
//     table.university-table th, table.university-table td {
//         border: 1px solid #ddd; padding: 8px 10px;
//         white-space: nowrap; vertical-align: middle;
//         text-align: center; background: #fff !important;
//     }
//     table.university-table th:first-child,
//     table.university-table td:first-child { text-align:left !important; white-space:normal; word-break:break-word; }
//     table.university-table thead tr.main-row th {
//         background: #0076B6 !important; color: #fff !important;
//         position: sticky; top: 0; z-index: 25;
//     }
//     tr.expense-head { font-weight:700; cursor:pointer; }
//     tr.expense-head:hover td { background:#F4F9FD !important; }
//     tr.sub-head { background:#FFF3E6 !important; font-weight:600; cursor:pointer; }
//     tr.sub-head:hover td { background:#FFEAD5 !important; }
//     tr.line-item td:first-child { padding-left:35px !important; }
//     tr.sub-head td:first-child { padding-left:20px !important; }
//     .text-blue { color:#0076B6; font-weight:600; }
//     tr.grand-total-row td { background:#003B63 !important; color:#fff !important; font-weight:700 !important; }

//     /* ══ SUMMARY LAYOUT ══ */
//     #summary-area {
//         display: grid;
//         grid-template-columns: 1fr 500px;
//         gap: 0 20px;
//         align-items: start;
//         margin-bottom: 18px;
//     }

//     /* ── Cards column ── */
//     #cards-area { min-width: 0; }

//     .cards-section-label {
//         font-size: 11px; font-weight: 700; letter-spacing: .8px;
//         text-transform: uppercase; color: #888;
//         margin: 14px 0 7px; padding-left: 2px;
//     }
//     .cards-section-label:first-child { margin-top: 0; }

//     .grand-total-summary-card {
//         border: 1px solid #e0e0e0;
//         border-left: 4px solid #0076B6;
//         border-radius: 8px;
//         padding: 12px 14px;
//         background: #fff;
//         box-sizing: border-box;
//         min-width: 0;
//         overflow: hidden;
//         word-break: break-word;
//         transition: box-shadow .15s ease;
//         display: flex;
//         flex-direction: column;
//         margin-bottom: 14px;
//     }
//     .grand-total-summary-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.08); }
//     .grand-total-summary-card .number-title {
//         font-size: 11px; font-weight: 600; color: #555;
//         text-transform: uppercase; letter-spacing: .5px;
//         margin-bottom: 8px; min-height: 16px;
//         overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
//     }

//     .card-row-grid {
//         display: grid !important;
//         grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
//         gap: 10px; margin-bottom: 12px;
//         width: 100%; box-sizing: border-box;
//     }
//     .card-row-grid.sub-grid {
//         grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
//         gap: 8px;
//     }

//     .number-card {
//         border: 1px solid #e0e0e0;
//         border-left: 3px solid #ccc;
//         border-radius: 8px; padding: 12px 14px;
//         background: #fff; box-sizing: border-box;
//         min-width: 0; overflow: hidden; word-break: break-word;
//         transition: box-shadow .15s ease;
//         display: flex; flex-direction: column;
//     }
//     .number-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.08); }
//     .number-card.sub {
//         background: #fafafa; border-color: #ebebeb;
//         border-left-width: 3px; border-radius: 7px; padding: 10px 12px;
//         display: flex; flex-direction: column;
//     }

//     .number-title {
//         font-size: 11px; font-weight: 600; color: #555;
//         text-transform: uppercase; letter-spacing: .5px;
//         margin-bottom: 8px;
//         overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
//         min-height: 16px;
//     }
//     .number-card.sub .number-title { font-size: 10px; color: #777; }

//     .kpi-row { display: flex; justify-content: space-between; margin-top: 4px; }
//     .kpi-block { text-align: left; }
//     .kpi-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: .4px; }
//     .kpi-value { font-size: 14px; font-weight: 700; color: #111; }
//     .number-card.sub .kpi-value { font-size: 13px; }

//     .kpi-bottom {
//         display: flex; justify-content: space-between;
//         margin-top: 8px; padding-top: 7px;
//         border-top: 1px solid #f0f0f0;
//     }

//     .util-bar-wrap {
//         margin-top: auto; padding-top: 8px;
//         border-top: 1px solid #f0f0f0;
//     }
//     .util-bar-bg { width:100%; height:4px; background:#f0f0ed; border-radius:2px; overflow:hidden; }
//     .util-bar { height:100%; border-radius:2px; transition:width .4s ease; }

//     /* ── Charts column ── */
//     #charts-row {
//         display: flex; flex-direction: column;
//         gap: 14px; min-width: 0; margin-top: 23px;
//     }
//     .pie-card {
//         background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
//         padding: 14px 16px; box-sizing: border-box;
//         display: grid;
//         grid-template-columns: 220px 1fr;
//         grid-template-rows: auto 1fr;
//         column-gap: 16px; align-items: start;
//         overflow: visible; position: relative;
//     }
//     .pie-title {
//         grid-column: 1 / -1;
//         font-size: 11px; font-weight: 700; color: #444;
//         text-transform: uppercase; letter-spacing: .6px;
//         margin-bottom: 10px;
//     }
//     .pie-canvas-wrap {
//         width: 220px; height: 220px;
//         position: relative; overflow: visible;
//     }
//     .pie-canvas-wrap canvas {
//         width: 220px !important;
//         height: 220px !important;
//     }
//     .pie-legend {
//         display: flex; flex-direction: column;
//         gap: 5px; align-self: center; min-width: 0;
//     }
//     .pie-legend-item {
//         display: grid;
//         grid-template-columns: 10px 1fr auto;
//         align-items: center; gap: 5px;
//         font-size: 11px; color: #555; min-width: 0;
//     }
//     .pie-legend-dot { width:10px; height:10px; border-radius:2px; flex-shrink:0; }
//     .pie-legend-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
//     .pie-legend-pct { font-weight:700; color:#222; white-space:nowrap; padding-left:4px; min-width:36px; text-align:right; }

//     /* ── Loader ── */
//     #global-loader.loader-overlay {
//         position:fixed; inset:0; width:100vw; height:100vh;
//         background:rgba(18,18,18,.92); backdrop-filter:blur(6px);
//         z-index:999999; display:none; align-items:center; justify-content:center;
//     }
//     #global-loader.loader-overlay.active { display:flex; }
//     .loader-box { display:flex; flex-direction:column; align-items:center; gap:14px; }
//     .loader-logo {
//         width:90px; height:90px; border-radius:50%;
//         background:linear-gradient(145deg,#fff,#eaeaea); padding:14px;
//         object-fit:contain; box-shadow:0 10px 30px rgba(0,0,0,.35);
//         animation:pulse 1.6s infinite ease-in-out;
//     }
//     .loader-text { font-size:14px; color:#fff; font-weight:600; opacity:.85; }
//     @keyframes pulse { 0%,100%{transform:scale(1);opacity:.8;} 50%{transform:scale(1.08);opacity:1;} }

//     .custom-filter-row { padding:15px 20px; background:#fff; border-radius:6px; margin-top:10px; }
//     .custom-filter-row.row { margin-left:0; margin-right:0; }
//     .custom-select-all-btn { margin-right:8px; }

//     /* ── Responsive ── */
//     @media(max-width:1280px) {
//         #summary-area { grid-template-columns: 1fr 460px; }
//         .pie-canvas-wrap, .pie-canvas-wrap canvas { width:200px !important; height:200px !important; }
//         .pie-card { grid-template-columns: 200px 1fr; }
//     }
//     @media(max-width:1024px) {
//         #summary-area { grid-template-columns: 1fr; }
//         #charts-row { flex-direction: row; }
//         .pie-card { grid-template-columns: 180px 1fr; }
//         .pie-canvas-wrap, .pie-canvas-wrap canvas { width:180px !important; height:180px !important; }
//     }
//     @media(max-width:768px) {
//         #tables-container { margin:6px; padding:6px; }
//         #controls-row { flex-direction:column; align-items:stretch; }
//         #global-search-box { max-width:100%; width:100%; }
//         #summary-area { grid-template-columns: 1fr; }
//         #charts-row { flex-direction: column; }
//         .card-row-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
//         .card-row-grid.sub-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
//         .pie-card { grid-template-columns: 1fr; }
//         .pie-canvas-wrap { width:100%; height:200px; }
//         .pie-canvas-wrap canvas { width:100% !important; height:200px !important; }
//         .custom-filter-row { padding:10px; }
//         .custom-filter-row .col-md-4 { width:100%; margin-bottom:8px; }
//         table.university-table { font-size:11px; }
//         table.university-table th, table.university-table td { padding:5px 6px; }
//     }
//     @media(max-width:480px) {
//         .card-row-grid, .card-row-grid.sub-grid { grid-template-columns: 1fr !important; }
//         #export-excel-btn { width:100%; }
//     }
//     </style>`).appendTo('head');

//     if (!$("#global-loader").length) {
//         $("body").append(`
//             <div id="global-loader" class="loader-overlay">
//                 <div class="loader-box">
//                     <img src="/files/APF logo.png" class="loader-logo" alt="Loading">
//                     <div class="loader-text">Loading, please wait…</div>
//                 </div>
//             </div>
//         `);
//     }
//     const Loader = {
//         show(msg = "Loading, please wait…") { $("#global-loader").find(".loader-text").text(msg); $("#global-loader").addClass("active"); },
//         hide() { $("#global-loader").removeClass("active"); }
//     };

//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget vs Actuals Face Sheet',
//         single_column: true
//     });

//     function updatePageTitle(fy) {
//         page.set_title('Budget vs Actuals Face Sheet' + (fy ? ' – ' + fy : ''));
//     }

//     /* ── Filters ── */
//     let filter_section = $(`<div class="frappe-control-group row custom-filter-row"></div>`).appendTo(page.body);
//     const make_field = () => $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);

//     function mergeSelectedOptions(ctrl, new_opts) {
//         let selected = (ctrl.get_value() || []).map(String);
//         let map = {};
//         ((ctrl.df && ctrl.df.options) ? ctrl.df.options : []).forEach(o => { if (o?.value != null) map[String(o.value)] = o; });
//         new_opts.forEach(o => { if (o?.value != null) map[String(o.value)] = o; });
//         selected.forEach(v => { if (!map[v]) map[v] = { label:v, value:v, description:"" }; });
//         return Object.values(map);
//     }

//     function addSelectAllButton(ctrl, label) {
//         if (!ctrl?.$input) return;
//         ctrl.$input.on("focus", function () {
//             setTimeout(function () {
//                 let $dd = $('.multiselect-dropdown:visible').last();
//                 if (!$dd.length) return;
//                 let $act = $dd.find('.multiselect-actions');
//                 if (!$act.length) return;
//                 $act.find('.custom-select-all-btn').remove();
//                 let $btn = $(`<button type="button" class="btn btn-xs btn-default custom-select-all-btn">Select All</button>`);
//                 $btn.on("click", function (e) {
//                     e.stopPropagation(); e.preventDefault();
//                     function apply(data) { let vals = data.map(d => String(d.value ?? d)); if (vals.length) ctrl.set_value(vals); }
//                     if (ctrl.get_data) {
//                         let r = ctrl.get_data();
//                         r && typeof r.then === "function" ? r.then(apply).catch(err => console.error(label, err)) : Array.isArray(r) && apply(r);
//                     } else if (Array.isArray(ctrl.df?.options)) {
//                         apply(ctrl.df.options.map(o => typeof o === "object" ? o : { value:o }));
//                     }
//                 });
//                 $act.prepend($btn);
//             }, 120);
//         });
//     }

//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Financial Year", fieldtype:"Select", fieldname:"financial_year", reqd:1,
//             change() { let y = this.get_value(); if (y) updatePageTitle(y); }
//         }, render_input:true
//     });
//     fiscal_year_filter.refresh();
//     frappe.call({
//         method: "annual_budget.api.filter_options.get_financial_year_list",
//         callback(r) {
//             if (!r.message?.length) return;
//             let years = r.message.map(d => d.financial_year);
//             fiscal_year_filter.df.options = years.join("\n"); fiscal_year_filter.refresh();
//             let now = new Date(), m = now.getMonth()+1, y = now.getFullYear();
//             let fy = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             let def = years.includes(fy) ? fy : years[0];
//             fiscal_year_filter.set_value(def); updatePageTitle(def);
//         }
//     });

//     let month_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"YTD Month", fieldtype:"Select", fieldname:"month", reqd:1,
//             options:["January","February","March","April","May","June","July","August","September","October","November","December"].join("\n")
//         }, render_input:true
//     });
//     month_filter.set_value(new Date().toLocaleString('default', { month:'long' }));

//     let theme_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Operating Units", fieldtype:"MultiSelectList", fieldname:"theme",
//             get_data() { return frappe.call({ method:"annual_budget.api.filter_options.get_theme" }).then(r => (r.message||[]).map(d => ({ label:d.number_card_title, value:d.name, description:"" }))); }
//         }, render_input:true
//     });
//     addSelectAllButton(theme_filter, "Operating Units");

//     let unit_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Unit", fieldtype:"MultiSelectList", fieldname:"unit", reqd:1,
//             get_data() { return frappe.call({ method:"annual_budget.api.filter_options.get_units" }).then(r => (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:"" }))); },
//             change() {
//                 let units = (unit_filter.get_value()||[]).map(String);
//                 cost_center_filter.set_value([]); location_code_filter.set_value([]);
//                 cost_center_filter.df.options = []; cost_center_filter.refresh();
//                 location_code_filter.df.options = []; location_code_filter.refresh();
//                 if (units.length) { loadCostCenters(units); loadLocationCodes(units); }
//             }
//         }, render_input:true
//     });
//     addSelectAllButton(unit_filter, "Unit");

//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Cost Center", fieldtype:"MultiSelectList", fieldname:"cost_center", options:[] },
//         render_input:true
//     });
//     addSelectAllButton(cost_center_filter, "Cost Center");

//     let location_code_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Location Code", fieldtype:"MultiSelectList", fieldname:"location_code", options:[] },
//         render_input:true
//     });
//     addSelectAllButton(location_code_filter, "Location Code");

//     let load_button = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:" ", fieldtype:"Button", fieldname:"load_button", click() { loadData(); } },
//         render_input:true
//     });
//     load_button.$wrapper.find('button').addClass("btn-primary").text("Get Report");
//     load_button.$wrapper.css("margin-top", "26px");

//     frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");

//     /* ── Container — report-content hidden until data loads ── */
//     const $container = $(`
//         <div id="tables-container">
//             <div id="report-content" style="display:none;">
//                 <div id="summary-area">
//                     <div class="cards-col" id="cards-area"></div>
//                     <div id="charts-row">
//                         <div class="pie-card">
//                             <div class="pie-title">Budget Breakdown</div>
//                             <div class="pie-canvas-wrap"><canvas id="budget-pie"></canvas></div>
//                             <div class="pie-legend" id="budget-legend"></div>
//                         </div>
//                         <div class="pie-card">
//                             <div class="pie-title">Actuals Breakdown</div>
//                             <div class="pie-canvas-wrap"><canvas id="actuals-pie"></canvas></div>
//                             <div class="pie-legend" id="actuals-legend"></div>
//                         </div>
//                     </div>
//                 </div>
//                 <div id="controls-row">
//                     <input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item…">
//                     <div id="controls-right">
//                         <label id="expand-all-wrapper">
//                             <input type="checkbox" id="expand-all-checkbox"> Expand All
//                         </label>
//                         <button id="export-excel-btn">↓ Export to Excel</button>
//                     </div>
//                 </div>
//                 <div class="scroll-wrapper">
//                     <table class="university-table" id="phase-table"></table>
//                 </div>
//             </div>
//         </div>
//     `);
//     $(page.body).append($container);

//     /* ── State ── */
//     let expense_heads = [], expandedHeads = [], expandedSubHeads = [], searchText = "";

//     const PALETTE = [
//         '#0076B6','#f58020','#2ecc71','#9b59b6',
//         '#e74c3c','#1abc9c','#e67e22','#2980b9',
//         '#8e44ad','#27ae60','#c0392b','#16a085'
//     ];
//     const headColor = i => PALETTE[i % PALETTE.length];

//     function utilColor(u) {
//         if (u > 100) return '#c0392b';
//         if (u >= 60)  return '#e07c3a';
//         return '#27ae60';
//     }

//     const fmt  = n => Math.round(Number(n)||0).toLocaleString('en-IN', { maximumFractionDigits:0 });
//     const rnd  = n => Math.round(Number(n)||0);
//     const pct  = (b, a) => { b = rnd(b); a = rnd(a); return b ? Math.round((a/b)*100) : 0; };
//     const mtch = (...v) => v.some(x => String(x||'').toLowerCase().includes(searchText.toLowerCase()));

//     function getKey(ctrl, key) {
//         let sel = (ctrl.get_value()||[]).map(String);
//         let opts = Array.isArray(ctrl.df?.options) ? ctrl.df.options : [];
//         return sel.map(v => { let o = opts.find(o => o && String(o.value)===v); return o?.[key]||null; }).filter(Boolean);
//     }

//     /* ── Events ── */
//     $container.find('#global-search-box').on('input', function () {
//         searchText = $(this).val().trim();
//         if (searchText) {
//             expandedHeads    = expense_heads.map(h => h.name);
//             expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads||[]).map(s => h.name+"__"+s.name));
//         } else {
//             expandedHeads = []; expandedSubHeads = [];
//             $('#expand-all-checkbox').prop('checked', false);
//         }
//         renderTable();
//     });

//     $(document).on('change', '#expand-all-checkbox', function () {
//         if ($(this).is(':checked')) {
//             expandedHeads    = expense_heads.map(h => h.name);
//             expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads||[]).map(s => h.name+"__"+s.name));
//         } else { expandedHeads = []; expandedSubHeads = []; }
//         renderTable();
//     });

//     $(document).on('click', '#export-excel-btn', exportToExcel);

//     function exportToExcel() {
//         if (typeof XLSX === "undefined") { frappe.msgprint("Excel library not loaded yet."); return; }
//         let data = [["Expense Items","Budget","Actuals","Util %","Variance"]];
//         let gB = 0, gA = 0;
//         expense_heads.forEach(h => {
//             let hB = rnd(h.ytd), hA = rnd(h.total_posted_amt_ytd);
//             gB += hB; gA += hA;
//             data.push([h.name, hB, hA, pct(hB,hA)+"%", hB-hA]);
//             (h.sub_heads||[]).forEach(s => {
//                 let sB = rnd(s.ytd), sA = rnd(s.total_posted_amt_ytd);
//                 data.push(["   "+s.name, sB, sA, pct(sB,sA)+"%", sB-sA]);
//                 (s.items||[]).forEach(i => { let b=rnd(i.ytd),a=rnd(i.total_posted_amt); data.push(["      "+i.name,b,a,pct(b,a)+"%",b-a]); });
//             });
//             (h.items||[]).forEach(i => { let b=rnd(i.ytd),a=rnd(i.total_posted_amt); data.push(["   "+i.name,b,a,pct(b,a)+"%",b-a]); });
//         });
//         data.push(["GRAND TOTAL", gB, gA, pct(gB,gA)+"%", gB-gA]);
//         let ws = XLSX.utils.aoa_to_sheet(data);
//         ws["!cols"] = [{wch:40},{wch:15},{wch:15},{wch:10},{wch:15}];
//         let wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
//         XLSX.writeFile(wb, "Expense_Report.xlsx");
//     }

//     function loadCostCenters(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 let opts = (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:"", erp_cost_center_value:String(d.erp_cost_center_value||"") }));
//                 cost_center_filter.df.options = mergeSelectedOptions(cost_center_filter, opts);
//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     function loadLocationCodes(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 let opts = (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:"", erp_loc_value:String(d.erp_loc_value||"") }));
//                 location_code_filter.df.options = mergeSelectedOptions(location_code_filter, opts);
//                 location_code_filter.refresh();
//             }
//         });
//     }

//     function loadData() {
//         let fy   = fiscal_year_filter.get_value();
//         let mon  = month_filter.get_value();
//         let unit = (unit_filter.get_value()||[]).join(",") || null;
//         let missing = [];
//         if (!fy)   missing.push("Financial Year");
//         if (!mon)  missing.push("Month");
//         if (!unit) missing.push("Unit");
//         if (missing.length) { frappe.msgprint({ title:"Required Filters", message:"Please select: "+missing.join(", "), indicator:"orange" }); return; }

//         Loader.show("We're crafting your report with care…");
//         $('#expand-all-checkbox').prop('checked', false);
//         $('#global-search-box').val("");
//         expandedHeads = []; expandedSubHeads = []; searchText = "";

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_combined_actuals",
//             args: {
//                 financial_year: fy, month: mon, unit,
//                 cost_center:           (getKey(cost_center_filter,"value")||[]).join(",") || null,
//                 location_code:         (getKey(location_code_filter,"value")||[]).join(",") || null,
//                 erp_cost_center_value: (getKey(cost_center_filter,"erp_cost_center_value")||[]).join(",") || null,
//                 erp_loc_value:         (getKey(location_code_filter,"erp_loc_value")||[]).join(",") || null
//             }
//         })
//         .done(r => {
//             expense_heads = Array.isArray(r.message) ? r.message : (r.message?.message || []);

//             // Reveal everything only after data is ready
//             $('#report-content').show();

//             renderCards(expense_heads);
//             renderTable();
//         })
//         .fail(() => frappe.msgprint({ title:"Error", message:"Failed to load data.", indicator:"red" }))
//         .always(() => Loader.hide());
//     }

//     /* ── Build card ── */
//     function buildCard(name, budget, actual, color, isSub) {
//         let u  = pct(budget, actual);
//         let bw = Math.min(u, 100);
//         let uc = utilColor(u);
//         let cls = isSub ? 'number-card sub' : 'number-card';
//         return $(`
//             <div class="${cls}" style="border-left-color:${color};">
//                 <div class="number-title" title="${frappe.utils.escape_html(name)}">${frappe.utils.escape_html(name)}</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${fmt(budget)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${fmt(actual)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${fmt(budget - actual)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value" style="color:${uc};">${u}%</div>
//                     </div>
//                 </div>
//                 <div class="util-bar-wrap">
//                     <div class="util-bar-bg">
//                         <div class="util-bar" style="width:${bw}%; background:${uc};"></div>
//                     </div>
//                 </div>
//             </div>
//         `);
//     }

//     /* ── Pie charts ── */
//     let _budgetPie = null, _actualsPie = null;

//     function renderPieCharts(data) {
//         function draw() {
//             const BUDGET_COLORS = [
//                 '#4361EE','#3A0CA3','#7209B7','#F72585',
//                 '#4CC9F0','#4895EF','#560BAD','#B5179E',
//                 '#3F37C9','#480CA8','#6A0572','#D62828'
//             ];
//             const ACTUAL_COLORS = [
//                 '#2D6A4F','#40916C','#52B788','#74C69D',
//                 '#F4A261','#E76F51','#E9C46A','#264653',
//                 '#2A9D8F','#8AB17D','#BABB74','#E07A5F'
//             ];

//             let labels = [], budgets = [], actuals = [];
//             (data||[]).forEach(h => {
//                 let validSubs = (h.sub_heads||[]).filter(s => rnd(s.ytd) !== 0 || rnd(s.total_posted_amt_ytd) !== 0);
//                 if (validSubs.length) {
//                     validSubs.forEach(s => { labels.push(s.name); budgets.push(rnd(s.ytd)); actuals.push(rnd(s.total_posted_amt_ytd)); });
//                 } else {
//                     labels.push(h.name); budgets.push(rnd(h.ytd)); actuals.push(rnd(h.total_posted_amt_ytd));
//                 }
//             });

//             const budgetColors = labels.map((_, i) => BUDGET_COLORS[i % BUDGET_COLORS.length]);
//             const actualColors = labels.map((_, i) => ACTUAL_COLORS[i % ACTUAL_COLORS.length]);

//             const pctPlugin = {
//                 id: 'pctLabels',
//                 afterDatasetDraw(chart) {
//                     let { ctx, data } = chart;
//                     let ds = data.datasets[0];
//                     let total = ds.data.reduce((a,b)=>a+b,0);
//                     if (!total) return;
//                     let meta = chart.getDatasetMeta(0);
//                     ctx.save();
//                     meta.data.forEach((arc, i) => {
//                         let p = Math.round((ds.data[i]/total)*100);
//                         if (p < 4) return;
//                         let { x, y } = arc.tooltipPosition();
//                         ctx.fillStyle = '#fff';
//                         ctx.font = 'bold 11px sans-serif';
//                         ctx.textAlign = 'center';
//                         ctx.textBaseline = 'middle';
//                         ctx.fillText(p + '%', x, y);
//                     });
//                     ctx.restore();
//                 }
//             };

//             function buildLegend(id, values, colors) {
//                 let total = values.reduce((a,b)=>a+b,0);
//                 let $leg = $('#' + id).empty();
//                 labels.forEach((lbl, i) => {
//                     let p = total ? Math.round((values[i]/total)*100) : 0;
//                     $leg.append(`
//                         <div class="pie-legend-item">
//                             <div class="pie-legend-dot" style="background:${colors[i]};"></div>
//                             <span class="pie-legend-name" title="${frappe.utils.escape_html(lbl)}">${frappe.utils.escape_html(lbl)}</span>
//                             <span class="pie-legend-pct">${p}%</span>
//                         </div>
//                     `);
//                 });
//             }

//             function makePie(canvasId, values, colors, existing) {
//                 if (existing) existing.destroy();
//                 let ctx = document.getElementById(canvasId)?.getContext('2d');
//                 if (!ctx) return null;
//                 return new Chart(ctx, {
//                     type: 'doughnut',
//                     data: { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: '#fff', borderWidth: 2, hoverOffset: 10 }] },
//                     options: {
//                         responsive: false,
//                         cutout: '50%',
//                         animation: { animateRotate: true, duration: 600 },
//                         layout: { padding: 10 },
//                         plugins: {
//                             legend: { display: false },
//                             tooltip: {
//                                 enabled: true,
//                                 mode: 'nearest',
//                                 intersect: true,
//                                 position: 'average',
//                                 callbacks: {
//                                     title(items) { return items[0]?.label || ''; },
//                                     label(ctx) {
//                                         let total = ctx.dataset.data.reduce((a,b)=>a+b,0);
//                                         let p = total ? Math.round((ctx.parsed/total)*100) : 0;
//                                         return ` ₹${ctx.parsed.toLocaleString('en-IN')}  (${p}%)`;
//                                     }
//                                 }
//                             }
//                         }
//                     },
//                     plugins: [pctPlugin]
//                 });
//             }

//             _budgetPie  = makePie('budget-pie',  budgets, budgetColors, _budgetPie);
//             _actualsPie = makePie('actuals-pie', actuals, actualColors, _actualsPie);
//             buildLegend('budget-legend',  budgets, budgetColors);
//             buildLegend('actuals-legend', actuals, actualColors);
//         }

//         if (window.Chart) { draw(); return; }
//         let s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         s.onload = draw;
//         document.head.appendChild(s);
//     }

//     /* ── Render cards ── */
//     function renderCards(data) {
//         let $area = $('#cards-area');
//         $area.empty();
//         if (!data?.length) return;

//         let gB = 0, gA = 0;
//         data.forEach(h => { gB += rnd(h.ytd); gA += rnd(h.total_posted_amt_ytd); });

//         let gU  = pct(gB, gA);
//         let gBw = Math.min(gU, 100);
//         let gUc = utilColor(gU);

//         $area.append(`<div class="cards-section-label">Grand Total</div>`);
//         $area.append(`
//             <div class="grand-total-summary-card">
//                 <div class="number-title">Grand Total</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${fmt(gB)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${fmt(gA)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${fmt(gB - gA)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value" style="color:${gUc};">${gU}%</div>
//                     </div>
//                 </div>
//                 <div class="util-bar-wrap">
//                     <div class="util-bar-bg">
//                         <div class="util-bar" style="width:${gBw}%; background:${gUc};"></div>
//                     </div>
//                 </div>
//             </div>
//         `);

//         let mainHeads = data.filter(h => rnd(h.ytd) !== 0);
//         if (!mainHeads.length) {
//             requestAnimationFrame(() => requestAnimationFrame(() => renderPieCharts(data)));
//             return;
//         }

//         $area.append(`<div class="cards-section-label">Expense Heads</div>`);
//         let $mainGrid = $('<div class="card-row-grid"></div>');
//         mainHeads.forEach((h, i) => {
//             $mainGrid.append(buildCard(h.name, rnd(h.ytd), rnd(h.total_posted_amt_ytd), headColor(i), false));
//         });
//         $area.append($mainGrid);

//         mainHeads.forEach((h, i) => {
//             let color     = headColor(i);
//             let validSubs = (h.sub_heads||[]).filter(s => rnd(s.ytd) !== 0);
//             if (!validSubs.length) return;
//             $area.append(`
//                 <div class="cards-section-label" style="color:${color};">
//                     <span style="opacity:.45; color:#888;">Sub Heads —</span>
//                     ${frappe.utils.escape_html(h.name)}
//                 </div>
//             `);
//             let $subGrid = $('<div class="card-row-grid sub-grid"></div>');
//             validSubs.forEach(s => {
//                 $subGrid.append(buildCard(s.name, rnd(s.ytd), rnd(s.total_posted_amt_ytd), color, true));
//             });
//             $area.append($subGrid);
//         });

//         requestAnimationFrame(() => requestAnimationFrame(() => renderPieCharts(data)));
//     }

//     /* ── Render table ── */
//     function renderTable() {
//         let $table = $('#phase-table');
//         $table.html('');

//         if (!expense_heads?.length) {
//             $table.append(`<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No Data Found</td></tr>`);
//             return;
//         }

//         $table.append(`
//             <thead>
//                 <tr class="main-row">
//                     <th>Expense Head</th><th>Budget</th><th>Actuals</th><th>Util %</th><th>Variance</th>
//                 </tr>
//             </thead>
//         `);

//         let $tbody = $('<tbody></tbody>');
//         let gB = 0, gA = 0;

//         expense_heads.forEach(head => {
//             if (searchText &&
//                 !mtch(head.name) &&
//                 !(head.items||[]).some(i => mtch(i.name)) &&
//                 !(head.sub_heads||[]).some(s => mtch(s.name) || (s.items||[]).some(i => mtch(i.name)))
//             ) return;

//             let hB = rnd(head.ytd), hA = rnd(head.total_posted_amt_ytd);
//             gB += hB; gA += hA;
//             let exp  = expandedHeads.includes(head.name);
//             let hasC = head.items?.length || head.sub_heads?.length;

//             $tbody.append(`
//                 <tr class="expense-head" data-head="${frappe.utils.escape_html(head.name)}">
//                     <td>${hasC ? (exp?'▼ ':'▶ ') : ''}${frappe.utils.escape_html(head.name)}</td>
//                     <td>${fmt(hB)}</td><td>${fmt(hA)}</td>
//                     <td class="text-blue">${pct(hB,hA)}%</td>
//                     <td class="text-blue">${fmt(hB-hA)}</td>
//                 </tr>
//             `);

//             if (exp) {
//                 (head.items||[]).forEach(item => {
//                     if (searchText && !mtch(item.name)) return;
//                     let b = rnd(item.ytd), a = rnd(item.total_posted_amt);
//                     $tbody.append(`<tr class="line-item"><td>${frappe.utils.escape_html(item.name)}</td><td>${fmt(b)}</td><td>${fmt(a)}</td><td>${pct(b,a)}%</td><td>${fmt(b-a)}</td></tr>`);
//                 });
//                 (head.sub_heads||[]).forEach(sub => {
//                     let key  = head.name+"__"+sub.name;
//                     let sB   = rnd(sub.ytd), sA = rnd(sub.total_posted_amt_ytd);
//                     let sExp = expandedSubHeads.includes(key);
//                     $tbody.append(`
//                         <tr class="sub-head" data-sub="${frappe.utils.escape_html(key)}">
//                             <td>${sub.items?.length ? (sExp?'▼ ':'▶ ') : ''}${frappe.utils.escape_html(sub.name)}</td>
//                             <td>${fmt(sB)}</td><td>${fmt(sA)}</td>
//                             <td class="text-blue">${pct(sB,sA)}%</td>
//                             <td class="text-blue">${fmt(sB-sA)}</td>
//                         </tr>
//                     `);
//                     if (sExp) {
//                         (sub.items||[]).forEach(item => {
//                             let b = rnd(item.ytd), a = rnd(item.total_posted_amt);
//                             $tbody.append(`<tr class="line-item"><td style="padding-left:55px">${frappe.utils.escape_html(item.name)}</td><td>${fmt(b)}</td><td>${fmt(a)}</td><td>${pct(b,a)}%</td><td>${fmt(b-a)}</td></tr>`);
//                         });
//                     }
//                 });
//             }
//         });

//         $tbody.append(`
//             <tr class="grand-total-row">
//                 <td>GRAND TOTAL</td><td>${fmt(gB)}</td><td>${fmt(gA)}</td>
//                 <td>${pct(gB,gA)}%</td><td>${fmt(gB-gA)}</td>
//             </tr>
//         `);
//         $table.append($tbody);

//         let allH = expense_heads.map(h=>h.name);
//         let allS = expense_heads.flatMap(h=>(h.sub_heads||[]).map(s=>h.name+"__"+s.name));
//         $('#expand-all-checkbox').prop('checked',
//             allH.length > 0 && allH.every(n=>expandedHeads.includes(n)) && allS.every(k=>expandedSubHeads.includes(k))
//         );

//         $tbody.on('click','.expense-head', function () {
//             let n = $(this).data('head');
//             expandedHeads.includes(n) ? expandedHeads=expandedHeads.filter(x=>x!==n) : expandedHeads.push(n);
//             renderTable();
//         });
//         $tbody.on('click','.sub-head', function () {
//             let k = $(this).data('sub');
//             expandedSubHeads.includes(k) ? expandedSubHeads=expandedSubHeads.filter(x=>x!==k) : expandedSubHeads.push(k);
//             renderTable();
//         });
//     }
// };



// update 1
// frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {

//     $(`<style>
//     #tables-container {
//         margin: 20px;
//         background: #fff;
//         border-radius: 8px;
//         padding: 8px;
//     }
//     #controls-row {
//         display: flex; flex-wrap: wrap;
//         justify-content: space-between; align-items: center;
//         gap: 8px; margin-bottom: 12px; padding: 8px 10px;
//         background: #f7f9fb; border: 1px solid #dcdcdc; border-radius: 6px;
//     }
//     #global-search-box {
//         flex: 1 1 200px; min-width: 0; max-width: 320px;
//         padding: 7px 12px; border: 1px solid #aaa;
//         border-radius: 6px; font-size: 13px; box-sizing: border-box;
//     }
//     #controls-right { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
//     #expand-all-wrapper {
//         display: flex; align-items: center; gap: 7px;
//         font-size: 13px; font-weight: 600; color: #444;
//         cursor: pointer; user-select: none; white-space: nowrap;
//     }
//     #expand-all-checkbox { width:16px; height:16px; accent-color:#0076B6; cursor:pointer; }
//     #export-excel-btn {
//         display: inline-flex; align-items: center; gap: 6px;
//         padding: 6px 14px; font-size: 13px; font-weight: 600;
//         color: #fff !important; background: #0076B6;
//         border: 1px solid #0076B6; border-radius: 6px;
//         cursor: pointer; white-space: nowrap; line-height: 1.5;
//         box-shadow: 0 1px 3px rgba(0,0,0,.12); text-decoration: none;
//         transition: background .15s ease;
//     }
//     #export-excel-btn:hover { background:#005f94; border-color:#005f94; }

//     .scroll-wrapper {
//         border: 1px solid #ccc; border-radius: 6px;
//         overflow-x: auto; overflow-y: auto; max-height: 70vh;
//         background: #fff; -webkit-overflow-scrolling: touch;
//     }
//     table.university-table { min-width: 600px; width: 100%; border-collapse: collapse; font-size: 13px; }
//     table.university-table th, table.university-table td {
//         border: 1px solid #ddd; padding: 8px 10px;
//         white-space: nowrap; vertical-align: middle;
//         text-align: center; background: #fff !important;
//     }
//     table.university-table th:first-child,
//     table.university-table td:first-child { text-align:left !important; white-space:normal; word-break:break-word; }
//     table.university-table thead tr.main-row th {
//         background: #0076B6 !important; color: #fff !important;
//         position: sticky; top: 0; z-index: 25;
//     }
//     tr.expense-head { font-weight:700; cursor:pointer; }
//     tr.expense-head:hover td { background:#F4F9FD !important; }
//     tr.sub-head { background:#FFF3E6 !important; font-weight:600; cursor:pointer; }
//     tr.sub-head:hover td { background:#FFEAD5 !important; }
//     tr.line-item td:first-child { padding-left:35px !important; }
//     tr.sub-head td:first-child { padding-left:20px !important; }
//     .text-blue { color:#0076B6; font-weight:600; }
//     tr.grand-total-row td { background:#003B63 !important; color:#fff !important; font-weight:700 !important; }

//     /* ══ SUMMARY LAYOUT ══ */
//     #summary-area {
//         display: grid;
//         grid-template-columns: 1fr 500px;
//         gap: 0 20px;
//         align-items: start;
//         margin-bottom: 18px;
//     }

//     /* ── Cards column ── */
//     #cards-area { min-width: 0; }

//     .cards-section-label {
//         font-size: 11px; font-weight: 700; letter-spacing: .8px;
//         text-transform: uppercase; color: #888;
//         margin: 14px 0 7px; padding-left: 2px;
//     }
//     .cards-section-label:first-child { margin-top: 0; }

//     .grand-total-summary-card {
//         border: 1px solid #e0e0e0;
//         border-left: 4px solid #0076B6;
//         border-radius: 8px;
//         padding: 12px 14px;
//         background: #fff;
//         box-sizing: border-box;
//         min-width: 0;
//         overflow: hidden;
//         word-break: break-word;
//         transition: box-shadow .15s ease;
//         display: flex;
//         flex-direction: column;
//         margin-bottom: 14px;
//     }
//     .grand-total-summary-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.08); }
//     .grand-total-summary-card .number-title {
//         font-size: 11px; font-weight: 600; color: #555;
//         text-transform: uppercase; letter-spacing: .5px;
//         margin-bottom: 8px; min-height: 16px;
//         overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
//     }

//     .card-row-grid {
//         display: grid !important;
//         grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
//         gap: 10px; margin-bottom: 12px;
//         width: 100%; box-sizing: border-box;
//     }
//     .card-row-grid.sub-grid {
//         grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
//         gap: 8px;
//     }

//     .number-card {
//         border: 1px solid #e0e0e0;
//         border-left: 3px solid #ccc;
//         border-radius: 8px; padding: 12px 14px;
//         background: #fff; box-sizing: border-box;
//         min-width: 0; overflow: hidden; word-break: break-word;
//         transition: box-shadow .15s ease;
//         display: flex; flex-direction: column;
//     }
//     .number-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.08); }
//     .number-card.sub {
//         background: #fafafa; border-color: #ebebeb;
//         border-left-width: 3px; border-radius: 7px; padding: 10px 12px;
//         display: flex; flex-direction: column;
//     }

//     .number-title {
//         font-size: 11px; font-weight: 600; color: #555;
//         text-transform: uppercase; letter-spacing: .5px;
//         margin-bottom: 8px;
//         overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
//         min-height: 16px;
//     }
//     .number-card.sub .number-title { font-size: 10px; color: #777; }

//     .kpi-row { display: flex; justify-content: space-between; margin-top: 4px; }
//     .kpi-block { text-align: left; }
//     .kpi-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: .4px; }
//     .kpi-value { font-size: 14px; font-weight: 700; color: #111; }
//     .number-card.sub .kpi-value { font-size: 13px; }

//     .kpi-bottom {
//         display: flex; justify-content: space-between;
//         margin-top: 8px; padding-top: 7px;
//         border-top: 1px solid #f0f0f0;
//     }

//     .util-bar-wrap {
//         margin-top: auto; padding-top: 8px;
//         border-top: 1px solid #f0f0f0;
//     }
//     .util-bar-bg { width:100%; height:4px; background:#f0f0ed; border-radius:2px; overflow:hidden; }
//     .util-bar { height:100%; border-radius:2px; transition:width .4s ease; }

//     /* ── Charts column ── */
//     #charts-row {
//         display: flex; flex-direction: column;
//         gap: 14px; min-width: 0; margin-top: 23px;
//     }
//     .pie-card {
//         background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
//         padding: 14px 16px; box-sizing: border-box;
//         display: grid;
//         grid-template-columns: 220px 1fr;
//         grid-template-rows: auto 1fr;
//         column-gap: 16px; align-items: start;
//         overflow: visible; position: relative;
//     }
//     .pie-title {
//         grid-column: 1 / -1;
//         font-size: 11px; font-weight: 700; color: #444;
//         text-transform: uppercase; letter-spacing: .6px;
//         margin-bottom: 10px;
//     }
//     .pie-canvas-wrap {
//         width: 220px; height: 220px;
//         position: relative; overflow: visible;
//     }
//     .pie-canvas-wrap canvas {
//         width: 220px !important;
//         height: 220px !important;
//     }
//     .pie-legend {
//         display: flex; flex-direction: column;
//         gap: 5px; align-self: center; min-width: 0;
//     }
//     .pie-legend-item {
//         display: grid;
//         grid-template-columns: 10px 1fr auto;
//         align-items: center; gap: 5px;
//         font-size: 11px; color: #555; min-width: 0;
//     }
//     .pie-legend-dot { width:10px; height:10px; border-radius:2px; flex-shrink:0; }
//     .pie-legend-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
//     .pie-legend-pct { font-weight:700; color:#222; white-space:nowrap; padding-left:4px; min-width:36px; text-align:right; }

//     /* ── Loader ── */
//     #global-loader.loader-overlay {
//         position:fixed; inset:0; width:100vw; height:100vh;
//         background:rgba(18,18,18,.92); backdrop-filter:blur(6px);
//         z-index:999999; display:none; align-items:center; justify-content:center;
//     }
//     #global-loader.loader-overlay.active { display:flex; }
//     .loader-box { display:flex; flex-direction:column; align-items:center; gap:14px; }
//     .loader-logo {
//         width:90px; height:90px; border-radius:50%;
//         background:linear-gradient(145deg,#fff,#eaeaea); padding:14px;
//         object-fit:contain; box-shadow:0 10px 30px rgba(0,0,0,.35);
//         animation:pulse 1.6s infinite ease-in-out;
//     }
//     .loader-text { font-size:14px; color:#fff; font-weight:600; opacity:.85; }
//     @keyframes pulse { 0%,100%{transform:scale(1);opacity:.8;} 50%{transform:scale(1.08);opacity:1;} }

//     .custom-filter-row { padding:15px 20px; background:#fff; border-radius:6px; margin-top:10px; }
//     .custom-filter-row.row { margin-left:0; margin-right:0; }
//     .custom-select-all-btn { margin-right:8px; }

//     /* ── Responsive ── */
//     @media(max-width:1280px) {
//         #summary-area { grid-template-columns: 1fr 460px; }
//         .pie-canvas-wrap, .pie-canvas-wrap canvas { width:200px !important; height:200px !important; }
//         .pie-card { grid-template-columns: 200px 1fr; }
//     }
//     @media(max-width:1024px) {
//         #summary-area { grid-template-columns: 1fr; }
//         #charts-row { flex-direction: row; }
//         .pie-card { grid-template-columns: 180px 1fr; }
//         .pie-canvas-wrap, .pie-canvas-wrap canvas { width:180px !important; height:180px !important; }
//     }
//     @media(max-width:768px) {
//         #tables-container { margin:6px; padding:6px; }
//         #controls-row { flex-direction:column; align-items:stretch; }
//         #global-search-box { max-width:100%; width:100%; }
//         #summary-area { grid-template-columns: 1fr; }
//         #charts-row { flex-direction: column; }
//         .card-row-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
//         .card-row-grid.sub-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
//         .pie-card { grid-template-columns: 1fr; }
//         .pie-canvas-wrap { width:100%; height:200px; }
//         .pie-canvas-wrap canvas { width:100% !important; height:200px !important; }
//         .custom-filter-row { padding:10px; }
//         .custom-filter-row .col-md-4 { width:100%; margin-bottom:8px; }
//         table.university-table { font-size:11px; }
//         table.university-table th, table.university-table td { padding:5px 6px; }
//     }
//     @media(max-width:480px) {
//         .card-row-grid, .card-row-grid.sub-grid { grid-template-columns: 1fr !important; }
//         #export-excel-btn { width:100%; }
//     }
//     </style>`).appendTo('head');

//     if (!$("#global-loader").length) {
//         $("body").append(`
//             <div id="global-loader" class="loader-overlay">
//                 <div class="loader-box">
//                     <img src="/files/APF logo.png" class="loader-logo" alt="Loading">
//                     <div class="loader-text">Loading, please wait…</div>
//                 </div>
//             </div>
//         `);
//     }
//     const Loader = {
//         show(msg = "Loading, please wait…") { $("#global-loader").find(".loader-text").text(msg); $("#global-loader").addClass("active"); },
//         hide() { $("#global-loader").removeClass("active"); }
//     };

//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget vs Actuals Face Sheet',
//         single_column: true
//     });

//     function updatePageTitle(fy) {
//         page.set_title('Budget vs Actuals Face Sheet' + (fy ? ' – ' + fy : ''));
//     }

//     /* ── Filters ── */
//     let filter_section = $(`<div class="frappe-control-group row custom-filter-row"></div>`).appendTo(page.body);
//     const make_field = () => $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);

//     function mergeSelectedOptions(ctrl, new_opts) {
//         let selected = (ctrl.get_value() || []).map(String);
//         let map = {};
//         ((ctrl.df && ctrl.df.options) ? ctrl.df.options : []).forEach(o => { if (o?.value != null) map[String(o.value)] = o; });
//         new_opts.forEach(o => { if (o?.value != null) map[String(o.value)] = o; });
//         selected.forEach(v => { if (!map[v]) map[v] = { label:v, value:v, description:"" }; });
//         return Object.values(map);
//     }

//     function addSelectAllButton(ctrl, label) {
//         if (!ctrl?.$input) return;
//         ctrl.$input.on("focus", function () {
//             setTimeout(function () {
//                 let $dd = $('.multiselect-dropdown:visible').last();
//                 if (!$dd.length) return;
//                 let $act = $dd.find('.multiselect-actions');
//                 if (!$act.length) return;
//                 $act.find('.custom-select-all-btn').remove();
//                 let $btn = $(`<button type="button" class="btn btn-xs btn-default custom-select-all-btn">Select All</button>`);
//                 $btn.on("click", function (e) {
//                     e.stopPropagation(); e.preventDefault();
//                     function apply(data) { let vals = data.map(d => String(d.value ?? d)); if (vals.length) ctrl.set_value(vals); }
//                     if (ctrl.get_data) {
//                         let r = ctrl.get_data();
//                         r && typeof r.then === "function" ? r.then(apply).catch(err => console.error(label, err)) : Array.isArray(r) && apply(r);
//                     } else if (Array.isArray(ctrl.df?.options)) {
//                         apply(ctrl.df.options.map(o => typeof o === "object" ? o : { value:o }));
//                     }
//                 });
//                 $act.prepend($btn);
//             }, 120);
//         });
//     }

//     /* ── Financial Year ── */
//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Financial Year", fieldtype:"Select", fieldname:"financial_year", reqd:1,
//             change() { let y = this.get_value(); if (y) updatePageTitle(y); }
//         }, render_input:true
//     });
//     fiscal_year_filter.refresh();
//     frappe.call({
//         method: "annual_budget.api.filter_options.get_financial_year_list",
//         callback(r) {
//             if (!r.message?.length) return;
//             let years = r.message.map(d => d.financial_year);
//             fiscal_year_filter.df.options = years.join("\n"); fiscal_year_filter.refresh();
//             let now = new Date(), m = now.getMonth()+1, y = now.getFullYear();
//             let fy = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             let def = years.includes(fy) ? fy : years[0];
//             fiscal_year_filter.set_value(def); updatePageTitle(def);
//         }
//     });

//     /* ── YTD Month ── */
//     let month_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"YTD Month", fieldtype:"Select", fieldname:"month", reqd:1,
//             options:["January","February","March","April","May","June","July","August","September","October","November","December"].join("\n")
//         }, render_input:true
//     });
//     month_filter.set_value(new Date().toLocaleString('default', { month:'long' }));

//     /* ── Operating Units (theme) — defined BEFORE unit_filter so it can reference later controls ── */
//     // We use a placeholder first, then wire up the change handler after all filters exist.
//     let theme_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: {
//             label: "Operating Units",
//             fieldtype: "MultiSelectList",
//             fieldname: "theme",
//             get_data() {
//                 return frappe.call({
//                     method: "annual_budget.api.filter_options.get_theme"
//                 }).then(r =>
//                     (r.message || []).map(d => ({
//                         label: d.number_card_title,
//                         value: d.name,
//                         description: ""
//                     }))
//                 );
//             }
//         },
//         render_input: true
//     });
//     addSelectAllButton(theme_filter, "Operating Units");

//     /* ── Unit ── */
//     let unit_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Unit", fieldtype:"MultiSelectList", fieldname:"unit", reqd:1,
//             get_data() {
//                 return frappe.call({
//                     method: "annual_budget.api.filter_options.get_units"
//                 }).then(r => (r.message?.data||[]).filter(d=>d.value).map(d => ({
//                     label: d.label, value: String(d.value), description: ""
//                 })));
//             },
//             change() {
//                 let units = (unit_filter.get_value()||[]).map(String);
//                 cost_center_filter.set_value([]); location_code_filter.set_value([]);
//                 cost_center_filter.df.options = []; cost_center_filter.refresh();
//                 location_code_filter.df.options = []; location_code_filter.refresh();
//                 if (units.length) { loadCostCenters(units); loadLocationCodes(units); }
//             }
//         }, render_input:true
//     });
//     addSelectAllButton(unit_filter, "Unit");

//     /* ── Cost Center ── */
//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Cost Center", fieldtype:"MultiSelectList", fieldname:"cost_center", options:[] },
//         render_input:true
//     });
//     addSelectAllButton(cost_center_filter, "Cost Center");

//     /* ── Location Code ── */
//     let location_code_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:"Location Code", fieldtype:"MultiSelectList", fieldname:"location_code", options:[] },
//         render_input:true
//     });
//     addSelectAllButton(location_code_filter, "Location Code");

//     /* ── Helper: force-set a MultiSelectList with known options+values ──
//        Frappe's set_value() on MultiSelectList only works when awesomplete
//        has already seen the options. We bypass that by writing directly to
//        ctrl.value and then re-rendering the pills.                         */
//     function setMultiSelectWithOptions(ctrl, opts) {
//         // opts = [{ label, value, description?, ...extra }]
//         // Store full option objects on df.options so getKey() can read
//         // custom fields (erp_cost_center_value, erp_loc_value) later.
//         ctrl.df.options = opts.map(o => ({ ...o, value: String(o.value) }));

//         // Write selected values directly into the control's internal store
//         ctrl.value = opts.map(o => String(o.value));

//         // Rebuild the displayed pills
//         ctrl.refresh();

//         // Frappe renders pills from ctrl.value inside render_input flow;
//         // trigger it explicitly by calling set_value with the same array,
//         // but now df.options is already populated so the lookup succeeds.
//         try {
//             ctrl.set_value(opts.map(o => String(o.value)));
//         } catch(e) {
//             // fallback: manually paint pills if set_value throws
//             if (ctrl.$input) {
//                 let $wrap = ctrl.$input.closest('.form-group').find('.multiselect-list');
//                 if (!$wrap.length) $wrap = ctrl.$input.parent().find('.multiselect-list');
//                 $wrap.empty();
//                 opts.forEach(o => {
//                     $wrap.append(`
//                         <span class="btn btn-default btn-xs" style="margin:2px 3px;padding:2px 8px;">
//                             ${frappe.utils.escape_html(o.label || o.value)}
//                             <span class="remove" data-value="${frappe.utils.escape_html(String(o.value))}"
//                                   style="margin-left:5px;cursor:pointer;">×</span>
//                         </span>
//                     `);
//                 });
//             }
//         }
//     }

//     /* ── Wire up theme change AFTER all filters are declared ── */
//     theme_filter.df.change = function() {
//         let selected_themes = (theme_filter.get_value() || []);

//         // If nothing selected, clear dependent filters
//         if (!selected_themes.length) {
//             unit_filter.set_value([]);
//             cost_center_filter.df.options = []; cost_center_filter.set_value([]); cost_center_filter.refresh();
//             location_code_filter.df.options = []; location_code_filter.set_value([]); location_code_filter.refresh();
//             return;
//         }

//         Loader.show("Loading Operating Unit filters…");

//         // Fetch mappings for every selected theme in parallel
//         let promises = selected_themes.map(theme_name =>
//             frappe.call({
//                 method: "annual_budget.api.filter_options.get_theme_mappings",
//                 args: { theme_name }
//             }).then(r => r.message || {})
//         );

//         Promise.all(promises).then(results => {
//             let allUnits = [], allCCs = [], allLCs = [];

//             results.forEach(res => {
//                 allUnits.push(...(res.units || []));
//                 allCCs.push(...(res.cost_centers || []));
//                 allLCs.push(...(res.location_codes || []));
//             });

//             // Deduplicate by value
//             const dedupe = arr => {
//                 let seen = new Set();
//                 return arr.filter(o => {
//                     if (seen.has(String(o.value))) return false;
//                     seen.add(String(o.value)); return true;
//                 });
//             };

//             allUnits = dedupe(allUnits);
//             allCCs   = dedupe(allCCs);
//             allLCs   = dedupe(allLCs);

//             // ── 1. Unit filter ───────────────────────────────────────
//             // Suppress the cascade (unit.change loads CC/LC from server)
//             // since we're setting CC/LC ourselves from the theme mapping.
//             let _origUnitChange = unit_filter.df.change;
//             unit_filter.df.change = null;

//             setMultiSelectWithOptions(unit_filter, allUnits.map(u => ({
//                 label: u.label, value: String(u.value), description: ""
//             })));

//             // Restore after a tick so any pending Frappe events settle
//             setTimeout(() => { unit_filter.df.change = _origUnitChange; }, 0);

//             // ── 2. Cost Center filter ────────────────────────────────
//             // Keep erp_cost_center_value on the option so getKey() works
//             setMultiSelectWithOptions(cost_center_filter, allCCs.map(c => ({
//                 label: c.label,
//                 value: String(c.value),
//                 description: "",
//                 erp_cost_center_value: String(c.erp_cost_center_value || "")
//             })));

//             // ── 3. Location Code filter ──────────────────────────────
//             setMultiSelectWithOptions(location_code_filter, allLCs.map(l => ({
//                 label: l.label,
//                 value: String(l.value),
//                 description: "",
//                 erp_loc_value: String(l.erp_loc_value || "")
//             })));

//         }).catch(err => {
//             console.error("Theme mapping error:", err);
//             frappe.msgprint({ title:"Error", message:"Failed to load Operating Unit mappings.", indicator:"red" });
//         }).finally(() => Loader.hide());
//     };

//     /* ── Get Report button ── */
//     let load_button = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: { label:" ", fieldtype:"Button", fieldname:"load_button", click() { loadData(); } },
//         render_input:true
//     });
//     load_button.$wrapper.find('button').addClass("btn-primary").text("Get Report");
//     load_button.$wrapper.css("margin-top", "26px");

//     frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");

//     /* ── Container — report-content hidden until data loads ── */
//     const $container = $(`
//         <div id="tables-container">
//             <div id="report-content" style="display:none;">
//                 <div id="summary-area">
//                     <div class="cards-col" id="cards-area"></div>
//                     <div id="charts-row">
//                         <div class="pie-card">
//                             <div class="pie-title">Budget Breakdown</div>
//                             <div class="pie-canvas-wrap"><canvas id="budget-pie"></canvas></div>
//                             <div class="pie-legend" id="budget-legend"></div>
//                         </div>
//                         <div class="pie-card">
//                             <div class="pie-title">Actuals Breakdown</div>
//                             <div class="pie-canvas-wrap"><canvas id="actuals-pie"></canvas></div>
//                             <div class="pie-legend" id="actuals-legend"></div>
//                         </div>
//                     </div>
//                 </div>
//                 <div id="controls-row">
//                     <input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item…">
//                     <div id="controls-right">
//                         <label id="expand-all-wrapper">
//                             <input type="checkbox" id="expand-all-checkbox"> Expand All
//                         </label>
//                         <button id="export-excel-btn">↓ Export to Excel</button>
//                     </div>
//                 </div>
//                 <div class="scroll-wrapper">
//                     <table class="university-table" id="phase-table"></table>
//                 </div>
//             </div>
//         </div>
//     `);
//     $(page.body).append($container);

//     /* ── State ── */
//     let expense_heads = [], expandedHeads = [], expandedSubHeads = [], searchText = "";

//     const PALETTE = [
//         '#0076B6','#f58020','#2ecc71','#9b59b6',
//         '#e74c3c','#1abc9c','#e67e22','#2980b9',
//         '#8e44ad','#27ae60','#c0392b','#16a085'
//     ];
//     const headColor = i => PALETTE[i % PALETTE.length];

//     function utilColor(u) {
//         if (u > 100) return '#c0392b';
//         if (u >= 60)  return '#e07c3a';
//         return '#27ae60';
//     }

//     const fmt  = n => Math.round(Number(n)||0).toLocaleString('en-IN', { maximumFractionDigits:0 });
//     const rnd  = n => Math.round(Number(n)||0);
//     const pct  = (b, a) => { b = rnd(b); a = rnd(a); return b ? Math.round((a/b)*100) : 0; };
//     const mtch = (...v) => v.some(x => String(x||'').toLowerCase().includes(searchText.toLowerCase()));

//     function getKey(ctrl, key) {
//         let sel = (ctrl.get_value()||[]).map(String);
//         let opts = Array.isArray(ctrl.df?.options) ? ctrl.df.options : [];
//         return sel.map(v => { let o = opts.find(o => o && String(o.value)===v); return o?.[key]||null; }).filter(Boolean);
//     }

//     /* ── Table / search events ── */
//     $container.find('#global-search-box').on('input', function () {
//         searchText = $(this).val().trim();
//         if (searchText) {
//             expandedHeads    = expense_heads.map(h => h.name);
//             expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads||[]).map(s => h.name+"__"+s.name));
//         } else {
//             expandedHeads = []; expandedSubHeads = [];
//             $('#expand-all-checkbox').prop('checked', false);
//         }
//         renderTable();
//     });

//     $(document).on('change', '#expand-all-checkbox', function () {
//         if ($(this).is(':checked')) {
//             expandedHeads    = expense_heads.map(h => h.name);
//             expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads||[]).map(s => h.name+"__"+s.name));
//         } else { expandedHeads = []; expandedSubHeads = []; }
//         renderTable();
//     });

//     $(document).on('click', '#export-excel-btn', exportToExcel);

//     function exportToExcel() {
//         if (typeof XLSX === "undefined") { frappe.msgprint("Excel library not loaded yet."); return; }
//         let data = [["Expense Items","Budget","Actuals","Util %","Variance"]];
//         let gB = 0, gA = 0;
//         expense_heads.forEach(h => {
//             let hB = rnd(h.ytd), hA = rnd(h.total_posted_amt_ytd);
//             gB += hB; gA += hA;
//             data.push([h.name, hB, hA, pct(hB,hA)+"%", hB-hA]);
//             (h.sub_heads||[]).forEach(s => {
//                 let sB = rnd(s.ytd), sA = rnd(s.total_posted_amt_ytd);
//                 data.push(["   "+s.name, sB, sA, pct(sB,sA)+"%", sB-sA]);
//                 (s.items||[]).forEach(i => { let b=rnd(i.ytd),a=rnd(i.total_posted_amt); data.push(["      "+i.name,b,a,pct(b,a)+"%",b-a]); });
//             });
//             (h.items||[]).forEach(i => { let b=rnd(i.ytd),a=rnd(i.total_posted_amt); data.push(["   "+i.name,b,a,pct(b,a)+"%",b-a]); });
//         });
//         data.push(["GRAND TOTAL", gB, gA, pct(gB,gA)+"%", gB-gA]);
//         let ws = XLSX.utils.aoa_to_sheet(data);
//         ws["!cols"] = [{wch:40},{wch:15},{wch:15},{wch:10},{wch:15}];
//         let wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
//         XLSX.writeFile(wb, "Expense_Report.xlsx");
//     }

//     /* ── Dependent filter loaders ── */
//     function loadCostCenters(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 let opts = (r.message?.data||[]).filter(d=>d.value).map(d => ({
//                     label: d.label, value: String(d.value), description: "",
//                     erp_cost_center_value: String(d.erp_cost_center_value||"")
//                 }));
//                 cost_center_filter.df.options = mergeSelectedOptions(cost_center_filter, opts);
//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     function loadLocationCodes(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 let opts = (r.message?.data||[]).filter(d=>d.value).map(d => ({
//                     label: d.label, value: String(d.value), description: "",
//                     erp_loc_value: String(d.erp_loc_value||"")
//                 }));
//                 location_code_filter.df.options = mergeSelectedOptions(location_code_filter, opts);
//                 location_code_filter.refresh();
//             }
//         });
//     }

//     /* ── Load report data ── */
//     function loadData() {
//         let fy   = fiscal_year_filter.get_value();
//         let mon  = month_filter.get_value();
//         let unit = (unit_filter.get_value()||[]).join(",") || null;
//         let missing = [];
//         if (!fy)   missing.push("Financial Year");
//         if (!mon)  missing.push("Month");
//         if (!unit) missing.push("Unit");
//         if (missing.length) {
//             frappe.msgprint({ title:"Required Filters", message:"Please select: "+missing.join(", "), indicator:"orange" });
//             return;
//         }

//         Loader.show("We're crafting your report with care…");
//         $('#expand-all-checkbox').prop('checked', false);
//         $('#global-search-box').val("");
//         expandedHeads = []; expandedSubHeads = []; searchText = "";

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_combined_actuals",
//             args: {
//                 financial_year: fy,
//                 month: mon,
//                 unit,
//                 cost_center:           (getKey(cost_center_filter,"value")||[]).join(",") || null,
//                 location_code:         (getKey(location_code_filter,"value")||[]).join(",") || null,
//                 erp_cost_center_value: (getKey(cost_center_filter,"erp_cost_center_value")||[]).join(",") || null,
//                 erp_loc_value:         (getKey(location_code_filter,"erp_loc_value")||[]).join(",") || null
//             }
//         })
//         .done(r => {
//             expense_heads = Array.isArray(r.message) ? r.message : (r.message?.message || []);
//             $('#report-content').show();
//             renderCards(expense_heads);
//             renderTable();
//         })
//         .fail(() => frappe.msgprint({ title:"Error", message:"Failed to load data.", indicator:"red" }))
//         .always(() => Loader.hide());
//     }

//     /* ── Build number card ── */
//     function buildCard(name, budget, actual, color, isSub) {
//         let u  = pct(budget, actual);
//         let bw = Math.min(u, 100);
//         let uc = utilColor(u);
//         let cls = isSub ? 'number-card sub' : 'number-card';
//         return $(`
//             <div class="${cls}" style="border-left-color:${color};">
//                 <div class="number-title" title="${frappe.utils.escape_html(name)}">${frappe.utils.escape_html(name)}</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${fmt(budget)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${fmt(actual)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${fmt(budget - actual)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value" style="color:${uc};">${u}%</div>
//                     </div>
//                 </div>
//                 <div class="util-bar-wrap">
//                     <div class="util-bar-bg">
//                         <div class="util-bar" style="width:${bw}%; background:${uc};"></div>
//                     </div>
//                 </div>
//             </div>
//         `);
//     }

//     /* ── Pie charts ── */
//     let _budgetPie = null, _actualsPie = null;

//     function renderPieCharts(data) {
//         function draw() {
//             const BUDGET_COLORS = [
//                 '#4361EE','#3A0CA3','#7209B7','#F72585',
//                 '#4CC9F0','#4895EF','#560BAD','#B5179E',
//                 '#3F37C9','#480CA8','#6A0572','#D62828'
//             ];
//             const ACTUAL_COLORS = [
//                 '#2D6A4F','#40916C','#52B788','#74C69D',
//                 '#F4A261','#E76F51','#E9C46A','#264653',
//                 '#2A9D8F','#8AB17D','#BABB74','#E07A5F'
//             ];

//             let labels = [], budgets = [], actuals = [];
//             (data||[]).forEach(h => {
//                 let validSubs = (h.sub_heads||[]).filter(s => rnd(s.ytd) !== 0 || rnd(s.total_posted_amt_ytd) !== 0);
//                 if (validSubs.length) {
//                     validSubs.forEach(s => { labels.push(s.name); budgets.push(rnd(s.ytd)); actuals.push(rnd(s.total_posted_amt_ytd)); });
//                 } else {
//                     labels.push(h.name); budgets.push(rnd(h.ytd)); actuals.push(rnd(h.total_posted_amt_ytd));
//                 }
//             });

//             const budgetColors = labels.map((_, i) => BUDGET_COLORS[i % BUDGET_COLORS.length]);
//             const actualColors = labels.map((_, i) => ACTUAL_COLORS[i % ACTUAL_COLORS.length]);

//             const pctPlugin = {
//                 id: 'pctLabels',
//                 afterDatasetDraw(chart) {
//                     let { ctx, data } = chart;
//                     let ds = data.datasets[0];
//                     let total = ds.data.reduce((a,b)=>a+b,0);
//                     if (!total) return;
//                     let meta = chart.getDatasetMeta(0);
//                     ctx.save();
//                     meta.data.forEach((arc, i) => {
//                         let p = Math.round((ds.data[i]/total)*100);
//                         if (p < 4) return;
//                         let { x, y } = arc.tooltipPosition();
//                         ctx.fillStyle = '#fff';
//                         ctx.font = 'bold 11px sans-serif';
//                         ctx.textAlign = 'center';
//                         ctx.textBaseline = 'middle';
//                         ctx.fillText(p + '%', x, y);
//                     });
//                     ctx.restore();
//                 }
//             };

//             function buildLegend(id, values, colors) {
//                 let total = values.reduce((a,b)=>a+b,0);
//                 let $leg = $('#' + id).empty();
//                 labels.forEach((lbl, i) => {
//                     let p = total ? Math.round((values[i]/total)*100) : 0;
//                     $leg.append(`
//                         <div class="pie-legend-item">
//                             <div class="pie-legend-dot" style="background:${colors[i]};"></div>
//                             <span class="pie-legend-name" title="${frappe.utils.escape_html(lbl)}">${frappe.utils.escape_html(lbl)}</span>
//                             <span class="pie-legend-pct">${p}%</span>
//                         </div>
//                     `);
//                 });
//             }

//             function makePie(canvasId, values, colors, existing) {
//                 if (existing) existing.destroy();
//                 let ctx = document.getElementById(canvasId)?.getContext('2d');
//                 if (!ctx) return null;
//                 return new Chart(ctx, {
//                     type: 'doughnut',
//                     data: { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: '#fff', borderWidth: 2, hoverOffset: 10 }] },
//                     options: {
//                         responsive: false,
//                         cutout: '50%',
//                         animation: { animateRotate: true, duration: 600 },
//                         layout: { padding: 10 },
//                         plugins: {
//                             legend: { display: false },
//                             tooltip: {
//                                 enabled: true,
//                                 mode: 'nearest',
//                                 intersect: true,
//                                 position: 'average',
//                                 callbacks: {
//                                     title(items) { return items[0]?.label || ''; },
//                                     label(ctx) {
//                                         let total = ctx.dataset.data.reduce((a,b)=>a+b,0);
//                                         let p = total ? Math.round((ctx.parsed/total)*100) : 0;
//                                         return ` ₹${ctx.parsed.toLocaleString('en-IN')}  (${p}%)`;
//                                     }
//                                 }
//                             }
//                         }
//                     },
//                     plugins: [pctPlugin]
//                 });
//             }

//             _budgetPie  = makePie('budget-pie',  budgets, budgetColors, _budgetPie);
//             _actualsPie = makePie('actuals-pie', actuals, actualColors, _actualsPie);
//             buildLegend('budget-legend',  budgets, budgetColors);
//             buildLegend('actuals-legend', actuals, actualColors);
//         }

//         if (window.Chart) { draw(); return; }
//         let s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         s.onload = draw;
//         document.head.appendChild(s);
//     }

//     /* ── Render cards ── */
//     function renderCards(data) {
//         let $area = $('#cards-area');
//         $area.empty();
//         if (!data?.length) return;

//         let gB = 0, gA = 0;
//         data.forEach(h => { gB += rnd(h.ytd); gA += rnd(h.total_posted_amt_ytd); });

//         let gU  = pct(gB, gA);
//         let gBw = Math.min(gU, 100);
//         let gUc = utilColor(gU);

//         $area.append(`<div class="cards-section-label">Grand Total</div>`);
//         $area.append(`
//             <div class="grand-total-summary-card">
//                 <div class="number-title">Grand Total</div>
//                 <div class="kpi-row">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Budget</div>
//                         <div class="kpi-value">${fmt(gB)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Actual</div>
//                         <div class="kpi-value">${fmt(gA)}</div>
//                     </div>
//                 </div>
//                 <div class="kpi-bottom">
//                     <div class="kpi-block">
//                         <div class="kpi-label">Variance</div>
//                         <div class="kpi-value">${fmt(gB - gA)}</div>
//                     </div>
//                     <div class="kpi-block">
//                         <div class="kpi-label">Util %</div>
//                         <div class="kpi-value" style="color:${gUc};">${gU}%</div>
//                     </div>
//                 </div>
//                 <div class="util-bar-wrap">
//                     <div class="util-bar-bg">
//                         <div class="util-bar" style="width:${gBw}%; background:${gUc};"></div>
//                     </div>
//                 </div>
//             </div>
//         `);

//         let mainHeads = data.filter(h => rnd(h.ytd) !== 0);
//         if (!mainHeads.length) {
//             requestAnimationFrame(() => requestAnimationFrame(() => renderPieCharts(data)));
//             return;
//         }

//         $area.append(`<div class="cards-section-label">Expense Heads</div>`);
//         let $mainGrid = $('<div class="card-row-grid"></div>');
//         mainHeads.forEach((h, i) => {
//             $mainGrid.append(buildCard(h.name, rnd(h.ytd), rnd(h.total_posted_amt_ytd), headColor(i), false));
//         });
//         $area.append($mainGrid);

//         mainHeads.forEach((h, i) => {
//             let color     = headColor(i);
//             let validSubs = (h.sub_heads||[]).filter(s => rnd(s.ytd) !== 0);
//             if (!validSubs.length) return;
//             $area.append(`
//                 <div class="cards-section-label" style="color:${color};">
//                     <span style="opacity:.45; color:#888;">Sub Heads —</span>
//                     ${frappe.utils.escape_html(h.name)}
//                 </div>
//             `);
//             let $subGrid = $('<div class="card-row-grid sub-grid"></div>');
//             validSubs.forEach(s => {
//                 $subGrid.append(buildCard(s.name, rnd(s.ytd), rnd(s.total_posted_amt_ytd), color, true));
//             });
//             $area.append($subGrid);
//         });

//         requestAnimationFrame(() => requestAnimationFrame(() => renderPieCharts(data)));
//     }

//     /* ── Render table ── */
//     function renderTable() {
//         let $table = $('#phase-table');
//         $table.html('');

//         if (!expense_heads?.length) {
//             $table.append(`<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No Data Found</td></tr>`);
//             return;
//         }

//         $table.append(`
//             <thead>
//                 <tr class="main-row">
//                     <th>Expense Head</th><th>Budget</th><th>Actuals</th><th>Util %</th><th>Variance</th>
//                 </tr>
//             </thead>
//         `);

//         let $tbody = $('<tbody></tbody>');
//         let gB = 0, gA = 0;

//         expense_heads.forEach(head => {
//             if (searchText &&
//                 !mtch(head.name) &&
//                 !(head.items||[]).some(i => mtch(i.name)) &&
//                 !(head.sub_heads||[]).some(s => mtch(s.name) || (s.items||[]).some(i => mtch(i.name)))
//             ) return;

//             let hB = rnd(head.ytd), hA = rnd(head.total_posted_amt_ytd);
//             gB += hB; gA += hA;
//             let exp  = expandedHeads.includes(head.name);
//             let hasC = head.items?.length || head.sub_heads?.length;

//             $tbody.append(`
//                 <tr class="expense-head" data-head="${frappe.utils.escape_html(head.name)}">
//                     <td>${hasC ? (exp?'▼ ':'▶ ') : ''}${frappe.utils.escape_html(head.name)}</td>
//                     <td>${fmt(hB)}</td><td>${fmt(hA)}</td>
//                     <td class="text-blue">${pct(hB,hA)}%</td>
//                     <td class="text-blue">${fmt(hB-hA)}</td>
//                 </tr>
//             `);

//             if (exp) {
//                 (head.items||[]).forEach(item => {
//                     if (searchText && !mtch(item.name)) return;
//                     let b = rnd(item.ytd), a = rnd(item.total_posted_amt);
//                     $tbody.append(`<tr class="line-item"><td>${frappe.utils.escape_html(item.name)}</td><td>${fmt(b)}</td><td>${fmt(a)}</td><td>${pct(b,a)}%</td><td>${fmt(b-a)}</td></tr>`);
//                 });
//                 (head.sub_heads||[]).forEach(sub => {
//                     let key  = head.name+"__"+sub.name;
//                     let sB   = rnd(sub.ytd), sA = rnd(sub.total_posted_amt_ytd);
//                     let sExp = expandedSubHeads.includes(key);
//                     $tbody.append(`
//                         <tr class="sub-head" data-sub="${frappe.utils.escape_html(key)}">
//                             <td>${sub.items?.length ? (sExp?'▼ ':'▶ ') : ''}${frappe.utils.escape_html(sub.name)}</td>
//                             <td>${fmt(sB)}</td><td>${fmt(sA)}</td>
//                             <td class="text-blue">${pct(sB,sA)}%</td>
//                             <td class="text-blue">${fmt(sB-sA)}</td>
//                         </tr>
//                     `);
//                     if (sExp) {
//                         (sub.items||[]).forEach(item => {
//                             let b = rnd(item.ytd), a = rnd(item.total_posted_amt);
//                             $tbody.append(`<tr class="line-item"><td style="padding-left:55px">${frappe.utils.escape_html(item.name)}</td><td>${fmt(b)}</td><td>${fmt(a)}</td><td>${pct(b,a)}%</td><td>${fmt(b-a)}</td></tr>`);
//                         });
//                     }
//                 });
//             }
//         });

//         $tbody.append(`
//             <tr class="grand-total-row">
//                 <td>GRAND TOTAL</td><td>${fmt(gB)}</td><td>${fmt(gA)}</td>
//                 <td>${pct(gB,gA)}%</td><td>${fmt(gB-gA)}</td>
//             </tr>
//         `);
//         $table.append($tbody);

//         let allH = expense_heads.map(h=>h.name);
//         let allS = expense_heads.flatMap(h=>(h.sub_heads||[]).map(s=>h.name+"__"+s.name));
//         $('#expand-all-checkbox').prop('checked',
//             allH.length > 0 &&
//             allH.every(n=>expandedHeads.includes(n)) &&
//             allS.every(k=>expandedSubHeads.includes(k))
//         );

//         $tbody.on('click','.expense-head', function () {
//             let n = $(this).data('head');
//             expandedHeads.includes(n) ? expandedHeads=expandedHeads.filter(x=>x!==n) : expandedHeads.push(n);
//             renderTable();
//         });
//         $tbody.on('click','.sub-head', function () {
//             let k = $(this).data('sub');
//             expandedSubHeads.includes(k) ? expandedSubHeads=expandedSubHeads.filter(x=>x!==k) : expandedSubHeads.push(k);
//             renderTable();
//         });
//     }
// };














frappe.pages['budget-actuals-phase'].on_page_load = function(wrapper) {

    $(`<style>
    #tables-container {
        margin: 20px;
        background: #fff;
        border-radius: 8px;
        padding: 8px;
    }
    #controls-row {
        display: flex; flex-wrap: wrap;
        justify-content: space-between; align-items: center;
        gap: 8px; margin-bottom: 12px; padding: 8px 10px;
        background: #f7f9fb; border: 1px solid #dcdcdc; border-radius: 6px;
    }
    #global-search-box {
        flex: 1 1 200px; min-width: 0; max-width: 320px;
        padding: 7px 12px; border: 1px solid #aaa;
        border-radius: 6px; font-size: 13px; box-sizing: border-box;
    }
    #controls-right { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
    #expand-all-wrapper {
        display: flex; align-items: center; gap: 7px;
        font-size: 13px; font-weight: 600; color: #444;
        cursor: pointer; user-select: none; white-space: nowrap;
    }
    #expand-all-checkbox { width:16px; height:16px; accent-color:#0076B6; cursor:pointer; }
    #export-excel-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 14px; font-size: 13px; font-weight: 600;
        color: #fff !important; background: #0076B6;
        border: 1px solid #0076B6; border-radius: 6px;
        cursor: pointer; white-space: nowrap; line-height: 1.5;
        box-shadow: 0 1px 3px rgba(0,0,0,.12); text-decoration: none;
        transition: background .15s ease;
    }
    #export-excel-btn:hover { background:#005f94; border-color:#005f94; }

    .scroll-wrapper {
        border: 1px solid #ccc; border-radius: 6px;
        overflow-x: auto; overflow-y: auto; max-height: 70vh;
        background: #fff; -webkit-overflow-scrolling: touch;
    }
    table.university-table { min-width: 600px; width: 100%; border-collapse: collapse; font-size: 13px; }
    table.university-table th, table.university-table td {
        border: 1px solid #ddd; padding: 8px 10px;
        white-space: nowrap; vertical-align: middle;
        text-align: center; background: #fff !important;
    }
    table.university-table th:first-child,
    table.university-table td:first-child { text-align:left !important; white-space:normal; word-break:break-word; }
    table.university-table thead tr.main-row th {
        background: #0076B6 !important; color: #fff !important;
        position: sticky; top: 0; z-index: 25;
    }
    tr.expense-head { font-weight:700; cursor:pointer; }
    tr.expense-head:hover td { background:#F4F9FD !important; }
    tr.sub-head { background:#FFF3E6 !important; font-weight:600; cursor:pointer; }
    tr.sub-head:hover td { background:#FFEAD5 !important; }
    tr.line-item td:first-child { padding-left:35px !important; }
    tr.sub-head td:first-child { padding-left:20px !important; }
    .text-blue { color:#0076B6; font-weight:600; }
    tr.grand-total-row td { background:#003B63 !important; color:#fff !important; font-weight:700 !important; }

    #summary-area {
        display: grid;
        grid-template-columns: 1fr 500px;
        gap: 0 20px;
        align-items: start;
        margin-bottom: 18px;
    }
    #cards-area { min-width: 0; }
    .cards-section-label {
        font-size: 11px; font-weight: 700; letter-spacing: .8px;
        text-transform: uppercase; color: #888;
        margin: 14px 0 7px; padding-left: 2px;
    }
    .cards-section-label:first-child { margin-top: 0; }
    .grand-total-summary-card {
        border: 1px solid #e0e0e0; border-left: 4px solid #0076B6;
        border-radius: 8px; padding: 12px 14px; background: #fff;
        box-sizing: border-box; min-width: 0; overflow: hidden;
        word-break: break-word; transition: box-shadow .15s ease;
        display: flex; flex-direction: column; margin-bottom: 14px;
    }
    .grand-total-summary-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.08); }
    .grand-total-summary-card .number-title {
        font-size: 11px; font-weight: 600; color: #555;
        text-transform: uppercase; letter-spacing: .5px;
        margin-bottom: 8px; min-height: 16px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .card-row-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 10px; margin-bottom: 12px; width: 100%; box-sizing: border-box;
    }
    .card-row-grid.sub-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 8px;
    }
    .number-card {
        border: 1px solid #e0e0e0; border-left: 3px solid #ccc;
        border-radius: 8px; padding: 12px 14px; background: #fff;
        box-sizing: border-box; min-width: 0; overflow: hidden;
        word-break: break-word; transition: box-shadow .15s ease;
        display: flex; flex-direction: column;
    }
    .number-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.08); }
    .number-card.sub {
        background: #fafafa; border-color: #ebebeb;
        border-left-width: 3px; border-radius: 7px; padding: 10px 12px;
        display: flex; flex-direction: column;
    }
    .number-title {
        font-size: 11px; font-weight: 600; color: #555;
        text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-height: 16px;
    }
    .number-card.sub .number-title { font-size: 10px; color: #777; }
    .kpi-row { display: flex; justify-content: space-between; margin-top: 4px; }
    .kpi-block { text-align: left; }
    .kpi-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: .4px; }
    .kpi-value { font-size: 14px; font-weight: 700; color: #111; }
    .number-card.sub .kpi-value { font-size: 13px; }
    .kpi-bottom {
        display: flex; justify-content: space-between;
        margin-top: 8px; padding-top: 7px; border-top: 1px solid #f0f0f0;
    }
    .util-bar-wrap { margin-top: auto; padding-top: 8px; border-top: 1px solid #f0f0f0; }
    .util-bar-bg { width:100%; height:4px; background:#f0f0ed; border-radius:2px; overflow:hidden; }
    .util-bar { height:100%; border-radius:2px; transition:width .4s ease; }

    #charts-row {
        display: flex; flex-direction: column; gap: 14px; min-width: 0; margin-top: 23px;
    }
    .pie-card {
        background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
        padding: 14px 16px; box-sizing: border-box; display: grid;
        grid-template-columns: 220px 1fr; grid-template-rows: auto 1fr;
        column-gap: 16px; align-items: start; overflow: visible; position: relative;
    }
    .pie-title {
        grid-column: 1 / -1; font-size: 11px; font-weight: 700; color: #444;
        text-transform: uppercase; letter-spacing: .6px; margin-bottom: 10px;
    }
    .pie-canvas-wrap { width: 220px; height: 220px; position: relative; overflow: visible; }
    .pie-canvas-wrap canvas { width: 220px !important; height: 220px !important; }
    .pie-legend { display: flex; flex-direction: column; gap: 5px; align-self: center; min-width: 0; }
    .pie-legend-item {
        display: grid; grid-template-columns: 10px 1fr auto;
        align-items: center; gap: 5px; font-size: 11px; color: #555; min-width: 0;
    }
    .pie-legend-dot { width:10px; height:10px; border-radius:2px; flex-shrink:0; }
    .pie-legend-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
    .pie-legend-pct { font-weight:700; color:#222; white-space:nowrap; padding-left:4px; min-width:36px; text-align:right; }

    #global-loader.loader-overlay {
        position:fixed; inset:0; width:100vw; height:100vh;
        background:rgba(18,18,18,.92); backdrop-filter:blur(6px);
        z-index:999999; display:none; align-items:center; justify-content:center;
    }
    #global-loader.loader-overlay.active { display:flex; }
    .loader-box { display:flex; flex-direction:column; align-items:center; gap:14px; }
    .loader-logo {
        width:90px; height:90px; border-radius:50%;
        background:linear-gradient(145deg,#fff,#eaeaea); padding:14px;
        object-fit:contain; box-shadow:0 10px 30px rgba(0,0,0,.35);
        animation:pulse 1.6s infinite ease-in-out;
    }
    .loader-text { font-size:14px; color:#fff; font-weight:600; opacity:.85; }
    @keyframes pulse { 0%,100%{transform:scale(1);opacity:.8;} 50%{transform:scale(1.08);opacity:1;} }

    .custom-filter-row { padding:15px 20px; background:#fff; border-radius:6px; margin-top:10px; }
    .custom-filter-row.row { margin-left:0; margin-right:0; }
    .custom-select-all-btn { margin-right:8px; }

    @media(max-width:1280px) {
        #summary-area { grid-template-columns: 1fr 460px; }
        .pie-canvas-wrap, .pie-canvas-wrap canvas { width:200px !important; height:200px !important; }
        .pie-card { grid-template-columns: 200px 1fr; }
    }
    @media(max-width:1024px) {
        #summary-area { grid-template-columns: 1fr; }
        #charts-row { flex-direction: row; }
        .pie-card { grid-template-columns: 180px 1fr; }
        .pie-canvas-wrap, .pie-canvas-wrap canvas { width:180px !important; height:180px !important; }
    }
    @media(max-width:768px) {
        #tables-container { margin:6px; padding:6px; }
        #controls-row { flex-direction:column; align-items:stretch; }
        #global-search-box { max-width:100%; width:100%; }
        #summary-area { grid-template-columns: 1fr; }
        #charts-row { flex-direction: column; }
        .card-row-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        .card-row-grid.sub-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        .pie-card { grid-template-columns: 1fr; }
        .pie-canvas-wrap { width:100%; height:200px; }
        .pie-canvas-wrap canvas { width:100% !important; height:200px !important; }
        .custom-filter-row { padding:10px; }
        .custom-filter-row .col-md-4 { width:100%; margin-bottom:8px; }
        table.university-table { font-size:11px; }
        table.university-table th, table.university-table td { padding:5px 6px; }
    }
    @media(max-width:480px) {
        .card-row-grid, .card-row-grid.sub-grid { grid-template-columns: 1fr !important; }
        #export-excel-btn { width:100%; }
    }
    </style>`).appendTo('head');

    if (!$("#global-loader").length) {
        $("body").append(`
            <div id="global-loader" class="loader-overlay">
                <div class="loader-box">
                    <img src="/files/APF logo.png" class="loader-logo" alt="Loading">
                    <div class="loader-text">Loading, please wait…</div>
                </div>
            </div>
        `);
    }
    const Loader = {
        show(msg = "Loading, please wait…") {
            $("#global-loader").find(".loader-text").text(msg);
            $("#global-loader").addClass("active");
        },
        hide() { $("#global-loader").removeClass("active"); }
    };

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Budget vs Actuals Face Sheet',
        single_column: true
    });

    function updatePageTitle(fy) {
        page.set_title('Budget vs Actuals Face Sheet' + (fy ? ' – ' + fy : ''));
    }

    /* ═══════════════════════════════════════════════════════════════════════
       KEY FIX: Separate label↔value lookup maps per filter.
       Frappe MultiSelectList uses the `value` field as both the stored key
       AND the displayed pill text. To show labels in pills, we set
       value = label (human-readable), then use these maps to resolve back
       to real IDs / ERP codes when calling the API.
    ═══════════════════════════════════════════════════════════════════════ */

    // Maps: label → { realValue, erp_cost_center_value?, erp_loc_value? }
    let _unitLabelToMeta       = {};   // label → { value }
    let _costCenterLabelToMeta = {};   // label → { value, erp_cost_center_value }
    let _locationLabelToMeta   = {};   // label → { value, erp_loc_value }
    let _themeLabelToMeta      = {};   // label → { value }

    /* ── Filters ── */
    let filter_section = $(`<div class="frappe-control-group row custom-filter-row"></div>`).appendTo(page.body);
    const make_field = () => $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);

    function addSelectAllButton(ctrl, label) {
        if (!ctrl?.$input) return;
        ctrl.$input.on("focus", function () {
            setTimeout(function () {
                let $dd = $('.multiselect-dropdown:visible').last();
                if (!$dd.length) return;
                let $act = $dd.find('.multiselect-actions');
                if (!$act.length) return;
                $act.find('.custom-select-all-btn').remove();
                let $btn = $(`<button type="button" class="btn btn-xs btn-default custom-select-all-btn">Select All</button>`);
                $btn.on("click", function (e) {
                    e.stopPropagation(); e.preventDefault();
                    function apply(data) {
                        let vals = data.map(d => String(d.value ?? d));
                        if (vals.length) ctrl.set_value(vals);
                    }
                    if (ctrl.get_data) {
                        let r = ctrl.get_data();
                        r && typeof r.then === "function"
                            ? r.then(apply).catch(err => console.error(label, err))
                            : Array.isArray(r) && apply(r);
                    } else if (Array.isArray(ctrl.df?.options)) {
                        apply(ctrl.df.options.map(o => typeof o === "object" ? o : { value: o }));
                    }
                });
                $act.prepend($btn);
            }, 120);
        });
    }

    /* ── Financial Year ── */
    let fiscal_year_filter = frappe.ui.form.make_control({
        parent: make_field(),
        df: {
            label: "Financial Year", fieldtype: "Select",
            fieldname: "financial_year", reqd: 1,
            change() { let y = this.get_value(); if (y) updatePageTitle(y); }
        },
        render_input: true
    });
    fiscal_year_filter.refresh();
    frappe.call({
        method: "annual_budget.api.filter_options.get_financial_year_list",
        callback(r) {
            if (!r.message?.length) return;
            let years = r.message.map(d => d.financial_year);
            fiscal_year_filter.df.options = years.join("\n");
            fiscal_year_filter.refresh();
            let now = new Date(), m = now.getMonth() + 1, y = now.getFullYear();
            let fy = m >= 4 ? `${y}-${String(y + 1).slice(-2)}` : `${y - 1}-${String(y).slice(-2)}`;
            let def = years.includes(fy) ? fy : years[0];
            fiscal_year_filter.set_value(def);
            updatePageTitle(def);
        }
    });

    /* ── YTD Month ── */
    let month_filter = frappe.ui.form.make_control({
        parent: make_field(),
        df: {
            label: "YTD Month", fieldtype: "Select",
            fieldname: "month", reqd: 1,
            options: ["January","February","March","April","May","June",
                      "July","August","September","October","November","December"].join("\n")
        },
        render_input: true
    });
    month_filter.set_value(new Date().toLocaleString('default', { month: 'long' }));

    /* ── Operating Units (theme) ──
       get_data returns { label, value } where value = label (display key).
       _themeLabelToMeta maps label → real doc name.                        */
    let theme_filter = frappe.ui.form.make_control({
        parent: make_field(),
        df: {
            label: "Operating Units",
            fieldtype: "MultiSelectList",
            fieldname: "theme",
            get_data() {
                return frappe.call({
                    method: "annual_budget.api.filter_options.get_theme"
                }).then(r => {
                    _themeLabelToMeta = {};
                    return (r.message || []).map(d => {
                        let displayLabel = d.number_card_title;
                        _themeLabelToMeta[displayLabel] = { value: d.name };
                        // value = label so the pill shows the human-readable title
                        return { label: displayLabel, value: displayLabel, description: "" };
                    });
                });
            }
        },
        render_input: true
    });
    addSelectAllButton(theme_filter, "Operating Units");

    /* ── Unit ──
       get_data returns label as pill text; real unit name stored in map.   */
    let unit_filter = frappe.ui.form.make_control({
        parent: make_field(),
        df: {
            label: "Unit", fieldtype: "MultiSelectList",
            fieldname: "unit", reqd: 1,
            get_data() {
                return frappe.call({
                    method: "annual_budget.api.filter_options.get_units"
                }).then(r => {
                    _unitLabelToMeta = {};
                    return (r.message?.data || [])
                        .filter(d => d.value)
                        .map(d => {
                            let displayLabel = d.label; // e.g. "U001 - Description"
                            _unitLabelToMeta[displayLabel] = { value: String(d.value) };
                            return { label: displayLabel, value: displayLabel, description: "" };
                        });
                });
            },
            change() {
                // Resolve selected labels back to real unit IDs
                let selectedLabels = (unit_filter.get_value() || []);
                let unitIds = selectedLabels
                    .map(lbl => _unitLabelToMeta[lbl]?.value)
                    .filter(Boolean);

                cost_center_filter.set_value([]);
                location_code_filter.set_value([]);
                cost_center_filter.refresh();
                location_code_filter.refresh();

                if (unitIds.length) {
                    loadCostCenters(unitIds);
                    loadLocationCodes(unitIds);
                }
            }
        },
        render_input: true
    });
    addSelectAllButton(unit_filter, "Unit");

    /* ── Cost Center ── */
    let cost_center_filter = frappe.ui.form.make_control({
        parent: make_field(),
        df: {
            label: "Cost Center", fieldtype: "MultiSelectList",
            fieldname: "cost_center", options: []
        },
        render_input: true
    });
    addSelectAllButton(cost_center_filter, "Cost Center");

    /* ── Location Code ── */
    let location_code_filter = frappe.ui.form.make_control({
        parent: make_field(),
        df: {
            label: "Location Code", fieldtype: "MultiSelectList",
            fieldname: "location_code", options: []
        },
        render_input: true
    });
    addSelectAllButton(location_code_filter, "Location Code");

    /* ═══════════════════════════════════════════════════════════════════════
       setMultiSelectWithOptions
       ─────────────────────────────────────────────────────────────────────
       Sets a MultiSelectList so pills show the human-readable label.
       opts must be: [{ label, value (real ID), erp_cost_center_value?, erp_loc_value? }]
       We store label→meta in the supplied mapObj, then present value=label
       to Frappe so the pill text is readable.
    ═══════════════════════════════════════════════════════════════════════ */
    function setMultiSelectWithOptions(ctrl, opts, mapObj, extraKeys) {
        // extraKeys: array of additional field names to copy into meta (e.g. ['erp_cost_center_value'])
        extraKeys = extraKeys || [];

        // Build the label→meta lookup
        opts.forEach(o => {
            let meta = { value: String(o.value) };
            extraKeys.forEach(k => { meta[k] = o[k] || ""; });
            mapObj[o.label] = meta;
        });

        // Build Frappe-compatible option list: value = label (pill display)
        let frappe_opts = opts.map(o => ({
            label: o.label,
            value: o.label,      // ← pill will show this
            description: ""
        }));

        // Populate df.options so set_value can find the items
        ctrl.df.options = frappe_opts;
        ctrl.refresh();

        // Select all of them
        let display_values = frappe_opts.map(o => o.value);
        try {
            ctrl.set_value(display_values);
        } catch (e) {
            // Manual pill fallback
            ctrl.value = display_values;
            ctrl.refresh();
        }
    }

    /* ── Wire up theme change AFTER all filters are declared ── */
    theme_filter.df.change = function () {
        let selectedThemeLabels = (theme_filter.get_value() || []);

        if (!selectedThemeLabels.length) {
            unit_filter.set_value([]);
            _unitLabelToMeta = {};
            cost_center_filter.df.options = [];
            cost_center_filter.set_value([]);
            cost_center_filter.refresh();
            _costCenterLabelToMeta = {};
            location_code_filter.df.options = [];
            location_code_filter.set_value([]);
            location_code_filter.refresh();
            _locationLabelToMeta = {};
            return;
        }

        // Resolve display labels → real theme doc names
        let realThemeNames = selectedThemeLabels
            .map(lbl => _themeLabelToMeta[lbl]?.value || lbl)
            .filter(Boolean);

        Loader.show("Loading Operating Unit filters…");

        let promises = realThemeNames.map(theme_name =>
            frappe.call({
                method: "annual_budget.api.filter_options.get_theme_mappings",
                args: { theme_name }
            }).then(r => r.message || {})
        );

        Promise.all(promises).then(results => {
            let allUnits = [], allCCs = [], allLCs = [];

            results.forEach(res => {
                allUnits.push(...(res.units || []));
                allCCs.push(...(res.cost_centers || []));
                allLCs.push(...(res.location_codes || []));
            });

            // Deduplicate by real value
            const dedupe = arr => {
                let seen = new Set();
                return arr.filter(o => {
                    let k = String(o.value);
                    if (seen.has(k)) return false;
                    seen.add(k); return true;
                });
            };
            allUnits = dedupe(allUnits);
            allCCs   = dedupe(allCCs);
            allLCs   = dedupe(allLCs);

            // Suppress unit cascade while we set everything at once
            let _origUnitChange = unit_filter.df.change;
            unit_filter.df.change = null;

            _unitLabelToMeta       = {};
            _costCenterLabelToMeta = {};
            _locationLabelToMeta   = {};

            // Units: label from API is already "UNIT - Description"
            setMultiSelectWithOptions(
                unit_filter,
                allUnits.map(u => ({ label: u.label, value: u.value })),
                _unitLabelToMeta,
                []
            );

            // Cost Centers
            setMultiSelectWithOptions(
                cost_center_filter,
                allCCs.map(c => ({
                    label: c.label,
                    value: c.value,
                    erp_cost_center_value: c.erp_cost_center_value || ""
                })),
                _costCenterLabelToMeta,
                ['erp_cost_center_value']
            );

            // Location Codes
            setMultiSelectWithOptions(
                location_code_filter,
                allLCs.map(l => ({
                    label: l.label,
                    value: l.value,
                    erp_loc_value: l.erp_loc_value || ""
                })),
                _locationLabelToMeta,
                ['erp_loc_value']
            );

            setTimeout(() => { unit_filter.df.change = _origUnitChange; }, 0);

        }).catch(err => {
            console.error("Theme mapping error:", err);
            frappe.msgprint({ title: "Error", message: "Failed to load Operating Unit mappings.", indicator: "red" });
        }).finally(() => Loader.hide());
    };

    /* ── Get Report button ── */
    let load_button = frappe.ui.form.make_control({
        parent: make_field(),
        df: { label: " ", fieldtype: "Button", fieldname: "load_button", click() { loadData(); } },
        render_input: true
    });
    load_button.$wrapper.find('button').addClass("btn-primary").text("Get Report");
    load_button.$wrapper.css("margin-top", "26px");

    frappe.require("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");

    /* ── Container ── */
    const $container = $(`
        <div id="tables-container">
            <div id="report-content" style="display:none;">
                <div id="summary-area">
                    <div class="cards-col" id="cards-area"></div>
                    <div id="charts-row">
                        <div class="pie-card">
                            <div class="pie-title">Budget Breakdown</div>
                            <div class="pie-canvas-wrap"><canvas id="budget-pie"></canvas></div>
                            <div class="pie-legend" id="budget-legend"></div>
                        </div>
                        <div class="pie-card">
                            <div class="pie-title">Actuals Breakdown</div>
                            <div class="pie-canvas-wrap"><canvas id="actuals-pie"></canvas></div>
                            <div class="pie-legend" id="actuals-legend"></div>
                        </div>
                    </div>
                </div>
                <div id="controls-row">
                    <input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item…">
                    <div id="controls-right">
                        <label id="expand-all-wrapper">
                            <input type="checkbox" id="expand-all-checkbox"> Expand All
                        </label>
                        <button id="export-excel-btn">↓ Export to Excel</button>
                    </div>
                </div>
                <div class="scroll-wrapper">
                    <table class="university-table" id="phase-table"></table>
                </div>
            </div>
        </div>
    `);
    $(page.body).append($container);

    /* ── State ── */
    let expense_heads = [], expandedHeads = [], expandedSubHeads = [], searchText = "";

    const PALETTE = [
        '#0076B6','#f58020','#2ecc71','#9b59b6',
        '#e74c3c','#1abc9c','#e67e22','#2980b9',
        '#8e44ad','#27ae60','#c0392b','#16a085'
    ];
    const headColor = i => PALETTE[i % PALETTE.length];

    function utilColor(u) {
        if (u > 100) return '#c0392b';
        if (u >= 60)  return '#e07c3a';
        return '#27ae60';
    }

    const fmt  = n => Math.round(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    const rnd  = n => Math.round(Number(n) || 0);
    const pct  = (b, a) => { b = rnd(b); a = rnd(a); return b ? Math.round((a / b) * 100) : 0; };
    const mtch = (...v) => v.some(x => String(x || '').toLowerCase().includes(searchText.toLowerCase()));

    /* ═══════════════════════════════════════════════════════════════════════
       resolveFilterValues
       ─────────────────────────────────────────────────────────────────────
       Given a MultiSelectList control and its label→meta map, returns an
       object with arrays of real values and any extra ERP fields needed
       for the API call.  The selected "values" in the control are actually
       labels (because we set value=label for display), so we look them up
       in the map to get the real IDs.
    ═══════════════════════════════════════════════════════════════════════ */
    function resolveFilterValues(ctrl, mapObj, extraKeys) {
        extraKeys = extraKeys || [];
        let selectedLabels = (ctrl.get_value() || []);
        let realValues = [];
        let extras = {};
        extraKeys.forEach(k => { extras[k] = []; });

        selectedLabels.forEach(lbl => {
            let meta = mapObj[lbl];
            if (meta) {
                realValues.push(meta.value);
                extraKeys.forEach(k => { if (meta[k]) extras[k].push(meta[k]); });
            }
        });
        return { values: realValues, ...extras };
    }

    /* ── Events ── */
    $container.find('#global-search-box').on('input', function () {
        searchText = $(this).val().trim();
        if (searchText) {
            expandedHeads    = expense_heads.map(h => h.name);
            expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads || []).map(s => h.name + "__" + s.name));
        } else {
            expandedHeads = []; expandedSubHeads = [];
            $('#expand-all-checkbox').prop('checked', false);
        }
        renderTable();
    });

    $(document).on('change', '#expand-all-checkbox', function () {
        if ($(this).is(':checked')) {
            expandedHeads    = expense_heads.map(h => h.name);
            expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads || []).map(s => h.name + "__" + s.name));
        } else { expandedHeads = []; expandedSubHeads = []; }
        renderTable();
    });

    $(document).on('click', '#export-excel-btn', exportToExcel);

    function exportToExcel() {
        if (typeof XLSX === "undefined") { frappe.msgprint("Excel library not loaded yet."); return; }
        let data = [["Expense Items", "Budget", "Actuals", "Util %", "Variance"]];
        let gB = 0, gA = 0;
        expense_heads.forEach(h => {
            let hB = rnd(h.ytd), hA = rnd(h.total_posted_amt_ytd);
            gB += hB; gA += hA;
            data.push([h.name, hB, hA, pct(hB, hA) + "%", hB - hA]);
            (h.sub_heads || []).forEach(s => {
                let sB = rnd(s.ytd), sA = rnd(s.total_posted_amt_ytd);
                data.push(["   " + s.name, sB, sA, pct(sB, sA) + "%", sB - sA]);
                (s.items || []).forEach(i => {
                    let b = rnd(i.ytd), a = rnd(i.total_posted_amt);
                    data.push(["      " + i.name, b, a, pct(b, a) + "%", b - a]);
                });
            });
            (h.items || []).forEach(i => {
                let b = rnd(i.ytd), a = rnd(i.total_posted_amt);
                data.push(["   " + i.name, b, a, pct(b, a) + "%", b - a]);
            });
        });
        data.push(["GRAND TOTAL", gB, gA, pct(gB, gA) + "%", gB - gA]);
        let ws = XLSX.utils.aoa_to_sheet(data);
        ws["!cols"] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
        XLSX.writeFile(wb, "Expense_Report.xlsx");
    }

    /* ── Dependent filter loaders (triggered by manual unit selection, not theme) ── */
    function loadCostCenters(unitIds) {
        frappe.call({
            method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
            args: { units: unitIds.join(",") },
            callback(r) {
                _costCenterLabelToMeta = {};
                let frappe_opts = [];
                (r.message?.data || []).filter(d => d.value).forEach(d => {
                    let lbl = d.label;
                    _costCenterLabelToMeta[lbl] = {
                        value: String(d.value),
                        erp_cost_center_value: String(d.erp_cost_center_value || "")
                    };
                    frappe_opts.push({ label: lbl, value: lbl, description: "" });
                });
                cost_center_filter.df.options = frappe_opts;
                cost_center_filter.refresh();
            }
        });
    }

    function loadLocationCodes(unitIds) {
        frappe.call({
            method: "annual_budget.api.filter_options.get_location_codes_by_unit",
            args: { unit: unitIds.join(",") },
            callback(r) {
                _locationLabelToMeta = {};
                let frappe_opts = [];
                (r.message?.data || []).filter(d => d.value).forEach(d => {
                    let lbl = d.label;
                    _locationLabelToMeta[lbl] = {
                        value: String(d.value),
                        erp_loc_value: String(d.erp_loc_value || "")
                    };
                    frappe_opts.push({ label: lbl, value: lbl, description: "" });
                });
                location_code_filter.df.options = frappe_opts;
                location_code_filter.refresh();
            }
        });
    }

    /* ── Load report data ── */
    function loadData() {
        let fy  = fiscal_year_filter.get_value();
        let mon = month_filter.get_value();

        // Resolve unit labels → real IDs
        let unitResolved = resolveFilterValues(unit_filter, _unitLabelToMeta, []);
        let unitIds      = unitResolved.values;

        let missing = [];
        if (!fy)             missing.push("Financial Year");
        if (!mon)            missing.push("Month");
        if (!unitIds.length) missing.push("Unit");
        if (missing.length) {
            frappe.msgprint({
                title: "Required Filters",
                message: "Please select: " + missing.join(", "),
                indicator: "orange"
            });
            return;
        }

        // Resolve cost center and location code labels → real IDs + ERP values
        let ccResolved  = resolveFilterValues(cost_center_filter, _costCenterLabelToMeta, ['erp_cost_center_value']);
        let locResolved = resolveFilterValues(location_code_filter, _locationLabelToMeta, ['erp_loc_value']);

        Loader.show("We're crafting your report with care…");
        $('#expand-all-checkbox').prop('checked', false);
        $('#global-search-box').val("");
        expandedHeads = []; expandedSubHeads = []; searchText = "";

        frappe.call({
            method: "annual_budget.api.phase_sheet.get_combined_actuals",
            args: {
                financial_year:        fy,
                month:                 mon,
                unit:                  unitIds.join(",") || null,
                cost_center:           ccResolved.values.join(",")                      || null,
                location_code:         locResolved.values.join(",")                     || null,
                erp_cost_center_value: (ccResolved.erp_cost_center_value || []).join(",") || null,
                erp_loc_value:         (locResolved.erp_loc_value        || []).join(",") || null
            }
        })
        .done(r => {
            expense_heads = Array.isArray(r.message) ? r.message : (r.message?.message || []);
            $('#report-content').show();
            renderCards(expense_heads);
            renderTable();
        })
        .fail(() => frappe.msgprint({ title: "Error", message: "Failed to load data.", indicator: "red" }))
        .always(() => Loader.hide());
    }

    /* ── Build number card ── */
    function buildCard(name, budget, actual, color, isSub) {
        let u  = pct(budget, actual);
        let bw = Math.min(u, 100);
        let uc = utilColor(u);
        let cls = isSub ? 'number-card sub' : 'number-card';
        return $(`
            <div class="${cls}" style="border-left-color:${color};">
                <div class="number-title" title="${frappe.utils.escape_html(name)}">${frappe.utils.escape_html(name)}</div>
                <div class="kpi-row">
                    <div class="kpi-block">
                        <div class="kpi-label">Budget</div>
                        <div class="kpi-value">${fmt(budget)}</div>
                    </div>
                    <div class="kpi-block">
                        <div class="kpi-label">Actual</div>
                        <div class="kpi-value">${fmt(actual)}</div>
                    </div>
                </div>
                <div class="kpi-bottom">
                    <div class="kpi-block">
                        <div class="kpi-label">Variance</div>
                        <div class="kpi-value">${fmt(budget - actual)}</div>
                    </div>
                    <div class="kpi-block">
                        <div class="kpi-label">Util %</div>
                        <div class="kpi-value" style="color:${uc};">${u}%</div>
                    </div>
                </div>
                <div class="util-bar-wrap">
                    <div class="util-bar-bg">
                        <div class="util-bar" style="width:${bw}%; background:${uc};"></div>
                    </div>
                </div>
            </div>
        `);
    }

    /* ── Pie charts ── */
    let _budgetPie = null, _actualsPie = null;

    function renderPieCharts(data) {
        function draw() {
            const BUDGET_COLORS = [
                '#4361EE','#3A0CA3','#7209B7','#F72585',
                '#4CC9F0','#4895EF','#560BAD','#B5179E',
                '#3F37C9','#480CA8','#6A0572','#D62828'
            ];
            const ACTUAL_COLORS = [
                '#2D6A4F','#40916C','#52B788','#74C69D',
                '#F4A261','#E76F51','#E9C46A','#264653',
                '#2A9D8F','#8AB17D','#BABB74','#E07A5F'
            ];

            let labels = [], budgets = [], actuals = [];
            (data || []).forEach(h => {
                let validSubs = (h.sub_heads || []).filter(s => rnd(s.ytd) !== 0 || rnd(s.total_posted_amt_ytd) !== 0);
                if (validSubs.length) {
                    validSubs.forEach(s => {
                        labels.push(s.name);
                        budgets.push(rnd(s.ytd));
                        actuals.push(rnd(s.total_posted_amt_ytd));
                    });
                } else {
                    labels.push(h.name);
                    budgets.push(rnd(h.ytd));
                    actuals.push(rnd(h.total_posted_amt_ytd));
                }
            });

            const budgetColors = labels.map((_, i) => BUDGET_COLORS[i % BUDGET_COLORS.length]);
            const actualColors = labels.map((_, i) => ACTUAL_COLORS[i % ACTUAL_COLORS.length]);

            const pctPlugin = {
                id: 'pctLabels',
                afterDatasetDraw(chart) {
                    let { ctx, data } = chart;
                    let ds = data.datasets[0];
                    let total = ds.data.reduce((a, b) => a + b, 0);
                    if (!total) return;
                    let meta = chart.getDatasetMeta(0);
                    ctx.save();
                    meta.data.forEach((arc, i) => {
                        let p = Math.round((ds.data[i] / total) * 100);
                        if (p < 4) return;
                        let { x, y } = arc.tooltipPosition();
                        ctx.fillStyle = '#fff';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(p + '%', x, y);
                    });
                    ctx.restore();
                }
            };

            function buildLegend(id, values, colors) {
                let total = values.reduce((a, b) => a + b, 0);
                let $leg = $('#' + id).empty();
                labels.forEach((lbl, i) => {
                    let p = total ? Math.round((values[i] / total) * 100) : 0;
                    $leg.append(`
                        <div class="pie-legend-item">
                            <div class="pie-legend-dot" style="background:${colors[i]};"></div>
                            <span class="pie-legend-name" title="${frappe.utils.escape_html(lbl)}">${frappe.utils.escape_html(lbl)}</span>
                            <span class="pie-legend-pct">${p}%</span>
                        </div>
                    `);
                });
            }

            function makePie(canvasId, values, colors, existing) {
                if (existing) existing.destroy();
                let ctx = document.getElementById(canvasId)?.getContext('2d');
                if (!ctx) return null;
                return new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels,
                        datasets: [{
                            data: values, backgroundColor: colors,
                            borderColor: '#fff', borderWidth: 2, hoverOffset: 10
                        }]
                    },
                    options: {
                        responsive: false,
                        cutout: '50%',
                        animation: { animateRotate: true, duration: 600 },
                        layout: { padding: 10 },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                enabled: true, mode: 'nearest',
                                intersect: true, position: 'average',
                                callbacks: {
                                    title(items) { return items[0]?.label || ''; },
                                    label(ctx) {
                                        let total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                        let p = total ? Math.round((ctx.parsed / total) * 100) : 0;
                                        return ` ₹${ctx.parsed.toLocaleString('en-IN')}  (${p}%)`;
                                    }
                                }
                            }
                        }
                    },
                    plugins: [pctPlugin]
                });
            }

            _budgetPie  = makePie('budget-pie',  budgets, budgetColors, _budgetPie);
            _actualsPie = makePie('actuals-pie', actuals, actualColors, _actualsPie);
            buildLegend('budget-legend',  budgets, budgetColors);
            buildLegend('actuals-legend', actuals, actualColors);
        }

        if (window.Chart) { draw(); return; }
        let s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
        s.onload = draw;
        document.head.appendChild(s);
    }

    /* ── Render cards ── */
    function renderCards(data) {
        let $area = $('#cards-area');
        $area.empty();
        if (!data?.length) return;

        let gB = 0, gA = 0;
        data.forEach(h => { gB += rnd(h.ytd); gA += rnd(h.total_posted_amt_ytd); });

        let gU  = pct(gB, gA);
        let gBw = Math.min(gU, 100);
        let gUc = utilColor(gU);

        $area.append(`<div class="cards-section-label">Grand Total</div>`);
        $area.append(`
            <div class="grand-total-summary-card">
                <div class="number-title">Grand Total</div>
                <div class="kpi-row">
                    <div class="kpi-block">
                        <div class="kpi-label">Budget</div>
                        <div class="kpi-value">${fmt(gB)}</div>
                    </div>
                    <div class="kpi-block">
                        <div class="kpi-label">Actual</div>
                        <div class="kpi-value">${fmt(gA)}</div>
                    </div>
                </div>
                <div class="kpi-bottom">
                    <div class="kpi-block">
                        <div class="kpi-label">Variance</div>
                        <div class="kpi-value">${fmt(gB - gA)}</div>
                    </div>
                    <div class="kpi-block">
                        <div class="kpi-label">Util %</div>
                        <div class="kpi-value" style="color:${gUc};">${gU}%</div>
                    </div>
                </div>
                <div class="util-bar-wrap">
                    <div class="util-bar-bg">
                        <div class="util-bar" style="width:${gBw}%; background:${gUc};"></div>
                    </div>
                </div>
            </div>
        `);

        let mainHeads = data.filter(h => rnd(h.ytd) !== 0);
        if (!mainHeads.length) {
            requestAnimationFrame(() => requestAnimationFrame(() => renderPieCharts(data)));
            return;
        }

        $area.append(`<div class="cards-section-label">Expense Heads</div>`);
        let $mainGrid = $('<div class="card-row-grid"></div>');
        mainHeads.forEach((h, i) => {
            $mainGrid.append(buildCard(h.name, rnd(h.ytd), rnd(h.total_posted_amt_ytd), headColor(i), false));
        });
        $area.append($mainGrid);

        mainHeads.forEach((h, i) => {
            let color     = headColor(i);
            let validSubs = (h.sub_heads || []).filter(s => rnd(s.ytd) !== 0);
            if (!validSubs.length) return;
            $area.append(`
                <div class="cards-section-label" style="color:${color};">
                    <span style="opacity:.45; color:#888;">Sub Heads —</span>
                    ${frappe.utils.escape_html(h.name)}
                </div>
            `);
            let $subGrid = $('<div class="card-row-grid sub-grid"></div>');
            validSubs.forEach(s => {
                $subGrid.append(buildCard(s.name, rnd(s.ytd), rnd(s.total_posted_amt_ytd), color, true));
            });
            $area.append($subGrid);
        });

        requestAnimationFrame(() => requestAnimationFrame(() => renderPieCharts(data)));
    }

    /* ── Render table ── */
    function renderTable() {
        let $table = $('#phase-table');
        $table.html('');

        if (!expense_heads?.length) {
            $table.append(`<tr><td colspan="5" style="text-align:center;padding:20px;color:#888;">No Data Found</td></tr>`);
            return;
        }

        $table.append(`
            <thead>
                <tr class="main-row">
                    <th>Expense Head</th><th>Budget</th><th>Actuals</th><th>Util %</th><th>Variance</th>
                </tr>
            </thead>
        `);

        let $tbody = $('<tbody></tbody>');
        let gB = 0, gA = 0;

        expense_heads.forEach(head => {
            if (searchText &&
                !mtch(head.name) &&
                !(head.items || []).some(i => mtch(i.name)) &&
                !(head.sub_heads || []).some(s => mtch(s.name) || (s.items || []).some(i => mtch(i.name)))
            ) return;

            let hB = rnd(head.ytd), hA = rnd(head.total_posted_amt_ytd);
            gB += hB; gA += hA;
            let exp  = expandedHeads.includes(head.name);
            let hasC = head.items?.length || head.sub_heads?.length;

            $tbody.append(`
                <tr class="expense-head" data-head="${frappe.utils.escape_html(head.name)}">
                    <td>${hasC ? (exp ? '▼ ' : '▶ ') : ''}${frappe.utils.escape_html(head.name)}</td>
                    <td>${fmt(hB)}</td><td>${fmt(hA)}</td>
                    <td class="text-blue">${pct(hB, hA)}%</td>
                    <td class="text-blue">${fmt(hB - hA)}</td>
                </tr>
            `);

            if (exp) {
                (head.items || []).forEach(item => {
                    if (searchText && !mtch(item.name)) return;
                    let b = rnd(item.ytd), a = rnd(item.total_posted_amt);
                    $tbody.append(`<tr class="line-item"><td>${frappe.utils.escape_html(item.name)}</td><td>${fmt(b)}</td><td>${fmt(a)}</td><td>${pct(b, a)}%</td><td>${fmt(b - a)}</td></tr>`);
                });
                (head.sub_heads || []).forEach(sub => {
                    let key  = head.name + "__" + sub.name;
                    let sB   = rnd(sub.ytd), sA = rnd(sub.total_posted_amt_ytd);
                    let sExp = expandedSubHeads.includes(key);
                    $tbody.append(`
                        <tr class="sub-head" data-sub="${frappe.utils.escape_html(key)}">
                            <td>${sub.items?.length ? (sExp ? '▼ ' : '▶ ') : ''}${frappe.utils.escape_html(sub.name)}</td>
                            <td>${fmt(sB)}</td><td>${fmt(sA)}</td>
                            <td class="text-blue">${pct(sB, sA)}%</td>
                            <td class="text-blue">${fmt(sB - sA)}</td>
                        </tr>
                    `);
                    if (sExp) {
                        (sub.items || []).forEach(item => {
                            let b = rnd(item.ytd), a = rnd(item.total_posted_amt);
                            $tbody.append(`<tr class="line-item"><td style="padding-left:55px">${frappe.utils.escape_html(item.name)}</td><td>${fmt(b)}</td><td>${fmt(a)}</td><td>${pct(b, a)}%</td><td>${fmt(b - a)}</td></tr>`);
                        });
                    }
                });
            }
        });

        $tbody.append(`
            <tr class="grand-total-row">
                <td>GRAND TOTAL</td><td>${fmt(gB)}</td><td>${fmt(gA)}</td>
                <td>${pct(gB, gA)}%</td><td>${fmt(gB - gA)}</td>
            </tr>
        `);
        $table.append($tbody);

        let allH = expense_heads.map(h => h.name);
        let allS = expense_heads.flatMap(h => (h.sub_heads || []).map(s => h.name + "__" + s.name));
        $('#expand-all-checkbox').prop('checked',
            allH.length > 0 &&
            allH.every(n => expandedHeads.includes(n)) &&
            allS.every(k => expandedSubHeads.includes(k))
        );

        $tbody.on('click', '.expense-head', function () {
            let n = $(this).data('head');
            expandedHeads.includes(n)
                ? expandedHeads = expandedHeads.filter(x => x !== n)
                : expandedHeads.push(n);
            renderTable();
        });
        $tbody.on('click', '.sub-head', function () {
            let k = $(this).data('sub');
            expandedSubHeads.includes(k)
                ? expandedSubHeads = expandedSubHeads.filter(x => x !== k)
                : expandedSubHeads.push(k);
            renderTable();
        });
    }
};