const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const User = require("../models/User");
const Role = require("../models/Role");
const { RESOURCES, ACTIONS } = require("../constants/permissions");

/** Validates a `customPermissions` payload the same way role.controller.js validates a role's `permissions`. */
const validateCustomPermissions = (customPermissions) => {
  if (customPermissions === undefined) return;
  if (!Array.isArray(customPermissions)) {
    throw new ApiError(400, "customPermissions must be an array");
  }
  for (const entry of customPermissions) {
    if (!RESOURCES.includes(entry.resource)) {
      throw new ApiError(400, `Unknown resource: ${entry.resource}`);
    }
    if (!Array.isArray(entry.actions) || entry.actions.some((a) => !ACTIONS.includes(a))) {
      throw new ApiError(400, `Invalid actions for resource ${entry.resource}`);
    }
  }
};

// @desc    List admin-panel staff accounts (role: 'admin'), with their assigned role
// @route   GET /api/v1/staff
// @access  Private/Admin (Users:View)
const getStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: "admin" })
    .select("name email mobile isActive roleRef customPermissions createdAt")
    .populate("roleRef", "name slug isSuperAdmin")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, { staff }, "Staff fetched successfully");
});

// @desc    Get a single staff account
// @route   GET /api/v1/staff/:id
// @access  Private/Admin (Users:View)
const getStaffById = asyncHandler(async (req, res) => {
  const staff = await User.findOne({ _id: req.params.id, role: "admin" }).populate(
    "roleRef",
    "name slug isSuperAdmin permissions",
  );
  if (!staff) throw new ApiError(404, "Staff account not found");
  sendResponse(res, 200, { staff }, "Staff account fetched successfully");
});

// @desc    Create a new staff (admin-panel) account and assign it a role
// @route   POST /api/v1/staff
// @access  Private/Admin (Users:Create)
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, mobile, roleRef, customPermissions } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "name, email and password are required");
  }
  if (roleRef && !(await Role.exists({ _id: roleRef }))) {
    throw new ApiError(400, "Invalid roleRef");
  }
  validateCustomPermissions(customPermissions);

  const staff = await User.create({
    name,
    email,
    password,
    mobile,
    role: "admin",
    isVerified: true,
    roleRef: roleRef || null,
    customPermissions: customPermissions || [],
  });

  const result = staff.toObject();
  delete result.password;
  sendResponse(res, 201, { staff: result }, "Staff account created successfully");
});

// @desc    Update a staff account's role assignment, custom permissions, or active status
// @route   PUT /api/v1/staff/:id
// @access  Private/Admin (Users:Edit)
const updateStaff = asyncHandler(async (req, res) => {
  const staff = await User.findOne({ _id: req.params.id, role: "admin" });
  if (!staff) throw new ApiError(404, "Staff account not found");

  const { name, mobile, roleRef, customPermissions, isActive } = req.body;

  if (roleRef !== undefined) {
    if (roleRef && !(await Role.exists({ _id: roleRef }))) {
      throw new ApiError(400, "Invalid roleRef");
    }
    staff.roleRef = roleRef || null;
  }
  if (customPermissions !== undefined) {
    validateCustomPermissions(customPermissions);
    staff.customPermissions = customPermissions;
  }
  if (name !== undefined) staff.name = name;
  if (mobile !== undefined) staff.mobile = mobile;
  if (isActive !== undefined) {
    if (String(staff._id) === String(req.user._id) && !isActive) {
      throw new ApiError(400, "You cannot deactivate your own account");
    }
    staff.isActive = isActive;
  }

  await staff.save();

  const result = staff.toObject();
  delete result.password;
  sendResponse(res, 200, { staff: result }, "Staff account updated successfully");
});

// @desc    Delete a staff account
// @route   DELETE /api/v1/staff/:id
// @access  Private/Admin (Users:Delete)
const deleteStaff = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  const staff = await User.findOne({ _id: req.params.id, role: "admin" }).populate(
    "roleRef",
    "isSuperAdmin",
  );
  if (!staff) throw new ApiError(404, "Staff account not found");

  if (staff.roleRef?.isSuperAdmin) {
    const otherSuperAdmins = await User.countDocuments({
      role: "admin",
      _id: { $ne: staff._id },
      roleRef: staff.roleRef._id,
    });
    if (otherSuperAdmins === 0) {
      throw new ApiError(400, "Cannot delete the last remaining Super Admin");
    }
  }

  await staff.deleteOne();
  sendResponse(res, 200, {}, "Staff account deleted successfully");
});

module.exports = { getStaff, getStaffById, createStaff, updateStaff, deleteStaff };
