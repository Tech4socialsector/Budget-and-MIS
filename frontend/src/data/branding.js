import { useCall } from 'frappe-ui'

export const brandingResource = useCall({
  url: '/api/v2/method/annual_budget.api.branding.get_app_branding',
  method: 'GET',
  cacheKey: 'annual-budget-app-branding',
})

// public/favicon.png ships bundled with the frontend build as a real
// default logo, so every logo spot has something to show before Master
// Settings' app_logo is configured (or if it's cleared later). The app is
// served under a non-root base path (frontendRoute: '/annual_budget'), so
// a hardcoded '/favicon.png' 404s - BASE_URL is Vite's own resolved base
// for the current build, the one place this should be read from.
export const defaultAppLogo = `${import.meta.env.BASE_URL}favicon.png`

// favicon.png is the full horizontal lockup (icon mark + "Azim Premji
// Foundation" wordmark) on its own white canvas - correct for the login
// page's fixed blue panel, wrong for any square "app icon" slot (sidebar
// header, loading spinner) that can sit directly on a surface that flips
// light/dark: the wordmark's dark text and the image's own white backing
// both go illegible or clash once that surface goes dark. app-icon.png is
// the icon mark alone, transparent-backed and cropped square - its blue
// is mid-toned enough to read cleanly on both a light and a dark surface,
// so one asset (not a light/dark pair) covers both themes.
export const defaultAppIcon = `${import.meta.env.BASE_URL}app-icon.png`
