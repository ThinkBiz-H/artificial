const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      pincode: { type: String, default: '' },
    },
    contactPerson: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '', trim: true, lowercase: true },
    // Storage capacity in units (0 = not tracked) — for utilisation on the dashboard.
    capacity: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '', trim: true, maxlength: 500 },
    isDefault: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

warehouseSchema.index({ isDefault: 1 });
// Database-level guarantee: at most one default warehouse. (Separate key
// direction so it doesn't clash with the plain isDefault index above.)
warehouseSchema.index({ isDefault: -1 }, { unique: true, partialFilterExpression: { isDefault: true }, name: 'one_default_warehouse' });

module.exports = mongoose.model('Warehouse', warehouseSchema);
