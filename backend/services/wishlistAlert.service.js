const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { notify } = require('./notification.service');
require('../models/EventLock');

/**
 * Wishlist alerts — price drop and back in stock — for every customer who
 * has the product in their wishlist. Fed by the live-sync change stream with
 * the product's state before and after the write (MongoDB pre-images), so it
 * works whichever code path changed the price or stock.
 */
const THROTTLE_MS = 24 * 60 * 60 * 1000; // one alert per user, product and kind per day
const CHUNK = 50;

const effectivePrice = (p) => {
  const price = Number(p?.price) || 0;
  const sale = Number(p?.salePrice) || 0;
  return sale > 0 && (price === 0 || sale < price) ? sale : price;
};

const rupees = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const productImage = (p) => {
  const url = p?.thumbnail?.url || p?.images?.[0]?.url || '';
  return /^https:\/\//i.test(url) ? url : null;
};

/** Decides which alerts a product change triggers (pure — easy to test). */
const detectAlerts = (before, after) => {
  const alerts = [];
  if (!before || !after) return alerts;
  if (after.isDeleted || (after.status && after.status !== 'active')) return alerts;
  const oldPrice = effectivePrice(before);
  const newPrice = effectivePrice(after);
  if (oldPrice > 0 && newPrice > 0 && newPrice < oldPrice) alerts.push({ kind: 'price_drop', oldPrice, newPrice });
  if ((Number(before.stock) || 0) <= 0 && (Number(after.stock) || 0) > 0) alerts.push({ kind: 'back_in_stock' });
  return alerts;
};

const sendAlert = async (product, alert) => {
  const User = mongoose.model('User');
  const Notification = mongoose.model('Notification');
  const type = alert.kind === 'price_drop' ? 'wishlist_price_drop' : 'back_in_stock';
  const title = alert.kind === 'price_drop' ? `Price drop: ${product.title}` : `Back in stock: ${product.title}`;
  const message =
    alert.kind === 'price_drop'
      ? `Now ${rupees(alert.newPrice)} (was ${rupees(alert.oldPrice)}) — the piece on your wishlist just got better.`
      : 'A piece on your wishlist is available again. Order before it sells out.';

  const users = await User.find({ wishlist: product._id, isActive: true }).select('_id').lean();
  if (users.length === 0) return 0;

  const since = new Date(Date.now() - THROTTLE_MS);
  const recent = await Notification.find({ user: { $in: users.map((u) => u._id) }, relatedProduct: product._id, type, createdAt: { $gte: since } })
    .select('user')
    .lean();
  const skip = new Set(recent.map((n) => String(n.user)));
  const recipients = users.filter((u) => !skip.has(String(u._id)));

  for (let i = 0; i < recipients.length; i += CHUNK) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.allSettled(
      recipients.slice(i, i + CHUNK).map((u) =>
        notify({
          user: u._id,
          type,
          title,
          message,
          link: product.slug ? `/products/${product.slug}` : null,
          relatedProduct: product._id,
          imageUrl: productImage(product),
        }),
      ),
    );
  }
  return recipients.length;
};

/**
 * @param {object} change — a change-stream update event for the products
 *   collection, opened with fullDocumentBeforeChange: 'whenAvailable'.
 */
const onProductChange = async (change) => {
  const before = change.fullDocumentBeforeChange;
  if (!before) return 0;
  const after = { ...before, ...(change.updateDescription?.updatedFields || {}) };
  const alerts = detectAlerts(before, after);
  if (alerts.length === 0) return 0;
  // Every API instance sees this change — only the first one sends.
  const eventKey = change._id?._data || JSON.stringify(change._id);
  if (!(await mongoose.model('EventLock').acquire(`wishlist-alert:${eventKey}`))) return 0;
  let sent = 0;
  for (const alert of alerts) {
    try {
      // eslint-disable-next-line no-await-in-loop
      sent += await sendAlert({ ...after, _id: before._id }, alert);
    } catch (err) {
      logger.error(`Wishlist ${alert.kind} alert failed for product ${before._id}: ${err.message}`);
    }
  }
  if (sent) logger.info(`Wishlist alerts sent: ${sent} for product ${before._id} (${alerts.map((a) => a.kind).join(', ')})`);
  return sent;
};

module.exports = { onProductChange, detectAlerts, effectivePrice };
