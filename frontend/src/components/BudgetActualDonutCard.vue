<template>
  <component
    :is="clickable ? 'button' : 'div'"
    class="donut-card w-full text-left"
    :class="[large ? 'donut-card--grand' : small ? 'donut-card--small' : 'donut-card--head', clickable ? 'cursor-pointer' : '']"
    :style="themeVars"
    @click="clickable && $emit('click')"
  >
    <div class="dc-head">
      <span class="dc-icon" :style="{ backgroundColor: accentColor + '1a', color: accentColor }">
        <FeatherIcon :name="icon" class="dc-icon-svg" />
      </span>
      <div class="min-w-0">
        <div class="dc-title" :title="label">{{ label }}</div>
        <div v-if="subtitle" class="dc-subtitle">{{ subtitle }}</div>
      </div>
    </div>

    <div class="dc-body">
      <div class="dc-donut-wrap">
        <canvas ref="canvasEl" />
        <div class="dc-donut-center">
          <div class="dc-donut-pct" :style="{ color: utilColor }">{{ utilPct }}%</div>
          <div class="dc-donut-label">Utilised</div>
        </div>
      </div>

      <div class="dc-stats">
        <div class="dc-stat">
          <div class="dc-stat-top">
            <span class="dc-stat-icon" :style="{ backgroundColor: budgetColor + '1a', color: budgetColor }">
              <FeatherIcon name="database" class="dc-stat-icon-svg" />
            </span>
            <span class="dc-stat-label">Budget</span>
          </div>
          <div class="dc-stat-value">{{ budgetLabel }}</div>
        </div>
        <div class="dc-stat">
          <div class="dc-stat-top">
            <span class="dc-stat-icon" :style="{ backgroundColor: utilColor + '1a', color: utilColor }">
              <FeatherIcon name="bar-chart-2" class="dc-stat-icon-svg" />
            </span>
            <span class="dc-stat-label">Actual Spent</span>
          </div>
          <div class="dc-stat-value" :style="{ color: utilColor }">{{ actualLabel }}</div>
          <div class="dc-stat-detail">{{ utilPct }}% of budget</div>
        </div>
        <div class="dc-stat">
          <div class="dc-stat-top">
            <span class="dc-stat-icon" :style="{ backgroundColor: remainingColor + '1a', color: remainingColor }">
              <FeatherIcon name="credit-card" class="dc-stat-icon-svg" />
            </span>
            <span class="dc-stat-label">{{ varianceAmount >= 0 ? 'Remaining Budget' : 'Over Budget' }}</span>
          </div>
          <div class="dc-stat-value" :style="{ color: remainingColor }">{{ varianceLabel }}</div>
          <div class="dc-stat-detail">{{ remainingPct }}% of budget</div>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup>
// Donut + stat-tile summary card - used at all three tiers on the Budget vs
// Actuals page (Grand Total via `large`, Expense Heads at default size, Sub
// Heads via `small`) so every card on the page shares one visual language
// instead of Sub Heads using a different design. A 2-segment donut (Actual
// vs Remaining) is the dataviz skill's one legitimate donut use case
// ("part-to-whole at a glance only, <= 6 segments") - this is not the
// earlier-rejected multi-category comparison donut (that job stays with
// BudgetActualBarChart).
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { FeatherIcon } from 'frappe-ui'
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js'
import { currentTheme } from '@/data/theme'
import { CATEGORICAL, CATEGORICAL_DARK, isDarkMode } from '@/data/budgetTotals'

Chart.register(DoughnutController, ArcElement, Tooltip)

const props = defineProps({
  label: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'bar-chart-2' },
  budget: { type: Number, required: true },
  actual: { type: Number, required: true },
  large: { type: Boolean, default: false },
  // Sub Head cards render in a visibly smaller, denser tier beneath the
  // Expense Head cards - same donut+stats design, just scaled down, so
  // every tier on the page reads as one consistent card family instead of
  // Sub Heads using a different visual language (dual bars) than the rest.
  small: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false },
  formatAmount: { type: Function, required: true },
  utilizationColor: { type: Function, required: true },
})

defineEmits(['click'])

const budgetLabel = computed(() => props.formatAmount(props.budget))
const actualLabel = computed(() => props.formatAmount(props.actual))
const varianceAmount = computed(() => props.budget - props.actual)
const varianceLabel = computed(() => props.formatAmount(Math.abs(varianceAmount.value)))
const utilPct = computed(() => (props.budget ? Math.round((props.actual / props.budget) * 100) : 0))
const remainingPct = computed(() => Math.max(0, 100 - utilPct.value))
const utilColor = computed(() => props.utilizationColor(utilPct.value))
const budgetColor = computed(() => (isDarkMode() ? CATEGORICAL_DARK[0] : CATEGORICAL[0]))
// Remaining reads as a neutral/positive signal unless spend has actually
// crossed budget, in which case it shares the same severity color as Actual
// (both halves of one over-budget story), rather than inventing a 3rd hue.
const remainingColor = computed(() => (varianceAmount.value < 0 ? utilColor.value : budgetColor.value))

const themeVars = computed(() => (
  currentTheme.value === 'dark'
    ? {
        '--dc-card-bg': '#171717',
        '--dc-card-border': '#2e2e2e',
        '--dc-title-color': '#f5f5f5',
        '--dc-subtitle-color': '#9a9a9a',
        '--dc-stat-label-color': '#9a9a9a',
        '--dc-stat-detail-color': '#8a8a8a',
        '--dc-donut-track': '#2e2e2e',
      }
    : {
        '--dc-card-bg': '#fff',
        '--dc-card-border': '#e8e8e6',
        '--dc-title-color': '#111',
        '--dc-subtitle-color': '#8a8a8a',
        '--dc-stat-label-color': '#555',
        '--dc-stat-detail-color': '#8a8a8a',
        '--dc-donut-track': '#ececeb',
      }
))

const canvasEl = ref(null)
let chart = null

function buildChart() {
  const ctx = canvasEl.value?.getContext('2d')
  if (!ctx) return null
  const trackColor = isDarkMode() ? '#2e2e2e' : '#ececeb'
  const spentPct = Math.min(100, utilPct.value)
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Actual Spend', 'Remaining'],
      datasets: [
        {
          data: [spentPct, Math.max(0, 100 - spentPct)],
          backgroundColor: [utilColor.value, trackColor],
          borderColor: isDarkMode() ? '#171717' : '#fff',
          borderWidth: 2,
          borderRadius: 4,
          spacing: 2,
        },
      ],
    },
    options: {
      cutout: '72%',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (ctx2) => (ctx2.dataIndex === 0 ? ` Actual: ${actualLabel.value}` : ` Remaining: ${varianceLabel.value}`),
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

onMounted(() => nextTick(() => requestAnimationFrame(render)))
onBeforeUnmount(() => chart?.destroy())
watch(() => [props.budget, props.actual], () => nextTick(() => requestAnimationFrame(render)))
watch(currentTheme, () => nextTick(() => requestAnimationFrame(render)))
</script>

<style scoped>
/* Sizing throughout this file is rem, not px (px ÷ 16 at the original
16px-root values) - this component's font-sizes/padding/icon dimensions
otherwise sit outside index.css's OS/DPI-aware root font-size clamp()
entirely (that clamp only affects things sized in rem), so these donut
summary cards would stay pixel-fixed while every other rem-based element
on the page scales around them - the same bug index.css's own .fc-th/
.fc-td rules had before being converted the same way. */
.donut-card {
  background: var(--dc-card-bg, #fff);
  border: 1px solid var(--dc-card-border, #e8e8e6);
  border-radius: 0.5rem;
  padding: 0.5rem 0.625rem;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
}
.donut-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
.donut-card:active {
  transform: scale(0.995);
}
.donut-card--grand {
  padding: 0.625rem 0.75rem;
}
.donut-card--small {
  padding: 0.4375rem 0.5625rem;
}

.dc-head {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.dc-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.375rem;
  flex-shrink: 0;
}
.dc-icon-svg {
  width: 0.6875rem;
  height: 0.6875rem;
}
.donut-card--grand .dc-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.4375rem;
}
.donut-card--grand .dc-icon-svg {
  width: 0.8125rem;
  height: 0.8125rem;
}
.donut-card--small .dc-icon {
  width: 1.0625rem;
  height: 1.0625rem;
  border-radius: 0.3125rem;
}
.donut-card--small .dc-icon-svg {
  width: 0.5625rem;
  height: 0.5625rem;
}
.dc-title {
  font-size: 0.71875rem;
  font-weight: 700;
  color: var(--dc-title-color, #111);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.donut-card--grand .dc-title {
  font-size: 0.84375rem;
}
.donut-card--small .dc-title {
  font-size: 0.65625rem;
}
.dc-subtitle {
  font-size: 0.625rem;
  color: var(--dc-subtitle-color, #8a8a8a);
  margin-top: 0;
}

.dc-body {
  margin-top: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.dc-donut-wrap {
  position: relative;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
}
.donut-card--grand .dc-donut-wrap {
  width: 3.25rem;
  height: 3.25rem;
}
.donut-card--small .dc-donut-wrap {
  width: 2.125rem;
  height: 2.125rem;
}
.dc-donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.dc-donut-pct {
  font-size: 0.6875rem;
  font-weight: 700;
  font-variant-numeric: proportional-nums;
  line-height: 1.1;
}
.donut-card--grand .dc-donut-pct {
  font-size: 0.875rem;
}
.donut-card--small .dc-donut-pct {
  font-size: 0.5625rem;
}
.dc-donut-label {
  font-size: 0.5rem;
  color: var(--dc-stat-detail-color, #8a8a8a);
  margin-top: 0;
}
.donut-card--small .dc-donut-label {
  display: none;
}

.dc-stats {
  flex: 1;
  min-width: 8.75rem;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
.donut-card--grand .dc-stats {
  min-width: 13.75rem;
  gap: 0.625rem;
}
.donut-card--small .dc-stats {
  min-width: 0;
  gap: 0.375rem;
}
.dc-stat {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.dc-stat-top {
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  min-width: 0;
}
.dc-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0.9375rem;
  height: 0.9375rem;
  border-radius: 0.25rem;
  flex-shrink: 0;
}
.dc-stat-icon-svg {
  width: 0.5625rem;
  height: 0.5625rem;
}
.donut-card--small .dc-stat-icon {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 0.1875rem;
}
.donut-card--small .dc-stat-icon-svg {
  width: 0.4375rem;
  height: 0.4375rem;
}
.dc-stat-label {
  font-size: 0.78125rem;
  font-weight: 700;
  color: var(--dc-stat-label-color, #555);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.donut-card--grand .dc-stat-label {
  font-size: 0.875rem;
}
.donut-card--small .dc-stat-label {
  font-size: 0.625rem;
}
.dc-stat-value {
  margin-top: 0.0625rem;
  font-size: 0.78125rem;
  font-weight: 700;
  color: var(--dc-title-color, #111);
  font-variant-numeric: proportional-nums;
  line-height: 1.15;
}
.donut-card--grand .dc-stat-value {
  font-size: 0.9375rem;
}
.donut-card--small .dc-stat-value {
  font-size: 0.65625rem;
}
.dc-stat-detail {
  margin-top: 0;
  font-size: 0.5625rem;
  color: var(--dc-stat-detail-color, #8a8a8a);
  line-height: 1.2;
}
.donut-card--small .dc-stat-detail {
  display: none;
}

/* Phone widths: three stats side by side (plus the donut) no longer fit -
large "show full numbers" values (crore-scale, e.g. ₹55,15,69,77,475) overflow
a shared row no matter how it's split. Stack the body (donut above, stats
below as a column, each stat's value on its own line under its label) so
every value has the full card width to render in instead of colliding with
its neighbors or clipping off the right edge. */
@media (max-width: 480px) {
  .dc-body {
    flex-direction: column;
    align-items: stretch;
  }
  .dc-stats {
    flex-direction: column;
    width: 100%;
  }
  .dc-stat-value {
    white-space: normal;
    word-break: break-word;
  }
  .dc-stat-detail {
    display: none;
  }
}
</style>
