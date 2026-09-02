import { reactive } from 'vue'
import { createResource, setConfig, frappeRequest } from 'frappe-ui'
import router from '@/router'

// createResource() below fires an immediate fetch at module-evaluation time
// (see initialUserCheck) - that's before main.js reaches its own
// setConfig('resourceFetcher', ...) call, since importing this module (via
// App.vue) happens as part of resolving main.js's imports, ahead of any of
// main.js's executable statements. Without the resourceFetcher configured
// yet, createResource falls back to a raw fetch with no /api/method/
// prefixing, silently mis-resolving relative URLs against the current
// route instead of the site root. Configuring it here, at first point of
// use, guarantees it's set before any resource in this app can fetch.
setConfig('resourceFetcher', frappeRequest)

export const session = reactive({
  user: window.user && window.user !== 'Guest' ? window.user : null,
  user_language: null,
  user_image: null,
  full_name: null,
})

export const userResource = createResource({
  url: 'frappe.auth.get_logged_user',
  cache: 'frappe-user',
  onError() {
    session.user = null
  },
  onSuccess(user) {
    session.user = user
    fetchUserLanguage()
  },
})

// window.user boot data isn't present on every page load (only wired up
// for certain production render paths), so on a hard reload/direct
// navigation session.user starts out null until this fetch resolves. The
// router's navigation guard runs synchronously before that - without
// awaiting this promise it would treat "not yet known" the same as
// "logged out" and bounce a genuinely logged-in user to /login.
//
// This fetch runs on EVERY page load, including before login (when there's
// legitimately no session yet), which makes the server reply with a
// PermissionError - that's expected and already handled above via
// onError(). But createResource's fetch() always rejects its returned
// promise on failure regardless of onError, and this module-level
// assignment runs long before router.js gets a chance to await/catch it
// (only its own later .catch(() => {}) on this same promise does) - so an
// unawaited rejection here surfaces as an "Uncaught (in promise)" console
// error on every not-yet-authenticated load. Catching it here keeps the
// export usable as a promise for router.js to await while ensuring it can
// never reject unhandled.
export const initialUserCheck = userResource.fetch().catch(() => {})

export const userLanguageResource = createResource({
  url: 'frappe.client.get_value',
  makeParams: () => ({
    doctype: 'User',
    filters: session.user,
    fieldname: ['language', 'user_image', 'full_name'],
  }),
  onSuccess(data) {
    session.user_language = data?.language || null
    session.user_image = data?.user_image || null
    session.full_name = data?.full_name || null
  },
})

function fetchUserLanguage() {
  if (session.user) userLanguageResource.reload()
}

export const loginResource = createResource({
  url: 'login',
  makeParams({ email, password }) {
    return {
      usr: email,
      pwd: password,
    }
  },
  onSuccess() {
    loginResource.error = null
    userResource.reload().then(() => {
      router.replace({ name: 'Home' })
    })
  },
})

export const logoutResource = createResource({
  url: 'logout',
  async onSuccess() {
    session.user = null
    userResource.reset()
    // The service worker's app-shell cache (vite.config.js's
    // 'annual-budget-app-shell', NetworkFirst) can hold the last
    // successfully-fetched /annual_budget navigation document - including
    // its inlined per-session CSRF token/boot data - from before this
    // logout. If a later Back/reload's network request is slow or offline,
    // NetworkFirst falls back to that stale authenticated-looking shell
    // instead of erroring. Purging it here means the only fallback
    // available afterward is whatever gets cached AFTER this logout
    // (i.e. the login page itself, once visited).
    try {
      if ('caches' in window) await caches.delete('annual-budget-app-shell')
    } catch (e) {
      // Non-fatal - worst case the stale entry lingers until it's evicted
      // by the cache's own maxEntries:5 rotation.
    }
    window.location.reload()
  },
})

export function isLoggedIn() {
  return Boolean(session.user)
}
