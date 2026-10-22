// Shared brand constants for all transactional emails — pulled from the
// same env vars the invoice service (services/invoice.service.js) already
// uses, so store name/contact info stays in sync across PDF + email.

const clientUrl = (process.env.CLIENT_URL || "").replace(/\/$/, "");

const BRAND = {
  name: process.env.COMPANY_NAME || "Swastikala",
  logoUrl: clientUrl ? `${clientUrl}/logo.png` : "",
  storeUrl: clientUrl || "#",
  supportEmail: process.env.COMPANY_EMAIL || process.env.SMTP_FROM_EMAIL || "",
  supportPhone: process.env.COMPANY_PHONE || "",
  colors: {
    gold: "#B58B46",
    goldDark: "#8f6c34",
    black: "#111111",
    white: "#FFFFFF",
    ivory: "#FAF8F4",
    muted: "#6b6b6b",
    border: "#ECE4D6",
    alert: "#A63A3A",
  },
};

const trackOrderUrl = (orderId) => `${BRAND.storeUrl}/account/orders/${orderId}`;

module.exports = { BRAND, trackOrderUrl };
