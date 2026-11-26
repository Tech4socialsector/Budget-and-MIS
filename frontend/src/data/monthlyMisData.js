// Shared helpers for the Monthly MIS page (src/pages/MonthlyMis.vue),
// replicating the Desk page at
// annual_budget/annual_budget_mis/page/monthly_mis/monthly_mis.js
// (only lines 6230-7601 are live; earlier versions in that file are dead
// code and were ignored).
//
// All amounts here are in raw rupees, converted to Crores (divide by 1e7)
// only at the point of rendering via CrCell - these helpers themselves
// stay in whichever unit the source arrays were in, matching the Desk
// JS's own mix of raw-rupee accumulators (buildMap/extractRow) and
// Cr-already-divided accumulators (extractSection/exAct/renderUnitDetailGrid).

export const MONTHS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
]

// FY string ("2025-26") -> previous FY string ("2024-25"), matching the
// Desk JS's getPrevFY() exactly.
export function getPrevFY(fy) {
  const p = (fy || '2025-26').split('-')
  return (parseInt(p[0], 10) - 1) + '-' + String(parseInt(p[1], 10) - 1).padStart(2, '0')
}

// month + FY -> "April-2025" / "January-2026" style YTD label, matching
// the Desk JS's monthYearLabel() exactly (Jan/Feb/Mar roll into the FY's
// end year, the rest into its start year).
export function monthYearLabel(month, fy) {
  const s = parseInt((fy || '2025-26').split('-')[0], 10)
  return month + '-' + (['January', 'February', 'March'].includes(month) ? s + 1 : s)
}

export function normName(s) {
  return (s || '').replace(/\s+/g, ' ').trim().toUpperCase()
}

// % of Budget column, matching the Desk JS's fmtPct() exactly - values
// here are Cr (or any consistent unit), the ratio is unit-independent.
export function fmtPct(act, bud) {
  const a = parseFloat(act) || 0
  const b = parseFloat(bud) || 0
  if (!b) return '-'
  return (a / b * 100).toFixed(1) + '%'
}

// -------------------------------------------------------------------------
// Detail-table aggregation (buildMap / extractRow / extractConsolidated) -
// feeds the Overall Foundation (consolidated) table.
// -------------------------------------------------------------------------
function zero8() {
  return { opex_b: 0, capex_b: 0, covid_b: 0, total_b: 0, opex_a: 0, capex_a: 0, covid_a: 0, total_a: 0 }
}
function addZ(a, b) {
  return {
    opex_b: a.opex_b + b.opex_b, capex_b: a.capex_b + b.capex_b, covid_b: a.covid_b + b.covid_b, total_b: a.total_b + b.total_b,
    opex_a: a.opex_a + b.opex_a, capex_a: a.capex_a + b.capex_a, covid_a: a.covid_a + b.covid_a, total_a: a.total_a + b.total_a,
  }
}
function extractRow(entry) {
  const r = zero8()
  for (const sec of entry.actuals || []) {
    const nm = normName(sec.name)
    const b = parseFloat(sec.ytd || 0)
    const a = parseFloat(sec.total_posted_amt_ytd || 0)
    if (nm === 'OPERATING EXPENSES' || nm === 'OPERATING  EXPENSES') { r.opex_b += b; r.opex_a += a }
    else if (nm === 'CAPITAL EXPENSES' || nm === 'CAPITAL  EXPENSES') { r.capex_b += b; r.capex_a += a }
    else if (nm.includes('COVID')) { r.covid_b += b; r.covid_a += a }
  }
  r.total_b = r.opex_b + r.capex_b + r.covid_b
  r.total_a = r.opex_a + r.capex_a + r.covid_a
  return r
}
function extractConsolidated(e) {
  const r = zero8()
  for (const a of e.actuals || []) {
    const nm = normName(a.name)
    const b = parseFloat(a.ytd || 0)
    const ac = parseFloat(a.total_posted_amt_ytd || 0)
    if (nm === 'OPEX TOTAL') { r.opex_b += b; r.opex_a += ac }
    if (nm === 'CAPEX TOTAL') { r.capex_b += b; r.capex_a += ac }
    if (nm.includes('COVID')) { r.covid_b += b; r.covid_a += ac }
    if (nm === 'OVERALL GRAND TOTAL') { r.total_b = b; r.total_a = ac }
  }
  if (!r.total_b && !r.total_a) { r.total_b = r.opex_b + r.capex_b + r.covid_b; r.total_a = r.opex_a + r.capex_a + r.covid_a }
  return r
}

// data -> { order: [label,...], rows: {label: zero8()}, subFlags: {label: bool}, grand: zero8() }
export function buildMap(data) {
  const sorted = [...(data || [])].sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
  const rows = {}, subFlags = {}, order = []
  let grand = null
  for (const e of sorted) {
    const tbl = (e.table_name || '').toUpperCase()
    if (e.sequence_id === 9999 || tbl === 'CONSOLIDATED') { grand = extractConsolidated(e); continue }
    const lbl = (e.label || '').trim()
    if (!lbl) continue
    rows[lbl] = extractRow(e)
    subFlags[lbl] = e.is_this_sub_item === 1
    order.push(lbl)
  }
  if (!grand) {
    grand = zero8()
    for (const l of order) if (!subFlags[l]) grand = addZ(grand, rows[l])
  }
  return { order, rows, subFlags, grand }
}

// -------------------------------------------------------------------------
// Overall Foundation (consolidated) table rows - mirrors renderConTable().
// Values here are converted to Cr (divide by 1e7) since that table renders
// Cr in-cell.
// -------------------------------------------------------------------------
function cr(v) { return (parseFloat(v) || 0) / 10000000 }

export function buildConsolidatedRows(cm, pm) {
  const allLabels = [...cm.order]
  for (const l of pm.order) if (!allLabels.includes(l)) allLabels.push(l)
  const rows = []
  const cTot = { b: 0, a: 0 }, pTot = { b: 0, a: 0 }
  for (const lbl of allLabels) {
    const isSub = cm.subFlags[lbl] || pm.subFlags[lbl]
    const cv = cm.rows[lbl] || zero8()
    const pv = pm.rows[lbl] || zero8()
    const cb = cr(cv.total_b), ca = cr(cv.total_a), pb = cr(pv.total_b), pa = cr(pv.total_a)
    if (!isSub) { cTot.b += cb; cTot.a += ca; pTot.b += pb; pTot.a += pa }
    rows.push({ label: lbl, isSub, cb, ca, pb, pa })
  }
  return { rows, total: { cb: cTot.b, ca: cTot.a, pb: pTot.b, pa: pTot.a } }
}

// -------------------------------------------------------------------------
// Operating / Capital Expense tables - mirrors extractSection/buildExpRows.
// Values already Cr (divide by 1e7 at extraction, like the Desk JS does).
// -------------------------------------------------------------------------
export const OPEX_NAMES = 'opex'
export const CAPEX_NAMES = 'capex'

function extractSection(entry, kind) {
  const r = { ob: 0, cb: 0, vb: 0, tb: 0, oa: 0, ca: 0, va: 0, ta: 0 }
  for (const sec of entry.actuals || []) {
    const nm = normName(sec.name)
    const b = parseFloat(sec.ytd || 0) / 10000000
    const a = parseFloat(sec.total_posted_amt_ytd || 0) / 10000000
    if (nm === 'OPERATING EXPENSES' || nm === 'OPERATING  EXPENSES') { r.ob += b; r.oa += a }
    else if (nm === 'CAPITAL EXPENSES' || nm === 'CAPITAL  EXPENSES') { r.cb += b; r.ca += a }
    else if (nm.includes('COVID')) { r.vb += b; r.va += a }
  }
  r.tb = r.ob + r.cb + r.vb
  r.ta = r.oa + r.ca + r.va
  if (kind === OPEX_NAMES) return { ob: r.ob, cb: 0, vb: r.vb, tb: r.ob + r.vb, oa: r.oa, ca: 0, va: r.va, ta: r.oa + r.va }
  if (kind === CAPEX_NAMES) return { ob: 0, cb: r.cb, vb: 0, tb: r.cb, oa: 0, ca: r.ca, va: 0, ta: r.ca }
  return r
}

function zeroExp() { return { ob: 0, cb: 0, vb: 0, tb: 0, oa: 0, ca: 0, va: 0, ta: 0 } }

export function buildExpRows(curData, prevData, kind) {
  function idx(data) {
    const sorted = [...(data || [])].sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
    const map = {}, subFlags = {}
    for (const e of sorted) {
      const tbl = (e.table_name || '').toUpperCase()
      if (e.sequence_id === 9999 || tbl === 'CONSOLIDATED') continue
      const lbl = (e.label || '').trim()
      if (!lbl) continue
      map[lbl] = extractSection(e, kind)
      subFlags[lbl] = e.is_this_sub_item === 1
    }
    return { map, subFlags }
  }
  const cm = idx(curData), pm = idx(prevData)
  const rows = [], seen = {}
  const curSorted = [...(curData || [])].sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
  for (const e of curSorted) {
    const tbl = (e.table_name || '').toUpperCase()
    if (e.sequence_id === 9999 || tbl === 'CONSOLIDATED') continue
    const lbl = (e.label || '').trim()
    if (!lbl || seen[lbl]) continue
    seen[lbl] = true
    rows.push({ label: lbl, isSub: cm.subFlags[lbl] || false, cur: cm.map[lbl] || zeroExp(), prev: pm.map[lbl] || zeroExp() })
  }
  const prevSorted = [...(prevData || [])].sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
  for (const e of prevSorted) {
    const tbl = (e.table_name || '').toUpperCase()
    if (e.sequence_id === 9999 || tbl === 'CONSOLIDATED') continue
    const lbl = (e.label || '').trim()
    if (!lbl || seen[lbl]) continue
    seen[lbl] = true
    rows.push({ label: lbl, isSub: pm.subFlags[lbl] || false, cur: zeroExp(), prev: pm.map[lbl] || zeroExp() })
  }
  return rows
}

export function buildExpTotals(rows) {
  let tCB = 0, tCA = 0, tPB = 0, tPA = 0
  for (const r of rows) {
    if (r.isSub) continue
    tCB += r.cur.tb || 0
    tCA += r.cur.ta || 0
    tPB += r.prev.tb || 0
    tPA += r.prev.ta || 0
  }
  return { tb: tCB, ta: tCA, pb: tPB, pa: tPA }
}

// -------------------------------------------------------------------------
// Breakup tables (Education/Health/Livelihoods/University/Enablers) -
// mirrors findEntries/renderBreakupTable/exAct. Values already Cr.
// -------------------------------------------------------------------------
export function findEntries(breakupData, key) {
  if (!breakupData) return []
  if (breakupData[key] && Array.isArray(breakupData[key])) return breakupData[key]
  const grps = Object.values(breakupData)
  for (const grp of grps) {
    if (grp && typeof grp === 'object' && !Array.isArray(grp) && grp[key] && Array.isArray(grp[key])) return grp[key]
    if (Array.isArray(grp)) {
      const m = grp.filter((e) => (e.label || '').trim() === key && e.settings_doc !== 'CONSOLIDATED')
      if (m.length) return m
    }
  }
  return []
}

export function exAct(actuals) {
  let ob = 0, oa = 0, cb = 0, ca = 0
  const sorted = [...(actuals || [])].sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
  for (const sec of sorted) {
    const nm = normName(sec.name)
    let b = parseFloat(sec.ytd || 0) / 10000000
    let a = parseFloat(sec.total_posted_amt_ytd || 0) / 10000000
    if (!b && !a) {
      for (const sh of sec.sub_heads || []) {
        b += parseFloat(sh.ytd || 0) / 10000000
        a += parseFloat(sh.total_posted_amt_ytd || 0) / 10000000
      }
    }
    if (nm === 'OPERATING EXPENSES' || nm === 'OPERATING  EXPENSES') { ob += b; oa += a }
    else if (nm === 'CAPITAL EXPENSES' || nm === 'CAPITAL  EXPENSES') { cb += b; ca += a }
  }
  return { ob, oa, cb, ca, tb: ob + cb, ta: oa + ca }
}

function addExAct(a, b) {
  return { ob: a.ob + b.ob, oa: a.oa + b.oa, cb: a.cb + b.cb, ca: a.ca + b.ca, tb: a.tb + b.tb, ta: a.ta + b.ta }
}
function zeroExAct() { return { ob: 0, oa: 0, cb: 0, ca: 0, tb: 0, ta: 0 } }

// Builds the section-grouped breakup table structure: one section per key,
// each with its sub_unit rows + a subtotal, plus a single grand total at
// the end. Mirrors renderBreakupTable() body-building exactly.
export function buildBreakupSections(breakupData, keys) {
  const sections = []
  for (const k of keys) {
    const entries = findEntries(breakupData, k)
      .filter((e) => e.settings_doc !== 'CONSOLIDATED' && (e.label || '') !== 'CONSOLIDATED TOTAL')
      .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
    sections.push({ label: k, entries })
  }
  const hasAny = sections.some((s) => s.entries.length > 0)
  if (!hasAny) return null

  let grand = zeroExAct()
  const builtSections = sections.map((sec) => {
    let secTot = zeroExAct()
    const rows = []
    for (const su of sec.entries) {
      const suLabel = su.label || su.name || ''
      if (!suLabel || suLabel === 'CONSOLIDATED TOTAL') continue
      const v = exAct(su.actuals || [])
      secTot = addExAct(secTot, v)
      rows.push({ label: suLabel, v })
    }
    grand = addExAct(grand, secTot)
    return { label: sec.label, rows, subtotal: secTot }
  })
  return { sections: builtSections, grand }
}

// -------------------------------------------------------------------------
// Operating Expenses Breakdown grid - mirrors renderUnitDetailGrid() incl.
// the Grants & Donations special-case subtraction under PROGRAM EXPENSES.
// Values already Cr.
// -------------------------------------------------------------------------
export function isGrantsItem(name) {
  const n = (name || '').trim().toUpperCase().replace(/\s+/g, ' ')
  return n === 'GRANTS & DONATIONS' || n === 'GRANTS AND DONATIONS' || n === 'GRANTS'
}
export function isProgHead(cat) {
  const c = (cat || '').trim().toUpperCase().replace(/\s+/g, ' ')
  return c === 'PROGRAM EXPENSES' || c === 'PROGRAM  EXPENSES'
}
const GRANTS_LABEL = 'Grants'

function itemVal(it, field) {
  if (field === 'b') return parseFloat(it.ytd ?? it.total_ytd ?? it.budget ?? 0) / 10000000
  return parseFloat(it.total_posted_amt ?? it.total_posted_amt_ytd ?? it.actual ?? 0) / 10000000
}

// Builds prevLookup: { unitLabel: { subHeadName: {b,a,items:[{name,b,a}]}, __opex_total: {b,a} } }
function buildPrevLookup(prevData) {
  const prevLookup = {}
  for (const entry of prevData || []) {
    const lbl = (entry.label || '').trim()
    if (!lbl) continue
    const pm = {}
    const opexTot = { b: 0, a: 0 }
    for (const sec of entry.actuals || []) {
      const nm = normName(sec.name)
      if (nm === 'OPERATING EXPENSES' || nm === 'OPERATING  EXPENSES') {
        opexTot.b += parseFloat(sec.ytd || 0) / 10000000
        opexTot.a += parseFloat(sec.total_posted_amt_ytd || 0) / 10000000
        for (const sh of sec.sub_heads || []) {
          const n = (sh.name || '').trim()
          if (!n) continue
          if (!pm[n]) pm[n] = { b: 0, a: 0, items: [] }
          pm[n].b += parseFloat(sh.ytd || 0) / 10000000
          pm[n].a += parseFloat(sh.total_posted_amt_ytd || 0) / 10000000
          for (const it of sh.items || []) {
            const iname = (it.name || '').trim()
            if (!iname) continue
            const ib = itemVal(it, 'b'), ia = itemVal(it, 'a')
            const found = pm[n].items.find((x) => x.name === iname)
            if (found) { found.b += ib; found.a += ia } else pm[n].items.push({ name: iname, b: ib, a: ia })
          }
        }
      } else if (nm.includes('COVID')) {
        opexTot.b += parseFloat(sec.ytd || 0) / 10000000
        opexTot.a += parseFloat(sec.total_posted_amt_ytd || 0) / 10000000
      }
    }
    pm.__opex_total = opexTot
    prevLookup[lbl] = pm
  }
  return prevLookup
}

function getGrants(map, cat) {
  const entry = map[cat] || { items: [] }
  const items = entry.items || []
  return items.find((it) => isGrantsItem(it.name)) || null
}

// Builds one card's rows (Total Foundation, or one per unit). catOrder is
// the ordered list of sub_head/category names; curMap/prevMap map
// category -> {b,a,items}; secTotCur/secTotPrev are the section-level
// (Operating Expenses + Covid) totals used for the card's Total row.
function buildCard(cardTitle, catOrder, curMap, prevMap, isSub, isTotal, secTotCur, secTotPrev) {
  const rows = []
  let tCB = secTotCur ? secTotCur.b : 0
  let tCA = secTotCur ? secTotCur.a : 0
  let tPB = secTotPrev ? secTotPrev.b : 0
  let tPA = secTotPrev ? secTotPrev.a : 0
  const computeTotal = !secTotCur
  let compCB = 0, compCA = 0, compPB = 0, compPA = 0

  for (const cat of catOrder) {
    const c = curMap[cat] || { b: 0, a: 0, items: [] }
    const p = prevMap[cat] || { b: 0, a: 0, items: [] }
    if (!c.b && !c.a && !p.b && !p.a) continue

    let cg = null, pg = null
    let dispCB = c.b, dispCA = c.a, dispPB = p.b, dispPA = p.a

    if (isProgHead(cat)) {
      cg = getGrants(curMap, cat)
      pg = getGrants(prevMap, cat)
      if (cg) { dispCB -= cg.b; dispCA -= cg.a }
      if (pg) { dispPB -= pg.b; dispPA -= pg.a }
    }

    if (computeTotal) { compCB += dispCB; compCA += dispCA; compPB += dispPB; compPA += dispPA }

    rows.push({ label: cat, cb: dispCB, ca: dispCA, pb: dispPB, pa: dispPA })

    if (isProgHead(cat)) {
      const gcb = cg ? cg.b : 0, gca = cg ? cg.a : 0
      const gpb = pg ? pg.b : 0, gpa = pg ? pg.a : 0
      if (gcb || gca || gpb || gpa) {
        rows.push({ label: GRANTS_LABEL, isGrants: true, cb: gcb, ca: gca, pb: gpb, pa: gpa })
      }
    }
  }

  if (computeTotal) { tCB = compCB; tCA = compCA; tPB = compPB; tPA = compPA }

  return {
    title: cardTitle,
    isSub,
    isTotal,
    rows,
    total: { cb: tCB, ca: tCA, pb: tPB, pa: tPA },
  }
}

// Returns { cards: [...] } - cards[0] is always "Total Foundation" (if any
// data), followed by one card per unit (skipping CONSOLIDATED / units with
// no categories at all), mirroring renderUnitDetailGrid()'s card order.
export function buildUnitDetailGrid(curData, prevData) {
  const prevLookup = buildPrevLookup(prevData)
  const sorted = [...(curData || [])].sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))

  // Total Foundation aggregation
  const allCatOrder = [], allCatSeen = {}
  const allCurMap = {}, allPrevMap = {}
  const allCurOpexTot = { b: 0, a: 0 }, allPrevOpexTot = { b: 0, a: 0 }

  for (const entry of sorted) {
    const tbl = (entry.table_name || '').toUpperCase()
    if (entry.sequence_id === 9999 || tbl === 'CONSOLIDATED') continue
    if (entry.is_this_sub_item === 1) continue
    const unit = (entry.label || '').trim()
    if (!unit) continue
    for (const sec of entry.actuals || []) {
      const nm = normName(sec.name)
      if (nm === 'OPERATING EXPENSES' || nm === 'OPERATING  EXPENSES') {
        allCurOpexTot.b += parseFloat(sec.ytd || 0) / 10000000
        allCurOpexTot.a += parseFloat(sec.total_posted_amt_ytd || 0) / 10000000
        for (const sh of sec.sub_heads || []) {
          const n = (sh.name || '').trim()
          if (!n) continue
          const b = parseFloat(sh.ytd || 0) / 10000000
          const a = parseFloat(sh.total_posted_amt_ytd || 0) / 10000000
          if (!allCatSeen[n]) { allCatSeen[n] = true; allCatOrder.push(n); allCurMap[n] = { b: 0, a: 0, items: [] } }
          allCurMap[n].b += b
          allCurMap[n].a += a
          for (const it of sh.items || []) {
            const iname = (it.name || '').trim()
            if (!iname) continue
            const ib = itemVal(it, 'b'), ia = itemVal(it, 'a')
            const found = allCurMap[n].items.find((x) => x.name === iname)
            if (found) { found.b += ib; found.a += ia } else allCurMap[n].items.push({ name: iname, b: ib, a: ia })
          }
        }
      } else if (nm.includes('COVID')) {
        allCurOpexTot.b += parseFloat(sec.ytd || 0) / 10000000
        allCurOpexTot.a += parseFloat(sec.total_posted_amt_ytd || 0) / 10000000
      }
    }
    const pm = prevLookup[unit] || {}
    allPrevOpexTot.b += (pm.__opex_total || { b: 0 }).b
    allPrevOpexTot.a += (pm.__opex_total || { a: 0 }).a
    for (const n of Object.keys(pm)) {
      if (n === '__opex_total') continue
      if (!allCatSeen[n]) { allCatSeen[n] = true; allCatOrder.push(n); allCurMap[n] = { b: 0, a: 0, items: [] } }
      if (!allPrevMap[n]) allPrevMap[n] = { b: 0, a: 0, items: [] }
      allPrevMap[n].b += (pm[n] || { b: 0 }).b
      allPrevMap[n].a += (pm[n] || { a: 0 }).a
      for (const it of pm[n].items || []) {
        const found = allPrevMap[n].items.find((x) => x.name === it.name)
        if (found) { found.b += it.b; found.a += it.a } else allPrevMap[n].items.push({ name: it.name, b: it.b, a: it.a })
      }
    }
  }

  const cards = []
  if (allCatOrder.length) {
    cards.push(buildCard('Total Foundation', allCatOrder, allCurMap, allPrevMap, false, true, allCurOpexTot, allPrevOpexTot))
  }

  for (const entry of sorted) {
    const tbl = (entry.table_name || '').toUpperCase()
    if (entry.sequence_id === 9999 || tbl === 'CONSOLIDATED') continue
    const unit = (entry.label || '').trim()
    if (!unit) continue

    const curMap = {}, catOrder = [], catSeen = {}
    const curOpexTot = { b: 0, a: 0 }
    for (const sec of entry.actuals || []) {
      const nm = normName(sec.name)
      if (nm === 'OPERATING EXPENSES' || nm === 'OPERATING  EXPENSES') {
        curOpexTot.b += parseFloat(sec.ytd || 0) / 10000000
        curOpexTot.a += parseFloat(sec.total_posted_amt_ytd || 0) / 10000000
        for (const sh of sec.sub_heads || []) {
          const n = (sh.name || '').trim()
          if (!n) continue
          const items = (sh.items || []).map((it) => ({ name: (it.name || '').trim(), b: itemVal(it, 'b'), a: itemVal(it, 'a') })).filter((it) => it.name)
          curMap[n] = { b: parseFloat(sh.ytd || 0) / 10000000, a: parseFloat(sh.total_posted_amt_ytd || 0) / 10000000, items }
          if (!catSeen[n]) { catSeen[n] = true; catOrder.push(n) }
        }
      } else if (nm.includes('COVID')) {
        curOpexTot.b += parseFloat(sec.ytd || 0) / 10000000
        curOpexTot.a += parseFloat(sec.total_posted_amt_ytd || 0) / 10000000
      }
    }
    const pm = prevLookup[unit] || {}
    const prevOpexTot = pm.__opex_total || { b: 0, a: 0 }
    for (const n of Object.keys(pm)) { if (n !== '__opex_total' && !catSeen[n]) { catSeen[n] = true; catOrder.push(n) } }
    if (!catOrder.length) continue

    const isSub = entry.is_this_sub_item === 1
    const pmClean = {}
    for (const k of Object.keys(pm)) if (k !== '__opex_total') pmClean[k] = pm[k]
    cards.push(buildCard(unit, catOrder, curMap, pmClean, isSub, false, curOpexTot, prevOpexTot))
  }

  return cards
}
