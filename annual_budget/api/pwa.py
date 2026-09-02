"""Dynamic PWA manifest and icons for the Vue frontend: served from
Master Settings.app_title/app_logo (resized on request by get_pwa_icon
below) instead of the static PNGs a build-time tool would bake in - so a
PWA install picks up whatever branding is actually configured, not
whatever was uploaded when the app was last built. Most phones only fetch
icons at install time, so changing the logo later won't update an
already-installed icon without a reinstall - there's no push mechanism
for that on any platform.
"""

from io import BytesIO

import frappe
from frappe.utils.file_manager import get_file_path
from PIL import Image

PWA_ICON_SIZES = [64, 192, 512]


@frappe.whitelist(allow_guest=True)
def get_pwa_manifest():
	settings = frappe.get_single("Master Settings")
	app_name = settings.app_title or "Annual Budget MIS"
	icon_version = _app_logo_cache_key(settings.app_logo)

	icons = [
		{
			"src": f"/api/method/annual_budget.api.pwa.get_pwa_icon?size={size}&v={icon_version}",
			"sizes": f"{size}x{size}",
			"type": "image/png",
		}
		for size in PWA_ICON_SIZES
	]
	icons.append({
		"src": f"/api/method/annual_budget.api.pwa.get_pwa_icon?size=512&maskable=1&v={icon_version}",
		"sizes": "512x512",
		"type": "image/png",
		"purpose": "maskable",
	})

	manifest = {
		"id": "/annual_budget/",
		"name": app_name,
		"short_name": app_name,
		"description": "Plan, track, and report your annual budget in one place.",
		"start_url": "/annual_budget/",
		"scope": "/annual_budget/",
		"display": "standalone",
		"background_color": "#ffffff",
		"theme_color": "#1e5fa8",
		"icons": icons,
	}

	frappe.response["type"] = "download"
	frappe.response["filename"] = "manifest.webmanifest"
	frappe.response["filecontent"] = frappe.as_json(manifest)
	frappe.response["content_type"] = "application/manifest+json"
	frappe.response["display_content_as"] = "inline"


def _app_logo_cache_key(app_logo):
	"""A cache/URL-busting key that changes exactly when the logo does -
	the logo's own path already changes on every re-upload (Frappe names
	uploaded files uniquely), so it doubles as a fingerprint with no extra
	bookkeeping needed."""
	return frappe.utils.sha256_hash(app_logo or "default")[:12]


@frappe.whitelist(allow_guest=True)
def get_pwa_icon(size="512", maskable=None):
	"""Resize Master Settings.app_logo into a square PNG at the requested
	size for the PWA manifest (see get_pwa_manifest) - phones expect
	specific icon sizes in specific formats, so the raw uploaded logo
	(whatever aspect ratio/format an admin uploaded) can't be linked
	directly. maskable=1 additionally pads the image to a safe zone on a
	solid background, per the maskable icon spec, so platforms that crop
	PWA icons into a circle/squircle don't cut off the logo's edges."""
	size = frappe.utils.cint(size) or 512
	if size not in PWA_ICON_SIZES:
		size = min(PWA_ICON_SIZES, key=lambda s: abs(s - size))
	is_maskable = frappe.utils.cint(maskable) == 1

	settings = frappe.get_single("Master Settings")
	cache_key = f"pwa-icon:{_app_logo_cache_key(settings.app_logo)}:{size}:{int(is_maskable)}"
	cached = frappe.cache().get_value(cache_key)

	if cached is None:
		cached = _render_pwa_icon(settings.app_logo, size, is_maskable)
		frappe.cache().set_value(cache_key, cached, expires_in_sec=3600)

	frappe.response["type"] = "download"
	frappe.response["filename"] = f"pwa-icon-{size}.png"
	frappe.response["filecontent"] = cached
	frappe.response["content_type"] = "image/png"
	frappe.response["display_content_as"] = "inline"


def _render_pwa_icon(app_logo, size, is_maskable):
	source = None
	if app_logo:
		try:
			with open(get_file_path(app_logo), "rb") as f:
				source = Image.open(f)
				source.load()
		except Exception:
			frappe.log_error(title="PWA icon: failed to read Master Settings.app_logo")
			source = None

	if source is None:
		# No logo configured (or it failed to load) - a plain colored
		# square beats a broken image in the install prompt/home screen.
		canvas = Image.new("RGB", (size, size), "#1e5fa8")
	else:
		source = source.convert("RGBA")
		# Center-crop to square before scaling, so an arbitrary-aspect-ratio
		# upload (a wide logo, a tall one) doesn't get squashed.
		w, h = source.size
		edge = min(w, h)
		left, top = (w - edge) // 2, (h - edge) // 2
		source = source.crop((left, top, left + edge, top + edge))

		if is_maskable:
			# Maskable icons must keep their subject inside an ~80% "safe
			# zone" - platforms that crop into a circle/squircle shape may
			# cut off anything closer to the edge than that.
			safe_size = int(size * 0.8)
			source = source.resize((safe_size, safe_size), Image.LANCZOS)
			corner = source.getpixel((0, 0))
			fill = corner[:3] if isinstance(corner, tuple) else (30, 95, 168)
			canvas = Image.new("RGB", (size, size), fill)
			offset = (size - safe_size) // 2
			canvas.paste(source, (offset, offset), source)
		else:
			source = source.resize((size, size), Image.LANCZOS)
			canvas = Image.new("RGB", (size, size), "#ffffff")
			canvas.paste(source, (0, 0), source)

	buffer = BytesIO()
	canvas.save(buffer, format="PNG")
	return buffer.getvalue()
