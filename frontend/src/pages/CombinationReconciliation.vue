<!--
  Combination Reconciliation - checks the ERP Actuals YTD response for the
  selected Financial Year / Month against every "Define by Cost Centre and
  Location Code" Overview number cards settings card, and highlights any
  (unit, cost_center, location_code) combination that comes back from the
  ERP but isn't mapped on any card - those actuals can never surface in any
  report in this app until they're mapped. A card can set its own "Ignore
  Location Code In Reconciliation" field (e.g. Enablers, which is only ever
  mapped by Unit + Cost Center) so it only needs a (unit, cost_center) match
  to count a combination as mapped, regardless of location code - decided
  per card on the backend now, with no page-level filter for it.

  Manual-trigger (Check button), same as before, but no longer a live
  PeopleSoft call - find_unmapped_combinations now reads the persisted ERP
  Data store (data_type="Actuals", kept fresh by the existing scheduled
  sync job) instead, so this is a fast DB read with no patient-loading-
  state/elapsed-timer UI needed. Same Financial Year/Month default-picking
  convention as MonthlyMis.vue (current FY, previous completed month)
  still applies, since "what's unmapped right now" is best answered
  against the most recently closed month by default.
-->
<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <div>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Combination Reconciliation</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Finds ERP actuals combinations with no matching Overview Number Card mapping - unmapped combinations here mean incorrect or incomplete reports across the app.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Month (YTD up to)</label>
          <Select
            :options="monthOptions"
            v-model="filters.month"
            class="w-full"
          />
        </div>
        <div>
          <!-- The invisible label purely aligns this control's own baseline
          with the real Financial Year/Month labels above it when this cell
          sits in the same wide grid row (sm and up) - on a 1-column mobile
          stack it would otherwise waste a full line of vertical space for
          nothing, so it's hidden below sm instead. -->
          <label class="mb-1 hidden text-xs font-medium text-transparent select-none sm:block">Action</label>
          <Button variant="solid" theme="gray" :loading="loading" @click="runCheck">
            <template #prefix><FeatherIcon name="play" class="h-4 w-4" /></template>
            Check
          </Button>
        </div>
      </div>

      <div v-if="loading" class="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-10 dark:border-gray-800 dark:bg-gray-900">
        <AppLoader label="Checking ERP actuals against card mappings..." />
      </div>

      <ErrorMessage v-else-if="error" :message="error" />

      <div v-else-if="!hasChecked" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        Select a Financial Year and Month, then click Check.
      </div>

      <template v-else>
        <!-- All-clear -->
        <div v-if="!rows.length" class="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
          <FeatherIcon name="check-circle" class="h-5 w-5 flex-shrink-0" />
          <div>
            Every ERP combination for {{ lastQuery.financialYear }} ({{ lastQuery.month }}, YTD) is mapped to a number card. Reports across the app should reflect this data correctly.
          </div>
        </div>

        <!-- Highlighted warning -->
        <template v-else>
          <div class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            <FeatherIcon name="alert-triangle" class="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <div class="font-semibold">{{ rows.length }} unmapped combination{{ rows.length === 1 ? '' : 's' }} found</div>
              <div class="mt-1">
                These unit / cost center / location code combinations are coming in the ERP Actuals response but are not mapped on any Overview Number Card (a card flagged "Ignore Location Code In Reconciliation" only needs its Unit + Cost Center to match, e.g. Enablers). Map them first - only then will you get correct reports across the app.
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ rows.length }} row{{ rows.length === 1 ? '' : 's' }} · Total posted amount: {{ formatTotal(totalAmount) }}</div>
          </div>

          <div class="fc-scroll-wrapper">
            <table class="fc-table w-full min-w-[1000px] text-sm">
              <thead>
                <tr class="fc-thead-main">
                  <th class="fc-th text-left">Unit</th>
                  <th class="fc-th text-left">Cost Center (ERP)</th>
                  <th class="fc-th text-left">Cost Center Description</th>
                  <th class="fc-th text-left">Location Code (ERP)</th>
                  <th class="fc-th text-left">Location Code Description</th>
                  <th class="fc-th text-right">Posted Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in rows" :key="i" class="bg-red-50/60 dark:bg-red-950/20">
                  <td class="fc-td text-left font-medium">{{ row.unit }}</td>
                  <td class="fc-td text-left">{{ row.cost_center_erp }}</td>
                  <td class="fc-td text-left">{{ row.cost_center_description }}</td>
                  <td class="fc-td text-left">{{ row.location_code_erp }}</td>
                  <td class="fc-td text-left">{{ row.location_code_description }}</td>
                  <td class="fc-td text-right">{{ formatTotal(row.posted_total_amt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { MultiSelect, Select, Button, FeatherIcon, ErrorMessage } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'

onMounted(() => {
  setPageTitle('Combination Reconciliation')
  loadFinancialYears()
})

// Same April->March fiscal-year convention used by MonthlyMis.vue/
// ErpActuals.vue (budget_mis.api.helper.get_accounting_period_from_month).
const MONTH_TO_PERIOD = {
  April: 1, May: 2, June: 3, July: 4, August: 5, September: 6,
  October: 7, November: 8, December: 9, January: 10, February: 11, March: 12,
}
const MONTHS = Object.keys(MONTH_TO_PERIOD)
const monthOptions = MONTHS.map((m) => ({ label: m, value: m }))

const filters = reactive({ financialYear: '', month: '' })
const financialYearOptions = ref([])
const financialYearSelection = computed({
  get: () => (filters.financialYear ? [filters.financialYear] : []),
  set: (values) => { filters.financialYear = values.length ? values[values.length - 1] : '' },
})

// Current financial year + previous completed month - mirrors
// MonthlyMis.vue's defaultFyAndMonth() exactly, since "what's unmapped
// right now" is best answered against the most recently closed month.
function defaultFyAndMonth(options) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const curFY = (m >= 4 ? y : y - 1) + '-' + String(m >= 4 ? y + 1 : y).slice(-2)
  const target = options.includes(curFY) ? curFY : options[0]
  const prevM = m === 1 ? 12 : m - 1
  const mName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][prevM - 1]
  const month = MONTHS.includes(mName) ? mName : 'March'
  return { fy: target, month }
}

async function loadFinancialYears() {
  const fyRows = await call('budget_mis.api.filter_options.get_financial_year_list')
  const years = (fyRows || []).map((r) => r.financial_year)
  financialYearOptions.value = years.map((y) => ({ label: y, value: y }))
  if (!filters.financialYear && years.length) {
    const { fy, month } = defaultFyAndMonth(years)
    filters.financialYear = fy
    filters.month = month
  }
}

// -------------------------------------------------------------------------
// Check (manual trigger - a fast DB read against the persisted ERP Data
// store, not a live PeopleSoft call)
// -------------------------------------------------------------------------
const loading = ref(false)
const error = ref(null)
const hasChecked = ref(false)
const rows = ref([])
const lastQuery = reactive({ financialYear: '', month: '' })
let requestToken = 0

const totalAmount = computed(() => rows.value.reduce((sum, r) => sum + (r.posted_total_amt || 0), 0))

function formatTotal(v) {
  return (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

async function runCheck() {
  const fy = filters.financialYear
  const month = filters.month
  if (!fy || !month) return

  const fiscalYear = parseInt(fy.split('-')[0], 10)
  const accountingPeriod = MONTH_TO_PERIOD[month]

  const token = ++requestToken
  loading.value = true
  error.value = null

  try {
    const message = await call('budget_mis.api.combination_reconciliation.find_unmapped_combinations', {
      fiscal_year: fiscalYear,
      accounting_period: accountingPeriod,
    })
    if (token !== requestToken) return

    if (message?.status !== 'success') {
      error.value = message?.error || 'Could not check combinations. Please try again.'
      rows.value = []
      hasChecked.value = true
      return
    }

    rows.value = message.data || []
    lastQuery.financialYear = fy
    lastQuery.month = month
    hasChecked.value = true
  } catch (e) {
    if (token !== requestToken) return
    error.value = e?.messages?.[0] || e?.message || 'Request failed. Check the Error Log for details.'
  } finally {
    if (token === requestToken) {
      loading.value = false
    }
  }
}
</script>
