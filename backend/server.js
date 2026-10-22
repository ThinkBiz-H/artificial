require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { startScheduler, stopScheduler } = require("./services/scheduler.service");

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
  server?.close(() => process.exit(0));
});
