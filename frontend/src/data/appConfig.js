import { useCall } from 'frappe-ui'

// Authenticated-only settings (unlike branding.js's guest-allowed
// endpoint) - safe for every logged-in user to read, but not before login.
export const appConfigResource = useCall({
  url: '/api/v2/method/budget_mis.api.branding.get_app_config',
  method: 'GET',
  cacheKey: 'annual-budget-app-config',
  immediate: false,
})
