/**
 * The full RBAC permission matrix: every resource area in the admin panel
 * crossed with the actions that can be granted on it. Shared by the Role
 * model, the granular requirePermission(resource, action) middleware, the
 * role seeder, and the admin-panel (which mirrors this list to render the
 * permission-matrix editor and to filter the sidebar).
 */
const RESOURCES = [
  "Dashboard",
  "Products",
  "Categories",
  "Brands",
  "Orders",
  "Customers",
  "Coupons",
  "Inventory",
  "Reviews",
  "Reports",
  "Settings",
  "Users",
  "Roles",
  "Warehouse",
  "Notifications",
  "Blogs",
];

const ACTIONS = ["View", "Create", "Edit", "Delete", "Export", "Approve"];

const ALL_ACTIONS = ACTIONS;

/** Convenience: `{ resource, actions: ACTIONS }` for every resource — a full-access grant list. */
const fullAccessPermissions = () =>
  RESOURCES.map((resource) => ({ resource, actions: [...ALL_ACTIONS] }));

module.exports = { RESOURCES, ACTIONS, fullAccessPermissions };
