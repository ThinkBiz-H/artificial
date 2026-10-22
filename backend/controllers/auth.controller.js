const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const User = require("../models/User");
const {
  issueTokens,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  LEGACY_REFRESH_COOKIE,
  refreshCookieName,
  setRefreshCookie,
  clearRefreshCookie,
  clearLegacyRefreshCookie,
} = require("../utils/generateTokens");
const { sendEmail, templates } = require("../utils/sendEmail");
const otpService = require("../services/otp.service");
const sessionService = require("../services/session.service");

const getDeviceInfo = (req) => ({
  userAgent: req.headers["user-agent"] || "",
  ip: req.ip || req.headers["x-forwarded-for"] || "",
});

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, mobile, password });

  // const otp = user.generateOtpCode();
  // await user.save({ validateBeforeSave: false });

  // try {
  //   await sendEmail({
  //     to: user.email,
  //     subject: 'Verify your account - OTP',
  //     html: templates.otp(user.name, otp),
  //   });
  // } catch (err) {
  //   // Non-fatal: user is created, they can resend OTP
  // }

  const { expiresInMinutes } = await otpService.sendMobileOtp(user);

  sendResponse(
    res,
    201,
    {
      userId: user._id,
      mobile: user.mobile,
      expiresInMinutes,
    },
    "Registration successful. OTP sent to your mobile number.",
  );
});

// @desc    Verify OTP (email verification)
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  console.log("REQ BODY =>", req.body);

  const { mobile, otp } = req.body;

  const user = await User.findOne({ mobile }).select(
    "+mobileOtp +mobileOtpExpire +mobileOtpAttempts +mobileOtpLastSentAt",
  );

  console.log("USER =>", user);

  if (!user) {
    throw new ApiError(404, "No account found with this mobile number");
  }

  console.log("mobileOtp =>", user.mobileOtp);
  console.log("mobileOtpExpire =>", user.mobileOtpExpire);
  console.log("mobileOtpAttempts =>", user.mobileOtpAttempts);

  await otpService.verifyMobileOtp(user, otp);

  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  sendResponse(
    res,
    200,
    {},
    "Mobile number verified successfully. You can now log in.",
  );
});

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
const resendOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const user = await User.findOne({ mobile }).select("+mobileOtpLastSentAt");

  if (!user) {
    throw new ApiError(404, "No account found with this mobile number");
  }

  const { expiresInMinutes } = await otpService.sendMobileOtp(user);

  sendResponse(res, 200, { expiresInMinutes }, "OTP resent successfully.");
});

// Configurable without a code change — sensible defaults if unset.
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5;
const LOCKOUT_DURATION_MINUTES =
  parseInt(process.env.LOCKOUT_DURATION_MINUTES, 10) || 15;

// @desc    Login user (email + password)
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email })
    .select("+password")
    .populate("roleRef");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your account");
  }

  // const accessToken = generateAccessToken({
  //   id: user._id,
  //   role: user.role,
  // });

  // const userData = user.toObject();
  // delete userData.password;

  // sendResponse(
  //   res,
  //   200,
  //   {
  //     user: userData,
  //     accessToken,
  //   },
  //   "Login successful",
  // );
  const device = getDeviceInfo(req);

  const { accessToken } = await issueTokens(user, res, device);

  const userData = user.toObject();
  delete userData.password;

  sendResponse(
    res,
    200,
    {
      user: userData,
      accessToken,
    },
    "Login successful",
  );
});
// @desc    Logout current device only — revokes this session; the refresh
//          cookie is cleared, and the (already short-lived) access token
//          simply expires naturally within its remaining lifetime.
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  if (req.sessionId) {
    await sessionService.revokeSession(req.sessionId, req.user._id);
  }
  clearRefreshCookie(req, res, { includeLegacy: true });
  sendResponse(res, 200, {}, "Logged out successfully");
});

// @desc    Logout every device except (optionally) the current one
// @route   POST /api/v1/auth/logout-all
// @access  Private
const logoutAllDevices = asyncHandler(async (req, res) => {
  const keepCurrent = req.body.keepCurrentSession === true;
  await sessionService.revokeAllSessions(
    req.user._id,
    keepCurrent ? req.sessionId : null,
  );
  if (!keepCurrent) clearRefreshCookie(req, res, { includeLegacy: true });
  sendResponse(
    res,
    200,
    {},
    keepCurrent
      ? "Logged out of all other devices"
      : "Logged out of all devices",
  );
});

// @desc    List this user's active device sessions
// @route   GET /api/v1/auth/sessions
// @access  Private
const getSessions = asyncHandler(async (req, res) => {
  const sessions = await sessionService.listActiveSessions(req.user._id);
  sendResponse(
    res,
    200,
    {
      sessions: sessions.map((s) => ({
        ...s.toObject(),
        isCurrent: String(s._id) === String(req.sessionId),
      })),
    },
    "Active sessions fetched successfully",
  );
});

// @desc    Revoke one specific device session
// @route   DELETE /api/v1/auth/sessions/:id
// @access  Private
const revokeSessionById = asyncHandler(async (req, res) => {
  await sessionService.revokeSession(req.params.id, req.user._id);
  if (req.params.id === req.sessionId)
    clearRefreshCookie(req, res, { includeLegacy: true });
  sendResponse(res, 200, {}, "Session revoked successfully");
});

// @desc    This user's login history
// @route   GET /api/v1/auth/login-history
// @access  Private
const getLoginHistory = asyncHandler(async (req, res) => {
  const history = await sessionService.getLoginHistory(req.user._id, req.query);
  sendResponse(res, 200, { history }, "Login history fetched successfully");
});

// @desc    Refresh access token using refresh token cookie. Rotates the
//          refresh token on every use (Phase 7) — the session's stored hash
//          and expiry are both updated, and a new refresh cookie is set,
//          rather than reusing the same refresh token indefinitely.
// @route   POST /api/v1/auth/refresh-token
// @access  Public (requires valid refresh token cookie)

const refreshAccessToken = asyncHandler(async (req, res) => {
  // This client's own cookie (see utils/generateTokens.js). A web client
  // that hasn't been issued one yet falls back to the legacy shared cookie
  // once, and is migrated below if it turns out to be a genuine session.
  const ownCookie = refreshCookieName(req);
  let incomingRefreshToken = req.cookies?.[ownCookie] || req.body?.refreshToken;
  // Mobile clients send the token in the body and keep exactly one copy.
  const fromBody = !req.cookies?.[ownCookie] && !!req.body?.refreshToken;
  let fromLegacyCookie = false;
  if (!incomingRefreshToken && ownCookie !== LEGACY_REFRESH_COOKIE && req.cookies?.[LEGACY_REFRESH_COOKIE]) {
    incomingRefreshToken = req.cookies[LEGACY_REFRESH_COOKIE];
    fromLegacyCookie = true;
  }

  // A rejected token of ours is cleared so it isn't re-sent on every page
  // load. An unverified legacy cookie is left alone — on localhost it may
  // belong to a different app entirely.
  const reject = (message) => {
    if (!fromLegacyCookie) clearRefreshCookie(req, res);
    return new ApiError(401, message);
  };

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (error) {
    throw reject("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw reject("User no longer exists");
  }

  const validated = await sessionService.validateSession(
    decoded.sid,
    incomingRefreshToken,
  );

  if (!validated) {
    throw reject("Session has been revoked or expired. Please login again.");
  }
  const { session, isGrace } = validated;

  const payload = {
    id: user._id,
    role: user.role,
    sid: decoded.sid,
  };

  const accessToken = generateAccessToken(payload);

  // A browser request that raced a rotation (isGrace) only gets an access
  // token: the winning request already set the new refresh cookie, and
  // rotating again would invalidate it. A body-token (mobile) client reusing
  // the previous token means the rotate response never reached it — rotate
  // again so it gets a token it actually holds.
  if (!isGrace || fromBody) {
    const newRefreshToken = generateRefreshToken(payload);
    await sessionService.rotateSession(session, newRefreshToken);
    setRefreshCookie(req, res, newRefreshToken);
    // Migrated from the legacy shared cookie: it verified as ours, so retire it.
    if (fromLegacyCookie) clearLegacyRefreshCookie(res);
  }

  return sendResponse(
    res,
    200,
    {
      accessToken,
    },
    "Access token refreshed successfully",
  );
});

// ---------- Phase 7: Mobile OTP authentication ----------

// @desc    Register a new account via mobile number (no password — OTP is the auth factor)
// @route   POST /api/v1/auth/mobile/register
// @access  Public
const mobileRegister = asyncHandler(async (req, res) => {
  const { name, mobile } = req.body;

  const existing = await User.findOne({ mobile });
  if (existing) {
    throw new ApiError(
      409,
      "An account with this mobile number already exists. Please log in instead.",
    );
  }

  const user = await User.create({ name, mobile });
  const { expiresInMinutes } = await otpService.sendMobileOtp(user);

  sendResponse(
    res,
    201,
    { userId: user._id, mobile: user.mobile, expiresInMinutes },
    "OTP sent to your mobile number",
  );
});

// @desc    Request an OTP to log in to an existing mobile-registered account
// @route   POST /api/v1/auth/mobile/login
// @access  Public
const mobileLoginRequestOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const user = await User.findOne({ mobile });
  if (!user)
    throw new ApiError(
      404,
      "No account found with this mobile number. Please register first.",
    );
  if (!user.isActive)
    throw new ApiError(
      403,
      "This account has been deactivated. Contact support.",
    );

  const { expiresInMinutes } = await otpService.sendMobileOtp(user);
  sendResponse(
    res,
    200,
    { mobile: user.mobile, expiresInMinutes },
    "OTP sent to your mobile number",
  );
});

// @desc    Verify a mobile OTP — completes registration OR login, either
//          way issuing tokens the same way the password login does.
// @route   POST /api/v1/auth/mobile/verify
// @access  Public
const mobileVerifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;
  const device = getDeviceInfo(req);

  const user = await User.findOne({ mobile }).select(
    "+mobileOtp +mobileOtpExpire +mobileOtpAttempts",
  );
  if (!user)
    throw new ApiError(404, "No account found with this mobile number");

  try {
    await otpService.verifyMobileOtp(user, otp);
  } catch (err) {
    await sessionService.recordLogin({
      userId: user._id,
      method: "mobile_otp",
      success: false,
      reason: "invalid_otp",
      ...device,
    });
    throw err;
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      "This account has been deactivated. Contact support.",
    );
  }

  const { accessToken } = await issueTokens(user, res, device);

  await sessionService.recordLogin({
    userId: user._id,
    method: "mobile_otp",
    success: true,
    ...device,
  });

  const userData = user.toObject();
  delete userData.password;

  sendResponse(
    res,
    200,
    { user: userData, accessToken },
    "Mobile number verified successfully",
  );
});

// @desc    Resend mobile OTP (cooldown enforced in otp.service.js)
// @route   POST /api/v1/auth/mobile/resend-otp
// @access  Public
const resendMobileOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const user = await User.findOne({ mobile }).select("+mobileOtpLastSentAt");
  if (!user)
    throw new ApiError(404, "No account found with this mobile number");

  const { expiresInMinutes } = await otpService.sendMobileOtp(user);
  sendResponse(res, 200, { expiresInMinutes }, "OTP resent successfully");
});

// @desc    Forgot password - sends reset link/token to email
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Respond generically to prevent user enumeration
    return sendResponse(
      res,
      200,
      {},
      "If an account exists, a reset link has been sent to the email",
    );
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: templates.resetPassword(user.name, resetUrl),
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      500,
      "Failed to send reset email. Please try again later.",
    );
  }

  sendResponse(
    res,
    200,
    {},
    "If an account exists, a reset link has been sent to the email",
  );
});

// @desc    Reset password using token from email
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // A password reset is a credible signal of compromise or a forgotten
  // device — revoke every existing session so a stale/stolen refresh
  // token can't keep working after the password changes.
  await sessionService.revokeAllSessions(user._id);

  sendResponse(
    res,
    200,
    {},
    "Password reset successful. Please log in with your new password.",
  );
});
const forgotPasswordMobile = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const user = await User.findOne({ mobile }).select(
    "+mobileOtp +mobileOtpExpire +mobileOtpAttempts +mobileOtpLastSentAt",
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { expiresInMinutes } = await otpService.sendMobileOtp(user);

  sendResponse(res, 200, { expiresInMinutes }, "OTP sent successfully");
});
const verifyResetOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  const user = await User.findOne({ mobile }).select(
    "+mobileOtp +mobileOtpExpire +mobileOtpAttempts",
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await otpService.verifyMobileOtp(user, otp);

  sendResponse(res, 200, {}, "OTP verified successfully");
});
const resetPasswordMobile = asyncHandler(async (req, res) => {
  console.log("BODY =", req.body);

  const { mobile, otp, password } = req.body;

  console.log(mobile);
  console.log(otp);
  console.log(password);

  const user = await User.findOne({ mobile }).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isMobileVerified) {
    throw new ApiError(400, "Please verify OTP first");
  }

  user.password = password;
  user.isMobileVerified = false;

  await user.save();

  await sessionService.revokeAllSessions(user._id);

  sendResponse(res, 200, {}, "Password updated successfully");
});
// @desc    Change password (logged in user)
// @route   POST /api/v1/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  sendResponse(res, 200, {}, "Password changed successfully");
});

// @desc    Get current logged-in user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("wishlist")
    .populate("cart.product")
    .populate("roleRef");
  sendResponse(res, 200, { user }, "User fetched successfully");
});

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  logout,
  logoutAllDevices,
  getSessions,
  revokeSessionById,
  getLoginHistory,
  refreshAccessToken,

  mobileRegister,
  mobileLoginRequestOtp,
  mobileVerifyOtp,
  resendMobileOtp,

  forgotPassword,
  resetPassword,

  forgotPasswordMobile,
  verifyResetOtp,
  resetPasswordMobile,

  changePassword,
  getMe,
};
