<template>
  <AppLayout>
    <div class="flex flex-col gap-6">
      <div class="rounded-lg border border-dashed border-gray-300 p-6 dark:border-gray-700">
        <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Welcome, {{ session.full_name || session.user }}</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Jump into a module below to get started.</p>
      </div>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <!-- Loading skeleton for backend-driven modules (App Module Setting) -->
        <template v-if="modulesResource.loading && !modulesResource.data">
          <div v-for="i in 3" :key="'skel-' + i" class="flex flex-col items-center gap-3 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
            <Skeleton width="3rem" height="3rem" class="rounded-xl" />
            <Skeleton width="4.5rem" height="0.75rem" />
          </div>
        </template>

        <button
          v-for="mod in dynamicModules"
          :key="'mod-' + mod.label"
          class="group flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          @click="openModule(mod)"
        >
          <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white transition group-hover:scale-105 dark:bg-gray-100 dark:text-gray-900">
            <FeatherIcon :name="mod.icon || 'grid'" class="h-6 w-6" />
          </span>
          <div>
            <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ mod.label }}</div>
            <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {{ (mod.doctypes || []).length }} item{{ (mod.doctypes || []).length !== 1 ? 's' : '' }}
            </div>
          </div>
        </button>
      </div>

      <ErrorMessage v-if="modulesResource.error" :message="modulesResource.error" />
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FeatherIcon, ErrorMessage } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import Skeleton from '@/components/Skeleton.vue'
import { session } from '@/data/session'
import { setPageTitle } from '@/data/pageTitle'
import { modulesResource } from '@/data/modules'
import { setActiveModule } from '@/data/activeModule'

onMounted(() => {
  setPageTitle('Home')
  modulesResource.fetch()
})

const router = useRouter()

// Backend-driven modules (App Module Setting), same pattern as the chw
// reference app: a tile per module, click sets it as the active sidebar
// section and jumps straight to its first item.
const dynamicModules = computed(() => modulesResource.data || [])

function openModule(mod) {
  setActiveModule(mod)
  const first = mod.doctypes?.[0]
  if (!first) return
  // A "SPA Page" item opens one of this app's built-in pages by its named
  // route directly; a "DocType" item opens the generic DoctypeList route
  // instead, keyed by its route slug param - mirrors AppSidebar.vue's own
  // page_route/doctype_name branch for the same item shape.
  if (first.page_route) {
    router.push({ name: first.page_route })
  } else {
    router.push({ name: 'DoctypeList', params: { doctypeRoute: first.route } })
  }
}
</script>
