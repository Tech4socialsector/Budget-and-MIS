### Annual Budget MIS

A Frappe app for managing and tracking annual budget allocations against
real PeopleSoft ERP actuals, with a Vue 3 frontend (`frontend/`) served at
`/budget-mis` instead of the standard Frappe Desk UI.

### What this app does

- **Budget**: Finance users upload annual budgets (per Unit / Cost Center /
  Location Code / head-sub-head-item of expense) via an Excel template,
  stored as `Finance Budget` docs with embedded `Finance Budget Amounts`
  child rows (one row per expense line, with April-March monthly columns).
- **Actuals**: Real spend is pulled live from a PeopleSoft ERP HTTP API
  (`budget_mis/api/erp_utils.py`, `erp_actuals.py` / `api_1/erp_actuals.py`),
  cached server-side (`ERP Credentials.actuals_cache_duration_minutes`)
  since a single ERP call can take up to 90-120s.
- **Reporting**: Budget vs Actuals, Monthly MIS, Foundation Consolidated,
  and dashboard pages merge the two sides together (the budget tree from
  `get_budget_summary`/`get_budget_ytd_by_sequence`, actuals from
  `group_actuals_ytd` and friends, combined in `get_combined_actuals`).
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

- `budget_mis/api/` - the original/legacy API surface (still the only
  live path for `erp_actuals.py`'s raw ERP HTTP calls, `phase_sheet.py`,
  `finance_budget.py`, etc).
- `budget_mis/api_1/` - the newer, actively-developed API surface most
  current reporting pages call (`budget_summary.py`, `budget_vs_actual.py`,
  `foundation_consolidated.py`, `monthly_mis.py`, `budget_import.py`,
  `combination_reconciliation.py`, ...). New reporting work generally
  belongs here, not in `api/`, unless it's extending something that
  already lives in the older module.
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
