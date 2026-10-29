import frappe
from budget_mis.utils import guest_api, get_allowed_units, require_unit_access
from budget_mis.api.response_crypto import is_direct_http_call
from budget_mis.api_1.helper import get_accounting_period_from_month
from budget_mis.api_1.grouped_actuals import group_actuals_ytd, group_actuals_by_gl_code
from budget_mis.api_1.budget_actuals_combined import get_combined_actuals
from budget_mis.api_1.number_card_settings import resolve_grouped_units


def _to_list(value):
	if value is None:
		return None
	if isinstance(value, str):
		return [v.strip() for v in value.split(",") if v.strip()]
	if isinstance(value, (list, tuple)):
		return [str(v).strip() for v in value if v]
	return None


def _safe_join(arr):
	return ",".join([str(v).strip() for v in (arr or []) if v])


# Merges several get_combined_actuals trees into one, summing ytd/
# total_posted_amt at every matching node by name - same merge
# monthly_mis.py's own _consolidate_actuals does for the same reason (fan
# out one call per grouped_units row, then sum), kept as its own copy here
# rather than importing monthly_mis's private helper across modules.
def _consolidate_actuals_trees(trees):
	head_map = {}
	for tree in trees:
		for head in tree:
			key = head["name"]
			if key not in head_map:
				head_map[key] = {
					"name": head["name"],
					"sequence_id": head["sequence_id"],
					"sub_heads": [],
					"items": [],
					"ytd": 0,
					"total_posted_amt_ytd": 0,
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
						"total_posted_amt_ytd": 0,
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
							"total_posted_amt": 0,
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
						"total_posted_amt": 0,
					}
					head_map[key]["items"].append(new_item)
					item_map[item["name"]] = new_item
				item_map[item["name"]]["ytd"] += item.get("ytd", 0)
				item_map[item["name"]]["total_posted_amt"] += item.get("total_posted_amt", 0)

	return sorted(head_map.values(), key=lambda h: h.get("sequence_id") or 0)


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
def _get_combined_actuals_by_theme(theme_names, financial_year, month, grouped_actuals_data, scope_to_allowed_units):
	# resolve_grouped_units reads the raw card doc, unscoped - rows for units
	# the current user isn't allowed to see are skipped here on a genuine
	# direct HTTP call, the same scoping get_theme_mappings already applies
	# when it built the unit/cost-center/location options this selection
	# came from (api_1/filter_options.py) - an internal caller (unit=None
	# intentionally) gets every row, same convention as the rest of this file.
	allowed_units = get_allowed_units() if scope_to_allowed_units else None

	trees = []
	for theme_name in theme_names:
		doc = frappe.get_doc("Overview number cards settings", theme_name)
		for gu in resolve_grouped_units(doc):
			if allowed_units is not None and str(gu.get("unit")) not in allowed_units:
				continue
			trees.append(get_combined_actuals(
				financial_year=financial_year,
				month=month,
				unit=gu.get("unit"),
				cost_center=_safe_join(gu.get("cost_centers")),
				location_code=_safe_join(gu.get("locations")),
				erp_cost_center_value=_safe_join(gu.get("cost_centers_erp")),
				erp_loc_value=_safe_join(gu.get("locations_erp")),
				grouped_actuals_data=grouped_actuals_data,
			))
	return _consolidate_actuals_trees(trees) if trees else []


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
    # convention as get_budget_ytd_by_sequence in api_1/budget_summary.py).
    if is_direct_http_call(get_combined_actuals_report):
        if unit:
            require_unit_access(unit)
        else:
            allowed_units = get_allowed_units()
            if allowed_units is not None:
                if not allowed_units:
                    return []
                unit = ",".join(sorted(allowed_units))

    # group_actuals_ytd (api_1/grouped_actuals.py) already checks its own
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
	HTTP call, matching get_theme_mappings' own scoping."""
	allowed_units = get_allowed_units() if scope_to_allowed_units else None

	triples = set()
	for theme_name in theme_names:
		doc = frappe.get_doc("Overview number cards settings", theme_name)
		for gu in resolve_grouped_units(doc):
			unit_val = gu.get("unit")
			if allowed_units is not None and str(unit_val) not in allowed_units:
				continue
			ccs = gu.get("cost_centers_erp") or [None]
			locs = gu.get("locations_erp") or [None]
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
	underlying data one level less collapsed. api_1's replacement for
	budget_mis.api.phase_sheet.get_actual_gl_breakup (which itself just
	wraps budget_mis.api.actual_format.get_gl_breakup_for_item).

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
