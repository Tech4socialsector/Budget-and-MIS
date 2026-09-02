// frappe.pages['budget-dashboard'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Dashboard',
// 		single_column: true
// 	});

//     /* ── STYLES ── */
//     $(`<style>
//         .bd-wrap { padding: 0; box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: hidden; }

//         .bd-filter-bar { display: flex; align-items: flex-end; gap: 20px; padding: 16px 20px 0; flex-wrap: wrap; }
//         .bd-filter { width: 200px; }

//         #bd-tab-nav { list-style: none; margin: 18px 0 0; padding: 0 20px; display: flex; flex-wrap: wrap; gap: 0; border-bottom: 2px solid #d1d5db; }
//         #bd-tab-nav li { margin: 0; padding: 0; }
//         #bd-tab-nav .bd-tab { display: block; font-size: 13px; font-weight: 400; color: #6b7280; padding: 10px 16px 11px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; white-space: nowrap; text-decoration: none; transition: color .15s, border-color .15s; user-select: none; }
//         #bd-tab-nav .bd-tab:hover { color: #111; }
//         #bd-tab-nav .bd-tab.active { color: #111827; font-weight: 700; border-bottom-color: #111827; }

//         .bd-panel { display: none; padding: 16px 20px; max-width: 100%; overflow-x: hidden; }
//         .bd-panel.active { display: block; }

//         .bd-banner-strip { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
//         .bd-banner-card { background: #fff; border: 1px solid #e8edf3; border-radius: 12px; padding: 14px 16px; border-left: 4px solid #378ADD; min-width: 0; transition: box-shadow .2s; }
//         .bd-banner-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-banner-card.blue   { border-left-color: #1a56db; }
//         .bd-banner-card.green  { border-left-color: #0e9f6e; }
//         .bd-banner-card.orange { border-left-color: #ff5a1f; }
//         .bd-banner-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #888; margin-bottom: 5px; }
//         .bd-banner-value { font-size: 22px; font-weight: 700; color: #111; line-height: 1.2; }
//         .bd-banner-sub   { font-size: 11px; color: #aaa; margin-top: 3px; }

//         .bd-section-title { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #374151; margin: 0 0 12px; }
//         .bd-section-title::before { content:''; display:inline-block; width:3px; height:14px; border-radius:2px; background:#378ADD; flex-shrink:0; }
//         .bd-section-title.sub::before { background:#7F77DD; }
//         .bd-section-title::after { content:''; flex:1; height:1px; background:#e8edf3; }

//         .bd-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 10px; }
//         .bd-card { background: #fff; border: 1px solid #e8edf3; border-radius: 12px; padding: 14px 16px; border-left: 4px solid #378ADD; min-width: 0; transition: box-shadow .2s; }
//         .bd-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
//         .bd-card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #888; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//         .bd-card-value { font-size: 15px; font-weight: 700; color: #111; line-height: 1.3; word-break: break-all; overflow-wrap: anywhere; }
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

//         #global-loader.loader-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(18,18,18,.92); backdrop-filter: blur(6px); display: none; z-index: 999999; align-items: center; justify-content: center; }
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
//         @media (max-width:768px)  { .bd-cards{grid-template-columns:repeat(2,1fr);gap:10px} .bd-banner-strip{grid-template-columns:1fr} .bd-bar-label{width:110px;min-width:110px;font-size:11px} .bd-bar-val{width:60px;min-width:60px;font-size:11px} .bd-filter{width:150px} .bd-banner-value{font-size:18px} .bd-card-value{font-size:13px} }
//         @media (max-width:600px)  { .bd-filter-bar{padding:12px 12px 0;gap:12px} .bd-panel{padding:10px} .bd-filter{width:100%} .bd-bottom{gap:10px} .bd-bar-label{width:90px;min-width:90px;font-size:10px} .bd-bar-val{width:52px;min-width:52px;font-size:10px} .bd-chart-box{padding:12px} }
//         @media (max-width:480px)  { .bd-cards{grid-template-columns:1fr} .bd-banner-strip{grid-template-columns:1fr} .bd-banner-value{font-size:16px} }
//     </style>`).appendTo('head');

//     const PALETTE     = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//     const SUB_PALETTE = ['#5b9bd5','#17856a','#c04e22','#6b62c7','#c03d6a','#9a5e0e','#4e7a18','#c93737','#0f4a87','#6b6b68'];

//     $(page.body).html(`
//         <div class="bd-wrap">
//             <div class="bd-filter-bar"><div class="bd-filter" id="bd-fy-wrap"></div></div>

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
//                         <p class="bd-chart-title">Direct Work &amp; Grants</p>
//                         <p class="bd-chart-sub">Consolidated budget breakdown</p>
//                         <div style="position:relative;width:100%;height:400px;">
//                             <canvas id="bd-wp-pie"></canvas>
//                         </div>
//                     </div>
//                     <div class="bd-wp-summary">
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#1a56db;">
//                             <div class="bd-card-label">Grand Total</div>
//                             <div class="bd-card-value" id="bd-wp-pie-total-card">—</div>
//                             <div class="bd-card-sub">Overall budget</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#F5A623;">
//                             <div class="bd-card-label">Direct Work</div>
//                             <div class="bd-card-value" id="bd-wp-others-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-others-pct">—</div>
//                         </div>
//                         <div class="bd-card bd-wp-stat-card" style="border-left-color:#378ADD;">
//                             <div class="bd-card-label">Grants</div>
//                             <div class="bd-card-value" id="bd-wp-grants-val">—</div>
//                             <div class="bd-card-sub" id="bd-wp-grants-pct">—</div>
//                         </div>
//                     </div>
//                 </div>
//                 <div class="bd-wp-two-col-row">
//                     <div class="bd-chart-box" id="bd-unit-pie-card">
//                         <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
//                             <p class="bd-chart-title" style="margin:0;">Direct Work — Unit-wise</p>
//                             <button onclick="bdSaveCard('bd-unit-pie-card','direct-work-unitwise')" title="Save as PNG"
//                                 style="background:none;border:none;cursor:pointer;padding:4px 6px;border-radius:6px;color:#aaa;font-size:16px;line-height:1;transition:color .15s"
//                                 onmouseenter="this.style.color='#378ADD'" onmouseleave="this.style.color='#aaa'">⬇</button>
//                         </div>
//                         <p class="bd-chart-sub">Direct Work budget share per unit</p>
//                         <div id="bd-unit-pie-wrap"></div>
//                         <div class="bd-legend" id="bd-wp-unit-legend"></div>
//                     </div>
//                     <div class="bd-chart-box" id="bd-grants-pie-card">
//                         <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
//                             <p class="bd-chart-title" style="margin:0;">Grants — Unit-wise</p>
//                             <button onclick="bdSaveCard('bd-grants-pie-card','grants-unitwise')" title="Save as PNG"
//                                 style="background:none;border:none;cursor:pointer;padding:4px 6px;border-radius:6px;color:#aaa;font-size:16px;line-height:1;transition:color .15s"
//                                 onmouseenter="this.style.color='#378ADD'" onmouseleave="this.style.color='#aaa'">⬇</button>
//                         </div>
//                         <p class="bd-chart-sub">Grants budget share per unit</p>
//                         <div id="bd-grants-pie-wrap"></div>
//                         <div class="bd-legend" id="bd-wp-grants-unit-legend"></div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `);

//     let donutChart   = null;
//     let wpPieChart   = null;
//     let wpDataLoaded = false;

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

//     const fyControl = frappe.ui.form.make_control({
//         parent: document.getElementById('bd-fy-wrap'),
//         df: { label:'Financial Year', fieldtype:'Select', fieldname:'financial_year', reqd:1,
//               change() { triggerLoad(); } },
//         render_input: true
//     });
//     fyControl.refresh();
//     $(fyControl.wrapper).find('.frappe-control').css('min-width','0');

//     function triggerLoad() {
//         const fy = fyControl.get_value();
//         if (!fy) return;
//         wpDataLoaded = false;
//         if (wpPieChart) { wpPieChart.destroy(); wpPieChart=null; }
//         load(fy, 'March');
//         if ($('#bd-tab-nav .bd-tab.active').data('tab')==='workplan') loadWorkPlan(fy);
//     }

//     frappe.call({
//         method: 'annual_budget.api.filter_options.get_financial_year_list',
//         callback(r) {
//             if (!r.message?.length) return;
//             const years = r.message.map(d => d.financial_year);
//             fyControl.df.options = years.join('\n');
//             fyControl.refresh();
//             const now=new Date(), y=now.getFullYear(), m=now.getMonth()+1;
//             const fy=m>=4?`${y}-${String(y+1).slice(-2)}`:`${y-1}-${String(y).slice(-2)}`;
//             const def=years.includes(fy)?fy:years[0];
//             fyControl.set_value(def);
//             load(def,'March');
//         }
//     });

//     /* ── HELPERS ── */
//     const fmtINR = v => '₹' + Math.round(v||0).toLocaleString('en-IN');

//     /* Round to whole numbers — no .00 decimals */
//     const fmtCr = v => {
//         const abs = Math.abs(v||0);
//         if (abs >= 1e7) return '₹' + Math.round((v||0)/1e7) + ' Cr';
//         if (abs >= 1e5) return '₹' + Math.round((v||0)/1e5) + ' L';
//         if (abs >= 1e3) return '₹' + Math.round((v||0)/1e3) + ' K';
//         return '₹' + Math.round(v||0);
//     };

//     function parseData(message) {
//         const consolidated = message.find(d=>d.settings_doc==='CONSOLIDATED');
//         const mainUnits = message
//             .filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===0)
//             .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0))
//             .map((u,idx)=>{
//                 const gt=(u.actuals||[]).find(a=>a.sequence_id===9999);
//                 return {label:(u.label||'').trim(),ytd:gt?(gt.ytd||0):0,
//                         sequence_id:u.sequence_id||0,color:PALETTE[idx%PALETTE.length]};
//             }).filter(u=>u.ytd>0);
//         const subUnits = message
//             .filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===1)
//             .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0))
//             .map((u,idx)=>{
//                 const gt=(u.actuals||[]).find(a=>a.sequence_id===9999);
//                 return {label:(u.label||'').trim(),ytd:gt?(gt.ytd||0):0,
//                         sequence_id:u.sequence_id||0,color:SUB_PALETTE[idx%SUB_PALETTE.length]};
//             }).filter(u=>u.ytd>0);
//         let overall=0,capex=0,opex=0;
//         if (consolidated) {
//             const ca=consolidated.actuals||[];
//             overall=(ca.find(a=>a.name==='OVERALL GRAND TOTAL')||{}).ytd||0;
//             capex  =(ca.find(a=>a.name==='CAPEX TOTAL')||{}).ytd||0;
//             opex   =(ca.find(a=>a.name==='OPEX TOTAL')||{}).ytd||0;
//         }
//         if (!overall) overall=mainUnits.reduce((s,u)=>s+u.ytd,0);
//         return {mainUnits,subUnits,overall,capex,opex};
//     }

//     function renderBanner(overall,capex,opex,mainUnits,subUnits){
//         $('#bd-grand-total').text(fmtCr(overall));
//         $('#bd-capex-total').text(fmtCr(capex));
//         $('#bd-opex-total').text(fmtCr(opex));
//         $('#bd-unit-count').text(mainUnits.length+' units'+(subUnits.length?' · '+subUnits.length+' sub units':''));
//     }

//     function renderCards(mainUnits,subUnits,overall){
//         const $c=$('#bd-cards').empty();
//         mainUnits.forEach(u=>{
//             const pct=overall>0?((u.ytd/overall)*100).toFixed(1):'0.0';
//             $c.append(`<div class="bd-card" style="border-left-color:${u.color};">
//                 <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                 <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                 <div class="bd-card-sub">${pct}% of total</div></div>`);
//         });
//         const $s=$('#bd-subcards').empty();
//         if(!subUnits.length){$('#bd-sub-title').hide();return;}
//         $('#bd-sub-title').show();
//         subUnits.forEach(u=>{
//             const pct=overall>0?((u.ytd/overall)*100).toFixed(1):'0.0';
//             $s.append(`<div class="bd-card" style="border-left-color:${u.color};">
//                 <div class="bd-card-label" title="${u.label}">${u.label}</div>
//                 <div class="bd-card-value">${fmtINR(u.ytd)}</div>
//                 <div class="bd-card-sub">${pct}% of total</div></div>`);
//         });
//     }

//     function renderHBar(mainUnits,subUnits){
//         const $body=$('#bd-hbar-body').empty();
//         const allMax=Math.max(...mainUnits.map(u=>u.ytd),...subUnits.map(u=>u.ytd),1);
//         mainUnits.forEach(u=>{
//             const pct=((u.ytd/allMax)*100).toFixed(1);
//             $body.append(`<div class="bd-bar-row">
//                 <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                 <div class="bd-bar-track"><div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div></div>
//                 <div class="bd-bar-val">${fmtCr(u.ytd)}</div></div>`);
//         });
//         if(subUnits.length){
//             $body.append('<hr class="bd-bar-divider"><div class="bd-bar-section-label">Sub Units</div>');
//             subUnits.forEach(u=>{
//                 const pct=((u.ytd/allMax)*100).toFixed(1);
//                 $body.append(`<div class="bd-bar-row">
//                     <div class="bd-bar-label" title="${u.label}">${u.label}</div>
//                     <div class="bd-bar-track"><div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div></div>
//                     <div class="bd-bar-val">${fmtCr(u.ytd)}</div></div>`);
//             });
//         }
//     }

//     function renderDonut(mainUnits,overall){
//         const labels=mainUnits.map(u=>u.label);
//         const values=mainUnits.map(u=>Math.round(u.ytd));
//         const colors=mainUnits.map(u=>u.color);
//         $('#bd-donut-total').text(fmtCr(overall));
//         const $leg=$('#bd-donut-legend').empty();
//         mainUnits.forEach((u,i)=>{
//             const pct=overall>0?((u.ytd/overall)*100).toFixed(1):'0.0';
//             $leg.append(`<span class="bd-legend-item"><span class="bd-legend-dot" style="background:${colors[i]};"></span>${u.label} — ${pct}%</span>`);
//         });
//         if(donutChart){donutChart.destroy();donutChart=null;}
//         if(!values.length)return;
//         donutChart=new Chart(document.getElementById('bd-donut'),{
//             type:'doughnut',
//             data:{labels,datasets:[{data:values,backgroundColor:colors,borderWidth:2,borderColor:'#fff',hoverOffset:6}]},
//             options:{responsive:true,maintainAspectRatio:false,cutout:'68%',
//                 plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{
//                     const pct=overall>0?((ctx.parsed/overall)*100).toFixed(1):'0.0';
//                     return ` ${fmtINR(ctx.parsed)}  (${pct}%)`;
//                 }}}}}
//         });
//     }

//     function load(fy,month){
//         Loader.show('Loading dashboard…');
//         $('#bd-grand-total,#bd-capex-total,#bd-opex-total,#bd-donut-total').text('—');
//         $('#bd-unit-count').text('—');
//         $('#bd-cards').empty();$('#bd-hbar-body').empty();
//         frappe.call({
//             method:'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args:{financial_year:fy,month:month,table_name_filter:'Number Card'},
//             callback(r){
//                 Loader.hide();
//                 if(!r.message?.length){$('#bd-cards').html('<div>No data returned.</div>');return;}
//                 const{mainUnits,subUnits,overall,capex,opex}=parseData(r.message);
//                 renderBanner(overall,capex,opex,mainUnits,subUnits);
//                 renderCards(mainUnits,subUnits,overall);
//                 renderHBar(mainUnits,subUnits);
//                 renderDonut(mainUnits,overall);
//             },
//             error(){Loader.hide();frappe.msgprint('Failed to load data.');}
//         });
//     }

//     function loadWorkPlan(fy){
//         Loader.show('Loading Work Plan data…');
//         frappe.call({
//             method:'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
//             args:{financial_year:fy,month:'March',table_name_filter:'Pie Chart'},
//             callback(r){
//                 Loader.hide();
//                 if(!r.message?.length){frappe.msgprint('No Work Plan data returned.');return;}
//                 const consolidated=r.message.find(d=>d.settings_doc==='CONSOLIDATED');
//                 if(!consolidated){frappe.msgprint('Consolidated data not found.');return;}
//                 renderWpPie(consolidated);
//                 renderWpUnitPie(r.message);
//                 renderWpGrantsUnitPie(r.message);
//                 wpDataLoaded=true;
//             },
//             error(){Loader.hide();frappe.msgprint('Failed to load Work Plan data.');}
//         });
//     }

//     /* ── MAIN 2-SLICE PIE: Direct Work & Grants ──
//        Shows name + rounded value + % inside each slice */
//     function renderWpPie(consolidated){
//         const actuals=consolidated.actuals||[];
//         let grantsYtd=0,othersYtd=0;
//         /* Use the actual API line item name for data lookup */
//         const GN='Grants & Donations';
//         actuals.forEach(a=>{
//             if(a.sequence_id===9999||a.name==='CAPEX TOTAL'||a.name==='OPEX TOTAL'||a.name==='OVERALL GRAND TOTAL')return;
//             (a.items||[]).forEach(it=>{if(it.name===GN)grantsYtd+=(it.ytd||0);else othersYtd+=(it.ytd||0);});
//             (a.sub_heads||[]).forEach(sh=>(sh.items||[]).forEach(it=>{if(it.name===GN)grantsYtd+=(it.ytd||0);else othersYtd+=(it.ytd||0);}));
//         });
//         const total=grantsYtd+othersYtd;
//         const gPct=total>0?((grantsYtd/total)*100).toFixed(1):'0.0';
//         const oPct=total>0?((othersYtd/total)*100).toFixed(1):'0.0';
//         $('#bd-wp-pie-total-card').text(fmtINR(total));
//         $('#bd-wp-grants-val').text(fmtINR(grantsYtd));  $('#bd-wp-grants-pct').text(gPct+'% of total');
//         $('#bd-wp-others-val').text(fmtINR(othersYtd));  $('#bd-wp-others-pct').text(oPct+'% of total');
//         if(wpPieChart){wpPieChart.destroy();wpPieChart=null;}
//         wpPieChart=new Chart(document.getElementById('bd-wp-pie'),{
//             type:'pie',
//             data:{
//                 labels:['Direct Work','Grants'],
//                 datasets:[{data:[Math.round(othersYtd),Math.round(grantsYtd)],
//                     backgroundColor:['#F5A623','#378ADD'],borderWidth:3,borderColor:'#fff',hoverOffset:6}]
//             },
//             options:{responsive:true,maintainAspectRatio:false,
//                 backgroundColor:'#ffffff',
//                 layout:{padding:{bottom:50}},
//                 plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{
//                     const pct=total>0?((ctx.parsed/total)*100).toFixed(1):'0.0';
//                     return ` ${fmtCr(ctx.parsed)}  (${pct}%)`;
//                 }}}}
//             },
//             plugins:[{
//                 id:'sliceLabels',
//                 afterDraw(chart){
//                     const{ctx,data}=chart;
//                     const ds=chart.getDatasetMeta(0).data;
//                     const vals=data.datasets[0].data;
//                     const lbls=data.labels;
//                     const tot=vals.reduce((a,b)=>a+b,0);
//                     ctx.save();
//                     ds.forEach((arc,i)=>{
//                         const angle=(arc.startAngle+arc.endAngle)/2;
//                         const r=arc.outerRadius*0.60;
//                         const x=arc.x+Math.cos(angle)*r;
//                         const y=arc.y+Math.sin(angle)*r;
//                         const pct=tot>0?Math.round((vals[i]/tot)*100)+'%':'';
//                         ctx.fillStyle='#fff';
//                         ctx.textAlign='center';
//                         ctx.textBaseline='middle';
//                         /* Name */
//                         ctx.font='bold 16px sans-serif';
//                         ctx.fillText(lbls[i],x,y-18);
//                         /* Value */
//                         ctx.font='700 16px sans-serif';
//                         ctx.fillText(fmtCr(vals[i]),x,y+2);
//                         /* Pct */
//                         ctx.font='600 16px sans-serif';
//                         ctx.fillText(pct,x,y+22);
//                     });
//                     /* Total centred below the pie using actual arc geometry */
//                     const arc0 = ds[0];
//                     const pieBottom = arc0.y + arc0.outerRadius; // bottom edge of pie
//                     const cw = chart.width;
//                     const labelY = pieBottom + 18;
//                     ctx.fillStyle = '#999';
//                     ctx.font = '700 10px sans-serif';
//                     ctx.textAlign = 'center';
//                     ctx.textBaseline = 'middle';
//                     ctx.letterSpacing = '1px';
//                     ctx.fillText('TOTAL BUDGET', cw / 2, labelY);
//                     ctx.fillStyle = '#111';
//                     ctx.font = '700 20px sans-serif';
//                     ctx.letterSpacing = '0px';
//                     ctx.fillText(fmtCr(tot), cw / 2, labelY + 18);
//                     ctx.restore();
//                 }
//             }]
//         });

//     }

//     /* ════════════════════════════════════════════════════════════
//        renderSvgPie — pure SVG unit pie, labels never clip.
//        Fixed 600×520 viewBox, scales with CSS width:100%.
//        Values displayed as rounded whole numbers (no decimals).
//     ════════════════════════════════════════════════════════════ */
//     function renderSvgPie(wrapperId, labels, values, colors, legendId, totalId, totalLabel) {
//         const wrap = document.getElementById(wrapperId);
//         if (!wrap) return;
//         const tot = values.reduce((a, b) => a + b, 0);
//         if (!tot) { wrap.innerHTML = '<p style="color:#aaa;padding:20px">No data</p>'; return; }

//         const pcts = values.map(v => (v / tot * 100));

//         /* ── Build left/right label lists by natural angle ── */
//         const PIE_R = 120, CX = 150, CY = 150;
//         let cur = -Math.PI / 2;
//         const slices = values.map((v, i) => {
//             const sw = (v / tot) * 2 * Math.PI, sa = cur, ea = cur + sw, ma = cur + sw / 2;
//             cur = ea;
//             return { v, i, sa, ea, ma, pct: v / tot * 100, label: labels[i], color: colors[i] };
//         });

//         const leftSlices  = slices.filter(s => Math.cos(s.ma) < 0).sort((a, b) => a.ma - b.ma);
//         const rightSlices = slices.filter(s => Math.cos(s.ma) >= 0).sort((a, b) => a.ma - b.ma);

//         /* ── SVG pie with data-index for tooltip ── */
//         const polar = (r, a) => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
//         function arcPath(s, e) {
//             const [x1, y1] = polar(PIE_R, s), [x2, y2] = polar(PIE_R, e);
//             return `M${CX},${CY}L${x1.toFixed(2)},${y1.toFixed(2)}A${PIE_R},${PIE_R},0,${(e-s)>Math.PI?1:0},1,${x2.toFixed(2)},${y2.toFixed(2)}Z`;
//         }

//         let sliceSvg = '', pctSvg = '';
//         slices.forEach((s, i) => {
//             sliceSvg += `<path d="${arcPath(s.sa, s.ea)}" fill="${s.color}" stroke="#fff" stroke-width="2"
//                 data-i="${i}" data-label="${s.label}" data-val="${fmtCr(s.v)}" data-pct="${s.pct.toFixed(1)}"
//                 style="cursor:pointer;transition:opacity .15s"
//                 onmouseenter="this.style.opacity='.75'"
//                 onmouseleave="this.style.opacity='1'"/>`;
//             if (s.pct >= 4) {
//                 const [px, py] = polar(PIE_R * 0.63, s.ma);
//                 pctSvg += `<text x="${px.toFixed(1)}" y="${py.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" fill="#fff" style="pointer-events:none">${s.pct.toFixed(1)}%</text>`;
//             }
//         });

//         const uid = 'pie_' + Math.random().toString(36).slice(2, 8);
//         const pieSvg = `
//             <svg id="${uid}" viewBox="0 0 300 300" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg">
//                 <rect width="300" height="300" fill="#fff"/>
//                 ${sliceSvg}${pctSvg}
//             </svg>`;

//         /* ── Label table row builder ── */
//         const labelRow = s => `
//             <div style="display:flex;align-items:flex-start;gap:7px;padding:5px 0;border-bottom:1px solid #f0f2f5;min-width:0;">
//                 <span style="width:10px;height:10px;min-width:10px;border-radius:2px;background:${s.color};margin-top:3px;"></span>
//                 <div style="min-width:0;overflow:hidden;">
//                     <div style="font-size:11px;font-weight:700;color:#111;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${s.label}">${s.label}</div>
//                     <div style="font-size:11px;font-weight:600;color:#333;white-space:nowrap;">${fmtCr(s.v)}</div>
//                     <div style="font-size:10px;color:#888;">${s.pct.toFixed(1)}%</div>
//                 </div>
//             </div>`;

//         const leftHtml  = leftSlices.map(labelRow).join('');
//         const rightHtml = rightSlices.map(labelRow).join('');
//         const totLabel  = totalLabel || 'TOTAL';

//         const tipId = 'tip_' + uid;

//         wrap.innerHTML = `
//             <div style="background:#fff;border-radius:8px;padding:8px 0;position:relative;">
//                 <!-- Tooltip -->
//                 <div id="${tipId}" style="display:none;position:fixed;background:rgba(20,20,20,.88);color:#fff;
//                     border-radius:8px;padding:8px 12px;font-size:12px;pointer-events:none;z-index:9999;
//                     box-shadow:0 4px 16px rgba(0,0,0,.25);min-width:120px;"></div>
//                 <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,280px) minmax(0,1fr);align-items:center;gap:8px;">
//                     <div style="padding:0 4px;min-width:0;">${leftHtml}</div>
//                     <div style="aspect-ratio:1;min-width:180px;position:relative;">${pieSvg}</div>
//                     <div style="padding:0 4px;min-width:0;">${rightHtml}</div>
//                 </div>
//                 <!-- Total -->
//                 <div style="text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid #e8edf3;">
//                     <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#999;text-transform:uppercase;">${totLabel}</div>
//                     <div style="font-size:22px;font-weight:700;color:#111;line-height:1.2;">${fmtCr(tot)}</div>
//                 </div>
//             </div>`;

//         /* ── Tooltip logic ── */
//         const tip = document.getElementById(tipId);
//         const svgEl = document.getElementById(uid);
//         svgEl.addEventListener('mousemove', function(e) {
//             const path = e.target.closest('path[data-label]');
//             if (!path) { tip.style.display = 'none'; return; }
//             tip.style.display = 'block';
//             tip.style.left = (e.clientX + 14) + 'px';
//             tip.style.top  = (e.clientY - 10) + 'px';
//             tip.innerHTML = `<div style="font-weight:700;margin-bottom:3px;">${path.dataset.label}</div>
//                 <div>${path.dataset.val}</div>
//                 <div style="color:#aaa;">${path.dataset.pct}%</div>`;
//         });
//         svgEl.addEventListener('mouseleave', () => { tip.style.display = 'none'; });

//         /* Hide legend — labels already shown in side columns */
//         $('#' + legendId).hide();
//         if (totalId) $('#' + totalId).text(fmtCr(tot));
//     }

//     function renderWpUnitPie(message){
//         const PALETTE_WP=['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GN='Grants & Donations';
//         function getDirectWork(u){
//             const gt=(u.actuals||[]).find(a=>a.sequence_id===9999);
//             const grand=gt?(gt.ytd||0):0;let grants=0;
//             (u.actuals||[]).forEach(a=>{if(a.sequence_id===9999)return;
//                 (a.items||[]).forEach(it=>{if(it.name===GN)grants+=(it.ytd||0);});
//                 (a.sub_heads||[]).forEach(sh=>(sh.items||[]).forEach(it=>{if(it.name===GN)grants+=(it.ytd||0);}));});
//             return grand-grants;
//         }
//         const units=message.filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===0)
//             .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0));
//         const labels=[],values=[],colors=[];let ci=0;
//         units.forEach(u=>{const dw=getDirectWork(u);if(dw<=0)return;
//             labels.push((u.label||'').trim());values.push(Math.round(dw));colors.push(PALETTE_WP[ci++%PALETTE_WP.length]);});
//         renderSvgPie('bd-unit-pie-wrap',labels,values,colors,'bd-wp-unit-legend','bd-wp-unit-pie-total','TOTAL DIRECT WORK');
//     }

//     function renderWpGrantsUnitPie(message){
//         const PALETTE_WP=['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
//         const GN='Grants & Donations';
//         function getGrantsAmt(u){
//             let amt=0;
//             (u.actuals||[]).forEach(a=>{if(a.sequence_id===9999)return;
//                 (a.items||[]).forEach(it=>{if(it.name===GN)amt+=(it.ytd||0);});
//                 (a.sub_heads||[]).forEach(sh=>(sh.items||[]).forEach(it=>{if(it.name===GN)amt+=(it.ytd||0);}));});
//             return amt;
//         }
//         const units=message.filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===0)
//             .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0));
//         const labels=[],values=[],colors=[];let ci=0;
//         units.forEach(u=>{const g=getGrantsAmt(u);if(g<=0)return;
//             labels.push((u.label||'').trim());values.push(Math.round(g));colors.push(PALETTE_WP[ci++%PALETTE_WP.length]);});
//         renderSvgPie('bd-grants-pie-wrap',labels,values,colors,'bd-wp-grants-unit-legend','bd-wp-grants-unit-total','TOTAL GRANTS');
//     }

//     let resizeTimer;
//     $(window).on('resize.bd',function(){
//         clearTimeout(resizeTimer);
//         resizeTimer=setTimeout(()=>{
//             if(donutChart)donutChart.resize();
//             if(wpPieChart)wpPieChart.resize();
//             /* SVG pies scale automatically via viewBox — no action needed */
//         },300);
//     });
//     $(wrapper).on('hide',function(){$(window).off('resize.bd');});

//     if(!window.Chart){
//         const s=document.createElement('script');
//         s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
//         document.head.appendChild(s);
//     }
//     if(!window.htmlToImage){
//         const s=document.createElement('script');
//         s.src='https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
//         document.head.appendChild(s);
//     }

//     /* Global save function — captures entire chart card as PNG */
//     window.bdSaveCard = function(cardId, filename) {
//         const card = document.getElementById(cardId);
//         if (!card) return;
//         const fname = (filename || cardId) + '.png';
//         /* Hide the download button so it doesn't appear in the image */
//         const btn = card.querySelector('button');
//         if (btn) btn.style.visibility = 'hidden';
//         const doSave = () => {
//             window.htmlToImage.toPng(card, {
//                 backgroundColor: '#ffffff',
//                 pixelRatio: 2,
//                 style: { boxShadow: 'none' }
//             }).then(dataUrl => {
//                 if (btn) btn.style.visibility = '';
//                 const a = document.createElement('a');
//                 a.download = fname;
//                 a.href = dataUrl;
//                 a.click();
//             }).catch(err => {
//                 if (btn) btn.style.visibility = '';
//                 frappe.msgprint('Could not save image. Please try again.');
//                 console.error(err);
//             });
//         };
//         if (window.htmlToImage) { doSave(); }
//         else { setTimeout(doSave, 800); }
//     };

//     if(!$('#global-loader').length){
//         $('body').append('<div id="global-loader" class="loader-overlay"><div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt=""><div class="loader-text">Loading, please wait</div></div></div>');
//     }
//     $('#global-loader').hide();

//     var Loader={
//         show(msg){var $l=$('#global-loader');$l.find('.loader-text').text(msg||'Loading, please wait');$l.css('display','flex').hide().fadeIn(200);},
//         hide(){$('#global-loader').fadeOut(200);}
//     };
// };






frappe.pages['budget-dashboard'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Dashboard',
		single_column: true
	});

    /* ── STYLES ── */
    $(`<style>
        .bd-wrap { padding: 0; box-sizing: border-box; width: 100%; max-width: 100%; overflow-x: hidden; }

        /* ── Single unified filter row ── */
        #bd-filter-row {
            padding: 14px 20px 0;
            overflow: visible;
        }
        #bd-filter-row .row { margin-left: -8px; margin-right: -8px; overflow: visible; row-gap: 10px; }
        #bd-filter-row [class*="col-"] { padding-left: 8px; padding-right: 8px; overflow: visible; margin-bottom: 10px; }
        #bd-filter-row .frappe-control { margin-bottom: 0 !important; overflow: visible; }
        #bd-filter-row .form-group { margin-bottom: 0 !important; }
        #bd-filter-row .ba-col { display: none; }
        #bd-filter-row .ba-col.active { display: block; }
        #bd-filter-row .ba-btn-col { display: none; }
        #bd-filter-row .ba-btn-col.active { display: block; }
        #bd-filter-row .ba-btn-col .frappe-control button,
        #bd-filter-row .ba-btn-col button.btn {
            margin-top: 23px;
            width: auto;
            min-width: 120px;
            padding-left: 20px;
            padding-right: 20px;
        }
        /* fix: .bd-wrap must not clip dropdowns */
        .bd-wrap { overflow: visible !important; }
        #bd-tab-nav { position: relative; z-index: 1; }
        /* Dropdowns always on top */
        .multiselect-dropdown, .awesomplete ul, .dropdown-menu,
        .frappe-control .awesomplete ul { z-index: 2000 !important; }

        #bd-tab-nav { list-style: none; margin: 18px 0 0; padding: 0 20px; display: flex; flex-wrap: wrap; gap: 0; border-bottom: 2px solid #d1d5db; }
        #bd-tab-nav li { margin: 0; padding: 0; }
        #bd-tab-nav .bd-tab { display: block; font-size: 13px; font-weight: 400; color: #6b7280; padding: 10px 16px 11px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; white-space: nowrap; text-decoration: none; transition: color .15s, border-color .15s; user-select: none; }
        #bd-tab-nav .bd-tab:hover { color: #111; }
        #bd-tab-nav .bd-tab.active { color: #111827; font-weight: 700; border-bottom-color: #111827; }

        .bd-panel { display: none; padding: 16px 20px; max-width: 100%; overflow-x: hidden; }
        .bd-panel.active { display: block; }

        .bd-banner-strip { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
        .bd-banner-card { background: #fff; border: 1px solid #e8edf3; border-radius: 12px; padding: 14px 16px; border-left: 4px solid #378ADD; min-width: 0; transition: box-shadow .2s; }
        .bd-banner-items { margin-top:6px; border-top:1px solid #f0f2f5; padding-top:5px; display:flex; flex-direction:column; gap:2px; }
        .bd-banner-item { display:grid; grid-template-columns:1fr auto auto; align-items:center; gap:6px; }
        .bd-banner-item-name { font-size:10px; font-weight:500; color:#777; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .bd-banner-item-val { font-size:10px; font-weight:700; color:#333; white-space:nowrap; }
        .bd-banner-item-pct { font-size:9px; font-weight:700; color:#bbb; white-space:nowrap; min-width:24px; text-align:right; }
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

        /* ══ BUDGET VS ACTUALS TAB STYLES ══ */
        #ba-summary-area {
            display: grid;
            grid-template-columns: 1fr 480px;
            gap: 0 20px;
            align-items: start;
            margin-bottom: 18px;
        }
        #ba-cards-area { min-width: 0; }
        .ba-section-label {
            font-size: 11px; font-weight: 700; letter-spacing: .8px;
            text-transform: uppercase; color: #888;
            margin: 14px 0 7px; padding-left: 2px;
        }
        .ba-section-label:first-child { margin-top: 0; }

        .ba-grand-card {
            border: 1px solid #e0e0e0;
            border-left: 4px solid #0076B6;
            border-radius: 8px; padding: 12px 14px;
            background: #fff; box-sizing: border-box;
            min-width: 0; overflow: hidden; word-break: break-word;
            transition: box-shadow .15s ease, transform .15s ease;
            display: flex; flex-direction: column;
            margin-bottom: 14px;
            cursor: pointer;
        }
        .ba-grand-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); transform: translateY(-1px); }

        .ba-card-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px; margin-bottom: 12px;
            width: 100%; box-sizing: border-box;
        }
        .ba-card-grid.sub-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px;
        }

        .ba-number-card {
            border: 1px solid #e0e0e0;
            border-left: 3px solid #ccc;
            border-radius: 8px; padding: 12px 14px;
            background: #fff; box-sizing: border-box;
            min-width: 0; overflow: hidden; word-break: break-word;
            transition: box-shadow .15s ease, transform .15s ease;
            display: flex; flex-direction: column;
            cursor: pointer;
        }
        .ba-number-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); transform: translateY(-1px); }
        .ba-number-card.sub {
            background: #fafafa; border-color: #ebebeb;
            border-left-width: 3px; border-radius: 7px; padding: 10px 12px;
        }

        .ba-number-title {
            font-size: 11px; font-weight: 600; color: #555;
            text-transform: uppercase; letter-spacing: .5px;
            margin-bottom: 8px;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            min-height: 16px;
        }
        .ba-number-card.sub .ba-number-title { font-size: 10px; color: #777; }

        .ba-kpi-row { display: flex; justify-content: space-between; margin-top: 4px; }
        .ba-kpi-block { text-align: left; }
        .ba-kpi-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: .4px; }
        .ba-kpi-value { font-size: 14px; font-weight: 700; color: #111; }
        .ba-number-card.sub .ba-kpi-value { font-size: 13px; }
        .ba-kpi-bottom {
            display: flex; justify-content: space-between;
            margin-top: 8px; padding-top: 7px;
            border-top: 1px solid #f0f0f0;
        }
        .ba-util-bar-wrap { margin-top: auto; padding-top: 8px; border-top: 1px solid #f0f0f0; }
        .ba-util-bar-bg { width:100%; height:4px; background:#f0f0ed; border-radius:2px; overflow:hidden; }
        .ba-util-bar { height:100%; border-radius:2px; transition:width .4s ease; animation: barGrow .6s ease both; }

        /* click hint badge */
        .ba-click-hint {
            font-size: 9px; font-weight: 700; letter-spacing: .5px;
            text-transform: uppercase; color: #0076B6;
            margin-top: 6px; opacity: .7;
        }

        /* ── Charts panel (right column) ── */
        #ba-charts-row {
            display: flex; flex-direction: column;
            gap: 14px; min-width: 0; margin-top: 0;
        }
        .ba-pie-card {
            background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
            padding: 14px 16px; box-sizing: border-box;
            display: grid;
            grid-template-columns: 200px 1fr;
            grid-template-rows: auto 1fr;
            column-gap: 16px; align-items: start;
        }
        .ba-pie-title {
            grid-column: 1 / -1;
            font-size: 11px; font-weight: 700; color: #444;
            text-transform: uppercase; letter-spacing: .6px;
            margin-bottom: 10px;
        }
        .ba-pie-canvas-wrap { width: 200px; height: 200px; position: relative; }
        .ba-pie-canvas-wrap canvas { width: 200px !important; height: 200px !important; }
        .ba-pie-legend {
            display: flex; flex-direction: column;
            gap: 5px; align-self: center; min-width: 0;
        }
        .ba-pie-legend-item {
            display: grid; grid-template-columns: 10px 1fr auto;
            align-items: center; gap: 5px;
            font-size: 11px; color: #555; min-width: 0;
        }
        .ba-pie-legend-dot { width:10px; height:10px; border-radius:2px; flex-shrink:0; }
        .ba-pie-legend-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
        .ba-pie-legend-pct { font-weight:700; color:#222; white-space:nowrap; padding-left:4px; min-width:36px; text-align:right; }

        /* ── Drill-down modal — centered dialog ── */
        /* ═══ DRILL-DOWN MODAL — SLIDE-IN PANEL DESIGN ═══ */
        #ba-drilldown-overlay {
            display: none; position: fixed; inset: 0;
            background: rgba(0,0,0,.45);
            z-index: 9000; justify-content: flex-end;
            align-items: stretch;
        }
        #ba-drilldown-overlay.open { display: flex; }
        #ba-drilldown-panel {
            background: #f7f8fa;
            width: min(920px, 100vw);
            height: auto;
            max-height: 100vh;
            min-height: 200px;
            display: flex; flex-direction: column;
            overflow: hidden;
            align-self: stretch;
            box-shadow: -8px 0 40px rgba(0,0,0,.18);
            animation: panelIn .3s cubic-bezier(.22,.68,0,1.15);
        }
        @keyframes panelIn {
            from { transform: translateX(80px); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeSlideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes rowIn {
            from { opacity: 0; transform: translateX(16px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes tabSlide {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes summaryPop {
            from { opacity: 0; transform: scale(.95); }
            to   { opacity: 1; transform: scale(1); }
        }
        @keyframes totalSlideUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pillPop {
            0%   { transform: scale(0.7); opacity: 0; }
            70%  { transform: scale(1.12); }
            100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes barGrow {
            from { width: 0 !important; }
        }

        /* ── Top bar ── */
        #ba-drilldown-header {
            display: flex; align-items: center; gap: 14px;
            padding: 0 20px;
            height: 56px; flex-shrink: 0;
            background: #0076B6;
            border-bottom: 1px solid rgba(0,0,0,.1);
        }
        #ba-drilldown-close {
            background: rgba(255,255,255,.15); border: none; cursor: pointer;
            width: 32px; height: 32px; border-radius: 8px;
            font-size: 18px; color: #fff; line-height: 1;
            display: flex; align-items: center; justify-content: center;
            transition: background .15s; flex-shrink: 0;
        }
        #ba-drilldown-close:hover { background: rgba(255,255,255,.28); }
        #ba-drilldown-title {
            flex: 1; font-size: 15px; font-weight: 700; color: #fff;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        #ba-drilldown-header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        #ba-expand-toggle-wrap {
            display: none; align-items: center; gap: 7px;
            font-size: 12px; font-weight: 600; color: rgba(255,255,255,.85);
            cursor: pointer; user-select: none; white-space: nowrap;
        }
        #ba-expand-toggle-wrap.visible { display: flex; }
        #ba-expand-all-cb { width: 14px; height: 14px; accent-color: #fff; cursor: pointer; }

        /* ── Body — sidebar on top, content below ── */
        #ba-drilldown-body {
            flex: 1; overflow: hidden;
            display: flex; flex-direction: column;
            min-height: 0;
        }

        /* ── TOP category tab bar ── */
        #ba-drill-sidebar {
            display: flex; flex-direction: column;
            flex-shrink: 0;
            background: #fff;
            border-bottom: 1px solid #e4e8ef;
        }
        #ba-drill-tab-bar {
            display: flex; align-items: center;
            overflow-x: auto; gap: 0;
            padding: 0 16px;
            scrollbar-width: none;
            animation: tabSlide .25s ease .15s both;
        }
        #ba-drill-tab-bar::-webkit-scrollbar { display: none; }
        .ba-drill-nav-item {
            display: flex; align-items: center; gap: 7px;
            padding: 10px 14px; cursor: pointer;
            font-size: 12px; font-weight: 600; color: #666;
            border-bottom: 2px solid transparent;
            white-space: nowrap;
            transition: color .15s, border-color .15s, background .15s;
            flex-shrink: 0;
            animation: tabSlide .2s ease both;
        }
        .ba-drill-nav-item:nth-child(1) { animation-delay: .15s; }
        .ba-drill-nav-item:nth-child(2) { animation-delay: .18s; }
        .ba-drill-nav-item:nth-child(3) { animation-delay: .21s; }
        .ba-drill-nav-item:nth-child(4) { animation-delay: .24s; }
        .ba-drill-nav-item:nth-child(5) { animation-delay: .27s; }
        .ba-drill-nav-item:hover { color: #0076B6; background: #f0f6fb; border-radius: 4px 4px 0 0; }
        .ba-drill-nav-item.active {
            color: #0076B6;
            border-bottom-color: #0076B6;
            position: relative;
        }
        .ba-drill-nav-item.active::after {
            content: '';
            position: absolute;
            bottom: -1px; left: 0; right: 0;
            height: 2px;
            background: #0076B6;
            border-radius: 2px 2px 0 0;
            animation: fadeIn .15s ease;
        }
        .ba-drill-nav-dot {
            width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .ba-drill-nav-total {
            font-size: 10px; font-weight: 700; color: #aaa;
        }
        /* grand total strip below tabs */
        #ba-drill-summary-strip {
            display: flex; align-items: center; gap: 24px;
            padding: 6px 16px 8px;
            background: #f7f9fc;
            border-top: 1px solid #e8edf3;
            font-size: 11px; color: #555;
            animation: summaryPop .2s ease .25s both;
        }
        .ba-drill-sum-item { display: flex; flex-direction: column; gap: 1px; }
        .ba-drill-sum-label { font-size: 9px; font-weight: 700; letter-spacing: .5px; color: #aaa; text-transform: uppercase; }
        .ba-drill-sum-val { font-size: 14px; font-weight: 700; color: #003B63; }

        /* ── Content pane ── */
        #ba-drill-content {
            display: flex; flex-direction: column;
            flex: 1; min-height: 0; overflow: hidden;
        }

        /* Shared table layout — header + rows both use this wrapper */
        .ba-drill-table-wrap {
            display: flex; flex-direction: column;
            flex: 1; overflow: hidden;
        }

        /* Fixed column header */
        #ba-drill-col-header {
            flex-shrink: 0;
            display: grid;
            background: #0076B6;
            font-size: 11px; font-weight: 700; color: #fff;
            letter-spacing: .3px; text-transform: uppercase;
            border-bottom: 2px solid #005fa3;
            animation: fadeIn .2s ease .2s both;
        }
        #ba-drill-col-header > div {
            padding: 10px 12px;
            border-right: 1px solid rgba(255,255,255,.15);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        #ba-drill-col-header > div:last-child { border-right: none; }
        #ba-drill-col-header > div:first-child { text-align: left; }

        /* scrollable rows */
        #ba-drill-rows-scroll {
            flex: 1; overflow-y: auto;
            min-height: 0;
            background: #f7f8fa;
        }

        /* section header inside scroll — grid row */
        .ba-drill-section-hdr {
            font-size: 11px; font-weight: 700; letter-spacing: .3px;
            text-transform: uppercase; color: #0076B6;
            background: #eaf3fb;
            border-top: 2px solid #0076B6;
            border-bottom: 1px solid #c8dff0;
            margin-top: 2px;
            cursor: pointer; user-select: none;
        }
        .ba-drill-section-hdr.anim-in {
            animation: rowIn .15s ease both;
        }
        .ba-drill-section-hdr > div {
            border-right: 1px solid #c8dff0;
        }
        .ba-drill-section-hdr > div:last-child { border-right: none; }
        .ba-drill-section-hdr:first-child { margin-top: 0; border-top: none; }
        .ba-dsec-toggle {
            font-size: 10px; color: #0076B6;
            transition: transform .2s; display: inline-block;
        }
        .ba-drill-section-hdr.collapsed .ba-dsec-toggle { transform: rotate(-90deg); }

        /* data rows — grid columns set via JS, same as header */
        .ba-drill-row {
            display: grid; align-items: stretch;
            border-bottom: 1px solid #e8edf3;
            font-size: 12px; color: #333;
            transition: background .15s;
        }
        .ba-drill-row.anim-in {
            animation: rowIn .15s ease both;
        }
        .ba-drill-row > div {
            padding: 8px 12px;
            border-right: 1px solid #e8edf3;
            display: flex; align-items: center;
            min-width: 0;
        }
        .ba-drill-row > div:last-child { border-right: none; }
        .ba-drill-row > div:not(:first-child) { justify-content: flex-end; }
        .ba-drill-row:hover { background: #f0f5fb; transform: translateX(2px); transition: background .15s, transform .15s; }

        .ba-drill-row.sub-head {
            background: #f4f6f9;
            border-bottom: 1px solid #d8e2ec;
            cursor: pointer;
        }
        .ba-drill-row.sub-head > div { font-weight: 700; color: #1a2a3a; }
        .ba-drill-row.sub-head:hover { background: #deeaf5; transform: translateX(2px); }

        .ba-drill-row.item-row > div:first-child { padding-left: 28px; color: #444; }
        .ba-drill-row.drill-hidden { display: none; }

        .ba-drill-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
        .ba-drill-val { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }

        .ba-drill-util-pill {
            display: inline-block; padding: 2px 8px; border-radius: 10px;
            font-size: 10px; font-weight: 700; text-align: center; white-space: nowrap;
            animation: pillPop .3s ease both;
        }

        .ba-drill-row.total-row {
            background: #003B63 !important;
            border-top: 2px solid #002a47;
            border-bottom: 3px solid #002a47;
            margin-top: 2px; margin-bottom: 0;
            animation: totalSlideUp .3s ease both;
            position: sticky;
            bottom: 0;
            z-index: 10;
        }
        .ba-drill-row.total-row > div {
            color: #fff !important; font-weight: 700;
            border-right-color: rgba(255,255,255,.15);
        }
        .ba-drill-row.total-row > div:last-child { border-right: none; }

        .ba-drill-empty {
            text-align: center; padding: 40px 20px;
            font-size: 13px; color: #aaa;
        }

        /* no-data placeholder */
        #ba-no-data {
            display: none;
            text-align: center; padding: 60px 20px; color: #aaa; font-size: 14px;
        }
        #ba-no-data.show { display: block; }

        /* loader overlay (reuse existing global-loader) */

        #global-loader.loader-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(18,18,18,.92); backdrop-filter: blur(6px); display: none; z-index: 999999; align-items: center; justify-content: center; }
        .loader-box { display:flex; flex-direction:column; align-items:center; gap:14px; }
        .loader-logo { width:90px; height:90px; border-radius:50%; background:linear-gradient(145deg,#fff,#eaeaea); padding:14px; object-fit:contain; box-shadow:0 10px 30px rgba(0,0,0,.35); animation:lp 1.6s infinite ease-in-out; }
        .loader-text { font-size:13px; color:#fff; font-weight:600; letter-spacing:.5px; opacity:.85; }
        .loader-text::after { content:""; display:inline-block; width:1em; animation:ld 1.5s infinite; }
        @keyframes lp { 0%,100%{transform:scale(1);opacity:.8} 50%{transform:scale(1.08);opacity:1} }
        @keyframes ld { 0%{content:""} 33%{content:"."} 66%{content:".."} 100%{content:"..."} }

        .bd-wrap,.bd-panel { max-width:100%; } .bd-panel { overflow-x:hidden; }
        .bd-chart-box,.bd-card,.bd-banner-card { min-width:0; word-break:break-word; }

        /* ══════════════════════════════════════
           RESPONSIVE — all breakpoints
        ══════════════════════════════════════ */

        /* ── Large (≥1400px) ── */
        @media (min-width:1400px) {
            .bd-banner-value { font-size: 26px; }
            .bd-bottom { grid-template-columns: 1fr 440px; }
        }

        /* ── Medium-large (≤1200px) ── */
        @media (max-width:1200px) {
            .bd-bottom { grid-template-columns: 1fr 360px; }
            .bd-cards { grid-template-columns: repeat(3,1fr); }
            #ba-summary-area { grid-template-columns: 1fr 380px; }
            .ba-pie-card { grid-template-columns: 180px 1fr; }
            .ba-pie-canvas-wrap { width:180px; height:180px; }
            .ba-pie-canvas-wrap canvas { width:180px !important; height:180px !important; }
        }

        /* ── Tablet landscape (≤1024px) ── */
        @media (max-width:1024px) {
            .bd-bottom { grid-template-columns: 1fr; }
            .bd-wp-grid { grid-template-columns: 1fr; }
            #ba-summary-area { grid-template-columns: 1fr; gap: 16px; }
            #ba-charts-row { flex-direction: row; flex-wrap: wrap; }
            .ba-pie-card { flex: 1; min-width: 280px; }
            /* Modal: narrower on tablet */
            #ba-drilldown-panel { width: min(700px, 100vw); }
        }

        /* ── Tablet portrait (≤900px) ── */
        @media (max-width:900px) {
            .bd-wp-two-col-row { grid-template-columns: 1fr; }
            .bd-cards { grid-template-columns: repeat(2,1fr); }
            .bd-banner-strip { grid-template-columns: repeat(2,1fr); }
            .ba-card-grid { grid-template-columns: 1fr !important; }
            .ba-card-grid.sub-grid { grid-template-columns: repeat(2,1fr) !important; }
            /* Modal full-width on tablet portrait */
            #ba-drilldown-panel { width: 100vw; }
            #ba-drilldown-overlay { align-items: flex-end; }
            #ba-drilldown-panel {
                height: 90vh; max-height: 90vh;
                border-radius: 16px 16px 0 0;
            }
            @keyframes panelIn {
                from { transform: translateY(60px); opacity: 0; }
                to   { transform: translateY(0);    opacity: 1; }
            }
        }

        /* ── Mobile (≤768px) ── */
        @media (max-width:768px) {
            /* Layout */
            .bd-panel { padding: 10px 12px; }
            #bd-filter-row { padding: 10px 12px 0; }

            /* Banner cards */
            .bd-banner-strip { grid-template-columns: 1fr; gap: 8px; margin-bottom: 10px; }
            .bd-banner-value { font-size: 20px; }
            .bd-banner-card { padding: 12px 14px; }

            /* Unit cards */
            .bd-cards { grid-template-columns: repeat(2,1fr); gap: 8px; }
            .bd-card-value { font-size: 13px; }

            /* Horizontal bar chart */
            .bd-bar-label { width: 100px; min-width: 100px; font-size: 11px; }
            .bd-bar-val   { width: 60px;  min-width: 60px;  font-size: 11px; }
            .bd-bottom { gap: 10px; margin-top: 10px; }

            /* BA Pie charts */
            .ba-pie-card { grid-template-columns: 1fr; }
            .ba-pie-canvas-wrap { width: 160px; height: 160px; margin: 0 auto; }
            .ba-pie-canvas-wrap canvas { width:160px !important; height:160px !important; }
            #ba-charts-row { flex-direction: column; }

            /* Modal */
            #ba-drilldown-panel { width: 100vw; height: 92vh; max-height: 92vh; border-radius: 16px 16px 0 0; }
            #ba-drilldown-overlay { align-items: flex-end; }
            #ba-drilldown-header { height: 50px; padding: 0 14px; }
            #ba-drilldown-title { font-size: 13px; }

            /* Modal tab bar — smaller */
            .ba-drill-nav-item { padding: 8px 10px; font-size: 11px; gap: 5px; }
            #ba-drill-summary-strip { gap: 14px; padding: 5px 12px 6px; }
            .ba-drill-sum-val { font-size: 12px; }

            /* Modal col header */
            #ba-drill-col-header > div { padding: 8px 8px; font-size: 10px; }
            .ba-drill-row > div { padding: 6px 8px; font-size: 11px; }
            .ba-drill-section-hdr > div:first-child { padding: 8px !important; }
        }

        /* ── Mobile small (≤600px) ── */
        @media (max-width:600px) {
            .bd-panel { padding: 8px 10px; }
            .bd-cards { grid-template-columns: 1fr 1fr; gap: 6px; }
            .bd-card { padding: 10px 12px; }
            .bd-card-value { font-size: 12px; }
            .bd-chart-box { padding: 12px 10px; }
            .bd-bar-row { gap: 6px; }
            .bd-bar-label { width: 85px; min-width: 85px; font-size: 10px; }
            .bd-bar-val   { width: 52px; min-width: 52px; font-size: 10px; }

            /* BA cards */
            .ba-card-grid.sub-grid { grid-template-columns: 1fr !important; }
            .ba-kpi-value { font-size: 12px; }

            /* Modal — collapse to budget-only style on tiny screens */
            #ba-drilldown-panel { height: 95vh; max-height: 95vh; }
            #ba-drilldown-title { font-size: 12px; }
            #ba-drilldown-close { width: 28px; height: 28px; font-size: 16px; }

            /* Modal cols — compress */
            .ba-drill-row > div { padding: 5px 6px; font-size: 10px; }
            .ba-drill-util-pill { padding: 1px 5px; font-size: 9px; }
        }

        /* ── Extra small (≤480px) ── */
        @media (max-width:480px) {
            .bd-banner-strip { grid-template-columns: 1fr; }
            .bd-banner-value { font-size: 18px; }
            .bd-cards { grid-template-columns: 1fr; }
            .bd-section-title { font-size: 10px; }

            /* Tab nav scroll on tiny screens */
            #bd-tab-nav { padding: 0 10px; overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none; }
            #bd-tab-nav::-webkit-scrollbar { display: none; }
            .bd-tab { font-size: 12px; padding: 8px 12px 9px; white-space: nowrap; }

            /* Modal: single budget column on very small */
            #ba-drilldown-panel { border-radius: 12px 12px 0 0; }
            #ba-drill-summary-strip { gap: 10px; flex-wrap: wrap; }
            .ba-drill-nav-item { padding: 6px 8px; font-size: 10px; }
        }
        .multiselect-list .selectable-items {
            max-height: 300px;
            overflow: auto;
        }
    </style>`).appendTo('head');

    const PALETTE     = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
    const SUB_PALETTE = ['#5b9bd5','#17856a','#c04e22','#6b62c7','#c03d6a','#9a5e0e','#4e7a18','#c93737','#0f4a87','#6b6b68'];
    const BA_PALETTE  = ['#0076B6','#f58020','#2ecc71','#9b59b6','#e74c3c','#1abc9c','#e67e22','#2980b9','#8e44ad','#27ae60','#c0392b','#16a085'];

    /* ── HTML SKELETON ── */
    $(page.body).html(`
        <div class="bd-wrap">
            <!-- All filters in one Bootstrap row: FY always visible, BA cols toggled -->
            <div id="bd-filter-row">
                <div class="row">
                    <div class="col-sm-3" id="bd-fy-wrap"></div>
                    <div class="col-sm-3 ba-col" id="ba-month-wrap"></div>
                    <div class="col-sm-3 ba-col" id="ba-theme-wrap"></div>
                    <div class="col-sm-3 ba-col" id="ba-unit-wrap"></div>
                    <div class="col-sm-3 ba-col" id="ba-cc-wrap"></div>
                    <div class="col-sm-3 ba-col" id="ba-lc-wrap"></div>
                    <div class="col-sm-3 ba-btn-col" id="ba-btn-wrap"></div>
                </div>
            </div>

            <!-- Tabs -->
            <ul id="bd-tab-nav">
                <li><a class="bd-tab active" data-tab="dashboard">Budget Dashboard</a></li>
                <li><a class="bd-tab" data-tab="workplan">Work Plan Views</a></li>
                <li><a class="bd-tab" data-tab="babreakdown">Budget vs Actuals Breakdown</a></li>
            </ul>

            <!-- Dashboard Tab -->
            <div class="bd-panel active" id="bd-panel-dashboard">
                <div class="bd-banner-strip">
                    <div class="bd-banner-card blue">
                        <div class="bd-banner-label">Overall Grand Total</div>
                        <div class="bd-banner-value" id="bd-grand-total">—</div>
                        <div class="bd-banner-sub" id="bd-unit-count">—</div>
                        <div class="ba-click-hint">▶ View line items</div>
                    </div>
                    <div class="bd-banner-card green">
                        <div class="bd-banner-label">CAPEX Total</div>
                        <div class="bd-banner-value" id="bd-capex-total">—</div>
                        <div class="bd-banner-sub">Capital Expenses</div>
                        <div class="ba-click-hint">▶ View line items</div>
                    </div>
                    <div class="bd-banner-card orange">
                        <div class="bd-banner-label">OPEX Total</div>
                        <div class="bd-banner-value" id="bd-opex-total">—</div>
                        <div class="bd-banner-sub">Operating Expenses</div>
                        <div class="ba-click-hint">▶ View line items</div>
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

            <!-- Work Plan Tab -->
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

            <!-- Budget vs Actuals Breakdown Tab -->
            <div class="bd-panel" id="bd-panel-babreakdown">
                <div id="ba-no-data">
                    <div style="font-size:40px;margin-bottom:12px;">📊</div>
                    <div style="font-size:15px;font-weight:600;color:#555;margin-bottom:6px;">No data loaded yet</div>
                    <div style="font-size:13px;color:#aaa;">Select filters above and click <strong>Get Report</strong></div>
                </div>
                <div id="ba-report-content" style="display:none;">

                    <div id="ba-summary-area">
                        <div id="ba-cards-area"></div>
                        <div id="ba-charts-row">
                            <div class="ba-pie-card">
                                <div class="ba-pie-title">Budget Breakdown</div>
                                <div class="ba-pie-canvas-wrap"><canvas id="ba-budget-pie"></canvas></div>
                                <div class="ba-pie-legend" id="ba-budget-legend"></div>
                            </div>
                            <div class="ba-pie-card">
                                <div class="ba-pie-title">Actuals Breakdown</div>
                                <div class="ba-pie-canvas-wrap"><canvas id="ba-actuals-pie"></canvas></div>
                                <div class="ba-pie-legend" id="ba-actuals-legend"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Drill-down slide panel -->
        <div id="ba-drilldown-overlay">
            <div id="ba-drilldown-panel">
                <div id="ba-drilldown-header">
                    <button id="ba-drilldown-close">×</button>
                    <div id="ba-drilldown-title">Line Items</div>
                    <div id="ba-drilldown-header-right">
                        <label id="ba-expand-toggle-wrap">
                            <input type="checkbox" id="ba-expand-all-cb"> Expand All
                        </label>
                    </div>
                </div>
                <div id="ba-drilldown-body">
                    <div id="ba-drill-sidebar"></div>
                    <div id="ba-drill-content">
                        <div id="ba-drill-col-header"></div>
                        <div id="ba-drill-rows-scroll"></div>
                    </div>
                </div>
            </div>
        </div>
    `);

    /* ════════════════════════════════════════════
       SHARED STATE
    ════════════════════════════════════════════ */
    let donutChart   = null;
    let bdRawMessage = [];  // raw dashboard API response for drilldown
    // ── API cache: key = "fy|month|filter", value = response message ──
    const _apiCache = {};
    function cachedCall(fy, month, filter, callback) {
        const key = `${fy}|${month}|${filter}`;
        if (_apiCache[key]) { callback(_apiCache[key]); return; }
        Loader.show('Loading…');
        frappe.call({
            method: 'annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget',
            args: { financial_year: fy, month: month, table_name_filter: filter,}
        }).done(r => {
            Loader.hide();
            if (r.message?.length) _apiCache[key] = r.message;
            callback(r.message || []);
        }).fail(() => { Loader.hide(); frappe.msgprint('API call failed.'); });
    }
    let wpPieChart   = null;
    let wpDataLoaded = false;
    let baBudgetPie  = null;
    let baActualsPie = null;
    let baExpenseHeads = [];

    /* ════════════════════════════════════════════
       TAB NAVIGATION
    ════════════════════════════════════════════ */
    $(page.body).on('click', '#bd-tab-nav .bd-tab', function (e) {
        e.preventDefault();
        const tab = $(this).data('tab');
        $('#bd-tab-nav .bd-tab').removeClass('active');
        $('.bd-panel').removeClass('active');
        $(this).addClass('active');
        $('#bd-panel-' + tab).addClass('active');

        /* Show/hide BA filter cols */
        if (tab === 'babreakdown') {
            $('#bd-filter-row .ba-col, #bd-filter-row .ba-btn-col').addClass('active');
        } else {
            $('#bd-filter-row .ba-col, #bd-filter-row .ba-btn-col').removeClass('active');
        }

        if (tab === 'workplan' && !wpDataLoaded) {
            const fy = fyControl.get_value();
            if (fy) loadWorkPlan(fy);
        }
    });

    /* ════════════════════════════════════════════
       SHARED FY FILTER
    ════════════════════════════════════════════ */
    const fyControl = frappe.ui.form.make_control({
        parent: document.getElementById('bd-fy-wrap'),
        df: { label:'Financial Year', fieldtype:'Select', fieldname:'financial_year', reqd:1,
              change() { triggerLoad(); } },
        render_input: true
    });
    fyControl.refresh();

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

    /* ════════════════════════════════════════════
       BA EXTRA FILTERS
    ════════════════════════════════════════════ */
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    const baMonthCtrl = frappe.ui.form.make_control({
        parent: document.getElementById('ba-month-wrap'),
        df: { label:'YTD Month', fieldtype:'Select', fieldname:'ba_month',
              options:['January','February','March','April','May','June','July','August','September','October','November','December'].join('\n') },
        render_input: true
    });
    baMonthCtrl.set_value(currentMonth);

    const baThemeCtrl = frappe.ui.form.make_control({
        parent: document.getElementById('ba-theme-wrap'),
        df: { label:'Operating Units', fieldtype:'MultiSelectList', fieldname:'ba_theme',
              get_data() { return frappe.call({ method:'annual_budget.api.filter_options.get_theme' }).then(r => (r.message||[]).map(d => ({ label:d.number_card_title, value:d.name, description:'' }))); }
        },
        render_input: true
    });

    const baUnitCtrl = frappe.ui.form.make_control({
        parent: document.getElementById('ba-unit-wrap'),
        df: { label:'Unit', fieldtype:'MultiSelectList', fieldname:'ba_unit', reqd:1,
              get_data() { return frappe.call({ method:'annual_budget.api.filter_options.get_units' }).then(r => (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:'' }))); },
              change() {
                  const units = (baUnitCtrl.get_value()||[]).map(String);
                  baCcCtrl.set_value([]); baLcCtrl.set_value([]);
                  baCcCtrl.df.options = []; baCcCtrl.refresh();
                  baLcCtrl.df.options = []; baLcCtrl.refresh();
                  if (units.length) { baLoadCC(units); baLoadLC(units); }
              }
        },
        render_input: true
    });

    const baCcCtrl = frappe.ui.form.make_control({
        parent: document.getElementById('ba-cc-wrap'),
        df: { label:'Cost Center', fieldtype:'MultiSelectList', fieldname:'ba_cc', options:[] },
        render_input: true
    });

    const baLcCtrl = frappe.ui.form.make_control({
        parent: document.getElementById('ba-lc-wrap'),
        df: { label:'Location Code', fieldtype:'MultiSelectList', fieldname:'ba_lc', options:[] },
        render_input: true
    });

    const baBtnCtrl = frappe.ui.form.make_control({
        parent: document.getElementById('ba-btn-wrap'),
        df: { label:' ', fieldtype:'Button', fieldname:'ba_get_report', click() { baLoadData(); } },
        render_input: true
    });
    baBtnCtrl.$wrapper.find('button').addClass('btn btn-primary btn-get-report').text('Get Report');

    /* helpers */
    function baMergeOpts(ctrl, new_opts) {
        let selected = (ctrl.get_value()||[]).map(String);
        let map = {};
        ((ctrl.df && ctrl.df.options)||[]).forEach(o => { if (o?.value!=null) map[String(o.value)]=o; });
        new_opts.forEach(o => { if (o?.value!=null) map[String(o.value)]=o; });
        selected.forEach(v => { if (!map[v]) map[v]={label:v,value:v,description:''}; });
        return Object.values(map);
    }

    function baGetKey(ctrl, key) {
        let sel = (ctrl.get_value()||[]).map(String);
        let opts = Array.isArray(ctrl.df?.options) ? ctrl.df.options : [];
        return sel.map(v => { let o=opts.find(o=>o&&String(o.value)===v); return o?.[key]||null; }).filter(Boolean);
    }

    function baLoadCC(units) {
        frappe.call({
            method: 'annual_budget.api.filter_options.get_cost_centers_by_set_id',
            args: { units: units.join(',') },
            callback(r) {
                let opts = (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:'', erp_cost_center_value:String(d.erp_cost_center_value||'') }));
                baCcCtrl.df.options = baMergeOpts(baCcCtrl, opts);
                baCcCtrl.refresh();
            }
        });
    }

    function baLoadLC(units) {
        frappe.call({
            method: 'annual_budget.api.filter_options.get_location_codes_by_unit',
            args: { unit: units.join(',') },
            callback(r) {
                let opts = (r.message?.data||[]).filter(d=>d.value).map(d => ({ label:d.label, value:String(d.value), description:'', erp_loc_value:String(d.erp_loc_value||'') }));
                baLcCtrl.df.options = baMergeOpts(baLcCtrl, opts);
                baLcCtrl.refresh();
            }
        });
    }

    /* ════════════════════════════════════════════
       BA LOAD DATA
    ════════════════════════════════════════════ */
    function baLoadData() {
        const fy   = fyControl.get_value();
        const mon  = baMonthCtrl.get_value();
        const unit = (baUnitCtrl.get_value()||[]).join(',') || null;

        let missing = [];
        if (!fy)   missing.push('Financial Year');
        if (!mon)  missing.push('Month');
        if (!unit) missing.push('Unit');
        if (missing.length) {
            frappe.msgprint({ title:'Required Filters', message:'Please select: '+missing.join(', '), indicator:'orange' });
            return;
        }

        Loader.show('Loading Budget vs Actuals data…');

        frappe.call({
            method: 'annual_budget.api.phase_sheet.get_combined_actuals',
            args: {
                financial_year: fy,
                month: mon,
                unit,
                cost_center:           (baGetKey(baCcCtrl,'value')||[]).join(',') || null,
                location_code:         (baGetKey(baLcCtrl,'value')||[]).join(',') || null,
                erp_cost_center_value: (baGetKey(baCcCtrl,'erp_cost_center_value')||[]).join(',') || null,
                erp_loc_value:         (baGetKey(baLcCtrl,'erp_loc_value')||[]).join(',') || null
            }
        })
        .done(function(r) {
            const raw = Array.isArray(r.message) ? r.message : (r.message?.message || []);

            /* Extract pre-computed summary rows from the API response */
            const SUMMARY_SEQ = new Set([9997, 9998, 9999]);
            const SUMMARY_NAMES = /^(CAPEX TOTAL|OPEX TOTAL|OVERALL GRAND TOTAL|GRAND TOTAL)$/i;
            const summaryRows = raw.filter(h =>
                SUMMARY_SEQ.has(h.sequence_id) || SUMMARY_NAMES.test((h.name||'').trim())
            );

            /* Real expense heads only — exclude roll-up rows */
            baExpenseHeads = raw.filter(h =>
                !SUMMARY_SEQ.has(h.sequence_id) && !SUMMARY_NAMES.test((h.name||'').trim())
            );

            $('#ba-no-data').removeClass('show').hide();
            $('#ba-report-content').show();
            baRenderCards(baExpenseHeads);
        })
        .fail(function() {
            frappe.msgprint({ title:'Error', message:'Failed to load data. Please try again.', indicator:'red' });
        })
        .always(function() { Loader.hide(); });
    }

    /* ════════════════════════════════════════════
       BA HELPERS
    ════════════════════════════════════════════ */
    const baFmt  = n => Math.round(Number(n)||0).toLocaleString('en-IN', { maximumFractionDigits:0 });
    const baRnd  = n => Math.round(Number(n)||0);
    const baPct  = (b, a) => { b=baRnd(b); a=baRnd(a); return b ? Math.round((a/b)*100) : 0; };

    function baUtilColor(u) {
        if (u > 100) return '#c0392b';
        if (u >= 60)  return '#e07c3a';
        return '#27ae60';
    }

    /* ════════════════════════════════════════════
       BA TOP BANNER — Grand Total / CAPEX / OPEX
    ════════════════════════════════════════════ */
    function baRenderBanner(summaryRows, expenseHeads) {
        const $b = $('#ba-top-banner').empty();

        /* Try to get pre-computed values from summary rows first */
        const find = name => {
            const r = summaryRows.find(h => (h.name||'').trim().toUpperCase() === name.toUpperCase());
            return r ? { budget: baRnd(r.ytd||0), actuals: baRnd(r.total_posted_amt_ytd||0) } : null;
        };

        let overall = find('OVERALL GRAND TOTAL') || find('GRAND TOTAL');
        let capex   = find('CAPEX TOTAL');
        let opex    = find('OPEX TOTAL');

        /* Fallback: compute from expense heads if summary rows absent */
        if (!overall) {
            const b = expenseHeads.reduce((s,h) => s + baRnd(h.ytd), 0);
            const a = expenseHeads.reduce((s,h) => s + baRnd(h.total_posted_amt_ytd||0), 0);
            overall = { budget: b, actuals: a };
        }
        if (!capex) {
            const capexHead = expenseHeads.find(h => /CAPITAL/i.test(h.name||''));
            capex = capexHead ? { budget: baRnd(capexHead.ytd), actuals: baRnd(capexHead.total_posted_amt_ytd||0) } : null;
        }
        if (!opex) {
            const opexHead = expenseHeads.find(h => /OPERATING/i.test(h.name||''));
            opex = opexHead ? { budget: baRnd(opexHead.ytd), actuals: baRnd(opexHead.total_posted_amt_ytd||0) } : null;
        }

        const fmtCrLocal = n => {
            const abs = Math.abs(n||0);
            if (abs >= 1e7) return '₹' + Math.round((n||0)/1e7) + ' Cr';
            if (abs >= 1e5) return '₹' + Math.round((n||0)/1e5) + ' L';
            return '₹' + Math.round(n||0).toLocaleString('en-IN');
        };
        const utilPct = (b, a) => b ? Math.round((a/b)*100) : 0;

        function bannerCard(label, sub, val1, val2, colorClass) {
            const u = utilPct(val1, val2);
            const uc = u > 100 ? '#c0392b' : u >= 60 ? '#e07c3a' : '#27ae60';
            return `<div class="bd-banner-card ${colorClass}">
                <div class="bd-banner-label">${label}</div>
                <div class="bd-banner-value">${fmtCrLocal(val1)}</div>
                <div class="bd-banner-sub" style="display:flex;align-items:center;gap:8px;">
                    <span>${sub}</span>
                    ${val2 > 0 ? `<span style="font-size:11px;font-weight:700;color:${uc};margin-left:auto;">${u}% util</span>` : ''}
                </div>
                ${val2 > 0 ? `<div class="bd-banner-sub" style="margin-top:2px;">Actuals: ${fmtCrLocal(val2)}</div>` : ''}
            </div>`;
        }

        $b.append(bannerCard('Grand Total', 'Budget Plan', overall.budget, overall.actuals, 'blue'));
        if (capex)   $b.append(bannerCard('CAPEX Total', 'Capital Expenses', capex.budget, capex.actuals, 'green'));
        if (opex)    $b.append(bannerCard('OPEX Total', 'Operating Expenses', opex.budget, opex.actuals, 'orange'));
    }

    /* ════════════════════════════════════════════
       BA BUILD CARD (clickable)
    ════════════════════════════════════════════ */
    function baBuildCard(headData, color, isSub, isGrand) {
        const name   = isSub ? headData.name : headData.name;
        const budget = baRnd(headData.ytd);
        const actual = baRnd(headData.total_posted_amt_ytd);
        const u      = baPct(budget, actual);
        const bw     = Math.min(u, 100);
        const uc     = baUtilColor(u);

        let cls = isGrand ? 'ba-grand-card' : (isSub ? 'ba-number-card sub' : 'ba-number-card');

        const $card = $(`
            <div class="${cls}" style="border-left-color:${color};" title="Click to see line items">
                <div class="ba-number-title" title="${frappe.utils.escape_html(name)}">${frappe.utils.escape_html(name)}</div>
                <div class="ba-kpi-row">
                    <div class="ba-kpi-block">
                        <div class="ba-kpi-label">Budget</div>
                        <div class="ba-kpi-value">${baFmt(budget)}</div>
                    </div>
                    <div class="ba-kpi-block">
                        <div class="ba-kpi-label">Actual</div>
                        <div class="ba-kpi-value">${baFmt(actual)}</div>
                    </div>
                </div>
                <div class="ba-kpi-bottom">
                    <div class="ba-kpi-block">
                        <div class="ba-kpi-label">Variance</div>
                        <div class="ba-kpi-value">${baFmt(budget - actual)}</div>
                    </div>
                    <div class="ba-kpi-block">
                        <div class="ba-kpi-label">Util %</div>
                        <div class="ba-kpi-value" style="color:${uc};">${u}%</div>
                    </div>
                </div>
                <div class="ba-util-bar-wrap">
                    <div class="ba-util-bar-bg">
                        <div class="ba-util-bar" style="width:${bw}%; background:${uc};"></div>
                    </div>
                </div>
                <div class="ba-click-hint">▶ View line items</div>
            </div>
        `);

        $card.on('click', function() {
            baOpenDrilldown(headData, name, color);
        });

        return $card;
    }

    /* ════════════════════════════════════════════
       BA RENDER CARDS
    ════════════════════════════════════════════ */
    function baRenderCards(data) {
        const $area = $('#ba-cards-area').empty();
        if (!data?.length) return;

        /* Grand total card */
        let gB = 0, gA = 0;
        data.forEach(h => { gB += baRnd(h.ytd); gA += baRnd(h.total_posted_amt_ytd); });
        const grandData = {
            name: 'Grand Total',
            ytd: gB,
            total_posted_amt_ytd: gA,
            items: [],
            sub_heads: data.flatMap(h => [
                ...(h.items||[]),
                ...(h.sub_heads||[]).flatMap(s => s.items||[])
            ])
        };
        /* Build a synthetic grand head that flattens everything for drilldown */
        const grandDrillData = {
            name: 'Grand Total',
            ytd: gB,
            total_posted_amt_ytd: gA,
            items: data.flatMap(h => (h.items||[])),
            sub_heads: data.flatMap(h => (h.sub_heads||[]))
        };

        $area.append('<div class="ba-section-label">Grand Total</div>');
        $area.append(baBuildCard(grandDrillData, '#0076B6', false, true));

        /* Expense head cards */
        const mainHeads = data.filter(h => baRnd(h.ytd) !== 0);
        if (!mainHeads.length) {
            requestAnimationFrame(() => requestAnimationFrame(() => baRenderPieCharts(data)));
            return;
        }

        $area.append('<div class="ba-section-label">Expense Heads</div>');
        const $mainGrid = $('<div class="ba-card-grid"></div>');
        mainHeads.forEach((h, i) => {
            $mainGrid.append(baBuildCard(h, BA_PALETTE[i % BA_PALETTE.length], false, false));
        });
        $area.append($mainGrid);

        /* Sub head cards */
        mainHeads.forEach((h, i) => {
            const color     = BA_PALETTE[i % BA_PALETTE.length];
            const validSubs = (h.sub_heads||[]).filter(s => baRnd(s.ytd) !== 0);
            if (!validSubs.length) return;
            $area.append(`<div class="ba-section-label" style="color:${color};"><span style="opacity:.45;color:#888;">Sub Heads — </span>${frappe.utils.escape_html(h.name)}</div>`);
            const $subGrid = $('<div class="ba-card-grid sub-grid"></div>');
            validSubs.forEach(s => {
                $subGrid.append(baBuildCard(s, color, true, false));
            });
            $area.append($subGrid);
        });

        requestAnimationFrame(() => requestAnimationFrame(() => baRenderPieCharts(data)));
    }

    /* ════════════════════════════════════════════
       BA DRILL-DOWN MODAL  (split header/body, expand/collapse, skip zeros)
    ════════════════════════════════════════════ */
    function baOpenDrilldown(headData, title, color, isUnitView) {
        $('#ba-drilldown-title').text(title).css('color', color || '#111');
        const $body = $('#ba-drilldown-body').empty();

        const esc  = s => frappe.utils.escape_html(s);
        const isNZ = (b, a) => b !== 0 || a !== 0;
        const uCls = u => u > 100 ? 'ba-drill-over' : 'ba-drill-util';

        /* Decide if this modal needs expand/collapse:
           - Grand Total view  (multiple heads)
           - Any single head that has sub_heads with items  */
        /* isGrandTotal: either the BA tab Grand Total card, OR a unit-level view from dashboard
           (isUnitView=true, where sub_heads[] ARE the expense heads) */
        const isGrandTotal   = (title === 'Grand Total') || !!isUnitView;
        const hasSubs        = !isGrandTotal && (headData.sub_heads||[]).some(s => (s.items||[]).length > 0);
        const useCollapse    = isGrandTotal || hasSubs;
        /* collapsed by default when useCollapse */
        const defaultOpen    = !useCollapse;

        const $tbody = $('<tbody></tbody>');
        let grandB = 0, grandA = 0;

        /* For BA Grand Total: use baExpenseHeads (from BA tab filter)
           For unit drilldown (isUnitView): use headData.sub_heads as expense heads
           For single head card: just wrap headData */
        /* 'Grand Total' = BA tab drilldown (uses baExpenseHeads)
           isUnitView = unit card or banner card drilldown (uses headData.sub_heads) */
        const headsToShow = (title === 'Grand Total' && !isUnitView)
            ? baExpenseHeads
            : (isUnitView ? (headData.sub_heads || []) : [headData]);

        headsToShow.forEach((head, hIdx) => {
            const hB = baRnd(head.ytd);
            const hA = baRnd(head.total_posted_amt_ytd);
            grandB += hB; grandA += hA;
            const hKey = 'h' + hIdx;
            const hasItems = (head.items||[]).some(it => isNZ(baRnd(it.ytd), baRnd(it.total_posted_amt)));
            const validSubs = (head.sub_heads||[]).filter(s => isNZ(baRnd(s.ytd), baRnd(s.total_posted_amt_ytd)));
            const hasChildren = hasItems || validSubs.length > 0;

            if (isGrandTotal) {
                const hU = baPct(hB, hA);
                const tog = hasChildren
                    ? `<span class="drill-toggle" data-key="${hKey}" data-open="${defaultOpen?1:0}">${defaultOpen?'▼':'▶'}</span>`
                    : `<span class="drill-toggle"></span>`;
                if (isUnitView) {
                    $tbody.append(`<tr class="head-row" ${hasChildren?`data-ctrl="${hKey}"`:''}>
                        <td>${tog}<strong>${esc(head.name)}</strong></td>
                        <td>${baFmt(hB)}</td>
                    </tr>`);
                } else {
                    $tbody.append(`<tr class="head-row" ${hasChildren?`data-ctrl="${hKey}"`:''}>
                        <td>${tog}<strong>${esc(head.name)}</strong></td>
                        <td>${baFmt(hB)}</td><td>${baFmt(hA)}</td>
                        <td class="${uCls(hU)}">${hU}%</td>
                        <td>${baFmt(hB-hA)}</td>
                    </tr>`);
                }
            }

            /* Direct items under head */
            (head.items||[]).forEach(item => {
                const b = baRnd(item.ytd), a = baRnd(item.total_posted_amt);
                if (!isNZ(b,a)) return;
                const hidden = (isGrandTotal && !defaultOpen) ? ' drill-hidden' : '';
                if (isUnitView) {
                    $tbody.append(`<tr class="item-row${hidden}" data-parent="${hKey}">
                        <td><span class="drill-toggle"></span>${esc(item.name)}</td>
                        <td>${baFmt(b)}</td>
                    </tr>`);
                } else {
                    $tbody.append(`<tr class="item-row${hidden}" data-parent="${hKey}">
                        <td><span class="drill-toggle"></span>${esc(item.name)}</td>
                        <td>${baFmt(b)}</td><td>${baFmt(a)}</td>
                        <td class="${uCls(baPct(b,a))}">${baPct(b,a)}%</td>
                        <td>${baFmt(b-a)}</td>
                    </tr>`);
                }
            });

            /* Sub heads */
            validSubs.forEach((sub, sIdx) => {
                const sB = baRnd(sub.ytd), sA = baRnd(sub.total_posted_amt_ytd);
                const sKey = hKey + 's' + sIdx;
                const subItems = (sub.items||[]).filter(it => isNZ(baRnd(it.ytd), baRnd(it.total_posted_amt)));
                const hasSI = subItems.length > 0;
                const sU = baPct(sB, sA);
                /* sub rows: hidden if grand total collapsed */
                const subHidden = (isGrandTotal && !defaultOpen) ? ' drill-hidden' : '';
                /* sub items: hidden by default when useCollapse */
                const itemHidden = useCollapse ? ' drill-hidden' : '';
                const stog = hasSI
                    ? `<span class="drill-toggle" data-key="${sKey}" data-open="0">▶</span>`
                    : `<span class="drill-toggle"></span>`;
                if (isUnitView) {
                    $tbody.append(`<tr class="sub-row${subHidden}" data-parent="${hKey}" ${hasSI?`data-ctrl="${sKey}"`:''}>
                        <td>${stog}<strong>${esc(sub.name)}</strong></td>
                        <td>${baFmt(sB)}</td>
                    </tr>`);
                } else {
                    $tbody.append(`<tr class="sub-row${subHidden}" data-parent="${hKey}" ${hasSI?`data-ctrl="${sKey}"`:''}>
                        <td>${stog}<strong>${esc(sub.name)}</strong></td>
                        <td>${baFmt(sB)}</td><td>${baFmt(sA)}</td>
                        <td class="${uCls(sU)}">${sU}%</td>
                        <td>${baFmt(sB-sA)}</td>
                    </tr>`);
                }
                subItems.forEach(item => {
                    const b = baRnd(item.ytd), a = baRnd(item.total_posted_amt);
                    if (isUnitView) {
                        $tbody.append(`<tr class="item-row${itemHidden}" data-parent="${sKey}">
                            <td><span class="drill-toggle"></span>${esc(item.name)}</td>
                            <td>${baFmt(b)}</td>
                        </tr>`);
                    } else {
                        $tbody.append(`<tr class="item-row${itemHidden}" data-parent="${sKey}">
                            <td><span class="drill-toggle"></span>${esc(item.name)}</td>
                            <td>${baFmt(b)}</td><td>${baFmt(a)}</td>
                            <td class="${uCls(baPct(b,a))}">${baPct(b,a)}%</td>
                            <td>${baFmt(b-a)}</td>
                        </tr>`);
                    }
                });
            });
        });

        const grandU = baPct(grandB, grandA);

        if ($tbody.children(':not(.drill-hidden)').length === 0 && $tbody.children().length === 0) {
            $body.html('<div class="ba-drill-scroll"><p style="color:#aaa;text-align:center;padding:30px;">No data with non-zero values found.</p></div>');
        } else {
            /* ── Fixed header (no scroll) ── */
            const $headerWrap = $('<div class="ba-drill-header-wrap"></div>');
            if (isUnitView) {
                $headerWrap.append(`<table class="ba-drill-header-table ba-drill-budget-only">
                    <thead><tr>
                        <th style="width:70%">Expense Item</th>
                        <th style="width:30%">Budget</th>
                    </tr></thead>
                </table>`);
            } else {
                $headerWrap.append(`<table class="ba-drill-header-table">
                    <thead><tr>
                        <th>Expense Item</th>
                        <th>Budget</th><th>Actuals</th><th>Util %</th><th>Variance</th>
                    </tr></thead>
                </table>`);
            }
            $body.append($headerWrap);

            /* ── Scrollable body ── */
            const $scroll = $('<div class="ba-drill-scroll"></div>');
            // append total as last row in tbody so it always renders at bottom
            if (isUnitView) {
                $tbody.append(`<tr class="total-row">
                    <td>TOTAL</td>
                    <td>${baFmt(grandB)}</td>
                </tr>`);
            } else {
                $tbody.append(`<tr class="total-row">
                    <td>TOTAL</td>
                    <td>${baFmt(grandB)}</td><td>${baFmt(grandA)}</td>
                    <td>${grandU}%</td><td>${baFmt(grandB-grandA)}</td>
                </tr>`);
            }
            const $tbl = $(`<table class="ba-drill-table${isUnitView ? ' ba-drill-budget-only' : ''}"></table>`);
            $tbl.append($tbody);
            $scroll.append($tbl);
            $body.append($scroll);

            /* ── Toggle single row ── */
            function toggleKey(key, forceOpen) {
                const $tog  = $tbody.find(`.drill-toggle[data-key="${key}"]`);
                const isOpen = forceOpen !== undefined ? !forceOpen : !!$tog.data('open');
                const kids  = $tbody.find(`tr[data-parent="${key}"]`);
                if (isOpen) {
                    kids.addClass('drill-hidden');
                    $tog.text('▶').data('open', 0);
                } else {
                    kids.removeClass('drill-hidden');
                    $tog.text('▼').data('open', 1);
                }
            }

            $body.on('click', '.drill-toggle[data-key]', function(e) {
                e.stopPropagation();
                toggleKey($(this).data('key'));
            });
            $body.on('click', '.head-row[data-ctrl], .sub-row[data-ctrl]', function(e) {
                if ($(e.target).hasClass('drill-toggle')) return;
                $(this).find('.drill-toggle[data-key]').trigger('click');
            });

            /* ── Expand All checkbox ── */
            if (useCollapse) {
                $('#ba-expand-toggle-wrap').addClass('visible');
                $('#ba-expand-all-cb').prop('checked', defaultOpen);

                $('#ba-expand-all-cb').off('change').on('change', function() {
                    const expand = $(this).is(':checked');
                    // collect all toggle keys
                    $tbody.find('.drill-toggle[data-key]').each(function() {
                        const key    = $(this).data('key');
                        const isOpen = !!$(this).data('open');
                        if (expand && !isOpen)  toggleKey(key, false); // force open
                        if (!expand && isOpen)  toggleKey(key, true);  // force close
                    });
                });
            } else {
                $('#ba-expand-toggle-wrap').removeClass('visible');
                $('#ba-expand-all-cb').prop('checked', false);
            }
        }

        $('#ba-drilldown-overlay').addClass('open');
    }

    /* Close drilldown */
    function baCloseDrilldown() {
        $('#ba-drilldown-overlay').removeClass('open');
        $('#ba-expand-toggle-wrap').removeClass('visible');
        $('#ba-expand-all-cb').prop('checked', false);
    }
    $(page.body).on('click', '#ba-drilldown-close', baCloseDrilldown);
    $(page.body).on('click', '#ba-drilldown-overlay', function(e) {
        if (e.target === this) baCloseDrilldown();
    });

    /* ════════════════════════════════════════════
       BA PIE CHARTS
    ════════════════════════════════════════════ */
    function baRenderPieCharts(data) {
        function draw() {
            const BUDGET_COLORS = ['#4361EE','#3A0CA3','#7209B7','#F72585','#4CC9F0','#4895EF','#560BAD','#B5179E','#3F37C9','#480CA8','#6A0572','#D62828'];
            const ACTUAL_COLORS = ['#2D6A4F','#40916C','#52B788','#74C69D','#F4A261','#E76F51','#E9C46A','#264653','#2A9D8F','#8AB17D','#BABB74','#E07A5F'];

            let labels = [], budgets = [], actuals = [];
            (data||[]).forEach(h => {
                const validSubs = (h.sub_heads||[]).filter(s => baRnd(s.ytd)!==0 || baRnd(s.total_posted_amt_ytd)!==0);
                if (validSubs.length) {
                    validSubs.forEach(s => { labels.push(s.name); budgets.push(baRnd(s.ytd)); actuals.push(baRnd(s.total_posted_amt_ytd)); });
                } else {
                    labels.push(h.name); budgets.push(baRnd(h.ytd)); actuals.push(baRnd(h.total_posted_amt_ytd));
                }
            });

            const bColors = labels.map((_,i) => BUDGET_COLORS[i%BUDGET_COLORS.length]);
            const aColors = labels.map((_,i) => ACTUAL_COLORS[i%ACTUAL_COLORS.length]);

            const pctPlugin = {
                id:'baSlicePct',
                afterDatasetDraw(chart) {
                    let {ctx,data}=chart; let ds=data.datasets[0];
                    let total=ds.data.reduce((a,b)=>a+b,0); if(!total)return;
                    chart.getDatasetMeta(0).data.forEach((arc,i)=>{
                        let p=Math.round((ds.data[i]/total)*100); if(p<5)return;
                        let {x,y}=arc.tooltipPosition();
                        ctx.save(); ctx.fillStyle='#fff'; ctx.font='bold 11px sans-serif';
                        ctx.textAlign='center'; ctx.textBaseline='middle';
                        ctx.fillText(p+'%',x,y); ctx.restore();
                    });
                }
            };

            function buildLeg(id, values, colors) {
                let total=values.reduce((a,b)=>a+b,0);
                let $leg=$('#'+id).empty();
                labels.forEach((lbl,i)=>{
                    let p=total?Math.round((values[i]/total)*100):0;
                    $leg.append(`<div class="ba-pie-legend-item"><div class="ba-pie-legend-dot" style="background:${colors[i]};"></div><span class="ba-pie-legend-name" title="${frappe.utils.escape_html(lbl)}">${frappe.utils.escape_html(lbl)}</span><span class="ba-pie-legend-pct">${p}%</span></div>`);
                });
            }

            function makePie(canvasId, values, colors, existing) {
                if (existing) existing.destroy();
                const ctx = document.getElementById(canvasId)?.getContext('2d');
                if (!ctx) return null;
                return new Chart(ctx, {
                    type:'doughnut',
                    data:{ labels, datasets:[{ data:values, backgroundColor:colors, borderColor:'#fff', borderWidth:2, hoverOffset:10 }] },
                    options:{
                        responsive:false, cutout:'50%',
                        animation:{ animateRotate:true, duration:600 },
                        layout:{ padding:10 },
                        plugins:{
                            legend:{display:false},
                            tooltip:{ enabled:true, callbacks:{
                                title(items){return items[0]?.label||'';},
                                label(ctx){ let t=ctx.dataset.data.reduce((a,b)=>a+b,0); let p=t?Math.round((ctx.parsed/t)*100):0; return ` ₹${ctx.parsed.toLocaleString('en-IN')}  (${p}%)`; }
                            }}
                        }
                    },
                    plugins:[pctPlugin]
                });
            }

            baBudgetPie  = makePie('ba-budget-pie',  budgets, bColors, baBudgetPie);
            baActualsPie = makePie('ba-actuals-pie', actuals, aColors, baActualsPie);
            buildLeg('ba-budget-legend',  budgets, bColors);
            buildLeg('ba-actuals-legend', actuals, aColors);
        }

        if (window.Chart) { draw(); return; }
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
        s.onload=draw;
        document.head.appendChild(s);
    }

    /* ════════════════════════════════════════════
       DASHBOARD CARD DRILLDOWN
       Fetches BA actuals for the clicked unit label
       and opens the shared modal
    ════════════════════════════════════════════ */
    function bdOpenDrilldown(unitLabel, color) {
        const fy = fyControl.get_value();
        if (!fy) { frappe.msgprint('Please select a Financial Year.'); return; }

        /* ── Use the cached Number Card actuals — full items+sub_heads structure ── */
        const unitRec = bdRawMessage.find(d =>
            d.settings_doc !== 'CONSOLIDATED' &&
            (d.label || '').trim() === unitLabel
        );

        if (!unitRec) {
            frappe.msgprint('Unit not found: ' + unitLabel);
            return;
        }

        /*  actuals[] structure per unit:
            [
              { name:"CAPITAL  EXPENSES",  sequence_id:1,  sub_heads:[], items:[{name,ytd,gl_code,sequence_id}…], ytd:N },
              { name:"OPERATING  EXPENSES",sequence_id:28, sub_heads:[{name,ytd,items:[…]}, …], items:[], ytd:N },
              { name:"COVID SUPPORT",      sequence_id:183,sub_heads:[], items:[…], ytd:N },
              { name:"GRAND TOTAL",        sequence_id:9999, ytd:N }
            ]
            We map each non-GRAND-TOTAL entry as an expense head:
              - items[]  → direct line items (e.g. Capital Expenses)
              - sub_heads[] → sub-categories, each with their own items[]
        */
        const SKIP = /GRAND\s*TOTAL/i;
        const actuals = (unitRec.actuals || []).filter(a =>
            a.sequence_id !== 9999 && !SKIP.test(a.name || '')
        );

        if (!actuals.length) {
            frappe.msgprint('No line item data available for ' + unitLabel + '.');
            return;
        }

        /* Build the headData the modal expects:
           { name, ytd, total_posted_amt_ytd, items[], sub_heads[] }
           "ytd" = budget plan value from the response
           "total_posted_amt_ytd" = actuals posted (field name in Number Card response is also ytd,
            but since this API only has plan/ytd, we use ytd for budget and 0 for actuals)
        */
        const heads = actuals.map(a => ({
            name: a.name,
            ytd: a.ytd || 0,
            total_posted_amt_ytd: 0,   // Number Card has no posted actuals column
            items: (a.items || []).map(it => ({
                name: it.name,
                ytd: it.ytd || 0,
                total_posted_amt: 0
            })),
            sub_heads: (a.sub_heads || []).map(s => ({
                name: s.name,
                ytd: s.ytd || 0,
                total_posted_amt_ytd: 0,
                items: (s.items || []).map(it => ({
                    name: it.name,
                    ytd: it.ytd || 0,
                    total_posted_amt: 0
                }))
            }))
        }));

        /* Wrap all heads into a single "Grand Total" synthetic head so
           baOpenDrilldown renders them as a Grand Total view with collapse */
        const synth = {
            name: unitLabel,
            ytd: heads.reduce((s, h) => s + baRnd(h.ytd), 0),
            total_posted_amt_ytd: 0,
            items: [],
            sub_heads: heads
        };

        baOpenDrilldown(synth, unitLabel, color || '#378ADD', true /* isUnitView */);
    }

    /* ════════════════════════════════════════════
       DASHBOARD TAB — original logic
    ════════════════════════════════════════════ */
    const fmtINR = v => '₹' + Math.round(v||0).toLocaleString('en-IN');
    const fmtCr  = v => {
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
            .map((u,idx)=>{ const gt=(u.actuals||[]).find(a=>a.sequence_id===9999); return {label:(u.label||'').trim(),ytd:gt?(gt.ytd||0):0,sequence_id:u.sequence_id||0,color:PALETTE[idx%PALETTE.length]}; })
            .filter(u=>u.ytd>0);
        const subUnits = message
            .filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===1)
            .sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0))
            .map((u,idx)=>{ const gt=(u.actuals||[]).find(a=>a.sequence_id===9999); return {label:(u.label||'').trim(),ytd:gt?(gt.ytd||0):0,sequence_id:u.sequence_id||0,color:SUB_PALETTE[idx%SUB_PALETTE.length]}; })
            .filter(u=>u.ytd>0);
        let overall=0,capex=0,opex=0;
        if (consolidated) {
            const ca=consolidated.actuals||[];
            overall=(ca.find(a=>a.name==='OVERALL GRAND TOTAL')||{}).ytd||0;
            capex  =(ca.find(a=>a.name==='CAPEX TOTAL')||{}).ytd||0;
            opex   =(ca.find(a=>a.name==='OPEX TOTAL')||{}).ytd||0;
        }
        if (!overall) overall=mainUnits.reduce((s,u)=>s+u.ytd,0);
        /* Pass consolidated actuals for banner breakdown */
        const consolidatedActuals = consolidated ? (consolidated.actuals||[]).filter(a =>
            a.sequence_id !== 9997 && a.sequence_id !== 9998 && a.sequence_id !== 9999
        ) : [];
        return {mainUnits,subUnits,overall,capex,opex,consolidatedActuals};
    }

    function renderBanner(overall, capex, opex, mainUnits, subUnits, consolidatedActuals) {
        $('#bd-grand-total').text(fmtCr(overall));
        $('#bd-capex-total').text(fmtCr(capex));
        $('#bd-opex-total').text(fmtCr(opex));
        $('#bd-unit-count').text(mainUnits.length + ' units' + (subUnits.length ? ' · ' + subUnits.length + ' sub units' : ''));

        if (!consolidatedActuals || !consolidatedActuals.length) return;

        const capexHead = consolidatedActuals.find(a => /CAPITAL/i.test(a.name));
        const opexHead  = consolidatedActuals.find(a => /OPERATING/i.test(a.name));

                /* ── Make banner cards clickable → open drilldown modal ── */
        if (consolidatedActuals && consolidatedActuals.length) {
            /* Grand Total — all expense heads */
            const $gt = $('#bd-grand-total').closest('.bd-banner-card');
            $gt.css('cursor','pointer').attr('title','Click to view line items');
            $gt.off('click.drill').on('click.drill', function() {
                const synth = {
                    name: 'Grand Total',
                    ytd: overall,
                    total_posted_amt_ytd: 0,
                    items: [],
                    sub_heads: consolidatedActuals.map(a => ({
                        name: a.name,
                        ytd: a.ytd || 0,
                        total_posted_amt_ytd: 0,
                        items: (a.items || []).map(it => ({ name: it.name, ytd: it.ytd || 0, total_posted_amt: 0 })),
                        sub_heads: (a.sub_heads || []).map(s => ({
                            name: s.name, ytd: s.ytd || 0, total_posted_amt_ytd: 0,
                            items: (s.items || []).map(it => ({ name: it.name, ytd: it.ytd || 0, total_posted_amt: 0 }))
                        }))
                    }))
                };
                baOpenDrilldown(synth, 'Overall Grand Total', '#378ADD', true);
            });

            /* CAPEX card — capital expense head */
            const capexHead = consolidatedActuals.find(a => /CAPITAL/i.test(a.name));
            if (capexHead) {
                const $cx = $('#bd-capex-total').closest('.bd-banner-card');
                $cx.css('cursor','pointer').attr('title','Click to view line items');
                $cx.off('click.drill').on('click.drill', function() {
                    const synth = {
                        name: capexHead.name,
                        ytd: capexHead.ytd || 0,
                        total_posted_amt_ytd: 0,
                        items: [],
                        sub_heads: [{
                            name: capexHead.name.replace(/\s+/g,' ').trim(),
                            ytd: capexHead.ytd || 0,
                            total_posted_amt_ytd: 0,
                            items: (capexHead.items || []).map(it => ({ name: it.name, ytd: it.ytd || 0, total_posted_amt: 0 }))
                        }]
                    };
                    baOpenDrilldown(synth, capexHead.name.replace(/\s+/g,' ').trim(), '#1D9E75', true);
                });
            }

            /* OPEX card — operating expense head with sub_heads */
            const opexHead = consolidatedActuals.find(a => /OPERATING/i.test(a.name));
            if (opexHead) {
                const $ox = $('#bd-opex-total').closest('.bd-banner-card');
                $ox.css('cursor','pointer').attr('title','Click to view line items');
                $ox.off('click.drill').on('click.drill', function() {
                    const synth = {
                        name: opexHead.name,
                        ytd: opexHead.ytd || 0,
                        total_posted_amt_ytd: 0,
                        items: [],
                        sub_heads: (opexHead.sub_heads || []).map(s => ({
                            name: s.name, ytd: s.ytd || 0, total_posted_amt_ytd: 0,
                            items: (s.items || []).map(it => ({ name: it.name, ytd: it.ytd || 0, total_posted_amt: 0 }))
                        }))
                    };
                    baOpenDrilldown(synth, opexHead.name.replace(/\s+/g,' ').trim(), '#D85A30', true);
                });
            }
        }
    }

    function renderCards(mainUnits,subUnits,overall){
        const $c=$('#bd-cards').empty();
        mainUnits.forEach(u=>{
            const pct=overall>0?((u.ytd/overall)*100).toFixed(1):'0.0';
            const $card=$(`<div class="bd-card" style="border-left-color:${u.color};cursor:pointer;" title="Click to view line items">
                <div class="bd-card-label" title="${u.label}">${u.label}</div>
                <div class="bd-card-value">${fmtINR(u.ytd)}</div>
                <div class="bd-card-sub">${pct}% of total</div>
                <div style="font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:${u.color};margin-top:6px;">▶ View line items</div>
            </div>`);
            $card.on('click', () => bdOpenDrilldown(u.label, u.color));
            $c.append($card);
        });
        const $s=$('#bd-subcards').empty();
        if(!subUnits.length){$('#bd-sub-title').hide();return;}
        $('#bd-sub-title').show();
        subUnits.forEach(u=>{
            const pct=overall>0?((u.ytd/overall)*100).toFixed(1):'0.0';
            const $card=$(`<div class="bd-card" style="border-left-color:${u.color};cursor:pointer;" title="Click to view line items">
                <div class="bd-card-label" title="${u.label}">${u.label}</div>
                <div class="bd-card-value">${fmtINR(u.ytd)}</div>
                <div class="bd-card-sub">${pct}% of total</div>
                <div style="font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:${u.color};margin-top:6px;">▶ View line items</div>
            </div>`);
            $card.on('click', () => bdOpenDrilldown(u.label, u.color));
            $s.append($card);
        });
    }

    function renderHBar(mainUnits,subUnits){
        const $body=$('#bd-hbar-body').empty();
        const allMax=Math.max(...mainUnits.map(u=>u.ytd),...subUnits.map(u=>u.ytd),1);
        mainUnits.forEach(u=>{ const pct=((u.ytd/allMax)*100).toFixed(1); $body.append(`<div class="bd-bar-row"><div class="bd-bar-label" title="${u.label}">${u.label}</div><div class="bd-bar-track"><div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div></div><div class="bd-bar-val">${fmtCr(u.ytd)}</div></div>`); });
        if(subUnits.length){ $body.append('<hr class="bd-bar-divider"><div class="bd-bar-section-label">Sub Units</div>'); subUnits.forEach(u=>{ const pct=((u.ytd/allMax)*100).toFixed(1); $body.append(`<div class="bd-bar-row"><div class="bd-bar-label" title="${u.label}">${u.label}</div><div class="bd-bar-track"><div class="bd-bar-fill" style="width:${pct}%;background:${u.color};"></div></div><div class="bd-bar-val">${fmtCr(u.ytd)}</div></div>`); }); }
    }

    function renderDonut(mainUnits,overall){
        const labels=mainUnits.map(u=>u.label);
        const values=mainUnits.map(u=>Math.round(u.ytd));
        const colors=mainUnits.map(u=>u.color);
        $('#bd-donut-total').text(fmtCr(overall));
        const $leg=$('#bd-donut-legend').empty();
        mainUnits.forEach((u,i)=>{ const pct=overall>0?((u.ytd/overall)*100).toFixed(1):'0.0'; $leg.append(`<span class="bd-legend-item"><span class="bd-legend-dot" style="background:${colors[i]};"></span>${u.label} — ${pct}%</span>`); });
        if(donutChart){donutChart.destroy();donutChart=null;}
        if(!values.length)return;
        donutChart=new Chart(document.getElementById('bd-donut'),{
            type:'doughnut',
            data:{labels,datasets:[{data:values,backgroundColor:colors,borderWidth:2,borderColor:'#fff',hoverOffset:6}]},
            options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{ const pct=overall>0?((ctx.parsed/overall)*100).toFixed(1):'0.0'; return ` ${fmtINR(ctx.parsed)}  (${pct}%)`; }}}}}
        });
    }

    function load(fy, month) {
        $('#bd-grand-total,#bd-capex-total,#bd-opex-total,#bd-donut-total').text('—');
        $('#bd-unit-count').text('—');
        $('#bd-cards').empty(); $('#bd-hbar-body').empty();
        cachedCall(fy, month, 'Number Card', msg => {
            if (!msg?.length) { $('#bd-cards').html('<div>No data returned.</div>'); return; }
            bdRawMessage = msg;
            const { mainUnits, subUnits, overall, capex, opex, consolidatedActuals } = parseData(msg);
            renderBanner(overall, capex, opex, mainUnits, subUnits, consolidatedActuals);
            renderCards(mainUnits, subUnits, overall);
            renderHBar(mainUnits, subUnits);
            renderDonut(mainUnits, overall);
        });
    }

    /* ════════════════════════════════════════════
       WORK PLAN TAB — original logic
    ════════════════════════════════════════════ */
    function loadWorkPlan(fy){
        cachedCall(fy, 'March', 'Pie Chart', msg => {
            if(!msg?.length){frappe.msgprint('No Work Plan data returned.');return;}
            const consolidated = msg.find(d=>d.settings_doc==='CONSOLIDATED');
            if(!consolidated){frappe.msgprint('Consolidated data not found.');return;}
            renderWpPie(consolidated);
            renderWpUnitPie(msg);
            renderWpGrantsUnitPie(msg);
            wpDataLoaded = true;
        });
    }

    function renderWpPie(consolidated){
        const actuals=consolidated.actuals||[];
        let grantsYtd=0,othersYtd=0;
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
            data:{ labels:['Direct Work','Grants'], datasets:[{data:[Math.round(othersYtd),Math.round(grantsYtd)],backgroundColor:['#F5A623','#378ADD'],borderWidth:3,borderColor:'#fff',hoverOffset:6}] },
            options:{responsive:true,maintainAspectRatio:false,layout:{padding:{bottom:50}},plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{ const pct=total>0?((ctx.parsed/total)*100).toFixed(1):'0.0'; return ` ${fmtCr(ctx.parsed)}  (${pct}%)`; }}}}},
            plugins:[{id:'sliceLabels',afterDraw(chart){ const{ctx,data}=chart; const ds=chart.getDatasetMeta(0).data; const vals=data.datasets[0].data; const lbls=data.labels; const tot=vals.reduce((a,b)=>a+b,0); ctx.save(); ds.forEach((arc,i)=>{ const angle=(arc.startAngle+arc.endAngle)/2; const r=arc.outerRadius*0.60; const x=arc.x+Math.cos(angle)*r; const y=arc.y+Math.sin(angle)*r; const pct=tot>0?Math.round((vals[i]/tot)*100)+'%':''; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='bold 16px sans-serif'; ctx.fillText(lbls[i],x,y-18); ctx.font='700 16px sans-serif'; ctx.fillText(fmtCr(vals[i]),x,y+2); ctx.font='600 16px sans-serif'; ctx.fillText(pct,x,y+22); }); const arc0=ds[0]; const pieBottom=arc0.y+arc0.outerRadius; const cw=chart.width; const labelY=pieBottom+18; ctx.fillStyle='#999'; ctx.font='700 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('TOTAL BUDGET',cw/2,labelY); ctx.fillStyle='#111'; ctx.font='700 20px sans-serif'; ctx.fillText(fmtCr(tot),cw/2,labelY+18); ctx.restore(); }}]
        });
    }

    function renderSvgPie(wrapperId, labels, values, colors, legendId, totalId, totalLabel) {
        const wrap = document.getElementById(wrapperId);
        if (!wrap) return;
        const tot = values.reduce((a, b) => a + b, 0);
        if (!tot) { wrap.innerHTML = '<p style="color:#aaa;padding:20px">No data</p>'; return; }
        const PIE_R = 120, CX = 150, CY = 150;
        let cur = -Math.PI / 2;
        const slices = values.map((v, i) => { const sw=(v/tot)*2*Math.PI,sa=cur,ea=cur+sw,ma=cur+sw/2; cur=ea; return {v,i,sa,ea,ma,pct:v/tot*100,label:labels[i],color:colors[i]}; });
        const leftSlices  = slices.filter(s=>Math.cos(s.ma)<0).sort((a,b)=>a.ma-b.ma);
        const rightSlices = slices.filter(s=>Math.cos(s.ma)>=0).sort((a,b)=>a.ma-b.ma);
        const polar = (r, a) => [CX+r*Math.cos(a), CY+r*Math.sin(a)];
        function arcPath(s,e){ const[x1,y1]=polar(PIE_R,s),[x2,y2]=polar(PIE_R,e); return `M${CX},${CY}L${x1.toFixed(2)},${y1.toFixed(2)}A${PIE_R},${PIE_R},0,${(e-s)>Math.PI?1:0},1,${x2.toFixed(2)},${y2.toFixed(2)}Z`; }
        let sliceSvg='',pctSvg='';
        slices.forEach((s,i)=>{ sliceSvg+=`<path d="${arcPath(s.sa,s.ea)}" fill="${s.color}" stroke="#fff" stroke-width="2" data-i="${i}" data-label="${s.label}" data-val="${fmtCr(s.v)}" data-pct="${s.pct.toFixed(1)}" style="cursor:pointer;transition:opacity .15s" onmouseenter="this.style.opacity='.75'" onmouseleave="this.style.opacity='1'"/>`; if(s.pct>=4){ const[px,py]=polar(PIE_R*0.63,s.ma); pctSvg+=`<text x="${px.toFixed(1)}" y="${py.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" fill="#fff" style="pointer-events:none">${s.pct.toFixed(1)}%</text>`; } });
        const uid='pie_'+Math.random().toString(36).slice(2,8);
        const pieSvg=`<svg id="${uid}" viewBox="0 0 300 300" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#fff"/>${sliceSvg}${pctSvg}</svg>`;
        const labelRow=s=>`<div style="display:flex;align-items:flex-start;gap:7px;padding:5px 0;border-bottom:1px solid #f0f2f5;min-width:0;"><span style="width:10px;height:10px;min-width:10px;border-radius:2px;background:${s.color};margin-top:3px;"></span><div style="min-width:0;overflow:hidden;"><div style="font-size:11px;font-weight:700;color:#111;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${s.label}">${s.label}</div><div style="font-size:11px;font-weight:600;color:#333;white-space:nowrap;">${fmtCr(s.v)}</div><div style="font-size:10px;color:#888;">${s.pct.toFixed(1)}%</div></div></div>`;
        const tipId='tip_'+uid;
        wrap.innerHTML=`<div style="background:#fff;border-radius:8px;padding:8px 0;position:relative;"><div id="${tipId}" style="display:none;position:fixed;background:rgba(20,20,20,.88);color:#fff;border-radius:8px;padding:8px 12px;font-size:12px;pointer-events:none;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.25);min-width:120px;"></div><div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,280px) minmax(0,1fr);align-items:center;gap:8px;"><div style="padding:0 4px;min-width:0;">${leftSlices.map(labelRow).join('')}</div><div style="aspect-ratio:1;min-width:180px;position:relative;">${pieSvg}</div><div style="padding:0 4px;min-width:0;">${rightSlices.map(labelRow).join('')}</div></div><div style="text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid #e8edf3;"><div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#999;text-transform:uppercase;">${totalLabel||'TOTAL'}</div><div style="font-size:22px;font-weight:700;color:#111;line-height:1.2;">${fmtCr(tot)}</div></div></div>`;
        const tip=document.getElementById(tipId); const svgEl=document.getElementById(uid);
        svgEl.addEventListener('mousemove',function(e){ const path=e.target.closest('path[data-label]'); if(!path){tip.style.display='none';return;} tip.style.display='block'; tip.style.left=(e.clientX+14)+'px'; tip.style.top=(e.clientY-10)+'px'; tip.innerHTML=`<div style="font-weight:700;margin-bottom:3px;">${path.dataset.label}</div><div>${path.dataset.val}</div><div style="color:#aaa;">${path.dataset.pct}%</div>`; });
        svgEl.addEventListener('mouseleave',()=>{tip.style.display='none';});
        $('#'+legendId).hide();
        if(totalId)$('#'+totalId).text(fmtCr(tot));
    }

    function renderWpUnitPie(message){
        const PALETTE_WP=['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
        const GN='Grants & Donations';
        function getDirectWork(u){ const gt=(u.actuals||[]).find(a=>a.sequence_id===9999); const grand=gt?(gt.ytd||0):0; let grants=0; (u.actuals||[]).forEach(a=>{if(a.sequence_id===9999)return; (a.items||[]).forEach(it=>{if(it.name===GN)grants+=(it.ytd||0);}); (a.sub_heads||[]).forEach(sh=>(sh.items||[]).forEach(it=>{if(it.name===GN)grants+=(it.ytd||0);}));}); return grand-grants; }
        const units=message.filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===0).sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0));
        const labels=[],values=[],colors=[];let ci=0;
        units.forEach(u=>{const dw=getDirectWork(u);if(dw<=0)return; labels.push((u.label||'').trim());values.push(Math.round(dw));colors.push(PALETTE_WP[ci++%PALETTE_WP.length]);});
        renderSvgPie('bd-unit-pie-wrap',labels,values,colors,'bd-wp-unit-legend','bd-wp-unit-pie-total','TOTAL DIRECT WORK');
    }

    function renderWpGrantsUnitPie(message){
        const PALETTE_WP=['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780'];
        const GN='Grants & Donations';
        function getGrantsAmt(u){ let amt=0; (u.actuals||[]).forEach(a=>{if(a.sequence_id===9999)return; (a.items||[]).forEach(it=>{if(it.name===GN)amt+=(it.ytd||0);}); (a.sub_heads||[]).forEach(sh=>(sh.items||[]).forEach(it=>{if(it.name===GN)amt+=(it.ytd||0);}));}); return amt; }
        const units=message.filter(d=>d.settings_doc!=='CONSOLIDATED'&&d.is_this_sub_item===0).sort((a,b)=>(a.sequence_id||0)-(b.sequence_id||0));
        const labels=[],values=[],colors=[];let ci=0;
        units.forEach(u=>{const g=getGrantsAmt(u);if(g<=0)return; labels.push((u.label||'').trim());values.push(Math.round(g));colors.push(PALETTE_WP[ci++%PALETTE_WP.length]);});
        renderSvgPie('bd-grants-pie-wrap',labels,values,colors,'bd-wp-grants-unit-legend','bd-wp-grants-unit-total','TOTAL GRANTS');
    }

    /* ════════════════════════════════════════════
       RESIZE + CLEANUP
    ════════════════════════════════════════════ */
    let resizeTimer;
    $(window).on('resize.bd',function(){
        clearTimeout(resizeTimer);
        resizeTimer=setTimeout(()=>{
            if(donutChart)donutChart.resize();
            if(wpPieChart)wpPieChart.resize();
        },300);
    });
    $(wrapper).on('hide',function(){$(window).off('resize.bd');});

    /* ════════════════════════════════════════════
       CHART.JS + HTML-TO-IMAGE
    ════════════════════════════════════════════ */
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

    window.bdSaveCard = function(cardId, filename) {
        const card=document.getElementById(cardId); if(!card)return;
        const fname=(filename||cardId)+'.png';
        const btn=card.querySelector('button'); if(btn)btn.style.visibility='hidden';
        const doSave=()=>{ window.htmlToImage.toPng(card,{backgroundColor:'#ffffff',pixelRatio:2,style:{boxShadow:'none'}}).then(dataUrl=>{ if(btn)btn.style.visibility=''; const a=document.createElement('a'); a.download=fname; a.href=dataUrl; a.click(); }).catch(err=>{ if(btn)btn.style.visibility=''; frappe.msgprint('Could not save image. Please try again.'); console.error(err); }); };
        if(window.htmlToImage){doSave();}else{setTimeout(doSave,800);}
    };

    /* ════════════════════════════════════════════
       GLOBAL LOADER
    ════════════════════════════════════════════ */
    if(!$('#global-loader').length){
        $('body').append('<div id="global-loader" class="loader-overlay"><div class="loader-box"><img src="/files/APF logo.png" class="loader-logo" alt=""><div class="loader-text">Loading, please wait</div></div></div>');
    }
    $('#global-loader').hide();

    var Loader={
        show(msg){ var $l=$('#global-loader'); $l.find('.loader-text').text(msg||'Loading, please wait'); $l.css('display','flex').hide().fadeIn(200); },
        hide(){ $('#global-loader').fadeOut(200); }
    };
    /* ════════════════════════════════════════════
       BA DRILL-DOWN — SLIDE PANEL (sidebar nav + content pane)
    ════════════════════════════════════════════ */
    function baOpenDrilldown(headData, title, color, isUnitView) {
        const esc   = s => frappe.utils.escape_html(s);
        const isNZ  = (b, a) => b !== 0 || a !== 0;
        const fmtPct= (b, a) => b ? Math.round((baRnd(a)/baRnd(b))*100) : 0;
        const fmtINRlocal = n => '₹' + Math.abs(Math.round(n)||0).toLocaleString('en-IN');

        /* ── Column grid definition — responsive ── */
        const vw = window.innerWidth;
        const isMobile  = vw <= 768;
        const isTiny    = vw <= 480;

        /* On mobile show fewer columns to avoid overflow */
        let cols, colHeaders;
        if (isUnitView) {
            cols       = '1fr 130px';
            colHeaders = ['Expense Item', 'Budget'];
        } else if (isTiny) {
            /* Extra small: just Budget + Actuals */
            cols       = '1fr 100px 100px';
            colHeaders = ['Expense Item', 'Budget', 'Actuals'];
        } else if (isMobile) {
            /* Mobile: drop Variance column */
            cols       = '1fr 110px 110px 70px';
            colHeaders = ['Expense Item', 'Budget', 'Actuals', 'Util %'];
        } else {
            cols       = '1fr 130px 130px 80px 130px';
            colHeaders = ['Expense Item', 'Budget', 'Actuals', 'Util %', 'Variance'];
        }

        /* ── Decide which heads to iterate ── */
        /* 'Grand Total' = BA tab drilldown (uses baExpenseHeads)
           isUnitView = unit card or banner card drilldown (uses headData.sub_heads) */
        const headsToShow = (title === 'Grand Total' && !isUnitView)
            ? baExpenseHeads
            : (isUnitView ? (headData.sub_heads || []) : [headData]);

        /* ── Update header bar ── */
        $('#ba-drilldown-title').text(title).css('color', '#fff');

        /* ── Setup expand/collapse checkbox ── */
        const useCollapse = isUnitView || (title === 'Grand Total') ||
            (headData.sub_heads||[]).some(s => (s.items||[]).length > 0);
        const defaultOpen = !useCollapse;
        if (useCollapse) {
            $('#ba-expand-toggle-wrap').addClass('visible');
            $('#ba-expand-all-cb').prop('checked', defaultOpen);
        } else {
            $('#ba-expand-toggle-wrap').removeClass('visible');
            $('#ba-expand-all-cb').prop('checked', false);
        }

        /* ── Column header bar ── */
        const $colHdr = $('#ba-drill-col-header').css('grid-template-columns', cols).empty();
        colHeaders.forEach(h => {
            $colHdr.append(`<div>${h}</div>`);
        });

        /* ── Build top tab bar + section data ── */
        const $sidebar = $('#ba-drill-sidebar').empty();
        const sections = [];

        /* Grand totals */
        let grandB = 0, grandA = 0;
        headsToShow.forEach(h => { grandB += baRnd(h.ytd); grandA += baRnd(h.total_posted_amt_ytd||0); });

        const navColors = ['#0076B6','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#E24B4A','#185FA5','#888780','#f58020','#2ecc71'];

        /* ALL section */
        sections.push({ id: 'all', label: 'All Items', color: '#003B63', ytd: grandB, actuals: grandA, heads: headsToShow });

        headsToShow.forEach((head, i) => {
            const hB = baRnd(head.ytd);
            const hA = baRnd(head.total_posted_amt_ytd||0);
            const c  = navColors[i % navColors.length];
            const id = 'sec_' + i;
            sections.push({ id, label: head.name, color: c, ytd: hB, actuals: hA, heads: [head] });
        });

        /* ── Tab bar ── */
        const $tabBar = $('<div id="ba-drill-tab-bar"></div>');

        /* All Items tab */
        $tabBar.append(`<div class="ba-drill-nav-item active" data-sec="all">
            <div class="ba-drill-nav-dot" style="background:#003B63;"></div>
            All Items
        </div>`);

        headsToShow.forEach((head, i) => {
            const c = navColors[i % navColors.length];
            const id = 'sec_' + i;
            const shortName = head.name.replace(/\s+EXPENSES?$/i,'').replace(/\s+/g,' ').trim();
            $tabBar.append(`<div class="ba-drill-nav-item" data-sec="${id}">
                <div class="ba-drill-nav-dot" style="background:${c};"></div>
                ${esc(shortName)}
            </div>`);
        });

        $sidebar.append($tabBar);

        /* ── Summary strip below tabs ── */
        const util = grandB ? Math.round((grandA/grandB)*100) : 0;
        const uc   = util > 100 ? '#c0392b' : util >= 60 ? '#e07c3a' : '#27ae60';
        const $strip = $(`<div id="ba-drill-summary-strip">
            <div class="ba-drill-sum-item">
                <div class="ba-drill-sum-label">Budget</div>
                <div class="ba-drill-sum-val">${fmtINRlocal(grandB)}</div>
            </div>
            ${!isUnitView ? `
            <div class="ba-drill-sum-item">
                <div class="ba-drill-sum-label">Actuals</div>
                <div class="ba-drill-sum-val" style="color:#1D9E75;">${fmtINRlocal(grandA)}</div>
            </div>
            <div class="ba-drill-sum-item">
                <div class="ba-drill-sum-label">Util %</div>
                <div class="ba-drill-sum-val" style="color:${uc};">${util}%</div>
            </div>
            ${(!isMobile) ? `<div class="ba-drill-sum-item">
                <div class="ba-drill-sum-label">Variance</div>
                <div class="ba-drill-sum-val" style="color:${(grandB-grandA)<0?'#c0392b':'#003B63'};">${fmtINRlocal(grandB-grandA)}</div>
            </div>` : ''}` : ''}
        </div>`);
        $sidebar.append($strip);

        /* ── Render content for a section ── */
        function renderSection(secId) {
            const sec = sections.find(s => s.id === secId) || sections[0];
            const $scroll = $('#ba-drill-rows-scroll').empty();

            /* Track sub-section collapse state */
            const subState = {};  /* key -> open bool */

            function buildRows(headsArr) {
                headsArr.forEach((head, hIdx) => {
                    const hB = baRnd(head.ytd);
                    const hA = baRnd(head.total_posted_amt_ytd||0);
                    const secKey = secId + '_h' + hIdx;

                    /* When showing ALL view, render section header per head */
                    if (secId === 'all' || headsArr.length > 1) {
                        const u   = fmtPct(hB, hA);
                        const uc  = u > 100 ? '#c0392b' : u >= 60 ? '#e07c3a' : '#27ae60';
                        const ucBg= u > 100 ? '#fde8e8' : u >= 60 ? '#fef3e2' : '#e8f8f0';
                        const diff = hB - hA;
                        const diffColor = diff < 0 ? '#c0392b' : '#1a6b3a';
                        const diffFmt = (diff < 0 ? '-' : '') + '\u20b9' + Math.abs(diff).toLocaleString('en-IN');
                        const isOpen = subState[secKey] !== false;
                        const $shdr = $(`<div class="ba-drill-section-hdr${isOpen ? '' : ' collapsed'}" data-key="${secKey}" style="grid-template-columns:${cols}; display:grid; align-items:center;">
                            <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;">
                                <div class="ba-drill-nav-dot" style="background:${navColors[hIdx % navColors.length]};flex-shrink:0;"></div>
                                <span style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(head.name)}</span>
                                <span class="ba-dsec-toggle" style="margin-left:auto;flex-shrink:0;">▼</span>
                            </div>
                            <div style="padding:10px 12px;text-align:right;font-weight:700;">${baFmt(hB)}</div>
                            ${!isUnitView ? `<div style="padding:10px 12px;text-align:right;font-weight:700;">${baFmt(hA)}</div>
                            ${!isTiny ? `<div style="padding:10px 12px;text-align:right;"><span class="ba-drill-util-pill" style="background:${ucBg};color:${uc};">${u}%</span></div>` : ''}
                            ${(!isMobile && !isTiny) ? `<div style="padding:10px 12px;text-align:right;font-weight:700;color:${diffColor};">${diffFmt}</div>` : ''}` : ''}
                        </div>`);
                        $shdr.on('click', function() {
                            const key = $(this).data('key');
                            const nowOpen = !$(this).hasClass('collapsed');
                            subState[key] = !nowOpen;
                            $(this).toggleClass('collapsed', nowOpen);
                            $(this).nextUntil('.ba-drill-section-hdr, .ba-drill-row.total-row').toggle(!nowOpen);
                        });
                        $scroll.append($shdr);
                    }

                    /* Direct items */
                    (head.items||[]).forEach(it => {
                        const b = baRnd(it.ytd), a = baRnd(it.total_posted_amt||0);
                        if (!isNZ(b, a)) return;
                        $scroll.append(buildDataRow(it.name, b, a, 'item-row', cols, isUnitView, secId, secKey));
                    });

                    /* Sub heads */
                    (head.sub_heads||[]).forEach((sub, sIdx) => {
                        const sB = baRnd(sub.ytd), sA = baRnd(sub.total_posted_amt_ytd||0);
                        if (!isNZ(sB, sA)) return;
                        const subItems = (sub.items||[]).filter(it => isNZ(baRnd(it.ytd), baRnd(it.total_posted_amt||0)));
                        const subKey = secKey + '_s' + sIdx;
                        const isSubOpen = subState[subKey] !== false;

                        const $subRow = buildDataRow(sub.name, sB, sA, 'sub-head', cols, isUnitView, secId, subKey);
                        if (subItems.length) {
                            $subRow.css('cursor','pointer').find('div:first').prepend(`<span class="drill-toggle" style="font-size:9px;margin-right:6px;color:#888;flex-shrink:0;">${isSubOpen?'▼':'▶'}</span>`);
                            $subRow.on('click', function() {
                                const open = subState[subKey] !== false;
                                subState[subKey] = !open;
                                $(this).find('.drill-toggle').text(open ? '▶' : '▼');
                                $(this).nextUntil(':not(.item-row[data-parent="'+subKey+'"])').toggle(!open);
                            });
                        }
                        $scroll.append($subRow);

                        subItems.forEach(it => {
                            const b = baRnd(it.ytd), a = baRnd(it.total_posted_amt||0);
                            const $ir = buildDataRow(it.name, b, a, 'item-row', cols, isUnitView, secId, subKey);
                            $ir.attr('data-parent', subKey);
                            if (!isSubOpen) $ir.addClass('drill-hidden');
                            $scroll.append($ir);
                        });
                    });
                });
            }

            buildRows(sec.heads);

            /* Total row */
            const sB = sec.ytd, sA = sec.actuals;
            const totalDiff = sB - sA;
            const totalDiffFmt = (totalDiff < 0 ? '-' : '') + '₹' + Math.abs(totalDiff).toLocaleString('en-IN');
            const $total = $(`<div class="ba-drill-row total-row" style="grid-template-columns:${cols};">
                <div><span class="ba-drill-name">TOTAL</span></div>
                <div><span class="ba-drill-val">${baFmt(sB)}</span></div>
                ${!isUnitView ? `<div><span class="ba-drill-val">${baFmt(sA)}</span></div>
                ${!isTiny ? `<div><span>${fmtPct(sB,sA)}%</span></div>` : ''}
                ${(!isMobile && !isTiny) ? `<div><span class="ba-drill-val">${totalDiffFmt}</span></div>` : ''}` : ''}
            </div>`);
            $scroll.append($total);

            /* ── Staggered row entrance animation (fast, capped) ── */
            $scroll.find('.ba-drill-row, .ba-drill-section-hdr').each(function(i) {
                const delay = Math.min(i * 12, 250);
                $(this).addClass('anim-in').css('animation-delay', delay + 'ms');
            });

            /* Util pills — no extra delay, inline with row */
            $scroll.find('.ba-drill-util-pill').each(function(i) {
                $(this).css('animation-delay', Math.min(i * 12, 250) + 'ms');
            });

            /* Total row — slight delay after last row, capped */
            const rowCount = $scroll.find('.ba-drill-row').length;
            $total.css('animation-delay', Math.min(rowCount * 12 + 20, 280) + 'ms');

            /* Expand/collapse all sub-sections when checkbox changes */
            $('#ba-expand-all-cb').off('change.drill').on('change.drill', function() {
                const expand = $(this).is(':checked');
                $('.ba-drill-section-hdr').each(function() {
                    const isOpen = !$(this).hasClass('collapsed');
                    if (expand && !isOpen) {
                        $(this).removeClass('collapsed');
                        $(this).nextUntil('.ba-drill-section-hdr, .ba-drill-row.total-row').show();
                    } else if (!expand && isOpen) {
                        $(this).addClass('collapsed');
                        $(this).nextUntil('.ba-drill-section-hdr, .ba-drill-row.total-row').hide();
                    }
                });
            });
        }

        /* ── Build a single data row ── */
        function buildDataRow(name, b, a, cls, gridCols, unitView, secId, parentKey) {
            const u    = fmtPct(b, a);
            const uc   = u > 100 ? '#c0392b' : u >= 60 ? '#e07c3a' : '#27ae60';
            const ucBg = u > 100 ? '#fde8e8' : u >= 60 ? '#fef3e2' : '#e8f8f0';
            const diff = b - a;
            const diffColor = diff < 0 ? '#c0392b' : '#1a6b3a';
            const diffFmt   = (diff < 0 ? '-' : '') + '₹' + Math.abs(diff).toLocaleString('en-IN');
            /* Extra cells depend on how many columns are shown */
            let extraCells = '';
            if (!unitView) {
                extraCells += `<div><span class="ba-drill-val">${baFmt(a)}</span></div>`;
                if (!isTiny) {
                    extraCells += `<div><span class="ba-drill-util-pill" style="background:${ucBg};color:${uc};">${u}%</span></div>`;
                }
                if (!isMobile && !isTiny) {
                    extraCells += `<div><span class="ba-drill-val" style="color:${diffColor};">${diffFmt}</span></div>`;
                }
            }
            const $row = $(`<div class="ba-drill-row ${cls}" style="grid-template-columns:${gridCols};">
                <div><span class="ba-drill-name" title="${esc(name)}">${esc(name)}</span></div>
                <div><span class="ba-drill-val">${baFmt(b)}</span></div>
                ${extraCells}
            </div>`);
            return $row;
        }

        /* ── Tab bar click ── */
        $sidebar.off('click.nav').on('click.nav', '.ba-drill-nav-item', function() {
            $sidebar.find('.ba-drill-nav-item').removeClass('active');
            $(this).addClass('active');
            /* Fade out current content then re-render */
            $('#ba-drill-rows-scroll').css({ opacity: 0, transform: 'translateX(10px)', transition: 'opacity .12s, transform .12s' });
            const secId = $(this).data('sec');
            setTimeout(() => {
                renderSection(secId);
                $('#ba-drill-rows-scroll').css({ opacity: 1, transform: 'translateX(0)', transition: 'opacity .12s, transform .12s' });
            }, 60);
        });

        /* ── Initial render ── */
        renderSection('all');

        $('#ba-drilldown-overlay').addClass('open');
    }

    /* Close drilldown */
    function baCloseDrilldown() {
        $('#ba-drilldown-overlay').removeClass('open');
        $('#ba-expand-toggle-wrap').removeClass('visible');
        $('#ba-expand-all-cb').prop('checked', false);
    }
    $(page.body).on('click', '#ba-drilldown-close', baCloseDrilldown);
    $(page.body).on('click', '#ba-drilldown-overlay', function(e) {
        if (e.target === this) baCloseDrilldown();
    });

    /* ════════════════════════════════════════════
       BA PIE CHARTS
    ════════════════════════════════════════════ */
    function baRenderPieCharts(data) {
        function draw() {
            const BUDGET_COLORS = ['#4361EE','#3A0CA3','#7209B7','#F72585','#4CC9F0','#4895EF','#560BAD','#B5179E','#3F37C9','#480CA8','#6A0572','#D62828'];
            const ACTUAL_COLORS = ['#2D6A4F','#40916C','#52B788','#74C69D','#F4A261','#E76F51','#E9C46A','#264653','#2A9D8F','#8AB17D','#BABB74','#E07A5F'];

            let labels = [], budgets = [], actuals = [];
            (data||[]).forEach(h => {
                const validSubs = (h.sub_heads||[]).filter(s => baRnd(s.ytd)!==0 || baRnd(s.total_posted_amt_ytd)!==0);
                if (validSubs.length) {
                    validSubs.forEach(s => { labels.push(s.name); budgets.push(baRnd(s.ytd)); actuals.push(baRnd(s.total_posted_amt_ytd)); });
                } else {
                    labels.push(h.name); budgets.push(baRnd(h.ytd)); actuals.push(baRnd(h.total_posted_amt_ytd));
                }
            });

            const bColors = labels.map((_,i) => BUDGET_COLORS[i%BUDGET_COLORS.length]);
            const aColors = labels.map((_,i) => ACTUAL_COLORS[i%ACTUAL_COLORS.length]);

            const pctPlugin = {
                id:'baSlicePct',
                afterDatasetDraw(chart) {
                    let {ctx,data}=chart; let ds=data.datasets[0];
                    let total=ds.data.reduce((a,b)=>a+b,0); if(!total)return;
                    chart.getDatasetMeta(0).data.forEach((arc,i)=>{
                        let p=Math.round((ds.data[i]/total)*100); if(p<5)return;
                        let {x,y}=arc.tooltipPosition();
                        ctx.save(); ctx.fillStyle='#fff'; ctx.font='bold 11px sans-serif';
                        ctx.textAlign='center'; ctx.textBaseline='middle';
                        ctx.fillText(p+'%',x,y); ctx.restore();
                    });
                }
            };

            function buildLeg(id, values, colors) {
                let total=values.reduce((a,b)=>a+b,0);
                let $leg=$('#'+id).empty();
                labels.forEach((lbl,i)=>{
                    let p=total?Math.round((values[i]/total)*100):0;
                    $leg.append(`<div class="ba-pie-legend-item"><div class="ba-pie-legend-dot" style="background:${colors[i]};"></div><span class="ba-pie-legend-name" title="${frappe.utils.escape_html(lbl)}">${frappe.utils.escape_html(lbl)}</span><span class="ba-pie-legend-pct">${p}%</span></div>`);
                });
            }

            function makePie(canvasId, values, colors, existing) {
                if (existing) existing.destroy();
                const ctx = document.getElementById(canvasId)?.getContext('2d');
                if (!ctx) return null;
                return new Chart(ctx, {
                    type:'doughnut',
                    data:{ labels, datasets:[{ data:values, backgroundColor:colors, borderColor:'#fff', borderWidth:2, hoverOffset:10 }] },
                    options:{
                        responsive:false, cutout:'50%',
                        animation:{ animateRotate:true, duration:600 },
                        layout:{ padding:10 },
                        plugins:{
                            legend:{display:false},
                            tooltip:{ enabled:true, callbacks:{
                                title(items){return items[0]?.label||'';},
                                label(ctx){ let t=ctx.dataset.data.reduce((a,b)=>a+b,0); let p=t?Math.round((ctx.parsed/t)*100):0; return ` ₹${ctx.parsed.toLocaleString('en-IN')}  (${p}%)`; }
                            }}
                        }
                    },
                    plugins:[pctPlugin]
                });
            }

            baBudgetPie  = makePie('ba-budget-pie',  budgets, bColors, baBudgetPie);
            baActualsPie = makePie('ba-actuals-pie', actuals, aColors, baActualsPie);
            buildLeg('ba-budget-legend',  budgets, bColors);
            buildLeg('ba-actuals-legend', actuals, aColors);
        }

        if (window.Chart) { draw(); return; }
        const s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
        s.onload=draw;
        document.head.appendChild(s);
    }

    /* ════════════════════════════════════════════
       DASHBOARD CARD DRILLDOWN
       Fetches BA actuals for the clicked unit label
       and opens the shared modal
    ════════════════════════════════════════════ */
    function bdOpenDrilldown(unitLabel, color) {
        const fy = fyControl.get_value();
        if (!fy) { frappe.msgprint('Please select a Financial Year.'); return; }

        /* ── Use the cached Number Card actuals — full items+sub_heads structure ── */
        const unitRec = bdRawMessage.find(d =>
            d.settings_doc !== 'CONSOLIDATED' &&
            (d.label || '').trim() === unitLabel
        );

        if (!unitRec) {
            frappe.msgprint('Unit not found: ' + unitLabel);
            return;
        }

        /*  actuals[] structure per unit:
            [
              { name:"CAPITAL  EXPENSES",  sequence_id:1,  sub_heads:[], items:[{name,ytd,gl_code,sequence_id}…], ytd:N },
              { name:"OPERATING  EXPENSES",sequence_id:28, sub_heads:[{name,ytd,items:[…]}, …], items:[], ytd:N },
              { name:"COVID SUPPORT",      sequence_id:183,sub_heads:[], items:[…], ytd:N },
              { name:"GRAND TOTAL",        sequence_id:9999, ytd:N }
            ]
            We map each non-GRAND-TOTAL entry as an expense head:
              - items[]  → direct line items (e.g. Capital Expenses)
              - sub_heads[] → sub-categories, each with their own items[]
        */
        const SKIP = /GRAND\s*TOTAL/i;
        const actuals = (unitRec.actuals || []).filter(a =>
            a.sequence_id !== 9999 && !SKIP.test(a.name || '')
        );

        if (!actuals.length) {
            frappe.msgprint('No line item data available for ' + unitLabel + '.');
            return;
        }

        /* Build the headData the modal expects:
           { name, ytd, total_posted_amt_ytd, items[], sub_heads[] }
           "ytd" = budget plan value from the response
           "total_posted_amt_ytd" = actuals posted (field name in Number Card response is also ytd,
            but since this API only has plan/ytd, we use ytd for budget and 0 for actuals)
        */
        const heads = actuals.map(a => ({
            name: a.name,
            ytd: a.ytd || 0,
            total_posted_amt_ytd: 0,   // Number Card has no posted actuals column
            items: (a.items || []).map(it => ({
                name: it.name,
                ytd: it.ytd || 0,
                total_posted_amt: 0
            })),
            sub_heads: (a.sub_heads || []).map(s => ({
                name: s.name,
                ytd: s.ytd || 0,
                total_posted_amt_ytd: 0,
                items: (s.items || []).map(it => ({
                    name: it.name,
                    ytd: it.ytd || 0,
                    total_posted_amt: 0
                }))
            }))
        }));

        /* Wrap all heads into a single "Grand Total" synthetic head so
           baOpenDrilldown renders them as a Grand Total view with collapse */
        const synth = {
            name: unitLabel,
            ytd: heads.reduce((s, h) => s + baRnd(h.ytd), 0),
            total_posted_amt_ytd: 0,
            items: [],
            sub_heads: heads
        };

        baOpenDrilldown(synth, unitLabel, color || '#378ADD', true /* isUnitView */);
    }

};