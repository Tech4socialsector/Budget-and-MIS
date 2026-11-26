<template>
  <div class="flex flex-col items-center justify-center gap-3 py-10">
    <div class="app-loader-ring relative flex h-24 w-24 items-center justify-center">
      <span class="app-loader-ring-spin absolute inset-0 rounded-full border-[3px] border-transparent border-t-gray-900 dark:border-t-gray-100" />
      <img :src="logo" alt="" class="h-14 w-14 rounded-lg object-contain" />
    </div>
    <div v-if="label" class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { brandingResource, defaultAppIcon } from '@/data/branding'

defineProps({
  label: { type: String, default: '' },
})

// The square icon mark, not the full logo+wordmark - see defaultAppIcon's
// own comment in branding.js for why this loader's dark-mode-capable card
// needs the icon-only asset. Master Settings only stores one app_logo
// (the full lockup), so an admin-configured logo still falls back to the
// icon mark rather than squeezing the wordmark into this square slot.
const logo = computed(() => defaultAppIcon)
</script>

<style scoped>
.app-loader-ring-spin {
  animation: app-loader-spin 0.9s linear infinite;
}

@keyframes app-loader-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
