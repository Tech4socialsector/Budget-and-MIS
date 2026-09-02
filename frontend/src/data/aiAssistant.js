import { reactive, ref } from 'vue'
import { useCall } from 'frappe-ui'

export const assistantState = reactive({ visible: false })
export function toggleAssistant() {
  assistantState.visible = !assistantState.visible
}

export const assistantConfigResource = useCall({
  url: '/api/v2/method/annual_budget.ai.assistant.get_assistant_config',
  method: 'GET',
  cacheKey: 'annual-budget-ai-assistant-config',
})

export const conversation = ref([])

const sendMessageCall = useCall({
  url: '/api/v2/method/annual_budget.ai.assistant.send_message',
  method: 'POST',
  immediate: false,
})

export async function sendAssistantMessage(message) {
  const result = await sendMessageCall.submit({ messages: conversation.value, message })
  conversation.value = result.messages
  return result
}

export const sending = sendMessageCall

export function clearConversation() {
  conversation.value = []
}
