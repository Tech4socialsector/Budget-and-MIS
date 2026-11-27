<!--
  Drill-down for one cell of Trial Balance Check's "Adjustment by Unit"
  table: lists the YTD Monthly Adjustment lines behind that unit + method
  (or every unit / every method for the Grand Total row / Total column),
  summed per cost center + location + GL code, via
  budget_mis.api.trial_balance.get_adjustment_unit_drilldown.
-->
<template>
  <Dialog v-model="show" :options="{ size: '6xl', title: 'adjustment-drilldown' }">
    <template #body>
      <div class="flex max-h-[90vh] flex-col sm:min-h-[36rem]">
        <div class="border-b px-5 py-4 dark:border-gray-800">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <button
                v-if="selectedLine"
                class="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                title="Back"
                @click="selectedLine = null"
              >
                <FeatherIcon name="arrow-left" class="h-4.5 w-4.5" />
              </button>
              <span v-else class="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-fc-blue-light text-fc-blue-mid dark:bg-fc-blue-mid/20 dark:text-fc-blue-light">
                <FeatherIcon name="layers" class="h-4.5 w-4.5" />
              </span>
              <div class="min-w-0">
                <div class="text-xs font-medium uppercase tracking-wide text-gray-900 dark:text-gray-300">Adjustment Drill Down</div>
                <h2 class="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <template v-if="selectedLine">
                    {{ selectedLine.cost_center }} {{ selectedLine.cost_center_description }} · {{ selectedLine.location_code }} {{ selectedLine.location_description }}
                  </template>
                  <template v-else>{{ data?.unit_label || unitLabel }}</template>
                </h2>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  <template v-if="selectedLine">
                    GL {{ selectedLine.gl_code }} {{ selectedLine.gl_description }} · {{ selectedLine.method }} · Month wise
                  </template>
                  <template v-else>{{ methodLabel }} · YTD {{ month }} {{ financialYear }}</template>
                </div>
              </div>
            </div>
            <div class="flex flex-shrink-0 items-center gap-2">
              <DrilldownExportButton v-if="data && currentRows.length" :get-payload="exportPayload" />
              <button
                class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                @click="show = false"
              >
                <FeatherIcon name="x" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div v-if="selectedLine" class="mt-3 flex flex-wrap items-center gap-1 text-xs">
            <button
              class="rounded px-1.5 py-0.5 font-medium text-fc-blue-mid transition hover:bg-fc-blue-light dark:text-fc-blue-light dark:hover:bg-gray-800"
              @click="selectedLine = null"
            >
              {{ data?.unit_label || unitLabel }}
            </button>
            <FeatherIcon name="chevron-right" class="h-3 w-3 flex-shrink-0 text-gray-300 dark:text-gray-600" />
            <span class="px-1.5 py-0.5 font-medium text-gray-900 dark:text-gray-100">
              {{ selectedLine.cost_center }} · {{ selectedLine.location_code }} · {{ selectedLine.gl_code }}
            </span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5">
          <AppLoader v-if="loading" />
          <ErrorMessage v-else-if="error" :message="error" />
          <template v-else-if="data">
            <!-- Summary card, same block the other drill-downs open with -->
            <div class="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex items-center gap-6">
                  <div>
                    <div class="text-xs uppercase tracking-wide text-gray-900 dark:text-gray-300">Total Adjustment</div>
                    <div class="mt-1 text-2xl font-semibold" :class="currentTotal < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'">
                      {{ formatAmount(currentTotal) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs uppercase tracking-wide text-gray-900 dark:text-gray-300">{{ selectedLine ? 'Months' : 'Lines' }}</div>
                    <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ currentRows.length }}</div>
                  </div>
                </div>
                <Switch v-model="showFullNumbers" label="Show full numbers" />
              </div>
              <div v-if="currentRows.length > 1" class="mt-4">
                <div class="flex h-2.5 w-full overflow-hidden rounded-full">
                  <AppTooltip
                    v-for="(row, i) in currentRows"
                    :key="'seg-' + i"
                    class="first:rounded-l-full last:rounded-r-full overflow-hidden"
                    :style="{ width: sharePct(row) + '%', minWidth: sharePct(row) > 0 ? '2px' : 0 }"
                    :text="`${selectedLine ? row.month : row.cost_center + ' · ' + row.location_code}: ${sharePct(row)}%`"
                  >
                    <span
                      class="block h-full w-full"
                      :style="{ backgroundColor: accentColor(i) }"
                    />
                  </AppTooltip>
                </div>
              </div>
            </div>

            <!-- Second level: the clicked line, month by month -->
            <template v-if="selectedLine">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">
                  <FeatherIcon name="calendar" class="h-3.5 w-3.5" />
                  Month wise
                  <span v-if="search" class="font-normal normal-case text-gray-500 dark:text-gray-400">· {{ currentRows.length }} of {{ selectedLine.month_rows?.length || 0 }}</span>
                </div>
                <DrilldownSearch v-model="search" />
              </div>
              <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                <table class="w-full min-w-[480px] border-collapse text-sm">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-800">
                      <th class="border-b border-gray-200 px-4 py-2.5 text-left font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Month</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Share</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 text-right font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Adjustment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, i) in currentRows"
                      :key="row.month"
                      class="border-t border-gray-100 transition odd:bg-white even:bg-gray-50/60 dark:border-gray-800 dark:odd:bg-transparent dark:even:bg-gray-800/30"
                    >
                      <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        <span class="flex items-center gap-2">
                          <span class="h-2 w-2 flex-shrink-0 rounded-full" :style="{ backgroundColor: accentColor(i) }" />
                          {{ row.month }} {{ monthYear(row.month) }}
                        </span>
                      </td>
                      <td class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800">
                        <div class="flex items-center justify-end gap-2">
                          <span class="text-xs text-gray-500 dark:text-gray-400">{{ sharePct(row) }}%</span>
                          <span class="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <span class="block h-full rounded-full" :style="{ width: sharePct(row) + '%', backgroundColor: accentColor(i) }" />
                          </span>
                        </div>
                      </td>
                      <td class="border-l border-gray-100 px-4 py-2.5 text-right font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100">{{ formatAmount(row.amount) }}</td>
                    </tr>
                    <tr v-if="!currentRows.length">
                      <td colspan="3" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No matches for "{{ search }}"</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="fc-row-grand">
                      <td class="px-4 py-2.5 font-semibold">TOTAL</td>
                      <td class="border-l border-white/20 px-4 py-2.5"></td>
                      <td class="border-l border-white/20 px-4 py-2.5 text-right font-semibold">{{ formatAmount(footerTotal) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </template>

            <div v-else-if="!rows.length" class="flex flex-col items-center gap-2 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <FeatherIcon name="inbox" class="h-6 w-6 text-gray-300 dark:text-gray-600" />
              No adjustment lines.
            </div>
            <template v-else>
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">
                  <FeatherIcon name="layers" class="h-3.5 w-3.5" />
                  Breakdown
                  <span v-if="search" class="font-normal normal-case text-gray-500 dark:text-gray-400">· {{ displayedRows.length }} of {{ rows.length }}</span>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                <DrilldownSearch v-model="search" />
                <button
                  class="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  @click="sortByAmount = !sortByAmount"
                >
                  <FeatherIcon name="bar-chart-2" class="h-3.5 w-3.5" />
                  {{ sortByAmount ? 'Sorted by amount' : 'Sort by amount' }}
                </button>
                </div>
              </div>
              <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                <table class="w-full min-w-[960px] border-collapse text-sm">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-800">
                      <th class="border-b border-gray-200 px-4 py-2.5 text-left font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">Cost Center</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 text-left">Location</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 text-left">GL Code</th>
                      <th v-if="showUnit" class="border-b border-l border-gray-200 px-4 py-2.5 font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 text-left">Unit</th>
                      <th v-if="showMethod" class="border-b border-l border-gray-200 px-4 py-2.5 font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 text-left">Method</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 text-left">Months</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 text-right">Share</th>
                      <th class="border-b border-l border-gray-200 px-4 py-2.5 font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 text-right">Adjustment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, i) in displayedRows"
                      :key="i"
                      class="cursor-pointer border-t border-gray-100 transition odd:bg-white even:bg-gray-50/60 hover:bg-fc-blue-light/40 dark:border-gray-800 dark:odd:bg-transparent dark:even:bg-gray-800/30 dark:hover:bg-gray-800/70"
                      title="Click to see this line month wise"
                      @click="selectedLine = row"
                    >
                      <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        <span class="flex items-start gap-2">
                          <span class="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" :style="{ backgroundColor: accentColor(i) }" />
                          <span>
                            <span class="flex items-center gap-1">
                              {{ row.cost_center || '—' }}
                              <FeatherIcon name="chevron-right" class="h-3.5 w-3.5 text-gray-400" />
                            </span>
                            <span class="block text-xs text-gray-500 dark:text-gray-400">{{ row.cost_center_description }}</span>
                          </span>
                        </span>
                      </td>
                      <td class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                        <span class="block">{{ row.location_code || '—' }}</span>
                        <span class="block text-xs text-gray-500 dark:text-gray-400">{{ row.location_description }}</span>
                      </td>
                      <td class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                        <span class="block">{{ row.gl_code || '—' }}</span>
                        <span class="block text-xs text-gray-500 dark:text-gray-400">{{ row.gl_description }} · {{ row.category }}</span>
                      </td>
                      <td v-if="showUnit" class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800 text-gray-700 dark:text-gray-300">{{ row.unit }}</td>
                      <td v-if="showMethod" class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800 text-gray-700 dark:text-gray-300">{{ row.method }}</td>
                      <td class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">{{ row.months.join(', ') }}</td>
                      <td class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800">
                        <div class="flex items-center justify-end gap-2">
                          <span class="text-xs text-gray-500 dark:text-gray-400">{{ sharePct(row) }}%</span>
                          <span class="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <span class="block h-full rounded-full" :style="{ width: sharePct(row) + '%', backgroundColor: accentColor(i) }" />
                          </span>
                        </div>
                      </td>
                      <td class="border-l border-gray-100 px-4 py-2.5 dark:border-gray-800 text-right font-medium text-gray-900 dark:text-gray-100">{{ formatAmount(row.amount) }}</td>
                    </tr>
                    <tr v-if="!displayedRows.length">
                      <td :colspan="footerBlankCols + 2" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No matches for "{{ search }}"</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="fc-row-grand">
                      <td class="px-4 py-2.5 font-semibold">TOTAL</td>
                      <td v-for="n in footerBlankCols" :key="n" class="border-l border-white/20 px-4 py-2.5"></td>
                      <td class="border-l border-white/20 px-4 py-2.5 text-right font-semibold">{{ formatAmount(footerTotal) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </template>
          </template>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Dialog, ErrorMessage, FeatherIcon, Switch } from 'frappe-ui'
import AppLoader from '@/components/AppLoader.vue'
import AppTooltip from '@/components/AppTooltip.vue'
import DrilldownExportButton from '@/components/DrilldownExportButton.vue'
import DrilldownSearch from '@/components/DrilldownSearch.vue'
import { accentColor, formatCr, formatINR } from '@/data/budgetTotals'
import { call } from '@/data/decrypt'
import { exportColor, matchesSearch } from '@/data/drilldownExport'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  financialYear: { type: String, default: '' },
  month: { type: String, default: '' },
  accountingPeriod: { type: Number, default: null },
  // Unit code, or 'TOTAL' for the Grand Total row
  unit: { type: String, default: '' },
  unitLabel: { type: String, default: '' },
  // Adjustment method, or 'total' for the Total column
  method: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const error = ref(null)
const data = ref(null)
const rows = computed(() => data.value?.rows || [])

const showUnit = computed(() => props.unit === 'TOTAL')
const showMethod = computed(() => props.method === 'total')
const methodLabel = computed(() => (showMethod.value ? 'All adjustment methods' : props.method))
// Location, GL Code, Months, Share (+ Unit / Method when shown)
const footerBlankCols = computed(() => 4 + (showUnit.value ? 1 : 0) + (showMethod.value ? 1 : 0))

// On by default: most adjustment lines are well under 1 Cr and would all
// read "₹0 Cr" in the compact format.
const showFullNumbers = ref(true)
const sortByAmount = ref(true)

function formatAmount(v) {
  if (v === null || v === undefined || v === 0) return '-'
  return showFullNumbers.value ? formatINR(v) : formatCr(v)
}

// Search box above the table: filters the open level's rows across every
// column (codes, descriptions, unit, method, months, amount). Cleared when
// moving between the breakdown and a line's month-wise view.
const search = ref('')

const displayedRows = computed(() => {
  const list = rows.value.filter((r) =>
    matchesSearch(
      search.value, r.cost_center, r.cost_center_description, r.location_code, r.location_description,
      r.gl_code, r.gl_description, r.category, r.unit, r.method, r.months, r.amount,
    ),
  )
  if (sortByAmount.value) return list.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
  return list.sort((a, b) => `${a.cost_center}${a.location_code}${a.gl_code}`.localeCompare(`${b.cost_center}${b.location_code}${b.gl_code}`))
})
// Second level: one breakdown line opened month by month
const selectedLine = ref(null)
watch(selectedLine, () => { search.value = '' })
const currentRows = computed(() =>
  selectedLine.value
    ? (selectedLine.value.month_rows || []).filter((r) => matchesSearch(search.value, r.month, monthYear(r.month), r.amount))
    : displayedRows.value,
)
// TOTAL row follows the search: the full total when unfiltered, otherwise
// the sum of just the matching rows.
const footerTotal = computed(() => {
  if (!search.value) return selectedLine.value ? selectedLine.value.amount : data.value?.total
  return currentRows.value.reduce((sum, r) => sum + (r.amount || 0), 0)
})
const currentTotal = computed(() => (selectedLine.value ? selectedLine.value.amount : data.value?.total))

// "2026-27": April-December fall in 2026, January-March in 2027
function monthYear(monthName) {
  const startYear = parseInt(String(props.financialYear).slice(0, 4), 10)
  if (!startYear) return ''
  return ['January', 'February', 'March'].includes(monthName) ? startYear + 1 : startYear
}

const totalAbs = computed(() => currentRows.value.reduce((sum, r) => sum + Math.abs(r.amount || 0), 0))
function sharePct(row) {
  if (!totalAbs.value) return 0
  return Math.round((Math.abs(row.amount || 0) / totalAbs.value) * 1000) / 10
}

async function load() {
  selectedLine.value = null
  search.value = ''
  data.value = null
  error.value = null
  loading.value = true
  try {
    const message = await call('budget_mis.api.trial_balance.get_adjustment_unit_drilldown', {
      financial_year: props.financialYear,
      month: props.accountingPeriod,
      unit: props.unit,
      method: props.method,
    })
    if (message?.status === 'success') data.value = message
    else error.value = message?.error || 'Request failed.'
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Request failed. Check the Error Log for details.'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.unit, props.method, props.financialYear, props.accountingPeriod],
  ([open]) => {
    if (open) load()
  },
  { immediate: true },
)

// Excel / PDF export of the level currently on screen (breakdown lines, or
// one line month wise) - same columns, order and number format as the table.
function exportPayload() {
  const unitTitle = data.value?.unit_label || props.unitLabel
  const amountMode = showFullNumbers.value ? 'full' : 'cr'
  const line = selectedLine.value
  if (line) {
    return {
      filename: `Adjustment_Drilldown_${line.cost_center}_${line.location_code}_${line.gl_code}_Month_wise`,
      eyebrow: 'Adjustment Drill Down',
      title: `${line.cost_center} ${line.cost_center_description || ''} · ${line.location_code} ${line.location_description || ''}`,
      subtitle: `GL ${line.gl_code} ${line.gl_description || ''} · ${line.method} · Month wise`,
      breadcrumb: [unitTitle, `${line.cost_center} · ${line.location_code} · ${line.gl_code}`],
      summary: [
        { label: 'Total Adjustment', value: line.amount, kind: 'amount' },
        { label: 'Months', value: currentRows.value.length },
      ],
      section: 'Month wise',
      amount_mode: amountMode,
      columns: [
        { label: 'Month', kind: 'text' },
        { label: 'Share', kind: 'percent', align: 'right', bar: true },
        { label: 'Adjustment', kind: 'amount', align: 'right' },
      ],
      rows: currentRows.value.map((row, i) => ({
        color: exportColor(i),
        cells: [`${row.month} ${monthYear(row.month)}`, sharePct(row), row.amount],
      })),
      footer: ['TOTAL', '', footerTotal.value],
    }
  }
  const columns = [
    { label: 'Cost Center', kind: 'text' },
    { label: 'Location', kind: 'text' },
    { label: 'GL Code', kind: 'text' },
    ...(showUnit.value ? [{ label: 'Unit', kind: 'text' }] : []),
    ...(showMethod.value ? [{ label: 'Method', kind: 'text' }] : []),
    { label: 'Months', kind: 'text' },
    { label: 'Share', kind: 'percent', align: 'right', bar: true },
    { label: 'Adjustment', kind: 'amount', align: 'right' },
  ]
  const rows = displayedRows.value.map((row, i) => ({
    color: exportColor(i),
    cells: [
      { main: row.cost_center || '—', sub: row.cost_center_description },
      { main: row.location_code || '—', sub: row.location_description },
      { main: row.gl_code || '—', sub: [row.gl_description, row.category].filter(Boolean).join(' · ') },
      ...(showUnit.value ? [row.unit] : []),
      ...(showMethod.value ? [row.method] : []),
      (row.months || []).join(', '),
      sharePct(row),
      row.amount,
    ],
  }))
  return {
    filename: `Adjustment_Drilldown_${props.unit}_${props.method}_${props.month}_${props.financialYear}`,
    eyebrow: 'Adjustment Drill Down',
    title: unitTitle,
    subtitle: `${methodLabel.value} · YTD ${props.month} ${props.financialYear}`,
    summary: [
      { label: 'Total Adjustment', value: data.value?.total, kind: 'amount' },
      { label: 'Lines', value: rows.length },
    ],
    section: 'Breakdown',
    amount_mode: amountMode,
    columns,
    rows,
    footer: ['TOTAL', ...Array(footerBlankCols.value).fill(''), footerTotal.value],
  }
}
</script>
