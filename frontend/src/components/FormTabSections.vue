<template>
  <div class="space-y-6 [&_input:not([type=checkbox]):not([type=radio])]:h-8 [&_[data-slot=trigger]]:h-8 [&_[data-slot=trigger]]:w-full [&_select]:h-8">
    <div v-for="(section, sIdx) in laidOut" :key="sIdx" v-show="isSectionVisible(section)">
      <h3 v-if="section.label" class="text-base font-medium text-ink-gray-7" :class="section.description ? 'mb-1' : 'mb-3'">
        {{ section.label }}
      </h3>
      <p v-if="section.description" class="mb-3 text-xs text-ink-gray-5">{{ section.description }}</p>
      <div class="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <div v-if="sIdx === 0 && showNameField" class="flex-1">
          <FormControl
            type="text"
            label="Name"
            required
            :disabled="!isNew"
            :model-value="isNew ? newDocName : name"
            @update:model-value="$emit('update:newDocName', $event)"
          />
        </div>
        <div v-for="(column, cIdx) in section.visibleColumns" :key="cIdx" class="flex min-w-0 flex-1 basis-0 flex-col gap-4">
          <div v-for="field in column" :key="field.fieldname">
            <DynamicField
              :field="field"
              :doctype="doctype"
              :docname="isNew ? null : name"
              :sibling-values="values"
              :model-value="values[field.fieldname]"
              @update:model-value="values[field.fieldname] = $event"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FormControl } from 'frappe-ui'
import DynamicField from '@/components/DynamicField.vue'
import { evaluateDependsOn } from '@/utils/dependsOn'

// Factored out of DoctypeForm.vue so the same section/column rendering can
// be used twice from there without duplicating it verbatim: once for the
// desktop tab switcher's single active tab, and once per tab inside the
// mobile accordion (see DoctypeForm.vue) where every tab's fields need to
// render, just collapsed until expanded.
const props = defineProps({
  sections: { type: Array, required: true },
  doctype: { type: String, required: true },
  name: { type: String, default: null },
  isNew: { type: Boolean, default: false },
  newDocName: { type: String, default: '' },
  values: { type: Object, required: true },
  // Only the Name field for a "prompt" autoname doctype belongs on one
  // specific tab's first section - passed in as a plain boolean rather
  // than recomputed here, since "which tab/section that actually is" is
  // the caller's own layout decision, not this component's.
  showNameField: { type: Boolean, default: false },
})
defineEmits(['update:newDocName'])

// A section with a field hidden by depends_on would otherwise leave a gap
// where that field was laid out - re-flowed here to just the visible
// fields, split evenly across however many columns the section already
// had. A section where nothing is hidden keeps the layout it was designed
// with.
const laidOut = computed(() =>
  props.sections.map((section) => {
    const all = section.columns.flat()
    const visible = all.filter((f) => evaluateDependsOn(f.depends_on, props.values))
    if (visible.length === all.length) return { ...section, visibleColumns: section.columns }
    if (visible.length < 2 || section.columns.length < 2) return { ...section, visibleColumns: [visible] }
    const half = Math.ceil(visible.length / 2)
    return { ...section, visibleColumns: [visible.slice(0, half), visible.slice(half)] }
  }),
)

// Same depends_on convention as DynamicField.vue's own fields, applied at
// the Section Break level - a section with no condition always shows.
function isSectionVisible(section) {
  return evaluateDependsOn(section.dependsOn, props.values)
}
</script>
