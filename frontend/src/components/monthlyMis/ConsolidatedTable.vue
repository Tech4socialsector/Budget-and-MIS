<!--
  "Overall Foundation" table - mirrors monthly_mis.js's renderConTable():
  Areas of Work | Current Year YTD (Budget/Actuals/% of Budget) |
  Last Year YTD (Budget/Actuals/% of Budget). Sub-item rows (is_this_sub_item)
  get an indent and are excluded from the Total row, matching the Desk
  source's cr-sub-item / isSub handling exactly.
-->
<template>
  <div class="fc-scroll-wrapper">
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
          v-for="r in rows"
          :key="r.label"
          :class="r.isSub ? 'fc-row-sub' : ''"
        >
          <td class="fc-td fc-sticky-col cursor-pointer text-left" :class="r.isSub ? 'pl-8' : ''" @click="$emit('drill', r.label, 'cur')">{{ r.label }}</td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur')"><MisAmount :value="r.cb * 1e7" :context="`${r.label} · Cur Budget`" /></td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur')"><MisAmount :value="r.ca * 1e7" :context="`${r.label} · Cur Actuals`" /></td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur')">{{ fmtPct(r.ca, r.cb) }}</td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev')"><MisAmount :value="r.pb * 1e7" :context="`${r.label} · Prev Budget`" /></td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev')"><MisAmount :value="r.pa * 1e7" :context="`${r.label} · Prev Actuals`" /></td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev')">{{ fmtPct(r.pa, r.pb) }}</td>
        </tr>
        <tr class="fc-row-grand">
          <td class="fc-td fc-sticky-col text-left">Total</td>
          <td class="fc-td text-right"><MisAmount :value="total.cb * 1e7" context="Total · Cur Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="total.ca * 1e7" context="Total · Cur Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(total.ca, total.cb) }}</td>
          <td class="fc-td text-right"><MisAmount :value="total.pb * 1e7" context="Total · Prev Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="total.pa * 1e7" context="Total · Prev Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(total.pa, total.pb) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import MisAmount from './MisAmount.vue'
import { fmtPct } from '@/data/monthlyMisData'

defineProps({
  rows: { type: Array, default: () => [] },
  total: { type: Object, default: () => ({ cb: 0, ca: 0, pb: 0, pa: 0 }) },
  curFY: { type: String, default: '' },
  prevFY: { type: String, default: '' },
})
defineEmits(['drill'])
</script>
