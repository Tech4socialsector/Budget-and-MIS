<template>
<template v-if="isVisible">
  <div v-if="controlType === 'attach'">
    <label class="mb-1.5 block text-sm text-ink-gray-6">{{ field.label }}</label>
    <div v-if="modelValue" class="flex items-center gap-2 rounded-lg border border-outline-gray-2 p-2 text-sm">
      <img v-if="field.fieldtype === 'Attach Image'" :src="modelValue" class="h-10 w-10 rounded object-cover" />
      <FeatherIcon v-else name="paperclip" class="h-4 w-4 text-ink-gray-4" />
      <a :href="modelValue" target="_blank" rel="noopener" class="min-w-0 flex-1 truncate text-blue-600 hover:underline dark:text-blue-400">{{ modelValue }}</a>
      <button type="button" class="text-ink-gray-4 hover:text-ink-gray-7" :disabled="isReadOnly" @click="$emit('update:modelValue', '')">
        <FeatherIcon name="x" class="h-4 w-4" />
      </button>
    </div>
    <FileUploader
      v-else
      :upload-args="{ doctype, docname, private: false }"
      @success="(file) => $emit('update:modelValue', file.file_url)"
    >
      <template #default="{ openFileSelector, uploading, progress }">
        <Button variant="outline" :loading="uploading" :disabled="isReadOnly" @click="openFileSelector">
          {{ uploading ? `Uploading ${progress}%` : 'Attach file' }}
        </Button>
      </template>
    </FileUploader>
    <p v-if="field.description" class="mt-1.5 whitespace-pre-line text-xs text-ink-gray-5">{{ field.description }}</p>
  </div>

  <LinkField
    v-else-if="controlType === 'dynamic-link'"
    :field="dynamicLinkField"
    :disabled="isReadOnly || !dynamicLinkDoctype"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  />

  <LinkField
    v-else-if="controlType === 'link'"
    :field="field"
    :filters="linkFilters"
    :disabled="isReadOnly"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  />

  <FormControl
    v-else-if="controlType === 'select'"
    type="select"
    class="[&_[data-slot=trigger]]:w-full"
    :label="field.label"
    :required="!!isRequired"
    :disabled="isReadOnly"
    :options="selectOptions"
    :description="field.description"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  />

  <FormControl
    v-else-if="controlType === 'checkbox'"
    type="checkbox"
    :label="field.label"
    :disabled="isReadOnly"
    :description="field.description"
    :model-value="!!modelValue"
    @update:model-value="$emit('update:modelValue', $event ? 1 : 0)"
  />

  <div v-else-if="controlType === 'textarea'">
    <FormControl
      type="textarea"
      :label="field.label"
      :required="!!isRequired"
      :disabled="isReadOnly"
      :description="field.description"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>

  <div v-else-if="controlType === 'json'">
    <FormControl
      type="textarea"
      class="font-mono text-xs"
      :label="field.label"
      :required="!!isRequired"
      :disabled="isReadOnly"
      :description="jsonError || field.description"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>

  <div v-else-if="controlType === 'date' || controlType === 'datetime-local'">
    <label class="mb-1.5 block text-sm text-ink-gray-6">
      {{ field.label }}<span v-if="isRequired" class="text-red-500">*</span>
    </label>
    <component
      :is="controlType === 'date' ? DatePicker : DateTimePicker"
      :format="controlType === 'date' ? 'DD MMM YYYY' : undefined"
      :disabled="isReadOnly"
      :model-value="modelValue || ''"
      placeholder="Select date"
      @update:model-value="$emit('update:modelValue', $event || null)"
    />
    <p v-if="field.description" class="mt-1.5 whitespace-pre-line text-xs text-ink-gray-5">{{ field.description }}</p>
  </div>

  <FormControl
    v-else
    :type="controlType"
    :label="field.label"
    :required="!!isRequired"
    :disabled="isReadOnly"
    :description="linkDescription"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
</template>

<script setup>
import { computed } from 'vue'
import { FormControl, FileUploader, Button, FeatherIcon, DatePicker, DateTimePicker } from 'frappe-ui'
import LinkField from '@/components/LinkField.vue'
import { evaluateDependsOn } from '@/utils/dependsOn'

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { default: null },
  doctype: { type: String, default: null },
  docname: { type: String, default: null },
  // The other field values on the same document/row - only needed to
  // resolve a Link field's own link_filters (e.g. a cascading filter
  // referencing a sibling field) and this field's own depends_on. Callers
  // that render a full form/row (DoctypeForm, ChildTable) pass their own
  // `values`/`editingRow`; nothing else in this component reads it.
  siblingValues: { type: Object, default: () => ({}) },
  readOnly: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])

const isVisible = computed(() => evaluateDependsOn(props.field.depends_on, props.siblingValues))
const isRequired = computed(
  () =>
    !!props.field.reqd ||
    (!!props.field.mandatory_depends_on && evaluateDependsOn(props.field.mandatory_depends_on, props.siblingValues)),
)
const isReadOnly = computed(() => !!props.field.read_only || props.readOnly)

const controlType = computed(() => {
  switch (props.field.fieldtype) {
    case 'Select':
      return 'select'
    case 'Check':
      return 'checkbox'
    case 'Small Text':
    case 'Text':
    case 'Long Text':
    case 'Text Editor':
    case 'Code':
    case 'Markdown Editor':
    case 'HTML Editor':
      return 'textarea'
    case 'Int':
    case 'Long Int':
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
    case 'Phone':
      return 'tel'
    case 'Attach':
    case 'Attach Image':
      return 'attach'
    case 'Link':
      return 'link'
    case 'Dynamic Link':
      return 'dynamic-link'
    case 'JSON':
      return 'json'
    default:
      return 'text'
  }
})

const selectOptions = computed(() => {
  const opts = (props.field.options || '')
    .split('\n')
    .map((o) => o.trim())
    .filter(Boolean)
    .map((o) => ({ label: o, value: o }))
  opts.unshift({ label: 'Select option', value: '' })
  return opts
})

const jsonError = computed(() => {
  const value = props.modelValue
  if (!value) return ''
  try {
    JSON.parse(value)
    return ''
  } catch (e) {
    return `Invalid JSON: ${e.message}`
  }
})

// Dynamic Link's `options` isn't a doctype name (unlike a plain Link) - it
// names another field on this same document that itself holds the target
// doctype. Resolved from siblingValues and handed to LinkField as a
// synthetic field object with that resolved doctype as its `options`.
const dynamicLinkDoctype = computed(() => props.siblingValues[props.field.options])
const dynamicLinkField = computed(() => ({ ...props.field, options: dynamicLinkDoctype.value }))

// link_filters is Frappe's own standard DocField property (set via the
// DocType editor's "Filters" UI on a Link field) - a JSON string of
// [linkDoctype, fieldname, operator, value] tuples, where `value` can be
// "eval:doc.<fieldname>" to reference a sibling field on the same
// document/row.
const linkFilters = computed(() => {
  if (!props.field.link_filters) return {}
  let tuples
  try {
    tuples = JSON.parse(props.field.link_filters)
  } catch {
    return {}
  }
  const result = {}
  for (const [, fieldname, operator, rawValue] of tuples) {
    let value = rawValue
    if (typeof value === 'string' && value.startsWith('eval:doc.')) {
      value = props.siblingValues[value.slice('eval:doc.'.length)]
    }
    result[fieldname] = operator === '=' ? value : [operator, value]
  }
  return result
})

const linkDescription = computed(() => {
  if (props.field.description) return props.field.description
  if (props.field.fieldtype === 'Link' && props.field.options) {
    return `Links to ${props.field.options}`
  }
  return undefined
})
</script>
