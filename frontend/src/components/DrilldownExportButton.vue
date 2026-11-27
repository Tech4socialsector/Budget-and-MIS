<!--
  "Export" dropdown (Excel / PDF) shown in every drill-down modal's header.
  `getPayload` is called at click time so the export always matches the
  level, tab, sort order and number format currently on screen.
-->
<template>
  <Dropdown :options="options" placement="right">
    <template #default="{ open }">
      <Button variant="outline" theme="gray" size="sm" :loading="busy" :icon-right="open ? 'chevron-up' : 'chevron-down'">
        <template #prefix>
          <FeatherIcon name="download" class="h-3.5 w-3.5" />
        </template>
        Export
      </Button>
    </template>
  </Dropdown>
</template>

<script setup>
import { ref } from 'vue'
import { Button, Dropdown, FeatherIcon } from 'frappe-ui'
import { exportDrilldown } from '@/data/drilldownExport'

const props = defineProps({
  getPayload: { type: Function, required: true },
})

const busy = ref(false)

async function run(format) {
  if (busy.value) return
  busy.value = true
  try {
    await exportDrilldown(props.getPayload(), format)
  } catch (e) {
    window.alert(e?.messages?.[0] || e?.message || 'Export failed.')
  } finally {
    busy.value = false
  }
}

const options = [
  { label: 'Excel', icon: 'lucide-file-spreadsheet', onClick: () => run('excel') },
  { label: 'PDF', icon: 'lucide-file-text', onClick: () => run('pdf') },
]
</script>
