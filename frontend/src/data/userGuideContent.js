// User Guide content - one entry per app page, rendered by UserGuide.vue in
// this exact order. Add a new entry here (plus its screenshot, saved under
// frontend/src/assets/user-guide/<id>.png) each time a new page is covered.
//
// Screenshots are imported (not referenced by a public/ string path) so
// Vite fingerprints each one into a content-hashed URL at build time - a
// replaced screenshot gets a brand new URL automatically, so browsers can
// never serve a stale cached copy of an old screenshot under the same path
// the way a plain '/user-guide/x.png' string reference could.
//
// `html` is plain static markup written by us, never user input - inserted
// via v-html purely to allow simple formatting (bold, lists) in the
// explanation text.
//
// A section whose real Home-page tile is role-restricted (App Module
// Setting's restrict_by_role) sets `moduleName` to that record's own name
// (e.g. 'erp_actuals') - UserGuide.vue filters it out of the board, and
// blocks direct URL access to it, for a viewer whose role doesn't actually
// have that module, matching what their own Home page tiles already show.
// A section with no `moduleName` (About, Login, Home, most reports, Help &
// Support) is never gated this way and always shows for every signed-in
// viewer.
import loginImage from '@/assets/user-guide/login.png'
import loginVerifyImage from '@/assets/user-guide/login-verify.png'
import resetPasswordImage from '@/assets/user-guide/reset-password.png'
import homeImage from '@/assets/user-guide/home.png'
import homeFucImage from '@/assets/user-guide/home-fuc.png'
import dashboardImage from '@/assets/user-guide/dashboard.png'
import dashboardFucImage from '@/assets/user-guide/dashboard-fuc.png'
import dashboardChartsImage from '@/assets/user-guide/dashboard-charts.png'
import dashboardWorkPlanViewsImage from '@/assets/user-guide/dashboard-work-plan-views.png'
import dashboardBudgetVsActualsBreakdownImage from '@/assets/user-guide/dashboard-budget-vs-actuals-breakdown.png'
import budgetVsActualImage from '@/assets/user-guide/budget-vs-actual.png'
import budgetVsActualDrilldownImage from '@/assets/user-guide/budget-vs-actual-drilldown.png'
import budgetVsActualGlCodesImage from '@/assets/user-guide/budget-vs-actual-gl-codes.png'
import budgetVsActualTableImage from '@/assets/user-guide/budget-vs-actual-table.png'
import budgetSummaryImage from '@/assets/user-guide/budget-summary.png'
import budgetSummaryExpandedImage from '@/assets/user-guide/budget-summary-expanded.png'
import budgetSummaryDrilldownImage from '@/assets/user-guide/budget-summary-drilldown.png'
import monthlyMisOpexImage from '@/assets/user-guide/monthly-mis-opex.png'
import monthlyMisCapexOverallImage from '@/assets/user-guide/monthly-mis-capex-overall.png'
import monthlyMisEducationImage from '@/assets/user-guide/monthly-mis-education.png'
import monthlyMisHealthLivelihoodsImage from '@/assets/user-guide/monthly-mis-health-livelihoods.png'
import monthlyMisUniversityImage from '@/assets/user-guide/monthly-mis-university.png'
import monthlyMisEnablersBreakdownImage from '@/assets/user-guide/monthly-mis-enablers-breakdown.png'
import monthlyMisBreakdownGridImage from '@/assets/user-guide/monthly-mis-breakdown-grid.png'
import budgetImportTemplateImage from '@/assets/user-guide/budget-import-template.png'
import budgetImportTemplateReviewImage from '@/assets/user-guide/budget-import-template-review.png'

// The exact logo+"Budget & MIS" wordmark image (not a separately-rendered
// icon component + text span) shown wherever a `brand: true` section's
// header is rendered across all four guide page designs - small, natural
// size, never stretched.
export { default as appIconLockup } from '@/assets/user-guide/app-icon-lockup.png'

// Generates a small inline SVG for a lucide icon, usable directly inside
// an `html` template string (e.g. `${icon('search')}`) - LucideIcon.vue
// itself can't be used here since `html` is plain markup rendered via
// v-html, not a real Vue template. Same stroke style (currentColor,
// 2px, round caps/joins) as LucideIcon.vue, so an icon dropped into a
// bullet point looks identical to one rendered through the component
// elsewhere in the app, just inline with the bullet's own text color.
import iconNodes from 'lucide-static/icon-nodes.json'
export function icon(name) {
  const children = iconNodes[name]
  if (!children) return ''
  const inner = children.map(([tag, attrs]) => {
    const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
    return `<${tag} ${attrStr}/>`
  }).join('')
  return `<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
}

export const GUIDE_SECTIONS = [
  {
    id: 'about',
    title: 'Budget & MIS',
    icon: 'book-open',
    summary: 'What this app is and who it\'s for.',
    brand: true,
    html: `
      <p><strong>Budget &amp; MIS</strong> is the Azim Premji Foundation's app for planning budgets, tracking spending, and seeing reports - all in one place. Before this app, people tracked budgets in separate spreadsheets, with different copies floating around and no single correct version. Now everyone - budget owners, finance teams, and leadership - looks at the same numbers, built from the same data, at the same time.</p>

      <h3>What you can do here</h3>
      <ul>
        <li>${icon('wallet')}<strong>Plan budgets</strong> - set budgets for each unit, cost center, and program, and keep track of changes as the year goes on. Finance enters budgets for the whole Foundation in one place, so every unit always sees the same, up-to-date plan - not an older copy someone forgot to update.</li>
        <li>${icon('trending-up')}<strong>Track actual spending</strong> - see how much has actually been spent compared to what was planned, right down to the exact expense and account. Spending data comes in automatically from the Foundation's ERP system - you never need to upload or enter it yourself, and the numbers are always current.</li>
        <li>${icon('chart-column')}<strong>View reports</strong> - see Foundation Consolidated, Monthly MIS, and Budget vs Actuals reports, useful for a quick daily check or a full board presentation. You can start from a big total and click down to see the small details behind it, all the way to a single transaction.</li>
        <li>${icon('git-compare')}<strong>Check for mistakes</strong> - Combination Reconciliation makes sure budget and spending data line up correctly with the unit, cost center, and location they belong to, so errors are caught early, before they quietly throw off a report.</li>
        <li>${icon('upload')}<strong>Bring data in</strong> - Budget Import Template and Budget Import let the right people load budget figures into the app in bulk, instead of typing each one in by hand.</li>
      </ul>

      <h3>How the numbers get here</h3>
      <p>It helps to know where the two halves of every report actually come from, since they don't arrive the same way:</p>
      <ul>
        <li>${icon('wallet')}<strong>Budgets</strong> are entered by Finance, centrally, using the Budget Import tools in this app. A unit never types its own budget directly into the system - Finance brings it in on everyone's behalf, so there's only ever one real, current version of the plan.</li>
        <li>${icon('database')}<strong>Actuals</strong> (what's actually been spent) come in on their own, automatically, straight from the Foundation's PeopleSoft ERP system. Nobody uploads or enters this data by hand, and it's never stale - every report reflects real, live spending as of the last sync.</li>
      </ul>
      <p>Every report in this app is really just these two things - a budget, and the actual spend against it - shown side by side, sliced in different ways (by unit, by time, by expense type) depending on which page you're looking at.</p>

      <h3>Who it's for</h3>
      <p>Finance teams, unit and program budget owners, and anyone who tracks spending against a plan. What you see depends on your role, not on anything you have to set up yourself:</p>
      <ul>
        <li>${icon('shield')}A <strong>Finance Unit Coordinator</strong> only sees their own unit's numbers - their Home page has fewer tiles, and the reports they open are automatically scoped down to their unit.</li>
        <li>${icon('shield')}<strong>Finance and Admin</strong> staff see everything across the whole Foundation, with extra tools (like Data Import and Settings &amp; Master Data) that most other roles never see at all.</li>
      </ul>
      <p>So two people can open the exact same report and see genuinely different things, or one person might not even see a tile the other has - that's the system working as intended, not a mistake or a bug to report.</p>

      <h3>How this guide is organized</h3>
      <p>Each section below covers one page of the app - what it shows and how to use it - in the order you'd naturally go through the app: signing in first, then the Home screen, then each report and tool in turn. Screenshots and instructions on each page adjust to match your own role wherever that matters, the same way the real app does. Use the <strong>"On this page"</strong> list on the right to jump straight to any section without scrolling, or the dots at the bottom of each page to move between sections.</p>
    `,
  },
  {
    id: 'login',
    title: 'Login',
    icon: 'log-in',
    summary: 'Signing in with email/password or Office 365.',
    image: loginImage,
    html: `
      <p>This is the first screen you see when you open the app - a plain sign-in form. Nothing scoped to your role happens here yet; that's worked out only after you're actually signed in, based on the roles your account has been given.</p>

      <h3>Step 1 - Enter your details</h3>
      <ul>
        <li>${icon('mail')}Type your <strong>Email</strong> into the first field - this is your full email address, the same one Finance or IT set up your account with.</li>
        <li>${icon('lock')}Type your <strong>Password</strong> into the second field. Click the small eye icon inside that field at any time to reveal what you've typed, in case you want to double-check it before submitting - it's hidden again by default.</li>
        <li>${icon('triangle-alert')}If either field is left blank, the form won't let you submit - fill in both before continuing.</li>
      </ul>

      <h3>Step 2 - Submit</h3>
      <p>Click the <strong>Sign In</strong> button. If your email and password are correct, you'll move on to the next step (if your account needs a verification code - see below) or straight into the app. If something's wrong, the form shakes briefly and shows an error message just above the button - check that your email and password are both typed correctly (caps lock is a common culprit) and try again.</p>

      <h3>Signing in with Office 365 instead</h3>
      <p>If your organization has this set up, you'll see a <strong>"Sign in with Office 365"</strong> button below the Sign In button (separated by a thin "or" divider). Click it instead of typing a password - you'll be taken to Microsoft's own sign-in page, and brought back into the app automatically once you've signed in there. This option only appears if your account is set up for it; if you don't see it, use your email and password instead.</p>

      <h3>If you're asked for a verification code</h3>
      <p>Depending on how your account is set up, after you submit your email and password you may be taken to a second screen asking for a one-time verification code, instead of going straight into the app.</p>
      <ul>
        <li>${icon('mail')}A code has already been sent to your registered email address by the time this screen appears - check your inbox for it.</li>
        <li>${icon('key-round')}Type the code into the <strong>Verification code</strong> field and click <strong>Verify</strong> to finish signing in.</li>
        <li>${icon('arrow-left')}If you typed the wrong email or password on the previous screen, click <strong>Back</strong> (top-left of this form) to return and correct it, rather than trying to push through with a code that won't match.</li>
        <li>${icon('refresh-cw')}If the email never arrives, click <strong>"Didn't get a code? Resend"</strong> below the Verify button to have a new one sent.</li>
      </ul>
      <img src="${loginVerifyImage}" alt="Verification code screen" class="guide-inline-image" />

      <h3>Resetting a forgotten password</h3>
      <ul>
        <li>${icon('mouse-pointer-click')}On the sign-in form, click <strong>"Forgot password?"</strong>, which sits just below the Password field.</li>
        <li>${icon('mail')}A "Reset Password" box opens on top of the page. Your email is filled in automatically if you'd already typed it; otherwise, enter it yourself.</li>
        <li>${icon('mouse-pointer-click')}Click <strong>Send reset link</strong>. A confirmation message appears on the same box, letting you know a reset link is on its way - check your inbox and follow the link to set a new password.</li>
      </ul>
      <img src="${resetPasswordImage}" alt="Reset password dialog" class="guide-inline-image" />

      <h3>After you sign in</h3>
      <p>You'll land on the <strong>Home</strong> page by default (see the next section) - or, if you followed a direct link to a specific report, you'll go straight there instead. What you see from this point on - which tiles, which reports, which data - depends on your role, so two people signing in with different accounts may see genuinely different things.</p>
    `,
  },
  {
    id: 'home',
    title: 'Home',
    icon: 'house',
    summary: 'Your landing page and every module tile.',
    // Role-aware, same as the module list in html() below - a Finance
    // Unit Coordinator's own Home page genuinely only has 8 tiles, so
    // their screenshot here shows that, not the admin's full 13-tile grid.
    image: ({ isDashboardRedirected }) => (isDashboardRedirected ? homeFucImage : homeImage),
    // The module list below is built from the viewer's own real, role-
    // scoped tile set (myModules in sectionContext, sourced from
    // get_app_modules - the exact same data Home.vue itself renders),
    // rather than one hardcoded list every role was shown regardless of
    // what tiles they actually have. See "Opening a module" below for why
    // this matters: a Finance Unit Coordinator's own list here is
    // genuinely shorter than an admin's.
    html: ({ myModules }) => `
      <p>The Home page is the landing screen after you sign in - a personalized greeting at the top, followed by a grid of tiles, one per module you have access to. Think of it as your own starting point into the app, scoped to what your role actually needs.</p>

      <h3>Your modules on the Home page</h3>
      <p>This is the exact list your own account currently sees, in the order it appears on your Home page:</p>
      <ul>
        ${myModules.map((m) => `<li>${icon(m.icon || 'file-text')}${m.label}</li>`).join('')}
      </ul>

      <h3>Opening a module</h3>
      <ul>
        <li>${icon('mouse-pointer-click')}<strong>Click any tile</strong> to open that module. Most tiles take you straight to a report or page; a few, like <strong>Settings &amp; Master Data</strong>, open a sidebar of related records instead of a single page.</li>
        <li>${icon('shield')}You only see tiles for modules your role has access to. This isn't the same list for everyone - the list above is specific to your account, and a colleague with a different role may see a shorter or longer set of tiles, in a different order.</li>
        <li>${icon('arrow-up-down')}Tiles are ordered deliberately, roughly from the most commonly used reports toward more occasional setup tools, rather than alphabetically - so a tile near the start is generally one you'd reach for daily, and one further along is more of an occasional admin task.</li>
        <li>${icon('arrow-left')}Clicking the <strong>Home</strong> icon or the app's own logo/name in the top-left corner, from anywhere in the app, brings you straight back to this page.</li>
      </ul>

      <h3>The greeting</h3>
      <p>"Good morning / afternoon / evening" at the top changes with the time of day, followed by your own name - a quick visual confirmation that you're signed into the right account, especially useful if more than one person shares the same computer.</p>

      <h3>Always-visible controls</h3>
      <ul>
        <li>${icon('search')}A <strong>search</strong> icon, in case you need to look something up without going through a tile first.</li>
        <li>${icon('sun')}A <strong>light/dark mode</strong> toggle, switching the whole app's color theme instantly.</li>
        <li>${icon('circle-user')}Your <strong>profile avatar</strong>, which opens your account settings and the sign-out option.</li>
      </ul>
      <p>These three sit in the exact same spot on every page in the app, not just Home, so you never lose track of them while navigating deeper into a report.</p>
    `,
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'chart-pie',
    summary: 'The Foundation-wide financial overview.',
    // Both image and html are functions here (not plain values) - this is
    // the one topic whose content genuinely differs by role: a Finance
    // Unit Coordinator's own "Dashboard" tile opens Budget vs Actual under
    // the hood (DASHBOARD_REDIRECT_BY_ROLE in api/modules.py), so their
    // version of this topic describes THAT, not the real Dashboard they'd
    // never actually see from this tile. UserGuide.vue's resolveContent()
    // calls these with { isDashboardRedirected }, derived from the same
    // already-role-filtered modulesResource every other role check on that
    // page already uses.
    image: ({ isDashboardRedirected }) => (isDashboardRedirected ? dashboardFucImage : dashboardImage),
    html: ({ isDashboardRedirected }) => (isDashboardRedirected ? `
      <p>Your Dashboard compares what was planned against what has actually been spent so far, scoped to your own unit, for the period you choose. It's the same report as the <strong>Budget vs Actuals</strong> page elsewhere in this app - your Home page's Dashboard tile just happens to open it directly.</p>

      <h3>Filters</h3>
      <ul>
        <li>${icon('calendar')}<strong>Financial Year</strong> picks which year's budget and actuals you're looking at.</li>
        <li>${icon('calendar')}<strong>YTD Month</strong> sets how far into the year to total spending - "year-to-date," not a single month in isolation. Picking August, for example, shows everything spent from the start of the financial year through the end of August, not August alone.</li>
        <li>${icon('sliders-horizontal')}<strong>Unit</strong>, <strong>Cost Center</strong>, <strong>Location Code</strong> narrow the figures further within what you're allowed to see - Cost Center and Location Code only become selectable once you've picked a Unit.</li>
        <li>${icon('mouse-pointer-click')}Click <strong>Get Report</strong> to run it with your chosen filters. It also loads automatically the first time you open the page, with your own allowed Unit(s) already selected, so you always see something meaningful right away rather than an empty page.</li>
      </ul>

      <h3>Reading the cards</h3>
      <p>Every card on this page - the big Grand Total card down to each Sub Head card - follows the same three-number pattern: <strong>Budget</strong> (what was planned), <strong>Actual Spent</strong> (what's actually gone out so far), and either <strong>Remaining Budget</strong> or <strong>Over Budget</strong> depending on which one applies.</p>
      <ul>
        <li>${icon('circle')}The ring in the middle of each card shows <strong>Utilised %</strong> - how much of that budget has been spent - and is colored to flag it at a glance: <strong>green</strong> under 60% spent, <strong>amber</strong> from 60% up to 100%, and <strong>red</strong> past 100%, meaning that line has gone over its budget. The same three colors repeat in the stat values below the ring.</li>
        <li>${icon('layout-grid')}Cards are organized top to bottom by level of detail: one Grand Total, then one card per <strong>Expense Head</strong> (like Capital Expenses or Operating Expenses), then one per <strong>Sub Head</strong> underneath whichever head it belongs to (shown grouped under a heading naming that parent head).</li>
        <li>${icon('mouse-pointer-click')}Click any card to open a drill-down - a closer look at everything that makes up that one card's total, broken down by whatever sits underneath it (its own Sub Heads, or its own line items if it has none). From inside that drill-down, clicking an individual line item drills one level further still, right down to the individual GL codes behind that figure - useful when a number looks off and you need to see exactly which transactions make it up.</li>
      </ul>

      <h3>Detailed table</h3>
      <p>Below the cards, every Expense Head, Sub Head, and Item is laid out as one searchable, expandable table instead of individual cards - useful once you want to scan everything at once rather than card by card.</p>
      <ul>
        <li>${icon('search')}Use the search box to jump straight to a head, sub-head, or item by name.</li>
        <li>${icon('chevrons-up-down')}Click a row to expand it and reveal what's underneath; use <strong>Expand all</strong> to open every row at once instead of one at a time.</li>
        <li>${icon('columns-3')}The columns are <strong>Budget</strong>, <strong>Actual</strong>, <strong>Util %</strong> (the same utilisation percentage the cards show, calculated the same way), and <strong>Variance</strong> - Budget minus Actual, so a positive number is what's left to spend and a negative number (shown in red) means that row has gone over budget.</li>
        <li>${icon('file-spreadsheet')}<strong>Export Excel</strong> downloads exactly what's currently in the table, filters and all, as a spreadsheet you can share or work with offline.</li>
      </ul>
    ` : `
      <p>The Dashboard is the Foundation-wide financial overview - budget totals, breakdowns by unit and sub-unit, and a handful of at-a-glance insights, all for the <strong>Financial Year</strong> you select at the top. It's built for a quick read of where things stand, not for drilling into individual transactions - for that level of detail, use Budget Summary or Budget vs Actuals instead.</p>
      <p>Everything below - the three tabs, the top banner, the insight cards, and the Unit/Sub Unit breakdown - all lives on this one page. Switching tabs doesn't take you anywhere else; it just changes what's shown underneath the same Financial Year filter at the top.</p>

      <h3>The three tabs</h3>
      <ul>
        <li>${icon('chart-pie')}<strong>Dashboard</strong> - the main overview covered in detail below: Overall Grand Total, Capex/Opex totals, a row of insight cards, then a breakdown by Unit and by Sub Unit.</li>
        <li>${icon('layers')}<strong>Work Plan Views</strong> - the same budget split a different way: <strong>Direct Work</strong> versus <strong>Grants &amp; Donations</strong>, instead of by Unit. It has its own Grand Total, Direct Work, and Grants &amp; Donations cards, a pie chart showing that split visually, its own set of insight cards, and two further charts breaking Direct Work and Grants down unit-wise.</li>
        <li>${icon('trending-up')}<strong>Budget vs Actuals Breakdown</strong> - a scaled-down version of the full Budget vs Actuals page, right here on the Dashboard: its own YTD Month/Unit/Cost Center/Location Code filters and <strong>Get Report</strong> button, then the same kind of Budget-vs-Actual cards, without leaving for the separate Budget vs Actuals page.</li>
      </ul>
      <img src="${dashboardWorkPlanViewsImage}" alt="Work Plan Views tab: Direct Work vs Grants & Donations split, with unit-wise breakdown donut charts" class="guide-inline-image" />
      <img src="${dashboardBudgetVsActualsBreakdownImage}" alt="Budget vs Actuals Breakdown tab: filters, Grand Total card, Expense Head and Sub Head cards, and the detailed table" class="guide-inline-image" />

      <h3>The top banner</h3>
      <p>Three large cards sit right under the Financial Year filter: <strong>Overall Grand Total</strong> (every unit, every category, combined), <strong>Capex Total</strong> (capital expenses only), and <strong>Opex Total</strong> (operating expenses only). All three are clickable and open a drill-down into exactly what makes up that figure.</p>

      <h3>Insight cards</h3>
      <p>Below the banner, a row of cards each surface one specific fact worth knowing at a glance, rather than making you work it out from the raw totals:</p>
      <ul>
        <li>${icon('trending-up')}<strong>Highest Budget Unit</strong> - whichever unit has the largest budget, with its amount and what share of the Foundation-wide total that represents.</li>
        <li>${icon('trending-down')}<strong>Lowest Budget Unit</strong> - the same, for the smallest. Only shown when there's more than one unit to compare.</li>
        <li>${icon('calendar')}<strong>Peak Allocation Month</strong> - which month has the single largest amount budgeted, once that month-by-month data has finished loading (it loads separately from the rest of the page, so this card can appear a moment after the others).</li>
      </ul>
      <p>Every insight card is clickable too, and opens a drill-down scoped to exactly what that card is about.</p>

      <h3>Unit and Sub Unit breakdown</h3>
      <ul>
        <li>${icon('layout-grid')}Below the insight cards, one card per <strong>Unit</strong>, then one per <strong>Sub Unit</strong> - each showing its own amount and what share of the Foundation-wide total it represents, so you can spot concentration at a glance without doing the math yourself.</li>
        <li>${icon('mouse-pointer-click')}Every Unit and Sub Unit card is clickable too, opening the same kind of drill-down as the banner and insight cards - into that specific unit's own figures.</li>
        <li>${icon('toggle-left')}<strong>Show full numbers</strong> toggles every amount on the page - banner, insight cards, and unit breakdown alike - between full rupee figures and the shorter Cr (crore) format, useful for a quick scan versus needing an exact figure.</li>
      </ul>

      <h3>Charts</h3>
      <p>Four charts round out the Dashboard tab, each reading the same Financial Year you've already selected:</p>
      <ul>
        <li>${icon('chart-pie')}<strong>Budget Share</strong> - a doughnut chart showing what percentage of the Foundation-wide total each Unit holds. Click a slice to drill into that unit's own figures.</li>
        <li>${icon('chart-column-stacked')}<strong>Quarterly Allocation Trend</strong> - a stacked bar chart of Capital, Operating, and COVID Support spending for each of the four quarters, with the quarter's grand total labelled above each bar.</li>
        <li>${icon('chart-line')}<strong>Month-wise Budget by Unit</strong> - a line chart tracking each of the top units' month-by-month budget across the full financial year, so a unit's own seasonal pattern (a July spike, say) is visible instead of just its single YTD total.</li>
        <li>${icon('chart-column')}<strong>Month-wise Budget Allocation</strong> - the same 12 months, but as one bar per month combining every unit together, with the month's total labelled above the bar.</li>
      </ul>
      <img src="${dashboardChartsImage}" alt="Dashboard charts: Budget Share, Quarterly Allocation Trend, Month-wise Budget by Unit, Month-wise Budget Allocation" class="guide-inline-image" />
    `),
  },
  {
    id: 'budget-summary',
    title: 'Budget Summary',
    icon: 'chart-column',
    summary: 'The full budget breakdown, head to item.',
    image: budgetSummaryImage,
    html: `
      <p>Budget Summary shows how the budget for a chosen year breaks down - from the overall total, down through Expense Head, Sub Head, and finally individual line items. A summary chart sits at the top, with the full detailed table below it.</p>

      <h3>Filters</h3>
      <ul>
        <li>${icon('calendar')}<strong>Financial Year</strong> - the year you're looking at (one year at a time).</li>
        <li>${icon('building-2')}<strong>Operating Units</strong> - pick one or more named operating units and the app automatically fills in the matching Unit, Cost Center, and Location Code combination for you, the same way this filter works on Budget vs Actuals. If an operating unit has nothing mapped to it yet, a note under the field lets you know and the report falls back to showing all data instead of narrowing to nothing.</li>
        <li>${icon('sliders-horizontal')}<strong>Unit</strong>, <strong>Cost Center</strong>, and <strong>Location Code</strong> - or set these individually yourself instead. Cost Center and Location Code only become available once you've picked a Unit.</li>
        <li>${icon('x')}<strong>Clear Filters</strong> resets all of the above back to just the current year, with no unit or operating-unit narrowing.</li>
      </ul>

      <h3>Summary cards and chart</h3>
      <ul>
        <li>${icon('layout-grid')}A <strong>Grand Total Budget</strong> card, then one card per Expense Head (like Capital Expenses or Operating Expenses), then one per Sub Head underneath whichever head it belongs to - each showing its amount and, for heads, what share of the grand total it represents.</li>
        <li>${icon('mouse-pointer-click')}Click any card to open a drill-down into exactly what makes up that figure, right down to individual line items and GL codes.</li>
        <li>${icon('chart-pie')}Alongside the cards, a <strong>Direct Work vs. Grants &amp; Donations</strong> pie chart splits the same grand total the same way the Dashboard's own Work Plan Views tab does - anything budgeted under a line item literally named "Grants &amp; Donations" counts toward that slice, everything else counts as Direct Work. Click a slice to drill into just that slice's figures.</li>
        <li>${icon('toggle-left')}<strong>Show full numbers</strong>, next to the cards, switches both the cards and the pie chart between full rupee figures and the shorter Cr (crore) format.</li>
      </ul>

      <h3>Using the table</h3>
      <ul>
        <li>${icon('chevrons-up-down')}Click any row (an Expense Head or Sub Head) to expand it and reveal what's underneath - click again to collapse it. Nothing opens in a separate window; it all happens in place.</li>
        <li>${icon('maximize-2')}<strong>Expand Quarters</strong> and <strong>Expand Items</strong> open everything at once instead of clicking through row by row.</li>
        <li>${icon('search')}Use the <strong>search box</strong> to jump straight to a head, sub-head, item, or GL code by name.</li>
        <li>${icon('toggle-left')}<strong>Show full numbers</strong> switches between full rupee amounts and a rounded Cr (crore) figure.</li>
        <li>${icon('file-spreadsheet')}<strong>Export XLS</strong> downloads the whole report as an Excel file - this can take a moment on a large report, so you'll see a "Generating your Excel file..." message while it works.</li>
      </ul>

      <h3>Seeing the month-wise breakdown</h3>
      <p>By default each of the four quarter columns shows just that quarter's total. Click a quarter's own header (<strong>Quarter 1</strong>, <strong>Quarter 2</strong>, and so on) to split it into its three individual months (Apr/May/Jun for Quarter 1, and so on), with every row - heads, sub-heads, and items alike - updating to show its month-by-month figures for that quarter instead of one combined number. Click the same header again to collapse it back to a single total. You can open more than one quarter like this at the same time; <strong>Expand Quarters</strong> does this for all four at once, giving you the full Apr-through-Mar month-wise view shown below.</p>
      <img src="${budgetSummaryExpandedImage}" alt="Budget Summary table with all four quarters expanded into their individual months (Apr through Mar), and sub-heads and items expanded underneath Operating Expenses" class="guide-inline-image" />

      <h3>Drilling into a card or row</h3>
      <p>Clicking a summary card, a pie slice, or a row in the table opens a <strong>Drill Down</strong> window on top of the page, breaking that one figure down into whatever sits underneath it.</p>
      <ul>
        <li>${icon('layout-grid')}At the top, a summary strip shows the total and how many line items make it up, plus a thin composition bar giving an immediate visual read of how that total splits between them.</li>
        <li>${icon('list')}Below that, a table lists each line item with its <strong>Share</strong> (as a percentage and a small bar) and its <strong>Total</strong>. Clicking a row with a further breakdown drills one level deeper still; <strong>Sort by amount</strong> reorders the list from largest to smallest instead of its default order.</li>
        <li>${icon('arrow-left')}Once you've drilled into more than one level, a breadcrumb trail appears under the title - click any earlier name in it (or the <strong>Back</strong> arrow, top-left) to jump back, without having to close the window and start over.</li>
        <li>${icon('toggle-left')}This window has its own <strong>Show full numbers</strong> toggle, separate from the one on the main page.</li>
      </ul>
      <img src="${budgetSummaryDrilldownImage}" alt="Drill-down window opened from the Grand Total card, showing Capital Expenses and Operating Expenses as line items with their share and total" class="guide-inline-image" />
    `,
  },
  {
    id: 'budget-vs-actual',
    title: 'Budget vs Actuals',
    icon: 'trending-up',
    summary: 'Compare planned budget against real spend.',
    image: budgetVsActualImage,
    html: `
      <p>Budget vs Actuals compares what was planned against what has actually been spent so far, for the period you choose. It's the most detailed actuals report in the app, with summary cards at the top and a full searchable table below.</p>

      <h3>Filters</h3>
      <ul>
        <li>${icon('calendar')}<strong>Financial Year</strong> and <strong>YTD Month</strong> (spending is shown cumulatively up to and including this month).</li>
        <li>${icon('building-2')}<strong>Operating Units</strong> - pick a named operating unit and the app automatically fills in the right Unit, Cost Center, and Location Code combination for you.</li>
        <li>${icon('sliders-horizontal')}<strong>Unit</strong>, <strong>Cost Center</strong>, <strong>Location Code</strong> - or set these individually yourself instead.</li>
        <li>${icon('mouse-pointer-click')}Click <strong>Get Report</strong> to run it with your chosen filters (it also loads automatically the first time you open the page).</li>
      </ul>

      <h3>Cards</h3>
      <ul>
        <li>${icon('circle')}A large <strong>Grand Total</strong> card shows overall Budget vs Actual, colored by how much of the budget has been used.</li>
        <li>${icon('layout-grid')}Below that, a card for every Expense Head, then every Sub Head under each head.</li>
        <li>${icon('mouse-pointer-click')}Click any card to open a closer look (a drill-down) at that item's own breakdown. From there, clicking a line item drills one level further, right down to individual GL codes.</li>
      </ul>

      <h3>Drilling into a card</h3>
      <p>Clicking the Grand Total card (or any Expense Head/Sub Head card) opens a <strong>Drill Down</strong> window with Budget, Actual, Variance, and Utilization for that figure, plus a <strong>Line Items</strong> table listing what makes it up - each with its own Share, Budget, Actual, and Util %. Click any line item with a further breakdown to drill one level deeper; <strong>Sort by amount</strong> reorders the list largest-first.</p>
      <img src="${budgetVsActualDrilldownImage}" alt="Drill-down window for Grand Total showing Budget, Actual, Variance, Utilization and a Line Items table with Capital Expenses, Operating Expenses and COVID Support" class="guide-inline-image" />

      <h3>Drilling down to GL codes</h3>
      <p>Keep clicking into a line item that has no further sub-items of its own, and the window goes one level deeper still: the individual <strong>GL Codes</strong> behind that figure, each with its own Type of Expense, Share, Budget, Actual, and Util % - the finest level of detail the app shows, useful when a number looks off and you need to see exactly which underlying accounts make it up. A breadcrumb trail at the top (Grand Total / Capital Expenses / ...) lets you jump back to any earlier level without closing the window.</p>
      <img src="${budgetVsActualGlCodesImage}" alt="GL Codes drill-down for Building - Construction Costs - RCC, listing individual GL codes with their type of expense, share, budget, actual and utilisation" class="guide-inline-image" />

      <h3>Detailed table</h3>
      <p>Search by Expense Head, Sub Head, or Item name; use <strong>Expand all</strong> to open every row at once; click a row to expand just that one. The table shows Budget, Actual, Util % (how much of the budget has been used), and Variance (what's left), with a grand total at the bottom. <strong>Export Excel</strong> downloads exactly what you're looking at.</p>
      <img src="${budgetVsActualTableImage}" alt="Budget vs Actuals detailed table with Operating Expenses expanded into its sub heads, showing Budget, Actual, Util % and Variance columns" class="guide-inline-image" />
    `,
  },
  {
    id: 'foundation-consolidated',
    title: 'Foundation Consolidated',
    icon: 'file-text',
    // Matches the App Module Setting record name this topic's tile/access
    // is actually gated by - used to filter this card out of the board
    // (and block direct URL access) for a viewer whose role doesn't have
    // this module, same restriction the real Home page tile enforces.
    moduleName: 'foundation_consolidated',
    summary: 'Six consolidated views in one place. (Admin only)',
    html: `
      <p><strong>This tile only appears for System Manager accounts</strong> - if you don't see it on your Home page, that's expected; it's not something your role has access to.</p>
      <p>Foundation Consolidated is the most complete reporting page in the app - six different views of the Foundation's budget and actuals, all built from the same Financial Year you pick once at the top.</p>

      <h3>The six tabs</h3>
      <ul>
        <li>${icon('globe')}<strong>Foundation Level / Overall Metrics</strong> - the big picture: this year's budget against last year's actuals, split into Operating, Capital, and COVID spending, plus a breakdown for Education and by unit.</li>
        <li>${icon('indian-rupee')}<strong>Summary in INR</strong> - a consolidated summary in plain rupee figures, including headcount numbers.</li>
        <li>${icon('users')}<strong>Headcount</strong> - planned headcount against actual headcount.</li>
        <li>${icon('wallet')}<strong>Annual Budget Consolidated</strong> - the complete annual budget, broken down across every unit.</li>
        <li>${icon('trending-up')}<strong>Actuals Consolidated</strong> - the complete actuals, broken down across every unit.</li>
        <li>${icon('git-compare')}<strong>Budget & Actuals</strong> - both budget and actuals shown together, across every unit.</li>
      </ul>

      <h3>How it works</h3>
      <ul>
        <li>${icon('clock')}Each tab loads its own data the first time you open it, so the first click on a tab may take a moment - after that, switching back and forth is instant as long as you haven't changed the Financial Year.</li>
        <li>${icon('refresh-cw')}Changing the <strong>Financial Year</strong> clears everything and reloads just the tab you're currently on - the others will reload the next time you open them.</li>
        <li>${icon('file-spreadsheet')}Each tab has its own <strong>Export</strong> button for just that tab's data, or use <strong>Export All</strong> at the top to export every tab at once (you'll need to have opened every tab at least once first, so the app has something to export for each one).</li>
        <li>${icon('toggle-left')}<strong>Show full numbers</strong> applies across every tab, switching between exact rupee figures and a rounded Cr (crore) view.</li>
      </ul>
    `,
  },
  {
    id: 'monthly-mis',
    title: 'Monthly MIS',
    icon: 'calendar',
    summary: 'Month-by-month, year-over-year spending.',
    image: monthlyMisOpexImage,
    html: `
      <p>Monthly MIS shows how spending has progressed so far this year, always comparing this year's YTD figures against the same YTD period last year, section by section, from the Foundation's overall numbers down to individual units and sub-units. It's one long page - every section below sits on the same page, one after another, rather than behind separate tabs.</p>

      <h3>Filters</h3>
      <ul>
        <li>${icon('calendar')}<strong>Financial Year</strong> and <strong>Month (YTD up to)</strong> - the whole page shows figures cumulatively, from the start of that financial year up to and including the month you pick. Changing either reloads every section on the page together.</li>
        <li>${icon('refresh-cw')}<strong>Refresh</strong> re-runs the report with your current filters, in case the underlying ERP data has changed since you opened the page.</li>
        <li>${icon('toggle-left')}<strong>Show full numbers</strong> toggles every table on the page between a rounded Cr (crore) figure and the full exact rupee amount; <strong>Export</strong> downloads the whole report as an Excel file.</li>
      </ul>
      <p>Your choice of Financial Year and Month is remembered the next time you open this page, so you don't need to reset it on every visit.</p>

      <h3>Operating Expense and Capital Expense</h3>
      <p>The first two sections split every unit's spending into <strong>Operating Expense</strong> and <strong>Capital Expense</strong>, each as its own table of Budget/Actuals/% of Budget, shown for both the current financial year and the previous one side by side - so a jump or drop against last year is visible at a glance, not just this year's number in isolation.</p>
      <img src="${monthlyMisOpexImage}" alt="Monthly MIS Operating Expense section: Budget, Actuals and % of Budget for each unit, for 2026-27 and 2025-26 side by side" class="guide-inline-image" />

      <h3>Overall Foundation</h3>
      <p>Next, one consolidated table combining Operating and Capital into a single Foundation-wide view, broken down the same way by Areas of Work (Education, Health, Livelihoods, Azim Premji University, Philanthropy, Scholarship Programme, Other Initiatives, Enablers), again comparing this year's YTD to last year's.</p>
      <img src="${monthlyMisCapexOverallImage}" alt="Monthly MIS Capital Expense table followed by the Overall Foundation table broken down by Areas of Work" class="guide-inline-image" />

      <h3>Education, Health, Livelihoods, University, Enablers</h3>
      <p>Five sections - one per major area of work - each break that area down further into its own real sub-units, with <strong>Operating Expense</strong>, <strong>Capital Expense</strong>, and <strong>Total Expense</strong> columns side by side (no year-over-year split at this level - just this year's YTD figures):</p>
      <ul>
        <li>${icon('book-open')}<strong>Education</strong> splits into <strong>Education - District Institutes</strong> and <strong>Education - Azim Premji Schools</strong>, each listing every state (Rajasthan, Karnataka, Chhattisgarh, and so on) with its own row.</li>
        <li>${icon('heart-pulse')}<strong>Health</strong> splits into Urban Primary care work, Rural Primary care work (both state-wise), Central Initiatives, Hospital, and Health Programs Team &amp; Enablers.</li>
        <li>${icon('users')}<strong>Livelihoods</strong> lists its own state-wise rows (Jharkhand, Chhattisgarh, and so on).</li>
        <li>${icon('graduation-cap')}<strong>University</strong> lists each Azim Premji University campus (Bangalore, Bhopal, Ranchi, Guwahati) with its own schools/operations/enablers breakdown underneath.</li>
        <li>${icon('settings')}<strong>Enablers</strong> lists each enabling function (CEOs' Office, Communications, Information &amp; Communications Technology, People Function, Finance Function, and so on).</li>
      </ul>
      <p>Every one of these sections ends in its own subtotal row, and the whole section ends in a <strong>Total</strong> row for that area of work.</p>
      <img src="${monthlyMisEducationImage}" alt="Monthly MIS Education section split into Education - District Institutes and Education - Azim Premji Schools, each listing state-wise rows" class="guide-inline-image" />
      <img src="${monthlyMisHealthLivelihoodsImage}" alt="Monthly MIS Health section split into Urban/Rural Primary care work, Central Initiatives, Hospital and Health Programs Team & Enablers, followed by Livelihoods" class="guide-inline-image" />
      <img src="${monthlyMisUniversityImage}" alt="Monthly MIS University section listing each Azim Premji University campus with its own schools, operations and enablers breakdown" class="guide-inline-image" />

      <h3>Operating Expenses Breakdown</h3>
      <p>The final section re-slices the same Operating Expense figures one more way: by <strong>Expense Category</strong> (Program Expenses, Grants, People Expenses, Travel Expenses, Student Support Expenses, Other Operating Expenses, Medical Expenses) instead of by unit - first for the <strong>Total Foundation</strong>, then as a grid of smaller tables, one per unit and sub-unit (Education, Health, Livelihoods, Azim Premji University, each campus, and so on), each comparing this year's YTD to last year's side by side.</p>
      <img src="${monthlyMisEnablersBreakdownImage}" alt="Monthly MIS Enablers section followed by the Operating Expenses Breakdown's Total Foundation table by expense category" class="guide-inline-image" />
      <img src="${monthlyMisBreakdownGridImage}" alt="Operating Expenses Breakdown grid showing separate expense-category tables for Education, Health, Livelihoods, Azim Premji University and its campuses" class="guide-inline-image" />

      <h3>Drilling into a row</h3>
      <p>Click any row in any of these tables to open the same kind of <strong>Drill Down</strong> window used elsewhere in the app - Budget, Actual, Variance, and Utilization for that row, plus a Line Items table breaking it down further. For rows from the Operating/Capital Expense and Overall Foundation tables, this goes all the way down to individual GL codes, the same as Budget vs Actuals; rows from the Education/Health/Livelihoods/University/Enablers breakdown sections open a single-level line-item view instead.</p>
    `,
  },
  {
    id: 'erp-actuals',
    title: 'ERP Actuals',
    icon: 'database',
    moduleName: 'erp_actuals',
    summary: 'Pull live raw actuals straight from the ERP. (Admin only)',
    html: `
      <p><strong>This tile only appears for System Manager accounts</strong> - if you don't see it on your Home page, that's expected; it's not something your role has access to.</p>
      <p>ERP Actuals pulls raw spending data straight from the Foundation's ERP system (PeopleSoft), live, for the period you choose. Unlike the other reports, nothing here is pre-loaded - you trigger the pull yourself, and it can take one to three minutes to come back.</p>

      <h3>How to use it</h3>
      <ul>
        <li>${icon('database')}Choose which <strong>API</strong> to pull from - <strong>ERP Actuals (YTD)</strong> for a year-to-date total, or <strong>ERP Actuals (Month Wise)</strong> for a month-by-month breakdown.</li>
        <li>${icon('calendar')}Set the <strong>Financial Year</strong> and <strong>Month</strong>, then click <strong>Fetch</strong>.</li>
        <li>${icon('clock')}A timer shows how long the fetch has been running; past a minute, a message lets you know it's still working, with the option to cancel if you've changed your mind.</li>
      </ul>

      <h3>Reading the results</h3>
      <p>A summary strip shows the Status, Fiscal Year, Accounting Period, and how many rows came back, followed by the full raw data table. Every column has its own filter - click a column header to pick which values to show. Results are shown 100 rows at a time, with Previous/Next buttons to page through them, and a <strong>Clear filters</strong> button once you've filtered anything. <strong>Export to Excel</strong> downloads exactly what's currently visible on screen, after your filters are applied.</p>
    `,
  },
  {
    id: 'budget-import-template',
    title: 'Budget Import Template',
    icon: 'download',
    summary: 'Download your pre-filled budget template.',
    image: budgetImportTemplateImage,
    html: `
      <p>This page gives you a ready-made Excel template for entering your budget, already filled in with the exact Units, Cost Centers, and Location Codes you're allowed to budget for - so there's no risk of entering figures against the wrong combination.</p>

      <h3>How to use it</h3>
      <ul>
        <li>${icon('id-card')}You'll see one card with your name and the rows you're allowed to budget for. (Finance MIS Admins instead see a card for every user, with a search box to find a particular person.)</li>
        <li>${icon('download')}Click <strong>Download all</strong> for the full template, or tick just the rows you need first and the button switches to <strong>Download selected</strong> for a smaller, filtered template.</li>
        <li>${icon('square-check')}Either way, a <strong>Review Selected Items</strong> screen lists exactly what's about to be downloaded - every row for Download all, or just your ticked rows for Download selected - so you can note down the Cost Centers and Location Codes and avoid creating duplicates when you import. Tick <strong>I have noted down the selected items and I am ready to proceed</strong> to continue; the template only generates after you confirm.</li>
        <li>${icon('loader-circle')}Generating a template can take a short while, so you'll see a progress indicator while it works.</li>
      </ul>
      <img src="${budgetImportTemplateReviewImage}" alt="Review Selected Items confirmation screen" class="guide-inline-image" />
      <p>If no rows have been set up for you yet, the page will let you know there's nothing to download - in that case, contact Finance to get your access configured.</p>
    `,
  },
  {
    id: 'budget-import',
    title: 'Budget Import',
    icon: 'upload',
    summary: 'Upload your filled-in budget template.',
    html: `
      <p>Budget Import is where you upload a filled-in Budget Import Template to actually add your budget figures into the system. It's built specifically for budget data, so it understands exactly which rows are new and which are updates to something already entered.</p>

      <h3>Step by step</h3>
      <ul>
        <li>${icon('paperclip')}Click <strong>Attach File</strong> and choose your completed template (.xlsx file only).</li>
        <li>${icon('eye')}The app automatically checks it and shows a preview: how many rows will be created, how many will update existing records, and the total amount - with a green or red dot next to each row showing whether it's ready to import or has a problem.</li>
        <li>${icon('triangle-alert')}If any rows have a problem, you'll see a message explaining how many, and the import won't proceed until you fix the file and upload it again.</li>
        <li>${icon('upload')}Once everything looks right, click <strong>Start Import</strong>. An Import Log afterward confirms how many records were created and how many were updated.</li>
        <li>${icon('rotate-ccw')}<strong>Choose a different file</strong> lets you start over with a new upload at any point.</li>
      </ul>
    `,
  },
  {
    id: 'data-import',
    title: 'Data Import',
    icon: 'import',
    moduleName: 'data_import',
    summary: 'Bulk-import any record type (admins only).',
    html: `
      <p>Data Import is a general-purpose tool for loading data into any part of the system - not just budgets. It's intended for administrators setting up or bulk-updating master data (like Units, Cost Centers, or GL Codes), so it's only available to System Manager accounts.</p>

      <h3>How it works</h3>
      <ul>
        <li>${icon('list')}The page lists every import you've run before, with its status and a link to view the full details.</li>
        <li>${icon('plus')}Click <strong>New Import</strong> to start one: choose what kind of record you're importing and whether you're inserting new ones or updating existing ones, then download a template for it if you need one.</li>
        <li>${icon('columns-3')}Attach your file and click <strong>Load Preview</strong> to see which columns matched correctly (green) and which didn't (red), with a way to manually map columns if something doesn't line up on its own.</li>
        <li>${icon('import')}Click <strong>Start Import</strong> to run it - a live progress bar shows how far along it is, with the option to cancel partway through.</li>
        <li>${icon('file-text')}Afterward, a log shows exactly what happened to every row, with buttons to export any rows that failed, or the whole log, for your records.</li>
      </ul>
    `,
  },
  {
    id: 'combination-reconciliation',
    title: 'Combination Reconciliation',
    icon: 'git-compare',
    moduleName: 'combination_reconciliation',
    summary: 'Find spending that isn\'t mapped correctly. (Admin only)',
    html: `
      <p><strong>This tile only appears for System Manager accounts</strong> - if you don't see it on your Home page, that's expected; it's not something your role has access to.</p>
      <p>This page checks for a specific, easy-to-miss problem: spending that comes in from the ERP against a Unit/Cost Center/Location Code combination that nobody has mapped into the app yet. If a combination isn't mapped, that spending won't show up correctly in any report - this page finds those gaps before they cause confusion.</p>

      <h3>How to use it</h3>
      <ul>
        <li>${icon('calendar')}Set the <strong>Financial Year</strong> and <strong>Month</strong> (checked cumulatively up to that month), then click <strong>Check</strong>.</li>
        <li>${icon('clock')}Like ERP Actuals, this pulls live data from the ERP, so it can take one to three minutes to come back.</li>
        <li>${icon('list-filter')}If you only need to check Enablers-related spending, turn on <strong>Only for Enablers, ignore location code</strong> to narrow and simplify the check.</li>
      </ul>

      <h3>Reading the result</h3>
      <p>A green banner means every combination found is properly mapped - nothing to do. A red banner means some aren't, followed by a table listing each unmapped combination (Unit, Cost Center, and Location Code, each with its ERP code) along with how much money is affected, and a running total. Share this list with whoever maintains the Overview Number Cards mapping so it can be fixed.</p>
    `,
  },
  {
    id: 'trial-balance-check',
    title: 'Trial Balance Check',
    icon: 'scale',
    moduleName: 'trial_balance_check',
    summary: 'Unit-wise trial balance, head and sub-head wise. (Admin only)',
    html: `
      <p><strong>This tile only appears for System Manager accounts</strong> - if you don't see it on your Home page, that's expected; it's not something your role has access to.</p>
      <p>Trial Balance Check pulls a unit-wise trial balance straight from the ERP for the period you choose, broken down the same way every other report categorizes spending - by main head (Capital Expenses, Operating Expenses) and sub-head (Program, Partner, People, Travel, Student Support, Other Operating Expenses) - rather than as a flat list of GL codes.</p>

      <h3>How to use it</h3>
      <ul>
        <li>${icon('calendar')}Set the <strong>Financial Year</strong> and <strong>YTD Month</strong>, then click <strong>Fetch</strong>.</li>
        <li>${icon('clock')}Like ERP Actuals, this pulls live data from the ERP, so it can take one to three minutes to come back.</li>
      </ul>

      <h3>Reading the table</h3>
      <p>Each row is one Unit, with a <strong>TOTAL</strong> row at the bottom summing every unit. Capital Expenses always shows as its own column; Operating Expenses starts expanded to show its own six sub-head columns (Program, Partner, People, Travel, Student Support, Other Operating Expenses) - click its header to collapse it back down to one column, or expand it again.</p>
      <ul>
        <li>${icon('search')}Click any <strong>main-head or sub-head column header</strong> (or <strong>Total</strong>) to drill into that category's breakdown across every unit combined.</li>
        <li>${icon('mouse-pointer-click')}Click anywhere on a <strong>unit's row</strong> (including the TOTAL row) to drill into that unit's own full breakdown instead - head, then sub-head, then the individual expense type, then the underlying GL code.</li>
      </ul>
    `,
  },
  {
    id: 'settings-master-data',
    title: 'Settings & Master Data',
    icon: 'database',
    moduleName: 'budget_master',
    summary: 'Units, cost centers, and other master data. (Admin only)',
    html: `
      <p><strong>This tile only appears for System Manager accounts</strong> - if you don't see it on your Home page, that's expected; it's not something your role has access to.</p>
      <p>Settings & Master Data is where the underlying reference information behind every other report lives - Units, Cost Centers, GL Codes, Location Codes, Financial Years, and more. Most people won't need to touch this often; it's mainly for Finance/Admin users keeping the system's master data up to date.</p>

      <h3>What's in here</h3>
      <p>Clicking this tile opens a sidebar listing every record type you can manage: Master Settings, ERP Credentials, App Module Settings, Cost Center, Unit, GL Code, Location Code, State, Expenses, Expenses Line Items, Financial Year List, Months List, Operating Units, Grant Division Details, Import Templates, Finance User Access, AI Assistant Guide, and Overview Number Cards Settings.</p>

      <h3>Working with a record type</h3>
      <ul>
        <li>${icon('search')}Each one opens as a searchable, sortable list - use the search box to find a record by name, or the Filter panel for more specific conditions.</li>
        <li>${icon('plus')}<strong>New</strong> creates a record; clicking any row opens it for viewing or editing.</li>
        <li>${icon('trash-2')}Tick the checkboxes next to several rows to delete more than one at a time.</li>
        <li>${icon('columns-3')}Use the <strong>Columns</strong> picker to choose which fields show in the list, or <strong>Sort</strong> to change the order records appear in.</li>
      </ul>
    `,
  },
  {
    id: 'help-support',
    title: 'Help & Support',
    icon: 'life-buoy',
    summary: 'Raise or check a support ticket.',
    html: `
      <p>Clicking <strong>Help & Support</strong> on the Home page takes you straight to the Foundation's centralized Helpdesk portal in a new browser tab - it's not a page inside this app. The Helpdesk is for anything that can't be resolved at the user-admin level: whenever a technical or project-related issue needs escalation, this is where it goes. You're already mapped to your relevant project(s) on the portal, so you should be able to log in and see them right away.</p>

      <h3>Logging in</h3>
      <ul>
        <li>${icon('user')}<strong>Username</strong> is your registered/official email ID.</li>
        <li>${icon('key-round')}<strong>Password</strong> - if you don't have one yet (or forget it), click <strong>Forgot Password</strong> on the login page to set/reset it.</li>
        <li>${icon('mail')}Trouble logging in? Email <strong>tech4socialsector@azimpremjifoundation.org</strong> and they'll sort it out.</li>
      </ul>

      <h3>Raising a ticket</h3>
      <ul>
        <li>${icon('plus')}Click <strong>New Ticket</strong>.</li>
        <li>${icon('type')}Give it a <strong>Title</strong> (a short, clear subject) and a <strong>Description</strong> (the issue in detail).</li>
        <li>${icon('folder')}Pick your <strong>Project</strong> from the dropdown - only the projects you're mapped to will show up.</li>
        <li>${icon('users')}Pick the <strong>Team</strong> - once you've chosen a Project, its associated Team appears for you to select.</li>
        <li>${icon('paperclip')}Add any relevant attachments if you have them.</li>
        <li>${icon('send')}Click <strong>Save / Submit</strong> to raise the ticket.</li>
      </ul>

      <h3>What happens next</h3>
      <ul>
        <li>${icon('mail-check')}The moment a ticket is saved, both you (the requestor) and the person it's assigned to get an email notification right away.</li>
        <li>${icon('bell')}You'll keep getting email updates every time its status changes - In Progress, Resolved, Closed, and so on.</li>
        <li>${icon('eye')}You can also log back into the portal any time to check a ticket's live status yourself, instead of waiting on email.</li>
      </ul>

      <p>Questions about access or the setup itself also go to <strong>tech4socialsector@azimpremjifoundation.org</strong>.</p>
    `,
  },
]
