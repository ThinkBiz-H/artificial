const mongoose = require("mongoose");

const workshopCardSchema = new mongoose.Schema(
  {
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    heading: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

workshopCardSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model("WorkshopCard", workshopCardSchema);
