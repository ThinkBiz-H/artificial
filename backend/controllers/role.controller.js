const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const Role = require("../models/Role");
const User = require("../models/User");
const { RESOURCES, ACTIONS } = require("../constants/permissions");
const { ensureRolesSeeded } = require("../services/role.service");

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Validates a `permissions` payload against the known resource/action catalog. */
const validatePermissions = (permissions) => {
  if (!Array.isArray(permissions)) {
    throw new ApiError(400, "permissions must be an array");
  }
  for (const entry of permissions) {
    if (!RESOURCES.includes(entry.resource)) {
      throw new ApiError(400, `Unknown resource: ${entry.resource}`);
    }
    if (!Array.isArray(entry.actions) || entry.actions.some((a) => !ACTIONS.includes(a))) {
      throw new ApiError(400, `Invalid actions for resource ${entry.resource}`);
    }
  }
};

// @desc    List every role (with a live count of assigned users)
// @route   GET /api/v1/roles
// @access  Private/Admin (Roles:View)
const getRoles = asyncHandler(async (req, res) => {
  await ensureRolesSeeded();
  const roles = await Role.find().sort({ isSystem: -1, name: 1 }).lean();
  const counts = await User.aggregate([
    { $match: { roleRef: { $ne: null } } },
    { $group: { _id: "$roleRef", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const withCounts = roles.map((r) => ({ ...r, userCount: countMap.get(String(r._id)) || 0 }));

  sendResponse(res, 200, { roles: withCounts, resources: RESOURCES, actions: ACTIONS }, "Roles fetched successfully");
});

// @desc    Get a single role
// @route   GET /api/v1/roles/:id
// @access  Private/Admin (Roles:View)
const getRoleById = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, "Role not found");
  sendResponse(res, 200, { role }, "Role fetched successfully");
});

// @desc    Create a custom role (Super Admin — or anyone granted Roles:Create)
// @route   POST /api/v1/roles
// @access  Private/Admin (Roles:Create)
const createRole = asyncHandler(async (req, res) => {
  const { name, description, permissions = [] } = req.body;
  if (!name || !name.trim()) throw new ApiError(400, "Role name is required");
  validatePermissions(permissions);

  const slug = slugify(name);
  if (await Role.exists({ slug })) {
    throw new ApiError(409, `A role named "${name}" already exists`);
  }

  const role = await Role.create({
    name: name.trim(),
    slug,
    description: description || "",
    permissions,
    isSystem: false,
    isSuperAdmin: false,
  });

  sendResponse(res, 201, { role }, "Role created successfully");
});

// @desc    Update a role's name/description/permissions
// @route   PUT /api/v1/roles/:id
// @access  Private/Admin (Roles:Edit)
const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, "Role not found");

  const { name, description, permissions } = req.body;

  // System roles (the 8 defaults) keep their name/slug stable — the admin
  // panel and default grants are written assuming these identities exist —
  // but a Super Admin can still freely edit what they grant.
  if (name !== undefined && !role.isSystem) {
    if (!name.trim()) throw new ApiError(400, "Role name cannot be empty");
    const slug = slugify(name);
    if (slug !== role.slug && (await Role.exists({ slug }))) {
      throw new ApiError(409, `A role named "${name}" already exists`);
    }
    role.name = name.trim();
    role.slug = slug;
  }

  if (description !== undefined) role.description = description;

  if (permissions !== undefined) {
    if (role.isSuperAdmin) {
      throw new ApiError(400, "Super Admin always has full access — its permissions cannot be edited");
    }
    validatePermissions(permissions);
    role.permissions = permissions;
  }

  await role.save();
  sendResponse(res, 200, { role }, "Role updated successfully");
});

// @desc    Delete a custom role (system roles cannot be deleted; a role with
//          assigned users cannot be deleted until they're reassigned)
// @route   DELETE /api/v1/roles/:id
// @access  Private/Admin (Roles:Delete)
const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, "Role not found");
  if (role.isSystem) throw new ApiError(400, "System roles cannot be deleted");

  const assignedCount = await User.countDocuments({ roleRef: role._id });
  if (assignedCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete "${role.name}" — ${assignedCount} user(s) are still assigned to it. Reassign them first.`,
    );
  }

  await role.deleteOne();
  sendResponse(res, 200, {}, "Role deleted successfully");
});

module.exports = { getRoles, getRoleById, createRole, updateRole, deleteRole };
