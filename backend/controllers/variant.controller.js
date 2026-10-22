const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const Product = require("../models/Product");
const Variant = require("../models/Variant");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinary.service");
const inventoryService = require("../services/inventory.service");
const { findColorOption } = require("../utils/itemOptions");

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Normalises a variant's jewellery fields (color / colorHex / size) and
 * images. A missing swatch is taken from the product's matching colour
 * option, so admins only define each colour's hex once.
 */
const normalizeVariantBody = (body, product) => {
  ["color", "size"].forEach((k) => {
    if (body[k] !== undefined) body[k] = String(body[k] ?? "").trim();
  });
  if (body.colorHex !== undefined) {
    const hex = String(body.colorHex ?? "").trim();
    body.colorHex = HEX.test(hex) ? hex : "";
  }
  if (body.color && !body.colorHex) {
    body.colorHex = findColorOption(product, body.color)?.hex || "";
  }
  // Images chosen from the product's existing photos arrive as JSON.
  if (body.images !== undefined) {
    const imgs = parseIfString(body.images);
    body.images = (Array.isArray(imgs) ? imgs : [])
      .filter((img) => img && typeof img.url === "string" && img.url)
      .map((img) => ({ url: img.url, publicId: img.publicId || "" }));
  }
};

const parseIfString = (raw) => {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

/** Keeps Product.hasVariants accurate after any variant create/delete. */
const syncHasVariants = async (productId) => {
  const count = await Variant.countDocuments({ product: productId });
  await Product.findByIdAndUpdate(productId, { hasVariants: count > 0 });
};

/** If `isDefault` is being set true, unset it on every sibling variant first. */
const enforceSingleDefault = async (productId, variantId, isDefault) => {
  if (isDefault) {
    await Variant.updateMany(
      { product: productId, _id: { $ne: variantId } },
      { isDefault: false },
    );
  }
};

// @desc    Create a variant for a product
// @route   POST /api/v1/products/:productId/variants
// @access  Private/Admin
const createVariant = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.productId,
    isDeleted: false,
  });
  if (!product) throw new ApiError(404, "Product not found");

  const body = { ...req.body };
  body.attributes = parseIfString(body.attributes) || [];
  body.dimensions = parseIfString(body.dimensions);
  normalizeVariantBody(body, product);

  let images = body.images || [];
  if (req.files && req.files.length > 0) {
    const uploaded = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, "ecommerce/variants")),
    );
    images = [...images, ...uploaded.map((u) => ({ url: u.url, publicId: u.publicId }))];
  }

  const existingCount = await Variant.countDocuments({ product: product._id });
  const isDefault =
    body.isDefault === undefined
      ? existingCount === 0
      : body.isDefault === true || body.isDefault === "true";

  const variant = await Variant.create({
    ...body,
    product: product._id,
    images,
    // Legacy unit fields — only stored when an older client still sends them.
    unit: body.unit || undefined,
    unitValue: body.unitValue ?? 1,
    isDefault,
  });

  await enforceSingleDefault(product._id, variant._id, isDefault);
  await syncHasVariants(product._id);

  // Provision this variant's WarehouseStock row against the default
  // warehouse — mirrors exactly what createProduct (product.controller.js)
  // already does for a simple (non-variant) product. Without this, the
  // variant's `.stock` field is the only place its stock exists: it shows
  // up correctly everywhere that field is read (admin forms, PDP), but the
  // real ledger deductForOrder()/getAvailableStock() actually check has no
  // row for this variant at all — so checkout validation reports
  // "Available: 0" (buildOrderItems, correctly reading the real ledger)
  // even though the variant looks fully stocked everywhere else.
  const defaultWarehouse = await inventoryService.getDefaultWarehouse();
  const stockRecord = await inventoryService.getOrCreateStockRecord(
    product._id,
    variant._id,
    defaultWarehouse._id,
  );
  stockRecord.available = variant.stock || 0;
  await stockRecord.save();

  sendResponse(res, 201, { variant }, "Variant created successfully");
});

// @desc    Update a variant
// @route   PUT /api/v1/products/:productId/variants/:variantId
// @access  Private/Admin
const updateVariant = asyncHandler(async (req, res) => {
  const variant = await Variant.findOne({
    _id: req.params.variantId,
    product: req.params.productId,
  });
  if (!variant) throw new ApiError(404, "Variant not found");

  const body = { ...req.body };
  if (body.attributes !== undefined)
    body.attributes = parseIfString(body.attributes);
  if (body.dimensions !== undefined)
    body.dimensions = parseIfString(body.dimensions);
  const parent = await Product.findById(variant.product).select("colorOptions");
  normalizeVariantBody(body, parent);
  // Picked images replace the variant's set; uploaded files are appended below.
  if (body.images !== undefined) variant.images = body.images;
  if (body.unit === "") delete body.unit;
  // A colour/size change must re-derive the Color/Size attributes.
  if (body.color !== undefined || body.size !== undefined) {
    // Older variants keep colour/size only in attributes — lift them into the
    // fields first so stripping the attributes never loses a value.
    const fromAttr = (k) => (variant.attributes || []).find((a) => String(a.key).toLowerCase() === k)?.value || "";
    if (!variant.color) variant.color = fromAttr("color");
    if (!variant.size) variant.size = fromAttr("size");
    const current = body.attributes ?? variant.attributes;
    body.attributes = (current || []).filter(
      (a) => !["color", "size"].includes(String(a.key).toLowerCase()),
    );
  }

  if (req.files && req.files.length > 0) {
    const uploaded = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, "ecommerce/variants")),
    );
    variant.images.push(
      ...uploaded.map((u) => ({ url: u.url, publicId: u.publicId })),
    );
  }

  // `stock` is excluded here and handled separately after save (below) for
  // the same reason as updateProduct in product.controller.js: overwriting
  // it directly would desync Variant.stock from the WarehouseStock ledger
  // that deductForOrder() actually enforces at checkout.
  const excluded = ["images", "product", "stock"];
  Object.keys(body).forEach((key) => {
    if (!excluded.includes(key)) variant[key] = body[key];
  });

  await variant.save();

  const isDefault = variant.isDefault === true;
  await enforceSingleDefault(variant.product, variant._id, isDefault);

  if (body.stock !== undefined && Number.isFinite(Number(body.stock))) {
    const targetStock = Number(body.stock);
    const currentStock = await inventoryService.getAvailableStock(
      variant.product,
      variant._id,
    );
    const delta = targetStock - currentStock;
    if (delta !== 0) {
      await inventoryService.adjustStock({
        productId: variant.product,
        variantId: variant._id,
        warehouseId: null,
        quantity: delta,
        note: "Stock updated via variant edit form",
        performedBy: req.user._id,
        allowNegative: false,
      });
      variant.stock = targetStock;
    }
  }

  sendResponse(res, 200, { variant }, "Variant updated successfully");
});

// @desc    Delete a variant
// @route   DELETE /api/v1/products/:productId/variants/:variantId
// @access  Private/Admin
const deleteVariant = asyncHandler(async (req, res) => {
  const variant = await Variant.findOne({
    _id: req.params.variantId,
    product: req.params.productId,
  });
  if (!variant) throw new ApiError(404, "Variant not found");

  // Variant images are often picked from the product's own photos — only
  // delete files from Cloudinary that the product isn't still using.
  const product = await Product.findById(variant.product).select("images thumbnail colorOptions");
  const inUse = new Set(
    [
      ...(product?.images || []),
      product?.thumbnail,
      ...(product?.colorOptions || []).flatMap((c) => c.images || []),
    ]
      .map((img) => img?.publicId)
      .filter(Boolean),
  );
  const siblings = await Variant.find({ product: variant.product, _id: { $ne: variant._id } }).select("images");
  siblings.forEach((v) => (v.images || []).forEach((img) => img.publicId && inUse.add(img.publicId)));

  await Promise.all(
    (variant.images || []).map((img) =>
      img.publicId && !inUse.has(img.publicId) ? deleteFromCloudinary(img.publicId) : null,
    ),
  );

  const wasDefault = variant.isDefault;
  await variant.deleteOne();
  await syncHasVariants(req.params.productId);

  // If the deleted variant was the default, promote the next remaining one.
  if (wasDefault) {
    const next = await Variant.findOne({ product: req.params.productId }).sort(
      "createdAt",
    );
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  sendResponse(res, 200, {}, "Variant deleted successfully");
});

// @desc    List all variants for a product
// @route   GET /api/v1/products/:productId/variants
// @access  Public
const getVariants = asyncHandler(async (req, res) => {
  const variants = await Variant.find({
    product: req.params.productId,
  })
    .populate("unit", "name symbol allowDecimal")
    .sort("createdAt");
  sendResponse(
    res,
    200,
    { variants, count: variants.length },
    "Variants fetched successfully",
  );
});

module.exports = { createVariant, updateVariant, deleteVariant, getVariants };
