// Transparently decrypts annual_budget API responses wrapped by
// annual_budget.api.response_crypto.encrypted_response, so existing
// frappe.call() callbacks across this app keep working unchanged.
//
// This only obfuscates the Network tab; it is not real secrecy — the key
// below ships to every browser. See api/response_crypto.py for the matching
// backend half and the reasoning.
(function () {
	"use strict";

	var KEY_HEX = "555798abb956b8fb14293010eab1fec7ac706904bddc29756505f866a913bc0b".slice(0, 64);

	function hexToBytes(hex) {
		var bytes = new Uint8Array(hex.length / 2);
		for (var i = 0; i < bytes.length; i++) {
			bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
		}
		return bytes;
	}

	function base64ToBytes(b64) {
		var bin = atob(b64);
		var bytes = new Uint8Array(bin.length);
		for (var i = 0; i < bin.length; i++) {
			bytes[i] = bin.charCodeAt(i);
		}
		return bytes;
	}

	var cryptoKeyPromise = crypto.subtle.importKey(
		"raw",
		hexToBytes(KEY_HEX),
		{ name: "AES-GCM" },
		false,
		["decrypt"]
	);

	function isEncryptedEnvelope(value) {
		return !!value && typeof value === "object" && value.__enc__ === true
			&& typeof value.iv === "string" && typeof value.data === "string";
	}

	async function decryptEnvelope(envelope) {
		var key = await cryptoKeyPromise;
		var plaintextBuf = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: base64ToBytes(envelope.iv) },
			key,
			base64ToBytes(envelope.data)
		);
		return JSON.parse(new TextDecoder().decode(plaintextBuf));
	}

	async function decryptResponseInPlace(r) {
		if (r && isEncryptedEnvelope(r.message)) {
			r.message = await decryptEnvelope(r.message);
		}
		if (r && isEncryptedEnvelope(r.data)) {
			r.data = await decryptEnvelope(r.data);
		}
		return r;
	}

	var original_call = frappe.call;

	frappe.call = function (opts) {
		if (typeof opts === "string") {
			// legacy positional form: frappe.call(method, args, callback, ...)
			return original_call.apply(frappe, arguments);
		}

		var user_callback = opts && opts.callback;
		var patched_opts = opts;

		if (user_callback) {
			patched_opts = Object.assign({}, opts, {
				callback: function (r, response_text) {
					decryptResponseInPlace(r)
						.catch(function () {
							// Not one of our encrypted payloads (or a core/other-app
							// call) — fall through with r untouched.
						})
						.then(function () {
							user_callback(r, response_text);
						});
				},
			});
		}

		var promise = original_call.call(frappe, patched_opts);

		if (promise && typeof promise.then === "function") {
			var decorated = promise.then(function (r) {
				return decryptResponseInPlace(r).catch(function () {
					return r;
				});
			});
			// Preserve jQuery Deferred-style .done()/.fail() chaining used elsewhere.
			if (promise.fail) {
				decorated.fail = promise.fail.bind(promise);
			}
			return decorated;
		}

		return promise;
	};
})();
