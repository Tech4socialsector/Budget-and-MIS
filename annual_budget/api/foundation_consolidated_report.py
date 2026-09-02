from annual_budget.utils import guest_api
from annual_budget.api.actual_format import get_accounting_period_from_month, get_previous_financial_year, sum_of_actuals_by_sequence
from annual_budget.api.actuals import get_actuals_from_erp_month_wise, get_grouped_actuals
from annual_budget.api.phase_sheet import  get_consolidated_report, get_consolidated_report_actual_ytd, get_number_card_settings
import frappe
import re
import traceback
from decimal import Decimal


@guest_api
def get_grouped_actuals_quarter_and_month_wise_total(fiscal_year, accounting_period):
    try:

        def _num(x):
            try:
                return float(Decimal(str(x or 0)))
            except:
                return 0.0

        def normalize(text):
            return re.sub(r"\s+", " ", str(text or "")).strip().upper()

        def empty_months():
            return {
                "1":0.0,"2":0.0,"3":0.0,
                "4":0.0,"5":0.0,"6":0.0,
                "7":0.0,"8":0.0,"9":0.0,
                "10":0.0,"11":0.0,"12":0.0
            }

        def calculate_quarters(obj):
            m = obj["months"]
            obj["Q1"] = m["4"] + m["5"] + m["6"]
            obj["Q2"] = m["7"] + m["8"] + m["9"]
            obj["Q3"] = m["10"] + m["11"] + m["12"]
            obj["Q4"] = m["1"] + m["2"] + m["3"]

        # ============================================================
        # FETCH EXPENSE MASTER
        # ============================================================

        expense_rows = frappe.get_all(
            "Expenses",
            fields=[
                "name",
                "head_of_expense",
                "sub_head_of_expense",
                "type_of_expense",
                "sequence_id"
            ],
            order_by="sequence_id asc"
        ) or []

        expense_lookup = {e["name"]: e for e in expense_rows}

        # ============================================================
        # FETCH GL MAPPING
        # ============================================================

        gl_rows = frappe.get_all(
            "GL code Mapping",
            fields=["parent","gl_code_map"]
        ) or []

        gl_parent_map = {}

        for row in gl_rows:
            gl = str(row.get("gl_code_map") or "").strip()
            parent = str(row.get("parent") or "").strip()

            if gl and parent:
                gl_parent_map[gl] = parent

        # ============================================================
        # BUILD STRUCTURE
        # ============================================================

        heads = {}

        MAIN_HEADS = [
            "CAPITAL EXPENSES",
            "OPERATING EXPENSES",
            "COVID SUPPORT"
        ]

        for e in expense_rows:

            raw_head = normalize(e.get("head_of_expense"))
            sub_head = normalize(e.get("sub_head_of_expense"))
            item_name = str(e.get("type_of_expense") or "UNKNOWN ITEM").strip()
            seq = int(e.get("sequence_id") or 9999)

            # decide parent head

            if raw_head in MAIN_HEADS:
                parent_head = raw_head
            else:
                parent_head = "OPERATING EXPENSES"
                sub_head = raw_head

            if parent_head not in heads:

                heads[parent_head] = {
                    "name": parent_head,
                    "sequence_id": seq,
                    "Q1":0.0,"Q2":0.0,"Q3":0.0,"Q4":0.0,
                    "months": empty_months(),
                    "items": {},
                    "sub_heads": {}
                }

            # main heads with direct items
            if parent_head in ["CAPITAL EXPENSES","COVID SUPPORT"]:

                heads[parent_head]["items"][item_name] = {
                    "name": item_name,
                    "sequence_id": seq,
                    "gl_code": None,
                    "Q1":0.0,"Q2":0.0,"Q3":0.0,"Q4":0.0,
                    "months": empty_months()
                }

            else:

                if sub_head not in heads[parent_head]["sub_heads"]:

                    heads[parent_head]["sub_heads"][sub_head] = {
                        "name": sub_head,
                        "sequence_id": seq,
                        "Q1":0.0,"Q2":0.0,"Q3":0.0,"Q4":0.0,
                        "months": empty_months(),
                        "items": {}
                    }

                heads[parent_head]["sub_heads"][sub_head]["items"][item_name] = {
                    "name": item_name,
                    "sequence_id": seq,
                    "gl_code": None,
                    "Q1":0.0,"Q2":0.0,"Q3":0.0,"Q4":0.0,
                    "months": empty_months()
                }

        # ============================================================
        # FETCH ERP DATA
        # ============================================================

        response = get_actuals_from_erp_month_wise(
            fiscal_year,
            accounting_period
        )

        if "message" in response:
            response = response["message"]

        erp_data = response.get("data") if response.get("status") == "success" else []

        for row in erp_data:

            try:

                period = row.get("accounting_period")
                account = str(row.get("account") or "").strip()
                amount = _num(row.get("posted_total_amt"))

                if not period or account not in gl_parent_map:
                    continue

                month = str(period)

                # Period 0 is PeopleSoft's opening/beginning-balance period,
                # not fiscal-year activity — excluded from this report on
                # purpose, not via the KeyError empty_months() would raise.
                if month == "0":
                    continue

                parent_expense_name = gl_parent_map.get(account)
                expense = expense_lookup.get(parent_expense_name)

                if not expense:
                    continue

                raw_head = normalize(expense.get("head_of_expense"))
                sub_head = normalize(expense.get("sub_head_of_expense"))
                item_name = str(expense.get("type_of_expense") or "").strip()

                if raw_head in MAIN_HEADS:
                    parent_head = raw_head
                else:
                    parent_head = "OPERATING EXPENSES"
                    sub_head = raw_head

                heads[parent_head]["months"][month] += amount

                if parent_head in ["CAPITAL EXPENSES","COVID SUPPORT"]:

                    if item_name in heads[parent_head]["items"]:
                        item = heads[parent_head]["items"][item_name]
                        item["months"][month] += amount
                        item["gl_code"] = account

                else:

                    if sub_head in heads[parent_head]["sub_heads"]:

                        sub = heads[parent_head]["sub_heads"][sub_head]
                        sub["months"][month] += amount

                        if item_name in sub["items"]:
                            item = sub["items"][item_name]
                            item["months"][month] += amount
                            item["gl_code"] = account

            except:
                continue

        # ============================================================
        # CALCULATE QUARTERS
        # ============================================================

        for head in heads.values():

            calculate_quarters(head)

            for sub in head["sub_heads"].values():

                calculate_quarters(sub)

                for item in sub["items"].values():
                    calculate_quarters(item)

            for item in head["items"].values():
                calculate_quarters(item)

        # ============================================================
        # FINAL SORT
        # ============================================================

        final = []

        for head in sorted(heads.values(), key=lambda x: x["sequence_id"]):

            head["items"] = sorted(
                head["items"].values(),
                key=lambda x: x["sequence_id"]
            )

            sorted_subs = []

            for sub in head["sub_heads"].values():

                sub["items"] = sorted(
                    sub["items"].values(),
                    key=lambda x: x["sequence_id"]
                )

                sorted_subs.append(sub)

            head["sub_heads"] = sorted(
                sorted_subs,
                key=lambda x: x["sequence_id"]
            )

            final.append(head)

        return {
            "status":"success",
            "fiscal_year":fiscal_year,
            "data":final
        }

    except Exception:

        frappe.log_error(frappe.get_traceback(),"Actuals API Error")

        return {
            "status":"error",
            "message":"Unable to fetch actuals data. Please contact your administrator."
        }


@guest_api
def format_api(financial_year=None, month=None, set_group_id=None, previous_financial_year=None):

    def safe_join(arr):
        return ",".join([str(x).strip() for x in (arr or []) if x])

    previous_financial_year = get_previous_financial_year(financial_year)
    settings = get_number_card_settings(set_group_id)

    # sort settings
    settings = sorted(settings, key=lambda x: x.get("settings_doc", ""))

    final_results = []

    formatted = get_accounting_period_from_month(
        month,
        previous_financial_year
    )
    accounting_period = formatted.get("accounting_period")
    fiscal_year = formatted.get("fiscal_year")

    # ✅ CALL ONLY ONCE
    grouped_actuals_response = get_grouped_actuals(
        fiscal_year=fiscal_year,
        accounting_period=accounting_period
    )

    grouped_actuals_data = grouped_actuals_response.get("data", [])

    for s in settings:

        # ✅ SAFE JOIN
        units = safe_join(s.get("units"))
        cost_centers = safe_join(s.get("cost_centers"))
        locations = safe_join(s.get("locations"))
        cost_centers_erp = safe_join(s.get("cost_centers_erp"))
        locations_erp = safe_join(s.get("locations_erp"))

        actuals_data = get_combined_actuals(
            financial_year=financial_year,
            month=month,
            unit=units,
            cost_center=cost_centers,
            location_code=locations,
            erp_cost_center_value=cost_centers_erp,
            erp_loc_value=locations_erp,
            grouped_actuals_data=grouped_actuals_data
        )

        final_results.append({
            "settings_doc": s.get("settings_doc"),
            "set_group_id": s.get("set_group_id"),  # ✅ ADDED
            "label": s.get("label"),
            "units": units,
            "cost_centers": cost_centers,
            "locations": locations,
            "cost_centers_erp": cost_centers_erp,
            "locations_erp": locations_erp,
            "actuals": actuals_data,
        })

    return final_results

@guest_api
def get_combined_actuals(
    financial_year=None,
    month=None,
    unit=None,
    cost_center=None,
    location_code=None,
    erp_loc_value=None,
    erp_cost_center_value=None,
    grouped_actuals_data=None   # ✅ NEW PARAM
):
    from decimal import Decimal, ROUND_HALF_UP

    def to_decimal(value):
        try:
            return Decimal(str(value or 0))
        except Exception:
            return Decimal("0")

    def to_float(value):
        return float(value.quantize(Decimal("0.01"), ROUND_HALF_UP))

    def to_list(value):
        if value is None:
            return None
        if isinstance(value, str):
            return [v.strip() for v in value.split(",") if v.strip()]
        if isinstance(value, (list, tuple)):
            return [str(v).strip() for v in value if v]
        return None

    MOVE_UNDER_OPERATING = [
        "OTHER  OPERATING EXPENSES",
        "Medical Expenses"
    ]

    CAPITAL_HEAD = "CAPITAL  EXPENSES"
    OPERATING_HEAD = "OPERATING  EXPENSES"
    COVID_HEAD = "COVID SUPPORT"

    # --------------------------------------------------
    # 1️⃣ Build Base Structure
    # --------------------------------------------------

    expense_rows = frappe.get_all(
        "Expenses",
        fields=[
            "head_of_expense",
            "sub_head_of_expense",
            "type_of_expense",
            "gl_code",
            "sequence_id"
        ],
        order_by="sequence_id asc"
    )

    heads = {}

    for row in expense_rows:

        head_name = (row.head_of_expense or "").strip()
        sub_name = (row.sub_head_of_expense or "").strip()
        expense_name = (row.type_of_expense or "").strip()
        seq = row.sequence_id or 9999

        if not head_name or not expense_name:
            continue

        if head_name in MOVE_UNDER_OPERATING:
            sub_name = head_name
            head_name = OPERATING_HEAD

        head_obj = heads.setdefault(head_name, {
            "name": head_name,
            "sequence_id": seq,
            "sub_heads": {},
            "items": [],
            "ytd": Decimal("0"),
            "total_posted_amt_ytd": Decimal("0")
        })

        item_data = {
            "name": expense_name,
            "sequence_id": seq,
            "gl_code": row.gl_code or "",
            "ytd": Decimal("0"),
            "total_posted_amt": Decimal("0")
        }

        if head_name in [CAPITAL_HEAD, COVID_HEAD]:
            head_obj["items"].append(item_data)
        else:
            if sub_name:
                sub_obj = head_obj["sub_heads"].setdefault(sub_name, {
                    "name": sub_name,
                    "sequence_id": seq,
                    "items": [],
                    "ytd": Decimal("0"),
                    "total_posted_amt_ytd": Decimal("0")
                })
                sub_obj["items"].append(item_data)
            else:
                head_obj["items"].append(item_data)

    structure = []

    for head in sorted(heads.values(), key=lambda x: x["sequence_id"]):
        head["sub_heads"] = sorted(
            head["sub_heads"].values(),
            key=lambda x: x["sequence_id"]
        )
        structure.append(head)

    # --------------------------------------------------
    # 2️⃣ Budget Lookup
    # --------------------------------------------------

    budget_lookup = {}

    budget_data = get_consolidated_report_actual_ytd(
        financial_year=financial_year,
        units=unit,
        cost_center=cost_center,
        location_code=location_code,
        month=month
    )

    for head in budget_data or []:
        for item in head.get("items", []):
            key = (item.get("sequence_id"), item.get("name"))
            budget_lookup[key] = to_decimal(item.get("ytd"))

        for sub in head.get("sub_heads", []):
            for item in sub.get("items", []):
                key = (item.get("sequence_id"), item.get("name"))
                budget_lookup[key] = to_decimal(item.get("ytd"))

    # --------------------------------------------------
    # 3️⃣ Actual Lookup (FILTERED DATA)
    # --------------------------------------------------

    units = set(to_list(unit) or [])
    ccs = set(to_list(erp_cost_center_value) or [])
    locs = set(to_list(erp_loc_value) or [])

    filtered_data = grouped_actuals_data or []

    if units:
        filtered_data = [d for d in filtered_data if d.get("business_unit") in units]

    if ccs:
        filtered_data = [d for d in filtered_data if d.get("deptid") in ccs]

    if locs:
        filtered_data = [d for d in filtered_data if d.get("operating_unit") in locs]

    actual_lookup = {}

    for row in filtered_data:
        key = (
            row.get("sequence_id"),
            row.get("type_of_expense")
        )
        actual_lookup[key] = actual_lookup.get(key, Decimal("0")) + to_decimal(
            row.get("total_posted_amt")
        )

    # --------------------------------------------------
    # 4️⃣ Inject Budget + Actual Totals
    # --------------------------------------------------

    for head in structure:

        head_budget_total = Decimal("0")
        head_actual_total = Decimal("0")

        for item in head["items"]:
            key = (item["sequence_id"], item["name"])

            item["ytd"] = budget_lookup.get(key, Decimal("0"))
            item["total_posted_amt"] = actual_lookup.get(key, Decimal("0"))

            head_budget_total += item["ytd"]
            head_actual_total += item["total_posted_amt"]

        for sub in head["sub_heads"]:

            sub_budget_total = Decimal("0")
            sub_actual_total = Decimal("0")

            for item in sub["items"]:
                key = (item["sequence_id"], item["name"])

                item["ytd"] = budget_lookup.get(key, Decimal("0"))
                item["total_posted_amt"] = actual_lookup.get(key, Decimal("0"))

                sub_budget_total += item["ytd"]
                sub_actual_total += item["total_posted_amt"]

            sub["ytd"] = sub_budget_total
            sub["total_posted_amt_ytd"] = sub_actual_total

            head_budget_total += sub_budget_total
            head_actual_total += sub_actual_total

        head["ytd"] = head_budget_total
        head["total_posted_amt_ytd"] = head_actual_total

    # --------------------------------------------------
    # 5️⃣ Convert Decimal → Float
    # --------------------------------------------------

    for head in structure:

        head["ytd"] = to_float(head["ytd"])
        head["total_posted_amt_ytd"] = to_float(head["total_posted_amt_ytd"])

        for item in head["items"]:
            item["ytd"] = to_float(item["ytd"])
            item["total_posted_amt"] = to_float(item["total_posted_amt"])

        for sub in head["sub_heads"]:
            sub["ytd"] = to_float(sub.get("ytd", Decimal("0")))
            sub["total_posted_amt_ytd"] = to_float(sub.get("total_posted_amt_ytd", Decimal("0")))

            for item in sub["items"]:
                item["ytd"] = to_float(item["ytd"])
                item["total_posted_amt"] = to_float(item["total_posted_amt"])

    return structure


@guest_api
def get_combination_table_settings(table_name_filter=None):

    results = []

    def parse_list(value):
        if not value:
            return []
        return [v.strip() for v in str(value).split(",") if v.strip()]

    # ✅ HANDLE MULTIPLE TABLE NAMES
    table_filters = parse_list(table_name_filter)
    table_filters = [t.lower() for t in table_filters]

    # ✅ FETCH ALL SETTINGS (NO FILTER)
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

        # -------- EXISTING FIELDS --------
        units = [d.unit for d in doc.select_units]
        cost_centers = [d.cost_center for d in doc.select_cost_centers]
        cost_centers_erp = [d.cost_center_erp for d in doc.select_cost_centers]
        locations = [d.location_code for d in doc.select_location_codes]
        locations_erp = [d.location_code_erp for d in doc.select_location_codes]

        # -------- CHILD TABLE FILTER --------
        combination_settings = []

        for row in doc.combination_table_settings:

            row_table_name = (row.table_name or "").strip().lower()

            # ✅ APPLY FILTER
            if table_filters and row_table_name not in table_filters:
                continue

            combination_settings.append({
                "table_name": row.table_name,
                "sequence_id": row.sequence_id,
                "is_this_sub_item": row.is_this_sub_item
            })

        # ❗ Skip if no matching child rows
        if table_filters and not combination_settings:
            continue

        # -------- FINAL RESULT --------
        results.append({
            "settings_doc": doc.name,
            "label": doc.number_card_title,
            "units": units,
            "cost_centers": cost_centers,
            "cost_centers_erp": cost_centers_erp,
            "locations": locations,
            "locations_erp": locations_erp,
            "combination_settings": combination_settings
        })

    return results



@guest_api
def get_combination_table_settings_1(table_name_filter=None):

    results = []

    def parse_list(value):
        if not value:
            return []
        return [v.strip() for v in str(value).split(",") if v.strip()]

    # ✅ HANDLE MULTIPLE TABLE NAMES
    table_filters = parse_list(table_name_filter)
    table_filters = [t.lower() for t in table_filters]

    # ✅ FETCH ALL SETTINGS
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

        # -------- GROUPING BY UNIT --------
        unit_map = {}

        # ✅ Initialize units
        for d in doc.select_units:
            if not d.unit:
                continue

            if d.unit not in unit_map:
                unit_map[d.unit] = {
                    "unit": d.unit,
                    "cost_centers": [],
                    "cost_centers_erp": [],
                    "locations": [],
                    "locations_erp": []
                }

        # -------- COST CENTERS (WITH reference_for LOGIC) --------
        for d in doc.select_cost_centers:
            if not d.unit:
                continue

            if d.unit not in unit_map:
                unit_map[d.unit] = {
                    "unit": d.unit,
                    "cost_centers": [],
                    "cost_centers_erp": [],
                    "locations": [],
                    "locations_erp": []
                }

            ref = (d.reference_for or "Both").strip()

            # ✅ Budget → normal cost center
            if ref in ["Budget", "Both"]:
                if d.cost_center:
                    unit_map[d.unit]["cost_centers"].append(d.cost_center)

            # ✅ Actual → ERP cost center
            if ref in ["Actual", "Both"]:
                if d.cost_center_erp:
                    unit_map[d.unit]["cost_centers_erp"].append(d.cost_center_erp)

        # -------- LOCATIONS (WITH reference_for LOGIC) --------
        for d in doc.select_location_codes:
            if not d.unit:
                continue

            if d.unit not in unit_map:
                unit_map[d.unit] = {
                    "unit": d.unit,
                    "cost_centers": [],
                    "cost_centers_erp": [],
                    "locations": [],
                    "locations_erp": []
                }

            ref = (d.reference_for or "Both").strip()

            # ✅ Budget → normal location
            if ref in ["Budget", "Both"]:
                if d.location_code:
                    unit_map[d.unit]["locations"].append(d.location_code)

            # ✅ Actual → ERP location
            if ref in ["Actual", "Both"]:
                if d.location_code_erp:
                    unit_map[d.unit]["locations_erp"].append(d.location_code_erp)

        # -------- REMOVE DUPLICATES (OPTIONAL BUT RECOMMENDED) --------
        for unit in unit_map.values():
            unit["cost_centers"] = list(set(unit["cost_centers"]))
            unit["cost_centers_erp"] = list(set(unit["cost_centers_erp"]))
            unit["locations"] = list(set(unit["locations"]))
            unit["locations_erp"] = list(set(unit["locations_erp"]))

        # Convert to list
        grouped_units = list(unit_map.values())

        # -------- CHILD TABLE FILTER --------
        combination_settings = []

        for row in doc.combination_table_settings:

            row_table_name = (row.table_name or "").strip().lower()

            # ✅ APPLY FILTER
            if table_filters and row_table_name not in table_filters:
                continue

            combination_settings.append({
                "table_name": row.table_name,
                "sequence_id": row.sequence_id,
                "is_this_sub_item": row.is_this_sub_item
            })

        # ❗ Skip if no matching child rows
        if table_filters and not combination_settings:
            continue

        # -------- FINAL RESULT --------
        results.append({
            "settings_doc": doc.name,
            "label": doc.number_card_title,
            "grouped_units": grouped_units,
            "combination_settings": combination_settings
        })

    return results


def warn_on_overlapping_main_items(settings, grouped_actuals_data, table_name_filter):
    """Log a warning if two main-item (is_this_sub_item == 0) cards under the
    same table_name_filter both match the same ERP actuals row.

    This is the exact failure mode behind past Foundation Overall / Actuals
    Consolidated mismatches: two cards share a cost center and one of them
    has no location restriction, so a GL row gets counted twice. The
    settings data is the right place to fix an overlap once found -- this
    just makes sure it can't happen silently again.
    """
    main_criteria = []
    for s in settings:
        if not any(c.get("is_this_sub_item") == 0 for c in s.get("combination_settings", [])):
            continue
        for gu in s.get("grouped_units", []):
            main_criteria.append({
                "label": s.get("label"),
                "unit": gu.get("unit"),
                "ccs": set(gu.get("cost_centers_erp") or []),
                "locs": set(gu.get("locations_erp") or []),
            })

    overlap_amounts = {}

    for row in grouped_actuals_data or []:
        matched_by = set()
        for crit in main_criteria:
            if crit["unit"] and row.get("business_unit") != crit["unit"]:
                continue
            if crit["ccs"] and row.get("deptid") not in crit["ccs"]:
                continue
            if crit["locs"] and row.get("operating_unit") not in crit["locs"]:
                continue
            matched_by.add(crit["label"])

        if len(matched_by) > 1:
            pair = tuple(sorted(matched_by))
            amount = float(row.get("total_posted_amt") or 0)
            overlap_amounts[pair] = overlap_amounts.get(pair, 0) + amount * (len(matched_by) - 1)

    if overlap_amounts:
        details = "\n".join(f"{pair}: {amount:.2f}" for pair, amount in overlap_amounts.items())
        frappe.log_error(
            title="Overlapping cost centers in Overview number cards settings",
            message=(
                f"table_name_filter={table_name_filter!r} -- the following main-item card "
                f"pairs claim overlapping ERP cost centers, double-counting actuals:\n{details}"
            ),
        )




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

    # -----------------------------------
    # TABLE NAME FILTER
    # -----------------------------------
    table_filters = parse_list(table_name_filter)

    # lowercase mapping for comparison
    table_filter_map = {
        table_name.lower(): table_name
        for table_name in table_filters
    }

    # -----------------------------------
    # FETCH SETTINGS
    # -----------------------------------
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

        # ===================================
        # GROUPING BY UNIT
        # ===================================
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

        # -----------------------------------
        # UNITS
        # -----------------------------------
        for d in doc.select_units:
            ensure_unit(d.unit)

        # -----------------------------------
        # COST CENTERS
        # -----------------------------------
        for d in doc.select_cost_centers:

            if not d.unit:
                continue

            ensure_unit(d.unit)

            ref = (d.reference_for or "Both").strip()

            # Budget
            if ref in ["Budget", "Both"]:
                if d.cost_center:
                    unit_map[d.unit]["cost_centers"].append(
                        d.cost_center
                    )

            # Actual
            if ref in ["Actual", "Both"]:
                if d.cost_center_erp:
                    unit_map[d.unit]["cost_centers_erp"].append(
                        d.cost_center_erp
                    )

        # -----------------------------------
        # LOCATIONS
        # -----------------------------------
        for d in doc.select_location_codes:

            if not d.unit:
                continue

            ensure_unit(d.unit)

            ref = (d.reference_for or "Both").strip()

            # Budget
            if ref in ["Budget", "Both"]:
                if d.location_code:
                    unit_map[d.unit]["locations"].append(
                        d.location_code
                    )

            # Actual
            if ref in ["Actual", "Both"]:
                if d.location_code_erp:
                    unit_map[d.unit]["locations_erp"].append(
                        d.location_code_erp
                    )

        # -----------------------------------
        # REMOVE DUPLICATES
        # -----------------------------------
        for unit in unit_map.values():

            unit["cost_centers"] = list(
                dict.fromkeys(unit["cost_centers"])
            )

            unit["cost_centers_erp"] = list(
                dict.fromkeys(unit["cost_centers_erp"])
            )

            unit["locations"] = list(
                dict.fromkeys(unit["locations"])
            )

            unit["locations_erp"] = list(
                dict.fromkeys(unit["locations_erp"])
            )

        grouped_units = list(unit_map.values())

        # ===================================
        # TABLE NAME WISE PROCESSING
        # ===================================
        for row in doc.combination_table_settings:

            if not row.table_name:
                continue

            original_table_name = row.table_name.strip()
            normalized_table_name = original_table_name.lower()

            # -----------------------------------
            # APPLY FILTER
            # -----------------------------------
            if table_filters:
                if normalized_table_name not in table_filter_map:
                    continue

            # -----------------------------------
            # INITIALIZE TABLE
            # -----------------------------------
            if original_table_name not in results:
                results[original_table_name] = []

            # -----------------------------------
            # ADD RESULT
            # -----------------------------------
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

@guest_api
def get_unit_wise_plan(financial_year, month, table_name_filter=None,is_previous=None):

    def safe_join(arr):
        return ",".join([str(x).strip() for x in (arr or []) if x])

    # ---------------- TOTAL CALCULATIONS ----------------
    def calculate_totals(actuals):

        for head in actuals:

            total_ytd = 0
            total_actual = 0

            if head.get("sub_heads"):

                for sub in head.get("sub_heads", []):

                    sub_ytd = 0
                    sub_actual = 0

                    for item in sub.get("items", []):
                        sub_ytd += item.get("ytd", 0) or 0
                        sub_actual += item.get("total_posted_amt", 0) or 0

                    sub["ytd"] = round(sub_ytd, 2)
                    sub["total_posted_amt_ytd"] = round(sub_actual, 2)

                    total_ytd += sub_ytd
                    total_actual += sub_actual

            else:
                for item in head.get("items", []):
                    total_ytd += item.get("ytd", 0) or 0
                    total_actual += item.get("total_posted_amt", 0) or 0

            head["ytd"] = round(total_ytd, 2)
            head["total_posted_amt_ytd"] = round(total_actual, 2)

        return actuals

    def calculate_grand_total(actuals):

        grand_ytd = 0
        grand_actual = 0

        for head in actuals:
            grand_ytd += head.get("ytd", 0) or 0
            grand_actual += head.get("total_posted_amt_ytd", 0) or 0

        return {
            "grand_total_ytd": round(grand_ytd, 2),
            "grand_total_actual": round(grand_actual, 2)
        }

    # ---------------- CONSOLIDATION ----------------
    def consolidate_actuals(all_unit_actuals):

        head_map = {}

        for unit_data in all_unit_actuals:

            for head in unit_data:

                key = head["name"]

                if key not in head_map:
                    head_map[key] = {
                        "name": head["name"],
                        "sequence_id": head["sequence_id"],
                        "sub_heads": [],
                        "items": [],
                        "ytd": 0,
                        "total_posted_amt_ytd": 0
                    }

                head_map[key]["ytd"] += head.get("ytd", 0)
                head_map[key]["total_posted_amt_ytd"] += head.get("total_posted_amt_ytd", 0)

                if head.get("sub_heads"):

                    sub_map = {s["name"]: s for s in head_map[key]["sub_heads"]}

                    for sub in head.get("sub_heads", []):

                        if sub["name"] not in sub_map:
                            new_sub = {
                                "name": sub["name"],
                                "sequence_id": sub["sequence_id"],
                                "items": [],
                                "ytd": 0,
                                "total_posted_amt_ytd": 0
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
                                    "total_posted_amt": 0
                                }
                                sub_map[sub["name"]]["items"].append(new_item)
                                item_map[item["name"]] = new_item

                            item_map[item["name"]]["ytd"] += item.get("ytd", 0)
                            item_map[item["name"]]["total_posted_amt"] += item.get("total_posted_amt", 0)

                else:
                    item_map = {i["name"]: i for i in head_map[key]["items"]}

                    for item in head.get("items", []):

                        if item["name"] not in item_map:
                            new_item = {
                                "name": item["name"],
                                "sequence_id": item["sequence_id"],
                                "gl_code": item.get("gl_code"),
                                "ytd": 0,
                                "total_posted_amt": 0
                            }
                            head_map[key]["items"].append(new_item)
                            item_map[item["name"]] = new_item

                        item_map[item["name"]]["ytd"] += item.get("ytd", 0)
                        item_map[item["name"]]["total_posted_amt"] += item.get("total_posted_amt", 0)

        return list(head_map.values())

    # ---------------- MAIN ----------------
    if is_previous == 1:
    # previous_financial_year = get_previous_financial_year(financial_year)
        financial_year = get_previous_financial_year(financial_year)
    settings = get_combination_table_settings_1(table_name_filter)

    formatted = get_accounting_period_from_month(month, financial_year)

    grouped_actuals_data = get_grouped_actuals(
        fiscal_year=formatted.get("fiscal_year"),
        accounting_period=formatted.get("accounting_period")
    ).get("data", [])

    final_results = []

    overall_ytd = 0
    overall_actual = 0

    capex_total_ytd = 0
    capex_total_actual = 0

    opex_total_ytd = 0
    opex_total_actual = 0

    # Accumulates each table's `consolidated` head tree (same is_this_sub_item
    # gate as overall_ytd/capex/opex below, to avoid double-counting sub-item
    # tables) so it can be merged into one grand-total-across-all-units tree
    # via consolidate_actuals() further down - this becomes
    # main_item_breakdown on the final CONSOLIDATED entry, which the
    # Budget & Actuals tab's Grand Total column reads by head/sub_head/item
    # name (same shape as a normal unit's `actuals` tree).
    all_consolidated_for_breakdown = []

    for s in settings:

        for combo in s.get("combination_settings", []):

            all_unit_actuals = []

            for gu in s.get("grouped_units", []):

                actuals = get_combined_actuals(
                    financial_year=financial_year,
                    month=month,
                    unit=gu.get("unit"),
                    cost_center=safe_join(gu.get("cost_centers")),
                    location_code=safe_join(gu.get("locations")),
                    erp_cost_center_value=safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=safe_join(gu.get("locations_erp")),
                    grouped_actuals_data=grouped_actuals_data
                )

                actuals = calculate_totals(actuals)
                all_unit_actuals.append(actuals)

            consolidated = consolidate_actuals(all_unit_actuals)
            totals = calculate_grand_total(consolidated)

            # ✅ Extract CAPEX & OPEX from heads
            capex_local = 0
            capex_actual_local = 0
            opex_local = 0
            opex_actual_local = 0

            for head in consolidated:
                name = (head.get("name") or "").upper()

                if "CAPITAL" in name:
                    capex_local += head.get("ytd", 0)
                    capex_actual_local += head.get("total_posted_amt_ytd", 0)

                elif "OPERATING" in name:
                    opex_local += head.get("ytd", 0)
                    opex_actual_local += head.get("total_posted_amt_ytd", 0)

            if combo.get("is_this_sub_item") == 0:
                overall_ytd += totals["grand_total_ytd"]
                overall_actual += totals["grand_total_actual"]

                capex_total_ytd += capex_local
                capex_total_actual += capex_actual_local

                opex_total_ytd += opex_local
                opex_total_actual += opex_actual_local

                # Snapshot before the synthetic "GRAND TOTAL" pseudo-head is
                # appended below - that pseudo-head is a display-only row for
                # this table's own listing and would double-count into the
                # merged breakdown otherwise.
                all_consolidated_for_breakdown.append(list(consolidated))

            consolidated.append({
                "name": "GRAND TOTAL",
                "sequence_id": 9999,
                "sub_heads": [],
                "items": [],
                "ytd": totals["grand_total_ytd"],
                "total_posted_amt_ytd": totals["grand_total_actual"]
            })

            final_results.append({
                "settings_doc": s.get("settings_doc"),
                "label": s.get("label"),
                "table_name": combo.get("table_name"),
                "sequence_id": combo.get("sequence_id"),
                "is_this_sub_item": combo.get("is_this_sub_item"),
                "actuals": consolidated
            })

    # ✅ FINAL CONSOLIDATED TOTAL
    final_results.append({
        "settings_doc": "CONSOLIDATED",
        "label": "CONSOLIDATED TOTAL",
        "table_name": "CONSOLIDATED",
        "sequence_id": 9999,
        "is_this_sub_item": 0,
        "actuals": [
            {
                "name": "CAPEX TOTAL",
                "ytd": round(capex_total_ytd, 2),
                "total_posted_amt_ytd": round(capex_total_actual, 2)
            },
            {
                "name": "OPEX TOTAL",
                "ytd": round(opex_total_ytd, 2),
                "total_posted_amt_ytd": round(opex_total_actual, 2)
            },
            {
                "name": "OVERALL GRAND TOTAL",
                "ytd": round(overall_ytd, 2),
                "total_posted_amt_ytd": round(overall_actual, 2)
            }
        ],
        # Grand-total-across-all-units head/sub_head/item tree, same shape
        # and names as a normal unit's `actuals` tree - the Budget & Actuals
        # tab's Grand Total column looks values up here by name against the
        # rows it built from a normal unit's tree.
        "main_item_breakdown": consolidate_actuals(all_consolidated_for_breakdown)
    })

    return final_results


@guest_api
def get_unit_wise_plan_budget(financial_year, month, table_name_filter=None):

    def safe_join(arr):
        return ",".join([str(x).strip() for x in (arr or []) if x])

    # ---------------- TOTAL CALCULATIONS ----------------

    def calculate_totals(actuals):

        for head in actuals:
            total_ytd = 0

            if head.get("sub_heads"):

                for sub in head.get("sub_heads", []):
                    sub_ytd = 0

                    for item in sub.get("items", []):
                        sub_ytd += item.get("ytd", 0) or 0

                    sub["ytd"] = round(sub_ytd, 2)
                    total_ytd += sub_ytd

                head["sub_heads"] = sorted(
                    head.get("sub_heads", []),
                    key=lambda x: x.get("sequence_id", 0)
                )

            else:
                for item in head.get("items", []):
                    total_ytd += item.get("ytd", 0) or 0

                head["items"] = sorted(
                    head.get("items", []),
                    key=lambda x: x.get("sequence_id", 0)
                )

            head["ytd"] = round(total_ytd, 2)

        return sorted(
            actuals,
            key=lambda x: x.get("sequence_id", 0)
        )

    def calculate_grand_total(actuals):

        grand_ytd = 0

        for head in actuals:
            grand_ytd += head.get("ytd", 0) or 0

        return {
            "grand_total_ytd": round(grand_ytd, 2)
        }

    # ---------------- CONSOLIDATION ----------------

    def consolidate_actuals(all_unit_actuals):

        head_map = {}

        for unit_data in all_unit_actuals:

            for head in unit_data:
                key = head["name"]

                if key not in head_map:
                    head_map[key] = {
                        "name": head["name"],
                        "sequence_id": head.get("sequence_id", 0),
                        "sub_heads": [],
                        "items": [],
                        "ytd": 0
                    }

                head_map[key]["ytd"] += head.get("ytd", 0)

                # ---------------- SUB HEADS ----------------

                if head.get("sub_heads"):

                    sub_map = {
                        s["name"]: s
                        for s in head_map[key]["sub_heads"]
                    }

                    for sub in head.get("sub_heads", []):

                        if sub["name"] not in sub_map:
                            new_sub = {
                                "name": sub["name"],
                                "sequence_id": sub.get("sequence_id", 0),
                                "items": [],
                                "ytd": 0
                            }

                            head_map[key]["sub_heads"].append(new_sub)
                            sub_map[sub["name"]] = new_sub

                        sub_map[sub["name"]]["ytd"] += sub.get("ytd", 0)

                        item_map = {
                            i["name"]: i
                            for i in sub_map[sub["name"]]["items"]
                        }

                        for item in sub.get("items", []):

                            if item["name"] not in item_map:
                                new_item = {
                                    "name": item["name"],
                                    "sequence_id": item.get("sequence_id", 0),
                                    "gl_code": item.get("gl_code"),
                                    "ytd": 0
                                }

                                sub_map[sub["name"]]["items"].append(new_item)
                                item_map[item["name"]] = new_item

                            item_map[item["name"]]["ytd"] += item.get("ytd", 0)

                        sub_map[sub["name"]]["items"] = sorted(
                            sub_map[sub["name"]]["items"],
                            key=lambda x: x.get("sequence_id", 0)
                        )

                    head_map[key]["sub_heads"] = sorted(
                        head_map[key]["sub_heads"],
                        key=lambda x: x.get("sequence_id", 0)
                    )

                # ---------------- DIRECT ITEMS ----------------

                else:
                    item_map = {
                        i["name"]: i
                        for i in head_map[key]["items"]
                    }

                    for item in head.get("items", []):

                        if item["name"] not in item_map:
                            new_item = {
                                "name": item["name"],
                                "sequence_id": item.get("sequence_id", 0),
                                "gl_code": item.get("gl_code"),
                                "ytd": 0
                            }

                            head_map[key]["items"].append(new_item)
                            item_map[item["name"]] = new_item

                        item_map[item["name"]]["ytd"] += item.get("ytd", 0)

                    head_map[key]["items"] = sorted(
                        head_map[key]["items"],
                        key=lambda x: x.get("sequence_id", 0)
                    )

        return sorted(
            list(head_map.values()),
            key=lambda x: x.get("sequence_id", 0)
        )

    # ---------------- MAIN ----------------

    previous_financial_year = get_previous_financial_year(financial_year)
    settings = get_combination_table_settings_1(table_name_filter)

    final_results = []

    overall_ytd = 0
    capex_total_ytd = 0
    opex_total_ytd = 0

    for s in settings:

        for combo in s.get("combination_settings", []):

            all_unit_actuals = []

            for gu in s.get("grouped_units", []):

                actuals = get_combined_actuals(
                    financial_year=financial_year,
                    month=month,
                    unit=gu.get("unit"),
                    cost_center=safe_join(gu.get("cost_centers")),
                    location_code=safe_join(gu.get("locations")),
                    erp_cost_center_value=safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=safe_join(gu.get("locations_erp"))
                )

                actuals = calculate_totals(actuals)
                all_unit_actuals.append(actuals)

            consolidated = consolidate_actuals(all_unit_actuals)
            totals = calculate_grand_total(consolidated)

            capex_local = 0
            opex_local = 0

            for head in consolidated:
                name = (head.get("name") or "").upper()

                if "CAPITAL" in name:
                    capex_local += head.get("ytd", 0)

                elif "OPERATING" in name:
                    opex_local += head.get("ytd", 0)

            if combo.get("is_this_sub_item") == 0:
                overall_ytd += totals["grand_total_ytd"]
                capex_total_ytd += capex_local
                opex_total_ytd += opex_local

            consolidated.append({
                "name": "GRAND TOTAL",
                "sequence_id": 9999,
                "sub_heads": [],
                "items": [],
                "ytd": totals["grand_total_ytd"]
            })

            final_results.append({
                "settings_doc": s.get("settings_doc"),
                "label": s.get("label"),
                "table_name": combo.get("table_name"),
                "sequence_id": combo.get("sequence_id"),
                "is_this_sub_item": combo.get("is_this_sub_item"),
                "actuals": consolidated
            })

    # ---------------- FINAL CONSOLIDATED TOTAL ----------------

    final_consolidated_actuals = consolidate_actuals(
        [
            result["actuals"][:-1]   # remove GRAND TOTAL row
            for result in final_results
            if result.get("label") != "CONSOLIDATED TOTAL"
            and result.get("is_this_sub_item") == 0
        ]
    )

    final_consolidated_totals = calculate_grand_total(
        final_consolidated_actuals
    )

    final_results.append({
        "settings_doc": "CONSOLIDATED",
        "label": "CONSOLIDATED TOTAL",
        "table_name": "CONSOLIDATED",
        "sequence_id": 9999,
        "is_this_sub_item": 0,
        "actuals": final_consolidated_actuals + [
            {
                "name": "CAPEX TOTAL",
                "sequence_id": 9997,
                "sub_heads": [],
                "items": [],
                "ytd": round(capex_total_ytd, 2)
            },
            {
                "name": "OPEX TOTAL",
                "sequence_id": 9998,
                "sub_heads": [],
                "items": [],
                "ytd": round(opex_total_ytd, 2)
            },
            {
                "name": "OVERALL GRAND TOTAL",
                "sequence_id": 9999,
                "sub_heads": [],
                "items": [],
                "ytd": round(
                    final_consolidated_totals["grand_total_ytd"], 2
                )
            }
        ]
    })

    return final_results



@guest_api
def get_foundation_overall(financial_year, month, table_name_filter=None):

    def safe_join(arr):
        return ",".join([str(x).strip() for x in (arr or []) if x])

    # ---------------- TOTAL CALCULATION (MATCH WORKING API) ----------------
    def calculate_totals(actuals):

        for head in actuals:

            total_ytd = 0
            total_actual = 0

            if head.get("sub_heads"):

                for sub in head.get("sub_heads", []):

                    sub_ytd = 0
                    sub_actual = 0

                    for item in sub.get("items", []):
                        sub_ytd += item.get("ytd", 0) or 0
                        sub_actual += item.get("total_posted_amt", 0) or 0

                    sub["ytd"] = round(sub_ytd, 2)
                    sub["total_posted_amt_ytd"] = round(sub_actual, 2)

                    total_ytd += sub_ytd
                    total_actual += sub_actual

            else:
                for item in head.get("items", []):
                    total_ytd += item.get("ytd", 0) or 0
                    total_actual += item.get("total_posted_amt", 0) or 0

            head["ytd"] = round(total_ytd, 2)
            head["total_posted_amt_ytd"] = round(total_actual, 2)

        return actuals

    # ---------------- CONSOLIDATION ----------------
    def consolidate_actuals(all_unit_actuals):

        head_map = {}

        for unit_data in all_unit_actuals:

            for head in unit_data:

                key = head["name"]

                if key not in head_map:
                    head_map[key] = {
                        "name": head["name"],
                        "sequence_id": head["sequence_id"],
                        "sub_heads": [],
                        "items": [],
                        "ytd": 0,
                        "total_posted_amt_ytd": 0
                    }

                head_map[key]["ytd"] += head.get("ytd", 0)
                head_map[key]["total_posted_amt_ytd"] += head.get("total_posted_amt_ytd", 0)

        return list(head_map.values())

    # ---------------- GRAND TOTAL ----------------
    def calculate_grand_total(data):

        return {
            "name": "GRAND TOTAL",
            "sequence_id": 9999,
            "ytd": round(sum(d.get("ytd", 0) for d in data), 2),
            "total_posted_amt_ytd": round(sum(d.get("total_posted_amt_ytd", 0) for d in data), 2)
        }

    # ---------------- MAIN ----------------

    previous_financial_year = get_previous_financial_year(financial_year)
    settings = get_combination_table_settings_1(table_name_filter)

    formatted = get_accounting_period_from_month(month, previous_financial_year)

    grouped_actuals_data = get_grouped_actuals(
        fiscal_year=formatted.get("fiscal_year"),
        accounting_period=formatted.get("accounting_period")
    ).get("data", [])

    warn_on_overlapping_main_items(settings, grouped_actuals_data, table_name_filter)

    final_results = []

    for s in settings:

        for combo in s.get("combination_settings", []):

            current_all = []
            previous_all = []

            for gu in s.get("grouped_units", []):

                # CURRENT FY
                current_actuals = get_combined_actuals(
                    financial_year=financial_year,
                    month=month,
                    unit=gu.get("unit"),
                    cost_center=safe_join(gu.get("cost_centers")),
                    location_code=safe_join(gu.get("locations")),
                    erp_cost_center_value=safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=safe_join(gu.get("locations_erp")),
                    grouped_actuals_data=grouped_actuals_data
                )

                # PREVIOUS FY
                previous_actuals = get_combined_actuals(
                    financial_year=previous_financial_year,
                    month=month,
                    unit=gu.get("unit"),
                    cost_center=safe_join(gu.get("cost_centers")),
                    location_code=safe_join(gu.get("locations")),
                    erp_cost_center_value=safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=safe_join(gu.get("locations_erp")),
                    grouped_actuals_data=grouped_actuals_data
                )

                # ✅ CRITICAL FIX: calculate totals BEFORE consolidation
                current_actuals = calculate_totals(current_actuals)
                previous_actuals = calculate_totals(previous_actuals)

                current_all.append(current_actuals)
                previous_all.append(previous_actuals)

            # ✅ CONSOLIDATE AFTER totals
            current_final = consolidate_actuals(current_all)
            previous_final = consolidate_actuals(previous_all)

            # ✅ GRAND TOTAL
            current_final.append(calculate_grand_total(current_final))
            previous_final.append(calculate_grand_total(previous_final))

            final_results.append({
                "settings_doc": s.get("settings_doc"),
                "label": s.get("label"),
                "table_name": combo.get("table_name"),
                "sequence_id": combo.get("sequence_id"),
                "is_this_sub_item": combo.get("is_this_sub_item"),
                "current_year": current_final,
                "previous_year": previous_final
            })

    return final_results


@guest_api
def get_headcount(financial_year=None, month=None, table_name_filter=None,is_previous=int):
    try:
        filters = {}

        # ✅ Financial Year Filter Logic
        if financial_year:
            fy_list = frappe.get_all(
                "Financial Year List",
                fields=["name"],
                order_by="creation desc"
            )

            fy_names_all = [fy["name"] for fy in fy_list]

            if financial_year in fy_names_all:
                index = fy_names_all.index(financial_year)
                fy_names = fy_names_all[index:index+3]
            else:
                fy_names = [financial_year]

            filters["financial_year"] = ["in", fy_names]

        # ✅ Fetch Headcount Docs
        docs = frappe.get_all(
            "Headcount",
            filters=filters,
            fields=["name", "financial_year", "total_head_count"],
            order_by="creation desc"
        )

        # ✅ Fetch Units for each Headcount
        for doc in docs:
            units = frappe.get_all(
                "Headcount Operating Units",
                filters={
                    "parent": doc["name"],
                    "parenttype": "Headcount"
                },
                fields=["unit", "total_headcount", "unit_description"]
            )

            doc["units"] = units

        # ✅ Call Plan Function (Direct Response)
        plan_data = []
        if financial_year and month:
            plan_data = get_unit_wise_plan(
                financial_year,
                month,
                table_name_filter,
                is_previous
            )

        # ✅ Final Response (NO merging)
        return {
            "status": "success",
            "headcount_data": docs,
            "plan_data": plan_data
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Headcount API Error")
        return {
            "status": "error",
            "message": str(e)
        }
    



@guest_api
def get_reports_table_settings():

    results = []

    # ✅ GET ALL TABLE NAMES
    all_table_names = frappe.get_all(
        "Table Name",
        fields=["name"]
    )

    table_name_list = [
        t.name.strip().lower()
        for t in all_table_names if t.name
    ]

    # ✅ FETCH SETTINGS
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

        # -------- GROUPING --------
        unit_map = {}

        # -------- UNITS --------
        for d in doc.select_units:
            if not d.unit:
                continue

            unit_map.setdefault(d.unit, {
                "unit": d.unit,
                "cost_centers": [],
                "cost_centers_erp": [],
                "locations": [],
                "locations_erp": []
            })

        # -------- COST CENTERS --------
        for d in doc.select_cost_centers:
            if not d.unit:
                continue

            unit_map.setdefault(d.unit, {
                "unit": d.unit,
                "cost_centers": [],
                "cost_centers_erp": [],
                "locations": [],
                "locations_erp": []
            })

            ref = (d.reference_for or "Both").strip().lower()

            is_budget = ref in ("budget", "both")
            is_actual = ref in ("actual", "both")

            if is_budget and d.cost_center:
                unit_map[d.unit]["cost_centers"].append(d.cost_center)

            if is_actual and d.cost_center_erp:
                unit_map[d.unit]["cost_centers_erp"].append(d.cost_center_erp)

        # -------- LOCATIONS --------
        for d in doc.select_location_codes:
            if not d.unit:
                continue

            unit_map.setdefault(d.unit, {
                "unit": d.unit,
                "cost_centers": [],
                "cost_centers_erp": [],
                "locations": [],
                "locations_erp": []
            })

            ref = (d.reference_for or "Both").strip().lower()

            is_budget = ref in ("budget", "both")
            is_actual = ref in ("actual", "both")

            if is_budget and d.location_code:
                unit_map[d.unit]["locations"].append(d.location_code)

            if is_actual and d.location_code_erp:
                unit_map[d.unit]["locations_erp"].append(d.location_code_erp)

        # -------- REMOVE DUPLICATES --------
        for unit in unit_map.values():
            unit["cost_centers"] = list(set(unit["cost_centers"]))
            unit["cost_centers_erp"] = list(set(unit["cost_centers_erp"]))
            unit["locations"] = list(set(unit["locations"]))
            unit["locations_erp"] = list(set(unit["locations_erp"]))

        grouped_units = list(unit_map.values())

        # -------- COMBINATION SETTINGS --------

        sequence_map = {
            (row.table_name or "").strip().lower(): {
                "sequence_id": row.sequence_id,
                "is_this_sub_item": 1 if row.is_this_sub_item else 0
            }
            for row in doc.combination_table_settings
        }

        combination_settings = {}

        for tbl in table_name_list:

            is_selected = 1 if tbl in sequence_map else 0

            combination_settings[tbl] = {
                "selected": is_selected,
                "sequence_id": sequence_map.get(tbl, {}).get("sequence_id"),
                "is_this_sub_item": sequence_map.get(tbl, {}).get("is_this_sub_item", 0)
            }

        # -------- FINAL RESULT --------
        results.append({
            "settings_doc": doc.name,
            "label": doc.number_card_title,
            "grouped_units": grouped_units,
            "combination_settings": combination_settings
        })

    return results

@guest_api
def get_monthly_mis_break_up(financial_year, month, table_name_filter=None, is_previous=None):

    def safe_join(arr):
        return ",".join([str(x).strip() for x in (arr or []) if x])

    # ── TOTAL CALCULATIONS ────────────────────────────────────────────────────
    def calculate_totals(actuals):
        for head in actuals:
            total_ytd = 0
            total_actual = 0
            if head.get("sub_heads"):
                for sub in head.get("sub_heads", []):
                    sub_ytd = 0
                    sub_actual = 0
                    for item in sub.get("items", []):
                        sub_ytd    += item.get("ytd", 0) or 0
                        sub_actual += item.get("total_posted_amt", 0) or 0
                    sub["ytd"] = round(sub_ytd, 2)
                    sub["total_posted_amt_ytd"] = round(sub_actual, 2)
                    total_ytd    += sub_ytd
                    total_actual += sub_actual
            else:
                for item in head.get("items", []):
                    total_ytd    += item.get("ytd", 0) or 0
                    total_actual += item.get("total_posted_amt", 0) or 0
            head["ytd"] = round(total_ytd, 2)
            head["total_posted_amt_ytd"] = round(total_actual, 2)
        return actuals

    def calculate_grand_total(actuals):
        grand_ytd = 0
        grand_actual = 0
        for head in actuals:
            grand_ytd    += head.get("ytd", 0) or 0
            grand_actual += head.get("total_posted_amt_ytd", 0) or 0
        return {
            "grand_total_ytd":    round(grand_ytd, 2),
            "grand_total_actual": round(grand_actual, 2)
        }

    # ── CONSOLIDATION ─────────────────────────────────────────────────────────
    def consolidate_actuals(all_unit_actuals):
        head_map = {}
        for unit_data in all_unit_actuals:
            for head in unit_data:
                key = head["name"]
                if key not in head_map:
                    head_map[key] = {
                        "name":                head["name"],
                        "sequence_id":         head["sequence_id"],
                        "sub_heads":           [],
                        "items":               [],
                        "ytd":                 0,
                        "total_posted_amt_ytd": 0
                    }
                head_map[key]["ytd"]                  += head.get("ytd", 0)
                head_map[key]["total_posted_amt_ytd"] += head.get("total_posted_amt_ytd", 0)

                if head.get("sub_heads"):
                    sub_map = {s["name"]: s for s in head_map[key]["sub_heads"]}
                    for sub in head.get("sub_heads", []):
                        if sub["name"] not in sub_map:
                            new_sub = {
                                "name":                sub["name"],
                                "sequence_id":         sub["sequence_id"],
                                "items":               [],
                                "ytd":                 0,
                                "total_posted_amt_ytd": 0
                            }
                            head_map[key]["sub_heads"].append(new_sub)
                            sub_map[sub["name"]] = new_sub
                        sub_map[sub["name"]]["ytd"]                  += sub.get("ytd", 0)
                        sub_map[sub["name"]]["total_posted_amt_ytd"] += sub.get("total_posted_amt_ytd", 0)
                        item_map = {i["name"]: i for i in sub_map[sub["name"]]["items"]}
                        for item in sub.get("items", []):
                            if item["name"] not in item_map:
                                new_item = {
                                    "name":             item["name"],
                                    "sequence_id":      item["sequence_id"],
                                    "gl_code":          item.get("gl_code"),
                                    "ytd":              0,
                                    "total_posted_amt": 0
                                }
                                sub_map[sub["name"]]["items"].append(new_item)
                                item_map[item["name"]] = new_item
                            item_map[item["name"]]["ytd"]              += item.get("ytd", 0)
                            item_map[item["name"]]["total_posted_amt"] += item.get("total_posted_amt", 0)
                else:
                    item_map = {i["name"]: i for i in head_map[key]["items"]}
                    for item in head.get("items", []):
                        if item["name"] not in item_map:
                            new_item = {
                                "name":             item["name"],
                                "sequence_id":      item["sequence_id"],
                                "gl_code":          item.get("gl_code"),
                                "ytd":              0,
                                "total_posted_amt": 0
                            }
                            head_map[key]["items"].append(new_item)
                            item_map[item["name"]] = new_item
                        item_map[item["name"]]["ytd"]              += item.get("ytd", 0)
                        item_map[item["name"]]["total_posted_amt"] += item.get("total_posted_amt", 0)

        return list(head_map.values())

    # ── MAIN ─────────────────────────────────────────────────────────────────
    if is_previous == 1:
        financial_year = get_previous_financial_year(financial_year)

    # ── Call get_combination_table_settings_test() ONCE ──────────────────────
    # Response: { "Unit Wise Plan": [ {...}, ... ], "Opex Capex": [ {...}, ... ] }
    # Each entry has combination_settings as a SINGLE DICT:
    #   { table_name, sequence_id, is_this_sub_item }
    raw_settings = get_combination_table_settings_test(table_name_filter)

    # ── Call get_grouped_actuals() ONCE ───────────────────────────────────────
    formatted = get_accounting_period_from_month(month, financial_year)
    grouped_actuals_data = get_grouped_actuals(
        fiscal_year=formatted.get("fiscal_year"),
        accounting_period=formatted.get("accounting_period")
    ).get("data", [])

    # ── Build result dict grouped by table_name (mirrors input structure) ─────
    # Output: { "Unit Wise Plan": [ entry, ... ], "Opex Capex": [ entry, ... ] }
    result = {}

    if not isinstance(raw_settings, dict):
        return result

    for table_name, entries in raw_settings.items():

        result[table_name] = []

        # Per-table consolidated totals
        overall_ytd        = 0
        overall_actual     = 0
        capex_total_ytd    = 0
        capex_total_actual = 0
        opex_total_ytd     = 0
        opex_total_actual  = 0

        for entry in entries:

            combo     = entry.get("combination_settings", {})
            seq_id    = combo.get("sequence_id", 0)
            is_sub    = combo.get("is_this_sub_item", 0)

            all_unit_actuals = []

            for gu in entry.get("grouped_units", []):
                actuals = get_combined_actuals(
                    financial_year=financial_year,
                    month=month,
                    unit=gu.get("unit"),
                    cost_center=safe_join(gu.get("cost_centers")),
                    location_code=safe_join(gu.get("locations")),
                    erp_cost_center_value=safe_join(gu.get("cost_centers_erp")),
                    erp_loc_value=safe_join(gu.get("locations_erp")),
                    grouped_actuals_data=grouped_actuals_data   # ← passed in, not re-fetched
                )
                actuals = calculate_totals(actuals)
                all_unit_actuals.append(actuals)

            consolidated = consolidate_actuals(all_unit_actuals)
            totals        = calculate_grand_total(consolidated)

            # Accumulate per-table totals (top-level units only)
            if is_sub == 0:
                overall_ytd    += totals["grand_total_ytd"]
                overall_actual += totals["grand_total_actual"]
                for head in consolidated:
                    name = (head.get("name") or "").upper()
                    if "CAPITAL" in name:
                        capex_total_ytd    += head.get("ytd", 0)
                        capex_total_actual += head.get("total_posted_amt_ytd", 0)
                    elif "OPERATING" in name:
                        opex_total_ytd     += head.get("ytd", 0)
                        opex_total_actual  += head.get("total_posted_amt_ytd", 0)

            # Append GRAND TOTAL row to this entry's actuals
            consolidated.append({
                "name":                "GRAND TOTAL",
                "sequence_id":         9999,
                "sub_heads":           [],
                "items":               [],
                "ytd":                 totals["grand_total_ytd"],
                "total_posted_amt_ytd": totals["grand_total_actual"]
            })

            # ── Output entry shape matches the sample response exactly ────────
            result[table_name].append({
                "settings_doc":     entry.get("settings_doc"),
                "label":            entry.get("label"),
                "table_name":       table_name,
                "sequence_id":      seq_id,
                "is_this_sub_item": is_sub,
                "actuals":          consolidated
            })

        # ── Append CONSOLIDATED TOTAL entry at end of each table group ────────
        result[table_name].append({
            "settings_doc":     "CONSOLIDATED",
            "label":            "CONSOLIDATED TOTAL",
            "table_name":       table_name,
            "sequence_id":      9999,
            "is_this_sub_item": 0,
            "actuals": [
                {
                    "name":                "CAPEX TOTAL",
                    "ytd":                 round(capex_total_ytd, 2),
                    "total_posted_amt_ytd": round(capex_total_actual, 2)
                },
                {
                    "name":                "OPEX TOTAL",
                    "ytd":                 round(opex_total_ytd, 2),
                    "total_posted_amt_ytd": round(opex_total_actual, 2)
                },
                {
                    "name":                "OVERALL GRAND TOTAL",
                    "ytd":                 round(overall_ytd, 2),
                    "total_posted_amt_ytd": round(overall_actual, 2)
                }
            ]
        })

    return result


