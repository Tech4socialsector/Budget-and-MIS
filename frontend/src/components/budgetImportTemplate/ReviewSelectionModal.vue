<!--
  Mandatory confirmation step before downloading a template built from a
  subset of rows (vs. the full template) - mirrors the legacy Desk page's
  show_review_modal(): lists exactly the selected rows so the user can
  double check them, requires an explicit "I've noted these down" checkbox
  before Proceed is enabled (there's no way to re-open this list once the
  template is generated, so this is the only checkpoint), then hands back
  to the caller via the 'confirm' event.
-->
<template>
  <Dialog v-model="show" :options="{ size: '4xl', title: 'Review Selected Items' }">
    <template #body>
      <div class="flex max-h-[85vh] flex-col">
        <div class="border-b px-5 py-4 dark:border-gray-800">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Review Selected Items</h2>
              <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{{ rows.length }} row{{ rows.length === 1 ? '' : 's' }} selected</p>
            </div>
            <button
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              @click="show = false"
            >
              <FeatherIcon name="x" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          <div class="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            <FeatherIcon name="alert-triangle" class="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <div class="font-medium">Please make a note of the items listed below.</div>
              <div class="mt-0.5 text-amber-700 dark:text-amber-400">Keep a record of the selected Cost Centers and Location Codes to avoid duplicates when importing.</div>
            </div>
          </div>

          <div class="fc-scroll-wrapper">
            <table class="fc-table w-full min-w-[700px] text-sm">
              <thead>
                <tr class="fc-thead-main">
                  <th class="fc-th text-left">Unit</th>
                  <th class="fc-th text-left">Unit Description</th>
                  <th class="fc-th text-left">Cost Center</th>
                  <th class="fc-th text-left">Cost Center Description</th>
                  <th class="fc-th text-left">Location Code</th>
                  <th class="fc-th text-left">Location Description</th>
                  <th class="fc-th text-left">State</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in rows" :key="i">
                  <td class="fc-td text-left">{{ row.unit }}</td>
                  <td class="fc-td text-left">{{ row.unit_description }}</td>
                  <td class="fc-td text-left">{{ row.cost_center }}</td>
                  <td class="fc-td text-left">{{ row.cost_center_description }}</td>
                  <td class="fc-td text-left">{{ row.location_code }}</td>
                  <td class="fc-td text-left">{{ row.location_description }}</td>
                  <td class="fc-td text-left">{{ row.state }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="border-t px-5 py-4 dark:border-gray-800">
          <label class="mb-4 flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              v-model="acknowledged"
              type="checkbox"
              class="form-checkbox mt-0.5 h-4 w-4 flex-shrink-0 !rounded-[3px] border-outline-gray-3"
            />
            I have noted down the selected items and I am ready to proceed.
          </label>
          <div class="flex justify-end gap-2">
            <Button variant="subtle" theme="gray" @click="show = false">Cancel</Button>
            <Button variant="solid" theme="blue" :disabled="!acknowledged" @click="onProceed">Proceed to Download</Button>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Button, Dialog, FeatherIcon } from 'frappe-ui'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  rows: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const acknowledged = ref(false)
watch(show, (v) => {
  if (v) acknowledged.value = false
})

function onProceed() {
  if (!acknowledged.value) return
  show.value = false
  emit('confirm')
}
</script>
