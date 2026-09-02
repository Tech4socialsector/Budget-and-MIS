<!--
  Thin wrapper around CrCell that switches its display mode based on this
  page's "Show full numbers" toggle (injected from MonthlyMis.vue) - this
  is the Vue-native equivalent of the Desk page's misShowFullNumbers global
  + reRenderFromCache(): CrCell already supports both a Cr-in-cell mode
  ("cr", with a full-rupee tooltip) and a full-rupee-in-cell mode ("inr",
  with a Cr tooltip), so toggling just swaps which of those two existing
  modes is used - no new formatting logic needed, and no network refetch
  since this only changes a computed prop read off already-loaded refs.
-->
<template>
  <CrCell :value="value" :mode="mode" :context="context" />
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import CrCell from '@/components/foundationConsolidated/CrCell.vue'

defineProps({
  value: { type: Number, default: 0 },
  context: { type: String, default: '' },
})

// Injected as a ref from MonthlyMis.vue; falls back to a local non-reactive
// ref (always Cr mode) if used outside that page, so this component never
// throws when injection is absent.
const showFullNumbers = inject('misShowFullNumbers', ref(false))
const mode = computed(() => (showFullNumbers.value ? 'inr' : 'cr'))
</script>
