const crypto = require("crypto");
const ApiError = require("../utils/ApiError");
const { sendSms } = require("./sms.service");
const CheckoutOtp = require("../models/CheckoutOtp");

const COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 5;
const EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES) || 10;

const OTP_SEND_FAILED = "We couldn't send the OTP right now. Please try again in a moment.";

/**
 * Sends an OTP SMS and confirms the provider accepted it. AmazeSMS answers
 * HTTP 200 even when it refuses a message, so only status "success" counts.
 * Any failure becomes a clean 503 instead of a raw axios/provider message.
 */
const deliverOtpSms = async (to, message) => {
  let response;
  try {
    response = await sendSms({ to, message });
  } catch {
    throw new ApiError(503, OTP_SEND_FAILED);
  }
  if (response?.status !== "success") {
    throw new ApiError(503, OTP_SEND_FAILED);
  }
};

const sendMobileOtp = async (user) => {
  if (user.mobileOtpLastSentAt) {
    const secondsSinceLastSend =
      (Date.now() - new Date(user.mobileOtpLastSentAt).getTime()) / 1000;
    if (secondsSinceLastSend < COOLDOWN_SECONDS) {
      const wait = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastSend);
      throw new ApiError(
        429,
        `Please wait ${wait}s before requesting another OTP`,
      );
    }
  }

  const previous = {
    mobileOtp: user.mobileOtp,
    mobileOtpExpire: user.mobileOtpExpire,
    mobileOtpAttempts: user.mobileOtpAttempts,
    mobileOtpLastSentAt: user.mobileOtpLastSentAt,
  };
  const otp = user.generateMobileOtpCode();
  await user.save({ validateBeforeSave: false });

  try {
    await deliverOtpSms(
      user.mobile,
      `Dear User, Your SWASTIKALA verification OTP is  ${otp}. This OTP is valid for ${Number(process.env.OTP_EXPIRY_MINUTES) || 10}  minutes. Do not share this OTP with anyone. - SWASTIKALA -SWASTIKALA`,
    );
  } catch (error) {
    // The SMS never went out — restore the previous OTP state so the
    // resend cooldown doesn't lock the customer out of retrying.
    Object.assign(user, previous);
    await user.save({ validateBeforeSave: false });
    throw error;
  }

  return { expiresInMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 10 };
};

const verifyMobileOtp = async (user, submittedOtp) => {
  if (!user.mobileOtp || !user.mobileOtpExpire) {
    throw new ApiError(
      400,
      "No OTP was requested for this account. Request a new one.",
    );
  }

  if (user.mobileOtpAttempts >= MAX_ATTEMPTS) {
    user.mobileOtp = undefined;
    user.mobileOtpExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(429, "Too many incorrect attempts. Request a new OTP.");
  }

  if (new Date(user.mobileOtpExpire).getTime() < Date.now()) {
    throw new ApiError(400, "OTP has expired. Request a new one.");
  }

  const hashedSubmitted = crypto
    .createHash("sha256")
    .update(String(submittedOtp))
    .digest("hex");
  if (hashedSubmitted !== user.mobileOtp) {
    user.mobileOtpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      400,
      `Incorrect OTP (${MAX_ATTEMPTS - user.mobileOtpAttempts} attempt(s) remaining)`,
    );
  }

  user.mobileOtp = undefined;
  user.mobileOtpExpire = undefined;
  user.mobileOtpAttempts = 0;
  user.isMobileVerified = true;
  await user.save({ validateBeforeSave: false });
};

/**
 * Checkout-flow equivalents of sendMobileOtp/verifyMobileOtp, but for a
 * mobile number that doesn't have a User account yet — state lives in the
 * short-lived CheckoutOtp collection instead of on a User doc.
 */
const sendCheckoutOtp = async (mobile, email) => {
  let doc = await CheckoutOtp.findOne({ mobile }).select("+lastSentAt");

  if (doc && doc.lastSentAt) {
    const secondsSinceLastSend =
      (Date.now() - new Date(doc.lastSentAt).getTime()) / 1000;
    if (secondsSinceLastSend < COOLDOWN_SECONDS) {
      const wait = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastSend);
      throw new ApiError(
        429,
        `Please wait ${wait}s before requesting another OTP`,
      );
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  if (!doc) doc = new CheckoutOtp({ mobile });
  const previousLastSentAt = doc.lastSentAt;
  doc.email = email || doc.email;
  doc.otp = otpHash;
  doc.otpExpire = Date.now() + EXPIRY_MINUTES * 60 * 1000;
  doc.attempts = 0;
  doc.lastSentAt = Date.now();
  await doc.save();

  try {
    await deliverOtpSms(
      mobile,
      `Dear User, Your SWASTIKALA verification OTP is  ${otp}. This OTP is valid for ${EXPIRY_MINUTES}  minutes. Do not share this OTP with anyone. - SWASTIKALA -SWASTIKALA`,
    );
  } catch (error) {
    // Not sent — lift the cooldown so the customer can retry straight away.
    doc.lastSentAt = previousLastSentAt;
    await doc.save();
    throw error;
  }

  return { expiresInMinutes: EXPIRY_MINUTES };
};

// Verifies the OTP for a not-yet-registered mobile and returns the email
// that was captured when the OTP was requested. Deletes the doc on success.
const verifyCheckoutOtp = async (mobile, submittedOtp) => {
  const doc = await CheckoutOtp.findOne({ mobile }).select(
    "+otp +otpExpire +attempts",
  );

  if (!doc || !doc.otp || !doc.otpExpire) {
    throw new ApiError(
      400,
      "No OTP was requested for this mobile number. Request a new one.",
    );
  }

  if (doc.attempts >= MAX_ATTEMPTS) {
    await doc.deleteOne();
    throw new ApiError(429, "Too many incorrect attempts. Request a new OTP.");
  }

  if (new Date(doc.otpExpire).getTime() < Date.now()) {
    throw new ApiError(400, "OTP has expired. Request a new one.");
  }

  const hashedSubmitted = crypto
    .createHash("sha256")
    .update(String(submittedOtp))
    .digest("hex");
  if (hashedSubmitted !== doc.otp) {
    doc.attempts += 1;
    await doc.save();
    throw new ApiError(
      400,
      `Incorrect OTP (${MAX_ATTEMPTS - doc.attempts} attempt(s) remaining)`,
    );
  }

  const email = doc.email;
  await doc.deleteOne();
  return { email };
};

module.exports = {
  sendMobileOtp,
  verifyMobileOtp,
  sendCheckoutOtp,
  verifyCheckoutOtp,
};
