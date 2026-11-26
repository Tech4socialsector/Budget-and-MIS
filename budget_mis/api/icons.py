"""Shared validation for this app's icon fields (App Module Setting.icon,
App Module DocType Item.icon, DocType.icon via _doctype_icon in modules.py).

Desk's own Icon field picker (frappe/public/js/frappe/form/controls/icon.js)
draws from THREE different bundled icon sprite sets at once (lucide,
espresso, timeless) with no visible indication in the picker UI of which
set a given tile belongs to - but this app's frontend (LucideIcon.vue) only
ever renders Lucide's own icon set. An admin can easily pick a same-looking
tile from a different set (e.g. espresso's "support" instead of lucide's
own "life-buoy") and get a silently blank icon with no error anywhere.
"""

import json
import os

# Generated from the frontend's own lucide-static/icon-nodes.json (the
# actual source of truth for what LucideIcon.vue can render) - re-run the
# generation script whenever that package is upgraded, since new Lucide
# releases do add/rename icons.
with open(os.path.join(os.path.dirname(__file__), "lucide_icon_names.json")) as f:
	VALID_LUCIDE_ICONS = set(json.load(f))

# Known name collisions between Frappe's non-Lucide icon sets and a
# similarly-themed Lucide icon - picking the wrong set's tile in Desk is an
# easy mistake to make since the picker doesn't label sets at all. Mapped to
# the Lucide equivalent rather than just rejecting outright, so the admin's
# actual intent ("I want a support/help icon") still comes through.
ICON_ALIASES = {
	"support": "life-buoy",
}


def valid_icon(icon):
	"""An icon value safe to hand to LucideIcon.vue - aliased or passed
	through if it's a real Lucide name, otherwise None so callers fall
	through to their own next fallback instead of shipping a blank icon."""
	if not icon:
		return None
	icon = ICON_ALIASES.get(icon, icon)
	return icon if icon in VALID_LUCIDE_ICONS else None
