from annual_budget.utils import guest_api
import frappe
from frappe.desk.page.setup_wizard.install_fixtures import _
# # ! =======================================================  Units filter values =============================================================================
@guest_api
def get_units():

    current_user = frappe.session.user
    roles = frappe.get_roles(current_user)

    is_admin = (
        "System Manager" in roles or
        "Finance MIS Admin" in roles
    )
    if is_admin:

        unit_data = frappe.get_all(
            "Unit",
            fields=["name", "unit_decription"],
            order_by="name asc"
        )

    else:

        finance_docs = frappe.get_all(
            "Finance user access",
            filters={"user": current_user},
            fields=["name"]
        )

        allowed_units = set()

        for finance in finance_docs:
            doc = frappe.get_doc("Finance user access", finance.name)

            for row in doc.mapping:
                if row.unit:
                    allowed_units.add(row.unit)

        if not allowed_units:
            return {"data": []}

        unit_data = frappe.get_all(
            "Unit",
            filters={
                "name": ["in", list(allowed_units)]
            },
            fields=["name", "unit_decription"],
            order_by="name asc"
        )
    data = []

    data.append({
        "label": "",
        "value": ""
    })

    for u in unit_data:
        data.append({
            "label": f"{u.name} - {u.unit_decription}",
            "value": u.name
        })

    return {"data": data}
# # ! ======================================================= Cost center filter values =============================================================================
@guest_api
def get_cost_centers_by_set_id(units=None):

    if not units:
        return {"data": []}

    if isinstance(units, str):
        units = [u.strip() for u in units.split(",") if u.strip()]

    current_user = frappe.session.user
    roles = frappe.get_roles(current_user)

    is_admin = (
        "System Manager" in roles or
        "Finance MIS Admin" in roles
    )
    if is_admin:

        cost_centers = frappe.get_all(
            "Cost Center",
            filters={
                "set_id": ["in", units]
            },
            fields=["name", "cost_center", "cc_descr"],
            order_by="cost_center asc"
        )
    else:

        finance_docs = frappe.get_all(
            "Finance user access",
            filters={"user": current_user},
            fields=["name"]
        )

        allowed_cost_centers = []

        for finance in finance_docs:
            doc = frappe.get_doc("Finance user access", finance.name)

            for row in doc.mapping:
                if row.unit in units and row.cost_center_erp:
                    allowed_cost_centers.append(row.cost_center_erp)

        if not allowed_cost_centers:
            return {"data": []}

        cost_centers = frappe.get_all(
            "Cost Center",
            filters={
                "cost_center": ["in", allowed_cost_centers]
            },
            fields=["name", "cost_center", "cc_descr"],
            order_by="cost_center asc"
        )
    data = []

    for cc in cost_centers:
        data.append({
            "label": f"{cc.cost_center} - {cc.cc_descr}",
            "value": cc.name,
            "erp_cost_center_value": cc.cost_center
        })

    return {"data": data}
# ! =======================================================  Location code filter values =============================================================================
# @frappe.whitelist(allow_guest=True)
# def get_location_codes_by_unit(unit=None):

#     if not unit:
#         return {"data": []}
#     if isinstance(unit, str):
#         unit = [u.strip() for u in unit.split(",") if u.strip()]

#     current_user = frappe.session.user
#     roles = frappe.get_roles(current_user)

#     is_admin = (
#         "System Manager" in roles or
#         "Finance MIS Admin" in roles
#     )
#     if is_admin:

#         locations = frappe.get_all(
#             "Location Code",
#             filters={
#                 "unit": ["in", unit]
#             },
#             fields=["name", "location_code", "decription"],
#             order_by="location_code asc"
#         )
#     else:
#         finance_docs = frappe.get_all(
#             "Finance user access",
#             filters={"user": current_user},
#             fields=["name"]
#         )

#         allowed_location_codes = []

#         for finance in finance_docs:
#             doc = frappe.get_doc("Finance user access", finance.name)

#             for row in doc.mapping:
#                 if row.unit in unit and row.location_code_erp:
#                     allowed_location_codes.append(row.location_code_erp)

#         if not allowed_location_codes:
#             return {"data": []}

#         locations = frappe.get_all(
#             "Location Code",
#             filters={
#                 "location_code": ["in", allowed_location_codes]
#             },
#             fields=["name", "location_code", "decription"],
#             order_by="location_code asc"
#         )
#     data = []

#     for loc in locations:
#         data.append({
#             "label": f"{loc.location_code} - {loc.decription}",
#             "value": loc.name,
#             "erp_loc_value": loc.location_code,
#         })

#     return {
#         "data": data
#     }


@guest_api
def get_location_codes_by_unit(unit=None):

    if not unit:
        return {"data": []}

    if isinstance(unit, str):
        unit = [u.strip() for u in unit.split(",") if u.strip()]

    current_user = frappe.session.user
    roles = frappe.get_roles(current_user)

    is_admin = (
        "System Manager" in roles or
        "Finance MIS Admin" in roles
    )

    if is_admin:
        locations = frappe.get_all(
            "Location Code",
            filters={"unit": ["in", unit]},
            fields=["name", "location_code", "decription"],
            order_by="location_code asc"
        )
    else:
        finance_docs = frappe.get_all(
            "Finance user access",
            filters={"user": current_user},
            fields=["name"]
        )

        allowed_location_codes = []

        for finance in finance_docs:
            doc = frappe.get_doc("Finance user access", finance.name)

            for row in doc.mapping:
                if row.unit in unit and row.location_code_erp:
                    allowed_location_codes.append(row.location_code_erp)

        if not allowed_location_codes:
            return {"data": []}

        locations = frappe.get_all(
            "Location Code",
            filters={
                "location_code": ["in", allowed_location_codes]
            },
            fields=["name", "location_code", "decription"],
            order_by="location_code asc"
        )

    # 🔹 Group by description
    data_map = {}

    for loc in locations:
        key = loc.decription or "Unknown"

        if key not in data_map:
            data_map[key] = {
                "label": f"{loc.location_code} - {loc.decription}",
                "value": set(),
                "erp_loc_value": str(loc.location_code),  # ✅ only one value
            }

        data_map[key]["value"].add(str(loc.name))

    # 🔹 Final output
    data = []

    for item in data_map.values():
        data.append({
            "label": item["label"],
            "value": ",".join(sorted(item["value"])),
            "erp_loc_value": item["erp_loc_value"],  # ✅ single value only
        })

    return {
        "data": data
    }


# ! =======================================================  Theme filter values =============================================================================
# @frappe.whitelist(allow_guest=True)
# def get_theme():
#     theme = frappe.get_all(
#         "Overview number cards settings",
#         filters=[["set_group_id", "like", "%1%"]],
#         fields=["name", "number_card_title"]
#     )
#     return theme
# ! =======================================================  User permission level filter values =============================================================================
@guest_api
def get_user_mappings():

    current_user = frappe.session.user
    roles = frappe.get_roles(current_user)
    is_admin = "System Manager" in roles

    results = []

    if is_admin:
        finance_docs = frappe.get_all(
            "Finance user access",
            fields=["name", "user", "user_nmae"]
        )
    else:
     finance_docs = frappe.get_all(
            "Finance user access",
            filters={"user": current_user},
            fields=["name", "user", "user_nmae"]
        )

    for finance in finance_docs:

        doc = frappe.get_doc("Finance user access", finance.name)

        for row in doc.mapping:

            results.append({
                "full_name": finance.user_nmae or finance.user,
                "user": finance.user,

                "unit": row.unit,
                "unit_description": row.unit_description,
                "cost_center": row.cost_center_erp,
                "cost_center_description": row.cost_center_description,
                "cost_center_id": row.cost_center,
                "location_code_id": row.location_code,
                "location_code": row.location_code_erp,
                "location_description": row.location_description,
                "state":row.state
            })

    return results




# ! =======================================================  Financial Year filter values =============================================================================
@guest_api
def get_financial_year_list():

    fy_docs = frappe.get_all(
        "Financial Year List",
        fields=["name"]
    )

    # sort by first year
    fy_docs = sorted(
        fy_docs,
        key=lambda x: int(x.name.split("-")[0]),
        reverse=True
    )

    return [{"financial_year": d.name} for d in fy_docs]





import frappe


@guest_api
def get_theme():
    """
    Return only the Operating Unit cards (Overview number cards settings)
    that are relevant to the logged-in user's accessible units.

    Admins see all cards that have:
    combination_table_settings.table_name = "Operating Unit Filter Option"
    """

    current_user = frappe.session.user
    roles = frappe.get_roles(current_user)

    is_admin = (
        "System Manager" in roles
        or "Finance MIS Admin" in roles
    )

    # Get all cards
    all_cards = frappe.get_all(
        "Overview number cards settings",
        fields=["name", "number_card_title"]
    )

    visible_cards = []

    for card in all_cards:
        doc = frappe.get_doc(
            "Overview number cards settings",
            card.name
        )

        # Only consider cards configured as
        # "Operating Unit Filter Option"
        has_operating_unit_filter = any(
            row.table_name == "Operating Unit Filter Option"
            for row in (doc.combination_table_settings or [])
        )

        if not has_operating_unit_filter:
            continue

        # Admins can see all matching cards
        if is_admin:
            visible_cards.append({
                "name": card.name,
                "number_card_title": card.number_card_title
            })
            continue

        # Get user's allowed units
        finance_docs = frappe.get_all(
            "Finance user access",
            filters={"user": current_user},
            fields=["name"]
        )

        allowed_units = set()

        for fd in finance_docs:
            finance_doc = frappe.get_doc(
                "Finance user access",
                fd.name
            )

            for row in (finance_doc.mapping or []):
                if row.unit:
                    allowed_units.add(str(row.unit))

        if not allowed_units:
            continue

        # Get units assigned to the card
        card_units = {
            str(row.unit)
            for row in (doc.select_units or [])
            if row.unit
        }

        # Show card if user has access to at least one unit
        if card_units.intersection(allowed_units):
            visible_cards.append({
                "name": card.name,
                "number_card_title": card.number_card_title
            })

    return visible_cards


@guest_api
def get_theme_mappings(theme_name):
    """
    For a given 'Overview number cards settings' doc, return the
    units, cost centers and location codes from its child tables,
    filtered to what the logged-in user is allowed to see.
    """
    if not theme_name:
        return {"units": [], "cost_centers": [], "location_codes": []}

    current_user = frappe.session.user
    roles = frappe.get_roles(current_user)
    is_admin = "System Manager" in roles or "Finance MIS Admin" in roles

    doc = frappe.get_doc("Overview number cards settings", theme_name)

    # --- Build user's allowed sets (skip check for admins) ---
    allowed_units = None
    allowed_cost_centers = None
    allowed_location_codes = None

    if not is_admin:
        finance_docs = frappe.get_all(
            "Finance user access",
            filters={"user": current_user},
            fields=["name"]
        )
        allowed_units = set()
        allowed_cost_centers = set()
        allowed_location_codes = set()

        for fd in finance_docs:
            fa_doc = frappe.get_doc("Finance user access", fd.name)
            for row in fa_doc.mapping:
                if row.unit:
                    allowed_units.add(str(row.unit))
                if row.cost_center:
                    allowed_cost_centers.add(str(row.cost_center))
                if row.location_code:
                    allowed_location_codes.add(str(row.location_code))

    # --- Units ---
    units = []
    for row in (doc.select_units or []):
        if not row.unit:
            continue
        if allowed_units is not None and str(row.unit) not in allowed_units:
            continue
        units.append({
            "value": str(row.unit),
            "label": f"{row.unit} - {row.unit_description or ''}"
        })

    # --- Cost Centers ---
    cost_centers = []
    for row in (doc.select_cost_centers or []):
        if not row.cost_center:
            continue
        if allowed_cost_centers is not None and str(row.cost_center) not in allowed_cost_centers:
            continue
        # Fetch live ERP value from Cost Center doctype
        cc = frappe.get_value(
            "Cost Center", row.cost_center,
            ["cost_center", "cc_descr"], as_dict=True
        ) or {}
        cost_centers.append({
            "value": str(row.cost_center),
            "label": f"{cc.get('cost_center', '')} - {cc.get('cc_descr', '')}",
            "erp_cost_center_value": str(cc.get("cost_center") or "")
        })

    # --- Location Codes ---
    location_codes = []
    for row in (doc.select_location_codes or []):
        if not row.location_code:
            continue
        if allowed_location_codes is not None and str(row.location_code) not in allowed_location_codes:
            continue
        lc = frappe.get_value(
            "Location Code", row.location_code,
            ["location_code", "decription"], as_dict=True
        ) or {}
        location_codes.append({
            "value": str(row.location_code),
            "label": f"{lc.get('location_code', '')} - {lc.get('decription', '')}",
            "erp_loc_value": str(lc.get("location_code") or "")
        })

    return {
        "units": units,
        "cost_centers": cost_centers,
        "location_codes": location_codes
    }