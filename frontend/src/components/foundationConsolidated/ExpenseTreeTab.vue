<!--
  Shared renderer for the Annual Budget Consolidated (kind="annual") and
  Actuals Consolidated (kind="actuals") tabs - both are a head -> sub_head
  -> item tree with Q1-Q4 columns collapsible to 3 months each, a search
  box, Expand Quarters / Expand Line Items toggles, and a sticky Grand
  Total row - but the two source trees carry quarter amounts under
  different keys (see foundationConsolidatedData.js's header comment):
    - annual:  node.q1..q4, each a 3-element monthly array (already the
               months - no separate "months" object).
    - actuals: node.Q1..Q4, each a single already-summed number, plus a
               separate node.months object (keyed by fiscal month-number
               string) for the expanded month-level view.
  Also replicates a real Desk-page quirk: Actuals renders a head's direct
  items BEFORE its sub_heads, while Annual renders sub_heads first and
  direct items last - both loops kept explicit below rather than unified,
  so this DOM-order difference isn't accidentally lost.
-->
<template>
  <ErrorMessage v-if="error" :message="errorMessage" />
  <div v-else-if="loading" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <AppLoader :label="kind === 'annual' ? 'Loading Annual Budget Consolidated...' : 'Loading Actuals Consolidated...'" />
  </div>
  <div v-else-if="!data.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
    No data available.
    <button class="ml-1 text-fc-blue-mid underline" @click="$emit('retry')">Retry</button>
  </div>
  <template v-else>
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
      <FormControl
        type="text"
        v-model="searchTerm"
        placeholder="Search Expense Head / Sub Head / Item..."
        class="fc-search-input"
      >
        <template #prefix><FeatherIcon name="search" class="h-4 w-4 text-gray-400" /></template>
      </FormControl>
      <div class="flex flex-wrap items-center gap-5">
        <Switch v-model="expandQuarters" label="Expand Quarters" />
        <Switch v-model="expandItems" label="Expand Line Items" />
        <Button variant="solid" class="fc-xl-btn" :loading="exporting" @click="$emit('export')">
          <template #prefix><FeatherIcon name="download" class="h-4 w-4" /></template>
          Export XLS
        </Button>
      </div>
    </div>

    <div class="fc-scroll-wrapper">
      <table class="fc-table w-full min-w-[1100px] text-sm">
        <thead>
          <tr class="fc-thead-main">
            <th rowspan="2" class="fc-th fc-sticky-col min-w-[260px] text-left">Expense Head / Line Item</th>
            <template v-for="q in Q_DEFS" :key="q.key">
              <th
                v-if="expandedQ.has(q.key)"
                :colspan="3"
                class="fc-th cursor-pointer select-none text-right hover:brightness-95"
                @click="toggleQuarter(q.key)"
              >
                {{ q.label }} <span class="opacity-70">▲</span>
              </th>
              <th
                v-else
                rowspan="2"
                class="fc-th cursor-pointer select-none text-right align-middle hover:brightness-95"
                @click="toggleQuarter(q.key)"
              >
                {{ q.label }} <span class="opacity-70">▼</span>
              </th>
            </template>
            <th rowspan="2" class="fc-th text-right">Total</th>
          </tr>
          <tr v-if="anyQuarterOpen" class="fc-thead-sub">
            <template v-for="q in Q_DEFS" :key="'m-' + q.key">
              <template v-if="expandedQ.has(q.key)">
                <th v-for="m in q.months" :key="m" class="fc-th-sub">{{ m }}</th>
              </template>
            </template>
          </tr>
        </thead>
        <tbody>
          <template v-for="head in visibleHeads" :key="head.name">
            <tr class="fc-row-head" @click="toggleHead(head.name)">
              <td class="fc-td fc-sticky-col bg-fc-blue-light text-left dark:bg-transparent">
                <span class="inline-flex items-center gap-2">
                  <FeatherIcon :name="isHeadOpen(head.name) ? 'chevron-down' : 'chevron-right'" class="h-4 w-4" />
                  {{ head.name }}
                </span>
              </td>
              <QuarterCells :node="head" :kind="kind" :expanded-q="expandedQ" />
              <td class="fc-td text-right font-bold">
                <CrCell mode="inr" :value="rowTotal(head)" />
              </td>
            </tr>

            <template v-if="isHeadOpen(head.name)">
              <!-- Actuals renders direct items before sub_heads; Annual
              renders sub_heads first, direct items last - see file header. -->
              <template v-if="kind === 'actuals'">
                <tr v-for="item in head.items || []" :key="'item-' + head.name + '-' + item.name">
                  <td class="fc-td fc-sticky-col bg-white pl-10 text-left dark:bg-gray-900">{{ item.name }}</td>
                  <QuarterCells :node="item" :kind="kind" :expanded-q="expandedQ" />
                  <td class="fc-td text-right"><CrCell mode="inr" :value="rowTotal(item)" /></td>
                </tr>
                <template v-for="sub in head.sub_heads || []" :key="'sub-' + head.name + '-' + sub.name">
                  <tr class="fc-row-sub" @click.stop="toggleSub(head.name, sub.name)">
                    <td class="fc-td fc-sticky-col bg-fc-orange-light pl-8 text-left dark:bg-transparent">
                      <span class="inline-flex items-center gap-2">
                        <FeatherIcon :name="isSubOpen(head.name, sub.name) ? 'chevron-down' : 'chevron-right'" class="h-3.5 w-3.5" />
                        {{ sub.name }}
                      </span>
                    </td>
                    <QuarterCells :node="sub" :kind="kind" :expanded-q="expandedQ" />
                    <td class="fc-td text-right font-medium"><CrCell mode="inr" :value="rowTotal(sub)" /></td>
                  </tr>
                  <tr v-for="item in sub.items || []" v-show="isSubOpen(head.name, sub.name)" :key="'subitem-' + head.name + '-' + sub.name + '-' + item.name">
                    <td class="fc-td fc-sticky-col bg-white pl-12 text-left dark:bg-gray-900">{{ item.name }}</td>
                    <QuarterCells :node="item" :kind="kind" :expanded-q="expandedQ" />
                    <td class="fc-td text-right"><CrCell mode="inr" :value="rowTotal(item)" /></td>
                  </tr>
                </template>
              </template>
              <template v-else>
                <template v-for="sub in head.sub_heads || []" :key="'sub-' + head.name + '-' + sub.name">
                  <tr class="fc-row-sub" @click.stop="toggleSub(head.name, sub.name)">
                    <td class="fc-td fc-sticky-col bg-fc-orange-light pl-8 text-left dark:bg-transparent">
                      <span class="inline-flex items-center gap-2">
                        <FeatherIcon :name="isSubOpen(head.name, sub.name) ? 'chevron-down' : 'chevron-right'" class="h-3.5 w-3.5" />
                        {{ sub.name }}
                      </span>
                    </td>
                    <QuarterCells :node="sub" :kind="kind" :expanded-q="expandedQ" />
                    <td class="fc-td text-right font-medium"><CrCell mode="inr" :value="rowTotal(sub)" /></td>
                  </tr>
                  <tr v-for="item in sub.items || []" v-show="isSubOpen(head.name, sub.name)" :key="'subitem-' + head.name + '-' + sub.name + '-' + item.name">
                    <td class="fc-td fc-sticky-col bg-white pl-12 text-left dark:bg-gray-900">{{ item.name }}</td>
                    <QuarterCells :node="item" :kind="kind" :expanded-q="expandedQ" />
                    <td class="fc-td text-right"><CrCell mode="inr" :value="rowTotal(item)" /></td>
                  </tr>
                </template>
                <tr v-for="item in head.items || []" :key="'item-' + head.name + '-' + item.name">
                  <td class="fc-td fc-sticky-col bg-white pl-10 text-left dark:bg-gray-900">{{ item.name }}</td>
                  <QuarterCells :node="item" :kind="kind" :expanded-q="expandedQ" />
                  <td class="fc-td text-right"><CrCell mode="inr" :value="rowTotal(item)" /></td>
                </tr>
              </template>
            </template>
          </template>
        </tbody>
        <tfoot>
          <tr class="fc-row-grand">
            <td class="fc-td fc-sticky-col bg-fc-blue-mid text-left">GRAND TOTAL</td>
            <QuarterCells :node="grandTotalRow" :kind="kind" :expanded-q="expandedQ" />
            <td class="fc-td text-right"><CrCell mode="inr" :value="rowTotal(grandTotalRow)" /></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </template>
</template>

<script setup>
import { computed, h, reactive, ref } from 'vue'
import { FormControl, Switch, Button, FeatherIcon, ErrorMessage } from 'frappe-ui'
import AppLoader from '@/components/AppLoader.vue'
import CrCell from './CrCell.vue'
import {
  QUARTER_KEYS,
  actualsQuarterTotal,
  actualsQuarterMonths,
  actualsRowTotal,
} from '@/data/foundationConsolidatedData'
import { rowTotal as annualRowTotal, QUARTERS } from '@/data/budgetTotals'

const props = defineProps({
  kind: { type: String, required: true }, // 'annual' | 'actuals'
  loading: Boolean,
  error: { type: Object, default: null },
  data: { type: Array, default: () => [] },
  financialYear: { type: String, default: '' },
  exporting: Boolean,
})
defineEmits(['retry', 'export'])

const errorMessage = computed(() => props.error?.messages?.[0] || props.error?.message ||
  `Something went wrong loading ${props.kind === 'annual' ? 'Annual Budget Consolidated' : 'Actuals Consolidated'}.`)

const Q_DEFS = [
  { key: 'q1', label: 'Quarter 1', months: ['Apr', 'May', 'Jun'] },
  { key: 'q2', label: 'Quarter 2', months: ['Jul', 'Aug', 'Sep'] },
  { key: 'q3', label: 'Quarter 3', months: ['Oct', 'Nov', 'Dec'] },
  { key: 'q4', label: 'Quarter 4', months: ['Jan', 'Feb', 'Mar'] },
]

const searchTerm = ref('')
const openHeads = reactive(new Set())
const openSubs = reactive(new Set()) // key: head::sub
const expandItems = ref(false)
const expandedQ = reactive(new Set())

const expandQuarters = computed({
  get: () => QUARTER_KEYS.every((k) => expandedQ.has(k)),
  set: (value) => {
    expandedQ.clear()
    if (value) QUARTER_KEYS.forEach((k) => expandedQ.add(k))
  },
})
function toggleQuarter(key) {
  if (expandedQ.has(key)) expandedQ.delete(key)
  else expandedQ.add(key)
}
const anyQuarterOpen = computed(() => QUARTER_KEYS.some((k) => expandedQ.has(k)))

function isHeadOpen(name) {
  return expandItems.value || openHeads.has(name)
}
function isSubOpen(headName, subName) {
  return expandItems.value || openSubs.has(headName + '::' + subName)
}
function toggleHead(name) {
  if (openHeads.has(name)) openHeads.delete(name)
  else openHeads.add(name)
}
function toggleSub(headName, subName) {
  const key = headName + '::' + subName
  if (openSubs.has(key)) openSubs.delete(key)
  else openSubs.add(key)
}

// Search: Desk-exact behavior - matches at the HEAD level only (head name,
// any sub_head name, any item name nested anywhere under the head). A
// matching head is kept ENTIRELY in the render (all its rows stay in the
// DOM), but sub/item row VISIBILITY still follows the existing
// open/expand state - search does not auto-expand ancestors of a match.
function matchesSearch(head, term) {
  if (!term) return true
  const t = term.toLowerCase()
  if ((head.name || '').toLowerCase().includes(t)) return true
  for (const sub of head.sub_heads || []) {
    if ((sub.name || '').toLowerCase().includes(t)) return true
    for (const item of sub.items || []) {
      if ((item.name || '').toLowerCase().includes(t)) return true
    }
  }
  for (const item of head.items || []) {
    if ((item.name || '').toLowerCase().includes(t)) return true
  }
  return false
}

const visibleHeads = computed(() => {
  const term = searchTerm.value.trim()
  if (!term) return props.data
  return props.data.filter((h) => matchesSearch(h, term))
})

function rowTotal(node) {
  return props.kind === 'actuals' ? actualsRowTotal(node) : annualRowTotal(node)
}

// Grand total: unconditionally sums the FULL unfiltered data (search does
// not affect it), matching the Desk page exactly.
const grandTotalRow = computed(() => {
  if (props.kind === 'actuals') {
    const months = {}
    for (const key of ['4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3']) months[key] = 0
    let Q1 = 0, Q2 = 0, Q3 = 0, Q4 = 0
    for (const head of props.data) {
      Q1 += actualsQuarterTotal(head, 'q1'); Q2 += actualsQuarterTotal(head, 'q2')
      Q3 += actualsQuarterTotal(head, 'q3'); Q4 += actualsQuarterTotal(head, 'q4')
      const hm = head.months || {}
      for (const key of Object.keys(months)) months[key] += Number(hm[key] || 0)
    }
    return { Q1, Q2, Q3, Q4, months }
  }
  const totals = { q1: [0, 0, 0], q2: [0, 0, 0], q3: [0, 0, 0], q4: [0, 0, 0] }
  for (const head of props.data) {
    for (const q of QUARTERS) {
      const arr = head[q] || [0, 0, 0]
      totals[q] = totals[q].map((v, i) => v + (Number(arr[i]) || 0))
    }
  }
  return totals
})

// QuarterCells: one cell per quarter (its total), expanding to 3 month
// cells for whichever quarters are individually open - shared render
// helper so header/head/sub/item/grand-total rows can never drift in
// column layout. Reads q1-q4 arrays (annual) or Q1-Q4 + months (actuals)
// depending on `kind`.
const QuarterCells = {
  props: { node: Object, kind: String, expandedQ: Object },
  setup(p) {
    return () =>
      Q_DEFS.flatMap((q) => {
        if (p.expandedQ.has(q.key)) {
          const months = p.kind === 'actuals' ? actualsQuarterMonths(p.node, q.key) : (p.node?.[q.key] || [0, 0, 0])
          return months.map((m, i) => h('td', { key: q.key + i, class: 'fc-td text-right' }, [h(CrCell, { mode: 'inr', value: m })]))
        }
        const total = p.kind === 'actuals' ? actualsQuarterTotal(p.node, q.key) : (p.node?.[q.key] || []).reduce((a, b) => a + (Number(b) || 0), 0)
        return [h('td', { key: q.key, class: 'fc-td text-right' }, [h(CrCell, { mode: 'inr', value: total })])]
      })
  },
}
</script>
