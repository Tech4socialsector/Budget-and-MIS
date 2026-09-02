<!--
  Excel-style column filter dropdown for a data table column - replicates
  erp_actuals.js's open_filter_menu() (search box, Select All, one checkbox
  per DISTINCT value across ALL rows, Clear/Apply buttons), built on top of
  frappe-ui's Popover component (positioning primitive only - all the menu
  content below is custom, matching the Desk page's own hand-rolled menu).

  `modelValue` is either null (no filter active on this column) or a Set of
  the currently-checked values from the LAST APPLY. `distinctValues` must be
  the full list of distinct string values across ALL rows for this column
  (not just currently-filtered-visible rows), so the checkbox list stays
  stable as other columns get filtered - the parent (ErpActuals.vue) is
  responsible for computing that from the unfiltered row set.

  Emits 'apply' with a Set (or null, meaning "clear" - selecting every
  option is treated as equivalent to no filter, matching the Desk page's
  own `if (selected.size === distinct.length) delete active_filters[col]`)
  and 'clear' with no payload.
-->
<template>
  <Popover placement="bottom-start" :popover-class="'w-64 p-0'">
    <template #target="{ togglePopover }">
      <button
        type="button"
        class="erp-filter-icon-btn"
        :class="{ 'is-active': modelValue != null }"
        :aria-label="`Filter ${column}`"
        @click.stop="togglePopover()"
      >
        <FeatherIcon name="chevron-down" class="h-3.5 w-3.5" />
      </button>
    </template>
    <template #body-main="{ close }">
      <div class="flex w-64 flex-col p-2" @keydown.stop>
        <FormControl
          v-model="search"
          type="text"
          placeholder="Search..."
          class="mb-2"
          autofocus
        />
        <label class="mb-1 flex items-center gap-2 border-b border-gray-100 px-1 pb-2 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-300">
          <Checkbox :model-value="selectAllChecked" @update:model-value="onSelectAll" />
          Select All
        </label>
        <div class="max-h-48 overflow-y-auto">
          <label
            v-for="val in filteredValues"
            :key="val"
            class="flex items-center gap-2 rounded px-1 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Checkbox :model-value="checkedSet.has(val)" @update:model-value="(v) => onToggle(val, v)" />
            <span class="truncate italic text-gray-400" v-if="val === ''">(blank)</span>
            <span class="truncate" v-else>{{ val }}</span>
          </label>
          <div v-if="!filteredValues.length" class="px-1 py-2 text-xs text-gray-400">No matches.</div>
        </div>
        <div class="mt-2 flex justify-end gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
          <Button variant="subtle" size="sm" @click="onClear(close)">Clear</Button>
          <Button variant="solid" size="sm" @click="onApply(close)">Apply</Button>
        </div>
      </div>
    </template>
  </Popover>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Popover, FormControl, Checkbox, Button, FeatherIcon } from 'frappe-ui'

const props = defineProps({
  column: { type: String, required: true },
  distinctValues: { type: Array, default: () => [] }, // all distinct values across every row
  modelValue: { type: Object, default: null }, // Set<string> | null
})
const emit = defineEmits(['apply', 'clear'])

const search = ref('')
// Local working set, seeded from modelValue (or "everything checked" when
// no filter is active yet) each time the menu is (re)opened - mirrors the
// Desk page's `const checked = active_filters[col] || new Set(distinct);`.
const checkedSet = ref(new Set(props.modelValue || props.distinctValues))

watch(
  () => props.modelValue,
  (v) => { checkedSet.value = new Set(v || props.distinctValues) },
)
watch(
  () => props.distinctValues,
  (vals) => { if (!props.modelValue) checkedSet.value = new Set(vals) },
)

const filteredValues = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return props.distinctValues
  return props.distinctValues.filter((v) => v.toLowerCase().includes(term))
})

// "Select All" reflects/controls only the currently search-visible rows,
// matching the Desk page's `$options.find('input[type="checkbox"]:visible')`.
const selectAllChecked = computed(() => filteredValues.value.length > 0 && filteredValues.value.every((v) => checkedSet.value.has(v)))

function onSelectAll(checked) {
  const next = new Set(checkedSet.value)
  for (const v of filteredValues.value) {
    if (checked) next.add(v)
    else next.delete(v)
  }
  checkedSet.value = next
}

function onToggle(val, checked) {
  const next = new Set(checkedSet.value)
  if (checked) next.add(val)
  else next.delete(val)
  checkedSet.value = next
}

function onClear(close) {
  search.value = ''
  checkedSet.value = new Set(props.distinctValues)
  emit('clear')
  close()
}

function onApply(close) {
  search.value = ''
  if (checkedSet.value.size === props.distinctValues.length) {
    emit('apply', null)
  } else {
    emit('apply', new Set(checkedSet.value))
  }
  close()
}
</script>

<style scoped>
.erp-filter-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 4px;
  color: #dbeeff;
  cursor: pointer;
}
.erp-filter-icon-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
.erp-filter-icon-btn.is-active {
  color: #ffd54a;
}
</style>
