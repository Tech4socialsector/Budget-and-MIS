<!--
  Operating Expense / Capital Expense tables - mirrors monthly_mis.js's
  renderExpTable(): a 2-row header (Unit | curFY Budget/Actuals/% | prevFY
  Budget/Actuals/%), top-level + sub-item unit rows, then Total/Covid-19/
  Grand Total (Covid-19 pulled out of the body and placed between Total
  and Grand Total - see bodyRows/covidRow below - matching the export's
  row order in monthly_mis_export.py's write_main_section/main_slide).

  Confirmed against the live Desk source (read in full): renderExpTable
  builds exactly this 2-row header shape, NOT the 3-row Opex/Capex/Covid/
  Total header that belongs to the hidden #mis-tbl detail table (which is
  never unhidden anywhere in the page and exists purely as an aggregation
  source for buildMap/renderConTable) - so .fc-th-sub-row3 is intentionally
  not used here.
-->
<template>
  <div class="fc-scroll-wrapper fc-scroll-wrapper-tall">
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
          v-for="r in bodyRows"
          :key="r.label"
          :class="r.isSub ? 'fc-row-sub' : ''"
        >
          <!-- Label cell's click is now gated on !r.hideNumber too (it
          used to be the one cell left clickable on a hidden row, leaking
          that row's real figures into the drill-down modal even though
          every other cell in the row was correctly blanked). -->
          <td
            class="fc-td fc-sticky-col text-left"
            :class="[r.isSub ? 'pl-8' : '', r.hideNumber ? '' : 'cursor-pointer']"
            @click="!r.hideNumber && $emit('drill', r.label, 'cur', kind)"
          >{{ r.label }}</td>
          <!-- A hideNumber row ("Hide number?" on its own Combination of
          unit settings row) renders fully empty cells instead of
          MisAmount/fmtPct's usual "-" placeholder for a genuine zero - the
          row's label still shows, it just carries no figures at all. -->
          <template v-if="r.hideNumber">
            <td class="fc-td text-right" />
            <td class="fc-td text-right" />
            <td class="fc-td text-right" />
            <td class="fc-td text-right" />
            <td class="fc-td text-right" />
            <td class="fc-td text-right" />
          </template>
          <template v-else>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur', kind)"><MisAmount :value="(r.cur.tb || 0) * 1e7" :context="`${r.label} · Cur Budget`" /></td>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur', kind)"><MisAmount :value="(r.cur.ta || 0) * 1e7" :context="`${r.label} · Cur Actuals`" /></td>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'cur', kind)">{{ fmtPct(r.cur.ta, r.cur.tb) }}</td>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev', kind)"><MisAmount :value="(r.prev.tb || 0) * 1e7" :context="`${r.label} · Prev Budget`" /></td>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev', kind)"><MisAmount :value="(r.prev.ta || 0) * 1e7" :context="`${r.label} · Prev Actuals`" /></td>
            <td class="fc-td cursor-pointer text-right" @click="$emit('drill', r.label, 'prev', kind)">{{ fmtPct(r.prev.ta, r.prev.tb) }}</td>
          </template>
        </tr>
        <tr class="fc-subtotal-row">
          <td class="fc-td fc-sticky-col text-left">Total</td>
          <td class="fc-td text-right"><MisAmount :value="totals.tb * 1e7" context="Total · Cur Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="totals.ta * 1e7" context="Total · Cur Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(totals.ta, totals.tb) }}</td>
          <td class="fc-td text-right"><MisAmount :value="totals.pb * 1e7" context="Total · Prev Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="totals.pa * 1e7" context="Total · Prev Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(totals.pa, totals.pb) }}</td>
        </tr>
        <!-- Covid-19 is pulled out of the body loop above (bodyRows) and
        rendered here instead, between Total and Grand Total - matching
        the export's Total/Covid-19/Grand Total row order
        (monthly_mis_export.py's write_main_section/main_slide) rather
        than wherever Covid-19's own sequence_id happened to sort it
        among the regular unit rows. -->
        <tr v-if="covidRow">
          <td class="fc-td fc-sticky-col text-left">{{ covidRow.label }}</td>
          <td class="fc-td text-right"><MisAmount :value="(covidRow.cur.tb || 0) * 1e7" :context="`${covidRow.label} · Cur Budget`" /></td>
          <td class="fc-td text-right"><MisAmount :value="(covidRow.cur.ta || 0) * 1e7" :context="`${covidRow.label} · Cur Actuals`" /></td>
          <td class="fc-td text-right">{{ fmtPct(covidRow.cur.ta, covidRow.cur.tb) }}</td>
          <td class="fc-td text-right"><MisAmount :value="(covidRow.prev.tb || 0) * 1e7" :context="`${covidRow.label} · Prev Budget`" /></td>
          <td class="fc-td text-right"><MisAmount :value="(covidRow.prev.ta || 0) * 1e7" :context="`${covidRow.label} · Prev Actuals`" /></td>
          <td class="fc-td text-right">{{ fmtPct(covidRow.prev.ta, covidRow.prev.tb) }}</td>
        </tr>
        <!-- Grand Total = Total + Covid-19. -->
        <tr class="fc-row-grand">
          <td class="fc-td fc-sticky-col text-left">Grand Total</td>
          <td class="fc-td text-right"><MisAmount :value="totals.grand.tb * 1e7" context="Grand Total · Cur Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="totals.grand.ta * 1e7" context="Grand Total · Cur Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(totals.grand.ta, totals.grand.tb) }}</td>
          <td class="fc-td text-right"><MisAmount :value="totals.grand.pb * 1e7" context="Grand Total · Prev Budget" /></td>
          <td class="fc-td text-right"><MisAmount :value="totals.grand.pa * 1e7" context="Grand Total · Prev Actuals" /></td>
          <td class="fc-td text-right">{{ fmtPct(totals.grand.pa, totals.grand.pb) }}</td>
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
  totals: {
    type: Object,
    default: () => ({
      tb: 0, ta: 0, pb: 0, pa: 0,
      grand: { tb: 0, ta: 0, pb: 0, pa: 0 },
    }),
  },
  curFY: { type: String, default: '' },
  prevFY: { type: String, default: '' },
  // 'opex' | 'capex' - which slice this table instance shows (MonthlyMis.vue
  // renders this same component twice, once per table). Passed through on
  // every drill emit so openDrilldown can build a node whose own total is
  // THIS table's own slice (e.g. Capex-only), not every head summed
  // together - a real, confirmed bug where every row's drill-down modal
  // showed the full Opex+Capex+Covid combined total regardless of which
  // table (or which row) was actually clicked.
  kind: { type: String, default: 'opex' },
})
defineEmits(['drill'])

// Covid-19 is rendered as its own row between Total and Grand Total
// (below) instead of wherever its sequence_id happens to sort it among
// the regular unit rows in `rows`.
const covidRow = computed(() => props.rows.find((r) => normName(r.label).includes('COVID')))
const bodyRows = computed(() => props.rows.filter((r) => !normName(r.label).includes('COVID')))
</script>
