const mongoose = require("mongoose");

// Holds OTP state for guest checkout on a mobile number that has no User
// account yet — a User doc can't carry OTP fields before it exists. Rows
// self-expire 30 minutes after creation (TTL index) so abandoned guest
// checkouts don't linger.
const checkoutOtpSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  email: { type: String },
  otp: { type: String, select: false },
  otpExpire: { type: Date, select: false },
  attempts: { type: Number, default: 0, select: false },
  lastSentAt: { type: Date, select: false },
  createdAt: { type: Date, default: Date.now, expires: 1800 },
});

module.exports = mongoose.model("CheckoutOtp", checkoutOtpSchema);
