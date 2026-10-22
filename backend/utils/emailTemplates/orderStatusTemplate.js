const { BRAND, trackOrderUrl } = require("./brand");
const { renderLayout, esc, money, button, badge } = require("./layout");

/**
 * One entry per order status this store can transition to (see
 * utils/orderStatusMachine.js ORDER_STATUSES). Each entry drives the
 * subject line, heading, status badge and body message of the status
 * update email. Statuses not listed here (should never happen, but kept
 * safe) fall back to a generic message built from the raw status string.
 */
const STATUS_CONFIG = {
  Pending: {
    subject: "Your Order is Pending",
    heading: "Order Pending",
    badgeColor: BRAND.colors.muted,
    message: (order) =>
      `We've received order <strong>#${esc(order.orderNumber)}</strong> and it's awaiting confirmation.`,
  },
  Confirmed: {
    subject: "Your Order has been Confirmed",
    heading: "Order Confirmed",
    badgeColor: BRAND.colors.gold,
    message: (order) =>
      `Great news! Your order <strong>#${esc(order.orderNumber)}</strong> has been confirmed and will be prepared shortly.`,
  },
  Processing: {
    subject: "We're Preparing Your Order",
    heading: "Order Processing",
    badgeColor: BRAND.colors.gold,
    message: (order) =>
      `Your order <strong>#${esc(order.orderNumber)}</strong> is being prepared with care.`,
  },
  Packed: {
    subject: "Your Order is Packed",
    heading: "Order Packed",
    badgeColor: BRAND.colors.gold,
    message: (order) =>
      `Your order <strong>#${esc(order.orderNumber)}</strong> has been packed and is ready to ship.`,
  },
  Shipped: {
    subject: "Your Order has been Shipped",
    heading: "Order Shipped",
    badgeColor: BRAND.colors.goldDark,
    message: (order) =>
      `Your order <strong>#${esc(order.orderNumber)}</strong> is on its way${
        order.tracking?.number
          ? ` — tracking number <strong>${esc(order.tracking.number)}</strong>`
          : ""
      }.`,
  },
  "Out For Delivery": {
    subject: "Out for Delivery",
    heading: "Out For Delivery",
    badgeColor: BRAND.colors.goldDark,
    message: (order) =>
      `Your order <strong>#${esc(order.orderNumber)}</strong> is out for delivery and will arrive soon.`,
  },
  Delivered: {
    subject: "Order Delivered Successfully",
    heading: "Order Delivered",
    badgeColor: "#2E7D32",
    message: (order) =>
      `Your order <strong>#${esc(order.orderNumber)}</strong> has been delivered. We hope you love it!`,
  },
  Cancelled: {
    subject: "Order Cancelled",
    heading: "Order Cancelled",
    badgeColor: BRAND.colors.alert,
    message: (order) =>
      `Your order <strong>#${esc(order.orderNumber)}</strong> has been cancelled${
        order.cancelReason ? ` (${esc(order.cancelReason)})` : ""
      }. Any amount paid will be refunded shortly if applicable.`,
  },
  Returned: {
    subject: "Order Return Update",
    heading: "Order Returned",
    badgeColor: BRAND.colors.muted,
    message: (order) =>
      `Your return for order <strong>#${esc(order.orderNumber)}</strong> has been recorded.`,
  },
  Refunded: {
    subject: "Refund Processed",
    heading: "Refund Processed",
    badgeColor: "#2E7D32",
    message: (order) =>
      `A refund for order <strong>#${esc(order.orderNumber)}</strong> has been processed and should reflect in your original payment method within 5-7 business days.`,
  },
};

const summaryRow = (label, value) => `
  <tr>
    <td style="padding:4px 0; font-size:13px; color:${BRAND.colors.muted}; font-family:Arial, Helvetica, sans-serif;">${esc(label)}</td>
    <td align="right" style="padding:4px 0; font-size:13px; font-weight:bold; color:${BRAND.colors.black}; font-family:Arial, Helvetica, sans-serif;">${esc(value)}</td>
  </tr>`;

const PAYMENT_METHOD_LABEL = {
  cod: "Cash on Delivery",
  razorpay: "Online (Razorpay)",
};

/**
 * Builds a status-update email (subject + HTML) for whatever
 * `order.orderStatus` currently is. Used whenever admin changes order.status.
 * @param {Object} order - populated/plain Order document
 * @param {Object} user - { name, email }
 */
const renderOrderStatusEmail = (order, user) => {
  const status = order.orderStatus;
  const config = STATUS_CONFIG[status] || {
    subject: `Order Update - ${status}`,
    heading: status,
    badgeColor: BRAND.colors.gold,
    message: (o) => `Your order <strong>#${esc(o.orderNumber)}</strong> status is now <strong>${esc(status)}</strong>.`,
  };

  const bodyHtml = `
    <p style="margin:0 0 16px;">${badge(config.heading, config.badgeColor)}</p>
    <h1 style="margin:0 0 12px; font-family:Georgia, 'Times New Roman', serif; font-size:22px; color:${BRAND.colors.black};">Hi ${esc(user.name)},</h1>
    <p style="margin:0 0 28px; font-size:14px; line-height:22px; color:${BRAND.colors.muted}; font-family:Arial, Helvetica, sans-serif;">${config.message(order)}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.colors.ivory}; border:1px solid ${BRAND.colors.border}; border-radius:6px; margin-bottom:28px;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 10px; font-size:12px; font-weight:bold; letter-spacing:0.5px; text-transform:uppercase; color:${BRAND.colors.gold}; font-family:Arial, Helvetica, sans-serif;">Order Summary</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${summaryRow("Order ID", order.orderNumber)}
          ${summaryRow("Payment Method", PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod)}
          ${summaryRow("Payment Status", order.paymentStatus)}
          ${summaryRow("Order Status", status)}
          ${summaryRow("Grand Total", money(order.grandTotal))}
        </table>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center">
        ${button("Track Order", trackOrderUrl(order._id))}
      </td></tr>
    </table>
  `;

  return {
    subject: config.subject,
    html: renderLayout({
      preheader: `${config.heading} — order ${order.orderNumber}`,
      bodyHtml,
    }),
  };
};

module.exports = { renderOrderStatusEmail, STATUS_CONFIG };
