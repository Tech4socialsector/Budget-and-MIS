<template>
  <!-- `bare` skips this component's own grid wrapper and tooltip (just a
  <template> fragment of cards) so the cards can be dropped in as plain
  siblings inside a host's OWN grid (e.g. Work Plan Views' unified
  Grand-Total/Direct-Work/Grants/insights/chart row) and come out the same
  size as that grid's other cells, instead of being nested inside a second,
  independently-sized grid of their own. -->
  <template v-if="bare">
    <component
      :is="insight.onClick ? 'button' : 'div'"
      v-for="insight in insights"
      :key="insight.label"
      :title="insight.onClick ? 'Click to drill down' : undefined"
      class="insight-card flex h-full w-full items-start gap-3 rounded-lg border border-gray-200 bg-white text-left shadow-sm transition dark:border-gray-800 dark:bg-gray-900"
      :class="[compact ? 'p-2' : 'p-5', insight.onClick ? 'hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:hover:border-gray-700 active:translate-y-0' : '']"
      @click="insight.onClick?.()"
    >
      <span
        class="flex flex-shrink-0 items-center justify-center rounded-lg"
        :class="compact ? 'h-7 w-7' : 'h-9 w-9'"
        :style="{ backgroundColor: (insight.color || '#6b7280') + '1a', color: insight.color || '#6b7280' }"
      >
        <FeatherIcon :name="insight.icon || 'zap'" :class="compact ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'" />
      </span>
      <div class="min-w-0">
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ insight.label }}</div>
        <div class="insight-value truncate font-semibold text-gray-900 dark:text-gray-100" :class="compact ? 'mt-0.5 text-lg' : 'mt-1.5 text-2xl'" :title="insight.value">{{ insight.value }}</div>
        <div v-if="insight.detail" class="text-sm font-medium leading-snug text-gray-900 dark:text-gray-100" :class="compact ? 'mt-0.5' : 'mt-1.5'">{{ insight.detail }}</div>
      </div>
    </component>
  </template>
  <div v-else-if="insights.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <AppTooltip v-for="insight in insights" :key="insight.label" :text="insight.onClick ? 'Click to drill down' : ''" :disabled="!insight.onClick">
      <component
        :is="insight.onClick ? 'button' : 'div'"
        class="insight-card flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm transition dark:border-gray-800 dark:bg-gray-900"
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
          <div class="insight-value mt-1.5 truncate text-2xl font-semibold text-gray-900 dark:text-gray-100" :title="insight.value">{{ insight.value }}</div>
          <div v-if="insight.detail" class="mt-1.5 text-sm font-medium leading-snug text-gray-900 dark:text-gray-100">{{ insight.detail }}</div>
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
  // See the template comment above - renders cards with no tooltip/grid
  // wrapper so they can join a host's own grid as plain sibling cells.
  bare: { type: Boolean, default: false },
  // Tighter padding/spacing, matching NumberCard's own 'compact' size - for
  // when bare cards sit flush next to compact NumberCards in the same row.
  compact: { type: Boolean, default: false },
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
