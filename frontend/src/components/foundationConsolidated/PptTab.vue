<template>
  <ErrorMessage v-if="error" :message="errorMessage" />
  <div v-else-if="loading" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <AppLoader label="Building your foundation metrics..." />
  </div>
  <div v-else-if="!rows.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
    No data available.
    <button class="ml-1 text-fc-blue-mid underline" @click="$emit('retry')">Retry</button>
  </div>
  <template v-else>
    <div class="flex justify-end">
      <Button variant="solid" class="fc-xl-btn" :loading="exporting" @click="$emit('export')">
        <template #prefix><FeatherIcon name="download" class="h-4 w-4" /></template>
        Export XLS
      </Button>
    </div>

    <MainTable :title="mainTitle" :rows="rows" :budget-label="budgetLabel" :actual-label="actualLabel" />
    <MainTable :title="prevTitle" :rows="prevRows" :budget-label="prevBudgetLabel" :actual-label="prevActualLabel" />

    <template v-for="grp in educationGroups" :key="grp.name">
      <BreakdownEduTable :group="grp" />
    </template>

    <BreakdownUnitTable v-if="opexTable" :table="opexTable" />
    <BreakdownUnitTable v-if="capexTable" :table="capexTable" />
  </template>
</template>

<script setup>
import { computed, h } from 'vue'
import { Button, FeatherIcon, ErrorMessage } from 'frappe-ui'
import AppLoader from '@/components/AppLoader.vue'
import CrCell from './CrCell.vue'

const props = defineProps({
  loading: Boolean,
  error: { type: Object, default: null },
  rows: { type: Array, default: () => [] },
  prevRows: { type: Array, default: () => [] },
  mainTitle: { type: String, default: '' },
  prevTitle: { type: String, default: '' },
  budgetLabel: { type: String, default: '' },
  actualLabel: { type: String, default: '' },
  prevBudgetLabel: { type: String, default: '' },
  prevActualLabel: { type: String, default: '' },
  educationGroups: { type: Array, default: () => [] },
  opexTable: { type: Object, default: null },
  capexTable: { type: Object, default: null },
  exporting: Boolean,
})
defineEmits(['retry', 'export'])

const errorMessage = computed(() => props.error?.messages?.[0] || props.error?.message || 'Something went wrong loading Foundation Metrics.')

// Main Budget-vs-Actual table: Unit | Budget(Opex/Capex/Covid/Total) | Actual(Opex/Capex/Covid/Total)
const MainTable = {
  props: { title: String, rows: Array, budgetLabel: String, actualLabel: String },
  setup(p) {
    return () =>
      h('div', { class: 'flex flex-col gap-1' }, [
        h('div', { class: 'mt-6 flex flex-col gap-1' }, [
          h('div', { class: 'border-b border-fc-blue-mid pb-1 text-sm font-bold uppercase tracking-wide text-fc-blue-dark' }, p.title),
        ]),
        h('div', { class: 'fc-scroll-wrapper' }, [
          h('table', { class: 'fc-table w-full min-w-[900px] border-collapse text-sm' }, [
            h('thead', {}, [
              h('tr', { class: 'fc-thead-main' }, [
                h('th', { rowspan: 2, class: 'fc-th fc-sticky-col min-w-[220px] text-left' }, 'Unit'),
                h('th', { colspan: 4, class: 'fc-th text-center' }, p.budgetLabel),
                h('th', { colspan: 4, class: 'fc-th text-center' }, p.actualLabel),
              ]),
              h('tr', { class: 'fc-thead-sub' }, [
                h('th', { class: 'fc-th-sub' }, 'Opex'), h('th', { class: 'fc-th-sub' }, 'Capex'), h('th', { class: 'fc-th-sub' }, 'Covid'), h('th', { class: 'fc-th-sub' }, 'Total'),
                h('th', { class: 'fc-th-sub' }, 'Opex'), h('th', { class: 'fc-th-sub' }, 'Capex'), h('th', { class: 'fc-th-sub' }, 'Covid'), h('th', { class: 'fc-th-sub' }, 'Total'),
              ]),
            ]),
            h('tbody', {}, (p.rows || []).map((r) =>
              h('tr', { key: r.label, class: r.isTotal ? 'ppt-total-row font-bold' : '' }, [
                h('td', { class: 'fc-td fc-sticky-col bg-inherit text-left font-medium' }, r.label),
                ...['bOpex', 'bCapex', 'bCovid', 'bTotal', 'eOpex', 'eCapex', 'eCovid', 'eTotal'].map((k) =>
                  h('td', { key: k, class: 'fc-td text-right' }, [h(CrCell, { value: r[k], context: `${r.label} · ${k.startsWith('b') ? p.budgetLabel : p.actualLabel} · ${k.slice(1)}` })]),
                ),
              ]),
            )),
          ]),
        ]),
      ])
  },
}

// Education sub-tables: Unit | Budget(Opex/Capex/Total) | Actual(Opex/Capex/Total)
const BreakdownEduTable = {
  props: { group: Object },
  setup(p) {
    return () => {
      const g = p.group
      return h('div', { class: 'flex flex-col gap-1' }, [
        h('div', { class: 'mt-6 flex flex-col gap-1' }, [
          h('div', { class: 'border-b border-fc-blue-mid pb-1 text-sm font-bold uppercase tracking-wide text-fc-blue-dark' }, g.title),
        ]),
        h('div', { class: 'fc-scroll-wrapper' }, [
          h('table', { class: 'fc-table w-full min-w-[800px] border-collapse text-sm' }, [
            h('thead', {}, [
              h('tr', { class: 'fc-thead-main' }, [
                h('th', { rowspan: 2, class: 'fc-th fc-sticky-col min-w-[200px] text-left' }, 'Unit'),
                h('th', { colspan: 3, class: 'fc-th text-center' }, g.bLbl),
                h('th', { colspan: 3, class: 'fc-th text-center' }, g.eLbl),
              ]),
              h('tr', { class: 'fc-thead-sub' }, [
                h('th', { class: 'fc-th-sub' }, 'Opex'), h('th', { class: 'fc-th-sub' }, 'Capex'), h('th', { class: 'fc-th-sub' }, 'Total'),
                h('th', { class: 'fc-th-sub' }, 'Opex'), h('th', { class: 'fc-th-sub' }, 'Capex'), h('th', { class: 'fc-th-sub' }, 'Total'),
              ]),
            ]),
            h('tbody', {}, [
              ...g.rows.map((r) =>
                h('tr', { key: r.label }, [
                  h('td', { class: 'fc-td fc-sticky-col bg-white text-left dark:bg-gray-900' }, r.label),
                  ...['bOpex', 'bCapex', 'bTotal', 'eOpex', 'eCapex', 'eTotal'].map((k) =>
                    h('td', { key: k, class: 'fc-td text-right' }, [h(CrCell, { value: r[k] })]),
                  ),
                ]),
              ),
              h('tr', { class: 'ppt-total-row font-bold' }, [
                h('td', { class: 'fc-td fc-sticky-col bg-inherit text-left' }, 'Total'),
                ...['bOpex', 'bCapex', 'bTotal', 'eOpex', 'eCapex', 'eTotal'].map((k) =>
                  h('td', { key: k, class: 'fc-td text-right' }, [h(CrCell, { value: g.total[k] })]),
                ),
              ]),
            ]),
          ]),
        ]),
      ])
    }
  },
}

// Opex/Capex Budget breakdown: rows = sub-head/item names, cols = one per
// unit + Grand Total.
const BreakdownUnitTable = {
  props: { table: Object },
  setup(p) {
    return () => {
      const t = p.table
      return h('div', { class: 'flex flex-col gap-1' }, [
        h('div', { class: 'mt-6 flex flex-col gap-1' }, [
          h('div', { class: 'border-b border-fc-blue-mid pb-1 text-sm font-bold uppercase tracking-wide text-fc-blue-dark' }, t.title),
        ]),
        h('div', { class: 'fc-scroll-wrapper' }, [
          h('table', { class: 'fc-table w-full min-w-[700px] border-collapse text-sm' }, [
            h('thead', {}, [
              h('tr', { class: 'fc-thead-main' }, [
                h('th', { class: 'fc-th fc-sticky-col min-w-[240px] text-left' }, 'Expense Category'),
                ...t.units.map((u) => h('th', { key: u, class: 'fc-th text-center' }, u)),
                h('th', { class: 'fc-th bg-fc-blue-dark text-center' }, 'Grand Total'),
              ]),
            ]),
            h('tbody', {}, [
              ...t.rows.map((r) =>
                h('tr', { key: r.name }, [
                  h('td', { class: 'fc-td fc-sticky-col bg-white text-left dark:bg-gray-900' }, r.name),
                  ...r.cells.map((v, i) => h('td', { key: i, class: 'fc-td text-right' }, [h(CrCell, { value: v })])),
                  h('td', { class: 'fc-td bg-fc-gt-col text-right font-bold text-fc-blue-dark' }, [h(CrCell, { value: r.rowTotal })]),
                ]),
              ),
              h('tr', { class: 'ppt-total-row font-bold' }, [
                h('td', { class: 'fc-td fc-sticky-col bg-inherit text-left' }, 'Total'),
                ...t.totalsRow.map((v, i) => h('td', { key: i, class: 'fc-td text-right' }, [h(CrCell, { value: v })])),
                h('td', { class: 'fc-td bg-fc-gt-col text-right' }, [h(CrCell, { value: t.grandTotal })]),
              ]),
            ]),
          ]),
        ]),
      ])
    }
  },
}
</script>
