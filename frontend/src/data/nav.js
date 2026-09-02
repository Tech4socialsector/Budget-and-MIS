// Static nav structure for the sidebar/Home page.
//
// baseSections are always visible in the sidebar (currently just Home /
// Budget Dashboard, unlabeled). staticModules are NOT shown by default -
// each is its own clickable tile on Home (like the chw reference app's
// backend-driven App Module Setting tiles), and only becomes a sidebar
// section once the user opens it (clicking its tile, or landing directly
// on one of its routes) - see data/activeModule.js and router.js's
// beforeEach, which keeps the right module active while browsing routes
// that belong to it and clears it otherwise.
export const baseSections = [
  {
    label: '',
    icon: 'home',
    items: [
      { label: 'Home', icon: 'home', routeName: 'Home' },
      { label: 'Dashboard', icon: 'pie-chart', routeName: 'BudgetDashboard' },
    ],
  },
]

export const staticModules = [
  {
    label: 'Budget Reports',
    icon: 'bar-chart-2',
    items: [
      { label: 'Budget Summary', icon: 'bar-chart-2', routeName: 'BudgetSummary' },
    ],
  },
  {
    label: 'MIS Reports',
    icon: 'file-text',
    items: [
      { label: 'Foundation Consolidated', icon: 'file-text', routeName: 'FoundationConsolidated' },
      { label: 'Monthly MIS', icon: 'calendar', routeName: 'MonthlyMis' },
      { label: 'ERP Actuals', icon: 'database', routeName: 'ErpActuals' },
    ],
  },
]

// Every route name across all static modules -> its owning module, so the
// router guard can setActiveModule() for a direct/bookmarked/refreshed
// visit to one of these routes without needing to enumerate them itself.
export function findStaticModuleByRouteName(routeName) {
  for (const mod of staticModules) {
    if (mod.items.some((item) => item.routeName === routeName)) return mod
  }
  return null
}
