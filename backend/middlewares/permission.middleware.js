const ApiError = require('../utils/ApiError');
const { RESOURCES, ACTIONS } = require('../constants/permissions');
const { resolveEffectivePermissions, hasPermission } = require('../services/role.service');

/**
 * The full catalog of grantable permissions. Not a separate collection —
 * deliberately just a fixed list, since these map 1:1 to admin-panel
 * feature areas and adding a new one is a code change anyway (a new route
 * group), not something an admin would define dynamically.
 */
const PERMISSIONS = [
  'manage_products',
  'manage_categories',
  'manage_orders',
  'manage_coupons',
  'manage_inventory',
  'manage_cms',
  'manage_blog',
  'manage_media',
  'manage_settings',
  'manage_users',
  'view_reports',
  'manage_notifications',
];

/**
 * Legacy check — a single flat permission string against `user.permissions`.
 * Unchanged behavior for every existing call site (admin.routes.js), with
 * one addition: a Super Admin (Role.isSuperAdmin via `roleRef`) now bypasses
 * this check too, not just the granular requireResourcePermission below.
 * `Role.isSuperAdmin` is the single source of truth for "bypasses every
 * permission check" — before this fix, a Super Admin's `roleRef` was only
 * ever consulted by the granular path, so an account assigned Super Admin
 * could still be blocked by any route still using the legacy single-string
 * form. Every other account's behavior is unchanged.
 */
const requireLegacyPermission = (permission) => async (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Not authenticated'));
  if (req.user.role !== 'admin') return next(new ApiError(403, 'Admin access required'));

  try {
    const effective = await resolveEffectivePermissions(req.user);
    if (effective.isSuperAdmin) return next();
  } catch (err) {
    return next(err);
  }

  const hasRestrictions = Array.isArray(req.user.permissions) && req.user.permissions.length > 0;
  if (!hasRestrictions) return next(); // unrestricted admin — full access, unchanged from before this feature

  if (!req.user.permissions.includes(permission)) {
    return next(new ApiError(403, `Missing required permission: ${permission}`));
  }
  next();
};

/**
 * Granular RBAC check — `requirePermission('Orders', 'Edit')`. Runs AFTER
 * authorize('admin') as an additional, narrowing check, same posture as the
 * legacy middleware above: it never widens access, only restricts it.
 *
 * A Super Admin (Role.isSuperAdmin) always passes. An admin with no `roleRef`
 * assigned (every admin created before this feature existed) is treated as
 * unrestricted — same "empty restrictions = full access" convention the
 * legacy flat-permission middleware already uses — so rolling this out never
 * locks any existing admin account out of anything.
 */
const requireResourcePermission = (resource, action) => {
  if (!RESOURCES.includes(resource)) {
    throw new Error(`requirePermission: unknown resource "${resource}"`);
  }
  if (!ACTIONS.includes(action)) {
    throw new Error(`requirePermission: unknown action "${action}"`);
  }

  return async (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Not authenticated'));
    if (req.user.role !== 'admin') return next(new ApiError(403, 'Admin access required'));

    try {
      const effective = await resolveEffectivePermissions(req.user);
      if (!hasPermission(effective, resource, action)) {
        return next(new ApiError(403, `Missing permission: ${action} on ${resource}`));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Single export used everywhere — dispatches on arity so existing call sites
 * (`requirePermission('manage_settings')`) keep working byte-for-byte, while
 * new call sites use `requirePermission('Orders', 'Edit')` for the granular
 * resource+action check.
 */
const requirePermission = (resourceOrLegacy, action) =>
  action === undefined
    ? requireLegacyPermission(resourceOrLegacy)
    : requireResourcePermission(resourceOrLegacy, action);

module.exports = { PERMISSIONS, requirePermission };
