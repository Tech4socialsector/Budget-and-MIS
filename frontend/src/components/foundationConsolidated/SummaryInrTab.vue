<!--
  Summary in INR tab: 8 lettered sections (A-H), read straight off the live
  Desk JS's SummaryINR module (functions tableHtmlA/B/OpexCapex/CPE/E/D and
  tableHtmlQuarterPhasing) - internal function-name letters differ from the
  UI-facing letters in a few places (tableHtmlE -> UI section F,
  tableHtmlD -> UI section H, tableHtmlCPE -> UI section E), which this
  component's template deliberately follows (UI letters, not fn names).

  Section C in the live page is the SIMPLE Opex-vs-Capex % table
  (tableHtmlOpexCapex) - a separate, more detailed per-unit breakdown
  function (tableHtmlC) exists in the source but is never called from
  load(), so it's dead code and intentionally NOT replicated here.
-->
<template>
  <ErrorMessage v-if="error" :message="errorMessage" />
  <div v-else-if="loading" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <AppLoader label="Building Summary in INR..." />
  </div>
  <div v-else-if="!raw.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
    No data available.
    <button class="ml-1 text-fc-blue-mid underline" @click="$emit('retry')">Retry</button>
  </div>
  <template v-else>
    <div class="flex justify-end">
      <Button variant="solid" class="fc-xl-btn" :loading="exporting" @click="$emit('export')">
        <template #prefix><FeatherIcon name="download" class="h-4 w-4" /></template>
        Export XLS
      </Button>
    </div>

    <!-- A. Unit Wise Plan -->
    <SectionLabel text="A. Unit Wise Plan" />
    <div class="fc-scroll-wrapper">
      <table class="fc-table w-full min-w-[900px] text-sm">
        <thead>
          <tr class="fc-thead-main">
            <th rowspan="2" class="fc-th fc-sticky-col min-w-[240px] text-left">Unit / Function</th>
            <th colspan="4" class="fc-th text-center">{{ pLbl }}</th>
            <th colspan="4" class="fc-th text-center">{{ aLbl }}</th>
          </tr>
          <tr class="fc-thead-sub">
            <th class="fc-th-sub">Opex</th><th class="fc-th-sub">Capex</th><th class="fc-th-sub">Covid</th><th class="fc-th-sub">Total</th>
            <th class="fc-th-sub">Opex</th><th class="fc-th-sub">Capex</th><th class="fc-th-sub">Covid</th><th class="fc-th-sub">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in rowsA"
            :key="r.display"
            :class="r.isGrandTotal ? 'fc-row-grand' : (r.isTotal ? 'fc-subtotal-row' : '')"
          >
            <td class="fc-td fc-sticky-col text-left" :class="[r.isGrandTotal ? 'bg-fc-blue-mid' : 'bg-inherit', r.isSub ? 'pl-8 text-gray-500' : '']">{{ r.display }}</td>
            <td class="fc-td text-right"><CrCell :value="r.vals.opex_plan" /></td>
            <td class="fc-td text-right"><CrCell :value="r.vals.capex_plan" /></td>
            <td class="fc-td text-right"><CrCell :value="r.vals.covid_plan" /></td>
            <td class="fc-td text-right"><CrCell :value="r.vals.total_plan" /></td>
            <td class="fc-td text-right"><CrCell :value="r.vals.opex_act" /></td>
            <td class="fc-td text-right"><CrCell :value="r.vals.capex_act" /></td>
            <td class="fc-td text-right"><CrCell :value="r.vals.covid_act" /></td>
            <td class="fc-td text-right"><CrCell :value="r.vals.total_act" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- B. Breakdown of Unit Wise Plan -->
    <SectionLabel text="B. Breakdown of Unit Wise Plan" />
    <div class="fc-scroll-wrapper">
      <table class="fc-table w-full min-w-[900px] text-sm">
        <thead>
          <tr class="fc-thead-main">
            <th rowspan="2" class="fc-th fc-sticky-col min-w-[220px] text-left">Unit / Function</th>
            <th :colspan="subHeadNames.length + 1" class="fc-th text-center">Operating Expenses</th>
            <th rowspan="2" class="fc-th text-center">Capex</th>
            <th rowspan="2" class="fc-th text-center">Covid</th>
            <th rowspan="2" class="fc-th text-center">Total</th>
          </tr>
          <tr class="fc-thead-sub">
            <th v-for="n in subHeadNames" :key="n" class="fc-th-sub">{{ n }}</th>
            <th class="fc-th-sub">Total</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in breakdownB.units" :key="row.label">
            <tr class="fc-row-head">
              <td class="fc-td fc-sticky-col bg-fc-blue-light text-left dark:bg-transparent" :colspan="subHeadNames.length + 5">{{ row.label }}</td>
            </tr>
            <tr>
              <td class="fc-td fc-sticky-col bg-white pl-4 text-left dark:bg-gray-900">- {{ pLbl }}</td>
              <td v-for="n in subHeadNames" :key="n" class="fc-td text-right"><CrCell :value="row.plan.sh[n]" /></td>
              <td class="fc-td text-right"><CrCell :value="row.plan.opex" /></td>
              <td class="fc-td text-right"><CrCell :value="row.plan.capex" /></td>
              <td class="fc-td text-right"><CrCell :value="row.plan.covid" /></td>
              <td class="fc-td text-right"><CrCell :value="row.plan.opex + row.plan.capex + row.plan.covid" /></td>
            </tr>
            <tr class="bg-gray-50 dark:bg-gray-800/40">
              <td class="fc-td fc-sticky-col bg-gray-50 pl-4 text-left dark:bg-gray-800/40">- {{ aLbl }}</td>
              <td v-for="n in subHeadNames" :key="n" class="fc-td text-right"><CrCell :value="row.act.sh[n]" /></td>
              <td class="fc-td text-right"><CrCell :value="row.act.opex" /></td>
              <td class="fc-td text-right"><CrCell :value="row.act.capex" /></td>
              <td class="fc-td text-right"><CrCell :value="row.act.covid" /></td>
              <td class="fc-td text-right"><CrCell :value="row.act.opex + row.act.capex + row.act.covid" /></td>
            </tr>
          </template>
          <tr class="fc-row-grand">
            <td class="fc-td fc-sticky-col bg-fc-blue-mid text-left" :colspan="subHeadNames.length + 5">Grand Total</td>
          </tr>
          <tr class="fc-subtotal-row">
            <td class="fc-td fc-sticky-col bg-inherit pl-4 text-left">- {{ pLbl }}</td>
            <td v-for="n in subHeadNames" :key="n" class="fc-td text-right"><CrCell :value="breakdownB.grand.plan.sh[n]" /></td>
            <td class="fc-td text-right"><CrCell :value="breakdownB.grand.plan.opex" /></td>
            <td class="fc-td text-right"><CrCell :value="breakdownB.grand.plan.capex" /></td>
            <td class="fc-td text-right"><CrCell :value="breakdownB.grand.plan.covid" /></td>
            <td class="fc-td text-right"><CrCell :value="breakdownB.grand.plan.total" /></td>
          </tr>
          <tr class="fc-subtotal-row">
            <td class="fc-td fc-sticky-col bg-inherit pl-4 text-left">- {{ aLbl }}</td>
            <td v-for="n in subHeadNames" :key="n" class="fc-td text-right"><CrCell :value="breakdownB.grand.act.sh[n]" /></td>
            <td class="fc-td text-right"><CrCell :value="breakdownB.grand.act.opex" /></td>
            <td class="fc-td text-right"><CrCell :value="breakdownB.grand.act.capex" /></td>
            <td class="fc-td text-right"><CrCell :value="breakdownB.grand.act.covid" /></td>
            <td class="fc-td text-right"><CrCell :value="breakdownB.grand.act.total" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- C. Opex vs. Capex (the simple % table - the more detailed
    tableHtmlC exists in the Desk source but is dead code, never invoked) -->
    <SectionLabel text="C. Opex vs. Capex" />
    <div class="mb-6 w-fit overflow-x-auto rounded border border-gray-200 dark:border-gray-800">
      <table class="fc-table text-sm">
        <thead>
          <tr class="fc-thead-main">
            <th class="fc-th text-left"></th>
            <th class="fc-th text-center">{{ pLbl }}</th>
            <th class="fc-th text-center">{{ aLbl }}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="fc-td text-left">Opex</td><td class="fc-td text-right">{{ opexCapex.opexPctPlan }}</td><td class="fc-td text-right">{{ opexCapex.opexPctAct }}</td></tr>
          <tr><td class="fc-td text-left">Capex</td><td class="fc-td text-right">{{ opexCapex.capexPctPlan }}</td><td class="fc-td text-right">{{ opexCapex.capexPctAct }}</td></tr>
          <tr class="fc-subtotal-row font-bold"><td class="fc-td text-left">Total</td><td class="fc-td text-right">100.0%</td><td class="fc-td text-right">100.0%</td></tr>
        </tbody>
      </table>
    </div>

    <!-- D. Headcount - Closing & Average (conditional: only if headcount records exist) -->
    <template v-if="hcYears.length">
      <SectionLabel text="D. Headcount - Closing & Average" />
      <div class="fc-scroll-wrapper">
        <table class="fc-table w-full min-w-[500px] text-sm">
          <thead>
            <tr class="fc-thead-main">
              <th class="fc-th fc-sticky-col text-left">31st March</th>
              <th class="fc-th text-right">Closing H/C</th>
              <th class="fc-th text-right">Average H/C</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(y, i) in hcYears" :key="y">
              <td class="fc-td fc-sticky-col bg-white text-left dark:bg-gray-900">{{ fyMarchLabel(y) }}</td>
              <td class="fc-td text-right">{{ fmtInt(hcTotals[y]) }}</td>
              <td class="fc-td text-right">{{ fmtInt(hcAvg(i)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- E. Cost per Employee - Comparison -->
    <template v-if="cpe">
      <SectionLabel text="E. Cost per Employee - Comparison" />
      <div class="fc-scroll-wrapper">
        <table class="fc-table w-full min-w-[1000px] text-sm">
          <thead>
            <tr class="fc-thead-main">
              <th rowspan="3" class="fc-th fc-sticky-col min-w-[220px] text-left align-middle">Overall Foundation</th>
              <th colspan="2" class="fc-th text-center">INR</th>
              <th colspan="2" class="fc-th text-center">Cost / Person p.a.(Rs K)</th>
              <th colspan="2" class="fc-th text-center">Cost / Person p.m.(Rs K)</th>
              <th colspan="2" class="fc-th text-center">% Mix</th>
              <th rowspan="3" class="fc-th text-center align-middle">Increase in PPC<br />({{ financialYear }} vs {{ cpe.prevFYKey }})</th>
            </tr>
            <tr class="fc-thead-sub">
              <th class="fc-th-sub">{{ financialYear }}</th><th class="fc-th-sub">{{ cpe.prevFYKey }}</th>
              <th class="fc-th-sub">{{ financialYear }}</th><th class="fc-th-sub">{{ cpe.prevFYKey }}</th>
              <th class="fc-th-sub">{{ financialYear }}</th><th class="fc-th-sub">{{ cpe.prevFYKey }}</th>
              <th class="fc-th-sub">{{ financialYear }}</th><th class="fc-th-sub">{{ cpe.prevFYKey }}</th>
            </tr>
            <tr class="fc-thead-sub">
              <th class="fc-th-sub-row3">Plan</th><th class="fc-th-sub-row3">Actual</th>
              <th class="fc-th-sub-row3">Plan</th><th class="fc-th-sub-row3">Actual</th>
              <th class="fc-th-sub-row3">Plan</th><th class="fc-th-sub-row3">Actual</th>
              <th class="fc-th-sub-row3">Plan</th><th class="fc-th-sub-row3">Actual</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in cpe.rows" :key="row.name">
              <td class="fc-td fc-sticky-col bg-white text-left dark:bg-gray-900">{{ row.name }}</td>
              <td class="fc-td text-right"><CrCell :value="row.inrCrPlan * 1e7" /></td>
              <td class="fc-td text-right"><CrCell :value="row.inrCrEst * 1e7" /></td>
              <td class="fc-td text-right">{{ fmtK(row.cpaPlan) }}</td>
              <td class="fc-td text-right">{{ fmtK(row.cpaEst) }}</td>
              <td class="fc-td text-right">{{ fmtK(row.cpmPlan) }}</td>
              <td class="fc-td text-right">{{ fmtK(row.cpmEst) }}</td>
              <td class="fc-td text-right">{{ fmtMix(row.mixPlan) }}</td>
              <td class="fc-td text-right">{{ fmtMix(row.mixEst) }}</td>
              <td class="fc-td text-right" :style="incStyle(row.ppInc)">{{ fmtInc(row.ppInc) }}</td>
            </tr>
            <tr class="fc-subtotal-row font-bold">
              <td class="fc-td fc-sticky-col bg-inherit text-left">Total Operating Expenses</td>
              <td class="fc-td text-right"><CrCell :value="cpe.total.inrCrPlan * 1e7" /></td>
              <td class="fc-td text-right"><CrCell :value="cpe.total.inrCrEst * 1e7" /></td>
              <td class="fc-td text-right">{{ fmtK(cpe.total.cpaPlan) }}</td>
              <td class="fc-td text-right">{{ fmtK(cpe.total.cpaEst) }}</td>
              <td class="fc-td text-right">{{ fmtK(cpe.total.cpmPlan) }}</td>
              <td class="fc-td text-right">{{ fmtK(cpe.total.cpmEst) }}</td>
              <td class="fc-td text-right">100%</td>
              <td class="fc-td text-right">100%</td>
              <td class="fc-td text-right" :style="incStyle(cpe.total.ppInc)">{{ fmtInc(cpe.total.ppInc) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- F. Other Operating Expenses -->
    <SectionLabel text="F. Other Operating Expenses" />
    <UnitGrandTable :rows="otherOpex.rows" :totals-row="otherOpex.totalsRow" :units="otherOpex.units" :p-lbl="pLbl" :a-lbl="aLbl" />

    <!-- G. Quarter Phasing -->
    <SectionLabel text="G. Quarter Phasing" />
    <div class="mb-6 w-fit overflow-x-auto rounded border border-gray-200 dark:border-gray-800">
      <table class="fc-table text-sm">
        <tbody>
          <QuarterPhasingBlock :fy-label="financialYear" :block="quarterPhasing.current" />
          <tr><td colspan="6" class="h-3"></td></tr>
          <QuarterPhasingBlock :fy-label="prevFyForPhasing" :block="quarterPhasing.previous" />
        </tbody>
      </table>
    </div>

    <!-- H. Capital Expenditure -->
    <SectionLabel text="H. Capital Expenditure" />
    <UnitGrandTable :rows="capex.rows" :totals-row="capex.totalsRow" :units="capex.units" :p-lbl="pLbl" :a-lbl="aLbl" />
  </template>
</template>

<script setup>
import { computed, h } from 'vue'
import { Button, FeatherIcon, ErrorMessage } from 'frappe-ui'
import AppLoader from '@/components/AppLoader.vue'
import SectionLabel from '@/components/SectionLabel.vue'
import CrCell from './CrCell.vue'
import { normName, isConsolidatedEntry, prevFY as prevFyOf } from '@/data/foundationConsolidatedData'
import { rowTotal as annualRowTotal, QUARTERS } from '@/data/budgetTotals'
import { actualsQuarterTotal } from '@/data/foundationConsolidatedData'

const props = defineProps({
  loading: Boolean,
  error: { type: Object, default: null },
  raw: { type: Array, default: () => [] }, // unitWisePlanSummary result
  headcount: { type: Object, default: () => ({ headcount_data: [], plan_data: [] }) },
  currentFyTree: { type: Array, default: () => [] }, // get_consolidated_report
  prevActualsTree: { type: Array, default: () => [] }, // get_grouped_actuals_quarter_and_month_wise_total
  financialYear: { type: String, default: '' },
  exporting: Boolean,
})
defineEmits(['retry', 'export'])

const errorMessage = computed(() => props.error?.messages?.[0] || props.error?.message || 'Something went wrong loading Summary in INR.')

const fyParts = computed(() => (props.financialYear || '2025-26').split('-'))
const pLbl = computed(() => `${props.financialYear} Budget`)
const prevFyForPhasing = computed(() => prevFyOf(props.financialYear))
const aLbl = computed(() => `${prevFyForPhasing.value} Actual`)

function isOperating(name) { return normName(name).includes('OPERATING') }
function isCapital(name) { return normName(name).includes('CAPITAL') }
function isCovidName(name) { return normName(name).includes('COVID') }

// -- A. Unit Wise Plan ------------------------------------------------
function zero() { return { opex_plan: 0, opex_act: 0, capex_plan: 0, capex_act: 0, covid_plan: 0, covid_act: 0, total_plan: 0, total_act: 0 } }
function extractA(actuals) {
  const r = zero()
  for (const sec of actuals || []) {
    const nm = normName(sec.name)
    if (nm === 'OPERATING EXPENSES') { r.opex_plan += Number(sec.ytd || 0); r.opex_act += Number(sec.total_posted_amt_ytd || 0) }
    if (nm === 'CAPITAL EXPENSES') { r.capex_plan += Number(sec.ytd || 0); r.capex_act += Number(sec.total_posted_amt_ytd || 0) }
    if (nm.includes('COVID')) { r.covid_plan += Number(sec.ytd || 0); r.covid_act += Number(sec.total_posted_amt_ytd || 0) }
  }
  r.total_plan = r.opex_plan + r.capex_plan + r.covid_plan
  r.total_act = r.opex_act + r.capex_act + r.covid_act
  return r
}
const consolidatedTotals = computed(() => {
  const ct = props.raw.find(isConsolidatedEntry)
  if (!ct) return null
  const r = zero()
  for (const a of ct.actuals || []) {
    const nm = normName(a.name)
    if (nm === 'OPEX TOTAL') { r.opex_plan += Number(a.ytd || 0); r.opex_act += Number(a.total_posted_amt_ytd || 0) }
    if (nm === 'CAPEX TOTAL') { r.capex_plan += Number(a.ytd || 0); r.capex_act += Number(a.total_posted_amt_ytd || 0) }
    if (nm === 'COVID TOTAL') { r.covid_plan += Number(a.ytd || 0); r.covid_act += Number(a.total_posted_amt_ytd || 0) }
    if (nm === 'OVERALL GRAND TOTAL') { r.total_plan = Number(a.ytd || 0); r.total_act = Number(a.total_posted_amt_ytd || 0) }
  }
  if (!r.total_plan && !r.total_act) { r.total_plan = r.opex_plan + r.capex_plan + r.covid_plan; r.total_act = r.opex_act + r.capex_act + r.covid_act }
  return r
})
const rowsA = computed(() => {
  const sorted = [...props.raw].sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
  const norm = [], covid = []
  for (const e of sorted) {
    if (isConsolidatedEntry(e)) continue
    const lbl = (e.label || '').trim()
    const row = { display: lbl, isSub: e.is_this_sub_item === 1, isCovid: lbl.toLowerCase().includes('covid'), vals: extractA(e.actuals) }
    ;(row.isCovid ? covid : norm).push(row)
  }
  const gtVals = consolidatedTotals.value || zero()
  const out = [...norm, ...covid]
  out.push({ display: 'Grand Total', isTotal: true, isGrandTotal: true, vals: gtVals })
  return out
})

// -- B. Breakdown of Unit Wise Plan ------------------------------------
const eB = computed(() =>
  [...props.raw]
    .filter((e) => e.is_this_sub_item === 0 && !isConsolidatedEntry(e))
    .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0)),
)
const subHeadNames = computed(() => {
  const seen = new Set()
  const out = []
  for (const e of eB.value) {
    for (const sec of e.actuals || []) {
      if (!isOperating(sec.name)) continue
      for (const sh of sec.sub_heads || []) {
        const n = (sh.name || '').trim()
        if (n && !seen.has(n)) { seen.add(n); out.push(n) }
      }
    }
  }
  return out
})
function shVal(actuals, name, field) {
  let v = 0
  for (const sec of actuals || []) {
    if (!isOperating(sec.name)) continue
    for (const sh of sec.sub_heads || []) {
      if ((sh.name || '').trim() === name) v += Number(field === 'plan' ? sh.ytd || 0 : sh.total_posted_amt_ytd || 0)
    }
  }
  return v
}
function catTotal(actuals, field, matcher) {
  let v = 0
  for (const s of actuals || []) {
    if (!matcher(s.name)) continue
    v += Number(field === 'plan' ? s.ytd || 0 : s.total_posted_amt_ytd || 0)
  }
  return v
}
const breakdownB = computed(() => {
  const units = []
  const gtSh = { plan: {}, act: {} }
  for (const n of subHeadNames.value) { gtSh.plan[n] = 0; gtSh.act[n] = 0 }
  let gtOP = 0, gtOA = 0, gtCP = 0, gtCA = 0, gtCoP = 0, gtCoA = 0
  for (const e of eB.value) {
    const lbl = (e.label || '').trim()
    const act = e.actuals || []
    const shP = {}, shA = {}
    for (const n of subHeadNames.value) {
      shP[n] = shVal(act, n, 'plan'); shA[n] = shVal(act, n, 'act')
      gtSh.plan[n] += shP[n]; gtSh.act[n] += shA[n]
    }
    const oP = catTotal(act, 'plan', isOperating), oA = catTotal(act, 'act', isOperating)
    const cP = catTotal(act, 'plan', isCapital), cA = catTotal(act, 'act', isCapital)
    const coP = catTotal(act, 'plan', isCovidName), coA = catTotal(act, 'act', isCovidName)
    gtOP += oP; gtOA += oA; gtCP += cP; gtCA += cA; gtCoP += coP; gtCoA += coA
    units.push({ label: lbl, plan: { sh: shP, opex: oP, capex: cP, covid: coP }, act: { sh: shA, opex: oA, capex: cA, covid: coA } })
  }
  const ct = consolidatedTotals.value
  const finalOP = ct?.opex_plan || gtOP, finalOA = ct?.opex_act || gtOA
  const finalCP = ct?.capex_plan || gtCP, finalCA = ct?.capex_act || gtCA
  const finalCoP = ct?.covid_plan || gtCoP, finalCoA = ct?.covid_act || gtCoA
  const finalTP = ct?.total_plan || (gtOP + gtCP + gtCoP)
  const finalTA = ct?.total_act || (gtOA + gtCA + gtCoA)
  return {
    units,
    grand: {
      plan: { sh: gtSh.plan, opex: finalOP, capex: finalCP, covid: finalCoP, total: finalTP },
      act: { sh: gtSh.act, opex: finalOA, capex: finalCA, covid: finalCoA, total: finalTA },
    },
  }
})

// -- C. Opex vs Capex (% table) ----------------------------------------
const opexCapex = computed(() => {
  const gt = rowsA.value.find((r) => r.isGrandTotal)?.vals || zero()
  function pct(part, total) {
    if (!total) return '-'
    return ((part / total) * 100).toFixed(1) + '%'
  }
  return {
    opexPctPlan: pct(gt.opex_plan, gt.total_plan),
    capexPctPlan: pct(gt.capex_plan, gt.total_plan),
    opexPctAct: pct(gt.opex_act, gt.total_act),
    capexPctAct: pct(gt.capex_act, gt.total_act),
  }
})

// -- D. Headcount - Closing & Average -----------------------------------
const hcRecordsSorted = computed(() =>
  (props.headcount?.headcount_data || [])
    .filter((r) => !!r.financial_year)
    .slice()
    .sort((a, b) => (a.financial_year || '').localeCompare(b.financial_year || '')),
)
const hcYears = computed(() => hcRecordsSorted.value.map((r) => r.financial_year))
const hcTotals = computed(() => {
  const t = {}
  for (const r of hcRecordsSorted.value) t[r.financial_year] = Number(r.total_head_count || r.total_headcount || 0)
  return t
})
function hcAvg(i) {
  const y = hcYears.value
  const c = hcTotals.value[y[i]]
  if (i === 0) return c ? c / 2 : null
  const p = hcTotals.value[y[i - 1]]
  return p != null && c != null ? (p + c) / 2 : null
}
function fyMarchLabel(fy) {
  const p = (fy || '').split('-')
  const yy = p.length > 1 ? p[1].slice(-2) : (p[0] || '').slice(-2)
  return `31-Mar-${yy}`
}
function fmtInt(n) {
  if (n == null) return '-'
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n))
}

// -- E. Cost per Employee - Comparison -----------------------------------
const cpe = computed(() => {
  const planSource = (props.headcount?.plan_data?.length ? props.headcount.plan_data : props.raw) || []
  if (!planSource.length) return null
  const fp = fyParts.value
  const prevFYKey = `${parseInt(fp[0], 10) - 1}-${String(parseInt(fp[1], 10) - 1).padStart(2, '0')}`
  const prevPrevFYKey = `${parseInt(fp[0], 10) - 2}-${String(parseInt(fp[1], 10) - 2).padStart(2, '0')}`
  const sorted = hcRecordsSorted.value
  function getAvgHC(fyKey) {
    const idx = sorted.findIndex((r) => r.financial_year === fyKey)
    if (idx === -1) return 0
    const cur = Number(sorted[idx].total_head_count || sorted[idx].total_headcount || 0)
    if (idx === 0) return cur / 2
    const prev = Number(sorted[idx - 1].total_head_count || sorted[idx - 1].total_headcount || 0)
    return (prev + cur) / 2
  }
  const avgHCPlan = getAvgHC(prevFYKey)
  const avgHCEst = getAvgHC(prevPrevFYKey)
  const sourceRows = planSource.filter((e) => e.is_this_sub_item === 0 && !isConsolidatedEntry(e))
  const shNames = []
  const seen = new Set()
  for (const e of sourceRows) {
    for (const s of e.actuals || []) {
      if (!isOperating(s.name)) continue
      for (const sh of s.sub_heads || []) {
        const n = (sh.name || '').trim()
        if (n && !seen.has(n)) { seen.add(n); shNames.push(n) }
      }
    }
  }
  function shRaw(field) {
    return (shName) => {
      let v = 0
      for (const e of sourceRows) {
        for (const s of e.actuals || []) {
          if (!isOperating(s.name)) continue
          for (const sh of s.sub_heads || []) {
            if ((sh.name || '').trim() === shName) v += Number(field === 'plan' ? sh.ytd || 0 : sh.total_posted_amt_ytd || 0)
          }
        }
      }
      return v
    }
  }
  function opexRaw(field) {
    let v = 0
    for (const e of sourceRows) for (const s of e.actuals || []) if (isOperating(s.name)) v += Number(field === 'plan' ? s.ytd || 0 : s.total_posted_amt_ytd || 0)
    return v
  }
  const totalRawPlan = opexRaw('plan'), totalRawEst = opexRaw('act')
  function buildRow(inrCrPlan, inrCrEst) {
    const cpaPlan = avgHCPlan > 0 ? (inrCrPlan / avgHCPlan) * 1000 : 0
    const cpaEst = avgHCEst > 0 ? (inrCrEst / avgHCEst) * 1000 : 0
    const ppInc = cpaEst > 0 ? ((cpaPlan / cpaEst) - 1) * 100 : null
    return { cpaPlan, cpaEst, cpmPlan: cpaPlan / 12, cpmEst: cpaEst / 12, ppInc }
  }
  const rows = shNames.map((name) => {
    const rp = shRaw('plan')(name), re = shRaw('act')(name)
    const inrCrPlan = rp / 1e7, inrCrEst = re / 1e7
    const b = buildRow(inrCrPlan, inrCrEst)
    return {
      name, inrCrPlan, inrCrEst, ...b,
      mixPlan: totalRawPlan > 0 ? (rp / totalRawPlan) * 100 : 0,
      mixEst: totalRawEst > 0 ? (re / totalRawEst) * 100 : 0,
    }
  })
  const ttlInrCrPlan = totalRawPlan / 1e7, ttlInrCrEst = totalRawEst / 1e7
  const ttlB = buildRow(ttlInrCrPlan, ttlInrCrEst)
  return {
    prevFYKey,
    rows,
    total: { inrCrPlan: ttlInrCrPlan, inrCrEst: ttlInrCrEst, ...ttlB },
  }
})
function fmtK(v) {
  const n = Number(v) || 0
  if (!isFinite(n) || n === 0) return '-'
  return (n < 0 ? '-' : '') + Math.abs(n).toFixed(2)
}
function fmtMix(v) {
  const n = Number(v) || 0
  if (!isFinite(n) || n === 0) return '0%'
  return Math.round(n) + '%'
}
function fmtInc(v) {
  if (v == null || isNaN(v) || !isFinite(v)) return '-'
  const n = Math.round(v)
  return (n > 0 ? '+' : '') + n + '%'
}
function incStyle(v) {
  if (v == null || isNaN(v) || !isFinite(v)) return {}
  const n = Number(v)
  if (n < 0) return { color: '#c0392b', fontWeight: 600 }
  if (n > 0) return { color: '#1a7a3a', fontWeight: 600 }
  return {}
}

// -- F. Other Operating Expenses & H. Capital Expenditure (shared shape) --
function isOtherOperating(name) { return normName(name).includes('OTHER OPERATING') }
function buildUnitGrandTable(entries, kind) {
  // kind: 'other_opex' (items under sections literally named/sub-headed
  // "Other Operating...") | 'capex' (items under CAPITAL sections)
  const names = []
  const seen = new Set()
  function collect(e, push) {
    for (const s of e.actuals || []) {
      if (kind === 'capex') {
        if (!isCapital(s.name)) continue
        for (const item of s.items || []) push(item.name)
      } else {
        if (isOtherOperating(s.name)) {
          for (const item of s.items || []) push(item.name)
        }
        if (isOperating(s.name) && !isOtherOperating(s.name)) {
          for (const sh of s.sub_heads || []) {
            if (!isOtherOperating(sh.name)) continue
            for (const item of sh.items || []) push(item.name)
          }
        }
      }
    }
  }
  for (const e of entries) collect(e, (n) => { const t = (n || '').trim(); if (t && !seen.has(t)) { seen.add(t); names.push(t) } })
  if (!names.length) return { rows: [], units: entries.map((e) => (e.label || '').trim()) }

  function itemVal(e, itemName, field) {
    let v = 0
    for (const s of e.actuals || []) {
      if (kind === 'capex') {
        if (!isCapital(s.name)) continue
        for (const item of s.items || []) {
          if ((item.name || '').trim() === itemName) v += Number(field === 'plan' ? item.ytd || 0 : (item.total_posted_amt_ytd ?? item.total_posted_amt) || 0)
        }
      } else {
        if (isOtherOperating(s.name)) {
          for (const item of s.items || []) {
            if ((item.name || '').trim() === itemName) v += Number(field === 'plan' ? item.ytd || 0 : (item.total_posted_amt_ytd ?? item.total_posted_amt) || 0)
          }
        }
        if (isOperating(s.name) && !isOtherOperating(s.name)) {
          for (const sh of s.sub_heads || []) {
            if (!isOtherOperating(sh.name)) continue
            for (const item of sh.items || []) {
              if ((item.name || '').trim() === itemName) v += Number(field === 'plan' ? item.ytd || 0 : (item.total_posted_amt_ytd ?? item.total_posted_amt) || 0)
            }
          }
        }
      }
    }
    return v
  }
  function sectionTotal(e, field) {
    let v = 0
    for (const s of e.actuals || []) {
      if (kind === 'capex') {
        if (isCapital(s.name)) v += Number(field === 'plan' ? s.ytd || 0 : s.total_posted_amt_ytd || 0)
      } else {
        if (isOtherOperating(s.name)) v += Number(field === 'plan' ? s.ytd || 0 : s.total_posted_amt_ytd || 0)
        if (isOperating(s.name) && !isOtherOperating(s.name)) {
          for (const sh of s.sub_heads || []) {
            if (isOtherOperating(sh.name)) v += Number(field === 'plan' ? sh.ytd || 0 : sh.total_posted_amt_ytd || 0)
          }
        }
      }
    }
    return v
  }
  const rows = names.map((name) => {
    const plan = entries.map((e) => itemVal(e, name, 'plan'))
    const act = entries.map((e) => itemVal(e, name, 'act'))
    return { name, plan, act, planTotal: plan.reduce((a, b) => a + b, 0), actTotal: act.reduce((a, b) => a + b, 0) }
  })
  const totalsRow = {
    plan: entries.map((e) => sectionTotal(e, 'plan')),
    act: entries.map((e) => sectionTotal(e, 'act')),
  }
  totalsRow.planTotal = totalsRow.plan.reduce((a, b) => a + b, 0)
  totalsRow.actTotal = totalsRow.act.reduce((a, b) => a + b, 0)
  return { rows, totalsRow, units: entries.map((e) => (e.label || '').trim()) }
}
const otherOpex = computed(() => buildUnitGrandTable(eB.value, 'other_opex'))
const capex = computed(() => buildUnitGrandTable(eB.value, 'capex'))

const UnitGrandTable = {
  props: { rows: Array, totalsRow: Object, units: Array, pLbl: String, aLbl: String },
  setup(p) {
    return () => {
      if (!p.rows?.length) return h('div', { class: 'mb-6 text-sm text-gray-400' }, 'No data.')
      return h('div', { class: 'fc-scroll-wrapper' }, [
        h('table', { class: 'fc-table w-full min-w-[900px] text-sm' }, [
          h('thead', {}, [
            h('tr', { class: 'fc-thead-main' }, [
              h('th', { rowspan: 2, class: 'fc-th fc-sticky-col min-w-[220px] text-left' }, 'Expense Category'),
              ...p.units.map((u) => h('th', { key: u, colspan: 2, class: 'fc-th text-center' }, u)),
              h('th', { colspan: 2, class: 'fc-th bg-fc-blue-dark text-center' }, 'Grand Total'),
            ]),
            h('tr', { class: 'fc-thead-sub' }, [
              ...p.units.flatMap((u) => [h('th', { key: u + 'p', class: 'fc-th-sub' }, p.pLbl), h('th', { key: u + 'a', class: 'fc-th-sub' }, p.aLbl)]),
              h('th', { class: 'fc-th-sub bg-fc-blue-dark' }, p.pLbl),
              h('th', { class: 'fc-th-sub bg-fc-blue-dark' }, p.aLbl),
            ]),
          ]),
          h('tbody', {}, [
            ...p.rows.map((r) =>
              h('tr', { key: r.name }, [
                h('td', { class: 'fc-td fc-sticky-col bg-white text-left dark:bg-gray-900' }, r.name),
                ...r.plan.flatMap((v, i) => [
                  h('td', { key: 'p' + i, class: 'fc-td text-right' }, [h(CrCell, { value: v })]),
                  h('td', { key: 'a' + i, class: 'fc-td text-right' }, [h(CrCell, { value: r.act[i] })]),
                ]),
                h('td', { class: 'fc-td bg-fc-gt-col text-right font-bold' }, [h(CrCell, { value: r.planTotal })]),
                h('td', { class: 'fc-td bg-fc-gt-col text-right font-bold' }, [h(CrCell, { value: r.actTotal })]),
              ]),
            ),
            p.totalsRow
              ? h('tr', { class: 'ppt-total-row font-bold' }, [
                  h('td', { class: 'fc-td fc-sticky-col bg-inherit text-left' }, 'Total'),
                  ...p.totalsRow.plan.flatMap((v, i) => [
                    h('td', { key: 'tp' + i, class: 'fc-td text-right' }, [h(CrCell, { value: v })]),
                    h('td', { key: 'ta' + i, class: 'fc-td text-right' }, [h(CrCell, { value: p.totalsRow.act[i] })]),
                  ]),
                  h('td', { class: 'fc-td bg-fc-gt-col text-right' }, [h(CrCell, { value: p.totalsRow.planTotal })]),
                  h('td', { class: 'fc-td bg-fc-gt-col text-right' }, [h(CrCell, { value: p.totalsRow.actTotal })]),
                ])
              : null,
          ]),
        ]),
      ])
    }
  },
}

// -- G. Quarter Phasing ---------------------------------------------------
function arrSum(a) { return (a || []).reduce((t, v) => t + (Number(v) || 0), 0) }
const quarterPhasing = computed(() => {
  let curC = [0, 0, 0, 0], curO = [0, 0, 0, 0], curT = [0, 0, 0, 0]
  for (const row of props.currentFyTree || []) {
    const vals = QUARTERS.map((q) => arrSum(row[q]))
    for (let i = 0; i < 4; i++) curT[i] += vals[i]
    if (isCapital(row.name)) for (let i = 0; i < 4; i++) curC[i] += vals[i]
    else if (isOperating(row.name)) for (let i = 0; i < 4; i++) curO[i] += vals[i]
  }
  let prvC = [0, 0, 0, 0], prvO = [0, 0, 0, 0], prvT = [0, 0, 0, 0]
  for (const row of props.prevActualsTree || []) {
    const vals = ['q1', 'q2', 'q3', 'q4'].map((q) => actualsQuarterTotal(row, q))
    for (let i = 0; i < 4; i++) prvT[i] += vals[i]
    if (isCapital(row.name)) for (let i = 0; i < 4; i++) prvC[i] += vals[i]
    else if (isOperating(row.name)) for (let i = 0; i < 4; i++) prvO[i] += vals[i]
  }
  return {
    current: { capex: curC, opex: curO, total: curT },
    previous: { capex: prvC, opex: prvO, total: prvT },
  }
})

const QuarterPhasingBlock = {
  props: { fyLabel: String, block: Object },
  setup(p) {
    function pctCell(part, total) {
      if (!total) return '0.0%'
      return ((Math.abs(part) / Math.abs(total)) * 100).toFixed(1) + '%'
    }
    function vRow(label, arr, bold) {
      const total = arr.reduce((a, b) => a + b, 0)
      return h('tr', {}, [
        h('td', { class: 'fc-td text-left' }, label),
        ...arr.map((v, i) => h('td', { key: i, class: 'fc-td text-right', style: bold ? 'font-weight:700' : '' }, [h(CrCell, { value: v })])),
        h('td', { class: 'fc-td text-right font-bold' }, [h(CrCell, { value: total })]),
      ])
    }
    function pctRow(arr) {
      const total = arr.reduce((a, b) => a + b, 0)
      return h('tr', { class: 'text-xs italic text-gray-500' }, [
        h('td', { class: 'fc-td text-left' }, '% Phasing'),
        ...arr.map((v, i) => h('td', { key: i, class: 'fc-td text-right' }, pctCell(v, total))),
        h('td', { class: 'fc-td text-right' }, '100.0%'),
      ])
    }
    return () => {
      const b = p.block
      return h('tbody', {}, [
        h('tr', { class: 'fc-thead-main' }, [
          h('th', { class: 'fc-th text-left' }, p.fyLabel),
          h('th', { class: 'fc-th text-right' }, 'Qtr-1'), h('th', { class: 'fc-th text-right' }, 'Qtr-2'),
          h('th', { class: 'fc-th text-right' }, 'Qtr-3'), h('th', { class: 'fc-th text-right' }, 'Qtr-4'),
          h('th', { class: 'fc-th text-right' }, 'Total'),
        ]),
        vRow('Capex', b.capex), pctRow(b.capex),
        h('tr', {}, [h('td', { colspan: 6, class: 'h-2' })]),
        vRow('Opex', b.opex), pctRow(b.opex),
        h('tr', {}, [h('td', { colspan: 6, class: 'h-2' })]),
        vRow('Total', b.total, true), pctRow(b.total),
      ])
    }
  },
}
</script>
