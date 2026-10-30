<template>
  <div class="bac-wrap" :style="themeVars">
    <div class="bac-header">
      <div class="bac-title">Budget vs. Actuals by Category</div>
      <div class="bac-legend">
        <span class="bac-legend-item"><span class="bac-legend-swatch" :style="{ backgroundColor: budgetColor }" />Budget</span>
        <span class="bac-legend-item"><span class="bac-legend-swatch" :style="{ backgroundColor: actualColor }" />Actuals</span>
      </div>
    </div>
    <div class="bac-canvas-wrap" :style="{ height: canvasHeight + 'px' }">
      <canvas ref="canvasEl" />
    </div>
  </div>
</template>

<script setup>
// Grouped horizontal bar: Budget vs Actuals, one pair of bars per category
// (head, or sub-head when a head has no non-zero sub-heads - same row list
// BudgetActualDoughnuts.vue used to receive). Replaces an earlier two-
// donut-chart design that compared the same two magnitudes as two separate
// pies the reader had to cross-reference slice by slice - the dataviz
// skill's own form table has no pie/donut entry for "compare magnitude,
// category vs category"; that job is bar/column. Horizontal (not vertical
// columns) because category names here (expense heads/sub-heads) run long
// and this app already uses horizontal bars for the same reason elsewhere.
//
// Color: Budget/Actual are 2 FIXED named series (never reordered, never
// re-keyed per category) - slots 1/2 of the app's own validated CATEGORICAL
// palette (budgetTotals.js), the same blue/orange pairing BudgetSummaryTable
// already uses for budget-vs-actual elsewhere in this app, so this chart
// speaks the same color language as the rest of the page instead of
// introducing its own 24-color rainbow (the donuts' own BUDGET_COLORS/
// ACTUAL_COLORS arrays, never run through the CVD validator).
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { currentTheme } from '@/data/theme'
import { CATEGORICAL, CATEGORICAL_DARK, isDarkMode } from '@/data/budgetTotals'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps({
  // rows: [{ label, budget, actual }] - raw numeric amounts, same shape
  // BudgetActualDoughnuts.vue's own `rows` prop used. An optional `node`
  // on each row is passed straight back via the `bar-click` emit so a
  // caller can drill down into whatever that row represents, without this
  // chart needing to know what a "node" is.
  rows: { type: Array, required: true },
  // formatAmount: (n) => string - the page's own Cr/full-number toggle
  // (formatCr/formatINR via showFullNumbers), reused here so a value shown
  // on this chart always matches what the KPI cards/table show for the
  // same figure, not a separately-formatted number.
  formatAmount: { type: Function, required: true },
})

const emit = defineEmits(['bar-click'])

const budgetColor = computed(() => (isDarkMode() ? CATEGORICAL_DARK[0] : CATEGORICAL[0]))
const actualColor = computed(() => (isDarkMode() ? CATEGORICAL_DARK[1] : CATEGORICAL[1]))

// Bound via :style as CSS custom properties rather than :global(.dark) CSS
// selectors - this codebase's Vite/Vue SFC compiler silently mis-compiles
// :global(...) combined with anything else in a <style scoped> block (the
// same bug already documented/worked around in AppSidebar.vue and
// BudgetActualDoughnuts.vue). ONLY used for real DOM elements (.bac-title/
// .bac-legend-item below) - CSS custom properties resolve automatically
// there. Chart.js's own options (scales.ticks.color, scales.border.color)
// draw straight onto the <canvas> via the Canvas 2D API, which does NOT
// understand `var(...)` - passing that string through would silently
// render as black (or simply fail to parse) regardless of theme, so those
// read the plain resolved hex from chartThemeColors below instead.
const themeVars = computed(() => (
  currentTheme.value === 'dark'
    ? { '--bac-title-color': '#c0c0c0', '--bac-legend-color': '#aaa' }
    : { '--bac-title-color': '#444', '--bac-legend-color': '#555' }
))
const chartThemeColors = computed(() => (
  currentTheme.value === 'dark'
    ? { grid: 'rgba(255,255,255,0.08)', tick: '#9ca3af' }
    : { grid: 'rgba(0,0,0,0.06)', tick: '#6b7280' }
))

const canvasEl = ref(null)
let chart = null

// Horizontal bars grow taller with more categories (each pair needs real
// room so the 24px-max bar spec + surface gap don't get crushed) - capped
// so a long list scrolls its own canvas rather than the chart shrinking
// bars down to illegible slivers.
const canvasHeight = computed(() => Math.min(560, Math.max(220, props.rows.length * 52)))

function buildChart() {
  const ctx = canvasEl.value?.getContext('2d')
  if (!ctx) return null

  const labels = props.rows.map((r) => r.label)
  const budgets = props.rows.map((r) => r.budget)
  const actuals = props.rows.map((r) => r.actual)
  const fmt = props.formatAmount
  const { grid: gridColor, tick: tickColor } = chartThemeColors.value

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Budget',
          data: budgets,
          backgroundColor: budgetColor.value,
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 22,
          categoryPercentage: 0.7,
          barPercentage: 0.92,
        },
        {
          label: 'Actuals',
          data: actuals,
          backgroundColor: actualColor.value,
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 22,
          categoryPercentage: 0.7,
          barPercentage: 0.92,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      onHover: (event, elements) => {
        event.native.target.style.cursor = elements.length ? 'pointer' : 'default'
      },
      onClick: (event, elements) => {
        if (!elements.length) return
        const row = props.rows[elements[0].index]
        if (row) emit('bar-click', row)
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0)' },
          border: { color: gridColor },
          ticks: {
            color: tickColor,
            font: { size: 11 },
            callback: (v) => fmt(v),
          },
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: tickColor, font: { size: 11 } },
        },
      },
      plugins: {
        legend: { display: false }, // custom legend in the template header
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: true,
          callbacks: {
            title: (items) => items[0]?.label || '',
            label: (ctx2) => ` ${ctx2.dataset.label}: ${fmt(ctx2.parsed.x)}`,
          },
        },
      },
    },
  })
}

function render() {
  chart?.destroy()
  chart = buildChart()
}

onMounted(() => {
  nextTick(() => requestAnimationFrame(render))
})
onBeforeUnmount(() => {
  chart?.destroy()
})
watch(() => props.rows, () => nextTick(() => requestAnimationFrame(render)), { deep: true })
watch(currentTheme, () => nextTick(() => requestAnimationFrame(render)))
</script>

<style scoped>
/* rem, not px (px ÷ 16 at the original 16px-root values) - see
BudgetActualDonutCard.vue's own style-block comment for why. */
.bac-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.875rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.bac-title {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--bac-title-color, #444);
  text-transform: uppercase;
  letter-spacing: 0.0375rem;
}
.bac-legend {
  display: flex;
  gap: 1rem;
}
.bac-legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--bac-legend-color, #555);
}
.bac-legend-swatch {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 0.1875rem;
  flex-shrink: 0;
}
.bac-canvas-wrap {
  width: 100%;
  position: relative;
}
</style>
