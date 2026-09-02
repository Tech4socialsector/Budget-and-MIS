<template>
  <div v-if="controlType === 'attach'">
    <label class="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">{{ field.label }}</label>
    <div v-if="modelValue" class="flex items-center gap-2 rounded-lg border border-gray-200 p-2 text-sm dark:border-gray-800">
      <img v-if="field.fieldtype === 'Attach Image'" :src="modelValue" class="h-10 w-10 rounded object-cover" />
      <FeatherIcon v-else name="paperclip" class="h-4 w-4 text-gray-400" />
      <a :href="modelValue" target="_blank" class="min-w-0 flex-1 truncate text-blue-600 hover:underline dark:text-blue-400">{{ modelValue }}</a>
      <button type="button" class="text-gray-400 hover:text-gray-600" @click="$emit('update:modelValue', '')">
        <FeatherIcon name="x" class="h-4 w-4" />
      </button>
    </div>
    <FileUploader
      v-else
      :upload-args="{ doctype, docname, private: false }"
      @success="(file) => $emit('update:modelValue', file.file_url)"
    >
      <template #default="{ openFileSelector, uploading, progress }">
        <Button variant="outline" :loading="uploading" @click="openFileSelector">
          {{ uploading ? `Uploading ${progress}%` : 'Attach file' }}
        </Button>
      </template>
    </FileUploader>
  </div>

  <FormControl
    v-else-if="controlType === 'select'"
    type="select"
    :label="field.label"
    :options="selectOptions"
    :model-value="modelValue"
    :required="!!field.reqd"
    @update:model-value="$emit('update:modelValue', $event)"
  />

  <FormControl
    v-else-if="controlType === 'checkbox'"
    type="checkbox"
    :label="field.label"
    :model-value="!!modelValue"
    @update:model-value="$emit('update:modelValue', $event ? 1 : 0)"
  />

  <FormControl
    v-else-if="controlType === 'textarea'"
    type="textarea"
    :label="field.label"
    :model-value="modelValue"
    :required="!!field.reqd"
    @update:model-value="$emit('update:modelValue', $event)"
  />

  <FormControl
    v-else
    :type="controlType"
    :label="field.label"
    :model-value="modelValue"
    :required="!!field.reqd"
    :description="linkDescription"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from 'vue'
import { FormControl, FeatherIcon, FileUploader, Button } from 'frappe-ui'

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { default: null },
  doctype: { type: String, default: null },
  docname: { type: String, default: null },
})
defineEmits(['update:modelValue'])

const controlType = computed(() => {
  switch (props.field.fieldtype) {
    case 'Select':
      return 'select'
    case 'Check':
      return 'checkbox'
    case 'Text':
    case 'Small Text':
    case 'Long Text':
    case 'Text Editor':
    case 'Code':
      return 'textarea'
    case 'Int':
    case 'Float':
    case 'Currency':
    case 'Percent':
      return 'number'
    case 'Date':
      return 'date'
    case 'Datetime':
      return 'datetime-local'
    case 'Password':
      return 'password'
    case 'Attach':
    case 'Attach Image':
      return 'attach'
    default:
      return 'text'
  }
})

const selectOptions = computed(() =>
  (props.field.options || '')
    .split('\n')
    .map((o) => o.trim())
    .filter(Boolean),
)

// Link fields render as plain text (no search-as-you-type widget yet) -
// the description hint at least tells the user what doctype's `name`
// value is expected here.
const linkDescription = computed(() => {
  if (props.field.fieldtype === 'Link' && props.field.options) {
    return `Links to ${props.field.options}`
  }
  return props.field.description || ''
})
</script>
