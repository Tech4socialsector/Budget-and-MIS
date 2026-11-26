// Module-level (not component-level) cache for MonthlyMis.vue's own
// get_monthly_mis_page_data response, keyed by financial_year+month.
// MonthlyMis.vue is fully destroyed and recreated by Vue Router on every
// navigation away and back (no <KeepAlive> anywhere in this app), so any
// "already loaded this filter combo" guard kept as component-local state
// (a ref/reactive inside the component, the pattern FoundationConsolidated.vue
// uses for its own loadedFor checks) is wiped every single time the user
// revisits this page - the component's onMounted always re-fires and
// re-calls the backend, even though the server's own Redis cache
// (ERP Credentials.actuals_cache_duration_minutes, api/helper.py) still has
// the exact same data ready to serve instantly. A plain JS module (not a
// component - genuinely only evaluated once per page load, not per mount)
// is what actually survives a remount, so the cache lives here instead.
//
// TTL mirrors the server's own actuals cache duration philosophy: this
// frontend cache can never usefully outlive the server-side data it's
// shadowing, so once an entry is older than that duration it's treated as
// stale and re-fetched - same reasoning api/helper.py's own cached
// endpoints already use for sharing one TTL source rather than inventing a
// second, independent cache lifetime. Falls back to 15 minutes (matching
// get_actuals_cache_duration_seconds' own default) since this frontend
// cache has no way to read the live ERP Credentials setting itself.
const TTL_MS = 15 * 60 * 1000

const cache = new Map()

function cacheKey(financialYear, month) {
  return `${financialYear}|${month}`
}

export function getCachedMonthlyMisPage(financialYear, month) {
  const entry = cache.get(cacheKey(financialYear, month))
  if (!entry) return null
  if (Date.now() - entry.cachedAt > TTL_MS) {
    cache.delete(cacheKey(financialYear, month))
    return null
  }
  return entry.result
}

export function setCachedMonthlyMisPage(financialYear, month, result) {
  cache.set(cacheKey(financialYear, month), { result, cachedAt: Date.now() })
}
