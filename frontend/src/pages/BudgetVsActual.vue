<!--
  Budget vs Actual - a dedicated Vue port of the Desk page at
  budget_mis/main/page/budget_actuals_phase/
  budget_actuals_phase.js (only the last of 8 revisions in that file is
  live - see its own on_page_load, at the very end of the file).

  The filters/cards/table/export design itself lives in
  BudgetActualsBreakdown.vue, shared with BudgetDashboard.vue's own
  "Budget vs Actuals Breakdown" tab - this page just adds its own
  Financial Year picker around it (the Dashboard's tabs already share one
  Financial Year filter above the tab strip, so that component takes it
  as a prop instead of owning it).
-->
<template>
  <AppLayout>
    <BudgetActualsBreakdown :financial-year="filters.financialYear">
      <template #extra-filter>
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Financial Year</label>
          <MultiSelect v-model="financialYearSelection" :options="financialYearOptions" placeholder="Select year" class="w-full" />
        </div>
      </template>
    </BudgetActualsBreakdown>
  </AppLayout>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { MultiSelect } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import BudgetActualsBreakdown from '@/components/BudgetActualsBreakdown.vue'
import { useRoute } from 'vue-router'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'

// Finance Unit Coordinator's own "Dashboard" tile actually opens this page
// under the hood (DASHBOARD_REDIRECT_BY_ROLE in api/modules.py) - the page
// itself is unchanged (still genuinely Budget vs Actual), but the
// breadcrumb/title should still read "Dashboard" in that case, matching
// the tile they actually clicked, not the page underneath it. Home.vue's
// openDirect() passes the clicked tile's own label as ?tileLabel= for
// exactly this - a direct visit to /budget-vs-actual (its own tile, or a
// bookmarked/shared link) never carries this param, so it keeps showing
// its own real title in every other case.
const route = useRoute()
setPageTitle(route.query.tileLabel || 'Budget vs Actual')

// --- Financial Year -------------------------------------------------------
const filters = reactive({ financialYear: '' })
const financialYearOptions = ref([])
const financialYearSelection = computed({
  get: () => (filters.financialYear ? [filters.financialYear] : []),
  set: (values) => { filters.financialYear = values.length ? values[values.length - 1] : '' },
})

async function loadFinancialYears() {
  const rows = await call('budget_mis.api_1.filter_options.get_financial_year_list')
  financialYearOptions.value = (rows || []).map((r) => ({ label: r.financial_year, value: r.financial_year }))
  if (!filters.financialYear && financialYearOptions.value.length) {
    const now = new Date()
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
    const label = `${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, '0')}`
    const match = financialYearOptions.value.find((o) => o.value === label)
    filters.financialYear = match ? match.value : financialYearOptions.value[0].value
  }
}

loadFinancialYears()
</script>
