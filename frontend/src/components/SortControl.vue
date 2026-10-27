<template>
  <!-- Helpdesk's sort control: one button - sort icon, the current sort field and
  a chevron - that opens a small popover with the field picker and the
  ascending / descending toggle. -->
  <Popover v-model:show="isOpen" placement="bottom-end" popover-class="doctype-list-popover" :hide-on-blur="false">
    <template #target="{ togglePopover }">
      <Button variant="outline" icon-left="lucide-arrow-up-down" data-toolbar-popover-trigger @click="togglePopover">
        {{ currentLabel }}
        <template #suffix>
          <FeatherIcon :name="isOpen ? 'chevron-up' : 'chevron-down'" class="h-4 w-4 text-ink-gray-5" />
        </template>
      </Button>
    </template>
    <template #body-main>
      <div class="w-72 max-w-[90vw] p-3">
        <SortEditor :fields="fields" :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />
      </div>
    </template>
  </Popover>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button, FeatherIcon, Popover } from 'frappe-ui'
import SortEditor from '@/components/SortEditor.vue'

const SORTABLE_FIELDTYPES = new Set(['Select', 'Link', 'Check', 'Date', 'Datetime', 'Data', 'Int', 'Float', 'Currency'])

const props = defineProps({
  fields: { type: Array, required: true },
  // { field: fieldname, direction: 'asc' | 'desc' }
  modelValue: { type: Object, required: true },
  show: { type: Boolean, default: undefined },
})
const emit = defineEmits(['update:modelValue', 'update:show'])

const isOpen = ref(!!props.show)
watch(() => props.show, (v) => { if (v !== undefined) isOpen.value = v })
watch(isOpen, (v) => emit('update:show', v))

const currentLabel = computed(() => {
  const field = props.modelValue.field
  const found = props.fields.find((f) => f.fieldname === field && SORTABLE_FIELDTYPES.has(f.fieldtype))
  if (found) return found.label || found.fieldname
  return { modified: 'Last Modified', creation: 'Created', name: 'ID' }[field] || 'Sort'
})

// The field dropdown inside the popover opens in a portal, so frappe-ui's own
// outside-click is off (:hide-on-blur="false"); close on a click anywhere that
// isn't the popover, that dropdown, or this button.
function closeOnOutside(event) {
  if (!isOpen.value) return
  const target = event.target
  if (!(target instanceof Element)) return
  if (target.closest('.doctype-list-popover, [data-reka-popper-content-wrapper], [data-slot="content"], [data-toolbar-popover-trigger]')) return
  isOpen.value = false
}
onMounted(() => document.addEventListener('pointerdown', closeOnOutside, true))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutside, true))
</script>
