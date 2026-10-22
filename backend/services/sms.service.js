const axios = require("axios");
const https = require("https");
const logger = require("../utils/logger");
const { getSettings } = require("./settings.service");
const { TEMPLATES_BY_STATUS } = require("../utils/smsTemplates");
const Order = require("../models/Order");

const AMAZESMS_URL = "https://api.amazesms.com/api/sms";

// Reuse the TLS connection to the provider: a fresh handshake to AmazeSMS
// was measured at ~3s from this server, which pushed occasional sends past
// the request timeout.
const smsAgent = new https.Agent({ keepAlive: true, maxSockets: 10 });
const ATTEMPT_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 2;

/** Network-level failures worth one more try (no HTTP response, or a provider 5xx). */
const isTransient = (error) =>
  !error.response
    ? ["ECONNABORTED", "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "EAI_AGAIN", "ENOTFOUND", "ERR_CANCELED"].includes(error.code) ||
      /timeout/i.test(error.message || "")
    : error.response.status >= 500;
const SMS_SENDER_ID = "SWKALA";
const DLT_ENTITY_ID = "1101533070000098453";

// Startup check: a missing value here silently blocks that status's SMS, so
// say so loudly once at boot instead of only when an order changes status.
const REQUIRED_SMS_ENV = [
  "SMS_API_KEY",
  "SMS_TEMPLATE_ID_CONFIRMED",
  "SMS_TEMPLATE_ID_SHIPPED",
  "SMS_TEMPLATE_ID_DELIVERED",
  "SMS_TEMPLATE_ID_CANCELLED",
  "SMS_TRACKING_URL",
];
const missingSmsEnv = REQUIRED_SMS_ENV.filter((k) => !process.env[k]);
if (missingSmsEnv.length) {
  logger.warn(`Order status SMS config missing in .env: ${missingSmsEnv.join(", ")}`);
}

/**
 * Low-level SMS sender (AmazeSMS Mobile Inbox SMS — a normal SMS, not
 * WhatsApp). Used directly by otp.service.js and
 * notificationQueue.service.js, which both expect this to THROW on
 * failure — an OTP the user never received must fail the request, not
 * silently "succeed". sendOrderStatusSMS() below wraps this in its own
 * try/catch instead of changing that contract here.
 *
 * The query string is built by hand with encodeURIComponent() (newlines →
 * %0A, spaces → %20) instead of axios `params`: axios would re-encode an
 * already-encoded body (customer sees literal "%0A") and turns spaces into
 * "+", which can break DLT template matching.
 * @param {string} [templateId] - DLT Template ID; defaults to the OTP template.
 */
const sendSms = async ({ to, message, templateId = process.env.AMAZESMS_TEMPLATE_ID }) => {
  try {
    const params = {
      key: process.env.SMS_API_KEY || process.env.AMAZESMS_KEY,
      from: SMS_SENDER_ID,
      to,
      body: message,
      templateid: templateId,
      entityid: DLT_ENTITY_ID,
    };
    const query = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v ?? "")}`)
      .join("&");
    const url = `${AMAZESMS_URL}?${query}`;
    logger.info(`AmazeSMS request: ${maskKey(url)}`);
    // One retry on a transient failure. The retry sends the identical
    // message, so at worst the customer receives the same text twice.
    for (let attempt = 1; ; attempt++) {
      try {
        const response = await axios.get(url, { timeout: ATTEMPT_TIMEOUT_MS, httpsAgent: smsAgent });
        logger.info(`SMS sent to ${maskMobile(to)} (attempt ${attempt}): ${JSON.stringify(response.data)}`);
        return response.data;
      } catch (attemptError) {
        if (attempt >= MAX_ATTEMPTS || !isTransient(attemptError)) throw attemptError;
        logger.warn(`SMS attempt ${attempt} to ${maskMobile(to)} failed (${attemptError.message}) — retrying`);
      }
    }
  } catch (error) {
    const providerResponse = error.response
      ? ` | provider response (${error.response.status}): ${JSON.stringify(error.response.data)}`
      : "";
    logger.error(`SMS send failed to ${maskMobile(to)}: ${error.message}${providerResponse}`);
    throw error;
  }
};

/** Prefers the account's registered mobile number; falls back to the delivery contact number given at checkout. */
const resolveRecipient = (order, user) => user?.mobile || order?.shippingAddress?.mobile || null;

// DLT rejects an SMS ("Template Variable Exceeded Max Length") when any single
// {#var#} value is longer than this — the provider still answers "success",
// so it must be enforced here, before sending.
const DLT_VAR_MAX_LENGTH = 30;

/**
 * The link put in the SMS. A per-order URL can never fit in a 30-char DLT
 * variable (the order _id alone is 24 chars), so this is one short,
 * DLT-whitelisted URL from .env (SMS_TRACKING_URL, e.g.
 * "swastikala.com/account/orders" — the customer's order list).
 */
const resolveTrackingUrl = () => (process.env.SMS_TRACKING_URL || "").trim();

// Collapses whitespace/newlines so a variable can never add lines to the body.
const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();

/** Final string value of every template variable, exactly as sent. */
const buildSmsVariables = (order, user) => ({
  // Truncating a name is harmless; anything else too long is rejected below.
  customerName: clean(user?.name || order.shippingAddress?.fullName || "Customer").slice(0, DLT_VAR_MAX_LENGTH).trim(),
  orderNumber: clean(order.orderNumber),
  amount: `Rs.${Number(order.grandTotal || 0).toFixed(2)}`,
  trackingNumber: clean(order.tracking?.number) || "N/A",
  trackingUrl: resolveTrackingUrl(),
});

/** The status before `status`, from the order's history (for logging only). */
const previousStatusOf = (order, status) => {
  const history = order.statusHistory || [];
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].status !== status) return history[i].status;
  }
  return "Pending";
};

/**
 * Atomically marks this status's SMS as sent on the order. Returns false if
 * it was already claimed — i.e. this exact SMS already went out (or is going
 * out right now from a concurrent request), so it must not be sent again.
 */
const claimSmsSlot = async (orderId, status) => {
  const field = `smsSent.${status}`;
  const res = await Order.updateOne(
    { _id: orderId, [field]: null },
    { $set: { [field]: new Date() } },
  );
  return res.modifiedCount === 1;
};

const releaseSmsSlot = (orderId, status) =>
  Order.updateOne({ _id: orderId }, { $set: { [`smsSent.${status}`]: null } }).catch((e) =>
    logger.error(`Failed to release SMS slot for order ${orderId} (${status}): ${e.message}`),
  );

/** Masks the API key so the full request URL can be logged safely. */
const maskKey = (url) => url.replace(/([?&]key=)[^&]*/, "$1****").replace(/([?&]to=)\d+(\d{4})/, "$1******$2");

/** Logs only the last 4 digits of a mobile number. */
const maskMobile = (mobile) => String(mobile || "").replace(/\d(?=\d{4})/g, "*");

/**
 * The single reusable service every order-status-changing code path calls —
 * admin manual status updates, user/admin cancellation, Razorpay payment
 * verification, and the Shiprocket/Razorpay webhooks all go through this
 * one function (replaces the former sendOrderStatusWhatsApp()). Each status
 * is sent with its own DLT Template ID — see utils/smsTemplates.js.
 *
 * Callers only invoke this when the status has actually changed (the same
 * guard that prevents duplicate emails). As a second line of defence, each
 * status SMS is claimed atomically on the order (order.smsSent.<status>), so
 * even concurrent requests or a new code path can never send it twice.
 *
 * Never throws: an SMS failure is logged and swallowed so the order update
 * that triggered it is never rolled back or failed.
 * @param {Object} order - populated/plain Order document
 * @param {Object} user - { name, mobile } (or a full User doc)
 * @param {string} status - the order's current orderStatus
 * @returns {Promise<{ success: boolean, skipped?: boolean, error?: string }>}
 */
const sendOrderStatusSMS = async (order, user, status) => {
  const template = TEMPLATES_BY_STATUS[status];
  if (!template) {
    // Not one of the 4 supported statuses — intentionally not an error.
    return { success: true, skipped: true };
  }

  try {
    const templateId = template.templateId();
    if (!templateId) {
      logger.warn(
        `Order status SMS skipped for order ${order.orderNumber} (status: ${status}): no DLT template ID configured`,
      );
      return { success: false, error: "No DLT template ID configured" };
    }

    const settings = await getSettings();
    if (settings.integrations?.smsEnabled === false) {
      return { success: true, skipped: true, reason: "disabled_in_settings" };
    }

    const to = resolveRecipient(order, user);
    if (!to) {
      logger.warn(
        `Order status SMS skipped for order ${order.orderNumber}: no mobile number on file`,
      );
      return { success: false, error: "No recipient mobile number" };
    }

    // Only the variables this status's template actually uses are checked.
    const vars = buildSmsVariables(order, user);
    const used = Object.fromEntries(template.vars.map((k) => [k, vars[k]]));
    const varReport = Object.entries(used)
      .map(([k, v]) => `${k}=${JSON.stringify(v)} (len ${v.length})`)
      .join(" | ");

    const tooLong = Object.entries(used).filter(([, v]) => v.length > DLT_VAR_MAX_LENGTH);
    const empty = Object.entries(used).filter(([, v]) => !v);
    if (tooLong.length || empty.length) {
      logger.error(
        `Order status SMS NOT sent for order ${order.orderNumber} (status: ${status}) — DLT would reject it: ` +
          [
            ...tooLong.map(([k, v]) => `${k} is ${v.length} chars (max ${DLT_VAR_MAX_LENGTH})`),
            ...empty.map(([k]) => `${k} is empty${k === "trackingUrl" ? " (set SMS_TRACKING_URL in .env)" : ""}`),
          ].join(", ") +
          ` | ${varReport}`,
      );
      return { success: false, error: "SMS variable fails DLT limits" };
    }

    if (!(await claimSmsSlot(order._id, status))) {
      logger.info(
        `Order status SMS skipped for order ${order.orderNumber} (status: ${status}): already sent — duplicate prevented`,
      );
      return { success: true, skipped: true, reason: "already_sent" };
    }

    const message = template.build(vars);
    logger.info(
      `Order status SMS for order ${order.orderNumber}\n` +
        `Previous Status: ${previousStatusOf(order, status)}\n` +
        `New Status: ${status}\n` +
        `Template ID: ${templateId}\n` +
        `Customer Mobile: ${to}\n` +
        `Variables: ${varReport}\n` +
        `Generated SMS (${message.length} chars):\n${message}`,
    );

    let providerResponse;
    try {
      providerResponse = await sendSms({ to, message, templateId });
    } catch (sendError) {
      await releaseSmsSlot(order._id, status);
      throw sendError;
    }

    // AmazeSMS answers HTTP 200 even when it refuses a message; only
    // status "success" means it was accepted.
    if (providerResponse?.status !== "success") {
      await releaseSmsSlot(order._id, status);
      logger.error(
        `SMS Failed for order ${order.orderNumber} (status: ${status}) | Provider Response: ${JSON.stringify(providerResponse)}`,
      );
      return { success: false, error: "Provider did not accept the SMS" };
    }

    logger.info(
      `SMS Success for order ${order.orderNumber} (status: ${status}) | Provider Response: ${JSON.stringify(providerResponse)}`,
    );
    return { success: true };
  } catch (error) {
    logger.error(
      `SMS Failed — sendOrderStatusSMS for order ${order?.orderNumber} (status: ${status}): ${error.message}`,
    );
    return { success: false, error: error.message };
  }
};

module.exports = { sendSms, sendOrderStatusSMS, buildSmsVariables, DLT_VAR_MAX_LENGTH };
