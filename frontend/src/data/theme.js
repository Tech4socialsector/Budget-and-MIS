import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'annual-budget-theme'

export const currentTheme = ref(localStorage.getItem(STORAGE_KEY) || 'light')

watchEffect(() => {
  const isDark = currentTheme.value === 'dark'
  // Two dark-mode conventions need satisfying at once: our own `dark:`
  // Tailwind utility classes key off the `.dark` class (tailwind.config.js
  // darkMode: 'class'), while frappe-ui's own components (Sidebar, Button,
  // Dropdown, ...) key off `[data-theme="dark"]` (its own preset's
  // darkMode). Without both, frappe-ui's built-ins silently never re-theme.
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  localStorage.setItem(STORAGE_KEY, currentTheme.value)
})

export function toggleTheme() {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
}

export function setTheme(value) {
  currentTheme.value = value === 'dark' ? 'dark' : 'light'
}
