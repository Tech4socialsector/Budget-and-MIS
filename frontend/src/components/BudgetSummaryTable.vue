<template>
  <div class="w-full min-w-0 overflow-auto rounded-lg border border-gray-200 dark:border-gray-800">
    <table class="w-full min-w-[1100px] border-collapse text-base">
      <thead class="sticky top-0 z-20 isolate">
        <!-- Blue banner row. Fixed columns (Expense Head, GL Code, Total)
        use rowspan so they correctly span both header rows regardless of
        which quarters are expanded, instead of needing a matching blank
        placeholder cell repeated in the second row (the previous approach
        - easy to get subtly out of sync, which is what produced the
        misaligned header). -->
        <tr>
          <th
            rowspan="2"
            class="sticky left-0 top-0 z-30 whitespace-nowrap bg-banner px-4 py-3.5 text-left align-middle text-base font-semibold text-white"
          >
            Expense Head / Line Item
          </th>
          <th
            rowspan="2"
            class="border-l border-white/20 bg-banner px-4 py-3.5 text-left align-middle text-base font-semibold text-white"
          >
            GL Code
          </th>
          <template v-for="q in QUARTERS" :key="q.key">
            <th
              v-if="isQuarterOpen(q.key)"
              :colspan="3"
              class="cursor-pointer select-none border-l border-white/20 bg-banner px-4 py-3.5 text-right text-base font-semibold text-white hover:bg-banner-hover"
              @click="$emit('toggle-quarter', q.key)"
            >
              {{ q.label }} <span class="ml-1 text-white/70">▲</span>
            </th>
            <th
              v-else
              rowspan="2"
              class="cursor-pointer select-none border-l border-white/20 bg-banner px-4 py-3.5 text-right align-middle text-base font-semibold text-white hover:bg-banner-hover"
              @click="$emit('toggle-quarter', q.key)"
            >
              {{ q.label }} <span class="ml-1 text-white/70">▼</span>
            </th>
          </template>
          <th
            rowspan="2"
            class="border-l border-white/20 bg-banner px-4 py-3.5 text-right align-middle text-base font-semibold text-white"
          >
            Total
          </th>
        </tr>
        <!-- Orange month row - only cells for whichever quarter(s) are
        individually expanded; collapsed quarters and the fixed columns
        contribute no cells here at all (they rowspan from row 1 above). -->
        <tr v-if="anyQuarterOpen">
          <template v-for="q in QUARTERS" :key="q.key">
            <template v-if="isQuarterOpen(q.key)">
              <th
                v-for="m in q.months"
                :key="m"
                class="border-l border-white/20 bg-subbanner px-3 py-2 text-right text-sm font-medium text-white/95"
              >
                {{ m }}
              </th>
            </template>
          </template>
        </tr>
      </thead>
      <tbody class="relative isolate z-0">
        <template v-for="(head, headIdx) in heads" :key="head.name">
          <tr
            class="cursor-pointer bg-head-row font-semibold text-gray-900 hover:brightness-95 dark:text-gray-100"
            @click="$emit('toggle-head', head.name)"
          >
            <td class="sticky left-0 z-10 whitespace-nowrap border-b border-l-4 border-gray-300 bg-head-row px-4 py-3 dark:border-gray-700" :style="{ borderLeftColor: accentColor(headIdx) }">
              <span class="inline-flex items-center gap-2">
                <FeatherIcon :name="isHeadOpen(head.name) ? 'chevron-down' : 'chevron-right'" class="h-4 w-4" />
                {{ head.name }}
              </span>
            </td>
            <td class="border-b border-l border-gray-300 bg-head-row px-4 py-3 dark:border-gray-700">-</td>
            <RowAmounts :row="head" :open-quarters="openQuarterKeys" />
            <td class="border-b border-l border-gray-300 bg-head-row px-4 py-3 text-right text-link dark:border-gray-700">
              {{ formatAmount(rowTotal(head)) }}
            </td>
          </tr>

          <template v-if="isHeadOpen(head.name)">
            <!-- Items directly under the head (no sub-head) -->
            <tr
              v-for="(item, idx) in head.items"
              :key="'item-' + head.name + '-' + item.name"
              :class="idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-stripe dark:bg-gray-800/40'"
              class="text-gray-700 dark:text-gray-300"
            >
              <td class="sticky left-0 z-10 whitespace-nowrap border-b border-gray-200 py-2.5 pl-10 pr-4 dark:border-gray-800" :class="idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-stripe dark:bg-gray-800/40'">
                {{ item.name }}
              </td>
              <td class="border-b border-l border-gray-200 py-2.5 pr-4 text-sm text-gray-400 dark:border-gray-800">{{ item.gl_code || '-' }}</td>
              <RowAmounts :row="item" :open-quarters="openQuarterKeys" />
              <td class="border-b border-l border-gray-200 py-2.5 pr-4 text-right text-link dark:border-gray-800">
                {{ formatAmount(rowTotal(item)) }}
              </td>
            </tr>

            <!-- Sub-heads -->
            <template v-for="sub in head.sub_heads" :key="'sub-' + head.name + '-' + sub.name">
              <tr
                class="cursor-pointer bg-subhead-row font-medium text-gray-800 hover:brightness-95 dark:text-gray-200"
                @click="$emit('toggle-sub-head', head.name + '::' + sub.name)"
              >
                <td
                  class="sticky left-0 z-10 whitespace-nowrap border-b border-l-4 border-gray-300 bg-subhead-row py-2.5 pl-8 pr-4 dark:border-gray-700"
                  :style="{ borderLeftColor: accentColor(headIdx, true) }"
                >
                  <span class="inline-flex items-center gap-2">
                    <FeatherIcon :name="isSubHeadOpen(head.name, sub.name) ? 'chevron-down' : 'chevron-right'" class="h-3.5 w-3.5" />
                    {{ sub.name }}
                  </span>
                </td>
                <td class="border-b border-l border-gray-300 bg-subhead-row py-2.5 pr-4 dark:border-gray-700">-</td>
                <RowAmounts :row="sub" :open-quarters="openQuarterKeys" />
                <td class="border-b border-l border-gray-300 bg-subhead-row py-2.5 pr-4 text-right text-link dark:border-gray-700">
                  {{ formatAmount(rowTotal(sub)) }}
                </td>
              </tr>

              <template v-if="isSubHeadOpen(head.name, sub.name)">
                <tr
                  v-for="(item, idx) in sub.items"
                  :key="'subitem-' + head.name + '-' + sub.name + '-' + item.name"
                  :class="idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-stripe dark:bg-gray-800/40'"
                  class="text-gray-700 dark:text-gray-300"
                >
                  <td class="sticky left-0 z-10 whitespace-nowrap border-b border-gray-200 py-2.5 pl-12 pr-4 dark:border-gray-800" :class="idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-stripe dark:bg-gray-800/40'">
                    {{ item.name }}
                  </td>
                  <td class="border-b border-l border-gray-200 py-2.5 pr-4 text-sm text-gray-400 dark:border-gray-800">{{ item.gl_code || '-' }}</td>
                  <RowAmounts :row="item" :open-quarters="openQuarterKeys" />
                  <td class="border-b border-l border-gray-200 py-2.5 pr-4 text-right text-link dark:border-gray-800">
                    {{ formatAmount(rowTotal(item)) }}
                  </td>
                </tr>
              </template>
            </template>
          </template>
        </template>
      </tbody>
      <tfoot class="relative isolate z-0">
        <tr class="bg-total-row text-base font-bold text-total-text">
          <td class="sticky left-0 z-10 whitespace-nowrap border-t-2 border-gray-400 bg-total-row px-4 py-3.5 dark:border-gray-600">Grand Total</td>
          <td class="border-l border-t-2 border-gray-400 bg-total-row px-4 py-3.5 dark:border-gray-600">-</td>
          <RowAmounts :row="grandTotalRow" :open-quarters="openQuarterKeys" extra-class="border-t-2 border-gray-400 dark:border-gray-600" />
          <td class="border-l border-t-2 border-gray-400 bg-total-row px-4 py-3.5 text-right dark:border-gray-600">
            {{ formatAmount(rowTotal(grandTotalRow)) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style scoped>
/* Fixed brand banner colors (not data-encoded, so plain hex rather than
the categorical palette) matching the reference report's blue/orange
header pattern. Same values in both themes - a themed table header would
fight the reference look this was asked to match. */
.bg-banner {
  background-color: #1e5fa8;
}
.bg-banner-hover {
  background-color: #1a5493;
}
.bg-subbanner {
  background-color: #e8792a;
}
.bg-head-row {
  background-color: #eaf1fb;
}
:root:not([data-theme='light']) .bg-head-row,
[data-theme='dark'] .bg-head-row {
  background-color: rgb(37 60 92 / 0.4);
}
.bg-subhead-row {
  background-color: #f5f8fd;
}
:root:not([data-theme='light']) .bg-subhead-row,
[data-theme='dark'] .bg-subhead-row {
  background-color: rgb(31 41 55 / 0.5);
}
.bg-stripe {
  background-color: #fdf3ee;
}
.bg-total-row {
  background-color: #dceafd;
}
:root:not([data-theme='light']) .bg-total-row,
[data-theme='dark'] .bg-total-row {
  background-color: rgb(37 60 92 / 0.65);
}
.text-total-text {
  color: #1e5fa8;
}
:root:not([data-theme='light']) .text-total-text,
[data-theme='dark'] .text-total-text {
  color: #86b6ef;
}
.text-link {
  color: #1e5fa8;
}
:root:not([data-theme='light']) .text-link,
[data-theme='dark'] .text-link {
  color: #6da7ec;
}
</style>

<script setup>
import { computed, h } from 'vue'
import { FeatherIcon } from 'frappe-ui'

const props = defineProps({
  heads: { type: Array, required: true },
  expandedHeads: { type: Object, required: true },
  expandedSubHeads: { type: Object, required: true },
  expandItemsAll: { type: Boolean, default: false },
  expandedQuarterKeys: { type: Object, required: true },
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

function formatAmount(n) {
  if (!n) return '-'
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
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
  props: { row: Object, openQuarters: Object, extraClass: { type: String, default: '' } },
  setup(p) {
    return () =>
      QUARTERS.flatMap((q) => {
        if (p.openQuarters.has(q.key)) {
          const months = p.row?.[q.key] || [0, 0, 0]
          return months.map((m, i) =>
            h(
              'td',
              { key: q.key + i, class: `border-b border-l border-gray-200 dark:border-gray-800 px-3 py-2.5 text-right text-sm ${p.extraClass}` },
              formatAmount(m),
            ),
          )
        }
        return [
          h(
            'td',
            { key: q.key, class: `border-b border-l border-gray-200 dark:border-gray-800 px-4 py-2.5 text-right ${p.extraClass}` },
            formatAmount(quarterTotal(p.row, q.key)),
          ),
        ]
      })
  },
}
</script>
