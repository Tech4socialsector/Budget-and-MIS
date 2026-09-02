<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <!-- Financial Year filter + Export All -->
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
          <Switch v-model="showFullNumbers" label="Show full numbers" />
        </div>
        <Button variant="solid" class="fc-export-all" :loading="exportingKey === 'all'" @click="exportTab('all')">
          <template #prefix>
            <FeatherIcon name="download" class="h-4 w-4" />
          </template>
          Export All
        </Button>
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

      <!-- TAB 1: PPT / Foundation level - Overall metrics -->
      <PptTab
        v-if="activeTab === 'ppt'"
        :loading="pptLoading"
        :error="pptError"
        :rows="pptRows"
        :prev-rows="pptPrevRows"
        :main-title="pptMainTitle"
        :prev-title="pptPrevTitle"
        :budget-label="pptBudgetLabel"
        :actual-label="pptActualLabel"
        :prev-budget-label="pptPrevBudgetLabel"
        :prev-actual-label="pptPrevActualLabel"
        :education-groups="pptEducationGroups"
        :opex-table="pptOpexTable"
        :capex-table="pptCapexTable"
        :exporting="exportingKey === 'ppt'"
        @retry="() => loadPpt(true)"
        @export="() => exportTab('ppt')"
      />

      <!-- TAB 2: Summary in INR -->
      <SummaryInrTab
        v-else-if="activeTab === 'summary_inr'"
        :loading="summaryInrLoading"
        :error="summaryInrError"
        :raw="summaryInrRaw"
        :headcount="headcountRaw"
        :current-fy-tree="consolidatedReportTree"
        :prev-actuals-tree="groupedActualsTree"
        :financial-year="filters.financialYear"
        :exporting="exportingKey === 'summary_inr'"
        @retry="() => loadSummaryInr(true)"
        @export="() => exportTab('summary_inr')"
      />

      <!-- TAB 3: Headcount -->
      <HeadcountTab
        v-else-if="activeTab === 'headcount'"
        :loading="headcountLoading"
        :error="headcountError"
        :headcount-data="headcountRecords"
        :plan-data="headcountPlanData"
        :exporting="exportingKey === 'headcount'"
        @retry="() => loadHeadcount(true)"
        @export="() => exportTab('headcount')"
      />

      <!-- TAB 4: Annual Budget Consolidated -->
      <ExpenseTreeTab
        v-else-if="activeTab === 'annual_budget'"
        kind="annual"
        :loading="annualLoading"
        :error="annualError"
        :data="annualData"
        :financial-year="filters.financialYear"
        :exporting="exportingKey === 'annual'"
        @retry="() => loadAnnual(true)"
        @export="() => exportTab('annual')"
      />

      <!-- TAB 5: Actuals Consolidated -->
      <ExpenseTreeTab
        v-else-if="activeTab === 'actuals'"
        kind="actuals"
        :loading="actualsLoading"
        :error="actualsError"
        :data="actualsData"
        :financial-year="filters.financialYear"
        :exporting="exportingKey === 'actuals'"
        @retry="() => loadActuals(true)"
        @export="() => exportTab('actuals')"
      />

      <!-- TAB 6: Budget & Actuals -->
      <BudgetActualsTab
        v-else-if="activeTab === 'budget_actuals'"
        :loading="budgetActualsLoading"
        :error="budgetActualsError"
        :raw-data="budgetActualsRawData"
        :main-item-breakdown="budgetActualsMainItemBreakdown"
        :financial-year="filters.financialYear"
        :exporting="exportingKey === 'budget_actuals'"
        @retry="() => loadBudgetActuals(true)"
        @export="() => exportTab('budget_actuals')"
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, provide, reactive, ref, watch } from 'vue'
import { MultiSelect, Button, FeatherIcon, Switch } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'
import {
  downloadXlsx,
  fyToPrevBareYear,
  getFYLabels,
  normName,
  isGrandTotalSection,
} from '@/data/foundationConsolidatedData'
import PptTab from '@/components/foundationConsolidated/PptTab.vue'
import SummaryInrTab from '@/components/foundationConsolidated/SummaryInrTab.vue'
import HeadcountTab from '@/components/foundationConsolidated/HeadcountTab.vue'
import ExpenseTreeTab from '@/components/foundationConsolidated/ExpenseTreeTab.vue'
import BudgetActualsTab from '@/components/foundationConsolidated/BudgetActualsTab.vue'

const TABS = [
  { key: 'ppt', label: 'Foundation Level / Overall Metrics' },
  { key: 'summary_inr', label: 'Summary in INR' },
  { key: 'headcount', label: 'Headcount' },
  { key: 'annual_budget', label: 'Annual Budget Consolidated' },
  { key: 'actuals', label: 'Actuals Consolidated' },
  { key: 'budget_actuals', label: 'Budget & Actuals' },
]
const activeTab = ref('ppt')

// --- Financial Year ------------------------------------------------------
const filters = reactive({ financialYear: '' })
const financialYearOptions = ref([])
const financialYearSelection = computed({
  get: () => (filters.financialYear ? [filters.financialYear] : []),
  set: (values) => {
    filters.financialYear = values.length ? values[values.length - 1] : ''
  },
})

// "Show full numbers" toggle - every tab's CrCell already supports both a
// Cr-in-cell mode and a full-rupee-in-cell mode (see CrCell.vue's own
// mode prop/comment); provide()'d here under the same injection key
// MisAmount.vue reads on Monthly MIS so CrCell can pick it up directly
// without every one of the ~6 tab components needing a new prop threaded
// through them individually.
const showFullNumbers = ref(false)
provide('misShowFullNumbers', showFullNumbers)

function defaultFinancialYear(options) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const cur = (m >= 4 ? y : y - 1) + '-' + String(m >= 4 ? y + 1 : y).slice(-2)
  const match = options.find((o) => o.value === cur)
  return match ? match.value : options[0].value
}

async function loadFinancialYears() {
  const rows = await call('annual_budget.api.filter_options.get_financial_year_list')
  financialYearOptions.value = (rows || []).map((r) => ({ label: r.financial_year, value: r.financial_year }))
  if (!filters.financialYear && financialYearOptions.value.length) {
    filters.financialYear = defaultFinancialYear(financialYearOptions.value)
  }
}

// Page title mirrors the Desk page's updatePageTitle(): base title, plus the
// selected FY once known.
watch(
  () => filters.financialYear,
  (fy) => setPageTitle(fy ? `Foundation - Consolidated Budget - ${fy}` : 'Foundation - Consolidated Budget'),
  { immediate: true },
)

// =========================================================================
// Per-tab lazy loading - loaded{tab: fy} tracks the last FY each tab was
// successfully loaded for (mirrors the Desk page's TabLoader.loaded map),
// so switching tabs back and forth doesn't refetch, but an FY change or a
// failed/empty load does.
// =========================================================================
const loadedFor = reactive({})

function tabErrorMessage(e) {
  return e?.messages?.[0] || e?.message || 'Something went wrong loading this data.'
}

// Per-tab request generation counters. Each tab's backend calls are slow
// (single-worker dev bench, confirmed 15-80s+ per call) and there is no
// request cancellation - so switching the Financial Year while an earlier
// request for the PREVIOUS FY is still in flight can otherwise let that
// stale response land AFTER the new FY's response and silently overwrite
// correct data with the wrong FY's numbers. Each loader bumps its own
// counter at the start and checks it's still current before committing
// results, so only the latest request for a tab is ever allowed to write.
const requestGen = reactive({ ppt: 0, summary_inr: 0, headcount: 0, annual_budget: 0, actuals: 0, budget_actuals: 0 })

// -------------------------------------------------------------------------
// TAB 1: PPT (Foundation level / Overall metrics)
// -------------------------------------------------------------------------
const pptLoading = ref(false)
const pptError = ref(null)
const pptRows = ref([])
const pptPrevRows = ref([])
const pptMainTitle = ref('Overall Foundation - Budget vs. Actual')
const pptPrevTitle = ref('')
const pptBudgetLabel = ref('')
const pptActualLabel = ref('')
const pptPrevBudgetLabel = ref('')
const pptPrevActualLabel = ref('')
const pptEducationGroups = ref([])
const pptOpexTable = ref(null)
const pptCapexTable = ref(null)

function normSec(s) {
  return normName(s)
}
function extractVals(sections, field) {
  let opex = 0, capex = 0, hasBreakdown = false
  for (const sec of sections || []) {
    if (isGrandTotalSection(sec)) continue
    const nm = normSec(sec.name)
    if (nm.includes('OPERATING')) { opex += Number(sec[field] || 0); hasBreakdown = true }
    if (nm.includes('CAPITAL')) { capex += Number(sec[field] || 0); hasBreakdown = true }
  }
  if (!hasBreakdown) {
    for (const sec of sections || []) {
      if (isGrandTotalSection(sec)) opex += Number(sec[field] || 0)
    }
    if (!opex) {
      for (const sec of sections || []) {
        if (!isGrandTotalSection(sec)) opex += Number(sec[field] || 0)
      }
    }
  }
  return { opex, capex }
}
function extractCovid(sections, field) {
  let covid = 0
  for (const sec of sections || []) {
    if (isGrandTotalSection(sec)) continue
    if (normSec(sec.name).includes('COVID')) covid += Number(sec[field] || 0)
  }
  return covid
}
function extractTotal(sections, field) {
  let gt = 0
  for (const sec of sections || []) {
    if (isGrandTotalSection(sec)) gt += Number(sec[field] || 0)
  }
  if (!gt) {
    for (const sec of sections || []) gt += Number(sec[field] || 0)
  }
  return gt
}
function buildPptRows(data, cfg) {
  const rows = [...(data || [])]
    .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
    .map((e) => {
      const sections = e[cfg.key] || []
      const b = extractVals(sections, cfg.budgetField)
      const v = extractVals(sections, cfg.actualField)
      return {
        label: e.label || '',
        bOpex: b.opex, bCapex: b.capex,
        bCovid: extractCovid(sections, cfg.budgetField),
        bTotal: extractTotal(sections, cfg.budgetField),
        eOpex: v.opex, eCapex: v.capex,
        eCovid: extractCovid(sections, cfg.actualField),
        eTotal: extractTotal(sections, cfg.actualField),
      }
    })
  const tot = { bOpex: 0, bCapex: 0, bCovid: 0, bTotal: 0, eOpex: 0, eCapex: 0, eCovid: 0, eTotal: 0 }
  for (const r of rows) {
    tot.bOpex += r.bOpex; tot.bCapex += r.bCapex; tot.bCovid += r.bCovid; tot.bTotal += r.bTotal
    tot.eOpex += r.eOpex; tot.eCapex += r.eCapex; tot.eCovid += r.eCovid; tot.eTotal += r.eTotal
  }
  rows.push({ label: 'Total', isTotal: true, ...tot })
  return rows
}

function buildEducationGroups(data, cfg, bLbl, eLbl) {
  const subItems = (data || []).filter((e) => e.is_this_sub_item === 1)
  if (!subItems.length) return []
  const groups = {}
  const order = []
  for (const e of subItems) {
    const grp = (e.table_name || 'Other').trim()
    if (!groups[grp]) { groups[grp] = []; order.push(grp) }
    groups[grp].push(e)
  }
  return order.map((grp) => {
    const entries = [...groups[grp]].sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
    const tot = { bOpex: 0, bCapex: 0, bTotal: 0, eOpex: 0, eCapex: 0, eTotal: 0 }
    const rows = entries.map((e) => {
      const sections = e[cfg.key] || []
      const b = extractVals(sections, cfg.budgetField)
      const v = extractVals(sections, cfg.actualField)
      const bTot = extractTotal(sections, cfg.budgetField)
      const eTot = extractTotal(sections, cfg.actualField)
      tot.bOpex += b.opex; tot.bCapex += b.capex; tot.bTotal += bTot
      tot.eOpex += v.opex; tot.eCapex += v.capex; tot.eTotal += eTot
      return { label: e.label || '', bOpex: b.opex, bCapex: b.capex, bTotal: bTot, eOpex: v.opex, eCapex: v.capex, eTotal: eTot }
    })
    return { name: grp, title: 'EDUCATION', bLbl, eLbl, rows, total: tot }
  })
}

function buildBreakdownTable(entries, kind, fyLabel) {
  // kind: 'opex' (by sub_heads under OPERATING) | 'capex' (by items under CAPITAL)
  if (!entries || !entries.length) return null
  const isMatch = (name) => normName(name).includes(kind === 'opex' ? 'OPERATING' : 'CAPITAL')
  function names() {
    const seen = new Set()
    const out = []
    for (const e of entries) {
      for (const s of e.actuals || []) {
        if (!isMatch(s.name)) continue
        const list = kind === 'opex' ? (s.sub_heads || []) : (s.items || [])
        for (const item of list) {
          const n = (item.name || '').trim()
          if (n && !seen.has(n)) { seen.add(n); out.push(n) }
        }
      }
    }
    return out
  }
  function rowVal(e, name) {
    let v = 0
    for (const s of e.actuals || []) {
      if (!isMatch(s.name)) continue
      const list = kind === 'opex' ? (s.sub_heads || []) : (s.items || [])
      for (const item of list) {
        if ((item.name || '').trim() === name) v += Number(item.ytd || 0)
      }
    }
    return v
  }
  function catTotal(e) {
    let v = 0
    for (const s of e.actuals || []) {
      if (isMatch(s.name)) v += Number(s.ytd || 0)
    }
    return v
  }
  const rowNames = names()
  if (!rowNames.length) return null
  const rows = rowNames.map((name) => {
    const cells = entries.map((e) => rowVal(e, name))
    return { name, cells, rowTotal: cells.reduce((a, b) => a + b, 0) }
  })
  const totalsRow = entries.map((e) => catTotal(e))
  const fyPart = fyLabel.replace(/\s*budget\s*/i, '').trim()
  return {
    title: (kind === 'opex' ? 'OPERATING EXPENSES ' : 'CAPITAL EXPENSES ') + fyPart,
    units: entries.map((e) => (e.label || '').trim()),
    rows,
    totalsRow,
    grandTotal: totalsRow.reduce((a, b) => a + b, 0),
  }
}

async function loadPpt(force) {
  const fy = filters.financialYear
  if (!fy) return
  if (!force && loadedFor.ppt === fy) return
  loadedFor.ppt = fy
  const gen = ++requestGen.ppt
  pptLoading.value = true
  pptError.value = null
  try {
    const [d, raw] = await Promise.all([
      call('annual_budget.api.foundation_consolidated_report.get_foundation_overall', {
        financial_year: fy, month: 'March', table_name_filter: 'Foundation Overall',
      }),
      call('annual_budget.api.foundation_consolidated_report.get_unit_wise_plan', {
        financial_year: fy, month: 'March', table_name_filter: 'Opex Capex', is_previous: 1,
      }),
    ])
    // A newer request for this tab (e.g. the user changed FY again while
    // this one was still in flight) has already started - discard this
    // now-stale response instead of overwriting the newer one.
    if (gen !== requestGen.ppt) return
    const data = d || []
    if (!data.length) {
      pptRows.value = []
      pptPrevRows.value = []
      pptEducationGroups.value = []
      pptOpexTable.value = null
      pptCapexTable.value = null
      delete loadedFor.ppt
      return
    }
    const p = (fy || '2025-26').split('-')
    const cS = parseInt(p[0], 10), cE = parseInt(p[1], 10)
    const curFY = `${cS}-${String(cE).padStart(2, '0')}`
    const prvFY = `${cS - 1}-${String(cE - 1).padStart(2, '0')}`

    pptMainTitle.value = `Overall Foundation – ${curFY} Budget vs ${prvFY} Actual`
    pptPrevTitle.value = `Overall Foundation – ${prvFY} Budget vs ${prvFY} Actual`

    const cCfg = { key: 'current_year', budgetField: 'ytd', actualField: 'total_posted_amt_ytd' }
    const pCfg = { key: 'previous_year', budgetField: 'ytd', actualField: 'total_posted_amt_ytd' }
    const mainData = data.filter((e) => e.is_this_sub_item !== 1)
    pptRows.value = buildPptRows(mainData, cCfg)
    pptPrevRows.value = buildPptRows(mainData, pCfg)
    pptBudgetLabel.value = `${curFY} Budget`
    pptActualLabel.value = `${prvFY} Actual`
    pptPrevBudgetLabel.value = `${prvFY} Budget`
    pptPrevActualLabel.value = `${prvFY} Actual`

    pptEducationGroups.value = buildEducationGroups(data, cCfg, pptBudgetLabel.value, pptActualLabel.value)

    const uwp = (raw || [])
      .filter((e) => e.is_this_sub_item === 0 && e.sequence_id !== 9999 && normName(e.table_name) !== 'CONSOLIDATED')
      .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
    pptOpexTable.value = buildBreakdownTable(uwp, 'opex', curFY)
    pptCapexTable.value = buildBreakdownTable(uwp, 'capex', curFY)
  } catch (e) {
    if (gen !== requestGen.ppt) return
    pptError.value = e
    delete loadedFor.ppt
  } finally {
    if (gen === requestGen.ppt) pptLoading.value = false
  }
}

// -------------------------------------------------------------------------
// TAB 2: Summary in INR
// -------------------------------------------------------------------------
const summaryInrLoading = ref(false)
const summaryInrError = ref(null)
const summaryInrRaw = ref([])
const headcountRaw = ref({ headcount_data: [], plan_data: [] })
const consolidatedReportTree = ref([])
const groupedActualsTree = ref([])

async function loadSummaryInr(force) {
  const fy = filters.financialYear
  if (!fy) return
  if (!force && loadedFor.summary_inr === fy) return
  loadedFor.summary_inr = fy
  const gen = ++requestGen.summary_inr
  summaryInrLoading.value = true
  summaryInrError.value = null
  try {
    const prevYear = fyToPrevBareYear(fy)
    const [summary, hc, cr, ga] = await Promise.all([
      call('annual_budget.api.foundation_consolidated_report.get_unit_wise_plan', {
        financial_year: fy, month: 'March', table_name_filter: 'Unit Wise Plan', is_previous: 1,
      }),
      call('annual_budget.api.foundation_consolidated_report.get_headcount', {
        financial_year: fy, month: 'March', table_name_filter: 'Unit Wise Plan',
      }),
      call('annual_budget.api.phase_sheet.get_consolidated_report', { financial_year: fy }),
      call('annual_budget.api.foundation_consolidated_report.get_grouped_actuals_quarter_and_month_wise_total', {
        fiscal_year: prevYear, accounting_period: '12',
      }),
    ])
    if (gen !== requestGen.summary_inr) return
    summaryInrRaw.value = summary || []
    headcountRaw.value = hc?.status === 'success' ? hc : { headcount_data: hc?.headcount_data || [], plan_data: hc?.plan_data || [] }
    consolidatedReportTree.value = cr || []
    const gaData = ga?.status === 'success' ? ga.data : (Array.isArray(ga) ? ga : ga?.data || [])
    groupedActualsTree.value = gaData || []
  } catch (e) {
    if (gen !== requestGen.summary_inr) return
    summaryInrError.value = e
    delete loadedFor.summary_inr
  } finally {
    if (gen === requestGen.summary_inr) summaryInrLoading.value = false
  }
}

// -------------------------------------------------------------------------
// TAB 3: Headcount
// -------------------------------------------------------------------------
const headcountLoading = ref(false)
const headcountError = ref(null)
const headcountRecords = ref([])
const headcountPlanData = ref([])

async function loadHeadcount(force) {
  const fy = filters.financialYear
  if (!fy) return
  if (!force && loadedFor.headcount === fy) return
  loadedFor.headcount = fy
  const gen = ++requestGen.headcount
  headcountLoading.value = true
  headcountError.value = null
  try {
    const hc = await call('annual_budget.api.foundation_consolidated_report.get_headcount', {
      financial_year: fy, month: 'March', table_name_filter: 'Unit Wise Plan',
    })
    if (gen !== requestGen.headcount) return
    headcountRecords.value = hc?.headcount_data || []
    headcountPlanData.value = hc?.plan_data || []
    if (hc?.status === 'error') throw new Error(hc.message || 'Failed to load headcount')
  } catch (e) {
    if (gen !== requestGen.headcount) return
    headcountError.value = e
    delete loadedFor.headcount
  } finally {
    if (gen === requestGen.headcount) headcountLoading.value = false
  }
}

// -------------------------------------------------------------------------
// TAB 4: Annual Budget Consolidated
// -------------------------------------------------------------------------
const annualLoading = ref(false)
const annualError = ref(null)
const annualData = ref([])

async function loadAnnual(force) {
  const fy = filters.financialYear
  if (!fy) return
  if (!force && loadedFor.annual_budget === fy) return
  loadedFor.annual_budget = fy
  const gen = ++requestGen.annual_budget
  annualLoading.value = true
  annualError.value = null
  try {
    const result = await call('annual_budget.api.phase_sheet.get_consolidated_report', { financial_year: fy })
    if (gen !== requestGen.annual_budget) return
    annualData.value = result || []
    if (!annualData.value.length) delete loadedFor.annual_budget
  } catch (e) {
    if (gen !== requestGen.annual_budget) return
    annualError.value = e
    annualData.value = []
    delete loadedFor.annual_budget
  } finally {
    if (gen === requestGen.annual_budget) annualLoading.value = false
  }
}

// -------------------------------------------------------------------------
// TAB 5: Actuals Consolidated
// -------------------------------------------------------------------------
const actualsLoading = ref(false)
const actualsError = ref(null)
const actualsData = ref([])

async function loadActuals(force) {
  const fy = filters.financialYear
  if (!fy) return
  if (!force && loadedFor.actuals === fy) return
  loadedFor.actuals = fy
  const gen = ++requestGen.actuals
  actualsLoading.value = true
  actualsError.value = null
  try {
    const prevYear = fyToPrevBareYear(fy)
    const result = await call('annual_budget.api.foundation_consolidated_report.get_grouped_actuals_quarter_and_month_wise_total', {
      fiscal_year: prevYear, accounting_period: '12',
    })
    if (gen !== requestGen.actuals) return
    const data = result?.status === 'success' ? result.data : (Array.isArray(result) ? result : result?.data || [])
    actualsData.value = data || []
    if (!actualsData.value.length) delete loadedFor.actuals
  } catch (e) {
    if (gen !== requestGen.actuals) return
    actualsError.value = e
    actualsData.value = []
    delete loadedFor.actuals
  } finally {
    if (gen === requestGen.actuals) actualsLoading.value = false
  }
}

// -------------------------------------------------------------------------
// TAB 6: Budget & Actuals
// -------------------------------------------------------------------------
const budgetActualsLoading = ref(false)
const budgetActualsError = ref(null)
const budgetActualsRawData = ref([])
const budgetActualsMainItemBreakdown = ref([])

async function loadBudgetActuals(force) {
  const fy = filters.financialYear
  if (!fy) return
  if (!force && loadedFor.budget_actuals === fy) return
  loadedFor.budget_actuals = fy
  const gen = ++requestGen.budget_actuals
  budgetActualsLoading.value = true
  budgetActualsError.value = null
  try {
    const d = await call('annual_budget.api.foundation_consolidated_report.get_unit_wise_plan', {
      financial_year: fy, month: 'March', table_name_filter: 'Budget & Estimate', is_previous: 1,
    })
    if (gen !== requestGen.budget_actuals) return
    const all = d || []
    const consolidatedBlock = all.find((e) => normName(e.table_name) === 'CONSOLIDATED')
    // Confirmed against the live Desk JS: get_unit_wise_plan's CONSOLIDATED
    // entry never actually sets a main_item_breakdown key in the current
    // backend (grep across annual_budget/ found zero definitions of it
    // outside this same JS file) - so this reads [] today, and the Grand
    // Total Plan/Est columns render as 0/blank, exactly matching the live
    // Desk page's current (buggy) behavior rather than guessing a fix.
    budgetActualsMainItemBreakdown.value = consolidatedBlock?.main_item_breakdown || []
    budgetActualsRawData.value = all
      .filter((e) => e.is_this_sub_item === 0 && e.sequence_id !== 9999 && normName(e.table_name) !== 'CONSOLIDATED')
      .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
    if (!budgetActualsRawData.value.length) delete loadedFor.budget_actuals
  } catch (e) {
    if (gen !== requestGen.budget_actuals) return
    budgetActualsError.value = e
    budgetActualsRawData.value = []
    delete loadedFor.budget_actuals
  } finally {
    if (gen === requestGen.budget_actuals) budgetActualsLoading.value = false
  }
}

// =========================================================================
// Tab switching / FY change reactivity
// =========================================================================
const LOADERS = {
  ppt: loadPpt,
  summary_inr: loadSummaryInr,
  headcount: loadHeadcount,
  annual_budget: loadAnnual,
  actuals: loadActuals,
  budget_actuals: loadBudgetActuals,
}

watch(activeTab, (tab) => LOADERS[tab]?.())
watch(() => filters.financialYear, () => {
  // Mirrors the Desk page's DataCache.reset() + TabLoader.resetAll() on FY
  // change: forget every tab's "already loaded" state, then reload only
  // the active tab immediately (others lazy-reload next time they're clicked).
  for (const k of Object.keys(loadedFor)) delete loadedFor[k]
  LOADERS[activeTab.value]?.()
})

// =========================================================================
// Export to Excel
// =========================================================================
const exportingKey = ref(null)

const EXPORT_METHODS = {
  ppt: 'annual_budget.api.export_reports.export_ppt',
  summary_inr: 'annual_budget.api.export_reports.export_summary_inr',
  headcount: 'annual_budget.api.export_reports.export_headcount',
  annual: 'annual_budget.api.export_reports.export_annual',
  actuals: 'annual_budget.api.export_reports.export_estimate',
  budget_actuals: 'annual_budget.api.export_reports.export_budget_estimate',
  all: 'annual_budget.api.export_reports.export_all',
}

function buildExportArgs(key, fy) {
  if (key === 'ppt') {
    return {
      financial_year: fy,
      ppt_rows: JSON.stringify(pptRows.value),
      prev_ppt_rows: JSON.stringify(pptPrevRows.value),
      budget_label: pptBudgetLabel.value,
      est_label: pptActualLabel.value,
      prev_budget_label: pptPrevBudgetLabel.value,
      prev_est_label: pptPrevActualLabel.value,
    }
  }
  if (key === 'summary_inr') return { financial_year: fy, summary_data: JSON.stringify(summaryInrRaw.value) }
  if (key === 'headcount') return { financial_year: fy, headcount_data: JSON.stringify(headcountRaw.value) }
  if (key === 'annual') return { financial_year: fy, annual_data: JSON.stringify(annualData.value) }
  if (key === 'actuals') return { financial_year: fy, estimate_data: JSON.stringify(actualsData.value) }
  if (key === 'budget_actuals') return { financial_year: fy, be_data: JSON.stringify(budgetActualsRawData.value) }
  if (key === 'all') {
    return {
      financial_year: fy,
      ppt_rows: JSON.stringify(pptRows.value),
      prev_ppt_rows: JSON.stringify(pptPrevRows.value),
      budget_label: pptBudgetLabel.value,
      est_label: pptActualLabel.value,
      prev_budget_label: pptPrevBudgetLabel.value,
      prev_est_label: pptPrevActualLabel.value,
      summary_data: JSON.stringify(summaryInrRaw.value),
      headcount_data: JSON.stringify(headcountRaw.value),
      annual_data: JSON.stringify(annualData.value),
      estimate_data: JSON.stringify(actualsData.value),
      be_data: JSON.stringify(budgetActualsRawData.value),
    }
  }
  return { financial_year: fy }
}

function missingTabsForExportAll() {
  const missing = []
  if (!pptRows.value.length) missing.push('Foundation Metrics (tab 1)')
  if (!summaryInrRaw.value.length) missing.push('Summary in INR (tab 2)')
  if (!headcountRaw.value?.headcount_data?.length) missing.push('Headcount (tab 3)')
  if (!annualData.value.length) missing.push('Annual Budget (tab 4)')
  if (!actualsData.value.length) missing.push('Actuals Consolidated (tab 5)')
  if (!budgetActualsRawData.value.length) missing.push('Budget & Actuals (tab 6)')
  return missing
}

async function exportTab(key) {
  const fy = filters.financialYear || '2025-26'
  if (key === 'all') {
    const missing = missingTabsForExportAll()
    if (missing.length) {
      window.alert('Please open each tab first.\n\nStill loading: ' + missing.join(', '))
      return
    }
  } else {
    const guardMap = {
      ppt: pptRows.value.length,
      summary_inr: summaryInrRaw.value.length,
      headcount: headcountRaw.value?.headcount_data?.length,
      annual: annualData.value.length,
      actuals: actualsData.value.length,
      budget_actuals: budgetActualsRawData.value.length,
    }
    if (!guardMap[key]) {
      window.alert('Please wait for this tab’s data to load first.')
      return
    }
  }
  exportingKey.value = key
  try {
    const result = await call(EXPORT_METHODS[key], buildExportArgs(key, fy))
    if (!downloadXlsx(result)) window.alert('Export failed — no data returned.')
  } catch (e) {
    window.alert(tabErrorMessage(e) || 'Server error during export.')
  } finally {
    exportingKey.value = null
  }
}

onMounted(async () => {
  // loadFinancialYears() sets filters.financialYear to the computed
  // default, which the watch() above already reacts to by loading the
  // active tab (PPT) - no need to also call loadPpt() here (that would
  // just fire a second, fully redundant request for the same FY).
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
