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
import { computed } from 'vue'
import iconNodes from 'lucide-static/icon-nodes.json'

// Drop-in replacement for frappe-ui's <FeatherIcon :name/>, rendering
// Lucide icons by name from one bundled JSON module (icon-nodes.json) -
// not frappe-ui's own `lucide-<name>` Tailwind utility classes, since a
// name only known at runtime (a prop here, a value read from the database
// via navIcon.js) never gets a compiled CSS rule from Tailwind's
// build-time class scanner and would silently render nothing.
const props = defineProps({ name: { type: String, required: true } })
defineOptions({ inheritAttrs: false })

const node = computed(() => iconNodes[props.name] || [])
const nodeTags = computed(() => node.value.map(([tag]) => tag))
const nodeAttrs = computed(() => node.value.map(([, attrs]) => attrs))
</script>
