const mongoose = require('mongoose');

/**
 * Version history of every brand logo slot (Brand Management). The current
 * version is referenced from Settings.brand.assets[slot].versionId; older
 * ones can be restored. The newest few per slot are kept (brand controller).
 */
const brandAssetVersionSchema = new mongoose.Schema(
  {
    slot: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    format: { type: String, default: '' },
    bytes: { type: Number, default: null },
    version: { type: Number, default: null }, // Cloudinary version
    // upload: uploaded here (owned by branding — may be deleted when pruned)
    // media: picked from the Media Library (never deleted from here)
    // import: from an imported brand file
    source: { type: String, enum: ['upload', 'media', 'import'], default: 'upload' },
    originalName: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

brandAssetVersionSchema.index({ slot: 1, createdAt: -1 });

module.exports = mongoose.model('BrandAssetVersion', brandAssetVersionSchema);
