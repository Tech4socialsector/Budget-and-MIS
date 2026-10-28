import frappe

from budget_mis.utils import guest_api


# Resolves an "Overview number cards settings" doc into grouped_units, following doc.type:
# - "Define by Card Mapping": recurses through Sub Items (Card grouping rows), concatenating each sub-card's own grouped_units rather than merging across sub-cards.
# - "Define by Cost Centre and Location Code" (or any other/unset type, the leaf-level default): reads Cost Centre and Location Code Grouping rows directly, one grouped_units entry PER ROW (never merged with sibling rows, even under the same unit) - matches the reference annual_budget app's is_special_case behavior exactly (see this branch's own inline comment for why). reference_for (Budget/Actual/Both) controls whether a row's budget-side value (cost_center/location_code), actuals-side value (cost_center_erp/location_code_erp), or both populate that row's own entry.
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
    # -------- EACH ROW IS ITS OWN GROUP (matches the reference annual_budget
    # app's is_special_case behavior exactly - NOT merged by unit). The
    # original port of this doctype (this session) collapsed the reference
    # app's three distinct modes - plain merge-by-unit (select_units/
    # select_cost_centers/select_location_codes), is_consolidation (now
    # "Define by Card Mapping" above), and is_special_case (each
    # cost_center+location_code pair kept as its own independent filter,
    # never blended with sibling rows under the same unit) - down to only
    # two, silently dropping is_special_case. That broke any card that
    # relied on it (confirmed via the reference app's live data: Hospital,
    # Central Initiatives, and a card named "Karnataka" (name=146) are all
    # is_special_case=1 there) - merging 34 Central Initiatives rows under
    # one APFD unit into a single "any of these 34 cost-centers AND any of
    # these locations" filter over-matched the real actuals, instead of
    # running 34 separate exact-pair filters and summing them (each
    # grouped_units entry already gets its own get_combined_actuals call,
    # summed in get_monthly_mis_break_up's consolidate_actuals - that
    # fan-out-and-sum mechanism is what makes "each row its own group" give
    # the correct total, exactly as it already does for "Define by Card
    # Mapping" above). This now matches resolve_grouped_rows's own per-row
    # shape (previously used only for the drill-down tree's display level)
    # instead of the old dict.fromkeys-deduped-by-unit merge.
    grouped_units = []
    for row in doc.cost_centre_and_location_code_grouping:
        if not (row.unit or row.cost_center or row.location_code):
            continue

        ref = (row.reference_for or "Both").strip()
        include_budget = ref in ["Budget", "Both"]
        include_actual = ref in ["Actual", "Both"]

        grouped_units.append({
            "unit": row.unit,
            "cost_centers": [row.cost_center] if include_budget and row.cost_center else [],
            "cost_centers_erp": [row.cost_center_erp] if include_actual and row.cost_center_erp else [],
            "locations": [row.location_code] if include_budget and row.location_code else [],
            "locations_erp": [row.location_code_erp] if include_actual and row.location_code_erp else [],
        })

    return grouped_units


# Resolves ONE "Define by Cost Centre and Location Code" leaf's own
# cost_centre_and_location_code_grouping rows into the same one-entry-per
# -row shape resolve_grouped_units' own leaf case now returns, PLUS each
# row's cost_center_description/location_code_description - used for the
# drill-down tree's own display labels (resolve_grouped_units has no need
# for those, so it doesn't carry them).
def resolve_grouped_rows(doc):
    rows = []
    for row in doc.cost_centre_and_location_code_grouping:
        if not (row.unit or row.cost_center or row.location_code):
            continue

        ref = (row.reference_for or "Both").strip()
        include_budget = ref in ["Budget", "Both"]
        include_actual = ref in ["Actual", "Both"]

        rows.append({
            "unit": row.unit,
            "cost_centers": [row.cost_center] if include_budget and row.cost_center else [],
            "cost_centers_erp": [row.cost_center_erp] if include_actual and row.cost_center_erp else [],
            "locations": [row.location_code] if include_budget and row.location_code else [],
            "locations_erp": [row.location_code_erp] if include_actual and row.location_code_erp else [],
            "cost_center_description": row.cost_center_description,
            "location_code_description": row.location_code_description,
        })
    return rows


# Like resolve_grouped_units, but keeps the "Define by Card Mapping" hierarchy intact instead of flattening it: returns {"label", "settings_doc", "grouped_units", "grouped_rows", "children": [...]} where "grouped_units" is this node's OWN leaf-level rows merged by unit (empty for a pure Card Mapping node, used for this node's own total), "grouped_rows" is the same leaf's rows kept separate one-per-row (for the drill-down tree's finest display level), and "children" is the resolved tree for each sub-item, recursively. A leaf ("Define by Cost Centre and Location Code") node has grouped_units/grouped_rows populated and no children. _visited guards against a sub_items cycle the same way resolve_grouped_units does.
def resolve_grouped_units_tree(doc, _visited=None):
    _visited = _visited or set()
    if doc.name in _visited:
        frappe.log_error(
            title="Overview number cards settings: sub_items cycle detected",
            message=f"{doc.name} ({doc.number_card_title}) is part of a sub_items cycle: {_visited}",
        )
        return {"label": doc.number_card_title, "settings_doc": doc.name, "grouped_units": [], "grouped_rows": [], "children": []}

    _visited = _visited | {doc.name}

    if doc.type == "Define by Card Mapping":
        sub_rows = sorted(doc.sub_items, key=lambda r: (r.sequence_id or 0))
        children = []
        for row in sub_rows:
            if not row.sub_setting:
                continue
            sub_doc = frappe.get_doc("Overview number cards settings", row.sub_setting)
            children.append(resolve_grouped_units_tree(sub_doc, _visited))
        return {"label": doc.number_card_title, "settings_doc": doc.name, "grouped_units": [], "grouped_rows": [], "children": children}

    return {
        "label": doc.number_card_title,
        "settings_doc": doc.name,
        "grouped_units": resolve_grouped_units(doc),
        "grouped_rows": resolve_grouped_rows(doc),
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
