<template>
  <div class="flex flex-col items-center justify-center gap-4 py-12">
    <!-- fetch: the logo itself breathes in place - reading/loading data is
    passive waiting, nothing "moves" on screen yet. -->
    <img
      v-if="variant === 'fetch'"
      :src="logo"
      alt=""
      class="app-loader-pulse h-14 max-w-[9rem] object-contain"
    />

    <!-- export: the logo sits inside a tray and a chevron drops into it on
    loop - a download motion, since this variant is for "generating a file
    you're about to receive," not just reading data back. -->
    <div v-else-if="variant === 'export'" class="app-loader-export relative flex h-16 w-16 items-center justify-center">
      <img :src="logo" alt="" class="h-10 max-w-[7rem] object-contain" />
      <svg class="app-loader-export-chevron absolute" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 4v12" />
        <path d="M6 12l6 6 6-6" />
      </svg>
      <div class="app-loader-export-tray absolute bottom-0 h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
    </div>

    <!-- build: the logo stays put while a progress bar underneath fills and
    loops - for a multi-step/multi-sheet assembly (PPT, consolidated
    metrics) rather than a single fetch, so the metaphor is "assembling
    pieces," not "waiting for a response." -->
    <div v-else-if="variant === 'build'" class="flex flex-col items-center gap-3">
      <img :src="logo" alt="" class="h-14 max-w-[9rem] object-contain" />
      <div class="h-1 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div class="app-loader-build-bar h-full w-1/3 rounded-full bg-gray-500 dark:bg-gray-400" />
      </div>
    </div>

    <div v-if="variant !== 'export'" class="flex items-center gap-1.5">
      <span v-for="i in 3" :key="i" class="app-loader-dot h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" :style="{ animationDelay: `${(i - 1) * 0.15}s` }" />
    </div>

    <div v-if="label" class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { brandingResource, defaultAppIcon } from '@/data/branding'

defineProps({
  label: { type: String, default: '' },
  // 'fetch' - reading/loading data (reports, dashboards, tables); 'export' -
  // generating a file the user is about to download; 'build' - assembling a
  // multi-step/multi-sheet report (PPT, consolidated metrics) that takes
  // noticeably longer than a single fetch.
  variant: { type: String, default: 'fetch' },
})

// defaultAppIcon is itself already a computed (theme-aware light/dark
// lockup, see branding.js) - re-wrapping it here would nest one computed's
// .value inside another's, so this just mirrors its reactivity instead of
// wrapping it, same fallback precedence every other logo spot uses.
const logo = computed(() => brandingResource.data?.app_logo || defaultAppIcon.value)
</script>

<style scoped>
/* fetch - a breathing/pulsing logo reads as "working" without needing a
spinner shape to fit around a wide, non-square wordmark. */
.app-loader-pulse {
  animation: app-loader-pulse 1.8s ease-in-out infinite;
}

@keyframes app-loader-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

.app-loader-dot {
  animation: app-loader-dot-bounce 1s ease-in-out infinite;
}

@keyframes app-loader-dot-bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* export - a chevron drops from the logo down onto a "tray" baseline, then
resets - the classic download-icon motion, looped. */
.app-loader-export-chevron {
  color: var(--text-ink-gray-6, #6b7280);
  animation: app-loader-export-drop 1.4s ease-in-out infinite;
}

@keyframes app-loader-export-drop {
  0% {
    transform: translateY(-14px);
    opacity: 0;
  }
  35% {
    opacity: 1;
  }
  65% {
    transform: translateY(10px);
    opacity: 1;
  }
  85%, 100% {
    transform: translateY(10px);
    opacity: 0;
  }
}

.app-loader-export-tray {
  animation: app-loader-export-tray-flash 1.4s ease-in-out infinite;
}

@keyframes app-loader-export-tray-flash {
  0%, 55% {
    opacity: 0.5;
  }
  65%, 80% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

/* build - a bar sweeps left-to-right inside its track, looping - suggests
ongoing assembly rather than a determinate percentage. */
.app-loader-build-bar {
  animation: app-loader-build-sweep 1.3s ease-in-out infinite;
}

@keyframes app-loader-build-sweep {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(300%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-loader-pulse,
  .app-loader-dot,
  .app-loader-export-chevron,
  .app-loader-export-tray,
  .app-loader-build-bar {
    animation: none;
  }
}
</style>
