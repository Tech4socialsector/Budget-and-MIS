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
.donut-card {
  background: var(--dc-card-bg, #fff);
  border: 1px solid var(--dc-card-border, #e8e8e6);
  border-radius: 8px;
  padding: 8px 10px;
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
  padding: 10px 12px;
}
.donut-card--small {
  padding: 7px 9px;
}

.dc-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.dc-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  flex-shrink: 0;
}
.dc-icon-svg {
  width: 11px;
  height: 11px;
}
.donut-card--grand .dc-icon {
  width: 24px;
  height: 24px;
  border-radius: 7px;
}
.donut-card--grand .dc-icon-svg {
  width: 13px;
  height: 13px;
}
.donut-card--small .dc-icon {
  width: 17px;
  height: 17px;
  border-radius: 5px;
}
.donut-card--small .dc-icon-svg {
  width: 9px;
  height: 9px;
}
.dc-title {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--dc-title-color, #111);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.donut-card--grand .dc-title {
  font-size: 13.5px;
}
.donut-card--small .dc-title {
  font-size: 10.5px;
}
.dc-subtitle {
  font-size: 10px;
  color: var(--dc-subtitle-color, #8a8a8a);
  margin-top: 0;
}

.dc-body {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.dc-donut-wrap {
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
}
.donut-card--grand .dc-donut-wrap {
  width: 64px;
  height: 64px;
}
.donut-card--small .dc-donut-wrap {
  width: 40px;
  height: 40px;
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
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: proportional-nums;
  line-height: 1.1;
}
.donut-card--grand .dc-donut-pct {
  font-size: 17px;
}
.donut-card--small .dc-donut-pct {
  font-size: 10.5px;
}
.dc-donut-label {
  font-size: 8px;
  color: var(--dc-stat-detail-color, #8a8a8a);
  margin-top: 0;
}
.donut-card--small .dc-donut-label {
  display: none;
}

.dc-stats {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: row;
  gap: 8px;
}
.donut-card--grand .dc-stats {
  min-width: 220px;
  gap: 10px;
}
.donut-card--small .dc-stats {
  min-width: 0;
  gap: 6px;
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
  gap: 5px;
  min-width: 0;
}
.dc-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 4px;
  flex-shrink: 0;
}
.dc-stat-icon-svg {
  width: 9px;
  height: 9px;
}
.donut-card--small .dc-stat-icon {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
.donut-card--small .dc-stat-icon-svg {
  width: 7px;
  height: 7px;
}
.dc-stat-label {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--dc-stat-label-color, #555);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.donut-card--grand .dc-stat-label {
  font-size: 14px;
}
.donut-card--small .dc-stat-label {
  font-size: 10px;
}
.dc-stat-value {
  margin-top: 1px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--dc-title-color, #111);
  font-variant-numeric: proportional-nums;
  line-height: 1.15;
}
.donut-card--grand .dc-stat-value {
  font-size: 15px;
}
.donut-card--small .dc-stat-value {
  font-size: 10.5px;
}
.dc-stat-detail {
  margin-top: 0;
  font-size: 9px;
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
