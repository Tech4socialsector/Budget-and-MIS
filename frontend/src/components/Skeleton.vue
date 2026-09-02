<template>
  <div class="animate-pulse rounded bg-gray-100 dark:bg-gray-800" :style="{ width, height }" />
</template>

<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
})
</script>
