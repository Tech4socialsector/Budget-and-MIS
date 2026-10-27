<template>
  <Dialog v-model="show" :options="{ size: 'xl', position: 'top' }" @after-leave="commandPaletteQuery = ''">
    <template #body>
      <Combobox nullable @update:model-value="handleSelect">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-4.5">
            <LucideIcon name="search" class="h-4 w-4 text-ink-gray-5" />
          </div>
          <ComboboxInput
            placeholder="Search"
            class="w-full border-none bg-transparent py-3 pl-11.5 pr-4.5 text-base text-ink-gray-8 placeholder-ink-gray-4 focus:ring-0"
            :value="commandPaletteQuery"
            @change="commandPaletteQuery = $event.target.value"
            autocomplete="off"
          />
        </div>
        <ComboboxOptions class="max-h-96 overflow-auto border-t border-outline-gray-1" static :hold="true">
          <div v-if="!commandPaletteGroups.length" class="px-4.5 py-6 text-center text-sm text-ink-gray-5">
            No results found
          </div>
          <div class="mb-2 mt-4.5 first:mt-3" v-for="group in commandPaletteGroups" :key="group.title">
            <div class="mb-2.5 px-4.5 text-base text-ink-gray-5">{{ group.title }}</div>
            <ComboboxOption
              v-for="item in group.items"
              :key="item.name"
              v-slot="{ active }"
              :value="item"
              class="px-2.5"
            >
              <div
                class="flex w-full min-w-0 items-center rounded px-2 py-2 text-base font-medium text-ink-gray-8"
                :class="{ 'bg-surface-gray-2': active }"
              >
                <component :is="item.icon" v-if="item.icon" class="mr-3 h-4 w-4 flex-shrink-0 text-ink-gray-7" />
                <span class="overflow-hidden text-ellipsis whitespace-nowrap">{{ item.title }}</span>
              </div>
            </ComboboxOption>
          </div>
        </ComboboxOptions>
      </Combobox>
    </template>
  </Dialog>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/vue'
import { Dialog } from 'frappe-ui'
import LucideIcon from '@/components/LucideIcon.vue'
import { showCommandPalette, commandPaletteQuery, commandPaletteGroups, openCommandPalette } from '@/data/commandPalette'

const emit = defineEmits(['select'])

const show = showCommandPalette

function handleSelect(item) {
  if (!item) return
  emit('select', item)
  show.value = false
}

// headlessui's own ComboboxInput already closes on Escape (via Dialog's
// DialogContent @escape-key-down) - this only needs to own the opening
// shortcut, same Cmd/Ctrl+K the reference frappe-ui docs search uses.
function keydownWatcher(e) {
  if (e.key === 'k' && (e.ctrlKey || e.metaKey) && !e.target.classList.contains('ProseMirror')) {
    e.preventDefault()
    openCommandPalette()
  }
}

onMounted(() => window.addEventListener('keydown', keydownWatcher))
onBeforeUnmount(() => window.removeEventListener('keydown', keydownWatcher))
</script>
