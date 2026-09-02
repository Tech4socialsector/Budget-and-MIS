<template>
  <FrappeUIProvider>
    <router-view />
  </FrappeUIProvider>
  <PwaUpdatePrompt />
</template>

<script setup>
import { watch } from 'vue'
import { FrappeUIProvider } from 'frappe-ui'
import '@/data/session'
import '@/data/theme'
import { brandingResource } from '@/data/branding'
import PwaUpdatePrompt from '@/components/PwaUpdatePrompt.vue'

// The browser tab icon should match whatever logo is actually configured
// in Master Settings (app_logo, editable by an admin at any time) rather
// than a static file baked in at build time. index.html ships a default
// favicon.png as a fallback for the moment before this resolves (and for
// sites that haven't set a logo at all).
watch(
  () => brandingResource.data?.app_logo,
  (logo) => {
    if (!logo) return
    const link = document.getElementById('app-favicon')
    if (link) link.href = logo
  },
  { immediate: true },
)
</script>
