<template>
  <div class="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-shrink-0 items-center gap-3 border-b bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <img
        :src="brandingResource.data?.app_logo || defaultAppIcon"
        class="h-7 w-7 flex-shrink-0 rounded-lg object-contain"
      />
      <h1 class="min-w-0 flex-1 truncate text-base font-semibold text-gray-900 dark:text-gray-100">
        {{ pageTitle }}
      </h1>
      <button
        role="switch"
        :aria-checked="currentTheme === 'dark'"
        class="relative flex h-7 w-14 flex-shrink-0 items-center rounded-full bg-gray-100 px-1 transition-colors dark:bg-gray-800"
        @click="toggleTheme"
      >
        <span
          class="pointer-events-none absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform duration-200 dark:bg-gray-600"
          :class="currentTheme === 'dark' ? 'translate-x-7' : 'translate-x-0'"
        >
          <FeatherIcon :name="currentTheme === 'dark' ? 'moon' : 'sun'" class="h-3 w-3 text-gray-700 dark:text-gray-100" />
        </span>
        <FeatherIcon name="sun" class="relative z-0 ml-0.5 h-3.5 w-3.5 text-gray-400" />
        <FeatherIcon name="moon" class="relative z-0 ml-auto mr-0.5 h-3.5 w-3.5 text-gray-400" />
      </button>
    </div>

    <!-- min-w-0 is required on a flex child that contains a wide table: without
    it, a flex item's default min-width is auto (roughly "as wide as its
    widest child"), so a table wider than the viewport stretches this main
    element - and the page itself - instead of staying put and letting
    .fc-scroll-wrapper's own overflow-x:auto handle the excess width. -->
    <main class="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 pb-20">
      <slot />
    </main>

    <MobileNav />
    <AiAssistant />
  </div>
</template>

<script setup>
import { FeatherIcon } from 'frappe-ui'
import MobileNav from '@/components/MobileNav.vue'
import AiAssistant from '@/components/AiAssistant.vue'
import { brandingResource, defaultAppIcon } from '@/data/branding'
import { pageTitle } from '@/data/pageTitle'
import { currentTheme, toggleTheme } from '@/data/theme'
</script>
