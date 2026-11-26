<template>
  <!-- A popover listing the columns now shown, in order. Drag the grip to
  reorder, pencil to rename the heading, X to remove. "Add Column" lists
  the table's other fields; "Reset to Default" clears every change. An
  optional locked first row (the list's ID) can't move. Choices are saved
  per table in this browser (see useColumnPrefs). -->
  <Popover
    v-model:show="isOpen"
    placement="bottom-end"
    popover-class="column-picker-popover doctype-list-popover"
    :hide-on-blur="false"
  >
    <template #target="{ togglePopover }">
      <Button
        variant="outline"
        data-column-picker-trigger
        data-toolbar-popover-trigger
        :icon="compact ? 'columns' : undefined"
        :icon-left="compact ? undefined : 'columns'"
        :label="compact ? undefined : 'Columns'"
        tooltip="Columns"
        @click="togglePopover"
      />
    </template>
    <template #body-main>
      <div class="w-72 p-1.5">
        <div class="max-h-80 overflow-y-auto">
          <div v-if="lockedLabel" class="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-ink-gray-5">
            <LucideIcon name="lock" class="h-3.5 w-3.5 flex-shrink-0" />
            <span class="flex-1">{{ lockedLabel }}</span>
          </div>
          <div
            v-for="(col, index) in prefs.visibleColumns.value"
            :key="col.fieldname"
            draggable="true"
            class="group flex items-center gap-2 rounded border-t-2 border-transparent px-2 py-1.5 text-sm text-ink-gray-8 hover:bg-surface-gray-2"
            :class="{
              'opacity-40': dragIndex === index,
              '!border-outline-gray-4': dragOverIndex === index && dragIndex !== index,
            }"
            @dragstart="onDragStart(index, $event)"
            @dragover.prevent="dragOverIndex = index"
            @dragleave="dragOverIndex = null"
            @drop.prevent="onDrop(index)"
            @dragend="dragIndex = null; dragOverIndex = null"
          >
            <LucideIcon name="grip-vertical" class="h-4 w-4 flex-shrink-0 cursor-grab text-ink-gray-4" />
            <input
              v-if="editingColumn === col.fieldname"
              v-model="editingLabel"
              class="min-w-0 flex-1 rounded border border-outline-gray-3 bg-surface-white px-1.5 py-0.5 text-sm text-ink-gray-8 focus:outline-none focus:ring-1 focus:ring-outline-gray-4"
              autofocus
              @keydown.enter.prevent="commitEdit"
              @keydown.esc.stop.prevent="editingColumn = null"
              @blur="commitEdit"
            />
            <span v-else class="min-w-0 flex-1 truncate">{{ col.label }}</span>
            <Button variant="ghost" size="sm" tooltip="Rename column" @click="startEdit(col)">
              <template #icon><LucideIcon name="pencil" class="h-4 w-4" /></template>
            </Button>
            <Button variant="ghost" size="sm" icon="x" tooltip="Remove column" @click="prefs.removeColumn(col.fieldname)" />
          </div>
        </div>
        <div class="mt-1 flex flex-col gap-0.5 border-t border-outline-gray-1 pt-1.5">
          <template v-if="prefs.addableColumns.value.length">
            <Button
              variant="subtle"
              class="w-full justify-start"
              icon-left="plus"
              @click="toggleAdding"
            >
              Add Column
            </Button>
            <div v-if="adding" class="mt-1 rounded-lg border border-outline-gray-2 bg-surface-modal p-1.5">
              <TextInput v-model="addQuery" type="text" placeholder="Search" autofocus>
                <template #suffix>
                  <FeatherIcon
                    v-if="addQuery"
                    name="x"
                    class="h-4 w-4 cursor-pointer text-ink-gray-5"
                    @click="addQuery = ''"
                  />
                </template>
              </TextInput>
              <div class="mt-1 max-h-44 overflow-y-auto">
                <button
                  v-for="option in filteredAddable"
                  :key="option.label"
                  type="button"
                  class="block w-full truncate rounded px-2 py-1.5 text-left text-sm text-ink-gray-8 hover:bg-surface-gray-2"
                  @click="addColumn(option)"
                >
                  {{ option.label }}
                </button>
                <p v-if="!filteredAddable.length" class="px-2 py-2 text-sm text-ink-gray-5">No matching fields.</p>
              </div>
            </div>
          </template>
          <Button
            variant="ghost"
            class="w-full justify-start"
            icon-left="rotate-ccw"
            :disabled="!prefs.hasCustomColumns.value"
            @click="prefs.resetColumns()"
          >
            Reset to Default
          </Button>
        </div>
      </div>
    </template>
  </Popover>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button, FeatherIcon, Popover, TextInput } from 'frappe-ui'
import LucideIcon from '@/components/LucideIcon.vue'

const props = defineProps({
  // The object returned by useColumnPrefs().
  prefs: { type: Object, required: true },
  // Text for a locked, non-draggable first row (e.g. "ID"); omit for none.
  lockedLabel: { type: String, default: '' },
  // Icon-only trigger (phones).
  compact: { type: Boolean, default: false },
  // Optional v-model:show, so a page can close this alongside its other popovers.
  show: { type: Boolean, default: undefined },
})
const emit = defineEmits(['update:show'])

const isOpen = ref(!!props.show)
watch(() => props.show, (value) => { if (value !== undefined) isOpen.value = value })
watch(isOpen, (value) => emit('update:show', value))

// Closes on a click anywhere else. frappe-ui's own outside-click handling is
// off (:hide-on-blur="false") because "Add Column" opens a dropdown that renders
// outside the popover, and a click on one of its options must not count as
// "outside" - so this ignores the popover itself, any such dropdown, and the
// trigger button (whose own click already toggles).
function closeOnOutside(event) {
  if (!isOpen.value) return
  const target = event.target
  if (!(target instanceof Element)) return
  if (target.closest('.column-picker-popover, [data-reka-popper-content-wrapper], [data-slot="content"], [data-column-picker-trigger]')) return
  isOpen.value = false
}
onMounted(() => document.addEventListener('pointerdown', closeOnOutside, true))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutside, true))

// "Add Column": a searchable list of the fields not yet shown.
const adding = ref(false)
const addQuery = ref('')
const filteredAddable = computed(() => {
  const q = addQuery.value.trim().toLowerCase()
  const all = props.prefs.addableColumns.value
  return q ? all.filter((o) => o.label.toLowerCase().includes(q)) : all
})
function toggleAdding() {
  adding.value = !adding.value
  addQuery.value = ''
}
function addColumn(option) {
  option.onClick()
  addQuery.value = ''
}
watch(isOpen, (open) => { if (!open) adding.value = false })

// Inline rename (the pencil).
const editingColumn = ref(null)
const editingLabel = ref('')
function startEdit(col) {
  editingColumn.value = col.fieldname
  editingLabel.value = col.label
}
function commitEdit() {
  if (editingColumn.value) props.prefs.renameColumn(editingColumn.value, editingLabel.value)
  editingColumn.value = null
}

// Drag to reorder.
const dragIndex = ref(null)
const dragOverIndex = ref(null)
function onDragStart(index, event) {
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(index))
}
function onDrop(index) {
  props.prefs.moveColumn(dragIndex.value, index)
  dragIndex.value = null
  dragOverIndex.value = null
}
</script>
