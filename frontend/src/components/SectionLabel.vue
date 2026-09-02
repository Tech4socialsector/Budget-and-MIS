<!--
  Section heading style used for labeled table sections across the app
  (Foundation Consolidated's "A. Unit Wise Plan" etc., Monthly MIS's
  "Operating Expense"/"Capital Expense", and any future page that needs
  the same pattern) - a single shared component so this design can't drift
  per-page the way it already had (Monthly MIS previously defined its own
  slightly different inline version: 2px border instead of 1px, gray text
  instead of blue). Optionally paired with a subtitle line underneath.
-->
<template>
  <div class="mt-6 flex flex-col gap-1">
    <div class="border-b border-fc-blue-mid pb-1 text-sm font-bold uppercase tracking-wide text-fc-blue-dark">
      {{ text }}
    </div>
    <div v-if="subtitle" class="text-sm font-semibold text-fc-blue-mid">
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>
