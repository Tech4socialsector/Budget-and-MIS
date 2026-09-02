frappe.pages["erp-actuals"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "ERP Actuals",
		single_column: true,
	});

	const API_OPTIONS = {
		"ERP Actuals (YTD)": "annual_budget.api.actuals.get_actuals_from_erp_prod",
		"ERP Actuals (Month Wise)": "annual_budget.api.actuals.get_actuals_from_erp_month_wise",
	};

	// --- Loader overlay (shared branding used across MIS pages, e.g. consolidate-report) ---
	if (!$("#global-loader").length) {
		$("body").append(`
			<div id="global-loader" class="loader-overlay">
				<div class="loader-box">
					<img src="/files/APF logo.png" class="loader-logo" alt="">
					<div class="loader-text">Loading, please wait</div>
				</div>
			</div>
		`);
	}
	$("#global-loader").hide();
	const Loader = {
		show(msg) {
			const $l = $("#global-loader");
			$l.find(".loader-text").text(msg || "Loading, please wait");
			$l.css("display", "flex").hide().fadeIn(200);
		},
		hide() {
			$("#global-loader").fadeOut(200);
		},
	};

	// --- Containers ---
	const filter_area = $('<div class="erp-filter-bar"></div>').appendTo(page.main);
	const summary_area = $('<div id="erp-actuals-summary"></div>').appendTo(page.main);
	const result_area = $('<div id="erp-actuals-result"></div>').appendTo(page.main);

	// --- Filters, rendered as native Frappe form controls laid out left-to-right ---
	const filters = {};

	filters.api_choice = frappe.ui.form.make_control({
		df: {
			fieldtype: "Autocomplete",
			fieldname: "api_choice",
			label: "API",
			options: Object.keys(API_OPTIONS),
			default: Object.keys(API_OPTIONS)[0],
			placeholder: "Search API…",
			reqd: 1,
		},
		parent: filter_area[0],
		render_input: true,
	});
	filters.api_choice.set_value(Object.keys(API_OPTIONS)[0]);

	filters.financial_year = frappe.ui.form.make_control({
		df: {
			fieldtype: "Link",
			fieldname: "financial_year",
			label: "Financial Year",
			options: "Financial Year List",
			placeholder: "e.g. 2026-27",
			reqd: 1,
		},
		parent: filter_area[0],
		render_input: true,
	});

	// April = accounting period 1 … March = 12 (matches
	// annual_budget.api.actual_format.get_accounting_period_from_month).
	const MONTH_TO_PERIOD = {
		April: 1,
		May: 2,
		June: 3,
		July: 4,
		August: 5,
		September: 6,
		October: 7,
		November: 8,
		December: 9,
		January: 10,
		February: 11,
		March: 12,
	};

	filters.month = frappe.ui.form.make_control({
		df: {
			fieldtype: "Select",
			fieldname: "month",
			label: "Month",
			options: Object.keys(MONTH_TO_PERIOD),
			reqd: 1,
		},
		parent: filter_area[0],
		render_input: true,
	});

	const fetch_btn = $(
		'<div class="erp-fetch-btn-wrap"><button class="btn btn-primary btn-sm mt-2">Fetch</button></div>'
	).appendTo(filter_area);
	fetch_btn.find("button").on("click", () => fetch_data());

	// Populated after a successful fetch so Export always downloads what's on screen.
	let last_query = null;

	function fetch_data() {
		const api_label = filters.api_choice.get_value();
		const method = API_OPTIONS[api_label];
		const financial_year = filters.financial_year.get_value();
		const month = filters.month.get_value();

		if (!method) {
			frappe.msgprint("Select an API first.");
			return;
		}
		if (!financial_year || !month) {
			frappe.msgprint("Financial Year and Month are required.");
			return;
		}

		// "2026-27" -> 2026 ; "April" -> 1
		const fiscal_year = parseInt(financial_year.split("-")[0], 10);
		const accounting_period = MONTH_TO_PERIOD[month];
		last_query = { method_key: method.split(".").pop(), fiscal_year, accounting_period };

		summary_area.html("");
		result_area.html("");
		Loader.show("Fetching ERP actuals…");

		// Guard against the loader hanging forever if the ERP call stalls
		// (frappe.call has no built-in client-side timeout).
		const stuck_timer = setTimeout(() => {
			Loader.hide();
			result_area.html(
				'<p class="text-blue" style="padding:10px;color:#c0392b;">Request is taking too long. It may still complete in the background — try again shortly.</p>'
			);
		}, 120000);

		return frappe
			.call({ method, args: { fiscal_year, accounting_period } })
			.always(() => {
				clearTimeout(stuck_timer);
				Loader.hide();
			})
			.done((r) => {
				render_response(r.message);
			})
			.fail((err) => {
				console.error("ERP Actuals fetch failed:", err);
				result_area.html(
					'<p class="text-blue" style="padding:10px;color:#c0392b;">Request failed. Check the Error Log for details.</p>'
				);
			});
	}

	function render_response(message) {
		if (!message) {
			result_area.html('<p style="padding:10px;">No response received.</p>');
			return;
		}

		if (message.status !== "success") {
			summary_area.html(
				`<div style="color:#c0392b;font-weight:600;padding:10px 0;">
					Status: ${frappe.utils.escape_html(message.status || "failed")}
					${message.error ? " — " + frappe.utils.escape_html(message.error) : ""}
				</div>`
			);
			result_area.html("");
			return;
		}

		const rows = message.data || [];

		summary_area.html(`
			<div class="summary-card">
				<div><span class="text-blue">Status:</span> ${frappe.utils.escape_html(message.status)}</div>
				<div><span class="text-blue">Fiscal Year:</span> ${frappe.utils.escape_html(String(message.fiscal_year ?? ""))}</div>
				<div><span class="text-blue">Accounting Period:</span> ${frappe.utils.escape_html(String(message.accounting_period ?? ""))}</div>
				<div><span class="text-blue">Row Count:</span> ${rows.length}</div>
				<div class="summary-export">
					<button class="btn btn-default btn-xs erp-export-btn">
						${frappe.utils.icon("download", "xs")} Export to Excel
					</button>
				</div>
			</div>
		`);

		summary_area.find(".erp-export-btn").on("click", export_to_excel);

		render_table(rows);
	}

	function export_to_excel() {
		if (!last_query) return;

		// Export exactly what's on screen (post column-filter), not a fresh
		// unfiltered re-fetch — sent as a POST since the filtered row set can
		// be far larger than a GET URL can hold.
		open_url_post(
			"/api/method/annual_budget.api.export_reports.export_erp_actuals_excel",
			{
				fiscal_year: last_query.fiscal_year,
				accounting_period: last_query.accounting_period,
				rows: JSON.stringify(get_visible_rows()),
			}
		);
	}

	// --- Excel-style column AutoFilter state ---
	let all_rows = [];
	let all_columns = [];
	// column -> Set of values currently checked ("show"). Absent key = no filter applied on that column.
	const active_filters = {};

	// Columns dropped from the results table (still available in the raw API response,
	// just not useful as a table column here — fiscal_year duplicates the summary bar above).
	const HIDDEN_COLUMNS = ["fiscal_year"];

	function cell_text(row, c) {
		const value = row[c];
		if (c === "is_adjustment") {
			return truthy(value) ? "True" : "False";
		}
		return value === null || value === undefined ? "" : String(value);
	}

	function truthy(value) {
		if (value === null || value === undefined) return false;
		const s = String(value).trim().toLowerCase();
		return s === "1" || s === "true" || s === "yes";
	}

	function get_visible_rows() {
		return all_rows.filter((row) =>
			all_columns.every((c) => !active_filters[c] || active_filters[c].has(cell_text(row, c)))
		);
	}

	function render_table(rows) {
		if (!rows.length) {
			result_area.html('<p style="padding:10px;">No rows returned.</p>');
			return;
		}

		all_rows = rows;
		all_columns = Array.from(
			rows.reduce((set, row) => {
				Object.keys(row || {}).forEach((k) => {
					if (!HIDDEN_COLUMNS.includes(k)) set.add(k);
				});
				return set;
			}, new Set())
		);
		Object.keys(active_filters).forEach((k) => delete active_filters[k]);

		result_area.html(`
			<h2 class="table-title">ERP Actuals Response</h2>
			<div class="scroll-wrapper">
				<table class="university-table">
					<thead><tr></tr></thead>
					<tbody></tbody>
				</table>
			</div>
		`);

		const $table = result_area.find("table.university-table");
		const $headRow = $table.find("thead tr");

		all_columns.forEach((c) => {
			const $th = $(`
				<th class="erp-th">
					<span class="erp-th-label">${frappe.utils.escape_html(c)}</span>
					<span class="erp-filter-icon" data-col="${frappe.utils.escape_html(c)}">&#9660;</span>
				</th>
			`);
			$headRow.append($th);
		});

		$table.on("click", ".erp-filter-icon", function (e) {
			e.stopPropagation();
			open_filter_menu($(this), $(this).data("col"));
		});

		render_body();
	}

	function render_body() {
		const $tbody = result_area.find("table.university-table tbody");
		const visible_rows = get_visible_rows();

		if (!visible_rows.length) {
			$tbody.html(
				`<tr><td colspan="${all_columns.length}" style="padding:14px;">No rows match the current filter.</td></tr>`
			);
		} else {
			$tbody.html(
				visible_rows
					.map(
						(row) =>
							`<tr>${all_columns
								.map((c) => `<td>${frappe.utils.escape_html(cell_text(row, c))}</td>`)
								.join("")}</tr>`
					)
					.join("")
			);
		}

		render_total_row(visible_rows);

		result_area
			.find(".erp-filter-icon")
			.removeClass("active")
			.each(function () {
				const c = $(this).data("col");
				if (active_filters[c]) $(this).addClass("active");
			});

		result_area.find(".erp-row-count").remove();
		$(`<span class="erp-row-count">Showing ${visible_rows.length} of ${all_rows.length} rows</span>`).insertAfter(
			result_area.find("h2.table-title")
		);
	}

	function render_total_row(visible_rows) {
		const $tfoot_wrap = result_area.find("table.university-table tfoot");
		if (!all_columns.includes("posted_total_amt")) {
			$tfoot_wrap.remove();
			return;
		}

		const total = visible_rows.reduce(
			(sum, row) => sum + (parseFloat(row.posted_total_amt) || 0),
			0
		);

		const $table = result_area.find("table.university-table");
		let $tfoot = $table.find("tfoot");
		if (!$tfoot.length) {
			$tfoot = $('<tfoot><tr></tr></tfoot>').appendTo($table);
		}
		const $row = $tfoot.find("tr").empty();

		all_columns.forEach((c) => {
			if (c === "posted_total_amt") {
				$row.append(
					`<td class="erp-total-cell">${frappe.utils.escape_html(
						format_currency(total)
					)}</td>`
				);
			} else if (c === all_columns[0]) {
				$row.append(`<td class="erp-total-label">Total</td>`);
			} else {
				$row.append("<td></td>");
			}
		});
	}

	function format_currency(value) {
		return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function open_filter_menu($icon, col) {
		$(".erp-filter-menu").remove();

		const distinct = Array.from(new Set(all_rows.map((r) => cell_text(r, col)))).sort((a, b) =>
			a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
		);
		const checked = active_filters[col] || new Set(distinct);

		const $menu = $(`
			<div class="erp-filter-menu">
				<div class="erp-filter-search">
					<input type="text" placeholder="Search…" class="form-control input-sm">
				</div>
				<div class="erp-filter-select-all">
					<label><input type="checkbox" class="erp-select-all" ${
						checked.size === distinct.length ? "checked" : ""
					}> Select All</label>
				</div>
				<div class="erp-filter-options"></div>
				<div class="erp-filter-actions">
					<button class="btn btn-xs btn-default erp-filter-clear">Clear</button>
					<button class="btn btn-xs btn-primary erp-filter-apply">Apply</button>
				</div>
			</div>
		`);

		const $options = $menu.find(".erp-filter-options");
		distinct.forEach((val) => {
			$options.append(`
				<label class="erp-filter-option">
					<input type="checkbox" value="${frappe.utils.escape_html(val)}" ${checked.has(val) ? "checked" : ""}>
					<span>${val === "" ? "<em>(blank)</em>" : frappe.utils.escape_html(val)}</span>
				</label>
			`);
		});

		// Position under the clicked icon
		const offset = $icon.offset();
		$menu.css({
			position: "absolute",
			top: offset.top + $icon.outerHeight() + 4,
			left: Math.min(offset.left, window.innerWidth - 260),
			zIndex: 3000,
		});
		$("body").append($menu);

		$menu.find(".erp-filter-search input").on("input", function () {
			const term = $(this).val().toLowerCase();
			$options.find(".erp-filter-option").each(function () {
				const text = $(this).text().toLowerCase();
				$(this).toggle(text.includes(term));
			});
		});

		$menu.find(".erp-select-all").on("change", function () {
			$options.find('input[type="checkbox"]:visible').prop("checked", this.checked);
		});

		$menu.find(".erp-filter-clear").on("click", () => {
			delete active_filters[col];
			$(".erp-filter-menu").remove();
			render_body();
		});

		$menu.find(".erp-filter-apply").on("click", () => {
			const selected = new Set();
			$options.find('input[type="checkbox"]:checked').each(function () {
				selected.add($(this).val());
			});
			if (selected.size === distinct.length) {
				delete active_filters[col];
			} else {
				active_filters[col] = selected;
			}
			$(".erp-filter-menu").remove();
			render_body();
		});

		setTimeout(() => {
			$(document).one("click.erp-filter-menu", (e) => {
				if (!$(e.target).closest(".erp-filter-menu").length) {
					$(".erp-filter-menu").remove();
				}
			});
		}, 0);
	}

	// --- Styles: left-aligned filter bar (matches consolidate-report's .bd-filter-bar), shared MIS look for results ---
	const style = `
		<style>
			.erp-filter-bar {
				display: flex;
				align-items: center;
				gap: 20px;
				padding: 16px 20px 20px;
				flex-wrap: wrap;
				justify-content: flex-start;
			}
			.erp-filter-bar .frappe-control {
				width: 220px;
				flex: 0 0 auto;
				margin-bottom: 0;
			}
			.erp-filter-bar .awesomplete { width: 100%; }
			.erp-filter-bar .awesomplete > ul { z-index: 2000 !important; min-width: 100%; }
			.erp-fetch-btn-wrap { flex: 0 0 auto; }
			.erp-fetch-btn-wrap .btn {
				height: 30px;
				padding: 0 20px;
				font-weight: 600;
			}
			#erp-actuals-summary { margin: 0 var(--padding-md, 20px); }
			#erp-actuals-result { margin: 0 var(--padding-md, 20px) 20px; }
			h2.table-title { color: #0076B6; font-size: 18px; font-weight: 700; margin: 8px 0 4px; padding-left: 2px; display: inline-block; }
			.erp-row-count { display: block; font-size: 12px; color: #666; margin: 0 0 10px 2px; }
			.scroll-wrapper { border: 1px solid #ccc; border-radius: 6px; overflow-x: auto; overflow-y: auto; max-height: 65vh; width: 100%; margin-bottom: 24px; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
			table.university-table { min-width: 1200px; width: 100%; border-collapse: collapse; font-size: 13px; text-align: center; color: #111; }
			table.university-table th, table.university-table td { border: 1px solid #ddd; padding: 8px 10px; white-space: nowrap; vertical-align: middle; }
			table.university-table th { background-color: #0076B6; color: #fff; position: sticky; top: 0; z-index: 25; }
			table.university-table tbody tr:nth-child(even) { background-color: #f8fafc; }
			table.university-table tbody tr:hover { background-color: #eef6fb; }
			table.university-table tfoot td {
				position: sticky;
				bottom: 0;
				background-color: #eaf3fa;
				font-weight: 700;
				color: #0076B6;
				border-top: 2px solid #0076B6;
				z-index: 20;
			}
			table.university-table tfoot .erp-total-label { text-align: left; }
			table.university-table tfoot .erp-total-cell { text-align: right; }
			.text-blue { color: #0076B6; font-weight: 600; }

			/* --- Excel-style column filter --- */
			th.erp-th { position: relative; padding-right: 22px !important; }
			.erp-th-label { vertical-align: middle; }
			.erp-filter-icon {
				position: absolute;
				right: 6px;
				top: 50%;
				transform: translateY(-50%);
				font-size: 9px;
				cursor: pointer;
				color: #dbeeff;
				padding: 3px 4px;
				border-radius: 3px;
			}
			.erp-filter-icon:hover { background: rgba(255,255,255,0.2); color: #fff; }
			.erp-filter-icon.active { color: #ffd54a; }
			.erp-filter-menu {
				width: 240px;
				background: #fff;
				border: 1px solid #ccc;
				border-radius: 6px;
				box-shadow: 0 6px 20px rgba(0,0,0,0.18);
				font-size: 13px;
				color: #111;
				padding: 8px;
			}
			.erp-filter-search { margin-bottom: 6px; }
			.erp-filter-search input { width: 100%; height: 28px; font-size: 12px; }
			.erp-filter-select-all {
				border-bottom: 1px solid #eee;
				padding-bottom: 6px;
				margin-bottom: 6px;
			}
			.erp-filter-select-all label,
			.erp-filter-option {
				display: flex;
				align-items: center;
				gap: 6px;
				font-weight: 600;
				cursor: pointer;
			}
			.erp-filter-option {
				font-weight: 400;
				padding: 3px 2px;
				border-radius: 3px;
			}
			.erp-filter-option:hover { background: #f2f6fa; }
			.erp-filter-options {
				max-height: 200px;
				overflow-y: auto;
				margin-bottom: 8px;
			}
			.erp-filter-actions {
				display: flex;
				justify-content: flex-end;
				gap: 6px;
				border-top: 1px solid #eee;
				padding-top: 8px;
			}
			#erp-actuals-summary .summary-card {
				display: flex;
				align-items: center;
				gap: 28px;
				padding: 12px 18px;
				font-size: 13px;
				color: #111;
				background: #f8fafc;
				border: 1px solid #eef0f2;
				border-radius: 8px;
				margin: 4px 0 16px;
				flex-wrap: wrap;
			}
			.summary-export { margin-left: auto; }
			.erp-export-btn { display: inline-flex; align-items: center; gap: 6px; }

			/* Full screen overlay – soft light black glass look */
			#global-loader.loader-overlay {
				position: fixed;
				inset: 0;
				width: 100vw;
				height: 100vh;
				background: rgba(18, 18, 18, 0.92);
				backdrop-filter: blur(6px);
				display: none;
				z-index: 999999;
				align-items: center;
				justify-content: center;
			}
			.loader-box {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				gap: 14px;
			}
			.loader-logo {
				width: 90px;
				height: 90px;
				border-radius: 50%;
				background: linear-gradient(145deg, #ffffff, #eaeaea);
				padding: 14px;
				object-fit: contain;
				box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), 0 0 0 4px rgba(255, 255, 255, 0.08);
				animation: pulse 1.6s infinite ease-in-out;
			}
			.loader-text {
				margin-top: 6px;
				font-size: 14px;
				color: #ffffff;
				font-weight: 600;
				letter-spacing: 0.5px;
				text-align: center;
				opacity: 0.85;
			}
			.loader-text::after {
				content: "";
				display: inline-block;
				width: 1em;
				animation: dots 1.5s infinite;
			}
			@keyframes pulse {
				0% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3); }
				50% { transform: scale(1.08); opacity: 1; box-shadow: 0 0 20px 8px rgba(255, 255, 255, 0.15); }
				100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3); }
			}
			@keyframes dots {
				0% { content: ""; }
				33% { content: "."; }
				66% { content: ".."; }
				100% { content: "..."; }
			}
		</style>`;
	$(style).appendTo(page.main);
};
