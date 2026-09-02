<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <!-- Shared Financial Year filter -->
      <div class="flex flex-wrap items-end gap-4">
        <div class="w-full sm:w-56">
          <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Financial Year</label>
          <MultiSelect
            v-model="financialYearSelection"
            :options="financialYearOptions"
            placeholder="Select year"
            class="w-full"
          />
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-800">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          class="border-b-2 px-4 py-2.5 text-sm font-medium transition"
          :class="activeTab === tab.key
            ? 'border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab 1: Budget Dashboard (unit-wise) -->
      <template v-if="activeTab === 'dashboard'">
        <ErrorMessage v-if="unitWiseError" :message="unitWiseErrorMessage" />
        <div v-else-if="unitWiseLoading" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <AppLoader label="Loading dashboard..." />
        </div>
        <template v-else>
          <div class="flex items-center justify-end">
            <Switch v-model="showFullNumbers" label="Show full numbers" />
          </div>

          <!-- Banner: Overall / Capex / Opex -->
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <AppTooltip text="Click to drill down" placement="top">
              <button
                class="w-full rounded-lg border-l-4 border-gray-900 bg-white p-3 text-left shadow-sm transition hover:shadow-md dark:border-gray-100 dark:bg-gray-900"
                @click="openDrilldown(consolidatedHeadsNode, 'ytd')"
              >
                <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Overall Grand Total</div>
                <div class="mt-0.5 text-xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(overallTotal) }}</div>
                <div class="mt-1 text-xs text-gray-400">{{ mainUnits.length }} Units</div>
              </button>
            </AppTooltip>
            <AppTooltip text="Click to drill down" placement="top">
              <button
                class="w-full rounded-lg border-l-4 bg-white p-3 text-left shadow-sm transition hover:shadow-md dark:bg-gray-900"
                style="border-color: #1e5fa8"
                @click="openDrilldown(capexNode, 'ytd')"
              >
                <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Capex Total</div>
                <div class="mt-0.5 text-xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(capexTotal) }}</div>
                <div class="mt-1 text-xs text-gray-400">{{ pctOf(capexTotal, overallTotal) }}% of total</div>
              </button>
            </AppTooltip>
            <AppTooltip text="Click to drill down" placement="top">
              <button
                class="w-full rounded-lg border-l-4 bg-white p-3 text-left shadow-sm transition hover:shadow-md dark:bg-gray-900"
                style="border-color: #e8792a"
                @click="openDrilldown(opexNode, 'ytd')"
              >
                <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Opex Total</div>
                <div class="mt-0.5 text-xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(opexTotal) }}</div>
                <div class="mt-1 text-xs text-gray-400">{{ pctOf(opexTotal, overallTotal) }}% of total</div>
              </button>
            </AppTooltip>
          </div>

          <InsightStrip :insights="dashboardInsights" />

          <!-- Units -->
          <div v-if="mainUnits.length">
            <div class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Units</div>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <AppTooltip v-for="(unit, i) in mainUnits" :key="unit.label" text="Click to drill down">
                <button
                  class="w-full rounded-lg border-l-4 bg-white p-2.5 text-left shadow-sm transition hover:shadow-md dark:bg-gray-900"
                  :style="{ borderColor: accentColor(i) }"
                  @click="openDrilldown(unitNode(unit), 'ytd')"
                >
                  <div class="truncate text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300" :title="unit.label">{{ unit.label }}</div>
                  <div class="mt-0.5 text-base font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(unitTotal(unit)) }}</div>
                  <div class="mt-0.5 text-xs text-gray-400">{{ pctOf(unitTotal(unit), overallTotal) }}% of total</div>
                </button>
              </AppTooltip>
            </div>
          </div>

          <!-- Sub Units -->
          <div v-if="subUnits.length">
            <div class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Sub Units</div>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <AppTooltip v-for="(unit, i) in subUnits" :key="unit.label" text="Click to drill down">
                <button
                  class="w-full rounded-lg border-l-4 bg-white p-2.5 text-left shadow-sm transition hover:shadow-md dark:bg-gray-900"
                  :style="{ borderColor: accentColor(mainUnits.length + i) }"
                  @click="openDrilldown(unitNode(unit), 'ytd')"
                >
                  <div class="truncate text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300" :title="unit.label">{{ unit.label }}</div>
                  <div class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(unitTotal(unit)) }}</div>
                  <div class="mt-0.5 text-xs text-gray-400">{{ pctOf(unitTotal(unit), overallTotal) }}% of total</div>
                </button>
              </AppTooltip>
            </div>
          </div>

          <!-- Budget Share + Quarterly Allocation Trend: same row -->
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <!-- Doughnut: Budget Share -->
            <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div class="text-center text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Budget Share</div>
              <div class="mt-3 h-64">
                <canvas ref="shareCanvasRef" />
              </div>
            </div>

            <!-- Bar: Quarterly Allocation Trend -->
            <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Quarterly Allocation Trend</div>
              <div v-if="quarterlyTrendLoading" class="flex h-64 items-center justify-center text-xs text-gray-400">Loading trend...</div>
              <div v-else-if="!quarterlyTrendHeads.length" class="flex h-64 items-center justify-center text-xs text-gray-400">No quarterly data available.</div>
              <div v-else class="h-64">
                <canvas ref="quarterlyTrendRef" />
              </div>
            </div>
          </div>

          <!-- Bar: Month-wise Budget by Unit (replaces the old flat "Budget
          by Unit" bar list - same drill-down-per-unit intent, but broken
          out across the year so a unit's own seasonality is visible too,
          not just its YTD total). -->
          <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div class="mb-1 flex items-center justify-between">
              <div class="text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Month-wise Budget by Unit</div>
              <div v-if="monthlyByUnitLoading" class="text-xs text-gray-400">Loading...</div>
            </div>
            <div class="h-72">
              <canvas ref="monthlyByUnitRef" />
            </div>
          </div>

          <!-- Bar: Month-wise Budget Allocation (all units combined) -->
          <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Month-wise Budget Allocation</div>
            <div class="h-64">
              <canvas ref="monthlyBudgetRef" />
            </div>
          </div>
        </template>
      </template>

      <!-- Tab 2: Work Plan Views -->
      <template v-else-if="activeTab === 'workplan'">
        <ErrorMessage v-if="pieChartError" :message="pieChartErrorMessage" />
        <div v-else-if="pieChartLoading" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <AppLoader label="Loading work plan views..." />
        </div>
        <template v-else>
          <div class="flex items-center justify-end">
            <Switch v-model="showFullNumbers" label="Show full numbers" />
          </div>

          <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-2">
              <AppTooltip text="Click to drill down">
                <button
                  class="w-full rounded-lg border-l-4 border-gray-900 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-gray-100 dark:bg-gray-900"
                  @click="openDrilldown({ name: 'Grand Total', items: workPlanHeads, sub_heads: [] }, 'ytd')"
                >
                  <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Grand Total</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(workPlanTotal) }}</div>
                </button>
              </AppTooltip>
              <AppTooltip text="Click to drill down">
                <button
                  class="w-full rounded-lg border-l-4 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:bg-gray-900"
                  style="border-color: #1e5fa8"
                  @click="openDrilldown({ name: 'Direct Work', items: directWorkItems, sub_heads: [] }, 'ytd')"
                >
                  <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Direct Work</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(directWorkTotal) }}</div>
                  <div class="mt-1 text-xs text-gray-400">{{ pctOf(directWorkTotal, workPlanTotal) }}% of total</div>
                </button>
              </AppTooltip>
              <AppTooltip text="Click to drill down">
                <button
                  class="w-full rounded-lg border-l-4 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:bg-gray-900"
                  style="border-color: #e8792a"
                  @click="openDrilldown({ name: 'Grants & Donations', items: grantsItems, sub_heads: [] }, 'ytd')"
                >
                  <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Grants &amp; Donations</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(grantsTotal) }}</div>
                  <div class="mt-1 text-xs text-gray-400">{{ pctOf(grantsTotal, workPlanTotal) }}% of total</div>
                </button>
              </AppTooltip>
            </div>
            <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div class="text-center text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Direct Work &amp; Grants</div>
              <div class="mt-3 h-56">
                <canvas ref="workplanPieRef" />
              </div>
            </div>
          </div>

          <InsightStrip :insights="workPlanInsights" />

          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div class="text-center text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Direct Work — Unit-wise</div>
              <div class="mt-3 h-64">
                <canvas ref="directWorkUnitRef" />
              </div>
            </div>
            <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div class="text-center text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Grants — Unit-wise</div>
              <div class="mt-3 h-64">
                <canvas ref="grantsUnitRef" />
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- Tab 3: Budget vs Actuals Breakdown -->
      <template v-else>
        <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">YTD Month</label>
              <MultiSelect v-model="baMonthSelection" :options="MONTH_OPTIONS" placeholder="Select month" class="w-full" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Unit</label>
              <MultiSelect v-model="baFilters.units" :options="unitOptions" placeholder="All units" class="w-full" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Cost Center</label>
              <MultiSelect v-model="baFilters.costCenters" :options="baCostCenterOptions" :disabled="!baFilters.units.length" placeholder="All cost centers" class="w-full" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Location Code</label>
              <MultiSelect v-model="baFilters.locationCodes" :options="baLocationCodeOptions" :disabled="!baFilters.units.length" placeholder="All location codes" class="w-full" />
            </div>
          </div>
          <Button variant="solid" class="self-start" :loading="actualsLoading" @click="loadActuals">
            <template #prefix>
              <FeatherIcon name="search" class="h-4 w-4" />
            </template>
            Get Report
          </Button>
        </div>

        <ErrorMessage v-if="actualsError" :message="actualsErrorMessage" />
        <div v-else-if="actualsLoading" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <AppLoader label="Loading budget vs actuals..." />
        </div>
        <div v-else-if="!actualsHeads.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          Choose filters and click "Get Report" to see the budget vs actuals breakdown.
        </div>
        <template v-else>
          <div class="flex items-center justify-end">
            <Switch v-model="showFullNumbers" label="Show full numbers" />
          </div>

          <!-- Grand total + head cards -->
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AppTooltip text="Click to drill down">
              <button
                class="w-full rounded-lg border-l-4 border-gray-900 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-gray-100 dark:bg-gray-900"
                @click="openDrilldown({ name: 'Grand Total', items: actualsHeads, sub_heads: [] }, 'actuals')"
              >
                <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Grand Total</div>
                <div class="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(actualsGrandBudget) }}</div>
                <div class="mt-1 text-xs text-gray-400">Actual: {{ formatAmount(actualsGrandActual) }}</div>
                <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div class="h-full rounded-full" :style="{ width: Math.min(actualsGrandUtil, 100) + '%', backgroundColor: utilizationColor(actualsGrandUtil) }" />
                </div>
                <div class="mt-1 text-xs font-medium" :style="{ color: utilizationColor(actualsGrandUtil) }">{{ actualsGrandUtil }}% utilized</div>
              </button>
            </AppTooltip>
            <AppTooltip v-for="(head, i) in actualsHeads" :key="head.name" text="Click to drill down">
              <button
                class="w-full rounded-lg border-l-4 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:bg-gray-900"
                :style="{ borderColor: accentColor(i) }"
                @click="openDrilldown(head, 'actuals')"
              >
                <div class="truncate text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300" :title="head.name">{{ head.name }}</div>
                <div class="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(treeTotal(head, nodeBudget)) }}</div>
                <div class="mt-1 text-xs text-gray-400">Actual: {{ formatAmount(treeTotal(head, nodeActual)) }}</div>
                <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div class="h-full rounded-full" :style="{ width: Math.min(utilizationPct(head), 100) + '%', backgroundColor: utilizationColor(utilizationPct(head)) }" />
                </div>
                <div class="mt-1 text-xs font-medium" :style="{ color: utilizationColor(utilizationPct(head)) }">{{ utilizationPct(head) }}% utilized</div>
              </button>
            </AppTooltip>
          </div>

          <!-- Sub-head cards -->
          <div v-for="head in actualsHeadsWithSubs" :key="'group-' + head.name">
            <div class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">{{ head.name }}</div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <AppTooltip v-for="sub in head.sub_heads" :key="sub.name" text="Click to drill down">
                <button
                  class="w-full rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                  @click="openDrilldown(sub, 'actuals')"
                >
                  <div class="truncate text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300" :title="sub.name">{{ sub.name }}</div>
                  <div class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(treeTotal(sub, nodeBudget)) }}</div>
                  <div class="mt-1 h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div class="h-full rounded-full" :style="{ width: Math.min(utilizationPct(sub), 100) + '%', backgroundColor: utilizationColor(utilizationPct(sub)) }" />
                  </div>
                </button>
              </AppTooltip>
            </div>
          </div>

          <InsightStrip :insights="actualsInsights" />

          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div class="text-center text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Budget Breakdown</div>
              <div class="mt-3 h-64">
                <canvas ref="baBudgetPieRef" />
              </div>
            </div>
            <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div class="text-center text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Actuals Breakdown</div>
              <div class="mt-3 h-64">
                <canvas ref="baActualPieRef" />
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <BudgetDrilldownModal
      v-model="drilldownOpen"
      :node="drilldownNode"
      :total-mode="drilldownMode === 'quarters' ? 'quarters' : 'ytd'"
      :show-actuals="drilldownMode === 'actuals'"
    />
  </AppLayout>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { Chart } from 'chart.js/auto'
import { MultiSelect, FeatherIcon, ErrorMessage, Switch, Button } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import AppTooltip from '@/components/AppTooltip.vue'
import BudgetDrilldownModal from '@/components/BudgetDrilldownModal.vue'
import InsightStrip from '@/components/InsightStrip.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'
import { accentColor, formatCr, formatINR, isDarkMode } from '@/data/budgetTotals'
import { findItemsByName, findItemsExcluding, nodeActual, nodeBudget, treeTotal, utilizationColor, utilizationPct } from '@/data/dashboardData'

onMounted(() => setPageTitle('Dashboard'))

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'workplan', label: 'Work Plan Views' },
  { key: 'babreakdown', label: 'Budget vs Actuals Breakdown' },
]
const activeTab = ref('dashboard')

const showFullNumbers = ref(false)
function formatAmount(n) {
  return showFullNumbers.value ? formatINR(n) : formatCr(n)
}
function pctOf(part, whole) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0
}

const MONTH_OPTIONS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
].map((m) => ({ label: m, value: m }))

// --- Financial Year (shared) --------------------------------------------
const filters = reactive({ financialYear: '' })
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
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
    const label = `${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, '0')}`
    const match = financialYearOptions.value.find((o) => o.value === label)
    filters.financialYear = match ? match.value : financialYearOptions.value[0].value
  }
}

function toOptions(list) {
  return (list || []).filter((o) => o.value).map((o) => ({ label: o.label, value: o.value }))
}

const unitOptions = ref([])
async function loadUnits() {
  const r = await call('annual_budget.api.filter_options.get_units')
  unitOptions.value = toOptions(r?.data)
}

// --- Drill-down modal (shared across all 3 tabs) ------------------------
const drilldownOpen = ref(false)
const drilldownNode = ref(null)
const drilldownMode = ref('ytd') // 'ytd' | 'actuals'

function openDrilldown(node, mode) {
  drilldownNode.value = node
  drilldownMode.value = mode
  drilldownOpen.value = true
}

// =========================================================================
// TAB 1: Budget Dashboard (unit-wise)
// =========================================================================
const unitWiseLoading = ref(false)
const unitWiseError = ref(null)
const unitWiseErrorMessage = computed(() => unitWiseError.value?.messages?.[0] || unitWiseError.value?.message || 'Something went wrong loading the dashboard.')
const unitWiseRaw = ref([])

async function loadUnitWise() {
  if (!filters.financialYear) return
  unitWiseLoading.value = true
  unitWiseError.value = null
  try {
    const result = await call('annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget', {
      financial_year: filters.financialYear,
      month: 'March',
      table_name_filter: 'Number Card',
    })
    unitWiseRaw.value = result || []
  } catch (e) {
    unitWiseError.value = e
    unitWiseRaw.value = []
  } finally {
    unitWiseLoading.value = false
    await nextTick()
    renderShareChart()
    // The Quarterly Allocation Trend / Month-wise Budget canvases live in
    // the same v-if="unitWiseLoading" branch as the Budget Share doughnut -
    // they only exist in the DOM once THIS load finishes, not
    // loadQuarterlyTrend()'s own load. Both fetches run in parallel from
    // onMounted/the FY watcher, so whichever resolves first must still
    // (re-)render once this one reveals the canvases - both render
    // functions no-op harmlessly if quarterlyTrendHeads hasn't arrived yet.
    renderQuarterlyTrendChart()
    renderMonthlyBudgetChart()
    // Same race as above, in the other direction: loadMonthlyByUnit() needs
    // unitWiseRaw (populated by THIS function) - if loadQuarterlyTrend()
    // resolved first and already tried calling it, unitWiseRaw was still
    // empty and it bailed out silently, so it must be retried here too.
    loadMonthlyByUnit()
  }
}

const consolidatedEntry = computed(() => unitWiseRaw.value.find((e) => e.settings_doc === 'CONSOLIDATED') || null)
const consolidatedHeadsNode = computed(() => {
  const actuals = (consolidatedEntry.value?.actuals || []).filter((a) => !['CAPEX TOTAL', 'OPEX TOTAL', 'OVERALL GRAND TOTAL'].includes(a.name))
  return { name: 'Overall Grand Total', items: actuals, sub_heads: [] }
})
function totalBySeqName(name) {
  const row = (consolidatedEntry.value?.actuals || []).find((a) => a.name === name)
  return row ? Number(row.ytd || 0) : 0
}
const overallTotal = computed(() => totalBySeqName('OVERALL GRAND TOTAL'))
const capexTotal = computed(() => totalBySeqName('CAPEX TOTAL'))
const opexTotal = computed(() => totalBySeqName('OPEX TOTAL'))
const capexNode = computed(() => {
  const row = (consolidatedEntry.value?.actuals || []).find((a) => a.name.trim().toUpperCase().includes('CAPITAL'))
  return row ? { ...row, name: 'Capex Total' } : { name: 'Capex Total', items: [], sub_heads: [] }
})
const opexNode = computed(() => {
  const row = (consolidatedEntry.value?.actuals || []).find((a) => a.name.trim().toUpperCase().includes('OPERATING'))
  return row ? { ...row, name: 'Opex Total' } : { name: 'Opex Total', items: [], sub_heads: [] }
})

function unitEntry(unit) {
  return unitWiseRaw.value.find((e) => e.label === unit.label) || null
}
// Each unit's own `actuals` list carries a synthetic "GRAND TOTAL" row
// (sequence_id 9999) alongside the real expense heads - useful for the
// unit-total card amount, but it shouldn't also appear as a duplicate
// "line item" once drilled into.
function unitHeads(unit) {
  return (unitEntry(unit)?.actuals || []).filter((a) => a.sequence_id !== 9999)
}
function unitTotal(unit) {
  return unitHeads(unit).reduce((sum, a) => sum + Number(a.ytd || 0), 0)
}
function unitNode(unit) {
  return { name: unit.label, items: unitHeads(unit), sub_heads: [] }
}

const mainUnits = computed(() =>
  unitWiseRaw.value.filter((e) => e.settings_doc !== 'CONSOLIDATED' && !e.is_this_sub_item).map((e) => ({ label: e.label })),
)
const subUnits = computed(() =>
  unitWiseRaw.value.filter((e) => e.settings_doc !== 'CONSOLIDATED' && e.is_this_sub_item).map((e) => ({ label: e.label })),
)
const rankedUnits = computed(() =>
  [...mainUnits.value, ...subUnits.value].sort((a, b) => unitTotal(b) - unitTotal(a)),
)

// Read straight off rankedUnits (already sorted high->low, non-zero
// filtering happens implicitly since a 0-budget unit can't be the max/min
// of a non-empty set unless every unit is 0) rather than a second sort -
// this is purely a summary of data the page already computed for the
// bar chart, not a new query.
const dashboardInsights = computed(() => {
  const units = rankedUnits.value.filter((u) => unitTotal(u) > 0)
  if (!units.length) return []

  const top = units[0]
  const bottom = units[units.length - 1]
  const top3Total = units.slice(0, 3).reduce((sum, u) => sum + unitTotal(u), 0)
  const concentrationPct = pctOf(top3Total, overallTotal.value)

  const insights = [
    {
      label: 'Highest Budget Unit',
      value: top.label,
      detail: `${formatAmount(unitTotal(top))} · ${pctOf(unitTotal(top), overallTotal.value)}% of total`,
      icon: 'trending-up',
      color: '#1baf7a',
      onClick: () => openDrilldown(unitNode(top), 'ytd'),
    },
  ]
  if (units.length > 1 && bottom !== top) {
    insights.push({
      label: 'Lowest Budget Unit',
      value: bottom.label,
      detail: `${formatAmount(unitTotal(bottom))} · ${pctOf(unitTotal(bottom), overallTotal.value)}% of total`,
      icon: 'trending-down',
      color: '#e34948',
      onClick: () => openDrilldown(unitNode(bottom), 'ytd'),
    })
  }
  if (units.length >= 3) {
    insights.push({
      label: 'Budget Concentration',
      value: `${concentrationPct}%`,
      detail: 'held by the top 3 units',
      icon: 'target',
      color: '#2a78d6',
      onClick: () => openDrilldown(
        { name: 'Top 3 Units', items: units.slice(0, 3).map((u) => unitNode(u)), sub_heads: [] },
        'ytd',
      ),
    })
  }
  // Opex : Capex ratio - a different lens than the raw totals already shown
  // in the banner cards above (a ratio reads faster than eyeballing two
  // separate Cr figures for "which spending style dominates").
  if (capexTotal.value > 0 || opexTotal.value > 0) {
    const capexShare = pctOf(capexTotal.value, overallTotal.value)
    insights.push({
      label: 'Opex : Capex Split',
      value: `${100 - capexShare}% : ${capexShare}%`,
      detail: `${formatAmount(opexTotal.value)} operating vs ${formatAmount(capexTotal.value)} capital`,
      icon: 'pie-chart',
      color: '#e8792a',
      onClick: () => openDrilldown(consolidatedHeadsNode.value, 'ytd'),
    })
  }
  // Peak allocation month - depends on the separately-loaded quarterly
  // trend data (heads carrying q1..q4), so this insight only appears once
  // that fetch has resolved rather than blocking on it.
  if (quarterlyTrendHeads.value.length) {
    const totals = monthlyTotals(quarterlyTrendHeads.value)
    const peakIdx = totals.reduce((best, v, i) => (v > totals[best] ? i : best), 0)
    if (totals[peakIdx] > 0) {
      insights.push({
        label: 'Peak Allocation Month',
        value: MONTH_LABELS[peakIdx],
        detail: `${formatAmount(totals[peakIdx])} budgeted`,
        icon: 'calendar',
        color: '#8b5cf6',
        onClick: () => {
          const monthItems = quarterlyTrendHeads.value.map((head) => ({
            name: head.name, items: [], sub_heads: [], ytd: monthValue(head, peakIdx),
          }))
          openDrilldown({ name: `${MONTH_LABELS[peakIdx]} Budget`, items: monthItems, sub_heads: [] }, 'ytd')
        },
      })
    }
  }
  return insights
})

const shareCanvasRef = ref(null)
let shareChart = null
function tickColor() {
  return isDarkMode() ? '#f9fafb' : '#6b7280'
}

// --- Quarterly Allocation Trend (Tab 1) ----------------------------------
// A new lens the rest of the dashboard doesn't cover: every other chart here
// is a point-in-time share/breakdown, never a trend over the year. Sourced
// from get_consolidated_report, whose head rows carry q1-q4 (each a
// [3 months] array) - the same shape get_budget_summary's AI tool already
// sums for its grand total, reused here per-quarter instead of collapsed
// into one number.
const quarterlyTrendLoading = ref(false)
const quarterlyTrendHeads = ref([])

function quarterTotal(head, key) {
  return (head?.[key] || []).reduce((sum, n) => sum + Number(n || 0), 0)
}

async function loadQuarterlyTrend() {
  if (!filters.financialYear) return
  quarterlyTrendLoading.value = true
  try {
    const result = await call('annual_budget.api.phase_sheet.get_consolidated_report', {
      financial_year: filters.financialYear,
    })
    quarterlyTrendHeads.value = result || []
  } catch (e) {
    quarterlyTrendHeads.value = []
  } finally {
    quarterlyTrendLoading.value = false
    await nextTick()
    renderQuarterlyTrendChart()
    renderMonthlyBudgetChart()
  }
  loadMonthlyByUnit()
}

// --- Month-wise Budget by Unit (Tab 1) -----------------------------------
// get_consolidated_report only ever returns ONE combined head list - it has
// no per-unit breakdown option even though it accepts a `units` filter
// (comma-joined Unit.name values). To get per-unit month totals, this
// calls it once per dashboard "unit" entry, scoped to that entry's own
// Unit names. get_unit_wise_plan_budget's response doesn't carry those
// Unit names itself (its `label`/`settings_doc` are display strings), so
// get_number_card_settings() - already public, already reads the same
// "Overview number cards settings" source - is called once to build a
// settings_doc -> units[] map, joined against unitWiseRaw's entries by
// that same settings_doc key. Both calls run once per FY change, not on
// every render.
const monthlyByUnitLoading = ref(false)
const monthlyByUnitSeries = ref([]) // [{ label, totals: [12 month numbers] }]

async function loadMonthlyByUnit() {
  if (!filters.financialYear || !unitWiseRaw.value.length) return
  monthlyByUnitLoading.value = true
  try {
    const cardSettings = await call('annual_budget.api.phase_sheet.get_number_card_settings')
    const unitsBySettingsDoc = {}
    for (const card of cardSettings || []) {
      if (card.settings_doc) unitsBySettingsDoc[card.settings_doc] = (card.units || []).filter(Boolean)
    }

    // Only top units by YTD total (rankedUnits is already sorted) - a
    // per-unit HTTP call for every single sub-unit too would multiply the
    // request count for marginal chart value, since a stacked bar with 15+
    // series is unreadable anyway. Matches the same "top N, rest grouped"
    // pattern used for chart legibility elsewhere in this file (e.g.
    // dashboardInsights' top-3 concentration).
    const topEntries = mainUnits.value
      .map((u) => unitWiseRaw.value.find((e) => e.label === u.label))
      .filter(Boolean)
      .sort((a, b) => unitTotal({ label: b.label }) - unitTotal({ label: a.label }))
      .slice(0, 6)

    const results = await Promise.all(
      topEntries.map(async (entry) => {
        const unitsStr = (unitsBySettingsDoc[entry.settings_doc] || []).join(',')
        if (!unitsStr) return { label: entry.label, totals: new Array(12).fill(0) }
        try {
          const heads = await call('annual_budget.api.phase_sheet.get_consolidated_report', {
            financial_year: filters.financialYear,
            units: unitsStr,
          })
          return { label: entry.label, totals: monthlyTotals(heads || []) }
        } catch (e) {
          return { label: entry.label, totals: new Array(12).fill(0) }
        }
      }),
    )
    monthlyByUnitSeries.value = results.filter((r) => r.totals.some((v) => v > 0))
  } catch (e) {
    monthlyByUnitSeries.value = []
  } finally {
    monthlyByUnitLoading.value = false
    await nextTick()
    renderMonthlyByUnitChart()
  }
}

const quarterlyTrendRef = ref(null)
let quarterlyTrendChart = null
const QUARTERS = ['q1', 'q2', 'q3', 'q4']
const QUARTER_LABELS = ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)']

function renderQuarterlyTrendChart() {
  if (!quarterlyTrendRef.value || !quarterlyTrendHeads.value.length) return
  quarterlyTrendChart?.destroy()
  quarterlyTrendChart = new Chart(quarterlyTrendRef.value, {
    type: 'bar',
    data: {
      labels: QUARTER_LABELS,
      datasets: quarterlyTrendHeads.value.map((head, i) => ({
        label: head.name,
        data: QUARTERS.map((q) => quarterTotal(head, q)),
        backgroundColor: accentColor(i),
      })),
    },
    plugins: [stackedTotalLabelsPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 16 } },
      onClick: (evt, elements) => {
        if (!elements.length) return
        const { datasetIndex, index: qi } = elements[0]
        const head = quarterlyTrendHeads.value[datasetIndex]
        if (!head) return
        openDrilldown({ ...head, name: `${head.name} — ${QUARTER_LABELS[qi]}`, ytd: quarterTotal(head, QUARTERS[qi]) }, 'ytd')
      },
      onHover: (evt, elements) => {
        evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'
      },
      scales: {
        x: { stacked: true, ticks: { color: tickColor() }, grid: { display: false } },
        y: { stacked: true, ticks: { color: tickColor(), callback: (v) => formatAmount(v) }, grid: { color: isDarkMode() ? '#374151' : '#e5e7eb' } },
      },
      plugins: {
        legend: { position: 'bottom', labels: { color: tickColor(), boxWidth: 10, padding: 8, font: { size: 10 } } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}` } },
      },
    },
  })
}

// --- Month-wise Budget Allocation (Tab 1) --------------------------------
// Same source as the Quarterly Trend chart above (get_consolidated_report's
// q1..q4, each a [month1, month2, month3] array) - unpacked to all 12
// months here instead of collapsed to 4 quarter totals, so this is a
// finer-grained view of the exact same already-fetched data, not a second
// network call.
const MONTH_LABELS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

function monthlyTotals(heads) {
  const totals = new Array(12).fill(0)
  for (const head of heads || []) {
    QUARTERS.forEach((q, qi) => {
      const months = head?.[q] || []
      for (let mi = 0; mi < 3; mi++) {
        totals[qi * 3 + mi] += Number(months[mi] || 0)
      }
    })
  }
  return totals
}

// Draws each bar's own value in Cr just above its top - Chart.js core has
// no data-label support, so (matching percentLabelsPlugin's approach
// below) this is a small inline plugin rather than a new dependency for
// one label per bar. Works for both single-series and stacked/grouped bar
// charts: it walks every dataset's own meta.data so each series' bars get
// their own label, not just the first series.
const barValueLabelsPlugin = {
  id: 'barValueLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    ctx.save()
    ctx.font = '600 10px sans-serif'
    ctx.fillStyle = isDarkMode() ? '#e5e7eb' : '#1f2937'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    chart.data.datasets.forEach((dataset, di) => {
      const meta = chart.getDatasetMeta(di)
      if (meta.hidden) return
      meta.data.forEach((bar, i) => {
        const value = Number(dataset.data[i]) || 0
        if (!value) return
        ctx.fillText(formatAmount(value), bar.x, bar.y - 4)
      })
    })
    ctx.restore()
  },
}

// Same idea as barValueLabelsPlugin, but for a STACKED bar chart: labeling
// every segment of every stack would overlap/clutter (a category can have
// 5+ series stacked on it), so this labels only each stack's grand total,
// positioned above the topmost (last-drawn) segment.
const stackedTotalLabelsPlugin = {
  id: 'stackedTotalLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    const datasets = chart.data.datasets
    if (!datasets.length) return
    const categoryCount = (datasets[0]?.data || []).length
    ctx.save()
    ctx.font = '600 10px sans-serif'
    ctx.fillStyle = isDarkMode() ? '#e5e7eb' : '#1f2937'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    for (let ci = 0; ci < categoryCount; ci++) {
      let total = 0
      let topBar = null
      datasets.forEach((dataset, di) => {
        const meta = chart.getDatasetMeta(di)
        if (meta.hidden) return
        total += Number(dataset.data[ci]) || 0
        if (Number(dataset.data[ci])) topBar = meta.data[ci]
      })
      if (!total || !topBar) continue
      ctx.fillText(formatAmount(total), topBar.x, topBar.y - 4)
    }
    ctx.restore()
  },
}

const monthlyBudgetRef = ref(null)
let monthlyBudgetChart = null

function renderMonthlyBudgetChart() {
  if (!monthlyBudgetRef.value || !quarterlyTrendHeads.value.length) return
  const totals = monthlyTotals(quarterlyTrendHeads.value)
  monthlyBudgetChart?.destroy()
  monthlyBudgetChart = new Chart(monthlyBudgetRef.value, {
    type: 'bar',
    data: {
      labels: MONTH_LABELS,
      datasets: [{ label: 'Budget', data: totals, backgroundColor: accentColor(0), borderRadius: 3, maxBarThickness: 36 }],
    },
    plugins: [barValueLabelsPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 16 } },
      onClick: (evt, elements) => {
        if (!elements.length || !quarterlyTrendHeads.value.length) return
        const mi = elements[0].index
        const monthItems = quarterlyTrendHeads.value.map((head) => ({
          name: head.name,
          items: [],
          sub_heads: [],
          ytd: monthValue(head, mi),
        }))
        openDrilldown({ name: `${MONTH_LABELS[mi]} Budget`, items: monthItems, sub_heads: [] }, 'ytd')
      },
      onHover: (evt, elements) => {
        evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'
      },
      scales: {
        x: { ticks: { color: tickColor() }, grid: { display: false } },
        y: { ticks: { color: tickColor(), callback: (v) => formatAmount(v) }, grid: { color: isDarkMode() ? '#374151' : '#e5e7eb' } },
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => formatAmount(ctx.parsed.y) } },
      },
    },
  })
}

// One number out of a head's own q1..q4 arrays for a single month index
// (0-11) - the same unpacking monthlyTotals() does across ALL heads
// summed together, but for one head at a time so a month-bar click can
// build a synthetic per-head breakdown node for that month specifically.
function monthValue(head, monthIndex) {
  const qi = Math.floor(monthIndex / 3)
  const mi = monthIndex % 3
  const months = head?.[QUARTERS[qi]] || []
  return Number(months[mi] || 0)
}

const monthlyByUnitRef = ref(null)
let monthlyByUnitChart = null

function renderMonthlyByUnitChart() {
  if (!monthlyByUnitRef.value || !monthlyByUnitSeries.value.length) return
  monthlyByUnitChart?.destroy()
  // A multi-line chart instead of stacked bars: one unit's own month-to-month
  // pattern is much easier to follow along a single colored line than
  // picking its segment out of a stack repeated 12 times - the tradeoff is
  // no single glance at a combined monthly total (the separate Month-wise
  // Budget Allocation chart above already covers that).
  monthlyByUnitChart = new Chart(monthlyByUnitRef.value, {
    type: 'line',
    data: {
      labels: MONTH_LABELS,
      datasets: monthlyByUnitSeries.value.map((series, i) => ({
        label: series.label,
        data: series.totals,
        borderColor: accentColor(i),
        backgroundColor: accentColor(i),
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: tickColor() }, grid: { display: false } },
        y: { ticks: { color: tickColor(), callback: (v) => formatAmount(v) }, grid: { color: isDarkMode() ? '#374151' : '#e5e7eb' } },
      },
      onClick: (evt, elements) => {
        if (!elements.length) return
        const { datasetIndex, index: mi } = elements[0]
        const series = monthlyByUnitSeries.value[datasetIndex]
        if (!series) return
        openDrilldown(
          { name: `${series.label} — ${MONTH_LABELS[mi]}`, items: [{ name: MONTH_LABELS[mi], ytd: series.totals[mi], items: [], sub_heads: [] }], sub_heads: [] },
          'ytd',
        )
      },
      onHover: (evt, elements) => {
        evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'
      },
      plugins: {
        legend: { position: 'bottom', labels: { color: tickColor(), boxWidth: 10, padding: 8, font: { size: 10 } } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}` } },
      },
    },
  })
}

// Draws each slice's percentage-of-total directly on the doughnut, roughly
// centered in its own ring segment - Chart.js core has no data-label
// support at all, and pulling in chartjs-plugin-datalabels for one label
// per slice isn't worth a new dependency, so this is a small inline
// plugin registered only on this chart's own options.plugins.percentLabels
// (not chart.js's global registry), scoped to this chart instance only.
const percentLabelsPlugin = {
  id: 'percentLabels',
  afterDraw(chart) {
    const { ctx } = chart
    const meta = chart.getDatasetMeta(0)
    const total = (chart.data.datasets[0]?.data || []).reduce((s, v) => s + (Number(v) || 0), 0)
    if (!total) return
    ctx.save()
    ctx.font = '600 11px sans-serif'
    ctx.fillStyle = isDarkMode() ? '#f9fafb' : '#1f2937'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    meta.data.forEach((arc, i) => {
      const value = Number(chart.data.datasets[0].data[i]) || 0
      const pct = (value / total) * 100
      if (pct < 4) return // too thin a slice to fit a label without overlap
      const { x, y } = arc.tooltipPosition()
      ctx.fillText(`${pct.toFixed(0)}%`, x, y)
    })
    ctx.restore()
  },
}

function renderShareChart() {
  if (!shareCanvasRef.value) return
  const units = mainUnits.value.filter((u) => unitTotal(u) > 0)
  const total = units.reduce((s, u) => s + unitTotal(u), 0)
  const pctOfTotal = (v) => (total ? (v / total) * 100 : 0)
  shareChart?.destroy()
  shareChart = new Chart(shareCanvasRef.value, {
    type: 'doughnut',
    data: {
      labels: units.map((u) => u.label),
      datasets: [{
        data: units.map((u) => unitTotal(u)),
        backgroundColor: units.map((_, i) => accentColor(i)),
        // A visible gap between adjacent slices (rather than borderWidth:0,
        // which lets them touch directly) - without it, a very small slice
        // (e.g. a 2% share) reads as a stray seam/rendering glitch between
        // its two neighbors instead of an intentional thin segment, since
        // there's nothing marking where one color's boundary actually is.
        // The border color matches the card's own surface (not the slice
        // colors) so it reads as a gap, not a colored ring.
        borderWidth: 2,
        borderColor: isDarkMode() ? '#111827' : '#ffffff',
      }],
    },
    plugins: [percentLabelsPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (evt, elements) => {
        if (!elements.length) return
        openDrilldown(unitNode(units[elements[0].index]), 'ytd')
      },
      onHover: (evt, elements) => {
        evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: tickColor(),
            boxWidth: 10,
            padding: 8,
            font: { size: 10 },
            // Default Chart.js legend only repeats each slice's label - the
            // percentage is appended here so it reads directly off the
            // legend too, not just the in-chart labels/tooltip.
            generateLabels: (chart) =>
              chart.data.labels.map((label, i) => ({
                text: `${label} (${pctOfTotal(chart.data.datasets[0].data[i]).toFixed(0)}%)`,
                fillStyle: chart.data.datasets[0].backgroundColor[i],
                index: i,
              })),
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${formatAmount(ctx.parsed)} (${pctOfTotal(ctx.parsed).toFixed(1)}%)`,
          },
        },
      },
    },
  })
}

// =========================================================================
// TAB 2: Work Plan Views
// =========================================================================
const pieChartLoading = ref(false)
const pieChartError = ref(null)
const pieChartErrorMessage = computed(() => pieChartError.value?.messages?.[0] || pieChartError.value?.message || 'Something went wrong loading work plan views.')
const pieChartRaw = ref([])
let pieChartLoaded = false

async function loadPieChart() {
  if (!filters.financialYear || pieChartLoaded) return
  pieChartLoading.value = true
  pieChartError.value = null
  try {
    const result = await call('annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget', {
      financial_year: filters.financialYear,
      month: 'March',
      table_name_filter: 'Pie Chart',
    })
    pieChartRaw.value = result || []
    pieChartLoaded = true
  } catch (e) {
    pieChartError.value = e
    pieChartRaw.value = []
  } finally {
    pieChartLoading.value = false
    await nextTick()
    renderWorkPlanCharts()
  }
}

const pieConsolidated = computed(() => pieChartRaw.value.find((e) => e.settings_doc === 'CONSOLIDATED') || null)
const workPlanHeads = computed(() => (pieConsolidated.value?.actuals || []).filter((a) => !String(a.sequence_id).startsWith('999')))
const workPlanTotal = computed(() => workPlanHeads.value.reduce((sum, h) => sum + treeTotal(h, nodeBudget), 0))
const grantsItems = computed(() => findItemsByName(workPlanHeads.value, 'Grants & Donations'))
const directWorkItems = computed(() => findItemsExcluding(workPlanHeads.value, 'Grants & Donations'))
const grantsTotal = computed(() => grantsItems.value.reduce((sum, i) => sum + nodeBudget(i), 0))
const directWorkTotal = computed(() => Math.max(0, workPlanTotal.value - grantsTotal.value))

// Same synthetic "GRAND TOTAL" row (sequence_id 9999) exclusion as Tab 1's
// unitHeads() - each unit's actuals list carries it alongside the real
// expense heads, and summing treeTotal() over every entry would double
// count it on top of the real heads.
const pieUnits = computed(() =>
  pieChartRaw.value
    .filter((e) => e.settings_doc !== 'CONSOLIDATED')
    .map((e) => ({ label: e.label, actuals: (e.actuals || []).filter((a) => a.sequence_id !== 9999) })),
)

function unitGrantsTotal(unit) {
  return findItemsByName(unit.actuals || [], 'Grants & Donations').reduce((sum, i) => sum + nodeBudget(i), 0)
}
function unitOwnTotal(unit) {
  return (unit.actuals || []).reduce((sum, a) => sum + treeTotal(a, nodeBudget), 0)
}

const workPlanInsights = computed(() => {
  if (!workPlanTotal.value) return []
  const insights = [
    {
      label: directWorkTotal.value >= grantsTotal.value ? 'Direct Work Leads' : 'Grants Lead',
      value: `${pctOf(Math.max(directWorkTotal.value, grantsTotal.value), workPlanTotal.value)}%`,
      detail: directWorkTotal.value >= grantsTotal.value ? 'of budget is Direct Work' : 'of budget is Grants & Donations',
      icon: 'pie-chart',
      color: directWorkTotal.value >= grantsTotal.value ? '#1e5fa8' : '#e8792a',
    },
  ]

  const unitsByGrantsShare = pieUnits.value
    .map((u) => ({ label: u.label, own: unitOwnTotal(u), share: pctOf(unitGrantsTotal(u), unitOwnTotal(u)) }))
    .filter((u) => u.own > 0)
    .sort((a, b) => b.share - a.share)
  if (unitsByGrantsShare.length) {
    const top = unitsByGrantsShare[0]
    insights.push({
      label: 'Most Grants-Reliant Unit',
      value: top.label,
      detail: `${top.share}% of its budget is Grants & Donations`,
      icon: 'gift',
      color: '#e8792a',
    })
  }
  return insights
})

const workplanPieRef = ref(null)
const directWorkUnitRef = ref(null)
const grantsUnitRef = ref(null)
let workplanPieChart = null
let directWorkUnitChart = null
let grantsUnitChart = null

function renderWorkPlanCharts() {
  if (workplanPieRef.value) {
    workplanPieChart?.destroy()
    const segments = [
      { label: 'Direct Work', value: directWorkTotal.value, color: '#1e5fa8' },
      { label: 'Grants & Donations', value: grantsTotal.value, color: '#e8792a' },
    ].filter((s) => s.value > 0)
    workplanPieChart = new Chart(workplanPieRef.value, {
      type: 'pie',
      data: { labels: segments.map((s) => s.label), datasets: [{ data: segments.map((s) => s.value), backgroundColor: segments.map((s) => s.color), borderWidth: 2, borderColor: isDarkMode() ? '#111827' : '#ffffff' }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, elements) => {
          if (!elements.length) return
          const seg = segments[elements[0].index]
          const items = seg.label === 'Grants & Donations' ? grantsItems.value : directWorkItems.value
          openDrilldown({ name: seg.label, items, sub_heads: [] }, 'ytd')
        },
        onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default' },
        plugins: {
          legend: { position: 'bottom', labels: { color: tickColor(), boxWidth: 10, padding: 12 } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatAmount(ctx.parsed)}` } },
        },
      },
    })
  }

  if (directWorkUnitRef.value) {
    directWorkUnitChart?.destroy()
    const units = pieUnits.value
      .map((u) => ({ unit: u, label: u.label, value: Math.max(0, unitOwnTotal(u) - unitGrantsTotal(u)) }))
      .filter((u) => u.value > 0)
    directWorkUnitChart = new Chart(directWorkUnitRef.value, {
      type: 'doughnut',
      data: { labels: units.map((u) => u.label), datasets: [{ data: units.map((u) => u.value), backgroundColor: units.map((_, i) => accentColor(i)), borderWidth: 2, borderColor: isDarkMode() ? '#111827' : '#ffffff' }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, elements) => {
          if (!elements.length) return
          const u = units[elements[0].index]
          openDrilldown({ name: `${u.label} — Direct Work`, items: findItemsExcluding(u.unit.actuals || [], 'Grants & Donations'), sub_heads: [] }, 'ytd')
        },
        onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default' },
        plugins: {
          legend: { position: 'bottom', labels: { color: tickColor(), boxWidth: 10, padding: 8, font: { size: 10 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatAmount(ctx.parsed)}` } },
        },
      },
    })
  }

  if (grantsUnitRef.value) {
    grantsUnitChart?.destroy()
    const units = pieUnits.value
      .map((u) => ({ unit: u, label: u.label, value: unitGrantsTotal(u) }))
      .filter((u) => u.value > 0)
    grantsUnitChart = new Chart(grantsUnitRef.value, {
      type: 'doughnut',
      data: { labels: units.map((u) => u.label), datasets: [{ data: units.map((u) => u.value), backgroundColor: units.map((_, i) => accentColor(i)), borderWidth: 2, borderColor: isDarkMode() ? '#111827' : '#ffffff' }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, elements) => {
          if (!elements.length) return
          const u = units[elements[0].index]
          openDrilldown({ name: `${u.label} — Grants & Donations`, items: findItemsByName(u.unit.actuals || [], 'Grants & Donations'), sub_heads: [] }, 'ytd')
        },
        onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default' },
        plugins: {
          legend: { position: 'bottom', labels: { color: tickColor(), boxWidth: 10, padding: 8, font: { size: 10 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatAmount(ctx.parsed)}` } },
        },
      },
    })
  }
}

// =========================================================================
// TAB 3: Budget vs Actuals Breakdown
// =========================================================================
const baFilters = reactive({ units: [], costCenters: [], locationCodes: [] })
const baMonth = ref('March')
const baMonthSelection = computed({
  get: () => (baMonth.value ? [baMonth.value] : []),
  set: (values) => { baMonth.value = values.length ? values[values.length - 1] : 'March' },
})
const baCostCenterOptions = ref([])
const baLocationCodeOptions = ref([])

watch(() => baFilters.units.slice(), async (newUnits, oldUnits) => {
  if (JSON.stringify(newUnits) === JSON.stringify(oldUnits || [])) return
  baFilters.costCenters = []
  baFilters.locationCodes = []
  if (!baFilters.units.length) {
    baCostCenterOptions.value = []
    baLocationCodeOptions.value = []
    return
  }
  const [cc, loc] = await Promise.all([
    call('annual_budget.api.filter_options.get_cost_centers_by_set_id', { units: baFilters.units.join(',') }),
    call('annual_budget.api.filter_options.get_location_codes_by_unit', { unit: baFilters.units.join(',') }),
  ])
  baCostCenterOptions.value = toOptions(cc?.data)
  baLocationCodeOptions.value = toOptions(loc?.data)
})

const actualsLoading = ref(false)
const actualsError = ref(null)
const actualsErrorMessage = computed(() => actualsError.value?.messages?.[0] || actualsError.value?.message || 'Something went wrong loading budget vs actuals.')
const actualsHeads = ref([])

async function loadActuals() {
  if (!filters.financialYear) return
  actualsLoading.value = true
  actualsError.value = null
  try {
    const result = await call('annual_budget.api.phase_sheet.get_combined_actuals', {
      financial_year: filters.financialYear,
      month: baMonth.value,
      unit: baFilters.units.join(',') || undefined,
      cost_center: baFilters.costCenters.join(',') || undefined,
      location_code: baFilters.locationCodes.join(',') || undefined,
    })
    actualsHeads.value = result || []
  } catch (e) {
    actualsError.value = e
    actualsHeads.value = []
  } finally {
    actualsLoading.value = false
    await nextTick()
    renderActualsCharts()
  }
}

const actualsHeadsWithSubs = computed(() => actualsHeads.value.filter((h) => h.sub_heads?.length))
const actualsGrandBudget = computed(() => actualsHeads.value.reduce((sum, h) => sum + treeTotal(h, nodeBudget), 0))
const actualsGrandActual = computed(() => actualsHeads.value.reduce((sum, h) => sum + treeTotal(h, nodeActual), 0))
const actualsGrandUtil = computed(() => (actualsGrandBudget.value > 0 ? Math.round((actualsGrandActual.value / actualsGrandBudget.value) * 100) : 0))

// Heads plus their sub-heads, each carrying its own utilization % - the
// same rows already shown as cards, just flattened into one list to rank
// by utilization instead of by document order.
const actualsRankableRows = computed(() => {
  const rows = []
  for (const head of actualsHeads.value) {
    if (treeTotal(head, nodeBudget) > 0) rows.push(head)
    for (const sub of head.sub_heads || []) {
      if (treeTotal(sub, nodeBudget) > 0) rows.push(sub)
    }
  }
  return rows
})

const actualsInsights = computed(() => {
  const rows = actualsRankableRows.value
  if (!rows.length) return []

  const ranked = [...rows].sort((a, b) => utilizationPct(b) - utilizationPct(a))
  const highest = ranked[0]
  const lowest = ranked[ranked.length - 1]
  const overCount = rows.filter((r) => utilizationPct(r) > 100).length

  const insights = [
    {
      label: 'Highest Utilization',
      value: highest.name,
      detail: `${utilizationPct(highest)}% of ${formatAmount(treeTotal(highest, nodeBudget))} budget spent`,
      icon: 'alert-triangle',
      color: utilizationColor(utilizationPct(highest)),
    },
  ]
  if (lowest !== highest) {
    insights.push({
      label: 'Lowest Utilization',
      value: lowest.name,
      detail: `${utilizationPct(lowest)}% of ${formatAmount(treeTotal(lowest, nodeBudget))} budget spent`,
      icon: 'battery',
      color: utilizationColor(utilizationPct(lowest)),
    })
  }
  insights.push({
    label: 'Over Budget',
    value: `${overCount} of ${rows.length}`,
    detail: overCount ? 'heads/sub-heads exceeding 100% utilization' : 'nothing over budget yet',
    icon: 'alert-circle',
    color: overCount ? '#e34948' : '#1baf7a',
  })
  return insights
})

const baBudgetPieRef = ref(null)
const baActualPieRef = ref(null)
let baBudgetPieChart = null
let baActualPieChart = null

function renderActualsCharts() {
  if (baBudgetPieRef.value) {
    baBudgetPieChart?.destroy()
    const heads = actualsHeads.value.filter((h) => treeTotal(h, nodeBudget) > 0)
    baBudgetPieChart = new Chart(baBudgetPieRef.value, {
      type: 'doughnut',
      data: { labels: heads.map((h) => h.name), datasets: [{ data: heads.map((h) => treeTotal(h, nodeBudget)), backgroundColor: heads.map((_, i) => accentColor(i)), borderWidth: 2, borderColor: isDarkMode() ? '#111827' : '#ffffff' }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, elements) => { if (elements.length) openDrilldown(heads[elements[0].index], 'actuals') },
        onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default' },
        plugins: {
          legend: { position: 'bottom', labels: { color: tickColor(), boxWidth: 10, padding: 10 } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatAmount(ctx.parsed)}` } },
        },
      },
    })
  }
  if (baActualPieRef.value) {
    baActualPieChart?.destroy()
    const heads = actualsHeads.value.filter((h) => treeTotal(h, nodeActual) > 0)
    baActualPieChart = new Chart(baActualPieRef.value, {
      type: 'doughnut',
      data: { labels: heads.map((h) => h.name), datasets: [{ data: heads.map((h) => treeTotal(h, nodeActual)), backgroundColor: heads.map((_, i) => accentColor(i)), borderWidth: 2, borderColor: isDarkMode() ? '#111827' : '#ffffff' }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, elements) => { if (elements.length) openDrilldown(heads[elements[0].index], 'actuals') },
        onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default' },
        plugins: {
          legend: { position: 'bottom', labels: { color: tickColor(), boxWidth: 10, padding: 10 } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatAmount(ctx.parsed)}` } },
        },
      },
    })
  }
}

// --- Tab switching / reactivity -----------------------------------------
watch(activeTab, (tab) => {
  if (tab === 'dashboard' && !unitWiseRaw.value.length) loadUnitWise()
  if (tab === 'workplan') loadPieChart()
})
watch(() => filters.financialYear, () => {
  if (activeTab.value === 'dashboard') { loadUnitWise(); loadQuarterlyTrend() }
  if (activeTab.value === 'workplan') { pieChartLoaded = false; loadPieChart() }
})
watch(showFullNumbers, () => {
  renderShareChart()
  renderWorkPlanCharts()
  renderActualsCharts()
  renderQuarterlyTrendChart()
  renderMonthlyBudgetChart()
  renderMonthlyByUnitChart()
})

onMounted(async () => {
  await loadFinancialYears()
  await Promise.all([loadUnits(), loadUnitWise(), loadQuarterlyTrend()])
})
</script>
