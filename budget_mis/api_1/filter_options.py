"""Filter dropdown data for the Budget vs Actuals page (and any other page
reusing the same Unit/Cost Center/Location Code/Operating Unit/Financial
Year pickers) - api_1's replacement for budget_mis.api.filter_options.

Every function here is scoped to what the calling user is actually allowed
to see via their Finance user access mapping (utils.is_finance_admin /
get_allowed_units / get_allowed_cost_centers / get_allowed_location_codes)
rather than each function re-implementing that same walk inline, which is
what the original api/filter_options.py did independently in all 6
functions (duplicated scoping logic, and a dead commented-out copy of
get_location_codes_by_unit/get_theme left sitting above the live versions -
neither carried over here).
"""

import frappe

from budget_mis.utils import (
	guest_api,
	is_finance_admin,
	get_allowed_units,
	get_allowed_cost_centers,
	get_allowed_location_codes,
)
from budget_mis.api_1.number_card_settings import resolve_grouped_units


@guest_api
def get_financial_year_list():
	fy_docs = frappe.get_all("Financial Year List", fields=["name"])
	fy_docs = sorted(fy_docs, key=lambda x: int(x.name.split("-")[0]), reverse=True)
	return [{"financial_year": d.name} for d in fy_docs]


@guest_api
def get_units():
	allowed_units = get_allowed_units()

	if allowed_units is None:
		unit_data = frappe.get_all("Unit", fields=["name", "unit_decription"], order_by="name asc")
	else:
		if not allowed_units:
			return {"data": []}
		unit_data = frappe.get_all(
			"Unit",
			filters={"name": ["in", list(allowed_units)]},
			fields=["name", "unit_decription"],
			order_by="name asc",
		)

	data = [{"label": "", "value": ""}]
	for u in unit_data:
		data.append({"label": f"{u.name} - {u.unit_decription}", "value": u.name})
	return {"data": data}


@guest_api
def get_cost_centers_by_set_id(units=None):
	if not units:
		return {"data": []}
	if isinstance(units, str):
		units = [u.strip() for u in units.split(",") if u.strip()]

	allowed_cost_centers = get_allowed_cost_centers()

	if allowed_cost_centers is None:
		cost_centers = frappe.get_all(
			"Cost Center",
			filters={"set_id": ["in", units]},
			fields=["name", "cost_center", "cc_descr"],
			order_by="cost_center asc",
		)
	else:
		if not allowed_cost_centers:
			return {"data": []}
		cost_centers = frappe.get_all(
			"Cost Center",
			filters={
				"set_id": ["in", units],
				"name": ["in", list(allowed_cost_centers)],
			},
			fields=["name", "cost_center", "cc_descr"],
			order_by="cost_center asc",
		)

	data = []
	for cc in cost_centers:
		data.append({
			"label": f"{cc.cost_center} - {cc.cc_descr}",
			"value": cc.name,
			"erp_cost_center_value": cc.cost_center,
		})
	return {"data": data}


@guest_api
def get_location_codes_by_unit(unit=None):
	if not unit:
		return {"data": []}
	if isinstance(unit, str):
		unit = [u.strip() for u in unit.split(",") if u.strip()]

	allowed_location_codes = get_allowed_location_codes()

	if allowed_location_codes is None:
		locations = frappe.get_all(
			"Location Code",
			filters={"unit": ["in", unit]},
			fields=["name", "location_code", "decription"],
			order_by="location_code asc",
		)
	else:
		if not allowed_location_codes:
			return {"data": []}
		locations = frappe.get_all(
			"Location Code",
			filters={
				"unit": ["in", unit],
				"name": ["in", list(allowed_location_codes)],
			},
			fields=["name", "location_code", "decription"],
			order_by="location_code asc",
		)

	# Grouped by description, same as the original - several Location Code
	# docs can share one human-readable location, and the dropdown should
	# show one entry per location, not one per underlying doc.
	data_map = {}
	for loc in locations:
		key = loc.decription or "Unknown"
		if key not in data_map:
			data_map[key] = {
				"label": f"{loc.location_code} - {loc.decription}",
				"value": set(),
				"erp_loc_value": str(loc.location_code),
			}
		data_map[key]["value"].add(str(loc.name))

	data = []
	for item in data_map.values():
		data.append({
			"label": item["label"],
			"value": ",".join(sorted(item["value"])),
			"erp_loc_value": item["erp_loc_value"],
		})
	return {"data": data}


@guest_api
def get_theme():
	"""Only the Operating Unit cards (Overview number cards settings, tagged
	via combination_table_settings.table_name == "Operating Unit Filter
	Option") relevant to the logged-in user's accessible units.

	Unit membership is read via resolve_grouped_units (api_1/
	number_card_settings.py) rather than a select_units child table - that
	table was removed when this doctype was restructured onto doc.type +
	cost_centre_and_location_code_grouping (the same restructuring Monthly
	MIS's own resolve_grouped_units/resolve_grouped_rows already target);
	the old api/filter_options.py's get_theme still reads the now-removed
	select_units field and has been silently broken (AttributeError on any
	real doc) since that migration."""
	is_admin = is_finance_admin()

	all_cards = frappe.get_all("Overview number cards settings", fields=["name", "number_card_title"])

	allowed_units = None if is_admin else get_allowed_units()

	visible_cards = []
	for card in all_cards:
		doc = frappe.get_doc("Overview number cards settings", card.name)

		has_operating_unit_filter = any(
			row.table_name == "Operating Unit Filter Option"
			for row in (doc.combination_table_settings or [])
		)
		if not has_operating_unit_filter:
			continue

		if is_admin:
			visible_cards.append({"name": card.name, "number_card_title": card.number_card_title})
			continue

		if not allowed_units:
			continue

		card_units = {str(g.get("unit")) for g in resolve_grouped_units(doc) if g.get("unit")}
		if card_units.intersection(allowed_units):
			visible_cards.append({"name": card.name, "number_card_title": card.number_card_title})

	return visible_cards


@guest_api
def get_theme_mappings(theme_name):
	"""For a given 'Overview number cards settings' doc, return the units,
	cost centers and location codes it resolves to, filtered to what the
	logged-in user is allowed to see.

	Delegates the actual resolution to resolve_grouped_units
	(api_1/number_card_settings.py) - the same function Monthly MIS's own
	report already uses - rather than reading a select_units/
	select_cost_centers/select_location_codes child table directly (those
	were removed when this doctype was restructured onto doc.type +
	cost_centre_and_location_code_grouping; the old api/filter_options.py's
	get_theme_mappings still reads those now-removed fields and has been
	silently broken, AttributeError on any real doc, since that migration).
	resolve_grouped_units already handles both doc.type values (a leaf
	"Define by Cost Centre and Location Code" card, or a "Define by Card
	Mapping" card that recurses through Sub Items) and already splits each
	row by its own reference_for (Budget / Actual / Both) into separate
	cost_centers (the Frappe doc name, BUDGET-side) vs cost_centers_erp
	(the ERP code, ACTUALS-side) lists - a row marked "Budget" only
	populates the former, "Actual" only the latter, "Both" populates both.
	This is handled entirely server-side with no new filter control: each
	cost-center/location-code entry below carries both its budget-side
	value and its actuals-side erp value, but either is left blank on a
	given entry when reference_for excludes that side.
	"""
	if not theme_name:
		return {"units": [], "cost_centers": [], "location_codes": []}

	is_admin = is_finance_admin()
	doc = frappe.get_doc("Overview number cards settings", theme_name)

	allowed_units = None if is_admin else get_allowed_units()
	allowed_cost_centers = None if is_admin else get_allowed_cost_centers()
	allowed_location_codes = None if is_admin else get_allowed_location_codes()

	grouped_units = resolve_grouped_units(doc)

	# Collect every cost-center/location-code NAME across all groups first
	# (no queries yet), then batch-fetch their label fields in two queries
	# total instead of one frappe.get_value per row - a theme with, say, 30
	# cost-center rows and 30 location rows previously issued 60 separate
	# single-row queries here.
	all_cc_names = {cc for group in grouped_units for cc in (group.get("cost_centers") or []) if cc}
	all_loc_names = {loc for group in grouped_units for loc in (group.get("locations") or []) if loc}

	cc_lookup = {}
	if all_cc_names:
		for cc in frappe.get_all(
			"Cost Center",
			filters={"name": ["in", list(all_cc_names)]},
			fields=["name", "cost_center", "cc_descr"],
		):
			cc_lookup[str(cc.name)] = cc

	loc_lookup = {}
	if all_loc_names:
		for lc in frappe.get_all(
			"Location Code",
			filters={"name": ["in", list(all_loc_names)]},
			fields=["name", "location_code", "decription"],
		):
			loc_lookup[str(lc.name)] = lc

	units = []
	cost_centers = []
	location_codes = []
	seen_cc = set()
	seen_loc = set()

	for group in grouped_units:
		unit = group.get("unit")
		if not unit:
			continue
		if allowed_units is not None and str(unit) not in allowed_units:
			continue

		units.append({"value": str(unit), "label": str(unit)})

		for cc_name in group.get("cost_centers") or []:
			if not cc_name or cc_name in seen_cc:
				continue
			if allowed_cost_centers is not None and str(cc_name) not in allowed_cost_centers:
				continue
			seen_cc.add(cc_name)
			cc = cc_lookup.get(str(cc_name)) or {}
			cost_centers.append({
				"value": str(cc_name),
				"label": f"{cc.get('cost_center', '')} - {cc.get('cc_descr', '')}",
				"erp_cost_center_value": "",
			})

		for cc_erp in group.get("cost_centers_erp") or []:
			if not cc_erp:
				continue
			# An actuals-only (reference_for="Actual") row has no Frappe
			# cost_center doc name to key an entry on, only its ERP code -
			# appended as its own value-less entry so get_theme_mappings'
			# caller still picks it up (BudgetVsActual.vue's own
			# erpCostCenterValues derivation reads every entry's
			# erp_cost_center_value, not just ones with a `value`).
			cost_centers.append({"value": "", "label": "", "erp_cost_center_value": str(cc_erp)})

		for loc_name in group.get("locations") or []:
			if not loc_name or loc_name in seen_loc:
				continue
			if allowed_location_codes is not None and str(loc_name) not in allowed_location_codes:
				continue
			seen_loc.add(loc_name)
			lc = loc_lookup.get(str(loc_name)) or {}
			location_codes.append({
				"value": str(loc_name),
				"label": f"{lc.get('location_code', '')} - {lc.get('decription', '')}",
				"erp_loc_value": "",
			})

		for loc_erp in group.get("locations_erp") or []:
			if not loc_erp:
				continue
			location_codes.append({"value": "", "label": "", "erp_loc_value": str(loc_erp)})

	return {
		"units": units,
		"cost_centers": cost_centers,
		"location_codes": location_codes,
	}
