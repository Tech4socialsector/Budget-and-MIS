// Module-level (not component-level) cache for TrialBalanceCheckTab.vue's
// own get_trial_balance_from_erp response, keyed by financial_year+month -
// same reasoning as monthlyMisCache.js (see its own header comment):
// TrialBalanceCheckTab.vue is destroyed and recreated every time the user
// switches away from and back to its tab (MonthlyMis.vue renders it behind
// a v-if, not a <KeepAlive>), so a component-local "already loaded this
// filter combo" guard would be wiped on every switch, re-triggering a
// fetch for data the server already has ready to serve instantly (the
// endpoint reads from the persisted ERP Data store (data_type="Trial
// Balance"), kept fresh by the same scheduled sync job as actuals - see
// erp_data_sync.refresh_erp_data - rather than live-fetching PeopleSoft on
// request). A plain JS module is what actually survives that remount.
const TTL_MS = 15 * 60 * 1000

const cache = new Map()

function cacheKey(financialYear, month) {
  return `${financialYear}|${month}`
}

export function getCachedTrialBalance(financialYear, month) {
  const entry = cache.get(cacheKey(financialYear, month))
  if (!entry) return null
  if (Date.now() - entry.cachedAt > TTL_MS) {
    cache.delete(cacheKey(financialYear, month))
    return null
  }
  return entry.result
}

export function setCachedTrialBalance(financialYear, month, result) {
  cache.set(cacheKey(financialYear, month), { result, cachedAt: Date.now() })
}
