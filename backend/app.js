const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const mongoose = require("mongoose");
const { version: appVersion } = require("./package.json");

const routes = require("./routes/index");
const { errorMiddleware, notFound } = require("./middlewares/error.middleware");
const { globalLimiter } = require("./middlewares/rateLimiter.middleware");
const { metricsMiddleware, getMetrics } = require("./utils/metrics");
const { getClient: getRedisClient } = require("./services/cache.service");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const requestId = require("./middlewares/requestId.middleware");
const logger = require("./utils/logger");
const shippingRoutes = require("./routes/shipping.routes");
const app = express();
// Trust only the configured number of proxy hops (default 1), so clients
// can't pick their own req.ip via X-Forwarded-For and dodge the IP limiters.
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 1));
app.use(requestId);

// ==================== SECURITY MIDDLEWARE ====================
app.use(
  helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true }, // 1 year — force HTTPS on repeat visits
    noSniff: true,
    frameguard: { action: "deny" }, // this API is never meant to be iframed
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // this is an API consumed by separate frontend/admin origins
  }),
);
app.disable("x-powered-by");
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin:
      corsOrigin === "*" ? true : corsOrigin.split(",").map((o) => o.trim()),
    credentials: false, // testing
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());
app.use(xss()); // Sanitize user input to prevent XSS
app.use(hpp()); // Prevent HTTP parameter pollution
app.use(globalLimiter);
app.use(metricsMiddleware);

// ==================== BODY PARSERS ====================
// `verify` captures the raw request body onto req.rawBody, needed to verify
// webhook HMAC signatures (e.g. Razorpay) — only on the webhook routes, so
// other requests don't hold a second copy of their body.
// Anonymous requests get a 1mb body cap; authenticated ones (admin content
// editors) keep the original 10mb.
const bodyLimitFor = (req) =>
  req.headers.authorization || req.originalUrl.startsWith("/api/v1/webhooks")
    ? "10mb"
    : "1mb";
const jsonParsers = Object.fromEntries(
  ["1mb", "10mb"].map((limit) => [
    limit,
    express.json({
      limit,
      verify: (req, res, buf) => {
        if (req.originalUrl.startsWith("/api/v1/webhooks")) req.rawBody = buf;
      },
    }),
  ]),
);
const urlencodedParsers = Object.fromEntries(
  ["1mb", "10mb"].map((limit) => [
    limit,
    express.urlencoded({ extended: true, limit }),
  ]),
);
app.use((req, res, next) => jsonParsers[bodyLimitFor(req)](req, res, next));
app.use((req, res, next) =>
  urlencodedParsers[bodyLimitFor(req)](req, res, next),
);
// Runs after the body parsers so request bodies are sanitized too, not just
// query/params.
app.use(mongoSanitize()); // Prevent MongoDB operator injection
app.use(cookieParser());
app.use(compression());

// ==================== STATIC FILES ====================
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/shipping", shippingRoutes);
// ==================== LOGGING ====================
if (process.env.NODE_ENV !== "test") {
  const morganFormat =
    process.env.NODE_ENV === "production" ? "combined" : "dev";
  app.use(
    morgan(morganFormat, {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

// ==================== HEALTH CHECK ====================
// Kept response-shape-compatible: existing fields (success, message, data.uptime,
// data.timestamp) are unchanged, only new fields are added.
app.get("/health", (req, res) => {
  const dbStateNames = [
    "disconnected",
    "connected",
    "connecting",
    "disconnecting",
  ];

  const redisClient = getRedisClient();
  const redisStatus = !process.env.REDIS_URL
    ? "not_configured"
    : redisClient?.status === "ready"
      ? "connected"
      : "disconnected";

  res.status(200).json({
    success: true,
    message: "Server is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: appVersion,
      database: {
        status: dbStateNames[mongoose.connection.readyState] || "unknown",
      },
      cache: { status: redisStatus },
      memory: {
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    },
    error: null,
  });
});

// Performance metrics (Phase 19) — request counts, response times, error
// rate, slowest routes. In-memory since process start; resets on restart.
app.get("/metrics", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Metrics fetched successfully",
    data: getMetrics(),
    error: null,
  });
});

// Readiness probe (for orchestrators like Kubernetes): only reports ready
// once MongoDB is actually connected, distinct from the liveness /health check.
app.get("/ready", (req, res) => {
  const isReady = mongoose.connection.readyState === 1;

  res.status(isReady ? 200 : 503).json({
    success: isReady,
    message: isReady
      ? "Server is ready"
      : "Server is not ready — database not connected",
    data: { ready: isReady },
    error: null,
  });
});

// ==================== SEO (Phase 13) ====================
// Mounted at the true root — not under /api/v1 — since search engines
// expect these two files at the domain root, not buried under an API prefix.
const { getSitemap, getRobotsTxt } = require("./controllers/seo.controller");
app.get("/sitemap.xml", getSitemap);
app.get("/robots.txt", getRobotsTxt);

// ==================== API ROUTES ====================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { customSiteTitle: "E-Commerce API Docs" }),
);
app.use("/api/v1", routes);

// ==================== 404 + ERROR HANDLING ====================
app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
