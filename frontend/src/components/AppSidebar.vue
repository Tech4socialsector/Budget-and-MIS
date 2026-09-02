<template>
  <div class="app-sidebar-root flex h-full flex-shrink-0" :style="sidebarThemeVars">
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
            class="assistant-card relative flex w-full items-center gap-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800/70"
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
/* --sticky-label-bg / --sidebar-text-color are set via :style on the root
element in <script setup> (sidebarThemeVars), not a :global(.dark) CSS
selector - empirically, Vite's Vue SFC compiler was found to silently
mis-compile :global(...) combined with anything else in this file's
<style scoped> block (verified directly in its own build output: the
.dark prefix got dropped, leaving a bare, disconnected `.dark{...}` rule
with no connection to the actual target). Binding them reactively from
the component's own theme state sidesteps the compiler bug entirely. The
:deep() rules further down just read these two variables via var(). */

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
}
:global(.dark) :deep(.flex.flex-col.mt-2:nth-of-type(2)),
:global(.dark) :deep(.flex.flex-col.mt-2:nth-of-type(3)) {
  border-top-color: theme('colors.gray.800');
}
/* Section 2 (Home/Dashboard, not a scroll container) still wants the
gap the removed padding-top used to give it - restated as margin-top on
its own label/first item instead. Section 3 (the module section) does NOT
get this: it's the sticky-label scroll container below, where that same
gap becomes the padding.top-in-a-scroll-container plumbing bug this
splits it out to avoid (see next rule's comment). */
:deep(.flex.flex-col.mt-2:nth-of-type(2) > *:first-child) {
  margin-top: 0.5rem;
}

/* Sidebar.vue's own root scrolls the ENTIRE sidebar as one unit
(overflow-y-auto on the outermost div) - fine for the two small pinned
sections (utility actions, Home/Dashboard), but a module section can carry
many items (e.g. Settings & Master Data's 18 doctypes), which pushed the
whole sidebar - including those pinned sections and the profile/assistant
footer - into scrolling together. Disabling the root's own scroll and
instead making just the module section (:nth-of-type(3), the same one
targeted above) scroll within its own bounded height keeps the pinned
sections and footer always visible, with only the module's item list
scrolling on its own. flex-shrink:0 on the footer (Sidebar.vue's own
`.mt-auto` block, holding the assistant card + profile + collapse) stops
it from being squeezed/overlapped by the module section above it - without
it, a tall item list could shrink flex:1 1 auto's sibling further than its
own content needs, since flex items shrink by default.

margin-top:auto on that same footer block is Sidebar.vue's own mechanism
for pinning it to the bottom of the sidebar by default (e.g. on Home,
where there's no module section at all) - kept as-is; only flex-shrink is
added here so a tall module item list can't squeeze the footer smaller
than its own content needs. */
:deep(.overflow-y-auto.overflow-x-hidden) {
  overflow-y: hidden;
}
:deep(.mt-auto.flex.flex-col) {
  flex-shrink: 0;
}
:deep(.flex.flex-col.mt-2:nth-of-type(3)) {
  /* flex-grow:0 (not 1) - this section should only take the height its own
  items actually need, up to whatever room is left above the footer, NOT
  stretch to fill all remaining space when the item list is short enough
  to fit without scrolling. flex-grow:1 pushed the footer to the very
  bottom of the viewport with a large dead gap above it whenever a module
  had few enough items to fit on screen (e.g. Budget Reports' 4 items) -
  flex-shrink:1 + min-height:0 is what actually matters for the "scroll
  instead of overflowing past the footer" behavior on a LONG list. */
  flex: 0 1 auto;
  min-height: 0;
  overflow-y: auto;
  /* Same thin-scrollbar treatment as .fc-scroll-wrapper (index.css) - the
  browser default scrollbar reads as oversized in a narrow 17rem sidebar
  column. scrollbar-width is Firefox's own property; the
  ::-webkit-scrollbar-* rules below cover Chromium/Safari. */
  scrollbar-width: thin;
}
:deep(.flex.flex-col.mt-2:nth-of-type(3))::-webkit-scrollbar {
  width: 10px;
}
:deep(.flex.flex-col.mt-2:nth-of-type(3))::-webkit-scrollbar-track {
  background: transparent;
}
:deep(.flex.flex-col.mt-2:nth-of-type(3))::-webkit-scrollbar-thumb {
  background-color: rgb(203 213 225);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
:global(.dark) :deep(.flex.flex-col.mt-2:nth-of-type(3))::-webkit-scrollbar-thumb {
  background-color: rgb(107 114 128);
}

/* The module section's own label (e.g. "Settings & Master Data") sits
inside that same scrolling box (SidebarSection.vue renders label + item
list as one flex column, no separate scroll region for each) - pin it to
the top of the scroll area so it stays visible as a heading while the item
list underneath it scrolls past. Needs its own opaque background (matching
the sidebar's own bg-surface-menu-bar) so scrolled-past items don't show
through underneath it.

top:0 here needs the scroll CONTAINER (:nth-of-type(3) above) to have zero
padding-top of its own - a sticky child's top:0 anchors to the padding
edge of its nearest scrolling ancestor, not its border edge, so any
padding-top on that ancestor opens a gap between the container's actual
scroll boundary and where the sticky element starts covering content -
a scrolled-past item can render fully visible in that gap, appearing to
poke out above the sticky label even though the label itself has a solid,
fully opaque background. That's why the divider rule above no longer
gives this container its own padding-top: it's given to THIS element
instead, as padding-top (not margin-top - a margin sits outside this
element's own border box, so the sticky background painted on that box
still wouldn't cover it and the same gap would just move one level down;
padding is inside the box the background paints, so it's covered). */
:deep(.flex.flex-col.mt-2:nth-of-type(3) > div:first-child) {
  position: sticky;
  top: -8px;
  z-index: 1;
  padding-top: 8px;
  margin-top: -8px;
  background-color: var(--sticky-label-bg);
}
/* The label text itself (SidebarSection.vue's own <h3>, inside the sticky
wrapper above) - a bit of extra margin-top gives "Settings & Master Data"
some breathing room below the divider line instead of sitting flush
against it. */
:deep(.flex.flex-col.mt-2:nth-of-type(3) h3) {
  margin-top: 10px;
}

/* SidebarSection.vue wraps its <nav> item list in a <transition> meant to
animate a COLLAPSIBLE section open/closed (enter-to-class/leave-from-class
both cap it at max-h-[200px] while the collapse animation plays) - our
module section is never collapsible, but Vue's transition system still
applies that class (and can leave a stray inline max-height behind from
the last time it measured the element) since the <nav> unmounts/remounts
whenever the section's items change. Capped at 200px, the nav rendered a
second, visually duplicated copy of the sticky label's own text peeking
out beneath it once real content overflowed that cap - overriding it back
to none lets the nav grow to its natural height so our own container
(.mt-2:nth-of-type(3) above) is the only thing that ever bounds/scrolls
it. */
:deep(.flex.flex-col.mt-2:nth-of-type(3) nav) {
  max-height: none !important;
  overflow: visible !important;
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

/* Nav item labels (Home, Dashboard, every module item) and the module
section heading (e.g. "Settings & Master Data") use frappe-ui's own
ink-gray-* tokens by default, which resolve to a mid-brightness gray in
dark mode (e.g. ink-gray-5 -> gray-300, the section heading; the item
Button's own ghost-variant ink token for item labels) rather than pure
white - legible, but noticeably dimmer than the rest of this app's
dark-mode text. Scoped to just nav's own item-label span and the section
h3 - NOT every button/span in the sidebar - so the assistant card's own
two-tone bot-name/"AI assistant" hierarchy and the profile dropdown are
left alone; neither was part of this.

Uses the --sidebar-text-color variable (set on .app-sidebar-root above)
rather than a :global(.dark) :deep(...) compound selector - empirically,
Vite's Vue SFC compiler was found to sometimes silently mis-compile that
combination for other rules in this file (see the sticky-label background
rule above), so the variable indirection is used everywhere in this
component now rather than trusting case-by-case which shapes happen to
compile correctly. */
:deep(h3),
:deep(nav button span) {
  color: var(--sidebar-text-color);
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
import { currentTheme } from '@/data/theme'

defineProps({
  // Forced open (never icon-collapsed) when rendered inside the mobile
  // drawer, where Sidebar's own isMobile breakpoint check would otherwise
  // collapse it to icon-only regardless of the drawer's own wider width.
  disableCollapse: { type: Boolean, default: false },
})

const assistantBotName = computed(() => assistantConfigResource.data?.bot_name || 'Assistant')

// Bound via :style on the root element rather than a :global(.dark) CSS
// selector - empirically, Vite's Vue SFC compiler was found to silently
// mis-compile :global(...) combined with anything else in this file's
// <style scoped> block (verified directly in its own build output: the
// .dark prefix got dropped, leaving a bare, disconnected `.dark{...}`
// rule). Deriving the values here and binding them as inline custom
// properties sidesteps the compiler entirely - reactive, and immune to
// that bug since no :global() selector is involved at all.
const sidebarThemeVars = computed(() => (
  currentTheme.value === 'dark'
    ? { '--sticky-label-bg': '#171717', '--sidebar-text-color': '#f3f4f6' }
    : { '--sticky-label-bg': '#f8f8f8', '--sidebar-text-color': 'inherit' }
))

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
