const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const sessionService = require("../services/session.service");

// .env.example documents separate access/refresh secrets, but this file
// previously only ever read JWT_SECRET for both — fixed here to actually
// use the split secrets when configured (limits blast radius if one leaks),
// while falling back to the shared JWT_SECRET so any existing deployment
// that only has that one set keeps working unchanged.
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

// `typ` stops one kind of token being accepted as the other when both share
// a secret. Tokens issued before it existed carry no `typ` and are still
// accepted until they expire.
const generateAccessToken = (payload) => {
  return jwt.sign({ ...payload, typ: "access" }, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign({ ...payload, typ: "refresh" }, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, ACCESS_SECRET);
  if (decoded.typ === "refresh") throw new jwt.JsonWebTokenError("refresh token used as access token");
  return decoded;
};

const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, REFRESH_SECRET);
  if (decoded.typ === "access") throw new jwt.JsonWebTokenError("access token used as refresh token");
  return decoded;
};

/*
 * Refresh-token cookie naming.
 *
 * Every app served from the same host shares one cookie jar (on localhost
 * that is *every* local project, on any port). With one generic
 * "refreshToken" name, another app's cookie — or the admin panel's — shadows
 * this storefront's: the browser sends both, cookie-parser reads the first,
 * and a valid session fails with "Invalid or expired refresh token".
 *
 * So each first-party web client gets its own cookie, chosen by the
 * X-Client-App header it sends. Clients that don't send it (the Flutter app,
 * older builds) keep the legacy name, unchanged.
 */
const LEGACY_REFRESH_COOKIE = "refreshToken";
const CLIENT_REFRESH_COOKIES = {
  storefront: "swk_rt",
  admin: "swk_admin_rt",
};

/** "storefront" | "admin" | null (unknown / legacy client). */
const clientAppOf = (req) => {
  const app = String(req?.headers?.["x-client-app"] || "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(CLIENT_REFRESH_COOKIES, app) ? app : null;
};

/** The refresh cookie this request's client owns. */
const refreshCookieName = (req) => CLIENT_REFRESH_COOKIES[clientAppOf(req)] || LEGACY_REFRESH_COOKIE;

const setRefreshCookie = (req, res, token) => res.cookie(refreshCookieName(req), token, cookieOptionsFor());

/**
 * Clears this client's refresh cookie. `includeLegacy` also clears the old
 * shared cookie — only do that once it is known to be ours (a verified
 * session, or an explicit logout), never on an unverified token, since on
 * localhost it may belong to another app.
 */
const clearCookieOptions = () => {
  const options = cookieOptionsFor();
  delete options.maxAge;
  return options;
};

const clearRefreshCookie = (req, res, { includeLegacy = false } = {}) => {
  res.clearCookie(refreshCookieName(req), clearCookieOptions());
  if (includeLegacy && refreshCookieName(req) !== LEGACY_REFRESH_COOKIE) clearLegacyRefreshCookie(res);
};

/** Retires the old shared cookie (call only once it is known to be ours). */
const clearLegacyRefreshCookie = (res) => res.clearCookie(LEGACY_REFRESH_COOKIE, clearCookieOptions());

const cookieOptionsFor = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: (Number(process.env.COOKIE_EXPIRE_DAYS) || 30) * 24 * 60 * 60 * 1000,
});

/**
 * Generates access + refresh tokens for a user and creates a Session
 * document to back them (Phase 7 — replaces the old single
 * `user.refreshToken` field, which only supported one active login at a
 * time). The JWT payload embeds the session id (`sid`) so refresh/logout
 * can identify exactly which device session a token belongs to.
 *
 * `deviceInfo` is optional so every existing call site keeps working
 * unchanged — omitting it just means the session is recorded with an
 * empty userAgent/ip.
 */
const issueTokens = async (user, res, deviceInfo = {}) => {
  const sessionId = new mongoose.Types.ObjectId();
  const payload = { id: user._id, role: user.role, sid: sessionId.toString() };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await sessionService.createSession({
    id: sessionId,
    userId: user._id,
    refreshToken,
    userAgent: deviceInfo.userAgent || "",
    ip: deviceInfo.ip || "",
  });

  // `res.req` is the request Express attached to this response — it tells
  // us which client is logging in, so every caller keeps its signature.
  setRefreshCookie(res.req, res, refreshToken);

  return { accessToken, refreshToken, sessionId: sessionId.toString() };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  issueTokens,
  cookieOptionsFor,
  LEGACY_REFRESH_COOKIE,
  refreshCookieName,
  setRefreshCookie,
  clearRefreshCookie,
  clearLegacyRefreshCookie,
};
