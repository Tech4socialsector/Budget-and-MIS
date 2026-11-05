import frappe

from budget_mis.api.helper import get_accounting_period_from_month, get_previous_financial_year
from budget_mis.api.erp_actuals import get_actuals_from_erp_month_wise
from budget_mis.api.modules import module_visible_to_user
from budget_mis.master.doctype.erp_actuals_call_log.erp_actuals_call_log import log_call


# Same "default month" rule the Monthly MIS page itself uses (src/pages/
# MonthlyMis.vue's defaultFyAndMonth): the PREVIOUS completed calendar
# month, not the in-progress one, since the current month's actuals are
# usually still incomplete. Financial year follows the same April-start
# convention the whole app uses elsewhere.
def _default_financial_year_and_month():
    now = frappe.utils.now_datetime()
    year, month = now.year, now.month

    financial_year = f"{year}-{str(year + 1)[-2:]}" if month >= 4 else f"{year - 1}-{str(year)[-2:]}"

    prev_month_num = 12 if month == 1 else month - 1
    month_names = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ]
    month_name = month_names[prev_month_num - 1]

    return financial_year, month_name


def _current_financial_year_and_month():
    """Today's own financial year + calendar month - the default filter
    Budget vs Actuals/Dashboard open with (BudgetActualsBreakdown.vue's own
    CURRENT_MONTH_LABEL), as opposed to _default_financial_year_and_month's
    "previous completed month" rule for Monthly MIS."""
    now = frappe.utils.now_datetime()
    year, month = now.year, now.month
    financial_year = f"{year}-{str(year + 1)[-2:]}" if month >= 4 else f"{year - 1}-{str(year)[-2:]}"
    month_names = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ]
    return financial_year, month_names[month - 1]


# Which periods to warm and which App Module Setting(s) justify warming
# them - a fetch only runs if the logging-in user can see at least one of
# its listed modules (module_visible_to_user, the same check get_app_modules
# itself uses), so e.g. a role with no Foundation Consolidated access never
# wastes a PeopleSoft round trip warming that report's own period 12 fetch.
# Built fresh per call (not at import time) since it reads "now" via the
# two _*_financial_year_and_month helpers above.
def _planned_actuals_warm_up():
    current_fy, current_month = _current_financial_year_and_month()
    mis_fy, mis_month = _default_financial_year_and_month()
    mis_previous_fy = get_previous_financial_year(mis_fy)
    foundation_previous_fy = get_previous_financial_year(current_fy)

    return [
        {
            "label": f"{current_month} {current_fy}",
            "modules": ["budget_dashboard", "budget_vs_actual"],
            "financial_year": current_fy,
            "month": current_month,
        },
        {
            "label": f"{mis_month} {mis_fy}",
            "modules": ["mis_reports"],
            "financial_year": mis_fy,
            "month": mis_month,
        },
        {
            "label": f"{mis_month} {mis_previous_fy}",
            "modules": ["mis_reports"],
            "financial_year": mis_previous_fy,
            "month": mis_month,
        },
        {
            "label": f"March {foundation_previous_fy}",
            "modules": ["foundation_consolidated"],
            "financial_year": foundation_previous_fy,
            "month": "March",
        },
    ]


def _fetch_actuals_for_plan(entry):
    """Runs one planned warm-up fetch, returning its own result dict
    (status: "success"/"failed") rather than raising - a bad period must
    never stop the rest of the plan from running."""
    formatted = get_accounting_period_from_month(entry["month"], entry["financial_year"])
    return get_actuals_from_erp_month_wise(
        fiscal_year=formatted.get("fiscal_year"),
        accounting_period=formatted.get("accounting_period"),
    )


# Warms the shared server-side ERP actuals cache (api/erp_actuals.py's
# get_actuals_from_erp_month_wise, cache lifetime from ERP Credentials.
# actuals_cache_duration_minutes) for every period this user's own module
# access actually needs by default - Budget vs Actuals/Dashboard's current
# month, Monthly MIS's current+previous FY previous-completed-month, and
# Foundation Consolidated's previous-FY period 12 - skipping any of those
# the logging-in user has no module access to at all (_planned_actuals_
# warm_up). One real user's login warms this for EVERY user hitting the
# same period afterward, since the cache is keyed by (fiscal_year,
# accounting_period) only, not per-user.
#
# Fetches run ONE AT A TIME, never concurrently (same reasoning as
# monthly_mis.py's own sequential ERP fetches - PeopleSoft is a single
# shared server that cannot handle simultaneous heavy queries without both
# slowing down and timing out). A failed fetch does NOT stop the rest of
# the plan - every other period still gets its turn first - and every
# period that failed on this first pass gets exactly one retry at the very
# end, after the others have already had their turn (so a struggling
# PeopleSoft server isn't immediately hit again for the same period).
#
# Publishes "progress" realtime events (frappe.publish_progress) to the
# triggering user's own session after each fetch's own turn (including
# retries) - the Vue login page listens for this same event (see
# src/data/session.js's actualsCacheProgress) to drive a toast. The final
# event's own description is honest about partial failure (not a blanket
# "ready") if any period never succeeded even after its retry, and that
# failure is also logged via frappe.log_error so it's visible for
# follow-up rather than silently disappearing.
def warm_actuals_cache():
    user_roles = set(frappe.get_roles(frappe.session.user))
    all_entries = _planned_actuals_warm_up()

    plan = []
    for entry in all_entries:
        visible_modules = [
            m for m in entry["modules"]
            if frappe.db.exists("App Module Setting", m)
            and module_visible_to_user(frappe.get_cached_doc("App Module Setting", m), user_roles)
        ]
        if visible_modules:
            plan.append(entry)
        else:
            formatted = get_accounting_period_from_month(entry["month"], entry["financial_year"])
            log_call(
                call_type="Warm-up",
                fiscal_year=formatted.get("fiscal_year"),
                accounting_period=formatted.get("accounting_period"),
                cache_result="Skipped",
                source="warm_actuals_cache",
                modules=", ".join(entry["modules"]),
            )

    if not plan:
        frappe.publish_progress(
            percent=100,
            title="Loading actuals data",
            description="No actuals data needed for your modules.",
        )
        return

    def _run_and_log(entry):
        formatted = get_accounting_period_from_month(entry["month"], entry["financial_year"])
        start = frappe.utils.now_datetime()
        result = _fetch_actuals_for_plan(entry)
        duration_ms = int((frappe.utils.now_datetime() - start).total_seconds() * 1000)
        log_call(
            call_type="Warm-up",
            fiscal_year=formatted.get("fiscal_year"),
            accounting_period=formatted.get("accounting_period"),
            cache_result="Miss (fetched)",
            status="Success" if result.get("status") == "success" else "Failed",
            duration_ms=duration_ms,
            source="warm_actuals_cache",
            modules=", ".join(entry["modules"]),
            error_message=result.get("error") if result.get("status") != "success" else None,
        )
        return result

    total_steps = len(plan)
    failed = []

    for i, entry in enumerate(plan):
        frappe.publish_progress(
            percent=round(i / total_steps * 90),
            title="Loading actuals data",
            description=f"Fetching {entry['label']} actuals…",
        )
        result = _run_and_log(entry)
        if result.get("status") != "success":
            failed.append(entry)

    # One retry pass for anything that failed on the first pass, after
    # every other period has already had its own turn.
    still_failed = []
    for entry in failed:
        frappe.publish_progress(
            percent=90,
            title="Loading actuals data",
            description=f"Retrying {entry['label']} actuals…",
        )
        result = _run_and_log(entry)
        if result.get("status") != "success":
            still_failed.append(entry)

    if still_failed:
        labels = ", ".join(e["label"] for e in still_failed)
        frappe.log_error(
            title="Actuals warm-up failed",
            message=f"Could not pre-load actuals for: {labels}. Reports needing these periods will fetch live on first open.",
        )
        frappe.publish_progress(
            percent=100,
            title="Loading actuals data",
            description=f"Some actuals data couldn't be pre-loaded ({labels}) - affected reports may take longer to open.",
        )
    else:
        frappe.publish_progress(
            percent=100,
            title="Loading actuals data",
            description="Actuals data ready.",
        )


# on_session_creation hook target (see hooks.py - deliberately NOT
# on_login, see that file's comment for why) - enqueued as a background
# job so a real login never waits on this: the underlying PeopleSoft HTTP
# call can take up to 120s each, and this makes up to 4 of them in
# sequence in the worst case (nothing cached yet for any of the module-
# gated periods, plus up to one retry each).
#
# frappe.auth.LoginManager.__init__ calls make_session() - which is what
# fires on_session_creation - on BOTH a real login AND every time an
# unauthenticated visitor's session resume fails and a fresh Guest session
# gets created (i.e. on ordinary unauthenticated page loads, not just
# logins: see auth.py's __init__, the `except (AttributeError,
# DoesNotExistError): self.user = "Guest"; ...; self.make_session()`
# branch). Without this guard, every anonymous visit to the login page
# would enqueue this job and waste a real PeopleSoft round trip for
# nobody - confirmed happening in practice (worker.log showed this job
# running with user='Guest' from page loads with no real login involved).
def warm_actuals_cache_on_login(login_manager=None):
    if not login_manager or login_manager.user in (None, "Guest"):
        return

    frappe.enqueue(
        "budget_mis.startup.warm_actuals_cache",
        queue="long",
        job_id="budget_mis_warm_actuals_cache",
        deduplicate=True,
    )


# on_logout hook target (see hooks.py) - drops every cached ERP actuals
# entry this app created: the raw fetch (budget_mis:
# erp_actuals_month_wise:<fiscal_year>:<accounting_period>) and both derived
# aggregations built on top of it (budget_mis:group_actuals_ytd:... and
# budget_mis:group_actuals_by_gl_code:... - see api/grouped_actuals.py's
# own cache, shared by Monthly MIS and Budget vs Actuals alike), any period,
# regardless of who's logging out: the cache is shared across all users
# (keyed by period only, not per-user), so this is a deliberate "start
# clean" reset rather than a per-user cleanup - the next request for any
# period re-fetches/re-aggregates fresh and re-populates its own entry,
# same as a cold cache.
def clear_actuals_cache_on_logout(login_manager=None):
    frappe.cache().delete_keys("budget_mis:erp_actuals_month_wise:*")
    frappe.cache().delete_keys("budget_mis:group_actuals_ytd:*")
    frappe.cache().delete_keys("budget_mis:group_actuals_by_gl_code:*")


# doc_events on_update/on_trash hook target (see hooks.py) for "Overview
# number cards settings" - drops get_combination_table_settings_test's own
# short-TTL cache (api/number_card_settings.py) immediately whenever any
# card's settings change, rather than leaving a stale, already-wrong result
# (another admin's unsaved edit) cached for up to its own TTL. Keyed by
# table_name_filter, so there's no single key to target - every variant is
# cleared via the same wildcard pattern the actuals cache above already uses.
#
# Also drops every api/foundation_consolidated.py *_page_data cache entry
# (budget_mis:foundation_consolidated:...) - each of those combined
# responses is itself built on top of get_combination_table_settings_1/_test,
# so a stale card-settings edit was previously still visible through
# Foundation Consolidated's own tabs for up to that cache's own TTL (same
# window as the ERP actuals cache, commonly 15 minutes) even though the
# settings list itself already showed the new value - confirmed as a real,
# not just theoretical, invalidation gap.
def clear_combination_table_settings_cache(doc=None, method=None):
    frappe.cache().delete_keys("budget_mis:combination_table_settings:*")
    frappe.cache().delete_keys("budget_mis:foundation_consolidated:*")


# doc_events on_update/on_trash hook target (see hooks.py) for "AI Assistant
# Guide" - ai/guide_builder.py's regenerate_* functions and ai/guide_review.py's
# approve/reject already each explicitly delete_value this same key right
# after their own save(), but those bespoke write paths aren't the only way
# this doctype can be edited - an admin opening "AI Assistant Guide" directly
# in Desk and editing a point's wording or toggling is_active bypassed all
# three of those call sites, since nothing was wired to the doctype's own
# save/delete events. GUIDE_CACHE_SECONDS is only 60s, so the practical
# impact was always small, but the gap was real: this closes it the same way
# every other admin-edited master doctype backing a cache already is.
def clear_ai_guide_cache(doc=None, method=None):
    frappe.cache().delete_value("budget_mis_ai_assistant_guide")
