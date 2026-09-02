// frappe.pages['budget-phase-sheet'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Budget Phase Sheet',
// 		single_column: true
// 	});
// 	loadUnits();
// 	page.set_primary_action(__('Export CSV'), function () {
//         export_phase_sheet();
//     });
// 	function export_phase_sheet() {
//      let financial_year = fiscal_year_filter.get_value();
//      let units = unit_filter.get_value();
// 	 let cost_center = cost_center_filter.get_value();
// 	 let location_code = location_code_filter.get_value();
//     if (!financial_year || !units) {
//         frappe.msgprint(__('Please select Financial Year and Unit'));
//         return;
//     }

//     frappe.call({
//         method: "annual_budget.api.export_reports.export_phase_sheet_excel",
//         args: {
//             financial_year: financial_year,
//             units: units,
// 			cost_center:cost_center
//         },
//         freeze: true,
//         freeze_message: __("Preparing CSV file..."),
//         callback: function (r) {
//             if (r.message && r.message.file_url) {
//                 // Auto download
//                 window.open(r.message.file_url);
//                 frappe.msgprint({
//                     title: __("Success"),
//                     message: __("Exported successfully"),
//                     indicator: "green"
//                 });
//             }
//         }
//     });
// }

//     /* ------------------------------------------------
//        FILTER SECTION (Only this gets padding)
//     --------------------------------------------------*/
//     let filter_section = $(`
//         <div class="frappe-control-group row custom-filter-row"></div>
//     `).appendTo(page.body);

//     /* ------------------------------------------------
//        CSS (Only for Filter Area)
//     --------------------------------------------------*/
//     $(`<style>
//         /* Padding only for filter area */
//         .custom-filter-row {
//             padding: 15px 20px;
//             background: #fff;
//             border-radius: 6px;
//             margin-top: 10px;
//         }

//         /* Override default row margins only for filters */
//         .custom-filter-row.row {
//             margin-right: 0px;
//             margin-left: 0px;
//         }

//         /* Column spacing */
//         .custom-filter-row .col-md-4,
//         .custom-filter-row .col-sm-12 {
//             padding-left: 8px;
//             padding-right: 8px;
//         }

//         /* Mobile responsive */
//         @media (max-width: 768px) {
//             .custom-filter-row {
//                 padding: 12px;
//             }
//         }
//     </style>`).appendTo("head");


//     /* ------------------------------------------------
//        Helper for adding fields
//     --------------------------------------------------*/
//     function make_field() {
//         let col = $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);
//         return col;
//     }

//     /* ------------------------------------------------
//        Financial Year
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

//     /* ------------------------------------------------
//        Unit
//     --------------------------------------------------*/
//     // let unit_col = make_field();
//     // let unit_filter = frappe.ui.form.make_control({
//     //     parent: unit_col,
//     //     df: {
//     //         label: "Unit",
//     //         fieldtype: "Link",
//     //         fieldname: "unit",
//     //         options: "Unit",
//     //         default: "APU",
//     //         reqd: 1,
//     //         change() {
//     //             let unit = unit_filter.get_value();
//     //             loadData();
//     //             loadCostCenters(unit);
// 	// 			loadLocationCodes(unit);

//     //         }
//     //     },
//     //     render_input: true
//     // });

//     // /* ------------------------------------------------
//     //    Cost Center
//     // --------------------------------------------------*/
//     // let cc_col = make_field();
//     // let cost_center_filter = frappe.ui.form.make_control({
//     //     parent: cc_col,
//     //     df: {
//     //         label: "Cost Center",
//     //         fieldtype: "Select",
//     //         fieldname: "cost_center",
//     //         change() {
//     //             let cc = cost_center_filter.get_value();
//     //             console.log("Selected Cost Center:", cc);
// 	// 			loadData()
//     //         }
//     //     },
//     //     render_input: true
//     // });

// 	//    /* ---------------- Location Code ---------------- */
//     // let lc_col = make_field();
//     // let location_code_filter = frappe.ui.form.make_control({
//     //     parent: lc_col,
//     //     df: {
//     //         label: "Location Code",
//     //         fieldtype: "Select",
//     //         fieldname: "location_code",
//     //         change() {
//     //             console.log("Selected Location Code:", location_code_filter.get_value());
// 	// 			loadData();
//     //         }
//     //     },
//     //     render_input: true
//     // });
// 	/* ---------------- Unit (Multi, from API) ---------------- */
// let unit_col = make_field();
// let unit_filter = frappe.ui.form.make_control({
//     parent: unit_col,
//     df: {
//         label: "Unit",
//         fieldtype: "MultiSelectList",
//         fieldname: "unit",
//         reqd: 1,

//         get_data: function (txt) {
//             return frappe.call({
//                 method: "your_app.your_module.get_units"   // <-- change path
//             }).then(r => {
//                 let data = r.message.data || [];

//                 // MultiSelectList needs: {value, description}
//                 return data.map(d => {
//                     return {
//                         value: d.value,
//                         description: d.label
//                     };
//                 });
//             });
//         },

//         change() {
//             let units = unit_filter.get_value();   // array
//             console.log("Selected Units:", units);
//             loadData();
//             loadCostCenters(units);
//             loadLocationCodes(units);
//         }
//     },
//     render_input: true
// });


// /* ---------------- Cost Center (Multi) ---------------- */
// let cc_col = make_field();
// let cost_center_filter = frappe.ui.form.make_control({
//     parent: cc_col,
//     df: {
//         label: "Cost Center",
//         fieldtype: "MultiSelectList",
//         fieldname: "cost_center",

//         get_data: function (txt) {
//             // For now empty, you can wire API later
//             return [];
//         },

//         change() {
//             let cc = cost_center_filter.get_value();  // array
//             console.log("Selected Cost Centers:", cc);
//             loadData();
//         }
//     },
//     render_input: true
// });


// /* ---------------- Location Code (Multi) ---------------- */
// let lc_col = make_field();
// let location_code_filter = frappe.ui.form.make_control({
//     parent: lc_col,
//     df: {
//         label: "Location Code",
//         fieldtype: "MultiSelectList",
//         fieldname: "location_code",

//         get_data: function (txt) {
//             // For now empty, you can wire API later
//             return [];
//         },

//         change() {
//             let locations = location_code_filter.get_value(); // array
//             console.log("Selected Location Codes:", locations);
//             loadData();
//         }
//     },
//     render_input: true
// });

// function loadUnits() {
//     frappe.call({
//         method: "annual_budget.api.filter_options.get_units",
//         callback: function (r) {
//             if (r.message && r.message.data) {
//                 let options = r.message.data.map(d => ({
//                     value: d.value,
//                     description: d.label
//                 }));
//                 unit_filter.set_data(options);   // correct way for MultiSelectList
//             }
//         }
//     });
// }


// function loadCostCenters(units) {
//     frappe.call({
//         method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//         args: { units: units },
//         callback: function (r) {
//             if (r.message && r.message.data) {
//                 let options = r.message.data.map(d => ({
//                     label: d.label,
//                     value: d.value
//                 }));

//                 cost_center_filter.df.options = options;
//                 cost_center_filter.refresh();

//                 if (options.length > 0) {
//                     cost_center_filter.set_value(options[0].value);
//                 }
//             }
//         }
//     });
// }

//   /* ---------------- Load Location Codes ---------------- */
//     function loadLocationCodes(unit) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: unit },
//             callback: function (r) {
//                 if (r.message && r.message.data) {
//                     location_code_filter.df.options = r.message.data;
//                     location_code_filter.refresh();
//                     location_code_filter.set_value("");
//                 }
//             }
//         });
//     }


// // Load cost centers for default Unit when page loads
// frappe.after_ajax(() => {
//     let default_unit = unit_filter.get_value();
//     loadCostCenters(default_unit);
// 	loadLocationCodes(default_unit);

// });


// 	/* ---------- Styles ---------- */
// 	const style = `
// <style>

// 	#tables-container { 
// 		margin: 20px; 
// 		background-color: #ffffff; 
// 		border-radius: 8px; 
// 		padding: 8px; 
// 	}

// 	/* Controls Row */
// 	#controls-row {
// 		display: flex;
// 		justify-content: space-between;
// 		align-items: center;
// 		margin-bottom: 12px;
// 		padding: 6px 10px;
// 		background: #f7f9fb;
// 		border: 1px solid #dcdcdc;
// 		border-radius: 6px;
// 	}

// 	#global-search-box { 
// 		width: 280px; 
// 		padding: 7px 12px; 
// 		border: 1px solid #aaa; 
// 		border-radius: 6px; 
// 		font-size: 13px;
// 	}

// 	#checkbox-area {
// 		display: flex;
// 		align-items: center;
// 		gap: 18px;
// 		font-size: 13px;
// 		font-weight: 500;
// 		color: #333;
// 	}

// 	#checkbox-area input {
// 		transform: scale(1.15);
// 		cursor: pointer;
// 	}

// 	.scroll-wrapper { 
// 		border: 1px solid #ccc; 
// 		border-radius: 6px; 
// 		overflow-x: auto; 
// 		overflow-y: auto; 
// 		max-height: 70vh; 
// 		background: #fff; 
// 	}

// 	table.university-table { 
// 		min-width: 1200px; 
// 		width: 100%; 
// 		border-collapse: collapse; 
// 		font-size: 13px; 
// 		color: #111; 
// 		background:#fff; 
// 	}

// 	table.university-table th, 
// 	table.university-table td {
// 		border: 1px solid #ddd;
// 		padding: 8px 10px;
// 		white-space: nowrap;
// 		vertical-align: middle;
// 		text-align: center;
// 		background:#fff !important;
// 	}

// 	table.university-table th:first-child,
// 	table.university-table td:first-child { 
// 		text-align: left !important; 
// 	}

// 	table.university-table th:nth-child(2),
// 	table.university-table td:nth-child(2) { 
// 		text-align: left !important; 
// 	}

// 	/* Table Headers */
// 	table.university-table thead tr.main-row th { 
// 		background-color: #0076B6 !important; 
// 		color: #fff !important; 
// 		position: sticky; 
// 		top: 0; 
// 		z-index: 25; 
// 		cursor: pointer; 
// 	}

// 	table.university-table thead tr.sub-row th { 
// 		background-color: #F26B21 !important; 
// 		color: #fff !important; 
// 		position: sticky; 
// 		top: 34px; 
// 		z-index: 24; 
// 	}

// 	/* =========================
// 	   MAIN HEAD (no background)
// 	   ========================= */
// 	tr.expense-head { 
// 		font-weight: 700; 
// 		cursor: pointer; 
// 	}

// 	tr.expense-head td {
// 		background: #fff !important;
// 	}

// 	tr.expense-head:hover td {
// 		background: #F4F9FD !important;
// 	}

// 	/* =========================
// 	   SUB HEAD (single color)
// 	   ========================= */
// 	tr.sub-head { 
// 		background-color: #FFF3E6 !important;   /* light orange based on theme */
// 		font-weight: 600; 
// 		cursor: pointer; 
// 	}

// 	tr.sub-head td {
// 		background-color: #FFF3E6 !important;
// 	}

// 	tr.sub-head:hover td {
// 		background-color: #FFEAD5 !important;
// 	}

// 	/* Line Items */
// 	tr.line-item td:first-child { 
// 		padding-left: 35px !important; 
// 	}

// 	tr.sub-head td:first-child { 
// 		padding-left: 20px !important; 
// 	}

// 	/* Utility */
// 	.text-blue { 
// 		color: #0076B6; 
// 		font-weight: 600; 
// 	}

// 	td.gl-empty { 
// 		color: #aaa; 
// 		font-style: italic; 
// 	}

// 	/* Grand Total */
// 	tr.grand-total-row td {
// 		background:#003B63 !important;
// 		color:#fff !important;
// 		font-weight:700 !important;
// 		border-top: 2px solid #000 !important;
// 	}

// </style>


// 	`;

	
// $(style).appendTo(page.body);

// 	/* ---------- UI Container ---------- */
// 	const container = $(`
// 		<div id="tables-container">

// 			<div id="controls-row">
// 				<input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item / GL Code...">
// 				<div id="checkbox-area">
// 					<label><input type="checkbox" id="expand-quarters"> Expand Quarters</label>
// 					<label><input type="checkbox" id="expand-items"> Expand Line Items</label>
// 				</div>
// 			</div>

// 			<div class="scroll-wrapper">
// 				<table class="university-table" id="phase-table"></table>
// 			</div>

// 		</div>
// 	`);
// 	$(page.body).append(container);


// 	/* ---------- State ---------- */
// 	let expense_heads = [];
// 	let expandedHeads = [];
// 	let expandedSubHeads = [];
// 	let expandedQuarters = [];
// 	let searchText = "";


// 	/* Quarter Setup */
// 	const quarters = {
// 		q1: { label: 'Quarter 1', months: ['April', 'May', 'June'] },
// 		q2: { label: 'Quarter 2', months: ['July', 'August', 'September'] },
// 		q3: { label: 'Quarter 3', months: ['October', 'November', 'December'] },
// 		q4: { label: 'Quarter 4', months: ['January', 'February', 'March'] }
// 	};

// 	const formatNumber = n => (n || 0).toLocaleString();

// 	/* ---------- API LOAD ---------- */
// 	function loadData() {
// 		let fy = fiscal_year_filter.get_value();
// 		let unit = unit_filter.get_value();
// 		let cost_center = cost_center_filter.get_value();
// 		let location_code = location_code_filter.get_value();

// 		if (!fy || !unit) return;

// 		frappe.call({
// 			method: "annual_budget.api.phase_sheet.get_consolidated_report",
// 			args: { financial_year: fy, units: unit,cost_center:cost_center,location_code:location_code },
// 			callback: function(r) {
// 				expense_heads = r.message || [];
// 				renderTable();
// 			}
// 		});
// 	}


// 	/* ---------- SEARCH MATCH ---------- */
// 	function matchesSearch(...values) {
// 		return values.some(v => (String(v || "").toLowerCase()).includes(searchText.toLowerCase()));
// 	}


// 	/* ---------- GRAND TOTAL ---------- */
// 	function getGrandTotals() {
// 		const totals = { q1: [0,0,0], q2: [0,0,0], q3: [0,0,0], q4: [0,0,0], total: 0 };

// 		expense_heads.forEach(head => {
// 			['q1','q2','q3','q4'].forEach(q => {
// 				head[q].forEach((v, i) => {
// 					totals[q][i] += (v || 0);
// 					totals.total += (v || 0);
// 				});
// 			});
// 		});
// 		return totals;
// 	}


// 	/* ---------- RENDER TABLE ---------- */
// 	function renderTable() {
// 		const $table = $('#phase-table');
// 		$table.empty();

// 		const $thead = $('<thead></thead>');
// 		const $mainRow = $('<tr class="main-row"></tr>');
// 		$mainRow.append('<th rowspan="2">Expense Head / Line Item</th>');
// 		$mainRow.append('<th rowspan="2">GL Code</th>');

// 		['q1','q2','q3','q4'].forEach(q => {
// 			const isExpanded = expandedQuarters.includes(q);
// 			const arrow = isExpanded ? '▲' : '▼';
// 			const colspan = 3;
// 			const rowspan = isExpanded ? 1 : 2;

// 			$mainRow.append(`
// 				<th class="expandable" data-quarter="${q}" colspan="${colspan}" rowspan="${rowspan}">
// 					${quarters[q].label} ${arrow}
// 				</th>
// 			`);
// 		});

// 		$mainRow.append('<th rowspan="2">Total</th>');
// 		$thead.append($mainRow);

// 		if (expandedQuarters.length > 0) {
// 			const $subRow = $('<tr class="sub-row"></tr>');
// 			['q1','q2','q3','q4'].forEach(q => {
// 				if (expandedQuarters.includes(q)) quarters[q].months.forEach(m => $subRow.append(`<th>${m}</th>`));
// 			});
// 			$thead.append($subRow);
// 		}

// 		$table.append($thead);
// 		const $tbody = $('<tbody></tbody>');

// 		expense_heads.forEach(head => {

// 			const headContainsMatch =
// 				matchesSearch(head.name) ||
// 				(head.items || []).some(i => matchesSearch(i.name, i.gl_code)) ||
// 				(head.sub_heads || []).some(s =>
// 					matchesSearch(s.name) ||
// 					(s.items || []).some(i => matchesSearch(i.name, i.gl_code))
// 				);

// 			if (!headContainsMatch) return;

// 			const headTotal = ['q1','q2','q3','q4']
// 				.reduce((sum, q) => sum + head[q].reduce((a,b)=>a+b,0), 0);

// 			$tbody.append(`
// 				<tr class="expense-head" data-head="${head.name}">
// 					<td>${expandedHeads.includes(head.name) ? '▼' : '▶'} ${head.name}</td>
// 					<td class="gl-empty">-</td>
// 					${['q1','q2','q3','q4'].map(q =>
// 						expandedQuarters.includes(q)
// 							? head[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 							: `<td colspan="3">${formatNumber(head[q].reduce((a,b)=>a+b,0))}</td>`
// 					).join('')}
// 					<td class="text-blue">${formatNumber(headTotal)}</td>
// 				</tr>
// 			`);

// 			/* Line Items */
// 			if (expandedHeads.includes(head.name) && head.items && head.items.length) {
// 				head.items
// 				.filter(item => matchesSearch(item.name, item.gl_code))
// 				.forEach(item => {
// 					const total = ['q1','q2','q3','q4']
// 						.reduce((sum, q) => sum + item[q].reduce((a,b)=>a+b,0), 0);

// 					$tbody.append(`
// 						<tr class="line-item">
// 							<td>${item.name}</td>
// 							<td>${item.gl_code}</td>
// 							${['q1','q2','q3','q4'].map(q =>
// 								expandedQuarters.includes(q)
// 									? item[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 									: `<td colspan="3">${formatNumber(item[q].reduce((a,b)=>a+b,0))}</td>`
// 							).join('')}
// 							<td>${formatNumber(total)}</td>
// 						</tr>
// 					`);
// 				});
// 			}

// 			/* Sub-Heads */
// 			if (expandedHeads.includes(head.name) && head.sub_heads && head.sub_heads.length) {
// 				head.sub_heads
// 				.filter(sub =>
// 					matchesSearch(sub.name) ||
// 					(sub.items || []).some(i => matchesSearch(i.name, i.gl_code))
// 				)
// 				.forEach(sub => {

// 					const key = head.name + "__" + sub.name;

// 					const subTotal = ['q1','q2','q3','q4']
// 						.reduce((sum, q) => sum + sub[q].reduce((a,b)=>a+b,0), 0);

// 					$tbody.append(`
// 						<tr class="sub-head" data-sub="${key}">
// 							<td>${expandedSubHeads.includes(key) ? '▼' : '▶'} ${sub.name}</td>
// 							<td class="gl-empty">-</td>
// 							${['q1','q2','q3','q4'].map(q =>
// 								expandedQuarters.includes(q)
// 									? sub[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 									: `<td colspan="3">${formatNumber(sub[q].reduce((a,b)=>a+b,0))}</td>`
// 							).join('')}
// 							<td class="text-blue">${formatNumber(subTotal)}</td>
// 						</tr>
// 					`);

// 					if (expandedSubHeads.includes(key) && sub.items && sub.items.length) {
// 						sub.items
// 						.filter(item => matchesSearch(item.name, item.gl_code))
// 						.forEach(item => {
// 							const total = ['q1','q2','q3','q4']
// 								.reduce((sum, q) => sum + item[q].reduce((a,b)=>a+b,0), 0);

// 							$tbody.append(`
// 								<tr class="line-item">
// 									<td>${item.name}</td>
// 									<td>${item.gl_code}</td>
// 									${['q1','q2','q3','q4'].map(q =>
// 										expandedQuarters.includes(q)
// 											? item[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 											: `<td colspan="3">${formatNumber(item[q].reduce((a,b)=>a+b,0))}</td>`
// 									).join('')}
// 									<td>${formatNumber(total)}</td>
// 								</tr>
// 							`);
// 						});
// 					}
// 				});
// 			}
// 		});


// 		/* GRAND TOTAL */
// 		const grand = getGrandTotals();
// 		const $grandRow = $('<tr class="grand-total-row"></tr>');
// 		$grandRow.append(`<td colspan="2" style="text-align:left;">GRAND TOTAL</td>`);

// 		['q1','q2','q3','q4'].forEach(q => {
// 			if (expandedQuarters.includes(q)) {
// 				grand[q].forEach(v => $grandRow.append(`<td>${formatNumber(v)}</td>`));
// 			} else {
// 				$grandRow.append(`<td colspan="3">${formatNumber(grand[q].reduce((a,b)=>a+b,0))}</td>`);
// 			}
// 		});

// 		$grandRow.append(`<td>${formatNumber(grand.total)}</td>`);
// 		$tbody.append($grandRow);
// 		$table.append($tbody);


// 		/* EVENTS */
// 		$table.find('th.expandable').off('click').on('click', function () {
// 			const q = $(this).data('quarter');
// 			expandedQuarters = expandedQuarters.includes(q) ? expandedQuarters.filter(x=>x!==q) : [...expandedQuarters, q];
// 			$("#expand-quarters").prop("checked", expandedQuarters.length === 4);
// 			renderTable();
// 		});

// 		$table.find('.expense-head').off('click').on('click', function () {
// 			const headName = $(this).data('head');
// 			expandedHeads = expandedHeads.includes(headName) ? expandedHeads.filter(x=>x!==headName) : [...expandedHeads, headName];
// 			$("#expand-items").prop("checked", expandedHeads.length === expense_heads.length);
// 			renderTable();
// 		});

// 		$table.find('.sub-head').off('click').on('click', function () {
// 			const key = $(this).data('sub');
// 			expandedSubHeads = expandedSubHeads.includes(key) ? expandedSubHeads.filter(x=>x!==key) : [...expandedSubHeads, key];
// 			renderTable();
// 		});
// 	}

// 	/* CHECKBOX EVENTS */
// 	$("#expand-quarters").on("change", function() {
// 		expandedQuarters = this.checked ? ['q1','q2','q3','q4'] : [];
// 		renderTable();
// 	});

// 	$("#expand-items").on("change", function() {
// 		if (this.checked) {
// 			expandedHeads = expense_heads.map(h => h.name);
// 			expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads || []).map(s => h.name + "__" + s.name));
// 		} else {
// 			expandedHeads = [];
// 			expandedSubHeads = [];
// 		}
// 		renderTable();
// 	});

// 	$("#global-search-box").on("input", function() {
// 		searchText = this.value;
// 		renderTable();
// 	});

// 	loadData();
// };







// frappe.pages['budget-phase-sheet'].on_page_load = function(wrapper) {

// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Budget Phase Sheet',
// 		single_column: true
// 	});

// 	page.set_primary_action(__('Export CSV'), function () {
// 		export_phase_sheet();
// 	});

// 	function export_phase_sheet() {
// 		let financial_year = fiscal_year_filter.get_value();
// 		let units = unit_filter.get_value();
// 		let cost_center = cost_center_filter.get_value();
// 		let location_code = location_code_filter.get_value();

// 		if (!financial_year || !units) {
// 			frappe.msgprint(__('Please select Financial Year and Unit'));
// 			return;
// 		}

// 		frappe.call({
// 			method: "annual_budget.api.export_reports.export_phase_sheet_excel",
// 			args: {
// 				financial_year: financial_year,
// 				units: units,
// 				cost_center: cost_center,
// 				location_code: location_code
// 			},
// 			freeze: true,
// 			freeze_message: __("Preparing CSV file..."),
// 			callback: function (r) {
// 				if (r.message && r.message.file_url) {
// 					window.open(r.message.file_url);
// 					frappe.msgprint({
// 						title: __("Success"),
// 						message: __("Exported successfully"),
// 						indicator: "green"
// 					});
// 				}
// 			}
// 		});
// 	}

// 	/* ------------------------------------------------
// 	   FILTER SECTION
// 	--------------------------------------------------*/
// 	let filter_section = $(`
// 		<div class="frappe-control-group row custom-filter-row"></div>
// 	`).appendTo(page.body);

// 	$(`<style>
// 		.custom-filter-row {
// 			padding: 15px 20px;
// 			background: #fff;
// 			border-radius: 6px;
// 			margin-top: 10px;
// 		}
// 		.custom-filter-row.row {
// 			margin-right: 0px;
// 			margin-left: 0px;
// 		}
// 		.custom-filter-row .col-md-4,
// 		.custom-filter-row .col-sm-12 {
// 			padding-left: 8px;
// 			padding-right: 8px;
// 		}
// 	</style>`).appendTo("head");

// 	function make_field() {
// 		let col = $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);
// 		return col;
// 	}

// 	/* Financial Year */
// 	let fy_col = make_field();
// 	let fiscal_year_filter = frappe.ui.form.make_control({
// 		parent: fy_col,
// 		df: {
// 			label: "Financial Year",
// 			fieldtype: "Select",
// 			fieldname: "financial_year",
// 			options: ["2025-26", "2026-27"].join("\n"),
// 			default: "2025-26",
// 			reqd: 1,
// 			change() {
// 				loadData();
// 			}
// 		},
// 		render_input: true
// 	});

// 	/* Unit */
// 	let unit_col = make_field();
// 	let unit_filter = frappe.ui.form.make_control({
// 		parent: unit_col,
// 		df: {
// 			label: "Unit",
// 			fieldtype: "Link",
// 			fieldname: "unit",
// 			options: "Unit",
// 			default: "APU",
// 			reqd: 1,
// 			change() {
// 				let unit = unit_filter.get_value();
// 				loadData();
// 				loadCostCenters(unit);
// 				loadLocationCodes(unit);
// 			}
// 		},
// 		render_input: true
// 	});

// 	/* Cost Center */
// 	let cc_col = make_field();
// 	let cost_center_filter = frappe.ui.form.make_control({
// 		parent: cc_col,
// 		df: {
// 			label: "Cost Center",
// 			fieldtype: "Select",
// 			fieldname: "cost_center",
// 			change() {
// 				loadData();
// 			}
// 		},
// 		render_input: true
// 	});

// 	/* Location Code */
// 	let lc_col = make_field();
// 	let location_code_filter = frappe.ui.form.make_control({
// 		parent: lc_col,
// 		df: {
// 			label: "Location Code",
// 			fieldtype: "Select",
// 			fieldname: "location_code",
// 			change() {
// 				loadData();
// 			}
// 		},
// 		render_input: true
// 	});

// 	function loadCostCenters(units) {
// 		frappe.call({
// 			method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
// 			args: { units: units },
// 			callback: function (r) {
// 				if (r.message && r.message.data) {
// 					let options = r.message.data.map(d => ({
// 						label: d.label,
// 						value: d.value
// 					}));

// 					cost_center_filter.df.options = options;
// 					cost_center_filter.refresh();

// 					if (options.length > 0) {
// 						cost_center_filter.set_value(options[0].value);
// 					}
// 				}
// 			}
// 		});
// 	}

// 	function loadLocationCodes(unit) {
// 		frappe.call({
// 			method: "annual_budget.api.filter_options.get_location_codes_by_unit",
// 			args: { unit: unit },
// 			callback: function (r) {
// 				if (r.message && r.message.data) {
// 					location_code_filter.df.options = r.message.data;
// 					location_code_filter.refresh();
// 					location_code_filter.set_value("");
// 				}
// 			}
// 		});
// 	}

// 	frappe.after_ajax(() => {
// 		let default_unit = unit_filter.get_value();
// 		loadCostCenters(default_unit);
// 		loadLocationCodes(default_unit);
// 	});
// 	/* ---------- Styles for Table ---------- */
// 	const style = `
// 	<style>
// 		#tables-container { 
// 			margin: 20px; 
// 			background-color: #ffffff; 
// 			border-radius: 8px; 
// 			padding: 8px; 
// 		}

// 		#controls-row {
// 			display: flex;
// 			justify-content: space-between;
// 			align-items: center;
// 			margin-bottom: 12px;
// 			padding: 6px 10px;
// 			background: #f7f9fb;
// 			border: 1px solid #dcdcdc;
// 			border-radius: 6px;
// 		}

// 		#global-search-box { 
// 			width: 280px; 
// 			padding: 7px 12px; 
// 			border: 1px solid #aaa; 
// 			border-radius: 6px; 
// 			font-size: 13px;
// 		}

// 		#checkbox-area {
// 			display: flex;
// 			align-items: center;
// 			gap: 18px;
// 			font-size: 13px;
// 			font-weight: 500;
// 			color: #333;
// 		}

// 		#checkbox-area input {
// 			transform: scale(1.15);
// 			cursor: pointer;
// 		}

// 		.scroll-wrapper { 
// 			border: 1px solid #ccc; 
// 			border-radius: 6px; 
// 			overflow-x: auto; 
// 			overflow-y: auto; 
// 			max-height: 70vh; 
// 			background: #fff; 
// 		}

// 		table.university-table { 
// 			min-width: 1200px; 
// 			width: 100%; 
// 			border-collapse: collapse; 
// 			font-size: 13px; 
// 			color: #111; 
// 			background:#fff; 
// 		}

// 		table.university-table th, 
// 		table.university-table td {
// 			border: 1px solid #ddd;
// 			padding: 8px 10px;
// 			white-space: nowrap;
// 			vertical-align: middle;
// 			text-align: center;
// 			background:#fff !important;
// 		}

// 		table.university-table th:first-child,
// 		table.university-table td:first-child { 
// 			text-align: left !important; 
// 		}

// 		table.university-table th:nth-child(2),
// 		table.university-table td:nth-child(2) { 
// 			text-align: left !important; 
// 		}

// 		table.university-table thead tr.main-row th { 
// 			background-color: #0076B6 !important; 
// 			color: #fff !important; 
// 			position: sticky; 
// 			top: 0; 
// 			z-index: 25; 
// 			cursor: pointer; 
// 		}

// 		table.university-table thead tr.sub-row th { 
// 			background-color: #F26B21 !important; 
// 			color: #fff !important; 
// 			position: sticky; 
// 			top: 34px; 
// 			z-index: 24; 
// 		}

// 		tr.expense-head { 
// 			font-weight: 700; 
// 			cursor: pointer; 
// 		}

// 		tr.sub-head { 
// 			background-color: #FFF3E6 !important;
// 			font-weight: 600; 
// 			cursor: pointer; 
// 		}

// 		tr.line-item td:first-child { 
// 			padding-left: 35px !important; 
// 		}

// 		tr.sub-head td:first-child { 
// 			padding-left: 20px !important; 
// 		}

// 		tr.grand-total-row td {
// 			background:#003B63 !important;
// 			color:#fff !important;
// 			font-weight:700 !important;
// 		}
// 	</style>
// 	`;
// 	$(style).appendTo(page.body);

// 	/* ---------- UI Container ---------- */
// 	const container = $(`
// 		<div id="tables-container">

// 			<div id="controls-row">
// 				<input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item / GL Code...">
// 				<div id="checkbox-area">
// 					<label><input type="checkbox" id="expand-quarters"> Expand Quarters</label>
// 					<label><input type="checkbox" id="expand-items"> Expand Line Items</label>
// 				</div>
// 			</div>

// 			<div class="scroll-wrapper">
// 				<table class="university-table" id="phase-table"></table>
// 			</div>

// 		</div>
// 	`);
// 	$(page.body).append(container);

// 	/* ---------- State ---------- */
// 	let expense_heads = [];
// 	let expandedQuarters = [];
// 	let searchText = "";

// 	/* Quarter Setup */
// 	const quarters = {
// 		q1: { label: 'Quarter 1', months: ['April', 'May', 'June'] },
// 		q2: { label: 'Quarter 2', months: ['July', 'August', 'September'] },
// 		q3: { label: 'Quarter 3', months: ['October', 'November', 'December'] },
// 		q4: { label: 'Quarter 4', months: ['January', 'February', 'March'] }
// 	};

// 	const formatNumber = n => (n || 0).toLocaleString();

// 	/* ---------- Load Data ---------- */
// 	function loadData() {
// 		let fy = fiscal_year_filter.get_value();
// 		let unit = unit_filter.get_value();
// 		let cost_center = cost_center_filter.get_value();
// 		let location_code = location_code_filter.get_value();

// 		if (!fy || !unit) return;

// 		frappe.call({
// 			method: "annual_budget.api.phase_sheet.get_consolidated_report",
// 			args: { 
// 				financial_year: fy, 
// 				units: unit,
// 				cost_center: cost_center,
// 				location_code: location_code
// 			},
// 			callback: function(r) {
// 				expense_heads = r.message || [];
// 				renderTable();
// 			}
// 		});
// 	}

// 	function matchesSearch(...values) {
// 		return values.some(v => (String(v || "").toLowerCase()).includes(searchText.toLowerCase()));
// 	}

// 		/* ---------- Render Table ---------- */
// 	function renderTable() {
// 		const $table = $('#phase-table');
// 		$table.empty();

// 		const $thead = $('<thead></thead>');
// 		const $mainRow = $('<tr class="main-row"></tr>');
// 		$mainRow.append('<th rowspan="2">Expense Head / Line Item</th>');
// 		$mainRow.append('<th rowspan="2">GL Code</th>');

// 		['q1','q2','q3','q4'].forEach(q => {
// 			const isExpanded = expandedQuarters.includes(q);
// 			const arrow = isExpanded ? '▲' : '▼';
// 			const colspan = 3;
// 			const rowspan = isExpanded ? 1 : 2;

// 			$mainRow.append(`
// 				<th class="expandable" data-quarter="${q}" colspan="${colspan}" rowspan="${rowspan}">
// 					${quarters[q].label} ${arrow}
// 				</th>
// 			`);
// 		});

// 		$mainRow.append('<th rowspan="2">Total</th>');
// 		$thead.append($mainRow);

// 		if (expandedQuarters.length > 0) {
// 			const $subRow = $('<tr class="sub-row"></tr>');
// 			['q1','q2','q3','q4'].forEach(q => {
// 				if (expandedQuarters.includes(q)) {
// 					quarters[q].months.forEach(m => $subRow.append(`<th>${m}</th>`));
// 				}
// 			});
// 			$thead.append($subRow);
// 		}

// 		$table.append($thead);
// 		const $tbody = $('<tbody></tbody>');

// 		expense_heads.forEach(head => {

// 			const headContainsMatch =
// 				matchesSearch(head.name) ||
// 				(head.items || []).some(i => matchesSearch(i.name, i.gl_code)) ||
// 				(head.sub_heads || []).some(s =>
// 					matchesSearch(s.name) ||
// 					(s.items || []).some(i => matchesSearch(i.name, i.gl_code))
// 				);

// 			if (!headContainsMatch) return;

// 			const headTotal = ['q1','q2','q3','q4']
// 				.reduce((sum, q) => sum + head[q].reduce((a,b)=>a+b,0), 0);

// 			$tbody.append(`
// 				<tr class="expense-head" data-head="${head.name}">
// 					<td>▶ ${head.name}</td>
// 					<td class="gl-empty">-</td>
// 					${['q1','q2','q3','q4'].map(q =>
// 						expandedQuarters.includes(q)
// 							? head[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 							: `<td colspan="3">${formatNumber(head[q].reduce((a,b)=>a+b,0))}</td>`
// 					).join('')}
// 					<td class="text-blue">${formatNumber(headTotal)}</td>
// 				</tr>
// 			`);
// 		});

// 		$table.append($tbody);

// 		/* Bind Events */
// 		bindQuarterClicks();
// 		bindExpenseHeadClicks();
// 	}

// 	/* ---------- Quarter Expand/Collapse ---------- */
// 	function bindQuarterClicks() {
// 		$('#phase-table').find('th.expandable').off('click').on('click', function () {
// 			const q = $(this).data('quarter');
// 			expandedQuarters = expandedQuarters.includes(q)
// 				? expandedQuarters.filter(x => x !== q)
// 				: [...expandedQuarters, q];

// 			$("#expand-quarters").prop("checked", expandedQuarters.length === 4);
// 			renderTable();
// 		});
// 	}

// 	/* ---------- Expense Head Expand (OPEN ABOVE) ---------- */
// 	function bindExpenseHeadClicks() {
// 		$('#phase-table').find('.expense-head').off('click').on('click', function () {
// 			const $row = $(this);
// 			const headName = $row.data('head');

// 			/* Collapse */
// 			if ($row.hasClass("opened")) {
// 				$row.removeClass("opened");
// 				$row.prevUntil(".expense-head").remove();
// 				$row.find("td:first").html("▶ " + headName);
// 				return;
// 			}

// 			/* Expand */
// 			$row.addClass("opened");
// 			$row.find("td:first").html("▼ " + headName);

// 			const head = expense_heads.find(h => h.name === headName);
// 			let html = "";

// 			/* Line Items */
// 			if (head.items && head.items.length) {
// 				head.items.forEach(item => {
// 					const total = ['q1','q2','q3','q4']
// 						.reduce((sum, q) => sum + item[q].reduce((a,b)=>a+b,0), 0);

// 					html += `
// 						<tr class="line-item temp-row">
// 							<td>${item.name}</td>
// 							<td>${item.gl_code}</td>
// 							${['q1','q2','q3','q4'].map(q =>
// 								expandedQuarters.includes(q)
// 									? item[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 									: `<td colspan="3">${formatNumber(item[q].reduce((a,b)=>a+b,0))}</td>`
// 							).join('')}
// 							<td>${formatNumber(total)}</td>
// 						</tr>
// 					`;
// 				});
// 			}

// 			/* Sub Heads */
// 			if (head.sub_heads && head.sub_heads.length) {
// 				head.sub_heads.forEach(sub => {
// 					const key = head.name + "__" + sub.name;
// 					const subTotal = ['q1','q2','q3','q4']
// 						.reduce((sum, q) => sum + sub[q].reduce((a,b)=>a+b,0), 0);

// 					html += `
// 						<tr class="sub-head temp-row" data-sub="${key}">
// 							<td>▶ ${sub.name}</td>
// 							<td class="gl-empty">-</td>
// 							${['q1','q2','q3','q4'].map(q =>
// 								expandedQuarters.includes(q)
// 									? sub[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 									: `<td colspan="3">${formatNumber(sub[q].reduce((a,b)=>a+b,0))}</td>`
// 							).join('')}
// 							<td class="text-blue">${formatNumber(subTotal)}</td>
// 						</tr>
// 					`;
// 				});
// 			}

// 			/* Insert rows ABOVE */
// 			$row.before(html);

// 			/* Bind Sub Head Clicks */
// 			bindSubHeadClicks();
// 		});
// 	}

// 	/* ---------- Sub Head Expand (OPEN ABOVE) ---------- */
// 	function bindSubHeadClicks() {
// 		$('#phase-table').find('.sub-head').off('click').on('click', function () {
// 			const $row = $(this);
// 			const key = $row.data('sub');

// 			/* Collapse */
// 			if ($row.hasClass("opened")) {
// 				$row.removeClass("opened");
// 				$row.prevUntil(".sub-head, .expense-head").remove();
// 				const title = $row.text().replace("▼", "").replace("▶", "").trim();
// 				$row.find("td:first").html("▶ " + title);
// 				return;
// 			}

// 			/* Expand */
// 			$row.addClass("opened");
// 			const title = $row.text().replace("▶", "").trim();
// 			$row.find("td:first").html("▼ " + title);

// 			const [headName, subName] = key.split("__");
// 			const head = expense_heads.find(h => h.name === headName);
// 			const sub = head.sub_heads.find(s => s.name === subName);

// 			let html = "";

// 			sub.items.forEach(item => {
// 				const total = ['q1','q2','q3','q4']
// 					.reduce((sum, q) => sum + item[q].reduce((a,b)=>a+b,0), 0);

// 				html += `
// 					<tr class="line-item temp-row">
// 						<td>${item.name}</td>
// 						<td>${item.gl_code}</td>
// 						${['q1','q2','q3','q4'].map(q =>
// 							expandedQuarters.includes(q)
// 								? item[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 								: `<td colspan="3">${formatNumber(item[q].reduce((a,b)=>a+b,0))}</td>`
// 						).join('')}
// 						<td>${formatNumber(total)}</td>
// 					</tr>
// 				`;
// 			});

// 			/* Insert ABOVE */
// 			$row.before(html);
// 		});
// 	}
// 	/* ---------- GRAND TOTAL ---------- */
// 	function getGrandTotals() {
// 		const totals = { q1: [0,0,0], q2: [0,0,0], q3: [0,0,0], q4: [0,0,0], total: 0 };

// 		expense_heads.forEach(head => {
// 			['q1','q2','q3','q4'].forEach(q => {
// 				head[q].forEach((v, i) => {
// 					totals[q][i] += (v || 0);
// 					totals.total += (v || 0);
// 				});
// 			});
// 		});
// 		return totals;
// 	}

// 	/* ---------- Expand All Quarters ---------- */
// 	$("#expand-quarters").on("change", function() {
// 		expandedQuarters = this.checked ? ['q1','q2','q3','q4'] : [];
// 		renderTable();
// 	});

// 	/* ---------- Expand All Items ---------- */
// 	$("#expand-items").on("change", function() {
// 		if (this.checked) {
// 			// Expand all expense heads
// 			$('#phase-table .expense-head').each(function(){
// 				if (!$(this).hasClass("opened")) {
// 					$(this).trigger("click");
// 				}
// 			});
// 		} else {
// 			// Collapse all
// 			$('#phase-table .expense-head.opened').each(function(){
// 				$(this).trigger("click");
// 			});
// 		}
// 	});

// 	/* ---------- Search ---------- */
// 	$("#global-search-box").on("input", function() {
// 		searchText = this.value;
// 		renderTable();
// 	});

// 	/* ---------- Initial Load ---------- */
// 	loadData();

// };   // END OF PAGE





// frappe.pages['budget-phase-sheet'].on_page_load = function (wrapper) {

//     /* ------------------------------------------------
//        PAGE
//     --------------------------------------------------*/
//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Face Sheet',
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
//     </style>`).appendTo("head");

//     function make_field() {
//         return $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);
//     }

//     /* ------------------------------------------------
//        HELPER — PRESERVE LABELS (CRITICAL)
//     --------------------------------------------------*/
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
// let cards_container = $('<div class="card-row"></div>').appendTo(page.body);


//     /* ------------------------------------------------
//        FINANCIAL YEAR
//     --------------------------------------------------*/
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
//     //         change() {
//     //         }
//     //     },
//     //     render_input: true
//     // });
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
//                     loadData();
//                 }
//             }
//         },
//         render_input: true
//     });

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
//                 loadData();
//             }
//         },
//         render_input: true
//     });

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
//                 loadData();
//             }
//         },
//         render_input: true
//     });

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
//                         value: String(d.value),   // 🔥 normalize
//                         description: ""
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
//                         description: ""
//                     }));

//                 location_code_filter.df.options =
//                     mergeSelectedOptions(location_code_filter, api_options);

//                 location_code_filter.refresh();
//             }
//         });
//     }

//     /* ------------------------------------------------
//        EXPORT
//     --------------------------------------------------*/
//     page.set_primary_action(__('Export XLS'), function () {
//         export_phase_sheet();
//     });

//     // function export_phase_sheet() {
//     //     let financial_year = fiscal_year_filter.get_value();
//     //     let units = unit_filter.get_value();
//     //     let cost_centers = cost_center_filter.get_value();
//     //     let locations = location_code_filter.get_value();

//     //     if (!financial_year || !units.length) {
//     //         frappe.msgprint(__('Please select Financial Year and Unit'));
//     //         return;
//     //     }

//     //     frappe.call({
//     //         method: "annual_budget.api.export_reports.export_phase_sheet_excel",
//     //         args: {
//     //             financial_year,
//     //             units: units.join(","),
//     //             cost_center: cost_centers,
//     //             location_code: locations
//     //         },
//     //         freeze: true,
//     //         freeze_message: __("Preparing CSV file..."),
//     //         callback(r) {
//     //             if (r.message?.file_url) {
//     //                 window.open(r.message.file_url);
//     //                 frappe.msgprint({
//     //                     title: __("Success"),
//     //                     message: __("Exported successfully"),
//     //                     indicator: "green"
//     //                 });
//     //             }
//     //         }
//     //     });
//     // }
//     function export_phase_sheet() {
//     let financial_year = fiscal_year_filter.get_value();
//     let units = unit_filter.get_value();
//     let cost_centers = cost_center_filter.get_value();
//     let locations = location_code_filter.get_value();

//     if (!financial_year || !units.length) {
//         frappe.msgprint(__('Please select Financial Year and Unit'));
//         return;
//     }

//     let params = new URLSearchParams({
//         financial_year: financial_year,
//         units: units.join(","),
//         cost_center: cost_centers || "",
//         location_code: locations || ""
//     });

//     let url = `/api/method/annual_budget.api.export_reports.export_phase_sheet_excel?${params.toString()}`;

//     // Optional freeze indicator
//     frappe.dom.freeze(__('Preparing Excel file...'));

//     window.open(url);

//     // Unfreeze after short delay (browser handles download)
//     setTimeout(() => {
//         frappe.dom.unfreeze();
//     }, 2000);
// }
// const style = `
// <style>

// /* =====================================================
//    CONTAINER
//    ===================================================== */

// #tables-container { 
//     margin: 20px; 
//     background-color: #ffffff; 
//     border-radius: 8px; 
//     padding: 8px; 
// }


// /* =====================================================
//    CONTROLS ROW
//    ===================================================== */

// #controls-row {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 12px;
//     padding: 6px 10px;
//     background: #f7f9fb;
//     border: 1px solid #dcdcdc;
//     border-radius: 6px;
// }

// #global-search-box { 
//     width: 280px; 
//     padding: 7px 12px; 
//     border: 1px solid #aaa; 
//     border-radius: 6px; 
//     font-size: 13px;
// }

// #checkbox-area {
//     display: flex;
//     align-items: center;
//     gap: 18px;
//     font-size: 13px;
//     font-weight: 500;
//     color: #333;
// }

// #checkbox-area input {
//     transform: scale(1.15);
//     cursor: pointer;
// }


// /* =====================================================
//    TABLE DESIGN
//    ===================================================== */

// .scroll-wrapper { 
//     border: 1px solid #ccc; 
//     border-radius: 6px; 
//     overflow-x: auto; 
//     overflow-y: auto; 
//     max-height: 70vh; 
//     background: #fff; 
// }

// table.university-table { 
//     min-width: 1200px; 
//     width: 100%; 
//     border-collapse: collapse; 
//     font-size: 13px; 
//     color: #111; 
//     background:#fff; 
// }

// table.university-table th, 
// table.university-table td {
//     border: 1px solid #ddd;
//     padding: 8px 10px;
//     white-space: nowrap;
//     vertical-align: middle;
//     text-align: center;
//     background:#fff !important;
// }

// table.university-table th:first-child,
// table.university-table td:first-child { 
//     text-align: left !important; 
// }

// table.university-table th:nth-child(2),
// table.university-table td:nth-child(2) { 
//     text-align: left !important; 
// }


// /* =====================================================
//    TABLE HEADERS
//    ===================================================== */

// table.university-table thead tr.main-row th { 
//     background-color: #0076B6 !important; 
//     color: #fff !important; 
//     position: sticky; 
//     top: 0; 
//     z-index: 25; 
// }

// table.university-table thead tr.sub-row th { 
//     background-color: #F26B21 !important; 
//     color: #fff !important; 
//     position: sticky; 
//     top: 34px; 
//     z-index: 24; 
// }


// /* =====================================================
//    ROW TYPES
//    ===================================================== */

// tr.expense-head { 
//     font-weight: 700; 
//     cursor: pointer; 
// }

// tr.expense-head:hover td {
//     background: #F4F9FD !important;
// }

// tr.sub-head { 
//     background-color: #FFF3E6 !important;
//     font-weight: 600; 
// }

// tr.sub-head:hover td {
//     background-color: #FFEAD5 !important;
// }

// tr.line-item td:first-child { 
//     padding-left: 35px !important; 
// }

// tr.sub-head td:first-child { 
//     padding-left: 20px !important; 
// }

// .text-blue { 
//     color: #0076B6; 
//     font-weight: 600; 
// }

// td.gl-empty { 
//     color: #aaa; 
//     font-style: italic; 
// }


// /* =====================================================
//    GRAND TOTAL TABLE ROW
//    ===================================================== */

// tr.grand-total-row td {
//     background:#003B63 !important;
//     color:#fff !important;
//     font-weight:700 !important;
//     border-top: 2px solid #000 !important;
// }



// /* =====================================================
//    NUMBER CARDS (ERP CLEAN DESIGN)
//    ===================================================== */

// /* card grid */
// .card-row{
//     display:grid;
//     grid-template-columns: repeat(4, 1fr);
//     gap:14px;
//     margin:14px 20px;
// }


// /* base card */
// .number-card{
//     background:#ffffff;
//     border:1px solid #dcdcdc;
//     border-radius:8px;
//     padding:14px 16px;
//     box-shadow:0 2px 6px rgba(0,0,0,.06);
//     transition:.15s ease;
// }

// /* hover */
// .number-card:hover{
//     transform:translateY(-2px);
//     box-shadow:0 6px 14px rgba(0,0,0,.12);
// }

// /* title */
// .number-title{
//     font-size:12px;
//     font-weight:600;
//     color:#666;
//     text-transform:uppercase;
//     margin-bottom:6px;
// }

// /* value */
// .number-value{
//     font-size:20px;
//     font-weight:700;
//     color:#0076B6;
// }

// /* GRAND TOTAL CARD */
// .number-card.grand{
//     border:2px solid #0076B6;
//     background:#F4F9FD;
// }

// .number-card.grand .number-value{
//     font-size:24px;
//     font-weight:800;
// }


// /* =====================================================
//    RESPONSIVE
//    ===================================================== */

// @media (max-width:1024px){
//     .card-row{
//         grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
//     }
// }

// @media (max-width:768px){
//     .card-row{
//         grid-template-columns:repeat(auto-fill,minmax(140px,1fr));
//         gap:10px;
//         margin:10px;
//     }

//     .number-value{
//         font-size:16px;
//     }
// }

// @media (max-width:480px){
//     .card-row{
//         grid-template-columns:1fr 1fr;
//     }
// }

// </style>
// `;


// function sum(arr){
//     return (arr || []).reduce((a,b) => a + (b || 0), 0);
// }

// /* ===============================
//    INR + International format
// ===============================*/
// function formatINR(value){
//     return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'INR',
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     }).format(value || 0);
// }

// function renderCards(data){

//     cards_container.empty();

//     let grand_total = 0;
//     let cards_html = "";

//    /* Text color palette - All Black */
// const colors = [
//     "#000000"
// ];


//     let colorIndex = 0;

//     /* ===============================
//        Calculate totals first
//     ===============================*/
//     data.forEach(head => {
//         grand_total +=
//             sum(head.q1) +
//             sum(head.q2) +
//             sum(head.q3) +
//             sum(head.q4);
//     });

//     /* ===============================
//        ⭐ GRAND TOTAL
//     ===============================*/
//     let gtColor = colors[colorIndex++ % colors.length];
//     cards_html += `
//         <div class="number-card">
//             <div class="number-title" style="color:${gtColor}">Grand Total</div>
//             <div class="number-value" style="color:${gtColor}">
//                 ${formatINR(grand_total)}
//             </div>
//         </div>
//     `;

//     /* ===============================
//        Main + Sub cards
//     ===============================*/
//     data.forEach(head => {

//         let total =
//             sum(head.q1) +
//             sum(head.q2) +
//             sum(head.q3) +
//             sum(head.q4);

//         let mainColor = colors[colorIndex++ % colors.length];

//         /* Main card */
//         cards_html += `
//             <div class="number-card">
//                 <div class="number-title" style="color:${mainColor}">
//                     ${head.name}
//                 </div>
//                 <div class="number-value" style="color:${mainColor}">
//                     ${formatINR(total)}
//                 </div>
//             </div>
//         `;

//         /* Sub cards */
//         (head.sub_heads || []).forEach(sub => {

//             let sub_total =
//                 sum(sub.q1) +
//                 sum(sub.q2) +
//                 sum(sub.q3) +
//                 sum(sub.q4);

//             let subColor = colors[colorIndex++ % colors.length];

//             cards_html += `
//                 <div class="number-card">
//                     <div class="number-title" style="color:${subColor}">
//                         ${sub.name}
//                     </div>
//                     <div class="number-value" style="color:${subColor}">
//                         ${formatINR(sub_total)}
//                     </div>
//                 </div>
//             `;
//         });
//     });

//     cards_container.append(cards_html);
// }


	
// $(style).appendTo(page.body);

// 	/* ---------- UI Container ---------- */
// 	const container = $(`
// 		<div id="tables-container">

// 			<div id="controls-row">
// 				<input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item / GL Code...">
// 				<div id="checkbox-area">
// 					<label><input type="checkbox" id="expand-quarters"> Expand Quarters</label>
// 					<label><input type="checkbox" id="expand-items"> Expand Line Items</label>
// 				</div>
// 			</div>

// 			<div class="scroll-wrapper">
// 				<table class="university-table" id="phase-table"></table>
// 			</div>

// 		</div>
// 	`);
// 	$(page.body).append(container);


// 	/* ---------- State ---------- */
// 	let expense_heads = [];
// 	let expandedHeads = [];
// 	let expandedSubHeads = [];
// 	let expandedQuarters = [];
// 	let searchText = "";


// 	/* Quarter Setup */
// 	const quarters = {
// 		q1: { label: 'Quarter 1', months: ['April', 'May', 'June'] },
// 		q2: { label: 'Quarter 2', months: ['July', 'August', 'September'] },
// 		q3: { label: 'Quarter 3', months: ['October', 'November', 'December'] },
// 		q4: { label: 'Quarter 4', months: ['January', 'February', 'March'] }
// 	};

// 	const formatNumber = n => (n || 0).toLocaleString();

// 	/* ---------- API LOAD ---------- */
// 	function loadData() {
// 		let fy = fiscal_year_filter.get_value();
// 		let unit = unit_filter.get_value();
// 		let cost_center = cost_center_filter.get_value();
// 		let location_code = location_code_filter.get_value();

// 		let unit_str = unit.join(",");
// 		let cost_center_str = cost_center.join(",");
// 		let location_code_str = location_code.join(",");
// 		console.log(unit_str,cost_center_str,location_code_str,"Values for API")
// 		if (!fy || !unit) return;

// 		frappe.call({
// 			method: "annual_budget.api.phase_sheet.get_consolidated_report",
// 			args: { financial_year: fy, units: unit_str,cost_center:cost_center_str,location_code:location_code_str },
// 			callback: function(r) {
// 				expense_heads = r.message || [];
// 				renderTable();
// 				renderCards(expense_heads);   // ⭐ add this

// 			}
// 		});
// 	}


// 	/* ---------- SEARCH MATCH ---------- */
// 	function matchesSearch(...values) {
// 		return values.some(v => (String(v || "").toLowerCase()).includes(searchText.toLowerCase()));
// 	}


// 	/* ---------- GRAND TOTAL ---------- */
// 	function getGrandTotals() {
// 		const totals = { q1: [0,0,0], q2: [0,0,0], q3: [0,0,0], q4: [0,0,0], total: 0 };

// 		expense_heads.forEach(head => {
// 			['q1','q2','q3','q4'].forEach(q => {
// 				head[q].forEach((v, i) => {
// 					totals[q][i] += (v || 0);
// 					totals.total += (v || 0);
// 				});
// 			});
// 		});
// 		return totals;
// 	}


// 	/* ---------- RENDER TABLE ---------- */
// 	function renderTable() {
// 		const $table = $('#phase-table');
// 		$table.empty();

// 		const $thead = $('<thead></thead>');
// 		const $mainRow = $('<tr class="main-row"></tr>');
// 		$mainRow.append('<th rowspan="2">Expense Head / Line Item</th>');
// 		$mainRow.append('<th rowspan="2">GL Code</th>');

// 		['q1','q2','q3','q4'].forEach(q => {
// 			const isExpanded = expandedQuarters.includes(q);
// 			const arrow = isExpanded ? '▲' : '▼';
// 			const colspan = 3;
// 			const rowspan = isExpanded ? 1 : 2;

// 			$mainRow.append(`
// 				<th class="expandable" data-quarter="${q}" colspan="${colspan}" rowspan="${rowspan}">
// 					${quarters[q].label} ${arrow}
// 				</th>
// 			`);
// 		});

// 		$mainRow.append('<th rowspan="2">Total</th>');
// 		$thead.append($mainRow);

// 		if (expandedQuarters.length > 0) {
// 			const $subRow = $('<tr class="sub-row"></tr>');
// 			['q1','q2','q3','q4'].forEach(q => {
// 				if (expandedQuarters.includes(q)) quarters[q].months.forEach(m => $subRow.append(`<th>${m}</th>`));
// 			});
// 			$thead.append($subRow);
// 		}

// 		$table.append($thead);
// 		const $tbody = $('<tbody></tbody>');

// 		expense_heads.forEach(head => {

// 			const headContainsMatch =
// 				matchesSearch(head.name) ||
// 				(head.items || []).some(i => matchesSearch(i.name, i.gl_code)) ||
// 				(head.sub_heads || []).some(s =>
// 					matchesSearch(s.name) ||
// 					(s.items || []).some(i => matchesSearch(i.name, i.gl_code))
// 				);

// 			if (!headContainsMatch) return;

// 			const headTotal = ['q1','q2','q3','q4']
// 				.reduce((sum, q) => sum + head[q].reduce((a,b)=>a+b,0), 0);

// 			$tbody.append(`
// 				<tr class="expense-head" data-head="${head.name}">
// 					<td>${expandedHeads.includes(head.name) ? '▼' : '▶'} ${head.name}</td>
// 					<td class="gl-empty">-</td>
// 					${['q1','q2','q3','q4'].map(q =>
// 						expandedQuarters.includes(q)
// 							? head[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 							: `<td colspan="3">${formatNumber(head[q].reduce((a,b)=>a+b,0))}</td>`
// 					).join('')}
// 					<td class="text-blue">${formatNumber(headTotal)}</td>
// 				</tr>
// 			`);

// 			/* Line Items */
// 			if (expandedHeads.includes(head.name) && head.items && head.items.length) {
// 				head.items
// 				.filter(item => matchesSearch(item.name, item.gl_code))
// 				.forEach(item => {
// 					const total = ['q1','q2','q3','q4']
// 						.reduce((sum, q) => sum + item[q].reduce((a,b)=>a+b,0), 0);

// 					$tbody.append(`
// 						<tr class="line-item">
// 							<td>${item.name}</td>
// 							<td>${item.gl_code}</td>
// 							${['q1','q2','q3','q4'].map(q =>
// 								expandedQuarters.includes(q)
// 									? item[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 									: `<td colspan="3">${formatNumber(item[q].reduce((a,b)=>a+b,0))}</td>`
// 							).join('')}
// 							<td>${formatNumber(total)}</td>
// 						</tr>
// 					`);
// 				});
// 			}

// 			/* Sub-Heads */
// 			if (expandedHeads.includes(head.name) && head.sub_heads && head.sub_heads.length) {
// 				head.sub_heads
// 				.filter(sub =>
// 					matchesSearch(sub.name) ||
// 					(sub.items || []).some(i => matchesSearch(i.name, i.gl_code))
// 				)
// 				.forEach(sub => {

// 					const key = head.name + "__" + sub.name;

// 					const subTotal = ['q1','q2','q3','q4']
// 						.reduce((sum, q) => sum + sub[q].reduce((a,b)=>a+b,0), 0);

// 					$tbody.append(`
// 						<tr class="sub-head" data-sub="${key}">
// 							<td>${expandedSubHeads.includes(key) ? '▼' : '▶'} ${sub.name}</td>
// 							<td class="gl-empty">-</td>
// 							${['q1','q2','q3','q4'].map(q =>
// 								expandedQuarters.includes(q)
// 									? sub[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 									: `<td colspan="3">${formatNumber(sub[q].reduce((a,b)=>a+b,0))}</td>`
// 							).join('')}
// 							<td class="text-blue">${formatNumber(subTotal)}</td>
// 						</tr>
// 					`);

// 					if (expandedSubHeads.includes(key) && sub.items && sub.items.length) {
// 						sub.items
// 						.filter(item => matchesSearch(item.name, item.gl_code))
// 						.forEach(item => {
// 							const total = ['q1','q2','q3','q4']
// 								.reduce((sum, q) => sum + item[q].reduce((a,b)=>a+b,0), 0);

// 							$tbody.append(`
// 								<tr class="line-item">
// 									<td>${item.name}</td>
// 									<td>${item.gl_code}</td>
// 									${['q1','q2','q3','q4'].map(q =>
// 										expandedQuarters.includes(q)
// 											? item[q].map(v => `<td>${formatNumber(v)}</td>`).join('')
// 											: `<td colspan="3">${formatNumber(item[q].reduce((a,b)=>a+b,0))}</td>`
// 									).join('')}
// 									<td>${formatNumber(total)}</td>
// 								</tr>
// 							`);
// 						});
// 					}
// 				});
// 			}
// 		});


// 		/* GRAND TOTAL */
// 		const grand = getGrandTotals();
// 		const $grandRow = $('<tr class="grand-total-row"></tr>');
// 		$grandRow.append(`<td colspan="2" style="text-align:left;">GRAND TOTAL</td>`);

// 		['q1','q2','q3','q4'].forEach(q => {
// 			if (expandedQuarters.includes(q)) {
// 				grand[q].forEach(v => $grandRow.append(`<td>${formatNumber(v)}</td>`));
// 			} else {
// 				$grandRow.append(`<td colspan="3">${formatNumber(grand[q].reduce((a,b)=>a+b,0))}</td>`);
// 			}
// 		});

// 		$grandRow.append(`<td>${formatNumber(grand.total)}</td>`);
// 		$tbody.append($grandRow);
// 		$table.append($tbody);


// 		/* EVENTS */
// 		$table.find('th.expandable').off('click').on('click', function () {
// 			const q = $(this).data('quarter');
// 			expandedQuarters = expandedQuarters.includes(q) ? expandedQuarters.filter(x=>x!==q) : [...expandedQuarters, q];
// 			$("#expand-quarters").prop("checked", expandedQuarters.length === 4);
// 			renderTable();
// 		});

// 		$table.find('.expense-head').off('click').on('click', function () {
// 			const headName = $(this).data('head');
// 			expandedHeads = expandedHeads.includes(headName) ? expandedHeads.filter(x=>x!==headName) : [...expandedHeads, headName];
// 			$("#expand-items").prop("checked", expandedHeads.length === expense_heads.length);
// 			renderTable();
// 		});

// 		$table.find('.sub-head').off('click').on('click', function () {
// 			const key = $(this).data('sub');
// 			expandedSubHeads = expandedSubHeads.includes(key) ? expandedSubHeads.filter(x=>x!==key) : [...expandedSubHeads, key];
// 			renderTable();
// 		});
// 	}

// 	/* CHECKBOX EVENTS */
// 	$("#expand-quarters").on("change", function() {
// 		expandedQuarters = this.checked ? ['q1','q2','q3','q4'] : [];
// 		renderTable();
// 	});

// 	$("#expand-items").on("change", function() {
// 		if (this.checked) {
// 			expandedHeads = expense_heads.map(h => h.name);
// 			expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads || []).map(s => h.name + "__" + s.name));
// 		} else {
// 			expandedHeads = [];
// 			expandedSubHeads = [];
// 		}
// 		renderTable();
// 	});

// 	$("#global-search-box").on("input", function() {
// 		searchText = this.value;
// 		renderTable();
// 	});

// 	loadData();
// };


// frappe.pages['budget-phase-sheet'].on_page_load = function (wrapper) {

//     /* ─────────────────────────────────────────
//        PAGE
//     ───────────────────────────────────────── */
//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Summary',
//         single_column: true
//     });

//     /* ─────────────────────────────────────────
//        STYLES
//     ───────────────────────────────────────── */
//     $(`<style>
//         /* Filters */
//         .custom-filter-row{padding:15px 20px;background:#fff;border-radius:6px;margin-top:10px;margin-left:0;margin-right:0;}
//         .custom-filter-row .col-md-4,.custom-filter-row .col-sm-12{padding-left:8px;padding-right:8px;}

//         /* Cards section */
//         .bps-cards-section{padding:16px 24px;box-sizing:border-box;}
//         .bps-card-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px;}
//         .bps-sub-group{margin-bottom:4px;}
//         .bps-group-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;margin:12px 0 8px;border-left:4px solid var(--grp-accent);padding-left:10px;color:var(--grp-accent);}

//         /* Base card */
//         .number-card{background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:18px 20px;display:flex;flex-direction:column;gap:10px;box-sizing:border-box;transition:box-shadow .2s ease,transform .2s ease;}
//         .number-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);transform:translateY(-2px);}
//         .number-card.grand{border:5px solid #111;background:#fff;}
//         .number-card.main-card{border:5px solid var(--accent-color);}
//         .number-card.sub-card{border:2px solid var(--accent-color);}

//         /* Text — title black, value black */
//         .number-title{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#111;}
//         .number-value{font-size:22px;font-weight:600;color:#111;line-height:1.2;word-break:break-word;}
//         .number-card.grand .number-title{color:#111;}
//         .number-card.grand .number-value{font-size:24px;font-weight:700;color:#111;}

//         /* Loading */
//         .bps-loading{text-align:center;padding:40px;color:#888;font-size:14px;}
//         .bps-table-section{display:none;}
//         .bps-table-section.visible{display:block;}

//         /* Controls */
//         #tables-container{margin:0 24px 24px;background:#fff;border-radius:8px;padding:8px;}
//         #controls-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center;margin-bottom:12px;padding:8px 10px;background:#f7f9fb;border:1px solid #dcdcdc;border-radius:6px;}
//         #global-search-box{width:260px;padding:7px 12px;border:1px solid #aaa;border-radius:6px;font-size:13px;}
//         #checkbox-area{display:flex;flex-wrap:wrap;align-items:center;gap:14px;font-size:13px;font-weight:500;color:#333;}
//         #checkbox-area input{transform:scale(1.15);cursor:pointer;}

//         /* Table */
//         .scroll-wrapper{border:1px solid #ccc;border-radius:6px;overflow-x:auto;overflow-y:auto;max-height:70vh;background:#fff;}
//         table.university-table{min-width:900px;width:100%;border-collapse:collapse;font-size:13px;color:#111;background:#fff;}
//         table.university-table th,table.university-table td{border:1px solid #ddd;padding:8px 10px;white-space:nowrap;vertical-align:middle;text-align:center;background:#fff !important;}
//         table.university-table th:first-child,table.university-table td:first-child,
//         table.university-table th:nth-child(2),table.university-table td:nth-child(2){text-align:left !important;}
//         table.university-table thead tr.main-row th{background:#0076B6 !important;color:#fff !important;position:sticky;top:0;z-index:25;}
//         table.university-table thead tr.sub-row th{background:#f58020 !important;color:#fff !important;position:sticky;top:34px;z-index:24;}
//         tr.expense-head{font-weight:700;cursor:pointer;}
//         tr.expense-head:hover td{background:#F4F9FD !important;}
//         tr.sub-head{background:#F0F4FF !important;font-weight:600;}
//         tr.sub-head:hover td{background:#E0EAFF !important;}
//         tr.line-item td:first-child{padding-left:35px !important;}
//         tr.sub-head td:first-child{padding-left:20px !important;}
//         .text-blue{color:#0076B6;font-weight:600;}
//         td.gl-empty{color:#aaa;font-style:italic;}
//         tr.grand-total-row td{background:#0b2e70 !important;color:#fff !important;font-weight:700 !important;border-top:2px solid #000 !important;}

//         /* ── Responsive ── */
//         @media(max-width:1280px){.bps-card-row{grid-template-columns:repeat(3,1fr);}}
//         @media(max-width:1024px){
//             .bps-card-row{grid-template-columns:repeat(3,1fr);}
//             .bps-cards-section{padding:12px 16px;}
//             #tables-container{margin:0 16px 16px;}
//         }
//         @media(max-width:768px){
//             .bps-card-row{grid-template-columns:repeat(2,1fr);}
//             .bps-cards-section{padding:10px 12px;}
//             #tables-container{margin:0 12px 12px;}
//             .number-value{font-size:18px;}
//             #global-search-box{width:100%;}
//             #controls-row{flex-direction:column;align-items:flex-start;}
//             .custom-filter-row .col-md-4{width:100%;margin-bottom:8px;}
//         }
//         @media(max-width:480px){
//             .bps-card-row{grid-template-columns:repeat(2,1fr);gap:10px;}
//             .bps-cards-section{padding:8px 10px;}
//             #tables-container{margin:0 10px 10px;}
//             .number-value{font-size:16px;}
//             .number-title{font-size:11px;}
//         }
//         @media(max-width:360px){.bps-card-row{grid-template-columns:1fr;}}
//     </style>`).appendTo("head");

//     /* ─────────────────────────────────────────
//        ACCENT PALETTE — no green, light/muted tones
//     ───────────────────────────────────────── */
//     const ACCENTS = [
//         '#24da0c',  // blue
//         '#457cf3',  // purple
//         '#f8d92a',  // cyan
//         '#DC2626',  // red
//         '#4F46E5',  // indigo
//         '#BE185D',  // pink
//         '#0369A1',  // sky
//         '#0b2e70',  // violet
//         '#0E7490',  // dark cyan
//         '#B91C1C',  // dark red
//     ];
//     const getAccent = i => ACCENTS[i % ACCENTS.length];

//     /* ─────────────────────────────────────────
//        FILTER SECTION
//     ───────────────────────────────────────── */
//     let filter_section = $(`<div class="frappe-control-group row custom-filter-row"></div>`).appendTo(page.body);
//     const make_field = () => $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);

//     function mergeSelectedOptions(ctrl, new_opts) {
//         let selected = (ctrl.get_value() || []).map(String);
//         let map = {};
//         (ctrl.df.options || []).forEach(o => map[String(o.value)] = o);
//         new_opts.forEach(o => map[String(o.value)] = o);
//         selected.forEach(v => { if (!map[v]) map[v] = { label: v, value: v, description: "" }; });
//         return Object.values(map);
//     }

//     /* ─────────────────────────────────────────
//        FINANCIAL YEAR
//     ───────────────────────────────────────── */
//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: {
//             label: "Financial Year", fieldtype: "Select", fieldname: "financial_year", reqd: 1,
//             change() {
//                 let y = this.get_value();
//                 if (!y) return;
//                 page.set_title(`Budget Summary – ${y}`);
//                 resetAndLoad();
//             }
//         },
//         render_input: true
//     });
//     fiscal_year_filter.refresh();

//     /* Fetch FY list → set default → trigger initial loadData */
//     frappe.call({
//         method: "annual_budget.api.filter_options.get_financial_year_list",
//         callback(r) {
//             if (!r.message?.length) return;
//             let years = r.message.map(d => d.financial_year);
//             fiscal_year_filter.df.options = years.join("\n");
//             fiscal_year_filter.refresh();

//             let now = new Date(), m = now.getMonth() + 1, y = now.getFullYear();
//             let fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             let def = years.includes(fy) ? fy : years[0];

//             fiscal_year_filter.set_value(def);
//             page.set_title(`Budget Face Sheet – ${def}`);

//             /* ⭐ Initial load — units may already be set; loadData guards itself */
//             loadData();
//         }
//     });

//     /* ─────────────────────────────────────────
//        UNIT
//     ───────────────────────────────────────── */
//     let unit_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: {
//             label: "Unit", fieldtype: "MultiSelectList", fieldname: "unit", reqd: 1,
//             get_data() {
//                 return frappe.call({ method: "annual_budget.api.filter_options.get_units" })
//                     .then(r => toOpts(r.message?.data));
//             },
//             change() {
//                 let units = unit_filter.get_value().map(String);
//                 cost_center_filter.set_value([]);
//                 location_code_filter.set_value([]);
//                 cost_center_filter.df.options = [];
//                 location_code_filter.df.options = [];
//                 cost_center_filter.refresh();
//                 location_code_filter.refresh();
//                 if (units.length) {
//                     loadCostCenters(units);
//                     loadLocationCodes(units);
//                 }
//                 loadData();
//             }
//         },
//         render_input: true
//     });

//     /* ─────────────────────────────────────────
//        COST CENTER
//     ───────────────────────────────────────── */
//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: {
//             label: "Cost Center", fieldtype: "MultiSelectList", fieldname: "cost_center", options: [],
//             change() { loadData(); }
//         },
//         render_input: true
//     });

//     /* ─────────────────────────────────────────
//        LOCATION CODE
//     ───────────────────────────────────────── */
//     let location_code_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: {
//             label: "Location Code", fieldtype: "MultiSelectList", fieldname: "location_code", options: [],
//             change() { loadData(); }
//         },
//         render_input: true
//     });

//     /* ─────────────────────────────────────────
//        DEPENDENT FILTER LOADERS
//     ───────────────────────────────────────── */
//     function loadCostCenters(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 cost_center_filter.df.options = mergeSelectedOptions(cost_center_filter, toOpts(r.message?.data));
//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     function loadLocationCodes(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 location_code_filter.df.options = mergeSelectedOptions(location_code_filter, toOpts(r.message?.data));
//                 location_code_filter.refresh();
//             }
//         });
//     }

//     function toOpts(data) {
//         return (data || []).filter(d => d.value).map(d => ({ label: d.label, value: String(d.value), description: "" }));
//     }

//     /* ─────────────────────────────────────────
//        EXPORT
//     ───────────────────────────────────────── */
//     page.set_primary_action(__('Export XLS'), export_phase_sheet);

//     function export_phase_sheet() {
//         let fy    = fiscal_year_filter.get_value();
//         let units = unit_filter.get_value();
//         if (!fy || !units.length) { frappe.msgprint(__('Please select Financial Year and Unit')); return; }
//         let p = new URLSearchParams({
//             financial_year: fy,
//             units:          units.join(","),
//             cost_center:    cost_center_filter.get_value() || "",
//             location_code:  location_code_filter.get_value() || ""
//         });
//         frappe.dom.freeze(__('Preparing Excel file...'));
//         window.open(`/api/method/annual_budget.api.export_reports.export_phase_sheet_excel?${p}`);
//         setTimeout(() => frappe.dom.unfreeze(), 2000);
//     }

//     /* ─────────────────────────────────────────
//        LAYOUT
//     ───────────────────────────────────────── */
//     let $cards_section = $('<div class="bps-cards-section"></div>').appendTo(page.body);
//     let $loading       = $('<div class="bps-loading" style="display:none;">Loading data…</div>').appendTo(page.body);

//     let $table_section = $(`
//         <div class="bps-table-section">
//             <div id="tables-container">
//                 <div id="controls-row">
//                     <input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item / GL Code…">
//                     <div id="checkbox-area">
//                         <label><input type="checkbox" id="expand-quarters"> Expand Quarters</label>
//                         <label><input type="checkbox" id="expand-items"> Expand Line Items</label>
//                     </div>
//                 </div>
//                 <div class="scroll-wrapper">
//                     <table class="university-table" id="phase-table"></table>
//                 </div>
//             </div>
//         </div>
//     `).appendTo(page.body);

//     /* ─────────────────────────────────────────
//        STATE
//     ───────────────────────────────────────── */
//     let expense_heads    = [];
//     let expandedHeads    = [];
//     let expandedSubHeads = [];
//     let expandedQuarters = [];
//     let searchText       = "";

//     const quarters = {
//         q1: { label: 'Quarter 1', months: ['April',   'May',      'June'     ] },
//         q2: { label: 'Quarter 2', months: ['July',    'August',   'September'] },
//         q3: { label: 'Quarter 3', months: ['October', 'November', 'December' ] },
//         q4: { label: 'Quarter 4', months: ['January', 'February', 'March'    ] }
//     };

//     /* ─────────────────────────────────────────
//        HELPERS
//     ───────────────────────────────────────── */
//     const sumQ    = arr => (arr || []).reduce((a, b) => a + (b || 0), 0);
//     const sumAll  = obj => ['q1','q2','q3','q4'].reduce((t, q) => t + sumQ(obj[q]), 0);
//     const fmtNum  = n   => Math.round(n || 0).toLocaleString('en-IN');
//     const fmtINR  = v   => '₹' + Math.round(v || 0).toLocaleString('en-IN');
//     const matches = (...vals) => vals.some(v => String(v || '').toLowerCase().includes(searchText.toLowerCase()));

//     function toggleArr(arr, val) {
//         let idx = arr.indexOf(val);
//         idx === -1 ? arr.push(val) : arr.splice(idx, 1);
//     }

//     function resetAndLoad() {
//         expandedHeads = []; expandedSubHeads = []; expandedQuarters = [];
//         loadData();
//     }

//     /* ─────────────────────────────────────────
//        LOAD DATA
//        Guards: requires financial_year at minimum.
//        Works fine without unit (shows FY-level data
//        or returns empty — depends on API).
//     ───────────────────────────────────────── */
//     function loadData() {
//         let fy    = fiscal_year_filter.get_value();
//         if (!fy) return;                          // ⭐ only FY is required to trigger load

//         let units = unit_filter.get_value() || [];

//         $cards_section.empty();
//         $table_section.removeClass('visible');
//         $loading.show();

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_consolidated_report",
//             args: {
//                 financial_year: fy,
//                 units:          units.join(","),
//                 cost_center:    cost_center_filter.get_value().join(","),
//                 location_code:  location_code_filter.get_value().join(",")
//             },
//             callback(r) {
//                 expense_heads = r.message || [];
//                 $loading.hide();
//                 renderCards(expense_heads);
//                 renderTable();
//                 $table_section.addClass('visible');
//             }
//         });
//     }

//     /* ─────────────────────────────────────────
//        RENDER CARDS
//     ───────────────────────────────────────── */
//     function renderCards(data) {
//         $cards_section.empty();
//         if (!data.length) return;

//         let grand = data.reduce((t, h) => t + sumAll(h), 0);

//         /* Row 1 — Grand Total + main heads */
//         let $mainRow = $(`<div class="bps-card-row"></div>`);
//         $mainRow.append(`
//             <div class="number-card grand">
//                 <div class="number-title">Grand Total</div>
//                 <div class="number-value">${fmtINR(grand)}</div>
//             </div>
//         `);
//         data.forEach((head, i) => {
//             let color = getAccent(i);
//             $mainRow.append(`
//                 <div class="number-card main-card" style="--accent-color:${color};">
//                     <div class="number-title" title="${head.name}">${head.name}</div>
//                     <div class="number-value">${fmtINR(sumAll(head))}</div>
//                 </div>
//             `);
//         });
//         $cards_section.append($mainRow);

//         /* Row 2+ — sub-heads grouped & ordered by parent */
//         data.forEach((head, i) => {
//             if (!head.sub_heads?.length) return;
//             let color = getAccent(i);
//             let $group = $(`<div class="bps-sub-group"></div>`);
//             $group.append(`
//                 <div class="bps-group-label" style="--grp-accent:${color};border-left-color:${color};color:${color};">
//                     ${head.name}
//                 </div>
//             `);
//             let $subRow = $(`<div class="bps-card-row"></div>`);
//             head.sub_heads.forEach(sub => {
//                 $subRow.append(`
//                     <div class="number-card sub-card" style="--accent-color:${color};">
//                         <div class="number-title" title="${sub.name}">${sub.name}</div>
//                         <div class="number-value">${fmtINR(sumAll(sub))}</div>
//                     </div>
//                 `);
//             });
//             $group.append($subRow);
//             $cards_section.append($group);
//         });
//     }

//     /* ─────────────────────────────────────────
//        RENDER TABLE
//     ───────────────────────────────────────── */
//     function renderTable() {
//         let $table = $('#phase-table');
//         $table.empty();

//         let $thead   = $('<thead></thead>');
//         let $mainRow = $('<tr class="main-row"></tr>');
//         $mainRow.append('<th rowspan="2">Expense Head / Line Item</th><th rowspan="2">GL Code</th>');

//         ['q1','q2','q3','q4'].forEach(q => {
//             let exp = expandedQuarters.includes(q);
//             $mainRow.append(`
//                 <th class="expandable" data-quarter="${q}" colspan="3" rowspan="${exp ? 1 : 2}">
//                     ${quarters[q].label} ${exp ? '▲' : '▼'}
//                 </th>
//             `);
//         });
//         $mainRow.append('<th rowspan="2">Total</th>');
//         $thead.append($mainRow);

//         if (expandedQuarters.length) {
//             let $subRow = $('<tr class="sub-row"></tr>');
//             ['q1','q2','q3','q4'].forEach(q => {
//                 if (expandedQuarters.includes(q))
//                     quarters[q].months.forEach(m => $subRow.append(`<th>${m}</th>`));
//             });
//             $thead.append($subRow);
//         }
//         $table.append($thead);

//         let $tbody = $('<tbody></tbody>');
//         expense_heads.forEach(head => {
//             let visible = matches(head.name)
//                 || (head.items || []).some(i => matches(i.name, i.gl_code))
//                 || (head.sub_heads || []).some(s => matches(s.name) || (s.items || []).some(i => matches(i.name, i.gl_code)));
//             if (!visible) return;

//             $tbody.append(buildHeadRow(head));
//             if (!expandedHeads.includes(head.name)) return;

//             (head.items || []).filter(it => matches(it.name, it.gl_code))
//                 .forEach(it => $tbody.append(buildItemRow(it)));

//             (head.sub_heads || [])
//                 .filter(s => matches(s.name) || (s.items || []).some(i => matches(i.name, i.gl_code)))
//                 .forEach(sub => {
//                     let key = `${head.name}__${sub.name}`;
//                     $tbody.append(buildSubHeadRow(sub, key));
//                     if (expandedSubHeads.includes(key))
//                         (sub.items || []).filter(i => matches(i.name, i.gl_code))
//                             .forEach(it => $tbody.append(buildItemRow(it)));
//                 });
//         });

//         let grand = getGrandTotals();
//         let $gr   = $('<tr class="grand-total-row"></tr>');
//         $gr.append('<td colspan="2" style="text-align:left;">GRAND TOTAL</td>');
//         ['q1','q2','q3','q4'].forEach(q => {
//             if (expandedQuarters.includes(q))
//                 grand[q].forEach(v => $gr.append(`<td>${fmtNum(v)}</td>`));
//             else
//                 $gr.append(`<td colspan="3">${fmtNum(sumQ(grand[q]))}</td>`);
//         });
//         $gr.append(`<td>${fmtNum(grand.total)}</td>`);
//         $tbody.append($gr);
//         $table.append($tbody);

//         /* Events */
//         $table.find('th.expandable').off('click').on('click', function () {
//             toggleArr(expandedQuarters, $(this).data('quarter'));
//             $("#expand-quarters").prop("checked", expandedQuarters.length === 4);
//             renderTable();
//         });
//         $table.find('.expense-head').off('click').on('click', function () {
//             toggleArr(expandedHeads, $(this).data('head'));
//             $("#expand-items").prop("checked", expandedHeads.length === expense_heads.length);
//             renderTable();
//         });
//         $table.find('.sub-head').off('click').on('click', function () {
//             toggleArr(expandedSubHeads, $(this).data('sub'));
//             renderTable();
//         });
//     }

//     /* ── Row builders ── */
//     function qCells(obj) {
//         return ['q1','q2','q3','q4'].map(q =>
//             expandedQuarters.includes(q)
//                 ? (obj[q] || []).map(v => `<td>${fmtNum(v)}</td>`).join('')
//                 : `<td colspan="3">${fmtNum(sumQ(obj[q]))}</td>`
//         ).join('');
//     }

//     function buildHeadRow(head) {
//         return `<tr class="expense-head" data-head="${head.name}">
//             <td>${expandedHeads.includes(head.name) ? '▼' : '▶'} ${head.name}</td>
//             <td class="gl-empty">-</td>
//             ${qCells(head)}
//             <td class="text-blue">${fmtNum(sumAll(head))}</td>
//         </tr>`;
//     }

//     function buildSubHeadRow(sub, key) {
//         return `<tr class="sub-head" data-sub="${key}">
//             <td>${expandedSubHeads.includes(key) ? '▼' : '▶'} ${sub.name}</td>
//             <td class="gl-empty">-</td>
//             ${qCells(sub)}
//             <td class="text-blue">${fmtNum(sumAll(sub))}</td>
//         </tr>`;
//     }

//     function buildItemRow(item) {
//         return `<tr class="line-item">
//             <td>${item.name}</td>
//             <td>${item.gl_code}</td>
//             ${qCells(item)}
//             <td>${fmtNum(sumAll(item))}</td>
//         </tr>`;
//     }

//     function getGrandTotals() {
//         let t = { q1:[0,0,0], q2:[0,0,0], q3:[0,0,0], q4:[0,0,0], total:0 };
//         expense_heads.forEach(h =>
//             ['q1','q2','q3','q4'].forEach(q =>
//                 (h[q] || []).forEach((v, i) => { t[q][i] += v||0; t.total += v||0; })
//             )
//         );
//         return t;
//     }

//     /* ─────────────────────────────────────────
//        CHECKBOX + SEARCH EVENTS
//     ───────────────────────────────────────── */
//     $(page.body).on("change", "#expand-quarters", function () {
//         expandedQuarters = this.checked ? ['q1','q2','q3','q4'] : [];
//         renderTable();
//     });

//     $(page.body).on("change", "#expand-items", function () {
//         if (this.checked) {
//             expandedHeads    = expense_heads.map(h => h.name);
//             expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads || []).map(s => `${h.name}__${s.name}`));
//         } else {
//             expandedHeads = []; expandedSubHeads = [];
//         }
//         renderTable();
//     });

//     $(page.body).on("input", "#global-search-box", function () {
//         searchText = this.value;
//         renderTable();
//     });
// };


// frappe.pages['budget-phase-sheet'].on_page_load = function (wrapper) {

//     /* ─────────────────────────────────────────
//        PAGE
//     ───────────────────────────────────────── */
//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Summary',
//         single_column: true
//     });

//     /* ─────────────────────────────────────────
//        STYLES
//     ───────────────────────────────────────── */
//     $(`<style>
//         /* ── Filters ── */
//         .custom-filter-row{padding:15px 20px;background:#fff;border-radius:6px;margin-top:10px;margin-left:0;margin-right:0;}
//         .custom-filter-row .col-md-4,.custom-filter-row .col-sm-12{padding-left:8px;padding-right:8px;}

//         /* ── Cards section ── */
//         .bps-cards-section{padding:16px 24px;box-sizing:border-box;}
//         .bps-section-label{font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:#888;margin-bottom:12px;}

//         /* Grand total hero card */
//         .bps-grand-card{background:#fff;border:0.5px solid #d0d0d0;border-left:4px solid #1a3a6b;border-radius:6px;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
//         .bps-grand-label{font-size:11px;font-weight:600;letter-spacing:.7px;text-transform:uppercase;color:#666;margin-bottom:4px;}
//         .bps-grand-value{font-size:26px;font-weight:500;color:#111;letter-spacing:-.5px;}
//         .bps-grand-meta{font-size:12px;color:#999;text-align:right;}
//         .bps-grand-badge{display:inline-block;font-size:11px;font-weight:500;background:#e8f5e9;color:#2e7d32;padding:3px 10px;border-radius:4px;margin-top:6px;}

//         /* Expense head card grid */
//         .bps-card-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}

//         /* Expense head card */
//         .bps-exp-card{background:#fff;border:0.5px solid #e0e0e0;border-radius:6px;padding:16px 18px;position:relative;overflow:hidden;transition:border-color .15s ease;}
//         .bps-exp-card:hover{border-color:#bbb;}
//         .bps-exp-bar{position:absolute;top:0;left:0;width:3px;height:100%;}
//         .bps-exp-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#666;margin-bottom:8px;padding-left:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
//         .bps-exp-value{font-size:20px;font-weight:500;color:#111;padding-left:10px;letter-spacing:-.3px;}
//         .bps-exp-pct{font-size:11px;color:#999;padding-left:10px;margin-top:4px;}

//         /* Sub-head group */
//         .bps-sub-group{margin-bottom:16px;}
//         .bps-group-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;padding:6px 0 8px 12px;border-left:3px solid;margin-bottom:8px;display:block;}
//         .bps-sub-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}

//         /* Sub-head card */
//         .bps-sub-card{background:#f8f9fa;border:0.5px solid #e8e8e8;border-radius:6px;padding:13px 15px;position:relative;overflow:hidden;}
//         .bps-sub-bar{position:absolute;top:0;left:0;width:2px;height:100%;}
//         .bps-sub-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#777;margin-bottom:6px;padding-left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
//         .bps-sub-value{font-size:16px;font-weight:500;color:#111;padding-left:8px;letter-spacing:-.2px;}

//         /* Loading */
//         .bps-loading{text-align:center;padding:40px;color:#888;font-size:14px;}
//         .bps-table-section{display:none;}
//         .bps-table-section.visible{display:block;}

//         /* ── Table container ── */
//         #tables-container{margin:0 24px 24px;background:#fff;border-radius:8px;padding:8px;}
//         #controls-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center;margin-bottom:12px;padding:8px 10px;background:#f7f9fb;border:1px solid #dcdcdc;border-radius:6px;}
//         #global-search-box{width:260px;padding:7px 12px;border:1px solid #aaa;border-radius:6px;font-size:13px;}
//         #checkbox-area{display:flex;flex-wrap:wrap;align-items:center;gap:14px;font-size:13px;font-weight:500;color:#333;}
//         #checkbox-area input{transform:scale(1.15);cursor:pointer;}

//         /* ── Table ── */
//         .scroll-wrapper{border:1px solid #ccc;border-radius:6px;overflow-x:auto;overflow-y:auto;max-height:70vh;background:#fff;}
//         table.university-table{min-width:900px;width:100%;border-collapse:collapse;font-size:13px;color:#111;background:#fff;}
//         table.university-table th,table.university-table td{border:1px solid #ddd;padding:8px 10px;white-space:nowrap;vertical-align:middle;text-align:center;background:#fff !important;}
//         table.university-table th:first-child,table.university-table td:first-child,
//         table.university-table th:nth-child(2),table.university-table td:nth-child(2){text-align:left !important;}
//         table.university-table thead tr.main-row th{background:#0076B6 !important;color:#fff !important;position:sticky;top:0;z-index:25;cursor:pointer;}
//         table.university-table thead tr.sub-row th{background:#f58020 !important;color:#fff !important;position:sticky;top:34px;z-index:24;}
//         tr.expense-head{font-weight:700;cursor:pointer;}
//         tr.expense-head:hover td{background:#F4F9FD !important;}
//         tr.sub-head{background:#F0F4FF !important;font-weight:600;cursor:pointer;}
//         tr.sub-head:hover td{background:#E0EAFF !important;}
//         tr.line-item td:first-child{padding-left:35px !important;}
//         tr.sub-head td:first-child{padding-left:20px !important;}
//         .text-blue{color:#0076B6;font-weight:600;}
//         td.gl-empty{color:#aaa;font-style:italic;}
//         tr.grand-total-row td{background:#0b2e70 !important;color:#fff !important;font-weight:700 !important;border-top:2px solid #000 !important;}

//         /* ── Responsive ── */
//         @media(max-width:1280px){.bps-card-row,.bps-sub-row{grid-template-columns:repeat(3,1fr);}}
//         @media(max-width:900px){.bps-card-row,.bps-sub-row{grid-template-columns:repeat(2,1fr);}}
//         @media(max-width:768px){
//             .bps-cards-section{padding:10px 12px;}
//             #tables-container{margin:0 12px 12px;}
//             .number-value{font-size:18px;}
//             #global-search-box{width:100%;}
//             #controls-row{flex-direction:column;align-items:flex-start;}
//             .custom-filter-row .col-md-4{width:100%;margin-bottom:8px;}
//         }
//         @media(max-width:480px){
//             .bps-card-row,.bps-sub-row{grid-template-columns:1fr;}
//             .bps-cards-section{padding:8px 10px;}
//             #tables-container{margin:0 10px 10px;}
//         }
//     </style>`).appendTo("head");

//     /* ─────────────────────────────────────────
//        ACCENT PALETTE — muted, professional
//     ───────────────────────────────────────── */
//     const ACCENTS = [
//         '#3de046',
//         '#2c71f1',
//         '#f1d010',
//         '#4a235a',
//         '#0b5345',
//         '#1a5276',
//         '#6e2f1a',
//         '#283747',
//     ];
//     const getAccent = i => ACCENTS[i % ACCENTS.length];

//     /* ─────────────────────────────────────────
//        FILTER SECTION
//     ───────────────────────────────────────── */
//     let filter_section = $(`<div class="frappe-control-group row custom-filter-row"></div>`).appendTo(page.body);
//     const make_field = () => $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);

//     function mergeSelectedOptions(ctrl, new_opts) {
//         let selected = (ctrl.get_value() || []).map(String);
//         let map = {};
//         (ctrl.df.options || []).forEach(o => map[String(o.value)] = o);
//         new_opts.forEach(o => map[String(o.value)] = o);
//         selected.forEach(v => { if (!map[v]) map[v] = { label: v, value: v, description: "" }; });
//         return Object.values(map);
//     }

//     /* ─────────────────────────────────────────
//        FINANCIAL YEAR
//     ───────────────────────────────────────── */
//     let fiscal_year_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: {
//             label: "Financial Year", fieldtype: "Select", fieldname: "financial_year", reqd: 1,
//             change() {
//                 let y = this.get_value();
//                 if (!y) return;
//                 page.set_title(`Budget Summary – ${y}`);
//                 resetAndLoad();
//             }
//         },
//         render_input: true
//     });
//     fiscal_year_filter.refresh();

//     frappe.call({
//         method: "annual_budget.api.filter_options.get_financial_year_list",
//         callback(r) {
//             if (!r.message?.length) return;
//             let years = r.message.map(d => d.financial_year);
//             fiscal_year_filter.df.options = years.join("\n");
//             fiscal_year_filter.refresh();

//             let now = new Date(), m = now.getMonth() + 1, y = now.getFullYear();
//             let fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             let def = years.includes(fy) ? fy : years[0];

//             fiscal_year_filter.set_value(def);
//             page.set_title(`Budget Summary – ${def}`);
//             loadData();
//         }
//     });

//     /* ─────────────────────────────────────────
//        UNIT
//     ───────────────────────────────────────── */
//     let unit_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: {
//             label: "Unit", fieldtype: "MultiSelectList", fieldname: "unit", reqd: 1,
//             get_data() {
//                 return frappe.call({ method: "annual_budget.api.filter_options.get_units" })
//                     .then(r => toOpts(r.message?.data));
//             },
//             change() {
//                 let units = unit_filter.get_value().map(String);
//                 cost_center_filter.set_value([]);
//                 location_code_filter.set_value([]);
//                 cost_center_filter.df.options = [];
//                 location_code_filter.df.options = [];
//                 cost_center_filter.refresh();
//                 location_code_filter.refresh();
//                 if (units.length) {
//                     loadCostCenters(units);
//                     loadLocationCodes(units);
//                 }
//                 loadData();
//             }
//         },
//         render_input: true
//     });

//     /* ─────────────────────────────────────────
//        COST CENTER
//     ───────────────────────────────────────── */
//     let cost_center_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: {
//             label: "Cost Center", fieldtype: "MultiSelectList", fieldname: "cost_center", options: [],
//             change() { loadData(); }
//         },
//         render_input: true
//     });

//     /* ─────────────────────────────────────────
//        LOCATION CODE
//     ───────────────────────────────────────── */
//     let location_code_filter = frappe.ui.form.make_control({
//         parent: make_field(),
//         df: {
//             label: "Location Code", fieldtype: "MultiSelectList", fieldname: "location_code", options: [],
//             change() { loadData(); }
//         },
//         render_input: true
//     });

//     /* ─────────────────────────────────────────
//        DEPENDENT FILTER LOADERS
//     ───────────────────────────────────────── */
//     function loadCostCenters(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
//             args: { units: units.join(",") },
//             callback(r) {
//                 cost_center_filter.df.options = mergeSelectedOptions(cost_center_filter, toOpts(r.message?.data));
//                 cost_center_filter.refresh();
//             }
//         });
//     }

//     function loadLocationCodes(units) {
//         frappe.call({
//             method: "annual_budget.api.filter_options.get_location_codes_by_unit",
//             args: { unit: units.join(",") },
//             callback(r) {
//                 location_code_filter.df.options = mergeSelectedOptions(location_code_filter, toOpts(r.message?.data));
//                 location_code_filter.refresh();
//             }
//         });
//     }

//     function toOpts(data) {
//         return (data || []).filter(d => d.value).map(d => ({ label: d.label, value: String(d.value), description: "" }));
//     }

//     /* ─────────────────────────────────────────
//        EXPORT
//     ───────────────────────────────────────── */
//     page.set_primary_action(__('Export XLS'), export_phase_sheet);

//     function export_phase_sheet() {
//         let fy    = fiscal_year_filter.get_value();
//         let units = unit_filter.get_value();
//         if (!fy || !units.length) { frappe.msgprint(__('Please select Financial Year and Unit')); return; }
//         let p = new URLSearchParams({
//             financial_year: fy,
//             units:          units.join(","),
//             cost_center:    cost_center_filter.get_value() || "",
//             location_code:  location_code_filter.get_value() || ""
//         });
//         frappe.dom.freeze(__('Preparing Excel file...'));
//         window.open(`/api/method/annual_budget.api.export_reports.export_phase_sheet_excel?${p}`);
//         setTimeout(() => frappe.dom.unfreeze(), 2000);
//     }

//     /* ─────────────────────────────────────────
//        LAYOUT
//     ───────────────────────────────────────── */
//     let $cards_section = $('<div class="bps-cards-section"></div>').appendTo(page.body);
//     let $loading       = $('<div class="bps-loading" style="display:none;">Loading data…</div>').appendTo(page.body);

//     let $table_section = $(`
//         <div class="bps-table-section">
//             <div id="tables-container">
//                 <div id="controls-row">
//                     <input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item / GL Code…">
//                     <div id="checkbox-area">
//                         <label><input type="checkbox" id="expand-quarters"> Expand Quarters</label>
//                         <label><input type="checkbox" id="expand-items"> Expand Line Items</label>
//                     </div>
//                 </div>
//                 <div class="scroll-wrapper">
//                     <table class="university-table" id="phase-table"></table>
//                 </div>
//             </div>
//         </div>
//     `).appendTo(page.body);

//     /* ─────────────────────────────────────────
//        STATE
//     ───────────────────────────────────────── */
//     let expense_heads    = [];
//     let expandedHeads    = [];
//     let expandedSubHeads = [];
//     let expandedQuarters = [];
//     let searchText       = "";

//     const quarters = {
//         q1: { label: 'Quarter 1', months: ['April',   'May',      'June'     ] },
//         q2: { label: 'Quarter 2', months: ['July',    'August',   'September'] },
//         q3: { label: 'Quarter 3', months: ['October', 'November', 'December' ] },
//         q4: { label: 'Quarter 4', months: ['January', 'February', 'March'    ] }
//     };

//     /* ─────────────────────────────────────────
//        HELPERS
//     ───────────────────────────────────────── */
//     const sumQ   = arr => (arr || []).reduce((a, b) => a + (b || 0), 0);
//     const sumAll = obj => ['q1','q2','q3','q4'].reduce((t, q) => t + sumQ(obj[q]), 0);
//     const fmtNum = n   => Math.round(n || 0).toLocaleString('en-IN');
//     const fmtINR = v   => '₹' + Math.round(v || 0).toLocaleString('en-IN');
//     const matches = (...vals) => vals.some(v => String(v || '').toLowerCase().includes(searchText.toLowerCase()));

//     function toggleArr(arr, val) {
//         let idx = arr.indexOf(val);
//         idx === -1 ? arr.push(val) : arr.splice(idx, 1);
//     }

//     function resetAndLoad() {
//         expandedHeads = []; expandedSubHeads = []; expandedQuarters = [];
//         loadData();
//     }

//     /* ─────────────────────────────────────────
//        LOAD DATA
//     ───────────────────────────────────────── */
//     function loadData() {
//         let fy = fiscal_year_filter.get_value();
//         if (!fy) return;

//         let units = unit_filter.get_value() || [];

//         $cards_section.empty();
//         $table_section.removeClass('visible');
//         $loading.show();

//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_consolidated_report",
//             args: {
//                 financial_year: fy,
//                 units:          units.join(","),
//                 cost_center:    cost_center_filter.get_value().join(","),
//                 location_code:  location_code_filter.get_value().join(",")
//             },
//             callback(r) {
//                 expense_heads = r.message || [];
//                 $loading.hide();
//                 renderCards(expense_heads);
//                 renderTable();
//                 $table_section.addClass('visible');
//             }
//         });
//     }

//     /* ─────────────────────────────────────────
//        RENDER CARDS
//     ───────────────────────────────────────── */
//     function renderCards(data) {
//         $cards_section.empty();
//         if (!data.length) return;

//         let grand     = data.reduce((t, h) => t + sumAll(h), 0);
//         let fy        = fiscal_year_filter.get_value() || '';
//         let units     = unit_filter.get_value() || [];
//         let headCount = data.length;

//         /* Grand Total hero card */
//         $cards_section.append(`
//             <div class="bps-section-label">Budget Summary</div>
//             <div class="bps-grand-card">
//                 <div>
//                     <div class="bps-grand-label">Grand Total Budget</div>
//                     <div class="bps-grand-value">${fmtINR(grand)}</div>
//                 </div>
//                 <div class="bps-grand-meta">
//                     ${headCount} Expense Head${headCount !== 1 ? 's' : ''}
//                     ${units.length ? '&nbsp;·&nbsp; ' + units.length + ' Unit' + (units.length > 1 ? 's' : '') : ''}
//                     <br>
//                     <span class="bps-grand-badge">${fy}</span>
//                 </div>
//             </div>
//         `);

//         /* Expense head cards */
//         $cards_section.append(`<div class="bps-section-label">Expense Heads</div>`);
//         let $mainRow = $(`<div class="bps-card-row"></div>`);

//         data.forEach((head, i) => {
//             let color = getAccent(i);
//             let total = sumAll(head);
//             let pct   = grand > 0 ? Math.round((total / grand) * 100) : 0;

//             $mainRow.append(`
//                 <div class="bps-exp-card">
//                     <div class="bps-exp-bar" style="background:${color};"></div>
//                     <div class="bps-exp-label" title="${head.name}">${head.name}</div>
//                     <div class="bps-exp-value">${fmtINR(total)}</div>
//                     <div class="bps-exp-pct">${pct}% of total</div>
//                 </div>
//             `);
//         });
//         $cards_section.append($mainRow);

//         /* Sub-head cards grouped under each expense head */
//         data.forEach((head, i) => {
//             if (!head.sub_heads?.length) return;
//             let color = getAccent(i);

//             let $group = $(`<div class="bps-sub-group"></div>`);
//             $group.append(`
//                 <span class="bps-group-label" style="border-left-color:${color};color:${color};">
//                     ${head.name}
//                 </span>
//             `);

//             let $subRow = $(`<div class="bps-sub-row"></div>`);
//             head.sub_heads.forEach(sub => {
//                 $subRow.append(`
//                     <div class="bps-sub-card">
//                         <div class="bps-sub-bar" style="background:${color};"></div>
//                         <div class="bps-sub-label" title="${sub.name}">${sub.name}</div>
//                         <div class="bps-sub-value">${fmtINR(sumAll(sub))}</div>
//                     </div>
//                 `);
//             });

//             $group.append($subRow);
//             $cards_section.append($group);
//         });
//     }

//     /* ─────────────────────────────────────────
//        RENDER TABLE
//     ───────────────────────────────────────── */
//     function renderTable() {
//         let $table = $('#phase-table');
//         $table.empty();

//         let $thead   = $('<thead></thead>');
//         let $mainRow = $('<tr class="main-row"></tr>');
//         $mainRow.append('<th rowspan="2">Expense Head / Line Item</th><th rowspan="2">GL Code</th>');

//         ['q1','q2','q3','q4'].forEach(q => {
//             let exp = expandedQuarters.includes(q);
//             $mainRow.append(`
//                 <th class="expandable" data-quarter="${q}" colspan="3" rowspan="${exp ? 1 : 2}">
//                     ${quarters[q].label} ${exp ? '▲' : '▼'}
//                 </th>
//             `);
//         });
//         $mainRow.append('<th rowspan="2">Total</th>');
//         $thead.append($mainRow);

//         if (expandedQuarters.length) {
//             let $subRow = $('<tr class="sub-row"></tr>');
//             ['q1','q2','q3','q4'].forEach(q => {
//                 if (expandedQuarters.includes(q))
//                     quarters[q].months.forEach(m => $subRow.append(`<th>${m}</th>`));
//             });
//             $thead.append($subRow);
//         }
//         $table.append($thead);

//         let $tbody = $('<tbody></tbody>');

//         expense_heads.forEach(head => {
//             let visible = matches(head.name)
//                 || (head.items || []).some(i => matches(i.name, i.gl_code))
//                 || (head.sub_heads || []).some(s => matches(s.name) || (s.items || []).some(i => matches(i.name, i.gl_code)));
//             if (!visible) return;

//             $tbody.append(buildHeadRow(head));
//             if (!expandedHeads.includes(head.name)) return;

//             (head.items || []).filter(it => matches(it.name, it.gl_code))
//                 .forEach(it => $tbody.append(buildItemRow(it)));

//             (head.sub_heads || [])
//                 .filter(s => matches(s.name) || (s.items || []).some(i => matches(i.name, i.gl_code)))
//                 .forEach(sub => {
//                     let key = `${head.name}__${sub.name}`;
//                     $tbody.append(buildSubHeadRow(sub, key));
//                     if (expandedSubHeads.includes(key))
//                         (sub.items || []).filter(i => matches(i.name, i.gl_code))
//                             .forEach(it => $tbody.append(buildItemRow(it)));
//                 });
//         });

//         /* Grand Total row */
//         let grand = getGrandTotals();
//         let $gr   = $('<tr class="grand-total-row"></tr>');
//         $gr.append('<td colspan="2" style="text-align:left;">GRAND TOTAL</td>');
//         ['q1','q2','q3','q4'].forEach(q => {
//             if (expandedQuarters.includes(q))
//                 grand[q].forEach(v => $gr.append(`<td>${fmtNum(v)}</td>`));
//             else
//                 $gr.append(`<td colspan="3">${fmtNum(sumQ(grand[q]))}</td>`);
//         });
//         $gr.append(`<td>${fmtNum(grand.total)}</td>`);
//         $tbody.append($gr);
//         $table.append($tbody);

//         /* ── Events ── */
//         $table.find('th.expandable').off('click').on('click', function () {
//             toggleArr(expandedQuarters, $(this).data('quarter'));
//             $("#expand-quarters").prop("checked", expandedQuarters.length === 4);
//             renderTable();
//         });
//         $table.find('.expense-head').off('click').on('click', function () {
//             toggleArr(expandedHeads, $(this).data('head'));
//             $("#expand-items").prop("checked", expandedHeads.length === expense_heads.length);
//             renderTable();
//         });
//         $table.find('.sub-head').off('click').on('click', function () {
//             toggleArr(expandedSubHeads, $(this).data('sub'));
//             renderTable();
//         });
//     }

//     /* ── Row builders ── */
//     function qCells(obj) {
//         return ['q1','q2','q3','q4'].map(q =>
//             expandedQuarters.includes(q)
//                 ? (obj[q] || []).map(v => `<td>${fmtNum(v)}</td>`).join('')
//                 : `<td colspan="3">${fmtNum(sumQ(obj[q]))}</td>`
//         ).join('');
//     }

//     function buildHeadRow(head) {
//         return `<tr class="expense-head" data-head="${head.name}">
//             <td>${expandedHeads.includes(head.name) ? '▼' : '▶'} ${head.name}</td>
//             <td class="gl-empty">-</td>
//             ${qCells(head)}
//             <td class="text-blue">${fmtNum(sumAll(head))}</td>
//         </tr>`;
//     }

//     function buildSubHeadRow(sub, key) {
//         return `<tr class="sub-head" data-sub="${key}">
//             <td>${expandedSubHeads.includes(key) ? '▼' : '▶'} ${sub.name}</td>
//             <td class="gl-empty">-</td>
//             ${qCells(sub)}
//             <td class="text-blue">${fmtNum(sumAll(sub))}</td>
//         </tr>`;
//     }

//     function buildItemRow(item) {
//         return `<tr class="line-item">
//             <td>${item.name}</td>
//             <td>${item.gl_code}</td>
//             ${qCells(item)}
//             <td>${fmtNum(sumAll(item))}</td>
//         </tr>`;
//     }

//     function getGrandTotals() {
//         let t = { q1:[0,0,0], q2:[0,0,0], q3:[0,0,0], q4:[0,0,0], total:0 };
//         expense_heads.forEach(h =>
//             ['q1','q2','q3','q4'].forEach(q =>
//                 (h[q] || []).forEach((v, i) => { t[q][i] += v||0; t.total += v||0; })
//             )
//         );
//         return t;
//     }

//     /* ─────────────────────────────────────────
//        CHECKBOX + SEARCH EVENTS
//     ───────────────────────────────────────── */
//     $(page.body).on("change", "#expand-quarters", function () {
//         expandedQuarters = this.checked ? ['q1','q2','q3','q4'] : [];
//         renderTable();
//     });

//     $(page.body).on("change", "#expand-items", function () {
//         if (this.checked) {
//             expandedHeads    = expense_heads.map(h => h.name);
//             expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads || []).map(s => `${h.name}__${s.name}`));
//         } else {
//             expandedHeads = []; expandedSubHeads = [];
//         }
//         renderTable();
//     });

//     $(page.body).on("input", "#global-search-box", function () {
//         searchText = this.value;
//         renderTable();
//     });
// };

frappe.pages['budget-phase-sheet'].on_page_load = function (wrapper) {

    /* ─────────────────────────────────────────
       PAGE
    ───────────────────────────────────────── */
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Budget Summary',
        single_column: true
    });

    /* ─────────────────────────────────────────
       STYLES
    ───────────────────────────────────────── */
    $(`<style>
        .custom-filter-row{padding:15px 20px;background:#fff;border-radius:6px;margin-top:10px;margin-left:0;margin-right:0;}
        .custom-filter-row .col-md-4,.custom-filter-row .col-sm-12{padding-left:8px;padding-right:8px;}

        /* ── Top summary row: cards left, pie right ── */
        .bps-summary-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px 24px 0;box-sizing:border-box;}

        /* ── Left: cards section ── */
        .bps-cards-section{display:flex;flex-direction:column;gap:0;}
        .bps-section-label{font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:#888;margin-bottom:10px;}

        /* Grand total card */
        .bps-grand-card{background:#fff;border:0.5px solid #d0d0d0;border-left:4px solid #1a3a6b;border-radius:8px;padding:20px 24px;display:flex;flex-direction:column;gap:10px;margin-bottom:14px;}
        .bps-grand-label{font-size:10px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:#888;}
        .bps-grand-value{font-size:26px;font-weight:500;color:#111;letter-spacing:-.5px;line-height:1.2;}
        .bps-grand-meta{font-size:11px;color:#999;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .bps-grand-badge{display:inline-block;font-size:10px;font-weight:500;background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:4px;}

        /* Expense head card grid */
        .bps-card-row{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;}
        .bps-exp-card{background:#fff;border:0.5px solid #e0e0e0;border-radius:6px;padding:14px 16px;position:relative;overflow:hidden;transition:border-color .15s ease;}
        .bps-exp-card:hover{border-color:#bbb;}
        .bps-exp-bar{position:absolute;top:0;left:0;width:3px;height:100%;}
        .bps-exp-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#666;margin-bottom:6px;padding-left:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .bps-exp-value{font-size:16px;font-weight:500;color:#111;padding-left:10px;letter-spacing:-.2px;}
        .bps-exp-pct{font-size:10px;color:#999;padding-left:10px;margin-top:3px;}

        /* Sub-head group */
        .bps-sub-group{margin-bottom:14px;}
        .bps-group-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;padding:5px 0 7px 12px;border-left:3px solid;margin-bottom:8px;display:block;border-radius:0;}
        .bps-sub-row{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
        .bps-sub-card{background:#f8f9fa;border:0.5px solid #e8e8e8;border-radius:6px;padding:11px 13px;position:relative;overflow:hidden;}
        .bps-sub-bar{position:absolute;top:0;left:0;width:2px;height:100%;}
        .bps-sub-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#777;margin-bottom:5px;padding-left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .bps-sub-value{font-size:14px;font-weight:500;color:#111;padding-left:8px;letter-spacing:-.2px;}

        /* ── Right: pie section ── */
        .bps-pie-section{display:flex;flex-direction:column;}
        .bps-pie-card{background:#fff;border:0.5px solid #e0e0e0;border-radius:8px;padding:24px 20px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;height:100%;box-sizing:border-box;}
        .bps-pie-card-title{font-size:16px;font-weight:600;letter-spacing:.7px;text-transform:uppercase;color:#070707;margin-bottom:14px;text-align:center;}
        .bps-pie-canvas-wrap{position:relative;width:250px;height:250px;flex-shrink:0;}
        .bps-pie-total-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-top:14px;}
        .bps-pie-total-val{font-size:26px;font-weight:500;color:#111;margin-top:4px;margin-bottom:14px;}
        .bps-pie-legend-row{display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:center;}
        .bps-pie-leg-item{display:flex;align-items:center;gap:6px;font-size:15px;color:#555;}
        .bps-pie-leg-dot{width:10px;height:10px;border-radius:2px;flex-shrink:0;}
        .bps-pie-leg-val{font-weight:600;color:#111;margin-left:3px;font-size:14px}
        .bps-pie-leg-pct{color:#999;font-size:15px;margin-left:2px;}

        /* Loading */
        .bps-loading{text-align:center;padding:40px;color:#888;font-size:14px;}
        .bps-table-section{display:none;}
        .bps-table-section.visible{display:block;}

        /* ── Table container ── */
        #tables-container{margin:16px 24px 24px;background:#fff;border-radius:8px;padding:8px;}
        #controls-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center;margin-bottom:12px;padding:8px 10px;background:#f7f9fb;border:1px solid #dcdcdc;border-radius:6px;}
        #global-search-box{width:260px;padding:7px 12px;border:1px solid #aaa;border-radius:6px;font-size:13px;}
        #checkbox-area{display:flex;flex-wrap:wrap;align-items:center;gap:14px;font-size:13px;font-weight:500;color:#333;}
        #checkbox-area input{transform:scale(1.15);cursor:pointer;}

        /* ── Table ── */
        .scroll-wrapper{border:1px solid #ccc;border-radius:6px;overflow-x:auto;overflow-y:auto;max-height:70vh;background:#fff;}
        table.university-table{min-width:900px;width:100%;border-collapse:collapse;font-size:13px;color:#111;background:#fff;}
        table.university-table th,table.university-table td{border:1px solid #ddd;padding:8px 10px;white-space:nowrap;vertical-align:middle;text-align:center;background:#fff !important;}
        table.university-table th:first-child,table.university-table td:first-child,
        table.university-table th:nth-child(2),table.university-table td:nth-child(2){text-align:left !important;}
        table.university-table thead tr.main-row th{background:#0076B6 !important;color:#fff !important;position:sticky;top:0;z-index:25;cursor:pointer;}
        table.university-table thead tr.sub-row th{background:#f58020 !important;color:#fff !important;position:sticky;top:34px;z-index:24;}
        tr.expense-head{font-weight:700;cursor:pointer;}
        tr.expense-head:hover td{background:#F4F9FD !important;}
        tr.sub-head{background:#F0F4FF !important;font-weight:600;cursor:pointer;}
        tr.sub-head:hover td{background:#E0EAFF !important;}
        tr.line-item td:first-child{padding-left:35px !important;}
        tr.sub-head td:first-child{padding-left:20px !important;}
        .text-blue{color:#0076B6;font-weight:600;}
        td.gl-empty{color:#aaa;font-style:italic;}
        tr.grand-total-row td{background:#0b2e70 !important;color:#fff !important;font-weight:700 !important;border-top:2px solid #000 !important;}

        /* ── Responsive ── */
        @media(max-width:1100px){.bps-summary-row{grid-template-columns:1fr;}.bps-card-row,.bps-sub-row{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:768px){
            .bps-summary-row{padding:10px 12px 0;}
            .bps-card-row,.bps-sub-row{grid-template-columns:repeat(2,1fr);}
            #tables-container{margin:12px 12px 12px;}
            #global-search-box{width:100%;}
            #controls-row{flex-direction:column;align-items:flex-start;}
            .custom-filter-row .col-md-4{width:100%;margin-bottom:8px;}
        }
        @media(max-width:480px){
            .bps-card-row,.bps-sub-row{grid-template-columns:1fr;}
        }
    </style>`).appendTo("head");

    /* ─────────────────────────────────────────
       ACCENT PALETTE
    ───────────────────────────────────────── */
    const ACCENTS = ['#3de046','#2c71f1','#f1d010','#4a235a','#0b5345','#1a5276','#6e2f1a','#283747'];
    const getAccent = i => ACCENTS[i % ACCENTS.length];

    /* ─────────────────────────────────────────
       FILTER SECTION
    ───────────────────────────────────────── */
    let filter_section = $(`<div class="frappe-control-group row custom-filter-row"></div>`).appendTo(page.body);
    const make_field = () => $(`<div class="col-md-4 col-sm-12"></div>`).appendTo(filter_section);

    function mergeSelectedOptions(ctrl, new_opts) {
        let selected = (ctrl.get_value() || []).map(String);
        let map = {};
        (ctrl.df.options || []).forEach(o => map[String(o.value)] = o);
        new_opts.forEach(o => map[String(o.value)] = o);
        selected.forEach(v => { if (!map[v]) map[v] = { label: v, value: v, description: "" }; });
        return Object.values(map);
    }

    /* ── Financial Year ── */
    let fiscal_year_filter = frappe.ui.form.make_control({
        parent: make_field(),
        df: {
            label: "Financial Year", fieldtype: "Select", fieldname: "financial_year", reqd: 1,
            change() {
                let y = this.get_value();
                if (!y) return;
                page.set_title(`Budget Summary – ${y}`);
                resetAndLoad();
            }
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
            let fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
            let def = years.includes(fy) ? fy : years[0];
            fiscal_year_filter.set_value(def);
            page.set_title(`Budget Summary – ${def}`);
            loadData();
        }
    });

    /* ── Unit ── */
    let unit_filter = frappe.ui.form.make_control({
        parent: make_field(),
        df: {
            label: "Unit", fieldtype: "MultiSelectList", fieldname: "unit", reqd: 1,
            get_data() {
                return frappe.call({ method: "annual_budget.api.filter_options.get_units" })
                    .then(r => toOpts(r.message?.data));
            },
            change() {
                let units = unit_filter.get_value().map(String);
                cost_center_filter.set_value([]);
                location_code_filter.set_value([]);
                cost_center_filter.df.options = [];
                location_code_filter.df.options = [];
                cost_center_filter.refresh();
                location_code_filter.refresh();
                if (units.length) { loadCostCenters(units); loadLocationCodes(units); }
                loadData();
            }
        },
        render_input: true
    });

    /* ── Cost Center ── */
    let cost_center_filter = frappe.ui.form.make_control({
        parent: make_field(),
        df: {
            label: "Cost Center", fieldtype: "MultiSelectList", fieldname: "cost_center", options: [],
            change() { loadData(); }
        },
        render_input: true
    });

    /* ── Location Code ── */
    let location_code_filter = frappe.ui.form.make_control({
        parent: make_field(),
        df: {
            label: "Location Code", fieldtype: "MultiSelectList", fieldname: "location_code", options: [],
            change() { loadData(); }
        },
        render_input: true
    });

    function loadCostCenters(units) {
        frappe.call({
            method: "annual_budget.api.filter_options.get_cost_centers_by_set_id",
            args: { units: units.join(",") },
            callback(r) {
                cost_center_filter.df.options = mergeSelectedOptions(cost_center_filter, toOpts(r.message?.data));
                cost_center_filter.refresh();
            }
        });
    }

    function loadLocationCodes(units) {
        frappe.call({
            method: "annual_budget.api.filter_options.get_location_codes_by_unit",
            args: { unit: units.join(",") },
            callback(r) {
                location_code_filter.df.options = mergeSelectedOptions(location_code_filter, toOpts(r.message?.data));
                location_code_filter.refresh();
            }
        });
    }

    function toOpts(data) {
        return (data || []).filter(d => d.value).map(d => ({ label: d.label, value: String(d.value), description: "" }));
    }

    /* ─────────────────────────────────────────
       EXPORT
    ───────────────────────────────────────── */
    page.set_primary_action(__('Export XLS'), export_phase_sheet);

    function export_phase_sheet() {
        let fy    = fiscal_year_filter.get_value();
        let units = unit_filter.get_value();
        if (!fy || !units.length) { frappe.msgprint(__('Please select Financial Year and Unit')); return; }
        let p = new URLSearchParams({
            financial_year: fy,
            units:          units.join(","),
            cost_center:    cost_center_filter.get_value() || "",
            location_code:  location_code_filter.get_value() || ""
        });
        frappe.dom.freeze(__('Preparing Excel file...'));
        window.open(`/api/method/annual_budget.api.export_reports.export_phase_sheet_excel?${p}`);
        setTimeout(() => frappe.dom.unfreeze(), 2000);
    }

    /* ─────────────────────────────────────────
       LAYOUT
       .bps-summary-row  (grid: left | right)
         ├── .bps-cards-section   (left col)
         └── .bps-pie-section     (right col)
    ───────────────────────────────────────── */
    let $summary_row   = $('<div class="bps-summary-row"></div>').appendTo(page.body);
    let $cards_section = $('<div class="bps-cards-section"></div>').appendTo($summary_row);
    let $pie_section   = $('<div class="bps-pie-section"></div>').appendTo($summary_row);

    let $loading       = $('<div class="bps-loading" style="display:none;">Loading data…</div>').appendTo(page.body);

    let $table_section = $(`
        <div class="bps-table-section">
            <div id="tables-container">
                <div id="controls-row">
                    <input id="global-search-box" type="text" placeholder="Search Expense / Sub Head / Item / GL Code…">
                    <div id="checkbox-area">
                        <label><input type="checkbox" id="expand-quarters"> Expand Quarters</label>
                        <label><input type="checkbox" id="expand-items"> Expand Line Items</label>
                    </div>
                </div>
                <div class="scroll-wrapper">
                    <table class="university-table" id="phase-table"></table>
                </div>
            </div>
        </div>
    `).appendTo(page.body);

    /* ─────────────────────────────────────────
       STATE
    ───────────────────────────────────────── */
    let expense_heads    = [];
    let expandedHeads    = [];
    let expandedSubHeads = [];
    let expandedQuarters = [];
    let searchText       = "";

    const quarters = {
        q1: { label: 'Quarter 1', months: ['April',   'May',      'June'     ] },
        q2: { label: 'Quarter 2', months: ['July',    'August',   'September'] },
        q3: { label: 'Quarter 3', months: ['October', 'November', 'December' ] },
        q4: { label: 'Quarter 4', months: ['January', 'February', 'March'    ] }
    };

    /* ─────────────────────────────────────────
       HELPERS
    ───────────────────────────────────────── */
    const sumQ   = arr => (arr || []).reduce((a, b) => a + (b || 0), 0);
    const sumAll = obj => ['q1','q2','q3','q4'].reduce((t, q) => t + sumQ(obj[q]), 0);
    const fmtNum = n   => Math.round(n || 0).toLocaleString('en-IN');
    const fmtINR = v   => '₹' + Math.round(v || 0).toLocaleString('en-IN');
    const fmtCr  = v   => '₹' + Math.round((v || 0) / 1e7).toLocaleString('en-IN') + ' Cr';
    const matches = (...vals) => vals.some(v => String(v || '').toLowerCase().includes(searchText.toLowerCase()));

    function toggleArr(arr, val) {
        let idx = arr.indexOf(val);
        idx === -1 ? arr.push(val) : arr.splice(idx, 1);
    }

    function resetAndLoad() {
        expandedHeads = []; expandedSubHeads = []; expandedQuarters = [];
        loadData();
    }

    /* ─────────────────────────────────────────
       LOAD DATA
    ───────────────────────────────────────── */
    function loadData() {
        let fy = fiscal_year_filter.get_value();
        if (!fy) return;

        let units = unit_filter.get_value() || [];
        $cards_section.empty();
        $pie_section.empty();
        $table_section.removeClass('visible');
        $loading.show();

        frappe.call({
            method: "annual_budget.api.phase_sheet.get_consolidated_report",
            args: {
                financial_year: fy,
                units:          units.join(","),
                cost_center:    cost_center_filter.get_value().join(","),
                location_code:  location_code_filter.get_value().join(",")
            },
            callback(r) {
                expense_heads = r.message || [];
                $loading.hide();
                renderCards(expense_heads);
                renderPieChart(expense_heads);
                renderTable();
                $table_section.addClass('visible');
            }
        });
    }

    /* ─────────────────────────────────────────
       RENDER CARDS  (left column)
    ───────────────────────────────────────── */
    // function renderCards(data) {
    //     $cards_section.empty();
    //     if (!data.length) return;

    //     let grand     = data.reduce((t, h) => t + sumAll(h), 0);
    //     let fy        = fiscal_year_filter.get_value() || '';
    //     let units     = unit_filter.get_value() || [];
    //     let headCount = data.length;

    //     /* Grand total card */
    //     $cards_section.append(`
    //         <div class="bps-section-label">Budget Summary</div>
    //         <div class="bps-grand-card">
    //             <div class="bps-grand-label">Grand Total Budget</div>
    //             <div class="bps-grand-value">${fmtINR(grand)}</div>
    //             <div class="bps-grand-meta">
    //                 <span>${headCount} Expense Head${headCount !== 1 ? 's' : ''}</span>
    //                 ${units.length ? '<span>·</span><span>' + units.length + ' Unit' + (units.length > 1 ? 's' : '') + '</span>' : ''}
    //                 <span class="bps-grand-badge">${fy}</span>
    //             </div>
    //         </div>
    //     `);

    //     /* Expense head cards — 2-col grid to fit the narrower left column */
    //     $cards_section.append(`<div class="bps-section-label">Expense Heads</div>`);
    //     let $mainRow = $(`<div class="bps-card-row"></div>`);
    //     data.forEach((head, i) => {
    //         let color = getAccent(i);
    //         let total = sumAll(head);
    //         let pct   = grand > 0 ? Math.round((total / grand) * 100) : 0;
    //         $mainRow.append(`
    //             <div class="bps-exp-card">
    //                 <div class="bps-exp-bar" style="background:${color};"></div>
    //                 <div class="bps-exp-label" title="${head.name}">${head.name}</div>
    //                 <div class="bps-exp-value">${fmtINR(total)}</div>
    //                 <div class="bps-exp-pct">${pct}% of total</div>
    //             </div>
    //         `);
    //     });
    //     $cards_section.append($mainRow);

    //     /* Sub-head groups */
    //     data.forEach((head, i) => {
    //         if (!head.sub_heads?.length) return;
    //         let color = getAccent(i);
    //         let $group = $(`<div class="bps-sub-group"></div>`);
    //         $group.append(`<span class="bps-group-label" style="border-left-color:${color};color:${color};">${head.name}</span>`);
    //         let $subRow = $(`<div class="bps-sub-row"></div>`);
    //         head.sub_heads.forEach(sub => {
    //             $subRow.append(`
    //                 <div class="bps-sub-card">
    //                     <div class="bps-sub-bar" style="background:${color};"></div>
    //                     <div class="bps-sub-label" title="${sub.name}">${sub.name}</div>
    //                     <div class="bps-sub-value">${fmtINR(sumAll(sub))}</div>
    //                 </div>
    //             `);
    //         });
    //         $group.append($subRow);
    //         $cards_section.append($group);
    //     });
    // }

    function renderCards(data) {
        $cards_section.empty();
        if (!data.length) return;

        let grand     = data.reduce((t, h) => t + sumAll(h), 0);
        let fy        = fiscal_year_filter.get_value() || '';
        let units     = unit_filter.get_value() || [];
        let headCount = data.length;

        /* Grand total card */
        $cards_section.append(`
            <div class="bps-section-label">Budget Summary</div>
            <div class="bps-grand-card">
                <div class="bps-grand-label">Grand Total Budget</div>
                <div class="bps-grand-value">${fmtINR(grand)}</div>
                <div class="bps-grand-meta">
                    <span>${headCount} Expense Head${headCount !== 1 ? 's' : ''}</span>
                    ${units.length ? '<span>·</span><span>' + units.length + ' Unit' + (units.length > 1 ? 's' : '') + '</span>' : ''}
                    <span class="bps-grand-badge">${fy}</span>
                </div>
            </div>
        `);

        /* Expense head cards — skip if total is 0 */
        $cards_section.append(`<div class="bps-section-label">Expense Heads</div>`);
        let $mainRow = $(`<div class="bps-card-row"></div>`);
        data.forEach((head, i) => {
            let total = sumAll(head);
            if (!total) return;                          // ← skip zero cards

            let color = getAccent(i);
            let pct   = grand > 0 ? Math.round((total / grand) * 100) : 0;
            $mainRow.append(`
                <div class="bps-exp-card">
                    <div class="bps-exp-bar" style="background:${color};"></div>
                    <div class="bps-exp-label" title="${head.name}">${head.name}</div>
                    <div class="bps-exp-value">${fmtINR(total)}</div>
                    <div class="bps-exp-pct">${pct}% of total</div>
                </div>
            `);
        });
        $cards_section.append($mainRow);

        /* Sub-head groups — skip entire group if head total is 0,
           skip individual sub-head cards if their total is 0        */
        data.forEach((head, i) => {
            if (!head.sub_heads?.length) return;
            if (!sumAll(head)) return;                   // ← skip zero head group

            let color  = getAccent(i);
            let $group = $(`<div class="bps-sub-group"></div>`);
            $group.append(`<span class="bps-group-label" style="border-left-color:${color};color:${color};">${head.name}</span>`);
            let $subRow = $(`<div class="bps-sub-row"></div>`);

            head.sub_heads.forEach(sub => {
                let subTotal = sumAll(sub);
                if (!subTotal) return;                   // ← skip zero sub-head cards

                $subRow.append(`
                    <div class="bps-sub-card">
                        <div class="bps-sub-bar" style="background:${color};"></div>
                        <div class="bps-sub-label" title="${sub.name}">${sub.name}</div>
                        <div class="bps-sub-value">${fmtINR(subTotal)}</div>
                    </div>
                `);
            });

            /* Only append the group if at least one sub-head had a non-zero value */
            if ($subRow.children().length) {
                $group.append($subRow);
                $cards_section.append($group);
            }
        });
    }
    /* ─────────────────────────────────────────
       RENDER PIE CHART  (right column)
    ───────────────────────────────────────── */
    function renderPieChart(data) {
        $pie_section.empty();
        if (!data.length) return;

        let grand = 0, grants = 0;
        data.forEach(head => {
            grand += sumAll(head);
            (head.items || []).forEach(item => {
                if (item.name === 'Grants & Donations') grants += sumAll(item);
            });
            (head.sub_heads || []).forEach(sub => {
                (sub.items || []).forEach(item => {
                    if (item.name === 'Grants & Donations') grants += sumAll(item);
                });
            });
        });

        let direct    = grand - grants;
        let directPct = grand > 0 ? Math.round((direct / grand) * 100) : 0;
        let grantPct  = grand > 0 ? Math.round((grants / grand) * 100) : 0;
        let fy        = fiscal_year_filter.get_value() || '';

        $pie_section.html(`
            <div class="bps-section-label">Grants & Direct Work</div>
            <div class="bps-pie-card">
                <div class="bps-pie-card-title">FY ${fy} — Grants &amp; Donations And Direct Work</div>
                <div class="bps-pie-canvas-wrap">
                    <canvas id="bps-pie-canvas" width="220" height="220"></canvas>
                </div>
                <div class="bps-pie-total-label">Total Budget</div>
                <div class="bps-pie-total-val">${fmtCr(grand)}</div>
                <div class="bps-pie-legend-row">
                    <div class="bps-pie-leg-item">
                        <span class="bps-pie-leg-dot" style="background:#185FA5;"></span>
                        Direct Work
                        <span class="bps-pie-leg-val">${fmtCr(direct)}</span>
                        <span class="bps-pie-leg-pct">${directPct}%</span>
                    </div>
                    <div class="bps-pie-leg-item">
                        <span class="bps-pie-leg-dot" style="background:#EF9F27;"></span>
                        Grants &amp; Donations
                        <span class="bps-pie-leg-val">${fmtCr(grants)}</span>
                        <span class="bps-pie-leg-pct">${grantPct}%</span>
                    </div>
                </div>
            </div>
        `);

        if (window._bpsPieChart) { window._bpsPieChart.destroy(); window._bpsPieChart = null; }

        function drawChart() {
            requestAnimationFrame(() => {
                let canvas = document.getElementById('bps-pie-canvas');
                if (!canvas) return;
                canvas.width = 220; canvas.height = 220;
                if (window.ChartDataLabels) Chart.register(ChartDataLabels);
                window._bpsPieChart = new Chart(canvas.getContext('2d'), {
                    type: 'pie',
                    data: {
                        labels: ['Direct Work', 'Grants & Donations'],
                        datasets: [{
                            data: [direct > 0 ? direct : 0.001, grants > 0 ? grants : 0.001],
                            backgroundColor: ['#185FA5', '#EF9F27'],
                            borderColor:     ['#185FA5', '#EF9F27'],
                            borderWidth: 0,
                            hoverOffset: 6
                        }]
                    },
                    options: {
                        responsive: false,
                        animation: { duration: 600 },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label(ctx) {
                                        let v = ctx.raw || 0;
                                        let pct = grand > 0 ? Math.round((v / grand) * 100) : 0;
                                        return ' ' + fmtCr(v) + '  (' + pct + '%)';
                                    }
                                }
                            },
                            datalabels: window.ChartDataLabels ? {
                                color: '#fff',
                                font: { size: 16, weight: '500' },
                                formatter(val) { return val < 1 ? '' : fmtCr(val); },
                                textAlign: 'center',
                                anchor: 'center',
                                align: 'center'
                            } : undefined
                        }
                    }
                });
            });
        }

        function loadAndDraw() {
            if (window.ChartDataLabels) { drawChart(); return; }
            let dl = document.createElement('script');
            dl.src = 'https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-datalabels/2.2.0/chartjs-plugin-datalabels.min.js';
            dl.onload = drawChart; dl.onerror = drawChart;
            document.head.appendChild(dl);
        }

        if (window.Chart) {
            loadAndDraw();
        } else {
            let s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
            s.onload = loadAndDraw;
            document.head.appendChild(s);
        }
    }

    /* ─────────────────────────────────────────
       RENDER TABLE
    ───────────────────────────────────────── */
    function renderTable() {
        let $table = $('#phase-table');
        $table.empty();

        let $thead   = $('<thead></thead>');
        let $mainRow = $('<tr class="main-row"></tr>');
        $mainRow.append('<th rowspan="2">Expense Head / Line Item</th><th rowspan="2">GL Code</th>');

        ['q1','q2','q3','q4'].forEach(q => {
            let exp = expandedQuarters.includes(q);
            $mainRow.append(`
                <th class="expandable" data-quarter="${q}" colspan="3" rowspan="${exp ? 1 : 2}">
                    ${quarters[q].label} ${exp ? '▲' : '▼'}
                </th>
            `);
        });
        $mainRow.append('<th rowspan="2">Total</th>');
        $thead.append($mainRow);

        if (expandedQuarters.length) {
            let $subRow = $('<tr class="sub-row"></tr>');
            ['q1','q2','q3','q4'].forEach(q => {
                if (expandedQuarters.includes(q))
                    quarters[q].months.forEach(m => $subRow.append(`<th>${m}</th>`));
            });
            $thead.append($subRow);
        }
        $table.append($thead);

        let $tbody = $('<tbody></tbody>');

        expense_heads.forEach(head => {
            let visible = matches(head.name)
                || (head.items || []).some(i => matches(i.name, i.gl_code))
                || (head.sub_heads || []).some(s => matches(s.name) || (s.items || []).some(i => matches(i.name, i.gl_code)));
            if (!visible) return;

            $tbody.append(buildHeadRow(head));
            if (!expandedHeads.includes(head.name)) return;

            (head.items || []).filter(it => matches(it.name, it.gl_code))
                .forEach(it => $tbody.append(buildItemRow(it)));

            (head.sub_heads || [])
                .filter(s => matches(s.name) || (s.items || []).some(i => matches(i.name, i.gl_code)))
                .forEach(sub => {
                    let key = `${head.name}__${sub.name}`;
                    $tbody.append(buildSubHeadRow(sub, key));
                    if (expandedSubHeads.includes(key))
                        (sub.items || []).filter(i => matches(i.name, i.gl_code))
                            .forEach(it => $tbody.append(buildItemRow(it)));
                });
        });

        let grand = getGrandTotals();
        let $gr   = $('<tr class="grand-total-row"></tr>');
        $gr.append('<td colspan="2" style="text-align:left;">GRAND TOTAL</td>');
        ['q1','q2','q3','q4'].forEach(q => {
            if (expandedQuarters.includes(q))
                grand[q].forEach(v => $gr.append(`<td>${fmtNum(v)}</td>`));
            else
                $gr.append(`<td colspan="3">${fmtNum(sumQ(grand[q]))}</td>`);
        });
        $gr.append(`<td>${fmtNum(grand.total)}</td>`);
        $tbody.append($gr);
        $table.append($tbody);

        $table.find('th.expandable').off('click').on('click', function () {
            toggleArr(expandedQuarters, $(this).data('quarter'));
            $("#expand-quarters").prop("checked", expandedQuarters.length === 4);
            renderTable();
        });
        $table.find('.expense-head').off('click').on('click', function () {
            toggleArr(expandedHeads, $(this).data('head'));
            $("#expand-items").prop("checked", expandedHeads.length === expense_heads.length);
            renderTable();
        });
        $table.find('.sub-head').off('click').on('click', function () {
            toggleArr(expandedSubHeads, $(this).data('sub'));
            renderTable();
        });
    }

    function qCells(obj) {
        return ['q1','q2','q3','q4'].map(q =>
            expandedQuarters.includes(q)
                ? (obj[q] || []).map(v => `<td>${fmtNum(v)}</td>`).join('')
                : `<td colspan="3">${fmtNum(sumQ(obj[q]))}</td>`
        ).join('');
    }

    function buildHeadRow(head) {
        return `<tr class="expense-head" data-head="${head.name}">
            <td>${expandedHeads.includes(head.name) ? '▼' : '▶'} ${head.name}</td>
            <td class="gl-empty">-</td>
            ${qCells(head)}
            <td class="text-blue">${fmtNum(sumAll(head))}</td>
        </tr>`;
    }

    function buildSubHeadRow(sub, key) {
        return `<tr class="sub-head" data-sub="${key}">
            <td>${expandedSubHeads.includes(key) ? '▼' : '▶'} ${sub.name}</td>
            <td class="gl-empty">-</td>
            ${qCells(sub)}
            <td class="text-blue">${fmtNum(sumAll(sub))}</td>
        </tr>`;
    }

    function buildItemRow(item) {
        return `<tr class="line-item">
            <td>${item.name}</td>
            <td>${item.gl_code}</td>
            ${qCells(item)}
            <td>${fmtNum(sumAll(item))}</td>
        </tr>`;
    }

    function getGrandTotals() {
        let t = { q1:[0,0,0], q2:[0,0,0], q3:[0,0,0], q4:[0,0,0], total:0 };
        expense_heads.forEach(h =>
            ['q1','q2','q3','q4'].forEach(q =>
                (h[q] || []).forEach((v, i) => { t[q][i] += v||0; t.total += v||0; })
            )
        );
        return t;
    }

    /* ─────────────────────────────────────────
       CHECKBOX + SEARCH EVENTS
    ───────────────────────────────────────── */
    $(page.body).on("change", "#expand-quarters", function () {
        expandedQuarters = this.checked ? ['q1','q2','q3','q4'] : [];
        renderTable();
    });

    $(page.body).on("change", "#expand-items", function () {
        if (this.checked) {
            expandedHeads    = expense_heads.map(h => h.name);
            expandedSubHeads = expense_heads.flatMap(h => (h.sub_heads || []).map(s => `${h.name}__${s.name}`));
        } else {
            expandedHeads = []; expandedSubHeads = [];
        }
        renderTable();
    });

    $(page.body).on("input", "#global-search-box", function () {
        searchText = this.value;
        renderTable();
    });
};