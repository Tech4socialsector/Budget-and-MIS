"""Reconciliation check for the "Combination Reconciliation" page
(frontend/src/pages/CombinationReconciliation.vue): finds combinations that
show up in the ERP Actuals YTD response but aren't covered by any "Define
by Cost Centre and Location Code" Overview number cards settings row - i.e.
actuals that exist in the ERP but can never surface in any report in this
app, because nothing maps them to a card.

Comparison keys are (business_unit, deptid, operating_unit) on the ERP side
and (unit, cost_center_erp, location_code_erp) on the card-settings side -
confirmed equivalent by direct inspection: Unit doctype uses autoname:
prompt (the doc name IS the ERP business_unit code, e.g. "APFD"), and
cost_center_erp/location_code_erp are themselves fetch_from snapshots of
the linked Cost Center/Location Code docs' own ERP code fields - no further
join needed on either side.

Two filters, both opt-in via the page's own checkboxes:
- enablers_only: restrict the "mapped" side to cards tagged "Enablers" in
  their combination_table_settings child table (Combination of unit
  settings.table_name == "Enablers" - the same mechanism
  api_1/number_card_settings.py's _get_combination_table_settings_raw uses
  for Monthly MIS's own Enablers breakup, confirmed via that function and
  independently via ai/tools.py's MONTHLY_MIS_SECTIONS map). Off by default
  (checks against every card, not just Enablers).
- ignore_location_code: drop location_code_erp from the comparison key
  entirely, comparing on (unit, cost_center_erp) only. Off by default (the
  original 3-part key).

Only rows with reference_for in ("Actual", "Both") are included from the
card-settings side (resolve_grouped_units already leaves cost_centers_erp/
locations_erp empty for "Budget"-only rows) - a Budget-only row was never
meant to be matched against actuals in the first place, so excluding it
here isn't a new restriction, just reusing what resolve_grouped_units
already encodes.
"""

import frappe

from budget_mis.utils import guest_api
from budget_mis.api_1.number_card_settings import resolve_grouped_units
from budget_mis.api.erp_actuals import fetch_actuals_ytd

ENABLERS_TABLE_NAME = "Enablers"


def _description_lookups(units, need_location=True):
	"""Batch-fetch (unit, erp_code) -> description for Cost Center and
	Location Code, scoped by unit (set_id/unit) since the same ERP code can
	legitimately belong to different cost centers/locations under different
	units - a plain code-only lookup could silently attach the wrong unit's
	description. One or two queries total (not one per unmapped row);
	need_location=False (ignore_location_code mode) skips the Location Code
	query entirely since its result would never be used."""
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


def _enablers_card_names():
	"""Names of every Overview number cards settings doc that has at least
	one combination_table_settings row tagged table_name == "Enablers" -
	same mechanism api_1/number_card_settings.py's
	_get_combination_table_settings_raw uses for Monthly MIS's own Enablers
	breakup."""
	return frappe.get_all(
		"Combination of unit settings",
		filters={"table_name": ENABLERS_TABLE_NAME},
		pluck="parent",
		parent_doctype="Overview number cards settings",
		distinct=True,
	)


def _mapped_combinations(enablers_only, ignore_location_code):
	"""Every comparison-key tuple covered by a "Define by Cost Centre and
	Location Code" card's actuals-side mapping, across ALL matching cards
	(not just one) - an ERP combination only counts as "mapped" if at least
	one card anywhere references it. The key is (unit, cost_center_erp) when
	ignore_location_code is set, else (unit, cost_center_erp,
	location_code_erp)."""
	mapped = set()

	filters = {"type": "Define by Cost Centre and Location Code"}
	if enablers_only:
		enablers_names = set(_enablers_card_names())
		if not enablers_names:
			return mapped
		filters["name"] = ["in", list(enablers_names)]

	card_names = frappe.get_all("Overview number cards settings", filters=filters, pluck="name")

	for name in card_names:
		doc = frappe.get_cached_doc("Overview number cards settings", name)
		for group in resolve_grouped_units(doc):
			unit = group.get("unit")
			if not unit:
				continue
			cc_erp_list = group.get("cost_centers_erp") or []
			loc_erp_list = group.get("locations_erp") or []
			if not cc_erp_list:
				continue
			if ignore_location_code:
				for cc_erp in cc_erp_list:
					mapped.add((unit, cc_erp))
				continue
			if not loc_erp_list:
				continue
			for cc_erp in cc_erp_list:
				for loc_erp in loc_erp_list:
					mapped.add((unit, cc_erp, loc_erp))

	return mapped


@guest_api
def find_unmapped_combinations(fiscal_year, accounting_period, enablers_only=0, ignore_location_code=0):
	"""Returns every ERP combination present in the Actuals YTD response for
	the given period that has no matching entry across the relevant "Define
	by Cost Centre and Location Code" cards - plus the posted amount summed
	per combination, so the warning can show how much actuals value is at
	stake, not just which combinations are missing.

	enablers_only (checkbox on the page): restrict the "mapped" side to
	Enablers-tagged cards only, instead of every card app-wide.
	ignore_location_code (checkbox on the page): compare on (unit,
	cost_center_erp) only, dropping location_code_erp from both sides of
	the comparison and the returned rows.
	"""
	fiscal_year = int(fiscal_year)
	accounting_period = int(accounting_period)
	enablers_only = bool(int(enablers_only))
	ignore_location_code = bool(int(ignore_location_code))

	ytd = fetch_actuals_ytd(fiscal_year, accounting_period)
	if ytd.get("status") != "success":
		return ytd

	mapped = _mapped_combinations(enablers_only, ignore_location_code)

	unmapped = {}
	for row in ytd.get("data", []):
		unit = row.get("business_unit")
		cost_center_erp = row.get("deptid")
		location_code_erp = row.get("operating_unit")
		if ignore_location_code:
			if not (unit and cost_center_erp):
				continue
			key = (unit, cost_center_erp)
		else:
			if not (unit and cost_center_erp and location_code_erp):
				continue
			key = (unit, cost_center_erp, location_code_erp)

		if key in mapped:
			continue

		amt = float(row.get("posted_total_amt") or 0)
		if key not in unmapped:
			entry = {"unit": unit, "cost_center_erp": cost_center_erp, "posted_total_amt": amt}
			if not ignore_location_code:
				entry["location_code_erp"] = location_code_erp
			unmapped[key] = entry
		else:
			unmapped[key]["posted_total_amt"] += amt

	units = {row["unit"] for row in unmapped.values()}
	cc_lookup, loc_lookup = _description_lookups(units, need_location=not ignore_location_code)
	for row in unmapped.values():
		row["cost_center_description"] = cc_lookup.get((row["unit"], row["cost_center_erp"]), "")
		if not ignore_location_code:
			row["location_code_description"] = loc_lookup.get((row["unit"], row["location_code_erp"]), "")

	sort_key = (lambda r: (r["unit"], r["cost_center_erp"])) if ignore_location_code else (
		lambda r: (r["unit"], r["cost_center_erp"], r["location_code_erp"])
	)

	return {
		"status": "success",
		"fiscal_year": fiscal_year,
		"accounting_period": accounting_period,
		"count": len(unmapped),
		"data": sorted(unmapped.values(), key=sort_key),
	}
