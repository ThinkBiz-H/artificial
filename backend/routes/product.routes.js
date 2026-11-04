const express = require("express");
const router = express.Router();
const { requireFeature } = require('../middlewares/featureFlag.middleware');

const {
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
} = require("../controllers/product.controller");

const {
  addReview,
  editReview,
  deleteReview,
  getReviews,
  getRatingDistribution,
} = require("../controllers/review.controller");

const {
  createVariant,
  updateVariant,
  deleteVariant,
  getVariants,
} = require("../controllers/variant.controller");

const {
  variantValidator,
  variantUpdateValidator,
} = require("../validators/variant.validator");

const { protect, authorize } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");
const upload = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate.middleware");
const { cacheMiddleware } = require("../services/cache.service");
// Product data is written from many places (admin, orders, inventory), so it is
// only cached while live invalidation (liveSync.service) is running.
const live = { requiresLiveSync: true };
const {
  createProductValidator,
  updateProductValidator,
} = require("../validators/product.validator");

// Public listing / discovery routes (must come before /:slug)
/**
 * @swagger
 * /products:
 *   get:
 *     summary: List/search/filter products
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Category id — matches that category AND every subcategory beneath it
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *         description: "e.g. -createdAt, price, -price"
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Product' }
 */
router.get("/", cacheMiddleware("products", 120, live), getProducts);
router.get("/featured/list", cacheMiddleware("products", 120, live), getFeaturedProducts);
router.get("/new-arrivals/list", cacheMiddleware("products", 120, live), getNewArrivals);
router.get("/trending/list", cacheMiddleware("products", 120, live), getTrendingProducts);
router.get("/facets/list", cacheMiddleware("products", 300, live), getProductFacets);
router.get("/bestsellers/list", cacheMiddleware("products", 120, live), getBestSellers);
router.get("/top-rated/list", cacheMiddleware("products", 120, live), getTopRatedProducts);

// Recently viewed (must come before /:slug — "me" would otherwise be read as a slug)
router.get("/me/recently-viewed", protect, getRecentlyViewed);

// Admin CRUD
router.post(
  "/",
  protect,
  authorize("admin"),
  requirePermission("Products", "Create"),
  upload.array("images", 10),
  createProductValidator,
  validate,
  createProduct,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  requirePermission("Products", "Edit"),
  upload.array("images", 10),
  updateProductValidator,
  validate,
  updateProduct,
);
router.patch("/bulk", protect, authorize("admin"), requirePermission("Products", "Edit"), bulkUpdateProducts);
router.post("/:id/duplicate", protect, authorize("admin"), requirePermission("Products", "Create"), duplicateProduct);
router.post("/:id/media", protect, authorize("admin"), requirePermission("Products", "Edit"), upload.productMediaFields, uploadProductMedia);
router.delete("/:id/media/:kind", protect, authorize("admin"), requirePermission("Products", "Edit"), removeProductMedia);
router.delete("/:id", protect, authorize("admin"), requirePermission("Products", "Delete"), deleteProduct);
router.patch("/:id/restore", protect, authorize("admin"), requirePermission("Products", "Edit"), restoreProduct);
router.delete(
  "/:id/images/:publicId(*)",
  protect,
  authorize("admin"),
  requirePermission("Products", "Edit"),
  removeProductImage,
);

// Related products (by id)
router.get("/:id/related", cacheMiddleware("products", 120, live), getRelatedProducts);
router.get("/:id/related-by-brand", cacheMiddleware("products", 120, live), getRelatedProductsByBrand);
router.post("/:id/view", protect, trackProductView);

// Reviews (verified purchase only)
router.get("/:id/reviews", cacheMiddleware("products", 120, live), getReviews);
router.get("/:id/reviews/rating-distribution", cacheMiddleware("products", 120, live), getRatingDistribution);
router.post("/:id/reviews", protect, requireFeature("reviews", "Reviews are currently closed."), addReview);
router.put("/:id/reviews/:reviewId", protect, editReview);
router.delete("/:id/reviews/:reviewId", protect, deleteReview);

// Variants (Phase 5) — nested under a product
router.get("/:productId/variants", cacheMiddleware("products", 120, live), getVariants);
router.post(
  "/:productId/variants",
  protect,
  authorize("admin"),
  requirePermission("Products", "Create"),
  upload.array("images", 6),
  variantValidator,
  validate,
  createVariant,
);
router.put(
  "/:productId/variants/:variantId",
  protect,
  authorize("admin"),
  requirePermission("Products", "Edit"),
  upload.array("images", 6),
  variantUpdateValidator,
  validate,
  updateVariant,
);
router.delete(
  "/:productId/variants/:variantId",
  protect,
  authorize("admin"),
  requirePermission("Products", "Delete"),
  deleteVariant,
);

// Public single product by slug - keep last so it doesn't shadow the routes above
router.get("/id/:id", cacheMiddleware("products", 120, live), getProductById);
router.get("/:slug", cacheMiddleware("products", 120, live), getProductBySlug);

module.exports = router;
