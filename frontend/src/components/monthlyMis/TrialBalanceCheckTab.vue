<!--
  Trial Balance Check tab (moved from its own standalone page/route into
  Monthly MIS - see MonthlyMis.vue's own tab strip) - System-Manager-only,
  same restriction its old Home tile/App Module Setting record had, now
  enforced by MonthlyMis.vue only rendering this tab's own tab button when
  showTrialBalanceTab (appConfigResource's can_manage_settings) is true,
  backed up server-side by get_trial_balance_from_erp's own
  is_direct_http_call + "System Manager" in frappe.get_roles() check
  (api/trial_balance.py) - this app's own documented rule that a frontend
  restriction alone is never a real permission check.

  Same patient-loading-state pattern as ErpActuals.vue's own manual Fetch,
  but auto-fetches on the shared Financial Year/Month (props) changing
  instead of a manual button - see the watch() near the bottom of this
  file's own script. The underlying call now reads from the persisted ERP
  Trial Balance Data store (kept fresh by the same scheduled sync job as
  actuals) rather than live-fetching PeopleSoft on request, so it's a fast
  DB read, not a 1-3 minute ERP round trip. Renders a unit-wise main-head/sub-head
  bifurcation: one ROW per Unit (10
  rows, plus a trailing "TOTAL" row summing every unit - every GL line for
  that unit summed into its category), with a 2-tier header matching the
  rest of the app's blue-main-head/orange-sub-head convention (.fc-th/
  .fc-th-sub, see SummaryInrTab.vue/BudgetSummaryTable.vue) - Capital
  Expenses stands alone as a single always-visible column, Operating
  Expenses spans its 6 real sub-heads and collapses/expands on click
  exactly like BudgetSummaryTable.vue's quarter-column toggle (rowspan<->
  colspan driven by a single "is opex expanded" boolean, no per-head Set
  needed since there's only the one expandable group here). Clicking
  anywhere on a unit's row (or the trailing TOTAL row) opens
  TrialBalanceDrilldownModal (a dedicated modal, NOT the shared
  BudgetDrilldownModal other reports use - Credit/Debit/Opening Balance are
  Trial Balance-specific concepts no other report's data carries) with two
  tabs: "GL Codes" (row.gl_code_table - flat gl_code/description/debit/
  credit/opening_balance, one row per GL code actually seen, mapped or
  not) and "Cost Center / Location" (row.cost_center_breakdown - clicking
  one of its rows drills one level deeper into that cost-center+location's
  own GL Codes tab, inside the same modal). Both built entirely
  server-side, no extra round trip on click. Column headers in the TABLE
  itself are still drillable via the shared BudgetDrilldownModal,
  consolidated across every unit (a column
  spans all 10 rows): a main-head column (Capital/Operating Expenses) opens
  one level below itself (Sub Heads -> Items -> GL), a sub-head column
  (Program Expenses etc., shown only when Operating Expenses is expanded)
  opens two levels below (Items -> GL directly), and the "Total" column
  opens the full untouched tree - all three sourced from the backend's
  separate `consolidated_tree` (same shape as a unit row's own `tree`,
  built across every unit's rows instead of one - also exactly what the
  trailing TOTAL row's own `tree` is). Table shape (including Unit label
  resolution via the Unit doctype's own unit_decription field, and the GL
  code -> GL code Mapping -> Expenses join used to categorize each line)
  comes pre-built from the backend
  (budget_mis.api.trial_balance.build_trial_balance_table) rather than
  pivoted client-side. No pagination needed - one row per Unit doctype
  record, never more than a handful. The real PeopleSoft trial balance pull
  (Z_MIS_TB_BY_PERIOD, same ERP host/auth/caching convention as
  erp_actuals.py's own actuals pull) is wired up server-side - this page
  renders against live ERP data, same as every other report in this app.

  Financial Year/Month are now SHARED with the Monthly MIS tab (passed in
  as props from MonthlyMis.vue's own filter row, now common to both tabs),
  auto-fetching on change exactly like Monthly MIS's own tables already
  do - no separate filters or manual Fetch button of its own anymore. The
  underlying call still hits a live PeopleSoft endpoint that can take 1-3
  minutes (same patient loading state as before), but that's now the same
  tradeoff Monthly MIS's own filter change already carries, not something
  unique to this tab that needed a manual trigger to isolate.
-->
<template>
  <div class="flex flex-col gap-4">
    <div v-if="loading" class="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-10 dark:border-gray-800 dark:bg-gray-900">
      <AppLoader label="Fetching trial balance..." />
      <div class="text-xs text-gray-500 dark:text-gray-400">Elapsed: {{ elapsedLabel }}</div>
      <div v-if="elapsedSeconds > 60" class="max-w-md text-center text-xs text-amber-600 dark:text-amber-400">
        This is still working - live PeopleSoft queries can take up to 3 minutes. Please stay on this page.
      </div>
    </div>

    <div v-else-if="error" class="flex items-center gap-3">
      <ErrorMessage :message="error" />
      <button class="text-sm text-fc-blue-mid underline" @click="fetchData">Retry</button>
    </div>

    <div v-else-if="!hasFetched" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
      Select a Financial Year and Month above to load the trial balance.
    </div>

    <ErrorMessage v-else-if="statusFailed" :message="statusFailedMessage" />

    <template v-else>
      <div v-if="!tableRows.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        No rows returned.
      </div>
      <div v-else class="fc-scroll-wrapper">
        <!-- Two separate header layouts, one per Operating Expenses state, so
        every rowspan always matches the number of header rows that actually
        exist. Collapsed has 2 header rows (heads, then TB/MIS); expanded has
        3 (heads, sub-heads, TB/MIS). A single shared header whose sub-head
        row was removed by v-if left rowspan=3 cells pointing at a row that
        no longer existed, pushing the TB/MIS cells out past the MIS column.
        Collapsed: 8 columns. Expanded: 22 columns. -->
        <table class="fc-table tb-check-table w-full min-w-[1200px] text-sm">
          <thead v-if="opexOpen" key="thead-expanded">
            <tr class="fc-thead-main">
              <th rowspan="3" class="fc-th text-left">Unit</th>
              <th rowspan="2" colspan="2" class="fc-th cursor-pointer select-none text-center" @click="drillIntoHead('capex')">
                {{ capexHead.label }}
              </th>
              <th :colspan="opexHead.columns.length * 2" class="fc-th cursor-pointer select-none text-center" @click="drillIntoHead('opex')">
                <span @click.stop="opexOpen = false">{{ opexHead.label }} <span class="text-white/70">▲</span></span>
              </th>
              <th rowspan="2" colspan="2" class="fc-th text-center">{{ columnLabel('total opex') }}</th>
              <th rowspan="2" colspan="2" class="fc-th cursor-pointer select-none text-center" @click="drillIntoConsolidated">
                {{ columnLabel('grand total') }}
              </th>
              <th rowspan="3" class="fc-th text-right">Variance</th>
            </tr>
            <tr class="fc-thead-sub">
              <th
                v-for="key in opexHead.columns"
                :key="key"
                colspan="2"
                class="fc-th-tb-sub cursor-pointer select-none text-center"
                @click="drillIntoSubHead(key)"
              >
                {{ columnLabel(key) }}
              </th>
            </tr>
            <tr class="fc-thead-sub">
              <th class="fc-th-sub-row3 text-right">TB</th>
              <th class="fc-th-sub-row3 text-right">MIS</th>
              <template v-for="key in opexHead.columns" :key="key">
                <th class="fc-th-sub-row3 text-right">TB</th>
                <th class="fc-th-sub-row3 text-right">MIS</th>
              </template>
              <th class="fc-th-sub-row3 text-right">TB</th>
              <th class="fc-th-sub-row3 text-right">MIS</th>
              <th class="fc-th-sub-row3 text-right">TB</th>
              <th class="fc-th-sub-row3 text-right">MIS</th>
            </tr>
          </thead>
          <thead v-else key="thead-collapsed">
            <tr class="fc-thead-main">
              <th rowspan="2" class="fc-th text-left">Unit</th>
              <th colspan="2" class="fc-th cursor-pointer select-none text-center" @click="drillIntoHead('capex')">
                {{ capexHead.label }}
              </th>
              <th colspan="2" class="fc-th cursor-pointer select-none text-center" @click="drillIntoHead('opex')">
                <span @click.stop="opexOpen = true">{{ opexHead.label }} <span class="text-white/70">▼</span></span>
              </th>
              <th colspan="2" class="fc-th cursor-pointer select-none text-center" @click="drillIntoConsolidated">
                {{ columnLabel('grand total') }}
              </th>
              <th rowspan="2" class="fc-th text-right">Variance</th>
            </tr>
            <tr class="fc-thead-sub">
              <th class="fc-th-sub-row3 text-right">TB</th>
              <th class="fc-th-sub-row3 text-right">MIS</th>
              <th class="fc-th-sub-row3 text-right">TB</th>
              <th class="fc-th-sub-row3 text-right">MIS</th>
              <th class="fc-th-sub-row3 text-right">TB</th>
              <th class="fc-th-sub-row3 text-right">MIS</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in tableRows"
              :key="i"
              class="cursor-pointer"
              :class="row.is_total ? 'fc-row-grand' : ''"
              @click="drillIntoUnit(row)"
            >
              <td class="fc-td text-left font-medium">{{ row.unit }}</td>
              <td class="fc-td text-right">{{ formatAmount(row.values.capex?.tb) }}</td>
              <td class="fc-td text-right">{{ formatAmount(row.values.capex?.mis) }}</td>
              <template v-if="opexOpen">
                <template v-for="key in opexHead.columns" :key="key">
                  <td class="fc-td text-right">{{ formatAmount(row.values[key]?.tb) }}</td>
                  <td class="fc-td text-right">{{ formatAmount(row.values[key]?.mis) }}</td>
                </template>
              </template>
              <td class="fc-td text-right">{{ formatAmount(row.values['total opex']?.tb) }}</td>
              <td class="fc-td text-right">{{ formatAmount(row.values['total opex']?.mis) }}</td>
              <td class="fc-td text-right font-semibold">{{ formatAmount(row.values['grand total']?.tb) }}</td>
              <td class="fc-td text-right font-semibold">{{ formatAmount(row.values['grand total']?.mis) }}</td>
              <td class="fc-td text-right">{{ formatAmount(row.values['grand total']?.variance) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Column-header drill-downs (main head/sub-head/Total, consolidated
      across every unit) still use the shared BudgetDrilldownModal and its
      Head/Sub-head/Item/GL tree - only a UNIT ROW click now opens the new,
      Trial Balance-specific modal instead (see drillIntoUnit). -->
      <BudgetDrilldownModal v-model="drilldownOpen" :node="drilldownNode" total-mode="ytd" />

      <TrialBalanceDrilldownModal v-model="unitDrilldownOpen" :node="unitDrilldownNode" />

      <div class="mt-4">
        <div class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Adjustment</div>
        <ErrorMessage v-if="adjustmentError" :message="adjustmentError" />
        <div v-else-if="!adjustmentTableRows.length" class="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          No adjustment rows for this period.
        </div>
        <div v-else class="fc-scroll-wrapper">
          <table class="fc-table w-full min-w-[1000px] text-sm">
            <thead>
              <tr class="fc-thead-main">
                <th class="fc-th text-left">Category</th>
                <th v-for="col in adjustmentColumns" :key="col.key" class="fc-th text-right">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in adjustmentTableRows"
                :key="i"
                :class="row.is_total ? 'fc-row-grand' : ''"
              >
                <td class="fc-td text-left font-medium">{{ row.label }}</td>
                <td
                  v-for="col in adjustmentColumns"
                  :key="col.key"
                  class="fc-td text-right"
                  :class="col.key === 'total' ? 'font-semibold' : ''"
                >
                  {{ formatAmount(row.values[col.key]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="!adjustmentError && adjustmentUnitRows.length" class="mt-4">
        <div class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Adjustment by Unit</div>
        <div class="fc-scroll-wrapper">
          <table class="fc-table w-full min-w-[1000px] text-sm">
            <thead>
              <tr class="fc-thead-main">
                <th class="fc-th text-left">Unit</th>
                <th v-for="col in adjustmentColumns" :key="col.key" class="fc-th text-right">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in adjustmentUnitRows"
                :key="i"
                :class="row.is_total ? 'fc-row-grand' : ''"
              >
                <td class="fc-td text-left font-medium">{{ row.label }}</td>
                <td
                  v-for="col in adjustmentColumns"
                  :key="col.key"
                  class="fc-td text-right"
                  :class="[
                    col.key === 'total' ? 'font-semibold' : '',
                    row.values[col.key] ? 'cursor-pointer hover:underline' : '',
                  ]"
                  :title="row.values[col.key] ? 'Click to see the adjustment lines' : ''"
                  @click="row.values[col.key] && openAdjustmentDrilldown(row, col.key)"
                >
                  {{ formatAmount(row.values[col.key]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <AdjustmentDrilldownModal
        v-if="adjustmentDrilldown"
        v-model="adjustmentDrilldownOpen"
        :financial-year="financialYear"
        :month="month"
        :accounting-period="MONTH_TO_PERIOD[month]"
        :unit="adjustmentDrilldown.unit"
        :unit-label="adjustmentDrilldown.label"
        :method="adjustmentDrilldown.method"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue'
import { ErrorMessage } from 'frappe-ui'
import AppLoader from '@/components/AppLoader.vue'
import BudgetDrilldownModal from '@/components/BudgetDrilldownModal.vue'
import TrialBalanceDrilldownModal from './TrialBalanceDrilldownModal.vue'
const AdjustmentDrilldownModal = defineAsyncComponent(() => import('./AdjustmentDrilldownModal.vue'))
import { call } from '@/data/decrypt'
import { getCachedTrialBalance, setCachedTrialBalance } from '@/data/trialBalanceCache'

const props = defineProps({
  financialYear: { type: String, default: '' },
  month: { type: String, default: '' },
})

// April = accounting period 1 ... March = 12 - matches
// budget_mis.api.helper.get_accounting_period_from_month.
const MONTH_TO_PERIOD = {
  April: 1, May: 2, June: 3, July: 4, August: 5, September: 6,
  October: 7, November: 8, December: 9, January: 10, February: 11, March: 12,
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

function openDrilldown(name, subHeads) {
  if (!subHeads?.length) return
  drilldownNode.value = { name, sub_heads: subHeads }
  drilldownOpen.value = true
}

// Unit row click: opens the Trial Balance-specific modal (GL Codes /
// Cost Center · Location tabs) instead of the shared BudgetDrilldownModal's
// Head/Sub-head/Item tree - row.gl_code_table/row.cost_center_breakdown
// are both built server-side by budget_mis.api.trial_balance
// (_build_gl_code_table/_build_cost_center_breakdown).
const unitDrilldownOpen = ref(false)
const unitDrilldownNode = ref(null)
function drillIntoUnit(row) {
  unitDrilldownNode.value = {
    name: row.unit,
    ytd: row.values?.['grand total']?.tb || 0,
    gl_code_table: row.gl_code_table || [],
    cost_center_breakdown: row.cost_center_breakdown || [],
  }
  unitDrilldownOpen.value = true
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

function applyMessage(message) {
  response.value = message
  hasFetched.value = true
  setTable(message?.status === 'success' ? message.table : null)
}

async function fetchData() {
  const fy = props.financialYear
  const month = props.month
  if (!fy || !month) return

  // Switching away from and back to this tab remounts the component (see
  // this file's own header comment) and re-triggers the immediate watch()
  // below for the SAME fy/month that's already loaded - skip the real
  // (1-3 minute) network round trip in that case and apply the cached
  // result instantly instead, same as monthlyMisCache.js's own reasoning.
  const cached = getCachedTrialBalance(fy, month)
  if (cached) {
    applyMessage(cached)
    return
  }

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
    applyMessage(message)
    if (message?.status === 'success') setCachedTrialBalance(fy, month, message)
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

// Adjustment Breakup - a second, independent table shown below the main
// Trial Balance Check table: one row per Unit, one column per Adjustment
// Method (budget_mis.api.trial_balance.get_adjustment_breakup), YTD up to
// the same Financial Year/Month as the main table. Fetched alongside the
// main table rather than merged into its own response, since it's a
// different shape (no head/sub-head/GL drill-down) and a different source
// (Monthly Adjustment docs, not ERP Data) - no shared loading/caching
// complexity needed here since this is already a fast plain DB read, not a
// live PeopleSoft round trip.
const adjustmentResponse = ref(null)
const adjustmentError = ref(null)
const adjustmentColumns = computed(() => adjustmentResponse.value?.columns || [])
const adjustmentTableRows = computed(() => adjustmentResponse.value?.rows || [])
const adjustmentUnitRows = computed(() => adjustmentResponse.value?.unit_rows || [])

// Clicking a cell of the "Adjustment by Unit" table opens the lines behind it.
const adjustmentDrilldown = ref(null)
const adjustmentDrilldownOpen = ref(false)
function openAdjustmentDrilldown(row, methodKey) {
  adjustmentDrilldown.value = { unit: row.unit, label: row.label, method: methodKey }
  adjustmentDrilldownOpen.value = true
}

async function fetchAdjustmentBreakup() {
  const fy = props.financialYear
  const month = props.month
  if (!fy || !month) return

  const accountingPeriod = MONTH_TO_PERIOD[month]
  adjustmentError.value = null
  try {
    const message = await call('budget_mis.api.trial_balance.get_adjustment_breakup', {
      financial_year: fy,
      month: accountingPeriod,
    })
    adjustmentResponse.value = message?.status === 'success' ? message : null
    if (message?.status !== 'success') {
      adjustmentError.value = message?.error || 'Request failed.'
    }
  } catch (e) {
    adjustmentResponse.value = null
    adjustmentError.value = e?.messages?.[0] || e?.message || 'Request failed. Check the Error Log for details.'
  }
}

watch(() => [props.financialYear, props.month], () => fetchAdjustmentBreakup(), { immediate: true })

const statusFailed = computed(() => hasFetched.value && response.value && response.value.status !== 'success')
const statusFailedMessage = computed(() => {
  const status = `Status: ${response.value?.status || 'failed'}`
  return response.value?.error ? `${status} — ${response.value.error}` : status
})

// Auto-fetch on the shared Financial Year/Month (props, owned by
// MonthlyMis.vue) changing - immediate so this tab loads data as soon as
// it's first shown too, same as watch(() => [filters.financialYear,
// filters.month], ...) drives MonthlyMis.vue's own tables.
watch(() => [props.financialYear, props.month], () => fetchData(), { immediate: true })
</script>
