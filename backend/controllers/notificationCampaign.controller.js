const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const logger = require('../utils/logger');
const NotificationCampaign = require('../models/NotificationCampaign');
const User = require('../models/User');
const { sendCampaign, estimateAudience, recordOpen, TOPICS, TOPIC_PATTERN } = require('../services/notificationCampaign.service');
const { sendToTokens, isPushConfigured } = require('../services/push.service');
const { pruneDeadTokens } = require('../services/pushTokens.service');
const { retryFailedJobs } = require('../services/notificationQueue.service');

const EDITABLE = ['draft', 'scheduled'];
const { CATEGORIES } = NotificationCampaign;

const isHttpsUrl = (value) => /^https:\/\/\S+$/i.test(value);
const isLink = (value) => value.startsWith('/') || /^https?:\/\/\S+$/i.test(value);

/** Validates and normalises the composer payload. `partial` for edits. */
const parseCampaign = (body, { partial = false } = {}) => {
  const out = {};
  const str = (v) => (typeof v === 'string' ? v.trim() : '');

  if (!partial || body.title !== undefined) {
    out.title = str(body.title);
    if (!out.title) throw new ApiError(400, 'Title is required');
    if (out.title.length > 120) throw new ApiError(400, 'Title must be at most 120 characters');
  }
  if (!partial || body.body !== undefined) {
    out.body = str(body.body ?? body.message);
    if (!out.body) throw new ApiError(400, 'Message is required');
    if (out.body.length > 500) throw new ApiError(400, 'Message must be at most 500 characters');
  }
  if (body.imageUrl !== undefined) {
    out.imageUrl = str(body.imageUrl);
    if (out.imageUrl && !isHttpsUrl(out.imageUrl)) throw new ApiError(400, 'Image must be an https:// URL');
  }
  if (body.link !== undefined) {
    out.link = str(body.link);
    if (out.link && !isLink(out.link)) throw new ApiError(400, 'Link must be a site path (e.g. /products/ring) or a URL');
  }
  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) throw new ApiError(400, `category must be one of: ${CATEGORIES.join(', ')}`);
    out.category = body.category;
  }
  if (body.saveInApp !== undefined) out.saveInApp = !!body.saveInApp;
  if (body.template !== undefined) out.template = mongoose.isValidObjectId(body.template) ? body.template : null;

  if (!partial || body.audience !== undefined) {
    const audience = body.audience || {};
    const type = audience.type || 'all';
    if (!['all', 'users', 'topic', 'admins'].includes(type)) throw new ApiError(400, 'Invalid audience');
    const userIds = (audience.userIds || []).filter((id) => mongoose.isValidObjectId(id));
    const topic = str(audience.topic);
    if (type === 'users' && userIds.length === 0) throw new ApiError(400, 'Select at least one customer');
    if (type === 'topic' && !TOPIC_PATTERN.test(topic)) throw new ApiError(400, 'Topic may only contain letters, numbers and - _ . ~ %');
    out.audience = { type, userIds: type === 'users' ? userIds : [], topic: type === 'topic' ? topic : '' };
  }

  if (body.scheduledAt !== undefined) {
    if (!body.scheduledAt) {
      out.scheduledAt = null;
    } else {
      const at = new Date(body.scheduledAt);
      if (Number.isNaN(at.getTime())) throw new ApiError(400, 'Invalid schedule time');
      if (at.getTime() < Date.now() - 60_000) throw new ApiError(400, 'Schedule time must be in the future');
      out.scheduledAt = at;
    }
  }
  return out;
};

/** Sends in the background — big audiences take a while; the admin watches status live. */
const sendInBackground = (id) => {
  setImmediate(() => {
    sendCampaign(id).catch((err) => logger.error(`Campaign ${id} send failed: ${err.message}`));
  });
};

// @route GET /api/v1/admin/notifications/campaigns
const listCampaigns = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;

  const [campaigns, total] = await Promise.all([
    NotificationCampaign.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean(),
    NotificationCampaign.countDocuments(filter),
  ]);
  sendResponse(res, 200, { campaigns, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 'Campaigns fetched successfully');
});

// @route GET /api/v1/admin/notifications/campaigns/summary
const campaignSummary = asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
  const since = new Date(Date.now() - days * 86_400_000);
  const [totals, byCategory, scheduled] = await Promise.all([
    NotificationCampaign.aggregate([
      { $match: { status: 'sent', sentAt: { $gte: since } } },
      { $group: { _id: null, campaigns: { $sum: 1 }, delivered: { $sum: '$stats.delivered' }, failed: { $sum: '$stats.failed' }, opened: { $sum: '$stats.opened' }, inApp: { $sum: '$stats.inApp' } } },
    ]),
    NotificationCampaign.aggregate([
      { $match: { status: 'sent', sentAt: { $gte: since } } },
      { $group: { _id: '$category', campaigns: { $sum: 1 }, delivered: { $sum: '$stats.delivered' }, opened: { $sum: '$stats.opened' } } },
      { $sort: { campaigns: -1 } },
    ]),
    NotificationCampaign.countDocuments({ status: 'scheduled' }),
  ]);
  const t = totals[0] || { campaigns: 0, delivered: 0, failed: 0, opened: 0, inApp: 0 };
  sendResponse(res, 200, {
    days,
    totals: { campaigns: t.campaigns, delivered: t.delivered, failed: t.failed, opened: t.opened, inApp: t.inApp, clickRate: t.delivered ? +(t.opened / t.delivered * 100).toFixed(1) : 0 },
    byCategory: byCategory.map((c) => ({ category: c._id, campaigns: c.campaigns, delivered: c.delivered, opened: c.opened })),
    scheduled,
    push: { configured: isPushConfigured() },
    topics: TOPICS,
  }, 'Campaign summary fetched successfully');
});

// @route POST /api/v1/admin/notifications/campaigns/estimate
const estimate = asyncHandler(async (req, res) => {
  const { audience } = parseCampaign({ title: 'x', body: 'x', audience: req.body.audience }, { partial: true });
  sendResponse(res, 200, await estimateAudience(audience), 'Audience estimated');
});

// @route GET /api/v1/admin/notifications/campaigns/:id
const getCampaign = asyncHandler(async (req, res) => {
  const campaign = await NotificationCampaign.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('audience.userIds', 'name email mobile')
    .lean();
  if (!campaign) throw new ApiError(404, 'Campaign not found');
  sendResponse(res, 200, { campaign }, 'Campaign fetched successfully');
});

// @route POST /api/v1/admin/notifications/campaigns
// body: composer fields + { sendNow?: boolean, scheduledAt?: date }
const createCampaign = asyncHandler(async (req, res) => {
  const values = parseCampaign(req.body);
  const sendNow = !!req.body.sendNow;
  const status = sendNow ? 'draft' : values.scheduledAt ? 'scheduled' : 'draft';
  const campaign = await NotificationCampaign.create({ ...values, status, createdBy: req.user._id });
  if (sendNow) sendInBackground(campaign._id);
  sendResponse(res, 201, { campaign }, sendNow ? 'Sending notification…' : status === 'scheduled' ? 'Notification scheduled' : 'Draft saved');
});

// @route PUT /api/v1/admin/notifications/campaigns/:id
const updateCampaign = asyncHandler(async (req, res) => {
  const values = parseCampaign(req.body, { partial: true });
  if (values.scheduledAt !== undefined) values.status = values.scheduledAt ? 'scheduled' : 'draft';
  const campaign = await NotificationCampaign.findOneAndUpdate({ _id: req.params.id, status: { $in: EDITABLE } }, { $set: values }, { new: true, runValidators: true });
  if (!campaign) throw new ApiError(409, 'Only drafts and scheduled notifications can be edited');
  sendResponse(res, 200, { campaign }, 'Notification updated');
});

// @route POST /api/v1/admin/notifications/campaigns/:id/send
const sendNowHandler = asyncHandler(async (req, res) => {
  const campaign = await NotificationCampaign.findById(req.params.id).select('status').lean();
  if (!campaign) throw new ApiError(404, 'Campaign not found');
  if (!EDITABLE.includes(campaign.status)) throw new ApiError(409, `This notification is already ${campaign.status}`);
  sendInBackground(req.params.id);
  sendResponse(res, 202, { id: req.params.id }, 'Sending notification…');
});

// @route POST /api/v1/admin/notifications/campaigns/:id/retry — send a failed campaign again
const retryCampaign = asyncHandler(async (req, res) => {
  const campaign = await NotificationCampaign.findOneAndUpdate({ _id: req.params.id, status: 'failed' }, { $set: { status: 'draft', error: '' } }, { new: true });
  if (!campaign) throw new ApiError(409, 'Only failed notifications can be retried');
  sendInBackground(campaign._id);
  sendResponse(res, 202, { id: campaign._id }, 'Retrying notification…');
});

// @route POST /api/v1/admin/notifications/jobs/retry-failed — re-queue failed automatic deliveries
const retryFailedDeliveries = asyncHandler(async (req, res) => {
  const days = Math.min(30, Math.max(1, Number(req.body?.days) || 7));
  const count = await retryFailedJobs({ days });
  sendResponse(res, 200, { count }, count ? `Retrying ${count} failed deliver${count === 1 ? 'y' : 'ies'}` : 'No failed deliveries to retry');
});

// @route POST /api/v1/admin/notifications/campaigns/:id/cancel
const cancelCampaign = asyncHandler(async (req, res) => {
  const campaign = await NotificationCampaign.findOneAndUpdate({ _id: req.params.id, status: 'scheduled' }, { $set: { status: 'cancelled' } }, { new: true });
  if (!campaign) throw new ApiError(409, 'Only scheduled notifications can be cancelled');
  sendResponse(res, 200, { campaign }, 'Scheduled notification cancelled');
});

// @route POST /api/v1/admin/notifications/campaigns/:id/duplicate
const duplicateCampaign = asyncHandler(async (req, res) => {
  const source = await NotificationCampaign.findById(req.params.id).lean();
  if (!source) throw new ApiError(404, 'Campaign not found');
  const campaign = await NotificationCampaign.create({
    title: source.title,
    body: source.body,
    imageUrl: source.imageUrl,
    link: source.link,
    category: source.category,
    audience: source.audience,
    saveInApp: source.saveInApp,
    template: source.template,
    status: 'draft',
    createdBy: req.user._id,
  });
  sendResponse(res, 201, { campaign }, 'Copied to a new draft');
});

// @route DELETE /api/v1/admin/notifications/campaigns/:id
const deleteCampaign = asyncHandler(async (req, res) => {
  const result = await NotificationCampaign.deleteOne({ _id: req.params.id, status: { $ne: 'sending' } });
  if (!result.deletedCount) throw new ApiError(409, 'Notification not found or still sending');
  sendResponse(res, 200, {}, 'Notification deleted');
});

// @route POST /api/v1/admin/notifications/test — push to the signed-in admin's own devices
const sendTest = asyncHandler(async (req, res) => {
  const values = parseCampaign({ ...req.body, audience: { type: 'all' } });
  const me = await User.findById(req.user._id).select('pushTokens').lean();
  if (!me?.pushTokens?.length) throw new ApiError(400, 'No device is registered for your account — sign in to the mobile app with this admin account first.');
  const result = await sendToTokens({ tokens: me.pushTokens, title: values.title, body: values.body, imageUrl: values.imageUrl, data: { type: 'test', link: values.link } });
  await pruneDeadTokens(result.invalidTokens);
  sendResponse(res, 200, { delivered: result.successCount, failed: result.failureCount, provider: result.provider }, result.provider === 'firebase' ? `Test sent to ${result.successCount} device(s)` : 'Firebase is not configured — the test was only logged');
});

// @route POST /api/v1/notifications/campaigns/:id/opened — public (the app reports a tap)
const reportOpened = asyncHandler(async (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) await recordOpen(req.params.id);
  sendResponse(res, 200, {}, 'Recorded');
});

module.exports = {
  listCampaigns,
  campaignSummary,
  estimate,
  getCampaign,
  createCampaign,
  updateCampaign,
  sendNowHandler,
  cancelCampaign,
  duplicateCampaign,
  deleteCampaign,
  sendTest,
  reportOpened,
  retryCampaign,
  retryFailedDeliveries,
};
