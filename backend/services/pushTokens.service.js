const User = require('../models/User');
const logger = require('../utils/logger');

/** Removes device tokens FCM reported as permanently invalid (app uninstalled, token revoked). */
const pruneDeadTokens = async (tokens) => {
  const dead = [...new Set((tokens || []).filter(Boolean))];
  if (dead.length === 0) return 0;
  try {
    const result = await User.updateMany({ pushTokens: { $in: dead } }, { $pull: { pushTokens: { $in: dead } } });
    return result.modifiedCount || 0;
  } catch (err) {
    logger.error(`Failed to prune ${dead.length} dead push token(s): ${err.message}`);
    return 0;
  }
};

module.exports = { pruneDeadTokens };
