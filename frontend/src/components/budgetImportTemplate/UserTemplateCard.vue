<!--
  One card per user (grouped from get_user_mappings' flat row list) -
  mirrors the legacy Desk page's .user-section: profile header, a dismissible
  "how to download" tip, a search box over the row table, row selection
  (checkboxes + select-all/deselect-all), and a Download button that reads
  "Download all" until at least one row is checked, then switches to
  "Download selected".

  Deliberately drops the legacy page's Excel-style per-column filter
  dropdowns - that feature's own CSS was never finished in the original
  (confirmed: zero matching style rules for .col-filter-*), so there's no
  visual design to carry over, and the single search box already covers the
  same "find a row" need across all columns at once.
-->
<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <!-- Profile header -->
    <div class="flex items-center justify-between gap-3 bg-fc-blue-light/40 px-4 py-3 dark:bg-fc-blue-mid/10">
      <div class="flex min-w-0 items-center gap-3">
        <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-fc-blue-mid text-sm font-semibold text-white">
          {{ initials }}
        </span>
        <div class="min-w-0">
          <div class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{{ user.user_fullname || user.email }}</div>
          <div class="truncate text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</div>
        </div>
      </div>
      <div class="flex flex-shrink-0 items-center gap-2">
        <span class="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
          {{ user.rows.length }} row{{ user.rows.length === 1 ? '' : 's' }}
        </span>
        <button
          v-if="collapsible"
          class="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-white/70 dark:text-gray-400 dark:hover:bg-gray-800"
          :title="expanded ? 'Collapse' : 'Expand'"
          @click="expanded = !expanded"
        >
          <FeatherIcon :name="expanded ? 'chevron-up' : 'chevron-down'" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <template v-if="expanded">
      <!-- Dismissible tip -->
      <div v-if="showTip" class="flex items-start justify-between gap-2 bg-blue-50 px-4 py-2 text-xs text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
        <div class="flex items-start gap-1.5">
          <FeatherIcon name="info" class="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>
            <strong>How to download</strong> — Click <strong>Download all</strong> to get the full template, or tick specific rows and the button will switch to <strong>Download selected</strong>.
          </span>
        </div>
        <button class="flex-shrink-0 text-blue-400 hover:text-blue-600" @click="showTip = false">
          <FeatherIcon name="x" class="h-3.5 w-3.5" />
        </button>
      </div>

      <div class="p-4">
        <!-- Action bar -->
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <FormControl
              type="text"
              v-model="search"
              placeholder="Search units, cost centers, locations..."
              class="fc-search-input"
            />
            <span v-if="search" class="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{{ filteredRows.length }} match{{ filteredRows.length === 1 ? '' : 'es' }}</span>
          </div>
          <div class="flex flex-shrink-0 items-center gap-3">
            <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                class="form-checkbox h-4 w-4 !rounded-[3px] border-outline-gray-3"
                :checked="allVisibleSelected"
                :indeterminate.prop="someVisibleSelected"
                @change="toggleSelectAll"
              />
              Select all
            </label>
            <span v-if="selectedKeys.size" class="whitespace-nowrap rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
              {{ selectedKeys.size }} selected
            </span>
            <button
              v-if="selectedKeys.size"
              class="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              @click="deselectAll"
            >
              Deselect all
            </button>
            <Button
              :variant="selectedKeys.size ? 'solid' : 'solid'"
              :theme="selectedKeys.size ? 'green' : 'blue'"
              :loading="downloading"
              @click="$emit('download', { user, selectedRows: selectedRowObjects })"
            >
              <template #prefix>
                <FeatherIcon name="download" class="h-4 w-4" />
              </template>
              {{ selectedKeys.size ? 'Download selected' : 'Download all' }}
            </Button>
          </div>
        </div>

        <!-- Table -->
        <div class="fc-scroll-wrapper">
          <table class="fc-table w-full min-w-[800px] text-sm">
            <thead>
              <tr class="fc-thead-main">
                <th class="fc-th w-10"></th>
                <th class="fc-th text-center">Sl. No.</th>
                <th class="fc-th text-left">Unit</th>
                <th class="fc-th text-left">Unit Description</th>
                <th class="fc-th text-left">Cost Center</th>
                <th class="fc-th text-left">Cost Center Description</th>
                <th class="fc-th text-left">Location Code</th>
                <th class="fc-th text-left">Location Description</th>
                <th class="fc-th text-left">State</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredRows.length">
                <td class="fc-td text-center text-gray-400" colspan="9">No matching rows.</td>
              </tr>
              <tr
                v-for="(row, i) in filteredRows"
                :key="rowKey(row)"
                class="cursor-pointer"
                :class="selectedKeys.has(rowKey(row)) ? 'bg-fc-blue-light/30 dark:bg-fc-blue-mid/10' : ''"
                @click="toggleRow(row)"
              >
                <td class="fc-td text-center" @click.stop>
                  <input
                    type="checkbox"
                    class="form-checkbox h-4 w-4 !rounded-[3px] border-outline-gray-3"
                    :checked="selectedKeys.has(rowKey(row))"
                    @change="toggleRow(row)"
                  />
                </td>
                <td class="fc-td text-center">{{ i + 1 }}</td>
                <td class="fc-td text-left">{{ row.unit }}</td>
                <td class="fc-td text-left">{{ row.unit_description }}</td>
                <td class="fc-td text-left">{{ row.cost_center }}</td>
                <td class="fc-td text-left">{{ row.cost_center_description }}</td>
                <td class="fc-td text-left">{{ row.location_code }}</td>
                <td class="fc-td text-left">{{ row.location_description }}</td>
                <td class="fc-td text-left">{{ row.state }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Button, FeatherIcon, FormControl } from 'frappe-ui'

const props = defineProps({
  user: { type: Object, required: true }, // { user_fullname, email, rows: [...] }
  collapsible: { type: Boolean, default: false },
  startExpanded: { type: Boolean, default: true },
  downloading: { type: Boolean, default: false },
})
defineEmits(['download'])

const expanded = ref(props.startExpanded)
const showTip = ref(true)
const search = ref('')
const selectedKeys = ref(new Set())

const initials = computed(() => {
  const name = props.user.user_fullname || props.user.email || ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
})

function rowKey(row) {
  return `${row.cost_center_id}__${row.location_code_id}`
}

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.user.rows
  return props.user.rows.filter((row) =>
    [
      row.unit, row.unit_description,
      row.cost_center, row.cost_center_description, row.cost_center_id,
      row.location_code, row.location_description, row.location_code_id,
      row.state,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q))
  )
})

const allVisibleSelected = computed(() =>
  filteredRows.value.length > 0 && filteredRows.value.every((row) => selectedKeys.value.has(rowKey(row)))
)
const someVisibleSelected = computed(() =>
  !allVisibleSelected.value && filteredRows.value.some((row) => selectedKeys.value.has(rowKey(row)))
)

function toggleRow(row) {
  const key = rowKey(row)
  const next = new Set(selectedKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  selectedKeys.value = next
}

function toggleSelectAll() {
  const next = new Set(selectedKeys.value)
  if (allVisibleSelected.value) {
    for (const row of filteredRows.value) next.delete(rowKey(row))
  } else {
    for (const row of filteredRows.value) next.add(rowKey(row))
  }
  selectedKeys.value = next
}

function deselectAll() {
  selectedKeys.value = new Set()
}

const selectedRowObjects = computed(() =>
  props.user.rows.filter((row) => selectedKeys.value.has(rowKey(row)))
)

defineExpose({ deselectAll })
</script>
