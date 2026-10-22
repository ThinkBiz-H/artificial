const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const razorpayInstance = require("../config/razorpay");
const {
  reduceStock,
  restoreStock,
  pushStatusHistory,
} = require("../services/order.service");
const shiprocket = require("../services/shiprocket.service");
const { streamInvoicePDF } = require("../services/invoice.service");
const {
  canTransition,
  assertTransition,
} = require("../utils/orderStatusMachine");
const emailService = require("../services/emailService");
const { sendOrderStatusSMS } = require("../services/sms.service");
const { notify } = require("../services/notification.service");
const logger = require("../utils/logger");
const escapeRegex = require("../utils/escapeRegex");
const {
  assertPaymentMethodAllowed,
  priceCheckout,
  buildOrderData,
  razorpayError,
} = require("../services/checkout.service");
// @desc    Create a new order (COD immediate, Razorpay creates a payment order)
// @route   POST /api/v1/orders
// @access  Private
// The web checkout uses this for COD only; online payments there go through
// POST /payments/intent so no order exists until the payment succeeds. The
// Razorpay branch below is kept unchanged for existing clients (Flutter).
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode, shippingNotes } =
    req.body;

  // Checked before anything is created, against the same Admin > Settings >
  // Payment switches the storefront shows.
  await assertPaymentMethodAllowed(paymentMethod);

  const priced = await priceCheckout(req.user._id, {
    shippingAddress,
    paymentMethod,
    couponCode,
  });
  const { user, orderItems, coupon } = priced;

  const order = await Order.create({
    ...buildOrderData(priced, { shippingAddress, shippingNotes, paymentMethod }),
    paymentStatus: "Pending",
    orderStatus: "Pending",
    statusHistory: [
      {
        status: "Pending",
        note: "Order placed",
      },
    ],
  });

  if (paymentMethod === "cod") {
    await reduceStock(orderItems, {
      orderId: order._id,
      performedBy: user._id,
    });
    if (coupon) {
      await coupon.recordUsage(user._id);
    }
    user.cart = [];
    await user.save({ validateBeforeSave: false });

    // Order is already created & saved above — an email failure here must
    // never affect the order (FEATURE 7), which is why emailService already
    // catches internally and only ever returns a success flag.
    await emailService.sendOrderConfirmation(order, user);

    notify({
      user: user._id,
      type: "order_confirmed",
      title: "Order placed",
      message: `Your order #${order.orderNumber} has been placed successfully.`,
      relatedOrder: order._id,
    });

    return sendResponse(
      res,
      201,
      { order },
      "Order placed successfully (Cash on Delivery)",
    );
  }

  // Razorpay flow (legacy clients): create a Razorpay order for the grand
  // total. If Razorpay refuses, remove the just-created order so no orphan
  // "Pending" order is left behind, and report a clear 502.
  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(order.grandTotal * 100), // in paise
      currency: "INR",
      receipt: order.orderNumber,
    });
  } catch (err) {
    await Order.deleteOne({ _id: order._id });
    throw razorpayError(err);
  }

  order.paymentInfo = { razorpayOrderId: razorpayOrder.id };
  await order.save();

  sendResponse(
    res,
    201,
    {
      order,
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    },
    "Order created. Proceed to payment.",
  );
});

// @desc    Get logged-in user's orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "title images price salePrice")
    .sort("-createdAt");

  sendResponse(
    res,
    200,
    { orders, count: orders.length },
    "Orders fetched successfully",
  );
});

// @desc    Get single order by id (owner or admin)
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email mobile")
    .populate("items.product", "title images price salePrice");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not authorized to view this order");
  }

  // Customers never see internal admin notes
  const payload = order.toObject();
  if (!isAdmin) delete payload.adminNotes;

  sendResponse(res, 200, { order: payload }, "Order fetched successfully");
});

// @desc    Cancel an order (user or admin)
// @route   PATCH /api/v1/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You are not authorized to cancel this order");
  }

  if (!canTransition(order.orderStatus, "Cancelled")) {
    throw new ApiError(
      400,
      `Order cannot be cancelled from its current status (${order.orderStatus})`,
    );
  }

  const reason = req.body.reason || "Cancelled by user";
  pushStatusHistory(order, "Cancelled", reason, req.user._id);
  order.cancelledAt = new Date();
  order.cancelReason = reason;

  // If a Shiprocket shipment already exists, cancel it too so the courier
  // doesn't attempt pickup/delivery on a cancelled order.
  if (shiprocket.isShiprocketEnabled() && order.shiprocket?.awbCode) {
    try {
      await shiprocket.cancelShipment(order.shiprocket.awbCode);
    } catch (e) {
      logger.error(
        `Failed to cancel Shiprocket shipment on order cancel: ${e.message}`,
      );
    }
  }

  if (order.paymentStatus === "Paid" || order.paymentMethod === "cod") {
    await restoreStock(order.items, {
      orderId: order._id,
      performedBy: req.user._id,
    });
  }

  await order.save();

  const owner = await User.findById(order.user).select("name email mobile");
  if (owner) {
    await emailService.sendOrderStatusUpdate(order, owner);
    await sendOrderStatusSMS(order, owner, order.orderStatus);
  }

  notify({
    user: order.user,
    type: "order_cancelled",
    title: "Order cancelled",
    message: `Your order #${order.orderNumber} has been cancelled.`,
    relatedOrder: order._id,
  });

  sendResponse(res, 200, { order }, "Order cancelled successfully");
});

// ==================== ADMIN ====================

// @desc    Get all orders (admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;

  if (req.query.orderNumber) {
    filter.orderNumber = { $regex: escapeRegex(req.query.orderNumber), $options: "i" };
  }

  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const total = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .populate("user", "name email mobile")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  sendResponse(
    res,
    200,
    {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
    "Orders fetched successfully",
  );
});

// @desc    Update order status (admin) — validates the transition,
//          supports manual courier/tracking info, admin/shipping notes,
//          and delivery attempt tracking.
// @route   PATCH /api/v1/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const {
    orderStatus,
    note,
    adminNote,
    shippingNotes,
    trackingNumber,
    trackingUrl,
    estimatedDeliveryDate,
    courierPartner,
    courierName,
    deliveryFailed,
  } = req.body;

  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email mobile",
  );
  if (!order) throw new ApiError(404, "Order not found");

  // Tracks whether orderStatus actually transitioned this request, so the
  // status-update email (FEATURE 6) never re-fires for requests that only
  // touch tracking/courier/notes, or for repeated "Out For Delivery" attempts.
  let statusChanged = false;
  const oldStatus = order.orderStatus;
  logger.info(
    `Admin status update for order ${order.orderNumber} | Old Status: ${JSON.stringify(oldStatus)} | New Status: ${JSON.stringify(orderStatus)}`,
  );

  if (orderStatus && orderStatus !== order.orderStatus) {
    assertTransition(order.orderStatus, orderStatus);
    pushStatusHistory(order, orderStatus, note, req.user._id);
    statusChanged = true;

    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();
      order.tracking.shipmentStatus = "Delivered";
      if (order.paymentMethod === "cod") order.paymentStatus = "Paid";
    }

    if (orderStatus === "Shipped") {
      order.tracking.shipmentStatus = "In Transit";
    }

    if (orderStatus === "Out For Delivery") {
      order.tracking.shipmentStatus = "Out For Delivery";
      order.tracking.deliveryAttempts += 1;
      order.tracking.lastAttemptAt = new Date();
      if (deliveryFailed)
        order.tracking.lastAttemptNote = note || "Delivery attempt failed";
    }

    if (["Cancelled", "Returned", "Refunded"].includes(orderStatus)) {
      await restoreStock(order.items, {
        orderId: order._id,
        performedBy: req.user._id,
      });
    }
  } else if (orderStatus === "Out For Delivery") {
    // Repeated "Out For Delivery" = another delivery attempt, no status change
    order.tracking.deliveryAttempts += 1;
    order.tracking.lastAttemptAt = new Date();
    order.tracking.lastAttemptNote = note || "Delivery attempt failed";
    order.statusHistory.push({
      status: orderStatus,
      note: note || `Delivery attempt #${order.tracking.deliveryAttempts}`,
      changedBy: req.user._id,
    });
  }

  if (trackingNumber) order.tracking.number = trackingNumber;
  if (trackingUrl) order.tracking.url = trackingUrl;
  if (estimatedDeliveryDate)
    order.tracking.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
  if (courierPartner) order.courier.partner = courierPartner;
  if (courierName) order.courier.courierName = courierName;
  if (adminNote) order.adminNotes = adminNote;
  if (shippingNotes) order.shippingNotes = shippingNotes;

  await order.save();

  // FEATURE 2 / FEATURE 6: one status-update email per actual transition,
  // covering every status (Pending, Confirmed, Packed, Shipped, Out For
  // Delivery, Delivered, Cancelled, Returned, Refunded) from a single place.
  // The order-status SMS reuses the exact same `statusChanged` guard —
  // sendOrderStatusSMS itself no-ops for any status outside its 4
  // supported ones (Confirmed/Shipped/Delivered/Cancelled), so this is
  // safe to call unconditionally here.
  if (statusChanged) {
    await emailService.sendOrderStatusUpdate(order, order.user);
    logger.info(
      `Calling sendOrderStatusSMS() for order ${order.orderNumber} | ${oldStatus} -> ${order.orderStatus}`,
    );
    await sendOrderStatusSMS(order, order.user, order.orderStatus);
  } else {
    logger.info(
      `No SMS for order ${order.orderNumber}: status unchanged (${JSON.stringify(order.orderStatus)})`,
    );
  }

  if (orderStatus === "Delivered") {
    notify({
      user: order.user._id,
      type: "order_delivered",
      title: "Order delivered",
      message: `Your order #${order.orderNumber} has been delivered.`,
      relatedOrder: order._id,
    });
  }

  if (orderStatus === "Shipped") {
    notify({
      user: order.user._id,
      type: "order_shipped",
      title: "Order shipped",
      message: `Your order #${order.orderNumber} is on its way.`,
      relatedOrder: order._id,
    });
  }

  sendResponse(res, 200, { order }, "Order status updated successfully");
});

// @desc    Create a Shiprocket shipment for an order (or no-op if Shiprocket
//          is disabled, in which case use PATCH /:id/status to set courier
//          info manually instead).
// @route   POST /api/v1/orders/:id/shipment
// @access  Private/Admin
const createShipment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.shiprocket?.awbCode) {
    throw new ApiError(400, "A shipment already exists for this order");
  }

  if (!["Confirmed", "Packed"].includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Order must be Confirmed or Packed before creating a shipment (currently ${order.orderStatus})`,
    );
  }

  const { courierId } = req.body;

  // BUGFIX (duplicate shipment creation): if a previous attempt already
  // created the Shiprocket order/shipment but failed before AWB assignment
  // (courier unavailable, Shiprocket API error, timeout, etc.), `shipmentId`
  // is already saved on the order below — reuse it instead of calling
  // shiprocket.createShipment() again, which would create a second, duplicate
  // shipment on Shiprocket for the same order. The guard above only blocks
  // re-entry once an AWB has actually been assigned, so this endpoint is now
  // safe to retry at any stage.
  let shipmentId = order.shiprocket?.shipmentId;

  if (!shipmentId) {
    const { shiprocketOrderId, shipmentId: newShipmentId } =
      await shiprocket.createShipment(order);
    order.shiprocket.orderId = shiprocketOrderId;
    order.shiprocket.shipmentId = newShipmentId;
    shipmentId = newShipmentId;
    // Persist immediately — see note above on why this can't wait until the
    // final order.save() at the bottom of this handler.
    await order.save();
  }

  const { awbCode, courierCompanyId, courierName } = await shiprocket.assignAWB(
    shipmentId,
    courierId,
  );
  order.shiprocket.awbCode = awbCode;
  order.shiprocket.courierCompanyId = courierCompanyId;
  order.courier.partner = "Shiprocket";
  order.courier.courierId = courierCompanyId;
  order.courier.courierName = courierName;
  order.tracking.number = awbCode;
  order.tracking.url = `https://shiprocket.co/tracking/${awbCode}`;
  order.tracking.shipmentStatus = "AWB Assigned";

  // Best-effort: fetch a shipping label. Not fatal if it fails.
  try {
    order.shiprocket.labelUrl = await shiprocket.generateLabel(shipmentId);
  } catch (e) {
    logger.error(
      `Label generation failed for shipment ${shipmentId}: ${e.message}`,
    );
  }

  if (order.orderStatus === "Confirmed") {
    pushStatusHistory(
      order,
      "Packed",
      "Shipment created via Shiprocket",
      req.user._id,
    );
  }

  await order.save();

  sendResponse(
    res,
    201,
    { order },
    "Shipment created and courier assigned successfully",
  );
});

// @desc    Request a courier pickup for an already-created shipment
// @route   POST /api/v1/orders/:id/shipment/pickup
// @access  Private/Admin
const requestPickup = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  if (!order.shiprocket?.shipmentId) {
    throw new ApiError(400, "No Shiprocket shipment exists for this order yet");
  }

  const { pickupScheduledAt, pickupTokenNumber } =
    await shiprocket.requestPickup(order.shiprocket.shipmentId);
  order.shiprocket.pickupScheduledAt = pickupScheduledAt;
  order.shiprocket.pickupTokenNumber = pickupTokenNumber;
  order.tracking.shipmentStatus = "Pickup Scheduled";
  order.statusHistory.push({
    status: order.orderStatus,
    note: "Courier pickup scheduled",
    changedBy: req.user._id,
  });

  await order.save();
  sendResponse(res, 200, { order }, "Pickup requested successfully");
});

// @desc    Cancel an existing Shiprocket shipment (does not cancel the order itself)
// @route   POST /api/v1/orders/:id/shipment/cancel
// @access  Private/Admin
const cancelShipmentAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  if (!order.shiprocket?.awbCode) {
    throw new ApiError(400, "No active Shiprocket shipment to cancel");
  }

  await shiprocket.cancelShipment(order.shiprocket.awbCode);
  order.tracking.shipmentStatus = "Cancelled";
  order.statusHistory.push({
    status: order.orderStatus,
    note: "Shiprocket shipment cancelled",
    changedBy: req.user._id,
  });

  await order.save();
  sendResponse(res, 200, { order }, "Shipment cancelled successfully");
});

// @desc    Track an order's shipment (owner or admin). Pulls live data from
//          Shiprocket when available, otherwise falls back to stored tracking info.
// @route   GET /api/v1/orders/:id/track
// @access  Private
const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You are not authorized to track this order");
  }

  let live = null;
  if (shiprocket.isShiprocketEnabled() && order.shiprocket?.awbCode) {
    try {
      live = await shiprocket.trackByAWB(order.shiprocket.awbCode);
    } catch (e) {
      logger.error(
        `Live tracking fetch failed for order ${order.orderNumber}: ${e.message}`,
      );
    }
  }

  sendResponse(
    res,
    200,
    {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      tracking: order.tracking,
      courier: order.courier,
      statusHistory: order.statusHistory,
      live,
    },
    "Tracking info fetched successfully",
  );
});

// @desc    Download a PDF invoice for an order (owner or admin)
// @route   GET /api/v1/orders/:id/invoice
// @access  Private
const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (!order) throw new ApiError(404, "Order not found");

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You are not authorized to view this invoice");
  }

  streamInvoicePDF(order, res);
});

// @desc    Manually resend the order confirmation email (admin)
// @route   POST /api/v1/orders/:id/resend-email
// @access  Private/Admin
const resendOrderEmail = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (!order) throw new ApiError(404, "Order not found");

  const result = await emailService.sendOrderConfirmation(order, order.user);
  if (!result.success) {
    throw new ApiError(502, `Failed to send email: ${result.error}`);
  }

  sendResponse(res, 200, {}, "Order confirmation email resent successfully");
});

module.exports = {
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
};
