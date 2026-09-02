// Shared total/format helpers for the phase-sheet report shape returned by
// annual_budget.api.phase_sheet.get_consolidated_report - each head/sub-head/
// item row carries q1..q4, each a [month1, month2, month3] amount array.
// Used by BudgetSummaryCards.vue, BudgetSummaryTable.vue and BudgetDashboard.vue
// so the three views can never drift on how a total is computed.
export const QUARTERS = ['q1', 'q2', 'q3', 'q4']

// Fixed-order categorical palette (validated for CVD-safe adjacent
// separation). Never cycled past its own length in practice - this app
// only ever has a handful of expense heads.
export const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948']
export const CATEGORICAL_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']

// Matches BudgetSummaryTable.vue's fixed blue/orange banner colors exactly,
// so every chart on the page reads as one consistent color language.
export const PIE_COLORS = { direct: '#1e5fa8', grants: '#e8792a' }

export function isDarkMode() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

export function accentColor(i, muted = false) {
  const palette = isDarkMode() ? CATEGORICAL_DARK : CATEGORICAL
  const hex = palette[i % palette.length]
  return muted ? hex + '99' : hex
}

export function quarterSum(arr) {
  return (arr || []).reduce((a, b) => a + (Number(b) || 0), 0)
}

// Real report rows always carry their own q1..q4 amounts. Synthetic
// aggregate nodes built for the drill-down UI (e.g. a "Grand Total" or
// "Direct Work" node assembled from several heads) instead carry empty
// q1..q4 placeholders and rely entirely on their sub_heads/items - so a
// node with no quarter amounts of its own but with children falls back to
// summing them, instead of silently reporting zero.
export function rowTotal(row) {
  const own = QUARTERS.reduce((sum, q) => sum + quarterSum(row?.[q]), 0)
  if (own) return own
  const children = row?.sub_heads?.length ? row.sub_heads : row?.items
  if (children?.length) return children.reduce((sum, child) => sum + rowTotal(child), 0)
  return 0
}

export function nonZeroSubHeads(head) {
  return (head.sub_heads || []).filter((s) => rowTotal(s) > 0)
}

// Business rule from the original page: any item literally named
// "Grants & Donations", at head-item or sub-head-item level, is summed
// separately; everything else counts as "Direct Work".
export function grantsAmount(heads) {
  let total = 0
  for (const head of heads) {
    for (const item of head.items || []) {
      if (item.name === 'Grants & Donations') total += rowTotal(item)
    }
    for (const sub of head.sub_heads || []) {
      for (const item of sub.items || []) {
        if (item.name === 'Grants & Donations') total += rowTotal(item)
      }
    }
  }
  return total
}

export function formatINR(n) {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0)
}

export function formatCr(n) {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format((n || 0) / 1e7) + ' Cr'
}
