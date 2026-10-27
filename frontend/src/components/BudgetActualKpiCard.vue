<template>
  <component
    :is="clickable ? 'button' : 'div'"
    class="kpi-card w-full text-left"
    :class="[large ? 'kpi-card--grand' : 'kpi-card--head', clickable ? 'cursor-pointer' : '']"
    :style="{ borderLeftColor: accentColor, ...themeVars }"
    @click="clickable && $emit('click')"
  >
    <div class="kpi-title" :title="label">{{ label }}</div>

    <div class="kpi-row">
      <div class="kpi-block">
        <div class="kpi-label">Budget</div>
        <div class="kpi-value">{{ budgetLabel }}</div>
      </div>
      <div class="kpi-block kpi-block--right">
        <div class="kpi-label">Actual</div>
        <div class="kpi-value">{{ actualLabel }}</div>
      </div>
    </div>

    <div class="kpi-bottom">
      <div class="kpi-block">
        <div class="kpi-label">Variance</div>
        <div class="kpi-value">{{ varianceLabel }}</div>
      </div>
      <div class="kpi-block kpi-block--right">
        <div class="kpi-label">Util %</div>
        <div class="kpi-value" :style="{ color: utilColor }">{{ utilPct }}%</div>
      </div>
    </div>

    <div class="util-bar-wrap">
      <div class="util-bar-bg">
        <div class="util-bar" :style="{ width: Math.min(utilPct, 100) + '%', backgroundColor: utilColor }" />
      </div>
    </div>
  </component>
</template>

<script setup>
// Ports the Desk page's own KPI card design exactly (budget_actuals_phase.js,
// live revision: .number-card / .grand-total-summary-card, buildCard()) -
// a left accent border (not a dot), a Budget/Actual row, a Variance/Util %
// row with a divider, and a utilization progress bar - so this page's cards
// match what Desk users already know. Colors come from this app's own
// validated accentColor()/utilizationColor() helpers rather than Desk's raw
// PALETTE/utilColor literals, keeping one consistent color language with
// every other chart/card on this page (same accent set the doughnuts and
// other NumberCards already use) while matching Desk's layout precisely.
import { computed } from 'vue'
import { currentTheme } from '@/data/theme'

const props = defineProps({
  label: { type: String, required: true },
  budget: { type: Number, required: true },
  actual: { type: Number, required: true },
  accentColor: { type: String, default: '#6b7280' },
  // Grand Total card renders slightly larger/bolder, matching Desk's
  // separate .grand-total-summary-card treatment vs the regular .number-card.
  large: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false },
  formatAmount: { type: Function, required: true },
  utilizationColor: { type: Function, required: true },
})

defineEmits(['click'])

const budgetLabel = computed(() => props.formatAmount(props.budget))
const actualLabel = computed(() => props.formatAmount(props.actual))
const varianceLabel = computed(() => props.formatAmount(props.budget - props.actual))
const utilPct = computed(() => (props.budget ? Math.round((props.actual / props.budget) * 100) : 0))
const utilColor = computed(() => props.utilizationColor(utilPct.value))

// Bound via :style as CSS custom properties rather than :global(.dark) CSS
// selectors - this codebase's Vite/Vue SFC compiler silently mis-compiles
// :global(...) combined with anything else in a <style scoped> block (the
// same bug already documented and worked around in AppSidebar.vue and
// BudgetActualDoughnuts.vue). Driving dark-mode colors from this computed
// sidesteps the compiler bug entirely since no :global() selector is used.
const themeVars = computed(() => (
  currentTheme.value === 'dark'
    ? {
        '--kpi-card-bg': '#171717',
        '--kpi-card-border': '#2e2e2e',
        '--kpi-title-color': '#a3a3a3',
        '--kpi-divider-color': '#2e2e2e',
        '--kpi-value-color': '#f5f5f5',
        '--kpi-bar-track': '#2a2a2a',
      }
    : {
        '--kpi-card-bg': '#fff',
        '--kpi-card-border': '#e0e0e0',
        '--kpi-title-color': '#555',
        '--kpi-divider-color': '#f0f0f0',
        '--kpi-value-color': '#111',
        '--kpi-bar-track': '#f0f0ed',
      }
))
</script>

<style scoped>
.kpi-card {
  background: var(--kpi-card-bg, #fff);
  border: 1px solid var(--kpi-card-border, #e0e0e0);
  border-left-width: 3px;
  border-left-style: solid;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.15s ease;
}
.kpi-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}
.kpi-card--grand {
  border-left-width: 4px;
}

.kpi-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--kpi-title-color, #555);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  min-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kpi-row {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}
.kpi-bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 7px;
  border-top: 1px solid var(--kpi-divider-color, #f0f0f0);
}
.kpi-block {
  text-align: left;
}
.kpi-block--right {
  text-align: right;
}
.kpi-label {
  font-size: 10px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.kpi-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--kpi-value-color, #111);
}
.kpi-card--grand .kpi-value {
  font-size: 16px;
}

.util-bar-wrap {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--kpi-divider-color, #f0f0f0);
}
.util-bar-bg {
  width: 100%;
  height: 4px;
  background: var(--kpi-bar-track, #f0f0ed);
  border-radius: 2px;
  overflow: hidden;
}
.util-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}
</style>
