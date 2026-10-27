import { ref, watchEffect } from 'vue'

// Gravatar's current API accepts a SHA-256 hash of the trimmed, lowercased
// email (their older MD5 scheme still works but SHA-256 is what they now
// recommend). crypto.subtle is only exposed by browsers in a "secure
// context" (HTTPS, or localhost) - opening this app over plain http:// at a
// LAN IP (e.g. http://10.1.3.172:8008) leaves crypto.subtle undefined, so
// this guards that case instead of throwing and taking the rest of the
// watchEffect (and anything awaiting this url) down with it.
async function sha256Hex(text) {
  if (!crypto?.subtle?.digest) return null
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// `d=404` makes Gravatar itself 404 instead of serving its default
// silhouette when the email has no registered avatar - Avatar.vue already
// falls back to initials on an image load error, so this lets that one
// fallback path cover "no Gravatar" too instead of showing Gravatar's own
// mystery-person placeholder. Also covers the no-crypto.subtle case above:
// a null url falls back to Avatar.vue's initials exactly the same way.
export function useGravatarUrl(email) {
  const url = ref(null)
  watchEffect(async () => {
    const trimmed = (email.value || '').trim().toLowerCase()
    if (!trimmed) {
      url.value = null
      return
    }
    try {
      const hash = await sha256Hex(trimmed)
      url.value = hash ? `https://www.gravatar.com/avatar/${hash}?d=404&s=80` : null
    } catch {
      url.value = null
    }
  })
  return url
}
