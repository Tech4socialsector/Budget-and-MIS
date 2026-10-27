<template>
  <div class="flex flex-col gap-3.5 lg:flex-row" :style="themeVars">
    <div class="doughnut-card">
      <div class="doughnut-title">Budget Breakdown</div>
      <div class="doughnut-canvas-wrap"><canvas ref="budgetCanvasEl" /></div>
      <div class="doughnut-legend">
        <div v-for="(row, i) in budgetLegend" :key="row.label" class="doughnut-legend-item">
          <span class="doughnut-legend-dot" :style="{ backgroundColor: BUDGET_COLORS[i % BUDGET_COLORS.length] }" />
          <span class="doughnut-legend-name" :title="row.label">{{ row.label }}</span>
          <span class="doughnut-legend-pct">{{ row.pct }}%</span>
        </div>
      </div>
    </div>
    <div class="doughnut-card">
      <div class="doughnut-title">Actuals Breakdown</div>
      <div class="doughnut-canvas-wrap"><canvas ref="actualCanvasEl" /></div>
      <div class="doughnut-legend">
        <div v-for="(row, i) in actualLegend" :key="row.label" class="doughnut-legend-item">
          <span class="doughnut-legend-dot" :style="{ backgroundColor: ACTUAL_COLORS[i % ACTUAL_COLORS.length] }" />
          <span class="doughnut-legend-name" :title="row.label">{{ row.label }}</span>
          <span class="doughnut-legend-pct">{{ row.pct }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Port of the Desk page's own chart design (budget_actuals_phase.js, live
// revision at its own on_page_load) - two side-by-side Chart.js doughnuts,
// same exact palettes/cutout/labels/tooltip/legend, so this page visually
// matches what Desk users already know instead of introducing a different
// chart language in the Vue frontend. Per the user's explicit choice, this
// replaces the grouped bar chart that stood here (and runs counter to the
// dataviz skill's own "donut for comparing close values" anti-pattern) -
// an intentional exception to match the Desk reference exactly.
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js'
import { currentTheme } from '@/data/theme'

Chart.register(DoughnutController, ArcElement, Tooltip)

const props = defineProps({
  // rows: [{ label, budget, actual }] - raw numeric amounts, one per
  // sub-head (or head, when a head has no non-zero sub-heads) - same shape
  // the Desk page flattens expense_heads into before building its labels.
  rows: { type: Array, required: true },
})

// Bound via :style as CSS custom properties rather than :global(.dark) CSS
// selectors - this codebase's Vite/Vue SFC compiler silently mis-compiles
// :global(...) combined with anything else in a <style scoped> block (the
// same bug already documented and worked around in AppSidebar.vue). Driving
// the dark-mode colors from this computed sidesteps the compiler bug
// entirely since no :global() selector is involved at all.
const themeVars = computed(() => (
  currentTheme.value === 'dark'
    ? { '--doughnut-title-color': '#c0c0c0', '--doughnut-legend-color': '#aaa', '--doughnut-pct-color': '#e5e5e5' }
    : { '--doughnut-title-color': '#444', '--doughnut-legend-color': '#555', '--doughnut-pct-color': '#222' }
))

const BUDGET_COLORS = ['#4361EE', '#3A0CA3', '#7209B7', '#F72585', '#4CC9F0', '#4895EF', '#560BAD', '#B5179E', '#3F37C9', '#480CA8', '#6A0572', '#D62828']
const ACTUAL_COLORS = ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#F4A261', '#E76F51', '#E9C46A', '#264653', '#2A9D8F', '#8AB17D', '#BABB74', '#E07A5F']

const budgetCanvasEl = ref(null)
const actualCanvasEl = ref(null)
let budgetChart = null
let actualChart = null

const budgetLegend = ref([])
const actualLegend = ref([])

function toLegend(values, labels) {
  const total = values.reduce((a, b) => a + b, 0)
  return labels.map((label, i) => ({
    label,
    pct: total ? Math.round((values[i] / total) * 100) : 0,
  }))
}

// Bold white in-slice percentage label on any slice holding >= 4% of its
// chart's total - the same threshold the Desk page uses to avoid crowding
// slivers with unreadable text (anti-patterns: a label that can't fit
// drops out rather than clipping).
const pctPlugin = {
  id: 'pctLabels',
  afterDatasetDraw(chart) {
    const { ctx, data } = chart
    const ds = data.datasets[0]
    const total = ds.data.reduce((a, b) => a + b, 0)
    if (!total) return
    const meta = chart.getDatasetMeta(0)
    ctx.save()
    meta.data.forEach((arc, i) => {
      const p = Math.round((ds.data[i] / total) * 100)
      if (p < 4) return
      const { x, y } = arc.tooltipPosition()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p + '%', x, y)
    })
    ctx.restore()
  },
}

function makeDoughnut(canvasEl, values, colors) {
  const ctx = canvasEl?.getContext('2d')
  if (!ctx) return null
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: props.rows.map((r) => r.label),
      datasets: [{ data: values, backgroundColor: colors, borderColor: '#fff', borderWidth: 2, hoverOffset: 10 }],
    },
    options: {
      responsive: false,
      cutout: '50%',
      animation: { animateRotate: true, duration: 600 },
      layout: { padding: 10 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: true,
          position: 'average',
          callbacks: {
            title: (items) => items[0]?.label || '',
            label: (ctx2) => {
              const total = ctx2.dataset.data.reduce((a, b) => a + b, 0)
              const p = total ? Math.round((ctx2.parsed / total) * 100) : 0
              return ` ₹${ctx2.parsed.toLocaleString('en-IN')}  (${p}%)`
            },
          },
        },
      },
    },
    plugins: [pctPlugin],
  })
}

function render() {
  const labels = props.rows.map((r) => r.label)
  const budgets = props.rows.map((r) => r.budget)
  const actuals = props.rows.map((r) => r.actual)
  const budgetColors = labels.map((_, i) => BUDGET_COLORS[i % BUDGET_COLORS.length])
  const actualColors = labels.map((_, i) => ACTUAL_COLORS[i % ACTUAL_COLORS.length])

  budgetChart?.destroy()
  actualChart?.destroy()
  budgetChart = makeDoughnut(budgetCanvasEl.value, budgets, budgetColors)
  actualChart = makeDoughnut(actualCanvasEl.value, actuals, actualColors)

  budgetLegend.value = toLegend(budgets, labels)
  actualLegend.value = toLegend(actuals, labels)
}

onMounted(() => {
  nextTick(() => requestAnimationFrame(() => requestAnimationFrame(render)))
})
onBeforeUnmount(() => {
  budgetChart?.destroy()
  actualChart?.destroy()
})
watch(() => props.rows, () => nextTick(() => requestAnimationFrame(() => requestAnimationFrame(render))), { deep: true })
</script>

<style scoped>
.doughnut-card {
  flex: 1;
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: auto 1fr;
  column-gap: 16px;
}
.doughnut-title {
  grid-column: 1 / -1;
  font-size: 11px;
  font-weight: 700;
  color: var(--doughnut-title-color, #444);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 10px;
}
.doughnut-canvas-wrap {
  width: 220px;
  height: 220px;
}
.doughnut-canvas-wrap canvas {
  width: 220px !important;
  height: 220px !important;
}
@media (max-width: 1280px) {
  .doughnut-canvas-wrap,
  .doughnut-canvas-wrap canvas {
    width: 200px !important;
    height: 200px !important;
  }
}
@media (max-width: 1024px) {
  .doughnut-canvas-wrap,
  .doughnut-canvas-wrap canvas {
    width: 180px !important;
    height: 180px !important;
  }
}
@media (max-width: 768px) {
  .doughnut-canvas-wrap {
    width: 100% !important;
    height: 200px !important;
  }
  .doughnut-canvas-wrap canvas {
    width: 100% !important;
    height: 200px !important;
  }
}
.doughnut-legend {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-self: center;
  min-width: 0;
}
.doughnut-legend-item {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--doughnut-legend-color, #555);
}
.doughnut-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}
.doughnut-legend-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.doughnut-legend-pct {
  font-weight: 700;
  color: var(--doughnut-pct-color, #222);
  min-width: 36px;
  text-align: right;
}
</style>
