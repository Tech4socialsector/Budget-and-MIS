"""Reconciliation check for the "Combination Reconciliation" page
(frontend/src/pages/CombinationReconciliation.vue): finds combinations that
show up in the ERP Actuals YTD response but aren't covered by any "Define
by Cost Centre and Location Code" Overview number cards settings row - i.e.
actuals that exist in the ERP but can never surface in any report in this
app, because nothing maps them to a card. Reads from the persisted ERP Data
store (data_type="Actuals", via budget_mis.api.erp_data.get_actuals_data -
the same store Trial Balance Check/group_actuals_ytd already use) instead
of a live PeopleSoft call, so this is a fast DB read kept fresh by the
existing scheduled sync job rather than a 1-3 minute ERP round trip on
every Check click.

Comparison keys are (business_unit, deptid, operating_unit) on the ERP side
and (unit, cost_center_erp, location_code_erp) on the card-settings side -
confirmed equivalent by direct inspection: Unit doctype uses autoname:
prompt (the doc name IS the ERP business_unit code, e.g. "APFD"), and
cost_center_erp/location_code_erp are themselves fetch_from snapshots of
the linked Cost Center/Location Code docs' own ERP code fields - no further
join needed on either side.

Whether Location Code is required to count as "mapped" is now a PER-CARD
setting (Overview number cards settings.ignore_location_code_in_
reconciliation - e.g. Enablers cards, which are only ever mapped by Unit +
Cost Center with no meaningful Location Code of their own), not a page-wide
checkbox - see _mapped_combinations for how this splits into 2 separate
mapped sets.

Only rows with reference_for in ("Actual", "Both") are included from the
card-settings side (resolve_grouped_units already leaves cost_centers_erp/
locations_erp empty for "Budget"-only rows) - a Budget-only row was never
meant to be matched against actuals in the first place, so excluding it
here isn't a new restriction, just reusing what resolve_grouped_units
already encodes.
"""

import frappe

from budget_mis.utils import guest_api
from budget_mis.api.response_crypto import is_direct_http_call
from budget_mis.api.number_card_settings import resolve_grouped_units
from budget_mis.api.erp_data import get_actuals_data


def _description_lookups(units, need_location=True):
	"""Batch-fetch (unit, erp_code) -> description for Cost Center and
	Location Code, scoped by unit (set_id/unit) since the same ERP code can
	legitimately belong to different cost centers/locations under different
	units - a plain code-only lookup could silently attach the wrong unit's
	description. One or two queries total (not one per unmapped row)."""
	cc_lookup = {}
	loc_lookup = {}
	if not units:
		return cc_lookup, loc_lookup

	for cc in frappe.get_all(
		"Cost Center",
		filters={"set_id": ["in", list(units)]},
		fields=["set_id", "cost_center", "cc_descr"],
	):
		cc_lookup[(cc.set_id, cc.cost_center)] = cc.cc_descr

	if need_location:
		for loc in frappe.get_all(
			"Location Code",
			filters={"unit": ["in", list(units)]},
			fields=["unit", "location_code", "decription"],
		):
			loc_lookup[(loc.unit, loc.location_code)] = loc.decription

	return cc_lookup, loc_lookup


def _mapped_combinations():
	"""Every comparison-key tuple covered by a "Define by Cost Centre and
	Location Code" card's actuals-side mapping, across ALL matching cards
	(not just one) - an ERP combination only counts as "mapped" if at least
	one card anywhere references it. Returns TWO separate sets rather than
	one, since whether location code matters is now a PER-CARD setting
	(Overview number cards settings.ignore_location_code_in_reconciliation -
	e.g. Enablers cards, which are only ever ser  set up by Unit + Cost
	Center with no meaningful Location Code of their own), not a single
	page-wide toggle:
	- mapped_2 (unit, cost_center_erp): built only from cards that set
	  ignore_location_code_in_reconciliation - an ERP row matching one of
	  these on (unit, cost_center_erp) ALONE counts as mapped, regardless of
	  its own location_code_erp value.
	- mapped_3 (unit, cost_center_erp, location_code_erp): built from every
	  OTHER card (the regular case) - an ERP row must match the full triple
	  here to count as mapped.
	An ERP row is "mapped" overall if its (unit, cost_center_erp) is in
	mapped_2 OR its full triple is in mapped_3 - checked by the caller, not
	here, since the caller is the one walking real ERP rows and needs both
	sets simultaneously.
	"""
	mapped_2 = set()
	mapped_3 = set()

	card_names = frappe.get_all(
		"Overview number cards settings",
		filters={"type": "Define by Cost Centre and Location Code"},
		fields=["name", "ignore_location_code_in_reconciliation"],
	)

	for card in card_names:
		doc = frappe.get_cached_doc("Overview number cards settings", card.name)
		ignore_location = bool(card.ignore_location_code_in_reconciliation)
		for group in resolve_grouped_units(doc):
			unit = group.get("unit")
			if not unit:
				continue
			cc_erp_list = group.get("cost_centers_erp") or []
			loc_erp_list = group.get("locations_erp") or []
			if not cc_erp_list:
				continue
			if ignore_location:
				for cc_erp in cc_erp_list:
					mapped_2.add((unit, cc_erp))
				continue
			if not loc_erp_list:
				continue
			for cc_erp in cc_erp_list:
				for loc_erp in loc_erp_list:
					mapped_3.add((unit, cc_erp, loc_erp))

	return mapped_2, mapped_3


@guest_api
def find_unmapped_combinations(fiscal_year, accounting_period):
	"""Returns every ERP combination present in the Actuals YTD response for
	the given period that has no matching entry across the relevant "Define
	by Cost Centre and Location Code" cards - plus the posted amount summed
	per combination, so the warning can show how much actuals value is at
	stake, not just which combinations are missing.

	Every ERP row is checked on the full (unit, cost_center_erp,
	location_code_erp) triple UNLESS the row's own unit+cost_center is
	covered by a card that set ignore_location_code_in_reconciliation (the
	Overview number cards settings field marking a special case like
	Enablers, where a card is only ever mapped by Unit + Cost Center with no
	meaningful Location Code of its own) - in which case a (unit,
	cost_center_erp)-only match is enough, regardless of the row's own
	location_code_erp value. This is decided per-card/per-combination now,
	not by a page-wide checkbox - see _mapped_combinations for the 2 sets
	this distinction is built from.
	"""
	# This endpoint intentionally returns full org-wide ERP actuals, unscoped
	# by unit - that's the entire point of a reconciliation check (finding
	# combinations missing from ANY card, not just the caller's own units).
	# The page itself is already restricted to System Manager at the nav
	# level (App Module Setting's own restrict_by_role/roles for
	# combination_reconciliation), but that only hides the menu entry - it
	# was never enforced here, so any logged-in user who knew/guessed this
	# method name could call it directly and get the same unrestricted
	# data. Enforcing the same role here closes that gap without changing
	# the (deliberately unscoped) data shape for the users who are actually
	# meant to see it.
	if is_direct_http_call(find_unmapped_combinations) and "System Manager" not in frappe.get_roles():
		frappe.throw("Not permitted", frappe.PermissionError)

	fiscal_year = int(fiscal_year)
	accounting_period = int(accounting_period)

	# Reads the SAME persisted ERP Data store (data_type="Actuals") Trial
	# Balance Check/group_actuals_ytd already use, instead of a live
	# PeopleSoft call - a fast DB read, kept fresh by the existing scheduled
	# sync job, rather than a 1-3 minute ERP round trip on every Check
	# click. The stored response for this period is already YTD-cumulative
	# (each row carries its own accounting_period tag covering 1 through
	# the requested period, same PeopleSoft query shape fetch_actuals_ytd's
	# own live call used), and already has Monthly Adjustment rows merged
	# in at backfill time (erp_actuals._get_actuals_from_erp_month_wise_raw:
	# `combined_rows = erp_rows + frappe_rows`) - so dropping the
	# accounting_period == "0" opening-balance row here is the only
	# filtering still needed, same as fetch_actuals_ytd did.
	actuals = get_actuals_data(fiscal_year, accounting_period)
	if actuals.get("status") != "success":
		return actuals

	mapped_2, mapped_3 = _mapped_combinations()

	unmapped = {}
	for row in actuals.get("data", []):
		if str(row.get("accounting_period")) == "0":
			continue
		unit = row.get("business_unit")
		cost_center_erp = row.get("deptid")
		location_code_erp = row.get("operating_unit")
		if not (unit and cost_center_erp and location_code_erp):
			continue

		key2 = (unit, cost_center_erp)
		key3 = (unit, cost_center_erp, location_code_erp)
		if key2 in mapped_2 or key3 in mapped_3:
			continue

		amt = float(row.get("posted_total_amt") or 0)
		if key3 not in unmapped:
			unmapped[key3] = {
				"unit": unit,
				"cost_center_erp": cost_center_erp,
				"location_code_erp": location_code_erp,
				"posted_total_amt": amt,
			}
		else:
			unmapped[key3]["posted_total_amt"] += amt

	units = {row["unit"] for row in unmapped.values()}
	cc_lookup, loc_lookup = _description_lookups(units, need_location=True)
	for row in unmapped.values():
		row["cost_center_description"] = cc_lookup.get((row["unit"], row["cost_center_erp"]), "")
		row["location_code_description"] = loc_lookup.get((row["unit"], row["location_code_erp"]), "")

	sort_key = lambda r: (r["unit"], r["cost_center_erp"], r["location_code_erp"])

	return {
		"status": "success",
		"fiscal_year": fiscal_year,
		"accounting_period": accounting_period,
		"count": len(unmapped),
		"data": sorted(unmapped.values(), key=sort_key),
	}
