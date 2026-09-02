<template>
  <div>
    <label class="mb-1.5 block text-sm text-gray-700 dark:text-gray-300">{{ field.label }}</label>
    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table class="w-full min-w-[400px] text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="w-10 px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
            <th
              v-for="col in summaryColumns"
              :key="col.fieldname"
              class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {{ col.label }}
            </th>
            <th class="w-16 px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length">
            <td :colspan="summaryColumns.length + 2" class="px-3 py-4 text-center text-sm text-gray-400">
              No rows yet.
            </td>
          </tr>
          <tr
            v-for="(row, idx) in rows"
            :key="row.__key || row.name"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td class="px-2 py-2 text-gray-400">{{ idx + 1 }}</td>
            <td v-for="col in summaryColumns" :key="col.fieldname" class="px-3 py-2">
              {{ formatValue(row[col.fieldname], col) }}
            </td>
            <td class="px-2 py-2 text-right">
              <button type="button" class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" @click="openEditor(idx)">
                <FeatherIcon name="edit-2" class="h-3.5 w-3.5" />
              </button>
              <button type="button" class="ml-2 text-gray-400 hover:text-red-600" @click="confirmRemove(idx)">
                <FeatherIcon name="trash-2" class="h-3.5 w-3.5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-1.5 border-t border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
        @click="addRow"
      >
        <FeatherIcon name="plus" class="h-3.5 w-3.5" />
        Add row
      </button>
    </div>

    <Dialog v-model="showRowEditor" :options="{ title: `${field.label} row`, size: '2xl' }">
      <template #body-content>
        <div class="flex flex-col gap-4">
          <DynamicField
            v-for="col in columns"
            :key="col.fieldname"
            :field="col"
            :doctype="field.options"
            v-model="editingRow[col.fieldname]"
          />
        </div>
      </template>
      <template #actions>
        <Button variant="solid" @click="saveRow">Done</Button>
      </template>
    </Dialog>

    <Dialog
      v-model="showRemoveConfirm"
      :options="{
        title: 'Remove row',
        message: 'Remove this row? This cannot be undone.',
        icon: { name: 'trash-2', appearance: 'danger' },
        actions: [{ label: 'Remove', variant: 'solid', theme: 'red', onClick: doRemove }],
      }"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Dialog, Button, FeatherIcon } from 'frappe-ui'
import DynamicField from '@/components/DynamicField.vue'
import { useMeta, useFormFields } from '@/data/useMeta'

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const childMetaResource = useMeta(props.field.options)
const columns = useFormFields(childMetaResource)

const summaryColumns = computed(() => {
  const inListView = columns.value.filter((c) => c.in_list_view)
  return (inListView.length ? inListView : columns.value).slice(0, 3)
})

const rows = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value),
})

let keyCounter = 0
function ensureKey(row) {
  if (!row.__key && !row.name) row.__key = `new-${++keyCounter}`
  return row
}

function addRow() {
  // Mutate in place rather than through the computed setter - avoids a
  // same-tick stale-index race where openEditor(idx) below could open the
  // wrong row if the setter's emit hasn't round-tripped yet.
  rows.value.push(ensureKey({}))
}

const showRowEditor = ref(false)
const editingIndex = ref(-1)
const editingRow = ref({})

function openEditor(idx) {
  editingIndex.value = idx
  editingRow.value = { ...rows.value[idx] }
  showRowEditor.value = true
}

function saveRow() {
  if (editingIndex.value >= 0) {
    const next = rows.value.slice()
    next[editingIndex.value] = ensureKey(editingRow.value)
    rows.value = next
  }
  showRowEditor.value = false
}

const showRemoveConfirm = ref(false)
const removeIndex = ref(-1)

function confirmRemove(idx) {
  removeIndex.value = idx
  showRemoveConfirm.value = true
}

function doRemove() {
  const next = rows.value.slice()
  next.splice(removeIndex.value, 1)
  rows.value = next
  showRemoveConfirm.value = false
}

function formatValue(value, field) {
  if (field.fieldtype === 'Check') return value ? 'Yes' : 'No'
  if (value === null || value === undefined || value === '') return '-'
  return value
}
</script>
