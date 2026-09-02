import { ref } from 'vue'

// The module whose sidebar section should currently be shown expanded,
// kept in sync with the user's navigation (e.g. while browsing that
// module's list/form pages).
export const activeModule = ref(null)

export function setActiveModule(mod) {
  activeModule.value = mod
}

export function clearActiveModule() {
  activeModule.value = null
}
