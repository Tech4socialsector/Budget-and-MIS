import { computed, ref } from 'vue'
import { flatModuleItems, modulesResource } from '@/data/modules'
import { toggleTheme } from '@/data/theme'
import { toggleAssistant } from '@/data/aiAssistant'
import { logoutResource } from '@/data/session'
import navIcon from '@/components/navIcon'

export const showCommandPalette = ref(false)
export const commandPaletteQuery = ref('')

// Every navigable destination in the app, as one flat list the palette can
// fuzzy-filter: a sidebar module's own flattened doctypes (Settings &
// Master Data's 18 items) plus every direct module's own single
// destination (Dashboard, Budget Summary, Help & Support, ...) - the same
// item shapes Home.vue's own tiles and AppSidebar.vue's own sections
// already render, just gathered into one list here instead of split across
// module groupings, since a global search is about finding a destination
// by name, not browsing module-by-module.
const navigationItems = computed(() => {
  const items = flatModuleItems.value.map((item) => ({
    name: 'nav-' + (item.page_route || item.route),
    title: item.label || item.page_route || item.doctype_name,
    icon: navIcon(item.icon || item.module?.icon),
    to: item.page_route
      ? { name: item.page_route }
      : { name: 'DoctypeList', params: { doctypeRoute: item.route } },
  }))

  for (const mod of modulesResource.data || []) {
    if (mod.is_sidebar_module || !mod.direct) continue
    const direct = mod.direct
    items.push({
      name: 'nav-direct-' + mod.name,
      title: mod.label,
      icon: navIcon(mod.icon),
      to: direct.type === 'Page'
        ? { name: direct.page_route }
        : direct.type === 'DocType'
          ? { name: 'DoctypeList', params: { doctypeRoute: direct.route } }
          : undefined,
      onClick: direct.type === 'URL' ? () => window.open(direct.url, '_blank', 'noopener') : undefined,
    })
  }

  return items
})

// A handful of app-level actions worth surfacing here too, same as the
// reference frappe-ui docs palette mixes navigation with quick actions
// (toggle dark mode, copy a link, open GitHub) rather than being purely a
// page-finder.
const actionItems = computed(() => [
  {
    name: 'action-theme',
    title: 'Toggle dark mode',
    icon: navIcon('moon'),
    onClick: toggleTheme,
  },
  {
    name: 'action-assistant',
    title: 'Ask the AI assistant',
    icon: navIcon('message-circle'),
    onClick: toggleAssistant,
  },
  {
    name: 'action-desk',
    title: 'Go to Desk',
    icon: navIcon('layout-grid'),
    onClick: () => window.open('/app', '_self'),
  },
  {
    name: 'action-logout',
    title: 'Logout',
    icon: navIcon('log-out'),
    onClick: () => logoutResource.submit(),
  },
])

// CommandPalette (frappe-ui) does its own filtering via headlessui's
// Combobox internally? No - it renders whatever `groups` it's given
// as-is; filtering by query is this composable's job, same division of
// responsibility the reference docs search uses (search box decides what
// matches, palette just lists it).
function matches(title, query) {
  return title.toLowerCase().includes(query.toLowerCase())
}

export const commandPaletteGroups = computed(() => {
  const query = commandPaletteQuery.value.trim()
  const nav = query ? navigationItems.value.filter((i) => matches(i.title, query)) : navigationItems.value
  const actions = query ? actionItems.value.filter((i) => matches(i.title, query)) : actionItems.value

  const groups = []
  if (nav.length) groups.push({ title: 'Navigation', items: nav })
  if (actions.length) groups.push({ title: 'Quick actions', items: actions })
  return groups
})

export function openCommandPalette() {
  if (!modulesResource.data) modulesResource.fetch()
  commandPaletteQuery.value = ''
  showCommandPalette.value = true
}
