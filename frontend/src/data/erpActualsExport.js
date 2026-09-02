// POST-based Excel export helper for the ERP Actuals page.
//
// Unlike Foundation Consolidated / Monthly MIS (whose export endpoints
// either return a base64 JSON payload via call(), or are simple GETs),
// annual_budget.api.export_reports.export_erp_actuals_excel takes a
// `rows` argument that can be arbitrarily large (the full currently-
// filtered ERP dataset) and returns a raw binary xlsx response directly
// (frappe.response['filecontent']/['type']='binary') - so it needs a POST
// with a body, which neither call() (JSON-only, expects a `message` key)
// nor a plain <a href> GET (URL length limits) can do.
//
// The Desk page reaches for Frappe core's global open_url_post() helper
// (a hidden-form-submit POST that navigates the whole page to the
// response) for this - there's no equivalent in this Vue SPA (confirmed:
// no such helper exists anywhere under frontend/src), and navigating the
// SPA away to a binary response isn't the right UX here anyway. Instead,
// this does a raw fetch() POST and turns the response into a downloaded
// file, mirroring frappe-ui's own call() for auth/CSRF headers (see
// node_modules/frappe-ui/src/utils/call.js) and foundationConsolidatedData
// .js's downloadXlsx() for the blob-to-download-click mechanics.
export async function exportErpActualsExcel({ fiscalYear, accountingPeriod, rows }) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Frappe-Site-Name': window.location.hostname,
  }
  if (window.csrf_token && window.csrf_token !== '{{ csrf_token }}') {
    headers['X-Frappe-CSRF-Token'] = window.csrf_token
  }

  const res = await fetch('/api/method/annual_budget.api.export_reports.export_erp_actuals_excel', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fiscal_year: fiscalYear,
      accounting_period: accountingPeriod,
      rows: JSON.stringify(rows || []),
    }),
  })

  if (!res.ok) {
    let message = `Export failed (HTTP ${res.status})`
    try {
      const errBody = await res.json()
      message = errBody?._server_messages
        ? (JSON.parse(errBody._server_messages)[0] ? JSON.parse(JSON.parse(errBody._server_messages)[0]).message : message)
        : errBody?.exception || errBody?.message || message
    } catch {
      // Response wasn't JSON (e.g. an HTML error page) - keep the generic message.
    }
    throw new Error(message)
  }

  const blob = await res.blob()

  // Derive a filename from Content-Disposition if present, else fall back
  // to a generated name.
  const disposition = res.headers.get('Content-Disposition') || ''
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)
  const filename = match
    ? decodeURIComponent(match[1])
    : `ERP_Actuals_${fiscalYear}_P${accountingPeriod}.xlsx`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 500)
  return true
}
