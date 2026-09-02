<template>
  <div class="flex h-screen flex-col bg-white dark:bg-gray-900 lg:flex-row">
    <div class="login-panel relative flex flex-shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-900 to-blue-600 p-6 text-white sm:p-8 lg:w-1/2 lg:justify-between lg:p-12">
      <div class="login-fade-in flex items-center gap-3" style="animation-delay: 0ms">
        <span class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/10 p-3 backdrop-blur">
          <img :src="brandingResource.data?.app_logo || defaultAppLogo" class="h-full w-full object-contain" />
        </span>
        <span class="text-xl font-semibold">{{ brandingResource.data?.app_title || 'Annual Budget MIS' }}</span>
      </div>

      <div class="login-fade-in mt-6 max-w-sm lg:mt-0" style="animation-delay: 120ms">
        <h2 class="text-xl font-semibold leading-tight sm:text-2xl lg:text-3xl">
          Plan, track, and report your annual budget in one place.
        </h2>
      </div>

      <p class="login-fade-in mt-6 hidden text-xs text-white/50 lg:mt-0 lg:block" style="animation-delay: 220ms">
        &copy; {{ new Date().getFullYear() }} {{ brandingResource.data?.app_title || 'Annual Budget MIS' }}
      </p>

      <div class="login-orb pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/5 lg:-right-24 lg:-top-24 lg:h-72 lg:w-72" />
      <div class="login-orb login-orb-delay pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-white/5 lg:-bottom-32 lg:-left-16 lg:h-80 lg:w-80" />
    </div>

    <div class="flex flex-1 items-center justify-center overflow-y-auto bg-gray-50 px-6 py-8 dark:bg-gray-900 sm:px-8">
      <div class="login-form-in w-full max-w-sm">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">Welcome back</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Log in to continue to your dashboard.</p>

        <form
          class="login-form mt-6 flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-lg shadow-gray-200/60 transition-colors dark:bg-gray-900 dark:shadow-none sm:mt-8 sm:p-7"
          :class="[
            shake && 'login-form-shake',
            loginResource.error ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-800',
          ]"
          @submit.prevent="submit"
          @animationend="shake = false"
        >
          <FormControl
            type="text"
            label="Email"
            v-model="email"
            autocomplete="username"
            required
            @update:modelValue="clearError"
          />
          <div>
            <FormControl
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              v-model="password"
              autocomplete="current-password"
              required
              @update:modelValue="clearError"
            >
              <template #suffix>
                <button
                  type="button"
                  tabindex="-1"
                  class="flex h-full items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  @click="showPassword = !showPassword"
                >
                  <FeatherIcon :name="showPassword ? 'eye-off' : 'eye'" class="h-4 w-4" />
                </button>
              </template>
            </FormControl>
            <button
              type="button"
              class="mt-1.5 text-xs text-gray-500 hover:text-gray-700 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
              @click="openForgotPassword"
            >
              Forgot password?
            </button>
          </div>
          <ErrorMessage :message="loginResource.error" />
          <Button variant="solid" :loading="loginResource.loading" type="submit" size="lg">
            Log in
          </Button>
        </form>
      </div>
    </div>

    <Dialog v-model="showForgotPassword" :options="{ title: 'Reset Password' }">
      <template #body-content>
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <FormControl
          type="text"
          label="Email"
          v-model="resetEmail"
          autocomplete="username"
          required
        />
        <ErrorMessage class="mt-3" :message="resetError" />
        <p v-if="resetSent" class="mt-3 text-sm text-green-600 dark:text-green-400">
          If that email is registered with us, a reset link is on its way. Please check your inbox.
        </p>
      </template>
      <template #actions>
        <Button variant="solid" :loading="resetLoading" class="w-full" @click="submitForgotPassword">
          Send reset link
        </Button>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Subtle, professional entrance - no bounce/scale theatrics, just a soft
staggered fade+rise so the screen doesn't feel static on first paint. */
.login-fade-in {
  opacity: 0;
  animation: login-fade-in 0.6s ease-out forwards;
}

.login-form-in {
  opacity: 0;
  animation: login-fade-in 0.6s ease-out 0.15s forwards;
}

@keyframes login-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* The two decorative circles drift very slowly - purely ambient, not
meant to be consciously noticed. */
.login-orb {
  animation: login-orb-drift 10s ease-in-out infinite;
}
.login-orb-delay {
  animation-delay: -5s;
}

@keyframes login-orb-drift {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-2%, 3%) scale(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-fade-in,
  .login-form-in {
    animation: none;
    opacity: 1;
  }
  .login-orb {
    animation: none;
  }
}

/* Invalid-credentials feedback: a short horizontal shake plus a
momentary red border, so a failed login reads as a rejection instead of
silently updating some small text below the button. */
.login-form-shake {
  animation: login-form-shake 0.4s ease-in-out;
}

@keyframes login-form-shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}

@media (prefers-reduced-motion: reduce) {
  .login-form-shake {
    animation: none;
  }
}
</style>

<script setup>
import { ref, watch } from 'vue'
import { FormControl, Button, ErrorMessage, Dialog, FeatherIcon, call } from 'frappe-ui'
import { loginResource } from '@/data/session'
import { brandingResource, defaultAppLogo } from '@/data/branding'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const shake = ref(false)

// Invalid credentials should read as a rejection, not a quiet text update -
// shake the form once the failed request settles. Watching .error (rather
// than an onError callback on the shared resource) keeps this purely a
// page-level presentation concern; the resource itself stays a plain
// createResource reusable anywhere else without dragging animation state
// along with it.
watch(
  () => loginResource.error,
  (error) => {
    if (error) shake.value = true
  },
)

function clearError() {
  loginResource.error = null
}

// Trimmed only at submit time, not on every keystroke via v-model - a
// pasted credential often carries a stray leading/trailing space (copied
// from an email, a chat message, a password manager's clipboard entry),
// which Frappe's login compares byte-for-byte and silently rejects as
// wrong. Trimming while typing would be actively wrong instead: it'd fight
// a user who legitimately types a trailing space mid-edit. Only the outer
// whitespace is stripped either way - a real space in the middle of an
// email local-part or password stays intact.
function submit() {
  loginResource.submit({ email: email.value.trim(), password: password.value.trim() })
}

const showForgotPassword = ref(false)
const resetEmail = ref('')
const resetError = ref(null)
const resetSent = ref(false)
const resetLoading = ref(false)

function openForgotPassword() {
  resetEmail.value = email.value
  resetError.value = null
  resetSent.value = false
  showForgotPassword.value = true
}

async function submitForgotPassword() {
  const user = resetEmail.value.trim()
  if (!user) return
  resetLoading.value = true
  resetError.value = null
  resetSent.value = false
  try {
    await call('frappe.core.doctype.user.user.reset_password', { user })
    resetSent.value = true
  } catch (e) {
    resetError.value = e
  } finally {
    resetLoading.value = false
  }
}
</script>
