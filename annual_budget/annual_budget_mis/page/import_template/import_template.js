// // frappe.pages['import-template'].on_page_load = function(wrapper) {

// // 	let page = frappe.ui.make_app_page({
// // 		parent: wrapper,
// // 		title: 'Budget Import Template',
// // 		single_column: true
// // 	});

// // 	let $container = $(wrapper).find('.layout-main-section');
// // 	$container.addClass("budget-import-wrapper");

// // 	inject_styles();

// // 	$container.html(`<div class="loading-state">Loading Data...</div>`);

// // 	frappe.call({
// // 		method: "annual_budget.api.filter_options.get_user_mappings",
// // 		callback: function(r) {

// // 			if (!r.message || r.message.length === 0) {
// // 				$container.html(`<div class="empty-state">No Data Found</div>`);
// // 				return;
// // 			}

// // 			render_content($container, r.message);
// // 		}
// // 	});
// // };


// // /* =========================================
// //    RENDER CONTENT
// // ========================================= */

// // function render_content(container, data) {

// // 	let grouped = {};
// // 	let roles = frappe.user_roles || [];

// // 	data.forEach(row => {
// // 		let name = row.full_name || row.user;

// // 		if (!grouped[name]) {
// // 			grouped[name] = {
// // 				email: row.user,
// // 				rows: []
// // 			};
// // 		}

// // 		grouped[name].rows.push(row);
// // 	});

// // 	container.empty();

// // 	Object.keys(grouped).forEach(user => {

// // 		let userData = grouped[user];

// // 		let isFinanceCoordinator = roles.includes("Finance Unit Coordinator");
// // 		let isSystemManager = roles.includes("System Manager");

// // 		/* ===============================
// // 		   USER SECTION
// // 		=============================== */

// // 		let section = $(`
// // 			<div class="user-section">

// // 				<div class="user-header">
// // 					<div>
// // 						<div class="user-name">${user}</div>
// // 						<div class="user-email">${userData.email}</div>
// // 					</div>

// // 					<div class="button-container"></div>
// // 				</div>

// // 				<div class="user-body"></div>

// // 			</div>
// // 		`);

// // 		container.append(section);
// // /* =====================================================
// //    PROFESSIONAL CONFIRM DOWNLOAD MODAL
// //    (APPENDS ONLY ONCE)
// // ===================================================== */

// // // if (!$("#pro-confirm-overlay").length) {

// // // 	$("body").append(`
// // // 	<div id="pro-confirm-overlay">
// // // 		<div class="pro-confirm-box">

// // // 			<div class="pro-confirm-header">
// // // 				<div class="pro-confirm-title">
// // // 					⚠ Confirm Download
// // // 				</div>
// // // 				<span id="pro-confirm-close">&times;</span>
// // // 			</div>

// // // 			<div class="pro-confirm-body">
// // // 				<div class="pro-warning-text">
// // // 					We request that you carefully review and validate all allocated Units, Cost Centers, and Location Codes before downloading the Budget Import Template.
// // // 				</div>

// // // 				<div class="pro-warning-sub">
// // // 					Do not proceed unless everything is reviewed and confirmed.
// // // 				</div>

// // // 				<div class="pro-checkbox-wrapper">
// // // 					<label>
// // // 						<input type="checkbox" id="pro-confirm-checkbox">
// // // 						I confirm that I have verified all details carefully.
// // // 					</label>
// // // 				</div>
// // // 			</div>

// // // 			<div class="pro-confirm-footer">
// // // 				<button id="pro-confirm-no" class="btn btn-default btn-sm">
// // // 					Cancel
// // // 				</button>
// // // 				<button id="pro-confirm-yes" 
// // // 						class="btn btn-primary btn-sm" 
// // // 						disabled>
// // // 					Proceed to Download
// // // 				</button>
// // // 			</div>

// // // 		</div>
// // // 	</div>

// // // 	<style>

// // // 	#pro-confirm-overlay {
// // // 		position: fixed;
// // // 		top: 0;
// // // 		left: 0;
// // // 		width: 100%;
// // // 		height: 100%;
// // // 		background: rgba(0,0,0,0.45);
// // // 		display: none;
// // // 		align-items: center;
// // // 		justify-content: center;
// // // 		z-index: 9999;
// // // 		backdrop-filter: blur(3px);
// // // 	}

// // // 	.pro-confirm-box {
// // // 		background: #ffffff;
// // // 		width: 460px;
// // // 		border-radius: 10px;
// // // 		box-shadow: 0 15px 40px rgba(0,0,0,0.25);
// // // 		padding: 25px;
// // // 		animation: scaleIn 0.2s ease;
// // // 	}

// // // 	@keyframes scaleIn {
// // // 		from { transform: scale(0.95); opacity: 0; }
// // // 		to { transform: scale(1); opacity: 1; }
// // // 	}

// // // 	.pro-confirm-header {
// // // 		display: flex;
// // // 		justify-content: space-between;
// // // 		align-items: center;
// // // 		font-weight: 600;
// // // 		font-size: 16px;
// // // 		margin-bottom: 15px;
// // // 	}

// // // 	#pro-confirm-close {
// // // 		cursor: pointer;
// // // 		font-size: 20px;
// // // 		color: #888;
// // // 	}

// // // 	.pro-warning-text {
// // // 		font-weight: 600;
// // // 		color: #c0392b;
// // // 		margin-bottom: 8px;
// // // 	}

// // // 	.pro-warning-sub {
// // // 		font-size: 14px;
// // // 		color: #555;
// // // 		margin-bottom: 20px;
// // // 	}

// // // 	.pro-checkbox-wrapper {
// // // 		background: #f8f9fa;
// // // 		padding: 12px;
// // // 		border-radius: 6px;
// // // 		border: 1px solid #e0e0e0;
// // // 		font-size: 13px;
// // // 	}

// // // 	.pro-checkbox-wrapper input {
// // // 		margin-right: 8px;
// // // 	}

// // // 	.pro-confirm-footer {
// // // 		text-align: right;
// // // 		margin-top: 20px;
// // // 	}

// // // 	.pro-confirm-footer button {
// // // 		margin-left: 10px;
// // // 		min-width: 140px;
// // // 	}

// // // 	#pro-confirm-yes:disabled {
// // // 		opacity: 0.6;
// // // 		cursor: not-allowed;
// // // 	}

// // // 	</style>
// // // 	`);
// // // }

// // if (!$("#pro-confirm-overlay").length) {

// //     $("body").append(`
// //     <div id="pro-confirm-overlay">
// //         <div class="pro-confirm-box">

// //             <div class="pro-confirm-header">
// //                 <div class="pro-confirm-title">
// //                     <i class="fa fa-download"></i> Confirm Download
// //                 </div>
// //                 <span id="pro-confirm-close">&times;</span>
// //             </div>

// //             <div class="pro-confirm-body">

// //                 <div class="pro-warning-icon">
// //                     <i class="fa fa-exclamation-triangle"></i>
// //                 </div>

// //                 <div class="pro-warning-text">
// //                    We request that you carefully review and validate all allocated Units, Cost Centers, and Location Codes before downloading the Budget Import Template.
// //                 </div>

// //                 <div class="pro-warning-sub">
// //                     Do not proceed unless everything has been reviewed and confirmed.
// //                 </div>

// //                 <div class="pro-checkbox-wrapper">
// //                     <label class="pro-checkbox-label">
// //                         <input type="checkbox" id="pro-confirm-checkbox">
// //                         <span>
// //                             <i class="fa fa-check-circle"></i>
// //                             I confirm that I have verified all details carefully.
// //                         </span>
// //                     </label>
// //                 </div>

// //             </div>

// //             <div class="pro-confirm-footer">
// //                 <button id="pro-confirm-no" class="btn btn-default btn-sm">
// //                     <i class="fa fa-times"></i> Cancel
// //                 </button>
// //                 <button id="pro-confirm-yes" 
// //                         class="btn btn-primary btn-sm" 
// //                         disabled>
// //                     <i class="fa fa-download"></i> Proceed to Download
// //                 </button>
// //             </div>

// //         </div>
// //     </div>

// //     <style>

// //     #pro-confirm-overlay {
// //         position: fixed;
// //         top: 0;
// //         left: 0;
// //         width: 100%;
// //         height: 100%;
// //         background: rgba(0,0,0,0.5);
// //         display: none;
// //         align-items: center;
// //         justify-content: center;
// //         z-index: 9999;
// //         backdrop-filter: blur(4px);
// //         padding: 15px;
// //     }

// //     .pro-confirm-box {
// //         background: #ffffff;
// //         width: 640px;
// //         max-width: 100%;
// //         min-height: 360px;
// //         border-radius: 12px;
// //         box-shadow: 0 25px 60px rgba(0,0,0,0.25);
// //         padding: 35px;
// //         animation: scaleIn 0.25s ease;
// //     }

// //     @keyframes scaleIn {
// //         from { transform: scale(0.95); opacity: 0; }
// //         to { transform: scale(1); opacity: 1; }
// //     }

// //     .pro-confirm-header {
// //         display: flex;
// //         justify-content: space-between;
// //         align-items: center;
// //         font-weight: 600;
// //         font-size: 18px;
// //         margin-bottom: 25px;
// //     }

// //     .pro-confirm-title i {
// //         margin-right: 8px;
// //         color: #007bff;
// //     }

// //     #pro-confirm-close {
// //         cursor: pointer;
// //         font-size: 22px;
// //         color: #888;
// //         transition: 0.2s;
// //     }

// //     #pro-confirm-close:hover {
// //         color: #000;
// //     }

// //     .pro-confirm-body {
// //         text-align: center;
// //         margin-bottom: 25px;
// //     }

// //     .pro-warning-icon {
// //         font-size: 42px;
// //         color: #e74c3c;
// //         margin-bottom: 15px;
// //     }

// //     .pro-warning-text {
// //         font-weight: 600;
// //         font-size: 16px;
// //         color: #c0392b;
// //         margin-bottom: 15px;
// //         line-height: 1.6;
// //     }

// //     .pro-warning-sub {
// //         font-size: 14px;
// //         color: #555;
// //         margin-bottom: 25px;
// //         line-height: 1.6;
// //     }

// //     .pro-checkbox-wrapper {
// //         background: #f8f9fa;
// //         padding: 18px;
// //         border-radius: 8px;
// //         border: 1px solid #e0e0e0;
// //         font-size: 14px;
// //         text-align: left;
// //     }

// //     .pro-checkbox-label {
// //         display: flex;
// //         align-items: flex-start;
// //         gap: 10px;
// //         cursor: pointer;
// //     }

// //     .pro-checkbox-label i {
// //         color: #28a745;
// //         margin-right: 6px;
// //     }

// //     .pro-checkbox-wrapper input {
// //         margin-top: 4px;
// //         transform: scale(1.1);
// //     }

// //     .pro-confirm-footer {
// //         text-align: right;
// //         margin-top: 20px;
// //     }

// //     .pro-confirm-footer button {
// //         margin-left: 12px;
// //         min-width: 170px;
// //     }

// //     #pro-confirm-yes:disabled {
// //         opacity: 0.6;
// //         cursor: not-allowed;
// //     }

// //     /* ===================== */
// //     /* Mobile Responsive */
// //     /* ===================== */

// //     @media (max-width: 576px) {

// //         .pro-confirm-box {
// //             width: 100%;
// //             min-height: auto;
// //             padding: 25px;
// //         }

// //         .pro-confirm-header {
// //             font-size: 16px;
// //         }

// //         .pro-warning-text {
// //             font-size: 15px;
// //         }

// //         .pro-confirm-footer {
// //             text-align: center;
// //         }

// //         .pro-confirm-footer button {
// //             width: 100%;
// //             margin: 8px 0;
// //         }
// //     }

// //     </style>
// //     `);
// // }


// // /* =====================================================
// //    DOWNLOAD BUTTON
// // ===================================================== */

// // let downloadBtn = $(`
// // 	<button class="btn btn-primary btn-sm">
// // 		Download Budget Import Template
// // 	</button>
// // `);

// // section.find(".button-container").append(downloadBtn);


// // /* =====================================================
// //    OPEN MODAL ON BUTTON CLICK
// // ===================================================== */

// // downloadBtn.on("click", function () {

// // 	$("#pro-confirm-overlay")
// // 		.css("display", "flex")
// // 		.data("trigger-btn", $(this));

// // 	// reset checkbox
// // 	$("#pro-confirm-checkbox").prop("checked", false);
// // 	$("#pro-confirm-yes").prop("disabled", true);
// // });


// // /* =====================================================
// //    ENABLE PROCEED BUTTON ONLY AFTER CHECKBOX
// // ===================================================== */

// // $(document).on("change", "#pro-confirm-checkbox", function () {
// // 	$("#pro-confirm-yes").prop("disabled", !this.checked);
// // });


// // /* =====================================================
// //    CLOSE MODAL
// // ===================================================== */

// // $(document).on("click", "#pro-confirm-no, #pro-confirm-close", function () {
// // 	$("#pro-confirm-overlay").hide();
// // });


// // /* =====================================================
// //    CONFIRM & DOWNLOAD
// // ===================================================== */

// // $(document).on("click", "#pro-confirm-yes", function () {

// // 	let btn = $("#pro-confirm-overlay").data("trigger-btn");

// // 	$("#pro-confirm-overlay").hide();

// // 	if (!btn) return;

// // 	btn.prop("disabled", true)
// // 	   .html('<i class="fa fa-spinner fa-spin"></i> Downloading...');

// // 	window.open(
// // 		`/api/method/annual_budget.api.export_reports.download_finance_budget_import_template?user=${encodeURIComponent(userData.email)}`
// // 	);

// // 	setTimeout(() => {
// // 		btn.prop("disabled", false)
// // 		   .text("Download Budget Import Template");
// // 	}, 3000);
// // });


// // /* =====================================================
// //    CONTINUE YOUR PAGE LOGIC
// // ===================================================== */

// // let body = section.find(".user-body");

// // 		/* ===============================
// // 		   IMPORTANT NOTE + CONTACT CARDS
// // 		=============================== */

// // 		if (isFinanceCoordinator && !isSystemManager) {

// // 			body.append(`
// // 				<div class="note-warning">

// // 					<div class="note-header">
// // 						<span class="note-badge blinking-badge">IMPORTANT</span>
// // 						Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below.
// // 						If you notice any discrepancies, contact the support team immediately.
// // 						Do not proceed with the import until all details are verified and confirmed.
// // 					</div>

// // 					<div class="contact-wrapper">
// // 						<div class="contact-card">
// // 							<div class="contact-name">Rakesh Ahuja</div>
// // 							<div class="contact-detail">
// // 								rakesh.ahuja@azimpremjifoundation.org
// // 							</div>
// // 							<div class="contact-detail">
// // 								+91 7022068106
// // 							</div>
// // 						</div>

// // 						<div class="contact-card">
// // 							<div class="contact-name">Saravana G</div>
// // 							<div class="contact-detail">
// // 								saravana.g@azimpremjifoundation.org
// // 							</div>
// // 							<div class="contact-detail">
// // 								+91 9380861952
// // 							</div>
// // 						</div>

// // 						<div class="contact-card">
// // 							<div class="contact-name">Augustin Moses R</div>
// // 							<div class="contact-detail">
// // 								augustin.moses@azimpremjifoundation.org
// // 							</div>
// // 							<div class="contact-detail">
// // 								+91 8667719594
// // 							</div>
// // 						</div>

// // 						<div class="contact-card">
// // 							<div class="contact-name">Mercy Selvanayagi R</div>
// // 							<div class="contact-detail">
// // 								mercy.selvanayagi@azimpremjifoundation.org
// // 							</div>
// // 							<div class="contact-detail">
// // 								+91 9047828687
// // 							</div>
// // 						</div>

// // 						<div class="contact-card">
// // 							<div class="contact-name">Mahaveer Ram P</div>
// // 							<div class="contact-detail">
// // 								mahaveer.p@azimpremjifoundation.org
// // 							</div>
// // 							<div class="contact-detail">
// // 								+91 8825879412
// // 							</div>
// // 						</div>
// // 					</div>

// // 				</div>
// // 			`);
// // 		}

// // 		/* ===============================
// // 		   TABLE
// // 		=============================== */

// // 		let tableHTML = `
// // 			<h4 class="table-title">
// // 				Allocated Units & Cost Centers
// // 			</h4>

// // 			<div class="table-wrapper">
// // 				<table class="mis-table">
// // 					<thead>
// // 						<tr>
// // 							<th>Unit</th>
// // 							<th>Unit Description</th>
// // 							<th>Cost Center</th>
// // 							<th>Cost Center Description</th>
// // 							<th>Location Code</th>
// // 							<th>Location Description</th>
// // 						</tr>
// // 					</thead>
// // 					<tbody>
// // 		`;

// // 		userData.rows.forEach(r => {
// // 			tableHTML += `
// // 				<tr>
// // 					<td>${r.unit || ""}</td>
// // 					<td>${r.unit_description || ""}</td>
// // 					<td>${r.cost_center || ""}</td>
// // 					<td>${r.cost_center_description || ""}</td>
// // 					<td>${r.location_code || ""}</td>
// // 					<td>${r.location_description || ""}</td>
// // 				</tr>
// // 			`;
// // 		});

// // 		tableHTML += `
// // 					</tbody>
// // 				</table>
// // 			</div>
// // 		`;

// // 		body.append(tableHTML);
// // 	});
// // }


// // /* =========================================
// //    STYLES
// // ========================================= */

// // function inject_styles() {

// // 	if (document.getElementById("allocation-style")) return;

// // 	const style = document.createElement("style");
// // 	style.id = "allocation-style";

// // 	style.innerHTML = `

// // 	/* PAGE WHITE BACKGROUND */
// // 	.budget-import-wrapper {
// // 		padding: 25px;
// // 		background: #ffffff;
// // 		min-height: 100vh;
// // 	}

// // 	.loading-state,
// // 	.empty-state {
// // 		text-align: center;
// // 		padding: 50px;
// // 		font-weight: 600;
// // 		color: #0076B6;
// // 	}

// // 	.user-section {
// // 		margin-bottom: 50px;
// // 	}

// // 	.user-header {
// // 		display: flex;
// // 		justify-content: space-between;
// // 		align-items: center;
// // 		padding-bottom: 12px;
// // 		border-bottom: 2px solid #0076B6;
// // 		margin-bottom: 18px;
// // 	}

// // 	.user-name {
// // 		font-size: 18px;
// // 		font-weight: 700;
// // 		color: #003B63;
// // 	}

// // 	.user-email {
// // 		font-size: 13px;
// // 		color: #555;
// // 	}

// // 	/* IMPORTANT NOTE */
// // 	.note-warning {
// // 		background: #fff8e1;
// // 		border-left: 5px solid #f4b400;
// // 		padding: 16px;
// // 		border-radius: 6px;
// // 		margin-bottom: 25px;
// // 	}

// // 	.note-header {
// // 		font-size: 14px;
// // 		color: #5c4b00;
// // 		margin-bottom: 15px;
// // 	}

// // 	.note-badge {
// // 		background: #f4b400;
// // 		color: #fff;
// // 		font-size: 11px;
// // 		font-weight: 700;
// // 		padding: 3px 8px;
// // 		border-radius: 20px;
// // 		margin-right: 8px;
// // 	}

// // 	.blinking-badge {
// // 		animation: softBlink 1.5s ease-in-out infinite;
// // 	}

// // 	@keyframes softBlink {
// // 		0% { opacity: 1; }
// // 		50% { opacity: 0.5; }
// // 		100% { opacity: 1; }
// // 	}

// // 	/* CONTACT CARDS */
// // 	.contact-wrapper {
// // 		display: flex;
// // 		gap: 15px;
// // 		flex-wrap: wrap;
// // 	}

// // 	.contact-card {
// // 		background: #ffffff;
// // 		border: 1px solid #e6e6e6;
// // 		border-radius: 8px;
// // 		padding: 12px 15px;
// // 		min-width: 230px;
// // 		box-shadow: 0 3px 10px rgba(0,0,0,0.04);
// // 	}

// // 	.contact-name {
// // 		font-weight: 600;
// // 		color: #333;
// // 		margin-bottom: 5px;
// // 	}

// // 	.contact-detail {
// // 		font-size: 13px;
// // 		color: #555;
// // 	}

// // 	/* TABLE */
// // 	.table-title {
// // 		font-size: 15px;
// // 		font-weight: 600;
// // 		color: #003B63;
// // 		margin-bottom: 12px;
// // 	}

// // 	.table-wrapper {
// // 		overflow-x: auto;
// // 	}

// // 	.mis-table {
// // 		width: 100%;
// // 		border-collapse: collapse;
// // 		font-size: 13px;
// // 		border: 1px solid #dcdcdc;
// // 	}

// // 	.mis-table th {
// // 		background: #0076B6;
// // 		color: #ffffff;
// // 		font-weight: 700;
// // 		padding: 8px;
// // 		text-align: center;
// // 	}

// // 	.mis-table td {
// // 		padding: 8px;
// // 		border: 1px solid #e0e0e0;
// // 		text-align: center;
// // 	}

// // 	.mis-table tr:nth-child(even) {
// // 		background: #f9f9f9;
// // 	}

// // 	.mis-table tr:hover {
// // 		background: #eef6fb;
// // 	}

// // 	@media (max-width: 768px) {
// // 		.user-header {
// // 			flex-direction: column;
// // 			align-items: flex-start;
// // 			gap: 10px;
// // 		}
// // 	}
// // 	`;

// // 	document.head.appendChild(style);
// // }



// frappe.pages['import-template'].on_page_load = function(wrapper) {

// 	let page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Budget Import Template',
// 		single_column: true
// 	});

// 	let $container = $(wrapper).find('.layout-main-section');
// 	$container.addClass("budget-import-wrapper");

// 	inject_styles();

// 	$container.html(`<div class="loading-state">Loading Data...</div>`);

// 	frappe.call({
// 		method: "annual_budget.api.filter_options.get_user_mappings",
// 		callback: function(r) {

// 			if (!r.message || r.message.length === 0) {
// 				$container.html(`<div class="empty-state">No Data Found</div>`);
// 				return;
// 			}

// 			render_content($container, r.message);
// 		}
// 	});
// };


// /* =========================================
//    RENDER CONTENT
// ========================================= */

// function render_content(container, data) {

// 	let grouped = {};

// 	// FIX: Safely read roles once, outside the loop
// 	let roles = (frappe.user_roles && Array.isArray(frappe.user_roles))
// 		? frappe.user_roles
// 		: [];

// 	let isFinanceCoordinator = roles.includes("Finance Unit Coordinator");
// 	let isSystemManager      = roles.includes("System Manager");

// 	data.forEach(row => {
// 		let key = row.user; // always use email as unique key

// 		if (!grouped[key]) {
// 			grouped[key] = {
// 				user_fullname: row.user_fullname || "",
// 				email: row.user,
// 				rows: []
// 			};
// 		}

// 		grouped[key].rows.push(row);
// 	});

// 	container.empty();

// 	/* =====================================================
// 	   GLOBAL SEARCH BAR  (rendered once, above all sections)
// 	===================================================== */
// 	let $searchWrap = $(`
// 		<div class="global-search-wrap">
// 			<div class="global-search-inner">
// 				<i class="fa fa-search global-search-icon"></i>
// 				<input
// 					type="text"
// 					id="global-table-search"
// 					class="global-search-input"
// 					placeholder="Search across all units, cost centers, locations…"
// 					autocomplete="off"
// 				/>
// 				<span id="global-search-clear" class="global-search-clear" title="Clear search">&times;</span>
// 			</div>
// 			<div id="global-search-count" class="global-search-count"></div>
// 		</div>
// 	`);
// 	container.append($searchWrap);

// 	/* =====================================================
// 	   CONFIRM DOWNLOAD MODAL  (appended once to body)
// 	===================================================== */
// 	if (!$("#pro-confirm-overlay").length) {

// 		$("body").append(`
// 		<div id="pro-confirm-overlay">
// 			<div class="pro-confirm-box">

// 				<div class="pro-confirm-header">
// 					<div class="pro-confirm-title">
// 						<i class="fa fa-download"></i> Confirm Download
// 					</div>
// 					<span id="pro-confirm-close">&times;</span>
// 				</div>

// 				<div class="pro-confirm-body">

// 					<div class="pro-warning-icon">
// 						<i class="fa fa-exclamation-triangle"></i>
// 					</div>

// 					<div class="pro-warning-text">
// 						We request that you carefully review and validate all allocated Units, Cost Centers, and Location Codes before downloading the Budget Import Template.
// 					</div>

// 					<div class="pro-warning-sub">
// 						Do not proceed unless everything has been reviewed and confirmed.
// 					</div>

// 					<div class="pro-checkbox-wrapper">
// 						<label class="pro-checkbox-label">
// 							<input type="checkbox" id="pro-confirm-checkbox">
// 							<span>
// 								<i class="fa fa-check-circle"></i>
// 								I confirm that I have verified all details carefully.
// 							</span>
// 						</label>
// 					</div>

// 				</div>

// 				<div class="pro-confirm-footer">
// 					<button id="pro-confirm-no" class="btn btn-default btn-sm">
// 						<i class="fa fa-times"></i> Cancel
// 					</button>
// 					<button id="pro-confirm-yes"
// 							class="btn btn-primary btn-sm"
// 							disabled>
// 						<i class="fa fa-download"></i> Proceed to Download
// 					</button>
// 				</div>

// 			</div>
// 		</div>
// 		`);
// 	}

// 	/* =====================================================
// 	   MODAL EVENT LISTENERS  (registered once, outside loop)
// 	===================================================== */

// 	// Enable/disable Proceed button based on checkbox
// 	$(document).off("change.budgetModal", "#pro-confirm-checkbox")
// 		.on("change.budgetModal", "#pro-confirm-checkbox", function () {
// 			$("#pro-confirm-yes").prop("disabled", !this.checked);
// 		});

// 	// Close modal
// 	$(document).off("click.budgetModal", "#pro-confirm-no, #pro-confirm-close")
// 		.on("click.budgetModal", "#pro-confirm-no, #pro-confirm-close", function () {
// 			$("#pro-confirm-overlay").hide();
// 		});

// 	// Close on overlay background click
// 	$(document).off("click.budgetModalBg", "#pro-confirm-overlay")
// 		.on("click.budgetModalBg", "#pro-confirm-overlay", function (e) {
// 			if ($(e.target).is("#pro-confirm-overlay")) {
// 				$("#pro-confirm-overlay").hide();
// 			}
// 		});

// 	// Confirm & download
// 	$(document).off("click.budgetModalYes", "#pro-confirm-yes")
// 		.on("click.budgetModalYes", "#pro-confirm-yes", function () {

// 			let btn      = $("#pro-confirm-overlay").data("trigger-btn");
// 			let userEmail = $("#pro-confirm-overlay").data("user-email");

// 			$("#pro-confirm-overlay").hide();

// 			if (!btn || !userEmail) return;

// 			btn.prop("disabled", true)
// 			   .html('<i class="fa fa-spinner fa-spin"></i> Downloading...');

// 			window.open(
// 				`/api/method/annual_budget.api.export_reports.download_finance_budget_import_template?user=${encodeURIComponent(userEmail)}`
// 			);

// 			setTimeout(() => {
// 				btn.prop("disabled", false)
// 				   .text("Download Budget Import Template");
// 			}, 3000);
// 		});


// 	/* =====================================================
// 	   BUILD USER SECTIONS
// 	===================================================== */

// 	Object.keys(grouped).forEach(user => {

// 		let userData = grouped[user];
// 		let displayName = userData.user_fullname || userData.email;

// 		/* ===============================
// 		   USER SECTION
// 		=============================== */
// 		let section = $(`
// 			<div class="user-section" data-user="${user}">

// 				<div class="user-header">
// 					<div>
// 						<div class="user-name">${displayName}</div>
// 						<div class="user-email">${userData.email}</div>
// 					</div>

// 					<div class="button-container"></div>
// 				</div>

// 				<div class="user-body"></div>

// 			</div>
// 		`);

// 		container.append(section);

// 		/* =====================================================
// 		   DOWNLOAD BUTTON
// 		===================================================== */
// 		let downloadBtn = $(`
// 			<button class="btn btn-primary btn-sm">
// 				<i class="fa fa-download"></i> Download Budget Import Template
// 			</button>
// 		`);

// 		section.find(".button-container").append(downloadBtn);

// 		if (isFinanceCoordinator && !isSystemManager) {

// 			// Finance Coordinator: open confirmation modal first
// 			downloadBtn.on("click", function () {
// 				$("#pro-confirm-overlay")
// 					.css("display", "flex")
// 					.data("trigger-btn", $(this))
// 					.data("user-email", userData.email);

// 				// Reset modal state
// 				$("#pro-confirm-checkbox").prop("checked", false);
// 				$("#pro-confirm-yes").prop("disabled", true);
// 			});

// 		} else {

// 			// All other roles: direct download, no modal
// 			downloadBtn.on("click", function () {
// 				let btn = $(this);

// 				btn.prop("disabled", true)
// 				   .html('<i class="fa fa-spinner fa-spin"></i> Downloading...');

// 				window.open(
// 					`/api/method/annual_budget.api.export_reports.download_finance_budget_import_template?user=${encodeURIComponent(userData.email)}`
// 				);

// 				setTimeout(() => {
// 					btn.prop("disabled", false)
// 					   .html('<i class="fa fa-download"></i> Download Budget Import Template');
// 				}, 3000);
// 			});
// 		}


// 		let body = section.find(".user-body");

// 		/* ===============================
// 		   IMPORTANT NOTE + CONTACT CARDS
// 		=============================== */
// 		if (isFinanceCoordinator && !isSystemManager) {

// 			body.append(`
// 				<div class="note-warning">

// 					<div class="note-header">
// 						<span class="note-badge blinking-badge">IMPORTANT</span>
// 						Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below.
// 						If you notice any discrepancies, contact the support team immediately.
// 						Do not proceed with the import until all details are verified and confirmed.
// 					</div>

// 					<div class="contact-wrapper">
// 						<div class="contact-card">
// 							<div class="contact-name">Rakesh Ahuja</div>
// 							<div class="contact-detail">rakesh.ahuja@azimpremjifoundation.org</div>
// 							<div class="contact-detail">+91 7022068106</div>
// 						</div>

// 						<div class="contact-card">
// 							<div class="contact-name">Saravana G</div>
// 							<div class="contact-detail">saravana.g@azimpremjifoundation.org</div>
// 							<div class="contact-detail">+91 9380861952</div>
// 						</div>

// 						<div class="contact-card">
// 							<div class="contact-name">Augustin Moses R</div>
// 							<div class="contact-detail">augustin.moses@azimpremjifoundation.org</div>
// 							<div class="contact-detail">+91 8667719594</div>
// 						</div>

// 						<div class="contact-card">
// 							<div class="contact-name">Mercy Selvanayagi R</div>
// 							<div class="contact-detail">mercy.selvanayagi@azimpremjifoundation.org</div>
// 							<div class="contact-detail">+91 9047828687</div>
// 						</div>

// 						<div class="contact-card">
// 							<div class="contact-name">Mahaveer Ram P</div>
// 							<div class="contact-detail">mahaveer.p@azimpremjifoundation.org</div>
// 							<div class="contact-detail">+91 8825879412</div>
// 						</div>
// 					</div>

// 				</div>
// 			`);
// 		}

// 		/* ===============================
// 		   TABLE  (with Sl. No. column)
// 		=============================== */
// 		let tableHTML = `
// 			<h4 class="table-title">
// 				Allocated Units &amp; Cost Centers
// 			</h4>

// 			<div class="table-wrapper">
// 				<table class="mis-table">
// 					<thead>
// 						<tr>
// 							<th>Sl. No.</th>
// 							<th>Unit</th>
// 							<th>Unit Description</th>
// 							<th>Cost Center</th>
// 							<th>Cost Center Description</th>
// 							<th>Location Code</th>
// 							<th>Location Description</th>
// 						</tr>
// 					</thead>
// 					<tbody>
// 		`;

// 		userData.rows.forEach((r, idx) => {
// 			tableHTML += `
// 				<tr>
// 					<td>${idx + 1}</td>
// 					<td>${r.unit || ""}</td>
// 					<td>${r.unit_description || ""}</td>
// 					<td>${r.cost_center || ""}</td>
// 					<td>${r.cost_center_description || ""}</td>
// 					<td>${r.location_code || ""}</td>
// 					<td>${r.location_description || ""}</td>
// 				</tr>
// 			`;
// 		});

// 		tableHTML += `
// 					</tbody>
// 				</table>
// 			</div>
// 		`;

// 		body.append(tableHTML);
// 	});


// 	/* =====================================================
// 	   GLOBAL SEARCH LOGIC
// 	===================================================== */

// 	function run_global_search(query) {

// 		let q = (query || "").trim().toLowerCase();
// 		let totalVisible = 0;

// 		$(".mis-table").each(function () {
// 			let $table   = $(this);
// 			let $rows    = $table.find("tbody tr");
// 			let sectionVisible = 0;

// 			$rows.each(function () {
// 				let $row = $(this);
// 				let text = $row.text().toLowerCase();
// 				let match = !q || text.indexOf(q) !== -1;
// 				$row.toggle(match);
// 				if (match) {
// 					sectionVisible++;
// 					totalVisible++;
// 				}
// 			});

// 			// Show/hide section title & user block based on matches
// 			let $section = $table.closest(".user-section");
// 			$section.toggle(sectionVisible > 0 || !q);
// 		});

// 		// Update count display
// 		let $count = $("#global-search-count");
// 		if (q) {
// 			$count.text(`${totalVisible} row${totalVisible !== 1 ? "s" : ""} matched`).show();
// 		} else {
// 			$count.hide();
// 		}

// 		// Show/hide clear button
// 		$("#global-search-clear").toggle(q.length > 0);
// 	}

// 	// Live search on input
// 	$(document).off("input.globalSearch", "#global-table-search")
// 		.on("input.globalSearch", "#global-table-search", function () {
// 			run_global_search($(this).val());
// 		});

// 	// Clear button
// 	$(document).off("click.globalSearchClear", "#global-search-clear")
// 		.on("click.globalSearchClear", "#global-search-clear", function () {
// 			$("#global-table-search").val("").trigger("input");
// 		});

// 	// Hide clear button initially
// 	$("#global-search-clear").hide();
// 	$("#global-search-count").hide();
// }


// /* =========================================
//    STYLES
// ========================================= */

// function inject_styles() {

// 	if (document.getElementById("allocation-style")) return;

// 	const style = document.createElement("style");
// 	style.id = "allocation-style";

// 	style.innerHTML = `

// 	/* PAGE WHITE BACKGROUND */
// 	.budget-import-wrapper {
// 		padding: 25px;
// 		background: #ffffff;
// 		min-height: 100vh;
// 	}

// 	.loading-state,
// 	.empty-state {
// 		text-align: center;
// 		padding: 50px;
// 		font-weight: 600;
// 		color: #0076B6;
// 	}

// 	/* ==============================
// 	   GLOBAL SEARCH
// 	============================== */
// 	.global-search-wrap {
// 		margin-bottom: 30px;
// 	}

// 	.global-search-inner {
// 		position: relative;
// 		display: flex;
// 		align-items: center;
// 		max-width: 520px;
// 	}

// 	.global-search-icon {
// 		position: absolute;
// 		left: 12px;
// 		color: #0076B6;
// 		font-size: 14px;
// 		pointer-events: none;
// 	}

// 	.global-search-input {
// 		width: 100%;
// 		padding: 10px 36px 10px 36px;
// 		border: 1.5px solid #c8dff0;
// 		border-radius: 8px;
// 		font-size: 14px;
// 		color: #222;
// 		outline: none;
// 		transition: border-color 0.2s, box-shadow 0.2s;
// 		background: #f4f9fd;
// 	}

// 	.global-search-input:focus {
// 		border-color: #0076B6;
// 		box-shadow: 0 0 0 3px rgba(0,118,182,0.12);
// 		background: #fff;
// 	}

// 	.global-search-clear {
// 		position: absolute;
// 		right: 10px;
// 		font-size: 18px;
// 		color: #999;
// 		cursor: pointer;
// 		line-height: 1;
// 		transition: color 0.15s;
// 	}

// 	.global-search-clear:hover {
// 		color: #c0392b;
// 	}

// 	.global-search-count {
// 		margin-top: 6px;
// 		font-size: 12px;
// 		color: #0076B6;
// 		font-weight: 600;
// 		padding-left: 2px;
// 	}

// 	/* ============================== */

// 	.user-section {
// 		margin-bottom: 50px;
// 	}

// 	.user-header {
// 		display: flex;
// 		justify-content: space-between;
// 		align-items: center;
// 		padding-bottom: 12px;
// 		border-bottom: 2px solid #0076B6;
// 		margin-bottom: 18px;
// 	}

// 	.user-name {
// 		font-size: 18px;
// 		font-weight: 700;
// 		color: #003B63;
// 	}

// 	.user-email {
// 		font-size: 13px;
// 		color: #555;
// 	}

// 	/* IMPORTANT NOTE */
// 	.note-warning {
// 		background: #fff8e1;
// 		border-left: 5px solid #f4b400;
// 		padding: 16px;
// 		border-radius: 6px;
// 		margin-bottom: 25px;
// 	}

// 	.note-header {
// 		font-size: 14px;
// 		color: #5c4b00;
// 		margin-bottom: 15px;
// 	}

// 	.note-badge {
// 		background: #f4b400;
// 		color: #fff;
// 		font-size: 11px;
// 		font-weight: 700;
// 		padding: 3px 8px;
// 		border-radius: 20px;
// 		margin-right: 8px;
// 	}

// 	.blinking-badge {
// 		animation: softBlink 1.5s ease-in-out infinite;
// 	}

// 	@keyframes softBlink {
// 		0%   { opacity: 1; }
// 		50%  { opacity: 0.5; }
// 		100% { opacity: 1; }
// 	}

// 	/* CONTACT CARDS */
// 	.contact-wrapper {
// 		display: flex;
// 		gap: 15px;
// 		flex-wrap: wrap;
// 	}

// 	.contact-card {
// 		background: #ffffff;
// 		border: 1px solid #e6e6e6;
// 		border-radius: 8px;
// 		padding: 12px 15px;
// 		min-width: 230px;
// 		box-shadow: 0 3px 10px rgba(0,0,0,0.04);
// 	}

// 	.contact-name {
// 		font-weight: 600;
// 		color: #333;
// 		margin-bottom: 5px;
// 	}

// 	.contact-detail {
// 		font-size: 13px;
// 		color: #555;
// 	}

// 	/* TABLE */
// 	.table-title {
// 		font-size: 15px;
// 		font-weight: 600;
// 		color: #003B63;
// 		margin-bottom: 12px;
// 	}

// 	.table-wrapper {
// 		overflow-x: auto;
// 	}

// 	.mis-table {
// 		width: 100%;
// 		border-collapse: collapse;
// 		font-size: 13px;
// 		border: 1px solid #dcdcdc;
// 	}

// 	.mis-table th {
// 		background: #0076B6;
// 		color: #ffffff;
// 		font-weight: 700;
// 		padding: 8px;
// 		text-align: center;
// 	}

// 	.mis-table td {
// 		padding: 8px;
// 		border: 1px solid #e0e0e0;
// 		text-align: center;
// 	}

// 	.mis-table tr:nth-child(even) {
// 		background: #f9f9f9;
// 	}

// 	.mis-table tr:hover {
// 		background: #eef6fb;
// 	}

// 	/* MODAL STYLES */
// 	#pro-confirm-overlay {
// 		position: fixed;
// 		top: 0;
// 		left: 0;
// 		width: 100%;
// 		height: 100%;
// 		background: rgba(0,0,0,0.5);
// 		display: none;
// 		align-items: center;
// 		justify-content: center;
// 		z-index: 9999;
// 		backdrop-filter: blur(4px);
// 		padding: 15px;
// 	}

// 	.pro-confirm-box {
// 		background: #ffffff;
// 		width: 640px;
// 		max-width: 100%;
// 		min-height: 360px;
// 		border-radius: 12px;
// 		box-shadow: 0 25px 60px rgba(0,0,0,0.25);
// 		padding: 35px;
// 		animation: scaleIn 0.25s ease;
// 	}

// 	@keyframes scaleIn {
// 		from { transform: scale(0.95); opacity: 0; }
// 		to   { transform: scale(1);    opacity: 1; }
// 	}

// 	.pro-confirm-header {
// 		display: flex;
// 		justify-content: space-between;
// 		align-items: center;
// 		font-weight: 600;
// 		font-size: 18px;
// 		margin-bottom: 25px;
// 	}

// 	.pro-confirm-title i {
// 		margin-right: 8px;
// 		color: #007bff;
// 	}

// 	#pro-confirm-close {
// 		cursor: pointer;
// 		font-size: 22px;
// 		color: #888;
// 		transition: 0.2s;
// 	}

// 	#pro-confirm-close:hover {
// 		color: #000;
// 	}

// 	.pro-confirm-body {
// 		text-align: center;
// 		margin-bottom: 25px;
// 	}

// 	.pro-warning-icon {
// 		font-size: 42px;
// 		color: #e74c3c;
// 		margin-bottom: 15px;
// 	}

// 	.pro-warning-text {
// 		font-weight: 600;
// 		font-size: 16px;
// 		color: #c0392b;
// 		margin-bottom: 15px;
// 		line-height: 1.6;
// 	}

// 	.pro-warning-sub {
// 		font-size: 14px;
// 		color: #555;
// 		margin-bottom: 25px;
// 		line-height: 1.6;
// 	}

// 	.pro-checkbox-wrapper {
// 		background: #f8f9fa;
// 		padding: 18px;
// 		border-radius: 8px;
// 		border: 1px solid #e0e0e0;
// 		font-size: 14px;
// 		text-align: left;
// 	}

// 	.pro-checkbox-label {
// 		display: flex;
// 		align-items: flex-start;
// 		gap: 10px;
// 		cursor: pointer;
// 	}

// 	.pro-checkbox-label i {
// 		color: #28a745;
// 		margin-right: 6px;
// 	}

// 	.pro-checkbox-wrapper input {
// 		margin-top: 4px;
// 		transform: scale(1.1);
// 	}

// 	.pro-confirm-footer {
// 		text-align: right;
// 		margin-top: 20px;
// 	}

// 	.pro-confirm-footer button {
// 		margin-left: 12px;
// 		min-width: 170px;
// 	}

// 	#pro-confirm-yes:disabled {
// 		opacity: 0.6;
// 		cursor: not-allowed;
// 	}

// 	/* RESPONSIVE */
// 	@media (max-width: 768px) {
// 		.user-header {
// 			flex-direction: column;
// 			align-items: flex-start;
// 			gap: 10px;
// 		}
// 	}

// 	@media (max-width: 576px) {
// 		.global-search-inner {
// 			max-width: 100%;
// 		}

// 		.pro-confirm-box {
// 			width: 100%;
// 			min-height: auto;
// 			padding: 25px;
// 		}

// 		.pro-confirm-header {
// 			font-size: 16px;
// 		}

// 		.pro-warning-text {
// 			font-size: 15px;
// 		}

// 		.pro-confirm-footer {
// 			text-align: center;
// 		}

// 		.pro-confirm-footer button {
// 			width: 100%;
// 			margin: 8px 0;
// 		}
// 	}
// 	`;

// 	document.head.appendChild(style);
// }

// frappe.pages["import-template"].on_page_load = function (wrapper) {

// 	// Create the Frappe page layout
// 	frappe.ui.make_app_page({
// 		parent      : wrapper,
// 		title       : "Budget Import Template",
// 		single_column: true,
// 	});

// 	// Get the main content container and mark it with our wrapper class
// 	const $container = $(wrapper).find(".layout-main-section");
// 	$container.addClass("budget-import-wrapper");

// 	// Inject all custom CSS into the page (runs only once)
// 	inject_styles();

// 	// Show a loading spinner while data is being fetched
// 	$container.html(`
// 		<div class="loading-state">
// 			<i class="fa fa-spinner fa-spin"></i> Loading Data…
// 		</div>
// 	`);

// 	// Fetch user-to-cost-center mappings from the backend
// 	frappe.call({
// 		method  : "annual_budget.api.filter_options.get_user_mappings",
// 		callback : function (r) {

// 			// If no data is returned, show empty state and stop
// 			if (!r.message || !r.message.length) {
// 				$container.html(`<div class="empty-state">No Data Found</div>`);
// 				return;
// 			}

// 			// Data is available — build the full page content
// 			render_content($container, r.message);
// 		}
// 	});

// };




// /* ============================================================
//    RENDER CONTENT
//    - Groups rows by user email
//    - Builds search bar, modal, user sections, and tables
// ============================================================ */

// function render_content(container, data) {

// 	// ── Role Detection ─────────────────────────────────────
// 	// Read user roles once, safely fallback to empty array
// 	const roles                = Array.isArray(frappe.user_roles) ? frappe.user_roles : [];
// 	const isFinanceCoordinator = roles.includes("Finance Unit Coordinator");
// 	const isSystemManager      = roles.includes("System Manager");

// 	// Finance Coordinators (who are NOT System Managers) see the confirmation modal
// 	const needsModal = isFinanceCoordinator && !isSystemManager;


// 	// ── Group Data by User Email ───────────────────────────
// 	// Each key = user email, value = { user_fullname, email, rows[] }
// 	const grouped = {};

// 	data.forEach(function (row) {

// 		const key = row.user; // email is the unique key

// 		if (!grouped[key]) {
// 			grouped[key] = {
// 				user_fullname : row.user_fullname || "",
// 				email         : row.user,
// 				rows          : []
// 			};
// 		}

// 		grouped[key].rows.push(row);
// 	});


// 	// ── Clear Container ────────────────────────────────────
// 	container.empty();


// 	// ── Global Search Bar ──────────────────────────────────
// 	// Rendered once, above all user sections
// 	container.append(`
// 		<div class="global-search-wrap">

// 			<div class="global-search-inner">
// 				<i class="fa fa-search global-search-icon"></i>

// 				<input
// 					type        = "text"
// 					id          = "global-table-search"
// 					class       = "global-search-input"
// 					placeholder = "Search across all units, cost centers, locations…"
// 					autocomplete= "off"
// 				/>

// 				<span id="global-search-clear" class="global-search-clear" title="Clear">&times;</span>
// 			</div>

// 			<div id="global-search-count" class="global-search-count" style="display:none;"></div>

// 		</div>
// 	`);


// 	// ── Confirm Download Modal ─────────────────────────────
// 	// Appended once to <body> — shared across all download buttons
// 	if (!$("#pro-confirm-overlay").length) {

// 		$("body").append(`
// 			<div id="pro-confirm-overlay">
// 				<div class="pro-confirm-box">

// 					<!-- Header -->
// 					<div class="pro-confirm-header">
// 						<div class="pro-confirm-title">
// 							<i class="fa fa-download"></i> Confirm Download
// 						</div>
// 						<span id="pro-confirm-close" title="Close">&times;</span>
// 					</div>

// 					<!-- Body -->
// 					<div class="pro-confirm-body">

// 						<div class="pro-warning-icon">
// 							<i class="fa fa-exclamation-triangle"></i>
// 						</div>

// 						<div class="pro-warning-text">
// 							Please carefully review and validate all allocated Units, Cost Centers,
// 							and Location Codes before downloading the Budget Import Template.
// 						</div>

// 						<div class="pro-warning-sub">
// 							Do not proceed unless everything has been reviewed and confirmed.
// 						</div>

// 						<div class="pro-checkbox-wrapper">
// 							<label class="pro-checkbox-label">
// 								<input type="checkbox" id="pro-confirm-checkbox">
// 								<span>
// 									<i class="fa fa-check-circle"></i>
// 									I confirm that I have verified all details carefully.
// 								</span>
// 							</label>
// 						</div>

// 					</div>

// 					<!-- Footer -->
// 					<div class="pro-confirm-footer">
// 						<button id="pro-confirm-no" class="btn btn-default btn-sm">
// 							<i class="fa fa-times"></i> Cancel
// 						</button>
// 						<button id="pro-confirm-yes" class="btn btn-primary btn-sm" disabled>
// 							<i class="fa fa-download"></i> Proceed to Download
// 						</button>
// 					</div>

// 				</div>
// 			</div>
// 		`);

// 	}


// 	// ── Modal Event Listeners ──────────────────────────────
// 	// All namespaced under ".budgetModal" — registered once, safe to re-register
// 	$(document)
// 		.off(".budgetModal")

// 		// Enable or disable the Proceed button based on checkbox
// 		.on("change.budgetModal", "#pro-confirm-checkbox", function () {
// 			$("#pro-confirm-yes").prop("disabled", !this.checked);
// 		})

// 		// Close modal when Cancel or X is clicked
// 		.on("click.budgetModal", "#pro-confirm-no, #pro-confirm-close", function () {
// 			_hide_modal();
// 		})

// 		// Close modal when clicking outside the modal box (on the overlay)
// 		.on("click.budgetModal", "#pro-confirm-overlay", function (e) {
// 			if ($(e.target).is("#pro-confirm-overlay")) {
// 				_hide_modal();
// 			}
// 		})

// 		// Confirm and trigger the actual file download
// 		.on("click.budgetModal", "#pro-confirm-yes", function () {

// 			const $overlay  = $("#pro-confirm-overlay");
// 			const btn       = $overlay.data("trigger-btn");
// 			const userEmail = $overlay.data("user-email");

// 			_hide_modal();

// 			// Safety check — if data is missing, do nothing
// 			if (!btn || !userEmail) return;

// 			_start_download(btn, userEmail);
// 		});


// 	// ── Build Each User Section ────────────────────────────

// 	Object.values(grouped).forEach(function (userData) {

// 		// Use full name if available, otherwise fall back to email
// 		const displayName = userData.user_fullname || userData.email;


// 		// ── User Section Wrapper ───────────────────────────
// 		const $section = $(`
// 			<div class="user-section">

// 				<div class="user-header">
// 					<div>
// 						<div class="user-name">${_esc(displayName)}</div>
// 						<div class="user-email">${_esc(userData.email)}</div>
// 					</div>
// 					<div class="button-container"></div>
// 				</div>

// 				<div class="user-body"></div>

// 			</div>
// 		`);

// 		container.append($section);


// 		// ── Download Button ────────────────────────────────
// 		const $downloadBtn = $(`
// 			<button class="btn btn-primary btn-sm">
// 				<i class="fa fa-download"></i> Download Budget Import Template
// 			</button>
// 		`);

// 		$section.find(".button-container").append($downloadBtn);

// 		if (needsModal) {

// 			// Finance Coordinators: show confirmation modal before downloading
// 			$downloadBtn.on("click", function () {
// 				$("#pro-confirm-overlay")
// 					.css("display", "flex")
// 					.data("trigger-btn",  $(this))
// 					.data("user-email",   userData.email);

// 				// Always reset modal to a clean state on open
// 				$("#pro-confirm-checkbox").prop("checked", false);
// 				$("#pro-confirm-yes").prop("disabled", true);
// 			});

// 		} else {

// 			// All other roles: download directly without any modal
// 			$downloadBtn.on("click", function () {
// 				_start_download($(this), userData.email);
// 			});

// 		}


// 		const $body = $section.find(".user-body");


// 		// ── Important Note (Finance Coordinator only) ──────
// 		if (needsModal) {
// 			$body.append(_build_note_html());
// 		}


// 		// ── Allocation Table ───────────────────────────────
// 		$body.append(_build_table_html(userData.rows));

// 	});


// 	// ── Global Search Logic ────────────────────────────────

// 	function run_global_search(query) {

// 		const q       = query.trim().toLowerCase();
// 		let totalVisible = 0;

// 		// Loop through each user section and filter table rows
// 		$(".user-section").each(function () {

// 			const $section      = $(this);
// 			let sectionVisible  = 0;

// 			$section.find(".mis-table tbody tr").each(function () {

// 				// Check if row text matches the query
// 				const match = !q || this.textContent.toLowerCase().includes(q);
// 				$(this).toggle(match);

// 				if (match) {
// 					sectionVisible++;
// 					totalVisible++;
// 				}

// 			});

// 			// Hide the entire user section if no rows matched
// 			$section.toggle(!q || sectionVisible > 0);

// 		});

// 		// Update the result count display
// 		const $count = $("#global-search-count");

// 		if (q) {
// 			$count
// 				.text(`${totalVisible} row${totalVisible !== 1 ? "s" : ""} matched`)
// 				.show();
// 		} else {
// 			$count.hide();
// 		}

// 		// Show or hide the clear (×) button
// 		$("#global-search-clear").toggle(q.length > 0);

// 	}

// 	// Attach search input and clear button events (namespaced)
// 	$(document)
// 		.off(".globalSearch")
// 		.on("input.globalSearch", "#global-table-search", function () {
// 			run_global_search(this.value);
// 		})
// 		.on("click.globalSearch", "#global-search-clear", function () {
// 			$("#global-table-search").val("").trigger("input");
// 		});

// 	// Hide clear button on initial load
// 	$("#global-search-clear").hide();

// }




// /* ============================================================
//    HELPER FUNCTIONS
// ============================================================ */


// /* ── _esc()
//    Escapes a string for safe HTML insertion.
//    Prevents XSS from server-supplied user data. */
// function _esc(str) {
// 	return $("<div>").text(str || "").html();
// }


// /* ── _hide_modal()
//    Hides the confirmation modal and resets it to a clean state. */
// function _hide_modal() {
// 	$("#pro-confirm-overlay").hide();
// 	$("#pro-confirm-checkbox").prop("checked", false);
// 	$("#pro-confirm-yes").prop("disabled", true);
// }


// /* ── _start_download()
//    Disables the button, shows a spinner, opens the download URL,
//    then re-enables the button after 3 seconds. */
// function _start_download($btn, userEmail) {

// 	$btn
// 		.prop("disabled", true)
// 		.html('<i class="fa fa-spinner fa-spin"></i> Downloading…');

// 	window.open(
// 		`/api/method/annual_budget.api.export_reports.download_finance_budget_import_template` +
// 		`?user=${encodeURIComponent(userEmail)}`
// 	);

// 	setTimeout(function () {
// 		$btn
// 			.prop("disabled", false)
// 			.html('<i class="fa fa-download"></i> Download Budget Import Template');
// 	}, 3000);

// }


// /* ── _build_note_html()
//    Returns the HTML for the "IMPORTANT" warning note
//    and support contact cards shown to Finance Coordinators. */
// function _build_note_html() {

// 	// List of support contacts [ Name, Email, Phone ]
// 	const contacts = [
// 		["Rakesh Ahuja",         "rakesh.ahuja@azimpremjifoundation.org",      "+91 7022068106"],
// 		["Saravana G",           "saravana.g@azimpremjifoundation.org",        "+91 9380861952"],
// 		["Augustin Moses R",     "augustin.moses@azimpremjifoundation.org",    "+91 8667719594"],
// 		["Mercy Selvanayagi R",  "mercy.selvanayagi@azimpremjifoundation.org", "+91 9047828687"],
// 		["Mahaveer Ram P",       "mahaveer.p@azimpremjifoundation.org",        "+91 8825879412"],
// 	];

// 	// Build individual contact card HTML
// 	const contactCards = contacts.map(function (c) {
// 		return `
// 			<div class="contact-card">
// 				<div class="contact-name">${c[0]}</div>
// 				<div class="contact-detail">${c[1]}</div>
// 				<div class="contact-detail">${c[2]}</div>
// 			</div>
// 		`;
// 	}).join("");

// 	return `
// 		<div class="note-warning">

// 			<div class="note-header">
// 				<span class="note-badge blinking-badge">IMPORTANT</span>
// 				Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below.
// 				If you notice any discrepancies, contact the support team immediately.
// 				Do not proceed with the import until all details are verified and confirmed.
// 			</div>

// 			<div class="contact-wrapper">
// 				${contactCards}
// 			</div>

// 		</div>
// 	`;

// }


// /* ── _build_table_html()
//    Returns the HTML for the allocation table.
//    Each column is defined as [ data_key, display_label ]. */
// function _build_table_html(rows) {

// 	// Column definitions: [ field key, column header label ]
// 	const COLUMNS = [
// 		["unit",                     "Unit"                    ],
// 		["unit_description",         "Unit Description"        ],
// 		["cost_center",              "Cost Center"             ],
// 		["cost_center_description",  "Cost Center Description" ],
// 		["location_code",            "Location Code"           ],
// 		["location_description",     "Location Description"    ],
// 	];

// 	// Build <th> header cells
// 	const headerCells = COLUMNS.map(function (col) {
// 		return `<th>${col[1]}</th>`;
// 	}).join("");

// 	// Build <tr> data rows
// 	const dataRows = rows.map(function (row, index) {

// 		const cells = COLUMNS.map(function (col) {
// 			return `<td>${_esc(row[col[0]] || "")}</td>`;
// 		}).join("");

// 		return `<tr><td>${index + 1}</td>${cells}</tr>`;

// 	}).join("");

// 	return `
// 		<h4 class="table-title">Allocated Units &amp; Cost Centers</h4>

// 		<div class="table-wrapper">
// 			<table class="mis-table">

// 				<thead>
// 					<tr>
// 						<th>Sl. No.</th>
// 						${headerCells}
// 					</tr>
// 				</thead>

// 				<tbody>
// 					${dataRows}
// 				</tbody>

// 			</table>
// 		</div>
// 	`;

// }




// /* ============================================================
//    INJECT STYLES
//    - Injects all page CSS once into <head>
//    - Skips if already injected (safe for page re-loads)
// ============================================================ */

// function inject_styles() {

// 	// Prevent duplicate injection on page re-load
// 	if (document.getElementById("allocation-style")) return;

// 	const style    = document.createElement("style");
// 	style.id       = "allocation-style";
// 	style.textContent = `

// 	/* ── Page Wrapper ─────────────────────────── */
// 	.budget-import-wrapper {
// 		padding    : 25px;
// 		background : #ffffff;
// 		min-height : 100vh;
// 	}

// 	/* ── Loading / Empty States ───────────────── */
// 	.loading-state,
// 	.empty-state {
// 		text-align  : center;
// 		padding     : 50px;
// 		font-weight : 600;
// 		color       : #0076B6;
// 	}


// 	/* ── Global Search Bar ────────────────────── */

// 	.global-search-wrap {
// 		margin-bottom : 30px;
// 	}

// 	.global-search-inner {
// 		position    : relative;
// 		display     : flex;
// 		align-items : center;
// 		max-width   : 520px;
// 	}

// 	.global-search-icon {
// 		position        : absolute;
// 		left            : 12px;
// 		color           : #0076B6;
// 		font-size       : 14px;
// 		pointer-events  : none;
// 	}

// 	.global-search-input {
// 		width         : 100%;
// 		padding       : 10px 36px;
// 		border        : 1.5px solid #c8dff0;
// 		border-radius : 8px;
// 		font-size     : 14px;
// 		color         : #222;
// 		outline       : none;
// 		background    : #f4f9fd;
// 		transition    : border-color 0.2s, box-shadow 0.2s;
// 	}

// 	.global-search-input:focus {
// 		border-color : #0076B6;
// 		box-shadow   : 0 0 0 3px rgba(0, 118, 182, 0.12);
// 		background   : #ffffff;
// 	}

// 	.global-search-clear {
// 		position   : absolute;
// 		right      : 10px;
// 		font-size  : 18px;
// 		color      : #999;
// 		cursor     : pointer;
// 		transition : color 0.15s;
// 	}

// 	.global-search-clear:hover {
// 		color : #c0392b;
// 	}

// 	.global-search-count {
// 		margin-top  : 6px;
// 		font-size   : 12px;
// 		color       : #0076B6;
// 		font-weight : 600;
// 		padding-left: 2px;
// 	}


// 	/* ── User Section ─────────────────────────── */

// 	.user-section {
// 		margin-bottom : 50px;
// 	}

// 	.user-header {
// 		display         : flex;
// 		justify-content : space-between;
// 		align-items     : center;
// 		padding-bottom  : 12px;
// 		border-bottom   : 2px solid #0076B6;
// 		margin-bottom   : 18px;
// 	}

// 	.user-name {
// 		font-size   : 18px;
// 		font-weight : 700;
// 		color       : #003B63;
// 	}

// 	.user-email {
// 		font-size : 13px;
// 		color     : #555555;
// 	}


// 	/* ── Important Note ───────────────────────── */

// 	.note-warning {
// 		background    : #fff8e1;
// 		border-left   : 5px solid #f4b400;
// 		padding       : 16px;
// 		border-radius : 6px;
// 		margin-bottom : 25px;
// 	}

// 	.note-header {
// 		font-size     : 14px;
// 		color         : #5c4b00;
// 		margin-bottom : 15px;
// 	}

// 	.note-badge {
// 		background    : #f4b400;
// 		color         : #ffffff;
// 		font-size     : 11px;
// 		font-weight   : 700;
// 		padding       : 3px 8px;
// 		border-radius : 20px;
// 		margin-right  : 8px;
// 	}

// 	.blinking-badge {
// 		animation : softBlink 1.5s ease-in-out infinite;
// 	}

// 	@keyframes softBlink {
// 		0%   { opacity : 1;   }
// 		50%  { opacity : 0.5; }
// 		100% { opacity : 1;   }
// 	}


// 	/* ── Contact Cards ────────────────────────── */

// 	.contact-wrapper {
// 		display   : flex;
// 		gap       : 15px;
// 		flex-wrap : wrap;
// 	}

// 	.contact-card {
// 		background    : #ffffff;
// 		border        : 1px solid #e6e6e6;
// 		border-radius : 8px;
// 		padding       : 12px 15px;
// 		min-width     : 230px;
// 		box-shadow    : 0 3px 10px rgba(0, 0, 0, 0.04);
// 	}

// 	.contact-name {
// 		font-weight   : 600;
// 		color         : #333333;
// 		margin-bottom : 5px;
// 	}

// 	.contact-detail {
// 		font-size : 13px;
// 		color     : #555555;
// 	}


// 	/* ── Allocation Table ─────────────────────── */

// 	.table-title {
// 		font-size     : 15px;
// 		font-weight   : 600;
// 		color         : #003B63;
// 		margin-bottom : 12px;
// 	}

// 	.table-wrapper {
// 		overflow-x : auto;
// 	}

// 	.mis-table {
// 		width            : 100%;
// 		border-collapse  : collapse;
// 		font-size        : 13px;
// 		border           : 1px solid #dcdcdc;
// 	}

// 	.mis-table th {
// 		background  : #0076B6;
// 		color       : #ffffff;
// 		font-weight : 700;
// 		padding     : 8px;
// 		text-align  : center;
// 	}

// 	.mis-table td {
// 		padding    : 8px;
// 		border     : 1px solid #e0e0e0;
// 		text-align : center;
// 	}

// 	.mis-table tr:nth-child(even) {
// 		background : #f9f9f9;
// 	}

// 	.mis-table tr:hover {
// 		background : #eef6fb;
// 	}


// 	/* ── Confirmation Modal ───────────────────── */

// 	#pro-confirm-overlay {
// 		position        : fixed;
// 		inset           : 0;
// 		background      : rgba(0, 0, 0, 0.5);
// 		display         : none;
// 		align-items     : center;
// 		justify-content : center;
// 		z-index         : 9999;
// 		backdrop-filter : blur(4px);
// 		padding         : 15px;
// 	}

// 	.pro-confirm-box {
// 		background    : #ffffff;
// 		width         : 640px;
// 		max-width     : 100%;
// 		min-height    : 360px;
// 		border-radius : 12px;
// 		box-shadow    : 0 25px 60px rgba(0, 0, 0, 0.25);
// 		padding       : 35px;
// 		animation     : scaleIn 0.25s ease;
// 	}

// 	@keyframes scaleIn {
// 		from { transform : scale(0.95); opacity : 0; }
// 		to   { transform : scale(1);    opacity : 1; }
// 	}

// 	.pro-confirm-header {
// 		display         : flex;
// 		justify-content : space-between;
// 		align-items     : center;
// 		font-weight     : 600;
// 		font-size       : 18px;
// 		margin-bottom   : 25px;
// 	}

// 	.pro-confirm-title i {
// 		margin-right : 8px;
// 		color        : #007bff;
// 	}

// 	#pro-confirm-close {
// 		cursor     : pointer;
// 		font-size  : 22px;
// 		color      : #888888;
// 		transition : color 0.2s;
// 	}

// 	#pro-confirm-close:hover {
// 		color : #000000;
// 	}

// 	.pro-confirm-body {
// 		text-align    : center;
// 		margin-bottom : 25px;
// 	}

// 	.pro-warning-icon {
// 		font-size     : 42px;
// 		color         : #e74c3c;
// 		margin-bottom : 15px;
// 	}

// 	.pro-warning-text {
// 		font-weight   : 600;
// 		font-size     : 16px;
// 		color         : #c0392b;
// 		margin-bottom : 15px;
// 		line-height   : 1.6;
// 	}

// 	.pro-warning-sub {
// 		font-size     : 14px;
// 		color         : #555555;
// 		margin-bottom : 25px;
// 		line-height   : 1.6;
// 	}

// 	.pro-checkbox-wrapper {
// 		background    : #f8f9fa;
// 		padding       : 18px;
// 		border-radius : 8px;
// 		border        : 1px solid #e0e0e0;
// 		font-size     : 14px;
// 		text-align    : left;
// 	}

// 	.pro-checkbox-label {
// 		display     : flex;
// 		align-items : flex-start;
// 		gap         : 10px;
// 		cursor      : pointer;
// 	}

// 	.pro-checkbox-label i {
// 		color        : #28a745;
// 		margin-right : 6px;
// 	}

// 	.pro-checkbox-wrapper input {
// 		margin-top : 4px;
// 		transform  : scale(1.1);
// 	}

// 	.pro-confirm-footer {
// 		text-align : right;
// 		margin-top : 20px;
// 	}

// 	.pro-confirm-footer button {
// 		margin-left : 12px;
// 		min-width   : 170px;
// 	}

// 	#pro-confirm-yes:disabled {
// 		opacity : 0.6;
// 		cursor  : not-allowed;
// 	}


// 	/* ── Responsive: Tablet ───────────────────── */
// 	@media (max-width: 768px) {

// 		.user-header {
// 			flex-direction : column;
// 			align-items    : flex-start;
// 			gap            : 10px;
// 		}

// 	}

// 	/* ── Responsive: Mobile ───────────────────── */
// 	@media (max-width: 576px) {

// 		.global-search-inner {
// 			max-width : 100%;
// 		}

// 		.pro-confirm-box {
// 			width      : 100%;
// 			min-height : auto;
// 			padding    : 25px;
// 		}

// 		.pro-confirm-header {
// 			font-size : 16px;
// 		}

// 		.pro-warning-text {
// 			font-size : 15px;
// 		}

// 		.pro-confirm-footer {
// 			text-align : center;
// 		}

// 		.pro-confirm-footer button {
// 			width  : 100%;
// 			margin : 8px 0;
// 		}

// 	}
// 	`;

// 	document.head.appendChild(style);

// }


// frappe.pages["import-template"].on_page_load = function (wrapper) {

// 	frappe.ui.make_app_page({
// 		parent      : wrapper,
// 		title       : "Budget Import Template",
// 		single_column: true,
// 	});

// 	const $container = $(wrapper).find(".layout-main-section");
// 	$container.addClass("budget-import-wrapper");

// 	inject_styles();

// 	$container.html(`
// 		<div class="loading-state">
// 			<i class="fa fa-spinner fa-spin"></i> Loading Data…
// 		</div>
// 	`);

// 	frappe.call({
// 		method  : "annual_budget.api.filter_options.get_user_mappings",
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) {
// 				$container.html(`<div class="empty-state">No Data Found</div>`);
// 				return;
// 			}
// 			render_content($container, r.message);
// 		}
// 	});

// };


// /* ============================================================
//    LOADER
// ============================================================ */

// function _init_loader() {
// 	if ($("#global-loader").length) return;
// 	$("body").append(`
// 		<div id="global-loader" class="loader-overlay">
// 			<div class="loader-box">

// 				<div class="loader-ring-wrap">
// 					<svg class="loader-ring" viewBox="0 0 100 100">
// 						<defs>
// 							<linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
// 								<stop offset="0%"   stop-color="#0076B6"/>
// 								<stop offset="100%" stop-color="#00c6ff"/>
// 							</linearGradient>
// 						</defs>
// 						<circle class="loader-ring-bg"   cx="50" cy="50" r="44"/>
// 						<circle class="loader-ring-fill" id="loader-ring-fill" cx="50" cy="50" r="44"/>
// 					</svg>
// 					<img src="/files/APF logo.png" class="loader-logo" alt="Loading">
// 					<div class="loader-pct-inside" id="loader-pct">0%</div>
// 				</div>

// 				<div class="dl-anim-wrap">
// 					<div class="dl-arrow-track">
// 						<div class="dl-arrow">
// 							<div class="dl-arrow-stem"></div>
// 							<div class="dl-arrow-head"></div>
// 						</div>
// 					</div>
// 					<div class="dl-bar"></div>
// 					<div class="dl-dots">
// 						<span></span><span></span><span></span>
// 					</div>
// 				</div>

// 				<div class="loader-text" id="loader-text-msg">Preparing download…</div>

// 			</div>
// 		</div>
// 	`);
// }

// const Loader = {
// 	show(message = "Preparing download…") {
// 		_init_loader();
// 		$("#loader-text-msg").text(message);
// 		_set_progress(0);
// 		$("#global-loader").addClass("active");
// 	},
// 	setText(message) {
// 		$("#loader-text-msg").text(message);
// 	},
// 	hide() {
// 		$("#global-loader").removeClass("active");
// 	}
// };

// /* SVG ring progress — circumference for r=44 is 2π×44 ≈ 276.46 */
// function _set_progress(pct) {
// 	const offset = 276.46 - (pct / 100) * 276.46;
// 	$("#loader-ring-fill").css("stroke-dashoffset", offset);
// 	$("#loader-pct").text(Math.round(pct) + "%");
// }


// /* ============================================================
//    RENDER CONTENT
// ============================================================ */

// function render_content(container, data) {

// 	const roles                = Array.isArray(frappe.user_roles) ? frappe.user_roles : [];
// 	const isFinanceCoordinator = roles.includes("Finance Unit Coordinator");
// 	const isSystemManager      = roles.includes("System Manager");
// 	const needsModal           = isFinanceCoordinator && !isSystemManager;

// 	const grouped = {};
// 	data.forEach(function (row) {
// 		const key = row.user;
// 		if (!grouped[key]) {
// 			grouped[key] = { user_fullname: row.user_fullname || "", email: row.user, rows: [] };
// 		}
// 		grouped[key].rows.push(row);
// 	});

// 	container.empty();

// 	// ── Global Search Bar ──────────────────────────────────
// 	container.append(`
// 		<div class="global-search-wrap">
// 			<div class="global-search-inner">
// 				<i class="fa fa-search global-search-icon"></i>
// 				<input
// 					type         = "text"
// 					id           = "global-table-search"
// 					class        = "global-search-input"
// 					placeholder  = "Search across all units, cost centers, locations…"
// 					autocomplete = "off"
// 				/>
// 				<span id="global-search-clear" class="global-search-clear" title="Clear">&times;</span>
// 			</div>
// 			<div id="global-search-count" class="global-search-count" style="display:none;"></div>
// 		</div>
// 	`);

// 	// ── Confirm Download Modal ─────────────────────────────
// 	if (!$("#pro-confirm-overlay").length) {
// 		$("body").append(`
// 			<div id="pro-confirm-overlay">
// 				<div class="pro-confirm-box">
// 					<div class="pro-confirm-header">
// 						<div class="pro-confirm-title">
// 							<i class="fa fa-download"></i> Confirm Download
// 						</div>
// 						<span id="pro-confirm-close" title="Close">&times;</span>
// 					</div>
// 					<div class="pro-confirm-body">
// 						<div class="pro-warning-icon">
// 							<i class="fa fa-exclamation-triangle"></i>
// 						</div>
// 						<div class="pro-warning-text">
// 							Please carefully review and validate all allocated Units, Cost Centers,
// 							and Location Codes before downloading the Budget Import Template.
// 						</div>
// 						<div class="pro-warning-sub">
// 							Do not proceed unless everything has been reviewed and confirmed.
// 						</div>
// 						<div class="pro-checkbox-wrapper">
// 							<label class="pro-checkbox-label">
// 								<input type="checkbox" id="pro-confirm-checkbox">
// 								<span>
// 									<i class="fa fa-check-circle"></i>
// 									I confirm that I have verified all details carefully.
// 								</span>
// 							</label>
// 						</div>
// 					</div>
// 					<div class="pro-confirm-footer">
// 						<button id="pro-confirm-no" class="btn btn-default btn-sm">
// 							<i class="fa fa-times"></i> Cancel
// 						</button>
// 						<button id="pro-confirm-yes" class="btn btn-primary btn-sm" disabled>
// 							<i class="fa fa-download"></i> Proceed to Download
// 						</button>
// 					</div>
// 				</div>
// 			</div>
// 		`);
// 	}

// 	// ── Modal Event Listeners ──────────────────────────────
// 	$(document)
// 		.off(".budgetModal")
// 		.on("change.budgetModal", "#pro-confirm-checkbox", function () {
// 			$("#pro-confirm-yes").prop("disabled", !this.checked);
// 		})
// 		.on("click.budgetModal", "#pro-confirm-no, #pro-confirm-close", function () {
// 			_hide_modal();
// 		})
// 		.on("click.budgetModal", "#pro-confirm-overlay", function (e) {
// 			if ($(e.target).is("#pro-confirm-overlay")) _hide_modal();
// 		})
// 		.on("click.budgetModal", "#pro-confirm-yes", function () {
// 			const $overlay  = $("#pro-confirm-overlay");
// 			const btn       = $overlay.data("trigger-btn");
// 			const userEmail = $overlay.data("user-email");
// 			_hide_modal();
// 			if (!btn || !userEmail) return;
// 			_start_download(btn, userEmail);
// 		});

// 	// ── Build Each User Section ────────────────────────────
// 	Object.values(grouped).forEach(function (userData) {
// 		const displayName = userData.user_fullname || userData.email;

// 		const $section = $(`
// 			<div class="user-section">
// 				<div class="user-header">
// 					<div>
// 						<div class="user-name">${_esc(displayName)}</div>
// 						<div class="user-email">${_esc(userData.email)}</div>
// 					</div>
// 					<div class="button-container"></div>
// 				</div>
// 				<div class="user-body"></div>
// 			</div>
// 		`);
// 		container.append($section);

// 		const $downloadBtn = $(`
// 			<button class="btn btn-primary btn-sm">
// 				<i class="fa fa-download"></i> Download Budget Import Template
// 			</button>
// 		`);
// 		$section.find(".button-container").append($downloadBtn);

// 		if (needsModal) {
// 			$downloadBtn.on("click", function () {
// 				$("#pro-confirm-overlay")
// 					.css("display", "flex")
// 					.data("trigger-btn",  $(this))
// 					.data("user-email",   userData.email);
// 				$("#pro-confirm-checkbox").prop("checked", false);
// 				$("#pro-confirm-yes").prop("disabled", true);
// 			});
// 		} else {
// 			$downloadBtn.on("click", function () {
// 				_start_download($(this), userData.email);
// 			});
// 		}

// 		const $body = $section.find(".user-body");
// 		if (needsModal) $body.append(_build_note_html());
// 		$body.append(_build_table_html(userData.rows));
// 	});

// 	// ── Global Search Logic ────────────────────────────────
// 	function run_global_search(query) {
// 		const q = query.trim().toLowerCase();
// 		let totalVisible = 0;

// 		$(".user-section").each(function () {
// 			const $section = $(this);
// 			let sectionVisible = 0;

// 			$section.find(".mis-table tbody tr").each(function () {
// 				const match = !q || this.textContent.toLowerCase().includes(q);
// 				$(this).toggle(match);
// 				if (match) { sectionVisible++; totalVisible++; }
// 			});

// 			$section.toggle(!q || sectionVisible > 0);
// 		});

// 		const $count = $("#global-search-count");
// 		if (q) {
// 			$count.text(`${totalVisible} row${totalVisible !== 1 ? "s" : ""} matched`).show();
// 		} else {
// 			$count.hide();
// 		}
// 		$("#global-search-clear").toggle(q.length > 0);
// 	}

// 	$(document)
// 		.off(".globalSearch")
// 		.on("input.globalSearch", "#global-table-search", function () {
// 			run_global_search(this.value);
// 		})
// 		.on("click.globalSearch", "#global-search-clear", function () {
// 			$("#global-table-search").val("").trigger("input");
// 		});

// 	$("#global-search-clear").hide();
// }


// /* ============================================================
//    HELPER FUNCTIONS
// ============================================================ */

// function _esc(str) {
// 	return $("<div>").text(str || "").html();
// }

// function _hide_modal() {
// 	$("#pro-confirm-overlay").hide();
// 	$("#pro-confirm-checkbox").prop("checked", false);
// 	$("#pro-confirm-yes").prop("disabled", true);
// }

// function _reset_btn($btn) {
// 	$btn
// 		.prop("disabled", false)
// 		.html('<i class="fa fa-download"></i> Download Budget Import Template');
// }


// /* ── _start_download()
//    Step 1 — trigger generation via frappe.call
//    Step 2 — poll every 3s; simulate progress 5→85% while waiting
//    Step 3 — when file is ready, download it in the same tab via blob URL
//    No timeout is set — waits as long as the API needs. */

// function _start_download($btn, userEmail, import_template_id) {

// 	// ─────────────── 1. CHECK IMPORT TEMPLATE ───────────────
// 	if (!import_template_id) {

// 		let d = new frappe.ui.Dialog({
// 			title: '<i class="fa fa-exclamation-triangle text-danger"></i> Missing Import Template',
// 			size: "small",
// 			fields: [
// 				{
// 					fieldtype: "HTML",
// 					fieldname: "warning_html"
// 				}
// 			],
// 			primary_action_label: "Close",
// 			primary_action() {
// 				d.hide();
// 			}
// 		});

// 		d.fields_dict.warning_html.$wrapper.html(`
// 			<div style="text-align:center;padding:10px;">
// 				<div style="font-size:40px;color:#d9534f;margin-bottom:10px;">
// 					<i class="fa fa-exclamation-triangle"></i>
// 				</div>

// 				<div style="font-size:14px;color:#444;margin-bottom:10px;">
// 					Import Template is not configured for your account.
// 				</div>

// 				<div style="color:#777;font-size:13px;">
// 					Please contact your administrator to link an
// 					<b>Import Template</b> in <b>Finance User Access</b>
// 					before downloading the Budget Import Template.
// 				</div>
// 			</div>
// 		`);

// 		d.show();

// 		return; // 🚨 stop execution
// 	}

// 	// ─────────────── 2. CONFIRM DOWNLOAD ───────────────
// 	let confirm_dialog = new frappe.ui.Dialog({
// 		title: '<i class="fa fa-download text-primary"></i> Confirm Download',
// 		size: "small",
// 		fields: [
// 			{
// 				fieldtype: "HTML",
// 				fieldname: "warning"
// 			},
// 			{
// 				fieldtype: "Check",
// 				fieldname: "confirm_check",
// 				label: "I confirm that I have verified all details carefully."
// 			}
// 		],

// 		primary_action_label: "Proceed to Download",

// 		primary_action(values) {

// 			if (!values.confirm_check) {

// 				frappe.msgprint({
// 					title: "Confirmation Required",
// 					message: "Please confirm that you have reviewed the data before proceeding.",
// 					indicator: "orange"
// 				});

// 				return;
// 			}

// 			confirm_dialog.hide();

// 			run_download_job($btn, userEmail);
// 		}
// 	});

// 	confirm_dialog.fields_dict.warning.$wrapper.html(`
// 		<div style="text-align:center;padding:10px;">
// 			<div style="font-size:40px;color:#d9534f;margin-bottom:10px;">
// 				<i class="fa fa-exclamation-triangle"></i>
// 			</div>

// 			<div style="font-size:14px;color:#c0392b;font-weight:500;margin-bottom:6px;">
// 				Please carefully review and validate all allocated Units,
// 				Cost Centers, and Location Codes before downloading the
// 				Budget Import Template.
// 			</div>

// 			<div style="color:#777;font-size:13px;">
// 				Do not proceed unless everything has been reviewed and confirmed.
// 			</div>
// 		</div>
// 	`);

// 	confirm_dialog.show();
// }



// function run_download_job($btn, userEmail) {

// 	$btn.prop("disabled", true)
// 		.html('<i class="fa fa-spinner fa-spin"></i> Preparing…');

// 	Loader.show("Generating your template…");

// 	let pct = 5;
// 	let pollInterval = null;

// 	const progressInterval = setInterval(function () {

// 		const step = pct < 40 ? 4 : pct < 65 ? 2 : 0.5;
// 		pct = Math.min(pct + step, 85);

// 		_set_progress(pct);

// 	}, 300);


// 	function cleanup(success) {

// 		clearInterval(progressInterval);

// 		if (pollInterval) clearInterval(pollInterval);

// 		if (success) {

// 			_set_progress(100);
// 			Loader.setText("Download ready!");

// 			setTimeout(function () {

// 				Loader.hide();

// 				$btn.prop("disabled", false)
// 					.html('<i class="fa fa-download"></i> Download Budget Import Template');

// 			}, 800);

// 		} else {

// 			Loader.hide();

// 			$btn.prop("disabled", false)
// 				.html('<i class="fa fa-download"></i> Download Budget Import Template');

// 		}
// 	}


// 	frappe.call({
// 		method: "annual_budget.api.export_reports.start_budget_template_generation",
// 		args: { user: userEmail },

// 		callback: function () {

// 			Loader.setText("Fetching your template…");

// 			pollInterval = setInterval(function () {

// 				const url =
// 					"/api/method/annual_budget.api.export_reports.download_generated_template" +
// 					"?user=" + encodeURIComponent(userEmail);

// 				fetch(url)

// 					.then(function (response) {

// 						if (!response.ok) {
// 							throw new Error("Server returned " + response.status);
// 						}

// 						const contentType = response.headers.get("content-type") || "";

// 						if (contentType.includes("application/json")) {

// 							return response.json().then(function (data) {

// 								if (data.message?.status === "processing") {
// 									Loader.setText("Still generating, please wait…");
// 								}

// 							});
// 						}

// 						clearInterval(pollInterval);

// 						const disposition = response.headers.get("Content-Disposition") || "";
// 						const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)/);

// 						const filename = match
// 							? decodeURIComponent(match[1].trim())
// 							: "budget_import_template.xlsx";

// 						return response.blob().then(function (blob) {

// 							const blobUrl = URL.createObjectURL(blob);

// 							const a = document.createElement("a");
// 							a.href = blobUrl;
// 							a.download = filename;

// 							document.body.appendChild(a);
// 							a.click();
// 							a.remove();

// 							setTimeout(function () {
// 								URL.revokeObjectURL(blobUrl);
// 							}, 2000);

// 							cleanup(true);

// 						});

// 					})

// 					.catch(function (err) {

// 						cleanup(false);

// 						frappe.msgprint({
// 							title: "Download Failed",
// 							message: "Could not download the template.<br><small>" + err.message + "</small>",
// 							indicator: "red"
// 						});

// 					});

// 			}, 3000);

// 		}
// 	});
// }

// function _build_note_html() {

// 	const contacts = [
// 		["Rakesh Ahuja",         "rakesh.ahuja@azimpremjifoundation.org",      "+91 7022068106"],
// 		["Saravana G",           "saravana.g@azimpremjifoundation.org",        "+91 9380861952"],
// 		["Augustin Moses R",     "augustin.moses@azimpremjifoundation.org",    "+91 8667719594"],
// 		["Mercy Selvanayagi R",  "mercy.selvanayagi@azimpremjifoundation.org", "+91 9047828687"],
// 		["Mahaveer Ram P",       "mahaveer.p@azimpremjifoundation.org",        "+91 8825879412"],
// 	];

// 	const contactCards = contacts.map(function (c) {
// 		return `
// 			<div class="contact-card">
// 				<div class="contact-name">${c[0]}</div>
// 				<div class="contact-detail">${c[1]}</div>
// 				<div class="contact-detail">${c[2]}</div>
// 			</div>
// 		`;
// 	}).join("");

// 	return `
// 		<div class="note-warning">
// 			<div class="note-header">
// 				<span class="note-badge blinking-badge">IMPORTANT</span>
// 				Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below.
// 				If you notice any discrepancies, contact the support team immediately.
// 				Do not proceed with the import until all details are verified and confirmed.
// 			</div>
// 			<div class="contact-wrapper">${contactCards}</div>
// 		</div>
// 	`;
// }


// function _build_table_html(rows) {

// 	const COLUMNS = [
// 		["unit",                    "Unit"                    ],
// 		["unit_description",        "Unit Description"        ],
// 		["cost_center",             "Cost Center"             ],
// 		["cost_center_description", "Cost Center Description" ],
// 		["location_code",           "Location Code"           ],
// 		["location_description",    "Location Description"    ],
// 	];

// 	const headerCells = COLUMNS.map(col => `<th>${col[1]}</th>`).join("");

// 	const dataRows = rows.map(function (row, idx) {
// 		const cells = COLUMNS.map(col => `<td>${_esc(row[col[0]] || "")}</td>`).join("");
// 		return `<tr><td>${idx + 1}</td>${cells}</tr>`;
// 	}).join("");

// 	return `
// 		<h4 class="table-title">Allocated Units &amp; Cost Centers</h4>
// 		<div class="table-wrapper">
// 			<table class="mis-table">
// 				<thead>
// 					<tr>
// 						<th>Sl. No.</th>
// 						${headerCells}
// 					</tr>
// 				</thead>
// 				<tbody>${dataRows}</tbody>
// 			</table>
// 		</div>
// 	`;
// }


// /* ============================================================
//    INJECT STYLES
// ============================================================ */

// function inject_styles() {

// 	if (document.getElementById("allocation-style")) return;

// 	const style    = document.createElement("style");
// 	style.id       = "allocation-style";
// 	style.textContent = `

// 	/* ── Page Wrapper ─────────────────────────── */
// 	.budget-import-wrapper {
// 		padding    : 25px;
// 		background : #ffffff;
// 		min-height : 100vh;
// 	}

// 	/* ── Loading / Empty States ───────────────── */
// 	.loading-state,
// 	.empty-state {
// 		text-align  : center;
// 		padding     : 50px;
// 		font-weight : 600;
// 		color       : #0076B6;
// 	}

// 	/* ── Global Search Bar ────────────────────── */
// 	.global-search-wrap { margin-bottom: 30px; }

// 	.global-search-inner {
// 		position    : relative;
// 		display     : flex;
// 		align-items : center;
// 		max-width   : 520px;
// 	}

// 	.global-search-icon {
// 		position       : absolute;
// 		left           : 12px;
// 		color          : #0076B6;
// 		font-size      : 14px;
// 		pointer-events : none;
// 	}

// 	.global-search-input {
// 		width         : 100%;
// 		padding       : 10px 36px;
// 		border        : 1.5px solid #c8dff0;
// 		border-radius : 8px;
// 		font-size     : 14px;
// 		color         : #222;
// 		outline       : none;
// 		background    : #f4f9fd;
// 		transition    : border-color 0.2s, box-shadow 0.2s;
// 	}

// 	.global-search-input:focus {
// 		border-color : #0076B6;
// 		box-shadow   : 0 0 0 3px rgba(0,118,182,0.12);
// 		background   : #ffffff;
// 	}

// 	.global-search-clear {
// 		position   : absolute;
// 		right      : 10px;
// 		font-size  : 18px;
// 		color      : #999;
// 		cursor     : pointer;
// 		transition : color 0.15s;
// 	}

// 	.global-search-clear:hover { color: #c0392b; }

// 	.global-search-count {
// 		margin-top  : 6px;
// 		font-size   : 12px;
// 		color       : #0076B6;
// 		font-weight : 600;
// 		padding-left: 2px;
// 	}

// 	/* ── User Section ─────────────────────────── */
// 	.user-section { margin-bottom: 50px; }

// 	.user-header {
// 		display         : flex;
// 		justify-content : space-between;
// 		align-items     : center;
// 		padding-bottom  : 12px;
// 		border-bottom   : 2px solid #0076B6;
// 		margin-bottom   : 18px;
// 	}

// 	.user-name  { font-size: 18px; font-weight: 700; color: #003B63; }
// 	.user-email { font-size: 13px; color: #555555; }

// 	/* ── Important Note ───────────────────────── */
// 	.note-warning {
// 		background    : #fff8e1;
// 		border-left   : 5px solid #f4b400;
// 		padding       : 16px;
// 		border-radius : 6px;
// 		margin-bottom : 25px;
// 	}

// 	.note-header { font-size: 14px; color: #5c4b00; margin-bottom: 15px; }

// 	.note-badge {
// 		background    : #f4b400;
// 		color         : #ffffff;
// 		font-size     : 11px;
// 		font-weight   : 700;
// 		padding       : 3px 8px;
// 		border-radius : 20px;
// 		margin-right  : 8px;
// 	}

// 	.blinking-badge { animation: softBlink 1.5s ease-in-out infinite; }

// 	@keyframes softBlink {
// 		0%, 100% { opacity: 1;   }
// 		50%      { opacity: 0.5; }
// 	}

// 	/* ── Contact Cards ────────────────────────── */
// 	.contact-wrapper { display: flex; gap: 15px; flex-wrap: wrap; }

// 	.contact-card {
// 		background    : #ffffff;
// 		border        : 1px solid #e6e6e6;
// 		border-radius : 8px;
// 		padding       : 12px 15px;
// 		min-width     : 230px;
// 		box-shadow    : 0 3px 10px rgba(0,0,0,0.04);
// 	}

// 	.contact-name   { font-weight: 600; color: #333333; margin-bottom: 5px; }
// 	.contact-detail { font-size: 13px; color: #555555; }

// 	/* ── Allocation Table ─────────────────────── */
// 	.table-title   { font-size: 15px; font-weight: 600; color: #003B63; margin-bottom: 12px; }
// 	.table-wrapper { overflow-x: auto; }

// 	.mis-table { width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #dcdcdc; }
// 	.mis-table th { background: #0076B6; color: #ffffff; font-weight: 700; padding: 8px; text-align: center; }
// 	.mis-table td { padding: 8px; border: 1px solid #e0e0e0; text-align: center; }
// 	.mis-table tr:nth-child(even) { background: #f9f9f9; }
// 	.mis-table tr:hover           { background: #eef6fb; }

// 	/* ── Confirmation Modal ───────────────────── */
// 	#pro-confirm-overlay {
// 		position        : fixed;
// 		inset           : 0;
// 		background      : rgba(0,0,0,0.5);
// 		display         : none;
// 		align-items     : center;
// 		justify-content : center;
// 		z-index         : 9999;
// 		backdrop-filter : blur(4px);
// 		padding         : 15px;
// 	}

// 	.pro-confirm-box {
// 		background    : #ffffff;
// 		width         : 640px;
// 		max-width     : 100%;
// 		min-height    : 360px;
// 		border-radius : 12px;
// 		box-shadow    : 0 25px 60px rgba(0,0,0,0.25);
// 		padding       : 35px;
// 		animation     : scaleIn 0.25s ease;
// 	}

// 	@keyframes scaleIn {
// 		from { transform: scale(0.95); opacity: 0; }
// 		to   { transform: scale(1);    opacity: 1; }
// 	}

// 	.pro-confirm-header {
// 		display         : flex;
// 		justify-content : space-between;
// 		align-items     : center;
// 		font-weight     : 600;
// 		font-size       : 18px;
// 		margin-bottom   : 25px;
// 	}

// 	.pro-confirm-title i { margin-right: 8px; color: #007bff; }

// 	#pro-confirm-close {
// 		cursor     : pointer;
// 		font-size  : 22px;
// 		color      : #888888;
// 		transition : color 0.2s;
// 	}

// 	#pro-confirm-close:hover { color: #000000; }

// 	.pro-confirm-body  { text-align: center; margin-bottom: 25px; }
// 	.pro-warning-icon  { font-size: 42px; color: #e74c3c; margin-bottom: 15px; }
// 	.pro-warning-text  { font-weight: 600; font-size: 16px; color: #c0392b; margin-bottom: 15px; line-height: 1.6; }
// 	.pro-warning-sub   { font-size: 14px; color: #555555; margin-bottom: 25px; line-height: 1.6; }

// 	.pro-checkbox-wrapper {
// 		background    : #f8f9fa;
// 		padding       : 18px;
// 		border-radius : 8px;
// 		border        : 1px solid #e0e0e0;
// 		font-size     : 14px;
// 		text-align    : left;
// 	}

// 	.pro-checkbox-label { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
// 	.pro-checkbox-label i { color: #28a745; margin-right: 6px; }
// 	.pro-checkbox-wrapper input { margin-top: 4px; transform: scale(1.1); }

// 	.pro-confirm-footer { text-align: right; margin-top: 20px; }
// 	.pro-confirm-footer button { margin-left: 12px; min-width: 170px; }
// 	#pro-confirm-yes:disabled { opacity: 0.6; cursor: not-allowed; }

// 	/* ── APF Loader Overlay ───────────────────── */
// 	#global-loader.loader-overlay {
// 		position        : fixed;
// 		inset           : 0;
// 		width           : 100vw;
// 		height          : 100vh;
// 		background      : rgba(18,18,18,0.92);
// 		backdrop-filter : blur(6px);
// 		z-index         : 999999;
// 		display         : none;
// 		align-items     : center;
// 		justify-content : center;
// 	}

// 	#global-loader.loader-overlay.active { display: flex; }

// 	.loader-box {
// 		display         : flex;
// 		flex-direction  : column;
// 		align-items     : center;
// 		justify-content : center;
// 		gap             : 16px;
// 	}

// 	.loader-ring-wrap {
// 		position        : relative;
// 		width           : 120px;
// 		height          : 120px;
// 		display         : flex;
// 		align-items     : center;
// 		justify-content : center;
// 	}

// 	.loader-ring {
// 		position  : absolute;
// 		inset     : 0;
// 		width     : 100%;
// 		height    : 100%;
// 		transform : rotate(-90deg);
// 	}

// 	.loader-ring-bg {
// 		fill         : none;
// 		stroke       : rgba(255,255,255,0.12);
// 		stroke-width : 6;
// 	}

// 	.loader-ring-fill {
// 		fill              : none;
// 		stroke            : url(#ringGrad);
// 		stroke-width      : 6;
// 		stroke-linecap    : round;
// 		stroke-dasharray  : 276.46;
// 		stroke-dashoffset : 276.46;
// 		transition        : stroke-dashoffset 0.35s ease;
// 	}

// 	.loader-logo {
// 		width         : 78px;
// 		height        : 78px;
// 		border-radius : 50%;
// 		background    : linear-gradient(145deg, #ffffff, #eaeaea);
// 		padding       : 12px;
// 		object-fit    : contain;
// 		box-shadow    : 0 8px 24px rgba(0,0,0,.35);
// 		animation     : pulse 1.6s infinite ease-in-out;
// 		position      : relative;
// 		z-index       : 1;
// 	}

// 	.loader-pct-inside {
// 		position      : absolute;
// 		bottom        : -4px;
// 		left          : 50%;
// 		transform     : translateX(-50%);
// 		font-size     : 11px;
// 		font-weight   : 700;
// 		color         : #ffffff;
// 		background    : rgba(0,118,182,0.85);
// 		padding       : 1px 7px;
// 		border-radius : 99px;
// 		z-index       : 2;
// 		white-space   : nowrap;
// 	}

// 	.loader-text {
// 		font-size      : 14px;
// 		color          : #ffffff;
// 		font-weight    : 600;
// 		letter-spacing : 0.5px;
// 		text-align     : center;
// 		opacity        : 0.85;
// 	}

// 	@keyframes pulse {
// 		0%, 100% { transform: scale(1);    opacity: 0.85; }
// 		50%      { transform: scale(1.06); opacity: 1;    }
// 	}

// 	/* ── Download Animation ───────────────────── */
// 	.dl-anim-wrap {
// 		display        : flex;
// 		flex-direction : column;
// 		align-items    : center;
// 		gap            : 6px;
// 		width          : 60px;
// 	}

// 	.dl-arrow-track {
// 		width    : 24px;
// 		height   : 28px;
// 		overflow : hidden;
// 		position : relative;
// 	}

// 	.dl-arrow {
// 		display        : flex;
// 		flex-direction : column;
// 		align-items    : center;
// 		position       : absolute;
// 		top            : 0;
// 		left           : 50%;
// 		transform      : translateX(-50%);
// 		animation      : dl-drop 1.2s ease-in-out infinite;
// 	}

// 	.dl-arrow-stem {
// 		width         : 3px;
// 		height        : 14px;
// 		background    : linear-gradient(180deg, #00c6ff, #0076B6);
// 		border-radius : 2px;
// 	}

// 	.dl-arrow-head {
// 		width        : 0;
// 		height       : 0;
// 		border-left  : 7px solid transparent;
// 		border-right : 7px solid transparent;
// 		border-top   : 9px solid #0076B6;
// 	}

// 	@keyframes dl-drop {
// 		0%   { top: -28px; opacity: 0; }
// 		30%  { opacity: 1; }
// 		70%  { opacity: 1; }
// 		100% { top: 28px;  opacity: 0; }
// 	}

// 	.dl-bar {
// 		width         : 44px;
// 		height        : 4px;
// 		background    : linear-gradient(90deg, #0076B6, #00c6ff);
// 		border-radius : 99px;
// 		animation     : dl-bar-pulse 1.2s ease-in-out infinite;
// 	}

// 	@keyframes dl-bar-pulse {
// 		0%, 100% { opacity: 0.4; transform: scaleX(0.8); }
// 		50%      { opacity: 1;   transform: scaleX(1);   }
// 	}

// 	.dl-dots { display: flex; gap: 5px; }

// 	.dl-dots span {
// 		width         : 5px;
// 		height        : 5px;
// 		border-radius : 50%;
// 		background    : rgba(255,255,255,0.6);
// 		animation     : dl-bounce 1.2s ease-in-out infinite;
// 	}

// 	.dl-dots span:nth-child(1) { animation-delay: 0s;   }
// 	.dl-dots span:nth-child(2) { animation-delay: 0.2s; }
// 	.dl-dots span:nth-child(3) { animation-delay: 0.4s; }

// 	@keyframes dl-bounce {
// 		0%, 80%, 100% { transform: scale(1);   opacity: 0.5; }
// 		40%           { transform: scale(1.5); opacity: 1;   }
// 	}

// 	/* ── Responsive ───────────────────────────── */
// 	@media (max-width: 768px) {
// 		.user-header { flex-direction: column; align-items: flex-start; gap: 10px; }
// 	}

// 	@media (max-width: 576px) {
// 		.global-search-inner { max-width: 100%; }
// 		.pro-confirm-box     { width: 100%; min-height: auto; padding: 25px; }
// 		.pro-confirm-header  { font-size: 16px; }
// 		.pro-warning-text    { font-size: 15px; }
// 		.pro-confirm-footer  { text-align: center; }
// 		.pro-confirm-footer button { width: 100%; margin: 8px 0; }
// 	}
// 	`;

// 	document.head.appendChild(style);
// }














// frappe.pages["import-template"].on_page_load = function (wrapper) {

// 	frappe.ui.make_app_page({
// 		parent      : wrapper,
// 		title       : "Budget Import Template",
// 		single_column: true,
// 	});

// 	const $container = $(wrapper).find(".layout-main-section");
// 	$container.addClass("budget-import-wrapper");

// 	inject_styles();

// 	$container.html(`
// 		<div class="loading-state">
// 			<i class="fa fa-spinner fa-spin"></i> Loading Data…
// 		</div>
// 	`);

// 	frappe.call({
// 		method  : "annual_budget.api.filter_options.get_user_mappings",
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) {
// 				$container.html(`<div class="empty-state">No Data Found</div>`);
// 				return;
// 			}
// 			render_content($container, r.message);
// 		}
// 	});

// };


// /* ============================================================
//    LOADER
// ============================================================ */

// function _init_loader() {
// 	if ($("#global-loader").length) return;
// 	$("body").append(`
// 		<div id="global-loader" class="loader-overlay">
// 			<div class="loader-box">

// 				<div class="loader-ring-wrap">
// 					<svg class="loader-ring" viewBox="0 0 100 100">
// 						<defs>
// 							<linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
// 								<stop offset="0%"   stop-color="#0076B6"/>
// 								<stop offset="100%" stop-color="#00c6ff"/>
// 							</linearGradient>
// 						</defs>
// 						<circle class="loader-ring-bg"   cx="50" cy="50" r="44"/>
// 						<circle class="loader-ring-fill" id="loader-ring-fill" cx="50" cy="50" r="44"/>
// 					</svg>
// 					<img src="/files/APF logo.png" class="loader-logo" alt="Loading">
// 					<div class="loader-pct-inside" id="loader-pct">0%</div>
// 				</div>

// 				<div class="dl-anim-wrap">
// 					<div class="dl-arrow-track">
// 						<div class="dl-arrow">
// 							<div class="dl-arrow-stem"></div>
// 							<div class="dl-arrow-head"></div>
// 						</div>
// 					</div>
// 					<div class="dl-bar"></div>
// 					<div class="dl-dots">
// 						<span></span><span></span><span></span>
// 					</div>
// 				</div>

// 				<div class="loader-text" id="loader-text-msg">Preparing download…</div>

// 			</div>
// 		</div>
// 	`);
// }

// const Loader = {
// 	show(msg = "Preparing download…") {
// 		_init_loader();
// 		$("#loader-text-msg").text(msg);
// 		_set_progress(0);
// 		$("#global-loader").addClass("active");
// 	},
// 	setText(msg) {
// 		$("#loader-text-msg").text(msg);
// 	},
// 	hide() {
// 		$("#global-loader").removeClass("active");
// 	}
// };

// /* SVG ring — circumference for r=44: 2π×44 ≈ 276.46 */
// function _set_progress(pct) {
// 	const offset = 276.46 - (pct / 100) * 276.46;
// 	$("#loader-ring-fill").css("stroke-dashoffset", offset);
// 	$("#loader-pct").text(Math.round(pct) + "%");
// }


// /* ============================================================
//    MODAL SYSTEM
// ============================================================ */

// function _init_modal() {
// 	if ($("#apf-modal-overlay").length) return;
// 	$("body").append(`
// 		<div id="apf-modal-overlay">
// 			<div class="apf-modal-box">

// 				<div class="apf-modal-header">
// 					<div class="apf-modal-title" id="apf-modal-title"></div>
// 					<span id="apf-modal-close" title="Close">&times;</span>
// 				</div>

// 				<div class="apf-modal-body">
// 					<div class="apf-modal-icon" id="apf-modal-icon">
// 						<i id="apf-modal-icon-i" class="fa"></i>
// 					</div>
// 					<div class="apf-modal-text" id="apf-modal-text"></div>
// 					<div class="apf-modal-sub"  id="apf-modal-sub"></div>

// 					<div class="apf-checkbox-wrapper" id="apf-checkbox-wrap" style="display:none;">
// 						<label class="apf-checkbox-label">
// 							<input type="checkbox" id="apf-modal-checkbox">
// 							<span>
// 								<i class="fa fa-check-circle"></i>
// 								I confirm that I have verified all details carefully.
// 							</span>
// 						</label>
// 					</div>
// 				</div>

// 				<div class="apf-modal-footer" id="apf-modal-footer"></div>

// 			</div>
// 		</div>
// 	`);

// 	$(document)
// 		.off(".apfModal")
// 		.on("click.apfModal", "#apf-modal-close", _hide_modal)
// 		.on("click.apfModal", "#apf-modal-overlay", function (e) {
// 			if ($(e.target).is("#apf-modal-overlay")) _hide_modal();
// 		})
// 		.on("change.apfModal", "#apf-modal-checkbox", function () {
// 			$("#apf-modal-proceed").prop("disabled", !this.checked);
// 		});
// }

// function _hide_modal() {
// 	$("#apf-modal-overlay").hide();
// 	$("#apf-modal-checkbox").prop("checked", false);
// 	$("#apf-modal-proceed").prop("disabled", true);
// }

// function _show_modal(opts) {
// 	_init_modal();

// 	$("#apf-modal-title").html(opts.title || "");

// 	$("#apf-modal-icon-i")
// 		.attr("class", "fa " + (opts.icon || "fa-exclamation-triangle"))
// 		.closest(".apf-modal-icon")
// 		.css("color", opts.iconColor || "#e74c3c");

// 	$("#apf-modal-text").html(opts.text || "");
// 	$("#apf-modal-sub").html(opts.sub   || "");

// 	const showCb = !!opts.showCheckbox;
// 	$("#apf-checkbox-wrap").toggle(showCb);
// 	if (showCb) $("#apf-modal-checkbox").prop("checked", false);

// 	const $footer = $("#apf-modal-footer").empty();
// 	(opts.buttons || []).forEach(function (btn) {
// 		const $b = $(`
// 			<button id="${btn.id || ""}" class="btn ${btn.cls || "btn-default"} btn-sm">
// 				${btn.label}
// 			</button>
// 		`).prop("disabled", !!btn.disabled);
// 		$b.on("click", function () { btn.onClick && btn.onClick(); });
// 		$footer.append($b);
// 	});

// 	$("#apf-modal-overlay").css("display", "flex");
// }


// /* ============================================================
//    RENDER CONTENT
// ============================================================ */

// function render_content(container, data) {

// 	// ── Role detection ─────────────────────────────────────
// 	const roles                = Array.isArray(frappe.user_roles) ? frappe.user_roles : [];
// 	const isFinanceCoordinator = roles.includes("Finance Unit Coordinator");
// 	const isSystemManager      = roles.includes("System Manager");
// 	const isFinanceAdmin       = roles.includes("Finance Admin");

// 	// Modal shown only to Finance Unit Coordinator (NOT to System Manager or Finance Admin)
// 	const needsModal    = isFinanceCoordinator && !isSystemManager && !isFinanceAdmin;

// 	// Only System Manager / Finance Admin get the expand/collapse checkbox
// 	const isCollapsible = isSystemManager || isFinanceAdmin;

// 	// ── Group rows by user email ───────────────────────────
// 	const grouped = {};
// 	data.forEach(function (row) {
// 		if (!grouped[row.user]) {
// 			grouped[row.user] = {
// 				user_fullname: row.user_fullname || "",
// 				email        : row.user,
// 				rows         : []
// 			};
// 		}
// 		grouped[row.user].rows.push(row);
// 	});

// 	container.empty();

// 	// ── Global Search Bar ──────────────────────────────────
// 	container.append(`
// 		<div class="global-search-wrap">
// 			<div class="global-search-inner">
// 				<i class="fa fa-search global-search-icon"></i>
// 				<input
// 					type         = "text"
// 					id           = "global-table-search"
// 					class        = "global-search-input"
// 					placeholder  = "Search across all units, cost centers, locations…"
// 					autocomplete = "off"
// 				/>
// 				<span id="global-search-clear" class="global-search-clear" title="Clear">&times;</span>
// 			</div>
// 			<div id="global-search-count" class="global-search-count" style="display:none;"></div>
// 		</div>
// 	`);

// 	// ── User Sections ──────────────────────────────────────
// 	Object.values(grouped).forEach(function (userData) {

// 		const displayName = userData.user_fullname || userData.email;
// 		const rowCount    = userData.rows.length;
// 		// Unique ID per section for checkbox binding
// 		const cbId        = "expand-cb-" + userData.email.replace(/[^a-z0-9]/gi, "_");

// 		const $section = $(`
// 			<div class="user-section">

// 				<div class="user-header ${isCollapsible ? "user-header-collapsible" : ""}">
// 					<div class="user-header-left">
// 						<div class="user-name">${_esc(displayName)}</div>
// 						<div class="user-email">${_esc(userData.email)}</div>
// 					</div>
// 					<div class="user-header-right">
// 						<div class="button-container"></div>
// 						${isCollapsible ? `
// 						<label class="expand-toggle-label" title="Expand / Collapse rows">
// 							<input type="checkbox" id="${cbId}" class="expand-toggle-cb" autocomplete="off">
// 							<span class="expand-toggle-track">
// 								<span class="expand-toggle-thumb"></span>
// 							</span>
// 							<span class="expand-toggle-text">
// 								View ${rowCount} row${rowCount !== 1 ? "s" : ""}
// 							</span>
// 						</label>` : ""}
// 					</div>
// 				</div>

// 				<div class="user-body" style="display:${isCollapsible ? "none" : "block"};"></div>

// 			</div>
// 		`);

// 		container.append($section);

// 		// ── Checkbox expand/collapse (admin roles only) ────
// 		if (isCollapsible) {
// 			$section.find(".expand-toggle-cb").on("change", function () {
// 				const $body    = $section.find(".user-body");
// 				const $header  = $section.find(".user-header");
// 				const $text    = $section.find(".expand-toggle-text");
// 				const expanded = this.checked;

// 				if (expanded) {
// 					$body.slideDown(200);
// 					$header.addClass("is-open");
// 					$text.text("Collapse");
// 				} else {
// 					$body.slideUp(200);
// 					$header.removeClass("is-open");
// 					$text.text("View " + rowCount + " row" + (rowCount !== 1 ? "s" : ""));
// 				}
// 			});
// 		}

// 		// ── Download Button ────────────────────────────────
// 		const $dlBtn = $(`
// 			<button class="btn btn-primary btn-sm dl-btn">
// 				<i class="fa fa-download"></i> Download Budget Import Template
// 			</button>
// 		`);
// 		$section.find(".button-container").append($dlBtn);

// 		$dlBtn.on("click", function () {
// 			if (needsModal) {
// 				_check_and_download($(this), userData.email, false);
// 			} else {
// 				// System Manager / Finance Admin — check template but with admin-specific error
// 				_check_and_download($(this), userData.email, true);
// 			}
// 		});

// 		// ── Body: note (Finance Coordinator only) + table ──
// 		const $body = $section.find(".user-body");
// 		if (needsModal) $body.append(_build_note_html());
// 		$body.append(_build_table_html(userData.rows));
// 	});

// 	// ── Global Search ──────────────────────────────────────
// 	$(document)
// 		.off(".globalSearch")
// 		.on("input.globalSearch", "#global-table-search", function () {
// 			_run_search(this.value);
// 		})
// 		.on("click.globalSearch", "#global-search-clear", function () {
// 			$("#global-table-search").val("").trigger("input");
// 		});

// 	$("#global-search-clear").hide();
// }

// function _run_search(query) {
// 	const q = query.trim().toLowerCase();
// 	let total = 0;

// 	$(".user-section").each(function () {
// 		const $sec = $(this);
// 		let visible = 0;

// 		$sec.find(".mis-table tbody tr").each(function () {
// 			const match = !q || this.textContent.toLowerCase().includes(q);
// 			$(this).toggle(match);
// 			if (match) { visible++; total++; }
// 		});

// 		// When searching: auto-expand sections that have matches
// 		if (q && visible > 0) {
// 			const $cb     = $sec.find(".expand-toggle-cb");
// 			const $header = $sec.find(".user-header");
// 			const $text   = $sec.find(".expand-toggle-text");
// 			$sec.find(".user-body").show();
// 			if ($cb.length) {
// 				$cb.prop("checked", true);
// 				$header.addClass("is-open");
// 				$text.text("Collapse");
// 			}
// 		}

// 		$sec.toggle(!q || visible > 0);
// 	});

// 	const $count = $("#global-search-count");
// 	if (q) {
// 		$count.text(`${total} row${total !== 1 ? "s" : ""} matched`).show();
// 	} else {
// 		$count.hide();
// 	}
// 	$("#global-search-clear").toggle(q.length > 0);
// }


// /* ============================================================
//    DOWNLOAD FLOW
//    isAdmin = true  → System Manager / Finance Admin
//    isAdmin = false → Finance Unit Coordinator
// ============================================================ */

// function _check_and_download($btn, userEmail, isAdmin) {

// 	_reset_btn($btn, true);

// 	frappe.call({
// 		method : "frappe.client.get_value",
// 		args   : {
// 			doctype  : "Finance user access",
// 			filters  : { user: userEmail },
// 			fieldname: "import_template_id"
// 		},

// 		callback: function (r) {
// 			_reset_btn($btn, false);

// 			const templateId = r.message && r.message.import_template_id;

// 			if (!templateId) {
// 				if (isAdmin) {
// 					// ── Admin-specific error message ──────────────
// 					_show_modal({
// 						title    : '<i class="fa fa-exclamation-triangle"></i> Template Not Configured',
// 						icon     : "fa-exclamation-triangle",
// 						iconColor: "#e67e22",
// 						text     : "No Import Template is linked for this user account.",
// 						sub      : `The <b>import_template_id</b> field in <b>Finance User Access</b>
// 						            is empty for <b>${_esc(userEmail)}</b>.<br><br>
// 						            Please open the <b>Finance User Access</b> record for this user
// 						            and assign a valid <b>Import Template</b> before retrying.`,
// 						buttons  : [
// 							{
// 								label  : '<i class="fa fa-times"></i> Close',
// 								cls    : "btn-default",
// 								onClick: _hide_modal
// 							}
// 						]
// 					});
// 				} else {
// 					// ── Finance Coordinator error message ─────────
// 					_show_modal({
// 						title    : '<i class="fa fa-exclamation-triangle"></i> Import Template Missing',
// 						icon     : "fa-exclamation-triangle",
// 						iconColor: "#e74c3c",
// 						text     : "Import Template is not configured for this account.",
// 						sub      : `Please contact your administrator to link an
// 						            <b>Import Template</b> in <b>Finance User Access</b>
// 						            before downloading the Budget Import Template.`,
// 						buttons  : [
// 							{
// 								label  : '<i class="fa fa-times"></i> Close',
// 								cls    : "btn-default",
// 								onClick: _hide_modal
// 							}
// 						]
// 					});
// 				}
// 				return;
// 			}

// 			// Template exists
// 			// Admin roles → skip confirm modal, download directly
// 			// Finance Coordinator → show confirm modal first
// 			if (isAdmin) {
// 				_run_download($btn, userEmail);
// 			} else {
// 				_show_confirm_modal($btn, userEmail);
// 			}
// 		},

// 		error: function () {
// 			_reset_btn($btn, false);
// 			frappe.msgprint({
// 				title    : "Check Failed",
// 				message  : "Could not verify the Import Template. Please try again.",
// 				indicator: "red"
// 			});
// 		}
// 	});
// }



// function _show_confirm_modal($btn, userEmail) {
// 	_show_modal({
// 		title       : '<i class="fa fa-download"></i> Confirm Download',
// 		icon        : "fa-exclamation-triangle",
// 		iconColor   : "#e74c3c",
// 		text        : `Please carefully review and validate all allocated Units, Cost Centers,
// 		               and Location Codes before downloading the Budget Import Template.`,
// 		sub         : "Do not proceed unless everything has been reviewed and confirmed.",
// 		showCheckbox: true,
// 		buttons     : [
// 			{
// 				label  : '<i class="fa fa-times"></i> Cancel',
// 				cls    : "btn-default",
// 				onClick: _hide_modal
// 			},
// 			{
// 				id      : "apf-modal-proceed",
// 				label   : '<i class="fa fa-download"></i> Proceed to Download',
// 				cls     : "btn-primary",
// 				disabled: true,
// 				onClick : function () {
// 					_hide_modal();
// 					_run_download($btn, userEmail);
// 				}
// 			}
// 		]
// 	});
// }


// function _run_download($btn, userEmail) {

// 	_reset_btn($btn, true);
// 	Loader.show("Generating your template…");

// 	let pct           = 5;
// 	let progressTimer = null;
// 	let pollTimer     = null;

// 	progressTimer = setInterval(function () {
// 		const step = pct < 40 ? 4 : pct < 65 ? 2 : 0.5;
// 		pct = Math.min(pct + step, 85);
// 		_set_progress(pct);
// 	}, 300);

// 	function cleanup(success) {
// 		clearInterval(progressTimer);
// 		clearInterval(pollTimer);
// 		progressTimer = null;
// 		pollTimer     = null;

// 		if (success) {
// 			_set_progress(100);
// 			Loader.setText("Download ready!");
// 			setTimeout(function () {
// 				Loader.hide();
// 				_reset_btn($btn, false);
// 			}, 900);
// 		} else {
// 			Loader.hide();
// 			_reset_btn($btn, false);
// 		}
// 	}

// 	frappe.call({
// 		method: "annual_budget.api.export_reports.start_budget_template_generation",
// 		args  : { user: userEmail },

// 		callback: function () {
// 			Loader.setText("Fetching your template…");

// 			pollTimer = setInterval(function () {

// 				const url =
// 					"/api/method/annual_budget.api.export_reports.download_generated_template" +
// 					"?user=" + encodeURIComponent(userEmail);

// 				fetch(url)
// 					.then(function (response) {

// 						if (!response.ok) throw new Error("Server returned " + response.status);

// 						const ct = response.headers.get("content-type") || "";

// 						if (ct.includes("application/json")) {
// 							return response.json().then(function (data) {
// 								if (data.message?.status === "processing") {
// 									Loader.setText("Still generating, please wait…");
// 								}
// 							});
// 						}

// 						clearInterval(pollTimer);
// 						pollTimer = null;

// 						const disp     = response.headers.get("Content-Disposition") || "";
// 						const match    = disp.match(/filename[^;=\n]*=["']?([^"';\n]+)/);
// 						const filename = match
// 							? decodeURIComponent(match[1].trim())
// 							: "budget_import_template.xlsx";

// 						return response.blob().then(function (blob) {
// 							const blobUrl = URL.createObjectURL(blob);
// 							const a       = document.createElement("a");
// 							a.href        = blobUrl;
// 							a.download    = filename;
// 							document.body.appendChild(a);
// 							a.click();
// 							a.remove();
// 							setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 2000);
// 							cleanup(true);
// 						});

// 					})
// 					.catch(function (err) {
// 						cleanup(false);
// 						frappe.msgprint({
// 							title    : "Download Failed",
// 							message  : "Could not download the template. Please try again.<br><small>" + err.message + "</small>",
// 							indicator: "red"
// 						});
// 					});

// 			}, 3000);
// 		},

// 		error: function () {
// 			cleanup(false);
// 			frappe.msgprint({
// 				title    : "Request Failed",
// 				message  : "Could not start template generation. Please try again.",
// 				indicator: "red"
// 			});
// 		}
// 	});
// }


// /* ============================================================
//    SHARED HELPERS
// ============================================================ */

// function _esc(str) {
// 	return $("<div>").text(str || "").html();
// }

// function _reset_btn($btn, loading) {
// 	$btn
// 		.prop("disabled", loading)
// 		.html(
// 			loading
// 				? '<i class="fa fa-spinner fa-spin"></i> Checking…'
// 				: '<i class="fa fa-download"></i> Download Budget Import Template'
// 		);
// }

// function _build_note_html() {

// 	const contacts = [
// 		["Rakesh Ahuja",        "rakesh.ahuja@azimpremjifoundation.org",      "+91 7022068106"],
// 		["Saravana G",          "saravana.g@azimpremjifoundation.org",        "+91 9380861952"],
// 		["Augustin Moses R",    "augustin.moses@azimpremjifoundation.org",    "+91 8667719594"],
// 		["Mercy Selvanayagi R", "mercy.selvanayagi@azimpremjifoundation.org", "+91 9047828687"],
// 		["Mahaveer Ram P",      "mahaveer.p@azimpremjifoundation.org",        "+91 8825879412"],
// 	];

// 	const cards = contacts.map(c => `
// 		<div class="contact-card">
// 			<div class="contact-name">${c[0]}</div>
// 			<div class="contact-detail">${c[1]}</div>
// 			<div class="contact-detail">${c[2]}</div>
// 		</div>
// 	`).join("");

// 	return `
// 		<div class="note-warning">
// 			<div class="note-header">
// 				<span class="note-badge blinking-badge">IMPORTANT</span>
// 				Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below.
// 				If you notice any discrepancies, contact the support team immediately.
// 				Do not proceed with the import until all details are verified and confirmed.
// 			</div>
// 			<div class="contact-wrapper">${cards}</div>
// 		</div>
// 	`;
// }

// function _build_table_html(rows) {

// 	const COLS = [
// 		["unit",                    "Unit"                    ],
// 		["unit_description",        "Unit Description"        ],
// 		["cost_center",             "Cost Center"             ],
// 		["cost_center_description", "Cost Center Description" ],
// 		["location_code",           "Location Code"           ],
// 		["location_description",    "Location Description"    ],
// 	];

// 	const headers  = COLS.map(c => `<th>${c[1]}</th>`).join("");
// 	const bodyRows = rows.map((row, i) => {
// 		const cells = COLS.map(c => `<td>${_esc(row[c[0]] || "")}</td>`).join("");
// 		return `<tr><td>${i + 1}</td>${cells}</tr>`;
// 	}).join("");

// 	return `
// 		<h4 class="table-title">Allocated Units &amp; Cost Centers</h4>
// 		<div class="table-wrapper">
// 			<table class="mis-table">
// 				<thead><tr><th>Sl. No.</th>${headers}</tr></thead>
// 				<tbody>${bodyRows}</tbody>
// 			</table>
// 		</div>
// 	`;
// }


// /* ============================================================
//    INJECT STYLES
// ============================================================ */

// function inject_styles() {

// 	if (document.getElementById("allocation-style")) return;

// 	const style  = document.createElement("style");
// 	style.id     = "allocation-style";
// 	style.textContent = `

// 	/* ── Page Wrapper ─────────────────────────── */
// 	.budget-import-wrapper {
// 		padding    : 25px;
// 		background : #ffffff;
// 		min-height : 100vh;
// 	}

// 	/* ── Loading / Empty States ───────────────── */
// 	.loading-state,
// 	.empty-state {
// 		text-align  : center;
// 		padding     : 50px;
// 		font-weight : 600;
// 		color       : #0076B6;
// 	}

// 	/* ── Global Search ────────────────────────── */
// 	.global-search-wrap { margin-bottom: 30px; }

// 	.global-search-inner {
// 		position    : relative;
// 		display     : flex;
// 		align-items : center;
// 		max-width   : 520px;
// 	}

// 	.global-search-icon {
// 		position       : absolute;
// 		left           : 12px;
// 		color          : #0076B6;
// 		font-size      : 14px;
// 		pointer-events : none;
// 	}

// 	.global-search-input {
// 		width         : 100%;
// 		padding       : 10px 36px;
// 		border        : 1.5px solid #c8dff0;
// 		border-radius : 8px;
// 		font-size     : 14px;
// 		color         : #222;
// 		outline       : none;
// 		background    : #f4f9fd;
// 		transition    : border-color 0.2s, box-shadow 0.2s;
// 	}

// 	.global-search-input:focus {
// 		border-color : #0076B6;
// 		box-shadow   : 0 0 0 3px rgba(0,118,182,0.12);
// 		background   : #ffffff;
// 	}

// 	.global-search-clear {
// 		position   : absolute;
// 		right      : 10px;
// 		font-size  : 18px;
// 		color      : #999;
// 		cursor     : pointer;
// 		transition : color 0.15s;
// 	}

// 	.global-search-clear:hover { color: #c0392b; }

// 	.global-search-count {
// 		margin-top  : 6px;
// 		font-size   : 12px;
// 		color       : #0076B6;
// 		font-weight : 600;
// 		padding-left: 2px;
// 	}

// 	/* ── User Section ─────────────────────────── */
// 	.user-section { margin-bottom: 40px; }

// 	.user-header {
// 		display         : flex;
// 		justify-content : space-between;
// 		align-items     : center;
// 		padding-bottom  : 12px;
// 		border-bottom   : 2px solid #0076B6;
// 		margin-bottom   : 18px;
// 	}

// 	.user-header.user-header-collapsible {
// 		padding       : 14px 18px;
// 		background    : #f4f9fd;
// 		border        : 1px solid #d0e8f5;
// 		border-bottom : 1px solid #d0e8f5;
// 		border-radius : 8px;
// 		margin-bottom : 0;
// 	}

// 	.user-header.user-header-collapsible.is-open {
// 		border-radius : 8px 8px 0 0;
// 	}

// 	.user-header-left { flex: 1; }

// 	.user-header-right {
// 		display     : flex;
// 		align-items : center;
// 		gap         : 10px;
// 		flex-shrink : 0;
// 	}

// 	.user-name  { font-size: 16px; font-weight: 700; color: #003B63; }
// 	.user-email { font-size: 12px; color: #666; margin-top: 2px; }

// 	/* ── Expand/Collapse Toggle (checkbox + toggle switch) ── */
// 	.expand-toggle-label {
// 		display     : flex;
// 		align-items : center;
// 		gap         : 8px;
// 		cursor      : pointer;
// 		user-select : none;
// 		margin      : 0;
// 	}

// 	/* Hide the real checkbox visually */
// 	.expand-toggle-cb {
// 		position : absolute;
// 		opacity  : 0;
// 		width    : 0;
// 		height   : 0;
// 		margin   : 0;
// 	}

// 	/* Toggle track */
// 	.expand-toggle-track {
// 		position      : relative;
// 		width         : 36px;
// 		height        : 20px;
// 		background    : #c8dff0;
// 		border-radius : 99px;
// 		flex-shrink   : 0;
// 		transition    : background 0.2s;
// 	}

// 	/* Toggle thumb */
// 	.expand-toggle-thumb {
// 		position      : absolute;
// 		top           : 3px;
// 		left          : 3px;
// 		width         : 14px;
// 		height        : 14px;
// 		background    : #fff;
// 		border-radius : 50%;
// 		box-shadow    : 0 1px 4px rgba(0,0,0,0.2);
// 		transition    : left 0.2s, background 0.2s;
// 	}

// 	/* Checked state */
// 	.expand-toggle-cb:checked + .expand-toggle-track {
// 		background : #0076B6;
// 	}

// 	.expand-toggle-cb:checked + .expand-toggle-track .expand-toggle-thumb {
// 		left : 19px;
// 	}

// 	/* Focus ring for accessibility */
// 	.expand-toggle-cb:focus-visible + .expand-toggle-track {
// 		outline        : 2px solid #0076B6;
// 		outline-offset : 2px;
// 	}

// 	.expand-toggle-text {
// 		font-size   : 12px;
// 		color       : #0076B6;
// 		font-weight : 600;
// 		white-space : nowrap;
// 	}

// 	/* Collapsible body */
// 	.user-header-collapsible + .user-body {
// 		border        : 1px solid #d0e8f5;
// 		border-top    : none;
// 		border-radius : 0 0 8px 8px;
// 		padding       : 20px 18px 18px;
// 		background    : #ffffff;
// 	}

// 	.user-header:not(.user-header-collapsible) + .user-body {
// 		padding    : 0;
// 		border     : none;
// 		background : transparent;
// 	}

// 	/* ── Important Note ───────────────────────── */
// 	.note-warning {
// 		background    : #fff8e1;
// 		border-left   : 5px solid #f4b400;
// 		padding       : 16px;
// 		border-radius : 6px;
// 		margin-bottom : 25px;
// 	}

// 	.note-header { font-size: 14px; color: #5c4b00; margin-bottom: 15px; line-height: 1.7; }

// 	.note-badge {
// 		background    : #f4b400;
// 		color         : #fff;
// 		font-size     : 11px;
// 		font-weight   : 700;
// 		padding       : 3px 8px;
// 		border-radius : 20px;
// 		margin-right  : 8px;
// 	}

// 	.blinking-badge { animation: softBlink 1.5s ease-in-out infinite; }

// 	@keyframes softBlink {
// 		0%, 100% { opacity: 1;   }
// 		50%      { opacity: 0.5; }
// 	}

// 	/* ── Contact Cards ────────────────────────── */
// 	.contact-wrapper { display: flex; gap: 12px; flex-wrap: wrap; }

// 	.contact-card {
// 		background    : #fff;
// 		border        : 1px solid #e6e6e6;
// 		border-radius : 8px;
// 		padding       : 12px 15px;
// 		min-width     : 220px;
// 		box-shadow    : 0 2px 8px rgba(0,0,0,0.04);
// 	}

// 	.contact-name   { font-weight: 600; color: #333; margin-bottom: 4px; font-size: 13px; }
// 	.contact-detail { font-size: 12px; color: #666; line-height: 1.6; }

// 	/* ── Allocation Table ─────────────────────── */
// 	.table-title   { font-size: 14px; font-weight: 600; color: #003B63; margin-bottom: 10px; }
// 	.table-wrapper { overflow-x: auto; }

// 	.mis-table {
// 		width           : 100%;
// 		border-collapse : collapse;
// 		font-size       : 13px;
// 		border          : 1px solid #dcdcdc;
// 	}

// 	.mis-table th {
// 		background  : #0076B6;
// 		color       : #fff;
// 		font-weight : 700;
// 		padding     : 9px 10px;
// 		text-align  : center;
// 		white-space : nowrap;
// 	}

// 	.mis-table td {
// 		padding    : 8px 10px;
// 		border     : 1px solid #e0e0e0;
// 		text-align : center;
// 	}

// 	.mis-table tr:nth-child(even) { background: #f9f9f9; }
// 	.mis-table tr:hover           { background: #eef6fb; }

// 	/* ══════════════════════════════════════════
// 	   APF MODAL
// 	══════════════════════════════════════════ */

// 	#apf-modal-overlay {
// 		position        : fixed;
// 		inset           : 0;
// 		background      : rgba(0,0,0,0.5);
// 		display         : none;
// 		align-items     : center;
// 		justify-content : center;
// 		z-index         : 9999;
// 		backdrop-filter : blur(4px);
// 		padding         : 15px;
// 	}

// 	.apf-modal-box {
// 		background    : #ffffff;
// 		width         : 640px;
// 		max-width     : 100%;
// 		border-radius : 12px;
// 		box-shadow    : 0 25px 60px rgba(0,0,0,0.25);
// 		padding       : 35px;
// 		animation     : apfScaleIn 0.25s ease;
// 	}

// 	@keyframes apfScaleIn {
// 		from { transform: scale(0.95); opacity: 0; }
// 		to   { transform: scale(1);    opacity: 1; }
// 	}

// 	.apf-modal-header {
// 		display         : flex;
// 		justify-content : space-between;
// 		align-items     : center;
// 		font-weight     : 600;
// 		font-size       : 18px;
// 		margin-bottom   : 25px;
// 	}

// 	.apf-modal-title i { margin-right: 8px; color: #007bff; }

// 	#apf-modal-close {
// 		cursor     : pointer;
// 		font-size  : 22px;
// 		color      : #888;
// 		transition : color 0.2s;
// 		line-height: 1;
// 	}

// 	#apf-modal-close:hover { color: #000; }

// 	.apf-modal-body { text-align: center; margin-bottom: 25px; }

// 	.apf-modal-icon {
// 		font-size     : 42px;
// 		margin-bottom : 15px;
// 	}

// 	.apf-modal-text {
// 		font-weight   : 600;
// 		font-size     : 15px;
// 		color         : #c0392b;
// 		margin-bottom : 12px;
// 		line-height   : 1.6;
// 	}

// 	.apf-modal-sub {
// 		font-size     : 14px;
// 		color         : #555;
// 		margin-bottom : 20px;
// 		line-height   : 1.6;
// 	}

// 	.apf-checkbox-wrapper {
// 		background    : #f8f9fa;
// 		padding       : 16px 18px;
// 		border-radius : 8px;
// 		border        : 1px solid #e0e0e0;
// 		font-size     : 14px;
// 		text-align    : left;
// 		margin-top    : 6px;
// 	}

// 	.apf-checkbox-label {
// 		display     : flex;
// 		align-items : flex-start;
// 		gap         : 10px;
// 		cursor      : pointer;
// 		margin      : 0;
// 	}

// 	.apf-checkbox-label i     { color: #28a745; margin-right: 4px; }
// 	.apf-checkbox-label input {
// 		margin-top : 3px;
// 		transform  : scale(1.1);
// 		flex-shrink: 0;
// 	}

// 	.apf-modal-footer {
// 		display         : flex;
// 		justify-content : flex-end;
// 		gap             : 12px;
// 		margin-top      : 10px;
// 	}

// 	.apf-modal-footer .btn      { min-width: 150px; }
// 	#apf-modal-proceed:disabled { opacity: 0.6; cursor: not-allowed; }

// 	/* ── APF Loader Overlay ───────────────────── */
// 	#global-loader.loader-overlay {
// 		position        : fixed;
// 		inset           : 0;
// 		width           : 100vw;
// 		height          : 100vh;
// 		background      : rgba(18,18,18,0.92);
// 		backdrop-filter : blur(6px);
// 		z-index         : 999999;
// 		display         : none;
// 		align-items     : center;
// 		justify-content : center;
// 	}

// 	#global-loader.loader-overlay.active { display: flex; }

// 	.loader-box {
// 		display         : flex;
// 		flex-direction  : column;
// 		align-items     : center;
// 		justify-content : center;
// 		gap             : 16px;
// 	}

// 	.loader-ring-wrap {
// 		position        : relative;
// 		width           : 120px;
// 		height          : 120px;
// 		display         : flex;
// 		align-items     : center;
// 		justify-content : center;
// 	}

// 	.loader-ring {
// 		position  : absolute;
// 		inset     : 0;
// 		width     : 100%;
// 		height    : 100%;
// 		transform : rotate(-90deg);
// 	}

// 	.loader-ring-bg {
// 		fill         : none;
// 		stroke       : rgba(255,255,255,0.12);
// 		stroke-width : 6;
// 	}

// 	.loader-ring-fill {
// 		fill              : none;
// 		stroke            : url(#ringGrad);
// 		stroke-width      : 6;
// 		stroke-linecap    : round;
// 		stroke-dasharray  : 276.46;
// 		stroke-dashoffset : 276.46;
// 		transition        : stroke-dashoffset 0.35s ease;
// 	}

// 	.loader-logo {
// 		width         : 78px;
// 		height        : 78px;
// 		border-radius : 50%;
// 		background    : linear-gradient(145deg, #fff, #eaeaea);
// 		padding       : 12px;
// 		object-fit    : contain;
// 		box-shadow    : 0 8px 24px rgba(0,0,0,.35);
// 		animation     : pulse 1.6s infinite ease-in-out;
// 		position      : relative;
// 		z-index       : 1;
// 	}

// 	.loader-pct-inside {
// 		position      : absolute;
// 		bottom        : -4px;
// 		left          : 50%;
// 		transform     : translateX(-50%);
// 		font-size     : 11px;
// 		font-weight   : 700;
// 		color         : #fff;
// 		background    : rgba(0,118,182,0.85);
// 		padding       : 1px 7px;
// 		border-radius : 99px;
// 		z-index       : 2;
// 		white-space   : nowrap;
// 	}

// 	.loader-text {
// 		font-size      : 14px;
// 		color          : #fff;
// 		font-weight    : 600;
// 		letter-spacing : 0.5px;
// 		text-align     : center;
// 		opacity        : 0.85;
// 	}

// 	@keyframes pulse {
// 		0%, 100% { transform: scale(1);    opacity: 0.85; }
// 		50%      { transform: scale(1.06); opacity: 1;    }
// 	}

// 	/* ── Download Animation ───────────────────── */
// 	.dl-anim-wrap {
// 		display        : flex;
// 		flex-direction : column;
// 		align-items    : center;
// 		gap            : 6px;
// 		width          : 60px;
// 	}

// 	.dl-arrow-track {
// 		width    : 24px;
// 		height   : 28px;
// 		overflow : hidden;
// 		position : relative;
// 	}

// 	.dl-arrow {
// 		display        : flex;
// 		flex-direction : column;
// 		align-items    : center;
// 		position       : absolute;
// 		left           : 50%;
// 		transform      : translateX(-50%);
// 		animation      : dl-drop 1.2s ease-in-out infinite;
// 	}

// 	.dl-arrow-stem {
// 		width         : 3px;
// 		height        : 14px;
// 		background    : linear-gradient(180deg, #00c6ff, #0076B6);
// 		border-radius : 2px;
// 	}

// 	.dl-arrow-head {
// 		width        : 0;
// 		height       : 0;
// 		border-left  : 7px solid transparent;
// 		border-right : 7px solid transparent;
// 		border-top   : 9px solid #0076B6;
// 	}

// 	@keyframes dl-drop {
// 		0%   { top: -28px; opacity: 0; }
// 		30%  { opacity: 1; }
// 		70%  { opacity: 1; }
// 		100% { top: 28px;  opacity: 0; }
// 	}

// 	.dl-bar {
// 		width         : 44px;
// 		height        : 4px;
// 		background    : linear-gradient(90deg, #0076B6, #00c6ff);
// 		border-radius : 99px;
// 		animation     : dl-bar-pulse 1.2s ease-in-out infinite;
// 	}

// 	@keyframes dl-bar-pulse {
// 		0%, 100% { opacity: 0.4; transform: scaleX(0.8); }
// 		50%      { opacity: 1;   transform: scaleX(1);   }
// 	}

// 	.dl-dots { display: flex; gap: 5px; }

// 	.dl-dots span {
// 		width         : 5px;
// 		height        : 5px;
// 		border-radius : 50%;
// 		background    : rgba(255,255,255,0.6);
// 		animation     : dl-bounce 1.2s ease-in-out infinite;
// 	}

// 	.dl-dots span:nth-child(1) { animation-delay: 0s;   }
// 	.dl-dots span:nth-child(2) { animation-delay: 0.2s; }
// 	.dl-dots span:nth-child(3) { animation-delay: 0.4s; }

// 	@keyframes dl-bounce {
// 		0%, 80%, 100% { transform: scale(1);   opacity: 0.5; }
// 		40%           { transform: scale(1.5); opacity: 1;   }
// 	}

// 	/* ── Responsive ───────────────────────────── */
// 	@media (max-width: 768px) {
// 		.user-header        { flex-direction: column; align-items: flex-start; gap: 10px; }
// 		.user-header-right  { width: 100%; justify-content: flex-end; }
// 	}

// 	@media (max-width: 576px) {
// 		.global-search-inner   { max-width: 100%; }
// 		.apf-modal-box         { padding: 25px; }
// 		.apf-modal-header      { font-size: 16px; }
// 		.apf-modal-footer      { flex-direction: column; }
// 		.apf-modal-footer .btn { width: 100%; min-width: unset; }
// 	}
// 	`;

// 	document.head.appendChild(style);
// }


























// frappe.pages["import-template"].on_page_load = function (wrapper) {

// 	frappe.ui.make_app_page({
// 		parent       : wrapper,
// 		title        : "Budget Import Template",
// 		single_column: true,
// 	});

// 	var $container = $(wrapper).find(".layout-main-section");
// 	$container.addClass("budget-import-wrapper");

// 	/* ============================================================
// 	   STYLES
// 	============================================================ */
// 	if (!document.getElementById("allocation-style")) {
// 		var style      = document.createElement("style");
// 		style.id       = "allocation-style";
// 		style.textContent = [
// 			".budget-import-wrapper{padding:25px;background:#fff;min-height:100vh;}",
// 			".loading-state,.empty-state{text-align:center;padding:50px;font-weight:600;color:#0076B6;}",

// 			/* Global user search */
// 			".global-user-search-wrap{margin-bottom:28px;padding:16px 20px;background:#f0f7fd;border:1px solid #c8dff0;border-radius:10px;}",
// 			".gus-label{font-size:11px;font-weight:700;color:#0076B6;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:10px;}",
// 			".gus-label i{margin-right:6px;}",
// 			".gus-inner{position:relative;display:flex;align-items:center;max-width:460px;}",
// 			".gus-icon{position:absolute;left:12px;color:#0076B6;font-size:13px;pointer-events:none;}",
// 			".gus-input{width:100%;padding:9px 34px;border:1.5px solid #c8dff0;border-radius:8px;font-size:13px;color:#222;outline:none;background:#fff;transition:border-color 0.2s,box-shadow 0.2s;}",
// 			".gus-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.12);}",
// 			".gus-clear{position:absolute;right:10px;font-size:17px;color:#999;cursor:pointer;transition:color 0.15s;}",
// 			".gus-clear:hover{color:#c0392b;}",
// 			".gus-count{margin-top:6px;font-size:12px;color:#0076B6;font-weight:600;}",

// 			/* Per-table search */
// 			".tbl-search-wrap{margin-bottom:12px;}",
// 			".tbl-search-inner{position:relative;display:flex;align-items:center;max-width:380px;}",
// 			".tbl-search-icon{position:absolute;left:10px;color:#0076B6;font-size:13px;pointer-events:none;}",
// 			".tbl-search-input{width:100%;padding:8px 30px 8px 32px;border:1.5px solid #d5e8f5;border-radius:7px;font-size:13px;color:#333;outline:none;background:#f9fbfd;transition:border-color 0.2s,box-shadow 0.2s;}",
// 			".tbl-search-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.10);background:#fff;}",
// 			".tbl-search-clear{position:absolute;right:9px;font-size:16px;color:#bbb;cursor:pointer;transition:color 0.15s;}",
// 			".tbl-search-clear:hover{color:#c0392b;}",
// 			".tbl-search-count{margin-top:4px;font-size:11px;color:#0076B6;font-weight:600;}",

// 			/* User section */
// 			".user-section{margin-bottom:40px;}",
// 			".user-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:2px solid #0076B6;margin-bottom:18px;}",
// 			".user-header.user-header-collapsible{padding:14px 18px;background:#f4f9fd;border:1px solid #d0e8f5;border-radius:8px;margin-bottom:0;}",
// 			".user-header.user-header-collapsible.is-open{border-radius:8px 8px 0 0;}",
// 			".user-header-left{flex:1;}",
// 			".user-header-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}",
// 			".user-name{font-size:16px;font-weight:700;color:#003B63;}",
// 			".user-email{font-size:12px;color:#666;margin-top:2px;}",

// 			/* Expand toggle */
// 			".expand-toggle-wrap{display:flex;align-items:center;gap:10px;}",
// 			".expand-toggle-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;}",
// 			".expand-toggle-cb{width:15px;height:15px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
// 			".expand-toggle-btn{font-size:12px;font-weight:700;color:#0076B6;white-space:nowrap;}",
// 			".expand-row-count{font-size:11px;font-weight:600;color:#fff;background:#0076B6;padding:2px 9px;border-radius:99px;white-space:nowrap;}",
// 			".user-header-collapsible + .user-body{border:1px solid #d0e8f5;border-top:none;border-radius:0 0 8px 8px;padding:20px 18px 18px;background:#fff;}",
// 			".user-header:not(.user-header-collapsible) + .user-body{padding:0;border:none;background:transparent;}",

// 			/* Important note */
// 			".note-warning{background:#fff8e1;border-left:5px solid #f4b400;padding:16px;border-radius:6px;margin-bottom:20px;}",
// 			".note-header{font-size:14px;color:#5c4b00;margin-bottom:15px;line-height:1.7;}",
// 			".note-badge{background:#f4b400;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;margin-right:8px;}",
// 			".blinking-badge{animation:softBlink 1.5s ease-in-out infinite;}",
// 			"@keyframes softBlink{0%,100%{opacity:1;}50%{opacity:0.5;}}",

// 			/* Contact cards */
// 			".contact-wrapper{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;}",
// 			".contact-card{background:#fff;border:1px solid #e6e6e6;border-radius:8px;padding:12px 15px;min-width:220px;box-shadow:0 2px 8px rgba(0,0,0,0.04);}",
// 			".contact-name{font-weight:600;color:#333;margin-bottom:4px;font-size:13px;}",
// 			".contact-detail{font-size:12px;color:#666;line-height:1.6;}",

// 			/* Checkbox column */
// 			".cb-cell{width:36px;min-width:36px;text-align:center;padding:6px !important;}",
// 			".row-select-cb,.select-all-cb{width:15px;height:15px;cursor:pointer;accent-color:#0076B6;vertical-align:middle;}",

// 			/* Selected row highlight */
// 			".mis-table tbody tr.row-selected{background:#ddeef8 !important;}",

// 			/* Selection bar */
// 			".selection-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px;padding:10px 16px;background:#e8f5ff;border:1px solid #b0d9f5;border-radius:8px;animation:fadeInUp 0.2s ease;}",
// 			"@keyframes fadeInUp{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}",
// 			".sel-bar-count{font-size:13px;font-weight:700;color:#0076B6;flex:1;}",
// 			".sel-submit-btn{min-width:140px;}",
// 			".sel-clear-btn{min-width:120px;}",

// 			/* Table */
// 			".table-title{font-size:14px;font-weight:600;color:#003B63;margin-bottom:10px;}",
// 			".table-wrapper{overflow-x:auto;}",
// 			".mis-table{width:100%;border-collapse:collapse;font-size:13px;border:1px solid #dcdcdc;}",
// 			".mis-table th{background:#0076B6;color:#fff;font-weight:700;padding:9px 10px;text-align:center;white-space:nowrap;}",
// 			".mis-table td{padding:8px 10px;border:1px solid #e0e0e0;text-align:center;}",
// 			".mis-table tr:nth-child(even){background:#f9f9f9;}",
// 			".mis-table tr:hover{background:#eef6fb;}",

// 			/* Review modal */
// 			"#rev-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);display:none;align-items:center;justify-content:center;z-index:99999;backdrop-filter:blur(5px);padding:15px;}",
// 			".rev-modal-box{background:#fff;width:680px;max-width:100%;max-height:90vh;border-radius:14px;box-shadow:0 30px 70px rgba(0,0,0,0.3);display:flex;flex-direction:column;animation:scaleIn 0.25s ease;overflow:hidden;}",
// 			"@keyframes scaleIn{from{transform:scale(0.95);opacity:0;}to{transform:scale(1);opacity:1;}}",
// 			".rev-modal-header{display:flex;justify-content:space-between;align-items:center;padding:20px 28px 16px;border-bottom:1px solid #e8f0f7;font-weight:700;font-size:17px;color:#003B63;flex-shrink:0;}",
// 			".rev-modal-title i{margin-right:9px;color:#0076B6;}",
// 			"#rev-modal-close{cursor:pointer;font-size:22px;color:#999;transition:color 0.2s;line-height:1;}",
// 			"#rev-modal-close:hover{color:#000;}",
// 			".rev-modal-body{padding:20px 28px;overflow-y:auto;flex:1;}",
// 			".rev-warning-banner{display:flex;align-items:flex-start;gap:14px;background:#fff8e1;border:1px solid #f4b400;border-left:5px solid #f4b400;border-radius:8px;padding:14px 18px;margin-bottom:18px;}",
// 			".rev-warn-icon{font-size:26px;color:#e67e22;flex-shrink:0;margin-top:2px;}",
// 			".rev-warn-title{font-size:14px;font-weight:700;color:#5c3d00;margin-bottom:5px;}",
// 			".rev-warn-sub{font-size:13px;color:#7a5200;line-height:1.6;}",
// 			".rev-count-badge{display:inline-block;font-size:12px;font-weight:700;color:#fff;background:#0076B6;padding:3px 12px;border-radius:99px;margin-bottom:12px;}",
// 			".rev-table-wrap{overflow-x:auto;margin-bottom:20px;border-radius:8px;border:1px solid #d5e8f5;}",
// 			".rev-table{width:100%;border-collapse:collapse;font-size:13px;}",
// 			".rev-table thead tr{background:#0076B6;}",
// 			".rev-table th{color:#fff;font-weight:700;padding:10px 14px;text-align:left;white-space:nowrap;}",
// 			".rev-table td{padding:9px 14px;border-bottom:1px solid #eaf3fb;}",
// 			".rev-table tbody tr:last-child td{border-bottom:none;}",
// 			".rev-table tbody tr:nth-child(even){background:#f4f9fd;}",
// 			".rev-table tbody tr:hover{background:#deeef8;}",
// 			".rev-sl{width:40px;text-align:center;color:#888;font-size:12px;}",
// 			".rev-cc{color:#003B63;font-weight:600;}",
// 			".rev-loc{color:#0076B6;}",
// 			".rev-confirm-wrap{background:#f0f7fd;border:1px solid #c8dff0;border-radius:8px;padding:14px 18px;}",
// 			".rev-confirm-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;font-size:14px;color:#333;}",
// 			".rev-confirm-label input{width:16px;height:16px;margin-top:2px;accent-color:#0076B6;flex-shrink:0;cursor:pointer;}",
// 			".rev-confirm-label i{color:#28a745;margin-right:5px;}",
// 			".rev-modal-footer{display:flex;justify-content:flex-end;gap:12px;padding:16px 28px 20px;border-top:1px solid #e8f0f7;flex-shrink:0;}",
// 			".rev-modal-footer .btn{min-width:150px;}",
// 			"#rev-btn-proceed:disabled{opacity:0.6;cursor:not-allowed;}",

// 			/* APF modal */
// 			"#apf-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);padding:15px;}",
// 			".apf-modal-box{background:#fff;width:640px;max-width:100%;border-radius:12px;box-shadow:0 25px 60px rgba(0,0,0,0.25);padding:35px;animation:scaleIn 0.25s ease;}",
// 			".apf-modal-header{display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:18px;margin-bottom:25px;}",
// 			".apf-modal-title i{margin-right:8px;color:#007bff;}",
// 			"#apf-modal-close{cursor:pointer;font-size:22px;color:#888;transition:color 0.2s;line-height:1;}",
// 			"#apf-modal-close:hover{color:#000;}",
// 			".apf-modal-body{text-align:center;margin-bottom:25px;}",
// 			".apf-modal-icon{font-size:42px;margin-bottom:15px;}",
// 			".apf-modal-text{font-weight:600;font-size:15px;color:#c0392b;margin-bottom:12px;line-height:1.6;}",
// 			".apf-modal-sub{font-size:14px;color:#555;margin-bottom:20px;line-height:1.6;}",
// 			".apf-checkbox-wrapper{background:#f8f9fa;padding:16px 18px;border-radius:8px;border:1px solid #e0e0e0;font-size:14px;text-align:left;margin-top:6px;}",
// 			".apf-checkbox-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;}",
// 			".apf-checkbox-label i{color:#28a745;margin-right:4px;}",
// 			".apf-checkbox-label input{margin-top:3px;transform:scale(1.1);flex-shrink:0;}",
// 			".apf-modal-footer{display:flex;justify-content:flex-end;gap:12px;margin-top:10px;}",
// 			".apf-modal-footer .btn{min-width:150px;}",
// 			"#apf-modal-proceed:disabled{opacity:0.6;cursor:not-allowed;}",

// 			/* Loader */
// 			"#global-loader.loader-overlay{position:fixed;inset:0;width:100vw;height:100vh;background:rgba(18,18,18,0.92);backdrop-filter:blur(6px);z-index:999999;display:none;align-items:center;justify-content:center;}",
// 			"#global-loader.loader-overlay.active{display:flex;}",
// 			".loader-box{display:flex;flex-direction:column;align-items:center;gap:16px;}",
// 			".loader-ring-wrap{position:relative;width:120px;height:120px;display:flex;align-items:center;justify-content:center;}",
// 			".loader-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);}",
// 			".loader-ring-bg{fill:none;stroke:rgba(255,255,255,0.12);stroke-width:6;}",
// 			".loader-ring-fill{fill:none;stroke:url(#ringGrad);stroke-width:6;stroke-linecap:round;stroke-dasharray:276.46;stroke-dashoffset:276.46;transition:stroke-dashoffset 0.35s ease;}",
// 			".loader-logo{width:78px;height:78px;border-radius:50%;background:linear-gradient(145deg,#fff,#eaeaea);padding:12px;object-fit:contain;box-shadow:0 8px 24px rgba(0,0,0,.35);animation:pulse 1.6s infinite ease-in-out;position:relative;z-index:1;}",
// 			".loader-pct-inside{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:700;color:#fff;background:rgba(0,118,182,0.85);padding:1px 7px;border-radius:99px;z-index:2;white-space:nowrap;}",
// 			".loader-text{font-size:14px;color:#fff;font-weight:600;letter-spacing:0.5px;text-align:center;opacity:0.85;}",
// 			"@keyframes pulse{0%,100%{transform:scale(1);opacity:0.85;}50%{transform:scale(1.06);opacity:1;}}",
// 			".dl-anim-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;width:60px;}",
// 			".dl-arrow-track{width:24px;height:28px;overflow:hidden;position:relative;}",
// 			".dl-arrow{display:flex;flex-direction:column;align-items:center;position:absolute;left:50%;transform:translateX(-50%);animation:dl-drop 1.2s ease-in-out infinite;}",
// 			".dl-arrow-stem{width:3px;height:14px;background:linear-gradient(180deg,#00c6ff,#0076B6);border-radius:2px;}",
// 			".dl-arrow-head{width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid #0076B6;}",
// 			"@keyframes dl-drop{0%{top:-28px;opacity:0;}30%{opacity:1;}70%{opacity:1;}100%{top:28px;opacity:0;}}",
// 			".dl-bar{width:44px;height:4px;background:linear-gradient(90deg,#0076B6,#00c6ff);border-radius:99px;animation:dl-bar-pulse 1.2s ease-in-out infinite;}",
// 			"@keyframes dl-bar-pulse{0%,100%{opacity:0.4;transform:scaleX(0.8);}50%{opacity:1;transform:scaleX(1);}}",
// 			".dl-dots{display:flex;gap:5px;}",
// 			".dl-dots span{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.6);animation:dl-bounce 1.2s ease-in-out infinite;}",
// 			".dl-dots span:nth-child(1){animation-delay:0s;}",
// 			".dl-dots span:nth-child(2){animation-delay:0.2s;}",
// 			".dl-dots span:nth-child(3){animation-delay:0.4s;}",
// 			"@keyframes dl-bounce{0%,80%,100%{transform:scale(1);opacity:0.5;}40%{transform:scale(1.5);opacity:1;}}",

// 			/* Responsive */
// 			"@media(max-width:768px){",
// 			".budget-import-wrapper{padding:16px;}",
// 			".user-header,.user-header.user-header-collapsible{flex-direction:column;align-items:flex-start;gap:10px;padding:12px 14px;}",
// 			".user-header-right{width:100%;justify-content:space-between;flex-wrap:wrap;gap:8px;}",
// 			".button-container{width:100%;}",
// 			".dl-btn{width:100%;justify-content:center;}",
// 			".gus-inner,.tbl-search-inner{max-width:100%;}",
// 			".contact-wrapper{flex-direction:column;}",
// 			".contact-card{min-width:unset;width:100%;}",
// 			".mis-table th,.mis-table td{padding:7px 6px;}",
// 			".selection-bar{flex-direction:column;align-items:flex-start;}",
// 			".sel-submit-btn,.sel-clear-btn{width:100%;}",
// 			"}",
// 			"@media(max-width:576px){",
// 			".budget-import-wrapper{padding:12px;}",
// 			".user-name{font-size:14px;}",
// 			".user-email{font-size:11px;}",
// 			".table-wrapper{overflow-x:auto;-webkit-overflow-scrolling:touch;}",
// 			".mis-table{font-size:11px;min-width:560px;}",
// 			".mis-table th,.mis-table td{padding:6px 5px;white-space:nowrap;}",
// 			".apf-modal-box{padding:20px 16px;border-radius:10px;}",
// 			".apf-modal-footer{flex-direction:column;gap:8px;}",
// 			".apf-modal-footer .btn{width:100%;min-width:unset;margin:0;}",
// 			".rev-modal-footer{flex-direction:column;gap:8px;}",
// 			".rev-modal-footer .btn{width:100%;min-width:unset;}",
// 			".loader-ring-wrap{width:100px;height:100px;}",
// 			".loader-logo{width:64px;height:64px;}",
// 			"}"
// 		].join("");
// 		document.head.appendChild(style);
// 	}

// 	/* ============================================================
// 	   LOADER
// 	============================================================ */
// 	function init_loader() {
// 		if ($("#global-loader").length) return;
// 		$("body").append(
// 			'<div id="global-loader" class="loader-overlay">' +
// 				'<div class="loader-box">' +
// 					'<div class="loader-ring-wrap">' +
// 						'<svg class="loader-ring" viewBox="0 0 100 100">' +
// 							'<defs>' +
// 								'<linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
// 									'<stop offset="0%" stop-color="#0076B6"/>' +
// 									'<stop offset="100%" stop-color="#00c6ff"/>' +
// 								'</linearGradient>' +
// 							'</defs>' +
// 							'<circle class="loader-ring-bg" cx="50" cy="50" r="44"/>' +
// 							'<circle class="loader-ring-fill" id="loader-ring-fill" cx="50" cy="50" r="44"/>' +
// 						'</svg>' +
// 						'<img src="/files/APF logo.png" class="loader-logo" alt="Loading">' +
// 						'<div class="loader-pct-inside" id="loader-pct">0%</div>' +
// 					'</div>' +
// 					'<div class="dl-anim-wrap">' +
// 						'<div class="dl-arrow-track"><div class="dl-arrow"><div class="dl-arrow-stem"></div><div class="dl-arrow-head"></div></div></div>' +
// 						'<div class="dl-bar"></div>' +
// 						'<div class="dl-dots"><span></span><span></span><span></span></div>' +
// 					'</div>' +
// 					'<div class="loader-text" id="loader-text-msg">Preparing download...</div>' +
// 				'</div>' +
// 			'</div>'
// 		);
// 	}

// 	function set_progress(pct) {
// 		var offset = 276.46 - (pct / 100) * 276.46;
// 		$("#loader-ring-fill").css("stroke-dashoffset", offset);
// 		$("#loader-pct").text(Math.round(pct) + "%");
// 	}

// 	var Loader = {
// 		show: function (msg) {
// 			init_loader();
// 			$("#loader-text-msg").text(msg || "Preparing download...");
// 			set_progress(0);
// 			$("#global-loader").addClass("active");
// 		},
// 		setText: function (msg) { $("#loader-text-msg").text(msg); },
// 		setProgress: function (pct) { set_progress(pct); },
// 		hide: function () { $("#global-loader").removeClass("active"); }
// 	};

// 	/* ============================================================
// 	   APF MODAL
// 	============================================================ */
// 	function init_apf_modal() {
// 		if ($("#apf-modal-overlay").length) return;
// 		$("body").append(
// 			'<div id="apf-modal-overlay">' +
// 				'<div class="apf-modal-box">' +
// 					'<div class="apf-modal-header">' +
// 						'<div class="apf-modal-title" id="apf-modal-title"></div>' +
// 						'<span id="apf-modal-close" title="Close">&times;</span>' +
// 					'</div>' +
// 					'<div class="apf-modal-body">' +
// 						'<div class="apf-modal-icon" id="apf-modal-icon"><i id="apf-modal-icon-i" class="fa"></i></div>' +
// 						'<div class="apf-modal-text" id="apf-modal-text"></div>' +
// 						'<div class="apf-modal-sub" id="apf-modal-sub"></div>' +
// 						'<div class="apf-checkbox-wrapper" id="apf-checkbox-wrap" style="display:none;">' +
// 							'<label class="apf-checkbox-label">' +
// 								'<input type="checkbox" id="apf-modal-checkbox">' +
// 								'<span><i class="fa fa-check-circle"></i> I confirm that I have verified all details carefully.</span>' +
// 							'</label>' +
// 						'</div>' +
// 					'</div>' +
// 					'<div class="apf-modal-footer" id="apf-modal-footer"></div>' +
// 				'</div>' +
// 			'</div>'
// 		);
// 		$(document)
// 			.off(".apfModal")
// 			.on("click.apfModal", "#apf-modal-close", hide_apf_modal)
// 			.on("click.apfModal", "#apf-modal-overlay", function (e) {
// 				if ($(e.target).is("#apf-modal-overlay")) hide_apf_modal();
// 			})
// 			.on("change.apfModal", "#apf-modal-checkbox", function () {
// 				$("#apf-modal-proceed").prop("disabled", !this.checked);
// 			});
// 	}

// 	function hide_apf_modal() {
// 		$("#apf-modal-overlay").hide();
// 		$("#apf-modal-checkbox").prop("checked", false);
// 		$("#apf-modal-proceed").prop("disabled", true);
// 	}

// 	function show_apf_modal(opts) {
// 		init_apf_modal();
// 		$("#apf-modal-title").html(opts.title || "");
// 		$("#apf-modal-icon-i")
// 			.attr("class", "fa " + (opts.icon || "fa-exclamation-triangle"))
// 			.closest(".apf-modal-icon")
// 			.css("color", opts.iconColor || "#e74c3c");
// 		$("#apf-modal-text").html(opts.text || "");
// 		$("#apf-modal-sub").html(opts.sub || "");
// 		var showCb = !!opts.showCheckbox;
// 		$("#apf-checkbox-wrap").toggle(showCb);
// 		if (showCb) $("#apf-modal-checkbox").prop("checked", false);
// 		var $footer = $("#apf-modal-footer").empty();
// 		(opts.buttons || []).forEach(function (btn) {
// 			var $b = $('<button id="' + (btn.id || "") + '" class="btn ' + (btn.cls || "btn-default") + ' btn-sm">' + btn.label + '</button>')
// 				.prop("disabled", !!btn.disabled);
// 			$b.on("click", function () { if (btn.onClick) btn.onClick(); });
// 			$footer.append($b);
// 		});
// 		$("#apf-modal-overlay").css("display", "flex");
// 	}

// 	/* ============================================================
// 	   REVIEW MODAL
// 	============================================================ */
// 	function init_review_modal() {
// 		if ($("#rev-modal-overlay").length) return;
// 		$("body").append(
// 			'<div id="rev-modal-overlay">' +
// 				'<div class="rev-modal-box">' +
// 					'<div class="rev-modal-header">' +
// 						'<div class="rev-modal-title"><i class="fa fa-list-alt"></i> Review Selected Items</div>' +
// 						'<span id="rev-modal-close" title="Close">&times;</span>' +
// 					'</div>' +
// 					'<div class="rev-modal-body">' +
// 						'<div class="rev-warning-banner">' +
// 							'<i class="fa fa-exclamation-triangle rev-warn-icon"></i>' +
// 							'<div>' +
// 								'<div class="rev-warn-title">Please make a note of the items listed below.</div>' +
// 								'<div class="rev-warn-sub">Keep a record of the selected Cost Centers and Location Codes to avoid duplicates when importing the Budget Template.</div>' +
// 							'</div>' +
// 						'</div>' +
// 						'<div class="rev-count-badge" id="rev-count-badge"></div>' +
// 						'<div class="rev-table-wrap">' +
// 							'<table class="rev-table">' +
// 								'<thead><tr><th class="rev-sl">#</th><th class="rev-cc">Cost Center</th><th class="rev-loc">Location Code</th></tr></thead>' +
// 								'<tbody id="rev-table-body"></tbody>' +
// 							'</table>' +
// 						'</div>' +
// 						'<div class="rev-confirm-wrap">' +
// 							'<label class="rev-confirm-label">' +
// 								'<input type="checkbox" id="rev-confirm-cb">' +
// 								'<span><i class="fa fa-check-circle"></i> I have noted down the selected items and I am ready to proceed.</span>' +
// 							'</label>' +
// 						'</div>' +
// 					'</div>' +
// 					'<div class="rev-modal-footer">' +
// 						'<button id="rev-btn-cancel" class="btn btn-default btn-sm"><i class="fa fa-times"></i> Cancel</button>' +
// 						'<button id="rev-btn-proceed" class="btn btn-success btn-sm" disabled><i class="fa fa-download"></i> Proceed to Download</button>' +
// 					'</div>' +
// 				'</div>' +
// 			'</div>'
// 		);
// 		$(document)
// 			.off(".revModal")
// 			.on("click.revModal", "#rev-modal-close, #rev-btn-cancel", hide_review_modal)
// 			.on("click.revModal", "#rev-modal-overlay", function (e) {
// 				if ($(e.target).is("#rev-modal-overlay")) hide_review_modal();
// 			})
// 			.on("change.revModal", "#rev-confirm-cb", function () {
// 				$("#rev-btn-proceed").prop("disabled", !this.checked);
// 			})
// 			.on("click.revModal", "#rev-btn-proceed", function () {
// 				var $overlay = $("#rev-modal-overlay");
// 				var sid      = $overlay.data("safe-id");
// 				var email    = $overlay.data("user-email");
// 				var $section = $(".user-section").filter(function () {
// 					return $(this).data("email") === (email || "").toLowerCase();
// 				});
// 				var $btn = $section.find(".dl-btn");
// 				hide_review_modal();
// 				run_download($btn, email, sid);
// 			});
// 	}

// 	function hide_review_modal() {
// 		$("#rev-modal-overlay").hide();
// 		$("#rev-confirm-cb").prop("checked", false);
// 		$("#rev-btn-proceed").prop("disabled", true);
// 	}

// 	function show_review_modal(safeId, userEmail) {
// 		var selected = get_selected_rows(safeId);
// 		if (!selected.length) {
// 			frappe.msgprint({ title: "Nothing Selected", message: "Please select at least one row.", indicator: "orange" });
// 			return;
// 		}
// 		init_review_modal();

// 		/* Show only the selected rows */
// 		var tableRows = selected.map(function (r, i) {
// 			return '<tr>' +
// 				'<td class="rev-sl">' + (i + 1) + '</td>' +
// 				'<td class="rev-cc">'  + esc(r.cost_center)   + '</td>' +
// 				'<td class="rev-loc">' + esc(r.location_code) + '</td>' +
// 				'</tr>';
// 		}).join("");

// 		$("#rev-table-body").html(tableRows);
// 		$("#rev-count-badge").text(selected.length + " item" + (selected.length !== 1 ? "s" : "") + " selected");
// 		$("#rev-confirm-cb").prop("checked", false);
// 		$("#rev-btn-proceed").prop("disabled", true);

// 		$("#rev-modal-overlay")
// 			.data("safe-id",    safeId)
// 			.data("user-email", userEmail)
// 			.css("display", "flex");
// 	}

// 	/* ============================================================
// 	   HELPERS
// 	============================================================ */
// 	function esc(str) {
// 		return $("<div>").text(str || "").html();
// 	}

// 	function reset_btn($btn, loading, loadingText) {
// 		$btn.prop("disabled", loading).html(
// 			loading
// 				? '<i class="fa fa-spinner fa-spin"></i> ' + (loadingText || "Loading...")
// 				: '<i class="fa fa-download"></i> Download Budget Import Template'
// 		);
// 	}

// 	/* Returns array of row objects for all checked rows in a table */
// 	function get_selected_rows(safeId) {
// 		var selected = [];
// 		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").each(function () {
// 			var $row = $(this);
// 			if (!$row.find(".row-select-cb").is(":checked")) return;
// 			selected.push({
// 				unit                   : $row.data("unit")                    || "",
// 				unit_description       : $row.data("unit-description")        || "",
// 				cost_center            : $row.data("cost-center")             || "",
// 				cost_center_description: $row.data("cost-center-description") || "",
// 				location_code          : $row.data("location-code")           || "",
// 				location_description   : $row.data("location-description")    || ""
// 			});
// 		});
// 		return selected;
// 	}

// 	function sync_select_all(safeId) {
// 		var $all     = $(".mis-table[data-safe-id='" + safeId + "'] tbody tr:visible .row-select-cb");
// 		var $checked = $all.filter(":checked");
// 		var $hdr     = $(".select-all-cb[data-safe-id='" + safeId + "']");
// 		if ($all.length === 0 || $checked.length === 0) {
// 			$hdr.prop("checked", false).prop("indeterminate", false);
// 		} else if ($checked.length === $all.length) {
// 			$hdr.prop("checked", true).prop("indeterminate", false);
// 		} else {
// 			$hdr.prop("checked", false).prop("indeterminate", true);
// 		}
// 	}

// 	function update_selection_bar(safeId) {
// 		var count = $(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb:checked").length;
// 		var $bar  = $("#sel-bar-" + safeId);
// 		if (count > 0) {
// 			$bar.show();
// 			$("#sel-count-" + safeId).text(count + " row" + (count !== 1 ? "s" : "") + " selected");
// 		} else {
// 			$bar.hide();
// 		}
// 	}

// 	function deselect_all(safeId) {
// 		$(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb").prop("checked", false);
// 		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").removeClass("row-selected");
// 		$(".select-all-cb[data-safe-id='" + safeId + "']").prop("checked", false).prop("indeterminate", false);
// 		update_selection_bar(safeId);
// 	}

// 	function run_table_search(safeId, query) {
// 		var q       = (query || "").trim().toLowerCase();
// 		var $table  = $(".mis-table[data-safe-id='" + safeId + "']");
// 		var visible = 0;
// 		$table.find("tbody tr").each(function () {
// 			var match = !q || this.textContent.toLowerCase().indexOf(q) !== -1;
// 			$(this).toggle(match);
// 			if (match) visible++;
// 		});
// 		sync_select_all(safeId);
// 		var $count = $("#tbl-count-" + safeId);
// 		if (q) {
// 			$count.text(visible + " row" + (visible !== 1 ? "s" : "") + " matched").show();
// 		} else {
// 			$count.hide();
// 		}
// 		$("#tbl-clear-" + safeId).toggle(q.length > 0);
// 	}

// 	function run_user_search(query) {
// 		var q     = query.trim().toLowerCase();
// 		var total = 0;
// 		$(".user-section").each(function () {
// 			var $sec  = $(this);
// 			var match = !q
// 				|| ($sec.data("name")  || "").indexOf(q) !== -1
// 				|| ($sec.data("email") || "").indexOf(q) !== -1;
// 			$sec.toggle(match);
// 			if (match) total++;
// 		});
// 		var $count = $("#admin-user-search-count");
// 		if (q) {
// 			$count.text(total + " user" + (total !== 1 ? "s" : "") + " found").show();
// 		} else {
// 			$count.hide();
// 		}
// 		$("#admin-user-search-clear").toggle(q.length > 0);
// 	}

// 	function build_note_html() {
// 		var contacts = [
// 			["Rakesh Ahuja",        "rakesh.ahuja@azimpremjifoundation.org",      "+91 7022068106"],
// 			["Saravana G",          "saravana.g@azimpremjifoundation.org",        "+91 9380861952"],
// 			["Augustin Moses R",    "augustin.moses@azimpremjifoundation.org",    "+91 8667719594"],
// 			["Mercy Selvanayagi R", "mercy.selvanayagi@azimpremjifoundation.org", "+91 9047828687"],
// 			["Mahaveer Ram P",      "mahaveer.p@azimpremjifoundation.org",        "+91 8825879412"]
// 		];
// 		var cards = contacts.map(function (c) {
// 			return '<div class="contact-card">' +
// 				'<div class="contact-name">'   + c[0] + '</div>' +
// 				'<div class="contact-detail">' + c[1] + '</div>' +
// 				'<div class="contact-detail">' + c[2] + '</div>' +
// 				'</div>';
// 		}).join("");
// 		return '<div class="note-warning">' +
// 			'<div class="note-header">' +
// 				'<span class="note-badge blinking-badge">IMPORTANT</span>' +
// 				'Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below. ' +
// 				'If you notice any discrepancies, contact the support team immediately. ' +
// 				'Do not proceed with the import until all details are verified and confirmed.' +
// 			'</div>' +
// 			'<div class="contact-wrapper">' + cards + '</div>' +
// 			'</div>';
// 	}

// 	function build_table_html(rows, safeId) {
// 		var COLS = [
// 			["unit",                    "Unit"                    ],
// 			["unit_description",        "Unit Description"        ],
// 			["cost_center",             "Cost Center"             ],
// 			["cost_center_description", "Cost Center Description" ],
// 			["location_code",           "Location Code"           ],
// 			["location_description",    "Location Description"    ]
// 		];
// 		var headers = COLS.map(function (c) { return "<th>" + c[1] + "</th>"; }).join("");
// 		var bodyRows = rows.map(function (row, i) {
// 			var da =
// 				'data-unit="'                    + esc(row.unit || "")                    + '" ' +
// 				'data-unit-description="'        + esc(row.unit_description || "")        + '" ' +
// 				'data-cost-center="'             + esc(row.cost_center || "")             + '" ' +
// 				'data-cost-center-description="' + esc(row.cost_center_description || "") + '" ' +
// 				'data-location-code="'           + esc(row.location_code || "")           + '" ' +
// 				'data-location-description="'    + esc(row.location_description || "")    + '"';
// 			var cells = COLS.map(function (c) {
// 				return "<td>" + esc(row[c[0]] || "") + "</td>";
// 			}).join("");
// 			return '<tr ' + da + '>' +
// 				'<td class="cb-cell"><input type="checkbox" class="row-select-cb" title="Select row"></td>' +
// 				'<td>' + (i + 1) + '</td>' +
// 				cells +
// 				'</tr>';
// 		}).join("");
// 		return '<h4 class="table-title">Allocated Units &amp; Cost Centers</h4>' +
// 			'<div class="table-wrapper">' +
// 				'<table class="mis-table" data-safe-id="' + safeId + '">' +
// 					'<thead><tr>' +
// 						'<th class="cb-cell"><input type="checkbox" class="select-all-cb" data-safe-id="' + safeId + '" title="Select all visible rows"></th>' +
// 						'<th>Sl. No.</th>' + headers +
// 					'</tr></thead>' +
// 					'<tbody>' + bodyRows + '</tbody>' +
// 				'</table>' +
// 			'</div>';
// 	}

// 	/* ============================================================
// 	   DOWNLOAD FLOW
// 	============================================================ */

// 	/*
// 	 * run_download($btn, userEmail, safeId)
// 	 *
// 	 * safeId = null  → no rows selected, download all mappings from backend
// 	 * safeId = string → read checked rows from that table and send as JSON array
// 	 */
// 	function run_download($btn, userEmail, safeId) {
// 		var selected      = (safeId && safeId !== "null") ? get_selected_rows(safeId) : [];
// 		var entityDataArg = selected.length ? JSON.stringify(selected) : null;

// 		reset_btn($btn, true, "Downloading...");
// 		Loader.show("Generating your template...");

// 		var pct   = 0;
// 		var timer = setInterval(function () {
// 			var step = pct < 40 ? 3 : pct < 70 ? 1.5 : 0.4;
// 			pct = Math.min(pct + step, 84);
// 			Loader.setProgress(pct);
// 		}, 300);

// 		function on_done(success) {
// 			clearInterval(timer);
// 			if (success) {
// 				Loader.setProgress(100);
// 				Loader.setText("Download ready!");
// 				setTimeout(function () {
// 					Loader.hide();
// 					reset_btn($btn, false);
// 					if (safeId) deselect_all(safeId);
// 				}, 800);
// 			} else {
// 				Loader.hide();
// 				reset_btn($btn, false);
// 			}
// 		}

// 		/* Step 1 — enqueue generation */
// 		frappe.call({
// 			method: "annual_budget.api.export_reports.start_budget_template_generation",
// 			args  : {
// 				user       : userEmail,
// 				entity_data: entityDataArg
// 			},
// 			callback: function () {
// 				clearInterval(timer);
// 				Loader.setText("Fetching your template...");

// 				pct   = 30;
// 				timer = setInterval(function () {
// 					pct = Math.min(pct + 0.3, 84);
// 					Loader.setProgress(pct);
// 				}, 400);

// 				var polling  = false;
// 				var stopped  = false;

// 				/* Step 2 — poll every 3s until file is ready */
// 				var pollTimer = setInterval(function () {
// 					if (polling || stopped) return;
// 					polling = true;

// 					fetch(
// 						"/api/method/annual_budget.api.export_reports.download_generated_template" +
// 						"?user=" + encodeURIComponent(userEmail),
// 						{ headers: { "X-Frappe-CSRF-Token": frappe.csrf_token } }
// 					)
// 						.then(function (resp) {
// 							if (!resp.ok) {
// 								polling = false;
// 								throw new Error("Server returned " + resp.status);
// 							}
// 							var ct = resp.headers.get("content-type") || "";

// 							/* Still processing */
// 							if (ct.indexOf("application/json") !== -1) {
// 								polling = false;
// 								Loader.setText("Still generating, please wait...");
// 								return;
// 							}

// 							/* File ready — stop everything */
// 							stopped = true;
// 							clearInterval(pollTimer);
// 							clearInterval(timer);
// 							Loader.setProgress(95);
// 							Loader.setText("Preparing file...");

// 							var disp     = resp.headers.get("Content-Disposition") || "";
// 							var match    = disp.match(/filename[^;=\n]*=["']?([^"';\n]+)/);
// 							var filename = match ? decodeURIComponent(match[1].trim()) : "Budget_Import_Template.xlsx";

// 							return resp.blob().then(function (blob) {
// 								var url = URL.createObjectURL(blob);
// 								var a   = document.createElement("a");
// 								a.href     = url;
// 								a.download = filename;
// 								document.body.appendChild(a);
// 								a.click();
// 								a.remove();
// 								setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
// 								on_done(true);
// 							});
// 						})
// 						.catch(function (err) {
// 							if (stopped) return;
// 							stopped = true;
// 							clearInterval(pollTimer);
// 							clearInterval(timer);
// 							on_done(false);
// 							frappe.msgprint({
// 								title    : "Download Failed",
// 								message  : "Could not download the template.<br><small>" + err.message + "</small>",
// 								indicator: "red"
// 							});
// 						});
// 				}, 3000);
// 			},
// 			error: function () {
// 				clearInterval(timer);
// 				on_done(false);
// 				frappe.msgprint({ title: "Error", message: "Could not start template generation. Please try again.", indicator: "red" });
// 			}
// 		});
// 	}

// 	function check_and_download($btn, userEmail, isAdmin) {
// 		reset_btn($btn, true, "Checking...");
// 		frappe.call({
// 			method : "frappe.client.get_value",
// 			args   : {
// 				doctype  : "Finance user access",
// 				filters  : { user: userEmail },
// 				fieldname: "import_template_id"
// 			},
// 			callback: function (r) {
// 				var templateId = r.message && r.message.import_template_id;
// 				if (!templateId) {
// 					reset_btn($btn, false);
// 					show_apf_modal({
// 						title    : '<i class="fa fa-exclamation-triangle"></i> ' + (isAdmin ? "Template Not Configured" : "Import Template Missing"),
// 						icon     : "fa-exclamation-triangle",
// 						iconColor: isAdmin ? "#e67e22" : "#e74c3c",
// 						text     : isAdmin ? "No Import Template is linked for this user account." : "Import Template is not configured for this account.",
// 						sub      : isAdmin
// 							? "The <b>import_template_id</b> in <b>Finance User Access</b> is empty for <b>" + esc(userEmail) + "</b>.<br><br>Please assign a valid Import Template before retrying."
// 							: "Please contact your administrator to link an <b>Import Template</b> in <b>Finance User Access</b> before downloading.",
// 						buttons  : [{ label: '<i class="fa fa-times"></i> Close', cls: "btn-default", onClick: hide_apf_modal }]
// 					});
// 					return;
// 				}
// 				if (isAdmin) {
// 					run_download($btn, userEmail, null);
// 				} else {
// 					reset_btn($btn, false);
// 					show_apf_modal({
// 						title       : '<i class="fa fa-download"></i> Confirm Download',
// 						icon        : "fa-exclamation-triangle",
// 						iconColor   : "#e74c3c",
// 						text        : "Please carefully review and validate all allocated Units, Cost Centers, and Location Codes before downloading.",
// 						sub         : "Do not proceed unless everything has been reviewed and confirmed.",
// 						showCheckbox: true,
// 						buttons     : [
// 							{ label: '<i class="fa fa-times"></i> Cancel', cls: "btn-default", onClick: hide_apf_modal },
// 							{
// 								id      : "apf-modal-proceed",
// 								label   : '<i class="fa fa-download"></i> Proceed to Download',
// 								cls     : "btn-primary",
// 								disabled: true,
// 								onClick : function () {
// 									hide_apf_modal();
// 									run_download($btn, userEmail, null);
// 								}
// 							}
// 						]
// 					});
// 				}
// 			},
// 			error: function () {
// 				reset_btn($btn, false);
// 				frappe.msgprint({ title: "Check Failed", message: "Could not verify the Import Template. Please try again.", indicator: "red" });
// 			}
// 		});
// 	}

// 	/* ============================================================
// 	   RENDER CONTENT
// 	============================================================ */
// 	function render_content(container, data) {

// 		var roles                = Array.isArray(frappe.user_roles) ? frappe.user_roles : [];
// 		var isFinanceCoordinator = roles.indexOf("Finance Unit Coordinator") !== -1;
// 		var isSystemManager      = roles.indexOf("System Manager") !== -1;
// 		var isFinanceAdmin       = roles.indexOf("Finance Admin") !== -1;
// 		var needsModal           = isFinanceCoordinator && !isSystemManager && !isFinanceAdmin;
// 		var isCollapsible        = isSystemManager || isFinanceAdmin;

// 		var grouped = {};
// 		data.forEach(function (row) {
// 			if (!grouped[row.user]) {
// 				grouped[row.user] = { user_fullname: row.user_fullname || "", email: row.user, rows: [] };
// 			}
// 			grouped[row.user].rows.push(row);
// 		});

// 		container.empty();

// 		/* Admin user search */
// 		if (isCollapsible) {
// 			container.append(
// 				'<div class="global-user-search-wrap">' +
// 					'<div class="gus-label"><i class="fa fa-users"></i> Search User</div>' +
// 					'<div class="gus-inner">' +
// 						'<i class="fa fa-search gus-icon"></i>' +
// 						'<input type="text" id="admin-user-search" class="gus-input" placeholder="Search by user name or email..." autocomplete="off"/>' +
// 						'<span id="admin-user-search-clear" class="gus-clear" title="Clear">&times;</span>' +
// 					'</div>' +
// 					'<div id="admin-user-search-count" class="gus-count" style="display:none;"></div>' +
// 				'</div>'
// 			);
// 		}

// 		/* Build each user section */
// 		Object.keys(grouped).forEach(function (key) {
// 			var userData    = grouped[key];
// 			var displayName = userData.user_fullname || userData.email;
// 			var rowCount    = userData.rows.length;
// 			var safeId      = userData.email.replace(/[^a-z0-9]/gi, "_");
// 			var cbId        = "expand-cb-"  + safeId;
// 			var tsId        = "tbl-search-" + safeId;
// 			var tcId        = "tbl-count-"  + safeId;
// 			var txId        = "tbl-clear-"  + safeId;

// 			var expandHtml = isCollapsible
// 				? '<div class="expand-toggle-wrap">' +
// 					'<label class="expand-toggle-label" for="' + cbId + '">' +
// 						'<input type="checkbox" id="' + cbId + '" class="expand-toggle-cb">' +
// 						'<span class="expand-toggle-btn">Expand</span>' +
// 					'</label>' +
// 					'<span class="expand-row-count">' + rowCount + ' row' + (rowCount !== 1 ? 's' : '') + '</span>' +
// 					'</div>'
// 				: '';

// 			var $section = $(
// 				'<div class="user-section"' +
// 					' data-name="'  + esc(displayName.toLowerCase())    + '"' +
// 					' data-email="' + esc(userData.email.toLowerCase()) + '">' +
// 					'<div class="user-header ' + (isCollapsible ? "user-header-collapsible" : "") + '">' +
// 						'<div class="user-header-left">' +
// 							'<div class="user-name">'  + esc(displayName)    + '</div>' +
// 							'<div class="user-email">' + esc(userData.email) + '</div>' +
// 						'</div>' +
// 						'<div class="user-header-right">' +
// 							'<div class="button-container"></div>' +
// 							expandHtml +
// 						'</div>' +
// 					'</div>' +
// 					'<div class="user-body" style="display:' + (isCollapsible ? "none" : "block") + ';">' +
// 						'<div class="tbl-search-wrap">' +
// 							'<div class="tbl-search-inner">' +
// 								'<i class="fa fa-search tbl-search-icon"></i>' +
// 								'<input type="text" id="' + tsId + '" class="tbl-search-input"' +
// 									' data-safe-id="' + safeId + '"' +
// 									' placeholder="Search units, cost centers, locations..." autocomplete="off"/>' +
// 								'<span id="' + txId + '" class="tbl-search-clear" data-safe-id="' + safeId + '" title="Clear" style="display:none;">&times;</span>' +
// 							'</div>' +
// 							'<div id="' + tcId + '" class="tbl-search-count" style="display:none;"></div>' +
// 						'</div>' +
// 						'<div class="table-slot"></div>' +
// 						'<div class="selection-bar" id="sel-bar-' + safeId + '" style="display:none;">' +
// 							'<span class="sel-bar-count" id="sel-count-' + safeId + '">0 rows selected</span>' +
// 							'<button class="btn btn-success btn-sm sel-submit-btn"' +
// 								' data-safe-id="' + safeId + '"' +
// 								' data-email="'   + esc(userData.email) + '">' +
// 								'<i class="fa fa-paper-plane"></i> Submit Selected' +
// 							'</button>' +
// 							'<button class="btn btn-default btn-sm sel-clear-btn" data-safe-id="' + safeId + '">' +
// 								'<i class="fa fa-times"></i> Clear Selection' +
// 							'</button>' +
// 						'</div>' +
// 					'</div>' +
// 				'</div>'
// 			);

// 			container.append($section);

// 			if (needsModal) {
// 				$section.find(".user-body").prepend(build_note_html());
// 			}

// 			$section.find(".table-slot").html(build_table_html(userData.rows, safeId));

// 			/* Expand / collapse (admin only) */
// 			if (isCollapsible) {
// 				$section.find(".expand-toggle-cb").on("change", function () {
// 					var $body   = $section.find(".user-body");
// 					var $header = $section.find(".user-header");
// 					var $text   = $section.find(".expand-toggle-btn");
// 					if (this.checked) {
// 						$body.slideDown(200);
// 						$header.addClass("is-open");
// 						$text.text("Collapse");
// 					} else {
// 						$body.slideUp(200);
// 						$header.removeClass("is-open");
// 						$text.text("Expand");
// 						$("#" + tsId).val("");
// 						run_table_search(safeId, "");
// 						deselect_all(safeId);
// 					}
// 				});
// 			}

// 			/* Download button — use closure to capture safeId & userData */
// 			(function (sid, email, admin) {
// 				var $dlBtn = $('<button class="btn btn-primary btn-sm dl-btn"><i class="fa fa-download"></i> Download Budget Import Template</button>');
// 				$section.find(".button-container").append($dlBtn);

// 				$dlBtn.on("click", function () {
// 					var anySelected = $(".mis-table[data-safe-id='" + sid + "'] .row-select-cb:checked").length > 0;
// 					if (anySelected) {
// 						/* Rows checked → review modal → run_download with safeId */
// 						show_review_modal(sid, email);
// 					} else {
// 						/* No selection → normal full download */
// 						check_and_download($(this), email, admin);
// 					}
// 				});
// 			})(safeId, userData.email, !needsModal);
// 		});

// 		/* Checkbox: select-all header */
// 		$(document)
// 			.off(".rowSelect")
// 			.on("change.rowSelect", ".select-all-cb", function () {
// 				var sid     = $(this).data("safe-id");
// 				var checked = this.checked;
// 				$(".mis-table[data-safe-id='" + sid + "'] tbody tr:visible").each(function () {
// 					$(this).find(".row-select-cb").prop("checked", checked);
// 					$(this).toggleClass("row-selected", checked);
// 				});
// 				update_selection_bar(sid);
// 			})
// 			.on("change.rowSelect", ".row-select-cb", function () {
// 				var $row   = $(this).closest("tr");
// 				var safeId = $(this).closest(".mis-table").data("safe-id");
// 				$row.toggleClass("row-selected", this.checked);
// 				sync_select_all(safeId);
// 				update_selection_bar(safeId);
// 			});

// 		/* Submit / clear selection bar buttons */
// 		$(document)
// 			.off(".selSubmit")
// 			.on("click.selSubmit", ".sel-submit-btn", function () {
// 				show_review_modal($(this).data("safe-id"), $(this).data("email"));
// 			})
// 			.on("click.selSubmit", ".sel-clear-btn", function () {
// 				deselect_all($(this).data("safe-id"));
// 			});

// 		/* Per-table search */
// 		$(document)
// 			.off(".tblSearch")
// 			.on("input.tblSearch", ".tbl-search-input", function () {
// 				run_table_search($(this).data("safe-id"), this.value);
// 			})
// 			.on("click.tblSearch", ".tbl-search-clear", function () {
// 				var sid = $(this).data("safe-id");
// 				$("#tbl-search-" + sid).val("");
// 				run_table_search(sid, "");
// 			});

// 		/* Admin user search */
// 		if (isCollapsible) {
// 			$(document)
// 				.off(".adminUserSearch")
// 				.on("input.adminUserSearch", "#admin-user-search", function () {
// 					run_user_search(this.value);
// 				})
// 				.on("click.adminUserSearch", "#admin-user-search-clear", function () {
// 					$("#admin-user-search").val("");
// 					run_user_search("");
// 				});
// 			$("#admin-user-search-clear").hide();
// 		}
// 	}

// 	/* ============================================================
// 	   INIT
// 	============================================================ */
// 	$container.html('<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading Data...</div>');

// 	frappe.call({
// 		method  : "annual_budget.api.filter_options.get_user_mappings",
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) {
// 				$container.html('<div class="empty-state">No Data Found</div>');
// 				return;
// 			}
// 			render_content($container, r.message);
// 		}
// 	});

// }; /* end on_page_load */



// frappe.pages["import-template"].on_page_load = function (wrapper) {

// 	frappe.ui.make_app_page({
// 		parent       : wrapper,
// 		title        : "Budget Import Template",
// 		single_column: true,
// 	});

// 	var $container = $(wrapper).find(".layout-main-section");
// 	$container.addClass("budget-import-wrapper");

// 	/* ============================================================
// 	   STYLES
// 	============================================================ */
// 	if (!document.getElementById("allocation-style")) {
// 		var style      = document.createElement("style");
// 		style.id       = "allocation-style";
// 		style.textContent = [
// 			".budget-import-wrapper{padding:25px;background:#fff;min-height:100vh;}",
// 			".loading-state,.empty-state{text-align:center;padding:50px;font-weight:600;color:#0076B6;}",

// 			/* Global user search */
// 			".global-user-search-wrap{margin-bottom:28px;padding:16px 20px;background:#f0f7fd;border:1px solid #c8dff0;border-radius:10px;}",
// 			".gus-label{font-size:11px;font-weight:700;color:#0076B6;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:10px;}",
// 			".gus-label i{margin-right:6px;}",
// 			".gus-inner{position:relative;display:flex;align-items:center;max-width:460px;}",
// 			".gus-icon{position:absolute;left:12px;color:#0076B6;font-size:13px;pointer-events:none;}",
// 			".gus-input{width:100%;padding:9px 34px;border:1.5px solid #c8dff0;border-radius:8px;font-size:13px;color:#222;outline:none;background:#fff;transition:border-color 0.2s,box-shadow 0.2s;}",
// 			".gus-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.12);}",
// 			".gus-clear{position:absolute;right:10px;font-size:17px;color:#999;cursor:pointer;transition:color 0.15s;}",
// 			".gus-clear:hover{color:#c0392b;}",
// 			".gus-count{margin-top:6px;font-size:12px;color:#0076B6;font-weight:600;}",

// 			/* Per-table search */
// 			".tbl-search-wrap{margin-bottom:12px;}",
// 			".tbl-search-inner{position:relative;display:flex;align-items:center;max-width:380px;}",
// 			".tbl-search-icon{position:absolute;left:10px;color:#0076B6;font-size:13px;pointer-events:none;}",
// 			".tbl-search-input{width:100%;padding:8px 30px 8px 32px;border:1.5px solid #d5e8f5;border-radius:7px;font-size:13px;color:#333;outline:none;background:#f9fbfd;transition:border-color 0.2s,box-shadow 0.2s;}",
// 			".tbl-search-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.10);background:#fff;}",
// 			".tbl-search-clear{position:absolute;right:9px;font-size:16px;color:#bbb;cursor:pointer;transition:color 0.15s;}",
// 			".tbl-search-clear:hover{color:#c0392b;}",
// 			".tbl-search-count{margin-top:4px;font-size:11px;color:#0076B6;font-weight:600;}",

// 			/* User section */
// 			".user-section{margin-bottom:40px;}",
// 			".user-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:2px solid #0076B6;margin-bottom:18px;}",
// 			".user-header.user-header-collapsible{padding:14px 18px;background:#f4f9fd;border:1px solid #d0e8f5;border-radius:8px;margin-bottom:0;}",
// 			".user-header.user-header-collapsible.is-open{border-radius:8px 8px 0 0;}",
// 			".user-header-left{flex:1;}",
// 			".user-header-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}",
// 			".user-name{font-size:16px;font-weight:700;color:#003B63;}",
// 			".user-email{font-size:12px;color:#666;margin-top:2px;}",

// 			/* Expand toggle */
// 			".expand-toggle-wrap{display:flex;align-items:center;gap:10px;}",
// 			".expand-toggle-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;}",
// 			".expand-toggle-cb{width:15px;height:15px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
// 			".expand-toggle-btn{font-size:12px;font-weight:700;color:#0076B6;white-space:nowrap;}",
// 			".expand-row-count{font-size:11px;font-weight:600;color:#fff;background:#0076B6;padding:2px 9px;border-radius:99px;white-space:nowrap;}",
// 			".user-header-collapsible + .user-body{border:1px solid #d0e8f5;border-top:none;border-radius:0 0 8px 8px;padding:20px 18px 18px;background:#fff;}",
// 			".user-header:not(.user-header-collapsible) + .user-body{padding:0;border:none;background:transparent;}",

// 			/* Important note */
// 			".note-warning{background:#fff8e1;border-left:5px solid #f4b400;padding:16px;border-radius:6px;margin-bottom:20px;}",
// 			".note-header{font-size:14px;color:#5c4b00;margin-bottom:15px;line-height:1.7;}",
// 			".note-badge{background:#f4b400;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;margin-right:8px;}",
// 			".blinking-badge{animation:softBlink 1.5s ease-in-out infinite;}",
// 			"@keyframes softBlink{0%,100%{opacity:1;}50%{opacity:0.5;}}",

// 			/* Contact cards */
// 			".contact-wrapper{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;}",
// 			".contact-card{background:#fff;border:1px solid #e6e6e6;border-radius:8px;padding:12px 15px;min-width:220px;box-shadow:0 2px 8px rgba(0,0,0,0.04);}",
// 			".contact-name{font-weight:600;color:#333;margin-bottom:4px;font-size:13px;}",
// 			".contact-detail{font-size:12px;color:#666;line-height:1.6;}",

// 			/* Checkbox column */
// 			".cb-cell{width:36px;min-width:36px;text-align:center;padding:6px !important;}",
// 			".row-select-cb,.select-all-cb{width:15px;height:15px;cursor:pointer;accent-color:#0076B6;vertical-align:middle;}",

// 			/* Selected row highlight */
// 			".mis-table tbody tr.row-selected{background:#ddeef8 !important;}",

// 			/* Selection bar */
// 			".selection-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px;padding:10px 16px;background:#e8f5ff;border:1px solid #b0d9f5;border-radius:8px;animation:fadeInUp 0.2s ease;}",
// 			"@keyframes fadeInUp{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}",
// 			".sel-bar-count{font-size:13px;font-weight:700;color:#0076B6;flex:1;}",
// 			".sel-submit-btn{min-width:140px;}",
// 			".sel-clear-btn{min-width:120px;}",

// 			/* Table */
// 			".table-title{font-size:14px;font-weight:600;color:#003B63;margin-bottom:10px;}",
// 			".table-wrapper{overflow-x:auto;}",
// 			".mis-table{width:100%;border-collapse:collapse;font-size:13px;border:1px solid #dcdcdc;}",
// 			".mis-table th{background:#0076B6;color:#fff;font-weight:700;padding:9px 10px;text-align:center;white-space:nowrap;}",
// 			".mis-table td{padding:8px 10px;border:1px solid #e0e0e0;text-align:center;}",
// 			".mis-table tr:nth-child(even){background:#f9f9f9;}",
// 			".mis-table tr:hover{background:#eef6fb;}",

// 			/* Review modal */
// 			"#rev-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);display:none;align-items:center;justify-content:center;z-index:99999;backdrop-filter:blur(5px);padding:15px;}",
// 			".rev-modal-box{background:#fff;width:680px;max-width:100%;max-height:90vh;border-radius:14px;box-shadow:0 30px 70px rgba(0,0,0,0.3);display:flex;flex-direction:column;animation:scaleIn 0.25s ease;overflow:hidden;}",
// 			"@keyframes scaleIn{from{transform:scale(0.95);opacity:0;}to{transform:scale(1);opacity:1;}}",
// 			".rev-modal-header{display:flex;justify-content:space-between;align-items:center;padding:20px 28px 16px;border-bottom:1px solid #e8f0f7;font-weight:700;font-size:17px;color:#003B63;flex-shrink:0;}",
// 			".rev-modal-title i{margin-right:9px;color:#0076B6;}",
// 			"#rev-modal-close{cursor:pointer;font-size:22px;color:#999;transition:color 0.2s;line-height:1;}",
// 			"#rev-modal-close:hover{color:#000;}",
// 			".rev-modal-body{padding:20px 28px;overflow-y:auto;flex:1;}",
// 			".rev-warning-banner{display:flex;align-items:flex-start;gap:14px;background:#fff8e1;border:1px solid #f4b400;border-left:5px solid #f4b400;border-radius:8px;padding:14px 18px;margin-bottom:18px;}",
// 			".rev-warn-icon{font-size:26px;color:#e67e22;flex-shrink:0;margin-top:2px;}",
// 			".rev-warn-title{font-size:14px;font-weight:700;color:#5c3d00;margin-bottom:5px;}",
// 			".rev-warn-sub{font-size:13px;color:#7a5200;line-height:1.6;}",
// 			".rev-count-badge{display:inline-block;font-size:12px;font-weight:700;color:#fff;background:#0076B6;padding:3px 12px;border-radius:99px;margin-bottom:12px;}",
// 			".rev-table-wrap{overflow-x:auto;margin-bottom:20px;border-radius:8px;border:1px solid #d5e8f5;}",
// 			".rev-table{width:100%;border-collapse:collapse;font-size:13px;}",
// 			".rev-table thead tr{background:#0076B6;}",
// 			".rev-table th{color:#fff;font-weight:700;padding:9px 10px;text-align:center;white-space:nowrap;}",
// 			".rev-table td{padding:8px 10px;border:1px solid #e0e0e0;text-align:center;}",
// 			".rev-table tbody tr:nth-child(even){background:#f9f9f9;}",
// 			".rev-table tbody tr:hover{background:#eef6fb;}",
// 			".rev-sl{width:40px;text-align:center;color:#888;font-size:12px;}",
// 			".rev-confirm-wrap{background:#f0f7fd;border:1px solid #c8dff0;border-radius:8px;padding:14px 18px;}",
// 			".rev-confirm-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;font-size:14px;color:#333;}",
// 			".rev-confirm-label input{width:16px;height:16px;margin-top:2px;accent-color:#0076B6;flex-shrink:0;cursor:pointer;}",
// 			".rev-confirm-label i{color:#28a745;margin-right:5px;}",
// 			".rev-modal-footer{display:flex;justify-content:flex-end;gap:12px;padding:16px 28px 20px;border-top:1px solid #e8f0f7;flex-shrink:0;}",
// 			".rev-modal-footer .btn{min-width:150px;}",
// 			"#rev-btn-proceed:disabled{opacity:0.6;cursor:not-allowed;}",

// 			/* APF modal */
// 			"#apf-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);padding:15px;}",
// 			".apf-modal-box{background:#fff;width:640px;max-width:100%;border-radius:12px;box-shadow:0 25px 60px rgba(0,0,0,0.25);padding:35px;animation:scaleIn 0.25s ease;}",
// 			".apf-modal-header{display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:18px;margin-bottom:25px;}",
// 			".apf-modal-title i{margin-right:8px;color:#007bff;}",
// 			"#apf-modal-close{cursor:pointer;font-size:22px;color:#888;transition:color 0.2s;line-height:1;}",
// 			"#apf-modal-close:hover{color:#000;}",
// 			".apf-modal-body{text-align:center;margin-bottom:25px;}",
// 			".apf-modal-icon{font-size:42px;margin-bottom:15px;}",
// 			".apf-modal-text{font-weight:600;font-size:15px;color:#c0392b;margin-bottom:12px;line-height:1.6;}",
// 			".apf-modal-sub{font-size:14px;color:#555;margin-bottom:20px;line-height:1.6;}",
// 			".apf-checkbox-wrapper{background:#f8f9fa;padding:16px 18px;border-radius:8px;border:1px solid #e0e0e0;font-size:14px;text-align:left;margin-top:6px;}",
// 			".apf-checkbox-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;}",
// 			".apf-checkbox-label i{color:#28a745;margin-right:4px;}",
// 			".apf-checkbox-label input{margin-top:3px;transform:scale(1.1);flex-shrink:0;}",
// 			".apf-modal-footer{display:flex;justify-content:flex-end;gap:12px;margin-top:10px;}",
// 			".apf-modal-footer .btn{min-width:150px;}",
// 			"#apf-modal-proceed:disabled{opacity:0.6;cursor:not-allowed;}",

// 			/* Loader */
// 			"#global-loader.loader-overlay{position:fixed;inset:0;width:100vw;height:100vh;background:rgba(18,18,18,0.92);backdrop-filter:blur(6px);z-index:999999;display:none;align-items:center;justify-content:center;}",
// 			"#global-loader.loader-overlay.active{display:flex;}",
// 			".loader-box{display:flex;flex-direction:column;align-items:center;gap:16px;}",
// 			".loader-ring-wrap{position:relative;width:120px;height:120px;display:flex;align-items:center;justify-content:center;}",
// 			".loader-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);}",
// 			".loader-ring-bg{fill:none;stroke:rgba(255,255,255,0.12);stroke-width:6;}",
// 			".loader-ring-fill{fill:none;stroke:url(#ringGrad);stroke-width:6;stroke-linecap:round;stroke-dasharray:276.46;stroke-dashoffset:276.46;transition:stroke-dashoffset 0.35s ease;}",
// 			".loader-logo{width:78px;height:78px;border-radius:50%;background:linear-gradient(145deg,#fff,#eaeaea);padding:12px;object-fit:contain;box-shadow:0 8px 24px rgba(0,0,0,.35);animation:pulse 1.6s infinite ease-in-out;position:relative;z-index:1;}",
// 			".loader-pct-inside{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:700;color:#fff;background:rgba(0,118,182,0.85);padding:1px 7px;border-radius:99px;z-index:2;white-space:nowrap;}",
// 			".loader-text{font-size:14px;color:#fff;font-weight:600;letter-spacing:0.5px;text-align:center;opacity:0.85;}",
// 			"@keyframes pulse{0%,100%{transform:scale(1);opacity:0.85;}50%{transform:scale(1.06);opacity:1;}}",
// 			".dl-anim-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;width:60px;}",
// 			".dl-arrow-track{width:24px;height:28px;overflow:hidden;position:relative;}",
// 			".dl-arrow{display:flex;flex-direction:column;align-items:center;position:absolute;left:50%;transform:translateX(-50%);animation:dl-drop 1.2s ease-in-out infinite;}",
// 			".dl-arrow-stem{width:3px;height:14px;background:linear-gradient(180deg,#00c6ff,#0076B6);border-radius:2px;}",
// 			".dl-arrow-head{width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid #0076B6;}",
// 			"@keyframes dl-drop{0%{top:-28px;opacity:0;}30%{opacity:1;}70%{opacity:1;}100%{top:28px;opacity:0;}}",
// 			".dl-bar{width:44px;height:4px;background:linear-gradient(90deg,#0076B6,#00c6ff);border-radius:99px;animation:dl-bar-pulse 1.2s ease-in-out infinite;}",
// 			"@keyframes dl-bar-pulse{0%,100%{opacity:0.4;transform:scaleX(0.8);}50%{opacity:1;transform:scaleX(1);}}",
// 			".dl-dots{display:flex;gap:5px;}",
// 			".dl-dots span{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.6);animation:dl-bounce 1.2s ease-in-out infinite;}",
// 			".dl-dots span:nth-child(1){animation-delay:0s;}",
// 			".dl-dots span:nth-child(2){animation-delay:0.2s;}",
// 			".dl-dots span:nth-child(3){animation-delay:0.4s;}",
// 			"@keyframes dl-bounce{0%,80%,100%{transform:scale(1);opacity:0.5;}40%{transform:scale(1.5);opacity:1;}}",

// 			/* Responsive */
// 			"@media(max-width:768px){",
// 			".budget-import-wrapper{padding:16px;}",
// 			".user-header,.user-header.user-header-collapsible{flex-direction:column;align-items:flex-start;gap:10px;padding:12px 14px;}",
// 			".user-header-right{width:100%;justify-content:space-between;flex-wrap:wrap;gap:8px;}",
// 			".button-container{width:100%;}",
// 			".dl-btn{width:100%;justify-content:center;}",
// 			".gus-inner,.tbl-search-inner{max-width:100%;}",
// 			".contact-wrapper{flex-direction:column;}",
// 			".contact-card{min-width:unset;width:100%;}",
// 			".mis-table th,.mis-table td{padding:7px 6px;}",
// 			".selection-bar{flex-direction:column;align-items:flex-start;}",
// 			".sel-submit-btn,.sel-clear-btn{width:100%;}",
// 			"}",
// 			"@media(max-width:576px){",
// 			".budget-import-wrapper{padding:12px;}",
// 			".user-name{font-size:14px;}",
// 			".user-email{font-size:11px;}",
// 			".table-wrapper{overflow-x:auto;-webkit-overflow-scrolling:touch;}",
// 			".mis-table{font-size:11px;min-width:560px;}",
// 			".mis-table th,.mis-table td{padding:6px 5px;white-space:nowrap;}",
// 			".apf-modal-box{padding:20px 16px;border-radius:10px;}",
// 			".apf-modal-footer{flex-direction:column;gap:8px;}",
// 			".apf-modal-footer .btn{width:100%;min-width:unset;margin:0;}",
// 			".rev-modal-footer{flex-direction:column;gap:8px;}",
// 			".rev-modal-footer .btn{width:100%;min-width:unset;}",
// 			".loader-ring-wrap{width:100px;height:100px;}",
// 			".loader-logo{width:64px;height:64px;}",
// 			"}"
// 		].join("");
// 		document.head.appendChild(style);
// 	}

// 	/* ============================================================
// 	   LOADER
// 	============================================================ */
// 	function init_loader() {
// 		if ($("#global-loader").length) return;
// 		$("body").append(
// 			'<div id="global-loader" class="loader-overlay">' +
// 				'<div class="loader-box">' +
// 					'<div class="loader-ring-wrap">' +
// 						'<svg class="loader-ring" viewBox="0 0 100 100">' +
// 							'<defs>' +
// 								'<linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
// 									'<stop offset="0%" stop-color="#0076B6"/>' +
// 									'<stop offset="100%" stop-color="#00c6ff"/>' +
// 								'</linearGradient>' +
// 							'</defs>' +
// 							'<circle class="loader-ring-bg" cx="50" cy="50" r="44"/>' +
// 							'<circle class="loader-ring-fill" id="loader-ring-fill" cx="50" cy="50" r="44"/>' +
// 						'</svg>' +
// 						'<img src="/files/APF logo.png" class="loader-logo" alt="Loading">' +
// 						'<div class="loader-pct-inside" id="loader-pct">0%</div>' +
// 					'</div>' +
// 					'<div class="dl-anim-wrap">' +
// 						'<div class="dl-arrow-track"><div class="dl-arrow"><div class="dl-arrow-stem"></div><div class="dl-arrow-head"></div></div></div>' +
// 						'<div class="dl-bar"></div>' +
// 						'<div class="dl-dots"><span></span><span></span><span></span></div>' +
// 					'</div>' +
// 					'<div class="loader-text" id="loader-text-msg">Preparing download...</div>' +
// 				'</div>' +
// 			'</div>'
// 		);
// 	}

// 	function set_progress(pct) {
// 		var offset = 276.46 - (pct / 100) * 276.46;
// 		$("#loader-ring-fill").css("stroke-dashoffset", offset);
// 		$("#loader-pct").text(Math.round(pct) + "%");
// 	}

// 	var Loader = {
// 		show: function (msg) {
// 			init_loader();
// 			$("#loader-text-msg").text(msg || "Preparing download...");
// 			set_progress(0);
// 			$("#global-loader").addClass("active");
// 		},
// 		setText: function (msg) { $("#loader-text-msg").text(msg); },
// 		setProgress: function (pct) { set_progress(pct); },
// 		hide: function () { $("#global-loader").removeClass("active"); }
// 	};

// 	/* ============================================================
// 	   APF MODAL
// 	============================================================ */
// 	function init_apf_modal() {
// 		if ($("#apf-modal-overlay").length) return;
// 		$("body").append(
// 			'<div id="apf-modal-overlay">' +
// 				'<div class="apf-modal-box">' +
// 					'<div class="apf-modal-header">' +
// 						'<div class="apf-modal-title" id="apf-modal-title"></div>' +
// 						'<span id="apf-modal-close" title="Close">&times;</span>' +
// 					'</div>' +
// 					'<div class="apf-modal-body">' +
// 						'<div class="apf-modal-icon" id="apf-modal-icon"><i id="apf-modal-icon-i" class="fa"></i></div>' +
// 						'<div class="apf-modal-text" id="apf-modal-text"></div>' +
// 						'<div class="apf-modal-sub" id="apf-modal-sub"></div>' +
// 						'<div class="apf-checkbox-wrapper" id="apf-checkbox-wrap" style="display:none;">' +
// 							'<label class="apf-checkbox-label">' +
// 								'<input type="checkbox" id="apf-modal-checkbox">' +
// 								'<span><i class="fa fa-check-circle"></i> I confirm that I have verified all details carefully.</span>' +
// 							'</label>' +
// 						'</div>' +
// 					'</div>' +
// 					'<div class="apf-modal-footer" id="apf-modal-footer"></div>' +
// 				'</div>' +
// 			'</div>'
// 		);
// 		$(document)
// 			.off(".apfModal")
// 			.on("click.apfModal", "#apf-modal-close", hide_apf_modal)
// 			.on("click.apfModal", "#apf-modal-overlay", function (e) {
// 				if ($(e.target).is("#apf-modal-overlay")) hide_apf_modal();
// 			})
// 			.on("change.apfModal", "#apf-modal-checkbox", function () {
// 				$("#apf-modal-proceed").prop("disabled", !this.checked);
// 			});
// 	}

// 	function hide_apf_modal() {
// 		$("#apf-modal-overlay").hide();
// 		$("#apf-modal-checkbox").prop("checked", false);
// 		$("#apf-modal-proceed").prop("disabled", true);
// 	}

// 	function show_apf_modal(opts) {
// 		init_apf_modal();
// 		$("#apf-modal-title").html(opts.title || "");
// 		$("#apf-modal-icon-i")
// 			.attr("class", "fa " + (opts.icon || "fa-exclamation-triangle"))
// 			.closest(".apf-modal-icon")
// 			.css("color", opts.iconColor || "#e74c3c");
// 		$("#apf-modal-text").html(opts.text || "");
// 		$("#apf-modal-sub").html(opts.sub || "");
// 		var showCb = !!opts.showCheckbox;
// 		$("#apf-checkbox-wrap").toggle(showCb);
// 		if (showCb) $("#apf-modal-checkbox").prop("checked", false);
// 		var $footer = $("#apf-modal-footer").empty();
// 		(opts.buttons || []).forEach(function (btn) {
// 			var $b = $('<button id="' + (btn.id || "") + '" class="btn ' + (btn.cls || "btn-default") + ' btn-sm">' + btn.label + '</button>')
// 				.prop("disabled", !!btn.disabled);
// 			$b.on("click", function () { if (btn.onClick) btn.onClick(); });
// 			$footer.append($b);
// 		});
// 		$("#apf-modal-overlay").css("display", "flex");
// 	}

// 	/* ============================================================
// 	   REVIEW MODAL
// 	============================================================ */
// 	function init_review_modal() {
// 		if ($("#rev-modal-overlay").length) return;
// 		$("body").append(
// 			'<div id="rev-modal-overlay">' +
// 				'<div class="rev-modal-box">' +
// 					'<div class="rev-modal-header">' +
// 						'<div class="rev-modal-title"><i class="fa fa-list-alt"></i> Review Selected Items</div>' +
// 						'<span id="rev-modal-close" title="Close">&times;</span>' +
// 					'</div>' +
// 					'<div class="rev-modal-body">' +
// 						'<div class="rev-warning-banner">' +
// 							'<i class="fa fa-exclamation-triangle rev-warn-icon"></i>' +
// 							'<div>' +
// 								'<div class="rev-warn-title">Please make a note of the items listed below.</div>' +
// 								'<div class="rev-warn-sub">Keep a record of the selected Cost Centers and Location Codes to avoid duplicates when importing the Budget Template.</div>' +
// 							'</div>' +
// 						'</div>' +
// 						'<div class="rev-count-badge" id="rev-count-badge"></div>' +
// 						'<div class="rev-table-wrap">' +
// 							'<table class="rev-table">' +
// 								'<thead><tr>' +
// 									'<th class="rev-sl">#</th>' +
// 									'<th>Unit</th>' +
// 									'<th>Unit Description</th>' +
// 									'<th>Cost Center</th>' +
// 									'<th>Cost Center Description</th>' +
// 									'<th>Location Code</th>' +
// 									'<th>Location Description</th>' +
// 								'</tr></thead>' +
// 								'<tbody id="rev-table-body"></tbody>' +
// 							'</table>' +
// 						'</div>' +
// 						'<div class="rev-confirm-wrap">' +
// 							'<label class="rev-confirm-label">' +
// 								'<input type="checkbox" id="rev-confirm-cb">' +
// 								'<span><i class="fa fa-check-circle"></i> I have noted down the selected items and I am ready to proceed.</span>' +
// 							'</label>' +
// 						'</div>' +
// 					'</div>' +
// 					'<div class="rev-modal-footer">' +
// 						'<button id="rev-btn-cancel" class="btn btn-default btn-sm"><i class="fa fa-times"></i> Cancel</button>' +
// 						'<button id="rev-btn-proceed" class="btn btn-success btn-sm" disabled><i class="fa fa-download"></i> Proceed to Download</button>' +
// 					'</div>' +
// 				'</div>' +
// 			'</div>'
// 		);
// 		$(document)
// 			.off(".revModal")
// 			.on("click.revModal", "#rev-modal-close, #rev-btn-cancel", hide_review_modal)
// 			.on("click.revModal", "#rev-modal-overlay", function (e) {
// 				if ($(e.target).is("#rev-modal-overlay")) hide_review_modal();
// 			})
// 			.on("change.revModal", "#rev-confirm-cb", function () {
// 				$("#rev-btn-proceed").prop("disabled", !this.checked);
// 			})
// 			.on("click.revModal", "#rev-btn-proceed", function () {
// 				var $overlay = $("#rev-modal-overlay");
// 				var sid      = $overlay.data("safe-id");
// 				var email    = $overlay.data("user-email");
// 				var $section = $(".user-section").filter(function () {
// 					return $(this).data("email") === (email || "").toLowerCase();
// 				});
// 				var $btn = $section.find(".dl-btn");
// 				hide_review_modal();
// 				run_download($btn, email, sid);
// 			});
// 	}

// 	function hide_review_modal() {
// 		$("#rev-modal-overlay").hide();
// 		$("#rev-confirm-cb").prop("checked", false);
// 		$("#rev-btn-proceed").prop("disabled", true);
// 	}

// 	function show_review_modal(safeId, userEmail) {
// 		var selected = get_selected_rows(safeId);
// 		if (!selected.length) {
// 			frappe.msgprint({ title: "Nothing Selected", message: "Please select at least one row.", indicator: "orange" });
// 			return;
// 		}
// 		init_review_modal();

// 		/* Show all columns — same as the main allocation table */
// 		var tableRows = selected.map(function (r, i) {
// 			return '<tr>' +
// 				'<td class="rev-sl">' + (i + 1)                          + '</td>' +
// 				'<td>' + esc(r.unit)                    + '</td>' +
// 				'<td>' + esc(r.unit_description)        + '</td>' +
// 				'<td>' + esc(r.cost_center)             + '</td>' +
// 				'<td>' + esc(r.cost_center_description) + '</td>' +
// 				'<td>' + esc(r.location_code)           + '</td>' +
// 				'<td>' + esc(r.location_description)    + '</td>' +
// 				'</tr>';
// 		}).join("");

// 		$("#rev-table-body").html(tableRows);
// 		$("#rev-count-badge").text(selected.length + " item" + (selected.length !== 1 ? "s" : "") + " selected");
// 		$("#rev-confirm-cb").prop("checked", false);
// 		$("#rev-btn-proceed").prop("disabled", true);

// 		$("#rev-modal-overlay")
// 			.data("safe-id",    safeId)
// 			.data("user-email", userEmail)
// 			.css("display", "flex");
// 	}

// 	/* ============================================================
// 	   HELPERS
// 	============================================================ */
// 	function esc(str) {
// 		return $("<div>").text(str || "").html();
// 	}

// 	function reset_btn($btn, loading, loadingText) {
// 		$btn.prop("disabled", loading).html(
// 			loading
// 				? '<i class="fa fa-spinner fa-spin"></i> ' + (loadingText || "Loading...")
// 				: '<i class="fa fa-download"></i> Download Budget Import Template'
// 		);
// 	}

// 	/* Returns array of row objects for all checked rows in a table */
// 	function get_selected_rows(safeId) {
// 		var selected = [];
// 		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").each(function () {
// 			var $row = $(this);
// 			if (!$row.find(".row-select-cb").is(":checked")) return;
// 			selected.push({
// 				unit                   : $row.data("unit")                    || "",
// 				unit_description       : $row.data("unit-description")        || "",
// 				cost_center            : $row.data("cost-center")             || "",
// 				cost_center_description: $row.data("cost-center-description") || "",
// 				location_code          : $row.data("location-code")           || "",
// 				location_description   : $row.data("location-description")    || ""
// 			});
// 		});
// 		return selected;
// 	}

// 	function sync_select_all(safeId) {
// 		var $all     = $(".mis-table[data-safe-id='" + safeId + "'] tbody tr:visible .row-select-cb");
// 		var $checked = $all.filter(":checked");
// 		var $hdr     = $(".select-all-cb[data-safe-id='" + safeId + "']");
// 		if ($all.length === 0 || $checked.length === 0) {
// 			$hdr.prop("checked", false).prop("indeterminate", false);
// 		} else if ($checked.length === $all.length) {
// 			$hdr.prop("checked", true).prop("indeterminate", false);
// 		} else {
// 			$hdr.prop("checked", false).prop("indeterminate", true);
// 		}
// 	}

// 	function update_selection_bar(safeId) {
// 		var count = $(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb:checked").length;
// 		var $bar  = $("#sel-bar-" + safeId);
// 		if (count > 0) {
// 			$bar.show();
// 			$("#sel-count-" + safeId).text(count + " row" + (count !== 1 ? "s" : "") + " selected");
// 		} else {
// 			$bar.hide();
// 		}
// 	}

// 	function deselect_all(safeId) {
// 		$(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb").prop("checked", false);
// 		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").removeClass("row-selected");
// 		$(".select-all-cb[data-safe-id='" + safeId + "']").prop("checked", false).prop("indeterminate", false);
// 		update_selection_bar(safeId);
// 	}

// 	function run_table_search(safeId, query) {
// 		var q       = (query || "").trim().toLowerCase();
// 		var $table  = $(".mis-table[data-safe-id='" + safeId + "']");
// 		var visible = 0;
// 		$table.find("tbody tr").each(function () {
// 			var match = !q || this.textContent.toLowerCase().indexOf(q) !== -1;
// 			$(this).toggle(match);
// 			if (match) visible++;
// 		});
// 		sync_select_all(safeId);
// 		var $count = $("#tbl-count-" + safeId);
// 		if (q) {
// 			$count.text(visible + " row" + (visible !== 1 ? "s" : "") + " matched").show();
// 		} else {
// 			$count.hide();
// 		}
// 		$("#tbl-clear-" + safeId).toggle(q.length > 0);
// 	}

// 	function run_user_search(query) {
// 		var q     = query.trim().toLowerCase();
// 		var total = 0;
// 		$(".user-section").each(function () {
// 			var $sec  = $(this);
// 			var match = !q
// 				|| ($sec.data("name")  || "").indexOf(q) !== -1
// 				|| ($sec.data("email") || "").indexOf(q) !== -1;
// 			$sec.toggle(match);
// 			if (match) total++;
// 		});
// 		var $count = $("#admin-user-search-count");
// 		if (q) {
// 			$count.text(total + " user" + (total !== 1 ? "s" : "") + " found").show();
// 		} else {
// 			$count.hide();
// 		}
// 		$("#admin-user-search-clear").toggle(q.length > 0);
// 	}

// 	function build_note_html() {
// 		var contacts = [
// 			["Rakesh Ahuja",        "rakesh.ahuja@azimpremjifoundation.org",      "+91 7022068106"],
// 			["Saravana G",          "saravana.g@azimpremjifoundation.org",        "+91 9380861952"],
// 			["Augustin Moses R",    "augustin.moses@azimpremjifoundation.org",    "+91 8667719594"],
// 			["Mercy Selvanayagi R", "mercy.selvanayagi@azimpremjifoundation.org", "+91 9047828687"],
// 			["Mahaveer Ram P",      "mahaveer.p@azimpremjifoundation.org",        "+91 8825879412"]
// 		];
// 		var cards = contacts.map(function (c) {
// 			return '<div class="contact-card">' +
// 				'<div class="contact-name">'   + c[0] + '</div>' +
// 				'<div class="contact-detail">' + c[1] + '</div>' +
// 				'<div class="contact-detail">' + c[2] + '</div>' +
// 				'</div>';
// 		}).join("");
// 		return '<div class="note-warning">' +
// 			'<div class="note-header">' +
// 				'<span class="note-badge blinking-badge">IMPORTANT</span>' +
// 				'Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below. ' +
// 				'If you notice any discrepancies, contact the support team immediately. ' +
// 				'Do not proceed with the import until all details are verified and confirmed.' +
// 			'</div>' +
// 			'<div class="contact-wrapper">' + cards + '</div>' +
// 			'</div>';
// 	}

// 	function build_table_html(rows, safeId) {
// 		var COLS = [
// 			["unit",                    "Unit"                    ],
// 			["unit_description",        "Unit Description"        ],
// 			["cost_center",             "Cost Center"             ],
// 			["cost_center_description", "Cost Center Description" ],
// 			["location_code",           "Location Code"           ],
// 			["location_description",    "Location Description"    ]
// 		];
// 		var headers = COLS.map(function (c) { return "<th>" + c[1] + "</th>"; }).join("");
// 		var bodyRows = rows.map(function (row, i) {
// 			var da =
// 				'data-unit="'                    + esc(row.unit || "")                    + '" ' +
// 				'data-unit-description="'        + esc(row.unit_description || "")        + '" ' +
// 				'data-cost-center="'             + esc(row.cost_center || "")             + '" ' +
// 				'data-cost-center-description="' + esc(row.cost_center_description || "") + '" ' +
// 				'data-location-code="'           + esc(row.location_code || "")           + '" ' +
// 				'data-location-description="'    + esc(row.location_description || "")    + '"';
// 			var cells = COLS.map(function (c) {
// 				return "<td>" + esc(row[c[0]] || "") + "</td>";
// 			}).join("");
// 			return '<tr ' + da + '>' +
// 				'<td class="cb-cell"><input type="checkbox" class="row-select-cb" title="Select row"></td>' +
// 				'<td>' + (i + 1) + '</td>' +
// 				cells +
// 				'</tr>';
// 		}).join("");
// 		return '<h4 class="table-title">Allocated Units &amp; Cost Centers</h4>' +
// 			'<div class="table-wrapper">' +
// 				'<table class="mis-table" data-safe-id="' + safeId + '">' +
// 					'<thead><tr>' +
// 						'<th class="cb-cell"><input type="checkbox" class="select-all-cb" data-safe-id="' + safeId + '" title="Select all visible rows"></th>' +
// 						'<th>Sl. No.</th>' + headers +
// 					'</tr></thead>' +
// 					'<tbody>' + bodyRows + '</tbody>' +
// 				'</table>' +
// 			'</div>';
// 	}

// 	/* ============================================================
// 	   DOWNLOAD FLOW
// 	============================================================ */

// 	/*
// 	 * run_download($btn, userEmail, safeId)
// 	 *
// 	 * safeId = null  → no rows selected, download all mappings from backend
// 	 * safeId = string → read checked rows from that table and send as JSON array
// 	 */
// 	function run_download($btn, userEmail, safeId) {
// 		var selected      = (safeId && safeId !== "null") ? get_selected_rows(safeId) : [];
// 		var entityDataArg = selected.length ? JSON.stringify(selected) : null;

// 		reset_btn($btn, true, "Downloading...");
// 		Loader.show("Generating your template...");

// 		var pct   = 0;
// 		var timer = setInterval(function () {
// 			var step = pct < 40 ? 3 : pct < 70 ? 1.5 : 0.4;
// 			pct = Math.min(pct + step, 84);
// 			Loader.setProgress(pct);
// 		}, 300);

// 		function on_done(success) {
// 			clearInterval(timer);
// 			if (success) {
// 				Loader.setProgress(100);
// 				Loader.setText("Download ready!");
// 				setTimeout(function () {
// 					Loader.hide();
// 					reset_btn($btn, false);
// 					if (safeId) deselect_all(safeId);
// 				}, 800);
// 			} else {
// 				Loader.hide();
// 				reset_btn($btn, false);
// 			}
// 		}

// 		/* Step 1 — enqueue generation */
// 		frappe.call({
// 			method: "annual_budget.api.export_reports.start_budget_template_generation",
// 			args  : {
// 				user       : userEmail,
// 				entity_data: entityDataArg
// 			},
// 			callback: function () {
// 				clearInterval(timer);
// 				Loader.setText("Fetching your template...");

// 				pct   = 30;
// 				timer = setInterval(function () {
// 					pct = Math.min(pct + 0.3, 84);
// 					Loader.setProgress(pct);
// 				}, 400);

// 				var polling  = false;
// 				var stopped  = false;

// 				/* Step 2 — poll every 3s until file is ready */
// 				var pollTimer = setInterval(function () {
// 					if (polling || stopped) return;
// 					polling = true;

// 					fetch(
// 						"/api/method/annual_budget.api.export_reports.download_generated_template" +
// 						"?user=" + encodeURIComponent(userEmail),
// 						{ headers: { "X-Frappe-CSRF-Token": frappe.csrf_token } }
// 					)
// 						.then(function (resp) {
// 							if (!resp.ok) {
// 								polling = false;
// 								throw new Error("Server returned " + resp.status);
// 							}
// 							var ct = resp.headers.get("content-type") || "";

// 							/* Still processing */
// 							if (ct.indexOf("application/json") !== -1) {
// 								polling = false;
// 								Loader.setText("Still generating, please wait...");
// 								return;
// 							}

// 							/* File ready — stop everything */
// 							stopped = true;
// 							clearInterval(pollTimer);
// 							clearInterval(timer);
// 							Loader.setProgress(95);
// 							Loader.setText("Preparing file...");

// 							var disp     = resp.headers.get("Content-Disposition") || "";
// 							var match    = disp.match(/filename[^;=\n]*=["']?([^"';\n]+)/);
// 							var filename = match ? decodeURIComponent(match[1].trim()) : "Budget_Import_Template.xlsx";

// 							return resp.blob().then(function (blob) {
// 								var url = URL.createObjectURL(blob);
// 								var a   = document.createElement("a");
// 								a.href     = url;
// 								a.download = filename;
// 								document.body.appendChild(a);
// 								a.click();
// 								a.remove();
// 								setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
// 								on_done(true);
// 							});
// 						})
// 						.catch(function (err) {
// 							if (stopped) return;
// 							stopped = true;
// 							clearInterval(pollTimer);
// 							clearInterval(timer);
// 							on_done(false);
// 							frappe.msgprint({
// 								title    : "Download Failed",
// 								message  : "Could not download the template.<br><small>" + err.message + "</small>",
// 								indicator: "red"
// 							});
// 						});
// 				}, 3000);
// 			},
// 			error: function () {
// 				clearInterval(timer);
// 				on_done(false);
// 				frappe.msgprint({ title: "Error", message: "Could not start template generation. Please try again.", indicator: "red" });
// 			}
// 		});
// 	}

// 	function check_and_download($btn, userEmail, isAdmin) {
// 		reset_btn($btn, true, "Checking...");
// 		frappe.call({
// 			method : "frappe.client.get_value",
// 			args   : {
// 				doctype  : "Finance user access",
// 				filters  : { user: userEmail },
// 				fieldname: "import_template_id"
// 			},
// 			callback: function (r) {
// 				var templateId = r.message && r.message.import_template_id;
// 				if (!templateId) {
// 					reset_btn($btn, false);
// 					show_apf_modal({
// 						title    : '<i class="fa fa-exclamation-triangle"></i> ' + (isAdmin ? "Template Not Configured" : "Import Template Missing"),
// 						icon     : "fa-exclamation-triangle",
// 						iconColor: isAdmin ? "#e67e22" : "#e74c3c",
// 						text     : isAdmin ? "No Import Template is linked for this user account." : "Import Template is not configured for this account.",
// 						sub      : isAdmin
// 							? "The <b>import_template_id</b> in <b>Finance User Access</b> is empty for <b>" + esc(userEmail) + "</b>.<br><br>Please assign a valid Import Template before retrying."
// 							: "Please contact your administrator to link an <b>Import Template</b> in <b>Finance User Access</b> before downloading.",
// 						buttons  : [{ label: '<i class="fa fa-times"></i> Close', cls: "btn-default", onClick: hide_apf_modal }]
// 					});
// 					return;
// 				}
// 				if (isAdmin) {
// 					run_download($btn, userEmail, null);
// 				} else {
// 					reset_btn($btn, false);
// 					show_apf_modal({
// 						title       : '<i class="fa fa-download"></i> Confirm Download',
// 						icon        : "fa-exclamation-triangle",
// 						iconColor   : "#e74c3c",
// 						text        : "Please carefully review and validate all allocated Units, Cost Centers, and Location Codes before downloading.",
// 						sub         : "Do not proceed unless everything has been reviewed and confirmed.",
// 						showCheckbox: true,
// 						buttons     : [
// 							{ label: '<i class="fa fa-times"></i> Cancel', cls: "btn-default", onClick: hide_apf_modal },
// 							{
// 								id      : "apf-modal-proceed",
// 								label   : '<i class="fa fa-download"></i> Proceed to Download',
// 								cls     : "btn-primary",
// 								disabled: true,
// 								onClick : function () {
// 									hide_apf_modal();
// 									run_download($btn, userEmail, null);
// 								}
// 							}
// 						]
// 					});
// 				}
// 			},
// 			error: function () {
// 				reset_btn($btn, false);
// 				frappe.msgprint({ title: "Check Failed", message: "Could not verify the Import Template. Please try again.", indicator: "red" });
// 			}
// 		});
// 	}

// 	/* ============================================================
// 	   RENDER CONTENT
// 	============================================================ */
// 	function render_content(container, data) {

// 		var roles                = Array.isArray(frappe.user_roles) ? frappe.user_roles : [];
// 		var isFinanceCoordinator = roles.indexOf("Finance Unit Coordinator") !== -1;
// 		var isSystemManager      = roles.indexOf("System Manager") !== -1;
// 		var isFinanceAdmin       = roles.indexOf("Finance Admin") !== -1;
// 		var needsModal           = isFinanceCoordinator && !isSystemManager && !isFinanceAdmin;
// 		var isCollapsible        = isSystemManager || isFinanceAdmin;

// 		var grouped = {};
// 		data.forEach(function (row) {
// 			if (!grouped[row.user]) {
// 				grouped[row.user] = { user_fullname: row.user_fullname || "", email: row.user, rows: [] };
// 			}
// 			grouped[row.user].rows.push(row);
// 		});

// 		container.empty();

// 		/* Admin user search */
// 		if (isCollapsible) {
// 			container.append(
// 				'<div class="global-user-search-wrap">' +
// 					'<div class="gus-label"><i class="fa fa-users"></i> Search User</div>' +
// 					'<div class="gus-inner">' +
// 						'<i class="fa fa-search gus-icon"></i>' +
// 						'<input type="text" id="admin-user-search" class="gus-input" placeholder="Search by user name or email..." autocomplete="off"/>' +
// 						'<span id="admin-user-search-clear" class="gus-clear" title="Clear">&times;</span>' +
// 					'</div>' +
// 					'<div id="admin-user-search-count" class="gus-count" style="display:none;"></div>' +
// 				'</div>'
// 			);
// 		}

// 		/* Build each user section */
// 		Object.keys(grouped).forEach(function (key) {
// 			var userData    = grouped[key];
// 			var displayName = userData.user_fullname || userData.email;
// 			var rowCount    = userData.rows.length;
// 			var safeId      = userData.email.replace(/[^a-z0-9]/gi, "_");
// 			var cbId        = "expand-cb-"  + safeId;
// 			var tsId        = "tbl-search-" + safeId;
// 			var tcId        = "tbl-count-"  + safeId;
// 			var txId        = "tbl-clear-"  + safeId;

// 			var expandHtml = isCollapsible
// 				? '<div class="expand-toggle-wrap">' +
// 					'<label class="expand-toggle-label" for="' + cbId + '">' +
// 						'<input type="checkbox" id="' + cbId + '" class="expand-toggle-cb">' +
// 						'<span class="expand-toggle-btn">Expand</span>' +
// 					'</label>' +
// 					'<span class="expand-row-count">' + rowCount + ' row' + (rowCount !== 1 ? 's' : '') + '</span>' +
// 					'</div>'
// 				: '';

// 			var $section = $(
// 				'<div class="user-section"' +
// 					' data-name="'  + esc(displayName.toLowerCase())    + '"' +
// 					' data-email="' + esc(userData.email.toLowerCase()) + '">' +
// 					'<div class="user-header ' + (isCollapsible ? "user-header-collapsible" : "") + '">' +
// 						'<div class="user-header-left">' +
// 							'<div class="user-name">'  + esc(displayName)    + '</div>' +
// 							'<div class="user-email">' + esc(userData.email) + '</div>' +
// 						'</div>' +
// 						'<div class="user-header-right">' +
// 							'<div class="button-container"></div>' +
// 							expandHtml +
// 						'</div>' +
// 					'</div>' +
// 					'<div class="user-body" style="display:' + (isCollapsible ? "none" : "block") + ';">' +
// 						'<div class="tbl-search-wrap">' +
// 							'<div class="tbl-search-inner">' +
// 								'<i class="fa fa-search tbl-search-icon"></i>' +
// 								'<input type="text" id="' + tsId + '" class="tbl-search-input"' +
// 									' data-safe-id="' + safeId + '"' +
// 									' placeholder="Search units, cost centers, locations..." autocomplete="off"/>' +
// 								'<span id="' + txId + '" class="tbl-search-clear" data-safe-id="' + safeId + '" title="Clear" style="display:none;">&times;</span>' +
// 							'</div>' +
// 							'<div id="' + tcId + '" class="tbl-search-count" style="display:none;"></div>' +
// 						'</div>' +
// 						'<div class="table-slot"></div>' +
// 						'<div class="selection-bar" id="sel-bar-' + safeId + '" style="display:none;">' +
// 							'<span class="sel-bar-count" id="sel-count-' + safeId + '">0 rows selected</span>' +
// 							'<button class="btn btn-success btn-sm sel-submit-btn"' +
// 								' data-safe-id="' + safeId + '"' +
// 								' data-email="'   + esc(userData.email) + '">' +
// 								'<i class="fa fa-paper-plane"></i> Submit Selected' +
// 							'</button>' +
// 							'<button class="btn btn-default btn-sm sel-clear-btn" data-safe-id="' + safeId + '">' +
// 								'<i class="fa fa-times"></i> Clear Selection' +
// 							'</button>' +
// 						'</div>' +
// 					'</div>' +
// 				'</div>'
// 			);

// 			container.append($section);

// 			if (needsModal) {
// 				$section.find(".user-body").prepend(build_note_html());
// 			}

// 			$section.find(".table-slot").html(build_table_html(userData.rows, safeId));

// 			/* Expand / collapse (admin only) */
// 			if (isCollapsible) {
// 				$section.find(".expand-toggle-cb").on("change", function () {
// 					var $body   = $section.find(".user-body");
// 					var $header = $section.find(".user-header");
// 					var $text   = $section.find(".expand-toggle-btn");
// 					if (this.checked) {
// 						$body.slideDown(200);
// 						$header.addClass("is-open");
// 						$text.text("Collapse");
// 					} else {
// 						$body.slideUp(200);
// 						$header.removeClass("is-open");
// 						$text.text("Expand");
// 						$("#" + tsId).val("");
// 						run_table_search(safeId, "");
// 						deselect_all(safeId);
// 					}
// 				});
// 			}

// 			/* Download button — use closure to capture safeId & userData */
// 			(function (sid, email, admin) {
// 				var $dlBtn = $('<button class="btn btn-primary btn-sm dl-btn"><i class="fa fa-download"></i> Download Budget Import Template</button>');
// 				$section.find(".button-container").append($dlBtn);

// 				$dlBtn.on("click", function () {
// 					var anySelected = $(".mis-table[data-safe-id='" + sid + "'] .row-select-cb:checked").length > 0;
// 					if (anySelected) {
// 						/* Rows checked → review modal → run_download with safeId */
// 						show_review_modal(sid, email);
// 					} else {
// 						/* No selection → normal full download */
// 						check_and_download($(this), email, admin);
// 					}
// 				});
// 			})(safeId, userData.email, !needsModal);
// 		});

// 		/* Checkbox: select-all header */
// 		$(document)
// 			.off(".rowSelect")
// 			.on("change.rowSelect", ".select-all-cb", function () {
// 				var sid     = $(this).data("safe-id");
// 				var checked = this.checked;
// 				$(".mis-table[data-safe-id='" + sid + "'] tbody tr:visible").each(function () {
// 					$(this).find(".row-select-cb").prop("checked", checked);
// 					$(this).toggleClass("row-selected", checked);
// 				});
// 				update_selection_bar(sid);
// 			})
// 			.on("change.rowSelect", ".row-select-cb", function () {
// 				var $row   = $(this).closest("tr");
// 				var safeId = $(this).closest(".mis-table").data("safe-id");
// 				$row.toggleClass("row-selected", this.checked);
// 				sync_select_all(safeId);
// 				update_selection_bar(safeId);
// 			});

// 		/* Submit / clear selection bar buttons */
// 		$(document)
// 			.off(".selSubmit")
// 			.on("click.selSubmit", ".sel-submit-btn", function () {
// 				show_review_modal($(this).data("safe-id"), $(this).data("email"));
// 			})
// 			.on("click.selSubmit", ".sel-clear-btn", function () {
// 				deselect_all($(this).data("safe-id"));
// 			});

// 		/* Per-table search */
// 		$(document)
// 			.off(".tblSearch")
// 			.on("input.tblSearch", ".tbl-search-input", function () {
// 				run_table_search($(this).data("safe-id"), this.value);
// 			})
// 			.on("click.tblSearch", ".tbl-search-clear", function () {
// 				var sid = $(this).data("safe-id");
// 				$("#tbl-search-" + sid).val("");
// 				run_table_search(sid, "");
// 			});

// 		/* Admin user search */
// 		if (isCollapsible) {
// 			$(document)
// 				.off(".adminUserSearch")
// 				.on("input.adminUserSearch", "#admin-user-search", function () {
// 					run_user_search(this.value);
// 				})
// 				.on("click.adminUserSearch", "#admin-user-search-clear", function () {
// 					$("#admin-user-search").val("");
// 					run_user_search("");
// 				});
// 			$("#admin-user-search-clear").hide();
// 		}
// 	}

// 	/* ============================================================
// 	   INIT
// 	============================================================ */
// 	$container.html('<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading Data...</div>');

// 	frappe.call({
// 		method  : "annual_budget.api.filter_options.get_user_mappings",
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) {
// 				$container.html('<div class="empty-state">No Data Found</div>');
// 				return;
// 			}
// 			render_content($container, r.message);
// 		}
// 	});

// }; /* end on_page_load */

// frappe.pages["import-template"].on_page_load = function (wrapper) {

// 	frappe.ui.make_app_page({
// 		parent       : wrapper,
// 		title        : "Budget Import Template",
// 		single_column: true
// 	});

// 	var $container = $(wrapper).find(".layout-main-section");
// 	$container.addClass("budget-import-wrapper");

// 	/* ============================================================
// 	   STYLES  — one rule per string, no multiline concatenation
// 	============================================================ */
// 	if (!document.getElementById("allocation-style")) {
// 		var style  = document.createElement("style");
// 		style.id   = "allocation-style";
// 		var rules  = [
// 			".budget-import-wrapper{padding:25px;background:var(--color-background-primary);min-height:100vh;}",
// 			".loading-state,.empty-state{text-align:center;padding:50px;font-weight:600;color:#0076B6;}",

// 			/* user section */
// 			".user-section{margin-bottom:48px;}",

// 			/* profile card */
// 			".profile-card{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:var(--color-background-primary);border:2px solid #0076B6;border-radius:10px;margin-bottom:0;}",
// 			".profile-collapsible{border-radius:10px;}",
// 			".profile-collapsible.is-open{border-radius:10px 10px 0 0;border-bottom-color:transparent;}",
// 			".profile-left{display:flex;align-items:center;gap:14px;}",
// 			".profile-right{display:flex;align-items:center;gap:10px;}",
// 			".uhi-avatar{width:40px;height:40px;border-radius:50%;background:#0076B6;color:#fff;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
// 			".uhi-info{display:flex;flex-direction:column;gap:3px;}",
// 			".user-name{font-size:15px;font-weight:700;color:var(--color-text-primary);}",
// 			".user-email{font-size:12px;color:var(--color-text-secondary);}",

// 			/* expand toggle */
// 			".expand-toggle-wrap{display:flex;align-items:center;gap:10px;}",
// 			".expand-toggle-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;}",
// 			".expand-toggle-cb{width:15px;height:15px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
// 			".expand-toggle-btn{font-size:12px;font-weight:700;color:#0076B6;white-space:nowrap;}",
// 			".expand-row-count{font-size:11px;font-weight:600;color:#fff;background:#0076B6;padding:2px 9px;border-radius:99px;white-space:nowrap;}",

// 			/* tip banner */
// 			".dl-tip-banner{display:flex;align-items:center;gap:10px;padding:10px 16px;background:#EBF4FF;border:1px solid #B8D9F5;border-top:none;border-radius:0 0 10px 10px;margin-bottom:20px;}",
// 			".dl-tip-icon-wrap{width:22px;height:22px;border-radius:50%;background:#0076B6;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
// 			".dl-tip-icon-wrap i{font-size:11px;color:#fff;}",
// 			".dl-tip-text{font-size:12px;color:#1a4f72;line-height:1.6;flex:1;}",
// 			".dl-tip-text strong{color:#003B63;font-weight:600;}",
// 			".dl-tip-em{font-weight:600;color:#0076B6;}",
// 			".dl-tip-close{font-size:18px;color:#7a9ab0;cursor:pointer;line-height:1;flex-shrink:0;padding:0 2px;}",
// 			".dl-tip-close:hover{color:#003B63;}",

// 			/* table card — wraps ONLY the action bar + divider + table */
// 			".tbl-card{background:var(--color-background-primary);border:1px solid var(--color-border-secondary);border-radius:10px;overflow:hidden;margin-top:4px;}",
// 			".tbl-card-divider{height:1px;background:var(--color-border-tertiary);}",

// 			/* action bar */
// 			".tbl-action-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:12px 16px;background:var(--color-background-secondary);border-radius:10px 10px 0 0;}",
// 			".tbl-bar-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1;}",
// 			".tbl-bar-right{display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap;}",

// 			/* search */
// 			".tbl-search-inner{position:relative;display:flex;align-items:center;width:300px;max-width:100%;}",
// 			".tbl-search-icon{position:absolute;left:10px;color:var(--color-text-secondary);font-size:13px;pointer-events:none;}",
// 			".tbl-search-input{width:100%;padding:7px 28px 7px 30px;border:1px solid var(--color-border-secondary);border-radius:6px;font-size:13px;color:var(--color-text-primary);outline:none;background:var(--color-background-primary);transition:border-color 0.2s,box-shadow 0.2s;}",
// 			".tbl-search-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.08);}",
// 			".tbl-search-clear{position:absolute;right:9px;font-size:16px;color:var(--color-text-secondary);cursor:pointer;}",
// 			".tbl-search-clear:hover{color:#c0392b;}",
// 			".tbl-search-count{font-size:11px;color:#0076B6;font-weight:600;white-space:nowrap;}",

// 			/* bulk select */
// 			".tbl-bulk-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;padding:5px 10px;border:1px solid var(--color-border-secondary);border-radius:6px;background:var(--color-background-primary);transition:border-color 0.15s;}",
// 			".tbl-bulk-label:hover{border-color:#0076B6;}",
// 			".tbl-bulk-label input{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
// 			".tbl-bulk-text{font-size:12px;font-weight:600;color:var(--color-text-secondary);white-space:nowrap;}",

// 			/* selection badge */
// 			".tbl-sel-badge{font-size:12px;font-weight:600;color:#0076B6;background:#EBF4FF;border:1px solid #B8D9F5;padding:3px 10px;border-radius:99px;white-space:nowrap;}",

// 			/* deselect button */
// 			".tbl-desel-btn{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;border:1px solid var(--color-border-secondary);background:var(--color-background-primary);font-size:12px;font-weight:600;color:var(--color-text-secondary);cursor:pointer;transition:all 0.15s;white-space:nowrap;}",
// 			".tbl-desel-btn:hover{border-color:#c0392b;color:#c0392b;}",

// 			/* download button */
// 			".dl-btn-main{display:flex;align-items:center;gap:10px;padding:7px 14px;border-radius:6px;cursor:pointer;border:1.5px solid #0076B6;background:#0076B6;transition:all 0.15s ease;white-space:nowrap;}",
// 			".dl-btn-main:hover{background:#005a8e;border-color:#005a8e;}",
// 			".dl-btn-main:disabled{opacity:0.55;cursor:not-allowed;}",
// 			".dl-btn-icon{font-size:15px;color:#fff;flex-shrink:0;}",
// 			".dl-btn-body{display:flex;flex-direction:column;align-items:flex-start;gap:1px;}",
// 			".dl-btn-label{font-size:13px;font-weight:600;color:#fff;line-height:1.2;}",
// 			".dl-btn-count{font-size:11px;color:rgba(255,255,255,0.8);line-height:1.3;}",
// 			".dl-cnt-sel{color:#fff;font-weight:700;}",
// 			".dl-btn-main-sel{border-color:#1a8a4a;background:#1a8a4a;}",
// 			".dl-btn-main-sel:hover{background:#145e32;border-color:#145e32;}",

// 			/* table — inside tbl-card */
// 			".table-wrapper{overflow-x:auto;}",
// 			".mis-table{width:100%;border-collapse:collapse;font-size:13px;}",
// 			".mis-table thead tr{border-bottom:2px solid #0076B6;}",
// 			".mis-table th{background:#F8FAFB;color:#003B63;font-weight:600;padding:10px 12px;text-align:left;white-space:nowrap;font-size:12px;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #0076B6;}",
// 			".mis-table th.cb-cell{text-align:center;}",
// 			".mis-table td{padding:10px 12px;border-bottom:1px solid var(--color-border-tertiary);text-align:left;color:var(--color-text-primary);font-size:13px;}",
// 			".mis-table td.cb-cell{text-align:center;}",
// 			".mis-table tbody tr:last-child td{border-bottom:none;}",
// 			".mis-table tbody tr:hover td{background:#F8FAFB;}",
// 			".mis-table tbody tr.row-selected td{background:#EBF4FF !important;}",
// 			".mis-table tbody tr.row-selected td{border-bottom-color:#D0E8F5 !important;}",

// 			/* important note */
// 			".note-warning{background:#fff8e1;border-left:5px solid #f4b400;padding:16px;border-radius:6px;margin-bottom:20px;}",
// 			".note-header{font-size:14px;color:#5c4b00;margin-bottom:15px;line-height:1.7;}",
// 			".note-badge{background:#f4b400;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;margin-right:8px;}",
// 			".blinking-badge{animation:softBlink 1.5s ease-in-out infinite;}",
// 			"@keyframes softBlink{0%,100%{opacity:1;}50%{opacity:0.5;}}",

// 			/* contact cards */
// 			".contact-wrapper{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;}",
// 			".contact-card{background:var(--color-background-primary);border:1px solid var(--color-border-tertiary);border-radius:8px;padding:12px 15px;min-width:220px;}",
// 			".contact-name{font-weight:600;color:var(--color-text-primary);margin-bottom:4px;font-size:13px;}",
// 			".contact-detail{font-size:12px;color:var(--color-text-secondary);line-height:1.6;}",

// 			/* action bar */
// 			".tbl-action-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:10px 14px;border:1.5px solid var(--color-border-secondary);border-bottom:none;border-radius:8px 8px 0 0;background:var(--color-background-secondary);}",
// 			".tbl-bar-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1;}",
// 			".tbl-bar-right{display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap;}",

// 			/* search */
// 			".tbl-search-inner{position:relative;display:flex;align-items:center;width:320px;max-width:100%;}",
// 			".tbl-search-icon{position:absolute;left:10px;color:#0076B6;font-size:13px;pointer-events:none;}",
// 			".tbl-search-input{width:100%;padding:7px 28px 7px 30px;border:1.5px solid var(--color-border-secondary);border-radius:7px;font-size:13px;color:var(--color-text-primary);outline:none;background:var(--color-background-primary);transition:border-color 0.2s,box-shadow 0.2s;}",
// 			".tbl-search-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.10);}",
// 			".tbl-search-clear{position:absolute;right:9px;font-size:16px;color:var(--color-text-secondary);cursor:pointer;transition:color 0.15s;}",
// 			".tbl-search-clear:hover{color:#c0392b;}",
// 			".tbl-search-count{font-size:11px;color:#0076B6;font-weight:600;white-space:nowrap;}",

// 			/* bulk select pill */
// 			".tbl-bulk-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;padding:5px 10px;border:1.5px solid var(--color-border-secondary);border-radius:6px;background:var(--color-background-primary);transition:border-color 0.15s,background 0.15s;}",
// 			".tbl-bulk-label:hover{border-color:#0076B6;background:#f0f7fd;}",
// 			".tbl-bulk-label input{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
// 			".tbl-bulk-text{font-size:12px;font-weight:600;color:var(--color-text-secondary);white-space:nowrap;}",

// 			/* selection badge */
// 			".tbl-sel-badge{font-size:12px;font-weight:600;color:#fff;background:#0076B6;padding:3px 10px;border-radius:99px;white-space:nowrap;}",

// 			/* deselect button */
// 			".tbl-desel-btn{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;border:1.5px solid var(--color-border-secondary);background:var(--color-background-primary);font-size:12px;font-weight:600;color:var(--color-text-secondary);cursor:pointer;transition:all 0.15s;white-space:nowrap;}",
// 			".tbl-desel-btn:hover{border-color:#c0392b;color:#c0392b;}",

// 			/* download button */
// 			".dl-btn-main{display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:7px;cursor:pointer;border:2px solid #0076B6;background:var(--color-background-primary);transition:all 0.15s ease;white-space:nowrap;}",
// 			".dl-btn-main:hover{background:#f0f7fd;box-shadow:0 0 0 3px rgba(0,118,182,0.10);}",
// 			".dl-btn-main:disabled{opacity:0.55;cursor:not-allowed;box-shadow:none;}",
// 			".dl-btn-icon{font-size:16px;color:#0076B6;flex-shrink:0;}",
// 			".dl-btn-body{display:flex;flex-direction:column;align-items:flex-start;gap:1px;}",
// 			".dl-btn-label{font-size:13px;font-weight:700;color:#003B63;line-height:1.2;}",
// 			".dl-btn-count{font-size:11px;color:var(--color-text-secondary);line-height:1.3;}",
// 			".dl-cnt-sel{color:#1a7a42;font-weight:700;}",
// 			".dl-btn-main-sel{border-color:#1a8a4a;background:#f0faf5;}",
// 			".dl-btn-main-sel:hover{background:#e4f5eb;box-shadow:0 0 0 3px rgba(26,138,74,0.12);}",
// 			".dl-btn-main-sel .dl-btn-icon{color:#1a8a4a;}",
// 			".dl-btn-main-sel .dl-btn-label{color:#145e32;}",

// 			/* checkbox column */
// 			".cb-cell{width:36px;min-width:36px;text-align:center;padding:6px !important;}",
// 			".row-select-cb,.bulk-all-cb{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;vertical-align:middle;}",

// 			/* selected row */
// 			".mis-table tbody tr.row-selected td{background:#e8f4fd !important;}",

// 			/* table */
// 			".table-title{font-size:14px;font-weight:600;color:#003B63;margin-bottom:0;}",
// 			".table-wrapper{overflow-x:auto;border-radius:0 0 8px 8px;}",
// 			".mis-table{width:100%;border-collapse:collapse;font-size:13px;border:1.5px solid var(--color-border-secondary);}",
// 			".mis-table th{background:#0076B6;color:#fff;font-weight:700;padding:9px 10px;text-align:center;white-space:nowrap;}",
// 			".mis-table td{padding:8px 10px;border:1px solid var(--color-border-tertiary);text-align:center;}",
// 			".mis-table tr:nth-child(even) td{background:#f9f9f9;}",
// 			".mis-table tr:hover td{background:#eef6fb;}",

// 			/* review modal */
// 			"#rev-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:99999;padding:15px;}",
// 			".rev-modal-box{background:var(--color-background-primary);width:700px;max-width:100%;max-height:90vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.25);display:flex;flex-direction:column;overflow:hidden;}",
// 			".rev-modal-header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;border-bottom:1px solid var(--color-border-tertiary);font-weight:700;font-size:16px;color:var(--color-text-primary);flex-shrink:0;}",
// 			".rev-modal-title i{margin-right:8px;color:#0076B6;}",
// 			"#rev-modal-close{cursor:pointer;font-size:22px;color:var(--color-text-secondary);line-height:1;}",
// 			"#rev-modal-close:hover{color:var(--color-text-primary);}",
// 			".rev-modal-body{padding:20px 24px;overflow-y:auto;flex:1;}",
// 			".rev-warning-banner{display:flex;align-items:flex-start;gap:12px;background:#fff8e1;border:1px solid #f4b400;border-left:4px solid #f4b400;border-radius:8px;padding:12px 16px;margin-bottom:16px;}",
// 			".rev-warn-icon{font-size:22px;color:#e67e22;flex-shrink:0;margin-top:2px;}",
// 			".rev-warn-title{font-size:13px;font-weight:700;color:#5c3d00;margin-bottom:4px;}",
// 			".rev-warn-sub{font-size:12px;color:#7a5200;line-height:1.6;}",
// 			".rev-count-badge{display:inline-block;font-size:12px;font-weight:700;color:#fff;background:#0076B6;padding:3px 12px;border-radius:99px;margin-bottom:12px;}",
// 			".rev-table-wrap{overflow-x:auto;margin-bottom:16px;border-radius:8px;border:1px solid var(--color-border-tertiary);}",
// 			".rev-table{width:100%;border-collapse:collapse;font-size:13px;}",
// 			".rev-table thead tr{background:#0076B6;}",
// 			".rev-table th{color:#fff;font-weight:700;padding:9px 10px;text-align:center;white-space:nowrap;}",
// 			".rev-table td{padding:8px 10px;border:1px solid var(--color-border-tertiary);text-align:center;}",
// 			".rev-table tbody tr:nth-child(even) td{background:#f9f9f9;}",
// 			".rev-table tbody tr:hover td{background:#eef6fb;}",
// 			".rev-sl{width:40px;}",
// 			".rev-confirm-wrap{background:var(--color-background-secondary);border:1px solid var(--color-border-tertiary);border-radius:8px;padding:14px 16px;}",
// 			".rev-confirm-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;font-size:13px;color:var(--color-text-primary);}",
// 			".rev-confirm-label input{width:15px;height:15px;margin-top:2px;accent-color:#0076B6;flex-shrink:0;cursor:pointer;}",
// 			".rev-confirm-label i{color:#28a745;margin-right:4px;}",
// 			".rev-modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:14px 24px;border-top:1px solid var(--color-border-tertiary);flex-shrink:0;}",
// 			".rev-modal-footer .btn{min-width:140px;}",
// 			"#rev-btn-proceed:disabled{opacity:0.6;cursor:not-allowed;}",

// 			/* APF modal */
// 			"#apf-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:9999;padding:15px;}",
// 			".apf-modal-box{background:var(--color-background-primary);width:600px;max-width:100%;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.2);padding:30px;}",
// 			".apf-modal-header{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:16px;margin-bottom:20px;}",
// 			".apf-modal-title i{margin-right:8px;color:#0076B6;}",
// 			"#apf-modal-close{cursor:pointer;font-size:22px;color:var(--color-text-secondary);line-height:1;}",
// 			"#apf-modal-close:hover{color:var(--color-text-primary);}",
// 			".apf-modal-body{text-align:center;margin-bottom:20px;}",
// 			".apf-modal-icon{font-size:40px;margin-bottom:12px;}",
// 			".apf-modal-text{font-weight:600;font-size:14px;color:#c0392b;margin-bottom:10px;line-height:1.6;}",
// 			".apf-modal-sub{font-size:13px;color:var(--color-text-secondary);margin-bottom:16px;line-height:1.6;}",
// 			".apf-checkbox-wrapper{background:var(--color-background-secondary);padding:14px;border-radius:8px;border:1px solid var(--color-border-tertiary);font-size:13px;text-align:left;}",
// 			".apf-checkbox-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;}",
// 			".apf-checkbox-label i{color:#28a745;margin-right:4px;}",
// 			".apf-checkbox-label input{margin-top:3px;flex-shrink:0;}",
// 			".apf-modal-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:16px;}",
// 			".apf-modal-footer .btn{min-width:140px;}",
// 			"#apf-modal-proceed:disabled{opacity:0.6;cursor:not-allowed;}",

// 			/* loader */
// 			"#global-loader.loader-overlay{position:fixed;inset:0;width:100vw;height:100vh;background:rgba(18,18,18,0.92);z-index:999999;display:none;align-items:center;justify-content:center;}",
// 			"#global-loader.loader-overlay.active{display:flex;}",
// 			".loader-box{display:flex;flex-direction:column;align-items:center;gap:16px;}",
// 			".loader-ring-wrap{position:relative;width:120px;height:120px;display:flex;align-items:center;justify-content:center;}",
// 			".loader-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);}",
// 			".loader-ring-bg{fill:none;stroke:rgba(255,255,255,0.12);stroke-width:6;}",
// 			".loader-ring-fill{fill:none;stroke:url(#ringGrad);stroke-width:6;stroke-linecap:round;stroke-dasharray:276.46;stroke-dashoffset:276.46;transition:stroke-dashoffset 0.35s ease;}",
// 			".loader-logo{width:78px;height:78px;border-radius:50%;background:#fff;padding:12px;object-fit:contain;position:relative;z-index:1;animation:pulse 1.6s infinite ease-in-out;}",
// 			".loader-pct-inside{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:700;color:#fff;background:rgba(0,118,182,0.85);padding:1px 7px;border-radius:99px;z-index:2;white-space:nowrap;}",
// 			".loader-text{font-size:14px;color:#fff;font-weight:600;letter-spacing:0.5px;text-align:center;opacity:0.85;}",
// 			"@keyframes pulse{0%,100%{transform:scale(1);opacity:0.85;}50%{transform:scale(1.06);opacity:1;}}",
// 			".dl-anim-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;width:60px;}",
// 			".dl-arrow-track{width:24px;height:28px;overflow:hidden;position:relative;}",
// 			".dl-arrow{display:flex;flex-direction:column;align-items:center;position:absolute;left:50%;transform:translateX(-50%);animation:dl-drop 1.2s ease-in-out infinite;}",
// 			".dl-arrow-stem{width:3px;height:14px;background:#0076B6;border-radius:2px;}",
// 			".dl-arrow-head{width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid #0076B6;}",
// 			"@keyframes dl-drop{0%{top:-28px;opacity:0;}30%{opacity:1;}70%{opacity:1;}100%{top:28px;opacity:0;}}",
// 			".dl-bar{width:44px;height:4px;background:#0076B6;border-radius:99px;animation:dl-bar-pulse 1.2s ease-in-out infinite;}",
// 			"@keyframes dl-bar-pulse{0%,100%{opacity:0.4;transform:scaleX(0.8);}50%{opacity:1;transform:scaleX(1);}}",
// 			".dl-dots{display:flex;gap:5px;}",
// 			".dl-dots span{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.6);animation:dl-bounce 1.2s ease-in-out infinite;}",
// 			".dl-dots span:nth-child(1){animation-delay:0s;}",
// 			".dl-dots span:nth-child(2){animation-delay:0.2s;}",
// 			".dl-dots span:nth-child(3){animation-delay:0.4s;}",
// 			"@keyframes dl-bounce{0%,80%,100%{transform:scale(1);opacity:0.5;}40%{transform:scale(1.5);opacity:1;}}",

// 			/* admin global search */
// 			".global-user-search-wrap{margin-bottom:24px;padding:14px 18px;background:var(--color-background-secondary);border:1.5px solid var(--color-border-secondary);border-radius:10px;}",
// 			".gus-label{font-size:11px;font-weight:700;color:#0076B6;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:8px;}",
// 			".gus-label i{margin-right:6px;}",
// 			".gus-inner{position:relative;display:flex;align-items:center;max-width:460px;}",
// 			".gus-icon{position:absolute;left:12px;color:#0076B6;font-size:13px;pointer-events:none;}",
// 			".gus-input{width:100%;padding:8px 32px;border:1.5px solid var(--color-border-secondary);border-radius:8px;font-size:13px;color:var(--color-text-primary);outline:none;background:var(--color-background-primary);transition:border-color 0.2s;}",
// 			".gus-input:focus{border-color:#0076B6;}",
// 			".gus-clear{position:absolute;right:10px;font-size:17px;color:var(--color-text-secondary);cursor:pointer;}",
// 			".gus-clear:hover{color:#c0392b;}",
// 			".gus-count{margin-top:6px;font-size:12px;color:#0076B6;font-weight:600;}",

// 			/* responsive */
// 			"@media(max-width:768px){.budget-import-wrapper{padding:16px;}.profile-card{flex-direction:column;align-items:flex-start;gap:10px;}.profile-right{width:100%;justify-content:flex-end;}.dl-btn-main{width:100%;}.tbl-action-bar{flex-direction:column;align-items:flex-start;}.tbl-bar-right{width:100%;justify-content:flex-end;}}",
// 			"@media(max-width:576px){.budget-import-wrapper{padding:10px;}.tbl-search-inner{width:100%;}.mis-table{font-size:11px;min-width:520px;}.rev-modal-footer{flex-direction:column;}.rev-modal-footer .btn{width:100%;min-width:unset;}.apf-modal-footer{flex-direction:column;}.apf-modal-footer .btn{width:100%;min-width:unset;}}"
// 		];
// 		style.textContent = rules.join("");
// 		document.head.appendChild(style);
// 	}

// 	/* ============================================================
// 	   LOADER
// 	============================================================ */
// 	function init_loader() {
// 		if ($("#global-loader").length) return;
// 		$("body").append(
// 			'<div id="global-loader" class="loader-overlay">' +
// 			'<div class="loader-box">' +
// 			'<div class="loader-ring-wrap">' +
// 			'<svg class="loader-ring" viewBox="0 0 100 100">' +
// 			'<defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
// 			'<stop offset="0%" stop-color="#0076B6"/><stop offset="100%" stop-color="#00c6ff"/>' +
// 			'</linearGradient></defs>' +
// 			'<circle class="loader-ring-bg" cx="50" cy="50" r="44"/>' +
// 			'<circle class="loader-ring-fill" id="loader-ring-fill" cx="50" cy="50" r="44"/>' +
// 			'</svg>' +
// 			'<img src="/files/APF logo.png" class="loader-logo" alt="Loading">' +
// 			'<div class="loader-pct-inside" id="loader-pct">0%</div>' +
// 			'</div>' +
// 			'<div class="dl-anim-wrap">' +
// 			'<div class="dl-arrow-track"><div class="dl-arrow"><div class="dl-arrow-stem"></div><div class="dl-arrow-head"></div></div></div>' +
// 			'<div class="dl-bar"></div>' +
// 			'<div class="dl-dots"><span></span><span></span><span></span></div>' +
// 			'</div>' +
// 			'<div class="loader-text" id="loader-text-msg">Preparing download...</div>' +
// 			'</div></div>'
// 		);
// 	}

// 	function set_progress(pct) {
// 		var offset = 276.46 - (pct / 100) * 276.46;
// 		$("#loader-ring-fill").css("stroke-dashoffset", offset);
// 		$("#loader-pct").text(Math.round(pct) + "%");
// 	}

// 	var Loader = {
// 		show: function (msg) {
// 			init_loader();
// 			$("#loader-text-msg").text(msg || "Preparing download...");
// 			set_progress(0);
// 			$("#global-loader").addClass("active");
// 		},
// 		setText: function (msg) { $("#loader-text-msg").text(msg); },
// 		setProgress: function (pct) { set_progress(pct); },
// 		hide: function () { $("#global-loader").removeClass("active"); }
// 	};

// 	/* ============================================================
// 	   APF MODAL
// 	============================================================ */
// 	function init_apf_modal() {
// 		if ($("#apf-modal-overlay").length) return;
// 		$("body").append(
// 			'<div id="apf-modal-overlay">' +
// 			'<div class="apf-modal-box">' +
// 			'<div class="apf-modal-header">' +
// 			'<div class="apf-modal-title" id="apf-modal-title"></div>' +
// 			'<span id="apf-modal-close" title="Close">&times;</span>' +
// 			'</div>' +
// 			'<div class="apf-modal-body">' +
// 			'<div class="apf-modal-icon" id="apf-modal-icon"><i id="apf-modal-icon-i" class="fa"></i></div>' +
// 			'<div class="apf-modal-text" id="apf-modal-text"></div>' +
// 			'<div class="apf-modal-sub" id="apf-modal-sub"></div>' +
// 			'<div class="apf-checkbox-wrapper" id="apf-checkbox-wrap" style="display:none;">' +
// 			'<label class="apf-checkbox-label">' +
// 			'<input type="checkbox" id="apf-modal-checkbox">' +
// 			'<span><i class="fa fa-check-circle"></i> I confirm that I have verified all details carefully.</span>' +
// 			'</label></div></div>' +
// 			'<div class="apf-modal-footer" id="apf-modal-footer"></div>' +
// 			'</div></div>'
// 		);
// 		$(document)
// 			.off(".apfModal")
// 			.on("click.apfModal", "#apf-modal-close", hide_apf_modal)
// 			.on("click.apfModal", "#apf-modal-overlay", function (e) {
// 				if ($(e.target).is("#apf-modal-overlay")) hide_apf_modal();
// 			})
// 			.on("change.apfModal", "#apf-modal-checkbox", function () {
// 				$("#apf-modal-proceed").prop("disabled", !this.checked);
// 			});
// 	}

// 	function hide_apf_modal() {
// 		$("#apf-modal-overlay").hide();
// 		$("#apf-modal-checkbox").prop("checked", false);
// 		$("#apf-modal-proceed").prop("disabled", true);
// 	}

// 	function show_apf_modal(opts) {
// 		init_apf_modal();
// 		$("#apf-modal-title").html(opts.title || "");
// 		$("#apf-modal-icon-i")
// 			.attr("class", "fa " + (opts.icon || "fa-exclamation-triangle"))
// 			.closest(".apf-modal-icon").css("color", opts.iconColor || "#e74c3c");
// 		$("#apf-modal-text").html(opts.text || "");
// 		$("#apf-modal-sub").html(opts.sub || "");
// 		var showCb = !!opts.showCheckbox;
// 		$("#apf-checkbox-wrap").toggle(showCb);
// 		if (showCb) $("#apf-modal-checkbox").prop("checked", false);
// 		var $footer = $("#apf-modal-footer").empty();
// 		(opts.buttons || []).forEach(function (btn) {
// 			var $b = $('<button id="' + (btn.id || "") + '" class="btn ' + (btn.cls || "btn-default") + ' btn-sm">' + btn.label + '</button>').prop("disabled", !!btn.disabled);
// 			$b.on("click", function () { if (btn.onClick) btn.onClick(); });
// 			$footer.append($b);
// 		});
// 		$("#apf-modal-overlay").css("display", "flex");
// 	}

// 	/* ============================================================
// 	   REVIEW MODAL
// 	============================================================ */
// 	function init_review_modal() {
// 		if ($("#rev-modal-overlay").length) return;
// 		$("body").append(
// 			'<div id="rev-modal-overlay">' +
// 			'<div class="rev-modal-box">' +
// 			'<div class="rev-modal-header">' +
// 			'<div class="rev-modal-title"><i class="fa fa-list-alt"></i> Review Selected Items</div>' +
// 			'<span id="rev-modal-close" title="Close">&times;</span>' +
// 			'</div>' +
// 			'<div class="rev-modal-body">' +
// 			'<div class="rev-warning-banner">' +
// 			'<i class="fa fa-exclamation-triangle rev-warn-icon"></i>' +
// 			'<div><div class="rev-warn-title">Please make a note of the items listed below.</div>' +
// 			'<div class="rev-warn-sub">Keep a record of the selected Cost Centers and Location Codes to avoid duplicates when importing.</div></div>' +
// 			'</div>' +
// 			'<div class="rev-count-badge" id="rev-count-badge"></div>' +
// 			'<div class="rev-table-wrap">' +
// 			'<table class="rev-table">' +
// 			'<thead><tr><th class="rev-sl">#</th><th>Unit</th><th>Unit Description</th><th>Cost Center</th><th>Cost Center Description</th><th>Location Code</th><th>Location Description</th></tr></thead>' +
// 			'<tbody id="rev-table-body"></tbody>' +
// 			'</table></div>' +
// 			'<div class="rev-confirm-wrap">' +
// 			'<label class="rev-confirm-label">' +
// 			'<input type="checkbox" id="rev-confirm-cb">' +
// 			'<span><i class="fa fa-check-circle"></i> I have noted down the selected items and I am ready to proceed.</span>' +
// 			'</label></div></div>' +
// 			'<div class="rev-modal-footer">' +
// 			'<button id="rev-btn-cancel" class="btn btn-default btn-sm"><i class="fa fa-times"></i> Cancel</button>' +
// 			'<button id="rev-btn-proceed" class="btn btn-success btn-sm" disabled><i class="fa fa-download"></i> Proceed to Download</button>' +
// 			'</div></div></div>'
// 		);
// 		$(document)
// 			.off(".revModal")
// 			.on("click.revModal", "#rev-modal-close, #rev-btn-cancel", hide_review_modal)
// 			.on("click.revModal", "#rev-modal-overlay", function (e) {
// 				if ($(e.target).is("#rev-modal-overlay")) hide_review_modal();
// 			})
// 			.on("change.revModal", "#rev-confirm-cb", function () {
// 				$("#rev-btn-proceed").prop("disabled", !this.checked);
// 			})
// 			.on("click.revModal", "#rev-btn-proceed", function () {
// 				var $overlay = $("#rev-modal-overlay");
// 				var sid      = $overlay.data("safe-id");
// 				var email    = $overlay.data("user-email");
// 				var $section = $(".user-section").filter(function () {
// 					return $(this).data("email") === (email || "").toLowerCase();
// 				});
// 				hide_review_modal();
// 				run_download($section.find(".dl-btn-main"), email, sid);
// 			});
// 	}

// 	function hide_review_modal() {
// 		$("#rev-modal-overlay").hide();
// 		$("#rev-confirm-cb").prop("checked", false);
// 		$("#rev-btn-proceed").prop("disabled", true);
// 	}

// 	function show_review_modal(safeId, userEmail) {
// 		var selected = get_selected_rows(safeId);
// 		if (!selected.length) {
// 			frappe.msgprint({ title: "Nothing Selected", message: "Please select at least one row.", indicator: "orange" });
// 			return;
// 		}
// 		init_review_modal();
// 		var rows = selected.map(function (r, i) {
// 			return '<tr><td class="rev-sl">' + (i + 1) + '</td>' +
// 				'<td>' + esc(r.unit) + '</td>' +
// 				'<td>' + esc(r.unit_description) + '</td>' +
// 				'<td>' + esc(r.cost_center) + '</td>' +
// 				'<td>' + esc(r.cost_center_description) + '</td>' +
// 				'<td>' + esc(r.location_code) + '</td>' +
// 				'<td>' + esc(r.location_description) + '</td></tr>';
// 		}).join("");
// 		$("#rev-table-body").html(rows);
// 		$("#rev-count-badge").text(selected.length + " item" + (selected.length !== 1 ? "s" : "") + " selected");
// 		$("#rev-confirm-cb").prop("checked", false);
// 		$("#rev-btn-proceed").prop("disabled", true);
// 		$("#rev-modal-overlay").data("safe-id", safeId).data("user-email", userEmail).css("display", "flex");
// 	}

// 	/* ============================================================
// 	   HELPERS
// 	============================================================ */
// 	function esc(str) {
// 		return $("<div>").text(str || "").html();
// 	}

// 	function reset_btn($btn, loading, loadingText) {
// 		$btn.prop("disabled", loading);
// 		if (loading) {
// 			$btn.find(".dl-btn-icon").attr("class", "fa fa-spinner fa-spin dl-btn-icon");
// 			$btn.find(".dl-btn-label").text(loadingText || "Loading...");
// 			$btn.find(".dl-btn-count").text("");
// 		} else {
// 			$btn.find(".dl-btn-icon").attr("class", "fa fa-download dl-btn-icon");
// 			/* label/count corrected by update_dl_btn_state */
// 		}
// 	}

// 	function get_selected_rows(safeId) {
// 		var selected = [];
// 		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").each(function () {
// 			var $row = $(this);
// 			if (!$row.find(".row-select-cb").is(":checked")) return;
// 			selected.push({
// 				unit                   : $row.data("unit")                    || "",
// 				unit_description       : $row.data("unit-description")        || "",
// 				cost_center            : $row.data("cost-center")             || "",
// 				cost_center_description: $row.data("cost-center-description") || "",
// 				location_code          : $row.data("location-code")           || "",
// 				location_description   : $row.data("location-description")    || ""
// 			});
// 		});
// 		return selected;
// 	}

// 	function sync_bulk_cb(safeId) {
// 		var $all     = $(".mis-table[data-safe-id='" + safeId + "'] tbody tr:visible .row-select-cb");
// 		var $checked = $all.filter(":checked");
// 		var $cbs     = $(".bulk-all-cb[data-safe-id='" + safeId + "']");
// 		var $txt     = $("#bulk-text-" + safeId);
// 		if ($all.length === 0 || $checked.length === 0) {
// 			$cbs.prop("checked", false).prop("indeterminate", false);
// 			$txt.text("Select all");
// 		} else if ($checked.length === $all.length) {
// 			$cbs.prop("checked", true).prop("indeterminate", false);
// 			$txt.text("Deselect all");
// 		} else {
// 			$cbs.prop("checked", false).prop("indeterminate", true);
// 			$txt.text($checked.length + " selected");
// 		}
// 	}

// 	function update_toolbar_actions(safeId) {
// 		var count  = $(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb:checked").length;
// 		var $badge = $("#tbl-sel-badge-" + safeId);
// 		var $desel = $(".tbl-desel-btn[data-safe-id='" + safeId + "']");
// 		if (count > 0) {
// 			$badge.text(count + " row" + (count !== 1 ? "s" : "") + " selected").show();
// 			$desel.show();
// 		} else {
// 			$badge.hide();
// 			$desel.hide();
// 		}
// 	}

// 	function update_dl_btn_state(safeId) {
// 		var count = $(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb:checked").length;
// 		var total = $(".mis-table[data-safe-id='" + safeId + "'] tbody tr").length;
// 		var $lbl  = $("#dl-lbl-" + safeId);
// 		var $cnt  = $("#dl-cnt-" + safeId);
// 		var $btn  = $lbl.closest(".dl-btn-main");
// 		if (count > 0) {
// 			$btn.addClass("dl-btn-main-sel");
// 			$lbl.text("Download selected");
// 			$cnt.html('<span class="dl-cnt-sel">' + count + " of " + total + " rows selected</span>");
// 		} else {
// 			$btn.removeClass("dl-btn-main-sel");
// 			$lbl.text("Download all");
// 			$cnt.text(total + " rows \u00b7 full template");
// 		}
// 	}

// 	function deselect_all(safeId) {
// 		$(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb").prop("checked", false);
// 		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").removeClass("row-selected");
// 		$(".bulk-all-cb[data-safe-id='" + safeId + "']").prop("checked", false).prop("indeterminate", false);
// 		$("#bulk-text-" + safeId).text("Select all");
// 		update_dl_btn_state(safeId);
// 		update_toolbar_actions(safeId);
// 	}

// 	function run_table_search(safeId, query) {
// 		var q       = (query || "").trim().toLowerCase();
// 		var $table  = $(".mis-table[data-safe-id='" + safeId + "']");
// 		var visible = 0;
// 		$table.find("tbody tr").each(function () {
// 			var match = !q || this.textContent.toLowerCase().indexOf(q) !== -1;
// 			$(this).toggle(match);
// 			if (match) visible++;
// 		});
// 		sync_bulk_cb(safeId);
// 		var $count = $("#tbl-count-" + safeId);
// 		if (q) { $count.text(visible + " row" + (visible !== 1 ? "s" : "") + " matched").show(); }
// 		else   { $count.hide(); }
// 		$("#tbl-clear-" + safeId).toggle(q.length > 0);
// 	}

// 	function run_user_search(query) {
// 		var q = query.trim().toLowerCase();
// 		var total = 0;
// 		$(".user-section").each(function () {
// 			var $sec  = $(this);
// 			var match = !q || ($sec.data("name") || "").indexOf(q) !== -1 || ($sec.data("email") || "").indexOf(q) !== -1;
// 			$sec.toggle(match);
// 			if (match) total++;
// 		});
// 		var $c = $("#admin-user-search-count");
// 		if (q) { $c.text(total + " user" + (total !== 1 ? "s" : "") + " found").show(); }
// 		else   { $c.hide(); }
// 		$("#admin-user-search-clear").toggle(q.length > 0);
// 	}

// 	function build_note_html() {
// 		var contacts = [
// 			["Rakesh Ahuja",        "rakesh.ahuja@azimpremjifoundation.org",      "+91 7022068106"],
// 			["Saravana G",          "saravana.g@azimpremjifoundation.org",        "+91 9380861952"],
// 			["Augustin Moses R",    "augustin.moses@azimpremjifoundation.org",    "+91 8667719594"],
// 			["Mercy Selvanayagi R", "mercy.selvanayagi@azimpremjifoundation.org", "+91 9047828687"],
// 			["Mahaveer Ram P",      "mahaveer.p@azimpremjifoundation.org",        "+91 8825879412"]
// 		];
// 		var cards = contacts.map(function (c) {
// 			return '<div class="contact-card"><div class="contact-name">' + c[0] + '</div>' +
// 				'<div class="contact-detail">' + c[1] + '</div>' +
// 				'<div class="contact-detail">' + c[2] + '</div></div>';
// 		}).join("");
// 		return '<div class="note-warning"><div class="note-header">' +
// 			'<span class="note-badge blinking-badge">IMPORTANT</span>' +
// 			'Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below. ' +
// 			'If you notice any discrepancies, contact the support team immediately.' +
// 			'</div><div class="contact-wrapper">' + cards + '</div></div>';
// 	}

// 	function build_table_html(rows, safeId) {
// 		var COLS = [
// 			["unit",                    "Unit"                    ],
// 			["unit_description",        "Unit Description"        ],
// 			["cost_center",             "Cost Center"             ],
// 			["cost_center_description", "Cost Center Description" ],
// 			["location_code",           "Location Code"           ],
// 			["location_description",    "Location Description"    ]
// 		];
// 		var headers = COLS.map(function (c) { return "<th>" + c[1] + "</th>"; }).join("");
// 		var bodyRows = rows.map(function (row, i) {
// 			var da =
// 				'data-unit="'                    + esc(row.unit || "")                    + '" ' +
// 				'data-unit-description="'        + esc(row.unit_description || "")        + '" ' +
// 				'data-cost-center="'             + esc(row.cost_center || "")             + '" ' +
// 				'data-cost-center-description="' + esc(row.cost_center_description || "") + '" ' +
// 				'data-location-code="'           + esc(row.location_code || "")           + '" ' +
// 				'data-location-description="'    + esc(row.location_description || "")    + '"';
// 			var cells = COLS.map(function (c) { return "<td>" + esc(row[c[0]] || "") + "</td>"; }).join("");
// 			return '<tr ' + da + '><td class="cb-cell"><input type="checkbox" class="row-select-cb"></td><td>' + (i + 1) + '</td>' + cells + '</tr>';
// 		}).join("");
// 		return '<div class="table-wrapper">' +
// 			'<table class="mis-table" data-safe-id="' + safeId + '">' +
// 			'<thead><tr><th class="cb-cell"><input type="checkbox" class="bulk-all-cb" data-safe-id="' + safeId + '"></th><th>Sl. No.</th>' + headers + '</tr></thead>' +
// 			'<tbody>' + bodyRows + '</tbody>' +
// 			'</table></div>';
// 	}

// 	/* ============================================================
// 	   DOWNLOAD
// 	============================================================ */
// 	function run_download($btn, userEmail, safeId) {
// 		var selected      = (safeId && safeId !== "null") ? get_selected_rows(safeId) : [];
// 		var entityDataArg = selected.length ? JSON.stringify(selected) : null;

// 		reset_btn($btn, true, "Downloading...");
// 		Loader.show("Generating your template...");

// 		var pct = 0;
// 		var timer = setInterval(function () {
// 			pct = Math.min(pct + (pct < 40 ? 3 : pct < 70 ? 1.5 : 0.4), 84);
// 			Loader.setProgress(pct);
// 		}, 300);

// 		function on_done(success) {
// 			clearInterval(timer);
// 			if (success) {
// 				Loader.setProgress(100);
// 				Loader.setText("Download ready!");
// 				setTimeout(function () {
// 					Loader.hide();
// 					reset_btn($btn, false);
// 					if (safeId) deselect_all(safeId);
// 				}, 800);
// 			} else {
// 				Loader.hide();
// 				reset_btn($btn, false);
// 			}
// 		}

// 		frappe.call({
// 			method: "annual_budget.api.export_reports.start_budget_template_generation",
// 			args  : { user: userEmail, entity_data: entityDataArg },
// 			callback: function () {
// 				clearInterval(timer);
// 				Loader.setText("Fetching your template...");
// 				pct   = 30;
// 				timer = setInterval(function () { pct = Math.min(pct + 0.3, 84); Loader.setProgress(pct); }, 400);

// 				var polling = false;
// 				var stopped = false;

// 				var pollTimer = setInterval(function () {
// 					if (polling || stopped) return;
// 					polling = true;
// 					fetch(
// 						"/api/method/annual_budget.api.export_reports.download_generated_template?user=" + encodeURIComponent(userEmail),
// 						{ headers: { "X-Frappe-CSRF-Token": frappe.csrf_token } }
// 					)
// 					.then(function (resp) {
// 						if (!resp.ok) { polling = false; throw new Error("Server returned " + resp.status); }
// 						var ct = resp.headers.get("content-type") || "";
// 						if (ct.indexOf("application/json") !== -1) {
// 							return resp.json().then(function () { polling = false; Loader.setText("Still generating, please wait..."); });
// 						}
// 						stopped = true;
// 						clearInterval(pollTimer);
// 						clearInterval(timer);
// 						Loader.setProgress(95);
// 						Loader.setText("Preparing file...");
// 						var disp     = resp.headers.get("Content-Disposition") || "";
// 						var match    = disp.match(/filename[^;=\n]*=["']?([^"';\n]+)/);
// 						var filename = match ? decodeURIComponent(match[1].trim()) : "Budget_Import_Template.xlsx";
// 						return resp.blob().then(function (blob) {
// 							var url = URL.createObjectURL(blob);
// 							var a   = document.createElement("a");
// 							a.href = url; a.download = filename;
// 							document.body.appendChild(a); a.click(); a.remove();
// 							setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
// 							on_done(true);
// 						});
// 					})
// 					.catch(function (err) {
// 						if (stopped) return;
// 						stopped = true;
// 						clearInterval(pollTimer); clearInterval(timer);
// 						on_done(false);
// 						frappe.msgprint({ title: "Download Failed", message: "Could not download the template.<br><small>" + err.message + "</small>", indicator: "red" });
// 					});
// 				}, 3000);
// 			},
// 			error: function () {
// 				clearInterval(timer); on_done(false);
// 				frappe.msgprint({ title: "Error", message: "Could not start template generation. Please try again.", indicator: "red" });
// 			}
// 		});
// 	}

// 	function check_and_download($btn, userEmail, isAdmin) {
// 		reset_btn($btn, true, "Checking...");
// 		frappe.call({
// 			method : "frappe.client.get_value",
// 			args   : { doctype: "Finance user access", filters: { user: userEmail }, fieldname: "import_template_id" },
// 			callback: function (r) {
// 				var tid = r.message && r.message.import_template_id;
// 				if (!tid) {
// 					reset_btn($btn, false);
// 					show_apf_modal({
// 						title    : '<i class="fa fa-exclamation-triangle"></i> ' + (isAdmin ? "Template Not Configured" : "Import Template Missing"),
// 						icon     : "fa-exclamation-triangle",
// 						iconColor: isAdmin ? "#e67e22" : "#e74c3c",
// 						text     : isAdmin ? "No Import Template is linked for this user account." : "Import Template is not configured for this account.",
// 						sub      : isAdmin
// 							? "The <b>import_template_id</b> field in <b>Finance User Access</b> is empty for <b>" + esc(userEmail) + "</b>. Please assign a valid Import Template before retrying."
// 							: "Please contact your administrator to link an <b>Import Template</b> in <b>Finance User Access</b> before downloading.",
// 						buttons  : [{ label: '<i class="fa fa-times"></i> Close', cls: "btn-default", onClick: hide_apf_modal }]
// 					});
// 					return;
// 				}
// 				if (isAdmin) {
// 					run_download($btn, userEmail, null);
// 				} else {
// 					reset_btn($btn, false);
// 					show_apf_modal({
// 						title       : '<i class="fa fa-download"></i> Confirm Download',
// 						icon        : "fa-exclamation-triangle",
// 						iconColor   : "#e74c3c",
// 						text        : "Please carefully review and validate all allocated Units, Cost Centers, and Location Codes before downloading.",
// 						sub         : "Do not proceed unless everything has been reviewed and confirmed.",
// 						showCheckbox: true,
// 						buttons     : [
// 							{ label: '<i class="fa fa-times"></i> Cancel', cls: "btn-default", onClick: hide_apf_modal },
// 							{ id: "apf-modal-proceed", label: '<i class="fa fa-download"></i> Proceed to Download', cls: "btn-primary", disabled: true,
// 							  onClick: function () { hide_apf_modal(); run_download($btn, userEmail, null); } }
// 						]
// 					});
// 				}
// 			},
// 			error: function () {
// 				reset_btn($btn, false);
// 				frappe.msgprint({ title: "Check Failed", message: "Could not verify the Import Template. Please try again.", indicator: "red" });
// 			}
// 		});
// 	}

// 	/* ============================================================
// 	   RENDER CONTENT
// 	============================================================ */
// 	function render_content(container, data) {
// 		var roles                = Array.isArray(frappe.user_roles) ? frappe.user_roles : [];
// 		var isFinanceCoordinator = roles.indexOf("Finance Unit Coordinator") !== -1;
// 		var isSystemManager      = roles.indexOf("System Manager") !== -1;
// 		var isFinanceAdmin       = roles.indexOf("Finance Admin") !== -1;
// 		var needsModal           = isFinanceCoordinator && !isSystemManager && !isFinanceAdmin;
// 		var isCollapsible        = isSystemManager || isFinanceAdmin;

// 		var grouped = {};
// 		data.forEach(function (row) {
// 			if (!grouped[row.user]) {
// 				grouped[row.user] = { user_fullname: row.user_fullname || "", email: row.user, rows: [] };
// 			}
// 			grouped[row.user].rows.push(row);
// 		});

// 		container.empty();

// 		/* admin global user search */
// 		if (isCollapsible) {
// 			container.append(
// 				'<div class="global-user-search-wrap">' +
// 				'<div class="gus-label"><i class="fa fa-users"></i> Search User</div>' +
// 				'<div class="gus-inner">' +
// 				'<i class="fa fa-search gus-icon"></i>' +
// 				'<input type="text" id="admin-user-search" class="gus-input" placeholder="Search by name or email..." autocomplete="off"/>' +
// 				'<span id="admin-user-search-clear" class="gus-clear" title="Clear">&times;</span>' +
// 				'</div>' +
// 				'<div id="admin-user-search-count" class="gus-count" style="display:none;"></div>' +
// 				'</div>'
// 			);
// 		}

// 		Object.keys(grouped).forEach(function (key) {
// 			var userData    = grouped[key];
// 			var displayName = userData.user_fullname || userData.email;
// 			var rowCount    = userData.rows.length;
// 			var safeId      = userData.email.replace(/[^a-z0-9]/gi, "_");
// 			var cbId        = "expand-cb-" + safeId;

// 			var expandHtml = isCollapsible
// 				? '<div class="expand-toggle-wrap">' +
// 				  '<label class="expand-toggle-label" for="' + cbId + '">' +
// 				  '<input type="checkbox" id="' + cbId + '" class="expand-toggle-cb">' +
// 				  '<span class="expand-toggle-btn">Expand</span>' +
// 				  '</label>' +
// 				  '<span class="expand-row-count">' + rowCount + " row" + (rowCount !== 1 ? "s" : "") + '</span>' +
// 				  '</div>'
// 				: "";

// 			var $section = $(
// 				'<div class="user-section" data-name="' + esc(displayName.toLowerCase()) + '" data-email="' + esc(userData.email.toLowerCase()) + '">' +

// 				/* profile card */
// 				'<div class="profile-card ' + (isCollapsible ? "profile-collapsible" : "") + '">' +
// 				'<div class="profile-left">' +
// 				'<div class="uhi-avatar">' + esc(displayName.charAt(0).toUpperCase()) + '</div>' +
// 				'<div class="uhi-info">' +
// 				'<div class="user-name">' + esc(displayName) + '</div>' +
// 				'<div class="user-email">' + esc(userData.email) + '</div>' +
// 				'</div></div>' +
// 				'<div class="profile-right">' + expandHtml + '</div>' +
// 				'</div>' +

// 				/* tip banner */
// 				'<div class="dl-tip-banner">' +
// 				'<div class="dl-tip-icon-wrap"><i class="fa fa-info-circle"></i></div>' +
// 				'<div class="dl-tip-text">' +
// 				'<strong>How to download</strong> &mdash; Click <span class="dl-tip-em">Download all</span> to get the full template, or tick specific rows in the table and the button will automatically switch to <span class="dl-tip-em">Download selected</span>.' +
// 				'</div>' +
// 				'<span class="dl-tip-close" title="Dismiss">&times;</span>' +
// 				'</div>' +

// 				/* body */
// 				'<div class="user-body" style="display:' + (isCollapsible ? "none" : "block") + ';">' +
// 				'<div class="note-slot"></div>' +
// 				'<div class="tbl-action-bar">' +
// 				'<div class="tbl-bar-left">' +
// 				'<div class="tbl-search-inner">' +
// 				'<i class="fa fa-search tbl-search-icon"></i>' +
// 				'<input type="text" id="tbl-search-' + safeId + '" class="tbl-search-input" data-safe-id="' + safeId + '" placeholder="Search units, cost centers, locations..." autocomplete="off"/>' +
// 				'<span id="tbl-clear-' + safeId + '" class="tbl-search-clear" data-safe-id="' + safeId + '" title="Clear" style="display:none;">&times;</span>' +
// 				'</div>' +
// 				'<span id="tbl-count-' + safeId + '" class="tbl-search-count" style="display:none;"></span>' +
// 				'</div>' +
// 				'<div class="tbl-bar-right">' +
// 				'<label class="tbl-bulk-label" title="Select / deselect all visible rows">' +
// 				'<input type="checkbox" id="bulk-cb-' + safeId + '" class="bulk-all-cb" data-safe-id="' + safeId + '">' +
// 				'<span class="tbl-bulk-text" id="bulk-text-' + safeId + '">Select all</span>' +
// 				'</label>' +
// 				'<span class="tbl-sel-badge" id="tbl-sel-badge-' + safeId + '" style="display:none;"></span>' +
// 				'<button class="tbl-desel-btn" data-safe-id="' + safeId + '" style="display:none;"><i class="fa fa-times"></i> Deselect all</button>' +
// 				'<div class="button-container"></div>' +
// 				'</div></div>' +
// 				'<div class="table-slot"></div>' +
// 				'</div></div>'
// 			);

// 			container.append($section);

// 			if (needsModal) { $section.find(".note-slot").html(build_note_html()); }

// 			$section.find(".table-slot").html(build_table_html(userData.rows, safeId));

// 			/* expand/collapse */
// 			if (isCollapsible) {
// 				$section.find(".expand-toggle-cb").on("change", function () {
// 					var $body = $section.find(".user-body");
// 					var $card = $section.find(".profile-card");
// 					var $txt  = $section.find(".expand-toggle-btn");
// 					if (this.checked) {
// 						$body.slideDown(200); $card.addClass("is-open"); $txt.text("Collapse");
// 					} else {
// 						$body.slideUp(200); $card.removeClass("is-open"); $txt.text("Expand");
// 						run_table_search(safeId, ""); deselect_all(safeId);
// 					}
// 				});
// 			}

// 			/* download button */
// 			(function (sid, email, admin) {
// 				var $dlBtn = $(
// 					'<button class="dl-btn-main dl-btn">' +
// 					'<i class="fa fa-download dl-btn-icon"></i>' +
// 					'<div class="dl-btn-body">' +
// 					'<span class="dl-btn-label" id="dl-lbl-' + sid + '">Download all</span>' +
// 					'<span class="dl-btn-count" id="dl-cnt-' + sid + '">' + rowCount + ' rows \u00b7 full template</span>' +
// 					'</div></button>'
// 				);
// 				$section.find(".tbl-bar-right .button-container").append($dlBtn);
// 				$dlBtn.on("click", function () {
// 					var anySelected = $(".mis-table[data-safe-id='" + sid + "'] .row-select-cb:checked").length > 0;
// 					if (anySelected) { show_review_modal(sid, email); }
// 					else             { check_and_download($(this), email, admin); }
// 				});
// 			})(safeId, userData.email, !needsModal);
// 		});

// 		/* checkbox events */
// 		$(document)
// 			.off(".rowSelect")
// 			.on("change.rowSelect", ".bulk-all-cb", function () {
// 				var sid     = $(this).data("safe-id");
// 				var checked = this.checked;
// 				$(".mis-table[data-safe-id='" + sid + "'] tbody tr:visible").each(function () {
// 					$(this).find(".row-select-cb").prop("checked", checked);
// 					$(this).toggleClass("row-selected", checked);
// 				});
// 				sync_bulk_cb(sid);
// 				update_dl_btn_state(sid);
// 				update_toolbar_actions(sid);
// 			})
// 			.on("change.rowSelect", ".row-select-cb", function () {
// 				var $row = $(this).closest("tr");
// 				var sid  = $(this).closest(".mis-table").data("safe-id");
// 				$row.toggleClass("row-selected", this.checked);
// 				sync_bulk_cb(sid);
// 				update_dl_btn_state(sid);
// 				update_toolbar_actions(sid);
// 			});

// 		/* deselect */
// 		$(document)
// 			.off(".selSubmit")
// 			.on("click.selSubmit", ".tbl-desel-btn", function () {
// 				deselect_all($(this).data("safe-id"));
// 			});

// 		/* per-table search */
// 		$(document)
// 			.off(".tblSearch")
// 			.on("input.tblSearch", ".tbl-search-input", function () {
// 				run_table_search($(this).data("safe-id"), this.value);
// 			})
// 			.on("click.tblSearch", ".tbl-search-clear", function () {
// 				var sid = $(this).data("safe-id");
// 				$("#tbl-search-" + sid).val("");
// 				run_table_search(sid, "");
// 			});

// 		/* dismiss tip banner */
// 		$(document)
// 			.off(".tipDismiss")
// 			.on("click.tipDismiss", ".dl-tip-close", function () {
// 				$(this).closest(".dl-tip-banner").slideUp(200);
// 			});

// 		/* admin user search */
// 		if (isCollapsible) {
// 			$(document)
// 				.off(".adminUserSearch")
// 				.on("input.adminUserSearch", "#admin-user-search", function () { run_user_search(this.value); })
// 				.on("click.adminUserSearch", "#admin-user-search-clear", function () {
// 					$("#admin-user-search").val(""); run_user_search("");
// 				});
// 			$("#admin-user-search-clear").hide();
// 		}
// 	}

// 	/* ============================================================
// 	   INIT
// 	============================================================ */
// 	$container.html('<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading Data...</div>');

// 	frappe.call({
// 		method  : "annual_budget.api.filter_options.get_user_mappings",
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) {
// 				$container.html('<div class="empty-state">No Data Found</div>');
// 				return;
// 			}
// 			render_content($container, r.message);
// 		}
// 	});

// }; /* end on_page_load */

//fainal
// frappe.pages["import-template"].on_page_load = function (wrapper) {

// 	frappe.ui.make_app_page({
// 		parent       : wrapper,
// 		title        : "Budget Import Template",
// 		single_column: true
// 	});

// 	var $container = $(wrapper).find(".layout-main-section");
// 	$container.addClass("budget-import-wrapper");

// 	/* ============================================================
// 	   STYLES
// 	============================================================ */
// 	if (!document.getElementById("allocation-style")) {
// 		var style = document.createElement("style");
// 		style.id  = "allocation-style";
// 		var rules = [
// 			/* ── wrapper ── */
// 			".budget-import-wrapper{padding:24px;background:var(--color-background-tertiary);min-height:100vh;}",

// 			/* ── loading / empty ── */
// 			".loading-state,.empty-state{text-align:center;padding:60px 20px;font-size:15px;font-weight:600;color:#0076B6;}",
// 			".loading-state i,.empty-state i{font-size:28px;margin-bottom:10px;display:block;}",

// 			/* ── user section ── */
// 			".user-section{margin-bottom:36px;}",

// 			/* ── profile card ── */
// 			".profile-card{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:var(--color-background-primary);border:1.5px solid #0076B6;border-radius:10px;margin-bottom:0;gap:12px;}",
// 			".profile-collapsible{border-radius:10px;}",
// 			".profile-collapsible.is-open{border-radius:10px 10px 0 0;border-bottom-color:transparent;}",
// 			".profile-left{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}",
// 			".profile-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}",
// 			".uhi-avatar{width:40px;height:40px;border-radius:50%;background:#0076B6;color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
// 			".uhi-info{display:flex;flex-direction:column;gap:2px;min-width:0;}",
// 			".user-name{font-size:14px;font-weight:700;color:var(--color-text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
// 			".user-email{font-size:12px;color:var(--color-text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",

// 			/* ── expand toggle ── */
// 			".expand-toggle-wrap{display:flex;align-items:center;gap:8px;}",
// 			".expand-toggle-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;padding:5px 10px;border:1.5px solid var(--color-border-secondary);border-radius:6px;background:var(--color-background-secondary);transition:border-color 0.15s;}",
// 			".expand-toggle-label:hover{border-color:#0076B6;}",
// 			".expand-toggle-cb{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
// 			".expand-toggle-btn{font-size:12px;font-weight:700;color:#0076B6;white-space:nowrap;}",
// 			".expand-row-count{font-size:11px;font-weight:600;color:#fff;background:#0076B6;padding:2px 9px;border-radius:99px;white-space:nowrap;}",

// 			/* ── tip banner ── */
// 			".dl-tip-banner{display:flex;align-items:flex-start;gap:10px;padding:10px 16px;background:#EBF4FF;border:1px solid #B8D9F5;border-top:none;border-radius:0 0 10px 10px;margin-bottom:0;}",
// 			".dl-tip-icon-wrap{width:22px;height:22px;border-radius:50%;background:#0076B6;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}",
// 			".dl-tip-icon-wrap i{font-size:10px;color:#fff;}",
// 			".dl-tip-text{font-size:12px;color:#1a4f72;line-height:1.65;flex:1;}",
// 			".dl-tip-text strong{color:#003B63;font-weight:600;}",
// 			".dl-tip-em{font-weight:600;color:#0076B6;}",
// 			".dl-tip-close{font-size:18px;color:#7a9ab0;cursor:pointer;line-height:1;flex-shrink:0;padding:0 2px;margin-top:-1px;}",
// 			".dl-tip-close:hover{color:#003B63;}",

// 			/* ── !! NOTE: user-body now has NO top border — note-warning & bridge handle the gap ── */
// 			".user-body{}",

// 			/* ── NOTE / IMPORTANT banner ── */
// 			".note-warning{background:var(--color-background-primary);border:1.5px solid #f0c040;border-left:none;border-radius:10px;display:flex;overflow:hidden;margin-bottom:0;}",
// 			".note-left-bar{width:5px;background:#f4b400;flex-shrink:0;}",
// 			".note-inner{padding:18px 20px;flex:1;min-width:0;}",
// 			".note-header{display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;}",
// 			".note-icon-ring{width:34px;height:34px;border-radius:50%;background:#fff8e1;border:1.5px solid #f4b400;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}",
// 			".note-icon-ring i{font-size:14px;color:#e67e22;}",
// 			".note-badge{display:inline-flex;align-items:center;gap:5px;background:#f4b400;color:#5c3800;font-size:10px;font-weight:700;padding:2px 9px;border-radius:99px;letter-spacing:0.6px;margin-bottom:5px;}",
// 			".note-badge-dot{width:5px;height:5px;border-radius:50%;background:#5c3800;display:inline-block;animation:softBlink 1.5s ease-in-out infinite;}",
// 			"@keyframes softBlink{0%,100%{opacity:1;}50%{opacity:0.3;}}",
// 			".note-title{font-size:13px;font-weight:500;color:#3d2800;line-height:1.65;}",
// 			".note-divider{height:1px;background:#fde68a;margin:14px 0;}",

// 			/* ── contact grid ── */
// 			".contact-wrapper{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;}",
// 			".contact-card{background:#fffef7;border:1px solid #f0d97a;border-radius:8px;padding:13px 15px;display:flex;align-items:flex-start;gap:11px;transition:border-color 0.15s,background 0.15s;}",
// 			".contact-card:hover{border-color:#e0a800;background:#fffbe6;}",
// 			".contact-avatar{width:34px;height:34px;border-radius:50%;background:#f4b400;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#5c3800;flex-shrink:0;margin-top:1px;}",
// 			".contact-info{min-width:0;flex:1;}",
// 			".contact-name{font-size:12.5px;font-weight:700;color:#3d2800;margin-bottom:5px;word-break:break-word;}",
// 			".contact-detail{font-size:11.5px;color:#7a5200;line-height:1.6;display:flex;align-items:flex-start;gap:6px;margin-bottom:2px;}",
// 			".contact-detail i{font-size:10px;flex-shrink:0;color:#b07800;width:11px;text-align:center;margin-top:2px;}",
// 			".contact-detail span{word-break:break-all;flex:1;}",

// 			/* ── WHITE SPACE gap between note box and table card ── */
// 			".note-to-table-gap{height:20px;}",
// 			/* when there is no note, just a small spacer */
// 			".section-spacer{height:16px;background:transparent;}",

// 			/* ── table card — wraps action bar + table, fully self-contained ── */
// 			".tbl-card{border:1.5px solid #c8dff0;border-radius:10px;overflow:hidden;background:var(--color-background-primary);}",

// 			/* ── action bar ── */
// 			".tbl-action-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:11px 14px;background:#f0f6fc;border-bottom:1px solid #d0e6f7;}",
// 			".tbl-bar-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1;min-width:0;}",
// 			".tbl-bar-right{display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap;}",

// 			/* ── search ── */
// 			".tbl-search-inner{position:relative;display:flex;align-items:center;width:300px;max-width:100%;}",
// 			".tbl-search-icon-pill{position:absolute;left:9px;width:20px;height:20px;background:#0076B6;border-radius:50%;display:flex;align-items:center;justify-content:center;pointer-events:none;flex-shrink:0;}",
// 			".tbl-search-icon-pill i{font-size:9px;color:#fff;}",
// 			".tbl-search-input{width:100%;padding:8px 34px 8px 36px;border:1.5px solid #c8dff0;border-radius:8px;font-size:13px;color:var(--color-text-primary);outline:none;background:var(--color-background-primary);transition:border-color 0.2s,box-shadow 0.2s;}",
// 			".tbl-search-input::placeholder{color:#a0b4c2;}",
// 			".tbl-search-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.10);}",
// 			".tbl-search-clear{position:absolute;right:9px;width:18px;height:18px;border-radius:50%;background:#d0dde8;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;color:#4a6070;font-weight:700;transition:background 0.15s,color 0.15s;}",
// 			".tbl-search-clear:hover{background:#c0392b;color:#fff;}",
// 			".tbl-search-count{font-size:11px;color:#0076B6;font-weight:600;white-space:nowrap;display:flex;align-items:center;gap:4px;}",
// 			".tbl-search-count::before{content:'';display:inline-block;width:5px;height:5px;border-radius:50%;background:#0076B6;}",

// 			/* ── bulk select ── */
// 			".tbl-bulk-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;padding:5px 10px;border:1.5px solid var(--color-border-secondary);border-radius:6px;background:var(--color-background-primary);transition:border-color 0.15s;}",
// 			".tbl-bulk-label:hover{border-color:#0076B6;}",
// 			".tbl-bulk-label input{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
// 			".tbl-bulk-text{font-size:12px;font-weight:600;color:var(--color-text-secondary);white-space:nowrap;}",

// 			/* ── selection badge ── */
// 			".tbl-sel-badge{font-size:12px;font-weight:600;color:#fff;background:#0076B6;padding:3px 10px;border-radius:99px;white-space:nowrap;}",

// 			/* ── deselect button ── */
// 			".tbl-desel-btn{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;border:1.5px solid var(--color-border-secondary);background:var(--color-background-primary);font-size:12px;font-weight:600;color:var(--color-text-secondary);cursor:pointer;transition:all 0.15s;white-space:nowrap;}",
// 			".tbl-desel-btn:hover{border-color:#c0392b;color:#c0392b;}",

// 			/* ── download button ── */
// 			".dl-btn-main{display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:7px;cursor:pointer;border:2px solid #0076B6;background:var(--color-background-primary);transition:all 0.15s ease;white-space:nowrap;}",
// 			".dl-btn-main:hover{background:#f0f7fd;box-shadow:0 0 0 3px rgba(0,118,182,0.10);}",
// 			".dl-btn-main:disabled{opacity:0.55;cursor:not-allowed;box-shadow:none;}",
// 			".dl-btn-icon{font-size:16px;color:#0076B6;flex-shrink:0;}",
// 			".dl-btn-body{display:flex;flex-direction:column;align-items:flex-start;gap:1px;}",
// 			".dl-btn-label{font-size:13px;font-weight:700;color:#003B63;line-height:1.2;}",
// 			".dl-btn-count{font-size:11px;color:var(--color-text-secondary);line-height:1.3;}",
// 			".dl-cnt-sel{color:#1a7a42;font-weight:700;}",
// 			".dl-btn-main-sel{border-color:#1a8a4a;background:#f0faf5;}",
// 			".dl-btn-main-sel:hover{background:#e4f5eb;box-shadow:0 0 0 3px rgba(26,138,74,0.12);}",
// 			".dl-btn-main-sel .dl-btn-icon{color:#1a8a4a;}",
// 			".dl-btn-main-sel .dl-btn-label{color:#145e32;}",

// 			/* ── TABLE — odd/even row coloring ── */
// 			".table-wrapper{overflow-x:auto;-webkit-overflow-scrolling:touch;}",
// 			".mis-table{width:100%;border-collapse:collapse;font-size:13px;min-width:580px;}",

// 			/* header */
// 			".mis-table thead tr{background:#0076B6;}",
// 			".mis-table th{color:#fff;font-weight:700;padding:10px 11px;text-align:center;white-space:nowrap;font-size:12px;letter-spacing:0.2px;}",

// 			/* ODD rows — clean white */
// 			".mis-table tbody tr:nth-child(odd) td{background:#ffffff;}",
// 			/* EVEN rows — soft blue tint */
// 			".mis-table tbody tr:nth-child(even) td{background:#EBF4FF;}",

// 			/* shared cell style */
// 			".mis-table tbody td{padding:9px 11px;border-bottom:1px solid #ddeeff;text-align:center;color:var(--color-text-primary);font-size:13px;vertical-align:middle;}",
// 			".mis-table tbody tr:last-child td{border-bottom:none;}",

// 			/* left accent stripe per row type */
// 			".mis-table tbody tr:nth-child(odd) td:first-child{border-left:3px solid transparent;}",
// 			".mis-table tbody tr:nth-child(even) td:first-child{border-left:3px solid #b8d9f5;}",

// 			/* hover overrides both */
// 			".mis-table tbody tr:hover td{background:#daeeff !important;}",
// 			".mis-table tbody tr:hover td:first-child{border-left-color:#0076B6 !important;}",

// 			/* selected row */
// 			".mis-table tbody tr.row-selected td{background:#cce8fd !important;border-bottom-color:#99cef5 !important;}",
// 			".mis-table tbody tr.row-selected td:first-child{border-left:3px solid #0076B6 !important;}",

// 			/* serial number badges */
// 			".sl-badge-odd{display:inline-block;background:#e8f1fa;color:#0076B6;font-weight:700;border-radius:99px;padding:1px 8px;font-size:11.5px;min-width:28px;}",
// 			".sl-badge-even{display:inline-block;background:#0076B6;color:#fff;font-weight:700;border-radius:99px;padding:1px 8px;font-size:11.5px;min-width:28px;}",

// 			/* checkbox column */
// 			".cb-cell{width:36px;min-width:36px;text-align:center;padding:6px !important;}",
// 			".row-select-cb,.bulk-all-cb{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;vertical-align:middle;}",

// 			/* ── admin global search ── */
// 			".global-user-search-wrap{margin-bottom:20px;padding:14px 16px;background:var(--color-background-secondary);border:1.5px solid var(--color-border-secondary);border-radius:10px;}",
// 			".gus-label{font-size:11px;font-weight:700;color:#0076B6;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:8px;}",
// 			".gus-label i{margin-right:6px;}",
// 			".gus-inner{position:relative;display:flex;align-items:center;max-width:460px;}",
// 			".gus-icon-pill{position:absolute;left:10px;width:20px;height:20px;background:#0076B6;border-radius:50%;display:flex;align-items:center;justify-content:center;pointer-events:none;}",
// 			".gus-icon-pill i{font-size:9px;color:#fff;}",
// 			".gus-input{width:100%;padding:8px 32px 8px 38px;border:1.5px solid var(--color-border-secondary);border-radius:8px;font-size:13px;color:var(--color-text-primary);outline:none;background:var(--color-background-primary);transition:border-color 0.2s,box-shadow 0.2s;}",
// 			".gus-input::placeholder{color:#a0b4c2;}",
// 			".gus-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.10);}",
// 			".gus-clear{position:absolute;right:10px;width:18px;height:18px;border-radius:50%;background:#d0dde8;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;color:#4a6070;font-weight:700;transition:background 0.15s,color 0.15s;}",
// 			".gus-clear:hover{background:#c0392b;color:#fff;}",
// 			".gus-count{margin-top:6px;font-size:12px;color:#0076B6;font-weight:600;display:flex;align-items:center;gap:4px;}",
// 			".gus-count::before{content:'';display:inline-block;width:5px;height:5px;border-radius:50%;background:#0076B6;}",

// 			/* ── review modal ── */
// 			"#rev-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:99999;padding:15px;}",
// 			".rev-modal-box{background:var(--color-background-primary);width:700px;max-width:100%;max-height:90vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.25);display:flex;flex-direction:column;overflow:hidden;}",
// 			".rev-modal-header{display:flex;justify-content:space-between;align-items:center;padding:16px 22px;border-bottom:1px solid var(--color-border-tertiary);font-weight:700;font-size:15px;color:var(--color-text-primary);flex-shrink:0;}",
// 			".rev-modal-title i{margin-right:8px;color:#0076B6;}",
// 			"#rev-modal-close{cursor:pointer;font-size:22px;color:var(--color-text-secondary);line-height:1;}",
// 			"#rev-modal-close:hover{color:var(--color-text-primary);}",
// 			".rev-modal-body{padding:18px 22px;overflow-y:auto;flex:1;}",
// 			".rev-warning-banner{display:flex;align-items:flex-start;gap:12px;background:#fff8e1;border:1px solid #f4b400;border-left:4px solid #f4b400;border-radius:8px;padding:12px 16px;margin-bottom:14px;}",
// 			".rev-warn-icon{font-size:20px;color:#e67e22;flex-shrink:0;margin-top:2px;}",
// 			".rev-warn-title{font-size:13px;font-weight:700;color:#5c3d00;margin-bottom:3px;}",
// 			".rev-warn-sub{font-size:12px;color:#7a5200;line-height:1.6;}",
// 			".rev-count-badge{display:inline-block;font-size:12px;font-weight:700;color:#fff;background:#0076B6;padding:3px 12px;border-radius:99px;margin-bottom:12px;}",
// 			".rev-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:14px;border-radius:8px;border:1px solid var(--color-border-tertiary);}",
// 			".rev-table{width:100%;border-collapse:collapse;font-size:12px;min-width:500px;}",
// 			".rev-table thead tr{background:#0076B6;}",
// 			".rev-table th{color:#fff;font-weight:700;padding:8px 10px;text-align:center;white-space:nowrap;}",
// 			".rev-table tbody tr:nth-child(odd) td{background:#ffffff;}",
// 			".rev-table tbody tr:nth-child(even) td{background:#EBF4FF;}",
// 			".rev-table td{padding:7px 10px;border-bottom:1px solid #ddeeff;text-align:center;}",
// 			".rev-table tbody tr:last-child td{border-bottom:none;}",
// 			".rev-table tbody tr:hover td{background:#daeeff !important;}",
// 			".rev-sl{width:36px;}",
// 			".rev-confirm-wrap{background:var(--color-background-secondary);border:1px solid var(--color-border-tertiary);border-radius:8px;padding:12px 14px;}",
// 			".rev-confirm-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;font-size:13px;color:var(--color-text-primary);}",
// 			".rev-confirm-label input{width:14px;height:14px;margin-top:2px;accent-color:#0076B6;flex-shrink:0;cursor:pointer;}",
// 			".rev-confirm-label i{color:#28a745;margin-right:4px;}",
// 			".rev-modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:12px 22px;border-top:1px solid var(--color-border-tertiary);flex-shrink:0;}",
// 			".rev-modal-footer .btn{min-width:130px;}",
// 			"#rev-btn-proceed:disabled{opacity:0.6;cursor:not-allowed;}",

// 			/* ── APF modal ── */
// 			"#apf-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:9999;padding:15px;}",
// 			".apf-modal-box{background:var(--color-background-primary);width:520px;max-width:100%;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.2);padding:26px;}",
// 			".apf-modal-header{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:15px;margin-bottom:18px;}",
// 			".apf-modal-title i{margin-right:8px;color:#0076B6;}",
// 			"#apf-modal-close{cursor:pointer;font-size:22px;color:var(--color-text-secondary);line-height:1;}",
// 			"#apf-modal-close:hover{color:var(--color-text-primary);}",
// 			".apf-modal-body{text-align:center;margin-bottom:18px;}",
// 			".apf-modal-icon{font-size:38px;margin-bottom:10px;}",
// 			".apf-modal-text{font-weight:600;font-size:13px;color:#c0392b;margin-bottom:8px;line-height:1.6;}",
// 			".apf-modal-sub{font-size:12px;color:var(--color-text-secondary);margin-bottom:14px;line-height:1.6;}",
// 			".apf-checkbox-wrapper{background:var(--color-background-secondary);padding:12px;border-radius:8px;border:1px solid var(--color-border-tertiary);font-size:13px;text-align:left;}",
// 			".apf-checkbox-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;}",
// 			".apf-checkbox-label i{color:#28a745;margin-right:4px;}",
// 			".apf-checkbox-label input{margin-top:3px;flex-shrink:0;accent-color:#0076B6;}",
// 			".apf-modal-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:14px;}",
// 			".apf-modal-footer .btn{min-width:130px;}",
// 			"#apf-modal-proceed:disabled{opacity:0.6;cursor:not-allowed;}",

// 			/* ── loader ── */
// 			"#global-loader.loader-overlay{position:fixed;inset:0;width:100vw;height:100vh;background:rgba(18,18,18,0.92);z-index:999999;display:none;align-items:center;justify-content:center;}",
// 			"#global-loader.loader-overlay.active{display:flex;}",
// 			".loader-box{display:flex;flex-direction:column;align-items:center;gap:16px;}",
// 			".loader-ring-wrap{position:relative;width:110px;height:110px;display:flex;align-items:center;justify-content:center;}",
// 			".loader-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);}",
// 			".loader-ring-bg{fill:none;stroke:rgba(255,255,255,0.12);stroke-width:6;}",
// 			".loader-ring-fill{fill:none;stroke:url(#ringGrad);stroke-width:6;stroke-linecap:round;stroke-dasharray:276.46;stroke-dashoffset:276.46;transition:stroke-dashoffset 0.35s ease;}",
// 			".loader-logo{width:72px;height:72px;border-radius:50%;background:#fff;padding:11px;object-fit:contain;position:relative;z-index:1;animation:pulse 1.6s infinite ease-in-out;}",
// 			".loader-pct-inside{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:700;color:#fff;background:rgba(0,118,182,0.85);padding:1px 7px;border-radius:99px;z-index:2;white-space:nowrap;}",
// 			".loader-text{font-size:13px;color:#fff;font-weight:600;letter-spacing:0.5px;text-align:center;opacity:0.85;}",
// 			"@keyframes pulse{0%,100%{transform:scale(1);opacity:0.85;}50%{transform:scale(1.06);opacity:1;}}",
// 			".dl-anim-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;width:56px;}",
// 			".dl-arrow-track{width:22px;height:26px;overflow:hidden;position:relative;}",
// 			".dl-arrow{display:flex;flex-direction:column;align-items:center;position:absolute;left:50%;transform:translateX(-50%);animation:dl-drop 1.2s ease-in-out infinite;}",
// 			".dl-arrow-stem{width:3px;height:13px;background:#0076B6;border-radius:2px;}",
// 			".dl-arrow-head{width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #0076B6;}",
// 			"@keyframes dl-drop{0%{top:-26px;opacity:0;}30%{opacity:1;}70%{opacity:1;}100%{top:26px;opacity:0;}}",
// 			".dl-bar{width:40px;height:4px;background:#0076B6;border-radius:99px;animation:dl-bar-pulse 1.2s ease-in-out infinite;}",
// 			"@keyframes dl-bar-pulse{0%,100%{opacity:0.4;transform:scaleX(0.8);}50%{opacity:1;transform:scaleX(1);}}",
// 			".dl-dots{display:flex;gap:5px;}",
// 			".dl-dots span{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.6);animation:dl-bounce 1.2s ease-in-out infinite;}",
// 			".dl-dots span:nth-child(1){animation-delay:0s;}",
// 			".dl-dots span:nth-child(2){animation-delay:0.2s;}",
// 			".dl-dots span:nth-child(3){animation-delay:0.4s;}",
// 			"@keyframes dl-bounce{0%,80%,100%{transform:scale(1);opacity:0.5;}40%{transform:scale(1.5);opacity:1;}}",

// 			/* ── RESPONSIVE: tablet (≤900px) ── */
// 			"@media(max-width:900px){",
// 			".budget-import-wrapper{padding:18px;}",
// 			".contact-wrapper{grid-template-columns:repeat(auto-fill,minmax(240px,1fr));}",
// 			".tbl-search-inner{width:240px;}",
// 			".gus-inner{max-width:100%;}",
// 			".note-to-table-gap{height:16px;}",
// 			"}",

// 			/* ── RESPONSIVE: large phone (≤768px) ── */
// 			"@media(max-width:768px){",
// 			".budget-import-wrapper{padding:14px;}",
// 			".profile-card{flex-wrap:wrap;}",
// 			".profile-right{width:100%;justify-content:flex-end;}",
// 			".tbl-action-bar{flex-direction:column;align-items:stretch;}",
// 			".tbl-bar-left{width:100%;}",
// 			".tbl-bar-right{width:100%;justify-content:flex-end;}",
// 			".tbl-search-inner{width:100%;}",
// 			".dl-btn-main{width:100%;justify-content:center;}",
// 			".contact-wrapper{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;}",
// 			".note-inner{padding:14px 16px;}",
// 			".note-to-table-gap{height:14px;}",
// 			".rev-modal-footer{flex-wrap:wrap;gap:8px;}",
// 			".rev-modal-footer .btn{flex:1;min-width:unset;}",
// 			".apf-modal-footer{flex-wrap:wrap;gap:8px;}",
// 			".apf-modal-footer .btn{flex:1;min-width:unset;}",
// 			"}",

// 			/* ── RESPONSIVE: small phone (≤576px) ── */
// 			"@media(max-width:576px){",
// 			".budget-import-wrapper{padding:10px;}",
// 			".uhi-avatar{width:34px;height:34px;font-size:13px;}",
// 			".user-name{font-size:13px;}",
// 			".user-email{font-size:11px;}",
// 			".expand-row-count{display:none;}",
// 			".mis-table{font-size:11.5px;}",
// 			".mis-table th{padding:7px 8px;font-size:11px;}",
// 			".mis-table tbody td{padding:7px 8px;}",
// 			".tbl-action-bar{padding:10px 12px;}",
// 			".tbl-bulk-text{display:none;}",
// 			".tbl-sel-badge{font-size:11px;}",
// 			".dl-btn-count{display:none;}",
// 			".dl-tip-text{font-size:11px;}",
// 			".contact-wrapper{grid-template-columns:1fr 1fr;gap:8px;}",
// 			".contact-name{font-size:11.5px;}",
// 			".contact-detail{font-size:10.5px;}",
// 			".contact-avatar{width:28px;height:28px;font-size:10px;}",
// 			".note-badge{font-size:9px;}",
// 			".note-title{font-size:12px;}",
// 			".note-inner{padding:12px 13px;}",
// 			".note-to-table-gap{height:12px;}",
// 			".rev-modal-header{padding:12px 16px;font-size:14px;}",
// 			".rev-modal-body{padding:14px 16px;}",
// 			".rev-modal-footer{padding:10px 16px;flex-direction:column;}",
// 			".rev-modal-footer .btn{width:100%;min-width:unset;}",
// 			".apf-modal-box{padding:18px;}",
// 			".apf-modal-footer{flex-direction:column;}",
// 			".apf-modal-footer .btn{width:100%;min-width:unset;}",
// 			"}",

// 			/* ── RESPONSIVE: very small (≤400px) ── */
// 			"@media(max-width:400px){",
// 			".budget-import-wrapper{padding:8px;}",
// 			".profile-card{padding:10px 12px;}",
// 			".contact-wrapper{grid-template-columns:1fr;}",
// 			".tbl-bar-right{flex-direction:column;align-items:stretch;}",
// 			".tbl-bulk-label{justify-content:center;}",
// 			".expand-toggle-label{padding:4px 8px;}",
// 			".note-to-table-gap{height:10px;}",
// 			".dl-tip-banner{padding:8px 12px;}",
// 			"}"
// 		];
// 		style.textContent = rules.join("");
// 		document.head.appendChild(style);
// 	}

// 	/* ============================================================
// 	   LOADER
// 	============================================================ */
// 	function init_loader() {
// 		if ($("#global-loader").length) return;
// 		$("body").append(
// 			'<div id="global-loader" class="loader-overlay">' +
// 			'<div class="loader-box">' +
// 			'<div class="loader-ring-wrap">' +
// 			'<svg class="loader-ring" viewBox="0 0 100 100">' +
// 			'<defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
// 			'<stop offset="0%" stop-color="#0076B6"/><stop offset="100%" stop-color="#00c6ff"/>' +
// 			'</linearGradient></defs>' +
// 			'<circle class="loader-ring-bg" cx="50" cy="50" r="44"/>' +
// 			'<circle class="loader-ring-fill" id="loader-ring-fill" cx="50" cy="50" r="44"/>' +
// 			'</svg>' +
// 			'<img src="/files/APF logo.png" class="loader-logo" alt="Loading">' +
// 			'<div class="loader-pct-inside" id="loader-pct">0%</div>' +
// 			'</div>' +
// 			'<div class="dl-anim-wrap">' +
// 			'<div class="dl-arrow-track"><div class="dl-arrow"><div class="dl-arrow-stem"></div><div class="dl-arrow-head"></div></div></div>' +
// 			'<div class="dl-bar"></div>' +
// 			'<div class="dl-dots"><span></span><span></span><span></span></div>' +
// 			'</div>' +
// 			'<div class="loader-text" id="loader-text-msg">Preparing download...</div>' +
// 			'</div></div>'
// 		);
// 	}

// 	function set_progress(pct) {
// 		var offset = 276.46 - (pct / 100) * 276.46;
// 		$("#loader-ring-fill").css("stroke-dashoffset", offset);
// 		$("#loader-pct").text(Math.round(pct) + "%");
// 	}

// 	var Loader = {
// 		show    : function (msg) { init_loader(); $("#loader-text-msg").text(msg || "Preparing download..."); set_progress(0); $("#global-loader").addClass("active"); },
// 		setText : function (msg) { $("#loader-text-msg").text(msg); },
// 		setProgress: function (pct) { set_progress(pct); },
// 		hide    : function () { $("#global-loader").removeClass("active"); }
// 	};

// 	/* ============================================================
// 	   APF MODAL
// 	============================================================ */
// 	function init_apf_modal() {
// 		if ($("#apf-modal-overlay").length) return;
// 		$("body").append(
// 			'<div id="apf-modal-overlay">' +
// 			'<div class="apf-modal-box">' +
// 			'<div class="apf-modal-header">' +
// 			'<div class="apf-modal-title" id="apf-modal-title"></div>' +
// 			'<span id="apf-modal-close" title="Close">&times;</span>' +
// 			'</div>' +
// 			'<div class="apf-modal-body">' +
// 			'<div class="apf-modal-icon" id="apf-modal-icon"><i id="apf-modal-icon-i" class="fa"></i></div>' +
// 			'<div class="apf-modal-text" id="apf-modal-text"></div>' +
// 			'<div class="apf-modal-sub" id="apf-modal-sub"></div>' +
// 			'<div class="apf-checkbox-wrapper" id="apf-checkbox-wrap" style="display:none;">' +
// 			'<label class="apf-checkbox-label">' +
// 			'<input type="checkbox" id="apf-modal-checkbox">' +
// 			'<span><i class="fa fa-check-circle"></i> I confirm that I have verified all details carefully.</span>' +
// 			'</label></div></div>' +
// 			'<div class="apf-modal-footer" id="apf-modal-footer"></div>' +
// 			'</div></div>'
// 		);
// 		$(document)
// 			.off(".apfModal")
// 			.on("click.apfModal", "#apf-modal-close", hide_apf_modal)
// 			.on("click.apfModal", "#apf-modal-overlay", function (e) {
// 				if ($(e.target).is("#apf-modal-overlay")) hide_apf_modal();
// 			})
// 			.on("change.apfModal", "#apf-modal-checkbox", function () {
// 				$("#apf-modal-proceed").prop("disabled", !this.checked);
// 			});
// 	}

// 	function hide_apf_modal() {
// 		$("#apf-modal-overlay").hide();
// 		$("#apf-modal-checkbox").prop("checked", false);
// 		$("#apf-modal-proceed").prop("disabled", true);
// 	}

// 	function show_apf_modal(opts) {
// 		init_apf_modal();
// 		$("#apf-modal-title").html(opts.title || "");
// 		$("#apf-modal-icon-i")
// 			.attr("class", "fa " + (opts.icon || "fa-exclamation-triangle"))
// 			.closest(".apf-modal-icon").css("color", opts.iconColor || "#e74c3c");
// 		$("#apf-modal-text").html(opts.text || "");
// 		$("#apf-modal-sub").html(opts.sub || "");
// 		var showCb = !!opts.showCheckbox;
// 		$("#apf-checkbox-wrap").toggle(showCb);
// 		if (showCb) $("#apf-modal-checkbox").prop("checked", false);
// 		var $footer = $("#apf-modal-footer").empty();
// 		(opts.buttons || []).forEach(function (btn) {
// 			var $b = $('<button id="' + (btn.id || "") + '" class="btn ' + (btn.cls || "btn-default") + ' btn-sm">' + btn.label + '</button>').prop("disabled", !!btn.disabled);
// 			$b.on("click", function () { if (btn.onClick) btn.onClick(); });
// 			$footer.append($b);
// 		});
// 		$("#apf-modal-overlay").css("display", "flex");
// 	}

// 	/* ============================================================
// 	   REVIEW MODAL
// 	============================================================ */
// 	function init_review_modal() {
// 		if ($("#rev-modal-overlay").length) return;
// 		$("body").append(
// 			'<div id="rev-modal-overlay">' +
// 			'<div class="rev-modal-box">' +
// 			'<div class="rev-modal-header">' +
// 			'<div class="rev-modal-title"><i class="fa fa-list-alt"></i> Review Selected Items</div>' +
// 			'<span id="rev-modal-close" title="Close">&times;</span>' +
// 			'</div>' +
// 			'<div class="rev-modal-body">' +
// 			'<div class="rev-warning-banner">' +
// 			'<i class="fa fa-exclamation-triangle rev-warn-icon"></i>' +
// 			'<div><div class="rev-warn-title">Please make a note of the items listed below.</div>' +
// 			'<div class="rev-warn-sub">Keep a record of the selected Cost Centers and Location Codes to avoid duplicates when importing.</div></div>' +
// 			'</div>' +
// 			'<div class="rev-count-badge" id="rev-count-badge"></div>' +
// 			'<div class="rev-table-wrap">' +
// 			'<table class="rev-table">' +
// 			'<thead><tr><th class="rev-sl">#</th><th>Unit</th><th>Unit Description</th><th>Cost Center</th><th>Cost Center Description</th><th>Location Code</th><th>Location Description</th></tr></thead>' +
// 			'<tbody id="rev-table-body"></tbody>' +
// 			'</table></div>' +
// 			'<div class="rev-confirm-wrap">' +
// 			'<label class="rev-confirm-label">' +
// 			'<input type="checkbox" id="rev-confirm-cb">' +
// 			'<span><i class="fa fa-check-circle"></i> I have noted down the selected items and I am ready to proceed.</span>' +
// 			'</label></div></div>' +
// 			'<div class="rev-modal-footer">' +
// 			'<button id="rev-btn-cancel" class="btn btn-default btn-sm"><i class="fa fa-times"></i> Cancel</button>' +
// 			'<button id="rev-btn-proceed" class="btn btn-success btn-sm" disabled><i class="fa fa-download"></i> Proceed to Download</button>' +
// 			'</div></div></div>'
// 		);
// 		$(document)
// 			.off(".revModal")
// 			.on("click.revModal", "#rev-modal-close, #rev-btn-cancel", hide_review_modal)
// 			.on("click.revModal", "#rev-modal-overlay", function (e) {
// 				if ($(e.target).is("#rev-modal-overlay")) hide_review_modal();
// 			})
// 			.on("change.revModal", "#rev-confirm-cb", function () {
// 				$("#rev-btn-proceed").prop("disabled", !this.checked);
// 			})
// 			.on("click.revModal", "#rev-btn-proceed", function () {
// 				var $overlay = $("#rev-modal-overlay");
// 				var sid      = $overlay.data("safe-id");
// 				var email    = $overlay.data("user-email");
// 				var $section = $(".user-section").filter(function () {
// 					return $(this).data("email") === (email || "").toLowerCase();
// 				});
// 				hide_review_modal();
// 				run_download($section.find(".dl-btn-main"), email, sid);
// 			});
// 	}

// 	function hide_review_modal() {
// 		$("#rev-modal-overlay").hide();
// 		$("#rev-confirm-cb").prop("checked", false);
// 		$("#rev-btn-proceed").prop("disabled", true);
// 	}

// 	function show_review_modal(safeId, userEmail) {
// 		var selected = get_selected_rows(safeId);
// 		if (!selected.length) {
// 			frappe.msgprint({ title: "Nothing Selected", message: "Please select at least one row.", indicator: "orange" });
// 			return;
// 		}
// 		init_review_modal();
// 		var rows = selected.map(function (r, i) {
// 			return '<tr><td class="rev-sl">' + (i + 1) + '</td>' +
// 				'<td>' + esc(r.unit) + '</td>' +
// 				'<td>' + esc(r.unit_description) + '</td>' +
// 				'<td>' + esc(r.cost_center) + '</td>' +
// 				'<td>' + esc(r.cost_center_description) + '</td>' +
// 				'<td>' + esc(r.location_code) + '</td>' +
// 				'<td>' + esc(r.location_description) + '</td></tr>';
// 		}).join("");
// 		$("#rev-table-body").html(rows);
// 		$("#rev-count-badge").text(selected.length + " item" + (selected.length !== 1 ? "s" : "") + " selected");
// 		$("#rev-confirm-cb").prop("checked", false);
// 		$("#rev-btn-proceed").prop("disabled", true);
// 		$("#rev-modal-overlay").data("safe-id", safeId).data("user-email", userEmail).css("display", "flex");
// 	}

// 	/* ============================================================
// 	   HELPERS
// 	============================================================ */
// 	function esc(str) {
// 		return $("<div>").text(str || "").html();
// 	}

// 	function initials(name) {
// 		return (name || "").split(" ").slice(0, 2).map(function (w) { return w[0] || ""; }).join("").toUpperCase();
// 	}

// 	function reset_btn($btn, loading, loadingText) {
// 		$btn.prop("disabled", loading);
// 		if (loading) {
// 			$btn.find(".dl-btn-icon").attr("class", "fa fa-spinner fa-spin dl-btn-icon");
// 			$btn.find(".dl-btn-label").text(loadingText || "Loading...");
// 			$btn.find(".dl-btn-count").text("");
// 		} else {
// 			$btn.find(".dl-btn-icon").attr("class", "fa fa-download dl-btn-icon");
// 		}
// 	}

// 	function get_selected_rows(safeId) {
// 		var selected = [];
// 		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").each(function () {
// 			var $row = $(this);
// 			if (!$row.find(".row-select-cb").is(":checked")) return;
// 			selected.push({
// 				unit                   : $row.data("unit")                    || "",
// 				unit_description       : $row.data("unit-description")        || "",
// 				cost_center            : $row.data("cost-center")             || "",
// 				cost_center_description: $row.data("cost-center-description") || "",
// 				location_code          : $row.data("location-code")           || "",
// 				location_description   : $row.data("location-description")    || ""
// 			});
// 		});
// 		return selected;
// 	}

// 	function sync_bulk_cb(safeId) {
// 		var $all     = $(".mis-table[data-safe-id='" + safeId + "'] tbody tr:visible .row-select-cb");
// 		var $checked = $all.filter(":checked");
// 		var $cbs     = $(".bulk-all-cb[data-safe-id='" + safeId + "']");
// 		var $txt     = $("#bulk-text-" + safeId);
// 		if ($all.length === 0 || $checked.length === 0) {
// 			$cbs.prop("checked", false).prop("indeterminate", false);
// 			$txt.text("Select all");
// 		} else if ($checked.length === $all.length) {
// 			$cbs.prop("checked", true).prop("indeterminate", false);
// 			$txt.text("Deselect all");
// 		} else {
// 			$cbs.prop("checked", false).prop("indeterminate", true);
// 			$txt.text($checked.length + " selected");
// 		}
// 	}

// 	function update_toolbar_actions(safeId) {
// 		var count  = $(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb:checked").length;
// 		var $badge = $("#tbl-sel-badge-" + safeId);
// 		var $desel = $(".tbl-desel-btn[data-safe-id='" + safeId + "']");
// 		if (count > 0) {
// 			$badge.text(count + " row" + (count !== 1 ? "s" : "") + " selected").show();
// 			$desel.show();
// 		} else {
// 			$badge.hide();
// 			$desel.hide();
// 		}
// 	}

// 	function update_dl_btn_state(safeId) {
// 		var count = $(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb:checked").length;
// 		var total = $(".mis-table[data-safe-id='" + safeId + "'] tbody tr").length;
// 		var $lbl  = $("#dl-lbl-" + safeId);
// 		var $cnt  = $("#dl-cnt-" + safeId);
// 		var $btn  = $lbl.closest(".dl-btn-main");
// 		if (count > 0) {
// 			$btn.addClass("dl-btn-main-sel");
// 			$lbl.text("Download selected");
// 			$cnt.html('<span class="dl-cnt-sel">' + count + " of " + total + " rows selected</span>");
// 		} else {
// 			$btn.removeClass("dl-btn-main-sel");
// 			$lbl.text("Download all");
// 			$cnt.text(total + " rows \u00b7 full template");
// 		}
// 	}

// 	function deselect_all(safeId) {
// 		$(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb").prop("checked", false);
// 		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").removeClass("row-selected");
// 		$(".bulk-all-cb[data-safe-id='" + safeId + "']").prop("checked", false).prop("indeterminate", false);
// 		$("#bulk-text-" + safeId).text("Select all");
// 		update_dl_btn_state(safeId);
// 		update_toolbar_actions(safeId);
// 	}

// 	function run_table_search(safeId, query) {
// 		var q      = (query || "").trim().toLowerCase();
// 		var $table = $(".mis-table[data-safe-id='" + safeId + "']");
// 		var visible = 0;
// 		$table.find("tbody tr").each(function () {
// 			var match = !q || this.textContent.toLowerCase().indexOf(q) !== -1;
// 			$(this).toggle(match);
// 			if (match) visible++;
// 		});
// 		sync_bulk_cb(safeId);
// 		var $count = $("#tbl-count-" + safeId);
// 		if (q) { $count.text(visible + " row" + (visible !== 1 ? "s" : "") + " matched").show(); }
// 		else   { $count.hide(); }
// 		$("#tbl-clear-" + safeId).toggle(q.length > 0);
// 	}

// 	function run_user_search(query) {
// 		var q = query.trim().toLowerCase();
// 		var total = 0;
// 		$(".user-section").each(function () {
// 			var $sec  = $(this);
// 			var match = !q || ($sec.data("name") || "").indexOf(q) !== -1 || ($sec.data("email") || "").indexOf(q) !== -1;
// 			$sec.toggle(match);
// 			if (match) total++;
// 		});
// 		var $c = $("#admin-user-search-count");
// 		if (q) { $c.text(total + " user" + (total !== 1 ? "s" : "") + " found").show(); }
// 		else   { $c.hide(); }
// 		$("#admin-user-search-clear").toggle(q.length > 0);
// 	}

// 	function build_note_html() {
// 		var contacts = [
// 			["Rakesh Ahuja",        "rakesh.ahuja@azimpremjifoundation.org",      "+91 7022068106"],
// 			["Saravana G",          "saravana.g@azimpremjifoundation.org",        "+91 9380861952"],
// 			["Augustin Moses R",    "augustin.moses@azimpremjifoundation.org",    "+91 8667719594"],
// 			["Mercy Selvanayagi R", "mercy.selvanayagi@azimpremjifoundation.org", "+91 9047828687"],
// 			["Mahaveer Ram P",      "mahaveer.p@azimpremjifoundation.org",        "+91 8825879412"]
// 		];
// 		var cards = contacts.map(function (c) {
// 			return '<div class="contact-card">' +
// 				'<div class="contact-avatar">' + initials(c[0]) + '</div>' +
// 				'<div class="contact-info">' +
// 				'<div class="contact-name">' + esc(c[0]) + '</div>' +
// 				'<div class="contact-detail"><i class="fa fa-envelope"></i><span>' + esc(c[1]) + '</span></div>' +
// 				'<div class="contact-detail"><i class="fa fa-phone"></i><span>' + esc(c[2]) + '</span></div>' +
// 				'</div></div>';
// 		}).join("");
// 		return '<div class="note-warning">' +
// 			'<div class="note-left-bar"></div>' +
// 			'<div class="note-inner">' +
// 			'<div class="note-header">' +
// 			'<div class="note-icon-ring"><i class="fa fa-exclamation"></i></div>' +
// 			'<div>' +
// 			'<div class="note-badge"><span class="note-badge-dot"></span>&nbsp;IMPORTANT</div>' +
// 			'<div class="note-title">Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below. If you notice any discrepancies, contact the support team immediately.</div>' +
// 			'</div></div>' +
// 			'<div class="note-divider"></div>' +
// 			'<div class="contact-wrapper">' + cards + '</div>' +
// 			'</div></div>';
// 	}

// 	/* Serial number badge — alternates style per visible row index */
// 	function sl_badge(idx) {
// 		return idx % 2 === 0
// 			? '<span class="sl-badge-odd">' + (idx + 1) + '</span>'
// 			: '<span class="sl-badge-even">' + (idx + 1) + '</span>';
// 	}

// 	function build_table_html(rows, safeId) {
// 		var COLS = [
// 			["unit",                    "Unit"                    ],
// 			["unit_description",        "Unit Description"        ],
// 			["cost_center",             "Cost Center"             ],
// 			["cost_center_description", "Cost Center Description" ],
// 			["location_code",           "Location Code"           ],
// 			["location_description",    "Location Description"    ]
// 		];
// 		var headers = COLS.map(function (c) { return "<th>" + c[1] + "</th>"; }).join("");
// 		var bodyRows = rows.map(function (row, i) {
// 			var da =
// 				'data-unit="'                    + esc(row.unit || "")                    + '" ' +
// 				'data-unit-description="'        + esc(row.unit_description || "")        + '" ' +
// 				'data-cost-center="'             + esc(row.cost_center || "")             + '" ' +
// 				'data-cost-center-description="' + esc(row.cost_center_description || "") + '" ' +
// 				'data-location-code="'           + esc(row.location_code || "")           + '" ' +
// 				'data-location-description="'    + esc(row.location_description || "")    + '"';
// 			var cells = COLS.map(function (c) { return "<td>" + esc(row[c[0]] || "") + "</td>"; }).join("");
// 			return '<tr ' + da + '><td class="cb-cell"><input type="checkbox" class="row-select-cb"></td><td>' + sl_badge(i) + '</td>' + cells + '</tr>';
// 		}).join("");
// 		return '<div class="table-wrapper">' +
// 			'<table class="mis-table" data-safe-id="' + safeId + '">' +
// 			'<thead><tr>' +
// 			'<th class="cb-cell"><input type="checkbox" class="bulk-all-cb" data-safe-id="' + safeId + '"></th>' +
// 			'<th>Sl. No.</th>' + headers +
// 			'</tr></thead>' +
// 			'<tbody>' + bodyRows + '</tbody>' +
// 			'</table></div>';
// 	}

// 	/* ============================================================
// 	   DOWNLOAD
// 	============================================================ */
// 	function run_download($btn, userEmail, safeId) {
// 		var selected      = (safeId && safeId !== "null") ? get_selected_rows(safeId) : [];
// 		var entityDataArg = selected.length ? JSON.stringify(selected) : null;

// 		reset_btn($btn, true, "Downloading...");
// 		Loader.show("Generating your template...");

// 		var pct = 0;
// 		var timer = setInterval(function () {
// 			pct = Math.min(pct + (pct < 40 ? 3 : pct < 70 ? 1.5 : 0.4), 84);
// 			Loader.setProgress(pct);
// 		}, 300);

// 		function on_done(success) {
// 			clearInterval(timer);
// 			if (success) {
// 				Loader.setProgress(100);
// 				Loader.setText("Download ready!");
// 				setTimeout(function () {
// 					Loader.hide();
// 					reset_btn($btn, false);
// 					if (safeId) deselect_all(safeId);
// 				}, 800);
// 			} else {
// 				Loader.hide();
// 				reset_btn($btn, false);
// 			}
// 		}

// 		frappe.call({
// 			method: "annual_budget.api.export_reports.start_budget_template_generation",
// 			args  : { user: userEmail, entity_data: entityDataArg },
// 			callback: function () {
// 				clearInterval(timer);
// 				Loader.setText("Fetching your template...");
// 				pct   = 30;
// 				timer = setInterval(function () { pct = Math.min(pct + 0.3, 84); Loader.setProgress(pct); }, 400);

// 				var polling = false;
// 				var stopped = false;

// 				var pollTimer = setInterval(function () {
// 					if (polling || stopped) return;
// 					polling = true;
// 					fetch(
// 						"/api/method/annual_budget.api.export_reports.download_generated_template?user=" + encodeURIComponent(userEmail),
// 						{ headers: { "X-Frappe-CSRF-Token": frappe.csrf_token } }
// 					)
// 					.then(function (resp) {
// 						if (!resp.ok) { polling = false; throw new Error("Server returned " + resp.status); }
// 						var ct = resp.headers.get("content-type") || "";
// 						if (ct.indexOf("application/json") !== -1) {
// 							return resp.json().then(function () { polling = false; Loader.setText("Still generating, please wait..."); });
// 						}
// 						stopped = true;
// 						clearInterval(pollTimer);
// 						clearInterval(timer);
// 						Loader.setProgress(95);
// 						Loader.setText("Preparing file...");
// 						var disp     = resp.headers.get("Content-Disposition") || "";
// 						var match    = disp.match(/filename[^;=\n]*=["']?([^"';\n]+)/);
// 						var filename = match ? decodeURIComponent(match[1].trim()) : "Budget_Import_Template.xlsx";
// 						return resp.blob().then(function (blob) {
// 							var url = URL.createObjectURL(blob);
// 							var a   = document.createElement("a");
// 							a.href = url; a.download = filename;
// 							document.body.appendChild(a); a.click(); a.remove();
// 							setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
// 							on_done(true);
// 						});
// 					})
// 					.catch(function (err) {
// 						if (stopped) return;
// 						stopped = true;
// 						clearInterval(pollTimer); clearInterval(timer);
// 						on_done(false);
// 						frappe.msgprint({ title: "Download Failed", message: "Could not download the template.<br><small>" + err.message + "</small>", indicator: "red" });
// 					});
// 				}, 3000);
// 			},
// 			error: function () {
// 				clearInterval(timer); on_done(false);
// 				frappe.msgprint({ title: "Error", message: "Could not start template generation. Please try again.", indicator: "red" });
// 			}
// 		});
// 	}

// 	function check_and_download($btn, userEmail, isAdmin) {
// 		reset_btn($btn, true, "Checking...");
// 		frappe.call({
// 			method : "frappe.client.get_value",
// 			args   : { doctype: "Finance user access", filters: { user: userEmail }, fieldname: "import_template_id" },
// 			callback: function (r) {
// 				var tid = r.message && r.message.import_template_id;
// 				if (!tid) {
// 					reset_btn($btn, false);
// 					show_apf_modal({
// 						title    : '<i class="fa fa-exclamation-triangle"></i> ' + (isAdmin ? "Template Not Configured" : "Import Template Missing"),
// 						icon     : "fa-exclamation-triangle",
// 						iconColor: isAdmin ? "#e67e22" : "#e74c3c",
// 						text     : isAdmin ? "No Import Template is linked for this user account." : "Import Template is not configured for this account.",
// 						sub      : isAdmin
// 							? "The <b>import_template_id</b> field in <b>Finance User Access</b> is empty for <b>" + esc(userEmail) + "</b>. Please assign a valid Import Template before retrying."
// 							: "Please contact your administrator to link an <b>Import Template</b> in <b>Finance User Access</b> before downloading.",
// 						buttons  : [{ label: '<i class="fa fa-times"></i> Close', cls: "btn-default", onClick: hide_apf_modal }]
// 					});
// 					return;
// 				}
// 				if (isAdmin) {
// 					run_download($btn, userEmail, null);
// 				} else {
// 					reset_btn($btn, false);
// 					show_apf_modal({
// 						title       : '<i class="fa fa-download"></i> Confirm Download',
// 						icon        : "fa-exclamation-triangle",
// 						iconColor   : "#e74c3c",
// 						text        : "Please carefully review and validate all allocated Units, Cost Centers, and Location Codes before downloading.",
// 						sub         : "Do not proceed unless everything has been reviewed and confirmed.",
// 						showCheckbox: true,
// 						buttons     : [
// 							{ label: '<i class="fa fa-times"></i> Cancel', cls: "btn-default", onClick: hide_apf_modal },
// 							{ id: "apf-modal-proceed", label: '<i class="fa fa-download"></i> Proceed to Download', cls: "btn-primary", disabled: true,
// 							  onClick: function () { hide_apf_modal(); run_download($btn, userEmail, null); } }
// 						]
// 					});
// 				}
// 			},
// 			error: function () {
// 				reset_btn($btn, false);
// 				frappe.msgprint({ title: "Check Failed", message: "Could not verify the Import Template. Please try again.", indicator: "red" });
// 			}
// 		});
// 	}

// 	/* ============================================================
// 	   RENDER CONTENT
// 	============================================================ */
// 	function render_content(container, data) {
// 		var roles                = Array.isArray(frappe.user_roles) ? frappe.user_roles : [];
// 		var isFinanceCoordinator = roles.indexOf("Finance Unit Coordinator") !== -1;
// 		var isSystemManager      = roles.indexOf("System Manager") !== -1;
// 		var isFinanceAdmin       = roles.indexOf("Finance Admin") !== -1;
// 		var needsModal           = isFinanceCoordinator && !isSystemManager && !isFinanceAdmin;
// 		var isCollapsible        = isSystemManager || isFinanceAdmin;

// 		var grouped = {};
// 		data.forEach(function (row) {
// 			if (!grouped[row.user]) {
// 				grouped[row.user] = { user_fullname: row.user_fullname || "", email: row.user, rows: [] };
// 			}
// 			grouped[row.user].rows.push(row);
// 		});

// 		container.empty();

// 		/* admin global user search */
// 		if (isCollapsible) {
// 			container.append(
// 				'<div class="global-user-search-wrap">' +
// 				'<div class="gus-label"><i class="fa fa-users"></i> Search User</div>' +
// 				'<div class="gus-inner">' +
// 				'<div class="gus-icon-pill"><i class="fa fa-search"></i></div>' +
// 				'<input type="text" id="admin-user-search" class="gus-input" placeholder="Search by name or email..." autocomplete="off"/>' +
// 				'<div id="admin-user-search-clear" class="gus-clear" title="Clear" style="display:none;">&#10005;</div>' +
// 				'</div>' +
// 				'<div id="admin-user-search-count" class="gus-count" style="display:none;"></div>' +
// 				'</div>'
// 			);
// 		}

// 		Object.keys(grouped).forEach(function (key) {
// 			var userData    = grouped[key];
// 			var displayName = userData.user_fullname || userData.email;
// 			var rowCount    = userData.rows.length;
// 			var safeId      = userData.email.replace(/[^a-z0-9]/gi, "_");
// 			var cbId        = "expand-cb-" + safeId;

// 			var expandHtml = isCollapsible
// 				? '<div class="expand-toggle-wrap">' +
// 				  '<label class="expand-toggle-label" for="' + cbId + '">' +
// 				  '<input type="checkbox" id="' + cbId + '" class="expand-toggle-cb">' +
// 				  '<span class="expand-toggle-btn">Expand</span>' +
// 				  '</label>' +
// 				  '<span class="expand-row-count">' + rowCount + " row" + (rowCount !== 1 ? "s" : "") + '</span>' +
// 				  '</div>'
// 				: "";

// 			/*
// 			 * Layout when needsModal (Finance Coordinator):
// 			 *   profile-card  ──┐ blue border
// 			 *   tip-banner    ──┘ blue bottom rounded
// 			 *   note-warning  ── amber left bar, borderless top
// 			 *   section-bridge── gradient connector
// 			 *   tbl-card      ── blue border, rounded bottom
// 			 *
// 			 * Layout when !needsModal (Admin):
// 			 *   profile-card
// 			 *   tip-banner
// 			 *   section-spacer  (small gap)
// 			 *   tbl-card
// 			 */

// 			var $section = $(
// 				'<div class="user-section" data-name="' + esc(displayName.toLowerCase()) + '" data-email="' + esc(userData.email.toLowerCase()) + '">' +

// 				/* profile card */
// 				'<div class="profile-card ' + (isCollapsible ? "profile-collapsible" : "") + '">' +
// 				'<div class="profile-left">' +
// 				'<div class="uhi-avatar">' + esc(initials(displayName)) + '</div>' +
// 				'<div class="uhi-info">' +
// 				'<div class="user-name">' + esc(displayName) + '</div>' +
// 				'<div class="user-email">' + esc(userData.email) + '</div>' +
// 				'</div></div>' +
// 				'<div class="profile-right">' + expandHtml + '</div>' +
// 				'</div>' +

// 				/* tip banner */
// 				'<div class="dl-tip-banner">' +
// 				'<div class="dl-tip-icon-wrap"><i class="fa fa-info-circle"></i></div>' +
// 				'<div class="dl-tip-text">' +
// 				'<strong>How to download</strong> &mdash; Click <span class="dl-tip-em">Download all</span> to get the full template, or tick specific rows and the button will switch to <span class="dl-tip-em">Download selected</span>.' +
// 				'</div>' +
// 				'<span class="dl-tip-close" title="Dismiss">&times;</span>' +
// 				'</div>' +

// 				/* user body */
// 				'<div class="user-body" style="display:' + (isCollapsible ? "none" : "block") + ';">' +
// 				'<div class="note-slot"></div>' +
// 				'<div class="connector-slot"></div>' +
// 				'<div class="tbl-card">' +
// 				'<div class="tbl-action-bar">' +
// 				'<div class="tbl-bar-left">' +
// 				'<div class="tbl-search-inner">' +
// 				'<div class="tbl-search-icon-pill"><i class="fa fa-search"></i></div>' +
// 				'<input type="text" id="tbl-search-' + safeId + '" class="tbl-search-input" data-safe-id="' + safeId + '" placeholder="Search units, cost centers, locations..." autocomplete="off"/>' +
// 				'<div id="tbl-clear-' + safeId + '" class="tbl-search-clear" data-safe-id="' + safeId + '" title="Clear" style="display:none;">&#10005;</div>' +
// 				'</div>' +
// 				'<span id="tbl-count-' + safeId + '" class="tbl-search-count" style="display:none;"></span>' +
// 				'</div>' +
// 				'<div class="tbl-bar-right">' +
// 				'<label class="tbl-bulk-label" title="Select / deselect all visible rows">' +
// 				'<input type="checkbox" id="bulk-cb-' + safeId + '" class="bulk-all-cb" data-safe-id="' + safeId + '">' +
// 				'<span class="tbl-bulk-text" id="bulk-text-' + safeId + '">Select all</span>' +
// 				'</label>' +
// 				'<span class="tbl-sel-badge" id="tbl-sel-badge-' + safeId + '" style="display:none;"></span>' +
// 				'<button class="tbl-desel-btn" data-safe-id="' + safeId + '" style="display:none;"><i class="fa fa-times"></i> Deselect all</button>' +
// 				'<div class="button-container"></div>' +
// 				'</div></div>' +
// 				'<div class="table-slot"></div>' +
// 				'</div>' + /* end tbl-card */
// 				'</div></div>'
// 			);

// 			container.append($section);

// 			/* note box + gap */
// 			if (needsModal) {
// 				$section.find(".note-slot").html(build_note_html());
// 				$section.find(".connector-slot").html('<div class="note-to-table-gap"></div>');
// 			} else {
// 				$section.find(".connector-slot").html('<div class="section-spacer"></div>');
// 			}

// 			$section.find(".table-slot").html(build_table_html(userData.rows, safeId));

// 			/* expand/collapse */
// 			if (isCollapsible) {
// 				$section.find(".expand-toggle-cb").on("change", function () {
// 					var $body = $section.find(".user-body");
// 					var $card = $section.find(".profile-card");
// 					var $txt  = $section.find(".expand-toggle-btn");
// 					if (this.checked) {
// 						$body.slideDown(200); $card.addClass("is-open"); $txt.text("Collapse");
// 					} else {
// 						$body.slideUp(200); $card.removeClass("is-open"); $txt.text("Expand");
// 						run_table_search(safeId, ""); deselect_all(safeId);
// 					}
// 				});
// 			}

// 			/* download button */
// 			(function (sid, email, admin) {
// 				var $dlBtn = $(
// 					'<button class="dl-btn-main dl-btn">' +
// 					'<i class="fa fa-download dl-btn-icon"></i>' +
// 					'<div class="dl-btn-body">' +
// 					'<span class="dl-btn-label" id="dl-lbl-' + sid + '">Download all</span>' +
// 					'<span class="dl-btn-count" id="dl-cnt-' + sid + '">' + rowCount + ' rows \u00b7 full template</span>' +
// 					'</div></button>'
// 				);
// 				$section.find(".tbl-bar-right .button-container").append($dlBtn);
// 				$dlBtn.on("click", function () {
// 					var anySelected = $(".mis-table[data-safe-id='" + sid + "'] .row-select-cb:checked").length > 0;
// 					if (anySelected) { show_review_modal(sid, email); }
// 					else             { check_and_download($(this), email, admin); }
// 				});
// 			})(safeId, userData.email, !needsModal);
// 		});

// 		/* checkbox events */
// 		$(document)
// 			.off(".rowSelect")
// 			.on("change.rowSelect", ".bulk-all-cb", function () {
// 				var sid     = $(this).data("safe-id");
// 				var checked = this.checked;
// 				$(".mis-table[data-safe-id='" + sid + "'] tbody tr:visible").each(function () {
// 					$(this).find(".row-select-cb").prop("checked", checked);
// 					$(this).toggleClass("row-selected", checked);
// 				});
// 				sync_bulk_cb(sid);
// 				update_dl_btn_state(sid);
// 				update_toolbar_actions(sid);
// 			})
// 			.on("change.rowSelect", ".row-select-cb", function () {
// 				var $row = $(this).closest("tr");
// 				var sid  = $(this).closest(".mis-table").data("safe-id");
// 				$row.toggleClass("row-selected", this.checked);
// 				sync_bulk_cb(sid);
// 				update_dl_btn_state(sid);
// 				update_toolbar_actions(sid);
// 			});

// 		/* deselect */
// 		$(document)
// 			.off(".selSubmit")
// 			.on("click.selSubmit", ".tbl-desel-btn", function () {
// 				deselect_all($(this).data("safe-id"));
// 			});

// 		/* per-table search */
// 		$(document)
// 			.off(".tblSearch")
// 			.on("input.tblSearch", ".tbl-search-input", function () {
// 				run_table_search($(this).data("safe-id"), this.value);
// 			})
// 			.on("click.tblSearch", ".tbl-search-clear", function () {
// 				var sid = $(this).data("safe-id");
// 				$("#tbl-search-" + sid).val("");
// 				run_table_search(sid, "");
// 			});

// 		/* dismiss tip banner */
// 		$(document)
// 			.off(".tipDismiss")
// 			.on("click.tipDismiss", ".dl-tip-close", function () {
// 				$(this).closest(".dl-tip-banner").slideUp(200);
// 			});

// 		/* admin user search */
// 		if (isCollapsible) {
// 			$(document)
// 				.off(".adminUserSearch")
// 				.on("input.adminUserSearch", "#admin-user-search", function () { run_user_search(this.value); })
// 				.on("click.adminUserSearch", "#admin-user-search-clear", function () {
// 					$("#admin-user-search").val(""); run_user_search("");
// 				});
// 			$("#admin-user-search-clear").hide();
// 		}
// 	}

// 	/* ============================================================
// 	   INIT
// 	============================================================ */
// 	$container.html('<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading Data...</div>');

// 	frappe.call({
// 		method  : "annual_budget.api.filter_options.get_user_mappings",
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) {
// 				$container.html('<div class="empty-state"><i class="fa fa-inbox"></i> No Data Found</div>');
// 				return;
// 			}
// 			render_content($container, r.message);
// 		}
// 	});

// }; /* end on_page_load */




// frappe.pages["import-template"].on_page_load = function (wrapper) {

// 	frappe.ui.make_app_page({
// 		parent       : wrapper,
// 		title        : "Budget Import Template",
// 		single_column: true
// 	});

// 	var $container = $(wrapper).find(".layout-main-section");
// 	$container.addClass("budget-import-wrapper");

// 	/* ============================================================
// 	   STYLES
// 	============================================================ */
// 	if (!document.getElementById("allocation-style")) {
// 		var style = document.createElement("style");
// 		style.id  = "allocation-style";
// 		var rules = [
// 			/* ── wrapper ── */
// 			".budget-import-wrapper{padding:24px;background:#f7f9fb;min-height:100vh;box-sizing:border-box;}",

// 			/* ── loading / empty ── */
// 			".loading-state,.empty-state{text-align:center;padding:60px 20px;font-size:15px;font-weight:600;color:#0076B6;}",
// 			".loading-state i,.empty-state i{font-size:28px;margin-bottom:10px;display:block;}",

// 			/* ── user section ── */
// 			".user-section{margin-bottom:24px;background:#fff;border:1px solid #dcdcdc;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.06);overflow:hidden;}",

// 			/* ── profile card ── */
// 			".profile-card{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#F4F9FD;border-bottom:1px solid #dcdcdc;gap:12px;}",
// 			".profile-collapsible{border-radius:8px;}",
// 			".profile-collapsible.is-open{border-radius:8px 8px 0 0;}",
// 			".profile-left{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}",
// 			".profile-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}",
// 			".uhi-avatar{width:40px;height:40px;border-radius:50%;background:#0076B6;color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px rgba(0,118,182,0.3);}",
// 			".uhi-info{display:flex;flex-direction:column;gap:2px;min-width:0;}",
// 			".user-name{font-size:14px;font-weight:700;color:#003B63;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
// 			".user-email{font-size:12px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",

// 			/* ── expand toggle ── */
// 			".expand-toggle-wrap{display:flex;align-items:center;gap:8px;}",
// 			".expand-toggle-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;padding:5px 12px;border:1px solid #aaa;border-radius:6px;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;}",
// 			".expand-toggle-label:hover{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.08);}",
// 			".expand-toggle-cb{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
// 			".expand-toggle-btn{font-size:12px;font-weight:600;color:#0076B6;white-space:nowrap;}",
// 			".expand-row-count{font-size:11px;font-weight:600;color:#fff;background:#0076B6;padding:2px 9px;border-radius:99px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,118,182,0.3);}",

// 			/* ── tip banner ── */
// 			".dl-tip-banner{display:flex;align-items:flex-start;gap:10px;padding:10px 16px;background:#EBF4FF;border-bottom:1px solid #dcdcdc;}",
// 			".dl-tip-icon-wrap{width:22px;height:22px;border-radius:50%;background:#0076B6;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}",
// 			".dl-tip-icon-wrap i{font-size:10px;color:#fff;}",
// 			".dl-tip-text{font-size:12px;color:#1a4f72;line-height:1.65;flex:1;}",
// 			".dl-tip-text strong{color:#003B63;font-weight:600;}",
// 			".dl-tip-em{font-weight:600;color:#0076B6;}",
// 			".dl-tip-close{font-size:18px;color:#7a9ab0;cursor:pointer;line-height:1;flex-shrink:0;padding:0 2px;margin-top:-1px;}",
// 			".dl-tip-close:hover{color:#003B63;}",

// 			/* ── user-body ── */
// 			".user-body{padding:0;}",

// 			/* ── NOTE / IMPORTANT banner ── */
// 			".note-warning{background:#fff;border-bottom:1px solid #dcdcdc;display:flex;overflow:hidden;}",
// 			".note-left-bar{width:5px;background:#f4b400;flex-shrink:0;}",
// 			".note-inner{padding:18px 20px;flex:1;min-width:0;box-sizing:border-box;}",
// 			".note-header{display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;}",
// 			".note-icon-ring{width:34px;height:34px;border-radius:50%;background:#FFF3E6;border:1.5px solid #f4b400;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}",
// 			".note-icon-ring i{font-size:14px;color:#e67e22;}",
// 			".note-badge{display:inline-flex;align-items:center;gap:5px;background:#f4b400;color:#5c3800;font-size:10px;font-weight:700;padding:2px 9px;border-radius:99px;letter-spacing:0.6px;margin-bottom:5px;}",
// 			".note-badge-dot{width:5px;height:5px;border-radius:50%;background:#5c3800;display:inline-block;animation:softBlink 1.5s ease-in-out infinite;}",
// 			"@keyframes softBlink{0%,100%{opacity:1;}50%{opacity:0.3;}}",
// 			".note-title{font-size:13px;font-weight:500;color:#3d2800;line-height:1.65;}",
// 			".note-divider{height:1px;background:#fde68a;margin:14px 0;}",

// 			/* ── contact grid ── */
// 			".contact-wrapper{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;}",

// 			/* ── contact card — REDESIGNED ──
// 			   Layout: avatar + name (top row) → amber divider → email row → phone row
// 			   Email gets the full card width so it never needs to wrap or cut.        */
// 			".contact-card{background:#FFF3E6;border:1px solid #f0d97a;border-radius:7px;padding:14px 15px;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;}",
// 			".contact-card:hover{border-color:#e0a800;box-shadow:0 3px 8px rgba(244,180,0,0.18);}",

// 			/* top row: avatar + name */
// 			".cc-top{display:flex;align-items:center;gap:10px;margin-bottom:10px;}",
// 			".cc-avatar{width:36px;height:36px;min-width:36px;border-radius:50%;background:#f4b400;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#5c3800;flex-shrink:0;box-shadow:0 2px 5px rgba(244,180,0,0.3);}",
// 			".cc-name{font-size:13px;font-weight:700;color:#3d2800;line-height:1.35;word-break:break-word;}",

// 			/* amber hairline divider */
// 			".cc-divider{height:1px;background:#f0d97a;margin-bottom:10px;}",

// 			/* detail rows — icon pill + value, full card width */
// 			".cc-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}",
// 			".cc-row:last-child{margin-bottom:0;}",
// 			".cc-icon-pill{width:20px;height:20px;min-width:20px;border-radius:50%;background:#f4b400;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
// 			".cc-icon-pill i{font-size:9px;color:#5c3800;}",

// 			/* value text — single line, ellipsis on extreme overflow, full remaining width */
// 			".cc-val{font-size:13.5px;color:#7a5200;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;line-height:1.4;}",
// 			".cc-val.email{font-size:13px;letter-spacing:-0.1px;}",

// 			/* ── gap between note and table ── */
// 			".note-to-table-gap{height:20px;background:#f7f9fb;}",
// 			".section-spacer{height:20px;background:#f7f9fb;}",

// 			/* ── table card ── */
// 			".tbl-card{border-top:1px solid #dcdcdc;border-radius:0 0 8px 8px;overflow:hidden;background:#fff;}",

// 			/* ── action bar ── */
// 			".tbl-action-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:10px 14px;background:#f7f9fb;border-bottom:1px solid #dcdcdc;}",
// 			".tbl-bar-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1;min-width:0;}",
// 			".tbl-bar-right{display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap;}",

// 			/* ── search ── */
// 			".tbl-search-inner{position:relative;display:flex;align-items:center;width:300px;max-width:100%;}",
// 			".tbl-search-icon-pill{position:absolute;left:9px;width:20px;height:20px;background:#0076B6;border-radius:50%;display:flex;align-items:center;justify-content:center;pointer-events:none;flex-shrink:0;}",
// 			".tbl-search-icon-pill i{font-size:9px;color:#fff;}",
// 			".tbl-search-input{width:100%;padding:7px 34px 7px 36px;border:1px solid #aaa;border-radius:6px;font-size:13px;color:#333;outline:none;background:#fff;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box;}",
// 			".tbl-search-input::placeholder{color:#aaa;}",
// 			".tbl-search-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.10);}",
// 			".tbl-search-clear{position:absolute;right:9px;width:18px;height:18px;border-radius:50%;background:#d0dde8;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;color:#4a6070;font-weight:700;transition:background 0.15s,color 0.15s;}",
// 			".tbl-search-clear:hover{background:#c0392b;color:#fff;}",
// 			".tbl-search-count{font-size:11px;color:#0076B6;font-weight:600;white-space:nowrap;display:flex;align-items:center;gap:4px;}",
// 			".tbl-search-count::before{content:'';display:inline-block;width:5px;height:5px;border-radius:50%;background:#0076B6;}",

// 			/* ── bulk select ── */
// 			".tbl-bulk-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;padding:5px 10px;border:1px solid #aaa;border-radius:6px;background:#fff;transition:border-color 0.15s;}",
// 			".tbl-bulk-label:hover{border-color:#0076B6;}",
// 			".tbl-bulk-label input{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
// 			".tbl-bulk-text{font-size:12px;font-weight:600;color:#444;white-space:nowrap;}",

// 			/* ── selection badge ── */
// 			".tbl-sel-badge{font-size:12px;font-weight:600;color:#fff;background:#0076B6;padding:3px 10px;border-radius:99px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,118,182,0.3);}",

// 			/* ── deselect button ── */
// 			".tbl-desel-btn{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;border:1px solid #aaa;background:#fff;font-size:12px;font-weight:600;color:#444;cursor:pointer;transition:all 0.15s;white-space:nowrap;}",
// 			".tbl-desel-btn:hover{border-color:#c0392b;color:#c0392b;}",

// 			/* ── download button ── */
// 			".dl-btn-main{display:inline-flex;align-items:center;gap:10px;padding:6px 14px;border-radius:6px;cursor:pointer;border:1px solid #0076B6;background:#0076B6;transition:background 0.15s ease,box-shadow 0.15s ease;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.12);}",
// 			".dl-btn-main:hover{background:#005f94;border-color:#005f94;box-shadow:0 3px 8px rgba(0,118,182,0.35);}",
// 			".dl-btn-main:active{background:#004f7a;border-color:#004f7a;box-shadow:none;}",
// 			".dl-btn-main:disabled{opacity:0.55;cursor:not-allowed;box-shadow:none;}",
// 			".dl-btn-icon{font-size:15px;color:#fff;flex-shrink:0;}",
// 			".dl-btn-body{display:flex;flex-direction:column;align-items:flex-start;gap:1px;}",
// 			".dl-btn-label{font-size:13px;font-weight:600;color:#fff;line-height:1.2;}",
// 			".dl-btn-count{font-size:11px;color:rgba(255,255,255,0.8);line-height:1.3;}",
// 			".dl-cnt-sel{color:#fff;font-weight:700;}",
// 			".dl-btn-main-sel{border-color:#1a8a4a;background:#1a8a4a;}",
// 			".dl-btn-main-sel:hover{background:#145e32;border-color:#145e32;box-shadow:0 3px 8px rgba(26,138,74,0.35);}",
// 			".dl-btn-main-sel .dl-btn-icon,.dl-btn-main-sel .dl-btn-label{color:#fff;}",
// 			".dl-btn-main-sel .dl-btn-count{color:rgba(255,255,255,0.8);}",

// 			/* ── TABLE ── */
// 			".table-wrapper{overflow-x:auto;-webkit-overflow-scrolling:touch;}",
// 			".mis-table{width:100%;border-collapse:collapse;font-size:13px;min-width:580px;}",
// 			".mis-table thead tr{background:#0076B6;}",
// 			".mis-table th{color:#fff;font-weight:700;padding:9px 10px;text-align:center;white-space:nowrap;font-size:12px;border:1px solid #ddd;}",
// 			".mis-table tbody tr:nth-child(odd) td{background:#fff;}",
// 			".mis-table tbody tr:nth-child(even) td{background:#F4F9FD;}",
// 			".mis-table tbody td{padding:8px 10px;border:1px solid #ddd;text-align:center;color:#333;font-size:13px;vertical-align:middle;}",
// 			".mis-table tbody tr:nth-child(odd) td:first-child{border-left:3px solid transparent;}",
// 			".mis-table tbody tr:nth-child(even) td:first-child{border-left:3px solid #b8d9f5;}",
// 			".mis-table tbody tr:hover td{background:#daeeff !important;}",
// 			".mis-table tbody tr:hover td:first-child{border-left-color:#0076B6 !important;}",
// 			".mis-table tbody tr.row-selected td{background:#cce8fd !important;border-color:#99cef5 !important;}",
// 			".mis-table tbody tr.row-selected td:first-child{border-left:3px solid #0076B6 !important;}",
// 			".sl-badge-odd{display:inline-block;background:#e8f1fa;color:#0076B6;font-weight:700;border-radius:99px;padding:1px 8px;font-size:11.5px;min-width:28px;}",
// 			".sl-badge-even{display:inline-block;background:#0076B6;color:#fff;font-weight:700;border-radius:99px;padding:1px 8px;font-size:11.5px;min-width:28px;}",
// 			".cb-cell{width:36px;min-width:36px;text-align:center;padding:6px !important;}",
// 			".row-select-cb,.bulk-all-cb{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;vertical-align:middle;}",

// 			/* ── admin global search ── */
// 			".global-user-search-wrap{margin-bottom:20px;padding:14px 16px;background:#f7f9fb;border:1px solid #dcdcdc;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.06);}",
// 			".gus-label{font-size:11px;font-weight:700;color:#0076B6;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:8px;}",
// 			".gus-label i{margin-right:6px;}",
// 			".gus-inner{position:relative;display:flex;align-items:center;max-width:460px;}",
// 			".gus-icon-pill{position:absolute;left:10px;width:20px;height:20px;background:#0076B6;border-radius:50%;display:flex;align-items:center;justify-content:center;pointer-events:none;}",
// 			".gus-icon-pill i{font-size:9px;color:#fff;}",
// 			".gus-input{width:100%;padding:7px 32px 7px 38px;border:1px solid #aaa;border-radius:6px;font-size:13px;color:#333;outline:none;background:#fff;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box;}",
// 			".gus-input::placeholder{color:#aaa;}",
// 			".gus-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.10);}",
// 			".gus-clear{position:absolute;right:10px;width:18px;height:18px;border-radius:50%;background:#d0dde8;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;color:#4a6070;font-weight:700;transition:background 0.15s,color 0.15s;}",
// 			".gus-clear:hover{background:#c0392b;color:#fff;}",
// 			".gus-count{margin-top:6px;font-size:12px;color:#0076B6;font-weight:600;display:flex;align-items:center;gap:4px;}",
// 			".gus-count::before{content:'';display:inline-block;width:5px;height:5px;border-radius:50%;background:#0076B6;}",

// 			/* ── review modal ── */
// 			"#rev-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:99999;padding:15px;}",
// 			".rev-modal-box{background:#fff;width:700px;max-width:100%;max-height:90vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,0.25);display:flex;flex-direction:column;overflow:hidden;}",
// 			".rev-modal-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#F4F9FD;border-bottom:1px solid #dcdcdc;font-weight:700;font-size:15px;color:#003B63;flex-shrink:0;}",
// 			".rev-modal-title i{margin-right:8px;color:#0076B6;}",
// 			"#rev-modal-close{cursor:pointer;font-size:22px;color:#666;line-height:1;}",
// 			"#rev-modal-close:hover{color:#003B63;}",
// 			".rev-modal-body{padding:18px 20px;overflow-y:auto;flex:1;}",
// 			".rev-warning-banner{display:flex;align-items:flex-start;gap:12px;background:#FFF3E6;border:1px solid #f4b400;border-left:4px solid #f4b400;border-radius:6px;padding:12px 16px;margin-bottom:14px;}",
// 			".rev-warn-icon{font-size:20px;color:#e67e22;flex-shrink:0;margin-top:2px;}",
// 			".rev-warn-title{font-size:13px;font-weight:700;color:#5c3d00;margin-bottom:3px;}",
// 			".rev-warn-sub{font-size:12px;color:#7a5200;line-height:1.6;}",
// 			".rev-count-badge{display:inline-block;font-size:12px;font-weight:600;color:#fff;background:#0076B6;padding:3px 12px;border-radius:99px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,118,182,0.3);}",
// 			".rev-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:14px;border-radius:6px;border:1px solid #ddd;}",
// 			".rev-table{width:100%;border-collapse:collapse;font-size:12px;min-width:500px;}",
// 			".rev-table thead tr{background:#0076B6;}",
// 			".rev-table th{color:#fff;font-weight:700;padding:8px 10px;text-align:center;white-space:nowrap;border:1px solid #ddd;}",
// 			".rev-table tbody tr:nth-child(odd) td{background:#fff;}",
// 			".rev-table tbody tr:nth-child(even) td{background:#F4F9FD;}",
// 			".rev-table td{padding:7px 10px;border:1px solid #ddd;text-align:center;color:#333;}",
// 			".rev-table tbody tr:hover td{background:#daeeff !important;}",
// 			".rev-sl{width:36px;}",
// 			".rev-confirm-wrap{background:#f7f9fb;border:1px solid #dcdcdc;border-radius:6px;padding:12px 14px;}",
// 			".rev-confirm-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;font-size:13px;color:#333;}",
// 			".rev-confirm-label input{width:14px;height:14px;margin-top:2px;accent-color:#0076B6;flex-shrink:0;cursor:pointer;}",
// 			".rev-confirm-label i{color:#28a745;margin-right:4px;}",
// 			".rev-modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:12px 20px;border-top:1px solid #dcdcdc;flex-shrink:0;background:#f7f9fb;}",
// 			".rev-modal-footer .btn{min-width:130px;}",
// 			"#rev-btn-proceed:disabled{opacity:0.6;cursor:not-allowed;}",

// 			/* ── APF modal ── */
// 			"#apf-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:9999;padding:15px;}",
// 			".apf-modal-box{background:#fff;width:520px;max-width:100%;border-radius:8px;box-shadow:0 20px 50px rgba(0,0,0,0.2);padding:26px;}",
// 			".apf-modal-header{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:15px;margin-bottom:18px;color:#003B63;}",
// 			".apf-modal-title i{margin-right:8px;color:#0076B6;}",
// 			"#apf-modal-close{cursor:pointer;font-size:22px;color:#666;line-height:1;}",
// 			"#apf-modal-close:hover{color:#003B63;}",
// 			".apf-modal-body{text-align:center;margin-bottom:18px;}",
// 			".apf-modal-icon{font-size:38px;margin-bottom:10px;}",
// 			".apf-modal-text{font-weight:600;font-size:13px;color:#c0392b;margin-bottom:8px;line-height:1.6;}",
// 			".apf-modal-sub{font-size:12px;color:#666;margin-bottom:14px;line-height:1.6;}",
// 			".apf-checkbox-wrapper{background:#f7f9fb;padding:12px;border-radius:6px;border:1px solid #dcdcdc;font-size:13px;text-align:left;}",
// 			".apf-checkbox-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;}",
// 			".apf-checkbox-label i{color:#28a745;margin-right:4px;}",
// 			".apf-checkbox-label input{margin-top:3px;flex-shrink:0;accent-color:#0076B6;}",
// 			".apf-modal-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:14px;}",
// 			".apf-modal-footer .btn{min-width:130px;}",
// 			"#apf-modal-proceed:disabled{opacity:0.6;cursor:not-allowed;}",

// 			/* ── loader ── */
// 			"#global-loader.loader-overlay{position:fixed;inset:0;width:100vw;height:100vh;background:rgba(18,18,18,0.92);backdrop-filter:blur(6px);z-index:999999;display:none;align-items:center;justify-content:center;}",
// 			"#global-loader.loader-overlay.active{display:flex;}",
// 			".loader-box{display:flex;flex-direction:column;align-items:center;gap:16px;}",
// 			".loader-ring-wrap{position:relative;width:110px;height:110px;display:flex;align-items:center;justify-content:center;}",
// 			".loader-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);}",
// 			".loader-ring-bg{fill:none;stroke:rgba(255,255,255,0.12);stroke-width:6;}",
// 			".loader-ring-fill{fill:none;stroke:url(#ringGrad);stroke-width:6;stroke-linecap:round;stroke-dasharray:276.46;stroke-dashoffset:276.46;transition:stroke-dashoffset 0.35s ease;}",
// 			".loader-logo{width:72px;height:72px;border-radius:50%;background:#fff;padding:11px;object-fit:contain;position:relative;z-index:1;box-shadow:0 10px 30px rgba(0,0,0,0.35),0 0 0 4px rgba(255,255,255,0.08);animation:pulse 1.6s infinite ease-in-out;}",
// 			".loader-pct-inside{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:700;color:#fff;background:rgba(0,118,182,0.85);padding:1px 7px;border-radius:99px;z-index:2;white-space:nowrap;}",
// 			".loader-text{font-size:14px;color:#fff;font-weight:600;letter-spacing:0.5px;text-align:center;opacity:0.85;}",
// 			"@keyframes pulse{0%,100%{transform:scale(1);opacity:0.8;}50%{transform:scale(1.08);opacity:1;}}",
// 			".dl-anim-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;width:56px;}",
// 			".dl-arrow-track{width:22px;height:26px;overflow:hidden;position:relative;}",
// 			".dl-arrow{display:flex;flex-direction:column;align-items:center;position:absolute;left:50%;transform:translateX(-50%);animation:dl-drop 1.2s ease-in-out infinite;}",
// 			".dl-arrow-stem{width:3px;height:13px;background:#0076B6;border-radius:2px;}",
// 			".dl-arrow-head{width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #0076B6;}",
// 			"@keyframes dl-drop{0%{top:-26px;opacity:0;}30%{opacity:1;}70%{opacity:1;}100%{top:26px;opacity:0;}}",
// 			".dl-bar{width:40px;height:4px;background:#0076B6;border-radius:99px;animation:dl-bar-pulse 1.2s ease-in-out infinite;}",
// 			"@keyframes dl-bar-pulse{0%,100%{opacity:0.4;transform:scaleX(0.8);}50%{opacity:1;transform:scaleX(1);}}",
// 			".dl-dots{display:flex;gap:5px;}",
// 			".dl-dots span{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.6);animation:dl-bounce 1.2s ease-in-out infinite;}",
// 			".dl-dots span:nth-child(1){animation-delay:0s;}",
// 			".dl-dots span:nth-child(2){animation-delay:0.2s;}",
// 			".dl-dots span:nth-child(3){animation-delay:0.4s;}",
// 			"@keyframes dl-bounce{0%,80%,100%{transform:scale(1);opacity:0.5;}40%{transform:scale(1.5);opacity:1;}}",

// 			/* ================================================================
// 			   RESPONSIVE BREAKPOINTS
// 			================================================================ */

// 			/* ── ≤1280px ── */
// 			"@media(max-width:1280px){",
// 			".contact-wrapper{grid-template-columns:repeat(auto-fill,minmax(300px,1fr));}",
// 			".tbl-search-inner{width:280px;}",
// 			"}",

// 			/* ── ≤1024px ── */
// 			"@media(max-width:1024px){",
// 			".budget-import-wrapper{padding:20px;}",
// 			".contact-wrapper{grid-template-columns:repeat(auto-fill,minmax(280px,1fr));}",
// 			".tbl-search-inner{width:240px;}",
// 			".gus-inner{max-width:100%;}",
// 			"}",

// 			/* ── ≤900px ── */
// 			"@media(max-width:900px){",
// 			".budget-import-wrapper{padding:16px;}",
// 			".contact-wrapper{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;}",
// 			".tbl-search-inner{width:210px;}",
// 			".note-to-table-gap,.section-spacer{height:16px;}",
// 			".note-inner{padding:16px 18px;}",
// 			"}",

// 			/* ── ≤768px ── */
// 			"@media(max-width:768px){",
// 			".budget-import-wrapper{padding:12px;}",
// 			".profile-card{flex-wrap:wrap;gap:10px;}",
// 			".profile-right{width:100%;justify-content:flex-end;}",
// 			".tbl-action-bar{flex-direction:column;align-items:stretch;gap:8px;}",
// 			".tbl-bar-left,.tbl-bar-right{width:100%;}",
// 			".tbl-bar-right{justify-content:flex-end;}",
// 			".tbl-search-inner{width:100%;}",
// 			".dl-btn-main{width:100%;justify-content:center;}",
// 			".contact-wrapper{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}",
// 			".note-inner{padding:14px 16px;}",
// 			".note-to-table-gap,.section-spacer{height:14px;}",
// 			".rev-modal-footer{flex-wrap:wrap;gap:8px;}",
// 			".rev-modal-footer .btn{flex:1;min-width:unset;}",
// 			".apf-modal-footer{flex-wrap:wrap;gap:8px;}",
// 			".apf-modal-footer .btn{flex:1;min-width:unset;}",
// 			".mis-table{min-width:520px;}",
// 			"}",

// 			/* ── ≤600px ── */
// 			"@media(max-width:600px){",
// 			".budget-import-wrapper{padding:10px;}",
// 			".contact-wrapper{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}",
// 			".contact-card{padding:11px 12px;}",
// 			".cc-avatar{width:32px;height:32px;min-width:32px;font-size:11px;}",
// 			".cc-name{font-size:12px;}",
// 			".cc-val{font-size:12.5px;}",
// 			".cc-val.email{font-size:12px;}",
// 			".uhi-avatar{width:36px;height:36px;font-size:13px;}",
// 			".user-name{font-size:13px;}",
// 			".user-email{font-size:11px;}",
// 			".tbl-action-bar{padding:8px 10px;}",
// 			".tbl-bulk-text{display:none;}",
// 			".tbl-sel-badge{font-size:11px;}",
// 			".dl-btn-count{display:none;}",
// 			".dl-tip-text{font-size:11.5px;}",
// 			".note-badge{font-size:9px;}",
// 			".note-title{font-size:12.5px;}",
// 			".note-inner{padding:12px 13px;}",
// 			".note-to-table-gap,.section-spacer{height:12px;}",
// 			".expand-row-count{display:none;}",
// 			".mis-table{font-size:12px;min-width:460px;}",
// 			".mis-table th{padding:7px 8px;font-size:11px;}",
// 			".mis-table tbody td{padding:6px 8px;}",
// 			"}",

// 			/* ── ≤480px ── */
// 			"@media(max-width:480px){",
// 			".budget-import-wrapper{padding:8px;}",
// 			".profile-card{padding:10px 12px;}",
// 			".contact-wrapper{grid-template-columns:minmax(0,1fr);}",
// 			".contact-card{padding:12px 14px;}",
// 			".cc-avatar{width:34px;height:34px;min-width:34px;font-size:12px;}",
// 			".cc-name{font-size:13px;}",
// 			".cc-val{font-size:13px;}",
// 			".cc-val.email{font-size:12.5px;}",
// 			".tbl-bar-right{flex-direction:column;align-items:stretch;}",
// 			".tbl-desel-btn{justify-content:center;}",
// 			".tbl-bulk-label{justify-content:center;}",
// 			".expand-toggle-label{padding:4px 8px;}",
// 			".note-to-table-gap,.section-spacer{height:10px;}",
// 			".dl-tip-banner{padding:8px 12px;}",
// 			".dl-tip-text{font-size:11px;}",
// 			".mis-table{min-width:400px;font-size:11px;}",
// 			".mis-table th{padding:5px 6px;font-size:10px;}",
// 			".mis-table tbody td{padding:5px 6px;}",
// 			".rev-modal-footer{flex-direction:column;}",
// 			".rev-modal-footer .btn{width:100%;min-width:unset;}",
// 			".apf-modal-box{padding:16px;}",
// 			".apf-modal-footer{flex-direction:column;}",
// 			".apf-modal-footer .btn{width:100%;min-width:unset;}",
// 			"}",

// 			/* ── ≤360px ── */
// 			"@media(max-width:360px){",
// 			".budget-import-wrapper{padding:6px;}",
// 			".profile-card{padding:8px 10px;}",
// 			".uhi-avatar{width:32px;height:32px;font-size:12px;}",
// 			".user-name{font-size:12px;}",
// 			".user-email{font-size:10.5px;}",
// 			".contact-card{padding:10px 12px;}",
// 			".cc-avatar{width:30px;height:30px;min-width:30px;font-size:10px;}",
// 			".cc-name{font-size:12px;}",
// 			".cc-val{font-size:11px;}",
// 			".cc-val.email{font-size:10.5px;}",
// 			".note-inner{padding:10px 11px;}",
// 			".note-title{font-size:12px;}",
// 			".tbl-action-bar{padding:6px 8px;}",
// 			".mis-table{min-width:360px;font-size:10px;}",
// 			".mis-table th,.mis-table tbody td{padding:4px 5px;}",
// 			"}"
// 		];
// 		style.textContent = rules.join("");
// 		document.head.appendChild(style);
// 	}

// 	/* ============================================================
// 	   LOADER
// 	============================================================ */
// 	function init_loader() {
// 		if ($("#global-loader").length) return;
// 		$("body").append(
// 			'<div id="global-loader" class="loader-overlay">' +
// 			'<div class="loader-box">' +
// 			'<div class="loader-ring-wrap">' +
// 			'<svg class="loader-ring" viewBox="0 0 100 100">' +
// 			'<defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
// 			'<stop offset="0%" stop-color="#0076B6"/><stop offset="100%" stop-color="#00c6ff"/>' +
// 			'</linearGradient></defs>' +
// 			'<circle class="loader-ring-bg" cx="50" cy="50" r="44"/>' +
// 			'<circle class="loader-ring-fill" id="loader-ring-fill" cx="50" cy="50" r="44"/>' +
// 			'</svg>' +
// 			'<img src="/files/APF logo.png" class="loader-logo" alt="Loading">' +
// 			'<div class="loader-pct-inside" id="loader-pct">0%</div>' +
// 			'</div>' +
// 			'<div class="dl-anim-wrap">' +
// 			'<div class="dl-arrow-track"><div class="dl-arrow"><div class="dl-arrow-stem"></div><div class="dl-arrow-head"></div></div></div>' +
// 			'<div class="dl-bar"></div>' +
// 			'<div class="dl-dots"><span></span><span></span><span></span></div>' +
// 			'</div>' +
// 			'<div class="loader-text" id="loader-text-msg">Preparing download...</div>' +
// 			'</div></div>'
// 		);
// 	}

// 	function set_progress(pct) {
// 		var offset = 276.46 - (pct / 100) * 276.46;
// 		$("#loader-ring-fill").css("stroke-dashoffset", offset);
// 		$("#loader-pct").text(Math.round(pct) + "%");
// 	}

// 	var Loader = {
// 		show        : function (msg) { init_loader(); $("#loader-text-msg").text(msg || "Preparing download..."); set_progress(0); $("#global-loader").addClass("active"); },
// 		setText     : function (msg) { $("#loader-text-msg").text(msg); },
// 		setProgress : function (pct) { set_progress(pct); },
// 		hide        : function () { $("#global-loader").removeClass("active"); }
// 	};

// 	/* ============================================================
// 	   APF MODAL
// 	============================================================ */
// 	function init_apf_modal() {
// 		if ($("#apf-modal-overlay").length) return;
// 		$("body").append(
// 			'<div id="apf-modal-overlay">' +
// 			'<div class="apf-modal-box">' +
// 			'<div class="apf-modal-header">' +
// 			'<div class="apf-modal-title" id="apf-modal-title"></div>' +
// 			'<span id="apf-modal-close" title="Close">&times;</span>' +
// 			'</div>' +
// 			'<div class="apf-modal-body">' +
// 			'<div class="apf-modal-icon" id="apf-modal-icon"><i id="apf-modal-icon-i" class="fa"></i></div>' +
// 			'<div class="apf-modal-text" id="apf-modal-text"></div>' +
// 			'<div class="apf-modal-sub" id="apf-modal-sub"></div>' +
// 			'<div class="apf-checkbox-wrapper" id="apf-checkbox-wrap" style="display:none;">' +
// 			'<label class="apf-checkbox-label">' +
// 			'<input type="checkbox" id="apf-modal-checkbox">' +
// 			'<span><i class="fa fa-check-circle"></i> I confirm that I have verified all details carefully.</span>' +
// 			'</label></div></div>' +
// 			'<div class="apf-modal-footer" id="apf-modal-footer"></div>' +
// 			'</div></div>'
// 		);
// 		$(document)
// 			.off(".apfModal")
// 			.on("click.apfModal", "#apf-modal-close", hide_apf_modal)
// 			.on("click.apfModal", "#apf-modal-overlay", function (e) {
// 				if ($(e.target).is("#apf-modal-overlay")) hide_apf_modal();
// 			})
// 			.on("change.apfModal", "#apf-modal-checkbox", function () {
// 				$("#apf-modal-proceed").prop("disabled", !this.checked);
// 			});
// 	}

// 	function hide_apf_modal() {
// 		$("#apf-modal-overlay").hide();
// 		$("#apf-modal-checkbox").prop("checked", false);
// 		$("#apf-modal-proceed").prop("disabled", true);
// 	}

// 	function show_apf_modal(opts) {
// 		init_apf_modal();
// 		$("#apf-modal-title").html(opts.title || "");
// 		$("#apf-modal-icon-i")
// 			.attr("class", "fa " + (opts.icon || "fa-exclamation-triangle"))
// 			.closest(".apf-modal-icon").css("color", opts.iconColor || "#e74c3c");
// 		$("#apf-modal-text").html(opts.text || "");
// 		$("#apf-modal-sub").html(opts.sub || "");
// 		var showCb = !!opts.showCheckbox;
// 		$("#apf-checkbox-wrap").toggle(showCb);
// 		if (showCb) $("#apf-modal-checkbox").prop("checked", false);
// 		var $footer = $("#apf-modal-footer").empty();
// 		(opts.buttons || []).forEach(function (btn) {
// 			var $b = $('<button id="' + (btn.id || "") + '" class="btn ' + (btn.cls || "btn-default") + ' btn-sm">' + btn.label + '</button>').prop("disabled", !!btn.disabled);
// 			$b.on("click", function () { if (btn.onClick) btn.onClick(); });
// 			$footer.append($b);
// 		});
// 		$("#apf-modal-overlay").css("display", "flex");
// 	}

// 	/* ============================================================
// 	   REVIEW MODAL
// 	============================================================ */
// 	function init_review_modal() {
// 		if ($("#rev-modal-overlay").length) return;
// 		$("body").append(
// 			'<div id="rev-modal-overlay">' +
// 			'<div class="rev-modal-box">' +
// 			'<div class="rev-modal-header">' +
// 			'<div class="rev-modal-title"><i class="fa fa-list-alt"></i> Review Selected Items</div>' +
// 			'<span id="rev-modal-close" title="Close">&times;</span>' +
// 			'</div>' +
// 			'<div class="rev-modal-body">' +
// 			'<div class="rev-warning-banner">' +
// 			'<i class="fa fa-exclamation-triangle rev-warn-icon"></i>' +
// 			'<div><div class="rev-warn-title">Please make a note of the items listed below.</div>' +
// 			'<div class="rev-warn-sub">Keep a record of the selected Cost Centers and Location Codes to avoid duplicates when importing.</div></div>' +
// 			'</div>' +
// 			'<div class="rev-count-badge" id="rev-count-badge"></div>' +
// 			'<div class="rev-table-wrap">' +
// 			'<table class="rev-table">' +
// 			'<thead><tr><th class="rev-sl">#</th><th>Unit</th><th>Unit Description</th><th>Cost Center</th><th>Cost Center Description</th><th>Location Code</th><th>Location Description</th></tr></thead>' +
// 			'<tbody id="rev-table-body"></tbody>' +
// 			'</table></div>' +
// 			'<div class="rev-confirm-wrap">' +
// 			'<label class="rev-confirm-label">' +
// 			'<input type="checkbox" id="rev-confirm-cb">' +
// 			'<span><i class="fa fa-check-circle"></i> I have noted down the selected items and I am ready to proceed.</span>' +
// 			'</label></div></div>' +
// 			'<div class="rev-modal-footer">' +
// 			'<button id="rev-btn-cancel" class="btn btn-default btn-sm"><i class="fa fa-times"></i> Cancel</button>' +
// 			'<button id="rev-btn-proceed" class="btn btn-success btn-sm" disabled><i class="fa fa-download"></i> Proceed to Download</button>' +
// 			'</div></div></div>'
// 		);
// 		$(document)
// 			.off(".revModal")
// 			.on("click.revModal", "#rev-modal-close, #rev-btn-cancel", hide_review_modal)
// 			.on("click.revModal", "#rev-modal-overlay", function (e) {
// 				if ($(e.target).is("#rev-modal-overlay")) hide_review_modal();
// 			})
// 			.on("change.revModal", "#rev-confirm-cb", function () {
// 				$("#rev-btn-proceed").prop("disabled", !this.checked);
// 			})
// 			.on("click.revModal", "#rev-btn-proceed", function () {
// 				var $overlay = $("#rev-modal-overlay");
// 				var sid      = $overlay.data("safe-id");
// 				var email    = $overlay.data("user-email");
// 				var $section = $(".user-section").filter(function () {
// 					return $(this).data("email") === (email || "").toLowerCase();
// 				});
// 				hide_review_modal();
// 				run_download($section.find(".dl-btn-main"), email, sid);
// 			});
// 	}

// 	function hide_review_modal() {
// 		$("#rev-modal-overlay").hide();
// 		$("#rev-confirm-cb").prop("checked", false);
// 		$("#rev-btn-proceed").prop("disabled", true);
// 	}

// 	function show_review_modal(safeId, userEmail) {
// 		var selected = get_selected_rows(safeId);
// 		if (!selected.length) {
// 			frappe.msgprint({ title: "Nothing Selected", message: "Please select at least one row.", indicator: "orange" });
// 			return;
// 		}
// 		init_review_modal();
// 		var rows = selected.map(function (r, i) {
// 			return '<tr><td class="rev-sl">' + (i + 1) + '</td>' +
// 				'<td>' + esc(r.unit) + '</td>' +
// 				'<td>' + esc(r.unit_description) + '</td>' +
// 				'<td>' + esc(r.cost_center) + '</td>' +
// 				'<td>' + esc(r.cost_center_description) + '</td>' +
// 				'<td>' + esc(r.location_code) + '</td>' +
// 				'<td>' + esc(r.location_description) + '</td></tr>';
// 		}).join("");
// 		$("#rev-table-body").html(rows);
// 		$("#rev-count-badge").text(selected.length + " item" + (selected.length !== 1 ? "s" : "") + " selected");
// 		$("#rev-confirm-cb").prop("checked", false);
// 		$("#rev-btn-proceed").prop("disabled", true);
// 		$("#rev-modal-overlay").data("safe-id", safeId).data("user-email", userEmail).css("display", "flex");
// 	}

// 	/* ============================================================
// 	   HELPERS
// 	============================================================ */
// 	function esc(str) {
// 		return $("<div>").text(str || "").html();
// 	}

// 	function initials(name) {
// 		return (name || "").split(" ").slice(0, 2).map(function (w) { return w[0] || ""; }).join("").toUpperCase();
// 	}

// 	function reset_btn($btn, loading, loadingText) {
// 		$btn.prop("disabled", loading);
// 		if (loading) {
// 			$btn.find(".dl-btn-icon").attr("class", "fa fa-spinner fa-spin dl-btn-icon");
// 			$btn.find(".dl-btn-label").text(loadingText || "Loading...");
// 			$btn.find(".dl-btn-count").text("");
// 		} else {
// 			$btn.find(".dl-btn-icon").attr("class", "fa fa-download dl-btn-icon");
// 		}
// 	}

// 	function get_selected_rows(safeId) {
// 		var selected = [];
// 		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").each(function () {
// 			var $row = $(this);
// 			if (!$row.find(".row-select-cb").is(":checked")) return;
// 			selected.push({
// 				unit                    : $row.data("unit")                    || "",
// 				unit_description        : $row.data("unit-description")        || "",
// 				cost_center             : $row.data("cost-center")             || "",
// 				cost_center_description : $row.data("cost-center-description") || "",
// 				location_code           : $row.data("location-code")           || "",
// 				location_description    : $row.data("location-description")    || ""
// 			});
// 		});
// 		return selected;
// 	}

// 	function sync_bulk_cb(safeId) {
// 		var $all     = $(".mis-table[data-safe-id='" + safeId + "'] tbody tr:visible .row-select-cb");
// 		var $checked = $all.filter(":checked");
// 		var $cbs     = $(".bulk-all-cb[data-safe-id='" + safeId + "']");
// 		if ($all.length === 0 || $checked.length === 0) {
// 			$cbs.prop("checked", false).prop("indeterminate", false);
// 		} else if ($checked.length === $all.length) {
// 			$cbs.prop("checked", true).prop("indeterminate", false);
// 		} else {
// 			$cbs.prop("checked", false).prop("indeterminate", true);
// 		}
// 	}

// 	function update_toolbar_actions(safeId) {
// 		var count  = $(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb:checked").length;
// 		var $badge = $("#tbl-sel-badge-" + safeId);
// 		var $desel = $(".tbl-desel-btn[data-safe-id='" + safeId + "']");
// 		if (count > 0) {
// 			$badge.text(count + " row" + (count !== 1 ? "s" : "") + " selected").show();
// 			$desel.show();
// 		} else {
// 			$badge.hide();
// 			$desel.hide();
// 		}
// 	}

// 	function update_dl_btn_state(safeId) {
// 		var count = $(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb:checked").length;
// 		var total = $(".mis-table[data-safe-id='" + safeId + "'] tbody tr").length;
// 		var $lbl  = $("#dl-lbl-" + safeId);
// 		var $cnt  = $("#dl-cnt-" + safeId);
// 		var $btn  = $lbl.closest(".dl-btn-main");
// 		if (count > 0) {
// 			$btn.addClass("dl-btn-main-sel");
// 			$lbl.text("Download selected");
// 			$cnt.html('<span class="dl-cnt-sel">' + count + " of " + total + " rows selected</span>");
// 		} else {
// 			$btn.removeClass("dl-btn-main-sel");
// 			$lbl.text("Download all");
// 			$cnt.text(total + " rows \u00b7 full template");
// 		}
// 	}

// 	function deselect_all(safeId) {
// 		$(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb").prop("checked", false);
// 		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").removeClass("row-selected");
// 		$(".bulk-all-cb[data-safe-id='" + safeId + "']").prop("checked", false).prop("indeterminate", false);
// 		update_dl_btn_state(safeId);
// 		update_toolbar_actions(safeId);
// 	}

// 	function run_table_search(safeId, query) {
// 		var q       = (query || "").trim().toLowerCase();
// 		var $table  = $(".mis-table[data-safe-id='" + safeId + "']");
// 		var visible = 0;
// 		$table.find("tbody tr").each(function () {
// 			var match = !q || this.textContent.toLowerCase().indexOf(q) !== -1;
// 			$(this).toggle(match);
// 			if (match) visible++;
// 		});
// 		sync_bulk_cb(safeId);
// 		var $count = $("#tbl-count-" + safeId);
// 		if (q) { $count.text(visible + " row" + (visible !== 1 ? "s" : "") + " matched").show(); }
// 		else   { $count.hide(); }
// 		$("#tbl-clear-" + safeId).toggle(q.length > 0);
// 	}

// 	function run_user_search(query) {
// 		var q     = query.trim().toLowerCase();
// 		var total = 0;
// 		$(".user-section").each(function () {
// 			var $sec  = $(this);
// 			var match = !q || ($sec.data("name") || "").indexOf(q) !== -1 || ($sec.data("email") || "").indexOf(q) !== -1;
// 			$sec.toggle(match);
// 			if (match) total++;
// 		});
// 		var $c = $("#admin-user-search-count");
// 		if (q) { $c.text(total + " user" + (total !== 1 ? "s" : "") + " found").show(); }
// 		else   { $c.hide(); }
// 		$("#admin-user-search-clear").toggle(q.length > 0);
// 	}

// 	/* ============================================================
// 	   CONTACT CARD — REDESIGNED
// 	   Structure:
// 	     .contact-card
// 	       .cc-top          ← avatar + name (flex row)
// 	       .cc-divider      ← amber hairline
// 	       .cc-row.email    ← icon pill + full-width email (ellipsis)
// 	       .cc-row.phone    ← icon pill + phone number
// 	============================================================ */
// 	function build_note_html() {
// 		var contacts = [
// 			["Rakesh Ahuja",        "rakesh.ahuja@azimpremjifoundation.org",      "+91 7022068106"],
// 			["Saravana G",          "saravana.g@azimpremjifoundation.org",        "+91 9380861952"],
// 			["Augustin Moses R",    "augustin.moses@azimpremjifoundation.org",    "+91 8667719594"],
// 			["Mercy Selvanayagi R", "mercy.selvanayagi@azimpremjifoundation.org", "+91 9047828687"],
// 			["Mahaveer Ram P",      "mahaveer.p@azimpremjifoundation.org",        "+91 8825879412"]
// 		];
// 		var cards = contacts.map(function (c) {
// 			return '<div class="contact-card">' +
// 				/* top row: avatar + name */
// 				'<div class="cc-top">' +
// 				'<div class="cc-avatar">' + initials(c[0]) + '</div>' +
// 				'<div class="cc-name">' + esc(c[0]) + '</div>' +
// 				'</div>' +
// 				/* amber divider */
// 				'<div class="cc-divider"></div>' +
// 				/* email row — full card width, ellipsis on overflow, title tooltip */
// 				'<div class="cc-row">' +
// 				'<div class="cc-icon-pill"><i class="fa fa-envelope"></i></div>' +
// 				'<span class="cc-val email" title="' + esc(c[1]) + '">' + esc(c[1]) + '</span>' +
// 				'</div>' +
// 				/* phone row */
// 				'<div class="cc-row">' +
// 				'<div class="cc-icon-pill"><i class="fa fa-phone"></i></div>' +
// 				'<span class="cc-val">' + esc(c[2]) + '</span>' +
// 				'</div>' +
// 				'</div>';
// 		}).join("");

// 		return '<div class="note-warning">' +
// 			'<div class="note-left-bar"></div>' +
// 			'<div class="note-inner">' +
// 			'<div class="note-header">' +
// 			'<div class="note-icon-ring"><i class="fa fa-exclamation"></i></div>' +
// 			'<div>' +
// 			'<div class="note-badge"><span class="note-badge-dot"></span>&nbsp;IMPORTANT</div>' +
// 			'<div class="note-title">Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below. If you notice any discrepancies, contact the support team immediately.</div>' +
// 			'</div></div>' +
// 			'<div class="note-divider"></div>' +
// 			'<div class="contact-wrapper">' + cards + '</div>' +
// 			'</div></div>';
// 	}

// 	function sl_badge(idx) {
// 		return idx % 2 === 0
// 			? '<span class="sl-badge-odd">'  + (idx + 1) + '</span>'
// 			: '<span class="sl-badge-even">' + (idx + 1) + '</span>';
// 	}

// 	function build_table_html(rows, safeId) {
// 		var COLS = [
// 			["unit",                    "Unit"                    ],
// 			["unit_description",        "Unit Description"        ],
// 			["cost_center",             "Cost Center"             ],
// 			["cost_center_description", "Cost Center Description" ],
// 			["location_code",           "Location Code"           ],
// 			["location_description",    "Location Description"    ]
// 		];
// 		var headers = COLS.map(function (c) { return "<th>" + c[1] + "</th>"; }).join("");
// 		var bodyRows = rows.map(function (row, i) {
// 			var da =
// 				'data-unit="'                    + esc(row.unit || "")                    + '" ' +
// 				'data-unit-description="'        + esc(row.unit_description || "")        + '" ' +
// 				'data-cost-center="'             + esc(row.cost_center || "")             + '" ' +
// 				'data-cost-center-description="' + esc(row.cost_center_description || "") + '" ' +
// 				'data-location-code="'           + esc(row.location_code || "")           + '" ' +
// 				'data-location-description="'    + esc(row.location_description || "")    + '"';
// 			var cells = COLS.map(function (c) { return "<td>" + esc(row[c[0]] || "") + "</td>"; }).join("");
// 			return '<tr ' + da + '><td class="cb-cell"><input type="checkbox" class="row-select-cb"></td><td>' + sl_badge(i) + '</td>' + cells + '</tr>';
// 		}).join("");
// 		return '<div class="table-wrapper">' +
// 			'<table class="mis-table" data-safe-id="' + safeId + '">' +
// 			'<thead><tr>' +
// 			'<th class="cb-cell"><input type="checkbox" class="bulk-all-cb" data-safe-id="' + safeId + '"></th>' +
// 			'<th>Sl. No.</th>' + headers +
// 			'</tr></thead>' +
// 			'<tbody>' + bodyRows + '</tbody>' +
// 			'</table></div>';
// 	}

// 	/* ============================================================
// 	   DOWNLOAD
// 	============================================================ */
// 	function run_download($btn, userEmail, safeId) {
// 		var selected      = (safeId && safeId !== "null") ? get_selected_rows(safeId) : [];
// 		var entityDataArg = selected.length ? JSON.stringify(selected) : null;

// 		reset_btn($btn, true, "Downloading...");
// 		Loader.show("Generating your template...");

// 		var pct = 0;
// 		var timer = setInterval(function () {
// 			pct = Math.min(pct + (pct < 40 ? 3 : pct < 70 ? 1.5 : 0.4), 84);
// 			Loader.setProgress(pct);
// 		}, 300);

// 		function on_done(success) {
// 			clearInterval(timer);
// 			if (success) {
// 				Loader.setProgress(100);
// 				Loader.setText("Download ready!");
// 				setTimeout(function () {
// 					Loader.hide();
// 					reset_btn($btn, false);
// 					if (safeId) deselect_all(safeId);
// 				}, 800);
// 			} else {
// 				Loader.hide();
// 				reset_btn($btn, false);
// 			}
// 		}

// 		frappe.call({
// 			method  : "annual_budget.api.export_reports.start_budget_template_generation",
// 			args    : { user: userEmail, entity_data: entityDataArg },
// 			callback: function () {
// 				clearInterval(timer);
// 				Loader.setText("Fetching your template...");
// 				pct   = 30;
// 				timer = setInterval(function () { pct = Math.min(pct + 0.3, 84); Loader.setProgress(pct); }, 400);

// 				var polling = false;
// 				var stopped = false;

// 				var pollTimer = setInterval(function () {
// 					if (polling || stopped) return;
// 					polling = true;
// 					fetch(
// 						"/api/method/annual_budget.api.export_reports.download_generated_template?user=" + encodeURIComponent(userEmail),
// 						{ headers: { "X-Frappe-CSRF-Token": frappe.csrf_token } }
// 					)
// 					.then(function (resp) {
// 						if (!resp.ok) { polling = false; throw new Error("Server returned " + resp.status); }
// 						var ct = resp.headers.get("content-type") || "";
// 						if (ct.indexOf("application/json") !== -1) {
// 							return resp.json().then(function () { polling = false; Loader.setText("Still generating, please wait..."); });
// 						}
// 						stopped = true;
// 						clearInterval(pollTimer);
// 						clearInterval(timer);
// 						Loader.setProgress(95);
// 						Loader.setText("Preparing file...");
// 						var disp     = resp.headers.get("Content-Disposition") || "";
// 						var match    = disp.match(/filename[^;=\n]*=["']?([^"';\n]+)/);
// 						var filename = match ? decodeURIComponent(match[1].trim()) : "Budget_Import_Template.xlsx";
// 						return resp.blob().then(function (blob) {
// 							var url = URL.createObjectURL(blob);
// 							var a   = document.createElement("a");
// 							a.href = url; a.download = filename;
// 							document.body.appendChild(a); a.click(); a.remove();
// 							setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
// 							on_done(true);
// 						});
// 					})
// 					.catch(function (err) {
// 						if (stopped) return;
// 						stopped = true;
// 						clearInterval(pollTimer); clearInterval(timer);
// 						on_done(false);
// 						frappe.msgprint({ title: "Download Failed", message: "Could not download the template.<br><small>" + err.message + "</small>", indicator: "red" });
// 					});
// 				}, 3000);
// 			},
// 			error: function () {
// 				clearInterval(timer); on_done(false);
// 				frappe.msgprint({ title: "Error", message: "Could not start template generation. Please try again.", indicator: "red" });
// 			}
// 		});
// 	}

// 	function check_and_download($btn, userEmail, isAdmin) {
// 		reset_btn($btn, true, "Checking...");
// 		frappe.call({
// 			method  : "frappe.client.get_value",
// 			args    : { doctype: "Finance user access", filters: { user: userEmail }, fieldname: "import_template_id" },
// 			callback: function (r) {
// 				var tid = r.message && r.message.import_template_id;
// 				if (!tid) {
// 					reset_btn($btn, false);
// 					show_apf_modal({
// 						title    : '<i class="fa fa-exclamation-triangle"></i> ' + (isAdmin ? "Template Not Configured" : "Import Template Missing"),
// 						icon     : "fa-exclamation-triangle",
// 						iconColor: isAdmin ? "#e67e22" : "#e74c3c",
// 						text     : isAdmin ? "No Import Template is linked for this user account." : "Import Template is not configured for this account.",
// 						sub      : isAdmin
// 							? "The <b>import_template_id</b> field in <b>Finance User Access</b> is empty for <b>" + esc(userEmail) + "</b>. Please assign a valid Import Template before retrying."
// 							: "Please contact your administrator to link an <b>Import Template</b> in <b>Finance User Access</b> before downloading.",
// 						buttons  : [{ label: '<i class="fa fa-times"></i> Close', cls: "btn-default", onClick: hide_apf_modal }]
// 					});
// 					return;
// 				}
// 				if (isAdmin) {
// 					run_download($btn, userEmail, null);
// 				} else {
// 					reset_btn($btn, false);
// 					show_apf_modal({
// 						title       : '<i class="fa fa-download"></i> Confirm Download',
// 						icon        : "fa-exclamation-triangle",
// 						iconColor   : "#e74c3c",
// 						text        : "Please carefully review and validate all allocated Units, Cost Centers, and Location Codes before downloading.",
// 						sub         : "Do not proceed unless everything has been reviewed and confirmed.",
// 						showCheckbox: true,
// 						buttons     : [
// 							{ label: '<i class="fa fa-times"></i> Cancel', cls: "btn-default", onClick: hide_apf_modal },
// 							{ id: "apf-modal-proceed", label: '<i class="fa fa-download"></i> Proceed to Download', cls: "btn-primary", disabled: true,
// 							  onClick: function () { hide_apf_modal(); run_download($btn, userEmail, null); } }
// 						]
// 					});
// 				}
// 			},
// 			error: function () {
// 				reset_btn($btn, false);
// 				frappe.msgprint({ title: "Check Failed", message: "Could not verify the Import Template. Please try again.", indicator: "red" });
// 			}
// 		});
// 	}

// 	/* ============================================================
// 	   RENDER CONTENT
// 	============================================================ */
// 	function render_content(container, data) {
// 		var roles                = Array.isArray(frappe.user_roles) ? frappe.user_roles : [];
// 		var isFinanceCoordinator = roles.indexOf("Finance Unit Coordinator") !== -1;
// 		var isSystemManager      = roles.indexOf("System Manager") !== -1;
// 		var isFinanceAdmin       = roles.indexOf("Finance Admin") !== -1;
// 		var needsModal           = isFinanceCoordinator && !isSystemManager && !isFinanceAdmin;
// 		var isCollapsible        = isSystemManager || isFinanceAdmin;

// 		var grouped = {};
// 		data.forEach(function (row) {
// 			if (!grouped[row.user]) {
// 				grouped[row.user] = { user_fullname: row.user_fullname || "", email: row.user, rows: [] };
// 			}
// 			grouped[row.user].rows.push(row);
// 		});

// 		container.empty();

// 		if (isCollapsible) {
// 			container.append(
// 				'<div class="global-user-search-wrap">' +
// 				'<div class="gus-label"><i class="fa fa-users"></i> Search User</div>' +
// 				'<div class="gus-inner">' +
// 				'<div class="gus-icon-pill"><i class="fa fa-search"></i></div>' +
// 				'<input type="text" id="admin-user-search" class="gus-input" placeholder="Search by name or email..." autocomplete="off"/>' +
// 				'<div id="admin-user-search-clear" class="gus-clear" title="Clear" style="display:none;">&#10005;</div>' +
// 				'</div>' +
// 				'<div id="admin-user-search-count" class="gus-count" style="display:none;"></div>' +
// 				'</div>'
// 			);
// 		}

// 		Object.keys(grouped).forEach(function (key) {
// 			var userData    = grouped[key];
// 			var displayName = userData.user_fullname || userData.email;
// 			var rowCount    = userData.rows.length;
// 			var safeId      = userData.email.replace(/[^a-z0-9]/gi, "_");
// 			var cbId        = "expand-cb-" + safeId;

// 			var expandHtml = isCollapsible
// 				? '<div class="expand-toggle-wrap">' +
// 				  '<label class="expand-toggle-label" for="' + cbId + '">' +
// 				  '<input type="checkbox" id="' + cbId + '" class="expand-toggle-cb">' +
// 				  '<span class="expand-toggle-btn">Expand</span>' +
// 				  '</label>' +
// 				  '<span class="expand-row-count">' + rowCount + " row" + (rowCount !== 1 ? "s" : "") + '</span>' +
// 				  '</div>'
// 				: "";

// 			var $section = $(
// 				'<div class="user-section" data-name="' + esc(displayName.toLowerCase()) + '" data-email="' + esc(userData.email.toLowerCase()) + '">' +

// 				'<div class="profile-card ' + (isCollapsible ? "profile-collapsible" : "") + '">' +
// 				'<div class="profile-left">' +
// 				'<div class="uhi-avatar">' + esc(initials(displayName)) + '</div>' +
// 				'<div class="uhi-info">' +
// 				'<div class="user-name">' + esc(displayName) + '</div>' +
// 				'<div class="user-email">' + esc(userData.email) + '</div>' +
// 				'</div></div>' +
// 				'<div class="profile-right">' + expandHtml + '</div>' +
// 				'</div>' +

// 				'<div class="dl-tip-banner">' +
// 				'<div class="dl-tip-icon-wrap"><i class="fa fa-info-circle"></i></div>' +
// 				'<div class="dl-tip-text">' +
// 				'<strong>How to download</strong> &mdash; Click <span class="dl-tip-em">Download all</span> to get the full template, or tick specific rows and the button will switch to <span class="dl-tip-em">Download selected</span>.' +
// 				'</div>' +
// 				'<span class="dl-tip-close" title="Dismiss">&times;</span>' +
// 				'</div>' +

// 				'<div class="user-body" style="display:' + (isCollapsible ? "none" : "block") + ';">' +
// 				'<div class="note-slot"></div>' +
// 				'<div class="connector-slot"></div>' +
// 				'<div class="tbl-card">' +
// 				'<div class="tbl-action-bar">' +
// 				'<div class="tbl-bar-left">' +
// 				'<div class="tbl-search-inner">' +
// 				'<div class="tbl-search-icon-pill"><i class="fa fa-search"></i></div>' +
// 				'<input type="text" id="tbl-search-' + safeId + '" class="tbl-search-input" data-safe-id="' + safeId + '" placeholder="Search units, cost centers, locations..." autocomplete="off"/>' +
// 				'<div id="tbl-clear-' + safeId + '" class="tbl-search-clear" data-safe-id="' + safeId + '" title="Clear" style="display:none;">&#10005;</div>' +
// 				'</div>' +
// 				'<span id="tbl-count-' + safeId + '" class="tbl-search-count" style="display:none;"></span>' +
// 				'</div>' +
// 				'<div class="tbl-bar-right">' +
// 				'<label class="tbl-bulk-label" title="Select / deselect all visible rows">' +
// 				'<input type="checkbox" id="bulk-cb-' + safeId + '" class="bulk-all-cb" data-safe-id="' + safeId + '">' +
// 				'<span class="tbl-bulk-text">Select all</span>' +
// 				'</label>' +
// 				'<span class="tbl-sel-badge" id="tbl-sel-badge-' + safeId + '" style="display:none;"></span>' +
// 				'<button class="tbl-desel-btn" data-safe-id="' + safeId + '" style="display:none;"><i class="fa fa-times"></i> Deselect all</button>' +
// 				'<div class="button-container"></div>' +
// 				'</div></div>' +
// 				'<div class="table-slot"></div>' +
// 				'</div>' +
// 				'</div></div>'
// 			);

// 			container.append($section);

// 			if (needsModal) {
// 				$section.find(".note-slot").html(build_note_html());
// 				$section.find(".connector-slot").html('<div class="note-to-table-gap"></div>');
// 			} else {
// 				$section.find(".connector-slot").html('<div class="section-spacer"></div>');
// 			}

// 			$section.find(".table-slot").html(build_table_html(userData.rows, safeId));

// 			if (isCollapsible) {
// 				$section.find(".expand-toggle-cb").on("change", function () {
// 					var $body = $section.find(".user-body");
// 					var $card = $section.find(".profile-card");
// 					var $txt  = $section.find(".expand-toggle-btn");
// 					if (this.checked) {
// 						$body.slideDown(200); $card.addClass("is-open"); $txt.text("Collapse");
// 					} else {
// 						$body.slideUp(200); $card.removeClass("is-open"); $txt.text("Expand");
// 						run_table_search(safeId, ""); deselect_all(safeId);
// 					}
// 				});
// 			}

// 			(function (sid, email, admin) {
// 				var $dlBtn = $(
// 					'<button class="dl-btn-main dl-btn">' +
// 					'<i class="fa fa-download dl-btn-icon"></i>' +
// 					'<div class="dl-btn-body">' +
// 					'<span class="dl-btn-label" id="dl-lbl-' + sid + '">Download all</span>' +
// 					'<span class="dl-btn-count" id="dl-cnt-' + sid + '">' + rowCount + ' rows \u00b7 full template</span>' +
// 					'</div></button>'
// 				);
// 				$section.find(".tbl-bar-right .button-container").append($dlBtn);
// 				$dlBtn.on("click", function () {
// 					var anySelected = $(".mis-table[data-safe-id='" + sid + "'] .row-select-cb:checked").length > 0;
// 					if (anySelected) { show_review_modal(sid, email); }
// 					else             { check_and_download($(this), email, admin); }
// 				});
// 			})(safeId, userData.email, !needsModal);
// 		});

// 		$(document)
// 			.off(".rowSelect")
// 			.on("change.rowSelect", ".bulk-all-cb", function () {
// 				var sid     = $(this).data("safe-id");
// 				var checked = this.checked;
// 				$(".mis-table[data-safe-id='" + sid + "'] tbody tr:visible").each(function () {
// 					$(this).find(".row-select-cb").prop("checked", checked);
// 					$(this).toggleClass("row-selected", checked);
// 				});
// 				sync_bulk_cb(sid);
// 				update_dl_btn_state(sid);
// 				update_toolbar_actions(sid);
// 			})
// 			.on("change.rowSelect", ".row-select-cb", function () {
// 				var $row = $(this).closest("tr");
// 				var sid  = $(this).closest(".mis-table").data("safe-id");
// 				$row.toggleClass("row-selected", this.checked);
// 				sync_bulk_cb(sid);
// 				update_dl_btn_state(sid);
// 				update_toolbar_actions(sid);
// 			});

// 		$(document)
// 			.off(".selSubmit")
// 			.on("click.selSubmit", ".tbl-desel-btn", function () {
// 				deselect_all($(this).data("safe-id"));
// 			});

// 		$(document)
// 			.off(".tblSearch")
// 			.on("input.tblSearch", ".tbl-search-input", function () {
// 				run_table_search($(this).data("safe-id"), this.value);
// 			})
// 			.on("click.tblSearch", ".tbl-search-clear", function () {
// 				var sid = $(this).data("safe-id");
// 				$("#tbl-search-" + sid).val("");
// 				run_table_search(sid, "");
// 			});

// 		$(document)
// 			.off(".tipDismiss")
// 			.on("click.tipDismiss", ".dl-tip-close", function () {
// 				$(this).closest(".dl-tip-banner").slideUp(200);
// 			});

// 		if (isCollapsible) {
// 			$(document)
// 				.off(".adminUserSearch")
// 				.on("input.adminUserSearch", "#admin-user-search", function () { run_user_search(this.value); })
// 				.on("click.adminUserSearch", "#admin-user-search-clear", function () {
// 					$("#admin-user-search").val(""); run_user_search("");
// 				});
// 			$("#admin-user-search-clear").hide();
// 		}
// 	}

// 	/* ============================================================
// 	   INIT
// 	============================================================ */
// 	$container.html('<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading Data...</div>');

// 	frappe.call({
// 		method  : "annual_budget.api.filter_options.get_user_mappings",
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) {
// 				$container.html('<div class="empty-state"><i class="fa fa-inbox"></i> No Data Found</div>');
// 				return;
// 			}
// 			render_content($container, r.message);
// 		}
// 	});

// };



frappe.pages["import-template"].on_page_load = function (wrapper) {

	frappe.ui.make_app_page({
		parent       : wrapper,
		title        : "Budget Import Template",
		single_column: true
	});

	var $container = $(wrapper).find(".layout-main-section");
	$container.addClass("budget-import-wrapper");

	/* ============================================================
	   STYLES
	============================================================ */
	if (!document.getElementById("allocation-style")) {
		var style = document.createElement("style");
		style.id  = "allocation-style";
		var rules = [
			".budget-import-wrapper{padding:24px;background:#f7f9fb;min-height:100vh;box-sizing:border-box;}",
			".loading-state,.empty-state{text-align:center;padding:60px 20px;font-size:15px;font-weight:600;color:#0076B6;}",
			".loading-state i,.empty-state i{font-size:28px;margin-bottom:10px;display:block;}",
			".user-section{margin-bottom:24px;background:#fff;border:1px solid #dcdcdc;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.06);overflow:hidden;}",
			".profile-card{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#F4F9FD;border-bottom:1px solid #dcdcdc;gap:12px;}",
			".profile-collapsible{border-radius:8px;}",
			".profile-collapsible.is-open{border-radius:8px 8px 0 0;}",
			".profile-left{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}",
			".profile-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}",
			".uhi-avatar{width:40px;height:40px;border-radius:50%;background:#0076B6;color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px rgba(0,118,182,0.3);}",
			".uhi-info{display:flex;flex-direction:column;gap:2px;min-width:0;}",
			".user-name{font-size:14px;font-weight:700;color:#003B63;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
			".user-email{font-size:12px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
			".expand-toggle-wrap{display:flex;align-items:center;gap:8px;}",
			".expand-toggle-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;padding:5px 12px;border:1px solid #aaa;border-radius:6px;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;}",
			".expand-toggle-label:hover{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.08);}",
			".expand-toggle-cb{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
			".expand-toggle-btn{font-size:12px;font-weight:600;color:#0076B6;white-space:nowrap;}",
			".expand-row-count{font-size:11px;font-weight:600;color:#fff;background:#0076B6;padding:2px 9px;border-radius:99px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,118,182,0.3);}",
			".dl-tip-banner{display:flex;align-items:flex-start;gap:10px;padding:10px 16px;background:#EBF4FF;border-bottom:1px solid #dcdcdc;}",
			".dl-tip-icon-wrap{width:22px;height:22px;border-radius:50%;background:#0076B6;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}",
			".dl-tip-icon-wrap i{font-size:10px;color:#fff;}",
			".dl-tip-text{font-size:12px;color:#1a4f72;line-height:1.65;flex:1;}",
			".dl-tip-text strong{color:#003B63;font-weight:600;}",
			".dl-tip-em{font-weight:600;color:#0076B6;}",
			".dl-tip-close{font-size:18px;color:#7a9ab0;cursor:pointer;line-height:1;flex-shrink:0;padding:0 2px;margin-top:-1px;}",
			".dl-tip-close:hover{color:#003B63;}",
			".user-body{padding:0;}",
			".note-warning{background:#fff;border-bottom:1px solid #dcdcdc;display:flex;overflow:hidden;}",
			".note-left-bar{width:5px;background:#f4b400;flex-shrink:0;}",
			".note-inner{padding:18px 20px;flex:1;min-width:0;box-sizing:border-box;}",
			".note-header{display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;}",
			".note-icon-ring{width:34px;height:34px;border-radius:50%;background:#FFF3E6;border:1.5px solid #f4b400;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}",
			".note-icon-ring i{font-size:14px;color:#e67e22;}",
			".note-badge{display:inline-flex;align-items:center;gap:5px;background:#f4b400;color:#5c3800;font-size:10px;font-weight:700;padding:2px 9px;border-radius:99px;letter-spacing:0.6px;margin-bottom:5px;}",
			".note-badge-dot{width:5px;height:5px;border-radius:50%;background:#5c3800;display:inline-block;animation:softBlink 1.5s ease-in-out infinite;}",
			"@keyframes softBlink{0%,100%{opacity:1;}50%{opacity:0.3;}}",
			".note-title{font-size:13px;font-weight:500;color:#3d2800;line-height:1.65;}",
			".note-divider{height:1px;background:#fde68a;margin:14px 0;}",
			".contact-wrapper{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;}",
			".contact-card{background:#FFF3E6;border:1px solid #f0d97a;border-radius:7px;padding:14px 15px;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;}",
			".contact-card:hover{border-color:#e0a800;box-shadow:0 3px 8px rgba(244,180,0,0.18);}",
			".cc-top{display:flex;align-items:center;gap:10px;margin-bottom:10px;}",
			".cc-avatar{width:36px;height:36px;min-width:36px;border-radius:50%;background:#f4b400;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#5c3800;flex-shrink:0;box-shadow:0 2px 5px rgba(244,180,0,0.3);}",
			".cc-name{font-size:13px;font-weight:700;color:#3d2800;line-height:1.35;word-break:break-word;}",
			".cc-divider{height:1px;background:#f0d97a;margin-bottom:10px;}",
			".cc-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}",
			".cc-row:last-child{margin-bottom:0;}",
			".cc-icon-pill{width:20px;height:20px;min-width:20px;border-radius:50%;background:#f4b400;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
			".cc-icon-pill i{font-size:9px;color:#5c3800;}",
			".cc-val{font-size:13.5px;color:#7a5200;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;line-height:1.4;}",
			".cc-val.email{font-size:13px;letter-spacing:-0.1px;}",
			".note-to-table-gap{height:20px;background:#f7f9fb;}",
			".section-spacer{height:20px;background:#f7f9fb;}",
			".tbl-card{border-top:1px solid #dcdcdc;border-radius:0 0 8px 8px;overflow:hidden;background:#fff;}",
			".tbl-action-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:10px 14px;background:#f7f9fb;border-bottom:1px solid #dcdcdc;}",
			".tbl-bar-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1;min-width:0;}",
			".tbl-bar-right{display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap;}",
			".tbl-search-inner{position:relative;display:flex;align-items:center;width:300px;max-width:100%;}",
			".tbl-search-icon-pill{position:absolute;left:9px;width:20px;height:20px;background:#0076B6;border-radius:50%;display:flex;align-items:center;justify-content:center;pointer-events:none;flex-shrink:0;}",
			".tbl-search-icon-pill i{font-size:9px;color:#fff;}",
			".tbl-search-input{width:100%;padding:7px 34px 7px 36px;border:1px solid #aaa;border-radius:6px;font-size:13px;color:#333;outline:none;background:#fff;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box;}",
			".tbl-search-input::placeholder{color:#aaa;}",
			".tbl-search-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.10);}",
			".tbl-search-clear{position:absolute;right:9px;width:18px;height:18px;border-radius:50%;background:#d0dde8;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;color:#4a6070;font-weight:700;transition:background 0.15s,color 0.15s;}",
			".tbl-search-clear:hover{background:#c0392b;color:#fff;}",
			".tbl-search-count{font-size:11px;color:#0076B6;font-weight:600;white-space:nowrap;display:flex;align-items:center;gap:4px;}",
			".tbl-search-count::before{content:'';display:inline-block;width:5px;height:5px;border-radius:50%;background:#0076B6;}",
			".tbl-bulk-label{display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;margin:0;padding:5px 10px;border:1px solid #aaa;border-radius:6px;background:#fff;transition:border-color 0.15s;}",
			".tbl-bulk-label:hover{border-color:#0076B6;}",
			".tbl-bulk-label input{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;flex-shrink:0;}",
			".tbl-bulk-text{font-size:12px;font-weight:600;color:#444;white-space:nowrap;}",
			".tbl-sel-badge{font-size:12px;font-weight:600;color:#fff;background:#0076B6;padding:3px 10px;border-radius:99px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,118,182,0.3);}",
			".tbl-desel-btn{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;border:1px solid #aaa;background:#fff;font-size:12px;font-weight:600;color:#444;cursor:pointer;transition:all 0.15s;white-space:nowrap;}",
			".tbl-desel-btn:hover{border-color:#c0392b;color:#c0392b;}",
			".dl-btn-main{display:inline-flex;align-items:center;gap:10px;padding:6px 14px;border-radius:6px;cursor:pointer;border:1px solid #0076B6;background:#0076B6;transition:background 0.15s ease,box-shadow 0.15s ease;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.12);}",
			".dl-btn-main:hover{background:#005f94;border-color:#005f94;box-shadow:0 3px 8px rgba(0,118,182,0.35);}",
			".dl-btn-main:active{background:#004f7a;border-color:#004f7a;box-shadow:none;}",
			".dl-btn-main:disabled{opacity:0.55;cursor:not-allowed;box-shadow:none;}",
			".dl-btn-icon{font-size:15px;color:#fff;flex-shrink:0;}",
			".dl-btn-body{display:flex;flex-direction:column;align-items:flex-start;gap:1px;}",
			".dl-btn-label{font-size:13px;font-weight:600;color:#fff;line-height:1.2;}",
			".dl-btn-count{font-size:11px;color:rgba(255,255,255,0.8);line-height:1.3;}",
			".dl-cnt-sel{color:#fff;font-weight:700;}",
			".dl-btn-main-sel{border-color:#1a8a4a;background:#1a8a4a;}",
			".dl-btn-main-sel:hover{background:#145e32;border-color:#145e32;box-shadow:0 3px 8px rgba(26,138,74,0.35);}",
			".dl-btn-main-sel .dl-btn-icon,.dl-btn-main-sel .dl-btn-label{color:#fff;}",
			".dl-btn-main-sel .dl-btn-count{color:rgba(255,255,255,0.8);}",
			".table-wrapper{overflow-x:auto;-webkit-overflow-scrolling:touch;}",
			".mis-table{width:100%;border-collapse:collapse;font-size:13px;min-width:580px;}",
			".mis-table thead tr{background:#0076B6;}",
			".mis-table th{color:#fff;font-weight:700;padding:9px 10px;text-align:center;white-space:nowrap;font-size:12px;border:1px solid #ddd;}",
			".mis-table tbody tr:nth-child(odd) td{background:#fff;}",
			".mis-table tbody tr:nth-child(even) td{background:#F4F9FD;}",
			".mis-table tbody td{padding:8px 10px;border:1px solid #ddd;text-align:center;color:#333;font-size:13px;vertical-align:middle;}",
			".mis-table tbody tr:nth-child(odd) td:first-child{border-left:3px solid transparent;}",
			".mis-table tbody tr:nth-child(even) td:first-child{border-left:3px solid #b8d9f5;}",
			".mis-table tbody tr:hover td{background:#daeeff !important;}",
			".mis-table tbody tr:hover td:first-child{border-left-color:#0076B6 !important;}",
			".mis-table tbody tr.row-selected td{background:#cce8fd !important;border-color:#99cef5 !important;}",
			".mis-table tbody tr.row-selected td:first-child{border-left:3px solid #0076B6 !important;}",
			".sl-badge-odd{display:inline-block;background:#e8f1fa;color:#0076B6;font-weight:700;border-radius:99px;padding:1px 8px;font-size:11.5px;min-width:28px;}",
			".sl-badge-even{display:inline-block;background:#0076B6;color:#fff;font-weight:700;border-radius:99px;padding:1px 8px;font-size:11.5px;min-width:28px;}",
			".cb-cell{width:36px;min-width:36px;text-align:center;padding:6px !important;}",
			".row-select-cb,.bulk-all-cb{width:14px;height:14px;cursor:pointer;accent-color:#0076B6;vertical-align:middle;}",
			".global-user-search-wrap{margin-bottom:20px;padding:14px 16px;background:#f7f9fb;border:1px solid #dcdcdc;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.06);}",
			".gus-label{font-size:11px;font-weight:700;color:#0076B6;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:8px;}",
			".gus-label i{margin-right:6px;}",
			".gus-inner{position:relative;display:flex;align-items:center;max-width:460px;}",
			".gus-icon-pill{position:absolute;left:10px;width:20px;height:20px;background:#0076B6;border-radius:50%;display:flex;align-items:center;justify-content:center;pointer-events:none;}",
			".gus-icon-pill i{font-size:9px;color:#fff;}",
			".gus-input{width:100%;padding:7px 32px 7px 38px;border:1px solid #aaa;border-radius:6px;font-size:13px;color:#333;outline:none;background:#fff;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box;}",
			".gus-input::placeholder{color:#aaa;}",
			".gus-input:focus{border-color:#0076B6;box-shadow:0 0 0 3px rgba(0,118,182,0.10);}",
			".gus-clear{position:absolute;right:10px;width:18px;height:18px;border-radius:50%;background:#d0dde8;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;color:#4a6070;font-weight:700;transition:background 0.15s,color 0.15s;}",
			".gus-clear:hover{background:#c0392b;color:#fff;}",
			".gus-count{margin-top:6px;font-size:12px;color:#0076B6;font-weight:600;display:flex;align-items:center;gap:4px;}",
			".gus-count::before{content:'';display:inline-block;width:5px;height:5px;border-radius:50%;background:#0076B6;}",
			"#rev-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:99999;padding:15px;}",
			".rev-modal-box{background:#fff;width:1000px;max-width:100%;max-height:90vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,0.25);display:flex;flex-direction:column;overflow:hidden;}",
			".rev-modal-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#F4F9FD;border-bottom:1px solid #dcdcdc;font-weight:700;font-size:15px;color:#003B63;flex-shrink:0;}",
			".rev-modal-title i{margin-right:8px;color:#0076B6;}",
			"#rev-modal-close{cursor:pointer;font-size:22px;color:#666;line-height:1;}",
			"#rev-modal-close:hover{color:#003B63;}",
			".rev-modal-body{padding:18px 20px;overflow-y:auto;flex:1;}",
			".rev-warning-banner{display:flex;align-items:flex-start;gap:12px;background:#FFF3E6;border:1px solid #f4b400;border-left:4px solid #f4b400;border-radius:6px;padding:12px 16px;margin-bottom:14px;}",
			".rev-warn-icon{font-size:20px;color:#e67e22;flex-shrink:0;margin-top:2px;}",
			".rev-warn-title{font-size:13px;font-weight:700;color:#5c3d00;margin-bottom:3px;}",
			".rev-warn-sub{font-size:12px;color:#7a5200;line-height:1.6;}",
			".rev-count-badge{display:inline-block;font-size:12px;font-weight:600;color:#fff;background:#0076B6;padding:3px 12px;border-radius:99px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,118,182,0.3);}",
			".rev-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:14px;border-radius:6px;border:1px solid #ddd;}",
			".rev-table{width:100%;border-collapse:collapse;font-size:12px;min-width:700px;}",
			".rev-table thead tr{background:#0076B6;}",
			".rev-table th{color:#fff;font-weight:700;padding:8px 10px;text-align:center;white-space:nowrap;border:1px solid #ddd;}",
			".rev-table tbody tr:nth-child(odd) td{background:#fff;}",
			".rev-table tbody tr:nth-child(even) td{background:#F4F9FD;}",
			".rev-table td{padding:7px 10px;border:1px solid #ddd;text-align:center;color:#333;}",
			".rev-table tbody tr:hover td{background:#daeeff !important;}",
			".rev-sl{width:36px;}",
			".rev-confirm-wrap{background:#f7f9fb;border:1px solid #dcdcdc;border-radius:6px;padding:12px 14px;}",
			".rev-confirm-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;font-size:13px;color:#333;}",
			".rev-confirm-label input{width:14px;height:14px;margin-top:2px;accent-color:#0076B6;flex-shrink:0;cursor:pointer;}",
			".rev-confirm-label i{color:#28a745;margin-right:4px;}",
			".rev-modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:12px 20px;border-top:1px solid #dcdcdc;flex-shrink:0;background:#f7f9fb;}",
			".rev-modal-footer .btn{min-width:130px;}",
			"#rev-btn-proceed:disabled{opacity:0.6;cursor:not-allowed;}",
			"#apf-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:9999;padding:15px;}",
			".apf-modal-box{background:#fff;width:520px;max-width:100%;border-radius:8px;box-shadow:0 20px 50px rgba(0,0,0,0.2);padding:26px;}",
			".apf-modal-header{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:15px;margin-bottom:18px;color:#003B63;}",
			".apf-modal-title i{margin-right:8px;color:#0076B6;}",
			"#apf-modal-close{cursor:pointer;font-size:22px;color:#666;line-height:1;}",
			"#apf-modal-close:hover{color:#003B63;}",
			".apf-modal-body{text-align:center;margin-bottom:18px;}",
			".apf-modal-icon{font-size:38px;margin-bottom:10px;}",
			".apf-modal-text{font-weight:600;font-size:13px;color:#c0392b;margin-bottom:8px;line-height:1.6;}",
			".apf-modal-sub{font-size:12px;color:#666;margin-bottom:14px;line-height:1.6;}",
			".apf-checkbox-wrapper{background:#f7f9fb;padding:12px;border-radius:6px;border:1px solid #dcdcdc;font-size:13px;text-align:left;}",
			".apf-checkbox-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin:0;}",
			".apf-checkbox-label i{color:#28a745;margin-right:4px;}",
			".apf-checkbox-label input{margin-top:3px;flex-shrink:0;accent-color:#0076B6;}",
			".apf-modal-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:14px;}",
			".apf-modal-footer .btn{min-width:130px;}",
			"#apf-modal-proceed:disabled{opacity:0.6;cursor:not-allowed;}",
			"#global-loader.loader-overlay{position:fixed;inset:0;width:100vw;height:100vh;background:rgba(18,18,18,0.92);backdrop-filter:blur(6px);z-index:999999;display:none;align-items:center;justify-content:center;}",
			"#global-loader.loader-overlay.active{display:flex;}",
			".loader-box{display:flex;flex-direction:column;align-items:center;gap:16px;}",
			".loader-ring-wrap{position:relative;width:110px;height:110px;display:flex;align-items:center;justify-content:center;}",
			".loader-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);}",
			".loader-ring-bg{fill:none;stroke:rgba(255,255,255,0.12);stroke-width:6;}",
			".loader-ring-fill{fill:none;stroke:url(#ringGrad);stroke-width:6;stroke-linecap:round;stroke-dasharray:276.46;stroke-dashoffset:276.46;transition:stroke-dashoffset 0.35s ease;}",
			".loader-logo{width:72px;height:72px;border-radius:50%;background:#fff;padding:11px;object-fit:contain;position:relative;z-index:1;box-shadow:0 10px 30px rgba(0,0,0,0.35),0 0 0 4px rgba(255,255,255,0.08);animation:pulse 1.6s infinite ease-in-out;}",
			".loader-pct-inside{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:700;color:#fff;background:rgba(0,118,182,0.85);padding:1px 7px;border-radius:99px;z-index:2;white-space:nowrap;}",
			".loader-text{font-size:14px;color:#fff;font-weight:600;letter-spacing:0.5px;text-align:center;opacity:0.85;}",
			"@keyframes pulse{0%,100%{transform:scale(1);opacity:0.8;}50%{transform:scale(1.08);opacity:1;}}",
			".dl-anim-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;width:56px;}",
			".dl-arrow-track{width:22px;height:26px;overflow:hidden;position:relative;}",
			".dl-arrow{display:flex;flex-direction:column;align-items:center;position:absolute;left:50%;transform:translateX(-50%);animation:dl-drop 1.2s ease-in-out infinite;}",
			".dl-arrow-stem{width:3px;height:13px;background:#0076B6;border-radius:2px;}",
			".dl-arrow-head{width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #0076B6;}",
			"@keyframes dl-drop{0%{top:-26px;opacity:0;}30%{opacity:1;}70%{opacity:1;}100%{top:26px;opacity:0;}}",
			".dl-bar{width:40px;height:4px;background:#0076B6;border-radius:99px;animation:dl-bar-pulse 1.2s ease-in-out infinite;}",
			"@keyframes dl-bar-pulse{0%,100%{opacity:0.4;transform:scaleX(0.8);}50%{opacity:1;transform:scaleX(1);}}",
			".dl-dots{display:flex;gap:5px;}",
			".dl-dots span{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.6);animation:dl-bounce 1.2s ease-in-out infinite;}",
			".dl-dots span:nth-child(1){animation-delay:0s;}",
			".dl-dots span:nth-child(2){animation-delay:0.2s;}",
			".dl-dots span:nth-child(3){animation-delay:0.4s;}",
			"@keyframes dl-bounce{0%,80%,100%{transform:scale(1);opacity:0.5;}40%{transform:scale(1.5);opacity:1;}}",
			"@media(max-width:1280px){.contact-wrapper{grid-template-columns:repeat(auto-fill,minmax(300px,1fr));}.tbl-search-inner{width:280px;}}",
			"@media(max-width:1024px){.budget-import-wrapper{padding:20px;}.contact-wrapper{grid-template-columns:repeat(auto-fill,minmax(280px,1fr));}.tbl-search-inner{width:240px;}.gus-inner{max-width:100%;}}",
			"@media(max-width:900px){.budget-import-wrapper{padding:16px;}.contact-wrapper{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;}.tbl-search-inner{width:210px;}.note-to-table-gap,.section-spacer{height:16px;}.note-inner{padding:16px 18px;}}",
			"@media(max-width:768px){.budget-import-wrapper{padding:12px;}.profile-card{flex-wrap:wrap;gap:10px;}.profile-right{width:100%;justify-content:flex-end;}.tbl-action-bar{flex-direction:column;align-items:stretch;gap:8px;}.tbl-bar-left,.tbl-bar-right{width:100%;}.tbl-bar-right{justify-content:flex-end;}.tbl-search-inner{width:100%;}.dl-btn-main{width:100%;justify-content:center;}.contact-wrapper{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}.note-inner{padding:14px 16px;}.note-to-table-gap,.section-spacer{height:14px;}.rev-modal-footer{flex-wrap:wrap;gap:8px;}.rev-modal-footer .btn{flex:1;min-width:unset;}.apf-modal-footer{flex-wrap:wrap;gap:8px;}.apf-modal-footer .btn{flex:1;min-width:unset;}.mis-table{min-width:520px;}}",
			"@media(max-width:600px){.budget-import-wrapper{padding:10px;}.contact-wrapper{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}.contact-card{padding:11px 12px;}.cc-avatar{width:32px;height:32px;min-width:32px;font-size:11px;}.cc-name{font-size:12px;}.cc-val{font-size:12.5px;}.cc-val.email{font-size:12px;}.uhi-avatar{width:36px;height:36px;font-size:13px;}.user-name{font-size:13px;}.user-email{font-size:11px;}.tbl-action-bar{padding:8px 10px;}.tbl-bulk-text{display:none;}.tbl-sel-badge{font-size:11px;}.dl-btn-count{display:none;}.dl-tip-text{font-size:11.5px;}.note-badge{font-size:9px;}.note-title{font-size:12.5px;}.note-inner{padding:12px 13px;}.note-to-table-gap,.section-spacer{height:12px;}.expand-row-count{display:none;}.mis-table{font-size:12px;min-width:460px;}.mis-table th{padding:7px 8px;font-size:11px;}.mis-table tbody td{padding:6px 8px;}}",
			"@media(max-width:480px){.budget-import-wrapper{padding:8px;}.profile-card{padding:10px 12px;}.contact-wrapper{grid-template-columns:minmax(0,1fr);}.contact-card{padding:12px 14px;}.cc-avatar{width:34px;height:34px;min-width:34px;font-size:12px;}.cc-name{font-size:13px;}.cc-val{font-size:13px;}.cc-val.email{font-size:12.5px;}.tbl-bar-right{flex-direction:column;align-items:stretch;}.tbl-desel-btn{justify-content:center;}.tbl-bulk-label{justify-content:center;}.expand-toggle-label{padding:4px 8px;}.note-to-table-gap,.section-spacer{height:10px;}.dl-tip-banner{padding:8px 12px;}.dl-tip-text{font-size:11px;}.mis-table{min-width:400px;font-size:11px;}.mis-table th{padding:5px 6px;font-size:10px;}.mis-table tbody td{padding:5px 6px;}.rev-modal-footer{flex-direction:column;}.rev-modal-footer .btn{width:100%;min-width:unset;}.apf-modal-box{padding:16px;}.apf-modal-footer{flex-direction:column;}.apf-modal-footer .btn{width:100%;min-width:unset;}}",
			"@media(max-width:360px){.budget-import-wrapper{padding:6px;}.profile-card{padding:8px 10px;}.uhi-avatar{width:32px;height:32px;font-size:12px;}.user-name{font-size:12px;}.user-email{font-size:10.5px;}.contact-card{padding:10px 12px;}.cc-avatar{width:30px;height:30px;min-width:30px;font-size:10px;}.cc-name{font-size:12px;}.cc-val{font-size:11px;}.cc-val.email{font-size:10.5px;}.note-inner{padding:10px 11px;}.note-title{font-size:12px;}.tbl-action-bar{padding:6px 8px;}.mis-table{min-width:360px;font-size:10px;}.mis-table th,.mis-table tbody td{padding:4px 5px;}}"
		];
		style.textContent = rules.join("");
		document.head.appendChild(style);
	}

	/* ============================================================
	   LOADER
	============================================================ */
	function init_loader() {
		if ($("#global-loader").length) return;
		$("body").append(
			'<div id="global-loader" class="loader-overlay">' +
			'<div class="loader-box">' +
			'<div class="loader-ring-wrap">' +
			'<svg class="loader-ring" viewBox="0 0 100 100">' +
			'<defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
			'<stop offset="0%" stop-color="#0076B6"/><stop offset="100%" stop-color="#00c6ff"/>' +
			'</linearGradient></defs>' +
			'<circle class="loader-ring-bg" cx="50" cy="50" r="44"/>' +
			'<circle class="loader-ring-fill" id="loader-ring-fill" cx="50" cy="50" r="44"/>' +
			'</svg>' +
			'<img src="/files/APF logo.png" class="loader-logo" alt="Loading">' +
			'<div class="loader-pct-inside" id="loader-pct">0%</div>' +
			'</div>' +
			'<div class="dl-anim-wrap">' +
			'<div class="dl-arrow-track"><div class="dl-arrow"><div class="dl-arrow-stem"></div><div class="dl-arrow-head"></div></div></div>' +
			'<div class="dl-bar"></div>' +
			'<div class="dl-dots"><span></span><span></span><span></span></div>' +
			'</div>' +
			'<div class="loader-text" id="loader-text-msg">Preparing download...</div>' +
			'</div></div>'
		);
	}

	function set_progress(pct) {
		var offset = 276.46 - (pct / 100) * 276.46;
		$("#loader-ring-fill").css("stroke-dashoffset", offset);
		$("#loader-pct").text(Math.round(pct) + "%");
	}

	var Loader = {
		show        : function (msg) { init_loader(); $("#loader-text-msg").text(msg || "Preparing download..."); set_progress(0); $("#global-loader").addClass("active"); },
		setText     : function (msg) { $("#loader-text-msg").text(msg); },
		setProgress : function (pct) { set_progress(pct); },
		hide        : function () { $("#global-loader").removeClass("active"); }
	};

	/* ============================================================
	   APF MODAL
	============================================================ */
	function init_apf_modal() {
		if ($("#apf-modal-overlay").length) return;
		$("body").append(
			'<div id="apf-modal-overlay">' +
			'<div class="apf-modal-box">' +
			'<div class="apf-modal-header">' +
			'<div class="apf-modal-title" id="apf-modal-title"></div>' +
			'<span id="apf-modal-close" title="Close">&times;</span>' +
			'</div>' +
			'<div class="apf-modal-body">' +
			'<div class="apf-modal-icon" id="apf-modal-icon"><i id="apf-modal-icon-i" class="fa"></i></div>' +
			'<div class="apf-modal-text" id="apf-modal-text"></div>' +
			'<div class="apf-modal-sub" id="apf-modal-sub"></div>' +
			'<div class="apf-checkbox-wrapper" id="apf-checkbox-wrap" style="display:none;">' +
			'<label class="apf-checkbox-label">' +
			'<input type="checkbox" id="apf-modal-checkbox">' +
			'<span><i class="fa fa-check-circle"></i> I confirm that I have verified all details carefully.</span>' +
			'</label></div></div>' +
			'<div class="apf-modal-footer" id="apf-modal-footer"></div>' +
			'</div></div>'
		);
		$(document)
			.off(".apfModal")
			.on("click.apfModal", "#apf-modal-close", hide_apf_modal)
			.on("click.apfModal", "#apf-modal-overlay", function (e) {
				if ($(e.target).is("#apf-modal-overlay")) hide_apf_modal();
			})
			.on("change.apfModal", "#apf-modal-checkbox", function () {
				$("#apf-modal-proceed").prop("disabled", !this.checked);
			});
	}

	function hide_apf_modal() {
		$("#apf-modal-overlay").hide();
		$("#apf-modal-checkbox").prop("checked", false);
		$("#apf-modal-proceed").prop("disabled", true);
	}

	function show_apf_modal(opts) {
		init_apf_modal();
		$("#apf-modal-title").html(opts.title || "");
		$("#apf-modal-icon-i")
			.attr("class", "fa " + (opts.icon || "fa-exclamation-triangle"))
			.closest(".apf-modal-icon").css("color", opts.iconColor || "#e74c3c");
		$("#apf-modal-text").html(opts.text || "");
		$("#apf-modal-sub").html(opts.sub || "");
		var showCb = !!opts.showCheckbox;
		$("#apf-checkbox-wrap").toggle(showCb);
		if (showCb) $("#apf-modal-checkbox").prop("checked", false);
		var $footer = $("#apf-modal-footer").empty();
		(opts.buttons || []).forEach(function (btn) {
			var $b = $('<button id="' + (btn.id || "") + '" class="btn ' + (btn.cls || "btn-default") + ' btn-sm">' + btn.label + '</button>').prop("disabled", !!btn.disabled);
			$b.on("click", function () { if (btn.onClick) btn.onClick(); });
			$footer.append($b);
		});
		$("#apf-modal-overlay").css("display", "flex");
	}

	/* ============================================================
	   REVIEW MODAL
	============================================================ */
	function init_review_modal() {
		if ($("#rev-modal-overlay").length) return;
		$("body").append(
			'<div id="rev-modal-overlay">' +
			'<div class="rev-modal-box">' +
			'<div class="rev-modal-header">' +
			'<div class="rev-modal-title"><i class="fa fa-list-alt"></i> Review Selected Items</div>' +
			'<span id="rev-modal-close" title="Close">&times;</span>' +
			'</div>' +
			'<div class="rev-modal-body">' +
			'<div class="rev-warning-banner">' +
			'<i class="fa fa-exclamation-triangle rev-warn-icon"></i>' +
			'<div><div class="rev-warn-title">Please make a note of the items listed below.</div>' +
			'<div class="rev-warn-sub">Keep a record of the selected Cost Centers and Location Codes to avoid duplicates when importing.</div></div>' +
			'</div>' +
			'<div class="rev-count-badge" id="rev-count-badge"></div>' +
			'<div class="rev-table-wrap">' +
			'<table class="rev-table">' +
			'<thead><tr>' +
			'<th class="rev-sl">#</th>' +
			'<th>Unit</th>' +
			'<th>Unit Description</th>' +
			'<th>Cost Center</th>' +
			'<th>Cost Center Description</th>' +
			'<th>Cost Center ID</th>' +
			'<th>Location Code</th>' +
			'<th>Location Description</th>' +
			'<th>Location Code ID</th>' +
			'</tr></thead>' +
			'<tbody id="rev-table-body"></tbody>' +
			'</table></div>' +
			'<div class="rev-confirm-wrap">' +
			'<label class="rev-confirm-label">' +
			'<input type="checkbox" id="rev-confirm-cb">' +
			'<span><i class="fa fa-check-circle"></i> I have noted down the selected items and I am ready to proceed.</span>' +
			'</label></div></div>' +
			'<div class="rev-modal-footer">' +
			'<button id="rev-btn-cancel" class="btn btn-default btn-sm"><i class="fa fa-times"></i> Cancel</button>' +
			'<button id="rev-btn-proceed" class="btn btn-success btn-sm" disabled><i class="fa fa-download"></i> Proceed to Download</button>' +
			'</div></div></div>'
		);
		$(document)
			.off(".revModal")
			.on("click.revModal", "#rev-modal-close, #rev-btn-cancel", hide_review_modal)
			.on("click.revModal", "#rev-modal-overlay", function (e) {
				if ($(e.target).is("#rev-modal-overlay")) hide_review_modal();
			})
			.on("change.revModal", "#rev-confirm-cb", function () {
				$("#rev-btn-proceed").prop("disabled", !this.checked);
			})
			.on("click.revModal", "#rev-btn-proceed", function () {
				var $overlay = $("#rev-modal-overlay");
				var sid      = $overlay.data("safe-id");
				var email    = $overlay.data("user-email");
				var $section = $(".user-section").filter(function () {
					return $(this).data("email") === (email || "").toLowerCase();
				});
				hide_review_modal();
				run_download($section.find(".dl-btn-main"), email, sid);
			});
	}

	function hide_review_modal() {
		$("#rev-modal-overlay").hide();
		$("#rev-confirm-cb").prop("checked", false);
		$("#rev-btn-proceed").prop("disabled", true);
	}

	function show_review_modal(safeId, userEmail) {
		var selected = get_selected_rows(safeId);
		if (!selected.length) {
			frappe.msgprint({ title: "Nothing Selected", message: "Please select at least one row.", indicator: "orange" });
			return;
		}
		init_review_modal();
		var rows = selected.map(function (r, i) {
			return '<tr>' +
				'<td class="rev-sl">' + (i + 1)                       + '</td>' +
				'<td>'               + esc(r.unit)                     + '</td>' +
				'<td>'               + esc(r.unit_description)          + '</td>' +
				'<td>'               + esc(r.cost_center)               + '</td>' +
				'<td>'               + esc(r.cost_center_description)   + '</td>' +
				'<td>'               + esc(r.cost_center_id)            + '</td>' +
				'<td>'               + esc(r.location_code)             + '</td>' +
				'<td>'               + esc(r.location_description)      + '</td>' +
				'<td>'               + esc(r.location_code_id)          + '</td>' +
				'</tr>';
		}).join("");
		$("#rev-table-body").html(rows);
		$("#rev-count-badge").text(selected.length + " item" + (selected.length !== 1 ? "s" : "") + " selected");
		$("#rev-confirm-cb").prop("checked", false);
		$("#rev-btn-proceed").prop("disabled", true);
		$("#rev-modal-overlay").data("safe-id", safeId).data("user-email", userEmail).css("display", "flex");
	}

	/* ============================================================
	   HELPERS
	============================================================ */
	function esc(str) {
		return $("<div>").text(str || "").html();
	}

	function initials(name) {
		return (name || "").split(" ").slice(0, 2).map(function (w) { return w[0] || ""; }).join("").toUpperCase();
	}

	function reset_btn($btn, loading, loadingText) {
		$btn.prop("disabled", loading);
		if (loading) {
			$btn.find(".dl-btn-icon").attr("class", "fa fa-spinner fa-spin dl-btn-icon");
			$btn.find(".dl-btn-label").text(loadingText || "Loading...");
			$btn.find(".dl-btn-count").text("");
		} else {
			$btn.find(".dl-btn-icon").attr("class", "fa fa-download dl-btn-icon");
		}
	}

	/* ============================================================
	   get_selected_rows
	   Reads ALL data-* attributes from each selected <tr> and
	   returns the complete object that will be sent to the API.
	   Fields match exactly what get_user_mappings returns:
	     full_name, user, unit, unit_description,
	     cost_center, cost_center_description, cost_center_id,
	     location_code, location_description, location_code_id
	============================================================ */
	function get_selected_rows(safeId) {
		var selected = [];
		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").each(function () {
			var $row = $(this);
			if (!$row.find(".row-select-cb").is(":checked")) return;
			selected.push({
				full_name               : String($row.data("full-name")               || ""),
				user                    : String($row.data("user")                    || ""),
				unit                    : String($row.data("unit")                    || ""),
				unit_description        : String($row.data("unit-description")        || ""),
				cost_center             : String($row.data("cost-center")             || ""),
				cost_center_description : String($row.data("cost-center-description") || ""),
				cost_center_id          : String($row.data("cost-center-id")          || ""),
				location_code           : String($row.data("location-code")           || ""),
				location_description    : String($row.data("location-description")    || ""),
				location_code_id        : String($row.data("location-code-id")        || ""),
				state                   : String($row.data("state")                   || "")
			});
		});
		return selected;
	}

	function sync_bulk_cb(safeId) {
		var $all     = $(".mis-table[data-safe-id='" + safeId + "'] tbody tr:visible .row-select-cb");
		var $checked = $all.filter(":checked");
		var $cbs     = $(".bulk-all-cb[data-safe-id='" + safeId + "']");
		if ($all.length === 0 || $checked.length === 0) {
			$cbs.prop("checked", false).prop("indeterminate", false);
		} else if ($checked.length === $all.length) {
			$cbs.prop("checked", true).prop("indeterminate", false);
		} else {
			$cbs.prop("checked", false).prop("indeterminate", true);
		}
	}

	function update_toolbar_actions(safeId) {
		var count  = $(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb:checked").length;
		var $badge = $("#tbl-sel-badge-" + safeId);
		var $desel = $(".tbl-desel-btn[data-safe-id='" + safeId + "']");
		if (count > 0) {
			$badge.text(count + " row" + (count !== 1 ? "s" : "") + " selected").show();
			$desel.show();
		} else {
			$badge.hide();
			$desel.hide();
		}
	}

	function update_dl_btn_state(safeId) {
		var count = $(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb:checked").length;
		var total = $(".mis-table[data-safe-id='" + safeId + "'] tbody tr").length;
		var $lbl  = $("#dl-lbl-" + safeId);
		var $cnt  = $("#dl-cnt-" + safeId);
		var $btn  = $lbl.closest(".dl-btn-main");
		if (count > 0) {
			$btn.addClass("dl-btn-main-sel");
			$lbl.text("Download selected");
			$cnt.html('<span class="dl-cnt-sel">' + count + " of " + total + " rows selected</span>");
		} else {
			$btn.removeClass("dl-btn-main-sel");
			$lbl.text("Download all");
			$cnt.text(total + " rows \u00b7 full template");
		}
	}

	function deselect_all(safeId) {
		$(".mis-table[data-safe-id='" + safeId + "'] .row-select-cb").prop("checked", false);
		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").removeClass("row-selected");
		$(".bulk-all-cb[data-safe-id='" + safeId + "']").prop("checked", false).prop("indeterminate", false);
		update_dl_btn_state(safeId);
		update_toolbar_actions(safeId);
	}

	function run_table_search(safeId, query) {
		var q      = (query || "").trim().toLowerCase();
		var visible = 0;
		/* search across ALL data-* attributes (every column incl. hidden ones) */
		var SEARCH_ATTRS = [
			"unit", "unit-description",
			"cost-center", "cost-center-description", "cost-center-id",
			"location-code", "location-description", "location-code-id",
			"state", "full-name", "user"
		];
		$(".mis-table[data-safe-id='" + safeId + "'] tbody tr").each(function () {
			var $row  = $(this);
			var match = false;
			if (!q) {
				match = true;
			} else {
				for (var i = 0; i < SEARCH_ATTRS.length; i++) {
					var val = String($row.data(SEARCH_ATTRS[i]) || "").toLowerCase();
					if (val.indexOf(q) !== -1) { match = true; break; }
				}
			}
			$row.toggle(match);
			if (match) visible++;
		});
		sync_bulk_cb(safeId);
		var $count = $("#tbl-count-" + safeId);
		if (q) { $count.text(visible + " row" + (visible !== 1 ? "s" : "") + " matched").show(); }
		else   { $count.hide(); }
		$("#tbl-clear-" + safeId).toggle(q.length > 0);
	}

	function run_user_search(query) {
		var q     = query.trim().toLowerCase();
		var total = 0;
		$(".user-section").each(function () {
			var $sec  = $(this);
			var match = !q || ($sec.data("name") || "").indexOf(q) !== -1 || ($sec.data("email") || "").indexOf(q) !== -1;
			$sec.toggle(match);
			if (match) total++;
		});
		var $c = $("#admin-user-search-count");
		if (q) { $c.text(total + " user" + (total !== 1 ? "s" : "") + " found").show(); }
		else   { $c.hide(); }
		$("#admin-user-search-clear").toggle(q.length > 0);
	}

	/* ============================================================
	   CONTACT CARDS
	============================================================ */
	function build_note_html() {
		var contacts = [
			["Rakesh Ahuja",        "rakesh.ahuja@azimpremjifoundation.org",      "+91 7022068106"],
			["Saravana G",          "saravana.g@azimpremjifoundation.org",        "+91 9380861952"],
			["Augustin Moses R",    "augustin.moses@azimpremjifoundation.org",    "+91 8667719594"],
			["Mercy Selvanayagi R", "mercy.selvanayagi@azimpremjifoundation.org", "+91 9047828687"],
			["Mahaveer Ram P",      "mahaveer.p@azimpremjifoundation.org",        "+91 8825879412"]
		];
		var cards = contacts.map(function (c) {
			return '<div class="contact-card">' +
				'<div class="cc-top">' +
				'<div class="cc-avatar">' + initials(c[0]) + '</div>' +
				'<div class="cc-name">'  + esc(c[0])       + '</div>' +
				'</div>' +
				'<div class="cc-divider"></div>' +
				'<div class="cc-row">' +
				'<div class="cc-icon-pill"><i class="fa fa-envelope"></i></div>' +
				'<span class="cc-val email" title="' + esc(c[1]) + '">' + esc(c[1]) + '</span>' +
				'</div>' +
				'<div class="cc-row">' +
				'<div class="cc-icon-pill"><i class="fa fa-phone"></i></div>' +
				'<span class="cc-val">' + esc(c[2]) + '</span>' +
				'</div>' +
				'</div>';
		}).join("");
		return '<div class="note-warning">' +
			'<div class="note-left-bar"></div>' +
			'<div class="note-inner">' +
			'<div class="note-header">' +
			'<div class="note-icon-ring"><i class="fa fa-exclamation"></i></div>' +
			'<div>' +
			'<div class="note-badge"><span class="note-badge-dot"></span>&nbsp;IMPORTANT</div>' +
			'<div class="note-title">Before importing, please carefully cross-verify the allocated Units and Cost Centers listed below. If you notice any discrepancies, contact the support team immediately.</div>' +
			'</div></div>' +
			'<div class="note-divider"></div>' +
			'<div class="contact-wrapper">' + cards + '</div>' +
			'</div></div>';
	}

	function sl_badge(idx) {
		return idx % 2 === 0
			? '<span class="sl-badge-odd">'  + (idx + 1) + '</span>'
			: '<span class="sl-badge-even">' + (idx + 1) + '</span>';
	}

	/* ============================================================
	   build_table_html
	   VISIBLE columns  → rendered as <th>/<td> in the UI
	   HIDDEN columns   → cost_center_id, location_code_id
	                      stored only as data-* on <tr>, never
	                      shown in the table but passed to the API
	   ALL other fields → full_name, user also stored as data-*
	============================================================ */
	function build_table_html(rows, safeId) {
		/* visible columns */
		var COLS = [
			["unit",                    "Unit"                    ],
			["unit_description",        "Unit Description"        ],
			["cost_center",             "Cost Center"             ],
			["cost_center_description", "Cost Center Description" ],
			["location_code",           "Location Code"           ],
			["location_description",    "Location Description"    ],
			["state",                   "State"                   ]
		];
		var headers = COLS.map(function (c) { return "<th>" + c[1] + "</th>"; }).join("");

		/* collect unique sorted values per column at render time
		   and embed them as JSON in data-values so cfp_open() always has them */
		var filterCells = COLS.map(function (c) {
			var uniq = {};
			rows.forEach(function (r) { var v = String(r[c[0]] || ""); if (v) uniq[v] = true; });
			var vals = JSON.stringify(Object.keys(uniq).sort());
			return '<th>' +
				'<div class="col-filter-wrap">' +
				'<button type="button" class="col-filter-btn"' +
				' data-col="'      + c[0]        + '"' +
				' data-safe-id="'  + safeId       + '"' +
				' data-values=\''  + vals.replace(/'/g, "&#39;") + '\'' +
				'>All <span class="col-filter-icon"><i class="fa fa-filter"></i></span></button>' +
				'</div></th>';
		}).join("");

		var bodyRows = rows.map(function (row, i) {
			/* ALL fields (visible + hidden) stored as data-* */
			var da =
				'data-full-name="'               + esc(row.full_name               || "") + '" ' +
				'data-user="'                    + esc(row.user                    || "") + '" ' +
				'data-unit="'                    + esc(row.unit                    || "") + '" ' +
				'data-unit-description="'        + esc(row.unit_description        || "") + '" ' +
				'data-cost-center="'             + esc(row.cost_center             || "") + '" ' +
				'data-cost-center-description="' + esc(row.cost_center_description || "") + '" ' +
				'data-cost-center-id="'          + esc(row.cost_center_id          || "") + '" ' +  /* hidden */
				'data-location-code="'           + esc(row.location_code           || "") + '" ' +
				'data-location-description="'    + esc(row.location_description    || "") + '" ' +
				'data-location-code-id="'        + esc(row.location_code_id        || "") + '" ' +  /* hidden */
				'data-state="'                   + esc(row.state                   || "") + '"';
			/* only visible COLS rendered as <td> */
			var cells = COLS.map(function (c) { return "<td>" + esc(row[c[0]] || "") + "</td>"; }).join("");
			return '<tr ' + da + '>' +
				'<td class="cb-cell"><input type="checkbox" class="row-select-cb"></td>' +
				'<td>' + sl_badge(i) + '</td>' +
				cells +
				'</tr>';
		}).join("");
		return '<div class="table-wrapper">' +
			'<table class="mis-table" data-safe-id="' + safeId + '">' +
			'<thead><tr>' +
			'<th class="cb-cell"><input type="checkbox" class="bulk-all-cb" data-safe-id="' + safeId + '"></th>' +
			'<th>Sl. No.</th>' + headers +
			'</tr></thead>' +
			'<tbody>' + bodyRows + '</tbody>' +
			'</table></div>';
	}

	/* ============================================================
	   DOWNLOAD
	   entity_data sent to start_budget_template_generation:
	   [
	     {
	       "full_name": "...",
	       "user": "...",
	       "unit": "...",
	       "unit_description": "...",
	       "cost_center": "...",
	       "cost_center_description": "...",
	       "cost_center_id": "...",
	       "location_code": "...",
	       "location_description": "...",
	       "location_code_id": "..."
	     }, ...
	   ]
	   null when downloading all rows (API uses its own full set).
	============================================================ */
	function run_download($btn, userEmail, safeId) {
		var selected      = (safeId && safeId !== "null") ? get_selected_rows(safeId) : [];
		var entityDataArg = selected.length ? JSON.stringify(selected) : null;

		reset_btn($btn, true, "Downloading...");
		Loader.show("Generating your template...");

		var pct = 0;
		var timer = setInterval(function () {
			pct = Math.min(pct + (pct < 40 ? 3 : pct < 70 ? 1.5 : 0.4), 84);
			Loader.setProgress(pct);
		}, 300);

		function on_done(success) {
			clearInterval(timer);
			if (success) {
				Loader.setProgress(100);
				Loader.setText("Download ready!");
				setTimeout(function () {
					Loader.hide();
					reset_btn($btn, false);
					if (safeId) deselect_all(safeId);
				}, 800);
			} else {
				Loader.hide();
				reset_btn($btn, false);
			}
		}

		frappe.call({
			method  : "annual_budget.api.export_reports.start_budget_template_generation",
			args    : {
				user        : userEmail,
				entity_data : entityDataArg   /* null = full template; JSON string = selected rows with all fields */
			},
			callback: function () {
				clearInterval(timer);
				Loader.setText("Fetching your template...");
				pct   = 30;
				timer = setInterval(function () { pct = Math.min(pct + 0.3, 84); Loader.setProgress(pct); }, 400);

				var polling = false;
				var stopped = false;

				var pollTimer = setInterval(function () {
					if (polling || stopped) return;
					polling = true;
					fetch(
						"/api/method/annual_budget.api.export_reports.download_generated_template?user=" + encodeURIComponent(userEmail),
						{ headers: { "X-Frappe-CSRF-Token": frappe.csrf_token } }
					)
					.then(function (resp) {
						if (!resp.ok) { polling = false; throw new Error("Server returned " + resp.status); }
						var ct = resp.headers.get("content-type") || "";
						if (ct.indexOf("application/json") !== -1) {
							return resp.json().then(function () { polling = false; Loader.setText("Still generating, please wait..."); });
						}
						stopped = true;
						clearInterval(pollTimer);
						clearInterval(timer);
						Loader.setProgress(95);
						Loader.setText("Preparing file...");
						var disp     = resp.headers.get("Content-Disposition") || "";
						var match    = disp.match(/filename[^;=\n]*=["']?([^"';\n]+)/);
						var filename = match ? decodeURIComponent(match[1].trim()) : "Budget_Import_Template.xlsx";
						return resp.blob().then(function (blob) {
							var url = URL.createObjectURL(blob);
							var a   = document.createElement("a");
							a.href = url; a.download = filename;
							document.body.appendChild(a); a.click(); a.remove();
							setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
							on_done(true);
						});
					})
					.catch(function (err) {
						if (stopped) return;
						stopped = true;
						clearInterval(pollTimer); clearInterval(timer);
						on_done(false);
						frappe.msgprint({ title: "Download Failed", message: "Could not download the template.<br><small>" + err.message + "</small>", indicator: "red" });
					});
				}, 3000);
			},
			error: function () {
				clearInterval(timer); on_done(false);
				frappe.msgprint({ title: "Error", message: "Could not start template generation. Please try again.", indicator: "red" });
			}
		});
	}

	function check_and_download($btn, userEmail, isAdmin) {
		reset_btn($btn, true, "Checking...");
		frappe.call({
			method  : "frappe.client.get_value",
			args    : { doctype: "Finance user access", filters: { user: userEmail }, fieldname: "import_template_id" },
			callback: function (r) {
				var tid = r.message && r.message.import_template_id;
				if (!tid) {
					reset_btn($btn, false);
					show_apf_modal({
						title    : '<i class="fa fa-exclamation-triangle"></i> ' + (isAdmin ? "Template Not Configured" : "Import Template Missing"),
						icon     : "fa-exclamation-triangle",
						iconColor: isAdmin ? "#e67e22" : "#e74c3c",
						text     : isAdmin ? "No Import Template is linked for this user account." : "Import Template is not configured for this account.",
						sub      : isAdmin
							? "The <b>import_template_id</b> field in <b>Finance User Access</b> is empty for <b>" + esc(userEmail) + "</b>. Please assign a valid Import Template before retrying."
							: "Please contact your administrator to link an <b>Import Template</b> in <b>Finance User Access</b> before downloading.",
						buttons  : [{ label: '<i class="fa fa-times"></i> Close', cls: "btn-default", onClick: hide_apf_modal }]
					});
					return;
				}
				if (isAdmin) {
					run_download($btn, userEmail, null);
				} else {
					reset_btn($btn, false);
					show_apf_modal({
						title       : '<i class="fa fa-download"></i> Confirm Download',
						icon        : "fa-exclamation-triangle",
						iconColor   : "#e74c3c",
						text        : "Please carefully review and validate all allocated Units, Cost Centers, and Location Codes before downloading.",
						sub         : "Do not proceed unless everything has been reviewed and confirmed.",
						showCheckbox: true,
						buttons     : [
							{ label: '<i class="fa fa-times"></i> Cancel', cls: "btn-default", onClick: hide_apf_modal },
							{ id: "apf-modal-proceed", label: '<i class="fa fa-download"></i> Proceed to Download', cls: "btn-primary", disabled: true,
							  onClick: function () { hide_apf_modal(); run_download($btn, userEmail, null); } }
						]
					});
				}
			},
			error: function () {
				reset_btn($btn, false);
				frappe.msgprint({ title: "Check Failed", message: "Could not verify the Import Template. Please try again.", indicator: "red" });
			}
		});
	}

	/* ============================================================
	   RENDER CONTENT
	============================================================ */
	function render_content(container, data) {
		var roles                = Array.isArray(frappe.user_roles) ? frappe.user_roles : [];
		var isFinanceCoordinator = roles.indexOf("Finance Unit Coordinator") !== -1;
		var isSystemManager      = roles.indexOf("System Manager") !== -1;
		var isFinanceAdmin       = roles.indexOf("Finance Admin") !== -1;
		var needsModal           = isFinanceCoordinator && !isSystemManager && !isFinanceAdmin;
		var isCollapsible        = isSystemManager || isFinanceAdmin;

		var grouped = {};
		data.forEach(function (row) {
			if (!grouped[row.user]) {
				grouped[row.user] = { user_fullname: row.full_name || "", email: row.user, rows: [] };
			}
			grouped[row.user].rows.push(row);
		});

		container.empty();

		if (isCollapsible) {
			container.append(
				'<div class="global-user-search-wrap">' +
				'<div class="gus-label"><i class="fa fa-users"></i> Search User</div>' +
				'<div class="gus-inner">' +
				'<div class="gus-icon-pill"><i class="fa fa-search"></i></div>' +
				'<input type="text" id="admin-user-search" class="gus-input" placeholder="Search by name or email..." autocomplete="off"/>' +
				'<div id="admin-user-search-clear" class="gus-clear" title="Clear" style="display:none;">&#10005;</div>' +
				'</div>' +
				'<div id="admin-user-search-count" class="gus-count" style="display:none;"></div>' +
				'</div>'
			);
		}

		Object.keys(grouped).forEach(function (key) {
			var userData    = grouped[key];
			var displayName = userData.user_fullname || userData.email;
			var rowCount    = userData.rows.length;
			var safeId      = userData.email.replace(/[^a-z0-9]/gi, "_");
			var cbId        = "expand-cb-" + safeId;

			var expandHtml = isCollapsible
				? '<div class="expand-toggle-wrap">' +
				  '<label class="expand-toggle-label" for="' + cbId + '">' +
				  '<input type="checkbox" id="' + cbId + '" class="expand-toggle-cb">' +
				  '<span class="expand-toggle-btn">Expand</span>' +
				  '</label>' +
				  '<span class="expand-row-count">' + rowCount + " row" + (rowCount !== 1 ? "s" : "") + '</span>' +
				  '</div>'
				: "";

			var $section = $(
				'<div class="user-section" data-name="' + esc(displayName.toLowerCase()) + '" data-email="' + esc(userData.email.toLowerCase()) + '">' +
				'<div class="profile-card ' + (isCollapsible ? "profile-collapsible" : "") + '">' +
				'<div class="profile-left">' +
				'<div class="uhi-avatar">' + esc(initials(displayName)) + '</div>' +
				'<div class="uhi-info">' +
				'<div class="user-name">'  + esc(displayName)   + '</div>' +
				'<div class="user-email">' + esc(userData.email) + '</div>' +
				'</div></div>' +
				'<div class="profile-right">' + expandHtml + '</div>' +
				'</div>' +
				'<div class="dl-tip-banner">' +
				'<div class="dl-tip-icon-wrap"><i class="fa fa-info-circle"></i></div>' +
				'<div class="dl-tip-text">' +
				'<strong>How to download</strong> &mdash; Click <span class="dl-tip-em">Download all</span> to get the full template, or tick specific rows and the button will switch to <span class="dl-tip-em">Download selected</span>.' +
				'</div>' +
				'<span class="dl-tip-close" title="Dismiss">&times;</span>' +
				'</div>' +
				'<div class="user-body" style="display:' + (isCollapsible ? "none" : "block") + ';">' +
				'<div class="note-slot"></div>' +
				'<div class="connector-slot"></div>' +
				'<div class="tbl-card">' +
				'<div class="tbl-action-bar">' +
				'<div class="tbl-bar-left">' +
				'<div class="tbl-search-inner">' +
				'<div class="tbl-search-icon-pill"><i class="fa fa-search"></i></div>' +
				'<input type="text" id="tbl-search-' + safeId + '" class="tbl-search-input" data-safe-id="' + safeId + '" placeholder="Search units, cost centers, locations..." autocomplete="off"/>' +
				'<div id="tbl-clear-' + safeId + '" class="tbl-search-clear" data-safe-id="' + safeId + '" title="Clear" style="display:none;">&#10005;</div>' +
				'</div>' +
				'<span id="tbl-count-' + safeId + '" class="tbl-search-count" style="display:none;"></span>' +
				'</div>' +
				'<div class="tbl-bar-right">' +
				'<label class="tbl-bulk-label" title="Select / deselect all visible rows">' +
				'<input type="checkbox" id="bulk-cb-' + safeId + '" class="bulk-all-cb" data-safe-id="' + safeId + '">' +
				'<span class="tbl-bulk-text">Select all</span>' +
				'</label>' +
				'<span class="tbl-sel-badge" id="tbl-sel-badge-' + safeId + '" style="display:none;"></span>' +
				'<button class="tbl-desel-btn" data-safe-id="' + safeId + '" style="display:none;"><i class="fa fa-times"></i> Deselect all</button>' +
				'<div class="button-container"></div>' +
				'</div></div>' +
				'<div class="table-slot"></div>' +
				'</div>' +
				'</div></div>'
			);

			container.append($section);

			if (needsModal) {
				$section.find(".note-slot").html(build_note_html());
				$section.find(".connector-slot").html('<div class="note-to-table-gap"></div>');
			} else {
				$section.find(".connector-slot").html('<div class="section-spacer"></div>');
			}

			$section.find(".table-slot").html(build_table_html(userData.rows, safeId));

			if (isCollapsible) {
				$section.find(".expand-toggle-cb").on("change", function () {
					var $body = $section.find(".user-body");
					var $card = $section.find(".profile-card");
					var $txt  = $section.find(".expand-toggle-btn");
					if (this.checked) {
						$body.slideDown(200); $card.addClass("is-open"); $txt.text("Collapse");
					} else {
						$body.slideUp(200); $card.removeClass("is-open"); $txt.text("Expand");
						run_table_search(safeId, ""); deselect_all(safeId);
					}
				});
			}

			(function (sid, email, admin) {
				var $dlBtn = $(
					'<button class="dl-btn-main dl-btn">' +
					'<i class="fa fa-download dl-btn-icon"></i>' +
					'<div class="dl-btn-body">' +
					'<span class="dl-btn-label" id="dl-lbl-' + sid + '">Download all</span>' +
					'<span class="dl-btn-count" id="dl-cnt-' + sid + '">' + rowCount + ' rows \u00b7 full template</span>' +
					'</div></button>'
				);
				$section.find(".tbl-bar-right .button-container").append($dlBtn);
				$dlBtn.on("click", function () {
					var anySelected = $(".mis-table[data-safe-id='" + sid + "'] .row-select-cb:checked").length > 0;
					if (anySelected) { show_review_modal(sid, email); }
					else             { check_and_download($(this), email, admin); }
				});
			})(safeId, userData.email, !needsModal);
		});

		$(document)
			.off(".rowSelect")
			.on("change.rowSelect", ".bulk-all-cb", function () {
				var sid     = $(this).data("safe-id");
				var checked = this.checked;
				$(".mis-table[data-safe-id='" + sid + "'] tbody tr:visible").each(function () {
					$(this).find(".row-select-cb").prop("checked", checked);
					$(this).toggleClass("row-selected", checked);
				});
				sync_bulk_cb(sid);
				update_dl_btn_state(sid);
				update_toolbar_actions(sid);
			})
			.on("change.rowSelect", ".row-select-cb", function () {
				var $row = $(this).closest("tr");
				var sid  = $(this).closest(".mis-table").data("safe-id");
				$row.toggleClass("row-selected", this.checked);
				sync_bulk_cb(sid);
				update_dl_btn_state(sid);
				update_toolbar_actions(sid);
			});

		$(document)
			.off(".selSubmit")
			.on("click.selSubmit", ".tbl-desel-btn", function () {
				deselect_all($(this).data("safe-id"));
			});

		$(document)
			.off(".tblSearch")
			.on("input.tblSearch", ".tbl-search-input", function () {
				run_table_search($(this).data("safe-id"), this.value);
			})
			.on("click.tblSearch", ".tbl-search-clear", function () {
				var sid = $(this).data("safe-id");
				$("#tbl-search-" + sid).val("");
				run_table_search(sid, "");
			});

		$(document)
			.off(".tipDismiss")
			.on("click.tipDismiss", ".dl-tip-close", function () {
				$(this).closest(".dl-tip-banner").slideUp(200);
			});

		/* ── Excel-style column filter dropdowns ──────────────────
		   All state lives on the button element via $.data()
		   so it survives across open/close cycles.
		   colValues are read live from the DOM on each panel open.
		================================================================ */
		var _cfpBtn    = null;   /* currently open button */
		var _cfpPanel  = null;   /* currently open panel element */

		function cfp_close() {
			if (_cfpPanel) { $(_cfpPanel).remove(); _cfpPanel = null; }
			if (_cfpBtn)   { $(_cfpBtn).removeClass("active");        _cfpBtn  = null; }
		}

		/* read unique values directly from the table rows for a given col */
		function cfp_unique_values(sid, col) {
			var uniq = {};
			$(".mis-table[data-safe-id='" + sid + "'] tbody tr").each(function () {
				var v = String($(this).data(col.replace(/_/g, "-")) || "");
				if (v) uniq[v] = true;
			});
			return Object.keys(uniq).sort();
		}

		function cfp_apply(sid) {
			var filters = {};
			$(".col-filter-btn[data-safe-id='" + sid + "']").each(function () {
				var col = $(this).data("col");
				var sel = $(this).data("cfp-selected") || [];
				if (sel.length) filters[col] = sel;
			});
			var visible = 0;
			$(".mis-table[data-safe-id='" + sid + "'] tbody tr").each(function () {
				var $row = $(this), show = true;
				$.each(filters, function (col, sel) {
					var v = String($row.data(col.replace(/_/g, "-")) || "");
					if (sel.indexOf(v) === -1) { show = false; return false; }
				});
				$row.toggle(show);
				if (show) visible++;
			});
			sync_bulk_cb(sid);
			var $count = $("#tbl-count-" + sid);
			if (Object.keys(filters).length) {
				$count.text(visible + " row" + (visible !== 1 ? "s" : "") + " matched").show();
			} else {
				$count.hide();
			}
		}

		function cfp_update_btn($btn, sel) {
			if (!sel || !sel.length) {
				$btn.html("All").removeClass("filtered");
			} else if (sel.length === 1) {
				$btn.html(esc(sel[0]) + ' <span class="col-filter-count">1</span>').addClass("filtered");
			} else {
				$btn.html('Filtered <span class="col-filter-count">' + sel.length + '</span>').addClass("filtered");
			}
		}

		function cfp_open($btn) {
			cfp_close();
			var sid     = $btn.data("safe-id");
			var col     = $btn.data("col");
			/* read values embedded at render time — always available */
			var allVals = [];
			try { allVals = JSON.parse($btn.attr("data-values") || "[]"); } catch(e) {}
			var sel     = ($btn.data("cfp-selected") || []).slice();

			/* position panel using fixed coords from button rect */
			var rect    = $btn[0].getBoundingClientRect();
			var $panel  = $('<div class="col-filter-panel"></div>').css({
				top  : rect.bottom + 3,
				left : rect.left,
				width: Math.max(rect.width, 200)
			});

			/* search */
			$panel.append('<div class="cfp-search-wrap"><input class="cfp-search" type="text" placeholder="Search values..." autocomplete="off"></div>');

			/* select all / clear */
			$panel.append('<div class="cfp-actions"><button type="button" class="cfp-action-btn cfp-sel-all">Select All</button><button type="button" class="cfp-action-btn cfp-clear">Clear</button></div>');

			var $list = $('<div class="cfp-list"></div>');
			$panel.append($list);

			function render_list(q) {
				$list.empty();
				var filtered = allVals.filter(function (v) {
					return !q || v.toLowerCase().indexOf(q.toLowerCase()) !== -1;
				});
				if (!filtered.length) { $list.append('<div class="cfp-empty">No values found</div>'); return; }
				filtered.forEach(function (v) {
					var chk = sel.indexOf(v) !== -1;
					var $item = $('<label class="cfp-item">' +
						'<input type="checkbox" value="' + esc(v) + '"' + (chk ? " checked" : "") + '>' +
						'<span>' + esc(v) + '</span></label>');
					$item.find("input").on("change", function () {
						if (this.checked) { if (sel.indexOf(v) === -1) sel.push(v); }
						else              { sel = sel.filter(function (s) { return s !== v; }); }
						$btn.data("cfp-selected", sel.slice());
						cfp_update_btn($btn, sel);
						cfp_apply(sid);
					});
					$list.append($item);
				});
			}

			render_list("");

			$panel.find(".cfp-search").on("input", function () { render_list(this.value); });

			$panel.find(".cfp-sel-all").on("click", function () {
				var q = $panel.find(".cfp-search").val();
				allVals.filter(function (v) {
					return !q || v.toLowerCase().indexOf(q.toLowerCase()) !== -1;
				}).forEach(function (v) { if (sel.indexOf(v) === -1) sel.push(v); });
				$btn.data("cfp-selected", sel.slice());
				render_list(q);
				cfp_update_btn($btn, sel);
				cfp_apply(sid);
			});

			$panel.find(".cfp-clear").on("click", function () {
				sel = [];
				$btn.data("cfp-selected", []);
				render_list($panel.find(".cfp-search").val());
				cfp_update_btn($btn, sel);
				cfp_apply(sid);
			});

			$("body").append($panel);
			_cfpPanel = $panel[0];
			_cfpBtn   = $btn[0];
			$btn.addClass("active");

			/* close on outside click */
			setTimeout(function () {
				$(document).one("click.cfpOutside", function (e) {
					if (!$(e.target).closest(".col-filter-panel, .col-filter-btn").length) {
						cfp_close();
					}
				});
			}, 10);
		}

		$(document)
			.off(".colFilter")
			.on("click.colFilter", ".col-filter-btn", function (e) {
				e.stopPropagation();
				var $btn = $(this);
				if (_cfpBtn === $btn[0]) { cfp_close(); }
				else                     { cfp_open($btn); }
			});

		if (isCollapsible) {
			$(document)
				.off(".adminUserSearch")
				.on("input.adminUserSearch", "#admin-user-search", function () { run_user_search(this.value); })
				.on("click.adminUserSearch", "#admin-user-search-clear", function () {
					$("#admin-user-search").val(""); run_user_search("");
				});
			$("#admin-user-search-clear").hide();
		}
	}

	/* ============================================================
	   INIT
	============================================================ */
	$container.html('<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Loading Data...</div>');

	frappe.call({
		method  : "annual_budget.api.filter_options.get_user_mappings",
		callback: function (r) {
			if (!r.message || !r.message.length) {
				$container.html('<div class="empty-state"><i class="fa fa-inbox"></i> No Data Found</div>');
				return;
			}
			render_content($container, r.message);
		}
	});

};