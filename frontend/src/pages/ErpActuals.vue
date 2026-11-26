<!--
  ERP Actuals page - Vue replica of the Desk page at
  annual_budget/annual_budget_mis/page/erp_actuals/erp_actuals.js (all 633
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
      <!-- Filters -->
      <div class="flex flex-wrap items-end gap-4">
        <div class="w-full sm:w-64">
          <FormControl
            type="select"
            label="API"
            :options="apiOptions"
            v-model="filters.apiLabel"
          />
        </div>
        <div class="w-full sm:w-48">
          <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Financial Year</label>
          <MultiSelect
            v-model="financialYearSelection"
            :options="financialYearOptions"
            placeholder="Select year"
            class="w-full"
          />
        </div>
        <div class="w-full sm:w-40">
          <FormControl
            type="select"
            label="Month"
            :options="monthOptions"
            v-model="filters.month"
          />
        </div>
        <Button variant="solid" :loading="loading" @click="fetchData">
          <template #prefix><FeatherIcon name="play" class="h-4 w-4" /></template>
          Fetch
        </Button>
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

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/40 dark:text-red-400">
        {{ error }}
      </div>

      <div v-else-if="!hasFetched" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        Select an API, Financial Year and Month, then click Fetch.
      </div>

      <div v-else-if="statusFailed" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-900/40 dark:text-red-400">
        Status: {{ response?.status || 'failed' }}
        <span v-if="response?.error"> — {{ response.error }}</span>
      </div>

      <template v-else>
        <!-- Summary strip -->
        <div class="flex flex-wrap items-center gap-7 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/60">
          <div><span class="font-semibold text-fc-blue-mid">Status:</span> {{ response?.status }}</div>
          <div><span class="font-semibold text-fc-blue-mid">Fiscal Year:</span> {{ response?.fiscal_year }}</div>
          <div><span class="font-semibold text-fc-blue-mid">Accounting Period:</span> {{ response?.accounting_period }}</div>
          <div><span class="font-semibold text-fc-blue-mid">Row Count:</span> {{ allRows.length }}</div>
          <Button variant="outline" size="sm" class="ml-auto" :loading="exporting" @click="exportExcel">
            <template #prefix><FeatherIcon name="download" class="h-4 w-4" /></template>
            Export to Excel
          </Button>
        </div>

        <div v-if="!allRows.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          No rows returned.
        </div>
        <template v-else>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Showing {{ visibleRows.length }} of {{ allRows.length }} rows
          </div>

          <div class="fc-scroll-wrapper">
            <table class="fc-table w-full min-w-[1200px] text-sm">
              <thead>
                <tr class="fc-thead-main">
                  <th v-for="col in columns" :key="col" class="fc-th erp-th text-center">
                    <span class="mr-1 align-middle">{{ col }}</span>
                    <ColumnFilterDropdown
                      class="inline-flex align-middle"
                      :column="col"
                      :distinct-values="distinctValues[col] || []"
                      :model-value="activeFilters[col] || null"
                      @apply="(set) => applyFilter(col, set)"
                      @clear="() => clearFilter(col)"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!visibleRows.length">
                  <td class="fc-td text-center text-gray-400" :colspan="columns.length">No rows match the current filter.</td>
                </tr>
                <tr v-for="(row, i) in visibleRows" :key="i">
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
        </template>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { MultiSelect, FormControl, Button, FeatherIcon } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import ColumnFilterDropdown from '@/components/ColumnFilterDropdown.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'
import { exportErpActualsExcel } from '@/data/erpActualsExport'

setPageTitle('ERP Actuals')

// -------------------------------------------------------------------------
// Filters
// -------------------------------------------------------------------------
const API_OPTIONS = {
  'ERP Actuals (YTD)': 'annual_budget.api.actuals.get_actuals_from_erp_prod',
  'ERP Actuals (Month Wise)': 'annual_budget.api.actuals.get_actuals_from_erp_month_wise',
}
// April = accounting period 1 ... March = 12 - matches
// annual_budget.api.actual_format.get_accounting_period_from_month, and
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
  const rows = await call('annual_budget.api.filter_options.get_financial_year_list')
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
// Column filters - column -> Set of checked values, or absent = no filter.
// distinctValues is always computed off the FULL unfiltered row set so the
// checkbox list stays stable while other columns are filtered.
// -------------------------------------------------------------------------
const activeFilters = reactive({})

const distinctValues = computed(() => {
  const out = {}
  for (const col of columns.value) {
    const seen = new Set()
    for (const row of allRows.value) seen.add(cellText(row, col))
    out[col] = Array.from(seen).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
  }
  return out
})

function applyFilter(col, set) {
  if (!set) delete activeFilters[col]
  else activeFilters[col] = set
}
function clearFilter(col) {
  delete activeFilters[col]
}

const visibleRows = computed(() =>
  allRows.value.filter((row) => columns.value.every((c) => !activeFilters[c] || activeFilters[c].has(cellText(row, c)))),
)

const visibleTotal = computed(() => visibleRows.value.reduce((sum, row) => sum + (parseFloat(row.posted_total_amt) || 0), 0))

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
</style>
