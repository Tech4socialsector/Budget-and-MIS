<!--
  Budget & Actuals tab: cross-tab matrix. Rows = expense tree (structure
  read from rawData[0].actuals, per the Desk page's buildStruct() - every
  unit is assumed structurally identical). Columns = one Plan+Actual pair
  per unit in rawData, plus a final Grand Total Plan+Actual pair.

  IMPORTANT CONFIRMED DEVIATION (not a bug in this Vue build - verified
  against the live Desk JS and the current backend):
  The Grand Total column pair is sourced from a `main_item_breakdown` field
  the Desk JS expects on the API response's CONSOLIDATED entry
  (get_unit_wise_plan with table_name_filter='Budget & Estimate'), NOT
  summed client-side from the per-unit columns. A repo-wide grep found
  `main_item_breakdown` referenced ONLY in the Desk JS itself - the actual
  get_unit_wise_plan Python function never sets that key on its
  CONSOLIDATED entry. So in the live Desk page today, the Grand Total
  Plan/Est columns always render as 0/blank. This component replicates
  that exactly (reads main_item_breakdown, defaults to []) rather than
  "fixing" it by summing client-side, since that would show DIFFERENT
  numbers than the page it's meant to match.
-->
<template>
  <ErrorMessage v-if="error" :message="errorMessage" />
  <div v-else-if="loading" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <AppLoader label="Building Budget & Actuals..." />
  </div>
  <div v-else-if="!rawData.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
    No data available.
    <button class="ml-1 text-fc-blue-mid underline" @click="$emit('retry')">Retry</button>
  </div>
  <template v-else>
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
      <FormControl type="text" v-model="searchTerm" placeholder="Search Line Item..." class="fc-search-input">
        <template #prefix><FeatherIcon name="search" class="h-4 w-4 text-gray-400" /></template>
      </FormControl>
      <div class="flex flex-wrap items-center gap-5">
        <Switch v-model="expandItems" label="Expand Line Items" />
        <Button variant="solid" class="fc-xl-btn" :loading="exporting" @click="$emit('export')">
          <template #prefix><FeatherIcon name="download" class="h-4 w-4" /></template>
          Export XLS
        </Button>
      </div>
    </div>

    <div class="fc-scroll-wrapper">
      <table class="fc-table w-full min-w-[1200px] text-sm">
        <thead>
          <tr class="fc-thead-main">
            <th rowspan="2" class="fc-th fc-sticky-col min-w-[280px] text-left">Expense Head / Line Item</th>
            <th v-for="e in rawData" :key="e.label" colspan="2" class="fc-th text-center">{{ (e.label || '').trim() }}</th>
            <th colspan="2" class="fc-th bg-fc-blue-dark text-center">Grand Total</th>
          </tr>
          <tr class="fc-thead-sub">
            <template v-for="e in rawData" :key="'sub-' + e.label">
              <th class="fc-th-sub">{{ planLabel }}</th>
              <th class="fc-th-sub">{{ actualLabel }}</th>
            </template>
            <th class="fc-th-sub bg-fc-blue-dark">{{ planLabel }}</th>
            <th class="fc-th-sub bg-fc-blue-dark">{{ actualLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="sec in struct" :key="sec.name">
            <tr class="fc-row-head" @click="toggleSec(sec.name)">
              <td class="fc-td fc-sticky-col bg-fc-blue-light text-left dark:bg-transparent">
                <span class="inline-flex items-center gap-2">
                  <FeatherIcon :name="isSecOpen(sec.name) ? 'chevron-down' : 'chevron-right'" class="h-4 w-4" />
                  {{ sec.name }}
                </span>
              </td>
              <template v-for="e in rawData" :key="'v-' + e.label">
                <td class="fc-td text-right"><CrCell mode="inr" :value="secVal(e, sec.name, 'plan')" /></td>
                <td class="fc-td text-right"><CrCell mode="inr" :value="secVal(e, sec.name, 'est')" /></td>
              </template>
              <td class="fc-td bg-fc-gt-col text-right font-bold"><CrCell mode="inr" :value="secTotal(sec.name, 'plan')" /></td>
              <td class="fc-td bg-fc-gt-col text-right font-bold"><CrCell mode="inr" :value="secTotal(sec.name, 'est')" /></td>
            </tr>

            <template v-if="isSecOpen(sec.name)">
              <tr v-for="item in filteredItems(sec.items)" :key="'ditem-' + sec.name + '-' + item.name">
                <td class="fc-td fc-sticky-col bg-white pl-10 text-left dark:bg-gray-900">{{ item.name }}</td>
                <template v-for="e in rawData" :key="'iv-' + e.label + item.name">
                  <td class="fc-td text-right"><CrCell mode="inr" :value="itemVal(e, item.name, 'plan')" /></td>
                  <td class="fc-td text-right"><CrCell mode="inr" :value="itemVal(e, item.name, 'est')" /></td>
                </template>
                <td class="fc-td bg-fc-gt-col text-right"><CrCell mode="inr" :value="itemTotal(item.name, 'plan')" /></td>
                <td class="fc-td bg-fc-gt-col text-right"><CrCell mode="inr" :value="itemTotal(item.name, 'est')" /></td>
              </tr>

              <template v-for="sub in sec.sub_heads" :key="'sub-' + sec.name + '-' + sub.name">
                <tr class="fc-row-sub" @click.stop="toggleSub(sec.name, sub.name)">
                  <td class="fc-td fc-sticky-col bg-fc-orange-light pl-8 text-left dark:bg-transparent">
                    <span class="inline-flex items-center gap-2">
                      <FeatherIcon :name="isSubOpen(sec.name, sub.name) ? 'chevron-down' : 'chevron-right'" class="h-3.5 w-3.5" />
                      {{ sub.name }}
                    </span>
                  </td>
                  <template v-for="e in rawData" :key="'sv-' + e.label + sub.name">
                    <td class="fc-td text-right"><CrCell mode="inr" :value="subVal(e, sec.name, sub.name, 'plan')" /></td>
                    <td class="fc-td text-right"><CrCell mode="inr" :value="subVal(e, sec.name, sub.name, 'est')" /></td>
                  </template>
                  <td class="fc-td bg-fc-gt-col text-right font-medium"><CrCell mode="inr" :value="subTotal(sec.name, sub.name, 'plan')" /></td>
                  <td class="fc-td bg-fc-gt-col text-right font-medium"><CrCell mode="inr" :value="subTotal(sec.name, sub.name, 'est')" /></td>
                </tr>
                <tr v-for="item in filteredItems(sub.items)" v-show="isSubOpen(sec.name, sub.name)" :key="'subitem-' + sec.name + '-' + sub.name + '-' + item.name">
                  <td class="fc-td fc-sticky-col bg-white pl-12 text-left dark:bg-gray-900">{{ item.name }}</td>
                  <template v-for="e in rawData" :key="'siv-' + e.label + item.name">
                    <td class="fc-td text-right"><CrCell mode="inr" :value="itemVal(e, item.name, 'plan')" /></td>
                    <td class="fc-td text-right"><CrCell mode="inr" :value="itemVal(e, item.name, 'est')" /></td>
                  </template>
                  <td class="fc-td bg-fc-gt-col text-right"><CrCell mode="inr" :value="itemTotal(item.name, 'plan')" /></td>
                  <td class="fc-td bg-fc-gt-col text-right"><CrCell mode="inr" :value="itemTotal(item.name, 'est')" /></td>
                </tr>
              </template>
            </template>
          </template>
        </tbody>
        <tfoot>
          <tr class="fc-row-grand">
            <td class="fc-td fc-sticky-col bg-fc-blue-mid text-left">GRAND TOTAL</td>
            <template v-for="e in rawData" :key="'gv-' + e.label">
              <td class="fc-td text-right"><CrCell mode="inr" :value="grandVal(e, 'plan')" /></td>
              <td class="fc-td text-right"><CrCell mode="inr" :value="grandVal(e, 'est')" /></td>
            </template>
            <td class="fc-td text-right"><CrCell mode="inr" :value="allGrandPlan" /></td>
            <td class="fc-td text-right"><CrCell mode="inr" :value="allGrandEst" /></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </template>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { FormControl, Switch, Button, FeatherIcon, ErrorMessage } from 'frappe-ui'
import AppLoader from '@/components/AppLoader.vue'
import CrCell from './CrCell.vue'
import { getFYLabels, isGrandTotalSection } from '@/data/foundationConsolidatedData'

const props = defineProps({
  loading: Boolean,
  error: { type: Object, default: null },
  rawData: { type: Array, default: () => [] },
  mainItemBreakdown: { type: Array, default: () => [] },
  financialYear: { type: String, default: '' },
  exporting: Boolean,
})
defineEmits(['retry', 'export'])

const errorMessage = computed(() => props.error?.messages?.[0] || props.error?.message || 'Something went wrong loading Budget & Actuals.')

const labels = computed(() => getFYLabels(props.financialYear))
const planLabel = computed(() => labels.value.plan)
const actualLabel = computed(() => labels.value.actual)

const searchTerm = ref('')
const openSec = reactive(new Set())
const openSub = reactive(new Set())
const expandItems = ref(false)

function isSecOpen(name) {
  return expandItems.value || openSec.has(name)
}
function isSubOpen(secName, subName) {
  return expandItems.value || openSub.has(secName + '::' + subName)
}
function toggleSec(name) {
  if (openSec.has(name)) openSec.delete(name)
  else openSec.add(name)
}
function toggleSub(secName, subName) {
  const key = secName + '::' + subName
  if (openSub.has(key)) openSub.delete(key)
  else openSub.add(key)
}

// Structure (names only) from the first unit's actuals tree - every unit is
// assumed structurally identical (Desk page's buildStruct()).
const struct = computed(() => {
  if (!props.rawData.length) return []
  return (props.rawData[0].actuals || [])
    .filter((s) => !isGrandTotalSection(s))
    .map((s) => ({
      name: s.name,
      items: (s.items || []).map((i) => ({ name: i.name })),
      sub_heads: (s.sub_heads || []).map((sub) => ({
        name: sub.name,
        items: (sub.items || []).map((i) => ({ name: i.name })),
      })),
    }))
})

// Leaf-level search: only item rows are filtered out of the DOM (matches
// Desk exactly) - section/sub-head rows always render regardless of term.
function filteredItems(items) {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return items || []
  return (items || []).filter((i) => (i.name || '').toLowerCase().includes(term))
}

function secVal(entity, secName, field) {
  let v = 0
  for (const s of entity.actuals || []) {
    if (isGrandTotalSection(s) || s.name !== secName) continue
    v += Number(field === 'plan' ? s.ytd || 0 : s.total_posted_amt_ytd || 0)
  }
  return v
}
function subVal(entity, secName, subName, field) {
  let v = 0
  for (const s of entity.actuals || []) {
    if (isGrandTotalSection(s) || s.name !== secName) continue
    for (const sub of s.sub_heads || []) {
      if (sub.name !== subName) continue
      v += Number(field === 'plan' ? sub.ytd || 0 : sub.total_posted_amt_ytd || 0)
    }
  }
  return v
}
function itemVal(entity, name, field) {
  let v = 0
  for (const s of entity.actuals || []) {
    if (isGrandTotalSection(s)) continue
    for (const i of s.items || []) {
      if (i.name === name) v += Number(field === 'plan' ? i.ytd || 0 : i.total_posted_amt || 0)
    }
    for (const sub of s.sub_heads || []) {
      for (const i of sub.items || []) {
        if (i.name === name) v += Number(field === 'plan' ? i.ytd || 0 : i.total_posted_amt || 0)
      }
    }
  }
  return v
}
function grandVal(entity, field) {
  let gt = 0, found = false
  for (const s of entity.actuals || []) {
    if (isGrandTotalSection(s)) { gt += Number(field === 'plan' ? s.ytd || 0 : s.total_posted_amt_ytd || 0); found = true }
  }
  if (!found) {
    for (const s of entity.actuals || []) gt += Number(field === 'plan' ? s.ytd || 0 : s.total_posted_amt_ytd || 0)
  }
  return gt
}

// Grand-total COLUMN values come from the backend's main_item_breakdown,
// not a client-side resum across rawData units (see file header comment).
function secTotal(secName, field) {
  return secVal({ actuals: props.mainItemBreakdown }, secName, field === 'plan' ? 'plan' : 'est')
}
function subTotal(secName, subName, field) {
  return subVal({ actuals: props.mainItemBreakdown }, secName, subName, field === 'plan' ? 'plan' : 'est')
}
function itemTotal(name, field) {
  return itemVal({ actuals: props.mainItemBreakdown }, name, field === 'plan' ? 'plan' : 'est')
}
const allGrandPlan = computed(() => grandVal({ actuals: props.mainItemBreakdown }, 'plan'))
const allGrandEst = computed(() => grandVal({ actuals: props.mainItemBreakdown }, 'est'))
</script>
