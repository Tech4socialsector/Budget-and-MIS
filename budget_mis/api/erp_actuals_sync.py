import frappe

from budget_mis.api.erp_actuals_backfill import _backfill_plan, refresh_period, _SYNC_LOCK_KEY, _SYNC_LOCK_TTL_SEC

DEFAULT_SYNC_INTERVAL_MINUTES = 30

# Guards against two refresh_actuals_data() runs overlapping - confirmed as
# a REAL collision, not theoretical: the cron tick fired while a manually
# -triggered run was still in progress, and both tried to refresh the same
# stale period at once, one of them hitting a TimestampMismatchError on
# save (Frappe's own optimistic-lock check correctly caught the race, but
# the run itself then crashed instead of just skipping that period).
# Non-blocking (nx=True, no retry/wait) - a run that can't get the lock
# just returns immediately rather than queuing up: the point is "refresh
# whatever's stale," and a skipped tick is caught by the next one anyway,
# so there's nothing worth waiting for. Lock TTL comfortably exceeds the
# slowest real full run observed (~5 minutes to refresh all periods from
# cold) so a crashed run's lock still self-expires rather than wedging
# every future tick open forever.
#
# _SYNC_LOCK_KEY/_SYNC_LOCK_TTL_SEC now live in erp_actuals_backfill.py
# (imported here, not redefined) so sync_now's own "Sync Now" button can
# take the SAME lock - a manual sync and this scheduled job are just as
# capable of colliding with each other as two runs of this job are.


def _sync_interval_seconds():
	minutes = frappe.db.get_single_value("ERP Credentials", "actuals_sync_interval_minutes")
	return (minutes or DEFAULT_SYNC_INTERVAL_MINUTES) * 60


# Scheduled job entry point (see hooks.py's scheduler_events) - keeps every
# ERP Actuals Data record up to date on ERP Credentials.
# actuals_sync_interval_minutes, and makes sure today's own current period
# always has a record (so a new month rolling over gets picked up
# automatically, the same way the one-time backfill first populated it).
#
# Walks the SAME ordered plan the one-time backfill uses (_backfill_plan:
# current year/current month, current year/last month, previous year/last
# month, previous year/period 12, then every remaining period of the
# current FY one by one) rather than whatever order frappe.get_all()
# happens to return existing records in - a period outside this plan (an
# older period from a past backfill run, if the plan's own "current" shifts
# forward as months pass) is simply never revisited by this job; it stays
# at whatever data it last had. Only periods the plan still names, and
# that are actually due for a refresh (new, or past max_age_sec), get a
# real fetch - most ticks should find everything already fresh.
#
# Strictly sequential, one real PeopleSoft fetch at a time - the real ERP
# server cannot handle concurrent heavy queries (confirmed hard
# constraint). A tick with nothing stale just does a handful of
# frappe.db.get_value reads and returns - most ticks should be that cheap.
def refresh_actuals_data():
	if not frappe.cache().set(_SYNC_LOCK_KEY, "1", nx=True, ex=_SYNC_LOCK_TTL_SEC):
		return

	try:
		max_age_sec = _sync_interval_seconds()
		now = frappe.utils.now_datetime()

		for entry in _backfill_plan():
			period_key = f"{entry['fiscal_year']}-{entry['accounting_period']:02d}"
			last_fetched_at = frappe.db.get_value("ERP Actuals Data", period_key, "last_fetched_at")
			if last_fetched_at and (now - last_fetched_at).total_seconds() < max_age_sec:
				continue
			refresh_period(entry["fiscal_year"], entry["accounting_period"], entry["description"])
	finally:
		frappe.cache().delete(_SYNC_LOCK_KEY)
