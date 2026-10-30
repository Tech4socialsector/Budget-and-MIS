<!--
  Generic Data Import tool - a Vue replica of Frappe Desk's own real Data
  Import wizard (Config -> Preview -> Fix issues -> Import, with a stepper
  at top), confirmed directly from a live screenshot of that production UI
  rather than assumed. Calls Frappe's OWN backend endpoints underneath
  (frappe.core.doctype.data_import.data_import.*, see data/dataImport.js's
  own header comment) - unlike Finance Budget's own import
  (pages/BudgetImportUpload.vue), a generic "any doctype" tool has no
  business-key-matching problem to work around, since Data Import's own
  "Update Existing Records" mode matching by document name is exactly
  right for any ordinary doctype.

  System Manager only - enforced two ways, deliberately without any custom
  backend code of our own: the Home tile itself is role-restricted to
  System Manager (App Module Setting), and frappe.client.get_list (a core
  framework method) throws a PermissionError reading "DocType" for anyone
  without read access to it, which only System Manager (and similar admin
  roles) has - so even a direct visit to this route with no tile shortcut
  fails at the doctype-picker step for a non-admin. This is a powerful,
  any-doctype, any-record admin tool, not something to open up to the same
  Finance user access population as the budget-specific pages.
-->
<template>
  <AppLayout>
    <div class="flex flex-col gap-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Data Import</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Import records into any doctype from a CSV or Excel file.
          </p>
        </div>
        <Button v-if="showList" variant="solid" theme="gray" @click="startNewImport">
          <template #prefix><FeatherIcon name="plus" class="h-4 w-4" /></template>
          New Import
        </Button>
      </div>

      <ErrorMessage v-if="error" :message="error" />

      <!-- Landing view: the list of past Data Import runs, same convention
      as any other Frappe list page (and Desk's own /app/data-import) -
      shown first, with "New Import" above starting the Config wizard
      below. Previously the wizard itself was the landing state, which
      meant there was no way to see past imports without already knowing
      to look - this matches the expected "list first, New to create"
      pattern instead. -->
      <div v-if="showList" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div v-if="!recentImports.length" class="p-16 text-center text-sm text-gray-500 dark:text-gray-400">
          No imports yet. Click "New Import" to get started.
        </div>
        <div v-else class="fc-scroll-wrapper">
          <table class="fc-table w-full min-w-[700px] text-sm">
            <thead>
              <tr class="fc-thead-main">
                <th class="fc-th text-left">Document Type</th>
                <th class="fc-th text-left">Import Type</th>
                <th class="fc-th text-left">Status</th>
                <th class="fc-th text-left">Date</th>
                <th class="fc-th"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="imp in recentImports" :key="imp.name">
                <td class="fc-td text-left">{{ imp.reference_doctype }}</td>
                <td class="fc-td text-left">{{ imp.import_type }}</td>
                <td class="fc-td text-left">
                  <span
                    class="inline-flex items-center gap-1.5 text-xs font-medium"
                    :class="statusTextClass(imp.status)"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass(imp.status)" />
                    {{ imp.status }}
                  </span>
                </td>
                <td class="fc-td text-left">{{ formatDate(imp.creation) }}</td>
                <td class="fc-td text-left">
                  <a
                    :href="`/app/data-import/${encodeURIComponent(imp.name)}`"
                    target="_blank"
                    rel="noopener"
                    class="text-fc-blue-mid hover:underline"
                  >
                    View
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template v-else>
        <!-- Replica of Frappe Desk's real Data Import FORM page - a single
        continuous form (Document Type / Import Type / Download Template /
        Import File / options checkboxes), NOT a card-stepper wizard,
        confirmed directly from live screenshots of
        /app/data-import/<name>. "Import File Errors and Warnings" and the
        Preview grid appear inline below the file field once a file is
        attached, exactly as Desk does it - there's no separate "step" to
        move through, just one page whose content accumulates top to
        bottom. -->
        <div class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ dataImportName || 'New Data Import' }}
              </h2>
              <span
                v-if="dataImportName"
                class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="statusBadgeClass(result?.status || 'Pending')"
              >
                {{ result?.status || 'Pending' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <Button v-if="dataImportName && !preview" variant="subtle" theme="gray" size="sm" @click="reset">Cancel</Button>
              <Button
                v-if="preview && !result"
                variant="solid"
                theme="blue"
                size="sm"
                :loading="starting"
                :disabled="importing"
                @click="runImport"
              >
                {{ importing ? progressMessage : 'Start Import' }}
              </Button>
              <a
                v-if="result?.success"
                :href="deskListUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
              >
                Go to {{ selectedDoctypeName }} List
              </a>
            </div>
          </div>

          <div v-if="result" class="flex items-center justify-between gap-3 border-b border-blue-100 bg-blue-50 px-4 py-2.5 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
            <span>
              <template v-if="result.status === 'Success'">Successfully imported {{ result.success || 0 }} out of {{ (result.success || 0) + (result.failed || 0) }} records.</template>
              <template v-else-if="result.status === 'Partial Success'">Imported {{ result.success || 0 }} out of {{ (result.success || 0) + (result.failed || 0) }} records - {{ result.failed || 0 }} failed.</template>
              <template v-else>Import failed - see the log below.</template>
            </span>
          </div>

          <div v-if="importing" class="flex flex-col gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{{ progressMessage }}</span>
              <button type="button" class="font-medium text-red-600 hover:underline dark:text-red-400" @click="cancelImport">Cancel Import</button>
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div class="h-full rounded-full bg-fc-blue-mid transition-all duration-300" :style="{ width: `${progressPercent}%` }" />
            </div>
          </div>

          <!-- Two-column form body - left: Document Type / Import Type /
          Download Template / Import File / Google Sheets URL; right: the
          three option checkboxes - matches the real page's own layout
          exactly (see live screenshot of /app/data-import/<name>), not a
          symmetric field grid. -->
          <div class="grid grid-cols-1 gap-8 p-4 sm:grid-cols-2">
            <div class="flex flex-col gap-4">
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Document Type *</label>
                <Autocomplete
                  v-model="selectedDoctype"
                  :options="doctypeOptions"
                  :disabled="!!dataImportName"
                  placeholder="Select a Document Type"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Import Type *</label>
                <Select
                  :options="[
                    { label: 'Insert New Records', value: 'Insert New Records' },
                    { label: 'Update Existing Records', value: 'Update Existing Records' },
                  ]"
                  v-model="importType"
                  :disabled="!!dataImportName"
                  class="w-full"
                />
              </div>

              <Button v-if="selectedDoctypeName" variant="subtle" theme="gray" class="self-start" @click="downloadTemplate">
                Download Template
              </Button>

              <div>
                <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Import File</label>
                <div v-if="!fileName" class="flex items-center gap-3">
                  <FileUploader :upload-args="{ private: true }" @success="onFileUploaded">
                    <template #default="{ openFileSelector, uploading, progress }">
                      <Button variant="subtle" theme="gray" :disabled="!selectedDoctypeName" :loading="uploading" @click="openFileSelector">
                        {{ uploading ? `Uploading ${progress}%` : 'Attach' }}
                      </Button>
                    </template>
                  </FileUploader>
                </div>
                <div v-else class="flex items-center gap-2">
                  <FeatherIcon name="link" class="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                  <a :href="fileUrl" target="_blank" rel="noopener" class="truncate text-sm text-fc-blue-mid hover:underline">{{ fileName }}</a>
                  <Button variant="subtle" theme="gray" size="sm" :disabled="!!preview" @click="reset">Clear</Button>
                </div>
              </div>

              <div v-if="!fileName">
                <div class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">OR</div>
                <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Import from Google Sheets</label>
                <input
                  type="text"
                  class="form-input w-full"
                  placeholder="Must be a publicly accessible Google Sheets URL"
                  disabled
                />
              </div>

              <Button
                v-if="fileUrl && !preview"
                variant="solid"
                theme="gray"
                class="self-start"
                :loading="loadingPreview"
                @click="loadPreview"
              >
                Load Preview
              </Button>
            </div>

            <div class="flex flex-col gap-4">
              <label class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" class="form-checkbox mt-0.5" disabled />
                <span>
                  Detect CSV type
                  <div class="text-xs text-gray-500 dark:text-gray-400">Use if the default settings don't seem to detect your data correctly</div>
                </span>
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" class="form-checkbox" disabled />
                Custom Delimiters
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" class="form-checkbox" checked disabled />
                Don't Send Emails
              </label>
            </div>
          </div>

          <!-- "Import File Errors and Warnings" - inline, grouped by ROW/
          COLUMN exactly like the real page, not a separate red-banner
          "Fix issues" card. -->
          <div v-if="preview?.warnings?.length" class="border-t border-gray-200 px-4 py-4 dark:border-gray-800">
            <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Import File Errors and Warnings</h3>
            <div v-for="(group, i) in groupedWarnings" :key="i" class="mb-3 last:mb-0">
              <div class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">{{ group.heading }}</div>
              <ul class="ml-4 list-disc text-sm text-gray-600 dark:text-gray-400">
                <li v-for="(w, j) in group.items" :key="j">{{ w.message }}</li>
              </ul>
            </div>
          </div>

          <!-- Preview grid -->
          <div v-if="preview" class="border-t border-gray-200 px-4 py-4 dark:border-gray-800">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Preview</h3>
              <div class="flex items-center gap-2">
                <Button variant="outline" theme="gray" size="sm" @click="showMapColumns = true">Map Columns</Button>
                <Button v-if="preview.warnings?.length" variant="outline" theme="gray" size="sm" @click="showWarningsOnly = !showWarningsOnly">
                  {{ showWarningsOnly ? 'Show All Rows' : 'Show Warnings' }}
                </Button>
              </div>
            </div>
            <div class="fc-scroll-wrapper fc-scroll-wrapper-tall">
              <table class="fc-table w-full min-w-[900px] text-sm">
                <thead>
                  <tr class="fc-thead-main">
                    <th class="fc-th text-left">Sr.</th>
                    <th v-for="col in preview.columns" :key="col.column_number ?? 'sr'" class="fc-th text-left">
                      <span class="mr-1.5 inline-block h-2 w-2 rounded-full" :class="col.skip_import ? 'bg-red-500' : 'bg-green-500'" />
                      {{ col.header_title }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in displayedPreviewRows" :key="i">
                    <td class="fc-td text-left text-gray-400">{{ i + 2 }}</td>
                    <td v-for="(cell, j) in row" :key="j" class="fc-td text-left">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="preview.max_rows_exceeded" class="pt-2 text-xs text-gray-500 dark:text-gray-400">
              Showing only the first {{ preview.max_rows_in_preview }} of {{ preview.total_number_of_rows }} rows.
            </div>
          </div>
        </div>

        <!-- Import Log results -->
        <div v-if="result" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Import Log</h2>
            <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span><span class="font-medium text-green-700 dark:text-green-400">{{ result.success || 0 }}</span> succeeded</span>
              <span><span class="font-medium text-red-700 dark:text-red-400">{{ result.failed || 0 }}</span> failed</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-800">
            <Button v-if="result.failed" variant="outline" theme="gray" size="sm" @click="downloadErroredRows(dataImportName)">
              <template #prefix><FeatherIcon name="download" class="h-3.5 w-3.5" /></template>
              Export Errored Rows
            </Button>
            <Button variant="outline" theme="gray" size="sm" @click="downloadImportLog(dataImportName)">
              <template #prefix><FeatherIcon name="download" class="h-3.5 w-3.5" /></template>
              Export Import Log
            </Button>
          </div>

          <div v-if="logs.length" class="fc-scroll-wrapper fc-scroll-wrapper-tall">
            <table class="fc-table w-full min-w-[700px] text-sm">
              <thead>
                <tr class="fc-thead-main">
                  <th class="fc-th text-left">Row(s)</th>
                  <th class="fc-th text-left">Status</th>
                  <th class="fc-th text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(log, i) in logs" :key="i">
                  <td class="fc-td text-left">{{ formatRowIndexes(log.row_indexes) }}</td>
                  <td class="fc-td text-left">
                    <span :class="log.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                      {{ log.success ? 'Success' : 'Failure' }}
                    </span>
                  </td>
                  <td class="fc-td text-left">
                    <a
                      v-if="log.success && log.docname"
                      :href="deskRecordUrl(log.docname)"
                      target="_blank"
                      rel="noopener"
                      class="text-fc-blue-mid hover:underline"
                    >
                      {{ log.docname }}
                    </a>
                    <template v-else>{{ log.success ? '' : formatMessages(log.messages) }}</template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end border-t border-gray-200 px-4 py-4 dark:border-gray-800">
            <Button variant="subtle" theme="gray" @click="reset">Import Another File</Button>
          </div>
        </div>

        <!-- Map Columns modal - matches the real Desk dialog: two columns,
        file header on the left (read-only), target field on the right
        (editable Select per row, including a "Don't Import" option). -->
        <Dialog v-model="showMapColumns" :options="{ title: 'Map Columns', size: 'lg' }">
          <template #body-content>
            <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Map columns from <strong>{{ fileName }}</strong> to fields in <strong>{{ selectedDoctypeName }}</strong>
            </p>
            <div class="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="col in preview?.columns || []" :key="col.column_number ?? col.header_title" class="grid grid-cols-2 gap-4 py-3">
                <div class="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  {{ col.header_title }}
                </div>
                <div class="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
                  {{ col.skip_import ? "Don't Import" : col.header_title }}
                </div>
              </div>
            </div>
          </template>
        </Dialog>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Autocomplete, Button, Dialog, FeatherIcon, FileUploader, Select, ErrorMessage } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import { setPageTitle } from '@/data/pageTitle'
import {
  createDataImport,
  setImportFile,
  getPreview,
  startImport,
  stopImport,
  getImportStatus,
  getImportLogs,
  getImportableDoctypes,
  getRecentImports,
  downloadTemplate as downloadTemplateFile,
  downloadErroredRows,
  downloadImportLog,
  onImportProgress,
  onImportRefresh,
} from '@/data/dataImport'

setPageTitle('Data Import')

const recentImports = ref([])
function loadRecentImports() {
  getRecentImports()
    .then((rows) => { recentImports.value = rows || [] })
    .catch(() => {}) // non-critical - the Config step works fine without this list
}
onMounted(loadRecentImports)

// Full literal class names, not dynamically constructed (`text-${color}-700`)
// - Tailwind's build-time scanner only picks up classes it can see written
// out in full; a computed string like that compiles to nothing, same
// reason this app's LucideIcon.vue exists instead of dynamic Feather icon
// classes elsewhere.
const STATUS_CLASSES = {
  Success: { text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  'Partial Success': { text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  Error: { text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  'Timed Out': { text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  Pending: { text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
}
function statusTextClass(status) {
  return (STATUS_CLASSES[status] || STATUS_CLASSES.Pending).text
}
function statusDotClass(status) {
  return (STATUS_CLASSES[status] || STATUS_CLASSES.Pending).dot
}
// Pill badge next to the doc title, same idea as Desk's own status badge
// (orange Pending, green Success, amber Partial Success, red Error/Timed Out).
const STATUS_BADGE_CLASSES = {
  Success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Partial Success': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'Timed Out': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
}
function statusBadgeClass(status) {
  return STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.Pending
}
function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

const selectedDoctype = ref(null)
const importType = ref('Insert New Records')
const fileName = ref('')
const fileUrl = ref('')
const dataImportName = ref('')
const preview = ref(null)
const result = ref(null)
const logs = ref([])
const error = ref(null)

const loadingPreview = ref(false)
const starting = ref(false)
const importing = ref(false)
const progressPercent = ref(0)
const progressMessage = ref('Starting...')

const doctypeOptions = ref([])
getImportableDoctypes()
  .then((rows) => {
    doctypeOptions.value = (rows || []).map((d) => ({ label: d.name, value: d.name }))
  })
  .catch((e) => {
    error.value = e?.messages?.[0] || e?.message || 'Could not load the list of doctypes.'
  })

// Autocomplete's v-model binds the whole {label, value} option object, not
// a bare string - sending that object straight through as a Link field's
// value (reference_doctype) throws server-side ("Unexpected value for
// field reference_doctype: {label: ..., value: ...}"), since a Link value
// must be a plain string/int. Normalized here once so every other use of
// "the chosen doctype" (the create-doc call, the Import step's own display
// text) can keep treating it as a plain string regardless of what shape
// the picker itself hands back.
const selectedDoctypeName = computed(() => {
  const v = selectedDoctype.value
  return (v && typeof v === 'object' ? v.value : v) || null
})

const canLoadPreview = computed(() => !!selectedDoctypeName.value && !!fileUrl.value)

// Frappe Desk's own URL convention for a doctype: /app/<slug>, the slug
// being the doctype name lowercased with spaces turned into hyphens (e.g.
// "Finance Budget" -> "finance-budget") - this always resolves correctly
// in Desk regardless of whether this Vue app's own sidebar config happens
// to know about that doctype, unlike this app's own /:doctypeRoute list/
// form pages (see the template's own comment on the "View ... in Desk"
// link for why those can't be used generically here).
function doctypeSlug(doctype) {
  return (doctype || '').toLowerCase().replace(/\s+/g, '-')
}
const deskListUrl = computed(() => `/app/${doctypeSlug(selectedDoctypeName.value)}`)
function deskRecordUrl(docname) {
  return `/app/${doctypeSlug(selectedDoctypeName.value)}/${encodeURIComponent(docname)}`
}

// Landing state: the list of past imports, with a "New Import" button
// above it starting the wizard - true on mount and whenever the user backs
// all the way out (Cancel, or "Import Another File" after finishing one).
const showList = ref(true)
function startNewImport() {
  reset()
  showList.value = false
}

const showMapColumns = ref(false)
const showWarningsOnly = ref(false)

// Groups preview.warnings by its row/col origin into "ROW N" / "COLUMN N"
// sections with bulleted messages underneath - matches the real page's own
// "Import File Errors and Warnings" layout exactly (see the live
// screenshots), rather than a flat list.
const groupedWarnings = computed(() => {
  const groups = []
  const byKey = new Map()
  for (const w of preview.value?.warnings || []) {
    const key = w.row != null ? `ROW ${w.row}` : w.col != null ? `COLUMN ${w.col}` : 'GENERAL'
    let group = byKey.get(key)
    if (!group) {
      group = { heading: key, items: [] }
      byKey.set(key, group)
      groups.push(group)
    }
    group.items.push(w)
  }
  return groups
})

// "Show Warnings" toggles the preview grid down to just the rows that have
// a warning attached, same as the real page's own filter button.
const warningRowIndexes = computed(() => {
  const indexes = new Set()
  for (const w of preview.value?.warnings || []) {
    if (w.row != null) indexes.add(w.row - 2)
  }
  return indexes
})
const displayedPreviewRows = computed(() => {
  const rows = preview.value?.data || []
  if (!showWarningsOnly.value) return rows
  return rows.filter((_, i) => warningRowIndexes.value.has(i))
})

function downloadTemplate() {
  if (!selectedDoctypeName.value) return
  downloadTemplateFile({ doctype: selectedDoctypeName.value, importType: importType.value })
}

async function onFileUploaded(file) {
  fileName.value = file.file_name
  fileUrl.value = file.file_url
}

async function loadPreview() {
  if (!canLoadPreview.value) return
  error.value = null
  loadingPreview.value = true
  try {
    const doc = await createDataImport({ doctype: selectedDoctypeName.value, importType: importType.value })
    dataImportName.value = doc.name

    // Must be persisted onto the doc (not just passed as a call argument
    // to get_preview_from_template below) - see setImportFile's own
    // comment for why skipping this makes the background import job fail
    // later with "Invalid template file for import" even though the
    // preview itself works fine either way.
    await setImportFile({ dataImport: doc.name, importFile: fileUrl.value })

    const previewData = await getPreview({ dataImport: doc.name, importFile: fileUrl.value })
    preview.value = previewData
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Could not load the preview. Please check the file and try again.'
  } finally {
    loadingPreview.value = false
  }
}

let unsubscribeProgress = null
let unsubscribeRefresh = null

async function runImport() {
  if (!dataImportName.value) return
  error.value = null
  starting.value = true
  progressPercent.value = 0
  progressMessage.value = 'Starting import...'

  unsubscribeProgress = onImportProgress((data) => {
    if (data?.data_import !== dataImportName.value) return
    progressPercent.value = Math.floor((data.current / data.total) * 100)
    progressMessage.value = data.skipping
      ? `Skipping already-imported row ${data.current} of ${data.total}...`
      : `Importing ${data.current} of ${data.total}${data.eta ? ` - about ${Math.ceil(data.eta)}s remaining` : ''}`
  })

  unsubscribeRefresh = onImportRefresh(async (data) => {
    if (data?.data_import !== dataImportName.value) return
    await finishImport()
  })

  try {
    const enqueued = await startImport(dataImportName.value)
    // form_start_import returns false (not an exception) when a job for
    // this exact Data Import doc is already enqueued/running - genuinely
    // rare for a freshly-created doc, but silently proceeding to show
    // "Importing..." with nothing actually queued is exactly how this
    // looked stuck at "Pending, 0 succeeded, 0 failed" forever with no
    // visible error at all.
    if (enqueued === false) {
      error.value = 'An import for this file is already running or queued. Please wait for it to finish.'
      return
    }
    importing.value = true
    // data_import_progress only fires for >5 total rows (confirmed from
    // Frappe's own source) - a tiny import produces ZERO progress events,
    // only the final data_import_refresh, so the bar would otherwise sit
    // frozen at 0% the whole time rather than reflecting "this is just
    // genuinely fast, not stuck."
    if ((preview.value?.total_number_of_rows || 0) <= 5) {
      progressPercent.value = 100
      progressMessage.value = 'Importing...'
    }
    startStuckImportWatchdog()
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Could not start the import. Please try again.'
  } finally {
    starting.value = false
  }
}

// Realtime events are the normal path, but a background job can fail to
// even start (queue/worker issue on the server) with no exception thrown
// back to this call at all - form_start_import only reports "did I
// successfully hand this off to a queue," not "did a worker ever actually
// pick it up and finish it." Confirmed live: a job can return enqueued=true
// and then never produce a single progress/refresh event, leaving the
// status stuck at "Pending" indefinitely with no on-screen indication
// anything is wrong. This polls get_import_status directly as a fallback
// so that case surfaces a real, visible error instead of silence.
let stuckImportTimer = null
const STUCK_IMPORT_TIMEOUT_MS = 30000

function startStuckImportWatchdog() {
  clearStuckImportWatchdog()
  stuckImportTimer = setTimeout(async () => {
    if (!importing.value) return
    try {
      const status = await getImportStatus(dataImportName.value)
      if (status?.status === 'Pending') {
        importing.value = false
        error.value = 'The import job did not start running. This usually means the background worker is not available - please try again, or contact an administrator if it keeps happening.'
      }
    } catch {
      // If even the status check fails, leave the existing UI state alone
      // rather than overwriting a more specific error with a vaguer one.
    }
  }, STUCK_IMPORT_TIMEOUT_MS)
}
function clearStuckImportWatchdog() {
  if (stuckImportTimer) {
    clearTimeout(stuckImportTimer)
    stuckImportTimer = null
  }
}

async function finishImport() {
  unsubscribeProgress?.()
  unsubscribeRefresh?.()
  clearStuckImportWatchdog()
  importing.value = false
  try {
    const [status, logRows] = await Promise.all([
      getImportStatus(dataImportName.value),
      getImportLogs(dataImportName.value),
    ])
    result.value = status
    logs.value = logRows || []
    loadRecentImports()
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Import finished, but the results could not be loaded.'
  }
}

async function cancelImport() {
  if (!dataImportName.value) return
  clearStuckImportWatchdog()
  try {
    await stopImport(dataImportName.value)
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Could not cancel the import.'
  }
}

function formatRowIndexes(raw) {
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.join(', ') : raw
  } catch {
    return raw
  }
}

function formatMessages(raw) {
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.map((m) => m.message || m.title || '').join('; ') : raw
  } catch {
    return raw
  }
}

function reset() {
  selectedDoctype.value = null
  importType.value = 'Insert New Records'
  fileName.value = ''
  fileUrl.value = ''
  dataImportName.value = ''
  preview.value = null
  result.value = null
  logs.value = []
  error.value = null
  importing.value = false
  showMapColumns.value = false
  showWarningsOnly.value = false
  // Back to the list, not straight into a fresh Config form - startNewImport
  // immediately overrides this to false right after calling reset(), so
  // this only actually takes effect for "Cancel"/"Import Another File",
  // where returning to the list is the right outcome.
  showList.value = true
  unsubscribeProgress?.()
  unsubscribeRefresh?.()
  clearStuckImportWatchdog()
}

onBeforeUnmount(() => {
  unsubscribeProgress?.()
  unsubscribeRefresh?.()
  clearStuckImportWatchdog()
})
</script>
