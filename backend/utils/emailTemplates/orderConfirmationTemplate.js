const { BRAND, trackOrderUrl } = require("./brand");
const { renderLayout, esc, money, button } = require("./layout");
const { formatItemOptions } = require("../itemOptions");

/** Small round colour swatch shown before the colour name (email-safe inline styles). */
const swatch = (hex) =>
  hex
    ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${esc(hex)}; border:1px solid ${BRAND.colors.border}; vertical-align:-1px; margin-right:4px;"></span>`
    : "";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const PAYMENT_METHOD_LABEL = {
  cod: "Cash on Delivery",
  razorpay: "Online (Razorpay)",
};

const detailRow = (label, value) => `
  <tr>
    <td style="padding:4px 0; font-size:13px; color:${BRAND.colors.muted}; font-family:Arial, Helvetica, sans-serif;">${esc(label)}</td>
    <td align="right" style="padding:4px 0; font-size:13px; font-weight:bold; color:${BRAND.colors.black}; font-family:Arial, Helvetica, sans-serif;">${esc(value)}</td>
  </tr>`;

const totalRow = (label, value, { bold = false, negative = false } = {}) => `
  <tr>
    <td style="padding:6px 0; font-size:${bold ? "15px" : "13px"}; ${bold ? "font-weight:bold;" : ""} color:${BRAND.colors.black}; font-family:Arial, Helvetica, sans-serif; ${bold ? `border-top:1px solid ${BRAND.colors.border}; padding-top:12px;` : ""}">${esc(label)}</td>
    <td align="right" style="padding:6px 0; font-size:${bold ? "15px" : "13px"}; ${bold ? "font-weight:bold;" : ""} color:${negative ? "#2E7D32" : BRAND.colors.black}; font-family:Arial, Helvetica, sans-serif; ${bold ? `border-top:1px solid ${BRAND.colors.border}; padding-top:12px;` : ""}">${negative ? "- " : ""}${esc(value)}</td>
  </tr>`;

const productRow = (item) => `
  <tr>
    <td width="64" style="padding:12px 0; border-bottom:1px solid ${BRAND.colors.border};">
      <img src="${esc(item.thumbnail || "")}" width="56" height="56" alt="${esc(item.title)}" style="width:56px; height:56px; object-fit:cover; border-radius:4px; border:1px solid ${BRAND.colors.border}; display:block;" />
    </td>
    <td style="padding:12px 0 12px 14px; border-bottom:1px solid ${BRAND.colors.border}; font-family:Arial, Helvetica, sans-serif;">
      <p style="margin:0; font-size:13.5px; font-weight:bold; color:${BRAND.colors.black};">${esc(item.title)}</p>
      ${formatItemOptions(item) ? `<p style="margin:4px 0 0; font-size:12px; color:${BRAND.colors.muted};">${swatch(item.colorHex)}${esc(formatItemOptions(item, " | "))}</p>` : ""}
      <p style="margin:4px 0 0; font-size:12px; color:${BRAND.colors.muted};">Qty: ${esc(item.quantity)} &nbsp;|&nbsp; ${money(item.price)} each</p>
    </td>
    <td align="right" style="padding:12px 0; border-bottom:1px solid ${BRAND.colors.border}; font-family:Arial, Helvetica, sans-serif; font-size:13.5px; font-weight:bold; color:${BRAND.colors.black}; white-space:nowrap;">
      ${money(item.price * item.quantity)}
    </td>
  </tr>`;

/**
 * Builds the "Order Confirmed" email (subject + HTML) sent right after a
 * COD order is created or a Razorpay payment is verified.
 * @param {Object} order - populated/plain Order document
 * @param {Object} user - { name, email }
 */
const renderOrderConfirmationEmail = (order, user) => {
  const addr = order.shippingAddress || {};
  const totalDiscount =
    (order.coupon?.discountAmount || 0) + (order.discountAmount || 0);

  const bodyHtml = `
    <h1 style="margin:0 0 4px; font-family:Georgia, 'Times New Roman', serif; font-size:22px; color:${BRAND.colors.black};">Hi ${esc(user.name)},</h1>
    <p style="margin:0 0 4px; font-size:14px; line-height:22px; color:${BRAND.colors.muted}; font-family:Arial, Helvetica, sans-serif;">Thank you for shopping with ${esc(BRAND.name)}.</p>
    <p style="margin:0 0 24px; font-size:14px; line-height:22px; color:${BRAND.colors.muted}; font-family:Arial, Helvetica, sans-serif;">Your order has been successfully placed.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.colors.ivory}; border:1px solid ${BRAND.colors.border}; border-radius:6px; margin-bottom:24px;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 10px; font-size:12px; font-weight:bold; letter-spacing:0.5px; text-transform:uppercase; color:${BRAND.colors.gold}; font-family:Arial, Helvetica, sans-serif;">Order Details</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRow("Order ID", order.orderNumber)}
          ${detailRow("Order Date", formatDate(order.createdAt))}
          ${detailRow("Payment Method", PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod)}
          ${detailRow("Payment Status", order.paymentStatus)}
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 8px; font-size:12px; font-weight:bold; letter-spacing:0.5px; text-transform:uppercase; color:${BRAND.colors.gold}; font-family:Arial, Helvetica, sans-serif;">Shipping Address</p>
    <p style="margin:0 0 24px; font-size:13.5px; line-height:21px; color:${BRAND.colors.black}; font-family:Arial, Helvetica, sans-serif;">
      ${esc(addr.fullName)}<br/>
      ${esc(addr.addressLine1)}${addr.addressLine2 ? `, ${esc(addr.addressLine2)}` : ""}<br/>
      ${esc(addr.city)}, ${esc(addr.state)} ${esc(addr.pincode)}<br/>
      ${esc(addr.country || "India")}${addr.mobile ? ` &nbsp;|&nbsp; ${esc(addr.mobile)}` : ""}
    </p>

    <p style="margin:0 0 4px; font-size:12px; font-weight:bold; letter-spacing:0.5px; text-transform:uppercase; color:${BRAND.colors.gold}; font-family:Arial, Helvetica, sans-serif;">Order Summary</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      ${(order.items || []).map(productRow).join("")}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      ${totalRow("Subtotal", money(order.subTotal))}
      ${totalDiscount ? totalRow("Discount", money(totalDiscount), { negative: true }) : ""}
      ${totalRow("Shipping", order.shippingCharge ? money(order.shippingCharge) : "FREE")}
      ${order.tax ? totalRow(order.taxIncluded ? "GST (included)" : "Tax (GST)", money(order.tax)) : ""}
      ${totalRow("Grand Total", money(order.grandTotal), { bold: true })}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center">
        ${button("Track Order", trackOrderUrl(order._id))}
        ${button("Visit Store", BRAND.storeUrl, { variant: "secondary" })}
      </td></tr>
    </table>
  `;

  return {
    subject: `Order Confirmed - ${BRAND.name}`,
    html: renderLayout({
      preheader: `Your order ${order.orderNumber} has been placed successfully.`,
      bodyHtml,
    }),
  };
};

module.exports = { renderOrderConfirmationEmail };
