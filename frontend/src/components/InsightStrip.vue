<template>
  <div v-if="insights.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <AppTooltip v-for="insight in insights" :key="insight.label" :text="insight.onClick ? 'Click to drill down' : ''" :disabled="!insight.onClick">
      <component
        :is="insight.onClick ? 'button' : 'div'"
        class="flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-3.5 text-left dark:border-gray-800 dark:bg-gray-900"
        :class="insight.onClick ? 'transition hover:shadow-md' : ''"
        @click="insight.onClick?.()"
      >
        <span
          class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          :style="{ backgroundColor: (insight.color || '#6b7280') + '1a', color: insight.color || '#6b7280' }"
        >
          <FeatherIcon :name="insight.icon || 'zap'" class="h-4 w-4" />
        </span>
        <div class="min-w-0">
          <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">{{ insight.label }}</div>
          <div class="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-gray-100" :title="insight.value">{{ insight.value }}</div>
          <div v-if="insight.detail" class="mt-0.5 text-xs text-gray-400">{{ insight.detail }}</div>
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
