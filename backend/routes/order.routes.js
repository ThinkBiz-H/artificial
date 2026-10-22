const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  createShipment,
  requestPickup,
  cancelShipmentAdmin,
  trackOrder,
  downloadInvoice,
  resendOrderEmail,
} = require("../controllers/order.controller");

const { protect, authorize } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createOrderValidator,
  updateOrderStatusValidator,
  createShipmentValidator,
  getAllOrdersValidator,
} = require("../validators/order.validator");

router.use(protect);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order from the current cart (COD deducts stock immediately; online payment deducts on verified payment)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress, paymentMethod]
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   fullName: { type: string }
 *                   mobile: { type: string }
 *                   addressLine1: { type: string }
 *                   city: { type: string }
 *                   state: { type: string }
 *                   pincode: { type: string }
 *               paymentMethod: { type: string, enum: [cod, razorpay] }
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties:
 *                     data: { type: object, properties: { order: { $ref: '#/components/schemas/Order' } } }
 *       400: { description: Cart empty, or a line item is out of stock / no longer available }
 */
router.post("/", createOrderValidator, validate, createOrder);
router.get("/my-orders", getMyOrders);

// Admin
router.get(
  "/",
  authorize("admin"),
  requirePermission("Orders", "View"),
  getAllOrdersValidator,
  validate,
  getAllOrders,
);
router.patch(
  "/:id/status",
  authorize("admin"),
  requirePermission("Orders", "Edit"),
  updateOrderStatusValidator,
  validate,
  updateOrderStatus,
);
router.post(
  "/:id/shipment",
  authorize("admin"),
  requirePermission("Orders", "Edit"),
  createShipmentValidator,
  validate,
  createShipment,
);
router.post("/:id/shipment/pickup", authorize("admin"), requirePermission("Orders", "Edit"), requestPickup);
router.post("/:id/shipment/cancel", authorize("admin"), requirePermission("Orders", "Edit"), cancelShipmentAdmin);
router.post("/:id/resend-email", authorize("admin"), requirePermission("Orders", "Edit"), resendOrderEmail);

// Owner or admin
router.get("/:id/track", trackOrder);
router.get("/:id/invoice", downloadInvoice);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
