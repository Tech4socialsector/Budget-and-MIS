<!--
  Upload side of Budget Import Template - the counterpart to
  pages/BudgetImportTemplate.vue (which generates/downloads the .xlsx).
  Net-new feature: no prior upload/import UI existed anywhere in this app.

  Upload step styled after Frappe's current (v16) Data Import tool: a
  bordered dropzone with drag-and-drop, a cloud-upload icon, and file-type/
  size hint text. The preview grid uses frappe-ui's own ListView primitives
  (the same ones this app's DoctypeList.vue is built on) instead of a
  hand-rolled <table> or a separate charting/grid library - same sticky
  header, row hover and column layout as every other list in this app,
  with zero doctype/meta machinery pulled in (DoctypeList.vue's own
  meta-driven fetch/filter/sort layer doesn't apply - these are plain
  in-memory parsed rows, not Frappe documents). Start Import lives in the
  page's own top action bar (always visible, no scrolling to the bottom
  needed) alongside a 2-step indicator for this page's real two phases.

  It deliberately does NOT reuse Frappe's actual Data Import ENGINE
  underneath (frappe.core.doctype.data_import) - that tool can only match
  an existing record to update by its own Frappe document `name` (or an
  autoname field), never by a business key. Finance Budget's real identity
  is (set_id/Unit, cost_center, location_code, financial_year), with
  Finance Budget Amounts child rows keyed by type_of_expense_id - neither
  of which Data Import's matching model can express. Using it as-is would
  mean hand-resolving every row to a document name before even handing the
  file to Data Import, i.e. writing 100% of the same matching logic
  api/budget_import.py already does, for no engine benefit. So the LOOK
  matches Data Import; the WRITE logic underneath is our own preview_budget
  _import/commit_budget_import, which already does the right matching.

  Two backend calls, matching Data Import's own two-phase shape (preview
  pass, then a real import run): preview_budget_import parses + validates
  only (zero writes) - rows show up in the preview grid with a status
  indicator per row. commit_budget_import re-parses and actually writes.
-->
<template>
  <AppLayout>
    <div class="flex flex-col gap-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Budget Import</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload a filled-in Budget Import Template to create or update Finance Budget records.
          </p>
        </div>

        <!-- Top action bar: a 2-step indicator for this page's real phases
        (Upload, then Preview & Import) plus the primary action, always
        visible here rather than requiring a scroll to the bottom of a long
        preview table to find Start Import. -->
        <div class="flex flex-shrink-0 items-center gap-4">
          <ol class="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
            <li class="flex items-center gap-1.5" :class="step >= 1 ? 'text-gray-900 dark:text-gray-100' : ''">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-full text-[0.6875rem]"
                :class="step >= 1 ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'"
              >1</span>
              Upload
            </li>
            <li class="h-px w-5 bg-gray-200 dark:bg-gray-700" />
            <li class="flex items-center gap-1.5" :class="step >= 2 ? 'text-gray-900 dark:text-gray-100' : ''">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-full text-[0.6875rem]"
                :class="step >= 2 ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'"
              >2</span>
              Preview &amp; Import
            </li>
          </ol>

          <Button
            v-if="preview"
            variant="solid"
            theme="gray"
            :disabled="!!preview.errors.length"
            :loading="importing"
            @click="confirmImport"
          >
            <template #prefix><FeatherIcon name="play" class="h-4 w-4" /></template>
            {{ result ? 'Import Again' : 'Start Import' }}
          </Button>
        </div>
      </div>

      <!-- Section: Import File - a dropzone (Frappe v16 Data Import's own
      upload-step look) when nothing's attached yet, a plain attached-file
      row once something is. -->
      <div class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Upload file</h2>
        </div>
        <div class="p-4">
          <FileUploader ref="fileUploaderRef" :upload-args="{ private: true }" :validate-file="validateFile" @success="onFileUploaded">
            <template #default="{ openFileSelector, uploading, progress }">
              <div
                v-if="!fileName"
                class="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors"
                :class="isDragOver ? 'border-gray-400 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/60' : 'border-gray-200 dark:border-gray-700'"
                @click="openFileSelector"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="(e) => { isDragOver = false; onFileDrop(e) }"
              >
                <template v-if="uploading">
                  <FeatherIcon name="loader" class="h-6 w-6 animate-spin text-gray-400" />
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading {{ progress }}%</p>
                </template>
                <template v-else>
                  <FeatherIcon name="upload-cloud" class="h-6 w-6 text-gray-400" />
                  <p class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    Drag an Excel file here, or <span class="text-blue-600 dark:text-blue-400">click to browse</span>
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500">.xlsx up to 10 MB</p>
                </template>
              </div>
            </template>
          </FileUploader>
          <div v-if="fileName" class="flex items-center justify-between gap-3">
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

          <!-- Preview: a tree - one expandable PARENT row per real Finance
          Budget identity (Unit+Cost Center+Location+Financial Year,
          exactly the key commit_budget_import groups by), carrying every
          one of Finance Budget's own real parent fields (Unit/Cost
          Center/Location descriptions and ERP codes, State, Uploaded By -
          not just the bare codes); expanding it reveals its own Finance
          Budget Amounts CHILD rows, one per Type of Expense, each with its
          own Head/Sub Head, 12 monthly amounts, and Quarter/Year totals -
          Finance Budget's real parent/child shape, not an arbitrary
          grouping. A hand-built table (not ListView) since a child row
          alone is ~19 columns wide - .fc-scroll-wrapper's own horizontal
          scroll (already used by every other wide table in this app, e.g.
          BudgetActualsBreakdown.vue) handles that better than forcing it
          through a column-grid component built for flat lists. -->
          <div class="fc-scroll-wrapper fc-scroll-wrapper-tall">
            <table class="fc-table w-full min-w-[1600px] text-sm">
              <thead>
                <tr class="fc-thead-main">
                  <th class="fc-th w-6"></th>
                  <th class="fc-th text-left">Entity / Unit</th>
                  <th class="fc-th text-left">Entity / Unit Description</th>
                  <th class="fc-th text-left">Cost Center</th>
                  <th class="fc-th text-left">Cost Center (Original)</th>
                  <th class="fc-th text-left">Cost Center Description</th>
                  <th class="fc-th text-left">Location Code</th>
                  <th class="fc-th text-left">Location Code (Original)</th>
                  <th class="fc-th text-left">Location Description</th>
                  <th class="fc-th text-left">State</th>
                  <th class="fc-th text-left">Financial Year</th>
                  <th class="fc-th text-left">Uploaded By</th>
                  <th class="fc-th text-right">Year Total</th>
                  <th class="fc-th text-left">Import Type</th>
                  <th class="fc-th text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="!previewGroups.length">
                  <tr><td class="fc-td text-center text-gray-400" colspan="15">No rows to preview.</td></tr>
                </template>
                <template v-for="group in previewGroups" :key="group.group">
                  <!-- Parent row (Finance Budget) -->
                  <tr class="fc-row-head cursor-pointer" @click="toggleGroup(group.group)">
                    <td class="fc-td text-center">
                      <FeatherIcon :name="isGroupOpen(group.group) ? 'chevron-down' : 'chevron-right'" class="h-3.5 w-3.5" />
                    </td>
                    <td class="fc-td text-left">{{ group.unit }}</td>
                    <td class="fc-td text-left">{{ group.unit_description || '—' }}</td>
                    <td class="fc-td text-left">{{ group.cost_center }}</td>
                    <td class="fc-td text-left">{{ group.cost_center_erp || '—' }}</td>
                    <td class="fc-td text-left">{{ group.cost_center_description || '—' }}</td>
                    <td class="fc-td text-left">{{ group.location_code }}</td>
                    <td class="fc-td text-left">{{ group.location_code_erp || '—' }}</td>
                    <td class="fc-td text-left">{{ group.location_description || '—' }}</td>
                    <td class="fc-td text-left">{{ group.state || '—' }}</td>
                    <td class="fc-td text-left">{{ group.financial_year }}</td>
                    <td class="fc-td text-left">{{ group.uploaded_by || '—' }}</td>
                    <td class="fc-td text-right">{{ group.yearTotalLabel }}</td>
                    <td class="fc-td text-left">
                      <span
                        v-if="group.importType"
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium"
                        :class="group.importType === 'new'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
                      >{{ group.importType === 'new' ? 'New' : 'Update' }}</span>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                    <td class="fc-td text-left">
                      <span class="inline-flex items-center gap-1.5">
                        <span class="h-2 w-2 flex-shrink-0 rounded-full" :class="group.allOk ? 'bg-green-500' : 'bg-red-500'" />
                        <span :class="group.allOk ? '' : 'text-red-700 dark:text-red-400'">{{ group.allOk ? 'OK' : `${group.errorCount} error${group.errorCount === 1 ? '' : 's'}` }}</span>
                      </span>
                    </td>
                  </tr>

                  <!-- Child rows (Finance Budget Amounts), one per Type of
                  Expense - a nested mini-table of its own 19 columns
                  (Type of Expense ID/Head/Sub Head/Type + 12 months +
                  Q1-4 + Year), indented under its parent. -->
                  <tr v-if="isGroupOpen(group.group)">
                    <td class="fc-td p-0" colspan="15">
                      <table class="fc-table w-full min-w-[1800px] text-sm">
                        <thead>
                          <tr class="fc-thead-main">
                            <th class="fc-th w-6"></th>
                            <th class="fc-th text-left">Type of Expense ID</th>
                            <th class="fc-th text-left">Head of Expense</th>
                            <th class="fc-th text-left">Sub Head of Expense</th>
                            <th class="fc-th text-left">Type of Expense</th>
                            <th v-for="m in MONTH_LABELS" :key="m" class="fc-th text-right">{{ m }}</th>
                            <th class="fc-th text-right">Q1</th>
                            <th class="fc-th text-right">Q2</th>
                            <th class="fc-th text-right">Q3</th>
                            <th class="fc-th text-right">Q4</th>
                            <th class="fc-th text-right">Year Total</th>
                            <th class="fc-th text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="row in group.rows" :key="row._key" :class="row._ok ? '' : 'bg-red-50/60 dark:bg-red-950/20'">
                            <td class="fc-td"></td>
                            <td class="fc-td text-left">{{ row.type_of_expense_id }}</td>
                            <td class="fc-td text-left">{{ row.head_of_expense || '—' }}</td>
                            <td class="fc-td text-left">{{ row.sub_head_of_expense || '—' }}</td>
                            <td class="fc-td text-left">{{ row.type_of_expense || '—' }}</td>
                            <td v-for="m in MONTH_COLUMNS" :key="m" class="fc-td text-right">{{ row._ok ? formatTotal(row.months[m]) : '—' }}</td>
                            <td class="fc-td text-right">{{ row._ok ? formatTotal(quarterTotal(row, 0)) : '—' }}</td>
                            <td class="fc-td text-right">{{ row._ok ? formatTotal(quarterTotal(row, 1)) : '—' }}</td>
                            <td class="fc-td text-right">{{ row._ok ? formatTotal(quarterTotal(row, 2)) : '—' }}</td>
                            <td class="fc-td text-right">{{ row._ok ? formatTotal(quarterTotal(row, 3)) : '—' }}</td>
                            <td class="fc-td text-right">{{ row._ok ? formatTotal(rowTotal(row)) : '—' }}</td>
                            <td class="fc-td text-left">
                              <span v-if="row._ok" class="text-green-700 dark:text-green-400">OK</span>
                              <span v-else class="text-red-700 dark:text-red-400">{{ row._error }}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </template>
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
        this shows an indeterminate loader rather than a fake percentage. -->
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

          <!-- Per-group new-vs-update breakdown (same import_type tagging
          as the preview table above), so a user can see exactly which
          Unit/Cost Center/Location/Financial Year combinations were newly
          created vs which existing ones were touched, not just the
          aggregate counts above. -->
          <div v-if="result.groups?.length" class="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
            <div class="fc-scroll-wrapper">
              <table class="fc-table w-full text-sm">
                <thead>
                  <tr class="fc-thead-main">
                    <th class="fc-th text-left">Type</th>
                    <th class="fc-th text-left">Unit</th>
                    <th class="fc-th text-left">Cost Center</th>
                    <th class="fc-th text-left">Location Code</th>
                    <th class="fc-th text-left">Financial Year</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="g in result.groups" :key="`${g.unit}::${g.cost_center}::${g.location_code}::${g.financial_year}`">
                    <td class="fc-td text-left">
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium"
                        :class="g.import_type === 'new'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
                      >{{ g.import_type === 'new' ? 'New' : 'Update' }}</span>
                    </td>
                    <td class="fc-td text-left">{{ g.unit }}</td>
                    <td class="fc-td text-left">{{ g.cost_center }}</td>
                    <td class="fc-td text-left">{{ g.location_code }}</td>
                    <td class="fc-td text-left">{{ g.financial_year }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <ErrorMessage v-if="error" :message="error" />
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Button, ErrorMessage, FeatherIcon, FileUploader } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'

setPageTitle('Budget Import')

const fileUploaderRef = ref(null)
const isDragOver = ref(false)

function validateFile(file) {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    return 'Only .xlsx files are supported.'
  }
}

// Drag-and-drop onto the dropzone: FileUploader itself only wires up its
// own hidden <input type="file">'s change event (see onFileAdd in that
// component), so a dropped file is handed to that same input via a
// DataTransfer - the standard way to feed a native file input
// programmatically - then a 'change' event is dispatched to trigger
// FileUploader's existing upload flow exactly as if the user had browsed
// for the file, instead of duplicating its upload/validation logic here.
function onFileDrop(e) {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  const input = fileUploaderRef.value?.inputRef?.()
  if (!input) return
  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(file)
  input.files = dataTransfer.files
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const fileName = ref('')
const uploadedFileUrl = ref('')
const preview = ref(null)
const result = ref(null)
const error = ref(null)
const checkingPreview = ref(false)
const importing = ref(false)

// Drives the top action bar's step indicator - step 1 (Upload) until a
// file has been read and validated into a preview, step 2 (Preview &
// Import) from then on, including after a successful import (the page
// stays on step 2 rather than resetting, since Import Again re-runs the
// same already-previewed file).
const step = computed(() => (preview.value ? 2 : 1))

// Preview rows merged with their errors (if any) into one list, in
// original file order, each carrying its own _ok/_error - matches Data
// Import's per-row status in its results log, just shown pre-import here
// since our preview already does full validation. _key is ListView's
// required rowKey - excel_row is already unique per file.
const previewRows = computed(() => {
  if (!preview.value) return []
  const errorsByRow = new Map(preview.value.errors.map((e) => [e.excel_row, e.message]))
  const okRows = preview.value.rows.map((r) => ({ ...r, _ok: true }))
  const errorRows = [...errorsByRow.entries()].map(([excel_row, message]) => ({
    excel_row, _ok: false, _error: message,
  }))
  return [...okRows, ...errorRows]
    .sort((a, b) => a.excel_row - b.excel_row)
    .map((row) => ({
      ...row,
      _key: row.excel_row,
      status: row._ok ? 'OK' : row._error,
      year_total: row._ok ? formatTotal(rowTotal(row)) : '—',
    }))
})

// Grouped into one entry per real Finance Budget PARENT identity
// (unit, cost_center, location_code, financial_year) - exactly the key
// commit_budget_import itself groups rows by to decide "one parent doc,
// reused or created" - carrying every one of Finance Budget's own real
// display fields (unit/cost-center/location descriptions and ERP codes,
// state, uploaded_by), not just the bare identity codes. Each group's own
// rows are its Type of Expense entries (Finance Budget Amounts, the real
// child doctype this maps onto). A row that failed validation before even
// reaching that point (e.g. a missing identity field) has no real parent
// to group under, so every such row becomes its own single-row "Rows with
// errors" group instead, kept separate from the real, groupable parents.
const previewGroups = computed(() => {
  const groups = new Map()
  const errorGroup = {
    group: 'Rows with errors', rows: [], allOk: false, errorCount: 0, yearTotalLabel: '—',
    unit: '—', unit_description: '', cost_center: '—', cost_center_erp: '', cost_center_description: '',
    location_code: '—', location_code_erp: '', location_description: '', state: '', financial_year: '—', uploaded_by: '',
  }
  for (const row of previewRows.value) {
    if (!row._ok) {
      errorGroup.rows.push(row)
      errorGroup.errorCount++
      continue
    }
    const key = [row.unit, row.cost_center, row.location_code, row.financial_year].join('::')
    if (!groups.has(key)) {
      groups.set(key, {
        group: key,
        unit: row.unit,
        unit_description: row.unit_description,
        cost_center: row.cost_center,
        cost_center_erp: row.cost_center_erp,
        cost_center_description: row.cost_center_description,
        location_code: row.location_code,
        location_code_erp: row.location_code_erp,
        location_description: row.location_description,
        state: row.state,
        financial_year: row.financial_year,
        uploaded_by: row.uploaded_by,
        // Every row in a group shares the same parent identity, so they
        // all carry the same import_type ('new' or 'update') from the
        // backend's own preview_budget_import - set once per group from
        // whichever row creates it.
        importType: row.import_type,
        rows: [],
        allOk: true,
        errorCount: 0,
        _total: 0,
      })
    }
    const g = groups.get(key)
    g.rows.push(row)
    g._total += rowTotal(row)
  }
  const result = [...groups.values()].map((g) => ({ ...g, yearTotalLabel: formatTotal(g._total) }))
  if (errorGroup.rows.length) result.push(errorGroup)
  return result
})

// Expand/collapse state per group, keyed by its own `group` key. Only the
// FIRST parent group starts open (showing the tree shape right away
// without a click) - every other group starts collapsed, since a real
// import file can have hundreds of parent groups and auto-expanding all of
// them is unreadable. toggledGroups tracks explicit user clicks as a
// flip from each key's own default (open for the first group, closed for
// every other), rather than tracking absolute open/closed state directly -
// that way the "first group defaults open" rule keeps working correctly
// even as previewGroups itself changes (e.g. a re-upload).
const toggledGroups = ref(new Set())
function isGroupOpen(key) {
  const isFirst = previewGroups.value[0]?.group === key
  return toggledGroups.value.has(key) ? !isFirst : isFirst
}
function toggleGroup(key) {
  const next = new Set(toggledGroups.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  toggledGroups.value = next
}

const MONTH_LABELS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
const MONTH_COLUMNS = ['april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'january', 'february', 'march']
const QUARTERS = [
  ['april', 'may', 'june'],
  ['july', 'august', 'september'],
  ['october', 'november', 'december'],
  ['january', 'february', 'march'],
]
function quarterTotal(row, quarterIndex) {
  return QUARTERS[quarterIndex].reduce((sum, m) => sum + (row.months[m] || 0), 0)
}

async function onFileUploaded(file) {
  fileName.value = file.file_name
  uploadedFileUrl.value = file.file_url
  error.value = null
  preview.value = null
  result.value = null
  toggledGroups.value = new Set()
  checkingPreview.value = true
  try {
    const message = await call('budget_mis.api.budget_import.preview_budget_import', {
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
    const message = await call('budget_mis.api.budget_import.commit_budget_import', {
      file_url: uploadedFileUrl.value,
    })
    if (message?.status !== 'success') {
      error.value = message?.error || 'Import failed. Please try again.'
      return
    }
    result.value = message
  } catch (e) {
    // "Failed to fetch" is the browser's own generic message for a request
    // that never completed at all (dropped connection, server restarting
    // mid-request, etc.) - never confirms the import one way or the other,
    // unlike a real error response from commit_budget_import itself (which
    // always comes back as a normal {status: 'failed', error} result, not
    // a thrown exception at all). Reword it so "try again" reads as "check
    // the Import Log/Finance Budget records before re-running" rather than
    // implying nothing happened, since a request can fail to return a
    // response even after the server-side write already succeeded.
    const isNetworkFailure = /failed to fetch|network/i.test(e?.message || '')
    error.value = isNetworkFailure
      ? 'Lost connection while importing - the import may or may not have completed. Check the Finance Budget list before re-running, to avoid a duplicate import.'
      : (e?.messages?.[0] || e?.message || 'Import failed. Please try again.')
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
  toggledGroups.value = new Set()
}

function rowTotal(row) {
  return Object.values(row.months || {}).reduce((sum, v) => sum + (v || 0), 0)
}

function formatTotal(v) {
  return (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}
</script>
