<template>
  <Dialog v-model="show" :options="{ size: canManageSettings ? 'xl' : 'md', title: 'Profile Settings' }">
    <template #body-content>
      <div class="flex flex-col gap-5">
        <div v-if="canManageSettings" class="flex gap-1 border-b dark:border-gray-800">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="border-b-2 px-3 py-2 text-sm font-medium transition"
            :class="activeTab === tab.key
              ? 'border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'profile'" class="flex flex-col gap-5">
          <div class="flex items-center gap-3">
            <Avatar :image="session.user_image" :label="session.full_name || session.user" size="2xl" shape="circle" />
            <div class="min-w-0">
              <div class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{{ session.full_name || session.user }}</div>
              <div class="truncate text-xs text-gray-500 dark:text-gray-400">{{ session.user }}</div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <FormControl label="Full Name" type="text" v-model="fullName" />
            <FormControl label="Email" type="email" v-model="email" />
            <p v-if="email !== session.user" class="-mt-1.5 text-xs text-amber-600 dark:text-amber-400">
              Changing your email signs you out of this session - you'll need to log back in with the new address.
            </p>
          </div>

          <ErrorMessage :message="saveError" />

          <div class="border-t pt-4 dark:border-gray-800">
            <button
              type="button"
              class="flex w-full items-center justify-between text-left text-sm font-medium text-gray-900 dark:text-gray-100"
              @click="showPasswordFields = !showPasswordFields"
            >
              Change Password
              <FeatherIcon :name="showPasswordFields ? 'chevron-up' : 'chevron-down'" class="h-4 w-4 text-gray-400" />
            </button>

            <div v-if="showPasswordFields" class="mt-3 flex flex-col gap-3">
              <FormControl label="Current Password" type="password" v-model="oldPassword" autocomplete="current-password" />
              <FormControl label="New Password" type="password" v-model="newPassword" autocomplete="new-password" />
              <FormControl label="Confirm New Password" type="password" v-model="confirmPassword" autocomplete="new-password" />
              <ErrorMessage :message="passwordError" />
            </div>
          </div>
        </div>

        <div v-else class="max-h-[65vh] overflow-y-auto pr-1">
          <SettingsDoctypePanel doctype="Master Settings" />
        </div>
      </div>
    </template>
    <template v-if="activeTab === 'profile'" #actions>
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="show = false">Cancel</Button>
        <Button variant="solid" :loading="saving" @click="save">Save</Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Avatar, Button, Dialog, ErrorMessage, FeatherIcon, FormControl, call, toast } from 'frappe-ui'
import SettingsDoctypePanel from '@/components/SettingsDoctypePanel.vue'
import { session, userLanguageResource, logoutResource } from '@/data/session'
import { appConfigResource } from '@/data/appConfig'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const canManageSettings = computed(() => !!appConfigResource.data?.can_manage_settings)

const tabs = [
  { key: 'profile', label: 'Profile' },
  { key: 'app-settings', label: 'App Settings' },
]
const activeTab = ref('profile')

const fullName = ref('')
const email = ref('')
const saving = ref(false)
const saveError = ref(null)

const showPasswordFields = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref(null)

watch(show, (visible) => {
  if (visible) {
    activeTab.value = 'profile'
    fullName.value = session.full_name || ''
    email.value = session.user || ''
    saveError.value = null
    showPasswordFields.value = false
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordError.value = null
  }
})

async function save() {
  passwordError.value = null
  if (showPasswordFields.value && (oldPassword.value || newPassword.value || confirmPassword.value)) {
    if (!oldPassword.value || !newPassword.value) {
      passwordError.value = 'Enter your current and new password.'
      return
    }
    if (newPassword.value !== confirmPassword.value) {
      passwordError.value = "New passwords don't match."
      return
    }
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

    if (showPasswordFields.value && newPassword.value) {
      await call('frappe.core.doctype.user.user.update_password', {
        old_password: oldPassword.value,
        new_password: newPassword.value,
      })
    }

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
