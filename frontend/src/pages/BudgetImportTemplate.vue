<!--
  Vue port of the legacy "Budget Import Template" Desk Page
  (budget_mis/main/page/import_template/import_template.js, its one live
  on_page_load implementation at the end of that 11k-line file - everything
  above it is commented-out history, not behavior to replicate).

  Same data flow as the legacy page: get_user_mappings returns a flat list
  of {full_name, user, unit, cost_center, location_code, ...} rows; this
  groups them by `user` (one card per user, admin/Finance MIS Admin sees
  everyone's, anyone else sees only their own - mirrors
  is_import_template_admin), and each card's Download button either
  generates the full template (entity_data: null) or, once rows are ticked,
  routes through a mandatory review-and-confirm step before generating a
  filtered one (entity_data: JSON.stringify(selectedRows)).

  Deliberately fixed two legacy bugs while porting (see
  data/budgetImportTemplate.js's own header comment): the download-polling
  loop now times out instead of polling forever, and a JSON response is
  only treated as "still generating" when it actually says so, rather than
  swallowing any JSON body (including a real error) as "processing."
-->
<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <div>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Budget Import Template</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Download a Finance Budget import template for your allocated units, cost centers and location codes.</p>
      </div>

      <!-- Global admin search -->
      <div v-if="isAdmin && userGroups.length" class="flex items-center gap-2">
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <FormControl
            type="text"
            v-model="adminSearch"
            placeholder="Search by name or email..."
            class="fc-search-input"
          />
          <FeatherIcon name="users" class="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span class="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
            {{ visibleGroups.length }} user{{ visibleGroups.length === 1 ? '' : 's' }} found
          </span>
        </div>
      </div>

      <div v-if="loading" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <AppLoader label="Loading Data..." />
      </div>
      <ErrorMessage v-else-if="error" :message="error" />
      <div v-else-if="!userGroups.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        No Data Found
      </div>

      <div v-else class="flex flex-col gap-4">
        <UserTemplateCard
          v-for="group in visibleGroups"
          :key="group.email"
          :ref="(el) => setCardRef(group.email, el)"
          :user="group"
          :collapsible="isAdmin"
          :start-expanded="!isAdmin"
          :downloading="downloadingEmail === group.email"
          @download="onDownloadRequest"
        />
      </div>
    </div>

    <ReviewSelectionModal
      v-model="reviewOpen"
      :rows="pendingSelection?.selectedRows || []"
      @confirm="onReviewConfirmed"
    />
    <NoTemplateModal v-model="noTemplateOpen" :is-admin="isAdmin" />

    <!-- Full-screen-feeling download progress overlay -->
    <div
      v-if="downloadingEmail"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <AppLoader :label="progressLabel" variant="export" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ErrorMessage, FeatherIcon, FormControl } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import UserTemplateCard from '@/components/budgetImportTemplate/UserTemplateCard.vue'
import ReviewSelectionModal from '@/components/budgetImportTemplate/ReviewSelectionModal.vue'
import NoTemplateModal from '@/components/budgetImportTemplate/NoTemplateModal.vue'
import { call } from '@/data/decrypt'
import { session } from '@/data/session'
import { setPageTitle } from '@/data/pageTitle'
import { hasImportTemplateLinked, generateAndDownloadTemplate } from '@/data/budgetImportTemplate'

onMounted(() => {
  setPageTitle('Budget Import Template')
  loadData()
})

const loading = ref(false)
const error = ref(null)
const isAdmin = ref(false)
const rawRows = ref([])
const adminSearch = ref('')

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const [admin, rows] = await Promise.all([
      call('budget_mis.api_1.budget_import_template.is_import_template_admin'),
      call('budget_mis.api_1.filter_options.get_user_mappings'),
    ])
    isAdmin.value = Boolean(admin)
    rawRows.value = rows || []
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Could not load data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Group the flat row list by user (email), same shape the legacy page
// builds client-side - one card per user, each carrying its own rows.
const userGroups = computed(() => {
  const groups = new Map()
  for (const row of rawRows.value) {
    if (!groups.has(row.user)) {
      groups.set(row.user, { email: row.user, user_fullname: row.full_name || '', rows: [] })
    }
    groups.get(row.user).rows.push(row)
  }
  return Array.from(groups.values())
})

const visibleGroups = computed(() => {
  const q = adminSearch.value.trim().toLowerCase()
  if (!q) return userGroups.value
  return userGroups.value.filter(
    (g) => g.email.toLowerCase().includes(q) || (g.user_fullname || '').toLowerCase().includes(q)
  )
})

// --- Download flow ---------------------------------------------------

const reviewOpen = ref(false)
const noTemplateOpen = ref(false)
const pendingSelection = ref(null) // { user, selectedRows }
const downloadingEmail = ref('')
const progressStage = ref('starting')
const cardRefsByEmail = {}

function setCardRef(email, el) {
  if (el) cardRefsByEmail[email] = el
  else delete cardRefsByEmail[email]
}

const progressLabel = computed(() => ({
  starting: 'Checking your access...',
  generating: 'Generating your template...',
  waiting: 'Still generating, please wait...',
  ready: 'Preparing file...',
}[progressStage.value] || 'Generating your template...'))

async function onDownloadRequest({ user, selectedRows }) {
  if (selectedRows.length) {
    pendingSelection.value = { user, selectedRows }
    reviewOpen.value = true
    return
  }
  await startDownload(user, [])
}

async function onReviewConfirmed() {
  if (!pendingSelection.value) return
  const { user, selectedRows } = pendingSelection.value
  pendingSelection.value = null
  await startDownload(user, selectedRows)
}

async function startDownload(user, selectedRows) {
  const targetEmail = user.email

  const linked = await hasImportTemplateLinked(targetEmail).catch(() => false)
  if (!linked) {
    noTemplateOpen.value = true
    return
  }

  downloadingEmail.value = targetEmail
  progressStage.value = 'starting'
  try {
    await generateAndDownloadTemplate({
      user: targetEmail,
      entityData: selectedRows.length ? JSON.stringify(selectedRows) : null,
      onProgress: (stage) => { progressStage.value = stage },
    })
    if (selectedRows.length) {
      cardRefsByEmail[targetEmail]?.deselectAll?.()
    }
  } catch (e) {
    error.value = e?.message || 'Could not download the template. Please try again.'
  } finally {
    downloadingEmail.value = ''
  }
}
</script>
