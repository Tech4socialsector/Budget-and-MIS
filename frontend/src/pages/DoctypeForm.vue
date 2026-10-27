<template>
  <AppLayout>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-2">
          <Button variant="ghost" @click="goBack">
            <template #prefix><FeatherIcon name="arrow-left" class="h-4 w-4" /></template>
            Back
          </Button>
          <Button
            v-if="!isNew && name"
            variant="subtle"
            size="sm"
            icon-right="copy"
            class="font-mono"
            tooltip="Copy record ID"
            @click="copyRecordId"
          >
            {{ name }}
          </Button>
          <span v-else-if="isNew" class="rounded-md bg-surface-gray-2 px-2 py-0.5 text-xs text-ink-gray-5">New</span>
          <span v-if="isDirty" class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            Not Saved
          </span>
        </div>
      </template>
      <template #actions>
        <Button
          v-if="!isNew && !loadError && canDelete"
          variant="subtle"
          theme="red"
          :loading="deleting"
          aria-label="Delete"
          @click="showDeleteConfirm = true"
        >
          <template #prefix><FeatherIcon name="trash-2" class="h-4 w-4" /></template>
          <span class="max-sm:hidden">Delete</span>
        </Button>
        <Button v-if="!loadError" variant="solid" :loading="saving" aria-label="Save" @click="save">
          <template #prefix><FeatherIcon name="save" class="h-4 w-4" /></template>
          <span class="max-sm:hidden">Save</span>
        </Button>
      </template>
    </PageHeader>

    <Dialog v-model="showDeleteConfirm" :options="{ title: 'Delete this record?', size: 'sm' }">
      <template #body-content>
        <p class="text-sm text-ink-gray-6">This permanently deletes {{ name }}. This cannot be undone.</p>
        <ErrorMessage class="mt-3" :message="deleteError" />
        <div class="mt-4 flex justify-end gap-2">
          <Button icon-left="x" @click="showDeleteConfirm = false" size="sm">Close</Button>
          <Button icon-left="trash-2" variant="solid" theme="red" :loading="deleting" @click="confirmDelete" size="sm">Delete</Button>
        </div>
      </template>
    </Dialog>

    <div v-if="metaResource.loading && !metaResource.data" class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      <div v-for="i in 6" :key="i" class="space-y-1.5">
        <Skeleton width="30%" height="0.75rem" />
        <Skeleton height="2.25rem" />
      </div>
    </div>
    <ErrorMessage v-else-if="loadError" :message="loadError" />

    <div v-else-if="!isNew && existingDoc?.loading && !existingDoc?.doc" class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      <div v-for="i in 6" :key="i" class="space-y-1.5">
        <Skeleton width="30%" height="0.75rem" />
        <Skeleton height="2.25rem" />
      </div>
    </div>

    <form v-else @submit.prevent="save">
      <!-- Doctypes with more than one Tab Break get an actual tab switcher
      instead of every field flattening into one long scroll - desktop-only
      (hidden by default, sm:flex): mobile gets an accordion instead, right
      below, since a horizontal tab bar squeezed onto a phone-width screen
      either wraps awkwardly or needs its own scroll. -->
      <div v-if="tabs.length > 1" class="mb-4 hidden gap-1 border-b sm:flex dark:border-gray-800">
        <button
          v-for="(tab, idx) in tabs"
          :key="idx"
          type="button"
          class="border-b-2 px-3 py-2 text-base font-medium"
          :class="idx === activeTabIdx
            ? 'border-ink-gray-9 text-ink-gray-9'
            : 'border-transparent text-ink-gray-5 hover:text-ink-gray-7'"
          @click="activeTabIdx = idx"
        >
          {{ tab.label || 'Details' }}
        </button>
      </div>

      <!-- Renders in the doctype's own field_order, the same way Frappe
      desk does: each Section Break starts a fresh block of 1-2 columns
      (however many Column Breaks it declares), and fields fill down each
      column top-to-bottom in declaration order. Every field control is a
      fixed height (see FormTabSections.vue) so fields line up evenly
      whichever column they land in. Hidden on mobile when there's more
      than one tab - the accordion below covers that case there instead. -->
      <FormTabSections
        v-if="tabs.length <= 1"
        :sections="activeTabSections"
        :doctype="doctype"
        :name="name"
        :is-new="isNew"
        v-model:new-doc-name="newDocName"
        :values="values"
        :show-name-field="isPromptNamed"
      />
      <div v-else class="hidden sm:block">
        <template v-for="(segment, si) in tabSegments(tabs[activeTabIdx])" :key="si">
          <FormTabSections
            v-if="segment.sections.length"
            :sections="segment.sections"
            :doctype="doctype"
            :name="name"
            :is-new="isNew"
            v-model:new-doc-name="newDocName"
            :values="values"
            :show-name-field="activeTabIdx === 0 && si === 0 && isPromptNamed"
          />
          <div v-if="segment.tables.length" class="my-6 space-y-6">
            <ChildTable v-for="field in segment.tables" :key="field.fieldname" :field="field" :parent-values="values" v-model="values[field.fieldname]" />
          </div>
        </template>
      </div>

      <!-- Mobile accordion (sm:hidden): every tab renders as its own
      collapsible header instead of only the active one. -->
      <div v-if="tabs.length > 1" class="space-y-3 sm:hidden">
        <div v-for="(tab, idx) in tabs" :key="idx" class="rounded-lg border dark:border-gray-800">
          <button
            type="button"
            class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink-gray-9"
            @click="expandedMobileTabs[idx] = !expandedMobileTabs[idx]"
          >
            {{ tab.label || 'Details' }}
            <FeatherIcon :name="expandedMobileTabs[idx] ? 'chevron-up' : 'chevron-down'" class="h-4 w-4 flex-shrink-0 text-ink-gray-4" />
          </button>
          <div v-if="expandedMobileTabs[idx]" class="border-t px-4 py-4 dark:border-gray-800">
            <template v-for="(segment, si) in tabSegments(tab)" :key="si">
              <FormTabSections
                v-if="segment.sections.length"
                :sections="segment.sections"
                :doctype="doctype"
                :name="name"
                :is-new="isNew"
                v-model:new-doc-name="newDocName"
                :values="values"
                :show-name-field="idx === 0 && si === 0 && isPromptNamed"
              />
              <div v-if="segment.tables.length" class="my-6 space-y-6">
                <ChildTable v-for="field in segment.tables" :key="field.fieldname" :field="field" :parent-values="values" v-model="values[field.fieldname]" />
              </div>
            </template>
          </div>
        </div>
      </div>

      <div v-if="bottomTableFields.length" class="mt-6 space-y-6">
        <ChildTable v-for="field in bottomTableFields" :key="field.fieldname" :field="field" :parent-values="values" v-model="values[field.fieldname]" />
      </div>

      <ErrorMessage class="mt-4" :message="saveError" />
    </form>
  </AppLayout>
</template>

<script setup>
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { onKeyStroke } from '@vueuse/core'
import { useDoc, useNewDoc, useCall, Button, Dialog, ErrorMessage, FeatherIcon, toast } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import Skeleton from '@/components/Skeleton.vue'
import ChildTable from '@/components/ChildTable.vue'
import FormTabSections from '@/components/FormTabSections.vue'
import { useMeta, useFormFields, useFormTabs, useTableFields } from '@/data/useMeta'
import { evaluateDependsOn } from '@/utils/dependsOn'
import { setPageTitle } from '@/data/pageTitle'

const props = defineProps({
  doctype: { type: String, required: true },
  isNew: { type: Boolean, default: false },
  name: { type: String, default: null },
})

const route = useRoute()
const router = useRouter()

function goBack() {
  router.push({ name: 'DoctypeList', params: { doctypeRoute: route.params.doctypeRoute } })
}

const metaResource = useMeta(props.doctype)
const fields = useFormFields(metaResource)
const formTabs = useFormTabs(metaResource)
const tabs = formTabs
const tableFields = useTableFields(metaResource)

// Only the active tab's sections render, but `fields` (every field, flat)
// stays the source for save-time validation below.
const activeTabIdx = ref(0)
const tabSignature = computed(() => tabs.value.map((t) => t.label || '').join('\u0000'))
watch(tabSignature, () => { activeTabIdx.value = 0 })

// A tab's sections split around its child tables, so each table sits
// right after the section it follows.
function tabSegments(tab) {
  const sections = tab?.sections || []
  const tableList = tab?.tables || []
  if (!tableList.length) return [{ sections, tables: [] }]
  const at = (t) => {
    let idx = -1
    const limit = t.afterSection ?? Infinity
    sections.forEach((s, i) => { if (s.id <= limit) idx = i })
    return idx
  }
  const groups = new Map()
  for (const t of tableList) groups.set(at(t), [...(groups.get(at(t)) || []), t])
  const segments = []
  let start = 0
  for (const idx of [...groups.keys()].sort((a, b) => a - b)) {
    segments.push({ sections: sections.slice(start, idx + 1), tables: groups.get(idx) })
    start = idx + 1
  }
  if (start < sections.length) segments.push({ sections: sections.slice(start), tables: [] })
  return segments
}
const bottomTableFields = computed(() => {
  const inTabs = new Set(tabs.value.flatMap((t) => t.tables.map((f) => f.fieldname)))
  return tableFields.value.filter((f) => !inTabs.has(f.fieldname))
})
const activeTabSections = computed(() => tabs.value[activeTabIdx.value]?.sections || [{ label: null, columns: [fields.value] }])

const expandedMobileTabs = ref({ 0: true })
watch(tabSignature, () => { expandedMobileTabs.value = { 0: true } })

// "Prompt" autoname doctypes (simple master/lookup tables) have no field
// backing their name at all - Frappe desk handles this with a "Set Name"
// popup on create; this generic form collects it as its own field instead.
const isPromptNamed = computed(() => metaResource.data?.autoname === 'prompt')
const newDocName = ref('')

const newDoc = props.isNew ? useNewDoc(props.doctype) : null
const existingDoc = props.isNew ? null : useDoc({ doctype: props.doctype, name: props.name })

const loadError = computed(() => metaResource.error || existingDoc?.error || null)

const deletePermissionResource = props.isNew
  ? null
  : useCall({
      url: '/api/v2/method/frappe.client.has_permission',
      method: 'GET',
      params: () => ({ doctype: props.doctype, docname: props.name, perm_type: 'delete' }),
      immediate: false,
      transform: (data) => data?.has_permission,
    })
if (deletePermissionResource) deletePermissionResource.fetch()
const canDelete = computed(() => !!deletePermissionResource?.data)

const showDeleteConfirm = ref(false)
const deleting = ref(false)
const deleteError = ref(null)

async function copyRecordId() {
  const text = props.name
  let copied = false
  try {
    await navigator.clipboard.writeText(text)
    copied = true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    try {
      copied = document.execCommand('copy')
    } catch {
      copied = false
    }
    document.body.removeChild(el)
  }
  if (copied) toast.success('Record ID copied')
  else toast.error('Could not copy the ID')
}

async function confirmDelete() {
  deleting.value = true
  deleteError.value = null
  try {
    await existingDoc.delete.submit()
    toast.success('Deleted')
    showDeleteConfirm.value = false
    goBack()
  } catch (e) {
    deleteError.value = e
  } finally {
    deleting.value = false
  }
}

const values = reactive({})

function initEmptyTableFields() {
  if (!props.isNew) return
  for (const tableField of tableFields.value) {
    if (values[tableField.fieldname] === undefined) values[tableField.fieldname] = []
  }
}
watch(tableFields, initEmptyTableFields)

const cleanSnapshot = ref(null)
function markClean() {
  cleanSnapshot.value = JSON.stringify(values)
}
const isDirty = computed(() => cleanSnapshot.value !== null && JSON.stringify(values) !== cleanSnapshot.value)

watch(
  () => (props.isNew ? newDoc?.doc : existingDoc?.doc),
  (doc) => {
    if (!doc) return
    Object.keys(doc).forEach((k) => {
      values[k] = Array.isArray(doc[k]) ? JSON.parse(JSON.stringify(doc[k])) : doc[k]
    })
    initEmptyTableFields()
    markClean()
  },
  { immediate: true, deep: true },
)

watchEffect(() => {
  setPageTitle(props.isNew ? `New ${metaResource.data?.name || props.doctype}` : (metaResource.data?.title_field && values[metaResource.data.title_field]) || props.name)
})

const saving = ref(false)
const saveError = ref(null)

const LAYOUT_FIELDTYPES = new Set(['Section Break', 'Column Break', 'Tab Break', 'HTML', 'Button', 'Heading', 'Image'])

function missingRequiredFields() {
  return fields.value.filter((field) => {
    if (LAYOUT_FIELDTYPES.has(field.fieldtype) || field.fieldtype === 'Check') return false
    if (!evaluateDependsOn(field.depends_on, values)) return false
    const required = !!field.reqd || (!!field.mandatory_depends_on && evaluateDependsOn(field.mandatory_depends_on, values))
    if (!required) return false
    const value = values[field.fieldname]
    if (Array.isArray(value)) return value.length === 0
    return value === undefined || value === null || String(value).trim() === ''
  })
}

function firstValidationError() {
  const missing = missingRequiredFields()
  if (missing.length) {
    missing.forEach((f) => toast.error(`${f.label || f.fieldname} is required`))
    return `Required: ${missing.map((f) => f.label || f.fieldname).join(', ')}`
  }
  return null
}

async function save() {
  if (props.isNew && isPromptNamed.value && !newDocName.value.trim()) {
    saveError.value = 'Name is required.'
    return
  }
  const validationError = firstValidationError()
  if (validationError) {
    saveError.value = validationError
    return
  }
  saving.value = true
  saveError.value = null
  try {
    if (props.isNew) {
      Object.assign(newDoc.doc, values)
      if (isPromptNamed.value) newDoc.doc.name = newDocName.value.trim()
      const created = await newDoc.submit()
      toast.success('Created')
      router.replace({ name: 'DoctypeForm', params: { doctypeRoute: route.params.doctypeRoute, name: created.name } })
    } else {
      await existingDoc.setValue.submit(values)
      if (existingDoc.setValue.error) throw existingDoc.setValue.error
      toast.success('Saved')
      markClean()
    }
  } catch (e) {
    saveError.value = e
    toast.error(String(e?.messages?.[0] || e?.message || 'Could not save').replace(/<[^>]+>/g, ''))
  } finally {
    saving.value = false
  }
}

onKeyStroke((e) => (e.key === 's' || e.key === 'S') && (e.metaKey || e.ctrlKey), (e) => {
  e.preventDefault()
  if (!saving.value) save()
})
</script>
