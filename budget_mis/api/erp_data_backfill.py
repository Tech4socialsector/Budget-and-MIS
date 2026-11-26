import frappe

from budget_mis.api.erp_actuals import _get_actuals_from_erp_month_wise_raw, fetch_trial_balance_from_erp_raw
from budget_mis.api.erp_data import _encode_response
from budget_mis.master.doctype.erp_actuals_call_log.erp_actuals_call_log import log_call

# ANY real PeopleSoft fetch through this module (scheduled sync, one-time
# backfill, or a manual "Sync Now" button click, for EITHER data_type) takes
# this same lock first, since PeopleSoft cannot handle concurrent heavy
# queries (confirmed hard constraint - a real TimestampMismatchError
# collision happened once already when a manual test run and the real cron
# tick both refreshed the same period at the same moment). Defined here
# rather than in erp_data_sync.py to avoid a circular import (that module
# imports _backfill_plan/refresh_period from this one).
_SYNC_LOCK_KEY = "budget_mis:erp_data_sync:lock"
_SYNC_LOCK_TTL_SEC = 20 * 60

_FETCH_FNS = {
	"Actuals": _get_actuals_from_erp_month_wise_raw,
	"Trial Balance": fetch_trial_balance_from_erp_raw,
}

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


# The fixed, ordered backfill plan for ACTUALS - these 4 combinations run
# FIRST (the ones real pages actually default to), then every remaining
# period of the current fiscal year is filled in one by one afterward,
# then the FULL previous fiscal year (all 12 periods) for year-over-year
# comparisons. Built fresh per call (not at import time) since it reads
# "now". See _trial_balance_backfill_plan below for Trial Balance's own
# (narrower) plan - the two data_types do NOT share a plan.
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
	# user pick ANY financial year + any month. The full previous FY, all
	# 12 periods, is a small and FIXED set (never grows with "now" the way
	# the current FY's own range does) - covering it once here means no
	# report's year-over-year comparison for ANY month the user might pick
	# can ever hit a "not backfilled" gap, without resorting to a live-ERP
	# fallback (which this doctype deliberately has none of). Actuals-only:
	# Trial Balance Check has no year-over-year view, so its own plan below
	# never needs the previous FY at all.
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


# Trial Balance's own backfill plan - current fiscal year only (current
# month, every period 1..current_period of the current FY), with NO
# previous-FY coverage at all. Unlike Actuals, Trial Balance Check has no
# year-over-year comparison view, so last year's periods are simply never
# read by anything - fetching/storing them would be pure waste (a real
# PeopleSoft round trip and a stored row for data nothing ever uses).
def _trial_balance_backfill_plan():
	current_fy, current_period = _current_fiscal_year_and_period()

	plan = []
	for period in range(1, current_period + 1):
		plan.append({
			"fiscal_year": current_fy,
			"accounting_period": period,
			"description": (
				"Current year, current month" if period == current_period
				else f"Current year backfill - period {period} of current FY"
			),
		})
	return plan


_BACKFILL_PLANS = {
	"Actuals": _backfill_plan,
	"Trial Balance": _trial_balance_backfill_plan,
}


# Fetches and stores ONE (fiscal_year, accounting_period, data_type),
# creating its ERP Data record if it doesn't exist yet. Strictly sequential
# when called in a loop by the backfill/sync entry points below -
# PeopleSoft cannot handle concurrent heavy queries (confirmed hard
# constraint). call_type is passed straight through to the ERP Actuals Call
# Log entry - "Warm-up" for the scheduled sync job/one-time backfill (the
# default), "Manual Sync" for an admin's own "Sync Now" button click on the
# record itself (erp_data.js).
def refresh_period(fiscal_year, accounting_period, data_type, description=None, call_type="Warm-up"):
	period_key = f"{int(fiscal_year)}-{int(accounting_period):02d}-{data_type}"
	fetch_fn = _FETCH_FNS[data_type]

	start = frappe.utils.now_datetime()
	result = fetch_fn(fiscal_year, accounting_period)
	duration_ms = int((frappe.utils.now_datetime() - start).total_seconds() * 1000)

	if frappe.db.exists("ERP Data", period_key):
		doc = frappe.get_doc("ERP Data", period_key)
	else:
		doc = frappe.new_doc("ERP Data")
		doc.fiscal_year = fiscal_year
		doc.accounting_period = accounting_period
		doc.data_type = data_type
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
		source=f"erp_data_backfill.refresh_period ({data_type})",
		error_message=result.get("error") if result.get("status") != "success" else None,
	)
	return result.get("status") == "success"


# Whitelisted entry point for ERP Data's own "Sync Now" form button
# (erp_data.js) - re-fetches exactly this one record's (period, data_type)
# from PeopleSoft on demand, synchronously (this is a single,
# already-bounded fetch - up to the documented ~120s worst case - not the
# multi-period backfill/sync loop, so there's no need to background it the
# way those are). System Manager only, matching this doctype's own
# permissions (see erp_data.json) - a user with no Desk access to this
# doctype at all could never reach this button, but the check stays
# explicit here too, same convention as every other "any new
# @guest_api/whitelisted endpoint returning financial data needs its own
# permission check" case in this codebase (see CLAUDE.md's correctness
# traps #4/#5).
#
# Takes the SAME non-blocking lock refresh_actuals_data() (erp_data_sync.py)
# uses, before doing any real fetch - without this, a manual sync could
# fire while the scheduled job's own run is mid-flight (or two manual syncs
# could overlap, for the same or different data_type), reproducing the
# exact TimestampMismatchError collision + concurrent-PeopleSoft-query risk
# already seen once. A caller who can't get the lock gets a clear, honest
# "busy, try again shortly" error rather than silently queuing or racing.
@frappe.whitelist()
def sync_now(fiscal_year, accounting_period, data_type):
	if "System Manager" not in frappe.get_roles():
		frappe.throw(
			"Only a System Manager can trigger a manual ERP sync.",
			frappe.PermissionError,
		)

	if data_type not in _FETCH_FNS:
		frappe.throw(f"Unknown data_type: {data_type}")

	if not frappe.cache().set(_SYNC_LOCK_KEY, "1", nx=True, ex=_SYNC_LOCK_TTL_SEC):
		frappe.throw(
			"An ERP sync is already in progress (scheduled or manual) - please try again in a few minutes.",
			frappe.ValidationError,
		)

	try:
		ok = refresh_period(int(fiscal_year), int(accounting_period), data_type, call_type="Manual Sync")
	finally:
		frappe.cache().delete(_SYNC_LOCK_KEY)

	period_key = f"{int(fiscal_year)}-{int(accounting_period):02d}-{data_type}"
	doc = frappe.get_doc("ERP Data", period_key)
	return {
		"ok": ok,
		"status": doc.status,
		"row_count": doc.row_count,
		"last_fetched_at": doc.last_fetched_at,
	}


# Entry point for the one-time backfill (run manually, e.g. via `bench
# execute`) - runs each data_type's OWN ordered plan (_BACKFILL_PLANS;
# Actuals covers current FY + full previous FY, Trial Balance covers only
# the current FY), start to finish, strictly sequentially, logging each
# period's own result as it goes rather than only at the very end, so
# progress is visible if this is watched live while it runs.
def run_backfill():
	results = []
	for data_type, plan_fn in _BACKFILL_PLANS.items():
		for entry in plan_fn():
			ok = refresh_period(entry["fiscal_year"], entry["accounting_period"], data_type, entry["description"])
			results.append({**entry, "data_type": data_type, "ok": ok})
			frappe.logger().info(
				f"[erp_data_backfill] {data_type} - {entry['description']} "
				f"(fiscal_year={entry['fiscal_year']}, accounting_period={entry['accounting_period']}): "
				f"{'OK' if ok else 'FAILED'}"
			)
	return results
