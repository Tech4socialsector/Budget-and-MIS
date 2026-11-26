<template>
  <svg
    v-bind="$attrs"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <component :is="tag" v-for="(tag, i) in nodeTags" :key="i" v-bind="nodeAttrs[i]" />
  </svg>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import iconSubset from '@/assets/lucide-icon-subset.json'

// Drop-in replacement for frappe-ui's <FeatherIcon :name/>, rendering
// Lucide icons by name - not frappe-ui's own `lucide-<name>` Tailwind
// utility classes, since a name only known at runtime (a prop here, a value
// read from the database via navIcon.js) never gets a compiled CSS rule
// from Tailwind's build-time class scanner and would silently render
// nothing.
//
// lucide-static's own icon-nodes.json is 660KB+ for ~1600 icons; this app
// only ever uses a few dozen of them, but App Module Setting's `icon` field
// (budget_mis/master/doctype/app_module_setting/app_module_setting.json)
// is a free-text Icon picker, not a constrained Select - an admin can pick
// ANY Lucide icon name from Desk at any time, so hard-deleting the rest of
// the icon set isn't safe. iconSubset (src/assets/lucide-icon-subset.json)
// is a precomputed, verified-against-the-real-package subset covering
// every name this codebase's own source currently references (grepped
// across every LucideIcon/navIcon call site and every icon currently set
// on an App Module Setting fixture record) - the common case resolves
// instantly from this ~13KB file with no extra network round trip. A name
// outside that subset (an admin's newly-picked icon this subset predates)
// falls back to a dynamic import of the full icon-nodes.json, so it still
// renders correctly, just one chunk-load behind instead of unconditionally
// paying that cost on every single page load.
const props = defineProps({ name: { type: String, required: true } })
defineOptions({ inheritAttrs: false })

const fullIconNodes = ref(null)

watchEffect(() => {
  if (!(props.name in iconSubset) && !fullIconNodes.value) {
    import('lucide-static/icon-nodes.json').then((mod) => {
      fullIconNodes.value = mod.default
    })
  }
})

const node = computed(() => iconSubset[props.name] || fullIconNodes.value?.[props.name] || [])
const nodeTags = computed(() => node.value.map(([tag]) => tag))
const nodeAttrs = computed(() => node.value.map(([, attrs]) => attrs))
</script>
