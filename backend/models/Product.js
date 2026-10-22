const mongoose = require("mongoose");
const slugify = require("slugify");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    images: [{ url: String, publicId: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true },
    SKU: { type: String, unique: true, sparse: true },
    barcode: { type: String },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },

    // LEGACY (resin era) — unit of measure (Kg, Litre…). No longer shown in
    // the admin or storefront for jewellery, but kept in the schema so
    // existing documents and older API clients (Flutter) keep working.
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", default: null },
    unitValue: { type: Number, min: 0, default: 1 },

    // `price` is, and has always been, the final customer-facing selling
    // price — every existing product's price is already GST-inclusive and
    // this field's meaning/usage never changes anywhere downstream (cart,
    // checkout, orders, invoices, coupons, reports all read this one field
    // exactly as before). The four fields below are additive GST bookkeeping
    // metadata computed by utils/gstPricing.js, used only by the admin
    // product form to derive `price` for NEW/EDITED products — see
    // controllers/product.controller.js createProduct/updateProduct.
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },

    // GST configuration (additive — see note above). `basePrice`/`gstAmount`
    // deliberately have NO default: existing products predating this feature
    // never had them computed, and this project must never fabricate a
    // historical tax breakdown for data that was never actually broken down.
    // `priceIncludesGST` defaults to true and `gstRate` to 18 so any existing
    // product read through Mongoose (schema defaults apply to any path
    // missing from the stored document, even a pre-existing one) reports
    // "price already includes GST" — the one behavior requirement for
    // backward compatibility — without a database migration.
    basePrice: { type: Number, min: 0 },
    gstRate: { type: Number, min: 0, max: 100, default: 18 },
    gstAmount: { type: Number, min: 0 },
    priceIncludesGST: { type: Boolean, default: true },

    images: [{ url: String, publicId: String }],
    thumbnail: { url: String, publicId: String },

    // Downloadable files (spec sheets, care instructions, certificates) and
    // an optional product video — additive "Dynamic Media" fields.
    documents: [{ url: String, publicId: String, name: String }],
    videoUrl: { type: String, default: "" },

    tags: [{ type: String }],
    attributes: [{ key: String, value: String }],

    // Jewellery options. `colorOptions` is the source of truth for colours
    // (name + swatch hex + optional gallery picked from this product's
    // images); `colors` is kept as a plain name list, synced from it on save,
    // for older API clients. `sizes` stays a plain list ("2.4", "7", "Free Size").
    colorOptions: [
      {
        name: { type: String, required: true, trim: true },
        hex: { type: String, trim: true, default: "" },
        images: [{ url: String, publicId: String }],
      },
    ],
    colors: [{ type: String }],
    sizes: [{ type: String }],
    metal: { type: String, trim: true, default: "" }, // e.g. Brass, Copper, Alloy
    plating: { type: String, trim: true, default: "" }, // e.g. Gold Plated, Rhodium

    // Phase 5 — set true once the product has ≥1 Variant document (see
    // models/Variant.js). A product with hasVariants=false is still sold
    // directly off its own price/salePrice/stock, exactly as before —
    // this is purely additive and doesn't change existing simple products.
    hasVariants: { type: Boolean, default: false },

    // Cross-merchandising — plain Product refs, admin-curated.
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    crossSell: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    upSell: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // Shipping / warehouse details
    weight: { type: Number, min: 0 }, // kg
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, enum: ["cm", "in"], default: "cm" },
    },
    shippingClass: { type: String, default: "" }, // free-text, admin-defined (e.g. "Fragile", "Oversized")

    minOrderQuantity: { type: Number, min: 1, default: 1 },
    maxOrderQuantity: { type: Number, min: 1 },

    warranty: { type: String, default: "" },
    returnPolicy: { type: String, default: "" },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],

    // Additive counters used for "popularity" sort and recommendation rails
    // (trending / best sellers). salesCount is incremented whenever an order
    // containing this product is paid; viewCount on each product-detail view.
    salesCount: { type: Number, default: 0, min: 0 },
    viewCount: { type: Number, default: 0, min: 0 },

    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },

    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

productSchema.pre("save", function () {
  // Keep the legacy `colors` name list in step with `colorOptions`.
  if (this.isModified("colorOptions") && this.colorOptions?.length) {
    this.colors = this.colorOptions.map((c) => c.name);
  }
  if (this.isModified("title")) {
    this.slug =
      slugify(this.title, {
        lower: true,
        strict: true,
      }) +
      "-" +
      Date.now().toString().slice(-5);
  }
}); 
productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, brand: 1, price: 1, status: 1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ rating: -1, numReviews: -1 });
productSchema.index({ unit: 1 });
// Default storefront listing: non-deleted products, newest first.
productSchema.index({ isDeleted: 1, createdAt: -1 });

// Virtual populate — this product's variants (see models/Variant.js).
// Use with .populate('variants').
productSchema.virtual("variants", {
  ref: "Variant",
  localField: "_id",
  foreignField: "product",
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

// Excludes soft-deleted products by default in common queries via statics
productSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, isDeleted: false });
};

module.exports = mongoose.model("Product", productSchema);
