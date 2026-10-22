const shiprocket = require("./shiprocket.service");
const ApiError = require("../utils/ApiError");
const { getSettings } = require("./settings.service");

/**
 * Calculate shipping charge. Every number in the result — the free-shipping
 * threshold, whether it's even enabled, the flat standard/express charge,
 * and the COD handling fee — comes from Settings.shipping (Admin > Settings
 * > Shipping), never a literal in this file. `subTotal` (the cart/order
 * subtotal, before discounts) is optional for backward compatibility, but
 * every checkout call site should pass it.
 *
 * `shippingType` is 'standard' (default) or 'express' — no checkout UI
 * offers a choice today, so 'express' is only reachable by a future caller
 * that explicitly asks for it; existing behavior for every current caller
 * is unchanged.
 */
const calculateShipping = async ({
  pincode,
  deliveryPincode,
  weight = 0.5,
  cod = false,
  subTotal = 0,
  shippingType = "standard",
}) => {
  const finalPincode = deliveryPincode || pincode;

  if (!finalPincode) {
    throw new ApiError(400, "Delivery pincode is required");
  }

  const settings = await getSettings();
  const shippingSettings = settings.shipping || {};

  let result;

  // ==========================
  // Shiprocket Disabled — flat, admin-configured charge
  // ==========================
  if (!shiprocket.isShiprocketEnabled()) {
    const shippingCharge =
      shippingType === "express"
        ? Number(shippingSettings.expressShippingCharge) || 0
        : Number(shippingSettings.defaultShippingCharge) || 0;

    result = {
      shippingCharge,
      courierName: shippingType === "express" ? "Express Shipping" : "Standard Shipping",
      estimatedDays: shippingType === "express" ? 2 : 4,
      courierId: null,
      availableCouriers: 1,
    };
  } else {
    // ==========================
    // Shiprocket Enabled — live carrier rate, not admin-configured (this
    // is a real quote from the courier API, not a business setting)
    // ==========================
    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;

    if (!pickupPincode) {
      throw new ApiError(500, "SHIPROCKET_PICKUP_PINCODE is not configured");
    }

    const couriers = await shiprocket.checkServiceability({
      pickupPincode,
      deliveryPincode: finalPincode,
      weight,
      cod: false, // Always calculate prepaid shipping
    });

    if (!couriers || couriers.length === 0) {
      throw new ApiError(400, "Delivery is not available for this pincode");
    }

    couriers.sort((a, b) => Number(a.rate) - Number(b.rate));

    const courier = couriers[0];

    result = {
      shippingCharge: Number(courier.rate || 0),
      courierName: courier.courier_name,
      estimatedDays:
        Number(courier.estimated_delivery_days) || Number(courier.etd) || 4,
      courierId: courier.courier_company_id,
      availableCouriers: couriers.length,
    };
  }

  // Free-shipping override — applied last, after the normal charge is
  // computed either way, so courier/ETA info stays accurate for display;
  // only the charge itself is waived. This is the ONE place the threshold
  // is evaluated; COD order creation, Razorpay order creation, Razorpay
  // payment verification, and the checkout page's live preview all call
  // this same function and therefore can never disagree on whether a given
  // order ships free.
  const threshold = Number(shippingSettings.freeShippingThreshold) || 0;
  const freeShippingEnabled = shippingSettings.freeShippingEnabled !== false;
  const freeShipping = freeShippingEnabled && Number(subTotal) >= threshold;

  let shippingCharge = freeShipping ? 0 : result.shippingCharge;

  // COD handling fee — a payment-method surcharge, not a shipping fee, so
  // it stacks on top even when shipping itself is free.
  const codCharge = cod ? Number(shippingSettings.codCharge) || 0 : 0;
  shippingCharge += codCharge;

  return {
    ...result,
    shippingCharge,
    codCharge,
    freeShipping,
    freeShippingEnabled,
    freeShippingThreshold: threshold,
  };
};

module.exports = {
  calculateShipping,
};
