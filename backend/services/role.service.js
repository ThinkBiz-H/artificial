const Role = require("../models/Role");
const User = require("../models/User");
const logger = require("../utils/logger");
const { RESOURCES, fullAccessPermissions } = require("../constants/permissions");

/**
 * Default role catalog. Seeded once (see seedDefaultRoles below, called from
 * seed/roleSeeder.js and lazily from role.controller.js) and then live in
 * MongoDB like any other role — a Super Admin can edit their grants freely
 * afterward. `isSystem` only blocks deleting/renaming them, not editing.
 */
const DEFAULT_ROLES = [
  {
    name: "Super Admin",
    slug: "super-admin",
    description: "Unrestricted access to every resource. Bypasses all permission checks.",
    isSuperAdmin: true,
    isSystem: true,
    permissions: [],
  },
  {
    name: "Admin",
    slug: "admin",
    description: "Full access to every admin-panel resource.",
    isSystem: true,
    permissions: fullAccessPermissions(),
  },
  {
    name: "Manager",
    slug: "manager",
    description: "Broad operational oversight — view/edit everywhere, no deletes, no system settings changes.",
    isSystem: true,
    permissions: RESOURCES.map((resource) => ({
      resource,
      actions: ["Users", "Roles", "Settings"].includes(resource)
        ? ["View"]
        : ["View", "Create", "Edit", "Export", "Approve"],
    })),
  },
  {
    name: "Order Manager",
    slug: "order-manager",
    description: "Manages orders end-to-end, plus the customer/coupon/inventory context needed to do so.",
    isSystem: true,
    permissions: [
      { resource: "Dashboard", actions: ["View"] },
      { resource: "Orders", actions: ["View", "Create", "Edit", "Delete", "Export", "Approve"] },
      { resource: "Customers", actions: ["View", "Edit", "Export"] },
      { resource: "Coupons", actions: ["View", "Create", "Edit", "Export"] },
      { resource: "Inventory", actions: ["View"] },
      { resource: "Reports", actions: ["View", "Export"] },
    ],
  },
  {
    name: "Product Manager",
    slug: "product-manager",
    description: "Owns the product catalog: products, categories, brands and their reviews.",
    isSystem: true,
    permissions: [
      { resource: "Dashboard", actions: ["View"] },
      { resource: "Products", actions: ["View", "Create", "Edit", "Delete", "Export", "Approve"] },
      { resource: "Categories", actions: ["View", "Create", "Edit", "Delete", "Export"] },
      { resource: "Brands", actions: ["View", "Create", "Edit", "Delete", "Export"] },
      { resource: "Inventory", actions: ["View", "Edit"] },
      { resource: "Reviews", actions: ["View", "Edit", "Delete", "Approve"] },
    ],
  },
  {
    name: "Inventory Manager",
    slug: "inventory-manager",
    description: "Owns stock levels and warehouses.",
    isSystem: true,
    permissions: [
      { resource: "Dashboard", actions: ["View"] },
      { resource: "Inventory", actions: ["View", "Create", "Edit", "Delete", "Export", "Approve"] },
      { resource: "Warehouse", actions: ["View", "Create", "Edit", "Delete", "Export"] },
      { resource: "Products", actions: ["View", "Edit"] },
      { resource: "Reports", actions: ["View", "Export"] },
    ],
  },
  {
    name: "Support",
    slug: "support",
    description: "Front-line customer support — can look up and update orders/customers, moderate reviews.",
    isSystem: true,
    permissions: [
      { resource: "Dashboard", actions: ["View"] },
      { resource: "Orders", actions: ["View", "Edit"] },
      { resource: "Customers", actions: ["View", "Edit"] },
      { resource: "Reviews", actions: ["View", "Edit", "Approve"] },
      { resource: "Notifications", actions: ["View", "Create"] },
    ],
  },
  {
    name: "Staff",
    slug: "staff",
    description: "Minimal baseline access — grant individual permissions per staff member as needed.",
    isSystem: true,
    permissions: [{ resource: "Dashboard", actions: ["View"] }],
  },
];

/** Idempotent — creates any of the 8 default roles that don't already exist by slug. Never overwrites an existing (possibly admin-edited) role. */
const seedDefaultRoles = async () => {
  let created = 0;
  for (const def of DEFAULT_ROLES) {
    const exists = await Role.exists({ slug: def.slug });
    if (!exists) {
      await Role.create(def);
      created += 1;
    }
  }
  if (created > 0) {
    logger.info(`Seeded ${created} default role(s)`);
  }
  return created;
};

/** True once at least one role exists — used to lazily seed on first real use if the manual seed script was never run. */
const ensureRolesSeeded = async () => {
  const count = await Role.estimatedDocumentCount();
  if (count === 0) await seedDefaultRoles();
};

/**
 * Merges a role's base grants with a user's `customPermissions` overrides
 * (additive — a custom entry adds actions on top of, or grants access to a
 * resource beyond, whatever the role already allows; it never removes a
 * role-granted action). Returns a Map<resource, Set<action>>.
 */
const buildPermissionMatrix = (rolePermissions = [], customPermissions = []) => {
  const matrix = new Map();
  for (const { resource, actions } of [...rolePermissions, ...customPermissions]) {
    if (!matrix.has(resource)) matrix.set(resource, new Set());
    for (const action of actions || []) matrix.get(resource).add(action);
  }
  return matrix;
};

/**
 * Resolves what a user can actually do — the single function both the new
 * granular requirePermission(resource, action) middleware and the admin
 * panel's `/admin/me/permissions`-style needs go through.
 *
 * Backward-compat, by design:
 *  - Not an admin at all -> no access (caller should already gate on role==='admin').
 *  - No `roleRef` assigned (every admin created before this feature existed,
 *    and any admin a Super Admin hasn't gotten around to assigning a role
 *    yet) -> unrestricted, exactly like the pre-existing legacy
 *    `permissions: []` = full access convention. This is what makes rollout
 *    of this feature non-breaking for every existing admin account.
 *  - `roleRef` assigned -> role's matrix, merged with `customPermissions`.
 */
const resolveEffectivePermissions = async (user) => {
  if (!user || user.role !== "admin") {
    return { isSuperAdmin: false, unrestricted: false, matrix: new Map() };
  }

  if (!user.roleRef) {
    return { isSuperAdmin: false, unrestricted: true, matrix: new Map() };
  }

  const role = user.roleRef.permissions
    ? user.roleRef // already populated by the caller
    : await Role.findById(user.roleRef);

  if (!role) {
    // Dangling roleRef (role deleted out from under the user) — fail safe
    // to unrestricted-admin rather than locking them out entirely, same
    // posture as "no role assigned yet".
    return { isSuperAdmin: false, unrestricted: true, matrix: new Map() };
  }

  if (role.isSuperAdmin) {
    return { isSuperAdmin: true, unrestricted: true, matrix: new Map() };
  }

  return {
    isSuperAdmin: false,
    unrestricted: false,
    matrix: buildPermissionMatrix(role.permissions, user.customPermissions),
  };
};

const hasPermission = (effective, resource, action) =>
  effective.isSuperAdmin ||
  effective.unrestricted ||
  !!effective.matrix.get(resource)?.has(action);

module.exports = {
  DEFAULT_ROLES,
  seedDefaultRoles,
  ensureRolesSeeded,
  buildPermissionMatrix,
  resolveEffectivePermissions,
  hasPermission,
};
