<template>
  <AppLayout>
    <PageHeader>
      <template #title>
        <h1 class="text-lg font-semibold text-ink-gray-9">{{ pageTitle }}</h1>
      </template>
      <template #actions>
        <Button v-if="metaResource.data" variant="solid" @click="goToNew">
          <template #prefix><FeatherIcon name="plus" class="h-4 w-4" /></template>
          New
        </Button>
      </template>
    </PageHeader>

    <div v-if="metaResource.loading && !metaResource.data" class="space-y-2">
      <Skeleton v-for="i in 5" :key="i" height="2.5rem" />
    </div>
    <ErrorMessage v-else-if="metaResource.error" :message="metaResource.error" />

    <template v-else-if="metaResource.data">
      <!-- Toolbar: search/quick filters on the left, a thin divider, then
      Reload / Filter / Sort / Columns on the right - Helpdesk-style.
      Desktop opens Filter/Sort/Columns in an anchored Popover; mobile opens
      Filter/Sort in a bottom-sheet Dialog instead (screen-space and touch-
      target reasons; the column picker stays a Popover even on mobile). -->
      <div class="mb-4 flex items-center justify-between gap-2">
        <div class="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1">
          <div class="min-w-0 flex-1 sm:min-w-64 sm:max-w-xs sm:flex-none">
            <TextInput v-model="searchQuery" type="text" placeholder="Search by ID">
              <template #prefix>
                <FeatherIcon name="search" class="h-4 w-4 text-ink-gray-5" />
              </template>
            </TextInput>
          </div>
          <template v-if="!isMobile">
            <div v-for="field in quickFilterFields" :key="field.fieldname" class="min-w-36 flex-shrink-0">
              <FormControl
                v-if="field.fieldtype === 'Select'"
                type="select"
                class="[&_[data-slot=trigger]]:w-full"
                :options="[{ label: field.label, value: '' }, ...selectOptions(field)]"
                v-model="quickFilters[field.fieldname]"
              />
              <FormControl
                v-else-if="field.fieldtype === 'Check'"
                type="select"
                class="[&_[data-slot=trigger]]:w-full"
                :options="[{ label: field.label, value: '' }, { label: 'Yes', value: '1' }, { label: 'No', value: '0' }]"
                v-model="quickFilters[field.fieldname]"
              />
              <FormControl v-else type="text" :placeholder="field.label" v-model="quickFilters[field.fieldname]" />
            </div>
          </template>
        </div>

        <div v-if="!isMobile" class="h-5 flex-shrink-0 border-s border-outline-gray-2" />

        <div class="flex flex-shrink-0 items-center gap-2">
          <Button variant="outline" icon="refresh-cw" tooltip="Refresh" :loading="pageResource.loading" @click="refreshList" />

          <template v-if="!isMobile">
            <Popover v-model:show="showFilterPopover" placement="bottom-end" popover-class="doctype-list-popover" :hide-on-blur="false">
              <template #target="{ togglePopover }">
                <Button variant="outline" icon-left="filter" label="Filter" data-toolbar-popover-trigger @click="togglePopover">
                  <template v-if="activeFilterCount" #suffix>
                    <span class="flex h-4 min-w-4 items-center justify-center rounded-full bg-surface-gray-7 px-1 text-xs text-ink-white">
                      {{ activeFilterCount }}
                    </span>
                  </template>
                </Button>
              </template>
              <template #body-main>
                <div class="w-[26rem] max-w-[90vw] p-3">
                  <FilterEditor :fields="allFields" v-model="advancedFilters" />
                </div>
              </template>
            </Popover>

            <SortControl v-model="sortValue" v-model:show="showSortPopover" :fields="allFields" />
          </template>

          <template v-else>
            <span class="relative inline-flex">
              <Button variant="outline" icon="filter" tooltip="Filter" @click="showFilterSheet = true" />
              <span
                v-if="activeFilterCount"
                class="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-surface-gray-7 px-1 text-xs text-ink-white"
              >
                {{ activeFilterCount }}
              </span>
            </span>
            <Button variant="outline" icon="sliders" tooltip="Sort" @click="showSortSheet = true" />
          </template>

          <ColumnPicker v-model:show="showColumnsPopover" :prefs="columnPrefs" locked-label="ID" :compact="isMobile" />
        </div>
      </div>

      <Dialog v-model="showFilterSheet" :options="{ size: 'sm', title: 'filter-sheet' }">
        <template #body>
          <div class="filter-sheet-panel flex flex-col">
            <div class="flex h-12 flex-shrink-0 items-center justify-between border-b px-4 dark:border-gray-800">
              <h3 class="text-base font-semibold text-ink-gray-9">Filter</h3>
              <Button variant="ghost" size="sm" icon="x" tooltip="Close" @click="showFilterSheet = false" />
            </div>
            <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <FilterEditor :fields="allFields" v-model="advancedFilters" @update:model-value="showFilterSheet = false" />
            </div>
            <div class="flex flex-shrink-0 justify-end border-t px-4 py-3 dark:border-gray-800">
              <Button icon-left="x" @click="showFilterSheet = false" size="sm">Close</Button>
            </div>
          </div>
        </template>
      </Dialog>

      <Dialog v-model="showSortSheet" :options="{ size: 'sm', title: 'sort-sheet' }">
        <template #body>
          <div class="filter-sheet-panel flex flex-col">
            <div class="flex h-12 flex-shrink-0 items-center justify-between border-b px-4 dark:border-gray-800">
              <h3 class="text-base font-semibold text-ink-gray-9">Sort</h3>
              <Button variant="ghost" size="sm" icon="x" tooltip="Close" @click="showSortSheet = false" />
            </div>
            <div class="px-4 py-4">
              <SortEditor :fields="allFields" v-model="sortValue" />
            </div>
            <div class="flex justify-end gap-2 border-t px-4 py-3 dark:border-gray-800">
              <Button icon-left="x" @click="showSortSheet = false" size="sm">Close</Button>
              <Button variant="solid" icon-left="check" @click="showSortSheet = false" size="sm">Done</Button>
            </div>
          </div>
        </template>
      </Dialog>

      <Dialog
        v-model="showBulkDeleteConfirm"
        :options="{
          title: `Delete ${selectedNames.length} record${selectedNames.length === 1 ? '' : 's'}?`,
          message: 'This cannot be undone.',
          icon: { name: 'alert-triangle', appearance: 'danger' },
          actions: [
            { label: 'Delete', variant: 'solid', theme: 'red', onClick: doBulkDelete },
            { label: 'Cancel' },
          ],
        }"
      />

      <div v-if="pageResource.loading && !pageResource.data" class="space-y-2">
        <Skeleton v-for="i in 5" :key="i" height="2.5rem" />
      </div>
      <ErrorMessage v-else-if="listError" :message="listError" />
      <!-- No separate hand-built empty state on desktop - ListView's own
      emptyState option (listViewOptions, in script) covers that. Mobile
      has no such built-in (it's a plain card list, not ListView), so it
      keeps its own empty-state block just below. -->
      <div
        v-else-if="isMobile && allRows.length === 0"
        class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-outline-gray-2 py-16 text-center"
      >
        <span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-gray-2">
          <FeatherIcon name="inbox" class="h-5 w-5 text-ink-gray-4" />
        </span>
        <p class="text-sm text-ink-gray-5">
          {{ hasActiveFilters ? 'No records match your filters.' : 'No records yet.' }}
        </p>
        <Button v-if="hasActiveFilters" variant="ghost" @click="clearAllFilters">Clear filters</Button>
        <Button v-else-if="metaResource.data" variant="outline" @click="goToNew">
          <template #prefix><FeatherIcon name="plus" class="h-4 w-4" /></template>
          Create the first one
        </Button>
      </div>

      <!-- Mobile: each row is its own card (a table forces horizontal
      scrolling on a phone), title/ID as the card's heading, every
      in_list_view column shown as a label/value line below it, and a left-
      border accent colored by whichever status-like field this list has. -->
      <div v-if="showResults && isMobile" class="space-y-2">
        <div
          v-for="row in allRows"
          :key="row.name"
          class="cursor-pointer overflow-hidden rounded-xl border bg-surface-white p-3.5 shadow-sm transition-shadow active:shadow-none dark:border-gray-800"
          :style="cardAccentStyle(row)"
          @click="goToRow(row.name)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="max-w-[60%] truncate rounded-md bg-surface-gray-2 px-1.5 py-0.5 font-mono text-xs text-ink-gray-6">
              {{ row.name }}
            </span>
            <div class="flex items-center gap-1.5">
              <span
                v-if="cardStatusColumn && row[cardStatusColumn.fieldname]"
                class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                :class="statusBadgeClasses(row[cardStatusColumn.fieldname])"
              >
                {{ row[cardStatusColumn.fieldname] }}
              </span>
              <FeatherIcon name="chevron-right" class="h-4 w-4 flex-shrink-0 text-ink-gray-3" />
            </div>
          </div>
          <div v-if="cardTitle(row) !== row.name" class="mt-2 truncate text-base font-semibold text-ink-gray-9">
            {{ cardTitle(row) }}
          </div>
          <dl v-if="cardBodyColumnsFor(row).length" class="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2.5">
            <div v-for="col in cardBodyColumnsFor(row)" :key="col.fieldname" class="min-w-0">
              <dt class="truncate text-xs text-ink-gray-4">{{ col.label }}</dt>
              <dd class="truncate text-base text-ink-gray-7">{{ formatValue(row[col.fieldname], col) }}</dd>
            </div>
          </dl>
          <p v-if="row.modified" class="mt-2.5 text-xs text-ink-gray-5" :title="row.modified">
            Updated {{ timeAgo(row.modified) }}
          </p>
        </div>
      </div>

      <!-- Desktop: frappe-ui's own ListView/ListFooter - checkbox
      selection (incl. shift-click range select), a floating select-banner,
      sticky/resizable columns, and row hover/active states out of the box
      instead of a hand-rolled table. -->
      <div v-if="!isMobile" class="doctype-list-scroll mt-1" @scroll.passive="onListScroll">
        <ListView
          :key="gridKey"
          :columns="listViewColumns"
          :rows="allRows"
          row-key="name"
          :options="listViewOptions"
          @update:selections="(sel) => (selectedNames = Array.from(sel))"
        >
          <template #cell="{ column, row, item }">
            <ListRowItem :column="column" :row="row" :item="formatValue(item, column.docField)" v-slot="{ label }">
              <span v-if="isStatusLikeField(column.docField) && item" class="inline-flex items-center gap-1.5">
                <span class="h-2 w-2 flex-shrink-0 rounded-full" :style="{ backgroundColor: statusDotColor(item) }" />
                <span class="truncate text-base">{{ item }}</span>
              </span>
              <span v-else-if="column.key === 'modified'" class="truncate text-base text-ink-gray-6" :title="row.modified">
                {{ timeAgo(row.modified) }}
              </span>
              <div v-else class="truncate text-base">{{ label }}</div>
            </ListRowItem>
          </template>
          <template #default="{ showGroupedRows, selectable }">
            <ListHeader />
            <template v-if="allRows.length">
              <ListGroups v-if="showGroupedRows" />
              <ListRows v-else />
            </template>
            <ListEmptyState v-else />
            <SelectionBar v-if="selectable" @delete="confirmBulkDelete" />
          </template>
        </ListView>
      </div>

      <!-- Row count, Load More and the page-size choice. The list above
      scrolls inside its own box, so the page itself does not grow with the
      number of rows. -->
      <ListFooter
        v-if="showResults"
        class="mt-3"
        :model-value="pageSize"
        :options="{ rowCount: allRows.length, totalCount: totalCountResource.data ?? 0, pageLengthOptions: PAGE_SIZE_OPTIONS }"
        @update:model-value="setPageSize"
      >
        <template #right>
          <div class="flex items-center">
            <Button v-if="canLoadMore" variant="outline" size="sm" :loading="moreResource.loading" @click="loadMore">Load More</Button>
            <div v-if="canLoadMore" class="mx-3 h-5 border-s border-outline-gray-2" />
            <div class="flex items-center gap-1 text-base text-ink-gray-5">
              <div>{{ allRows.length }}</div>
              <div>of</div>
              <div>{{ totalCountResource.data ?? 0 }}</div>
            </div>
          </div>
        </template>
      </ListFooter>
    </template>
  </AppLayout>
</template>

<style>
/* The desktop list is about 15 rows tall: more rows scroll inside this box,
not the whole page, and the column headings stay in view. */
.doctype-list-scroll {
  max-height: 41rem;
  overflow: auto;
  overscroll-behavior: contain;
}
.doctype-list-scroll > .relative.overflow-x-auto,
.doctype-list-scroll .flex.w-max.min-w-full {
  overflow: visible !important;
}
.doctype-list-scroll .mb-2.grid.rounded.bg-surface-gray-2 {
  position: sticky;
  top: 0;
  z-index: 5;
}

/* Bottom-sheet treatment for the mobile Filter/Sort dialogs - anchored to
the bottom edge and rounded only on top, the conventional mobile
filter-sheet affordance instead of a dialog that happens to fill the
screen. */
[data-dialog='filter-sheet'].dialog-overlay,
[data-dialog='sort-sheet'].dialog-overlay {
  z-index: 1050;
}
[data-dialog='filter-sheet'].dialog-overlay > div,
[data-dialog='sort-sheet'].dialog-overlay > div {
  justify-content: flex-end;
  padding: 0;
}
[data-dialog='filter-sheet'] .dialog-content,
[data-dialog='sort-sheet'] .dialog-content {
  margin: 0;
  max-width: none;
  width: 100vw;
  border-radius: 1rem 1rem 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  animation: list-sheet-up 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes list-sheet-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-dialog='filter-sheet'] .dialog-content,
  [data-dialog='sort-sheet'] .dialog-content {
    animation: none;
  }
}

/* Desktop's Filter/Sort Popover has no elevation of its own beyond
frappe-ui's default shadow-xl - next to nearby page content that default
reads as "part of the layout" rather than a panel floating above it. A
visibly stronger shadow makes the overlay read clearly as floating. */
.doctype-list-popover > div {
  box-shadow: 0 12px 32px -8px rgb(15 23 42 / 0.22), 0 0 0 1px rgb(15 23 42 / 0.04);
}
:global(.dark) .doctype-list-popover > div {
  box-shadow: 0 12px 32px -8px rgb(0 0 0 / 0.55), 0 0 0 1px rgb(255 255 255 / 0.06);
}

.filter-sheet-panel {
  width: 100%;
  max-height: 75vh;
}
</style>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { breakpointsTailwind, useBreakpoints, watchDebounced } from '@vueuse/core'
import {
  useCall,
  call,
  Button,
  TextInput,
  Dialog,
  ErrorMessage,
  FeatherIcon,
  FormControl,
  ListView,
  ListHeader,
  ListRows,
  ListRowItem,
  ListGroups,
  ListEmptyState,
  ListFooter,
  Popover,
  toast,
} from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterEditor from '@/components/FilterEditor.vue'
import SortEditor from '@/components/SortEditor.vue'
import SortControl from '@/components/SortControl.vue'
import SelectionBar from '@/components/SelectionBar.vue'
import ColumnPicker from '@/components/ColumnPicker.vue'
import { useColumnPrefs } from '@/composables/useColumnPrefs'
import Skeleton from '@/components/Skeleton.vue'
import { useMeta, useListFields, useFormFields } from '@/data/useMeta'
import { findModuleByRoute } from '@/data/modules'
import { setPageTitle } from '@/data/pageTitle'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('sm')

const props = defineProps({
  doctype: { type: String, required: true },
})

const route = useRoute()
const router = useRouter()

const metaResource = useMeta(props.doctype)
const columns = useListFields(metaResource)
// Every real field on the doctype, not just in_standard_filter ones - the
// "+ Add a Filter" row and the Columns picker both let a user explicitly
// pick any field.
const allFields = useFormFields(metaResource)

// A Single doctype (e.g. Master Settings) has exactly one record, named
// after the doctype itself, and no real list to page through -
// frappe.client.get_list throws against it. Skip the list view entirely
// and go straight to its one record's form.
watch(
  () => metaResource.data?.issingle,
  (isSingle) => {
    if (isSingle) {
      router.replace({ name: 'DoctypeForm', params: { doctypeRoute: route.params.doctypeRoute, name: props.doctype } })
    }
  },
  { immediate: true },
)

// Which of `columns` are actually shown, in both the desktop table and the
// mobile card view - defaults to all of them, narrowed via the Columns
// popover. Kept separate from `columns` itself (which still drives what
// fields are fetched from the server) so toggling visibility is instant
// and doesn't require a refetch.
const columnPrefs = useColumnPrefs({
  storageKey: `annual-budget-list-columns-${props.doctype}`,
  allFields,
  defaultColumns: columns,
})
const visibleColumns = columnPrefs.visibleColumns

// Everything the list must fetch: the record ID, every default
// in_list_view field (mobile cards always show those) and whatever extra
// columns the user picked.
const fetchFields = computed(() => {
  const names = new Set(['name', 'modified'])
  columns.value.forEach((c) => names.add(c.fieldname))
  visibleColumns.value.forEach((c) => names.add(c.fieldname))
  return [...names]
})

// Two independent filter sources feeding the same query: quickFilters (the
// always-visible per-column boxes below the toolbar) and advancedFilters
// (the Filter popover/sheet's FilterEditor state, any field/operator).
// advancedFilters wins on any field both happen to set.
const quickFilters = reactive({})
const advancedFilters = ref({})
function filtersFromRoute() {
  try {
    const parsed = route.query.filters ? JSON.parse(route.query.filters) : null
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}
advancedFilters.value = filtersFromRoute()
watch(() => route.query.filters, () => { advancedFilters.value = filtersFromRoute() })
const searchQuery = ref('')

function selectOptions(field) {
  return (field.options || '')
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => ({ label: v, value: v }))
}

// Fields offered as inline quick filters in the toolbar, as in Helpdesk:
// the doctype's own "standard filter" fields (up to three), or - if it
// flags none - its first few list columns.
const QUICK_FILTER_FIELDTYPES = new Set(['Select', 'Check', 'Data', 'Link', 'Small Text', 'Phone', 'Int', 'Float'])
const quickFilterFields = computed(() => {
  const flagged = allFields.value.filter((f) => f.in_standard_filter && QUICK_FILTER_FIELDTYPES.has(f.fieldtype))
  const pool = flagged.length ? flagged : columns.value.filter((f) => QUICK_FILTER_FIELDTYPES.has(f.fieldtype))
  return pool.slice(0, 3)
})

const quickFilterEntries = computed(() => {
  const result = {}
  for (const field of quickFilterFields.value) {
    const value = quickFilters[field.fieldname]
    if (value == null || value === '') continue
    if (field.fieldtype === 'Check') {
      result[field.fieldname] = Number(value)
    } else if (field.fieldtype === 'Select') {
      result[field.fieldname] = value
    } else {
      result[field.fieldname] = ['like', `%${value}%`]
    }
  }
  return result
})

// Search is a plain `name like %q%` - this app has no server-side search
// endpoint spanning every text field/child-table row the way a dedicated
// search API would, so this only ever matches the record's own ID.
const debouncedSearch = ref('')
watchDebounced(searchQuery, (q) => { debouncedSearch.value = q.trim() }, { debounce: 300 })
const searchFilter = computed(() => (debouncedSearch.value ? { name: ['like', `%${debouncedSearch.value}%`] } : {}))

const listFilters = computed(() => ({ ...quickFilterEntries.value, ...advancedFilters.value, ...searchFilter.value }))
const hasActiveFilters = computed(() => Object.keys(listFilters.value).length > 0)
const activeFilterCount = computed(() => Object.keys(advancedFilters.value).length)

function clearAllFilters() {
  for (const key of Object.keys(quickFilters)) delete quickFilters[key]
  advancedFilters.value = {}
  searchQuery.value = ''
}

// Starts at the doctype's own declared default (sort_field/sort_order)
// rather than a hardcoded "modified desc" - only actually applied once
// metaResource.data resolves.
const sortValue = ref({ field: 'modified', direction: 'desc' })
let sortDefaultInitialized = false
watch(
  () => metaResource.data,
  (meta) => {
    if (!meta || sortDefaultInitialized || meta.issingle) return
    sortDefaultInitialized = true
    totalCountResource.fetch()
    sortValue.value = {
      field: meta.sort_field || 'modified',
      direction: (meta.sort_order || 'desc').toLowerCase(),
    }
  },
)

const pageTitle = computed(() => findModuleByRoute(route.params.doctypeRoute)?.label || props.doctype)
watch(pageTitle, (t) => setPageTitle(t), { immediate: true })

// The list shows `pageSize` rows to start with; Load More adds the next
// `pageSize`, and the list scrolls inside its own box. A change of
// filters, sort or doctype starts again from the top.
const PAGE_SIZE_OPTIONS = [15, 30, 50, 100]
const pageSize = ref(15)
const moreRows = ref([])
const noMoreRows = ref(false)
function listParams(start) {
  return {
    fields: JSON.stringify(fetchFields.value),
    filters: JSON.stringify(listFilters.value),
    order_by: `${sortValue.value.field} ${sortValue.value.direction}`,
    start,
    limit: pageSize.value,
  }
}
const pageResource = useCall({
  url: `/api/v2/document/${props.doctype}`,
  method: 'GET',
  params: () => listParams(0),
  immediate: false,
})
const moreResource = useCall({
  url: `/api/v2/document/${props.doctype}`,
  method: 'GET',
  params: () => listParams((pageResource.data?.length || 0) + moreRows.value.length),
  immediate: false,
})

let lastLoadKey = ''
function loadPage(force = false) {
  // A Single doctype (e.g. Master Settings) has no real list to page
  // through at all - frappe.client.get_list/get_count both throw against
  // it (ProgrammingError). The route redirects away to its form (see the
  // issingle watcher above) as soon as metaResource resolves, but that
  // redirect lands a tick later than this watcher firing immediately - so
  // this must bail out on its own too, not just rely on the redirect
  // having already happened by the time it runs.
  if (!metaResource.data || metaResource.data.issingle || !fetchFields.value.length) return
  const key = JSON.stringify([fetchFields.value, listFilters.value, sortValue.value, pageSize.value, props.doctype])
  if (!force && key === lastLoadKey) return
  lastLoadKey = key
  moreRows.value = []
  noMoreRows.value = false
  pageResource.fetch()
}
watch(
  () => [JSON.stringify(fetchFields.value), JSON.stringify(listFilters.value), sortValue.value.field, sortValue.value.direction, pageSize.value, props.doctype, !!metaResource.data],
  () => loadPage(),
  { immediate: true },
)

const canLoadMore = computed(() => !noMoreRows.value && allRows.value.length < (totalCountResource.data ?? 0))
function onListScroll(event) {
  const box = event.target
  if (box.scrollTop + box.clientHeight >= box.scrollHeight - 80) loadMore()
}

async function loadMore() {
  if (moreResource.loading || pageResource.loading || !canLoadMore.value) return
  const key = lastLoadKey
  const next = (await moreResource.fetch()) || []
  if (key !== lastLoadKey) return
  const have = new Set(allRows.value.map((r) => r.name))
  moreRows.value = [...moreRows.value, ...next.filter((r) => !have.has(r.name))]
  if (next.length < pageSize.value || allRows.value.length >= (totalCountResource.data ?? Infinity)) noMoreRows.value = true
}
function setPageSize(size) {
  pageSize.value = size
}

const allRows = computed(() => [...(pageResource.data || []), ...moreRows.value])
const listError = computed(() => {
  const error = pageResource.error
  return error && !/abort/i.test(String(error?.message || error)) ? error : null
})

const showResults = computed(() => !pageResource.loading && !listError.value && allRows.value.length > 0)

const ID_COLUMN = { fieldname: 'name', label: 'ID', fieldtype: 'Data' }
const MODIFIED_COLUMN = { fieldname: 'modified', label: 'Last Modified', fieldtype: 'Datetime' }
function columnWidth(col) {
  if (col.fieldname === 'modified') return '6.5rem'
  let longest = String(col.label || '').length + 2
  for (const row of allRows.value) {
    const text = col.fieldname === 'modified' ? '10mo' : String(formatValue(row[col.fieldname], col) ?? '')
    if (text.length > longest) longest = text.length
  }
  const rem = Math.min(Math.max(longest * 0.5 + 1.5, 5), 15).toFixed(1)
  return `minmax(${rem}rem, ${rem}fr)`
}
const listViewColumns = computed(() =>
  [ID_COLUMN, ...visibleColumns.value.filter((c) => c.fieldname !== 'name' && c.fieldname !== 'modified'), MODIFIED_COLUMN].map((col) => ({
    key: col.fieldname,
    label: col.fieldname === 'name' ? 'ID' : col.fieldname === 'modified' ? 'Last Modified' : col.label,
    width: columnWidth(col),
    docField: col,
  })),
)

const listViewOptions = computed(() => ({
  selectable: true,
  showTooltip: false,
  getRowRoute: (row) => getRowRouteFor(row.name),
  emptyState: {
    title: hasActiveFilters.value ? 'No records match your filters' : 'No records yet',
    description: hasActiveFilters.value ? 'Try adjusting or clearing your filters.' : undefined,
    button: hasActiveFilters.value
      ? { label: 'Clear filters', variant: 'ghost', onClick: clearAllFilters }
      : { label: 'Create the first one', variant: 'outline', iconLeft: 'plus', onClick: goToNew },
  },
}))

const showFilterPopover = ref(false)
const showSortPopover = ref(false)
const showColumnsPopover = ref(false)
function closeToolbarPopoversOnOutsideClick(event) {
  if (!showFilterPopover.value && !showSortPopover.value && !showColumnsPopover.value) return
  const target = event.target
  if (!(target instanceof Element)) return
  if (
    target.closest('.doctype-list-popover, [data-reka-popper-content-wrapper], [data-slot="content"], [data-toolbar-popover-trigger]')
  )
    return
  showFilterPopover.value = false
  showSortPopover.value = false
  showColumnsPopover.value = false
}
watch(showFilterPopover, (open) => { if (open) { showSortPopover.value = false; showColumnsPopover.value = false } })
watch(showSortPopover, (open) => { if (open) { showFilterPopover.value = false; showColumnsPopover.value = false } })
watch(showColumnsPopover, (open) => { if (open) { showFilterPopover.value = false; showSortPopover.value = false } })
onMounted(() => document.addEventListener('pointerdown', closeToolbarPopoversOnOutsideClick, true))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeToolbarPopoversOnOutsideClick, true))

const showFilterSheet = ref(false)
const showSortSheet = ref(false)

const selectedNames = ref([])
const gridKey = ref(0)
watch([listFilters, sortValue, pageSize], () => {
  selectedNames.value = []
  gridKey.value++
})

const showBulkDeleteConfirm = ref(false)
function confirmBulkDelete() {
  showBulkDeleteConfirm.value = true
}

async function doBulkDelete(close) {
  const names = selectedNames.value
  let failed = 0
  for (const name of names) {
    try {
      await call('frappe.client.delete', { doctype: props.doctype, name })
    } catch {
      failed++
    }
  }
  selectedNames.value = []
  gridKey.value++
  close()
  loadPage(true)
  totalCountResource.fetch()

  const deleted = names.length - failed
  if (failed === 0) {
    toast.success(`Deleted ${deleted} record${deleted === 1 ? '' : 's'}`)
  } else if (deleted === 0) {
    toast.error(`Could not delete ${failed === 1 ? 'that record' : 'those records'} - they may be linked elsewhere`)
  } else {
    toast.warning(`Deleted ${deleted}, but ${failed} couldn't be removed - they may be linked elsewhere`)
  }
}

function formatValue(value, field) {
  if (value == null || value === '') return '-'
  if (field.fieldtype === 'Check') return value ? 'Yes' : 'No'
  return value
}

function refreshList() {
  loadPage(true)
  totalCountResource.fetch()
}

const totalCountResource = useCall({
  url: '/api/v2/method/frappe.client.get_count',
  method: 'GET',
  params: () => ({ doctype: props.doctype, filters: JSON.stringify(listFilters.value) }),
  immediate: false,
})
watch(listFilters, () => { if (!metaResource.data?.issingle) totalCountResource.fetch() }, { immediate: false })

// Status-like field: a Select whose own options read like a workflow state
// (a handful of short words - Open/Closed/Pending, not a long free-text
// list) - shown as a colored dot (desktop) / badge (mobile) rather than
// plain text, and as a left-border accent on a mobile card.
function isStatusLikeField(field) {
  if (!field || field.fieldtype !== 'Select') return false
  const options = (field.options || '').split('\n').map((o) => o.trim()).filter(Boolean)
  return options.length >= 2 && options.length <= 8 && options.every((o) => o.length <= 20)
}
const STATUS_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#64748b', '#db2777']
function statusDotColor(value) {
  let hash = 0
  for (const ch of String(value)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return STATUS_COLORS[hash % STATUS_COLORS.length]
}
function statusBadgeClasses() {
  return 'bg-surface-gray-2 text-ink-gray-8'
}

function timeAgo(dateString) {
  const then = new Date(dateString.replace(' ', 'T')).getTime()
  const seconds = Math.floor((Date.now() - then) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

const titleFieldname = computed(() => metaResource.data?.title_field || null)
function cardTitle(row) {
  if (titleFieldname.value && row[titleFieldname.value]) return row[titleFieldname.value]
  return row.name
}

const cardStatusColumn = computed(() => columns.value.find((c) => isStatusLikeField(c)) || null)
function cardBodyColumnsFor(row) {
  const title = cardTitle(row)
  return visibleColumns.value.filter(
    (c) => c.fieldname !== titleFieldname.value && c.fieldname !== cardStatusColumn.value?.fieldname && row[c.fieldname] !== title,
  )
}

function cardAccentStyle(row) {
  const statusCol = visibleColumns.value.find((col) => isStatusLikeField(col))
  if (!statusCol || !row[statusCol.fieldname]) return {}
  return { borderLeft: `3px solid ${statusDotColor(row[statusCol.fieldname])}` }
}

function goToNew() {
  router.push({ name: 'DoctypeNew', params: { doctypeRoute: route.params.doctypeRoute } })
}
function goToRow(name) {
  router.push(getRowRouteFor(name))
}
function getRowRouteFor(name) {
  return { name: 'DoctypeForm', params: { doctypeRoute: route.params.doctypeRoute, name } }
}
</script>
