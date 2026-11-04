const mongoose = require("mongoose");

/**
 * Wallet and reward-point history for a business customer. Every change to
 * User.walletBalance / User.rewardPoints writes one row here, so the
 * balance can always be explained (Admin > Customers > Wallet & points).
 */
const customerLedgerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: ["wallet", "points"], required: true },
    amount: { type: Number, required: true }, // + credit / − debit
    balanceAfter: { type: Number, required: true },
    note: { type: String, trim: true, default: "", maxlength: 300 },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

customerLedgerSchema.index({ user: 1, kind: 1, createdAt: -1 });

module.exports = mongoose.model("CustomerLedger", customerLedgerSchema);
