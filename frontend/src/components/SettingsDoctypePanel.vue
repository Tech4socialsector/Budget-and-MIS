<template>
  <div class="flex flex-col gap-5">
    <ErrorMessage v-if="metaResource.error" :message="metaResource.error" />
    <div v-else-if="metaResource.loading && !metaResource.data" class="flex flex-col gap-3">
      <Skeleton v-for="i in 6" :key="i" height="2.5rem" />
    </div>
    <div v-else-if="doc.loading && !doc.doc" class="flex flex-col gap-3">
      <Skeleton v-for="i in 6" :key="i" height="2.5rem" />
    </div>

    <template v-else>
      <div v-for="section in sections" :key="section.label || 'default'" class="flex flex-col gap-3">
        <div v-if="section.label" class="border-t pt-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {{ section.label }}
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div v-for="field in section.fields" :key="field.fieldname" :class="{ 'sm:col-span-2': isWideField(field) }">
            <DynamicField :field="field" :doctype="doctype" :docname="doctype" v-model="values[field.fieldname]" />
          </div>
        </div>
      </div>

      <ErrorMessage :message="saveError" />

      <div class="flex justify-end">
        <Button variant="solid" :loading="saving" @click="save">Save</Button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Button, ErrorMessage, toast, useDoc } from 'frappe-ui'
import Skeleton from '@/components/Skeleton.vue'
import DynamicField from '@/components/DynamicField.vue'
import { useMeta } from '@/data/useMeta'

const props = defineProps({
  // A Single doctype's `name` IS the doctype name itself (Frappe
  // convention), so this one prop is all useDoc needs.
  doctype: { type: String, required: true },
})

const metaResource = useMeta(props.doctype)
const doc = useDoc({ doctype: props.doctype, name: props.doctype })

const SKIP_FIELDTYPES = new Set(['Column Break', 'Tab Break', 'HTML', 'Heading', 'Button'])
function isDisplayField(field) {
  return !SKIP_FIELDTYPES.has(field.fieldtype) && field.fieldtype !== 'Section Break' && !field.hidden
}

const WIDE_FIELDTYPES = new Set(['Small Text', 'Long Text', 'Text Editor', 'Code', 'Attach', 'Attach Image'])
function isWideField(field) {
  return WIDE_FIELDTYPES.has(field.fieldtype)
}

// Groups the doctype's own field_order into sections by each Section
// Break's label, mirroring how Desk itself lays the form out - so this
// generic panel doesn't flatten a doctype's structure (e.g. Master
// Settings' Branding / Financial Year / Help & Support / AI Assistant
// groupings) into one undifferentiated wall of fields.
const sections = computed(() => {
  const allFields = metaResource.data?.fields || []
  const groups = []
  let current = { label: '', fields: [] }
  for (const field of allFields) {
    if (field.fieldtype === 'Section Break') {
      if (current.fields.length) groups.push(current)
      current = { label: field.label || '', fields: [] }
      continue
    }
    if (isDisplayField(field) && field.fieldtype !== 'Table') {
      current.fields.push(field)
    }
  }
  if (current.fields.length) groups.push(current)
  return groups
})

const values = reactive({})

watch(
  () => doc.doc,
  (d) => {
    if (!d) return
    Object.keys(d).forEach((k) => { values[k] = d[k] })
  },
  { immediate: true, deep: true },
)

const saving = ref(false)
const saveError = ref(null)

async function save() {
  saving.value = true
  saveError.value = null
  try {
    await doc.setValue.submit(values)
    toast.success('Saved')
  } catch (e) {
    saveError.value = e
  } finally {
    saving.value = false
  }
}
</script>
