const Role = require("../models/Role");
const User = require("../models/User");
const logger = require("../utils/logger");
const { seedDefaultRoles } = require("./role.service");

/**
 * Ensures the default Super Admin account exists (runs on every startup,
 * idempotent). In this codebase "super admin" is an `admin` user whose
 * `roleRef` is the system Super Admin role (Role.isSuperAdmin) — that role
 * bypasses every permission check, and keeps role === "admin" so every
 * existing authorize("admin") guard and client role check keeps working.
 *
 * Credentials come from SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD. An existing
 * account with that email is never modified (no password reset, no role
 * change). The password is hashed with bcrypt by the User model's pre-save hook.
 */
const DEFAULT_EMAIL = "abjjewellers5192@gmail.com";
const DEFAULT_PASSWORD = "123456";

const ensureDefaultSuperAdmin = async () => {
  const email = (process.env.SUPERADMIN_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || DEFAULT_PASSWORD;

  try {
    const existing = await User.exists({ email });
    if (!existing) {
      await seedDefaultRoles();
      const superRole = await Role.findOne({ slug: "super-admin" }).select("_id").lean();
      await User.create({
        name: process.env.SUPERADMIN_NAME || "Super Admin",
        email,
        password,
        role: "admin",
        roleRef: superRole?._id || null,
        permissions: [], // unrestricted on the legacy permission check too
        isVerified: true,
        isActive: true,
      });
      logger.info(`Default Super Admin created: ${email}`);
      if (password === DEFAULT_PASSWORD) {
        logger.warn("Default Super Admin is using the default password — change it after first login.");
      }
    }
    logger.info("Default Super Admin Ready");
  } catch (err) {
    // Never block startup on this.
    logger.error(`Default Super Admin setup failed: ${err.message}`);
  }
};

module.exports = { ensureDefaultSuperAdmin };
