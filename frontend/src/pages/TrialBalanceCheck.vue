<!--
  Trial Balance Check page - same manual-Fetch-button + patient-loading
  pattern as ErpActuals.vue, but renders a unit-wise main-head/sub-head
  bifurcation: one ROW per Unit (10 rows, plus a trailing "TOTAL" row
  summing every unit - every GL line for that unit summed into its
  category), with a 2-tier header matching the rest of the app's
  blue-main-head/orange-sub-head convention (.fc-th/.fc-th-sub, see
  SummaryInrTab.vue/BudgetSummaryTable.vue) - Capital Expenses stands alone
  as a single always-visible column, Operating Expenses spans its 6 real
  sub-heads and collapses/expands on click exactly like
  BudgetSummaryTable.vue's quarter-column toggle (rowspan<->colspan driven
  by a single "is opex expanded" boolean, no per-head Set needed since
  there's only the one expandable group here). Clicking anywhere on a
  unit's row (or the trailing TOTAL row) opens the shared
  BudgetDrilldownModal (same component every other report's drill-down
  uses) on that row's own 4-level tree (head_of_expense ->
  sub_head_of_expense -> type_of_expense -> gl_code, matching
  budget_actuals_combined.py's own _build_expense_structure shape exactly)
  - built entirely server-side, no extra round trip on click. Column
  headers are ALSO drillable, consolidated across every unit (a column
  spans all 10 rows): a main-head column (Capital/Operating Expenses) opens
  one level below itself (Sub Heads -> Items -> GL), a sub-head column
  (Program Expenses etc., shown only when Operating Expenses is expanded)
  opens two levels below (Items -> GL directly), and the "Total" column
  opens the full untouched tree - all three sourced from the backend's
  separate `consolidated_tree` (same shape as a unit row's own `tree`,
  built across every unit's rows instead of one - also exactly what the
  trailing TOTAL row's own `tree` is). Table shape
  (including Unit
  label resolution via the Unit doctype's own unit_decription field, and
  the GL code -> GL code Mapping -> Expenses join used to categorize each
  line) comes pre-built from the backend
  (budget_mis.api.trial_balance.build_trial_balance_table) rather than
  pivoted client-side. No pagination needed - one row per Unit doctype
  record, never more than a handful. The real PeopleSoft trial balance pull
  itself is still a placeholder server-side (see that file's own TODO) -
  this page currently renders against a bundled sample dataset
  (trial_balance_test_data.json) until that's wired up.
-->
<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">YTD Month</label>
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

      <div v-if="loading" class="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-10 dark:border-gray-800 dark:bg-gray-900">
        <AppLoader label="Fetching trial balance..." />
        <div class="text-xs text-gray-500 dark:text-gray-400">Elapsed: {{ elapsedLabel }}</div>
        <div v-if="elapsedSeconds > 60" class="max-w-md text-center text-xs text-amber-600 dark:text-amber-400">
          This is still working - live PeopleSoft queries can take up to 3 minutes. Please stay on this page.
        </div>
        <button class="text-xs text-fc-blue-mid underline" @click="cancelFetch">Cancel</button>
      </div>

      <ErrorMessage v-else-if="error" :message="error" />

      <div v-else-if="!hasFetched" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        Select a Financial Year and Month, then click Fetch.
      </div>

      <ErrorMessage v-else-if="statusFailed" :message="statusFailedMessage" />

      <template v-else>
        <div class="flex flex-wrap items-center gap-7 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/60">
          <div><span class="font-semibold text-fc-blue-mid">Status:</span> {{ response?.status }}</div>
          <div><span class="font-semibold text-fc-blue-mid">Fiscal Year:</span> {{ response?.fiscal_year }}</div>
          <div><span class="font-semibold text-fc-blue-mid">Accounting Period:</span> {{ response?.accounting_period }}</div>
        </div>

        <div v-if="!tableRows.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          No rows returned.
        </div>
        <div v-else class="fc-scroll-wrapper">
          <table class="fc-table w-full min-w-[1200px] text-sm">
            <thead>
              <tr class="fc-thead-main">
                <th rowspan="2" class="fc-th text-left">Unit</th>
                <th rowspan="2" class="fc-th cursor-pointer select-none text-right" @click="drillIntoHead('capex')">
                  {{ capexHead.label }}
                </th>
                <th
                  v-if="opexOpen"
                  :colspan="opexHead.columns.length"
                  class="fc-th cursor-pointer select-none text-center"
                  @click="drillIntoHead('opex')"
                >
                  <span @click.stop="opexOpen = false">{{ opexHead.label }} <span class="text-white/70">▲</span></span>
                </th>
                <th v-else rowspan="2" class="fc-th cursor-pointer select-none text-right" @click="drillIntoHead('opex')">
                  <span @click.stop="opexOpen = true">{{ opexHead.label }} <span class="text-white/70">▼</span></span>
                </th>
                <th v-if="opexOpen" rowspan="2" class="fc-th text-right">{{ columnLabel('total opex') }}</th>
                <th rowspan="2" class="fc-th cursor-pointer select-none text-right" @click="drillIntoConsolidated">
                  {{ columnLabel('grand total') }}
                </th>
              </tr>
              <tr v-if="opexOpen" class="fc-thead-sub">
                <th
                  v-for="key in opexHead.columns"
                  :key="key"
                  class="fc-th-sub cursor-pointer select-none"
                  @click="drillIntoSubHead(key)"
                >
                  {{ columnLabel(key) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in tableRows"
                :key="i"
                class="cursor-pointer"
                :class="row.is_total ? 'fc-row-grand' : ''"
                @click="drillInto(row)"
              >
                <td class="fc-td text-left font-medium">{{ row.unit }}</td>
                <td class="fc-td text-right">{{ formatAmount(row.values.capex) }}</td>
                <template v-if="opexOpen">
                  <td v-for="key in opexHead.columns" :key="key" class="fc-td text-right">
                    {{ formatAmount(row.values[key]) }}
                  </td>
                  <td class="fc-td text-right">{{ formatAmount(row.values['total opex']) }}</td>
                </template>
                <td v-else class="fc-td text-right">{{ formatAmount(row.values['total opex']) }}</td>
                <td class="fc-td text-right font-semibold">{{ formatAmount(row.values['grand total']) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <BudgetDrilldownModal v-model="drilldownOpen" :node="drilldownNode" total-mode="ytd" />
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { MultiSelect, Select, Button, FeatherIcon, ErrorMessage } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import BudgetDrilldownModal from '@/components/BudgetDrilldownModal.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'

setPageTitle('Trial Balance Check')

// April = accounting period 1 ... March = 12 - matches
// budget_mis.api.helper.get_accounting_period_from_month.
const MONTH_TO_PERIOD = {
  April: 1, May: 2, June: 3, July: 4, August: 5, September: 6,
  October: 7, November: 8, December: 9, January: 10, February: 11, March: 12,
}
const MONTHS = Object.keys(MONTH_TO_PERIOD)
const monthOptions = MONTHS.map((m) => ({ label: m, value: m }))

const filters = reactive({ financialYear: '', month: '' })
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

// table = {columns: [{key, label}, ...], main_heads: [{key, label,
// columns: [...]}], rows: [{unit, values: {categoryKey: amount|null}, tree:
// [{name, ytd, sub_heads: [{name, ytd, items: [{name, sequence_id, ytd,
// items: [{name, ytd}, ...GL lines]}]}]}]}]} built server-side by
// budget_mis.api.trial_balance.build_trial_balance_table - one row per
// Unit, `tree` is that unit's own full head/sub-head/type-of-expense/GL
// drill-down.
const table = ref({ columns: [], main_heads: [], rows: [], consolidated_tree: [] })
const columns = computed(() => table.value?.columns || [])
const tableRows = computed(() => table.value?.rows || [])
const mainHeads = computed(() => table.value?.main_heads || [])
const consolidatedTree = computed(() => table.value?.consolidated_tree || [])
const capexHead = computed(() => mainHeads.value.find((h) => h.key === 'capex') || { label: 'Capital Expenses', head_names: [], columns: ['capex'] })
const opexHead = computed(() => mainHeads.value.find((h) => h.key === 'opex') || { label: 'Operating Expenses', head_names: [], columns: [] })

function columnLabel(key) {
  return columns.value.find((c) => c.key === key)?.label || key
}

function setTable(t) {
  table.value = t || { columns: [], main_heads: [], rows: [], consolidated_tree: [] }
}

// Operating Expenses' 6 sub-heads collapse/expand as one group (unlike
// BudgetSummaryTable.vue's per-quarter Set, there's only this one
// expandable group here, so a single boolean is enough) - same
// rowspan<->colspan header toggle pattern. Defaults open (sub-heads shown
// immediately) rather than collapsed, per the business's own preference.
const opexOpen = ref(true)

// Drill-down: clicking a unit's row opens its own 4-level tree
// (head_of_expense -> sub_head_of_expense -> type_of_expense -> gl_code,
// already built server-side as row.tree) in the shared BudgetDrilldownModal
// - wrapped as {name, sub_heads: row.tree} so the modal's own
// hasLineItems()/children() logic (which reads node.sub_heads first) shows
// the heads as the first level, matching how every other report's table
// rows feed the same shared modal (see SummaryInrTab.vue's drillIntoRow).
const drilldownOpen = ref(false)
const drilldownNode = ref(null)

function drillInto(row) {
  openDrilldown(row.unit, row.tree)
}

function openDrilldown(name, subHeads) {
  if (!subHeads?.length) return
  drilldownNode.value = { name, sub_heads: subHeads }
  drilldownOpen.value = true
}

// Column-header drill-downs - consolidated across every unit (a column
// spans all 10 rows, unlike a unit row's own single-unit tree). Depth is
// one level shallower than its own position in the tree: a MAIN HEAD
// column (Capital/Operating Expenses) shows Sub Heads -> Items -> GL (its
// own head node's sub_heads, skipping the head level since that's what was
// just clicked); a SUB HEAD column (Program Expenses etc., visible only
// when expanded) shows Items -> GL directly (that sub-head node's own
// items); the "Total" column shows the untouched full Head -> Sub Head ->
// Item -> GL tree, same depth as a unit row's own drill-down.
function drillIntoHead(headKey) {
  const head = headKey === 'capex' ? capexHead.value : opexHead.value
  const matchingHeadNodes = consolidatedTree.value.filter((h) => head.head_names?.includes(h.name))
  const subHeads = matchingHeadNodes.flatMap((h) => h.sub_heads || [])
  openDrilldown(head.label, subHeads)
}

function drillIntoSubHead(categoryKey) {
  const col = columns.value.find((c) => c.key === categoryKey)
  if (!col?.sub_head_name) return
  for (const head of consolidatedTree.value) {
    const subHead = head.sub_heads?.find((s) => s.name === col.sub_head_name)
    if (subHead) {
      openDrilldown(col.label, subHead.items || [])
      return
    }
  }
}

function drillIntoConsolidated() {
  openDrilldown('Total (all units)', consolidatedTree.value)
}

// Plain Western-style comma grouping (3,743,250,000), not en-IN lakh/crore
// grouping - matches the reference table the business shared.
function formatAmount(v) {
  if (v === null || v === undefined || v === 0) return '-'
  return Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

async function fetchData() {
  const fy = filters.financialYear
  const month = filters.month
  if (!fy || !month) return

  const fiscalYear = parseInt(fy.split('-')[0], 10)
  const accountingPeriod = MONTH_TO_PERIOD[month]
  const token = ++requestToken

  loading.value = true
  error.value = null
  startElapsedTimer()
  try {
    const message = await call('budget_mis.api.trial_balance.get_trial_balance_from_erp', {
      fiscal_year: fiscalYear,
      accounting_period: accountingPeriod,
    })
    if (token !== requestToken) return
    response.value = message
    hasFetched.value = true
    setTable(message?.status === 'success' ? message.table : null)
  } catch (e) {
    if (token !== requestToken) return
    error.value = e?.messages?.[0] || e?.message || 'Request failed. Check the Error Log for details.'
    hasFetched.value = true
    response.value = null
    setTable(null)
  } finally {
    if (token === requestToken) {
      loading.value = false
      stopElapsedTimer()
    }
  }
}

function cancelFetch() {
  requestToken++
  loading.value = false
  stopElapsedTimer()
}

const statusFailed = computed(() => hasFetched.value && response.value && response.value.status !== 'success')
const statusFailedMessage = computed(() => {
  const status = `Status: ${response.value?.status || 'failed'}`
  return response.value?.error ? `${status} — ${response.value.error}` : status
})

onMounted(async () => {
  await loadFinancialYears()
})
</script>
