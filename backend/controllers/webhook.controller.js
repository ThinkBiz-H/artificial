const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const Order = require("../models/Order");
const WebhookEvent = require("../models/WebhookEvent");
const { canTransition } = require("../utils/orderStatusMachine");
const { pushStatusHistory } = require("../services/order.service");
const { verifyWebhookSignature } = require("../services/payment.service");
const { buildEventIdempotencyKey, processEvent } = require("../services/razorpayWebhook.service");
const emailService = require("../services/emailService");
const { sendOrderStatusSMS } = require("../services/sms.service");
const { notify } = require("../services/notification.service");
const logger = require("../utils/logger");

// Maps Shiprocket's free-text "current_status" values to our internal
// shipment status enum + (optionally) a matching high-level order status.
const STATUS_MAP = {
  "AWB ASSIGNED": { shipmentStatus: "AWB Assigned" },
  "PICKUP SCHEDULED": { shipmentStatus: "Pickup Scheduled" },
  "PICKUP GENERATED": { shipmentStatus: "Pickup Generated" },
  "PICKED UP": { shipmentStatus: "In Transit", orderStatus: "Shipped" },
  "IN TRANSIT": { shipmentStatus: "In Transit", orderStatus: "Shipped" },
  "SHIPPED": { shipmentStatus: "In Transit", orderStatus: "Shipped" },
  "OUT FOR DELIVERY": { shipmentStatus: "Out For Delivery", orderStatus: "Out For Delivery" },
  "DELIVERED": { shipmentStatus: "Delivered", orderStatus: "Delivered" },
  "UNDELIVERED": { shipmentStatus: "Delivery Failed" },
  "DELIVERY FAILED": { shipmentStatus: "Delivery Failed" },
  "RTO INITIATED": { shipmentStatus: "RTO Initiated", orderStatus: "Returned" },
  "RTO DELIVERED": { shipmentStatus: "RTO Delivered" },
  "CANCELLED": { shipmentStatus: "Cancelled", orderStatus: "Cancelled" },
  "CANCELED": { shipmentStatus: "Cancelled", orderStatus: "Cancelled" },
};

// @desc    Receives shipment status webhooks from Shiprocket and syncs the
//          matching Order document. Verified via a shared-secret header
//          configured in the Shiprocket dashboard (SHIPROCKET_WEBHOOK_TOKEN).
// @route   POST /api/v1/webhooks/shiprocket
// @access  Public (token-verified)
const shiprocketWebhook = asyncHandler(async (req, res) => {
  const providedToken = req.headers["x-api-key"] || req.headers["x-webhook-token"];
  const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;

  if (!expectedToken || providedToken !== expectedToken) {
    throw new ApiError(401, "Invalid webhook token");
  }

  const { awb, current_status: currentStatusRaw, order_id: shiprocketOrderId } = req.body;

  if (!awb && !shiprocketOrderId) {
    throw new ApiError(400, "Webhook payload missing awb / order_id");
  }

  const order = awb
    ? await Order.findOne({ "shiprocket.awbCode": awb })
    : await Order.findOne({ "shiprocket.orderId": String(shiprocketOrderId) });

  if (!order) {
    // Acknowledge with 200 so Shiprocket doesn't retry indefinitely for an
    // order that doesn't exist in our system (e.g. test webhook).
    logger.warn(`Shiprocket webhook: no matching order for awb=${awb} order_id=${shiprocketOrderId}`);
    return sendResponse(res, 200, {}, "No matching order found; ignored");
  }

  const mapping = STATUS_MAP[String(currentStatusRaw || "").toUpperCase().trim()];

  if (!mapping) {
    logger.info(`Shiprocket webhook: unmapped status "${currentStatusRaw}" for order ${order.orderNumber}`);
    return sendResponse(res, 200, {}, "Status not mapped; stored raw only");
  }

  if (mapping.shipmentStatus) {
    order.tracking.shipmentStatus = mapping.shipmentStatus;
  }

  // Only an actually-applied transition should trigger a status email
  // (FEATURE 6) — a skipped/invalid mapping never changes order.orderStatus.
  let statusChanged = false;

  if (mapping.orderStatus && canTransition(order.orderStatus, mapping.orderStatus)) {
    pushStatusHistory(
      order,
      mapping.orderStatus,
      `Auto-updated from Shiprocket webhook (status: ${currentStatusRaw})`,
    );
    statusChanged = true;

    if (mapping.orderStatus === "Delivered") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "cod") order.paymentStatus = "Paid";
    }
  } else if (mapping.orderStatus) {
    logger.info(
      `Shiprocket webhook: skipped invalid transition ${order.orderStatus} -> ${mapping.orderStatus} for order ${order.orderNumber}`,
    );
  }

  await order.save();

  if (statusChanged) {
    const populated = await order.populate("user", "name email mobile");
    await emailService.sendOrderStatusUpdate(order, populated.user);
    await sendOrderStatusSMS(order, populated.user, order.orderStatus);
  }

  sendResponse(res, 200, { order: { orderNumber: order.orderNumber, orderStatus: order.orderStatus } }, "Webhook processed");
});

// @desc    Receives payment/refund status webhooks from Razorpay. Verifies
//          the HMAC signature against the raw request body, de-duplicates
//          via a unique idempotency key (so retried/duplicate deliveries
//          are never processed twice), and syncs Order + PaymentTransaction.
// @route   POST /api/v1/webhooks/razorpay
// @access  Public (signature-verified)
const razorpayWebhook = asyncHandler(async (req, res) => {
  const startedAt = Date.now();
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.rawBody; // captured by the express.json() `verify` hook in app.js

  if (!signature || !rawBody) {
    throw new ApiError(400, "Missing webhook signature or raw body");
  }

  const signatureValid = verifyWebhookSignature(rawBody, signature);
  const event = req.body?.event;
  const payload = req.body?.payload;

  if (!signatureValid) {
    logger.error(`Razorpay webhook signature verification FAILED for event "${event}"`);
    try {
      await WebhookEvent.create({
        provider: "razorpay",
        event: event || "unknown",
        idempotencyKey: `invalid-sig-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        signatureValid: false,
        status: "Failed",
        rawBody: rawBody.toString("utf8"),
        errorMessage: "Signature verification failed",
        processingTimeMs: Date.now() - startedAt,
      });
    } catch (logError) {
      // Audit-log write failing must never mask the real security decision —
      // an invalid signature is still rejected with 400 either way.
      logger.error(`Failed to persist invalid-signature webhook audit log: ${logError.message}`);
    }
    throw new ApiError(400, "Invalid webhook signature");
  }

  if (!event || !payload) {
    throw new ApiError(400, "Malformed webhook payload — missing event/payload");
  }

  const idempotencyKey = buildEventIdempotencyKey(event, payload) || `${event}-${Date.now()}`;

  // Insert-first dedup gate: the unique index on idempotencyKey means a
  // genuinely duplicate delivery fails here with a Mongo E11000 error,
  // *before* any business logic runs — this is atomic even under
  // concurrent duplicate deliveries, unlike a "check then act" read+write.
  let webhookEvent;
  try {
    webhookEvent = await WebhookEvent.create({
      provider: "razorpay",
      event,
      idempotencyKey,
      signatureValid: true,
      status: "Received",
      rawBody: rawBody.toString("utf8"),
    });
  } catch (error) {
    if (error.code === 11000) {
      logger.info(`Razorpay webhook duplicate ignored: ${idempotencyKey}`);
      return sendResponse(res, 200, {}, "Duplicate webhook event — already processed");
    }
    throw error;
  }

  try {
    const result = await processEvent(event, payload);

    if (!result.handled) {
      webhookEvent.status = "Ignored";
      webhookEvent.processingTimeMs = Date.now() - startedAt;
      await webhookEvent.save();
      logger.info(`Razorpay webhook: unmapped event type "${event}" ignored`);
      return sendResponse(res, 200, {}, "Event type not handled; acknowledged");
    }

    webhookEvent.status = result.matched ? "Processed" : "Ignored";
    webhookEvent.relatedOrder = result.order?._id || null;
    webhookEvent.processingTimeMs = Date.now() - startedAt;
    await webhookEvent.save();

    if (!result.matched) {
      // Acknowledge with 200 — retrying won't make a matching order appear.
      return sendResponse(res, 200, {}, "No matching order found; acknowledged");
    }

    // Send delivery-relevant emails/SMS outside the transaction,
    // best-effort. Razorpay can send both `payment.captured` and
    // `order.paid` for the same payment — each is a genuinely distinct
    // event (its own idempotencyKey, so the dedup gate above doesn't catch
    // it), but only the FIRST one to actually flip the order to Paid should
    // notify the customer; `result.note` (set by markOrderPaidIfNeeded in
    // razorpayWebhook.service.js) tells us which this was.
    const orderNewlyConfirmed = result.note !== "Order was already marked Paid";
    if ((event === "payment.captured" || event === "order.paid") && orderNewlyConfirmed) {
      const populated = await result.order.populate("user", "name email mobile");
      await emailService.sendOrderConfirmation(result.order, populated.user);
      await sendOrderStatusSMS(result.order, populated.user, result.order.orderStatus);

      notify({
        user: result.order.user,
        type: "payment_success",
        title: "Payment received",
        message: `Payment received for order #${result.order.orderNumber}.`,
        relatedOrder: result.order._id,
      });
    }

    sendResponse(res, 200, { orderNumber: result.order.orderNumber }, "Webhook processed successfully");
  } catch (error) {
    webhookEvent.status = "Failed";
    webhookEvent.errorMessage = error.message;
    webhookEvent.processingTimeMs = Date.now() - startedAt;
    await webhookEvent.save().catch(() => {});
    logger.error(`Razorpay webhook processing failed for event "${event}": ${error.message}`);
    // 500 so Razorpay retries — this was an internal failure (DB, etc), not
    // a permanent "won't ever succeed" condition.
    throw new ApiError(500, "Webhook processing failed, will be retried");
  }
});

module.exports = { shiprocketWebhook, razorpayWebhook };
