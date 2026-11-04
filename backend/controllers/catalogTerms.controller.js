const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const Product = require("../models/Product");

/** Product string-list fields managed as catalogue terms. */
const FIELDS = { collections: "collections", tags: "tags", occasions: "occasions" };

const fieldOf = (kind) => {
  const field = FIELDS[kind];
  if (!field) throw new ApiError(400, "kind must be collections, tags or occasions");
  return field;
};

// @desc    Every collection / tag / occasion with its product count
// @route   GET /api/v1/admin/catalog-terms/:kind
// @access  Private/Admin
const listTerms = asyncHandler(async (req, res) => {
  const field = fieldOf(req.params.kind);
  const terms = await Product.aggregate([
    { $match: { isDeleted: false } },
    { $unwind: `$${field}` },
    { $match: { [field]: { $nin: ["", null] } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 }, published: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } } } },
    { $sort: { count: -1, _id: 1 } },
  ]);
  sendResponse(res, 200, { terms: terms.map((t) => ({ name: t._id, count: t.count, published: t.published })) }, "Terms fetched");
});

// @desc    Rename (or merge into an existing name) a term on every product
// @route   PATCH /api/v1/admin/catalog-terms/:kind   body: { from, to }
// @access  Private/Admin
const renameTerm = asyncHandler(async (req, res) => {
  const field = fieldOf(req.params.kind);
  const from = String(req.body?.from || "").trim();
  const to = String(req.body?.to || "").trim().slice(0, 80);
  if (!from || !to) throw new ApiError(400, "Both the current and the new name are required");
  if (from === to) throw new ApiError(400, "The new name is the same");
  // Add the new name, then drop the old one (merges cleanly when the new name already exists).
  const added = await Product.updateMany({ [field]: from }, { $addToSet: { [field]: to } });
  await Product.updateMany({ [field]: from }, { $pull: { [field]: from } });
  sendResponse(res, 200, { products: added.matchedCount }, `Renamed on ${added.matchedCount} product(s)`);
});

// @desc    Remove a term from every product
// @route   DELETE /api/v1/admin/catalog-terms/:kind/:name
// @access  Private/Admin
const deleteTerm = asyncHandler(async (req, res) => {
  const field = fieldOf(req.params.kind);
  const name = decodeURIComponent(req.params.name);
  const result = await Product.updateMany({ [field]: name }, { $pull: { [field]: name } });
  sendResponse(res, 200, { products: result.modifiedCount }, `Removed from ${result.modifiedCount} product(s)`);
});

// @desc    Add a term to many products
// @route   POST /api/v1/admin/catalog-terms/:kind/assign   body: { name, productIds: [] }
// @access  Private/Admin
const assignTerm = asyncHandler(async (req, res) => {
  const field = fieldOf(req.params.kind);
  const name = String(req.body?.name || "").trim().slice(0, 80);
  const ids = (Array.isArray(req.body?.productIds) ? req.body.productIds : []).slice(0, 500);
  if (!name || !ids.length) throw new ApiError(400, "A name and at least one product are required");
  const result = await Product.updateMany({ _id: { $in: ids }, isDeleted: false }, { $addToSet: { [field]: name } });
  sendResponse(res, 200, { products: result.modifiedCount }, `Added to ${result.modifiedCount} product(s)`);
});

module.exports = { listTerms, renameTerm, deleteTerm, assignTerm };
