const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const Order = require("../models/Order");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const PaymentTransaction = require("../models/PaymentTransaction");
const razorpayInstance = require("../config/razorpay");
const { reduceStock } = require("../services/order.service");
const {
  verifyPaymentSignature,
  logTransaction,
} = require("../services/payment.service");
const { sendEmail, templates } = require("../utils/sendEmail");
const emailService = require("../services/emailService");
const { sendOrderStatusSMS } = require("../services/sms.service");
const { notify } = require("../services/notification.service");
const PaymentIntent = require("../models/PaymentIntent");
const { withTransaction } = require("../utils/withTransaction");
const { createPaymentIntent, finalizePaidIntent } = require("../services/checkout.service");

// @desc    Online checkout step 1 — price the bag and open a Razorpay order.
//          No Order is created until the payment succeeds (see confirmPaymentIntent).
// @route   POST /api/v1/payments/intent
// @access  Private
const createIntent = asyncHandler(async (req, res) => {
  const { shippingAddress, shippingNotes, couponCode } = req.body;
  if (!shippingAddress?.addressLine1 || !shippingAddress?.pincode) {
    throw new ApiError(400, "A delivery address is required");
  }
  const intent = await createPaymentIntent(req.user._id, { shippingAddress, shippingNotes, couponCode });
  sendResponse(res, 201, intent, "Proceed to payment");
});

// @desc    Online checkout step 2 — verify the Razorpay signature, then create
//          the Order (Paid + Confirmed). Safe to call twice / race the webhook.
// @route   POST /api/v1/payments/intent/confirm
// @access  Private
const confirmIntent = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing required payment verification fields");
  }

  const intent = await PaymentIntent.findOne({ razorpayOrderId: razorpay_order_id });
  if (!intent) throw new ApiError(404, "Payment session not found. If you were charged, contact support with your payment id.");
  if (String(intent.user) !== String(req.user._id)) throw new ApiError(403, "This payment belongs to another account");

  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    throw new ApiError(400, "Payment verification failed: invalid signature");
  }

  const result = await withTransaction((session) =>
    finalizePaidIntent(
      { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
      session,
    ),
  );
  if (!result?.order) {
    throw new ApiError(500, "Payment received but the order could not be created yet. It will be completed automatically — please check My Orders shortly.");
  }
  const { order, created } = result;

  // Side effects only for the call that actually created the order.
  if (created) {
    let method = null;
    try {
      method = (await razorpayInstance.payments.fetch(razorpay_payment_id)).method || null;
    } catch {
      /* non-fatal */
    }
    await logTransaction({
      order: order._id,
      user: order.user,
      type: "payment",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: order.grandTotal,
      method,
      status: "Success",
      idempotencyKey: `verify-success-${razorpay_payment_id}`,
    });
    const userDoc = await User.findById(order.user);
    await emailService.sendOrderConfirmation(order, userDoc);
    await sendOrderStatusSMS(order, userDoc, order.orderStatus);
    notify({
      user: order.user,
      type: "payment_success",
      title: "Order confirmed",
      message: `Payment received — your order #${order.orderNumber} is confirmed.`,
      relatedOrder: order._id,
    });
  }

  sendResponse(res, 200, { order }, "Payment verified and order confirmed successfully");
});

// @desc    Verify Razorpay payment signature and finalize order
// @route   POST /api/v1/payments/verify
// @access  Private
// NOTE: behavior/response shape is unchanged from Phase 1 — only addition is
// audit-log writes via logTransaction(), which never throw into this flow.
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !orderId
  ) {
    throw new ApiError(400, "Missing required payment verification fields");
  }

  let order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.paymentInfo.razorpayOrderId !== razorpay_order_id) {
    throw new ApiError(400, "Order ID mismatch");
  }

  const isValidSignature = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );

  if (!isValidSignature) {
    order.paymentStatus = "Failed";
    await order.save();

    await logTransaction({
      order: order._id,
      user: order.user,
      type: "payment",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: order.grandTotal,
      status: "Failed",
      failureReason: "Signature verification failed",
      idempotencyKey: `verify-fail-${razorpay_payment_id}`,
    });

    throw new ApiError(400, "Payment verification failed: invalid signature");
  }

  // Signature valid -> mark order as paid, reduce stock, apply coupon usage, clear cart.
  // BUGFIX: this used to unconditionally re-run stock reduction / coupon usage /
  // cart clearing every time this endpoint was hit, with no check for whether the
  // order was already Paid. Since the Razorpay webhook (payment.captured /
  // order.paid) can mark the same order Paid independently and concurrently with
  // this client-triggered call, that meant a race (or simply a retried/duplicate
  // /verify request) could reduce stock twice, apply the coupon usage twice, and
  // clear the cart twice for a single order. The fix reuses the same atomic
  // compare-and-swap the webhook handler already uses (paymentStatus: { $ne: 'Paid' }),
  // so only the request that actually flips Pending -> Paid runs the side effects.
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: { $ne: "Paid" } },
    {
      $set: {
        paymentStatus: "Paid",
        orderStatus: "Confirmed",
        "paymentInfo.razorpayPaymentId": razorpay_payment_id,
        "paymentInfo.razorpaySignature": razorpay_signature,
        "paymentInfo.paidAt": new Date(),
      },
      $push: {
        statusHistory: {
          status: "Confirmed",
          note: "Payment verified successfully",
        },
      },
    },
    { new: true },
  );

  let userDoc = null;

  if (updatedOrder) {
    order = updatedOrder;
    const shippingService = require("../services/shipping.service");

    const shipping = await shippingService.calculateShipping({
      deliveryPincode: order.shippingAddress.pincode,
      weight: order.packageDetails?.weightKg || 0.5,
      cod: false, // Razorpay = prepaid
      subTotal: order.subTotal,
    });

    order.shippingCharge = shipping.shippingCharge;

    order.courier = {
      partner:
        shipping.courierName === "Standard Shipping" ? "Manual" : "Shiprocket",
      courierId: shipping.courierId,
      courierName: shipping.courierName,
    };

    order.tracking.estimatedDeliveryDate = shipping.estimatedDays
      ? new Date(Date.now() + shipping.estimatedDays * 24 * 60 * 60 * 1000)
      : null;

    await order.save();
    await reduceStock(order.items, {
      orderId: order._id,
      performedBy: req.user._id,
    });

    if (order.coupon && order.coupon.code) {
      const couponDoc = await Coupon.findOne({ code: order.coupon.code });
      if (couponDoc) await couponDoc.recordUsage(order.user);
    }

    userDoc = await User.findById(order.user);
    userDoc.cart = [];
    await userDoc.save({ validateBeforeSave: false });
  } else {
    // Already marked Paid by another path (e.g. the Razorpay webhook beat this
    // request to it) — re-fetch so the response reflects current state, without
    // re-running stock reduction / coupon usage / cart clearing again.
    order = await Order.findById(order._id);
  }

  if (!userDoc) {
    userDoc = await User.findById(order.user);
  }

  // Fetch payment method from Razorpay for the audit log (best-effort, non-fatal)
  let method = null;
  try {
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);
    method = payment.method || null;
  } catch (e) {
    /* non-fatal — logged below without method */
  }

  await logTransaction({
    order: order._id,
    user: order.user,
    type: "payment",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    amount: order.grandTotal,
    method,
    status: "Success",
    idempotencyKey: `verify-success-${razorpay_payment_id}`,
  });

  // FEATURE 5: only sent after the payment is already verified & the order
  // already saved as Paid/Confirmed above — a failure here (FEATURE 7) is
  // logged by emailService and never affects this response.
  await emailService.sendOrderConfirmation(order, userDoc);

  // "Confirmed" SMS — gated on `updatedOrder` (the same compare-and-swap
  // guard stock reduction/coupon usage/cart-clearing above already rely on)
  // so a retried or duplicate /verify call for an already-confirmed order
  // never sends a second message.
  if (updatedOrder) {
    await sendOrderStatusSMS(order, userDoc, order.orderStatus);
  }

  sendResponse(
    res,
    200,
    { order },
    "Payment verified and order confirmed successfully",
  );
});

// @desc    Handle payment failure callback from client
// @route   POST /api/v1/payments/failure
// @access  Private
// NOTE: unchanged response shape from Phase 1 — adds an audit-log write only.
const paymentFailed = asyncHandler(async (req, res) => {
  const { orderId, reason, razorpay_payment_id } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  // BUGFIX: this client-triggered "failure" callback used to unconditionally
  // overwrite paymentStatus to 'Failed', with no check for whether the order
  // was already Paid. Since the Razorpay webhook can independently mark the
  // order Paid (e.g. the payment actually succeeded but the browser missed
  // the redirect and fired this failure callback), that race could downgrade
  // an already-paid order back to 'Failed'. The webhook's own failure handler
  // already guards this the same way (see handlePaymentFailed) — mirror it here.
  if (order.paymentStatus === "Paid") {
    return sendResponse(res, 200, { order }, "Payment failure recorded");
  }

  order.paymentStatus = "Failed";
  order.statusHistory.push({
    status: order.orderStatus,
    note: "Payment failed",
  });
  await order.save();

  await logTransaction({
    order: order._id,
    user: order.user,
    type: "payment",
    razorpayOrderId: order.paymentInfo?.razorpayOrderId,
    razorpayPaymentId: razorpay_payment_id || null,
    amount: order.grandTotal,
    status: "Failed",
    failureReason: reason || "Payment failed (client callback)",
    idempotencyKey: razorpay_payment_id
      ? `client-fail-${razorpay_payment_id}`
      : undefined,
  });

  try {
    const user = await User.findById(order.user).select("name email");
    if (user) {
      await sendEmail({
        to: user.email,
        subject: `Payment Failed - ${order.orderNumber}`,
        html: templates.paymentFailed(user.name, order, reason),
      });
    }
  } catch (e) {
    /* non-fatal */
  }

  notify({
    user: order.user,
    type: "payment_failed",
    title: "Payment failed",
    message: `Your payment for order #${order.orderNumber} could not be processed.`,
    relatedOrder: order._id,
  });

  sendResponse(res, 200, { order }, "Payment failure recorded");
});

// @desc    Record that the customer abandoned/cancelled checkout before paying
// @route   POST /api/v1/payments/cancelled
// @access  Private
const paymentCancelled = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw new ApiError(400, "orderId is required");

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to modify this order");
  }

  if (order.paymentStatus === "Paid") {
    throw new ApiError(400, "This order has already been paid for");
  }

  order.paymentStatus = "Failed";
  order.statusHistory.push({
    status: order.orderStatus,
    note: "Payment cancelled by customer",
  });
  await order.save();

  await logTransaction({
    order: order._id,
    user: order.user,
    type: "payment",
    razorpayOrderId: order.paymentInfo?.razorpayOrderId,
    amount: order.grandTotal,
    status: "Cancelled",
    failureReason: "Cancelled by customer before completing checkout",
  });

  sendResponse(res, 200, { order }, "Payment cancellation recorded");
});

// @desc    Retry payment for an order whose previous payment attempt failed
//          or was cancelled — creates a fresh Razorpay order for the same
//          grand total so the customer can re-attempt checkout.
// @route   POST /api/v1/payments/:orderId/retry
// @access  Private
const retryPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to retry payment for this order",
    );
  }

  if (order.paymentMethod !== "razorpay") {
    throw new ApiError(
      400,
      "Only online (Razorpay) orders support payment retry",
    );
  }

  if (order.paymentStatus === "Paid") {
    throw new ApiError(400, "This order has already been paid for");
  }

  if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Cannot retry payment — order is currently "${order.orderStatus}"`,
    );
  }

  const razorpayOrder = await razorpayInstance.orders.create({
    amount: Math.round(order.grandTotal * 100),
    currency: "INR",
    receipt: `${order.orderNumber}-retry-${Date.now()}`,
  });

  order.paymentInfo.razorpayOrderId = razorpayOrder.id;
  order.paymentStatus = "Pending";
  order.statusHistory.push({
    status: order.orderStatus,
    note: "Payment retry initiated",
    changedBy: req.user._id,
  });
  await order.save();

  await logTransaction({
    order: order._id,
    user: order.user,
    type: "payment",
    razorpayOrderId: razorpayOrder.id,
    amount: order.grandTotal,
    status: "Retried",
  });

  sendResponse(
    res,
    200,
    { order, razorpayOrder, razorpayKeyId: process.env.RAZORPAY_KEY_ID },
    "Payment retry initiated. Proceed to payment.",
  );
});

// @desc    List payment transactions for an order (owner or admin)
// @route   GET /api/v1/payments/:orderId/transactions
// @access  Private
const getOrderTransactions = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, "Order not found");

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(
      403,
      "You are not authorized to view these transactions",
    );
  }

  const transactions = await PaymentTransaction.find({ order: order._id }).sort(
    "-createdAt",
  );

  // Customers get a redacted view — no raw gateway payloads
  const payload =
    isOwner && req.user.role !== "admin"
      ? transactions.map((t) => {
          const obj = t.toObject();
          delete obj.gatewayResponse;
          return obj;
        })
      : transactions;

  sendResponse(
    res,
    200,
    { transactions: payload },
    "Payment transactions fetched successfully",
  );
});

module.exports = {
  createIntent,
  confirmIntent,
  verifyPayment,
  paymentFailed,
  paymentCancelled,
  retryPayment,
  getOrderTransactions,
};
