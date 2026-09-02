<template>
  <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4 dark:border-gray-800">
    <div class="min-w-0">
      <slot name="title" />
      <p v-if="description" class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{{ description }}</p>
    </div>
    <div class="flex flex-shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({ description: { type: String, default: '' } })
</script>
