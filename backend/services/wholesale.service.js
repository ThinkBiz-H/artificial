const Settings = require("../models/Settings");
const ApiError = require("../utils/ApiError");

// Same values as the Settings.wholesale schema defaults. Lean reads skip
// schema defaults, so a settings document saved before the section existed
// still gets these.
const DEFAULTS = Object.freeze({
  enabled: true,
  minOrderValue: 5000,
  freeDelivery: true,
  allowCod: false,
  collectBusinessDetails: true,
});

/** Admin > Settings > Wholesale, with defaults filled in. */
const getWholesaleRules = async (settings) => {
  const s = settings ?? (await Settings.findOne().select("wholesale").lean());
  const w = (s?.wholesale?.toObject?.() ?? s?.wholesale) || {};
  const rules = { ...DEFAULTS, ...Object.fromEntries(Object.entries(w).filter(([, v]) => v !== undefined && v !== null)) };
  rules.minOrderValue = Math.max(0, Number(rules.minOrderValue) || 0);
  return rules;
};

/** Where a bag stands against the minimum order value. */
const minimumOrderStatus = (rules, subTotal) => {
  const value = rules.enabled ? rules.minOrderValue : 0;
  const remaining = Math.max(0, Math.round((value - subTotal) * 100) / 100);
  return { enabled: rules.enabled && value > 0, value, remaining, met: remaining === 0 };
};

/** Rejects an order below the minimum order value. */
const assertMinimumOrder = (rules, subTotal) => {
  const status = minimumOrderStatus(rules, subTotal);
  if (!status.met) {
    throw new ApiError(400, `Minimum order value is ₹${status.value.toLocaleString("en-IN")}. Add ₹${status.remaining.toLocaleString("en-IN")} more to place your order.`);
  }
  return status;
};

const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/** Trims buyer business details; a GSTIN, when given, must be well-formed. */
const normalizeBusiness = (raw) => {
  if (!raw || typeof raw !== "object") return undefined;
  const clean = (v, max) => String(v ?? "").trim().slice(0, max);
  const business = {
    name: clean(raw.name, 160),
    gstin: clean(raw.gstin, 15).toUpperCase(),
    email: clean(raw.email, 160).toLowerCase(),
    phone: clean(raw.phone, 20),
  };
  if (business.gstin && !GSTIN.test(business.gstin)) throw new ApiError(400, "Enter a valid 15-character GSTIN, or leave it blank.");
  return Object.values(business).some(Boolean) ? business : undefined;
};

module.exports = { DEFAULTS, getWholesaleRules, minimumOrderStatus, assertMinimumOrder, normalizeBusiness };
