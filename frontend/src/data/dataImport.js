// Backend calls + realtime progress for the generic Data Import page
// (pages/DataImport.vue) - calls Frappe's OWN Data Import engine directly
// (frappe.core.doctype.data_import.data_import.*), confirmed from its
// actual source (data_import.py, importer.py, data_import.js) rather than
// reimplementing import logic: unlike Finance Budget's own import
// (api_1/budget_import.py), a generic "any doctype" tool has no business
// -key-matching problem to work around - every doctype already has a real
// document name to match on, which is exactly what Data Import's own
// "Update Existing Records" mode expects.
import { call } from '@/data/decrypt'
import { initSocket } from 'frappe-ui'

// Creates a new, unsaved-until-first-save "Data Import" document via
// Frappe's REST v2 document endpoint (the same one useNewDoc wraps) -
// Data Import's own whitelisted methods all take a docname, so one must
// exist before any of the preview/import/status calls below can run.
export async function createDataImport({ doctype, importType }) {
  const res = await fetch(`/api/v2/document/Data Import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Frappe-CSRF-Token': window.csrf_token || '',
    },
    body: JSON.stringify({
      reference_doctype: doctype,
      import_type: importType,
      mute_emails: 1,
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.exception || body?.message || `Could not create Data Import (HTTP ${res.status})`)
  }
  const body = await res.json()
  return body.data
}

// get_preview_from_template's `import_file` argument only sets the file
// onto the Data Import doc IN MEMORY for that one call
// (frappe/core/doctype/data_import/data_import.py's own
// get_preview_from_template: `self.import_file = import_file`, never
// followed by a save()) - the real Desk form never hits this gap because
// its Attach field widget saves the file onto the document directly, as
// part of the browser's upload flow, before Preview is ever requested. A
// Vue SPA uploading via FileUploader (which only returns a bare file_url,
// not attached to any document) has no equivalent implicit save, so the
// field must be persisted explicitly here - confirmed live: without this,
// start_import's own background job re-fetches the Data Import doc fresh
// from the database, finds import_file empty, and fails immediately with
// "Invalid template file for import" even though the earlier preview call
// (which only ever held the file in memory, not in the database) worked.
export async function setImportFile({ dataImport, importFile }) {
  const res = await fetch(`/api/v2/document/Data Import/${encodeURIComponent(dataImport)}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Frappe-CSRF-Token': window.csrf_token || '',
    },
    body: JSON.stringify({ import_file: importFile }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.exception || body?.message || `Could not attach the file (HTTP ${res.status})`)
  }
}

export async function getPreview({ dataImport, importFile }) {
  return call('frappe.core.doctype.data_import.data_import.get_preview_from_template', {
    data_import: dataImport,
    import_file: importFile,
  })
}

export async function startImport(dataImport) {
  return call('frappe.core.doctype.data_import.data_import.form_start_import', {
    data_import: dataImport,
  })
}

export async function stopImport(dataImport) {
  return call('frappe.core.doctype.data_import.data_import.stop_data_import', {
    doc_name: dataImport,
  })
}

export async function getImportStatus(dataImport) {
  return call('frappe.core.doctype.data_import.data_import.get_import_status', {
    data_import_name: dataImport,
  })
}

export async function getImportLogs(dataImport) {
  return call('frappe.core.doctype.data_import.data_import.get_import_logs', {
    data_import: dataImport,
  })
}

// Frappe's own Desk Data Import page filters its Document Type picker by
// frappe.boot.user.can_import, a client-side boot value this Vue SPA never
// receives - but frappe.client.get_list (a core framework method, not
// custom backend code) already enforces the calling user's own doctype
// permissions server-side, so a plain get_list naturally returns only
// doctypes the user can actually see; Data Import's own preview/import
// calls (get_preview_from_template/form_start_import) separately enforce
// create/write permission on the chosen doctype when the import actually
// runs, so this list doesn't need to re-check import-specific permission
// itself - it's just populating the picker, not a security boundary on its
// own.
export async function getImportableDoctypes() {
  return call('frappe.client.get_list', {
    doctype: 'DocType',
    filters: { istable: 0, issingle: 0 },
    fields: ['name', 'module'],
    order_by: 'name asc',
    limit_page_length: 0,
  })
}

// Recent Data Import runs - also plain frappe.client.get_list, no custom
// backend code, same as getImportableDoctypes above. Frappe's own Desk
// list view (/app/data-import) already shows this for free, but it's
// still useful inline here so a past run's status/doctype is visible
// without leaving this page - this just reads the same doctype, not a
// separate source of truth.
export async function getRecentImports() {
  return call('frappe.client.get_list', {
    doctype: 'Data Import',
    fields: ['name', 'reference_doctype', 'import_type', 'status', 'creation'],
    order_by: 'creation desc',
    limit_page_length: 10,
  })
}

function postDownload(path, args) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = `/api/method/${path}`
  form.style.display = 'none'

  const csrfInput = document.createElement('input')
  csrfInput.type = 'hidden'
  csrfInput.name = 'csrf_token'
  csrfInput.value = window.csrf_token || ''
  form.appendChild(csrfInput)

  for (const [key, value] of Object.entries(args)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()
  setTimeout(() => document.body.removeChild(form), 1000)
}

export function downloadTemplate({ doctype, importType }) {
  postDownload('frappe.core.doctype.data_import.data_import.download_template', {
    doctype,
    export_fields: '{}',
    export_records: 'blank_template',
    export_filters: '{}',
    file_type: 'Excel',
  })
}

export function downloadErroredRows(dataImport) {
  postDownload('frappe.core.doctype.data_import.data_import.download_errored_template', {
    data_import_name: dataImport,
  })
}

export function downloadImportLog(dataImport) {
  postDownload('frappe.core.doctype.data_import.data_import.download_import_log', {
    data_import_name: dataImport,
  })
}

// Realtime progress - 'data_import_progress' fires per-row while a job
// runs (only for >5 total rows - smaller imports produce zero progress
// events, just the final 'data_import_refresh'), 'data_import_refresh'
// fires once, unconditionally, when the background job finishes
// (success, error, or timeout alike). Mirrors data/actualsCacheProgress.js's
// own initSocket({port: window.socketio_port}) pattern - window.site_name
// aliasing is handled there already and shared globally once set.
let socket = null
function getSocket() {
  if (!window.site_name && window.sitename) {
    window.site_name = window.sitename
  }
  if (!socket) {
    socket = initSocket({ port: window.socketio_port })
  }
  return socket
}

export function onImportProgress(callback) {
  const s = getSocket()
  s.on('data_import_progress', callback)
  return () => s.off('data_import_progress', callback)
}

export function onImportRefresh(callback) {
  const s = getSocket()
  s.on('data_import_refresh', callback)
  return () => s.off('data_import_refresh', callback)
}
