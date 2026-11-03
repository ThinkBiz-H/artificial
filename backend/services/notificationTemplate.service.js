const NotificationTemplate = require('../models/NotificationTemplate');

/** Replaces {{variableName}} placeholders with values from `variables`. Missing keys are left as-is (visible, not silently blanked). */
const interpolate = (str, variables = {}) =>
  (str || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => (variables[key] !== undefined ? String(variables[key]) : match));

// Built-in fallbacks for notification types introduced in this phase that
// don't have an equivalent in the existing utils/sendEmail.js templates.
// Existing types (order_confirmed, payment_success, etc.) are NOT
// duplicated here — their current call sites keep calling sendEmail()
// directly with their existing hardcoded templates, untouched. These
// defaults only apply until an admin overrides them via the DB.
const builtInDefaults = {
  'blog_published:email': { subject: 'Your post "{{title}}" is live', body: 'Hi {{name}}, your blog post "{{title}}" has just been published.' },
  'admin_broadcast:email': { subject: '{{subject}}', body: '{{message}}' },
  'admin_broadcast:sms': { subject: '', body: '{{message}}' },
  'low_stock:email': { subject: 'Low stock: {{productTitle}}', body: '{{productTitle}} is low on stock ({{available}} left) at {{warehouseName}}.' },
  // Push for customer-facing events: same title/message as the in-app
  // notification. An admin template for (type, 'push') overrides it, and an
  // inactive one switches that push off.
  ...Object.fromEntries(
    [
      'order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled',
      'payment_success', 'payment_failed', 'refund_processed', 'return_approved',
      'wishlist_price_drop', 'back_in_stock', 'coupon', 'flash_sale', 'promotion',
    ].map((type) => [`${type}:push`, { subject: '{{title}}', body: '{{message}}' }]),
  ),
};

/**
 * Resolves the template for (type, channel): an active admin-configured
 * DB template takes priority; otherwise a built-in default; otherwise
 * `null` (meaning: don't send on this channel for this type — silence is
 * the correct behavior here, not an error, since most types are only
 * meant to go out on some channels).
 */
const renderTemplate = async (type, channel, variables = {}) => {
  const dbTemplate = await NotificationTemplate.findOne({ type, channel });
  // An admin template switched off (isActive: false) disables this channel
  // for this type, rather than falling back to the built-in default.
  if (dbTemplate && !dbTemplate.isActive) return null;
  const source = dbTemplate || builtInDefaults[`${type}:${channel}`];
  if (!source) return null;

  return {
    subject: interpolate(source.subject, variables),
    body: interpolate(source.body, variables),
  };
};

module.exports = { renderTemplate, interpolate };
