import { computed } from 'vue'
import { useCall } from 'frappe-ui'

// Shared across the app so every page resolves the same module list without
// re-fetching: sidebar/router (route slug -> item).
// `immediate: false` - this module loads before login (imported by router.js),
// so it must not fetch until the caller knows there's an authenticated session.
//
// Shape returned by budget_mis.api.modules.get_app_modules:
// sidebar modules: { name, label, icon, is_sidebar_module: true, doctypes: [{ doctype_name, label, icon, route }] }
// direct modules:  { name, label, icon, is_sidebar_module: false, direct: { type: 'Page'|'DocType'|'URL', ... } }
export const modulesResource = useCall({
  url: '/api/v2/method/budget_mis.api.modules.get_app_modules',
  method: 'GET',
  immediate: false,
  cacheKey: 'annual-budget-app-modules',
})

export function isSidebarModule(mod) {
  return !!mod?.is_sidebar_module
}

// Flat list of every sidebar item across all modules, each tagged with its
// parent module, so a route slug can resolve back to both the DocType to
// render and the module section it belongs to in the sidebar.
export const flatModuleItems = computed(() => {
  const modules = modulesResource.data || []
  const items = []
  for (const mod of modules) {
    for (const item of mod.doctypes || []) {
      items.push({ ...item, module: mod })
    }
  }
  return items
})

// Direct-mode modules (is_sidebar_module off) never appear in flatModuleItems
// - their one destination lives on their own `direct` key, not a child-table
// row - so route resolution below checks both lists rather than just one.
const directModules = computed(() => (modulesResource.data || []).filter((mod) => !mod.is_sidebar_module))

export function findModuleByRoute(routeSlug) {
  const item = flatModuleItems.value.find((item) => item.route === routeSlug)
  if (item) return item
  const mod = directModules.value.find((mod) => mod.direct?.type === 'DocType' && mod.direct.route === routeSlug)
  if (!mod) return null
  return { doctype_name: mod.direct.doctype_name, route: mod.direct.route, module: mod }
}

export function findModuleByDoctype(doctypeName) {
  const item = flatModuleItems.value.find((item) => item.doctype_name === doctypeName)
  if (item) return item
  const mod = directModules.value.find((mod) => mod.direct?.type === 'DocType' && mod.direct.doctype_name === doctypeName)
  if (!mod) return null
  return { doctype_name: mod.direct.doctype_name, route: mod.direct.route, module: mod }
}

// A "SPA Page" item's page_route is a named Vue route (e.g. 'BudgetSummary'),
// not a doctypeRoute param - looked up by the router guard so landing
// directly on that route still marks its owning dynamic module active in
// the sidebar, the same way findModuleByRoute does for DocType items. Direct
// modules' own Page routes (Dashboard, Budget Summary, ...) no longer live in
// any child table at all, so they're checked here too.
export function findModuleByPageRoute(routeName) {
  const item = flatModuleItems.value.find((item) => item.page_route === routeName)
  if (item) return item
  const mod = directModules.value.find((mod) => mod.direct?.type === 'Page' && mod.direct.page_route === routeName)
  if (!mod) return null
  return { page_route: mod.direct.page_route, module: mod }
}
