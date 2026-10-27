<template>
  <div class="flex flex-col">
    <div class="min-h-0 flex-1 space-y-2 overflow-y-auto">
      <div
        v-for="row in rows"
        :key="row.id"
        class="flex items-center gap-2 rounded-lg bg-surface-gray-1 p-2"
      >
        <FormControl
          type="select"
          class="w-0 min-w-0 flex-[1.3] [&_[data-slot=trigger]]:w-full [&_[data-slot=trigger]_span]:truncate"
          :options="fieldOptions"
          :model-value="row.fieldname"
          @update:model-value="setField(row, $event)"
        />
        <FormControl
          type="select"
          class="w-24 flex-shrink-0 [&_[data-slot=trigger]]:w-full [&_[data-slot=trigger]_span]:truncate"
          :options="operatorOptions(row)"
          :model-value="row.operator"
          @update:model-value="setOperator(row, $event)"
        />
        <FormControl
          v-if="fieldFor(row.fieldname)?.fieldtype === 'Check'"
          type="select"
          class="w-0 min-w-0 flex-[1.3] [&_[data-slot=trigger]]:w-full [&_[data-slot=trigger]_span]:truncate"
          :options="[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }]"
          v-model="row.value"
        />
        <FormControl
          v-else-if="fieldFor(row.fieldname)?.fieldtype === 'Select'"
          type="select"
          class="w-0 min-w-0 flex-[1.3] [&_[data-slot=trigger]]:w-full [&_[data-slot=trigger]_span]:truncate"
          :options="valueOptionsFor(row)"
          v-model="row.value"
        />
        <DatePicker
          v-else-if="fieldFor(row.fieldname)?.fieldtype === 'Date' || fieldFor(row.fieldname)?.fieldtype === 'Datetime'"
          class="w-0 min-w-0 flex-[1.3]"
          format="DD MMM YYYY"
          v-model="row.value"
        />
        <FormControl
          v-else
          type="text"
          class="w-0 min-w-0 flex-[1.3]"
          placeholder="Value"
          v-model="row.value"
        />
        <Button variant="ghost" size="sm" icon="x" tooltip="Remove this filter" @click="removeRow(row.id)" />
      </div>

      <div v-if="rows.length === 0" class="px-1 py-2 text-sm text-ink-gray-5">
        No filters applied.
      </div>
    </div>

    <Button class="mt-3" variant="subtle" icon-left="plus" @click="addRow">Add a Filter</Button>

    <div class="mt-4 flex flex-shrink-0 justify-end gap-2 border-t pt-3 dark:border-gray-800">
      <Button icon-left="rotate-ccw" v-if="rows.length" @click="clearAll">Clear Filters</Button>
      <Button icon-left="check" variant="solid" @click="apply">Apply Filters</Button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Button, FormControl, DatePicker } from 'frappe-ui'

// A row-based field/operator/value filter editor - one row per filter,
// AND'd together, matching Frappe desk's own list-view filter UX (field
// dropdown + operator dropdown + value) instead of one always-visible box
// per filterable field. Used both from a desktop Popover and a mobile
// bottom sheet (see DoctypeList.vue) so the filter-building UI and its
// underlying frappe.get_list filter shape stay identical between them -
// only the container chrome differs.
const props = defineProps({
  // Every field on the doctype a filter could reasonably target - "+ Add a
  // Filter" lets a user pick any field explicitly, the same way desk's own
  // filter picker isn't limited to a preconfigured subset.
  fields: { type: Array, required: true },
  // { fieldname: filterValue } - filterValue is a Frappe filter operand,
  // e.g. ['like', '%x%'] or a plain scalar.
  modelValue: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

const FILTERABLE_FIELDTYPES = new Set(['Select', 'Link', 'Check', 'Date', 'Datetime', 'Data', 'Int', 'Float', 'Currency'])

const filterableFields = computed(() => props.fields.filter((f) => FILTERABLE_FIELDTYPES.has(f.fieldtype)))

const fieldOptions = computed(() => filterableFields.value.map((f) => ({ label: f.label, value: f.fieldname })))

function fieldFor(fieldname) {
  return filterableFields.value.find((f) => f.fieldname === fieldname)
}

const OPERATORS_BY_TYPE = {
  Select: [{ label: 'Equals', value: '=' }],
  Link: [{ label: 'Equals', value: '=' }],
  Check: [{ label: 'Equals', value: '=' }],
  Date: [{ label: 'Equals', value: '=' }, { label: 'Before', value: '<' }, { label: 'After', value: '>' }],
  Datetime: [{ label: 'Equals', value: '=' }, { label: 'Before', value: '<' }, { label: 'After', value: '>' }],
  Data: [{ label: 'Equals', value: '=' }, { label: 'Like', value: 'like' }],
  Int: [{ label: 'Equals', value: '=' }, { label: '>', value: '>' }, { label: '<', value: '<' }],
  Float: [{ label: 'Equals', value: '=' }, { label: '>', value: '>' }, { label: '<', value: '<' }],
  Currency: [{ label: 'Equals', value: '=' }, { label: '>', value: '>' }, { label: '<', value: '<' }],
}
const DEFAULT_OPERATORS = [{ label: 'Equals', value: '=' }]

function operatorOptions(row) {
  const field = fieldFor(row.fieldname)
  return (field && OPERATORS_BY_TYPE[field.fieldtype]) || DEFAULT_OPERATORS
}

function valueOptionsFor(row) {
  const field = fieldFor(row.fieldname)
  if (field?.fieldtype !== 'Select') return []
  return (field.options || '')
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => ({ label: v, value: v }))
}

let nextId = 0
function newRow(fieldname, operator, value) {
  return { id: nextId++, fieldname, operator, value }
}

const rows = ref([])

// Rebuild the row list from modelValue - only when it actually differs
// from what these rows would themselves produce, so typing into a value
// input doesn't get clobbered by the round-trip through the parent's
// v-model on every keystroke.
function rowsToFilters(list) {
  const result = {}
  for (const row of list) {
    if (row.value == null || row.value === '') continue
    if (row.operator === 'like') {
      result[row.fieldname] = ['like', `%${row.value}%`]
    } else {
      result[row.fieldname] = row.operator === '=' ? row.value : [row.operator, row.value]
    }
  }
  return result
}

function filtersToRows(filters) {
  return Object.entries(filters || {}).map(([fieldname, value]) => {
    if (Array.isArray(value)) {
      const [op, val] = value
      if (op === 'like') return newRow(fieldname, 'like', String(val).replace(/^%|%$/g, ''))
      return newRow(fieldname, op, val)
    }
    return newRow(fieldname, '=', value)
  })
}

watch(
  () => props.modelValue,
  (value) => {
    const current = JSON.stringify(rowsToFilters(rows.value))
    const incoming = JSON.stringify(value || {})
    if (current !== incoming) rows.value = filtersToRows(value)
  },
  { immediate: true, deep: true },
)

function setField(row, fieldname) {
  row.fieldname = fieldname
  const field = fieldFor(fieldname)
  const validOps = (field && OPERATORS_BY_TYPE[field.fieldtype]) || DEFAULT_OPERATORS
  if (!validOps.some((o) => o.value === row.operator)) row.operator = validOps[0].value
  row.value = ''
}

function setOperator(row, operator) {
  row.operator = operator
  row.value = ''
}

function addRow() {
  const first = filterableFields.value[0]
  if (!first) return
  const operator = operatorOptions({ fieldname: first.fieldname })[0].value
  rows.value.push(newRow(first.fieldname, operator, ''))
}

function removeRow(id) {
  rows.value = rows.value.filter((r) => r.id !== id)
}

function clearAll() {
  rows.value = []
  emit('update:modelValue', {})
}

function apply() {
  emit('update:modelValue', rowsToFilters(rows.value))
}
</script>
