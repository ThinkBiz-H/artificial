const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");
const ApiFeatures = require("../utils/ApiFeatures");
const WarehouseStock = require("../models/WarehouseStock");
const StockMovement = require("../models/StockMovement");
const Variant = require("../models/Variant");
const Notification = require("../models/Notification");
const { withTransaction } = require("../utils/withTransaction");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinary.service");
const {
  getEffectiveAttributeTemplate,
} = require("../services/category.service");
const inventoryService = require("../services/inventory.service");
const { computeGstPricing, parseBoolean } = require("../utils/gstPricing");

const RECENTLY_VIEWED_LIMIT = 20;


const assertRequiredAttributes = async (categoryId, attributes = []) => {
  const template = await getEffectiveAttributeTemplate(categoryId);
  const providedKeys = new Set((attributes || []).map((a) => a.key));
  const missing = template.filter(
    (f) => f.required && !providedKeys.has(f.key),
  );
  if (missing.length > 0) {
    throw new ApiError(
      400,
      `Missing required attribute(s) for this category: ${missing.map((f) => f.label).join(", ")}`,
    );
  }
};

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Normalises admin-submitted jewellery colour options: trims names, drops
 * blanks and duplicates, keeps only valid #RGB/#RRGGBB swatches and only
 * well-formed {url, publicId} gallery images.
 */
const sanitizeColorOptions = (raw) => {
  if (!Array.isArray(raw)) return undefined;
  const seen = new Set();
  return raw
    .map((c) => ({
      name: String(c?.name || "").trim(),
      hex: HEX.test(String(c?.hex || "").trim()) ? String(c.hex).trim() : "",
      images: (Array.isArray(c?.images) ? c.images : [])
        .filter((img) => img && typeof img.url === "string" && img.url)
        .map((img) => ({ url: img.url, publicId: img.publicId || "" })),
    }))
    .filter((c) => c.name && !seen.has(c.name.toLowerCase()) && seen.add(c.name.toLowerCase()));
};

/** Trims free-text jewellery fields; empty strings clear them. */
const normalizeJewelleryFields = (body) => {
  if (body.colorOptions !== undefined) body.colorOptions = sanitizeColorOptions(body.colorOptions) ?? [];
  ["metal", "plating", "stone", "packaging", "hsnCode", "designCode"].forEach((k) => {
    if (body[k] !== undefined) body[k] = String(body[k] ?? "").trim();
  });
  // Bulk discount tiers: [{ minQty, discountPercent }] (JSON over multipart).
  if (body.bulkPricing !== undefined) {
    let tiers = body.bulkPricing;
    if (typeof tiers === "string") {
      try {
        tiers = JSON.parse(tiers);
      } catch {
        tiers = [];
      }
    }
    const seen = new Set();
    body.bulkPricing = (Array.isArray(tiers) ? tiers : [])
      .map((t) => ({ minQty: Math.floor(Number(t?.minQty)), discountPercent: Number(t?.discountPercent) }))
      .filter((t) => t.minQty >= 1 && t.discountPercent > 0 && t.discountPercent <= 90 && !seen.has(t.minQty) && seen.add(t.minQty))
      .sort((x, y) => x.minQty - y.minQty)
      .slice(0, 10);
  }
  // Occasions / collections: JSON array or comma-separated text (multipart).
  ["occasions", "collections", "highlights"].forEach((k) => {
    if (body[k] === undefined) return;
    let list = body[k];
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = list.split(",");
      }
    }
    body[k] = [...new Set((Array.isArray(list) ? list : []).map((x) => String(x).trim()).filter(Boolean))].slice(0, 30);
  });
  if (Array.isArray(body.sizes)) {
    body.sizes = [...new Set(body.sizes.map((x) => String(x).trim()).filter(Boolean))];
  }
};

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  // Parse JSON-stringified arrays if sent via multipart/form-data
  [
    "tags",
    "colors",
    "colorOptions",
    "sizes",
    "attributes",
    "relatedProducts",
    "crossSell",
    "upSell",
    "seoKeywords",
    "documents",
    "dimensions",
  ].forEach((field) => {
    if (typeof body[field] === "string") {
      try {
        body[field] = JSON.parse(body[field]);
      } catch (e) {
        // leave as-is if not JSON (e.g. comma separated)
        if (
          [
            "tags",
            "colors",
            "sizes",
            "relatedProducts",
            "crossSell",
            "upSell",
            "seoKeywords",
          ].includes(field)
        ) {
          body[field] = body[field]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    }
  });

  let images = [];
  let thumbnail;

  if (req.files && req.files.length > 0) {
    const uploaded = await Promise.all(
      req.files.map((file) =>
        uploadToCloudinary(file.buffer, "ecommerce/products"),
      ),
    );
    images = uploaded.map((u) => ({ url: u.url, publicId: u.publicId }));
    thumbnail = images[0];
  }

  await assertRequiredAttributes(body.category, body.attributes);
  normalizeJewelleryFields(body);

  // GST Configuration (backend-authoritative — never trusts any
  // pre-computed basePrice/gstAmount/final-price the client might send;
  // only the three raw inputs below are read). `body.price` is whatever the
  // admin typed into the Price field — its meaning (final vs. pre-tax) is
  // decided entirely by `priceIncludesGST`.
  const gst = computeGstPricing({
    enteredPrice: body.price,
    gstRate: body.gstRate !== undefined ? body.gstRate : 18,
    priceIncludesGST: parseBoolean(body.priceIncludesGST, true),
  });
  body.price = gst.price;
  body.basePrice = gst.basePrice;
  body.gstRate = gst.gstRate;
  body.gstAmount = gst.gstAmount;
  body.priceIncludesGST = gst.priceIncludesGST;

  // The default warehouse is resolved (and repaired if needed) before
  // anything is written; the product, its stock row and the opening-stock
  // movement are then saved together, so a failure can never leave a
  // product without inventory.
  // Opening stock goes to the warehouse picked in the form, else the default one.
  const warehouseId = mongoose.Types.ObjectId.isValid(body.warehouse) ? body.warehouse : null;
  delete body.warehouse;
  const defaultWarehouse = await inventoryService.resolveWarehouse(warehouseId);
  let product;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      [product] = await Product.create([{ ...body, images, thumbnail }], { session });
      if (!product.hasVariants) {
        const opening = Math.max(0, Number(product.stock) || 0);
        await WarehouseStock.create(
          [{ product: product._id, variant: null, warehouse: defaultWarehouse._id, available: opening, reserved: 0, damaged: 0, incoming: 0 }],
          { session },
        );
        if (opening > 0) {
          await StockMovement.create(
            [{
              product: product._id,
              warehouse: defaultWarehouse._id,
              unit: product.unit || null,
              type: "adjustment",
              quantity: opening,
              previousStock: 0,
              newStock: opening,
              referenceType: "system",
              note: "Opening stock (product created)",
              performedBy: req.user?._id || null,
            }],
            { session },
          );
        }
      }
    });
  } catch (err) {
    // Nothing was saved — don't leave the just-uploaded images orphaned on Cloudinary.
    await Promise.all(images.map((img) => (img.publicId ? deleteFromCloudinary(img.publicId) : null)));
    throw err;
  } finally {
    await session.endSession();
  }

  sendResponse(res, 201, { product }, "Product created successfully");
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!product) throw new ApiError(404, "Product not found");

  const body = { ...req.body };
  [
    "tags",
    "colors",
    "colorOptions",
    "sizes",
    "attributes",
    "relatedProducts",
    "crossSell",
    "upSell",
    "seoKeywords",
    "documents",
    "dimensions",
  ].forEach((field) => {
    if (typeof body[field] === "string") {
      try {
        body[field] = JSON.parse(body[field]);
      } catch (e) {
        if (
          [
            "tags",
            "colors",
            "sizes",
            "relatedProducts",
            "crossSell",
            "upSell",
            "seoKeywords",
          ].includes(field)
        ) {
          body[field] = body[field]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    }
  });

  if (req.files && req.files.length > 0) {
    const uploaded = await Promise.all(
      req.files.map((file) =>
        uploadToCloudinary(file.buffer, "ecommerce/products"),
      ),
    );
    const newImages = uploaded.map((u) => ({
      url: u.url,
      publicId: u.publicId,
    }));
    product.images.push(...newImages);
    if (!product.thumbnail || !product.thumbnail.url)
      product.thumbnail = newImages[0];
  }

  // Admin drag-to-reorder: `imageOrder` lists image URLs in display order
  // (unknown URLs ignored, missing ones kept at the end); `thumbnailUrl`
  // picks the cover image.
  let imageOrder = body.imageOrder;
  if (typeof imageOrder === "string") {
    try {
      imageOrder = JSON.parse(imageOrder);
    } catch {
      imageOrder = undefined;
    }
  }
  if (Array.isArray(imageOrder)) {
    const rank = new Map(imageOrder.map((url, i) => [String(url), i]));
    product.images = [...product.images].sort((a, b) => (rank.get(a.url) ?? 1e6) - (rank.get(b.url) ?? 1e6));
  }
  if (typeof body.thumbnailUrl === "string") {
    const cover = product.images.find((img) => img.url === body.thumbnailUrl);
    if (cover) product.thumbnail = { url: cover.url, publicId: cover.publicId };
  }
  delete body.imageOrder;
  delete body.thumbnailUrl;

  normalizeJewelleryFields(body);

  // `stock` is excluded from the generic mass-assignment below and handled
  // separately after save (see block below) — it must never be written
  // directly. Product.stock is a denormalized aggregate of WarehouseStock
  // rows; overwriting it here would silently desync it from the ledger that
  // deductForOrder() actually checks/decrements at checkout, which is
  // exactly what caused COD orders to fail with "Insufficient available
  // stock ... Have 0" even though the product page showed stock available.
  // `price`/GST fields are excluded here and handled separately below, for
  // the same reason `stock` is: they must go through computeGstPricing()
  // rather than being written directly, so an edit that doesn't touch
  // pricing at all (e.g. just the title) can never accidentally alter the
  // stored price, and one that does touch it is always backend-recomputed.
  const excluded = [
    "images",
    "thumbnail",
    "reviews",
    "rating",
    "numReviews",
    "isDeleted",
    "slug",
    "stock",
    "price",
    "basePrice",
    "gstRate",
    "gstAmount",
    "priceIncludesGST",
  ];
  Object.keys(body).forEach((key) => {
    if (!excluded.includes(key)) product[key] = body[key];
  });

  // GST Configuration — only recomputed when the admin actually submitted a
  // price (every edit re-sends the full pricing section from the form, so
  // in practice this always runs when the Pricing card is on screen; a
  // request that omits `price` entirely leaves price/basePrice/gstRate/
  // gstAmount/priceIncludesGST completely untouched). Same backend-only,
  // never-trust-the-client math as createProduct above.
  if (body.price !== undefined) {
    const gst = computeGstPricing({
      enteredPrice: body.price,
      gstRate: body.gstRate !== undefined ? body.gstRate : (product.gstRate ?? 18),
      priceIncludesGST:
        body.priceIncludesGST !== undefined
          ? parseBoolean(body.priceIncludesGST, true)
          : (product.priceIncludesGST ?? true),
    });
    product.price = gst.price;
    product.basePrice = gst.basePrice;
    product.gstRate = gst.gstRate;
    product.gstAmount = gst.gstAmount;
    product.priceIncludesGST = gst.priceIncludesGST;
  }

  await assertRequiredAttributes(product.category, product.attributes);

  await product.save();

  // Route a "Stock" field edit through the real inventory ledger (against
  // the default warehouse) instead of overwriting the aggregate directly —
  // this keeps Product.stock, WarehouseStock.available and the
  // StockMovement audit trail all in agreement, same as any other stock
  // change made via the Inventory module.
  if (
    body.stock !== undefined &&
    !product.hasVariants &&
    Number.isFinite(Number(body.stock))
  ) {
    const targetStock = Number(body.stock);
    const currentStock = await inventoryService.getAvailableStock(
      product._id,
      null,
    );
    const delta = targetStock - currentStock;
    if (delta !== 0) {
      await inventoryService.adjustStock({
        productId: product._id,
        variantId: null,
        warehouseId: null,
        quantity: delta,
        note: "Stock updated via product edit form",
        performedBy: req.user._id,
        allowNegative: false,
      });
      // adjustStock() writes the new aggregate straight to the DB via
      // syncAggregateStock() — mirror it onto the already-loaded document
      // so the response reflects the true post-adjustment value.
      product.stock = targetStock;
    }
  }

  sendResponse(res, 200, { product }, "Product updated successfully");
});

// @desc    Remove a specific image from a product
// @route   DELETE /api/v1/products/:id/images/:publicId
// @access  Private/Admin
const removeProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!product) throw new ApiError(404, "Product not found");

  const publicId = decodeURIComponent(req.params.publicId);
  const sharedWithAnother = await Product.exists({ _id: { $ne: product._id }, isDeleted: false, "images.publicId": publicId });
  if (!sharedWithAnother) await deleteFromCloudinary(publicId);

  product.images = product.images.filter((img) => img.publicId !== publicId);
  // Drop the photo from any colour gallery that referenced it.
  (product.colorOptions || []).forEach((opt) => {
    opt.images = (opt.images || []).filter((img) => img.publicId !== publicId);
  });
  if (product.thumbnail && product.thumbnail.publicId === publicId) {
    product.thumbnail = product.images[0] || null;
  }

  await product.save();
  sendResponse(res, 200, { product }, "Image removed successfully");
});

// @desc    Delete a product — soft-deletes the product document itself (so
//          it stays restorable via restoreProduct, exactly as before), but
//          atomically hard-deletes everything that would otherwise become an
//          orphan: its variants (and their Cloudinary images), warehouse
//          stock rows, and every reference to it in other collections
//          (other products' cross-merchandising lists, user wishlists/carts/
//          recently-viewed, notifications). Orders and StockMovement are
//          left untouched — they're historical records that must keep
//          referencing the product they were created against.
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!product) throw new ApiError(404, "Product not found");

  // Fetch variants up front so their Cloudinary publicIds are still known
  // after the DB-side deletion below.
  const variants = await Variant.find({ product: product._id });

  await withTransaction(async (session) => {
    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save({ session });

    await Variant.deleteMany({ product: product._id }, { session });
    await WarehouseStock.deleteMany({ product: product._id }, { session });

    await Product.updateMany(
      { _id: { $ne: product._id } },
      {
        $pull: {
          relatedProducts: product._id,
          crossSell: product._id,
          upSell: product._id,
        },
      },
      { session },
    );

    await User.updateMany(
      {},
      {
        $pull: {
          wishlist: product._id,
          cart: { product: product._id },
          recentlyViewed: { product: product._id },
        },
      },
      { session },
    );

    await Notification.updateMany(
      { relatedProduct: product._id },
      { $set: { relatedProduct: null } },
      { session },
    );
  });

  // Cloudinary cleanup for the now-deleted variants' images — best-effort,
  // outside the DB transaction since Cloudinary isn't transactional anyway.
  await Promise.all(
    variants.flatMap((variant) =>
      (variant.images || []).map((img) =>
        img.publicId ? deleteFromCloudinary(img.publicId).catch(() => null) : null,
      ),
    ),
  );

  sendResponse(res, 200, {}, "Product deleted successfully");
});

// @desc    Upload a product video and/or a 360° frame set (replaces the previous one)
// @route   POST /api/v1/products/:id/media   multipart: video (1), spin (8–36, in order)
// @access  Private/Admin
const uploadProductMedia = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) throw new ApiError(404, "Product not found");
  const video = req.files?.video?.[0];
  const spin = req.files?.spin || [];
  if (!video && !spin.length) throw new ApiError(400, "Choose a video or 360° photos to upload");
  if (spin.length && spin.length < 8) throw new ApiError(400, "A 360° view needs at least 8 photos taken around the piece");
  if (video && !video.mimetype.startsWith("video/")) throw new ApiError(400, "The video must be an MP4, WebM or MOV file");
  if (spin.some((f) => !f.mimetype.startsWith("image/"))) throw new ApiError(400, "360° frames must be images");

  if (video) {
    const up = await uploadToCloudinary(video.buffer, "ecommerce/products/videos", { resourceType: "video" });
    if (product.video?.publicId) await deleteFromCloudinary(product.video.publicId, "video");
    product.video = { url: up.url, publicId: up.publicId };
    product.videoUrl = up.url;
  }
  if (spin.length) {
    // Frames keep the order they were picked in (sorted by file name, e.g. 01.jpg…36.jpg).
    const ordered = [...spin].sort((a, b) => a.originalname.localeCompare(b.originalname, undefined, { numeric: true }));
    const uploaded = [];
    for (const f of ordered) uploaded.push(await uploadToCloudinary(f.buffer, "ecommerce/products/360"));
    await Promise.all((product.spinImages || []).map((img) => (img.publicId ? deleteFromCloudinary(img.publicId) : null)));
    product.spinImages = uploaded.map((u) => ({ url: u.url, publicId: u.publicId }));
  }
  await product.save();
  sendResponse(res, 200, { product }, "Media uploaded");
});

// @desc    Remove the uploaded video or the 360° frames
// @route   DELETE /api/v1/products/:id/media/:kind   (kind: video | spin)
// @access  Private/Admin
const removeProductMedia = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) throw new ApiError(404, "Product not found");
  if (req.params.kind === "video") {
    if (product.video?.publicId) await deleteFromCloudinary(product.video.publicId, "video");
    if (product.videoUrl === product.video?.url) product.videoUrl = "";
    product.video = { url: "", publicId: "" };
  } else if (req.params.kind === "spin") {
    await Promise.all((product.spinImages || []).map((img) => (img.publicId ? deleteFromCloudinary(img.publicId) : null)));
    product.spinImages = [];
  } else throw new ApiError(400, "kind must be video or spin");
  await product.save();
  sendResponse(res, 200, { product }, "Media removed");
});

// Fields an admin may change for many products at once.
const BULK_FIELDS = { status: ["active", "inactive", "draft"], featured: "bool", isTrending: "bool", isTopSelling: "bool", isNewArrival: "bool" };

// @desc    Bulk edit — status and merchandising flags for many products
// @route   PATCH /api/v1/products/bulk   body: { ids: [], set: { status?, featured?, ... } }
// @access  Private/Admin
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const ids = (Array.isArray(req.body?.ids) ? req.body.ids : []).filter((id) => mongoose.Types.ObjectId.isValid(id)).slice(0, 500);
  if (!ids.length) throw new ApiError(400, "Select at least one product");
  const set = {};
  for (const [key, rule] of Object.entries(BULK_FIELDS)) {
    const value = req.body?.set?.[key];
    if (value === undefined) continue;
    if (rule === "bool") set[key] = value === true || value === "true";
    else if (rule.includes(value)) set[key] = value;
    else throw new ApiError(400, `Invalid value for ${key}`);
  }
  if (!Object.keys(set).length) throw new ApiError(400, "Nothing to change");
  const result = await Product.updateMany({ _id: { $in: ids }, isDeleted: false }, { $set: set });
  sendResponse(res, 200, { matched: result.matchedCount, modified: result.modifiedCount }, `${result.modifiedCount} product(s) updated`);
});

// @desc    Duplicate a product as a draft (same images, new SKU, zero stock)
// @route   POST /api/v1/products/:id/duplicate
// @access  Private/Admin
const duplicateProduct = asyncHandler(async (req, res) => {
  const source = await Product.findOne({ _id: req.params.id, isDeleted: false }).lean();
  if (!source) throw new ApiError(404, "Product not found");
  const {
    _id, slug, SKU, barcode, reviews, rating, numReviews, salesCount, viewCount, createdAt, updatedAt, __v, offer, deletedAt, stock, hasVariants, ...rest
  } = source;
  let sku;
  if (SKU) {
    for (let n = 1; n < 50 && !sku; n++) {
      const candidate = `${SKU}-COPY${n > 1 ? n : ""}`;
      if (!(await Product.exists({ SKU: candidate }))) sku = candidate;
    }
  }
  const defaultWarehouse = await inventoryService.getDefaultWarehouse();
  let copy;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      [copy] = await Product.create(
        [{ ...rest, title: `${source.title} (copy)`, SKU: sku, status: "draft", stock: 0, hasVariants: false, featured: false }],
        { session },
      );
      await WarehouseStock.create(
        [{ product: copy._id, variant: null, warehouse: defaultWarehouse._id, available: 0, reserved: 0, damaged: 0, incoming: 0 }],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  sendResponse(res, 201, { product: copy }, "Product duplicated as a draft");
});

// @desc    Restore a soft-deleted product
// @route   PATCH /api/v1/products/:id/restore
// @access  Private/Admin
const restoreProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: true,
  });
  if (!product) throw new ApiError(404, "Deleted product not found");

  product.isDeleted = false;
  product.deletedAt = null;
  await product.save();

  sendResponse(res, 200, { product }, "Product restored successfully");
});

// @desc    Get all products with search/filter/sort/pagination
// @route   GET /api/v1/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  // A product only ever references its final (leaf) category, but browsing
  // a PARENT category should still surface products from every subcategory
  // beneath it. Expand `?category=<id>` into `{ $in: [id, ...descendantIds] }`
  // once, up front, so both the paginated query and the count query below
  // (which each build their own ApiFeatures instance from req.query) see
  // the same expanded filter.
  if (req.query.category) {
    if (!mongoose.Types.ObjectId.isValid(req.query.category)) {
      // A category filter was requested but is malformed — fail loudly
      // instead of silently falling through to "no filter" (which would
      // return every product in the store under a category-scoped URL).
      throw new ApiError(400, "Invalid category id");
    }
    const ids = await Category.getSelfAndDescendantIds(req.query.category);
    req.query.category = { $in: ids };
  }

  // Wholesale filters: comma lists select any of several values
  // (?metal=Brass,Copper), and ?inStock=true hides sold-out designs.
  ["metal", "plating", "stone", "occasions", "collections", "colors", "sizes"].forEach((key) => {
    const raw = req.query[key];
    if (typeof raw === "string" && raw.includes(",")) {
      const values = raw.split(",").map((v) => v.trim()).filter(Boolean).slice(0, 20);
      req.query[key] = values.length ? { $in: values } : undefined;
    }
  });
  if (req.query.inStock !== undefined) {
    const onlyInStock = req.query.inStock === "true";
    delete req.query.inStock;
    if (onlyInStock) req.query.stock = { gt: "0" };
  }

  // Category listings (parent or child) default to "Final Selling Price
  // ascending, newest first on a tie" instead of the generic `-createdAt`
  // default — but only when the caller hasn't explicitly asked for a
  // different sort (e.g. the "Price: High to Low" dropdown), so nothing
  // else about product listing/search/brand pages changes.
  const categoryScoped = Boolean(req.query.category);
  const hasExplicitSort =
    typeof req.query.sort === "string" && req.query.sort.trim() !== "";

  if (categoryScoped && !hasExplicitSort) {
    const filterFeatures = new ApiFeatures(
      Product.find({ isDeleted: false }),
      req.query,
    )
      .search(["title", "description", "tags", "SKU", "barcode", "designCode"])
      .filter();
    const mongoFilter = filterFeatures.query.getFilter();
    // aggregate() doesn't cast like find() does (e.g. "?price[gte]=100"
    // arrives as a string), so cast the filter against the schema first.
    const castFilter = Product.find().cast(Product, mongoFilter);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;

    // Sort by effective price (sale price when set, else price), newest first
    // on a tie, inside MongoDB — only the requested page's ids come back.
    const [total, pageDocs] = await Promise.all([
      Product.countDocuments(castFilter),
      Product.aggregate([
        { $match: castFilter },
        {
          $project: {
            createdAt: 1,
            effectivePrice: {
              $cond: [
                { $gt: [{ $ifNull: ["$salePrice", 0] }, 0] },
                "$salePrice",
                { $ifNull: ["$price", 0] },
              ],
            },
          },
        },
        { $sort: { effectivePrice: 1, createdAt: -1, _id: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]).allowDiskUse(true),
    ]);
    const pageIds = pageDocs.map((d) => d._id);

    const finalQuery = Product.find({ _id: { $in: pageIds } })
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .populate("unit", "name symbol allowDecimal");
    const finalFeatures = new ApiFeatures(finalQuery, req.query).limitFields();
    const orderIndex = new Map(pageIds.map((id, i) => [String(id), i]));
    const products = (await finalFeatures.query).sort(
      (a, b) => orderIndex.get(String(a._id)) - orderIndex.get(String(b._id)),
    );

    return sendResponse(
      res,
      200,
      {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Products fetched successfully",
    );
  }

  const baseQuery = Product.find({ isDeleted: false })
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .populate("unit", "name symbol allowDecimal");

  const features = new ApiFeatures(baseQuery, req.query)
    .search(["title", "description", "tags", "SKU", "barcode", "designCode"])
    .filter()
    .sort()
    .limitFields();

  const totalCountFeatures = new ApiFeatures(
    Product.find({ isDeleted: false }),
    req.query,
  )
    .search(["title", "description", "tags", "SKU", "barcode", "designCode"])
    .filter();
  const total = await totalCountFeatures.query.countDocuments();

  features.paginate();

  const products = await features.query;

  sendResponse(
    res,
    200,
    {
      products,
      pagination: {
        total,
        page: features.pagination.page,
        limit: features.pagination.limit,
        totalPages: Math.ceil(total / features.pagination.limit),
      },
    },
    "Products fetched successfully",
  );
});

// @desc    Get single product by slug
// @route   GET /api/v1/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isDeleted: false,
  })
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .populate("unit", "name symbol allowDecimal")
    .populate({
      path: "variants",
      populate: {
        path: "unit",
        select: "name symbol allowDecimal",
      },
    })
    .populate("relatedProducts", "title slug price salePrice thumbnail")
    .populate("crossSell", "title slug price salePrice thumbnail")
    .populate("upSell", "title slug price salePrice thumbnail")
    .populate("reviews.user", "name profileImage");

  if (!product) throw new ApiError(404, "Product not found");
  sendResponse(res, 200, { product }, "Product fetched successfully");
});
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: false,
  })
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .populate("unit", "name symbol allowDecimal")
    .populate({
      path: "variants",
      populate: {
        path: "unit",
        select: "name symbol allowDecimal",
      },
    })
    .populate("relatedProducts", "title slug price salePrice thumbnail")
    .populate("crossSell", "title slug price salePrice thumbnail")
    .populate("upSell", "title slug price salePrice thumbnail")
    .populate("reviews.user", "name profileImage");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  sendResponse(res, 200, { product }, "Product fetched successfully");
});
// @desc    Get related products (same category, excluding current)
// @route   GET /api/v1/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isDeleted: false,
    status: "active",
  })
    .limit(8)
    .populate("category", "name slug");

  sendResponse(
    res,
    200,
    { products: related },
    "Related products fetched successfully",
  );
});

// @desc    Get featured products
// @route   GET /api/v1/products/featured/list
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    featured: true,
    isDeleted: false,
    status: "active",
  })
    .limit(12)
    .populate("category", "name slug");
  sendResponse(
    res,
    200,
    { products },
    "Featured products fetched successfully",
  );
});

// @desc    Get new arrival products
// @route   GET /api/v1/products/new-arrivals/list
// @access  Public
const getNewArrivals = asyncHandler(async (req, res) => {
  // Products the admin marked "New Arrival" first, then the newest.
  const products = await flaggedFirst({ isNewArrival: true }, "-createdAt", {}, 12);
  sendResponse(res, 200, { products }, "New arrivals fetched successfully");
});

/**
 * Up to `limit` active products matching `flag` (newest first), topped up
 * with products matching `fallbackFilter` in `fallbackSort` order.
 */
const flaggedFirst = async (flag, fallbackSort, fallbackFilter, limit) => {
  const base = { isDeleted: false, status: "active" };
  const flagged = await Product.find({ ...base, ...flag }).sort("-createdAt").limit(limit).populate("category", "name slug");
  if (flagged.length >= limit) return flagged;
  const rest = await Product.find({ ...base, ...fallbackFilter, _id: { $nin: flagged.map((p) => p._id) } })
    .sort(fallbackSort)
    .limit(limit - flagged.length)
    .populate("category", "name slug");
  return [...flagged, ...rest];
};

// @desc    Filter values for a listing — materials, plating, stones,
//          occasions, collections, colours, sizes (with counts) and the
//          price range, from the active products in scope.
// @route   GET /api/v1/products/facets/list?category=
// @access  Public
const getProductFacets = asyncHandler(async (req, res) => {
  const match = { isDeleted: false, status: "active" };
  if (req.query.category) {
    if (!mongoose.Types.ObjectId.isValid(req.query.category)) throw new ApiError(400, "Invalid category id");
    match.category = { $in: await Category.getSelfAndDescendantIds(new mongoose.Types.ObjectId(String(req.query.category))) };
  }

  // Counts per value of a scalar or array field, most common first.
  const facet = (field, isArray = false) => [
    ...(isArray ? [{ $unwind: `$${field}` }] : []),
    { $match: { [field]: { $nin: ["", null] } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 40 },
  ];

  const [result] = await Product.aggregate([
    { $match: match },
    {
      $facet: {
        metal: facet("metal"),
        plating: facet("plating"),
        stone: facet("stone"),
        occasions: facet("occasions", true),
        collections: facet("collections", true),
        colors: [
          { $project: { names: { $setUnion: [{ $ifNull: ["$colors", []] }, { $ifNull: ["$colorOptions.name", []] }] } } },
          { $unwind: "$names" },
          { $match: { names: { $nin: ["", null] } } },
          { $group: { _id: "$names", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
          { $limit: 40 },
        ],
        sizes: facet("sizes", true),
        price: [
          {
            $group: {
              _id: null,
              min: { $min: { $cond: [{ $gt: [{ $ifNull: ["$salePrice", 0] }, 0] }, "$salePrice", "$price"] } },
              max: { $max: "$price" },
            },
          },
        ],
        total: [{ $count: "n" }],
      },
    },
  ]);

  const list = (rows) => (rows || []).map((r) => ({ value: String(r._id), count: r.count }));
  sendResponse(
    res,
    200,
    {
      facets: {
        metal: list(result?.metal),
        plating: list(result?.plating),
        stone: list(result?.stone),
        occasions: list(result?.occasions),
        collections: list(result?.collections),
        colors: list(result?.colors),
        sizes: list(result?.sizes),
        price: { min: result?.price?.[0]?.min ?? 0, max: result?.price?.[0]?.max ?? 0 },
        total: result?.total?.[0]?.n ?? 0,
      },
    },
    "Product facets fetched successfully",
  );
});

// @desc    Get related products - same category by default, optionally also
//          matching brand. Additive alternative to getRelatedProducts that
//          never breaks the original category-only endpoint.
// @route   GET /api/v1/products/:id/related?matchBrand=true
// @access  Public
const getRelatedProductsByBrand = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  if (!product.brand) throw new ApiError(400, "This product has no brand set");

  const related = await Product.find({
    brand: product.brand,
    _id: { $ne: product._id },
    isDeleted: false,
    status: "active",
  })
    .limit(8)
    .populate("brand", "name slug")
    .lean();

  sendResponse(
    res,
    200,
    { products: related },
    "Related products by brand fetched successfully",
  );
});

// @desc    Record a product-detail view for the logged-in user. Bumps the
//          product's viewCount (used for "trending") and pushes it to the
//          front of the user's recently-viewed list, capped at 20, with
//          the product de-duplicated if it was already in the list.
// @route   POST /api/v1/products/:id/view
// @access  Private
const trackProductView = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!product) throw new ApiError(404, "Product not found");

  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

  const user = await User.findById(req.user._id).select("recentlyViewed");
  user.recentlyViewed = user.recentlyViewed.filter(
    (entry) => entry.product.toString() !== product._id.toString(),
  );
  user.recentlyViewed.unshift({ product: product._id, viewedAt: new Date() });
  user.recentlyViewed = user.recentlyViewed.slice(0, RECENTLY_VIEWED_LIMIT);
  await user.save({ validateBeforeSave: false });

  sendResponse(res, 200, {}, "View recorded");
});

// @desc    Get the logged-in user's recently viewed products (max 20, newest first)
// @route   GET /api/v1/products/me/recently-viewed
// @access  Private
const getRecentlyViewed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "recentlyViewed.product",
    match: { isDeleted: false },
    populate: [
      { path: "category", select: "name slug" },
      { path: "brand", select: "name slug" },
    ],
  });

  const items = user.recentlyViewed.filter((entry) => entry.product);
  sendResponse(
    res,
    200,
    { items },
    "Recently viewed products fetched successfully",
  );
});

// @desc    Trending products - highest view count in a recent window,
//          falling back to all-time views if nothing recent qualifies.
// @route   GET /api/v1/products/trending/list
// @access  Public
const getTrendingProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  // Products the admin marked "Trending" first, then the most viewed.
  const products = await flaggedFirst({ isTrending: true }, "-viewCount", { viewCount: { $gt: 0 } }, limit);

  sendResponse(
    res,
    200,
    { products },
    "Trending products fetched successfully",
  );
});

// @desc    Best sellers - highest salesCount (units actually sold)
// @route   GET /api/v1/products/bestsellers/list
// @access  Public
const getBestSellers = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  // Products the admin marked "Top Selling" first, then real sales.
  const products = await flaggedFirst({ isTopSelling: true }, "-salesCount", { salesCount: { $gt: 0 } }, limit);

  sendResponse(res, 200, { products }, "Best sellers fetched successfully");
});

// @desc    Top rated products - highest rating, tie-broken by review count
//          so a single 5-star review doesn't outrank a well-reviewed product.
// @route   GET /api/v1/products/top-rated/list
// @access  Public
const getTopRatedProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const minReviews = Math.max(Number(req.query.minReviews) || 1, 0);

  const products = await Product.find({
    isDeleted: false,
    status: "active",
    numReviews: { $gte: minReviews },
  })
    .sort("-rating -numReviews")
    .limit(limit)
    .populate("category", "name slug")
    .lean();

  sendResponse(
    res,
    200,
    { products },
    "Top rated products fetched successfully",
  );
});
module.exports = {
  createProduct,
  updateProduct,
  removeProductImage,
  deleteProduct,
  restoreProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  getRelatedProductsByBrand,
  getFeaturedProducts,
  getNewArrivals,
  trackProductView,
  getRecentlyViewed,
  getTrendingProducts,
  getBestSellers,
  getTopRatedProducts,
  getProductFacets,
  bulkUpdateProducts,
  duplicateProduct,
  uploadProductMedia,
  removeProductMedia,
};
