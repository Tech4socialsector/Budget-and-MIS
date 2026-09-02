<template>
  <div class="grid h-12 flex-shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
    <div class="flex min-w-0 items-center gap-2">
      <AppTooltip text="Home">
        <router-link
          :to="{ name: 'Home' }"
          class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <FeatherIcon name="home" class="h-4 w-4" />
        </router-link>
      </AppTooltip>
      <h1 class="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
        {{ pageTitle }}
      </h1>
    </div>

    <div></div>

    <div class="flex items-center justify-end">
      <AppTooltip :text="currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
        <!-- A segmented pill with both icons always visible (not a single
        icon that just flips) - the sliding thumb shows which state is
        active, closer to a light/dark switch than a plain tap-button. -->
        <button
          role="switch"
          :aria-checked="currentTheme === 'dark'"
          class="theme-toggle relative flex h-7 w-14 flex-shrink-0 items-center rounded-full bg-gray-100 px-1 transition-colors dark:bg-gray-800"
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
      </AppTooltip>
    </div>
  </div>
</template>

<script setup>
import { FeatherIcon } from 'frappe-ui'
import { pageTitle } from '@/data/pageTitle'
import AppTooltip from '@/components/AppTooltip.vue'
import { currentTheme, toggleTheme } from '@/data/theme'
</script>
