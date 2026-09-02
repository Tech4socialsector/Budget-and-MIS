// Shared helpers for the Foundation Consolidated Budget page
// (src/pages/FoundationConsolidated.vue), replicating the Desk page at
// annual_budget/annual_budget_mis/page/consolidated_budget/consolidated_budget.js.
//
// Two different "expense tree" shapes are in play across this page's 6 tabs:
//
// 1. Annual Budget Consolidated tab (annual_budget.api.phase_sheet.get_consolidated_report):
//    head -> sub_heads[] -> items[], each carrying q1..q4 (lowercase), each a
//    3-element array of monthly amounts. Same shape BudgetDashboard.vue/
//    BudgetSummaryTable.vue already use via dashboardData.js/budgetTotals.js.
//
// 2. Actuals Consolidated tab, and SummaryINR's previous-FY Quarter Phasing half
//    (annual_budget.api.foundation_consolidated_report.get_grouped_actuals_quarter_and_month_wise_total):
//    head -> sub_heads[] -> items[], each carrying Q1..Q4 (uppercase, a single
//    already-summed number per quarter - NOT an array) plus a separate `months`
//    object keyed by fiscal month-number STRING ("4".."12","1".."3", April..March
//    order) for the optional month-level drill-down. Confirmed against both the
//    live Desk JS (getMth/qTot in the Actuals module) and the export_reports.py
//    _get_quarters() reconciliation logic, which treats the Q-keys as the
//    authoritative quarter totals (months are for display only, and are evenly
//    redistributed on export if they don't already sum to the Q-key).
export const FISCAL_MONTH_KEYS = ['4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3']
export const MONTH_LABELS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
export const Q_MONTH_IDX = { q1: [0, 1, 2], q2: [3, 4, 5], q3: [6, 7, 8], q4: [9, 10, 11] }
export const QUARTER_KEYS = ['q1', 'q2', 'q3', 'q4']

function num(v) {
  return Number(v) || 0
}

// Quarter total for the Q1-Q4/months tree shape - reads the authoritative
// Q<n> (uppercase) key directly, exactly like the Desk JS's qTot().
export function actualsQuarterTotal(node, qKey) {
  return num(node?.[qKey.toUpperCase()])
}

// The 3 monthly values within one quarter, for when that quarter is expanded -
// read from the `months` object (keyed by fiscal month-number string).
export function actualsQuarterMonths(node, qKey) {
  const idxs = Q_MONTH_IDX[qKey]
  const months = node?.months || {}
  return idxs.map((i) => num(months[FISCAL_MONTH_KEYS[i]]))
}

// Node's own YEAR total if it carries Q1..Q4 directly, else recurse into
// sub_heads/items - same synthetic-node fallback pattern as budgetTotals.js's
// rowTotal()/dashboardData.js's treeTotal().
export function actualsRowTotal(node) {
  const own = QUARTER_KEYS.reduce((sum, q) => sum + actualsQuarterTotal(node, q), 0)
  if (own) return own
  const children = node?.sub_heads?.length ? node.sub_heads : node?.items
  if (children?.length) return children.reduce((sum, child) => sum + actualsRowTotal(child), 0)
  return 0
}

// FY string ("2025-26") -> previous FY's bare START YEAR as a string
// ("2024"), i.e. (FY start year - 1). This is the exact inline transform
// the Desk JS uses at both call sites that feed
// get_grouped_actuals_quarter_and_month_wise_total (Actuals tab load, and
// SummaryINR's Quarter Phasing previous-year half) - NOT the same as
// get_previous_financial_year() (which returns a "2024-25"-style FY
// string for a *different* API). Do not conflate the two.
export function fyToPrevBareYear(fy) {
  const startYear = parseInt((fy || '2025-26').split('-')[0], 10) || 2025
  return String(startYear - 1)
}

// FY string -> {plan, actual} column labels, matching the Desk JS's
// getFYLabels() exactly (used by PPT/SummaryINR/BudgetActuals headers).
export function getFYLabels(fy) {
  const p = (fy || '2025-26').split('-')
  const sYY = (p[0] || '25').slice(-2)
  const eYY = (p[1] || '26').slice(-2)
  const ps = String(parseInt(sYY, 10) - 1).padStart(2, '0')
  const pe = String(parseInt(eYY, 10) - 1).padStart(2, '0')
  return { plan: `FY${sYY}-${eYY} Plan`, actual: `FY${ps}-${pe} Actuals` }
}

// FY string -> previous FY string ("2025-26" -> "2024-25"), matching the
// Desk JS's getPrevFY() / the backend's get_previous_financial_year().
export function prevFY(fy) {
  const p = (fy || '2025-26').split('-')
  const s = (parseInt(p[0], 10) || 2025) - 1
  const e = (parseInt(p[1], 10) || 26) - 1
  return `${s}-${String(e).padStart(2, '0')}`
}

// Indian-grouped raw-rupee formatter (matches the Desk JS's formatINR() and
// budgetTotals.js's formatINR()) - used by Annual/Actuals/BudgetActuals
// tabs, which show full INR in-cell with a Cr tooltip (opposite convention
// from PPT/SummaryINR, which show Cr in-cell with a full-INR tooltip).
export function formatINR(n) {
  const v = num(n)
  if (!v) return '-'
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v)
}

// Crore formatter with 2dp (matches the Desk JS's fmtCr/fmtCrDash) - used
// in-cell by PPT/SummaryINR/Headcount/Quarter Phasing.
export function formatCrDash(n) {
  const v = num(n)
  if (!v) return '-'
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(v / 1e7)
}

// Full-precision rupee string for tooltips (no rounding beyond whole rupees).
export function formatFullRupees(n) {
  return '₹ ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num(n))
}

// Cr-equivalent string for tooltips on full-INR cells.
export function formatCrTooltip(n) {
  return formatCrDash(n) + ' Cr'
}

export function pct(part, whole, dp = 1) {
  if (!whole) return null
  return Number((((part / whole) - 0) * 100).toFixed(dp))
}

export function pctChange(from, to, dp = 1) {
  if (!from || to == null) return null
  return Number((((to / from) - 1) * 100).toFixed(dp))
}

// Downloads a server-generated XLSX file the same way the Desk page's
// serverExport() does: base64 -> byte array -> Blob -> object URL ->
// programmatic anchor click -> cleanup. `payload` is the {data, filename}
// object returned by annual_budget.api.export_reports.export_* endpoints.
export function downloadXlsx(payload) {
  if (!payload?.data) return false
  const bin = atob(payload.data)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = payload.filename || 'export.xlsx'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 500)
  return true
}

// Normalizes a section/head name the same way the Desk JS's normSec()
// does, for the OPERATING/CAPITAL/COVID/GRAND TOTAL matching used
// throughout PPT, SummaryINR and BudgetActuals.
export function normName(s) {
  return (s || '').replace(/\s+/g, ' ').trim().toUpperCase()
}

export function isGrandTotalSection(sec) {
  return sec?.sequence_id === 9999 || normName(sec?.name) === 'GRAND TOTAL'
}

export function isConsolidatedEntry(entry) {
  return entry?.sequence_id === 9999 || normName(entry?.table_name) === 'CONSOLIDATED'
}
