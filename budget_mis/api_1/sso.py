import frappe
from frappe.utils import escape_html
from frappe.utils.html_utils import get_icon_html
from frappe.utils.oauth import get_oauth2_authorize_url, get_oauth_keys
from frappe.utils.password import get_decrypted_password


# Lists every enabled Social Login Key provider with a usable client_id/client_secret/base_url, each with its own ready-to-redirect-to auth_url - the JSON-API equivalent of frappe/www/login.py's own context.provider_logins (that file renders server-side Jinja context for Frappe's stock login page, not callable from a Vue SPA, so this mirrors its exact same filtering/field logic as a whitelisted method instead). Plain allow_guest (NOT the guest_api/require_login wrapper used elsewhere in api_1) since this must be callable by a genuinely unauthenticated visitor on the real login page, not just in testing_mode - it returns only public OAuth redirect URLs, no budget data.
@frappe.whitelist(allow_guest=True)
def get_sso_providers(redirect_to=None):
    providers = frappe.get_all(
        "Social Login Key",
        filters={"enable_social_login": 1},
        fields=["name", "client_id", "base_url", "provider_name", "icon"],
        order_by="name",
    )

    result = []
    for provider in providers:
        client_secret = get_decrypted_password(
            "Social Login Key", provider.name, "client_secret", raise_exception=False
        )
        if not client_secret:
            continue

        icon = None
        if provider.icon:
            if provider.provider_name == "Custom":
                icon = get_icon_html(provider.icon, small=True)
            else:
                icon = f"<img src={escape_html(provider.icon)!r} alt={escape_html(provider.provider_name)!r}>"

        if provider.client_id and provider.base_url and get_oauth_keys(provider.name):
            result.append({
                "name": provider.name,
                "provider_name": provider.provider_name,
                "auth_url": get_oauth2_authorize_url(provider.name, redirect_to or ""),
                "icon": icon,
            })

    return result
