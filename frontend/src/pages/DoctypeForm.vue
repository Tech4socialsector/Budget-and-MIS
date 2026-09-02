<template>
  <AppLayout>
    <PageHeader>
      <template #title>
        <Button variant="solid" size="sm" @click="goBack">
          <template #prefix>
            <FeatherIcon name="arrow-left" class="h-4 w-4" />
          </template>
          Back
        </Button>
      </template>
      <template #actions>
        <Button variant="solid" :loading="saving" @click="save">Save</Button>
      </template>
    </PageHeader>

    <ErrorMessage v-if="metaResource.error" :message="metaResource.error" />

    <div v-else-if="metaResource.loading && !metaResource.data" class="flex flex-col gap-3">
      <Skeleton v-for="i in 6" :key="i" height="2.5rem" />
    </div>

    <div v-else-if="!isNew && existingDoc.loading && !existingDoc.doc" class="flex flex-col gap-3">
      <Skeleton v-for="i in 6" :key="i" height="2.5rem" />
    </div>

    <template v-else>
      <div class="flex flex-col gap-4 sm:block sm:columns-2 sm:gap-x-6 sm:space-y-4">
        <div
          v-for="field in fields"
          :key="field.fieldname"
          class="break-inside-avoid"
          :class="{ 'sm:[column-span:all]': isWideField(field) }"
        >
          <DynamicField
            :field="field"
            :doctype="doctype"
            :docname="isNew ? null : name"
            v-model="values[field.fieldname]"
          />
        </div>
      </div>

      <div v-for="field in tableFields" :key="field.fieldname" class="mt-6">
        <ChildTable :field="field" v-model="values[field.fieldname]" />
      </div>

      <ErrorMessage class="mt-4" :message="saveError" />
    </template>
  </AppLayout>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { onKeyStroke } from '@vueuse/core'
import { useDoc, useNewDoc, Button, ErrorMessage, FeatherIcon, toast } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import Skeleton from '@/components/Skeleton.vue'
import DynamicField from '@/components/DynamicField.vue'
import ChildTable from '@/components/ChildTable.vue'
import { useMeta, useFormFields, useTableFields } from '@/data/useMeta'
import { setPageTitle } from '@/data/pageTitle'

const props = defineProps({
  doctype: { type: String, required: true },
  isNew: { type: Boolean, default: false },
  name: { type: String, default: null },
})

const route = useRoute()
const router = useRouter()

const metaResource = useMeta(props.doctype)
const fields = useFormFields(metaResource)
const tableFields = useTableFields(metaResource)

setPageTitle(props.isNew ? `New ${props.doctype}` : `${props.doctype}: ${props.name}`)

const newDoc = props.isNew ? useNewDoc(props.doctype) : null
const existingDoc = props.isNew ? null : useDoc({ doctype: props.doctype, name: props.name })

const values = reactive({})

watch(
  () => (props.isNew ? newDoc?.doc : existingDoc?.doc),
  (doc) => {
    if (!doc) return
    Object.keys(doc).forEach((k) => { values[k] = doc[k] })
  },
  { immediate: true, deep: true },
)

const WIDE_FIELDTYPES = new Set([
  'Small Text', 'Long Text', 'Text Editor', 'Code', 'Attach', 'Attach Image',
])
function isWideField(field) {
  return WIDE_FIELDTYPES.has(field.fieldtype)
}

const saving = ref(false)
const saveError = ref(null)

async function save() {
  saving.value = true
  saveError.value = null
  try {
    if (props.isNew) {
      Object.assign(newDoc.doc, values)
      const created = await newDoc.submit()
      toast.success('Created')
      router.replace({ name: 'DoctypeForm', params: { doctypeRoute: route.params.doctypeRoute, name: created.name } })
    } else {
      await existingDoc.setValue.submit(values)
      toast.success('Saved')
    }
  } catch (e) {
    saveError.value = e
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push({ name: 'DoctypeList', params: { doctypeRoute: route.params.doctypeRoute } })
}

onKeyStroke((e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    save()
  }
})
</script>
