import { computed } from 'vue'
import { useCall } from 'frappe-ui'

// Shared across the app so every page resolves the same module list without
// re-fetching: sidebar/router (route slug -> item).
// `immediate: false` - this module loads before login (imported by router.js),
// so it must not fetch until the caller knows there's an authenticated session.
//
// Shape returned by annual_budget.api.modules.get_app_modules:
// [{ label, icon, doctypes: [{ doctype_name, label, icon, route }] }]
export const modulesResource = useCall({
  url: '/api/v2/method/annual_budget.api.modules.get_app_modules',
  method: 'GET',
  immediate: false,
  cacheKey: 'annual-budget-app-modules',
})

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

export function findModuleByRoute(routeSlug) {
  return flatModuleItems.value.find((item) => item.route === routeSlug)
}

export function findModuleByDoctype(doctypeName) {
  return flatModuleItems.value.find((item) => item.doctype_name === doctypeName)
}

// A "SPA Page" item's page_route is a named Vue route (e.g. 'BudgetSummary'),
// not a doctypeRoute param - looked up by the router guard so landing
// directly on that route still marks its owning dynamic module active in
// the sidebar, the same way findModuleByRoute does for DocType items.
export function findModuleByPageRoute(routeName) {
  return flatModuleItems.value.find((item) => item.page_route === routeName)
}
