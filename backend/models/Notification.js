const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'order_confirmed',
        'payment_success',
        'payment_failed',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'return_approved',
        'refund_processed',
        'wishlist_price_drop',
        'coupon',
        'low_stock',
        'blog_published',
        'admin_broadcast',
        'otp',
        'system',
      ],
      default: 'system',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    // Optional deep-link data so the frontend can navigate straight to the
    // relevant order/product without an extra lookup.
    link: { type: String, default: null },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
