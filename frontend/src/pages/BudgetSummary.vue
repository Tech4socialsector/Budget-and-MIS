<template>
  <AppLayout fill-height>
    <div class="flex h-full min-h-0 min-w-0 flex-col gap-3">
      <!-- Filters: exactly 4 per row, any further fields wrap to their own
      row (a plain 4-col grid rather than flex-wrap, so the count per row
      never depends on how much width happens to be left over). -->
      <div class="flex flex-shrink-0 flex-col gap-3">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Financial Year</label>
            <MultiSelect
              v-model="financialYearSelection"
              :options="financialYearOptions"
              placeholder="Select year"
              class="w-full"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Unit</label>
            <MultiSelect
              v-model="filters.units"
              :options="unitOptions"
              placeholder="All units"
              class="w-full"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Cost Center</label>
            <MultiSelect
              v-model="filters.costCenters"
              :options="costCenterOptions"
              :disabled="!filters.units.length"
              placeholder="All cost centers"
              class="w-full"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Location Code</label>
            <MultiSelect
              v-model="filters.locationCodes"
              :options="locationCodeOptions"
              :disabled="!filters.units.length"
              placeholder="All location codes"
              class="w-full"
            />
          </div>
        </div>
        <Button variant="outline" class="self-start" @click="clearFilters">
          <template #prefix>
            <FeatherIcon name="x-circle" class="h-4 w-4" />
          </template>
          Clear Filters
        </Button>
      </div>

      <div v-if="reportError" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/40 dark:text-red-400">
        {{ reportErrorMessage }}
      </div>

      <template v-else>
        <!-- Summary cards + pie -->
        <div v-if="expenseHeads.length" class="flex flex-shrink-0 flex-col gap-2">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-300">Budget Summary</div>
            <Switch v-model="showFullNumbers" label="Show full numbers" />
          </div>
          <BudgetSummaryCards :heads="expenseHeads" :financial-year="filters.financialYear" :show-full-numbers="showFullNumbers" />
        </div>

        <!-- Table controls -->
        <div class="flex flex-shrink-0 flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <FormControl
            type="text"
            v-model="searchQuery"
            placeholder="Search Expense / Sub Head / Item / GL Code..."
            class="w-full max-w-sm"
          >
            <template #prefix>
              <FeatherIcon name="search" class="h-4 w-4 text-gray-400" />
            </template>
          </FormControl>
          <div class="flex flex-wrap items-center gap-5">
            <Switch v-model="expandQuarters" label="Expand Quarters" />
            <Switch v-model="expandItemsAll" label="Expand Items" />
            <Button variant="solid" :loading="reportLoading" @click="exportExcel">
              <template #prefix>
                <FeatherIcon name="download" class="h-4 w-4" />
              </template>
              Export XLS
            </Button>
          </div>
        </div>

        <!-- Table - flex-1 so it fills whatever height remains below the
        filters/cards/search bar, whatever their own content-driven height
        turns out to be, instead of a guessed fixed height. min-h-0 is
        required for a flex child to shrink below its content size at all;
        min-h-[12rem] keeps it from collapsing to nothing if the content
        above happens to fill almost the whole page. -->
        <div class="relative min-h-[12rem] min-w-0 flex-1">
          <div v-if="reportLoading" class="h-full rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <AppLoader label="Loading budget summary..." />
          </div>
          <div v-else-if="!expenseHeads.length" class="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            No budget data found for the selected filters.
          </div>
          <BudgetSummaryTable
            v-else
            class="h-full"
            :heads="filteredHeads"
            :expand-quarters="expandQuarters"
            :expanded-heads="expandedHeads"
            :expanded-sub-heads="expandedSubHeads"
            :expand-items-all="expandItemsAll"
            :expanded-quarter-keys="expandedQuarterKeys"
            @toggle-head="toggleHead"
            @toggle-sub-head="toggleSubHead"
            @toggle-quarter="toggleQuarter"
          />
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { MultiSelect, FormControl, Button, FeatherIcon, Switch } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import BudgetSummaryCards from '@/components/BudgetSummaryCards.vue'
import BudgetSummaryTable from '@/components/BudgetSummaryTable.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'

onMounted(() => setPageTitle('Budget Summary'))

const filters = reactive({
  financialYear: '',
  units: [],
  costCenters: [],
  locationCodes: [],
})

const financialYearOptions = ref([])
const unitOptions = ref([])
const costCenterOptions = ref([])
const locationCodeOptions = ref([])

const expenseHeads = ref([])
const reportLoading = ref(false)
const reportError = ref(null)

const showFullNumbers = ref(false)
const expandItemsAll = ref(false)
const expandedHeads = reactive(new Set())
const expandedSubHeads = reactive(new Set())
const expandedQuarterKeys = reactive(new Set())
const searchQuery = ref('')

const ALL_QUARTER_KEYS = ['q1', 'q2', 'q3', 'q4']

// "Expand Quarters" checkbox is a bulk convenience over the same
// per-quarter state that clicking a quarter's own header toggles - checked
// only when every quarter happens to be open, and toggling it opens/closes
// them all at once rather than tracking a separate all-or-nothing flag.
const expandQuarters = computed({
  get: () => ALL_QUARTER_KEYS.every((k) => expandedQuarterKeys.has(k)),
  set: (value) => {
    expandedQuarterKeys.clear()
    if (value) ALL_QUARTER_KEYS.forEach((k) => expandedQuarterKeys.add(k))
  },
})

function toggleQuarter(key) {
  if (expandedQuarterKeys.has(key)) expandedQuarterKeys.delete(key)
  else expandedQuarterKeys.add(key)
}

const reportErrorMessage = computed(() => {
  const e = reportError.value
  return e?.messages?.[0] || e?.message || 'Something went wrong loading the budget summary.'
})

// Financial Year uses MultiSelect too (matching Unit/Cost Center/Location
// Code's size and style), but the report only ever supports one year at a
// time - this wrapper keeps filters.financialYear a plain string for the
// rest of the page while exposing the array shape MultiSelect expects.
// Picking a second year replaces the first rather than adding to it.
const financialYearSelection = computed({
  get: () => (filters.financialYear ? [filters.financialYear] : []),
  set: (values) => {
    filters.financialYear = values.length ? values[values.length - 1] : ''
  },
})

function toOptions(list) {
  return (list || [])
    .filter((o) => o.value)
    .map((o) => ({ label: o.label, value: o.value }))
}

async function loadFinancialYears() {
  const rows = await call('annual_budget.api.filter_options.get_financial_year_list')
  financialYearOptions.value = (rows || []).map((r) => ({
    label: r.financial_year,
    value: r.financial_year,
  }))
  if (!filters.financialYear && financialYearOptions.value.length) {
    filters.financialYear = defaultFinancialYear(financialYearOptions.value)
  }
}

function defaultFinancialYear(options) {
  // Apr-Mar fiscal year: before April, the "current" FY started last
  // calendar year. Falls back to the newest option if nothing matches.
  const now = new Date()
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  const label = `${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, '0')}`
  const match = options.find((o) => o.value === label)
  return match ? match.value : options[0].value
}

async function loadUnits() {
  const r = await call('annual_budget.api.filter_options.get_units')
  unitOptions.value = toOptions(r?.data)
}

async function loadCostCenters() {
  if (!filters.units.length) {
    costCenterOptions.value = []
    return
  }
  const r = await call('annual_budget.api.filter_options.get_cost_centers_by_set_id', {
    units: filters.units.join(','),
  })
  costCenterOptions.value = toOptions(r?.data)
}

async function loadLocationCodes() {
  if (!filters.units.length) {
    locationCodeOptions.value = []
    return
  }
  const r = await call('annual_budget.api.filter_options.get_location_codes_by_unit', {
    unit: filters.units.join(','),
  })
  locationCodeOptions.value = toOptions(r?.data)
}

async function loadReport() {
  if (!filters.financialYear) return
  reportLoading.value = true
  reportError.value = null
  try {
    const result = await call('annual_budget.api.phase_sheet.get_consolidated_report', {
      financial_year: filters.financialYear,
      units: filters.units.join(',') || undefined,
      cost_center: filters.costCenters.join(',') || undefined,
      location_code: filters.locationCodes.join(',') || undefined,
    })
    expenseHeads.value = result || []
  } catch (e) {
    reportError.value = e
    expenseHeads.value = []
  } finally {
    reportLoading.value = false
  }
}

function clearFilters() {
  filters.units = []
  filters.costCenters = []
  filters.locationCodes = []
  if (financialYearOptions.value.length) {
    filters.financialYear = defaultFinancialYear(financialYearOptions.value)
  }
}

function resetExpandState() {
  expandedHeads.clear()
  expandedSubHeads.clear()
  expandedQuarterKeys.clear()
  expandItemsAll.value = false
  searchQuery.value = ''
}

function toggleHead(name) {
  if (expandedHeads.has(name)) expandedHeads.delete(name)
  else expandedHeads.add(name)
}

function toggleSubHead(key) {
  if (expandedSubHeads.has(key)) expandedSubHeads.delete(key)
  else expandedSubHeads.add(key)
}

watch(() => filters.financialYear, () => {
  resetExpandState()
  loadReport()
})

watch(() => filters.units.slice(), async (newUnits, oldUnits) => {
  const changed = JSON.stringify(newUnits) !== JSON.stringify(oldUnits || [])
  if (!changed) return
  filters.costCenters = []
  filters.locationCodes = []
  await Promise.all([loadCostCenters(), loadLocationCodes()])
  loadReport()
})

watch(() => filters.costCenters.slice(), (a, b) => {
  if (JSON.stringify(a) !== JSON.stringify(b || [])) loadReport()
})

watch(() => filters.locationCodes.slice(), (a, b) => {
  if (JSON.stringify(a) !== JSON.stringify(b || [])) loadReport()
})

function matchesSearch(name, glCode) {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return true
  return (name || '').toLowerCase().includes(q) || String(glCode || '').toLowerCase().includes(q)
}

const filteredHeads = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return expenseHeads.value

  const filterItems = (items) => (items || []).filter((i) => matchesSearch(i.name, i.gl_code))

  return expenseHeads.value
    .map((head) => {
      const headMatches = matchesSearch(head.name, null)
      const items = filterItems(head.items)
      const subHeads = (head.sub_heads || [])
        .map((sub) => ({ ...sub, items: filterItems(sub.items) }))
        .filter((sub) => headMatches || matchesSearch(sub.name, null) || sub.items.length)
      if (!headMatches && !items.length && !subHeads.length) return null
      return { ...head, items: headMatches ? head.items : items, sub_heads: subHeads }
    })
    .filter(Boolean)
})

function exportExcel() {
  const params = new URLSearchParams({
    financial_year: filters.financialYear || '',
    units: filters.units.join(','),
    cost_center: filters.costCenters.join(','),
    location_code: filters.locationCodes.join(','),
  })
  window.open(`/api/method/annual_budget.api.export_reports.export_phase_sheet_excel?${params.toString()}`, '_blank')
}

onMounted(async () => {
  await loadFinancialYears()
  await loadUnits()
  loadReport()
})
</script>
