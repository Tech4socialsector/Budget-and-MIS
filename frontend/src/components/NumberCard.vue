<template>
  <AppTooltip :text="clickable ? 'Click to drill down' : ''" :disabled="!clickable">
    <component
      :is="clickable ? 'button' : 'div'"
      class="w-full rounded-lg border border-gray-200 bg-white text-left shadow-sm transition dark:border-gray-800 dark:bg-gray-900"
      :class="[sizeClasses.padding, clickable ? 'hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:hover:border-gray-700' : '']"
      @click="clickable && $emit('click')"
    >
      <div class="flex items-center gap-1.5">
        <span v-if="accentColor" class="h-2 w-2 flex-shrink-0 rounded-full" :style="{ backgroundColor: tintColor }" />
        <div
          class="font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
          :class="[sizeClasses.label, size === 'sm' ? 'line-clamp-2' : 'truncate']"
          :title="label"
        >
          {{ label }}
        </div>
      </div>

      <div class="font-semibold text-gray-900 dark:text-gray-100" :class="sizeClasses.value">
        {{ value }}
      </div>

      <div v-if="$slots.default" :class="sizeClasses.detailGap">
        <slot />
      </div>
    </component>
  </AppTooltip>
</template>

<script setup>
import { computed } from 'vue'
import AppTooltip from '@/components/AppTooltip.vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  // 'lg' - grand totals, 'md' - category/head totals, 'sm' - sub-head/item totals.
  size: { type: String, default: 'md' },
  // Kept for callers (icon names from the previous design) but no longer
  // rendered - the simplified card uses only the color dot below for
  // identity, not an icon.
  icon: { type: String, default: '' },
  // Color for the small identity dot; omit or pass 'neutral' for a gray/ink
  // tint (e.g. a "Grand Total" card not tied to one category). Omit
  // entirely (falsy, no 'neutral') to suppress the dot altogether.
  accentColor: { type: String, default: '' },
  clickable: { type: Boolean, default: false },
})

defineEmits(['click'])

const SIZE_CLASSES = {
  lg: { padding: 'p-4', label: 'text-xs', value: 'mt-1.5 text-2xl', detailGap: 'mt-1.5' },
  md: { padding: 'p-4', label: 'text-xs', value: 'mt-1.5 text-2xl', detailGap: 'mt-1' },
  sm: { padding: 'p-3', label: 'text-[0.6875rem]', value: 'mt-1 text-sm', detailGap: 'mt-1' },
}

const sizeClasses = computed(() => SIZE_CLASSES[props.size] || SIZE_CLASSES.md)

const tintColor = computed(() => {
  if (!props.accentColor || props.accentColor === 'neutral') return '#6b7280'
  return props.accentColor
})
</script>
