// // // ---------------------------------------------------------------------------
// // // CONSOLIDATED REPORT PAGE (FIXED SEARCH BAR, FIXED ENTITY HEADER, RESPONSIVE BLUE/ORANGE THEME)
// // // ---------------------------------------------------------------------------

// // frappe.pages['consolidate-report'].on_page_load = function (wrapper) {
// // 	const page = frappe.ui.make_app_page({
// // 		parent: wrapper,
// // 		title: 'Consolidated Report',
// // 		single_column: true
// // 	});

// // 	const html = `
// // 	<div class="dashboard-wrapper">

// // 		<h2 class="table-title">Consolidated Report</h2>

// // 		<!-- FILTERS -->
// // 		<div class="filter-container">
// // 			<div id="financial-year-field"></div>
// // 			<div id="month-field"></div>
// // 			<button id="refresh-report">Apply</button>
// // 		</div>

// // 		<!-- SUMMARY CARDS -->
// // 		<div id="summary-cards" class="frappe-number-cards"></div>

// // 		<!-- STICKY SEARCH BAR -->
// // 		<div class="table-controls">
// // 			<div class="search-bar">
// // 				<input type="text" id="search-input" placeholder="🔍 Search expense..." />
// // 			</div>
// // 		</div>

// // 		<!-- SCROLLABLE TABLE -->
// // 		<div class="scroll-wrapper">
// // 			<table class="university-table" id="expense-table">
// // 				<thead id="table-header"></thead>
// // 				<tbody id="table-body"></tbody>
// // 			</table>
// // 		</div>
// // 	</div>

// // 	<style>
// // 		/* === BASE LAYOUT === */
// // 		.dashboard-wrapper {
// // 			padding: 16px;
// // 			background-color: #fff;
// // 			color: #111;
// // 		}
// // 		h2.table-title {
// // 			color: #0076B6;
// // 			font-size: 20px;
// // 			font-weight: 700;
// // 			margin-bottom: 14px;
// // 		}

// // 		/* --- FILTERS --- */
// // 		.filter-container {
// // 			display: flex;
// // 			flex-wrap: wrap;
// // 			align-items: center;
// // 			gap: 10px;
// // 			margin-bottom: 12px;
// // 		}
// // 		select, button {
// // 			padding: 6px 10px;
// // 			border: 1px solid #ccc;
// // 			border-radius: 4px;
// // 			font-size: 13px;
// // 			background: #fff;
// // 			min-width: 120px;
// // 		}
// // 		button {
// // 			background-color: #0076B6;
// // 			color: white;
// // 			cursor: pointer;
// // 			border: none;
// // 			transition: 0.2s;
// // 		}
// // 		button:hover { background-color: #005f8d; }

// // 		/* --- SUMMARY CARDS --- */
// // 		.frappe-number-cards {
// // 			display: flex;
// // 			flex-wrap: wrap;
// // 			gap: 16px;
// // 			margin: 18px 0;
// // 		}
// // 		.frappe-card {
// // 			flex: 1 1 260px;
// // 			max-width: 280px;
// // 			height: 120px;
// // 			background: #fff;
// // 			border: 1px solid #ccc;
// // 			border-radius: 8px;
// // 			display: flex;
// // 			flex-direction: column;
// // 			justify-content: center;
// // 			align-items: flex-start;
// // 			padding: 14px 18px;
// // 			box-shadow: 0 2px 6px rgba(0,0,0,0.08);
// // 		}
// // 		.frappe-card-value {
// // 			font-size: 18px;
// // 			font-weight: 600;
// // 			color: #0076B6;
// // 		}

// // 		/* --- STICKY SEARCH BAR --- */
// // 		.table-controls {
// // 			position: sticky;
// // 			top: 0;
// // 			z-index: 60;
// // 			display: flex;
// // 			justify-content: flex-start;
// // 			align-items: center;
// // 			padding: 6px 10px;
// // 			border: 1px solid #0076B6;
// // 			border-radius: 4px 4px 0 0;
// // 			background-color: #fff;
// // 			border-bottom: 3px solid #0076B6;
// // 		}
// // 		.search-bar input {
// // 			width: 240px;
// // 			border: 1px solid #ccc;
// // 			border-radius: 4px;
// // 			padding: 6px 8px;
// // 			font-size: 13px;
// // 		}

// // 		/* --- SCROLLABLE TABLE --- */
// // 		.scroll-wrapper {
// // 			border: 1px solid #000;
// // 			border-radius: 0 0 4px 4px;
// // 			overflow-x: auto;
// // 			overflow-y: auto;
// // 			max-height: 55vh;
// // 			width: 100%;
// // 			position: relative;
// // 		}

// // 		table.university-table {
// // 			min-width: 1200px;
// // 			width: 100%;
// // 			border-collapse: collapse;
// // 			font-size: 13px;
// // 			text-align: center;
// // 			color: #111;
// // 		}
// // 		table.university-table th,
// // 		table.university-table td {
// // 			border: 1px solid #000;
// // 			padding: 6px 8px;
// // 			white-space: nowrap;
// // 			vertical-align: middle;
// // 		}

// // 		/* --- FIXED STICKY HEADERS (NO OVERLAP) --- */
// // 		table.university-table thead th {
// // 			position: sticky;
// // 			background-clip: padding-box;
// // 			z-index: 10;
// // 		}

// // 		table.university-table thead tr:first-child th {
// // 			background-color: #0076B6;
// // 			color: #fff;
// // 			top: 0;
// // 			height: 34px;
// // 			z-index: 60; /* topmost row */
// // 		}

// // 		table.university-table thead tr:nth-child(2) th {
// // 			background-color: #F26B21;
// // 			color: #fff;
// // 			top: 34px;
// // 			height: 34px;
// // 			z-index: 59;
// // 		}

// // 		table.university-table thead tr:nth-child(3) th {
// // 			background-color: #f3f4f6;
// // 			top: 68px;
// // 			height: 34px;
// // 			z-index: 58;
// // 		}

// // 		/* --- FIXED STICKY FIRST COLUMN (NO OVERLAP) --- */
// // 		table.university-table th:first-child,
// // 		table.university-table td:first-child {
// // 			position: sticky;
// // 			left: 0;
// // 			background-color: #fff;
// // 			z-index: 65; /* above other cells */
// // 			text-align: left;
// // 			box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
// // 		}

// // 		table.university-table thead tr:first-child th:first-child {
// // 			background-color: #0076B6;
// // 			color: #fff;
// // 			z-index: 70;
// // 		}
// // 		table.university-table thead tr:nth-child(2) th:first-child {
// // 			background-color: #F26B21;
// // 			color: #fff;
// // 			z-index: 69;
// // 		}
// // 		table.university-table thead tr:nth-child(3) th:first-child {
// // 			background-color: #f3f4f6;
// // 			z-index: 68;
// // 		}

// // 		/* --- TOTAL ROW --- */
// // 		.total-row {
// // 			font-weight: 700;
// // 			background-color: #f9f9f9 !important;
// // 			border-top: 2px solid #000;
// // 			border-bottom: 2px solid #000;
// // 		}
// // 		.total-row td:first-child {
// // 			text-align: right;
// // 			background-color: #f9f9f9 !important;
// // 		}

// // 		/* --- SCROLLBAR POLISH --- */
// // 		.scroll-wrapper {
// // 			scrollbar-width: thin;
// // 			scrollbar-color: #0076B6 #f1f1f1;
// // 		}
// // 		.scroll-wrapper::-webkit-scrollbar {
// // 			height: 8px;
// // 		}
// // 		.scroll-wrapper::-webkit-scrollbar-thumb {
// // 			background-color: #0076B6;
// // 			border-radius: 4px;
// // 		}
// // 		.scroll-wrapper::-webkit-scrollbar-track {
// // 			background: #f1f1f1;
// // 		}

// // 		/* --- RESPONSIVE --- */
// // 		@media (max-width: 992px) {
// // 			.filter-container { flex-direction: column; align-items: flex-start; }
// // 			select, button { width: 100%; max-width: 300px; }
// // 			h2.table-title { font-size: 18px; }
// // 			.search-bar input { width: 100%; }
// // 		}
// // 		@media (max-width: 600px) {
// // 			table.university-table { font-size: 12px; }
// // 			select, button { font-size: 12px; }
// // 		}
// // 	</style>
// // 	`;

// // 	$(page.body).html(html);

// // 	// Filters
// // 	const fyField = frappe.ui.form.make_control({
// // 		parent: $('#financial-year-field'),
// // 		df: { fieldname: 'financial_year', label: 'Financial Year', fieldtype: 'Link', options: 'Financial Year' },
// // 		render_input: true
// // 	});
// // 	fyField.refresh();
// // 	window.fyField = fyField;

// // 	const monthField = frappe.ui.form.make_control({
// // 		parent: $('#month-field'),
// // 		df: { fieldname: 'month', label: 'Month', fieldtype: 'Link', options: 'Month' },
// // 		render_input: true
// // 	});
// // 	monthField.refresh();
// // 	window.monthField = monthField;

// // 	// Events
// // 	document.getElementById("refresh-report").addEventListener("click", loadConsolidatedReport);
// // 	document.getElementById("search-input").addEventListener("input", filterTable);
// // 	fyField.$input.on("change", loadConsolidatedReport);

// // 	loadConsolidatedReport();
// // };

// // // ---------------------------------------------------------------------------
// // // DATA FETCH + RENDER
// // // ---------------------------------------------------------------------------

// // function loadConsolidatedReport() {
// // 	const fy = window.fyField ? fyField.get_value() : "";

// // 	frappe.call({
// // 		method: "annual_budget.api.finance_budget.get_consolidated_report",
// // 		args: { financial_year: fy },
// // 		freeze: true,
// // 		freeze_message: "Loading Consolidated Data...",
// // 		callback: function (r) {
// // 			const data = r.message?.entities || [];
// // 			if (!data.length) {
// // 				document.getElementById("table-body").innerHTML =
// // 					"<tr><td colspan='99' style='text-align:center;'>No data found</td></tr>";
// // 				document.getElementById("summary-cards").innerHTML = "";
// // 				return;
// // 			}
// // 			renderSummaryCards(data);
// // 			renderExpenseTable(data);
// // 		},
// // 	});
// // }

// // // ---------------------------------------------------------------------------
// // // SUMMARY CARDS
// // // ---------------------------------------------------------------------------

// // function renderSummaryCards(entities) {
// // 	const container = document.getElementById("summary-cards");
// // 	container.innerHTML = "";
// // 	entities.forEach(e => {
// // 		const total = e.cost_centers.reduce((sum, cc) =>
// // 			sum + (cc.data.reduce((a, d) => a + (d.budget || 0), 0)), 0);
// // 		container.innerHTML += `
// // 			<div class="frappe-card">
// // 				<div class="frappe-card-title">${e.name}</div>
// // 				<div class="frappe-card-value">₹ ${total.toLocaleString()}</div>
// // 			</div>`;
// // 	});
// // }

// // // ---------------------------------------------------------------------------
// // // TABLE RENDER
// // // ---------------------------------------------------------------------------

// // function renderExpenseTable(entities) {
// // 	const header = document.getElementById("table-header");
// // 	const body = document.getElementById("table-body");
// // 	header.innerHTML = "";
// // 	body.innerHTML = "";

// // 	const visibleCols = ["Budget", "Actuals", "Previous Year"];

// // 	let entityRow = `<tr><th rowspan="3">Expenses</th>`;
// // 	entities.forEach(e => {
// // 		const totalCols = e.cost_centers.length * visibleCols.length;
// // 		entityRow += `<th colspan="${totalCols}">${e.name}</th>`;
// // 	});
// // 	entityRow += `</tr>`;

// // 	let ccRow = "<tr>";
// // 	entities.forEach(e => {
// // 		e.cost_centers.forEach(cc => {
// // 			ccRow += `<th colspan="${visibleCols.length}">${cc.name}</th>`;
// // 		});
// // 	});
// // 	ccRow += "</tr>";

// // 	let metricRow = "<tr>";
// // 	entities.forEach(e => {
// // 		e.cost_centers.forEach(() => {
// // 			visibleCols.forEach(v => metricRow += `<th>${v}</th>`);
// // 		});
// // 	});
// // 	metricRow += "</tr>";

// // 	header.innerHTML = entityRow + ccRow + metricRow;

// // 	const allExpenses = new Set();
// // 	entities.forEach(e =>
// // 		e.cost_centers.forEach(cc =>
// // 			cc.data.forEach(d => allExpenses.add(d.type_of_expense))
// // 		)
// // 	);

// // 	let bodyHTML = "";
// // 	allExpenses.forEach(exp => {
// // 		bodyHTML += `<tr><td>${exp}</td>`;
// // 		entities.forEach(e => {
// // 			e.cost_centers.forEach(cc => {
// // 				const row = cc.data.find(d => d.type_of_expense === exp);
// // 				visibleCols.forEach(metric => {
// // 					const val =
// // 						metric === "Budget" ? row?.budget ?? 0 :
// // 						metric === "Actuals" ? row?.actuals ?? 0 :
// // 						row?.previous_year ?? 0;
// // 					bodyHTML += `<td>₹ ${(val || 0).toLocaleString()}</td>`;
// // 				});
// // 			});
// // 		});
// // 		bodyHTML += `</tr>`;
// // 	});

// // 	let grandRow = `<tr class="total-row"><td>Grand Total</td>`;
// // 	entities.forEach(e => {
// // 		e.cost_centers.forEach(cc => {
// // 			visibleCols.forEach(metric => {
// // 				const val =
// // 					metric === "Budget"
// // 						? cc.data.reduce((a, d) => a + (d.budget || 0), 0)
// // 						: metric === "Actuals"
// // 						? cc.data.reduce((a, d) => a + (d.actuals || 0), 0)
// // 						: cc.data.reduce((a, d) => a + (d.previous_year || 0), 0);
// // 				grandRow += `<td>₹ ${val.toLocaleString()}</td>`;
// // 			});
// // 		});
// // 	});
// // 	grandRow += "</tr>";

// // 	body.innerHTML = bodyHTML + grandRow;
// // }

// // // ---------------------------------------------------------------------------
// // // SEARCH FILTER
// // // ---------------------------------------------------------------------------

// // function filterTable() {
// // 	const term = document.getElementById("search-input").value.toLowerCase();
// // 	document.querySelectorAll("#table-body tr").forEach(row => {
// // 		const match = row.querySelector("td:first-child")?.innerText.toLowerCase().includes(term);
// // 		row.style.display = match || row.classList.contains("total-row") ? "" : "none";
// // 	});
// // }



// // ---------------------------------------------------------------------------
// // CONSOLIDATED REPORT PAGE (FIXED SEARCH BAR, FIXED ENTITY HEADER, RESPONSIVE BLUE/ORANGE THEME)
// // ---------------------------------------------------------------------------





// // frappe.pages['consolidate-report'].on_page_load = function (wrapper) {
// // 	const page = frappe.ui.make_app_page({
// // 		parent: wrapper,
// // 		title: 'Consolidated Report',
// // 		single_column: true
// // 	});

// // 	const html = `
// // 	<div class="dashboard-wrapper">

// // 		<!-- SUMMARY CARDS -->
// // 		<div id="summary-cards" class="frappe-number-cards"></div>

// // 		<!-- STICKY SEARCH BAR -->
// // 		<div class="table-controls">
// // 			<div class="search-bar">
// // 				<input type="text" id="search-input" placeholder="🔍 Search expense..." />
// // 			</div>
// // 		</div>

// // 		<!-- SCROLLABLE TABLE -->
// // 		<div class="scroll-wrapper">
// // 			<table class="university-table" id="expense-table">
// // 				<thead id="table-header"></thead>
// // 				<tbody id="table-body"></tbody>
// // 			</table>
// // 		</div>
// // 	</div>

// // 	<style>
// // 		/* === BASE LAYOUT === */
// // 		.dashboard-wrapper {
// // 			padding: 16px;
// // 			background-color: #fff;
// // 			color: #111;
// // 		}
// // 		h2.table-title {
// // 			color: #0076B6;
// // 			font-size: 20px;
// // 			font-weight: 700;
// // 			margin-bottom: 14px;
// // 		}

// // 		/* --- SUMMARY CARDS --- */
// // 		.frappe-number-cards {
// // 			display: flex;
// // 			flex-wrap: wrap;
// // 			gap: 16px;
// // 			margin: 18px 0;
// // 		}
// // 		.frappe-card {
// // 			flex: 1 1 260px;
// // 			max-width: 280px;
// // 			height: 120px;
// // 			background: #fff;
// // 			border: 1px solid #ccc;
// // 			border-radius: 8px;
// // 			display: flex;
// // 			flex-direction: column;
// // 			justify-content: center;
// // 			align-items: flex-start;
// // 			padding: 14px 18px;
// // 			box-shadow: 0 2px 6px rgba(0,0,0,0.08);
// // 		}
// // 		.frappe-card-value {
// // 			font-size: 18px;
// // 			font-weight: 600;
// // 			color: #0076B6;
// // 		}

// // 		/* --- STICKY SEARCH BAR --- */
// // 		.table-controls {
// // 			position: sticky;
// // 			top: 0;
// // 			z-index: 60;
// // 			display: flex;
// // 			justify-content: flex-start;
// // 			align-items: center;
// // 			padding: 6px 10px;
// // 			border: 1px solid #0076B6;
// // 			border-radius: 4px 4px 0 0;
// // 			background-color: #fff;
// // 			border-bottom: 3px solid #0076B6;
// // 		}
// // 		.search-bar input {
// // 			width: 240px;
// // 			border: 1px solid #ccc;
// // 			border-radius: 4px;
// // 			padding: 6px 8px;
// // 			font-size: 13px;
// // 		}

// // 		/* --- SCROLLABLE TABLE --- */
// // 		.scroll-wrapper {
// // 			border: 1px solid #000;
// // 			border-radius: 0 0 4px 4px;
// // 			overflow-x: auto;
// // 			overflow-y: auto;
// // 			max-height: 55vh;
// // 			width: 100%;
// // 			position: relative;
// // 		}

// // 		table.university-table {
// // 			min-width: 1200px;
// // 			width: 100%;
// // 			border-collapse: collapse;
// // 			font-size: 13px;
// // 			text-align: center;
// // 			color: #111;
// // 		}
// // 		table.university-table th,
// // 		table.university-table td {
// // 			border: 1px solid #000;
// // 			padding: 6px 8px;
// // 			white-space: nowrap;
// // 			vertical-align: middle;
// // 		}

// // 		/* --- FIXED STICKY HEADERS (NO OVERLAP) --- */
// // 		table.university-table thead th {
// // 			position: sticky;
// // 			background-clip: padding-box;
// // 			z-index: 10;
// // 		}

// // 		table.university-table thead tr:first-child th {
// // 			background-color: #0076B6;
// // 			color: #fff;
// // 			top: 0;
// // 			height: 34px;
// // 			z-index: 60;
// // 		}

// // 		table.university-table thead tr:nth-child(2) th {
// // 			background-color: #F26B21;
// // 			color: #fff;
// // 			top: 34px;
// // 			height: 34px;
// // 			z-index: 59;
// // 		}

// // 		table.university-table thead tr:nth-child(3) th {
// // 			background-color: #f3f4f6;
// // 			top: 68px;
// // 			height: 34px;
// // 			z-index: 58;
// // 		}

// // 		/* --- FIXED STICKY FIRST COLUMN (NO OVERLAP) --- */
// // 		table.university-table th:first-child,
// // 		table.university-table td:first-child {
// // 			position: sticky;
// // 			left: 0;
// // 			background-color: #fff;
// // 			z-index: 65;
// // 			text-align: left;
// // 			box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
// // 		}

// // 		table.university-table thead tr:first-child th:first-child {
// // 			background-color: #0076B6;
// // 			color: #fff;
// // 			z-index: 70;
// // 		}
// // 		table.university-table thead tr:nth-child(2) th:first-child {
// // 			background-color: #F26B21;
// // 			color: #fff;
// // 			z-index: 69;
// // 		}
// // 		table.university-table thead tr:nth-child(3) th:first-child {
// // 			background-color: #f3f4f6;
// // 			z-index: 68;
// // 		}

// // 		/* --- TOTAL ROW --- */
// // 		.total-row {
// // 			font-weight: 700;
// // 			background-color: #f9f9f9 !important;
// // 			border-top: 2px solid #000;
// // 			border-bottom: 2px solid #000;
// // 		}
// // 		.total-row td:first-child {
// // 			text-align: right;
// // 			background-color: #f9f9f9 !important;
// // 		}

// // 		/* --- SCROLLBAR POLISH --- */
// // 		.scroll-wrapper {
// // 			scrollbar-width: thin;
// // 			scrollbar-color: #0076B6 #f1f1f1;
// // 		}
// // 		.scroll-wrapper::-webkit-scrollbar {
// // 			height: 8px;
// // 		}
// // 		.scroll-wrapper::-webkit-scrollbar-thumb {
// // 			background-color: #0076B6;
// // 			border-radius: 4px;
// // 		}
// // 		.scroll-wrapper::-webkit-scrollbar-track {
// // 			background: #f1f1f1;
// // 		}

// // 		/* --- RESPONSIVE --- */
// // 		@media (max-width: 992px) {
// // 			h2.table-title { font-size: 18px; }
// // 			.search-bar input { width: 100%; }
// // 		}
// // 		@media (max-width: 600px) {
// // 			table.university-table { font-size: 12px; }
// // 		}
// // 	</style>
// // 	`;

// // 	$(page.body).html(html);

// // 	// Events
// // 	document.getElementById("search-input").addEventListener("input", filterTable);

// // 	loadConsolidatedReport();
// // };

// // // ---------------------------------------------------------------------------
// // // DATA FETCH + RENDER
// // // ---------------------------------------------------------------------------

// // function loadConsolidatedReport() {
// // 	frappe.call({
// // 		method: "annual_budget.api.finance_budget.get_consolidated_report",
// // 		args: {},
// // 		freeze: true,
// // 		freeze_message: "Loading Consolidated Data...",
// // 		callback: function (r) {
// // 			const data = r.message?.entities || [];
// // 			if (!data.length) {
// // 				document.getElementById("table-body").innerHTML =
// // 					"<tr><td colspan='99' style='text-align:center;'>No data found</td></tr>";
// // 				document.getElementById("summary-cards").innerHTML = "";
// // 				return;
// // 			}
// // 			renderSummaryCards(data);
// // 			renderExpenseTable(data);
// // 		},
// // 	});
// // }

// // // ---------------------------------------------------------------------------
// // // SUMMARY CARDS
// // // ---------------------------------------------------------------------------

// // function renderSummaryCards(entities) {
// // 	const container = document.getElementById("summary-cards");
// // 	container.innerHTML = "";
// // 	entities.forEach(e => {
// // 		const total = e.cost_centers.reduce((sum, cc) =>
// // 			sum + (cc.data.reduce((a, d) => a + (d.budget || 0), 0)), 0);

// // 		const roundedTotal = Math.round(total); // ✅ Round the total

// // 		container.innerHTML += `
// // 			<div class="frappe-card">
// // 				<div class="frappe-card-title">${e.name}</div>
// // 				<div class="frappe-card-value">₹ ${roundedTotal.toLocaleString()}</div>
// // 			</div>`;
// // 	});
// // }


// // // ---------------------------------------------------------------------------
// // // TABLE RENDER
// // // ---------------------------------------------------------------------------

// // function renderExpenseTable(entities) {
// // 	const header = document.getElementById("table-header");
// // 	const body = document.getElementById("table-body");
// // 	header.innerHTML = "";
// // 	body.innerHTML = "";

// // 	const visibleCols = ["Budget", "Actuals", "Previous Year"];

// // 	let entityRow = `<tr><th rowspan="3">Expenses</th>`;
// // 	entities.forEach(e => {
// // 		const totalCols = e.cost_centers.length * visibleCols.length;
// // 		entityRow += `<th colspan="${totalCols}">${ e.name}</th>`;
// // 	});
// // 	entityRow += `</tr>`;

// // 	let ccRow = "<tr>";
// // 	entities.forEach(e => {
// // 		e.cost_centers.forEach(cc => {
// // 			ccRow += `<th colspan="${visibleCols.length}">${cc.name}  (₹)</th>`;
// // 		});
// // 	});
// // 	ccRow += "</tr>";

// // 	let metricRow = "<tr>";
// // 	entities.forEach(e => {
// // 		e.cost_centers.forEach(() => {
// // 			visibleCols.forEach(v => metricRow += `<th>${v}</th>`);
// // 		});
// // 	});
// // 	metricRow += "</tr>";

// // 	header.innerHTML = entityRow + ccRow + metricRow;

// // 	const allExpenses = new Set();
// // 	entities.forEach(e =>
// // 		e.cost_centers.forEach(cc =>
// // 			cc.data.forEach(d => allExpenses.add(d.type_of_expense))
// // 		)
// // 	);

// // 	let bodyHTML = "";
// // 	allExpenses.forEach(exp => {
// // 		bodyHTML += `<tr><td>${exp}</td>`;
// // 		entities.forEach(e => {
// // 			e.cost_centers.forEach(cc => {
// // 				const row = cc.data.find(d => d.type_of_expense === exp);
// // 				visibleCols.forEach(metric => {
// // 					const val =
// // 						metric === "Budget" ? row?.budget ?? 0 :
// // 						metric === "Actuals" ? row?.actuals ?? 0 :
// // 						row?.previous_year ?? 0;
// // 					bodyHTML += `<td> ${(val || 0).toLocaleString()}</td>`;
// // 				});
// // 			});
// // 		});
// // 		bodyHTML += `</tr>`;
// // 	});

// // 	let grandRow = `<tr class="total-row"><td>Grand Total (₹)</td>`;
// // 	entities.forEach(e => {
// // 		e.cost_centers.forEach(cc => {
// // 			visibleCols.forEach(metric => {
// // 				const val =
// // 					metric === "Budget"
// // 						? cc.data.reduce((a, d) => a + (d.budget || 0), 0)
// // 						: metric === "Actuals"
// // 						? cc.data.reduce((a, d) => a + (d.actuals || 0), 0)
// // 						: cc.data.reduce((a, d) => a + (d.previous_year || 0), 0);
// // 				grandRow += `<td> ${val.toLocaleString()}</td>`;
// // 			});
// // 		});
// // 	});
// // 	grandRow += "</tr>";

// // 	body.innerHTML = bodyHTML + grandRow;
// // }

// // // ---------------------------------------------------------------------------
// // // SEARCH FILTER
// // // ---------------------------------------------------------------------------

// // function filterTable() {
// // 	const term = document.getElementById("search-input").value.toLowerCase();
// // 	document.querySelectorAll("#table-body tr").forEach(row => {
// // 		const match = row.querySelector("td:first-child")?.innerText.toLowerCase().includes(term);
// // 		row.style.display = match || row.classList.contains("total-row") ? "" : "none";
// // 	});
// // }



// frappe.pages['consolidate-report'].on_page_load = function (wrapper) {

// 	const page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Consolidated Report',
// 		single_column: true
// 	});

// 	// -------------------------------------------------
// 	// HTML STRUCTURE (CARDS + TABLE)
// 	// -------------------------------------------------
// 	const html = `
// 	<div class="dashboard-wrapper">

// 		<!-- NUMBER CARDS -->
// 		<div class="card-row"></div>

// 		<!-- STICKY SEARCH BAR -->
// 		<div class="table-controls">
// 			<div class="search-bar">
// 				<input type="text" id="search-input" placeholder="🔍 Search expense..." />
// 			</div>
// 		</div>

// 		<!-- SCROLLABLE TABLE -->
// 		<div class="scroll-wrapper">
// 			<table class="university-table" id="expense-table">
// 				<thead id="table-header"></thead>
// 				<tbody id="table-body"></tbody>
// 			</table>
// 		</div>

// 	</div>
// 	`;

// 	$(page.body).html(html);

// 	// -------------------------------------------------
// 	// CSS INJECTION
// 	// -------------------------------------------------
// 	$(`
// 	<style>

// 	.page-content {
// 		background:#f5f6f8;
// 	}

// 	.dashboard-wrapper {
// 		padding: 16px;
// 		color: #111;
// 	}

// 	/* =============================
// 	   NUMBER CARDS
// 	============================= */

// 	.card-row{
// 		display:grid;
// 		grid-template-columns: repeat(4, 1fr);
// 		gap:16px;
// 		margin-bottom:20px;
// 	}

// 	.number-card{
// 		background:#ffffff;
// 		border-radius:10px;
// 		padding:18px;
// 		box-shadow:0 3px 10px rgba(0,0,0,.06);
// 		transition:.2s ease;
// 	}

// 	.number-card:hover{
// 		transform:translateY(-3px);
// 		box-shadow:0 6px 18px rgba(0,0,0,.12);
// 	}

// 	.number-title{
// 		font-size:13px;
// 		font-weight:600;
// 		text-transform:uppercase;
// 		margin-bottom:8px;
// 		letter-spacing:.5px;
// 		color:#000;
// 	}

// 	.number-value{
// 		font-size:22px;
// 		font-weight:700;
// 		color:#000;
// 	}

// 	/* =============================
// 	   TABLE CONTROLS
// 	============================= */

// 	.table-controls {
// 		position: sticky;
// 		top: 0;
// 		z-index: 60;
// 		display: flex;
// 		align-items: center;
// 		padding: 6px 10px;
// 		border: 1px solid #0076B6;
// 		border-radius: 4px 4px 0 0;
// 		background-color: #fff;
// 		border-bottom: 3px solid #0076B6;
// 	}

// 	.search-bar input {
// 		width: 240px;
// 		border: 1px solid #ccc;
// 		border-radius: 4px;
// 		padding: 6px 8px;
// 		font-size: 13px;
// 	}

// 	.scroll-wrapper {
// 		border: 1px solid #000;
// 		border-radius: 0 0 4px 4px;
// 		overflow-x: auto;
// 		overflow-y: auto;
// 		max-height: 55vh;
// 		width: 100%;
// 		position: relative;
// 	}

// 	table.university-table {
// 		min-width: 1200px;
// 		width: 100%;
// 		border-collapse: collapse;
// 		font-size: 13px;
// 		text-align: center;
// 		color: #111;
// 	}

// 	table.university-table th,
// 	table.university-table td {
// 		border: 1px solid #000;
// 		padding: 6px 8px;
// 		white-space: nowrap;
// 		vertical-align: middle;
// 	}

// 	/* Sticky Headers */
// 	table.university-table thead th {
// 		position: sticky;
// 		background-clip: padding-box;
// 		z-index: 10;
// 	}

// 	table.university-table thead tr:first-child th {
// 		background-color: #0076B6;
// 		color: #fff;
// 		top: 0;
// 		height: 34px;
// 		z-index: 60;
// 	}

// 	table.university-table thead tr:nth-child(2) th {
// 		background-color: #F26B21;
// 		color: #fff;
// 		top: 34px;
// 		height: 34px;
// 		z-index: 59;
// 	}

// 	table.university-table thead tr:nth-child(3) th {
// 		background-color: #f3f4f6;
// 		top: 68px;
// 		height: 34px;
// 		z-index: 58;
// 	}

// 	/* Sticky First Column */
// 	table.university-table th:first-child,
// 	table.university-table td:first-child {
// 		position: sticky;
// 		left: 0;
// 		background-color: #fff;
// 		z-index: 65;
// 		text-align: left;
// 		box-shadow: 2px 0 4px rgba(0,0,0,0.05);
// 	}

// 	table.university-table thead tr:first-child th:first-child {
// 		background-color: #0076B6;
// 		color: #fff;
// 		z-index: 70;
// 	}

// 	table.university-table thead tr:nth-child(2) th:first-child {
// 		background-color: #F26B21;
// 		color: #fff;
// 		z-index: 69;
// 	}

// 	table.university-table thead tr:nth-child(3) th:first-child {
// 		background-color: #f3f4f6;
// 		z-index: 68;
// 	}

// 	.total-row {
// 		font-weight: 700;
// 		background-color: #f9f9f9 !important;
// 		border-top: 2px solid #000;
// 		border-bottom: 2px solid #000;
// 	}

// 	.total-row td:first-child {
// 		text-align: right;
// 		background-color: #f9f9f9 !important;
// 	}

// 	/* Responsive Cards */
// 	@media (max-width:1024px){
// 		.card-row{
// 			grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
// 		}
// 	}

// 	@media (max-width:768px){
// 		.card-row{
// 			grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
// 			gap:12px;
// 		}
// 		.number-value{
// 			font-size:18px;
// 		}
// 	}

// 	@media (max-width:480px){
// 		.card-row{
// 			grid-template-columns:1fr 1fr;
// 		}
// 		.number-value{
// 			font-size:16px;
// 		}
// 	}

// 	</style>
// 	`).appendTo(page.body);


// 	document.getElementById("search-input")
// 		.addEventListener("input", filterTable);

// 	loadConsolidatedReport();
// 	loadNumberCards();
// };



// // -------------------------------------------------
// // NUMBER CARDS LOGIC
// // -------------------------------------------------

// function formatINR(value) {
// 	return new Intl.NumberFormat('en-IN', {
// 		style: 'currency',
// 		currency: 'INR',
// 		minimumFractionDigits: 2
// 	}).format(value || 0);
// }

// function renderCards(apiResponse) {

// 	const $container = $(".card-row");
// 	$container.empty();

// 	// Grand Total
// 	$container.append(`
// 		<div class="number-card">
// 			<div class="number-title">Grand Total</div>
// 			<div class="number-value">
// 				${formatINR(apiResponse.grand_total)}
// 			</div>
// 		</div>
// 	`);

// 	// Other Cards
// 	(apiResponse.number_cards || []).forEach(card => {
// 		$container.append(`
// 			<div class="number-card">
// 				<div class="number-title">${card.label}</div>
// 				<div class="number-value">
// 					${formatINR(card.total_budget)}
// 				</div>
// 			</div>
// 		`);
// 	});
// }

// function loadNumberCards() {

// 	frappe.call({
// 		method: "annual_budget.api.phase_sheet.get_number_card_totals",
// 		args: {
// 			financial_year: "2025-26"
// 		},
// 		callback: function (r) {
// 			if (!r.message) return;
// 			renderCards(r.message);
// 		}
// 	});
// }

// // -------------------------------------------------
// // TABLE DATA FETCH
// // -------------------------------------------------

// function loadConsolidatedReport() {

// 	frappe.call({
// 		method: "annual_budget.api.finance_budget.get_consolidated_report",
// 		args: {},
// 		freeze: true,
// 		freeze_message: "Loading Consolidated Data...",
// 		callback: function (r) {

// 			const data = r.message?.entities || [];

// 			if (!data.length) {
// 				document.getElementById("table-body").innerHTML =
// 					"<tr><td colspan='99' style='text-align:center;'>No data found</td></tr>";
// 				return;
// 			}

// 			renderExpenseTable(data);
// 		},
// 	});
// }
// // -------------------------------------------------
// // TABLE RENDER
// // -------------------------------------------------

// function renderExpenseTable(entities) {

// 	const header = document.getElementById("table-header");
// 	const body = document.getElementById("table-body");

// 	header.innerHTML = "";
// 	body.innerHTML = "";

// 	const visibleCols = ["Budget", "Actuals", "Previous Year"];

// 	// Entity Row
// 	let entityRow = `<tr><th rowspan="3">Expenses</th>`;
// 	entities.forEach(e => {
// 		const totalCols = e.cost_centers.length * visibleCols.length;
// 		entityRow += `<th colspan="${totalCols}">${e.name}</th>`;
// 	});
// 	entityRow += `</tr>`;

// 	// Cost Center Row
// 	let ccRow = "<tr>";
// 	entities.forEach(e => {
// 		e.cost_centers.forEach(cc => {
// 			ccRow += `<th colspan="${visibleCols.length}">${cc.name} (₹)</th>`;
// 		});
// 	});
// 	ccRow += "</tr>";

// 	// Metric Row
// 	let metricRow = "<tr>";
// 	entities.forEach(e => {
// 		e.cost_centers.forEach(() => {
// 			visibleCols.forEach(v => metricRow += `<th>${v}</th>`);
// 		});
// 	});
// 	metricRow += "</tr>";

// 	header.innerHTML = entityRow + ccRow + metricRow;

// 	// Collect expenses
// 	const allExpenses = new Set();
// 	entities.forEach(e =>
// 		e.cost_centers.forEach(cc =>
// 			cc.data.forEach(d => allExpenses.add(d.type_of_expense))
// 		)
// 	);

// 	let bodyHTML = "";

// 	allExpenses.forEach(exp => {

// 		bodyHTML += `<tr><td>${exp}</td>`;

// 		entities.forEach(e => {
// 			e.cost_centers.forEach(cc => {

// 				const row = cc.data.find(d => d.type_of_expense === exp);

// 				visibleCols.forEach(metric => {

// 					const val =
// 						metric === "Budget" ? row?.budget ?? 0 :
// 						metric === "Actuals" ? row?.actuals ?? 0 :
// 						row?.previous_year ?? 0;

// 					bodyHTML += `<td>${(val || 0).toLocaleString()}</td>`;
// 				});
// 			});
// 		});

// 		bodyHTML += `</tr>`;
// 	});

// 	// Grand Total Row
// 	let grandRow = `<tr class="total-row"><td>Grand Total (₹)</td>`;

// 	entities.forEach(e => {
// 		e.cost_centers.forEach(cc => {
// 			visibleCols.forEach(metric => {

// 				const val =
// 					metric === "Budget"
// 						? cc.data.reduce((a, d) => a + (d.budget || 0), 0)
// 						: metric === "Actuals"
// 						? cc.data.reduce((a, d) => a + (d.actuals || 0), 0)
// 						: cc.data.reduce((a, d) => a + (d.previous_year || 0), 0);

// 				grandRow += `<td>${val.toLocaleString()}</td>`;
// 			});
// 		});
// 	});

// 	grandRow += "</tr>";

// 	body.innerHTML = bodyHTML + grandRow;
// }
// // -------------------------------------------------
// // SEARCH FILTER
// // -------------------------------------------------

// function filterTable() {

// 	const term = document
// 		.getElementById("search-input")
// 		.value
// 		.toLowerCase();

// 	document.querySelectorAll("#table-body tr")
// 		.forEach(row => {

// 			const match = row
// 				.querySelector("td:first-child")
// 				?.innerText
// 				.toLowerCase()
// 				.includes(term);

// 			row.style.display =
// 				match || row.classList.contains("total-row")
// 					? ""
// 					: "none";
// 		});
// }


// frappe.pages['consolidate-report'].on_page_load = function (wrapper) {

//     const page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Dashboard',
//         single_column: true
//     });

//     /* ── STYLES ── */
//     $(`<style>
//         .bd-wrap{padding:20px 24px;box-sizing:border-box;}
//         .bd-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;}
//         .bd-title{font-size:20px;font-weight:600;color:#111;margin:0;}
//         .bd-filter{width:220px;}
//         .bd-filter .form-control,.bd-filter select{width:100%!important;height:34px!important;font-size:13px!important;border-radius:8px!important;border:1px solid #e2e8f0!important;}
//         .bd-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
//         .bd-card{background:#fff;border:1px solid #e8edf3;border-radius:12px;padding:16px 18px;border-left:4px solid #378ADD;}
//         .bd-card:first-child{border-left-color:#1D9E75;}
//         .bd-card-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#888;margin-bottom:6px;}
//         .bd-card-value{font-size:22px;font-weight:700;color:#111;line-height:1.2;}
//         .bd-card-sub{font-size:12px;color:#888;margin-top:4px;}
//         .bd-charts{display:grid;grid-template-columns:1fr 420px;gap:16px;}
//         .bd-chart-box{background:#fff;border:1px solid #e8edf3;border-radius:12px;padding:20px 22px;}
//         .bd-chart-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
//         .bd-chart-title{font-size:14px;font-weight:600;color:#111;margin:0;}
//         .bd-chart-sub{font-size:12px;color:#aaa;margin:0 0 14px;}
//         .bd-legend{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;}
//         .bd-legend-item{display:flex;align-items:center;gap:5px;font-size:12px;color:#555;}
//         .bd-legend-dot{width:10px;height:10px;border-radius:2px;flex-shrink:0;}
//         .bd-donut-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;}
//         .bd-donut-center-val{font-size:22px;font-weight:700;color:#111;line-height:1.1;}
//         .bd-donut-center-lbl{font-size:11px;color:#888;margin-top:2px;}
//         @media(max-width:1100px){.bd-charts{grid-template-columns:1fr;}.bd-cards{grid-template-columns:repeat(2,1fr);}}
//         @media(max-width:640px){.bd-cards{grid-template-columns:repeat(2,1fr);}.bd-filter{width:100%;}}
//     </style>`).appendTo('head');

//     /* ── PALETTE ── */
//     const PALETTE = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#888780','#185FA5'];

//     /* ── LAYOUT ── */
//     $(page.body).html(`
//         <div class="bd-wrap">
//             <div class="bd-top">
//                 <p class="bd-title">Budget Dashboard</p>
//                 <div class="bd-filter" id="bd-fy-wrap"></div>
//             </div>
//             <div class="bd-cards" id="bd-cards"></div>
//             <div class="bd-charts">
//                 <div class="bd-chart-box">
//                     <div class="bd-chart-header">
//                         <p class="bd-chart-title">Budget by category</p>
//                     </div>
//                     <p class="bd-chart-sub">Total allocation per category</p>
//                     <div style="position:relative;width:100%;height:300px;">
//                         <canvas id="bd-bar"></canvas>
//                     </div>
//                     <div class="bd-legend" id="bd-bar-legend"></div>
//                 </div>
//                 <div class="bd-chart-box">
//                     <div class="bd-chart-header">
//                         <p class="bd-chart-title">Budget share</p>
//                     </div>
//                     <p class="bd-chart-sub">Percentage distribution</p>
//                     <div style="position:relative;width:100%;height:260px;" id="bd-donut-wrap">
//                         <canvas id="bd-donut"></canvas>
//                         <div class="bd-donut-center" id="bd-donut-center">
//                             <div class="bd-donut-center-val" id="bd-donut-total"></div>
//                             <div class="bd-donut-center-lbl">Grand total</div>
//                         </div>
//                     </div>
//                     <div class="bd-legend" id="bd-donut-legend"></div>
//                 </div>
//             </div>
//         </div>
//     `);

//     /* ── FY FILTER ── */
//     let barChart = null, donutChart = null;

//     const fyControl = frappe.ui.form.make_control({
//         parent: document.getElementById('bd-fy-wrap'),
//         df: {
//             label: 'Financial Year', fieldtype: 'Select', fieldname: 'financial_year', reqd: 1,
//             change() { const fy = this.get_value(); if (fy) load(fy); }
//         },
//         render_input: true
//     });
//     fyControl.refresh();

//     frappe.call({
//         method: 'annual_budget.api.filter_options.get_financial_year_list',
//         callback(r) {
//             if (!r.message?.length) return;
//             const years = r.message.map(d => d.financial_year);
//             fyControl.df.options = years.join('\n');
//             fyControl.refresh();
//             const now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1;
//             const fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             const def = years.includes(fy) ? fy : years[0];
//             fyControl.set_value(def);
//             load(def);
//         }
//     });

//     /* ── HELPERS ── */
//     const fmtINR  = v => '₹' + Math.round(v || 0).toLocaleString('en-IN');
//     const fmtCr   = v => { const cr = Math.round((v || 0) / 1e7); return cr >= 1 ? cr + ' Cr' : fmtINR(v); };

//     /* ── RENDER CARDS ── */
//     function renderCards(data) {
//         const cards = data.number_cards || [];
//         const grand = data.grand_total || 0;
//         const $c    = $('#bd-cards').empty();

//         // Grand total card
//         $c.append(`
//             <div class="bd-card" style="border-left-color:#1D9E75;">
//                 <div class="bd-card-label">Grand Total</div>
//                 <div class="bd-card-value">${fmtINR(grand)}</div>
//                 <div class="bd-card-sub">${cards.length} categories</div>
//             </div>
//         `);

//         cards.forEach((c, i) => {
//             const pct = grand > 0 ? ((c.total_budget / grand) * 100).toFixed(1) : '0.0';
//             $c.append(`
//                 <div class="bd-card" style="border-left-color:${PALETTE[i % PALETTE.length]};">
//                     <div class="bd-card-label">${c.label}</div>
//                     <div class="bd-card-value">${fmtINR(c.total_budget)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });
//     }

//     /* ── RENDER BAR CHART ── */
//     function renderBar(data) {
//         const cards  = data.number_cards || [];
//         const labels = cards.map(c => c.label);
//         const values = cards.map(c => Math.round(c.total_budget || 0));
//         const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);

//         $('#bd-bar-legend').empty();
//         labels.forEach((lbl, i) => {
//             $('#bd-bar-legend').append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl}
//                 </span>
//             `);
//         });

//         if (barChart) { barChart.destroy(); barChart = null; }

//         barChart = new Chart(document.getElementById('bd-bar'), {
//             type: 'bar',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderRadius: 6,
//                     borderSkipped: false,
//                     barPercentage: 0.6,
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => ' ' + fmtINR(ctx.parsed.y)
//                         }
//                     }
//                 },
//                 scales: {
//                     x: {
//                         grid: { display: false },
//                         border: { display: false },
//                         ticks: { autoSkip: false, maxRotation: 35, font: { size: 11 }, color: '#888' }
//                     },
//                     y: {
//                         grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
//                         border: { display: false, dash: [4,4] },
//                         ticks: { font: { size: 11 }, color: '#888', callback: v => fmtCr(v) }
//                     }
//                 }
//             }
//         });
//     }

//     /* ── RENDER DONUT CHART ── */
//     function renderDonut(data) {
//         const cards  = data.number_cards || [];
//         const grand  = data.grand_total  || 0;
//         const labels = cards.map(c => c.label);
//         const values = cards.map(c => Math.round(c.total_budget || 0));
//         const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);

//         $('#bd-donut-total').text(fmtCr(grand));

//         const $leg = $('#bd-donut-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = grand > 0 ? ((values[i] / grand) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl} — ${pct}%
//                 </span>
//             `);
//         });

//         if (donutChart) { donutChart.destroy(); donutChart = null; }

//         donutChart = new Chart(document.getElementById('bd-donut'), {
//             type: 'doughnut',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 2,
//                     borderColor: '#fff',
//                     hoverOffset: 6,
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 cutout: '68%',
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = grand > 0 ? ((ctx.parsed / grand) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     /* ── LOAD ── */
//     function load(fy) {
//         frappe.call({
//             method: 'annual_budget.api.phase_sheet.get_number_card_totals',
//             args: { financial_year: fy },
//             callback(r) {
//                 if (!r.message) return;
//                 renderCards(r.message);
//                 renderBar(r.message);
//                 renderDonut(r.message);
//             }
//         });
//     }

//     /* ── LOAD CHART.JS ONCE ── */
//     if (!window.Chart) {
//         const s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         document.head.appendChild(s);
//     }
// };







// frappe.pages['consolidate-report'].on_page_load = function (wrapper) {

//     const page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Dashboard',
//         single_column: true
//     });

//     /* ── STYLES ── */
//     $(`<style>
//         /* === BASE === */
//         .bd-wrap {
//             padding: 16px;
//             box-sizing: border-box;
//         }

//         /* === TOP BAR === */
//         .bd-top {
//             display: flex;
//             align-items: center;
//             justify-content: space-between;
//             flex-wrap: wrap;
//             gap: 10px;
//             margin-bottom: 16px;
//         }
//         .bd-title {
//             font-size: 18px;
//             font-weight: 600;
//             color: #111;
//             margin: 0;
//         }
//         .bd-filter { width: 200px; }
//         .bd-filter .form-control,
//         .bd-filter select {
//             width: 100% !important;
//             height: 34px !important;
//             font-size: 13px !important;
//             border-radius: 8px !important;
//             border: 1px solid #e2e8f0 !important;
//         }

//         /* === CARDS === */
//         .bd-cards {
//             display: grid;
//             grid-template-columns: repeat(4, 1fr);
//             gap: 12px;
//             margin-bottom: 16px;
//         }
//         .bd-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//         }
//         .bd-card-label {
//             font-size: 10px;
//             font-weight: 600;
//             text-transform: uppercase;
//             letter-spacing: .6px;
//             color: #888;
//             margin-bottom: 5px;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-value {
//             font-size: 18px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.2;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-sub {
//             font-size: 11px;
//             color: #888;
//             margin-top: 3px;
//         }

//         /* === BOTTOM ROW: hbar + donut side by side === */
//         .bd-bottom {
//             display: grid;
//             grid-template-columns: 1fr 400px;
//             gap: 14px;
//             align-items: start;
//         }

//         /* === HORIZONTAL BAR === */
//         .bd-hbar-row {
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             margin-bottom: 13px;
//         }
//         .bd-hbar-label {
//             font-size: 13px;
//             color: #444;
//             font-weight: 500;
//             width: 180px;
//             min-width: 180px;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//             text-align: right;
//         }
//         .bd-hbar-track {
//             flex: 1;
//             height: 22px;
//             background: #f0f2f5;
//             border-radius: 6px;
//             overflow: hidden;
//         }
//         .bd-hbar-fill {
//             height: 100%;
//             border-radius: 6px;
//             transition: width .5s ease;
//         }
//         .bd-hbar-val {
//             font-size: 13px;
//             color: #222;
//             font-weight: 700;
//             white-space: nowrap;
//             width: 72px;
//             min-width: 72px;
//         }

//         .bd-chart-box {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 16px 18px;
//             min-width: 0;
//         }
//         .bd-chart-header {
//             display: flex;
//             align-items: center;
//             justify-content: space-between;
//             margin-bottom: 2px;
//         }
//         .bd-chart-title {
//             font-size: 13px;
//             font-weight: 600;
//             color: #111;
//             margin: 0;
//         }
//         .bd-chart-sub {
//             font-size: 12px;
//             color: #aaa;
//             margin: 0 0 12px;
//         }

//         /* === LEGEND === */
//         .bd-legend {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 8px;
//             margin-top: 12px;
//         }
//         .bd-legend-item {
//             display: flex;
//             align-items: center;
//             gap: 5px;
//             font-size: 13px;
//             color: #444;
//             font-weight: 500;
//         }
//         .bd-legend-dot {
//             width: 9px;
//             height: 9px;
//             border-radius: 2px;
//             flex-shrink: 0;
//         }

//         /* === DONUT CENTER === */
//         .bd-donut-center {
//             position: absolute;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             text-align: center;
//             pointer-events: none;
//         }
//         .bd-donut-center-val {
//             font-size: 20px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.1;
//         }
//         .bd-donut-center-lbl {
//             font-size: 10px;
//             color: #888;
//             margin-top: 2px;
//         }

//         /* =====================
//            RESPONSIVE BREAKPOINTS
//            ===================== */
//         @media (min-width: 1400px) {
//             .bd-wrap { padding: 20px 28px; }
//             .bd-title { font-size: 20px; }
//             .bd-card-value { font-size: 20px; }
//             .bd-bottom { grid-template-columns: 1fr 440px; }
//         }
//         @media (max-width: 1200px) {
//             .bd-bottom { grid-template-columns: 1fr 360px; }
//         }
//         @media (max-width: 1024px) {
//             .bd-cards { grid-template-columns: repeat(4, 1fr); }
//             .bd-bottom { grid-template-columns: 1fr; }
//         }
//         @media (max-width: 768px) {
//             .bd-wrap { padding: 12px; }
//             .bd-cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
//             .bd-filter { width: 180px; }
//             .bd-title { font-size: 16px; }
//             .bd-card-value { font-size: 16px; }
//             .bd-hbar-label { width: 130px; min-width: 130px; font-size: 12px; }
//             .bd-hbar-track { height: 18px; }
//             .bd-hbar-val   { font-size: 12px; width: 60px; min-width: 60px; }
//         }
//         @media (max-width: 600px) {
//             .bd-top { flex-direction: column; align-items: flex-start; }
//             .bd-filter { width: 100%; }
//             .bd-cards { grid-template-columns: repeat(2, 1fr); }
//             .bd-chart-box { padding: 12px 14px; }
//             .bd-hbar-label { width: 90px; min-width: 90px; font-size: 11px; }
//             .bd-hbar-track { height: 16px; }
//             .bd-hbar-val   { width: 52px; min-width: 52px; font-size: 11px; }
//             .bd-hbar-row   { gap: 8px; margin-bottom: 10px; }
//         }
//         @media (max-width: 420px) {
//             .bd-cards { grid-template-columns: 1fr; }
//             .bd-card-value { font-size: 15px; }
//             .bd-donut-center-val { font-size: 16px; }
//             .bd-hbar-label { width: 70px; min-width: 70px; }
//             .bd-hbar-val   { width: 46px; min-width: 46px; }
//         }
//     </style>`).appendTo('head');

//     /* ── PALETTE ── */
//     const PALETTE = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#888780','#185FA5'];

//     /* ── LAYOUT ── */
//     $(page.body).html(`
//         <div class="bd-wrap">
//                 <div class="bd-filter" id="bd-fy-wrap"></div>
//             <div class="bd-cards" id="bd-cards"></div>
//             <div class="bd-bottom">
//                 <!-- Horizontal bar -->
//                 <div class="bd-chart-box">
//                     <div class="bd-chart-header">
//                         <p class="bd-chart-title">Top spenders by budget</p>
//                     </div>
//                     <p class="bd-chart-sub">All categories ranked highest to lowest</p>
//                     <div id="bd-hbar-body"></div>
//                 </div>
//                 <!-- Donut -->
//                 <div class="bd-chart-box">
//                     <div class="bd-chart-header">
//                         <p class="bd-chart-title">Budget share</p>
//                     </div>
//                     <p class="bd-chart-sub">Percentage distribution</p>
//                     <div style="position:relative;width:100%;height:260px;" id="bd-donut-wrap">
//                         <canvas id="bd-donut"></canvas>
//                         <div class="bd-donut-center" id="bd-donut-center">
//                             <div class="bd-donut-center-val" id="bd-donut-total"></div>
//                             <div class="bd-donut-center-lbl">Grand total</div>
//                         </div>
//                     </div>
//                     <div class="bd-legend" id="bd-donut-legend"></div>
//                 </div>
//             </div>
//         </div>
//     `);

//     /* ── FY FILTER ── */
//     let donutChart = null;

//     const fyControl = frappe.ui.form.make_control({
//         parent: document.getElementById('bd-fy-wrap'),
//         df: {
//             label: 'Financial Year',
//             fieldtype: 'Select',
//             fieldname: 'financial_year',
//             reqd: 1,
//             change() { const fy = this.get_value(); if (fy) load(fy); }
//         },
//         render_input: true
//     });
//     fyControl.refresh();

//     frappe.call({
//         method: 'annual_budget.api.filter_options.get_financial_year_list',
//         callback(r) {
//             if (!r.message?.length) return;
//             const years = r.message.map(d => d.financial_year);
//             fyControl.df.options = years.join('\n');
//             fyControl.refresh();
//             const now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1;
//             const fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             const def = years.includes(fy) ? fy : years[0];
//             fyControl.set_value(def);
//             load(def);
//         }
//     });

//     /* ── HELPERS ── */
//     const fmtINR = v => '₹' + Math.round(v || 0).toLocaleString('en-IN');
//     const fmtCr  = v => { const cr = Math.round((v || 0) / 1e7); return cr >= 1 ? cr + ' Cr' : fmtINR(v); };

//     /* ── RENDER CARDS ── */
//     function renderCards(data) {
//         const cards = data.number_cards || [];
//         const grand = data.grand_total  || 0;
//         const $c    = $('#bd-cards').empty();

//         $c.append(`
//             <div class="bd-card" style="border-left-color:#1D9E75;">
//                 <div class="bd-card-label">Grand Total</div>
//                 <div class="bd-card-value">${fmtINR(grand)}</div>
//                 <div class="bd-card-sub">${cards.length} categories</div>
//             </div>
//         `);

//         cards.forEach((c, i) => {
//             const pct = grand > 0 ? ((c.total_budget / grand) * 100).toFixed(1) : '0.0';
//             $c.append(`
//                 <div class="bd-card" style="border-left-color:${PALETTE[i % PALETTE.length]};">
//                     <div class="bd-card-label">${c.label}</div>
//                     <div class="bd-card-value">${fmtINR(c.total_budget)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });
//     }

//     /* ── RENDER HORIZONTAL BAR ── */
//     function renderHBar(data) {
//         const cards  = data.number_cards || [];
//         const sorted = [...cards].sort((a, b) => (b.total_budget || 0) - (a.total_budget || 0));
//         const max    = sorted[0]?.total_budget || 1;
//         const $body  = $('#bd-hbar-body').empty();

//         sorted.forEach((c, i) => {
//             const pct   = ((c.total_budget || 0) / max * 100).toFixed(1);
//             const color = PALETTE[i % PALETTE.length];
//             $body.append(`
//                 <div class="bd-hbar-row">
//                     <div class="bd-hbar-label" title="${c.label}">${c.label}</div>
//                     <div class="bd-hbar-track">
//                         <div class="bd-hbar-fill" style="width:${pct}%;background:${color};"></div>
//                     </div>
//                     <div class="bd-hbar-val">${fmtCr(c.total_budget)}</div>
//                 </div>
//             `);
//         });
//     }

//     /* ── RENDER DONUT CHART ── */
//     function renderDonut(data) {
//         const cards  = data.number_cards || [];
//         const grand  = data.grand_total  || 0;
//         const labels = cards.map(c => c.label);
//         const values = cards.map(c => Math.round(c.total_budget || 0));
//         const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);

//         $('#bd-donut-total').text(fmtCr(grand));

//         const $leg = $('#bd-donut-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = grand > 0 ? ((values[i] / grand) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl} — ${pct}%
//                 </span>
//             `);
//         });

//         if (donutChart) { donutChart.destroy(); donutChart = null; }

//         donutChart = new Chart(document.getElementById('bd-donut'), {
//             type: 'doughnut',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 2,
//                     borderColor: '#fff',
//                     hoverOffset: 6,
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 cutout: '68%',
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         bodyFont: { size: 13 },
//                         titleFont: { size: 13 },
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = grand > 0 ? ((ctx.parsed / grand) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     /* ── LOAD ── */
//     function load(fy) {
//         frappe.call({
//             method: 'annual_budget.api.phase_sheet.get_number_card_totals',
//             args: { financial_year: fy },
//             callback(r) {
//                 if (!r.message) return;
//                 renderCards(r.message);
//                 renderHBar(r.message);
//                 renderDonut(r.message);
//             }
//         });
//     }

//     /* ── RESIZE HANDLER ── */
//     let resizeTimer;
//     $(window).on('resize.bd', function () {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(() => {
//             const fy = fyControl.get_value();
//             if (fy) load(fy);
//         }, 300);
//     });

//     $(wrapper).on('hide', function () {
//         $(window).off('resize.bd');
//     });

//     /* ── LOAD CHART.JS ONCE ── */
//     if (!window.Chart) {
//         const s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         s.onload = () => { const fy = fyControl.get_value(); if (fy) load(fy); };
//         document.head.appendChild(s);
//     }
// };


// frappe.pages['consolidate-report'].on_page_load = function (wrapper) {

//     const page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Dashboard',
//         single_column: true
//     });

//     /* ── STYLES ── */
//     $(`<style>
//         .bd-wrap { padding: 0; box-sizing: border-box; }

//         /* FILTER BAR */
//         .bd-filter-bar {
//             display: flex;
//             align-items: flex-end;
//             gap: 20px;
//             padding: 16px 20px 0;
//             flex-wrap: wrap;
//         }
//         .bd-filter { width: 200px; }

//         /* TAB NAV */
//         #bd-tab-nav {
//             list-style: none;
//             margin: 18px 0 0;
//             padding: 0 20px;
//             display: flex;
//             flex-wrap: wrap;
//             gap: 0;
//             border-bottom: 2px solid #d1d5db;
//         }
//         #bd-tab-nav li { margin: 0; padding: 0; }
//         #bd-tab-nav .bd-tab {
//             display: block;
//             font-size: 13px;
//             font-weight: 400;
//             color: #6b7280;
//             padding: 10px 16px 11px;
//             cursor: pointer;
//             border-bottom: 2px solid transparent;
//             margin-bottom: -2px;
//             white-space: nowrap;
//             text-decoration: none;
//             transition: color .15s, border-color .15s;
//             user-select: none;
//         }
//         #bd-tab-nav .bd-tab:hover { color: #111; }
//         #bd-tab-nav .bd-tab.active {
//             color: #111827;
//             font-weight: 700;
//             border-bottom-color: #111827;
//         }

//         /* TAB PANELS */
//         .bd-panel { display: none; padding: 16px 20px; }
//         .bd-panel.active { display: block; }

//         /* BANNER STRIP */
//         .bd-banner-strip {
//             display: grid;
//             grid-template-columns: repeat(3, 1fr);
//             gap: 12px;
//             margin-bottom: 16px;
//         }
//         .bd-banner-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//             transition: box-shadow .2s;
//         }
//         .bd-banner-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-banner-card.blue   { border-left-color: #1a56db; }
//         .bd-banner-card.green  { border-left-color: #0e9f6e; }
//         .bd-banner-card.orange { border-left-color: #ff5a1f; }
//         .bd-banner-label {
//             font-size: 10px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: .6px;
//             color: #888;
//             margin-bottom: 5px;
//         }
//         .bd-banner-value { font-size: 22px; font-weight: 700; color: #111; line-height: 1.2; }
//         .bd-banner-sub   { font-size: 11px; color: #aaa; margin-top: 3px; }

//         /* SECTION TITLE */
//         .bd-section-title {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             font-size: 11px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: 1.2px;
//             color: #374151;
//             margin: 0 0 12px;
//         }
//         .bd-section-title::before {
//             content: '';
//             display: inline-block;
//             width: 3px;
//             height: 14px;
//             border-radius: 2px;
//             background: #378ADD;
//             flex-shrink: 0;
//         }
//         .bd-section-title.sub::before { background: #7F77DD; }
//         .bd-section-title::after {
//             content: '';
//             flex: 1;
//             height: 1px;
//             background: #e8edf3;
//         }

//         /* CARDS */
//         .bd-cards {
//             display: grid;
//             grid-template-columns: repeat(4, 1fr);
//             gap: 12px;
//             margin-bottom: 10px;
//         }
//         .bd-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//             transition: box-shadow .2s;
//         }
//         .bd-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-card-label {
//             font-size: 10px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: .5px;
//             color: #888;
//             margin-bottom: 5px;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-value {
//             font-size: 17px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.2;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-sub { font-size: 11px; color: #aaa; margin-top: 3px; }

//         /* BOTTOM ROW */
//         .bd-bottom {
//             display: grid;
//             grid-template-columns: 1fr 400px;
//             gap: 14px;
//             align-items: start;
//             margin-top: 16px;
//         }
//         .bd-chart-box {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 16px 18px;
//             min-width: 0;
//         }
//         .bd-chart-title { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
//         .bd-chart-sub   { font-size: 12px; color: #aaa; margin: 0 0 14px; }

//         /* BAR ROWS */
//         .bd-bar-row {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             margin-bottom: 9px;
//         }
//         .bd-bar-label {
//             font-size: 13px;
//             font-weight: 600;
//             color: #222;
//             width: 170px;
//             min-width: 170px;
//             text-align: right;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-bar-track {
//             flex: 1;
//             height: 22px;
//             background: #f0f2f5;
//             border-radius: 5px;
//             overflow: hidden;
//         }
//         .bd-bar-fill {
//             height: 100%;
//             border-radius: 5px;
//             transition: width .5s ease;
//         }
//         .bd-bar-val {
//             font-size: 12px;
//             font-weight: 700;
//             color: #222;
//             width: 72px;
//             min-width: 72px;
//             white-space: nowrap;
//         }
//         .bd-bar-divider {
//             border: none;
//             border-top: 1px dashed #e0e4ea;
//             margin: 6px 0 10px;
//         }
//         .bd-bar-section-label {
//             font-size: 10px;
//             font-weight: 700;
//             color: #bbb;
//             text-transform: uppercase;
//             letter-spacing: .5px;
//             margin-bottom: 8px;
//         }

//         /* LEGEND */
//         .bd-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
//         .bd-legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #555; }
//         .bd-legend-dot  { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }

//         /* DONUT CENTER */
//         .bd-donut-center {
//             position: absolute; top: 50%; left: 50%;
//             transform: translate(-50%, -50%);
//             text-align: center; pointer-events: none;
//         }
//         .bd-donut-center-val { font-size: 19px; font-weight: 700; color: #111; line-height: 1.1; }
//         .bd-donut-center-lbl { font-size: 10px; color: #888; margin-top: 2px; }

//         /* WORK PLAN */
//         .bd-wp-grid {
//             display: grid;
//             grid-template-columns: 1fr 280px;
//             gap: 16px;
//             align-items: start;
//         }
//         .bd-wp-pie-box { min-width: 0; }
//         .bd-wp-pie-total-box {
//             text-align: center;
//             margin-top: 16px;
//             padding-top: 12px;
//             border-top: 1px solid #f0f2f5;
//         }
//         .bd-wp-pie-total-label {
//             font-size: 10px;
//             font-weight: 700;
//             letter-spacing: .8px;
//             color: #aaa;
//             text-transform: uppercase;
//             margin-bottom: 4px;
//         }
//         .bd-wp-pie-total-val {
//             font-size: 26px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.1;
//         }
//         .bd-wp-summary { display: flex; flex-direction: column; gap: 12px; }
//         .bd-wp-stat-card { cursor: default; }
//         .bd-wp-two-col-row {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 14px;
//             margin-top: 16px;
//         }

//         /* LOADING OVERLAY */
//         #global-loader.loader-overlay {
//             position: fixed; top: 0; left: 0; right: 0; bottom: 0;
//             background: rgba(18,18,18,.92);
//             backdrop-filter: blur(6px);
//             display: none; z-index: 999999;
//             align-items: center; justify-content: center;
//         }
//         .loader-box { display: flex; flex-direction: column; align-items: center; gap: 14px; }
//         .loader-logo {
//             width: 90px; height: 90px; border-radius: 50%;
//             background: linear-gradient(145deg,#fff,#eaeaea);
//             padding: 14px; object-fit: contain;
//             box-shadow: 0 10px 30px rgba(0,0,0,.35);
//             animation: lp 1.6s infinite ease-in-out;
//         }
//         .loader-text { font-size: 13px; color: #fff; font-weight: 600; letter-spacing: .5px; opacity: .85; }
//         .loader-text::after { content: ""; display: inline-block; width: 1em; animation: ld 1.5s infinite; }
//         @keyframes lp { 0%,100% { transform: scale(1); opacity: .8; } 50% { transform: scale(1.08); opacity: 1; } }
//         @keyframes ld { 0% { content: ""; } 33% { content: "."; } 66% { content: ".."; } 100% { content: "..."; } }

//         /* RESPONSIVE */
//         @media (min-width: 1400px) {
//             .bd-banner-value { font-size: 26px; }
//             .bd-bottom { grid-template-columns: 1fr 440px; }
//         }
//         @media (max-width: 1200px) { .bd-bottom { grid-template-columns: 1fr 360px; } }
//         @media (max-width: 1024px) { .bd-bottom { grid-template-columns: 1fr; } }
//         @media (max-width: 900px)  { .bd-wp-two-col-row { grid-template-columns: 1fr; } }
//         @media (max-width: 768px) {
//             .bd-cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
//             .bd-banner-strip { grid-template-columns: 1fr; }
//             .bd-wp-grid { grid-template-columns: 1fr; }
//             .bd-bar-label { width: 120px; min-width: 120px; font-size: 11px; }
//             .bd-bar-val   { width: 60px; min-width: 60px; }
//             .bd-filter { width: 150px; }
//         }
//         @media (max-width: 600px) {
//             .bd-filter-bar { padding: 12px 12px 0; }
//             .bd-panel { padding: 12px; }
//             .bd-cards { grid-template-columns: repeat(2, 1fr); }
//             .bd-filter { width: 100%; }
//         }
//         @media (max-width: 420px) { .bd-cards { grid-template-columns: 1fr; } }
//     </style>`).appendTo('head');

//     /* ── PALETTE ── */
//     const PALETTE     = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//     const SUB_PALETTE = ['#5b9bd5','#17856a','#c04e22','#6b62c7','#c03d6a','#9a5e0e','#4e7a18','#c93737','#0f4a87','#6b6b68'];


//     /* ── LAYOUT ── */
//     $(page.body).html(`
//         <div class="bd-wrap">

//             <!-- Filters -->
//             <div class="bd-filter-bar">
//                 <div class="bd-filter" id="bd-fy-wrap"></div>

//             </div>

//             <!-- Tab nav -->
//             <ul id="bd-tab-nav">
//                 <li><a class="bd-tab active" data-tab="dashboard">Budget Dashboard</a></li>
//                 <li><a class="bd-tab" data-tab="workplan">Work Plan Views</a></li>
//             </ul>

//             <!-- Tab 1: Budget Dashboard -->
//             <div class="bd-panel active" id="bd-panel-dashboard">

//                 <!-- Consolidated totals -->
//                 <div class="bd-banner-strip">
//                     <div class="bd-banner-card blue">
//                         <div class="bd-banner-label">Overall Grand Total</div>
//                         <div class="bd-banner-value" id="bd-grand-total">—</div>
//                         <div class="bd-banner-sub" id="bd-unit-count">—</div>
//                     </div>
//                     <div class="bd-banner-card green">
//                         <div class="bd-banner-label">CAPEX Total</div>
//                         <div class="bd-banner-value" id="bd-capex-total">—</div>
//                         <div class="bd-banner-sub">Capital Expenses</div>
//                     </div>
//                     <div class="bd-banner-card orange">
//                         <div class="bd-banner-label">OPEX Total</div>
//                         <div class="bd-banner-value" id="bd-opex-total">—</div>
//                         <div class="bd-banner-sub">Operating Expenses</div>
//                     </div>
//                 </div>

//                 <!-- Units -->
//                 <p class="bd-section-title" style="margin-top:4px;">Units</p>
//                 <div class="bd-cards" id="bd-cards">
//                     <div class="bd-loading"><div class="bd-spinner"></div> Loading…</div>
//                 </div>

//                 <!-- Sub Units -->
//                 <p class="bd-section-title sub" id="bd-sub-title" style="margin-top:16px;">Sub Units</p>
//                 <div class="bd-cards" id="bd-subcards"></div>

//                 <!-- Charts -->
//                 <div class="bd-bottom">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget by Unit</p>
//                         <p class="bd-chart-sub">Units and Sub Units ranked by budget</p>
//                         <div id="bd-hbar-body"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget Share</p>
//                         <p class="bd-chart-sub">Units only — percentage distribution</p>
//                         <div style="position:relative;width:100%;height:260px;">
//                             <canvas id="bd-donut"></canvas>
//                             <div class="bd-donut-center">
//                                 <div class="bd-donut-center-val" id="bd-donut-total">—</div>
//                                 <div class="bd-donut-center-lbl">Grand total</div>
//                             </div>
//                         </div>
//                         <div class="bd-legend" id="bd-donut-legend"></div>
//                     </div>
//                 </div>
//             </div>

//             <!-- Tab 2: Work Plan Views -->
//             <div class="bd-panel" id="bd-panel-workplan">
//                 <div class="bd-wp-grid">
//                     <!-- Pie Chart: Grants vs Others -->
//                     <div class="bd-chart-box bd-wp-pie-box">
//                         <p class="bd-chart-title">Grants &amp; Donations And Direct Work</p>
//                         <p class="bd-chart-sub">Consolidated budget breakdown</p>
//                         <div id="bd-wp-pie-wrap" style="position:relative;width:100%;height:320px;">
//                             <canvas id="bd-wp-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL BUDGET</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-pie-total">—</div>
//                         </div>
//                     </div>
//                     <!-- Summary cards -->
//                     <div class="bd-wp-summary">
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#1a56db;">
//                             <div class="bd-card-label">Grand Total</div>
//                             <div class="bd-card-value" id="bd-wp-pie-total-card">—</div>
//                             <div class="bd-card-sub">Overall budget</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" id="bd-wp-grants-card" style="border-left-color:#378ADD;">
//                             <div class="bd-card-label">Grants &amp; Donations</div>
//                             <div class="bd-card-value" id="bd-wp-grants-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-grants-pct">—</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" id="bd-wp-others-card" style="border-left-color:#F5A623;">
//                             <div class="bd-card-label">Direct Work</div>
//                             <div class="bd-card-value" id="bd-wp-others-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-others-pct">—</div>
//                         </div>
//                     </div>
//                 </div>

//                 <!-- Direct Work & Grants unit pies — side by side -->
//                 <div class="bd-wp-two-col-row">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Direct Work — Unit-wise</p>
//                         <p class="bd-chart-sub">Direct Work budget share per unit</p>
//                         <div style="position:relative;width:100%;height:320px;">
//                             <canvas id="bd-wp-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL DIRECT WORK</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-unit-pie-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-unit-legend"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Grants &amp; Donations — Unit-wise</p>
//                         <p class="bd-chart-sub">Grants &amp; Donations budget share per unit</p>
//                         <div style="position:relative;width:100%;height:320px;">
//                             <canvas id="bd-wp-grants-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL GRANTS &amp; DONATIONS</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-grants-unit-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-grants-unit-legend"></div>
//                     </div>
//                 </div>
//             </div>

//         </div>
//     `);

//     let donutChart = null;
//     let wpPieChart = null;
//     let wpUnitPieChart = null;
//     let wpGrantsUnitPieChart = null;
//     let wpDataLoaded = false;

//     /* ── TAB SWITCHING ── */
//     $(page.body).on('click', '#bd-tab-nav .bd-tab', function (e) {
//         e.preventDefault();
//         const tab = $(this).data('tab');
//         $('#bd-tab-nav .bd-tab').removeClass('active');
//         $('.bd-panel').removeClass('active');
//         $(this).addClass('active');
//         $('#bd-panel-' + tab).addClass('active');
//         // Load work plan data when switching to that tab
//         if (tab === 'workplan' && !wpDataLoaded) {
//             const fy = fyControl.get_value();
//             if (fy) loadWorkPlan(fy);
//         }
//     });

//     /* ── FY FILTER ── */
//     const fyControl = frappe.ui.form.make_control({
//         parent: document.getElementById('bd-fy-wrap'),
//         df: {
//             label: 'Financial Year',
//             fieldtype: 'Select',
//             fieldname: 'financial_year',
//             reqd: 1,
//             change() { triggerLoad(); }
//         },
//         render_input: true
//     });
//     fyControl.refresh();
//     // Apply Frappe's native field styling
//     $(fyControl.wrapper).find('.frappe-control').css('min-width', '0');


//     function triggerLoad() {
//         const fy = fyControl.get_value();
//         if (!fy) return;
//         // Reset work plan so it reloads for new FY
//         wpDataLoaded = false;
//         if (wpPieChart) { wpPieChart.destroy(); wpPieChart = null; }
//         if (wpUnitPieChart) { wpUnitPieChart.destroy(); wpUnitPieChart = null; }
//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         load(fy, 'March');
//         // If work plan tab is active, reload it too
//         if ($('#bd-tab-nav .bd-tab.active').data('tab') === 'workplan') {
//             loadWorkPlan(fy);
//         }
//     }

//     /* ── LOAD FY LIST ── */
//     frappe.call({
//         method: 'annual_budget.api.filter_options.get_financial_year_list',
//         callback(r) {
//             if (!r.message?.length) return;
//             const years = r.message.map(d => d.financial_year);
//             fyControl.df.options = years.join('\n');
//             fyControl.refresh();

//             const now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1;
//             const fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             const def = years.includes(fy) ? fy : years[0];
//             fyControl.set_value(def);

//             load(def, 'March');
//         }
//     });

//     /* ── HELPERS ── */
//     const fmtINR = v => '₹' + Math.round(v || 0).toLocaleString('en-IN');
//     const fmtCr  = v => {
//         const abs = Math.abs(v || 0);
//         if (abs >= 1e7) return '₹' + (Math.round((v || 0) / 1e5) / 100).toFixed(1) + ' Cr';
//         if (abs >= 1e5) return '₹' + (Math.round((v || 0) / 1e3) / 100).toFixed(1) + ' L';
//         return fmtINR(v);
//     };

//     /* ── PARSE ── */
//     function parseData(message) {
//         const consolidated = message.find(d => d.settings_doc === 'CONSOLIDATED');

//         // Sort by sequence_id before mapping so colors align with order
//         const mainRaw = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const mainUnits = mainRaw.map((u, idx) => {
//                 const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//                 return {
//                     label:       (u.label || '').trim(),
//                     ytd:         gt ? (gt.ytd || 0) : 0,
//                     sequence_id: u.sequence_id || 0,
//                     color:       PALETTE[idx % PALETTE.length]
//                 };
//             })
//             .filter(u => u.ytd > 0);

//         const subRaw = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 1)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const subUnits = subRaw.map((u, idx) => {
//                 const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//                 return {
//                     label:       (u.label || '').trim(),
//                     ytd:         gt ? (gt.ytd || 0) : 0,
//                     sequence_id: u.sequence_id || 0,
//                     color:       SUB_PALETTE[idx % SUB_PALETTE.length]
//                 };
//             })
//             .filter(u => u.ytd > 0);

//         let overall = 0, capex = 0, opex = 0;
//         if (consolidated) {
//             const ca = consolidated.actuals || [];
//             overall = (ca.find(a => a.name === 'OVERALL GRAND TOTAL') || {}).ytd || 0;
//             capex   = (ca.find(a => a.name === 'CAPEX TOTAL')         || {}).ytd || 0;
//             opex    = (ca.find(a => a.name === 'OPEX TOTAL')          || {}).ytd || 0;
//         }
//         if (!overall) overall = mainUnits.reduce((s, u) => s + u.ytd, 0);

//         return { mainUnits, subUnits, overall, capex, opex };
//     }

//     /* ── RENDER BANNER ── */
//     function renderBanner(overall, capex, opex, mainUnits, subUnits) {
//         $('#bd-grand-total').text(fmtCr(overall));
//         $('#bd-capex-total').text(fmtCr(capex));
//         $('#bd-opex-total').text(fmtCr(opex));
//         $('#bd-unit-count').text(
//             mainUnits.length + ' units' +
//             (subUnits.length ? ' · ' + subUnits.length + ' sub units' : '')
//         );
//     }

//     /* ── RENDER CARDS — same design for both ── */
//     function renderCards(mainUnits, subUnits, overall) {
//         // Units
//         const $c = $('#bd-cards').empty();
//         mainUnits.forEach(u => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $c.append(`
//                 <div class="bd-card" style="border-left-color:${u.color};">
//                     <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });

//         // Sub Units — identical card design
//         const $s = $('#bd-subcards').empty();
//         if (!subUnits.length) {
//             $('#bd-sub-title').hide();
//             return;
//         }
//         $('#bd-sub-title').show();
//         subUnits.forEach(u => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $s.append(`
//                 <div class="bd-card" style="border-left-color:${u.color};">
//                     <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });
//     }

//     /* ── RENDER BAR — same style for both ── */
//     function renderHBar(mainUnits, subUnits) {
//         const $body  = $('#bd-hbar-body').empty();
//         const allMax = Math.max(...mainUnits.map(u => u.ytd), ...subUnits.map(u => u.ytd), 1);

//         // Units section
//         mainUnits.forEach(u => {
//             const pct = ((u.ytd / allMax) * 100).toFixed(1);
//             $body.append(`
//                 <div class="bd-bar-row">
//                     <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-bar-track">
//                         <div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div>
//                     </div>
//                     <div class="bd-bar-val">${fmtCr(u.ytd)}</div>
//                 </div>
//             `);
//         });

//         // Sub Units section — same bar style, just separated
//         if (subUnits.length) {
//             $body.append(`
//                 <hr class="bd-bar-divider">
//                 <div class="bd-bar-section-label">Sub Units</div>
//             `);
//             subUnits.forEach(u => {
//                 const pct = ((u.ytd / allMax) * 100).toFixed(1);
//                 $body.append(`
//                     <div class="bd-bar-row">
//                         <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                         <div class="bd-bar-track">
//                             <div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div>
//                         </div>
//                         <div class="bd-bar-val">${fmtCr(u.ytd)}</div>
//                     </div>
//                 `);
//             });
//         }
//     }

//     /* ── RENDER DONUT ── */
//     function renderDonut(mainUnits, overall) {
//         const labels = mainUnits.map(u => u.label);
//         const values = mainUnits.map(u => Math.round(u.ytd));
//         const colors = mainUnits.map(u => u.color);

//         $('#bd-donut-total').text(fmtCr(overall));

//         const $leg = $('#bd-donut-legend').empty();
//         mainUnits.forEach((u, i) => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${u.label} — ${pct}%
//                 </span>
//             `);
//         });

//         if (donutChart) { donutChart.destroy(); donutChart = null; }
//         if (!values.length) return;

//         donutChart = new Chart(document.getElementById('bd-donut'), {
//             type: 'doughnut',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 2,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 cutout: '68%',
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = overall > 0
//                                     ? ((ctx.parsed / overall) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     /* ── LOAD ── */
//     function load(fy, month) {
//         Loader.show('Loading dashboard…');
//         $('#bd-grand-total,#bd-capex-total,#bd-opex-total,#bd-donut-total').text('—');
//         $('#bd-unit-count').text('—');
//         $('#bd-cards').empty();
//         $('#bd-hbar-body').empty();

//         // Single API: get_unit_wise_plan_budget for entire dashboard
//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: { financial_year: fy, month: month, table_name_filter: 'Number Card' },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) {
//                     $('#bd-cards').html('<div class="bd-loading">No data returned.</div>');
//                     return;
//                 }
//                 const { mainUnits, subUnits, overall, capex, opex } = parseData(r.message);
//                 renderBanner(overall, capex, opex, mainUnits, subUnits);
//                 renderCards(mainUnits, subUnits, overall);
//                 renderHBar(mainUnits, subUnits);
//                 renderDonut(mainUnits, overall);
//             },
//             error() {
//                 Loader.hide();
//                 frappe.msgprint('Failed to load data. Please try again.');
//             }
//         });
//     }

//     /* ── WORK PLAN: LOAD & RENDER ── */
//     function loadWorkPlan(fy) {
//         Loader.show('Loading Work Plan data…');

//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: {
//                 financial_year: fy,
//                 month: 'March',
//                 table_name_filter: 'Pie Chart'
//             },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) {
//                     frappe.msgprint('No Work Plan data returned.');
//                     return;
//                 }
//                 // Find CONSOLIDATED TOTAL row
//                 const consolidated = r.message.find(d => d.settings_doc === 'CONSOLIDATED');
//                 if (!consolidated) {
//                     frappe.msgprint('Consolidated data not found.');
//                     return;
//                 }
//                 renderWpPie(consolidated);
//                 renderWpUnitPie(r.message);
//                 renderWpGrantsUnitPie(r.message);
//                 wpDataLoaded = true;
//             },
//             error() {
//                 Loader.hide();
//                 frappe.msgprint('Failed to load Work Plan data.');
//             }
//         });
//     }

//     function renderWpPie(consolidated) {
//         const actuals = consolidated.actuals || [];
//         let grantsYtd = 0;
//         let othersYtd = 0;
//         const GRANTS_NAME = 'Grants & Donations';

//         // Walk all actuals: top-level items, sub_heads items
//         actuals.forEach(actual => {
//             if (actual.sequence_id === 9999 ||
//                 actual.name === 'CAPEX TOTAL' ||
//                 actual.name === 'OPEX TOTAL' ||
//                 actual.name === 'OVERALL GRAND TOTAL') return;

//             // Check top-level items array
//             (actual.items || []).forEach(item => {
//                 if (item.name === GRANTS_NAME) {
//                     grantsYtd += (item.ytd || 0);
//                 } else {
//                     othersYtd += (item.ytd || 0);
//                 }
//             });

//             // Check sub_heads
//             (actual.sub_heads || []).forEach(sh => {
//                 (sh.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) {
//                         grantsYtd += (item.ytd || 0);
//                     } else {
//                         othersYtd += (item.ytd || 0);
//                     }
//                 });
//             });
//         });

//         const total = grantsYtd + othersYtd;
//         const grantsPct = total > 0 ? ((grantsYtd / total) * 100).toFixed(1) : '0.0';
//         const othersPct = total > 0 ? ((othersYtd / total) * 100).toFixed(1) : '0.0';

//         // Update summary cards
//         $('#bd-wp-pie-total').text(fmtCr(total));
//         $('#bd-wp-pie-total-card').text(fmtINR(total));
//         $('#bd-wp-grants-val').text(fmtINR(grantsYtd));
//         $('#bd-wp-grants-pct').text(grantsPct + '% of total');
//         $('#bd-wp-others-val').text(fmtINR(othersYtd));
//         $('#bd-wp-others-pct').text(othersPct + '% of total');

//         // No separate legend - values shown on slices

//         // Destroy existing chart
//         if (wpPieChart) { wpPieChart.destroy(); wpPieChart = null; }

//         // Use Chart.js with custom afterDraw plugin for slice labels
//         const wpCanvas = document.getElementById('bd-wp-pie');
//         wpPieChart = new Chart(wpCanvas, {
//             type: 'pie',
//             data: {
//                 labels: ['Grants & Donations', 'Direct Work'],
//                 datasets: [{
//                     data: [Math.round(grantsYtd), Math.round(othersYtd)],
//                     backgroundColor: ['#378ADD', '#F5A623'],
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'sliceLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const tot = vals.reduce((a, b) => a + b, 0);
//                     ctx.save();
//                     ds.forEach((arc, i) => {
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         const r = arc.outerRadius * 0.65;
//                         const x = arc.x + Math.cos(angle) * r;
//                         const y = arc.y + Math.sin(angle) * r;
//                         ctx.fillStyle = '#fff';
//                         ctx.font = 'bold 14px sans-serif';
//                         ctx.textAlign = 'center';
//                         ctx.textBaseline = 'middle';
//                         ctx.fillText(fmtCr(vals[i]), x, y);
//                     });
//                     ctx.restore();
//                 }
//             }]
//         });
//     }

//     /* ── WORK PLAN: UNIT-WISE PIE ── */
//     function renderWpUnitPie(message) {
//         const PALETTE_WP = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GRANTS_NAME = 'Grants & Donations';

//         // Helper: get Direct Work ytd for a unit
//         // = GRAND TOTAL ytd minus all Grants & Donations items ytd
//         function getDirectWork(u) {
//             const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//             const grandTotal = gt ? (gt.ytd || 0) : 0;
//             let grantsAmt = 0;
//             (u.actuals || []).forEach(actual => {
//                 if (actual.sequence_id === 9999) return;
//                 (actual.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) grantsAmt += (item.ytd || 0);
//                 });
//                 (actual.sub_heads || []).forEach(sh => {
//                     (sh.items || []).forEach(item => {
//                         if (item.name === GRANTS_NAME) grantsAmt += (item.ytd || 0);
//                     });
//                 });
//             });
//             return grandTotal - grantsAmt;
//         }

//         // All MAIN units sorted by sequence_id, exclude CONSOLIDATED and sub items
//         const units = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const labels = [];
//         const values = [];
//         const colors = [];
//         let colorIdx = 0;

//         units.forEach(u => {
//             const directWork = getDirectWork(u);
//             if (!directWork || directWork <= 0) return; // skip zero
//             labels.push((u.label || '').trim());
//             values.push(Math.round(directWork));
//             colors.push(PALETTE_WP[colorIdx % PALETTE_WP.length]);
//             colorIdx++;
//         });

//         const total = values.reduce((s, v) => s + v, 0);
//         $('#bd-wp-unit-pie-total').text(fmtCr(total));

//         // Legend
//         const $leg = $('#bd-wp-unit-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl} — ${pct}%
//                 </span>
//             `);
//         });

//         if (wpUnitPieChart) { wpUnitPieChart.destroy(); wpUnitPieChart = null; }
//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         if (!values.length) return;

//         wpUnitPieChart = new Chart(document.getElementById('bd-wp-unit-pie'), {
//             type: 'pie',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'unitSliceLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const lbls = data.labels;
//                     const tot = vals.reduce((a, b) => a + b, 0);
//                     ctx.save();
//                     ds.forEach((arc, i) => {
//                         const pct = tot > 0 ? ((vals[i] / tot) * 100) : 0;
//                         if (pct < 4) return;
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         const r = arc.outerRadius * 0.65;
//                         const x = arc.x + Math.cos(angle) * r;
//                         const y = arc.y + Math.sin(angle) * r;
//                         ctx.textAlign = 'center';
//                         ctx.textBaseline = 'middle';
//                         ctx.shadowColor = 'rgba(0,0,0,0.55)';
//                         ctx.shadowBlur = 4;
//                         ctx.fillStyle = '#ffffff';
//                         ctx.font = '600 12px sans-serif';
//                         ctx.fillText(fmtCr(vals[i]), x, y);
//                         ctx.shadowBlur = 0;
//                     });
//                     ctx.restore();
//                 }
//             }]
//         });
//     }

//     /* ── WORK PLAN: GRANTS & DONATIONS UNIT PIE ── */
//     function renderWpGrantsUnitPie(message) {
//         const PALETTE_WP = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GRANTS_NAME = 'Grants & Donations';

//         function getGrantsAmt(u) {
//             let amt = 0;
//             (u.actuals || []).forEach(actual => {
//                 if (actual.sequence_id === 9999) return;
//                 (actual.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) amt += (item.ytd || 0);
//                 });
//                 (actual.sub_heads || []).forEach(sh => {
//                     (sh.items || []).forEach(item => {
//                         if (item.name === GRANTS_NAME) amt += (item.ytd || 0);
//                     });
//                 });
//             });
//             return amt;
//         }

//         const units = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const labels = [];
//         const values = [];
//         const colors = [];
//         let colorIdx = 0;

//         units.forEach(u => {
//             const grants = getGrantsAmt(u);
//             if (!grants || grants <= 0) return;
//             labels.push((u.label || '').trim());
//             values.push(Math.round(grants));
//             colors.push(PALETTE_WP[colorIdx % PALETTE_WP.length]);
//             colorIdx++;
//         });

//         const total = values.reduce((s, v) => s + v, 0);
//         $('#bd-wp-grants-unit-total').text(fmtCr(total));

//         const $leg = $('#bd-wp-grants-unit-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl} — ${pct}%
//                 </span>
//             `);
//         });

//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         if (!values.length) return;

//         wpGrantsUnitPieChart = new Chart(document.getElementById('bd-wp-grants-unit-pie'), {
//             type: 'pie',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'grantsSliceLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const lbls = data.labels;
//                     const tot = vals.reduce((a, b) => a + b, 0);
//                     ctx.save();
//                     ds.forEach((arc, i) => {
//                         const pct = tot > 0 ? ((vals[i] / tot) * 100) : 0;
//                         if (pct < 4) return;
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         const r = arc.outerRadius * 0.65;
//                         const x = arc.x + Math.cos(angle) * r;
//                         const y = arc.y + Math.sin(angle) * r;
//                         ctx.textAlign = 'center';
//                         ctx.textBaseline = 'middle';
//                         ctx.shadowColor = 'rgba(0,0,0,0.55)';
//                         ctx.shadowBlur = 4;
//                         ctx.fillStyle = '#ffffff';
//                         ctx.font = '600 12px sans-serif';
//                         ctx.fillText(fmtCr(vals[i]), x, y);
//                         ctx.shadowBlur = 0;
//                     });
//                     ctx.restore();
//                 }
//             }]
//         });
//     }

//     /* ── RESIZE ── */
//     let resizeTimer;
//     $(window).on('resize.bd', function () {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(() => triggerLoad(), 300);
//     });
//     $(wrapper).on('hide', function () { $(window).off('resize.bd'); });

//     /* ── CHART.JS ── */
//     if (!window.Chart) {
//         const s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         document.head.appendChild(s);
//     }

//     /* ── GLOBAL LOADER ── */
//     if (!$('#global-loader').length) {
//         $('body').append(
//             '<div id="global-loader" class="loader-overlay">' +
//             '<div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt="">' +
//             '<div class="loader-text">Loading, please wait</div></div></div>'
//         );
//     }
//     $('#global-loader').hide();

//     var Loader = {
//         show: function (msg) {
//             var $l = $('#global-loader');
//             $l.find('.loader-text').text(msg || 'Loading, please wait');
//             $l.css('display', 'flex').hide().fadeIn(200);
//         },
//         hide: function () { $('#global-loader').fadeOut(200); }
//     };
// };



// frappe.pages['consolidate-report'].on_page_load = function (wrapper) {

//     const page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Dashboard',
//         single_column: true
//     });

//     /* ── STYLES ── */
//     $(`<style>
//         .bd-wrap { padding: 0; box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: hidden; }

//         /* FILTER BAR */
//         .bd-filter-bar {
//             display: flex;
//             align-items: flex-end;
//             gap: 20px;
//             padding: 16px 20px 0;
//             flex-wrap: wrap;
//         }
//         .bd-filter { width: 200px; }

//         /* TAB NAV */
//         #bd-tab-nav {
//             list-style: none;
//             margin: 18px 0 0;
//             padding: 0 20px;
//             display: flex;
//             flex-wrap: wrap;
//             gap: 0;
//             border-bottom: 2px solid #d1d5db;
//         }
//         #bd-tab-nav li { margin: 0; padding: 0; }
//         #bd-tab-nav .bd-tab {
//             display: block;
//             font-size: 13px;
//             font-weight: 400;
//             color: #6b7280;
//             padding: 10px 16px 11px;
//             cursor: pointer;
//             border-bottom: 2px solid transparent;
//             margin-bottom: -2px;
//             white-space: nowrap;
//             text-decoration: none;
//             transition: color .15s, border-color .15s;
//             user-select: none;
//         }
//         #bd-tab-nav .bd-tab:hover { color: #111; }
//         #bd-tab-nav .bd-tab.active {
//             color: #111827;
//             font-weight: 700;
//             border-bottom-color: #111827;
//         }

//         /* TAB PANELS */
//         .bd-panel { display: none; padding: 16px 20px; max-width: 100%; overflow-x: hidden; }
//         .bd-panel.active { display: block; }

//         /* BANNER STRIP */
//         .bd-banner-strip {
//             display: grid;
//             grid-template-columns: repeat(3, 1fr);
//             gap: 12px;
//             margin-bottom: 16px;
//         }
//         .bd-banner-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//             transition: box-shadow .2s;
//         }
//         .bd-banner-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-banner-card.blue   { border-left-color: #1a56db; }
//         .bd-banner-card.green  { border-left-color: #0e9f6e; }
//         .bd-banner-card.orange { border-left-color: #ff5a1f; }
//         .bd-banner-label {
//             font-size: 10px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: .6px;
//             color: #888;
//             margin-bottom: 5px;
//         }
//         .bd-banner-value { font-size: 22px; font-weight: 700; color: #111; line-height: 1.2; }
//         .bd-banner-sub   { font-size: 11px; color: #aaa; margin-top: 3px; }

//         /* SECTION TITLE */
//         .bd-section-title {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             font-size: 11px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: 1.2px;
//             color: #374151;
//             margin: 0 0 12px;
//         }
//         .bd-section-title::before {
//             content: '';
//             display: inline-block;
//             width: 3px;
//             height: 14px;
//             border-radius: 2px;
//             background: #378ADD;
//             flex-shrink: 0;
//         }
//         .bd-section-title.sub::before { background: #7F77DD; }
//         .bd-section-title::after {
//             content: '';
//             flex: 1;
//             height: 1px;
//             background: #e8edf3;
//         }

//         /* CARDS */
//         .bd-cards {
//             display: grid;
//             grid-template-columns: repeat(4, 1fr);
//             gap: 12px;
//             margin-bottom: 10px;
//         }
//         .bd-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//             transition: box-shadow .2s;
//         }
//         .bd-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-card-label {
//             font-size: 10px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: .5px;
//             color: #888;
//             margin-bottom: 5px;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-value {
//             font-size: 17px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.2;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-sub { font-size: 11px; color: #aaa; margin-top: 3px; }

//         /* BOTTOM ROW */
//         .bd-bottom {
//             display: grid;
//             grid-template-columns: 1fr minmax(0, 400px);
//             gap: 14px;
//             align-items: start;
//             margin-top: 16px;
//         }
//         .bd-chart-box {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 16px 18px;
//             min-width: 0;
//         }
//         .bd-chart-title { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
//         .bd-chart-sub   { font-size: 12px; color: #aaa; margin: 0 0 14px; }

//         /* BAR ROWS */
//         .bd-bar-row {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             margin-bottom: 9px;
//         }
//         .bd-bar-label {
//             font-size: 13px;
//             font-weight: 600;
//             color: #222;
//             width: 170px;
//             min-width: 170px;
//             text-align: right;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-bar-track {
//             flex: 1;
//             height: 22px;
//             background: #f0f2f5;
//             border-radius: 5px;
//             overflow: hidden;
//         }
//         .bd-bar-fill {
//             height: 100%;
//             border-radius: 5px;
//             transition: width .5s ease;
//         }
//         .bd-bar-val {
//             font-size: 12px;
//             font-weight: 700;
//             color: #222;
//             width: 72px;
//             min-width: 72px;
//             white-space: nowrap;
//         }
//         .bd-bar-divider {
//             border: none;
//             border-top: 1px dashed #e0e4ea;
//             margin: 6px 0 10px;
//         }
//         .bd-bar-section-label {
//             font-size: 10px;
//             font-weight: 700;
//             color: #bbb;
//             text-transform: uppercase;
//             letter-spacing: .5px;
//             margin-bottom: 8px;
//         }

//         /* LEGEND */
//         .bd-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
//         .bd-legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #555; }
//         .bd-legend-dot  { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }

//         /* DONUT CENTER */
//         .bd-donut-center {
//             position: absolute; top: 50%; left: 50%;
//             transform: translate(-50%, -50%);
//             text-align: center; pointer-events: none;
//         }
//         .bd-donut-center-val { font-size: 19px; font-weight: 700; color: #111; line-height: 1.1; }
//         .bd-donut-center-lbl { font-size: 10px; color: #888; margin-top: 2px; }

//         /* WORK PLAN */
//         .bd-wp-grid {
//             display: grid;
//             grid-template-columns: 1fr minmax(0, 280px);
//             gap: 16px;
//             align-items: start;
//         }
//         .bd-wp-pie-box { min-width: 0; }
//         .bd-wp-pie-total-box {
//             text-align: center;
//             margin-top: 16px;
//             padding-top: 12px;
//             border-top: 1px solid #f0f2f5;
//         }
//         .bd-wp-pie-total-label {
//             font-size: 10px;
//             font-weight: 700;
//             letter-spacing: .8px;
//             color: #aaa;
//             text-transform: uppercase;
//             margin-bottom: 4px;
//         }
//         .bd-wp-pie-total-val {
//             font-size: 26px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.1;
//         }
//         .bd-wp-summary { display: flex; flex-direction: column; gap: 12px; }
//         .bd-wp-stat-card { cursor: default; }
//         .bd-wp-two-col-row {
//             display: grid;
//             grid-template-columns: repeat(2, minmax(0, 1fr));
//             gap: 14px;
//             margin-top: 16px;
//         }

//         /* LOADING OVERLAY */
//         #global-loader.loader-overlay {
//             position: fixed; top: 0; left: 0; right: 0; bottom: 0;
//             background: rgba(18,18,18,.92);
//             backdrop-filter: blur(6px);
//             display: none; z-index: 999999;
//             align-items: center; justify-content: center;
//         }
//         .loader-box { display: flex; flex-direction: column; align-items: center; gap: 14px; }
//         .loader-logo {
//             width: 90px; height: 90px; border-radius: 50%;
//             background: linear-gradient(145deg,#fff,#eaeaea);
//             padding: 14px; object-fit: contain;
//             box-shadow: 0 10px 30px rgba(0,0,0,.35);
//             animation: lp 1.6s infinite ease-in-out;
//         }
//         .loader-text { font-size: 13px; color: #fff; font-weight: 600; letter-spacing: .5px; opacity: .85; }
//         .loader-text::after { content: ""; display: inline-block; width: 1em; animation: ld 1.5s infinite; }
//         @keyframes lp { 0%,100% { transform: scale(1); opacity: .8; } 50% { transform: scale(1.08); opacity: 1; } }
//         @keyframes ld { 0% { content: ""; } 33% { content: "."; } 66% { content: ".."; } 100% { content: "..."; } }

//         /* RESPONSIVE */
//         /* Base — always constrain width and prevent horizontal scroll */
//         .bd-wrap, .bd-panel, .bd-filter-bar {
//             max-width: 100%;
//             overflow-x: hidden;
//         }
//         .bd-chart-box, .bd-card, .bd-banner-card {
//             min-width: 0;
//             word-break: break-word;
//         }

//         @media (min-width: 1400px) {
//             .bd-banner-value { font-size: 26px; }
//             .bd-bottom { grid-template-columns: 1fr 440px; }
//         }
//         @media (max-width: 1200px) {
//             .bd-bottom { grid-template-columns: 1fr 360px; }
//             .bd-cards  { grid-template-columns: repeat(3, 1fr); }
//         }
//         @media (max-width: 1024px) {
//             .bd-bottom { grid-template-columns: 1fr; }
//             .bd-wp-grid { grid-template-columns: 1fr; }
//         }
//         @media (max-width: 900px) {
//             .bd-wp-two-col-row { grid-template-columns: 1fr; }
//             .bd-cards { grid-template-columns: repeat(2, 1fr); }
//             .bd-banner-strip { grid-template-columns: repeat(2, 1fr); }
//         }
//         @media (max-width: 768px) {
//             .bd-cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
//             .bd-banner-strip { grid-template-columns: 1fr; }
//             .bd-bar-label { width: 110px; min-width: 110px; font-size: 11px; }
//             .bd-bar-val   { width: 60px; min-width: 60px; font-size: 11px; }
//             .bd-filter { width: 150px; }
//             .bd-banner-value { font-size: 18px; }
//             .bd-card-value { font-size: 14px; }
//         }
//         @media (max-width: 600px) {
//             .bd-filter-bar { padding: 12px 12px 0; gap: 12px; }
//             .bd-panel { padding: 10px; }
//             .bd-filter { width: 100%; }
//             .bd-bottom { gap: 10px; }
//             .bd-bar-label { width: 90px; min-width: 90px; font-size: 10px; }
//             .bd-bar-val   { width: 52px; min-width: 52px; font-size: 10px; }
//             .bd-chart-box { padding: 12px; }
//         }
//         @media (max-width: 480px) {
//             .bd-cards { grid-template-columns: 1fr; }
//             .bd-banner-strip { grid-template-columns: 1fr; }
//             .bd-banner-value { font-size: 16px; }
//         }
//     </style>`).appendTo('head');

//     /* ── PALETTE ── */
//     const PALETTE     = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//     const SUB_PALETTE = ['#5b9bd5','#17856a','#c04e22','#6b62c7','#c03d6a','#9a5e0e','#4e7a18','#c93737','#0f4a87','#6b6b68'];


//     /* ── LAYOUT ── */
//     $(page.body).html(`
//         <div class="bd-wrap">

//             <!-- Filters -->
//             <div class="bd-filter-bar">
//                 <div class="bd-filter" id="bd-fy-wrap"></div>

//             </div>

//             <!-- Tab nav -->
//             <ul id="bd-tab-nav">
//                 <li><a class="bd-tab active" data-tab="dashboard">Budget Dashboard</a></li>
//                 <li><a class="bd-tab" data-tab="workplan">Work Plan Views</a></li>
//             </ul>

//             <!-- Tab 1: Budget Dashboard -->
//             <div class="bd-panel active" id="bd-panel-dashboard">

//                 <!-- Consolidated totals -->
//                 <div class="bd-banner-strip">
//                     <div class="bd-banner-card blue">
//                         <div class="bd-banner-label">Overall Grand Total</div>
//                         <div class="bd-banner-value" id="bd-grand-total">—</div>
//                         <div class="bd-banner-sub" id="bd-unit-count">—</div>
//                     </div>
//                     <div class="bd-banner-card green">
//                         <div class="bd-banner-label">CAPEX Total</div>
//                         <div class="bd-banner-value" id="bd-capex-total">—</div>
//                         <div class="bd-banner-sub">Capital Expenses</div>
//                     </div>
//                     <div class="bd-banner-card orange">
//                         <div class="bd-banner-label">OPEX Total</div>
//                         <div class="bd-banner-value" id="bd-opex-total">—</div>
//                         <div class="bd-banner-sub">Operating Expenses</div>
//                     </div>
//                 </div>

//                 <!-- Units -->
//                 <p class="bd-section-title" style="margin-top:4px;">Units</p>
//                 <div class="bd-cards" id="bd-cards">
//                     <div class="bd-loading"><div class="bd-spinner"></div> Loading…</div>
//                 </div>

//                 <!-- Sub Units -->
//                 <p class="bd-section-title sub" id="bd-sub-title" style="margin-top:16px;">Sub Units</p>
//                 <div class="bd-cards" id="bd-subcards"></div>

//                 <!-- Charts -->
//                 <div class="bd-bottom">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget by Unit</p>
//                         <p class="bd-chart-sub">Units and Sub Units ranked by budget</p>
//                         <div id="bd-hbar-body"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget Share</p>
//                         <p class="bd-chart-sub">Units only — percentage distribution</p>
//                         <div style="position:relative;width:100%;height:260px;">
//                             <canvas id="bd-donut"></canvas>
//                             <div class="bd-donut-center">
//                                 <div class="bd-donut-center-val" id="bd-donut-total">—</div>
//                                 <div class="bd-donut-center-lbl">Grand total</div>
//                             </div>
//                         </div>
//                         <div class="bd-legend" id="bd-donut-legend"></div>
//                     </div>
//                 </div>
//             </div>

//             <!-- Tab 2: Work Plan Views -->
//             <div class="bd-panel" id="bd-panel-workplan">
//                 <div class="bd-wp-grid">
//                     <!-- Pie Chart: Grants vs Others -->
//                     <div class="bd-chart-box bd-wp-pie-box">
//                         <p class="bd-chart-title">Grants &amp; Donations And Direct Work</p>
//                         <p class="bd-chart-sub">Consolidated budget breakdown</p>
//                         <div id="bd-wp-pie-wrap" style="position:relative;width:100%;height:320px;">
//                             <canvas id="bd-wp-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL BUDGET</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-pie-total">—</div>
//                         </div>
//                     </div>
//                     <!-- Summary cards -->
//                     <div class="bd-wp-summary">
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#1a56db;">
//                             <div class="bd-card-label">Grand Total</div>
//                             <div class="bd-card-value" id="bd-wp-pie-total-card">—</div>
//                             <div class="bd-card-sub">Overall budget</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" id="bd-wp-grants-card" style="border-left-color:#378ADD;">
//                             <div class="bd-card-label">Grants &amp; Donations</div>
//                             <div class="bd-card-value" id="bd-wp-grants-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-grants-pct">—</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" id="bd-wp-others-card" style="border-left-color:#F5A623;">
//                             <div class="bd-card-label">Direct Work</div>
//                             <div class="bd-card-value" id="bd-wp-others-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-others-pct">—</div>
//                         </div>
//                     </div>
//                 </div>

//                 <!-- Direct Work & Grants unit pies — side by side -->
//                 <div class="bd-wp-two-col-row">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Direct Work — Unit-wise</p>
//                         <p class="bd-chart-sub">Direct Work budget share per unit</p>
//                         <div style="position:relative;width:100%;height:600px;">
//                             <canvas id="bd-wp-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL DIRECT WORK</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-unit-pie-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-unit-legend"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Grants &amp; Donations — Unit-wise</p>
//                         <p class="bd-chart-sub">Grants &amp; Donations budget share per unit</p>
//                         <div style="position:relative;width:100%;height:600px;">
//                             <canvas id="bd-wp-grants-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL GRANTS &amp; DONATIONS</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-grants-unit-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-grants-unit-legend"></div>
//                     </div>
//                 </div>
//             </div>

//         </div>
//     `);

//     let donutChart = null;
//     let wpPieChart = null;
//     let wpUnitPieChart = null;
//     let wpGrantsUnitPieChart = null;
//     let wpDataLoaded = false;

//     /* ── TAB SWITCHING ── */
//     $(page.body).on('click', '#bd-tab-nav .bd-tab', function (e) {
//         e.preventDefault();
//         const tab = $(this).data('tab');
//         $('#bd-tab-nav .bd-tab').removeClass('active');
//         $('.bd-panel').removeClass('active');
//         $(this).addClass('active');
//         $('#bd-panel-' + tab).addClass('active');
//         // Load work plan data when switching to that tab
//         if (tab === 'workplan' && !wpDataLoaded) {
//             const fy = fyControl.get_value();
//             if (fy) loadWorkPlan(fy);
//         }
//     });

//     /* ── FY FILTER ── */
//     const fyControl = frappe.ui.form.make_control({
//         parent: document.getElementById('bd-fy-wrap'),
//         df: {
//             label: 'Financial Year',
//             fieldtype: 'Select',
//             fieldname: 'financial_year',
//             reqd: 1,
//             change() { triggerLoad(); }
//         },
//         render_input: true
//     });
//     fyControl.refresh();
//     // Apply Frappe's native field styling
//     $(fyControl.wrapper).find('.frappe-control').css('min-width', '0');


//     function triggerLoad() {
//         const fy = fyControl.get_value();
//         if (!fy) return;
//         // Reset work plan so it reloads for new FY
//         wpDataLoaded = false;
//         if (wpPieChart) { wpPieChart.destroy(); wpPieChart = null; }
//         if (wpUnitPieChart) { wpUnitPieChart.destroy(); wpUnitPieChart = null; }
//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         load(fy, 'March');
//         // If work plan tab is active, reload it too
//         if ($('#bd-tab-nav .bd-tab.active').data('tab') === 'workplan') {
//             loadWorkPlan(fy);
//         }
//     }

//     /* ── LOAD FY LIST ── */
//     frappe.call({
//         method: 'annual_budget.api.filter_options.get_financial_year_list',
//         callback(r) {
//             if (!r.message?.length) return;
//             const years = r.message.map(d => d.financial_year);
//             fyControl.df.options = years.join('\n');
//             fyControl.refresh();

//             const now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1;
//             const fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             const def = years.includes(fy) ? fy : years[0];
//             fyControl.set_value(def);

//             load(def, 'March');
//         }
//     });

//     /* ── HELPERS ── */
//     const fmtINR = v => '₹' + Math.round(v || 0).toLocaleString('en-IN');
//     const fmtCr  = v => {
//         const abs = Math.abs(v || 0);
//         if (abs >= 1e7) return '₹' + ((v || 0) / 1e7).toFixed(2) + ' Cr';
//         if (abs >= 1e5) return '₹' + ((v || 0) / 1e5).toFixed(2) + ' L';
//         if (abs >= 1e3) return '₹' + ((v || 0) / 1e3).toFixed(2) + ' K';
//         return '₹' + Math.round(v || 0);
//     };

//     /* ── PARSE ── */
//     function parseData(message) {
//         const consolidated = message.find(d => d.settings_doc === 'CONSOLIDATED');

//         // Sort by sequence_id before mapping so colors align with order
//         const mainRaw = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const mainUnits = mainRaw.map((u, idx) => {
//                 const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//                 return {
//                     label:       (u.label || '').trim(),
//                     ytd:         gt ? (gt.ytd || 0) : 0,
//                     sequence_id: u.sequence_id || 0,
//                     color:       PALETTE[idx % PALETTE.length]
//                 };
//             })
//             .filter(u => u.ytd > 0);

//         const subRaw = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 1)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const subUnits = subRaw.map((u, idx) => {
//                 const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//                 return {
//                     label:       (u.label || '').trim(),
//                     ytd:         gt ? (gt.ytd || 0) : 0,
//                     sequence_id: u.sequence_id || 0,
//                     color:       SUB_PALETTE[idx % SUB_PALETTE.length]
//                 };
//             })
//             .filter(u => u.ytd > 0);

//         let overall = 0, capex = 0, opex = 0;
//         if (consolidated) {
//             const ca = consolidated.actuals || [];
//             overall = (ca.find(a => a.name === 'OVERALL GRAND TOTAL') || {}).ytd || 0;
//             capex   = (ca.find(a => a.name === 'CAPEX TOTAL')         || {}).ytd || 0;
//             opex    = (ca.find(a => a.name === 'OPEX TOTAL')          || {}).ytd || 0;
//         }
//         if (!overall) overall = mainUnits.reduce((s, u) => s + u.ytd, 0);

//         return { mainUnits, subUnits, overall, capex, opex };
//     }

//     /* ── RENDER BANNER ── */
//     function renderBanner(overall, capex, opex, mainUnits, subUnits) {
//         $('#bd-grand-total').text(fmtCr(overall));
//         $('#bd-capex-total').text(fmtCr(capex));
//         $('#bd-opex-total').text(fmtCr(opex));
//         $('#bd-unit-count').text(
//             mainUnits.length + ' units' +
//             (subUnits.length ? ' · ' + subUnits.length + ' sub units' : '')
//         );
//     }

//     /* ── RENDER CARDS — same design for both ── */
//     function renderCards(mainUnits, subUnits, overall) {
//         // Units
//         const $c = $('#bd-cards').empty();
//         mainUnits.forEach(u => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $c.append(`
//                 <div class="bd-card" style="border-left-color:${u.color};">
//                     <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });

//         // Sub Units — identical card design
//         const $s = $('#bd-subcards').empty();
//         if (!subUnits.length) {
//             $('#bd-sub-title').hide();
//             return;
//         }
//         $('#bd-sub-title').show();
//         subUnits.forEach(u => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $s.append(`
//                 <div class="bd-card" style="border-left-color:${u.color};">
//                     <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });
//     }

//     /* ── RENDER BAR — same style for both ── */
//     function renderHBar(mainUnits, subUnits) {
//         const $body  = $('#bd-hbar-body').empty();
//         const allMax = Math.max(...mainUnits.map(u => u.ytd), ...subUnits.map(u => u.ytd), 1);

//         // Units section
//         mainUnits.forEach(u => {
//             const pct = ((u.ytd / allMax) * 100).toFixed(1);
//             $body.append(`
//                 <div class="bd-bar-row">
//                     <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-bar-track">
//                         <div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div>
//                     </div>
//                     <div class="bd-bar-val">${fmtCr(u.ytd)}</div>
//                 </div>
//             `);
//         });

//         // Sub Units section — same bar style, just separated
//         if (subUnits.length) {
//             $body.append(`
//                 <hr class="bd-bar-divider">
//                 <div class="bd-bar-section-label">Sub Units</div>
//             `);
//             subUnits.forEach(u => {
//                 const pct = ((u.ytd / allMax) * 100).toFixed(1);
//                 $body.append(`
//                     <div class="bd-bar-row">
//                         <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                         <div class="bd-bar-track">
//                             <div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div>
//                         </div>
//                         <div class="bd-bar-val">${fmtCr(u.ytd)}</div>
//                     </div>
//                 `);
//             });
//         }
//     }

//     /* ── RENDER DONUT ── */
//     function renderDonut(mainUnits, overall) {
//         const labels = mainUnits.map(u => u.label);
//         const values = mainUnits.map(u => Math.round(u.ytd));
//         const colors = mainUnits.map(u => u.color);

//         $('#bd-donut-total').text(fmtCr(overall));

//         const $leg = $('#bd-donut-legend').empty();
//         mainUnits.forEach((u, i) => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${u.label} — ${pct}%
//                 </span>
//             `);
//         });

//         if (donutChart) { donutChart.destroy(); donutChart = null; }
//         if (!values.length) return;

//         donutChart = new Chart(document.getElementById('bd-donut'), {
//             type: 'doughnut',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 2,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 cutout: '68%',
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = overall > 0
//                                     ? ((ctx.parsed / overall) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     /* ── LOAD ── */
//     function load(fy, month) {
//         Loader.show('Loading dashboard…');
//         $('#bd-grand-total,#bd-capex-total,#bd-opex-total,#bd-donut-total').text('—');
//         $('#bd-unit-count').text('—');
//         $('#bd-cards').empty();
//         $('#bd-hbar-body').empty();

//         // Single API: get_unit_wise_plan_budget for entire dashboard
//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: { financial_year: fy, month: month, 
//                 table_name_filter: 'Number Card' 
//                 // table_name_filter: 'Unit Wise Plan'
//             },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) {
//                     $('#bd-cards').html('<div class="bd-loading">No data returned.</div>');
//                     return;
//                 }
//                 const { mainUnits, subUnits, overall, capex, opex } = parseData(r.message);
//                 renderBanner(overall, capex, opex, mainUnits, subUnits);
//                 renderCards(mainUnits, subUnits, overall);
//                 renderHBar(mainUnits, subUnits);
//                 renderDonut(mainUnits, overall);
//             },
//             error() {
//                 Loader.hide();
//                 frappe.msgprint('Failed to load data. Please try again.');
//             }
//         });
//     }

//     /* ── WORK PLAN: LOAD & RENDER ── */
//     function loadWorkPlan(fy) {
//         Loader.show('Loading Work Plan data…');

//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: {
//                 financial_year: fy,
//                 month: 'March',
//                 table_name_filter: 'Pie Chart'
//                 // table_name_filter: 'Unit Wise Plan'

//             },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) {
//                     frappe.msgprint('No Work Plan data returned.');
//                     return;
//                 }
//                 // Find CONSOLIDATED TOTAL row
//                 const consolidated = r.message.find(d => d.settings_doc === 'CONSOLIDATED');
//                 if (!consolidated) {
//                     frappe.msgprint('Consolidated data not found.');
//                     return;
//                 }
//                 renderWpPie(consolidated);
//                 renderWpUnitPie(r.message);
//                 renderWpGrantsUnitPie(r.message);
//                 wpDataLoaded = true;
//             },
//             error() {
//                 Loader.hide();
//                 frappe.msgprint('Failed to load Work Plan data.');
//             }
//         });
//     }

//     function renderWpPie(consolidated) {
//         const actuals = consolidated.actuals || [];
//         let grantsYtd = 0;
//         let othersYtd = 0;
//         const GRANTS_NAME = 'Grants & Donations';

//         // Walk all actuals: top-level items, sub_heads items
//         actuals.forEach(actual => {
//             if (actual.sequence_id === 9999 ||
//                 actual.name === 'CAPEX TOTAL' ||
//                 actual.name === 'OPEX TOTAL' ||
//                 actual.name === 'OVERALL GRAND TOTAL') return;

//             // Check top-level items array
//             (actual.items || []).forEach(item => {
//                 if (item.name === GRANTS_NAME) {
//                     grantsYtd += (item.ytd || 0);
//                 } else {
//                     othersYtd += (item.ytd || 0);
//                 }
//             });

//             // Check sub_heads
//             (actual.sub_heads || []).forEach(sh => {
//                 (sh.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) {
//                         grantsYtd += (item.ytd || 0);
//                     } else {
//                         othersYtd += (item.ytd || 0);
//                     }
//                 });
//             });
//         });

//         const total = grantsYtd + othersYtd;
//         const grantsPct = total > 0 ? ((grantsYtd / total) * 100).toFixed(1) : '0.0';
//         const othersPct = total > 0 ? ((othersYtd / total) * 100).toFixed(1) : '0.0';

//         // Update summary cards
//         $('#bd-wp-pie-total').text(fmtCr(total));
//         $('#bd-wp-pie-total-card').text(fmtINR(total));
//         $('#bd-wp-grants-val').text(fmtINR(grantsYtd));
//         $('#bd-wp-grants-pct').text(grantsPct + '% of total');
//         $('#bd-wp-others-val').text(fmtINR(othersYtd));
//         $('#bd-wp-others-pct').text(othersPct + '% of total');

//         // No separate legend - values shown on slices

//         // Destroy existing chart
//         if (wpPieChart) { wpPieChart.destroy(); wpPieChart = null; }

//         // Use Chart.js with custom afterDraw plugin for slice labels
//         const wpCanvas = document.getElementById('bd-wp-pie');
//         wpPieChart = new Chart(wpCanvas, {
//             type: 'pie',
//             data: {
//                 labels: ['Grants & Donations', 'Direct Work'],
//                 datasets: [{
//                     data: [Math.round(grantsYtd), Math.round(othersYtd)],
//                     backgroundColor: ['#378ADD', '#F5A623'],
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'sliceLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const tot = vals.reduce((a, b) => a + b, 0);
//                     ctx.save();
//                     ds.forEach((arc, i) => {
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         const r = arc.outerRadius * 0.65;
//                         const x = arc.x + Math.cos(angle) * r;
//                         const y = arc.y + Math.sin(angle) * r;
//                         ctx.fillStyle = '#fff';
//                         ctx.font = 'bold 14px sans-serif';
//                         ctx.textAlign = 'center';
//                         ctx.textBaseline = 'middle';
//                         ctx.fillText(fmtCr(vals[i]), x, y);
//                     });
//                     ctx.restore();
//                 }
//             }]
//         });
//     }

//     /* ── WORK PLAN: UNIT-WISE PIE ── */
//     function renderWpUnitPie(message) {
//         const PALETTE_WP = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GRANTS_NAME = 'Grants & Donations';

//         // Helper: get Direct Work ytd for a unit
//         // = GRAND TOTAL ytd minus all Grants & Donations items ytd
//         function getDirectWork(u) {
//             const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//             const grandTotal = gt ? (gt.ytd || 0) : 0;
//             let grantsAmt = 0;
//             (u.actuals || []).forEach(actual => {
//                 if (actual.sequence_id === 9999) return;
//                 (actual.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) grantsAmt += (item.ytd || 0);
//                 });
//                 (actual.sub_heads || []).forEach(sh => {
//                     (sh.items || []).forEach(item => {
//                         if (item.name === GRANTS_NAME) grantsAmt += (item.ytd || 0);
//                     });
//                 });
//             });
//             return grandTotal - grantsAmt;
//         }

//         // All MAIN units sorted by sequence_id, exclude CONSOLIDATED and sub items
//         const units = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const labels = [];
//         const values = [];
//         const colors = [];
//         let colorIdx = 0;

//         units.forEach(u => {
//             const directWork = getDirectWork(u);
//             if (!directWork || directWork <= 0) return; // skip zero
//             labels.push((u.label || '').trim());
//             values.push(Math.round(directWork));
//             colors.push(PALETTE_WP[colorIdx % PALETTE_WP.length]);
//             colorIdx++;
//         });

//         const total = values.reduce((s, v) => s + v, 0);
//         $('#bd-wp-unit-pie-total').text(fmtCr(total));

//         // Legend
//         const $leg = $('#bd-wp-unit-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl} — ${pct}%
//                 </span>
//             `);
//         });

//         if (wpUnitPieChart) { wpUnitPieChart.destroy(); wpUnitPieChart = null; }
//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         if (!values.length) return;

//         wpUnitPieChart = new Chart(document.getElementById('bd-wp-unit-pie'), {
//             type: 'pie',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 layout: { padding: { top: 110, bottom: 110, left: 160, right: 160 } },
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'unitSliceLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const lbls = data.labels;
//                     const tot = vals.reduce((a, b) => a + b, 0);
//                     ctx.save();
//                     ds.forEach((arc, i) => {
//                         if (!vals[i]) return;
//                         const pct = tot > 0 ? ((vals[i] / tot) * 100) : 0;
//                         const pctTxt = pct.toFixed(1) + '%';
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         const name   = (lbls[i] || '').trim();
//                         const valTxt = fmtCr(vals[i]);
//                         const isRight = Math.cos(angle) >= 0;

//                         // Draw % inside the slice if it's large enough
//                         if (pct >= 5) {
//                             const rIn = arc.outerRadius * 0.65;
//                             const xi = arc.x + Math.cos(angle) * rIn;
//                             const yi = arc.y + Math.sin(angle) * rIn;
//                             ctx.save();
//                             ctx.shadowColor = 'rgba(0,0,0,0.6)';
//                             ctx.shadowBlur = 3;
//                             ctx.fillStyle = '#fff';
//                             ctx.textAlign = 'center';
//                             ctx.textBaseline = 'middle';
//                             ctx.font = 'bold 13px sans-serif';
//                             ctx.fillText(pctTxt, xi, yi);
//                             ctx.restore();
//                         }

//                         // Outside label: name + value + pct
//                         const rInner = arc.outerRadius * 1.04;
//                         const rOuter = arc.outerRadius * 1.32;
//                         const x1 = arc.x + Math.cos(angle) * rInner;
//                         const y1 = arc.y + Math.sin(angle) * rInner;
//                         const x2 = arc.x + Math.cos(angle) * rOuter;
//                         const y2 = arc.y + Math.sin(angle) * rOuter;
//                         const elbowLen = 12;
//                         const x3 = x2 + (isRight ? elbowLen : -elbowLen);
//                         const y3 = y2;
//                         const xText = x3 + (isRight ? 5 : -5);
//                         // Pointer line + elbow
//                         ctx.strokeStyle = '#999';
//                         ctx.lineWidth = 1.2;
//                         ctx.beginPath();
//                         ctx.moveTo(x1, y1);
//                         ctx.lineTo(x2, y2);
//                         ctx.lineTo(x3, y3);
//                         ctx.stroke();
//                         // Name
//                         ctx.fillStyle = '#111';
//                         ctx.textAlign = isRight ? 'left' : 'right';
//                         ctx.textBaseline = 'middle';
//                         ctx.font = 'bold 13px sans-serif';
//                         ctx.fillText(name, xText, y3 - 9);
//                         // Value
//                         ctx.font = '600 12px sans-serif';
//                         ctx.fillStyle = '#444';
//                         ctx.fillText(valTxt, xText, y3 + 5);
//                         // Percentage
//                         ctx.font = '500 11px sans-serif';
//                         ctx.fillStyle = '#888';
//                         ctx.fillText(pctTxt, xText, y3 + 18);
//                     });
//                     ctx.restore();
//                 }
//             }]
//         });
//     }

//     /* ── WORK PLAN: GRANTS & DONATIONS UNIT PIE ── */
//     function renderWpGrantsUnitPie(message) {
//         const PALETTE_WP = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GRANTS_NAME = 'Grants & Donations';

//         function getGrantsAmt(u) {
//             let amt = 0;
//             (u.actuals || []).forEach(actual => {
//                 if (actual.sequence_id === 9999) return;
//                 (actual.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) amt += (item.ytd || 0);
//                 });
//                 (actual.sub_heads || []).forEach(sh => {
//                     (sh.items || []).forEach(item => {
//                         if (item.name === GRANTS_NAME) amt += (item.ytd || 0);
//                     });
//                 });
//             });
//             return amt;
//         }

//         const units = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const labels = [];
//         const values = [];
//         const colors = [];
//         let colorIdx = 0;

//         units.forEach(u => {
//             const grants = getGrantsAmt(u);
//             if (!grants || grants <= 0) return;
//             labels.push((u.label || '').trim());
//             values.push(Math.round(grants));
//             colors.push(PALETTE_WP[colorIdx % PALETTE_WP.length]);
//             colorIdx++;
//         });

//         const total = values.reduce((s, v) => s + v, 0);
//         $('#bd-wp-grants-unit-total').text(fmtCr(total));

//         const $leg = $('#bd-wp-grants-unit-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl} — ${pct}%
//                 </span>
//             `);
//         });

//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         if (!values.length) return;

//         wpGrantsUnitPieChart = new Chart(document.getElementById('bd-wp-grants-unit-pie'), {
//             type: 'pie',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 layout: { padding: { top: 110, bottom: 110, left: 160, right: 160 } },
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'grantsSliceLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const lbls = data.labels;
//                     const tot = vals.reduce((a, b) => a + b, 0);
//                     ctx.save();
//                     ds.forEach((arc, i) => {
//                         if (!vals[i]) return;
//                         const pct = tot > 0 ? ((vals[i] / tot) * 100) : 0;
//                         const pctTxt = pct.toFixed(1) + '%';
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         const name   = (lbls[i] || '').trim();
//                         const valTxt = fmtCr(vals[i]);
//                         const isRight = Math.cos(angle) >= 0;

//                         // Draw % inside the slice if large enough
//                         if (pct >= 5) {
//                             const rIn = arc.outerRadius * 0.65;
//                             const xi = arc.x + Math.cos(angle) * rIn;
//                             const yi = arc.y + Math.sin(angle) * rIn;
//                             ctx.save();
//                             ctx.shadowColor = 'rgba(0,0,0,0.6)';
//                             ctx.shadowBlur = 3;
//                             ctx.fillStyle = '#fff';
//                             ctx.textAlign = 'center';
//                             ctx.textBaseline = 'middle';
//                             ctx.font = 'bold 13px sans-serif';
//                             ctx.fillText(pctTxt, xi, yi);
//                             ctx.restore();
//                         }

//                         // Outside label: name + value + pct
//                         const rInner = arc.outerRadius * 1.04;
//                         const rOuter = arc.outerRadius * 1.32;
//                         const x1 = arc.x + Math.cos(angle) * rInner;
//                         const y1 = arc.y + Math.sin(angle) * rInner;
//                         const x2 = arc.x + Math.cos(angle) * rOuter;
//                         const y2 = arc.y + Math.sin(angle) * rOuter;
//                         const elbowLen = 12;
//                         const x3 = x2 + (isRight ? elbowLen : -elbowLen);
//                         const y3 = y2;
//                         const xText = x3 + (isRight ? 5 : -5);
//                         // Pointer line + elbow
//                         ctx.strokeStyle = '#999';
//                         ctx.lineWidth = 1.2;
//                         ctx.beginPath();
//                         ctx.moveTo(x1, y1);
//                         ctx.lineTo(x2, y2);
//                         ctx.lineTo(x3, y3);
//                         ctx.stroke();
//                         // Name
//                         ctx.fillStyle = '#111';
//                         ctx.textAlign = isRight ? 'left' : 'right';
//                         ctx.textBaseline = 'middle';
//                         ctx.font = 'bold 13px sans-serif';
//                         ctx.fillText(name, xText, y3 - 9);
//                         // Value
//                         ctx.font = '600 12px sans-serif';
//                         ctx.fillStyle = '#444';
//                         ctx.fillText(valTxt, xText, y3 + 5);
//                         // Percentage
//                         ctx.font = '500 11px sans-serif';
//                         ctx.fillStyle = '#888';
//                         ctx.fillText(pctTxt, xText, y3 + 18);
//                     });
//                     ctx.restore();
//                 }
//             }]
//         });
//     }

//     /* ── RESIZE ── */
//     let resizeTimer;
//     $(window).on('resize.bd', function () {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(() => {
//             if (donutChart) donutChart.resize();
//             if (wpPieChart) wpPieChart.resize();
//             if (wpUnitPieChart) wpUnitPieChart.resize();
//             if (wpGrantsUnitPieChart) wpGrantsUnitPieChart.resize();
//         }, 200);
//     });
//     $(wrapper).on('hide', function () { $(window).off('resize.bd'); });

//     /* ── CHART.JS ── */
//     if (!window.Chart) {
//         const s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         document.head.appendChild(s);
//     }

//     /* ── GLOBAL LOADER ── */
//     if (!$('#global-loader').length) {
//         $('body').append(
//             '<div id="global-loader" class="loader-overlay">' +
//             '<div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt="">' +
//             '<div class="loader-text">Loading, please wait</div></div></div>'
//         );
//     }
//     $('#global-loader').hide();

//     var Loader = {
//         show: function (msg) {
//             var $l = $('#global-loader');
//             $l.find('.loader-text').text(msg || 'Loading, please wait');
//             $l.css('display', 'flex').hide().fadeIn(200);
//         },
//         hide: function () { $('#global-loader').fadeOut(200); }
//     };
// };



// frappe.pages['consolidate-report'].on_page_load = function (wrapper) {

//     const page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Dashboard',
//         single_column: true
//     });

//     /* ── STYLES ── */
//     $(`<style>
//         .bd-wrap { padding: 0; box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: hidden; }

//         /* FILTER BAR */
//         .bd-filter-bar {
//             display: flex;
//             align-items: flex-end;
//             gap: 20px;
//             padding: 16px 20px 0;
//             flex-wrap: wrap;
//         }
//         .bd-filter { width: 200px; }

//         /* TAB NAV */
//         #bd-tab-nav {
//             list-style: none;
//             margin: 18px 0 0;
//             padding: 0 20px;
//             display: flex;
//             flex-wrap: wrap;
//             gap: 0;
//             border-bottom: 2px solid #d1d5db;
//         }
//         #bd-tab-nav li { margin: 0; padding: 0; }
//         #bd-tab-nav .bd-tab {
//             display: block;
//             font-size: 13px;
//             font-weight: 400;
//             color: #6b7280;
//             padding: 10px 16px 11px;
//             cursor: pointer;
//             border-bottom: 2px solid transparent;
//             margin-bottom: -2px;
//             white-space: nowrap;
//             text-decoration: none;
//             transition: color .15s, border-color .15s;
//             user-select: none;
//         }
//         #bd-tab-nav .bd-tab:hover { color: #111; }
//         #bd-tab-nav .bd-tab.active {
//             color: #111827;
//             font-weight: 700;
//             border-bottom-color: #111827;
//         }

//         /* TAB PANELS */
//         .bd-panel { display: none; padding: 16px 20px; max-width: 100%; overflow-x: hidden; }
//         .bd-panel.active { display: block; }

//         /* BANNER STRIP */
//         .bd-banner-strip {
//             display: grid;
//             grid-template-columns: repeat(3, 1fr);
//             gap: 12px;
//             margin-bottom: 16px;
//         }
//         .bd-banner-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//             transition: box-shadow .2s;
//         }
//         .bd-banner-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-banner-card.blue   { border-left-color: #1a56db; }
//         .bd-banner-card.green  { border-left-color: #0e9f6e; }
//         .bd-banner-card.orange { border-left-color: #ff5a1f; }
//         .bd-banner-label {
//             font-size: 10px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: .6px;
//             color: #888;
//             margin-bottom: 5px;
//         }
//         .bd-banner-value { font-size: 22px; font-weight: 700; color: #111; line-height: 1.2; }
//         .bd-banner-sub   { font-size: 11px; color: #aaa; margin-top: 3px; }

//         /* SECTION TITLE */
//         .bd-section-title {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             font-size: 11px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: 1.2px;
//             color: #374151;
//             margin: 0 0 12px;
//         }
//         .bd-section-title::before {
//             content: '';
//             display: inline-block;
//             width: 3px;
//             height: 14px;
//             border-radius: 2px;
//             background: #378ADD;
//             flex-shrink: 0;
//         }
//         .bd-section-title.sub::before { background: #7F77DD; }
//         .bd-section-title::after {
//             content: '';
//             flex: 1;
//             height: 1px;
//             background: #e8edf3;
//         }

//         /* CARDS */
//         .bd-cards {
//             display: grid;
//             grid-template-columns: repeat(4, 1fr);
//             gap: 12px;
//             margin-bottom: 10px;
//         }
//         .bd-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//             transition: box-shadow .2s;
//         }
//         .bd-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-card-label {
//             font-size: 10px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: .5px;
//             color: #888;
//             margin-bottom: 5px;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-value {
//             font-size: 17px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.2;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-sub { font-size: 11px; color: #aaa; margin-top: 3px; }

//         /* BOTTOM ROW */
//         .bd-bottom {
//             display: grid;
//             grid-template-columns: 1fr minmax(0, 400px);
//             gap: 14px;
//             align-items: start;
//             margin-top: 16px;
//         }
//         .bd-chart-box {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 16px 18px;
//             min-width: 0;
//         }
//         .bd-chart-title { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
//         .bd-chart-sub   { font-size: 12px; color: #aaa; margin: 0 0 14px; }

//         /* BAR ROWS */
//         .bd-bar-row {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             margin-bottom: 9px;
//         }
//         .bd-bar-label {
//             font-size: 13px;
//             font-weight: 600;
//             color: #222;
//             width: 170px;
//             min-width: 170px;
//             text-align: right;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-bar-track {
//             flex: 1;
//             height: 22px;
//             background: #f0f2f5;
//             border-radius: 5px;
//             overflow: hidden;
//         }
//         .bd-bar-fill {
//             height: 100%;
//             border-radius: 5px;
//             transition: width .5s ease;
//         }
//         .bd-bar-val {
//             font-size: 12px;
//             font-weight: 700;
//             color: #222;
//             width: 72px;
//             min-width: 72px;
//             white-space: nowrap;
//         }
//         .bd-bar-divider {
//             border: none;
//             border-top: 1px dashed #e0e4ea;
//             margin: 6px 0 10px;
//         }
//         .bd-bar-section-label {
//             font-size: 10px;
//             font-weight: 700;
//             color: #bbb;
//             text-transform: uppercase;
//             letter-spacing: .5px;
//             margin-bottom: 8px;
//         }

//         /* LEGEND */
//         .bd-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
//         .bd-legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #555; }
//         .bd-legend-dot  { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }

//         /* DONUT CENTER */
//         .bd-donut-center {
//             position: absolute; top: 50%; left: 50%;
//             transform: translate(-50%, -50%);
//             text-align: center; pointer-events: none;
//         }
//         .bd-donut-center-val { font-size: 19px; font-weight: 700; color: #111; line-height: 1.1; }
//         .bd-donut-center-lbl { font-size: 10px; color: #888; margin-top: 2px; }

//         /* WORK PLAN */
//         .bd-wp-grid {
//             display: grid;
//             grid-template-columns: 1fr minmax(0, 280px);
//             gap: 16px;
//             align-items: start;
//         }
//         .bd-wp-pie-box { min-width: 0; }
//         .bd-wp-pie-total-box {
//             text-align: center;
//             margin-top: 16px;
//             padding-top: 12px;
//             border-top: 1px solid #f0f2f5;
//         }
//         .bd-wp-pie-total-label {
//             font-size: 10px;
//             font-weight: 700;
//             letter-spacing: .8px;
//             color: #aaa;
//             text-transform: uppercase;
//             margin-bottom: 4px;
//         }
//         .bd-wp-pie-total-val {
//             font-size: 26px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.1;
//         }
//         .bd-wp-summary { display: flex; flex-direction: column; gap: 12px; }
//         .bd-wp-stat-card { cursor: default; }
//         .bd-wp-two-col-row {
//             display: grid;
//             grid-template-columns: repeat(2, minmax(0, 1fr));
//             gap: 14px;
//             margin-top: 16px;
//         }

//         /* LOADING OVERLAY */
//         #global-loader.loader-overlay {
//             position: fixed; top: 0; left: 0; right: 0; bottom: 0;
//             background: rgba(18,18,18,.92);
//             backdrop-filter: blur(6px);
//             display: none; z-index: 999999;
//             align-items: center; justify-content: center;
//         }
//         .loader-box { display: flex; flex-direction: column; align-items: center; gap: 14px; }
//         .loader-logo {
//             width: 90px; height: 90px; border-radius: 50%;
//             background: linear-gradient(145deg,#fff,#eaeaea);
//             padding: 14px; object-fit: contain;
//             box-shadow: 0 10px 30px rgba(0,0,0,.35);
//             animation: lp 1.6s infinite ease-in-out;
//         }
//         .loader-text { font-size: 13px; color: #fff; font-weight: 600; letter-spacing: .5px; opacity: .85; }
//         .loader-text::after { content: ""; display: inline-block; width: 1em; animation: ld 1.5s infinite; }
//         @keyframes lp { 0%,100% { transform: scale(1); opacity: .8; } 50% { transform: scale(1.08); opacity: 1; } }
//         @keyframes ld { 0% { content: ""; } 33% { content: "."; } 66% { content: ".."; } 100% { content: "..."; } }

//         /* RESPONSIVE */
//         .bd-wrap, .bd-panel, .bd-filter-bar {
//             max-width: 100%;
//             overflow-x: hidden;
//         }
//         .bd-chart-box, .bd-card, .bd-banner-card {
//             min-width: 0;
//             word-break: break-word;
//         }

//         @media (min-width: 1400px) {
//             .bd-banner-value { font-size: 26px; }
//             .bd-bottom { grid-template-columns: 1fr 440px; }
//         }
//         @media (max-width: 1200px) {
//             .bd-bottom { grid-template-columns: 1fr 360px; }
//             .bd-cards  { grid-template-columns: repeat(3, 1fr); }
//         }
//         @media (max-width: 1024px) {
//             .bd-bottom { grid-template-columns: 1fr; }
//             .bd-wp-grid { grid-template-columns: 1fr; }
//         }
//         @media (max-width: 900px) {
//             .bd-wp-two-col-row { grid-template-columns: 1fr; }
//             .bd-cards { grid-template-columns: repeat(2, 1fr); }
//             .bd-banner-strip { grid-template-columns: repeat(2, 1fr); }
//         }
//         @media (max-width: 768px) {
//             .bd-cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
//             .bd-banner-strip { grid-template-columns: 1fr; }
//             .bd-bar-label { width: 110px; min-width: 110px; font-size: 11px; }
//             .bd-bar-val   { width: 60px; min-width: 60px; font-size: 11px; }
//             .bd-filter { width: 150px; }
//             .bd-banner-value { font-size: 18px; }
//             .bd-card-value { font-size: 14px; }
//         }
//         @media (max-width: 600px) {
//             .bd-filter-bar { padding: 12px 12px 0; gap: 12px; }
//             .bd-panel { padding: 10px; }
//             .bd-filter { width: 100%; }
//             .bd-bottom { gap: 10px; }
//             .bd-bar-label { width: 90px; min-width: 90px; font-size: 10px; }
//             .bd-bar-val   { width: 52px; min-width: 52px; font-size: 10px; }
//             .bd-chart-box { padding: 12px; }
//         }
//         @media (max-width: 480px) {
//             .bd-cards { grid-template-columns: 1fr; }
//             .bd-banner-strip { grid-template-columns: 1fr; }
//             .bd-banner-value { font-size: 16px; }
//         }
//     </style>`).appendTo('head');

//     /* ── PALETTE ── */
//     const PALETTE     = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//     const SUB_PALETTE = ['#5b9bd5','#17856a','#c04e22','#6b62c7','#c03d6a','#9a5e0e','#4e7a18','#c93737','#0f4a87','#6b6b68'];

//     /* ── LAYOUT ── */
//     $(page.body).html(`
//         <div class="bd-wrap">

//             <!-- Filters -->
//             <div class="bd-filter-bar">
//                 <div class="bd-filter" id="bd-fy-wrap"></div>
//             </div>

//             <!-- Tab nav -->
//             <ul id="bd-tab-nav">
//                 <li><a class="bd-tab active" data-tab="dashboard">Budget Dashboard</a></li>
//                 <li><a class="bd-tab" data-tab="workplan">Work Plan Views</a></li>
//             </ul>

//             <!-- Tab 1: Budget Dashboard -->
//             <div class="bd-panel active" id="bd-panel-dashboard">

//                 <!-- Consolidated totals -->
//                 <div class="bd-banner-strip">
//                     <div class="bd-banner-card blue">
//                         <div class="bd-banner-label">Overall Grand Total</div>
//                         <div class="bd-banner-value" id="bd-grand-total">—</div>
//                         <div class="bd-banner-sub" id="bd-unit-count">—</div>
//                     </div>
//                     <div class="bd-banner-card green">
//                         <div class="bd-banner-label">CAPEX Total</div>
//                         <div class="bd-banner-value" id="bd-capex-total">—</div>
//                         <div class="bd-banner-sub">Capital Expenses</div>
//                     </div>
//                     <div class="bd-banner-card orange">
//                         <div class="bd-banner-label">OPEX Total</div>
//                         <div class="bd-banner-value" id="bd-opex-total">—</div>
//                         <div class="bd-banner-sub">Operating Expenses</div>
//                     </div>
//                 </div>

//                 <!-- Units -->
//                 <p class="bd-section-title" style="margin-top:4px;">Units</p>
//                 <div class="bd-cards" id="bd-cards">
//                     <div class="bd-loading"><div class="bd-spinner"></div> Loading…</div>
//                 </div>

//                 <!-- Sub Units -->
//                 <p class="bd-section-title sub" id="bd-sub-title" style="margin-top:16px;">Sub Units</p>
//                 <div class="bd-cards" id="bd-subcards"></div>

//                 <!-- Charts -->
//                 <div class="bd-bottom">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget by Unit</p>
//                         <p class="bd-chart-sub">Units and Sub Units ranked by budget</p>
//                         <div id="bd-hbar-body"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget Share</p>
//                         <p class="bd-chart-sub">Units only — percentage distribution</p>
//                         <div style="position:relative;width:100%;height:260px;">
//                             <canvas id="bd-donut"></canvas>
//                             <div class="bd-donut-center">
//                                 <div class="bd-donut-center-val" id="bd-donut-total">—</div>
//                                 <div class="bd-donut-center-lbl">Grand total</div>
//                             </div>
//                         </div>
//                         <div class="bd-legend" id="bd-donut-legend"></div>
//                     </div>
//                 </div>
//             </div>

//             <!-- Tab 2: Work Plan Views -->
//             <div class="bd-panel" id="bd-panel-workplan">
//                 <div class="bd-wp-grid">
//                     <!-- Pie Chart: Grants vs Others -->
//                     <div class="bd-chart-box bd-wp-pie-box">
//                         <p class="bd-chart-title">Grants &amp; Donations And Direct Work</p>
//                         <p class="bd-chart-sub">Consolidated budget breakdown</p>
//                         <div id="bd-wp-pie-wrap" style="position:relative;width:100%;height:320px;">
//                             <canvas id="bd-wp-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL BUDGET</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-pie-total">—</div>
//                         </div>
//                     </div>
//                     <!-- Summary cards -->
//                     <div class="bd-wp-summary">
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#1a56db;">
//                             <div class="bd-card-label">Grand Total</div>
//                             <div class="bd-card-value" id="bd-wp-pie-total-card">—</div>
//                             <div class="bd-card-sub">Overall budget</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" id="bd-wp-grants-card" style="border-left-color:#378ADD;">
//                             <div class="bd-card-label">Grants &amp; Donations</div>
//                             <div class="bd-card-value" id="bd-wp-grants-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-grants-pct">—</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" id="bd-wp-others-card" style="border-left-color:#F5A623;">
//                             <div class="bd-card-label">Direct Work</div>
//                             <div class="bd-card-value" id="bd-wp-others-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-others-pct">—</div>
//                         </div>
//                     </div>
//                 </div>

//                 <!-- Direct Work & Grants unit pies — side by side -->
//                 <div class="bd-wp-two-col-row">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Direct Work — Unit-wise</p>
//                         <p class="bd-chart-sub">Direct Work budget share per unit</p>
//                         <div style="position:relative;width:100%;height:900px;">
//                             <canvas id="bd-wp-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL DIRECT WORK</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-unit-pie-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-unit-legend"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Grants &amp; Donations — Unit-wise</p>
//                         <p class="bd-chart-sub">Grants &amp; Donations budget share per unit</p>
//                         <div style="position:relative;width:100%;height:900px;">
//                             <canvas id="bd-wp-grants-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL GRANTS &amp; DONATIONS</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-grants-unit-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-grants-unit-legend"></div>
//                     </div>
//                 </div>
//             </div>

//         </div>
//     `);

//     let donutChart = null;
//     let wpPieChart = null;
//     let wpUnitPieChart = null;
//     let wpGrantsUnitPieChart = null;
//     let wpDataLoaded = false;

//     /* ── TAB SWITCHING ── */
//     $(page.body).on('click', '#bd-tab-nav .bd-tab', function (e) {
//         e.preventDefault();
//         const tab = $(this).data('tab');
//         $('#bd-tab-nav .bd-tab').removeClass('active');
//         $('.bd-panel').removeClass('active');
//         $(this).addClass('active');
//         $('#bd-panel-' + tab).addClass('active');
//         if (tab === 'workplan' && !wpDataLoaded) {
//             const fy = fyControl.get_value();
//             if (fy) loadWorkPlan(fy);
//         }
//     });

//     /* ── FY FILTER ── */
//     const fyControl = frappe.ui.form.make_control({
//         parent: document.getElementById('bd-fy-wrap'),
//         df: {
//             label: 'Financial Year',
//             fieldtype: 'Select',
//             fieldname: 'financial_year',
//             reqd: 1,
//             change() { triggerLoad(); }
//         },
//         render_input: true
//     });
//     fyControl.refresh();
//     $(fyControl.wrapper).find('.frappe-control').css('min-width', '0');

//     function triggerLoad() {
//         const fy = fyControl.get_value();
//         if (!fy) return;
//         wpDataLoaded = false;
//         if (wpPieChart)         { wpPieChart.destroy();         wpPieChart = null; }
//         if (wpUnitPieChart)     { wpUnitPieChart.destroy();     wpUnitPieChart = null; }
//         if (wpGrantsUnitPieChart){ wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         load(fy, 'March');
//         if ($('#bd-tab-nav .bd-tab.active').data('tab') === 'workplan') {
//             loadWorkPlan(fy);
//         }
//     }

//     /* ── LOAD FY LIST ── */
//     frappe.call({
//         method: 'annual_budget.api.filter_options.get_financial_year_list',
//         callback(r) {
//             if (!r.message?.length) return;
//             const years = r.message.map(d => d.financial_year);
//             fyControl.df.options = years.join('\n');
//             fyControl.refresh();

//             const now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1;
//             const fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             const def = years.includes(fy) ? fy : years[0];
//             fyControl.set_value(def);

//             load(def, 'March');
//         }
//     });

//     /* ── HELPERS ── */
//     const fmtINR = v => '₹' + Math.round(v || 0).toLocaleString('en-IN');
//     const fmtCr  = v => {
//         const abs = Math.abs(v || 0);
//         if (abs >= 1e7) return '₹' + ((v || 0) / 1e7).toFixed(2) + ' Cr';
//         if (abs >= 1e5) return '₹' + ((v || 0) / 1e5).toFixed(2) + ' L';
//         if (abs >= 1e3) return '₹' + ((v || 0) / 1e3).toFixed(2) + ' K';
//         return '₹' + Math.round(v || 0);
//     };

//     /* ── SHARED LABEL PLUGIN FACTORY ──
//        Builds a Chart.js afterDraw plugin that:
//          1. Draws % text inside each slice (if slice >= 5%)
//          2. Splits labels into left / right buckets
//          3. Sorts each bucket top→bottom and spreads them
//             so no two labels overlap (min LABEL_H gap)
//          4. Draws an elbow connector: slice-edge → radial bend → horizontal to label
//     ── */
//     function makeLabelPlugin(pluginId) {
//         const LINE_H  = 15;   // px between the 3 text rows
//         const LABEL_H = LINE_H * 3 + 8; // total height reserved per label

//         function spreadLabels(items) {
//             if (!items.length) return;
//             items.sort((a, b) => a.naturalY - b.naturalY);
//             // forward pass: push downward
//             items[0].finalY = items[0].naturalY;
//             for (let k = 1; k < items.length; k++) {
//                 const minY = items[k - 1].finalY + LABEL_H;
//                 items[k].finalY = Math.max(items[k].naturalY, minY);
//             }
//             // backward pass: pull upward if pushed too far down
//             for (let k = items.length - 2; k >= 0; k--) {
//                 const maxY = items[k + 1].finalY - LABEL_H;
//                 if (items[k].finalY > maxY) items[k].finalY = maxY;
//             }
//         }

//         return {
//             id: pluginId,
//             afterDraw(chart) {
//                 const { ctx, data } = chart;
//                 const meta = chart.getDatasetMeta(0);
//                 const arcs = meta.data;
//                 const vals = data.datasets[0].data;
//                 const lbls = data.labels;
//                 const tot  = vals.reduce((a, b) => a + b, 0);
//                 if (!tot || !arcs.length) return;

//                 const cx      = arcs[0].x;
//                 const cy      = arcs[0].y;
//                 const outerR  = arcs[0].outerRadius;

//                 // Horizontal terminus X for each side — sit just outside the padding
//                 const RIGHT_X = cx + outerR + 90;
//                 const LEFT_X  = cx - outerR - 90;

//                 ctx.save();

//                 /* ── Step 1: % inside large slices ── */
//                 arcs.forEach((arc, i) => {
//                     if (!vals[i]) return;
//                     const pct = (vals[i] / tot) * 100;
//                     if (pct < 5) return;
//                     const angle = (arc.startAngle + arc.endAngle) / 2;
//                     const r = outerR * 0.65;
//                     const xi = cx + Math.cos(angle) * r;
//                     const yi = cy + Math.sin(angle) * r;
//                     ctx.save();
//                     ctx.shadowColor = 'rgba(0,0,0,0.55)';
//                     ctx.shadowBlur  = 3;
//                     ctx.fillStyle   = '#fff';
//                     ctx.textAlign   = 'center';
//                     ctx.textBaseline = 'middle';
//                     ctx.font        = 'bold 12px sans-serif';
//                     ctx.fillText(pct.toFixed(1) + '%', xi, yi);
//                     ctx.restore();
//                 });

//                 /* ── Step 2: Build left / right buckets ── */
//                 const left = [], right = [];
//                 arcs.forEach((arc, i) => {
//                     if (!vals[i]) return;
//                     const pct   = (vals[i] / tot) * 100;
//                     const angle = (arc.startAngle + arc.endAngle) / 2;
//                     const entry = {
//                         i,
//                         angle,
//                         isRight:  Math.cos(angle) >= 0,
//                         name:     (lbls[i] || '').trim(),
//                         valTxt:   fmtCr(vals[i]),
//                         pctTxt:   pct.toFixed(1) + '%',
//                         naturalY: cy + Math.sin(angle) * (outerR * 1.28),
//                         finalY:   0
//                     };
//                     (entry.isRight ? right : left).push(entry);
//                 });

//                 /* ── Step 3: Spread labels ── */
//                 spreadLabels(left);
//                 spreadLabels(right);

//                 /* ── Step 4: Draw connectors + text ── */
//                 [...left, ...right].forEach(entry => {
//                     const { angle, isRight, name, valTxt, pctTxt, finalY } = entry;

//                     // Three points of the elbow connector
//                     const x1 = cx + Math.cos(angle) * (outerR * 1.03);   // slice edge
//                     const y1 = cy + Math.sin(angle) * (outerR * 1.03);
//                     const x2 = cx + Math.cos(angle) * (outerR * 1.22);   // radial bend
//                     const y2 = cy + Math.sin(angle) * (outerR * 1.22);
//                     const x3 = isRight ? RIGHT_X : LEFT_X;               // horizontal end
//                     const y3 = finalY;
//                     const xTxt = x3 + (isRight ? 6 : -6);

//                     // Connector line
//                     ctx.strokeStyle = '#bbb';
//                     ctx.lineWidth   = 1;
//                     ctx.beginPath();
//                     ctx.moveTo(x1, y1);
//                     ctx.lineTo(x2, y2);
//                     ctx.lineTo(x3, y3);
//                     ctx.stroke();

//                     // Small dot at slice edge
//                     ctx.beginPath();
//                     ctx.arc(x1, y1, 2, 0, Math.PI * 2);
//                     ctx.fillStyle = '#ccc';
//                     ctx.fill();

//                     // Label: name (bold)
//                     ctx.fillStyle    = '#111';
//                     ctx.textAlign    = isRight ? 'left' : 'right';
//                     ctx.textBaseline = 'alphabetic';
//                     ctx.font         = 'bold 12px sans-serif';
//                     ctx.fillText(name, xTxt, y3);

//                     // Label: value
//                     ctx.font      = '600 11px sans-serif';
//                     ctx.fillStyle = '#444';
//                     ctx.fillText(valTxt, xTxt, y3 + LINE_H);

//                     // Label: percentage
//                     ctx.font      = '500 10px sans-serif';
//                     ctx.fillStyle = '#888';
//                     ctx.fillText(pctTxt, xTxt, y3 + LINE_H * 2);
//                 });

//                 ctx.restore();
//             }
//         };
//     }

//     /* ── PARSE ── */
//     function parseData(message) {
//         const consolidated = message.find(d => d.settings_doc === 'CONSOLIDATED');

//         const mainRaw = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const mainUnits = mainRaw.map((u, idx) => {
//                 const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//                 return {
//                     label:       (u.label || '').trim(),
//                     ytd:         gt ? (gt.ytd || 0) : 0,
//                     sequence_id: u.sequence_id || 0,
//                     color:       PALETTE[idx % PALETTE.length]
//                 };
//             })
//             .filter(u => u.ytd > 0);

//         const subRaw = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 1)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const subUnits = subRaw.map((u, idx) => {
//                 const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//                 return {
//                     label:       (u.label || '').trim(),
//                     ytd:         gt ? (gt.ytd || 0) : 0,
//                     sequence_id: u.sequence_id || 0,
//                     color:       SUB_PALETTE[idx % SUB_PALETTE.length]
//                 };
//             })
//             .filter(u => u.ytd > 0);

//         let overall = 0, capex = 0, opex = 0;
//         if (consolidated) {
//             const ca = consolidated.actuals || [];
//             overall = (ca.find(a => a.name === 'OVERALL GRAND TOTAL') || {}).ytd || 0;
//             capex   = (ca.find(a => a.name === 'CAPEX TOTAL')         || {}).ytd || 0;
//             opex    = (ca.find(a => a.name === 'OPEX TOTAL')          || {}).ytd || 0;
//         }
//         if (!overall) overall = mainUnits.reduce((s, u) => s + u.ytd, 0);

//         return { mainUnits, subUnits, overall, capex, opex };
//     }

//     /* ── RENDER BANNER ── */
//     function renderBanner(overall, capex, opex, mainUnits, subUnits) {
//         $('#bd-grand-total').text(fmtCr(overall));
//         $('#bd-capex-total').text(fmtCr(capex));
//         $('#bd-opex-total').text(fmtCr(opex));
//         $('#bd-unit-count').text(
//             mainUnits.length + ' units' +
//             (subUnits.length ? ' · ' + subUnits.length + ' sub units' : '')
//         );
//     }

//     /* ── RENDER CARDS ── */
//     function renderCards(mainUnits, subUnits, overall) {
//         const $c = $('#bd-cards').empty();
//         mainUnits.forEach(u => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $c.append(`
//                 <div class="bd-card" style="border-left-color:${u.color};">
//                     <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });

//         const $s = $('#bd-subcards').empty();
//         if (!subUnits.length) {
//             $('#bd-sub-title').hide();
//             return;
//         }
//         $('#bd-sub-title').show();
//         subUnits.forEach(u => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $s.append(`
//                 <div class="bd-card" style="border-left-color:${u.color};">
//                     <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });
//     }

//     /* ── RENDER BAR ── */
//     function renderHBar(mainUnits, subUnits) {
//         const $body  = $('#bd-hbar-body').empty();
//         const allMax = Math.max(...mainUnits.map(u => u.ytd), ...subUnits.map(u => u.ytd), 1);

//         mainUnits.forEach(u => {
//             const pct = ((u.ytd / allMax) * 100).toFixed(1);
//             $body.append(`
//                 <div class="bd-bar-row">
//                     <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-bar-track">
//                         <div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div>
//                     </div>
//                     <div class="bd-bar-val">${fmtCr(u.ytd)}</div>
//                 </div>
//             `);
//         });

//         if (subUnits.length) {
//             $body.append(`
//                 <hr class="bd-bar-divider">
//                 <div class="bd-bar-section-label">Sub Units</div>
//             `);
//             subUnits.forEach(u => {
//                 const pct = ((u.ytd / allMax) * 100).toFixed(1);
//                 $body.append(`
//                     <div class="bd-bar-row">
//                         <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                         <div class="bd-bar-track">
//                             <div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div>
//                         </div>
//                         <div class="bd-bar-val">${fmtCr(u.ytd)}</div>
//                     </div>
//                 `);
//             });
//         }
//     }

//     /* ── RENDER DONUT ── */
//     function renderDonut(mainUnits, overall) {
//         const labels = mainUnits.map(u => u.label);
//         const values = mainUnits.map(u => Math.round(u.ytd));
//         const colors = mainUnits.map(u => u.color);

//         $('#bd-donut-total').text(fmtCr(overall));

//         const $leg = $('#bd-donut-legend').empty();
//         mainUnits.forEach((u, i) => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${u.label} — ${pct}%
//                 </span>
//             `);
//         });

//         if (donutChart) { donutChart.destroy(); donutChart = null; }
//         if (!values.length) return;

//         donutChart = new Chart(document.getElementById('bd-donut'), {
//             type: 'doughnut',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 2,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 cutout: '68%',
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = overall > 0
//                                     ? ((ctx.parsed / overall) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     /* ── LOAD ── */
//     function load(fy, month) {
//         Loader.show('Loading dashboard…');
//         $('#bd-grand-total,#bd-capex-total,#bd-opex-total,#bd-donut-total').text('—');
//         $('#bd-unit-count').text('—');
//         $('#bd-cards').empty();
//         $('#bd-hbar-body').empty();

//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: { financial_year: fy, month: month, table_name_filter: 'Number Card' },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) {
//                     $('#bd-cards').html('<div class="bd-loading">No data returned.</div>');
//                     return;
//                 }
//                 const { mainUnits, subUnits, overall, capex, opex } = parseData(r.message);
//                 renderBanner(overall, capex, opex, mainUnits, subUnits);
//                 renderCards(mainUnits, subUnits, overall);
//                 renderHBar(mainUnits, subUnits);
//                 renderDonut(mainUnits, overall);
//             },
//             error() {
//                 Loader.hide();
//                 frappe.msgprint('Failed to load data. Please try again.');
//             }
//         });
//     }

//     /* ── WORK PLAN: LOAD ── */
//     function loadWorkPlan(fy) {
//         Loader.show('Loading Work Plan data…');

//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: {
//                 financial_year: fy,
//                 month: 'March',
//                 table_name_filter: 'Pie Chart'
//             },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) {
//                     frappe.msgprint('No Work Plan data returned.');
//                     return;
//                 }
//                 const consolidated = r.message.find(d => d.settings_doc === 'CONSOLIDATED');
//                 if (!consolidated) {
//                     frappe.msgprint('Consolidated data not found.');
//                     return;
//                 }
//                 renderWpPie(consolidated);
//                 renderWpUnitPie(r.message);
//                 renderWpGrantsUnitPie(r.message);
//                 wpDataLoaded = true;
//             },
//             error() {
//                 Loader.hide();
//                 frappe.msgprint('Failed to load Work Plan data.');
//             }
//         });
//     }

//     /* ── WORK PLAN: GRANTS vs DIRECT WORK PIE ── */
//     function renderWpPie(consolidated) {
//         const actuals = consolidated.actuals || [];
//         let grantsYtd = 0;
//         let othersYtd = 0;
//         const GRANTS_NAME = 'Grants & Donations';

//         actuals.forEach(actual => {
//             if (actual.sequence_id === 9999 ||
//                 actual.name === 'CAPEX TOTAL' ||
//                 actual.name === 'OPEX TOTAL' ||
//                 actual.name === 'OVERALL GRAND TOTAL') return;

//             (actual.items || []).forEach(item => {
//                 if (item.name === GRANTS_NAME) grantsYtd += (item.ytd || 0);
//                 else                           othersYtd += (item.ytd || 0);
//             });
//             (actual.sub_heads || []).forEach(sh => {
//                 (sh.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) grantsYtd += (item.ytd || 0);
//                     else                           othersYtd += (item.ytd || 0);
//                 });
//             });
//         });

//         const total      = grantsYtd + othersYtd;
//         const grantsPct  = total > 0 ? ((grantsYtd / total) * 100).toFixed(1) : '0.0';
//         const othersPct  = total > 0 ? ((othersYtd / total) * 100).toFixed(1) : '0.0';

//         $('#bd-wp-pie-total').text(fmtCr(total));
//         $('#bd-wp-pie-total-card').text(fmtINR(total));
//         $('#bd-wp-grants-val').text(fmtINR(grantsYtd));
//         $('#bd-wp-grants-pct').text(grantsPct + '% of total');
//         $('#bd-wp-others-val').text(fmtINR(othersYtd));
//         $('#bd-wp-others-pct').text(othersPct + '% of total');

//         if (wpPieChart) { wpPieChart.destroy(); wpPieChart = null; }

//         wpPieChart = new Chart(document.getElementById('bd-wp-pie'), {
//             type: 'pie',
//             data: {
//                 labels: ['Grants & Donations', 'Direct Work'],
//                 datasets: [{
//                     data: [Math.round(grantsYtd), Math.round(othersYtd)],
//                     backgroundColor: ['#378ADD', '#F5A623'],
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'sliceLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds   = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const tot  = vals.reduce((a, b) => a + b, 0);
//                     ctx.save();
//                     ds.forEach((arc, i) => {
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         const r = arc.outerRadius * 0.65;
//                         const x = arc.x + Math.cos(angle) * r;
//                         const y = arc.y + Math.sin(angle) * r;
//                         ctx.fillStyle    = '#fff';
//                         ctx.font         = 'bold 14px sans-serif';
//                         ctx.textAlign    = 'center';
//                         ctx.textBaseline = 'middle';
//                         ctx.fillText(fmtCr(vals[i]), x, y);
//                     });
//                     ctx.restore();
//                 }
//             }]
//         });
//     }

//     /* ── WORK PLAN: DIRECT WORK UNIT PIE ── */
//     function renderWpUnitPie(message) {
//         const PALETTE_WP  = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GRANTS_NAME = 'Grants & Donations';

//         function getDirectWork(u) {
//             const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//             const grandTotal = gt ? (gt.ytd || 0) : 0;
//             let grantsAmt = 0;
//             (u.actuals || []).forEach(actual => {
//                 if (actual.sequence_id === 9999) return;
//                 (actual.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) grantsAmt += (item.ytd || 0);
//                 });
//                 (actual.sub_heads || []).forEach(sh => {
//                     (sh.items || []).forEach(item => {
//                         if (item.name === GRANTS_NAME) grantsAmt += (item.ytd || 0);
//                     });
//                 });
//             });
//             return grandTotal - grantsAmt;
//         }

//         const units = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const labels = [], values = [], colors = [];
//         let colorIdx = 0;
//         units.forEach(u => {
//             const dw = getDirectWork(u);
//             if (!dw || dw <= 0) return;
//             labels.push((u.label || '').trim());
//             values.push(Math.round(dw));
//             colors.push(PALETTE_WP[colorIdx++ % PALETTE_WP.length]);
//         });

//         const total = values.reduce((s, v) => s + v, 0);
//         $('#bd-wp-unit-pie-total').text(fmtCr(total));

//         const $leg = $('#bd-wp-unit-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl} — ${pct}%
//                 </span>
//             `);
//         });

//         if (wpUnitPieChart) { wpUnitPieChart.destroy(); wpUnitPieChart = null; }
//         if (!values.length) return;

//         wpUnitPieChart = new Chart(document.getElementById('bd-wp-unit-pie'), {
//             type: 'pie',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 layout: { padding: { top: 60, bottom: 60, left: 260, right: 260 } },
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [ makeLabelPlugin('unitSliceLabels') ]
//         });
//     }

//     /* ── WORK PLAN: GRANTS UNIT PIE ── */
//     function renderWpGrantsUnitPie(message) {
//         const PALETTE_WP  = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GRANTS_NAME = 'Grants & Donations';

//         function getGrantsAmt(u) {
//             let amt = 0;
//             (u.actuals || []).forEach(actual => {
//                 if (actual.sequence_id === 9999) return;
//                 (actual.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) amt += (item.ytd || 0);
//                 });
//                 (actual.sub_heads || []).forEach(sh => {
//                     (sh.items || []).forEach(item => {
//                         if (item.name === GRANTS_NAME) amt += (item.ytd || 0);
//                     });
//                 });
//             });
//             return amt;
//         }

//         const units = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const labels = [], values = [], colors = [];
//         let colorIdx = 0;
//         units.forEach(u => {
//             const grants = getGrantsAmt(u);
//             if (!grants || grants <= 0) return;
//             labels.push((u.label || '').trim());
//             values.push(Math.round(grants));
//             colors.push(PALETTE_WP[colorIdx++ % PALETTE_WP.length]);
//         });

//         const total = values.reduce((s, v) => s + v, 0);
//         $('#bd-wp-grants-unit-total').text(fmtCr(total));

//         const $leg = $('#bd-wp-grants-unit-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl} — ${pct}%
//                 </span>
//             `);
//         });

//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         if (!values.length) return;

//         wpGrantsUnitPieChart = new Chart(document.getElementById('bd-wp-grants-unit-pie'), {
//             type: 'pie',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 layout: { padding: { top: 60, bottom: 60, left: 260, right: 260 } },
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [ makeLabelPlugin('grantsSliceLabels') ]
//         });
//     }

//     /* ── RESIZE ── */
//     let resizeTimer;
//     $(window).on('resize.bd', function () {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(() => {
//             if (donutChart)           donutChart.resize();
//             if (wpPieChart)           wpPieChart.resize();
//             if (wpUnitPieChart)       wpUnitPieChart.resize();
//             if (wpGrantsUnitPieChart) wpGrantsUnitPieChart.resize();
//         }, 200);
//     });
//     $(wrapper).on('hide', function () { $(window).off('resize.bd'); });

//     /* ── CHART.JS ── */
//     if (!window.Chart) {
//         const s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         document.head.appendChild(s);
//     }

//     /* ── GLOBAL LOADER ── */
//     if (!$('#global-loader').length) {
//         $('body').append(
//             '<div id="global-loader" class="loader-overlay">' +
//             '<div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt="">' +
//             '<div class="loader-text">Loading, please wait</div></div></div>'
//         );
//     }
//     $('#global-loader').hide();

//     var Loader = {
//         show: function (msg) {
//             var $l = $('#global-loader');
//             $l.find('.loader-text').text(msg || 'Loading, please wait');
//             $l.css('display', 'flex').hide().fadeIn(200);
//         },
//         hide: function () { $('#global-loader').fadeOut(200); }
//     };
// };



// frappe.pages['consolidate-report'].on_page_load = function (wrapper) {

//     const page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Dashboard',
//         single_column: true
//     });

//     /* ── STYLES ── */
//     $(`<style>
//         .bd-wrap { padding: 0; box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: hidden; }

//         .bd-filter-bar {
//             display: flex; align-items: flex-end; gap: 20px;
//             padding: 16px 20px 0; flex-wrap: wrap;
//         }
//         .bd-filter { width: 200px; }

//         #bd-tab-nav {
//             list-style: none; margin: 18px 0 0; padding: 0 20px;
//             display: flex; flex-wrap: wrap; gap: 0;
//             border-bottom: 2px solid #d1d5db;
//         }
//         #bd-tab-nav li { margin: 0; padding: 0; }
//         #bd-tab-nav .bd-tab {
//             display: block; font-size: 13px; font-weight: 400; color: #6b7280;
//             padding: 10px 16px 11px; cursor: pointer;
//             border-bottom: 2px solid transparent; margin-bottom: -2px;
//             white-space: nowrap; text-decoration: none;
//             transition: color .15s, border-color .15s; user-select: none;
//         }
//         #bd-tab-nav .bd-tab:hover { color: #111; }
//         #bd-tab-nav .bd-tab.active { color: #111827; font-weight: 700; border-bottom-color: #111827; }

//         .bd-panel { display: none; padding: 16px 20px; max-width: 100%; overflow-x: hidden; }
//         .bd-panel.active { display: block; }

//         .bd-banner-strip { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
//         .bd-banner-card {
//             background: #fff; border: 1px solid #e8edf3; border-radius: 12px;
//             padding: 14px 16px; border-left: 4px solid #378ADD; min-width: 0; transition: box-shadow .2s;
//         }
//         .bd-banner-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-banner-card.blue   { border-left-color: #1a56db; }
//         .bd-banner-card.green  { border-left-color: #0e9f6e; }
//         .bd-banner-card.orange { border-left-color: #ff5a1f; }
//         .bd-banner-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #888; margin-bottom: 5px; }
//         .bd-banner-value { font-size: 22px; font-weight: 700; color: #111; line-height: 1.2; }
//         .bd-banner-sub   { font-size: 11px; color: #aaa; margin-top: 3px; }

//         .bd-section-title {
//             display: flex; align-items: center; gap: 10px;
//             font-size: 11px; font-weight: 700; text-transform: uppercase;
//             letter-spacing: 1.2px; color: #374151; margin: 0 0 12px;
//         }
//         .bd-section-title::before { content:''; display:inline-block; width:3px; height:14px; border-radius:2px; background:#378ADD; flex-shrink:0; }
//         .bd-section-title.sub::before { background:#7F77DD; }
//         .bd-section-title::after { content:''; flex:1; height:1px; background:#e8edf3; }

//         .bd-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 10px; }
//         .bd-card { background: #fff; border: 1px solid #e8edf3; border-radius: 12px; padding: 14px 16px; border-left: 4px solid #378ADD; min-width: 0; transition: box-shadow .2s; }
//         .bd-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #888; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//         .bd-card-value { font-size: 17px; font-weight: 700; color: #111; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//         .bd-card-sub { font-size: 11px; color: #aaa; margin-top: 3px; }

//         .bd-bottom { display: grid; grid-template-columns: 1fr minmax(0,400px); gap: 14px; align-items: start; margin-top: 16px; }
//         .bd-chart-box { background: #fff; border: 1px solid #e8edf3; border-radius: 12px; padding: 16px 18px; min-width: 0; }
//         .bd-chart-title { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
//         .bd-chart-sub   { font-size: 12px; color: #aaa; margin: 0 0 14px; }

//         .bd-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
//         .bd-bar-label { font-size: 13px; font-weight: 600; color: #222; width: 170px; min-width: 170px; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//         .bd-bar-track { flex: 1; height: 22px; background: #f0f2f5; border-radius: 5px; overflow: hidden; }
//         .bd-bar-fill  { height: 100%; border-radius: 5px; transition: width .5s ease; }
//         .bd-bar-val   { font-size: 12px; font-weight: 700; color: #222; width: 72px; min-width: 72px; white-space: nowrap; }
//         .bd-bar-divider { border: none; border-top: 1px dashed #e0e4ea; margin: 6px 0 10px; }
//         .bd-bar-section-label { font-size: 10px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }

//         .bd-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
//         .bd-legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #555; }
//         .bd-legend-dot  { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }

//         .bd-donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; pointer-events: none; }
//         .bd-donut-center-val { font-size: 19px; font-weight: 700; color: #111; line-height: 1.1; }
//         .bd-donut-center-lbl { font-size: 10px; color: #888; margin-top: 2px; }

//         .bd-wp-grid { display: grid; grid-template-columns: 1fr minmax(0,280px); gap: 16px; align-items: start; }
//         .bd-wp-pie-box { min-width: 0; }
//         .bd-wp-pie-total-box { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #f0f2f5; }
//         .bd-wp-pie-total-label { font-size: 10px; font-weight: 700; letter-spacing: .8px; color: #aaa; text-transform: uppercase; margin-bottom: 4px; }
//         .bd-wp-pie-total-val   { font-size: 26px; font-weight: 700; color: #111; line-height: 1.1; }
//         .bd-wp-summary { display: flex; flex-direction: column; gap: 12px; }
//         .bd-wp-stat-card { cursor: default; }
//         .bd-wp-two-col-row { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; margin-top: 16px; }

//         /* Canvas wrapper — height set dynamically by plugin */
//         .bd-pie-canvas-wrap { position: relative; width: 100%; min-height: 400px; }

//         #global-loader.loader-overlay {
//             position: fixed; top:0; left:0; right:0; bottom:0;
//             background: rgba(18,18,18,.92); backdrop-filter: blur(6px);
//             display: none; z-index: 999999; align-items: center; justify-content: center;
//         }
//         .loader-box { display:flex; flex-direction:column; align-items:center; gap:14px; }
//         .loader-logo { width:90px; height:90px; border-radius:50%; background:linear-gradient(145deg,#fff,#eaeaea); padding:14px; object-fit:contain; box-shadow:0 10px 30px rgba(0,0,0,.35); animation:lp 1.6s infinite ease-in-out; }
//         .loader-text { font-size:13px; color:#fff; font-weight:600; letter-spacing:.5px; opacity:.85; }
//         .loader-text::after { content:""; display:inline-block; width:1em; animation:ld 1.5s infinite; }
//         @keyframes lp { 0%,100%{transform:scale(1);opacity:.8} 50%{transform:scale(1.08);opacity:1} }
//         @keyframes ld { 0%{content:""} 33%{content:"."} 66%{content:".."} 100%{content:"..."} }

//         .bd-wrap,.bd-panel,.bd-filter-bar { max-width:100%; overflow-x:hidden; }
//         .bd-chart-box,.bd-card,.bd-banner-card { min-width:0; word-break:break-word; }

//         @media (min-width:1400px) { .bd-banner-value{font-size:26px} .bd-bottom{grid-template-columns:1fr 440px} }
//         @media (max-width:1200px) { .bd-bottom{grid-template-columns:1fr 360px} .bd-cards{grid-template-columns:repeat(3,1fr)} }
//         @media (max-width:1024px) { .bd-bottom{grid-template-columns:1fr} .bd-wp-grid{grid-template-columns:1fr} }
//         @media (max-width:900px)  { .bd-wp-two-col-row{grid-template-columns:1fr} .bd-cards{grid-template-columns:repeat(2,1fr)} .bd-banner-strip{grid-template-columns:repeat(2,1fr)} }
//         @media (max-width:768px)  { .bd-cards{grid-template-columns:repeat(2,1fr);gap:10px} .bd-banner-strip{grid-template-columns:1fr} .bd-bar-label{width:110px;min-width:110px;font-size:11px} .bd-bar-val{width:60px;min-width:60px;font-size:11px} .bd-filter{width:150px} .bd-banner-value{font-size:18px} .bd-card-value{font-size:14px} }
//         @media (max-width:600px)  { .bd-filter-bar{padding:12px 12px 0;gap:12px} .bd-panel{padding:10px} .bd-filter{width:100%} .bd-bottom{gap:10px} .bd-bar-label{width:90px;min-width:90px;font-size:10px} .bd-bar-val{width:52px;min-width:52px;font-size:10px} .bd-chart-box{padding:12px} }
//         @media (max-width:480px)  { .bd-cards{grid-template-columns:1fr} .bd-banner-strip{grid-template-columns:1fr} .bd-banner-value{font-size:16px} }
//     </style>`).appendTo('head');

//     /* ── PALETTE ── */
//     const PALETTE     = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//     const SUB_PALETTE = ['#5b9bd5','#17856a','#c04e22','#6b62c7','#c03d6a','#9a5e0e','#4e7a18','#c93737','#0f4a87','#6b6b68'];

//     /* ── LAYOUT ── */
//     $(page.body).html(`
//         <div class="bd-wrap">
//             <div class="bd-filter-bar">
//                 <div class="bd-filter" id="bd-fy-wrap"></div>
//             </div>

//             <ul id="bd-tab-nav">
//                 <li><a class="bd-tab active" data-tab="dashboard">Budget Dashboard</a></li>
//                 <li><a class="bd-tab" data-tab="workplan">Work Plan Views</a></li>
//             </ul>

//             <div class="bd-panel active" id="bd-panel-dashboard">
//                 <div class="bd-banner-strip">
//                     <div class="bd-banner-card blue">
//                         <div class="bd-banner-label">Overall Grand Total</div>
//                         <div class="bd-banner-value" id="bd-grand-total">—</div>
//                         <div class="bd-banner-sub" id="bd-unit-count">—</div>
//                     </div>
//                     <div class="bd-banner-card green">
//                         <div class="bd-banner-label">CAPEX Total</div>
//                         <div class="bd-banner-value" id="bd-capex-total">—</div>
//                         <div class="bd-banner-sub">Capital Expenses</div>
//                     </div>
//                     <div class="bd-banner-card orange">
//                         <div class="bd-banner-label">OPEX Total</div>
//                         <div class="bd-banner-value" id="bd-opex-total">—</div>
//                         <div class="bd-banner-sub">Operating Expenses</div>
//                     </div>
//                 </div>

//                 <p class="bd-section-title" style="margin-top:4px;">Units</p>
//                 <div class="bd-cards" id="bd-cards"><div class="bd-loading">Loading…</div></div>

//                 <p class="bd-section-title sub" id="bd-sub-title" style="margin-top:16px;">Sub Units</p>
//                 <div class="bd-cards" id="bd-subcards"></div>

//                 <div class="bd-bottom">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget by Unit</p>
//                         <p class="bd-chart-sub">Units and Sub Units ranked by budget</p>
//                         <div id="bd-hbar-body"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget Share</p>
//                         <p class="bd-chart-sub">Units only — percentage distribution</p>
//                         <div style="position:relative;width:100%;height:260px;">
//                             <canvas id="bd-donut"></canvas>
//                             <div class="bd-donut-center">
//                                 <div class="bd-donut-center-val" id="bd-donut-total">—</div>
//                                 <div class="bd-donut-center-lbl">Grand total</div>
//                             </div>
//                         </div>
//                         <div class="bd-legend" id="bd-donut-legend"></div>
//                     </div>
//                 </div>
//             </div>

//             <div class="bd-panel" id="bd-panel-workplan">
//                 <div class="bd-wp-grid">
//                     <div class="bd-chart-box bd-wp-pie-box">
//                         <p class="bd-chart-title">Grants &amp; Donations And Direct Work</p>
//                         <p class="bd-chart-sub">Consolidated budget breakdown</p>
//                         <div style="position:relative;width:100%;height:320px;">
//                             <canvas id="bd-wp-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL BUDGET</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-pie-total">—</div>
//                         </div>
//                     </div>
//                     <div class="bd-wp-summary">
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#1a56db;">
//                             <div class="bd-card-label">Grand Total</div>
//                             <div class="bd-card-value" id="bd-wp-pie-total-card">—</div>
//                             <div class="bd-card-sub">Overall budget</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#378ADD;">
//                             <div class="bd-card-label">Grants &amp; Donations</div>
//                             <div class="bd-card-value" id="bd-wp-grants-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-grants-pct">—</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#F5A623;">
//                             <div class="bd-card-label">Direct Work</div>
//                             <div class="bd-card-value" id="bd-wp-others-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-others-pct">—</div>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="bd-wp-two-col-row">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Direct Work — Unit-wise</p>
//                         <p class="bd-chart-sub">Direct Work budget share per unit</p>
//                         <div class="bd-pie-canvas-wrap" id="bd-unit-pie-wrap">
//                             <canvas id="bd-wp-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL DIRECT WORK</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-unit-pie-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-unit-legend"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Grants &amp; Donations — Unit-wise</p>
//                         <p class="bd-chart-sub">Grants &amp; Donations budget share per unit</p>
//                         <div class="bd-pie-canvas-wrap" id="bd-grants-pie-wrap">
//                             <canvas id="bd-wp-grants-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL GRANTS &amp; DONATIONS</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-grants-unit-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-grants-unit-legend"></div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `);

//     let donutChart           = null;
//     let wpPieChart           = null;
//     let wpUnitPieChart       = null;
//     let wpGrantsUnitPieChart = null;
//     let wpDataLoaded         = false;

//     /* ── TAB SWITCHING ── */
//     $(page.body).on('click', '#bd-tab-nav .bd-tab', function (e) {
//         e.preventDefault();
//         const tab = $(this).data('tab');
//         $('#bd-tab-nav .bd-tab').removeClass('active');
//         $('.bd-panel').removeClass('active');
//         $(this).addClass('active');
//         $('#bd-panel-' + tab).addClass('active');
//         if (tab === 'workplan' && !wpDataLoaded) {
//             const fy = fyControl.get_value();
//             if (fy) loadWorkPlan(fy);
//         }
//     });

//     /* ── FY FILTER ── */
//     const fyControl = frappe.ui.form.make_control({
//         parent: document.getElementById('bd-fy-wrap'),
//         df: {
//             label: 'Financial Year', fieldtype: 'Select',
//             fieldname: 'financial_year', reqd: 1,
//             change() { triggerLoad(); }
//         },
//         render_input: true
//     });
//     fyControl.refresh();
//     $(fyControl.wrapper).find('.frappe-control').css('min-width', '0');

//     function triggerLoad() {
//         const fy = fyControl.get_value();
//         if (!fy) return;
//         wpDataLoaded = false;
//         if (wpPieChart)          { wpPieChart.destroy();          wpPieChart = null; }
//         if (wpUnitPieChart)      { wpUnitPieChart.destroy();      wpUnitPieChart = null; }
//         if (wpGrantsUnitPieChart){ wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         load(fy, 'March');
//         if ($('#bd-tab-nav .bd-tab.active').data('tab') === 'workplan') loadWorkPlan(fy);
//     }

//     /* ── LOAD FY LIST ── */
//     frappe.call({
//         method: 'annual_budget.api.filter_options.get_financial_year_list',
//         callback(r) {
//             if (!r.message?.length) return;
//             const years = r.message.map(d => d.financial_year);
//             fyControl.df.options = years.join('\n');
//             fyControl.refresh();
//             const now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1;
//             const fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             const def = years.includes(fy) ? fy : years[0];
//             fyControl.set_value(def);
//             load(def, 'March');
//         }
//     });

//     /* ── HELPERS ── */
//     const fmtINR = v => '₹' + Math.round(v || 0).toLocaleString('en-IN');
//     const fmtCr  = v => {
//         const abs = Math.abs(v || 0);
//         if (abs >= 1e7) return '₹' + ((v||0)/1e7).toFixed(2) + ' Cr';
//         if (abs >= 1e5) return '₹' + ((v||0)/1e5).toFixed(2) + ' L';
//         if (abs >= 1e3) return '₹' + ((v||0)/1e3).toFixed(2) + ' K';
//         return '₹' + Math.round(v || 0);
//     };

//     /* ════════════════════════════════════════════════════════════
//        setSafePieHeight(canvasId, nSlices)
//        Called BEFORE new Chart() so the canvas has the right size.
//        Uses offsetWidth (reliable even before paint) with a safe
//        fallback of 700 so it never produces 0-height canvases.
//     ════════════════════════════════════════════════════════════ */
//     function setSafePieHeight(canvasId, nSlices) {
//         const canvas = document.getElementById(canvasId);
//         if (!canvas) return 180;
//         const wrap = canvas.parentElement;
//         let totalW = (wrap && wrap.offsetWidth)  ||
//                      (wrap && wrap.clientWidth)  ||
//                      canvas.offsetWidth || 700;
//         totalW = Math.max(totalW, 320);

//         const BLOCK_H = 16 * 4 + 8;
//         const colW    = Math.min(240, Math.max(120, Math.round(totalW * 0.30)));
//         const pieDiam = Math.max(200, totalW - colW * 2 - 32);
//         const finalH  = Math.max(pieDiam + 160, nSlices * BLOCK_H + 160, 500);

//         canvas.style.height = finalH + 'px';
//         if (wrap) wrap.style.height = finalH + 'px';
//         canvas._bdColW = colW;
//         return colW;  // caller uses this for layout.padding
//     }

//     /* ════════════════════════════════════════════════════════════
//        RESPONSIVE LABEL PLUGIN FACTORY
//        - No beforeInit (avoids 0-width race on Windows/lazy tabs)
//        - afterDraw reads colW from canvas._bdColW (set above)
//        - Two-pass spread prevents label overlap
//        - Names word-wrap into up to 2 lines
//     ════════════════════════════════════════════════════════════ */
//     function makeLabelPlugin(pluginId) {

//         const NAME_SZ = 13;
//         const VAL_SZ  = 12;
//         const PCT_SZ  = 11;
//         const LINE_H  = 16;
//         const ROW_GAP = 8;
//         const BLOCK_H = LINE_H * 4 + ROW_GAP;

//         function wrapName(ctx, text, maxW) {
//             ctx.font = `bold ${NAME_SZ}px sans-serif`;
//             if (ctx.measureText(text).width <= maxW) return [text];
//             const words = text.split(' ');
//             let line1 = '', line2 = '';
//             for (const w of words) {
//                 const test = line1 ? line1 + ' ' + w : w;
//                 if (ctx.measureText(test).width <= maxW) { line1 = test; }
//                 else { line2 = line2 ? line2 + ' ' + w : w; }
//             }
//             return line2 ? [line1, line2] : [line1];
//         }

//         function spreadLabels(items, canvasH) {
//             if (!items.length) return;
//             const margin = 8;
//             const topBound = margin;
//             const botBound = canvasH - BLOCK_H - margin;

//             items.sort((a, b) => a.nat - b.nat);

//             // Clamp naturals to canvas bounds first
//             items.forEach(e => { e.nat = Math.min(Math.max(e.nat, topBound), botBound); });

//             items[0].y = items[0].nat;
//             for (let k = 1; k < items.length; k++) {
//                 items[k].y = Math.max(items[k].nat, items[k-1].y + BLOCK_H);
//             }
//             // Pull back up if we've gone past bottom
//             for (let k = items.length - 1; k >= 0; k--) {
//                 if (items[k].y > botBound) items[k].y = botBound;
//                 if (k < items.length - 1 && items[k].y > items[k+1].y - BLOCK_H) {
//                     items[k].y = items[k+1].y - BLOCK_H;
//                 }
//             }
//         }

//         return {
//             id: pluginId,

//             afterDraw(chart) {
//                 const { ctx, data } = chart;
//                 const meta  = chart.getDatasetMeta(0);
//                 const arcs  = meta.data;
//                 const vals  = data.datasets[0].data;
//                 const lbls  = data.labels;
//                 const tot   = vals.reduce((a, b) => a + b, 0);
//                 if (!tot || !arcs.length) return;

//                 const cx      = arcs[0].x;
//                 const cy      = arcs[0].y;
//                 const outerR  = arcs[0].outerRadius;
//                 const colW    = chart.canvas._bdColW || 180;
//                 const canvasW = chart.width;
//                 const canvasH = chart.height;

//                 /*
//                  * RIGHT side: elbow terminates at (cx + outerR + gap),
//                  *   text draws LEFT-aligned starting a few px further right.
//                  * LEFT side:  elbow terminates at (cx - outerR - gap),
//                  *   text draws RIGHT-aligned ending a few px further left.
//                  * The text column is colW wide, so it must not exceed the canvas edge.
//                  * We pick the elbow X so that the text column fits within canvas.
//                  */
//                 const ELBOW_GAP = 18;
//                 const elbowRight = Math.min(cx + outerR + ELBOW_GAP, canvasW - colW - 4);
//                 const elbowLeft  = Math.max(cx - outerR - ELBOW_GAP, colW + 4);
//                 const xTxtRight  = elbowRight + 6;
//                 const xTxtLeft   = elbowLeft  - 6;

//                 ctx.save();

//                 /* 1 ── % text inside large slices */
//                 arcs.forEach((arc, i) => {
//                     if (!vals[i]) return;
//                     const pct = (vals[i] / tot) * 100;
//                     if (pct < 4) return;
//                     const angle = (arc.startAngle + arc.endAngle) / 2;
//                     const xi = cx + Math.cos(angle) * outerR * 0.64;
//                     const yi = cy + Math.sin(angle) * outerR * 0.64;
//                     ctx.save();
//                     ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 4;
//                     ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
//                     ctx.font = `bold ${NAME_SZ}px sans-serif`;
//                     ctx.fillText(pct.toFixed(1) + '%', xi, yi);
//                     ctx.restore();
//                 });

//                 /* 2 ── Build left / right label buckets */
//                 const left = [], right = [];
//                 arcs.forEach((arc, i) => {
//                     if (!vals[i]) return;
//                     const pct   = (vals[i] / tot) * 100;
//                     const angle = (arc.startAngle + arc.endAngle) / 2;
//                     const entry = {
//                         i, angle,
//                         isRight: Math.cos(angle) >= 0,
//                         name:    (lbls[i] || '').trim(),
//                         valTxt:  fmtCr(vals[i]),
//                         pctTxt:  pct.toFixed(1) + '%',
//                         nat:     cy + Math.sin(angle) * outerR * 1.22,
//                         y:       0
//                     };
//                     (entry.isRight ? right : left).push(entry);
//                 });

//                 /* 3 ── Spread labels within canvas bounds */
//                 spreadLabels(left,  canvasH);
//                 spreadLabels(right, canvasH);

//                 /* 4 ── Draw connectors + text */
//                 [...left, ...right].forEach(entry => {
//                     const { angle, isRight, name, valTxt, pctTxt, y } = entry;
//                     const align = isRight ? 'left' : 'right';
//                     const elbowX = isRight ? elbowRight : elbowLeft;
//                     const xTxt   = isRight ? xTxtRight  : xTxtLeft;

//                     const x1 = cx + Math.cos(angle) * (outerR * 1.02);
//                     const y1 = cy + Math.sin(angle) * (outerR * 1.02);
//                     const x2 = cx + Math.cos(angle) * (outerR * 1.16);
//                     const y2 = cy + Math.sin(angle) * (outerR * 1.16);

//                     /* Elbow connector: radial segment → horizontal to elbow point */
//                     ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1.2;
//                     ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(elbowX, y); ctx.stroke();

//                     /* Dot at slice edge */
//                     ctx.beginPath(); ctx.arc(x1, y1, 2.5, 0, Math.PI*2);
//                     ctx.fillStyle = '#bbb'; ctx.fill();

//                     /* Name — wrap to label column width */
//                     const lines = wrapName(ctx, name, colW - 12);
//                     ctx.fillStyle = '#111'; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
//                     ctx.font = `bold ${NAME_SZ}px sans-serif`;
//                     lines.forEach((ln, li) => ctx.fillText(ln, xTxt, y + li * LINE_H));
//                     const afterName = lines.length * LINE_H;

//                     /* Value */
//                     ctx.font = `600 ${VAL_SZ}px sans-serif`; ctx.fillStyle = '#333';
//                     ctx.fillText(valTxt, xTxt, y + afterName);

//                     /* Percentage */
//                     ctx.font = `500 ${PCT_SZ}px sans-serif`; ctx.fillStyle = '#777';
//                     ctx.fillText(pctTxt, xTxt, y + afterName + LINE_H);
//                 });

//                 ctx.restore();
//             }
//         };
//     }

//     /* ── PARSE ── */
//     function parseData(message) {
//         const consolidated = message.find(d => d.settings_doc === 'CONSOLIDATED');

//         const mainUnits = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id||0) - (b.sequence_id||0))
//             .map((u, idx) => {
//                 const gt = (u.actuals||[]).find(a => a.sequence_id === 9999);
//                 return { label:(u.label||'').trim(), ytd:gt?(gt.ytd||0):0,
//                          sequence_id:u.sequence_id||0, color:PALETTE[idx%PALETTE.length] };
//             }).filter(u => u.ytd > 0);

//         const subUnits = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 1)
//             .sort((a, b) => (a.sequence_id||0) - (b.sequence_id||0))
//             .map((u, idx) => {
//                 const gt = (u.actuals||[]).find(a => a.sequence_id === 9999);
//                 return { label:(u.label||'').trim(), ytd:gt?(gt.ytd||0):0,
//                          sequence_id:u.sequence_id||0, color:SUB_PALETTE[idx%SUB_PALETTE.length] };
//             }).filter(u => u.ytd > 0);

//         let overall=0, capex=0, opex=0;
//         if (consolidated) {
//             const ca = consolidated.actuals || [];
//             overall = (ca.find(a=>a.name==='OVERALL GRAND TOTAL')||{}).ytd||0;
//             capex   = (ca.find(a=>a.name==='CAPEX TOTAL')||{}).ytd||0;
//             opex    = (ca.find(a=>a.name==='OPEX TOTAL')||{}).ytd||0;
//         }
//         if (!overall) overall = mainUnits.reduce((s,u)=>s+u.ytd,0);
//         return { mainUnits, subUnits, overall, capex, opex };
//     }

//     /* ── RENDER BANNER ── */
//     function renderBanner(overall, capex, opex, mainUnits, subUnits) {
//         $('#bd-grand-total').text(fmtCr(overall));
//         $('#bd-capex-total').text(fmtCr(capex));
//         $('#bd-opex-total').text(fmtCr(opex));
//         $('#bd-unit-count').text(mainUnits.length + ' units' +
//             (subUnits.length ? ' · ' + subUnits.length + ' sub units' : ''));
//     }

//     /* ── RENDER CARDS ── */
//     function renderCards(mainUnits, subUnits, overall) {
//         const $c = $('#bd-cards').empty();
//         mainUnits.forEach(u => {
//             const pct = overall>0 ? ((u.ytd/overall)*100).toFixed(1) : '0.0';
//             $c.append(`<div class="bd-card" style="border-left-color:${u.color};">
//                 <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                 <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                 <div class="bd-card-sub">${pct}% of total</div></div>`);
//         });
//         const $s = $('#bd-subcards').empty();
//         if (!subUnits.length) { $('#bd-sub-title').hide(); return; }
//         $('#bd-sub-title').show();
//         subUnits.forEach(u => {
//             const pct = overall>0 ? ((u.ytd/overall)*100).toFixed(1) : '0.0';
//             $s.append(`<div class="bd-card" style="border-left-color:${u.color};">
//                 <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                 <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                 <div class="bd-card-sub">${pct}% of total</div></div>`);
//         });
//     }

//     /* ── RENDER BAR ── */
//     function renderHBar(mainUnits, subUnits) {
//         const $body  = $('#bd-hbar-body').empty();
//         const allMax = Math.max(...mainUnits.map(u=>u.ytd), ...subUnits.map(u=>u.ytd), 1);
//         mainUnits.forEach(u => {
//             const pct = ((u.ytd/allMax)*100).toFixed(1);
//             $body.append(`<div class="bd-bar-row">
//                 <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                 <div class="bd-bar-track"><div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div></div>
//                 <div class="bd-bar-val">${fmtCr(u.ytd)}</div></div>`);
//         });
//         if (subUnits.length) {
//             $body.append('<hr class="bd-bar-divider"><div class="bd-bar-section-label">Sub Units</div>');
//             subUnits.forEach(u => {
//                 const pct = ((u.ytd/allMax)*100).toFixed(1);
//                 $body.append(`<div class="bd-bar-row">
//                     <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-bar-track"><div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div></div>
//                     <div class="bd-bar-val">${fmtCr(u.ytd)}</div></div>`);
//             });
//         }
//     }

//     /* ── RENDER DONUT ── */
//     function renderDonut(mainUnits, overall) {
//         const labels = mainUnits.map(u=>u.label);
//         const values = mainUnits.map(u=>Math.round(u.ytd));
//         const colors = mainUnits.map(u=>u.color);
//         $('#bd-donut-total').text(fmtCr(overall));
//         const $leg = $('#bd-donut-legend').empty();
//         mainUnits.forEach((u,i) => {
//             const pct = overall>0 ? ((u.ytd/overall)*100).toFixed(1):'0.0';
//             $leg.append(`<span class="bd-legend-item">
//                 <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                 ${u.label} — ${pct}%</span>`);
//         });
//         if (donutChart) { donutChart.destroy(); donutChart=null; }
//         if (!values.length) return;
//         donutChart = new Chart(document.getElementById('bd-donut'), {
//             type:'doughnut',
//             data:{ labels, datasets:[{ data:values, backgroundColor:colors, borderWidth:2, borderColor:'#fff', hoverOffset:6 }] },
//             options:{
//                 responsive:true, maintainAspectRatio:false, cutout:'68%',
//                 plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>{
//                     const pct=overall>0?((ctx.parsed/overall)*100).toFixed(1):'0.0';
//                     return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                 }}}}
//             }
//         });
//     }

//     /* ── LOAD ── */
//     function load(fy, month) {
//         Loader.show('Loading dashboard…');
//         $('#bd-grand-total,#bd-capex-total,#bd-opex-total,#bd-donut-total').text('—');
//         $('#bd-unit-count').text('—');
//         $('#bd-cards').empty(); $('#bd-hbar-body').empty();
//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: { financial_year:fy, month:month, table_name_filter:'Number Card' },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) { $('#bd-cards').html('<div>No data returned.</div>'); return; }
//                 const { mainUnits, subUnits, overall, capex, opex } = parseData(r.message);
//                 renderBanner(overall, capex, opex, mainUnits, subUnits);
//                 renderCards(mainUnits, subUnits, overall);
//                 renderHBar(mainUnits, subUnits);
//                 renderDonut(mainUnits, overall);
//             },
//             error() { Loader.hide(); frappe.msgprint('Failed to load data.'); }
//         });
//     }

//     /* ── WORK PLAN: LOAD ── */
//     function loadWorkPlan(fy) {
//         Loader.show('Loading Work Plan data…');
//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: { financial_year:fy, month:'March', table_name_filter:'Pie Chart' },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) { frappe.msgprint('No Work Plan data returned.'); return; }
//                 const consolidated = r.message.find(d => d.settings_doc==='CONSOLIDATED');
//                 if (!consolidated)   { frappe.msgprint('Consolidated data not found.'); return; }
//                 renderWpPie(consolidated);
//                 renderWpUnitPie(r.message);
//                 renderWpGrantsUnitPie(r.message);
//                 wpDataLoaded = true;
//             },
//             error() { Loader.hide(); frappe.msgprint('Failed to load Work Plan data.'); }
//         });
//     }

//     /* ── WORK PLAN: GRANTS vs DIRECT WORK PIE ── */
//     function renderWpPie(consolidated) {
//         const actuals = consolidated.actuals || [];
//         let grantsYtd=0, othersYtd=0;
//         const GN = 'Grants & Donations';
//         actuals.forEach(a => {
//             if (a.sequence_id===9999||a.name==='CAPEX TOTAL'||a.name==='OPEX TOTAL'||a.name==='OVERALL GRAND TOTAL') return;
//             (a.items||[]).forEach(it => { if(it.name===GN) grantsYtd+=(it.ytd||0); else othersYtd+=(it.ytd||0); });
//             (a.sub_heads||[]).forEach(sh => (sh.items||[]).forEach(it => { if(it.name===GN) grantsYtd+=(it.ytd||0); else othersYtd+=(it.ytd||0); }));
//         });
//         const total=grantsYtd+othersYtd;
//         const gPct=total>0?((grantsYtd/total)*100).toFixed(1):'0.0';
//         const oPct=total>0?((othersYtd/total)*100).toFixed(1):'0.0';
//         $('#bd-wp-pie-total').text(fmtCr(total));
//         $('#bd-wp-pie-total-card').text(fmtINR(total));
//         $('#bd-wp-grants-val').text(fmtINR(grantsYtd));  $('#bd-wp-grants-pct').text(gPct+'% of total');
//         $('#bd-wp-others-val').text(fmtINR(othersYtd));  $('#bd-wp-others-pct').text(oPct+'% of total');
//         if (wpPieChart) { wpPieChart.destroy(); wpPieChart=null; }
//         wpPieChart = new Chart(document.getElementById('bd-wp-pie'), {
//             type:'pie',
//             data:{ labels:['Grants & Donations','Direct Work'],
//                 datasets:[{ data:[Math.round(grantsYtd),Math.round(othersYtd)],
//                     backgroundColor:['#378ADD','#F5A623'], borderWidth:3, borderColor:'#fff', hoverOffset:6 }] },
//             options:{ responsive:true, maintainAspectRatio:false,
//                 plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>{
//                     const pct=total>0?((ctx.parsed/total)*100).toFixed(1):'0.0';
//                     return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                 }}}}
//             },
//             plugins:[{ id:'sliceLabels', afterDraw(chart){
//                 const {ctx,data}=chart; const ds=chart.getDatasetMeta(0).data;
//                 const vals=data.datasets[0].data;
//                 ctx.save();
//                 ds.forEach((arc,i)=>{
//                     const angle=(arc.startAngle+arc.endAngle)/2;
//                     const x=arc.x+Math.cos(angle)*arc.outerRadius*0.65;
//                     const y=arc.y+Math.sin(angle)*arc.outerRadius*0.65;
//                     ctx.fillStyle='#fff'; ctx.font='bold 14px sans-serif';
//                     ctx.textAlign='center'; ctx.textBaseline='middle';
//                     ctx.fillText(fmtCr(vals[i]),x,y);
//                 });
//                 ctx.restore();
//             }}]
//         });
//     }

//     /* ── WORK PLAN: DIRECT WORK UNIT PIE ── */
//     function renderWpUnitPie(message) {
//         const PALETTE_WP = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GN = 'Grants & Donations';
//         function getDirectWork(u) {
//             const gt=(u.actuals||[]).find(a=>a.sequence_id===9999);
//             const grand=gt?(gt.ytd||0):0;
//             let grants=0;
//             (u.actuals||[]).forEach(a=>{ if(a.sequence_id===9999) return;
//                 (a.items||[]).forEach(it=>{ if(it.name===GN) grants+=(it.ytd||0); });
//                 (a.sub_heads||[]).forEach(sh=>(sh.items||[]).forEach(it=>{ if(it.name===GN) grants+=(it.ytd||0); })); });
//             return grand-grants;
//         }
//         const units=message.filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===0)
//             .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0));
//         const labels=[],values=[],colors=[]; let ci=0;
//         units.forEach(u=>{ const dw=getDirectWork(u); if(dw<=0) return;
//             labels.push((u.label||'').trim()); values.push(Math.round(dw)); colors.push(PALETTE_WP[ci++%PALETTE_WP.length]); });
//         const total=values.reduce((s,v)=>s+v,0);
//         $('#bd-wp-unit-pie-total').text(fmtCr(total));
//         const $leg=$('#bd-wp-unit-legend').empty();
//         labels.forEach((lbl,i)=>{ const pct=total>0?((values[i]/total)*100).toFixed(1):'0.0';
//             $leg.append(`<span class="bd-legend-item"><span class="bd-legend-dot" style="background:${colors[i]};"></span>${lbl} — ${pct}%</span>`); });
//         if (wpUnitPieChart) { wpUnitPieChart.destroy(); wpUnitPieChart=null; }
//         if (!values.length) return;
//         const colWUnit = setSafePieHeight('bd-wp-unit-pie', values.length);
//         wpUnitPieChart = new Chart(document.getElementById('bd-wp-unit-pie'), {
//             type:'pie',
//             data:{ labels, datasets:[{ data:values, backgroundColor:colors, borderWidth:3, borderColor:'#fff', hoverOffset:6 }] },
//             options:{ responsive:true, maintainAspectRatio:false,
//                 layout:{ padding:{ left: colWUnit, right: colWUnit, top: 40, bottom: 40 } },
//                 plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>{
//                     const pct=total>0?((ctx.parsed/total)*100).toFixed(1):'0.0';
//                     return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                 }}}}
//             },
//             plugins:[ makeLabelPlugin('unitSliceLabels') ]
//         });
//     }

//     /* ── WORK PLAN: GRANTS UNIT PIE ── */
//     function renderWpGrantsUnitPie(message) {
//         const PALETTE_WP = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GN = 'Grants & Donations';
//         function getGrantsAmt(u) {
//             let amt=0;
//             (u.actuals||[]).forEach(a=>{ if(a.sequence_id===9999) return;
//                 (a.items||[]).forEach(it=>{ if(it.name===GN) amt+=(it.ytd||0); });
//                 (a.sub_heads||[]).forEach(sh=>(sh.items||[]).forEach(it=>{ if(it.name===GN) amt+=(it.ytd||0); })); });
//             return amt;
//         }
//         const units=message.filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===0)
//             .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0));
//         const labels=[],values=[],colors=[]; let ci=0;
//         units.forEach(u=>{ const g=getGrantsAmt(u); if(g<=0) return;
//             labels.push((u.label||'').trim()); values.push(Math.round(g)); colors.push(PALETTE_WP[ci++%PALETTE_WP.length]); });
//         const total=values.reduce((s,v)=>s+v,0);
//         $('#bd-wp-grants-unit-total').text(fmtCr(total));
//         const $leg=$('#bd-wp-grants-unit-legend').empty();
//         labels.forEach((lbl,i)=>{ const pct=total>0?((values[i]/total)*100).toFixed(1):'0.0';
//             $leg.append(`<span class="bd-legend-item"><span class="bd-legend-dot" style="background:${colors[i]};"></span>${lbl} — ${pct}%</span>`); });
//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart=null; }
//         if (!values.length) return;
//         const colWGrants = setSafePieHeight('bd-wp-grants-unit-pie', values.length);
//         wpGrantsUnitPieChart = new Chart(document.getElementById('bd-wp-grants-unit-pie'), {
//             type:'pie',
//             data:{ labels, datasets:[{ data:values, backgroundColor:colors, borderWidth:3, borderColor:'#fff', hoverOffset:6 }] },
//             options:{ responsive:true, maintainAspectRatio:false,
//                 layout:{ padding:{ left: colWGrants, right: colWGrants, top: 40, bottom: 40 } },
//                 plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>{
//                     const pct=total>0?((ctx.parsed/total)*100).toFixed(1):'0.0';
//                     return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                 }}}}
//             },
//             plugins:[ makeLabelPlugin('grantsSliceLabels') ]
//         });
//     }

//     /* ── RESIZE — re-render work plan charts so heights recalculate ── */
//     let resizeTimer;
//     $(window).on('resize.bd', function () {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(() => {
//             if (donutChart) donutChart.resize();
//             if (wpPieChart) wpPieChart.resize();
//             if (wpDataLoaded) {
//                 wpDataLoaded = false;
//                 if (wpUnitPieChart)       { wpUnitPieChart.destroy();       wpUnitPieChart=null; }
//                 if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart=null; }
//                 /* Reset wrapper heights so offsetWidth is re-read correctly */
//                 ['bd-unit-pie-wrap','bd-grants-pie-wrap'].forEach(id => {
//                     const el = document.getElementById(id);
//                     if (el) el.style.height = '';
//                 });
//                 const fy = fyControl.get_value();
//                 if (fy && $('#bd-tab-nav .bd-tab.active').data('tab')==='workplan') loadWorkPlan(fy);
//             }
//         }, 300);
//     });
//     $(wrapper).on('hide', function () { $(window).off('resize.bd'); });

//     /* ── CHART.JS ── */
//     if (!window.Chart) {
//         const s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         document.head.appendChild(s);
//     }

//     /* ── GLOBAL LOADER ── */
//     if (!$('#global-loader').length) {
//         $('body').append(
//             '<div id="global-loader" class="loader-overlay">' +
//             '<div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt="">' +
//             '<div class="loader-text">Loading, please wait</div></div></div>'
//         );
//     }
//     $('#global-loader').hide();

//     var Loader = {
//         show(msg) {
//             var $l = $('#global-loader');
//             $l.find('.loader-text').text(msg || 'Loading, please wait');
//             $l.css('display','flex').hide().fadeIn(200);
//         },
//         hide() { $('#global-loader').fadeOut(200); }
//     };
// };



frappe.pages['consolidate-report'].on_page_load = function (wrapper) {

    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Budget Dashboard',
        single_column: true
    });

    /* ── STYLES ── */
    $(`<style>
        .bd-wrap { padding: 0; box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: hidden; }

        .bd-filter-bar { display: flex; align-items: flex-end; gap: 20px; padding: 16px 20px 0; flex-wrap: wrap; }
        .bd-filter { width: 200px; }

        #bd-tab-nav { list-style: none; margin: 18px 0 0; padding: 0 20px; display: flex; flex-wrap: wrap; gap: 0; border-bottom: 2px solid #d1d5db; }
        #bd-tab-nav li { margin: 0; padding: 0; }
        #bd-tab-nav .bd-tab { display: block; font-size: 13px; font-weight: 400; color: #6b7280; padding: 10px 16px 11px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; white-space: nowrap; text-decoration: none; transition: color .15s, border-color .15s; user-select: none; }
        #bd-tab-nav .bd-tab:hover { color: #111; }
        #bd-tab-nav .bd-tab.active { color: #111827; font-weight: 700; border-bottom-color: #111827; }

        .bd-panel { display: none; padding: 16px 20px; max-width: 100%; overflow-x: hidden; }
        .bd-panel.active { display: block; }

        .bd-banner-strip { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
        .bd-banner-card { background: #fff; border: 1px solid #e8edf3; border-radius: 12px; padding: 14px 16px; border-left: 4px solid #378ADD; min-width: 0; transition: box-shadow .2s; }
        .bd-banner-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
        .bd-banner-card.blue   { border-left-color: #1a56db; }
        .bd-banner-card.green  { border-left-color: #0e9f6e; }
        .bd-banner-card.orange { border-left-color: #ff5a1f; }
        .bd-banner-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #888; margin-bottom: 5px; }
        .bd-banner-value { font-size: 22px; font-weight: 700; color: #111; line-height: 1.2; }
        .bd-banner-sub   { font-size: 11px; color: #aaa; margin-top: 3px; }

        .bd-section-title { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #374151; margin: 0 0 12px; }
        .bd-section-title::before { content:''; display:inline-block; width:3px; height:14px; border-radius:2px; background:#378ADD; flex-shrink:0; }
        .bd-section-title.sub::before { background:#7F77DD; }
        .bd-section-title::after { content:''; flex:1; height:1px; background:#e8edf3; }

        .bd-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 10px; }
        .bd-card { background: #fff; border: 1px solid #e8edf3; border-radius: 12px; padding: 14px 16px; border-left: 4px solid #378ADD; min-width: 0; transition: box-shadow .2s; }
        .bd-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
        .bd-card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #888; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bd-card-value { font-size: 15px; font-weight: 700; color: #111; line-height: 1.3; word-break: break-all; overflow-wrap: anywhere; }
        .bd-card-sub { font-size: 11px; color: #aaa; margin-top: 3px; }

        .bd-bottom { display: grid; grid-template-columns: 1fr minmax(0,400px); gap: 14px; align-items: start; margin-top: 16px; }
        .bd-chart-box { background: #fff; border: 1px solid #e8edf3; border-radius: 12px; padding: 16px 18px; min-width: 0; }
        .bd-chart-title { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
        .bd-chart-sub   { font-size: 12px; color: #aaa; margin: 0 0 14px; }

        .bd-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
        .bd-bar-label { font-size: 13px; font-weight: 600; color: #222; width: 170px; min-width: 170px; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bd-bar-track { flex: 1; height: 22px; background: #f0f2f5; border-radius: 5px; overflow: hidden; }
        .bd-bar-fill  { height: 100%; border-radius: 5px; transition: width .5s ease; }
        .bd-bar-val   { font-size: 12px; font-weight: 700; color: #222; width: 72px; min-width: 72px; white-space: nowrap; }
        .bd-bar-divider { border: none; border-top: 1px dashed #e0e4ea; margin: 6px 0 10px; }
        .bd-bar-section-label { font-size: 10px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }

        .bd-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .bd-legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #555; }
        .bd-legend-dot  { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }

        .bd-donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; pointer-events: none; }
        .bd-donut-center-val { font-size: 19px; font-weight: 700; color: #111; line-height: 1.1; }
        .bd-donut-center-lbl { font-size: 10px; color: #888; margin-top: 2px; }

        .bd-wp-grid { display: grid; grid-template-columns: 1fr minmax(0,280px); gap: 16px; align-items: start; }
        .bd-wp-pie-box { min-width: 0; }
        .bd-wp-pie-total-box { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #f0f2f5; }
        .bd-wp-pie-total-label { font-size: 10px; font-weight: 700; letter-spacing: .8px; color: #aaa; text-transform: uppercase; margin-bottom: 4px; }
        .bd-wp-pie-total-val   { font-size: 26px; font-weight: 700; color: #111; line-height: 1.1; }
        .bd-wp-summary { display: flex; flex-direction: column; gap: 12px; }
        .bd-wp-stat-card { cursor: default; }
        .bd-wp-two-col-row { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; margin-top: 16px; }

        #global-loader.loader-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(18,18,18,.92); backdrop-filter: blur(6px); display: none; z-index: 999999; align-items: center; justify-content: center; }
        .loader-box { display:flex; flex-direction:column; align-items:center; gap:14px; }
        .loader-logo { width:90px; height:90px; border-radius:50%; background:linear-gradient(145deg,#fff,#eaeaea); padding:14px; object-fit:contain; box-shadow:0 10px 30px rgba(0,0,0,.35); animation:lp 1.6s infinite ease-in-out; }
        .loader-text { font-size:13px; color:#fff; font-weight:600; letter-spacing:.5px; opacity:.85; }
        .loader-text::after { content:""; display:inline-block; width:1em; animation:ld 1.5s infinite; }
        @keyframes lp { 0%,100%{transform:scale(1);opacity:.8} 50%{transform:scale(1.08);opacity:1} }
        @keyframes ld { 0%{content:""} 33%{content:"."} 66%{content:".."} 100%{content:"..."} }

        .bd-wrap,.bd-panel,.bd-filter-bar { max-width:100%; overflow-x:hidden; }
        .bd-chart-box,.bd-card,.bd-banner-card { min-width:0; word-break:break-word; }

        @media (min-width:1400px) { .bd-banner-value{font-size:26px} .bd-bottom{grid-template-columns:1fr 440px} }
        @media (max-width:1200px) { .bd-bottom{grid-template-columns:1fr 360px} .bd-cards{grid-template-columns:repeat(3,1fr)} }
        @media (max-width:1024px) { .bd-bottom{grid-template-columns:1fr} .bd-wp-grid{grid-template-columns:1fr} }
        @media (max-width:900px)  { .bd-wp-two-col-row{grid-template-columns:1fr} .bd-cards{grid-template-columns:repeat(2,1fr)} .bd-banner-strip{grid-template-columns:repeat(2,1fr)} }
        @media (max-width:768px)  { .bd-cards{grid-template-columns:repeat(2,1fr);gap:10px} .bd-banner-strip{grid-template-columns:1fr} .bd-bar-label{width:110px;min-width:110px;font-size:11px} .bd-bar-val{width:60px;min-width:60px;font-size:11px} .bd-filter{width:150px} .bd-banner-value{font-size:18px} .bd-card-value{font-size:13px} }
        @media (max-width:600px)  { .bd-filter-bar{padding:12px 12px 0;gap:12px} .bd-panel{padding:10px} .bd-filter{width:100%} .bd-bottom{gap:10px} .bd-bar-label{width:90px;min-width:90px;font-size:10px} .bd-bar-val{width:52px;min-width:52px;font-size:10px} .bd-chart-box{padding:12px} }
        @media (max-width:480px)  { .bd-cards{grid-template-columns:1fr} .bd-banner-strip{grid-template-columns:1fr} .bd-banner-value{font-size:16px} }
    </style>`).appendTo('head');

    const PALETTE     = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
    const SUB_PALETTE = ['#5b9bd5','#17856a','#c04e22','#6b62c7','#c03d6a','#9a5e0e','#4e7a18','#c93737','#0f4a87','#6b6b68'];

    $(page.body).html(`
        <div class="bd-wrap">
            <div class="bd-filter-bar"><div class="bd-filter" id="bd-fy-wrap"></div></div>

            <ul id="bd-tab-nav">
                <li><a class="bd-tab active" data-tab="dashboard">Budget Dashboard</a></li>
                <li><a class="bd-tab" data-tab="workplan">Work Plan Views</a></li>
            </ul>

            <div class="bd-panel active" id="bd-panel-dashboard">
                <div class="bd-banner-strip">
                    <div class="bd-banner-card blue">
                        <div class="bd-banner-label">Overall Grand Total</div>
                        <div class="bd-banner-value" id="bd-grand-total">—</div>
                        <div class="bd-banner-sub" id="bd-unit-count">—</div>
                    </div>
                    <div class="bd-banner-card green">
                        <div class="bd-banner-label">CAPEX Total</div>
                        <div class="bd-banner-value" id="bd-capex-total">—</div>
                        <div class="bd-banner-sub">Capital Expenses</div>
                    </div>
                    <div class="bd-banner-card orange">
                        <div class="bd-banner-label">OPEX Total</div>
                        <div class="bd-banner-value" id="bd-opex-total">—</div>
                        <div class="bd-banner-sub">Operating Expenses</div>
                    </div>
                </div>
                <p class="bd-section-title" style="margin-top:4px;">Units</p>
                <div class="bd-cards" id="bd-cards"><div class="bd-loading">Loading…</div></div>
                <p class="bd-section-title sub" id="bd-sub-title" style="margin-top:16px;">Sub Units</p>
                <div class="bd-cards" id="bd-subcards"></div>
                <div class="bd-bottom">
                    <div class="bd-chart-box">
                        <p class="bd-chart-title">Budget by Unit</p>
                        <p class="bd-chart-sub">Units and Sub Units ranked by budget</p>
                        <div id="bd-hbar-body"></div>
                    </div>
                    <div class="bd-chart-box">
                        <p class="bd-chart-title">Budget Share</p>
                        <p class="bd-chart-sub">Units only — percentage distribution</p>
                        <div style="position:relative;width:100%;height:260px;">
                            <canvas id="bd-donut"></canvas>
                            <div class="bd-donut-center">
                                <div class="bd-donut-center-val" id="bd-donut-total">—</div>
                                <div class="bd-donut-center-lbl">Grand total</div>
                            </div>
                        </div>
                        <div class="bd-legend" id="bd-donut-legend"></div>
                    </div>
                </div>
            </div>

            <div class="bd-panel" id="bd-panel-workplan">
                <div class="bd-wp-grid">
                    <div class="bd-chart-box bd-wp-pie-box">
                        <p class="bd-chart-title">Direct Work &amp; Grants</p>
                        <p class="bd-chart-sub">Consolidated budget breakdown</p>
                        <div style="position:relative;width:100%;height:400px;">
                            <canvas id="bd-wp-pie"></canvas>
                        </div>
                    </div>
                    <div class="bd-wp-summary">
                        <div class="bd-card bd-wp-stat-card" style="border-left-color:#1a56db;">
                            <div class="bd-card-label">Grand Total</div>
                            <div class="bd-card-value" id="bd-wp-pie-total-card">—</div>
                            <div class="bd-card-sub">Overall budget</div>
                        </div>
                        <div class="bd-card bd-wp-stat-card" style="border-left-color:#F5A623;">
                            <div class="bd-card-label">Direct Work</div>
                            <div class="bd-card-value" id="bd-wp-others-val">—</div>
                            <div class="bd-card-sub" id="bd-wp-others-pct">—</div>
                        </div>
                        <div class="bd-card bd-wp-stat-card" style="border-left-color:#378ADD;">
                            <div class="bd-card-label">Grants</div>
                            <div class="bd-card-value" id="bd-wp-grants-val">—</div>
                            <div class="bd-card-sub" id="bd-wp-grants-pct">—</div>
                        </div>
                    </div>
                </div>
                <div class="bd-wp-two-col-row">
                    <div class="bd-chart-box" id="bd-unit-pie-card">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
                            <p class="bd-chart-title" style="margin:0;">Direct Work — Unit-wise</p>
                            <button onclick="bdSaveCard('bd-unit-pie-card','direct-work-unitwise')" title="Save as PNG"
                                style="background:none;border:none;cursor:pointer;padding:4px 6px;border-radius:6px;color:#aaa;font-size:16px;line-height:1;transition:color .15s"
                                onmouseenter="this.style.color='#378ADD'" onmouseleave="this.style.color='#aaa'">⬇</button>
                        </div>
                        <p class="bd-chart-sub">Direct Work budget share per unit</p>
                        <div id="bd-unit-pie-wrap"></div>
                        <div class="bd-legend" id="bd-wp-unit-legend"></div>
                    </div>
                    <div class="bd-chart-box" id="bd-grants-pie-card">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
                            <p class="bd-chart-title" style="margin:0;">Grants — Unit-wise</p>
                            <button onclick="bdSaveCard('bd-grants-pie-card','grants-unitwise')" title="Save as PNG"
                                style="background:none;border:none;cursor:pointer;padding:4px 6px;border-radius:6px;color:#aaa;font-size:16px;line-height:1;transition:color .15s"
                                onmouseenter="this.style.color='#378ADD'" onmouseleave="this.style.color='#aaa'">⬇</button>
                        </div>
                        <p class="bd-chart-sub">Grants budget share per unit</p>
                        <div id="bd-grants-pie-wrap"></div>
                        <div class="bd-legend" id="bd-wp-grants-unit-legend"></div>
                    </div>
                </div>
            </div>
        </div>
    `);

    let donutChart   = null;
    let wpPieChart   = null;
    let wpDataLoaded = false;

    $(page.body).on('click', '#bd-tab-nav .bd-tab', function (e) {
        e.preventDefault();
        const tab = $(this).data('tab');
        $('#bd-tab-nav .bd-tab').removeClass('active');
        $('.bd-panel').removeClass('active');
        $(this).addClass('active');
        $('#bd-panel-' + tab).addClass('active');
        if (tab === 'workplan' && !wpDataLoaded) {
            const fy = fyControl.get_value();
            if (fy) loadWorkPlan(fy);
        }
    });

    const fyControl = frappe.ui.form.make_control({
        parent: document.getElementById('bd-fy-wrap'),
        df: { label:'Financial Year', fieldtype:'Select', fieldname:'financial_year', reqd:1,
              change() { triggerLoad(); } },
        render_input: true
    });
    fyControl.refresh();
    $(fyControl.wrapper).find('.frappe-control').css('min-width','0');

    function triggerLoad() {
        const fy = fyControl.get_value();
        if (!fy) return;
        wpDataLoaded = false;
        if (wpPieChart) { wpPieChart.destroy(); wpPieChart=null; }
        load(fy, 'March');
        if ($('#bd-tab-nav .bd-tab.active').data('tab')==='workplan') loadWorkPlan(fy);
    }

    frappe.call({
        method: 'annual_budget.api.filter_options.get_financial_year_list',
        callback(r) {
            if (!r.message?.length) return;
            const years = r.message.map(d => d.financial_year);
            fyControl.df.options = years.join('\n');
            fyControl.refresh();
            const now=new Date(), y=now.getFullYear(), m=now.getMonth()+1;
            const fy=m>=4?`${y}-${String(y+1).slice(-2)}`:`${y-1}-${String(y).slice(-2)}`;
            const def=years.includes(fy)?fy:years[0];
            fyControl.set_value(def);
            load(def,'March');
        }
    });

    /* ── HELPERS ── */
    const fmtINR = v => '₹' + Math.round(v||0).toLocaleString('en-IN');

    /* Round to whole numbers — no .00 decimals */
    const fmtCr = v => {
        const abs = Math.abs(v||0);
        if (abs >= 1e7) return '₹' + Math.round((v||0)/1e7) + ' Cr';
        if (abs >= 1e5) return '₹' + Math.round((v||0)/1e5) + ' L';
        if (abs >= 1e3) return '₹' + Math.round((v||0)/1e3) + ' K';
        return '₹' + Math.round(v||0);
    };

    function parseData(message) {
        const consolidated = message.find(d=>d.settings_doc==='CONSOLIDATED');
        const mainUnits = message
            .filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===0)
            .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0))
            .map((u,idx)=>{
                const gt=(u.actuals||[]).find(a=>a.sequence_id===9999);
                return {label:(u.label||'').trim(),ytd:gt?(gt.ytd||0):0,
                        sequence_id:u.sequence_id||0,color:PALETTE[idx%PALETTE.length]};
            }).filter(u=>u.ytd>0);
        const subUnits = message
            .filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===1)
            .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0))
            .map((u,idx)=>{
                const gt=(u.actuals||[]).find(a=>a.sequence_id===9999);
                return {label:(u.label||'').trim(),ytd:gt?(gt.ytd||0):0,
                        sequence_id:u.sequence_id||0,color:SUB_PALETTE[idx%SUB_PALETTE.length]};
            }).filter(u=>u.ytd>0);
        let overall=0,capex=0,opex=0;
        if (consolidated) {
            const ca=consolidated.actuals||[];
            overall=(ca.find(a=>a.name==='OVERALL GRAND TOTAL')||{}).ytd||0;
            capex  =(ca.find(a=>a.name==='CAPEX TOTAL')||{}).ytd||0;
            opex   =(ca.find(a=>a.name==='OPEX TOTAL')||{}).ytd||0;
        }
        if (!overall) overall=mainUnits.reduce((s,u)=>s+u.ytd,0);
        return {mainUnits,subUnits,overall,capex,opex};
    }

    function renderBanner(overall,capex,opex,mainUnits,subUnits){
        $('#bd-grand-total').text(fmtCr(overall));
        $('#bd-capex-total').text(fmtCr(capex));
        $('#bd-opex-total').text(fmtCr(opex));
        $('#bd-unit-count').text(mainUnits.length+' units'+(subUnits.length?' · '+subUnits.length+' sub units':''));
    }

    function renderCards(mainUnits,subUnits,overall){
        const $c=$('#bd-cards').empty();
        mainUnits.forEach(u=>{
            const pct=overall>0?((u.ytd/overall)*100).toFixed(1):'0.0';
            $c.append(`<div class="bd-card" style="border-left-color:${u.color};">
                <div class="bd-card-label" title="${u.label}">${u.label}</div>
                <div class="bd-card-value">${fmtINR(u.ytd)}</div>
                <div class="bd-card-sub">${pct}% of total</div></div>`);
        });
        const $s=$('#bd-subcards').empty();
        if(!subUnits.length){$('#bd-sub-title').hide();return;}
        $('#bd-sub-title').show();
        subUnits.forEach(u=>{
            const pct=overall>0?((u.ytd/overall)*100).toFixed(1):'0.0';
            $s.append(`<div class="bd-card" style="border-left-color:${u.color};">
                <div class="bd-card-label" title="${u.label}">${u.label}</div>
                <div class="bd-card-value">${fmtINR(u.ytd)}</div>
                <div class="bd-card-sub">${pct}% of total</div></div>`);
        });
    }

    function renderHBar(mainUnits,subUnits){
        const $body=$('#bd-hbar-body').empty();
        const allMax=Math.max(...mainUnits.map(u=>u.ytd),...subUnits.map(u=>u.ytd),1);
        mainUnits.forEach(u=>{
            const pct=((u.ytd/allMax)*100).toFixed(1);
            $body.append(`<div class="bd-bar-row">
                <div class="bd-bar-label" title="${u.label}">${u.label}</div>
                <div class="bd-bar-track"><div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div></div>
                <div class="bd-bar-val">${fmtCr(u.ytd)}</div></div>`);
        });
        if(subUnits.length){
            $body.append('<hr class="bd-bar-divider"><div class="bd-bar-section-label">Sub Units</div>');
            subUnits.forEach(u=>{
                const pct=((u.ytd/allMax)*100).toFixed(1);
                $body.append(`<div class="bd-bar-row">
                    <div class="bd-bar-label" title="${u.label}">${u.label}</div>
                    <div class="bd-bar-track"><div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div></div>
                    <div class="bd-bar-val">${fmtCr(u.ytd)}</div></div>`);
            });
        }
    }

    function renderDonut(mainUnits,overall){
        const labels=mainUnits.map(u=>u.label);
        const values=mainUnits.map(u=>Math.round(u.ytd));
        const colors=mainUnits.map(u=>u.color);
        $('#bd-donut-total').text(fmtCr(overall));
        const $leg=$('#bd-donut-legend').empty();
        mainUnits.forEach((u,i)=>{
            const pct=overall>0?((u.ytd/overall)*100).toFixed(1):'0.0';
            $leg.append(`<span class="bd-legend-item"><span class="bd-legend-dot" style="background:${colors[i]};"></span>${u.label} — ${pct}%</span>`);
        });
        if(donutChart){donutChart.destroy();donutChart=null;}
        if(!values.length)return;
        donutChart=new Chart(document.getElementById('bd-donut'),{
            type:'doughnut',
            data:{labels,datasets:[{data:values,backgroundColor:colors,borderWidth:2,borderColor:'#fff',hoverOffset:6}]},
            options:{responsive:true,maintainAspectRatio:false,cutout:'68%',
                plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{
                    const pct=overall>0?((ctx.parsed/overall)*100).toFixed(1):'0.0';
                    return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
                }}}}}
        });
    }

    function load(fy,month){
        Loader.show('Loading dashboard…');
        $('#bd-grand-total,#bd-capex-total,#bd-opex-total,#bd-donut-total').text('—');
        $('#bd-unit-count').text('—');
        $('#bd-cards').empty();$('#bd-hbar-body').empty();
        frappe.call({
            method:'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
            // args:{financial_year:fy,month:month,table_name_filter:'Unit Wise Plan'},
            args:{financial_year:fy,month:month,table_name_filter:'Number Card'},

            callback(r){
                Loader.hide();
                if(!r.message?.length){$('#bd-cards').html('<div>No data returned.</div>');return;}
                const{mainUnits,subUnits,overall,capex,opex}=parseData(r.message);
                renderBanner(overall,capex,opex,mainUnits,subUnits);
                renderCards(mainUnits,subUnits,overall);
                renderHBar(mainUnits,subUnits);
                renderDonut(mainUnits,overall);
            },
            error(){Loader.hide();frappe.msgprint('Failed to load data.');}
        });
    }

    function loadWorkPlan(fy){
        Loader.show('Loading Work Plan data…');
        frappe.call({
            method:'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
            // args:{financial_year:fy,month:'March',table_name_filter:'Unit Wise Plan'},
            args:{financial_year:fy,month:'March',table_name_filter:'Pie Chart'},
            callback(r){
                Loader.hide();
                if(!r.message?.length){frappe.msgprint('No Work Plan data returned.');return;}
                const consolidated=r.message.find(d=>d.settings_doc==='CONSOLIDATED');
                if(!consolidated){frappe.msgprint('Consolidated data not found.');return;}
                renderWpPie(consolidated);
                renderWpUnitPie(r.message);
                renderWpGrantsUnitPie(r.message);
                wpDataLoaded=true;
            },
            error(){Loader.hide();frappe.msgprint('Failed to load Work Plan data.');}
        });
    }

    /* ── MAIN 2-SLICE PIE: Direct Work & Grants ──
       Shows name + rounded value + % inside each slice */
    function renderWpPie(consolidated){
        const actuals=consolidated.actuals||[];
        let grantsYtd=0,othersYtd=0;
        /* Use the actual API line item name for data lookup */
        const GN='Grants & Donations';
        actuals.forEach(a=>{
            if(a.sequence_id===9999||a.name==='CAPEX TOTAL'||a.name==='OPEX TOTAL'||a.name==='OVERALL GRAND TOTAL')return;
            (a.items||[]).forEach(it=>{if(it.name===GN)grantsYtd+=(it.ytd||0);else othersYtd+=(it.ytd||0);});
            (a.sub_heads||[]).forEach(sh=>(sh.items||[]).forEach(it=>{if(it.name===GN)grantsYtd+=(it.ytd||0);else othersYtd+=(it.ytd||0);}));
        });
        const total=grantsYtd+othersYtd;
        const gPct=total>0?((grantsYtd/total)*100).toFixed(1):'0.0';
        const oPct=total>0?((othersYtd/total)*100).toFixed(1):'0.0';
        $('#bd-wp-pie-total-card').text(fmtINR(total));
        $('#bd-wp-grants-val').text(fmtINR(grantsYtd));  $('#bd-wp-grants-pct').text(gPct+'% of total');
        $('#bd-wp-others-val').text(fmtINR(othersYtd));  $('#bd-wp-others-pct').text(oPct+'% of total');
        if(wpPieChart){wpPieChart.destroy();wpPieChart=null;}
        wpPieChart=new Chart(document.getElementById('bd-wp-pie'),{
            type:'pie',
            data:{
                labels:['Direct Work','Grants'],
                datasets:[{data:[Math.round(othersYtd),Math.round(grantsYtd)],
                    backgroundColor:['#F5A623','#378ADD'],borderWidth:3,borderColor:'#fff',hoverOffset:6}]
            },
            options:{responsive:true,maintainAspectRatio:false,
                backgroundColor:'#ffffff',
                layout:{padding:{bottom:50}},
                plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{
                    const pct=total>0?((ctx.parsed/total)*100).toFixed(1):'0.0';
                    return ` ${fmtCr(ctx.parsed)}  (${pct}%)`;
                }}}}
            },
            plugins:[{
                id:'sliceLabels',
                afterDraw(chart){
                    const{ctx,data}=chart;
                    const ds=chart.getDatasetMeta(0).data;
                    const vals=data.datasets[0].data;
                    const lbls=data.labels;
                    const tot=vals.reduce((a,b)=>a+b,0);
                    ctx.save();
                    ds.forEach((arc,i)=>{
                        const angle=(arc.startAngle+arc.endAngle)/2;
                        const r=arc.outerRadius*0.60;
                        const x=arc.x+Math.cos(angle)*r;
                        const y=arc.y+Math.sin(angle)*r;
                        const pct=tot>0?Math.round((vals[i]/tot)*100)+'%':'';
                        ctx.fillStyle='#fff';
                        ctx.textAlign='center';
                        ctx.textBaseline='middle';
                        /* Name */
                        ctx.font='bold 16px sans-serif';
                        ctx.fillText(lbls[i],x,y-18);
                        /* Value */
                        ctx.font='700 16px sans-serif';
                        ctx.fillText(fmtCr(vals[i]),x,y+2);
                        /* Pct */
                        ctx.font='600 16px sans-serif';
                        ctx.fillText(pct,x,y+22);
                    });
                    /* Total centred below the pie using actual arc geometry */
                    const arc0 = ds[0];
                    const pieBottom = arc0.y + arc0.outerRadius; // bottom edge of pie
                    const cw = chart.width;
                    const labelY = pieBottom + 18;
                    ctx.fillStyle = '#999';
                    ctx.font = '700 10px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.letterSpacing = '1px';
                    ctx.fillText('TOTAL BUDGET', cw / 2, labelY);
                    ctx.fillStyle = '#111';
                    ctx.font = '700 20px sans-serif';
                    ctx.letterSpacing = '0px';
                    ctx.fillText(fmtCr(tot), cw / 2, labelY + 18);
                    ctx.restore();
                }
            }]
        });

    }

    /* ════════════════════════════════════════════════════════════
       renderSvgPie — pure SVG unit pie, labels never clip.
       Fixed 600×520 viewBox, scales with CSS width:100%.
       Values displayed as rounded whole numbers (no decimals).
    ════════════════════════════════════════════════════════════ */
    function renderSvgPie(wrapperId, labels, values, colors, legendId, totalId, totalLabel) {
        const wrap = document.getElementById(wrapperId);
        if (!wrap) return;
        const tot = values.reduce((a, b) => a + b, 0);
        if (!tot) { wrap.innerHTML = '<p style="color:#aaa;padding:20px">No data</p>'; return; }

        const pcts = values.map(v => (v / tot * 100));

        /* ── Build left/right label lists by natural angle ── */
        const PIE_R = 120, CX = 150, CY = 150;
        let cur = -Math.PI / 2;
        const slices = values.map((v, i) => {
            const sw = (v / tot) * 2 * Math.PI, sa = cur, ea = cur + sw, ma = cur + sw / 2;
            cur = ea;
            return { v, i, sa, ea, ma, pct: v / tot * 100, label: labels[i], color: colors[i] };
        });

        const leftSlices  = slices.filter(s => Math.cos(s.ma) < 0).sort((a, b) => a.ma - b.ma);
        const rightSlices = slices.filter(s => Math.cos(s.ma) >= 0).sort((a, b) => a.ma - b.ma);

        /* ── SVG pie with data-index for tooltip ── */
        const polar = (r, a) => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
        function arcPath(s, e) {
            const [x1, y1] = polar(PIE_R, s), [x2, y2] = polar(PIE_R, e);
            return `M${CX},${CY}L${x1.toFixed(2)},${y1.toFixed(2)}A${PIE_R},${PIE_R},0,${(e-s)>Math.PI?1:0},1,${x2.toFixed(2)},${y2.toFixed(2)}Z`;
        }

        let sliceSvg = '', pctSvg = '';
        slices.forEach((s, i) => {
            sliceSvg += `<path d="${arcPath(s.sa, s.ea)}" fill="${s.color}" stroke="#fff" stroke-width="2"
                data-i="${i}" data-label="${s.label}" data-val="${fmtCr(s.v)}" data-pct="${s.pct.toFixed(1)}"
                style="cursor:pointer;transition:opacity .15s"
                onmouseenter="this.style.opacity='.75'"
                onmouseleave="this.style.opacity='1'"/>`;
            if (s.pct >= 4) {
                const [px, py] = polar(PIE_R * 0.63, s.ma);
                pctSvg += `<text x="${px.toFixed(1)}" y="${py.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" fill="#fff" style="pointer-events:none">${s.pct.toFixed(1)}%</text>`;
            }
        });

        const uid = 'pie_' + Math.random().toString(36).slice(2, 8);
        const pieSvg = `
            <svg id="${uid}" viewBox="0 0 300 300" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="300" fill="#fff"/>
                ${sliceSvg}${pctSvg}
            </svg>`;

        /* ── Label table row builder ── */
        const labelRow = s => `
            <div style="display:flex;align-items:flex-start;gap:7px;padding:5px 0;border-bottom:1px solid #f0f2f5;min-width:0;">
                <span style="width:10px;height:10px;min-width:10px;border-radius:2px;background:${s.color};margin-top:3px;"></span>
                <div style="min-width:0;overflow:hidden;">
                    <div style="font-size:11px;font-weight:700;color:#111;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${s.label}">${s.label}</div>
                    <div style="font-size:11px;font-weight:600;color:#333;white-space:nowrap;">${fmtCr(s.v)}</div>
                    <div style="font-size:10px;color:#888;">${s.pct.toFixed(1)}%</div>
                </div>
            </div>`;

        const leftHtml  = leftSlices.map(labelRow).join('');
        const rightHtml = rightSlices.map(labelRow).join('');
        const totLabel  = totalLabel || 'TOTAL';

        const tipId = 'tip_' + uid;

        wrap.innerHTML = `
            <div style="background:#fff;border-radius:8px;padding:8px 0;position:relative;">
                <!-- Tooltip -->
                <div id="${tipId}" style="display:none;position:fixed;background:rgba(20,20,20,.88);color:#fff;
                    border-radius:8px;padding:8px 12px;font-size:12px;pointer-events:none;z-index:9999;
                    box-shadow:0 4px 16px rgba(0,0,0,.25);min-width:120px;"></div>
                <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,280px) minmax(0,1fr);align-items:center;gap:8px;">
                    <div style="padding:0 4px;min-width:0;">${leftHtml}</div>
                    <div style="aspect-ratio:1;min-width:180px;position:relative;">${pieSvg}</div>
                    <div style="padding:0 4px;min-width:0;">${rightHtml}</div>
                </div>
                <!-- Total -->
                <div style="text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid #e8edf3;">
                    <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#999;text-transform:uppercase;">${totLabel}</div>
                    <div style="font-size:22px;font-weight:700;color:#111;line-height:1.2;">${fmtCr(tot)}</div>
                </div>
            </div>`;

        /* ── Tooltip logic ── */
        const tip = document.getElementById(tipId);
        const svgEl = document.getElementById(uid);
        svgEl.addEventListener('mousemove', function(e) {
            const path = e.target.closest('path[data-label]');
            if (!path) { tip.style.display = 'none'; return; }
            tip.style.display = 'block';
            tip.style.left = (e.clientX + 14) + 'px';
            tip.style.top  = (e.clientY - 10) + 'px';
            tip.innerHTML = `<div style="font-weight:700;margin-bottom:3px;">${path.dataset.label}</div>
                <div>${path.dataset.val}</div>
                <div style="color:#aaa;">${path.dataset.pct}%</div>`;
        });
        svgEl.addEventListener('mouseleave', () => { tip.style.display = 'none'; });

        /* Hide legend — labels already shown in side columns */
        $('#' + legendId).hide();
        if (totalId) $('#' + totalId).text(fmtCr(tot));
    }

    function renderWpUnitPie(message){
        const PALETTE_WP=['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
        const GN='Grants & Donations';
        function getDirectWork(u){
            const gt=(u.actuals||[]).find(a=>a.sequence_id===9999);
            const grand=gt?(gt.ytd||0):0;let grants=0;
            (u.actuals||[]).forEach(a=>{if(a.sequence_id===9999)return;
                (a.items||[]).forEach(it=>{if(it.name===GN)grants+=(it.ytd||0);});
                (a.sub_heads||[]).forEach(sh=>(sh.items||[]).forEach(it=>{if(it.name===GN)grants+=(it.ytd||0);}));});
            return grand-grants;
        }
        const units=message.filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===0)
            .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0));
        const labels=[],values=[],colors=[];let ci=0;
        units.forEach(u=>{const dw=getDirectWork(u);if(dw<=0)return;
            labels.push((u.label||'').trim());values.push(Math.round(dw));colors.push(PALETTE_WP[ci++%PALETTE_WP.length]);});
        renderSvgPie('bd-unit-pie-wrap',labels,values,colors,'bd-wp-unit-legend','bd-wp-unit-pie-total','TOTAL DIRECT WORK');
    }

    function renderWpGrantsUnitPie(message){
        const PALETTE_WP=['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
        const GN='Grants & Donations';
        function getGrantsAmt(u){
            let amt=0;
            (u.actuals||[]).forEach(a=>{if(a.sequence_id===9999)return;
                (a.items||[]).forEach(it=>{if(it.name===GN)amt+=(it.ytd||0);});
                (a.sub_heads||[]).forEach(sh=>(sh.items||[]).forEach(it=>{if(it.name===GN)amt+=(it.ytd||0);}));});
            return amt;
        }
        const units=message.filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===0)
            .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0));
        const labels=[],values=[],colors=[];let ci=0;
        units.forEach(u=>{const g=getGrantsAmt(u);if(g<=0)return;
            labels.push((u.label||'').trim());values.push(Math.round(g));colors.push(PALETTE_WP[ci++%PALETTE_WP.length]);});
        renderSvgPie('bd-grants-pie-wrap',labels,values,colors,'bd-wp-grants-unit-legend','bd-wp-grants-unit-total','TOTAL GRANTS');
    }

    let resizeTimer;
    $(window).on('resize.bd',function(){
        clearTimeout(resizeTimer);
        resizeTimer=setTimeout(()=>{
            if(donutChart)donutChart.resize();
            if(wpPieChart)wpPieChart.resize();
            /* SVG pies scale automatically via viewBox — no action needed */
        },300);
    });
    $(wrapper).on('hide',function(){$(window).off('resize.bd');});

    if(!window.Chart){
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
        document.head.appendChild(s);
    }
    if(!window.htmlToImage){
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
        document.head.appendChild(s);
    }

    /* Global save function — captures entire chart card as PNG */
    window.bdSaveCard = function(cardId, filename) {
        const card = document.getElementById(cardId);
        if (!card) return;
        const fname = (filename || cardId) + '.png';
        /* Hide the download button so it doesn't appear in the image */
        const btn = card.querySelector('button');
        if (btn) btn.style.visibility = 'hidden';
        const doSave = () => {
            window.htmlToImage.toPng(card, {
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                style: { boxShadow: 'none' }
            }).then(dataUrl => {
                if (btn) btn.style.visibility = '';
                const a = document.createElement('a');
                a.download = fname;
                a.href = dataUrl;
                a.click();
            }).catch(err => {
                if (btn) btn.style.visibility = '';
                frappe.msgprint('Could not save image. Please try again.');
                console.error(err);
            });
        };
        if (window.htmlToImage) { doSave(); }
        else { setTimeout(doSave, 800); }
    };

    if(!$('#global-loader').length){
        $('body').append('<div id="global-loader" class="loader-overlay"><div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt=""><div class="loader-text">Loading, please wait</div></div></div>');
    }
    $('#global-loader').hide();

    var Loader={
        show(msg){var $l=$('#global-loader');$l.find('.loader-text').text(msg||'Loading, please wait');$l.css('display','flex').hide().fadeIn(200);},
        hide(){$('#global-loader').fadeOut(200);}
    };
};


// frappe.pages['consolidate-report'].on_page_load = function (wrapper) {

//     const page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Dashboard',
//         single_column: true
//     });

//     /* ── STYLES ── */
//     $(`<style>
//         .bd-wrap { padding: 0; box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: hidden; }

//         /* FILTER BAR */
//         .bd-filter-bar {
//             display: flex;
//             align-items: flex-end;
//             gap: 20px;
//             padding: 16px 20px 0;
//             flex-wrap: wrap;
//         }
//         .bd-filter { width: 200px; }

//         /* TAB NAV */
//         #bd-tab-nav {
//             list-style: none;
//             margin: 18px 0 0;
//             padding: 0 20px;
//             display: flex;
//             flex-wrap: wrap;
//             gap: 0;
//             border-bottom: 2px solid #d1d5db;
//         }
//         #bd-tab-nav li { margin: 0; padding: 0; }
//         #bd-tab-nav .bd-tab {
//             display: block;
//             font-size: 13px;
//             font-weight: 400;
//             color: #6b7280;
//             padding: 10px 16px 11px;
//             cursor: pointer;
//             border-bottom: 2px solid transparent;
//             margin-bottom: -2px;
//             white-space: nowrap;
//             text-decoration: none;
//             transition: color .15s, border-color .15s;
//             user-select: none;
//         }
//         #bd-tab-nav .bd-tab:hover { color: #111; }
//         #bd-tab-nav .bd-tab.active {
//             color: #111827;
//             font-weight: 700;
//             border-bottom-color: #111827;
//         }

//         /* TAB PANELS */
//         .bd-panel { display: none; padding: 16px 20px; max-width: 100%; overflow-x: hidden; }
//         .bd-panel.active { display: block; }

//         /* BANNER STRIP */
//         .bd-banner-strip {
//             display: grid;
//             grid-template-columns: repeat(3, 1fr);
//             gap: 12px;
//             margin-bottom: 16px;
//         }
//         .bd-banner-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//             transition: box-shadow .2s;
//         }
//         .bd-banner-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-banner-card.blue   { border-left-color: #1a56db; }
//         .bd-banner-card.green  { border-left-color: #0e9f6e; }
//         .bd-banner-card.orange { border-left-color: #ff5a1f; }
//         .bd-banner-label {
//             font-size: 10px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: .6px;
//             color: #888;
//             margin-bottom: 5px;
//         }
//         .bd-banner-value { font-size: 22px; font-weight: 700; color: #111; line-height: 1.2; }
//         .bd-banner-sub   { font-size: 11px; color: #aaa; margin-top: 3px; }

//         /* SECTION TITLE */
//         .bd-section-title {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             font-size: 11px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: 1.2px;
//             color: #374151;
//             margin: 0 0 12px;
//         }
//         .bd-section-title::before {
//             content: '';
//             display: inline-block;
//             width: 3px;
//             height: 14px;
//             border-radius: 2px;
//             background: #378ADD;
//             flex-shrink: 0;
//         }
//         .bd-section-title.sub::before { background: #7F77DD; }
//         .bd-section-title::after {
//             content: '';
//             flex: 1;
//             height: 1px;
//             background: #e8edf3;
//         }

//         /* CARDS */
//         .bd-cards {
//             display: grid;
//             grid-template-columns: repeat(4, 1fr);
//             gap: 12px;
//             margin-bottom: 10px;
//         }
//         .bd-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//             transition: box-shadow .2s;
//         }
//         .bd-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-card-label {
//             font-size: 10px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: .5px;
//             color: #888;
//             margin-bottom: 5px;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-value {
//             font-size: 17px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.2;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-sub { font-size: 11px; color: #aaa; margin-top: 3px; }

//         /* BOTTOM ROW */
//         .bd-bottom {
//             display: grid;
//             grid-template-columns: 1fr minmax(0, 400px);
//             gap: 14px;
//             align-items: start;
//             margin-top: 16px;
//         }
//         .bd-chart-box {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 16px 18px;
//             min-width: 0;
//         }
//         .bd-chart-title { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
//         .bd-chart-sub   { font-size: 12px; color: #aaa; margin: 0 0 14px; }

//         /* BAR ROWS */
//         .bd-bar-row {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             margin-bottom: 9px;
//         }
//         .bd-bar-label {
//             font-size: 13px;
//             font-weight: 600;
//             color: #222;
//             width: 170px;
//             min-width: 170px;
//             text-align: right;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-bar-track {
//             flex: 1;
//             height: 22px;
//             background: #f0f2f5;
//             border-radius: 5px;
//             overflow: hidden;
//         }
//         .bd-bar-fill {
//             height: 100%;
//             border-radius: 5px;
//             transition: width .5s ease;
//         }
//         .bd-bar-val {
//             font-size: 12px;
//             font-weight: 700;
//             color: #222;
//             width: 72px;
//             min-width: 72px;
//             white-space: nowrap;
//         }
//         .bd-bar-divider {
//             border: none;
//             border-top: 1px dashed #e0e4ea;
//             margin: 6px 0 10px;
//         }
//         .bd-bar-section-label {
//             font-size: 10px;
//             font-weight: 700;
//             color: #bbb;
//             text-transform: uppercase;
//             letter-spacing: .5px;
//             margin-bottom: 8px;
//         }

//         /* LEGEND */
//         .bd-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
//         .bd-legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #555; }
//         .bd-legend-dot  { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }

//         /* DONUT CENTER */
//         .bd-donut-center {
//             position: absolute; top: 50%; left: 50%;
//             transform: translate(-50%, -50%);
//             text-align: center; pointer-events: none;
//         }
//         .bd-donut-center-val { font-size: 19px; font-weight: 700; color: #111; line-height: 1.1; }
//         .bd-donut-center-lbl { font-size: 10px; color: #888; margin-top: 2px; }

//         /* WORK PLAN */
//         .bd-wp-grid {
//             display: grid;
//             grid-template-columns: 1fr minmax(0, 280px);
//             gap: 16px;
//             align-items: start;
//         }
//         .bd-wp-pie-box { min-width: 0; }
//         .bd-wp-pie-total-box {
//             text-align: center;
//             margin-top: 16px;
//             padding-top: 12px;
//             border-top: 1px solid #f0f2f5;
//         }
//         .bd-wp-pie-total-label {
//             font-size: 10px;
//             font-weight: 700;
//             letter-spacing: .8px;
//             color: #aaa;
//             text-transform: uppercase;
//             margin-bottom: 4px;
//         }
//         .bd-wp-pie-total-val {
//             font-size: 26px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.1;
//         }
//         .bd-wp-summary { display: flex; flex-direction: column; gap: 12px; }
//         .bd-wp-stat-card { cursor: default; }
//         .bd-wp-two-col-row {
//             display: grid;
//             grid-template-columns: repeat(2, minmax(0, 1fr));
//             gap: 14px;
//             margin-top: 16px;
//         }

//         /* PIE CANVAS WRAPPER — allow overflow for outside labels */
//         .bd-pie-canvas-wrap {
//             position: relative;
//             width: 100%;
//         }

//         /* LOADING OVERLAY */
//         #global-loader.loader-overlay {
//             position: fixed; top: 0; left: 0; right: 0; bottom: 0;
//             background: rgba(18,18,18,.92);
//             backdrop-filter: blur(6px);
//             display: none; z-index: 999999;
//             align-items: center; justify-content: center;
//         }
//         .loader-box { display: flex; flex-direction: column; align-items: center; gap: 14px; }
//         .loader-logo {
//             width: 90px; height: 90px; border-radius: 50%;
//             background: linear-gradient(145deg,#fff,#eaeaea);
//             padding: 14px; object-fit: contain;
//             box-shadow: 0 10px 30px rgba(0,0,0,.35);
//             animation: lp 1.6s infinite ease-in-out;
//         }
//         .loader-text { font-size: 13px; color: #fff; font-weight: 600; letter-spacing: .5px; opacity: .85; }
//         .loader-text::after { content: ""; display: inline-block; width: 1em; animation: ld 1.5s infinite; }
//         @keyframes lp { 0%,100% { transform: scale(1); opacity: .8; } 50% { transform: scale(1.08); opacity: 1; } }
//         @keyframes ld { 0% { content: ""; } 33% { content: "."; } 66% { content: ".."; } 100% { content: "..."; } }

//         /* RESPONSIVE */
//         .bd-wrap, .bd-panel, .bd-filter-bar {
//             max-width: 100%;
//             overflow-x: hidden;
//         }
//         .bd-chart-box, .bd-card, .bd-banner-card {
//             min-width: 0;
//             word-break: break-word;
//         }

//         @media (min-width: 1400px) {
//             .bd-banner-value { font-size: 26px; }
//             .bd-bottom { grid-template-columns: 1fr 440px; }
//         }
//         @media (max-width: 1200px) {
//             .bd-bottom { grid-template-columns: 1fr 360px; }
//             .bd-cards  { grid-template-columns: repeat(3, 1fr); }
//         }
//         @media (max-width: 1024px) {
//             .bd-bottom { grid-template-columns: 1fr; }
//             .bd-wp-grid { grid-template-columns: 1fr; }
//         }
//         @media (max-width: 900px) {
//             .bd-wp-two-col-row { grid-template-columns: 1fr; }
//             .bd-cards { grid-template-columns: repeat(2, 1fr); }
//             .bd-banner-strip { grid-template-columns: repeat(2, 1fr); }
//         }
//         @media (max-width: 768px) {
//             .bd-cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
//             .bd-banner-strip { grid-template-columns: 1fr; }
//             .bd-bar-label { width: 110px; min-width: 110px; font-size: 11px; }
//             .bd-bar-val   { width: 60px; min-width: 60px; font-size: 11px; }
//             .bd-filter { width: 150px; }
//             .bd-banner-value { font-size: 18px; }
//             .bd-card-value { font-size: 14px; }
//         }
//         @media (max-width: 600px) {
//             .bd-filter-bar { padding: 12px 12px 0; gap: 12px; }
//             .bd-panel { padding: 10px; }
//             .bd-filter { width: 100%; }
//             .bd-bottom { gap: 10px; }
//             .bd-bar-label { width: 90px; min-width: 90px; font-size: 10px; }
//             .bd-bar-val   { width: 52px; min-width: 52px; font-size: 10px; }
//             .bd-chart-box { padding: 12px; }
//         }
//         @media (max-width: 480px) {
//             .bd-cards { grid-template-columns: 1fr; }
//             .bd-banner-strip { grid-template-columns: 1fr; }
//             .bd-banner-value { font-size: 16px; }
//         }
//     </style>`).appendTo('head');

//     /* ── PALETTE ── */
//     const PALETTE     = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//     const SUB_PALETTE = ['#5b9bd5','#17856a','#c04e22','#6b62c7','#c03d6a','#9a5e0e','#4e7a18','#c93737','#0f4a87','#6b6b68'];


//     /* ── LAYOUT ── */
//     $(page.body).html(`
//         <div class="bd-wrap">

//             <!-- Filters -->
//             <div class="bd-filter-bar">
//                 <div class="bd-filter" id="bd-fy-wrap"></div>
//             </div>

//             <!-- Tab nav -->
//             <ul id="bd-tab-nav">
//                 <li><a class="bd-tab active" data-tab="dashboard">Budget Dashboard</a></li>
//                 <li><a class="bd-tab" data-tab="workplan">Work Plan Views</a></li>
//             </ul>

//             <!-- Tab 1: Budget Dashboard -->
//             <div class="bd-panel active" id="bd-panel-dashboard">

//                 <!-- Consolidated totals -->
//                 <div class="bd-banner-strip">
//                     <div class="bd-banner-card blue">
//                         <div class="bd-banner-label">Overall Grand Total</div>
//                         <div class="bd-banner-value" id="bd-grand-total">—</div>
//                         <div class="bd-banner-sub" id="bd-unit-count">—</div>
//                     </div>
//                     <div class="bd-banner-card green">
//                         <div class="bd-banner-label">CAPEX Total</div>
//                         <div class="bd-banner-value" id="bd-capex-total">—</div>
//                         <div class="bd-banner-sub">Capital Expenses</div>
//                     </div>
//                     <div class="bd-banner-card orange">
//                         <div class="bd-banner-label">OPEX Total</div>
//                         <div class="bd-banner-value" id="bd-opex-total">—</div>
//                         <div class="bd-banner-sub">Operating Expenses</div>
//                     </div>
//                 </div>

//                 <!-- Units -->
//                 <p class="bd-section-title" style="margin-top:4px;">Units</p>
//                 <div class="bd-cards" id="bd-cards">
//                     <div class="bd-loading"><div class="bd-spinner"></div> Loading…</div>
//                 </div>

//                 <!-- Sub Units -->
//                 <p class="bd-section-title sub" id="bd-sub-title" style="margin-top:16px;">Sub Units</p>
//                 <div class="bd-cards" id="bd-subcards"></div>

//                 <!-- Charts -->
//                 <div class="bd-bottom">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget by Unit</p>
//                         <p class="bd-chart-sub">Units and Sub Units ranked by budget</p>
//                         <div id="bd-hbar-body"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget Share</p>
//                         <p class="bd-chart-sub">Units only — percentage distribution</p>
//                         <div style="position:relative;width:100%;height:260px;">
//                             <canvas id="bd-donut"></canvas>
//                             <div class="bd-donut-center">
//                                 <div class="bd-donut-center-val" id="bd-donut-total">—</div>
//                                 <div class="bd-donut-center-lbl">Grand total</div>
//                             </div>
//                         </div>
//                         <div class="bd-legend" id="bd-donut-legend"></div>
//                     </div>
//                 </div>
//             </div>

//             <!-- Tab 2: Work Plan Views -->
//             <div class="bd-panel" id="bd-panel-workplan">
//                 <div class="bd-wp-grid">
//                     <!-- Pie Chart: Grants vs Others -->
//                     <div class="bd-chart-box bd-wp-pie-box">
//                         <p class="bd-chart-title">Grants &amp; Donations And Direct Work</p>
//                         <p class="bd-chart-sub">Consolidated budget breakdown</p>
//                         <div id="bd-wp-pie-wrap" style="position:relative;width:100%;height:320px;">
//                             <canvas id="bd-wp-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL BUDGET</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-pie-total">—</div>
//                         </div>
//                     </div>
//                     <!-- Summary cards -->
//                     <div class="bd-wp-summary">
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#1a56db;">
//                             <div class="bd-card-label">Grand Total</div>
//                             <div class="bd-card-value" id="bd-wp-pie-total-card">—</div>
//                             <div class="bd-card-sub">Overall budget</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" id="bd-wp-grants-card" style="border-left-color:#378ADD;">
//                             <div class="bd-card-label">Grants &amp; Donations</div>
//                             <div class="bd-card-value" id="bd-wp-grants-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-grants-pct">—</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" id="bd-wp-others-card" style="border-left-color:#F5A623;">
//                             <div class="bd-card-label">Direct Work</div>
//                             <div class="bd-card-value" id="bd-wp-others-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-others-pct">—</div>
//                         </div>
//                     </div>
//                 </div>

//                 <!-- Direct Work & Grants unit pies — side by side -->
//                 <div class="bd-wp-two-col-row">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Direct Work — Unit-wise</p>
//                         <p class="bd-chart-sub">Direct Work budget share per unit</p>
//                         <div class="bd-pie-canvas-wrap" style="height:500px;">
//                             <canvas id="bd-wp-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL DIRECT WORK</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-unit-pie-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-unit-legend"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Grants &amp; Donations — Unit-wise</p>
//                         <p class="bd-chart-sub">Grants &amp; Donations budget share per unit</p>
//                         <div class="bd-pie-canvas-wrap" style="height:500px;">
//                             <canvas id="bd-wp-grants-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL GRANTS &amp; DONATIONS</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-grants-unit-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-grants-unit-legend"></div>
//                     </div>
//                 </div>
//             </div>

//         </div>
//     `);

//     let donutChart = null;
//     let wpPieChart = null;
//     let wpUnitPieChart = null;
//     let wpGrantsUnitPieChart = null;
//     let wpDataLoaded = false;

//     /* ── TAB SWITCHING ── */
//     $(page.body).on('click', '#bd-tab-nav .bd-tab', function (e) {
//         e.preventDefault();
//         const tab = $(this).data('tab');
//         $('#bd-tab-nav .bd-tab').removeClass('active');
//         $('.bd-panel').removeClass('active');
//         $(this).addClass('active');
//         $('#bd-panel-' + tab).addClass('active');
//         if (tab === 'workplan' && !wpDataLoaded) {
//             const fy = fyControl.get_value();
//             if (fy) loadWorkPlan(fy);
//         }
//     });

//     /* ── FY FILTER ── */
//     const fyControl = frappe.ui.form.make_control({
//         parent: document.getElementById('bd-fy-wrap'),
//         df: {
//             label: 'Financial Year',
//             fieldtype: 'Select',
//             fieldname: 'financial_year',
//             reqd: 1,
//             change() { triggerLoad(); }
//         },
//         render_input: true
//     });
//     fyControl.refresh();
//     $(fyControl.wrapper).find('.frappe-control').css('min-width', '0');

//     function triggerLoad() {
//         const fy = fyControl.get_value();
//         if (!fy) return;
//         wpDataLoaded = false;
//         if (wpPieChart)         { wpPieChart.destroy();         wpPieChart = null; }
//         if (wpUnitPieChart)     { wpUnitPieChart.destroy();     wpUnitPieChart = null; }
//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         load(fy, 'March');
//         if ($('#bd-tab-nav .bd-tab.active').data('tab') === 'workplan') {
//             loadWorkPlan(fy);
//         }
//     }

//     /* ── LOAD FY LIST ── */
//     frappe.call({
//         method: 'annual_budget.api.filter_options.get_financial_year_list',
//         callback(r) {
//             if (!r.message?.length) return;
//             const years = r.message.map(d => d.financial_year);
//             fyControl.df.options = years.join('\n');
//             fyControl.refresh();

//             const now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1;
//             const fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             const def = years.includes(fy) ? fy : years[0];
//             fyControl.set_value(def);
//             load(def, 'March');
//         }
//     });

//     /* ── HELPERS ── */
//     const fmtINR = v => '₹' + Math.round(v || 0).toLocaleString('en-IN');
//     const fmtCr  = v => {
//         const abs = Math.abs(v || 0);
//         if (abs >= 1e7) return '₹' + ((v || 0) / 1e7).toFixed(2) + ' Cr';
//         if (abs >= 1e5) return '₹' + ((v || 0) / 1e5).toFixed(2) + ' L';
//         if (abs >= 1e3) return '₹' + ((v || 0) / 1e3).toFixed(2) + ' K';
//         return '₹' + Math.round(v || 0);
//     };

//     /* ── PARSE ── */
//     function parseData(message) {
//         const consolidated = message.find(d => d.settings_doc === 'CONSOLIDATED');

//         const mainRaw = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const mainUnits = mainRaw.map((u, idx) => {
//                 const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//                 return {
//                     label:       (u.label || '').trim(),
//                     ytd:         gt ? (gt.ytd || 0) : 0,
//                     sequence_id: u.sequence_id || 0,
//                     color:       PALETTE[idx % PALETTE.length]
//                 };
//             })
//             .filter(u => u.ytd > 0);

//         const subRaw = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 1)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const subUnits = subRaw.map((u, idx) => {
//                 const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//                 return {
//                     label:       (u.label || '').trim(),
//                     ytd:         gt ? (gt.ytd || 0) : 0,
//                     sequence_id: u.sequence_id || 0,
//                     color:       SUB_PALETTE[idx % SUB_PALETTE.length]
//                 };
//             })
//             .filter(u => u.ytd > 0);

//         let overall = 0, capex = 0, opex = 0;
//         if (consolidated) {
//             const ca = consolidated.actuals || [];
//             overall = (ca.find(a => a.name === 'OVERALL GRAND TOTAL') || {}).ytd || 0;
//             capex   = (ca.find(a => a.name === 'CAPEX TOTAL')         || {}).ytd || 0;
//             opex    = (ca.find(a => a.name === 'OPEX TOTAL')          || {}).ytd || 0;
//         }
//         if (!overall) overall = mainUnits.reduce((s, u) => s + u.ytd, 0);

//         return { mainUnits, subUnits, overall, capex, opex };
//     }

//     /* ── RENDER BANNER ── */
//     function renderBanner(overall, capex, opex, mainUnits, subUnits) {
//         $('#bd-grand-total').text(fmtCr(overall));
//         $('#bd-capex-total').text(fmtCr(capex));
//         $('#bd-opex-total').text(fmtCr(opex));
//         $('#bd-unit-count').text(
//             mainUnits.length + ' units' +
//             (subUnits.length ? ' · ' + subUnits.length + ' sub units' : '')
//         );
//     }

//     /* ── RENDER CARDS ── */
//     function renderCards(mainUnits, subUnits, overall) {
//         const $c = $('#bd-cards').empty();
//         mainUnits.forEach(u => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $c.append(`
//                 <div class="bd-card" style="border-left-color:${u.color};">
//                     <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });

//         const $s = $('#bd-subcards').empty();
//         if (!subUnits.length) { $('#bd-sub-title').hide(); return; }
//         $('#bd-sub-title').show();
//         subUnits.forEach(u => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $s.append(`
//                 <div class="bd-card" style="border-left-color:${u.color};">
//                     <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });
//     }

//     /* ── RENDER HBAR ── */
//     function renderHBar(mainUnits, subUnits) {
//         const $body  = $('#bd-hbar-body').empty();
//         const allMax = Math.max(...mainUnits.map(u => u.ytd), ...subUnits.map(u => u.ytd), 1);

//         mainUnits.forEach(u => {
//             const pct = ((u.ytd / allMax) * 100).toFixed(1);
//             $body.append(`
//                 <div class="bd-bar-row">
//                     <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-bar-track">
//                         <div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div>
//                     </div>
//                     <div class="bd-bar-val">${fmtCr(u.ytd)}</div>
//                 </div>
//             `);
//         });

//         if (subUnits.length) {
//             $body.append(`<hr class="bd-bar-divider"><div class="bd-bar-section-label">Sub Units</div>`);
//             subUnits.forEach(u => {
//                 const pct = ((u.ytd / allMax) * 100).toFixed(1);
//                 $body.append(`
//                     <div class="bd-bar-row">
//                         <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                         <div class="bd-bar-track">
//                             <div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div>
//                         </div>
//                         <div class="bd-bar-val">${fmtCr(u.ytd)}</div>
//                     </div>
//                 `);
//             });
//         }
//     }

//     /* ── RENDER DONUT ── */
//     function renderDonut(mainUnits, overall) {
//         const labels = mainUnits.map(u => u.label);
//         const values = mainUnits.map(u => Math.round(u.ytd));
//         const colors = mainUnits.map(u => u.color);

//         $('#bd-donut-total').text(fmtCr(overall));

//         const $leg = $('#bd-donut-legend').empty();
//         mainUnits.forEach((u, i) => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${u.label} — ${pct}%
//                 </span>
//             `);
//         });

//         if (donutChart) { donutChart.destroy(); donutChart = null; }
//         if (!values.length) return;

//         donutChart = new Chart(document.getElementById('bd-donut'), {
//             type: 'doughnut',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 2,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 cutout: '68%',
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = overall > 0
//                                     ? ((ctx.parsed / overall) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     /* ── LOAD ── */
//     function load(fy, month) {
//         Loader.show('Loading dashboard…');
//         $('#bd-grand-total,#bd-capex-total,#bd-opex-total,#bd-donut-total').text('—');
//         $('#bd-unit-count').text('—');
//         $('#bd-cards').empty();
//         $('#bd-hbar-body').empty();

//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: { financial_year: fy, month: month, table_name_filter: 'Number Card' },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) {
//                     $('#bd-cards').html('<div class="bd-loading">No data returned.</div>');
//                     return;
//                 }
//                 const { mainUnits, subUnits, overall, capex, opex } = parseData(r.message);
//                 renderBanner(overall, capex, opex, mainUnits, subUnits);
//                 renderCards(mainUnits, subUnits, overall);
//                 renderHBar(mainUnits, subUnits);
//                 renderDonut(mainUnits, overall);
//             },
//             error() {
//                 Loader.hide();
//                 frappe.msgprint('Failed to load data. Please try again.');
//             }
//         });
//     }

//     /* ════════════════════════════════════════════════════════════════
//        LABEL COLLISION-AVOIDANCE ENGINE
//        Distributes outside labels around the pie without overlapping.
//     ════════════════════════════════════════════════════════════════ */

//     /**
//      * Build positioned labels that avoid collisions.
//      * @param {Array} slices  – Chart.js arc elements (getDatasetMeta(0).data)
//      * @param {Array} vals    – numeric data values
//      * @param {Array} lbls    – string labels
//      * @param {number} total  – sum of vals
//      * @param {number} LINE_H – line height per label row (px)
//      * @returns Array of label descriptors with final (x,y) positions
//      */
//     function buildLabelPositions(slices, vals, lbls, total, LINE_H) {
//         if (!slices.length) return [];

//         const arc0  = slices[0];
//         const cx    = arc0.x;
//         const cy    = arc0.y;
//         const R     = arc0.outerRadius;

//         // Radial distances
//         const R_INNER = R * 1.06;   // start of leader line
//         const R_OUTER = R * 1.30;   // elbow point
//         const ELBOW   = 14;         // horizontal elbow length (px)
//         const TEXT_GAP = 4;         // gap between elbow end and text

//         // Each label occupies 3 lines: name, value, pct
//         const LABEL_HEIGHT = LINE_H * 3 + 4; // total block height

//         // Build initial positions from slice midpoints
//         const items = slices.map((arc, i) => {
//             if (!vals[i]) return null;
//             const midAngle = (arc.startAngle + arc.endAngle) / 2;
//             const elbowX   = cx + Math.cos(midAngle) * R_OUTER;
//             const elbowY   = cy + Math.sin(midAngle) * R_OUTER;
//             const isRight  = Math.cos(midAngle) >= 0;
//             const anchorX  = elbowX + (isRight ? ELBOW : -ELBOW);
//             return {
//                 i,
//                 midAngle,
//                 isRight,
//                 // inner line start
//                 x1: cx + Math.cos(midAngle) * R_INNER,
//                 y1: cy + Math.sin(midAngle) * R_INNER,
//                 // elbow
//                 elbowX, elbowY,
//                 // text anchor
//                 anchorX,
//                 anchorY: elbowY,  // will be adjusted
//                 pct: total > 0 ? (vals[i] / total) * 100 : 0
//             };
//         }).filter(Boolean);

//         // Separate into left / right halves, sort by Y
//         const right = items.filter(d =>  d.isRight).sort((a, b) => a.anchorY - b.anchorY);
//         const left  = items.filter(d => !d.isRight).sort((a, b) => a.anchorY - b.anchorY);

//         // Push overlapping labels apart (simple iterative nudge)
//         function resolveOverlap(group) {
//             const MAX_ITER = 80;
//             for (let iter = 0; iter < MAX_ITER; iter++) {
//                 let moved = false;
//                 for (let k = 1; k < group.length; k++) {
//                     const prev = group[k - 1];
//                     const cur  = group[k];
//                     const gap  = cur.anchorY - prev.anchorY;
//                     if (gap < LABEL_HEIGHT) {
//                         const push = (LABEL_HEIGHT - gap) / 2;
//                         prev.anchorY -= push;
//                         cur.anchorY  += push;
//                         moved = true;
//                     }
//                 }
//                 if (!moved) break;
//             }
//         }

//         resolveOverlap(right);
//         resolveOverlap(left);

//         return items;
//     }

//     /**
//      * Draw all labels + leader lines on the canvas.
//      */
//     function drawLabels(ctx, items, vals, lbls, total, LINE_H) {
//         ctx.save();
//         items.forEach(d => {
//             const { i, x1, y1, elbowX, elbowY, anchorX, anchorY, isRight, pct } = d;
//             const valTxt = fmtCr(vals[i]);
//             const pctTxt = pct.toFixed(1) + '%';
//             const name   = (lbls[i] || '').trim();
//             const xText  = anchorX + (isRight ? TEXT_GAP : -TEXT_GAP);

//             // Recalculate elbow end Y to match resolved anchorY
//             const elbowEndX = anchorX;
//             const elbowEndY = anchorY;

//             // Leader line: from slice edge → elbow point → horizontal
//             ctx.strokeStyle = '#aaa';
//             ctx.lineWidth   = 1;
//             ctx.beginPath();
//             ctx.moveTo(x1, y1);
//             ctx.lineTo(elbowX, elbowEndY);   // go to adjusted Y directly
//             ctx.lineTo(elbowEndX, elbowEndY);
//             ctx.stroke();

//             // Name
//             ctx.fillStyle    = '#111';
//             ctx.textAlign    = isRight ? 'left' : 'right';
//             ctx.textBaseline = 'alphabetic';
//             ctx.font         = 'bold 12px sans-serif';
//             ctx.fillText(name, xText, anchorY - LINE_H * 1.2);

//             // Value
//             ctx.font      = '600 11px sans-serif';
//             ctx.fillStyle = '#444';
//             ctx.fillText(valTxt, xText, anchorY);

//             // Pct
//             ctx.font      = '500 10px sans-serif';
//             ctx.fillStyle = '#888';
//             ctx.fillText(pctTxt, xText, anchorY + LINE_H);
//         });
//         ctx.restore();
//     }

//     /**
//      * Draw percentage text INSIDE large-enough slices.
//      */
//     function drawInnerPct(ctx, slices, vals, total) {
//         ctx.save();
//         slices.forEach((arc, i) => {
//             if (!vals[i]) return;
//             const pct = total > 0 ? (vals[i] / total) * 100 : 0;
//             if (pct < 4) return;
//             const angle = (arc.startAngle + arc.endAngle) / 2;
//             const r     = arc.outerRadius * 0.65;
//             const x     = arc.x + Math.cos(angle) * r;
//             const y     = arc.y + Math.sin(angle) * r;
//             ctx.shadowColor = 'rgba(0,0,0,0.55)';
//             ctx.shadowBlur  = 3;
//             ctx.fillStyle   = '#fff';
//             ctx.textAlign   = 'center';
//             ctx.textBaseline = 'middle';
//             ctx.font        = 'bold 12px sans-serif';
//             ctx.fillText(pct.toFixed(1) + '%', x, y);
//         });
//         ctx.restore();
//     }

//     /* Shared plugin factory so we don't duplicate code for the two unit pies */
//     function makePieLabelPlugin(pluginId) {
//         return {
//             id: pluginId,
//             afterDatasetsDraw(chart) {
//                 const { ctx, data } = chart;
//                 const ds   = chart.getDatasetMeta(0).data;
//                 const vals = data.datasets[0].data;
//                 const lbls = data.labels;
//                 const tot  = vals.reduce((a, b) => a + b, 0);
//                 const LINE_H = 13;

//                 drawInnerPct(ctx, ds, vals, tot);

//                 const positions = buildLabelPositions(ds, vals, lbls, tot, LINE_H);
//                 drawLabels(ctx, positions, vals, lbls, tot, LINE_H);
//             }
//         };
//     }

//     /* ── WORK PLAN: LOAD & RENDER ── */
//     function loadWorkPlan(fy) {
//         Loader.show('Loading Work Plan data…');

//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: { financial_year: fy, month: 'March', table_name_filter: 'Pie Chart' },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) { frappe.msgprint('No Work Plan data returned.'); return; }
//                 const consolidated = r.message.find(d => d.settings_doc === 'CONSOLIDATED');
//                 if (!consolidated) { frappe.msgprint('Consolidated data not found.'); return; }
//                 renderWpPie(consolidated);
//                 renderWpUnitPie(r.message);
//                 renderWpGrantsUnitPie(r.message);
//                 wpDataLoaded = true;
//             },
//             error() { Loader.hide(); frappe.msgprint('Failed to load Work Plan data.'); }
//         });
//     }

//     /* ── WP PIE: Grants vs Direct Work (2-slice) ── */
//     function renderWpPie(consolidated) {
//         const actuals = consolidated.actuals || [];
//         let grantsYtd = 0, othersYtd = 0;
//         const GRANTS_NAME = 'Grants & Donations';

//         actuals.forEach(actual => {
//             if (actual.sequence_id === 9999 ||
//                 actual.name === 'CAPEX TOTAL' ||
//                 actual.name === 'OPEX TOTAL'  ||
//                 actual.name === 'OVERALL GRAND TOTAL') return;

//             (actual.items || []).forEach(item => {
//                 if (item.name === GRANTS_NAME) grantsYtd += (item.ytd || 0);
//                 else othersYtd += (item.ytd || 0);
//             });
//             (actual.sub_heads || []).forEach(sh => {
//                 (sh.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) grantsYtd += (item.ytd || 0);
//                     else othersYtd += (item.ytd || 0);
//                 });
//             });
//         });

//         const total = grantsYtd + othersYtd;
//         const grantsPct = total > 0 ? ((grantsYtd / total) * 100).toFixed(1) : '0.0';
//         const othersPct = total > 0 ? ((othersYtd / total) * 100).toFixed(1) : '0.0';

//         $('#bd-wp-pie-total').text(fmtCr(total));
//         $('#bd-wp-pie-total-card').text(fmtINR(total));
//         $('#bd-wp-grants-val').text(fmtINR(grantsYtd));
//         $('#bd-wp-grants-pct').text(grantsPct + '% of total');
//         $('#bd-wp-others-val').text(fmtINR(othersYtd));
//         $('#bd-wp-others-pct').text(othersPct + '% of total');

//         if (wpPieChart) { wpPieChart.destroy(); wpPieChart = null; }

//         wpPieChart = new Chart(document.getElementById('bd-wp-pie'), {
//             type: 'pie',
//             data: {
//                 labels: ['Grants & Donations', 'Direct Work'],
//                 datasets: [{
//                     data: [Math.round(grantsYtd), Math.round(othersYtd)],
//                     backgroundColor: ['#378ADD', '#F5A623'],
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'wpPieLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds   = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const tot  = vals.reduce((a, b) => a + b, 0);
//                     ctx.save();
//                     ds.forEach((arc, i) => {
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         const r = arc.outerRadius * 0.65;
//                         const x = arc.x + Math.cos(angle) * r;
//                         const y = arc.y + Math.sin(angle) * r;
//                         ctx.fillStyle = '#fff';
//                         ctx.font = 'bold 14px sans-serif';
//                         ctx.textAlign = 'center';
//                         ctx.textBaseline = 'middle';
//                         ctx.fillText(fmtCr(vals[i]), x, y);
//                     });
//                     ctx.restore();
//                 }
//             }]
//         });
//     }

//     /* ── WP PIE: Direct Work unit-wise ── */
//     function renderWpUnitPie(message) {
//         const PALETTE_WP  = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GRANTS_NAME = 'Grants & Donations';

//         function getDirectWork(u) {
//             const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//             const grandTotal = gt ? (gt.ytd || 0) : 0;
//             let grantsAmt = 0;
//             (u.actuals || []).forEach(actual => {
//                 if (actual.sequence_id === 9999) return;
//                 (actual.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) grantsAmt += (item.ytd || 0);
//                 });
//                 (actual.sub_heads || []).forEach(sh => {
//                     (sh.items || []).forEach(item => {
//                         if (item.name === GRANTS_NAME) grantsAmt += (item.ytd || 0);
//                     });
//                 });
//             });
//             return grandTotal - grantsAmt;
//         }

//         const units = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const labels = [], values = [], colors = [];
//         let colorIdx = 0;
//         units.forEach(u => {
//             const dw = getDirectWork(u);
//             if (!dw || dw <= 0) return;
//             labels.push((u.label || '').trim());
//             values.push(Math.round(dw));
//             colors.push(PALETTE_WP[colorIdx++ % PALETTE_WP.length]);
//         });

//         const total = values.reduce((s, v) => s + v, 0);
//         $('#bd-wp-unit-pie-total').text(fmtCr(total));

//         const $leg = $('#bd-wp-unit-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
//             $leg.append(`<span class="bd-legend-item"><span class="bd-legend-dot" style="background:${colors[i]};"></span>${lbl} — ${pct}%</span>`);
//         });

//         if (wpUnitPieChart) { wpUnitPieChart.destroy(); wpUnitPieChart = null; }
//         if (!values.length) return;

//         wpUnitPieChart = new Chart(document.getElementById('bd-wp-unit-pie'), {
//             type: 'pie',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 // Generous padding so outside labels have room
//                 layout: { padding: { top: 80, bottom: 80, left: 140, right: 140 } },
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [ makePieLabelPlugin('unitPieLabels') ]
//         });
//     }

//     /* ── WP PIE: Grants & Donations unit-wise ── */
//     function renderWpGrantsUnitPie(message) {
//         const PALETTE_WP  = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GRANTS_NAME = 'Grants & Donations';

//         function getGrantsAmt(u) {
//             let amt = 0;
//             (u.actuals || []).forEach(actual => {
//                 if (actual.sequence_id === 9999) return;
//                 (actual.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) amt += (item.ytd || 0);
//                 });
//                 (actual.sub_heads || []).forEach(sh => {
//                     (sh.items || []).forEach(item => {
//                         if (item.name === GRANTS_NAME) amt += (item.ytd || 0);
//                     });
//                 });
//             });
//             return amt;
//         }

//         const units = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const labels = [], values = [], colors = [];
//         let colorIdx = 0;
//         units.forEach(u => {
//             const g = getGrantsAmt(u);
//             if (!g || g <= 0) return;
//             labels.push((u.label || '').trim());
//             values.push(Math.round(g));
//             colors.push(PALETTE_WP[colorIdx++ % PALETTE_WP.length]);
//         });

//         const total = values.reduce((s, v) => s + v, 0);
//         $('#bd-wp-grants-unit-total').text(fmtCr(total));

//         const $leg = $('#bd-wp-grants-unit-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
//             $leg.append(`<span class="bd-legend-item"><span class="bd-legend-dot" style="background:${colors[i]};"></span>${lbl} — ${pct}%</span>`);
//         });

//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         if (!values.length) return;

//         wpGrantsUnitPieChart = new Chart(document.getElementById('bd-wp-grants-unit-pie'), {
//             type: 'pie',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 layout: { padding: { top: 80, bottom: 80, left: 140, right: 140 } },
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [ makePieLabelPlugin('grantsPieLabels') ]
//         });
//     }

//     /* ── RESIZE ── */
//     let resizeTimer;
//     $(window).on('resize.bd', function () {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(() => {
//             if (donutChart)            donutChart.resize();
//             if (wpPieChart)            wpPieChart.resize();
//             if (wpUnitPieChart)        wpUnitPieChart.resize();
//             if (wpGrantsUnitPieChart)  wpGrantsUnitPieChart.resize();
//         }, 200);
//     });
//     $(wrapper).on('hide', function () { $(window).off('resize.bd'); });

//     /* ── CHART.JS ── */
//     if (!window.Chart) {
//         const s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         document.head.appendChild(s);
//     }

//     /* ── GLOBAL LOADER ── */
//     if (!$('#global-loader').length) {
//         $('body').append(
//             '<div id="global-loader" class="loader-overlay">' +
//             '<div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt="">' +
//             '<div class="loader-text">Loading, please wait</div></div></div>'
//         );
//     }
//     $('#global-loader').hide();

//     var Loader = {
//         show: function (msg) {
//             var $l = $('#global-loader');
//             $l.find('.loader-text').text(msg || 'Loading, please wait');
//             $l.css('display', 'flex').hide().fadeIn(200);
//         },
//         hide: function () { $('#global-loader').fadeOut(200); }
//     };
// };


// frappe.pages['consolidate-report'].on_page_load = function (wrapper) {

//     const page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Budget Dashboard',
//         single_column: true
//     });

//     /* ── STYLES ── */
//     $(`<style>
//         .bd-wrap { padding: 0; box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: hidden; }

//         /* FILTER BAR */
//         .bd-filter-bar {
//             display: flex;
//             align-items: flex-end;
//             gap: 20px;
//             padding: 16px 20px 0;
//             flex-wrap: wrap;
//         }
//         .bd-filter { width: 200px; }

//         /* TAB NAV */
//         #bd-tab-nav {
//             list-style: none;
//             margin: 18px 0 0;
//             padding: 0 20px;
//             display: flex;
//             flex-wrap: wrap;
//             gap: 0;
//             border-bottom: 2px solid #d1d5db;
//         }
//         #bd-tab-nav li { margin: 0; padding: 0; }
//         #bd-tab-nav .bd-tab {
//             display: block;
//             font-size: 13px;
//             font-weight: 400;
//             color: #6b7280;
//             padding: 10px 16px 11px;
//             cursor: pointer;
//             border-bottom: 2px solid transparent;
//             margin-bottom: -2px;
//             white-space: nowrap;
//             text-decoration: none;
//             transition: color .15s, border-color .15s;
//             user-select: none;
//         }
//         #bd-tab-nav .bd-tab:hover { color: #111; }
//         #bd-tab-nav .bd-tab.active {
//             color: #111827;
//             font-weight: 700;
//             border-bottom-color: #111827;
//         }

//         /* TAB PANELS */
//         .bd-panel { display: none; padding: 16px 20px; max-width: 100%; overflow-x: hidden; }
//         .bd-panel.active { display: block; }

//         /* BANNER STRIP */
//         .bd-banner-strip {
//             display: grid;
//             grid-template-columns: repeat(3, 1fr);
//             gap: 12px;
//             margin-bottom: 16px;
//         }
//         .bd-banner-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//             transition: box-shadow .2s;
//         }
//         .bd-banner-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-banner-card.blue   { border-left-color: #1a56db; }
//         .bd-banner-card.green  { border-left-color: #0e9f6e; }
//         .bd-banner-card.orange { border-left-color: #ff5a1f; }
//         .bd-banner-label {
//             font-size: 10px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: .6px;
//             color: #888;
//             margin-bottom: 5px;
//         }
//         .bd-banner-value { font-size: 22px; font-weight: 700; color: #111; line-height: 1.2; }
//         .bd-banner-sub   { font-size: 11px; color: #aaa; margin-top: 3px; }

//         /* SECTION TITLE */
//         .bd-section-title {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             font-size: 11px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: 1.2px;
//             color: #374151;
//             margin: 0 0 12px;
//         }
//         .bd-section-title::before {
//             content: '';
//             display: inline-block;
//             width: 3px;
//             height: 14px;
//             border-radius: 2px;
//             background: #378ADD;
//             flex-shrink: 0;
//         }
//         .bd-section-title.sub::before { background: #7F77DD; }
//         .bd-section-title::after {
//             content: '';
//             flex: 1;
//             height: 1px;
//             background: #e8edf3;
//         }

//         /* CARDS */
//         .bd-cards {
//             display: grid;
//             grid-template-columns: repeat(4, 1fr);
//             gap: 12px;
//             margin-bottom: 10px;
//         }
//         .bd-card {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 14px 16px;
//             border-left: 4px solid #378ADD;
//             min-width: 0;
//             transition: box-shadow .2s;
//         }
//         .bd-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-card-label {
//             font-size: 10px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: .5px;
//             color: #888;
//             margin-bottom: 5px;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-value {
//             font-size: 17px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.2;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-card-sub { font-size: 11px; color: #aaa; margin-top: 3px; }

//         /* BOTTOM ROW */
//         .bd-bottom {
//             display: grid;
//             grid-template-columns: 1fr minmax(0, 400px);
//             gap: 14px;
//             align-items: start;
//             margin-top: 16px;
//         }
//         .bd-chart-box {
//             background: #fff;
//             border: 1px solid #e8edf3;
//             border-radius: 12px;
//             padding: 16px 18px;
//             min-width: 0;
//         }
//         .bd-chart-title { font-size: 13px; font-weight: 600; color: #111; margin: 0 0 2px; }
//         .bd-chart-sub   { font-size: 12px; color: #aaa; margin: 0 0 14px; }

//         /* BAR ROWS */
//         .bd-bar-row {
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             margin-bottom: 9px;
//         }
//         .bd-bar-label {
//             font-size: 13px;
//             font-weight: 600;
//             color: #222;
//             width: 170px;
//             min-width: 170px;
//             text-align: right;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//         }
//         .bd-bar-track {
//             flex: 1;
//             height: 22px;
//             background: #f0f2f5;
//             border-radius: 5px;
//             overflow: hidden;
//         }
//         .bd-bar-fill {
//             height: 100%;
//             border-radius: 5px;
//             transition: width .5s ease;
//         }
//         .bd-bar-val {
//             font-size: 12px;
//             font-weight: 700;
//             color: #222;
//             width: 72px;
//             min-width: 72px;
//             white-space: nowrap;
//         }
//         .bd-bar-divider {
//             border: none;
//             border-top: 1px dashed #e0e4ea;
//             margin: 6px 0 10px;
//         }
//         .bd-bar-section-label {
//             font-size: 10px;
//             font-weight: 700;
//             color: #bbb;
//             text-transform: uppercase;
//             letter-spacing: .5px;
//             margin-bottom: 8px;
//         }

//         /* LEGEND */
//         .bd-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
//         .bd-legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #555; }
//         .bd-legend-dot  { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }

//         /* DONUT CENTER */
//         .bd-donut-center {
//             position: absolute; top: 50%; left: 50%;
//             transform: translate(-50%, -50%);
//             text-align: center; pointer-events: none;
//         }
//         .bd-donut-center-val { font-size: 19px; font-weight: 700; color: #111; line-height: 1.1; }
//         .bd-donut-center-lbl { font-size: 10px; color: #888; margin-top: 2px; }

//         /* WORK PLAN */
//         .bd-wp-grid {
//             display: grid;
//             grid-template-columns: 1fr minmax(0, 280px);
//             gap: 16px;
//             align-items: start;
//         }
//         .bd-wp-pie-box { min-width: 0; }
//         .bd-wp-pie-total-box {
//             text-align: center;
//             margin-top: 16px;
//             padding-top: 12px;
//             border-top: 1px solid #f0f2f5;
//         }
//         .bd-wp-pie-total-label {
//             font-size: 10px;
//             font-weight: 700;
//             letter-spacing: .8px;
//             color: #aaa;
//             text-transform: uppercase;
//             margin-bottom: 4px;
//         }
//         .bd-wp-pie-total-val {
//             font-size: 26px;
//             font-weight: 700;
//             color: #111;
//             line-height: 1.1;
//         }
//         .bd-wp-summary { display: flex; flex-direction: column; gap: 12px; }
//         .bd-wp-stat-card { cursor: default; }
//         .bd-wp-two-col-row {
//             display: grid;
//             grid-template-columns: repeat(2, minmax(0, 1fr));
//             gap: 14px;
//             margin-top: 16px;
//         }

//         /* LOADING OVERLAY */
//         #global-loader.loader-overlay {
//             position: fixed; top: 0; left: 0; right: 0; bottom: 0;
//             background: rgba(18,18,18,.92);
//             backdrop-filter: blur(6px);
//             display: none; z-index: 999999;
//             align-items: center; justify-content: center;
//         }
//         .loader-box { display: flex; flex-direction: column; align-items: center; gap: 14px; }
//         .loader-logo {
//             width: 90px; height: 90px; border-radius: 50%;
//             background: linear-gradient(145deg,#fff,#eaeaea);
//             padding: 14px; object-fit: contain;
//             box-shadow: 0 10px 30px rgba(0,0,0,.35);
//             animation: lp 1.6s infinite ease-in-out;
//         }
//         .loader-text { font-size: 13px; color: #fff; font-weight: 600; letter-spacing: .5px; opacity: .85; }
//         .loader-text::after { content: ""; display: inline-block; width: 1em; animation: ld 1.5s infinite; }
//         @keyframes lp { 0%,100% { transform: scale(1); opacity: .8; } 50% { transform: scale(1.08); opacity: 1; } }
//         @keyframes ld { 0% { content: ""; } 33% { content: "."; } 66% { content: ".."; } 100% { content: "..."; } }

//         /* RESPONSIVE */
//         /* Base — always constrain width and prevent horizontal scroll */
//         .bd-wrap, .bd-panel, .bd-filter-bar {
//             max-width: 100%;
//             overflow-x: hidden;
//         }
//         .bd-chart-box, .bd-card, .bd-banner-card {
//             min-width: 0;
//             word-break: break-word;
//         }

//         @media (min-width: 1400px) {
//             .bd-banner-value { font-size: 26px; }
//             .bd-bottom { grid-template-columns: 1fr 440px; }
//         }
//         @media (max-width: 1200px) {
//             .bd-bottom { grid-template-columns: 1fr 360px; }
//             .bd-cards  { grid-template-columns: repeat(3, 1fr); }
//         }
//         @media (max-width: 1024px) {
//             .bd-bottom { grid-template-columns: 1fr; }
//             .bd-wp-grid { grid-template-columns: 1fr; }
//         }
//         @media (max-width: 900px) {
//             .bd-wp-two-col-row { grid-template-columns: 1fr; }
//             .bd-cards { grid-template-columns: repeat(2, 1fr); }
//             .bd-banner-strip { grid-template-columns: repeat(2, 1fr); }
//         }
//         @media (max-width: 768px) {
//             .bd-cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
//             .bd-banner-strip { grid-template-columns: 1fr; }
//             .bd-bar-label { width: 110px; min-width: 110px; font-size: 11px; }
//             .bd-bar-val   { width: 60px; min-width: 60px; font-size: 11px; }
//             .bd-filter { width: 150px; }
//             .bd-banner-value { font-size: 18px; }
//             .bd-card-value { font-size: 14px; }
//         }
//         @media (max-width: 600px) {
//             .bd-filter-bar { padding: 12px 12px 0; gap: 12px; }
//             .bd-panel { padding: 10px; }
//             .bd-filter { width: 100%; }
//             .bd-bottom { gap: 10px; }
//             .bd-bar-label { width: 90px; min-width: 90px; font-size: 10px; }
//             .bd-bar-val   { width: 52px; min-width: 52px; font-size: 10px; }
//             .bd-chart-box { padding: 12px; }
//         }
//         @media (max-width: 480px) {
//             .bd-cards { grid-template-columns: 1fr; }
//             .bd-banner-strip { grid-template-columns: 1fr; }
//             .bd-banner-value { font-size: 16px; }
//         }
//     </style>`).appendTo('head');

//     /* ── PALETTE ── */
//     const PALETTE     = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//     const SUB_PALETTE = ['#5b9bd5','#17856a','#c04e22','#6b62c7','#c03d6a','#9a5e0e','#4e7a18','#c93737','#0f4a87','#6b6b68'];


//     /* ── LAYOUT ── */
//     $(page.body).html(`
//         <div class="bd-wrap">

//             <!-- Filters -->
//             <div class="bd-filter-bar">
//                 <div class="bd-filter" id="bd-fy-wrap"></div>

//             </div>

//             <!-- Tab nav -->
//             <ul id="bd-tab-nav">
//                 <li><a class="bd-tab active" data-tab="dashboard">Budget Dashboard</a></li>
//                 <li><a class="bd-tab" data-tab="workplan">Work Plan Views</a></li>
//             </ul>

//             <!-- Tab 1: Budget Dashboard -->
//             <div class="bd-panel active" id="bd-panel-dashboard">

//                 <!-- Consolidated totals -->
//                 <div class="bd-banner-strip">
//                     <div class="bd-banner-card blue">
//                         <div class="bd-banner-label">Overall Grand Total</div>
//                         <div class="bd-banner-value" id="bd-grand-total">—</div>
//                         <div class="bd-banner-sub" id="bd-unit-count">—</div>
//                     </div>
//                     <div class="bd-banner-card green">
//                         <div class="bd-banner-label">CAPEX Total</div>
//                         <div class="bd-banner-value" id="bd-capex-total">—</div>
//                         <div class="bd-banner-sub">Capital Expenses</div>
//                     </div>
//                     <div class="bd-banner-card orange">
//                         <div class="bd-banner-label">OPEX Total</div>
//                         <div class="bd-banner-value" id="bd-opex-total">—</div>
//                         <div class="bd-banner-sub">Operating Expenses</div>
//                     </div>
//                 </div>

//                 <!-- Units -->
//                 <p class="bd-section-title" style="margin-top:4px;">Units</p>
//                 <div class="bd-cards" id="bd-cards">
//                     <div class="bd-loading"><div class="bd-spinner"></div> Loading…</div>
//                 </div>

//                 <!-- Sub Units -->
//                 <p class="bd-section-title sub" id="bd-sub-title" style="margin-top:16px;">Sub Units</p>
//                 <div class="bd-cards" id="bd-subcards"></div>

//                 <!-- Charts -->
//                 <div class="bd-bottom">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget by Unit</p>
//                         <p class="bd-chart-sub">Units and Sub Units ranked by budget</p>
//                         <div id="bd-hbar-body"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Budget Share</p>
//                         <p class="bd-chart-sub">Units only — percentage distribution</p>
//                         <div style="position:relative;width:100%;height:260px;">
//                             <canvas id="bd-donut"></canvas>
//                             <div class="bd-donut-center">
//                                 <div class="bd-donut-center-val" id="bd-donut-total">—</div>
//                                 <div class="bd-donut-center-lbl">Grand total</div>
//                             </div>
//                         </div>
//                         <div class="bd-legend" id="bd-donut-legend"></div>
//                     </div>
//                 </div>
//             </div>

//             <!-- Tab 2: Work Plan Views -->
//             <div class="bd-panel" id="bd-panel-workplan">
//                 <div class="bd-wp-grid">
//                     <!-- Pie Chart: Grants vs Others -->
//                     <div class="bd-chart-box bd-wp-pie-box">
//                         <p class="bd-chart-title">Grants &amp; Donations And Direct Work</p>
//                         <p class="bd-chart-sub">Consolidated budget breakdown</p>
//                         <div id="bd-wp-pie-wrap" style="position:relative;width:100%;height:320px;">
//                             <canvas id="bd-wp-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL BUDGET</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-pie-total">—</div>
//                         </div>
//                     </div>
//                     <!-- Summary cards -->
//                     <div class="bd-wp-summary">
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#1a56db;">
//                             <div class="bd-card-label">Grand Total</div>
//                             <div class="bd-card-value" id="bd-wp-pie-total-card">—</div>
//                             <div class="bd-card-sub">Overall budget</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" id="bd-wp-grants-card" style="border-left-color:#378ADD;">
//                             <div class="bd-card-label">Grants &amp; Donations</div>
//                             <div class="bd-card-value" id="bd-wp-grants-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-grants-pct">—</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" id="bd-wp-others-card" style="border-left-color:#F5A623;">
//                             <div class="bd-card-label">Direct Work</div>
//                             <div class="bd-card-value" id="bd-wp-others-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-others-pct">—</div>
//                         </div>
//                     </div>
//                 </div>

//                 <!-- Direct Work & Grants unit pies — side by side -->
//                 <div class="bd-wp-two-col-row">
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Direct Work — Unit-wise</p>
//                         <p class="bd-chart-sub">Direct Work budget share per unit</p>
//                         <div style="position:relative;width:100%;height:580px;">
//                             <canvas id="bd-wp-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL DIRECT WORK</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-unit-pie-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-unit-legend"></div>
//                     </div>
//                     <div class="bd-chart-box">
//                         <p class="bd-chart-title">Grants &amp; Donations — Unit-wise</p>
//                         <p class="bd-chart-sub">Grants &amp; Donations budget share per unit</p>
//                         <div style="position:relative;width:100%;height:580px;">
//                             <canvas id="bd-wp-grants-unit-pie"></canvas>
//                         </div>
//                         <div class="bd-wp-pie-total-box">
//                             <div class="bd-wp-pie-total-label">TOTAL GRANTS &amp; DONATIONS</div>
//                             <div class="bd-wp-pie-total-val" id="bd-wp-grants-unit-total">—</div>
//                         </div>
//                         <div class="bd-legend" id="bd-wp-grants-unit-legend"></div>
//                     </div>
//                 </div>
//             </div>

//         </div>
//     `);

//     let donutChart = null;
//     let wpPieChart = null;
//     let wpUnitPieChart = null;
//     let wpGrantsUnitPieChart = null;
//     let wpDataLoaded = false;

//     /* ── TAB SWITCHING ── */
//     $(page.body).on('click', '#bd-tab-nav .bd-tab', function (e) {
//         e.preventDefault();
//         const tab = $(this).data('tab');
//         $('#bd-tab-nav .bd-tab').removeClass('active');
//         $('.bd-panel').removeClass('active');
//         $(this).addClass('active');
//         $('#bd-panel-' + tab).addClass('active');
//         // Load work plan data when switching to that tab
//         if (tab === 'workplan' && !wpDataLoaded) {
//             const fy = fyControl.get_value();
//             if (fy) loadWorkPlan(fy);
//         }
//     });

//     /* ── FY FILTER ── */
//     const fyControl = frappe.ui.form.make_control({
//         parent: document.getElementById('bd-fy-wrap'),
//         df: {
//             label: 'Financial Year',
//             fieldtype: 'Select',
//             fieldname: 'financial_year',
//             reqd: 1,
//             change() { triggerLoad(); }
//         },
//         render_input: true
//     });
//     fyControl.refresh();
//     // Apply Frappe's native field styling
//     $(fyControl.wrapper).find('.frappe-control').css('min-width', '0');


//     function triggerLoad() {
//         const fy = fyControl.get_value();
//         if (!fy) return;
//         // Reset work plan so it reloads for new FY
//         wpDataLoaded = false;
//         if (wpPieChart) { wpPieChart.destroy(); wpPieChart = null; }
//         if (wpUnitPieChart) { wpUnitPieChart.destroy(); wpUnitPieChart = null; }
//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         load(fy, 'March');
//         // If work plan tab is active, reload it too
//         if ($('#bd-tab-nav .bd-tab.active').data('tab') === 'workplan') {
//             loadWorkPlan(fy);
//         }
//     }

//     /* ── LOAD FY LIST ── */
//     frappe.call({
//         method: 'annual_budget.api.filter_options.get_financial_year_list',
//         callback(r) {
//             if (!r.message?.length) return;
//             const years = r.message.map(d => d.financial_year);
//             fyControl.df.options = years.join('\n');
//             fyControl.refresh();

//             const now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1;
//             const fy  = m >= 4 ? `${y}-${String(y+1).slice(-2)}` : `${y-1}-${String(y).slice(-2)}`;
//             const def = years.includes(fy) ? fy : years[0];
//             fyControl.set_value(def);

//             load(def, 'March');
//         }
//     });

//     /* ── HELPERS ── */
//     const fmtINR = v => '₹' + Math.round(v || 0).toLocaleString('en-IN');
//     const fmtCr  = v => {
//         const abs = Math.abs(v || 0);
//         if (abs >= 1e7) return '₹' + ((v || 0) / 1e7).toFixed(2) + ' Cr';
//         if (abs >= 1e5) return '₹' + ((v || 0) / 1e5).toFixed(2) + ' L';
//         if (abs >= 1e3) return '₹' + ((v || 0) / 1e3).toFixed(2) + ' K';
//         return '₹' + Math.round(v || 0);
//     };

//     /* ── PARSE ── */
//     function parseData(message) {
//         const consolidated = message.find(d => d.settings_doc === 'CONSOLIDATED');

//         // Sort by sequence_id before mapping so colors align with order
//         const mainRaw = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const mainUnits = mainRaw.map((u, idx) => {
//                 const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//                 return {
//                     label:       (u.label || '').trim(),
//                     ytd:         gt ? (gt.ytd || 0) : 0,
//                     sequence_id: u.sequence_id || 0,
//                     color:       PALETTE[idx % PALETTE.length]
//                 };
//             })
//             .filter(u => u.ytd > 0);

//         const subRaw = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 1)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const subUnits = subRaw.map((u, idx) => {
//                 const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//                 return {
//                     label:       (u.label || '').trim(),
//                     ytd:         gt ? (gt.ytd || 0) : 0,
//                     sequence_id: u.sequence_id || 0,
//                     color:       SUB_PALETTE[idx % SUB_PALETTE.length]
//                 };
//             })
//             .filter(u => u.ytd > 0);

//         let overall = 0, capex = 0, opex = 0;
//         if (consolidated) {
//             const ca = consolidated.actuals || [];
//             overall = (ca.find(a => a.name === 'OVERALL GRAND TOTAL') || {}).ytd || 0;
//             capex   = (ca.find(a => a.name === 'CAPEX TOTAL')         || {}).ytd || 0;
//             opex    = (ca.find(a => a.name === 'OPEX TOTAL')          || {}).ytd || 0;
//         }
//         if (!overall) overall = mainUnits.reduce((s, u) => s + u.ytd, 0);

//         return { mainUnits, subUnits, overall, capex, opex };
//     }

//     /* ── RENDER BANNER ── */
//     function renderBanner(overall, capex, opex, mainUnits, subUnits) {
//         $('#bd-grand-total').text(fmtCr(overall));
//         $('#bd-capex-total').text(fmtCr(capex));
//         $('#bd-opex-total').text(fmtCr(opex));
//         $('#bd-unit-count').text(
//             mainUnits.length + ' units' +
//             (subUnits.length ? ' · ' + subUnits.length + ' sub units' : '')
//         );
//     }

//     /* ── RENDER CARDS — same design for both ── */
//     function renderCards(mainUnits, subUnits, overall) {
//         // Units
//         const $c = $('#bd-cards').empty();
//         mainUnits.forEach(u => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $c.append(`
//                 <div class="bd-card" style="border-left-color:${u.color};">
//                     <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });

//         // Sub Units — identical card design
//         const $s = $('#bd-subcards').empty();
//         if (!subUnits.length) {
//             $('#bd-sub-title').hide();
//             return;
//         }
//         $('#bd-sub-title').show();
//         subUnits.forEach(u => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $s.append(`
//                 <div class="bd-card" style="border-left-color:${u.color};">
//                     <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                     <div class="bd-card-sub">${pct}% of total</div>
//                 </div>
//             `);
//         });
//     }

//     /* ── RENDER BAR — same style for both ── */
//     function renderHBar(mainUnits, subUnits) {
//         const $body  = $('#bd-hbar-body').empty();
//         const allMax = Math.max(...mainUnits.map(u => u.ytd), ...subUnits.map(u => u.ytd), 1);

//         // Units section
//         mainUnits.forEach(u => {
//             const pct = ((u.ytd / allMax) * 100).toFixed(1);
//             $body.append(`
//                 <div class="bd-bar-row">
//                     <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-bar-track">
//                         <div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div>
//                     </div>
//                     <div class="bd-bar-val">${fmtCr(u.ytd)}</div>
//                 </div>
//             `);
//         });

//         // Sub Units section — same bar style, just separated
//         if (subUnits.length) {
//             $body.append(`
//                 <hr class="bd-bar-divider">
//                 <div class="bd-bar-section-label">Sub Units</div>
//             `);
//             subUnits.forEach(u => {
//                 const pct = ((u.ytd / allMax) * 100).toFixed(1);
//                 $body.append(`
//                     <div class="bd-bar-row">
//                         <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                         <div class="bd-bar-track">
//                             <div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div>
//                         </div>
//                         <div class="bd-bar-val">${fmtCr(u.ytd)}</div>
//                     </div>
//                 `);
//             });
//         }
//     }

//     /* ── RENDER DONUT ── */
//     function renderDonut(mainUnits, overall) {
//         const labels = mainUnits.map(u => u.label);
//         const values = mainUnits.map(u => Math.round(u.ytd));
//         const colors = mainUnits.map(u => u.color);

//         $('#bd-donut-total').text(fmtCr(overall));

//         const $leg = $('#bd-donut-legend').empty();
//         mainUnits.forEach((u, i) => {
//             const pct = overall > 0 ? ((u.ytd / overall) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${u.label} — ${pct}%
//                 </span>
//             `);
//         });

//         if (donutChart) { donutChart.destroy(); donutChart = null; }
//         if (!values.length) return;

//         donutChart = new Chart(document.getElementById('bd-donut'), {
//             type: 'doughnut',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 2,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 cutout: '68%',
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = overall > 0
//                                     ? ((ctx.parsed / overall) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     /* ── LOAD ── */
//     function load(fy, month) {
//         Loader.show('Loading dashboard…');
//         $('#bd-grand-total,#bd-capex-total,#bd-opex-total,#bd-donut-total').text('—');
//         $('#bd-unit-count').text('—');
//         $('#bd-cards').empty();
//         $('#bd-hbar-body').empty();

//         // Single API: get_unit_wise_plan_budget for entire dashboard
//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: { financial_year: fy, month: month, table_name_filter: 'Unit Wise Plan' },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) {
//                     $('#bd-cards').html('<div class="bd-loading">No data returned.</div>');
//                     return;
//                 }
//                 const { mainUnits, subUnits, overall, capex, opex } = parseData(r.message);
//                 renderBanner(overall, capex, opex, mainUnits, subUnits);
//                 renderCards(mainUnits, subUnits, overall);
//                 renderHBar(mainUnits, subUnits);
//                 renderDonut(mainUnits, overall);
//             },
//             error() {
//                 Loader.hide();
//                 frappe.msgprint('Failed to load data. Please try again.');
//             }
//         });
//     }

//     /* ── WORK PLAN: LOAD & RENDER ── */
//     function loadWorkPlan(fy) {
//         Loader.show('Loading Work Plan data…');

//         frappe.call({
//             method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args: {
//                 financial_year: fy,
//                 month: 'March',
//                 table_name_filter: 'Unit Wise Plan'
//             },
//             callback(r) {
//                 Loader.hide();
//                 if (!r.message?.length) {
//                     frappe.msgprint('No Work Plan data returned.');
//                     return;
//                 }
//                 // Find CONSOLIDATED TOTAL row
//                 const consolidated = r.message.find(d => d.settings_doc === 'CONSOLIDATED');
//                 if (!consolidated) {
//                     frappe.msgprint('Consolidated data not found.');
//                     return;
//                 }
//                 renderWpPie(consolidated);
//                 renderWpUnitPie(r.message);
//                 renderWpGrantsUnitPie(r.message);
//                 wpDataLoaded = true;
//             },
//             error() {
//                 Loader.hide();
//                 frappe.msgprint('Failed to load Work Plan data.');
//             }
//         });
//     }

//     function renderWpPie(consolidated) {
//         const actuals = consolidated.actuals || [];
//         let grantsYtd = 0;
//         let othersYtd = 0;
//         const GRANTS_NAME = 'Grants & Donations';

//         // Walk all actuals: top-level items, sub_heads items
//         actuals.forEach(actual => {
//             if (actual.sequence_id === 9999 ||
//                 actual.name === 'CAPEX TOTAL' ||
//                 actual.name === 'OPEX TOTAL' ||
//                 actual.name === 'OVERALL GRAND TOTAL') return;

//             // Check top-level items array
//             (actual.items || []).forEach(item => {
//                 if (item.name === GRANTS_NAME) {
//                     grantsYtd += (item.ytd || 0);
//                 } else {
//                     othersYtd += (item.ytd || 0);
//                 }
//             });

//             // Check sub_heads
//             (actual.sub_heads || []).forEach(sh => {
//                 (sh.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) {
//                         grantsYtd += (item.ytd || 0);
//                     } else {
//                         othersYtd += (item.ytd || 0);
//                     }
//                 });
//             });
//         });

//         const total = grantsYtd + othersYtd;
//         const grantsPct = total > 0 ? ((grantsYtd / total) * 100).toFixed(1) : '0.0';
//         const othersPct = total > 0 ? ((othersYtd / total) * 100).toFixed(1) : '0.0';

//         // Update summary cards
//         $('#bd-wp-pie-total').text(fmtCr(total));
//         $('#bd-wp-pie-total-card').text(fmtINR(total));
//         $('#bd-wp-grants-val').text(fmtINR(grantsYtd));
//         $('#bd-wp-grants-pct').text(grantsPct + '% of total');
//         $('#bd-wp-others-val').text(fmtINR(othersYtd));
//         $('#bd-wp-others-pct').text(othersPct + '% of total');

//         // No separate legend - values shown on slices

//         // Destroy existing chart
//         if (wpPieChart) { wpPieChart.destroy(); wpPieChart = null; }

//         // Use Chart.js with custom afterDraw plugin for slice labels
//         const wpCanvas = document.getElementById('bd-wp-pie');
//         wpPieChart = new Chart(wpCanvas, {
//             type: 'pie',
//             data: {
//                 labels: ['Grants & Donations', 'Direct Work'],
//                 datasets: [{
//                     data: [Math.round(grantsYtd), Math.round(othersYtd)],
//                     backgroundColor: ['#378ADD', '#F5A623'],
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'sliceLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const tot = vals.reduce((a, b) => a + b, 0);
//                     ctx.save();
//                     ds.forEach((arc, i) => {
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         const r = arc.outerRadius * 0.65;
//                         const x = arc.x + Math.cos(angle) * r;
//                         const y = arc.y + Math.sin(angle) * r;
//                         ctx.fillStyle = '#fff';
//                         ctx.font = 'bold 14px sans-serif';
//                         ctx.textAlign = 'center';
//                         ctx.textBaseline = 'middle';
//                         ctx.fillText(fmtCr(vals[i]), x, y);
//                     });
//                     ctx.restore();
//                 }
//             }]
//         });
//     }

//     /* ── WORK PLAN: UNIT-WISE PIE ── */
//     function renderWpUnitPie(message) {
//         const PALETTE_WP = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GRANTS_NAME = 'Grants & Donations';

//         // Helper: get Direct Work ytd for a unit
//         // = GRAND TOTAL ytd minus all Grants & Donations items ytd
//         function getDirectWork(u) {
//             const gt = (u.actuals || []).find(a => a.sequence_id === 9999);
//             const grandTotal = gt ? (gt.ytd || 0) : 0;
//             let grantsAmt = 0;
//             (u.actuals || []).forEach(actual => {
//                 if (actual.sequence_id === 9999) return;
//                 (actual.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) grantsAmt += (item.ytd || 0);
//                 });
//                 (actual.sub_heads || []).forEach(sh => {
//                     (sh.items || []).forEach(item => {
//                         if (item.name === GRANTS_NAME) grantsAmt += (item.ytd || 0);
//                     });
//                 });
//             });
//             return grandTotal - grantsAmt;
//         }

//         // All MAIN units sorted by sequence_id, exclude CONSOLIDATED and sub items
//         const units = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const labels = [];
//         const values = [];
//         const colors = [];
//         let colorIdx = 0;

//         units.forEach(u => {
//             const directWork = getDirectWork(u);
//             if (!directWork || directWork <= 0) return; // skip zero
//             labels.push((u.label || '').trim());
//             values.push(Math.round(directWork));
//             colors.push(PALETTE_WP[colorIdx % PALETTE_WP.length]);
//             colorIdx++;
//         });

//         const total = values.reduce((s, v) => s + v, 0);
//         $('#bd-wp-unit-pie-total').text(fmtCr(total));

//         // Legend
//         const $leg = $('#bd-wp-unit-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl} — ${pct}%
//                 </span>
//             `);
//         });

//         if (wpUnitPieChart) { wpUnitPieChart.destroy(); wpUnitPieChart = null; }
//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         if (!values.length) return;

//         wpUnitPieChart = new Chart(document.getElementById('bd-wp-unit-pie'), {
//             type: 'pie',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 layout: { padding: { top: 16, bottom: 16, left: 16, right: 16 } },
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'unitSliceLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds   = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const lbls = data.labels;
//                     const tot  = vals.reduce((a, b) => a + b, 0);
//                     if (!tot || !ds.length) return;

//                     const cx     = ds[0].x;
//                     const cy     = ds[0].y;
//                     const outerR = ds[0].outerRadius;
//                     const W      = chart.width;
//                     const H      = chart.height;

//                     // How far the pointer goes out from the pie
//                     const BEND_R    = outerR * 1.18;
//                     // Vertical gap between stacked labels
//                     const LABEL_GAP = 36;
//                     // Horizontal label column x (fixed distance from canvas edge)
//                     const COL_PAD   = 14;
//                     const COL_R     = W - COL_PAD;   // right column x (text right-aligned)
//                     const COL_L     = COL_PAD;        // left column x (text left-aligned)

//                     // ── Build items ──────────────────────────────────────────
//                     const items = [];
//                     ds.forEach((arc, i) => {
//                         if (!vals[i]) return;
//                         const pct   = (vals[i] / tot) * 100;
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         items.push({
//                             i, arc, angle, pct,
//                             name:    (lbls[i] || '').trim(),
//                             valTxt:  fmtCr(vals[i]),
//                             pctTxt:  pct.toFixed(1) + '%',
//                             isRight: Math.cos(angle) >= 0
//                         });
//                     });

//                     // ── De-overlap labels on each side ───────────────────────
//                     function deOverlap(group) {
//                         // ideal Y = sine projection to bend circle
//                         group.forEach(d => { d.y = cy + Math.sin(d.angle) * BEND_R; });
//                         group.sort((a, b) => a.y - b.y);

//                         // Clamp into canvas vertically
//                         const TOP_PAD = 18, BOT_PAD = 18;
//                         group.forEach(d => {
//                             d.y = Math.max(TOP_PAD, Math.min(H - BOT_PAD, d.y));
//                         });

//                         // Push apart — multiple sweeps
//                         for (let pass = 0; pass < 20; pass++) {
//                             // top-down
//                             for (let j = 1; j < group.length; j++) {
//                                 const gap = group[j].y - group[j-1].y;
//                                 if (gap < LABEL_GAP) {
//                                     const shift = (LABEL_GAP - gap) / 2;
//                                     group[j-1].y -= shift;
//                                     group[j].y   += shift;
//                                 }
//                             }
//                             // bottom-up
//                             for (let j = group.length - 2; j >= 0; j--) {
//                                 const gap = group[j+1].y - group[j].y;
//                                 if (gap < LABEL_GAP) {
//                                     const shift = (LABEL_GAP - gap) / 2;
//                                     group[j].y   -= shift;
//                                     group[j+1].y += shift;
//                                 }
//                             }
//                             // re-clamp
//                             group.forEach(d => {
//                                 d.y = Math.max(TOP_PAD, Math.min(H - BOT_PAD, d.y));
//                             });
//                         }
//                     }

//                     const right = items.filter(d =>  d.isRight);
//                     const left  = items.filter(d => !d.isRight);
//                     deOverlap(right);
//                     deOverlap(left);

//                     // ── Draw ─────────────────────────────────────────────────
//                     ctx.save();

//                     items.forEach(d => {
//                         // % inside large slices
//                         if (d.pct >= 7) {
//                             const rIn = outerR * 0.62;
//                             const xi  = cx + Math.cos(d.angle) * rIn;
//                             const yi  = cy + Math.sin(d.angle) * rIn;
//                             ctx.save();
//                             ctx.shadowColor = 'rgba(0,0,0,0.65)';
//                             ctx.shadowBlur  = 4;
//                             ctx.fillStyle   = '#fff';
//                             ctx.font        = 'bold 12px sans-serif';
//                             ctx.textAlign   = 'center';
//                             ctx.textBaseline = 'middle';
//                             ctx.fillText(d.pctTxt, xi, yi);
//                             ctx.restore();
//                         }

//                         // Connector: pie edge → bend point → horizontal to label
//                         const px1 = cx + Math.cos(d.angle) * (outerR + 4);
//                         const py1 = cy + Math.sin(d.angle) * (outerR + 4);
//                         const px2 = cx + Math.cos(d.angle) * BEND_R;
//                         const py2 = cy + Math.sin(d.angle) * BEND_R;
//                         const colX   = d.isRight ? COL_R : COL_L;
//                         const textX  = d.isRight ? COL_R : COL_L;
//                         // Horizontal segment ends near text
//                         const px3 = d.isRight ? colX - 60 : colX + 60;
//                         const py3 = d.y;

//                         ctx.strokeStyle = '#c0c0c0';
//                         ctx.lineWidth   = 1;
//                         ctx.beginPath();
//                         ctx.moveTo(px1, py1);
//                         ctx.lineTo(px2, py2);
//                         ctx.lineTo(px3, py3);
//                         ctx.stroke();

//                         // Dot at bend
//                         ctx.fillStyle = '#c0c0c0';
//                         ctx.beginPath();
//                         ctx.arc(px2, py2, 2, 0, Math.PI * 2);
//                         ctx.fill();

//                         // Text block (right-aligned on right side, left-aligned on left)
//                         ctx.textBaseline = 'middle';
//                         const align = d.isRight ? 'right' : 'left';
//                         ctx.textAlign   = align;

//                         ctx.fillStyle = '#111';
//                         ctx.font      = 'bold 12px sans-serif';
//                         ctx.fillText(d.name, px3, d.y - 9);

//                         ctx.fillStyle = '#444';
//                         ctx.font      = '600 11px sans-serif';
//                         ctx.fillText(d.valTxt, px3, d.y + 4);

//                         ctx.fillStyle = '#888';
//                         ctx.font      = '500 10px sans-serif';
//                         ctx.fillText(d.pctTxt, px3, d.y + 16);
//                     });

//                     ctx.restore();
//                 }
//             }]

//         });
//     }

//     /* ── WORK PLAN: GRANTS & DONATIONS UNIT PIE ── */
//     function renderWpGrantsUnitPie(message) {
//         const PALETTE_WP = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GRANTS_NAME = 'Grants & Donations';

//         function getGrantsAmt(u) {
//             let amt = 0;
//             (u.actuals || []).forEach(actual => {
//                 if (actual.sequence_id === 9999) return;
//                 (actual.items || []).forEach(item => {
//                     if (item.name === GRANTS_NAME) amt += (item.ytd || 0);
//                 });
//                 (actual.sub_heads || []).forEach(sh => {
//                     (sh.items || []).forEach(item => {
//                         if (item.name === GRANTS_NAME) amt += (item.ytd || 0);
//                     });
//                 });
//             });
//             return amt;
//         }

//         const units = message
//             .filter(d => d.settings_doc !== 'CONSOLIDATED' && d.is_this_sub_item === 0)
//             .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0));

//         const labels = [];
//         const values = [];
//         const colors = [];
//         let colorIdx = 0;

//         units.forEach(u => {
//             const grants = getGrantsAmt(u);
//             if (!grants || grants <= 0) return;
//             labels.push((u.label || '').trim());
//             values.push(Math.round(grants));
//             colors.push(PALETTE_WP[colorIdx % PALETTE_WP.length]);
//             colorIdx++;
//         });

//         const total = values.reduce((s, v) => s + v, 0);
//         $('#bd-wp-grants-unit-total').text(fmtCr(total));

//         const $leg = $('#bd-wp-grants-unit-legend').empty();
//         labels.forEach((lbl, i) => {
//             const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
//             $leg.append(`
//                 <span class="bd-legend-item">
//                     <span class="bd-legend-dot" style="background:${colors[i]};"></span>
//                     ${lbl} — ${pct}%
//                 </span>
//             `);
//         });

//         if (wpGrantsUnitPieChart) { wpGrantsUnitPieChart.destroy(); wpGrantsUnitPieChart = null; }
//         if (!values.length) return;

//         wpGrantsUnitPieChart = new Chart(document.getElementById('bd-wp-grants-unit-pie'), {
//             type: 'pie',
//             data: {
//                 labels,
//                 datasets: [{
//                     data: values,
//                     backgroundColor: colors,
//                     borderWidth: 3,
//                     borderColor: '#fff',
//                     hoverOffset: 6
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 layout: { padding: { top: 16, bottom: 16, left: 16, right: 16 } },
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: ctx => {
//                                 const pct = total > 0
//                                     ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
//                                 return ` ${ctx.label}: ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                             }
//                         }
//                     }
//                 }
//             },
//             plugins: [{
//                 id: 'grantsSliceLabels',
//                 afterDraw(chart) {
//                     const { ctx, data } = chart;
//                     const ds   = chart.getDatasetMeta(0).data;
//                     const vals = data.datasets[0].data;
//                     const lbls = data.labels;
//                     const tot  = vals.reduce((a, b) => a + b, 0);
//                     if (!tot || !ds.length) return;

//                     const cx     = ds[0].x;
//                     const cy     = ds[0].y;
//                     const outerR = ds[0].outerRadius;
//                     const W      = chart.width;
//                     const H      = chart.height;

//                     // How far the pointer goes out from the pie
//                     const BEND_R    = outerR * 1.18;
//                     // Vertical gap between stacked labels
//                     const LABEL_GAP = 36;
//                     // Horizontal label column x (fixed distance from canvas edge)
//                     const COL_PAD   = 14;
//                     const COL_R     = W - COL_PAD;   // right column x (text right-aligned)
//                     const COL_L     = COL_PAD;        // left column x (text left-aligned)

//                     // ── Build items ──────────────────────────────────────────
//                     const items = [];
//                     ds.forEach((arc, i) => {
//                         if (!vals[i]) return;
//                         const pct   = (vals[i] / tot) * 100;
//                         const angle = (arc.startAngle + arc.endAngle) / 2;
//                         items.push({
//                             i, arc, angle, pct,
//                             name:    (lbls[i] || '').trim(),
//                             valTxt:  fmtCr(vals[i]),
//                             pctTxt:  pct.toFixed(1) + '%',
//                             isRight: Math.cos(angle) >= 0
//                         });
//                     });

//                     // ── De-overlap labels on each side ───────────────────────
//                     function deOverlap(group) {
//                         // ideal Y = sine projection to bend circle
//                         group.forEach(d => { d.y = cy + Math.sin(d.angle) * BEND_R; });
//                         group.sort((a, b) => a.y - b.y);

//                         // Clamp into canvas vertically
//                         const TOP_PAD = 18, BOT_PAD = 18;
//                         group.forEach(d => {
//                             d.y = Math.max(TOP_PAD, Math.min(H - BOT_PAD, d.y));
//                         });

//                         // Push apart — multiple sweeps
//                         for (let pass = 0; pass < 20; pass++) {
//                             // top-down
//                             for (let j = 1; j < group.length; j++) {
//                                 const gap = group[j].y - group[j-1].y;
//                                 if (gap < LABEL_GAP) {
//                                     const shift = (LABEL_GAP - gap) / 2;
//                                     group[j-1].y -= shift;
//                                     group[j].y   += shift;
//                                 }
//                             }
//                             // bottom-up
//                             for (let j = group.length - 2; j >= 0; j--) {
//                                 const gap = group[j+1].y - group[j].y;
//                                 if (gap < LABEL_GAP) {
//                                     const shift = (LABEL_GAP - gap) / 2;
//                                     group[j].y   -= shift;
//                                     group[j+1].y += shift;
//                                 }
//                             }
//                             // re-clamp
//                             group.forEach(d => {
//                                 d.y = Math.max(TOP_PAD, Math.min(H - BOT_PAD, d.y));
//                             });
//                         }
//                     }

//                     const right = items.filter(d =>  d.isRight);
//                     const left  = items.filter(d => !d.isRight);
//                     deOverlap(right);
//                     deOverlap(left);

//                     // ── Draw ─────────────────────────────────────────────────
//                     ctx.save();

//                     items.forEach(d => {
//                         // % inside large slices
//                         if (d.pct >= 7) {
//                             const rIn = outerR * 0.62;
//                             const xi  = cx + Math.cos(d.angle) * rIn;
//                             const yi  = cy + Math.sin(d.angle) * rIn;
//                             ctx.save();
//                             ctx.shadowColor = 'rgba(0,0,0,0.65)';
//                             ctx.shadowBlur  = 4;
//                             ctx.fillStyle   = '#fff';
//                             ctx.font        = 'bold 12px sans-serif';
//                             ctx.textAlign   = 'center';
//                             ctx.textBaseline = 'middle';
//                             ctx.fillText(d.pctTxt, xi, yi);
//                             ctx.restore();
//                         }

//                         // Connector: pie edge → bend point → horizontal to label
//                         const px1 = cx + Math.cos(d.angle) * (outerR + 4);
//                         const py1 = cy + Math.sin(d.angle) * (outerR + 4);
//                         const px2 = cx + Math.cos(d.angle) * BEND_R;
//                         const py2 = cy + Math.sin(d.angle) * BEND_R;
//                         const colX   = d.isRight ? COL_R : COL_L;
//                         const textX  = d.isRight ? COL_R : COL_L;
//                         // Horizontal segment ends near text
//                         const px3 = d.isRight ? colX - 60 : colX + 60;
//                         const py3 = d.y;

//                         ctx.strokeStyle = '#c0c0c0';
//                         ctx.lineWidth   = 1;
//                         ctx.beginPath();
//                         ctx.moveTo(px1, py1);
//                         ctx.lineTo(px2, py2);
//                         ctx.lineTo(px3, py3);
//                         ctx.stroke();

//                         // Dot at bend
//                         ctx.fillStyle = '#c0c0c0';
//                         ctx.beginPath();
//                         ctx.arc(px2, py2, 2, 0, Math.PI * 2);
//                         ctx.fill();

//                         // Text block (right-aligned on right side, left-aligned on left)
//                         ctx.textBaseline = 'middle';
//                         const align = d.isRight ? 'right' : 'left';
//                         ctx.textAlign   = align;

//                         ctx.fillStyle = '#111';
//                         ctx.font      = 'bold 12px sans-serif';
//                         ctx.fillText(d.name, px3, d.y - 9);

//                         ctx.fillStyle = '#444';
//                         ctx.font      = '600 11px sans-serif';
//                         ctx.fillText(d.valTxt, px3, d.y + 4);

//                         ctx.fillStyle = '#888';
//                         ctx.font      = '500 10px sans-serif';
//                         ctx.fillText(d.pctTxt, px3, d.y + 16);
//                     });

//                     ctx.restore();
//                 }
//             }]

//         });
//     }

//     /* ── RESIZE ── */
//     let resizeTimer;
//     $(window).on('resize.bd', function () {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(() => {
//             if (donutChart) donutChart.resize();
//             if (wpPieChart) wpPieChart.resize();
//             if (wpUnitPieChart) wpUnitPieChart.resize();
//             if (wpGrantsUnitPieChart) wpGrantsUnitPieChart.resize();
//         }, 200);
//     });
//     $(wrapper).on('hide', function () { $(window).off('resize.bd'); });

//     /* ── CHART.JS ── */
//     if (!window.Chart) {
//         const s = document.createElement('script');
//         s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         document.head.appendChild(s);
//     }

//     /* ── GLOBAL LOADER ── */
//     if (!$('#global-loader').length) {
//         $('body').append(
//             '<div id="global-loader" class="loader-overlay">' +
//             '<div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt="">' +
//             '<div class="loader-text">Loading, please wait</div></div></div>'
//         );
//     }
//     $('#global-loader').hide();

//     var Loader = {
//         show: function (msg) {
//             var $l = $('#global-loader');
//             $l.find('.loader-text').text(msg || 'Loading, please wait');
//             $l.css('display', 'flex').hide().fadeIn(200);
//         },
//         hide: function () { $('#global-loader').fadeOut(200); }
//     };
// };