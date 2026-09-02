"""AES-GCM response obfuscation + auth gating for annual_budget API methods.

Encryption hides plain JSON from a casual glance at the browser Network tab.
It is NOT a substitute for authentication/authorization: the AES key below
ships inside frontend JS (see public/js/response_decrypt.bundle.js), so
anyone who reads the bundle can decrypt every response. Real access control
is enforced by require_login().

Testing Mode (ERP Credentials.testing_mode) is a System-Manager-only escape
hatch for local development / Postman: while it is on, require_login() is a
no-op (guest calls are accepted) and encrypted_response returns plain JSON
instead of an envelope. It auto-expires after ERP Credentials'
testing_mode_duration_minutes via the scheduled task in tasks.py, so it
can't be left on indefinitely by accident.
"""

import base64
import functools
import json
import os
from datetime import timedelta

import frappe
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from frappe.utils import now_datetime, get_datetime

DEFAULT_TESTING_MODE_MAX_MINUTES = 60

_KEY_HEX = "555798abb956b8fb14293010eab1fec7ac706904bddc29756505f866a913bc0b"[:64]
_KEY = bytes.fromhex(_KEY_HEX)


def is_testing_mode():
	cached = frappe.cache().get_value("annual_budget_testing_mode")
	if cached is not None:
		return bool(cached)

	doc = frappe.get_single("ERP Credentials")
	result = bool(doc.testing_mode) and not _testing_mode_expired(doc)
	frappe.cache().set_value("annual_budget_testing_mode", result, expires_in_sec=15)
	return result


def _testing_mode_expired(doc):
	if not doc.testing_mode_enabled_at:
		return False
	max_minutes = doc.testing_mode_duration_minutes or DEFAULT_TESTING_MODE_MAX_MINUTES
	elapsed = now_datetime() - get_datetime(doc.testing_mode_enabled_at)
	return elapsed > timedelta(minutes=max_minutes)


@frappe.whitelist(allow_guest=True)
def get_testing_mode_status():
	if "System Manager" not in frappe.get_roles(frappe.session.user):
		return {"testing_mode": False}
	return {"testing_mode": is_testing_mode()}


def require_login():
	if is_testing_mode():
		return
	if frappe.session.user == "Guest":
		frappe.throw("Authentication required.", frappe.PermissionError, title="Not Permitted")


def _default(obj):
	if hasattr(obj, "isoformat"):
		return obj.isoformat()
	return str(obj)


def encrypt_payload(data):
	plaintext = json.dumps(data, default=_default).encode("utf-8")
	nonce = os.urandom(12)
	ciphertext = AESGCM(_KEY).encrypt(nonce, plaintext, None)
	return {
		"__enc__": True,
		"iv": base64.b64encode(nonce).decode("ascii"),
		"data": base64.b64encode(ciphertext).decode("ascii"),
	}


def encrypted_response(fn):
	"""Wrap a whitelisted endpoint's return value in an AES-GCM envelope.

	Only use this on functions that are never called directly by other
	Python code in this app — internal callers would receive an envelope
	instead of the real data. For functions that are both a whitelisted
	endpoint and called internally, use encrypted_response_if_direct_call.
	"""
	@functools.wraps(fn)
	def wrapper(*args, **kwargs):
		result = fn(*args, **kwargs)
		if is_testing_mode():
			return result
		return encrypt_payload(result)

	return wrapper


def is_direct_http_call(fn):
	"""Whether the currently-executing request is an actual HTTP dispatch to
	fn (frappe.local.form_dict.cmd matches it), as opposed to fn being called
	directly from other Python code in this app."""
	cmd = frappe.local.form_dict.get("cmd") if getattr(frappe, "local", None) else None
	return cmd == f"{fn.__module__}.{fn.__name__}"


def encrypted_response_if_direct_call(fn):
	"""Like encrypted_response, but only encrypts when reached via an actual
	HTTP dispatch (frappe.local.form_dict.cmd matches this function), not
	when called directly from other Python code in this app.
	"""
	@functools.wraps(fn)
	def wrapper(*args, **kwargs):
		result = fn(*args, **kwargs)
		if not is_direct_http_call(fn) or is_testing_mode():
			return result
		return encrypt_payload(result)

	return wrapper
