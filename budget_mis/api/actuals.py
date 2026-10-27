"""Deprecated path - kept so this file still exists on disk, but the real,
consolidated ERP/PeopleSoft actuals logic now lives in
`budget_mis.api.erp_actuals`. New code should import from there directly;
this module is a thin re-export shim only.
"""

from budget_mis.api.erp_actuals import *  # noqa: F401,F403
from budget_mis.api.erp_actuals import (
    fetch_actuals_ytd_legacy,
    fetch_actuals_ytd,
    fetch_actuals_month_wise,
    group_actuals_by_dimension,
    group_actuals_by_gl_code,
    group_actuals_ytd,
    group_actuals_month_wise,
    ERP_ACTUALS_EXPORT_METHODS,
    export_actuals_excel,
)
