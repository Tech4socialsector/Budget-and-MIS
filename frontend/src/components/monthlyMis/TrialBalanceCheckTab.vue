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

  Same patient-loading-state pattern as ErpActuals.vue's own manual Fetch
  (the underlying call hits a live PeopleSoft endpoint that can take 1-3
  minutes), but auto-fetches on the shared Financial Year/Month (props)
  changing instead of a manual button - see the watch() near the bottom of
  this file's own script. Renders a unit-wise main-head/sub-head
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
  anywhere on a unit's row (or the trailing TOTAL row) opens the shared
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
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ErrorMessage } from 'frappe-ui'
import AppLoader from '@/components/AppLoader.vue'
import BudgetDrilldownModal from '@/components/BudgetDrilldownModal.vue'
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
