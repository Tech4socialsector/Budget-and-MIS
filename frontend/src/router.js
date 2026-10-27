import { createRouter, createWebHistory, START_LOCATION } from 'vue-router'
import { session, initialUserCheck, userResource } from '@/data/session'
import { modulesResource, findModuleByRoute, findModuleByPageRoute, isSidebarModule } from '@/data/modules'
import { setActiveModule, clearActiveModule } from '@/data/activeModule'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
  },
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/budget-summary',
    name: 'BudgetSummary',
    component: () => import('@/pages/BudgetSummary.vue'),
  },
  {
    path: '/budget-dashboard',
    name: 'BudgetDashboard',
    component: () => import('@/pages/BudgetDashboard.vue'),
  },
  {
    path: '/foundation-consolidated',
    name: 'FoundationConsolidated',
    component: () => import('@/pages/FoundationConsolidated.vue'),
  },
  {
    path: '/monthly-mis',
    name: 'MonthlyMis',
    component: () => import('@/pages/MonthlyMis.vue'),
  },
  {
    path: '/erp-actuals',
    name: 'ErpActuals',
    component: () => import('@/pages/ErpActuals.vue'),
  },
  {
    path: '/budget-vs-actual',
    name: 'BudgetVsActual',
    component: () => import('@/pages/BudgetVsActual.vue'),
  },
  {
    path: '/:doctypeRoute',
    name: 'DoctypeList',
    component: () => import('@/pages/DoctypeList.vue'),
    props: (route) => ({ doctype: route.meta.resolvedDoctype }),
    meta: { remountOnParamChange: true },
  },
  {
    path: '/:doctypeRoute/new',
    name: 'DoctypeNew',
    component: () => import('@/pages/DoctypeForm.vue'),
    props: (route) => ({ doctype: route.meta.resolvedDoctype, isNew: true }),
    meta: { remountOnParamChange: true },
  },
  {
    path: '/:doctypeRoute/:name',
    name: 'DoctypeForm',
    component: () => import('@/pages/DoctypeForm.vue'),
    props: (route) => ({ doctype: route.meta.resolvedDoctype, name: route.params.name }),
    meta: { remountOnParamChange: true },
  },
]

let router = createRouter({
  history: createWebHistory('/budget-mis'),
  routes,
})

// Browser Back/Forward (and other in-SPA navigations) never re-check the
// server session on their own - Vue Router just swaps the client-side
// route from cached history state. If the session died server-side (logged
// out in another tab, expired, revoked) while session.user is still
// stale-truthy in memory, beforeEach's own !session.user check below would
// wave the navigation through onto fully-authenticated-looking UI with a
// dead session underneath it.
//
// Re-validate only when it can actually have changed: when the tab regains
// focus after being hidden, or after being idle a while - and do it in the
// background rather than blocking the navigation that triggered it.
const REVALIDATE_INTERVAL_MS = 60_000
let lastCheckedAt = 0

function recheckAuthIfStale() {
  const now = Date.now()
  if (now - lastCheckedAt < REVALIDATE_INTERVAL_MS) return
  lastCheckedAt = now
  // Deliberately NOT awaited by its caller (the beforeEach guard) - this
  // check exists purely to catch a session that died server-side while
  // session.user is still stale-truthy in memory (see the comment above),
  // not to gate the navigation the user is already trying to make. Router
  // guards fully await an async function before proceeding, so an earlier
  // version of this that awaited userResource.fetch() here silently froze
  // every navigation past the 60s mark on a live network round-trip - with
  // no loading indicator, since nothing renders until the guard resolves.
  // If the session really is dead, userResource's own onError sets
  // session.user = null, and the NEXT navigation's synchronous
  // `!session.user` check below sends it to /login as normal.
  userResource.fetch().catch(() => {})
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      lastCheckedAt = 0
      userResource.fetch().catch(() => {})
      // Module records (App Module Setting - Home tiles, sidebar items,
      // icons) are routinely edited directly in Desk while this tab sits
      // open elsewhere in the app - without this, an edit there would
      // only ever show up here after a hard reload, since nothing else
      // re-fetches modulesResource once it's already loaded (see
      // ensureModulesLoaded's own `if (modulesResource.data) return`
      // below, which is deliberately a one-time-per-session guard, not a
      // "never refetch" one).
      if (session.user) modulesResource.fetch().catch(() => {})
    }
  })
}

// modulesResource requires an authenticated session (it 403s as Guest), and
// this router module loads before login happens - so it must not fetch
// until we know session.user is set, and must actually fetch (not just
// wait on a promise from some earlier, possibly pre-login, call).
let modulesFetch = null
async function ensureModulesLoaded() {
  if (modulesResource.data) return
  if (!modulesFetch) {
    modulesFetch = modulesResource.fetch()
  }
  await modulesFetch.catch(() => {})
}

router.beforeEach(async (to, from, next) => {
  if (from === START_LOCATION) {
    // On the app's very first navigation, session.user isn't known yet -
    // it's only set once the initial frappe.auth.get_logged_user call
    // resolves. Awaiting that here (a no-op after it's settled) avoids
    // treating "not checked yet" as "logged out" and bouncing a real
    // session to /login.
    await initialUserCheck.catch(() => {})
  } else {
    recheckAuthIfStale()
  }

  if (to.name !== 'Login' && !session.user) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  if (to.name === 'Login' && session.user) {
    next({ name: 'Home' })
    return
  }

  if (session.user) {
    await ensureModulesLoaded()
  }

  if (to.params.doctypeRoute) {
    const item = findModuleByRoute(to.params.doctypeRoute)
    if (!item) {
      next({ name: 'Home' })
      return
    }
    to.meta.resolvedDoctype = item.doctype_name
    // Only a sidebar module (is_sidebar_module) shows a sidebar at all -
    // a direct module's own DocType item (its direct_doctype_name) is a
    // single Home tile and never opens one, so landing on its route
    // directly must not resurrect a sidebar either, same as the Page
    // branch below.
    if (isSidebarModule(item.module)) {
      setActiveModule(item.module)
    } else {
      clearActiveModule()
    }
  } else {
    // A sidebar module can list a "SPA Page" item (page_route = a named Vue
    // route like 'BudgetSummary') alongside or instead of DocType items, and
    // a direct module can itself resolve straight to one (direct.page_route)
    // - landing directly on one of these routes only shows a sidebar when it
    // belongs to a sidebar module; a direct module's own Page route is a Home
    // tile with no sidebar of its own (see Home.vue), so a direct/bookmarked
    // visit must behave the same way a Home-tile click already does.
    const dynamicItem = findModuleByPageRoute(to.name)
    if (dynamicItem && isSidebarModule(dynamicItem.module)) {
      setActiveModule(dynamicItem.module)
      return next()
    }
    // Any other route (Home, a flattened report route, or any route not
    // claimed by an App Module Setting record) isn't part of a sidebar
    // module - without this, a module set while browsing it earlier would
    // stay pinned in the sidebar forever, showing on every page.
    clearActiveModule()
  }

  next()
})

export default router
