/**
 * One origin policy for the REST API and Socket.IO.
 *
 * Allowed browser origins: CORS_ORIGIN (comma-separated), CLIENT_URL and
 * admin_url / ADMIN_URL. Outside production any http://localhost:<port> or
 * http://127.0.0.1:<port> is also allowed (Vite on 5173/5174, Flutter web on a
 * random port). Requests without an Origin header (mobile apps, curl,
 * server-to-server webhooks) are not subject to CORS and pass.
 *
 * "*" is never honoured: these responses carry cookies (credentials: true),
 * and echoing back every origin would let any website call the API — e.g. the
 * cookie-based /auth/refresh-token — as the signed-in user.
 */
const isProduction = () => process.env.NODE_ENV === "production";

const parseList = (value) =>
  String(value || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter((origin) => origin && origin !== "*");

const configuredOrigins = () =>
  new Set([
    ...parseList(process.env.CORS_ORIGIN),
    ...parseList(process.env.CLIENT_URL),
    ...parseList(process.env.admin_url),
    ...parseList(process.env.ADMIN_URL),
  ]);

const LOCAL_DEV_ORIGIN =
  /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.1\.5)(:\d+)?$/;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalized = origin.replace(/\/+$/, "");
  if (configuredOrigins().has(normalized)) return true;
  return !isProduction() && LOCAL_DEV_ORIGIN.test(normalized);
};

/** `origin` callback shape shared by the cors package and Socket.IO. */
const checkOrigin = (origin, callback) =>
  callback(null, isAllowedOrigin(origin));

const corsOptions = {
  origin: checkOrigin,
  credentials: true, // refresh-token cookie (swk_rt / swk_admin_rt)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Client-App",
    "X-Client-Platform",
    "x-client-app",
    "x-client-platform",
    "X-Request-Id",
  ],
  exposedHeaders: ["X-Request-Id", "X-Cache"],
  maxAge: 600, // cache preflights for 10 minutes
};

/** Startup hint when production has no origins configured or uses "*". */
const corsConfigWarning = () => {
  if (!isProduction()) return null;
  if (String(process.env.CORS_ORIGIN || "").includes("*")) {
    return 'CORS_ORIGIN contains "*", which is ignored (credentialed API). List the storefront and admin URLs instead.';
  }
  if (configuredOrigins().size === 0) {
    return "No CORS origins configured — set CORS_ORIGIN (or CLIENT_URL / admin_url) so the website and admin panel can reach the API.";
  }
  return null;
};

module.exports = {
  corsOptions,
  checkOrigin,
  isAllowedOrigin,
  corsConfigWarning,
};
