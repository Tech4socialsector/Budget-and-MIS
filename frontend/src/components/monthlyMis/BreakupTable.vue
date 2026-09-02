<!--
  Shared breakup table for Education / Health / Livelihoods / University /
  Enablers - mirrors monthly_mis.js's renderBreakupTable(): section header
  row (bold, spans all columns) per key, one row per sub_unit entry, a
  subtotal row per section (.fc-subtotal-row, replacing the Desk's
  sw-unit-total), and a single grand total row at the end
  (.fc-row-grand, replacing sw-grand-total's inline #1565C0 background per
  this app's .fc-th/.fc-row-grand blue convention).

  Columns: Label | Operating Expense (Budget/Actuals/%) |
  Capital Expense (Budget/Actuals/%) | Total Expense (Budget/Actuals/%).

  Livelihoods/Enablers pass a single-key `keys` array (flat, one section) -
  the Desk source does not special-case this (still renders one section
  header + rows + subtotal + grand total), so this component doesn't
  either, matching it literally.
-->
<template>
  <div v-if="!data" class="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
    No data available.
  </div>
  <div v-else class="fc-scroll-wrapper">
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
          <tr v-for="r in sec.rows" :key="r.label" class="cursor-pointer" @click="$emit('drill', r.label)">
            <td class="fc-td fc-sticky-col bg-white pl-4 text-left dark:bg-gray-900">{{ r.label }}</td>
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
          <tr class="fc-subtotal-row font-semibold">
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
</script>
