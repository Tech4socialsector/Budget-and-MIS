<!--
  Upload side of Budget Import Template - the counterpart to
  pages/BudgetImportTemplate.vue (which generates/downloads the .xlsx).
  Net-new feature: no prior upload/import UI existed anywhere in this app.

  Deliberately styled after Frappe's own Data Import tool (Desk doctype
  "Data Import", /app/data-import) - confirmed by reading its actual source
  (data_import.js, import_preview.js) rather than assuming a wizard/stepper
  exists: it's ONE scrollable page with progressively-revealed sections
  (Import File -> Preview, with column-validity shown as colored indicator
  dots - green=recognized, red=problem - plus an inline progress bar during
  the run and a results log table with per-row Success/Failure status),
  not a multi-step wizard. This page mirrors that same section layout and
  indicator-dot convention.

  It deliberately does NOT reuse Frappe's actual Data Import ENGINE
  underneath (frappe.core.doctype.data_import) - that tool can only match
  an existing record to update by its own Frappe document `name` (or an
  autoname field), never by a business key. Finance Budget's real identity
  is (set_id/Unit, cost_center, location_code, financial_year), with
  Finance Budget Amounts child rows keyed by type_of_expense_id - neither
  of which Data Import's matching model can express. Using it as-is would
  mean hand-resolving every row to a document name before even handing the
  file to Data Import, i.e. writing 100% of the same matching logic
  api_1/budget_import.py already does, for no engine benefit. So the LOOK
  matches Data Import; the WRITE logic underneath is our own preview_budget
  _import/commit_budget_import, which already does the right matching.

  Two backend calls, matching Data Import's own two-phase shape (preview
  pass, then a real import run): preview_budget_import parses + validates
  only (zero writes) - rows show up in the preview grid with a status dot
  per row, exactly like Data Import's own green/red column indicators, just
  applied per-row here since our columns are fixed/known rather than
  user-mapped. commit_budget_import re-parses and actually writes.
-->
<template>
  <AppLayout>
    <div class="flex flex-col gap-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Budget Import</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload a filled-in Budget Import Template to create or update Finance Budget records.
          </p>
        </div>
        <span
          v-if="stageLabel"
          class="flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          :class="stageBadgeClass"
        >
          <span class="h-1.5 w-1.5 flex-shrink-0 rounded-full" :class="stageDotClass" />
          {{ stageLabel }}
        </span>
      </div>

      <!-- Section: Import File -->
      <div class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Import File</h2>
        </div>
        <div class="p-4">
          <div v-if="!fileName" class="flex items-center gap-3">
            <FileUploader :upload-args="{ private: true }" @success="onFileUploaded">
              <template #default="{ openFileSelector, uploading, progress }">
                <Button variant="subtle" theme="gray" :loading="uploading" @click="openFileSelector">
                  <template #prefix><FeatherIcon name="paperclip" class="h-4 w-4" /></template>
                  {{ uploading ? `Uploading ${progress}%` : 'Attach File' }}
                </Button>
              </template>
            </FileUploader>
            <span class="text-xs text-gray-500 dark:text-gray-400">.xlsx only</span>
          </div>
          <div v-else class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <FeatherIcon name="file-text" class="h-4 w-4 flex-shrink-0 text-gray-400" />
              {{ fileName }}
            </div>
            <Button variant="subtle" theme="gray" size="sm" @click="reset">
              <template #prefix><FeatherIcon name="refresh-cw" class="h-3.5 w-3.5" /></template>
              Choose a different file
            </Button>
          </div>
          <ErrorMessage v-if="error && !preview" :message="error" class="mt-3" />
        </div>
      </div>

      <!-- Section: Preview (only once a file is attached and checked) -->
      <div v-if="checkingPreview" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <AppLoader label="Reading and validating file..." />
      </div>

      <template v-else-if="preview">
        <div class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Preview</h2>
            <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span><span class="font-medium text-gray-700 dark:text-gray-300">{{ preview.total_rows }}</span> rows in file</span>
              <span><span class="font-medium text-gray-700 dark:text-gray-300">{{ preview.finance_budgets_to_create }}</span> to create</span>
              <span><span class="font-medium text-gray-700 dark:text-gray-300">{{ preview.finance_budgets_to_update }}</span> to update</span>
              <span><span class="font-medium text-gray-700 dark:text-gray-300">{{ formatTotal(preview.total_amount) }}</span> total amount</span>
            </div>
          </div>

          <!-- Preview grid: one status-indicator column (Data Import's own
          green/red column-header convention, applied per row here since
          our template's columns are fixed/known rather than user-mapped) -->
          <div class="fc-scroll-wrapper fc-scroll-wrapper-tall">
            <table class="fc-table w-full min-w-[900px] text-sm">
              <thead>
                <tr class="fc-thead-main">
                  <th class="fc-th w-10 text-center">Sr.</th>
                  <th class="fc-th w-10"></th>
                  <th class="fc-th text-left">Unit</th>
                  <th class="fc-th text-left">Cost Center</th>
                  <th class="fc-th text-left">Location Code</th>
                  <th class="fc-th text-left">Financial Year</th>
                  <th class="fc-th text-left">Type of Expense</th>
                  <th class="fc-th text-right">Year Total</th>
                  <th class="fc-th text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in previewRows" :key="i" :class="row._ok ? '' : 'bg-red-50/60 dark:bg-red-950/20'">
                  <td class="fc-td text-center text-gray-400">{{ row.excel_row }}</td>
                  <td class="fc-td text-center">
                    <span class="inline-block h-2 w-2 rounded-full" :class="row._ok ? 'bg-green-500' : 'bg-red-500'" />
                  </td>
                  <td class="fc-td text-left">{{ row.unit }}</td>
                  <td class="fc-td text-left">{{ row.cost_center }}</td>
                  <td class="fc-td text-left">{{ row.location_code }}</td>
                  <td class="fc-td text-left">{{ row.financial_year }}</td>
                  <td class="fc-td text-left">{{ row.type_of_expense_id }}</td>
                  <td class="fc-td text-right">{{ row._ok ? formatTotal(rowTotal(row)) : '—' }}</td>
                  <td class="fc-td text-left">
                    <span v-if="row._ok" class="text-green-700 dark:text-green-400">OK</span>
                    <span v-else class="text-red-700 dark:text-red-400">{{ row._error }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section: Import File Errors and Warnings - only when there are any,
        matching Data Import's own conditional warnings section. -->
        <div v-if="preview.error_count" class="rounded-lg border border-red-200 bg-white dark:border-red-900 dark:bg-gray-900">
          <div class="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
            <FeatherIcon name="alert-triangle" class="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
            <h2 class="text-sm font-semibold text-red-800 dark:text-red-300">
              {{ preview.error_count }} row{{ preview.error_count === 1 ? '' : 's' }} could not be validated
            </h2>
          </div>
          <div class="p-4 text-xs text-gray-500 dark:text-gray-400">
            Fix these in the file and upload again - import is blocked until every row is valid.
          </div>
        </div>

        <!-- Section: Import progress (inline, replacing the action button
        area while running - matches Data Import's own inline dashboard
        progress area rather than a separate screen). commit_budget_import
        is one synchronous call with no real progress signal to report, so
        this shows an indeterminate loader rather than a fake percentage -
        Data Import's own bar only moves because it's driven by real
        realtime progress events from a background job, which this
        single-request commit doesn't have. -->
        <div v-if="importing" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <AppLoader label="Importing..." variant="build" />
        </div>

        <!-- Section: Import Log (post-commit results, matching Data
        Import's own results table) -->
        <div v-if="result" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <FeatherIcon name="check-circle" class="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
            <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Import Log</h2>
          </div>
          <div class="p-4 text-sm text-gray-700 dark:text-gray-300">
            Successfully imported {{ result.rows_imported }} row{{ result.rows_imported === 1 ? '' : 's' }} -
            {{ result.finance_budgets_created }} Finance Budget record{{ result.finance_budgets_created === 1 ? '' : 's' }} created,
            {{ result.finance_budgets_updated }} updated.
          </div>
        </div>

        <ErrorMessage v-if="error" :message="error" />

        <!-- Primary action - matches Data Import's own page-level primary
        button whose label changes with state (Save -> Start Import ->
        Retry), kept inline here instead of in the page header. -->
        <div class="flex justify-end gap-2">
          <Button variant="subtle" theme="gray" @click="reset">Cancel</Button>
          <Button
            variant="solid"
            theme="blue"
            :disabled="!!preview.errors.length"
            :loading="importing"
            @click="confirmImport"
          >
            <template #prefix><FeatherIcon name="play" class="h-4 w-4" /></template>
            {{ result ? 'Import Again' : 'Start Import' }}
          </Button>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Button, FeatherIcon, FileUploader, ErrorMessage } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'

setPageTitle('Budget Import')

const fileName = ref('')
const uploadedFileUrl = ref('')
const preview = ref(null)
const result = ref(null)
const error = ref(null)
const checkingPreview = ref(false)
const importing = ref(false)

// Matches Data Import's own page-status badge (Pending/In Progress/
// Partial Success/Success/Error), shown next to the page title.
const stageLabel = computed(() => {
  if (importing.value) return 'In Progress'
  if (result.value) return 'Success'
  if (preview.value?.error_count) return 'Pending'
  if (preview.value) return 'Pending'
  return ''
})
const stageBadgeClass = computed(() => ({
  'In Progress': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  Success: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  Pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
}[stageLabel.value] || ''))
const stageDotClass = computed(() => ({
  'In Progress': 'bg-amber-500',
  Success: 'bg-green-500',
  Pending: 'bg-gray-400',
}[stageLabel.value] || ''))

// Preview rows merged with their errors (if any) into one list, in
// original file order, each carrying its own _ok/_error - matches Data
// Import's per-row status in its results log, just shown pre-import here
// since our preview already does full validation.
const previewRows = computed(() => {
  if (!preview.value) return []
  const errorsByRow = new Map(preview.value.errors.map((e) => [e.excel_row, e.message]))
  const okRows = preview.value.rows.map((r) => ({ ...r, _ok: true }))
  const errorRows = [...errorsByRow.entries()].map(([excel_row, message]) => ({
    excel_row, _ok: false, _error: message,
  }))
  return [...okRows, ...errorRows].sort((a, b) => a.excel_row - b.excel_row)
})

async function onFileUploaded(file) {
  fileName.value = file.file_name
  uploadedFileUrl.value = file.file_url
  error.value = null
  preview.value = null
  result.value = null
  checkingPreview.value = true
  try {
    const message = await call('budget_mis.api_1.budget_import.preview_budget_import', {
      file_url: file.file_url,
    })
    if (message?.status !== 'success') {
      error.value = message?.error || 'Could not read this file. Please check it and try again.'
      return
    }
    preview.value = message
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Could not read this file. Please check it and try again.'
  } finally {
    checkingPreview.value = false
  }
}

async function confirmImport() {
  if (!uploadedFileUrl.value) return
  error.value = null
  importing.value = true
  try {
    const message = await call('budget_mis.api_1.budget_import.commit_budget_import', {
      file_url: uploadedFileUrl.value,
    })
    if (message?.status !== 'success') {
      error.value = message?.error || 'Import failed. Please try again.'
      return
    }
    result.value = message
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Import failed. Please try again.'
  } finally {
    importing.value = false
  }
}

function reset() {
  fileName.value = ''
  uploadedFileUrl.value = ''
  preview.value = null
  result.value = null
  error.value = null
}

function rowTotal(row) {
  return Object.values(row.months || {}).reduce((sum, v) => sum + (v || 0), 0)
}

function formatTotal(v) {
  return (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}
</script>
