const ApiError = require("../utils/ApiError");
const Product = require("../models/Product");
const Variant = require("../models/Variant");
const inventoryService = require("./inventory.service");
const { resolveItemOptions, resolveItemImage } = require("../utils/itemOptions");

/**
 * Validates stock for each cart item and builds order items array.
 */
const roundMoney = (n) => Math.round(n * 100) / 100;

const buildOrderItems = async (cartItems) => {
  const orderItems = [];
  let subTotal = 0;

  for (const item of cartItems) {
    const product = await Product.findOne({
      _id: item.product,
      isDeleted: false,
    });

    if (!product) {
      throw new ApiError(404, `Product not found: ${item.product}`);
    }

    if (product.status !== "active") {
      throw new ApiError(
        400,
        `Product "${product.title}" is not available for purchase`,
      );
    }

    let variant = null;
    if (item.variant) {
      variant = await Variant.findOne({
        _id: item.variant,
        product: product._id,
        status: "active",
      });
      if (!variant) {
        throw new ApiError(
          400,
          `Selected variant is no longer available for "${product.title}"`,
        );
      }
      // Validate against the real WarehouseStock ledger — the exact same
      // number deductForOrder() will check/decrement at order-creation
      // (COD) or payment-verification (Razorpay) time. Checking the
      // denormalized `variant.stock`/`product.stock` field here instead
      // is what let orders pass validation and then fail at deduction
      // with "Insufficient available stock ... Have 0" whenever that
      // field had drifted out of sync with the ledger (e.g. an admin
      // editing "Stock" directly on the product/variant form).
      const availableStock = await inventoryService.getAvailableStock(
        product._id,
        variant._id,
      );
      if (availableStock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${product.title}" (${variant.sku}). Available: ${availableStock}`,
        );
      }
    } else if (product.hasVariants) {
      throw new ApiError(
        400,
        `"${product.title}" requires a variant to be selected`,
      );
    } else {
      const availableStock = await inventoryService.getAvailableStock(
        product._id,
        null,
      );
      if (availableStock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${product.title}". Available: ${availableStock}`,
        );
      }
    }

    const price = variant
      ? variant.salePrice && variant.salePrice > 0
        ? variant.salePrice
        : variant.price
      : product.salePrice && product.salePrice > 0
        ? product.salePrice
        : product.price;

    const listPrice = variant ? variant.price : product.price;
    const gstRate = Number.isFinite(product.gstRate) ? product.gstRate : 18;

    // Snapshot the jewellery options + line image so the order never changes
    // if the product is edited later.
    const options = resolveItemOptions({
      product,
      variant,
      color: item.color,
      size: item.size,
      colorHex: item.colorHex,
    });

    orderItems.push({
      product: product._id,
      variant: variant ? variant._id : null,
      title: product.title,
      sku: variant ? variant.sku : product.SKU,
      unitValue: variant ? variant.unitValue : product.unitValue,
      thumbnail: resolveItemImage({ product, variant, color: options.color }),
      quantity: item.quantity,
      price,
      // Per-unit pricing breakdown for invoices / admin: list price, the
      // saving vs list, and the GST already included in `price` (all prices
      // in this store are GST-inclusive — see models/Product.js).
      mrp: listPrice,
      discount: Math.max(0, roundMoney(listPrice - price)),
      gstRate,
      gstAmount: roundMoney((price * gstRate) / (100 + gstRate)),
      color: options.color,
      colorHex: options.colorHex,
      size: options.size,
      metal: options.metal,
      plating: options.plating,
    });

    subTotal += price * item.quantity;
  }

  return {
    orderItems,
    subTotal,
  };
};

/**
 * Calculate final order totals
 * Free Shipping
 * No Tax
 */
/**
 * Order totals. Product prices are GST-inclusive (Admin > Settings > Tax
 * "prices include tax", on by default — and what the storefront advertises),
 * so GST is *contained in* the subtotal: `tax` reports that included GST
 * (per item, at each product's own rate, scaled for order-level discounts)
 * and is never added again. Only if an admin switches prices to
 * tax-exclusive is the same per-item GST added on top.
 * GST applies to products only, not shipping.
 */
const calculateTotals = ({ orderItems = [], subTotal, discountAmount = 0, shippingCharge = 0, pricesIncludeTax = true }) => {
  const discountedSubTotal = Math.max(subTotal - discountAmount, 0);
  const discountRatio = subTotal > 0 ? discountedSubTotal / subTotal : 0;

  const lineGst = orderItems.reduce((sum, item) => {
    const rate = Number.isFinite(item.gstRate) ? item.gstRate : 18;
    const perUnit = pricesIncludeTax ? (item.price * rate) / (100 + rate) : (item.price * rate) / 100;
    return sum + perUnit * item.quantity;
  }, 0);
  const tax = roundMoney(lineGst * discountRatio);

  const grandTotal = roundMoney(discountedSubTotal + shippingCharge + (pricesIncludeTax ? 0 : tax));

  return {
    shippingCharge,
    tax,
    taxIncluded: pricesIncludeTax,
    grandTotal,
  };
};

const RAZORPAY_DISCOUNT_PERCENTAGE = 10;

/**
 * Instant discount applied only when paying via Razorpay, calculated on the
 * product subTotal only (never on shipping). COD gets no discount.
 */
const calculateRazorpayDiscount = (subTotal, paymentMethod) => {
  if (paymentMethod !== "razorpay") {
    return { amount: 0, percentage: 0 };
  }

  const amount =
    Math.round(subTotal * (RAZORPAY_DISCOUNT_PERCENTAGE / 100) * 100) / 100;

  return { amount, percentage: RAZORPAY_DISCOUNT_PERCENTAGE };
};

/**
 * Reduce stock after successful order.
 * Also bumps salesCount (used for "popularity" sort and the "best sellers"
 * recommendation rail) — this is the single choke point every successful
 * sale path (COD order creation, Razorpay verify, Razorpay webhook) already
 * runs through, so it stays accurate without touching each call site.
 */
const reduceStock = async (
  orderItems,
  { orderId = null, performedBy = null, session = null } = {},
) => {
  for (const item of orderItems) {
    await inventoryService.deductForOrder({
      productId: item.product,
      variantId: item.variant || null,
      quantity: item.quantity,
      orderId,
      performedBy,
      session,
    });
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { salesCount: item.quantity } },
      { session },
    );
  }
};

/**
 * Restore stock on cancel/refund. Mirrors reduceStock's salesCount bump so
 * "units actually sold" stays correct when an order is later cancelled.
 */
const restoreStock = async (
  orderItems,
  { orderId = null, performedBy = null, session = null } = {},
) => {
  for (const item of orderItems) {
    await inventoryService.restoreForOrderCancellation({
      productId: item.product,
      variantId: item.variant || null,
      quantity: item.quantity,
      orderId,
      performedBy,
      session,
    });
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { salesCount: -item.quantity } },
      { session },
    );
  }
};

/**
 * Appends a status history entry and updates the top-level orderStatus.
 * Does not save() the order — caller is responsible for persisting.
 */
const pushStatusHistory = (order, status, note, changedBy = null) => {
  order.orderStatus = status;
  order.statusHistory.push({ status, note, changedBy, changedAt: new Date() });
};

module.exports = {
  buildOrderItems,
  calculateTotals,
  calculateRazorpayDiscount,
  reduceStock,
  restoreStock,
  pushStatusHistory,
};
