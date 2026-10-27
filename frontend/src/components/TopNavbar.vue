<template>
  <!-- A full breadcrumb trail, derived fresh on every render from the
  current route + pageTitle.value, not a value computed once and cached -
  breadcrumbItems below is a computed() reading route.name/route.params/
  pageTitle.value directly, so it can never show a stale crumb left over
  from the previous page right after navigating. -->
  <div class="relative z-10 flex h-[4rem] flex-shrink-0 items-center justify-between gap-3 border-b border-outline-gray-1 bg-surface-white px-5 shadow-sm">
    <div class="flex min-w-0 items-center gap-3">
      <!-- No module open -> AppLayout.vue doesn't mount the sidebar at all,
      so the logo/app name - normally in the sidebar header - rides here
      instead, otherwise branding would be fully absent on Home and any
      other sidebar-less page. Once a module opens, the sidebar (and its
      own identical header) comes back, so this reverts to the breadcrumb
      trail alone - no duplicate logo competing with the sidebar's own.
      A plain link to Home, not a dropdown - Go to Desk/Logout/etc. already
      live under the avatar's own menu (see profileMenuOptions), so this
      doesn't need to offer them a second time. No card/border around it -
      just a hover highlight, same treatment as the icon buttons on the
      right. -->
      <router-link
        v-if="!activeModule"
        :to="{ name: 'Home' }"
        class="flex flex-shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 duration-150 ease-in-out hover:bg-surface-gray-1"
      >
        <img
          v-if="typeof logo === 'string'"
          :src="logo"
          class="h-8 max-w-[7.5rem] flex-shrink-0 object-contain object-left"
          alt="Logo"
        />
        <span class="truncate text-base font-medium text-ink-gray-8">{{ appTitle }}</span>
      </router-link>
      <span v-if="!activeModule" class="h-6 w-px flex-shrink-0 bg-outline-gray-3" />
      <Breadcrumbs class="topnavbar-breadcrumbs min-w-0" :items="breadcrumbItems">
        <template #prefix="{ item }">
          <LucideIcon v-if="item.label === 'Home'" name="house" class="mr-1 h-4 w-4 flex-shrink-0" />
        </template>
      </Breadcrumbs>
    </div>
    <div class="flex flex-shrink-0 items-center gap-2">
      <!-- Search trigger - same Cmd/Ctrl+K palette as the reference
      frappe-ui docs search, opened either by clicking this or the shortcut
      itself (CommandPalette.vue listens for it globally on its own). -->
      <Button
        variant="ghost"
        size="lg"
        icon="lucide-search"
        tooltip="Search"
        label="Search"
        @click="openCommandPalette"
      />
      <Button
        variant="ghost"
        size="lg"
        :icon="currentTheme === 'dark' ? 'lucide-moon' : 'lucide-sun'"
        :tooltip="currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        label="Switch theme"
        aria-label="Switch theme"
        @click="toggleTheme"
      />
      <!-- Was a floating action button (bottom-right, every page) - moved
      here instead since a FAB can sit on top of page content (e.g. a
      form's own Save button in the same corner). Gated on the same config
      the old FAB used, so it's still invisible when the admin hasn't
      enabled it. A pulsing ring + the bot's own name in text (not just an
      icon) makes this read as an inviting shortcut rather than one more
      plain utility icon lost among Search/theme toggle. -->
      <AppTooltip v-if="assistantConfigResource.data?.enabled" :text="`Ask ${botName}`">
        <button
          type="button"
          class="assistant-nav-trigger relative flex items-center gap-1.5 rounded-full border border-outline-gray-2 bg-surface-gray-1 py-1.5 pl-2 pr-3 text-ink-gray-8 duration-150 ease-in-out hover:border-outline-gray-3 hover:bg-surface-gray-2"
          :aria-label="`Ask ${botName}`"
          @click="toggleAssistant"
        >
          <span class="assistant-nav-badge relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
            <AssistantIcon class="assistant-nav-icon relative h-3.5 w-3.5" />
          </span>
          <span class="text-sm font-medium">{{ botName }}</span>
        </button>
      </AppTooltip>
      <!-- Reload/Profile Settings/Go to Desk/Logout all live under this one
      avatar now (same set AppSidebar.vue's own footer dropdown offers) -
      the icon-button row next to it is reserved for Search and the theme
      toggle, not account actions. -->
      <Dropdown :options="profileMenuOptions" placement="right">
        <template #default="{ open }">
          <AppTooltip :text="session.full_name || session.user" placement="bottom">
            <button
              type="button"
              class="flex flex-shrink-0 items-center rounded-full p-0.5 duration-150 ease-in-out"
              :class="open ? 'bg-surface-gray-2' : 'hover:bg-surface-gray-2'"
              aria-label="Account menu"
            >
              <Avatar :image="avatarUrl" :label="session.full_name || session.user" size="2xl" shape="circle" />
            </button>
          </AppTooltip>
        </template>
      </Dropdown>
    </div>
  </div>

  <ProfileSettingsModal v-model="profileModalOpen" />

  <AppCommandPalette @select="handleCommandSelect" />
</template>

<style scoped>
/* frappe-ui's own Breadcrumbs hardcodes text-lg (18px) per crumb - reads
too large sitting directly beside the logo/app name, which is the more
important text on this bar. Sized down here instead of asking for a
font-size prop the component doesn't have. */
:deep(.text-lg) {
  font-size: 0.9375rem;
  line-height: 1.375rem;
}

/* A breathing ring around the badge circle PLUS a gentle pulse on the
icon glyph itself - the first pass (ring alone) was too subtle to notice
in a quick glance at the navbar, so this pairs it with a second, slower
cue on the icon so the shortcut reads as "alive" even if the ring's own
expand-and-fade is missed. */
.assistant-nav-badge::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  background: theme('colors.gray.900');
  animation: assistant-nav-ping 1.8s ease-out infinite;
  pointer-events: none;
}

.assistant-nav-icon {
  animation: assistant-nav-pulse 1.8s ease-in-out infinite;
}

@keyframes assistant-nav-ping {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.9);
  }
}

@keyframes assistant-nav-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-nav-badge::after,
  .assistant-nav-icon {
    animation: none;
  }
}
</style>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Avatar, Breadcrumbs, Button, Dropdown } from 'frappe-ui'
import LucideIcon from '@/components/LucideIcon.vue'
import AppTooltip from '@/components/AppTooltip.vue'
import AssistantIcon from '@/components/AssistantIcon.vue'
import ProfileSettingsModal from '@/components/ProfileSettingsModal.vue'
import AppCommandPalette from '@/components/AppCommandPalette.vue'
import { pageTitle } from '@/data/pageTitle'
import { currentTheme, toggleTheme } from '@/data/theme'
import { clearFrontendCache } from '@/data/clearCache'
import { brandingResource, defaultAppIcon } from '@/data/branding'
import { activeModule } from '@/data/activeModule'
import { session, logoutResource } from '@/data/session'
import { openCommandPalette } from '@/data/commandPalette'
import { assistantConfigResource, toggleAssistant } from '@/data/aiAssistant'
import { profileModalOpen, openProfileSettings } from '@/data/profileModal'
import { useGravatarUrl } from '@/utils/gravatar'

const route = useRoute()
const router = useRouter()

function handleCommandSelect(item) {
  if (item.onClick) {
    item.onClick()
  } else if (item.to) {
    router.push(item.to)
  }
}

// Same fallback precedence every other logo spot in the app uses - see
// AppSidebar.vue's own header computed for the identical pattern.
const logo = computed(() => brandingResource.data?.app_logo || defaultAppIcon.value)
const appTitle = computed(() => brandingResource.data?.app_title || 'Budget MIS')
const botName = computed(() => assistantConfigResource.data?.bot_name || 'Assistant')

// Falls back to a computed Gravatar when Frappe's own user_image isn't
// set - Avatar.vue's existing onError-to-initials fallback still covers
// the case where the email has no Gravatar either (that request itself
// 404s instead of serving Gravatar's mystery-person placeholder).
const userEmail = computed(() => session.user)
const gravatarUrl = useGravatarUrl(userEmail)
const avatarUrl = computed(() => session.user_image || gravatarUrl.value)

const profileMenuOptions = computed(() => [
  {
    label: 'Reload',
    icon: 'lucide-refresh-cw',
    onClick: clearFrontendCache,
  },
  {
    label: 'Profile Settings',
    icon: 'lucide-user',
    onClick: openProfileSettings,
  },
  {
    label: 'Go to Desk',
    icon: 'lucide-layout-grid',
    onClick: () => window.open('/app', '_self'),
  },
  {
    label: 'Logout',
    icon: 'lucide-log-out',
    onClick: () => logoutResource.submit(),
  },
])


// Static label per named route, for anything that doesn't set pageTitle
// itself (DoctypeList/DoctypeForm set it dynamically once their record/
// doctype metadata loads - see data/pageTitle.js) - mirrors MobileShell.vue's
// own ROUTE_LABELS map so desktop and mobile always agree on a page's title.
const ROUTE_LABELS = {
  Home: 'Home',
  BudgetSummary: 'Budget Summary',
  BudgetDashboard: 'Budget Dashboard',
  FoundationConsolidated: 'Foundation - Consolidated Budget',
  MonthlyMis: 'Monthly MIS',
  ErpActuals: 'ERP Actuals',
  BudgetVsActual: 'Budget vs Actual',
}
const title = computed(() => pageTitle.value || ROUTE_LABELS[route.name] || route.name || '')

// Breadcrumb trail per route - always derived fresh from route.name/
// route.params/pageTitle.value (a computed, never a value set once and left
// stale). Home is the landing page, so it gets no trail at all (just its
// own title, same as every other route's final crumb).
const breadcrumbItems = computed(() => {
  // Already resolved by router.js's beforeEach guard before this route ever
  // renders - reading it here instead of re-deriving from the module/
  // doctype map avoids a second lookup for a value already settled.
  const doctype = route.meta.resolvedDoctype || null

  if (route.name === 'Home') {
    return [{ label: 'Home' }]
  }

  if (route.name === 'DoctypeList') {
    return [
      { label: 'Home', route: { name: 'Home' } },
      { label: doctype || route.params.doctypeRoute },
    ]
  }

  if (route.name === 'DoctypeForm' || route.name === 'DoctypeNew') {
    return [
      { label: 'Home', route: { name: 'Home' } },
      {
        label: doctype || route.params.doctypeRoute,
        route: { name: 'DoctypeList', params: { doctypeRoute: route.params.doctypeRoute } },
      },
      { label: pageTitle.value || (route.name === 'DoctypeNew' ? 'New' : route.params.name) },
    ]
  }

  // BudgetSummary / BudgetDashboard / FoundationConsolidated / MonthlyMis /
  // ErpActuals / BudgetVsActual and anything else named - one level under
  // Home, using the same title this navbar already shows as that page's
  // own label.
  return [{ label: 'Home', route: { name: 'Home' } }, { label: title.value }]
})
</script>
