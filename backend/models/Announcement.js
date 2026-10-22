const mongoose = require("mongoose");

/**
 * A single scrolling message in the storefront's top announcement marquee.
 * Mirrors HomeSection's sortOrder/isActive convention so the admin CRUD +
 * reorder pattern can be copied directly.
 */
const announcementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // Seconds for one full marquee loop — lower is faster.
    scrollSpeed: { type: Number, default: 40, min: 5 },
    repeat: { type: Boolean, default: true },
  },
  { timestamps: true },
);

announcementSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);
