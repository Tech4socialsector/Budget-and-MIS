<template>
  <div>
    <div class="mb-2 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h3 class="text-base font-medium text-ink-gray-7">{{ field.label }}</h3>
        <p v-if="field.description" class="mt-0.5 text-xs text-ink-gray-5">{{ field.description }}</p>
      </div>
      <Button v-if="!readOnlyTable" variant="ghost" @click="addRow">
        <template #prefix>
          <FeatherIcon name="plus" class="h-4 w-4" />
        </template>
        Add Row
      </Button>
    </div>

    <div class="mb-2 flex items-center gap-2">
      <div class="min-w-0 flex-1">
        <TextInput
          v-model="searchQuery"
          type="text"
          :placeholder="rows.length ? 'Search rows' : 'Search rows (add a row first)'"
          :disabled="!rows.length"
        >
          <template #prefix>
            <FeatherIcon name="search" class="h-4 w-4 text-ink-gray-5" />
          </template>
        </TextInput>
      </div>
      <ColumnPicker :prefs="columnPrefs" :compact="isMobile" class="flex-shrink-0" />
    </div>

    <!-- Mobile: each row is a card (the grid needs horizontal room a phone
    doesn't have). Same operations as the desktop grid - tap a card to edit
    it, per-card "..." menu (Duplicate / Insert Above / Insert Below /
    Remove), plus a checkbox on every card, Select all, and a bulk bar
    (Duplicate / Delete) once anything is ticked. -->
    <template v-if="isMobile">
      <div
        v-if="rows.length && !readOnlyTable"
        class="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-surface-white px-3 py-2 dark:border-gray-800"
      >
        <label class="flex items-center gap-2 text-sm text-ink-gray-6">
          <input
            type="checkbox"
            class="form-checkbox h-4 w-4 !rounded-[3px] border-outline-gray-3"
            :checked="allSelected"
            :indeterminate.prop="someSelected"
            @change="toggleSelectAll"
          />
          <span class="whitespace-nowrap">{{ allSelected ? 'Unselect all' : selectedKeys.length ? `${selectedKeys.length} selected` : 'Select all' }}</span>
        </label>
        <div v-if="selectedKeys.length" class="flex items-center gap-1.5">
          <Button size="sm" @click="duplicateSelected">
            <template #prefix><FeatherIcon name="copy" class="h-3.5 w-3.5" /></template>
            Duplicate
          </Button>
          <Button size="sm" variant="subtle" theme="red" @click="confirmBulkRemove">
            <template #prefix><FeatherIcon name="trash-2" class="h-3.5 w-3.5" /></template>
            Delete
          </Button>
          <Button variant="ghost" size="sm" icon="x" tooltip="Clear selection" aria-label="Clear selection" @click="selectedKeys = []" />
        </div>
      </div>

      <div v-if="filteredRows.length" class="space-y-2">
        <div
          v-for="row in filteredRows"
          :key="row.__key"
          class="rounded-xl border bg-surface-white p-3 shadow-sm dark:border-gray-800"
          :class="selectedKeys.includes(row.__key) ? 'border-gray-900 ring-1 ring-gray-900 dark:border-gray-100 dark:ring-gray-100' : ''"
        >
          <div class="flex items-start gap-3">
            <input
              v-if="!readOnlyTable"
              type="checkbox"
              class="form-checkbox mt-0.5 h-4 w-4 flex-shrink-0 !rounded-[3px] border-outline-gray-3"
              :checked="selectedKeys.includes(row.__key)"
              :aria-label="`Select row ${rows.indexOf(row) + 1}`"
              @change="toggleSelected(row.__key)"
            />
            <div class="min-w-0 flex-1 cursor-pointer" @click="openRow(rows.indexOf(row))">
              <div class="flex items-center gap-2">
                <span class="rounded-md bg-surface-gray-2 px-1.5 py-0.5 font-mono text-xs text-ink-gray-6">
                  #{{ rows.indexOf(row) + 1 }}
                </span>
                <span class="truncate text-sm font-semibold text-ink-gray-8">{{ cardTitle(row) }}</span>
              </div>
              <dl v-if="cardBodyColumns.length" class="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                <div v-for="col in cardBodyColumns" :key="col.fieldname" class="min-w-0">
                  <dt class="truncate text-xs text-ink-gray-4">{{ col.label }}</dt>
                  <dd class="truncate text-sm text-ink-gray-7">{{ formatValue(row[col.fieldname], col) }}</dd>
                </div>
              </dl>
            </div>
            <Dropdown v-if="!readOnlyTable" placement="bottom-end" :options="rowActions(rows.indexOf(row))">
              <template #default>
                <Button variant="ghost" size="sm" icon="more-vertical" tooltip="Row actions" aria-label="Row actions" />
              </template>
            </Dropdown>
          </div>
        </div>
      </div>
      <div v-else-if="searchQuery" class="px-4 py-8 text-center text-sm text-ink-gray-5">
        No rows match "{{ searchQuery }}".
      </div>
      <div v-else class="rounded-xl border border-dashed border-outline-gray-2 py-10 text-center text-sm text-ink-gray-5">
        No rows yet
      </div>
    </template>

    <!-- Desktop: frappe-ui's own ListView/ListRows grid - borderless rows,
    row hover highlight, checkbox column + floating select-banner for bulk
    delete. Each row also keeps an Edit icon plus a "..." menu via
    ListRowItem's #suffix slot on the last column. -->
    <ListView
      v-else
      :key="gridKey"
      :columns="listViewColumns"
      :rows="filteredRows"
      row-key="__key"
      :options="listViewOptions"
      @update:selections="(sel) => (selectedKeys = Array.from(sel))"
    >
      <template #cell="{ column, row, item }">
        <ListRowItem :column="column" :row="row" :item="formatValue(item, column.docField)">
          <template v-if="column.key === lastColumnKey" #suffix>
            <div class="ml-auto flex items-center gap-1" @click.stop>
              <Tooltip :text="readOnlyTable ? 'View row' : 'Edit row'">
                <Button variant="ghost" size="sm" :icon="readOnlyTable ? 'eye' : 'edit-2'" @click="openRow(rows.indexOf(row))" />
              </Tooltip>
              <Dropdown v-if="!readOnlyTable" placement="bottom-end" :options="rowActions(rows.indexOf(row))">
                <template #default>
                  <Button variant="ghost" size="sm" icon="more-horizontal" tooltip="More actions" />
                </template>
              </Dropdown>
            </div>
          </template>
        </ListRowItem>
      </template>
      <template #default="{ showGroupedRows, selectable }">
        <ListHeader />
        <template v-if="filteredRows.length">
          <ListGroups v-if="showGroupedRows" />
          <ListRows v-else />
        </template>
        <div v-else-if="searchQuery" class="px-4 py-8 text-center text-sm text-ink-gray-5">
          No rows match "{{ searchQuery }}".
        </div>
        <ListEmptyState v-else />
        <SelectionBar v-if="selectable" duplicate @duplicate="duplicateSelected" @delete="confirmBulkRemove" />
      </template>
    </ListView>

    <Dialog v-model="showRowEditor" :options="{ size: '2xl', title: 'row-editor' }">
      <template #body>
        <div class="row-editor-panel flex flex-col" :style="{ height: editorHeight }">
          <div class="flex h-12 flex-shrink-0 items-center justify-between border-b px-4 dark:border-gray-800 sm:px-6">
            <h3 class="truncate text-base font-semibold text-ink-gray-8">
              {{ field.label }} - Row {{ (editingIdx ?? 0) + 1 }}
            </h3>
            <Button variant="ghost" size="sm" icon="x" tooltip="Close" @click="showRowEditor = false" />
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div v-if="editingRow" class="grid grid-cols-1 gap-4">
              <DynamicField
                v-for="col in columns"
                :key="col.fieldname"
                :field="col"
                :doctype="field.options"
                :sibling-values="editingRow"
                :parent-values="parentValues"
                :read-only="readOnlyTable"
                v-model="editingRow[col.fieldname]"
              />
            </div>
          </div>

          <div class="flex flex-shrink-0 justify-end gap-2 border-t px-4 py-3 dark:border-gray-800">
            <Button icon-left="x" @click="showRowEditor = false" size="sm">Close</Button>
            <Button v-if="!readOnlyTable" variant="solid" icon-left="check" @click="showRowEditor = false" size="sm">Done</Button>
          </div>
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model="showRemoveConfirm"
      :options="{
        title: pendingRemoveIndices.length > 1 ? `Remove ${pendingRemoveIndices.length} rows?` : 'Remove row?',
        message: 'This cannot be undone once you save the form.',
        icon: { name: 'alert-triangle', appearance: 'danger' },
        actions: [
          { label: 'Remove', variant: 'solid', theme: 'red', onClick: doRemoveRow },
          { label: 'Cancel' },
        ],
      }"
    />
  </div>
</template>

<style>
[data-dialog='row-editor'].dialog-overlay {
  z-index: 1050;
}
.row-editor-panel {
  width: 100%;
  max-height: 85vh;
}
@media (max-width: 639px), (max-height: 480px) {
  [data-dialog='row-editor'].dialog-overlay > div {
    padding: 0;
  }
  [data-dialog='row-editor'] .dialog-content {
    margin: 0;
    max-width: none;
    width: 100vw;
    height: 100dvh;
    border-radius: 0;
  }
  .row-editor-panel {
    height: 100dvh !important;
    max-height: none;
  }
}
</style>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  Button,
  TextInput,
  FeatherIcon,
  Dialog,
  Dropdown,
  ListView,
  ListHeader,
  ListRows,
  ListRowItem,
  ListGroups,
  ListEmptyState,
  Tooltip,
} from 'frappe-ui'
import DynamicField from '@/components/DynamicField.vue'
import { useMeta, useFormFields } from '@/data/useMeta'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { useColumnPrefs } from '@/composables/useColumnPrefs'
import ColumnPicker from '@/components/ColumnPicker.vue'
import SelectionBar from '@/components/SelectionBar.vue'

const { field, modelValue, doctype, docname, parentValues } = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: Array, default: () => [] },
  doctype: { type: String, default: null },
  docname: { type: String, default: null },
  parentValues: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

const childMetaResource = useMeta(field.options)
const columns = useFormFields(childMetaResource)
const readOnlyTable = computed(() => !!field.read_only)

const defaultSummaryColumns = computed(() => {
  const inListView = columns.value.filter((c) => c.in_list_view)
  return (inListView.length ? inListView : columns.value).slice(0, 3)
})
const columnPrefs = useColumnPrefs({
  storageKey: `annual-budget-childtable-columns-${field.options}`,
  allFields: columns,
  defaultColumns: defaultSummaryColumns,
})
const summaryColumns = columnPrefs.visibleColumns

const listViewColumns = computed(() =>
  summaryColumns.value.map((col) => ({
    key: col.fieldname,
    label: col.label,
    docField: col,
  })),
)
const lastColumnKey = computed(() => listViewColumns.value.at(-1)?.key)

const isMobile = useBreakpoints(breakpointsTailwind).smaller('sm')

const selectedKeys = ref([])
const gridKey = ref(0)
const listViewOptions = computed(() => ({
  selectable: !readOnlyTable.value,
  showTooltip: false,
  onRowClick: (row) => openRow(rows.value.indexOf(row)),
  emptyState: { title: 'No rows yet' },
}))

const TALL_FIELDTYPES = new Set(['Text Editor', 'Small Text', 'Text', 'Long Text', 'Code', 'HTML Editor', 'Attach Image', 'Attach'])
const ROW_HEIGHT_REM = 4.5
const TALL_ROW_HEIGHT_REM = 8
const CHROME_HEIGHT_REM = 9.5
const MIN_PANEL_HEIGHT_REM = 14
const MAX_PANEL_HEIGHT_REM = 42
const editorHeight = computed(() => {
  const fieldsHeight = columns.value.reduce(
    (sum, col) => sum + (TALL_FIELDTYPES.has(col.fieldtype) ? TALL_ROW_HEIGHT_REM : ROW_HEIGHT_REM),
    0,
  )
  const total = Math.min(MAX_PANEL_HEIGHT_REM, Math.max(MIN_PANEL_HEIGHT_REM, fieldsHeight + CHROME_HEIGHT_REM))
  return `${total}rem`
})

const cardTitleColumn = computed(() => summaryColumns.value[0] || null)
const cardBodyColumns = computed(() => summaryColumns.value.slice(1))
function cardTitle(row) {
  const col = cardTitleColumn.value
  if (!col) return 'Row'
  const value = formatValue(row[col.fieldname], col)
  return value === '-' ? `Row ${rows.value.indexOf(row) + 1}` : value
}

let rowKeyCounter = 0
const rows = computed({
  get: () => {
    const list = modelValue || []
    for (const row of list) {
      if (!row.__key) row.__key = row.name || `new-${rowKeyCounter++}`
    }
    return list
  },
  set: (v) => emit('update:modelValue', v),
})

const searchQuery = ref('')
const filteredRows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    summaryColumns.value.some((col) => formatValue(row[col.fieldname], col).toLowerCase().includes(query)),
  )
})

function newRowDefaults() {
  const defaults = {}
  for (const col of columns.value) {
    if (col.default === undefined || col.default === null || col.default === '') continue
    defaults[col.fieldname] = col.fieldtype === 'Check' ? Number(col.default) : col.default
  }
  return defaults
}

function addRow() {
  // Mutate the array in place (it's the same reactive array the parent
  // form owns) rather than reassigning through the computed setter -
  // reassigning round-trips through the parent via emit, and reading
  // rows.value.length right after that in the same tick can still see the
  // pre-update array, opening the editor on the wrong (stale) index.
  const newRow = { ...newRowDefaults(), __key: `new-${rowKeyCounter++}` }
  rows.value.push(newRow)
  openRow(rows.value.indexOf(newRow))
}

const SUMMARY_VALUE_MAX_LENGTH = 60
function formatValue(value, col) {
  if (value == null || value === '') return '-'
  if (col.fieldtype === 'Check') return value ? 'Yes' : 'No'
  const text = String(value)
  return text.length > SUMMARY_VALUE_MAX_LENGTH ? text.slice(0, SUMMARY_VALUE_MAX_LENGTH - 1) + '…' : text
}

const showRowEditor = ref(false)
const editingIdx = ref(null)
const editingRow = computed(() => (editingIdx.value == null ? null : rows.value[editingIdx.value]))

function openRow(idx) {
  editingIdx.value = idx
  showRowEditor.value = true
}

const showRemoveConfirm = ref(false)
const pendingRemoveIndices = ref([])

const allSelected = computed(
  () => filteredRows.value.length > 0 && filteredRows.value.every((r) => selectedKeys.value.includes(r.__key)),
)
const someSelected = computed(() => selectedKeys.value.length > 0 && !allSelected.value)

function toggleSelectAll() {
  selectedKeys.value = allSelected.value ? [] : filteredRows.value.map((r) => r.__key)
}
function toggleSelected(key) {
  selectedKeys.value = selectedKeys.value.includes(key)
    ? selectedKeys.value.filter((k) => k !== key)
    : [...selectedKeys.value, key]
}

const SERVER_ROW_KEYS = ['__key', 'name', 'idx', 'creation', 'modified', 'owner', 'modified_by', 'parent', 'parentfield', 'parenttype', 'docstatus']
function cloneRowValues(source) {
  const copy = { ...source }
  SERVER_ROW_KEYS.forEach((k) => delete copy[k])
  return copy
}

function duplicateSelected() {
  const keys = new Set(selectedKeys.value)
  for (let i = rows.value.length - 1; i >= 0; i--) {
    if (keys.has(rows.value[i].__key)) {
      rows.value.splice(i + 1, 0, { ...cloneRowValues(rows.value[i]), __key: `new-${rowKeyCounter++}` })
    }
  }
  selectedKeys.value = []
}

function confirmRemoveRow(idx) {
  pendingRemoveIndices.value = [idx]
  showRemoveConfirm.value = true
}
function confirmBulkRemove() {
  pendingRemoveIndices.value = selectedKeys.value
    .map((key) => rows.value.findIndex((r) => r.__key === key))
    .filter((idx) => idx !== -1)
  showRemoveConfirm.value = true
}
function doRemoveRow(close) {
  const toRemove = new Set(pendingRemoveIndices.value)
  rows.value = rows.value.filter((_, i) => !toRemove.has(i))
  pendingRemoveIndices.value = []
  selectedKeys.value = []
  gridKey.value++
  close()
}

function insertRowAt(idx, values = null) {
  const row = { ...(values ?? newRowDefaults()), __key: `new-${rowKeyCounter++}` }
  rows.value.splice(idx, 0, row)
  openRow(rows.value.indexOf(row))
}
function duplicateRow(idx) {
  const source = rows.value[idx]
  if (!source) return
  insertRowAt(idx + 1, cloneRowValues(source))
}
function insertRowAbove(idx) {
  insertRowAt(idx)
}
function insertRowBelow(idx) {
  insertRowAt(idx + 1)
}

function rowActions(idx) {
  return [
    {
      group: 'Row',
      items: [
        { label: 'Duplicate', icon: 'copy', onClick: () => duplicateRow(idx) },
        { label: 'Insert Above', icon: 'arrow-up', onClick: () => insertRowAbove(idx) },
        { label: 'Insert Below', icon: 'arrow-down', onClick: () => insertRowBelow(idx) },
      ],
    },
    {
      group: 'Remove',
      items: [{ label: 'Remove', icon: 'trash-2', theme: 'red', onClick: () => confirmRemoveRow(idx) }],
    },
  ]
}
</script>
