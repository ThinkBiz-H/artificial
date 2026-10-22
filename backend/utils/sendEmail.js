const { sendMail } = require("./mailer");

/**
 * Sends an email using the configured SMTP transporter.
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = sendMail;

const templates = {
  otp: (name, otp) => `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2>Hi ${name},</h2>
      <p>Your One-Time Password (OTP) is:</p>
      <h1 style="letter-spacing:4px;">${otp}</h1>
      <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
    </div>`,

  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for creating an account with us. We're excited to have you on board.</p>
    </div>`,

  resetPassword: (name, resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2>Hi ${name},</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, please ignore this email.</p>
    </div>`,

  orderConfirmation: (name, order) => `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2>Hi ${name},</h2>
      <p>Thank you for your order! Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr>
          <td style="padding:4px 0;">Subtotal</td>
          <td style="padding:4px 0; text-align:right;">₹${order.subTotal}</td>
        </tr>
        ${
          order.coupon?.discountAmount
            ? `<tr>
                <td style="padding:4px 0;">Coupon Discount</td>
                <td style="padding:4px 0; text-align:right;">- ₹${order.coupon.discountAmount}</td>
              </tr>`
            : ""
        }
        ${
          order.discountAmount
            ? `<tr>
                <td style="padding:4px 0;">Pre Paid Discount (${order.discountPercentage || 10}%)</td>
                <td style="padding:4px 0; text-align:right;">- ₹${order.discountAmount}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="padding:4px 0;">Shipping</td>
          <td style="padding:4px 0; text-align:right;">₹${order.shippingCharge}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; font-weight:bold; border-top:1px solid #ddd;">Total Paid</td>
          <td style="padding:8px 0; text-align:right; font-weight:bold; border-top:1px solid #ddd;">₹${order.grandTotal}</td>
        </tr>
      </table>
      <p>We will notify you once your order is shipped.</p>
    </div>`,

  orderDelivered: (name, order) => `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2>Hi ${name},</h2>
      <p>Your order <strong>#${order.orderNumber}</strong> has been delivered. We hope you enjoy your purchase!</p>
    </div>`,

  paymentSuccess: (name, order) => `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2>Hi ${name},</h2>
      <p>We've received your payment of <strong>₹${order.grandTotal}</strong> for order <strong>#${order.orderNumber}</strong>.</p>
      <p>Your order is now being processed.</p>
    </div>`,

  paymentFailed: (name, order, reason) => `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
    <h2>Hi ${name},</h2>
    <p>
      Unfortunately, your payment for order
      <strong>#${order.orderNumber}</strong>
      could not be processed
      ${reason ? ` (${reason})` : ""}.
    </p>
    <p>
      You can retry the payment from your orders page,
      or choose Cash on Delivery instead.
    </p>
  </div>
`,

  shipmentDispatched: (name, order) => `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
    <h2>Hi ${name},</h2>

    <p>
      Good news! Your order
      <strong>#${order.orderNumber}</strong>
      has been shipped
      ${
        order.tracking?.number
          ? `— tracking number <strong>${order.tracking.number}</strong>`
          : ""
      }.
    </p>

    ${
      order.tracking?.url
        ? `<p><a href="${order.tracking.url}">Track your shipment</a></p>`
        : ""
    }

  </div>
`,

  orderCancelled: (name, order, reason) => `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
    <h2>Hi ${name},</h2>

    <p>
      Your order
      <strong>#${order.orderNumber}</strong>
      has been cancelled
      ${reason ? ` (${reason})` : ""}.
    </p>

    <p>
      If you already paid, any applicable refund will be processed shortly.
    </p>

  </div>
`,

  returnApproved: (name, order) => `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
    <h2>Hi ${name},</h2>

    <p>
      Your return request for order
      <strong>#${order.orderNumber}</strong>
      has been approved.
    </p>

    <p>
      Our courier partner will arrange a pickup shortly.
    </p>

  </div>
`,
  refundProcessed: (name, order, amount) => `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
    <h2>Hi ${name},</h2>

    <p>
      A refund of
      <strong>₹${amount}</strong>
      for order
      <strong>#${order.orderNumber}</strong>
      has been processed.
    </p>

    <p>
      It should reflect in your original payment method
      within 5–7 business days.
    </p>

  </div>
`,
};

module.exports = { sendEmail, templates };
