### Annual Budget MIS

A Frappe app for managing and tracking annual budget allocations against
real PeopleSoft ERP actuals, with a Vue 3 frontend (`frontend/`) served at
`/budget-mis` instead of the standard Frappe Desk UI.

### What this app does

- **Budget**: Finance users upload annual budgets (per Unit / Cost Center /
  Location Code / head-sub-head-item of expense) via an Excel template,
  stored as `Finance Budget` docs with embedded `Finance Budget Amounts`
  child rows (one row per expense line, with April-March monthly columns).
  Import is a two-phase preview-then-commit flow (`preview_budget_import`/
  `commit_budget_import` in `budget_import.py`) that classifies each
  Unit/Cost Center/Location/Financial Year group as a new record or an
  update to an existing one, shown in the preview, the post-commit import
  log, and an optional confirmation email (`Budget Import Email Settings`
  singleton doctype configures recipients and email content).
- **Actuals**: Real spend is pulled live from a PeopleSoft ERP HTTP API
  (`budget_mis/api/erp_actuals.py`), cached server-side via
  `cache_with_single_flight` (`budget_mis/api/helper.py`) - a
  distributed-lock "fetch once, everyone else waits" wrapper built on
  `frappe.cache()` (real Redis, shared across worker processes), keyed by
  `(fiscal_year, accounting_period)` and shared by every caller
  (Monthly MIS, Budget vs Actuals, Foundation Consolidated, the Trial
  Balance Check module, etc). The lock's own TTL is set comfortably above
  the slowest real fetch (the PeopleSoft call itself can take up to 90s) -
  a lock TTL shorter than that is a real, previously-hit bug (the lock
  expires out from under a still-running fetch, letting a second caller
  acquire it and fire a second concurrent PeopleSoft call for the same
  period). Current-year and previous-year fetches for a given report still
  run sequentially rather than concurrently for the same underlying reason
  - the PeopleSoft server is a single shared endpoint that slows down and
  trips timeouts under concurrent heavy queries (see
  `get_monthly_mis_page_data`). Every real PeopleSoft fetch and the
  login-time cache warm-up plan are logged to the `ERP Actuals Call Log`
  doctype (`budget_mis/master/doctype/erp_actuals_call_log/`). The current-
  and previous-year fetches a given report needs are usually run
  sequentially for this reason (see `get_monthly_mis_page_data`) - the one
  exception is `monthly_mis_export.py`'s `export_monthly_mis`, which runs
  its two fetches concurrently (each in its own thread with its own
  `frappe.init`/`frappe.connect`/`frappe.db.commit`/`frappe.destroy`, since
  Frappe's db/cache handles are thread-local) specifically because an
  export request is a one-off, not something many users are hitting at
  once for the same period, so the usual "don't pile concurrent load on
  PeopleSoft" concern doesn't apply the same way there.
- **Reporting**: Budget vs Actuals, Monthly MIS, Foundation Consolidated,
  Trial Balance Check, and dashboard pages merge the two sides together
  (the budget tree from `get_budget_summary`/`get_budget_ytd_by_sequence`,
  actuals from `group_actuals_ytd` and friends, combined in
  `get_combined_actuals`). A caller selecting several Units/Cost
  Centers/Location Codes at once (no Operating Unit theme picked) must fan
  out one `get_combined_actuals` call per Unit and sum the results, rather
  than passing all the flattened lists into one call - the latter ANDs
  three independent sets together and can cross-match combinations that
  were never actually picked together (e.g. one unit's cost center against
  a different unit's location code). See `budget_vs_actual.py`'s
  `_per_unit_filter_sets`/`_get_combined_actuals_by_theme` for the
  established per-unit/per-theme fan-out pattern - this was a real,
  previously-hit bug (Budget vs Actuals and Monthly MIS showing different
  totals for what should have been the same scope).
- **Access control**: every Finance user is restricted to a configured set
  of Units/Cost Centers/Location Codes (`Finance User Access`); reporting
  endpoints scope themselves to this set on direct HTTP calls via
  `get_allowed_units()`/`require_unit_access()` (see `budget_mis/utils.py`).
- **AI Assistant**: an in-app chat assistant (`budget_mis/ai/`) that can
  answer budget/actuals questions using the same permission-scoped tool
  functions reporting pages use, with its own system-prompt guide content
  stored as `AI Assistant Guide` records (shipped as a fixture - see
  `budget_mis/fixtures/ai_assistant_guide.json`).

### Architecture at a glance

- `budget_mis/api/` - the entire backend API surface. A parallel module
  (`api_1/`) existed during an earlier development phase and has since
  been fully consolidated back into `api/` (duplicated logic merged into
  shared helpers, dead code deleted, every frontend/Desk-page call site
  repointed) - there is only ever one API folder at a time; don't recreate
  a second parallel one. Notable modules: `helper.py` (shared cross-file
  helpers - `cache_with_single_flight`, financial-year/accounting-period
  conversions, actuals-tree consolidation), `erp_actuals.py`/
  `grouped_actuals.py` (the real PeopleSoft HTTP calls and their
  grouped/YTD views - note these two files each define their own, genuinely
  different, same-named functions like `group_actuals_ytd`; check which
  module a caller actually imports from), `budget_summary.py`/
  `budget_vs_actual.py`/`budget_actuals_combined.py` (the budget-side trees
  and the shared budget+actuals merge, `get_combined_actuals`),
  `monthly_mis.py`/`foundation_consolidated.py` (the big dashboard pages),
  `trial_balance.py` (the Trial Balance Check module - pulls live from
  PeopleSoft's `Z_MIS_TB_BY_PERIOD` query, same host/auth/cache-with-
  single-flight convention as `erp_actuals.py`'s own actuals pull; that
  query's real response carries no GL account-description field at all
  (just `business_unit`/`account`/`deptid`/`operating_unit`/
  `posted_total_amt`), so a drill-down GL line shows the bare GL code with
  no description, unlike Budget vs Actuals' GL-level drill-down; its own
  `get_trial_balance_from_erp` is System-Manager-only on a direct HTTP
  call, matching the frontend's own nav restriction on that tab),
  `budget_import.py`/
  `budget_import_template.py` (the Excel import flow), `export_reports.py`
  (Foundation Consolidated's own Excel exports)/`monthly_mis_export.py`
  (Monthly MIS's Excel/PDF/PowerPoint export - a dropdown on the page, not
  a single button; the PDF/PPTX builders render the same slide-by-slide
  layout via `openpyxl`/`python-pptx`/`frappe.utils.pdf.get_pdf`),
  `response_crypto.py` (response encryption + `is_direct_http_call`),
  `filter_options.py`
  (units/cost centers/locations/financial years/themes for every page's
  filter bar), `modules.py` (the role-filtered Home-tile/sidebar module
  list every page's nav reads).
- `budget_mis/ai/` - the AI Assistant's system prompt builder
  (`assistant.py`), its callable tool functions (`tools.py`), and the
  guide-content review/authoring helpers used from Desk.
- `frontend/` - the Vue 3 SPA. Routes are declared in `src/router.js`
  (all pages are route-level lazy-loaded); `src/layouts/AppLayout.vue`
  is the always-loaded app shell (sidebar/topbar/AI assistant trigger) -
  anything added there loads on *every* page, so defer anything that
  isn't needed immediately (see `defineAsyncComponent` usage around the
  AI Assistant panel and Profile Settings modal for the pattern).
- Doctypes live under `budget_mis/main/doctype/` (e.g. `Finance Budget`,
  `Unit`, `Cost Center`, `Location Code`, `Expenses`), `budget_mis/master/`
  (settings-style singletons/configuration doctypes like `ERP Credentials`,
  `Overview number cards settings`, `App Module Setting`), and
  `budget_mis/child/` (child tables like `Finance Budget Amounts`).

### Key conventions to know before changing this app

- **Doc name vs ERP code.** Every Cost Center/Location Code has two
  identities: its Frappe doc `name` (used by budget-side filters, e.g.
  `Finance Budget.cost_center`) and its own `cost_center`/`location_code`
  field holding the real ERP code (used by actuals-side filters against
  raw PeopleSoft rows, via separate `erp_cost_center_value`/`erp_loc_value`
  parameters). Passing one where the other is expected silently returns
  zero or unfiltered results instead of erroring - always resolve
  explicitly rather than assuming a param name tells you which form it
  wants.
- **`is_direct_http_call(fn)`** (`budget_mis/api/response_crypto.py`)
  distinguishes a genuine HTTP dispatch to `fn` from an internal Python
  call to the same function. Permission scoping (`require_unit_access`/
  `get_allowed_units()`) must only trigger on the former - internal callers
  intentionally pass `unit=None` to mean "give me the full, already-trusted
  result" and must not be re-scoped to whatever user happens to be logged
  in. Any new endpoint that accepts a unit/cost-center/location-code
  parameter and returns financial data needs this check; a handful of
  endpoints were missing it and leaked org-wide data to any logged-in user
  before being fixed - audit new endpoints against this pattern.
- **A frontend nav restriction (`App Module Setting.restrict_by_role`) is
  not a permission check.** It only hides the menu entry - the backend
  endpoint behind it must enforce the same role/permission itself, or any
  logged-in user who knows the method name can call it directly.
- **Fixtures, not manual Desk setup, for shipped configuration.** Content
  that should exist on every deployment (the AI Assistant Guide sections,
  the sidebar/Home-tile `App Module Setting` records) is exported via
  `bench --site <site> export-fixtures --app budget_mis` into
  `budget_mis/fixtures/*.json` and listed in `hooks.py`'s `fixtures = [...]`
  - re-export after editing these records in Desk, or the change only
  exists on the site you edited it on.
- **Hand-editing a Workspace JSON file (`budget_mis/main/workspace/*/*.json`)
  does not take effect on a plain `bench migrate`** if that Workspace
  already exists in the DB - migrate only creates/removes Workspace
  records, it never re-syncs an existing one's content from disk. Picking
  up a hand-edited file needs either making the same edit through Desk's
  own Workspace editor UI, or deleting that one Workspace record and
  letting `bench migrate` recreate it. **Avoid
  `frappe.reload_doc(..., dt="Workspace", ..., force=True)`** as a
  shortcut for this - it has reproducibly caused the *next* `bench migrate`
  run to flag that Workspace as orphaned and delete it outright (recovered
  both times via the `Deleted Document` doctype's JSON snapshot, but don't
  rely on that path).
- **Never give `useCall` (frappe-ui) a `cacheKey` for a response that's
  role- or user-dependent.** A cache-keyed `useCall` persists its response
  to the browser's IndexedDB and shows that stale value immediately on the
  very next load/session, before the real fetch resolves - fine for a
  genuinely static resource (branding, meta), but a real bug for anything
  gated by the current user's roles/permissions (`get_app_modules`'s
  role-filtered module list, `get_app_config`'s `can_manage_settings`
  permission flag). Both were caching-keyed and both leaked a previous
  session/user's value across a role change + page reload until this was
  fixed (`frontend/src/data/modules.js`, `frontend/src/data/appConfig.js`) -
  the fix is simply omitting `cacheKey`, since these calls are already
  cheap and only fire once per page load/session via their own
  `if (!resource.data) resource.fetch()` guards.
- **A plain `window.location.reload()` anywhere in the app can race the PWA
  service worker's own auto-update logic** (`PwaUpdatePrompt.vue`) into a
  double reload: if a SW update happens to already be `waiting` at that
  exact moment, re-registering on the reloaded page re-fires Workbox's
  `waiting` → `skipWaiting()` → `controlling` chain, which schedules its
  own second reload once the new worker takes over. Fixed with a single
  `beforeunload` listener in `PwaUpdatePrompt.vue` that flags an in-progress
  reload and skips the SW's own redundant one - covers every reload call
  site in the app (the account-menu Reload/Clear Cache entries, the
  bfcache-restore guard, the Vite chunk-preload-error recovery, etc.)
  without each of them needing their own SW-awareness.
- **`Combination of unit settings.hide_number` ("Hide number?") is a
  display-only flag, scoped to specific tables - never blank the actuals
  a backend function returns because of it.** It only controls whether the
  Monthly MIS page's Operating/Capital Expense and Overall Foundation
  tables (`ExpenseTable.vue`/`ConsolidatedTable.vue`, via the `hideNumber`
  flag carried on each row) show that combination's figures as blank
  cells, excluded from Total/Grand Total - the Operating Expenses
  Breakdown cards (`UnitDetailGrid.vue`/`buildUnitDetailGrid`) and the
  Excel/PDF/PPTX export never look at this flag at all and always show
  every unit's real numbers. `get_monthly_mis_break_up`/
  `get_unit_wise_actuals_breakup`/`get_unit_wise_plan_budget` (`monthly_mis.py`/
  `foundation_consolidated.py`) always return the true, unblanked actuals
  alongside a `hide_number` flag on each entry - an earlier version of this
  blanked the figures in the backend itself, which silently zeroed them
  out for every consumer, including ones that were never meant to hide
  anything. A row with this flag set is still excluded from the row's own
  table's Total/Grand Total sums (both backend running totals and the
  frontend's own `buildExpTotals`/`buildConsolidatedRows`), since those
  sums would otherwise double back in a "hidden" row's real amount despite
  its own cells rendering blank.

### Local development data

Local dev data for `Overview number cards settings` (+ its child tables)
and `Finance Budget` (+ `Finance Budget Amounts`) can be synced from
production for realistic testing, given read-only DB credentials: pull
each table as TSV via a plain `mysql` SELECT (matching columns against the
local schema first - production has occasionally carried an extra, always-
empty column the local doctype doesn't define), then replace the local
rows via `frappe.db.sql` bulk inserts through the ORM's own connection
rather than a raw file-based import, so parent/child linkage stays
consistent. This is a full replace, not a merge - back up local rows first
(`mysqldump` the same tables) if they're not just disposable test data.

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app budget_mis
```

### Local development

```bash
# Backend: runs as part of `bench start` (honcho) like any other Frappe app.

# Frontend (Vue SPA under frontend/):
cd apps/budget_mis/frontend
yarn install
yarn dev     # dev server, proxied through bench's own dev server
yarn build   # production build -> budget_mis/public/frontend/
```

After editing any `AI Assistant Guide` / `App Module Setting` records in
Desk, re-export fixtures so the change ships with the app:

```bash
bench --site <site> export-fixtures --app budget_mis
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/budget_mis
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### License

mit
