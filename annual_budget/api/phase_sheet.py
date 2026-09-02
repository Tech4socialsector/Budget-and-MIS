from annual_budget.utils import guest_api, get_allowed_units, require_unit_access
import frappe
import re
from decimal import Decimal
from annual_budget.api.actual_format import get_filtered_actuals, sum_of_actuals_by_sequence
from annual_budget.api.response_crypto import is_direct_http_call


@guest_api
def get_consolidated_report(financial_year=None, units=None, cost_center=None, location_code=None, template_name="Budget Templat Master"):

    if not financial_year:
        frappe.throw("Financial Year is required")

    if not template_name:
        frappe.throw("Template Name is required")

    # Only scope on a genuine direct HTTP call — internal callers pass
    # units=None intentionally to get an already-scoped, admin-configured
    # result and must not be narrowed by the current session user.
    if is_direct_http_call(get_consolidated_report):
        if units:
            require_unit_access(units)
        else:
            allowed_units = get_allowed_units()
            if allowed_units is not None:
                if not allowed_units:
                    return []
                units = ",".join(sorted(allowed_units))

    import re
    from decimal import Decimal

    def _num(x):
        if x is None:
            return 0.0
        try:
            return float(Decimal(str(x)))
        except Exception:
            return 0.0

    # ------------------------------------------------------------
    # FETCH TEMPLATE
    # ------------------------------------------------------------
    template_doc = frappe.get_doc(
        "Import Templates",
        {"template_name": template_name}
    )

    sequence_map = {}
    expense_sub_map = {}
    expense_head_map = {}
    allowed_expenses = set()

    for item in template_doc.import_template_item_list:
        expense_id = item.type_of_expense_id

        if not expense_id:
            continue

        sequence_map[expense_id] = int(item.sequence_id or 9999)
        expense_sub_map[expense_id] = (item.sub_head_of_expense or "").strip()
        expense_head_map[expense_id] = (item.head_of_expense or "").strip()
        allowed_expenses.add(expense_id)

    # ------------------------------------------------------------
    # FILTERS
    # ------------------------------------------------------------
    filters = {"financial_year": financial_year}

    if units:
        filters["set_id"] = ["in", [u.strip() for u in units.split(",") if u.strip()]]

    if cost_center:
        filters["cost_center"] = ["in", [c.strip() for c in cost_center.split(",") if c.strip()]]

    if location_code:
        filters["location_code"] = ["in", [l.strip() for l in location_code.split(",") if l.strip()]]

    parents = frappe.get_all("Finance Budget", filters=filters, fields=["name"])
    parent_names = [p.name for p in parents] if parents else []

    rows = []
    if parent_names:
        rows = frappe.get_all(
            "Finance Budget Amounts",
            filters={"parent": ["in", parent_names]},
            fields=[
                "type_of_expense_id",
                "type_of_expense",
                "april", "may", "june",
                "july", "august", "september",
                "october", "november", "december",
                "january", "february", "march"
            ]
        )

    # ------------------------------------------------------------
    # PRE-BUILD FROM TEMPLATE (IMPORTANT)
    # ------------------------------------------------------------
    TOP_LEVEL_HEADS = [
        "CAPITAL EXPENSES",
        "OPERATING EXPENSES",
        "COVID SUPPORT"
    ]

    heads = {}

    for item in template_doc.import_template_item_list:

        expense_id = item.type_of_expense_id
        if not expense_id:
            continue

        item_label = item.type_of_expense
        original_head = (item.head_of_expense or "").strip()
        original_sub = (item.sub_head_of_expense or "").strip()

        raw_head = re.sub(r"\s+", " ", original_head).strip().upper()
        sub = re.sub(r"\s+", " ", original_sub).strip().upper()

        if raw_head not in TOP_LEVEL_HEADS:
            parent_head = "OPERATING EXPENSES"
            sub = raw_head
            original_sub = original_head
        else:
            parent_head = raw_head

        if parent_head not in heads:
            heads[parent_head] = {
                "name": parent_head,
                "sequence_id": 0,
                "q1": [0, 0, 0],
                "q2": [0, 0, 0],
                "q3": [0, 0, 0],
                "q4": [0, 0, 0],
                "items": {},
                "sub_heads": {}
            }

        # CAPITAL / COVID
        if parent_head in ["CAPITAL EXPENSES", "COVID SUPPORT"]:

            heads[parent_head]["items"][expense_id] = {
                "name": item_label,
                "sequence_id": sequence_map.get(expense_id, 9999),
                "gl_code": "",
                "head_of_expense": original_head,
                "sub_head_of_expense": original_sub,
                "q1": [0, 0, 0],
                "q2": [0, 0, 0],
                "q3": [0, 0, 0],
                "q4": [0, 0, 0]
            }

        else:
            if sub not in heads[parent_head]["sub_heads"]:
                heads[parent_head]["sub_heads"][sub] = {
                    "name": original_sub,
                    "sequence_id": 0,
                    "q1": [0, 0, 0],
                    "q2": [0, 0, 0],
                    "q3": [0, 0, 0],
                    "q4": [0, 0, 0],
                    "items": {}
                }

            heads[parent_head]["sub_heads"][sub]["items"][expense_id] = {
                "name": item_label,
                "sequence_id": sequence_map.get(expense_id, 9999),
                "gl_code": "",
                "head_of_expense": original_head,
                "sub_head_of_expense": original_sub,
                "q1": [0, 0, 0],
                "q2": [0, 0, 0],
                "q3": [0, 0, 0],
                "q4": [0, 0, 0]
            }

    # ------------------------------------------------------------
    # MERGE ACTUAL VALUES
    # ------------------------------------------------------------
    for r in rows:

        expense_id = r.type_of_expense_id
        if expense_id not in allowed_expenses:
            continue

        original_head = (expense_head_map.get(expense_id) or "").strip()
        original_sub = (expense_sub_map.get(expense_id) or "").strip()

        raw_head = re.sub(r"\s+", " ", original_head).strip().upper()
        sub = re.sub(r"\s+", " ", original_sub).strip().upper()

        if raw_head not in TOP_LEVEL_HEADS:
            parent_head = "OPERATING EXPENSES"
            sub = raw_head
        else:
            parent_head = raw_head

        q1 = [_num(r.april), _num(r.may), _num(r.june)]
        q2 = [_num(r.july), _num(r.august), _num(r.september)]
        q3 = [_num(r.october), _num(r.november), _num(r.december)]
        q4 = [_num(r.january), _num(r.february), _num(r.march)]

        # Head totals
        for i in range(3):
            heads[parent_head]["q1"][i] += q1[i]
            heads[parent_head]["q2"][i] += q2[i]
            heads[parent_head]["q3"][i] += q3[i]
            heads[parent_head]["q4"][i] += q4[i]

        if parent_head in ["CAPITAL EXPENSES", "COVID SUPPORT"]:
            item = heads[parent_head]["items"].get(expense_id)

        else:
            item = heads[parent_head]["sub_heads"][sub]["items"].get(expense_id)

            for i in range(3):
                heads[parent_head]["sub_heads"][sub]["q1"][i] += q1[i]
                heads[parent_head]["sub_heads"][sub]["q2"][i] += q2[i]
                heads[parent_head]["sub_heads"][sub]["q3"][i] += q3[i]
                heads[parent_head]["sub_heads"][sub]["q4"][i] += q4[i]

        if not item:
            continue

        for i in range(3):
            item["q1"][i] += q1[i]
            item["q2"][i] += q2[i]
            item["q3"][i] += q3[i]
            item["q4"][i] += q4[i]

    # ------------------------------------------------------------
    # FINAL SORTING
    # ------------------------------------------------------------
    final = []

    for head in heads.values():

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

            if sub["items"]:
                sub["sequence_id"] = min(
                    item["sequence_id"] for item in sub["items"]
                )
            else:
                sub["sequence_id"] = 9999

            sorted_subs.append(sub)

        head["sub_heads"] = sorted(
            sorted_subs,
            key=lambda x: x["sequence_id"]
        )

        final.append(head)

    return final

@guest_api
def get_consolidated_report_actual_ytd(
    financial_year=None,
    units=None,
    cost_center=None,
    location_code=None,
    month=None
):

    if not financial_year:
        frappe.throw("Financial Year is required")

    if not month:
        frappe.throw("Month is required")

    # Only scope on a genuine direct HTTP call — internal callers pass
    # units=None intentionally to get an already-scoped, admin-configured
    # result and must not be narrowed by the current session user.
    if is_direct_http_call(get_consolidated_report_actual_ytd):
        if units:
            require_unit_access(units)
        else:
            allowed_units = get_allowed_units()
            if allowed_units is not None:
                if not allowed_units:
                    return []
                units = ",".join(sorted(allowed_units))

    # ---------------------------------------------------
    # Safe Numeric Conversion
    # ---------------------------------------------------
    def _num(x):
        if x is None:
            return 0.0
        try:
            return float(Decimal(str(x)))
        except Exception:
            return 0.0

    # ---------------------------------------------------
    # Normalization Helper (CRITICAL FIX)
    # ---------------------------------------------------
    def normalize(val):
        return re.sub(r"\s+", " ", str(val or "")).strip().upper()

    # ---------------------------------------------------
    # Financial Year Month Order (April → March)
    # ---------------------------------------------------
    MONTHS = [
        "april", "may", "june",
        "july", "august", "september",
        "october", "november", "december",
        "january", "february", "march"
    ]

    month = month.lower().strip()

    if month not in MONTHS:
        frappe.throw("Invalid month")

    end_index = MONTHS.index(month)

    # ---------------------------------------------------
    # Load Sequence Mapping
    # ---------------------------------------------------
    expense_rows = frappe.db.get_all(
        "Expenses",
        fields=[
            "head_of_expense",
            "sub_head_of_expense",
            "type_of_expense",
            "sequence_id"
        ]
    )

    sequence_map = {}

    for e in expense_rows:
        seq = int(e.sequence_id) if e.sequence_id else 9999

        for field in [
            e.head_of_expense,
            e.sub_head_of_expense,
            e.type_of_expense
        ]:
            key = normalize(field)
            if key:
                sequence_map[key] = seq

    # ---------------------------------------------------
    # Filters
    # ---------------------------------------------------
    filters = {"financial_year": financial_year}

    if units:
        filters["set_id"] = ["in", [u.strip() for u in units.split(",")]]

    if cost_center:
        filters["cost_center"] = ["in", [c.strip() for c in cost_center.split(",")]]

    if location_code:
        filters["location_code"] = ["in", [l.strip() for l in location_code.split(",")]]

    parents = frappe.get_all(
        "Finance Budget",
        filters=filters,
        fields=["name"]
    )

    if not parents:
        return []

    parent_names = [p.name for p in parents]

    rows = frappe.get_all(
        "Finance Budget Amounts",
        filters={"parent": ["in", parent_names]},
        fields=[
            "type_of_expense_id",
            "type_of_expense",
            "head_of_expense",
            "sub_head_of_expense",
            "april", "may", "june",
            "july", "august", "september",
            "october", "november", "december",
            "january", "february", "march"
        ]
    )

    if not rows:
        return []

    expense_gl_lookup = {
        e.name: e.gl_code
        for e in frappe.get_all("Expenses", fields=["name", "gl_code"])
    }

    # ---------------------------------------------------
    # Grouping Structure
    # ---------------------------------------------------
    TOP_LEVEL_HEADS = ["CAPITAL EXPENSES", "OPERATING EXPENSES"]
    heads = {}

    for r in rows:

        raw_head = normalize(r.get("head_of_expense"))
        sub_head = normalize(r.get("sub_head_of_expense"))
        item_name = str(r.get("type_of_expense") or "UNKNOWN ITEM").strip()
        item_key = normalize(item_name)
        gl = str(expense_gl_lookup.get(r.get("type_of_expense_id")) or "").strip()

        # YTD Calculation (FIXED SAFE VERSION)
        ytd_total = sum(_num(r.get(m)) for m in MONTHS[:end_index + 1])

        if ytd_total == 0:
            continue

        # Determine Parent Head
        if raw_head in TOP_LEVEL_HEADS:
            parent_head = raw_head
        else:
            parent_head = "OPERATING EXPENSES"
            if not sub_head:
                sub_head = raw_head

        # Initialize Head
        if parent_head not in heads:
            heads[parent_head] = {
                "name": parent_head,
                "sequence_id": sequence_map.get(parent_head, 9999),
                "ytd": 0.0,
                "sub_heads": {}
            }

        # Initialize Sub-head
        if sub_head not in heads[parent_head]["sub_heads"]:
            heads[parent_head]["sub_heads"][sub_head] = {
                "name": sub_head,
                "sequence_id": sequence_map.get(sub_head, 9999),
                "ytd": 0.0,
                "items": {}
            }

        sub_container = heads[parent_head]["sub_heads"][sub_head]

        # Use item + GL as unique key (FIXED GL ISSUE)
        item_unique_key = f"{item_key}||{gl}"

        if item_unique_key not in sub_container["items"]:
            sub_container["items"][item_unique_key] = {
                "name": item_name,
                "sequence_id": sequence_map.get(item_key, 9999),
                "gl_code": gl,
                "ytd": 0.0
            }

        sub_container["items"][item_unique_key]["ytd"] += ytd_total

    # ---------------------------------------------------
    # Final Aggregation (NO DOUBLE COUNTING)
    # ---------------------------------------------------
    final = []

    for head in heads.values():

        head_total = 0.0
        sorted_subs = []

        for sub in head["sub_heads"].values():

            sub_total = 0.0

            items_sorted = sorted(
                sub["items"].values(),
                key=lambda x: x["sequence_id"]
            )

            for item in items_sorted:
                sub_total += item["ytd"]

            sub["ytd"] = sub_total
            sub["items"] = items_sorted

            head_total += sub_total
            sorted_subs.append(sub)

        head["ytd"] = head_total

        head["sub_heads"] = sorted(
            sorted_subs,
            key=lambda x: x["sequence_id"]
        )

        final.append(head)

    final = sorted(final, key=lambda x: x["sequence_id"])

    return final


@guest_api
def get_combined_actuals(
    financial_year=None,
    month=None,
    unit=None,
    cost_center=None,
    location_code=None,
    erp_loc_value=None,
    erp_cost_center_value=None
):
    from decimal import Decimal, ROUND_HALF_UP

    def to_decimal(value):
        try:
            return Decimal(str(value or 0))
        except Exception:
            return Decimal("0")

    def to_float(value):
        return float(value.quantize(Decimal("0.01"), ROUND_HALF_UP))

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

        # Move some heads under OPERATING
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

        # Heads with only items (no sub-heads)
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

    # --------------------------------------------------
    # 2️⃣ Convert Dict → Ordered List
    # --------------------------------------------------

    structure = []

    for head in sorted(heads.values(), key=lambda x: x["sequence_id"]):

        head["sub_heads"] = sorted(
            head["sub_heads"].values(),
            key=lambda x: x["sequence_id"]
        )

        structure.append(head)

    # --------------------------------------------------
    # 3️⃣ Budget Lookup
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
    # 4️⃣ Actual Lookup
    # --------------------------------------------------

    actual_lookup = {}

    actual_data = sum_of_actuals_by_sequence(
        month=month,
        financial_year=financial_year,
        unit=unit,
        cost_center=erp_cost_center_value,
        location_code=erp_loc_value
    )

    for row in (actual_data.get("data", []) if actual_data else []):
        key = (row.get("sequence_id"), row.get("type_of_expense"))
        actual_lookup[key] = to_decimal(row.get("total_posted_amt"))

    # --------------------------------------------------
    # 5️⃣ Inject Budget + Actual Totals
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
    # 6️⃣ Convert Decimal → Float
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
def get_number_card_totals(financial_year=None, set_group_id="3"):

    results = []

    # -----------------------------
    # 1. FILTER SETTINGS DOCUMENTS
    # -----------------------------
    filters = {}
    or_filters = []

    if set_group_id:
        if isinstance(set_group_id, str):
            group_ids = [x.strip() for x in set_group_id.split(",") if x.strip()]
        else:
            group_ids = set_group_id

        for gid in group_ids:
            or_filters.append(["set_group_id", "like", f"%{gid}%"])

    settings_docs = frappe.get_all(
        "Overview number cards settings",
        filters=filters,
        or_filters=or_filters,
        fields=["name", "number_card_title"],
        order_by="creation desc"
    )

    # -----------------------------
    # HELPER → MONTHLY SUM
    # -----------------------------
    def get_row_total(r):
        return (
            (r.april or 0) + (r.may or 0) + (r.june or 0) +
            (r.july or 0) + (r.august or 0) + (r.september or 0) +
            (r.october or 0) + (r.november or 0) + (r.december or 0) +
            (r.january or 0) + (r.february or 0) + (r.march or 0)
        )

    # -----------------------------
    # 2. LOOP EACH CARD
    # -----------------------------
    for setting in settings_docs:

        doc = frappe.get_doc(
            "Overview number cards settings",
            setting.name
        )

        units = [d.unit for d in doc.select_units if d.unit]
        cost_centers = [d.cost_center for d in doc.select_cost_centers if d.cost_center]
        locations = [d.location_code for d in doc.select_location_codes if d.location_code]

        label = doc.number_card_title

        if not units or not financial_year:
            results.append({
                "settings_doc": doc.name,
                "label": label,
                "total_budget": 0,
                "error": "unit and financial_year are mandatory"
            })
            continue

        # -----------------------------
        # 3. GET BUDGETS
        # -----------------------------
        budget_filters = {
            "docstatus": ["<", 2],
            "financial_year": financial_year,
            "set_id": ["in", units]
        }

        if cost_centers:
            budget_filters["cost_center"] = ["in", cost_centers]

        if locations:
            budget_filters["location_code"] = ["in", locations]

        budgets = frappe.get_all(
            "Finance Budget",
            filters=budget_filters,
            fields=["name"]
        )

        if not budgets:
            total = 0
        else:
            budget_names = [b.name for b in budgets]

            # -----------------------------
            # 4. GET CHILD ROWS
            # -----------------------------
            rows = frappe.get_all(
                "Finance Budget Amounts",
                filters={"parent": ["in", budget_names]},
                fields=[
                    "april", "may", "june",
                    "july", "august", "september",
                    "october", "november", "december",
                    "january", "february", "march"
                ]
            )

            # -----------------------------
            # 5. SUM MONTHLY (FIXED)
            # -----------------------------
            total = sum(get_row_total(r) for r in rows)

        results.append({
            "settings_doc": doc.name,
            "label": label,
            "total_budget": total
        })

    # -----------------------------
    # 6. GRAND TOTAL (NO SQL)
    # -----------------------------
    if financial_year:

        budgets = frappe.get_all(
            "Finance Budget",
            filters={
                "docstatus": ["<", 2],
                "financial_year": financial_year
            },
            fields=["name"]
        )

        if budgets:
            budget_names = [b.name for b in budgets]

            rows = frappe.get_all(
                "Finance Budget Amounts",
                filters={"parent": ["in", budget_names]},
                fields=[
                    "april", "may", "june",
                    "july", "august", "september",
                    "october", "november", "december",
                    "january", "february", "march"
                ]
            )

            grand_total = sum(get_row_total(r) for r in rows)
        else:
            grand_total = 0

    else:
        grand_total = 0

    # -----------------------------
    # 7. FINAL RESPONSE
    # -----------------------------
    return {
        "number_cards": results,
        "grand_total": grand_total
    }


# ! =======================================================  Consolidated report Line item wise Grouping YTD =============================================================================
def _num(x):
    """Safe numeric conversion"""
    if x is None:
        return 0.0
    try:
        return float(Decimal(str(x)))
    except Exception:
        return 0.0


MONTHS = [
    "april", "may", "june",
    "july", "august", "september",
    "october", "november", "december",
    "january", "february", "march"
]


def calc_ytd(row, till_month):
    """Calculate YTD till given month"""
    if not till_month:
        return 0.0

    till_month = till_month.lower().strip()

    if till_month not in MONTHS:
        frappe.throw("Invalid month for YTD")

    idx = MONTHS.index(till_month) + 1
    return sum(_num(getattr(row, m)) for m in MONTHS[:idx])

@guest_api
def get_consolidated_report_ytd(
    financial_year=None,
    units=None,
    cost_center=None,
    location_code=None,
    month=None
):
    if not financial_year:
        frappe.throw("Financial Year is required")

    if not month:
        frappe.throw("month month is required")
    filters = {"financial_year": financial_year}

    if units:
        filters["set_id"] = ["in", [u.strip() for u in units.split(",")]]

    if cost_center:
        filters["cost_center"] = ["in", [c.strip() for c in cost_center.split(",")]]

    if location_code:
        filters["location_code"] = ["in", [l.strip() for l in location_code.split(",")]]
    parents = frappe.db.get_all(
        "Finance Budget",
        filters=filters,
        pluck="name"
    )

    if not parents:
        return []
    idx = MONTHS.index(month.lower()) + 1
    month_fields = MONTHS[:idx]

    rows = frappe.db.get_all(
        "Finance Budget Amounts",
        filters={"parent": ["in", parents]},
        fields=[
            "type_of_expense_id",
            "type_of_expense",
            "head_of_expense",
            "sub_head_of_expense",
            *month_fields
        ]
    )
    expense_gl_lookup = {
        e.name: e.gl_code
        for e in frappe.get_all("Expenses", fields=["name", "gl_code"])
    }
    heads = {}

    for r in rows:

        head = re.sub(r"\s+", " ", (r.head_of_expense or "").strip()).upper()
        sub = re.sub(r"\s+", " ", (r.sub_head_of_expense or "").strip())
        item = (r.type_of_expense or "Unknown Item").strip()
        gl = (expense_gl_lookup.get(r.type_of_expense_id) or "").strip()

        ytd_val = calc_ytd(r, month)
        if head not in heads:
            heads[head] = {
                "name": head,
                "ytd": 0.0,
                "items": {},
                "sub_heads": {}
            }

        heads[head]["ytd"] += ytd_val
        if head == "OPERATING EXPENSES" and sub:

            if sub not in heads[head]["sub_heads"]:
                heads[head]["sub_heads"][sub] = {
                    "name": sub,
                    "ytd": 0.0,
                    "items": {}
                }

            heads[head]["sub_heads"][sub]["ytd"] += ytd_val

            key = (item, gl)

            if key not in heads[head]["sub_heads"][sub]["items"]:
                heads[head]["sub_heads"][sub]["items"][key] = {
                    "name": item,
                    "sub_head_of_expense": sub,
                    "gl_code": gl,
                    "ytd": 0.0
                }

            heads[head]["sub_heads"][sub]["items"][key]["ytd"] += ytd_val
        else:

            key = (item, gl)

            if key not in heads[head]["items"]:
                heads[head]["items"][key] = {
                    "name": item,
                    "sub_head_of_expense": sub or None,
                    "gl_code": gl,
                    "ytd": 0.0
                }

            heads[head]["items"][key]["ytd"] += ytd_val
    display_order = [
        "CAPITAL EXPENSES",
        "OPERATING EXPENSES",
        "OTHER OPERATING EXPENSES",
        "MEDICAL EXPENSES"
    ]
    final = []

    for h in display_order:
        if h not in heads:
            continue

        head_data = heads[h]

        head_data["items"] = sorted(
            head_data["items"].values(),
            key=lambda x: x.get("gl_code") or ""
        )

        subheads = []
        for s in head_data["sub_heads"].values():
            s["items"] = sorted(
                s["items"].values(),
                key=lambda x: x.get("gl_code") or ""
            )
            subheads.append(s)

        head_data["sub_heads"] = subheads

        final.append(head_data)

    return final


@guest_api
def get_number_card_settings(set_group_id=None):

    results = []

    def parse_list(value):
        if not value:
            return []
        return [v.strip() for v in str(value).split(",") if v.strip()]

    set_group_ids = parse_list(set_group_id)

    or_filters = []

    if set_group_ids:
        for gid in set_group_ids:
            or_filters.extend([
                ["set_group_id", "=", gid],
                ["set_group_id", "like", f"{gid},%"],
                ["set_group_id", "like", f"%,{gid},%"],
                ["set_group_id", "like", f"%,{gid}"]
            ])

    if or_filters:
        settings_docs = frappe.get_all(
            "Overview number cards settings",
            or_filters=or_filters,
            fields=["name", "number_card_title", "set_group_id"],
            order_by="creation desc"
        )
    else:
        settings_docs = frappe.get_all(
            "Overview number cards settings",
            fields=["name", "number_card_title", "set_group_id"],
            order_by="creation desc"
        )

    for setting in settings_docs:

        doc = frappe.get_doc(
            "Overview number cards settings",
            setting.name
        )

        units = [d.unit for d in doc.select_units]
        cost_centers = [d.cost_center for d in doc.select_cost_centers]
        cost_centers_erp = [d.cost_center_erp for d in doc.select_cost_centers]
        locations = [d.location_code for d in doc.select_location_codes]
        locations_erp = [d.location_code_erp for d in doc.select_location_codes]

        results.append({
            "settings_doc": doc.name,
            "set_group_id": doc.set_group_id,  # ✅ included
            "label": doc.number_card_title,
            "units": units,
            "cost_centers": cost_centers,
            "cost_centers_erp": cost_centers_erp,
            "locations": locations,
            "locations_erp": locations_erp
        })

    return results


@guest_api
def format_api(financial_year=None, month=None):

    settings = get_number_card_settings()

    final_results = []

    for s in settings:

        units = ",".join(s["units"]) if s["units"] else ""
        cost_centers = ",".join(s["cost_centers"]) if s["cost_centers"] else ""
        locations = ",".join(s["locations"]) if s["locations"] else ""
        cost_centers_erp = ",".join(s["cost_centers_erp"]) if s["cost_centers_erp"] else ""
        locations_erp = ",".join(s["locations_erp"]) if s["locations_erp"] else ""

        # call consolidated report
        report_data = get_consolidated_report(
            financial_year=financial_year,
            units=units,
            cost_center=cost_centers,
            location_code=locations
        )

        # call actuals method
        actuals_data = get_combined_actuals(
            financial_year=financial_year,
            month=month,
            unit=units,
            cost_center=cost_centers,
            location_code=locations,
            erp_cost_center_value=cost_centers_erp,
            erp_loc_value=locations_erp
        )

        final_results.append({
            "settings_doc": s["settings_doc"],
            "label": s["label"],
            "units": units,
            "cost_centers": cost_centers,
            "locations": locations,
            "cost_centers_erp": cost_centers_erp,
            "locations_erp": locations_erp,
            "report": report_data,
            "actuals": actuals_data
        })

    return final_results