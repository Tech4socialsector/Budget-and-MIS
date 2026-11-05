// Listens for the "progress" realtime event budget_mis.startup's
// warm_actuals_cache job publishes (frappe.publish_progress - one event per
// planned fetch, only for the periods the logging-in user's own module
// access actually needs, plus a final 100% summary) and reflects it as one
// toast that updates in place - removed and recreated under the same id at
// each step rather than stacking a new toast per milestone. The number of
// steps varies per user (module-access-dependent), so this doesn't assume
// a fixed count - each event is shown as it arrives.
//
// The final 100% event's own description says so explicitly if any period
// couldn't be pre-loaded even after warm_actuals_cache's own retry pass
// ("couldn't be pre-loaded") - shown as a 'warning' toast instead of
// 'success' in that case, since the affected reports will still work, just
// slower on first open (a live fetch instead of a warm cache hit).
//
// initSocket() (frappe-ui) builds its connection URL from window.site_name
// in production, but this app's boot data only ever sets window.sitename
// (see budget_mis/www/budget-mis.py / frappe.website.utils.get_boot_data)
// - aliasing it here is cheaper than patching frappe-ui's own socketio.js
// a second time for a one-line fix.
import { initSocket, toast } from 'frappe-ui'

const TOAST_ID = 'actuals-cache-progress'
const PARTIAL_FAILURE_MARKER = "couldn't be pre-loaded"

let socket = null
let connectedForUser = null

function toastForPercent(percent, description) {
  const partialFailure = percent >= 100 && (description || '').includes(PARTIAL_FAILURE_MARKER)
  toast.remove(TOAST_ID)
  toast.create({
    id: TOAST_ID,
    message: `${description || 'Loading actuals data…'} ${percent}%`,
    type: percent >= 100 ? (partialFailure ? 'warning' : 'success') : 'info',
    duration: percent >= 100 ? (partialFailure ? 6 : 4) : 0,
    closable: percent >= 100,
  })
}

// Connects once per logged-in user - calling this again for the same user
// (e.g. a second completeLogin in the same tab, which shouldn't normally
// happen but costs nothing to guard) is a no-op rather than opening a
// second socket.
export function listenForActualsCacheProgress(user) {
  if (!user || connectedForUser === user) return
  connectedForUser = user

  if (!window.site_name && window.sitename) {
    window.site_name = window.sitename
  }

  if (!socket) {
    // window.socketio_port is set in budget_mis/www/budget_mis.py's own
    // get_context (mirroring frappe.boot.load_conf_settings, Desk's
    // equivalent) - without it, initSocket() falls back to the hardcoded
    // default port 9000, which is wrong on any bench configured with a
    // different socketio_port (this one included), and the socket never
    // actually connects.
    socket = initSocket({ port: window.socketio_port })
  }

  socket.on('progress', (data) => {
    if (!data || data.title !== 'Loading actuals data') return
    toastForPercent(data.percent, data.description)
  })
}
