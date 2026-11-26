<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t bg-white pb-[env(safe-area-inset-bottom)] dark:border-gray-800 dark:bg-gray-900"
  >
    <router-link
      :to="{ name: 'Home' }"
      class="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs"
      :class="route.name === 'Home' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'"
    >
      <FeatherIcon name="home" class="h-5 w-5" />
      Home
    </router-link>

    <router-link
      :to="{ name: 'BudgetSummary' }"
      class="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs"
      :class="route.name === 'BudgetSummary' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'"
    >
      <FeatherIcon name="bar-chart-2" class="h-5 w-5" />
      Reports
    </router-link>

    <button
      v-if="assistantConfigResource.data?.enabled"
      class="assistant-nav-item flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-gray-400 dark:text-gray-500"
      @click="toggleAssistant"
    >
      <span class="assistant-nav-badge relative flex h-5 w-5 items-center justify-center">
        <AssistantIcon class="h-5 w-5" />
      </span>
      Assistant
    </button>

    <button
      class="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-gray-400 dark:text-gray-500"
      @click="showMenu = true"
    >
      <FeatherIcon name="menu" class="h-5 w-5" />
      Menu
    </button>
  </nav>

  <Transition name="menu-overlay">
    <div
      v-if="showMenu"
      class="fixed inset-0 z-40 bg-black/40"
      @click.self="showMenu = false"
    >
      <Transition name="menu-drawer" appear>
        <div
          v-if="showMenu"
          class="h-full w-72 max-w-[80vw] overflow-y-auto pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
        >
          <AppSidebar disable-collapse />
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FeatherIcon } from 'frappe-ui'
import AppSidebar from '@/components/AppSidebar.vue'
import AssistantIcon from '@/components/AssistantIcon.vue'
import { assistantState, assistantConfigResource, toggleAssistant } from '@/data/aiAssistant'

const route = useRoute()
const showMenu = ref(false)

// AppSidebar's own items navigate via router - close the drawer whenever
// that happens, the same way tapping a link in a mobile drawer normally
// dismisses it.
watch(() => route.fullPath, () => {
  showMenu.value = false
})

// The assistant trigger in AppSidebar's footer just flips a shared ref
// rather than navigating, so the route watch above never fires for it -
// watch it directly instead, so opening the assistant from inside the
// drawer still closes the drawer behind it.
watch(() => assistantState.visible, (open) => {
  if (open) showMenu.value = false
})
</script>

<style scoped>
.menu-overlay-enter-active,
.menu-overlay-leave-active {
  transition: opacity 0.2s ease;
}
.menu-overlay-enter-from,
.menu-overlay-leave-to {
  opacity: 0;
}

.menu-drawer-enter-active,
.menu-drawer-leave-active {
  transition: transform 0.2s ease;
}
.menu-drawer-enter-from,
.menu-drawer-leave-to {
  transform: translateX(-100%);
}

/* "Blinking" as a soft breathing glow rather than a literal opacity
on/off toggle - a hard blink reads as an alert/error state on a button
that's actually just inviting a tap. */
.assistant-nav-item .assistant-nav-badge {
  animation: assistant-nav-breathe 2.4s ease-in-out infinite;
}
.assistant-nav-badge::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  border: 1.5px solid #6366f1;
  animation: assistant-nav-ping 2.4s ease-out infinite;
  pointer-events: none;
}

@keyframes assistant-nav-breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}

@keyframes assistant-nav-ping {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-nav-badge,
  .assistant-nav-badge::after {
    animation: none;
  }
}
</style>
