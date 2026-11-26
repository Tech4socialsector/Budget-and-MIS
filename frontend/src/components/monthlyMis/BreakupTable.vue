<!--
  Shared breakup table for Education / Health / Livelihoods / University /
  Enablers - mirrors monthly_mis.js's renderBreakupTable(): section header
  row (bold, spans all columns) per key, one row per sub_unit entry
  (is_this_sub_item rows get an extra indent, same pl-8 convention as
  ConsolidatedTable/ExpenseTable), a subtotal row per section
  (.fc-subtotal-row, replacing the Desk's sw-unit-total) - only shown when a
  section actually has more than one row, since a 1-row section's "Total"
  would just repeat that single row's own numbers - and a single grand
  total row at the end (.fc-row-grand, replacing sw-grand-total's inline
  #1565C0 background per this app's .fc-th/.fc-row-grand blue convention).

  Columns: Label | Operating Expense (Budget/Actuals/%) |
  Capital Expense (Budget/Actuals/%) | Total Expense (Budget/Actuals/%).

  Livelihoods/Enablers pass a single-key `keys` array (flat, one section),
  and Health's own 5 keys (Urban/Rural/Central/Hospital/Health Programs)
  only ever have ONE of those 5 with more than one row at a time in
  practice - so in both cases, the one section whose own subtotal row
  would otherwise show (sec.rows.length > 1) is also the ONLY section
  contributing more than a single row to the grand total, making that
  subtotal numerically identical to the table's own final "Total X" row
  right below it - a redundant repeat, not a genuinely different number.
  singleQualifyingSectionLabel (below) tracks whether exactly one section
  in this table has more than one row; when so, that section's own
  subtotal is suppressed and only the real grand total row is shown.
-->
<template>
  <div v-if="!data" class="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
    No data available.
  </div>
  <div v-else class="fc-scroll-wrapper fc-scroll-wrapper-tall">
    <table class="fc-table w-full min-w-[900px] text-sm">
      <thead>
        <tr class="fc-thead-main">
          <th rowspan="2" class="fc-th fc-sticky-col min-w-[240px] text-left">{{ titleText }}</th>
          <th colspan="3" class="fc-th text-center">Operating Expense</th>
          <th colspan="3" class="fc-th text-center">Capital Expense</th>
          <th colspan="3" class="fc-th text-center">Total Expense</th>
        </tr>
        <tr class="fc-thead-sub">
          <th class="fc-th-sub">Budget</th><th class="fc-th-sub">Actuals</th><th class="fc-th-sub">% of Budget</th>
          <th class="fc-th-sub">Budget</th><th class="fc-th-sub">Actuals</th><th class="fc-th-sub">% of Budget</th>
          <th class="fc-th-sub">Budget</th><th class="fc-th-sub">Actuals</th><th class="fc-th-sub">% of Budget</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="sec in data.sections" :key="sec.label">
          <tr class="fc-row-head">
            <td class="fc-td fc-sticky-col bg-fc-blue-light text-left font-bold dark:bg-transparent" colspan="10">{{ sec.label }}</td>
          </tr>
          <tr
            v-for="r in sec.rows"
            :key="r.label"
            class="cursor-pointer"
            :class="r.isSub ? 'fc-row-sub' : ''"
            @click="$emit('drill', r.label, 'cur', 'total', r.entity)"
          >
            <td class="fc-td fc-sticky-col bg-white text-left dark:bg-gray-900" :class="r.isSub ? 'pl-8' : 'pl-4'">{{ r.label }}</td>
            <td class="fc-td text-right"><MisAmount :value="r.v.ob * 1e7" :context="`${r.label} · Opex Budget`" /></td>
            <td class="fc-td text-right"><MisAmount :value="r.v.oa * 1e7" :context="`${r.label} · Opex Actuals`" /></td>
            <td class="fc-td text-right">{{ fmtPct(r.v.oa, r.v.ob) }}</td>
            <td class="fc-td text-right"><MisAmount :value="r.v.cb * 1e7" :context="`${r.label} · Capex Budget`" /></td>
            <td class="fc-td text-right"><MisAmount :value="r.v.ca * 1e7" :context="`${r.label} · Capex Actuals`" /></td>
            <td class="fc-td text-right">{{ fmtPct(r.v.ca, r.v.cb) }}</td>
            <td class="fc-td text-right"><MisAmount :value="r.v.tb * 1e7" :context="`${r.label} · Total Budget`" /></td>
            <td class="fc-td text-right"><MisAmount :value="r.v.ta * 1e7" :context="`${r.label} · Total Actuals`" /></td>
            <td class="fc-td text-right">{{ fmtPct(r.v.ta, r.v.tb) }}</td>
          </tr>
          <tr v-if="sec.rows.length > 1 && sec.label !== singleQualifyingSectionLabel" class="fc-subtotal-row font-semibold">
            <td class="fc-td fc-sticky-col bg-inherit text-left">Total</td>
            <td class="fc-td text-right"><MisAmount :value="sec.subtotal.ob * 1e7" /></td>
            <td class="fc-td text-right"><MisAmount :value="sec.subtotal.oa * 1e7" /></td>
            <td class="fc-td text-right">{{ fmtPct(sec.subtotal.oa, sec.subtotal.ob) }}</td>
            <td class="fc-td text-right"><MisAmount :value="sec.subtotal.cb * 1e7" /></td>
            <td class="fc-td text-right"><MisAmount :value="sec.subtotal.ca * 1e7" /></td>
            <td class="fc-td text-right">{{ fmtPct(sec.subtotal.ca, sec.subtotal.cb) }}</td>
            <td class="fc-td text-right"><MisAmount :value="sec.subtotal.tb * 1e7" /></td>
            <td class="fc-td text-right"><MisAmount :value="sec.subtotal.ta * 1e7" /></td>
            <td class="fc-td text-right">{{ fmtPct(sec.subtotal.ta, sec.subtotal.tb) }}</td>
          </tr>
        </template>
        <tr class="fc-row-grand">
          <td class="fc-td fc-sticky-col text-left">{{ grandLabel }}</td>
          <td class="fc-td text-right"><MisAmount :value="data.grand.ob * 1e7" /></td>
          <td class="fc-td text-right"><MisAmount :value="data.grand.oa * 1e7" /></td>
          <td class="fc-td text-right">{{ fmtPct(data.grand.oa, data.grand.ob) }}</td>
          <td class="fc-td text-right"><MisAmount :value="data.grand.cb * 1e7" /></td>
          <td class="fc-td text-right"><MisAmount :value="data.grand.ca * 1e7" /></td>
          <td class="fc-td text-right">{{ fmtPct(data.grand.ca, data.grand.cb) }}</td>
          <td class="fc-td text-right"><MisAmount :value="data.grand.tb * 1e7" /></td>
          <td class="fc-td text-right"><MisAmount :value="data.grand.ta * 1e7" /></td>
          <td class="fc-td text-right">{{ fmtPct(data.grand.ta, data.grand.tb) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MisAmount from './MisAmount.vue'
import { fmtPct } from '@/data/monthlyMisData'

const props = defineProps({
  titleText: { type: String, default: '' },
  data: { type: Object, default: null }, // { sections: [{label, rows, subtotal}], grand }
})
defineEmits(['drill'])

// Matches the Desk JS's grandLabel exactly: 'Total Education' if
// titleText==='Education' else 'Total ' + titleText.
const grandLabel = computed(() => (props.titleText === 'Education' ? 'Total Education' : `Total ${props.titleText}`))

// The label of the one section whose own subtotal row would exactly
// repeat the table's final grand-total row (see the template comment
// above) - null when two or more sections each have multiple rows, since
// then every section's own subtotal is a genuinely different, smaller
// number than the grand total and should still show.
const singleQualifyingSectionLabel = computed(() => {
  const sections = props.data?.sections || []
  const qualifying = sections.filter((sec) => sec.rows.length > 1)
  return qualifying.length === 1 ? qualifying[0].label : null
})
</script>
