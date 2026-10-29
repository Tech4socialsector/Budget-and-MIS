import frappe

from budget_mis.api_1.helper import get_accounting_period_from_month, get_previous_financial_year
from budget_mis.api_1.erp_actuals import get_actuals_from_erp_month_wise


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


# Warms the shared server-side ERP actuals cache (api_1/erp_actuals.py's
# get_actuals_from_erp_month_wise, cache lifetime from ERP Credentials.
# actuals_cache_duration_minutes) for the two periods a Monthly MIS page
# load actually needs by default: the current financial year's previous
# completed month, then the same month in the previous financial year. One
# real user's login warms this for EVERY user hitting the same period
# afterward, since the cache is keyed by (fiscal_year, accounting_period)
# only, not per-user.
#
# Publishes "progress" realtime events (frappe.publish_progress) to the
# triggering user's own session at each of the only two real milestones
# this job has - 0% (starting), 50% (current period done), 100% (both
# done) - there's no finer-grained progress available from inside either
# fetch itself (each is a single blocking HTTP call to PeopleSoft, not
# something that reports partial progress), so this is deliberately a
# 2-step indicator, not a smooth bar. The Vue login page listens for this
# same event (see src/data/session.js's actualsCacheProgress) to drive a
# toast.
def warm_actuals_cache():
    financial_year, month = _default_financial_year_and_month()

    frappe.publish_progress(
        percent=0,
        title="Loading actuals data",
        description=f"Fetching {month} {financial_year} actuals…",
    )

    current = get_accounting_period_from_month(month, financial_year)
    get_actuals_from_erp_month_wise(
        fiscal_year=current.get("fiscal_year"),
        accounting_period=current.get("accounting_period"),
    )

    previous_financial_year = get_previous_financial_year(financial_year)
    frappe.publish_progress(
        percent=50,
        title="Loading actuals data",
        description=f"Fetching {month} {previous_financial_year} actuals…",
    )

    previous = get_accounting_period_from_month(month, previous_financial_year)
    get_actuals_from_erp_month_wise(
        fiscal_year=previous.get("fiscal_year"),
        accounting_period=previous.get("accounting_period"),
    )

    frappe.publish_progress(
        percent=100,
        title="Loading actuals data",
        description="Actuals data ready.",
    )


# on_session_creation hook target (see hooks.py - deliberately NOT
# on_login, see that file's comment for why) - enqueued as a background
# job so a real login never waits on this: the underlying PeopleSoft HTTP
# call can take up to 120s each, and this makes two of them in sequence in
# the worst case (nothing cached yet for either period).
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
# budget_mis:group_actuals_by_gl_code:... - see api_1/grouped_actuals.py's
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
# short-TTL cache (api_1/number_card_settings.py) immediately whenever any
# card's settings change, rather than leaving a stale, already-wrong result
# (another admin's unsaved edit) cached for up to its own TTL. Keyed by
# table_name_filter, so there's no single key to target - every variant is
# cleared via the same wildcard pattern the actuals cache above already uses.
def clear_combination_table_settings_cache(doc=None, method=None):
    frappe.cache().delete_keys("budget_mis:combination_table_settings:*")
