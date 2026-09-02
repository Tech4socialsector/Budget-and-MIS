<!--
  Budget vs Actual - a dedicated Vue port of the Desk page at
  annual_budget/annual_budget_mis/page/budget_actuals_phase/
  budget_actuals_phase.js (only the last of 8 revisions in that file is
  live - see its own on_page_load, at the very end of the file).

  Reuses the same filters/cards/pie-charts pattern already built for
  BudgetDashboard.vue's "Budget vs Actuals Breakdown" tab (which stays in
  place as a quicker summary view) - this page adds what that tab doesn't
  have: a full expandable Expense Head -> Sub Head -> Item table with a
  search box, an expand-all toggle, and an Excel export, matching the
  Desk page's own feature set.
-->
<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <!-- Filters -->
      <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Financial Year</label>
            <MultiSelect v-model="financialYearSelection" :options="financialYearOptions" placeholder="Select year" class="w-full" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">YTD Month</label>
            <MultiSelect v-model="monthSelection" :options="MONTH_OPTIONS" placeholder="Select month" class="w-full" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Operating Units</label>
            <MultiSelect v-model="themeSelection" :options="themeOptions" :loading="themeLoading" placeholder="All operating units" class="w-full" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Unit</label>
            <MultiSelect v-model="baFilters.units" :options="unitOptions" placeholder="All units" class="w-full" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Cost Center</label>
            <MultiSelect v-model="baFilters.costCenters" :options="costCenterOptions" :disabled="!baFilters.units.length" placeholder="All cost centers" class="w-full" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Location Code</label>
            <MultiSelect v-model="baFilters.locationCodes" :options="locationCodeOptions" :disabled="!baFilters.units.length" placeholder="All location codes" class="w-full" />
          </div>
        </div>
        <Button variant="solid" class="self-start" :loading="actualsLoading" @click="loadActuals">
          <template #prefix><FeatherIcon name="search" class="h-4 w-4" /></template>
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

        <InsightStrip :insights="actualsInsights" />

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div class="text-center text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Budget Breakdown</div>
            <div class="mt-3 h-64">
              <canvas ref="budgetPieRef" />
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div class="text-center text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Actuals Breakdown</div>
            <div class="mt-3 h-64">
              <canvas ref="actualPieRef" />
            </div>
          </div>
        </div>

        <!-- Detailed table: search + expand-all + Excel export, then the
        full Expense Head -> Sub Head -> Item tree - the piece the
        Dashboard's own "Budget vs Actuals Breakdown" tab doesn't have. -->
        <div class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4 dark:border-gray-800">
            <FormControl type="text" v-model="tableSearch" placeholder="Search Expense Head / Sub Head / Item..." class="fc-search-input">
              <template #prefix><FeatherIcon name="search" class="h-4 w-4 text-gray-400" /></template>
            </FormControl>
            <div class="flex items-center gap-4">
              <Switch v-model="expandAll" label="Expand all" />
              <Button variant="outline" :loading="exporting" @click="exportExcel">
                <template #prefix><FeatherIcon name="download" class="h-4 w-4" /></template>
                Export Excel
              </Button>
            </div>
          </div>

          <div class="fc-scroll-wrapper !border-0 !rounded-none">
            <table class="fc-table w-full min-w-[720px] text-sm">
              <thead>
                <tr class="fc-thead-main">
                  <th class="fc-th fc-sticky-col min-w-[280px] text-left">Expense Head / Sub Head / Item</th>
                  <th class="fc-th text-right">Budget</th>
                  <th class="fc-th text-right">Actual</th>
                  <th class="fc-th text-right">Util %</th>
                  <th class="fc-th text-right">Variance</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="head in filteredHeads" :key="head.name">
                  <tr class="fc-row-head" @click="toggleHead(head.name)">
                    <td class="fc-td fc-sticky-col text-left">
                      <span class="inline-flex items-center gap-2">
                        <FeatherIcon :name="isHeadOpen(head.name) ? 'chevron-down' : 'chevron-right'" class="h-4 w-4" />
                        {{ head.name }}
                      </span>
                    </td>
                    <td class="fc-td text-right">{{ formatAmount(treeTotal(head, nodeBudget)) }}</td>
                    <td class="fc-td text-right">{{ formatAmount(treeTotal(head, nodeActual)) }}</td>
                    <td class="fc-td text-right" :style="{ color: utilizationColor(utilizationPct(head)) }">{{ utilizationPct(head) }}%</td>
                    <td class="fc-td text-right">{{ formatAmount(treeTotal(head, nodeBudget) - treeTotal(head, nodeActual)) }}</td>
                  </tr>

                  <template v-if="isHeadOpen(head.name)">
                    <template v-for="sub in head.sub_heads || []" :key="head.name + '::' + sub.name">
                      <tr class="fc-row-sub" @click.stop="toggleSub(head.name, sub.name)">
                        <td class="fc-td fc-sticky-col pl-8 text-left">
                          <span class="inline-flex items-center gap-2">
                            <FeatherIcon :name="isSubOpen(head.name, sub.name) ? 'chevron-down' : 'chevron-right'" class="h-3.5 w-3.5" />
                            {{ sub.name }}
                          </span>
                        </td>
                        <td class="fc-td text-right">{{ formatAmount(treeTotal(sub, nodeBudget)) }}</td>
                        <td class="fc-td text-right">{{ formatAmount(treeTotal(sub, nodeActual)) }}</td>
                        <td class="fc-td text-right" :style="{ color: utilizationColor(utilizationPct(sub)) }">{{ utilizationPct(sub) }}%</td>
                        <td class="fc-td text-right">{{ formatAmount(treeTotal(sub, nodeBudget) - treeTotal(sub, nodeActual)) }}</td>
                      </tr>
                      <tr
                        v-if="isSubOpen(head.name, sub.name)"
                        v-for="item in sub.items || []"
                        :key="head.name + '::' + sub.name + '::' + item.name"
                        class="cursor-pointer"
                        @click.stop="openItemGlDrilldown(item)"
                      >
                        <td class="fc-td fc-sticky-col pl-12 text-left">
                          <span class="inline-flex items-center gap-1.5">
                            {{ item.name }}
                            <FeatherIcon name="chevron-right" class="h-3 w-3 text-gray-400" />
                          </span>
                        </td>
                        <td class="fc-td text-right">{{ formatAmount(itemBudget(item)) }}</td>
                        <td class="fc-td text-right">{{ formatAmount(itemActual(item)) }}</td>
                        <td class="fc-td text-right" :style="{ color: utilizationColor(itemUtil(item)) }">{{ itemUtil(item) }}%</td>
                        <td class="fc-td text-right">{{ formatAmount(itemBudget(item) - itemActual(item)) }}</td>
                      </tr>
                    </template>
                    <!-- A head with no sub_heads carries its own items directly. -->
                    <tr
                      v-if="!head.sub_heads?.length"
                      v-for="item in head.items || []"
                      :key="head.name + '::item::' + item.name"
                      class="cursor-pointer"
                      @click.stop="openItemGlDrilldown(item)"
                    >
                      <td class="fc-td fc-sticky-col pl-8 text-left">
                        <span class="inline-flex items-center gap-1.5">
                          {{ item.name }}
                          <FeatherIcon name="chevron-right" class="h-3 w-3 text-gray-400" />
                        </span>
                      </td>
                      <td class="fc-td text-right">{{ formatAmount(itemBudget(item)) }}</td>
                      <td class="fc-td text-right">{{ formatAmount(itemActual(item)) }}</td>
                      <td class="fc-td text-right" :style="{ color: utilizationColor(itemUtil(item)) }">{{ itemUtil(item) }}%</td>
                      <td class="fc-td text-right">{{ formatAmount(itemBudget(item) - itemActual(item)) }}</td>
                    </tr>
                  </template>
                </template>
                <tr v-if="!filteredHeads.length">
                  <td class="fc-td text-center text-gray-400" colspan="5">No rows match "{{ tableSearch }}".</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="fc-row-grand">
                  <td class="fc-td fc-sticky-col text-left">GRAND TOTAL</td>
                  <td class="fc-td text-right">{{ formatAmount(actualsGrandBudget) }}</td>
                  <td class="fc-td text-right">{{ formatAmount(actualsGrandActual) }}</td>
                  <td class="fc-td text-right">{{ actualsGrandUtil }}%</td>
                  <td class="fc-td text-right">{{ formatAmount(actualsGrandBudget - actualsGrandActual) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </template>
    </div>

    <BudgetDrilldownModal
      v-model="drilldownOpen"
      :node="drilldownNode"
      total-mode="ytd"
      show-actuals
    />
  </AppLayout>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { Chart } from 'chart.js/auto'
import { MultiSelect, FormControl, FeatherIcon, ErrorMessage, Switch, Button } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import AppTooltip from '@/components/AppTooltip.vue'
import InsightStrip from '@/components/InsightStrip.vue'
import BudgetDrilldownModal from '@/components/BudgetDrilldownModal.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'
import { downloadXlsx } from '@/data/foundationConsolidatedData'
import { accentColor, formatCr, formatINR, isDarkMode } from '@/data/budgetTotals'
import { nodeActual, nodeBudget, treeTotal, utilizationColor, utilizationPct } from '@/data/dashboardData'

setPageTitle('Budget vs Actual')

const MONTH_OPTIONS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
].map((m) => ({ label: m, value: m }))

function toOptions(list) {
  return (list || []).filter((o) => o.value).map((o) => ({ label: o.label, value: o.value }))
}

function tickColor() {
  return isDarkMode() ? '#9ca3af' : '#6b7280'
}

// --- Financial Year -------------------------------------------------------
const filters = reactive({ financialYear: '' })
const financialYearOptions = ref([])
const financialYearSelection = computed({
  get: () => (filters.financialYear ? [filters.financialYear] : []),
  set: (values) => { filters.financialYear = values.length ? values[values.length - 1] : '' },
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

const unitOptions = ref([])
async function loadUnits() {
  const r = await call('annual_budget.api.filter_options.get_units')
  unitOptions.value = toOptions(r?.data)
}

// --- Other filters ----------------------------------------------------
const baFilters = reactive({ units: [], costCenters: [], locationCodes: [] })
const month = ref('March')
const monthSelection = computed({
  get: () => (month.value ? [month.value] : []),
  set: (values) => { month.value = values.length ? values[values.length - 1] : 'March' },
})
const costCenterOptions = ref([])
const locationCodeOptions = ref([])
// ERP-side cost-center/location values (actuals come from an external ERP
// keyed by its own codes, distinct from the internal doctype names used on
// the budget side) - resolved alongside costCenterOptions/locationCodeOptions
// and threaded into get_combined_actuals as erp_cost_center_value/erp_loc_value.
const erpCostCenterValues = ref([])
const erpLocationValues = ref([])

// --- Operating Units (theme) filter -----------------------------------
// A pure client-side cascade mirroring the Desk page (budget_actuals_phase.js):
// picking a theme resolves to a set of Unit/Cost Center/Location Code values
// via get_theme_mappings and overwrites those selections - the backend never
// sees "theme" itself, only the resolved Unit/CC/Location filters.
const themeOptions = ref([])
const themeLoading = ref(false)
const themeLabelToName = reactive({})
const themeSelectionNames = ref([])
const themeSelection = computed({
  get: () => themeSelectionNames.value.map((name) => Object.entries(themeLabelToName).find(([, v]) => v === name)?.[0]).filter(Boolean),
  set: (labels) => {
    themeSelectionNames.value = labels.map((label) => themeLabelToName[label]).filter(Boolean)
    applyThemeSelection()
  },
})

async function loadThemes() {
  themeLoading.value = true
  try {
    const rows = await call('annual_budget.api.filter_options.get_theme')
    for (const key of Object.keys(themeLabelToName)) delete themeLabelToName[key]
    themeOptions.value = (rows || []).map((d) => {
      themeLabelToName[d.number_card_title] = d.name
      return { label: d.number_card_title, value: d.number_card_title }
    })
  } finally {
    themeLoading.value = false
  }
}

let suppressUnitWatch = false
async function applyThemeSelection() {
  if (!themeSelectionNames.value.length) return
  const results = await Promise.all(
    themeSelectionNames.value.map((name) => call('annual_budget.api.filter_options.get_theme_mappings', { theme_name: name })),
  )
  const unitVals = new Map()
  const ccVals = new Map()
  const locVals = new Map()
  for (const r of results) {
    for (const u of r?.units || []) unitVals.set(u.value, u)
    for (const c of r?.cost_centers || []) ccVals.set(c.value, c)
    for (const l of r?.location_codes || []) locVals.set(l.value, l)
  }

  suppressUnitWatch = true
  baFilters.units = [...unitVals.keys()]
  await nextTick()
  suppressUnitWatch = false

  costCenterOptions.value = [...ccVals.values()].map((c) => ({ label: c.label, value: c.value }))
  locationCodeOptions.value = [...locVals.values()].map((l) => ({ label: l.label, value: l.value }))
  baFilters.costCenters = [...ccVals.keys()]
  baFilters.locationCodes = [...locVals.keys()]
  erpCostCenterValues.value = [...ccVals.values()].map((c) => c.erp_cost_center_value).filter(Boolean)
  erpLocationValues.value = [...locVals.values()].map((l) => l.erp_loc_value).filter(Boolean)
}

watch(() => baFilters.units.slice(), async (newUnits, oldUnits) => {
  if (suppressUnitWatch) return
  if (JSON.stringify(newUnits) === JSON.stringify(oldUnits || [])) return
  baFilters.costCenters = []
  baFilters.locationCodes = []
  erpCostCenterValues.value = []
  erpLocationValues.value = []
  if (!baFilters.units.length) {
    costCenterOptions.value = []
    locationCodeOptions.value = []
    return
  }
  const [cc, loc] = await Promise.all([
    call('annual_budget.api.filter_options.get_cost_centers_by_set_id', { units: baFilters.units.join(',') }),
    call('annual_budget.api.filter_options.get_location_codes_by_unit', { unit: baFilters.units.join(',') }),
  ])
  costCenterOptions.value = toOptions(cc?.data)
  locationCodeOptions.value = toOptions(loc?.data)
})

// --- Drill-down modal ------------------------------------------------
const drilldownOpen = ref(false)
const drilldownNode = ref(null)
function openDrilldown(node) {
  drilldownNode.value = node
  drilldownOpen.value = true
}

// Item rows are the leaf level of the head/sub_head/item tree, so they have
// no `items`/`sub_heads` of their own for the modal to drill into - this
// fetches their GL-code-level actuals breakdown on demand and shapes it as
// a synthetic node (one leaf item per GL code) so the same modal can show it.
const glDrilldownLoading = ref(null)
async function openItemGlDrilldown(item) {
  if (!item?.sequence_id) return
  glDrilldownLoading.value = item.name
  try {
    const rows = await call('annual_budget.api.phase_sheet.get_actual_gl_breakup', {
      financial_year: filters.financialYear,
      month: month.value,
      sequence_id: item.sequence_id,
      unit: baFilters.units.join(',') || undefined,
      cost_center: baFilters.costCenters.join(',') || undefined,
      location_code: baFilters.locationCodes.join(',') || undefined,
      erp_cost_center_value: erpCostCenterValues.value.join(',') || undefined,
      erp_loc_value: erpLocationValues.value.join(',') || undefined,
    })
    openDrilldown({
      name: item.name,
      ytd: itemBudget(item),
      total_posted_amt_ytd: itemActual(item),
      items: (rows || []).map((r) => ({
        name: r.gl_code || 'Unspecified',
        ytd: 0,
        total_posted_amt: r.total_posted_amt,
      })),
    })
  } catch (e) {
    window.alert(e?.messages?.[0] || e?.message || 'Could not load GL code breakdown.')
  } finally {
    glDrilldownLoading.value = null
  }
}

// --- Report data -------------------------------------------------------
const actualsLoading = ref(false)
const actualsError = ref(null)
const actualsErrorMessage = computed(() => actualsError.value?.messages?.[0] || actualsError.value?.message || 'Something went wrong loading budget vs actuals.')
const actualsHeads = ref([])
const showFullNumbers = ref(false)

function formatAmount(n) {
  return showFullNumbers.value ? formatINR(n) : formatCr(n)
}

async function loadActuals() {
  if (!filters.financialYear) return
  actualsLoading.value = true
  actualsError.value = null
  try {
    const result = await call('annual_budget.api.phase_sheet.get_combined_actuals', {
      financial_year: filters.financialYear,
      month: month.value,
      unit: baFilters.units.join(',') || undefined,
      cost_center: baFilters.costCenters.join(',') || undefined,
      location_code: baFilters.locationCodes.join(',') || undefined,
      erp_cost_center_value: erpCostCenterValues.value.join(',') || undefined,
      erp_loc_value: erpLocationValues.value.join(',') || undefined,
    })
    actualsHeads.value = result || []
  } catch (e) {
    actualsError.value = e
    actualsHeads.value = []
  } finally {
    actualsLoading.value = false
    await nextTick()
    renderCharts()
  }
}

const actualsGrandBudget = computed(() => actualsHeads.value.reduce((sum, h) => sum + treeTotal(h, nodeBudget), 0))
const actualsGrandActual = computed(() => actualsHeads.value.reduce((sum, h) => sum + treeTotal(h, nodeActual), 0))
const actualsGrandUtil = computed(() => (actualsGrandBudget.value > 0 ? Math.round((actualsGrandActual.value / actualsGrandBudget.value) * 100) : 0))

// Heads plus their sub-heads, each carrying its own utilization % - used to
// rank by utilization instead of by document order.
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
      onClick: () => openDrilldown(highest),
    },
  ]
  if (lowest !== highest) {
    insights.push({
      label: 'Lowest Utilization',
      value: lowest.name,
      detail: `${utilizationPct(lowest)}% of ${formatAmount(treeTotal(lowest, nodeBudget))} budget spent`,
      icon: 'battery',
      color: utilizationColor(utilizationPct(lowest)),
      onClick: () => openDrilldown(lowest),
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

// --- Charts --------------------------------------------------------------
const budgetPieRef = ref(null)
const actualPieRef = ref(null)
let budgetPieChart = null
let actualPieChart = null

function renderCharts() {
  if (budgetPieRef.value) {
    budgetPieChart?.destroy()
    const heads = actualsHeads.value.filter((h) => treeTotal(h, nodeBudget) > 0)
    budgetPieChart = new Chart(budgetPieRef.value, {
      type: 'doughnut',
      data: { labels: heads.map((h) => h.name), datasets: [{ data: heads.map((h) => treeTotal(h, nodeBudget)), backgroundColor: heads.map((_, i) => accentColor(i)), borderWidth: 0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, elements) => { if (elements.length) openDrilldown(heads[elements[0].index]) },
        onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default' },
        plugins: {
          legend: { position: 'bottom', labels: { color: tickColor(), boxWidth: 10, padding: 10 } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatAmount(ctx.parsed)}` } },
        },
      },
    })
  }
  if (actualPieRef.value) {
    actualPieChart?.destroy()
    const heads = actualsHeads.value.filter((h) => treeTotal(h, nodeActual) > 0)
    actualPieChart = new Chart(actualPieRef.value, {
      type: 'doughnut',
      data: { labels: heads.map((h) => h.name), datasets: [{ data: heads.map((h) => treeTotal(h, nodeActual)), backgroundColor: heads.map((_, i) => accentColor(i)), borderWidth: 0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, elements) => { if (elements.length) openDrilldown(heads[elements[0].index]) },
        onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default' },
        plugins: {
          legend: { position: 'bottom', labels: { color: tickColor(), boxWidth: 10, padding: 10 } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatAmount(ctx.parsed)}` } },
        },
      },
    })
  }
}

watch(showFullNumbers, renderCharts)

// --- Detailed table: search + expand-all -----------------------------
const tableSearch = ref('')
const expandAll = ref(false)
const openHeads = reactive(new Set())
const openSubs = reactive(new Set())

function isHeadOpen(name) {
  return expandAll.value || openHeads.has(name)
}
function isSubOpen(headName, subName) {
  return expandAll.value || openSubs.has(headName + '::' + subName)
}
function toggleHead(name) {
  if (openHeads.has(name)) openHeads.delete(name)
  else openHeads.add(name)
}
function toggleSub(headName, subName) {
  const key = headName + '::' + subName
  if (openSubs.has(key)) openSubs.delete(key)
  else openSubs.add(key)
}

function itemBudget(item) {
  return Number(item?.ytd || 0)
}
function itemActual(item) {
  return Number(item?.total_posted_amt ?? item?.total_posted_amt_ytd ?? 0)
}
function itemUtil(item) {
  const b = itemBudget(item)
  return b > 0 ? Math.round((itemActual(item) / b) * 100) : 0
}

// A head/sub_head/item matches the search term itself, OR is kept visible
// because one of ITS descendants matches (so drilling into a matched leaf
// item is still reachable) - mirrors Foundation Consolidated's own
// leaf-level search behavior (BudgetActualsTab.vue's filteredItems()),
// generalized to 3 levels here instead of 2.
function matchesSearch(name) {
  const term = tableSearch.value.trim().toLowerCase()
  return !term || (name || '').toLowerCase().includes(term)
}
function itemMatches(item) {
  return matchesSearch(item.name)
}
function subMatches(sub) {
  return matchesSearch(sub.name) || (sub.items || []).some(itemMatches)
}
function headMatches(head) {
  return matchesSearch(head.name)
    || (head.sub_heads || []).some(subMatches)
    || (head.items || []).some(itemMatches)
}

const filteredHeads = computed(() => {
  if (!tableSearch.value.trim()) return actualsHeads.value
  return actualsHeads.value.filter(headMatches)
})

// --- Export ----------------------------------------------------------
const exporting = ref(false)
async function exportExcel() {
  if (!actualsHeads.value.length) return
  exporting.value = true
  try {
    const result = await call('annual_budget.api.export_reports.export_budget_vs_actual', {
      financial_year: filters.financialYear,
      month: month.value,
      heads_data: JSON.stringify(actualsHeads.value),
    })
    if (!downloadXlsx(result)) window.alert('Export failed — no data returned.')
  } catch (e) {
    window.alert(e?.messages?.[0] || e?.message || 'Export failed.')
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await loadFinancialYears()
  await loadUnits()
  await loadThemes()
})
</script>
