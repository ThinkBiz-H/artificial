const rateLimit = require("express-rate-limit");
const { getClient } = require("../services/cache.service");

// Lua: INCR the hit counter and start its window on the first hit — atomic,
// so every API instance shares one count per client.
const INCREMENT_SCRIPT = `
local hits = redis.call('INCR', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if ttl <= 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { hits, ttl }
`;

/**
 * express-rate-limit store backed by the app's Redis connection, so limits
 * hold across multiple API instances. Only used when REDIS_URL is set;
 * otherwise the limiters keep their default per-process memory store.
 */
class RedisRateLimitStore {
  constructor(prefix) {
    this.prefix = `rl:${prefix}:`;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  async increment(key) {
    const [totalHits, ttl] = await getClient().eval(INCREMENT_SCRIPT, 1, this.prefix + key, this.windowMs);
    return { totalHits: Number(totalHits), resetTime: new Date(Date.now() + Number(ttl)) };
  }

  async decrement(key) {
    await getClient().decr(this.prefix + key);
  }

  async resetKey(key) {
    await getClient().del(this.prefix + key);
  }
}

// If Redis is unavailable mid-request, let the request through rather than
// failing it (passOnStoreError) — same "never break the request" rule as the cache.
const sharedStore = (prefix) =>
  process.env.REDIS_URL ? { store: new RedisRateLimitStore(prefix), passOnStoreError: true } : {};

const globalLimiter =
  process.env.NODE_ENV === "development"
    ? (req, res, next) => next()
    : rateLimit({
        ...sharedStore("global"),
        windowMs: 15 * 60 * 1000,
        // Per IP. Mobile carriers put many shoppers behind one IP (CGNAT) and
        // one storefront session makes dozens of API calls, so this is kept
        // generous; the auth/OTP limiters below stay strict.
        max: 1000,
        standardHeaders: true,
        legacyHeaders: false,
      });

const authLimiter =
  process.env.NODE_ENV === "development"
    ? (req, res, next) => next()
    : rateLimit({
        ...sharedStore("auth"),
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
      });

// Phase 7 — stricter IP-based backstop for OTP request/resend endpoints,
// on top of (not instead of) the per-account DB-tracked cooldown in
// services/otp.service.js. This limits OTP-bombing a single IP across many
// different mobile numbers, which the per-account cooldown alone can't.
const otpLimiter =
  process.env.NODE_ENV === "development"
    ? (req, res, next) => next()
    : rateLimit({
        ...sharedStore("otp"),
        windowMs: 15 * 60 * 1000,
        max: 8,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message: "Too many OTP requests from this device. Try again later.", data: null },
      });

// Checkout autofill lookup returns name + address for a mobile/email match,
// so it's rate-limited fairly tightly per IP to make scraping/enumerating
// customer PII impractical, on top of the exact-match-only, limit(1) query
// the controller runs (see checkout.controller.js#lookupCustomer).
const lookupLimiter =
  process.env.NODE_ENV === "development"
    ? (req, res, next) => next()
    : rateLimit({
        ...sharedStore("lookup"),
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message: "Too many lookups. Please try again later.", data: null },
      });

// Public contact form — limits spam/abuse per IP without blocking a
// genuine visitor who submits more than once.
const contactLimiter =
  process.env.NODE_ENV === "development"
    ? (req, res, next) => next()
    : rateLimit({
        ...sharedStore("contact"),
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message: "Too many messages sent. Please try again later.", data: null },
      });

module.exports = { globalLimiter, authLimiter, otpLimiter, lookupLimiter, contactLimiter };
