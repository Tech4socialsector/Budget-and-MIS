import { useCall } from 'frappe-ui'

// Authenticated-only settings (unlike branding.js's guest-allowed
// endpoint) - safe for every logged-in user to read, but not before login.
//
// Deliberately NOT given a cacheKey: can_manage_settings is a genuine
// per-user permission check (frappe.has_permission("Master Settings",
// "write"), api/branding.py's get_app_config) - a cacheKey'd useCall
// persists its response to IndexedDB and shows that stale value immediately
// on the next load/session while the real fetch is still in flight (same
// bug class fixed for modulesResource in data/modules.js). ProfileSettingsModal.vue's
// own `if (!appConfigResource.data) appConfigResource.fetch()` guard only
// fetches fresh the FIRST time .data is falsy - a stale cached
// can_manage_settings: true from a previous (System Manager) session/user
// on this browser would satisfy that guard immediately and never get
// corrected, showing the App Settings tab to a user who shouldn't see it.
export const appConfigResource = useCall({
  url: '/api/v2/method/budget_mis.api.branding.get_app_config',
  method: 'GET',
  immediate: false,
})
