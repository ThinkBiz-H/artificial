const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');
const { renderTemplate } = require('./notificationTemplate.service');
const { enqueue } = require('./notificationQueue.service');

/**
 * Creates an in-app notification for a user — always, exactly as before
 * this phase, for every existing caller (order/payment/webhook/inventory
 * controllers). Additively, if an active template exists for
 * (type, 'email') or (type, 'sms') or (type, 'push'), this ALSO enqueues
 * delivery on that channel. No template configured for a channel = that
 * channel is silently skipped (not an error) — most types only ever go
 * out on some channels.
 */
const notify = async ({ user, type = 'system', title, message, link = null, relatedOrder = null, relatedProduct = null, variables = null }) => {
  let inApp = null;
  try {
    inApp = await Notification.create({ user, type, title, message, link, relatedOrder, relatedProduct });
  } catch (error) {
    logger.error(`Failed to create notification for user ${user}: ${error.message}`);
  }

  try {
    const recipient = await User.findById(user).select('email mobile pushTokens name');
    if (!recipient) return inApp;

    const vars = { name: recipient.name, title, message, ...(variables || {}) };

    const [emailTemplate, smsTemplate, pushTemplate] = await Promise.all([
      renderTemplate(type, 'email', vars),
      renderTemplate(type, 'sms', vars),
      renderTemplate(type, 'push', vars),
    ]);

    if (emailTemplate && recipient.email) {
      await enqueue({ channel: 'email', recipientUser: recipient._id, to: recipient.email, subject: emailTemplate.subject, body: emailTemplate.body });
    }
    if (smsTemplate && recipient.mobile) {
      await enqueue({ channel: 'sms', recipientUser: recipient._id, to: recipient.mobile, body: smsTemplate.body });
    }
    if (pushTemplate && recipient.pushTokens?.length) {
      await Promise.all(recipient.pushTokens.map((token) => enqueue({ channel: 'push', recipientUser: recipient._id, to: token, subject: pushTemplate.subject, body: pushTemplate.body })));
    }
  } catch (error) {
    // Multi-channel fan-out is a bonus on top of the in-app notification,
    // which already succeeded above — never let this fail the caller.
    logger.error(`Multi-channel dispatch failed for notification type "${type}" (user ${user}): ${error.message}`);
  }

  return inApp;
};

/** Sends the same notification to every user matching `filter` (default: everyone). Used by admin broadcast. */
const notifyMany = async ({ filter = {}, type = 'system', title, message, link = null }) => {
  const users = await User.find(filter).select('_id');
  const results = await Promise.allSettled(users.map((u) => notify({ user: u._id, type, title, message, link })));
  return { total: users.length, sent: results.filter((r) => r.status === 'fulfilled').length };
};

module.exports = { notify, notifyMany };
