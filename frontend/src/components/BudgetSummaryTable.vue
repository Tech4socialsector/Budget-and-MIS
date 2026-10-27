<template>
  <div class="fc-scroll-wrapper w-full min-w-0 max-h-full !mb-0">
    <table class="fc-table w-full min-w-[1000px] text-sm">
      <thead>
        <!-- Blue banner row. Fixed columns (Expense Head, Total) use
        rowspan so they correctly span both header rows regardless of which
        quarters are expanded, instead of needing a matching blank
        placeholder cell repeated in the second row (the previous approach
        - easy to get subtly out of sync, which is what produced the
        misaligned header). -->
        <tr>
          <th rowspan="2" class="fc-th fc-sticky-col text-left">
            Expense Head / Line Item
          </th>
          <template v-for="q in QUARTERS" :key="q.key">
            <th
              v-if="isQuarterOpen(q.key)"
              :colspan="3"
              class="fc-th cursor-pointer select-none text-right"
              @click="$emit('toggle-quarter', q.key)"
            >
              {{ q.label }} <span class="ml-1 text-white/70">▲</span>
            </th>
            <th
              v-else
              rowspan="2"
              class="fc-th cursor-pointer select-none text-right"
              @click="$emit('toggle-quarter', q.key)"
            >
              {{ q.label }} <span class="ml-1 text-white/70">▼</span>
            </th>
          </template>
          <th rowspan="2" class="fc-th text-right">
            Total
          </th>
        </tr>
        <!-- Orange month row - only cells for whichever quarter(s) are
        individually expanded; collapsed quarters and the fixed columns
        contribute no cells here at all (they rowspan from row 1 above). -->
        <tr v-if="anyQuarterOpen">
          <template v-for="q in QUARTERS" :key="q.key">
            <template v-if="isQuarterOpen(q.key)">
              <th v-for="m in q.months" :key="m" class="fc-th-sub">
                {{ m }}
              </th>
            </template>
          </template>
        </tr>
      </thead>
      <tbody>
        <template v-for="(head, headIdx) in heads" :key="head.name">
          <tr class="fc-row-head" @click="$emit('toggle-head', head.name)">
            <td class="fc-td fc-sticky-col border-l-4" :style="{ borderLeftColor: accentColor(headIdx) }">
              <span class="inline-flex items-center gap-2">
                <FeatherIcon :name="isHeadOpen(head.name) ? 'chevron-down' : 'chevron-right'" class="h-4 w-4" />
                {{ head.name }}
              </span>
            </td>
            <RowAmounts :row="head" :open-quarters="openQuarterKeys" />
            <td class="fc-td text-right">
              {{ formatAmount(rowTotal(head)) }}
            </td>
          </tr>

          <template v-if="isHeadOpen(head.name)">
            <!-- Items directly under the head (no sub-head) -->
            <tr v-for="item in head.items" :key="'item-' + head.name + '-' + item.name">
              <td class="fc-td fc-sticky-col pl-10">
                {{ item.name }}
              </td>
              <RowAmounts :row="item" :open-quarters="openQuarterKeys" />
              <td class="fc-td text-right">
                {{ formatAmount(rowTotal(item)) }}
              </td>
            </tr>

            <!-- Sub-heads -->
            <template v-for="sub in head.sub_heads" :key="'sub-' + head.name + '-' + sub.name">
              <tr class="fc-row-sub" @click="$emit('toggle-sub-head', head.name + '::' + sub.name)">
                <td class="fc-td fc-sticky-col pl-8 border-l-4" :style="{ borderLeftColor: accentColor(headIdx, true) }">
                  <span class="inline-flex items-center gap-2">
                    <FeatherIcon :name="isSubHeadOpen(head.name, sub.name) ? 'chevron-down' : 'chevron-right'" class="h-3.5 w-3.5" />
                    {{ sub.name }}
                  </span>
                </td>
                <RowAmounts :row="sub" :open-quarters="openQuarterKeys" />
                <td class="fc-td text-right">
                  {{ formatAmount(rowTotal(sub)) }}
                </td>
              </tr>

              <template v-if="isSubHeadOpen(head.name, sub.name)">
                <tr v-for="item in sub.items" :key="'subitem-' + head.name + '-' + sub.name + '-' + item.name">
                  <td class="fc-td fc-sticky-col pl-12">
                    {{ item.name }}
                  </td>
                  <RowAmounts :row="item" :open-quarters="openQuarterKeys" />
                  <td class="fc-td text-right">
                    {{ formatAmount(rowTotal(item)) }}
                  </td>
                </tr>
              </template>
            </template>
          </template>
        </template>
      </tbody>
      <tfoot>
        <tr class="fc-row-grand">
          <td class="fc-td fc-sticky-col">Grand Total</td>
          <RowAmounts :row="grandTotalRow" :open-quarters="openQuarterKeys" />
          <td class="fc-td text-right">
            {{ formatAmount(rowTotal(grandTotalRow)) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import { FeatherIcon } from 'frappe-ui'

const props = defineProps({
  heads: { type: Array, required: true },
  expandedHeads: { type: Object, required: true },
  expandedSubHeads: { type: Object, required: true },
  expandItemsAll: { type: Boolean, default: false },
  expandedQuarterKeys: { type: Object, required: true },
  showFullNumbers: { type: Boolean, default: false },
})

defineEmits(['toggle-head', 'toggle-sub-head', 'toggle-quarter'])

const QUARTERS = [
  { key: 'q1', label: 'Quarter 1', months: ['Apr', 'May', 'Jun'] },
  { key: 'q2', label: 'Quarter 2', months: ['Jul', 'Aug', 'Sep'] },
  { key: 'q3', label: 'Quarter 3', months: ['Oct', 'Nov', 'Dec'] },
  { key: 'q4', label: 'Quarter 4', months: ['Jan', 'Feb', 'Mar'] },
]

const openQuarterKeys = computed(() => props.expandedQuarterKeys)

function isQuarterOpen(key) {
  return props.expandedQuarterKeys.has(key)
}

const anyQuarterOpen = computed(() => QUARTERS.some((q) => isQuarterOpen(q.key)))

// Same fixed-order categorical palette as BudgetSummaryCards.vue, so the
// table's row accents match each expense head's card color exactly.
const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948']
const CATEGORICAL_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']

function accentColor(i, muted = false) {
  const isDark = document.documentElement.classList.contains('dark')
  const palette = isDark ? CATEGORICAL_DARK : CATEGORICAL
  const hex = palette[i % palette.length]
  return muted ? hex + '99' : hex
}

function isHeadOpen(name) {
  return props.expandItemsAll || props.expandedHeads.has(name)
}

function isSubHeadOpen(headName, subName) {
  return props.expandItemsAll || props.expandedSubHeads.has(headName + '::' + subName)
}

function quarterTotal(row, key) {
  return (row?.[key] || []).reduce((a, b) => a + (Number(b) || 0), 0)
}

function rowTotal(row) {
  return QUARTERS.reduce((sum, q) => sum + quarterTotal(row, q.key), 0)
}

// "Show full numbers" off shows amounts in Cr - 2 decimal places (not the
// cards' 0) since this table goes all the way down to individual line
// items, routinely far smaller than the crore-scale head/grand totals the
// cards show; 0 decimals there would collapse most item rows to "0.00 Cr"
// indistinguishably from genuinely empty ones.
function formatAmount(n) {
  if (!n) return '-'
  if (props.showFullNumbers) {
    return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
  }
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n / 1e7) + ' Cr'
}

const grandTotalRow = computed(() => {
  const totals = { q1: [0, 0, 0], q2: [0, 0, 0], q3: [0, 0, 0], q4: [0, 0, 0] }
  for (const head of props.heads) {
    for (const q of QUARTERS) {
      const months = head[q.key] || [0, 0, 0]
      totals[q.key] = totals[q.key].map((v, i) => v + (Number(months[i]) || 0))
    }
  }
  return totals
})

// RowAmounts: renders one cell per quarter (its total), expanding to 3
// month cells for whichever quarters are individually open - shared by
// every row level so the column layout can never drift between
// header/head/sub-head/item rows.
const RowAmounts = {
  props: { row: Object, openQuarters: Object },
  setup(p) {
    return () =>
      QUARTERS.flatMap((q) => {
        if (p.openQuarters.has(q.key)) {
          const months = p.row?.[q.key] || [0, 0, 0]
          return months.map((m, i) =>
            h('td', { key: q.key + i, class: 'fc-td text-right' }, formatAmount(m)),
          )
        }
        return [
          h('td', { key: q.key, class: 'fc-td text-right' }, formatAmount(quarterTotal(p.row, q.key))),
        ]
      })
  },
}
</script>
