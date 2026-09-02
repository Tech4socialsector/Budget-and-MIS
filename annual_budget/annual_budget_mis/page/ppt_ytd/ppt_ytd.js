frappe.pages["ppt_ytd"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "PPT YTD Dashboard",
		single_column: true,
	});

	// Disable Frappe popups
	frappe.throw = () => {};
	frappe.msgprint = () => {};
	frappe.show_alert = () => {};

	// Containers
	const filter_area = $('<div class="filter-section"></div>').appendTo(page.main);
	const table_container = $('<div id="tables-container"></div>').appendTo(page.main);
	const education_section = $('<div id="education-summary"></div>').appendTo(table_container);
	const university_section = $('<div id="university-summary"></div>').appendTo(table_container);
	if (!$("#global-loader").length) {
    $("body").append(`
        <div id="global-loader" class="loader-overlay">
            <div class="loader-box">
                <img src="/files/apf.png" class="loader-logo">
                <div class="loader-text">Loading, please wait…</div>
            </div>
        </div>
    `);
}

/* Always hide on page load */
$("#global-loader").hide();
const Loader = {
    show(message = "Loading, please wait…") {
        const loader = $("#global-loader");
        if (!loader.length) return;

        loader.find(".loader-text").text(message);
        loader.fadeIn(200);
    },

    hide() {
        const loader = $("#global-loader");
        if (!loader.length) return;

        loader.fadeOut(200);
    }
};


	filter_area.css({
		padding: "20px",
		margin: "20px",
		display: "flex",
		gap: "16px",
		flexWrap: "wrap",
		alignItems: "center",
		backgroundColor: "#ffffff",
		borderRadius: "8px",
		boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
	});

	// --- Load default settings ---
	frappe.call({
		method: "frappe.client.get",
		args: { doctype: "Master Settings", name: "Master Settings" },
		callback: function (res) {
			const settings = res.message || {};
			const fin_year = settings.current_financial_year || "";
			const month = settings.current_month || "";
			init_filters(fin_year, month);
		},
	});

	function init_filters(default_fin_year, default_month) {
		const filters = {};
		const toCr = (value) => (!value ? "-" : (value / 10000000).toFixed(1));

		// --- Financial Year Filter ---
		filters.financial_year = frappe.ui.form.make_control({
			df: {
				fieldtype: "Link",
				label: "Financial Year",
				options: "Financial year list",
				reqd: 1,
				default: default_fin_year,
				onchange: () => refresh_data(),
			},
			parent: filter_area[0],
			render_input: true,
		});

		// --- Month Filter ---
		filters.month = frappe.ui.form.make_control({
			df: {
				fieldtype: "Select",
				label: "YTD Month",
				options: [
					"",
					"April", "May", "June", "July", "August", "September",
					"October", "November", "December", "January", "February", "March",
				],
				default: default_month,
				onchange: () => refresh_data(),
			},
			parent: filter_area[0],
			render_input: true,
		});

		// --- Operating Units Filter ---
		const OPERATING_UNITS = [
			"Schools - APES & APET",
			"District Institute - APFD",
			"University - Bangalore - APU",
			"University - Bhopal - APUMP",
			"University - Ranchi - APUJH",
		];

		filters.operating_unit = frappe.ui.form.make_control({
			df: {
				fieldtype: "MultiSelectList",
				label: "Operating Unit",
				get_data: () =>
					OPERATING_UNITS.map(u => ({
						label: u,
						value: u,
						description: "",
					})),
				onchange: () => refresh_data(),
			},
			parent: filter_area[0],
			render_input: true,
		});

		// --- Styling for filters ---
		setTimeout(() => {
			filter_area.find(".frappe-control").css({
				minWidth: "220px",
				flex: "1 1 240px",
				maxWidth: "260px",
			});
			filter_area.find("input, select").css({
				height: "36px",
				fontSize: "13px",
				borderRadius: "6px",
			});
			filter_area.find("label").css({
				fontWeight: "600",
				color: "#333",
				marginBottom: "4px",
				display: "block",
			});
		}, 200);

		// --- Load Data ---
		// function refresh_data() {
		// 	const fin_year = filters.financial_year.get_value();
		// 	const month = filters.month.get_value();
		// 	const selected_units = filters.operating_unit.get_value().map(u => u.value || u);

		// 	if (!fin_year || !month || !selected_units?.length) return;

		// 	education_section.html("<p style='padding:10px;'>Loading Education Summary...</p>");
		// 	university_section.html("");

		// 	let school_data = [];
		// 	let district_data = [];

		// 	const promises = [];

		// 	// --- Schools ---
		// 	// if (selected_units.includes("Schools - APES & APET")) {
		// 	// 	promises.push(
		// 	// 		new Promise((resolve) => {
		// 	// 			frappe.call({
		// 	// 				method: "annual_budget.api.ppt_dashboard.get_school_budget_summary",
		// 	// 				args: { financial_year: fin_year, month, entity: "APET,APES", cost_center: "701,683" },
		// 	// 				callback: (r) => {
		// 	// 					school_data = r.message?.message || [];
		// 	// 					resolve();
		// 	// 				},
		// 	// 			});
		// 	// 		})
		// 	// 	);
		// 	// }
		// 	if (selected_units.includes("Schools - APES & APET"))
		// 	promises.push(new Promise(resolve =>
		// 		(Loader.show("Loading Schools Summary..."),
		// 		frappe.call({
		// 			method: "annual_budget.api.ppt_dashboard.get_school_budget_summary",
		// 			args: { financial_year: fin_year, month, entity: "APET,APES", cost_center: "701,683" },
		// 			timeout: 10000,
		// 			callback: r => (Loader.hide(), school_data = r.message?.message || [], resolve()),
		// 			error: () => (Loader.hide(), school_data = [], resolve())
		// 		}))
		// 	));


		// 	// --- District Institutes ---
		// 	// if (selected_units.includes("District Institute - APFD")) {
		// 	// 	promises.push(
		// 	// 		new Promise((resolve) => {
		// 	// 			frappe.call({
		// 	// 				method: "annual_budget.api.ppt_dashboard.get_school_budget_summary",
		// 	// 				args: { financial_year: fin_year, month, entity: "APFD", cost_center: "745,750" },
		// 	// 				callback: (r) => {
		// 	// 					district_data = r.message?.message || [];
		// 	// 					resolve();
		// 	// 				},
		// 	// 			});
		// 	// 		})
		// 	// 	);
		// 	// }
		// 	if (selected_units.includes("District Institute - APFD"))
		// 	promises.push(new Promise(resolve =>
		// 		(Loader.show("Loading District Institute..."),
		// 		frappe.call({
		// 			method: "annual_budget.api.ppt_dashboard.get_school_budget_summary",
		// 			args: { financial_year: fin_year, month, entity: "APFD", cost_center: "745,750" },
		// 			timeout: 10000,
		// 			callback: r => (Loader.hide(), district_data = r.message?.message || [], resolve()),
		// 			error: () => (Loader.hide(), district_data = [], resolve())
		// 		}))
		// 	));

		// 	// --- Universities ---
		// 	const universities = selected_units.filter(u => u.includes("University"));
		// 	if (universities.length > 0) {
		// 		const entities = universities
		// 			.map((u) => {
		// 				if (u.includes("Bangalore")) return "APU";
		// 				if (u.includes("Bhopal")) return "APUMP";
		// 				if (u.includes("Ranchi")) return "APUJH";
		// 				return "";
		// 			})
		// 			.filter(Boolean)
		// 			.join(",");

		// 		promises.push(
		// 			new Promise((resolve) => {
		// 				// Show loader
		// 				Loader.show("Loading University Summary...");
		// 				frappe.call({
		// 					method: "annual_budget.api.ppt_dashboard.get_university_budget_summary",
		// 					args: { 
		// 						financial_year: fin_year, 
		// 						month: month, 
		// 						entity: entities 
		// 					},
		// 					timeout: 10000,   // ⏱ 10 seconds

		// 					callback: (r) => {
		// 						Loader.hide();

		// 						if (r.message && r.message.length) {
		// 							render_entity_table(r.message);
		// 						} else {
		// 							university_section.html("<p>No University Summary found.</p>");
		// 						}

		// 						resolve();
		// 					},

		// 					error: (err) => {
		// 						Loader.hide();

		// 						if (err && err.status === 0) {
		// 							university_section.html("<p>Request timed out after 10 seconds. Please try again.</p>");
		// 						} else {
		// 							university_section.html("<p>Failed to load University Summary.</p>");
		// 						}

		// 						resolve();   // Important so Promise.all does not hang
		// 					}
		// 				});

		// 				// Loader.show("Loading PPT Dashboard…");
		// 				// frappe.call({
		// 				// 	method: "annual_budget.api.ppt_dashboard.get_university_budget_summary",
		// 				// 	args: { financial_year: fin_year, month, entity: entities },
		// 				// 	callback: (r) => {
		// 				// 		render_entity_table(r.message || []);
		// 				// 		resolve();
		// 				// 	},
		// 				// });
		// 			})
		// 		);
		// 	}

		// 	Promise.all(promises).then(() => {
		// 		render_combined_education_table(district_data, school_data);
		// 	});
		// }
		function refresh_data() {
			const fin_year = filters.financial_year.get_value();
			const month = filters.month.get_value();
			const selected_units = filters.operating_unit.get_value().map(u => u.value || u);

			/* ---------- Reset UI ---------- */
			education_section.html("");
			university_section.html("");

			selected_units.some(u => u.includes("School") || u.includes("District"))
				? education_section.show()
				: education_section.hide();

			selected_units.some(u => u.includes("University"))
				? university_section.show()
				: university_section.hide();

			if (!fin_year || !month || !selected_units.length) {
				education_section.html(
					"<p style='padding:12px;color:#777;font-weight:600;'>Select Financial Year, Month and Operating Unit</p>"
				);
				return;
			}

			education_section.html("<p style='padding:10px;'>Loading Education Summary...</p>");
			university_section.html("");

			let school_data = [];
			let district_data = [];
			const promises = [];

			/* ================= District Institute ================= */
			if (selected_units.includes("District Institute - APFD"))
				promises.push(new Promise(resolve =>
					(Loader.show("Loading District Institute Summary"),
					frappe.call({
						method: "annual_budget.api.ppt_dashboard.get_school_budget_summary",
						args: { financial_year: fin_year, month, entity: "APFD", cost_center: "745,750" },
						timeout: 500000, // 5 minutes
						callback: r => (
							Loader.hide(),
							district_data = r.message?.message || [],
							!district_data.length && education_section.html("<p>No District Institute data found.</p>"),
							resolve()
						),
						error: () => (
							Loader.hide(),
							district_data = [],
							education_section.html("<p>Failed to load District Institute Summary.</p>"),
							resolve()
						)
					}))
				));

			/* ================= Schools ================= */
			if (selected_units.includes("Schools - APES & APET"))
				promises.push(new Promise(resolve =>
					(Loader.show("Loading Schools Summary"),
					frappe.call({
						method: "annual_budget.api.ppt_dashboard.get_school_budget_summary",
						args: { financial_year: fin_year, month, entity: "APET,APES", cost_center: "701,683" },
						timeout: 300000, // 5 minutes
						callback: r => (
							Loader.hide(),
							school_data = r.message?.message || [],
							!school_data.length && education_section.html("<p>No School data found.</p>"),
							resolve()
						),
						error: () => (
							Loader.hide(),
							school_data = [],
							education_section.html("<p>Failed to load Schools Summary.</p>"),
							resolve()
						)
					}))
				));

			/* ================= Universities ================= */
			const universities = selected_units.filter(u => u.includes("University"));
			if (universities.length) {
				const entities = universities
					.map(u => {
						if (u.includes("Bangalore")) return "APU";
						if (u.includes("Bhopal")) return "APUMP";
						if (u.includes("Ranchi")) return "APUJH";
						return "";
					})
					.filter(Boolean)
					.join(",");

				promises.push(new Promise(resolve =>
					(Loader.show("Loading University Summary"),
					frappe.call({
						method: "annual_budget.api.ppt_dashboard.get_combined_university_budget_and_actuals",
						args: { financial_year: fin_year, month, entity: entities },
						timeout: 300000, // 5 minutes
						callback: r => (
							Loader.hide(),
							r.message && r.message.length
								? render_entity_table(r.message)
								: university_section.html("<p>No University Summary found.</p>"),
							resolve()
						),
						error: err => (
							Loader.hide(),
							university_section.html(
								err && err.status === 0
									? "<p>Request timed out after 5 minutes.</p>"
									: "<p>Failed to load University Summary.</p>"
							),
							resolve()
						)
					}))
				));
			}

			/* ================= Final Render ================= */
			Promise.all(promises).then(() => {
				render_combined_education_table(district_data, school_data);
			});
		}

		// --- Combined Education Summary ---
		function render_combined_education_table(districts, schools) {
			if (!districts.length && !schools.length) {
				education_section.html("<p>No Education Summary found.</p>");
				return;
			}

			const toCr = (v) => (!v ? "-" : (v / 10000000).toFixed(1));
			const render_section = (title, data) => {
				let total_op = 0, total_cap = 0, total_grand = 0;
				let html = `<tr><td colspan="12" style="font-weight:700; text-align:left;">${title}</td></tr>`;

				data.forEach((r) => {
					total_op += r.operating_total || 0;
					total_cap += r.capital_total || 0;
					total_grand += r.grand_total || 0;

					html += `
						<tr>
							<td style="text-align:left;">${r.state}</td>
							<td>${toCr(r.operating_total)}</td><td>-</td><td>-</td>
							<td>${toCr(r.capital_total)}</td><td>-</td><td>-</td>
							<td>${toCr(r.grand_total)}</td><td>-</td><td>-</td>
							<td>-</td><td>-</td>
						</tr>`;
				});

				html += `
					<tr class="total-row">
						<td>Total (₹ Cr)</td>
						<td>${toCr(total_op)}</td><td>-</td><td>-</td>
						<td>${toCr(total_cap)}</td><td>-</td><td>-</td>
						<td>${toCr(total_grand)}</td><td>-</td><td>-</td>
						<td>-</td><td>-</td>
					</tr>`;
				return { html, total_op, total_cap, total_grand };
			};

			let total_op = 0, total_cap = 0, total_grand = 0;
			let html = `
				<h2 class="table-title">Field (District Institutes + Schools)</h2>
				<div class="scroll-wrapper">
					<table class="university-table">
						<thead>
							<tr>
								<th rowspan="2">States</th>
								<th colspan="3">Operating Expense (₹ Cr)</th>
								<th colspan="3">Capital Expense (₹ Cr)</th>
								<th colspan="3">Total Expense (₹ Cr)</th>
								<th rowspan="2">% State to Total</th>
								<th rowspan="2">% State to Field</th>
							</tr>
							<tr>
								<th>Budget</th><th>Actuals</th><th>% of Budget</th>
								<th>Budget</th><th>Actuals</th><th>% of Budget</th>
								<th>Budget</th><th>Actuals</th><th>% of Budget</th>
							</tr>
						</thead>
						<tbody>`;

			if (districts.length) {
				const d = render_section("Education - District Institutes", districts);
				html += d.html;
				total_op += d.total_op;
				total_cap += d.total_cap;
				total_grand += d.total_grand;
			}

			if (schools.length) {
				const s = render_section("Education - Azim Premji Schools", schools);
				html += s.html;
				total_op += s.total_op;
				total_cap += s.total_cap;
				total_grand += s.total_grand;
			}

			html += `
				<tr class="total-row" style="background:#f1f5f9;">
					<td>Total Education</td>
					<td>${toCr(total_op)}</td><td>-</td><td>-</td>
					<td>${toCr(total_cap)}</td><td>-</td><td>-</td>
					<td>${toCr(total_grand)}</td><td>-</td><td>-</td>
					<td>-</td><td>-</td>
				</tr>
				</tbody></table></div>`;

			education_section.html(html);
		}

		// --- University Summary ---
		// function render_entity_table(data) {
		// 	if (!data?.length) {
		// 		university_section.html("<p>No University Summary found.</p>");
		// 		return;
		// 	}

		// 	const toCr = (v) => (!v ? "-" : (v / 10000000).toFixed(1));
		// 	const ENTITY_MAP = {
		// 		"APU": "University - Bangalore - APU",
		// 		"APUMP": "University - Bhopal - APUMP",
		// 		"APUJH": "University - Ranchi - APUJH",
		// 	};

		// 	let html = "";
		// 	data.forEach((entity) => {
		// 		const title = ENTITY_MAP[entity.entity] || entity.entity;
		// 		let total_op = 0, total_cap = 0, total_grand = 0, rows = "";

		// 		entity.cost_centers.forEach((r) => {
		// 			total_op += r.operating_total || 0;
		// 			total_cap += r.capital_total || 0;
		// 			total_grand += r.grand_total || 0;

		// 			rows += `
		// 				<tr>
		// 					<td class="text-blue" style="text-align:left;">${r.cost_description}</td>
		// 					<td>${toCr(r.operating_total)}</td><td>-</td><td>-</td>
		// 					<td>${toCr(r.capital_total)}</td><td>-</td><td>-</td>
		// 					<td>${toCr(r.grand_total)}</td><td>-</td><td>-</td>
		// 					<td>-</td><td>-</td>
		// 				</tr>`;
		// 		});

		// 		html += `
		// 			<h2 class="table-title">${title}</h2>
		// 			<div class="scroll-wrapper">
		// 				<table class="university-table">
		// 					<thead>
		// 						<tr>
		// 							<th rowspan="2">Cost Centers</th>
		// 							<th colspan="3">Operating Expense (₹ Cr)</th>
		// 							<th colspan="3">Capital Expense (₹ Cr)</th>
		// 							<th colspan="3">Total Expense (₹ Cr)</th>
		// 							<th rowspan="2">% Unit to Total</th>
		// 							<th rowspan="2">% Unit to University</th>
		// 						</tr>
		// 						<tr>
		// 							<th>Budget</th><th>Actuals</th><th>% of Budget</th>
		// 							<th>Budget</th><th>Actuals</th><th>% of Budget</th>
		// 							<th>Budget</th><th>Actuals</th><th>% of Budget</th>
		// 						</tr>
		// 					</thead>
		// 					<tbody>${rows}
		// 						<tr class="total-row">
		// 							<td>Total (₹ Cr)</td>
		// 							<td>${toCr(total_op)}</td><td>-</td><td>-</td>
		// 							<td>${toCr(total_cap)}</td><td>-</td><td>-</td>
		// 							<td>${toCr(total_grand)}</td><td>-</td><td>-</td>
		// 							<td>-</td><td>-</td>
		// 						</tr>
		// 					</tbody>
		// 				</table>
		// 			</div>`;
		// 	});

		// 	university_section.html(html);
		// }


		function render_entity_table(data) {
    if (!data?.length) {
        university_section.html("<p>No University Summary found.</p>");
        return;
    }

    const toCr = (v) => (!v ? "-" : (v / 10000000).toFixed(1));
    const toPct = (a, b) => (!b ? "-" : ((a / b) * 100).toFixed(1) + "%");
// const formatPct = (v) => (v === null || v === undefined ? "-" : v.toFixed(1) + "%");

    const ENTITY_MAP = {
        "APU": "University - Bangalore - APU",
        "APUMP": "University - Bhopal - APUMP",
        "APUJH": "University - Ranchi - APUJH",
    };

    let html = "";

    data.forEach((entity) => {
        const title = ENTITY_MAP[entity.entity] || entity.entity;

        let total_op = 0, total_cap = 0, total_grand = 0;
        let total_act_op = 0, total_act_cap = 0, total_act_grand = 0;

        let rows = "";

        entity.cost_centers.forEach((r) => {
            // Budget values from API
            const opBudget    = r.budget_operating_total || 0;
            const capBudget   = r.budget_capital_total || 0;
            const grandBudget = r.budget_grand_total || 0;

            // Actual values from API
            const opActual    = r.actual_operating_total || 0;
            const capActual   = r.actual_capital_total || 0;
            const grandActual = r.actual_grand_total || 0;

            // Totals
            total_op += opBudget;
            total_cap += capBudget;
            total_grand += grandBudget;

            total_act_op += opActual;
            total_act_cap += capActual;
            total_act_grand += grandActual;

            rows += `
                <tr>
                    <td class="text-blue" style="text-align:left;">${r.cost_description}</td>

                    <!-- Operating -->
                    <td>${toCr(opBudget)}</td>
                    <td>${toCr(opActual)}</td>
                    <td>${toPct(opActual, opBudget)}</td>

                    <!-- Capital -->
                    <td>${toCr(capBudget)}</td>
                    <td>${toCr(capActual)}</td>
                    <td>${toPct(capActual, capBudget)}</td>

                    <!-- Total -->
                    <td>${toCr(grandBudget)}</td>
                    <td>${toCr(grandActual)}</td>
                    <td>${toPct(grandActual, grandBudget)}</td>

                    <td>-</td>
                    <td>-</td>
                </tr>`;
// 			rows += `
// <tr>
//     <td class="text-blue" style="text-align:left;">${r.cost_description}</td>

//     <!-- Operating -->
//     <td>${toCr(opBudget)}</td>
//     <td>${toCr(opActual)}</td>
//     <td>${formatPct(r.operating_percentage)}</td>

//     <!-- Capital -->
//     <td>${toCr(capBudget)}</td>
//     <td>${toCr(capActual)}</td>
//     <td>${formatPct(r.capital_percentage)}</td>

//     <!-- Total -->
//     <td>${toCr(grandBudget)}</td>
//     <td>${toCr(grandActual)}</td>
//     <td>${formatPct(r.grand_total_percentage)}</td>

//     <td>-</td>
//     <td>-</td>
// </tr>`;

        });

        html += `
            <h2 class="table-title">${title}</h2>
            <div class="scroll-wrapper">
                <table class="university-table">
                    <thead>
                        <tr>
                            <th rowspan="2">Cost Centers</th>
                            <th colspan="3">Operating Expense (₹ Cr)</th>
                            <th colspan="3">Capital Expense (₹ Cr)</th>
                            <th colspan="3">Total Expense (₹ Cr)</th>
                            <th rowspan="2">% Unit to Total</th>
                            <th rowspan="2">% Unit to University</th>
                        </tr>
                        <tr>
                            <th>Budget</th><th>Actuals</th><th>% of Budget</th>
                            <th>Budget</th><th>Actuals</th><th>% of Budget</th>
                            <th>Budget</th><th>Actuals</th><th>% of Budget</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                        <tr class="total-row">
                            <td>Total (₹ Cr)</td>

                            <!-- Operating -->
                            <td>${toCr(total_op)}</td>
                            <td>${toCr(total_act_op)}</td>
                            <td>${toPct(total_act_op, total_op)}</td>

                            <!-- Capital -->
                            <td>${toCr(total_cap)}</td>
                            <td>${toCr(total_act_cap)}</td>
                            <td>${toPct(total_act_cap, total_cap)}</td>

                            <!-- Total -->
                            <td>${toCr(total_grand)}</td>
                            <td>${toCr(total_act_grand)}</td>
                            <td>${toPct(total_act_grand, total_grand)}</td>

                            <td>-</td>
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>`;
    });

    university_section.html(html);
}

		// --- Default Load ---
		setTimeout(() => {
			if (default_fin_year) filters.financial_year.set_value(default_fin_year);
			if (default_month) filters.month.set_value(default_month);
			refresh_data();
		}, 400);
	}

	// --- Styles ---
	const style = `
		<style>
			#tables-container { margin: 20px; background-color: #ffffff; border-radius: 8px; }
			h2.table-title { color: #0076B6; font-size: 20px; font-weight: 700; margin: 28px 0 12px; padding-left: 4px; }
			.scroll-wrapper { border: 1px solid #ccc; border-radius: 6px; overflow-x: auto; overflow-y: auto; max-height: 65vh; width: 100%; margin-bottom: 24px; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
			table.university-table { min-width: 1200px; width: 100%; border-collapse: collapse; font-size: 13px; text-align: center; color: #111; }
			table.university-table th, table.university-table td { border: 1px solid #ddd; padding: 8px 10px; white-space: nowrap; vertical-align: middle; }
			table.university-table thead tr:first-child th { background-color: #0076B6; color: #fff; position: sticky; top: 0; z-index: 25; }
			table.university-table thead tr:nth-child(2) th { background-color: #F26B21; color: #fff; position: sticky; top: 34px; z-index: 24; }
			.total-row { font-weight: 700; background-color: #f9fafb; border-top: 2px solid #000; border-bottom: 2px solid #000; }
			.total-row td:first-child { text-align: left; background-color: #f3f4f6; }
			.text-blue { color: #0076B6; font-weight: 600; }


			/* Full screen overlay – soft light black glass look */
#global-loader.loader-overlay {
	position: fixed;
	inset: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(18, 18, 18, 0.92); /* light black */
	backdrop-filter: blur(6px);
	display: none;
	z-index: 999999;

	/* Perfect center */
	display: flex;
	align-items: center;
	justify-content: center;
}

/* Center container */
.loader-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 14px;
}

/* Rounded logo */
.loader-logo {
	width: 90px;
	height: 90px;
	border-radius: 50%;
	background: linear-gradient(145deg, #ffffff, #eaeaea);
	padding: 14px;
	object-fit: contain;
	box-shadow: 
		0 10px 30px rgba(0, 0, 0, 0.35),
		0 0 0 4px rgba(255, 255, 255, 0.08);
	animation: pulse 1.6s infinite ease-in-out;
}

/* Loader text */
.loader-text {
	margin-top: 6px;
	font-size: 14px;
	color: #ffffff; /* white text */
	font-weight: 600;
	letter-spacing: 0.5px;
	text-align: center;
	opacity: 0.85;
}

/* Subtle loading dots animation (optional, looks premium) */
.loader-text::after {
	content: "";
	display: inline-block;
	width: 1em;
	animation: dots 1.5s infinite;
}

/* Pulse animation */
@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 0.8;
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
	}
	50% {
		transform: scale(1.08);
		opacity: 1;
		box-shadow: 0 0 20px 8px rgba(255, 255, 255, 0.15);
	}
	100% {
		transform: scale(1);
		opacity: 0.8;
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
	}
}

/* Loading dots animation */
@keyframes dots {
	0%   { content: ""; }	
	33%  { content: "."; }
	66%  { content: ".."; }
	100% { content: "..."; }
}


		</style>`;
	$(style).appendTo(page.main);
};
