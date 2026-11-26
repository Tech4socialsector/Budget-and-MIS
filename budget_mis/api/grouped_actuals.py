from collections import defaultdict

import frappe

from budget_mis.utils import guest_api, get_allowed_units
from budget_mis.api.response_crypto import is_direct_http_call
from budget_mis.api.erp_actuals_data import get_actuals_data


# Every function below is cached and shared across EVERY caller regardless
# of who's asking (the cache key is only (fiscal_year, accounting_period),
# never per-user) - correct for internal callers, which always fetch the
# full unscoped dataset once and apply their own unit/cost-center/location
# filtering afterward (e.g. get_combined_actuals_report, get_theme_mappings-
# driven report fan-out). But these functions are also independently
# @guest_api-whitelisted, so a direct HTTP call to any of them previously
# returned the ENTIRE organization's actuals to any logged-in user,
# regardless of their own Finance user access restriction - a real
# cross-tenant data leak, since this is the raw data layer every other
# (correctly-scoped) report endpoint sits on top of. Filtering the already-
# computed/cached result down to the caller's own allowed units ONLY when
# is_direct_http_call(fn) is true for THAT function preserves the shared-
# cache-then-filter behavior for every internal caller (which must keep
# seeing everything, since it does its own narrower scoping on top) while
# closing the leak for a genuine HTTP request. `fn` must be the exact
# function object is_direct_http_call is being asked about, since it
# compares the dispatched cmd against that function's own dotted path.
def _scope_rows_to_allowed_units(rows, fn):
    if not is_direct_http_call(fn):
        return rows
    allowed_units = get_allowed_units()
    if allowed_units is None:
        return rows
    if not allowed_units:
        return []
    return [r for r in rows if str(r.get("business_unit")) in allowed_units]


# Drops PeopleSoft's opening-balance period "0" and sums duplicate (unit, account, dept, operating_unit, period) rows into one.
#
# Reads from the ERP Actuals Data doctype (budget_mis.api.erp_actuals_data.
# get_actuals_data) - populated by the one-time backfill and kept current
# by the scheduled erp_actuals_sync.refresh_actuals_data job - instead of
# the old live PeopleSoft fetch/Redis cache (get_actuals_from_erp_month_wise).
# There is NO live-ERP fallback here: a period with no stored record yet
# (not backfilled, or a brand-new period the sync job hasn't reached) comes
# back as a "failed" status, same shape a live-fetch failure used to return,
# so every caller's existing status-check/error-display path already
# handles this correctly with no further change needed on their end.
@guest_api
def group_actuals_by_dimension(fiscal_year, accounting_period):
    month_wise = get_actuals_data(fiscal_year, accounting_period)

    if month_wise.get("status") != "success":
        return month_wise

    grouped = {}
    for row_data in month_wise.get("data", []):
        if str(row_data.get("accounting_period")) == "0":
            continue

        key = (
            row_data.get("business_unit"),
            row_data.get("account"),
            row_data.get("deptid"),
            row_data.get("operating_unit"),
            row_data.get("accounting_period")
        )

        amt = float(row_data.get("posted_total_amt") or 0)

        if key not in grouped:
            grouped[key] = {
                "business_unit": key[0],
                "account": key[1],
                "deptid": key[2],
                "operating_unit": key[3],
                "accounting_period": key[4],
                "posted_total_amt": amt
            }
        else:
            grouped[key]["posted_total_amt"] += amt

    result = _scope_rows_to_allowed_units(list(grouped.values()), group_actuals_by_dimension)

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "count": len(result),
        "data": result
    }


# Joins each row's GL account against GL code Mapping + Expenses to attach head_of_expense/sub_head_of_expense/type_of_expense/sequence_id, dropping unmapped accounts.
@guest_api
def group_actuals_by_gl_mapping(fiscal_year, accounting_period):
    erp_response = group_actuals_by_dimension(fiscal_year, accounting_period)

    # A real failure (most commonly now: no ERP Actuals Data record for
    # this period at all, since that path has no live-ERP fallback to fall
    # back on) must propagate as a failure here too - checking status
    # explicitly rather than inferring "failed" from an empty data list,
    # which previously silently turned every failure into a success-shaped
    # {"data": []}, indistinguishable from a period that genuinely has zero
    # actuals. That bug predates this function reading from the doctype,
    # but was far less likely to be hit while the underlying fetch was a
    # live ERP call (a real failure there was usually a raised exception,
    # not a clean status); it is now load-bearing, since every un-
    # backfilled period hits this exact path deterministically.
    if erp_response.get("status") != "success":
        return erp_response

    if "message" in erp_response:
        erp_data = erp_response.get("message", {}).get("data", [])
    else:
        erp_data = erp_response.get("data", [])

    if not erp_data:
        return {
            "status": "success",
            "fiscal_year": fiscal_year,
            "accounting_period": accounting_period,
            "data": [],
            "count": 0
        }

    expenses = frappe.get_all(
        "Expenses",
        fields=[
            "name",
            "head_of_expense",
            "sub_head_of_expense",
            "type_of_expense",
            "sequence_id"
        ]
    )

    expense_lookup = {str(e.name): e for e in expenses}

    child_rows = frappe.get_all(
        "GL code Mapping",
        fields=["parent", "gl_code_map", "type_of_expense"]
    )

    gl_parent_map = {str(row.gl_code_map).strip(): str(row.parent) for row in child_rows}
    # Each GL code Mapping ROW carries its own type_of_expense (e.g. GL
    # 40009 = "CWIP-Furniture") - a finer-grained sub-classification than
    # its parent Expenses doc's own type_of_expense (e.g. "Tables, Chairs,
    # Workstations", shared by every GL code mapped under that one Expenses
    # row). Kept as its own "actuals_type_of_expenses" field rather than
    # replacing `type_of_expense` below, since that field is still the
    # grouping key group_actuals_ytd collapses by (it must stay the
    # PARENT's value so GL codes under the same Expenses item combine into
    # one budget-matched total) - this per-GL value is purely for display
    # (the GL-code-level drill-down), not for aggregation.
    gl_type_of_expense_map = {str(row.gl_code_map).strip(): row.type_of_expense for row in child_rows}

    grouped = defaultdict(float)
    gl_type_by_account = {}

    for record in erp_data:
        account = str(record.get("account", "")).strip()
        period = record.get("accounting_period")
        amount = float(record.get("posted_total_amt", 0) or 0)

        parent = gl_parent_map.get(account)
        if not parent:
            continue

        expense = expense_lookup.get(parent)
        if not expense:
            continue

        gl_type_by_account.setdefault(account, gl_type_of_expense_map.get(account) or expense.type_of_expense)

        key = (
            period,
            record.get("business_unit"),
            record.get("deptid"),
            record.get("operating_unit"),
            account,
            expense.head_of_expense,
            expense.sub_head_of_expense,
            expense.type_of_expense,
            expense.sequence_id
        )

        grouped[key] += amount

    final_output = []

    for (
        period,
        business_unit,
        deptid,
        operating_unit,
        account,
        head_of_expense,
        sub_head_of_expense,
        type_of_expense,
        sequence_id
    ), total_sum in grouped.items():

        final_output.append({
            "sequence_id": sequence_id,
            "accounting_period": period,
            "account": account,
            "business_unit": business_unit,
            "deptid": deptid,
            "operating_unit": operating_unit,
            "head_of_expense": head_of_expense,
            "sub_head_of_expense": sub_head_of_expense,
            "type_of_expense": type_of_expense,
            "actuals_type_of_expenses": gl_type_by_account.get(account) or type_of_expense,
            "total_posted_amt": round(total_sum, 2)
        })

    final_output.sort(key=lambda x: (x.get("sequence_id") or 0))
    final_output = _scope_rows_to_allowed_units(final_output, group_actuals_by_gl_mapping)

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "data": final_output,
        "count": len(final_output)
    }


# Collapses month_wise's per-month, per-GL-code rows into one YTD total per
# (unit, dept, operating_unit, head/sub-head/type). No caching layer of its
# own - the underlying ERP data now comes straight from the ERP Actuals
# Data doctype (kept current by the scheduled sync job, not by any
# per-request cache), so this join/grouping work re-runs fresh on every
# call against whatever that doctype's data currently is, rather than
# risking serving an already-stale derived result from Redis in between
# sync-job runs.
@guest_api
def group_actuals_ytd(fiscal_year, accounting_period):
    result = _group_actuals_ytd_raw(fiscal_year, accounting_period)
    if is_direct_http_call(group_actuals_ytd):
        return {**result, "data": _scope_rows_to_allowed_units(result.get("data", []), group_actuals_ytd)}
    return result


def _group_actuals_ytd_raw(fiscal_year, accounting_period):
    month_wise = group_actuals_by_gl_mapping(fiscal_year, accounting_period)

    if month_wise.get("status") != "success":
        return {
            "status": month_wise.get("status", "failed"),
            "fiscal_year": fiscal_year,
            "data": [],
            "error": month_wise.get("error"),
        }

    grouped = defaultdict(float)
    meta_by_key = {}

    for record in month_wise.get("data", []):
        key = (
            record.get("business_unit"),
            record.get("deptid"),
            record.get("operating_unit"),
            record.get("head_of_expense"),
            record.get("sub_head_of_expense"),
            record.get("type_of_expense"),
            record.get("sequence_id"),
        )
        grouped[key] += float(record.get("total_posted_amt") or 0)
        meta_by_key.setdefault(key, record.get("actuals_type_of_expenses"))

    final_output = []
    for (
        business_unit,
        deptid,
        operating_unit,
        head_of_expense,
        sub_head_of_expense,
        type_of_expense,
        sequence_id,
    ), total_sum in grouped.items():
        final_output.append({
            "sequence_id": sequence_id,
            "business_unit": business_unit,
            "deptid": deptid,
            "operating_unit": operating_unit,
            "head_of_expense": head_of_expense,
            "sub_head_of_expense": sub_head_of_expense,
            "type_of_expense": type_of_expense,
            "actuals_type_of_expenses": meta_by_key.get((
                business_unit, deptid, operating_unit, head_of_expense,
                sub_head_of_expense, type_of_expense, sequence_id,
            )) or type_of_expense,
            "total_posted_amt": round(total_sum, 2)
        })

    final_output.sort(key=lambda x: (x.get("sequence_id") or 0))

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "data": final_output
    }


# Same YTD collapse as group_actuals_ytd, but keeps the GL code (account) as
# part of the grouping key instead of folding every GL code under a type_of
# _expense into one combined total - the properly unit-scoped replacement for
# budget_mis.api.erp_actuals.group_actuals_by_gl_code, backing the Budget
# vs Actuals item-row drill-down (api/budget_vs_actual.py's
# get_actual_gl_breakup), which needs the per-GL-code figures a single
# item's total_posted_amt is itself just the sum of. Built on the exact
# same group_actuals_by_gl_mapping output group_actuals_ytd already reuses
# - no separate ERP/mapping fetch of its own, and no caching layer of its
# own either (same reasoning as group_actuals_ytd above).
@guest_api
def group_actuals_by_gl_code(fiscal_year, accounting_period):
    result = _group_actuals_by_gl_code_raw(fiscal_year, accounting_period)
    if is_direct_http_call(group_actuals_by_gl_code):
        return {**result, "data": _scope_rows_to_allowed_units(result.get("data", []), group_actuals_by_gl_code)}
    return result


def _group_actuals_by_gl_code_raw(fiscal_year, accounting_period):
    month_wise = group_actuals_by_gl_mapping(fiscal_year, accounting_period)

    if month_wise.get("status") != "success":
        return {
            "status": month_wise.get("status", "failed"),
            "fiscal_year": fiscal_year,
            "data": [],
            "error": month_wise.get("error"),
        }

    grouped = defaultdict(float)
    meta_by_key = {}

    for record in month_wise.get("data", []):
        key = (
            record.get("business_unit"),
            record.get("deptid"),
            record.get("operating_unit"),
            record.get("head_of_expense"),
            record.get("sub_head_of_expense"),
            record.get("type_of_expense"),
            record.get("sequence_id"),
            record.get("account"),
        )
        grouped[key] += float(record.get("total_posted_amt") or 0)
        meta_by_key.setdefault(key, record.get("actuals_type_of_expenses"))

    final_output = []
    for (
        business_unit,
        deptid,
        operating_unit,
        head_of_expense,
        sub_head_of_expense,
        type_of_expense,
        sequence_id,
        account,
    ), total_sum in grouped.items():
        key = (
            business_unit, deptid, operating_unit, head_of_expense,
            sub_head_of_expense, type_of_expense, sequence_id, account,
        )
        final_output.append({
            "sequence_id": sequence_id,
            "business_unit": business_unit,
            "deptid": deptid,
            "operating_unit": operating_unit,
            "head_of_expense": head_of_expense,
            "sub_head_of_expense": sub_head_of_expense,
            "type_of_expense": meta_by_key.get(key) or type_of_expense,
            "gl_code": account,
            "total_posted_amt": round(total_sum, 2)
        })

    final_output.sort(key=lambda x: (x.get("sequence_id") or 0, x.get("gl_code") or ""))

    return {
        "status": "success",
        "fiscal_year": fiscal_year,
        "accounting_period": accounting_period,
        "data": final_output
    }
