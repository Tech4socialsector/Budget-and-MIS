from budget_mis.utils import guest_api, get_allowed_units, require_unit_access
import frappe
import re
from budget_mis.api.response_crypto import is_direct_http_call, require_login
from budget_mis.api_1.helper import to_number, normalize


# Builds the head/sub-head/item budget tree for a financial year by merging Finance Budget Amounts into the Import Templates schema.
@guest_api
def get_budget_summary(financial_year=None, units=None, cost_center=None, location_code=None, template_name="Budget Templat Master"):

    if not financial_year:
        frappe.throw("Financial Year is required")

    if not template_name:
        frappe.throw("Template Name is required")

    # Only scope on a genuine direct HTTP call — internal callers pass
    # units=None intentionally to get an already-scoped, admin-configured
    # result and must not be narrowed by the current session user.
    if is_direct_http_call(get_budget_summary):
        if units:
            require_unit_access(units)
        else:
            allowed_units = get_allowed_units()
            if allowed_units is not None:
                if not allowed_units:
                    return []
                units = ",".join(sorted(allowed_units))

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

        q1 = [to_number(r.april), to_number(r.may), to_number(r.june)]
        q2 = [to_number(r.july), to_number(r.august), to_number(r.september)]
        q3 = [to_number(r.october), to_number(r.november), to_number(r.december)]
        q4 = [to_number(r.january), to_number(r.february), to_number(r.march)]

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


# Builds the budget-only head/sub-head/item YTD tree (April through the given month) from Finance Budget Amounts - this is NOT actuals data despite the name; the real actuals come from group_actuals_ytd and the two are only merged together one level up, in get_combined_actuals.
@guest_api
def get_budget_ytd_by_sequence(
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
    if is_direct_http_call(get_budget_ytd_by_sequence):
        if units:
            require_unit_access(units)
        else:
            allowed_units = get_allowed_units()
            if allowed_units is not None:
                if not allowed_units:
                    return []
                units = ",".join(sorted(allowed_units))

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

        # YTD Calculation
        ytd_total = sum(to_number(r.get(m)) for m in MONTHS[:end_index + 1])

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

        # Use item + GL as unique key (avoids merging two differently-coded items that share a name)
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
    # Final Aggregation (no double counting)
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


def _resolve_export_units(units):
    """Validate + resolve the units param for export_phase_sheet_excel the
    same way get_budget_summary scopes a direct HTTP call: an explicit
    units list must be within the caller's own Finance user access, and no
    units at all falls back to exactly the caller's allowed set (None for
    an unrestricted admin). Returns the resolved units string (or None for
    "no restriction"), or a sentinel meaning "nothing to show"."""
    if units:
        require_unit_access(units)
        return units

    allowed_units = get_allowed_units()
    if allowed_units is None:
        return None
    if not allowed_units:
        return []
    return ",".join(sorted(allowed_units))


def _write_budget_sheet(wb, sheet_title, data, financial_year, first_sheet=False):
    """Write one Budget Summary report (the same shape get_budget_summary
    returns) into a new worksheet of wb. first_sheet reuses wb's own
    auto-created initial worksheet instead of adding another one - openpyxl
    Workbook() always starts with exactly one, and leaving it unused would
    export a stray blank "Sheet" tab alongside the real ones."""

    from openpyxl.styles import Alignment, Font, PatternFill, Border, Side
    from openpyxl.utils import get_column_letter

    ws = wb.active if first_sheet else wb.create_sheet()
    # Sheet titles can't contain : \ / ? * [ ] and are capped at 31 chars -
    # cost center/location descriptions routinely exceed that and may
    # contain any of those characters, so this sanitizes and truncates
    # rather than letting openpyxl raise on an otherwise-valid title.
    ws.title = re.sub(r"[:\\/?*\[\]]", " ", sheet_title).strip()[:31] or "Sheet"

    center = Alignment(horizontal="center", vertical="center")
    left_align = Alignment(horizontal="left", vertical="center")
    right_align = Alignment(horizontal="right", vertical="center")

    bold = Font(bold=True)
    white_bold = Font(bold=True, color="FFFFFF")

    header_fill = PatternFill("solid", fgColor="5D6D7E")
    head_fill = PatternFill("solid", fgColor="D6DBDF")
    subhead_fill = PatternFill("solid", fgColor="F2F3F4")
    subtotal_fill = PatternFill("solid", fgColor="EBF5FB")
    head_total_fill = PatternFill("solid", fgColor="D4E6F1")
    grand_fill = PatternFill("solid", fgColor="A9CCE3")

    thin = Side(style="thin")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)


    def style_row(row, fill=None, font=None, header=False):

        for col in range(2,22):

            cell = ws.cell(row=row,column=col)
            cell.border = border

            if header:
                cell.alignment = center
            else:
                if col == 2:
                    cell.alignment = center
                elif col in (3,4):
                    cell.alignment = left_align
                else:
                    cell.alignment = right_align

            if fill:
                cell.fill = fill

            if font:
                cell.font = font


    def format_numeric(row):
        for col in range(5,22):
            ws.cell(row=row,column=col).number_format = "#,##0.00"


    def build_formula(col, rows):
        return "=" + "+".join([f"{col}{r}" for r in rows]) if rows else 0


    def to_roman(num):

        val=[1000,900,500,400,100,90,50,40,10,9,5,4,1]
        syb=["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"]

        roman=""
        i=0

        while num>0:
            for _ in range(num//val[i]):
                roman+=syb[i]
                num-=val[i]
            i+=1

        return roman


    # TITLE
    ws.append(["","Azim Premji Foundation"])
    ws.merge_cells("B1:U1")
    ws["B1"].font=Font(size=14,bold=True)
    ws["B1"].alignment=left_align

    # The cost center/location ERP codes already appear in sheet_title
    # itself (see _cost_center_location_pairs), so this subtitle line is
    # the only place they're shown - no separate "Cost Center: ... |
    # Location Code: ..." line below it.
    subtitle = f"Budget for the Financial Year {financial_year or ''}"
    if not first_sheet:
        subtitle += f" — {sheet_title}"
    ws.append(["",subtitle])
    ws.merge_cells("B2:U2")
    ws["B2"].font=Font(size=12,bold=True)

    ws.append([])


    # HEADER
    ws.append([
        "", "Sl #","HEAD OF EXPENSE","TYPE OF EXPENSE",
        "QUARTER I","","",
        "QUARTER II","","",
        "QUARTER III","","",
        "QUARTER IV","","",
        "QTR-1","QTR-2","QTR-3","QTR-4",
        f"YEAR {financial_year}"
    ])

    r1=ws.max_row

    ws.merge_cells(start_row=r1,start_column=5,end_row=r1,end_column=7)
    ws.merge_cells(start_row=r1,start_column=8,end_row=r1,end_column=10)
    ws.merge_cells(start_row=r1,start_column=11,end_row=r1,end_column=13)
    ws.merge_cells(start_row=r1,start_column=14,end_row=r1,end_column=16)

    ws.append([
        "", "Sl #","HEAD OF EXPENSE","TYPE OF EXPENSE",
        "Apr","May","Jun",
        "Jul","Aug","Sep",
        "Oct","Nov","Dec",
        "Jan","Feb","Mar",
        "QTR-1","QTR-2","QTR-3","QTR-4",
        f"YEAR {financial_year}"
    ])

    r2=ws.max_row

    ws.merge_cells(start_row=r1,start_column=2,end_row=r2,end_column=2)
    ws.merge_cells(start_row=r1,start_column=3,end_row=r2,end_column=3)
    ws.merge_cells(start_row=r1,start_column=4,end_row=r2,end_column=4)

    for col in range(17,22):
        ws.merge_cells(start_row=r1,start_column=col,end_row=r2,end_column=col)

    style_row(r1,header_fill,white_bold,True)
    style_row(r2,header_fill,white_bold,True)

    # Freeze both header rows (r1/r2) and the first 4 columns, leaving the
    # first real data row as the first scrollable one - r2+1 (not a fixed
    # "6") since the per-cost-center sheets' extra Cost Center/Location
    # Code line above shifts where the header actually lands by one row
    # relative to the consolidated sheet.
    ws.freeze_panes=f"E{r2+1}"


    head_total_rows=[]
    head_counter=0


    for head in data:

        head_counter+=1
        alpha_index=chr(64+head_counter)
        head_name=(head.get("name") or "").strip().upper()


        # COVID SUPPORT
        if head_name=="COVID SUPPORT":

            ws.append([])

            item=head["items"][0]
            r=ws.max_row+1

            ws.append([
                "",alpha_index,
                head["name"],
                item["name"],
                *item["q1"],*item["q2"],*item["q3"],*item["q4"],
                f"=SUM(E{r}:G{r})",
                f"=SUM(H{r}:J{r})",
                f"=SUM(K{r}:M{r})",
                f"=SUM(N{r}:P{r})",
                f"=SUM(Q{r}:T{r})"
            ])

            style_row(ws.max_row)
            format_numeric(ws.max_row)
            ws.cell(row=ws.max_row,column=3).font=bold

            continue


        ws.append(["",alpha_index,head["name"]])
        r=ws.max_row

        ws.merge_cells(start_row=r,start_column=3,end_row=r,end_column=21)
        style_row(r,head_fill,bold)

        if head_name=="OPERATING EXPENSES":
            ws.append([])

        sub_total_rows=[]
        direct_item_rows=[]


        for item in head.get("items",[]):

            r=ws.max_row+1
            sub_val=item.get("sub_head_of_expense")
            head_display=sub_val.strip() if sub_val else ""

            ws.append([
                "", "", head_display,
                item["name"],
                *item["q1"],*item["q2"],*item["q3"],*item["q4"],
                f"=SUM(E{r}:G{r})",
                f"=SUM(H{r}:J{r})",
                f"=SUM(K{r}:M{r})",
                f"=SUM(N{r}:P{r})",
                f"=SUM(Q{r}:T{r})"
            ])

            style_row(ws.max_row)
            format_numeric(ws.max_row)
            direct_item_rows.append(ws.max_row)


        sub_counter=1

        for sub in head.get("sub_heads",[]):

            roman_index=to_roman(sub_counter)

            ws.append(["",roman_index,sub["name"]])
            r=ws.max_row

            ws.merge_cells(start_row=r,start_column=3,end_row=r,end_column=21)
            style_row(r,subhead_fill,bold)

            sub_item_rows=[]

            for item in sub.get("items",[]):

                r=ws.max_row+1
                item_sub=item.get("sub_head_of_expense")
                sub_name=sub.get("name")

                head_display=""

                if item_sub and str(item_sub).strip():

                    cleaned=str(item_sub).strip()

                    if cleaned.lower()!=str(sub_name).strip().lower():
                        head_display=cleaned

                ws.append([
                    "", "", head_display,
                    item["name"],
                    *item["q1"],*item["q2"],*item["q3"],*item["q4"],
                    f"=SUM(E{r}:G{r})",
                    f"=SUM(H{r}:J{r})",
                    f"=SUM(K{r}:M{r})",
                    f"=SUM(N{r}:P{r})",
                    f"=SUM(Q{r}:T{r})"
                ])

                style_row(ws.max_row)
                format_numeric(ws.max_row)
                sub_item_rows.append(ws.max_row)


            if sub_item_rows:

                ws.append([
                    "", "", "",
                    f"TOTAL - {sub['name']}",
                    *[build_formula(c,sub_item_rows) for c in list("EFGHIJKLMNOPQRSTU")]
                ])

                style_row(ws.max_row,subtotal_fill,bold)
                format_numeric(ws.max_row)
                sub_total_rows.append(ws.max_row)

            sub_counter+=1


        total_rows=sub_total_rows if sub_total_rows else direct_item_rows

        if total_rows:

            ws.append([
                "", "", "",
                f"TOTAL - {head['name']}",
                *[build_formula(c,total_rows) for c in list("EFGHIJKLMNOPQRSTU")]
            ])

            style_row(ws.max_row,head_total_fill,bold)
            format_numeric(ws.max_row)
            head_total_rows.append(ws.max_row)

            if head_name=="OPERATING EXPENSES":
                ws.append([])


    # CLEANUP EXTRA BLANK ROW
    for r in range(ws.max_row,1,-1):

        head_val=ws.cell(r,3).value
        prev_val=ws.cell(r-1,3).value

        if head_val=="COVID SUPPORT" and prev_val is None:
            ws.delete_rows(r-1)
            break


    # GRAND TOTAL
    if head_total_rows:

        ws.append([
            "", "", "",
            "GRAND TOTAL",
            *[build_formula(c,head_total_rows) for c in list("EFGHIJKLMNOPQRSTU")]
        ])

        style_row(ws.max_row,grand_fill,bold)
        format_numeric(ws.max_row)


    # COLUMN WIDTH
    for col in range(1,ws.max_column+1):

        letter=get_column_letter(col)
        max_len=0

        for row in range(1,ws.max_row+1):

            val=ws.cell(row=row,column=col).value

            if val:
                val=str(val)

                if val.startswith("="):
                    val="999,999,999.00"

                max_len=max(max_len,len(val))

        ws.column_dimensions[letter].width=min(max(max_len+3,10),50)


# Builds the Budget Summary Excel workbook (one consolidated sheet, plus one sheet per cost-center/location combo when specific units are selected).
@frappe.whitelist()
def export_phase_sheet_excel(
    financial_year=None,
    units=None,
    cost_center=None,
    location_code=None
):

    import io
    from openpyxl import Workbook

    require_login()
    resolved_units = _resolve_export_units(units)
    if resolved_units == []:
        frappe.throw("You do not have access to any budget units.", frappe.PermissionError, title="Not Permitted")

    wb = Workbook()

    data = get_budget_summary(
        financial_year=financial_year,
        units=resolved_units,
        cost_center=cost_center,
        location_code=location_code
    )
    _write_budget_sheet(wb, "Budget Summary", data, financial_year, first_sheet=True)

    # Per-cost-center/location breakdown sheets, one per combination found
    # within the selected units/filters - triggered by the caller actually
    # choosing at least one specific unit (checked on the raw `units` param,
    # not resolved_units: a restricted user's own allowed-units fallback can
    # resolve to several units even though they picked none, and that "All
    # units" case should stay single-sheet, not fan out org-wide). No cap at
    # 2+ units anymore - even a single selected unit gets its own breakdown.
    explicit_unit_list = [u.strip() for u in (units or "").split(",") if u.strip()]
    unit_list = [u.strip() for u in (resolved_units or "").split(",") if u.strip()]
    if explicit_unit_list:
        for pair in _cost_center_location_pairs(financial_year, unit_list, cost_center, location_code):
            pair_data = get_budget_summary(
                financial_year=financial_year,
                units=resolved_units,
                cost_center=pair["cost_center"],
                location_code=pair["location_code"],
            )
            if not any(_head_has_amount(head) for head in pair_data):
                continue
            _write_budget_sheet(wb, pair["sheet_title"], pair_data, financial_year)

    import base64
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)

    return {
        "filename": f"Budget Summary_{financial_year}.xlsx",
        "data": base64.b64encode(buf.read()).decode("utf-8"),
    }


# Returns True if a head (or any of its sub-heads/items) has a non-zero value in any quarter.
def _head_has_amount(head):
    QUARTERS = ("q1", "q2", "q3", "q4")

    def row_total(row):
        return sum(sum(row.get(q) or []) for q in QUARTERS)

    if row_total(head) > 0:
        return True
    for item in head.get("items", []):
        if row_total(item) > 0:
            return True
    for sub in head.get("sub_heads", []):
        if row_total(sub) > 0:
            return True
        for item in sub.get("items", []):
            if row_total(item) > 0:
                return True
    return False


def _cost_center_location_pairs(financial_year, unit_list, cost_center=None, location_code=None):
    """Distinct (cost_center, location_code) combinations found in Finance
    Budget for the given units/financial_year (optionally narrowed further
    by an existing cost_center/location_code filter from the request), each
    with a human-readable sheet title. One row per combination, not per
    Finance Budget record - the same cost center can appear across several
    budget records (different expense templates, re-uploads, etc.)."""

    filters = {"financial_year": financial_year, "set_id": ["in", unit_list]}

    if cost_center:
        filters["cost_center"] = ["in", [c.strip() for c in cost_center.split(",") if c.strip()]]

    if location_code:
        filters["location_code"] = ["in", [l.strip() for l in location_code.split(",") if l.strip()]]

    rows = frappe.get_all(
        "Finance Budget",
        filters=filters,
        fields=["cost_center", "location_code", "cc_descr", "cost_center_erp", "location_code_erp"],
    )

    location_names = {}

    pairs = {}
    for r in rows:
        if not r.cost_center or not r.location_code:
            continue
        key = (str(r.cost_center), str(r.location_code))
        if key in pairs:
            continue

        if r.location_code not in location_names:
            location_names[r.location_code] = frappe.db.get_value("Location Code", r.location_code, "decription")

        # Title shows the real ERP code next to each label (e.g. "Focussed
        # Geo (161101) - Bihar - Bodh Gaya (1004)"), not the internal
        # autoincrement cost_center/location_code id - those ids mean
        # nothing to a business user reading the sheet, the ERP code is
        # what they'd actually recognize/look up.
        cc_label = r.cc_descr or r.cost_center
        loc_label = location_names.get(r.location_code) or r.location_code
        cc_title = f"{cc_label} ({r.cost_center_erp})" if r.cost_center_erp else cc_label
        loc_title = f"{loc_label} ({r.location_code_erp})" if r.location_code_erp else loc_label

        pairs[key] = {
            "cost_center": str(r.cost_center),
            "location_code": str(r.location_code),
            "cost_center_erp": r.cost_center_erp or str(r.cost_center),
            "location_code_erp": r.location_code_erp or str(r.location_code),
            "sheet_title": f"{cc_title} - {loc_title}",
        }

    return sorted(pairs.values(), key=lambda p: p["sheet_title"])
