<template>
  <div>
    <label class="mb-1.5 block text-sm text-ink-gray-6">
      {{ field.label }}<span v-if="field.reqd" class="text-red-500">*</span>
    </label>
    <div class="flex items-center gap-1.5">
      <div class="link-field-combobox min-w-0 flex-1">
        <Combobox
          open-on-focus
          open-on-click
          :options="options"
          :loading="recordsResource.loading"
          :disabled="disabled"
          :placeholder="`Select ${field.label}`"
          :model-value="modelValue"
          @update:model-value="(value) => $emit('update:modelValue', value || null)"
        />
      </div>
      <Tooltip v-if="linkedRoute" text="Open linked record">
        <Button variant="ghost" size="sm" icon="arrow-up-right" @click="openLinkedRecord" />
      </Tooltip>
    </div>
    <p v-if="field.description" class="mt-1.5 text-xs text-ink-gray-5">{{ field.description }}</p>

    <Dialog v-model="showCreateDialog" :options="{ size: 'lg', title: `New ${field.options}` }">
      <template #body-content>
        <div class="flex flex-col gap-4">
          <DynamicField
            v-for="createField in createFields"
            :key="createField.fieldname"
            :field="createField"
            :doctype="field.options"
            v-model="newRecordValues[createField.fieldname]"
          />
          <ErrorMessage :message="createError" />
        </div>
      </template>
      <template #actions>
        <Button variant="solid" :loading="creating" @click="submitNewRecord">Create</Button>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Combobox's own trigger doesn't fill this field on its own without an
explicit width down the whole chain - without this every Link field's
dropdown rendered at a different width per its own label/value text
length instead of filling its column like every other field type. */
.link-field-combobox :deep(> div) {
  display: block;
  width: 100%;
}
.link-field-combobox :deep([data-slot='trigger']) {
  width: 100%;
}
</style>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Combobox, Dialog, Button, ErrorMessage, Tooltip, call, useCall, toast } from 'frappe-ui'
import { findModuleByDoctype } from '@/data/modules'
import DynamicField from '@/components/DynamicField.vue'

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { default: null },
  // Extra Frappe filters applied server-side (e.g. a cascading filter) - a
  // plain object of {fieldname: value}, ANDed together.
  filters: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

// The linked doctype's own title_field (if set) is what a user actually
// recognizes a record by - falling back to `name` (Frappe's own default
// display rule) when the doctype doesn't define one.
const metaResource = useCall({
  url: `/api/v2/doctype/${props.field.options}/meta`,
  method: 'GET',
  cacheKey: `annual-budget-meta-${props.field.options}`,
})
const titleField = computed(() => metaResource.data?.title_field || 'name')

const recordsResource = useCall({
  url: computed(() => `/api/v2/document/${props.field.options}`),
  method: 'GET',
  params: () => ({
    fields: JSON.stringify(['name', titleField.value]),
    filters: JSON.stringify(props.filters),
    limit: 1000,
  }),
  immediate: false,
})

watch(
  () => [props.field.options, JSON.stringify(props.filters), !!metaResource.data],
  () => {
    if (props.field.options && metaResource.data) recordsResource.fetch()
  },
  { immediate: true },
)

const createPermissionResource = useCall({
  url: '/api/v2/method/frappe.client.has_permission',
  method: 'GET',
  params: () => ({ doctype: props.field.options, docname: '', perm_type: 'create' }),
  immediate: false,
  transform: (data) => data?.has_permission,
})
watch(
  () => props.field.options,
  (doctype) => {
    if (doctype) createPermissionResource.fetch()
  },
  { immediate: true },
)
const canCreate = computed(() => !!createPermissionResource.data)

const options = computed(() => {
  const rows = recordsResource.data || []
  const opts = rows.map((r) => ({ label: r[titleField.value] || r.name, value: String(r.name) }))
  opts.unshift({ label: 'Select option', value: '' })
  if (canCreate.value) {
    opts.push({
      type: 'custom',
      key: '__create__',
      label: `+ Create New ${props.field.label}`,
      condition: () => true,
      onClick: openCreateDialog,
    })
  }
  return opts
})

// Frappe desk's Link field always shows an arrow to open the linked record
// directly - this app's generic /:doctypeRoute/:name route can only
// resolve a doctype that's actually registered as a module item, so the
// icon only appears when that's true rather than linking somewhere that
// doesn't resolve.
const router = useRouter()
const linkedModuleItem = computed(() => findModuleByDoctype(props.field.options))
const linkedRoute = computed(() => (props.modelValue && linkedModuleItem.value ? linkedModuleItem.value.route : null))

function openLinkedRecord() {
  if (!linkedRoute.value) return
  router.push({ name: 'DoctypeForm', params: { doctypeRoute: linkedRoute.value, name: props.modelValue } })
}

// --- Quick create ------------------------------------------------------
// A lightweight version of DoctypeForm.vue's own new-record form, scoped to
// just the linked doctype's required fields - staying inside the flow of
// filling out *this* field rather than leaving for its full form.
const showCreateDialog = ref(false)
const newRecordValues = reactive({})
const creating = ref(false)
const createError = ref(null)

const SKIP_FIELDTYPES = new Set(['Section Break', 'Column Break', 'Tab Break', 'HTML', 'Heading', 'Button'])
const createFields = computed(() => {
  const metaFields = metaResource.data?.fields || []
  return metaFields.filter((f) => f.reqd && !SKIP_FIELDTYPES.has(f.fieldtype) && f.fieldtype !== 'Table')
})

function openCreateDialog() {
  if (linkedModuleItem.value) {
    router.push({ name: 'DoctypeNew', params: { doctypeRoute: linkedModuleItem.value.route } })
    return
  }
  for (const key of Object.keys(newRecordValues)) delete newRecordValues[key]
  createError.value = null
  showCreateDialog.value = true
}

async function submitNewRecord() {
  creating.value = true
  createError.value = null
  try {
    const created = await call('frappe.client.insert', { doc: { doctype: props.field.options, ...newRecordValues } })
    toast.success(`${props.field.options} created`)
    showCreateDialog.value = false
    recordsResource.fetch()
    emit('update:modelValue', String(created.name))
  } catch (e) {
    createError.value = e
  } finally {
    creating.value = false
  }
}
</script>
