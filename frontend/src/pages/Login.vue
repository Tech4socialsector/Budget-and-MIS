<template>
  <div class="flex h-screen flex-col overflow-y-auto bg-white dark:bg-gray-900 lg:flex-row lg:overflow-hidden">
    <!-- Left: hero panel - brand, headline, an illustrative (not literal)
    dashboard mockup built from plain CSS/SVG shapes, and 3 feature
    highlights, mirroring the reference design's structure without
    reproducing its exact artwork. Hidden entirely on small screens (not
    just its content) - the form panel has its own compact logo+name
    header for that case (see the `lg:hidden` block further down), so
    showing this panel too would just be an empty gradient strip with
    nothing in it below `lg` once its own content hides. -->
    <div class="login-panel relative hidden flex-shrink-0 flex-col overflow-hidden bg-gradient-to-br from-fc-blue-light via-white to-fc-blue-light px-6 py-6 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 sm:px-10 sm:py-8 lg:flex lg:w-[56%] lg:justify-between lg:px-16 lg:py-12">
      <!-- Single logo + app name treatment, matching the janadhikara app's
      own login page: one block, no separate repeated "eyebrow" label
      underneath carrying the same name a second time. -->
      <div class="flex items-center gap-4">
        <img :src="brandingResource.data?.app_logo || defaultAppIcon" class="login-logo-in h-10 object-contain sm:h-12 lg:h-14" />
        <span class="login-fade-in login-app-name text-lg tracking-tight text-gray-900 dark:text-gray-100 sm:text-xl lg:text-2xl" style="animation-delay: 80ms">
          {{ brandingResource.data?.app_title || 'Budget & MIS' }}
        </span>
      </div>

      <div class="login-hero-content mt-8 hidden flex-1 flex-col justify-center lg:mt-0 lg:flex lg:flex-none">
        <div class="login-fade-in max-w-md" style="animation-delay: 100ms">
          <h1 class="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            From Budgets to
            <span class="text-fc-blue-mid dark:text-fc-blue-light">Real Impact</span>
          </h1>
          <p class="mt-4 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Plan, track, and analyse budget and actual spending to enable informed decisions for greater impact.
          </p>
        </div>

        <!-- Illustrative dashboard mockup: a browser-chrome card holding a
        simple bar chart + donut built purely from divs/conic-gradient, no
        image asset - animated into view and then gently floating, same
        "ambient, not attention-seeking" philosophy as the existing
        .login-orb treatment below. -->
        <div class="login-mockup login-fade-in relative mt-10 hidden max-w-md lg:block" style="animation-delay: 220ms">
          <div class="overflow-hidden rounded-2xl border border-fc-blue-light bg-white shadow-xl shadow-fc-blue-mid/10 dark:border-gray-800 dark:bg-gray-800">
            <div class="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800/60">
              <span class="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span class="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <span class="ml-2 text-xs font-medium text-gray-400 dark:text-gray-500">Budget vs Actuals</span>
            </div>
            <div class="grid grid-cols-5 gap-4 p-5">
              <div class="col-span-3 flex items-end justify-between gap-2" style="height: 110px">
                <div v-for="(bar, i) in mockBars" :key="i" class="flex h-full flex-1 items-end gap-0.5">
                  <span class="mock-bar flex-1 rounded-sm bg-fc-blue-mid/70" :style="{ height: bar.budget + '%', animationDelay: i * 80 + 'ms' }" />
                  <span class="mock-bar flex-1 rounded-sm bg-orange-400/80" :style="{ height: bar.actual + '%', animationDelay: i * 80 + 40 + 'ms' }" />
                </div>
              </div>
              <div class="col-span-2 flex items-center justify-center">
                <div class="mock-donut h-20 w-20 rounded-full" />
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-700">
              <!-- Illustrative only - deliberately masked (XX.X, not a real
              figure) so this purely decorative mockup is never mistaken for
              an actual budget number on a page that renders before any
              session or real data exists. -->
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-400">Budget</div>
                <div class="login-stat-in text-sm font-semibold text-gray-800 dark:text-gray-100" style="animation-delay: 700ms">₹ XX.X Cr</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-400">Actuals</div>
                <div class="login-stat-in text-sm font-semibold text-gray-800 dark:text-gray-100" style="animation-delay: 780ms">₹ XX.X Cr</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-400">Utilisation</div>
                <div class="login-stat-in text-sm font-semibold text-emerald-600 dark:text-emerald-400" style="animation-delay: 860ms">XX%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature highlights: 3 short items, same role as the reference
        design's icon row - plain FeatherIcon badges, no bespoke icon set.
        Each block fades in on its own stagger (rather than all 3 at once)
        and its icon badge gets a small hover lift + tint, so the row
        reads as a sequence of small reveals rather than a single static
        block appearing. -->
        <div class="mt-10 hidden max-w-md grid-cols-3 gap-4 lg:grid">
          <div
            v-for="(feature, i) in features"
            :key="feature.title"
            class="login-feature-in flex flex-col gap-2"
            :style="{ animationDelay: 320 + i * 90 + 'ms' }"
          >
            <span class="login-feature-icon flex h-9 w-9 items-center justify-center rounded-lg bg-white text-fc-blue-mid shadow-sm transition-all duration-300 dark:bg-gray-800 dark:text-fc-blue-light">
              <FeatherIcon :name="feature.icon" class="h-4.5 w-4.5" />
            </span>
            <div class="text-xs font-semibold text-gray-800 dark:text-gray-100">{{ feature.title }}</div>
            <div class="text-xs leading-snug text-gray-500 dark:text-gray-400">{{ feature.description }}</div>
          </div>
        </div>
      </div>

      <p class="login-fade-in mt-8 hidden text-xs text-gray-400 dark:text-gray-500 lg:block" style="animation-delay: 120ms">
        &copy; {{ new Date().getFullYear() }} {{ brandingResource.data?.app_title || 'Budget & MIS' }} &middot; Version 1.0
      </p>

      <div class="login-orb pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fc-blue-mid/5 lg:-right-24 lg:-top-24 lg:h-72 lg:w-72" />
      <div class="login-orb login-orb-delay pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-fc-blue-mid/5 lg:-bottom-32 lg:-left-16 lg:h-80 lg:w-80" />

      <!-- Ambient floating finance icons: purely decorative, each on its own
      slow drift + fade-in so the hero panel keeps a little life after the
      main entrance animations settle - same "noticed, not stared at"
      philosophy as .login-orb above. Hidden below lg along with the rest
      of the hero content. -->
      <span v-for="(icon, i) in floatingIcons" :key="icon.name" class="login-float-icon pointer-events-none absolute hidden text-fc-blue-mid/15 dark:text-fc-blue-light/10 lg:block" :class="icon.position" :style="{ animationDelay: 400 + i * 260 + 'ms' }">
        <span v-if="icon.glyph" class="text-3xl font-bold leading-none">{{ icon.glyph }}</span>
        <FeatherIcon v-else :name="icon.name" class="h-8 w-8" />
      </span>
    </div>

    <!-- Mobile-only brand band: the hero panel is fully hidden below `lg`,
    so without this the small-screen view opened straight onto a bare white
    page with no brand presence at all. A compact gradient strip (same
    fc-blue tones as the desktop panel) carries the logo/name, a short
    tagline, a row of small finance-themed icon chips (echoing the desktop
    panel's feature-highlight icons), and two decorative orbs, so mobile
    still feels designed rather than like a stripped-down fallback. -->
    <div class="login-panel-mobile relative flex flex-shrink-0 flex-col gap-4 overflow-hidden bg-gradient-to-br from-fc-blue-light via-white to-fc-blue-light px-6 py-6 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 sm:px-10 sm:py-7 lg:hidden">
      <div class="flex items-center gap-3">
        <img :src="brandingResource.data?.app_logo || defaultAppIcon" class="login-logo-in h-9 object-contain sm:h-10" />
        <span class="login-fade-in login-app-name text-base tracking-tight text-gray-900 dark:text-gray-100 sm:text-lg" style="animation-delay: 80ms">
          {{ brandingResource.data?.app_title || 'Budget & MIS' }}
        </span>
      </div>

      <div class="login-fade-in flex items-center gap-2" style="animation-delay: 160ms">
        <span
          v-for="(icon, i) in mobileFinanceIcons"
          :key="icon"
          class="login-feature-icon flex h-8 w-8 items-center justify-center rounded-lg bg-white text-fc-blue-mid shadow-sm dark:bg-gray-800 dark:text-fc-blue-light"
          :style="{ animationDelay: 220 + i * 90 + 'ms' }"
        >
          <FeatherIcon :name="icon" class="h-4 w-4" />
        </span>
        <span class="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">Plan &middot; Track &middot; Analyse</span>
      </div>

      <div class="login-orb pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-fc-blue-mid/10" />
      <div class="login-orb login-orb-delay pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-fc-blue-mid/10" />
    </div>

    <div class="flex flex-1 items-center justify-center bg-gradient-to-br from-fc-blue-light via-white to-fc-blue-light px-6 py-8 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 sm:px-8 sm:py-10">
      <div class="login-form-in w-full max-w-sm">
        <span class="login-welcome-icon mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-fc-blue-light text-fc-blue-mid dark:bg-gray-800 dark:text-fc-blue-light">
          <FeatherIcon name="log-in" class="h-5 w-5" />
        </span>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">Welcome back</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sign in to continue to the {{ brandingResource.data?.app_title || 'Budget & MIS' }} system.
        </p>

        <!-- Step 2: a 2FA-enabled account lands here instead of /home right
        after submitting usr/pwd - twoFactor.verification is set the moment
        loginResource's response carries a tmp_id (see session.js), and
        stays set until confirmOtpResource's own success clears it. -->
        <form
          v-if="twoFactor.verification"
          class="login-form mt-6 flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-lg shadow-gray-200/60 transition-colors dark:bg-gray-900 dark:shadow-none sm:mt-8 sm:p-7"
          :class="[
            shake && 'login-form-shake',
            confirmOtpResource.error ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-800',
          ]"
          @submit.prevent="submitOtp"
          @animationend="shake = false"
        >
          <button
            type="button"
            class="-mb-1 flex items-center gap-1 self-start text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="backToCredentials"
          >
            <FeatherIcon name="arrow-left" class="h-3.5 w-3.5" />
            Back
          </button>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ twoFactor.verification.prompt }}</p>
          <FormControl
            type="text"
            label="Verification code"
            v-model="otp"
            autocomplete="one-time-code"
            inputmode="numeric"
            required
            @update:modelValue="clearOtpError"
          />
          <ErrorMessage :message="confirmOtpResource.error" />
          <Button variant="solid" theme="gray" :loading="confirmOtpResource.loading" type="submit" size="md">
            Verify
          </Button>
          <button
            type="button"
            class="text-xs text-gray-500 hover:text-gray-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
            :disabled="loginResource.loading"
            @click="resendCode"
          >
            Didn't get a code? Resend
          </button>
        </form>

        <form
          v-else
          class="login-form mt-6 flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-lg shadow-gray-200/60 transition-all duration-300 hover:shadow-xl hover:shadow-fc-blue-mid/10 dark:bg-gray-900 dark:shadow-none sm:mt-8 sm:p-7"
          :class="[
            shake && 'login-form-shake',
            loginResource.error ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-800',
          ]"
          @submit.prevent="submit"
          @animationend="shake = false"
        >
          <div class="login-field-in" style="animation-delay: 60ms">
            <FormControl
              type="text"
              label="Email"
              v-model="email"
              autocomplete="username"
              required
              @update:modelValue="clearError"
            >
              <template #prefix>
                <FeatherIcon name="mail" class="h-4 w-4 text-gray-400" />
              </template>
            </FormControl>
          </div>
          <div class="login-field-in" style="animation-delay: 140ms">
            <FormControl
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              v-model="password"
              autocomplete="current-password"
              required
              @update:modelValue="clearError"
            >
              <template #prefix>
                <FeatherIcon name="lock" class="h-4 w-4 text-gray-400" />
              </template>
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
          <Button
            variant="solid"
            theme="gray"
            :loading="loginResource.loading"
            type="submit"
            size="md"
            class="login-submit-btn group !bg-fc-blue-mid hover:!bg-fc-blue-dark"
          >
            <span class="flex items-center justify-center gap-1.5">
              Sign In
              <FeatherIcon name="arrow-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Button>

          <template v-if="ssoProviders.length">
            <div class="flex items-center gap-3">
              <span class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              <span class="text-xs text-gray-400 dark:text-gray-500">or</span>
              <span class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>
            <div class="flex flex-col gap-2">
              <a
                v-for="provider in ssoProviders"
                :key="provider.name"
                :href="provider.auth_url"
                class="login-sso-btn flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-fc-blue-mid/40 hover:bg-fc-blue-light dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <span v-if="provider.icon" class="h-4 w-4 flex-shrink-0" v-html="provider.icon" />
                Sign in with {{ provider.provider_name }}
              </a>
            </div>
          </template>
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
        <Button variant="solid" theme="gray" :loading="resetLoading" class="w-full" @click="submitForgotPassword">
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

/* Logo mark: a quick scale+fade pop, distinct from the plain rise-fade
used everywhere else - it's the very first thing on the page, so it gets
its own slightly more energetic entrance before the rest follows with the
calmer fade-in treatment. */
.login-logo-in {
  opacity: 0;
  animation: login-logo-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* frappe-ui's Tailwind preset bundles its own font-weight into every
text-size utility (text-xl, sm:text-2xl, etc - see its tailwind/plugin.js
fontSize scale), so a plain `font-bold` utility loses to a same-specificity
`text-*` utility that happens to come later in the compiled stylesheet. A
dedicated class sidesteps that cascade-order fight entirely. */
.login-app-name {
  font-weight: 700;
}

@keyframes login-logo-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* Mobile brand band: slides down into place so the small-screen view
doesn't just pop the gradient strip in statically - same entrance beat as
the desktop hero panel's own fade/pop, scaled down for a compact header. */
.login-panel-mobile {
  opacity: 0;
  animation: login-panel-mobile-in 0.5s ease-out forwards;
}

@keyframes login-panel-mobile-in {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
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

/* Ambient background icons: fade in low-opacity, then drift+rotate very
gently forever - same slow, barely-noticeable motion as .login-orb, just
on a FeatherIcon instead of a blurred circle. */
.login-float-icon {
  opacity: 0;
  animation:
    login-float-icon-in 0.8s ease-out forwards,
    login-float-icon-drift 8s ease-in-out 0.8s infinite;
}

@keyframes login-float-icon-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes login-float-icon-drift {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(4px, -10px) rotate(8deg); }
}

/* Welcome icon badge: a quick pop-in matching .login-logo-in's bounce,
then a slow breathing pulse so the login form's own header isn't
completely static next to the hero panel's livelier animation. */
.login-welcome-icon {
  opacity: 0;
  animation:
    login-logo-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    login-welcome-icon-pulse 3s ease-in-out 0.6s infinite;
}

@keyframes login-welcome-icon-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(30, 95, 168, 0.25); }
  50% { box-shadow: 0 0 0 6px rgba(30, 95, 168, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .login-float-icon,
  .login-welcome-icon {
    animation: none;
    opacity: 1;
  }
  .login-fade-in,
  .login-form-in,
  .login-logo-in,
  .login-panel-mobile {
    animation: none;
    opacity: 1;
  }
  .login-orb {
    animation: none;
  }
}

/* Dashboard mockup card: floats gently in place once its own fade-in
settles, same ambient-motion philosophy as .login-orb - a static card
there would read as flat next to the drifting background circles behind
it. */
.login-mockup {
  animation:
    login-fade-in 0.6s ease-out 220ms forwards,
    login-mockup-float 6s ease-in-out 0.8s infinite;
}

@keyframes login-mockup-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* Mock bar chart bars grow up from 0 on mount, staggered per-bar via each
bar's own animation-delay (set inline from mockBars' index) - a quick,
one-time flourish rather than a loop, so the card settles into something
that reads as a real (if illustrative) chart rather than a toy animation
that never stops. */
.mock-bar {
  transform-origin: bottom;
  animation: mock-bar-grow 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes mock-bar-grow {
  from { transform: scaleY(0); opacity: 0; }
  to { transform: scaleY(1); opacity: 1; }
}

/* Mock donut: a conic-gradient ring (no image asset) with a soft one-time
spin-in, echoing the reference design's donut chart without reproducing
its exact proportions/colors. */
.mock-donut {
  background: conic-gradient(
    #1e5fa8 0% 45%,
    #fb923c 45% 70%,
    #e2e8f0 70% 100%
  );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px));
  animation: mock-donut-spin-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
}

@keyframes mock-donut-spin-in {
  from { transform: rotate(-90deg) scale(0.6); opacity: 0; }
  to { transform: rotate(0deg) scale(1); opacity: 1; }
}

/* SSO button: a small lift on hover, matching Button's own hover feel
elsewhere on this page without needing frappe-ui's Button component
itself (this is a plain <a> since the next step is a full-page redirect,
not a submit). */
.login-sso-btn {
  transition: transform 150ms ease, border-color 150ms ease, background-color 150ms ease;
}
.login-sso-btn:hover {
  transform: translateY(-1px);
}

/* Feature blocks: each fades/rises in on its own stagger (animation-delay
set inline per index) rather than appearing together, so the row reads as
a short sequence rather than one static block. */
.login-feature-in {
  opacity: 0;
  animation: login-fade-in 0.5s ease-out forwards;
}

/* Feature icon badge: a small lift + color tint on hover, encouraging a
light "this is interactive-feeling" read even though these 3 blocks are
purely informational - consistent with every other hover surface on this
page having some response. */
.login-feature-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -6px rgb(30 95 168 / 0.35);
}

/* Mockup card's 3 stat numbers: a quick, staggered rise+fade once the
chart itself has settled, rather than appearing instantly with everything
else - a small "and here's the payoff" beat at the end of the card's own
entrance sequence. */
.login-stat-in {
  opacity: 0;
  animation: login-stat-in 0.4s ease-out both;
}

@keyframes login-stat-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Credentials form fields: a quick staggered rise, same rhythm as the
feature blocks, so the form itself doesn't just pop in as one flat block
once .login-form-in's own fade settles. */
.login-field-in {
  opacity: 0;
  animation: login-fade-in 0.45s ease-out forwards;
}

/* Submit button: a small lift + deeper shadow on hover/focus, reinforcing
the same "every interactive surface responds" rhythm as the SSO buttons
and feature icons above. :deep() is required here (unlike every other
rule in this file) because .login-submit-btn is a class handed to
frappe-ui's <Button> component via its `class` prop - Vue's scoped-CSS
attribute only lands on elements authored directly in THIS component's
own template, never on a child component's internally-rendered root, so
a plain scoped `.login-submit-btn:hover` rule would silently never match
anything. */
:deep(.login-submit-btn) {
  transition: transform 150ms ease, box-shadow 150ms ease;
}
:deep(.login-submit-btn:hover) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px -8px rgb(30 95 168 / 0.45);
}
:deep(.login-submit-btn:active) {
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .login-mockup,
  .mock-bar,
  .mock-donut,
  .login-feature-in,
  .login-stat-in,
  .login-field-in {
    animation: none;
    opacity: 1;
  }
  .login-sso-btn:hover,
  .login-feature-icon:hover,
  :deep(.login-submit-btn:hover) {
    transform: none;
    box-shadow: none;
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
import { ref, watch, onMounted } from 'vue'
import { FormControl, Button, ErrorMessage, Dialog, FeatherIcon, call, createResource } from 'frappe-ui'
import { loginResource, confirmOtpResource, twoFactor, resendOtp, cancelTwoFactor } from '@/data/session'
import { brandingResource, defaultAppIcon } from '@/data/branding'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const shake = ref(false)
const otp = ref('')

// Illustrative mockup data for the left panel's dashboard card - plain
// numbers for a bar chart built from divs (see .mock-bar), not real data
// (this page renders before any session/budget data is available at all).
const mockBars = [
  { budget: 55, actual: 40 },
  { budget: 75, actual: 60 },
  { budget: 45, actual: 50 },
  { budget: 90, actual: 65 },
  { budget: 60, actual: 45 },
]

const features = [
  { icon: 'bar-chart-2', title: 'Budget Planning', description: 'Plan and allocate budgets across units and programs.' },
  { icon: 'trending-up', title: 'Actuals Tracking', description: 'Monitor and compare actual spending in real time.' },
  { icon: 'pie-chart', title: 'Reports & Analytics', description: 'Get insights through consolidated reports.' },
]

// Compact finance-themed icon row for the mobile brand band (see
// .login-panel-mobile) - same icon language as `features` above, plus a
// currency glyph, so the small-screen header reads as "finance app" at a
// glance instead of just a logo + name on a plain strip.
const mobileFinanceIcons = ['bar-chart-2', 'trending-up', 'dollar-sign']

// Ambient decorative icons for the desktop hero panel (see .login-float-icon) -
// positioned clear of the headline/mockup/feature content so they only ever
// read as background texture, never competing with real UI. Feather has no
// rupee glyph, so that one entry renders as a styled text character
// (icon.glyph) instead of a FeatherIcon - see the v-if in the template.
const floatingIcons = [
  { name: 'dollar-sign', position: 'right-10 top-24 lg:right-14 lg:top-28' },
  { name: 'pie-chart', position: 'left-2 top-[18%] lg:left-4' },
  { name: 'credit-card', position: 'right-8 bottom-28 lg:right-12 lg:bottom-32' },
  { name: 'rupee', glyph: '₹', position: 'left-4 bottom-20 lg:left-8 lg:bottom-24' },
  { name: 'search', position: 'right-16 top-[42%] lg:right-20' },
  { name: 'activity', position: 'right-4 top-[6%] lg:right-6' },
]

// Invalid credentials should read as a rejection, not a quiet text update -
// shake the form once the failed request settles. Watching .error (rather
// than an onError callback on the shared resource) keeps this purely a
// page-level presentation concern; the resource itself stays a plain
// createResource reusable anywhere else without dragging animation state
// along with it. Covers both the credentials form (loginResource) and the
// OTP form (confirmOtpResource) - whichever is visible owns the shake.
watch(
  () => loginResource.error,
  (error) => {
    if (error) shake.value = true
  },
)
watch(
  () => confirmOtpResource.error,
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

function clearOtpError() {
  confirmOtpResource.error = null
}

function submitOtp() {
  confirmOtpResource.submit({ otp: otp.value.trim() })
}

function backToCredentials() {
  cancelTwoFactor()
  otp.value = ''
}

function resendCode() {
  otp.value = ''
  confirmOtpResource.error = null
  resendOtp(email.value.trim(), password.value.trim())
}

// SSO providers (Social Login Key records with enable_social_login=1 and a
// usable client_id/client_secret/base_url) - fetched once on mount via
// api_1.sso.get_sso_providers (the JSON-API equivalent of frappe/www/
// login.py's own context.provider_logins, which only renders through
// server-side Jinja and isn't callable from this Vue SPA). Each provider's
// auth_url is a ready-to-navigate-to OAuth authorize URL - clicking it is
// a plain link, not a submit, since the next step is a full-page redirect
// to the provider and back.
const ssoProviders = ref([])
const ssoProvidersResource = createResource({
  url: 'budget_mis.api_1.sso.get_sso_providers',
  makeParams: () => ({ redirect_to: '/home' }),
  onSuccess(data) {
    ssoProviders.value = Array.isArray(data) ? data : []
  },
})
onMounted(() => {
  ssoProvidersResource.fetch()
})

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
