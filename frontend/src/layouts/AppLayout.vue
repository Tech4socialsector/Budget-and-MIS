<template>
  <MobileShell v-if="isMobile">
    <slot />
  </MobileShell>
  <div v-else class="fixed inset-0 flex bg-surface-white text-ink-gray-8">
    <!-- No module open (e.g. Home) - the sidebar doesn't mount at all, not
    just render empty, so those pages go full width. TopNavbar switches to
    showing the logo/app name itself once there's no sidebar to carry it -
    see its own activeModule check. -->
    <AppSidebar v-if="activeModule" />
    <div class="flex min-w-0 flex-1 flex-col">
      <TopNavbar />
      <main
        class="flex-1 overflow-y-auto bg-surface-white px-5 py-4 sm:px-6"
        :class="fillHeight ? 'flex min-h-0 flex-col' : ''"
      >
        <slot />
      </main>
    </div>
    <AiAssistant />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import AppSidebar from '@/components/AppSidebar.vue'
import TopNavbar from '@/components/TopNavbar.vue'
import MobileShell from '@/components/MobileShell.vue'
import { activeModule } from '@/data/activeModule'

// AiAssistant itself renders nothing until opened (its root is `v-if="show"`
// - the trigger buttons living in TopNavbar/MobileNav flip that flag), but
// was still being eagerly imported into AppLayout's own chunk, which loads
// on every single page. Deferring the import until AppLayout actually mounts
// it keeps the ~31kB chat panel out of the shell every page pays for, while
// still always being present in the DOM tree for the trigger buttons to
// reveal, same as before.
const AiAssistant = defineAsyncComponent(() => import('@/components/AiAssistant.vue'))

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('sm')

defineProps({
  // Opt-in for pages with their own bounded-height scroll region (e.g. a
  // table that scrolls internally): makes `main` a flex column so the
  // page's own flex-1 content can fill exactly the remaining height when
  // there's enough of it. `main` keeps overflow-y-auto either way, so if
  // the content above the flex-1 region (filters, cards) genuinely doesn't
  // leave enough room - a narrower viewport where filters wrap to more
  // rows, say - the page falls back to scrolling normally instead of
  // silently crushing the flexed region down to its min-height.
  fillHeight: { type: Boolean, default: false },
})
</script>
