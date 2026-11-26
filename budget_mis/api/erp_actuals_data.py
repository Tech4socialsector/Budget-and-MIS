import base64
import gzip
import json

import frappe
from frappe.utils.password import decrypt, encrypt

# Storage encoding for ERP Actuals Data.response_json: gzip-compress the
# raw JSON response (shrinks a ~6MB period down to ~0.3MB, comfortably
# under MySQL's max_allowed_packet - the same real limit hit during an
# earlier version of this work), then encrypt the compressed bytes with
# this SITE's own encryption_key (frappe.utils.password.encrypt/decrypt,
# Fernet-based, key lives only in site_config.json - never shipped to any
# frontend bundle, unlike budget_mis.api.response_crypto's own key, which
# is intentionally public and only obfuscates the browser Network tab).
# A DB dump or Desk read of this field alone cannot recover the real
# figures without this site's own encryption_key.
#
# Fernet's encrypt/decrypt work on strings, not arbitrary bytes, so the
# gzip bytes are base64-encoded into a string before encryption - this
# base64 step is NOT the security layer (same as it never was in the
# earlier version of this work); encryption is.
def _encode_response(result):
	compressed = gzip.compress(json.dumps(result).encode())
	as_text = base64.b64encode(compressed).decode()
	return encrypt(as_text)


def _decode_response(encoded):
	as_text = decrypt(encoded)
	compressed = base64.b64decode(as_text)
	return json.loads(gzip.decompress(compressed).decode())


# Reads one period's stored actuals and returns it in the exact same
# {"status", "fiscal_year", "accounting_period", "count", "data"} envelope
# the old live ERP fetch used to return, so a report can read this instead
# with no shape change downstream. Returns a "failed"-shaped envelope if no
# record exists for this period yet (never fetched/backfilled) or it has
# no successful response stored - there is deliberately NO live-ERP
# fallback here: a caller reaching this function wants the stored data, not
# a fresh PeopleSoft round trip, and a missing period is a real gap in the
# backfill/sync job that should surface visibly rather than be silently
# papered over with a slow live call.
def get_actuals_data(fiscal_year, accounting_period):
	period_key = f"{int(fiscal_year)}-{int(accounting_period):02d}"

	if not frappe.db.exists("ERP Actuals Data", period_key):
		return {
			"status": "failed",
			"error": f"No ERP Actuals Data record for fiscal_year={fiscal_year}, accounting_period={accounting_period} yet - it hasn't been backfilled/synced.",
		}

	response_json = frappe.db.get_value("ERP Actuals Data", period_key, "response_json")
	if not response_json:
		return {
			"status": "failed",
			"error": f"ERP Actuals Data '{period_key}' has no successful response stored yet.",
		}

	return _decode_response(response_json)
