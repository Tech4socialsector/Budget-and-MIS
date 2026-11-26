<!--
  Operating Expenses Breakdown grid - mirrors monthly_mis.js's
  renderUnitDetailGrid(): a 2-column CSS grid, one mini-table card per unit,
  with a "Total Foundation" card first spanning the full grid width. Each
  card lists Expense Category rows (with the PROGRAM EXPENSES -> Grants
  special-case subtraction already applied by buildUnitDetailGrid() in
  monthlyMisData.js) plus a Total row.
-->
<template>
  <div v-if="!cards.length" class="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
    No data available.
  </div>
  <div v-else class="grid grid-cols-1 gap-5 lg:grid-cols-2">
    <div v-for="card in cards" :key="card.title" :class="card.isTotal ? 'lg:col-span-2' : ''">
      <div class="flex flex-col gap-1">
        <div class="border-b border-fc-blue-mid pb-1 text-sm font-bold uppercase tracking-wide text-fc-blue-dark">
          <span v-if="card.isSub">└&nbsp;</span>{{ card.title }}
        </div>
        <div class="fc-scroll-wrapper">
          <table class="fc-table w-full min-w-[700px] text-sm">
            <thead>
              <tr class="fc-thead-main">
                <th rowspan="2" class="fc-th fc-sticky-col min-w-[180px] text-left italic">Expense Category</th>
                <th colspan="3" class="fc-th text-center">Current Year YTD &nbsp;{{ fy }}</th>
                <th colspan="3" class="fc-th text-center">Last Year YTD &nbsp;{{ prevFy }}</th>
              </tr>
              <tr class="fc-thead-sub">
                <th class="fc-th-sub">Budget</th><th class="fc-th-sub">Actuals</th><th class="fc-th-sub">% of Budget</th>
                <th class="fc-th-sub">Budget</th><th class="fc-th-sub">Actuals</th><th class="fc-th-sub">% of Budget</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in card.rows" :key="r.label + i" :data-row-kind="r.isGrants ? 'grants' : ''">
                <td class="fc-td fc-sticky-col bg-white text-left dark:bg-gray-900" :class="r.isGrants ? 'italic text-gray-500' : ''">{{ r.label }}</td>
                <td class="fc-td text-right"><MisAmount :value="r.cb * 1e7" :context="`${card.title} · ${r.label} · Cur Bud`" /></td>
                <td class="fc-td text-right"><MisAmount :value="r.ca * 1e7" :context="`${card.title} · ${r.label} · Cur Act`" /></td>
                <td class="fc-td text-right">{{ fmtPct(r.ca, r.cb) }}</td>
                <td class="fc-td text-right"><MisAmount :value="r.pb * 1e7" :context="`${card.title} · ${r.label} · Prev Bud`" /></td>
                <td class="fc-td text-right"><MisAmount :value="r.pa * 1e7" :context="`${card.title} · ${r.label} · Prev Act`" /></td>
                <td class="fc-td text-right">{{ fmtPct(r.pa, r.pb) }}</td>
              </tr>
              <tr class="fc-row-grand">
                <td class="fc-td fc-sticky-col text-left">Total</td>
                <td class="fc-td text-right"><MisAmount :value="card.total.cb * 1e7" /></td>
                <td class="fc-td text-right"><MisAmount :value="card.total.ca * 1e7" /></td>
                <td class="fc-td text-right">{{ fmtPct(card.total.ca, card.total.cb) }}</td>
                <td class="fc-td text-right"><MisAmount :value="card.total.pb * 1e7" /></td>
                <td class="fc-td text-right"><MisAmount :value="card.total.pa * 1e7" /></td>
                <td class="fc-td text-right">{{ fmtPct(card.total.pa, card.total.pb) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import MisAmount from './MisAmount.vue'
import { fmtPct } from '@/data/monthlyMisData'

defineProps({
  cards: { type: Array, default: () => [] },
  fy: { type: String, default: '' },
  prevFy: { type: String, default: '' },
})
</script>
