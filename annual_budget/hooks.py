app_name = "annual_budget"
app_title = "Annual Budget MIS"
app_publisher = "Augustin Moses"
app_description = "A custom app to manage and track annual budget allocations"
app_email = "tech4socialsector@azimpremjifoundation.org"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
add_to_apps_screen = [
	{
		"name": "annual_budget",
		"logo": "/assets/annual_budget/frontend/favicon.png",
		"title": "Annual Budget MIS",
		"route": "/annual_budget",
	}
]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/annual_budget/css/annual_budget.css"
app_include_js = "/assets/annual_budget/js/response_decrypt.bundle.js"

# include js, css files in header of web template
# web_include_css = "/assets/annual_budget/css/annual_budget.css"
# web_include_js = "/assets/annual_budget/js/annual_budget.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "annual_budget/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "annual_budget/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Website Route Rules
# --------------------
# Client-side routes for the Vue app (frontend/) all render the same
# www/annual_budget.html shell; vue-router then handles the sub-path in the
# browser.

website_route_rules = [
	{"from_route": "/annual_budget/<path:app_path>", "to_route": "annual_budget"},
]

# Serves the built service worker (and its workbox chunk) at
# /annual_budget/sw.js instead of their real build location under
# /assets/annual_budget/frontend/ - a service worker can only control
# paths at-or-below wherever it's served from. Runs before
# website_route_rules is even consulted, so it isn't shadowed by the
# catch-all above.
page_renderer = ["annual_budget.website.sw_renderer.ServiceWorkerRenderer"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "annual_budget.utils.jinja_methods",
# 	"filters": "annual_budget.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "annual_budget.install.before_install"
# after_install = "annual_budget.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "annual_budget.uninstall.before_uninstall"
# after_uninstall = "annual_budget.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "annual_budget.utils.before_app_install"
# after_app_install = "annual_budget.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "annual_budget.utils.before_app_uninstall"
# after_app_uninstall = "annual_budget.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "annual_budget.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

scheduler_events = {
	"hourly": [
		"annual_budget.tasks.expire_testing_mode"
	],
}

# Testing
# -------

# before_tests = "annual_budget.install.before_tests"

# Extend DocType Class
# ------------------------------
#
# Specify custom mixins to extend the standard doctype controller.
# extend_doctype_class = {
# 	"Task": "annual_budget.custom.task.CustomTaskMixin"
# }

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "annual_budget.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "annual_budget.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["annual_budget.utils.before_request"]
# after_request = ["annual_budget.utils.after_request"]

# Job Events
# ----------
# before_job = ["annual_budget.utils.before_job"]
# after_job = ["annual_budget.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"annual_budget.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

