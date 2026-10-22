const mongoose = require("mongoose");

/**
 * A flexible, unordered-count homepage building block. `type` is a free
 * string (not a fixed enum) — "hero", "banner", "featured_products",
 * "categories", "promo", "text", "image", "cta", or anything else the admin
 * (and frontend) agree on later, without a backend code change. `config`
 * carries whatever section-type-specific extra data the frontend needs
 * (e.g. a category id for a "featured category" block) without needing a
 * new field/model per type.
 */

// One Hero slide. Lives under a `type: "hero"` HomeSection's `slides[]`.
const slideSchema = new mongoose.Schema(
  {
    desktopImage: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
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
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// One Reel video. Lives under a `type: "reels"` HomeSection's `reels[]`.
const reelSchema = new mongoose.Schema(
  {
    video: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    thumbnail: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    title: { type: String, default: "" },
    link: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const homeSectionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    content: { type: String, default: "" },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    videos: [
      {
        url: String,
        publicId: String,
      },
    ],
    gallery: [
      {
        url: String,
        publicId: String,
      },
    ],
    button: {
      label: { type: String, default: "" },
      link: { type: String, default: "" },
    },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    slides: [slideSchema],
    reels: [reelSchema],
  },
  { timestamps: true },
);

homeSectionSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("HomeSection", homeSectionSchema);
