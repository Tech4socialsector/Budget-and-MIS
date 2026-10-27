<template>
  <Dialog v-model="show" :options="{ size: '3xl', title: 'Settings' }">
    <template #body-content>
      <div class="settings-dialog-body flex -m-1">
        <div class="flex w-48 flex-shrink-0 flex-col gap-4 border-r border-outline-gray-1 pr-4">
          <div v-for="group in navGroups" :key="group.label" class="flex flex-col gap-1">
            <div class="px-2 text-xs font-medium uppercase tracking-wide text-ink-gray-4">{{ group.label }}</div>
            <button
              v-for="item in group.items"
              :key="item.key"
              type="button"
              class="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium transition"
              :class="activeTab === item.key
                ? 'bg-surface-gray-2 text-ink-gray-9'
                : 'text-ink-gray-6 hover:bg-surface-gray-1 hover:text-ink-gray-8'"
              @click="activeTab = item.key"
            >
              <LucideIcon :name="item.icon" class="h-4 w-4 flex-shrink-0" />
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="min-w-0 flex-1 pl-5">
          <div v-if="activeTab === 'profile'" class="flex flex-col gap-5">
            <div>
              <h3 class="text-base font-semibold text-ink-gray-9">Profile</h3>
              <p class="mt-0.5 text-sm text-ink-gray-5">How you appear across the app.</p>
            </div>

            <div class="flex items-center gap-3">
              <Avatar :image="avatarUrl" :label="session.full_name || session.user" size="2xl" shape="circle" />
              <div class="min-w-0">
                <div class="truncate text-sm font-medium text-ink-gray-9">{{ session.full_name || session.user }}</div>
                <div class="truncate text-xs text-ink-gray-5">{{ session.user }}</div>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <FormControl label="Full Name" type="text" v-model="fullName" />
              <FormControl label="Email" type="email" v-model="email" />
              <p v-if="email !== session.user" class="-mt-1.5 text-xs text-ink-amber-3">
                Changing your email signs you out of this session - you'll need to log back in with the new address.
              </p>
            </div>

            <ErrorMessage :message="saveError" />
          </div>

          <div v-else-if="activeTab === 'password'" class="flex flex-col gap-5">
            <div>
              <h3 class="text-base font-semibold text-ink-gray-9">Password</h3>
              <p class="mt-0.5 text-sm text-ink-gray-5">Change the password you use to sign in.</p>
            </div>

            <div class="flex flex-col gap-3">
              <FormControl label="Current Password" type="password" v-model="oldPassword" autocomplete="current-password" />
              <FormControl label="New Password" type="password" v-model="newPassword" autocomplete="new-password" />
              <FormControl label="Confirm New Password" type="password" v-model="confirmPassword" autocomplete="new-password" />
            </div>

            <ErrorMessage :message="passwordError" />
          </div>

          <div v-else-if="activeTab === 'language'" class="flex flex-col gap-5">
            <div>
              <h3 class="text-base font-semibold text-ink-gray-9">Language</h3>
              <p class="mt-0.5 text-sm text-ink-gray-5">The language this app's interface is shown in.</p>
            </div>

            <FormControl
              label="Language"
              type="select"
              :options="languageOptions"
              v-model="language"
            />
          </div>

          <div v-else class="max-h-[60vh] overflow-y-auto pr-1">
            <SettingsDoctypePanel doctype="Master Settings" />
          </div>
        </div>
      </div>
    </template>
    <template v-if="activeTab !== 'app-settings'" #actions>
      <div class="flex justify-end gap-2">
        <Button variant="outline" theme="gray" @click="show = false">Cancel</Button>
        <Button variant="solid" theme="gray" :loading="saving" @click="save">Save</Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Avatar, Button, Dialog, ErrorMessage, FormControl, call, toast, useCall } from 'frappe-ui'
import LucideIcon from '@/components/LucideIcon.vue'
import SettingsDoctypePanel from '@/components/SettingsDoctypePanel.vue'
import { session, userLanguageResource, logoutResource } from '@/data/session'
import { appConfigResource } from '@/data/appConfig'
import { useGravatarUrl } from '@/utils/gravatar'

const userEmail = computed(() => session.user)
const gravatarUrl = useGravatarUrl(userEmail)
const avatarUrl = computed(() => session.user_image || gravatarUrl.value)

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const canManageSettings = computed(() => !!appConfigResource.data?.can_manage_settings)

const navGroups = computed(() => {
  const groups = [
    {
      label: 'User Settings',
      items: [
        { key: 'profile', label: 'Profile', icon: 'user' },
        { key: 'password', label: 'Password', icon: 'lock' },
        { key: 'language', label: 'Language', icon: 'languages' },
      ],
    },
  ]
  if (canManageSettings.value) {
    groups.push({
      label: 'Workspace',
      items: [{ key: 'app-settings', label: 'App Settings', icon: 'settings' }],
    })
  }
  return groups
})

const activeTab = ref('profile')

const fullName = ref('')
const email = ref('')
const saving = ref(false)
const saveError = ref(null)

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref(null)

const language = ref('')
const languagesResource = useCall({
  url: '/api/v2/method/frappe.client.get_list',
  method: 'GET',
  params: () => ({
    doctype: 'Language',
    fields: JSON.stringify(['name', 'language_name']),
    order_by: 'language_name asc',
    limit_page_length: 0,
  }),
  cacheKey: 'annual-budget-languages',
  immediate: false,
})
const languageOptions = computed(() => {
  const rows = languagesResource.data || []
  return rows.map((row) => ({ label: row.language_name || row.name, value: row.name }))
})

watch(show, (visible) => {
  if (!visible) return
  activeTab.value = 'profile'
  fullName.value = session.full_name || ''
  email.value = session.user || ''
  language.value = session.user_language || 'en'
  saveError.value = null
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = null
  if (!languagesResource.data) languagesResource.fetch()
  // Nothing else in the app fetches this anymore (it used to be TopNavbar's
  // own onMounted, before Help & Support moved out to a Home tile and that
  // call went with it) - this dialog is the only remaining consumer of
  // can_manage_settings, so it owns fetching it.
  if (!appConfigResource.data) appConfigResource.fetch()
})

async function save() {
  if (activeTab.value === 'password') {
    passwordError.value = null
    if (!oldPassword.value || !newPassword.value) {
      passwordError.value = 'Enter your current and new password.'
      return
    }
    if (newPassword.value !== confirmPassword.value) {
      passwordError.value = "New passwords don't match."
      return
    }

    saving.value = true
    try {
      await call('frappe.core.doctype.user.user.update_password', {
        old_password: oldPassword.value,
        new_password: newPassword.value,
      })
      toast.success('Password updated')
      oldPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } catch (e) {
      passwordError.value = e
    } finally {
      saving.value = false
    }
    return
  }

  if (activeTab.value === 'language') {
    saving.value = true
    saveError.value = null
    try {
      await call('frappe.client.set_value', {
        doctype: 'User',
        name: session.user,
        fieldname: 'language',
        value: language.value,
      })
      session.user_language = language.value
      toast.success('Language updated')
    } catch (e) {
      saveError.value = e
    } finally {
      saving.value = false
    }
    return
  }

  saving.value = true
  saveError.value = null
  try {
    await call('frappe.client.set_value', {
      doctype: 'User',
      name: session.user,
      fieldname: 'full_name',
      value: fullName.value,
    })
    session.full_name = fullName.value
    userLanguageResource.reload()

    // Email change renames the User doc itself (its `name` IS the email) -
    // do this last since it invalidates the current session immediately.
    if (email.value && email.value !== session.user) {
      await call('frappe.client.rename_doc', {
        doctype: 'User',
        old_name: session.user,
        new_name: email.value,
      })
      toast.success('Email updated - please log back in.')
      logoutResource.submit()
      return
    }

    toast.success('Profile updated')
    show.value = false
  } catch (e) {
    saveError.value = e
  } finally {
    saving.value = false
  }
}
</script>
