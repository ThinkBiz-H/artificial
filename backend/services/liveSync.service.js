const mongoose = require("mongoose");
const logger = require("../utils/logger");
const cache = require("./cache.service");
const { emitToAll, emitToAdmins, emitToUser } = require("./socket.service");
const wishlistAlerts = require("./wishlistAlert.service");
const settingsService = require("./settings.service");
const brandService = require("./brand.service");

// Product fields whose change can trigger wishlist price-drop / back-in-stock alerts.
const ALERT_FIELDS = ["price", "salePrice", "stock", "status", "isDeleted"];
// Alerts are sent exactly once across instances (EventLock in wishlistAlert.service).

/**
 * Live sync: one MongoDB change stream (needs a replica set — Atlas is one)
 * drives both
 *   - Redis cache invalidation, and
 *   - Socket.IO realtime events,
 * for every committed write, whichever controller/service/script made it.
 * Change events arrive after a transaction commits, so a reader can never
 * re-cache uncommitted data. Each API instance runs its own stream and emits
 * to its own sockets, so no Socket.IO Redis adapter is needed.
 *
 * Events (payloads carry ids / field names, never private documents):
 *   all      catalog:changed      { entity, ids, fields }   (products, banners, settings…)
 *   user     order:updated        { id, orderNumber, orderStatus, paymentStatus }
 *   user     notification:new     { id, type, title, message, createdAt }
 *   user     notification:changed { ids }
 *   user     cart:updated         { items, quantity }
 *   user     wishlist:updated     { count }
 *   admins   admin:order / admin:payment / admin:inventory / admin:user /
 *            admin:coupon / admin:inquiry / admin:dashboard
 */

// Collections whose writes change public data: cache prefixes to clear and
// the entity name clients use to refetch.
const CATALOG = {
  // "categories": the storefront hides categories without published products.
  Product: { entity: "product", cache: ["products", "home-sections", "categories"], ignore: ["viewCount", "updatedAt"] },
  Variant: { entity: "product", cache: ["products", "home-sections"] },
  Unit: { entity: "product", cache: ["products"] },
  Brand: { entity: "brand", cache: ["brands", "products"] },
  Category: { entity: "category", cache: ["categories", "products", "home-sections"] },
  Page: { entity: "page", cache: ["pages"] },
  // View/like counters change on every read — they don't invalidate the journal cache.
  Blog: { entity: "blog", cache: ["blogs"], ignore: ["viewCount", "likeCount", "updatedAt"] },
  BlogCategory: { entity: "blog", cache: ["blogs"] },
  Settings: { entity: "settings", cache: ["settings", "brand-settings"] },
  CategoryBanner: { entity: "banner", cache: ["category-banners"] },
  HomeSection: { entity: "home", cache: ["home-sections"] },
  Announcement: { entity: "announcement", cache: ["announcements"] },
  Faq: { entity: "faq", cache: ["faqs"] },
  WorkshopCard: { entity: "home", cache: ["workshop-cards"] },
  Coupon: { entity: "coupon", cache: [] },
};

const PRIVATE = ["Order", "PaymentTransaction", "Notification", "User", "StockMovement", "ContactInquiry", "NotificationCampaign", "Warehouse", "WarehouseStock"];

let stream = null;
let resumeToken = null;
let stopped = false;
let restartTimer = null;
const timers = new Map();
const pending = new Map();

/** Collects values under `key` and flushes them once after `wait` ms of quiet. */
const debounce = (key, value, flush, wait = 300) => {
  if (!pending.has(key)) pending.set(key, new Set());
  if (value !== undefined) pending.get(key).add(value);
  clearTimeout(timers.get(key));
  timers.set(
    key,
    setTimeout(() => {
      const values = [...(pending.get(key) || [])];
      pending.delete(key);
      timers.delete(key);
      Promise.resolve(flush(values)).catch((err) => logger.error(`Live sync flush failed (${key}): ${err.message}`));
    }, wait),
  );
};

const changedFields = (change) => {
  const u = change.updateDescription;
  if (!u) return [];
  return [...Object.keys(u.updatedFields || {}), ...(u.removedFields || [])].map((f) => f.split(".")[0]);
};

const touches = (fields, names) => fields.some((f) => names.includes(f));

const onCatalogChange = (modelName, change) => {
  const conf = CATALOG[modelName];
  const fields = changedFields(change);
  if (change.operationType === "update" && conf.ignore && fields.every((f) => conf.ignore.includes(f))) return;

  if (modelName === "Product" && change.operationType === "update" && touches(fields, ALERT_FIELDS)) {
    wishlistAlerts.onProductChange(change).catch((err) => logger.error(`Wishlist alerts failed: ${err.message}`));
  }

  if (modelName === "Settings") {
    // Another instance (or this one) changed settings: drop the short-lived
    // copy and re-brand emails/invoices from the stored values.
    debounce("settings:reload", undefined, async () => {
      settingsService.clearCache();
      await brandService.applyServerBranding(await settingsService.getSettings({ bypassCache: true }));
    }, 200);
  }

  conf.cache.forEach((prefix) => debounce(`cache:${prefix}`, undefined, () => cache.invalidate(`${prefix}:*`), 150));
  const id = String(change.documentKey?._id || "");
  debounce(`catalog:${conf.entity}`, JSON.stringify({ id, fields }), (values) => {
    const parsed = values.map((v) => JSON.parse(v));
    const payload = {
      entity: conf.entity,
      ids: [...new Set(parsed.map((p) => p.id))].slice(0, 100),
      fields: [...new Set(parsed.flatMap((p) => p.fields))],
    };
    emitToAll("catalog:changed", payload);
    if (conf.entity === "coupon") emitToAdmins("admin:coupon", payload);
  });
};

const dashboardPing = (reason) => debounce("admin:dashboard", reason, (reasons) => emitToAdmins("admin:dashboard", { reasons }), 1000);

const onOrderChange = async (change) => {
  const fields = changedFields(change);
  if (change.operationType === "update" && fields.every((f) => ["smsSent", "updatedAt"].includes(f))) return;
  const Order = mongoose.model("Order");
  const doc =
    change.fullDocument ||
    (change.operationType !== "delete"
      ? await Order.findById(change.documentKey._id).select("user orderNumber orderStatus paymentStatus").lean()
      : null);
  const payload = {
    id: String(change.documentKey._id),
    orderNumber: doc?.orderNumber,
    orderStatus: doc?.orderStatus,
    paymentStatus: doc?.paymentStatus,
  };
  if (doc?.user) emitToUser(doc.user, "order:updated", payload);
  emitToAdmins("admin:order", { action: change.operationType === "insert" ? "created" : change.operationType === "delete" ? "deleted" : "updated", fields, ...payload });
  dashboardPing("order");
};

const onPaymentChange = (change) => {
  const doc = change.fullDocument;
  emitToAdmins("admin:payment", {
    action: change.operationType === "insert" ? "created" : "updated",
    id: String(change.documentKey._id),
    order: doc?.order ? String(doc.order) : undefined,
    status: doc?.status,
    fields: changedFields(change),
  });
  dashboardPing("payment");
};

const onNotificationChange = (change) => {
  if (change.operationType === "insert") {
    const n = change.fullDocument || {};
    if (n.user) {
      emitToUser(n.user, "notification:new", {
        id: String(n._id),
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link || null,
        createdAt: n.createdAt,
      });
    }
    return;
  }
  // Read/delete: the owner's other devices refresh their badge.
  if (change.operationType === "update" || change.operationType === "delete") {
    debounce(`notif:${change.documentKey._id}`, undefined, async () => {
      if (change.operationType === "delete") return; // owner unknown after delete; the deleting device already refreshed
      const n = await mongoose.model("Notification").findById(change.documentKey._id).select("user").lean();
      if (n?.user) emitToUser(n.user, "notification:changed", { ids: [String(change.documentKey._id)] });
    }, 200);
  }
};

const onUserChange = async (change) => {
  const id = String(change.documentKey._id);
  if (change.operationType === "insert") {
    emitToAdmins("admin:user", { action: "created", id });
    dashboardPing("user");
    return;
  }
  if (change.operationType !== "update" && change.operationType !== "replace") return;
  const fields = changedFields(change);
  if (touches(fields, ["isActive", "isVerified", "role", "roleRef", "permissions"])) {
    emitToAdmins("admin:user", { action: "updated", id, fields });
  }
  const cart = touches(fields, ["cart"]);
  const wishlist = touches(fields, ["wishlist"]);
  if (!cart && !wishlist) return;
  const user = await mongoose.model("User").findById(id).select("cart wishlist").lean();
  if (!user) return;
  if (cart) {
    const items = (user.cart || []).length;
    const quantity = (user.cart || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    emitToUser(id, "cart:updated", { items, quantity });
  }
  if (wishlist) emitToUser(id, "wishlist:updated", { count: (user.wishlist || []).length });
};

const onStockMovement = (change) => {
  if (change.operationType !== "insert") return;
  const m = change.fullDocument || {};
  debounce("admin:inventory", JSON.stringify({ product: m.product ? String(m.product) : undefined, variant: m.variant ? String(m.variant) : undefined }), (values) =>
    emitToAdmins("admin:inventory", { items: values.map((v) => JSON.parse(v)).slice(0, 100) }),
  );
};

const onInquiry = (change) => {
  if (change.operationType === "insert") emitToAdmins("admin:inquiry", { action: "created", id: String(change.documentKey._id) });
};

const onCampaignChange = (change) => {
  const id = String(change.documentKey._id);
  debounce(`campaign:${id}`, undefined, () => emitToAdmins("admin:campaign", { id, op: change.operationType }), 300);
};

const onWarehouseChange = (change) =>
  debounce("admin:warehouse", String(change.documentKey._id), (ids) => emitToAdmins("admin:warehouse", { ids: ids.slice(0, 100) }), 300);

// Stock rows written without a movement (new products, self-heal) still refresh inventory screens.
const onWarehouseStockChange = () => debounce("admin:inventory:rows", undefined, () => emitToAdmins("admin:inventory", { items: [] }), 500);

const HANDLERS = {
  Warehouse: onWarehouseChange,
  WarehouseStock: onWarehouseStockChange,
  NotificationCampaign: onCampaignChange,
  Order: onOrderChange,
  PaymentTransaction: onPaymentChange,
  Notification: onNotificationChange,
  User: onUserChange,
  StockMovement: onStockMovement,
  ContactInquiry: onInquiry,
};

const start = () => {
  if (stopped) return;
  const byCollection = new Map();
  [...Object.keys(CATALOG), ...PRIVATE].forEach((name) => {
    if (mongoose.modelNames().includes(name)) byCollection.set(mongoose.model(name).collection.collectionName, name);
  });

  const pipeline = [
    {
      $match: {
        "ns.coll": { $in: [...byCollection.keys()] },
        operationType: { $in: ["insert", "update", "replace", "delete"] },
      },
    },
  ];
  // Pre-change product state (for wishlist alerts) — only collections with
  // pre-images enabled carry it, so this costs nothing elsewhere.
  const options = { fullDocumentBeforeChange: "whenAvailable", ...(resumeToken ? { startAfter: resumeToken } : {}) };
  stream = mongoose.connection.db.watch(pipeline, options);
  cache.setLiveInvalidation(true);

  stream.on("change", (change) => {
    resumeToken = change._id;
    const modelName = byCollection.get(change.ns?.coll);
    if (!modelName) return;
    try {
      if (CATALOG[modelName]) return onCatalogChange(modelName, change);
      const result = HANDLERS[modelName]?.(change);
      if (result?.catch) result.catch((err) => logger.error(`Live sync ${modelName} handler failed: ${err.message}`));
    } catch (err) {
      logger.error(`Live sync ${modelName} handler failed: ${err.message}`);
    }
  });

  stream.on("error", (err) => {
    // Not a replica set (e.g. local standalone mongod): run without live sync.
    if (err.code === 40573 || (!resumeToken && /replica set|change stream/i.test(err.message))) {
      logger.warn(`Live sync unavailable (${err.message}) — product/brand/page/blog responses won't be cached; realtime catalog events disabled.`);
      cache.setLiveInvalidation(false);
      stopped = true;
      return;
    }
    // Resume point no longer in the oplog — restart from now.
    if (err.code === 286 || err.code === 280) resumeToken = null;
    logger.error(`Live sync stream error: ${err.message} — restarting in 5s`);
    cache.setLiveInvalidation(false);
    restart();
  });
  stream.on("close", () => {
    if (!stopped) restart();
  });
  logger.info("Live sync (cache invalidation + realtime events) ready");
};

const restart = () => {
  if (stopped || restartTimer) return;
  restartTimer = setTimeout(() => {
    restartTimer = null;
    try {
      stream?.removeAllListeners();
      start();
    } catch (err) {
      logger.error(`Live sync restart failed: ${err.message}`);
      resumeToken = null; // token may have expired from the oplog — start fresh
      restart();
    }
  }, 5000);
};

/** Lets change events carry a product's previous price/stock (MongoDB 6+; idempotent). */
const enablePreImages = async () => {
  try {
    const collection = mongoose.model("Product").collection.collectionName;
    await mongoose.connection.db.command({ collMod: collection, changeStreamPreAndPostImages: { enabled: true } });
  } catch (err) {
    logger.warn(`Change-stream pre-images unavailable (${err.message}) — wishlist price-drop/back-in-stock alerts disabled.`);
  }
};

const startLiveSync = () => {
  if (process.env.ENABLE_LIVE_SYNC === "false") {
    logger.info("Live sync disabled (ENABLE_LIVE_SYNC=false)");
    return;
  }
  enablePreImages().finally(() => {
    try {
      start();
    } catch (err) {
      logger.warn(`Live sync could not start: ${err.message}`);
      cache.setLiveInvalidation(false);
    }
  });
};

const stopLiveSync = async () => {
  stopped = true;
  clearTimeout(restartTimer);
  cache.setLiveInvalidation(false);
  await stream?.close().catch(() => {});
};

module.exports = { startLiveSync, stopLiveSync };
