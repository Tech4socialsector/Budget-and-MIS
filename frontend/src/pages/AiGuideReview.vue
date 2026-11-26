<!--
  Admin review page for AI-proposed guide instructions (budget_mis.ai.
  tools.propose_guide_point) - lists every AI Assistant Guide Point still
  sitting at status=Pending across every guide section, with an Approve/
  Reject action per row. This is the review surface the suggestion
  workflow needs: _load_guide() (ai/assistant.py) only ever reads
  status=Approved points, so nothing a user asks the assistant to "remember"
  takes effect anywhere until an admin acts on it here.

  System Manager only - same two-layer enforcement convention as
  DataImport.vue: the Home tile itself is role-restricted (App Module
  Setting), and every backend call here (ai/guide_review.py) independently
  requires write permission on "AI Assistant Guide", so a direct visit to
  this route with no tile shortcut still fails cleanly for a non-admin.
-->
<template>
  <AppLayout>
    <div class="flex flex-col gap-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Instruction Suggestions</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review instructions the AI assistant has proposed for itself from real conversations, before they take effect.
          </p>
        </div>
        <Button variant="subtle" theme="gray" :loading="loading" @click="load">
          <template #prefix><FeatherIcon name="refresh-cw" class="h-4 w-4" /></template>
          Refresh
        </Button>
      </div>

      <ErrorMessage v-if="error" :message="error" />

      <div v-if="loading && !suggestions.length" class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <AppLoader label="Loading suggestions..." />
      </div>

      <div v-else-if="!suggestions.length" class="rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        No pending suggestions. New ones appear here when the assistant proposes an instruction for itself.
      </div>

      <div v-else class="flex flex-col gap-3">
        <div
          v-for="s in suggestions"
          :key="s.name"
          class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div class="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span class="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">{{ s.section_title }}</span>
            <span>Proposed by {{ s.proposed_by }}</span>
            <span>·</span>
            <span>{{ formatDate(s.creation) }}</span>
          </div>
          <p class="mb-2 text-sm text-gray-900 dark:text-gray-100">{{ s.point }}</p>
          <p class="mb-3 text-xs italic text-gray-500 dark:text-gray-400">Reason: {{ s.proposed_reason }}</p>
          <div class="flex items-center gap-2">
            <Button variant="solid" theme="green" size="sm" :loading="actingOn === s.name + ':approve'" @click="approve(s)">
              <template #prefix><FeatherIcon name="check" class="h-3.5 w-3.5" /></template>
              Approve
            </Button>
            <Button variant="outline" theme="red" size="sm" :loading="actingOn === s.name + ':reject'" @click="reject(s)">
              <template #prefix><FeatherIcon name="x" class="h-3.5 w-3.5" /></template>
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Button, FeatherIcon, ErrorMessage } from 'frappe-ui'
import AppLayout from '@/layouts/AppLayout.vue'
import AppLoader from '@/components/AppLoader.vue'
import { setPageTitle } from '@/data/pageTitle'
import { call } from '@/data/decrypt'

setPageTitle('AI Instruction Suggestions')

const suggestions = ref([])
const loading = ref(false)
const error = ref(null)
const actingOn = ref(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    suggestions.value = await call('budget_mis.ai.guide_review.list_pending_guide_suggestions') || []
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Could not load suggestions.'
  } finally {
    loading.value = false
  }
}

async function approve(s) {
  actingOn.value = s.name + ':approve'
  try {
    await call('budget_mis.ai.guide_review.approve_guide_suggestion', { parent: s.parent, row_name: s.name })
    suggestions.value = suggestions.value.filter((x) => x.name !== s.name)
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Could not approve this suggestion.'
  } finally {
    actingOn.value = null
  }
}

async function reject(s) {
  actingOn.value = s.name + ':reject'
  try {
    await call('budget_mis.ai.guide_review.reject_guide_suggestion', { parent: s.parent, row_name: s.name })
    suggestions.value = suggestions.value.filter((x) => x.name !== s.name)
  } catch (e) {
    error.value = e?.messages?.[0] || e?.message || 'Could not reject this suggestion.'
  } finally {
    actingOn.value = null
  }
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(load)
</script>
