import './index.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// A browser can restore this page from bfcache on Back/Forward instead of
// re-running the app - that would show whatever was in memory (including a
// logged-in view) without re-checking the server session at all. Forcing a
// real reload on a bfcache restore makes the router guard re-run against
// the server's actual (possibly now logged-out) session.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload()
  }
})

// Vite content-hashes every lazy-loaded route chunk (e.g. Home-D_zhoXZH.js)
// and a new build deletes the old file once its hash changes - a tab that's
// been open since before that rebuild still holds the OLD filename in its
// in-memory router config, so navigating to a route it hasn't loaded yet
// (or a page reload re-fetching one it had) 404s outright instead of
// rendering. Vite fires this event on exactly that failure (a dynamic
// import() rejecting) - reloading gets the tab a fresh index.html
// referencing the CURRENT chunk hashes, the same fix a manual hard refresh
// already provides, just automatic. sessionStorage guards against a loop if
// the reload itself doesn't fix it (e.g. genuinely offline).
window.addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem('vite-preload-reloaded')) return
  sessionStorage.setItem('vite-preload-reloaded', '1')
  window.location.reload()
})

let app = createApp(App)

app.use(router)
app.mount('#app')

// Once this fresh chunk set has actually mounted successfully, a LATER
// preload error is a new occurrence (e.g. the next rebuild), not the same
// one the reload above just recovered from - let it reload again too.
sessionStorage.removeItem('vite-preload-reloaded')
