const mongoose = require("mongoose");

/**
 * Append-only audit log of every payment-related event (attempt, success,
 * failure, retry, refund). Nothing here is ever mutated after creation —
 * new events get new documents — so this doubles as the payment audit trail
 * required by Phase 2 item 8.
 */
const paymentTransactionSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: ["payment", "refund"],
      default: "payment",
      required: true,
    },

    // Razorpay identifiers (whichever apply to this event)
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    razorpayRefundId: { type: String, default: null },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String, default: null }, // card, upi, netbanking, wallet, cod, etc.

    status: {
      type: String,
      enum: [
        "Created", // razorpay order created, awaiting payment
        "Success",
        "Failed",
        "Cancelled",
        "Retried",
        "Refund Initiated",
        "Refund Processing",
        "Refund Completed",
        "Refund Failed",
      ],
      required: true,
    },

    failureReason: { type: String, default: null },

    // Raw gateway payload for debugging/audit — never exposed verbatim to customers
    gatewayResponse: { type: mongoose.Schema.Types.Mixed, default: null },

    // Idempotency key so the same webhook event is never processed twice
    // (Razorpay's `event_id` / payment/refund id + event type combo)
    idempotencyKey: { type: String, default: null, index: true, unique: true, sparse: true },

    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // admin, for manual refunds
  },
  { timestamps: true },
);

paymentTransactionSchema.index({ order: 1, createdAt: -1 });
paymentTransactionSchema.index({ razorpayPaymentId: 1 });
// Admin transactions page: newest first across all orders.
paymentTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
