const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const User = require('../models/User');
const CustomerLedger = require('../models/CustomerLedger');
const ApiFeatures = require('../utils/ApiFeatures');
const { PERMISSIONS } = require('../middlewares/permission.middleware');

// @desc    Get all users (admin)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  // ?verification=pending → businessVerification.status (dotted keys are stripped by mongo-sanitize).
  if (['unverified', 'pending', 'verified', 'rejected'].includes(req.query.verification)) {
    req.query['businessVerification.status'] = req.query.verification;
  }
  delete req.query.verification;
  const baseQuery = User.find({ role: 'user' });
  const features = new ApiFeatures(baseQuery, req.query).search(['name', 'email']).filter().sort().limitFields();

  // Same search + filters as the page, so tabs and paging show the right totals.
  const total = await new ApiFeatures(User.find({ role: 'user' }), req.query).search(['name', 'email']).filter().query.countDocuments();
  features.paginate();

  const users = await features.query;

  sendResponse(
    res,
    200,
    { users, pagination: { total, page: features.pagination.page, limit: features.pagination.limit } },
    'Users fetched successfully'
  );
});

// @desc    Get single user by id
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  sendResponse(res, 200, { user }, 'User fetched successfully');
});

// @desc    Activate/Deactivate a user account
// @route   PATCH /api/v1/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  sendResponse(res, 200, { user }, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
});

const CUSTOMER_TYPES = ['retailer', 'wholesale', 'dealer', 'distributor', 'retail'];

// @desc    Business verification + credit limit for a customer
// @route   PATCH /api/v1/admin/users/:id/business   body: { verification?, note?, creditLimit?, businessName?, gstin? }
// @access  Private/Admin
const updateCustomerBusiness = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'user' });
  if (!user) throw new ApiError(404, 'Customer not found');
  const { verification, note, creditLimit, businessName, gstin } = req.body || {};
  if (verification !== undefined) {
    if (!['unverified', 'pending', 'verified', 'rejected'].includes(verification)) throw new ApiError(400, 'Invalid verification status');
    user.businessVerification.status = verification;
    user.businessVerification.verifiedAt = verification === 'verified' ? new Date() : null;
  }
  if (note !== undefined) user.businessVerification.note = String(note).slice(0, 500);
  if (creditLimit !== undefined) {
    const n = Number(creditLimit);
    if (!Number.isFinite(n) || n < 0) throw new ApiError(400, 'Credit limit must be 0 or more');
    user.creditLimit = Math.round(n);
  }
  if (businessName !== undefined) user.businessProfile.name = String(businessName).trim().slice(0, 160);
  if (gstin !== undefined) {
    const g = String(gstin).trim().toUpperCase();
    if (g && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g)) throw new ApiError(400, 'Enter a valid 15-character GSTIN');
    user.businessProfile.gstin = g;
  }
  await user.save({ validateBeforeSave: false });
  sendResponse(res, 200, { user }, 'Business details updated');
});

// @desc    Credit / debit a customer's wallet (₹) or reward points
// @route   POST /api/v1/admin/users/:id/ledger   body: { kind: "wallet" | "points", amount (+/−), note }
// @access  Private/Admin
const adjustCustomerLedger = asyncHandler(async (req, res) => {
  const { kind, note } = req.body || {};
  const amount = Number(req.body?.amount);
  if (!['wallet', 'points'].includes(kind)) throw new ApiError(400, 'kind must be wallet or points');
  if (!Number.isFinite(amount) || amount === 0) throw new ApiError(400, 'Enter a non-zero amount');
  if (!String(note || '').trim()) throw new ApiError(400, 'Add a note explaining the adjustment');
  const field = kind === 'wallet' ? 'walletBalance' : 'rewardPoints';
  const value = kind === 'wallet' ? Math.round(amount * 100) / 100 : Math.round(amount);
  // Atomic: never lets a debit take the balance below zero.
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'user', ...(value < 0 ? { [field]: { $gte: -value } } : {}) },
    { $inc: { [field]: value } },
    { new: true },
  );
  if (!user) {
    const exists = await User.exists({ _id: req.params.id, role: 'user' });
    throw new ApiError(exists ? 400 : 404, exists ? 'Not enough balance for this debit' : 'Customer not found');
  }
  const entry = await CustomerLedger.create({ user: user._id, kind, amount: value, balanceAfter: user[field], note: String(note).trim(), performedBy: req.user._id });
  sendResponse(res, 201, { entry, walletBalance: user.walletBalance, rewardPoints: user.rewardPoints }, 'Balance updated');
});

// @desc    Wallet + points history for a customer
// @route   GET /api/v1/admin/users/:id/ledger?kind=
// @access  Private/Admin
const getCustomerLedger = asyncHandler(async (req, res) => {
  const filter = { user: req.params.id };
  if (['wallet', 'points'].includes(req.query.kind)) filter.kind = req.query.kind;
  const entries = await CustomerLedger.find(filter).sort('-createdAt').limit(100).populate('performedBy', 'name').lean();
  sendResponse(res, 200, { entries }, 'Ledger fetched');
});

// @desc    Set a customer's B2B account type (retailer / wholesale / dealer / distributor)
// @route   PATCH /api/v1/admin/users/:id/customer-type
// @access  Private/Admin
const updateCustomerType = asyncHandler(async (req, res) => {
  const { customerType } = req.body;
  if (!CUSTOMER_TYPES.includes(customerType)) throw new ApiError(400, `customerType must be one of: ${CUSTOMER_TYPES.join(', ')}`);
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'user' }, { customerType }, { new: true });
  if (!user) throw new ApiError(404, 'Customer not found');
  sendResponse(res, 200, { user }, `Customer is now a ${customerType} account`);
});

// @desc    Set an admin's granular permissions — [] or omitted means
//          unrestricted (full admin access, the default for every admin
//          created before this feature existed)
// @route   PATCH /api/v1/admin/users/:id/permissions
// @access  Private/Admin
const updateUserPermissions = asyncHandler(async (req, res) => {
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) throw new ApiError(400, 'permissions must be an array');

  const invalid = permissions.filter((p) => !PERMISSIONS.includes(p));
  if (invalid.length > 0) throw new ApiError(400, `Unknown permission(s): ${invalid.join(', ')}`);

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role !== 'admin') throw new ApiError(400, 'Permissions only apply to admin accounts');

  user.permissions = permissions;
  await user.save();
  sendResponse(res, 200, { user }, 'Permissions updated successfully');
});

// @desc    Delete a user (admin)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  sendResponse(res, 200, {}, 'User deleted successfully');
});

module.exports = { getUsers, getUserById, updateUserStatus, updateCustomerType, updateCustomerBusiness, adjustCustomerLedger, getCustomerLedger, updateUserPermissions, deleteUser };
