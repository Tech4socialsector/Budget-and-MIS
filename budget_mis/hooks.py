app_name = "budget_mis"
app_title = "Budget MIS"
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
		"name": "budget_mis",
		"logo": "/assets/budget_mis/frontend/favicon.png",
		"title": "Budget MIS",
		"route": "/budget-mis",
	}
]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/budget_mis/css/budget_mis.css"
app_include_js = "/assets/budget_mis/js/response_decrypt.bundle.js"

# include js, css files in header of web template
# web_include_css = "/assets/budget_mis/css/budget_mis.css"
# web_include_js = "/assets/budget_mis/js/budget_mis.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "budget_mis/public/scss/website"

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
# app_include_icons = "budget_mis/public/icons.svg"

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
# www/budget-mis.html shell; vue-router then handles the sub-path in the
# browser.

# The sidebar/Home-tile module config (Settings & Master Data / Budget
# Reports / MIS Report and their items) - built up this session via direct
# bench console scripts, so it only ever existed in this site's database.
# Exporting it as a fixture writes it to
# budget_mis/fixtures/app_module_setting.json, so it ships with the app
# itself (git-tracked, applied automatically by `bench migrate` on any
# other site) instead of needing to be recreated by hand everywhere.
fixtures = ["App Module Setting"]

website_route_rules = [
	{"from_route": "/budget-mis/<path:app_path>", "to_route": "budget-mis"},
]

# Serves the built service worker (and its workbox chunk) at
# /budget-mis/sw.js instead of their real build location under
# /assets/budget_mis/frontend/ - a service worker can only control
# paths at-or-below wherever it's served from. Runs before
# website_route_rules is even consulted, so it isn't shadowed by the
# catch-all above.
page_renderer = ["budget_mis.website.sw_renderer.ServiceWorkerRenderer"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "budget_mis.utils.jinja_methods",
# 	"filters": "budget_mis.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "budget_mis.install.before_install"
# after_install = "budget_mis.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "budget_mis.uninstall.before_uninstall"
# after_uninstall = "budget_mis.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "budget_mis.utils.before_app_install"
# after_app_install = "budget_mis.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "budget_mis.utils.before_app_uninstall"
# after_app_uninstall = "budget_mis.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "budget_mis.notifications.get_notification_config"

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
		"budget_mis.tasks.expire_testing_mode"
	],
}

# Testing
# -------

# before_tests = "budget_mis.install.before_tests"

# Extend DocType Class
# ------------------------------
#
# Specify custom mixins to extend the standard doctype controller.
# extend_doctype_class = {
# 	"Task": "budget_mis.custom.task.CustomTaskMixin"
# }

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "budget_mis.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "budget_mis.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["budget_mis.utils.before_request"]
# after_request = ["budget_mis.utils.after_request"]

# Job Events
# ----------
# before_job = ["budget_mis.utils.before_job"]
# after_job = ["budget_mis.utils.after_job"]

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
# 	"budget_mis.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

