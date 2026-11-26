import base64
import gzip
import json

import frappe
from frappe.utils.password import decrypt, encrypt

# Storage encoding for ERP Data.response_json: gzip-compress the raw JSON
# response (shrinks a ~6MB period down to ~0.3MB, comfortably under MySQL's
# max_allowed_packet - a real limit hit during an earlier version of this
# work), then encrypt the compressed bytes with this SITE's own
# encryption_key (frappe.utils.password.encrypt/decrypt, Fernet-based, key
# lives only in site_config.json - never shipped to any frontend bundle,
# unlike budget_mis.api.response_crypto's own key, which is intentionally
# public and only obfuscates the browser Network tab). A DB dump or Desk
# read of this field alone cannot recover the real figures without this
# site's own encryption_key.
#
# Fernet's encrypt/decrypt work on strings, not arbitrary bytes, so the
# gzip bytes are base64-encoded into a string before encryption - this
# base64 step is NOT the security layer; encryption is.
def _encode_response(result):
	compressed = gzip.compress(json.dumps(result).encode())
	as_text = base64.b64encode(compressed).decode()
	return encrypt(as_text)


def _decode_response(encoded):
	as_text = decrypt(encoded)
	compressed = base64.b64decode(as_text)
	return json.loads(gzip.decompress(compressed).decode())


# Reads one (fiscal_year, accounting_period, data_type)'s stored response
# and returns it exactly as stored - no live-ERP fallback, same reasoning
# both get_actuals_data/get_trial_balance_data below share: a caller
# reaching this function wants the stored data, not a fresh PeopleSoft
# round trip, and a missing period is a real gap in the backfill/sync job
# that should surface visibly rather than be silently papered over with a
# slow live call.
def _get_erp_data(fiscal_year, accounting_period, data_type):
	period_key = f"{int(fiscal_year)}-{int(accounting_period):02d}-{data_type}"

	if not frappe.db.exists("ERP Data", period_key):
		return {
			"status": "failed",
			"error": f"No ERP Data record for fiscal_year={fiscal_year}, accounting_period={accounting_period}, data_type={data_type} yet - it hasn't been backfilled/synced.",
		}

	response_json = frappe.db.get_value("ERP Data", period_key, "response_json")
	if not response_json:
		return {
			"status": "failed",
			"error": f"ERP Data '{period_key}' has no successful response stored yet.",
		}

	return _decode_response(response_json)


# Returns one period's stored actuals in the exact same {"status",
# "fiscal_year", "accounting_period", "count", "data"} envelope the old
# live ERP fetch used to return, so a report can read this with no shape
# change downstream.
def get_actuals_data(fiscal_year, accounting_period):
	return _get_erp_data(fiscal_year, accounting_period, "Actuals")


# Returns one period's stored trial balance in the exact same {"status",
# "fiscal_year", "accounting_period", "count", "data", "raw_rows"} envelope
# the old live ERP fetch used to return.
def get_trial_balance_data(fiscal_year, accounting_period):
	return _get_erp_data(fiscal_year, accounting_period, "Trial Balance")
