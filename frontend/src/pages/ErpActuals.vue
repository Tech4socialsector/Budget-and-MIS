<!--
  ERP Actuals page - Vue replica of the Desk page at
  budget_mis/main/page/erp_actuals/erp_actuals.js (all 633
  lines are live - no dead code to filter out, unlike Monthly MIS).

  Unlike every other page in this app, the Fetch trigger here is MANUAL
  (a button, not filter-change-reactive) - the underlying call hits a live
  PeopleSoft PROD endpoint and can take 1-3 minutes, so auto-firing it on
  every Financial Year/Month/API tweak would be actively harmful (the Desk
  page has the same manual-Fetch design for the same reason).

  No request-generation counter is needed here (unlike Foundation
  Consolidated / Monthly MIS's reactive-reload pages) because this page
  never fires two requests as a *result* of the same user action - but a
  second manual Fetch click while the first is still in flight follows the
  same DoS-your-own-request problem list from the brief: `call()` can't
  truly abort the in-flight fetch, so a `requestToken` guard still discards
  a stale response if the user changes filters and clicks Fetch again
  before the first one returns.
-->
<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <!-- Filters: same "plain grid rather than flex-wrap" convention as
      MonthlyMis.vue/BudgetSummary.vue - a fixed 5-column grid (2 on small,
      1 on mobile) with each field at a uniform w-full, rather than ad-hoc
      per-field pixel widths, so field width/height stays consistent and
      every filter row across the app lines up at the same column count
      regardless of how many fields that particular page actually has. -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">API</label>
          <Select
            :options="apiOptions"
            v-model="filters.apiLabel"
            class="w-full"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Financial Year</label>
          <MultiSelect
            v-model="financialYearSelection"
            :options="financialYearOptions"
            placeholder="Select year"
            class="w-full"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Month</label>
          <Select
            :options="monthOptions"
            v-model="filters.month"
            class="w-full"
          />
        </div>
        <div class="flex items-end">
          <Button variant="solid" theme="gray" :loading="loading" @click="fetchData">
            <template #prefix><FeatherIcon name="play" class="h-4 w-4" /></template>
            Fetch
          </Button>
        </div>
      </div>

      <!-- Patient loading state -->
      <div v-if="loading" class="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-10 dark:border-gray-800 dark:bg-gray-900">
        <AppLoader label="Fetching ERP actuals..." />
        <div class="text-xs text-gray-500 dark:text-gray-400">Elapsed: {{ elapsedLabel }}</div>
        <div v-if="elapsedSeconds > 60" class="max-w-md text-center text-xs text-amber-600 dark:text-amber-400">
          This is still working - live PeopleSoft queries can take up to 3 minutes. Please stay on this page.
        </div>
        <button class="text-xs text-fc-blue-mid underline" @click="cancelFetch">Cancel</button>
      </div>

      <ErrorMessage v-else-if="error" :message="error" />

      <div v-else-if="!hasFetched" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        Select an API, Financial Year and Month, then click Fetch.
      </div>

      <ErrorMessage v-else-if="statusFailed" :message="statusFailedMessage" />

      <template v-else>
        <!-- Summary strip -->
        <div class="flex flex-wrap items-center gap-7 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/60">
          <div><span class="font-semibold text-fc-blue-mid">Status:</span> {{ response?.status }}</div>
          <div><span class="font-semibold text-fc-blue-mid">Fiscal Year:</span> {{ response?.fiscal_year }}</div>
          <div><span class="font-semibold text-fc-blue-mid">Accounting Period:</span> {{ response?.accounting_period }}</div>
          <div><span class="font-semibold text-fc-blue-mid">Row Count:</span> {{ allRows.length }}</div>
          <Button variant="outline" theme="gray" size="sm" class="ml-auto" :loading="exporting" @click="exportExcel">
            <template #prefix><FeatherIcon name="download" class="h-4 w-4" /></template>
            Export to Excel
          </Button>
        </div>

        <div v-if="!allRows.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          No rows returned.
        </div>
        <template v-else>
          <div class="flex items-center justify-between gap-4">
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Showing {{ pagedRangeLabel }} of {{ visibleRows.length }} filtered rows ({{ allRows.length }} total)
            </div>
            <Button v-if="hasActiveFilters" variant="outline" theme="gray" size="sm" @click="clearAllFilters">
              <template #prefix><FeatherIcon name="x" class="h-3.5 w-3.5" /></template>
              Clear filters
            </Button>
          </div>

          <div class="fc-scroll-wrapper">
            <table class="fc-table w-full min-w-[1200px] text-sm">
              <thead>
                <tr class="fc-thead-main">
                  <th v-for="col in columns" :key="col" class="fc-th erp-th text-center">
                    <span class="mr-1 align-middle">{{ col }}</span>
                    <!-- frappe-ui's own default MultiSelect, same component
                    used for the Financial Year filter above - its model is
                    the array of currently-checked values for this column
                    (instant-apply per click, matching MultiSelect's own
                    native behavior everywhere else in the app, rather than
                    the previous custom dropdown's separate staged "Apply"
                    step). #trigger keeps the same compact filter-icon
                    chevron button instead of MultiSelect's own full
                    search-box trigger, which doesn't fit inline in a table
                    header - MultiSelect's own ComboboxAnchor (wrapping this
                    slot) already attaches its own @click="toggleOpen" to
                    the slot's root element, so the button here must NOT
                    call toggleOpen itself, or every click would toggle
                    twice (open then immediately close again). -->
                    <MultiSelect
                      class="inline-flex align-middle"
                      :model-value="activeFilters[col] || []"
                      :options="columnFilterOptions[col] || []"
                      @update:model-value="(vals) => applyFilter(col, vals)"
                    >
                      <template #trigger>
                        <button
                          type="button"
                          class="erp-filter-icon-btn"
                          :class="{ 'is-active': (activeFilters[col] || []).length > 0 }"
                          :aria-label="`Filter ${col}`"
                        >
                          <FeatherIcon name="chevron-down" class="h-3.5 w-3.5" />
                        </button>
                      </template>
                    </MultiSelect>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!visibleRows.length">
                  <td class="fc-td text-center text-gray-400" :colspan="columns.length">No rows match the current filter.</td>
                </tr>
                <tr v-for="(row, i) in pagedRows" :key="i">
                  <td v-for="col in columns" :key="col" class="fc-td text-right">{{ cellText(row, col) }}</td>
                </tr>
              </tbody>
              <tfoot v-if="hasAmountColumn">
                <tr class="fc-row-grand">
                  <td v-for="(col, i) in columns" :key="col" class="fc-td text-right">
                    <template v-if="col === 'posted_total_amt'">{{ formatTotal(visibleTotal) }}</template>
                    <template v-else-if="i === 0">Total</template>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div v-if="totalPages > 1" class="flex items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>Page {{ currentPage }} of {{ totalPages }}</div>
            <div class="flex items-center gap-2">
              <Button variant="outline" theme="gray" size="sm" :disabled="currentPage <= 1" @click="currentPage -= 1">
                <template #prefix><FeatherIcon name="chevron-left" class="h-3.5 w-3.5" /></template>
                Previous
              </Button>
              <Button variant="outline" theme="gray" size="sm" :disabled="currentPage >= totalPages" @click="currentPage += 1">
                Next
                <template #suffix><FeatherIcon name="chevron-right" class="h-3.5 w-3.5" /></template>
              </Button>
            </div>
          </div>
        </template>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { MultiSelect, Select, Button, FeatherIcon, ErrorMessage } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'
import { exportErpActualsExcel } from '@/data/erpActualsExport'

setPageTitle('ERP Actuals')

// -------------------------------------------------------------------------
// Filters
// -------------------------------------------------------------------------
const API_OPTIONS = {
  'ERP Actuals (YTD)': 'budget_mis.api.erp_actuals.fetch_actuals_ytd',
  'ERP Actuals (Month Wise)': 'budget_mis.api.erp_actuals.fetch_actuals_month_wise',
}
// April = accounting period 1 ... March = 12 - matches
// budget_mis.api.actual_format.get_accounting_period_from_month, and
// confirmed verbatim against erp_actuals.js lines 74-87.
const MONTH_TO_PERIOD = {
  April: 1, May: 2, June: 3, July: 4, August: 5, September: 6,
  October: 7, November: 8, December: 9, January: 10, February: 11, March: 12,
}
const MONTHS = Object.keys(MONTH_TO_PERIOD)

const apiOptions = Object.keys(API_OPTIONS).map((label) => ({ label, value: label }))
const monthOptions = MONTHS.map((m) => ({ label: m, value: m }))

const filters = reactive({
  apiLabel: apiOptions[0].value,
  financialYear: '',
  month: '',
})
const financialYearOptions = ref([])
const financialYearSelection = computed({
  get: () => (filters.financialYear ? [filters.financialYear] : []),
  set: (values) => {
    filters.financialYear = values.length ? values[values.length - 1] : ''
  },
})

async function loadFinancialYears() {
  const rows = await call('budget_mis.api.filter_options.get_financial_year_list')
  financialYearOptions.value = (rows || []).map((r) => ({ label: r.financial_year, value: r.financial_year }))
  if (!filters.financialYear && financialYearOptions.value.length) {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const cur = (m >= 4 ? y : y - 1) + '-' + String(m >= 4 ? y + 1 : y).slice(-2)
    const match = financialYearOptions.value.find((o) => o.value === cur)
    filters.financialYear = match ? match.value : financialYearOptions.value[0].value
  }
  if (!filters.month) filters.month = 'March'
}

// -------------------------------------------------------------------------
// Fetch (manual trigger) - patient loading state with an elapsed-seconds
// ticker and a "still working" reassurance past 60s, matching the Desk
// page's intent (a 120s "stuck" warning that does NOT cancel the
// underlying call) without a hard client-side abort. Cancel just stops
// showing the loading UI - a stale response landing after Cancel is
// dropped via requestToken, since frappe-ui's call() (a plain fetch())
// can't truly abort an in-flight request.
// -------------------------------------------------------------------------
const loading = ref(false)
const error = ref(null)
const response = ref(null)
const hasFetched = ref(false)
const elapsedSeconds = ref(0)
let elapsedTimer = null
let requestToken = 0

const elapsedLabel = computed(() => {
  const s = elapsedSeconds.value
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m}m ${r}s` : `${r}s`
})

function startElapsedTimer() {
  elapsedSeconds.value = 0
  stopElapsedTimer()
  elapsedTimer = setInterval(() => { elapsedSeconds.value += 1 }, 1000)
}
function stopElapsedTimer() {
  if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }
}
onBeforeUnmount(stopElapsedTimer)

async function fetchData() {
  const apiLabel = filters.apiLabel
  const method = API_OPTIONS[apiLabel]
  const fy = filters.financialYear
  const month = filters.month
  if (!method || !fy || !month) return

  const fiscalYear = parseInt(fy.split('-')[0], 10)
  const accountingPeriod = MONTH_TO_PERIOD[month]
  const token = ++requestToken

  loading.value = true
  error.value = null
  startElapsedTimer()
  try {
    const message = await call(method, { fiscal_year: fiscalYear, accounting_period: accountingPeriod })
    if (token !== requestToken) return // cancelled or superseded
    response.value = message
    hasFetched.value = true
    if (message?.status === 'success') {
      setRows(message.data || [])
      lastQuery.value = { fiscalYear: message.fiscal_year ?? fiscalYear, accountingPeriod: message.accounting_period ?? accountingPeriod }
    } else {
      setRows([])
      lastQuery.value = null
    }
  } catch (e) {
    if (token !== requestToken) return
    error.value = e?.messages?.[0] || e?.message || 'Request failed. Check the Error Log for details.'
    hasFetched.value = true
    response.value = null
    setRows([])
    lastQuery.value = null
  } finally {
    if (token === requestToken) {
      loading.value = false
      stopElapsedTimer()
    }
  }
}

function cancelFetch() {
  // Invalidate the in-flight request's token so its eventual resolution
  // (success or error) is ignored, and stop showing the loading UI now.
  requestToken++
  loading.value = false
  stopElapsedTimer()
}

const statusFailed = computed(() => hasFetched.value && response.value && response.value.status !== 'success')
const statusFailedMessage = computed(() => {
  const status = `Status: ${response.value?.status || 'failed'}`
  return response.value?.error ? `${status} — ${response.value.error}` : status
})

// -------------------------------------------------------------------------
// Rows / columns / cell rendering - mirrors truthy()/cell_text() exactly.
// -------------------------------------------------------------------------
const HIDDEN_COLUMNS = ['fiscal_year']
const allRows = ref([])
const columns = ref([])
const lastQuery = ref(null)

function setRows(rows) {
  allRows.value = rows || []
  const seen = new Set()
  const cols = []
  for (const row of allRows.value) {
    for (const k of Object.keys(row || {})) {
      if (!HIDDEN_COLUMNS.includes(k) && !seen.has(k)) { seen.add(k); cols.push(k) }
    }
  }
  columns.value = cols
  for (const k of Object.keys(activeFilters)) delete activeFilters[k]
}

function truthy(value) {
  if (value === null || value === undefined) return false
  const s = String(value).trim().toLowerCase()
  return s === '1' || s === 'true' || s === 'yes'
}
function cellText(row, col) {
  const value = row[col]
  if (col === 'is_adjustment') return truthy(value) ? 'True' : 'False'
  return value === null || value === undefined ? '' : String(value)
}

const hasAmountColumn = computed(() => columns.value.includes('posted_total_amt'))

// -------------------------------------------------------------------------
// Column filters - column -> array of checked values (MultiSelect's own
// v-model shape), empty array/absent = no filter. columnFilterOptions is
// always computed off the FULL unfiltered row set so the option list stays
// stable while other columns are filtered.
// -------------------------------------------------------------------------
const activeFilters = reactive({})

const columnFilterOptions = computed(() => {
  const out = {}
  for (const col of columns.value) {
    const seen = new Set()
    for (const row of allRows.value) seen.add(cellText(row, col))
    out[col] = Array.from(seen)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((v) => ({ label: v === '' ? '(blank)' : v, value: v }))
  }
  return out
})

function applyFilter(col, values) {
  if (!values || !values.length) delete activeFilters[col]
  else activeFilters[col] = values
}

const hasActiveFilters = computed(() => Object.keys(activeFilters).length > 0)
function clearAllFilters() {
  for (const k of Object.keys(activeFilters)) delete activeFilters[k]
}

const visibleRows = computed(() =>
  allRows.value.filter((row) => columns.value.every((c) => !activeFilters[c] || activeFilters[c].includes(cellText(row, c)))),
)

const visibleTotal = computed(() => visibleRows.value.reduce((sum, row) => sum + (parseFloat(row.posted_total_amt) || 0), 0))

// -------------------------------------------------------------------------
// Client-side pagination of the render only - a live PeopleSoft fetch can
// return 30k+ rows in one response, and rendering every one of them as a
// real <tr> (ERP Actuals has no server-side "Load More" the way
// DoctypeList.vue does - the whole result already arrived in a single
// blocking call) froze the tab entirely ("Page Unresponsive"). visibleRows/
// visibleTotal above still reflect the FULL filtered set (the footer total
// must sum every matching row, not just the current page) - only the
// <tbody> itself reads from pagedRows.
// -------------------------------------------------------------------------
const PAGE_SIZE = 100
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(visibleRows.value.length / PAGE_SIZE)))
const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return visibleRows.value.slice(start, start + PAGE_SIZE)
})
// A filter change can shrink the result below the page the user was on
// (e.g. on page 5 of 400 rows, then a filter narrows it to 40 rows total) -
// clamp back to the last valid page instead of showing an empty table.
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})
watch(activeFilters, () => { currentPage.value = 1 }, { deep: true })

const pagedRangeLabel = computed(() => {
  if (!visibleRows.value.length) return '0'
  const start = (currentPage.value - 1) * PAGE_SIZE + 1
  const end = Math.min(currentPage.value * PAGE_SIZE, visibleRows.value.length)
  return `${start}-${end}`
})

// en-IN, 2 decimals - matches the Desk page's format_currency() exactly.
// formatINR (foundationConsolidatedData.js) rounds to whole rupees, which
// is the wrong precision for this footer, so a small local formatter is
// used instead rather than reusing it.
function formatTotal(v) {
  return Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// -------------------------------------------------------------------------
// Export - exports exactly what's on screen (post column-filter).
// -------------------------------------------------------------------------
const exporting = ref(false)
async function exportExcel() {
  if (!lastQuery.value) return
  exporting.value = true
  try {
    await exportErpActualsExcel({
      fiscalYear: lastQuery.value.fiscalYear,
      accountingPeriod: lastQuery.value.accountingPeriod,
      rows: visibleRows.value,
    })
  } catch (e) {
    window.alert(e?.message || 'Export failed.')
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await loadFinancialYears()
})
</script>

<style scoped>
.erp-th {
  position: relative;
}

/* Ported from the now-removed ColumnFilterDropdown.vue (replaced by
frappe-ui's own default MultiSelect, see the template above) - the compact
filter-icon trigger needs to read clearly against the table header's own
dark fc-th background, which a plain default-variant MultiSelect trigger
button was never styled for. */
.erp-filter-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 4px;
  color: #dbeeff;
  cursor: pointer;
}
.erp-filter-icon-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
.erp-filter-icon-btn.is-active {
  color: #ffd54a;
}
</style>
