<!--
  Operating Expense / Capital Expense tables - mirrors monthly_mis.js's
  renderExpTable(): a 2-row header (Unit | curFY Budget/Actuals/% | prevFY
  Budget/Actuals/%), top-level + sub-item unit rows, single Total row.

  Confirmed against the live Desk source (read in full): renderExpTable
  builds exactly this 2-row header shape, NOT the 3-row Opex/Capex/Covid/
  Total header that belongs to the hidden #mis-tbl detail table (which is
  never unhidden anywhere in the page and exists purely as an aggregation
  source for buildMap/renderConTable) - so .fc-th-sub-row3 is intentionally
  not used here.
-->
<template>
  <div class="fc-scroll-wrapper">
    <table class="fc-table w-full min-w-[800px] text-sm">
      <thead>
        <tr class="fc-thead-main">
          <th rowspan="2" class="fc-th fc-sticky-col min-w-[220px] text-left">Unit</th>
          <th colspan="3" class="fc-th text-center">{{ curFY }} Budget vs. Actuals</th>
          <th colspan="3" class="fc-th text-center">{{ prevFY }} Budget vs. Actuals</th>
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
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur')"><MisAmount :value="(r.cur.tb || 0) * 1e7" :context="`${r.label} · Cur Budget`" /></td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur')"><MisAmount :value="(r.cur.ta || 0) * 1e7" :context="`${r.label} · Cur Actuals`" /></td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur')">{{ fmtPct(r.cur.ta, r.cur.tb) }}</td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev')"><MisAmount :value="(r.prev.tb || 0) * 1e7" :context="`${r.label} · Prev Budget`" /></td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev')"><MisAmount :value="(r.prev.ta || 0) * 1e7" :context="`${r.label} · Prev Actuals`" /></td>
          <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev')">{{ fmtPct(r.prev.ta, r.prev.tb) }}</td>
        </tr>
        <tr class="fc-row-grand">
          <td class="fc-td fc-sticky-col text-left">Total</td>
          <td class="fc-td text-right"><MisAmount :value="totals.tb * 1e7" context="Total · Cur Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="totals.ta * 1e7" context="Total · Cur Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(totals.ta, totals.tb) }}</td>
          <td class="fc-td text-right"><MisAmount :value="totals.pb * 1e7" context="Total · Prev Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="totals.pa * 1e7" context="Total · Prev Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(totals.pa, totals.pb) }}</td>
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
  totals: { type: Object, default: () => ({ tb: 0, ta: 0, pb: 0, pa: 0 }) },
  curFY: { type: String, default: '' },
  prevFY: { type: String, default: '' },
})
defineEmits(['drill'])
</script>
