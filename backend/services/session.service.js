const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');

const REFRESH_TOKEN_TTL_DAYS = Number(process.env.COOKIE_EXPIRE_DAYS) || 30;
// How long the just-replaced refresh token stays usable after a rotation.
const ROTATION_GRACE_MS = 30 * 1000;

/** Best-effort, dependency-free device label from a User-Agent string. */
const parseDeviceLabel = (userAgent = '') => {
  if (!userAgent) return 'Unknown device';
  const browser = /edg/i.test(userAgent)
    ? 'Edge'
    : /chrome/i.test(userAgent)
      ? 'Chrome'
      : /safari/i.test(userAgent)
        ? 'Safari'
        : /firefox/i.test(userAgent)
          ? 'Firefox'
          : 'Browser';
  const os = /windows/i.test(userAgent)
    ? 'Windows'
    : /mac os/i.test(userAgent)
      ? 'macOS'
      : /android/i.test(userAgent)
        ? 'Android'
        : /iphone|ipad/i.test(userAgent)
          ? 'iOS'
          : /linux/i.test(userAgent)
            ? 'Linux'
            : '';
  return os ? `${browser} on ${os}` : browser;
};

/** Creates a new session for a fresh login and returns its id + the raw refresh token to embed in the JWT. */
const createSession = async ({ id = null, userId, refreshToken, userAgent = '', ip = '' }) => {
  const session = await Session.create({
    ...(id ? { _id: id } : {}),
    user: userId,
    refreshTokenHash: Session.hashToken(refreshToken),
    userAgent,
    ip,
    deviceLabel: parseDeviceLabel(userAgent),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  });
  return session;
};

/**
 * Validates an incoming refresh token against a specific session id,
 * touching lastUsedAt on success. Returns { session, isGrace } — isGrace is
 * true when the token is the one rotated away from moments ago (a request
 * that raced the rotation); the caller then must NOT rotate again.
 */
const validateSession = async (sessionId, refreshToken) => {
  const session = await Session.findOne({ _id: sessionId, revokedAt: null }).select('+refreshTokenHash +previousRefreshTokenHash');
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;

  const hash = Session.hashToken(refreshToken);
  let isGrace = false;
  if (session.refreshTokenHash !== hash) {
    const withinGrace =
      session.previousRefreshTokenHash === hash && session.rotatedAt && Date.now() - session.rotatedAt.getTime() < ROTATION_GRACE_MS;
    if (!withinGrace) return null;
    isGrace = true;
  }

  session.lastUsedAt = new Date();
  await session.save();
  return { session, isGrace };
};

/** Rotates the refresh token for an existing session (same session id, new token+hash+expiry). */
const rotateSession = async (session, newRefreshToken) => {
  session.previousRefreshTokenHash = session.refreshTokenHash;
  session.rotatedAt = new Date();
  session.refreshTokenHash = Session.hashToken(newRefreshToken);
  session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  session.lastUsedAt = new Date();
  await session.save();
};

const revokeSession = (sessionId, userId) => Session.updateOne({ _id: sessionId, user: userId }, { revokedAt: new Date() });

const revokeAllSessions = (userId, exceptSessionId = null) => {
  const filter = { user: userId, revokedAt: null };
  if (exceptSessionId) filter._id = { $ne: exceptSessionId };
  return Session.updateMany(filter, { revokedAt: new Date() });
};

const listActiveSessions = (userId) =>
  Session.find({ user: userId, revokedAt: null, expiresAt: { $gt: new Date() } })
    .select('-refreshTokenHash')
    .sort('-lastUsedAt');

const recordLogin = ({ userId = null, method, success, reason = '', ip = '', userAgent = '' }) =>
  LoginHistory.create({ user: userId, method, success, reason, ip, userAgent }).catch(() => null); // best-effort, never blocks auth flow

const getLoginHistory = (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  return LoginHistory.find({ user: userId }).sort('-createdAt').skip(skip).limit(Number(limit));
};

module.exports = {
  createSession,
  validateSession,
  rotateSession,
  revokeSession,
  revokeAllSessions,
  listActiveSessions,
  recordLogin,
  getLoginHistory,
};
