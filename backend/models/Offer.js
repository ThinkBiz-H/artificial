const mongoose = require("mongoose");

/**
 * Automatic offers (no code needed) — festival / category / product /
 * store-wide, flat or percentage, for a limited time. While an offer runs
 * services/offer.service.js writes the discounted price into each target's
 * salePrice (so cart, checkout, invoices and the app need no changes) and
 * keeps the previous sale price in `applied` to restore it afterwards.
 */
const offerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    kind: { type: String, enum: ["festival", "category", "product", "store"], default: "category" },
    discountType: { type: String, enum: ["percentage", "flat"], default: "percentage" },
    value: { type: Number, required: true, min: 0 },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    startsAt: { type: Date, default: Date.now },
    endsAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true, default: "", maxlength: 500 },

    // Bookkeeping (server-managed).
    status: { type: String, enum: ["scheduled", "running", "ended"], default: "scheduled" },
    applied: [
      {
        _id: false,
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", default: null },
        previousSalePrice: { type: Number, default: null },
      },
    ],
    appliedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

offerSchema.index({ status: 1, isActive: 1, startsAt: 1, endsAt: 1 });

module.exports = mongoose.model("Offer", offerSchema);
