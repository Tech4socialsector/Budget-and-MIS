<template>
  <div class="flex items-center gap-2 p-1">
    <FormControl
      type="select"
      class="w-full min-w-0 flex-1 [&_[data-slot=trigger]]:w-full"
      :options="fieldOptions"
      :model-value="modelValue.field"
      @update:model-value="$emit('update:modelValue', { ...modelValue, field: $event })"
    />
    <TabButtons
      :model-value="modelValue.direction"
      :buttons="directionButtons"
      @update:model-value="$emit('update:modelValue', { ...modelValue, direction: $event })"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FormControl, TabButtons } from 'frappe-ui'

const SORTABLE_FIELDTYPES = new Set(['Select', 'Link', 'Check', 'Date', 'Datetime', 'Data', 'Int', 'Float', 'Currency'])

const props = defineProps({
  fields: { type: Array, required: true },
  // { field: fieldname, direction: 'asc' | 'desc' }
  modelValue: { type: Object, required: true },
})
defineEmits(['update:modelValue'])

const fieldOptions = computed(() => {
  const sortable = props.fields.filter((f) => SORTABLE_FIELDTYPES.has(f.fieldtype))
  const options = sortable.map((f) => ({ label: f.label, value: f.fieldname }))
  // "Last Modified" is always a valid frappe.get_list sort field even when
  // it isn't one of this doctype's own declared fields.
  if (!options.some((o) => o.value === 'modified')) {
    options.unshift({ label: 'Last Modified', value: 'modified' })
  }
  return options
})

const directionButtons = [
  { label: 'Ascending', value: 'asc', icon: 'arrow-up', hideLabel: true, tooltip: 'Ascending' },
  { label: 'Descending', value: 'desc', icon: 'arrow-down', hideLabel: true, tooltip: 'Descending' },
]
</script>
