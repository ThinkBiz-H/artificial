const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const User = require("../models/User");
const Order = require("../models/Order");
const otpService = require("../services/otp.service");
const sessionService = require("../services/session.service");
const { issueTokens } = require("../utils/generateTokens");
const { quoteCheckout } = require("../services/checkout.service");

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
};

const getDeviceInfo = (req) => ({
  userAgent: req.headers["user-agent"] || "",
  ip: req.ip || req.headers["x-forwarded-for"] || "",
});

const mapShippingAddress = (shippingAddress = {}) => ({
  type: "Home",
  firstName: shippingAddress.firstName,
  lastName: shippingAddress.lastName,
  addressLine1: shippingAddress.addressLine1,
  addressLine2: shippingAddress.addressLine2,
  city: shippingAddress.city,
  state: shippingAddress.state,
  country: shippingAddress.country || "India",
  pincode: shippingAddress.pincode,
  phone: shippingAddress.phone,
});

// @desc    Step 1 of checkout auth — check whether the mobile number is
//          already registered and send an OTP either way. No register
//          prompt is ever shown to the customer.
// @route   POST /api/v1/checkout/request-otp
// @access  Public
const requestOtp = asyncHandler(async (req, res) => {
  const { mobile, email } = req.body;

  const existingUser = await User.findOne({ mobile });

  if (existingUser) {
    if (!existingUser.isActive) {
      throw new ApiError(
        403,
        "This account has been deactivated. Contact support.",
      );
    }
    const { expiresInMinutes } = await otpService.sendMobileOtp(existingUser);
    return sendResponse(
      res,
      200,
      { isExistingUser: true, expiresInMinutes },
      "OTP sent to your mobile number",
    );
  }

  if (email) {
    const emailOwner = await User.findOne({ email });
    if (emailOwner) {
      throw new ApiError(
        409,
        "This email is already associated with another account. Please use that account's mobile number.",
      );
    }
  }

  const { expiresInMinutes } = await otpService.sendCheckoutOtp(
    mobile,
    email,
  );
  sendResponse(
    res,
    200,
    { isExistingUser: false, expiresInMinutes },
    "OTP sent to your mobile number",
  );
});

// @desc    Resend the checkout OTP (existing-user or guest branch)
// @route   POST /api/v1/checkout/resend-otp
// @access  Public
const resendOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const existingUser = await User.findOne({ mobile }).select(
    "+mobileOtpLastSentAt",
  );

  if (existingUser) {
    const { expiresInMinutes } = await otpService.sendMobileOtp(existingUser);
    return sendResponse(
      res,
      200,
      { isExistingUser: true, expiresInMinutes },
      "OTP resent successfully",
    );
  }

  const { expiresInMinutes } = await otpService.sendCheckoutOtp(mobile);
  sendResponse(
    res,
    200,
    { isExistingUser: false, expiresInMinutes },
    "OTP resent successfully",
  );
});

// @desc    Step 2 of checkout auth — verifies the OTP and either logs the
//          existing user in, or creates the account + saves the shipping
//          address in one step. Issues the same tokens as normal login.
// @route   POST /api/v1/checkout/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp, name, email, shippingAddress, saveAddress } = req.body;
  const device = getDeviceInfo(req);

  const existingUser = await User.findOne({ mobile }).select(
    "+mobileOtp +mobileOtpExpire +mobileOtpAttempts",
  );

  if (existingUser) {
    try {
      await otpService.verifyMobileOtp(existingUser, otp);
    } catch (err) {
      await sessionService.recordLogin({
        userId: existingUser._id,
        method: "mobile_otp",
        success: false,
        reason: "invalid_otp",
        ...device,
      });
      throw err;
    }

    if (!existingUser.isActive) {
      throw new ApiError(
        403,
        "This account has been deactivated. Contact support.",
      );
    }

    if (saveAddress && shippingAddress?.addressLine1) {
      const hasAddresses = existingUser.address.length > 0;
      existingUser.address.push({
        ...mapShippingAddress(shippingAddress),
        isDefault: !hasAddresses,
      });
      await existingUser.save({ validateBeforeSave: false });
    }

    const { accessToken } = await issueTokens(existingUser, res, device);
    await sessionService.recordLogin({
      userId: existingUser._id,
      method: "mobile_otp",
      success: true,
      ...device,
    });

    const userData = existingUser.toObject();
    delete userData.password;

    return sendResponse(
      res,
      200,
      { user: userData, accessToken, isNewUser: false },
      "Mobile number verified successfully",
    );
  }

  // New user — verify against the guest CheckoutOtp record, then create
  // the account, atomically saving the shipping address the customer just
  // filled in during checkout.
  const { email: storedEmail } = await otpService.verifyCheckoutOtp(
    mobile,
    otp,
  );

  const randomPassword = crypto.randomBytes(32).toString("hex");
  const resolvedName =
    name ||
    `${shippingAddress?.firstName || ""} ${shippingAddress?.lastName || ""}`.trim() ||
    "Customer";

  const newUser = await User.create({
    name: resolvedName,
    email: email || storedEmail || undefined,
    mobile,
    password: randomPassword,
    isVerified: true,
    isMobileVerified: true,
    address:
      shippingAddress?.addressLine1
        ? [{ ...mapShippingAddress(shippingAddress), isDefault: true }]
        : [],
  });

  const { accessToken } = await issueTokens(newUser, res, device);
  await sessionService.recordLogin({
    userId: newUser._id,
    method: "mobile_otp",
    success: true,
    ...device,
  });

  const userData = newUser.toObject();
  delete userData.password;

  sendResponse(
    res,
    201,
    { user: userData, accessToken, isNewUser: true },
    "Account created and verified successfully",
  );
});

// @desc    Checkout summary priced by the server — the same pricing the order
//          uses (items, coupon, prepaid discount, shipping, GST, total) plus
//          the payment methods enabled in Admin > Settings. Logged-in users
//          are priced from their server bag; guests send { items }.
// @route   POST /api/v1/checkout/quote
// @access  Public (optional auth)
const quote = asyncHandler(async (req, res) => {
  const { items, pincode, paymentMethod, couponCode } = req.body || {};
  const summary = await quoteCheckout({
    userId: req.user?._id || null,
    items: Array.isArray(items) ? items : [],
    pincode,
    paymentMethod,
    couponCode,
  });
  sendResponse(res, 200, summary, "Checkout summary");
});

// @desc    Checkout autofill — look up a returning customer's saved name +
//          shipping address by mobile (preferred) or email, so the guest
//          checkout form can prefill itself the way Amazon/Flipkart do.
//          Exact-match, single-document, indexed queries only — never a
//          collection scan. Rate-limited (see rateLimiter.middleware.js)
//          since this is unauthenticated and returns PII.
// @route   GET /api/v1/checkout/lookup-customer?mobile=... | ?email=...
// @access  Public
const lookupCustomer = asyncHandler(async (req, res) => {
  const mobile = req.query.mobile ? String(req.query.mobile).trim() : "";
  const email = req.query.email
    ? String(req.query.email).trim().toLowerCase()
    : "";

  if (!mobile && !email) {
    throw new ApiError(400, "mobile or email is required");
  }

  // Mobile takes priority over email per the requested search order.
  const query = mobile ? { mobile } : { email };
  const user = await User.findOne(query)
    .select("name email mobile address")
    .lean();

  if (!user) {
    return sendResponse(res, 200, { found: false }, "No matching customer found");
  }

  // Prefer the user's own saved default/most-recent address (richest,
  // already split into firstName/lastName); fall back to their most recent
  // order's shipping address if they have no saved address on file yet.
  let addr =
    (user.address || []).find((a) => a.isDefault) ||
    (user.address || [])[user.address?.length - 1];
  let nameSource = addr
    ? { firstName: addr.firstName, lastName: addr.lastName }
    : null;

  if (!addr) {
    const lastOrder = await Order.findOne({ user: user._id })
      .sort({ createdAt: -1 })
      .select("shippingAddress")
      .lean();
    if (lastOrder?.shippingAddress?.addressLine1) {
      addr = lastOrder.shippingAddress;
      nameSource = splitName(lastOrder.shippingAddress.fullName);
    }
  }

  if (!nameSource) nameSource = splitName(user.name);

  const customer = {
    firstName: nameSource.firstName || "",
    lastName: nameSource.lastName || "",
    email: user.email || email || "",
    mobile: user.mobile || mobile || "",
    address1: addr?.addressLine1 || "",
    address2: addr?.addressLine2 || "",
    city: addr?.city || "",
    state: addr?.state || "",
    pincode: addr?.pincode || "",
    country: addr?.country || "India",
  };

  sendResponse(res, 200, { found: true, customer }, "Customer found");
});

module.exports = { requestOtp, resendOtp, verifyOtp, lookupCustomer, quote };
