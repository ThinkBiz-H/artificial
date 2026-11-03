const mongoose = require('mongoose');

/**
 * A push (and optional in-app) notification sent from the admin
 * Notification Center: history, scheduling, delivery status and click
 * analytics in one record.
 */
const CATEGORIES = [
  'general',
  'promotional',
  'flash_sale',
  'coupon',
  'price_drop',
  'back_in_stock',
  'wishlist',
  'order',
  'payment',
];

const notificationCampaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 500 },
    imageUrl: { type: String, default: '' },
    // Deep link — a website path ("/products/slug", "/category/rings") or full URL.
    link: { type: String, default: '' },
    category: { type: String, enum: CATEGORIES, default: 'general' },

    audience: {
      type: { type: String, enum: ['all', 'users', 'topic', 'admins'], default: 'all' },
      userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      topic: { type: String, default: '' },
    },
    saveInApp: { type: Boolean, default: true }, // also add to each recipient's in-app inbox

    template: { type: mongoose.Schema.Types.ObjectId, ref: 'NotificationTemplate', default: null },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    error: { type: String, default: '' },

    stats: {
      targetedUsers: { type: Number, default: 0 },
      devices: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 }, // accepted by FCM
      failed: { type: Number, default: 0 },
      invalidTokensRemoved: { type: Number, default: 0 },
      inApp: { type: Number, default: 0 },
      opened: { type: Number, default: 0 }, // notification taps reported by the app
    },
    provider: { type: String, default: '' }, // firebase | console-fallback

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

notificationCampaignSchema.index({ status: 1, scheduledAt: 1 });
notificationCampaignSchema.index({ createdAt: -1 });

notificationCampaignSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('NotificationCampaign', notificationCampaignSchema);
