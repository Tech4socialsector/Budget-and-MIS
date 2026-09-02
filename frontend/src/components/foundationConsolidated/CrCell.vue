<!--
  A single amount cell that replicates the Desk page's CrTooltip mechanism
  (consolidated_budget.js's fmtCr/fmtCrDash/fmtINRCrTip): hover shows a
  floating tooltip with the "other" representation of the same number - if
  the cell displays a rounded Cr value, the tooltip shows the full rupee
  amount, and vice versa.

  mode="cr"  -> cell shows "1.23 Cr" (or "-" if zero), tooltip shows full ₹.
  mode="inr" -> cell shows the full Indian-grouped rupee number (or "-"),
                tooltip shows the Cr-equivalent. Used by Annual/Actuals/
                Budget & Actuals tabs, which display full INR in-cell
                (opposite convention from PPT/SummaryINR/Headcount/Quarter
                Phasing, which display Cr in-cell).

  A page-level "Show full numbers" toggle can override the mode prop
  entirely: FoundationConsolidated.vue provide()s a showFullNumbers ref
  under the same injection key MisAmount.vue reads on Monthly MIS
  ('misShowFullNumbers') - when present, every CrCell on the page switches
  to 'inr' together rather than each tab needing its own toggle wiring.
  Falls back to the mode prop when no such toggle is in scope (e.g. inside
  BudgetDrilldownModal, which has its own separate showFullNumbers).

  `context` is an optional breadcrumb string shown as the tooltip's second
  line (e.g. "Azim Premji Schools · FY26-27 Plan · Opex"), matching the
  Desk page's per-cell context labels.
-->
<template>
  <AppTooltip placement="top" :delay="150">
    <span class="cursor-help border-b border-dotted border-gray-400 tabular-nums">{{ display }}</span>
    <template #content>
      <div class="text-[13px] font-semibold">{{ tooltipMain }}</div>
      <div v-if="context" class="mt-0.5 text-[11px] font-normal text-gray-300">{{ context }}</div>
    </template>
  </AppTooltip>
</template>

<script setup>
import { computed, inject } from 'vue'
import AppTooltip from '@/components/AppTooltip.vue'
import { formatCrDash, formatFullRupees, formatCrTooltip, formatINR } from '@/data/foundationConsolidatedData'

const props = defineProps({
  value: { type: Number, default: 0 },
  mode: { type: String, default: 'cr' }, // 'cr' | 'inr'
  context: { type: String, default: '' },
})

const pageShowFullNumbers = inject('misShowFullNumbers', null)
const effectiveMode = computed(() => (pageShowFullNumbers ? (pageShowFullNumbers.value ? 'inr' : 'cr') : props.mode))

const display = computed(() => (effectiveMode.value === 'inr' ? formatINR(props.value) : formatCrDash(props.value)))
const tooltipMain = computed(() => (effectiveMode.value === 'inr' ? formatCrTooltip(props.value) : formatFullRupees(props.value)))
</script>
