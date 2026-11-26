import frappe

from budget_mis.api.erp_actuals import _get_actuals_from_erp_month_wise_raw
from budget_mis.api.erp_actuals_data import _encode_response
from budget_mis.master.doctype.erp_actuals_call_log.erp_actuals_call_log import log_call

# Shared with erp_actuals_sync.py's own refresh_actuals_data() - ANY real
# PeopleSoft fetch through this module (scheduled sync, one-time backfill,
# or a manual "Sync Now" button click) takes this same lock first, since
# PeopleSoft cannot handle concurrent heavy queries (confirmed hard
# constraint - a real TimestampMismatchError collision happened once
# already this session when a manual test run and the real cron tick both
# refreshed the same period at the same moment). Defined here rather than
# in erp_actuals_sync.py to avoid a circular import (that module already
# imports _backfill_plan/refresh_period from this one).
_SYNC_LOCK_KEY = "budget_mis:erp_actuals_sync:lock"
_SYNC_LOCK_TTL_SEC = 20 * 60

# April-start accounting period: calendar month 4 (April) -> period 1,
# ..., calendar month 3 (March) -> period 12. Mirrors budget_mis.startup's
# own _current_financial_year_and_month, but returns the ERP's raw
# (fiscal_year, accounting_period) values directly instead of a financial-
# year string + month name, since the backfill works in raw ERP terms.
def _current_fiscal_year_and_period():
	now = frappe.utils.now_datetime()
	year, month = now.year, now.month
	fiscal_year = year if month >= 4 else year - 1
	accounting_period = month - 3 if month >= 4 else month + 9
	return fiscal_year, accounting_period


# One accounting period back from (fiscal_year, accounting_period) - period
# 1 (April) of a fiscal_year rolls back to period 12 (March) of the
# PREVIOUS fiscal_year, same wraparound budget_mis.startup's own
# _default_financial_year_and_month already applies to calendar months.
def _one_period_back(fiscal_year, accounting_period):
	if accounting_period == 1:
		return fiscal_year - 1, 12
	return fiscal_year, accounting_period - 1


# The fixed, ordered backfill plan - these 4 combinations run FIRST (the
# ones real pages actually default to), then every remaining period of the
# current fiscal year is filled in one by one afterward. Built fresh per
# call (not at import time) since it reads "now".
#
# Current year, current month and Current year, last month are both within
# the current FY's own 1..current_period range, so the "one by one" phase
# below skips re-fetching whichever of its own periods this phase already
# covered - every period still ends up fetched exactly once, just in a
# deliberate priority order rather than plain chronological order.
def _backfill_plan():
	current_fy, current_period = _current_fiscal_year_and_period()
	last_month_fy, last_month_period = _one_period_back(current_fy, current_period)
	prev_fy = current_fy - 1

	priority = [
		{
			"fiscal_year": current_fy,
			"accounting_period": current_period,
			"description": "Current year, current month",
		},
		{
			"fiscal_year": last_month_fy,
			"accounting_period": last_month_period,
			"description": "Current year, last month",
		},
		{
			"fiscal_year": prev_fy,
			"accounting_period": last_month_period,
			"description": "Previous year, last month",
		},
		{
			"fiscal_year": prev_fy,
			"accounting_period": 12,
			"description": "Previous year, accounting period 12 (March)",
		},
	]

	# Dedupe while preserving priority order - the previous-year "last
	# month" entry above and the "period 12" entry can coincide (last
	# month wraps to March), and any priority entry can coincide with one
	# the one-by-one phase below would also generate.
	seen = set()
	deduped_priority = []
	for entry in priority:
		key = (entry["fiscal_year"], entry["accounting_period"])
		if key in seen:
			continue
		seen.add(key)
		deduped_priority.append(entry)

	one_by_one = []
	for period in range(1, current_period + 1):
		key = (current_fy, period)
		if key in seen:
			continue
		seen.add(key)
		one_by_one.append({
			"fiscal_year": current_fy,
			"accounting_period": period,
			"description": f"Current year backfill - period {period} of current FY",
		})

	# Every report that compares against "last year" (Monthly MIS's own
	# year-over-year columns) does so at the SAME accounting_period number
	# as whatever month/FY the user is viewing - and Monthly MIS lets a
	# user pick ANY financial year + any month (confirmed via a real user
	# hitting a "not backfilled" error on FY2026-27/September, which needs
	# FY2025 period 6 - a combination the original 4-combination priority
	# phase never covered, since it only ever touched previous-FY "last
	# month" and period 12). The full previous FY, all 12 periods, is a
	# small and FIXED set (never grows with "now" the way the current FY's
	# own range does) - covering it once here means no report's year-over-
	# year comparison for ANY month the user might pick can ever hit this
	# gap again, without resorting to a live-ERP fallback (which this
	# doctype deliberately has none of).
	previous_fy_full = []
	for period in range(1, 13):
		key = (prev_fy, period)
		if key in seen:
			continue
		seen.add(key)
		previous_fy_full.append({
			"fiscal_year": prev_fy,
			"accounting_period": period,
			"description": f"Previous year backfill - period {period} of previous FY (year-over-year coverage)",
		})

	return deduped_priority + one_by_one + previous_fy_full


# Fetches and stores ONE period, creating its ERP Actuals Data record if it
# doesn't exist yet. Strictly sequential when called in a loop by the
# backfill/sync entry points below - PeopleSoft cannot handle concurrent
# heavy queries (confirmed hard constraint from earlier, real-incident-
# backed work on this same ERP integration). call_type is passed straight
# through to the ERP Actuals Call Log entry - "Warm-up" for the scheduled
# sync job/one-time backfill (the default, preserving every existing
# caller's own logged call_type), "Manual Sync" for an admin's own "Sync
# Now" button click on the record itself (erp_actuals_data.js).
def refresh_period(fiscal_year, accounting_period, description=None, call_type="Warm-up"):
	period_key = f"{int(fiscal_year)}-{int(accounting_period):02d}"

	start = frappe.utils.now_datetime()
	result = _get_actuals_from_erp_month_wise_raw(fiscal_year, accounting_period)
	duration_ms = int((frappe.utils.now_datetime() - start).total_seconds() * 1000)

	if frappe.db.exists("ERP Actuals Data", period_key):
		doc = frappe.get_doc("ERP Actuals Data", period_key)
	else:
		doc = frappe.new_doc("ERP Actuals Data")
		doc.fiscal_year = fiscal_year
		doc.accounting_period = accounting_period
		doc.description = description or ""

	if result.get("status") == "success":
		doc.status = "Success"
		doc.row_count = result.get("count") or len(result.get("data") or [])
		doc.response_json = _encode_response(result)
		doc.last_fetched_at = frappe.utils.now_datetime()
	else:
		# A failed fetch leaves any PREVIOUS successful response_json in
		# place - status/row_count reflect the failure for observability,
		# but a report reading this period still gets the last known-good
		# data instead of nothing, if there is one.
		doc.status = "Failed"

	doc.save(ignore_permissions=True)
	frappe.db.commit()

	log_call(
		call_type=call_type,
		fiscal_year=fiscal_year,
		accounting_period=accounting_period,
		cache_result="Miss (fetched)",
		status="Success" if result.get("status") == "success" else "Failed",
		duration_ms=duration_ms,
		source="erp_actuals_backfill.refresh_period",
		error_message=result.get("error") if result.get("status") != "success" else None,
	)
	return result.get("status") == "success"


# Whitelisted entry point for ERP Actuals Data's own "Sync Now" form button
# (erp_actuals_data.js) - re-fetches exactly this one record's period from
# PeopleSoft on demand, synchronously (this is a single, already-bounded
# fetch - up to the documented ~120s worst case - not the multi-period
# backfill/sync loop, so there's no need to background it the way those
# are). System Manager only, matching this doctype's own permissions (see
# erp_actuals_data.json) - a user with no Desk access to this doctype at
# all could never reach this button, but the check stays explicit here
# too, same convention as every other "any new @guest_api/whitelisted
# endpoint returning financial data needs its own permission check" case
# in this codebase (see CLAUDE.md's correctness traps #4/#5).
#
# Takes the SAME non-blocking lock refresh_actuals_data() (erp_actuals_
# sync.py) uses, before doing any real fetch - without this, a manual sync
# could fire while the scheduled job's own run is mid-flight (or two manual
# syncs could overlap), reproducing the exact TimestampMismatchError
# collision + concurrent-PeopleSoft-query risk already seen once this
# session. A caller who can't get the lock gets a clear, honest "busy, try
# again shortly" error rather than silently queuing or racing.
@frappe.whitelist()
def sync_now(fiscal_year, accounting_period):
	if "System Manager" not in frappe.get_roles():
		frappe.throw(
			"Only a System Manager can trigger a manual ERP actuals sync.",
			frappe.PermissionError,
		)

	if not frappe.cache().set(_SYNC_LOCK_KEY, "1", nx=True, ex=_SYNC_LOCK_TTL_SEC):
		frappe.throw(
			"An actuals sync is already in progress (scheduled or manual) - please try again in a few minutes.",
			frappe.ValidationError,
		)

	try:
		ok = refresh_period(int(fiscal_year), int(accounting_period), call_type="Manual Sync")
	finally:
		frappe.cache().delete(_SYNC_LOCK_KEY)

	period_key = f"{int(fiscal_year)}-{int(accounting_period):02d}"
	doc = frappe.get_doc("ERP Actuals Data", period_key)
	return {
		"ok": ok,
		"status": doc.status,
		"row_count": doc.row_count,
		"last_fetched_at": doc.last_fetched_at,
	}


# Entry point for the one-time backfill (run manually, e.g. via `bench
# execute`) - runs the full ordered plan from _backfill_plan() start to
# finish, strictly sequentially, logging each period's own result as it
# goes rather than only at the very end, so progress is visible if this is
# watched live while it runs (it can take a while: roughly
# current_accounting_period + 1 real ERP calls, each up to 90-120s in the
# documented worst case).
def run_backfill():
	plan = _backfill_plan()
	results = []
	for entry in plan:
		ok = refresh_period(entry["fiscal_year"], entry["accounting_period"], entry["description"])
		results.append({**entry, "ok": ok})
		frappe.logger().info(
			f"[erp_actuals_backfill] {entry['description']} "
			f"(fiscal_year={entry['fiscal_year']}, accounting_period={entry['accounting_period']}): "
			f"{'OK' if ok else 'FAILED'}"
		)
	return results
