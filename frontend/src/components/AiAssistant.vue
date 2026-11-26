<template>
  <!-- Trigger button lives in AppSidebar.vue's footer. -->
  <Dialog v-model="show" :options="{ size: '6xl', title: 'ai-assistant' }">
    <template #body>
      <div class="ai-assistant-panel flex flex-col">
        <div class="flex items-center justify-between border-b px-4 py-3 dark:border-gray-800 sm:px-5">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <AssistantIcon class="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </span>
            <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ botName }}</h2>
          </div>
          <div class="flex items-center gap-1">
            <AppTooltip v-if="conversation.length" text="Clear conversation">
              <button
                class="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                @click="handleClear"
              >
                <FeatherIcon name="trash-2" class="h-4 w-4" />
              </button>
            </AppTooltip>
            <AppTooltip text="Close">
              <button
                class="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                @click="show = false"
              >
                <FeatherIcon name="x" class="h-4 w-4" />
              </button>
            </AppTooltip>
          </div>
        </div>

        <div ref="messagesRef" class="flex flex-1 flex-col space-y-3 overflow-y-auto p-4 sm:p-5">
          <div
            v-if="conversation.length === 0"
            class="flex flex-1 flex-col items-center justify-center gap-2 text-center text-gray-500 dark:text-gray-400"
          >
            <AssistantIcon class="h-7 w-7" />
            <span class="max-w-xs text-sm">
              Hi, I'm {{ botName }}. Ask me to look up budget data, or help you create or update a record.
            </span>
          </div>

          <div
            v-for="(m, idx) in conversation"
            :key="idx"
            class="flex"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[75%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm"
              :class="m.role === 'user'
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'"
            >{{ m.content }}</div>
          </div>

          <div v-if="sending.loading" class="flex justify-start">
            <div class="flex items-center gap-1 rounded-2xl bg-gray-100 px-3 py-2.5 dark:bg-gray-800">
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
            </div>
          </div>
        </div>

        <ErrorMessage class="mx-4 mb-2 sm:mx-5" :message="sendError" />

        <div class="border-t p-3 dark:border-gray-800 sm:p-4">
          <div class="flex items-end gap-2">
            <textarea
              v-model="draft"
              rows="1"
              placeholder="Type a message..."
              class="flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
              @keydown.enter.exact.prevent="submit"
            />
            <AppTooltip v-if="voiceSupported" :text="listening ? 'Stop listening' : 'Speak'">
              <button
                type="button"
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                :class="listening
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'"
                @click="toggleVoice"
              >
                <FeatherIcon :name="listening ? 'mic-off' : 'mic'" class="h-4 w-4" />
              </button>
            </AppTooltip>
            <Button variant="solid" :loading="sending.loading" :disabled="!draft.trim()" @click="submit">
              <template #icon>
                <FeatherIcon name="send" class="h-4 w-4" />
              </template>
            </Button>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style>
/* frappe-ui's Dialog has no size prop granular enough for "full-screen on
mobile, centered card on larger screens" - its outer overlay wrapper
(px-4 py-4) and DialogContent (my-8, rounded-xl, max-w-*) apply
unconditionally. data-dialog is the one hook the component exposes for
exactly this: it's set from options.title, so title: 'ai-assistant' above
lets these overrides target only this dialog instance. */
.ai-assistant-panel {
  width: 100%;
  height: 42rem;
  max-height: 80vh;
}

@media (max-width: 639px), (max-height: 480px) {
  [data-dialog='ai-assistant'].dialog-overlay > div {
    padding: 0;
  }
  [data-dialog='ai-assistant'] .dialog-content {
    margin: 0;
    max-width: none;
    width: 100vw;
    height: 100dvh;
    border-radius: 0;
  }
  .ai-assistant-panel {
    height: 100dvh;
    max-height: none;
  }
}
</style>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Button, Dialog, ErrorMessage, FeatherIcon } from 'frappe-ui'
import AssistantIcon from '@/components/AssistantIcon.vue'
import AppTooltip from '@/components/AppTooltip.vue'
import {
  assistantState,
  assistantConfigResource,
  conversation,
  sendAssistantMessage,
  sending,
  clearConversation,
} from '@/data/aiAssistant'

const messagesRef = ref(null)
const draft = ref('')
const sendError = ref(null)

const botName = computed(() => assistantConfigResource.data?.bot_name || 'Assistant')

const show = computed({
  get: () => assistantState.visible,
  set: (v) => (assistantState.visible = v),
})

watch(
  () => assistantState.visible,
  (visible) => {
    if (visible) assistantConfigResource.reload()
  },
)

watch(
  () => conversation.value.length,
  () => nextTick(() => {
    if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }),
)

function handleClear() {
  clearConversation()
  sendError.value = null
}

async function submit() {
  const message = draft.value.trim()
  if (!message || sending.loading) return
  draft.value = ''
  sendError.value = null
  try {
    await sendAssistantMessage(message)
  } catch (e) {
    sendError.value = e
    draft.value = message
  }
}

// --- Voice input (Web Speech API) -------------------------------------
// Fully client-side, no audio ever leaves the browser, no extra cost.
// Not supported on iOS Safari - voiceSupported gates the mic button so it
// simply doesn't appear there rather than failing silently on click.
const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition
const voiceSupported = !!SpeechRecognitionImpl
const listening = ref(false)
let recognizer = null

function toggleVoice() {
  if (listening.value) {
    recognizer?.stop()
    return
  }
  recognizer = new SpeechRecognitionImpl()
  recognizer.continuous = false
  recognizer.interimResults = true
  recognizer.onresult = (event) => {
    let transcript = ''
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript
    }
    draft.value = transcript
  }
  recognizer.onerror = () => {
    listening.value = false
  }
  recognizer.onend = () => {
    listening.value = false
  }
  listening.value = true
  recognizer.start()
}
</script>
