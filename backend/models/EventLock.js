const mongoose = require('mongoose');

/**
 * Exactly-once guard for work triggered by change-stream events. Every API
 * instance sees every change; the first to insert the event's key does the
 * work, the others hit the unique _id and skip. Entries expire after a day.
 */
const eventLockSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 24 * 60 * 60 },
  },
  { versionKey: false },
);

eventLockSchema.statics.acquire = async function acquire(key) {
  try {
    await this.create({ _id: key });
    return true;
  } catch (err) {
    if (err.code === 11000) return false;
    throw err;
  }
};

module.exports = mongoose.model('EventLock', eventLockSchema);
