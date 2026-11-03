require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { startScheduler, stopScheduler } = require("./services/scheduler.service");
const { ensureDefaultSuperAdmin } = require("./services/bootstrap.service");
const { initSocket, closeSocket } = require("./services/socket.service");
const { startLiveSync, stopLiveSync } = require("./services/liveSync.service");
const { corsConfigWarning } = require("./config/cors");
const { selfHeal: healWarehouses } = require("./services/warehouse.service");
const Warehouse = require("./models/Warehouse");
const { applyServerBranding } = require("./services/brand.service");
const { getSettings } = require("./services/settings.service");

/** Startup self-heal: default warehouse, stock records and totals. Never blocks startup. */
const verifyWarehouses = async () => {
  try {
    await healWarehouses();
    // Built after the repair — it cannot be created while duplicate defaults exist.
    await Warehouse.createIndexes();
  } catch (err) {
    console.error(`⚠️  Warehouse self-heal failed: ${err.message}`);
  }
};

const PORT = process.env.PORT || 5000;

let server;

/** Logs production settings that are unsafe or stop the app scaling past one instance. */
const warnOnUnsafeProductionConfig = () => {
  if (process.env.NODE_ENV !== "production") return;
  const secrets = [process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET];
  if (secrets.some((s) => !s || s.length < 32)) {
    console.warn("⚠️  JWT secret is shorter than 32 characters — use 64 random bytes (openssl rand -hex 64).");
  }
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.warn("⚠️  JWT_ACCESS_SECRET / JWT_REFRESH_SECRET are not both set — access and refresh tokens share one secret.");
  }
  const corsWarning = corsConfigWarning();
  if (corsWarning) console.warn(`⚠️  ${corsWarning}`);
  if (!process.env.REDIS_URL) {
    console.warn("⚠️  REDIS_URL is not set — response cache is disabled and rate limits are per-instance.");
  }
};

const startServer = async () => {
  try {
    console.clear();

    console.log("\n==========================================");
    console.log("🚀 E-COMMERCE BACKEND");
    console.log("==========================================");
    console.log(`🌍 Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`🔌 Connecting MongoDB...`);

    await connectDB();
    await ensureDefaultSuperAdmin();
    await verifyWarehouses();
    // Reading time for journal posts saved before it existed (no-op afterwards).
    await require("./controllers/blog.controller").backfillReadingTimes().catch(() => {});
    // Emails and invoices use the admin's Brand Management settings.
    await applyServerBranding(await getSettings({ bypassCache: true })).catch(() => {});

    server = app.listen(PORT, () => {
      console.log("✅ MongoDB Connected");
      console.log(`🚀 Server Running : http://localhost:${PORT}`);
      console.log(`❤️  Health Check  : http://localhost:${PORT}/health`);
      console.log(`📦 API Base URL  : http://localhost:${PORT}/api/v1`);
      console.log("==========================================\n");
      warnOnUnsafeProductionConfig();
      // Background jobs run in-process. With several API instances, set
      // ENABLE_SCHEDULER=false on all but one (or run one dedicated worker).
      if (process.env.ENABLE_SCHEDULER !== "false") startScheduler();
    });
    // Realtime: Socket.IO shares the HTTP server; live sync feeds it (and
    // invalidates the Redis cache) from MongoDB change events.
    initSocket(server);
    startLiveSync();
  } catch (err) {
    console.error("❌ Startup Failed");
    console.error(err.message);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server?.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("\n🛑 Server Stopped");
  stopScheduler();
  stopLiveSync().finally(() => {
    closeSocket();
    server?.close(() => process.exit(0));
  });
});
