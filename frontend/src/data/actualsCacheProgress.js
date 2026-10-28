// Listens for the "progress" realtime event budget_mis.startup's
// warm_actuals_cache job publishes (frappe.publish_progress, 0% on start,
// 50% once the current period is cached, 100% once both current and
// previous are) and reflects it as one toast that updates in place -
// removed and recreated under the same id at each step rather than
// stacking a new toast per milestone, since there are only ever the 3
// steps above (no finer progress is available: each fetch is a single
// blocking PeopleSoft HTTP call, not something that reports partial
// completion).
//
// initSocket() (frappe-ui) builds its connection URL from window.site_name
// in production, but this app's boot data only ever sets window.sitename
// (see budget_mis/www/budget-mis.py / frappe.website.utils.get_boot_data)
// - aliasing it here is cheaper than patching frappe-ui's own socketio.js
// a second time for a one-line fix.
import { initSocket, toast } from 'frappe-ui'

const TOAST_ID = 'actuals-cache-progress'

let socket = null
let connectedForUser = null

function toastForPercent(percent, description) {
  toast.remove(TOAST_ID)
  toast.create({
    id: TOAST_ID,
    message: `${description || 'Loading actuals data…'} ${percent}%`,
    type: percent >= 100 ? 'success' : 'info',
    duration: percent >= 100 ? 4 : 0,
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
