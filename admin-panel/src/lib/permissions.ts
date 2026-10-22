import { useAuthStore } from "@/stores/auth.store";
import type { PermissionAction, PermissionEntry, PermissionResource } from "@/types";

// Mirrors backend/constants/permissions.js — the two must stay in sync
// (adding a resource/action is a backend code change either way, since it
// implies new routes to actually gate).
export const RESOURCES: PermissionResource[] = [
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

export const ACTIONS: PermissionAction[] = ["View", "Create", "Edit", "Delete", "Export", "Approve"];

const buildMatrix = (entries: PermissionEntry[] = []) => {
  const matrix = new Map<string, Set<string>>();
  for (const { resource, actions } of entries) {
    if (!matrix.has(resource)) matrix.set(resource, new Set());
    for (const action of actions || []) matrix.get(resource)!.add(action);
  }
  return matrix;
};

/**
 * Mirrors services/role.service.js#resolveEffectivePermissions on the
 * frontend: this is a UX convenience only (hides menus/buttons the user
 * can't use) — the backend's own requirePermission(resource, action) is
 * still the real enforcement, so a mismatch here is never a security hole.
 */
export function hasPermission(resource: PermissionResource, action: PermissionAction): boolean {
  const user = useAuthStore.getState().user;
  if (!user || user.role !== "admin") return false;

  const role = user.roleRef && typeof user.roleRef === "object" ? user.roleRef : null;

  // No role assigned yet (every admin created before this feature existed) = unrestricted.
  if (!user.roleRef) return true;
  if (role?.isSuperAdmin) return true;

  const matrix = buildMatrix([...(role?.permissions || []), ...(user.customPermissions || [])]);
  return matrix.get(resource)?.has(action) ?? false;
}

/** True if the current admin can View (or better) the given resource — used to filter the sidebar. */
export function canView(resource: PermissionResource): boolean {
  return hasPermission(resource, "View");
}
