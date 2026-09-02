<template>
  <AppLayout>
    <PageHeader>
      <template #title>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ pageTitle }}</h1>
      </template>
      <template #actions>
        <Button v-if="metaResource.data" variant="solid" @click="goToNew">
          <template #prefix><FeatherIcon name="plus" class="h-4 w-4" /></template>
          New
        </Button>
      </template>
    </PageHeader>

    <ErrorMessage v-if="metaResource.error" :message="metaResource.error" />

    <template v-else>
      <!-- Filters: exactly 4 per row, any further fields wrap to their own row -->
      <div v-if="filterFields.length" class="mb-4 flex flex-col gap-3">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="f in filterFields" :key="f.fieldname">
            <FormControl
              v-if="f.fieldtype === 'Select' || f.fieldtype === 'Check'"
              type="select"
              :label="f.label"
              :options="[{ label: `All ${f.label}`, value: '' }, ...selectOptionsFor(f)]"
              v-model="filterValues[f.fieldname]"
            />
            <FormControl
              v-else-if="f.fieldtype === 'Date' || f.fieldtype === 'Datetime'"
              type="date"
              :label="f.label"
              v-model="filterValues[f.fieldname]"
            />
            <FormControl
              v-else
              type="text"
              :label="f.label"
              v-model="filterValues[f.fieldname]"
            />
          </div>
        </div>
        <Button v-if="hasActiveFilters" variant="ghost" class="self-start" @click="clearFilters">Clear filters</Button>
      </div>

      <div v-if="metaResource.loading && !metaResource.data" class="flex flex-col gap-2">
        <Skeleton v-for="i in 5" :key="i" height="2.5rem" />
      </div>

      <template v-else>
        <ErrorMessage v-if="rows.error" :message="rows.error" />

        <!-- The table itself scrolls horizontally below sm (min-w-[600px]
        forces it wider than most phones) - the edge gradient is a purely
        visual "there's more this way" cue so that isn't a hidden feature
        the user has to discover by accident. -->
        <div class="relative">
          <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table class="w-full min-w-[600px] text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th v-for="col in displayColumns" :key="col.fieldname" class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    {{ col.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!rows.loading && !rows.data?.length">
                  <td :colspan="displayColumns.length" class="px-4 py-10 text-center text-sm text-gray-400">No records yet.</td>
                </tr>
                <tr
                  v-for="row in rows.data"
                  :key="row.name"
                  class="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  @click="goToRow(row.name)"
                >
                  <td v-for="col in displayColumns" :key="col.fieldname" class="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                    {{ formatValue(row[col.fieldname], col) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-if="rows.data?.length"
            class="pointer-events-none absolute right-0 top-0 h-full w-8 rounded-r-lg bg-gradient-to-l from-white to-transparent dark:from-gray-900 sm:hidden"
          />
        </div>

        <div class="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" :disabled="!rows.hasPreviousPage" @click="rows.previous()">Previous</Button>
          <Button variant="outline" :disabled="!rows.hasNextPage" @click="rows.next()">Next</Button>
        </div>
      </template>
    </template>
  </AppLayout>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useList, Button, ErrorMessage, FeatherIcon, FormControl } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import Skeleton from '@/components/Skeleton.vue'
import { useMeta, useListFields, useFilterFields } from '@/data/useMeta'
import { findModuleByRoute } from '@/data/modules'
import { setPageTitle } from '@/data/pageTitle'

const props = defineProps({
  doctype: { type: String, required: true },
})

const route = useRoute()
const router = useRouter()

const metaResource = useMeta(props.doctype)
const columns = useListFields(metaResource)
const filterFields = useFilterFields(metaResource)

// A Single doctype (e.g. Master Settings, ERP Credentials) has exactly one
// record, named after the doctype itself, and no real list to page through
// - frappe.client.get_list throws a ProgrammingError against it. Skip the
// list view entirely and go straight to its one record's form.
watch(
  () => metaResource.data?.issingle,
  (isSingle) => {
    if (isSingle) {
      router.replace({ name: 'DoctypeForm', params: { doctypeRoute: route.params.doctypeRoute, name: props.doctype } })
    }
  },
  { immediate: true },
)

// A doctype whose only real data is its own `name` (e.g. GL code, which
// has no fields beyond a layout Section Break) has zero display columns -
// without a fallback, both the header row and every row's cells render as
// empty <tr>s with nothing in them, making real rows invisible even
// though they loaded. Mirrors the `fields` fallback already passed to
// useList below.
const displayColumns = computed(() =>
  columns.value.length ? columns.value : [{ fieldname: 'name', label: 'Name', fieldtype: 'Data' }],
)

const pageTitle = computed(() => findModuleByRoute(route.params.doctypeRoute)?.label || props.doctype)
watch(pageTitle, (t) => setPageTitle(t), { immediate: true })

const filterValues = reactive({})
watch(filterFields, (fields) => {
  for (const key of Object.keys(filterValues)) delete filterValues[key]
  for (const f of fields) filterValues[f.fieldname] = ''
}, { immediate: true })

const hasActiveFilters = computed(() => Object.values(filterValues).some((v) => v !== '' && v != null))

function clearFilters() {
  for (const key of Object.keys(filterValues)) filterValues[key] = ''
}

function selectOptionsFor(field) {
  return (field.options || '')
    .split('\n')
    .map((o) => o.trim())
    .filter(Boolean)
    .map((o) => ({ label: o, value: o }))
}

const listFilters = computed(() => {
  const result = {}
  for (const field of filterFields.value) {
    const value = filterValues[field.fieldname]
    if (value === '' || value == null) continue
    if (field.fieldtype === 'Check') {
      result[field.fieldname] = Number(value)
    } else if (field.fieldtype === 'Select' || field.fieldtype === 'Date' || field.fieldtype === 'Datetime') {
      result[field.fieldname] = value
    } else {
      result[field.fieldname] = ['like', `%${value}%`]
    }
  }
  return result
})

const rows = useList({
  doctype: props.doctype,
  fields: () => (columns.value.length ? ['name', ...columns.value.map((c) => c.fieldname)] : ['name']),
  filters: () => listFilters.value,
  orderBy: () => {
    const meta = metaResource.data
    return `${meta?.sort_field || 'modified'} ${meta?.sort_order || 'desc'}`
  },
  limit: 20,
  immediate: false,
})

function formatValue(value, field) {
  if (field.fieldtype === 'Check') return value ? 'Yes' : 'No'
  if (value === null || value === undefined || value === '') return '-'
  return value
}

function goToNew() {
  router.push({ name: 'DoctypeNew', params: { doctypeRoute: route.params.doctypeRoute } })
}

function goToRow(name) {
  router.push({ name: 'DoctypeForm', params: { doctypeRoute: route.params.doctypeRoute, name } })
}
</script>
