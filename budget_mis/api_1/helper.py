import re
import time
from decimal import Decimal

import frappe


# Safely converts a value (including None or malformed numeric strings) to a float, returning 0.0 on any failure.
def to_number(x):
    if x is None:
        return 0.0
    try:
        return float(Decimal(str(x)))
    except Exception:
        return 0.0


# Collapses repeated whitespace and uppercases a value, for case/spacing-insensitive head/sub-head/item name comparisons.
def normalize(val):
    return re.sub(r"\s+", " ", str(val or "")).strip().upper()


# Returns (user_name, password) for the PeopleSoft production endpoints from the ERP Credentials singleton.
def get_peoplesoft_prod_credentials():
    doc = frappe.get_single("ERP Credentials")
    return doc.peoplesoft_erp_user_name_prod, doc.get_password("peoplesoft_erp_password_prod")


# How long a fetched ERP actuals period stays cached (ERP Credentials.actuals_cache_duration_minutes), read fresh on every call so changing the setting takes effect immediately - falls back to 15 minutes if unset/zero (e.g. before the field has ever been saved).
def get_actuals_cache_duration_seconds():
    minutes = frappe.db.get_single_value("ERP Credentials", "actuals_cache_duration_minutes")
    return (minutes or 15) * 60


# Formats a 4-digit calendar year as this app's "YYYY-YY" financial-year string.
def format_financial_year(year):
    year = int(year)
    return f"{year}-{str(year + 1)[-2:]}"


# "Fetch-once, everyone else waits" around an expensive call (the real
# PeopleSoft ERP HTTP round trip, up to 90s) - every one of this app's own
# cached ERP wrappers (api/erp_actuals.py, api_1/erp_actuals.py,
# api_1/grouped_actuals.py) used to do a plain "check cache, miss -> fetch"
# with no lock at all, so a login warm-up job and a page load landing on the
# same uncached period at the same moment could each independently fire the
# real ERP call - confirmed as a real gap, not hypothetical, since this app
# runs multiple worker processes (see Procfile's dedicated worker_long entry)
# and a plain in-process threading.Lock would only ever protect ONE of them.
#
# frappe.cache() is itself a redis-py client (RedisWrapper subclasses
# redis.Redis directly - frappe/utils/redis_wrapper.py), so its own
# inherited .set(nx=True, ex=...) gives a real atomic "SET if not exists"
# distributed lock usable from any worker process, something frappe's own
# set_value()/get_value() wrappers don't expose. The lock key needs
# frappe.cache().make_key() applied manually (raw .set/.get bypass the
# prefixing set_value/get_value do for you); the cached VALUE itself still
# goes through the normal get_value/set_value path so it keeps frappe's
# usual pickling + per-process local-cache behavior.
#
# Lock holder: does the real fetch, writes the result via set_value(),
# deletes its own lock key in a finally block (so the next caller for a
# DIFFERENT period, or this same period after the cache TTL elapses, is
# never stuck waiting on a stale lock past this grace period). Everyone
# else: polls the real cache key (not the lock) every poll_interval_sec,
# capped at max_wait_sec - if the lock holder never finishes in time (e.g.
# its own worker died), the last waiter gives up waiting and runs the fetch
# itself exactly once, rather than returning an error for a fetch that may
# well have actually succeeded moments later.
def cache_with_single_flight(cache_key, fetch_fn, is_cacheable, expires_in_sec, max_wait_sec=100, poll_interval_sec=0.5):
    cached = frappe.cache().get_value(cache_key)
    if cached is not None:
        return cached

    lock_key = frappe.cache().make_key(f"{cache_key}:lock")
    got_lock = frappe.cache().set(lock_key, "1", nx=True, ex=30)

    if got_lock:
        try:
            result = fetch_fn()
            if is_cacheable(result):
                frappe.cache().set_value(cache_key, result, expires_in_sec=expires_in_sec)
            return result
        finally:
            frappe.cache().delete(lock_key)

    waited = 0.0
    while waited < max_wait_sec:
        time.sleep(poll_interval_sec)
        waited += poll_interval_sec
        cached = frappe.cache().get_value(cache_key)
        if cached is not None:
            return cached

    # The lock holder never finished (crashed worker, or genuinely still
    # running past max_wait_sec) - run the fetch ourselves rather than
    # leaving this caller with nothing. Doesn't re-acquire the lock: that
    # lock's own 30s TTL has already elapsed by the time max_wait_sec (100s
    # default) is reached, so a fresh caller arriving right now would
    # already be free to acquire it and race this fallback fetch - an
    # acceptable, rare edge case (lock holder genuinely stuck), not the
    # normal path.
    result = fetch_fn()
    if is_cacheable(result):
        frappe.cache().set_value(cache_key, result, expires_in_sec=expires_in_sec)
    return result


# Converts a month name + financial year into an accounting_period number (April=1 ... March=12) and the fiscal year start.
def get_accounting_period_from_month(month, financial_year=None):
    month_map = {
        "march": 12,
        "april": 1,
        "may": 2,
        "june": 3,
        "july": 4,
        "august": 5,
        "september": 6,
        "october": 7,
        "november": 8,
        "december": 9,
        "january": 10,
        "february": 11,
    }

    month = (month or "").strip().lower()
    financial_year = (financial_year or "").strip()

    if month not in month_map:
        frappe.throw("Invalid month. Use April to March")

    accounting_period = month_map[month]

    fiscal_year_start = None
    if financial_year:
        try:
            fiscal_year_start = int(financial_year.split("-")[0])
        except Exception:
            frappe.throw("Invalid Financial Year format. Use format like 2025-26")

    return {
        "accounting_period": accounting_period,
        "fiscal_year": fiscal_year_start
    }


# Returns the financial year immediately before the given one, in the same "YYYY-YY" format.
def get_previous_financial_year(financial_year):
    start_year = int(financial_year.split("-")[0])
    prev_start = start_year - 1
    prev_end = str(prev_start + 1)[-2:]

    return f"{prev_start}-{prev_end}"
