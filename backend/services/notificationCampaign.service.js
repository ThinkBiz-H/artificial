const mongoose = require('mongoose');
const NotificationCampaign = require('../models/NotificationCampaign');
const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendToTokens, sendToTopic } = require('./push.service');
const { pruneDeadTokens } = require('./pushTokens.service');

const USER_BATCH = 1000;

/** In-app Notification.type used for each campaign category. */
const IN_APP_TYPE = {
  general: 'admin_broadcast',
  promotional: 'promotion',
  flash_sale: 'flash_sale',
  coupon: 'coupon',
  price_drop: 'wishlist_price_drop',
  back_in_stock: 'back_in_stock',
  wishlist: 'wishlist_price_drop',
  order: 'system',
  payment: 'system',
};

/** FCM topics the app subscribes to (lowercase, [a-zA-Z0-9-_.~%]). */
const TOPICS = ['all', 'promotions'];
const TOPIC_PATTERN = /^[a-zA-Z0-9-_.~%]{1,900}$/;

const audienceFilter = (audience) => {
  switch (audience?.type) {
    case 'admins':
      return { role: 'admin', isActive: true };
    case 'users':
      // Cast explicitly: aggregate() (the estimate) does not cast like find().
      return { _id: { $in: (audience.userIds || []).map((id) => new mongoose.Types.ObjectId(String(id))) }, isActive: true };
    case 'all':
    default:
      return { role: 'user', isActive: true };
  }
};

/** How many users (and devices) a campaign would reach — for the composer preview. */
const estimateAudience = async (audience) => {
  if (audience?.type === 'topic') return { users: null, devices: null, topic: audience.topic };
  const filter = audienceFilter(audience);
  const [users, devices] = await Promise.all([
    User.countDocuments(filter),
    User.aggregate([{ $match: filter }, { $project: { n: { $size: { $ifNull: ['$pushTokens', []] } } } }, { $group: { _id: null, n: { $sum: '$n' } } }]),
  ]);
  return { users, devices: devices[0]?.n || 0 };
};

const pushData = (campaign) => ({
  campaignId: String(campaign._id),
  type: campaign.category,
  link: campaign.link,
});

const sendToAudience = async (campaign) => {
  const stats = { targetedUsers: 0, devices: 0, delivered: 0, failed: 0, invalidTokensRemoved: 0, inApp: 0 };
  let provider = '';
  const inAppType = IN_APP_TYPE[campaign.category] || 'admin_broadcast';

  const cursor = User.find(audienceFilter(campaign.audience)).select('_id pushTokens').lean().cursor({ batchSize: USER_BATCH });
  let batch = [];
  const flush = async () => {
    if (batch.length === 0) return;
    const users = batch;
    batch = [];
    stats.targetedUsers += users.length;

    if (campaign.saveInApp) {
      const docs = users.map((u) => ({
        user: u._id,
        type: inAppType,
        title: campaign.title,
        message: campaign.body,
        link: campaign.link || null,
        imageUrl: campaign.imageUrl || null,
        campaign: campaign._id,
      }));
      const inserted = await Notification.insertMany(docs, { ordered: false });
      stats.inApp += inserted.length;
    }

    const tokens = users.flatMap((u) => u.pushTokens || []);
    stats.devices += tokens.length;
    if (tokens.length) {
      const result = await sendToTokens({ tokens, title: campaign.title, body: campaign.body, imageUrl: campaign.imageUrl, data: pushData(campaign) });
      provider = result.provider;
      stats.delivered += result.successCount;
      stats.failed += result.failureCount;
      stats.invalidTokensRemoved += await pruneDeadTokens(result.invalidTokens);
    }
  };

  for await (const user of cursor) {
    batch.push(user);
    if (batch.length >= USER_BATCH) await flush();
  }
  await flush();
  return { stats, provider: provider || 'none' };
};

/**
 * Sends a campaign now. Claims it atomically (draft/scheduled → sending), so
 * a double click, the scheduler and several API instances can never send
 * the same campaign twice.
 */
const sendCampaign = async (campaignId) => {
  const campaign = await NotificationCampaign.findOneAndUpdate(
    { _id: campaignId, status: { $in: ['draft', 'scheduled'] } },
    { $set: { status: 'sending', error: '' } },
    { new: true },
  );
  if (!campaign) return null;

  try {
    let stats;
    let provider;
    if (campaign.audience.type === 'topic') {
      const result = await sendToTopic({ topic: campaign.audience.topic, title: campaign.title, body: campaign.body, imageUrl: campaign.imageUrl, data: pushData(campaign) });
      provider = result.provider;
      stats = { ...campaign.stats.toObject(), delivered: result.messageId || result.provider === 'console-fallback' ? 1 : 0 };
    } else {
      ({ stats, provider } = await sendToAudience(campaign));
    }
    return await NotificationCampaign.findByIdAndUpdate(
      campaign._id,
      { $set: { status: 'sent', sentAt: new Date(), provider, 'stats.targetedUsers': stats.targetedUsers || 0, 'stats.devices': stats.devices || 0, 'stats.delivered': stats.delivered || 0, 'stats.failed': stats.failed || 0, 'stats.invalidTokensRemoved': stats.invalidTokensRemoved || 0, 'stats.inApp': stats.inApp || 0 } },
      { new: true },
    );
  } catch (err) {
    logger.error(`Notification campaign ${campaign._id} failed: ${err.message}`);
    return NotificationCampaign.findByIdAndUpdate(campaign._id, { $set: { status: 'failed', error: err.message } }, { new: true });
  }
};

/** Scheduler tick: sends campaigns whose time has come. */
const processScheduledCampaigns = async () => {
  const due = await NotificationCampaign.find({ status: 'scheduled', scheduledAt: { $lte: new Date() } }).select('_id').limit(20).lean();
  let sent = 0;
  for (const { _id } of due) {
    // eslint-disable-next-line no-await-in-loop
    if (await sendCampaign(_id)) sent += 1;
  }
  return sent;
};

/** The app reports a notification tap (push or in-app). */
const recordOpen = (campaignId) => NotificationCampaign.updateOne({ _id: campaignId }, { $inc: { 'stats.opened': 1 } });

module.exports = {
  sendCampaign,
  processScheduledCampaigns,
  estimateAudience,
  recordOpen,
  TOPICS,
  TOPIC_PATTERN,
  IN_APP_TYPE,
};
