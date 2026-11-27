<!--
  Trial Balance Check's own dedicated drill-down modal - deliberately
  separate from the shared BudgetDrilldownModal (used by Budget vs
  Actuals/Foundation Consolidated/Budget Summary/Budget Dashboard), since
  Credit/Debit/Opening Balance are Trial Balance-specific concepts those
  other pages' data has no equivalent of; keeping this modal separate means
  none of those other pages' own drill-downs are put at risk by a change
  made here. Visual language (summary card, composition bar, accent-colored
  row dots, share %) deliberately mirrors BudgetDrilldownModal's own so this
  modal doesn't look like a different, bolted-on feature next to it.

  Two tabs, both scoped to whichever node is currently open:
  - "GL Codes" (default/first tab): a flat table - GL code, Description,
    Debit, Credit, Opening Balance - one row per GL code actually seen in
    this node's own rows (node.gl_code_table, built server-side by
    budget_mis.api.trial_balance._build_gl_code_table). Includes a GL code
    even if it doesn't resolve to a Capex/Opex category (unlike the
    Head/Sub-head tree, which only ever shows a mapped GL code), so a
    System Manager auditing raw PeopleSoft data never has a code silently
    vanish here. Sortable by amount (descending |net|), same convention as
    BudgetDrilldownModal's own child table.
  - "Cost Center / Location": the unit's own Cost Center x Location
    breakdown (node.cost_center_breakdown, built server-side by
    _build_cost_center_breakdown) - clicking one of ITS rows opens a
    second-level instance of this SAME modal (recursively, via its own
    v-model/node props), scoped to just that cost-center+location's own
    gl_code_table - so the same two-tab UI works identically one level
    down, with a "Back" breadcrumb instead of a second independent modal
    stack.

  No Head/Sub-head/Item tree view here at all (unlike BudgetDrilldownModal)
  - the business's own explicit ask was GL code + description + credit/
  debit/opening balance as the primary view, not a repeat of the existing
  consolidated category tree.
-->
<template>
  <Dialog v-model="show" :options="{ size: '6xl', title: 'trial-balance-drilldown' }">
    <template #body>
      <div class="flex max-h-[90vh] flex-col sm:min-h-[36rem]">
        <div class="border-b px-5 py-4 dark:border-gray-800">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <button
                v-if="history.length > 1"
                class="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                title="Back"
                @click="drillBack"
              >
                <FeatherIcon name="arrow-left" class="h-4.5 w-4.5" />
              </button>
              <span v-else class="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-fc-blue-light text-fc-blue-mid dark:bg-fc-blue-mid/20 dark:text-fc-blue-light">
                <FeatherIcon :name="activeTab === 'cc' ? 'map-pin' : 'hash'" class="h-4.5 w-4.5" />
              </span>
              <div class="min-w-0">
                <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Trial Balance Drill Down</div>
                <h2 class="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">{{ current?.name }}</h2>
              </div>
            </div>
            <button
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              @click="show = false"
            >
              <FeatherIcon name="x" class="h-4 w-4" />
            </button>
          </div>

          <div v-if="history.length > 1" class="mt-3 flex flex-wrap items-center gap-1 text-xs">
            <template v-for="(node, i) in history" :key="node.name + i">
              <button
                class="rounded px-1.5 py-0.5 font-medium transition"
                :class="i === history.length - 1
                  ? 'cursor-default text-gray-900 dark:text-gray-100'
                  : 'text-fc-blue-mid hover:bg-fc-blue-light dark:text-fc-blue-light dark:hover:bg-gray-800'"
                :disabled="i === history.length - 1"
                @click="jumpTo(i)"
              >
                {{ node.name }}
              </button>
              <FeatherIcon v-if="i < history.length - 1" name="chevron-right" class="h-3 w-3 flex-shrink-0 text-gray-300 dark:text-gray-600" />
            </template>
          </div>

          <div class="mt-3">
            <TabButtons v-model="activeTab" :buttons="tabButtons" />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5">
          <!-- Summary card: total + count, with a composition bar showing
          each row's share - same visual block BudgetDrilldownModal opens
          every level with. -->
          <div class="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-6">
                <div>
                  <div class="text-xs uppercase tracking-wide text-gray-900 dark:text-gray-300">Total</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(current?.ytd) }}</div>
                </div>
                <div v-if="displayedRows.length">
                  <div class="text-xs uppercase tracking-wide text-gray-900 dark:text-gray-300">{{ activeTab === 'cc' ? 'Cost Center · Location' : 'GL Codes' }}</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ displayedRows.length }}</div>
                </div>
              </div>
              <Switch v-model="showFullNumbers" label="Show full numbers" />
            </div>

            <div v-if="displayedRows.length > 1" class="mt-4">
              <div class="flex h-2.5 w-full overflow-hidden rounded-full">
                <AppTooltip v-for="(row, i) in displayedRows" :key="'seg-' + i"
                    class="first:rounded-l-full last:rounded-r-full overflow-hidden"
                    :style="{ width: sharePct(row) + '%', minWidth: sharePct(row) > 0 ? '2px' : 0 }" :text="`${row.gl_code || row.name}: ${sharePct(row)}%`">
                  <span
                    class="block h-full w-full"
                    :style="{ backgroundColor: accentColor(i) }"
                  />
                </AppTooltip>
              </div>
            </div>
          </div>

          <template v-if="activeTab === 'gl'">
            <div v-if="!glRows.length" class="flex flex-col items-center gap-2 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <FeatherIcon name="inbox" class="h-6 w-6 text-gray-300 dark:text-gray-600" />
              No GL codes for this slice.
            </div>
            <template v-else>
              <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">
                  <FeatherIcon name="hash" class="h-3.5 w-3.5" />
                  GL Codes
                </div>
                <button
                  class="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  @click="sortByAmount = !sortByAmount"
                >
                  <FeatherIcon name="bar-chart-2" class="h-3.5 w-3.5" />
                  {{ sortByAmount ? 'Sorted by amount' : 'Sort by amount' }}
                </button>
              </div>
              <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                <table class="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-800">
                      <th class="border-b border-gray-200 px-4 py-2.5 text-left font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">GL Code</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 text-left font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Description</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Share</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Debit</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Credit</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        <AppTooltip text="For a Capital Expenses GL code, this is already included in Credit above (negated) so Net reflects only this year's new movement - it is not a separate deduction from Net.">
                          <span class="cursor-help underline decoration-dotted">Opening Balance</span>
                        </AppTooltip>
                      </th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, i) in displayedRows"
                      :key="row.gl_code + i"
                      class="border-t border-gray-100 transition odd:bg-white even:bg-gray-50/60 dark:border-gray-800 dark:odd:bg-transparent dark:even:bg-gray-800/30"
                    >
                      <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        <span class="flex items-center gap-2">
                          <span class="h-2 w-2 flex-shrink-0 rounded-full" :style="{ backgroundColor: accentColor(i) }" />
                          {{ row.gl_code }}
                        </span>
                      </td>
                      <td class="border-l border-gray-100 px-4 py-2.5 text-gray-700 dark:border-gray-800 dark:text-gray-300">{{ row.description || '—' }}</td>
                      <td class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800">
                        <div class="flex items-center justify-end gap-2">
                          <span class="text-xs text-gray-500 dark:text-gray-400">{{ sharePct(row) }}%</span>
                          <span class="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <span class="block h-full rounded-full" :style="{ width: sharePct(row) + '%', backgroundColor: accentColor(i) }" />
                          </span>
                        </div>
                      </td>
                      <td class="border-l border-gray-100 px-4 py-2.5 text-right font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100">{{ formatAmount(row.debit) }}</td>
                      <td class="border-l border-gray-100 px-4 py-2.5 text-right font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100">{{ formatAmount(row.credit) }}</td>
                      <td class="border-l border-gray-100 px-4 py-2.5 text-right font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100">{{ formatAmount(row.opening_balance) }}</td>
                      <td
                        class="border-l border-gray-100 px-4 py-2.5 text-right font-semibold dark:border-gray-800"
                        :class="!row.net ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'"
                      >
                        {{ formatAmount(row.net) }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="glTotal">
                    <tr class="fc-row-grand">
                      <td class="px-4 py-2.5 font-semibold">TOTAL</td>
                      <td class="border-l border-white/20 px-4 py-2.5"></td>
                      <td class="border-l border-white/20 px-4 py-2.5"></td>
                      <td class="border-l border-white/20 px-4 py-2.5 text-right font-semibold">{{ formatAmount(glTotal.debit) }}</td>
                      <td class="border-l border-white/20 px-4 py-2.5 text-right font-semibold">{{ formatAmount(glTotal.credit) }}</td>
                      <td class="border-l border-white/20 px-4 py-2.5 text-right font-semibold">{{ formatAmount(glTotal.opening_balance) }}</td>
                      <td class="border-l border-white/20 px-4 py-2.5 text-right font-semibold">{{ formatAmount(glTotal.net) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </template>
          </template>

          <template v-else>
            <div v-if="!costCenterRows.length" class="flex flex-col items-center gap-2 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <FeatherIcon name="inbox" class="h-6 w-6 text-gray-300 dark:text-gray-600" />
              No Cost Center / Location breakdown for this slice.
            </div>
            <template v-else>
              <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">
                  <FeatherIcon name="map-pin" class="h-3.5 w-3.5" />
                  Cost Center · Location
                </div>
                <button
                  class="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  @click="sortByAmount = !sortByAmount"
                >
                  <FeatherIcon name="bar-chart-2" class="h-3.5 w-3.5" />
                  {{ sortByAmount ? 'Sorted by amount' : 'Sort by amount' }}
                </button>
              </div>
              <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                <table class="w-full min-w-[480px] border-collapse text-sm">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-800">
                      <th class="border-b border-gray-200 px-4 py-2.5 text-left font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Cost Center · Location</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Share</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, i) in displayedRows"
                      :key="row.name + i"
                      class="cursor-pointer border-t border-gray-100 transition odd:bg-white even:bg-gray-50/60 hover:bg-fc-blue-light/40 dark:border-gray-800 dark:odd:bg-transparent dark:even:bg-gray-800/30 dark:hover:bg-gray-800/70"
                      @click="drillIntoCostCenterRow(row)"
                    >
                      <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        <span class="flex items-center gap-2">
                          <span class="h-2 w-2 flex-shrink-0 rounded-full" :style="{ backgroundColor: accentColor(i) }" />
                          {{ row.name }}
                          <FeatherIcon name="chevron-right" class="h-3.5 w-3.5 text-gray-400" />
                        </span>
                      </td>
                      <td class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800">
                        <div class="flex items-center justify-end gap-2">
                          <span class="text-xs text-gray-500 dark:text-gray-400">{{ sharePct(row) }}%</span>
                          <span class="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <span class="block h-full rounded-full" :style="{ width: sharePct(row) + '%', backgroundColor: accentColor(i) }" />
                          </span>
                        </div>
                      </td>
                      <td class="border-l border-gray-100 px-4 py-2.5 text-right font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100">{{ formatAmount(row.ytd) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="fc-row-grand">
                      <td class="px-4 py-2.5 font-semibold">TOTAL</td>
                      <td class="border-l border-white/20 px-4 py-2.5"></td>
                      <td class="border-l border-white/20 px-4 py-2.5 text-right font-semibold">{{ formatAmount(costCenterTotal) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </template>
          </template>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Dialog, FeatherIcon, Switch, TabButtons } from 'frappe-ui'
import AppTooltip from '@/components/AppTooltip.vue'
import { accentColor, formatCr, formatINR } from '@/data/budgetTotals'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // {name, ytd, gl_code_table: [...], cost_center_breakdown: [...]} - a
  // unit row from build_trial_balance_table, or (after drilling in) one of
  // its own cost_center_breakdown nodes - both shapes carry the same two
  // fields this modal reads.
  node: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const tabButtons = [
  { label: 'GL Codes', value: 'gl' },
  { label: 'Cost Center / Location', value: 'cc' },
]
const activeTab = ref('gl')
const showFullNumbers = ref(false)
const sortByAmount = ref(false)

function formatAmount(n) {
  if (n === null || n === undefined) return '-'
  return showFullNumbers.value ? formatINR(n) : formatCr(n)
}

// Navigation stack, same breadcrumb convention as BudgetDrilldownModal -
// opening a NEW top-level node (unit row click) resets it; drilling into a
// Cost Center/Location row pushes that row's own node onto it instead of
// opening a second independent modal.
const history = ref([])

watch(
  () => [props.modelValue, props.node],
  ([visible, node]) => {
    if (visible && node) {
      history.value = [node]
      activeTab.value = 'gl'
      sortByAmount.value = false
    }
  },
)

const current = computed(() => history.value[history.value.length - 1] || props.node)
// gl_code_table is {rows, total} - built server-side by
// budget_mis.api.trial_balance._build_gl_code_table, `total` already
// applying the same category-aware Capex (debit - credit - opening
// balance) / everything-else (debit - credit) formula per row, summed
// across the whole slice.
const glRows = computed(() => current.value?.gl_code_table?.rows || [])
const glTotal = computed(() => current.value?.gl_code_table?.total || null)
const costCenterRows = computed(() => current.value?.cost_center_breakdown || [])
const costCenterTotal = computed(() => costCenterRows.value.reduce((sum, r) => sum + (r.ytd || 0), 0))

// A GL code row's own "amount" for sort/share purposes is its own `net`
// (same category-aware formula its own column already applies) - a Cost
// Center/Location row already carries this as `ytd` directly.
function rowAmount(row) {
  return row.ytd !== undefined ? row.ytd || 0 : row.net || 0
}

const activeRows = computed(() => (activeTab.value === 'cc' ? costCenterRows.value : glRows.value))
const displayedRows = computed(() => {
  if (!sortByAmount.value) return activeRows.value
  return [...activeRows.value].sort((a, b) => Math.abs(rowAmount(b)) - Math.abs(rowAmount(a)))
})

const totalAbs = computed(() => activeRows.value.reduce((sum, r) => sum + Math.abs(rowAmount(r)), 0))
function sharePct(row) {
  const denom = totalAbs.value
  return denom ? Math.round((Math.abs(rowAmount(row)) / denom) * 1000) / 10 : 0
}

function drillIntoCostCenterRow(row) {
  history.value.push(row)
  activeTab.value = 'gl'
  sortByAmount.value = false
}

function jumpTo(index) {
  history.value = history.value.slice(0, index + 1)
}

function drillBack() {
  if (history.value.length > 1) history.value = history.value.slice(0, -1)
}
</script>
