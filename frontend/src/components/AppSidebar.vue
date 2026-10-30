<template>
  <div class="app-sidebar-root flex h-full flex-shrink-0" :style="sidebarThemeVars">
    <Sidebar v-model:collapsed="collapsed" :sections="sections" :disableCollapse="disableCollapse">
      <!-- frappe-ui's own SidebarHeader hardcodes a 32x32 square logo slot -
      too small/square for the Azim Premji Foundation wordmark (icon + full
      "Azim Premji Foundation" text), so this replaces it entirely with a
      wider layout that still keeps the same dropdown-menu behavior. -->
      <template #header>
        <Dropdown :options="header.menuItems">
          <template #default="{ open }">
            <button
              type="button"
              class="flex h-12 w-full items-center gap-2 rounded-md px-2 py-2 duration-300 ease-in-out"
              :class="open ? 'bg-surface-white shadow-sm' : 'hover:bg-surface-gray-3'"
            >
              <!-- The full wordmark (icon + "Azim Premji Foundation" text)
              only reads properly at a wide aspect ratio - collapsed to the
              12px rail there's no honest way to show it, so collapsed falls
              back to the same initial-letter mark used when no logo is
              configured at all, rather than showing an unreadable sliver of
              a squeezed-down wordmark. -->
              <img
                v-if="typeof header.logo === 'string' && !collapsed"
                :src="header.logo"
                class="h-8 max-w-[4.5rem] flex-shrink-0 object-contain object-left"
                alt="Logo"
              />
              <span
                v-else-if="collapsed"
                class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-surface-gray-4 text-ink-gray-7"
              >
                {{ header.title.charAt(0).toUpperCase() }}
              </span>
              <div
                class="flex flex-1 flex-col truncate text-left duration-300 ease-in-out"
                :class="collapsed ? 'ml-0 w-0 overflow-hidden opacity-0' : 'ml-1 w-auto opacity-100'"
              >
                <div class="truncate text-sm font-medium leading-none text-ink-gray-8">
                  {{ header.title }}
                </div>
                <div class="mt-1 truncate text-[0.6875rem] leading-none text-ink-gray-6">
                  {{ header.subtitle }}
                </div>
              </div>
              <LucideIcon
                name="chevron-down"
                class="h-4 w-4 flex-shrink-0 text-ink-gray-6 duration-300 ease-in-out"
                :class="collapsed ? 'ml-0 w-0 overflow-hidden opacity-0' : 'ml-1 w-auto opacity-100'"
              />
            </button>
          </template>
        </Dropdown>
      </template>
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
        <!-- The AI assistant shortcut used to live here as a card, then a
        floating action button - now a TopNavbar icon button (see its own
        assistant Button) now that the sidebar is reserved for navigation
        (Settings & Master Data pinned, plus whichever module is open), not
        a mix of nav + utility + assistant entry points. -->
        <Dropdown :options="profileMenuOptions" placement="left" side="top" :offset="8">
          <template #default="{ open }">
            <button
              class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-surface-gray-3"
              :class="{ 'justify-center': isCollapsed, 'bg-surface-gray-3': open }"
            >
              <Avatar :image="avatarUrl" :label="session.full_name || session.user" size="sm" shape="square" />
              <span v-if="!isCollapsed" class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-ink-gray-7">
                  {{ session.full_name || session.user }}
                </span>
                <span class="block truncate text-xs text-ink-gray-5">
                  {{ session.user }}
                </span>
              </span>
            </button>
          </template>
        </Dropdown>
      </template>
    </Sidebar>
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

/* A divider above section 2 only (the currently-open OTHER module, e.g.
Budget Reports) - section 1 (Settings & Master Data, always pinned) is the
very first thing in the sidebar now, with nothing above it to divide from.
Sidebar.vue renders each section as a sibling div sharing this exact class
with no slot in between to inject an <hr> directly, so :nth-of-type(2)
targets that second section specifically. */
:deep(.flex.flex-col.mt-2:nth-of-type(2)) {
  margin-top: 0.75rem;
  border-top: 1px solid var(--outline-gray-1);
}

/* Sidebar.vue's own root scrolls the ENTIRE sidebar as one unit
(overflow-y-auto on the outermost div) - fine when there's only the one
pinned section, but Settings & Master Data's 18 doctypes (plus a possible
second open-module section) can push the whole sidebar - including the
profile footer - into scrolling together. Disabling the root's own scroll
and instead making just the pinned section (:nth-of-type(1)) scroll within
its own bounded height keeps the footer always visible, with only the
module item list scrolling on its own. flex-shrink:0 on the footer
(Sidebar.vue's own `.mt-auto` block, holding the profile row + collapse)
stops it from being squeezed/overlapped by the module section above it -
without it, a tall item list could shrink flex:1 1 auto's sibling further
than its own content needs, since flex items shrink by default.

margin-top:auto on that same footer block is Sidebar.vue's own mechanism
for pinning it to the bottom of the sidebar by default - kept as-is; only
flex-shrink is added here so a tall module item list can't squeeze the
footer smaller than its own content needs. */
:deep(.overflow-y-auto.overflow-x-hidden) {
  overflow-y: hidden;
}
:deep(.mt-auto.flex.flex-col) {
  flex-shrink: 0;
}
:deep(.flex.flex-col.mt-2:nth-of-type(1)) {
  /* flex-grow:0 (not 1) - this section should only take the height its own
  items actually need, up to whatever room is left above the footer, NOT
  stretch to fill all remaining space when the item list is short enough
  to fit without scrolling. flex-shrink:1 + min-height:0 is what actually
  matters for the "scroll instead of overflowing past the footer" behavior
  on a LONG list. */
  flex: 0 1 auto;
  min-height: 0;
  overflow-y: auto;
  /* Same thin-scrollbar treatment as .fc-scroll-wrapper (index.css) - the
  browser default scrollbar reads as oversized in a narrow 17rem sidebar
  column. scrollbar-width is Firefox's own property; the
  ::-webkit-scrollbar-* rules below cover Chromium/Safari. */
  scrollbar-width: thin;
}
:deep(.flex.flex-col.mt-2:nth-of-type(1))::-webkit-scrollbar {
  width: 5px;
}
:deep(.flex.flex-col.mt-2:nth-of-type(1))::-webkit-scrollbar-track {
  background: transparent;
}
:deep(.flex.flex-col.mt-2:nth-of-type(1))::-webkit-scrollbar-thumb {
  background-color: var(--outline-gray-3);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* The pinned section's own label ("Settings & Master Data") sits inside
that same scrolling box (SidebarSection.vue renders label + item list as
one flex column, no separate scroll region for each) - pin it to the top
of the scroll area so it stays visible as a heading while the item list
underneath it scrolls past. Needs its own opaque background (matching the
sidebar's own bg-surface-menu-bar) so scrolled-past items don't show
through underneath it.

top:0 here needs the scroll CONTAINER (:nth-of-type(1) above) to have zero
padding-top of its own - a sticky child's top:0 anchors to the padding
edge of its nearest scrolling ancestor, not its border edge, so any
padding-top on that ancestor opens a gap between the container's actual
scroll boundary and where the sticky element starts covering content -
a scrolled-past item can render fully visible in that gap, appearing to
poke out above the sticky label even though the label itself has a solid,
fully opaque background. That's why this container gets no padding-top of
its own: it's given to THIS element instead, as padding-top (not
margin-top - a margin sits outside this element's own border box, so the
sticky background painted on that box still wouldn't cover it and the same
gap would just move one level down; padding is inside the box the
background paints, so it's covered). */
:deep(.flex.flex-col.mt-2:nth-of-type(1) > div:first-child) {
  position: sticky;
  top: -8px;
  z-index: 1;
  padding-top: 8px;
  margin-top: -8px;
  background-color: var(--sticky-label-bg);
}
/* The label text itself (SidebarSection.vue's own <h3>, inside the sticky
wrapper above) - a bit of extra margin-top gives "Settings & Master Data"
some breathing room below the sidebar's own top edge instead of sitting
flush against it. */
:deep(.flex.flex-col.mt-2:nth-of-type(1) h3) {
  margin-top: 0.625rem;
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
(.mt-2:nth-of-type(1) above) is the only thing that ever bounds/scrolls
it. */
:deep(.flex.flex-col.mt-2:nth-of-type(1) nav) {
  max-height: none !important;
  overflow: visible !important;
}

/* Nav item labels (every module item) and the module
section heading (e.g. "Settings & Master Data") use frappe-ui's own
ink-gray-* tokens by default, which resolve to a mid-brightness gray in
dark mode (e.g. ink-gray-5 -> gray-300, the section heading; the item
Button's own ghost-variant ink token for item labels) rather than pure
white - legible, but noticeably dimmer than the rest of this app's
dark-mode text. Scoped to just nav's own item-label span and the section
h3 - NOT every button/span in the sidebar - so the profile dropdown's own
two-tone name/username hierarchy is left alone; it wasn't part of this.

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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Sidebar, SidebarItem, Avatar, Dropdown } from 'frappe-ui'
import LucideIcon from '@/components/LucideIcon.vue'
import navIcon from '@/components/navIcon'
import { session, logoutResource } from '@/data/session'
import { brandingResource, defaultAppIcon } from '@/data/branding'
import { activeModule } from '@/data/activeModule'
import { currentTheme } from '@/data/theme'
import { clearFrontendCache } from '@/data/clearCache'
import { openProfileSettings } from '@/data/profileModal'
import { useGravatarUrl } from '@/utils/gravatar'

defineProps({
  // Forced open (never icon-collapsed) when rendered inside the mobile
  // drawer, where Sidebar's own isMobile breakpoint check would otherwise
  // collapse it to icon-only regardless of the drawer's own wider width.
  disableCollapse: { type: Boolean, default: false },
})

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
  title: brandingResource.data?.app_title || 'Budget MIS',
  subtitle: session.full_name || session.user,
  // Falls back to the theme-aware full lockup (see defaultAppIcon in
  // branding.js, light/dark pair) when no admin-configured logo is set -
  // the #header template above renders this wide, not in a square slot,
  // since the sidebar surface itself flips light/dark with the theme
  // toggle and the wordmark's text color must switch along with it.
  logo: brandingResource.data?.app_logo || defaultAppIcon.value,
  menuItems: [
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
  ],
}))

// A dynamic module's own doctypes/[page_route] items -> sidebar item shape.
// Shared by the pinned Settings & Master Data section below and by
// whichever OTHER module is currently open (clicked from its Home tile),
// so both render identically rather than two near-duplicate mappings.
function dynamicModuleItems(mod) {
  return (mod.doctypes || []).map((item) => item.page_route
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
      })
}

// Every module (Settings & Master Data included - nothing is pinned
// anymore) only shows a sidebar section once it's actually open: a Home
// tile click, or landing directly on one of its routes (see router.js's
// beforeEach). AppLayout.vue doesn't even mount this component at all
// when activeModule is empty, but this still returns [] defensively.
const sections = computed(() => {
  if (!activeModule.value) return []
  return [{
    label: activeModule.value.label,
    items: dynamicModuleItems(activeModule.value),
  }]
})

// Same four items TopNavbar.vue's own profile dropdown offers (see its
// profileMenuOptions) - kept in sync so the account menu behaves
// identically whether it's reached from here (a module open) or there
// (no module open).
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
</script>
