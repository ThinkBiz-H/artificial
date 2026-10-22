const mongoose = require("mongoose");

/**
 * Singleton document — exactly one Settings row ever exists (enforced by
 * services/settings.service.js always operating on the same fixed id, not
 * by a unique index on a real field). Use SettingsService.getSettings() /
 * updateSettings(), not the model directly, so that invariant holds.
 *
 * IMPORTANT — what does NOT live here: actual API credentials (SMTP
 * password, Razorpay key secret, Shiprocket password, Cloudinary secret,
 * JWT secrets). Those remain env-only, matching how every other phase in
 * this codebase already treats credentials ("MUST remain server-side",
 * never hardcoded, never admin-editable over an API — an admin-editable
 * secrets API is a strictly bigger attack surface than an env var that
 * needs a deploy to change). What DOES live here: business-configurable,
 * non-secret settings, and boolean feature/integration toggles the admin
 * can flip without a deploy. `GET /admin/settings/environment-status`
 * (see settings.service.js) reports whether the underlying env credentials
 * are PRESENT, as booleans only, never their values.
 */
const settingsSchema = new mongoose.Schema(
  {
    general: {
      siteName: { type: String, default: "My Store" },
      siteTagline: { type: String, default: "" },
      supportEmail: { type: String, default: "" },
      supportPhone: { type: String, default: "" },
      timezone: { type: String, default: "Asia/Kolkata" },
    },

    store: {
      legalName: { type: String, default: "" },
      gstNumber: { type: String, default: "" },
      address: {
        line1: { type: String, default: "" },
        line2: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        country: { type: String, default: "India" },
        pincode: { type: String, default: "" },
      },
    },

    currency: {
      code: { type: String, default: "INR" },
      symbol: { type: String, default: "₹" },
      position: { type: String, enum: ["before", "after"], default: "before" },
    },

    tax: {
      gstEnabled: { type: Boolean, default: true },
      defaultTaxPercent: { type: Number, default: 0, min: 0, max: 100 },
      pricesIncludeTax: { type: Boolean, default: true },
    },

    invoice: {
      prefix: { type: String, default: "INV-" },
      startingNumber: { type: Number, default: 1001 },
      termsAndConditions: { type: String, default: "" },
      footerNote: { type: String, default: "" },
    },

    // Non-secret, admin-facing toggles for each integration — independent
    // of (and does not override) the existing env-based gates already used
    // inside e.g. shiprocket.service.js (SHIPROCKET_ENABLED). This lets an
    // admin communicate "we're not taking online payments today" to the
    // storefront without touching env vars/redeploying, while the actual
    // service-level gate remains authoritative for whether the integration
    // code path itself runs.
    integrations: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: true },
      razorpayEnabled: { type: Boolean, default: true },
      shiprocketEnabled: { type: Boolean, default: true },
    },
    payment: {
      codEnabled: {
        type: Boolean,
        default: true,
      },
      onlinePaymentEnabled: {
        type: Boolean,
        default: true,
      },
    },

    // Single source of truth for shipping charges — services/shipping.service.js
    // (the one place calculateShipping() lives) reads exclusively from here;
    // nothing about shipping cost is hardcoded anywhere else in the project.
    // Defaults match the values shipping.service.js used before this feature
    // existed (₹999 threshold, ₹60 base charge — the ≤0.5kg tier, the common
    // case), so introducing this section changes no admin's live behavior
    // until they actually open Settings > Shipping and change something.
    shipping: {
      freeShippingEnabled: { type: Boolean, default: true },
      freeShippingThreshold: { type: Number, default: 999, min: 0 },
      defaultShippingCharge: { type: Number, default: 60, min: 0 },
      // Both optional per spec — 0 (the default) means "not in use yet".
      // expressShippingCharge is applied when a caller explicitly requests
      // shippingType: 'express' (see calculateShipping) — no checkout UI
      // offers that choice today, so it's inert until one does.
      expressShippingCharge: { type: Number, default: 0, min: 0 },
      // Applied on top of the shipping charge (free or not) for COD orders
      // specifically — a handling fee, not a shipping fee, so it isn't
      // waived by free shipping.
      codCharge: { type: Number, default: 0, min: 0 },
    },

    seo: {
      defaultMetaTitle: { type: String, default: "" },
      defaultMetaDescription: { type: String, default: "" },
      defaultOgImage: { type: String, default: "" },
      googleAnalyticsId: { type: String, default: "" },
      googleSiteVerification: { type: String, default: "" },
      facebookPixelId: { type: String, default: "" },
    },

    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      pinterest: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },

    contact: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      address: { type: String, default: "" },
    },

    // Storefront "Start Chat" button only — automatic order-status
    // notifications now go out over SMS (see services/sms.service.js),
    // not WhatsApp, so there is deliberately no "enable WhatsApp
    // notifications" toggle here anymore. `trackingBaseUrl` is reused by
    // both Start Chat's message and the SMS templates (services/sms.service.js
    // #resolveTrackingUrl) — it's just "the storefront order page", not
    // WhatsApp-specific.
    whatsapp: {
      businessNumber: { type: String, default: "" }, // digits only, E.164 without '+', e.g. "919876543210"
      enableStartChat: { type: Boolean, default: true }, // storefront "Start Chat" button visibility
      trackingBaseUrl: { type: String, default: "" }, // e.g. "https://swastikala.com/account/orders" — order id appended; falls back to CLIENT_URL when empty
    },

    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default:
          "We are currently performing scheduled maintenance. Please check back soon.",
      },
      allowedIPs: [{ type: String }], // IPs that bypass the block (e.g. office/admin IP)
    },

    // Arbitrary admin-controlled on/off flags for features not otherwise
    // modeled (e.g. "reviewsEnabled", "wishlistEnabled") — a Map so new
    // flags never require a schema change.
    featureFlags: { type: Map, of: Boolean, default: {} },

    // Mobile app update policy (read by the app at launch via GET /settings).
    appVersion: {
      latestVersion: { type: String, default: '' },
      minimumVersion: { type: String, default: '' },
      forceUpdate: { type: Boolean, default: false },
      optionalUpdate: { type: Boolean, default: false },
      message: { type: String, default: '' },
      androidUrl: { type: String, default: '' },
      iosUrl: { type: String, default: '' },
    },

    logo: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    favicon: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
