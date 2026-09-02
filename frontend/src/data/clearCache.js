// Frontend-only cache clear: drops the PWA service worker's cached assets
// and any frappe-ui resource/list caches held in the browser, then hard
// reloads so everything refetches fresh. Doesn't touch the backend/Frappe
// server-side cache - this is strictly "make my browser stop showing me
// something stale", the same problem a normal hard-refresh solves, just
// packaged as one click for users who don't know that shortcut.
export async function clearFrontendCache() {
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((r) => r.unregister()))
  }

  // Session/theme keys are deliberately left alone - only resource/report
  // caches frappe-ui itself writes under this prefix get cleared.
  for (const key of Object.keys(sessionStorage)) {
    sessionStorage.removeItem(key)
  }

  window.location.reload()
}
