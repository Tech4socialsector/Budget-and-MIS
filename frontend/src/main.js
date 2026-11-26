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

let app = createApp(App)

app.use(router)
app.mount('#app')
