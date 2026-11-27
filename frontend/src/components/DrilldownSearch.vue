<!--
  Search box shown above every drill-down table. Filters the rows of the
  level currently open across all of its columns (see matchesSearch in
  data/drilldownExport.js). v-model is the query string.
-->
<template>
  <div class="relative w-full sm:w-64">
    <FeatherIcon name="search" class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-7 text-sm text-gray-900 placeholder-gray-400 focus:border-fc-blue-mid focus:outline-none focus:ring-1 focus:ring-fc-blue-mid dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown.esc.stop="$emit('update:modelValue', '')"
    />
    <button
      v-if="modelValue"
      class="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
      title="Clear search"
      @click="$emit('update:modelValue', '')"
    >
      <FeatherIcon name="x" class="h-3.5 w-3.5" />
    </button>
  </div>
</template>

<script setup>
import { FeatherIcon } from 'frappe-ui'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search in this table…' },
})
defineEmits(['update:modelValue'])
</script>
