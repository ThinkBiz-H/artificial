const logger = require("../utils/logger");
const { sendMail } = require("../utils/mailer");
const {
  renderOrderConfirmationEmail,
  renderOrderStatusEmail,
  renderContactInquiryEmail,
} = require("../utils/emailTemplates");

// Store inbox that receives every Contact page submission.
const CONTACT_NOTIFICATION_EMAIL = "swastikala.art@gmail.com";

/**
 * Sends the "Order Confirmed" email after a COD order is created or a
 * Razorpay payment is verified successfully (see FEATURE 5: only ever
 * called after the order already exists / payment is already verified —
 * never before). Failures are logged and swallowed: an email problem must
 * never roll back or fail the order that triggered it (FEATURE 7).
 * @param {Object} order - populated/plain Order document
 * @param {Object} user - { name, email }
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
const sendOrderConfirmation = async (order, user) => {
  if (!user?.email) {
    logger.error(
      `sendOrderConfirmation skipped for order ${order?.orderNumber}: recipient has no email`,
    );
    return { success: false, error: "Recipient has no email address" };
  }

  try {
    const { subject, html } = renderOrderConfirmationEmail(order, user);
    await sendMail({ to: user.email, subject, html });
    return { success: true };
  } catch (error) {
    logger.error(
      `Order confirmation email failed for order ${order.orderNumber} (${user.email}): ${error.message}`,
    );
    return { success: false, error: error.message };
  }
};

/**
 * Sends the order status update email matching `order.orderStatus`
 * (Pending/Confirmed/Processing/Packed/Shipped/Out For Delivery/Delivered/
 * Cancelled/Refunded — see utils/emailTemplates/orderStatusTemplate.js).
 * Callers are responsible for only invoking this when the status actually
 * changed (FEATURE 6) — this function itself sends unconditionally for
 * whatever `order.orderStatus` currently holds.
 * @param {Object} order - populated/plain Order document
 * @param {Object} user - { name, email }
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
const sendOrderStatusUpdate = async (order, user) => {
  if (!user?.email) {
    logger.error(
      `sendOrderStatusUpdate skipped for order ${order?.orderNumber}: recipient has no email`,
    );
    return { success: false, error: "Recipient has no email address" };
  }

  try {
    const { subject, html } = renderOrderStatusEmail(order, user);
    await sendMail({ to: user.email, subject, html });
    return { success: true };
  } catch (error) {
    logger.error(
      `Order status email failed for order ${order.orderNumber} (${user.email}, status: ${order.orderStatus}): ${error.message}`,
    );
    return { success: false, error: error.message };
  }
};

/**
 * Notifies the store inbox of a new Contact page submission. Failures are
 * logged and swallowed — the inquiry is already saved by the time this
 * runs, so an email problem must never fail the customer's submission.
 * @param {Object} inquiry - saved ContactInquiry document
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
const sendContactInquiryNotification = async (inquiry) => {
  try {
    const { subject, html } = renderContactInquiryEmail(inquiry);
    await sendMail({ to: CONTACT_NOTIFICATION_EMAIL, subject, html });
    return { success: true };
  } catch (error) {
    logger.error(`Contact inquiry notification email failed (${inquiry?._id}): ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOrderConfirmation, sendOrderStatusUpdate, sendContactInquiryNotification };
