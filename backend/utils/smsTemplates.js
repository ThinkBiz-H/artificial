// Plain-text order-status SMS templates for AmazeSMS (DLT-registered) — one
// per supported order status transition (see
// services/sms.service.js#sendOrderStatusSMS, the single dispatch point that
// decides which of these to use).
//
// Every template is paired with its DLT Template ID, read from .env
// (SMS_TEMPLATE_ID_CONFIRMED / _SHIPPED / _DELIVERED / _CANCELLED). The text
// here must match the template registered on the DLT portal exactly (apart
// from the variables), otherwise the operator rejects the SMS — edit both
// together. If an ID is unset, that SMS is skipped and logged.

// Each template below is character-for-character the registered DLT text —
// no blank lines, trailing "-SWASTIKALA" signature included. Variables arrive
// already formatted and length-checked (sms.service.js#buildSmsVariables);
// each {#var#} slot on DLT holds at most 30 characters.

const confirmed = ({ customerName, orderNumber, amount, trackingUrl }) =>
  `Hello ${customerName},
Thank you for shopping with Swastikala.
Your order has been CONFIRMED.
Order Number: ${orderNumber}
Order Amount: ${amount}
Track Order: ${trackingUrl}
Need help?
Click "Start Chat" from your order page.
Regards,
Swastikala Team
-SWASTIKALA`;

const shipped = ({ customerName, orderNumber, trackingNumber, trackingUrl }) =>
  `Hello ${customerName},
Great News!
Your order has been SHIPPED.
Order Number: ${orderNumber}
Tracking Number: ${trackingNumber}
Track Here:
${trackingUrl}
Thank you for shopping with Swastikala.
-SWASTIKALA`;

const delivered = ({ customerName, orderNumber }) =>
  `Hello ${customerName},
Your order has been DELIVERED successfully.
Order Number: ${orderNumber}
Thank you for choosing Swastikala.
We would love your feedback.
-SWASTIKALA`;

// No comma after the name — matches the registered DLT template exactly.
const cancelled = ({ customerName, orderNumber }) =>
  `Hello ${customerName}
Your order has been CANCELLED.
Order Number: ${orderNumber}
If this was unexpected, please contact our support team.
Thank you,
Swastikala Team
-SWASTIKALA`;

// Maps the app's real order statuses (utils/orderStatusMachine.js) to a
// template builder + DLT Template ID. Only these four ever produce an SMS.
// Anything else (Pending, Packed, Out For Delivery, Returned, Refunded) is
// intentionally not in this map, and sendOrderStatusSMS() skips silently
// (not an error) for any status not listed here. templateId is a getter so
// .env values are read at send time, not at require time.
// `vars` lists the {#var#} slots each template fills, in order — these are
// the values sms.service.js length-checks before sending.
const TEMPLATES_BY_STATUS = {
  Confirmed: {
    build: confirmed,
    vars: ["customerName", "orderNumber", "amount", "trackingUrl"],
    templateId: () => process.env.SMS_TEMPLATE_ID_CONFIRMED,
  },
  Shipped: {
    build: shipped,
    vars: ["customerName", "orderNumber", "trackingNumber", "trackingUrl"],
    templateId: () => process.env.SMS_TEMPLATE_ID_SHIPPED,
  },
  Delivered: {
    build: delivered,
    vars: ["customerName", "orderNumber"],
    templateId: () => process.env.SMS_TEMPLATE_ID_DELIVERED,
  },
  Cancelled: {
    build: cancelled,
    vars: ["customerName", "orderNumber"],
    templateId: () => process.env.SMS_TEMPLATE_ID_CANCELLED,
  },
};

module.exports = { TEMPLATES_BY_STATUS };
