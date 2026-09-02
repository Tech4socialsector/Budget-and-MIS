// frappe.pages['consolidated-budget'].on_page_load = function (wrapper) {

// 	// =============================================================================
// 	// PAGE SETUP
// 	// =============================================================================

// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper, title: 'Foundation - Consolidated Budget', single_column: true
// 	});

// 	setTimeout(function () {
// 		$(wrapper).find('#xl-export-all').remove();
// 		var $btn = $(
// 			'<button class="btn btn-default btn-sm" id="xl-export-all" style="display:inline-flex;align-items:center;gap:5px;margin-left:8px;background:#1a1a1a;color:#fff;border-color:#1a1a1a;">' +
// 			svgIcon() + 'Export All</button>'
// 		);
// 		var $pa = $(wrapper).find('.page-actions');
// 		if ($pa.length) { $pa.prepend($btn); }
// 	}, 300);

// 	function updatePageTitle(fy) {
// 		page.set_title('Foundation - Consolidated Budget - ' + fy);
// 		setTimeout(function () {
// 			$(wrapper).find('.page-head h3').hide();
// 			$(wrapper).find('.page-head .title-text').css({ 'font-size': '20px', 'font-weight': '700', 'color': '#1a1a1a' });
// 		}, 100);
// 	}

// 	// =============================================================================
// 	// FY HELPERS
// 	// =============================================================================

// 	function getFYLabels(fy) {
// 		var p = (fy || '2025-26').split('-');
// 		var sYY = p[0] ? p[0].slice(-2) : '25';
// 		var eYY = p[1] ? p[1].slice(-2) : '26';
// 		var ps = String(parseInt(sYY, 10) - 1).padStart(2, '0');
// 		var pe = String(parseInt(eYY, 10) - 1).padStart(2, '0');
// 		return { plan: 'FY' + sYY + '-' + eYY + ' Plan', est: 'FY' + ps + '-' + pe + ' Estimate' };
// 	}

// 	function getPrevFY(fy) {
// 		var p = (fy || '2025-26').split('-');
// 		return (parseInt(p[0] || '2025', 10) - 1) + '-' + String(parseInt(p[1] || '26', 10) - 1).padStart(2, '0');
// 	}

// 	// =============================================================================
// 	// LOADER
// 	// =============================================================================

// 	if (!$('#global-loader').length) {
// 		$('body').append(
// 			'<div id="global-loader" class="loader-overlay">' +
// 			'<div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt="">' +
// 			'<div class="loader-text">Loading, please wait</div></div></div>'
// 		);
// 	}
// 	$('#global-loader').hide();

// 	var Loader = {
// 		show: function (msg) {
// 			var $l = $('#global-loader');
// 			$l.find('.loader-text').text(msg || 'Loading, please wait');
// 			$l.css('display', 'flex').hide().fadeIn(200);
// 		},
// 		hide: function () { $('#global-loader').fadeOut(200); }
// 	};

// 	// =============================================================================
// 	// STORE
// 	// =============================================================================

// 	var Store = {
// 		ppt: { rows: [], prevRows: [], budgetLabel: '', estLabel: '', prevBudgetLabel: '', prevEstLabel: '' },
// 		summaryInr: [], headcount: [], annual: [], estimate: [], budgetEstimate: []
// 	};

// 	// =============================================================================
// 	// STYLES
// 	// =============================================================================

// 	$(page.body).append(
// 		'<style>' +
// 		':root{' +
// 		'--font:"Inter","Segoe UI","Helvetica Neue",Arial,sans-serif;' +
// 		'--fs-xs:13px;--fs-sm:14px;--fs-base:15px;--fs-md:16px;--fs-lg:17px;--fs-xl:18px;' +
// 		'--fw-n:400;--fw-m:500;--fw-sb:600;--fw-b:700;' +
// 		'--blue-dark:#003B63;--blue-mid:#0076B6;--blue-light:#E9F4FB;' +
// 		'--orange:#F26B21;--orange-light:#FFF3E6;' +
// 		'--bdl:#9baab5;--bdh:#004a75;--bdo:#a84808;' +
// 		'--txt:#1a1a1a;--txt2:#36414c;--muted:#555;' +
// 		'}' +
// 		'.cb-wrapper{padding:15px;background:#fff;font-family:var(--font);font-size:var(--fs-base);color:var(--txt);line-height:1.5;}' +
// 		'.cb-wrapper *{box-sizing:border-box;}' +
// 		'#cb-tab-nav{border-bottom:2px solid #ddd;list-style:none;padding:0;margin:0 0 16px;display:flex;align-items:flex-end;flex-wrap:wrap;}' +
// 		'#cb-tab-nav li{display:inline-block;}' +
// 		'#cb-tab-nav .cb-tab-link{cursor:pointer;display:inline-block;padding:9px 18px;color:var(--muted);font-size:var(--fs-md);font-weight:var(--fw-m);background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;text-decoration:none;transition:color .15s,border-color .15s;}' +
// 		'#cb-tab-nav .cb-tab-link.active{color:var(--blue-dark);font-weight:var(--fw-b);border-bottom:3px solid var(--blue-dark);}' +
// 		'#cb-tab-nav .cb-tab-link:hover{color:var(--blue-dark);}' +
// 		'.cb-tab-pane{display:none;}.cb-tab-pane.active{display:block;}' +
// 		'.cb-filter-row{padding:8px 0;margin-bottom:10px;}' +
// 		'.cb-filter-row .col-md-3,.cb-filter-row .col-sm-12{padding-left:8px;padding-right:8px;}' +
// 		'@media(max-width:768px){.cb-filter-row .col-md-3{width:100%;margin-bottom:8px;}}' +
// 		'.cb-controls{display:flex;align-items:center;padding:7px 12px;margin-bottom:12px;background:#f7f9fb;border:1px solid #e2e6ea;border-radius:6px;flex-wrap:wrap;gap:8px;}' +
// 		'.cb-controls-left{display:flex;align-items:center;gap:8px;flex:1;flex-wrap:wrap;}' +
// 		'.cb-controls-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}' +
// 		'.cb-search-wrap{position:relative;display:flex;align-items:center;}' +
// 		'.cb-search-wrap .search-icon{position:absolute;left:8px;color:#8d99a6;pointer-events:none;}' +
// 		'.cb-search-input{padding:5px 8px 5px 28px;border:1.5px solid var(--bdl);border-radius:4px;font-family:var(--font);font-size:var(--fs-sm);color:var(--txt2);background:#fff;width:220px;height:32px;transition:border-color .15s,box-shadow .15s;}' +
// 		'.cb-search-input:focus{outline:none;border-color:#5e64ff;box-shadow:0 0 0 2px rgba(94,100,255,.15);}' +
// 		'.cb-checkbox-area{display:flex;gap:12px;align-items:center;}' +
// 		'.cb-check-label{display:flex;align-items:center;gap:5px;font-family:var(--font);font-size:var(--fs-sm);font-weight:var(--fw-m);color:var(--txt2);cursor:pointer;user-select:none;white-space:nowrap;}' +
// 		'.cb-check-label input[type=checkbox]{width:14px;height:14px;cursor:pointer;accent-color:#5e64ff;}' +
// 		'.cb-xl-btn{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;height:32px;font-family:var(--font);font-size:var(--fs-sm);font-weight:var(--fw-sb);cursor:pointer;white-space:nowrap;border:1px solid #1a1a1a;border-radius:4px;background:#1a1a1a;color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.15);transition:background .15s;}' +
// 		'.cb-xl-btn:hover{background:#333;}.cb-xl-btn svg{flex-shrink:0;color:#fff;}' +
// 		'#xl-export-all svg{vertical-align:middle;margin-right:3px;}' +
// 		'.cb-scroll-wrapper{border:1.5px solid var(--bdl);border-radius:6px;overflow:auto;max-height:72vh;background:#fff;position:relative;isolation:isolate;}' +

// 		/* ══ NUCLEAR BORDER FIX — scoped under .cb-wrapper ══ */
// 		'.cb-wrapper table{border-collapse:collapse !important;border-spacing:0 !important;}' +
// 		'.cb-wrapper table th,.cb-wrapper table td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;text-align:right;font-family:var(--font);font-size:var(--fs-base);}' +
// 		'.cb-wrapper table th:first-child,.cb-wrapper table td:first-child{text-align:left !important;}' +
// 		'.cb-wrapper table thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);text-align:center !important;position:sticky;top:0;z-index:25;border:1.5px solid var(--bdh) !important;padding:10px 12px;letter-spacing:.1px;}' +
// 		'.cb-wrapper table thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);text-align:center !important;position:sticky;top:0;z-index:24;border:1.5px solid var(--bdo) !important;min-width:110px;padding:8px 12px;}' +
// 		'.cb-wrapper table tr.cb-row-head td{background:var(--blue-light) !important;color:var(--blue-dark);font-weight:var(--fw-b);border:1.5px solid var(--bdl) !important;cursor:pointer;}' +
// 		'.cb-wrapper table tr.cb-row-head:hover td{background:#d0e8f5 !important;}' +
// 		'.cb-wrapper table tr.cb-row-sub td{background:var(--orange-light) !important;font-weight:var(--fw-sb);border:1.5px solid var(--bdl) !important;cursor:pointer;}' +
// 		'.cb-wrapper table tr.cb-row-sub:hover td{background:#ffe0c2 !important;}' +
// 		'.cb-wrapper table tr.cb-row-grand td{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);border:1.5px solid var(--bdh) !important;}' +
// 		'.cb-wrapper table tr.ppt-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b);border:1.5px solid #9baab5 !important;}' +
// 		'.cb-wrapper table tr.sinr-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b) !important;border:1.5px solid #9baab5 !important;}' +
// 		'.cb-wrapper .ppt-table-wrap tbody tr td{background:#fff;color:var(--txt);font-weight:var(--fw-n);}' +

// 		/* ── Non-border cosmetic rules ── */
// 		'.cb-table,.ppt-table-wrap{width:100%;table-layout:auto;font-family:var(--font);font-size:var(--fs-base);color:var(--txt);line-height:1.45;}' +
// 		'.cb-text-accent{color:var(--blue-mid);font-weight:var(--fw-sb);}' +
// 		'.ppt-title-bar{margin:14px 0 4px;}' +
// 		'.ppt-main-title{font-family:var(--font);font-size:var(--fs-md);font-weight:var(--fw-b);text-transform:uppercase;text-decoration:underline;letter-spacing:.4px;color:var(--txt);}' +
// 		'.ppt-currency-label{font-family:var(--font);font-size:var(--fs-sm);font-style:italic;color:var(--muted);text-align:right;margin-bottom:6px;}' +
// 		'.ppt-currency-label strong{font-weight:var(--fw-b);font-size:var(--fs-sm);font-style:normal;}' +
// 		'.ppt-dash{color:#bbb;text-align:center;display:block;}' +
// 		'.ppt-sub-item-row td:first-child{padding-left:28px !important;font-style:italic;color:#444;}' +

// 		/* ── Budget & Estimate sticky col ── */
// 		'#be-table tbody td:first-child{position:sticky;left:0;z-index:10;text-align:left !important;min-width:280px;max-width:280px;white-space:normal;word-break:break-word;background:#fff;}' +
// 		'#be-table .cb-row-head td:first-child{background:var(--blue-light) !important;}' +
// 		'#be-table .cb-row-sub td:first-child{background:var(--orange-light) !important;}' +
// 		'#be-table .cb-row-grand td:first-child{background:var(--blue-mid) !important;}' +
// 		'#be-table thead tr.cb-thead-main th:first-child{position:sticky;left:0;z-index:50 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:280px;}' +
// 		'#be-table .be-grand-col{background:#ddeaf7 !important;color:var(--blue-dark);border-left:2px solid var(--blue-mid) !important;}' +
// 		'#be-table .cb-row-grand .be-grand-col{background:var(--blue-dark) !important;color:#fff !important;}' +
// 		'#be-table .cb-row-head .be-grand-col{background:var(--blue-dark) !important;color:#fff !important;}' +
// 		'#be-table .cb-row-sub .be-grand-col{background:#f0ddd0 !important;color:#7a3b00 !important;}' +
// 		'#be-table .cb-thead-main th:not(:first-child){min-width:260px;text-align:center !important;}' +
// 		'#be-table .cb-thead-sub th{min-width:130px;text-align:center !important;}' +
// 		'#be-table tbody td:first-child,#be-table thead th:first-child{box-shadow:2px 0 4px -2px rgba(0,0,0,.12);}' +

// 		/* ── Summary INR labels ── */
// 		'.sinr-section-label{margin:18px 0 5px;font-family:var(--font);font-size:var(--fs-sm);font-weight:var(--fw-b);color:var(--txt);text-decoration:underline;letter-spacing:.2px;}' +
// 		'.sinr-currency-note{text-align:right;font-family:var(--font);font-size:var(--fs-xs);font-style:italic;color:var(--muted);margin-bottom:4px;}' +
// 		'.sinr-sub-item td:first-child{padding-left:22px !important;color:#444;}.sinr-covid-row td{color:#444;}' +

// 		/* ── sinr-table-a sticky cols ── */
// 		'#sinr-table-a thead tr.cb-thead-main th:first-child{position:sticky;left:0;z-index:50 !important;background:var(--blue-mid) !important;}' +
// 		'#sinr-table-a thead tr.cb-thead-sub th:first-child{position:sticky;left:0;z-index:49 !important;background:var(--orange) !important;}' +
// 		'#sinr-table-a tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);}' +
// 		'#sinr-table-a .sinr-total-row td:first-child{background:#e8f0fa !important;}' +
// 		'#sinr-table-a .sinr-covid-row td:first-child{background:#fff;}' +

// 		/* ── sinr-table-b sticky + layout ── */
// 		'#sinr-table-b thead tr:nth-child(1) th{position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}' +
// 		'#sinr-table-b thead tr:nth-child(2) th{position:sticky;z-index:24;text-align:center !important;padding:8px 12px;min-width:110px;}' +
// 		'#sinr-table-b thead tr th:first-child{position:sticky !important;left:0;text-align:left !important;min-width:210px;box-shadow:2px 0 5px -2px rgba(0,0,0,.18);}' +
// 		'#sinr-table-b thead tr:nth-child(1) th:first-child{z-index:55 !important;}' +
// 		'#sinr-table-b thead tr:nth-child(2) th:first-child{z-index:54 !important;}' +
// 		'#sinr-table-b tbody td:first-child{position:sticky;left:0;z-index:10;text-align:left !important;min-width:210px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);}' +
// 		'#sinr-table-b tbody tr.sinr-unit-hdr td{background:var(--blue-light) !important;color:var(--blue-dark);font-weight:var(--fw-b);}' +
// 		'#sinr-table-b tbody tr.sinr-brkdwn-plan td{background:#fff !important;}' +
// 		'#sinr-table-b tbody tr.sinr-brkdwn-act td{background:#fafafa !important;}' +
// 		'#sinr-table-b tbody tr.sinr-spacer td{background:#f4f6f8 !important;padding:2px 0;}' +
// 		'#sinr-table-b tbody tr.sinr-gt-plan td,#sinr-table-b tbody tr.sinr-gt-act td{background:#ddeaf7 !important;color:var(--blue-dark);font-weight:var(--fw-sb);}' +
// 		'#sinr-table-b tbody td{text-align:right;padding:8px 12px;white-space:nowrap;}' +

// 		/* ── Cost per Employee (CPE) table ── */
// 		'#sinr-cpe-wrap{margin-top:28px;}' +
// 		'#sinr-cpe-hc-table{border-collapse:collapse !important;width:100%;}' +
// 		'#sinr-cpe-hc-table th,#sinr-cpe-hc-table td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;font-family:var(--font);font-size:var(--fs-base);}' +
// 		'#sinr-cpe-hc-table thead tr:first-child th{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-xl);text-align:center !important;position:sticky;top:0;z-index:25;border:1.5px solid var(--bdh) !important;padding:10px 12px;}' +
// 		'#sinr-cpe-hc-table thead tr:first-child th:first-child{text-align:left !important;position:sticky;left:0;z-index:50 !important;}' +
// 		'#sinr-cpe-hc-table thead tr:last-child th{background:var(--orange) !important;color:#fff !important;font-weight:var(--fw-sb);font-size:var(--fs-lg);text-align:center !important;position:sticky;z-index:24;border:1.5px solid var(--bdo) !important;padding:8px 12px;}' +
// 		'#sinr-cpe-hc-table thead tr:last-child th:first-child{position:sticky;left:0;z-index:49 !important;background:var(--orange) !important;text-align:left !important;}' +
// 		'#sinr-cpe-hc-table tbody td{text-align:right;}' +
// 		'#sinr-cpe-hc-table tbody td:first-child{text-align:left !important;position:sticky;left:0;z-index:10;background:#fff;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);font-weight:var(--fw-n);}' +
// 		'#sinr-cpe-hc-table tbody tr.cpe-hc-dash-row td{color:#888;font-style:italic;}' +
// 		'#sinr-cpe-hc-table tbody tr.cpe-hc-dash-row td:first-child{background:#fff;}' +
// 		'#sinr-cpe-table{border-collapse:collapse !important;width:100%;}' +
// 		'#sinr-cpe-table th,#sinr-cpe-table td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;font-family:var(--font);font-size:var(--fs-base);}' +
// 		'#sinr-cpe-table thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-xl);text-align:center !important;position:sticky;top:0;z-index:25;border:1.5px solid var(--bdh) !important;padding:10px 12px;}' +
// 		'#sinr-cpe-table thead tr.cb-thead-main th:first-child{position:sticky;left:0;z-index:50 !important;text-align:left !important;min-width:220px;}' +
// 		'#sinr-cpe-table thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-weight:var(--fw-sb);font-size:var(--fs-lg);text-align:center !important;position:sticky;z-index:24;border:1.5px solid var(--bdo) !important;min-width:100px;padding:8px 12px;}' +
// 		'#sinr-cpe-table thead tr.cb-thead-sub th:first-child{position:sticky;left:0;z-index:49 !important;background:var(--orange) !important;text-align:left !important;}' +
// 		'#sinr-cpe-table thead tr.cb-thead-sub2 th{background:#1a4a6e !important;color:#fff !important;font-weight:var(--fw-m);font-size:var(--fs-sm);text-align:center !important;position:sticky;z-index:23;border:1.5px solid #0d2f47 !important;min-width:90px;padding:7px 10px;}' +
// 		'#sinr-cpe-table thead tr.cb-thead-sub2 th:first-child{position:sticky;left:0;z-index:48 !important;background:#1a4a6e !important;text-align:left !important;}' +
// 		'#sinr-cpe-table tbody td{text-align:right;}' +
// 		'#sinr-cpe-table tbody td:first-child{text-align:left !important;position:sticky;left:0;z-index:10;background:#fff;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);min-width:220px;}' +
// 		'#sinr-cpe-table tbody tr.cpe-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b) !important;border:1.5px solid #9baab5 !important;}' +
// 		'#sinr-cpe-table tbody tr.cpe-total-row td:first-child{background:#e8f0fa !important;}' +
// 		'#sinr-cpe-table tbody tr.cpe-increase-neg{color:#c0392b;}' +
// 		'#sinr-cpe-table tbody tr.cpe-increase-pos{color:#1a7a3a;}' +

// 		'.hc-section-title{margin:20px 0 6px;font-family:var(--font);font-size:var(--fs-md);font-weight:var(--fw-b);color:var(--blue-dark);text-transform:uppercase;letter-spacing:.4px;border-left:4px solid var(--blue-mid);padding-left:10px;}' +
// 		'#global-loader.loader-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(18,18,18,.92);backdrop-filter:blur(6px);display:none;z-index:999999;align-items:center;justify-content:center;}' +
// 		'.loader-box{display:flex;flex-direction:column;align-items:center;gap:14px;}' +
// 		'.loader-logo{width:90px;height:90px;border-radius:50%;background:linear-gradient(145deg,#fff,#eaeaea);padding:14px;object-fit:contain;box-shadow:0 10px 30px rgba(0,0,0,.35);animation:lp 1.6s infinite ease-in-out;}' +
// 		'.loader-text{font-family:var(--font);font-size:var(--fs-sm);color:#fff;font-weight:var(--fw-sb);letter-spacing:.5px;opacity:.85;}' +
// 		'.loader-text::after{content:"";display:inline-block;width:1em;animation:ld 1.5s infinite;}' +
// 		'@keyframes lp{0%,100%{transform:scale(1);opacity:.8;}50%{transform:scale(1.08);opacity:1;}}' +
// 		'@keyframes ld{0%{content:"";}33%{content:".";}66%{content:"..";}100%{content:"...";}}' +
// 		/* ── Prevent sticky table headers from painting over Frappe page chrome ── */
// 		'.cb-wrapper{isolation:isolate;}' +
// 		'.page-head,.navbar,.navbar-fixed-top,.page-container .page-head{z-index:1000 !important;}' +
// 		'</style>'
// 	);

// 	// =============================================================================
// 	// SHARED HELPERS
// 	// =============================================================================

// 	function svgIcon() {
// 		return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
// 			'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
// 			'<polyline points="14 2 14 8 20 8"/>' +
// 			'<line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>' +
// 			'</svg>';
// 	}

// 	function fmtCr(v) {
// 		var n = parseFloat(v) || 0;
// 		if (!isFinite(n) || n === 0) { return '-'; }
// 		var res = n / 10000000;
// 		var neg = res < 0;
// 		var s   = Math.abs(res).toFixed(2).split('.');
// 		var ip  = s[0], dp = s[1];
// 		if (ip.length > 3) {
// 			ip = ip.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + ip.slice(-3);
// 		}
// 		return (neg ? '-' : '') + ip + '.' + dp;
// 	}

// 	function fmtCrDash(v) {
// 		var n = parseFloat(v) || 0;
// 		return (!isFinite(n) || n === 0) ? '<span class="ppt-dash">-</span>' : fmtCr(n);
// 	}

// 	function formatINR(v) {
// 		var n = Math.round(parseFloat(v) || 0);
// 		var neg = n < 0, s = String(Math.abs(n));
// 		if (s.length > 3) { s = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3); }
// 		return (neg ? '-' : '') + s;
// 	}

// 	// Format a number in Rs K (thousands), 1 decimal
// 	function fmtRsK(v) {
// 		var n = parseFloat(v) || 0;
// 		if (!isFinite(n) || n === 0) { return '-'; }
// 		var neg = n < 0;
// 		var res = Math.abs(n) / 1000;
// 		return (neg ? '-' : '') + res.toFixed(2);
// 	}

// 	// Format percent with sign
// 	function fmtPctSigned(v) {
// 		var n = parseFloat(v);
// 		if (isNaN(n) || !isFinite(n)) { return '-'; }
// 		return (n > 0 ? '+' : '') + Math.round(n) + '%';
// 	}

// 	function fmtPct(a, b) {
// 		a = parseFloat(a); b = parseFloat(b);
// 		if (!a || isNaN(a) || isNaN(b)) { return '-'; }
// 		return Math.round(((b / a) - 1) * 100) + '%';
// 	}

// 	function xlBtn(id, label) { return '<button class="cb-xl-btn" id="' + id + '">' + svgIcon() + label + '</button>'; }

// 	function controlsBar(searchId, placeholder, checks, exportId) {
// 		var chk = checks.map(function (c) { return '<label class="cb-check-label"><input type="checkbox" id="' + c.id + '"> ' + c.label + '</label>'; }).join('');
// 		return '<div class="cb-controls"><div class="cb-controls-left">' +
// 			'<div class="cb-search-wrap"><svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
// 			'<input type="text" id="' + searchId + '" class="cb-search-input" placeholder="' + placeholder + '"></div>' +
// 			'<div class="cb-checkbox-area">' + chk + '</div></div>' +
// 			'<div class="cb-controls-right">' + xlBtn(exportId, 'Export to Excel') + '</div></div>';
// 	}

// 	function fixStickySubHeader(sel) {
// 		var attempts = 0;
// 		function attempt() {
// 			var $t = $(sel);
// 			var $m = $t.find('thead tr.cb-thead-main');
// 			var $s = $t.find('thead tr.cb-thead-sub');
// 			if (!$m.length || !$s.length) { return; }
// 			var h = $m[0].getBoundingClientRect().height;
// 			if (!h) { h = $m.outerHeight(true) || 0; }
// 			if (h > 0) {
// 				$s.find('th').css('top', h + 'px');
// 			} else if (attempts++ < 10) {
// 				setTimeout(attempt, 50);
// 			}
// 		}
// 		setTimeout(attempt, 0);
// 	}

// 	// =============================================================================

// 	// =============================================================================
// 	// SHARED HEADCOUNT HELPERS (used by both SummaryINR and Headcount modules)
// 	// =============================================================================

// 	function swrapShared(inner) { return '<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' + inner + '</div>'; }

// 	function fyToMarchLabel(fy) {
// 		var p = (fy || '').split('-');
// 		if (p.length < 2) { return fy; }
// 		var startY = parseInt(p[0], 10) || 2000;
// 		var endY2  = parseInt(p[1], 10) || 0;
// 		var endFull = (endY2 > (startY % 100)) ? (Math.floor(startY / 100) * 100 + endY2) : (Math.floor(startY / 100) * 100 + 100 + endY2);
// 		return '31st March-' + endFull;
// 	}

// 	function buildClosingAvgTable(yrs, totals) {
// 		function avg(i) {
// 			if (i === 0) { var c0 = totals[yrs[0]]; return (c0 !== undefined && c0 !== null) ? c0 / 2 : null; }
// 			var p = totals[yrs[i - 1]], c = totals[yrs[i]];
// 			return (p !== undefined && c !== undefined) ? (p + c) / 2 : null;
// 		}
// 		function fmtNum(v) { if (v === null || v === undefined || isNaN(v)) { return '-'; } return Math.round(parseFloat(v)).toLocaleString('en-IN'); }
// 		function fmtPctCA(a, b) { if (!a || isNaN(a) || isNaN(b) || !isFinite(b / a)) { return '-'; } return (((b / a) - 1) * 100).toFixed(1) + '%'; }
// 		function fmtInc(v) { if (v === null || v === undefined || isNaN(v)) { return '-'; } return Math.round(parseFloat(v)).toLocaleString('en-IN'); }
// 		var bodyRows = '';
// 		yrs.forEach(function (fy, i) {
// 			var closing = totals[fy] !== undefined ? totals[fy] : null;
// 			var avgVal  = avg(i);
// 			var prevClosing = (i > 0 && totals[yrs[i-1]] !== undefined) ? totals[yrs[i-1]] : null;
// 			var prevAvg     = (i > 0) ? avg(i - 1) : null;
// 			var incClosing = (prevClosing !== null && closing !== null) ? (closing - prevClosing) : null;
// 			var incAvg     = (prevAvg !== null && avgVal !== null) ? (avgVal - prevAvg) : null;
// 			var pctClosing = (prevClosing !== null && prevClosing !== 0 && closing !== null) ? fmtPctCA(prevClosing, closing) : '-';
// 			var pctAvg     = (prevAvg !== null && prevAvg !== 0 && avgVal !== null) ? fmtPctCA(prevAvg, avgVal) : '-';
// 				bodyRows +=
// 				'<tr>' +
// 				'<td style="text-align:left;">' + fyToMarchLabel(fy) + '</td>' +
// 				'<td>' + fmtNum(closing) + '</td>' +
// 				'<td>' + fmtNum(avgVal) + '</td>' +
// 				'<td>' + (incClosing !== null ? fmtInc(incClosing) : '-') + '</td>' +
// 				'<td>' + (incAvg !== null ? fmtInc(incAvg) : '-') + '</td>' +
// 				'<td>' + pctClosing + '</td>' +
// 				'<td>' + pctAvg + '</td>' +
// 				'</tr>';
// 		});
// 		var thead =
// 			'<thead>' +
// 			'<tr class="cb-thead-main">' +
// 			'<th rowspan="2" style="text-align:left !important;min-width:180px;vertical-align:middle;"></th>' +
// 			'<th rowspan="2" style="text-align:center !important;min-width:110px;vertical-align:middle;">Closing<br>H/C</th>' +
// 			'<th rowspan="2" style="text-align:center !important;min-width:110px;vertical-align:middle;">Average<br>H/C</th>' +
// 			'<th colspan="2" style="text-align:center !important;min-width:200px;">Increase</th>' +
// 			'<th colspan="2" style="text-align:center !important;min-width:200px;">% Increase</th>' +
// 			'</tr>' +
// 			'<tr class="cb-thead-sub">' +
// 			'<th style="min-width:100px;">Closing</th>' +
// 			'<th style="min-width:100px;">Average</th>' +
// 			'<th style="min-width:100px;">Closing</th>' +
// 			'<th style="min-width:100px;">Average</th>' +
// 			'</tr>' +
// 			'</thead>';
// 		return swrapShared(
// 			'<table class="cb-table" style="width:100%;">' +
// 			thead +
// 			'<tbody>' + bodyRows + '</tbody>' +
// 			'</table>'
// 		);
// 	}

// 	// HTML SKELETON
// 	// =============================================================================

// 	$(page.body).append(
// 		'<div class="cb-wrapper">' +
// 		'<div class="frappe-control-group row cb-filter-row" id="cb-filter-row"></div>' +
// 		'<ul id="cb-tab-nav">' +
// 		'<li><a class="cb-tab-link active" data-tab="ppt">Foundation level/Overall metrics</a></li>' +
// 		'<li><a class="cb-tab-link" data-tab="summary_inr">Summary in INR</a></li>' +
// 		'<li><a class="cb-tab-link" data-tab="headcount">Headcount</a></li>' +
// 		'<li><a class="cb-tab-link" data-tab="annual_budget">Annual Budget Consolidated</a></li>' +
// 		'<li><a class="cb-tab-link" data-tab="estimate">Estimate Consolidated</a></li>' +
// 		'<li><a class="cb-tab-link" data-tab="budget_estimate">Budget &amp; Estimate</a></li>' +
// 		'</ul><div id="cb-tab-content">' +

// 		'<div class="cb-tab-pane active" id="tab-ppt">' +
// 		'<div style="display:flex;justify-content:flex-end;margin-bottom:8px;">' + xlBtn('xl-ppt', 'Export to Excel') + '</div>' +

// 		/* ── Current year table ── */
// 		'<div class="ppt-title-bar"><div class="ppt-main-title" id="ppt-main-title">Overall Foundation - Budget vs. Actual</div></div>' +
// 		'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
// 		'<div class="cb-scroll-wrapper" style="margin-bottom:20px;"><table id="ppt-table" class="ppt-table-wrap"><thead>' +
// 		'<tr class="cb-thead-main"><th rowspan="2" style="min-width:180px;">Unit</th><th colspan="3" id="ppt-budget-hdr">Budget</th><th colspan="3" id="ppt-est-hdr">Estimate</th></tr>' +
// 		'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Total</th><th>Opex</th><th>Capex</th><th>Total</th></tr>' +
// 		'</thead><tbody id="ppt-tbody"></tbody></table></div>' +

// 		/* ── Previous year table ── */
// 		'<div class="ppt-title-bar"><div class="ppt-main-title" id="ppt-prev-title">Overall Foundation - Previous Year Budget vs. Actual</div></div>' +
// 		'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
// 		'<div class="cb-scroll-wrapper" style="margin-bottom:20px;"><table id="ppt-prev-table" class="ppt-table-wrap"><thead>' +
// 		'<tr class="cb-thead-main"><th rowspan="2" style="min-width:180px;">Unit</th><th colspan="3" id="ppt-prev-budget-hdr">Budget</th><th colspan="3" id="ppt-prev-est-hdr">Estimate</th></tr>' +
// 		'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Total</th><th>Opex</th><th>Capex</th><th>Total</th></tr>' +
// 		'</thead><tbody id="ppt-prev-tbody"></tbody></table></div>' +

// 		/* ── Sub-item tables injected here ── */
// 		'<div id="ppt-sub-tables"></div>' +

// 		'</div>' + /* end tab-ppt */

// 		'<div class="cb-tab-pane" id="tab-summary_inr"></div>' +
// 		'<div class="cb-tab-pane" id="tab-headcount"></div>' +

// 		'<div class="cb-tab-pane" id="tab-annual_budget">' +
// 		controlsBar('annual-search', 'Search expense / item\u2026', [{ id: 'annual-expand-quarters', label: 'Expand Quarters' }, { id: 'annual-expand-items', label: 'Expand Line Items' }], 'xl-annual') +
// 		'<div class="cb-scroll-wrapper"><table class="cb-table" id="annual-table"><thead></thead><tbody></tbody></table></div></div>' +

// 		'<div class="cb-tab-pane" id="tab-estimate">' +
// 		controlsBar('estimate-search', 'Search expense / item\u2026', [{ id: 'estimate-expand-quarters', label: 'Expand Quarters' }, { id: 'estimate-expand-items', label: 'Expand Line Items' }], 'xl-estimate') +
// 		'<div class="cb-scroll-wrapper"><table class="cb-table" id="estimate-table"><thead></thead><tbody id="estimate-tbody"></tbody></table></div></div>' +

// 		'<div class="cb-tab-pane" id="tab-budget_estimate">' +
// 		controlsBar('be-search', 'Search expense / item\u2026', [{ id: 'be-expand-items', label: 'Expand Line Items' }], 'xl-be') +
// 		'<div class="cb-scroll-wrapper"><table class="cb-table" id="be-table"><thead></thead><tbody id="be-tbody"></tbody></table></div></div>' +

// 		'</div></div>'
// 	);

// 	// =============================================================================
// 	// FINANCIAL YEAR FILTER
// 	// =============================================================================

// 	var fyControl = frappe.ui.form.make_control({
// 		parent: $('<div class="col-md-3 col-sm-12"></div>').appendTo('#cb-filter-row'),
// 		df: {
// 			label: 'Financial Year', fieldtype: 'Select', fieldname: 'financial_year', reqd: 1,
// 			change: function () {
// 				var y = this.get_value(); if (!y) { return; }
// 				updatePageTitle(y); TabLoader.resetAll();
// 				TabLoader.trigger($('#cb-tab-nav .cb-tab-link.active').data('tab'));
// 			}
// 		},
// 		render_input: true
// 	});
// 	fyControl.refresh();

// 	frappe.call({
// 		method: 'annual_budget.api.filter_options.get_financial_year_list',
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) { return; }
// 			var years = r.message.map(function (d) { return d.financial_year; });
// 			fyControl.df.options = years.join('\n'); fyControl.refresh();
// 			var today = new Date(), y = today.getFullYear(), m = today.getMonth() + 1;
// 			var cur = (m >= 4 ? y : y - 1) + '-' + String(m >= 4 ? y + 1 : y).slice(-2);
// 			var target = years.indexOf(cur) !== -1 ? cur : years[0];
// 			fyControl.set_value(target); updatePageTitle(target);
// 		}
// 	});

// 	// =============================================================================
// 	// TAB SWITCHING + LOADER
// 	// =============================================================================

// 	$(document).on('click', '#cb-tab-nav .cb-tab-link', function () {
// 		var tab = $(this).data('tab');
// 		$('#cb-tab-nav .cb-tab-link').removeClass('active'); $('.cb-tab-pane').removeClass('active');
// 		$(this).addClass('active'); $('#tab-' + tab).addClass('active');
// 		TabLoader.trigger(tab);
// 	});

// 	var TabLoader = (function () {
// 		var loaded = {};
// 		var map = {
// 			ppt: function (fy) { PPT.load(fy); },
// 			summary_inr: function (fy) { SummaryINR.load(fy); },
// 			headcount: function (fy) { Headcount.load(fy); },
// 			annual_budget: function (fy) { Annual.load(fy); },
// 			estimate: function (fy) { Estimate.load(fy); },
// 			budget_estimate: function (fy) { BudgetEstimate.load(fy); }
// 		};
// 		return {
// 			trigger: function (tab) {
// 				if (!map[tab]) { return; }
// 				var fy = fyControl.get_value() || '2025-26';
// 				if (loaded[tab] === fy) { return; }
// 				loaded[tab] = fy; map[tab](fy);
// 			},
// 			resetAll: function () { loaded = {}; }
// 		};
// 	})();

// 	// =============================================================================
// 	// EXCEL EXPORT
// 	// =============================================================================

// 	function serverExport(method, args, msg) {
// 		Loader.show(msg || 'Preparing your Excel file');
// 		frappe.call({
// 			method: method, args: args,
// 			callback: function (r) {
// 				Loader.hide();
// 				if (r.message && r.message.data) {
// 					var bin = atob(r.message.data), bytes = new Uint8Array(bin.length);
// 					for (var i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); }
// 					var url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
// 					var a = document.createElement('a'); a.href = url; a.download = r.message.filename;
// 					document.body.appendChild(a); a.click();
// 					setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
// 				} else { frappe.msgprint('Export failed \u2014 no data returned.'); }
// 			},
// 			error: function () { Loader.hide(); frappe.msgprint('Server error during export.'); }
// 		});
// 	}

// 	// =============================================================================
// 	// PPT MODULE
// 	// =============================================================================

// 	var PPT = (function () {
// 		var currentFY = '';

// 		function normSec(s) { return (s || '').replace(/\s+/g, ' ').trim().toUpperCase(); }

// 		function extractVals(sections, field) {
// 			var opex = 0, capex = 0, hasBreakdown = false;
// 			(sections || []).forEach(function (sec) {
// 				var nm = normSec(sec.name);
// 				if (sec.sequence_id === 9999 || nm === 'GRAND TOTAL') { return; }
// 				if (nm.indexOf('OPERATING') !== -1) { opex  += parseFloat(sec[field] || 0); hasBreakdown = true; }
// 				if (nm.indexOf('CAPITAL')   !== -1) { capex += parseFloat(sec[field] || 0); hasBreakdown = true; }
// 			});
// 			if (!hasBreakdown) {
// 				(sections || []).forEach(function (sec) {
// 					if (sec.sequence_id === 9999 || normSec(sec.name) === 'GRAND TOTAL') {
// 						opex += parseFloat(sec[field] || 0);
// 					}
// 				});
// 				if (!opex) {
// 					(sections || []).forEach(function (sec) {
// 						if (sec.sequence_id !== 9999 && normSec(sec.name) !== 'GRAND TOTAL') {
// 							opex += parseFloat(sec[field] || 0);
// 						}
// 					});
// 				}
// 			}
// 			return { opex: opex, capex: capex };
// 		}

// 		function extractTotal(sections, field) {
// 			var gt = 0;
// 			(sections || []).forEach(function (sec) {
// 				if (sec.sequence_id === 9999 || normSec(sec.name) === 'GRAND TOTAL') {
// 					gt += parseFloat(sec[field] || 0);
// 				}
// 			});
// 			if (!gt) {
// 				(sections || []).forEach(function (sec) { gt += parseFloat(sec[field] || 0); });
// 			}
// 			return gt;
// 		}

// 		function buildRows(data, cfg) {
// 			var rows = (data || []).slice()
// 				.sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); })
// 				.map(function (e) {
// 					var b = extractVals(e[cfg.key] || [], cfg.budgetField);
// 					var v = extractVals(e[cfg.key] || [], cfg.actualField);
// 					var bTot = extractTotal(e[cfg.key] || [], cfg.budgetField);
// 					var eTot = extractTotal(e[cfg.key] || [], cfg.actualField);
// 					return { label: e.label || '', bOpex: b.opex, bCapex: b.capex, bTotal: bTot, eOpex: v.opex, eCapex: v.capex, eTotal: eTot };
// 				});
// 			var tot = { bOpex: 0, bCapex: 0, bTotal: 0, eOpex: 0, eCapex: 0, eTotal: 0 };
// 			rows.forEach(function (r) { tot.bOpex += r.bOpex; tot.bCapex += r.bCapex; tot.bTotal += r.bTotal; tot.eOpex += r.eOpex; tot.eCapex += r.eCapex; tot.eTotal += r.eTotal; });
// 			rows.push({ label: 'Total', isTotal: true, bOpex: tot.bOpex, bCapex: tot.bCapex, bTotal: tot.bTotal, eOpex: tot.eOpex, eCapex: tot.eCapex, eTotal: tot.eTotal });
// 			return rows;
// 		}

// 		function renderTable(rows, tbId, bHdr, eHdr, tblId, bLbl, eLbl) {
// 			$('#' + bHdr).text(bLbl); $('#' + eHdr).text(eLbl);
// 			var $tb = $('#' + tbId).empty();
// 			rows.forEach(function (r) {
// 				$tb.append('<tr class="' + (r.isTotal ? 'ppt-total-row' : '') + '"><td>' + r.label + '</td>' +
// 					'<td>' + fmtCrDash(r.bOpex) + '</td><td>' + fmtCrDash(r.bCapex) + '</td><td>' + fmtCrDash(r.bTotal) + '</td>' +
// 					'<td>' + fmtCrDash(r.eOpex) + '</td><td>' + fmtCrDash(r.eCapex) + '</td><td>' + fmtCrDash(r.eTotal) + '</td></tr>');
// 			});
// 			fixStickySubHeader('#' + tblId);
// 		}

// 		function buildEducationTables(data, cfg, bLbl, eLbl) {
// 			var subItems = (data || []).filter(function (e) { return e.is_this_sub_item === 1; });
// 			if (!subItems.length) { return ''; }

// 			var groups = {}, groupOrder = [];
// 			subItems.forEach(function (e) {
// 				var grp = (e.table_name || 'Other').trim();
// 				if (!groups[grp]) { groups[grp] = []; groupOrder.push(grp); }
// 				groups[grp].push(e);
// 			});

// 			var html = '';

// 			groupOrder.forEach(function (grp) {
// 				var entries = groups[grp].slice()
// 					.sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });

// 				var sectionTitle = "EDUCATION";
// 				var tblId = 'ppt-edu-' + grp.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');

// 				var bodyHtml = '';
// 				var tot = { bOpex: 0, bCapex: 0, bTotal: 0, eOpex: 0, eCapex: 0, eTotal: 0 };

// 				entries.forEach(function (e) {
// 					var b    = extractVals(e[cfg.key] || [], cfg.budgetField);
// 					var v    = extractVals(e[cfg.key] || [], cfg.actualField);
// 					var bTot = extractTotal(e[cfg.key] || [], cfg.budgetField);
// 					var eTot = extractTotal(e[cfg.key] || [], cfg.actualField);
// 					tot.bOpex  += b.opex;  tot.bCapex += b.capex; tot.bTotal += bTot;
// 					tot.eOpex  += v.opex;  tot.eCapex += v.capex; tot.eTotal += eTot;

// 					bodyHtml += '<tr>' +
// 						'<td>' + (e.label || '') + '</td>' +
// 						'<td>' + fmtCrDash(b.opex)  + '</td>' +
// 						'<td>' + fmtCrDash(b.capex) + '</td>' +
// 						'<td>' + fmtCrDash(bTot)    + '</td>' +
// 						'<td>' + fmtCrDash(v.opex)  + '</td>' +
// 						'<td>' + fmtCrDash(v.capex) + '</td>' +
// 						'<td>' + fmtCrDash(eTot)    + '</td></tr>';
// 				});

// 				bodyHtml += '<tr class="ppt-total-row">' +
// 					'<td>Total</td>' +
// 					'<td>' + fmtCrDash(tot.bOpex)  + '</td>' +
// 					'<td>' + fmtCrDash(tot.bCapex) + '</td>' +
// 					'<td>' + fmtCrDash(tot.bTotal) + '</td>' +
// 					'<td>' + fmtCrDash(tot.eOpex)  + '</td>' +
// 					'<td>' + fmtCrDash(tot.eCapex) + '</td>' +
// 					'<td>' + fmtCrDash(tot.eTotal) + '</td></tr>';

// 				html +=
// 					'<div class="ppt-title-bar" style="margin-top:28px;">' +
// 						'<div class="ppt-main-title">' + sectionTitle + '</div>' +
// 					'</div>' +
// 					'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
// 					'<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' +
// 						'<table id="' + tblId + '" class="ppt-table-wrap">' +
// 							'<thead>' +
// 								'<tr class="cb-thead-main">' +
// 									'<th rowspan="2" style="min-width:200px;text-align:left !important;">Unit</th>' +
// 									'<th colspan="3" style="text-align:center !important;">' + bLbl + '</th>' +
// 									'<th colspan="3" style="text-align:center !important;">' + eLbl + '</th>' +
// 								'</tr>' +
// 								'<tr class="cb-thead-sub">' +
// 									'<th>Opex</th><th>Capex</th><th>Total</th>' +
// 									'<th>Opex</th><th>Capex</th><th>Total</th>' +
// 								'</tr>' +
// 							'</thead>' +
// 							'<tbody>' + bodyHtml + '</tbody>' +
// 						'</table>' +
// 					'</div>';
// 			});

// 			return html;
// 		}

// 		function buildOpexBudgetTable(entries, fyLabel) {
// 			if (!entries || !entries.length) { return ''; }

// 			function isOpex(name) {
// 				return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1;
// 			}

// 			function getSubPlan(e, subName) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isOpex(s.name)) { return; }
// 					(s.sub_heads || []).forEach(function (sub) {
// 						if ((sub.name || '').trim() === subName) {
// 							v += parseFloat(sub.ytd || 0);
// 						}
// 					});
// 				});
// 				return v;
// 			}

// 			function getOpexPlan(e) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (isOpex(s.name)) {
// 						v += parseFloat(s.ytd || 0);
// 					}
// 				});
// 				return v;
// 			}

// 			var subHeadNames = [], seen = {};
// 			entries.forEach(function (e) {
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isOpex(s.name)) { return; }
// 					(s.sub_heads || []).forEach(function (sub) {
// 						var n = (sub.name || '').trim();
// 						if (n && !seen[n]) { seen[n] = true; subHeadNames.push(n); }
// 					});
// 				});
// 			});

// 			if (!subHeadNames.length) { return ''; }

// 			var tblId = 'ppt-opex-budget-tbl';

// 			if (!$('#ppt-opex-style').length) {
// 				$('head').append(
// 					'<style id="ppt-opex-style">' +
// 					'#' + tblId + '{border-collapse:collapse !important;width:100%;}' +
// 					'#' + tblId + ' th,#' + tblId + ' td{border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th{border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:50 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:260px;border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:260px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' tbody tr.cb-row-grand td:first-child{background:var(--blue-mid) !important;border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' tbody tr.ppt-total-row td:first-child{background:#e8f0fa !important;border:1.5px solid #aaa !important;}' +
// 					'</style>'
// 				);
// 			}

// 			var hdrR1 = '<tr class="cb-thead-main">' +
// 				'<th style="min-width:260px;text-align:left !important;">Expense Category</th>';
// 			entries.forEach(function (e) {
// 				hdrR1 += '<th style="min-width:150px;text-align:center !important;">' + (e.label || '').trim() + '</th>';
// 			});
// 			hdrR1 += '<th style="min-width:150px;text-align:center !important;background:var(--blue-dark);">Grand Total</th></tr>';

// 			var bodyHtml = '';
// 			var colTotals = [];
// 			entries.forEach(function () { colTotals.push(0); });
// 			var grandRowTotal = 0;

// 			subHeadNames.forEach(function (subName) {
// 				var rowTotal = 0, cells = '';
// 				entries.forEach(function (e, ei) {
// 					var v = getSubPlan(e, subName);
// 					colTotals[ei] += v;
// 					rowTotal += v;
// 					cells += '<td>' + fmtCrDash(v) + '</td>';
// 				});
// 				grandRowTotal += rowTotal;
// 				bodyHtml += '<tr>' +
// 					'<td>' + subName + '</td>' +
// 					cells +
// 					'<td style="font-weight:700;background:#ddeaf7;color:var(--blue-dark);border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(rowTotal) + '</td>' +
// 				'</tr>';
// 			});

// 			var totalCells = '';
// 			var opexGrandTotal = 0;
// 			entries.forEach(function (e) {
// 				var v = getOpexPlan(e);
// 				opexGrandTotal += v;
// 				totalCells += '<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(v) + '</td>';
// 			});
// 			bodyHtml += '<tr class="ppt-total-row">' +
// 				'<td>Total</td>' +
// 				totalCells +
// 				'<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(opexGrandTotal) + '</td>' +
// 			'</tr>';

// 			var fyPart = fyLabel.replace(/\s*budget\s*/i, '').trim();

// 			return '<div class="ppt-title-bar" style="margin-top:36px;">' +
// 					'<div class="ppt-main-title">OPERATING EXPENSES ' + fyPart + '</div>' +
// 				'</div>' +
// 				'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
// 				'<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' +
// 					'<table id="' + tblId + '" class="cb-table">' +
// 						'<thead>' + hdrR1 + '</thead>' +
// 						'<tbody>' + bodyHtml + '</tbody>' +
// 					'</table>' +
// 				'</div>';
// 		}

// 		function buildCapexBudgetTable(entries, fyLabel) {
// 			if (!entries || !entries.length) { return ''; }

// 			function isCapex(name) {
// 				return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('CAPITAL') !== -1;
// 			}

// 			function getItemPlan(e, itemName) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isCapex(s.name)) { return; }
// 					(s.items || []).forEach(function (item) {
// 						if ((item.name || '').trim() === itemName) {
// 							v += parseFloat(item.ytd || 0);
// 						}
// 					});
// 				});
// 				return v;
// 			}

// 			function getCapexPlan(e) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (isCapex(s.name)) {
// 						v += parseFloat(s.ytd || 0);
// 					}
// 				});
// 				return v;
// 			}

// 			var itemNames = [], seen = {};
// 			entries.forEach(function (e) {
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isCapex(s.name)) { return; }
// 					(s.items || []).forEach(function (item) {
// 						var n = (item.name || '').trim();
// 						if (n && !seen[n]) { seen[n] = true; itemNames.push(n); }
// 					});
// 				});
// 			});

// 			if (!itemNames.length) { return ''; }

// 			var tblId = 'ppt-capex-budget-tbl';

// 			if (!$('#ppt-capex-style').length) {
// 				$('head').append(
// 					'<style id="ppt-capex-style">' +
// 					'#' + tblId + '{border-collapse:collapse !important;width:100%;}' +
// 					'#' + tblId + ' th,#' + tblId + ' td{border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th{border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:50 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:260px;border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:260px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' tbody tr.cb-row-grand td:first-child{background:var(--blue-mid) !important;border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' tbody tr.ppt-total-row td:first-child{background:#e8f0fa !important;border:1.5px solid #aaa !important;}' +
// 					'</style>'
// 				);
// 			}

// 			var hdrR1 = '<tr class="cb-thead-main">' +
// 				'<th style="min-width:260px;text-align:left !important;">Expense Category</th>';
// 			entries.forEach(function (e) {
// 				hdrR1 += '<th style="min-width:150px;text-align:center !important;">' + (e.label || '').trim() + '</th>';
// 			});
// 			hdrR1 += '<th style="min-width:150px;text-align:center !important;background:var(--blue-dark);">Grand Total</th></tr>';

// 			var bodyHtml = '';
// 			var grandRowTotal = 0;

// 			itemNames.forEach(function (itemName) {
// 				var rowTotal = 0, cells = '';
// 				entries.forEach(function (e) {
// 					var v = getItemPlan(e, itemName);
// 					rowTotal += v;
// 					cells += '<td>' + fmtCrDash(v) + '</td>';
// 				});
// 				grandRowTotal += rowTotal;
// 				bodyHtml += '<tr>' +
// 					'<td>' + itemName + '</td>' +
// 					cells +
// 					'<td style="font-weight:700;background:#ddeaf7;color:var(--blue-dark);border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(rowTotal) + '</td>' +
// 				'</tr>';
// 			});

// 			var totalCells = '';
// 			var capexGrandTotal = 0;
// 			entries.forEach(function (e) {
// 				var v = getCapexPlan(e);
// 				capexGrandTotal += v;
// 				totalCells += '<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(v) + '</td>';
// 			});
// 			bodyHtml += '<tr class="ppt-total-row">' +
// 				'<td>Total</td>' +
// 				totalCells +
// 				'<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(capexGrandTotal) + '</td>' +
// 			'</tr>';

// 			var fyPart = fyLabel.replace(/\s*budget\s*/i, '').trim();

// 			return '<div class="ppt-title-bar" style="margin-top:36px;">' +
// 					'<div class="ppt-main-title">CAPITAL EXPENSES ' + fyPart + '</div>' +
// 				'</div>' +
// 				'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
// 				'<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' +
// 					'<table id="' + tblId + '" class="cb-table">' +
// 						'<thead>' + hdrR1 + '</thead>' +
// 						'<tbody>' + bodyHtml + '</tbody>' +
// 					'</table>' +
// 				'</div>';
// 		}

// 		function load(fy) {
// 			currentFY = fy || '2025-26';
// 			$('#ppt-tbody,#ppt-prev-tbody').html(
// 				'<tr><td colspan="7" style="text-align:center;padding:24px;color:#aaa;">Loading\u2026</td></tr>'
// 			);
// 			$('#ppt-sub-tables').html('');
// 			Loader.show('Building your foundation metrics');

// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_foundation_overall',
// 				args: { financial_year: fy, month: 'March', table_name_filter: 'Foundation Overall' },
// 				callback: function (r) {
// 					var d = Array.isArray(r.message)
// 						? r.message
// 						: ((r.message && Array.isArray(r.message.message)) ? r.message.message : []);

// 					if (!d.length) {
// 						Loader.hide();
// 						$('#ppt-tbody,#ppt-prev-tbody').html(
// 							'<tr><td colspan="7" style="text-align:center;padding:24px;color:#aaa;">No data.</td></tr>'
// 						);
// 						return;
// 					}

// 					var p = (fy || '2025-26').split('-');
// 					var cS = parseInt(p[0], 10), cE = parseInt(p[1], 10);
// 					var curFY = cS + '-' + String(cE).padStart(2, '0');
// 					var prvFY = (cS - 1) + '-' + String(cE - 1).padStart(2, '0');

// 					$('#ppt-main-title').text('Overall Foundation \u2013 ' + curFY + ' Budget vs ' + prvFY + ' Actual');
// 					$('#ppt-prev-title').text('Overall Foundation \u2013 ' + prvFY + ' Budget vs ' + prvFY + ' Actual');

// 					var cCfg = { key: 'current_year',  budgetField: 'ytd', actualField: 'total_posted_amt_ytd' };
// 					var pCfg = { key: 'previous_year', budgetField: 'ytd', actualField: 'total_posted_amt_ytd' };

// 					var mainData = d.filter(function (e) { return e.is_this_sub_item !== 1; });
// 					var r0 = buildRows(mainData, cCfg);
// 					var r1 = buildRows(mainData, pCfg);

// 					renderTable(r0, 'ppt-tbody',      'ppt-budget-hdr',      'ppt-est-hdr',      'ppt-table',      curFY + ' Budget', prvFY + ' Actual');
// 					renderTable(r1, 'ppt-prev-tbody', 'ppt-prev-budget-hdr', 'ppt-prev-est-hdr', 'ppt-prev-table', prvFY + ' Budget', prvFY + ' Actual');

// 					var subHtml = buildEducationTables(d, cCfg, curFY + ' Budget', prvFY + ' Actual');
// 					$('#ppt-sub-tables').html(subHtml);

// 					$('#ppt-sub-tables .ppt-table-wrap').each(function () {
// 						var id = $(this).attr('id');
// 						if (id) { fixStickySubHeader('#' + id); }
// 					});

// 					frappe.call({
// 						method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan',
// 						args: { financial_year: fy, month: 'March', table_name_filter: 'Opex Capex' },
// 						callback: function (r2) {
// 							Loader.hide();
// 							var raw = Array.isArray(r2.message) ? r2.message
// 								: ((r2.message && Array.isArray(r2.message.message)) ? r2.message.message : []);
// 							var uwp = raw.filter(function (e) {
// 								return e.is_this_sub_item === 0
// 									&& e.sequence_id !== 9999
// 									&& (e.table_name || '').toUpperCase() !== 'CONSOLIDATED';
// 							}).sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });

// 							var opexHtml  = buildOpexBudgetTable(uwp, curFY);
// 							var capexHtml = buildCapexBudgetTable(uwp, curFY);

// 							$('#ppt-sub-tables').html(subHtml + opexHtml + capexHtml);

// 							$('#ppt-sub-tables .ppt-table-wrap').each(function () {
// 								var id = $(this).attr('id');
// 								if (id) { fixStickySubHeader('#' + id); }
// 							});
// 							fixStickySubHeader('#ppt-opex-budget-tbl');
// 							fixStickySubHeader('#ppt-capex-budget-tbl');
// 						},
// 						error: function () { Loader.hide(); }
// 					});

// 					var toExp = function (rows) {
// 						return rows.map(function (r) {
// 							return {
// 								label: r.label, bOpex: r.bOpex, bCapex: r.bCapex, bTotal: r.bTotal,
// 								eOpex: r.eOpex, eCapex: r.eCapex, eTotal: r.eTotal, is_total: !!r.isTotal
// 							};
// 						});
// 					};
// 					Store.ppt.rows         = toExp(r0);
// 					Store.ppt.prevRows     = toExp(r1);
// 					Store.ppt.budgetLabel  = curFY + ' Budget';
// 					Store.ppt.estLabel     = prvFY + ' Actual';
// 					Store.ppt.prevBudgetLabel = prvFY + ' Budget';
// 					Store.ppt.prevEstLabel    = prvFY + ' Actual';
// 				},
// 				error: function () {
// 					Loader.hide();
// 					$('#ppt-tbody,#ppt-prev-tbody').html(
// 						'<tr><td colspan="7" style="text-align:center;padding:24px;color:red;">Error loading data.</td></tr>'
// 					);
// 				}
// 			});
// 		}

// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// SUMMARY IN INR MODULE
// 	// =============================================================================

// 	var SummaryINR = (function () {
// 		function normN(s) { return (s || '').replace(/\s+/g, ' ').trim().toUpperCase(); }
// 		function zero() { return { opex_plan: 0, opex_act: 0, capex_plan: 0, capex_act: 0, total_plan: 0, total_act: 0 }; }
// 		function addV(a, b) { return { opex_plan: a.opex_plan + b.opex_plan, opex_act: a.opex_act + b.opex_act, capex_plan: a.capex_plan + b.capex_plan, capex_act: a.capex_act + b.capex_act, total_plan: a.total_plan + b.total_plan, total_act: a.total_act + b.total_act }; }
// 		function extractA(actuals) {
// 			var r = zero();
// 			(actuals || []).forEach(function (sec) {
// 				var nm = normN(sec.name);
// 				if (nm === 'OPERATING EXPENSES' || nm === 'OPERATING  EXPENSES') { r.opex_plan += parseFloat(sec.ytd || 0); r.opex_act += parseFloat(sec.total_posted_amt_ytd || 0); }
// 				if (nm === 'CAPITAL EXPENSES'   || nm === 'CAPITAL  EXPENSES')   { r.capex_plan += parseFloat(sec.ytd || 0); r.capex_act += parseFloat(sec.total_posted_amt_ytd || 0); }
// 			});
// 			r.total_plan = r.opex_plan + r.capex_plan; r.total_act = r.opex_act + r.capex_act;
// 			return r;
// 		}
// 		function getConsolidatedTotals(data) {
// 			var ct = null;
// 			(data || []).forEach(function (e) {
// 				if (e.sequence_id === 9999 || (e.table_name || '').toUpperCase() === 'CONSOLIDATED') { ct = e; }
// 			});
// 			if (!ct) { return null; }
// 			var r = zero();
// 			(ct.actuals || []).forEach(function (a) {
// 				var nm = (a.name || '').toUpperCase().replace(/\s+/g, ' ').trim();
// 				if (nm === 'OPEX TOTAL')         { r.opex_plan += parseFloat(a.ytd || 0); r.opex_act += parseFloat(a.total_posted_amt_ytd || 0); }
// 				if (nm === 'CAPEX TOTAL')         { r.capex_plan += parseFloat(a.ytd || 0); r.capex_act += parseFloat(a.total_posted_amt_ytd || 0); }
// 				if (nm === 'OVERALL GRAND TOTAL') { r.total_plan = parseFloat(a.ytd || 0); r.total_act = parseFloat(a.total_posted_amt_ytd || 0); }
// 			});
// 			if (!r.total_plan && !r.total_act) { r.total_plan = r.opex_plan + r.capex_plan; r.total_act = r.opex_act + r.capex_act; }
// 			return r;
// 		}
// 		function buildRowsA(data) {
// 			var sorted = (data || []).slice().sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });
// 			var norm = [], covid = [];
// 			sorted.forEach(function (e) {
// 				if (e.sequence_id === 9999 || (e.table_name || '').toUpperCase() === 'CONSOLIDATED') { return; }
// 				var lbl = (e.label || '').trim();
// 				var row = { display: lbl, isSub: e.is_this_sub_item === 1, isCovid: lbl.toLowerCase().indexOf('covid') !== -1, vals: extractA(e.actuals) };
// 				(row.isCovid ? covid : norm).push(row);
// 			});
// 			var gtVals = getConsolidatedTotals(data);
// 			if (!gtVals) {
// 				gtVals = zero();
// 				norm.forEach(function (r) { if (!r.isSub) { gtVals = addV(gtVals, r.vals); } });
// 				covid.forEach(function (r) { if (!r.isSub) { gtVals = addV(gtVals, r.vals); } });
// 			}
// 			var out = norm.slice();
// 			if (covid.length) { out = out.concat(covid); }
// 			out.push({ display: 'Grand Total', isTotal: true, isGrandTotal: true, vals: gtVals });
// 			return out;
// 		}
// 		function rowHtmlA(r) {
// 			var cls = r.isGrandTotal ? 'cb-row-grand' : (r.isTotal ? 'sinr-total-row' : (r.isCovid ? 'sinr-covid-row' : ''));
// 			var sty = 'text-align:left;' + (r.isSub ? 'padding-left:28px;color:#555;' : '');
// 			var v = r.vals;
// 			return '<tr class="' + cls + '"><td style="' + sty + '">' + r.display + '</td><td>' + fmtCr(v.opex_plan) + '</td><td>' + fmtCr(v.capex_plan) + '</td><td>' + fmtCr(v.total_plan) + '</td><td>' + fmtCr(v.opex_act) + '</td><td>' + fmtCr(v.capex_act) + '</td><td>' + fmtCr(v.total_act) + '</td></tr>';
// 		}
// 		function tableHtmlA(rows, pLbl, aLbl) {
// 			return '<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
// 				'<div class="cb-scroll-wrapper" style="margin-bottom:28px;"><table class="cb-table sinr-table" id="sinr-table-a" style="width:100%;"><thead>' +
// 				'<tr class="cb-thead-main"><th rowspan="2" style="text-align:left !important;min-width:260px;">Unit / Function</th><th colspan="3" style="text-align:center !important;">' + pLbl + '</th><th colspan="3" style="text-align:center !important;">' + aLbl + '</th></tr>' +
// 				'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Total</th><th>Opex</th><th>Capex</th><th>Total</th></tr>' +
// 				'</thead><tbody>' + rows.map(rowHtmlA).join('') + '</tbody></table></div>';
// 		}
// 		function getSubNames(entries) {
// 			var seen = {}, names = [];
// 			entries.forEach(function (e) { (e.actuals || []).forEach(function (sec) { if (normN(sec.name).indexOf('OPERATING') === -1) { return; } (sec.sub_heads || []).forEach(function (sh) { var n = (sh.name || '').trim(); if (n && !seen[n]) { seen[n] = true; names.push(n); } }); }); });
// 			return names;
// 		}
// 		function shVal(actuals, name, field) { var v = 0; (actuals || []).forEach(function (sec) { if (normN(sec.name).indexOf('OPERATING') === -1) { return; } (sec.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === name) { v += parseFloat(field === 'plan' ? (sh.ytd || 0) : (sh.total_posted_amt_ytd || 0)); } }); }); return v; }
// 		function opT(a, f) { var v = 0; (a || []).forEach(function (s) { if (normN(s.name).indexOf('OPERATING') === -1) { return; } v += parseFloat(f === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); }); return v; }
// 		function caT(a, f) { var v = 0; (a || []).forEach(function (s) { if (normN(s.name).indexOf('CAPITAL') === -1) { return; } v += parseFloat(f === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); }); return v; }
// 		function tableHtmlB(entries, shNames, pLbl, aLbl, consolidatedVals) {
// 			var cc = 1 + shNames.length + 3;
// 			var hdr = '<tr class="cb-thead-main"><th rowspan="2" style="text-align:left !important;min-width:210px;">Unit / Function</th><th colspan="' + (shNames.length + 1) + '" style="text-align:center !important;">Operating Expenses</th><th rowspan="2" style="text-align:center !important;min-width:110px;">Capex</th><th rowspan="2" style="text-align:center !important;min-width:110px;">Total</th></tr>' +
// 				'<tr class="cb-thead-sub">' + shNames.map(function (n) { return '<th style="min-width:110px;">' + n + '</th>'; }).join('') + '<th style="min-width:110px;">Total</th></tr>';
// 			var body = '', gtP = {}, gtA = {};
// 			shNames.forEach(function (n) { gtP[n] = 0; gtA[n] = 0; });
// 			var gtOP = 0, gtOA = 0, gtCP = 0, gtCA = 0;
// 			entries.forEach(function (e) {
// 				var lbl = (e.label || '').trim(), act = e.actuals || [], sP = {}, sA = {};
// 				shNames.forEach(function (n) { sP[n] = shVal(act, n, 'plan'); sA[n] = shVal(act, n, 'act'); gtP[n] += sP[n]; gtA[n] += sA[n]; });
// 				var oP = opT(act, 'plan'), oA = opT(act, 'act'), cP = caT(act, 'plan'), cA = caT(act, 'act');
// 				gtOP += oP; gtOA += oA; gtCP += cP; gtCA += cA;
// 				body += '<tr class="sinr-unit-hdr"><td>' + lbl + '</td><td colspan="' + (shNames.length + 3) + '"></td></tr>';
// 				body += '<tr class="sinr-brkdwn-plan"><td style="padding-left:18px;color:#333;">- ' + pLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(sP[n]) + '</td>'; }).join('') + '<td>' + fmtCr(oP) + '</td><td>' + fmtCr(cP) + '</td><td>' + fmtCr(oP + cP) + '</td></tr>';
// 				body += '<tr class="sinr-brkdwn-act"><td style="padding-left:18px;color:#555;">- ' + aLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(sA[n]) + '</td>'; }).join('') + '<td>' + fmtCr(oA) + '</td><td>' + fmtCr(cA) + '</td><td>' + fmtCr(oA + cA) + '</td></tr>';
// 				body += '<tr class="sinr-spacer"><td colspan="' + cc + '"></td></tr>';
// 			});
// 			var finalOP = (consolidatedVals && consolidatedVals.opex_plan)  ? consolidatedVals.opex_plan  : gtOP;
// 			var finalOA = (consolidatedVals && consolidatedVals.opex_act)   ? consolidatedVals.opex_act   : gtOA;
// 			var finalCP = (consolidatedVals && consolidatedVals.capex_plan) ? consolidatedVals.capex_plan : gtCP;
// 			var finalCA = (consolidatedVals && consolidatedVals.capex_act)  ? consolidatedVals.capex_act  : gtCA;
// 			var finalTP = (consolidatedVals && consolidatedVals.total_plan) ? consolidatedVals.total_plan : (gtOP + gtCP);
// 			var finalTA = (consolidatedVals && consolidatedVals.total_act)  ? consolidatedVals.total_act  : (gtOA + gtCA);
// 			body += '<tr class="cb-row-grand"><td>Grand Total</td><td colspan="' + (shNames.length + 3) + '"></td></tr>';
// 			body += '<tr class="sinr-gt-plan"><td style="padding-left:18px;">- ' + pLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(gtP[n]) + '</td>'; }).join('') + '<td>' + fmtCr(finalOP) + '</td><td>' + fmtCr(finalCP) + '</td><td>' + fmtCr(finalTP) + '</td></tr>';
// 			body += '<tr class="sinr-gt-act"><td style="padding-left:18px;">- ' + aLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(gtA[n]) + '</td>'; }).join('') + '<td>' + fmtCr(finalOA) + '</td><td>' + fmtCr(finalCA) + '</td><td>' + fmtCr(finalTA) + '</td></tr>';
// 			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="sinr-table-b" style="width:100%;border-collapse:collapse;"><thead>' + hdr + '</thead><tbody>' + body + '</tbody></table></div>';
// 		}

// 		// ── B2. Cost per Employee Table ─────────────────────────────────────────────
// 		// Uses headcount API data alongside unit-wise plan data to calculate:
// 		// INR (Cr.) Plan/Est, Cost/Person p.a. (Rs K) Plan/Est,
// 		// Cost/Person p.m. (Rs K) Plan/Est, % Mix Plan/Est, Increase in PPC (FY Plan vs FY Est)
// 		// ── C. Opex vs. Capex ────────────────────────────────────────────────────────
// 		// Simple 2-column table: Plan % and Est % derived from Grand Total of buildRowsA.
// 		// Header: blank | pLbl (Plan) | aLbl (Est)
// 		// Rows  : Opex | Capex | Total
// 		function tableHtmlOpexCapex(rows, pLbl, aLbl) {
// 			var gt = null;
// 			(rows || []).forEach(function (r) { if (r.isGrandTotal) { gt = r.vals; } });
// 			if (!gt) { return ''; }

// 			function pct(part, total) {
// 				if (!total || !isFinite(total) || total === 0) { return '-'; }
// 				return ((part / total) * 100).toFixed(1) + '%';
// 			}

// 			// Plan column  = current FY budget  (opex_plan / total_plan)
// 			// Est  column  = previous FY actual (opex_act  / total_act)
// 			var opexPctPlan  = pct(gt.opex_plan,  gt.total_plan);
// 			var capexPctPlan = pct(gt.capex_plan, gt.total_plan);
// 			var opexPctEst   = pct(gt.opex_act,   gt.total_act);
// 			var capexPctEst  = pct(gt.capex_act,  gt.total_act);

// 			// Single-level header — matches Excel exactly
// 			var hdr =
// 				'<tr class="cb-thead-main">' +
// 				'<th style="text-align:left !important;min-width:160px;"></th>' +
// 				'<th style="text-align:center !important;min-width:120px;">' + pLbl + '</th>' +
// 				'<th style="text-align:center !important;min-width:120px;">' + aLbl + '</th>' +
// 				'</tr>';

// 			var body =
// 				'<tr>' +
// 				'<td style="text-align:left;">Opex</td>' +
// 				'<td>' + opexPctPlan  + '</td>' +
// 				'<td>' + opexPctEst   + '</td>' +
// 				'</tr>' +
// 				'<tr>' +
// 				'<td style="text-align:left;">Capex</td>' +
// 				'<td>' + capexPctPlan + '</td>' +
// 				'<td>' + capexPctEst  + '</td>' +
// 				'</tr>' +
// 				'<tr class="sinr-total-row">' +
// 				'<td style="text-align:left;font-weight:700;">Total</td>' +
// 				'<td style="font-weight:700;">100.0%</td>' +
// 				'<td style="font-weight:700;">100.0%</td>' +
// 				'</tr>';

// 			// Inject scoped styles for the oc table if not already present
// 			if (!$('#sinr-oc-style').length) {
// 				$('head').append(
// 					'<style id="sinr-oc-style">' +
// 					'#sinr-table-oc{border-collapse:collapse !important;width:auto;}' +
// 					'#sinr-table-oc th,#sinr-table-oc td{border:1.5px solid var(--bdl) !important;padding:8px 16px;white-space:nowrap;text-align:right;font-family:var(--font);font-size:var(--fs-base);}' +
// 					'#sinr-table-oc th:first-child,#sinr-table-oc td:first-child{text-align:left !important;}' +
// 					'#sinr-table-oc thead tr th{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-lg);text-align:center !important;border:1.5px solid var(--bdh) !important;padding:10px 16px;}' +
// 					'#sinr-table-oc thead tr th:first-child{text-align:left !important;min-width:160px;}' +
// 					'#sinr-table-oc tbody tr.sinr-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b) !important;border:1.5px solid #9baab5 !important;}' +
// 					'</style>'
// 				);
// 			}
// 			return '<div style="margin-bottom:24px;">' +
// 				'<table id="sinr-table-oc">' +
// 				'<thead>' + hdr + '</thead>' +
// 				'<tbody>' + body + '</tbody>' +
// 				'</table></div>';
// 		}

// 		function tableHtmlCPE(planData, headcountRecords, fy, pLbl, aLbl) {
// 			if (!planData || !planData.length) { return ''; } // headcountRecords may be empty — CPA/CPM will show '-'

// 			var fp = (fy || '2025-26').split('-');
// 			var curFYKey     = fy;
// 			var prevFYKey    = (parseInt(fp[0], 10) - 1) + '-' + String(parseInt(fp[1], 10) - 1).padStart(2, '0');
// 			var prevPrevFYKey = (parseInt(fp[0], 10) - 2) + '-' + String(parseInt(fp[1], 10) - 2).padStart(2, '0');

// 			function isOpex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1; }

// 			// ── Average Headcount ──────────────────────────────────────────────────────
// 			// Matches the Headcount tab logic: avg = (closing_prev_FY + closing_cur_FY) / 2
// 			// For the very first FY in the records, avg = closing / 2
// 			// avgHCPlan  → average H/C for the current selected FY  (D101 in Excel)
// 			// avgHCEst   → average H/C for the previous FY           (D100 in Excel)
// 			function getAvgHC(fyKey) {
// 				var sorted = (headcountRecords || [])
// 					.filter(function (r) { return !!r.financial_year; })
// 					.slice().sort(function (a, b) {
// 						return (a.financial_year || '').localeCompare(b.financial_year || '');
// 					});
// 				var idx = -1;
// 				for (var i = 0; i < sorted.length; i++) {
// 					if (sorted[i].financial_year === fyKey) { idx = i; break; }
// 				}
// 				if (idx === -1) { return 0; }
// 				var curTotal = parseFloat(sorted[idx].total_head_count || sorted[idx].total_headcount || sorted[idx].headcount || 0);
// 				if (idx === 0) { return curTotal / 2; }
// 				var prevTotal = parseFloat(sorted[idx - 1].total_head_count || sorted[idx - 1].total_headcount || sorted[idx - 1].headcount || 0);
// 				return (prevTotal + curTotal) / 2;
// 			}

// 			var avgHCPlan    = getAvgHC(prevFYKey);     // Plan CPA divisor = previous FY avg H/C (2387)
// 			var avgHCEst     = getAvgHC(prevPrevFYKey); // Est  CPA divisor = two years back avg H/C (1135)
// 			var avgHCDisplay = getAvgHC(curFYKey);      // For subtitle display only (current FY avg H/C)

// 			// ── Source: ALL non-consolidated unit rows (Foundation grand total) ─────────
// 			var sourceRows = (planData || []).filter(function (e) {
// 				return e.is_this_sub_item === 0
// 					&& e.sequence_id !== 9999
// 					&& (e.table_name || '').toUpperCase() !== 'CONSOLIDATED';
// 			});

// 			// Collect unique opex sub_head names from the source rows
// 			var shNames = [], shSeen = {};
// 			sourceRows.forEach(function (e) {
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isOpex(s.name)) { return; }
// 					(s.sub_heads || []).forEach(function (sh) {
// 						var n = (sh.name || '').trim();
// 						if (n && !shSeen[n]) { shSeen[n] = true; shNames.push(n); }
// 					});
// 				});
// 			});

// 			// ── Raw INR helpers (sum across sourceRows) ───────────────────────────────
// 			// inrPlan = sh.ytd            (Budget / Plan figure)   → C column in Excel
// 			// inrEst  = sh.total_posted_amt_ytd (Estimate / Actual) → D column in Excel
// 			function shRawPlan(shName) {
// 				var v = 0;
// 				sourceRows.forEach(function (e) {
// 					(e.actuals || []).forEach(function (s) {
// 						if (!isOpex(s.name)) { return; }
// 						(s.sub_heads || []).forEach(function (sh) {
// 							if ((sh.name || '').trim() === shName) { v += parseFloat(sh.ytd || 0); }
// 						});
// 					});
// 				});
// 				return v;  // raw INR (not divided yet)
// 			}
// 			function shRawEst(shName) {
// 				var v = 0;
// 				sourceRows.forEach(function (e) {
// 					(e.actuals || []).forEach(function (s) {
// 						if (!isOpex(s.name)) { return; }
// 						(s.sub_heads || []).forEach(function (sh) {
// 							if ((sh.name || '').trim() === shName) { v += parseFloat(sh.total_posted_amt_ytd || 0); }
// 						});
// 					});
// 				});
// 				return v;  // raw INR
// 			}
// 			// Total opex from source rows (C116 / D116 in Excel — the denominator for % Mix)
// 			function opexRawPlan() {
// 				var v = 0;
// 				sourceRows.forEach(function (e) {
// 					(e.actuals || []).forEach(function (s) {
// 						if (isOpex(s.name)) { v += parseFloat(s.ytd || 0); }
// 					});
// 				});
// 				return v;
// 			}
// 			function opexRawEst() {
// 				var v = 0;
// 				sourceRows.forEach(function (e) {
// 					(e.actuals || []).forEach(function (s) {
// 						if (isOpex(s.name)) { v += parseFloat(s.total_posted_amt_ytd || 0); }
// 					});
// 				});
// 				return v;
// 			}

// 			// C116 / D116 — total opex raw INR (denominator for % Mix and total CPA row)
// 			var totalRawPlan = opexRawPlan();
// 			var totalRawEst  = opexRawEst();

// 			// ── Per-row calculations matching Excel formulas ───────────────────────────
// 			//
// 			// INR (Cr.)   Plan = C_raw / 10^7            → displayed as Cr.
// 			// INR (Cr.)   Est  = D_raw / 10^7
// 			//
// 			// CPA Plan (Rs K) = C_raw / avgHCPlan * 10^3 / 10^7
// 			//                 = C_raw / avgHCPlan / 10000   ← matches =+C109/$D$101*10^3
// 			//   (C109 is already in Cr., so *10^7 to get raw, then /avgHC/1000 for Rs K
// 			//    but since C_raw is raw INR: CPA = C_raw / avgHC / 1000)
// 			//
// 			// CPA Est  (Rs K) = D_raw / avgHCEst  / 1000   ← matches =+D109/$D$100*10^3
// 			//
// 			// CPM Plan = CPA Plan / 12                      ← matches =+E109/12
// 			// CPM Est  = CPA Est  / 12                      ← matches =+F109/12
// 			//
// 			// % Mix Plan = C_raw / totalRawPlan             ← matches =+C109/$C$116
// 			// % Mix Est  = D_raw / totalRawEst              ← matches =+D109/$D$116
// 			//
// 			// Increase in PPC = CPA_Plan / CPA_Est - 1      ← matches =+E109/F109-1

// 			var dataRows = shNames.map(function (shName) {
// 				var rp = shRawPlan(shName);   // raw INR Plan
// 				var re = shRawEst(shName);    // raw INR Est

// 				var inrCrPlan = rp / 10000000;
// 				var inrCrEst  = re / 10000000;

// 				// CPA Plan: INR_Plan_Cr / prevFY_avgHC * 1000  (=C109/$D$101*10^3 in Excel)
// 				// CPA Est:  INR_Est_Cr  / prevPrevFY_avgHC * 1000  (=D109/$D$100*10^3)
// 				var cpaPlan = (avgHCPlan > 0) ? ((rp / 10000000) / avgHCPlan * 1000) : 0;
// 				var cpaEst  = (avgHCEst  > 0) ? ((re / 10000000) / avgHCEst  * 1000) : 0;

// 				var cpmPlan = cpaPlan / 12;
// 				var cpmEst  = cpaEst  / 12;

// 				var mixPlan = (totalRawPlan > 0) ? (rp / totalRawPlan * 100) : 0;
// 				var mixEst  = (totalRawEst  > 0) ? (re / totalRawEst  * 100) : 0;

// 				// PPC increase: CPA_Plan / CPA_Est - 1  (null if Est is 0)
// 				var ppInc = (cpaEst > 0) ? ((cpaPlan / cpaEst) - 1) * 100 : null;

// 				return {
// 					name: shName,
// 					inrCrPlan: inrCrPlan, inrCrEst: inrCrEst,
// 					cpaPlan: cpaPlan, cpaEst: cpaEst,
// 					cpmPlan: cpmPlan, cpmEst: cpmEst,
// 					mixPlan: mixPlan, mixEst: mixEst,
// 					ppInc: ppInc
// 				};
// 			});

// 			// Total row values (C116/D116 level)
// 			var ttlInrCrPlan = totalRawPlan / 10000000;
// 			var ttlInrCrEst  = totalRawEst  / 10000000;
// 			// Total row CPA: same divisors as per-row
// 			var ttlCpaPlan   = (avgHCPlan > 0) ? ((totalRawPlan / 10000000) / avgHCPlan * 1000) : 0;
// 			var ttlCpaEst    = (avgHCEst  > 0) ? ((totalRawEst  / 10000000) / avgHCEst  * 1000) : 0;
// 			var ttlCpmPlan   = ttlCpaPlan / 12;
// 			var ttlCpmEst    = ttlCpaEst  / 12;
// 			var ttlPpInc     = (ttlCpaEst > 0) ? ((ttlCpaPlan / ttlCpaEst) - 1) * 100 : null;

// 			// ── Format helpers ─────────────────────────────────────────────────────────
// 			function fmtInrCr(v) {
// 				// Display in Crores with 2 decimals, e.g. 3,187.50
// 				var n = parseFloat(v) || 0;
// 				if (!isFinite(n)) { return '-'; }
// 				if (Math.abs(n) < 0.005) { return n === 0 ? '-' : '0.00'; }
// 				var neg = n < 0;
// 				var abs = Math.abs(n);
// 				// Indian number format for Crores
// 				var s = abs.toFixed(2).split('.');
// 				var ip = s[0], dp = s[1];
// 				if (ip.length > 3) {
// 					ip = ip.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + ip.slice(-3);
// 				}
// 				return (neg ? '-' : '') + ip + '.' + dp;
// 			}
// 			function fmtK(v) {
// 				// Display Rs K with 2 decimals
// 				var n = parseFloat(v) || 0;
// 				if (!isFinite(n) || n === 0) { return '-'; }
// 				return (n < 0 ? '-' : '') + Math.abs(n).toFixed(2);
// 			}
// 			function fmtMix(v) {
// 				var n = parseFloat(v) || 0;
// 				if (!isFinite(n) || n === 0) { return '0%'; }
// 				return Math.round(n) + '%';
// 			}
// 			function fmtInc(v) {
// 				if (v === null || v === undefined || isNaN(v) || !isFinite(v)) { return '-'; }
// 				var n = Math.round(parseFloat(v));
// 				return (n > 0 ? '+' : '') + n + '%';
// 			}
// 			function incStyle(v) {
// 				if (v === null || v === undefined || isNaN(v) || !isFinite(v)) { return ''; }
// 				var n = parseFloat(v);
// 				return n < 0 ? ' style="color:#c0392b;font-weight:600;"' : (n > 0 ? ' style="color:#1a7a3a;font-weight:600;"' : '');
// 			}

// 			// ── Header — 3-level: main / FY row / Plan|Est row ─────────────────────────
// 			var hdr1 = '<tr class="cb-thead-main">' +
// 				'<th rowspan="3" style="min-width:220px;text-align:left !important;vertical-align:middle;">Overall Foundation</th>' +
// 				'<th colspan="2" style="text-align:center !important;min-width:200px;">INR</th>' +
// 				'<th colspan="2" style="text-align:center !important;min-width:200px;">Cost / Person p.a.(Rs K)</th>' +
// 				'<th colspan="2" style="text-align:center !important;min-width:200px;">Cost / Person p.m.(Rs K)</th>' +
// 				'<th colspan="2" style="text-align:center !important;min-width:180px;">% Mix</th>' +
// 				'<th rowspan="3" style="text-align:center !important;min-width:150px;vertical-align:middle;">Increase in PPC<br>(' + fy + ' vs. ' + prevFYKey + ')</th>' +
// 				'</tr>';

// 			var hdr2 = '<tr class="cb-thead-sub">' +
// 				'<th style="min-width:100px;">' + fy + '</th><th style="min-width:100px;">' + prevFYKey + '</th>' +
// 				'<th style="min-width:100px;">' + fy + '</th><th style="min-width:100px;">' + prevFYKey + '</th>' +
// 				'<th style="min-width:100px;">' + fy + '</th><th style="min-width:100px;">' + prevFYKey + '</th>' +
// 				'<th style="min-width:90px;">'  + fy + '</th><th style="min-width:90px;">'  + prevFYKey + '</th>' +
// 				'</tr>';

// 			var hdr3 = '<tr class="cb-thead-sub2">' +
// 				'<th>Plan</th><th>Est</th>' +
// 				'<th>Plan</th><th>Est</th>' +
// 				'<th>Plan</th><th>Est</th>' +
// 				'<th>Plan</th><th>Est</th>' +
// 				'</tr>';

// 			// ── Body ──────────────────────────────────────────────────────────────────
// 			var bodyHtml = '';
// 			dataRows.forEach(function (row) {
// 				bodyHtml += '<tr>' +
// 					'<td>' + row.name + '</td>' +
// 					'<td>' + fmtInrCr(row.inrCrPlan) + '</td>' +
// 					'<td>' + fmtInrCr(row.inrCrEst)  + '</td>' +
// 					'<td>' + fmtK(row.cpaPlan) + '</td>' +
// 					'<td>' + fmtK(row.cpaEst)  + '</td>' +
// 					'<td>' + fmtK(row.cpmPlan) + '</td>' +
// 					'<td>' + fmtK(row.cpmEst)  + '</td>' +
// 					'<td>' + fmtMix(row.mixPlan) + '</td>' +
// 					'<td>' + fmtMix(row.mixEst)  + '</td>' +
// 					'<td' + incStyle(row.ppInc) + '>' + fmtInc(row.ppInc) + '</td>' +
// 				'</tr>';
// 			});

// 			// Total Operating Expenses row (bold, highlighted)
// 			bodyHtml += '<tr class="cpe-total-row">' +
// 				'<td>Total Operating Expenses</td>' +
// 				'<td>' + fmtInrCr(ttlInrCrPlan) + '</td>' +
// 				'<td>' + fmtInrCr(ttlInrCrEst)  + '</td>' +
// 				'<td>' + fmtK(ttlCpaPlan) + '</td>' +
// 				'<td>' + fmtK(ttlCpaEst)  + '</td>' +
// 				'<td>' + fmtK(ttlCpmPlan) + '</td>' +
// 				'<td>' + fmtK(ttlCpmEst)  + '</td>' +
// 				'<td>100%</td>' +
// 				'<td>100%</td>' +
// 				'<td' + incStyle(ttlPpInc) + '>' + fmtInc(ttlPpInc) + '</td>' +
// 			'</tr>';

// 			return '<div id="sinr-cpe-wrap">' +
// 				'<div class="sinr-section-label" style="margin-top:28px;">E. Cost per Employee - Comparison</div>' +
// 				'<div class="cb-scroll-wrapper" style="margin-bottom:24px;">' +
// 					'<table id="sinr-cpe-table" class="cb-table">' +
// 						'<thead>' + hdr1 + hdr2 + hdr3 + '</thead>' +
// 						'<tbody>' + bodyHtml + '</tbody>' +
// 					'</table>' +
// 				'</div></div>';
// 		}

// 		// ── C. Operating Expenses detail ──────────────────────────────────────────
// 		function tableHtmlC(entries, pLbl, aLbl) {
// 			if (!entries || !entries.length) { return ''; }

// 			function isOpex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1; }

// 			var shNames = [], shSeen = {};
// 			entries.forEach(function (e) {
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isOpex(s.name)) { return; }
// 					(s.sub_heads || []).forEach(function (sh) {
// 						var n = (sh.name || '').trim();
// 						if (n && !shSeen[n]) { shSeen[n] = true; shNames.push(n); }
// 					});
// 				});
// 			});
// 			if (!shNames.length) { return ''; }

// 			function shPlan(e, shName) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isOpex(s.name)) { return; }
// 					(s.sub_heads || []).forEach(function (sh) {
// 						if ((sh.name || '').trim() === shName) { v += parseFloat(sh.ytd || 0); }
// 					});
// 				});
// 				return v;
// 			}
// 			function shAct(e, shName) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isOpex(s.name)) { return; }
// 					(s.sub_heads || []).forEach(function (sh) {
// 						if ((sh.name || '').trim() === shName) { v += parseFloat(sh.total_posted_amt_ytd || 0); }
// 					});
// 				});
// 				return v;
// 			}
// 			function opexTotal(e, field) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (isOpex(s.name)) { v += parseFloat(field === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); }
// 				});
// 				return v;
// 			}

// 			var tblId = 'sinr-table-c';
// 			if (!$('#sinr-c-style').length) {
// 				$('head').append(
// 					'<style id="sinr-c-style">' +
// 					'#' + tblId + '{border-collapse:collapse !important;width:100%;}' +
// 					'#' + tblId + ' th,#' + tblId + ' td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);border:1.5px solid var(--bdh) !important;position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}' +
// 					'#' + tblId + ' thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);border:1.5px solid var(--bdo) !important;position:sticky;z-index:24;text-align:center !important;min-width:120px;padding:8px 12px;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:55 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:220px;vertical-align:middle;}' +
// 					'#' + tblId + ' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:220px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' tbody tr.ppt-total-row td:first-child{position:sticky;left:0;z-index:10;background:#e8f0fa !important;}' +
// 					'#' + tblId + ' tbody tr.cb-row-grand td:first-child{background:var(--blue-mid) !important;}' +
// 					'#' + tblId + ' tbody tr.ppt-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:700 !important;}' +
// 					'#' + tblId + ' .sinr-c-gtcol{background:#ddeaf7 !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;}' +
// 					'#' + tblId + ' tr.cb-row-grand .sinr-c-gtcol{background:var(--blue-dark) !important;color:#fff !important;}' +
// 					'#' + tblId + ' tr.ppt-total-row .sinr-c-gtcol{background:#c8ddf0 !important;color:var(--blue-dark) !important;}' +
// 					'</style>'
// 				);
// 			}

// 			var hdr1 = '<tr class="cb-thead-main">' +
// 				'<th rowspan="2" style="min-width:220px;text-align:left !important;vertical-align:middle;position:sticky;left:0;z-index:55 !important;top:0;background:var(--blue-mid) !important;">Expense Category</th>';
// 			entries.forEach(function (e) {
// 				hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;">' + (e.label || '').trim() + '</th>';
// 			});
// 			hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;background:var(--blue-dark) !important;border:1.5px solid #001f3f !important;">Grand Total</th></tr>';

// 			var hdr2 = '<tr class="cb-thead-sub">';
// 			entries.forEach(function () {
// 				hdr2 += '<th style="min-width:120px;text-align:center !important;">' + pLbl + '</th>' +
// 					    '<th style="min-width:120px;text-align:center !important;">' + aLbl + '</th>';
// 			});
// 			hdr2 += '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + pLbl + '</th>' +
// 				    '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + aLbl + '</th></tr>';

// 			var bodyHtml = '';
// 			var gtBudget = 0, gtActual = 0;

// 			shNames.forEach(function (shName) {
// 				var rowBudget = 0, rowActual = 0, cells = '';
// 				entries.forEach(function (e) {
// 					var bp = shPlan(e, shName);
// 					var ba = shAct(e, shName);
// 					rowBudget += bp; rowActual += ba;
// 					cells += '<td>' + fmtCrDash(bp) + '</td><td>' + fmtCrDash(ba) + '</td>';
// 				});
// 				gtBudget += rowBudget; gtActual += rowActual;
// 				bodyHtml += '<tr><td>' + shName + '</td>' + cells +
// 					'<td class="sinr-c-gtcol" style="font-weight:700;">' + fmtCrDash(rowBudget) + '</td>' +
// 					'<td class="sinr-c-gtcol" style="font-weight:700;">' + fmtCrDash(rowActual) + '</td></tr>';
// 			});

// 			var totalCells = '';
// 			var totalBudget = 0, totalActual = 0;
// 			entries.forEach(function (e) {
// 				var bp = opexTotal(e, 'plan');
// 				var ba = opexTotal(e, 'act');
// 				totalBudget += bp; totalActual += ba;
// 				totalCells += '<td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(bp) + '</td><td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(ba) + '</td>';
// 			});
// 			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells +
// 				'<td class="sinr-c-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalBudget) + '</td>' +
// 				'<td class="sinr-c-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalActual) + '</td></tr>';

// 			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;">' +
// 					'<table id="' + tblId + '" class="cb-table">' +
// 						'<thead>' + hdr1 + hdr2 + '</thead>' +
// 						'<tbody>' + bodyHtml + '</tbody>' +
// 					'</table>' +
// 				'</div>';
// 		}

// 		// ── D. Capital Expenses detail ─────────────────────────────────────────────
// 		function tableHtmlD(entries, pLbl, aLbl) {
// 			if (!entries || !entries.length) { return ''; }

// 			function isCapex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('CAPITAL') !== -1; }

// 			var itemNames = [], itemSeen = {};
// 			entries.forEach(function (e) {
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isCapex(s.name)) { return; }
// 					(s.items || []).forEach(function (item) {
// 						var n = (item.name || '').trim();
// 						if (n && !itemSeen[n]) { itemSeen[n] = true; itemNames.push(n); }
// 					});
// 				});
// 			});
// 			if (!itemNames.length) { return ''; }

// 			function itemPlan(e, itemName) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isCapex(s.name)) { return; }
// 					(s.items || []).forEach(function (item) {
// 						if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); }
// 					});
// 				});
// 				return v;
// 			}
// 			function itemAct(e, itemName) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isCapex(s.name)) { return; }
// 					(s.items || []).forEach(function (item) {
// 						if ((item.name || '').trim() === itemName) {
// 							v += parseFloat(item.total_posted_amt_ytd || item.total_posted_amt || 0);
// 						}
// 					});
// 				});
// 				return v;
// 			}
// 			function capexTotal(e, field) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (isCapex(s.name)) { v += parseFloat(field === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); }
// 				});
// 				return v;
// 			}

// 			var tblId = 'sinr-table-d';
// 			if (!$('#sinr-d-style').length) {
// 				$('head').append(
// 					'<style id="sinr-d-style">' +
// 					'#' + tblId + '{border-collapse:collapse !important;width:100%;}' +
// 					'#' + tblId + ' th,#' + tblId + ' td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);border:1.5px solid var(--bdh) !important;position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}' +
// 					'#' + tblId + ' thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);border:1.5px solid var(--bdo) !important;position:sticky;z-index:24;text-align:center !important;min-width:120px;padding:8px 12px;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:55 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:220px;vertical-align:middle;}' +
// 					'#' + tblId + ' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:220px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' tbody tr.ppt-total-row td:first-child{position:sticky;left:0;z-index:10;background:#e8f0fa !important;}' +
// 					'#' + tblId + ' tbody tr.cb-row-grand td:first-child{background:var(--blue-mid) !important;}' +
// 					'#' + tblId + ' .sinr-d-gtcol{background:#ddeaf7 !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;}' +
// 					'#' + tblId + ' tr.cb-row-grand .sinr-d-gtcol{background:var(--blue-dark) !important;color:#fff !important;}' +
// 					'#' + tblId + ' tr.ppt-total-row .sinr-d-gtcol{background:#c8ddf0 !important;color:var(--blue-dark) !important;}' +
// 					'</style>'
// 				);
// 			}

// 			var hdr1 = '<tr class="cb-thead-main">' +
// 				'<th rowspan="2" style="min-width:220px;text-align:left !important;vertical-align:middle;position:sticky;left:0;z-index:55 !important;top:0;background:var(--blue-mid) !important;">Expense Category</th>';
// 			entries.forEach(function (e) {
// 				hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;">' + (e.label || '').trim() + '</th>';
// 			});
// 			hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;background:var(--blue-dark) !important;border:1.5px solid #001f3f !important;">Grand Total</th></tr>';

// 			var hdr2 = '<tr class="cb-thead-sub">';
// 			entries.forEach(function () {
// 				hdr2 += '<th style="min-width:120px;text-align:center !important;">' + pLbl + '</th>' +
// 					    '<th style="min-width:120px;text-align:center !important;">' + aLbl + '</th>';
// 			});
// 			hdr2 += '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + pLbl + '</th>' +
// 				    '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + aLbl + '</th></tr>';

// 			var bodyHtml = '';

// 			itemNames.forEach(function (itemName) {
// 				var rowBudget = 0, rowActual = 0, cells = '';
// 				entries.forEach(function (e) {
// 					var bp = itemPlan(e, itemName);
// 					var ba = itemAct(e, itemName);
// 					rowBudget += bp; rowActual += ba;
// 					cells += '<td>' + fmtCrDash(bp) + '</td><td>' + fmtCrDash(ba) + '</td>';
// 				});
// 				bodyHtml += '<tr><td>' + itemName + '</td>' + cells +
// 					'<td class="sinr-d-gtcol" style="font-weight:700;">' + fmtCrDash(rowBudget) + '</td>' +
// 					'<td class="sinr-d-gtcol" style="font-weight:700;">' + fmtCrDash(rowActual) + '</td></tr>';
// 			});

// 			var totalCells = '';
// 			var totalBudget = 0, totalActual = 0;
// 			entries.forEach(function (e) {
// 				var bp = capexTotal(e, 'plan');
// 				var ba = capexTotal(e, 'act');
// 				totalBudget += bp; totalActual += ba;
// 				totalCells += '<td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(bp) + '</td><td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(ba) + '</td>';
// 			});
// 			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells +
// 				'<td class="sinr-d-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalBudget) + '</td>' +
// 				'<td class="sinr-d-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalActual) + '</td></tr>';

// 			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;">' +
// 					'<table id="' + tblId + '" class="cb-table">' +
// 						'<thead>' + hdr1 + hdr2 + '</thead>' +
// 						'<tbody>' + bodyHtml + '</tbody>' +
// 					'</table>' +
// 				'</div>';
// 		}

// 		// ── E. Other Operating Expenses ─────────────────────────────────────────────
// 		function tableHtmlE(entries, pLbl, aLbl) {
// 			if (!entries || !entries.length) { return ''; }

// 			function isOpex(name) {
// 				return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1;
// 			}
// 			function isOtherOpex(name) {
// 				return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OTHER OPERATING') !== -1;
// 			}

// 			function getItemPlan(e, itemName) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (isOtherOpex(s.name)) {
// 						(s.items || []).forEach(function (item) {
// 							if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); }
// 						});
// 					}
// 					if (isOpex(s.name) && !isOtherOpex(s.name)) {
// 						(s.sub_heads || []).forEach(function (sh) {
// 							if (!isOtherOpex(sh.name)) { return; }
// 							(sh.items || []).forEach(function (item) {
// 								if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); }
// 							});
// 						});
// 					}
// 				});
// 				return v;
// 			}
// 			function getItemAct(e, itemName) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (isOtherOpex(s.name)) {
// 						(s.items || []).forEach(function (item) {
// 							if ((item.name || '').trim() === itemName) {
// 								v += parseFloat(item.total_posted_amt_ytd || item.total_posted_amt || 0);
// 							}
// 						});
// 					}
// 					if (isOpex(s.name) && !isOtherOpex(s.name)) {
// 						(s.sub_heads || []).forEach(function (sh) {
// 							if (!isOtherOpex(sh.name)) { return; }
// 							(sh.items || []).forEach(function (item) {
// 								if ((item.name || '').trim() === itemName) {
// 									v += parseFloat(item.total_posted_amt_ytd || item.total_posted_amt || 0);
// 								}
// 							});
// 						});
// 					}
// 				});
// 				return v;
// 			}
// 			function getSectionTotal(e, field) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (isOtherOpex(s.name)) {
// 						v += parseFloat(field === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0));
// 					}
// 					if (isOpex(s.name) && !isOtherOpex(s.name)) {
// 						(s.sub_heads || []).forEach(function (sh) {
// 							if (!isOtherOpex(sh.name)) { return; }
// 							v += parseFloat(field === 'plan' ? (sh.ytd || 0) : (sh.total_posted_amt_ytd || 0));
// 						});
// 					}
// 				});
// 				return v;
// 			}

// 			var itemNames = [], itemSeen = {};
// 			entries.forEach(function (e) {
// 				(e.actuals || []).forEach(function (s) {
// 					if (isOtherOpex(s.name)) {
// 						(s.items || []).forEach(function (item) {
// 							var n = (item.name || '').trim();
// 							if (n && !itemSeen[n]) { itemSeen[n] = true; itemNames.push(n); }
// 						});
// 					}
// 					if (isOpex(s.name) && !isOtherOpex(s.name)) {
// 						(s.sub_heads || []).forEach(function (sh) {
// 							if (!isOtherOpex(sh.name)) { return; }
// 							(sh.items || []).forEach(function (item) {
// 								var n = (item.name || '').trim();
// 								if (n && !itemSeen[n]) { itemSeen[n] = true; itemNames.push(n); }
// 							});
// 						});
// 					}
// 				});
// 			});
// 			if (!itemNames.length) { return ''; }

// 			var tblId = 'sinr-table-e';
// 			if (!$('#sinr-e-style').length) {
// 				$('head').append(
// 					'<style id="sinr-e-style">' +
// 					'#' + tblId + '{border-collapse:collapse !important;width:100%;}' +
// 					'#' + tblId + ' th,#' + tblId + ' td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);border:1.5px solid var(--bdh) !important;position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}' +
// 					'#' + tblId + ' thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);border:1.5px solid var(--bdo) !important;position:sticky;z-index:24;text-align:center !important;min-width:120px;padding:8px 12px;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:55 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:220px;vertical-align:middle;}' +
// 					'#' + tblId + ' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:220px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' tbody tr.ppt-total-row td:first-child{position:sticky;left:0;z-index:10;background:#e8f0fa !important;}' +
// 					'#' + tblId + ' tbody tr.ppt-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:700 !important;}' +
// 					'#' + tblId + ' .sinr-e-gtcol{background:#ddeaf7 !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;}' +
// 					'#' + tblId + ' tr.ppt-total-row .sinr-e-gtcol{background:#c8ddf0 !important;color:var(--blue-dark) !important;}' +
// 					'</style>'
// 				);
// 			}

// 			var hdr1 = '<tr class="cb-thead-main">' +
// 				'<th rowspan="2" style="min-width:220px;text-align:left !important;vertical-align:middle;position:sticky;left:0;z-index:55 !important;top:0;background:var(--blue-mid) !important;">Expense Category</th>';
// 			entries.forEach(function (e) {
// 				hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;">' + (e.label || '').trim() + '</th>';
// 			});
// 			hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;background:var(--blue-dark) !important;border:1.5px solid #001f3f !important;">Grand Total</th></tr>';

// 			var hdr2 = '<tr class="cb-thead-sub">';
// 			entries.forEach(function () {
// 				hdr2 += '<th style="min-width:120px;text-align:center !important;">' + pLbl + '</th>' +
// 					    '<th style="min-width:120px;text-align:center !important;">' + aLbl + '</th>';
// 			});
// 			hdr2 += '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + pLbl + '</th>' +
// 				    '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + aLbl + '</th></tr>';

// 			var bodyHtml = '';
// 			itemNames.forEach(function (itemName) {
// 				var rowBudget = 0, rowActual = 0, cells = '';
// 				entries.forEach(function (e) {
// 					var bp = getItemPlan(e, itemName);
// 					var ba = getItemAct(e, itemName);
// 					rowBudget += bp; rowActual += ba;
// 					cells += '<td>' + fmtCrDash(bp) + '</td><td>' + fmtCrDash(ba) + '</td>';
// 				});
// 				bodyHtml += '<tr><td>' + itemName + '</td>' + cells +
// 					'<td class="sinr-e-gtcol" style="font-weight:700;">' + fmtCrDash(rowBudget) + '</td>' +
// 					'<td class="sinr-e-gtcol" style="font-weight:700;">' + fmtCrDash(rowActual) + '</td></tr>';
// 			});

// 			var totalCells = '';
// 			var totalBudget = 0, totalActual = 0;
// 			entries.forEach(function (e) {
// 				var bp = getSectionTotal(e, 'plan');
// 				var ba = getSectionTotal(e, 'act');
// 				totalBudget += bp; totalActual += ba;
// 				totalCells += '<td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(bp) + '</td><td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(ba) + '</td>';
// 			});
// 			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells +
// 				'<td class="sinr-e-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalBudget) + '</td>' +
// 				'<td class="sinr-e-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalActual) + '</td></tr>';

// 			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;">' +
// 					'<table id="' + tblId + '" class="cb-table">' +
// 						'<thead>' + hdr1 + hdr2 + '</thead>' +
// 						'<tbody>' + bodyHtml + '</tbody>' +
// 					'</table>' +
// 				'</div>';
// 		}

// 		// ── MAIN LOAD ─────────────────────────────────────────────────────────────
// 		function load(fy) {
// 			var $tab = $('#tab-summary_inr');
// 			$tab.html('<div style="padding:20px;text-align:center;color:#aaa;">Loading\u2026</div>');
// 			Loader.show('Building Unit wise plan');
// 			var fp = (fy || '2025-26').split('-');
// 			var pLbl = fy + ' Budget', aLbl = (parseInt(fp[0], 10) - 1) + '-' + String(parseInt(fp[1], 10) - 1).padStart(2, '0') + ' Est';

// 			// We need BOTH unit-wise plan AND headcount data — fire both in parallel.
// 			// hcPlanData  = plan_data from the headcount API  → contains "Enablers" entry with opex sub_heads
// 			// hcRecords   = headcount_data from the headcount API → used for average H/C calculation
// 			// uwpData     = unit-wise-plan data → drives tables A, B, C, D, E
// 			var uwpData = null, hcRecords = null, hcPlanData = null;
// 			var uwpErr = false;

// 			function tryRender() {
// 				// Wait until both API calls have returned
// 				if (uwpData === null || hcRecords === null) { return; }
// 				Loader.hide();

// 				if (uwpErr) {
// 					$tab.html('<div style="padding:40px;text-align:center;color:red;">Error loading Summary in INR data.</div>');
// 					return;
// 				}

// 				if (!uwpData.length) {
// 					$tab.html('<div style="padding:40px;text-align:center;color:#aaa;">No data available.</div>');
// 					return;
// 				}

// 				Store.summaryInr = uwpData;

// 				var eB = uwpData.filter(function (e) {
// 					return e.is_this_sub_item === 0
// 						&& e.sequence_id !== 9999
// 						&& (e.table_name || '').toUpperCase() !== 'CONSOLIDATED';
// 				}).sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });

// 				var ctVals = getConsolidatedTotals(uwpData);

// 				// CPE table:
// 				//   - INR figures come from hcPlanData (plan_data from headcount API) → "Enablers" entry
// 				//   - Average H/C comes from hcRecords (headcount_data from headcount API)
// 				// We pass hcPlanData as the source for Enablers; tableHtmlCPE will search it
// 				// for label === "Enablers". Fall back to uwpData if hcPlanData is empty.
// 				var cpeSource = (hcPlanData && hcPlanData.length) ? hcPlanData : uwpData;
// 				var cpeHtml = tableHtmlCPE(cpeSource, hcRecords, fy, pLbl, aLbl);
// 				// Build Headcount - Closing & Average table from hcRecords
// 				var hcClosingAvgHtml = '';
// 				if (hcRecords && hcRecords.length) {
// 					// Sort ascending by FY string; filter out records with no financial_year
// 					var hcSorted = hcRecords.filter(function (r) { return !!r.financial_year; })
// 						.slice().sort(function (a, b) { return (a.financial_year || '').localeCompare(b.financial_year || ''); });
// 					var hcYrs = hcSorted.map(function (r) { return r.financial_year; });
// 					var hcTotals = {};
// 					// Use whichever field name the API returns; fallback chain covers both spellings
// 					hcSorted.forEach(function (r) {
// 						var v = parseFloat(r.total_head_count || r.total_headcount || r.headcount || 0);
// 						if (r.financial_year) { hcTotals[r.financial_year] = v; }
// 					});
// 					// Only build if we have at least one valid total
// 					if (hcYrs.length > 0) {
// 						hcClosingAvgHtml = buildClosingAvgTable(hcYrs, hcTotals);
// 					}
// 				}


// 				// Build opex vs capex table using grand total from buildRowsA
// 				var rowsA = buildRowsA(uwpData);
// 				var ocHtml = tableHtmlOpexCapex(rowsA, pLbl, aLbl);

// 				$tab.html(
// 					'<div style="padding:4px 0 10px;">' +
// 					'<div style="display:flex;justify-content:flex-end;margin-bottom:10px;">' + xlBtn('xl-summary-inr', 'Export to Excel') + '</div>' +

// 					'<div class="sinr-section-label">A. Unit Wise Plan</div>' +
// 					tableHtmlA(rowsA, pLbl, aLbl) +

// 					'<div class="sinr-section-label" style="margin-top:24px;">B. Breakdown of Unit Wise Plan</div>' +
// 					'<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
// 					tableHtmlB(eB, getSubNames(eB), pLbl, aLbl, ctVals) +

// 					'<div class="sinr-section-label" style="margin-top:18px;">C. Opex vs. Capex</div>' +
// 					ocHtml +

// 					(hcClosingAvgHtml ? '<div class="sinr-section-label" style="margin-top:18px;">D. Headcount - Closing &amp; Average</div>' + hcClosingAvgHtml : '') +

// 					cpeHtml +

// 					'<div class="sinr-section-label" style="margin-top:18px;">F. Operating Expenses</div>' +
// 					'<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
// 					tableHtmlC(eB, pLbl, aLbl) +

// 					'<div class="sinr-section-label" style="margin-top:18px;">G. Capital Expenses</div>' +
// 					'<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
// 					tableHtmlD(eB, pLbl, aLbl) +

// 					'<div class="sinr-section-label" style="margin-top:18px;">H. Other Operating Expenses</div>' +
// 					'<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
// 					tableHtmlE(eB, pLbl, aLbl) +

// 					'</div>'
// 				);

// 				fixStickySubHeader('#sinr-table-a');

// 				// Fix CPE table 3-level sticky header top positions
// 				(function tryFixCPE(n) {
// 					var $t = $('#sinr-cpe-table');
// 					if (!$t.length) { return; }
// 					var $r1 = $t.find('thead tr.cb-thead-main');
// 					var $r2 = $t.find('thead tr.cb-thead-sub');
// 					var $r3 = $t.find('thead tr.cb-thead-sub2');
// 					var h1 = $r1.length ? ($r1[0].getBoundingClientRect().height || $r1.outerHeight(true) || 0) : 0;
// 					var h2 = $r2.length ? ($r2[0].getBoundingClientRect().height || $r2.outerHeight(true) || 0) : 0;
// 					if (h1 > 0 && h2 > 0) {
// 						$r2.find('th').css('top', h1 + 'px');
// 						$r3.find('th').css('top', (h1 + h2) + 'px');
// 					} else if (n < 12) {
// 						setTimeout(function () { tryFixCPE(n + 1); }, 60);
// 					}
// 				})(0);

// 				// Fix sticky top for C, D, E tables
// 				['#sinr-table-c', '#sinr-table-d', '#sinr-table-e'].forEach(function (sel) {
// 					(function tryFix(n) {
// 						var $t = $(sel); if (!$t.length) { return; }
// 						var $m = $t.find('thead tr.cb-thead-main');
// 						var h = $m.length ? ($m[0].getBoundingClientRect().height || $m.outerHeight(true) || 0) : 0;
// 						if (h > 0) { $t.find('thead tr.cb-thead-sub th').css('top', h + 'px'); }
// 						else if (n < 12) { setTimeout(function () { tryFix(n + 1); }, 60); }
// 					})(0);
// 				});

// 				(function retrySinrB(n) {
// 					var $b = $('#sinr-table-b'); if (!$b.length) { return; }
// 					var rows = $b.find('thead tr'), ok = true;
// 					rows.each(function () { if (!$(this).outerHeight(true)) { ok = false; } });
// 					if (!ok && n < 10) { setTimeout(function () { retrySinrB(n + 1); }, 50); return; }
// 					var top = 0;
// 					rows.each(function () { $(this).find('th').css('top', top + 'px'); top += $(this).outerHeight(true) || 40; });
// 				})(0);
// 			}

// 			// ── Call 1: unit-wise-plan (drives tables A, B, C, D, E) ─────────────────
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan',
// 				args: { financial_year: fy, month: 'March', table_name_filter: 'Unit Wise Plan' },
// 				callback: function (r) {
// 					var d = Array.isArray(r.message)
// 						? r.message
// 						: ((r.message && Array.isArray(r.message.message)) ? r.message.message : null);
// 					if (!d) { uwpErr = true; uwpData = []; }
// 					else { uwpData = d; }
// 					tryRender();
// 				},
// 				error: function () {
// 					uwpErr = true; uwpData = [];
// 					tryRender();
// 				}
// 			});

// 			// ── Call 2: headcount API (same as Headcount tab) ─────────────────────────
// 			// Returns: { headcount_data: [...], plan_data: [...] }
// 			//   headcount_data → used for average H/C in CPE table
// 			//   plan_data      → contains "Enablers" entry with opex sub_heads → INR columns
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_headcount',
// 				args: { financial_year: fy, month: 'March', table_name_filter: 'Unit Wise Plan' },
// 				callback: function (r) {
// 					var msg = r.message || {};
// 					hcRecords  = msg.headcount_data || [];   // for avg H/C
// 					hcPlanData = msg.plan_data      || [];   // for Enablers INR figures
// 					tryRender();
// 				},
// 				error: function () {
// 					hcRecords  = [];
// 					hcPlanData = [];
// 					tryRender();
// 				}
// 			});
// 		}

// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// HEADCOUNT MODULE
// 	// =============================================================================

// 	var Headcount = (function () {
// 		function fmtHC(v) { if (v === null || v === undefined) { return '-'; } var n = parseFloat(v); return isNaN(n) ? '-' : Math.round(n).toLocaleString('en-IN'); }
// 		function fmtOpex(v) { if (v === null || v === undefined) { return '-'; } var n = parseFloat(v); return isNaN(n) ? '-' : fmtCr(n * 10000000); }
// 		function fmtPct(a, b) {
// 			a = parseFloat(a); b = parseFloat(b);
// 			if (!a || isNaN(a) || isNaN(b)) { return '-'; }
// 			return Math.round(((b / a) - 1) * 100) + '%';
// 		}
// 		function norm(s) { return (s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
// 		function hcSec(txt) { return '<div class="hc-section-title">' + txt + '</div>'; }
// 		function swrap(inner) { return '<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' + inner + '</div>'; }
// 		function buildOpexMap(pd) {
// 			var map = {};
// 			(pd || []).forEach(function (p) {
// 				var op = null; (p.actuals || []).forEach(function (a) { if ((a.name || '').trim() === 'OPERATING  EXPENSES') { op = a; } });
// 				map[norm(p.label || '')] = { est: op ? parseFloat(op.total_posted_amt_ytd || 0) / 10000000 : 0, plan: op ? parseFloat(op.ytd || 0) / 10000000 : 0 };
// 			});
// 			return map;
// 		}
// 		function transform(records) {
// 			var sorted = (records || []).slice().sort(function (a, b) { return (a.financial_year || '').localeCompare(b.financial_year || ''); });
// 			var yrs = sorted.map(function (r) { return r.financial_year || ''; });
// 			var um = {};
// 			sorted.forEach(function (rec) {
// 				(rec.units || []).forEach(function (u) {
// 					var id = String(u.unit || u.unit_id || '');
// 					if (!um[id]) { um[id] = { description: '', hc: {}, seq: parseInt(id, 10) || 0 }; }
// 					um[id].hc[rec.financial_year] = parseFloat(u.total_headcount) || 0;
// 					if (rec.financial_year === yrs[yrs.length - 1]) {
// 						um[id].description = (u.unit_description || u.description || '').trim();
// 					}
// 				});
// 			});
// 			var units = Object.keys(um)
// 				.sort(function (a, b) { return (um[a].seq || 0) - (um[b].seq || 0); })
// 				.map(function (id) { return um[id]; });
// 			var totals = {};
// 			sorted.forEach(function (r) {
// 				totals[r.financial_year] = parseFloat(r.total_head_count || r.total_headcount || 0);
// 			});
// 			return { yrs: yrs, units: units, totals: totals };
// 		}
// 		function avgHC(u, yrs, i) {
// 			if (i === 0) { var c = u.hc[yrs[0]]; return c !== undefined ? c / 2 : null; }
// 			var p = u.hc[yrs[i - 1]], c = u.hc[yrs[i]];
// 			return (p !== undefined && c !== undefined) ? (p + c) / 2 : null;
// 		}
// 		function avgTot(tot, yrs, i) {
// 			if (i === 0) { var c = tot[yrs[0]]; return c !== undefined ? c / 2 : null; }
// 			var p = tot[yrs[i - 1]], c = tot[yrs[i]];
// 			return (p !== undefined && c !== undefined) ? (p + c) / 2 : null;
// 		}
// 		function gtable(hdrs, rows) {
// 			return swrap('<table class="cb-table" style="width:100%;"><thead><tr class="cb-thead-main"><th style="text-align:left !important;min-width:220px;">Unit</th>' +
// 				hdrs.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>');
// 		}
// 		// ── FY string → "31st March-YYYY" label ──────────────────────────────────
// 		// "2025-26" → end year is 2026 → "31st March-2026"

// 		function load(fy) {
// 			var $tab = $('#tab-headcount');
// 			$tab.html('<div style="padding:40px;text-align:center;color:#aaa;">Loading\u2026</div>');
// 			Loader.show('Generating workforce summary\u2026');
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_headcount',
// 				args: { financial_year: fy, month: 'March', table_name_filter: 'Unit Wise Plan' },
// 				callback: function (r) {
// 					Loader.hide();
// 					var msg = r.message || {}, records = msg.headcount_data || [], planData = msg.plan_data || [];
// 					if (!records.length) { $tab.html('<div style="padding:40px;text-align:center;color:#aaa;">No headcount data available.</div>'); return; }
// 					Store.headcount = records;
// 					var om = buildOpexMap(planData), t = transform(records);
// 					var yrs = t.yrs, units = t.units, totals = t.totals, i1 = yrs.length - 2, i2 = yrs.length - 1;

// 					// ── Unit-level headcount summary ────────────────────────────────────
// 					var totEst = 0, totPlan = 0, sRows = '';
// 					units.forEach(function (u) { var a1 = avgHC(u, yrs, i1), a2 = avgHC(u, yrs, i2), o = om[norm(u.description)] || { est: 0, plan: 0 }; totEst += o.est; totPlan += o.plan; sRows += '<tr><td style="text-align:left;">' + u.description + '</td><td>' + fmtHC(a1) + '</td><td>' + fmtHC(a2) + '</td><td>' + fmtPct(a1, a2) + '</td><td>' + fmtOpex(o.est) + '</td><td>' + fmtOpex(o.plan) + '</td><td>' + fmtPct(o.est, o.plan) + '</td></tr>'; });
// 					var ta1 = avgTot(totals, yrs, i1), ta2 = avgTot(totals, yrs, i2);
// 					sRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td><td>' + fmtHC(ta1) + '</td><td>' + fmtHC(ta2) + '</td><td>' + fmtPct(ta1, ta2) + '</td><td>' + fmtOpex(totEst) + '</td><td>' + fmtOpex(totPlan) + '</td><td>' + fmtPct(totEst, totPlan) + '</td></tr>';
// 					var sumHtml = swrap('<table class="cb-table" style="width:100%;"><thead><tr class="cb-thead-main"><th rowspan="2" style="text-align:left !important;min-width:200px;">Unit</th><th colspan="3" style="text-align:center !important;">Average H/C</th><th colspan="3" style="text-align:center !important;">Opex Spend (&#8377; Cr.)</th></tr><tr class="cb-thead-sub"><th>' + (yrs[i1] || '') + '</th><th>' + (yrs[i2] || '') + '</th><th>%</th><th>' + (yrs[i1] || '') + ' Est</th><th>' + (yrs[i2] || '') + ' Plan</th><th>%</th></tr></thead><tbody>' + sRows + '</tbody></table>');

// 					// ── 3. Closing H/C, Average H/C, % increase tables (existing) ────────
// 					var cRows = '', aRows = '';
// 					units.forEach(function (u) { cRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.map(function (y) { return '<td>' + fmtHC(u.hc[y] !== undefined ? u.hc[y] : null) + '</td>'; }).join('') + '</tr>'; });
// 					cRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + yrs.map(function (y) { return '<td>' + fmtHC(totals[y] || 0) + '</td>'; }).join('') + '</tr>';
// 					units.forEach(function (u) { aRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.map(function (y, i) { return '<td>' + fmtHC(avgHC(u, yrs, i)) + '</td>'; }).join('') + '</tr>'; });
// 					aRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + yrs.map(function (y, i) { return '<td>' + fmtHC(avgTot(totals, yrs, i)) + '</td>'; }).join('') + '</tr>';
// 					var pHdrs = [], cpRows = '', apRows = '';
// 					if (yrs.length >= 2) {
// 						pHdrs = yrs.slice(1).map(function (y, i) { return yrs[i] + ' &#8594; ' + y; });
// 						units.forEach(function (u) { cpRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.slice(1).map(function (y, i) { return '<td>' + fmtPct(u.hc[yrs[i]], u.hc[y]) + '</td>'; }).join('') + '</tr>'; apRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.slice(1).map(function (y, i) { return '<td>' + fmtPct(avgHC(u, yrs, i), avgHC(u, yrs, i + 1)) + '</td>'; }).join('') + '</tr>'; });
// 						cpRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + yrs.slice(1).map(function (y, i) { return '<td>' + fmtPct(totals[yrs[i]], totals[y]) + '</td>'; }).join('') + '</tr>';
// 						var tpc = ''; for (var ii = 1; ii < yrs.length; ii++) { tpc += '<td>' + fmtPct(avgTot(totals, yrs, ii - 1), avgTot(totals, yrs, ii)) + '</td>'; }
// 						apRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + tpc + '</tr>';
// 					}

// 					$tab.html(
// 						'<div style="padding:4px 0 10px;">' +
// 						'<div style="display:flex;justify-content:flex-end;margin-bottom:10px;">' + xlBtn('xl-headcount', 'Export to Excel') + '</div>' +
// 												hcSec('Headcount Summary') +
// 						'<div class="ppt-currency-label" style="text-align:left;margin-bottom:6px;">H/C numbers &nbsp;|&nbsp; Opex in &#8377; <strong>Cr.</strong></div>' +
// 						sumHtml +
// 						hcSec('Closing H/C') + gtable(yrs, cRows) +
// 						hcSec('Average H/C') + gtable(yrs, aRows) +
// 						(yrs.length >= 2 ? hcSec('Increase in Closing H/C (%)') + gtable(pHdrs, cpRows) : '') +
// 						(yrs.length >= 2 ? hcSec('Increase in Average H/C (%)') + gtable(pHdrs, apRows) : '') +
// 						'</div>'
// 					);
// 					$tab.find('.cb-table').each(function () { fixStickySubHeader(this); });
// 				},
// 				error: function () { Loader.hide(); $tab.html('<div style="padding:40px;text-align:center;color:red;">Error loading headcount data.</div>'); }
// 			});
// 		}
// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// ANNUAL BUDGET MODULE
// 	// =============================================================================

// 	var Annual = (function () {
// 		var Q_DEFS = { q1: { label: 'Quarter 1', months: ['April', 'May', 'June'] }, q2: { label: 'Quarter 2', months: ['July', 'August', 'September'] }, q3: { label: 'Quarter 3', months: ['October', 'November', 'December'] }, q4: { label: 'Quarter 4', months: ['January', 'February', 'March'] } };
// 		var Q_KEYS = ['q1', 'q2', 'q3', 'q4'];
// 		var data = [], expandedQ = [], openH = {}, openS = {}, bound = false;
// 		function sumArr(a) { var t = 0; (a || []).forEach(function (v) { t += (v || 0); }); return t; }
// 		function objTotal(o) { var t = 0; Q_KEYS.forEach(function (k) { t += sumArr(o[k]); }); return t; }
// 		function qCells(obj) {
// 			var html = '';
// 			Q_KEYS.forEach(function (k) {
// 				var vals = obj[k] || [0, 0, 0];
// 				if (expandedQ.indexOf(k) !== -1) { vals.forEach(function (v) { html += '<td>' + formatINR(v) + '</td>'; }); }
// 				else { html += '<td colspan="3">' + formatINR(sumArr(vals)) + '</td>'; }
// 			});
// 			return html;
// 		}
// 		function buildHeader() {
// 			var $t = $('#annual-table thead').empty(), $m = $('<tr class="cb-thead-main"></tr>');
// 			$m.append('<th rowspan="2" style="min-width:220px;text-align:left !important;">Expense Head / Line Item</th>');
// 			Q_KEYS.forEach(function (k) { var o = expandedQ.indexOf(k) !== -1; $m.append('<th class="cb-q-header" data-quarter="' + k + '" colspan="3" rowspan="' + (o ? 1 : 2) + '" style="cursor:pointer;">' + Q_DEFS[k].label + ' ' + (o ? '\u25b2' : '\u25bc') + '</th>'); });
// 			$m.append('<th rowspan="2" style="min-width:110px;">Total</th>'); $t.append($m);
// 			if (expandedQ.length) { var $s = $('<tr class="cb-thead-sub"></tr>'); Q_KEYS.forEach(function (k) { if (expandedQ.indexOf(k) !== -1) { Q_DEFS[k].months.forEach(function (m) { $s.append('<th>' + m + '</th>'); }); } }); $t.append($s); }
// 			fixStickySubHeader('#annual-table');
// 		}
// 		function renderTable() {
// 			buildHeader();
// 			var $tb = $('#annual-table tbody').empty(), term = $('#annual-search').val().trim().toLowerCase();
// 			var grand = { q1: [0, 0, 0], q2: [0, 0, 0], q3: [0, 0, 0], q4: [0, 0, 0] };
// 			data.forEach(function (head, hi) {
// 				if (term && !matchSearch(head, term)) { return; }
// 				var hs = String(hi), ho = openH[hs] === true;
// 				Q_KEYS.forEach(function (k) { (head[k] || [0, 0, 0]).forEach(function (v, mi) { grand[k][mi] += (v || 0); }); });
// 				$tb.append('<tr class="cb-row-head cb-annual-head" data-hi="' + hs + '"><td><span class="cb-arrow">' + (ho ? '\u25bc' : '\u25b6') + '</span> ' + head.name.trim() + '</td>' + qCells(head) + '<td class="cb-text-accent">' + formatINR(objTotal(head)) + '</td></tr>');
// 				(head.sub_heads || []).forEach(function (sub, si) {
// 					var sk = hs + '-' + si, so = openS[sk] === true;
// 					$tb.append('<tr class="cb-row-sub cb-annual-sub" data-hi="' + hs + '" data-si="' + si + '" style="' + (ho ? '' : 'display:none;') + '"><td style="padding-left:22px;"><span class="cb-arrow">' + (so ? '\u25bc' : '\u25b6') + '</span> ' + sub.name + '</td>' + qCells(sub) + '<td>' + formatINR(objTotal(sub)) + '</td></tr>');
// 					(sub.items || []).forEach(function (item) { $tb.append('<tr class="cb-annual-sub-item" data-hi="' + hs + '" data-si="' + si + '" style="' + ((ho && so) ? '' : 'display:none;') + '"><td style="padding-left:42px;">' + item.name + '</td>' + qCells(item) + '<td>' + formatINR(objTotal(item)) + '</td></tr>'); });
// 				});
// 				(head.items || []).forEach(function (d) { $tb.append('<tr class="cb-annual-head-item" data-hi="' + hs + '" style="' + (ho ? '' : 'display:none;') + '"><td style="padding-left:35px;">' + d.name + '</td>' + qCells(d) + '<td>' + formatINR(objTotal(d)) + '</td></tr>'); });
// 			});
// 			var gt = 0; Q_KEYS.forEach(function (k) { gt += sumArr(grand[k]); });
// 			$tb.append('<tr class="cb-row-grand"><td>GRAND TOTAL</td>' + qCells(grand) + '<td>' + formatINR(gt) + '</td></tr>');
// 			fixStickySubHeader('#annual-table');
// 		}
// 		function toggleHead(hs) { openH[hs] = !(openH[hs] === true); if (!openH[hs]) { data.forEach(function (h, hi) { if (String(hi) !== hs) { return; } (h.sub_heads || []).forEach(function (_, si) { openS[hs + '-' + si] = false; }); }); } renderTable(); }
// 		function toggleSub(hs, ss) { openS[hs + '-' + ss] = !(openS[hs + '-' + ss] === true); renderTable(); }
// 		function matchSearch(head, term) {
// 			if (!term) { return true; }
// 			if (head.name.toLowerCase().indexOf(term) !== -1) { return true; }
// 			for (var s = 0; s < (head.sub_heads || []).length; s++) { if (head.sub_heads[s].name.toLowerCase().indexOf(term) !== -1) { return true; } for (var i = 0; i < (head.sub_heads[s].items || []).length; i++) { if ((head.sub_heads[s].items[i].name || '').toLowerCase().indexOf(term) !== -1) { return true; } } }
// 			for (var d = 0; d < (head.items || []).length; d++) { if ((head.items[d].name || '').toLowerCase().indexOf(term) !== -1) { return true; } }
// 			return false;
// 		}
// 		function bindEvents() {
// 			$(document).on('input.annual', '#annual-search', function () { renderTable(); });
// 			$(document).on('change.annual', '#annual-expand-quarters', function () { expandedQ = this.checked ? Q_KEYS.slice() : []; renderTable(); });
// 			$(document).on('change.annual', '#annual-expand-items', function () { if (this.checked) { data.forEach(function (h, hi) { openH[String(hi)] = true; (h.sub_heads || []).forEach(function (_, si) { openS[hi + '-' + si] = true; }); }); } else { openH = {}; openS = {}; } renderTable(); });
// 			$(document).on('click.annual', '#annual-table .cb-q-header', function () { var k = String($(this).attr('data-quarter')), idx = expandedQ.indexOf(k); if (idx !== -1) { expandedQ.splice(idx, 1); } else { expandedQ.push(k); } $('#annual-expand-quarters').prop('checked', expandedQ.length === Q_KEYS.length); renderTable(); });
// 			$('#tab-annual_budget').on('click.annual', '.cb-annual-head', function (e) { e.stopPropagation(); toggleHead(String($(this).attr('data-hi'))); });
// 			$('#tab-annual_budget').on('click.annual', '.cb-annual-sub',  function (e) { e.stopPropagation(); toggleSub(String($(this).attr('data-hi')), String($(this).attr('data-si'))); });
// 		}
// 		function load(fy) {
// 			if (!bound) { bindEvents(); bound = true; }
// 			data = []; openH = {}; openS = {}; expandedQ = [];
// 			$('#annual-expand-quarters,#annual-expand-items').prop('checked', false);
// 			$('#annual-search').val('');
// 			Loader.show('Building Annual Budget\u2026');
// 			frappe.call({
// 				method: 'annual_budget.api.phase_sheet.get_consolidated_report',
// 				args: { financial_year: fy },
// 				callback: function (r) { data = r.message || []; Store.annual = data; renderTable(); Loader.hide(); },
// 				error: function () { Loader.hide(); frappe.msgprint('Error loading Annual Budget.'); }
// 			});
// 		}
// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// ESTIMATE MODULE
// 	// =============================================================================

// 	var Estimate = (function () {
// 		var Q_DEFS = { q1: { label: 'Quarter 1', months: ['April', 'May', 'June'] }, q2: { label: 'Quarter 2', months: ['July', 'August', 'September'] }, q3: { label: 'Quarter 3', months: ['October', 'November', 'December'] }, q4: { label: 'Quarter 4', months: ['January', 'February', 'March'] } };
// 		var Q_KEYS = ['q1', 'q2', 'q3', 'q4'], Q_IDX = { q1: [0, 1, 2], q2: [3, 4, 5], q3: [6, 7, 8], q4: [9, 10, 11] };
// 		var data = [], expandedQ = [], openH = {}, openS = {}, bound = false;
// 		function getMth(obj) { var m = obj.months || {}; return [parseFloat(m['4']||0),parseFloat(m['5']||0),parseFloat(m['6']||0),parseFloat(m['7']||0),parseFloat(m['8']||0),parseFloat(m['9']||0),parseFloat(m['10']||0),parseFloat(m['11']||0),parseFloat(m['12']||0),parseFloat(m['1']||0),parseFloat(m['2']||0),parseFloat(m['3']||0)]; }
// 		function qTot(obj) { return [parseFloat(obj['Q1']||0),parseFloat(obj['Q2']||0),parseFloat(obj['Q3']||0),parseFloat(obj['Q4']||0)]; }
// 		function yTot(obj) { var q = qTot(obj); return q[0]+q[1]+q[2]+q[3]; }
// 		function qCells(obj) { var mths = getMth(obj), qtots = qTot(obj), html = ''; Q_KEYS.forEach(function (q, qi) { if (expandedQ.indexOf(q) !== -1) { Q_IDX[q].forEach(function (mi) { html += '<td>' + formatINR(mths[mi]) + '</td>'; }); } else { html += '<td colspan="3">' + formatINR(qtots[qi]) + '</td>'; } }); return html; }
// 		function buildHeader() {
// 			var $t = $('#estimate-table thead').empty(), $m = $('<tr class="cb-thead-main"></tr>');
// 			$m.append('<th rowspan="2" style="min-width:220px;text-align:left !important;">Expense</th>');
// 			Q_KEYS.forEach(function (k) { var o = expandedQ.indexOf(k) !== -1; $m.append('<th class="est-q-toggle" data-q="' + k + '" colspan="3" rowspan="' + (o ? 1 : 2) + '" style="cursor:pointer;">' + Q_DEFS[k].label + ' ' + (o ? '\u25b2' : '\u25bc') + '</th>'); });
// 			$m.append('<th rowspan="2" style="min-width:110px;">Total</th>'); $t.append($m);
// 			if (expandedQ.length) { var $s = $('<tr class="cb-thead-sub"></tr>'); Q_KEYS.forEach(function (k) { if (expandedQ.indexOf(k) !== -1) { Q_DEFS[k].months.forEach(function (m) { $s.append('<th>' + m + '</th>'); }); } }); $t.append($s); }
// 			fixStickySubHeader('#estimate-table');
// 		}
// 		function renderTable() {
// 			buildHeader();
// 			var $tb = $('#estimate-tbody').empty(), term = $('#estimate-search').val().trim().toLowerCase();
// 			if (!Array.isArray(data) || !data.length) { $tb.append('<tr><td colspan="14" style="text-align:center;padding:40px;color:#aaa;">No data available.</td></tr>'); return; }
// 			var gM = [0,0,0,0,0,0,0,0,0,0,0,0], gQ = [0,0,0,0];
// 			data.forEach(function (head, hi) {
// 				if (term && !matchSearch(head, term)) { return; }
// 				getMth(head).forEach(function (v, i) { gM[i] += v; }); qTot(head).forEach(function (v, i) { gQ[i] += v; });
// 				var hs = String(hi), ho = openH[hs];
// 				$tb.append('<tr class="cb-row-head cb-est-head" data-hi="' + hs + '"><td><span class="cb-arrow">' + (ho ? '\u25bc' : '\u25b6') + '</span> ' + head.name + '</td>' + qCells(head) + '<td class="cb-text-accent">' + formatINR(yTot(head)) + '</td></tr>');
// 				(head.items || []).forEach(function (item) { $tb.append('<tr class="cb-est-head-item" data-hi="' + hs + '" style="' + (ho ? '' : 'display:none;') + '"><td style="padding-left:28px;">' + item.name + '</td>' + qCells(item) + '<td>' + formatINR(yTot(item)) + '</td></tr>'); });
// 				(head.sub_heads || []).forEach(function (sub, si) {
// 					var sk = hs + '-' + si, so = openS[sk];
// 					$tb.append('<tr class="cb-row-sub cb-est-sub" data-hi="' + hs + '" data-si="' + si + '" style="' + (ho ? '' : 'display:none;') + '"><td style="padding-left:20px;"><span class="cb-arrow">' + (so ? '\u25bc' : '\u25b6') + '</span> ' + sub.name + '</td>' + qCells(sub) + '<td>' + formatINR(yTot(sub)) + '</td></tr>');
// 					(sub.items || []).forEach(function (item) { $tb.append('<tr class="cb-est-sub-item" data-hi="' + hs + '" data-si="' + si + '" style="' + ((ho && so) ? '' : 'display:none;') + '"><td style="padding-left:44px;">' + item.name + '</td>' + qCells(item) + '<td>' + formatINR(yTot(item)) + '</td></tr>'); });
// 				});
// 			});
// 			var gO = { Q1: gQ[0], Q2: gQ[1], Q3: gQ[2], Q4: gQ[3], months: { '4': gM[0], '5': gM[1], '6': gM[2], '7': gM[3], '8': gM[4], '9': gM[5], '10': gM[6], '11': gM[7], '12': gM[8], '1': gM[9], '2': gM[10], '3': gM[11] } };
// 			$tb.append('<tr class="cb-row-grand"><td>GRAND TOTAL</td>' + qCells(gO) + '<td>' + formatINR(gQ[0]+gQ[1]+gQ[2]+gQ[3]) + '</td></tr>');
// 			fixStickySubHeader('#estimate-table');
// 		}
// 		function toggleHead(hs) { var o = !openH[hs]; openH[hs] = o; $('#estimate-table tbody .cb-est-head[data-hi="' + hs + '"]').find('.cb-arrow').text(o ? '\u25bc' : '\u25b6'); if (o) { $('#estimate-table tbody .cb-est-sub[data-hi="' + hs + '"]').show(); $('#estimate-table tbody .cb-est-head-item[data-hi="' + hs + '"]').show(); $('#estimate-table tbody .cb-est-sub[data-hi="' + hs + '"]').each(function () { var si = $(this).attr('data-si'); if (openS[hs + '-' + si]) { $('#estimate-table tbody .cb-est-sub-item[data-hi="' + hs + '"][data-si="' + si + '"]').show(); } }); } else { $('#estimate-table tbody .cb-est-sub[data-hi="' + hs + '"]').each(function () { var si = $(this).attr('data-si'); openS[hs + '-' + si] = false; $(this).find('.cb-arrow').text('\u25b6'); }); $('#estimate-table tbody .cb-est-sub[data-hi="' + hs + '"],.cb-est-sub-item[data-hi="' + hs + '"],.cb-est-head-item[data-hi="' + hs + '"]').hide(); } }
// 		function toggleSub(hs, ss) { var sk = hs + '-' + ss, o = !openS[sk]; openS[sk] = o; $('#estimate-table tbody .cb-est-sub[data-hi="' + hs + '"][data-si="' + ss + '"]').find('.cb-arrow').text(o ? '\u25bc' : '\u25b6'); var $i = $('#estimate-table tbody .cb-est-sub-item[data-hi="' + hs + '"][data-si="' + ss + '"]'); o ? $i.show() : $i.hide(); }
// 		function matchSearch(head, term) { if (!term) { return true; } if (head.name.toLowerCase().indexOf(term) !== -1) { return true; } for (var s = 0; s < (head.sub_heads || []).length; s++) { if (head.sub_heads[s].name.toLowerCase().indexOf(term) !== -1) { return true; } for (var i = 0; i < (head.sub_heads[s].items || []).length; i++) { if ((head.sub_heads[s].items[i].name || '').toLowerCase().indexOf(term) !== -1) { return true; } } } for (var d = 0; d < (head.items || []).length; d++) { if ((head.items[d].name || '').toLowerCase().indexOf(term) !== -1) { return true; } } return false; }
// 		function bindEvents() {
// 			$(document).on('click.estimate', '#estimate-table .est-q-toggle', function () { var k = String($(this).attr('data-q')), idx = expandedQ.indexOf(k); if (idx !== -1) { expandedQ.splice(idx, 1); } else { expandedQ.push(k); } $('#estimate-expand-quarters').prop('checked', expandedQ.length === Q_KEYS.length); renderTable(); });
// 			$(document).on('change.estimate', '#estimate-expand-quarters', function () { expandedQ = this.checked ? Q_KEYS.slice() : []; renderTable(); });
// 			$(document).on('change.estimate', '#estimate-expand-items', function () { if (this.checked) { data.forEach(function (h, hi) { openH[String(hi)] = true; (h.sub_heads || []).forEach(function (_, si) { openS[hi + '-' + si] = true; }); }); } else { openH = {}; openS = {}; } renderTable(); });
// 			$('#tab-estimate').on('click.estimate', '.cb-est-head', function (e) { e.stopPropagation(); toggleHead(String($(this).attr('data-hi'))); });
// 			$('#tab-estimate').on('click.estimate', '.cb-est-sub',  function (e) { e.stopPropagation(); toggleSub(String($(this).attr('data-hi')), String($(this).attr('data-si'))); });
// 			$(document).on('input.estimate', '#estimate-search', function () { renderTable(); });
// 		}
// 		function load(fy) {
// 			if (!bound) { bindEvents(); bound = true; }
// 			data = []; openH = {}; openS = {}; expandedQ = [];
// 			$('#estimate-expand-quarters,#estimate-expand-items').prop('checked', false);
// 			Loader.show('Building Estimate\u2026');
// 			var year = (getPrevFY(fy) || '2025-26').split('-')[0];
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_grouped_actuals_quarter_and_month_wise_total',
// 				args: { fiscal_year: year, accounting_period: '12' },
// 				callback: function (r) {
// 					if (r.message) { if (r.message.status === 'success') { data = r.message.data || []; } else if (Array.isArray(r.message)) { data = r.message; } else if (r.message.data && Array.isArray(r.message.data)) { data = r.message.data; } else { frappe.msgprint('Failed to load Estimate data.'); } } else { frappe.msgprint('Failed to load Estimate data.'); }
// 					Store.estimate = data; renderTable(); Loader.hide();
// 				},
// 				error: function () { Loader.hide(); frappe.msgprint('Server error loading Estimate data.'); }
// 			});
// 		}
// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// BUDGET & ESTIMATE MODULE
// 	// =============================================================================

// 	var BudgetEstimate = (function () {
// 		var rawData = [], currentFY = '', openSec = {}, openSub = {}, expandItems = false, bound = false;
// 		function pl() { return getFYLabels(currentFY).plan; }
// 		function el() { return getFYLabels(currentFY).est; }
// 		function isGT(sec) { return sec.sequence_id === 9999 || (sec.name || '').toUpperCase().replace(/\s+/g, ' ').trim() === 'GRAND TOTAL'; }
// 		function secVal(e, sn, f) { var v = 0; (e.actuals || []).forEach(function (s) { if (isGT(s) || s.name !== sn) { return; } v += parseFloat(f === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); }); return v; }
// 		function subVal(e, sn, subn, f) { var v = 0; (e.actuals || []).forEach(function (s) { if (isGT(s) || s.name !== sn) { return; } (s.sub_heads || []).forEach(function (sub) { if (sub.name !== subn) { return; } v += parseFloat(f === 'plan' ? (sub.ytd || 0) : (sub.total_posted_amt_ytd || 0)); }); }); return v; }
// 		function itemVal(e, nm, f) { var v = 0; (e.actuals || []).forEach(function (s) { if (isGT(s)) { return; } (s.items || []).forEach(function (i) { if (i.name === nm) { v += parseFloat(f === 'plan' ? (i.ytd || 0) : (i.total_posted_amt || 0)); } }); (s.sub_heads || []).forEach(function (sub) { (sub.items || []).forEach(function (i) { if (i.name === nm) { v += parseFloat(f === 'plan' ? (i.ytd || 0) : (i.total_posted_amt || 0)); } }); }); }); return v; }
// 		function grandVal(e, f) {
// 			var gt = 0, found = false;
// 			(e.actuals || []).forEach(function (s) {
// 				if (isGT(s)) { gt += parseFloat(f === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); found = true; }
// 			});
// 			if (!found) {
// 				(e.actuals || []).forEach(function (s) { gt += parseFloat(f === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); });
// 			}
// 			return gt;
// 		}
// 		function secTP(sn) { var v = 0; rawData.forEach(function (e) { v += secVal(e, sn, 'plan'); }); return v; }
// 		function secTE(sn) { var v = 0; rawData.forEach(function (e) { v += secVal(e, sn, 'est'); }); return v; }
// 		function subTP(sn, subn) { var v = 0; rawData.forEach(function (e) { v += subVal(e, sn, subn, 'plan'); }); return v; }
// 		function subTE(sn, subn) { var v = 0; rawData.forEach(function (e) { v += subVal(e, sn, subn, 'est'); }); return v; }
// 		function iTotP(n) { var v = 0; rawData.forEach(function (e) { v += itemVal(e, n, 'plan'); }); return v; }
// 		function iTotE(n) { var v = 0; rawData.forEach(function (e) { v += itemVal(e, n, 'est'); }); return v; }
// 		function allGP() { var v = 0; rawData.forEach(function (e) { v += grandVal(e, 'plan'); }); return v; }
// 		function allGE() { var v = 0; rawData.forEach(function (e) { v += grandVal(e, 'est'); }); return v; }
// 		function cellsPair(getP, getE) { var h = ''; rawData.forEach(function (e) { h += '<td>' + formatINR(getP(e)) + '</td><td>' + formatINR(getE(e)) + '</td>'; }); return h; }
// 		function tc2(plan, est, cls) { cls = cls || ''; return '<td class="be-total-plan ' + cls + '" style="font-weight:700;">' + formatINR(plan) + '</td><td class="be-total-est ' + cls + '" style="font-weight:700;">' + formatINR(est) + '</td>'; }
// 		function buildStruct() { if (!rawData.length) { return []; } return (rawData[0].actuals || []).filter(function (s) { return !isGT(s); }).map(function (s) { return { name: s.name, sub_heads: (s.sub_heads || []).map(function (sub) { return { name: sub.name, items: (sub.items || []).map(function (i) { return { name: i.name }; }) }; }), items: (s.items || []).map(function (i) { return { name: i.name }; }) }; }); }
// 		function buildHeader() {
// 			var $t = $('#be-table thead').empty(), $r1 = $('<tr class="cb-thead-main"></tr>'), $r2 = $('<tr class="cb-thead-sub"></tr>');
// 			$r1.append('<th rowspan="2" style="text-align:left !important;min-width:280px;position:sticky;left:0;z-index:50;background:#0076B6;vertical-align:middle;">Expense Head / Line Item</th>');
// 			rawData.forEach(function (e) { $r1.append('<th colspan="2" style="text-align:center;min-width:260px;">' + (e.label || '').trim() + '</th>'); });
// 			$r1.append('<th colspan="2" style="text-align:center;min-width:260px;background:#003B63;">Grand Total</th>');
// 			rawData.forEach(function () { $r2.append('<th style="text-align:center;min-width:130px;">' + pl() + '</th><th style="text-align:center;min-width:130px;">' + el() + '</th>'); });
// 			$r2.append('<th style="text-align:center;min-width:130px;background:#004F8B;">' + pl() + '</th><th style="text-align:center;min-width:130px;background:#004F8B;">' + el() + '</th>');
// 			$t.append($r1).append($r2); fixStickySubHeader('#be-table');
// 		}
// 		function renderTable() {
// 			buildHeader();
// 			var $tb = $('#be-tbody').empty(), term = $('#be-search').val().trim().toLowerCase(), struct = buildStruct();
// 			if (!rawData.length || !struct.length) { $tb.append('<tr><td colspan="' + (1 + rawData.length * 2 + 2) + '" style="text-align:center;padding:40px;color:#aaa;">No data available.</td></tr>'); return; }
// 			struct.forEach(function (sec) {
// 				var sn = sec.name;
// 				var secOpen = openSec[sn] === true;
// 				var secVis = secOpen ? '' : 'display:none;';
// 				$tb.append('<tr class="cb-row-head be-sec-row" data-sec="' + sn + '"><td style="text-align:left;"><span class="cb-arrow">' + (secOpen ? '\u25bc' : '\u25b6') + '</span> ' + sn + '</td>' +
// 					cellsPair(function (e) { return secVal(e, sn, 'plan'); }, function (e) { return secVal(e, sn, 'est'); }) +
// 					tc2(secTP(sn), secTE(sn), 'be-grand-col') + '</tr>');
// 				sec.sub_heads.forEach(function (sub) {
// 					var sk = sn + '::' + sub.name, subOpen = expandItems || (openSub[sk] === true), itmVis = (secOpen && subOpen) ? '' : 'display:none;';
// 					$tb.append('<tr class="cb-row-sub be-sec-child be-sub-row" data-sec="' + sn + '" data-sub="' + sk + '" style="' + secVis + '"><td style="padding-left:22px;text-align:left;"><span class="cb-arrow">' + (subOpen ? '\u25bc' : '\u25b6') + '</span> ' + sub.name + '</td>' +
// 						cellsPair(function (e) { return subVal(e, sn, sub.name, 'plan'); }, function (e) { return subVal(e, sn, sub.name, 'est'); }) +
// 						tc2(subTP(sn, sub.name), subTE(sn, sub.name), 'be-grand-col') + '</tr>');
// 					sub.items.forEach(function (item) {
// 						if (term && item.name.toLowerCase().indexOf(term) === -1) { return; }
// 						$tb.append('<tr class="be-item-row be-sec-child be-sub-child" data-sec="' + sn + '" data-sub="' + sk + '" style="' + itmVis + '"><td style="padding-left:42px;text-align:left;">' + item.name + '</td>' +
// 							cellsPair(function (e) { return itemVal(e, item.name, 'plan'); }, function (e) { return itemVal(e, item.name, 'est'); }) +
// 							tc2(iTotP(item.name), iTotE(item.name), 'be-grand-col') + '</tr>');
// 					});
// 				});
// 				sec.items.forEach(function (item) {
// 					if (term && item.name.toLowerCase().indexOf(term) === -1) { return; }
// 					$tb.append('<tr class="be-item-row be-sec-child be-direct-item" data-sec="' + sn + '" style="' + secVis + '"><td style="padding-left:30px;text-align:left;">' + item.name + '</td>' +
// 						cellsPair(function (e) { return itemVal(e, item.name, 'plan'); }, function (e) { return itemVal(e, item.name, 'est'); }) +
// 						tc2(iTotP(item.name), iTotE(item.name), 'be-grand-col') + '</tr>');
// 				});
// 			});
// 			$tb.append('<tr class="cb-row-grand"><td style="text-align:left;">GRAND TOTAL</td>' + cellsPair(function (e) { return grandVal(e, 'plan'); }, function (e) { return grandVal(e, 'est'); }) + tc2(allGP(), allGE(), 'be-grand-col') + '</tr>');
// 			fixStickySubHeader('#be-table');
// 		}
// 		function toggleSec(sn) { var o = !(openSec[sn] === true); openSec[sn] = o; $('#be-table tbody .be-sec-row[data-sec="' + sn + '"]').find('.cb-arrow').text(o ? '\u25bc' : '\u25b6'); var $ch = $('#be-table tbody .be-sec-child[data-sec="' + sn + '"]'); if (o) { $ch.filter('.be-sub-row,.be-direct-item').show(); $ch.filter('.be-sub-child').each(function () { if (expandItems || openSub[$(this).attr('data-sub')] === true) { $(this).show(); } }); } else { $ch.hide(); } }
// 		function toggleSubRow(sk) { var o = !(openSub[sk] === true); openSub[sk] = o; $('#be-table tbody .be-sub-row[data-sub="' + sk + '"]').find('.cb-arrow').text(o ? '\u25bc' : '\u25b6'); var $it = $('#be-table tbody .be-sub-child[data-sub="' + sk + '"]'); o ? $it.show() : $it.hide(); }
// 		function bindEvents() {
// 			$('#tab-budget_estimate').on('click.be', '.be-sec-row', function (e) { e.stopPropagation(); toggleSec($(this).attr('data-sec')); });
// 			$('#tab-budget_estimate').on('click.be', '.be-sub-row', function (e) { e.stopPropagation(); if (!expandItems) { toggleSubRow($(this).attr('data-sub')); } });
// 			$(document).on('change.be', '#be-expand-items', function () { expandItems = this.checked; buildStruct().forEach(function (sec) { openSec[sec.name] = expandItems; sec.sub_heads.forEach(function (sub) { openSub[sec.name + '::' + sub.name] = expandItems; }); }); renderTable(); });
// 			$(document).on('input.be', '#be-search', function () { renderTable(); });
// 		}
// 		function load(fy) {
// 			if (!bound) { bindEvents(); bound = true; }
// 			currentFY = fy; rawData = []; openSec = {}; openSub = {}; expandItems = false;
// 			$('#be-expand-items').prop('checked', false);
// 			Loader.show('Building Budget & Estimate\u2026');
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan',
// 				args: { financial_year: fy, month: 'March', table_name_filter: 'Budget & Estimate' },
// 				callback: function (r) {
// 					Loader.hide();
// 					var d = Array.isArray(r.message) ? r.message : ((r.message && Array.isArray(r.message.message)) ? r.message.message : null);
// 					if (!d || !d.length) { frappe.msgprint('No data returned for Budget & Estimate.'); renderTable(); return; }
// 					rawData = d.filter(function (e) {
// 						return e.is_this_sub_item === 0
// 							&& e.sequence_id !== 9999
// 							&& (e.table_name || '').toUpperCase() !== 'CONSOLIDATED';
// 					}).sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });
// 					Store.budgetEstimate = rawData; renderTable();
// 				},
// 				error: function () { Loader.hide(); frappe.msgprint('Server error loading Budget & Estimate data.'); }
// 			});
// 		}
// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// EXPORT WIRING
// 	// =============================================================================

// 	var API = 'annual_budget.api.export_reports';
// 	$(document).on('click', '#xl-ppt', function () { var fy = fyControl.get_value() || '2025-26'; if (!Store.ppt.rows.length) { frappe.msgprint('Please wait for the Foundation Metrics data to load first.'); return; } serverExport(API + '.export_ppt', { financial_year: fy, ppt_rows: JSON.stringify(Store.ppt.rows), prev_ppt_rows: JSON.stringify(Store.ppt.prevRows), budget_label: Store.ppt.budgetLabel, est_label: Store.ppt.estLabel, prev_budget_label: Store.ppt.prevBudgetLabel, prev_est_label: Store.ppt.prevEstLabel }, 'Building Foundation Metrics Excel\u2026'); });
// 	$(document).on('click', '#xl-summary-inr', function () { var fy = fyControl.get_value() || '2025-26'; if (!Store.summaryInr.length) { frappe.msgprint('Please wait for the Summary in INR data to load first.'); return; } serverExport(API + '.export_summary_inr', { financial_year: fy, summary_data: JSON.stringify(Store.summaryInr) }, 'Building Summary in INR Excel\u2026'); });
// 	$(document).on('click', '#xl-headcount', function () { var fy = fyControl.get_value() || '2025-26'; if (!Store.headcount.length) { frappe.msgprint('Please wait for the Headcount data to load first.'); return; } serverExport(API + '.export_headcount', { financial_year: fy, headcount_data: JSON.stringify(Store.headcount) }, 'Building Headcount Excel\u2026'); });
// 	$(document).on('click', '#xl-annual', function () { var fy = fyControl.get_value() || '2025-26'; if (!Store.annual.length) { frappe.msgprint('Please open the Annual Budget tab first.'); return; } serverExport(API + '.export_annual', { financial_year: fy, annual_data: JSON.stringify(Store.annual) }, 'Building Annual Budget Excel\u2026'); });
// 	$(document).on('click', '#xl-estimate', function () { var fy = fyControl.get_value() || '2025-26'; if (!Store.estimate.length) { frappe.msgprint('Please open the Estimate tab first.'); return; } serverExport(API + '.export_estimate', { financial_year: fy, estimate_data: JSON.stringify(Store.estimate) }, 'Building Estimate Excel\u2026'); });
// 	$(document).on('click', '#xl-be', function () { var fy = fyControl.get_value() || '2025-26'; if (!Store.budgetEstimate.length) { frappe.msgprint('Please open the Budget & Estimate tab first.'); return; } serverExport(API + '.export_budget_estimate', { financial_year: fy, be_data: JSON.stringify(Store.budgetEstimate) }, 'Building Budget & Estimate Excel\u2026'); });
// 	$(document).on('click', '#xl-export-all', function () {
// 		var fy = fyControl.get_value() || '2025-26', missing = [];
// 		if (!Store.ppt.rows.length)      { missing.push('Foundation Metrics (tab 1)'); }
// 		if (!Store.summaryInr.length)     { missing.push('Summary in INR (tab 2)'); }
// 		if (!Store.headcount.length)      { missing.push('Headcount (tab 3)'); }
// 		if (!Store.annual.length)         { missing.push('Annual Budget (tab 4)'); }
// 		if (!Store.estimate.length)       { missing.push('Estimate (tab 5)'); }
// 		if (!Store.budgetEstimate.length) { missing.push('Budget & Estimate (tab 6)'); }
// 		if (missing.length) { frappe.msgprint('Please open each tab first.<br><br>Still loading: <b>' + missing.join(', ') + '</b>'); return; }
// 		serverExport(API + '.export_all', { financial_year: fy, ppt_rows: JSON.stringify(Store.ppt.rows), prev_ppt_rows: JSON.stringify(Store.ppt.prevRows), budget_label: Store.ppt.budgetLabel, est_label: Store.ppt.estLabel, prev_budget_label: Store.ppt.prevBudgetLabel, prev_est_label: Store.ppt.prevEstLabel, summary_data: JSON.stringify(Store.summaryInr), headcount_data: JSON.stringify(Store.headcount), annual_data: JSON.stringify(Store.annual), estimate_data: JSON.stringify(Store.estimate), be_data: JSON.stringify(Store.budgetEstimate) }, 'Building full consolidated Excel\u2026');
// 	});

// 	// =============================================================================
// 	// AUTO-LOAD
// 	// =============================================================================

// 	if (fyControl.get_value()) { TabLoader.trigger('ppt'); }

// };



























// frappe.pages['consolidated-budget'].on_page_load = function (wrapper) {

// 	// =============================================================================
// 	// PAGE SETUP
// 	// =============================================================================

// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper, title: 'Foundation - Consolidated Budget', single_column: true
// 	});

// 	setTimeout(function () {
// 		$(wrapper).find('#xl-export-all').remove();
// 		var $btn = $(
// 			'<button class="btn btn-default btn-sm" id="xl-export-all" style="display:inline-flex;align-items:center;gap:5px;margin-left:8px;background:#1a1a1a;color:#fff;border-color:#1a1a1a;">' +
// 			svgIcon() + 'Export All</button>'
// 		);
// 		var $pa = $(wrapper).find('.page-actions');
// 		if ($pa.length) { $pa.prepend($btn); }
// 	}, 300);

// 	function updatePageTitle(fy) {
// 		page.set_title('Foundation - Consolidated Budget - ' + fy);
// 		setTimeout(function () {
// 			$(wrapper).find('.page-head h3').hide();
// 			$(wrapper).find('.page-head .title-text').css({ 'font-size': '20px', 'font-weight': '700', 'color': '#1a1a1a' });
// 		}, 100);
// 	}

// 	// =============================================================================
// 	// FY HELPERS
// 	// =============================================================================

// 	function getFYLabels(fy) {
// 		var p = (fy || '2025-26').split('-');
// 		var sYY = p[0] ? p[0].slice(-2) : '25';
// 		var eYY = p[1] ? p[1].slice(-2) : '26';
// 		var ps = String(parseInt(sYY, 10) - 1).padStart(2, '0');
// 		var pe = String(parseInt(eYY, 10) - 1).padStart(2, '0');
// 		return { plan: 'FY' + sYY + '-' + eYY + ' Plan', est: 'FY' + ps + '-' + pe + ' Estimate' };
// 	}

// 	function getPrevFY(fy) {
// 		var p = (fy || '2025-26').split('-');
// 		return (parseInt(p[0] || '2025', 10) - 1) + '-' + String(parseInt(p[1] || '26', 10) - 1).padStart(2, '0');
// 	}

// 	// =============================================================================
// 	// LOADER
// 	// =============================================================================

// 	if (!$('#global-loader').length) {
// 		$('body').append(
// 			'<div id="global-loader" class="loader-overlay">' +
// 			'<div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt="">' +
// 			'<div class="loader-text">Loading, please wait</div></div></div>'
// 		);
// 	}
// 	$('#global-loader').hide();

// 	var Loader = {
// 		show: function (msg) {
// 			var $l = $('#global-loader');
// 			$l.find('.loader-text').text(msg || 'Loading, please wait');
// 			$l.css('display', 'flex').hide().fadeIn(200);
// 		},
// 		hide: function () { $('#global-loader').fadeOut(200); }
// 	};

// 	// =============================================================================
// 	// STORE  (for Excel export)
// 	// =============================================================================

// 	var Store = {
// 		ppt: { rows: [], prevRows: [], budgetLabel: '', estLabel: '', prevBudgetLabel: '', prevEstLabel: '' },
// 		summaryInr: [], headcount: [], annual: [], estimate: [], budgetEstimate: []
// 	};

// 	// =============================================================================
// 	// DATA CACHE  — centralised API layer
// 	// Each key maps to { data, promise, fy }
// 	// Consumers call DataCache.get(key, fy, fetcher) → Promise<data>
// 	// If fy changes all cache is cleared via DataCache.reset()
// 	// =============================================================================

// 	var DataCache = (function () {
// 		// _store : key -> data    (set on first success / timeout / error)
// 		// _has   : key -> true    (sentinel: empty-array / 0 / false are valid hits)
// 		// _queue : key -> [resolve-fns]  (concurrent callers waiting on same request)
// 		var _store = {}, _has = {}, _queue = {};

// 		function _settle(k, data) {
// 			_store[k] = data;
// 			_has[k]   = true;
// 			var waiters = _queue[k] || [];
// 			delete _queue[k];
// 			waiters.forEach(function (w) { w(data); });
// 		}

// 		return {
// 			/**
// 			 * DataCache.get(name, paramKey, fetcher [, fallback])
// 			 *   name     - logical cache name (e.g. 'headcount')
// 			 *   paramKey - unique params string (e.g. '2025-26')
// 			 *   fetcher  - function(resolve, reject) that fires one frappe.call
// 			 *   fallback - returned on timeout/error (default [])
// 			 * Guarantees:
// 			 *  - Only ONE live network call per (name+paramKey); concurrent callers queue.
// 			 *  - Empty arrays / null / 0 are valid cached values (never re-fetched).
// 			 *  - 60-second timeout resolves with fallback so Promise.all never hangs.
// 			 *  - Errors resolve (not reject) with fallback so Promise.all never throws.
// 			 *  - DataCache.reset() wipes everything (called on FY change).
// 			 */
// 			get: function (name, paramKey, fetcher, fallback) {
// 				if (fallback === undefined) { fallback = []; }
// 				var k = name + '::' + paramKey;

// 				// Cache hit (including empty-array results)
// 				if (_has[k]) { return Promise.resolve(_store[k]); }

// 				// In-flight - join the queue
// 				if (_queue[k]) {
// 					return new Promise(function (res) { _queue[k].push(res); });
// 				}

// 				// First caller - fire the request
// 				_queue[k] = [];

// 				return new Promise(function (resolve) {
// 					var done = false;

// 					// 60-second safety net - page never hangs
// 					var timer = setTimeout(function () {
// 						if (done) { return; }
// 						done = true;
// 						console.warn('[DataCache] timeout, resolving with fallback:', k);
// 						_settle(k, fallback);
// 						resolve(fallback);
// 					}, 60000);

// 					fetcher(
// 						function onSuccess(data) {
// 							if (done) { return; }
// 							done = true;
// 							clearTimeout(timer);
// 							_settle(k, data);
// 							resolve(data);
// 						},
// 						function onError(err) {
// 							if (done) { return; }
// 							done = true;
// 							clearTimeout(timer);
// 							console.error('[DataCache] error, resolving with fallback:', k, err);
// 							_settle(k, fallback);
// 							resolve(fallback);  // never reject -> Promise.all never short-circuits
// 						}
// 					);
// 				});
// 			},

// 			reset: function () { _store = {}; _has = {}; _queue = {}; }
// 		};
// 	})();

// 	// =============================================================================
// 	// FETCHERS  — one per API endpoint
// 	// =============================================================================

// 	var Fetchers = {

// 		// get_foundation_overall  (PPT tab — current FY)
// 		foundationOverall: function (fy, resolve, reject) {
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_foundation_overall',
// 				args: { financial_year: fy, month: 'March', table_name_filter: 'Foundation Overall' },
// 				callback: function (r) {
// 					var d = Array.isArray(r.message) ? r.message
// 						: ((r.message && Array.isArray(r.message.message)) ? r.message.message : []);
// 					resolve(d);
// 				},
// 				error: function () { resolve([]); }
// 			});
// 		},

// 		// get_unit_wise_plan  filter='Opex Capex'  (PPT tab sub-tables)
// 		unitWisePlanOpexCapex: function (fy, resolve, reject) {
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan',
// 				args: { financial_year: fy, month: 'March', table_name_filter: 'Opex Capex' },
// 				callback: function (r) {
// 					var d = Array.isArray(r.message) ? r.message
// 						: ((r.message && Array.isArray(r.message.message)) ? r.message.message : []);
// 					resolve(d);
// 				},
// 				error: function () { resolve([]); }
// 			});
// 		},

// 		// get_unit_wise_plan  filter='Unit Wise Plan'  (SummaryINR)
// 		unitWisePlanSummary: function (fy, resolve, reject) {
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan',
// 				args: { financial_year: fy, month: 'March', table_name_filter: 'Unit Wise Plan' },
// 				callback: function (r) {
// 					var d = Array.isArray(r.message) ? r.message
// 						: ((r.message && Array.isArray(r.message.message)) ? r.message.message : null);
// 					resolve(d || []);
// 				},
// 				error: function () { resolve([]); }
// 			});
// 		},

// 		// get_unit_wise_plan  filter='Budget & Estimate'  (BudgetEstimate)
// 		unitWisePlanBE: function (fy, resolve, reject) {
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan',
// 				args: { financial_year: fy, month: 'March', table_name_filter: 'Budget & Estimate' },
// 				callback: function (r) {
// 					var d = Array.isArray(r.message) ? r.message
// 						: ((r.message && Array.isArray(r.message.message)) ? r.message.message : []);
// 					resolve(d);
// 				},
// 				error: function () { resolve([]); }
// 			});
// 		},

// 		// get_headcount  (SummaryINR + Headcount tab)
// 		headcount: function (fy, resolve, reject) {
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_headcount',
// 				args: { financial_year: fy, month: 'March', table_name_filter: 'Unit Wise Plan' },
// 				callback: function (r) {
// 					var msg = r.message || {};
// 					resolve({ headcount_data: msg.headcount_data || [], plan_data: msg.plan_data || [] });
// 				},
// 				error: function () { resolve({ headcount_data: [], plan_data: [] }); }
// 			});
// 		},

// 		// get_consolidated_report  (Annual Budget tab + SummaryINR Quarter Phasing current FY)
// 		consolidatedReport: function (fy, resolve, reject) {
// 			frappe.call({
// 				method: 'annual_budget.api.phase_sheet.get_consolidated_report',
// 				args: { financial_year: fy },
// 				callback: function (r) {
// 					resolve(r.message || []);
// 				},
// 				error: function () { resolve([]); }
// 			});
// 		},

// 		// get_grouped_actuals  (Estimate tab + SummaryINR Quarter Phasing previous FY)
// 		// NOTE: this fetcher receives the YEAR string (e.g. "2025"), not the FY string
// 		groupedActuals: function (yearStr, resolve, reject) {
// 			frappe.call({
// 				method: 'annual_budget.api.foundation_consolidated_report.get_grouped_actuals_quarter_and_month_wise_total',
// 				args: { fiscal_year: yearStr, accounting_period: '12' },
// 				callback: function (r) {
// 					var msg = r.message || {};
// 					var data;
// 					if (msg.status === 'success') { data = msg.data || []; }
// 					else if (Array.isArray(msg)) { data = msg; }
// 					else if (msg.data && Array.isArray(msg.data)) { data = msg.data; }
// 					else { data = []; }
// 					resolve(data);
// 				},
// 				error: function () { resolve([]); }
// 			});
// 		}
// 	};

// 	// =============================================================================
// 	// STYLES
// 	// =============================================================================

// 	$(page.body).append(
// 		'<style>' +
// 		':root{' +
// 		'--font:"Inter","Segoe UI","Helvetica Neue",Arial,sans-serif;' +
// 		'--fs-xs:13px;--fs-sm:14px;--fs-base:15px;--fs-md:16px;--fs-lg:17px;--fs-xl:18px;' +
// 		'--fw-n:400;--fw-m:500;--fw-sb:600;--fw-b:700;' +
// 		'--blue-dark:#003B63;--blue-mid:#0076B6;--blue-light:#E9F4FB;' +
// 		'--orange:#F26B21;--orange-light:#FFF3E6;' +
// 		'--bdl:#9baab5;--bdh:#004a75;--bdo:#a84808;' +
// 		'--txt:#1a1a1a;--txt2:#36414c;--muted:#555;' +
// 		'}' +
// 		'.cb-wrapper{padding:15px;background:#fff;font-family:var(--font);font-size:var(--fs-base);color:var(--txt);line-height:1.5;}' +
// 		'.cb-wrapper *{box-sizing:border-box;}' +
// 		'#cb-tab-nav{border-bottom:2px solid #ddd;list-style:none;padding:0;margin:0 0 16px;display:flex;align-items:flex-end;flex-wrap:wrap;}' +
// 		'#cb-tab-nav li{display:inline-block;}' +
// 		'#cb-tab-nav .cb-tab-link{cursor:pointer;display:inline-block;padding:9px 18px;color:var(--muted);font-size:var(--fs-md);font-weight:var(--fw-m);background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;text-decoration:none;transition:color .15s,border-color .15s;}' +
// 		'#cb-tab-nav .cb-tab-link.active{color:var(--blue-dark);font-weight:var(--fw-b);border-bottom:3px solid var(--blue-dark);}' +
// 		'#cb-tab-nav .cb-tab-link:hover{color:var(--blue-dark);}' +
// 		'.cb-tab-pane{display:none;}.cb-tab-pane.active{display:block;}' +
// 		'.cb-filter-row{padding:8px 0;margin-bottom:10px;}' +
// 		'.cb-filter-row .col-md-3,.cb-filter-row .col-sm-12{padding-left:8px;padding-right:8px;}' +
// 		'@media(max-width:768px){.cb-filter-row .col-md-3{width:100%;margin-bottom:8px;}}' +
// 		'.cb-controls{display:flex;align-items:center;padding:7px 12px;margin-bottom:12px;background:#f7f9fb;border:1px solid #e2e6ea;border-radius:6px;flex-wrap:wrap;gap:8px;}' +
// 		'.cb-controls-left{display:flex;align-items:center;gap:8px;flex:1;flex-wrap:wrap;}' +
// 		'.cb-controls-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}' +
// 		'.cb-search-wrap{position:relative;display:flex;align-items:center;}' +
// 		'.cb-search-wrap .search-icon{position:absolute;left:8px;color:#8d99a6;pointer-events:none;}' +
// 		'.cb-search-input{padding:5px 8px 5px 28px;border:1.5px solid var(--bdl);border-radius:4px;font-family:var(--font);font-size:var(--fs-sm);color:var(--txt2);background:#fff;width:220px;height:32px;transition:border-color .15s,box-shadow .15s;}' +
// 		'.cb-search-input:focus{outline:none;border-color:#5e64ff;box-shadow:0 0 0 2px rgba(94,100,255,.15);}' +
// 		'.cb-checkbox-area{display:flex;gap:12px;align-items:center;}' +
// 		'.cb-check-label{display:flex;align-items:center;gap:5px;font-family:var(--font);font-size:var(--fs-sm);font-weight:var(--fw-m);color:var(--txt2);cursor:pointer;user-select:none;white-space:nowrap;}' +
// 		'.cb-check-label input[type=checkbox]{width:14px;height:14px;cursor:pointer;accent-color:#5e64ff;}' +
// 		'.cb-xl-btn{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;height:32px;font-family:var(--font);font-size:var(--fs-sm);font-weight:var(--fw-sb);cursor:pointer;white-space:nowrap;border:1px solid #1a1a1a;border-radius:4px;background:#1a1a1a;color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.15);transition:background .15s;}' +
// 		'.cb-xl-btn:hover{background:#333;}.cb-xl-btn svg{flex-shrink:0;color:#fff;}' +
// 		'#xl-export-all svg{vertical-align:middle;margin-right:3px;}' +
// 		'.cb-scroll-wrapper{border:1.5px solid var(--bdl);border-radius:6px;overflow:auto;max-height:72vh;background:#fff;position:relative;isolation:isolate;}' +
// 		/* NUCLEAR BORDER FIX */
// 		'.cb-wrapper table{border-collapse:collapse !important;border-spacing:0 !important;}' +
// 		'.cb-wrapper table th,.cb-wrapper table td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;text-align:right;font-family:var(--font);font-size:var(--fs-base);}' +
// 		'.cb-wrapper table th:first-child,.cb-wrapper table td:first-child{text-align:left !important;}' +
// 		'.cb-wrapper table thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);text-align:center !important;position:sticky;top:0;z-index:25;border:1.5px solid var(--bdh) !important;padding:10px 12px;letter-spacing:.1px;}' +
// 		'.cb-wrapper table thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);text-align:center !important;position:sticky;top:0;z-index:24;border:1.5px solid var(--bdo) !important;min-width:110px;padding:8px 12px;}' +
// 		'.cb-wrapper table tr.cb-row-head td{background:var(--blue-light) !important;color:var(--blue-dark);font-weight:var(--fw-b);border:1.5px solid var(--bdl) !important;cursor:pointer;}' +
// 		'.cb-wrapper table tr.cb-row-head:hover td{background:#d0e8f5 !important;}' +
// 		'.cb-wrapper table tr.cb-row-sub td{background:var(--orange-light) !important;font-weight:var(--fw-sb);border:1.5px solid var(--bdl) !important;cursor:pointer;}' +
// 		'.cb-wrapper table tr.cb-row-sub:hover td{background:#ffe0c2 !important;}' +
// 		'.cb-wrapper table tr.cb-row-grand td{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);border:1.5px solid var(--bdh) !important;}' +
// 		'.cb-wrapper table tr.ppt-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b);border:1.5px solid #9baab5 !important;}' +
// 		'.cb-wrapper table tr.sinr-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b) !important;border:1.5px solid #9baab5 !important;}' +
// 		'.cb-wrapper .ppt-table-wrap tbody tr td{background:#fff;color:var(--txt);font-weight:var(--fw-n);}' +
// 		/* Non-border cosmetic */
// 		'.cb-table,.ppt-table-wrap{width:100%;table-layout:auto;font-family:var(--font);font-size:var(--fs-base);color:var(--txt);line-height:1.45;}' +
// 		'.cb-text-accent{color:var(--blue-mid);font-weight:var(--fw-sb);}' +
// 		'.ppt-title-bar{margin:14px 0 4px;}' +
// 		'.ppt-main-title{font-family:var(--font);font-size:var(--fs-md);font-weight:var(--fw-b);text-transform:uppercase;text-decoration:underline;letter-spacing:.4px;color:var(--txt);}' +
// 		'.ppt-currency-label{font-family:var(--font);font-size:var(--fs-sm);font-style:italic;color:var(--muted);text-align:right;margin-bottom:6px;}' +
// 		'.ppt-currency-label strong{font-weight:var(--fw-b);font-size:var(--fs-sm);font-style:normal;}' +
// 		'.ppt-dash{color:#bbb;text-align:center;display:block;}' +
// 		'.ppt-sub-item-row td:first-child{padding-left:28px !important;font-style:italic;color:#444;}' +
// 		/* Budget & Estimate sticky col */
// 		'#be-table tbody td:first-child{position:sticky;left:0;z-index:10;text-align:left !important;min-width:280px;max-width:280px;white-space:normal;word-break:break-word;background:#fff;}' +
// 		'#be-table .cb-row-head td:first-child{background:var(--blue-light) !important;}' +
// 		'#be-table .cb-row-sub td:first-child{background:var(--orange-light) !important;}' +
// 		'#be-table .cb-row-grand td:first-child{background:var(--blue-mid) !important;}' +
// 		'#be-table thead tr.cb-thead-main th:first-child{position:sticky;left:0;z-index:50 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:280px;}' +
// 		'#be-table .be-grand-col{background:#ddeaf7 !important;color:var(--blue-dark);border-left:2px solid var(--blue-mid) !important;}' +
// 		'#be-table .cb-row-grand .be-grand-col{background:var(--blue-dark) !important;color:#fff !important;}' +
// 		'#be-table .cb-row-head .be-grand-col{background:var(--blue-dark) !important;color:#fff !important;}' +
// 		'#be-table .cb-row-sub .be-grand-col{background:#f0ddd0 !important;color:#7a3b00 !important;}' +
// 		'#be-table .cb-thead-main th:not(:first-child){min-width:260px;text-align:center !important;}' +
// 		'#be-table .cb-thead-sub th{min-width:130px;text-align:center !important;}' +
// 		'#be-table tbody td:first-child,#be-table thead th:first-child{box-shadow:2px 0 4px -2px rgba(0,0,0,.12);}' +
// 		/* Summary INR labels */
// 		'.sinr-section-label{margin:18px 0 5px;font-family:var(--font);font-size:var(--fs-sm);font-weight:var(--fw-b);color:var(--txt);text-decoration:underline;letter-spacing:.2px;}' +
// 		'.sinr-currency-note{text-align:right;font-family:var(--font);font-size:var(--fs-xs);font-style:italic;color:var(--muted);margin-bottom:4px;}' +
// 		'.sinr-sub-item td:first-child{padding-left:22px !important;color:#444;}.sinr-covid-row td{color:#444;}' +
// 		/* sinr-table-a sticky */
// 		'#sinr-table-a thead tr.cb-thead-main th:first-child{position:sticky;left:0;z-index:50 !important;background:var(--blue-mid) !important;}' +
// 		'#sinr-table-a thead tr.cb-thead-sub th:first-child{position:sticky;left:0;z-index:49 !important;background:var(--orange) !important;}' +
// 		'#sinr-table-a tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);}' +
// 		'#sinr-table-a .sinr-total-row td:first-child{background:#e8f0fa !important;}' +
// 		'#sinr-table-a .sinr-covid-row td:first-child{background:#fff;}' +
// 		/* sinr-table-b sticky */
// 		'#sinr-table-b thead tr:nth-child(1) th{position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}' +
// 		'#sinr-table-b thead tr:nth-child(2) th{position:sticky;z-index:24;text-align:center !important;padding:8px 12px;min-width:110px;}' +
// 		'#sinr-table-b thead tr th:first-child{position:sticky !important;left:0;text-align:left !important;min-width:210px;box-shadow:2px 0 5px -2px rgba(0,0,0,.18);}' +
// 		'#sinr-table-b thead tr:nth-child(1) th:first-child{z-index:55 !important;}' +
// 		'#sinr-table-b thead tr:nth-child(2) th:first-child{z-index:54 !important;}' +
// 		'#sinr-table-b tbody td:first-child{position:sticky;left:0;z-index:10;text-align:left !important;min-width:210px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);}' +
// 		'#sinr-table-b tbody tr.sinr-unit-hdr td{background:var(--blue-light) !important;color:var(--blue-dark);font-weight:var(--fw-b);}' +
// 		'#sinr-table-b tbody tr.sinr-brkdwn-plan td{background:#fff !important;}' +
// 		'#sinr-table-b tbody tr.sinr-brkdwn-act td{background:#fafafa !important;}' +
// 		'#sinr-table-b tbody tr.sinr-spacer td{background:#f4f6f8 !important;padding:2px 0;}' +
// 		'#sinr-table-b tbody tr.sinr-gt-plan td,#sinr-table-b tbody tr.sinr-gt-act td{background:#ddeaf7 !important;color:var(--blue-dark);font-weight:var(--fw-sb);}' +
// 		'#sinr-table-b tbody td{text-align:right;padding:8px 12px;white-space:nowrap;}' +
// 		/* CPE */
// 		'#sinr-cpe-wrap{margin-top:28px;}' +
// 		'#sinr-cpe-hc-table{border-collapse:collapse !important;width:100%;}' +
// 		'#sinr-cpe-hc-table th,#sinr-cpe-hc-table td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;font-family:var(--font);font-size:var(--fs-base);}' +
// 		'#sinr-cpe-hc-table thead tr:first-child th{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-xl);text-align:center !important;position:sticky;top:0;z-index:25;border:1.5px solid var(--bdh) !important;padding:10px 12px;}' +
// 		'#sinr-cpe-hc-table thead tr:first-child th:first-child{text-align:left !important;position:sticky;left:0;z-index:50 !important;}' +
// 		'#sinr-cpe-hc-table thead tr:last-child th{background:var(--orange) !important;color:#fff !important;font-weight:var(--fw-sb);font-size:var(--fs-lg);text-align:center !important;position:sticky;z-index:24;border:1.5px solid var(--bdo) !important;padding:8px 12px;}' +
// 		'#sinr-cpe-hc-table thead tr:last-child th:first-child{position:sticky;left:0;z-index:49 !important;background:var(--orange) !important;text-align:left !important;}' +
// 		'#sinr-cpe-hc-table tbody td{text-align:right;}' +
// 		'#sinr-cpe-hc-table tbody td:first-child{text-align:left !important;position:sticky;left:0;z-index:10;background:#fff;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);font-weight:var(--fw-n);}' +
// 		'#sinr-cpe-hc-table tbody tr.cpe-hc-dash-row td{color:#888;font-style:italic;}' +
// 		'#sinr-cpe-hc-table tbody tr.cpe-hc-dash-row td:first-child{background:#fff;}' +
// 		'#sinr-cpe-table{border-collapse:collapse !important;width:100%;}' +
// 		'#sinr-cpe-table th,#sinr-cpe-table td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;font-family:var(--font);font-size:var(--fs-base);}' +
// 		'#sinr-cpe-table thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-xl);text-align:center !important;position:sticky;top:0;z-index:25;border:1.5px solid var(--bdh) !important;padding:10px 12px;}' +
// 		'#sinr-cpe-table thead tr.cb-thead-main th:first-child{position:sticky;left:0;z-index:50 !important;text-align:left !important;min-width:220px;}' +
// 		'#sinr-cpe-table thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-weight:var(--fw-sb);font-size:var(--fs-lg);text-align:center !important;position:sticky;z-index:24;border:1.5px solid var(--bdo) !important;min-width:100px;padding:8px 12px;}' +
// 		'#sinr-cpe-table thead tr.cb-thead-sub th:first-child{position:sticky;left:0;z-index:49 !important;background:var(--orange) !important;text-align:left !important;}' +
// 		'#sinr-cpe-table thead tr.cb-thead-sub2 th{background:#1a4a6e !important;color:#fff !important;font-weight:var(--fw-m);font-size:var(--fs-sm);text-align:center !important;position:sticky;z-index:23;border:1.5px solid #0d2f47 !important;min-width:90px;padding:7px 10px;}' +
// 		'#sinr-cpe-table thead tr.cb-thead-sub2 th:first-child{position:sticky;left:0;z-index:48 !important;background:#1a4a6e !important;text-align:left !important;}' +
// 		'#sinr-cpe-table tbody td{text-align:right;}' +
// 		'#sinr-cpe-table tbody td:first-child{text-align:left !important;position:sticky;left:0;z-index:10;background:#fff;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);min-width:220px;}' +
// 		'#sinr-cpe-table tbody tr.cpe-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b) !important;border:1.5px solid #9baab5 !important;}' +
// 		'#sinr-cpe-table tbody tr.cpe-total-row td:first-child{background:#e8f0fa !important;}' +
// 		'#sinr-cpe-table tbody tr.cpe-increase-neg{color:#c0392b;}' +
// 		'#sinr-cpe-table tbody tr.cpe-increase-pos{color:#1a7a3a;}' +
// 		/* Quarter Phasing table */
// 		'#qp-table{border-collapse:collapse !important;width:auto;min-width:680px;}' +
// 		'#qp-table th,#qp-table td{border:1.5px solid var(--bdl) !important;padding:7px 14px;white-space:nowrap;text-align:right;font-family:var(--font);font-size:var(--fs-sm);}' +
// 		'#qp-table td:first-child{text-align:left !important;min-width:140px;font-weight:var(--fw-m);}' +
// 		'#qp-table tr.qp-fy-hdr td{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-base);border:1.5px solid var(--bdh) !important;}' +
// 		'#qp-table tr.qp-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b);border:1.5px solid #9baab5 !important;}' +
// 		'#qp-table tr.qp-pct-row td{background:#fafafa;color:#666;font-style:italic;font-size:var(--fs-xs);}' +
// 		'#qp-table tr.qp-spacer td{padding:0;height:5px;background:#eef2f7;border-left:none !important;border-right:none !important;}' +
// 		'#qp-table tr.qp-fy-spacer td{padding:0;height:8px;background:#f0f4f8;border:none !important;}' +
// 		/* Headcount */
// 		'.hc-section-title{margin:20px 0 6px;font-family:var(--font);font-size:var(--fs-md);font-weight:var(--fw-b);color:var(--blue-dark);text-transform:uppercase;letter-spacing:.4px;border-left:4px solid var(--blue-mid);padding-left:10px;}' +
// 		'#global-loader.loader-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(18,18,18,.92);backdrop-filter:blur(6px);display:none;z-index:999999;align-items:center;justify-content:center;}' +
// 		'.loader-box{display:flex;flex-direction:column;align-items:center;gap:14px;}' +
// 		'.loader-logo{width:90px;height:90px;border-radius:50%;background:linear-gradient(145deg,#fff,#eaeaea);padding:14px;object-fit:contain;box-shadow:0 10px 30px rgba(0,0,0,.35);animation:lp 1.6s infinite ease-in-out;}' +
// 		'.loader-text{font-family:var(--font);font-size:var(--fs-sm);color:#fff;font-weight:var(--fw-sb);letter-spacing:.5px;opacity:.85;}' +
// 		'.loader-text::after{content:"";display:inline-block;width:1em;animation:ld 1.5s infinite;}' +
// 		'@keyframes lp{0%,100%{transform:scale(1);opacity:.8;}50%{transform:scale(1.08);opacity:1;}}' +
// 		'@keyframes ld{0%{content:"";}33%{content:".";}66%{content:"..";}100%{content:"...";}}' +
// 		'.cb-wrapper{isolation:isolate;}' +
// 		'.page-head,.navbar,.navbar-fixed-top,.page-container .page-head{z-index:1000 !important;}' +
// 		'</style>'
// 	);

// 	// =============================================================================
// 	// SHARED HELPERS
// 	// =============================================================================

// 	function svgIcon() {
// 		return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
// 			'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
// 			'<polyline points="14 2 14 8 20 8"/>' +
// 			'<line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>' +
// 			'</svg>';
// 	}

// 	function fmtCr(v) {
// 		var n = parseFloat(v) || 0;
// 		if (!isFinite(n) || n === 0) { return '-'; }
// 		var res = n / 10000000;
// 		var neg = res < 0;
// 		var s   = Math.abs(res).toFixed(2).split('.');
// 		var ip  = s[0], dp = s[1];
// 		if (ip.length > 3) {
// 			ip = ip.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + ip.slice(-3);
// 		}
// 		return (neg ? '-' : '') + ip + '.' + dp;
// 	}

// 	function fmtCrDash(v) {
// 		var n = parseFloat(v) || 0;
// 		return (!isFinite(n) || n === 0) ? '<span class="ppt-dash">-</span>' : fmtCr(n);
// 	}

// 	function formatINR(v) {
// 		var n = Math.round(parseFloat(v) || 0);
// 		var neg = n < 0, s = String(Math.abs(n));
// 		if (s.length > 3) { s = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3); }
// 		return (neg ? '-' : '') + s;
// 	}

// 	function fmtPct(a, b) {
// 		a = parseFloat(a); b = parseFloat(b);
// 		if (!a || isNaN(a) || isNaN(b)) { return '-'; }
// 		return Math.round(((b / a) - 1) * 100) + '%';
// 	}

// 	function xlBtn(id, label) { return '<button class="cb-xl-btn" id="' + id + '">' + svgIcon() + label + '</button>'; }

// 	function controlsBar(searchId, placeholder, checks, exportId) {
// 		var chk = checks.map(function (c) { return '<label class="cb-check-label"><input type="checkbox" id="' + c.id + '"> ' + c.label + '</label>'; }).join('');
// 		return '<div class="cb-controls"><div class="cb-controls-left">' +
// 			'<div class="cb-search-wrap"><svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
// 			'<input type="text" id="' + searchId + '" class="cb-search-input" placeholder="' + placeholder + '"></div>' +
// 			'<div class="cb-checkbox-area">' + chk + '</div></div>' +
// 			'<div class="cb-controls-right">' + xlBtn(exportId, 'Export to Excel') + '</div></div>';
// 	}

// 	function fixStickySubHeader(sel) {
// 		var attempts = 0;
// 		function attempt() {
// 			var $t = $(sel);
// 			var $m = $t.find('thead tr.cb-thead-main');
// 			var $s = $t.find('thead tr.cb-thead-sub');
// 			if (!$m.length || !$s.length) { return; }
// 			var h = $m[0].getBoundingClientRect().height;
// 			if (!h) { h = $m.outerHeight(true) || 0; }
// 			if (h > 0) {
// 				$s.find('th').css('top', h + 'px');
// 			} else if (attempts++ < 10) {
// 				setTimeout(attempt, 50);
// 			}
// 		}
// 		setTimeout(attempt, 0);
// 	}

// 	// =============================================================================
// 	// SHARED HEADCOUNT HELPERS
// 	// =============================================================================

// 	function swrapShared(inner) { return '<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' + inner + '</div>'; }

// 	function fyToMarchLabel(fy) {
// 		var p = (fy || '').split('-');
// 		if (p.length < 2) { return fy; }
// 		var startY = parseInt(p[0], 10) || 2000;
// 		var endY2  = parseInt(p[1], 10) || 0;
// 		var endFull = (endY2 > (startY % 100)) ? (Math.floor(startY / 100) * 100 + endY2) : (Math.floor(startY / 100) * 100 + 100 + endY2);
// 		return '31st March-' + endFull;
// 	}

// 	function buildClosingAvgTable(yrs, totals) {
// 		function avg(i) {
// 			if (i === 0) { var c0 = totals[yrs[0]]; return (c0 !== undefined && c0 !== null) ? c0 / 2 : null; }
// 			var p = totals[yrs[i - 1]], c = totals[yrs[i]];
// 			return (p !== undefined && c !== undefined) ? (p + c) / 2 : null;
// 		}
// 		function fmtNum(v) { if (v === null || v === undefined || isNaN(v)) { return '-'; } return Math.round(parseFloat(v)).toLocaleString('en-IN'); }
// 		function fmtPctCA(a, b) { if (!a || isNaN(a) || isNaN(b) || !isFinite(b / a)) { return '-'; } return (((b / a) - 1) * 100).toFixed(1) + '%'; }
// 		function fmtInc(v) { if (v === null || v === undefined || isNaN(v)) { return '-'; } return Math.round(parseFloat(v)).toLocaleString('en-IN'); }
// 		var bodyRows = '';
// 		yrs.forEach(function (fy, i) {
// 			var closing = totals[fy] !== undefined ? totals[fy] : null;
// 			var avgVal  = avg(i);
// 			var prevClosing = (i > 0 && totals[yrs[i-1]] !== undefined) ? totals[yrs[i-1]] : null;
// 			var prevAvg     = (i > 0) ? avg(i - 1) : null;
// 			var incClosing = (prevClosing !== null && closing !== null) ? (closing - prevClosing) : null;
// 			var incAvg     = (prevAvg !== null && avgVal !== null) ? (avgVal - prevAvg) : null;
// 			var pctClosing = (prevClosing !== null && prevClosing !== 0 && closing !== null) ? fmtPctCA(prevClosing, closing) : '-';
// 			var pctAvg     = (prevAvg !== null && prevAvg !== 0 && avgVal !== null) ? fmtPctCA(prevAvg, avgVal) : '-';
// 			bodyRows +=
// 				'<tr>' +
// 				'<td style="text-align:left;">' + fyToMarchLabel(fy) + '</td>' +
// 				'<td>' + fmtNum(closing) + '</td>' +
// 				'<td>' + fmtNum(avgVal) + '</td>' +
// 				'<td>' + (incClosing !== null ? fmtInc(incClosing) : '-') + '</td>' +
// 				'<td>' + (incAvg !== null ? fmtInc(incAvg) : '-') + '</td>' +
// 				'<td>' + pctClosing + '</td>' +
// 				'<td>' + pctAvg + '</td>' +
// 				'</tr>';
// 		});
// 		var thead =
// 			'<thead>' +
// 			'<tr class="cb-thead-main">' +
// 			'<th rowspan="2" style="text-align:left !important;min-width:180px;vertical-align:middle;"></th>' +
// 			'<th rowspan="2" style="text-align:center !important;min-width:110px;vertical-align:middle;">Closing<br>H/C</th>' +
// 			'<th rowspan="2" style="text-align:center !important;min-width:110px;vertical-align:middle;">Average<br>H/C</th>' +
// 			'<th colspan="2" style="text-align:center !important;min-width:200px;">Increase</th>' +
// 			'<th colspan="2" style="text-align:center !important;min-width:200px;">% Increase</th>' +
// 			'</tr>' +
// 			'<tr class="cb-thead-sub">' +
// 			'<th style="min-width:100px;">Closing</th>' +
// 			'<th style="min-width:100px;">Average</th>' +
// 			'<th style="min-width:100px;">Closing</th>' +
// 			'<th style="min-width:100px;">Average</th>' +
// 			'</tr>' +
// 			'</thead>';
// 		return swrapShared(
// 			'<table class="cb-table" style="width:100%;">' +
// 			thead +
// 			'<tbody>' + bodyRows + '</tbody>' +
// 			'</table>'
// 		);
// 	}

// 	// =============================================================================
// 	// HTML SKELETON
// 	// =============================================================================

// 	$(page.body).append(
// 		'<div class="cb-wrapper">' +
// 		'<div class="frappe-control-group row cb-filter-row" id="cb-filter-row"></div>' +
// 		'<ul id="cb-tab-nav">' +
// 		'<li><a class="cb-tab-link active" data-tab="ppt">Foundation level/Overall metrics</a></li>' +
// 		'<li><a class="cb-tab-link" data-tab="summary_inr">Summary in INR</a></li>' +
// 		'<li><a class="cb-tab-link" data-tab="headcount">Headcount</a></li>' +
// 		'<li><a class="cb-tab-link" data-tab="annual_budget">Annual Budget Consolidated</a></li>' +
// 		'<li><a class="cb-tab-link" data-tab="estimate">Estimate Consolidated</a></li>' +
// 		'<li><a class="cb-tab-link" data-tab="budget_estimate">Budget &amp; Estimate</a></li>' +
// 		'</ul><div id="cb-tab-content">' +

// 		'<div class="cb-tab-pane active" id="tab-ppt">' +
// 		'<div style="display:flex;justify-content:flex-end;margin-bottom:8px;">' + xlBtn('xl-ppt', 'Export to Excel') + '</div>' +
// 		'<div class="ppt-title-bar"><div class="ppt-main-title" id="ppt-main-title">Overall Foundation - Budget vs. Actual</div></div>' +
// 		'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
// 		'<div class="cb-scroll-wrapper" style="margin-bottom:20px;"><table id="ppt-table" class="ppt-table-wrap"><thead>' +
// 		'<tr class="cb-thead-main"><th rowspan="2" style="min-width:180px;">Unit</th><th colspan="3" id="ppt-budget-hdr">Budget</th><th colspan="3" id="ppt-est-hdr">Estimate</th></tr>' +
// 		'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Total</th><th>Opex</th><th>Capex</th><th>Total</th></tr>' +
// 		'</thead><tbody id="ppt-tbody"></tbody></table></div>' +
// 		'<div class="ppt-title-bar"><div class="ppt-main-title" id="ppt-prev-title">Overall Foundation - Previous Year Budget vs. Actual</div></div>' +
// 		'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
// 		'<div class="cb-scroll-wrapper" style="margin-bottom:20px;"><table id="ppt-prev-table" class="ppt-table-wrap"><thead>' +
// 		'<tr class="cb-thead-main"><th rowspan="2" style="min-width:180px;">Unit</th><th colspan="3" id="ppt-prev-budget-hdr">Budget</th><th colspan="3" id="ppt-prev-est-hdr">Estimate</th></tr>' +
// 		'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Total</th><th>Opex</th><th>Capex</th><th>Total</th></tr>' +
// 		'</thead><tbody id="ppt-prev-tbody"></tbody></table></div>' +
// 		'<div id="ppt-sub-tables"></div>' +
// 		'</div>' +

// 		'<div class="cb-tab-pane" id="tab-summary_inr"></div>' +
// 		'<div class="cb-tab-pane" id="tab-headcount"></div>' +

// 		'<div class="cb-tab-pane" id="tab-annual_budget">' +
// 		controlsBar('annual-search', 'Search expense / item\u2026', [{ id: 'annual-expand-quarters', label: 'Expand Quarters' }, { id: 'annual-expand-items', label: 'Expand Line Items' }], 'xl-annual') +
// 		'<div class="cb-scroll-wrapper"><table class="cb-table" id="annual-table"><thead></thead><tbody></tbody></table></div></div>' +

// 		'<div class="cb-tab-pane" id="tab-estimate">' +
// 		controlsBar('estimate-search', 'Search expense / item\u2026', [{ id: 'estimate-expand-quarters', label: 'Expand Quarters' }, { id: 'estimate-expand-items', label: 'Expand Line Items' }], 'xl-estimate') +
// 		'<div class="cb-scroll-wrapper"><table class="cb-table" id="estimate-table"><thead></thead><tbody id="estimate-tbody"></tbody></table></div></div>' +

// 		'<div class="cb-tab-pane" id="tab-budget_estimate">' +
// 		controlsBar('be-search', 'Search expense / item\u2026', [{ id: 'be-expand-items', label: 'Expand Line Items' }], 'xl-be') +
// 		'<div class="cb-scroll-wrapper"><table class="cb-table" id="be-table"><thead></thead><tbody id="be-tbody"></tbody></table></div></div>' +

// 		'</div></div>'
// 	);

// 	// =============================================================================
// 	// FINANCIAL YEAR FILTER
// 	// =============================================================================

// 	var fyControl = frappe.ui.form.make_control({
// 		parent: $('<div class="col-md-3 col-sm-12"></div>').appendTo('#cb-filter-row'),
// 		df: {
// 			label: 'Financial Year', fieldtype: 'Select', fieldname: 'financial_year', reqd: 1,
// 			change: function () {
// 				var y = this.get_value(); if (!y) { return; }
// 				updatePageTitle(y);
// 				DataCache.reset();
// 				TabLoader.resetAll();
// 				TabLoader.trigger($('#cb-tab-nav .cb-tab-link.active').data('tab'));
// 			}
// 		},
// 		render_input: true
// 	});
// 	fyControl.refresh();

// 	frappe.call({
// 		method: 'annual_budget.api.filter_options.get_financial_year_list',
// 		callback: function (r) {
// 			if (!r.message || !r.message.length) { return; }
// 			var years = r.message.map(function (d) { return d.financial_year; });
// 			fyControl.df.options = years.join('\n'); fyControl.refresh();
// 			var today = new Date(), y = today.getFullYear(), m = today.getMonth() + 1;
// 			var cur = (m >= 4 ? y : y - 1) + '-' + String(m >= 4 ? y + 1 : y).slice(-2);
// 			var target = years.indexOf(cur) !== -1 ? cur : years[0];
// 			fyControl.set_value(target); updatePageTitle(target);
// 		}
// 	});

// 	// =============================================================================
// 	// TAB SWITCHING + LOADER
// 	// =============================================================================

// 	$(document).on('click', '#cb-tab-nav .cb-tab-link', function () {
// 		var tab = $(this).data('tab');
// 		$('#cb-tab-nav .cb-tab-link').removeClass('active'); $('.cb-tab-pane').removeClass('active');
// 		$(this).addClass('active'); $('#tab-' + tab).addClass('active');
// 		TabLoader.trigger(tab);
// 	});

// 	var TabLoader = (function () {
// 		var loaded = {};
// 		var map = {
// 			ppt:            function (fy) { PPT.load(fy); },
// 			summary_inr:    function (fy) { SummaryINR.load(fy); },
// 			headcount:      function (fy) { Headcount.load(fy); },
// 			annual_budget:  function (fy) { Annual.load(fy); },
// 			estimate:       function (fy) { Estimate.load(fy); },
// 			budget_estimate:function (fy) { BudgetEstimate.load(fy); }
// 		};
// 		return {
// 			trigger: function (tab) {
// 				if (!map[tab]) { return; }
// 				var fy = fyControl.get_value() || '2025-26';
// 				if (loaded[tab] === fy) { return; }
// 				loaded[tab] = fy; map[tab](fy);
// 			},
// 			resetAll: function () { loaded = {}; }
// 		};
// 	})();

// 	// =============================================================================
// 	// EXCEL EXPORT
// 	// =============================================================================

// 	function serverExport(method, args, msg) {
// 		Loader.show(msg || 'Preparing your Excel file');
// 		frappe.call({
// 			method: method, args: args,
// 			callback: function (r) {
// 				Loader.hide();
// 				if (r.message && r.message.data) {
// 					var bin = atob(r.message.data), bytes = new Uint8Array(bin.length);
// 					for (var i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); }
// 					var url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
// 					var a = document.createElement('a'); a.href = url; a.download = r.message.filename;
// 					document.body.appendChild(a); a.click();
// 					setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
// 				} else { frappe.msgprint('Export failed \u2014 no data returned.'); }
// 			},
// 			error: function () { Loader.hide(); frappe.msgprint('Server error during export.'); }
// 		});
// 	}

// 	// =============================================================================
// 	// PPT MODULE
// 	// =============================================================================

// 	var PPT = (function () {
// 		function normSec(s) { return (s || '').replace(/\s+/g, ' ').trim().toUpperCase(); }

// 		function extractVals(sections, field) {
// 			var opex = 0, capex = 0, hasBreakdown = false;
// 			(sections || []).forEach(function (sec) {
// 				var nm = normSec(sec.name);
// 				if (sec.sequence_id === 9999 || nm === 'GRAND TOTAL') { return; }
// 				if (nm.indexOf('OPERATING') !== -1) { opex  += parseFloat(sec[field] || 0); hasBreakdown = true; }
// 				if (nm.indexOf('CAPITAL')   !== -1) { capex += parseFloat(sec[field] || 0); hasBreakdown = true; }
// 			});
// 			if (!hasBreakdown) {
// 				(sections || []).forEach(function (sec) {
// 					if (sec.sequence_id === 9999 || normSec(sec.name) === 'GRAND TOTAL') {
// 						opex += parseFloat(sec[field] || 0);
// 					}
// 				});
// 				if (!opex) {
// 					(sections || []).forEach(function (sec) {
// 						if (sec.sequence_id !== 9999 && normSec(sec.name) !== 'GRAND TOTAL') {
// 							opex += parseFloat(sec[field] || 0);
// 						}
// 					});
// 				}
// 			}
// 			return { opex: opex, capex: capex };
// 		}

// 		function extractTotal(sections, field) {
// 			var gt = 0;
// 			(sections || []).forEach(function (sec) {
// 				if (sec.sequence_id === 9999 || normSec(sec.name) === 'GRAND TOTAL') {
// 					gt += parseFloat(sec[field] || 0);
// 				}
// 			});
// 			if (!gt) {
// 				(sections || []).forEach(function (sec) { gt += parseFloat(sec[field] || 0); });
// 			}
// 			return gt;
// 		}

// 		function buildRows(data, cfg) {
// 			var rows = (data || []).slice()
// 				.sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); })
// 				.map(function (e) {
// 					var b = extractVals(e[cfg.key] || [], cfg.budgetField);
// 					var v = extractVals(e[cfg.key] || [], cfg.actualField);
// 					var bTot = extractTotal(e[cfg.key] || [], cfg.budgetField);
// 					var eTot = extractTotal(e[cfg.key] || [], cfg.actualField);
// 					return { label: e.label || '', bOpex: b.opex, bCapex: b.capex, bTotal: bTot, eOpex: v.opex, eCapex: v.capex, eTotal: eTot };
// 				});
// 			var tot = { bOpex: 0, bCapex: 0, bTotal: 0, eOpex: 0, eCapex: 0, eTotal: 0 };
// 			rows.forEach(function (r) { tot.bOpex += r.bOpex; tot.bCapex += r.bCapex; tot.bTotal += r.bTotal; tot.eOpex += r.eOpex; tot.eCapex += r.eCapex; tot.eTotal += r.eTotal; });
// 			rows.push({ label: 'Total', isTotal: true, bOpex: tot.bOpex, bCapex: tot.bCapex, bTotal: tot.bTotal, eOpex: tot.eOpex, eCapex: tot.eCapex, eTotal: tot.eTotal });
// 			return rows;
// 		}

// 		function renderTable(rows, tbId, bHdr, eHdr, tblId, bLbl, eLbl) {
// 			$('#' + bHdr).text(bLbl); $('#' + eHdr).text(eLbl);
// 			var $tb = $('#' + tbId).empty();
// 			rows.forEach(function (r) {
// 				$tb.append('<tr class="' + (r.isTotal ? 'ppt-total-row' : '') + '"><td>' + r.label + '</td>' +
// 					'<td>' + fmtCrDash(r.bOpex) + '</td><td>' + fmtCrDash(r.bCapex) + '</td><td>' + fmtCrDash(r.bTotal) + '</td>' +
// 					'<td>' + fmtCrDash(r.eOpex) + '</td><td>' + fmtCrDash(r.eCapex) + '</td><td>' + fmtCrDash(r.eTotal) + '</td></tr>');
// 			});
// 			fixStickySubHeader('#' + tblId);
// 		}

// 		function buildEducationTables(data, cfg, bLbl, eLbl) {
// 			var subItems = (data || []).filter(function (e) { return e.is_this_sub_item === 1; });
// 			if (!subItems.length) { return ''; }
// 			var groups = {}, groupOrder = [];
// 			subItems.forEach(function (e) {
// 				var grp = (e.table_name || 'Other').trim();
// 				if (!groups[grp]) { groups[grp] = []; groupOrder.push(grp); }
// 				groups[grp].push(e);
// 			});
// 			var html = '';
// 			groupOrder.forEach(function (grp) {
// 				var entries = groups[grp].slice().sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });
// 				var tblId = 'ppt-edu-' + grp.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
// 				var bodyHtml = '';
// 				var tot = { bOpex: 0, bCapex: 0, bTotal: 0, eOpex: 0, eCapex: 0, eTotal: 0 };
// 				entries.forEach(function (e) {
// 					var b = extractVals(e[cfg.key] || [], cfg.budgetField);
// 					var v = extractVals(e[cfg.key] || [], cfg.actualField);
// 					var bTot = extractTotal(e[cfg.key] || [], cfg.budgetField);
// 					var eTot = extractTotal(e[cfg.key] || [], cfg.actualField);
// 					tot.bOpex += b.opex; tot.bCapex += b.capex; tot.bTotal += bTot;
// 					tot.eOpex += v.opex; tot.eCapex += v.capex; tot.eTotal += eTot;
// 					bodyHtml += '<tr><td>' + (e.label || '') + '</td>' +
// 						'<td>' + fmtCrDash(b.opex) + '</td><td>' + fmtCrDash(b.capex) + '</td><td>' + fmtCrDash(bTot) + '</td>' +
// 						'<td>' + fmtCrDash(v.opex) + '</td><td>' + fmtCrDash(v.capex) + '</td><td>' + fmtCrDash(eTot) + '</td></tr>';
// 				});
// 				bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' +
// 					'<td>' + fmtCrDash(tot.bOpex) + '</td><td>' + fmtCrDash(tot.bCapex) + '</td><td>' + fmtCrDash(tot.bTotal) + '</td>' +
// 					'<td>' + fmtCrDash(tot.eOpex) + '</td><td>' + fmtCrDash(tot.eCapex) + '</td><td>' + fmtCrDash(tot.eTotal) + '</td></tr>';
// 				html +=
// 					'<div class="ppt-title-bar" style="margin-top:28px;"><div class="ppt-main-title">EDUCATION</div></div>' +
// 					'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
// 					'<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' +
// 					'<table id="' + tblId + '" class="ppt-table-wrap"><thead>' +
// 					'<tr class="cb-thead-main"><th rowspan="2" style="min-width:200px;text-align:left !important;">Unit</th>' +
// 					'<th colspan="3" style="text-align:center !important;">' + bLbl + '</th>' +
// 					'<th colspan="3" style="text-align:center !important;">' + eLbl + '</th></tr>' +
// 					'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Total</th><th>Opex</th><th>Capex</th><th>Total</th></tr>' +
// 					'</thead><tbody>' + bodyHtml + '</tbody></table></div>';
// 			});
// 			return html;
// 		}

// 		function buildOpexBudgetTable(entries, fyLabel) {
// 			if (!entries || !entries.length) { return ''; }
// 			function isOpex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1; }
// 			function getSubPlan(e, subName) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isOpex(s.name)) { return; }
// 					(s.sub_heads || []).forEach(function (sub) {
// 						if ((sub.name || '').trim() === subName) { v += parseFloat(sub.ytd || 0); }
// 					});
// 				});
// 				return v;
// 			}
// 			function getOpexPlan(e) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) { if (isOpex(s.name)) { v += parseFloat(s.ytd || 0); } });
// 				return v;
// 			}
// 			var subHeadNames = [], seen = {};
// 			entries.forEach(function (e) {
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isOpex(s.name)) { return; }
// 					(s.sub_heads || []).forEach(function (sub) {
// 						var n = (sub.name || '').trim();
// 						if (n && !seen[n]) { seen[n] = true; subHeadNames.push(n); }
// 					});
// 				});
// 			});
// 			if (!subHeadNames.length) { return ''; }
// 			var tblId = 'ppt-opex-budget-tbl';
// 			if (!$('#ppt-opex-style').length) {
// 				$('head').append('<style id="ppt-opex-style">#' + tblId + '{border-collapse:collapse !important;width:100%;}' +
// 					'#' + tblId + ' th,#' + tblId + ' td{border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th{border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:50 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:260px;border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:260px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' tbody tr.cb-row-grand td:first-child{background:var(--blue-mid) !important;border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' tbody tr.ppt-total-row td:first-child{background:#e8f0fa !important;border:1.5px solid #aaa !important;}</style>');
// 			}
// 			var hdrR1 = '<tr class="cb-thead-main"><th style="min-width:260px;text-align:left !important;">Expense Category</th>';
// 			entries.forEach(function (e) { hdrR1 += '<th style="min-width:150px;text-align:center !important;">' + (e.label || '').trim() + '</th>'; });
// 			hdrR1 += '<th style="min-width:150px;text-align:center !important;background:var(--blue-dark);">Grand Total</th></tr>';
// 			var bodyHtml = '', colTotals = [], grandRowTotal = 0;
// 			entries.forEach(function () { colTotals.push(0); });
// 			subHeadNames.forEach(function (subName) {
// 				var rowTotal = 0, cells = '';
// 				entries.forEach(function (e, ei) {
// 					var v = getSubPlan(e, subName);
// 					colTotals[ei] += v; rowTotal += v;
// 					cells += '<td>' + fmtCrDash(v) + '</td>';
// 				});
// 				grandRowTotal += rowTotal;
// 				bodyHtml += '<tr><td>' + subName + '</td>' + cells +
// 					'<td style="font-weight:700;background:#ddeaf7;color:var(--blue-dark);border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(rowTotal) + '</td></tr>';
// 			});
// 			var totalCells = '', opexGrandTotal = 0;
// 			entries.forEach(function (e) {
// 				var v = getOpexPlan(e); opexGrandTotal += v;
// 				totalCells += '<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(v) + '</td>';
// 			});
// 			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells +
// 				'<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(opexGrandTotal) + '</td></tr>';
// 			var fyPart = fyLabel.replace(/\s*budget\s*/i, '').trim();
// 			return '<div class="ppt-title-bar" style="margin-top:36px;"><div class="ppt-main-title">OPERATING EXPENSES ' + fyPart + '</div></div>' +
// 				'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
// 				'<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' +
// 				'<table id="' + tblId + '" class="cb-table"><thead>' + hdrR1 + '</thead><tbody>' + bodyHtml + '</tbody></table></div>';
// 		}

// 		function buildCapexBudgetTable(entries, fyLabel) {
// 			if (!entries || !entries.length) { return ''; }
// 			function isCapex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('CAPITAL') !== -1; }
// 			function getItemPlan(e, itemName) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isCapex(s.name)) { return; }
// 					(s.items || []).forEach(function (item) {
// 						if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); }
// 					});
// 				});
// 				return v;
// 			}
// 			function getCapexPlan(e) {
// 				var v = 0;
// 				(e.actuals || []).forEach(function (s) { if (isCapex(s.name)) { v += parseFloat(s.ytd || 0); } });
// 				return v;
// 			}
// 			var itemNames = [], seen = {};
// 			entries.forEach(function (e) {
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isCapex(s.name)) { return; }
// 					(s.items || []).forEach(function (item) {
// 						var n = (item.name || '').trim();
// 						if (n && !seen[n]) { seen[n] = true; itemNames.push(n); }
// 					});
// 				});
// 			});
// 			if (!itemNames.length) { return ''; }
// 			var tblId = 'ppt-capex-budget-tbl';
// 			if (!$('#ppt-capex-style').length) {
// 				$('head').append('<style id="ppt-capex-style">#' + tblId + '{border-collapse:collapse !important;width:100%;}' +
// 					'#' + tblId + ' th,#' + tblId + ' td{border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th{border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:50 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:260px;border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:260px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1.5px solid var(--bdl) !important;}' +
// 					'#' + tblId + ' tbody tr.cb-row-grand td:first-child{background:var(--blue-mid) !important;border:1.5px solid var(--bdh) !important;}' +
// 					'#' + tblId + ' tbody tr.ppt-total-row td:first-child{background:#e8f0fa !important;border:1.5px solid #aaa !important;}</style>');
// 			}
// 			var hdrR1 = '<tr class="cb-thead-main"><th style="min-width:260px;text-align:left !important;">Expense Category</th>';
// 			entries.forEach(function (e) { hdrR1 += '<th style="min-width:150px;text-align:center !important;">' + (e.label || '').trim() + '</th>'; });
// 			hdrR1 += '<th style="min-width:150px;text-align:center !important;background:var(--blue-dark);">Grand Total</th></tr>';
// 			var bodyHtml = '', grandRowTotal = 0;
// 			itemNames.forEach(function (itemName) {
// 				var rowTotal = 0, cells = '';
// 				entries.forEach(function (e) {
// 					var v = getItemPlan(e, itemName); rowTotal += v;
// 					cells += '<td>' + fmtCrDash(v) + '</td>';
// 				});
// 				grandRowTotal += rowTotal;
// 				bodyHtml += '<tr><td>' + itemName + '</td>' + cells +
// 					'<td style="font-weight:700;background:#ddeaf7;color:var(--blue-dark);border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(rowTotal) + '</td></tr>';
// 			});
// 			var totalCells = '', capexGrandTotal = 0;
// 			entries.forEach(function (e) {
// 				var v = getCapexPlan(e); capexGrandTotal += v;
// 				totalCells += '<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(v) + '</td>';
// 			});
// 			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells +
// 				'<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(capexGrandTotal) + '</td></tr>';
// 			var fyPart = fyLabel.replace(/\s*budget\s*/i, '').trim();
// 			return '<div class="ppt-title-bar" style="margin-top:36px;"><div class="ppt-main-title">CAPITAL EXPENSES ' + fyPart + '</div></div>' +
// 				'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
// 				'<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' +
// 				'<table id="' + tblId + '" class="cb-table"><thead>' + hdrR1 + '</thead><tbody>' + bodyHtml + '</tbody></table></div>';
// 		}

// 		function load(fy) {
// 			$('#ppt-tbody,#ppt-prev-tbody').html(
// 				'<tr><td colspan="7" style="text-align:center;padding:24px;color:#aaa;">Loading\u2026</td></tr>'
// 			);
// 			$('#ppt-sub-tables').html('');
// 			Loader.show('Building your foundation metrics');

// 			var p = (fy || '2025-26').split('-');
// 			var cS = parseInt(p[0], 10), cE = parseInt(p[1], 10);
// 			var curFY = cS + '-' + String(cE).padStart(2, '0');
// 			var prvFY = (cS - 1) + '-' + String(cE - 1).padStart(2, '0');

// 			// Both PPT API calls go through DataCache
// 			Promise.all([
// 				DataCache.get('foundationOverall', fy, function(res,rej){Fetchers.foundationOverall(fy,res,rej);}, []),
// 				DataCache.get('unitWisePlanOpexCapex', fy, function(res,rej){Fetchers.unitWisePlanOpexCapex(fy,res,rej);}, [])
// 			]).then(function (results) {
// 				Loader.hide();
// 				var d   = results[0];
// 				var raw = results[1];

// 				if (!d.length) {
// 					$('#ppt-tbody,#ppt-prev-tbody').html(
// 						'<tr><td colspan="7" style="text-align:center;padding:24px;color:#aaa;">No data.</td></tr>'
// 					);
// 					return;
// 				}

// 				$('#ppt-main-title').text('Overall Foundation \u2013 ' + curFY + ' Budget vs ' + prvFY + ' Actual');
// 				$('#ppt-prev-title').text('Overall Foundation \u2013 ' + prvFY + ' Budget vs ' + prvFY + ' Actual');

// 				var cCfg = { key: 'current_year',  budgetField: 'ytd', actualField: 'total_posted_amt_ytd' };
// 				var pCfg = { key: 'previous_year', budgetField: 'ytd', actualField: 'total_posted_amt_ytd' };
// 				var mainData = d.filter(function (e) { return e.is_this_sub_item !== 1; });
// 				var r0 = buildRows(mainData, cCfg);
// 				var r1 = buildRows(mainData, pCfg);

// 				renderTable(r0, 'ppt-tbody',      'ppt-budget-hdr',      'ppt-est-hdr',      'ppt-table',      curFY + ' Budget', prvFY + ' Actual');
// 				renderTable(r1, 'ppt-prev-tbody', 'ppt-prev-budget-hdr', 'ppt-prev-est-hdr', 'ppt-prev-table', prvFY + ' Budget', prvFY + ' Actual');

// 				var subHtml = buildEducationTables(d, cCfg, curFY + ' Budget', prvFY + ' Actual');

// 				var uwp = raw.filter(function (e) {
// 					return e.is_this_sub_item === 0
// 						&& e.sequence_id !== 9999
// 						&& (e.table_name || '').toUpperCase() !== 'CONSOLIDATED';
// 				}).sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });

// 				var opexHtml  = buildOpexBudgetTable(uwp, curFY);
// 				var capexHtml = buildCapexBudgetTable(uwp, curFY);
// 				$('#ppt-sub-tables').html(subHtml + opexHtml + capexHtml);

// 				$('#ppt-sub-tables .ppt-table-wrap').each(function () {
// 					var id = $(this).attr('id'); if (id) { fixStickySubHeader('#' + id); }
// 				});
// 				fixStickySubHeader('#ppt-opex-budget-tbl');
// 				fixStickySubHeader('#ppt-capex-budget-tbl');

// 				var toExp = function (rows) {
// 					return rows.map(function (r) {
// 						return { label: r.label, bOpex: r.bOpex, bCapex: r.bCapex, bTotal: r.bTotal,
// 							eOpex: r.eOpex, eCapex: r.eCapex, eTotal: r.eTotal, is_total: !!r.isTotal };
// 					});
// 				};
// 				Store.ppt.rows = toExp(r0); Store.ppt.prevRows = toExp(r1);
// 				Store.ppt.budgetLabel = curFY + ' Budget'; Store.ppt.estLabel = prvFY + ' Actual';
// 				Store.ppt.prevBudgetLabel = prvFY + ' Budget'; Store.ppt.prevEstLabel = prvFY + ' Actual';

// 			}).catch(function () {
// 				Loader.hide();
// 				$('#ppt-tbody,#ppt-prev-tbody').html(
// 					'<tr><td colspan="7" style="text-align:center;padding:24px;color:red;">Error loading data.</td></tr>'
// 				);
// 			});
// 		}

// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// SUMMARY IN INR MODULE
// 	// =============================================================================

// 	var SummaryINR = (function () {
// 		function normN(s) { return (s || '').replace(/\s+/g, ' ').trim().toUpperCase(); }
// 		function zero() { return { opex_plan: 0, opex_act: 0, capex_plan: 0, capex_act: 0, total_plan: 0, total_act: 0 }; }
// 		function addV(a, b) { return { opex_plan: a.opex_plan + b.opex_plan, opex_act: a.opex_act + b.opex_act, capex_plan: a.capex_plan + b.capex_plan, capex_act: a.capex_act + b.capex_act, total_plan: a.total_plan + b.total_plan, total_act: a.total_act + b.total_act }; }
// 		function extractA(actuals) {
// 			var r = zero();
// 			(actuals || []).forEach(function (sec) {
// 				var nm = normN(sec.name);
// 				if (nm === 'OPERATING EXPENSES' || nm === 'OPERATING  EXPENSES') { r.opex_plan += parseFloat(sec.ytd || 0); r.opex_act += parseFloat(sec.total_posted_amt_ytd || 0); }
// 				if (nm === 'CAPITAL EXPENSES'   || nm === 'CAPITAL  EXPENSES')   { r.capex_plan += parseFloat(sec.ytd || 0); r.capex_act += parseFloat(sec.total_posted_amt_ytd || 0); }
// 			});
// 			r.total_plan = r.opex_plan + r.capex_plan; r.total_act = r.opex_act + r.capex_act;
// 			return r;
// 		}
// 		function getConsolidatedTotals(data) {
// 			var ct = null;
// 			(data || []).forEach(function (e) {
// 				if (e.sequence_id === 9999 || (e.table_name || '').toUpperCase() === 'CONSOLIDATED') { ct = e; }
// 			});
// 			if (!ct) { return null; }
// 			var r = zero();
// 			(ct.actuals || []).forEach(function (a) {
// 				var nm = (a.name || '').toUpperCase().replace(/\s+/g, ' ').trim();
// 				if (nm === 'OPEX TOTAL')         { r.opex_plan += parseFloat(a.ytd || 0); r.opex_act += parseFloat(a.total_posted_amt_ytd || 0); }
// 				if (nm === 'CAPEX TOTAL')         { r.capex_plan += parseFloat(a.ytd || 0); r.capex_act += parseFloat(a.total_posted_amt_ytd || 0); }
// 				if (nm === 'OVERALL GRAND TOTAL') { r.total_plan = parseFloat(a.ytd || 0); r.total_act = parseFloat(a.total_posted_amt_ytd || 0); }
// 			});
// 			if (!r.total_plan && !r.total_act) { r.total_plan = r.opex_plan + r.capex_plan; r.total_act = r.opex_act + r.capex_act; }
// 			return r;
// 		}
// 		function buildRowsA(data) {
// 			var sorted = (data || []).slice().sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });
// 			var norm = [], covid = [];
// 			sorted.forEach(function (e) {
// 				if (e.sequence_id === 9999 || (e.table_name || '').toUpperCase() === 'CONSOLIDATED') { return; }
// 				var lbl = (e.label || '').trim();
// 				var row = { display: lbl, isSub: e.is_this_sub_item === 1, isCovid: lbl.toLowerCase().indexOf('covid') !== -1, vals: extractA(e.actuals) };
// 				(row.isCovid ? covid : norm).push(row);
// 			});
// 			var gtVals = getConsolidatedTotals(data);
// 			if (!gtVals) {
// 				gtVals = zero();
// 				norm.forEach(function (r) { if (!r.isSub) { gtVals = addV(gtVals, r.vals); } });
// 				covid.forEach(function (r) { if (!r.isSub) { gtVals = addV(gtVals, r.vals); } });
// 			}
// 			var out = norm.slice();
// 			if (covid.length) { out = out.concat(covid); }
// 			out.push({ display: 'Grand Total', isTotal: true, isGrandTotal: true, vals: gtVals });
// 			return out;
// 		}
// 		function rowHtmlA(r) {
// 			var cls = r.isGrandTotal ? 'cb-row-grand' : (r.isTotal ? 'sinr-total-row' : (r.isCovid ? 'sinr-covid-row' : ''));
// 			var sty = 'text-align:left;' + (r.isSub ? 'padding-left:28px;color:#555;' : '');
// 			var v = r.vals;
// 			return '<tr class="' + cls + '"><td style="' + sty + '">' + r.display + '</td><td>' + fmtCr(v.opex_plan) + '</td><td>' + fmtCr(v.capex_plan) + '</td><td>' + fmtCr(v.total_plan) + '</td><td>' + fmtCr(v.opex_act) + '</td><td>' + fmtCr(v.capex_act) + '</td><td>' + fmtCr(v.total_act) + '</td></tr>';
// 		}
// 		function tableHtmlA(rows, pLbl, aLbl) {
// 			return '<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
// 				'<div class="cb-scroll-wrapper" style="margin-bottom:28px;"><table class="cb-table sinr-table" id="sinr-table-a" style="width:100%;"><thead>' +
// 				'<tr class="cb-thead-main"><th rowspan="2" style="text-align:left !important;min-width:260px;">Unit / Function</th><th colspan="3" style="text-align:center !important;">' + pLbl + '</th><th colspan="3" style="text-align:center !important;">' + aLbl + '</th></tr>' +
// 				'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Total</th><th>Opex</th><th>Capex</th><th>Total</th></tr>' +
// 				'</thead><tbody>' + rows.map(rowHtmlA).join('') + '</tbody></table></div>';
// 		}
// 		function getSubNames(entries) {
// 			var seen = {}, names = [];
// 			entries.forEach(function (e) { (e.actuals || []).forEach(function (sec) { if (normN(sec.name).indexOf('OPERATING') === -1) { return; } (sec.sub_heads || []).forEach(function (sh) { var n = (sh.name || '').trim(); if (n && !seen[n]) { seen[n] = true; names.push(n); } }); }); });
// 			return names;
// 		}
// 		function shVal(actuals, name, field) { var v = 0; (actuals || []).forEach(function (sec) { if (normN(sec.name).indexOf('OPERATING') === -1) { return; } (sec.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === name) { v += parseFloat(field === 'plan' ? (sh.ytd || 0) : (sh.total_posted_amt_ytd || 0)); } }); }); return v; }
// 		function opT(a, f) { var v = 0; (a || []).forEach(function (s) { if (normN(s.name).indexOf('OPERATING') === -1) { return; } v += parseFloat(f === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); }); return v; }
// 		function caT(a, f) { var v = 0; (a || []).forEach(function (s) { if (normN(s.name).indexOf('CAPITAL') === -1) { return; } v += parseFloat(f === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); }); return v; }
// 		function tableHtmlB(entries, shNames, pLbl, aLbl, consolidatedVals) {
// 			var cc = 1 + shNames.length + 3;
// 			var hdr = '<tr class="cb-thead-main"><th rowspan="2" style="text-align:left !important;min-width:210px;">Unit / Function</th><th colspan="' + (shNames.length + 1) + '" style="text-align:center !important;">Operating Expenses</th><th rowspan="2" style="text-align:center !important;min-width:110px;">Capex</th><th rowspan="2" style="text-align:center !important;min-width:110px;">Total</th></tr>' +
// 				'<tr class="cb-thead-sub">' + shNames.map(function (n) { return '<th style="min-width:110px;">' + n + '</th>'; }).join('') + '<th style="min-width:110px;">Total</th></tr>';
// 			var body = '', gtP = {}, gtA = {};
// 			shNames.forEach(function (n) { gtP[n] = 0; gtA[n] = 0; });
// 			var gtOP = 0, gtOA = 0, gtCP = 0, gtCA = 0;
// 			entries.forEach(function (e) {
// 				var lbl = (e.label || '').trim(), act = e.actuals || [], sP = {}, sA = {};
// 				shNames.forEach(function (n) { sP[n] = shVal(act, n, 'plan'); sA[n] = shVal(act, n, 'act'); gtP[n] += sP[n]; gtA[n] += sA[n]; });
// 				var oP = opT(act, 'plan'), oA = opT(act, 'act'), cP = caT(act, 'plan'), cA = caT(act, 'act');
// 				gtOP += oP; gtOA += oA; gtCP += cP; gtCA += cA;
// 				body += '<tr class="sinr-unit-hdr"><td>' + lbl + '</td><td colspan="' + (shNames.length + 3) + '"></td></tr>';
// 				body += '<tr class="sinr-brkdwn-plan"><td style="padding-left:18px;color:#333;">- ' + pLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(sP[n]) + '</td>'; }).join('') + '<td>' + fmtCr(oP) + '</td><td>' + fmtCr(cP) + '</td><td>' + fmtCr(oP + cP) + '</td></tr>';
// 				body += '<tr class="sinr-brkdwn-act"><td style="padding-left:18px;color:#555;">- ' + aLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(sA[n]) + '</td>'; }).join('') + '<td>' + fmtCr(oA) + '</td><td>' + fmtCr(cA) + '</td><td>' + fmtCr(oA + cA) + '</td></tr>';
// 				body += '<tr class="sinr-spacer"><td colspan="' + cc + '"></td></tr>';
// 			});
// 			var finalOP = (consolidatedVals && consolidatedVals.opex_plan)  ? consolidatedVals.opex_plan  : gtOP;
// 			var finalOA = (consolidatedVals && consolidatedVals.opex_act)   ? consolidatedVals.opex_act   : gtOA;
// 			var finalCP = (consolidatedVals && consolidatedVals.capex_plan) ? consolidatedVals.capex_plan : gtCP;
// 			var finalCA = (consolidatedVals && consolidatedVals.capex_act)  ? consolidatedVals.capex_act  : gtCA;
// 			var finalTP = (consolidatedVals && consolidatedVals.total_plan) ? consolidatedVals.total_plan : (gtOP + gtCP);
// 			var finalTA = (consolidatedVals && consolidatedVals.total_act)  ? consolidatedVals.total_act  : (gtOA + gtCA);
// 			body += '<tr class="cb-row-grand"><td>Grand Total</td><td colspan="' + (shNames.length + 3) + '"></td></tr>';
// 			body += '<tr class="sinr-gt-plan"><td style="padding-left:18px;">- ' + pLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(gtP[n]) + '</td>'; }).join('') + '<td>' + fmtCr(finalOP) + '</td><td>' + fmtCr(finalCP) + '</td><td>' + fmtCr(finalTP) + '</td></tr>';
// 			body += '<tr class="sinr-gt-act"><td style="padding-left:18px;">- ' + aLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(gtA[n]) + '</td>'; }).join('') + '<td>' + fmtCr(finalOA) + '</td><td>' + fmtCr(finalCA) + '</td><td>' + fmtCr(finalTA) + '</td></tr>';
// 			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="sinr-table-b" style="width:100%;border-collapse:collapse;"><thead>' + hdr + '</thead><tbody>' + body + '</tbody></table></div>';
// 		}

// 		function tableHtmlOpexCapex(rows, pLbl, aLbl) {
// 			var gt = null;
// 			(rows || []).forEach(function (r) { if (r.isGrandTotal) { gt = r.vals; } });
// 			if (!gt) { return ''; }
// 			function pct(part, total) { if (!total || !isFinite(total) || total === 0) { return '-'; } return ((part / total) * 100).toFixed(1) + '%'; }
// 			var opexPctPlan  = pct(gt.opex_plan,  gt.total_plan);
// 			var capexPctPlan = pct(gt.capex_plan, gt.total_plan);
// 			var opexPctEst   = pct(gt.opex_act,   gt.total_act);
// 			var capexPctEst  = pct(gt.capex_act,  gt.total_act);
// 			var hdr = '<tr class="cb-thead-main"><th style="text-align:left !important;min-width:160px;"></th><th style="text-align:center !important;min-width:120px;">' + pLbl + '</th><th style="text-align:center !important;min-width:120px;">' + aLbl + '</th></tr>';
// 			var body = '<tr><td style="text-align:left;">Opex</td><td>' + opexPctPlan + '</td><td>' + opexPctEst + '</td></tr>' +
// 				'<tr><td style="text-align:left;">Capex</td><td>' + capexPctPlan + '</td><td>' + capexPctEst + '</td></tr>' +
// 				'<tr class="sinr-total-row"><td style="text-align:left;font-weight:700;">Total</td><td style="font-weight:700;">100.0%</td><td style="font-weight:700;">100.0%</td></tr>';
// 			if (!$('#sinr-oc-style').length) {
// 				$('head').append('<style id="sinr-oc-style">#sinr-table-oc{border-collapse:collapse !important;width:auto;}' +
// 					'#sinr-table-oc th,#sinr-table-oc td{border:1.5px solid var(--bdl) !important;padding:8px 16px;white-space:nowrap;text-align:right;font-family:var(--font);font-size:var(--fs-base);}' +
// 					'#sinr-table-oc th:first-child,#sinr-table-oc td:first-child{text-align:left !important;}' +
// 					'#sinr-table-oc thead tr th{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-lg);text-align:center !important;border:1.5px solid var(--bdh) !important;padding:10px 16px;}' +
// 					'#sinr-table-oc thead tr th:first-child{text-align:left !important;min-width:160px;}' +
// 					'#sinr-table-oc tbody tr.sinr-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b) !important;border:1.5px solid #9baab5 !important;}</style>');
// 			}
// 			return '<div style="margin-bottom:24px;"><table id="sinr-table-oc"><thead>' + hdr + '</thead><tbody>' + body + '</tbody></table></div>';
// 		}

// 		// ── Quarter Phasing table ─────────────────────────────────────────────────
// 		function tableHtmlQuarterPhasing(curFY, planData, prevFY, actualData) {
// 			// Category helpers — match row.name values from both APIs exactly
// 			function isCapex(n){ return (n||'').toUpperCase().replace(/\s+/g,' ').indexOf('CAPITAL')!==-1; }
// 			function isOpex(n) { return (n||'').toUpperCase().replace(/\s+/g,' ').indexOf('OPERATING')!==-1; }

// 			// ── Current FY budget ─────────────────────────────────────────────────────
// 			// Source: get_consolidated_report  (same data the Annual Budget tab renders)
// 			// row.q1/q2/q3/q4 = array of 3 monthly raw values  [Apr, May, Jun], etc.
// 			// Annual tab Grand Total: for each row, sum ALL 3 months → sumArr([v1,v2,v3])
// 			// We do exactly the same, but split into Capex vs Opex.
// 			function arrSum(a){ var t=0; (a||[]).forEach(function(v){t+=(parseFloat(v)||0);}); return t; }

// 			// Capex/Opex category accumulators (for their own rows)
// 			var curCQ1=0,curCQ2=0,curCQ3=0,curCQ4=0;
// 			var curOQ1=0,curOQ2=0,curOQ3=0,curOQ4=0;
// 			// Grand Total accumulators: ALL rows (matches Annual tab which sums every row)
// 			var curTQ1=0,curTQ2=0,curTQ3=0,curTQ4=0;
// 			(planData||[]).forEach(function(row){
// 				var q1=arrSum(row.q1), q2=arrSum(row.q2), q3=arrSum(row.q3), q4=arrSum(row.q4);
// 				// ALL rows contribute to grand total (Annual tab does the same via grand accumulator)
// 				curTQ1+=q1; curTQ2+=q2; curTQ3+=q3; curTQ4+=q4;
// 				// Only Capex/Opex rows go into their own line
// 				if     (isCapex(row.name)){ curCQ1+=q1; curCQ2+=q2; curCQ3+=q3; curCQ4+=q4; }
// 				else if(isOpex(row.name)) { curOQ1+=q1; curOQ2+=q2; curOQ3+=q3; curOQ4+=q4; }
// 			});

// 			// ── Previous FY actuals ───────────────────────────────────────────────────
// 			// Source: get_grouped_actuals  (same data the Estimate Consolidated tab renders)
// 			// row.Q1/Q2/Q3/Q4 = direct quarter totals; Estimate tab reads via qTot() — same here.
// 			var prvCQ1=0,prvCQ2=0,prvCQ3=0,prvCQ4=0;
// 			var prvOQ1=0,prvOQ2=0,prvOQ3=0,prvOQ4=0;
// 			// Grand Total: ALL rows (matches Estimate tab Grand Total row)
// 			var prvTQ1=0,prvTQ2=0,prvTQ3=0,prvTQ4=0;
// 			(actualData||[]).forEach(function(row){
// 				var q1=parseFloat(row.Q1||0), q2=parseFloat(row.Q2||0);
// 				var q3=parseFloat(row.Q3||0), q4=parseFloat(row.Q4||0);
// 				// ALL rows go into grand total
// 				prvTQ1+=q1; prvTQ2+=q2; prvTQ3+=q3; prvTQ4+=q4;
// 				// Only Capex/Opex go into their own rows
// 				if     (isCapex(row.name)){ prvCQ1+=q1; prvCQ2+=q2; prvCQ3+=q3; prvCQ4+=q4; }
// 				else if(isOpex(row.name)) { prvOQ1+=q1; prvOQ2+=q2; prvOQ3+=q3; prvOQ4+=q4; }
// 			});

// 			function toCr(v){ return (Math.abs(parseFloat(v))/10000000).toFixed(1); }
// 			function pct(part,total){ if(!total||total===0){return '0.0%';} return ((Math.abs(part)/Math.abs(total))*100).toFixed(1)+'%'; }
// 			function vCell(v,bold){ return '<td'+(bold?' style="font-weight:700;"':'')+'>'+toCr(v)+'</td>'; }
// 			function pCell(p,t){ return '<td style="color:#666;font-style:italic;font-size:var(--fs-xs);">'+pct(p,t)+'</td>'; }

// 			// fyBlock: tq1-tq4 = grand total across ALL rows (matches each tab's Grand Total row)
// 			//          cq/oq   = category-only totals (for Capex/Opex individual lines)
// 			function fyBlock(fyLabel, cq1,cq2,cq3,cq4, oq1,oq2,oq3,oq4, tq1,tq2,tq3,tq4){
// 				var ct=cq1+cq2+cq3+cq4, ot=oq1+oq2+oq3+oq4, tt=tq1+tq2+tq3+tq4;
// 				return (
// 					'<tr class="qp-fy-hdr"><td>'+fyLabel+'</td><td>Qtr-1</td><td>Qtr-2</td><td>Qtr-3</td><td>Qtr-4</td><td>Total</td></tr>'+
// 					'<tr><td>Capex</td>'+vCell(cq1)+vCell(cq2)+vCell(cq3)+vCell(cq4)+vCell(ct,true)+'</tr>'+
// 					'<tr class="qp-pct-row"><td><em>% Phasing</em></td>'+pCell(cq1,ct)+pCell(cq2,ct)+pCell(cq3,ct)+pCell(cq4,ct)+'<td style="font-style:italic;font-size:var(--fs-xs);">100.0%</td></tr>'+
// 					'<tr class="qp-spacer"><td colspan="6"></td></tr>'+
// 					'<tr><td>Opex</td>'+vCell(oq1)+vCell(oq2)+vCell(oq3)+vCell(oq4)+vCell(ot,true)+'</tr>'+
// 					'<tr class="qp-pct-row"><td><em>% Phasing</em></td>'+pCell(oq1,ot)+pCell(oq2,ot)+pCell(oq3,ot)+pCell(oq4,ot)+'<td style="font-style:italic;font-size:var(--fs-xs);">100.0%</td></tr>'+
// 					'<tr class="qp-spacer"><td colspan="6"></td></tr>'+
// 					'<tr class="qp-total-row"><td>Total</td>'+vCell(tq1,true)+vCell(tq2,true)+vCell(tq3,true)+vCell(tq4,true)+vCell(tt,true)+'</tr>'+
// 					'<tr class="qp-pct-row"><td><em>% Phasing</em></td>'+pCell(tq1,tt)+pCell(tq2,tt)+pCell(tq3,tt)+pCell(tq4,tt)+'<td style="font-style:italic;font-size:var(--fs-xs);">100.0%</td></tr>'
// 				);
// 			}

// 			var body =
// 				// tQN accumulators include ALL rows (COVID etc.) — matches tab Grand Total exactly
// 				fyBlock(curFY,  curCQ1,curCQ2,curCQ3,curCQ4, curOQ1,curOQ2,curOQ3,curOQ4, curTQ1,curTQ2,curTQ3,curTQ4)+
// 				'<tr class="qp-fy-gap"><td colspan="6"></td></tr>'+
// 				fyBlock(prevFY, prvCQ1,prvCQ2,prvCQ3,prvCQ4, prvOQ1,prvOQ2,prvOQ3,prvOQ4, prvTQ1,prvTQ2,prvTQ3,prvTQ4);

// 			// Returns only the table — labels/currency-note added by caller with lettered prefix
// 			return (
// 				'<div style="overflow-x:auto;margin-bottom:28px;">'+
// 				'<table id="qp-table"><tbody>'+body+'</tbody></table>'+
// 				'</div>'
// 			);
// 		}

// 		function tableHtmlCPE(planData, headcountRecords, fy, pLbl, aLbl) {
// 			if (!planData || !planData.length) { return ''; }
// 			var fp = (fy || '2025-26').split('-');
// 			var curFYKey      = fy;
// 			var prevFYKey     = (parseInt(fp[0], 10) - 1) + '-' + String(parseInt(fp[1], 10) - 1).padStart(2, '0');
// 			var prevPrevFYKey = (parseInt(fp[0], 10) - 2) + '-' + String(parseInt(fp[1], 10) - 2).padStart(2, '0');
// 			function isOpex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1; }
// 			function getAvgHC(fyKey) {
// 				var sorted = (headcountRecords || []).filter(function (r) { return !!r.financial_year; })
// 					.slice().sort(function (a, b) { return (a.financial_year || '').localeCompare(b.financial_year || ''); });
// 				var idx = -1;
// 				for (var i = 0; i < sorted.length; i++) { if (sorted[i].financial_year === fyKey) { idx = i; break; } }
// 				if (idx === -1) { return 0; }
// 				var curTotal = parseFloat(sorted[idx].total_head_count || sorted[idx].total_headcount || sorted[idx].headcount || 0);
// 				if (idx === 0) { return curTotal / 2; }
// 				var prevTotal = parseFloat(sorted[idx - 1].total_head_count || sorted[idx - 1].total_headcount || sorted[idx - 1].headcount || 0);
// 				return (prevTotal + curTotal) / 2;
// 			}
// 			var avgHCPlan = getAvgHC(prevFYKey);
// 			var avgHCEst  = getAvgHC(prevPrevFYKey);
// 			var sourceRows = (planData || []).filter(function (e) {
// 				return e.is_this_sub_item === 0 && e.sequence_id !== 9999 && (e.table_name || '').toUpperCase() !== 'CONSOLIDATED';
// 			});
// 			var shNames = [], shSeen = {};
// 			sourceRows.forEach(function (e) {
// 				(e.actuals || []).forEach(function (s) {
// 					if (!isOpex(s.name)) { return; }
// 					(s.sub_heads || []).forEach(function (sh) { var n = (sh.name || '').trim(); if (n && !shSeen[n]) { shSeen[n] = true; shNames.push(n); } });
// 				});
// 			});
// 			function shRawPlan(shName) { var v = 0; sourceRows.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (!isOpex(s.name)) { return; } (s.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === shName) { v += parseFloat(sh.ytd || 0); } }); }); }); return v; }
// 			function shRawEst(shName)  { var v = 0; sourceRows.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (!isOpex(s.name)) { return; } (s.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === shName) { v += parseFloat(sh.total_posted_amt_ytd || 0); } }); }); }); return v; }
// 			function opexRawPlan() { var v = 0; sourceRows.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (isOpex(s.name)) { v += parseFloat(s.ytd || 0); } }); }); return v; }
// 			function opexRawEst()  { var v = 0; sourceRows.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (isOpex(s.name)) { v += parseFloat(s.total_posted_amt_ytd || 0); } }); }); return v; }
// 			var totalRawPlan = opexRawPlan(), totalRawEst = opexRawEst();
// 			var dataRows = shNames.map(function (shName) {
// 				var rp = shRawPlan(shName), re = shRawEst(shName);
// 				var inrCrPlan = rp / 10000000, inrCrEst = re / 10000000;
// 				var cpaPlan = (avgHCPlan > 0) ? (inrCrPlan / avgHCPlan * 1000) : 0;
// 				var cpaEst  = (avgHCEst  > 0) ? (inrCrEst  / avgHCEst  * 1000) : 0;
// 				var cpmPlan = cpaPlan / 12, cpmEst = cpaEst / 12;
// 				var mixPlan = (totalRawPlan > 0) ? (rp / totalRawPlan * 100) : 0;
// 				var mixEst  = (totalRawEst  > 0) ? (re / totalRawEst  * 100) : 0;
// 				var ppInc   = (cpaEst > 0) ? ((cpaPlan / cpaEst) - 1) * 100 : null;
// 				return { name: shName, inrCrPlan: inrCrPlan, inrCrEst: inrCrEst, cpaPlan: cpaPlan, cpaEst: cpaEst, cpmPlan: cpmPlan, cpmEst: cpmEst, mixPlan: mixPlan, mixEst: mixEst, ppInc: ppInc };
// 			});
// 			var ttlInrCrPlan = totalRawPlan/10000000, ttlInrCrEst = totalRawEst/10000000;
// 			var ttlCpaPlan = (avgHCPlan>0)?((totalRawPlan/10000000)/avgHCPlan*1000):0;
// 			var ttlCpaEst  = (avgHCEst >0)?((totalRawEst /10000000)/avgHCEst *1000):0;
// 			var ttlCpmPlan = ttlCpaPlan/12, ttlCpmEst = ttlCpaEst/12;
// 			var ttlPpInc   = (ttlCpaEst>0)?((ttlCpaPlan/ttlCpaEst)-1)*100:null;
// 			function fmtInrCr(v){ var n=parseFloat(v)||0; if(!isFinite(n)){return '-';} if(Math.abs(n)<0.005){return n===0?'-':'0.00';} var neg=n<0,abs=Math.abs(n),s=abs.toFixed(2).split('.'),ip=s[0],dp=s[1]; if(ip.length>3){ip=ip.slice(0,-3).replace(/\B(?=(\d{2})+(?!\d))/g,',')+','+ip.slice(-3);} return (neg?'-':'')+ip+'.'+dp; }
// 			function fmtK(v){ var n=parseFloat(v)||0; if(!isFinite(n)||n===0){return '-';} return (n<0?'-':'')+Math.abs(n).toFixed(2); }
// 			function fmtMix(v){ var n=parseFloat(v)||0; if(!isFinite(n)||n===0){return '0%';} return Math.round(n)+'%'; }
// 			function fmtInc(v){ if(v===null||v===undefined||isNaN(v)||!isFinite(v)){return '-';} var n=Math.round(parseFloat(v)); return (n>0?'+':'')+n+'%'; }
// 			function incStyle(v){ if(v===null||v===undefined||isNaN(v)||!isFinite(v)){return '';} var n=parseFloat(v); return n<0?' style="color:#c0392b;font-weight:600;"':(n>0?' style="color:#1a7a3a;font-weight:600;"':''); }
// 			var hdr1='<tr class="cb-thead-main"><th rowspan="3" style="min-width:220px;text-align:left !important;vertical-align:middle;">Overall Foundation</th><th colspan="2" style="text-align:center !important;min-width:200px;">INR</th><th colspan="2" style="text-align:center !important;min-width:200px;">Cost / Person p.a.(Rs K)</th><th colspan="2" style="text-align:center !important;min-width:200px;">Cost / Person p.m.(Rs K)</th><th colspan="2" style="text-align:center !important;min-width:180px;">% Mix</th><th rowspan="3" style="text-align:center !important;min-width:150px;vertical-align:middle;">Increase in PPC<br>('+fy+' vs. '+prevFYKey+')</th></tr>';
// 			var hdr2='<tr class="cb-thead-sub"><th style="min-width:100px;">'+fy+'</th><th style="min-width:100px;">'+prevFYKey+'</th><th style="min-width:100px;">'+fy+'</th><th style="min-width:100px;">'+prevFYKey+'</th><th style="min-width:100px;">'+fy+'</th><th style="min-width:100px;">'+prevFYKey+'</th><th style="min-width:90px;">'+fy+'</th><th style="min-width:90px;">'+prevFYKey+'</th></tr>';
// 			var hdr3='<tr class="cb-thead-sub2"><th>Plan</th><th>Est</th><th>Plan</th><th>Est</th><th>Plan</th><th>Est</th><th>Plan</th><th>Est</th></tr>';
// 			var bodyHtml='';
// 			dataRows.forEach(function(row){
// 				bodyHtml+='<tr><td>'+row.name+'</td><td>'+fmtInrCr(row.inrCrPlan)+'</td><td>'+fmtInrCr(row.inrCrEst)+'</td><td>'+fmtK(row.cpaPlan)+'</td><td>'+fmtK(row.cpaEst)+'</td><td>'+fmtK(row.cpmPlan)+'</td><td>'+fmtK(row.cpmEst)+'</td><td>'+fmtMix(row.mixPlan)+'</td><td>'+fmtMix(row.mixEst)+'</td><td'+incStyle(row.ppInc)+'>'+fmtInc(row.ppInc)+'</td></tr>';
// 			});
// 			bodyHtml+='<tr class="cpe-total-row"><td>Total Operating Expenses</td><td>'+fmtInrCr(ttlInrCrPlan)+'</td><td>'+fmtInrCr(ttlInrCrEst)+'</td><td>'+fmtK(ttlCpaPlan)+'</td><td>'+fmtK(ttlCpaEst)+'</td><td>'+fmtK(ttlCpmPlan)+'</td><td>'+fmtK(ttlCpmEst)+'</td><td>100%</td><td>100%</td><td'+incStyle(ttlPpInc)+'>'+fmtInc(ttlPpInc)+'</td></tr>';
// 			return '<div id="sinr-cpe-wrap"><div class="sinr-section-label" style="margin-top:28px;">E. Cost per Employee - Comparison</div><div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="sinr-cpe-table" class="cb-table"><thead>'+hdr1+hdr2+hdr3+'</thead><tbody>'+bodyHtml+'</tbody></table></div></div>';
// 		}

// 		function tableHtmlC(entries, pLbl, aLbl) {
// 			if (!entries || !entries.length) { return ''; }
// 			function isOpex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1; }
// 			var shNames = [], shSeen = {};
// 			entries.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (!isOpex(s.name)) { return; } (s.sub_heads || []).forEach(function (sh) { var n = (sh.name || '').trim(); if (n && !shSeen[n]) { shSeen[n] = true; shNames.push(n); } }); }); });
// 			if (!shNames.length) { return ''; }
// 			function shPlan(e, shName) { var v = 0; (e.actuals || []).forEach(function (s) { if (!isOpex(s.name)) { return; } (s.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === shName) { v += parseFloat(sh.ytd || 0); } }); }); return v; }
// 			function shAct(e, shName)  { var v = 0; (e.actuals || []).forEach(function (s) { if (!isOpex(s.name)) { return; } (s.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === shName) { v += parseFloat(sh.total_posted_amt_ytd || 0); } }); }); return v; }
// 			function opexTotal(e, field) { var v = 0; (e.actuals || []).forEach(function (s) { if (isOpex(s.name)) { v += parseFloat(field === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); } }); return v; }
// 			var tblId = 'sinr-table-c';
// 			if (!$('#sinr-c-style').length) {
// 				$('head').append('<style id="sinr-c-style">#'+tblId+'{border-collapse:collapse !important;width:100%;}#'+tblId+' th,#'+tblId+' td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;}#'+tblId+' thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);border:1.5px solid var(--bdh) !important;position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}#'+tblId+' thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);border:1.5px solid var(--bdo) !important;position:sticky;z-index:24;text-align:center !important;min-width:120px;padding:8px 12px;}#'+tblId+' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:55 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:220px;vertical-align:middle;}#'+tblId+' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:220px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1.5px solid var(--bdl) !important;}#'+tblId+' tbody tr.ppt-total-row td:first-child{position:sticky;left:0;z-index:10;background:#e8f0fa !important;}#'+tblId+' .sinr-c-gtcol{background:#ddeaf7 !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;}#'+tblId+' tr.ppt-total-row .sinr-c-gtcol{background:#c8ddf0 !important;color:var(--blue-dark) !important;}</style>');
// 			}
// 			var hdr1 = '<tr class="cb-thead-main"><th rowspan="2" style="min-width:220px;text-align:left !important;vertical-align:middle;position:sticky;left:0;z-index:55 !important;top:0;background:var(--blue-mid) !important;">Expense Category</th>';
// 			entries.forEach(function (e) { hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;">' + (e.label || '').trim() + '</th>'; });
// 			hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;background:var(--blue-dark) !important;border:1.5px solid #001f3f !important;">Grand Total</th></tr>';
// 			var hdr2 = '<tr class="cb-thead-sub">';
// 			entries.forEach(function () { hdr2 += '<th style="min-width:120px;text-align:center !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;">' + aLbl + '</th>'; });
// 			hdr2 += '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + aLbl + '</th></tr>';
// 			var bodyHtml = '', gtBudget = 0, gtActual = 0;
// 			shNames.forEach(function (shName) {
// 				var rowBudget = 0, rowActual = 0, cells = '';
// 				entries.forEach(function (e) { var bp = shPlan(e, shName), ba = shAct(e, shName); rowBudget += bp; rowActual += ba; cells += '<td>' + fmtCrDash(bp) + '</td><td>' + fmtCrDash(ba) + '</td>'; });
// 				gtBudget += rowBudget; gtActual += rowActual;
// 				bodyHtml += '<tr><td>' + shName + '</td>' + cells + '<td class="sinr-c-gtcol" style="font-weight:700;">' + fmtCrDash(rowBudget) + '</td><td class="sinr-c-gtcol" style="font-weight:700;">' + fmtCrDash(rowActual) + '</td></tr>';
// 			});
// 			var totalCells = '', totalBudget = 0, totalActual = 0;
// 			entries.forEach(function (e) { var bp = opexTotal(e, 'plan'), ba = opexTotal(e, 'act'); totalBudget += bp; totalActual += ba; totalCells += '<td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(bp) + '</td><td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(ba) + '</td>'; });
// 			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells + '<td class="sinr-c-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalBudget) + '</td><td class="sinr-c-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalActual) + '</td></tr>';
// 			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="' + tblId + '" class="cb-table"><thead>' + hdr1 + hdr2 + '</thead><tbody>' + bodyHtml + '</tbody></table></div>';
// 		}

// 		function tableHtmlD(entries, pLbl, aLbl) {
// 			if (!entries || !entries.length) { return ''; }
// 			function isCapex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('CAPITAL') !== -1; }
// 			var itemNames = [], itemSeen = {};
// 			entries.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (!isCapex(s.name)) { return; } (s.items || []).forEach(function (item) { var n = (item.name || '').trim(); if (n && !itemSeen[n]) { itemSeen[n] = true; itemNames.push(n); } }); }); });
// 			if (!itemNames.length) { return ''; }
// 			function itemPlan(e, itemName) { var v = 0; (e.actuals || []).forEach(function (s) { if (!isCapex(s.name)) { return; } (s.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); } }); }); return v; }
// 			function itemAct(e, itemName)  { var v = 0; (e.actuals || []).forEach(function (s) { if (!isCapex(s.name)) { return; } (s.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.total_posted_amt_ytd || item.total_posted_amt || 0); } }); }); return v; }
// 			function capexTotal(e, field)  { var v = 0; (e.actuals || []).forEach(function (s) { if (isCapex(s.name)) { v += parseFloat(field === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); } }); return v; }
// 			var tblId = 'sinr-table-d';
// 			if (!$('#sinr-d-style').length) {
// 				$('head').append('<style id="sinr-d-style">#'+tblId+'{border-collapse:collapse !important;width:100%;}#'+tblId+' th,#'+tblId+' td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;}#'+tblId+' thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);border:1.5px solid var(--bdh) !important;position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}#'+tblId+' thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);border:1.5px solid var(--bdo) !important;position:sticky;z-index:24;text-align:center !important;min-width:120px;padding:8px 12px;}#'+tblId+' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:55 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:220px;vertical-align:middle;}#'+tblId+' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:220px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1.5px solid var(--bdl) !important;}#'+tblId+' .sinr-d-gtcol{background:#ddeaf7 !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;}#'+tblId+' tr.ppt-total-row .sinr-d-gtcol{background:#c8ddf0 !important;color:var(--blue-dark) !important;}</style>');
// 			}
// 			var hdr1 = '<tr class="cb-thead-main"><th rowspan="2" style="min-width:220px;text-align:left !important;vertical-align:middle;position:sticky;left:0;z-index:55 !important;top:0;background:var(--blue-mid) !important;">Expense Category</th>';
// 			entries.forEach(function (e) { hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;">' + (e.label || '').trim() + '</th>'; });
// 			hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;background:var(--blue-dark) !important;border:1.5px solid #001f3f !important;">Grand Total</th></tr>';
// 			var hdr2 = '<tr class="cb-thead-sub">';
// 			entries.forEach(function () { hdr2 += '<th style="min-width:120px;text-align:center !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;">' + aLbl + '</th>'; });
// 			hdr2 += '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + aLbl + '</th></tr>';
// 			var bodyHtml = '';
// 			itemNames.forEach(function (itemName) {
// 				var rowBudget = 0, rowActual = 0, cells = '';
// 				entries.forEach(function (e) { var bp = itemPlan(e, itemName), ba = itemAct(e, itemName); rowBudget += bp; rowActual += ba; cells += '<td>' + fmtCrDash(bp) + '</td><td>' + fmtCrDash(ba) + '</td>'; });
// 				bodyHtml += '<tr><td>' + itemName + '</td>' + cells + '<td class="sinr-d-gtcol" style="font-weight:700;">' + fmtCrDash(rowBudget) + '</td><td class="sinr-d-gtcol" style="font-weight:700;">' + fmtCrDash(rowActual) + '</td></tr>';
// 			});
// 			var totalCells = '', totalBudget = 0, totalActual = 0;
// 			entries.forEach(function (e) { var bp = capexTotal(e, 'plan'), ba = capexTotal(e, 'act'); totalBudget += bp; totalActual += ba; totalCells += '<td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(bp) + '</td><td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(ba) + '</td>'; });
// 			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells + '<td class="sinr-d-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalBudget) + '</td><td class="sinr-d-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalActual) + '</td></tr>';
// 			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="' + tblId + '" class="cb-table"><thead>' + hdr1 + hdr2 + '</thead><tbody>' + bodyHtml + '</tbody></table></div>';
// 		}

// 		function tableHtmlE(entries, pLbl, aLbl) {
// 			if (!entries || !entries.length) { return ''; }
// 			function isOpex(name)      { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1; }
// 			function isOtherOpex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OTHER OPERATING') !== -1; }
// 			function getItemPlan(e, itemName) { var v = 0; (e.actuals || []).forEach(function (s) { if (isOtherOpex(s.name)) { (s.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); } }); } if (isOpex(s.name) && !isOtherOpex(s.name)) { (s.sub_heads || []).forEach(function (sh) { if (!isOtherOpex(sh.name)) { return; } (sh.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); } }); }); } }); return v; }
// 			function getItemAct(e, itemName)  { var v = 0; (e.actuals || []).forEach(function (s) { if (isOtherOpex(s.name)) { (s.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.total_posted_amt_ytd || item.total_posted_amt || 0); } }); } if (isOpex(s.name) && !isOtherOpex(s.name)) { (s.sub_heads || []).forEach(function (sh) { if (!isOtherOpex(sh.name)) { return; } (sh.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.total_posted_amt_ytd || item.total_posted_amt || 0); } }); }); } }); return v; }
// 			function getSectionTotal(e, field) { var v = 0; (e.actuals || []).forEach(function (s) { if (isOtherOpex(s.name)) { v += parseFloat(field === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); } if (isOpex(s.name) && !isOtherOpex(s.name)) { (s.sub_heads || []).forEach(function (sh) { if (!isOtherOpex(sh.name)) { return; } v += parseFloat(field === 'plan' ? (sh.ytd || 0) : (sh.total_posted_amt_ytd || 0)); }); } }); return v; }
// 			var itemNames = [], itemSeen = {};
// 			entries.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (isOtherOpex(s.name)) { (s.items || []).forEach(function (item) { var n = (item.name || '').trim(); if (n && !itemSeen[n]) { itemSeen[n] = true; itemNames.push(n); } }); } if (isOpex(s.name) && !isOtherOpex(s.name)) { (s.sub_heads || []).forEach(function (sh) { if (!isOtherOpex(sh.name)) { return; } (sh.items || []).forEach(function (item) { var n = (item.name || '').trim(); if (n && !itemSeen[n]) { itemSeen[n] = true; itemNames.push(n); } }); }); } }); });
// 			if (!itemNames.length) { return ''; }
// 			var tblId = 'sinr-table-e';
// 			if (!$('#sinr-e-style').length) {
// 				$('head').append('<style id="sinr-e-style">#'+tblId+'{border-collapse:collapse !important;width:100%;}#'+tblId+' th,#'+tblId+' td{border:1.5px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;}#'+tblId+' thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);border:1.5px solid var(--bdh) !important;position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}#'+tblId+' thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);border:1.5px solid var(--bdo) !important;position:sticky;z-index:24;text-align:center !important;min-width:120px;padding:8px 12px;}#'+tblId+' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:55 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:220px;vertical-align:middle;}#'+tblId+' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:220px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1.5px solid var(--bdl) !important;}#'+tblId+' tbody tr.ppt-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:700 !important;}#'+tblId+' .sinr-e-gtcol{background:#ddeaf7 !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;}#'+tblId+' tr.ppt-total-row .sinr-e-gtcol{background:#c8ddf0 !important;color:var(--blue-dark) !important;}</style>');
// 			}
// 			var hdr1 = '<tr class="cb-thead-main"><th rowspan="2" style="min-width:220px;text-align:left !important;vertical-align:middle;position:sticky;left:0;z-index:55 !important;top:0;background:var(--blue-mid) !important;">Expense Category</th>';
// 			entries.forEach(function (e) { hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;">' + (e.label || '').trim() + '</th>'; });
// 			hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;background:var(--blue-dark) !important;border:1.5px solid #001f3f !important;">Grand Total</th></tr>';
// 			var hdr2 = '<tr class="cb-thead-sub">';
// 			entries.forEach(function () { hdr2 += '<th style="min-width:120px;text-align:center !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;">' + aLbl + '</th>'; });
// 			hdr2 += '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1.5px solid #001f3f !important;">' + aLbl + '</th></tr>';
// 			var bodyHtml = '';
// 			itemNames.forEach(function (itemName) {
// 				var rowBudget = 0, rowActual = 0, cells = '';
// 				entries.forEach(function (e) { var bp = getItemPlan(e, itemName), ba = getItemAct(e, itemName); rowBudget += bp; rowActual += ba; cells += '<td>' + fmtCrDash(bp) + '</td><td>' + fmtCrDash(ba) + '</td>'; });
// 				bodyHtml += '<tr><td>' + itemName + '</td>' + cells + '<td class="sinr-e-gtcol" style="font-weight:700;">' + fmtCrDash(rowBudget) + '</td><td class="sinr-e-gtcol" style="font-weight:700;">' + fmtCrDash(rowActual) + '</td></tr>';
// 			});
// 			var totalCells = '', totalBudget = 0, totalActual = 0;
// 			entries.forEach(function (e) { var bp = getSectionTotal(e, 'plan'), ba = getSectionTotal(e, 'act'); totalBudget += bp; totalActual += ba; totalCells += '<td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(bp) + '</td><td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(ba) + '</td>'; });
// 			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells + '<td class="sinr-e-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalBudget) + '</td><td class="sinr-e-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalActual) + '</td></tr>';
// 			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="' + tblId + '" class="cb-table"><thead>' + hdr1 + hdr2 + '</thead><tbody>' + bodyHtml + '</tbody></table></div>';
// 		}

// 		function load(fy) {
// 			var $tab = $('#tab-summary_inr');
// 			$tab.html('<div style="padding:20px;text-align:center;color:#aaa;">Loading\u2026</div>');
// 			Loader.show('Building Summary in INR');

// 			var fp = (fy || '2025-26').split('-');
// 			var pLbl   = fy + ' Budget';
// 			var prevFY = (parseInt(fp[0], 10) - 1) + '-' + String(parseInt(fp[1], 10) - 1).padStart(2, '0');
// 			var aLbl   = prevFY + ' Est';
// 			var prevYear = String(parseInt(fp[0], 10) - 1);   // e.g. "2025" for FY 2025-26

// 			// All 4 APIs go through DataCache — shared with other tabs where applicable
// 			Promise.all([
// 				DataCache.get('unitWisePlanSummary', fy, function(res,rej){Fetchers.unitWisePlanSummary(fy,res,rej);}, []),
// 				DataCache.get('headcount', fy, function(res,rej){Fetchers.headcount(fy,res,rej);}, {headcount_data:[],plan_data:[]}),
// 				DataCache.get('consolidatedReport', fy, function(res,rej){Fetchers.consolidatedReport(fy,res,rej);}, []),
// 				DataCache.get('groupedActuals', prevYear, function(res,rej){Fetchers.groupedActuals(prevYear,res,rej);}, [])
// 			]).then(function (results) {
// 				Loader.hide();
// 				var uwpData          = results[0];
// 				var hcResult         = results[1];
// 				var consolidatedPlan = results[2];
// 				var prevActual       = results[3];

// 				var hcRecords  = hcResult.headcount_data || [];
// 				var hcPlanData = hcResult.plan_data      || [];

// 				if (!uwpData.length) {
// 					$tab.html('<div style="padding:40px;text-align:center;color:#aaa;">No data available.</div>');
// 					return;
// 				}

// 				Store.summaryInr = uwpData;

// 				var eB = uwpData.filter(function (e) {
// 					return e.is_this_sub_item === 0 && e.sequence_id !== 9999
// 						&& (e.table_name || '').toUpperCase() !== 'CONSOLIDATED';
// 				}).sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });

// 				var ctVals = getConsolidatedTotals(uwpData);

// 				// Headcount closing & average
// 				var hcClosingAvgHtml = '';
// 				if (hcRecords && hcRecords.length) {
// 					var hcSorted = hcRecords.filter(function (r) { return !!r.financial_year; })
// 						.slice().sort(function (a, b) { return (a.financial_year || '').localeCompare(b.financial_year || ''); });
// 					var hcYrs = hcSorted.map(function (r) { return r.financial_year; });
// 					var hcTotals = {};
// 					hcSorted.forEach(function (r) {
// 						var v = parseFloat(r.total_head_count || r.total_headcount || r.headcount || 0);
// 						if (r.financial_year) { hcTotals[r.financial_year] = v; }
// 					});
// 					if (hcYrs.length > 0) { hcClosingAvgHtml = buildClosingAvgTable(hcYrs, hcTotals); }
// 				}

// 				var rowsA  = buildRowsA(uwpData);
// 				var ocHtml = tableHtmlOpexCapex(rowsA, pLbl, aLbl);

// 				// CPE: use hcPlanData if available, else fall back to uwpData
// 				var cpeSource = (hcPlanData && hcPlanData.length) ? hcPlanData : uwpData;
// 				var cpeHtml   = tableHtmlCPE(cpeSource, hcRecords, fy, pLbl, aLbl);

// 				// Quarter Phasing — uses consolidatedPlan (current) + prevActual (previous FY)
// 				var qpHtml = tableHtmlQuarterPhasing(fy, consolidatedPlan, prevFY, prevActual);

// 				$tab.html(
// 					'<div style="padding:4px 0 10px;">' +
// 					'<div style="display:flex;justify-content:flex-end;margin-bottom:10px;">' + xlBtn('xl-summary-inr', 'Export to Excel') + '</div>' +

// 					'<div class="sinr-section-label">A. Unit Wise Plan</div>' +
// 					tableHtmlA(rowsA, pLbl, aLbl) +

// 					'<div class="sinr-section-label" style="margin-top:24px;">B. Breakdown of Unit Wise Plan</div>' +
// 					'<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
// 					tableHtmlB(eB, getSubNames(eB), pLbl, aLbl, ctVals) +

// 					'<div class="sinr-section-label" style="margin-top:18px;">C. Opex vs. Capex</div>' +
// 					ocHtml +

// 					(hcClosingAvgHtml ? '<div class="sinr-section-label" style="margin-top:18px;">D. Headcount - Closing &amp; Average</div>' + hcClosingAvgHtml : '') +

// 					cpeHtml +

// 					'<div class="sinr-section-label" style="margin-top:18px;">F. Other Operating Expenses</div>' +
// 					'<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
// 					tableHtmlE(eB, pLbl, aLbl) +

// 					'<div class="sinr-section-label" style="margin-top:18px;">G. Quarter Phasing</div>' +
// 					'<div class="sinr-currency-note" style="text-align:right;margin-bottom:4px;">&#8377; <strong>Cr.</strong></div>' +
// 					qpHtml +

// 					'<div class="sinr-section-label" style="margin-top:18px;">H. Capital Expenditure</div>' +
// 					'<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
// 					tableHtmlD(eB, pLbl, aLbl) +

// 					'</div>'
// 				);

// 				fixStickySubHeader('#sinr-table-a');

// 				(function tryFixCPE(n) {
// 					var $t = $('#sinr-cpe-table'); if (!$t.length) { return; }
// 					var $r1=$t.find('thead tr.cb-thead-main'), $r2=$t.find('thead tr.cb-thead-sub'), $r3=$t.find('thead tr.cb-thead-sub2');
// 					var h1=$r1.length?($r1[0].getBoundingClientRect().height||$r1.outerHeight(true)||0):0;
// 					var h2=$r2.length?($r2[0].getBoundingClientRect().height||$r2.outerHeight(true)||0):0;
// 					if(h1>0&&h2>0){$r2.find('th').css('top',h1+'px');$r3.find('th').css('top',(h1+h2)+'px');}
// 					else if(n<12){setTimeout(function(){tryFixCPE(n+1);},60);}
// 				})(0);

// 				['#sinr-table-c','#sinr-table-d','#sinr-table-e'].forEach(function(sel){
// 					(function tryFix(n){ var $t=$(sel); if(!$t.length){return;} var $m=$t.find('thead tr.cb-thead-main'); var h=$m.length?($m[0].getBoundingClientRect().height||$m.outerHeight(true)||0):0; if(h>0){$t.find('thead tr.cb-thead-sub th').css('top',h+'px');}else if(n<12){setTimeout(function(){tryFix(n+1);},60);} })(0);
// 				});

// 				(function retrySinrB(n){ var $b=$('#sinr-table-b'); if(!$b.length){return;} var rows=$b.find('thead tr'),ok=true; rows.each(function(){if(!$(this).outerHeight(true)){ok=false;}}); if(!ok&&n<10){setTimeout(function(){retrySinrB(n+1);},50);return;} var top=0; rows.each(function(){$(this).find('th').css('top',top+'px');top+=$(this).outerHeight(true)||40;}); })(0);

// 			}).catch(function () {
// 				Loader.hide();
// 				$tab.html('<div style="padding:40px;text-align:center;color:red;">Error loading Summary in INR data.</div>');
// 			});
// 		}

// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// HEADCOUNT MODULE  — reuses 'headcount' cache entry
// 	// =============================================================================

// 	var Headcount = (function () {
// 		function fmtHC(v) { if (v === null || v === undefined) { return '-'; } var n = parseFloat(v); return isNaN(n) ? '-' : Math.round(n).toLocaleString('en-IN'); }
// 		function fmtOpex(v) { if (v === null || v === undefined) { return '-'; } var n = parseFloat(v); return isNaN(n) ? '-' : fmtCr(n * 10000000); }
// 		function fmtPctHC(a, b) { a = parseFloat(a); b = parseFloat(b); if (!a || isNaN(a) || isNaN(b)) { return '-'; } return Math.round(((b / a) - 1) * 100) + '%'; }
// 		function norm(s) { return (s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
// 		function hcSec(txt) { return '<div class="hc-section-title">' + txt + '</div>'; }
// 		function swrap(inner) { return '<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' + inner + '</div>'; }
// 		function buildOpexMap(pd) {
// 			var map = {};
// 			(pd || []).forEach(function (p) {
// 				var op = null;
// 				(p.actuals || []).forEach(function (a) { if ((a.name || '').trim() === 'OPERATING  EXPENSES') { op = a; } });
// 				map[norm(p.label || '')] = { est: op ? parseFloat(op.total_posted_amt_ytd || 0) / 10000000 : 0, plan: op ? parseFloat(op.ytd || 0) / 10000000 : 0 };
// 			});
// 			return map;
// 		}
// 		function transform(records) {
// 			var sorted = (records || []).slice().sort(function (a, b) { return (a.financial_year || '').localeCompare(b.financial_year || ''); });
// 			var yrs = sorted.map(function (r) { return r.financial_year || ''; });
// 			var um = {};
// 			sorted.forEach(function (rec) {
// 				(rec.units || []).forEach(function (u) {
// 					var id = String(u.unit || u.unit_id || '');
// 					if (!um[id]) { um[id] = { description: '', hc: {}, seq: parseInt(id, 10) || 0 }; }
// 					um[id].hc[rec.financial_year] = parseFloat(u.total_headcount) || 0;
// 					if (rec.financial_year === yrs[yrs.length - 1]) { um[id].description = (u.unit_description || u.description || '').trim(); }
// 				});
// 			});
// 			var units = Object.keys(um).sort(function (a, b) { return (um[a].seq || 0) - (um[b].seq || 0); }).map(function (id) { return um[id]; });
// 			var totals = {};
// 			sorted.forEach(function (r) { totals[r.financial_year] = parseFloat(r.total_head_count || r.total_headcount || 0); });
// 			return { yrs: yrs, units: units, totals: totals };
// 		}
// 		function avgHC(u, yrs, i) { if (i === 0) { var c = u.hc[yrs[0]]; return c !== undefined ? c / 2 : null; } var p = u.hc[yrs[i-1]], c = u.hc[yrs[i]]; return (p !== undefined && c !== undefined) ? (p + c) / 2 : null; }
// 		function avgTot(tot, yrs, i) { if (i === 0) { var c = tot[yrs[0]]; return c !== undefined ? c / 2 : null; } var p = tot[yrs[i-1]], c = tot[yrs[i]]; return (p !== undefined && c !== undefined) ? (p + c) / 2 : null; }
// 		function gtable(hdrs, rows) {
// 			return swrap('<table class="cb-table" style="width:100%;"><thead><tr class="cb-thead-main"><th style="text-align:left !important;min-width:220px;">Unit</th>' +
// 				hdrs.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>');
// 		}

// 		function load(fy) {
// 			var $tab = $('#tab-headcount');
// 			$tab.html('<div style="padding:40px;text-align:center;color:#aaa;">Loading\u2026</div>');
// 			Loader.show('Generating workforce summary\u2026');

// 			// Reuse headcount cache — same key as SummaryINR
// 			DataCache.get('headcount', fy, function(res,rej){Fetchers.headcount(fy,res,rej);}, {headcount_data:[],plan_data:[]}).then(function (hcResult) {
// 				Loader.hide();
// 				var records  = hcResult.headcount_data || [];
// 				var planData = hcResult.plan_data      || [];

// 				if (!records.length) { $tab.html('<div style="padding:40px;text-align:center;color:#aaa;">No headcount data available.</div>'); return; }
// 				Store.headcount = records;
// 				var om = buildOpexMap(planData), t = transform(records);
// 				var yrs = t.yrs, units = t.units, totals = t.totals;
// 				var i1 = yrs.length - 2, i2 = yrs.length - 1;

// 				var totEst = 0, totPlan = 0, sRows = '';
// 				units.forEach(function (u) {
// 					var a1 = avgHC(u, yrs, i1), a2 = avgHC(u, yrs, i2);
// 					var o = om[norm(u.description)] || { est: 0, plan: 0 };
// 					totEst += o.est; totPlan += o.plan;
// 					sRows += '<tr><td style="text-align:left;">' + u.description + '</td><td>' + fmtHC(a1) + '</td><td>' + fmtHC(a2) + '</td><td>' + fmtPctHC(a1, a2) + '</td><td>' + fmtOpex(o.est) + '</td><td>' + fmtOpex(o.plan) + '</td><td>' + fmtPctHC(o.est, o.plan) + '</td></tr>';
// 				});
// 				var ta1 = avgTot(totals, yrs, i1), ta2 = avgTot(totals, yrs, i2);
// 				sRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td><td>' + fmtHC(ta1) + '</td><td>' + fmtHC(ta2) + '</td><td>' + fmtPctHC(ta1, ta2) + '</td><td>' + fmtOpex(totEst) + '</td><td>' + fmtOpex(totPlan) + '</td><td>' + fmtPctHC(totEst, totPlan) + '</td></tr>';
// 				var sumHtml = swrap('<table class="cb-table" style="width:100%;"><thead><tr class="cb-thead-main"><th rowspan="2" style="text-align:left !important;min-width:200px;">Unit</th><th colspan="3" style="text-align:center !important;">Average H/C</th><th colspan="3" style="text-align:center !important;">Opex Spend (&#8377; Cr.)</th></tr><tr class="cb-thead-sub"><th>' + (yrs[i1] || '') + '</th><th>' + (yrs[i2] || '') + '</th><th>%</th><th>' + (yrs[i1] || '') + ' Est</th><th>' + (yrs[i2] || '') + ' Plan</th><th>%</th></tr></thead><tbody>' + sRows + '</tbody></table>');

// 				var cRows = '', aRows = '';
// 				units.forEach(function (u) {
// 					cRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.map(function (y) { return '<td>' + fmtHC(u.hc[y] !== undefined ? u.hc[y] : null) + '</td>'; }).join('') + '</tr>';
// 					aRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.map(function (y, i) { return '<td>' + fmtHC(avgHC(u, yrs, i)) + '</td>'; }).join('') + '</tr>';
// 				});
// 				cRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + yrs.map(function (y) { return '<td>' + fmtHC(totals[y] || 0) + '</td>'; }).join('') + '</tr>';
// 				aRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + yrs.map(function (y, i) { return '<td>' + fmtHC(avgTot(totals, yrs, i)) + '</td>'; }).join('') + '</tr>';

// 				var pHdrs = [], cpRows = '', apRows = '';
// 				if (yrs.length >= 2) {
// 					pHdrs = yrs.slice(1).map(function (y, i) { return yrs[i] + ' &#8594; ' + y; });
// 					units.forEach(function (u) {
// 						cpRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.slice(1).map(function (y, i) { return '<td>' + fmtPctHC(u.hc[yrs[i]], u.hc[y]) + '</td>'; }).join('') + '</tr>';
// 						apRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.slice(1).map(function (y, i) { return '<td>' + fmtPctHC(avgHC(u, yrs, i), avgHC(u, yrs, i + 1)) + '</td>'; }).join('') + '</tr>';
// 					});
// 					cpRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + yrs.slice(1).map(function (y, i) { return '<td>' + fmtPctHC(totals[yrs[i]], totals[y]) + '</td>'; }).join('') + '</tr>';
// 					var tpc = ''; for (var ii = 1; ii < yrs.length; ii++) { tpc += '<td>' + fmtPctHC(avgTot(totals, yrs, ii - 1), avgTot(totals, yrs, ii)) + '</td>'; }
// 					apRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + tpc + '</tr>';
// 				}

// 				$tab.html(
// 					'<div style="padding:4px 0 10px;">' +
// 					'<div style="display:flex;justify-content:flex-end;margin-bottom:10px;">' + xlBtn('xl-headcount', 'Export to Excel') + '</div>' +
// 					hcSec('Headcount Summary') +
// 					'<div class="ppt-currency-label" style="text-align:left;margin-bottom:6px;">H/C numbers &nbsp;|&nbsp; Opex in &#8377; <strong>Cr.</strong></div>' +
// 					sumHtml +
// 					hcSec('Closing H/C') + gtable(yrs, cRows) +
// 					hcSec('Average H/C') + gtable(yrs, aRows) +
// 					(yrs.length >= 2 ? hcSec('Increase in Closing H/C (%)') + gtable(pHdrs, cpRows) : '') +
// 					(yrs.length >= 2 ? hcSec('Increase in Average H/C (%)') + gtable(pHdrs, apRows) : '') +
// 					'</div>'
// 				);
// 				$tab.find('.cb-table').each(function () { fixStickySubHeader(this); });

// 			}).catch(function () {
// 				Loader.hide();
// 				$tab.html('<div style="padding:40px;text-align:center;color:red;">Error loading headcount data.</div>');
// 			});
// 		}
// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// ANNUAL BUDGET MODULE  — reuses 'consolidatedReport' cache
// 	// =============================================================================

// 	var Annual = (function () {
// 		var Q_DEFS = { q1:{label:'Quarter 1',months:['April','May','June']}, q2:{label:'Quarter 2',months:['July','August','September']}, q3:{label:'Quarter 3',months:['October','November','December']}, q4:{label:'Quarter 4',months:['January','February','March']} };
// 		var Q_KEYS = ['q1','q2','q3','q4'];
// 		var data=[], expandedQ=[], openH={}, openS={}, bound=false;
// 		function sumArr(a){ var t=0; (a||[]).forEach(function(v){t+=(v||0);}); return t; }
// 		function objTotal(o){ var t=0; Q_KEYS.forEach(function(k){t+=sumArr(o[k]);}); return t; }
// 		function qCells(obj){ var html=''; Q_KEYS.forEach(function(k){ var vals=obj[k]||[0,0,0]; if(expandedQ.indexOf(k)!==-1){vals.forEach(function(v){html+='<td>'+formatINR(v)+'</td>';});}else{html+='<td colspan="3">'+formatINR(sumArr(vals))+'</td>';} }); return html; }
// 		function buildHeader(){ var $t=$('#annual-table thead').empty(),$m=$('<tr class="cb-thead-main"></tr>'); $m.append('<th rowspan="2" style="min-width:220px;text-align:left !important;">Expense Head / Line Item</th>'); Q_KEYS.forEach(function(k){var o=expandedQ.indexOf(k)!==-1; $m.append('<th class="cb-q-header" data-quarter="'+k+'" colspan="3" rowspan="'+(o?1:2)+'" style="cursor:pointer;">'+Q_DEFS[k].label+' '+(o?'\u25b2':'\u25bc')+'</th>');}); $m.append('<th rowspan="2" style="min-width:110px;">Total</th>'); $t.append($m); if(expandedQ.length){var $s=$('<tr class="cb-thead-sub"></tr>'); Q_KEYS.forEach(function(k){if(expandedQ.indexOf(k)!==-1){Q_DEFS[k].months.forEach(function(m){$s.append('<th>'+m+'</th>');});}}); $t.append($s);} fixStickySubHeader('#annual-table'); }
// 		function matchSearch(head,term){ if(!term){return true;} if(head.name.toLowerCase().indexOf(term)!==-1){return true;} for(var s=0;s<(head.sub_heads||[]).length;s++){if(head.sub_heads[s].name.toLowerCase().indexOf(term)!==-1){return true;}for(var i=0;i<(head.sub_heads[s].items||[]).length;i++){if((head.sub_heads[s].items[i].name||'').toLowerCase().indexOf(term)!==-1){return true;}}} for(var d=0;d<(head.items||[]).length;d++){if((head.items[d].name||'').toLowerCase().indexOf(term)!==-1){return true;}} return false; }
// 		function renderTable(){ buildHeader(); var $tb=$('#annual-table tbody').empty(), term=$('#annual-search').val().trim().toLowerCase(); var grand={q1:[0,0,0],q2:[0,0,0],q3:[0,0,0],q4:[0,0,0]}; data.forEach(function(head,hi){ if(term&&!matchSearch(head,term)){return;} var hs=String(hi),ho=openH[hs]===true; Q_KEYS.forEach(function(k){(head[k]||[0,0,0]).forEach(function(v,mi){grand[k][mi]+=(v||0);});}); $tb.append('<tr class="cb-row-head cb-annual-head" data-hi="'+hs+'"><td><span class="cb-arrow">'+(ho?'\u25bc':'\u25b6')+'</span> '+head.name.trim()+'</td>'+qCells(head)+'<td class="cb-text-accent">'+formatINR(objTotal(head))+'</td></tr>'); (head.sub_heads||[]).forEach(function(sub,si){ var sk=hs+'-'+si,so=openS[sk]===true; $tb.append('<tr class="cb-row-sub cb-annual-sub" data-hi="'+hs+'" data-si="'+si+'" style="'+(ho?'':'display:none;')+'"><td style="padding-left:22px;"><span class="cb-arrow">'+(so?'\u25bc':'\u25b6')+'</span> '+sub.name+'</td>'+qCells(sub)+'<td>'+formatINR(objTotal(sub))+'</td></tr>'); (sub.items||[]).forEach(function(item){$tb.append('<tr class="cb-annual-sub-item" data-hi="'+hs+'" data-si="'+si+'" style="'+((ho&&so)?'':'display:none;')+'"><td style="padding-left:42px;">'+item.name+'</td>'+qCells(item)+'<td>'+formatINR(objTotal(item))+'</td></tr>');}); }); (head.items||[]).forEach(function(d){$tb.append('<tr class="cb-annual-head-item" data-hi="'+hs+'" style="'+(ho?'':'display:none;')+'"><td style="padding-left:35px;">'+d.name+'</td>'+qCells(d)+'<td>'+formatINR(objTotal(d))+'</td></tr>');}); }); var gt=0; Q_KEYS.forEach(function(k){gt+=sumArr(grand[k]);}); $tb.append('<tr class="cb-row-grand"><td>GRAND TOTAL</td>'+qCells(grand)+'<td>'+formatINR(gt)+'</td></tr>'); fixStickySubHeader('#annual-table'); }
// 		function toggleHead(hs){openH[hs]=!(openH[hs]===true);if(!openH[hs]){data.forEach(function(h,hi){if(String(hi)!==hs){return;}(h.sub_heads||[]).forEach(function(_,si){openS[hs+'-'+si]=false;});});}renderTable();}
// 		function toggleSub(hs,ss){openS[hs+'-'+ss]=!(openS[hs+'-'+ss]===true);renderTable();}
// 		function bindEvents(){
// 			$(document).on('input.annual','#annual-search',function(){renderTable();});
// 			$(document).on('change.annual','#annual-expand-quarters',function(){expandedQ=this.checked?Q_KEYS.slice():[];renderTable();});
// 			$(document).on('change.annual','#annual-expand-items',function(){if(this.checked){data.forEach(function(h,hi){openH[String(hi)]=true;(h.sub_heads||[]).forEach(function(_,si){openS[hi+'-'+si]=true;});});}else{openH={};openS={};}renderTable();});
// 			$(document).on('click.annual','#annual-table .cb-q-header',function(){var k=String($(this).attr('data-quarter')),idx=expandedQ.indexOf(k);if(idx!==-1){expandedQ.splice(idx,1);}else{expandedQ.push(k);}$('#annual-expand-quarters').prop('checked',expandedQ.length===Q_KEYS.length);renderTable();});
// 			$('#tab-annual_budget').on('click.annual','.cb-annual-head',function(e){e.stopPropagation();toggleHead(String($(this).attr('data-hi')));});
// 			$('#tab-annual_budget').on('click.annual','.cb-annual-sub', function(e){e.stopPropagation();toggleSub(String($(this).attr('data-hi')),String($(this).attr('data-si')));});
// 		}
// 		function load(fy){
// 			if(!bound){bindEvents();bound=true;}
// 			data=[]; openH={}; openS={}; expandedQ=[];
// 			$('#annual-expand-quarters,#annual-expand-items').prop('checked',false);
// 			$('#annual-search').val('');
// 			Loader.show('Building Annual Budget\u2026');

// 			// Reuse the same consolidatedReport cache entry as SummaryINR quarter phasing
// 			DataCache.get('consolidatedReport', fy, function(res,rej){Fetchers.consolidatedReport(fy,res,rej);}, []).then(function(result){
// 				data = result || [];
// 				Store.annual = data;
// 				renderTable();
// 				Loader.hide();
// 			}).catch(function(){
// 				Loader.hide();
// 				frappe.msgprint('Error loading Annual Budget.');
// 			});
// 		}
// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// ESTIMATE MODULE  — reuses 'groupedActuals' cache
// 	// =============================================================================

// 	var Estimate = (function () {
// 		var Q_DEFS={q1:{label:'Quarter 1',months:['April','May','June']},q2:{label:'Quarter 2',months:['July','August','September']},q3:{label:'Quarter 3',months:['October','November','December']},q4:{label:'Quarter 4',months:['January','February','March']}};
// 		var Q_KEYS=['q1','q2','q3','q4'], Q_IDX={q1:[0,1,2],q2:[3,4,5],q3:[6,7,8],q4:[9,10,11]};
// 		var data=[], expandedQ=[], openH={}, openS={}, bound=false;
// 		function getMth(obj){var m=obj.months||{};return[parseFloat(m['4']||0),parseFloat(m['5']||0),parseFloat(m['6']||0),parseFloat(m['7']||0),parseFloat(m['8']||0),parseFloat(m['9']||0),parseFloat(m['10']||0),parseFloat(m['11']||0),parseFloat(m['12']||0),parseFloat(m['1']||0),parseFloat(m['2']||0),parseFloat(m['3']||0)];}
// 		function qTot(obj){return[parseFloat(obj['Q1']||0),parseFloat(obj['Q2']||0),parseFloat(obj['Q3']||0),parseFloat(obj['Q4']||0)];}
// 		function yTot(obj){var q=qTot(obj);return q[0]+q[1]+q[2]+q[3];}
// 		function qCells(obj){var mths=getMth(obj),qtots=qTot(obj),html='';Q_KEYS.forEach(function(q,qi){if(expandedQ.indexOf(q)!==-1){Q_IDX[q].forEach(function(mi){html+='<td>'+formatINR(mths[mi])+'</td>';});}else{html+='<td colspan="3">'+formatINR(qtots[qi])+'</td>';}});return html;}
// 		function buildHeader(){var $t=$('#estimate-table thead').empty(),$m=$('<tr class="cb-thead-main"></tr>');$m.append('<th rowspan="2" style="min-width:220px;text-align:left !important;">Expense</th>');Q_KEYS.forEach(function(k){var o=expandedQ.indexOf(k)!==-1;$m.append('<th class="est-q-toggle" data-q="'+k+'" colspan="3" rowspan="'+(o?1:2)+'" style="cursor:pointer;">'+Q_DEFS[k].label+' '+(o?'\u25b2':'\u25bc')+'</th>');});$m.append('<th rowspan="2" style="min-width:110px;">Total</th>');$t.append($m);if(expandedQ.length){var $s=$('<tr class="cb-thead-sub"></tr>');Q_KEYS.forEach(function(k){if(expandedQ.indexOf(k)!==-1){Q_DEFS[k].months.forEach(function(m){$s.append('<th>'+m+'</th>');});}});$t.append($s);}fixStickySubHeader('#estimate-table');}
// 		function matchSearch(head,term){if(!term){return true;}if(head.name.toLowerCase().indexOf(term)!==-1){return true;}for(var s=0;s<(head.sub_heads||[]).length;s++){if(head.sub_heads[s].name.toLowerCase().indexOf(term)!==-1){return true;}for(var i=0;i<(head.sub_heads[s].items||[]).length;i++){if((head.sub_heads[s].items[i].name||'').toLowerCase().indexOf(term)!==-1){return true;}}}for(var d=0;d<(head.items||[]).length;d++){if((head.items[d].name||'').toLowerCase().indexOf(term)!==-1){return true;}}return false;}
// 		function renderTable(){buildHeader();var $tb=$('#estimate-tbody').empty(),term=$('#estimate-search').val().trim().toLowerCase();if(!Array.isArray(data)||!data.length){$tb.append('<tr><td colspan="14" style="text-align:center;padding:40px;color:#aaa;">No data available.</td></tr>');return;}var gM=[0,0,0,0,0,0,0,0,0,0,0,0],gQ=[0,0,0,0];data.forEach(function(head,hi){if(term&&!matchSearch(head,term)){return;}getMth(head).forEach(function(v,i){gM[i]+=v;});qTot(head).forEach(function(v,i){gQ[i]+=v;});var hs=String(hi),ho=openH[hs];$tb.append('<tr class="cb-row-head cb-est-head" data-hi="'+hs+'"><td><span class="cb-arrow">'+(ho?'\u25bc':'\u25b6')+'</span> '+head.name+'</td>'+qCells(head)+'<td class="cb-text-accent">'+formatINR(yTot(head))+'</td></tr>');(head.items||[]).forEach(function(item){$tb.append('<tr class="cb-est-head-item" data-hi="'+hs+'" style="'+(ho?'':'display:none;')+'"><td style="padding-left:28px;">'+item.name+'</td>'+qCells(item)+'<td>'+formatINR(yTot(item))+'</td></tr>');});(head.sub_heads||[]).forEach(function(sub,si){var sk=hs+'-'+si,so=openS[sk];$tb.append('<tr class="cb-row-sub cb-est-sub" data-hi="'+hs+'" data-si="'+si+'" style="'+(ho?'':'display:none;')+'"><td style="padding-left:20px;"><span class="cb-arrow">'+(so?'\u25bc':'\u25b6')+'</span> '+sub.name+'</td>'+qCells(sub)+'<td>'+formatINR(yTot(sub))+'</td></tr>');(sub.items||[]).forEach(function(item){$tb.append('<tr class="cb-est-sub-item" data-hi="'+hs+'" data-si="'+si+'" style="'+((ho&&so)?'':'display:none;')+'"><td style="padding-left:44px;">'+item.name+'</td>'+qCells(item)+'<td>'+formatINR(yTot(item))+'</td></tr>');});});});var gO={Q1:gQ[0],Q2:gQ[1],Q3:gQ[2],Q4:gQ[3],months:{'4':gM[0],'5':gM[1],'6':gM[2],'7':gM[3],'8':gM[4],'9':gM[5],'10':gM[6],'11':gM[7],'12':gM[8],'1':gM[9],'2':gM[10],'3':gM[11]}};$tb.append('<tr class="cb-row-grand"><td>GRAND TOTAL</td>'+qCells(gO)+'<td>'+formatINR(gQ[0]+gQ[1]+gQ[2]+gQ[3])+'</td></tr>');fixStickySubHeader('#estimate-table');}
// 		function toggleHead(hs){var o=!openH[hs];openH[hs]=o;$('#estimate-table tbody .cb-est-head[data-hi="'+hs+'"]').find('.cb-arrow').text(o?'\u25bc':'\u25b6');if(o){$('#estimate-table tbody .cb-est-sub[data-hi="'+hs+'"]').show();$('#estimate-table tbody .cb-est-head-item[data-hi="'+hs+'"]').show();$('#estimate-table tbody .cb-est-sub[data-hi="'+hs+'"]').each(function(){var si=$(this).attr('data-si');if(openS[hs+'-'+si]){$('#estimate-table tbody .cb-est-sub-item[data-hi="'+hs+'"][data-si="'+si+'"]').show();}});}else{$('#estimate-table tbody .cb-est-sub[data-hi="'+hs+'"]').each(function(){var si=$(this).attr('data-si');openS[hs+'-'+si]=false;$(this).find('.cb-arrow').text('\u25b6');});$('#estimate-table tbody .cb-est-sub[data-hi="'+hs+'"],.cb-est-sub-item[data-hi="'+hs+'"],.cb-est-head-item[data-hi="'+hs+'"]').hide();}}
// 		function toggleSub(hs,ss){var sk=hs+'-'+ss,o=!openS[sk];openS[sk]=o;$('#estimate-table tbody .cb-est-sub[data-hi="'+hs+'"][data-si="'+ss+'"]').find('.cb-arrow').text(o?'\u25bc':'\u25b6');var $i=$('#estimate-table tbody .cb-est-sub-item[data-hi="'+hs+'"][data-si="'+ss+'"]');o?$i.show():$i.hide();}
// 		function bindEvents(){
// 			$(document).on('click.estimate','#estimate-table .est-q-toggle',function(){var k=String($(this).attr('data-q')),idx=expandedQ.indexOf(k);if(idx!==-1){expandedQ.splice(idx,1);}else{expandedQ.push(k);}$('#estimate-expand-quarters').prop('checked',expandedQ.length===Q_KEYS.length);renderTable();});
// 			$(document).on('change.estimate','#estimate-expand-quarters',function(){expandedQ=this.checked?Q_KEYS.slice():[];renderTable();});
// 			$(document).on('change.estimate','#estimate-expand-items',function(){if(this.checked){data.forEach(function(h,hi){openH[String(hi)]=true;(h.sub_heads||[]).forEach(function(_,si){openS[hi+'-'+si]=true;});});}else{openH={};openS={};}renderTable();});
// 			$('#tab-estimate').on('click.estimate','.cb-est-head',function(e){e.stopPropagation();toggleHead(String($(this).attr('data-hi')));});
// 			$('#tab-estimate').on('click.estimate','.cb-est-sub', function(e){e.stopPropagation();toggleSub(String($(this).attr('data-hi')),String($(this).attr('data-si')));});
// 			$(document).on('input.estimate','#estimate-search',function(){renderTable();});
// 		}
// 		function load(fy){
// 			if(!bound){bindEvents();bound=true;}
// 			data=[]; openH={}; openS={}; expandedQ=[];
// 			$('#estimate-expand-quarters,#estimate-expand-items').prop('checked',false);
// 			Loader.show('Building Estimate\u2026');

// 			// Estimate uses previous FY year string — same key as SummaryINR quarter phasing prev year
// 			var fp = (fy || '2025-26').split('-');
// 			var prevYear = String(parseInt(fp[0], 10) - 1);

// 			DataCache.get('groupedActuals', prevYear, function(res,rej){Fetchers.groupedActuals(prevYear,res,rej);}, []).then(function(result){
// 				data = result || [];
// 				Store.estimate = data;
// 				renderTable();
// 				Loader.hide();
// 			}).catch(function(){
// 				Loader.hide();
// 				frappe.msgprint('Server error loading Estimate data.');
// 			});
// 		}
// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// BUDGET & ESTIMATE MODULE  — uses dedicated unitWisePlanBE fetcher
// 	// =============================================================================

// 	var BudgetEstimate = (function () {
// 		var rawData=[], currentFY='', openSec={}, openSub={}, expandItems=false, bound=false;
// 		function pl(){return getFYLabels(currentFY).plan;}
// 		function el(){return getFYLabels(currentFY).est;}
// 		function isGT(sec){return sec.sequence_id===9999||(sec.name||'').toUpperCase().replace(/\s+/g,' ').trim()==='GRAND TOTAL';}
// 		function secVal(e,sn,f){var v=0;(e.actuals||[]).forEach(function(s){if(isGT(s)||s.name!==sn){return;}v+=parseFloat(f==='plan'?(s.ytd||0):(s.total_posted_amt_ytd||0));});return v;}
// 		function subVal(e,sn,subn,f){var v=0;(e.actuals||[]).forEach(function(s){if(isGT(s)||s.name!==sn){return;}(s.sub_heads||[]).forEach(function(sub){if(sub.name!==subn){return;}v+=parseFloat(f==='plan'?(sub.ytd||0):(sub.total_posted_amt_ytd||0));});});return v;}
// 		function itemVal(e,nm,f){var v=0;(e.actuals||[]).forEach(function(s){if(isGT(s)){return;}(s.items||[]).forEach(function(i){if(i.name===nm){v+=parseFloat(f==='plan'?(i.ytd||0):(i.total_posted_amt||0));}});(s.sub_heads||[]).forEach(function(sub){(sub.items||[]).forEach(function(i){if(i.name===nm){v+=parseFloat(f==='plan'?(i.ytd||0):(i.total_posted_amt||0));}});});});return v;}
// 		function grandVal(e,f){var gt=0,found=false;(e.actuals||[]).forEach(function(s){if(isGT(s)){gt+=parseFloat(f==='plan'?(s.ytd||0):(s.total_posted_amt_ytd||0));found=true;}});if(!found){(e.actuals||[]).forEach(function(s){gt+=parseFloat(f==='plan'?(s.ytd||0):(s.total_posted_amt_ytd||0));});}return gt;}
// 		function secTP(sn){var v=0;rawData.forEach(function(e){v+=secVal(e,sn,'plan');});return v;}
// 		function secTE(sn){var v=0;rawData.forEach(function(e){v+=secVal(e,sn,'est');});return v;}
// 		function subTP(sn,subn){var v=0;rawData.forEach(function(e){v+=subVal(e,sn,subn,'plan');});return v;}
// 		function subTE(sn,subn){var v=0;rawData.forEach(function(e){v+=subVal(e,sn,subn,'est');});return v;}
// 		function iTotP(n){var v=0;rawData.forEach(function(e){v+=itemVal(e,n,'plan');});return v;}
// 		function iTotE(n){var v=0;rawData.forEach(function(e){v+=itemVal(e,n,'est');});return v;}
// 		function allGP(){var v=0;rawData.forEach(function(e){v+=grandVal(e,'plan');});return v;}
// 		function allGE(){var v=0;rawData.forEach(function(e){v+=grandVal(e,'est');});return v;}
// 		function cellsPair(getP,getE){var h='';rawData.forEach(function(e){h+='<td>'+formatINR(getP(e))+'</td><td>'+formatINR(getE(e))+'</td>';});return h;}
// 		function tc2(plan,est,cls){cls=cls||'';return '<td class="be-total-plan '+cls+'" style="font-weight:700;">'+formatINR(plan)+'</td><td class="be-total-est '+cls+'" style="font-weight:700;">'+formatINR(est)+'</td>';}
// 		function buildStruct(){if(!rawData.length){return[];}return(rawData[0].actuals||[]).filter(function(s){return!isGT(s);}).map(function(s){return{name:s.name,sub_heads:(s.sub_heads||[]).map(function(sub){return{name:sub.name,items:(sub.items||[]).map(function(i){return{name:i.name};})};})};});}
// 		function buildHeader(){var $t=$('#be-table thead').empty(),$r1=$('<tr class="cb-thead-main"></tr>'),$r2=$('<tr class="cb-thead-sub"></tr>');$r1.append('<th rowspan="2" style="text-align:left !important;min-width:280px;position:sticky;left:0;z-index:50;background:#0076B6;vertical-align:middle;">Expense Head / Line Item</th>');rawData.forEach(function(e){$r1.append('<th colspan="2" style="text-align:center;min-width:260px;">'+(e.label||'').trim()+'</th>');});$r1.append('<th colspan="2" style="text-align:center;min-width:260px;background:#003B63;">Grand Total</th>');rawData.forEach(function(){$r2.append('<th style="text-align:center;min-width:130px;">'+pl()+'</th><th style="text-align:center;min-width:130px;">'+el()+'</th>');});$r2.append('<th style="text-align:center;min-width:130px;background:#004F8B;">'+pl()+'</th><th style="text-align:center;min-width:130px;background:#004F8B;">'+el()+'</th>');$t.append($r1).append($r2);fixStickySubHeader('#be-table');}
// 		function renderTable(){buildHeader();var $tb=$('#be-tbody').empty(),term=$('#be-search').val().trim().toLowerCase(),struct=buildStruct();if(!rawData.length||!struct.length){$tb.append('<tr><td colspan="'+(1+rawData.length*2+2)+'" style="text-align:center;padding:40px;color:#aaa;">No data available.</td></tr>');return;}struct.forEach(function(sec){var sn=sec.name,secOpen=openSec[sn]===true,secVis=secOpen?'':'display:none;';$tb.append('<tr class="cb-row-head be-sec-row" data-sec="'+sn+'"><td style="text-align:left;"><span class="cb-arrow">'+(secOpen?'\u25bc':'\u25b6')+'</span> '+sn+'</td>'+cellsPair(function(e){return secVal(e,sn,'plan');},function(e){return secVal(e,sn,'est');})+tc2(secTP(sn),secTE(sn),'be-grand-col')+'</tr>');sec.sub_heads.forEach(function(sub){var sk=sn+'::'+sub.name,subOpen=expandItems||(openSub[sk]===true),itmVis=(secOpen&&subOpen)?'':'display:none;';$tb.append('<tr class="cb-row-sub be-sec-child be-sub-row" data-sec="'+sn+'" data-sub="'+sk+'" style="'+secVis+'"><td style="padding-left:22px;text-align:left;"><span class="cb-arrow">'+(subOpen?'\u25bc':'\u25b6')+'</span> '+sub.name+'</td>'+cellsPair(function(e){return subVal(e,sn,sub.name,'plan');},function(e){return subVal(e,sn,sub.name,'est');})+tc2(subTP(sn,sub.name),subTE(sn,sub.name),'be-grand-col')+'</tr>');sub.items.forEach(function(item){if(term&&item.name.toLowerCase().indexOf(term)===-1){return;}$tb.append('<tr class="be-item-row be-sec-child be-sub-child" data-sec="'+sn+'" data-sub="'+sk+'" style="'+itmVis+'"><td style="padding-left:42px;text-align:left;">'+item.name+'</td>'+cellsPair(function(e){return itemVal(e,item.name,'plan');},function(e){return itemVal(e,item.name,'est');})+tc2(iTotP(item.name),iTotE(item.name),'be-grand-col')+'</tr>');});});});$tb.append('<tr class="cb-row-grand"><td style="text-align:left;">GRAND TOTAL</td>'+cellsPair(function(e){return grandVal(e,'plan');},function(e){return grandVal(e,'est');})+tc2(allGP(),allGE(),'be-grand-col')+'</tr>');fixStickySubHeader('#be-table');}
// 		function toggleSec(sn){var o=!(openSec[sn]===true);openSec[sn]=o;$('#be-table tbody .be-sec-row[data-sec="'+sn+'"]').find('.cb-arrow').text(o?'\u25bc':'\u25b6');var $ch=$('#be-table tbody .be-sec-child[data-sec="'+sn+'"]');if(o){$ch.filter('.be-sub-row').show();$ch.filter('.be-sub-child').each(function(){if(expandItems||openSub[$(this).attr('data-sub')]===true){$(this).show();}});}else{$ch.hide();}}
// 		function toggleSubRow(sk){var o=!(openSub[sk]===true);openSub[sk]=o;$('#be-table tbody .be-sub-row[data-sub="'+sk+'"]').find('.cb-arrow').text(o?'\u25bc':'\u25b6');var $it=$('#be-table tbody .be-sub-child[data-sub="'+sk+'"]');o?$it.show():$it.hide();}
// 		function bindEvents(){
// 			$('#tab-budget_estimate').on('click.be','.be-sec-row',function(e){e.stopPropagation();toggleSec($(this).attr('data-sec'));});
// 			$('#tab-budget_estimate').on('click.be','.be-sub-row',function(e){e.stopPropagation();if(!expandItems){toggleSubRow($(this).attr('data-sub'));}});
// 			$(document).on('change.be','#be-expand-items',function(){expandItems=this.checked;buildStruct().forEach(function(sec){openSec[sec.name]=expandItems;sec.sub_heads.forEach(function(sub){openSub[sec.name+'::'+sub.name]=expandItems;});});renderTable();});
// 			$(document).on('input.be','#be-search',function(){renderTable();});
// 		}
// 		function load(fy){
// 			if(!bound){bindEvents();bound=true;}
// 			currentFY=fy; rawData=[]; openSec={}; openSub={}; expandItems=false;
// 			$('#be-expand-items').prop('checked',false);
// 			Loader.show('Building Budget & Estimate\u2026');

// 			DataCache.get('unitWisePlanBE', fy, function(res,rej){Fetchers.unitWisePlanBE(fy,res,rej);}, []).then(function(d){
// 				Loader.hide();
// 				if(!d||!d.length){frappe.msgprint('No data returned for Budget & Estimate.');renderTable();return;}
// 				rawData = d.filter(function(e){
// 					return e.is_this_sub_item===0 && e.sequence_id!==9999 && (e.table_name||'').toUpperCase()!=='CONSOLIDATED';
// 				}).sort(function(a,b){return(a.sequence_id||0)-(b.sequence_id||0);});
// 				Store.budgetEstimate = rawData;
// 				renderTable();
// 			}).catch(function(){
// 				Loader.hide();
// 				frappe.msgprint('Server error loading Budget & Estimate data.');
// 			});
// 		}
// 		return { load: load };
// 	})();

// 	// =============================================================================
// 	// EXPORT WIRING
// 	// =============================================================================

// 	var API = 'annual_budget.api.export_reports';
// 	$(document).on('click','#xl-ppt',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.ppt.rows.length){frappe.msgprint('Please wait for the Foundation Metrics data to load first.');return;}serverExport(API+'.export_ppt',{financial_year:fy,ppt_rows:JSON.stringify(Store.ppt.rows),prev_ppt_rows:JSON.stringify(Store.ppt.prevRows),budget_label:Store.ppt.budgetLabel,est_label:Store.ppt.estLabel,prev_budget_label:Store.ppt.prevBudgetLabel,prev_est_label:Store.ppt.prevEstLabel},'Building Foundation Metrics Excel\u2026');});
// 	$(document).on('click','#xl-summary-inr',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.summaryInr.length){frappe.msgprint('Please wait for the Summary in INR data to load first.');return;}serverExport(API+'.export_summary_inr',{financial_year:fy,summary_data:JSON.stringify(Store.summaryInr)},'Building Summary in INR Excel\u2026');});
// 	$(document).on('click','#xl-headcount',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.headcount.length){frappe.msgprint('Please wait for the Headcount data to load first.');return;}serverExport(API+'.export_headcount',{financial_year:fy,headcount_data:JSON.stringify(Store.headcount)},'Building Headcount Excel\u2026');});
// 	$(document).on('click','#xl-annual',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.annual.length){frappe.msgprint('Please open the Annual Budget tab first.');return;}serverExport(API+'.export_annual',{financial_year:fy,annual_data:JSON.stringify(Store.annual)},'Building Annual Budget Excel\u2026');});
// 	$(document).on('click','#xl-estimate',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.estimate.length){frappe.msgprint('Please open the Estimate tab first.');return;}serverExport(API+'.export_estimate',{financial_year:fy,estimate_data:JSON.stringify(Store.estimate)},'Building Estimate Excel\u2026');});
// 	$(document).on('click','#xl-be',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.budgetEstimate.length){frappe.msgprint('Please open the Budget & Estimate tab first.');return;}serverExport(API+'.export_budget_estimate',{financial_year:fy,be_data:JSON.stringify(Store.budgetEstimate)},'Building Budget & Estimate Excel\u2026');});
// 	$(document).on('click','#xl-export-all',function(){
// 		var fy=fyControl.get_value()||'2025-26', missing=[];
// 		if(!Store.ppt.rows.length)      {missing.push('Foundation Metrics (tab 1)');}
// 		if(!Store.summaryInr.length)    {missing.push('Summary in INR (tab 2)');}
// 		if(!Store.headcount.length)     {missing.push('Headcount (tab 3)');}
// 		if(!Store.annual.length)        {missing.push('Annual Budget (tab 4)');}
// 		if(!Store.estimate.length)      {missing.push('Estimate (tab 5)');}
// 		if(!Store.budgetEstimate.length){missing.push('Budget & Estimate (tab 6)');}
// 		if(missing.length){frappe.msgprint('Please open each tab first.<br><br>Still loading: <b>'+missing.join(', ')+'</b>');return;}
// 		serverExport(API+'.export_all',{financial_year:fy,ppt_rows:JSON.stringify(Store.ppt.rows),prev_ppt_rows:JSON.stringify(Store.ppt.prevRows),budget_label:Store.ppt.budgetLabel,est_label:Store.ppt.estLabel,prev_budget_label:Store.ppt.prevBudgetLabel,prev_est_label:Store.ppt.prevEstLabel,summary_data:JSON.stringify(Store.summaryInr),headcount_data:JSON.stringify(Store.headcount),annual_data:JSON.stringify(Store.annual),estimate_data:JSON.stringify(Store.estimate),be_data:JSON.stringify(Store.budgetEstimate)},'Building full consolidated Excel\u2026');
// 	});

// 	// =============================================================================
// 	// AUTO-LOAD
// 	// =============================================================================

// 	if (fyControl.get_value()) { TabLoader.trigger('ppt'); }

// };




frappe.pages['consolidated-budget'].on_page_load = function (wrapper) {

	// =============================================================================
	// PAGE SETUP
	// =============================================================================

	var page = frappe.ui.make_app_page({
		parent: wrapper, title: 'Foundation - Consolidated Budget', single_column: true
	});

	setTimeout(function () {
		$(wrapper).find('#xl-export-all').remove();
		var $btn = $(
			'<button class="btn btn-default btn-sm" id="xl-export-all" style="display:inline-flex;align-items:center;gap:5px;margin-left:8px;background:#1a1a1a;color:#fff;border-color:#1a1a1a;">' +
			svgIcon() + 'Export All</button>'
		);
		var $pa = $(wrapper).find('.page-actions');
		if ($pa.length) { $pa.prepend($btn); }
	}, 300);

	function updatePageTitle(fy) {
		page.set_title('Foundation - Consolidated Budget - ' + fy);
		setTimeout(function () {
			$(wrapper).find('.page-head h3').hide();
			$(wrapper).find('.page-head .title-text').css({ 'font-size': '20px', 'font-weight': '700', 'color': '#1a1a1a' });
		}, 100);
	}

	// =============================================================================
	// FY HELPERS
	// =============================================================================

	function getFYLabels(fy) {
		var p = (fy || '2025-26').split('-');
		var sYY = p[0] ? p[0].slice(-2) : '25';
		var eYY = p[1] ? p[1].slice(-2) : '26';
		var ps = String(parseInt(sYY, 10) - 1).padStart(2, '0');
		var pe = String(parseInt(eYY, 10) - 1).padStart(2, '0');
		return { plan: 'FY' + sYY + '-' + eYY + ' Plan', actual: 'FY' + ps + '-' + pe + ' Actuals' };
	}

	function getPrevFY(fy) {
		var p = (fy || '2025-26').split('-');
		return (parseInt(p[0] || '2025', 10) - 1) + '-' + String(parseInt(p[1] || '26', 10) - 1).padStart(2, '0');
	}

	// =============================================================================
	// LOADER
	// =============================================================================

	if (!$('#global-loader').length) {
		$('body').append(
			'<div id="global-loader" class="loader-overlay">' +
			'<div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt="">' +
			'<div class="loader-text">Loading, please wait</div></div></div>'
		);
	}
	$('#global-loader').hide();

	var Loader = (function () {
		var active = {}; // key -> true while that caller's load is in flight

		return {
			// key identifies the caller (e.g. a tab name). Without a key, two tabs
			// loading at once would fight over the same spinner — one finishing
			// early would call hide() and make the OTHER tab look like it silently
			// stopped loading even though its fetch was still running in the
			// background. The overlay only disappears once every active key has
			// called hide().
			show: function (msg, key) {
				key = key || 'default';
				active[key] = true;
				var $l = $('#global-loader');
				$l.find('.loader-text').text(msg || 'Loading, please wait');
				$l.css('display', 'flex').hide().fadeIn(200);
			},
			hide: function (key) {
				key = key || 'default';
				delete active[key];
				if (!Object.keys(active).length) {
					$('#global-loader').fadeOut(200);
				}
			}
		};
	})();

	// =============================================================================
	// CR-VALUE TOOLTIP  — floating two-line card shown on hover over any .cb-tt span
	// (full rupee amount on top, "xx.xx Cr · context" breadcrumb underneath).
	// Uses position:fixed so it's never clipped by a table's overflow:auto wrapper.
	// =============================================================================

	var CrTooltip = (function () {
		var $el = null;

		function ensure() {
			if (!$el) {
				$el = $(
					'<div class="cb-cr-tooltip">' +
					'<div class="cb-cr-tooltip-main"></div>' +
					'<div class="cb-cr-tooltip-sub"></div>' +
					'</div>'
				).appendTo('body');
			}
			return $el;
		}

		function position(target) {
			var $t = ensure();
			var rect = target.getBoundingClientRect();
			var tw = $t.outerWidth(), th = $t.outerHeight();
			var left = rect.left + rect.width / 2 - tw / 2;
			var top  = rect.top - th - 10;
			if (left < 8) { left = 8; }
			if (left + tw > window.innerWidth - 8) { left = window.innerWidth - tw - 8; }
			if (top < 8) { top = rect.bottom + 10; } // flip below if there's no room above
			$t.css({ top: top + 'px', left: left + 'px' });
		}

		return {
			show: function (target, full, sub) {
				var $t = ensure();
				$t.find('.cb-cr-tooltip-main').text(full);
				$t.find('.cb-cr-tooltip-sub').text(sub);
				$t.addClass('is-visible');
				position(target);
			},
			hide: function () { if ($el) { $el.removeClass('is-visible'); } }
		};
	})();

	$(document).on('mouseenter', 'td:has(.cb-tt), th:has(.cb-tt)', function () {
		var $inner = $(this).find('.cb-tt').first();
		if (!$inner.length) { return; }
		CrTooltip.show(this, $inner.attr('data-full') || '', $inner.attr('data-sub') || '');
	});
	$(document).on('mouseleave', 'td:has(.cb-tt), th:has(.cb-tt)', function () { CrTooltip.hide(); });
	// Hovered cell can scroll out from under the tooltip inside a table's own
	// scroll area — just hide it rather than trying to track scroll position.
	$(document).on('scroll', '.cb-scroll-wrapper', function () { CrTooltip.hide(); });

	var Store = {
		ppt: { rows: [], prevRows: [], budgetLabel: '', actualLabel: '', prevBudgetLabel: '', prevActualLabel: '' },
		summaryInr: [], headcount: [], annual: [], actuals: [], budgetActuals: []
	};

	// =============================================================================
	// DATA CACHE  — centralised API layer
	// Each key maps to { data, promise, fy }
	// Consumers call DataCache.get(key, fy, fetcher) → Promise<data>
	// If fy changes all cache is cleared via DataCache.reset()
	// =============================================================================

	var DataCache = (function () {
		// _store : key -> data    (set on first success / timeout / error)
		// _has   : key -> true    (sentinel: empty-array / 0 / false are valid hits)
		// _queue : key -> [resolve-fns]  (concurrent callers waiting on same request)
		var _store = {}, _has = {}, _queue = {};

		function _settle(k, data) {
			_store[k] = data;
			_has[k]   = true;
			var waiters = _queue[k] || [];
			delete _queue[k];
			waiters.forEach(function (w) { w(data); });
		}

		return {
			/**
			 * DataCache.get(name, paramKey, fetcher [, fallback])
			 *   name     - logical cache name (e.g. 'headcount')
			 *   paramKey - unique params string (e.g. '2025-26')
			 *   fetcher  - function(resolve, reject) that fires one frappe.call
			 *   fallback - returned on timeout/error (default [])
			 * Guarantees:
			 *  - Only ONE live network call per (name+paramKey); concurrent callers queue.
			 *  - Empty arrays / null / 0 are valid cached values ONLY when the API itself
			 *    returned them — a timeout or network error never poisons the cache, so
			 *    simply switching away from a tab and back retries the fetch instead of
			 *    showing an empty table forever for that Financial Year.
			 *  - 120-second safety net resolves with fallback so Promise.all never hangs.
			 *  - Errors resolve (not reject) with fallback so Promise.all never throws.
			 *  - DataCache.reset() wipes everything (called on FY change).
			 */
			get: function (name, paramKey, fetcher, fallback) {
				if (fallback === undefined) { fallback = []; }
				var k = name + '::' + paramKey;

				// Cache hit (including empty-array results, but only real API hits)
				if (_has[k]) { return Promise.resolve(_store[k]); }

				// In-flight - join the queue
				if (_queue[k]) {
					return new Promise(function (res) { _queue[k].push(res); });
				}

				// First caller - fire the request
				_queue[k] = [];

				return new Promise(function (resolve) {
					var timedOut = false;

					// 120-second safety net - page never hangs. This does NOT cache the
					// fallback: it only unblocks the UI for callers waiting right now.
					// If the slow request eventually succeeds, _settle() below still
					// caches the real data so the next visit to this tab is instant.
					var timer = setTimeout(function () {
						timedOut = true;
						console.warn('[DataCache] slow response — showing empty for now, will keep trying in background:', k);
						var waiters = _queue[k] || [];
						delete _queue[k];
						resolve(fallback);
						waiters.forEach(function (w) { w(fallback); });
					}, 120000);

					fetcher(
						function onSuccess(data) {
							clearTimeout(timer);
							_settle(k, data);
							if (!timedOut) { resolve(data); }
						},
						function onError(err) {
							clearTimeout(timer);
							console.error('[DataCache] error:', k, err);
							if (!timedOut) {
								var waiters = _queue[k] || [];
								delete _queue[k];
								resolve(fallback);
								waiters.forEach(function (w) { w(fallback); });
							}
							// If we already timed out, leave the cache empty (un-poisoned)
							// so the next tab visit retries instead of staying blank.
						}
					);
				});
			},

			reset: function () { _store = {}; _has = {}; _queue = {}; }
		};
	})();

	// =============================================================================
	// FETCHERS  — one per API endpoint
	// =============================================================================

	var Fetchers = {

		// get_foundation_overall  (PPT tab — current FY)
		foundationOverall: function (fy, resolve, reject) {
			frappe.call({
				method: 'annual_budget.api.foundation_consolidated_report.get_foundation_overall',
				args: { financial_year: fy, month: 'March', table_name_filter: 'Foundation Overall' },
				callback: function (r) {
					var d = Array.isArray(r.message) ? r.message
						: ((r.message && Array.isArray(r.message.message)) ? r.message.message : []);
					resolve(d);
				},
				error: function () { resolve([]); }
			});
		},

		// get_unit_wise_plan  filter='Opex Capex'  (PPT tab sub-tables)
		unitWisePlanOpexCapex: function (fy, resolve, reject) {
			frappe.call({
				method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan',
				args: { financial_year: fy, month: 'March', table_name_filter: 'Opex Capex',is_previous:1 },
				callback: function (r) {
					var d = Array.isArray(r.message) ? r.message
						: ((r.message && Array.isArray(r.message.message)) ? r.message.message : []);
					resolve(d);
				},
				error: function () { resolve([]); }
			});
		},

		// get_unit_wise_plan  filter='Unit Wise Plan'  (SummaryINR)
		unitWisePlanSummary: function (fy, resolve, reject) {
			frappe.call({
				method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan',
				args: { financial_year: fy, month: 'March', table_name_filter: 'Unit Wise Plan',is_previous:1 },
				callback: function (r) {
					var d = Array.isArray(r.message) ? r.message
						: ((r.message && Array.isArray(r.message.message)) ? r.message.message : null);
					resolve(d || []);
				},
				error: function () { resolve([]); }
			});
		},

		// get_unit_wise_plan  filter='Budget & Estimate'  (BudgetActuals)
		unitWisePlanBE: function (fy, resolve, reject) {
			frappe.call({
				method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan',
				args: { financial_year: fy, month: 'March', table_name_filter: 'Budget & Estimate',is_previous:1 },
				callback: function (r) {
					var d = Array.isArray(r.message) ? r.message
						: ((r.message && Array.isArray(r.message.message)) ? r.message.message : []);
					resolve(d);
				},
				error: function () { resolve([]); }
			});
		},

		// get_headcount  (SummaryINR + Headcount tab)
		headcount: function (fy, resolve, reject) {
			frappe.call({
				method: 'annual_budget.api.foundation_consolidated_report.get_headcount',
				args: { financial_year: fy, month: 'March', table_name_filter: 'Unit Wise Plan' },
				callback: function (r) {
					var msg = r.message || {};
					resolve({ headcount_data: msg.headcount_data || [], plan_data: msg.plan_data || [] });
				},
				error: function () { resolve({ headcount_data: [], plan_data: [] }); }
			});
		},

		// get_consolidated_report  (Annual Budget tab + SummaryINR Quarter Phasing current FY)
		consolidatedReport: function (fy, resolve, reject) {
			frappe.call({
				method: 'annual_budget.api.phase_sheet.get_consolidated_report',
				args: { financial_year: fy },
				callback: function (r) {
					resolve(r.message || []);
				},
				error: function () { resolve([]); }
			});
		},

		// get_grouped_actuals  (Actuals Consolidated tab + SummaryINR Quarter Phasing previous FY)
		// NOTE: this fetcher receives the YEAR string (e.g. "2025"), not the FY string
		groupedActuals: function (yearStr, resolve, reject) {
			frappe.call({
				method: 'annual_budget.api.foundation_consolidated_report.get_grouped_actuals_quarter_and_month_wise_total',
				args: { fiscal_year: yearStr, accounting_period: '12' },
				callback: function (r) {
					var msg = r.message || {};
					var data;
					if (msg.status === 'success') { data = msg.data || []; }
					else if (Array.isArray(msg)) { data = msg; }
					else if (msg.data && Array.isArray(msg.data)) { data = msg.data; }
					else { data = []; }
					resolve(data);
				},
				error: function () { resolve([]); }
			});
		}
	};

	// =============================================================================
	// STYLES
	// =============================================================================

	$(page.body).append(
		'<style>' +
		':root{' +
		'--font:"Inter","Segoe UI","Helvetica Neue",Arial,sans-serif;' +
		'--fs-xs:13px;--fs-sm:14px;--fs-base:15px;--fs-md:16px;--fs-lg:17px;--fs-xl:18px;' +
		'--fw-n:400;--fw-m:500;--fw-sb:600;--fw-b:700;' +
		'--blue-dark:#003B63;--blue-mid:#0076B6;--blue-light:#E9F4FB;' +
		'--orange:#F26B21;--orange-light:#FFF3E6;' +
		'--bdl:#5a6472;--bdh:#004a75;--bdo:#a84808;' +
		'--txt:#1a1a1a;--txt2:#36414c;--muted:#555;' +
		'}' +
		'.cb-wrapper{padding:15px;background:#fff;font-family:var(--font);font-size:var(--fs-base);color:var(--txt);line-height:1.5;}' +
		'.cb-wrapper *{box-sizing:border-box;}' +
		'#cb-tab-nav{border-bottom:2px solid #ddd;list-style:none;padding:0;margin:0 0 16px;display:flex;align-items:flex-end;flex-wrap:wrap;}' +
		'#cb-tab-nav li{display:inline-block;}' +
		'#cb-tab-nav .cb-tab-link{cursor:pointer;display:inline-block;padding:9px 18px;color:var(--muted);font-size:var(--fs-md);font-weight:var(--fw-m);background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;text-decoration:none;transition:color .15s,border-color .15s;}' +
		'#cb-tab-nav .cb-tab-link.active{color:var(--blue-dark);font-weight:var(--fw-b);border-bottom:3px solid var(--blue-dark);}' +
		'#cb-tab-nav .cb-tab-link:hover{color:var(--blue-dark);}' +
		'.cb-tab-pane{display:none;}.cb-tab-pane.active{display:block;}' +
		'.cb-filter-row{padding:8px 0;margin-bottom:10px;}' +
		'.cb-filter-row .col-md-3,.cb-filter-row .col-sm-12{padding-left:8px;padding-right:8px;}' +
		'@media(max-width:768px){.cb-filter-row .col-md-3{width:100%;margin-bottom:8px;}}' +
		'.cb-controls{display:flex;align-items:center;padding:7px 12px;margin-bottom:12px;background:#f7f9fb;border:1px solid #e2e6ea;border-radius:6px;flex-wrap:wrap;gap:8px;}' +
		'.cb-controls-left{display:flex;align-items:center;gap:8px;flex:1;flex-wrap:wrap;}' +
		'.cb-controls-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}' +
		'.cb-search-wrap{position:relative;display:flex;align-items:center;}' +
		'.cb-search-wrap .search-icon{position:absolute;left:8px;color:#8d99a6;pointer-events:none;}' +
		'.cb-search-input{padding:5px 8px 5px 28px;border:1px solid var(--bdl);border-radius:4px;font-family:var(--font);font-size:var(--fs-sm);color:var(--txt2);background:#fff;width:220px;height:32px;transition:border-color .15s,box-shadow .15s;}' +
		'.cb-search-input:focus{outline:none;border-color:#5e64ff;box-shadow:0 0 0 2px rgba(94,100,255,.15);}' +
		'.cb-checkbox-area{display:flex;gap:12px;align-items:center;}' +
		'.cb-check-label{display:flex;align-items:center;gap:5px;font-family:var(--font);font-size:var(--fs-sm);font-weight:var(--fw-m);color:var(--txt2);cursor:pointer;user-select:none;white-space:nowrap;}' +
		'.cb-check-label input[type=checkbox]{width:14px;height:14px;cursor:pointer;accent-color:#5e64ff;}' +
		'.cb-xl-btn{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;height:32px;font-family:var(--font);font-size:var(--fs-sm);font-weight:var(--fw-sb);cursor:pointer;white-space:nowrap;border:1px solid #1a1a1a;border-radius:4px;background:#1a1a1a;color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.15);transition:background .15s;}' +
		'.cb-xl-btn:hover{background:#333;}.cb-xl-btn svg{flex-shrink:0;color:#fff;}' +
		'#xl-export-all svg{vertical-align:middle;margin-right:3px;}' +
		'.cb-scroll-wrapper{border:1px solid var(--bdl);border-radius:6px;overflow:auto;max-height:72vh;background:#fff;position:relative;isolation:isolate;}' +
		/* NUCLEAR BORDER FIX */
		'.cb-wrapper table{border-collapse:collapse !important;border-spacing:0 !important;}' +
		'.cb-wrapper table th,.cb-wrapper table td{border:1px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;text-align:right;font-family:var(--font);font-size:var(--fs-base);}' +
		'.cb-wrapper table th:first-child,.cb-wrapper table td:first-child{text-align:left !important;}' +
		'.cb-wrapper table thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);text-align:center !important;position:sticky;top:0;z-index:25;border:1px solid var(--bdh) !important;padding:10px 12px;letter-spacing:.1px;}' +
		'.cb-wrapper table thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);text-align:center !important;position:sticky;top:0;z-index:24;border:1px solid var(--bdo) !important;min-width:110px;padding:8px 12px;}' +
		'.cb-wrapper table tr.cb-row-head td{background:var(--blue-light) !important;color:var(--blue-dark);font-weight:var(--fw-b);border:1px solid var(--bdl) !important;cursor:pointer;}' +
		'.cb-wrapper table tr.cb-row-head:hover td{background:#d0e8f5 !important;}' +
		'.cb-wrapper table tr.cb-row-sub td{background:var(--orange-light) !important;font-weight:var(--fw-sb);border:1px solid var(--bdl) !important;cursor:pointer;}' +
		'.cb-wrapper table tr.cb-row-sub:hover td{background:#ffe0c2 !important;}' +
		'.cb-wrapper table tr.cb-row-grand td{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);border:1px solid var(--bdh) !important;}' +
		'.cb-wrapper table tr.ppt-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b);border:1px solid #5a6472 !important;}' +
		'.cb-wrapper table tr.sinr-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b) !important;border:1px solid #5a6472 !important;}' +
		/* Sticky total / grand-total rows — stay pinned to the bottom of the scroll area */
		'.cb-scroll-wrapper table tbody tr.cb-row-grand,' +
		'.cb-scroll-wrapper table tbody tr.ppt-total-row,' +
		'.cb-scroll-wrapper table tbody tr.sinr-total-row,' +
		'.cb-scroll-wrapper table tbody tr.cpe-total-row,' +
		'.cb-scroll-wrapper table tbody tr.sinr-gt-plan,' +
		'.cb-scroll-wrapper table tbody tr.sinr-gt-act{position:sticky;bottom:0;z-index:20;}' +
		'.cb-wrapper .ppt-table-wrap tbody tr td{background:#fff;color:var(--txt);font-weight:var(--fw-n);}' +
		/* Non-border cosmetic */
		'.cb-table,.ppt-table-wrap{width:100%;table-layout:auto;font-family:var(--font);font-size:var(--fs-base);color:var(--txt);line-height:1.45;}' +
		'.cb-text-accent{color:var(--blue-mid);font-weight:var(--fw-sb);}' +
		'.cb-tt{cursor:help;position:relative;border-bottom:1px dotted rgba(0,0,0,.4);}' +
		'.cb-tt:hover{border-bottom-color:var(--blue-mid);}' +
		'.cb-wrapper td:has(.cb-tt){cursor:help;}' +
		/* Floating Cr-value tooltip card (JS-positioned, fixed — never clipped by scroll areas) */
		'.cb-cr-tooltip{position:fixed;top:0;left:0;background:#1a2332;color:#fff;border-radius:10px;padding:10px 14px;box-shadow:0 10px 28px rgba(0,0,0,.32),0 3px 8px rgba(0,0,0,.18);font-family:var(--font);z-index:99999;opacity:0;visibility:hidden;transform:translateY(4px);transition:opacity .12s ease,transform .12s ease;pointer-events:none;max-width:min(360px,90vw);}' +
		'.cb-cr-tooltip.is-visible{opacity:1;visibility:visible;transform:translateY(0);}' +
		'.cb-cr-tooltip-main{font-size:15px;font-weight:700;letter-spacing:.1px;word-break:break-word;}' +
		'.cb-cr-tooltip-sub{font-size:12px;font-weight:500;color:#a7b1c2;margin-top:3px;white-space:normal;word-break:break-word;line-height:1.4;}' +
		'.ppt-title-bar{margin:14px 0 4px;}' +
		'.ppt-main-title{font-family:var(--font);font-size:var(--fs-md);font-weight:var(--fw-b);text-transform:uppercase;text-decoration:underline;letter-spacing:.4px;color:var(--txt);}' +
		'.ppt-currency-label{font-family:var(--font);font-size:var(--fs-sm);font-style:italic;color:var(--muted);text-align:right;margin-bottom:6px;}' +
		'.ppt-currency-label strong{font-weight:var(--fw-b);font-size:var(--fs-sm);font-style:normal;}' +
		'.ppt-dash{color:#bbb;text-align:center;display:block;}' +
		'.ppt-sub-item-row td:first-child{padding-left:28px !important;font-style:italic;color:#444;}' +
		/* Budget & Actuals sticky col */
		'#be-table tbody td:first-child{position:sticky;left:0;z-index:10;text-align:left !important;min-width:280px;max-width:280px;white-space:normal;word-break:break-word;background:#fff;}' +
		'#be-table .cb-row-head td:first-child{background:var(--blue-light) !important;}' +
		'#be-table .cb-row-sub td:first-child{background:var(--orange-light) !important;}' +
		'#be-table .cb-row-grand td:first-child{background:var(--blue-mid) !important;}' +
		'#be-table thead tr.cb-thead-main th:first-child{position:sticky;left:0;z-index:50 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:280px;}' +
		'#be-table .be-grand-col{background:#ddeaf7 !important;color:var(--blue-dark);border-left:2px solid var(--blue-mid) !important;}' +
		'#be-table .cb-row-grand .be-grand-col{background:var(--blue-dark) !important;color:#fff !important;}' +
		'#be-table .cb-row-head .be-grand-col{background:var(--blue-dark) !important;color:#fff !important;}' +
		'#be-table .cb-row-sub .be-grand-col{background:#f0ddd0 !important;color:#7a3b00 !important;}' +
		'#be-table .cb-thead-main th:not(:first-child){min-width:260px;text-align:center !important;}' +
		'#be-table .cb-thead-sub th{min-width:130px;text-align:center !important;}' +
		'#be-table tbody td:first-child,#be-table thead th:first-child{box-shadow:2px 0 4px -2px rgba(0,0,0,.12);}' +
		/* Summary INR labels */
		'.sinr-section-label{margin:18px 0 5px;font-family:var(--font);font-size:var(--fs-sm);font-weight:var(--fw-b);color:var(--txt);text-decoration:underline;letter-spacing:.2px;}' +
		'.sinr-currency-note{text-align:right;font-family:var(--font);font-size:var(--fs-xs);font-style:italic;color:var(--muted);margin-bottom:4px;}' +
		'.sinr-sub-item td:first-child{padding-left:22px !important;color:#444;}.sinr-covid-row td{color:#444;}' +
		/* sinr-table-a sticky */
		'#sinr-table-a thead tr.cb-thead-main th:first-child{position:sticky;left:0;z-index:50 !important;background:var(--blue-mid) !important;}' +
		'#sinr-table-a thead tr.cb-thead-sub th:first-child{position:sticky;left:0;z-index:49 !important;background:var(--orange) !important;}' +
		'#sinr-table-a tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);}' +
		'#sinr-table-a .sinr-total-row td:first-child{background:#e8f0fa !important;}' +
		'#sinr-table-a .sinr-covid-row td:first-child{background:#fff;}' +
		/* sinr-table-b sticky */
		'#sinr-table-b thead tr:nth-child(1) th{position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}' +
		'#sinr-table-b thead tr:nth-child(2) th{position:sticky;z-index:24;text-align:center !important;padding:8px 12px;min-width:110px;}' +
		'#sinr-table-b thead tr th:first-child{position:sticky !important;left:0;text-align:left !important;min-width:210px;box-shadow:2px 0 5px -2px rgba(0,0,0,.18);}' +
		'#sinr-table-b thead tr:nth-child(1) th:first-child{z-index:55 !important;}' +
		'#sinr-table-b thead tr:nth-child(2) th:first-child{z-index:54 !important;}' +
		'#sinr-table-b tbody td:first-child{position:sticky;left:0;z-index:10;text-align:left !important;min-width:210px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);}' +
		'#sinr-table-b tbody tr.sinr-unit-hdr td{background:var(--blue-light) !important;color:var(--blue-dark);font-weight:var(--fw-b);}' +
		'#sinr-table-b tbody tr.sinr-brkdwn-plan td{background:#fff !important;}' +
		'#sinr-table-b tbody tr.sinr-brkdwn-act td{background:#fafafa !important;}' +
		'#sinr-table-b tbody tr.sinr-spacer td{background:#f4f6f8 !important;padding:2px 0;}' +
		'#sinr-table-b tbody tr.sinr-gt-plan td,#sinr-table-b tbody tr.sinr-gt-act td{background:#ddeaf7 !important;color:var(--blue-dark);font-weight:var(--fw-sb);}' +
		'#sinr-table-b tbody td{text-align:right;padding:8px 12px;white-space:nowrap;}' +
		/* CPE */
		'#sinr-cpe-wrap{margin-top:28px;}' +
		'#sinr-cpe-hc-table{border-collapse:collapse !important;width:100%;}' +
		'#sinr-cpe-hc-table th,#sinr-cpe-hc-table td{border:1px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;font-family:var(--font);font-size:var(--fs-base);}' +
		'#sinr-cpe-hc-table thead tr:first-child th{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-xl);text-align:center !important;position:sticky;top:0;z-index:25;border:1px solid var(--bdh) !important;padding:10px 12px;}' +
		'#sinr-cpe-hc-table thead tr:first-child th:first-child{text-align:left !important;position:sticky;left:0;z-index:50 !important;}' +
		'#sinr-cpe-hc-table thead tr:last-child th{background:var(--orange) !important;color:#fff !important;font-weight:var(--fw-sb);font-size:var(--fs-lg);text-align:center !important;position:sticky;z-index:24;border:1px solid var(--bdo) !important;padding:8px 12px;}' +
		'#sinr-cpe-hc-table thead tr:last-child th:first-child{position:sticky;left:0;z-index:49 !important;background:var(--orange) !important;text-align:left !important;}' +
		'#sinr-cpe-hc-table tbody td{text-align:right;}' +
		'#sinr-cpe-hc-table tbody td:first-child{text-align:left !important;position:sticky;left:0;z-index:10;background:#fff;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);font-weight:var(--fw-n);}' +
		'#sinr-cpe-hc-table tbody tr.cpe-hc-dash-row td{color:#888;font-style:italic;}' +
		'#sinr-cpe-hc-table tbody tr.cpe-hc-dash-row td:first-child{background:#fff;}' +
		'#sinr-cpe-table{border-collapse:collapse !important;width:100%;}' +
		'#sinr-cpe-table th,#sinr-cpe-table td{border:1px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;font-family:var(--font);font-size:var(--fs-base);}' +
		'#sinr-cpe-table thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-xl);text-align:center !important;position:sticky;top:0;z-index:25;border:1px solid var(--bdh) !important;padding:10px 12px;}' +
		'#sinr-cpe-table thead tr.cb-thead-main th:first-child{position:sticky;left:0;z-index:50 !important;text-align:left !important;min-width:220px;}' +
		'#sinr-cpe-table thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-weight:var(--fw-sb);font-size:var(--fs-lg);text-align:center !important;position:sticky;z-index:24;border:1px solid var(--bdo) !important;min-width:100px;padding:8px 12px;}' +
		'#sinr-cpe-table thead tr.cb-thead-sub th:first-child{position:sticky;left:0;z-index:49 !important;background:var(--orange) !important;text-align:left !important;}' +
		'#sinr-cpe-table thead tr.cb-thead-sub2 th{background:#1a4a6e !important;color:#fff !important;font-weight:var(--fw-m);font-size:var(--fs-sm);text-align:center !important;position:sticky;z-index:23;border:1px solid #0d2f47 !important;min-width:90px;padding:7px 10px;}' +
		'#sinr-cpe-table thead tr.cb-thead-sub2 th:first-child{position:sticky;left:0;z-index:48 !important;background:#1a4a6e !important;text-align:left !important;}' +
		'#sinr-cpe-table tbody td{text-align:right;}' +
		'#sinr-cpe-table tbody td:first-child{text-align:left !important;position:sticky;left:0;z-index:10;background:#fff;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);min-width:220px;}' +
		'#sinr-cpe-table tbody tr.cpe-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b) !important;border:1px solid #5a6472 !important;}' +
		'#sinr-cpe-table tbody tr.cpe-total-row td:first-child{background:#e8f0fa !important;}' +
		'#sinr-cpe-table tbody tr.cpe-increase-neg{color:#c0392b;}' +
		'#sinr-cpe-table tbody tr.cpe-increase-pos{color:#1a7a3a;}' +
		/* Quarter Phasing table */
		'#qp-table{border-collapse:collapse !important;width:auto;min-width:680px;}' +
		'#qp-table th,#qp-table td{border:1px solid var(--bdl) !important;padding:7px 14px;white-space:nowrap;text-align:right;font-family:var(--font);font-size:var(--fs-sm);}' +
		'#qp-table td:first-child{text-align:left !important;min-width:140px;font-weight:var(--fw-m);}' +
		'#qp-table tr.qp-fy-hdr td{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-base);border:1px solid var(--bdh) !important;}' +
		'#qp-table tr.qp-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b);border:1px solid #5a6472 !important;}' +
		'#qp-table tr.qp-pct-row td{background:#fafafa;color:#666;font-style:italic;font-size:var(--fs-xs);}' +
		'#qp-table tr.qp-spacer td{padding:0;height:5px;background:#eef2f7;border-left:none !important;border-right:none !important;}' +
		'#qp-table tr.qp-fy-spacer td{padding:0;height:8px;background:#f0f4f8;border:none !important;}' +
		/* Headcount */
		'.hc-section-title{margin:20px 0 6px;font-family:var(--font);font-size:var(--fs-md);font-weight:var(--fw-b);color:var(--blue-dark);text-transform:uppercase;letter-spacing:.4px;border-left:4px solid var(--blue-mid);padding-left:10px;}' +
		'#global-loader.loader-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(18,18,18,.92);backdrop-filter:blur(6px);display:none;z-index:999999;align-items:center;justify-content:center;}' +
		'.loader-box{display:flex;flex-direction:column;align-items:center;gap:14px;}' +
		'.loader-logo{width:90px;height:90px;border-radius:50%;background:linear-gradient(145deg,#fff,#eaeaea);padding:14px;object-fit:contain;box-shadow:0 10px 30px rgba(0,0,0,.35);animation:lp 1.6s infinite ease-in-out;}' +
		'.loader-text{font-family:var(--font);font-size:var(--fs-sm);color:#fff;font-weight:var(--fw-sb);letter-spacing:.5px;opacity:.85;}' +
		'.loader-text::after{content:"";display:inline-block;width:1em;animation:ld 1.5s infinite;}' +
		'@keyframes lp{0%,100%{transform:scale(1);opacity:.8;}50%{transform:scale(1.08);opacity:1;}}' +
		'@keyframes ld{0%{content:"";}33%{content:".";}66%{content:"..";}100%{content:"...";}}' +
		'.cb-wrapper{isolation:isolate;}' +
		'.page-head,.navbar,.navbar-fixed-top,.page-container .page-head{z-index:1000 !important;}' +
		'</style>'
	);

	// =============================================================================
	// SHARED HELPERS
	// =============================================================================

	function svgIcon() {
		return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
			'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
			'<polyline points="14 2 14 8 20 8"/>' +
			'<line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>' +
			'</svg>';
	}

	function escAttr(s) {
		return String(s === null || s === undefined ? '' : s)
			.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	// ctx (optional) is a short breadcrumb like "Azim Premji Schools \u00b7 FY26-27 Plan"
	// shown as the second line of the hover tooltip, under the full rupee amount.
	function fmtCr(v, ctx) {
		var n = parseFloat(v) || 0;
		if (!isFinite(n) || n === 0) { return '-'; }
		var res = n / 10000000;
		var neg = res < 0;
		var s   = Math.abs(res).toFixed(2).split('.');
		var ip  = s[0], dp = s[1];
		if (ip.length > 3) {
			ip = ip.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + ip.slice(-3);
		}
		var crText  = (neg ? '-' : '') + ip + '.' + dp;
		var fullNum = '\u20B9 ' + (neg ? '-' : '') + formatINR(Math.abs(n));
		var crShort = crText + ' Cr';
		var sub     = ctx ? (crShort + ' \u00b7 ' + ctx) : crShort;
		return '<span class="cb-tt" data-full="' + escAttr(fullNum) + '" data-sub="' + escAttr(sub) + '">' + crText + '</span>';
	}

	function fmtCrDash(v, ctx) {
		var n = parseFloat(v) || 0;
		return (!isFinite(n) || n === 0) ? '<span class="ppt-dash">-</span>' : fmtCr(n, ctx);
	}

	function formatINR(v) {
		var n = Math.round(parseFloat(v) || 0);
		var neg = n < 0, s = String(Math.abs(n));
		if (s.length > 3) { s = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3); }
		return (neg ? '-' : '') + s;
	}

	// For tables that already show the full rupee number (Annual Budget, Actuals
	// Consolidated, Budget & Actuals), the hover tooltip shows the Cr-equivalent
	// instead — the conversion the raw number doesn't make obvious at a glance.
	function fmtINRCrTip(v, ctx) {
		var disp = formatINR(v);
		var n = parseFloat(v) || 0;
		if (!isFinite(n) || n === 0) { return disp; }
		var cr = n / 10000000;
		var neg = cr < 0;
		var crMain = '\u20B9 ' + (neg ? '-' : '') + Math.abs(cr).toFixed(2) + ' Cr';
		return '<span class="cb-tt" data-full="' + escAttr(crMain) + '" data-sub="' + escAttr(ctx || '') + '">' + disp + '</span>';
	}

	function fmtPct(a, b) {
		a = parseFloat(a); b = parseFloat(b);
		if (!a || isNaN(a) || isNaN(b)) { return '-'; }
		return Math.round(((b / a) - 1) * 100) + '%';
	}

	function xlBtn(id, label) { return '<button class="cb-xl-btn" id="' + id + '">' + svgIcon() + label + '</button>'; }

	function controlsBar(searchId, placeholder, checks, exportId) {
		var chk = checks.map(function (c) { return '<label class="cb-check-label"><input type="checkbox" id="' + c.id + '"> ' + c.label + '</label>'; }).join('');
		return '<div class="cb-controls"><div class="cb-controls-left">' +
			'<div class="cb-search-wrap"><svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
			'<input type="text" id="' + searchId + '" class="cb-search-input" placeholder="' + placeholder + '"></div>' +
			'<div class="cb-checkbox-area">' + chk + '</div></div>' +
			'<div class="cb-controls-right">' + xlBtn(exportId, 'Export to Excel') + '</div></div>';
	}

	function fixStickySubHeader(sel) {
		var attempts = 0;
		function attempt() {
			var $t = $(sel);
			var $m = $t.find('thead tr.cb-thead-main');
			var $s = $t.find('thead tr.cb-thead-sub');
			if (!$m.length || !$s.length) { return; }
			var h = $m[0].getBoundingClientRect().height;
			if (!h) { h = $m.outerHeight(true) || 0; }
			if (h > 0) {
				$s.find('th').css('top', h + 'px');
			} else if (attempts++ < 10) {
				setTimeout(attempt, 50);
			}
		}
		setTimeout(attempt, 0);
	}

	// When a table's "grand total" is made of several stacked rows (e.g. a header
	// row plus a Plan row plus an Actual row), plain CSS "bottom:0" on all of them
	// would pile them on top of each other. This staggers each row's sticky bottom
	// offset so they stack correctly, bottom row first.
	function fixStickyFooter(tableSel, rowSel) {
		var attempts = 0;
		function attempt() {
			var $t = $(tableSel);
			var $rows = $t.find(rowSel);
			if (!$rows.length) { return; }
			var heights = $rows.toArray().map(function (el) { return $(el).outerHeight(true) || 0; });
			if (!heights.some(function (h) { return h > 0; })) {
				if (attempts++ < 10) { setTimeout(attempt, 50); }
				return;
			}
			var acc = 0;
			for (var i = $rows.length - 1; i >= 0; i--) {
				$($rows[i]).css({ position: 'sticky', bottom: acc + 'px', zIndex: 20 });
				acc += heights[i];
			}
		}
		setTimeout(attempt, 0);
	}

	// =============================================================================
	// SHARED HEADCOUNT HELPERS
	// =============================================================================

	function swrapShared(inner) { return '<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' + inner + '</div>'; }

	function fyToMarchLabel(fy) {
		var p = (fy || '').split('-');
		if (p.length < 2) { return fy; }
		var startY = parseInt(p[0], 10) || 2000;
		var endY2  = parseInt(p[1], 10) || 0;
		var endFull = (endY2 > (startY % 100)) ? (Math.floor(startY / 100) * 100 + endY2) : (Math.floor(startY / 100) * 100 + 100 + endY2);
		return '31st March-' + endFull;
	}

	function buildClosingAvgTable(yrs, totals) {
		function avg(i) {
			if (i === 0) { var c0 = totals[yrs[0]]; return (c0 !== undefined && c0 !== null) ? c0 / 2 : null; }
			var p = totals[yrs[i - 1]], c = totals[yrs[i]];
			return (p !== undefined && c !== undefined) ? (p + c) / 2 : null;
		}
		function fmtNum(v) { if (v === null || v === undefined || isNaN(v)) { return '-'; } return Math.round(parseFloat(v)).toLocaleString('en-IN'); }
		function fmtPctCA(a, b) { if (!a || isNaN(a) || isNaN(b) || !isFinite(b / a)) { return '-'; } return (((b / a) - 1) * 100).toFixed(1) + '%'; }
		function fmtInc(v) { if (v === null || v === undefined || isNaN(v)) { return '-'; } return Math.round(parseFloat(v)).toLocaleString('en-IN'); }
		var bodyRows = '';
		yrs.forEach(function (fy, i) {
			var closing = totals[fy] !== undefined ? totals[fy] : null;
			var avgVal  = avg(i);
			var prevClosing = (i > 0 && totals[yrs[i-1]] !== undefined) ? totals[yrs[i-1]] : null;
			var prevAvg     = (i > 0) ? avg(i - 1) : null;
			var incClosing = (prevClosing !== null && closing !== null) ? (closing - prevClosing) : null;
			var incAvg     = (prevAvg !== null && avgVal !== null) ? (avgVal - prevAvg) : null;
			var pctClosing = (prevClosing !== null && prevClosing !== 0 && closing !== null) ? fmtPctCA(prevClosing, closing) : '-';
			var pctAvg     = (prevAvg !== null && prevAvg !== 0 && avgVal !== null) ? fmtPctCA(prevAvg, avgVal) : '-';
			bodyRows +=
				'<tr>' +
				'<td style="text-align:left;">' + fyToMarchLabel(fy) + '</td>' +
				'<td>' + fmtNum(closing) + '</td>' +
				'<td>' + fmtNum(avgVal) + '</td>' +
				'<td>' + (incClosing !== null ? fmtInc(incClosing) : '-') + '</td>' +
				'<td>' + (incAvg !== null ? fmtInc(incAvg) : '-') + '</td>' +
				'<td>' + pctClosing + '</td>' +
				'<td>' + pctAvg + '</td>' +
				'</tr>';
		});
		var thead =
			'<thead>' +
			'<tr class="cb-thead-main">' +
			'<th rowspan="2" style="text-align:left !important;min-width:180px;vertical-align:middle;"></th>' +
			'<th rowspan="2" style="text-align:center !important;min-width:110px;vertical-align:middle;">Closing<br>H/C</th>' +
			'<th rowspan="2" style="text-align:center !important;min-width:110px;vertical-align:middle;">Average<br>H/C</th>' +
			'<th colspan="2" style="text-align:center !important;min-width:200px;">Increase</th>' +
			'<th colspan="2" style="text-align:center !important;min-width:200px;">% Increase</th>' +
			'</tr>' +
			'<tr class="cb-thead-sub">' +
			'<th style="min-width:100px;">Closing</th>' +
			'<th style="min-width:100px;">Average</th>' +
			'<th style="min-width:100px;">Closing</th>' +
			'<th style="min-width:100px;">Average</th>' +
			'</tr>' +
			'</thead>';
		return swrapShared(
			'<table class="cb-table" style="width:100%;">' +
			thead +
			'<tbody>' + bodyRows + '</tbody>' +
			'</table>'
		);
	}

	// =============================================================================
	// HTML SKELETON
	// =============================================================================

	$(page.body).append(
		'<div class="cb-wrapper">' +
		'<div class="frappe-control-group row cb-filter-row" id="cb-filter-row"></div>' +
		'<ul id="cb-tab-nav">' +
		'<li><a class="cb-tab-link active" data-tab="ppt">Foundation level/Overall metrics</a></li>' +
		'<li><a class="cb-tab-link" data-tab="summary_inr">Summary in INR</a></li>' +
		'<li><a class="cb-tab-link" data-tab="headcount">Headcount</a></li>' +
		'<li><a class="cb-tab-link" data-tab="annual_budget">Annual Budget Consolidated</a></li>' +
		'<li><a class="cb-tab-link" data-tab="actuals">Actuals Consolidated</a></li>' +
		'<li><a class="cb-tab-link" data-tab="budget_actuals">Budget &amp; Actuals</a></li>' +
		'</ul><div id="cb-tab-content">' +

		'<div class="cb-tab-pane active" id="tab-ppt">' +
		'<div style="display:flex;justify-content:flex-end;margin-bottom:8px;">' + xlBtn('xl-ppt', 'Export to Excel') + '</div>' +
		'<div class="ppt-title-bar"><div class="ppt-main-title" id="ppt-main-title">Overall Foundation - Budget vs. Actual</div></div>' +
		'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
		'<div class="cb-scroll-wrapper" style="margin-bottom:20px;"><table id="ppt-table" class="ppt-table-wrap"><thead>' +
		'<tr class="cb-thead-main"><th rowspan="2" style="min-width:180px;">Unit</th><th colspan="4" id="ppt-budget-hdr">Budget</th><th colspan="4" id="ppt-actual-hdr">Actuals</th></tr>' +
		'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Covid</th><th>Total</th><th>Opex</th><th>Capex</th><th>Covid</th><th>Total</th></tr>' +
		'</thead><tbody id="ppt-tbody"></tbody></table></div>' +
		'<div class="ppt-title-bar"><div class="ppt-main-title" id="ppt-prev-title">Overall Foundation - Previous Year Budget vs. Actual</div></div>' +
		'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
		'<div class="cb-scroll-wrapper" style="margin-bottom:20px;"><table id="ppt-prev-table" class="ppt-table-wrap"><thead>' +
		'<tr class="cb-thead-main"><th rowspan="2" style="min-width:180px;">Unit</th><th colspan="4" id="ppt-prev-budget-hdr">Budget</th><th colspan="4" id="ppt-prev-actual-hdr">Actuals</th></tr>' +
		'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Covid</th><th>Total</th><th>Opex</th><th>Capex</th><th>Covid</th><th>Total</th></tr>' +
		'</thead><tbody id="ppt-prev-tbody"></tbody></table></div>' +
		'<div id="ppt-sub-tables"></div>' +
		'</div>' +

		'<div class="cb-tab-pane" id="tab-summary_inr"></div>' +
		'<div class="cb-tab-pane" id="tab-headcount"></div>' +

		'<div class="cb-tab-pane" id="tab-annual_budget">' +
		controlsBar('annual-search', 'Search expense / item\u2026', [{ id: 'annual-expand-quarters', label: 'Expand Quarters' }, { id: 'annual-expand-items', label: 'Expand Line Items' }], 'xl-annual') +
		'<div class="cb-scroll-wrapper"><table class="cb-table" id="annual-table"><thead></thead><tbody></tbody></table></div></div>' +

		'<div class="cb-tab-pane" id="tab-actuals">' +
		controlsBar('actuals-search', 'Search expense / item\u2026', [{ id: 'actuals-expand-quarters', label: 'Expand Quarters' }, { id: 'actuals-expand-items', label: 'Expand Line Items' }], 'xl-actuals') +
		'<div class="cb-scroll-wrapper"><table class="cb-table" id="actuals-table"><thead></thead><tbody id="actuals-tbody"></tbody></table></div></div>' +

		'<div class="cb-tab-pane" id="tab-budget_actuals">' +
		controlsBar('be-search', 'Search expense / item\u2026', [{ id: 'be-expand-items', label: 'Expand Line Items' }], 'xl-be') +
		'<div class="cb-scroll-wrapper"><table class="cb-table" id="be-table"><thead></thead><tbody id="be-tbody"></tbody></table></div></div>' +

		'</div></div>'
	);

	// =============================================================================
	// FINANCIAL YEAR FILTER
	// =============================================================================

	var fyControl = frappe.ui.form.make_control({
		parent: $('<div class="col-md-3 col-sm-12"></div>').appendTo('#cb-filter-row'),
		df: {
			label: 'Financial Year', fieldtype: 'Select', fieldname: 'financial_year', reqd: 1,
			change: function () {
				var y = this.get_value(); if (!y) { return; }
				updatePageTitle(y);
				DataCache.reset();
				TabLoader.resetAll();
				TabLoader.trigger($('#cb-tab-nav .cb-tab-link.active').data('tab'));
			}
		},
		render_input: true
	});
	fyControl.refresh();

	frappe.call({
		method: 'annual_budget.api.filter_options.get_financial_year_list',
		callback: function (r) {
			if (!r.message || !r.message.length) { return; }
			var years = r.message.map(function (d) { return d.financial_year; });
			fyControl.df.options = years.join('\n'); fyControl.refresh();
			var today = new Date(), y = today.getFullYear(), m = today.getMonth() + 1;
			var cur = (m >= 4 ? y : y - 1) + '-' + String(m >= 4 ? y + 1 : y).slice(-2);
			var target = years.indexOf(cur) !== -1 ? cur : years[0];
			fyControl.set_value(target); updatePageTitle(target);
		}
	});

	// =============================================================================
	// TAB SWITCHING + LOADER
	// =============================================================================

	$(document).on('click', '#cb-tab-nav .cb-tab-link', function () {
		var tab = $(this).data('tab');
		$('#cb-tab-nav .cb-tab-link').removeClass('active'); $('.cb-tab-pane').removeClass('active');
		$(this).addClass('active'); $('#tab-' + tab).addClass('active');
		TabLoader.trigger(tab);
	});

	var TabLoader = (function () {
		var loaded = {};
		var map = {
			ppt:            function (fy) { PPT.load(fy); },
			summary_inr:    function (fy) { SummaryINR.load(fy); },
			headcount:      function (fy) { Headcount.load(fy); },
			annual_budget:  function (fy) { Annual.load(fy); },
			actuals:        function (fy) { Actuals.load(fy); },
			budget_actuals: function (fy) { BudgetActuals.load(fy); }
		};
		return {
			trigger: function (tab) {
				if (!map[tab]) { return; }
				var fy = fyControl.get_value() || '2025-26';
				if (loaded[tab] === fy) { return; }
				loaded[tab] = fy; map[tab](fy);
			},
			// Modules call this after their load finishes. ok=false (empty/timeout/error)
			// clears the "loaded" flag so the next click on this tab retries the fetch
			// instead of leaving the tab permanently blank for this Financial Year.
			reportResult: function (tab, fy, ok) {
				if (!ok && loaded[tab] === fy) { delete loaded[tab]; }
			},
			resetAll: function () { loaded = {}; }
		};
	})();

	// =============================================================================
	// EXCEL EXPORT
	// =============================================================================

	function serverExport(method, args, msg) {
		Loader.show(msg || 'Preparing your Excel file', 'export');
		frappe.call({
			method: method, args: args,
			callback: function (r) {
				Loader.hide('export');
				if (r.message && r.message.data) {
					var bin = atob(r.message.data), bytes = new Uint8Array(bin.length);
					for (var i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); }
					var url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
					var a = document.createElement('a'); a.href = url; a.download = r.message.filename;
					document.body.appendChild(a); a.click();
					setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
				} else { frappe.msgprint('Export failed \u2014 no data returned.'); }
			},
			error: function () { Loader.hide('export'); frappe.msgprint('Server error during export.'); }
		});
	}

	// =============================================================================
	// PPT MODULE
	// =============================================================================

	var PPT = (function () {
		function normSec(s) { return (s || '').replace(/\s+/g, ' ').trim().toUpperCase(); }

		function extractVals(sections, field) {
			var opex = 0, capex = 0, hasBreakdown = false;
			(sections || []).forEach(function (sec) {
				var nm = normSec(sec.name);
				if (sec.sequence_id === 9999 || nm === 'GRAND TOTAL') { return; }
				if (nm.indexOf('OPERATING') !== -1) { opex  += parseFloat(sec[field] || 0); hasBreakdown = true; }
				if (nm.indexOf('CAPITAL')   !== -1) { capex += parseFloat(sec[field] || 0); hasBreakdown = true; }
			});
			if (!hasBreakdown) {
				(sections || []).forEach(function (sec) {
					if (sec.sequence_id === 9999 || normSec(sec.name) === 'GRAND TOTAL') {
						opex += parseFloat(sec[field] || 0);
					}
				});
				if (!opex) {
					(sections || []).forEach(function (sec) {
						if (sec.sequence_id !== 9999 && normSec(sec.name) !== 'GRAND TOTAL') {
							opex += parseFloat(sec[field] || 0);
						}
					});
				}
			}
			return { opex: opex, capex: capex };
		}

		// Sums any section whose name contains "COVID" (e.g. "COVID", "COVID EXPENSES").
		// Value is provided by the API in the same section/field shape as Opex/Capex.
		function extractCovid(sections, field) {
			var covid = 0;
			(sections || []).forEach(function (sec) {
				var nm = normSec(sec.name);
				if (sec.sequence_id === 9999 || nm === 'GRAND TOTAL') { return; }
				if (nm.indexOf('COVID') !== -1) { covid += parseFloat(sec[field] || 0); }
			});
			return covid;
		}

		function extractTotal(sections, field) {
			var gt = 0;
			(sections || []).forEach(function (sec) {
				if (sec.sequence_id === 9999 || normSec(sec.name) === 'GRAND TOTAL') {
					gt += parseFloat(sec[field] || 0);
				}
			});
			if (!gt) {
				(sections || []).forEach(function (sec) { gt += parseFloat(sec[field] || 0); });
			}
			return gt;
		}

		function buildRows(data, cfg) {
			var rows = (data || []).slice()
				.sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); })
				.map(function (e) {
					var b = extractVals(e[cfg.key] || [], cfg.budgetField);
					var v = extractVals(e[cfg.key] || [], cfg.actualField);
					var bCovid = extractCovid(e[cfg.key] || [], cfg.budgetField);
					var eCovid = extractCovid(e[cfg.key] || [], cfg.actualField);
					var bTot = extractTotal(e[cfg.key] || [], cfg.budgetField);
					var eTot = extractTotal(e[cfg.key] || [], cfg.actualField);
					return { label: e.label || '', bOpex: b.opex, bCapex: b.capex, bCovid: bCovid, bTotal: bTot, eOpex: v.opex, eCapex: v.capex, eCovid: eCovid, eTotal: eTot };
				});
			var tot = { bOpex: 0, bCapex: 0, bCovid: 0, bTotal: 0, eOpex: 0, eCapex: 0, eCovid: 0, eTotal: 0 };
			rows.forEach(function (r) { tot.bOpex += r.bOpex; tot.bCapex += r.bCapex; tot.bCovid += r.bCovid; tot.bTotal += r.bTotal; tot.eOpex += r.eOpex; tot.eCapex += r.eCapex; tot.eCovid += r.eCovid; tot.eTotal += r.eTotal; });
			rows.push({ label: 'Total', isTotal: true, bOpex: tot.bOpex, bCapex: tot.bCapex, bCovid: tot.bCovid, bTotal: tot.bTotal, eOpex: tot.eOpex, eCapex: tot.eCapex, eCovid: tot.eCovid, eTotal: tot.eTotal });
			return rows;
		}

		function renderTable(rows, tbId, bHdr, eHdr, tblId, bLbl, eLbl) {
			$('#' + bHdr).text(bLbl); $('#' + eHdr).text(eLbl);
			var $tb = $('#' + tbId).empty();
			rows.forEach(function (r) {
				$tb.append('<tr class="' + (r.isTotal ? 'ppt-total-row' : '') + '"><td>' + r.label + '</td>' +
					'<td>' + fmtCrDash(r.bOpex, r.label + ' \u00b7 ' + bLbl + ' \u00b7 Opex') + '</td><td>' + fmtCrDash(r.bCapex, r.label + ' \u00b7 ' + bLbl + ' \u00b7 Capex') + '</td><td>' + fmtCrDash(r.bCovid, r.label + ' \u00b7 ' + bLbl + ' \u00b7 Covid') + '</td><td>' + fmtCrDash(r.bTotal, r.label + ' \u00b7 ' + bLbl + ' \u00b7 Total') + '</td>' +
					'<td>' + fmtCrDash(r.eOpex, r.label + ' \u00b7 ' + eLbl + ' \u00b7 Opex') + '</td><td>' + fmtCrDash(r.eCapex, r.label + ' \u00b7 ' + eLbl + ' \u00b7 Capex') + '</td><td>' + fmtCrDash(r.eCovid, r.label + ' \u00b7 ' + eLbl + ' \u00b7 Covid') + '</td><td>' + fmtCrDash(r.eTotal, r.label + ' \u00b7 ' + eLbl + ' \u00b7 Total') + '</td></tr>');
			});
			fixStickySubHeader('#' + tblId);
		}

		function buildEducationTables(data, cfg, bLbl, eLbl) {
			var subItems = (data || []).filter(function (e) { return e.is_this_sub_item === 1; });
			if (!subItems.length) { return ''; }
			var groups = {}, groupOrder = [];
			subItems.forEach(function (e) {
				var grp = (e.table_name || 'Other').trim();
				if (!groups[grp]) { groups[grp] = []; groupOrder.push(grp); }
				groups[grp].push(e);
			});
			var html = '';
			groupOrder.forEach(function (grp) {
				var entries = groups[grp].slice().sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });
				var tblId = 'ppt-edu-' + grp.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
				var bodyHtml = '';
				var tot = { bOpex: 0, bCapex: 0, bTotal: 0, eOpex: 0, eCapex: 0, eTotal: 0 };
				entries.forEach(function (e) {
					var b = extractVals(e[cfg.key] || [], cfg.budgetField);
					var v = extractVals(e[cfg.key] || [], cfg.actualField);
					var bTot = extractTotal(e[cfg.key] || [], cfg.budgetField);
					var eTot = extractTotal(e[cfg.key] || [], cfg.actualField);
					tot.bOpex += b.opex; tot.bCapex += b.capex; tot.bTotal += bTot;
					tot.eOpex += v.opex; tot.eCapex += v.capex; tot.eTotal += eTot;
					var lbl = e.label || '';
					bodyHtml += '<tr><td>' + lbl + '</td>' +
						'<td>' + fmtCrDash(b.opex, lbl + ' \u00b7 ' + bLbl + ' \u00b7 Opex') + '</td><td>' + fmtCrDash(b.capex, lbl + ' \u00b7 ' + bLbl + ' \u00b7 Capex') + '</td><td>' + fmtCrDash(bTot, lbl + ' \u00b7 ' + bLbl + ' \u00b7 Total') + '</td>' +
						'<td>' + fmtCrDash(v.opex, lbl + ' \u00b7 ' + eLbl + ' \u00b7 Opex') + '</td><td>' + fmtCrDash(v.capex, lbl + ' \u00b7 ' + eLbl + ' \u00b7 Capex') + '</td><td>' + fmtCrDash(eTot, lbl + ' \u00b7 ' + eLbl + ' \u00b7 Total') + '</td></tr>';
				});
				bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' +
					'<td>' + fmtCrDash(tot.bOpex, 'Total \u00b7 ' + bLbl + ' \u00b7 Opex') + '</td><td>' + fmtCrDash(tot.bCapex, 'Total \u00b7 ' + bLbl + ' \u00b7 Capex') + '</td><td>' + fmtCrDash(tot.bTotal, 'Total \u00b7 ' + bLbl + ' \u00b7 Total') + '</td>' +
					'<td>' + fmtCrDash(tot.eOpex, 'Total \u00b7 ' + eLbl + ' \u00b7 Opex') + '</td><td>' + fmtCrDash(tot.eCapex, 'Total \u00b7 ' + eLbl + ' \u00b7 Capex') + '</td><td>' + fmtCrDash(tot.eTotal, 'Total \u00b7 ' + eLbl + ' \u00b7 Total') + '</td></tr>';
				html +=
					'<div class="ppt-title-bar" style="margin-top:28px;"><div class="ppt-main-title">EDUCATION</div></div>' +
					'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
					'<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' +
					'<table id="' + tblId + '" class="ppt-table-wrap"><thead>' +
					'<tr class="cb-thead-main"><th rowspan="2" style="min-width:200px;text-align:left !important;">Unit</th>' +
					'<th colspan="3" style="text-align:center !important;">' + bLbl + '</th>' +
					'<th colspan="3" style="text-align:center !important;">' + eLbl + '</th></tr>' +
					'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Total</th><th>Opex</th><th>Capex</th><th>Total</th></tr>' +
					'</thead><tbody>' + bodyHtml + '</tbody></table></div>';
			});
			return html;
		}

		function buildOpexBudgetTable(entries, fyLabel) {
			if (!entries || !entries.length) { return ''; }
			function isOpex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1; }
			function getSubPlan(e, subName) {
				var v = 0;
				(e.actuals || []).forEach(function (s) {
					if (!isOpex(s.name)) { return; }
					(s.sub_heads || []).forEach(function (sub) {
						if ((sub.name || '').trim() === subName) { v += parseFloat(sub.ytd || 0); }
					});
				});
				return v;
			}
			function getOpexPlan(e) {
				var v = 0;
				(e.actuals || []).forEach(function (s) { if (isOpex(s.name)) { v += parseFloat(s.ytd || 0); } });
				return v;
			}
			var subHeadNames = [], seen = {};
			entries.forEach(function (e) {
				(e.actuals || []).forEach(function (s) {
					if (!isOpex(s.name)) { return; }
					(s.sub_heads || []).forEach(function (sub) {
						var n = (sub.name || '').trim();
						if (n && !seen[n]) { seen[n] = true; subHeadNames.push(n); }
					});
				});
			});
			if (!subHeadNames.length) { return ''; }
			var tblId = 'ppt-opex-budget-tbl';
			if (!$('#ppt-opex-style').length) {
				$('head').append('<style id="ppt-opex-style">#' + tblId + '{border-collapse:collapse !important;width:100%;}' +
					'#' + tblId + ' th,#' + tblId + ' td{border:1px solid var(--bdl) !important;}' +
					'#' + tblId + ' thead tr.cb-thead-main th{border:1px solid var(--bdh) !important;}' +
					'#' + tblId + ' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:50 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:260px;border:1px solid var(--bdh) !important;}' +
					'#' + tblId + ' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:260px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1px solid var(--bdl) !important;}' +
					'#' + tblId + ' tbody tr.cb-row-grand td:first-child{background:var(--blue-mid) !important;border:1px solid var(--bdh) !important;}' +
					'#' + tblId + ' tbody tr.ppt-total-row td:first-child{background:#e8f0fa !important;border:1px solid #aaa !important;}</style>');
			}
			var hdrR1 = '<tr class="cb-thead-main"><th style="min-width:260px;text-align:left !important;">Expense Category</th>';
			entries.forEach(function (e) { hdrR1 += '<th style="min-width:150px;text-align:center !important;">' + (e.label || '').trim() + '</th>'; });
			hdrR1 += '<th style="min-width:150px;text-align:center !important;background:var(--blue-dark);">Grand Total</th></tr>';
			var bodyHtml = '', colTotals = [], grandRowTotal = 0;
			entries.forEach(function () { colTotals.push(0); });
			subHeadNames.forEach(function (subName) {
				var rowTotal = 0, cells = '';
				entries.forEach(function (e, ei) {
					var v = getSubPlan(e, subName);
					colTotals[ei] += v; rowTotal += v;
					cells += '<td>' + fmtCrDash(v, subName + ' \u00b7 ' + (e.label || '').trim()) + '</td>';
				});
				grandRowTotal += rowTotal;
				bodyHtml += '<tr><td>' + subName + '</td>' + cells +
					'<td style="font-weight:700;background:#ddeaf7;color:var(--blue-dark);border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(rowTotal, subName + ' \u00b7 Grand Total') + '</td></tr>';
			});
			var totalCells = '', opexGrandTotal = 0;
			entries.forEach(function (e) {
				var v = getOpexPlan(e); opexGrandTotal += v;
				totalCells += '<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(v, 'Total \u00b7 ' + (e.label || '').trim()) + '</td>';
			});
			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells +
				'<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(opexGrandTotal, 'Total \u00b7 Grand Total') + '</td></tr>';
			var fyPart = fyLabel.replace(/\s*budget\s*/i, '').trim();
			return '<div class="ppt-title-bar" style="margin-top:36px;"><div class="ppt-main-title">OPERATING EXPENSES ' + fyPart + '</div></div>' +
				'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
				'<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' +
				'<table id="' + tblId + '" class="cb-table"><thead>' + hdrR1 + '</thead><tbody>' + bodyHtml + '</tbody></table></div>';
		}

		function buildCapexBudgetTable(entries, fyLabel) {
			if (!entries || !entries.length) { return ''; }
			function isCapex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('CAPITAL') !== -1; }
			function getItemPlan(e, itemName) {
				var v = 0;
				(e.actuals || []).forEach(function (s) {
					if (!isCapex(s.name)) { return; }
					(s.items || []).forEach(function (item) {
						if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); }
					});
				});
				return v;
			}
			function getCapexPlan(e) {
				var v = 0;
				(e.actuals || []).forEach(function (s) { if (isCapex(s.name)) { v += parseFloat(s.ytd || 0); } });
				return v;
			}
			var itemNames = [], seen = {};
			entries.forEach(function (e) {
				(e.actuals || []).forEach(function (s) {
					if (!isCapex(s.name)) { return; }
					(s.items || []).forEach(function (item) {
						var n = (item.name || '').trim();
						if (n && !seen[n]) { seen[n] = true; itemNames.push(n); }
					});
				});
			});
			if (!itemNames.length) { return ''; }
			var tblId = 'ppt-capex-budget-tbl';
			if (!$('#ppt-capex-style').length) {
				$('head').append('<style id="ppt-capex-style">#' + tblId + '{border-collapse:collapse !important;width:100%;}' +
					'#' + tblId + ' th,#' + tblId + ' td{border:1px solid var(--bdl) !important;}' +
					'#' + tblId + ' thead tr.cb-thead-main th{border:1px solid var(--bdh) !important;}' +
					'#' + tblId + ' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:50 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:260px;border:1px solid var(--bdh) !important;}' +
					'#' + tblId + ' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:260px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1px solid var(--bdl) !important;}' +
					'#' + tblId + ' tbody tr.cb-row-grand td:first-child{background:var(--blue-mid) !important;border:1px solid var(--bdh) !important;}' +
					'#' + tblId + ' tbody tr.ppt-total-row td:first-child{background:#e8f0fa !important;border:1px solid #aaa !important;}</style>');
			}
			var hdrR1 = '<tr class="cb-thead-main"><th style="min-width:260px;text-align:left !important;">Expense Category</th>';
			entries.forEach(function (e) { hdrR1 += '<th style="min-width:150px;text-align:center !important;">' + (e.label || '').trim() + '</th>'; });
			hdrR1 += '<th style="min-width:150px;text-align:center !important;background:var(--blue-dark);">Grand Total</th></tr>';
			var bodyHtml = '', grandRowTotal = 0;
			itemNames.forEach(function (itemName) {
				var rowTotal = 0, cells = '';
				entries.forEach(function (e) {
					var v = getItemPlan(e, itemName); rowTotal += v;
					cells += '<td>' + fmtCrDash(v, itemName + ' \u00b7 ' + (e.label || '').trim()) + '</td>';
				});
				grandRowTotal += rowTotal;
				bodyHtml += '<tr><td>' + itemName + '</td>' + cells +
					'<td style="font-weight:700;background:#ddeaf7;color:var(--blue-dark);border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(rowTotal, itemName + ' \u00b7 Grand Total') + '</td></tr>';
			});
			var totalCells = '', capexGrandTotal = 0;
			entries.forEach(function (e) {
				var v = getCapexPlan(e); capexGrandTotal += v;
				totalCells += '<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(v, 'Total \u00b7 ' + (e.label || '').trim()) + '</td>';
			});
			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells +
				'<td style="font-weight:700;background:#e8f0fa !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;">' + fmtCrDash(capexGrandTotal, 'Total \u00b7 Grand Total') + '</td></tr>';
			var fyPart = fyLabel.replace(/\s*budget\s*/i, '').trim();
			return '<div class="ppt-title-bar" style="margin-top:36px;"><div class="ppt-main-title">CAPITAL EXPENSES ' + fyPart + '</div></div>' +
				'<div class="ppt-currency-label">&#8377; <strong>Cr.</strong></div>' +
				'<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' +
				'<table id="' + tblId + '" class="cb-table"><thead>' + hdrR1 + '</thead><tbody>' + bodyHtml + '</tbody></table></div>';
		}

		function load(fy) {
			$('#ppt-tbody,#ppt-prev-tbody').html(
				'<tr><td colspan="9" style="text-align:center;padding:24px;color:#aaa;">Loading\u2026</td></tr>'
			);
			$('#ppt-sub-tables').html('');
			Loader.show('Building your foundation metrics', 'ppt');

			var p = (fy || '2025-26').split('-');
			var cS = parseInt(p[0], 10), cE = parseInt(p[1], 10);
			var curFY = cS + '-' + String(cE).padStart(2, '0');
			var prvFY = (cS - 1) + '-' + String(cE - 1).padStart(2, '0');

			// Both PPT API calls go through DataCache
			Promise.all([
				DataCache.get('foundationOverall', fy, function(res,rej){Fetchers.foundationOverall(fy,res,rej);}, []),
				DataCache.get('unitWisePlanOpexCapex', fy, function(res,rej){Fetchers.unitWisePlanOpexCapex(fy,res,rej);}, [])
			]).then(function (results) {
				Loader.hide('ppt');
				var d   = results[0];
				var raw = results[1];

				if (!d.length) {
					$('#ppt-tbody,#ppt-prev-tbody').html(
						'<tr><td colspan="9" style="text-align:center;padding:24px;color:#aaa;">No data.</td></tr>'
					);
					TabLoader.reportResult('ppt', fy, false);
					return;
				}

				$('#ppt-main-title').text('Overall Foundation \u2013 ' + curFY + ' Budget vs ' + prvFY + ' Actual');
				$('#ppt-prev-title').text('Overall Foundation \u2013 ' + prvFY + ' Budget vs ' + prvFY + ' Actual');

				var cCfg = { key: 'current_year',  budgetField: 'ytd', actualField: 'total_posted_amt_ytd' };
				var pCfg = { key: 'previous_year', budgetField: 'ytd', actualField: 'total_posted_amt_ytd' };
				var mainData = d.filter(function (e) { return e.is_this_sub_item !== 1; });
				var r0 = buildRows(mainData, cCfg);
				var r1 = buildRows(mainData, pCfg);

				renderTable(r0, 'ppt-tbody',      'ppt-budget-hdr',      'ppt-actual-hdr',      'ppt-table',      curFY + ' Budget', prvFY + ' Actual');
				renderTable(r1, 'ppt-prev-tbody', 'ppt-prev-budget-hdr', 'ppt-prev-actual-hdr', 'ppt-prev-table', prvFY + ' Budget', prvFY + ' Actual');

				var subHtml = buildEducationTables(d, cCfg, curFY + ' Budget', prvFY + ' Actual');

				var uwp = raw.filter(function (e) {
					return e.is_this_sub_item === 0
						&& e.sequence_id !== 9999
						&& (e.table_name || '').toUpperCase() !== 'CONSOLIDATED';
				}).sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });

				var opexHtml  = buildOpexBudgetTable(uwp, curFY);
				var capexHtml = buildCapexBudgetTable(uwp, curFY);
				$('#ppt-sub-tables').html(subHtml + opexHtml + capexHtml);

				$('#ppt-sub-tables .ppt-table-wrap').each(function () {
					var id = $(this).attr('id'); if (id) { fixStickySubHeader('#' + id); }
				});
				fixStickySubHeader('#ppt-opex-budget-tbl');
				fixStickySubHeader('#ppt-capex-budget-tbl');

				var toExp = function (rows) {
					return rows.map(function (r) {
						return { label: r.label, bOpex: r.bOpex, bCapex: r.bCapex, bCovid: r.bCovid, bTotal: r.bTotal,
							eOpex: r.eOpex, eCapex: r.eCapex, eCovid: r.eCovid, eTotal: r.eTotal, is_total: !!r.isTotal };
					});
				};
				Store.ppt.rows = toExp(r0); Store.ppt.prevRows = toExp(r1);
				Store.ppt.budgetLabel = curFY + ' Budget'; Store.ppt.actualLabel = prvFY + ' Actual';
				Store.ppt.prevBudgetLabel = prvFY + ' Budget'; Store.ppt.prevActualLabel = prvFY + ' Actual';
				TabLoader.reportResult('ppt', fy, true);

			}).catch(function () {
				Loader.hide('ppt');
				$('#ppt-tbody,#ppt-prev-tbody').html(
					'<tr><td colspan="9" style="text-align:center;padding:24px;color:red;">Error loading data.</td></tr>'
				);
				TabLoader.reportResult('ppt', fy, false);
			});
		}

		return { load: load };
	})();

	// =============================================================================
	// SUMMARY IN INR MODULE
	// =============================================================================

	var SummaryINR = (function () {
		function normN(s) { return (s || '').replace(/\s+/g, ' ').trim().toUpperCase(); }
		function zero() { return { opex_plan: 0, opex_act: 0, capex_plan: 0, capex_act: 0, covid_plan: 0, covid_act: 0, total_plan: 0, total_act: 0 }; }
		function addV(a, b) { return { opex_plan: a.opex_plan + b.opex_plan, opex_act: a.opex_act + b.opex_act, capex_plan: a.capex_plan + b.capex_plan, capex_act: a.capex_act + b.capex_act, covid_plan: a.covid_plan + b.covid_plan, covid_act: a.covid_act + b.covid_act, total_plan: a.total_plan + b.total_plan, total_act: a.total_act + b.total_act }; }
		function extractA(actuals) {
			var r = zero();
			(actuals || []).forEach(function (sec) {
				var nm = normN(sec.name);
				if (nm === 'OPERATING EXPENSES' || nm === 'OPERATING  EXPENSES') { r.opex_plan += parseFloat(sec.ytd || 0); r.opex_act += parseFloat(sec.total_posted_amt_ytd || 0); }
				if (nm === 'CAPITAL EXPENSES'   || nm === 'CAPITAL  EXPENSES')   { r.capex_plan += parseFloat(sec.ytd || 0); r.capex_act += parseFloat(sec.total_posted_amt_ytd || 0); }
				if (nm.indexOf('COVID') !== -1) { r.covid_plan += parseFloat(sec.ytd || 0); r.covid_act += parseFloat(sec.total_posted_amt_ytd || 0); }
			});
			r.total_plan = r.opex_plan + r.capex_plan + r.covid_plan; r.total_act = r.opex_act + r.capex_act + r.covid_act;
			return r;
		}
		function getConsolidatedTotals(data) {
			var ct = null;
			(data || []).forEach(function (e) {
				if (e.sequence_id === 9999 || (e.table_name || '').toUpperCase() === 'CONSOLIDATED') { ct = e; }
			});
			if (!ct) { return null; }
			var r = zero();
			(ct.actuals || []).forEach(function (a) {
				var nm = (a.name || '').toUpperCase().replace(/\s+/g, ' ').trim();
				if (nm === 'OPEX TOTAL')         { r.opex_plan += parseFloat(a.ytd || 0); r.opex_act += parseFloat(a.total_posted_amt_ytd || 0); }
				if (nm === 'CAPEX TOTAL')         { r.capex_plan += parseFloat(a.ytd || 0); r.capex_act += parseFloat(a.total_posted_amt_ytd || 0); }
				if (nm === 'COVID TOTAL')         { r.covid_plan += parseFloat(a.ytd || 0); r.covid_act += parseFloat(a.total_posted_amt_ytd || 0); }
				if (nm === 'OVERALL GRAND TOTAL') { r.total_plan = parseFloat(a.ytd || 0); r.total_act = parseFloat(a.total_posted_amt_ytd || 0); }
			});
			if (!r.total_plan && !r.total_act) { r.total_plan = r.opex_plan + r.capex_plan + r.covid_plan; r.total_act = r.opex_act + r.capex_act + r.covid_act; }
			return r;
		}
		function buildRowsA(data) {
			var sorted = (data || []).slice().sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });
			var norm = [], covid = [];
			sorted.forEach(function (e) {
				if (e.sequence_id === 9999 || (e.table_name || '').toUpperCase() === 'CONSOLIDATED') { return; }
				var lbl = (e.label || '').trim();
				var row = { display: lbl, isSub: e.is_this_sub_item === 1, isCovid: lbl.toLowerCase().indexOf('covid') !== -1, vals: extractA(e.actuals) };
				(row.isCovid ? covid : norm).push(row);
			});
			var gtVals = getConsolidatedTotals(data) || zero();
			var out = norm.slice();
			if (covid.length) { out = out.concat(covid); }
			out.push({ display: 'Grand Total', isTotal: true, isGrandTotal: true, vals: gtVals });
			return out;
		}
		function rowHtmlA(r, pLbl, aLbl) {
			var cls = r.isGrandTotal ? 'cb-row-grand' : (r.isTotal ? 'sinr-total-row' : (r.isCovid ? 'sinr-covid-row' : ''));
			var sty = 'text-align:left;' + (r.isSub ? 'padding-left:28px;color:#555;' : '');
			var v = r.vals;
			return '<tr class="' + cls + '"><td style="' + sty + '">' + r.display + '</td><td>' + fmtCr(v.opex_plan, r.display + ' \u00b7 ' + pLbl + ' \u00b7 Opex') + '</td><td>' + fmtCr(v.capex_plan, r.display + ' \u00b7 ' + pLbl + ' \u00b7 Capex') + '</td><td>' + fmtCr(v.covid_plan, r.display + ' \u00b7 ' + pLbl + ' \u00b7 Covid') + '</td><td>' + fmtCr(v.total_plan, r.display + ' \u00b7 ' + pLbl + ' \u00b7 Total') + '</td><td>' + fmtCr(v.opex_act, r.display + ' \u00b7 ' + aLbl + ' \u00b7 Opex') + '</td><td>' + fmtCr(v.capex_act, r.display + ' \u00b7 ' + aLbl + ' \u00b7 Capex') + '</td><td>' + fmtCr(v.covid_act, r.display + ' \u00b7 ' + aLbl + ' \u00b7 Covid') + '</td><td>' + fmtCr(v.total_act, r.display + ' \u00b7 ' + aLbl + ' \u00b7 Total') + '</td></tr>';
		}
		function tableHtmlA(rows, pLbl, aLbl) {
			return '<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
				'<div class="cb-scroll-wrapper" style="margin-bottom:28px;"><table class="cb-table sinr-table" id="sinr-table-a" style="width:100%;"><thead>' +
				'<tr class="cb-thead-main"><th rowspan="2" style="text-align:left !important;min-width:260px;">Unit / Function</th><th colspan="4" style="text-align:center !important;">' + pLbl + '</th><th colspan="4" style="text-align:center !important;">' + aLbl + '</th></tr>' +
				'<tr class="cb-thead-sub"><th>Opex</th><th>Capex</th><th>Covid</th><th>Total</th><th>Opex</th><th>Capex</th><th>Covid</th><th>Total</th></tr>' +
				'</thead><tbody>' + rows.map(function (r) { return rowHtmlA(r, pLbl, aLbl); }).join('') + '</tbody></table></div>';
		}
		function getSubNames(entries) {
			var seen = {}, names = [];
			entries.forEach(function (e) { (e.actuals || []).forEach(function (sec) { if (normN(sec.name).indexOf('OPERATING') === -1) { return; } (sec.sub_heads || []).forEach(function (sh) { var n = (sh.name || '').trim(); if (n && !seen[n]) { seen[n] = true; names.push(n); } }); }); });
			return names;
		}
		function shVal(actuals, name, field) { var v = 0; (actuals || []).forEach(function (sec) { if (normN(sec.name).indexOf('OPERATING') === -1) { return; } (sec.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === name) { v += parseFloat(field === 'plan' ? (sh.ytd || 0) : (sh.total_posted_amt_ytd || 0)); } }); }); return v; }
		function opT(a, f) { var v = 0; (a || []).forEach(function (s) { if (normN(s.name).indexOf('OPERATING') === -1) { return; } v += parseFloat(f === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); }); return v; }
		function caT(a, f) { var v = 0; (a || []).forEach(function (s) { if (normN(s.name).indexOf('CAPITAL') === -1) { return; } v += parseFloat(f === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); }); return v; }
		function coT(a, f) { var v = 0; (a || []).forEach(function (s) { if (normN(s.name).indexOf('COVID') === -1) { return; } v += parseFloat(f === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); }); return v; }
		function tableHtmlB(entries, shNames, pLbl, aLbl, consolidatedVals) {
			var cc = 1 + shNames.length + 4;
			var hdr = '<tr class="cb-thead-main"><th rowspan="2" style="text-align:left !important;min-width:210px;">Unit / Function</th><th colspan="' + (shNames.length + 1) + '" style="text-align:center !important;">Operating Expenses</th><th rowspan="2" style="text-align:center !important;min-width:110px;">Capex</th><th rowspan="2" style="text-align:center !important;min-width:110px;">Covid</th><th rowspan="2" style="text-align:center !important;min-width:110px;">Total</th></tr>' +
				'<tr class="cb-thead-sub">' + shNames.map(function (n) { return '<th style="min-width:110px;">' + n + '</th>'; }).join('') + '<th style="min-width:110px;">Total</th></tr>';
			var body = '', gtP = {}, gtA = {};
			shNames.forEach(function (n) { gtP[n] = 0; gtA[n] = 0; });
			var gtOP = 0, gtOA = 0, gtCP = 0, gtCA = 0, gtCoP = 0, gtCoA = 0;
			entries.forEach(function (e) {
				var lbl = (e.label || '').trim(), act = e.actuals || [], sP = {}, sA = {};
				shNames.forEach(function (n) { sP[n] = shVal(act, n, 'plan'); sA[n] = shVal(act, n, 'act'); gtP[n] += sP[n]; gtA[n] += sA[n]; });
				var oP = opT(act, 'plan'), oA = opT(act, 'act'), cP = caT(act, 'plan'), cA = caT(act, 'act'), coP = coT(act, 'plan'), coA = coT(act, 'act');
				gtOP += oP; gtOA += oA; gtCP += cP; gtCA += cA; gtCoP += coP; gtCoA += coA;
				body += '<tr class="sinr-unit-hdr"><td>' + lbl + '</td><td colspan="' + (shNames.length + 4) + '"></td></tr>';
				body += '<tr class="sinr-brkdwn-plan"><td style="padding-left:18px;color:#333;">- ' + pLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(sP[n], lbl + ' \u00b7 ' + pLbl + ' \u00b7 ' + n) + '</td>'; }).join('') + '<td>' + fmtCr(oP, lbl + ' \u00b7 ' + pLbl + ' \u00b7 Opex Total') + '</td><td>' + fmtCr(cP, lbl + ' \u00b7 ' + pLbl + ' \u00b7 Capex') + '</td><td>' + fmtCr(coP, lbl + ' \u00b7 ' + pLbl + ' \u00b7 Covid') + '</td><td>' + fmtCr(oP + cP + coP, lbl + ' \u00b7 ' + pLbl + ' \u00b7 Total') + '</td></tr>';
				body += '<tr class="sinr-brkdwn-act"><td style="padding-left:18px;color:#555;">- ' + aLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(sA[n], lbl + ' \u00b7 ' + aLbl + ' \u00b7 ' + n) + '</td>'; }).join('') + '<td>' + fmtCr(oA, lbl + ' \u00b7 ' + aLbl + ' \u00b7 Opex Total') + '</td><td>' + fmtCr(cA, lbl + ' \u00b7 ' + aLbl + ' \u00b7 Capex') + '</td><td>' + fmtCr(coA, lbl + ' \u00b7 ' + aLbl + ' \u00b7 Covid') + '</td><td>' + fmtCr(oA + cA + coA, lbl + ' \u00b7 ' + aLbl + ' \u00b7 Total') + '</td></tr>';
				body += '<tr class="sinr-spacer"><td colspan="' + cc + '"></td></tr>';
			});
			var finalOP = (consolidatedVals && consolidatedVals.opex_plan)  ? consolidatedVals.opex_plan  : gtOP;
			var finalOA = (consolidatedVals && consolidatedVals.opex_act)   ? consolidatedVals.opex_act   : gtOA;
			var finalCP = (consolidatedVals && consolidatedVals.capex_plan) ? consolidatedVals.capex_plan : gtCP;
			var finalCA = (consolidatedVals && consolidatedVals.capex_act)  ? consolidatedVals.capex_act  : gtCA;
			var finalCoP = (consolidatedVals && consolidatedVals.covid_plan) ? consolidatedVals.covid_plan : gtCoP;
			var finalCoA = (consolidatedVals && consolidatedVals.covid_act)  ? consolidatedVals.covid_act  : gtCoA;
			var finalTP = (consolidatedVals && consolidatedVals.total_plan) ? consolidatedVals.total_plan : (gtOP + gtCP + gtCoP);
			var finalTA = (consolidatedVals && consolidatedVals.total_act)  ? consolidatedVals.total_act  : (gtOA + gtCA + gtCoA);
			body += '<tr class="cb-row-grand"><td>Grand Total</td><td colspan="' + (shNames.length + 4) + '"></td></tr>';
			body += '<tr class="sinr-gt-plan"><td style="padding-left:18px;">- ' + pLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(gtP[n], 'Grand Total \u00b7 ' + pLbl + ' \u00b7 ' + n) + '</td>'; }).join('') + '<td>' + fmtCr(finalOP, 'Grand Total \u00b7 ' + pLbl + ' \u00b7 Opex Total') + '</td><td>' + fmtCr(finalCP, 'Grand Total \u00b7 ' + pLbl + ' \u00b7 Capex') + '</td><td>' + fmtCr(finalCoP, 'Grand Total \u00b7 ' + pLbl + ' \u00b7 Covid') + '</td><td>' + fmtCr(finalTP, 'Grand Total \u00b7 ' + pLbl + ' \u00b7 Total') + '</td></tr>';
			body += '<tr class="sinr-gt-act"><td style="padding-left:18px;">- ' + aLbl + '</td>' + shNames.map(function (n) { return '<td>' + fmtCr(gtA[n], 'Grand Total \u00b7 ' + aLbl + ' \u00b7 ' + n) + '</td>'; }).join('') + '<td>' + fmtCr(finalOA, 'Grand Total \u00b7 ' + aLbl + ' \u00b7 Opex Total') + '</td><td>' + fmtCr(finalCA, 'Grand Total \u00b7 ' + aLbl + ' \u00b7 Capex') + '</td><td>' + fmtCr(finalCoA, 'Grand Total \u00b7 ' + aLbl + ' \u00b7 Covid') + '</td><td>' + fmtCr(finalTA, 'Grand Total \u00b7 ' + aLbl + ' \u00b7 Total') + '</td></tr>';
			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="sinr-table-b" style="width:100%;border-collapse:collapse;"><thead>' + hdr + '</thead><tbody>' + body + '</tbody></table></div>';
		}

		function tableHtmlOpexCapex(rows, pLbl, aLbl) {
			var gt = null;
			(rows || []).forEach(function (r) { if (r.isGrandTotal) { gt = r.vals; } });
			if (!gt) { return ''; }
			function pct(part, total) { if (!total || !isFinite(total) || total === 0) { return '-'; } return ((part / total) * 100).toFixed(1) + '%'; }
			var opexPctPlan  = pct(gt.opex_plan,  gt.total_plan);
			var capexPctPlan = pct(gt.capex_plan, gt.total_plan);
			var opexPctEst   = pct(gt.opex_act,   gt.total_act);
			var capexPctEst  = pct(gt.capex_act,  gt.total_act);
			var hdr = '<tr class="cb-thead-main"><th style="text-align:left !important;min-width:160px;"></th><th style="text-align:center !important;min-width:120px;">' + pLbl + '</th><th style="text-align:center !important;min-width:120px;">' + aLbl + '</th></tr>';
			var body = '<tr><td style="text-align:left;">Opex</td><td>' + opexPctPlan + '</td><td>' + opexPctEst + '</td></tr>' +
				'<tr><td style="text-align:left;">Capex</td><td>' + capexPctPlan + '</td><td>' + capexPctEst + '</td></tr>' +
				'<tr class="sinr-total-row"><td style="text-align:left;font-weight:700;">Total</td><td style="font-weight:700;">100.0%</td><td style="font-weight:700;">100.0%</td></tr>';
			if (!$('#sinr-oc-style').length) {
				$('head').append('<style id="sinr-oc-style">#sinr-table-oc{border-collapse:collapse !important;width:auto;}' +
					'#sinr-table-oc th,#sinr-table-oc td{border:1px solid var(--bdl) !important;padding:8px 16px;white-space:nowrap;text-align:right;font-family:var(--font);font-size:var(--fs-base);}' +
					'#sinr-table-oc th:first-child,#sinr-table-oc td:first-child{text-align:left !important;}' +
					'#sinr-table-oc thead tr th{background:var(--blue-mid) !important;color:#fff !important;font-weight:var(--fw-b);font-size:var(--fs-lg);text-align:center !important;border:1px solid var(--bdh) !important;padding:10px 16px;}' +
					'#sinr-table-oc thead tr th:first-child{text-align:left !important;min-width:160px;}' +
					'#sinr-table-oc tbody tr.sinr-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:var(--fw-b) !important;border:1px solid #5a6472 !important;}</style>');
			}
			return '<div style="margin-bottom:24px;"><table id="sinr-table-oc"><thead>' + hdr + '</thead><tbody>' + body + '</tbody></table></div>';
		}

		// ── Quarter Phasing table ─────────────────────────────────────────────────
		function tableHtmlQuarterPhasing(curFY, planData, prevFY, actualData) {
			// Category helpers — match row.name values from both APIs exactly
			function isCapex(n){ return (n||'').toUpperCase().replace(/\s+/g,' ').indexOf('CAPITAL')!==-1; }
			function isOpex(n) { return (n||'').toUpperCase().replace(/\s+/g,' ').indexOf('OPERATING')!==-1; }

			// ── Current FY budget ─────────────────────────────────────────────────────
			// Source: get_consolidated_report  (same data the Annual Budget tab renders)
			// row.q1/q2/q3/q4 = array of 3 monthly raw values  [Apr, May, Jun], etc.
			// Annual tab Grand Total: for each row, sum ALL 3 months → sumArr([v1,v2,v3])
			// We do exactly the same, but split into Capex vs Opex.
			function arrSum(a){ var t=0; (a||[]).forEach(function(v){t+=(parseFloat(v)||0);}); return t; }

			// Capex/Opex category accumulators (for their own rows)
			var curCQ1=0,curCQ2=0,curCQ3=0,curCQ4=0;
			var curOQ1=0,curOQ2=0,curOQ3=0,curOQ4=0;
			// Grand Total accumulators: ALL rows (matches Annual tab which sums every row)
			var curTQ1=0,curTQ2=0,curTQ3=0,curTQ4=0;
			(planData||[]).forEach(function(row){
				var q1=arrSum(row.q1), q2=arrSum(row.q2), q3=arrSum(row.q3), q4=arrSum(row.q4);
				// ALL rows contribute to grand total (Annual tab does the same via grand accumulator)
				curTQ1+=q1; curTQ2+=q2; curTQ3+=q3; curTQ4+=q4;
				// Only Capex/Opex rows go into their own line
				if     (isCapex(row.name)){ curCQ1+=q1; curCQ2+=q2; curCQ3+=q3; curCQ4+=q4; }
				else if(isOpex(row.name)) { curOQ1+=q1; curOQ2+=q2; curOQ3+=q3; curOQ4+=q4; }
			});

			// ── Previous FY actuals ───────────────────────────────────────────────────
			// Source: get_grouped_actuals  (same data the Actuals Consolidated tab renders)
			// row.Q1/Q2/Q3/Q4 = direct quarter totals; Actuals Consolidated tab reads via qTot() — same here.
			var prvCQ1=0,prvCQ2=0,prvCQ3=0,prvCQ4=0;
			var prvOQ1=0,prvOQ2=0,prvOQ3=0,prvOQ4=0;
			// Grand Total: ALL rows (matches Actuals Consolidated tab Grand Total row)
			var prvTQ1=0,prvTQ2=0,prvTQ3=0,prvTQ4=0;
			(actualData||[]).forEach(function(row){
				var q1=parseFloat(row.Q1||0), q2=parseFloat(row.Q2||0);
				var q3=parseFloat(row.Q3||0), q4=parseFloat(row.Q4||0);
				// ALL rows go into grand total
				prvTQ1+=q1; prvTQ2+=q2; prvTQ3+=q3; prvTQ4+=q4;
				// Only Capex/Opex go into their own rows
				if     (isCapex(row.name)){ prvCQ1+=q1; prvCQ2+=q2; prvCQ3+=q3; prvCQ4+=q4; }
				else if(isOpex(row.name)) { prvOQ1+=q1; prvOQ2+=q2; prvOQ3+=q3; prvOQ4+=q4; }
			});

			function toCr(v){ return (Math.abs(parseFloat(v))/10000000).toFixed(1); }
			function pct(part,total){ if(!total||total===0){return '0.0%';} return ((Math.abs(part)/Math.abs(total))*100).toFixed(1)+'%'; }
			function vCell(v,bold,ctx){ var n=parseFloat(v)||0; var full='\u20B9 '+(n<0?'-':'')+formatINR(Math.abs(n)); var crShort=(n<0?'-':'')+toCr(v)+' Cr'; var sub=ctx?(crShort+' \u00b7 '+ctx):crShort; return '<td'+(bold?' style="font-weight:700;"':'')+'><span class="cb-tt" data-full="'+escAttr(full)+'" data-sub="'+escAttr(sub)+'">'+toCr(v)+'</span></td>'; }
			function pCell(p,t){ return '<td style="color:#666;font-style:italic;font-size:var(--fs-xs);">'+pct(p,t)+'</td>'; }

			// fyBlock: tq1-tq4 = grand total across ALL rows (matches each tab's Grand Total row)
			//          cq/oq   = category-only totals (for Capex/Opex individual lines)
			function fyBlock(fyLabel, cq1,cq2,cq3,cq4, oq1,oq2,oq3,oq4, tq1,tq2,tq3,tq4){
				var ct=cq1+cq2+cq3+cq4, ot=oq1+oq2+oq3+oq4, tt=tq1+tq2+tq3+tq4;
				return (
					'<tr class="qp-fy-hdr"><td>'+fyLabel+'</td><td>Qtr-1</td><td>Qtr-2</td><td>Qtr-3</td><td>Qtr-4</td><td>Total</td></tr>'+
					'<tr><td>Capex</td>'+vCell(cq1,false,fyLabel+' \u00b7 Capex \u00b7 Qtr-1')+vCell(cq2,false,fyLabel+' \u00b7 Capex \u00b7 Qtr-2')+vCell(cq3,false,fyLabel+' \u00b7 Capex \u00b7 Qtr-3')+vCell(cq4,false,fyLabel+' \u00b7 Capex \u00b7 Qtr-4')+vCell(ct,true,fyLabel+' \u00b7 Capex \u00b7 Total')+'</tr>'+
					'<tr class="qp-pct-row"><td><em>% Phasing</em></td>'+pCell(cq1,ct)+pCell(cq2,ct)+pCell(cq3,ct)+pCell(cq4,ct)+'<td style="font-style:italic;font-size:var(--fs-xs);">100.0%</td></tr>'+
					'<tr class="qp-spacer"><td colspan="6"></td></tr>'+
					'<tr><td>Opex</td>'+vCell(oq1,false,fyLabel+' \u00b7 Opex \u00b7 Qtr-1')+vCell(oq2,false,fyLabel+' \u00b7 Opex \u00b7 Qtr-2')+vCell(oq3,false,fyLabel+' \u00b7 Opex \u00b7 Qtr-3')+vCell(oq4,false,fyLabel+' \u00b7 Opex \u00b7 Qtr-4')+vCell(ot,true,fyLabel+' \u00b7 Opex \u00b7 Total')+'</tr>'+
					'<tr class="qp-pct-row"><td><em>% Phasing</em></td>'+pCell(oq1,ot)+pCell(oq2,ot)+pCell(oq3,ot)+pCell(oq4,ot)+'<td style="font-style:italic;font-size:var(--fs-xs);">100.0%</td></tr>'+
					'<tr class="qp-spacer"><td colspan="6"></td></tr>'+
					'<tr class="qp-total-row"><td>Total</td>'+vCell(tq1,true,fyLabel+' \u00b7 Total \u00b7 Qtr-1')+vCell(tq2,true,fyLabel+' \u00b7 Total \u00b7 Qtr-2')+vCell(tq3,true,fyLabel+' \u00b7 Total \u00b7 Qtr-3')+vCell(tq4,true,fyLabel+' \u00b7 Total \u00b7 Qtr-4')+vCell(tt,true,fyLabel+' \u00b7 Total \u00b7 Total')+'</tr>'+
					'<tr class="qp-pct-row"><td><em>% Phasing</em></td>'+pCell(tq1,tt)+pCell(tq2,tt)+pCell(tq3,tt)+pCell(tq4,tt)+'<td style="font-style:italic;font-size:var(--fs-xs);">100.0%</td></tr>'
				);
			}

			var body =
				// tQN accumulators include ALL rows (COVID etc.) — matches tab Grand Total exactly
				fyBlock(curFY,  curCQ1,curCQ2,curCQ3,curCQ4, curOQ1,curOQ2,curOQ3,curOQ4, curTQ1,curTQ2,curTQ3,curTQ4)+
				'<tr class="qp-fy-gap"><td colspan="6"></td></tr>'+
				fyBlock(prevFY, prvCQ1,prvCQ2,prvCQ3,prvCQ4, prvOQ1,prvOQ2,prvOQ3,prvOQ4, prvTQ1,prvTQ2,prvTQ3,prvTQ4);

			// Returns only the table — labels/currency-note added by caller with lettered prefix
			return (
				'<div style="overflow-x:auto;margin-bottom:28px;">'+
				'<table id="qp-table"><tbody>'+body+'</tbody></table>'+
				'</div>'
			);
		}

		function tableHtmlCPE(planData, headcountRecords, fy, pLbl, aLbl) {
			if (!planData || !planData.length) { return ''; }
			var fp = (fy || '2025-26').split('-');
			var curFYKey      = fy;
			var prevFYKey     = (parseInt(fp[0], 10) - 1) + '-' + String(parseInt(fp[1], 10) - 1).padStart(2, '0');
			var prevPrevFYKey = (parseInt(fp[0], 10) - 2) + '-' + String(parseInt(fp[1], 10) - 2).padStart(2, '0');
			function isOpex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1; }
			function getAvgHC(fyKey) {
				var sorted = (headcountRecords || []).filter(function (r) { return !!r.financial_year; })
					.slice().sort(function (a, b) { return (a.financial_year || '').localeCompare(b.financial_year || ''); });
				var idx = -1;
				for (var i = 0; i < sorted.length; i++) { if (sorted[i].financial_year === fyKey) { idx = i; break; } }
				if (idx === -1) { return 0; }
				var curTotal = parseFloat(sorted[idx].total_head_count || sorted[idx].total_headcount || sorted[idx].headcount || 0);
				if (idx === 0) { return curTotal / 2; }
				var prevTotal = parseFloat(sorted[idx - 1].total_head_count || sorted[idx - 1].total_headcount || sorted[idx - 1].headcount || 0);
				return (prevTotal + curTotal) / 2;
			}
			var avgHCPlan = getAvgHC(prevFYKey);
			var avgHCEst  = getAvgHC(prevPrevFYKey);
			var sourceRows = (planData || []).filter(function (e) {
				return e.is_this_sub_item === 0 && e.sequence_id !== 9999 && (e.table_name || '').toUpperCase() !== 'CONSOLIDATED';
			});
			var shNames = [], shSeen = {};
			sourceRows.forEach(function (e) {
				(e.actuals || []).forEach(function (s) {
					if (!isOpex(s.name)) { return; }
					(s.sub_heads || []).forEach(function (sh) { var n = (sh.name || '').trim(); if (n && !shSeen[n]) { shSeen[n] = true; shNames.push(n); } });
				});
			});
			function shRawPlan(shName) { var v = 0; sourceRows.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (!isOpex(s.name)) { return; } (s.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === shName) { v += parseFloat(sh.ytd || 0); } }); }); }); return v; }
			function shRawEst(shName)  { var v = 0; sourceRows.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (!isOpex(s.name)) { return; } (s.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === shName) { v += parseFloat(sh.total_posted_amt_ytd || 0); } }); }); }); return v; }
			function opexRawPlan() { var v = 0; sourceRows.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (isOpex(s.name)) { v += parseFloat(s.ytd || 0); } }); }); return v; }
			function opexRawEst()  { var v = 0; sourceRows.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (isOpex(s.name)) { v += parseFloat(s.total_posted_amt_ytd || 0); } }); }); return v; }
			var totalRawPlan = opexRawPlan(), totalRawEst = opexRawEst();
			var dataRows = shNames.map(function (shName) {
				var rp = shRawPlan(shName), re = shRawEst(shName);
				var inrCrPlan = rp / 10000000, inrCrEst = re / 10000000;
				var cpaPlan = (avgHCPlan > 0) ? (inrCrPlan / avgHCPlan * 1000) : 0;
				var cpaEst  = (avgHCEst  > 0) ? (inrCrEst  / avgHCEst  * 1000) : 0;
				var cpmPlan = cpaPlan / 12, cpmEst = cpaEst / 12;
				var mixPlan = (totalRawPlan > 0) ? (rp / totalRawPlan * 100) : 0;
				var mixEst  = (totalRawEst  > 0) ? (re / totalRawEst  * 100) : 0;
				var ppInc   = (cpaEst > 0) ? ((cpaPlan / cpaEst) - 1) * 100 : null;
				return { name: shName, inrCrPlan: inrCrPlan, inrCrEst: inrCrEst, cpaPlan: cpaPlan, cpaEst: cpaEst, cpmPlan: cpmPlan, cpmEst: cpmEst, mixPlan: mixPlan, mixEst: mixEst, ppInc: ppInc };
			});
			var ttlInrCrPlan = totalRawPlan/10000000, ttlInrCrEst = totalRawEst/10000000;
			var ttlCpaPlan = (avgHCPlan>0)?((totalRawPlan/10000000)/avgHCPlan*1000):0;
			var ttlCpaEst  = (avgHCEst >0)?((totalRawEst /10000000)/avgHCEst *1000):0;
			var ttlCpmPlan = ttlCpaPlan/12, ttlCpmEst = ttlCpaEst/12;
			var ttlPpInc   = (ttlCpaEst>0)?((ttlCpaPlan/ttlCpaEst)-1)*100:null;
			function fmtInrCr(v,ctx){ var n=parseFloat(v)||0; if(!isFinite(n)){return '-';} if(Math.abs(n)<0.005){return n===0?'-':'0.00';} var neg=n<0,abs=Math.abs(n),s=abs.toFixed(2).split('.'),ip=s[0],dp=s[1]; if(ip.length>3){ip=ip.slice(0,-3).replace(/\B(?=(\d{2})+(?!\d))/g,',')+','+ip.slice(-3);} var crText=(neg?'-':'')+ip+'.'+dp; var full='\u20B9 '+(neg?'-':'')+formatINR(abs*10000000); var crShort=crText+' Cr'; var sub=ctx?(crShort+' \u00b7 '+ctx):crShort; return '<span class="cb-tt" data-full="'+escAttr(full)+'" data-sub="'+escAttr(sub)+'">'+crText+'</span>'; }
			function fmtK(v){ var n=parseFloat(v)||0; if(!isFinite(n)||n===0){return '-';} return (n<0?'-':'')+Math.abs(n).toFixed(2); }
			function fmtMix(v){ var n=parseFloat(v)||0; if(!isFinite(n)||n===0){return '0%';} return Math.round(n)+'%'; }
			function fmtInc(v){ if(v===null||v===undefined||isNaN(v)||!isFinite(v)){return '-';} var n=Math.round(parseFloat(v)); return (n>0?'+':'')+n+'%'; }
			function incStyle(v){ if(v===null||v===undefined||isNaN(v)||!isFinite(v)){return '';} var n=parseFloat(v); return n<0?' style="color:#c0392b;font-weight:600;"':(n>0?' style="color:#1a7a3a;font-weight:600;"':''); }
			var hdr1='<tr class="cb-thead-main"><th rowspan="3" style="min-width:220px;text-align:left !important;vertical-align:middle;">Overall Foundation</th><th colspan="2" style="text-align:center !important;min-width:200px;">INR</th><th colspan="2" style="text-align:center !important;min-width:200px;">Cost / Person p.a.(Rs K)</th><th colspan="2" style="text-align:center !important;min-width:200px;">Cost / Person p.m.(Rs K)</th><th colspan="2" style="text-align:center !important;min-width:180px;">% Mix</th><th rowspan="3" style="text-align:center !important;min-width:150px;vertical-align:middle;">Increase in PPC<br>('+fy+' vs. '+prevFYKey+')</th></tr>';
			var hdr2='<tr class="cb-thead-sub"><th style="min-width:100px;">'+fy+'</th><th style="min-width:100px;">'+prevFYKey+'</th><th style="min-width:100px;">'+fy+'</th><th style="min-width:100px;">'+prevFYKey+'</th><th style="min-width:100px;">'+fy+'</th><th style="min-width:100px;">'+prevFYKey+'</th><th style="min-width:90px;">'+fy+'</th><th style="min-width:90px;">'+prevFYKey+'</th></tr>';
			var hdr3='<tr class="cb-thead-sub2"><th>Plan</th><th>Actual</th><th>Plan</th><th>Actual</th><th>Plan</th><th>Actual</th><th>Plan</th><th>Actual</th></tr>';
			var bodyHtml='';
			dataRows.forEach(function(row){
				bodyHtml+='<tr><td>'+row.name+'</td><td>'+fmtInrCr(row.inrCrPlan,row.name+' \u00b7 '+fy+' Plan')+'</td><td>'+fmtInrCr(row.inrCrEst,row.name+' \u00b7 '+prevFYKey+' Est')+'</td><td>'+fmtK(row.cpaPlan)+'</td><td>'+fmtK(row.cpaEst)+'</td><td>'+fmtK(row.cpmPlan)+'</td><td>'+fmtK(row.cpmEst)+'</td><td>'+fmtMix(row.mixPlan)+'</td><td>'+fmtMix(row.mixEst)+'</td><td'+incStyle(row.ppInc)+'>'+fmtInc(row.ppInc)+'</td></tr>';
			});
			bodyHtml+='<tr class="cpe-total-row"><td>Total Operating Expenses</td><td>'+fmtInrCr(ttlInrCrPlan,'Total Operating Expenses \u00b7 '+fy+' Plan')+'</td><td>'+fmtInrCr(ttlInrCrEst,'Total Operating Expenses \u00b7 '+prevFYKey+' Est')+'</td><td>'+fmtK(ttlCpaPlan)+'</td><td>'+fmtK(ttlCpaEst)+'</td><td>'+fmtK(ttlCpmPlan)+'</td><td>'+fmtK(ttlCpmEst)+'</td><td>100%</td><td>100%</td><td'+incStyle(ttlPpInc)+'>'+fmtInc(ttlPpInc)+'</td></tr>';
			return '<div id="sinr-cpe-wrap"><div class="sinr-section-label" style="margin-top:28px;">E. Cost per Employee - Comparison</div><div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="sinr-cpe-table" class="cb-table"><thead>'+hdr1+hdr2+hdr3+'</thead><tbody>'+bodyHtml+'</tbody></table></div></div>';
		}

		function tableHtmlC(entries, pLbl, aLbl) {
			if (!entries || !entries.length) { return ''; }
			function isOpex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1; }
			var shNames = [], shSeen = {};
			entries.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (!isOpex(s.name)) { return; } (s.sub_heads || []).forEach(function (sh) { var n = (sh.name || '').trim(); if (n && !shSeen[n]) { shSeen[n] = true; shNames.push(n); } }); }); });
			if (!shNames.length) { return ''; }
			function shPlan(e, shName) { var v = 0; (e.actuals || []).forEach(function (s) { if (!isOpex(s.name)) { return; } (s.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === shName) { v += parseFloat(sh.ytd || 0); } }); }); return v; }
			function shAct(e, shName)  { var v = 0; (e.actuals || []).forEach(function (s) { if (!isOpex(s.name)) { return; } (s.sub_heads || []).forEach(function (sh) { if ((sh.name || '').trim() === shName) { v += parseFloat(sh.total_posted_amt_ytd || 0); } }); }); return v; }
			function opexTotal(e, field) { var v = 0; (e.actuals || []).forEach(function (s) { if (isOpex(s.name)) { v += parseFloat(field === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); } }); return v; }
			var tblId = 'sinr-table-c';
			if (!$('#sinr-c-style').length) {
				$('head').append('<style id="sinr-c-style">#'+tblId+'{border-collapse:collapse !important;width:100%;}#'+tblId+' th,#'+tblId+' td{border:1px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;}#'+tblId+' thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);border:1px solid var(--bdh) !important;position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}#'+tblId+' thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);border:1px solid var(--bdo) !important;position:sticky;z-index:24;text-align:center !important;min-width:120px;padding:8px 12px;}#'+tblId+' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:55 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:220px;vertical-align:middle;}#'+tblId+' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:220px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1px solid var(--bdl) !important;}#'+tblId+' tbody tr.ppt-total-row td:first-child{position:sticky;left:0;z-index:10;background:#e8f0fa !important;}#'+tblId+' .sinr-c-gtcol{background:#ddeaf7 !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;}#'+tblId+' tr.ppt-total-row .sinr-c-gtcol{background:#c8ddf0 !important;color:var(--blue-dark) !important;}</style>');
			}
			var hdr1 = '<tr class="cb-thead-main"><th rowspan="2" style="min-width:220px;text-align:left !important;vertical-align:middle;position:sticky;left:0;z-index:55 !important;top:0;background:var(--blue-mid) !important;">Expense Category</th>';
			entries.forEach(function (e) { hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;">' + (e.label || '').trim() + '</th>'; });
			hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;background:var(--blue-dark) !important;border:1px solid #001f3f !important;">Grand Total</th></tr>';
			var hdr2 = '<tr class="cb-thead-sub">';
			entries.forEach(function () { hdr2 += '<th style="min-width:120px;text-align:center !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;">' + aLbl + '</th>'; });
			hdr2 += '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1px solid #001f3f !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1px solid #001f3f !important;">' + aLbl + '</th></tr>';
			var bodyHtml = '', gtBudget = 0, gtActual = 0;
			shNames.forEach(function (shName) {
				var rowBudget = 0, rowActual = 0, cells = '';
				entries.forEach(function (e) { var bp = shPlan(e, shName), ba = shAct(e, shName), lbl=(e.label||'').trim(); rowBudget += bp; rowActual += ba; cells += '<td>' + fmtCrDash(bp, shName+' \u00b7 '+lbl+' \u00b7 '+pLbl) + '</td><td>' + fmtCrDash(ba, shName+' \u00b7 '+lbl+' \u00b7 '+aLbl) + '</td>'; });
				gtBudget += rowBudget; gtActual += rowActual;
				bodyHtml += '<tr><td>' + shName + '</td>' + cells + '<td class="sinr-c-gtcol" style="font-weight:700;">' + fmtCrDash(rowBudget, shName+' \u00b7 Grand Total \u00b7 '+pLbl) + '</td><td class="sinr-c-gtcol" style="font-weight:700;">' + fmtCrDash(rowActual, shName+' \u00b7 Grand Total \u00b7 '+aLbl) + '</td></tr>';
			});
			var totalCells = '', totalBudget = 0, totalActual = 0;
			entries.forEach(function (e) { var bp = opexTotal(e, 'plan'), ba = opexTotal(e, 'act'), lbl=(e.label||'').trim(); totalBudget += bp; totalActual += ba; totalCells += '<td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(bp, 'Total \u00b7 '+lbl+' \u00b7 '+pLbl) + '</td><td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(ba, 'Total \u00b7 '+lbl+' \u00b7 '+aLbl) + '</td>'; });
			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells + '<td class="sinr-c-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalBudget, 'Total \u00b7 Grand Total \u00b7 '+pLbl) + '</td><td class="sinr-c-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalActual, 'Total \u00b7 Grand Total \u00b7 '+aLbl) + '</td></tr>';
			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="' + tblId + '" class="cb-table"><thead>' + hdr1 + hdr2 + '</thead><tbody>' + bodyHtml + '</tbody></table></div>';
		}

		function tableHtmlD(entries, pLbl, aLbl) {
			if (!entries || !entries.length) { return ''; }
			function isCapex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('CAPITAL') !== -1; }
			var itemNames = [], itemSeen = {};
			entries.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (!isCapex(s.name)) { return; } (s.items || []).forEach(function (item) { var n = (item.name || '').trim(); if (n && !itemSeen[n]) { itemSeen[n] = true; itemNames.push(n); } }); }); });
			if (!itemNames.length) { return ''; }
			function itemPlan(e, itemName) { var v = 0; (e.actuals || []).forEach(function (s) { if (!isCapex(s.name)) { return; } (s.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); } }); }); return v; }
			function itemAct(e, itemName)  { var v = 0; (e.actuals || []).forEach(function (s) { if (!isCapex(s.name)) { return; } (s.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.total_posted_amt_ytd || item.total_posted_amt || 0); } }); }); return v; }
			function capexTotal(e, field)  { var v = 0; (e.actuals || []).forEach(function (s) { if (isCapex(s.name)) { v += parseFloat(field === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); } }); return v; }
			var tblId = 'sinr-table-d';
			if (!$('#sinr-d-style').length) {
				$('head').append('<style id="sinr-d-style">#'+tblId+'{border-collapse:collapse !important;width:100%;}#'+tblId+' th,#'+tblId+' td{border:1px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;}#'+tblId+' thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);border:1px solid var(--bdh) !important;position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}#'+tblId+' thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);border:1px solid var(--bdo) !important;position:sticky;z-index:24;text-align:center !important;min-width:120px;padding:8px 12px;}#'+tblId+' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:55 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:220px;vertical-align:middle;}#'+tblId+' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:220px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1px solid var(--bdl) !important;}#'+tblId+' .sinr-d-gtcol{background:#ddeaf7 !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;}#'+tblId+' tr.ppt-total-row .sinr-d-gtcol{background:#c8ddf0 !important;color:var(--blue-dark) !important;}</style>');
			}
			var hdr1 = '<tr class="cb-thead-main"><th rowspan="2" style="min-width:220px;text-align:left !important;vertical-align:middle;position:sticky;left:0;z-index:55 !important;top:0;background:var(--blue-mid) !important;">Expense Category</th>';
			entries.forEach(function (e) { hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;">' + (e.label || '').trim() + '</th>'; });
			hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;background:var(--blue-dark) !important;border:1px solid #001f3f !important;">Grand Total</th></tr>';
			var hdr2 = '<tr class="cb-thead-sub">';
			entries.forEach(function () { hdr2 += '<th style="min-width:120px;text-align:center !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;">' + aLbl + '</th>'; });
			hdr2 += '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1px solid #001f3f !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1px solid #001f3f !important;">' + aLbl + '</th></tr>';
			var bodyHtml = '';
			itemNames.forEach(function (itemName) {
				var rowBudget = 0, rowActual = 0, cells = '';
				entries.forEach(function (e) { var bp = itemPlan(e, itemName), ba = itemAct(e, itemName), lbl=(e.label||'').trim(); rowBudget += bp; rowActual += ba; cells += '<td>' + fmtCrDash(bp, itemName+' \u00b7 '+lbl+' \u00b7 '+pLbl) + '</td><td>' + fmtCrDash(ba, itemName+' \u00b7 '+lbl+' \u00b7 '+aLbl) + '</td>'; });
				bodyHtml += '<tr><td>' + itemName + '</td>' + cells + '<td class="sinr-d-gtcol" style="font-weight:700;">' + fmtCrDash(rowBudget, itemName+' \u00b7 Grand Total \u00b7 '+pLbl) + '</td><td class="sinr-d-gtcol" style="font-weight:700;">' + fmtCrDash(rowActual, itemName+' \u00b7 Grand Total \u00b7 '+aLbl) + '</td></tr>';
			});
			var totalCells = '', totalBudget = 0, totalActual = 0;
			entries.forEach(function (e) { var bp = capexTotal(e, 'plan'), ba = capexTotal(e, 'act'), lbl=(e.label||'').trim(); totalBudget += bp; totalActual += ba; totalCells += '<td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(bp, 'Total \u00b7 '+lbl+' \u00b7 '+pLbl) + '</td><td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(ba, 'Total \u00b7 '+lbl+' \u00b7 '+aLbl) + '</td>'; });
			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells + '<td class="sinr-d-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalBudget, 'Total \u00b7 Grand Total \u00b7 '+pLbl) + '</td><td class="sinr-d-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalActual, 'Total \u00b7 Grand Total \u00b7 '+aLbl) + '</td></tr>';
			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="' + tblId + '" class="cb-table"><thead>' + hdr1 + hdr2 + '</thead><tbody>' + bodyHtml + '</tbody></table></div>';
		}

		function tableHtmlE(entries, pLbl, aLbl) {
			if (!entries || !entries.length) { return ''; }
			function isOpex(name)      { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OPERATING') !== -1; }
			function isOtherOpex(name) { return (name || '').replace(/\s+/g, ' ').trim().toUpperCase().indexOf('OTHER OPERATING') !== -1; }
			function getItemPlan(e, itemName) { var v = 0; (e.actuals || []).forEach(function (s) { if (isOtherOpex(s.name)) { (s.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); } }); } if (isOpex(s.name) && !isOtherOpex(s.name)) { (s.sub_heads || []).forEach(function (sh) { if (!isOtherOpex(sh.name)) { return; } (sh.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.ytd || 0); } }); }); } }); return v; }
			function getItemAct(e, itemName)  { var v = 0; (e.actuals || []).forEach(function (s) { if (isOtherOpex(s.name)) { (s.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.total_posted_amt_ytd || item.total_posted_amt || 0); } }); } if (isOpex(s.name) && !isOtherOpex(s.name)) { (s.sub_heads || []).forEach(function (sh) { if (!isOtherOpex(sh.name)) { return; } (sh.items || []).forEach(function (item) { if ((item.name || '').trim() === itemName) { v += parseFloat(item.total_posted_amt_ytd || item.total_posted_amt || 0); } }); }); } }); return v; }
			function getSectionTotal(e, field) { var v = 0; (e.actuals || []).forEach(function (s) { if (isOtherOpex(s.name)) { v += parseFloat(field === 'plan' ? (s.ytd || 0) : (s.total_posted_amt_ytd || 0)); } if (isOpex(s.name) && !isOtherOpex(s.name)) { (s.sub_heads || []).forEach(function (sh) { if (!isOtherOpex(sh.name)) { return; } v += parseFloat(field === 'plan' ? (sh.ytd || 0) : (sh.total_posted_amt_ytd || 0)); }); } }); return v; }
			var itemNames = [], itemSeen = {};
			entries.forEach(function (e) { (e.actuals || []).forEach(function (s) { if (isOtherOpex(s.name)) { (s.items || []).forEach(function (item) { var n = (item.name || '').trim(); if (n && !itemSeen[n]) { itemSeen[n] = true; itemNames.push(n); } }); } if (isOpex(s.name) && !isOtherOpex(s.name)) { (s.sub_heads || []).forEach(function (sh) { if (!isOtherOpex(sh.name)) { return; } (sh.items || []).forEach(function (item) { var n = (item.name || '').trim(); if (n && !itemSeen[n]) { itemSeen[n] = true; itemNames.push(n); } }); }); } }); });
			if (!itemNames.length) { return ''; }
			var tblId = 'sinr-table-e';
			if (!$('#sinr-e-style').length) {
				$('head').append('<style id="sinr-e-style">#'+tblId+'{border-collapse:collapse !important;width:100%;}#'+tblId+' th,#'+tblId+' td{border:1px solid var(--bdl) !important;padding:8px 12px;white-space:nowrap;}#'+tblId+' thead tr.cb-thead-main th{background:var(--blue-mid) !important;color:#fff !important;font-size:var(--fs-xl);font-weight:var(--fw-b);border:1px solid var(--bdh) !important;position:sticky;top:0;z-index:25;text-align:center !important;padding:10px 12px;}#'+tblId+' thead tr.cb-thead-sub th{background:var(--orange) !important;color:#fff !important;font-size:var(--fs-lg);font-weight:var(--fw-sb);border:1px solid var(--bdo) !important;position:sticky;z-index:24;text-align:center !important;min-width:120px;padding:8px 12px;}#'+tblId+' thead tr.cb-thead-main th:first-child{position:sticky !important;left:0;z-index:55 !important;background:var(--blue-mid) !important;text-align:left !important;min-width:220px;vertical-align:middle;}#'+tblId+' tbody td:first-child{position:sticky;left:0;z-index:10;background:#fff;text-align:left !important;min-width:220px;box-shadow:2px 0 4px -2px rgba(0,0,0,.12);border:1px solid var(--bdl) !important;}#'+tblId+' tbody tr.ppt-total-row td{background:#e8f0fa !important;color:var(--blue-dark) !important;font-weight:700 !important;}#'+tblId+' .sinr-e-gtcol{background:#ddeaf7 !important;color:var(--blue-dark) !important;border-left:2px solid var(--blue-mid) !important;}#'+tblId+' tr.ppt-total-row .sinr-e-gtcol{background:#c8ddf0 !important;color:var(--blue-dark) !important;}</style>');
			}
			var hdr1 = '<tr class="cb-thead-main"><th rowspan="2" style="min-width:220px;text-align:left !important;vertical-align:middle;position:sticky;left:0;z-index:55 !important;top:0;background:var(--blue-mid) !important;">Expense Category</th>';
			entries.forEach(function (e) { hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;">' + (e.label || '').trim() + '</th>'; });
			hdr1 += '<th colspan="2" style="text-align:center !important;min-width:240px;background:var(--blue-dark) !important;border:1px solid #001f3f !important;">Grand Total</th></tr>';
			var hdr2 = '<tr class="cb-thead-sub">';
			entries.forEach(function () { hdr2 += '<th style="min-width:120px;text-align:center !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;">' + aLbl + '</th>'; });
			hdr2 += '<th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1px solid #001f3f !important;">' + pLbl + '</th><th style="min-width:120px;text-align:center !important;background:#004F8B !important;border:1px solid #001f3f !important;">' + aLbl + '</th></tr>';
			var bodyHtml = '';
			itemNames.forEach(function (itemName) {
				var rowBudget = 0, rowActual = 0, cells = '';
				entries.forEach(function (e) { var bp = getItemPlan(e, itemName), ba = getItemAct(e, itemName), lbl=(e.label||'').trim(); rowBudget += bp; rowActual += ba; cells += '<td>' + fmtCrDash(bp, itemName+' \u00b7 '+lbl+' \u00b7 '+pLbl) + '</td><td>' + fmtCrDash(ba, itemName+' \u00b7 '+lbl+' \u00b7 '+aLbl) + '</td>'; });
				bodyHtml += '<tr><td>' + itemName + '</td>' + cells + '<td class="sinr-e-gtcol" style="font-weight:700;">' + fmtCrDash(rowBudget, itemName+' \u00b7 Grand Total \u00b7 '+pLbl) + '</td><td class="sinr-e-gtcol" style="font-weight:700;">' + fmtCrDash(rowActual, itemName+' \u00b7 Grand Total \u00b7 '+aLbl) + '</td></tr>';
			});
			var totalCells = '', totalBudget = 0, totalActual = 0;
			entries.forEach(function (e) { var bp = getSectionTotal(e, 'plan'), ba = getSectionTotal(e, 'act'), lbl=(e.label||'').trim(); totalBudget += bp; totalActual += ba; totalCells += '<td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(bp, 'Total \u00b7 '+lbl+' \u00b7 '+pLbl) + '</td><td style="font-weight:700 !important;background:#e8f0fa !important;color:var(--blue-dark) !important;">' + fmtCrDash(ba, 'Total \u00b7 '+lbl+' \u00b7 '+aLbl) + '</td>'; });
			bodyHtml += '<tr class="ppt-total-row"><td>Total</td>' + totalCells + '<td class="sinr-e-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalBudget, 'Total \u00b7 Grand Total \u00b7 '+pLbl) + '</td><td class="sinr-e-gtcol" style="font-weight:700 !important;">' + fmtCrDash(totalActual, 'Total \u00b7 Grand Total \u00b7 '+aLbl) + '</td></tr>';
			return '<div class="cb-scroll-wrapper" style="margin-bottom:24px;"><table id="' + tblId + '" class="cb-table"><thead>' + hdr1 + hdr2 + '</thead><tbody>' + bodyHtml + '</tbody></table></div>';
		}

		function load(fy) {
			var $tab = $('#tab-summary_inr');
			$tab.html('<div style="padding:20px;text-align:center;color:#aaa;">Loading\u2026</div>');
			Loader.show('Building Summary in INR', 'summary_inr');

			var fp = (fy || '2025-26').split('-');
			var pLbl   = fy + ' Budget';
			var prevFY = (parseInt(fp[0], 10) - 1) + '-' + String(parseInt(fp[1], 10) - 1).padStart(2, '0');
			var aLbl   = prevFY + ' Actual';
			var prevYear = String(parseInt(fp[0], 10) - 1);   // e.g. "2025" for FY 2025-26

			// All 4 APIs go through DataCache — shared with other tabs where applicable
			Promise.all([
				DataCache.get('unitWisePlanSummary', fy, function(res,rej){Fetchers.unitWisePlanSummary(fy,res,rej);}, []),
				DataCache.get('headcount', fy, function(res,rej){Fetchers.headcount(fy,res,rej);}, {headcount_data:[],plan_data:[]}),
				DataCache.get('consolidatedReport', fy, function(res,rej){Fetchers.consolidatedReport(fy,res,rej);}, []),
				DataCache.get('groupedActuals', prevYear, function(res,rej){Fetchers.groupedActuals(prevYear,res,rej);}, [])
			]).then(function (results) {
				Loader.hide('summary_inr');
				var uwpData          = results[0];
				var hcResult         = results[1];
				var consolidatedPlan = results[2];
				var prevActual       = results[3];

				var hcRecords  = hcResult.headcount_data || [];
				var hcPlanData = hcResult.plan_data      || [];

				if (!uwpData.length) {
					$tab.html('<div style="padding:40px;text-align:center;color:#aaa;">No data available.</div>');
					TabLoader.reportResult('summary_inr', fy, false);
					return;
				}

				Store.summaryInr = uwpData;

				var eB = uwpData.filter(function (e) {
					return e.is_this_sub_item === 0 && e.sequence_id !== 9999
						&& (e.table_name || '').toUpperCase() !== 'CONSOLIDATED';
				}).sort(function (a, b) { return (a.sequence_id || 0) - (b.sequence_id || 0); });

				var ctVals = getConsolidatedTotals(uwpData);

				// Headcount closing & average
				var hcClosingAvgHtml = '';
				if (hcRecords && hcRecords.length) {
					var hcSorted = hcRecords.filter(function (r) { return !!r.financial_year; })
						.slice().sort(function (a, b) { return (a.financial_year || '').localeCompare(b.financial_year || ''); });
					var hcYrs = hcSorted.map(function (r) { return r.financial_year; });
					var hcTotals = {};
					hcSorted.forEach(function (r) {
						var v = parseFloat(r.total_head_count || r.total_headcount || r.headcount || 0);
						if (r.financial_year) { hcTotals[r.financial_year] = v; }
					});
					if (hcYrs.length > 0) { hcClosingAvgHtml = buildClosingAvgTable(hcYrs, hcTotals); }
				}

				var rowsA  = buildRowsA(uwpData);
				var ocHtml = tableHtmlOpexCapex(rowsA, pLbl, aLbl);

				// CPE: use hcPlanData if available, else fall back to uwpData
				var cpeSource = (hcPlanData && hcPlanData.length) ? hcPlanData : uwpData;
				var cpeHtml   = tableHtmlCPE(cpeSource, hcRecords, fy, pLbl, aLbl);

				// Quarter Phasing — uses consolidatedPlan (current) + prevActual (previous FY)
				var qpHtml = tableHtmlQuarterPhasing(fy, consolidatedPlan, prevFY, prevActual);

				$tab.html(
					'<div style="padding:4px 0 10px;">' +
					'<div style="display:flex;justify-content:flex-end;margin-bottom:10px;">' + xlBtn('xl-summary-inr', 'Export to Excel') + '</div>' +

					'<div class="sinr-section-label">A. Unit Wise Plan</div>' +
					tableHtmlA(rowsA, pLbl, aLbl) +

					'<div class="sinr-section-label" style="margin-top:24px;">B. Breakdown of Unit Wise Plan</div>' +
					'<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
					tableHtmlB(eB, getSubNames(eB), pLbl, aLbl, ctVals) +

					'<div class="sinr-section-label" style="margin-top:18px;">C. Opex vs. Capex</div>' +
					ocHtml +

					(hcClosingAvgHtml ? '<div class="sinr-section-label" style="margin-top:18px;">D. Headcount - Closing &amp; Average</div>' + hcClosingAvgHtml : '') +

					cpeHtml +

					'<div class="sinr-section-label" style="margin-top:18px;">F. Other Operating Expenses</div>' +
					'<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
					tableHtmlE(eB, pLbl, aLbl) +

					'<div class="sinr-section-label" style="margin-top:18px;">G. Quarter Phasing</div>' +
					'<div class="sinr-currency-note" style="text-align:right;margin-bottom:4px;">&#8377; <strong>Cr.</strong></div>' +
					qpHtml +

					'<div class="sinr-section-label" style="margin-top:18px;">H. Capital Expenditure</div>' +
					'<div class="sinr-currency-note" style="margin-bottom:6px;">&#8377; <strong>Cr.</strong></div>' +
					tableHtmlD(eB, pLbl, aLbl) +

					'</div>'
				);

				fixStickySubHeader('#sinr-table-a');
			fixStickyFooter('#sinr-table-a', 'tbody tr.cb-row-grand');
			fixStickyFooter('#sinr-table-b', 'tbody tr.cb-row-grand, tbody tr.sinr-gt-plan, tbody tr.sinr-gt-act');

				(function tryFixCPE(n) {
					var $t = $('#sinr-cpe-table'); if (!$t.length) { return; }
					var $r1=$t.find('thead tr.cb-thead-main'), $r2=$t.find('thead tr.cb-thead-sub'), $r3=$t.find('thead tr.cb-thead-sub2');
					var h1=$r1.length?($r1[0].getBoundingClientRect().height||$r1.outerHeight(true)||0):0;
					var h2=$r2.length?($r2[0].getBoundingClientRect().height||$r2.outerHeight(true)||0):0;
					if(h1>0&&h2>0){$r2.find('th').css('top',h1+'px');$r3.find('th').css('top',(h1+h2)+'px');}
					else if(n<12){setTimeout(function(){tryFixCPE(n+1);},60);}
				})(0);

				['#sinr-table-c','#sinr-table-d','#sinr-table-e'].forEach(function(sel){
					(function tryFix(n){ var $t=$(sel); if(!$t.length){return;} var $m=$t.find('thead tr.cb-thead-main'); var h=$m.length?($m[0].getBoundingClientRect().height||$m.outerHeight(true)||0):0; if(h>0){$t.find('thead tr.cb-thead-sub th').css('top',h+'px');}else if(n<12){setTimeout(function(){tryFix(n+1);},60);} })(0);
				});

				(function retrySinrB(n){ var $b=$('#sinr-table-b'); if(!$b.length){return;} var rows=$b.find('thead tr'),ok=true; rows.each(function(){if(!$(this).outerHeight(true)){ok=false;}}); if(!ok&&n<10){setTimeout(function(){retrySinrB(n+1);},50);return;} var top=0; rows.each(function(){$(this).find('th').css('top',top+'px');top+=$(this).outerHeight(true)||40;}); })(0);

				TabLoader.reportResult('summary_inr', fy, true);

			}).catch(function () {
				Loader.hide('summary_inr');
				$tab.html('<div style="padding:40px;text-align:center;color:red;">Error loading Summary in INR data.</div>');
				TabLoader.reportResult('summary_inr', fy, false);
			});
		}

		return { load: load };
	})();

	// =============================================================================
	// HEADCOUNT MODULE  — reuses 'headcount' cache entry
	// =============================================================================

	var Headcount = (function () {
		function fmtHC(v) { if (v === null || v === undefined) { return '-'; } var n = parseFloat(v); return isNaN(n) ? '-' : Math.round(n).toLocaleString('en-IN'); }
		function fmtOpex(v, ctx) { if (v === null || v === undefined) { return '-'; } var n = parseFloat(v); return isNaN(n) ? '-' : fmtCr(n * 10000000, ctx); }
		function fmtPctHC(a, b) { a = parseFloat(a); b = parseFloat(b); if (!a || isNaN(a) || isNaN(b)) { return '-'; } return Math.round(((b / a) - 1) * 100) + '%'; }
		function norm(s) { return (s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
		function hcSec(txt) { return '<div class="hc-section-title">' + txt + '</div>'; }
		function swrap(inner) { return '<div class="cb-scroll-wrapper" style="margin-bottom:20px;">' + inner + '</div>'; }
		function buildOpexMap(pd) {
			var map = {};
			(pd || []).forEach(function (p) {
				var op = null;
				(p.actuals || []).forEach(function (a) { if ((a.name || '').trim() === 'OPERATING  EXPENSES') { op = a; } });
				map[norm(p.label || '')] = { actual: op ? parseFloat(op.total_posted_amt_ytd || 0) / 10000000 : 0, plan: op ? parseFloat(op.ytd || 0) / 10000000 : 0 };
			});
			return map;
		}
		function transform(records) {
			var sorted = (records || []).slice().sort(function (a, b) { return (a.financial_year || '').localeCompare(b.financial_year || ''); });
			var yrs = sorted.map(function (r) { return r.financial_year || ''; });
			var um = {};
			sorted.forEach(function (rec) {
				(rec.units || []).forEach(function (u) {
					var id = String(u.unit || u.unit_id || '');
					if (!um[id]) { um[id] = { description: '', hc: {}, seq: parseInt(id, 10) || 0 }; }
					um[id].hc[rec.financial_year] = parseFloat(u.total_headcount) || 0;
					if (rec.financial_year === yrs[yrs.length - 1]) { um[id].description = (u.unit_description || u.description || '').trim(); }
				});
			});
			var units = Object.keys(um).sort(function (a, b) { return (um[a].seq || 0) - (um[b].seq || 0); }).map(function (id) { return um[id]; });
			var totals = {};
			sorted.forEach(function (r) { totals[r.financial_year] = parseFloat(r.total_head_count || r.total_headcount || 0); });
			return { yrs: yrs, units: units, totals: totals };
		}
		function avgHC(u, yrs, i) { if (i === 0) { var c = u.hc[yrs[0]]; return c !== undefined ? c / 2 : null; } var p = u.hc[yrs[i-1]], c = u.hc[yrs[i]]; return (p !== undefined && c !== undefined) ? (p + c) / 2 : null; }
		function avgTot(tot, yrs, i) { if (i === 0) { var c = tot[yrs[0]]; return c !== undefined ? c / 2 : null; } var p = tot[yrs[i-1]], c = tot[yrs[i]]; return (p !== undefined && c !== undefined) ? (p + c) / 2 : null; }
		function gtable(hdrs, rows) {
			return swrap('<table class="cb-table" style="width:100%;"><thead><tr class="cb-thead-main"><th style="text-align:left !important;min-width:220px;">Unit</th>' +
				hdrs.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>');
		}

		function load(fy) {
			var $tab = $('#tab-headcount');
			$tab.html('<div style="padding:40px;text-align:center;color:#aaa;">Loading\u2026</div>');
			Loader.show('Generating workforce summary\u2026', 'headcount');

			// Reuse headcount cache — same key as SummaryINR
			DataCache.get('headcount', fy, function(res,rej){Fetchers.headcount(fy,res,rej);}, {headcount_data:[],plan_data:[]}).then(function (hcResult) {
				Loader.hide('headcount');
				var records  = hcResult.headcount_data || [];
				var planData = hcResult.plan_data      || [];

				if (!records.length) { $tab.html('<div style="padding:40px;text-align:center;color:#aaa;">No headcount data available.</div>'); TabLoader.reportResult('headcount', fy, false); return; }
				Store.headcount = records;
				var om = buildOpexMap(planData), t = transform(records);
				var yrs = t.yrs, units = t.units, totals = t.totals;
				var i1 = yrs.length - 2, i2 = yrs.length - 1;

				var totActual = 0, totPlan = 0, sRows = '';
				units.forEach(function (u) {
					var a1 = avgHC(u, yrs, i1), a2 = avgHC(u, yrs, i2);
					var o = om[norm(u.description)] || { actual: 0, plan: 0 };
					totActual += o.actual; totPlan += o.plan;
					sRows += '<tr><td style="text-align:left;">' + u.description + '</td><td>' + fmtHC(a1) + '</td><td>' + fmtHC(a2) + '</td><td>' + fmtPctHC(a1, a2) + '</td><td>' + fmtOpex(o.actual, u.description + ' \u00b7 ' + (yrs[i1] || '') + ' Est') + '</td><td>' + fmtOpex(o.plan, u.description + ' \u00b7 ' + (yrs[i2] || '') + ' Plan') + '</td><td>' + fmtPctHC(o.actual, o.plan) + '</td></tr>';
				});
				var ta1 = avgTot(totals, yrs, i1), ta2 = avgTot(totals, yrs, i2);
				sRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td><td>' + fmtHC(ta1) + '</td><td>' + fmtHC(ta2) + '</td><td>' + fmtPctHC(ta1, ta2) + '</td><td>' + fmtOpex(totActual, 'Total \u00b7 ' + (yrs[i1] || '') + ' Est') + '</td><td>' + fmtOpex(totPlan, 'Total \u00b7 ' + (yrs[i2] || '') + ' Plan') + '</td><td>' + fmtPctHC(totActual, totPlan) + '</td></tr>';
				var sumHtml = swrap('<table class="cb-table" style="width:100%;"><thead><tr class="cb-thead-main"><th rowspan="2" style="text-align:left !important;min-width:200px;">Unit</th><th colspan="3" style="text-align:center !important;">Average H/C</th><th colspan="3" style="text-align:center !important;">Opex Spend (&#8377; Cr.)</th></tr><tr class="cb-thead-sub"><th>' + (yrs[i1] || '') + '</th><th>' + (yrs[i2] || '') + '</th><th>%</th><th>' + (yrs[i1] || '') + ' Actual</th><th>' + (yrs[i2] || '') + ' Plan</th><th>%</th></tr></thead><tbody>' + sRows + '</tbody></table>');

				var cRows = '', aRows = '';
				units.forEach(function (u) {
					cRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.map(function (y) { return '<td>' + fmtHC(u.hc[y] !== undefined ? u.hc[y] : null) + '</td>'; }).join('') + '</tr>';
					aRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.map(function (y, i) { return '<td>' + fmtHC(avgHC(u, yrs, i)) + '</td>'; }).join('') + '</tr>';
				});
				cRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + yrs.map(function (y) { return '<td>' + fmtHC(totals[y] || 0) + '</td>'; }).join('') + '</tr>';
				aRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + yrs.map(function (y, i) { return '<td>' + fmtHC(avgTot(totals, yrs, i)) + '</td>'; }).join('') + '</tr>';

				var pHdrs = [], cpRows = '', apRows = '';
				if (yrs.length >= 2) {
					pHdrs = yrs.slice(1).map(function (y, i) { return yrs[i] + ' &#8594; ' + y; });
					units.forEach(function (u) {
						cpRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.slice(1).map(function (y, i) { return '<td>' + fmtPctHC(u.hc[yrs[i]], u.hc[y]) + '</td>'; }).join('') + '</tr>';
						apRows += '<tr><td style="text-align:left;">' + u.description + '</td>' + yrs.slice(1).map(function (y, i) { return '<td>' + fmtPctHC(avgHC(u, yrs, i), avgHC(u, yrs, i + 1)) + '</td>'; }).join('') + '</tr>';
					});
					cpRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + yrs.slice(1).map(function (y, i) { return '<td>' + fmtPctHC(totals[yrs[i]], totals[y]) + '</td>'; }).join('') + '</tr>';
					var tpc = ''; for (var ii = 1; ii < yrs.length; ii++) { tpc += '<td>' + fmtPctHC(avgTot(totals, yrs, ii - 1), avgTot(totals, yrs, ii)) + '</td>'; }
					apRows += '<tr class="cb-row-grand"><td style="text-align:left;">Total</td>' + tpc + '</tr>';
				}

				$tab.html(
					'<div style="padding:4px 0 10px;">' +
					'<div style="display:flex;justify-content:flex-end;margin-bottom:10px;">' + xlBtn('xl-headcount', 'Export to Excel') + '</div>' +
					hcSec('Headcount Summary') +
					'<div class="ppt-currency-label" style="text-align:left;margin-bottom:6px;">H/C numbers &nbsp;|&nbsp; Opex in &#8377; <strong>Cr.</strong></div>' +
					sumHtml +
					hcSec('Closing H/C') + gtable(yrs, cRows) +
					hcSec('Average H/C') + gtable(yrs, aRows) +
					(yrs.length >= 2 ? hcSec('Increase in Closing H/C (%)') + gtable(pHdrs, cpRows) : '') +
					(yrs.length >= 2 ? hcSec('Increase in Average H/C (%)') + gtable(pHdrs, apRows) : '') +
					'</div>'
				);
				$tab.find('.cb-table').each(function () { fixStickySubHeader(this); fixStickyFooter(this, 'tbody tr.cb-row-grand'); });
				TabLoader.reportResult('headcount', fy, true);

			}).catch(function () {
				Loader.hide('headcount');
				$tab.html('<div style="padding:40px;text-align:center;color:red;">Error loading headcount data.</div>');
				TabLoader.reportResult('headcount', fy, false);
			});
		}
		return { load: load };
	})();

	// =============================================================================
	// ANNUAL BUDGET MODULE  — reuses 'consolidatedReport' cache
	// =============================================================================

	var Annual = (function () {
		var Q_DEFS = { q1:{label:'Quarter 1',months:['April','May','June']}, q2:{label:'Quarter 2',months:['July','August','September']}, q3:{label:'Quarter 3',months:['October','November','December']}, q4:{label:'Quarter 4',months:['January','February','March']} };
		var Q_KEYS = ['q1','q2','q3','q4'];
		var data=[], expandedQ=[], openH={}, openS={}, bound=false;
		function sumArr(a){ var t=0; (a||[]).forEach(function(v){t+=(v||0);}); return t; }
		function objTotal(o){ var t=0; Q_KEYS.forEach(function(k){t+=sumArr(o[k]);}); return t; }
		function qCells(obj, rowLbl){ var html=''; Q_KEYS.forEach(function(k){ var vals=obj[k]||[0,0,0]; if(expandedQ.indexOf(k)!==-1){vals.forEach(function(v,mi){html+='<td>'+fmtINRCrTip(v, rowLbl+' \u00b7 '+Q_DEFS[k].months[mi])+'</td>';});}else{html+='<td colspan="3">'+fmtINRCrTip(sumArr(vals), rowLbl+' \u00b7 '+Q_DEFS[k].label)+'</td>';} }); return html; }
		function buildHeader(){ var $t=$('#annual-table thead').empty(),$m=$('<tr class="cb-thead-main"></tr>'); $m.append('<th rowspan="2" style="min-width:220px;text-align:left !important;">Expense Head / Line Item</th>'); Q_KEYS.forEach(function(k){var o=expandedQ.indexOf(k)!==-1; $m.append('<th class="cb-q-header" data-quarter="'+k+'" colspan="3" rowspan="'+(o?1:2)+'" style="cursor:pointer;">'+Q_DEFS[k].label+' '+(o?'\u25b2':'\u25bc')+'</th>');}); $m.append('<th rowspan="2" style="min-width:110px;">Total</th>'); $t.append($m); if(expandedQ.length){var $s=$('<tr class="cb-thead-sub"></tr>'); Q_KEYS.forEach(function(k){if(expandedQ.indexOf(k)!==-1){Q_DEFS[k].months.forEach(function(m){$s.append('<th>'+m+'</th>');});}}); $t.append($s);} fixStickySubHeader('#annual-table'); }
		function matchSearch(head,term){ if(!term){return true;} if(head.name.toLowerCase().indexOf(term)!==-1){return true;} for(var s=0;s<(head.sub_heads||[]).length;s++){if(head.sub_heads[s].name.toLowerCase().indexOf(term)!==-1){return true;}for(var i=0;i<(head.sub_heads[s].items||[]).length;i++){if((head.sub_heads[s].items[i].name||'').toLowerCase().indexOf(term)!==-1){return true;}}} for(var d=0;d<(head.items||[]).length;d++){if((head.items[d].name||'').toLowerCase().indexOf(term)!==-1){return true;}} return false; }
		function renderTable(){ buildHeader(); var $tb=$('#annual-table tbody').empty(), term=$('#annual-search').val().trim().toLowerCase(); var grand={q1:[0,0,0],q2:[0,0,0],q3:[0,0,0],q4:[0,0,0]}; data.forEach(function(head,hi){ if(term&&!matchSearch(head,term)){return;} var hs=String(hi),ho=openH[hs]===true,hn=head.name.trim(); Q_KEYS.forEach(function(k){(head[k]||[0,0,0]).forEach(function(v,mi){grand[k][mi]+=(v||0);});}); $tb.append('<tr class="cb-row-head cb-annual-head" data-hi="'+hs+'"><td><span class="cb-arrow">'+(ho?'\u25bc':'\u25b6')+'</span> '+hn+'</td>'+qCells(head,hn)+'<td class="cb-text-accent">'+fmtINRCrTip(objTotal(head), hn+' \u00b7 Total')+'</td></tr>'); (head.sub_heads||[]).forEach(function(sub,si){ var sk=hs+'-'+si,so=openS[sk]===true; $tb.append('<tr class="cb-row-sub cb-annual-sub" data-hi="'+hs+'" data-si="'+si+'" style="'+(ho?'':'display:none;')+'"><td style="padding-left:22px;"><span class="cb-arrow">'+(so?'\u25bc':'\u25b6')+'</span> '+sub.name+'</td>'+qCells(sub,sub.name)+'<td>'+fmtINRCrTip(objTotal(sub), sub.name+' \u00b7 Total')+'</td></tr>'); (sub.items||[]).forEach(function(item){$tb.append('<tr class="cb-annual-sub-item" data-hi="'+hs+'" data-si="'+si+'" style="'+((ho&&so)?'':'display:none;')+'"><td style="padding-left:42px;">'+item.name+'</td>'+qCells(item,item.name)+'<td>'+fmtINRCrTip(objTotal(item), item.name+' \u00b7 Total')+'</td></tr>');}); }); (head.items||[]).forEach(function(d){$tb.append('<tr class="cb-annual-head-item" data-hi="'+hs+'" style="'+(ho?'':'display:none;')+'"><td style="padding-left:35px;">'+d.name+'</td>'+qCells(d,d.name)+'<td>'+fmtINRCrTip(objTotal(d), d.name+' \u00b7 Total')+'</td></tr>');}); }); var gt=0; Q_KEYS.forEach(function(k){gt+=sumArr(grand[k]);}); $tb.append('<tr class="cb-row-grand"><td>GRAND TOTAL</td>'+qCells(grand,'Grand Total')+'<td>'+fmtINRCrTip(gt, 'Grand Total \u00b7 Total')+'</td></tr>'); fixStickySubHeader('#annual-table'); }
		function toggleHead(hs){openH[hs]=!(openH[hs]===true);if(!openH[hs]){data.forEach(function(h,hi){if(String(hi)!==hs){return;}(h.sub_heads||[]).forEach(function(_,si){openS[hs+'-'+si]=false;});});}renderTable();}
		function toggleSub(hs,ss){openS[hs+'-'+ss]=!(openS[hs+'-'+ss]===true);renderTable();}
		function bindEvents(){
			$(document).on('input.annual','#annual-search',function(){renderTable();});
			$(document).on('change.annual','#annual-expand-quarters',function(){expandedQ=this.checked?Q_KEYS.slice():[];renderTable();});
			$(document).on('change.annual','#annual-expand-items',function(){if(this.checked){data.forEach(function(h,hi){openH[String(hi)]=true;(h.sub_heads||[]).forEach(function(_,si){openS[hi+'-'+si]=true;});});}else{openH={};openS={};}renderTable();});
			$(document).on('click.annual','#annual-table .cb-q-header',function(){var k=String($(this).attr('data-quarter')),idx=expandedQ.indexOf(k);if(idx!==-1){expandedQ.splice(idx,1);}else{expandedQ.push(k);}$('#annual-expand-quarters').prop('checked',expandedQ.length===Q_KEYS.length);renderTable();});
			$('#tab-annual_budget').on('click.annual','.cb-annual-head',function(e){e.stopPropagation();toggleHead(String($(this).attr('data-hi')));});
			$('#tab-annual_budget').on('click.annual','.cb-annual-sub', function(e){e.stopPropagation();toggleSub(String($(this).attr('data-hi')),String($(this).attr('data-si')));});
		}
		function load(fy){
			if(!bound){bindEvents();bound=true;}
			data=[]; openH={}; openS={}; expandedQ=[];
			$('#annual-expand-quarters,#annual-expand-items').prop('checked',false);
			$('#annual-search').val('');
			Loader.show('Building Annual Budget\u2026', 'annual');

			// Reuse the same consolidatedReport cache entry as SummaryINR quarter phasing
			DataCache.get('consolidatedReport', fy, function(res,rej){Fetchers.consolidatedReport(fy,res,rej);}, []).then(function(result){
				data = result || [];
				Store.annual = data;
				Loader.hide('annual');
				if (!data.length) {
					$('#annual-table thead').empty();
					$('#annual-table tbody').html('<tr><td style="text-align:center;padding:24px;color:#aaa;">No data available. <a href="#" id="annual-retry" style="color:var(--blue-mid);">Retry</a></td></tr>');
					TabLoader.reportResult('annual_budget', fy, false);
					return;
				}
				renderTable();
				fixStickyFooter('#annual-table', 'tbody tr.cb-row-grand');
				TabLoader.reportResult('annual_budget', fy, true);
			}).catch(function(){
				Loader.hide('annual');
				$('#annual-table thead').empty();
				$('#annual-table tbody').html('<tr><td style="text-align:center;padding:24px;color:red;">Error loading Annual Budget. <a href="#" id="annual-retry" style="color:var(--blue-mid);">Retry</a></td></tr>');
				TabLoader.reportResult('annual_budget', fy, false);
			});
		}
		$(document).on('click', '#annual-retry', function (e) { e.preventDefault(); TabLoader.trigger('annual_budget'); });
		return { load: load };
	})();

	// =============================================================================
	// ACTUALS CONSOLIDATED MODULE  — reuses 'groupedActuals' cache
	// =============================================================================

	var Actuals = (function () {
		var Q_DEFS={q1:{label:'Quarter 1',months:['April','May','June']},q2:{label:'Quarter 2',months:['July','August','September']},q3:{label:'Quarter 3',months:['October','November','December']},q4:{label:'Quarter 4',months:['January','February','March']}};
		var Q_KEYS=['q1','q2','q3','q4'], Q_IDX={q1:[0,1,2],q2:[3,4,5],q3:[6,7,8],q4:[9,10,11]};
		var data=[], expandedQ=[], openH={}, openS={}, bound=false;
		function getMth(obj){var m=obj.months||{};return[parseFloat(m['4']||0),parseFloat(m['5']||0),parseFloat(m['6']||0),parseFloat(m['7']||0),parseFloat(m['8']||0),parseFloat(m['9']||0),parseFloat(m['10']||0),parseFloat(m['11']||0),parseFloat(m['12']||0),parseFloat(m['1']||0),parseFloat(m['2']||0),parseFloat(m['3']||0)];}
		function qTot(obj){return[parseFloat(obj['Q1']||0),parseFloat(obj['Q2']||0),parseFloat(obj['Q3']||0),parseFloat(obj['Q4']||0)];}
		function yTot(obj){var q=qTot(obj);return q[0]+q[1]+q[2]+q[3];}
		function qCells(obj,rowLbl){var mths=getMth(obj),qtots=qTot(obj),html='';Q_KEYS.forEach(function(q,qi){if(expandedQ.indexOf(q)!==-1){Q_IDX[q].forEach(function(mi,j){html+='<td>'+fmtINRCrTip(mths[mi], rowLbl+' \u00b7 '+Q_DEFS[q].months[j])+'</td>';});}else{html+='<td colspan="3">'+fmtINRCrTip(qtots[qi], rowLbl+' \u00b7 '+Q_DEFS[q].label)+'</td>';}});return html;}
		function buildHeader(){var $t=$('#actuals-table thead').empty(),$m=$('<tr class="cb-thead-main"></tr>');$m.append('<th rowspan="2" style="min-width:220px;text-align:left !important;">Expense</th>');Q_KEYS.forEach(function(k){var o=expandedQ.indexOf(k)!==-1;$m.append('<th class="est-q-toggle" data-q="'+k+'" colspan="3" rowspan="'+(o?1:2)+'" style="cursor:pointer;">'+Q_DEFS[k].label+' '+(o?'\u25b2':'\u25bc')+'</th>');});$m.append('<th rowspan="2" style="min-width:110px;">Total</th>');$t.append($m);if(expandedQ.length){var $s=$('<tr class="cb-thead-sub"></tr>');Q_KEYS.forEach(function(k){if(expandedQ.indexOf(k)!==-1){Q_DEFS[k].months.forEach(function(m){$s.append('<th>'+m+'</th>');});}});$t.append($s);}fixStickySubHeader('#actuals-table');}
		function matchSearch(head,term){if(!term){return true;}if(head.name.toLowerCase().indexOf(term)!==-1){return true;}for(var s=0;s<(head.sub_heads||[]).length;s++){if(head.sub_heads[s].name.toLowerCase().indexOf(term)!==-1){return true;}for(var i=0;i<(head.sub_heads[s].items||[]).length;i++){if((head.sub_heads[s].items[i].name||'').toLowerCase().indexOf(term)!==-1){return true;}}}for(var d=0;d<(head.items||[]).length;d++){if((head.items[d].name||'').toLowerCase().indexOf(term)!==-1){return true;}}return false;}
		function renderTable(){buildHeader();var $tb=$('#actuals-tbody').empty(),term=$('#actuals-search').val().trim().toLowerCase();if(!Array.isArray(data)||!data.length){$tb.append('<tr><td colspan="14" style="text-align:center;padding:40px;color:#aaa;">No data available.</td></tr>');return;}var gM=[0,0,0,0,0,0,0,0,0,0,0,0],gQ=[0,0,0,0];data.forEach(function(head,hi){if(term&&!matchSearch(head,term)){return;}getMth(head).forEach(function(v,i){gM[i]+=v;});qTot(head).forEach(function(v,i){gQ[i]+=v;});var hs=String(hi),ho=openH[hs];$tb.append('<tr class="cb-row-head cb-est-head" data-hi="'+hs+'"><td><span class="cb-arrow">'+(ho?'\u25bc':'\u25b6')+'</span> '+head.name+'</td>'+qCells(head,head.name)+'<td class="cb-text-accent">'+fmtINRCrTip(yTot(head), head.name+' \u00b7 Total')+'</td></tr>');(head.items||[]).forEach(function(item){$tb.append('<tr class="cb-est-head-item" data-hi="'+hs+'" style="'+(ho?'':'display:none;')+'"><td style="padding-left:28px;">'+item.name+'</td>'+qCells(item,item.name)+'<td>'+fmtINRCrTip(yTot(item), item.name+' \u00b7 Total')+'</td></tr>');});(head.sub_heads||[]).forEach(function(sub,si){var sk=hs+'-'+si,so=openS[sk];$tb.append('<tr class="cb-row-sub cb-est-sub" data-hi="'+hs+'" data-si="'+si+'" style="'+(ho?'':'display:none;')+'"><td style="padding-left:20px;"><span class="cb-arrow">'+(so?'\u25bc':'\u25b6')+'</span> '+sub.name+'</td>'+qCells(sub,sub.name)+'<td>'+fmtINRCrTip(yTot(sub), sub.name+' \u00b7 Total')+'</td></tr>');(sub.items||[]).forEach(function(item){$tb.append('<tr class="cb-est-sub-item" data-hi="'+hs+'" data-si="'+si+'" style="'+((ho&&so)?'':'display:none;')+'"><td style="padding-left:44px;">'+item.name+'</td>'+qCells(item,item.name)+'<td>'+fmtINRCrTip(yTot(item), item.name+' \u00b7 Total')+'</td></tr>');});});});var gO={Q1:gQ[0],Q2:gQ[1],Q3:gQ[2],Q4:gQ[3],months:{'4':gM[0],'5':gM[1],'6':gM[2],'7':gM[3],'8':gM[4],'9':gM[5],'10':gM[6],'11':gM[7],'12':gM[8],'1':gM[9],'2':gM[10],'3':gM[11]}};$tb.append('<tr class="cb-row-grand"><td>GRAND TOTAL</td>'+qCells(gO,'Grand Total')+'<td>'+fmtINRCrTip(gQ[0]+gQ[1]+gQ[2]+gQ[3], 'Grand Total \u00b7 Total')+'</td></tr>');fixStickySubHeader('#actuals-table');}
		function toggleHead(hs){var o=!openH[hs];openH[hs]=o;$('#actuals-table tbody .cb-est-head[data-hi="'+hs+'"]').find('.cb-arrow').text(o?'\u25bc':'\u25b6');if(o){$('#actuals-table tbody .cb-est-sub[data-hi="'+hs+'"]').show();$('#actuals-table tbody .cb-est-head-item[data-hi="'+hs+'"]').show();$('#actuals-table tbody .cb-est-sub[data-hi="'+hs+'"]').each(function(){var si=$(this).attr('data-si');if(openS[hs+'-'+si]){$('#actuals-table tbody .cb-est-sub-item[data-hi="'+hs+'"][data-si="'+si+'"]').show();}});}else{$('#actuals-table tbody .cb-est-sub[data-hi="'+hs+'"]').each(function(){var si=$(this).attr('data-si');openS[hs+'-'+si]=false;$(this).find('.cb-arrow').text('\u25b6');});$('#actuals-table tbody .cb-est-sub[data-hi="'+hs+'"],.cb-est-sub-item[data-hi="'+hs+'"],.cb-est-head-item[data-hi="'+hs+'"]').hide();}}
		function toggleSub(hs,ss){var sk=hs+'-'+ss,o=!openS[sk];openS[sk]=o;$('#actuals-table tbody .cb-est-sub[data-hi="'+hs+'"][data-si="'+ss+'"]').find('.cb-arrow').text(o?'\u25bc':'\u25b6');var $i=$('#actuals-table tbody .cb-est-sub-item[data-hi="'+hs+'"][data-si="'+ss+'"]');o?$i.show():$i.hide();}
		function bindEvents(){
			$(document).on('click.estimate','#actuals-table .est-q-toggle',function(){var k=String($(this).attr('data-q')),idx=expandedQ.indexOf(k);if(idx!==-1){expandedQ.splice(idx,1);}else{expandedQ.push(k);}$('#actuals-expand-quarters').prop('checked',expandedQ.length===Q_KEYS.length);renderTable();});
			$(document).on('change.estimate','#actuals-expand-quarters',function(){expandedQ=this.checked?Q_KEYS.slice():[];renderTable();});
			$(document).on('change.estimate','#actuals-expand-items',function(){if(this.checked){data.forEach(function(h,hi){openH[String(hi)]=true;(h.sub_heads||[]).forEach(function(_,si){openS[hi+'-'+si]=true;});});}else{openH={};openS={};}renderTable();});
			$('#tab-actuals').on('click.estimate','.cb-est-head',function(e){e.stopPropagation();toggleHead(String($(this).attr('data-hi')));});
			$('#tab-actuals').on('click.estimate','.cb-est-sub', function(e){e.stopPropagation();toggleSub(String($(this).attr('data-hi')),String($(this).attr('data-si')));});
			$(document).on('input.estimate','#actuals-search',function(){renderTable();});
		}
		function load(fy){
			if(!bound){bindEvents();bound=true;}
			data=[]; openH={}; openS={}; expandedQ=[];
			$('#actuals-expand-quarters,#actuals-expand-items').prop('checked',false);
			Loader.show('Building Actuals Consolidated\u2026', 'actuals');

			// Actuals Consolidated uses previous FY year string — same key as SummaryINR quarter phasing prev year
			var fp = (fy || '2025-26').split('-');
			var prevYear = String(parseInt(fp[0], 10) - 1);

			DataCache.get('groupedActuals', prevYear, function(res,rej){Fetchers.groupedActuals(prevYear,res,rej);}, []).then(function(result){
				data = result || [];
				Store.actuals = data;
				Loader.hide('actuals');
				if (!data.length) {
					$('#actuals-table thead').empty();
					$('#actuals-tbody').html('<tr><td style="text-align:center;padding:24px;color:#aaa;">No data available. <a href="#" id="actuals-retry" style="color:var(--blue-mid);">Retry</a></td></tr>');
					TabLoader.reportResult('actuals', fy, false);
					return;
				}
				renderTable();
				fixStickyFooter('#actuals-table', 'tbody tr.cb-row-grand');
				TabLoader.reportResult('actuals', fy, true);
			}).catch(function(){
				Loader.hide('actuals');
				$('#actuals-table thead').empty();
				$('#actuals-tbody').html('<tr><td style="text-align:center;padding:24px;color:red;">Server error loading Actuals Consolidated data. <a href="#" id="actuals-retry" style="color:var(--blue-mid);">Retry</a></td></tr>');
				TabLoader.reportResult('actuals', fy, false);
			});
		}
		$(document).on('click', '#actuals-retry', function (e) { e.preventDefault(); TabLoader.trigger('actuals'); });
		return { load: load };
	})();

	// =============================================================================
	// BUDGET & ACTUALS MODULE  — uses dedicated unitWisePlanBE fetcher
	// =============================================================================

	var BudgetActuals = (function () {
		var rawData=[], mainItemBreakdown=[], currentFY='', openSec={}, openSub={}, expandItems=false, bound=false;
		function pl(){return getFYLabels(currentFY).plan;}
		function el(){return getFYLabels(currentFY).actual;}
		function isGT(sec){return sec.sequence_id===9999||(sec.name||'').toUpperCase().replace(/\s+/g,' ').trim()==='GRAND TOTAL';}
		function secVal(e,sn,f){var v=0;(e.actuals||[]).forEach(function(s){if(isGT(s)||s.name!==sn){return;}v+=parseFloat(f==='plan'?(s.ytd||0):(s.total_posted_amt_ytd||0));});return v;}
		function subVal(e,sn,subn,f){var v=0;(e.actuals||[]).forEach(function(s){if(isGT(s)||s.name!==sn){return;}(s.sub_heads||[]).forEach(function(sub){if(sub.name!==subn){return;}v+=parseFloat(f==='plan'?(sub.ytd||0):(sub.total_posted_amt_ytd||0));});});return v;}
		function itemVal(e,nm,f){var v=0;(e.actuals||[]).forEach(function(s){if(isGT(s)){return;}(s.items||[]).forEach(function(i){if(i.name===nm){v+=parseFloat(f==='plan'?(i.ytd||0):(i.total_posted_amt||0));}});(s.sub_heads||[]).forEach(function(sub){(sub.items||[]).forEach(function(i){if(i.name===nm){v+=parseFloat(f==='plan'?(i.ytd||0):(i.total_posted_amt||0));}});});});return v;}
		function grandVal(e,f){var gt=0,found=false;(e.actuals||[]).forEach(function(s){if(isGT(s)){gt+=parseFloat(f==='plan'?(s.ytd||0):(s.total_posted_amt_ytd||0));found=true;}});if(!found){(e.actuals||[]).forEach(function(s){gt+=parseFloat(f==='plan'?(s.ytd||0):(s.total_posted_amt_ytd||0));});}return gt;}
		// Grand-total column values come from the backend's main_item_breakdown
		// (get_unit_wise_plan), not a client-side resum across rawData units.
		function secTP(sn){return secVal({actuals:mainItemBreakdown},sn,'plan');}
		function secTE(sn){return secVal({actuals:mainItemBreakdown},sn,'est');}
		function subTP(sn,subn){return subVal({actuals:mainItemBreakdown},sn,subn,'plan');}
		function subTE(sn,subn){return subVal({actuals:mainItemBreakdown},sn,subn,'est');}
		function iTotP(n){return itemVal({actuals:mainItemBreakdown},n,'plan');}
		function iTotE(n){return itemVal({actuals:mainItemBreakdown},n,'est');}
		function allGP(){return grandVal({actuals:mainItemBreakdown},'plan');}
		function allGE(){return grandVal({actuals:mainItemBreakdown},'est');}
		function cellsPair(getP,getE,rowLbl){var h='';rawData.forEach(function(e){var u=(e.label||'').trim();h+='<td>'+fmtINRCrTip(getP(e), rowLbl+' \u00b7 '+u+' \u00b7 '+pl())+'</td><td>'+fmtINRCrTip(getE(e), rowLbl+' \u00b7 '+u+' \u00b7 '+el())+'</td>';});return h;}
		function tc2(plan,est,cls,rowLbl){cls=cls||'';return '<td class="be-total-plan '+cls+'" style="font-weight:700;">'+fmtINRCrTip(plan, rowLbl+' \u00b7 Grand Total \u00b7 '+pl())+'</td><td class="be-total-est '+cls+'" style="font-weight:700;">'+fmtINRCrTip(est, rowLbl+' \u00b7 Grand Total \u00b7 '+el())+'</td>';}
		function buildStruct(){
			if(!rawData.length){return[];}
			return(rawData[0].actuals||[]).filter(function(s){return!isGT(s);}).map(function(s){
				return{
					name:s.name,
					items:(s.items||[]).map(function(i){return{name:i.name};}),
					sub_heads:(s.sub_heads||[]).map(function(sub){return{name:sub.name,items:(sub.items||[]).map(function(i){return{name:i.name};})};})
				};
			});
		}
		function buildHeader(){var $t=$('#be-table thead').empty(),$r1=$('<tr class="cb-thead-main"></tr>'),$r2=$('<tr class="cb-thead-sub"></tr>');$r1.append('<th rowspan="2" style="text-align:left !important;min-width:280px;position:sticky;left:0;z-index:50;background:#0076B6;vertical-align:middle;">Expense Head / Line Item</th>');rawData.forEach(function(e){$r1.append('<th colspan="2" style="text-align:center;min-width:260px;">'+(e.label||'').trim()+'</th>');});$r1.append('<th colspan="2" style="text-align:center;min-width:260px;background:#003B63;">Grand Total</th>');rawData.forEach(function(){$r2.append('<th style="text-align:center;min-width:130px;">'+pl()+'</th><th style="text-align:center;min-width:130px;">'+el()+'</th>');});$r2.append('<th style="text-align:center;min-width:130px;background:#004F8B;">'+pl()+'</th><th style="text-align:center;min-width:130px;background:#004F8B;">'+el()+'</th>');$t.append($r1).append($r2);fixStickySubHeader('#be-table');}
		function renderTable(){
			buildHeader();
			var $tb=$('#be-tbody').empty(),term=$('#be-search').val().trim().toLowerCase(),struct=buildStruct();
			if(!rawData.length||!struct.length){$tb.append('<tr><td colspan="'+(1+rawData.length*2+2)+'" style="text-align:center;padding:40px;color:#aaa;">No data available.</td></tr>');return;}
			struct.forEach(function(sec){
				var sn=sec.name,secOpen=openSec[sn]===true,secVis=secOpen?'':'display:none;';
				$tb.append('<tr class="cb-row-head be-sec-row" data-sec="'+sn+'"><td style="text-align:left;"><span class="cb-arrow">'+(secOpen?'\u25bc':'\u25b6')+'</span> '+sn+'</td>'+cellsPair(function(e){return secVal(e,sn,'plan');},function(e){return secVal(e,sn,'est');},sn)+tc2(secTP(sn),secTE(sn),'be-grand-col',sn)+'</tr>');

				// Items sitting directly under the section (no sub-head wrapper) — e.g. Capital Expenses
				(sec.items||[]).forEach(function(item){
					if(term&&item.name.toLowerCase().indexOf(term)===-1){return;}
					$tb.append('<tr class="be-item-row be-direct-item-row be-sec-child" data-sec="'+sn+'" style="'+secVis+'"><td style="padding-left:22px;text-align:left;">'+item.name+'</td>'+cellsPair(function(e){return itemVal(e,item.name,'plan');},function(e){return itemVal(e,item.name,'est');},item.name)+tc2(iTotP(item.name),iTotE(item.name),'be-grand-col',item.name)+'</tr>');
				});

				sec.sub_heads.forEach(function(sub){
					var sk=sn+'::'+sub.name,subOpen=expandItems||(openSub[sk]===true),itmVis=(secOpen&&subOpen)?'':'display:none;';
					$tb.append('<tr class="cb-row-sub be-sec-child be-sub-row" data-sec="'+sn+'" data-sub="'+sk+'" style="'+secVis+'"><td style="padding-left:22px;text-align:left;"><span class="cb-arrow">'+(subOpen?'\u25bc':'\u25b6')+'</span> '+sub.name+'</td>'+cellsPair(function(e){return subVal(e,sn,sub.name,'plan');},function(e){return subVal(e,sn,sub.name,'est');},sub.name)+tc2(subTP(sn,sub.name),subTE(sn,sub.name),'be-grand-col',sub.name)+'</tr>');
					sub.items.forEach(function(item){
						if(term&&item.name.toLowerCase().indexOf(term)===-1){return;}
						$tb.append('<tr class="be-item-row be-sec-child be-sub-child" data-sec="'+sn+'" data-sub="'+sk+'" style="'+itmVis+'"><td style="padding-left:42px;text-align:left;">'+item.name+'</td>'+cellsPair(function(e){return itemVal(e,item.name,'plan');},function(e){return itemVal(e,item.name,'est');},item.name)+tc2(iTotP(item.name),iTotE(item.name),'be-grand-col',item.name)+'</tr>');
					});
				});
			});
			$tb.append('<tr class="cb-row-grand"><td style="text-align:left;">GRAND TOTAL</td>'+cellsPair(function(e){return grandVal(e,'plan');},function(e){return grandVal(e,'est');},'Grand Total')+tc2(allGP(),allGE(),'be-grand-col','Grand Total')+'</tr>');
			fixStickySubHeader('#be-table');
		}
		function toggleSec(sn){
			var o=!(openSec[sn]===true);openSec[sn]=o;
			$('#be-table tbody .be-sec-row[data-sec="'+sn+'"]').find('.cb-arrow').text(o?'\u25bc':'\u25b6');
			var $ch=$('#be-table tbody .be-sec-child[data-sec="'+sn+'"]');
			if(o){
				$ch.filter('.be-direct-item-row').show();
				$ch.filter('.be-sub-row').show();
				$ch.filter('.be-sub-child').each(function(){if(expandItems||openSub[$(this).attr('data-sub')]===true){$(this).show();}});
			}else{
				$ch.hide();
			}
		}
		function toggleSubRow(sk){var o=!(openSub[sk]===true);openSub[sk]=o;$('#be-table tbody .be-sub-row[data-sub="'+sk+'"]').find('.cb-arrow').text(o?'\u25bc':'\u25b6');var $it=$('#be-table tbody .be-sub-child[data-sub="'+sk+'"]');o?$it.show():$it.hide();}
		function bindEvents(){
			$('#tab-budget_actuals').on('click.be','.be-sec-row',function(e){e.stopPropagation();toggleSec($(this).attr('data-sec'));});
			$('#tab-budget_actuals').on('click.be','.be-sub-row',function(e){e.stopPropagation();if(!expandItems){toggleSubRow($(this).attr('data-sub'));}});
			$(document).on('change.be','#be-expand-items',function(){expandItems=this.checked;buildStruct().forEach(function(sec){openSec[sec.name]=expandItems;sec.sub_heads.forEach(function(sub){openSub[sec.name+'::'+sub.name]=expandItems;});});renderTable();});
			$(document).on('input.be','#be-search',function(){renderTable();});
		}
		function load(fy){
			if(!bound){bindEvents();bound=true;}
			currentFY=fy; rawData=[]; mainItemBreakdown=[]; openSec={}; openSub={}; expandItems=false;
			$('#be-expand-items').prop('checked',false);
			Loader.show('Building Budget & Actuals\u2026', 'budget_actuals');

			DataCache.get('unitWisePlanBE', fy, function(res,rej){Fetchers.unitWisePlanBE(fy,res,rej);}, []).then(function(d){
				Loader.hide('budget_actuals');
				if(!d||!d.length){frappe.msgprint('No data returned for Budget & Actuals.');renderTable();TabLoader.reportResult('budget_actuals', fy, false);return;}
				var consolidatedBlock = d.filter(function(e){return (e.table_name||'').toUpperCase()==='CONSOLIDATED';})[0];
				mainItemBreakdown = (consolidatedBlock && consolidatedBlock.main_item_breakdown) || [];
				rawData = d.filter(function(e){
					return e.is_this_sub_item===0 && e.sequence_id!==9999 && (e.table_name||'').toUpperCase()!=='CONSOLIDATED';
				}).sort(function(a,b){return(a.sequence_id||0)-(b.sequence_id||0);});
				Store.budgetActuals = rawData;
				renderTable();
				fixStickyFooter('#be-table', 'tbody tr.cb-row-grand');
				TabLoader.reportResult('budget_actuals', fy, true);
			}).catch(function(){
				Loader.hide('budget_actuals');
				frappe.msgprint('Server error loading Budget & Actuals data.');
				TabLoader.reportResult('budget_actuals', fy, false);
			});
		}
		return { load: load };
	})();

	// =============================================================================
	// EXPORT WIRING
	// =============================================================================

	var API = 'annual_budget.api.export_reports';
	$(document).on('click','#xl-ppt',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.ppt.rows.length){frappe.msgprint('Please wait for the Foundation Metrics data to load first.');return;}serverExport(API+'.export_ppt',{financial_year:fy,ppt_rows:JSON.stringify(Store.ppt.rows),prev_ppt_rows:JSON.stringify(Store.ppt.prevRows),budget_label:Store.ppt.budgetLabel,est_label:Store.ppt.actualLabel,prev_budget_label:Store.ppt.prevBudgetLabel,prev_est_label:Store.ppt.prevActualLabel},'Building Foundation Metrics Excel\u2026');});
	$(document).on('click','#xl-summary-inr',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.summaryInr.length){frappe.msgprint('Please wait for the Summary in INR data to load first.');return;}serverExport(API+'.export_summary_inr',{financial_year:fy,summary_data:JSON.stringify(Store.summaryInr)},'Building Summary in INR Excel\u2026');});
	$(document).on('click','#xl-headcount',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.headcount.length){frappe.msgprint('Please wait for the Headcount data to load first.');return;}serverExport(API+'.export_headcount',{financial_year:fy,headcount_data:JSON.stringify(Store.headcount)},'Building Headcount Excel\u2026');});
	$(document).on('click','#xl-annual',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.annual.length){frappe.msgprint('Please open the Annual Budget tab first.');return;}serverExport(API+'.export_annual',{financial_year:fy,annual_data:JSON.stringify(Store.annual)},'Building Annual Budget Excel\u2026');});
	$(document).on('click','#xl-actuals',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.actuals.length){frappe.msgprint('Please open the Actuals Consolidated tab first.');return;}serverExport(API+'.export_estimate',{financial_year:fy,estimate_data:JSON.stringify(Store.actuals)},'Building Actuals Consolidated Excel\u2026');});
	$(document).on('click','#xl-be',function(){var fy=fyControl.get_value()||'2025-26';if(!Store.budgetActuals.length){frappe.msgprint('Please open the Budget & Actuals tab first.');return;}serverExport(API+'.export_budget_estimate',{financial_year:fy,be_data:JSON.stringify(Store.budgetActuals)},'Building Budget & Actuals Excel\u2026');});
	$(document).on('click','#xl-export-all',function(){
		var fy=fyControl.get_value()||'2025-26', missing=[];
		if(!Store.ppt.rows.length)      {missing.push('Foundation Metrics (tab 1)');}
		if(!Store.summaryInr.length)    {missing.push('Summary in INR (tab 2)');}
		if(!Store.headcount.length)     {missing.push('Headcount (tab 3)');}
		if(!Store.annual.length)        {missing.push('Annual Budget (tab 4)');}
		if(!Store.actuals.length)      {missing.push('Actuals Consolidated (tab 5)');}
		if(!Store.budgetActuals.length){missing.push('Budget & Actuals (tab 6)');}
		if(missing.length){frappe.msgprint('Please open each tab first.<br><br>Still loading: <b>'+missing.join(', ')+'</b>');return;}
		serverExport(API+'.export_all',{financial_year:fy,ppt_rows:JSON.stringify(Store.ppt.rows),prev_ppt_rows:JSON.stringify(Store.ppt.prevRows),budget_label:Store.ppt.budgetLabel,est_label:Store.ppt.actualLabel,prev_budget_label:Store.ppt.prevBudgetLabel,prev_est_label:Store.ppt.prevActualLabel,summary_data:JSON.stringify(Store.summaryInr),headcount_data:JSON.stringify(Store.headcount),annual_data:JSON.stringify(Store.annual),estimate_data:JSON.stringify(Store.actuals),be_data:JSON.stringify(Store.budgetActuals)},'Building full consolidated Excel\u2026');
	});

	// =============================================================================
	// AUTO-LOAD
	// =============================================================================

	if (fyControl.get_value()) { TabLoader.trigger('ppt'); }

};