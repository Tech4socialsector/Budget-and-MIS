<template>
  <span
    ref="triggerRef"
    class="relative inline-flex"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />
    <Teleport to="body">
      <div
        v-if="visible && (text || $slots.content)"
        ref="bubbleRef"
        class="app-tooltip pointer-events-none fixed z-[200] max-w-xs rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-gray-100 dark:text-gray-900"
        :style="bubbleStyle"
        role="tooltip"
      >
        <slot name="content">{{ text }}</slot>
        <span
          class="app-tooltip-arrow absolute h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-100"
          :style="arrowStyle"
        />
      </div>
    </Teleport>
  </span>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  placement: { type: String, default: 'top' }, // top | bottom | left | right
  delay: { type: Number, default: 300 },
  disabled: { type: Boolean, default: false },
})

const triggerRef = ref(null)
const bubbleRef = ref(null)
const visible = ref(false)
const bubbleStyle = ref({})
const arrowStyle = ref({})
let showTimer = null

function computePosition() {
  const trigger = triggerRef.value
  const bubble = bubbleRef.value
  if (!trigger || !bubble) return
  const tRect = trigger.getBoundingClientRect()
  const bRect = bubble.getBoundingClientRect()
  const gap = 8
  let top = 0
  let left = 0

  if (props.placement === 'bottom') {
    top = tRect.bottom + gap
    left = tRect.left + tRect.width / 2 - bRect.width / 2
  } else if (props.placement === 'left') {
    top = tRect.top + tRect.height / 2 - bRect.height / 2
    left = tRect.left - bRect.width - gap
  } else if (props.placement === 'right') {
    top = tRect.top + tRect.height / 2 - bRect.height / 2
    left = tRect.right + gap
  } else {
    top = tRect.top - bRect.height - gap
    left = tRect.left + tRect.width / 2 - bRect.width / 2
  }

  left = Math.max(4, Math.min(left, window.innerWidth - bRect.width - 4))
  top = Math.max(4, Math.min(top, window.innerHeight - bRect.height - 4))

  bubbleStyle.value = { top: `${top}px`, left: `${left}px` }

  const arrowLeft = props.placement === 'top' || props.placement === 'bottom'
    ? Math.max(6, Math.min(tRect.left + tRect.width / 2 - left, bRect.width - 6)) - 4
    : null
  if (props.placement === 'bottom') {
    arrowStyle.value = { top: '-4px', left: `${arrowLeft}px` }
  } else if (props.placement === 'top') {
    arrowStyle.value = { bottom: '-4px', left: `${arrowLeft}px` }
  } else if (props.placement === 'left') {
    arrowStyle.value = { right: '-4px', top: `${bRect.height / 2 - 4}px` }
  } else {
    arrowStyle.value = { left: '-4px', top: `${bRect.height / 2 - 4}px` }
  }
}

function show() {
  if (props.disabled) return
  clearTimeout(showTimer)
  showTimer = setTimeout(async () => {
    visible.value = true
    await nextTick()
    computePosition()
  }, props.delay)
}

function hide() {
  clearTimeout(showTimer)
  visible.value = false
}

onBeforeUnmount(() => clearTimeout(showTimer))
</script>
