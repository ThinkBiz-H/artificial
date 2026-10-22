const ApiError = require("../utils/ApiError");
const settingsService = require("../services/settings.service");

/**
 * Admin > Settings > Feature flags (Settings.featureFlags). A flag that has
 * never been set counts as ON, so existing stores behave exactly as before
 * until an admin switches something off.
 */
const isFeatureEnabled = async (flag) => {
  const settings = await settingsService.getSettings();
  return settings.featureFlags?.get(flag) !== false;
};

/** Rejects the request with 403 while [flag] is switched off. */
const requireFeature = (flag, message) => async (req, res, next) => {
  try {
    if (await isFeatureEnabled(flag)) return next();
    return next(new ApiError(403, message || "This feature is currently unavailable."));
  } catch (err) {
    return next(err);
  }
};

module.exports = { isFeatureEnabled, requireFeature };
