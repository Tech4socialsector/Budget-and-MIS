import frappe


# doc_events on_update/on_trash hook target (see hooks.py) for "Overview
# number cards settings" - drops get_combination_table_settings_test's own
# short-TTL cache (api/number_card_settings.py) immediately whenever any
# card's settings change, rather than leaving a stale, already-wrong result
# (another admin's unsaved edit) cached for up to its own TTL. Keyed by
# table_name_filter, so there's no single key to target - every variant is
# cleared via a wildcard pattern.
#
# Also drops every api/foundation_consolidated.py *_page_data cache entry
# (budget_mis:foundation_consolidated:...) - each of those combined
# responses is itself built on top of get_combination_table_settings_1/_test,
# so a stale card-settings edit was previously still visible through
# Foundation Consolidated's own tabs for up to that cache's own TTL (same
# window as the ERP actuals cache, commonly 15 minutes) even though the
# settings list itself already showed the new value - confirmed as a real,
# not just theoretical, invalidation gap.
def clear_combination_table_settings_cache(doc=None, method=None):
    frappe.cache().delete_keys("budget_mis:combination_table_settings:*")
    frappe.cache().delete_keys("budget_mis:foundation_consolidated:*")


# doc_events on_update/on_trash hook target (see hooks.py) for "AI Assistant
# Guide" - ai/guide_builder.py's regenerate_* functions and ai/guide_review.py's
# approve/reject already each explicitly delete_value this same key right
# after their own save(), but those bespoke write paths aren't the only way
# this doctype can be edited - an admin opening "AI Assistant Guide" directly
# in Desk and editing a point's wording or toggling is_active bypassed all
# three of those call sites, since nothing was wired to the doctype's own
# save/delete events. GUIDE_CACHE_SECONDS is only 60s, so the practical
# impact was always small, but the gap was real: this closes it the same way
# every other admin-edited master doctype backing a cache already is.
def clear_ai_guide_cache(doc=None, method=None):
    frappe.cache().delete_value("budget_mis_ai_assistant_guide")
