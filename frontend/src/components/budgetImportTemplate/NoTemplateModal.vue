<!--
  Shown when a user has no Import Template linked via Finance user access -
  mirrors the legacy page's APF modal in its "Template Not Configured" /
  "Import Template Missing" mode (distinct copy for admin vs. non-admin,
  since an admin can actually fix this themselves while a Finance Unit
  Coordinator can only ask someone else to).
-->
<template>
  <Dialog v-model="show" :options="{ size: 'sm', title: 'No Template Linked' }">
    <template #body>
      <div class="px-5 py-5 text-center">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
          <FeatherIcon name="alert-triangle" class="h-6 w-6" />
        </div>
        <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
          {{ isAdmin ? 'Template Not Configured' : 'Import Template Missing' }}
        </h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          <template v-if="isAdmin">
            This user has no Import Template linked. Assign one under Finance User Access before generating a template.
          </template>
          <template v-else>
            Your account has no Import Template linked yet. Please contact an administrator to get one assigned.
          </template>
        </p>
        <Button class="mt-5 w-full" variant="solid" theme="gray" @click="show = false">Close</Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Button, Dialog, FeatherIcon } from 'frappe-ui'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>
