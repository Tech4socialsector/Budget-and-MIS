<template>
  <!-- The "N selected" bar under a ListView, used by the main list and
  child tables. Replaces frappe-ui's stock banner content: the select-all
  button turns into "Unselect all" once everything is selected, and it
  sits in the page flow under the table (see index.css, .selection-bar)
  instead of floating over the rows. -->
  <ListSelectBanner class="selection-bar !min-w-0 max-w-[94vw]">
    <template #default="{ selections, allRowsSelected, selectAll, unselectAll }">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span class="whitespace-nowrap text-sm font-medium text-ink-gray-9">{{ selections.size }} selected</span>
        <Button
          variant="ghost"
          size="sm"
          class="text-ink-gray-7"
          @click="allRowsSelected ? unselectAll() : selectAll()"
        >
          {{ allRowsSelected ? 'Unselect all' : 'Select all' }}
        </Button>
        <div class="flex items-center gap-1.5">
          <Button v-if="duplicate" size="sm" icon-left="copy" @click="$emit('duplicate')">Duplicate</Button>
          <Button size="sm" variant="solid" theme="red" icon-left="trash-2" @click="$emit('delete')">Delete</Button>
          <Button size="sm" variant="ghost" icon="x" tooltip="Clear selection" aria-label="Clear selection" @click="unselectAll()" />
        </div>
      </div>
    </template>
  </ListSelectBanner>
</template>

<script setup>
import { Button, ListSelectBanner } from 'frappe-ui'

defineProps({ duplicate: { type: Boolean, default: false } })
defineEmits(['delete', 'duplicate'])
</script>
