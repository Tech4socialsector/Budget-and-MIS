<!--
  User Guide - the final design, chosen after comparing several drafts
  (a sidebar switcher, an accordion/FAQ list, a magazine/story scroll, and
  a masonry board - all since removed): a landing grid of topic cards
  (icon + title + one-line summary), one per app page, mirroring Home.vue's
  own module-tile grid. Clicking a card opens that topic's full article
  (screenshot + explanation) at its own real URL (router.js's
  '/user-guide/:topicId?'), with a "Back to guide" link, Next/Previous
  topic navigation (also reachable via Left/Right arrow keys), and a
  right-hand "On this page" rail built from that topic's own sub-headings.

  Content lives in GUIDE_SECTIONS (src/data/userGuideContent.js) - add a
  new entry (icon, one-line summary, and its screenshot under
  frontend/src/assets/user-guide/, cropped to the app's own screen only, no
  browser chrome) for each app page covered.

  Sign-in required, same as every other page in the app - this previously
  had a guest-accessible exception (router.js's GUEST_ROUTES, rendering
  inside a separate GuestLayout shell for a signed-out visitor), removed
  per explicit request so the guide is no longer reachable without logging
  in first.
-->
<template>
  <AppLayout>
    <div ref="guideRoot" class="guide-font w-full">
      <!-- Grid view - every topic as a card, picked at random order? No:
      GUIDE_SECTIONS' own order (About first, then Login/Home/..., matching
      the natural order a new user would move through the app). -->
      <template v-if="!activeSection">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">User Guide</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Pick a topic below to see what it covers and how to use it.</p>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <button
            v-for="section in visibleSections"
            :key="section.id"
            class="group flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            @click="goToTopic(section.id)"
          >
            <span class="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-gray-900 group-hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:group-hover:bg-gray-100 dark:group-hover:text-gray-900">
              <LucideIcon :name="section.icon || 'file-text'" class="h-5 w-5" />
            </span>
            <div>
              <div class="font-semibold text-gray-900 dark:text-gray-100">{{ section.title }}</div>
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ section.summary }}</div>
            </div>
          </button>
        </div>

        <div v-if="!visibleSections.length" class="mt-6 rounded-lg border border-gray-200 bg-white p-16 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          The guide is being written - check back soon.
        </div>
      </template>

      <!-- Article view - one topic, full width, with a right-hand "On
      this page" rail for just THIS topic's own sub-headings (so it always
      stays short, no matter how many topics the guide covers in total). -->
      <template v-else>
        <button
          class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          @click="goToTopic(null)"
        >
          <LucideIcon name="arrow-left" class="h-4 w-4" />
          Back to guide
        </button>

        <div class="mt-5 flex flex-col gap-10 px-0 lg:flex-row lg:items-start lg:gap-16 lg:px-[150px]">
          <div class="min-w-0 flex-1">
            <!-- The exact logo image as given, shown large and centered
            above the title (like a profile page header: photo on top, name
            underneath) rather than a small inline icon+text row - CSS
            rounds it into a circle (object-cover crops to fill that circle
            cleanly, whatever the source image's own aspect ratio is),
            with no separate cropped/processed version of the file itself. -->
            <div v-if="activeSection.brand" class="flex flex-col items-center text-center">
              <img :src="appIconLockup" alt="" class="h-44 w-44 rounded-full object-cover shadow-sm" />
              <h1 class="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{{ activeSection.title }}</h1>
            </div>
            <h1 v-else class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{{ activeSection.title }}</h1>

            <!-- No max-width cap - fills the article's own full width so
            small UI text/icons inside the screenshot are legible rather
            than shrunk down to illustration size. activeSection.image may
            be a function of role context (resolveContent) for a topic
            whose screenshot genuinely differs by role, like Dashboard. -->
            <img
              v-if="resolveContent(activeSection.image)"
              :src="resolveContent(activeSection.image)"
              :alt="activeSection.title"
              class="mt-5 block w-full rounded-md border border-gray-200 dark:border-gray-800"
            />

            <div ref="articleBody" class="guide-prose mt-5" v-html="resolveContent(activeSection.html)"></div>

            <!-- Numbered step dots - every topic as a small clickable
            circle (current one filled/highlighted), flanked by compact
            Previous/Next arrow buttons. Replaces the earlier progress-bar
            + wide-button-pair design: this one doubles as a jump-to-any-
            topic control, not just a one-step-at-a-time Next/Previous. -->
            <div class="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <button
                  class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  :disabled="!previousSection"
                  :aria-label="previousSection ? `Previous: ${previousSection.title}` : 'No previous topic'"
                  @click="previousSection && goToTopic(previousSection.id)"
                >
                  <LucideIcon name="arrow-left" class="h-4 w-4" />
                </button>

                <div class="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-1.5">
                  <button
                    v-for="(section, i) in visibleSections"
                    :key="section.id"
                    class="flex h-2.5 w-2.5 flex-shrink-0 rounded-full transition-all"
                    :class="i === activeIndex
                      ? 'w-6 bg-gray-900 dark:bg-gray-100'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'"
                    :aria-label="section.title"
                    :aria-current="i === activeIndex ? 'step' : undefined"
                    @click="goToTopic(section.id)"
                  />
                </div>

                <button
                  class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                  :disabled="!nextSection"
                  :aria-label="nextSection ? `Next: ${nextSection.title}` : 'No next topic'"
                  @click="nextSection && goToTopic(nextSection.id)"
                >
                  <LucideIcon name="arrow-right" class="h-4 w-4" />
                </button>
              </div>

              <p class="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
                {{ activeIndex + 1 }} of {{ visibleSections.length }}
                <template v-if="nextSection"> &middot; Next: {{ nextSection.title }}</template>
                <template v-else> &middot; You've reached the end of the guide.</template>
              </p>
            </div>
          </div>

          <nav v-if="onThisPage.length" class="order-first shrink-0 lg:sticky lg:top-6 lg:order-last lg:w-48">
            <div class="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">On this page</div>
            <ul class="mt-2 flex flex-col gap-1 border-l border-gray-200 dark:border-gray-800">
              <li v-for="heading in onThisPage" :key="heading.id">
                <a
                  :href="`#${heading.id}`"
                  class="-ml-px block border-l-2 border-transparent px-3 py-1 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-100"
                >
                  {{ heading.text }}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import LucideIcon from '@/components/LucideIcon.vue'
import { setPageTitle } from '@/data/pageTitle'
import { modulesResource } from '@/data/modules'
import { GUIDE_SECTIONS, appIconLockup } from '@/data/userGuideContent'

const props = defineProps({
  // The :topicId route param (router.js's '/user-guide/:topicId?') - a
  // real, bookmarkable/shareable URL per topic (e.g. /user-guide/login)
  // instead of only reachable by clicking a card and holding state purely
  // client-side.
  topicId: { type: String, default: null },
})

setPageTitle('User Guide')
const router = useRouter()
const guideRoot = ref(null)

// modulesResource already fetched by router.js's beforeEach guard before
// this page ever renders (every authenticated route does), so this just
// reads it rather than fetching its own copy.
const allowedModuleNames = computed(() => new Set((modulesResource.data || []).map((m) => m.name)))

// A topic with no moduleName (About, Login, Home, most reports, Help &
// Support) is never gated; one that has a moduleName only shows if the
// viewer's own role-filtered module list (above) actually includes it -
// the same restriction their real Home page tiles already enforce, so a
// restricted viewer can't read about (or type the direct URL to open) a
// module their role doesn't have.
const visibleSections = computed(() => GUIDE_SECTIONS.filter((s) => !s.moduleName || allowedModuleNames.value.has(s.moduleName)))

// Finance Unit Coordinator's own "Dashboard" tile is server-side redirected
// to Budget vs Actual (DASHBOARD_REDIRECT_BY_ROLE in api/modules.py) -
// there's no roles field on the frontend session to check directly (never
// has been, by design - see router.js), so this reads the same already-
// role-filtered modulesResource every other check on this page uses: if
// the "Dashboard" tile's own resolved destination isn't the real Dashboard
// page, the viewer is someone this redirect applies to. Passed into
// section.html(ctx) so the Dashboard topic's own content can describe
// what THIS viewer's tile actually does, not a generic "some roles..." note.
const isDashboardRedirected = computed(() => {
  const mod = (modulesResource.data || []).find((m) => m.name === 'budget_dashboard')
  return mod?.direct?.page_route && mod.direct.page_route !== 'BudgetDashboard'
})
// The viewer's own actual Home page tiles - label and icon exactly as
// get_app_modules returns them (not a hand-kept second copy) - so the Home
// topic's own "modules on the Home page" list can show exactly this
// viewer's real, role-scoped tile set, including a different sort order or
// a shorter/longer list, instead of a single hardcoded list every role sees.
const myModules = computed(() => modulesResource.data || [])

const sectionContext = computed(() => ({
  isDashboardRedirected: isDashboardRedirected.value,
  myModules: myModules.value,
}))

// section.html/section.image may be a plain value (most topics) or a
// function of sectionContext (topics whose content genuinely differs by
// role, like Dashboard) - resolved here once so the template never has to
// know which kind a given topic is.
function resolveContent(value) {
  return typeof value === 'function' ? value(sectionContext.value) : value
}

// Derived from the route param, not its own standalone ref - the URL is
// the single source of truth for which topic is open, so browser back/
// forward and a direct/bookmarked link both just work without extra code.
const activeId = computed(() => props.topicId)
const activeIndex = computed(() => visibleSections.value.findIndex((s) => s.id === activeId.value))
const activeSection = computed(() => visibleSections.value[activeIndex.value] || null)
const previousSection = computed(() => (activeIndex.value > 0 ? visibleSections.value[activeIndex.value - 1] : null))
const nextSection = computed(() => (
  activeIndex.value >= 0 && activeIndex.value < visibleSections.value.length - 1
    ? visibleSections.value[activeIndex.value + 1]
    : null
))

// Navigates to a topic (or back to the grid, for null) via a real route
// change rather than local state - every card/Next/Previous/Back click
// goes through this one function so the URL always stays in sync with
// what's shown.
function goToTopic(id) {
  router.push(id ? { name: 'UserGuide', params: { topicId: id } } : { name: 'UserGuide' })
  // Clicking Previous/Next or a step dot happens from wherever the reader
  // currently is on the page (often scrolled down near these controls at
  // the bottom) - without this, the new topic silently loads already
  // scrolled past its own title, looking like nothing happened. AppLayout's
  // own <main> is the actual scrolling element (overflow-y-auto), not
  // window, so window.scrollTo would be a no-op here - walk up from this
  // component's own root to find it instead.
  const scrollParent = guideRoot.value?.closest('main')
  scrollParent?.scrollTo({ top: 0, behavior: 'smooth' })
}

// Left/Right arrow keys move between topics while the article view is
// open - ignored while the grid is showing (activeSection is null) and
// while focus is in a text input/textarea, so this never hijacks normal
// text editing or search elsewhere on the page.
function handleKeydown(e) {
  if (!activeSection.value) return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.key === 'ArrowRight' && nextSection.value) goToTopic(nextSection.value.id)
  if (e.key === 'ArrowLeft' && previousSection.value) goToTopic(previousSection.value.id)
}
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

// Reads the active topic's own rendered <h3> sub-headings for the
// right-rail TOC, rather than keeping a second hand-written copy of them in
// userGuideContent.js that could drift out of sync with the real markup.
const articleBody = ref(null)
const onThisPage = ref([])
watch(activeId, async () => {
  onThisPage.value = []
  if (!activeId.value) return
  await nextTick()
  const headings = articleBody.value?.querySelectorAll('h3') || []
  onThisPage.value = Array.from(headings).map((h, i) => {
    if (!h.id) h.id = `${activeId.value}-heading-${i}`
    return { id: h.id, text: h.textContent }
  })
}, { immediate: true })
</script>

<style scoped>
/* The rest of the app never sets a font-family (falls back to the OS/
browser default system stack) - Inter specifically for this one guide page
(title, cards, "On this page" rail, and prose body alike), since long-form
reading benefits from a typeface designed for it more than UI chrome does,
without changing the look of every other page in the app. Loaded via
Google Fonts (index.html's own <link>, not an @import here - avoids a
render-blocking in-component fetch), with the system stack as an
immediate-render fallback. */
.guide-font {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
}

/* Hand-written in place of a Tailwind typography plugin (not installed in
this project) - a docs-standard scale/rhythm for the v-html article body:
15px base (in-app documentation density, not marketing/blog scale) with
1.7 line-height for comfortable reading, a distinct <h3> step down from the
page's own <h1>, and list markers/spacing that read as real prose rather
than cramped UI copy. */
.guide-prose :deep(p) {
  margin-top: 1em;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: theme('colors.gray.700');
}
.guide-prose :deep(p:first-child) {
  margin-top: 0;
}
.guide-prose :deep(h3) {
  margin-top: 1.75em;
  margin-bottom: 0.5em;
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: theme('colors.gray.900');
}
.guide-prose :deep(ul) {
  margin-top: 1em;
  padding-left: 1.3em;
  list-style: disc;
}
.guide-prose :deep(li) {
  margin-top: 0.4em;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: theme('colors.gray.700');
}
/* A bullet whose first child is an icon SVG (added via the icon() helper
in userGuideContent.js) drops its disc marker and floats the icon as its
own visual bullet instead - list-style:none only on THIS li (not the
whole <ul>), so a plain bullet with no icon keeps its normal disc marker.
float (not display:flex) - the icon's sibling content is multiple separate
inline nodes (a <strong> title, then a plain text node), not one single
wrapped element; flex would lay those out as separate side-by-side flex
items instead of one flowing, wrapping paragraph next to the icon, which
is what float naturally gives for free. */
.guide-prose :deep(li:has(> svg.guide-icon)) {
  list-style: none;
  margin-left: -1.3em;
}
.guide-prose :deep(.guide-icon) {
  float: left;
  width: 1.1em;
  height: 1.1em;
  margin-top: 0.3em;
  margin-right: 0.5em;
  color: theme('colors.gray.400');
}
/* No max-width cap - fills the article's own full width, matching the
hero screenshot's own sizing above. */
.guide-prose :deep(.guide-inline-image) {
  display: block;
  width: 100%;
  margin-top: 0.75em;
  margin-bottom: 1.25em;
  border-radius: 0.375rem;
  border: 1px solid theme('colors.gray.200');
}
.guide-prose :deep(li::marker) {
  color: theme('colors.gray.400');
}
.guide-prose :deep(strong) {
  font-weight: 600;
  color: theme('colors.gray.900');
}
/* :global(.dark) .guide-prose :deep(x) silently drops everything after
:global() during Vue's scoped-CSS compile (it only correctly unscopes a
single simple selector, not a whole chain mixed with :deep()) - this
compiled down to a bare, over-broad ".dark { color }" that never matched
these elements, leaving dark-mode text an unreadably faint default color.
.dark .guide-prose :deep(x) - a PLAIN (unwrapped) .dark ancestor selector,
with only the actual descendant inside :deep() - compiles correctly: the
scoped attribute lands on .guide-prose (an element this component really
renders), while .dark stays an ordinary, unscoped selector matching the
global .dark class on <html>. Verified against the real compiled CSS, not
assumed. */
.dark .guide-prose :deep(p),
.dark .guide-prose :deep(li) {
  color: theme('colors.gray.300');
}
.dark .guide-prose :deep(h3),
.dark .guide-prose :deep(strong) {
  color: theme('colors.gray.100');
}
.dark .guide-prose :deep(.guide-icon) {
  color: theme('colors.gray.500');
}
.dark .guide-prose :deep(.guide-inline-image) {
  border-color: theme('colors.gray.800');
}
</style>
