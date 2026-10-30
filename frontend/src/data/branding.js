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

// app-icon.png is the icon mark ALONE (square, solid-blue background, no
// embedded wordmark text) - for spots that already show this app's own
// name as a separate text label right next to the image (Login.vue's logo
// +name lockup). Using defaultAppIcon's wide 960x450 wordmark lockup there
// instead doubled up on branding (that image's own baked-in "Azim Premji
// Foundation" text sitting right beside a second, separate "Budget & MIS"
// label) and, being height-constrained only, rendered its icon-mark
// portion small relative to the adjacent app-name text. The square mark
// alone reads as a properly sized, balanced lockup instead. Solid
// background (not transparent-glyph-only), so unlike defaultAppIcon this
// doesn't need a separate dark-mode variant.
export const defaultAppMark = `${import.meta.env.BASE_URL}app-icon.png`
