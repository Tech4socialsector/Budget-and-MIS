// Generate + poll + download helper for the Budget Import Template page
// (pages/BudgetImportTemplate.vue) - mirrors erpActualsExport.js's blob/
// Content-Disposition/createObjectURL mechanics, but POST-triggers a
// background job first (budget_mis.api_1.budget_import_template.
// start_budget_template_generation) and polls a GET endpoint
// (download_generated_template) until the file is ready, rather than a
// single POST-and-receive-blob round trip - the server job can take long
// enough (building a multi-row .xlsx per selected entity) that a single
// request would be the kind of long-held connection this app's Monthly MIS
// "Failed to fetch" investigation already found to be fragile.
//
// The legacy Desk JS (import_template.js) polls forever (no timeout) and
// treats ANY application/json response as "still processing" without ever
// reading its fields - so a genuine JSON error payload from the server
// would have silently looped forever there. Both are fixed here: a
// MAX_POLL_MS cap surfaces a clear timeout error, and a JSON response is
// only treated as "still processing" when its own status field says so;
// any other JSON shape (e.g. {status: "error", message}) surfaces as a
// real failure instead of being swallowed.
import { call } from '@/data/decrypt'

const POLL_INTERVAL_MS = 3000
const MAX_POLL_MS = 5 * 60 * 1000 // 5 minutes

function csrfHeaders() {
  const headers = {}
  if (window.csrf_token && window.csrf_token !== '{{ csrf_token }}') {
    headers['X-Frappe-CSRF-Token'] = window.csrf_token
  }
  return headers
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Checks whether `user` has an Import Template linked at all (Finance user
 * access.import_template_id) - mirrors the legacy page's pre-download gate,
 * which otherwise lets a user kick off a job that can never produce a file.
 *
 * Deliberately NOT frappe.client.get_value (what the legacy Desk JS called
 * for this same check): "Finance user access" only grants read permission
 * to System Manager, so that call throws PermissionError for every
 * non-admin user - exactly the audience this check exists for. This calls
 * budget_mis.api_1.budget_import_template.has_import_template_linked
 * instead, which reads the field the same permission-bypassing way
 * get_user_mappings already does, while still enforcing server-side that a
 * non-admin can only ask about their own user.
 */
export async function hasImportTemplateLinked(user) {
  return call('budget_mis.api_1.budget_import_template.has_import_template_linked', { user })
}

/**
 * Kicks off generation, then polls for the finished file and triggers a
 * browser download. `onProgress(stage)` is called with one of:
 * 'starting' | 'generating' | 'waiting' | 'ready' - for the caller's own
 * loader/label text, so this module stays UI-agnostic.
 */
export async function generateAndDownloadTemplate({ user, entityData, onProgress }) {
  onProgress?.('starting')

  await call('budget_mis.api_1.budget_import_template.start_budget_template_generation', {
    user,
    entity_data: entityData,
  })

  onProgress?.('generating')

  const deadline = Date.now() + MAX_POLL_MS
  let firstPoll = true

  while (true) {
    if (!firstPoll) await sleep(POLL_INTERVAL_MS)
    firstPoll = false

    if (Date.now() > deadline) {
      throw new Error('Template generation is taking longer than expected. Please try again in a few minutes.')
    }

    const url = `/api/method/budget_mis.api_1.budget_import_template.download_generated_template?user=${encodeURIComponent(user)}`
    const res = await fetch(url, { headers: csrfHeaders() })

    if (!res.ok) {
      throw new Error(`Download failed (HTTP ${res.status})`)
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await res.json()
      // The only JSON shape the backend actually returns mid-flight is
      // {status: "processing"} - anything else JSON-shaped (an error
      // object, an unexpected message) is treated as a real failure
      // instead of silently looped on forever (the legacy page's bug).
      if (body?.status === 'processing') {
        onProgress?.('waiting')
        continue
      }
      throw new Error(body?.message || body?.exception || 'Template generation failed.')
    }

    onProgress?.('ready')

    const blob = await res.blob()
    const disposition = res.headers.get('Content-Disposition') || ''
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)
    const filename = match ? decodeURIComponent(match[1]) : 'Budget_Import_Template.xlsx'

    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    }, 500)
    return filename
  }
}
