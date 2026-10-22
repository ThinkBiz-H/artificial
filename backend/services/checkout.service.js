const ApiError = require("../utils/ApiError");
const { isFeatureEnabled } = require('../middlewares/featureFlag.middleware');
const Order = require("../models/Order");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Settings = require("../models/Settings");
const PaymentIntent = require("../models/PaymentIntent");
const razorpayInstance = require("../config/razorpay");
const shippingService = require("./shipping.service");
const { buildOrderItems, calculateTotals, calculateRazorpayDiscount, reduceStock } = require("./order.service");

/**
 * Which payment methods the store accepts, from Admin > Settings > Payment
 * (the same fields the storefront reads). The legacy `featureFlags.codEnabled`
 * switch is still honoured if an older admin build set it.
 */
const getPaymentMethods = async () => {
  const settings = await Settings.findOne().lean();
  const legacyCod = settings?.featureFlags?.codEnabled;
  return {
    cod: settings?.payment?.codEnabled !== false && legacyCod !== false,
    online: settings?.payment?.onlinePaymentEnabled !== false && settings?.integrations?.razorpayEnabled !== false,
  };
};

const assertPaymentMethodAllowed = async (paymentMethod) => {
  const methods = await getPaymentMethods();
  if (paymentMethod === "cod" && !methods.cod) throw new ApiError(400, "Cash on Delivery is currently unavailable.");
  if (paymentMethod === "razorpay" && !methods.online) throw new ApiError(400, "Online payment is currently unavailable.");
  if (!["cod", "razorpay"].includes(paymentMethod)) throw new ApiError(400, "Choose a payment method.");
};

/**
 * Prices a set of bag lines server-side: items (with stock checks and
 * option/GST snapshots), coupon, shipping, prepaid discount, GST and total.
 * The one pricing path behind the checkout quote, COD orders and online
 * payment intents — so the summary a shopper sees is exactly what is charged.
 *
 * strictCoupon: orders reject a bad coupon; the quote reports it instead.
 * Without a 6-digit pincode, shipping is left unquoted (charge 0).
 */
const priceLines = async ({ cartItems, userId = null, pincode, paymentMethod, couponCode, strictCoupon = true }) => {
  if (!cartItems.length) throw new ApiError(400, "Your cart is empty");
  const { orderItems, subTotal } = await buildOrderItems(cartItems);

  let discountAmount = 0;
  let coupon = null;
  let couponError = null;
  if (couponCode) {
    // Admin > Settings > Feature flags > Coupons.
    const couponsOn = await isFeatureEnabled("coupons");
    coupon = couponsOn ? await Coupon.findOne({ code: String(couponCode).trim().toUpperCase() }) : null;
    const validity = !couponsOn
      ? { valid: false, reason: "Coupons are currently unavailable." }
      : coupon
        ? coupon.isValid(subTotal, userId)
        : { valid: false, reason: "Invalid coupon code" };
    if (validity.valid) {
      discountAmount = coupon.calculateDiscount(subTotal);
    } else {
      if (strictCoupon) throw new ApiError(coupon || !couponsOn ? 400 : 404, validity.reason);
      couponError = validity.reason;
      coupon = null;
    }
  }

  const shippingQuoted = /^\d{6}$/.test(String(pincode || ""));
  const shipping = shippingQuoted
    ? await shippingService.calculateShipping({ deliveryPincode: pincode, weight: 0.5, cod: paymentMethod === "cod", subTotal })
    : { shippingCharge: 0, courierName: null, courierId: null, estimatedDays: null, freeShipping: false };

  const razorpayDiscount = calculateRazorpayDiscount(subTotal, paymentMethod);
  const settings = await Settings.findOne().select("tax").lean();
  const { tax, taxIncluded, grandTotal } = calculateTotals({
    orderItems,
    subTotal,
    discountAmount: discountAmount + razorpayDiscount.amount,
    shippingCharge: shipping.shippingCharge,
    pricesIncludeTax: settings?.tax?.pricesIncludeTax !== false,
  });

  return { orderItems, subTotal, coupon, couponError, discountAmount, razorpayDiscount, shipping, shippingQuoted, tax, taxIncluded, grandTotal };
};

/** Bag lines of a logged-in user's server cart, in the shape priceLines() expects. */
const userCartLines = async (userId) => {
  const user = await User.findById(userId).populate("cart.product").populate("cart.variant");
  if (!user) throw new ApiError(404, "User not found");
  const cartItems = (user.cart || [])
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product._id,
      variant: item.variant?._id || null,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      colorHex: item.colorHex,
    }));
  return { user, cartItems };
};

/** Prices the logged-in user's bag for an actual order (strict: bad coupon or missing pincode is an error). */
const priceCheckout = async (userId, { shippingAddress, paymentMethod, couponCode }) => {
  if (!/^\d{6}$/.test(String(shippingAddress?.pincode || ""))) throw new ApiError(400, "A valid 6-digit pincode is required");
  const { user, cartItems } = await userCartLines(userId);
  const priced = await priceLines({ cartItems, userId, pincode: shippingAddress.pincode, paymentMethod, couponCode });
  return { user, ...priced };
};

const PAYMENT_METHOD_INFO = {
  cod: { label: "Cash on delivery", description: "Pay when your order arrives" },
  razorpay: { label: "Pay online", description: "UPI, cards, net banking & wallets — secured by Razorpay" },
};

/**
 * Checkout summary for the storefront — computed by the same priceLines()
 * the order uses, plus the payment methods the admin has enabled. Logged-in
 * shoppers are priced from their server bag; guests send their bag lines.
 */
const quoteCheckout = async ({ userId, items = [], pincode, paymentMethod, couponCode }) => {
  const cartItems = userId
    ? (await userCartLines(userId)).cartItems
    : items
        .filter((i) => i && i.productId && Number(i.quantity) > 0)
        .slice(0, 50)
        .map((i) => ({
          product: i.productId,
          variant: i.variantId || null,
          quantity: Math.min(99, Math.floor(Number(i.quantity))),
          color: i.color,
          size: i.size,
        }));

  const enabled = await getPaymentMethods();
  const prepaidPercent = calculateRazorpayDiscount(100, "razorpay").percentage;
  const paymentMethods = [
    ...(enabled.online ? [{ id: "razorpay", ...PAYMENT_METHOD_INFO.razorpay, offer: prepaidPercent ? `Save ${prepaidPercent}% on prepaid` : null }] : []),
    ...(enabled.cod ? [{ id: "cod", ...PAYMENT_METHOD_INFO.cod }] : []),
  ];
  const method = paymentMethods.some((m) => m.id === paymentMethod) ? paymentMethod : null;

  const priced = await priceLines({ cartItems, userId, pincode, paymentMethod: method, couponCode, strictCoupon: false });

  return {
    subTotal: priced.subTotal,
    couponCode: priced.coupon?.code || null,
    couponDiscount: priced.discountAmount,
    couponError: priced.couponError,
    prepaidDiscount: priced.razorpayDiscount.amount,
    prepaidDiscountPercent: priced.razorpayDiscount.percentage || prepaidPercent,
    shipping: {
      quoted: priced.shippingQuoted,
      charge: priced.shipping.shippingCharge,
      free: priced.shippingQuoted && priced.shipping.shippingCharge === 0,
      estimatedDays: priced.shipping.estimatedDays,
    },
    tax: priced.tax,
    taxIncluded: priced.taxIncluded,
    grandTotal: priced.grandTotal,
    paymentMethods,
  };
};

/** The Order document fields for a priced checkout (payment status/info are added by the caller). */
const buildOrderData = (priced, { shippingAddress, shippingNotes, paymentMethod }) => ({
  user: priced.user._id,
  items: priced.orderItems,
  shippingAddress,
  shippingNotes,
  coupon: priced.coupon ? { code: priced.coupon.code, discountAmount: priced.discountAmount } : undefined,
  discountAmount: priced.razorpayDiscount.amount,
  discountPercentage: priced.razorpayDiscount.percentage,
  subTotal: priced.subTotal,
  shippingCharge: priced.shipping.shippingCharge,
  tax: priced.tax,
  taxIncluded: priced.taxIncluded,
  grandTotal: priced.grandTotal,
  paymentMethod,
  courier: {
    partner: priced.shipping.courierName === "Standard Shipping" ? "Manual" : "Shiprocket",
    courierId: priced.shipping.courierId,
    courierName: priced.shipping.courierName,
  },
  tracking: {
    shipmentStatus: "Not Shipped",
    estimatedDeliveryDate: priced.shipping.estimatedDays ? new Date(Date.now() + priced.shipping.estimatedDays * 24 * 60 * 60 * 1000) : null,
  },
});

/** Turns a Razorpay SDK failure into a clear 502 (never a 401 the storefront would read as "session expired"). */
const razorpayError = (err) => {
  const detail = err?.error?.description || err?.message || "unknown error";
  return new ApiError(502, `Online payment is unavailable right now (${detail}). Please try again or choose Cash on Delivery.`);
};

/**
 * Online checkout, step 1: price the bag and open a Razorpay order. No Order
 * is created — the priced order waits in a PaymentIntent until payment succeeds.
 */
const createPaymentIntent = async (userId, { shippingAddress, shippingNotes, couponCode }) => {
  await assertPaymentMethodAllowed("razorpay");
  const priced = await priceCheckout(userId, { shippingAddress, paymentMethod: "razorpay", couponCode });
  const orderData = buildOrderData(priced, { shippingAddress, shippingNotes, paymentMethod: "razorpay" });

  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(priced.grandTotal * 100), // paise
      currency: "INR",
      receipt: `chk_${Date.now().toString(36)}_${String(userId).slice(-6)}`,
      notes: { userId: String(userId) },
    });
  } catch (err) {
    throw razorpayError(err);
  }

  await PaymentIntent.create({ user: userId, razorpayOrderId: razorpayOrder.id, amount: priced.grandTotal, orderData });

  return { razorpayOrder, razorpayKeyId: process.env.RAZORPAY_KEY_ID, amount: priced.grandTotal };
};

/**
 * Online checkout, step 2: payment succeeded → create the Order (Paid +
 * Confirmed), reduce stock, record coupon usage and clear the bag — exactly
 * once. The browser confirm and the Razorpay webhook can both arrive; the
 * intent's created→converted compare-and-swap lets only one proceed.
 *
 * Returns null when there is no intent for this Razorpay order (e.g. a
 * legacy pending-order payment, which the caller handles as before).
 * Returns { order, created } otherwise.
 */
const finalizePaidIntent = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, session = null) => {
  const claimed = await PaymentIntent.findOneAndUpdate(
    { razorpayOrderId, status: "created" },
    { $set: { status: "converted" }, $unset: { expiresAt: 1 } },
    { new: true, session },
  );

  if (!claimed) {
    const existing = await PaymentIntent.findOne({ razorpayOrderId }).session(session);
    if (!existing) return null;
    const order = existing.order ? await Order.findById(existing.order).session(session) : await Order.findOne({ "paymentInfo.razorpayOrderId": razorpayOrderId }).session(session);
    return { order, created: false };
  }

  try {
    const [order] = await Order.create(
      [
        {
          ...claimed.orderData,
          paymentStatus: "Paid",
          orderStatus: "Confirmed",
          paymentInfo: {
            razorpayOrderId,
            razorpayPaymentId,
            ...(razorpaySignature ? { razorpaySignature } : {}),
            paidAt: new Date(),
          },
          statusHistory: [
            { status: "Pending", note: "Order placed" },
            { status: "Confirmed", note: "Payment verified successfully" },
          ],
        },
      ],
      { session },
    );

    claimed.order = order._id;
    await claimed.save({ session });

    await reduceStock(order.items, { orderId: order._id, performedBy: order.user, session });
    if (order.coupon?.code) {
      const couponDoc = await Coupon.findOne({ code: order.coupon.code }).session(session);
      if (couponDoc) await couponDoc.recordUsage(order.user, session);
    }
    await User.findByIdAndUpdate(order.user, { $set: { cart: [] } }, { session });

    return { order, created: true };
  } catch (err) {
    // Without a transaction, release the claim so a retry (or the webhook) can finish the job.
    if (!session) {
      await PaymentIntent.updateOne({ _id: claimed._id }, { $set: { status: "created", order: null } }).catch(() => null);
    }
    throw err;
  }
};

module.exports = {
  getPaymentMethods,
  quoteCheckout,
  priceLines,
  assertPaymentMethodAllowed,
  priceCheckout,
  buildOrderData,
  createPaymentIntent,
  finalizePaidIntent,
  razorpayError,
};
