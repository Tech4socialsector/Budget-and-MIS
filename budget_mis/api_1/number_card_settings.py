import frappe

from budget_mis.utils import guest_api


# Resolves an "Overview number cards settings" doc into grouped_units (one entry per unit, each with de-duplicated cost_centers/cost_centers_erp/locations/locations_erp lists), following doc.type:
# - "Define by Card Mapping": recurses through Sub Items (Card grouping rows), concatenating each sub-card's own grouped_units rather than merging across sub-cards.
# - "Define by Cost Centre and Location Code" (or any other/unset type, the leaf-level default): reads Cost Centre and Location Code Grouping rows directly, merging by unit with reference_for (Budget/Actual/Both) controlling whether a row's budget-side value (cost_center/location_code), actuals-side value (cost_center_erp/location_code_erp), or both go into that unit's lists.
# _visited guards against a Sub Items cycle (a record pointing back to an ancestor, directly or indirectly) turning into infinite recursion.
def resolve_grouped_units(doc, _visited=None):
    _visited = _visited or set()
    if doc.name in _visited:
        frappe.log_error(
            title="Overview number cards settings: sub_items cycle detected",
            message=f"{doc.name} ({doc.number_card_title}) is part of a sub_items cycle: {_visited}",
        )
        return []
    _visited = _visited | {doc.name}

    if doc.type == "Define by Card Mapping":
        # Each sub-item's grouped_units entries are kept separate rather than
        # merged by unit: a sub-item with no location restriction (an empty
        # locations/locations_erp list, meaning "match any location for these
        # cost centers") would otherwise get folded into another sub-item's
        # entry for the same unit and inherit THAT entry's location list,
        # silently turning "unrestricted" into "restricted" and dropping its
        # actuals. get_combined_actuals is already called once per
        # grouped_units entry and the results summed (see consolidate_actuals
        # in get_monthly_mis_break_up), so concatenating preserves each
        # sub-item's own cost-center/location pairing exactly as if it were
        # resolved as its own independent card.
        sub_rows = sorted(doc.sub_items, key=lambda r: (r.sequence_id or 0))
        grouped_units = []
        for row in sub_rows:
            if not row.sub_setting:
                continue
            sub_doc = frappe.get_doc("Overview number cards settings", row.sub_setting)
            grouped_units.extend(resolve_grouped_units(sub_doc, _visited))
        return grouped_units

    # -------- Define by Cost Centre and Location Code (leaf-level default)
    # -------- MERGED BY UNIT: one entry per unit, with that unit's
    # cost_centers/cost_centers_erp/locations/locations_erp each
    # de-duplicated (dict.fromkeys preserves first-seen order while dropping
    # exact repeats) - matches the pre-existing select_units/
    # select_cost_centers/select_location_codes grouping behavior this
    # table replaces.
    unit_map = {}

    def ensure_unit(unit):
        if not unit:
            return
        if unit not in unit_map:
            unit_map[unit] = {
                "unit": unit,
                "cost_centers": [],
                "cost_centers_erp": [],
                "locations": [],
                "locations_erp": []
            }

    for row in doc.cost_centre_and_location_code_grouping:
        if not row.unit:
            continue

        ensure_unit(row.unit)

        ref = (row.reference_for or "Both").strip()
        include_budget = ref in ["Budget", "Both"]
        include_actual = ref in ["Actual", "Both"]

        if include_budget and row.cost_center:
            unit_map[row.unit]["cost_centers"].append(row.cost_center)
        if include_actual and row.cost_center_erp:
            unit_map[row.unit]["cost_centers_erp"].append(row.cost_center_erp)
        if include_budget and row.location_code:
            unit_map[row.unit]["locations"].append(row.location_code)
        if include_actual and row.location_code_erp:
            unit_map[row.unit]["locations_erp"].append(row.location_code_erp)

    for unit in unit_map.values():
        unit["cost_centers"] = list(dict.fromkeys(unit["cost_centers"]))
        unit["cost_centers_erp"] = list(dict.fromkeys(unit["cost_centers_erp"]))
        unit["locations"] = list(dict.fromkeys(unit["locations"]))
        unit["locations_erp"] = list(dict.fromkeys(unit["locations_erp"]))

    return list(unit_map.values())


# Like resolve_grouped_units, but keeps the "Define by Card Mapping" hierarchy intact instead of flattening it: returns {"label", "settings_doc", "grouped_units", "children": [...]} where "grouped_units" is this node's OWN leaf-level rows (empty for a pure Card Mapping node) and "children" is the resolved tree for each sub-item, recursively. A leaf ("Define by Cost Centre and Location Code") node has grouped_units populated and no children. _visited guards against a sub_items cycle the same way resolve_grouped_units does.
def resolve_grouped_units_tree(doc, _visited=None):
    _visited = _visited or set()
    if doc.name in _visited:
        frappe.log_error(
            title="Overview number cards settings: sub_items cycle detected",
            message=f"{doc.name} ({doc.number_card_title}) is part of a sub_items cycle: {_visited}",
        )
        return {"label": doc.number_card_title, "settings_doc": doc.name, "grouped_units": [], "children": []}

    _visited = _visited | {doc.name}

    if doc.type == "Define by Card Mapping":
        sub_rows = sorted(doc.sub_items, key=lambda r: (r.sequence_id or 0))
        children = []
        for row in sub_rows:
            if not row.sub_setting:
                continue
            sub_doc = frappe.get_doc("Overview number cards settings", row.sub_setting)
            children.append(resolve_grouped_units_tree(sub_doc, _visited))
        return {"label": doc.number_card_title, "settings_doc": doc.name, "grouped_units": [], "children": children}

    return {
        "label": doc.number_card_title,
        "settings_doc": doc.name,
        "grouped_units": resolve_grouped_units(doc),
        "children": [],
    }


# Fetches every "Overview number cards settings" doc, resolves each into grouped_units, and groups the results by table_name (from each doc's combination_table_settings rows), optionally filtered to specific table names.
@guest_api
def get_combination_table_settings_test(table_name_filter=None):

    results = {}

    def parse_list(value):
        if not value:
            return []

        # Supports:
        # "Table A,Table B"
        # ["Table A", "Table B"]
        if isinstance(value, (list, tuple)):
            return [str(v).strip() for v in value if v]

        return [
            v.strip()
            for v in str(value).split(",")
            if v.strip()
        ]

    table_filters = parse_list(table_name_filter)

    # lowercase mapping for comparison
    table_filter_map = {
        table_name.lower(): table_name
        for table_name in table_filters
    }

    settings_docs = frappe.get_all(
        "Overview number cards settings",
        fields=["name", "number_card_title"],
        order_by="creation desc"
    )

    for setting in settings_docs:

        doc = frappe.get_doc(
            "Overview number cards settings",
            setting.name
        )

        grouped_units = resolve_grouped_units(doc)

        for row in doc.combination_table_settings:

            if not row.table_name:
                continue

            original_table_name = row.table_name.strip()
            normalized_table_name = original_table_name.lower()

            if table_filters:
                if normalized_table_name not in table_filter_map:
                    continue

            if original_table_name not in results:
                results[original_table_name] = []

            results[original_table_name].append({
                "settings_doc": doc.name,
                "label": doc.number_card_title,
                "grouped_units": grouped_units,
                "combination_settings": {
                    "table_name": row.table_name,
                    "sequence_id": row.sequence_id,
                    "is_this_sub_item": row.is_this_sub_item
                }
            })

    return results
