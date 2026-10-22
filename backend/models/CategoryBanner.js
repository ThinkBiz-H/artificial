const mongoose = require("mongoose");

/**
 * A marketing banner targeted at one or more categories (parent or child).
 * `categories` stores the exact set of category ids the admin picked; a
 * product matches a banner if the product's category OR any of that
 * category's ancestors appears in this array — see
 * categoryBanner.controller.js#getBannerByCategory for the matching logic.
 */
const categoryBannerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    desktopImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    mobileImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    buttonText: { type: String, default: "" },
    buttonLink: { type: String, default: "" },
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    priority: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true },
);

categoryBannerSchema.index({ categories: 1, status: 1, priority: 1 });

module.exports = mongoose.model("CategoryBanner", categoryBannerSchema);
