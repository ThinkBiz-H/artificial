const mongoose = require("mongoose");

const contactInquirySchema = new mongoose.Schema(
  {
    inquiryType: { type: String, trim: true, default: "General Inquiry" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    // Support-ticket workflow (Admin > Support).
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open', index: true },
    priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    replies: [
      {
        message: { type: String, required: true, trim: true },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        byName: { type: String, default: '' },
        emailed: { type: Boolean, default: false },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

contactInquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model("ContactInquiry", contactInquirySchema);
