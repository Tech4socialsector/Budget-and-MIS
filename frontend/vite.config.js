import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'
import Components from 'unplugin-vue-components/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    frappeui({
      frontendRoute: '/annual_budget',
    }),
    vue(),
    Components({
      dirs: ['src/components', 'src/pages'],
      dts: false,
    }),
    VitePWA({
      // No manifest generated here - the actual <link rel="manifest"> in
      // index.html points at annual_budget.api.pwa.get_pwa_manifest, which
      // builds it live from Master Settings.app_title/app_logo (see
      // src/App.vue and api/pwa.py) so branding changes don't need a
      // rebuild. This plugin's only job is the offline app-shell service
      // worker below.
      manifest: false,
      injectManifest: false,
      // injectRegister:false means this plugin never injects its own
      // registration script or consumes registerType - registration and
      // update handling are done by hand in PwaUpdatePrompt.vue instead
      // (auto-applies updates and reloads, rather than waiting on a
      // dismissible prompt), because the service worker must be served
      // from Frappe's /annual_budget/sw.js route, not Vite's asset path.
      injectRegister: false,
      workbox: {
        // Only the app shell (JS/CSS/icons Vite actually built) is
        // precached - API responses are deliberately never cached here, so
        // a user never sees stale budget data while offline; they'll just
        // get a clear network-error state from the app itself instead.
        globPatterns: ['**/*.{js,css,png,svg,ico}'],
        // Neither 'index.html' nor '/annual_budget' can ever be
        // glob-precached: Frappe serves a Jinja-templated
        // annual_budget.html (with a per-request CSRF token) for every
        // /annual_budget/* route, not a static build file. The
        // runtimeCaching rule below is the actual offline-shell mechanism
        // instead: it caches /annual_budget the first time it's visited
        // online, and serves that cached copy on later requests if the
        // network fails - no precache entry required.
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.mode === 'navigate' && url.pathname.startsWith('/annual_budget'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'annual-budget-app-shell',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 5 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
