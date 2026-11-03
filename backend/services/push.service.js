const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Firebase Cloud Messaging (firebase-admin).
 *
 * Credentials (first one found wins):
 *   FIREBASE_SERVICE_ACCOUNT       service-account JSON, raw or base64-encoded
 *   FIREBASE_SERVICE_ACCOUNT_PATH  path to the service-account .json file
 *   GOOGLE_APPLICATION_CREDENTIALS standard Google path variable
 *
 * Without credentials nothing is sent: calls are logged (same "loud, never
 * silent" fallback as before), so the app keeps working in development.
 * PUSH_PROVIDER=none disables push explicitly.
 */
const ANDROID_CHANNEL_ID = process.env.PUSH_ANDROID_CHANNEL_ID || 'swastikala_updates'; // matches the app's channel
const BRAND_COLOR = '#5A1E36';
const MULTICAST_LIMIT = 500; // FCM maximum tokens per multicast


/**
 * invalid-argument is also returned for a malformed *message* (e.g. a bad
 * image URL) — only treat it as a dead token when FCM says the token is the
 * problem, so a payload bug can never wipe every device.
 */
const isDeadToken = (error) =>
  !!error &&
  (error.code === 'messaging/registration-token-not-registered' ||
    error.code === 'messaging/invalid-registration-token' ||
    (error.code === 'messaging/invalid-argument' && /registration token/i.test(error.message || '')));

let messaging = null;
let initAttempted = false;

const loadServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(text);
  }
  const configured = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!configured) return null;
  // Relative paths are relative to the backend folder, whatever the working directory.
  const file = path.isAbsolute(configured) ? configured : path.resolve(__dirname, '..', configured);
  if (!fs.existsSync(file)) {
    logger.error(`Firebase service account file not found: ${file}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

/** The firebase-admin Messaging instance, or null when push isn't configured. */
const getMessaging = () => {
  if (initAttempted) return messaging;
  initAttempted = true;
  if (process.env.PUSH_PROVIDER === 'none') return null;
  try {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
      logger.warn('Firebase push not configured (set FIREBASE_SERVICE_ACCOUNT) — push notifications will only be logged.');
      return null;
    }
    // eslint-disable-next-line global-require
    // Modular firebase-admin API (v12+). A named app, reused if it already
    // exists (hot reload, tests), so it is never initialised twice.
    const { initializeApp, getApps, cert } = require('firebase-admin/app');
    // eslint-disable-next-line global-require
    const { getMessaging: messagingFor } = require('firebase-admin/messaging');
    const app = getApps().find((a) => a.name === 'push') || initializeApp({ credential: cert(serviceAccount) }, 'push');
    messaging = messagingFor(app);
    logger.info(`Firebase push ready (project ${serviceAccount.project_id})`);
  } catch (err) {
    logger.error(`Firebase push initialisation failed: ${err.message}`);
    messaging = null;
  }
  return messaging;
};

const isPushConfigured = () => !!getMessaging();

/** FCM data values must be strings; drops null/undefined. */
const stringifyData = (data = {}) =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]),
  );

/** One FCM message body shared by token and topic sends. */
const buildMessage = ({ title, body, imageUrl, data, badge }) => {
  const image = imageUrl || undefined;
  // Unread count for the app icon badge (iOS) / notification count (Android).
  const count = Number.isInteger(badge) && badge >= 0 ? badge : undefined;
  return {
    notification: { title, body, ...(image ? { imageUrl: image } : {}) },
    data: stringifyData(data),
    android: {
      priority: 'high',
      notification: {
        channelId: ANDROID_CHANNEL_ID,
        color: BRAND_COLOR,
        sound: 'default',
        ...(image ? { imageUrl: image } : {}),
        ...(count !== undefined ? { notificationCount: count } : {}),
      },
    },
    apns: {
      headers: { 'apns-priority': '10' },
      payload: { aps: { sound: 'default', 'mutable-content': 1, ...(count !== undefined ? { badge: count } : {}) } },
      ...(image ? { fcmOptions: { imageUrl: image } } : {}),
    },
  };
};

/**
 * Sends to device tokens in batches of 500.
 * @returns {{ provider, successCount, failureCount, invalidTokens: string[] }}
 */
const sendToTokens = async ({ tokens, title, body, imageUrl = '', data = {}, badge }) => {
  const unique = [...new Set((tokens || []).filter(Boolean))];
  if (unique.length === 0) return { provider: 'none', successCount: 0, failureCount: 0, invalidTokens: [] };

  const fcm = getMessaging();
  if (!fcm) {
    logger.warn(`[Push not configured] Would send to ${unique.length} device(s): "${title}" — ${body}`);
    return { provider: 'console-fallback', successCount: unique.length, failureCount: 0, invalidTokens: [] };
  }

  const message = buildMessage({ title, body, imageUrl, data, badge });
  let successCount = 0;
  let failureCount = 0;
  const invalidTokens = [];
  for (let i = 0; i < unique.length; i += MULTICAST_LIMIT) {
    const batch = unique.slice(i, i + MULTICAST_LIMIT);
    // eslint-disable-next-line no-await-in-loop
    const result = await fcm.sendEachForMulticast({ ...message, tokens: batch });
    successCount += result.successCount;
    failureCount += result.failureCount;
    result.responses.forEach((r, idx) => {
      if (!r.success && isDeadToken(r.error)) invalidTokens.push(batch[idx]);
    });
  }
  return { provider: 'firebase', successCount, failureCount, invalidTokens };
};

/** Sends to an FCM topic (devices subscribe in the app). */
const sendToTopic = async ({ topic, title, body, imageUrl = '', data = {} }) => {
  const fcm = getMessaging();
  if (!fcm) {
    logger.warn(`[Push not configured] Would send to topic "${topic}": "${title}" — ${body}`);
    return { provider: 'console-fallback', messageId: null };
  }
  const messageId = await fcm.send({ ...buildMessage({ title, body, imageUrl, data }), topic });
  return { provider: 'firebase', messageId };
};

/**
 * Backward-compatible single entry point (used by the notification queue).
 * Throws when every token failed for a reason other than a dead token, so
 * the queue's retry/backoff kicks in for transient errors.
 */
const sendPush = async ({ tokens, title, body, data = {}, imageUrl = '', badge }) => {
  if (!tokens || tokens.length === 0) return { success: false, reason: 'no_device_tokens' };
  const result = await sendToTokens({ tokens, title, body, data, imageUrl, badge });
  const retryable = result.failureCount - result.invalidTokens.length;
  if (result.successCount === 0 && retryable > 0) throw new Error('FCM rejected the message for every device');
  return { success: true, ...result };
};

module.exports = { sendPush, sendToTokens, sendToTopic, isPushConfigured, getMessaging, stringifyData };
