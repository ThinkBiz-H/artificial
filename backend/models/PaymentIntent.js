const mongoose = require("mongoose");

/**
 * An online-payment checkout that hasn't been paid yet.
 *
 * Online checkout must not create an Order until the payment succeeds, so
 * the fully priced order (items, address, totals — computed server-side
 * when the shopper clicked "Place order") waits here, keyed by its Razorpay
 * order id. The Order is created only when the payment is verified, either
 * by the browser (POST /payments/intent/confirm) or by Razorpay's webhook if
 * the shopper closed the tab after paying. Unpaid intents expire on their own.
 */
const paymentIntentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true }, // grand total in rupees
    // Everything needed for Order.create() except payment status/info.
    orderData: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: String, enum: ["created", "converted"], default: "created", index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    // Only unpaid intents carry an expiry; it is removed on conversion so the
    // record of a paid checkout is kept.
    expiresAt: { type: Date, default: () => new Date(Date.now() + 48 * 60 * 60 * 1000) },
  },
  { timestamps: true },
);

paymentIntentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PaymentIntent", paymentIntentSchema);
