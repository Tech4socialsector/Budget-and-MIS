<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
    <div class="flex flex-col gap-4 lg:col-span-2">
      <!-- Grand total + head cards row -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <AppTooltip text="Click to drill down">
          <button
            class="w-full rounded-lg border-l-4 border-gray-900 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-gray-100 dark:bg-gray-900"
            @click="openDrilldown({ name: 'Grand Total', items: nonZeroHeads, sub_heads: [], q1: [], q2: [], q3: [], q4: [] })"
          >
            <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Grand Total Budget</div>
            <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(grandTotal) }}</div>
            <div class="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
              <span>{{ nonZeroHeads.length }} Expense Head{{ nonZeroHeads.length !== 1 ? 's' : '' }}</span>
              <span v-if="financialYear" class="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {{ financialYear }}
              </span>
            </div>
          </button>
        </AppTooltip>

        <AppTooltip v-for="(head, i) in nonZeroHeads" :key="head.name" text="Click to drill down">
          <button
            class="w-full rounded-lg border-l-4 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:bg-gray-900"
            :style="{ borderColor: accentColor(headIndex(head)) }"
            @click="openDrilldown(head)"
          >
            <div class="truncate text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300" :title="head.name">
              {{ head.name }}
            </div>
            <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(headTotal(head)) }}</div>
            <div class="mt-1 text-xs text-gray-400">{{ pctOfGrand(headTotal(head)) }}% of total</div>
          </button>
        </AppTooltip>
      </div>

      <!-- Sub-head breakdown, always shown for heads that have one -->
      <div v-for="head in headsWithSubTotals" :key="'group-' + head.name">
        <div class="mb-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide" :style="{ color: accentColor(headIndex(head)) }">
          {{ head.name }}
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AppTooltip v-for="sub in nonZeroSubHeads(head)" :key="sub.name" text="Click to drill down">
            <button
              class="w-full rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              @click="openDrilldown(sub)"
            >
              <div class="truncate text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300" :title="sub.name">{{ sub.name }}</div>
              <div class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(rowTotal(sub)) }}</div>
            </button>
          </AppTooltip>
        </div>
      </div>
    </div>

    <!-- Direct Work vs Grants & Donations -->
    <div class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div class="text-center text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">
        FY {{ financialYear }} — Grants &amp; Donations and Direct Work
      </div>
      <div class="relative mt-4 flex items-center justify-center">
        <svg viewBox="0 0 100 100" class="h-48 w-48 cursor-pointer">
          <path
            v-for="slice in pieSlices"
            :key="slice.key"
            :d="slice.path"
            :fill="slice.color"
            @click="openDrilldown(pieSliceNode(slice))"
          />
          <text
            v-for="slice in pieSlices"
            :key="'label-' + slice.key"
            :x="slice.labelPos.x"
            :y="slice.labelPos.y"
            text-anchor="middle"
            dominant-baseline="middle"
            class="fill-white font-semibold"
            :style="{ fontSize: pieLabelFontSize(slice.label) }"
          >
            {{ slice.label }}
          </text>
        </svg>
      </div>
      <div class="mt-2 text-center">
        <div class="text-xs uppercase tracking-wide text-gray-400">Total Budget</div>
        <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ formatAmount(grandTotal) }}</div>
      </div>
      <div class="mt-4 flex flex-col gap-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span class="h-2.5 w-2.5 rounded-sm" :style="{ backgroundColor: PIE_COLORS.direct }" />
            Direct Work
          </span>
          <span class="text-gray-500 dark:text-gray-400">{{ formatAmount(directAmount) }} · {{ directPct }}%</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span class="h-2.5 w-2.5 rounded-sm" :style="{ backgroundColor: PIE_COLORS.grants }" />
            Grants &amp; Donations
          </span>
          <span class="text-gray-500 dark:text-gray-400">{{ formatAmount(grantsAmount) }} · {{ grantPct }}%</span>
        </div>
      </div>
    </div>
  </div>

  <BudgetDrilldownModal v-model="drilldownOpen" :node="drilldownNode" />
</template>

<script setup>
import { computed, ref } from 'vue'
import AppTooltip from '@/components/AppTooltip.vue'
import BudgetDrilldownModal from '@/components/BudgetDrilldownModal.vue'

const props = defineProps({
  heads: { type: Array, required: true },
  financialYear: { type: String, default: '' },
  showFullNumbers: { type: Boolean, default: false },
})

// Fixed-order categorical palette (validated for CVD-safe adjacent
// separation - see the dataviz skill's reference palette). Never cycled
// past its own length; a further head would need an "Other" fold instead
// of wrapping back to slot 1, but this app only ever has 2-3 expense
// heads (Capital/Operating/Covid) so that's not a real scenario here.
const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948']
const CATEGORICAL_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']

// Matches the table's fixed blue/orange banner colors (BudgetSummaryTable.vue's
// .bg-banner / .bg-subbanner) exactly, so the pie and the table read as one
// consistent color language on the page - same values in both themes for
// the same reason those banner colors don't theme-swap either.
const PIE_COLORS = { direct: '#1e5fa8', grants: '#e8792a' }

function accentColor(i) {
  const isDark = document.documentElement.classList.contains('dark')
  const palette = isDark ? CATEGORICAL_DARK : CATEGORICAL
  return palette[i % palette.length]
}

const QUARTERS = ['q1', 'q2', 'q3', 'q4']

function quarterSum(arr) {
  return (arr || []).reduce((a, b) => a + (Number(b) || 0), 0)
}

function rowTotal(row) {
  return QUARTERS.reduce((sum, q) => sum + quarterSum(row?.[q]), 0)
}

function headTotal(head) {
  return rowTotal(head)
}

const grandTotal = computed(() => props.heads.reduce((t, h) => t + headTotal(h), 0))

const nonZeroHeads = computed(() => props.heads.filter((h) => headTotal(h) > 0))

function headIndex(head) {
  return props.heads.indexOf(head)
}

function nonZeroSubHeads(head) {
  return (head.sub_heads || []).filter((s) => rowTotal(s) > 0)
}

const headsWithSubTotals = computed(() => nonZeroHeads.value.filter((h) => nonZeroSubHeads(h).length))

function pctOfGrand(amount) {
  if (!grandTotal.value) return 0
  return Math.round((amount / grandTotal.value) * 100)
}

// Business rule from the original page: any item literally named
// "Grants & Donations", at head-item or sub-head-item level, is summed
// separately; everything else counts as "Direct Work".
const grantsAmount = computed(() => {
  let total = 0
  for (const head of props.heads) {
    for (const item of head.items || []) {
      if (item.name === 'Grants & Donations') total += rowTotal(item)
    }
    for (const sub of head.sub_heads || []) {
      for (const item of sub.items || []) {
        if (item.name === 'Grants & Donations') total += rowTotal(item)
      }
    }
  }
  return total
})

const directAmount = computed(() => grandTotal.value - grantsAmount.value)
const directPct = computed(() => (grandTotal.value > 0 ? Math.round((directAmount.value / grandTotal.value) * 100) : 0))
const grantPct = computed(() => (grandTotal.value > 0 ? Math.round((grantsAmount.value / grandTotal.value) * 100) : 0))

const drilldownOpen = ref(false)
const drilldownNode = ref(null)

function openDrilldown(node) {
  drilldownNode.value = node
  drilldownOpen.value = true
}

// Builds a synthetic drill-down node for a pie slice: "Grants & Donations"
// collects every item literally named that (see grantsAmount above);
// "Direct Work" is everything else, flattened from both head-level items
// and sub-head-level items so it drills straight to line items.
function pieSliceNode(slice) {
  const name = slice.key === 'grants' ? 'Grants & Donations' : 'Direct Work'
  const items = []
  for (const head of props.heads) {
    for (const item of head.items || []) {
      const isGrant = item.name === 'Grants & Donations'
      if ((slice.key === 'grants') === isGrant) items.push(item)
    }
    for (const sub of head.sub_heads || []) {
      for (const item of sub.items || []) {
        const isGrant = item.name === 'Grants & Donations'
        if ((slice.key === 'grants') === isGrant) items.push(item)
      }
    }
  }
  return { name, items, sub_heads: [], q1: [], q2: [], q3: [], q4: [] }
}

// Solid pie wedges (not a donut) drawn as SVG arc paths on a 100x100
// viewBox centered at (50,50) r=50, starting at 12 o'clock and going
// clockwise - the classic Chart.js pie look the original Desk page used.
function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function wedgePath(cx, cy, r, startAngle, endAngle) {
  if (endAngle - startAngle >= 359.999) {
    // A full circle can't be expressed as a single SVG arc (start === end
    // point); draw it as two half-circle arcs instead.
    const mid = polarPoint(cx, cy, r, startAngle + 180)
    const start = polarPoint(cx, cy, r, startAngle)
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${mid.x} ${mid.y} A ${r} ${r} 0 1 1 ${start.x} ${start.y} Z`
  }
  const start = polarPoint(cx, cy, r, startAngle)
  const end = polarPoint(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

const pieSlices = computed(() => {
  const total = grandTotal.value
  if (!total) return []
  const values = [
    { key: 'direct', value: directAmount.value, color: PIE_COLORS.direct, label: formatAmount(directAmount.value) },
    { key: 'grants', value: grantsAmount.value, color: PIE_COLORS.grants, label: formatAmount(grantsAmount.value) },
  ].filter((v) => v.value > 0)

  let angle = 0
  return values.map((v) => {
    const sweep = (v.value / total) * 360
    const path = wedgePath(50, 50, 50, angle, angle + sweep)
    const midAngle = angle + sweep / 2
    const labelPos = polarPoint(50, 50, 30, midAngle)
    angle += sweep
    return { key: v.key, path, color: v.color, label: v.label, labelPos }
  })
})

function formatINR(n) {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0)
}

function formatCr(n) {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format((n || 0) / 1e7) + ' Cr'
}

function formatAmount(n) {
  return props.showFullNumbers ? formatINR(n) : formatCr(n)
}

// Full-number labels ("₹32,86,14,89,394") are roughly 3x longer than Cr
// labels ("₹3,286 Cr") but share the same wedge width on the 100x100
// viewBox, so the font size has to shrink with label length to stay
// inside the wedge instead of overflowing it.
function pieLabelFontSize(label) {
  const len = (label || '').length
  if (len <= 10) return '7px'
  if (len <= 14) return '5px'
  return '4px'
}
</script>
