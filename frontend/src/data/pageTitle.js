import { ref } from 'vue'

// The current page's title, shown in the top navbar. Pages set this
// themselves via setPageTitle() in their setup().
export const pageTitle = ref('')

export function setPageTitle(title) {
  pageTitle.value = title
}
