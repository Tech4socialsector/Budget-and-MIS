<template>
  <div v-if="insights.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <AppTooltip v-for="insight in insights" :key="insight.label" :text="insight.onClick ? 'Click to drill down' : ''" :disabled="!insight.onClick">
      <component
        :is="insight.onClick ? 'button' : 'div'"
        class="insight-card flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition dark:border-gray-800 dark:bg-gray-900"
        :class="insight.onClick ? 'hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:hover:border-gray-700 active:translate-y-0' : ''"
        @click="insight.onClick?.()"
      >
        <span
          class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          :style="{ backgroundColor: (insight.color || '#6b7280') + '1a', color: insight.color || '#6b7280' }"
        >
          <FeatherIcon :name="insight.icon || 'zap'" class="h-4.5 w-4.5" />
        </span>
        <div class="min-w-0">
          <!-- Sentence case, not uppercase-tracking - per the dataviz
          skill's own stat-tile contract (label: sentence case, no trailing
          colon); uppercase-tracked small caps read as chart/axis furniture,
          not a card's own title. -->
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ insight.label }}</div>
          <!-- Proportional (not tabular) numerals at display size - this is
          a standalone hero-style value, not a column of numbers that must
          align vertically. -->
          <div class="insight-value mt-0.5 truncate text-base font-semibold text-gray-900 dark:text-gray-100" :title="insight.value">{{ insight.value }}</div>
          <div v-if="insight.detail" class="mt-1 text-xs leading-snug text-gray-400">{{ insight.detail }}</div>
        </div>
      </component>
    </AppTooltip>
  </div>
</template>

<script setup>
import { FeatherIcon } from 'frappe-ui'
import AppTooltip from '@/components/AppTooltip.vue'

defineProps({
  // [{ label, value, detail?, icon?, color?, onClick? }]
  insights: { type: Array, default: () => [] },
})
</script>

<style scoped>
.insight-card {
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
}
.insight-value {
  font-variant-numeric: proportional-nums;
}
</style>
