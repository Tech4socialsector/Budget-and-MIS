frappe.pages['phase-sheet'].on_page_load = function (wrapper) {
	let page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Phase Sheet',
		single_column: true
	});

	/* ---------- Styles ---------- */
	const style = `
	<style>
		#tables-container {
			margin: 20px;
			background-color: #ffffff;
			border-radius: 8px;
			padding: 0;
			border: 1px solid #ccc;
			box-shadow: 0 2px 6px rgba(0,0,0,0.05);
			overflow: hidden;
		}
		h2.table-title {
			color: #0076B6;
			font-size: 20px;
			font-weight: 700;
			margin: 0;
			padding: 16px 20px 10px;
			border-bottom: 1px solid #e5e5e5;
			background-color: #f8fafc;
		}
		.toolbar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			background-color: #f8fafc;
			padding: 10px 20px;
			border-bottom: 1px solid #e5e5e5;
			flex-wrap: wrap;
			gap: 10px;
		}
		.search-group {
			display: flex;
			align-items: center;
			gap: 8px;
			flex: 1;
			min-width: 300px;
		}
		.search-group input {
			flex: 1;
			padding: 6px 10px;
			border: 1px solid #ccc;
			border-radius: 6px;
			font-size: 13px;
		}
		.toggle-group {
			display: flex;
			gap: 20px;
			align-items: center;
			font-size: 13px;
		}
		.scroll-wrapper {
			overflow-x: auto;
			max-height: 70vh;
		}
		table.university-table {
			min-width: 1500px;
			width: 100%;
			border-collapse: collapse;
			font-size: 13px;
			text-align: center;
			color: #111;
		}
		table.university-table th, table.university-table td {
			border: 1px solid #ddd;
			padding: 8px 10px;
			white-space: nowrap;
		}
		.main-row th {
			background-color: #0076B6;
			color: #fff;
			position: sticky;
			top: 0;
			z-index: 30;
		}
		.month-row th {
			background-color: #0076B6;
			color: #fff;
			position: sticky;
			top: 34px;
			z-index: 29;
		}
		.budget-row th {
			background-color: #F26B21;
			color: #fff;
			position: sticky;
			top: 34px;
			z-index: 28;
		}
		tr.expense-head {
			background-color: #E8F4FB;
			font-weight: 600;
			cursor: pointer;
		}
	</style>`;
	$(style).appendTo(page.body);

	/* ---------- Data ---------- */
	const expense_heads = [
		{
			name: 'Capital Expenses',
			q1: [6000, 7000, 8000],
			q2: [4000, 5000, 6000],
			q3: [5000, 6000, 7000],
			q4: [8000, 9000, 10000],
			items: [
				{ name: 'Faculty Salaries', gl_code: '74001', q1: [2000, 2500, 3000], q2: [1000, 1500, 2000], q3: [1500, 2000, 2500], q4: [3000, 3500, 4000] },
				{ name: 'Fuel Cost', gl_code: '74002', q1: [1000, 1200, 1500], q2: [900, 1000, 1100], q3: [1200, 1300, 1400], q4: [1500, 1600, 1700] }
			]
		}
	];

	const quarters = {
		q1: { label: 'Quarter 1', months: ['March', 'April', 'May'] },
		q2: { label: 'Quarter 2', months: ['June', 'July', 'August'] },
		q3: { label: 'Quarter 3', months: ['September', 'October', 'November'] },
		q4: { label: 'Quarter 4', months: ['December', 'January', 'February'] }
	};

	let expandedHeads = [];
	let expandedQuarters = [];

	const container = $(`
	<div id="tables-container">
		<h2 class="table-title">Phase Sheet Summary</h2>
		<div class="toolbar">
			<div class="search-group">
				<i>🔍</i>
				<input type="text" id="searchInput" placeholder="Search...">
			</div>
			<div class="toggle-group">
				<label><input type="checkbox" id="toggleExpenses"> Expand All Expenses</label>
				<label><input type="checkbox" id="toggleQuarters"> Expand All Quarters</label>
			</div>
		</div>
		<div class="scroll-wrapper">
			<table class="university-table" id="phase-table"></table>
		</div>
	</div>`);
	$(page.body).append(container);

	function format(n){return n.toLocaleString();}

	function renderTable(){
		const $table = $('#phase-table');
		$table.empty();

		const $thead = $('<thead></thead>');
		const $mainRow = $('<tr class="main-row"></tr>');
		const $monthRow = $('<tr class="month-row"></tr>');
		const $budgetRow = $('<tr class="budget-row"></tr>');

		$mainRow.append('<th rowspan="3">Expense Head / Line Item</th>');
		$mainRow.append('<th rowspan="3">GL Code</th>');

		['q1','q2','q3','q4'].forEach(q=>{
			const expanded = expandedQuarters.includes(q);
			const arrow = expanded?'▲':'▼';

			if(expanded){
				$mainRow.append(`<th class="expandable" data-q="${q}" colspan="6">${quarters[q].label} ${arrow}</th>`);
				quarters[q].months.forEach(m=>{
					$monthRow.append(`<th colspan="2">${m}</th>`);
					$budgetRow.append(`<th>Budget</th><th>Actual</th>`);
				});
			} else {
				$mainRow.append(`<th class="expandable" data-q="${q}" colspan="2">${quarters[q].label} ${arrow}</th>`);
				$monthRow.append(`<th colspan="2"></th>`);
				$budgetRow.append(`<th>Budget</th><th>Actual</th>`);
			}
		});

		$mainRow.append('<th rowspan="3">Total</th>');

		$thead.append($mainRow);
		if(expandedQuarters.length > 0){ $thead.append($monthRow); }
		$thead.append($budgetRow);
		$table.append($thead);

		const $tbody = $('<tbody></tbody>');
		expense_heads.forEach(head=>{
			const headRow = $(`<tr class="expense-head" data-head="${head.name}"></tr>`);
			headRow.append(`<td>${expandedHeads.includes(head.name)?'▼':'▶'} ${head.name}</td>`);
			headRow.append('<td>-</td>');

			let total = 0;
			['q1','q2','q3','q4'].forEach(q=>{
				if(expandedQuarters.includes(q)){
					head[q].forEach(v=>{
						headRow.append(`<td>${format(v)}</td><td>0</td>`);
						total+=v;
					});
				}else{
					const sum = head[q].reduce((a,b)=>a+b,0);
					headRow.append(`<td>${format(sum)}</td><td>0</td>`);
					total+=sum;
				}
			});
			headRow.append(`<td>${format(total)}</td>`);
			$tbody.append(headRow);

			if(expandedHeads.includes(head.name)){
				head.items.forEach(item=>{
					const itemRow = $('<tr class="line-item"></tr>');
					itemRow.append(`<td>${item.name}</td>`);
					itemRow.append(`<td>${item.gl_code}</td>`);

					let total2 = 0;
					['q1','q2','q3','q4'].forEach(q=>{
						if(expandedQuarters.includes(q)){
							item[q].forEach(v=>{
								itemRow.append(`<td>${format(v)}</td><td>0</td>`);
								total2+=v;
							});
						}else{
							const sum = item[q].reduce((a,b)=>a+b,0);
							itemRow.append(`<td>${format(sum)}</td><td>0</td>`);
							total2+=sum;
						}
					});
					itemRow.append(`<td>${format(total2)}</td>`);
					$tbody.append(itemRow);
				});
			}
		});

		$table.append($tbody);

		$('th.expandable').off().on('click',function(){
			const q=$(this).data('q');
			expandedQuarters = expandedQuarters.includes(q) ? expandedQuarters.filter(x=>x!==q) : [...expandedQuarters,q];
			renderTable();
		});

		$('.expense-head').off().on('click',function(){
			const h=$(this).data('head');
			expandedHeads = expandedHeads.includes(h) ? expandedHeads.filter(x=>x!==h) : [...expandedHeads,h];
			renderTable();
		});

		$('#toggleExpenses').off().on('change',function(){
			expandedHeads = this.checked ? expense_heads.map(h=>h.name) : [];
			renderTable();
		});

		$('#toggleQuarters').off().on('change',function(){
			expandedQuarters = this.checked ? Object.keys(quarters) : [];
			renderTable();
		});
	}

	renderTable();
};




// old one
// frappe.pages['phase-sheet'].on_page_load = function (wrapper) {
// 	let page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Phase Sheet',
// 		single_column: true
// 	});

// 	/* ---------- Styles ---------- */
// 	const style = `
// 	<style>
// 		#tables-container {
// 			margin: 20px;
// 			background-color: #ffffff;
// 			border-radius: 8px;
// 			padding: 0;
// 			border: 1px solid #ccc;
// 			box-shadow: 0 2px 6px rgba(0,0,0,0.05);
// 			overflow: hidden;
// 		}
// 		h2.table-title {
// 			color: #0076B6;
// 			font-size: 20px;
// 			font-weight: 700;
// 			margin: 0;
// 			padding: 16px 20px 10px;
// 			border-bottom: 1px solid #e5e5e5;
// 			background-color: #f8fafc;
// 		}
// 		.toolbar {
// 			display: flex;
// 			align-items: center;
// 			justify-content: space-between;
// 			background-color: #f8fafc;
// 			padding: 10px 20px;
// 			border-bottom: 1px solid #e5e5e5;
// 			flex-wrap: wrap;
// 			gap: 10px;
// 		}
// 		.search-group {
// 			display: flex;
// 			align-items: center;
// 			gap: 8px;
// 			flex: 1;
// 			min-width: 300px;
// 		}
// 		.search-group input {
// 			flex: 1;
// 			padding: 6px 10px;
// 			border: 1px solid #ccc;
// 			border-radius: 6px;
// 			font-size: 13px;
// 		}
// 		.toggle-group {
// 			display: flex;
// 			gap: 20px;
// 			align-items: center;
// 			font-size: 13px;
// 		}
// 		.scroll-wrapper {
// 			overflow-x: auto;
// 			max-height: 70vh;
// 		}
// 		table.university-table {
// 			min-width: 1500px;
// 			width: 100%;
// 			border-collapse: collapse;
// 			font-size: 13px;
// 			color: #111;
// 			text-align: center;
// 		}
// 		table.university-table th, table.university-table td {
// 			border: 1px solid #ddd;
// 			padding: 8px 10px;
// 			white-space: nowrap;
// 		}

// 		/* ✅ Left align first column (Expense heads & Item names) */
// 		table.university-table td:first-child,
// 		table.university-table th:first-child {
// 			text-align: left !important;
// 			padding-left: 12px !important;
// 		}

// 		.main-row th {
// 			background-color: #0076B6;
// 			color: #fff;
// 			position: sticky;
// 			top: 0;
// 			z-index: 30;
// 		}
// 		.month-row th, .budget-row th {
// 			background-color: #0076B6;
// 			color: #fff;
// 			position: sticky;
// 			top: 34px;
// 			z-index: 29;
// 		}
// 		.budget-row th {
// 			background-color: #F26B21;
// 			z-index: 28;
// 		}
// 		tr.expense-head {
// 			background-color: #E8F4FB;
// 			font-weight: 600;
// 			cursor: pointer;
// 		}
// 	</style>`;
// 	$(style).appendTo(page.body);

// 	/* ---------- Data Variables ---------- */
// 	let expense_heads = []; // data from API

// 	const quarters = {
// 		q1: { label: 'Quarter 1', months: ['March', 'April', 'May'] },
// 		q2: { label: 'Quarter 2', months: ['June', 'July', 'August'] },
// 		q3: { label: 'Quarter 3', months: ['September', 'October', 'November'] },
// 		q4: { label: 'Quarter 4', months: ['December', 'January', 'February'] }
// 	};

// 	let expandedHeads = [];
// 	let expandedQuarters = [];

// 	/* UI Container */
// 	const container = $(`
// 	<div id="tables-container">
// 		<h2 class="table-title">Phase Sheet Summary</h2>
// 		<div class="toolbar">
// 			<div class="search-group">
// 				<i>🔍</i>
// 				<input type="text" id="searchInput" placeholder="Search...">
// 			</div>
// 			<div class="toggle-group">
// 				<label><input type="checkbox" id="toggleExpenses"> Expand All Expenses</label>
// 				<label><input type="checkbox" id="toggleQuarters"> Expand All Quarters</label>
// 			</div>
// 		</div>
// 		<div class="scroll-wrapper">
// 			<table class="university-table" id="phase-table"></table>
// 		</div>
// 	</div>`);
// 	$(page.body).append(container);

// 	function format(n){return n.toLocaleString();}

// 	/* ---------- FETCH DATA ---------- */
// 	function loadData() {
// 		frappe.call({
// 			method: "annual_budget.api.phase_sheet.get_consolidated_report",
// 			args: {
// 				financial_year: "2025-26",
// 				units: "APUMP"
// 			},
// 			callback: function (r) {
// 				if(r.message) {
// 					expense_heads = r.message;
// 					renderTable();
// 				}
// 			}
// 		});
// 	}

// 	/* ---------- RENDER TABLE ---------- */
// 	function renderTable(){
// 		const $table = $('#phase-table');
// 		$table.empty();

// 		const $thead = $('<thead></thead>');
// 		const $mainRow = $('<tr class="main-row"></tr>');
// 		const $monthRow = $('<tr class="month-row"></tr>');
// 		const $budgetRow = $('<tr class="budget-row"></tr>');

// 		$mainRow.append('<th rowspan="3">Expense Head / Line Item</th>');
// 		$mainRow.append('<th rowspan="3">GL Code</th>');

// 		['q1','q2','q3','q4'].forEach(q=>{
// 			const expanded = expandedQuarters.includes(q);
// 			const arrow = expanded?'▲':'▼';

// 			if(expanded){
// 				$mainRow.append(`<th class="expandable" data-q="${q}" colspan="6">${quarters[q].label} ${arrow}</th>`);
// 				quarters[q].months.forEach(m=>{
// 					$monthRow.append(`<th colspan="2">${m}</th>`);
// 					$budgetRow.append(`<th>Budget</th><th>Actual</th>`);
// 				});
// 			} else {
// 				const sumLabel = quarters[q].label;
// 				$mainRow.append(`<th class="expandable" data-q="${q}" colspan="2">${sumLabel} ${arrow}</th>`);
// 				$monthRow.append(`<th colspan="2"></th>`);
// 				$budgetRow.append(`<th>Budget</th><th>Actual</th>`);
// 			}
// 		});

// 		$mainRow.append('<th rowspan="3">Total</th>');
// 		$thead.append($mainRow);
// 		if(expandedQuarters.length > 0){ $thead.append($monthRow); }
// 		$thead.append($budgetRow);
// 		$table.append($thead);

// 		const $tbody = $('<tbody></tbody>');
// 		expense_heads.forEach(head=>{
// 			const headRow = $(`<tr class="expense-head" data-head="${head.name}"></tr>`);
// 			headRow.append(`<td>${expandedHeads.includes(head.name)?'▼':'▶'} ${head.name}</td>`);
// 			headRow.append('<td>-</td>');

// 			let total = 0;
// 			['q1','q2','q3','q4'].forEach(q=>{
// 				if(expandedQuarters.includes(q)){
// 					head[q].forEach(v=>{
// 						headRow.append(`<td>${format(v)}</td><td>0</td>`);
// 						total+=v;
// 					});
// 				}else{
// 					const sum = head[q].reduce((a,b)=>a+b,0);
// 					headRow.append(`<td>${format(sum)}</td><td>0</td>`);
// 					total+=sum;
// 				}
// 			});
// 			headRow.append(`<td>${format(total)}</td>`);
// 			$tbody.append(headRow);

// 			if(expandedHeads.includes(head.name)){
// 				head.items.forEach(item=>{
// 					const itemRow = $('<tr class="line-item"></tr>');
// 					itemRow.append(`<td>${item.name}</td>`);
// 					itemRow.append(`<td>${item.gl_code}</td>`);

// 					let total2 = 0;
// 					['q1','q2','q3','q4'].forEach(q=>{
// 						if(expandedQuarters.includes(q)){
// 							item[q].forEach(v=>{
// 								itemRow.append(`<td>${format(v)}</td><td>0</td>`);
// 								total2+=v;
// 							});
// 						}else{
// 							const sum = item[q].reduce((a,b)=>a+b,0);
// 							itemRow.append(`<td>${format(sum)}</td><td>0</td>`);
// 							total2+=sum;
// 						}
// 					});
// 					itemRow.append(`<td>${format(total2)}</td>`);
// 					$tbody.append(itemRow);
// 				});
// 			}
// 		});

// 		$table.append($tbody);

// 		/* Toggle Expand */
// 		$('th.expandable').off().on('click',function(){
// 			const q=$(this).data('q');
// 			expandedQuarters = expandedQuarters.includes(q) ? expandedQuarters.filter(x=>x!==q) : [...expandedQuarters,q];
// 			renderTable();
// 		});

// 		$('.expense-head').off().on('click',function(){
// 			const h=$(this).data('head');
// 			expandedHeads = expandedHeads.includes(h) ? expandedHeads.filter(x=>x!==h) : [...expandedHeads,h];
// 			renderTable();
// 		});

// 		$('#toggleExpenses').off().on('change',function(){
// 			expandedHeads = this.checked ? expense_heads.map(h=>h.name) : [];
// 			renderTable();
// 		});

// 		$('#toggleQuarters').off().on('change',function(){
// 			expandedQuarters = this.checked ? Object.keys(quarters) : [];
// 			renderTable();
// 		});

// 		/* ✅ Search Working */
// 		$('#searchInput').off().on('keyup', function () {
// 			const value = $(this).val().toLowerCase();
// 			$("#phase-table tbody tr").filter(function () {
// 				$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
// 			});
// 		});
// 	}

// 	/* LOAD DATA */
// 	loadData();
// };

// midium one
// frappe.pages['phase-sheet'].on_page_load = function (wrapper) {
// 	let page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Phase Sheet',
// 		single_column: true
// 	});

// 	/* ---------- Styles ---------- */
// 	const style = `
// 	<style>
// 		#tables-container {
// 			margin: 20px;
// 			background-color: #ffffff;
// 			border-radius: 8px;
// 			padding: 0;
// 			border: 1px solid #ccc;
// 			box-shadow: 0 2px 6px rgba(0,0,0,0.05);
// 			overflow: hidden;
// 		}
// 		h2.table-title {
// 			color: #0076B6;
// 			font-size: 20px;
// 			font-weight: 700;
// 			margin: 0;
// 			padding: 16px 20px 10px;
// 			border-bottom: 1px solid #e5e5e5;
// 			background-color: #f8fafc;
// 		}
// 		.toolbar {
// 			display: flex;
// 			align-items: center;
// 			justify-content: space-between;
// 			background-color: #f8fafc;
// 			padding: 10px 20px;
// 			border-bottom: 1px solid #e5e5e5;
// 			flex-wrap: wrap;
// 			gap: 10px;
// 		}
// 		.search-group {
// 			display: flex;
// 			align-items: center;
// 			gap: 8px;
// 			flex: 1;
// 			min-width: 300px;
// 		}
// 		.search-group input {
// 			flex: 1;
// 			padding: 6px 10px;
// 			border: 1px solid #ccc;
// 			border-radius: 6px;
// 			font-size: 13px;
// 		}
// 		.toggle-group {
// 			display: flex;
// 			gap: 20px;
// 			align-items: center;
// 			font-size: 13px;
// 		}
// 		.scroll-wrapper {
// 			overflow-x: auto;
// 			max-height: 70vh;
// 		}
// 		table.university-table {
// 			min-width: 1500px;
// 			width: 100%;
// 			border-collapse: collapse;
// 			font-size: 13px;
// 			color: #111;
// 			text-align: center;
// 		}
// 		table.university-table th, table.university-table td {
// 			border: 1px solid #ddd;
// 			padding: 8px 10px;
// 			white-space: nowrap;
// 		}
// 		/* Left align first column (Head/Subhead/Item) */
// 		table.university-table td:first-child,
// 		table.university-table th:first-child {
// 			text-align: left !important;
// 			padding-left: 12px !important;
// 		}
// 		.main-row th {
// 			background-color: #0076B6;
// 			color: #fff;
// 			position: sticky;
// 			top: 0;
// 			z-index: 30;
// 		}
// 		.month-row th {
// 			background-color: #0076B6;
// 			color: #fff;
// 			position: sticky;
// 			top: 34px;
// 			z-index: 29;
// 		}
// 		.budget-row th {
// 			background-color: #F26B21;
// 			color: #fff;
// 			position: sticky;
// 			top: 66px;
// 			z-index: 28;
// 		}
// 		tr.head-row {
// 			background-color: #E8F4FB;
// 			font-weight: 600;
// 			cursor: pointer;
// 		}
// 		tr.subhead-row {
// 			background-color: #f4f7fb;
// 			font-weight: 600;
// 			cursor: pointer;
// 		}
// 		.muted { color: #999; font-style: italic; }
// 	</style>`;
// 	$(style).appendTo(page.body);

// 	/* ---------- State ---------- */
// 	let expense_heads = [];           // data from API
// 	let expandedHeads = [];           // expanded head/subhead names
// 	let expandedQuarters = [];        // 'q1','q2','q3','q4' that are expanded to month view

// 	/* ---------- Quarter mapping (you chose option 1) ---------- */
// 	const quarters = {
// 		q1: { label: 'Quarter 1', months: ['April', 'May', 'June'] },
// 		q2: { label: 'Quarter 2', months: ['July', 'August', 'September'] },
// 		q3: { label: 'Quarter 3', months: ['October', 'November', 'December'] },
// 		q4: { label: 'Quarter 4', months: ['January', 'February', 'March'] }
// 	};

// 	/* ---------- Layout ---------- */
// 	const container = $(`
// 	<div id="tables-container">
// 		<h2 class="table-title">Phase Sheet Summary</h2>
// 		<div class="toolbar">
// 			<div class="search-group">
// 				<i>🔍</i>
// 				<input type="text" id="searchInput" placeholder="Search by name / GL / head...">
// 			</div>
// 			<div class="toggle-group">
// 				<label><input type="checkbox" id="toggleExpenses"> Expand All Heads</label>
// 				<label><input type="checkbox" id="toggleQuarters"> Expand All Quarters</label>
// 			</div>
// 		</div>
// 		<div class="scroll-wrapper">
// 			<table class="university-table" id="phase-table"></table>
// 		</div>
// 	</div>`);
// 	$(page.body).append(container);

// 	/* ---------- Utils ---------- */
// 	function fmt(n){ return Number(n || 0).toLocaleString(); }
// 	function sum(arr){ return (arr || []).reduce((a,b)=>a + Number(b||0), 0); }
// 	function totalOfQuarters(q1,q2,q3,q4){ return sum(q1)+sum(q2)+sum(q3)+sum(q4); }

// 	/* ---------- API ---------- */
// 	function loadData() {
// 		frappe.call({
// 			method: "annual_budget.api.phase_sheet.get_consolidated_report",
// 			args: {
// 				// TODO: bind these to toolbar filters later
// 				financial_year: "2025-26",
// 				units: "APU"
// 			},
// 			callback: function (r) {
// 				expense_heads = r.message || [];
// 				renderTable();
// 			}
// 		});
// 	}

// 	/* ---------- Cell renderers ---------- */
// 	// For a given quarter, render either (Budget,Actual) 3 month pairs OR a single (Budget,Actual) quarter sum
// 	function quarterCells(entity, qkey){
// 		// budget arrays from API
// 		const arr = entity[qkey] || [0,0,0];
// 		// actuals placeholder (0 for now)
// 		const act = [0,0,0];

// 		if (expandedQuarters.includes(qkey)) {
// 			// month-wise: (Budget, Actual) for each
// 			return arr.map((v,i)=>`<td>${fmt(v)}</td><td>${fmt(act[i])}</td>`).join('');
// 		} else {
// 			// collapsed: quarter sums (Budget,Actual)
// 			return `<td>${fmt(sum(arr))}</td><td>${fmt(sum(act))}</td>`;
// 		}
// 	}

// 	function headRowHTML(head){
// 		const arrow = expandedHeads.includes(head.name) ? '▼' : '▶';
// 		const q1 = quarterCells(head,'q1');
// 		const q2 = quarterCells(head,'q2');
// 		const q3 = quarterCells(head,'q3');
// 		const q4 = quarterCells(head,'q4');
// 		const tot = fmt(totalOfQuarters(head.q1, head.q2, head.q3, head.q4));
// 		return `
// 			<tr class="head-row" data-head="${frappe.utils.escape_html(head.name)}">
// 				<td>${arrow} ${frappe.utils.escape_html(head.name)}</td>
// 				<td class="muted">-</td>
// 				${q1}${q2}${q3}${q4}
// 				<td><b>${tot}</b></td>
// 			</tr>
// 		`;
// 	}

// 	function subHeadRowHTML(headName, sub){
// 		const arrow = expandedHeads.includes(sub.name) ? '▼' : '▶';
// 		const q1 = quarterCells(sub,'q1');
// 		const q2 = quarterCells(sub,'q2');
// 		const q3 = quarterCells(sub,'q3');
// 		const q4 = quarterCells(sub,'q4');
// 		const tot = fmt(totalOfQuarters(sub.q1, sub.q2, sub.q3, sub.q4));
// 		return `
// 			<tr class="subhead-row head-${CSS.escape(headName)}" data-sub="${frappe.utils.escape_html(sub.name)}">
// 				<td style="padding-left:26px;">${arrow} ${frappe.utils.escape_html(sub.name)}</td>
// 				<td class="muted">-</td>
// 				${q1}${q2}${q3}${q4}
// 				<td><b>${tot}</b></td>
// 			</tr>
// 		`;
// 	}

// 	function itemRowHTML(parentKey, item, isSub=false){
// 		const pad = isSub ? 56 : 26;
// 		const q1 = quarterCells(item,'q1');
// 		const q2 = quarterCells(item,'q2');
// 		const q3 = quarterCells(item,'q3');
// 		const q4 = quarterCells(item,'q4');
// 		const tot = fmt(totalOfQuarters(item.q1, item.q2, item.q3, item.q4));
// 		return `
// 			<tr class="item-row ${isSub ? 'sub-' : 'head-'}${CSS.escape(parentKey)}">
// 				<td style="padding-left:${pad}px;">${frappe.utils.escape_html(item.name || '')}</td>
// 				<td>${frappe.utils.escape_html(item.gl_code || '')}</td>
// 				${q1}${q2}${q3}${q4}
// 				<td><b>${tot}</b></td>
// 			</tr>
// 		`;
// 	}

// 	/* ---------- Render ---------- */
// 	function renderTable(){
// 		const $table = $('#phase-table');
// 		$table.empty();

// 		// Build header
// 		const $thead = $('<thead></thead>');
// 		const $mainRow = $('<tr class="main-row"></tr>');
// 		const $monthRow = $('<tr class="month-row"></tr>');
// 		const $budgetRow = $('<tr class="budget-row"></tr>');

// 		$mainRow.append('<th rowspan="3">Head / Sub Head / Line Item</th>');
// 		$mainRow.append('<th rowspan="3">GL Code</th>');

// 		['q1','q2','q3','q4'].forEach(q=>{
// 			const expanded = expandedQuarters.includes(q);
// 			const arrow = expanded ? '▲' : '▼';
// 			const colSpan = expanded ? 6 : 2;
// 			$mainRow.append(`<th class="expandable" data-q="${q}" colspan="${colSpan}">${quarters[q].label} ${arrow}</th>`);

// 			if (expanded) {
// 				quarters[q].months.forEach(m=>{
// 					$monthRow.append(`<th colspan="2">${m}</th>`);
// 					$budgetRow.append(`<th>Budget</th><th>Actual</th>`);
// 				});
// 			}
// 		});

// 		$mainRow.append('<th rowspan="3">Total</th>');
// 		$thead.append($mainRow);
// 		if (expandedQuarters.length) $thead.append($monthRow);
// 		$thead.append($budgetRow);
// 		$table.append($thead);

// 		// Build body
// 		const $tbody = $('<tbody></tbody>');

// 		expense_heads.forEach(head => {
// 			$tbody.append(headRowHTML(head));

// 			// If head expanded, render children
// 			if (expandedHeads.includes(head.name)) {
// 				// OPERATING EXPENSES → subheads + items
// 				if (head.sub_heads && head.sub_heads.length) {
// 					head.sub_heads.forEach(sub => {
// 						$tbody.append(subHeadRowHTML(head.name, sub));

// 						if (expandedHeads.includes(sub.name)) {
// 							(sub.items || []).forEach(item => {
// 								$tbody.append(itemRowHTML(sub.name, item, true));
// 							});
// 						}
// 					});
// 				}
// 				// Direct item heads (Capital, Other Operating, Medical, etc.)
// 				else {
// 					(head.items || []).forEach(item => {
// 						$tbody.append(itemRowHTML(head.name, item, false));
// 					});
// 				}
// 			}
// 		});

// 		$table.append($tbody);

// 		/* ---------- Events ---------- */
// 		$('th.expandable').off('click').on('click', function(){
// 			const q = $(this).data('q');
// 			if (expandedQuarters.includes(q)) {
// 				expandedQuarters = expandedQuarters.filter(x => x !== q);
// 			} else {
// 				expandedQuarters.push(q);
// 			}
// 			renderTable();
// 		});

// 		$('.head-row').off('click').on('click', function(){
// 			const name = $(this).data('head');
// 			if (expandedHeads.includes(name)) {
// 				expandedHeads = expandedHeads.filter(x => x !== name);
// 			} else {
// 				expandedHeads.push(name);
// 			}
// 			renderTable();
// 		});

// 		$('.subhead-row').off('click').on('click', function(){
// 			const name = $(this).data('sub');
// 			if (expandedHeads.includes(name)) {
// 				expandedHeads = expandedHeads.filter(x => x !== name);
// 			} else {
// 				expandedHeads.push(name);
// 			}
// 			renderTable();
// 		});

// 		$('#toggleExpenses').off('change').on('change', function(){
// 			if (this.checked) {
// 				// expand all heads (and subheads under Operating)
// 				expandedHeads = [];
// 				expense_heads.forEach(h => {
// 					expandedHeads.push(h.name);
// 					(h.sub_heads || []).forEach(s => expandedHeads.push(s.name));
// 				});
// 			} else {
// 				expandedHeads = [];
// 			}
// 			renderTable();
// 		});

// 		$('#toggleQuarters').off('change').on('change', function(){
// 			expandedQuarters = this.checked ? ['q1','q2','q3','q4'] : [];
// 			renderTable();
// 		});

// 		$('#searchInput').off('keyup').on('keyup', function(){
// 			const val = $(this).val().toLowerCase();
// 			$("#phase-table tbody tr").each(function(){
// 				const text = $(this).text().toLowerCase();
// 				$(this).toggle(text.indexOf(val) > -1);
// 			});
// 		});
// 	}

// 	/* ---------- Go ---------- */
// 	loadData();
// };


// new one 
// frappe.pages['phase-sheet'].on_page_load = function (wrapper) {
//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Phase Sheet',
//         single_column: true
//     });

//     /* ---------- Styles ---------- */
//     const style = `
//     <style>
//         #tables-container {
//             margin: 20px;
//             background-color: #ffffff;
//             border-radius: 8px;
//             padding: 0;
//             border: 1px solid #ccc;
//             box-shadow: 0 2px 6px rgba(0,0,0,0.05);
//             overflow: hidden;
//         }
//         h2.table-title {
//             color: #0076B6;
//             font-size: 20px;
//             font-weight: 700;
//             margin: 0;
//             padding: 16px 20px 10px;
//             border-bottom: 1px solid #e5e5e5;
//             background-color: #f8fafc;
//         }
//         .toolbar {
//             display: flex;
//             align-items: center;
//             justify-content: space-between;
//             background-color: #f8fafc;
//             padding: 10px 20px;
//             border-bottom: 1px solid #e5e5e5;
//             flex-wrap: wrap;
//             gap: 10px;
//         }
//         .search-group input {
//             padding: 6px 10px;
//             border: 1px solid #ccc;
//             border-radius: 6px;
//             font-size: 13px;
//             width: 260px;
//         }
//         .toggle-group label { font-size: 13px; }

//         .scroll-wrapper {
//             overflow-x: auto;
//             max-height: 70vh;
//         }
//         table.university-table {
//             min-width: 1500px;
//             width: 100%;
//             border-collapse: collapse;
//             font-size: 13px;
//             color: #111;
//             text-align: center;
//         }
//         table.university-table th, table.university-table td {
//             border: 1px solid #ddd;
//             padding: 8px 10px;
//             white-space: nowrap;
//         }

//         /* ✅ Left align first column (Expense heads & Item names) */
//         table.university-table td:first-child,
//         table.university-table th:first-child {
//             text-align: left !important;
//             padding-left: 12px !important;
//         }

//         .main-row th { background-color: #0076B6; color: #fff; position: sticky; top: 0; z-index: 30; }
//         .month-row th { background-color: #0076B6; color: #fff; position: sticky; top: 34px; z-index: 29;}
//         .budget-row th { background-color: #F26B21; color: #fff; position: sticky; top: 66px; z-index: 28;}

//         tr.expense-head { background:#E8F4FB; font-weight:600; cursor:pointer; }
//         tr.sub-head { background:#f4f7fb; font-weight:600; cursor:pointer; }
//     </style>`;
//     $(style).appendTo(page.body);

//     /* ---------- Data Variables ---------- */
//     let expense_heads = [];
//     let expandedHeads = [];
//     let expandedQuarters = [];

//     const quarters = {
//         q1: { label: 'Quarter 1', months: ['March', 'April', 'May'] },
//         q2: { label: 'Quarter 2', months: ['June', 'July', 'August'] },
//         q3: { label: 'Quarter 3', months: ['September', 'October', 'November'] },
//         q4: { label: 'Quarter 4', months: ['December', 'January', 'February'] }
//     };

//     function format(n){ return Number(n || 0).toLocaleString(); }

//     /* UI */
//     const container = $(`
//     <div id="tables-container">
//         <h2 class="table-title">Phase Sheet Summary</h2>
//         <div class="toolbar">
//             <div class="search-group">
//                 <input type="text" id="searchInput" placeholder="Search...">
//             </div>
//             <div class="toggle-group">
//                 <label><input type="checkbox" id="toggleExpenses"> Expand All Expenses</label>
//                 <label><input type="checkbox" id="toggleQuarters"> Expand All Quarters</label>
//             </div>
//         </div>
//         <div class="scroll-wrapper">
//             <table class="university-table" id="phase-table"></table>
//         </div>
//     </div>`);
//     $(page.body).append(container);

//     /* ---------- FETCH DATA ---------- */
//     function loadData() {
//         frappe.call({
//             method: "annual_budget.api.phase_sheet.get_consolidated_report",
//             args: { financial_year: "2025-26", units: "APUMP" },
//             callback: function (r) {
//                 expense_heads = r.message || [];
//                 renderTable();
//             }
//         });
//     }

//     /* ---------- RENDER TABLE (FULL FIXED VERSION) ---------- */
//     function renderTable(){
//         const $table = $('#phase-table');
//         $table.empty();

//         const $thead = $('<thead></thead>');
//         const $mainRow = $('<tr class="main-row"></tr>');
//         const $monthRow = $('<tr class="month-row"></tr>');
//         const $budgetRow = $('<tr class="budget-row"></tr>');

//         $mainRow.append('<th rowspan="3">Expense Head / Sub Head / Line Item</th>');
//         $mainRow.append('<th rowspan="3">GL Code</th>');

//         ['q1','q2','q3','q4'].forEach(q=>{
//             const expanded = expandedQuarters.includes(q);
//             const arrow = expanded?'▲':'▼';

//             if(expanded){
//                 $mainRow.append(`<th class="expandable" data-q="${q}" colspan="6">${quarters[q].label} ${arrow}</th>`);
//                 quarters[q].months.forEach(m=>{
//                     $monthRow.append(`<th colspan="2">${m}</th>`);
//                     $budgetRow.append(`<th>Budget</th><th>Actual</th>`);
//                 });
//             } else {
//                 // Fixed: Quarter name only appears once in the main row
//                 $mainRow.append(`<th class="expandable" data-q="${q}" colspan="2">${quarters[q].label} ${arrow}</th>`);
//                 // Only show Budget/Actual labels in the month row when collapsed
//                 $monthRow.append(`<th>Budget</th><th>Actual</th>`); 
//                 $budgetRow.append(`<th>Budget</th><th>Actual</th>`);
//             }
//         });

//         $mainRow.append('<th rowspan="3">Total</th>');
//         $thead.append($mainRow);
//         $thead.append($monthRow);
//         $thead.append($budgetRow);
//         $table.append($thead);

//         const $tbody = $('<tbody></tbody>');

//         /* ---------- HEAD / SUBHEAD / ITEMS ---------- */
//         expense_heads.forEach(head=>{
//             let headTotal = 0;
//             const headRow = $(`<tr class="expense-head" data-head="${head.name}"></tr>`);
//             headRow.append(`<td>${expandedHeads.includes(head.name)?'▼':'▶'} ${head.name}</td>`);
//             headRow.append('<td>-</td>');

//             ['q1','q2','q3','q4'].forEach(q=>{
//                 const arr = head[q] || [];
//                 if(expandedQuarters.includes(q)){
//                     arr.forEach(v=>{
//                         headRow.append(`<td>${format(v)}</td><td>0</td>`); headTotal+=v;
//                     });
//                 }else{
//                     const sum = arr.reduce((a,b)=>a+b,0);
//                     headRow.append(`<td>${format(sum)}</td><td>0</td>`); headTotal+=sum;
//                 }
//             });
//             headRow.append(`<td>${format(headTotal)}</td>`);
//             $tbody.append(headRow);

//             if(expandedHeads.includes(head.name)){

//                 /* SUBHEADS */
//                 if(head.sub_heads?.length){
//                     head.sub_heads.forEach(sub=>{
//                         let subTotal = 0;
//                         const subRow = $(`<tr class="sub-head" data-sub="${sub.name}"></tr>`);
//                         subRow.append(`<td style="padding-left:26px;">${expandedHeads.includes(sub.name)?'▼':'▶'} ${sub.name}</td>`);
//                         subRow.append(`<td>-</td>`);

//                         ['q1','q2','q3','q4'].forEach(q=>{
//                             const arr = sub[q] || [];
//                             if(expandedQuarters.includes(q)){
//                                 arr.forEach(v=>{ subRow.append(`<td>${format(v)}</td><td>0</td>`); subTotal+=v; });
//                             }else{
//                                 const sum = arr.reduce((a,b)=>a+b,0);
//                                 subRow.append(`<td>${format(sum)}</td><td>0</td>`); subTotal+=sum;
//                             }
//                         });
//                         subRow.append(`<td>${format(subTotal)}</td>`);
//                         $tbody.append(subRow);

//                         /* ITEMS UNDER SUBHEAD */
//                         if(expandedHeads.includes(sub.name)){
//                             sub.items.forEach(item=>{
//                                 let t = 0;
//                                 const itemRow = $(`<tr></tr>`);
//                                 itemRow.append(`<td style="padding-left:50px;">${item.name}</td>`);
//                                 itemRow.append(`<td>${item.gl_code}</td>`);

//                                 ['q1','q2','q3','q4'].forEach(q=>{
//                                     const arr = item[q] || [];
//                                     if(expandedQuarters.includes(q)){
//                                         arr.forEach(v=>{ itemRow.append(`<td>${format(v)}</td><td>0</td>`); t+=v; });
//                                     }else{
//                                         const sum = arr.reduce((a,b)=>a+b,0);
//                                         itemRow.append(`<td>${format(sum)}</td><td>0</td>`); t+=sum;
//                                     }
//                                 });
//                                 itemRow.append(`<td>${format(t)}</td>`);
//                                 $tbody.append(itemRow);
//                             });
//                         }
//                     });
//                 }

//                 /* DIRECT ITEMS (NO SUBHEADS) */
//                 else if(head.items?.length){
//                     head.items.forEach(item=>{
//                         let t=0;
//                         const itemRow=$(`<tr></tr>`);
//                         itemRow.append(`<td style="padding-left:26px;">${item.name}</td>`);
//                         itemRow.append(`<td>${item.gl_code}</td>`);

//                         ['q1','q2','q3','q4'].forEach(q=>{
//                             const arr=item[q]||[];
//                             // The rendering for items in a collapsed quarter is simple, just show sum for Budget and 0 for Actual.
//                             // The logic for expanded quarters should use all 3 month values, but the provided item rendering logic only uses the sum.
//                             // I'm keeping the item logic as it was (which seems to show the sum regardless of quarter expansion), as the issue was only with the header.
//                             const sum = arr.reduce((a,b)=>a+b,0);
                            
//                             // To correctly reflect the structure for items when quarters are expanded, the item logic would need to be updated.
//                             // For now, I'm focusing on the header fix.
//                             if(expandedQuarters.includes(q)){
//                                 arr.forEach(v=>{
//                                     itemRow.append(`<td>${format(v)}</td><td>0</td>`); t+=v;
//                                 });
//                             } else {
//                                 itemRow.append(`<td>${format(sum)}</td><td>0</td>`); t+=sum;
//                             }
//                         });
//                         itemRow.append(`<td>${format(t)}</td>`);
//                         $tbody.append(itemRow);
//                     });
//                 }
//             }
//         });
//         $table.append($tbody);

//         /* ---------- Events ---------- */
//         $('th.expandable').off().on('click',function(){
//             const q=$(this).data('q');
//             expandedQuarters = expandedQuarters.includes(q) ? expandedQuarters.filter(x=>x!==q) : [...expandedQuarters,q];
//             renderTable();
//         });
//         $('.expense-head').off().on('click',function(){
//             const h=$(this).data('head');
//             expandedHeads = expandedHeads.includes(h) ? expandedHeads.filter(x=>x!==h) : [...expandedHeads,h];
//             renderTable();
//         });
//         $('.sub-head').off().on('click',function(){
//             const s=$(this).data('sub');
//             expandedHeads = expandedHeads.includes(s) ? expandedHeads.filter(x=>x!==s) : [...expandedHeads,s];
//             renderTable();
//         });
//         $('#toggleExpenses').off().on('change',function(){
//             expandedHeads = this.checked ? expense_heads.flatMap(h=>[h.name,...(h.sub_heads||[]).map(s=>s.name)]) : [];
//             renderTable();
//         });
//         $('#toggleQuarters').off().on('change',function(){
//             expandedQuarters = this.checked ? Object.keys(quarters) : [];
//             renderTable();
//         });
//         $('#searchInput').off().on('keyup', function () {
//             const val=$(this).val().toLowerCase();
//             $("#phase-table tbody tr").toggle(function(){
//                 return $(this).text().toLowerCase().includes(val);
//             });
//         });
//     }

//     loadData();
// };

frappe.pages['phase-sheet'].on_page_load = function (wrapper) {
	let page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Phase Sheet',
		single_column: true
	});

	/* ---------- Styles ---------- */
	const style = `
	<style>
		#tables-container {
			margin: 20px;
			background-color: #ffffff;
			border-radius: 8px;
			padding: 0;
			border: 1px solid #ccc;
			box-shadow: 0 2px 6px rgba(0,0,0,0.05);
			overflow: hidden;
		}
		h2.table-title {
			color: #0076B6;
			font-size: 20px;
			font-weight: 700;
			margin: 0;
			padding: 16px 20px 10px;
			border-bottom: 1px solid #e5e5e5;
			background-color: #f8fafc;
		}
		.toolbar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			background-color: #f8fafc;
			padding: 10px 20px;
			border-bottom: 1px solid #e5e5e5;
			flex-wrap: wrap;
			gap: 10px;
		}
		.search-group input {
			padding: 6px 10px;
			border: 1px solid #ccc;
			border-radius: 6px;
			font-size: 13px;
			width: 260px;
		}
		.toggle-group label { font-size: 13px; }

		.scroll-wrapper {
			overflow-x: auto;
			max-height: 70vh;
		}
		table.university-table {
			min-width: 1500px;
			width: 100%;
			border-collapse: collapse;
			font-size: 13px;
			color: #111;
			text-align: center;
		}
		table.university-table th, table.university-table td {
			border: 1px solid #ddd;
			padding: 8px 10px;
			white-space: nowrap;
		}

		table.university-table td:first-child,
		table.university-table th:first-child {
			text-align: left !important;
			padding-left: 12px !important;
		}

		.main-row th { background-color: #0076B6; color: #fff; position: sticky; top: 0; z-index: 30; }
		.month-row th { background-color: #0076B6; color: #fff; position: sticky; top: 34px; z-index: 29;}
		.budget-row th { background-color: #F26B21; color: #fff; position: sticky; top: 66px; z-index: 28;}

		tr.expense-head { background:#E8F4FB; font-weight:600; cursor:pointer; }
		tr.sub-head { background:#f4f7fb; font-weight:600; cursor:pointer; }
	</style>`;
	$(style).appendTo(page.body);

	/* ---------- Data Variables ---------- */
	let expense_heads = [];
	let expandedHeads = [];
	let expandedQuarters = [];

	const quarters = {
		q1: { label: 'Quarter 1', months: ['March', 'April', 'May'] },
		q2: { label: 'Quarter 2', months: ['June', 'July', 'August'] },
		q3: { label: 'Quarter 3', months: ['September', 'October', 'November'] },
		q4: { label: 'Quarter 4', months: ['December', 'January', 'February'] }
	};

	function format(n){ return Number(n || 0).toLocaleString(); }

	/* UI */
	const container = $(`
	<div id="tables-container">
		<h2 class="table-title">Phase Sheet Summary</h2>
		<div class="toolbar">
			<div class="search-group">
				<input type="text" id="searchInput" placeholder="Search...">
			</div>
			<div class="toggle-group">
				<label><input type="checkbox" id="toggleExpenses"> Expand All Expenses</label>
				<label><input type="checkbox" id="toggleQuarters"> Expand All Quarters</label>
			</div>
		</div>
		<div class="scroll-wrapper">
			<table class="university-table" id="phase-table"></table>
		</div>
	</div>`);
	$(page.body).append(container);

	/* ---------- FETCH DATA ---------- */
	function loadData() {
		frappe.call({
			method: "annual_budget.api.phase_sheet.get_consolidated_report",
			args: { financial_year: "2025-26", units: "APUMP" },
			callback: function (r) {
				expense_heads = r.message || [];
				renderTable();
			}
		});
	}

	/* ---------- RENDER TABLE (Correct Header Structure) ---------- */
	function renderTable(){
		const $table = $('#phase-table');
		$table.empty();

		const $thead = $('<thead></thead>');
		const $row1 = $('<tr class="main-row"></tr>');   // Quarter Row
		const $row2 = $('<tr class="month-row"></tr>');  // Month / Quarter Name Row
		const $row3 = $('<tr class="budget-row"></tr>'); // Budget / Actual Row

		$row1.append('<th rowspan="3">Expense Head / Sub Head / Line Item</th>');
		$row1.append('<th rowspan="3">GL Code</th>');

		['q1','q2','q3','q4'].forEach(q=>{
			const expanded = expandedQuarters.includes(q);
			const arrow = expanded?'▲':'▼';

			// Top Row: Quarter Name
			$row1.append(`<th class="expandable" colspan="${expanded?6:2}" data-q="${q}">${quarters[q].label} ${arrow}</th>`);

			if(expanded){
				quarters[q].months.forEach(m=>{
					$row2.append(`<th colspan="2">${m}</th>`);
					$row3.append(`<th>Budget</th><th>Actual</th>`);
				});
			} else {
				$row2.append(`<th colspan="2">${quarters[q].label}</th>`);
				$row3.append(`<th>Budget</th><th>Actual</th>`);
			}
		});

		$row1.append('<th rowspan="3">Total</th>');

		$thead.append($row1);
		$thead.append($row2);
		$thead.append($row3);
		$table.append($thead);

		const $tbody = $('<tbody></tbody>');

		/* ---------- DATA ROWS ---------- */
		expense_heads.forEach(head=>{
			let headTotal = 0;
			const headRow = $(`<tr class="expense-head" data-head="${head.name}"></tr>`);
			headRow.append(`<td>${expandedHeads.includes(head.name)?'▼':'▶'} ${head.name}</td>`);
			headRow.append('<td>-</td>');

			['q1','q2','q3','q4'].forEach(q=>{
				const arr = head[q] || [];
				if(expandedQuarters.includes(q)){
					arr.forEach(v=>{ headRow.append(`<td>${format(v)}</td><td>0</td>`); headTotal+=v; });
				}else{
					const sum = arr.reduce((a,b)=>a+b,0);
					headRow.append(`<td>${format(sum)}</td><td>0</td>`); headTotal+=sum;
				}
			});

			headRow.append(`<td>${format(headTotal)}</td>`);
			$tbody.append(headRow);

			if(expandedHeads.includes(head.name)){
				(head.items||[]).forEach(item=>{
					let t=0;
					const itemRow = $('<tr></tr>');
					itemRow.append(`<td style="padding-left:26px;">${item.name}</td>`);
					itemRow.append(`<td>${item.gl_code}</td>`);

					['q1','q2','q3','q4'].forEach(q=>{
						const arr=item[q]||[];
						if(expandedQuarters.includes(q)){
							arr.forEach(v=>{ itemRow.append(`<td>${format(v)}</td><td>0</td>`); t+=v; });
						}else{
							const sum=arr.reduce((a,b)=>a+b,0);
							itemRow.append(`<td>${format(sum)}</td><td>0</td>`); t+=sum;
						}
					});
					itemRow.append(`<td>${format(t)}</td>`);
					$tbody.append(itemRow);
				});
			}
		});
		$table.append($tbody);

		/* ---------- EVENTS ---------- */
		$('th.expandable').off().on('click',function(){
			const q=$(this).data('q');
			expandedQuarters = expandedQuarters.includes(q) ? expandedQuarters.filter(x=>x!==q) : [...expandedQuarters,q];
			renderTable();
		});
		$('.expense-head').off().on('click',function(){
			const h=$(this).data('head');
			expandedHeads = expandedHeads.includes(h) ? expandedHeads.filter(x=>x!==h) : [...expandedHeads,h];
			renderTable();
		});
		$('#toggleExpenses').off().on('change',function(){
			expandedHeads = this.checked ? expense_heads.flatMap(h=>[h.name,...(h.sub_heads||[]).map(s=>s.name)]) : [];
			renderTable();
		});
		$('#toggleQuarters').off().on('change',function(){
			expandedQuarters = this.checked ? Object.keys(quarters) : [];
			renderTable();
		});
		$('#searchInput').off().on('keyup', function () {
			const val=$(this).val().toLowerCase();
			$("#phase-table tbody tr").toggle(function(){
				return $(this).text().toLowerCase().includes(val);
			});
		});
	}

	loadData();
};

