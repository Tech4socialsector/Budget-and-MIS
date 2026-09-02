<template>
  <!-- No template - this only registers the service worker and surfaces
  update/offline-ready state via toast. Kept as a component (mounted once
  in App.vue) rather than a bare side-effect module so it participates in
  Vue's lifecycle the same way the rest of this app's singletons do. -->
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'frappe-ui'

// vite-plugin-pwa's build output physically lives under the app's built
// assets directory (/assets/annual_budget/frontend/sw.js). A service
// worker can only control paths at-or-below wherever it's served from, so
// registering it there would cap its scope to that assets path - useless
// for an app that lives at /annual_budget/. sw_renderer.py serves the same
// built file at /annual_budget/sw.js instead, so Workbox is driven
// directly here with that URL hardcoded.
const needRefresh = ref(false)
const updateServiceWorker = ref(() => {})

onMounted(async () => {
  if (!('serviceWorker' in navigator)) return

  const { Workbox } = await import('workbox-window')
  const wb = new Workbox('/annual_budget/sw.js', { scope: '/annual_budget/' })

  // Auto-update: a new build takes over and reloads the page on its own,
  // rather than waiting on a "Refresh" toast the user has to notice and
  // click. That toast previously left a stale bundle (old JS/CSS) being
  // served indefinitely on any tab a user didn't happen to act on - most
  // visibly, table CSS fixes silently not applying for users already on
  // the page. autoUpdated is a one-shot per Workbox instance because
  // `installed`(isUpdate) and `waiting` can both fire for the same update.
  let autoUpdated = false
  let controllingListenerAdded = false
  const applyUpdate = () => {
    if (autoUpdated) return
    autoUpdated = true
    if (!controllingListenerAdded) {
      controllingListenerAdded = true
      wb.addEventListener('controlling', () => window.location.reload())
    }
    updateServiceWorker.value()
  }

  wb.addEventListener('installed', (event) => {
    if (event.isUpdate || event.isExternal) {
      applyUpdate()
    } else {
      toast.success('The app is ready to work offline.')
    }
  })
  wb.addEventListener('waiting', () => applyUpdate())

  updateServiceWorker.value = () => wb.messageSkipWaiting()

  wb.register().catch((error) => {
    // Non-fatal - the app still works online exactly as before, it just
    // won't be installable/offline-capable until the SW registers
    // successfully on a later visit. Not worth alarming the user over.
    console.error('Service worker registration failed', error)
  })
})
</script>
