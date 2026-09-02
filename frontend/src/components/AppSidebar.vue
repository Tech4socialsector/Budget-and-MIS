<template>
  <div class="flex h-full flex-shrink-0">
    <Sidebar v-model:collapsed="collapsed" :header="header" :sections="sections" :disableCollapse="disableCollapse">
      <template #sidebar-item="{ item }">
        <SidebarItem
          :label="item.label"
          :icon="item.icon"
          :to="item.to"
          :isActive="item.isActive"
          :onClick="item.onClick"
        />
      </template>
      <template #footer-items="{ isCollapsed }">
        <AppTooltip :text="`Ask ${assistantBotName}`" :disabled="!isCollapsed">
          <button
            v-if="assistantConfigResource.data?.enabled"
            class="assistant-card relative flex w-full items-center gap-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-left hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800/70"
            :class="{ 'justify-center': isCollapsed }"
            @click="toggleAssistant"
          >
            <span class="assistant-badge flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
              <AssistantIcon class="h-3.5 w-3.5" />
            </span>
            <span v-if="!isCollapsed" class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ assistantBotName }}
              </span>
              <span class="block truncate text-xs text-gray-500 dark:text-gray-400">
                AI assistant
              </span>
            </span>
          </button>
        </AppTooltip>
        <Dropdown :options="profileMenuOptions" placement="left" side="top" :offset="8">
          <template #default="{ open }">
            <button
              class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'justify-center': isCollapsed, 'bg-gray-100 dark:bg-gray-800': open }"
            >
              <Avatar :image="session.user_image" :label="session.full_name || session.user" size="sm" shape="square" />
              <span v-if="!isCollapsed" class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ session.full_name || session.user }}
                </span>
                <span class="block truncate text-xs text-gray-500 dark:text-gray-400">
                  {{ session.user }}
                </span>
              </span>
            </button>
          </template>
        </Dropdown>
      </template>
    </Sidebar>

    <ProfileSettingsModal v-model="profileModalOpen" />
  </div>
</template>

<style scoped>
/* frappe-ui's Sidebar hard-codes its own width (w-60 expanded / w-12
collapsed) with no width prop of its own - :deep() widens the expanded
state a bit for more breathing room around longer nav labels; the
collapsed icon-only rail is left untouched. */
:deep(.w-60) {
  width: 17rem;
}

/* SidebarHeader's own button is separately hardcoded to w-[14rem]
regardless of the Sidebar's width above it, so the app-name/subtitle text
was still being truncated ("Annual Budget MI...") inside a box that never
grew when the sidebar did. Widen it to match (minus the sidebar's own
padding) so the full title fits. */
:deep(.w-\[14rem\]) {
  width: 15.5rem;
}

/* frappe-ui's SidebarHeader hard-codes the logo box at w-8 h-8 (32px)
with no size prop of its own - its Tailwind classes are the only stable
hook available, so :deep() targets that exact combination to size it up
without touching any other button/icon in the sidebar. */
:deep(.w-8.h-8.rounded.overflow-hidden) {
  width: 3.5rem;
  height: 3.5rem;
}

/* Visible dividers around the two pinned blocks at the top of the sidebar:
(1) utility actions (Help & Support / Reload / Theme) and (2) Home/Budget
Dashboard - everything below that (Settings & Master Data / Budget Reports
/ MIS Reports / any active module section) gets its own divider too.
Sidebar.vue renders each section as a sibling div sharing this exact class
with no slot in between to inject an <hr> directly, so :nth-of-type
targets sections 2 and 3 (1-indexed) specifically. */
:deep(.flex.flex-col.mt-2:nth-of-type(2)),
:deep(.flex.flex-col.mt-2:nth-of-type(3)) {
  margin-top: 0.75rem;
  border-top: 1px solid theme('colors.gray.200');
  padding-top: 0.5rem;
}
:global(.dark) :deep(.flex.flex-col.mt-2:nth-of-type(2)),
:global(.dark) :deep(.flex.flex-col.mt-2:nth-of-type(3)) {
  border-top-color: theme('colors.gray.800');
}

.assistant-card {
  animation: assistant-card-glow 3.2s ease-in-out infinite;
}
.assistant-card::before {
  content: '';
  position: absolute;
  inset: -40% -10%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.35), transparent 70%);
  animation: assistant-card-sweep 3.2s ease-in-out infinite;
  pointer-events: none;
}
.assistant-card > * {
  position: relative;
  z-index: 1;
}

@keyframes assistant-card-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
  50% {
    box-shadow: 0 0 12px 1px rgba(99, 102, 241, 0.25);
  }
}

@keyframes assistant-card-sweep {
  0%, 100% {
    transform: translateX(-20%);
    opacity: 0.5;
  }
  50% {
    transform: translateX(20%);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-card,
  .assistant-card::before {
    animation: none;
  }
}

.assistant-badge {
  position: relative;
  animation: assistant-badge-breathe 2.4s ease-in-out infinite;
}
.assistant-badge::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: #111827;
  animation: assistant-badge-ping 2.4s ease-out infinite;
  pointer-events: none;
}
:global(.dark) .assistant-badge::after {
  background: #f3f4f6;
}

@keyframes assistant-badge-breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

@keyframes assistant-badge-ping {
  0% {
    opacity: 0.35;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.7);
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-badge,
  .assistant-badge::after {
    animation: none;
  }
}
</style>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Sidebar, SidebarItem, Avatar, Dropdown } from 'frappe-ui'
import navIcon from '@/components/navIcon'
import AssistantIcon from '@/components/AssistantIcon.vue'
import AppTooltip from '@/components/AppTooltip.vue'
import ProfileSettingsModal from '@/components/ProfileSettingsModal.vue'
import { session, logoutResource } from '@/data/session'
import { baseSections } from '@/data/nav'
import { assistantConfigResource, toggleAssistant } from '@/data/aiAssistant'
import { brandingResource, defaultAppIcon } from '@/data/branding'
import { appConfigResource } from '@/data/appConfig'
import { activeModule } from '@/data/activeModule'
import { clearFrontendCache } from '@/data/clearCache'

defineProps({
  // Forced open (never icon-collapsed) when rendered inside the mobile
  // drawer, where Sidebar's own isMobile breakpoint check would otherwise
  // collapse it to icon-only regardless of the drawer's own wider width.
  disableCollapse: { type: Boolean, default: false },
})

const assistantBotName = computed(() => assistantConfigResource.data?.bot_name || 'Assistant')

const route = useRoute()
const collapsed = ref(false)

const header = computed(() => ({
  title: brandingResource.data?.app_title || 'Annual Budget MIS',
  subtitle: session.full_name || session.user,
  // This slot is a small square avatar, not room for the full logo+
  // wordmark - falls back to the icon-mark-only asset (see defaultAppIcon
  // in branding.js) instead of the full lockup, since the sidebar surface
  // itself flips light/dark with the theme toggle.
  logo: brandingResource.data?.app_logo || defaultAppIcon,
  menuItems: [
    {
      label: 'Go to Desk',
      icon: 'grid',
      onClick: () => window.open('/app', '_self'),
    },
    {
      label: 'Logout',
      icon: 'log-out',
      onClick: () => logoutResource.submit(),
    },
  ],
}))

// Pinned above Home/Budget Dashboard, with its own divider below it (see
// the :nth-of-type(2)/:nth-of-type(3) rules in <style>) - these are
// actions, not routes, so they carry onClick instead of a `to`. Profile
// Settings leads the list, then Help & Support, Reload. The theme toggle
// used to live here too but moved to TopNavbar.vue as an icon button
// instead, matching a top-bar-toggle convention rather than a full labeled
// sidebar row.
const utilityItems = computed(() => {
  const items = [
    { label: 'Profile Settings', icon: navIcon('user'), onClick: () => (profileModalOpen.value = true) },
  ]
  if (appConfigResource.data?.helpdesk_url) {
    items.push({ label: 'Help & Support', icon: navIcon('life-buoy'), onClick: openHelpdesk })
  }
  items.push(
    { label: 'Reload', icon: navIcon('refresh-cw'), onClick: clearFrontendCache },
  )
  return items
})

const sections = computed(() => {
  const sectionList = [
    { label: '', items: utilityItems.value },
    ...baseSections
      .map((section) => ({
        label: section.label,
        items: section.items.map((item) => ({
          label: item.label,
          icon: navIcon(item.icon),
          to: { name: item.routeName },
          isActive: route.name === item.routeName,
        })),
      }))
      .filter((section) => section.items.length),
  ]

  // Budget Reports / MIS Reports (staticModules) aren't part of the base
  // sidebar at all - they only appear once opened (a Home tile click, or
  // landing directly on one of their routes - see router.js's beforeEach),
  // matching the chw reference app's module-tile pattern: the sidebar
  // shows only the module currently in use, not every module always.
  if (activeModule.value?.isStatic) {
    const mod = activeModule.value
    sectionList.push({
      label: mod.label,
      items: mod.items.map((item) => ({
        label: item.label,
        icon: navIcon(item.icon),
        to: { name: item.routeName },
        isActive: route.name === item.routeName,
      })),
    })
  } else if (activeModule.value) {
    const mod = activeModule.value
    sectionList.push({
      label: mod.label,
      // Items are heterogeneous: a "SPA Page" item (page_route set) opens
      // one of this app's built-in Vue pages by its named route directly;
      // a "DocType" item (doctype_name set) opens the generic DoctypeList
      // route instead, keyed by its route slug param.
      items: (mod.doctypes || []).map((item) => item.page_route
        ? {
            label: item.label || item.page_route,
            icon: navIcon(item.icon || mod.icon),
            to: { name: item.page_route },
            isActive: route.name === item.page_route,
          }
        : {
            label: item.label || item.doctype_name,
            icon: navIcon(item.icon || mod.icon),
            to: { name: 'DoctypeList', params: { doctypeRoute: item.route } },
            isActive: route.params.doctypeRoute === item.route,
          }),
    })
  }

  return sectionList
})

const profileModalOpen = ref(false)

onMounted(() => appConfigResource.fetch())

// Help & Support / Reload / Theme / Profile Settings are their own sidebar
// rows (not hidden behind this menu) - this dropdown is left with just
// Logout, the one action that doesn't make sense as a standalone nav item.
const profileMenuOptions = computed(() => [
  {
    label: 'Logout',
    icon: 'log-out',
    onClick: () => logoutResource.submit(),
  },
])

function openHelpdesk() {
  if (appConfigResource.data?.helpdesk_url) {
    window.open(appConfigResource.data.helpdesk_url, '_blank', 'noopener')
  }
}
</script>
