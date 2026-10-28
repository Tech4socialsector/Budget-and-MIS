<template>
  <!-- Trigger buttons live in TopNavbar.vue (desktop) and MobileNav.vue
  (mobile), plus the command palette (commandPalette.js) - all just flip
  assistantState.visible, which this panel reads directly.

  A right-to-left sliding DOCKED side panel, not a centered Dialog popup
  and deliberately NOT a modal overlay either - no backdrop, no dimming the
  rest of the page, no click-outside-to-close. The page behind it stays
  fully visible and usable while the panel is open, the way a persistent
  side panel actually behaves (vs. a popup layered on top of the page) -
  closing is only ever explicit (the header's own Close button, or
  toggling the trigger again). frappe-ui's Dialog has no "slide in from the
  edge and stay docked to it, non-modal" mode at all, so this is a plain
  fixed-position panel instead, mirroring the same chat-UI structure
  (header / message list / input footer) the sibling creche_reports app's
  own AiAssistant.vue uses for its popup, adapted to budget_mis's own data
  layer (aiAssistant.js has no blocks/action/navigate support - this stays
  a plain text chat). -->
  <Teleport to="body">
    <Transition name="ai-panel-slide">
      <div
        v-if="show"
        class="ai-assistant-panel fixed inset-y-0 right-0 z-[1051] isolate flex w-full flex-col overflow-hidden bg-white dark:bg-gray-900 sm:w-1/2"
        role="dialog"
        aria-label="AI Assistant"
      >
        <!-- Ambient background: two slowly drifting blurred gradient orbs
        behind everything else (z-index via stacking order + -z-10, not a
        literal z-index value, so they always sit under the header/messages/
        input regardless of those elements' own stacking contexts) - the
        same "noticed, not stared at" ambient-motion treatment the login
        page's own .login-orb already uses, but in the AuditorIcon's own
        indigo-to-pink gradient family instead of plain blue, so this AI
        surface reads as visually distinct from the rest of the app's own
        flat report pages rather than just another white panel. -->
        <div class="ai-assistant-orb ai-assistant-orb-a pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full" />
        <div class="ai-assistant-orb ai-assistant-orb-b pointer-events-none absolute -bottom-32 -left-20 -z-10 h-80 w-80 rounded-full" />

        <div class="ai-assistant-header relative flex flex-shrink-0 items-center justify-between gap-3 border-b px-4 py-3 dark:border-gray-800 sm:px-5">
          <div class="flex items-center gap-2.5">
            <span class="ai-assistant-avatar-badge ai-assistant-pop-in flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-fc-blue-light dark:bg-fc-blue-mid/15">
              <AuditorIcon class="h-4.5 w-4.5" />
            </span>
            <div class="ai-assistant-fade-in min-w-0" style="animation-delay: 60ms">
              <h2 class="truncate text-base font-semibold leading-tight text-gray-900 dark:text-gray-100">{{ botName }}</h2>
              <p class="truncate text-xs text-gray-500 dark:text-gray-400">{{ appTitle }} &middot; AI Assistant</p>
            </div>
          </div>
          <div class="ai-assistant-fade-in flex items-center gap-1" style="animation-delay: 100ms">
            <AppTooltip v-if="conversation.length" text="Clear conversation">
              <button
                class="ai-assistant-icon-btn flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400"
                @click="handleClear"
              >
                <FeatherIcon name="trash-2" class="h-4 w-4" />
              </button>
            </AppTooltip>
            <AppTooltip text="Close">
              <button
                class="ai-assistant-icon-btn flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400"
                @click="show = false"
              >
                <FeatherIcon name="x" class="h-4 w-4" />
              </button>
            </AppTooltip>
          </div>
        </div>

        <div ref="messagesRef" class="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          <div
            v-if="conversation.length === 0 && !sending.loading"
            class="flex h-full flex-col items-center justify-center gap-6 px-2 text-center"
          >
            <span class="ai-assistant-avatar-badge ai-assistant-pop-in ai-assistant-glow flex h-14 w-14 items-center justify-center rounded-full bg-fc-blue-light dark:bg-fc-blue-mid/15">
              <AuditorIcon class="h-7 w-7" />
            </span>
            <div class="ai-assistant-fade-in space-y-1.5" style="animation-delay: 80ms">
              <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">Hi, I'm {{ botName }}</p>
              <p class="mx-auto max-w-sm text-sm text-gray-500 dark:text-gray-400">
                Ask me to look up budget or Monthly MIS data, or help you create or update a record.
              </p>
            </div>
            <div class="grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                v-for="(prompt, i) in starterPrompts"
                :key="prompt.text"
                type="button"
                class="ai-assistant-starter ai-assistant-fade-in flex items-start gap-3 rounded-xl px-3.5 py-3 text-left"
                :style="{ animationDelay: `${120 + i * 60}ms` }"
                @click="useStarterPrompt(prompt.text)"
              >
                <span class="ai-assistant-starter-icon flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                  <FeatherIcon :name="prompt.icon" class="h-4 w-4" />
                </span>
                <span class="text-sm font-medium leading-snug text-gray-700 dark:text-gray-300">{{ prompt.text }}</span>
              </button>
            </div>
          </div>

          <!-- TransitionGroup's own wrapper (tag="div" class="contents") is
          a direct child of .space-y-6 above, but `display: contents` means
          it generates no box of its own - so the parent's space-y-* sibling
          -margin selector (.space-y-6 > :not([hidden]) ~ :not([hidden]))
          matches that invisible wrapper, not the actual message rows one
          level deeper, and those rows never got any spacing applied to
          them at all. mt-6 directly on each row (skipped on the very first
          one, so it doesn't add a stray gap right under the empty-state/
          starter-prompt block above) sidesteps that mismatch entirely. -->
          <TransitionGroup name="ai-assistant-msg" tag="div" class="contents">
            <div
              v-for="(m, idx) in conversation"
              :key="idx"
              class="flex items-start gap-2"
              :class="[m.role === 'user' ? 'flex-row-reverse' : 'flex-row', idx > 0 && 'mt-6']"
            >
              <span
                v-if="m.role !== 'user'"
                class="ai-assistant-avatar-badge flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-fc-blue-light dark:bg-fc-blue-mid/15"
              >
                <AuditorIcon class="h-3.5 w-3.5" />
              </span>
              <span
                v-else
                class="ai-assistant-avatar-user flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-semibold"
              >
                {{ userInitial }}
              </span>
              <div
                class="max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                :class="m.role === 'user' ? 'ai-assistant-bubble-user' : 'ai-assistant-bubble-bot'"
                v-html="renderFormatted(m.content)"
              />
            </div>
          </TransitionGroup>

          <div v-if="sending.loading" class="flex items-end gap-2" :class="conversation.length > 0 && 'mt-6'">
            <span class="ai-assistant-avatar-badge flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-fc-blue-light dark:bg-fc-blue-mid/15">
              <AuditorIcon class="h-3.5 w-3.5" />
            </span>
            <div class="ai-assistant-thinking flex items-center gap-2 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
              <span class="flex items-center gap-1">
                <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-fc-blue-mid [animation-delay:-0.3s]" />
                <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-fc-blue-mid [animation-delay:-0.15s]" />
                <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-fc-blue-mid" />
              </span>
              <span class="text-sm font-medium text-fc-blue-dark dark:text-blue-300">{{ thinkingText }}</span>
            </div>
          </div>
        </div>

        <ErrorMessage class="mb-2 px-4 sm:px-5" :message="sendError" />

        <div class="ai-assistant-footer relative flex-shrink-0 border-t border-gray-100 p-3 dark:border-gray-800 sm:p-4">
          <div class="flex items-end gap-2">
            <textarea
              ref="textareaRef"
              v-model="draft"
              rows="2"
              placeholder="Ask about budgets, actuals, Monthly MIS..."
              class="ai-assistant-input min-h-[3.25rem] max-h-56 flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
              @input="autoGrow"
              @keydown.enter.exact.prevent="submit"
            />
            <AppTooltip v-if="voiceSupported" :text="listening ? 'Stop listening' : 'Speak'">
              <button
                type="button"
                class="ai-assistant-icon-btn flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                :class="listening
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'"
                @click="toggleVoice"
              >
                <FeatherIcon :name="listening ? 'mic-off' : 'mic'" class="h-4 w-4" />
              </button>
            </AppTooltip>
            <Button
              variant="solid"
              theme="gray"
              :loading="sending.loading"
              :disabled="!draft.trim()"
              class="ai-assistant-send-btn !bg-fc-blue-mid hover:!bg-fc-blue-dark"
              @click="submit"
            >
              <template #icon>
                <FeatherIcon name="send" class="h-4 w-4" />
              </template>
            </Button>
          </div>
          <p class="mt-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{{ botName }} can make mistakes. Verify important figures.</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* This app's own fc-blue brand palette (same family the login page, navbar,
and every report table banner already use) rather than flat black/gray -
the bot's bubble gets a soft blue-tinted surface (echoing the gradient
AuditorIcon badge beside it) and the user's own bubble uses the brand's
mid-blue solid fill, so the two sides read as "this app's own assistant",
not a generic black/white chat skin. */
.ai-assistant-bubble-bot {
  background-color: #eef4fb;
  color: #152a43;
  border-radius: 1rem 1rem 1rem 0.25rem;
}
:root.dark .ai-assistant-bubble-bot {
  background-color: rgb(30 41 59);
  color: rgb(226 232 240);
}
.ai-assistant-bubble-user {
  border-radius: 1rem 1rem 0.25rem 1rem;
  background-color: theme('colors.fc-blue-mid');
  color: #fff;
}
:root.dark .ai-assistant-bubble-user {
  background-color: theme('colors.fc-blue-mid');
  color: #fff;
}

/* Headings/bullets inside a bot reply (see renderFormatted) inherit the
bubble's own ink color by default, which read a little flat against the
tinted background - a touch of the brand blue on headings ties the content
back to the badge/bubble tint without needing a second accent color. */
.ai-assistant-bubble-bot :deep(p.font-semibold) {
  color: theme('colors.fc-blue-dark');
}
:root.dark .ai-assistant-bubble-bot :deep(p.font-semibold) {
  color: #93c5fd;
}

/* Same tint as .ai-assistant-bubble-bot, so the "thinking" placeholder
reads as a preview of the reply bubble that's about to land in its place,
not a visually unrelated gray box. */
.ai-assistant-thinking {
  background-color: #eef4fb;
}
:root.dark .ai-assistant-thinking {
  background-color: rgb(30 41 59);
}

.ai-assistant-avatar-user {
  background-color: theme('colors.fc-blue-light');
  color: theme('colors.fc-blue-dark');
}
:root.dark .ai-assistant-avatar-user {
  background-color: rgb(30 95 168 / 0.25);
  color: #93c5fd;
}

.ai-assistant-starter {
  border: 1px solid rgb(0 0 0 / 0.08);
  background-color: rgb(249 250 251);
  transition: background-color 120ms ease, border-color 120ms ease;
}
.ai-assistant-starter:hover {
  border-color: theme('colors.fc-blue-mid/30');
  background-color: theme('colors.fc-blue-light');
}
:root.dark .ai-assistant-starter {
  border-color: rgb(255 255 255 / 0.08);
  background-color: rgb(31 41 55);
}
:root.dark .ai-assistant-starter:hover {
  border-color: rgb(96 165 250 / 0.3);
  background-color: rgb(30 58 95 / 0.4);
}
.ai-assistant-starter-icon {
  background-color: theme('colors.fc-blue-light');
  color: theme('colors.fc-blue-mid');
  transition: background-color 120ms ease, color 120ms ease;
}
:root.dark .ai-assistant-starter-icon {
  background-color: rgb(30 95 168 / 0.2);
  color: #93c5fd;
}

/* The panel itself gets real depth (a soft multi-layer shadow, since there
is no backdrop of its own to fade into - the page behind stays fully
visible/usable while this is open) rather than a flat drop-shadow utility,
and its border is a hairline rather than none, so the docked edge reads as
a distinct surface even against a busy page behind it. */
.ai-assistant-panel {
  box-shadow: -8px 0 40px -4px rgb(15 23 42 / 0.18), -2px 0 8px -2px rgb(15 23 42 / 0.1);
  border-left: 1px solid rgb(0 0 0 / 0.06);
}
:root.dark .ai-assistant-panel {
  border-left-color: rgb(255 255 255 / 0.06);
  box-shadow: -8px 0 40px -4px rgb(0 0 0 / 0.5), -2px 0 8px -2px rgb(0 0 0 / 0.3);
}

/* Panel slide: a short, slightly overshooting spring (not a plain linear
ease) on open - the same "settles into place" feel most polished docked
panels use instead of a mechanical slide-and-stop - paired with a gentle
scale so the panel feels like it's gliding in from the edge rather than
just translating. Close is quicker and has no overshoot (a panel leaving
should feel snappy, not bouncy). Both respect prefers-reduced-motion by
collapsing to an instant show/hide (duration 0 still runs Vue's transition
lifecycle correctly, unlike v-if snapping with no Transition at all, so
.ai-assistant-panel's own flex layout never flashes unstyled). */
.ai-panel-slide-enter-active {
  transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease;
}
.ai-panel-slide-leave-active {
  transition: transform 220ms cubic-bezier(0.4, 0, 1, 1), opacity 180ms ease;
}
.ai-panel-slide-enter-from,
.ai-panel-slide-leave-to {
  transform: translateX(100%);
  opacity: 0.6;
}

@media (prefers-reduced-motion: reduce) {
  .ai-panel-slide-enter-active,
  .ai-panel-slide-leave-active {
    transition-duration: 0ms;
  }
}

/* Header: solid backing (it sits above the ambient orbs - see
.ai-assistant-orb below - and must not let them show through its own
title/button row) plus a faint top-to-bottom tint for a touch of depth
against the hairline border beneath it. */
.ai-assistant-header {
  background-color: rgb(255 255 255 / 0.92);
  background-image: linear-gradient(to bottom, rgb(255 255 255 / 0.6), transparent);
  backdrop-filter: blur(8px);
}
:root.dark .ai-assistant-header {
  background-color: rgb(17 24 39 / 0.92);
  background-image: linear-gradient(to bottom, rgb(255 255 255 / 0.02), transparent);
}

/* Footer: same reasoning as .ai-assistant-header above - orb-b drifts into
the bottom-left corner this sits over, so it needs its own solid-enough
backing to keep the input field/disclaimer text legible rather than having
a blurred gradient show through behind them. */
.ai-assistant-footer {
  background-color: rgb(255 255 255 / 0.92);
  backdrop-filter: blur(8px);
}
:root.dark .ai-assistant-footer {
  background-color: rgb(17 24 39 / 0.92);
}

/* Ambient background orbs - large, heavily blurred gradient circles that
drift very slowly forever, giving the panel's otherwise flat white/dark
surface some ambient life (same "noticed, not stared at" philosophy as the
login page's own .login-orb). The AuditorIcon's own indigo-to-pink gradient
is reused here (rather than plain fc-blue) so this specifically AI surface
reads as its own distinct, more "alive" space within the app - softened to
a low opacity + heavy blur so it never competes with the actual message
content sitting on top of it. */
.ai-assistant-orb {
  filter: blur(40px);
  opacity: 0.35;
  animation: ai-assistant-orb-drift 14s ease-in-out infinite;
}
.ai-assistant-orb-a {
  background: radial-gradient(circle at 30% 30%, #818cf8, transparent 70%);
}
.ai-assistant-orb-b {
  background: radial-gradient(circle at 70% 70%, #f472b6, transparent 70%);
  animation-delay: -7s;
}
:root.dark .ai-assistant-orb {
  opacity: 0.18;
}
@keyframes ai-assistant-orb-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-6%, 8%) scale(1.15); }
}
@media (prefers-reduced-motion: reduce) {
  .ai-assistant-orb {
    animation: none;
  }
}

/* Header icon buttons (clear/close/mic): a soft tinted hover + a quick
scale-down on press, the same tactile "pressed" feedback most polished UI
chrome buttons give rather than just a background-color swap. */
.ai-assistant-icon-btn {
  transition: background-color 120ms ease, color 120ms ease, transform 100ms ease;
}
.ai-assistant-icon-btn:hover {
  background-color: theme('colors.fc-blue-light');
  color: theme('colors.fc-blue-mid');
}
:root.dark .ai-assistant-icon-btn:hover {
  background-color: rgb(30 95 168 / 0.15);
  color: #93c5fd;
}
.ai-assistant-icon-btn:active {
  transform: scale(0.92);
}
@media (prefers-reduced-motion: reduce) {
  .ai-assistant-icon-btn:active {
    transform: none;
  }
}

/* Avatar badges pop in with a quick overshoot (matching AuditorIcon's own
"alive" character elsewhere in this app) instead of just appearing - the
empty-state's own large badge also gets a slow breathing glow ring so the
panel doesn't feel static while idle. */
.ai-assistant-pop-in {
  opacity: 0;
  animation: ai-assistant-pop-in 420ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes ai-assistant-pop-in {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: scale(1); }
}
.ai-assistant-glow {
  animation: ai-assistant-pop-in 420ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards, ai-assistant-glow-pulse 2.6s ease-in-out 500ms infinite;
}
@keyframes ai-assistant-glow-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgb(30 95 168 / 0.18); }
  50% { box-shadow: 0 0 0 8px rgb(30 95 168 / 0); }
}
@media (prefers-reduced-motion: reduce) {
  .ai-assistant-pop-in,
  .ai-assistant-glow {
    animation: none;
    opacity: 1;
  }
}

/* Each message animates in - a short, understated rise+fade. Only -enter is
used: nothing in this list is ever removed except by clearConversation(),
which empties the array wholesale rather than animating each bubble out. */
.ai-assistant-msg-enter-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.ai-assistant-msg-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
@media (prefers-reduced-motion: reduce) {
  .ai-assistant-msg-enter-active {
    transition: none;
  }
}

/* Empty-state entrance: the greeting text and each starter card fade/rise in
with a short staggered delay (set inline per-card in the template). */
.ai-assistant-fade-in {
  animation: ai-assistant-fade-in 320ms ease both;
}
@keyframes ai-assistant-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .ai-assistant-fade-in {
    animation: none;
  }
}

/* Starter prompt cards lift slightly on hover (translateY + a soft shadow),
on top of the existing tint/border-color change - the same subtle "this is
clickable" affordance card-based pickers in polished chat UIs use instead
of a flat color swap alone. */
.ai-assistant-starter {
  transition: background-color 120ms ease, border-color 120ms ease, transform 150ms ease, box-shadow 150ms ease;
}
.ai-assistant-starter:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px -2px rgb(30 95 168 / 0.15);
}
.ai-assistant-starter:active {
  transform: translateY(0);
  box-shadow: none;
}
@media (prefers-reduced-motion: reduce) {
  .ai-assistant-starter:hover,
  .ai-assistant-starter:active {
    transform: none;
  }
}

/* Input field: a brand-blue glow ring on focus (replacing the plain gray
ring removed from the template's own utility classes) so the active input
state matches this panel's own accent instead of a generic gray focus
ring, plus a quick transition so the glow eases in rather than snapping. */
.ai-assistant-input {
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.ai-assistant-input:focus {
  border-color: theme('colors.fc-blue-mid');
  box-shadow: 0 0 0 3px rgb(30 95 168 / 0.15);
}

/* Send button: a quick lift on hover and press-down on click, the same
tactile feedback the header's icon buttons get - makes the primary action
in the panel feel responsive rather than static. */
.ai-assistant-send-btn {
  transition: transform 100ms ease, box-shadow 150ms ease;
}
.ai-assistant-send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px -2px rgb(30 95 168 / 0.35);
}
.ai-assistant-send-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.95);
}
@media (prefers-reduced-motion: reduce) {
  .ai-assistant-send-btn:hover:not(:disabled),
  .ai-assistant-send-btn:active:not(:disabled) {
    transform: none;
  }
}

/* A slightly narrower, less obtrusive scrollbar for the message list than
the browser default - most polished chat panels do this since the default
scrollbar reads as "generic webpage", not as part of the product's own
chrome. Firefox + WebKit variants both included; falls back silently to
the platform default elsewhere. */
.ai-assistant-panel ::-webkit-scrollbar {
  width: 6px;
}
.ai-assistant-panel ::-webkit-scrollbar-thumb {
  background-color: rgb(0 0 0 / 0.15);
  border-radius: 999px;
}
:root.dark .ai-assistant-panel ::-webkit-scrollbar-thumb {
  background-color: rgb(255 255 255 / 0.15);
}
.ai-assistant-panel * {
  scrollbar-width: thin;
}
</style>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Button, ErrorMessage, FeatherIcon } from 'frappe-ui'
import AuditorIcon from '@/components/AuditorIcon.vue'
import AppTooltip from '@/components/AppTooltip.vue'
import { brandingResource } from '@/data/branding'
import { session } from '@/data/session'
import {
  assistantState,
  assistantConfigResource,
  conversation,
  sendAssistantMessage,
  sending,
  clearConversation,
} from '@/data/aiAssistant'

const messagesRef = ref(null)
const textareaRef = ref(null)
const draft = ref('')
const sendError = ref(null)

const botName = computed(() => assistantConfigResource.data?.bot_name || 'Assistant')
const appTitle = computed(() => brandingResource.data?.app_title || 'Budget & MIS')
const userInitial = computed(() => (session.full_name || session.user || '?').charAt(0).toUpperCase())

// The model's replies routinely use a handful of real markdown features
// (**bold**, "### " headings, "* "/"- " bullet lists - e.g. a budget
// breakdown reply), but this chat only ever rendered plain text wrapped in
// whitespace-pre-wrap, so a heading/list showed its literal "### "/"* "
// markers instead of being formatted - whitespace-pre-wrap only preserves
// raw text layout, it can't turn a line into a real <h3> or <li>. Rather
// than pull in a full markdown library for the handful of block types the
// assistant's own system prompt actually asks it to use, this is a small
// line-based renderer: escapes HTML first (text can never inject markup),
// then walks lines turning consecutive "* "/"- " lines into one <ul>,
// "### " lines into a heading, and everything else into a paragraph -
// **bold** is applied last, within already-escaped text. No whitespace
// -pre-wrap is needed once content is real block-level HTML (see the
// template's own class list for this element).
function renderFormatted(text) {
  const escapeHtml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  const inline = (s) => escapeHtml(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  const lines = String(text ?? '').trim().split('\n')
  const html = []
  let listBuffer = []
  const flushList = () => {
    if (!listBuffer.length) return
    html.push(`<ul class="ml-4 list-disc space-y-0.5">${listBuffer.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`)
    listBuffer = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    const bulletMatch = line.match(/^[*-]\s+(.*)$/)
    const headingMatch = line.match(/^#{1,6}\s+(.*)$/)
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1])
    } else if (headingMatch) {
      flushList()
      html.push(`<p class="mt-2 font-semibold first:mt-0">${inline(headingMatch[1])}</p>`)
    } else if (line) {
      flushList()
      html.push(`<p class="mt-2 first:mt-0">${inline(line)}</p>`)
    } else {
      flushList()
    }
  }
  flushList()
  return html.join('')
}

// A handful of phrases rotated through while waiting on a reply - a single
// static label reads as stuck on a slow multi-tool-call turn (this
// assistant's own loop can take several seconds per tool round trip),
// where a phrase that keeps changing still reads as "working". Finance
// -flavored rather than generic chatbot filler, matching this app's domain.
const THINKING_PHRASES = ['Reviewing the ledger', 'Tallying the numbers', 'Cross-checking budgets', 'Auditing the figures', 'Almost reconciled']
const thinkingIndex = ref(0)
const thinkingText = computed(() => `${THINKING_PHRASES[thinkingIndex.value % THINKING_PHRASES.length]}...`)
let thinkingTimer = null
watch(
  () => sending.loading,
  (loading) => {
    clearInterval(thinkingTimer)
    thinkingTimer = null
    if (loading) {
      thinkingIndex.value = 0
      thinkingTimer = setInterval(() => {
        thinkingIndex.value += 1
      }, 1800)
    }
  },
)
onBeforeUnmount(() => clearInterval(thinkingTimer))

// This app's own domain (budget/actuals/Monthly MIS), not generic chatbot
// filler, so a first-time user sees concretely what's worth asking.
const starterPrompts = [
  { text: 'What is the total approved budget this year?', icon: 'wallet' },
  { text: 'Show Monthly MIS for Health this month', icon: 'bar-chart-2' },
  { text: 'What have we actually spent so far?', icon: 'trending-up' },
  { text: 'How does Education compare to last year?', icon: 'repeat' },
  { text: 'Which areas have the highest % of budget utilised?', icon: 'percent' },
  { text: 'What can I see with my current access?', icon: 'shield' },
]

function useStarterPrompt(prompt) {
  draft.value = prompt
  nextTick(() => {
    textareaRef.value?.focus()
    autoGrow()
  })
}

function autoGrow() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

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

let stickToBottom = true
function isNearBottom(el) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 48
}
function scrollToBottom() {
  const el = messagesRef.value
  if (el) el.scrollTop = el.scrollHeight
}
watch(messagesRef, (el, _old, onCleanup) => {
  if (!el) return
  const handleScroll = () => {
    stickToBottom = isNearBottom(el)
  }
  el.addEventListener('scroll', handleScroll, { passive: true })
  const observer = new ResizeObserver(() => {
    if (stickToBottom) scrollToBottom()
  })
  observer.observe(el)
  for (const child of el.children) observer.observe(child)
  onCleanup(() => {
    el.removeEventListener('scroll', handleScroll)
    observer.disconnect()
  })
})
watch(
  () => conversation.value.length,
  () => {
    stickToBottom = true
    nextTick(scrollToBottom)
  },
)
watch(
  () => sending.loading,
  (loading) => {
    if (loading) {
      stickToBottom = true
      nextTick(scrollToBottom)
    }
  },
)

function handleClear() {
  clearConversation()
  sendError.value = null
}

async function submit() {
  const message = draft.value.trim()
  if (!message || sending.loading) return
  draft.value = ''
  nextTick(autoGrow)
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
