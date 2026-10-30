<!--
  Budget vs Actual - a dedicated Vue port of the Desk page at
  budget_mis/main/page/budget_actuals_phase/
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
    <div class="flex flex-col gap-6">
      <!-- Filters: plain, unframed row - no card surface. Get Report and the
      Cr/full-number toggle sit in the same grid, right after the last
      filter field, instead of their own separate row below. -->
      <div class="flex flex-col gap-4">
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
            <MultiSelect v-model="themeSelection" :options="themeOptions" :loading="themeLoading || themeMappingLoading" placeholder="All operating units" class="w-full" />
            <p v-if="themeMappingEmpty" class="mt-1 text-[0.6875rem] text-amber-600 dark:text-amber-400">
              No units/cost centers are set up for this Operating Unit yet - showing all data instead.
            </p>
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
        <div class="flex flex-wrap items-center justify-between gap-3">
          <Button variant="solid" theme="gray" :loading="actualsLoading" :disabled="themeMappingLoading" @click="loadActuals">
            <template #prefix><FeatherIcon name="search" class="h-4 w-4" /></template>
            Get Report
          </Button>
          <Switch v-if="actualsHeads.length" v-model="showFullNumbers" :label="showFullNumbers ? 'Show in Cr' : 'Show full numbers'" />
        </div>
      </div>

      <ErrorMessage v-if="actualsError" :message="actualsErrorMessage" />
      <div v-else-if="actualsLoading">
        <AppLoader label="Loading budget vs actuals..." />
      </div>
      <div v-else-if="!actualsHeads.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        Choose filters and click "Get Report" to see the budget vs actuals breakdown.
      </div>
      <template v-else>

        <!-- Grand Total, Expense Head, and Sub Head cards all share one
        donut + stat-tile design (BudgetActualDonutCard) - a 2-segment
        Actual-vs-Remaining donut plus Total/Actual/Remaining stat tiles,
        scaled down at each tier (`large` / default / `small`) rather than
        switching to a different card design for Sub Heads. -->
        <div class="flex flex-col gap-2.5">
          <div class="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Grand Total</div>
          <BudgetActualDonutCard
            large
            clickable
            label="Budget vs Actuals"
            icon="bar-chart-2"
            :budget="actualsGrandBudget"
            :actual="actualsGrandActual"
            :format-amount="formatAmount"
            :utilization-color="utilizationColor"
            @click="openDrilldown({ name: 'Grand Total', items: actualsHeads, sub_heads: [] }, 'actuals')"
          />
        </div>

        <div class="flex flex-col gap-2.5">
          <div class="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Expense Heads</div>
          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            <template v-for="(head, i) in actualsHeads" :key="head.name">
              <BudgetActualDonutCard
                v-if="treeTotal(head, nodeBudget) || treeTotal(head, nodeActual)"
                clickable
                :label="head.name"
                :icon="headIcon(head.name)"
                :budget="treeTotal(head, nodeBudget)"
                :actual="treeTotal(head, nodeActual)"
                :format-amount="formatAmount"
                :utilization-color="utilizationColor"
                @click="openDrilldown(head, 'actuals')"
              />
            </template>
          </div>
        </div>

        <template v-for="(head, i) in actualsHeads" :key="'subs-' + head.name">
          <div v-if="nonZeroActualsSubHeads(head).length" class="flex flex-col gap-2.5">
            <div class="text-[0.6875rem] font-bold uppercase tracking-wider" :style="{ color: accentColor(i) }">
              <span class="text-gray-400 opacity-60 dark:text-gray-500">Sub Heads —</span> {{ head.name }}
            </div>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <BudgetActualDonutCard
                v-for="sub in nonZeroActualsSubHeads(head)"
                :key="sub.name"
                small
                clickable
                :label="sub.name"
                :icon="headIcon(head.name)"
                :budget="treeTotal(sub, nodeBudget)"
                :actual="treeTotal(sub, nodeActual)"
                :format-amount="formatAmount"
                :utilization-color="utilizationColor"
                @click="openDrilldown(sub, 'actuals')"
              />
            </div>
          </div>
        </template>

        <!-- Budget vs Actuals by category - a grouped horizontal bar chart
        (replacing an earlier two-donut-chart pair that compared the same
        two magnitudes as two separate pies, cross-referenced slice by
        slice) so Budget and Actual read directly against each other, bar
        for bar, per category. -->
        <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <BudgetActualBarChart :rows="doughnutRows" :format-amount="formatAmount" @bar-click="(row) => openDrilldown(row.node, 'actuals')" />
        </div>

        <!-- Detailed table: search + expand-all + Excel export, then the
        full Expense Head -> Sub Head -> Item tree - the piece the
        Dashboard's own "Budget vs Actuals Breakdown" tab doesn't have.
        No card surface - plain, unframed like the filter row above. -->
        <div>
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4">
            <FormControl type="text" v-model="tableSearch" placeholder="Search Expense Head / Sub Head / Item..." class="fc-search-input">
              <template #prefix><FeatherIcon name="search" class="h-4 w-4 text-gray-400" /></template>
            </FormControl>
            <div class="flex items-center gap-4">
              <Switch v-model="expandAll" label="Expand all" />
              <Button variant="outline" theme="gray" :loading="exporting" @click="exportExcel">
                <template #prefix><FeatherIcon name="download" class="h-4 w-4" /></template>
                Export Excel
              </Button>
            </div>
          </div>

          <div class="fc-scroll-wrapper">
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
                    <td class="fc-td text-right" :style="{ color: varianceColor(treeTotal(head, nodeBudget) - treeTotal(head, nodeActual)) }">{{ formatAmount(treeTotal(head, nodeBudget) - treeTotal(head, nodeActual)) }}</td>
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
                        <td class="fc-td text-right" :style="{ color: varianceColor(treeTotal(sub, nodeBudget) - treeTotal(sub, nodeActual)) }">{{ formatAmount(treeTotal(sub, nodeBudget) - treeTotal(sub, nodeActual)) }}</td>
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
                        <td class="fc-td text-right" :style="{ color: varianceColor(itemBudget(item) - itemActual(item)) }">{{ formatAmount(itemBudget(item) - itemActual(item)) }}</td>
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
                      <td class="fc-td text-right" :style="{ color: varianceColor(itemBudget(item) - itemActual(item)) }">{{ formatAmount(itemBudget(item) - itemActual(item)) }}</td>
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
                  <td class="fc-td text-right" :style="{ color: varianceColor(actualsGrandBudget - actualsGrandActual) }">{{ formatAmount(actualsGrandBudget - actualsGrandActual) }}</td>
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
      :financial-year="filters.financialYear"
      :month="month"
      :unit="baFilters.units.join(',')"
      :cost-center="baFilters.costCenters.join(',')"
      :location-code="baFilters.locationCodes.join(',')"
      :erp-cost-center-value="erpCostCenterValues.join(',')"
      :erp-loc-value="erpLocationValues.join(',')"
      :theme-names="themeSelectionNames.join(',')"
    />
  </AppLayout>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { MultiSelect, FormControl, FeatherIcon, ErrorMessage, Switch, Button } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import BudgetActualDonutCard from '@/components/BudgetActualDonutCard.vue'
import BudgetActualBarChart from '@/components/BudgetActualBarChart.vue'
import BudgetDrilldownModal from '@/components/BudgetDrilldownModal.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'
import { downloadXlsx } from '@/data/foundationConsolidatedData'
import { accentColor, headIcon, formatCr, formatINR } from '@/data/budgetTotals'
import { nodeActual, nodeBudget, treeTotal, utilizationColor, utilizationPct } from '@/data/dashboardData'

setPageTitle('Budget vs Actual')

const MONTH_OPTIONS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
].map((m) => ({ label: m, value: m }))

function toOptions(list) {
  return (list || []).filter((o) => o.value).map((o) => ({ label: o.label, value: o.value }))
}

// --- Financial Year -------------------------------------------------------
const filters = reactive({ financialYear: '' })
const financialYearOptions = ref([])
const financialYearSelection = computed({
  get: () => (filters.financialYear ? [filters.financialYear] : []),
  set: (values) => { filters.financialYear = values.length ? values[values.length - 1] : '' },
})

async function loadFinancialYears() {
  const rows = await call('budget_mis.api_1.filter_options.get_financial_year_list')
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
  const r = await call('budget_mis.api_1.filter_options.get_units')
  unitOptions.value = toOptions(r?.data)
}

// --- Other filters ----------------------------------------------------
const baFilters = reactive({ units: [], costCenters: [], locationCodes: [] })
// Defaults to the current calendar month (e.g. "September" in September),
// not a hardcoded month - matches financialYearOptions' own current-FY
// default above, so the report opens already scoped to "now" instead of
// always landing on March regardless of when it's actually opened.
// Date.getMonth() is 0 = January ... 11 = December (calendar order); the
// CALENDAR_MONTHS list below maps that index straight to its label, kept
// separate from MONTH_OPTIONS which is deliberately in fiscal-year order
// (April...March) for the dropdown itself.
const CALENDAR_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const CURRENT_MONTH_LABEL = CALENDAR_MONTHS[new Date().getMonth()]
const month = ref(CURRENT_MONTH_LABEL)
const monthSelection = computed({
  get: () => (month.value ? [month.value] : []),
  set: (values) => { month.value = values.length ? values[values.length - 1] : CURRENT_MONTH_LABEL },
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
// True while a theme-selection's unit/cost-center/location mapping is being
// fetched - "Get Report" is disabled during this window so it can never
// send the PREVIOUS (stale) filters while a just-picked Operating Unit's
// real mapping is still in flight (the request would otherwise look
// unaffected by the selection the user just made).
const themeMappingLoading = ref(false)
// True once a selected Operating Unit's mapping comes back with NO units/
// cost-centers/locations at all (its "Cost Centre and Location Code
// Grouping" rows are unconfigured) - without this, the filter silently
// resolves to "all units" and the Unit/Cost Center/Location Code pickers
// stay on their "All ..." placeholders with no sign anything happened,
// which reads exactly like "the Operating Unit filter isn't working".
const themeMappingEmpty = ref(false)
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
    const rows = await call('budget_mis.api_1.filter_options.get_theme')
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
// Guards against two overlapping applyThemeSelection() calls (the user
// changes the Operating Unit selection again before the first mapping
// fetch has resolved) - only the call started LAST is allowed to write its
// results, so a slow, now-stale response can never clobber a newer one.
let themeMappingToken = 0
async function applyThemeSelection() {
  const token = ++themeMappingToken

  // No Operating Units selected (including "cleared back to none") - reset
  // to the unscoped/"all" state instead of leaving whatever the previous
  // selection resolved to still sitting in baFilters.
  if (!themeSelectionNames.value.length) {
    themeMappingEmpty.value = false
    suppressUnitWatch = true
    baFilters.units = []
    await nextTick()
    suppressUnitWatch = false
    costCenterOptions.value = []
    locationCodeOptions.value = []
    baFilters.costCenters = []
    baFilters.locationCodes = []
    erpCostCenterValues.value = []
    erpLocationValues.value = []
    return
  }

  themeMappingLoading.value = true
  let results
  try {
    results = await Promise.all(
      themeSelectionNames.value.map((name) => call('budget_mis.api_1.filter_options.get_theme_mappings', { theme_name: name })),
    )
  } catch (e) {
    if (token === themeMappingToken) themeMappingLoading.value = false
    window.alert(e?.messages?.[0] || e?.message || 'Could not load the selected Operating Unit(s) - filters were not changed.')
    return
  }
  // A newer selection has already started its own fetch - drop this
  // (now-stale) result instead of overwriting baFilters with it.
  if (token !== themeMappingToken) return

  const unitVals = new Map()
  const ccVals = new Map()
  const locVals = new Map()
  for (const r of results) {
    for (const u of r?.units || []) unitVals.set(u.value, u)
    // get_theme_mappings now splits each cost-center/location-code entry by
    // its own reference_for (Budget/Actual/Both): `value`/`erp_*_value` is
    // left blank on whichever side a row doesn't apply to (an actuals-only
    // row has no `value`, a budget-only row has no erp_*_value). Keying the
    // merge Map by `value` would otherwise collide every blank-`value`
    // actuals-only entry onto the same "" key (only the last would
    // survive) and push a literal empty string into baFilters.costCenters/
    // locationCodes below - skip entries with no value entirely for the
    // Map/budget-filter purpose; their erp_* value is still picked up via
    // the separate erpCostCenterValues/erpLocationValues pass further down,
    // which already .filter(Boolean)s and doesn't go through this Map.
    for (const c of r?.cost_centers || []) { if (c.value) ccVals.set(c.value, c) }
    for (const l of r?.location_codes || []) { if (l.value) locVals.set(l.value, l) }
  }

  suppressUnitWatch = true
  baFilters.units = [...unitVals.keys()]
  await nextTick()
  suppressUnitWatch = false

  costCenterOptions.value = [...ccVals.values()].map((c) => ({ label: c.label, value: c.value }))
  locationCodeOptions.value = [...locVals.values()].map((l) => ({ label: l.label, value: l.value }))
  baFilters.costCenters = [...ccVals.keys()]
  baFilters.locationCodes = [...locVals.keys()]
  erpCostCenterValues.value = (results.flatMap((r) => r?.cost_centers || [])).map((c) => c.erp_cost_center_value).filter(Boolean)
  erpLocationValues.value = (results.flatMap((r) => r?.location_codes || [])).map((l) => l.erp_loc_value).filter(Boolean)
  themeMappingEmpty.value = !unitVals.size && !ccVals.size && !locVals.size && !erpCostCenterValues.value.length && !erpLocationValues.value.length
  themeMappingLoading.value = false
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
    call('budget_mis.api_1.filter_options.get_cost_centers_by_set_id', { units: baFilters.units.join(',') }),
    call('budget_mis.api_1.filter_options.get_location_codes_by_unit', { unit: baFilters.units.join(',') }),
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
    const rows = await call('budget_mis.api_1.budget_vs_actual.get_actual_gl_breakup', {
      financial_year: filters.financialYear,
      month: month.value,
      sequence_id: item.sequence_id,
      unit: baFilters.units.join(',') || undefined,
      cost_center: baFilters.costCenters.join(',') || undefined,
      location_code: baFilters.locationCodes.join(',') || undefined,
      erp_cost_center_value: erpCostCenterValues.value.join(',') || undefined,
      erp_loc_value: erpLocationValues.value.join(',') || undefined,
      theme_names: themeSelectionNames.value.join(',') || undefined,
    })
    openDrilldown({
      name: item.name,
      __isGlLevel: true,
      ytd: itemBudget(item),
      total_posted_amt_ytd: itemActual(item),
      items: (rows || []).map((r) => ({
        name: r.gl_code || 'Unspecified',
        typeOfExpense: r.type_of_expense || '',
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

// Variance (Budget - Actual) goes negative once Actual exceeds Budget - the
// same over-budget signal the Util % column's own red threshold flags, so
// this reuses that exact red rather than a separately-chosen color.
function varianceColor(variance) {
  return variance < 0 ? '#e34948' : undefined
}

async function loadActuals() {
  if (!filters.financialYear) return
  actualsLoading.value = true
  actualsError.value = null
  try {
    const result = await call('budget_mis.api_1.budget_vs_actual.get_combined_actuals_report', {
      financial_year: filters.financialYear,
      month: month.value,
      unit: baFilters.units.join(',') || undefined,
      cost_center: baFilters.costCenters.join(',') || undefined,
      location_code: baFilters.locationCodes.join(',') || undefined,
      erp_cost_center_value: erpCostCenterValues.value.join(',') || undefined,
      erp_loc_value: erpLocationValues.value.join(',') || undefined,
      // When an Operating Unit is selected, the backend re-resolves it into
      // its own exact (unit, cost-center, location) row pairs and sums them
      // separately, instead of independently AND-ing the flattened unit/
      // cost_center/location_code sets above (which can cross-match
      // combinations the Operating Unit never actually defined - see
      // get_combined_actuals_report's own theme_names handling).
      theme_names: themeSelectionNames.value.join(',') || undefined,
    })
    actualsHeads.value = result || []
  } catch (e) {
    actualsError.value = e
    actualsHeads.value = []
  } finally {
    actualsLoading.value = false
  }
}

const actualsGrandBudget = computed(() => actualsHeads.value.reduce((sum, h) => sum + treeTotal(h, nodeBudget), 0))
const actualsGrandActual = computed(() => actualsHeads.value.reduce((sum, h) => sum + treeTotal(h, nodeActual), 0))
const actualsGrandUtil = computed(() => (actualsGrandBudget.value > 0 ? Math.round((actualsGrandActual.value / actualsGrandBudget.value) * 100) : 0))

// Zero-value cards (no budget AND no actual) carry no information worth a
// whole card - skipped here rather than rendered as an empty "0%/₹0" tile
// (e.g. an Expense Head or Sub Head with nothing allocated/spent this period).
function nonZeroActualsSubHeads(head) {
  return (head.sub_heads || []).filter((sub) => treeTotal(sub, nodeBudget) || treeTotal(sub, nodeActual))
}

// --- Budget/Actual doughnuts (Budget Breakdown / Actuals Breakdown) -------
// Ports the Desk page's own flatten rule exactly (budget_actuals_phase.js,
// live revision, renderPieCharts): a head contributes its SUB-heads only
// if at least one of them is individually non-zero in budget OR actual;
// otherwise the head itself is used as a single row (covers heads with no
// sub-heads, and heads whose sub-heads are all zero). Both doughnuts key
// off this one shared row list, same as the Desk page's shared `labels`.
const doughnutRows = computed(() => {
  const rows = []
  for (const head of actualsHeads.value) {
    const subs = head.sub_heads || []
    const validSubs = subs.filter((s) => Math.round(treeTotal(s, nodeBudget)) !== 0 || Math.round(treeTotal(s, nodeActual)) !== 0)
    if (validSubs.length) {
      rows.push(...validSubs)
    } else {
      rows.push(head)
    }
  }
  return rows.map((row) => ({
    label: row.name,
    budget: Math.round(treeTotal(row, nodeBudget)),
    actual: Math.round(treeTotal(row, nodeActual)),
    node: row,
  }))
})

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
    const result = await call('budget_mis.api_1.export_reports.export_budget_vs_actual', {
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
