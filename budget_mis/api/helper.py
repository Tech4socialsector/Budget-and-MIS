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


# Joins a list of cost-center/location-code codes into the comma-separated string get_combined_actuals and friends expect for their unit/cost_center/location_code params - drops any falsy entries, returns "" for an empty/None list.
def _safe_join(arr):
    return ",".join([str(v).strip() for v in (arr or []) if v])


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
# cached ERP wrappers (api/erp_actuals.py, api/grouped_actuals.py) used to
# do a plain "check cache, miss -> fetch"
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
# its own worker died), a waiter whose own wait window elapses tries to
# become the new lock holder itself (via the same nx=True acquire) rather
# than unconditionally calling fetch_fn() - if it succeeds, this is exactly
# the lock-holder path above, just entered late; if it loses that race (a
# DIFFERENT timed-out waiter grabbed the lock a moment earlier), it polls
# the cache key once more for that fetch's result instead of also firing
# its own redundant PeopleSoft call.
#
# LOCK_TTL_SEC must comfortably exceed the slowest real fetch this guards
# (the PeopleSoft HTTP call itself uses requests.get(timeout=90) -
# api/erp_actuals.py), not just the typical case - a lock held for longer
# than its own TTL expires out from under its holder while the fetch is
# still genuinely running, letting a second caller acquire the "freed" lock
# and fire a second concurrent PeopleSoft call for the same period. This
# was a real bug (TTL was 30s against a fetch documented as taking up to
# 90-120s), the likely cause of Monthly MIS's intermittent failures under
# load - two concurrent 90s+ calls to the same PeopleSoft endpoint are far
# more likely to genuinely time out or get rejected than one.
LOCK_TTL_SEC = 150


def cache_with_single_flight(cache_key, fetch_fn, is_cacheable, expires_in_sec, max_wait_sec=160, poll_interval_sec=0.5):
    cached = frappe.cache().get_value(cache_key)
    if cached is not None:
        return cached

    lock_key = frappe.cache().make_key(f"{cache_key}:lock")
    got_lock = frappe.cache().set(lock_key, "1", nx=True, ex=LOCK_TTL_SEC)

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

    # The lock holder never finished within max_wait_sec (comfortably
    # longer than LOCK_TTL_SEC, so this is a genuinely stuck/crashed
    # worker, not just a slow-but-healthy fetch) - try to become the new
    # lock holder via the same atomic nx=True acquire used above, so at
    # most one of however many waiters hit this point simultaneously
    # actually fires a new fetch.
    if frappe.cache().set(lock_key, "1", nx=True, ex=LOCK_TTL_SEC):
        try:
            result = fetch_fn()
            if is_cacheable(result):
                frappe.cache().set_value(cache_key, result, expires_in_sec=expires_in_sec)
            return result
        finally:
            frappe.cache().delete(lock_key)

    # Lost the race for the fallback lock too - someone else (another
    # timed-out waiter) is already retrying; give their fetch one more
    # short window before giving up and returning whatever they produce
    # (or nothing, if they also fail - the caller's own is_cacheable/status
    # checks are what ultimately decide how that's surfaced).
    waited = 0.0
    while waited < poll_interval_sec * 20:
        time.sleep(poll_interval_sec)
        waited += poll_interval_sec
        cached = frappe.cache().get_value(cache_key)
        if cached is not None:
            return cached
    return fetch_fn()


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


# Sums head-level ytd/total_posted_amt_ytd across all heads into a single grand total pair.
def calculate_grand_total(actuals):
    grand_ytd = 0
    grand_actual = 0
    for head in actuals:
        grand_ytd += head.get("ytd", 0) or 0
        grand_actual += head.get("total_posted_amt_ytd", 0) or 0
    return {
        "grand_total_ytd": round(grand_ytd, 2),
        "grand_total_actual": round(grand_actual, 2)
    }


# Rolls item ytd/total_posted_amt up into sub-head and head totals (in place), rounded to 2 decimals.
def calculate_totals(actuals):
    for head in actuals:
        total_ytd = 0
        total_actual = 0
        if head.get("sub_heads"):
            for sub in head.get("sub_heads", []):
                sub_ytd = 0
                sub_actual = 0
                for item in sub.get("items", []):
                    sub_ytd += item.get("ytd", 0) or 0
                    sub_actual += item.get("total_posted_amt", 0) or 0
                sub["ytd"] = round(sub_ytd, 2)
                sub["total_posted_amt_ytd"] = round(sub_actual, 2)
                total_ytd += sub_ytd
                total_actual += sub_actual
        else:
            for item in head.get("items", []):
                total_ytd += item.get("ytd", 0) or 0
                total_actual += item.get("total_posted_amt", 0) or 0
        head["ytd"] = round(total_ytd, 2)
        head["total_posted_amt_ytd"] = round(total_actual, 2)
    return actuals


# Merges several units' head/sub-head/item trees into one, summing ytd/total_posted_amt at every matching node by name. Used wherever several per-unit get_combined_actuals trees need to be rolled up into a single consolidated tree (Monthly MIS break-up/drill-down, Foundation Consolidated's unit-wise breakup, Budget vs Actuals' Operating Unit theme cards). A head's own top-level "items" and its "sub_heads" are always mutually exclusive in every tree this app produces (get_combined_actuals's own structure-building only ever populates one or the other for a given head - see budget_actuals_combined.py), so both are merged unconditionally rather than branching on which one is present; pass sort_by_sequence=True to additionally sort the returned heads by sequence_id (Budget vs Actuals' theme-card merge needs this, Monthly MIS/Foundation Consolidated's callers sort their own results separately further up the call chain).
def consolidate_actuals(all_unit_actuals, sort_by_sequence=False):
    head_map = {}
    for unit_data in all_unit_actuals:
        for head in unit_data:
            key = head["name"]
            if key not in head_map:
                head_map[key] = {
                    "name": head["name"],
                    "sequence_id": head["sequence_id"],
                    "sub_heads": [],
                    "items": [],
                    "ytd": 0,
                    "total_posted_amt_ytd": 0
                }
            head_map[key]["ytd"] += head.get("ytd", 0)
            head_map[key]["total_posted_amt_ytd"] += head.get("total_posted_amt_ytd", 0)

            sub_map = {s["name"]: s for s in head_map[key]["sub_heads"]}
            for sub in head.get("sub_heads", []):
                if sub["name"] not in sub_map:
                    new_sub = {
                        "name": sub["name"],
                        "sequence_id": sub["sequence_id"],
                        "items": [],
                        "ytd": 0,
                        "total_posted_amt_ytd": 0
                    }
                    head_map[key]["sub_heads"].append(new_sub)
                    sub_map[sub["name"]] = new_sub
                sub_map[sub["name"]]["ytd"] += sub.get("ytd", 0)
                sub_map[sub["name"]]["total_posted_amt_ytd"] += sub.get("total_posted_amt_ytd", 0)
                item_map = {i["name"]: i for i in sub_map[sub["name"]]["items"]}
                for item in sub.get("items", []):
                    if item["name"] not in item_map:
                        new_item = {
                            "name": item["name"],
                            "sequence_id": item["sequence_id"],
                            "gl_code": item.get("gl_code"),
                            "ytd": 0,
                            "total_posted_amt": 0
                        }
                        sub_map[sub["name"]]["items"].append(new_item)
                        item_map[item["name"]] = new_item
                    item_map[item["name"]]["ytd"] += item.get("ytd", 0)
                    item_map[item["name"]]["total_posted_amt"] += item.get("total_posted_amt", 0)

            item_map = {i["name"]: i for i in head_map[key]["items"]}
            for item in head.get("items", []):
                if item["name"] not in item_map:
                    new_item = {
                        "name": item["name"],
                        "sequence_id": item["sequence_id"],
                        "gl_code": item.get("gl_code"),
                        "ytd": 0,
                        "total_posted_amt": 0
                    }
                    head_map[key]["items"].append(new_item)
                    item_map[item["name"]] = new_item
                item_map[item["name"]]["ytd"] += item.get("ytd", 0)
                item_map[item["name"]]["total_posted_amt"] += item.get("total_posted_amt", 0)

    heads = list(head_map.values())
    if sort_by_sequence:
        heads = sorted(heads, key=lambda h: h.get("sequence_id") or 0)
    return heads
