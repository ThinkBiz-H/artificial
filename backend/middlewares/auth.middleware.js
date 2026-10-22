const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/generateTokens');
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');

/**
 * Protects routes - requires a valid access token
 * Token can come from Authorization header (Bearer) or cookie.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no access token provided');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    throw new ApiError(401, 'Not authorized, token failed or expired');
  }

  // Tokens carry their session id; a logged-out / revoked session must stop
  // working immediately rather than when the access token expires.
  const [user, sessionActive] = await Promise.all([
    User.findById(decoded.id),
    decoded.sid && mongoose.isValidObjectId(decoded.sid)
      ? Session.exists({ _id: decoded.sid, revokedAt: null })
      : true,
  ]);
  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists');
  }
  if (!sessionActive) {
    throw new ApiError(401, 'Session has been revoked or expired. Please login again.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  req.user = user;
  req.sessionId = decoded.sid || null;
  next();
});

/**
 * Restrict access to specific roles.
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource`);
    }
    next();
  };
};

/**
 * For endpoints that serve both guests and logged-in users (e.g. the
 * checkout quote): a request carrying a Bearer token is authenticated exactly
 * like protect() — an expired token is a 401 so the client refreshes — and a
 * request without one continues as a guest (req.user unset).
 */
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) return protect(req, res, next);
  return next();
};

module.exports = { protect, authorize, optionalAuth };
