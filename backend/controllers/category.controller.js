const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');
const {
  normalizeParentInput,
  resolveParent,
  reparentCategory,
  assertDeletable,
  getEffectiveAttributeTemplate,
} = require('../services/category.service');
const { invalidate } = require('../services/cache.service');

const parseAttributeTemplate = (raw) => {
  if (raw === undefined) return undefined;
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, 'attributeTemplate must be valid JSON: an array of {key,label,type,options,unit,required}');
  }
};

/** An uploaded file by form field (image / icon / banner). */
const uploadedFile = (req, name) => req.files?.[name]?.[0] || (name === 'image' ? req.file : undefined);

const uploadImage = async (file) => {
  const result = await uploadToCloudinary(file.buffer, 'ecommerce/categories');
  return { url: result.url, publicId: result.publicId };
};

/** SEO arrives as JSON (multipart) or an object; unknown keys are dropped. */
const parseSeo = (raw) => {
  if (raw === undefined) return undefined;
  let seo = raw;
  if (typeof raw === 'string') {
    try {
      seo = JSON.parse(raw);
    } catch {
      throw new ApiError(400, 'seo must be valid JSON: {title, description, keywords}');
    }
  }
  const text = (v, max) => String(v ?? '').trim().slice(0, max);
  return { title: text(seo?.title, 160), description: text(seo?.description, 320), keywords: text(seo?.keywords, 300) };
};

// @desc    Create category (root, or nested under `parent`)
// @route   POST /api/v1/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, shortTitle, description, status, sortOrder } = req.body;
  const parentId = normalizeParentInput(req.body.parent);
  const attributeTemplate = parseAttributeTemplate(req.body.attributeTemplate);

  const parent = await resolveParent(parentId ?? null);

  const [image, icon, banner] = await Promise.all(
    ['image', 'icon', 'banner'].map((name) => (uploadedFile(req, name) ? uploadImage(uploadedFile(req, name)) : undefined)),
  );

  const category = await Category.create({
    name,
    shortTitle,
    description,
    status,
    image,
    icon,
    banner,
    seo: parseSeo(req.body.seo),
    sortOrder: sortOrder || 0,
    // Arrives as a string ("true"/"false") over multipart form-data.
    showInHeader: req.body.showInHeader === undefined ? undefined : req.body.showInHeader === 'true' || req.body.showInHeader === true,
    attributeTemplate,
    parent: parent ? parent._id : null,
    ancestors: parent ? [...parent.ancestors, parent._id] : [],
    level: parent ? parent.ancestors.length + 1 : 0,
  });

  await invalidate('categories:*');
  sendResponse(res, 201, { category }, 'Category created successfully');
});

// @desc    Update category (and re-parent it if `parent` is included and different)
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  for (const name of ['image', 'icon', 'banner']) {
    const file = uploadedFile(req, name);
    if (file) {
      if (category[name]?.publicId) await deleteFromCloudinary(category[name].publicId);
      category[name] = await uploadImage(file);
    } else if (name !== 'image' && req.body[`remove_${name}`] === 'true' && category[name]?.url) {
      // Icon / banner can be cleared from the admin form.
      if (category[name].publicId) await deleteFromCloudinary(category[name].publicId);
      category[name] = { url: '', publicId: '' };
    }
  }

  const seo = parseSeo(req.body.seo);
  if (seo) category.seo = seo;

  ['name', 'shortTitle', 'description', 'status', 'sortOrder'].forEach((field) => {
    if (req.body[field] !== undefined) category[field] = req.body[field];
  });

  // Arrives as a string ("true"/"false") over multipart form-data.
  if (req.body.showInHeader !== undefined) {
    category.showInHeader = req.body.showInHeader === 'true' || req.body.showInHeader === true;
  }

  const attributeTemplate = parseAttributeTemplate(req.body.attributeTemplate);
  if (attributeTemplate !== undefined) category.attributeTemplate = attributeTemplate;

  const parentId = normalizeParentInput(req.body.parent);
  if (parentId !== undefined) {
    const currentParentId = category.parent ? String(category.parent) : null;
    if (parentId !== currentParentId) {
      const newParent = await resolveParent(parentId, category._id);
      await reparentCategory(category, newParent);
      await invalidate('categories:*');
      return sendResponse(res, 200, { category }, 'Category updated and moved successfully');
    }
  }

  await category.save();
  await invalidate('categories:*');
  sendResponse(res, 200, { category }, 'Category updated successfully');
});

// @desc    Delete category (blocked if it has subcategories or products)
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  await assertDeletable(category._id);

  await Promise.all(
    ['image', 'icon', 'banner'].map((name) => (category[name]?.publicId ? deleteFromCloudinary(category[name].publicId) : null)),
  );

  await category.deleteOne();
  await invalidate('categories:*');
  sendResponse(res, 200, {}, 'Category deleted successfully');
});

// @desc    Get categories — flat list (default, same shape as before) or
//          nested tree (?tree=true), optionally scoped to direct children
//          of a given parent (?parent=<id>, or ?parent=root for top-level)
// @route   GET /api/v1/categories
// @access  Public
/**
 * Published-product count per category (direct products only).
 * Used to hide empty categories from the storefront (admin passes all=true).
 */
const directProductCounts = async () => {
  const rows = await Product.aggregate([
    { $match: { isDeleted: false, status: 'active' } },
    { $group: { _id: '$category', n: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.n]));
};

/** Adds productCount (self + descendants) to each node; optionally drops empty branches. */
const withProductCounts = (nodes, counts, prune) =>
  nodes
    .map((node) => {
      const children = withProductCounts(node.children || [], counts, prune);
      const productCount = (counts.get(String(node._id)) || 0) + children.reduce((sum, c) => sum + c.productCount, 0);
      return { ...node, children, productCount };
    })
    .filter((node) => !prune || node.productCount > 0);

const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  // Storefront: only categories with published products. Admin: everything.
  const showAll = req.query.all === 'true';

  if (req.query.tree === 'true') {
    const [tree, counts] = await Promise.all([Category.getTree(filter), directProductCounts()]);
    return sendResponse(res, 200, { categories: withProductCounts(tree, counts, !showAll) }, 'Category tree fetched successfully');
  }

  if (req.query.parent !== undefined) {
    const parentId = normalizeParentInput(req.query.parent);
    filter.parent = parentId; // null = top-level categories only
  }

  const categories = await Category.find(filter).sort({ level: 1, sortOrder: 1, name: 1 });
  sendResponse(res, 200, { categories, count: categories.length }, 'Categories fetched successfully');
});

// @desc    Get category by slug, with breadcrumb (ancestors) and direct children
// @route   GET /api/v1/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate('ancestors', 'name slug')
    .populate('children', 'name slug image status');

  if (!category) throw new ApiError(404, 'Category not found');
  sendResponse(res, 200, { category }, 'Category fetched successfully');
});

// @desc    Get the effective attribute template for a category — its own
//          template merged with every ancestor's. This is what the admin
//          product form should call to know which fields to render when
//          the admin picks this category.
// @route   GET /api/v1/categories/:id/attribute-template
// @access  Public
const getAttributeTemplate = asyncHandler(async (req, res) => {
  const attributeTemplate = await getEffectiveAttributeTemplate(req.params.id);
  sendResponse(res, 200, { attributeTemplate }, 'Attribute template fetched successfully');
});

module.exports = { createCategory, updateCategory, deleteCategory, getCategories, getCategoryBySlug, getAttributeTemplate };
