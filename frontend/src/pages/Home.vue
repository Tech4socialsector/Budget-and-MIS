<template>
  <AppLayout>
    <div class="flex flex-col gap-6">
      <!-- A soft tinted panel (not a dashed placeholder-style border) and a
      time-of-day greeting - small touches that make this read as a real
      landing page rather than an empty-state box waiting for content. -->
      <div class="rounded-xl bg-gradient-to-br from-blue-50 to-white p-6 dark:from-gray-800/60 dark:to-gray-900">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ greeting }}, {{ firstName }}
        </h2>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Jump into a module below to get started.</p>
      </div>

      <div>
        <div class="grid grid-cols-3 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(8.5rem,max-content))] sm:gap-4">
          <!-- Loading skeleton for backend-driven modules (App Module Setting) -->
          <template v-if="modulesResource.loading && !modulesResource.data">
            <div v-for="i in 3" :key="'skel-' + i" class="flex flex-col items-center gap-2 p-2">
              <Skeleton width="4.5rem" height="4.5rem" class="!rounded-2xl" />
              <Skeleton width="4.5rem" height="0.75rem" />
            </div>
          </template>

          <!-- Borderless tile: the whole button fills with a plain gray
          background on hover (no outer border/shadow at all), while the icon
          card underneath it lifts and gains its own shadow independently -
          two separate, deliberately understated hover cues rather than one
          heavy bordered-card treatment. The label wraps in full (no
          line-clamp) so a long module/doctype name is always fully readable
          rather than being cut off with an ellipsis. -->
          <button
            v-for="tile in homeTiles"
            :key="tile.key"
            class="group flex w-28 flex-col items-center gap-2 rounded-lg p-2 text-center transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 sm:w-[8.5rem]"
            @click="tile.onClick"
          >
            <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-150 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-gray-300 group-active:translate-y-0 group-active:scale-95 group-active:shadow-sm dark:bg-gray-800 dark:ring-gray-700 dark:group-hover:ring-gray-600 sm:h-[4.5rem] sm:w-[4.5rem]">
              <LucideIcon :name="tile.icon || 'layout-grid'" class="h-7 w-7 text-gray-600 transition-colors duration-150 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100 sm:h-8 sm:w-8" />
            </span>
            <span class="break-words text-xs font-medium leading-tight text-gray-900 dark:text-gray-100 sm:text-sm">
              {{ tile.label }}
            </span>
          </button>
        </div>
      </div>

      <ErrorMessage v-if="modulesResource.error" :message="modulesResource.error" />
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ErrorMessage } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import LucideIcon from '@/components/LucideIcon.vue'
import Skeleton from '@/components/Skeleton.vue'
import { session } from '@/data/session'
import { setPageTitle } from '@/data/pageTitle'
import { modulesResource, isSidebarModule } from '@/data/modules'

onMounted(() => {
  setPageTitle('Home')
  modulesResource.fetch()
})

const router = useRouter()

// First name only, not the full "Full Name" string - a greeting reads
// warmer addressing "Jerald" than "Jerald Smith", and session.user (an
// email/username) is the fallback only when full_name isn't set at all.
const firstName = computed(() => (session.full_name || session.user || '').split(' ')[0])

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

// Only a sidebar module (18-item Settings & Master Data: doctypes you
// manage, not reports you read) keeps the "one tile opens a sidebar full
// of items" shape - a sidebar makes sense for a settings area you move
// between record types within. Every other module is direct mode: its own
// single tile (Budget Summary, Budget vs Actual, Help & Support, ...)
// navigates straight to its Page/DocType or opens its URL, matching how a
// single report or external link is used: open it, read it, leave - not a
// list you browse within.
const homeTiles = computed(() => {
  const modules = modulesResource.data || []
  const tiles = []

  for (const mod of modules) {
    if (isSidebarModule(mod)) {
      tiles.push({
        key: 'mod-' + mod.label,
        label: mod.label,
        icon: mod.icon,
        onClick: () => openItem(mod.doctypes?.[0]),
      })
      continue
    }

    if (!mod.direct) continue
    tiles.push({
      key: 'direct-' + mod.name,
      label: mod.label,
      icon: mod.icon,
      onClick: () => openDirect(mod.direct),
    })
  }

  return tiles
})

// A "SPA Page" item opens one of this app's built-in pages by its named
// route directly; a "DocType" item opens the generic DoctypeList route
// instead, keyed by its route slug param - mirrors AppSidebar.vue's own
// page_route/doctype_name branch for the same item shape. Deliberately does
// NOT call setActiveModule/clearActiveModule itself - router.js's own
// beforeEach already resolves the right module (or none, via
// isSidebarModule) for whichever route this lands on, the same way a
// direct URL visit or page refresh does, so this stays a single source of
// truth instead of two call sites that could disagree.
function openItem(item) {
  if (!item) return
  if (item.page_route) {
    router.push({ name: item.page_route })
  } else {
    router.push({ name: 'DoctypeList', params: { doctypeRoute: item.route } })
  }
}

// A direct-mode module's own destination (mod.direct) - one tile, one of
// three shapes depending on direct_item_type set in App Module Setting.
function openDirect(direct) {
  if (direct.type === 'Page') {
    router.push({ name: direct.page_route })
  } else if (direct.type === 'DocType') {
    router.push({ name: 'DoctypeList', params: { doctypeRoute: direct.route } })
  } else if (direct.type === 'URL') {
    window.open(direct.url, '_blank', 'noopener')
  }
}
</script>
