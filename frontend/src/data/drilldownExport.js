// Excel / PDF export for the drill-down modals. Each modal builds a payload
// describing exactly the view it is showing (header, summary, columns, rows,
// TOTAL footer - see budget_mis/api/drilldown_export.py for the shape) and
// the server renders it in the same layout as the on-screen table.
import { call } from '@/data/decrypt'
import { CATEGORICAL } from '@/data/budgetTotals'

export async function exportDrilldown(payload, format) {
  const res = await call('budget_mis.api.drilldown_export.export_drilldown', {
    payload: JSON.stringify(payload),
    export_format: format,
  })
  if (!res?.data) throw new Error('Export failed.')
  const bin = atob(res.data)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const url = URL.createObjectURL(new Blob([bytes], { type: res.mimetype }))
  const a = document.createElement('a')
  a.href = url
  a.download = res.filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 500)
}

// Light-mode accent colour for a row's dot / share bar in the exported file
// (the file is always light, even when the app is in dark mode).
export function exportColor(i) {
  return CATEGORICAL[i % CATEGORICAL.length]
}

// Drill-down search: true when every word of `query` appears somewhere in
// the row's fields (codes, names, descriptions, amounts...), case-
// insensitive. Numbers also match without their thousands separators, so
// "2013298" finds 2,013,298.57.
export function matchesSearch(query, ...fields) {
  const words = String(query || '').toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const haystack = fields
    .flat()
    .filter((f) => f !== null && f !== undefined && f !== '')
    .map((f) => (typeof f === 'number' ? `${f} ${Math.round(f)}` : String(f)))
    .join(' ')
    .toLowerCase()
  return words.every((w) => haystack.includes(w.replace(/,/g, '')))
}
