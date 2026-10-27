import { ref } from 'vue'

// Shared so both TopNavbar.vue (always mounted) and AppSidebar.vue's own
// footer dropdown (only mounted when a module is open) can open the same
// single ProfileSettingsModal instance - TopNavbar.vue owns the actual
// <ProfileSettingsModal> in its template since it's the one guaranteed to
// always be mounted.
export const profileModalOpen = ref(false)

export function openProfileSettings() {
  profileModalOpen.value = true
}
