import mimetypes
import os
import re

import frappe
from frappe.website.page_renderers.base_renderer import BaseRenderer
from werkzeug.wrappers import Response

# vite-plugin-pwa's build output physically lives under the app's built
# assets directory (/assets/annual_budget/frontend/), same as every other
# bundled file - see frontend/vite.config.js. Browsers only let a service
# worker control paths at-or-below its own serving path, so it must be
# reachable at /annual_budget/sw.js (the app's actual route) rather than
# its real build location, and its sibling workbox-*.js chunk is loaded by
# sw.js via a same-directory relative import, so that has to be reachable
# there too.
ALLOWED_FILENAME = re.compile(r"^(sw\.js|sw\.js\.map|workbox-[\w-]+\.js|workbox-[\w-]+\.js\.map)$")


class ServiceWorkerRenderer(BaseRenderer):
	# By the time custom page_renderer hooks run, website_route_rules has
	# already rewritten self.path/endpoint (the catch-all
	# "/annual_budget/<path:app_path>" -> "annual_budget" rule collapses
	# every sub-path to "annual_budget" - see path_resolver.py's resolve()
	# calling resolve_path() before instantiating any renderer), so the real
	# requested filename has to come from the raw request path instead of
	# self.path.
	def _requested_path(self):
		request = getattr(frappe.local, "request", None)
		return (request.path if request else "").strip("/ ")

	def can_render(self):
		path = self._requested_path()
		return path.startswith("annual_budget/") and bool(ALLOWED_FILENAME.match(path.split("/")[-1]))

	def render(self):
		filename = self._requested_path().split("/")[-1]
		file_path = os.path.join(frappe.get_app_path("annual_budget", "public", "frontend"), filename)

		if not os.path.isfile(file_path):
			from frappe.website.page_renderers.not_found_page import NotFoundPage

			return NotFoundPage(self.path).render()

		with open(file_path, "rb") as f:
			data = f.read()

		mimetype = mimetypes.guess_type(filename)[0] or "application/javascript"
		response = Response(data, mimetype=mimetype)
		# Places the service worker's own file at the top of its allowed
		# scope, but this header makes that explicit for any browser that
		# still checks it rather than only relying on serving path.
		response.headers["Service-Worker-Allowed"] = "/annual_budget/"
		response.headers["Cache-Control"] = "no-cache"
		return response
