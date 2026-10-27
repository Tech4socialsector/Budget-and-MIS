import { computed } from 'vue'
import { useCall } from 'frappe-ui'
import { currentTheme } from './theme.js'

export const brandingResource = useCall({
  url: '/api/v2/method/budget_mis.api.branding.get_app_branding',
  method: 'GET',
  cacheKey: 'annual-budget-app-branding',
})

// public/favicon.png ships bundled with the frontend build as a real
// default logo, so every logo spot has something to show before Master
// Settings' app_logo is configured (or if it's cleared later). The app is
// served under a non-root base path (frontendRoute: '/budget-mis'), so
// a hardcoded '/favicon.png' 404s - BASE_URL is Vite's own resolved base
// for the current build, the one place this should be read from.
export const defaultAppLogo = `${import.meta.env.BASE_URL}favicon.png`

// app-logo-light.png / app-logo-dark.png are the full horizontal lockup
// (icon mark + "Azim Premji Foundation" wordmark) - the wordmark is dark
// text in the light variant and white text in the dark variant, so unlike
// the old single-asset icon mark this pair must switch with the theme or
// the wordmark goes illegible against its surface.
export const defaultAppIcon = computed(() =>
  currentTheme.value === 'dark'
    ? `${import.meta.env.BASE_URL}app-logo-dark.png`
    : `${import.meta.env.BASE_URL}app-logo-light.png`
)
