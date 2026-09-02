<template>
  <Dialog v-model="show" :options="{ size: '3xl', title: 'budget-drilldown' }">
    <template #body>
      <div class="flex max-h-[85vh] min-h-[32rem] flex-col">
        <!-- Header: icon + breadcrumb trail + close -->
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
                <FeatherIcon :name="levelIcon" class="h-4.5 w-4.5" />
              </span>
              <div class="min-w-0">
                <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Drill Down</div>
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

          <!-- Breadcrumb trail: every level clicked into so far, clickable to
          jump back several steps at once instead of only one "Back" at a
          time. -->
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
        </div>

        <div class="flex-1 overflow-y-auto p-5">
          <!-- Summary card: totals + a compact composition bar showing each
          child's share, so the numbers below have visual context before
          scanning the table. -->
          <div class="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div v-if="!showActuals" class="flex items-center gap-6">
                <div>
                  <div class="text-xs uppercase tracking-wide text-gray-900 dark:text-gray-300">Total</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(total(current)) }}</div>
                </div>
                <div v-if="children.length">
                  <div class="text-xs uppercase tracking-wide text-gray-900 dark:text-gray-300">{{ childLabel }}</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ children.length }}</div>
                </div>
              </div>
              <div v-else class="flex flex-wrap items-center gap-6">
                <div>
                  <div class="text-xs uppercase tracking-wide text-gray-900 dark:text-gray-300">Budget</div>
                  <div class="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(total(current)) }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-gray-900 dark:text-gray-300">Actual</div>
                  <div class="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(actualTotal(current)) }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-gray-900 dark:text-gray-300">Variance</div>
                  <div class="mt-1 text-xl font-semibold" :style="{ color: varianceColor(current) }">
                    {{ formatAmount(Math.abs(total(current) - actualTotal(current))) }}
                    <span class="text-xs font-normal">{{ total(current) - actualTotal(current) >= 0 ? 'under' : 'over' }}</span>
                  </div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-gray-900 dark:text-gray-300">Utilization</div>
                  <div class="mt-1 flex items-center gap-2">
                    <span class="text-xl font-semibold" :style="{ color: utilizationColor(utilizationPct(current)) }">
                      {{ utilizationPct(current) }}%
                    </span>
                    <span class="h-1.5 w-14 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <span
                        class="block h-full rounded-full"
                        :style="{ width: Math.min(utilizationPct(current), 100) + '%', backgroundColor: utilizationColor(utilizationPct(current)) }"
                      />
                    </span>
                  </div>
                </div>
              </div>
              <Switch v-model="showFullNumbers" label="Show full numbers" />
            </div>

            <!-- Composition bar: one segment per child, width proportional
            to its share of the current node's total - gives an immediate
            visual read of concentration before the table even loads focus. -->
            <div v-if="children.length > 1" class="mt-4">
              <div class="flex h-2.5 w-full overflow-hidden rounded-full">
                <AppTooltip v-for="(child, i) in children" :key="'seg-' + child.name + i" :text="`${child.name}: ${sharePct(child)}%`">
                  <span
                    class="block h-full first:rounded-l-full last:rounded-r-full"
                    :style="{ width: sharePct(child) + '%', backgroundColor: accentColor(i), minWidth: sharePct(child) > 0 ? '2px' : 0 }"
                  />
                </AppTooltip>
              </div>
            </div>
          </div>

          <template v-if="children.length">
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">
                <FeatherIcon :name="childIcon" class="h-3.5 w-3.5" />
                {{ childLabel }}
              </div>
              <!-- Sort toggle: default is the tree's own order, but ranking
              by amount is usually more useful once there are more than a
              handful of rows (which one dominates, at a glance). -->
              <button
                class="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                @click="sortByAmount = !sortByAmount"
              >
                <FeatherIcon name="bar-chart-2" class="h-3.5 w-3.5" />
                {{ sortByAmount ? 'Sorted by amount' : 'Sort by amount' }}
              </button>
            </div>
            <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <table class="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-800">
                    <th class="border-b border-gray-200 px-4 py-2.5 text-left font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      {{ childLabel }}
                    </th>
                    <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      Share
                    </th>
                    <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      {{ showActuals ? 'Budget' : 'Total' }}
                    </th>
                    <th v-if="showActuals" class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      Actual
                    </th>
                    <th v-if="showActuals" class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      Util %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(child, i) in displayedChildren"
                    :key="child.name + i"
                    class="cursor-pointer border-t border-gray-100 transition odd:bg-white even:bg-gray-50/60 hover:bg-fc-blue-light/40 dark:border-gray-800 dark:odd:bg-transparent dark:even:bg-gray-800/30 dark:hover:bg-gray-800/70"
                    :class="{ 'cursor-default': !hasChildren(child) }"
                    @click="hasChildren(child) && drillInto(child)"
                  >
                    <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                      <span class="flex items-center gap-2">
                        <span class="h-2 w-2 flex-shrink-0 rounded-full" :style="{ backgroundColor: accentColor(childColorIndex(child)) }" />
                        {{ child.name }}
                        <FeatherIcon v-if="hasChildren(child)" name="chevron-right" class="h-3.5 w-3.5 text-gray-400" />
                      </span>
                    </td>
                    <td class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800">
                      <div class="flex items-center justify-end gap-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ sharePct(child) }}%</span>
                        <span class="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <span class="block h-full rounded-full" :style="{ width: sharePct(child) + '%', backgroundColor: accentColor(childColorIndex(child)) }" />
                        </span>
                      </div>
                    </td>
                    <td class="border-l border-gray-100 px-4 py-2.5 text-right font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100">
                      {{ formatAmount(total(child)) }}
                    </td>
                    <td v-if="showActuals" class="border-l border-gray-100 px-4 py-2.5 text-right font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100">
                      {{ formatAmount(actualTotal(child)) }}
                    </td>
                    <td v-if="showActuals" class="border-l border-gray-100 px-4 py-2.5 text-right dark:border-gray-800">
                      <span class="inline-flex items-center gap-1.5 font-medium" :style="{ color: utilizationColor(utilizationPct(child)) }">
                        {{ utilizationPct(child) }}%
                        <FeatherIcon
                          :name="utilizationPct(child) > 100 ? 'arrow-up-circle' : utilizationPct(child) >= 60 ? 'minus-circle' : 'arrow-down-circle'"
                          class="h-3.5 w-3.5"
                        />
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          <div v-else class="flex flex-col items-center gap-2 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            <FeatherIcon name="inbox" class="h-6 w-6 text-gray-300 dark:text-gray-600" />
            No further breakdown available.
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Button, Dialog, FeatherIcon, Switch } from 'frappe-ui'
import AppTooltip from '@/components/AppTooltip.vue'
import { accentColor, formatCr, formatINR, rowTotal } from '@/data/budgetTotals'
import { nodeActual, nodeBudget, treeTotal, utilizationColor, utilizationPct as utilPct } from '@/data/dashboardData'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // The head/sub-head/item row to start drilling down from.
  node: { type: Object, default: null },
  // Budget Summary's phase-sheet rows carry q1..q4 arrays (rowTotal reads
  // those); the dashboard's unit-wise/actuals rows instead carry a flat
  // `ytd` (and `total_posted_amt_ytd` for actuals) - this switches which
  // total function the modal uses without either caller needing to
  // reshape its data to match the other.
  totalMode: { type: String, default: 'quarters' }, // 'quarters' | 'ytd'
  // When true (only meaningful with totalMode: 'ytd'), also shows the
  // actual/utilization/variance columns alongside budget.
  showActuals: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function total(node) {
  return props.totalMode === 'ytd' ? treeTotal(node, nodeBudget) : rowTotal(node)
}
function actualTotal(node) {
  return treeTotal(node, nodeActual)
}
function utilizationPct(node) {
  return utilPct(node)
}
function varianceColor(node) {
  return total(node) - actualTotal(node) >= 0 ? '#1baf7a' : '#e34948'
}

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const showFullNumbers = ref(false)

function formatAmount(n) {
  return showFullNumbers.value ? formatINR(n) : formatCr(n)
}

// A navigation stack so drilling head -> sub-head -> item can jump back to
// ANY earlier level via the breadcrumb, not just step back one at a time.
const history = ref([])
const sortByAmount = ref(false)

watch(
  () => [props.modelValue, props.node],
  ([visible, node]) => {
    if (visible && node) {
      history.value = [node]
      sortByAmount.value = false
    }
  },
)

const current = computed(() => history.value[history.value.length - 1] || props.node)

function hasChildren(node) {
  return !!(node?.sub_heads?.length || node?.items?.length)
}

const children = computed(() => {
  const node = current.value
  if (!node) return []
  return node.sub_heads?.length ? node.sub_heads : node.items || []
})

// A child's own list index still drives its color even when the table's
// display order is re-sorted by amount, so a given row keeps the same
// color as the composition bar segment above it (built off the unsorted
// `children` list) instead of visually reassigning colors on every sort.
function childColorIndex(child) {
  return children.value.indexOf(child)
}

const displayedChildren = computed(() => {
  if (!sortByAmount.value) return children.value
  return [...children.value].sort((a, b) => total(b) - total(a))
})

const currentTotal = computed(() => children.value.reduce((sum, c) => sum + total(c), 0) || total(current.value))
function sharePct(child) {
  const denom = currentTotal.value
  return denom ? Math.round((total(child) / denom) * 1000) / 10 : 0
}

const isSubHeadLevel = computed(() => !!current.value?.sub_heads?.length)
const childLabel = computed(() => (isSubHeadLevel.value ? 'Sub Heads' : 'Line Items'))
const childIcon = computed(() => (isSubHeadLevel.value ? 'folder' : 'list'))
const levelIcon = computed(() => (history.value.length <= 1 ? 'layers' : isSubHeadLevel.value ? 'folder' : 'file-text'))

function drillInto(child) {
  if (!hasChildren(child)) return
  history.value.push(child)
  sortByAmount.value = false
}

function jumpTo(index) {
  history.value = history.value.slice(0, index + 1)
}

function drillBack() {
  if (history.value.length > 1) history.value = history.value.slice(0, -1)
}
</script>
