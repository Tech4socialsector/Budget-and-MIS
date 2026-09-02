import { createRouter, createWebHistory, START_LOCATION } from 'vue-router'
import { session, initialUserCheck, userResource } from '@/data/session'
import { modulesResource, findModuleByRoute, findModuleByPageRoute } from '@/data/modules'
import { setActiveModule, clearActiveModule } from '@/data/activeModule'
import { findStaticModuleByRouteName } from '@/data/nav'

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
  history: createWebHistory('/annual_budget'),
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
    // Keep the sidebar's module section in sync while browsing that
    // module's list/form pages, so it persists across navigation there.
    setActiveModule(item.module)
  } else {
    // A dynamic App Module Setting module can list a "SPA Page" item
    // (page_route = a named Vue route like 'BudgetSummary') alongside or
    // instead of DocType items - landing directly on that route must show
    // its owning module in the sidebar the same way a DocType item does
    // above, checked first since it's backend-driven and can override a
    // page that's ALSO listed as a hardcoded staticModule fallback below.
    const dynamicItem = findModuleByPageRoute(to.name)
    if (dynamicItem) {
      setActiveModule(dynamicItem.module)
      return next()
    }
    // Budget Reports / MIS Reports are staticModules (data/nav.js) - a
    // hardcoded fallback for routes no App Module Setting record claims
    // yet. Landing directly on one of their routes (a bookmark, a refresh,
    // an in-page link) must still show that module's section, exactly like
    // a dynamic module does above, so isStatic marks it for AppSidebar's
    // separate static-module render branch (its items are named routes,
    // not doctypeRoute params).
    const staticMod = findStaticModuleByRouteName(to.name)
    if (staticMod) {
      setActiveModule({ ...staticMod, isStatic: true })
    } else {
      // Any other route (Home, Budget Dashboard) isn't part of a module at
      // all - without this, a module set while browsing it earlier would
      // stay pinned in the sidebar forever, showing on every page.
      clearActiveModule()
    }
  }

  next()
})

export default router
