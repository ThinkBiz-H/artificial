const ApiError = require("./ApiError");

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * The single, backend-authoritative GST calculation — the one place this
 * math exists. The admin form mirrors this formula purely for its instant
 * live preview (see admin-panel/src/lib/gstPricing.ts), but only ever
 * submits the three raw inputs below; whatever the frontend previews is
 * never trusted or persisted — createProduct/updateProduct always call this
 * function themselves and store what IT computes.
 *
 * CASE 1 (priceIncludesGST): `enteredPrice` is the final selling price —
 * it is returned unchanged as `price`; basePrice/gstAmount are only a
 * breakdown for display, never affect the price the customer pays.
 *
 * CASE 2 (!priceIncludesGST): `enteredPrice` is the pre-tax base price —
 * GST is added on top to produce the final `price`.
 *
 * @throws {ApiError} 400 if price is negative or GST is outside [0, 100]
 */
const computeGstPricing = ({ enteredPrice, gstRate = 18, priceIncludesGST = true }) => {
  const entered = Number(enteredPrice);
  const rate = Number(gstRate);

  if (!Number.isFinite(entered) || entered < 0) {
    throw new ApiError(400, "Price must be a non-negative number");
  }
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new ApiError(400, "GST percentage must be between 0 and 100");
  }

  if (priceIncludesGST) {
    const price = round2(entered);
    const basePrice = round2(price / (1 + rate / 100));
    const gstAmount = round2(price - basePrice);
    return { price, basePrice, gstRate: rate, gstAmount, priceIncludesGST: true };
  }

  const basePrice = round2(entered);
  const gstAmount = round2(basePrice * (rate / 100));
  const price = round2(basePrice + gstAmount);
  return { price, basePrice, gstRate: rate, gstAmount, priceIncludesGST: false };
};

/** Normalizes the various truthy shapes a checkbox arrives as over JSON vs multipart/form-data. */
const parseBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  return value === true || value === "true";
};

module.exports = { computeGstPricing, parseBoolean };
