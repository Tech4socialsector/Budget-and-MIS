<!--
  Headcount tab: Headcount Summary, Closing H/C, Average H/C, and (only
  when >=2 years of headcount data exist) Increase in Closing H/C (%) and
  Increase in Average H/C (%) - mirroring export_reports.py's
  _sheet_headcount(), itself a documented match of the Desk JS's Headcount
  module (same section order, same avg/opex-map formulas, same >=2-years
  gate on both % tables together).
-->
<template>
  <ErrorMessage v-if="error" :message="errorMessage" />
  <div v-else-if="loading" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <AppLoader label="Loading Headcount..." />
  </div>
  <div v-else-if="!records.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
    No headcount data available.
    <button class="ml-1 text-fc-blue-mid underline" @click="$emit('retry')">Retry</button>
  </div>
  <template v-else>
    <div class="flex justify-end">
      <Button variant="solid" class="fc-xl-btn" :loading="exporting" @click="$emit('export')">
        <template #prefix><FeatherIcon name="download" class="h-4 w-4" /></template>
        Export XLS
      </Button>
    </div>

    <!-- 1. Headcount Summary -->
    <SectionTable v-if="years.length >= 2" title="Headcount Summary">
      <table class="fc-table w-full min-w-[820px] text-sm">
        <thead>
          <tr class="fc-thead-main">
            <th class="fc-th fc-sticky-col text-left">Unit</th>
            <th class="fc-th text-right">{{ years[i1] }}</th>
            <th class="fc-th text-right">{{ years[i2] }}</th>
            <th class="fc-th text-right">%</th>
            <th class="fc-th text-right">{{ years[i1] }} Est</th>
            <th class="fc-th text-right">{{ years[i2] }} Plan</th>
            <th class="fc-th text-right">%</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in units" :key="u.id">
            <td class="fc-td fc-sticky-col bg-white text-left dark:bg-gray-900">{{ u.desc }}</td>
            <td class="fc-td text-right">{{ fmtInt(avgHC(u, i1)) }}</td>
            <td class="fc-td text-right">{{ fmtInt(avgHC(u, i2)) }}</td>
            <td class="fc-td text-right">{{ fmtPct(pctChange(avgHC(u, i1), avgHC(u, i2))) }}</td>
            <td class="fc-td text-right"><CrCell :value="opexFor(u).est * 1e7" /></td>
            <td class="fc-td text-right"><CrCell :value="opexFor(u).plan * 1e7" /></td>
            <td class="fc-td text-right">{{ fmtPct(pctChange(opexFor(u).est, opexFor(u).plan)) }}</td>
          </tr>
          <tr class="fc-row-grand">
            <td class="fc-td fc-sticky-col bg-fc-blue-mid text-left">Total</td>
            <td class="fc-td text-right">{{ fmtInt(avgTotal(i1)) }}</td>
            <td class="fc-td text-right">{{ fmtInt(avgTotal(i2)) }}</td>
            <td class="fc-td text-right">{{ fmtPct(pctChange(avgTotal(i1), avgTotal(i2))) }}</td>
            <td class="fc-td text-right"><CrCell :value="totalOpex.est * 1e7" /></td>
            <td class="fc-td text-right"><CrCell :value="totalOpex.plan * 1e7" /></td>
            <td class="fc-td text-right">{{ fmtPct(pctChange(totalOpex.est, totalOpex.plan)) }}</td>
          </tr>
        </tbody>
      </table>
    </SectionTable>

    <!-- 2. Closing H/C -->
    <SectionTable title="Closing H/C">
      <table class="fc-table w-full min-w-[600px] text-sm">
        <thead>
          <tr class="fc-thead-main">
            <th class="fc-th fc-sticky-col text-left">Unit</th>
            <th v-for="y in years" :key="y" class="fc-th text-right">{{ fyMarchLabel(y) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in units" :key="u.id">
            <td class="fc-td fc-sticky-col bg-white text-left dark:bg-gray-900">{{ u.desc }}</td>
            <td v-for="y in years" :key="y" class="fc-td text-right">{{ fmtInt(u.hc[y]) }}</td>
          </tr>
          <tr class="fc-row-grand">
            <td class="fc-td fc-sticky-col bg-fc-blue-mid text-left">Total</td>
            <td v-for="y in years" :key="y" class="fc-td text-right">{{ fmtInt(totals[y]) }}</td>
          </tr>
        </tbody>
      </table>
    </SectionTable>

    <!-- 3. Average H/C -->
    <SectionTable title="Average H/C">
      <table class="fc-table w-full min-w-[600px] text-sm">
        <thead>
          <tr class="fc-thead-main">
            <th class="fc-th fc-sticky-col text-left">Unit</th>
            <th v-for="y in years" :key="y" class="fc-th text-right">{{ fyMarchLabel(y) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in units" :key="u.id">
            <td class="fc-td fc-sticky-col bg-white text-left dark:bg-gray-900">{{ u.desc }}</td>
            <td v-for="(y, i) in years" :key="y" class="fc-td text-right">{{ fmtInt(avgHC(u, i)) }}</td>
          </tr>
          <tr class="fc-row-grand">
            <td class="fc-td fc-sticky-col bg-fc-blue-mid text-left">Total</td>
            <td v-for="(y, i) in years" :key="y" class="fc-td text-right">{{ fmtInt(avgTotal(i)) }}</td>
          </tr>
        </tbody>
      </table>
    </SectionTable>

    <!-- 4 & 5: % increase tables, only when >=2 years -->
    <template v-if="years.length >= 2">
      <SectionTable title="Increase in Closing H/C (%)">
        <table class="fc-table w-full min-w-[600px] text-sm">
          <thead>
            <tr class="fc-thead-main">
              <th class="fc-th fc-sticky-col text-left">Unit</th>
              <th v-for="p in yearPairs" :key="p.from + p.to" class="fc-th text-right">{{ fyMarchLabel(p.from) }} → {{ fyMarchLabel(p.to) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in units" :key="u.id">
              <td class="fc-td fc-sticky-col bg-white text-left dark:bg-gray-900">{{ u.desc }}</td>
              <td v-for="p in yearPairs" :key="p.from + p.to" class="fc-td text-right">{{ fmtPct(pctChange(u.hc[p.from], u.hc[p.to])) }}</td>
            </tr>
            <tr class="fc-row-grand">
              <td class="fc-td fc-sticky-col bg-fc-blue-mid text-left">Total</td>
              <td v-for="p in yearPairs" :key="p.from + p.to" class="fc-td text-right">{{ fmtPct(pctChange(totals[p.from], totals[p.to])) }}</td>
            </tr>
          </tbody>
        </table>
      </SectionTable>

      <SectionTable title="Increase in Average H/C (%)">
        <table class="fc-table w-full min-w-[600px] text-sm">
          <thead>
            <tr class="fc-thead-main">
              <th class="fc-th fc-sticky-col text-left">Unit</th>
              <th v-for="p in indexPairs" :key="p.i1 + '-' + p.i2" class="fc-th text-right">{{ years[p.i1] }} → {{ years[p.i2] }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in units" :key="u.id">
              <td class="fc-td fc-sticky-col bg-white text-left dark:bg-gray-900">{{ u.desc }}</td>
              <td v-for="p in indexPairs" :key="p.i1 + '-' + p.i2" class="fc-td text-right">{{ fmtPct(pctChange(avgHC(u, p.i1), avgHC(u, p.i2))) }}</td>
            </tr>
            <tr class="fc-row-grand">
              <td class="fc-td fc-sticky-col bg-fc-blue-mid text-left">Total</td>
              <td v-for="p in indexPairs" :key="p.i1 + '-' + p.i2" class="fc-td text-right">{{ fmtPct(pctChange(avgTotal(p.i1), avgTotal(p.i2))) }}</td>
            </tr>
          </tbody>
        </table>
      </SectionTable>
    </template>
  </template>
</template>

<script setup>
import { computed, h } from 'vue'
import { Button, FeatherIcon, ErrorMessage } from 'frappe-ui'
import AppLoader from '@/components/AppLoader.vue'
import CrCell from './CrCell.vue'

const props = defineProps({
  loading: Boolean,
  error: { type: Object, default: null },
  headcountData: { type: Array, default: () => [] },
  planData: { type: Array, default: () => [] },
  exporting: Boolean,
})
defineEmits(['retry', 'export'])

const errorMessage = computed(() => props.error?.messages?.[0] || props.error?.message || 'Something went wrong loading Headcount.')

const records = computed(() => props.headcountData || [])

const SectionTable = {
  props: { title: String },
  setup(p, { slots }) {
    return () =>
      h('div', { class: 'flex flex-col gap-1' }, [
        h('div', { class: 'hc-section-title mt-4 border-l-4 border-fc-blue-mid pl-2 text-xs font-semibold uppercase tracking-wide text-fc-blue-dark' }, p.title),
        h('div', { class: 'fc-scroll-wrapper' }, slots.default?.()),
      ])
  },
}

function normLbl(s) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim()
}

// Opex map from plan_data - match Desk JS buildOpexMap / export's opex_map.
const opexMap = computed(() => {
  const map = {}
  for (const p of props.planData || []) {
    const lbl = normLbl(p.label)
    let op = null
    for (const a of p.actuals || []) {
      const nm = (a.name || '').trim()
      if (nm === 'OPERATING  EXPENSES' || nm === 'OPERATING EXPENSES') { op = a; break }
    }
    map[lbl] = {
      est: Number(op?.total_posted_amt_ytd || 0) / 1e7,
      plan: Number(op?.ytd || 0) / 1e7,
    }
  }
  return map
})
function opexFor(u) {
  return opexMap.value[normLbl(u.desc)] || { est: 0, plan: 0 }
}
const totalOpex = computed(() => {
  let est = 0, plan = 0
  for (const u of units.value) { const o = opexFor(u); est += o.est; plan += o.plan }
  return { est, plan }
})

const sortedRecords = computed(() => [...records.value].sort((a, b) => (a.financial_year || '').localeCompare(b.financial_year || '')))
const years = computed(() => sortedRecords.value.map((r) => r.financial_year))
const i1 = computed(() => Math.max(0, years.value.length - 2))
const i2 = computed(() => Math.max(0, years.value.length - 1))

const units = computed(() => {
  const um = {}
  for (const rec of sortedRecords.value) {
    for (const u of rec.units || []) {
      const uid = String(u.unit || '')
      if (!um[uid]) um[uid] = { id: uid, desc: '', hc: {}, seq: /^\d+$/.test(uid) ? parseInt(uid, 10) : 999 }
      um[uid].hc[rec.financial_year] = Number(u.total_headcount || 0)
      if (rec.financial_year === years.value[years.value.length - 1]) {
        um[uid].desc = (u.unit_description || u.description || '').trim()
      }
    }
  }
  return Object.values(um).sort((a, b) => a.seq - b.seq)
})

const totals = computed(() => {
  const t = {}
  for (const r of sortedRecords.value) t[r.financial_year] = Number(r.total_head_count || r.total_headcount || 0)
  return t
})

// avgHC: i=0 -> hc[0]/2; i>0 -> (prev+curr)/2. Accepts either a unit object
// or a year index into `years`.
function avgHC(u, i) {
  const c = u.hc[years.value[i]]
  if (i === 0) return c ? c / 2 : null
  const p = u.hc[years.value[i - 1]]
  return p != null && c != null ? (p + c) / 2 : null
}
function avgTotal(i) {
  const c = totals.value[years.value[i]]
  if (i === 0) return c ? c / 2 : null
  const p = totals.value[years.value[i - 1]]
  return p != null && c != null ? (p + c) / 2 : null
}

const yearPairs = computed(() => years.value.slice(1).map((y, i) => ({ from: years.value[i], to: y })))
const indexPairs = computed(() => years.value.slice(1).map((_, i) => ({ i1: i, i2: i + 1 })))

function fyMarchLabel(fy) {
  const p = (fy || '').split('-')
  const yy = p.length > 1 ? p[1].slice(-2) : (p[0] || '').slice(-2)
  return `31-Mar-${yy}`
}

function pctChange(from, to) {
  if (!from || to == null) return null
  return Math.round(((to / from) - 1) * 1000) / 10
}
function fmtInt(n) {
  if (n == null) return '-'
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n))
}
function fmtPct(n) {
  if (n == null) return '-'
  return n.toFixed(1) + '%'
}
</script>
