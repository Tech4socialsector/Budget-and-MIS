<!--
  Monthly MIS page - Vue replica of the Desk page at
  annual_budget/annual_budget_mis/page/monthly_mis/monthly_mis.js (only the
  live block at lines 6230-7601 - the file's earlier 6 versions are dead
  code and were not replicated).

  Architecture mirrors src/pages/FoundationConsolidated.vue: reactive
  filters, a request-generation counter to guard against a stale response
  from a superseded Financial-Year/Month change landing after a newer one,
  and a single Promise.all load (this page has no tabs to lazy-load - all
  sections come from the same 3 backend calls, so they load together).

  "Show full numbers" reruns nothing over the network - raw API responses
  are kept in refs (curData/prevData/breakupData) and every table is a pure
  computed() derivation of those refs, so Vue's reactivity re-renders
  automatically on any change (this is the Vue-native equivalent of the
  Desk page's reRenderFromCache()/misShowFullNumbers pattern - no explicit
  re-render function is needed here, unlike the imperative jQuery source).

  The toggle itself doesn't touch those table-building computeds at all -
  CrCell already supports two interchangeable display modes (mode="cr":
  rounded Cr in-cell with a full-rupee tooltip; mode="inr": full rupee
  in-cell with a Cr tooltip - see CrCell.vue's header comment), so
  components/monthlyMis/MisAmount.vue just injects this page's
  showFullNumbers ref (provided below) and picks CrCell's mode from it,
  avoiding prop-drilling the toggle through 5+ levels of table components.
-->
<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <!-- Filters -->
      <div class="flex flex-wrap items-end justify-between gap-4">
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
          <div class="w-full sm:w-48">
            <FormControl
              type="select"
              label="Month (YTD up to)"
              :options="monthOptions"
              v-model="filters.month"
            />
          </div>
          <Switch v-model="showFullNumbers" label="Show full numbers" />
        </div>
        <Button variant="solid" class="fc-export-all" @click="exportMis">
          <template #prefix>
            <FeatherIcon name="download" class="h-4 w-4" />
          </template>
          Export
        </Button>
      </div>

      <ErrorMessage v-if="error" :message="errorMessage" />
      <div v-else-if="loading" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <AppLoader label="Loading Monthly MIS..." />
      </div>
      <div v-else-if="!hasData" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        No data available for this Financial Year / Month.
        <button class="ml-1 text-fc-blue-mid underline" @click="loadAll(true)">Retry</button>
      </div>
      <template v-else>
        <!-- 1. Operating Expense -->
        <SectionLabel text="Operating Expense" :subtitle="ytdSubtitle" />
        <ExpenseTable :rows="opexRows" :totals="opexTotals" :cur-f-y="filters.financialYear" :prev-f-y="prevFY" @drill="openDrilldown" />

        <!-- 2. Capital Expense -->
        <SectionLabel text="Capital Expense" :subtitle="ytdSubtitle" />
        <ExpenseTable :rows="capexRows" :totals="capexTotals" :cur-f-y="filters.financialYear" :prev-f-y="prevFY" @drill="openDrilldown" />

        <!-- 3. Overall Foundation -->
        <SectionLabel text="Overall Foundation" :subtitle="ytdSubtitle" />
        <ConsolidatedTable :rows="consolidatedRows" :total="consolidatedTotal" :cur-f-y="filters.financialYear" :prev-f-y="prevFY" @drill="openDrilldown" />

        <!-- 4. Education -->
        <SectionLabel text="Education" :subtitle="ytdSubtitle" />
        <BreakupTable title-text="Education" :data="eduBreakup" @drill="openDrilldown" />

        <!-- 5. Health -->
        <SectionLabel text="Health" :subtitle="ytdSubtitle" />
        <BreakupTable title-text="Health" :data="healthBreakup" @drill="openDrilldown" />

        <!-- 6. Livelihoods -->
        <SectionLabel text="Livelihoods" :subtitle="ytdSubtitle" />
        <BreakupTable title-text="Livelihoods" :data="livelihoodsBreakup" @drill="openDrilldown" />

        <!-- 7. University -->
        <SectionLabel text="University" :subtitle="ytdSubtitle" />
        <BreakupTable title-text="Universities" :data="univBreakup" @drill="openDrilldown" />

        <!-- 8. Enablers -->
        <SectionLabel text="Enablers" :subtitle="ytdSubtitle" />
        <BreakupTable title-text="Enablers" :data="enablersBreakup" @drill="openDrilldown" />

        <!-- 9. Operating Expenses Breakdown -->
        <SectionLabel text="Operating Expenses Breakdown" :subtitle="ytdSubtitle" />
        <UnitDetailGrid :cards="unitDetailCards" :fy="filters.financialYear" :prev-fy="prevFY" />
      </template>
    </div>

    <BudgetDrilldownModal v-model="drilldownOpen" :node="drilldownNode" total-mode="ytd" show-actuals />
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, provide, reactive, ref, watch } from 'vue'
import { MultiSelect, FormControl, Button, FeatherIcon, ErrorMessage, Switch } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import SectionLabel from '@/components/SectionLabel.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'
import ConsolidatedTable from '@/components/monthlyMis/ConsolidatedTable.vue'
import ExpenseTable from '@/components/monthlyMis/ExpenseTable.vue'
import BreakupTable from '@/components/monthlyMis/BreakupTable.vue'
import UnitDetailGrid from '@/components/monthlyMis/UnitDetailGrid.vue'
import BudgetDrilldownModal from '@/components/BudgetDrilldownModal.vue'
import {
  MONTHS,
  getPrevFY,
  monthYearLabel,
  buildMap,
  buildConsolidatedRows,
  buildExpRows,
  buildExpTotals,
  buildBreakupSections,
  buildUnitDetailGrid,
} from '@/data/monthlyMisData'

const monthOptions = MONTHS.map((m) => ({ label: m, value: m }))

// -------------------------------------------------------------------------
// Filters
// -------------------------------------------------------------------------
const filters = reactive({ financialYear: '', month: '' })
const financialYearOptions = ref([])
const financialYearSelection = computed({
  get: () => (filters.financialYear ? [filters.financialYear] : []),
  set: (values) => {
    filters.financialYear = values.length ? values[values.length - 1] : ''
  },
})
const showFullNumbers = ref(false)
// Injected by MisAmount.vue (used inside every table sub-component below)
// so the toggle can live here without prop-drilling through 5+ levels of
// table components.
provide('misShowFullNumbers', showFullNumbers)

const prevFY = computed(() => getPrevFY(filters.financialYear))
const ytdSubtitle = computed(() => `Budget vs. Actuals – YTD ${monthYearLabel(filters.month, filters.financialYear)}`)

// Default FY/month logic - mirrors the Desk page's exact algorithm
// (lines ~6779-6797): default FY = current fiscal year if present in the
// options list else the first option; default month = the PREVIOUS
// calendar month (YTD "up to" a completed month is more useful than an
// in-progress one), falling back to 'March' if that month name isn't in
// the fiscal MONTHS list (it always is, but replicated literally).
function defaultFyAndMonth(options) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const curFY = (m >= 4 ? y : y - 1) + '-' + String(m >= 4 ? y + 1 : y).slice(-2)
  const target = options.includes(curFY) ? curFY : options[0]
  const prevM = m === 1 ? 12 : m - 1
  const mName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][prevM - 1]
  const month = MONTHS.includes(mName) ? mName : 'March'
  return { fy: target, month }
}

async function loadFinancialYears() {
  const rows = await call('annual_budget.api.filter_options.get_financial_year_list')
  const years = (rows || []).map((r) => r.financial_year)
  financialYearOptions.value = years.map((y) => ({ label: y, value: y }))
  if (!filters.financialYear && years.length) {
    const { fy, month } = defaultFyAndMonth(years)
    filters.financialYear = fy
    filters.month = month
  }
}

watch(
  () => [filters.financialYear, filters.month],
  ([fy, month]) => setPageTitle(fy && month ? `Monthly MIS - ${fy} - ${month}` : 'Monthly MIS'),
  { immediate: true },
)

// -------------------------------------------------------------------------
// Load - a single Promise.all of the 3 backend calls the Desk page's
// loadData() makes. Confirmed against the live source (fetchData(),
// lines 6802-6816): get_unit_wise_plan is called WITHOUT an is_previous
// flag on EITHER call - the "previous year" call just passes the already-
// computed prevFY string directly as financial_year, exactly like the
// current-year call, both with table_name_filter='Monthly MIS Capex & Opex'.
// (is_previous is a real, accepted backend param, but the Desk JS never
// sends it here, so financial_year alone drives which year's data comes
// back for each call - this is NOT the same calling convention
// FoundationConsolidated.vue uses for its own get_unit_wise_plan calls.)
// -------------------------------------------------------------------------
const loading = ref(false)
const error = ref(null)
const curData = ref([])
const prevData = ref([])
const breakupData = ref({})
const hasData = computed(() => curData.value.length > 0 || prevData.value.length > 0)

let requestGen = 0

async function loadAll(force) {
  const fy = filters.financialYear
  const month = filters.month
  if (!fy || !month) return
  const gen = ++requestGen
  loading.value = true
  error.value = null
  try {
    const [cur, prev, breakup] = await Promise.all([
      call('annual_budget.api.foundation_consolidated_report.get_unit_wise_plan', {
        financial_year: fy, month, table_name_filter: 'Monthly MIS Capex & Opex',
      }),
      call('annual_budget.api.foundation_consolidated_report.get_unit_wise_plan', {
        financial_year: getPrevFY(fy), month, table_name_filter: 'Monthly MIS Capex & Opex',
      }),
      call('annual_budget.api.foundation_consolidated_report.get_monthly_mis_break_up', {
        financial_year: fy,
        month,
        table_name_filter: 'Education - District Institutes,Education- Azim Premji Schools,Azim Premji University (Bangalore Campus),Azim Premji University (Bhopal Campus),Azim Premji University (Ranchi Campus),Azim Premji University (Guwahati Campus),Enablers,Livelihoods,Urban Primary care work,Rural Primary care work,Central Initiatives,Hospital,Health Programs Team & Enablers',
        is_previous: 0,
      }),
    ])
    if (gen !== requestGen) return
    curData.value = Array.isArray(cur) ? cur : []
    prevData.value = Array.isArray(prev) ? prev : []
    breakupData.value = breakup && typeof breakup === 'object' ? breakup : {}
  } catch (e) {
    if (gen !== requestGen) return
    error.value = e
    curData.value = []
    prevData.value = []
    breakupData.value = {}
  } finally {
    if (gen === requestGen) loading.value = false
  }
}

const errorMessage = computed(() => error.value?.messages?.[0] || error.value?.message || 'Something went wrong loading Monthly MIS.')

watch(() => [filters.financialYear, filters.month], () => loadAll())

// -------------------------------------------------------------------------
// Pure computed derivations - re-derive from cached raw data on every
// change (including the "Show full numbers" toggle, which doesn't affect
// these builders at all - only CrCell's rendering mode downstream).
// -------------------------------------------------------------------------
const curMap = computed(() => buildMap(curData.value))
const prevMap = computed(() => buildMap(prevData.value))

const consolidated = computed(() => buildConsolidatedRows(curMap.value, prevMap.value))
const consolidatedRows = computed(() => consolidated.value.rows)
const consolidatedTotal = computed(() => consolidated.value.total)

const opexRows = computed(() => buildExpRows(curData.value, prevData.value, 'opex'))
const opexTotals = computed(() => buildExpTotals(opexRows.value))
const capexRows = computed(() => buildExpRows(curData.value, prevData.value, 'capex'))
const capexTotals = computed(() => buildExpTotals(capexRows.value))

// Education/University breakup keys come from a nested group in the
// response ('Unit Wise Plan' / 'Opex Capex' respectively) - unwrapped
// before key lookup, matching renderEduBreakup/renderUnivBreakup exactly.
// Health/Livelihoods/Enablers pass the raw breakupData directly.
const eduBreakup = computed(() => {
  const data = breakupData.value?.['Unit Wise Plan'] || breakupData.value
  return buildBreakupSections(data, ['Education - District Institutes', 'Education- Azim Premji Schools'])
})
const univBreakup = computed(() => {
  const data = breakupData.value?.['Opex Capex'] || breakupData.value
  return buildBreakupSections(data, [
    'Azim Premji University (Bangalore Campus)',
    'Azim Premji University (Bhopal Campus)',
    'Azim Premji University (Ranchi Campus)',
    'Azim Premji University (Guwahati Campus)',
  ])
})
const healthBreakup = computed(() => buildBreakupSections(breakupData.value, [
  'Urban Primary care work', 'Rural Primary care work', 'Central Initiatives', 'Hospital', 'Health Programs Team & Enablers',
]))
const livelihoodsBreakup = computed(() => buildBreakupSections(breakupData.value, ['Livelihoods']))
const enablersBreakup = computed(() => buildBreakupSections(breakupData.value, ['Enablers']))

const unitDetailCards = computed(() => buildUnitDetailGrid(curData.value, prevData.value))

// -------------------------------------------------------------------------
// Row drill-down - every table row here (ExpenseTable/ConsolidatedTable's
// unit rows, BreakupTable's sub-unit rows) is a pre-flattened {label, ...}
// view built from a raw per-entity `actuals` tree elsewhere in curData /
// prevData / breakupData. Clicking a row looks that entity back up by its
// label and re-opens the SAME BudgetDrilldownModal the Budget Dashboard
// uses, letting the user step into head -> sub_head -> item without this
// page needing its own drill-down UI.
// -------------------------------------------------------------------------
function findByLabel(list, label) {
  for (const e of list || []) {
    if ((e.label || '').trim() === label) return e
  }
  return null
}

// breakupData nests entity arrays under group keys ('Unit Wise Plan',
// 'Opex Capex') or, for Health/Livelihoods/Enablers, under the sub_head
// key itself - flattened once here so drill-down can find a sub-unit's
// entity by label regardless of which shape it came from.
const breakupEntities = computed(() => {
  const out = []
  const visit = (val) => {
    if (Array.isArray(val)) { out.push(...val); return }
    if (val && typeof val === 'object') { for (const v of Object.values(val)) visit(v) }
  }
  visit(breakupData.value)
  return out
})

const drilldownOpen = ref(false)
const drilldownNode = ref(null)

// `year` says which of curData/prevData the click actually intended - each
// row in ExpenseTable/ConsolidatedTable shows BOTH years side by side (the
// same label appearing once per year-block, e.g. "Education" with its own
// Cur Budget/Actuals AND Prev Budget/Actuals in the same row), so looking
// curData up unconditionally before prevData - as an earlier version of
// this function did - silently showed the current year's breakdown even
// when the user clicked the previous-year columns. BreakupTable's rows
// have no such split (single-period Opex/Capex/Total only) and don't pass
// a year at all, so 'cur' is a safe default there.
function openDrilldown(label, year = 'cur') {
  const primary = year === 'prev' ? prevData.value : curData.value
  const secondary = year === 'prev' ? curData.value : prevData.value
  const entity =
    findByLabel(primary, label) ||
    findByLabel(secondary, label) ||
    findByLabel(breakupEntities.value, label)
  if (!entity) return
  // BudgetDrilldownModal walks node.sub_heads/node.items directly - an
  // entity's real tree lives one level down, under `.actuals`.
  drilldownNode.value = { name: label, sub_heads: [], items: entity.actuals || [] }
  drilldownOpen.value = true
}

// -------------------------------------------------------------------------
// Export - no base64 JSON endpoint exists for this page (unlike Foundation
// Consolidated's export_reports.* calls); export_monthly_mis returns a raw
// binary file via a direct GET, so this just opens that URL exactly like
// the Desk page's Export button does.
// -------------------------------------------------------------------------
function exportMis() {
  const fy = filters.financialYear
  const month = filters.month
  if (!fy || !month) return
  const url = `/api/method/annual_budget.api.monthly_mis.export_monthly_mis?financial_year=${encodeURIComponent(fy)}&month=${encodeURIComponent(month)}&export_format=excel`
  window.open(url, '_blank')
}

onMounted(async () => {
  // loadFinancialYears() sets filters.financialYear and filters.month
  // synchronously (both in the same tick), which is enough on its own to
  // trigger the watch() above exactly once on Vue's next reactivity flush -
  // no need to also call loadAll() here, which would just fire a second,
  // fully redundant request for the same FY/month (the same reasoning
  // FoundationConsolidated.vue's onMounted uses for its own single-key
  // watch; a multi-key array watch source batches the same way).
  await loadFinancialYears()
})
</script>

<style scoped>
.fc-export-all {
  background-color: #1a1a1a;
  border-color: #1a1a1a;
  color: #fff;
}
.fc-export-all:hover {
  background-color: #333;
}
</style>
