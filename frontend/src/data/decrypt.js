// Transparently decrypts budget_mis API responses wrapped by
// budget_mis.api.response_crypto.encrypted_response /
// encrypted_response_if_direct_call, mirroring the Desk-side decrypt bundle
// at budget_mis/public/js/response_decrypt.bundle.js (same key, same
// AES-GCM envelope shape) so this Vue app's calls work the same way the
// Desk's frappe.call() calls already do.
//
// This only obfuscates the Network tab; it is not real secrecy - the key
// below ships to every browser either way. See api/response_crypto.py.
import { call as frappeCall } from 'frappe-ui'

const KEY_HEX = '555798abb956b8fb14293010eab1fec7ac706904bddc29756505f866a913bc0b'.slice(0, 64)

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

function base64ToBytes(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i)
  }
  return bytes
}

// crypto.subtle is only exposed by browsers in a "secure context" (HTTPS,
// or localhost) - opening this app over plain http:// at a LAN IP (e.g.
// http://10.1.3.172:8008) leaves it undefined. A top-level
// crypto.subtle.importKey() call here would then throw at MODULE LOAD
// TIME, before any component using this file's call() even mounts - so
// this is deferred into a lazily-created promise instead, and every
// response normally comes back unencrypted anyway outside of
// testing_mode (see module comment above), so insecure-context callers
// should simply never hit decryptEnvelope() in practice.
let cryptoKeyPromise = null
function getCryptoKey() {
  if (!crypto?.subtle?.importKey) {
    throw new Error('crypto.subtle is unavailable (insecure context) - cannot decrypt an encrypted response')
  }
  if (!cryptoKeyPromise) {
    cryptoKeyPromise = crypto.subtle.importKey(
      'raw',
      hexToBytes(KEY_HEX),
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    )
  }
  return cryptoKeyPromise
}

function isEncryptedEnvelope(value) {
  return (
    !!value &&
    typeof value === 'object' &&
    value.__enc__ === true &&
    typeof value.iv === 'string' &&
    typeof value.data === 'string'
  )
}

async function decryptEnvelope(envelope) {
  const key = await getCryptoKey()
  const plaintextBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(envelope.iv) },
    key,
    base64ToBytes(envelope.data),
  )
  return JSON.parse(new TextDecoder().decode(plaintextBuf))
}

// Drop-in replacement for frappe-ui's call() - resolves to the same shape
// (the decoded `message`), just decrypting first when the response is one
// of budget_mis's AES-GCM envelopes. Falls through untouched for plain
// (unencrypted / testing-mode / core Frappe) responses.
export async function call(method, args, options) {
  const result = await frappeCall(method, args, options)
  if (isEncryptedEnvelope(result)) {
    return decryptEnvelope(result)
  }
  return result
}
