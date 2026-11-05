import frappe
from budget_mis.utils import (
	guest_api,
	get_allowed_units,
	require_unit_access,
	get_allowed_cost_centers,
	get_allowed_location_codes,
	get_allowed_cost_centers_erp,
	get_allowed_location_codes_erp,
)
from budget_mis.api.response_crypto import is_direct_http_call
from budget_mis.api.helper import get_accounting_period_from_month, _safe_join, consolidate_actuals
from budget_mis.api.grouped_actuals import group_actuals_ytd, group_actuals_by_gl_code
from budget_mis.api.budget_actuals_combined import get_combined_actuals
from budget_mis.api.number_card_settings import resolve_grouped_units


def _to_list(value):
	if value is None:
		return None
	if isinstance(value, str):
		return [v.strip() for v in value.split(",") if v.strip()]
	if isinstance(value, (list, tuple)):
		return [str(v).strip() for v in value if v]
	return None




# Operating Unit ("theme") cards can resolve to several (unit, cost-center,
# location) row triples that are NOT a simple cross-product - e.g. cost
# centers A/B only ever pair with locations X/Y respectively, never A+Y or
# B+X. get_combined_actuals's own filtering is an independent AND over
# separately-flattened unit/cost_center/location sets, which has no concept
# of valid pairs: given the flattened sets {A,B} and {X,Y} it would also
# match actuals for A+Y and B+X even though the card never defined those
# combinations - a real over-matching bug (confirmed live: a card with 62
# exact-pair rows had ~56k of unrelated actuals leak in this way). Fanning
# out one get_combined_actuals call per grouped_units row and summing -
# exactly what monthly_mis.py's own get_monthly_mis_break_up already does
# for the same "Define by Card Mapping" cards - preserves each row's real
# pairing instead of flattening it away.
def _filter_allowed(values, allowed):
	"""None allowed = unscoped (admin), pass through unmodified. Otherwise
	keep only values this user's Finance user access mapping actually
	grants - same semantics as get_theme_mappings' own per-entry filtering,
	just applied here (the report computation) instead of only at dropdown-
	population time."""
	if allowed is None:
		return values
	return [v for v in (values or []) if v and v in allowed]


def _get_combined_actuals_by_theme(theme_names, financial_year, month, grouped_actuals_data, scope_to_allowed_units):
	# resolve_grouped_units reads the raw card doc, unscoped - rows for units
	# the current user isn't allowed to see are skipped here on a genuine
	# direct HTTP call, the same scoping get_theme_mappings already applies
	# when it built the unit/cost-center/location options this selection
	# came from (api/filter_options.py) - an internal caller (unit=None
	# intentionally) gets every row, same convention as the rest of this file.
	#
	# A card's own configured cost-center/location list can be WIDER than
	# what this specific user's Finance user access actually grants (e.g. a
	# card covering 10 location codes for a unit, where this user's own
	# mapping only lists 4 of them) - resolve_grouped_units has no concept
	# of "this particular user," so each row's cost_centers/locations (doc
	# -name form) and cost_centers_erp/locations_erp (ERP-code form,
	# carried for "Actual"-only rows where the doc-name form is never
	# populated - see resolve_grouped_units' own reference_for gating) are
	# filtered down to this user's own allowed sets here, the same way
	# get_theme_mappings already does for the dropdown/filter UI - without
	# this, selecting an Operating Unit theme would silently include actuals
	# for cost centers/locations outside what this user was ever granted.
	allowed_units = get_allowed_units() if scope_to_allowed_units else None
	allowed_cost_centers = get_allowed_cost_centers() if scope_to_allowed_units else None
	allowed_locations = get_allowed_location_codes() if scope_to_allowed_units else None
	allowed_cost_centers_erp = get_allowed_cost_centers_erp() if scope_to_allowed_units else None
	allowed_locations_erp = get_allowed_location_codes_erp() if scope_to_allowed_units else None

	trees = []
	for theme_name in theme_names:
		doc = frappe.get_doc("Overview number cards settings", theme_name)
		for gu in resolve_grouped_units(doc):
			if allowed_units is not None and str(gu.get("unit")) not in allowed_units:
				continue

			cost_centers = _filter_allowed(gu.get("cost_centers"), allowed_cost_centers)
			locations = _filter_allowed(gu.get("locations"), allowed_locations)
			cost_centers_erp = _filter_allowed(gu.get("cost_centers_erp"), allowed_cost_centers_erp)
			locations_erp = _filter_allowed(gu.get("locations_erp"), allowed_locations_erp)

			# A row with SOME cost-center/location value configured that is
			# entirely filtered away (none of it allowed for this user) must
			# be dropped, not passed through as "no filter" - get_combined_
			# actuals treats an empty cost_center/location_code string as
			# "match any," which would silently widen the query back out to
			# everything instead of correctly matching nothing for this row.
			if (gu.get("cost_centers") and not cost_centers) or (gu.get("locations") and not locations):
				continue
			if (gu.get("cost_centers_erp") and not cost_centers_erp) or (gu.get("locations_erp") and not locations_erp):
				continue

			trees.append(get_combined_actuals(
				financial_year=financial_year,
				month=month,
				unit=gu.get("unit"),
				cost_center=_safe_join(cost_centers),
				location_code=_safe_join(locations),
				erp_cost_center_value=_safe_join(cost_centers_erp),
				erp_loc_value=_safe_join(locations_erp),
				grouped_actuals_data=grouped_actuals_data,
			))
	return consolidate_actuals(trees, sort_by_sequence=True) if trees else []


# The Budget vs Actuals page's main data source: resolves the month/financial_year into an accounting period, pulls the shared cached group_actuals_ytd result once, then either fans out per Operating Unit theme row (_get_combined_actuals_by_theme, to preserve each row's real cost-center/location pairing) or falls through to a single get_combined_actuals call for plain manual Unit/Cost Center/Location Code picks - this calls budget_actuals_combined.get_combined_actuals, the one shared implementation (an older, separate phase_sheet.py copy of the same name/shape used to exist and has since been consolidated into this one).
@guest_api
def get_combined_actuals_report(
    financial_year=None,
    month=None,
    unit=None,
    cost_center=None,
    location_code=None,
    erp_loc_value=None,
    erp_cost_center_value=None,
    theme_names=None,
):
    if not financial_year:
        frappe.throw("Financial Year is required")
    if not month:
        frappe.throw("Month is required")

    # Only scope on a genuine direct HTTP call - internal callers pass
    # unit=None intentionally to get an unscoped result and must not be
    # narrowed by whatever the current session user happens to be (same
    # convention as get_budget_ytd_by_sequence in api/budget_summary.py).
    if is_direct_http_call(get_combined_actuals_report):
        if unit:
            require_unit_access(unit)
        else:
            allowed_units = get_allowed_units()
            if allowed_units is not None:
                if not allowed_units:
                    return []
                unit = ",".join(sorted(allowed_units))

    # group_actuals_ytd (api/grouped_actuals.py) already checks its own
    # server-side cache first and only redoes the real ERP fetch + GL-code/
    # Expenses join/aggregation when nothing cached is found for this exact
    # (fiscal_year, accounting_period) - shared across every caller
    # (Monthly MIS, this report, etc), not something this file needs its
    # own separate cache for.
    formatted = get_accounting_period_from_month(month, financial_year)
    actuals_response = group_actuals_ytd(
        fiscal_year=formatted.get("fiscal_year"),
        accounting_period=formatted.get("accounting_period"),
    )
    grouped_actuals_data = actuals_response.get("data", [])

    # When the caller selected one or more Operating Unit cards, re-resolve
    # each card's own grouped_units rows and fan out/sum per exact pair
    # (see _get_combined_actuals_by_theme) instead of independently AND-ing
    # the flattened unit/cost_center/location_code/erp_* params below, which
    # can cross-match (cost-center, location) combinations the card never
    # defined. Falls through to the plain flattened-filter path when no
    # theme was selected (manual Unit/Cost Center/Location Code picks have
    # no "correct pairing" to preserve - independent-set filtering is the
    # right semantics there).
    theme_name_list = _to_list(theme_names)
    if theme_name_list:
        return _get_combined_actuals_by_theme(
            theme_name_list, financial_year, month, grouped_actuals_data,
            scope_to_allowed_units=is_direct_http_call(get_combined_actuals_report),
        )

    return get_combined_actuals(
        financial_year=financial_year,
        month=month,
        unit=unit,
        cost_center=cost_center,
        location_code=location_code,
        erp_loc_value=erp_loc_value,
        erp_cost_center_value=erp_cost_center_value,
        grouped_actuals_data=grouped_actuals_data,
    )


def _theme_unit_cc_loc_triples(theme_names, scope_to_allowed_units):
	"""Every (unit, cost_center_erp, location_erp) triple actually defined
	across the given theme(s)' own grouped_units rows - one row can cover
	several cost centers/locations (a row's own lists), so this expands each
	row into its full cross-product of JUST THAT ROW's own values (never
	across rows), preserving exactly the real pairing resolve_grouped_units
	already encodes. Used by get_actual_gl_breakup to filter by membership
	in this triple set instead of three independent flattened sets - the
	same over-matching bug fixed in _get_combined_actuals_by_theme above,
	one level deeper (a single item's GL-code breakdown). A row for a unit
	the current user isn't allowed to see is skipped on a genuine direct
	HTTP call, matching get_theme_mappings' own scoping - and, same as
	_get_combined_actuals_by_theme, a row's own cost_centers_erp/
	locations_erp values that fall outside this user's Finance user access
	mapping are dropped too (ERP-code form only here since this triple set
	is matched against actuals data, which is keyed by ERP code, not doc
	name)."""
	allowed_units = get_allowed_units() if scope_to_allowed_units else None
	allowed_cost_centers_erp = get_allowed_cost_centers_erp() if scope_to_allowed_units else None
	allowed_locations_erp = get_allowed_location_codes_erp() if scope_to_allowed_units else None

	triples = set()
	for theme_name in theme_names:
		doc = frappe.get_doc("Overview number cards settings", theme_name)
		for gu in resolve_grouped_units(doc):
			unit_val = gu.get("unit")
			if allowed_units is not None and str(unit_val) not in allowed_units:
				continue

			ccs = _filter_allowed(gu.get("cost_centers_erp"), allowed_cost_centers_erp) or [None]
			locs = _filter_allowed(gu.get("locations_erp"), allowed_locations_erp) or [None]
			if gu.get("cost_centers_erp") and ccs == [None]:
				continue
			if gu.get("locations_erp") and locs == [None]:
				continue

			for cc in ccs:
				for loc in locs:
					triples.add((unit_val, cc, loc))
	return triples


@guest_api
def get_actual_gl_breakup(
	financial_year=None,
	month=None,
	sequence_id=None,
	unit=None,
	cost_center=None,
	location_code=None,
	erp_loc_value=None,
	erp_cost_center_value=None,
	theme_names=None,
):
	"""GL-code-level breakdown of a single budget line item's actuals
	(identified by its sequence_id in the Expenses master), for the Budget
	vs Actuals item-row drill-down - get_combined_actuals_report only
	exposes one totalled total_posted_amt per item, this is the same
	underlying data one level less collapsed. A properly unit-scoped
	replacement for an older, unscoped version of this same function that
	used to live separately in phase_sheet.py.

	Note the parameter naming carried over from the original: `unit` filters
	by business_unit, but `cost_center`/`location_code` here actually
	receive the ERP code values (erp_cost_center_value/erp_loc_value from
	the caller) - group_actuals_by_gl_code's own rows are keyed by ERP
	deptid/operating_unit codes, not Frappe doc names, same as the original
	get_gl_breakup_for_item.

	Unit-access scoping matches get_combined_actuals_report exactly (same
	is_direct_http_call/require_unit_access/get_allowed_units gating) -
	the original api/phase_sheet.get_actual_gl_breakup had none at all, the
	same gap fixed there.
	"""
	if not sequence_id:
		frappe.throw("sequence_id is required")
	if not financial_year:
		frappe.throw("Financial Year is required")
	if not month:
		frappe.throw("Month is required")

	if is_direct_http_call(get_actual_gl_breakup):
		if unit:
			require_unit_access(unit)
		else:
			allowed_units = get_allowed_units()
			if allowed_units is not None:
				if not allowed_units:
					return []
				unit = ",".join(sorted(allowed_units))

	formatted = get_accounting_period_from_month(month, financial_year)
	result = group_actuals_by_gl_code(
		fiscal_year=formatted.get("fiscal_year"),
		accounting_period=formatted.get("accounting_period"),
	)
	data = result.get("data", [])

	try:
		seq_id = int(sequence_id)
	except (TypeError, ValueError):
		seq_id = sequence_id
	data = [d for d in data if d.get("sequence_id") == seq_id]

	theme_name_list = _to_list(theme_names)
	if theme_name_list:
		# Filter by membership in the theme's own real (unit, cost_center,
		# location) triples, not three independent sets - see
		# _theme_unit_cc_loc_triples for why (same cross-matching bug as
		# get_combined_actuals_report, one level deeper).
		valid_triples = _theme_unit_cc_loc_triples(theme_name_list, scope_to_allowed_units=is_direct_http_call(get_actual_gl_breakup))
		data = [
			d for d in data
			if (d.get("business_unit"), d.get("deptid"), d.get("operating_unit")) in valid_triples
		]
	else:
		units = _to_list(unit)
		if units:
			data = [d for d in data if d.get("business_unit") in units]

		ccs = _to_list(erp_cost_center_value)
		if ccs:
			data = [d for d in data if d.get("deptid") in ccs]

		locs = _to_list(erp_loc_value)
		if locs:
			data = [d for d in data if d.get("operating_unit") in locs]

	merged = {}
	for record in data:
		gl_code = record.get("gl_code") or "Unspecified"
		if gl_code not in merged:
			merged[gl_code] = {
				"gl_code": gl_code,
				"type_of_expense": record.get("type_of_expense") or "",
				"total_posted_amt": 0,
			}
		merged[gl_code]["total_posted_amt"] += record.get("total_posted_amt", 0)

	rows = sorted(merged.values(), key=lambda r: r["total_posted_amt"], reverse=True)
	for r in rows:
		r["total_posted_amt"] = round(r["total_posted_amt"], 2)

	return rows
