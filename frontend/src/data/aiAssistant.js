import { reactive, ref } from 'vue'
import { useCall } from 'frappe-ui'

export const assistantState = reactive({ visible: false })
export function toggleAssistant() {
  assistantState.visible = !assistantState.visible
}

export const assistantConfigResource = useCall({
  url: '/api/v2/method/budget_mis.ai.assistant.get_assistant_config',
  method: 'GET',
  cacheKey: 'annual-budget-ai-assistant-config',
})

export const conversation = ref([])

const sendMessageCall = useCall({
  url: '/api/v2/method/budget_mis.ai.assistant.send_message',
  method: 'POST',
  immediate: false,
})

export async function sendAssistantMessage(message) {
  // Shows the user's own message in the chat THE MOMENT they hit send,
  // rather than waiting for the full round trip (which includes the
  // model's own think time + any tool calls, often several seconds) to
  // resolve before anything appears - previously both the user bubble and
  // the bot's reply only ever appeared together, at the very end, making
  // it look like nothing happened for seconds after sending. The request
  // itself still replays the PRE-optimistic history (conversation.value
  // read before this push), matching exactly what the backend will itself
  // append the new user message onto - sending the optimistic copy to the
  // backend would double it up.
  const priorMessages = conversation.value
  conversation.value = [...priorMessages, { role: 'user', content: message }]

  const result = await sendMessageCall.submit({ messages: priorMessages, message })
  conversation.value = result.messages
  return result
}

export const sending = sendMessageCall

export function clearConversation() {
  conversation.value = []
}
