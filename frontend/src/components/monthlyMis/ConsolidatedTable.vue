<!--
  "Overall Foundation" table - mirrors monthly_mis.js's renderConTable():
  Areas of Work | Current Year YTD (Budget/Actuals/% of Budget) |
  Last Year YTD (Budget/Actuals/% of Budget). Sub-item rows (is_this_sub_item)
  get an indent and are excluded from the Total row, matching the Desk
  source's cr-sub-item / isSub handling exactly.
-->
<template>
  <div class="fc-scroll-wrapper fc-scroll-wrapper-tall">
    <table class="fc-table w-full min-w-[900px] text-sm">
      <thead>
        <tr class="fc-thead-main">
          <th rowspan="2" class="fc-th fc-sticky-col min-w-[240px] text-left">Areas of Work</th>
          <th colspan="3" class="fc-th text-center">Current Year YTD &nbsp;{{ curFY }}</th>
          <th colspan="3" class="fc-th text-center">Last Year YTD &nbsp;{{ prevFY }}</th>
        </tr>
        <tr class="fc-thead-sub">
          <th class="fc-th-sub">Budget</th><th class="fc-th-sub">Actuals</th><th class="fc-th-sub">% of Budget</th>
          <th class="fc-th-sub">Budget</th><th class="fc-th-sub">Actuals</th><th class="fc-th-sub">% of Budget</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="r in bodyRows"
          :key="r.label"
          :class="r.isSub ? 'fc-row-sub' : ''"
        >
          <!-- Label cell's click is now gated on !r.hideNumber too - see
          ExpenseTable.vue's matching fix for why. -->
          <td
            class="fc-td fc-sticky-col text-left"
            :class="[r.isSub ? 'pl-8' : '', r.hideNumber ? '' : 'cursor-pointer']"
            @click="!r.hideNumber && $emit('drill', r.label, 'cur', 'total')"
          >{{ r.label }}</td>
          <!-- A hideNumber row renders fully empty cells instead of
          MisAmount/fmtPct's usual "-" placeholder for a genuine zero. -->
          <template v-if="r.hideNumber">
            <td class="fc-td text-right" />
            <td class="fc-td text-right" />
            <td class="fc-td text-right" />
            <td class="fc-td text-right" />
            <td class="fc-td text-right" />
            <td class="fc-td text-right" />
          </template>
          <template v-else>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur', 'total')"><MisAmount :value="r.cb * 1e7" :context="`${r.label} · Cur Budget`" /></td>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur', 'total')"><MisAmount :value="r.ca * 1e7" :context="`${r.label} · Cur Actuals`" /></td>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur', 'total')">{{ fmtPct(r.ca, r.cb) }}</td>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev', 'total')"><MisAmount :value="r.pb * 1e7" :context="`${r.label} · Prev Budget`" /></td>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev', 'total')"><MisAmount :value="r.pa * 1e7" :context="`${r.label} · Prev Actuals`" /></td>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev', 'total')">{{ fmtPct(r.pa, r.pb) }}</td>
          </template>
        </tr>
        <tr class="fc-subtotal-row">
          <td class="fc-td fc-sticky-col text-left">Total</td>
          <td class="fc-td text-right"><MisAmount :value="total.cb * 1e7" context="Total · Cur Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="total.ca * 1e7" context="Total · Cur Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(total.ca, total.cb) }}</td>
          <td class="fc-td text-right"><MisAmount :value="total.pb * 1e7" context="Total · Prev Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="total.pa * 1e7" context="Total · Prev Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(total.pa, total.pb) }}</td>
        </tr>
        <!-- Covid-19 is pulled out of the body loop above (bodyRows) and
        rendered here instead, between Total and Grand Total - matching
        the export's Total/Covid-19/Grand Total row order rather than
        wherever Covid-19's own sequence_id happened to sort it among the
        regular Areas of Work rows. -->
        <tr v-if="covidRow">
          <td class="fc-td fc-sticky-col text-left">{{ covidRow.label }}</td>
          <td class="fc-td text-right"><MisAmount :value="covidRow.cb * 1e7" :context="`${covidRow.label} · Cur Budget`" /></td>
          <td class="fc-td text-right"><MisAmount :value="covidRow.ca * 1e7" :context="`${covidRow.label} · Cur Actuals`" /></td>
          <td class="fc-td text-right">{{ fmtPct(covidRow.ca, covidRow.cb) }}</td>
          <td class="fc-td text-right"><MisAmount :value="covidRow.pb * 1e7" :context="`${covidRow.label} · Prev Budget`" /></td>
          <td class="fc-td text-right"><MisAmount :value="covidRow.pa * 1e7" :context="`${covidRow.label} · Prev Actuals`" /></td>
          <td class="fc-td text-right">{{ fmtPct(covidRow.pa, covidRow.pb) }}</td>
        </tr>
        <!-- Grand Total = Total + Covid-19. -->
        <tr class="fc-row-grand">
          <td class="fc-td fc-sticky-col text-left">Grand Total</td>
          <td class="fc-td text-right"><MisAmount :value="grand.cb * 1e7" context="Grand Total · Cur Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="grand.ca * 1e7" context="Grand Total · Cur Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(grand.ca, grand.cb) }}</td>
          <td class="fc-td text-right"><MisAmount :value="grand.pb * 1e7" context="Grand Total · Prev Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="grand.pa * 1e7" context="Grand Total · Prev Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(grand.pa, grand.pb) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MisAmount from './MisAmount.vue'
import { fmtPct, normName } from '@/data/monthlyMisData'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  total: { type: Object, default: () => ({ cb: 0, ca: 0, pb: 0, pa: 0 }) },
  grand: { type: Object, default: () => ({ cb: 0, ca: 0, pb: 0, pa: 0 }) },
  curFY: { type: String, default: '' },
  prevFY: { type: String, default: '' },
})
defineEmits(['drill'])

const covidRow = computed(() => props.rows.find((r) => normName(r.label).includes('COVID')))
const bodyRows = computed(() => props.rows.filter((r) => !normName(r.label).includes('COVID')))
</script>
