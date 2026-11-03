const mongoose = require("mongoose");
const Warehouse = require("../models/Warehouse");
const WarehouseStock = require("../models/WarehouseStock");
const StockMovement = require("../models/StockMovement");
const Product = require("../models/Product");
const Variant = require("../models/Variant");
const logger = require("../utils/logger");

/**
 * Warehouse integrity: there is always exactly one active default warehouse
 * and every sellable product/variant has a stock record.
 *
 * `ensureDefaultWarehouse()` is called wherever a default is needed (product
 * creation, stock operations, orders) and repairs the configuration instead
 * of failing:
 *   - several defaults        → keep the oldest, unset the rest
 *   - default inactive/gone   → promote the oldest active warehouse
 *   - no active warehouse     → reactivate the former default (keeps stock references valid)
 *   - no warehouse at all     → create "Main Warehouse" (MAIN)
 * A unique partial index (models/Warehouse.js) guarantees at most one default
 * at the database level, so concurrent repairs cannot create two.
 */
const DEFAULT_WAREHOUSE = { name: "Main Warehouse", code: "MAIN" };

const isDuplicateKey = (err) => err?.code === 11000;

const repairDefault = async () => {
  const defaults = await Warehouse.find({ isDefault: true }).sort({ createdAt: 1 });
  const activeDefault = defaults.find((w) => w.status === "active");

  // Several defaults (possible only in data written before the unique index).
  if (defaults.length > 1) {
    const keep = activeDefault || defaults[0];
    await Warehouse.updateMany({ isDefault: true, _id: { $ne: keep._id } }, { $set: { isDefault: false } });
    logger.warn(`Warehouse repair: ${defaults.length} default warehouses found — kept ${keep.code}, unset the others`);
    if (keep.status === "active") return keep;
  } else if (activeDefault) {
    return activeDefault;
  }

  // The default is inactive (or missing): promote the oldest active warehouse.
  const promote = await Warehouse.findOne({ status: "active" }).sort({ createdAt: 1 });
  if (promote) {
    await Warehouse.updateMany({ isDefault: true, _id: { $ne: promote._id } }, { $set: { isDefault: false } });
    promote.isDefault = true;
    await promote.save();
    logger.warn(`Warehouse repair: promoted ${promote.code} to default warehouse`);
    return promote;
  }

  // No active warehouse: bring the former default back rather than orphaning its stock.
  const former = defaults[0] || (await Warehouse.findOne({}).sort({ createdAt: 1 }));
  if (former) {
    await Warehouse.updateMany({ isDefault: true, _id: { $ne: former._id } }, { $set: { isDefault: false } });
    former.status = "active";
    former.isDefault = true;
    await former.save();
    logger.warn(`Warehouse repair: no active warehouse — reactivated ${former.code} as default`);
    return former;
  }

  const created = await Warehouse.create({ ...DEFAULT_WAREHOUSE, isDefault: true, status: "active", address: { country: "India" } });
  logger.info(`Warehouse repair: no warehouse existed — created ${created.name} (${created.code}) as default`);
  return created;
};

/** The active default warehouse, repairing the configuration if needed. */
const ensureDefaultWarehouse = async (session = null) => {
  const found = await Warehouse.findOne({ isDefault: true, status: "active" }).session(session);
  if (found) return found;
  // Repairs run outside the caller's transaction so they persist even if the caller aborts.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const warehouse = await repairDefault();
      return session ? Warehouse.findById(warehouse._id).session(session) : warehouse;
    } catch (err) {
      // Another request/instance repaired it at the same moment — re-read.
      if (!isDuplicateKey(err)) throw err;
      // eslint-disable-next-line no-await-in-loop
      const winner = await Warehouse.findOne({ isDefault: true, status: "active" });
      if (winner) return session ? Warehouse.findById(winner._id).session(session) : winner;
    }
  }
  throw new Error("Could not establish a default warehouse");
};

/**
 * Makes `warehouseId` the default in one transaction (unset others, then
 * set), so there is never a moment with zero or two defaults.
 */
const setDefaultWarehouse = async (warehouseId) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Warehouse.updateMany({ _id: { $ne: warehouseId }, isDefault: true }, { $set: { isDefault: false } }, { session });
      await Warehouse.updateOne({ _id: warehouseId }, { $set: { isDefault: true, status: "active" } }, { session });
    });
  } finally {
    await session.endSession();
  }
};

/** Creates a stock row from a product/variant's recorded stock when it has none anywhere. */
const backfillStockRow = async ({ productId, variantId = null, quantity, warehouse, unit = null }) => {
  const available = Math.max(0, Number(quantity) || 0);
  const result = await WarehouseStock.updateOne(
    { product: productId, variant: variantId, warehouse: warehouse._id },
    { $setOnInsert: { available, reserved: 0, damaged: 0, incoming: 0 } },
    { upsert: true },
  );
  if (!result.upsertedCount) return false; // another instance did it first
  if (available > 0) {
    await StockMovement.create({
      product: productId,
      variant: variantId,
      warehouse: warehouse._id,
      unit,
      type: "adjustment",
      quantity: available,
      previousStock: 0,
      newStock: available,
      referenceType: "system",
      note: "Stock record created from the product's recorded stock (warehouse self-heal)",
    });
  }
  return true;
};

/**
 * Startup self-heal. Verifies and repairs:
 *   1. a single active default warehouse exists
 *   2. stock rows pointing at warehouses that no longer exist → moved to the default
 *   3. every live product (no variants) / variant has a stock row → created from its recorded stock
 *   4. Product.stock / Variant.stock equal the sum of their warehouse rows (the ledger orders use)
 * Idempotent and safe to run on every instance at every start.
 */
const selfHeal = async () => {
  const report = { defaultWarehouse: null, movedRows: 0, mergedRows: 0, backfilledProducts: 0, backfilledVariants: 0, resyncedProducts: 0, resyncedVariants: 0 };
  const warehouse = await ensureDefaultWarehouse();
  report.defaultWarehouse = warehouse.code;

  // 2. Rows referencing a warehouse document that no longer exists.
  const existingIds = await Warehouse.distinct("_id");
  const orphanRows = await WarehouseStock.find({ warehouse: { $nin: existingIds } }).lean();
  for (const row of orphanRows) {
    const target = { product: row.product, variant: row.variant, warehouse: warehouse._id };
    // eslint-disable-next-line no-await-in-loop
    const existing = await WarehouseStock.findOne(target);
    if (existing) {
      existing.available += row.available || 0;
      existing.reserved += row.reserved || 0;
      existing.damaged += row.damaged || 0;
      existing.incoming += row.incoming || 0;
      // eslint-disable-next-line no-await-in-loop
      await existing.save();
      // eslint-disable-next-line no-await-in-loop
      await WarehouseStock.deleteOne({ _id: row._id });
      report.mergedRows += 1;
    } else {
      // eslint-disable-next-line no-await-in-loop
      await WarehouseStock.updateOne({ _id: row._id }, { $set: { warehouse: warehouse._id } });
      report.movedRows += 1;
    }
  }

  // 3. Products / variants with no stock row in any warehouse.
  const productsWithoutRows = await Product.aggregate([
    { $match: { isDeleted: { $ne: true }, hasVariants: { $ne: true } } },
    { $lookup: { from: WarehouseStock.collection.collectionName, let: { id: "$_id" }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$product", "$$id"] }, { $eq: ["$variant", null] }] } } }, { $limit: 1 }], as: "rows" } },
    { $match: { rows: { $size: 0 } } },
    { $project: { stock: 1, unit: 1 } },
  ]);
  for (const p of productsWithoutRows) {
    // eslint-disable-next-line no-await-in-loop
    if (await backfillStockRow({ productId: p._id, quantity: p.stock, warehouse, unit: p.unit || null })) report.backfilledProducts += 1;
  }

  const variantsWithoutRows = await Variant.aggregate([
    { $lookup: { from: WarehouseStock.collection.collectionName, let: { id: "$_id" }, pipeline: [{ $match: { $expr: { $eq: ["$variant", "$$id"] } } }, { $limit: 1 }], as: "rows" } },
    { $match: { rows: { $size: 0 } } },
    { $project: { stock: 1, product: 1 } },
  ]);
  for (const v of variantsWithoutRows) {
    // eslint-disable-next-line no-await-in-loop
    if (await backfillStockRow({ productId: v.product, variantId: v._id, quantity: v.stock, warehouse })) report.backfilledVariants += 1;
  }

  // 4. Denormalised totals vs the ledger.
  const productTotals = await WarehouseStock.aggregate([{ $match: { variant: null } }, { $group: { _id: "$product", total: { $sum: "$available" } } }]);
  for (const { _id, total } of productTotals) {
    // eslint-disable-next-line no-await-in-loop
    const res = await Product.updateOne({ _id, hasVariants: { $ne: true }, stock: { $ne: total } }, { $set: { stock: total } });
    report.resyncedProducts += res.modifiedCount || 0;
  }
  const variantTotals = await WarehouseStock.aggregate([{ $match: { variant: { $ne: null } } }, { $group: { _id: "$variant", total: { $sum: "$available" } } }]);
  for (const { _id, total } of variantTotals) {
    // eslint-disable-next-line no-await-in-loop
    const res = await Variant.updateOne({ _id, stock: { $ne: total } }, { $set: { stock: total } });
    report.resyncedVariants += res.modifiedCount || 0;
  }

  const repaired = report.movedRows + report.mergedRows + report.backfilledProducts + report.backfilledVariants + report.resyncedProducts + report.resyncedVariants;
  if (repaired) logger.warn(`Warehouse self-heal repaired data: ${JSON.stringify(report)}`);
  else logger.info(`Warehouse check OK (default: ${report.defaultWarehouse})`);
  return report;
};

/** Read-only health check for the admin panel (what selfHeal would repair). */
const healthCheck = async () => {
  const [warehouses, defaults, activeDefault] = await Promise.all([
    Warehouse.countDocuments(),
    Warehouse.countDocuments({ isDefault: true }),
    Warehouse.findOne({ isDefault: true, status: "active" }).select("name code").lean(),
  ]);
  const existingIds = await Warehouse.distinct("_id");
  const [orphanRows, unmappedProducts] = await Promise.all([
    WarehouseStock.countDocuments({ warehouse: { $nin: existingIds } }),
    Product.aggregate([
      { $match: { isDeleted: { $ne: true }, hasVariants: { $ne: true } } },
      { $lookup: { from: WarehouseStock.collection.collectionName, let: { id: "$_id" }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$product", "$$id"] }, { $eq: ["$variant", null] }] } } }, { $limit: 1 }], as: "rows" } },
      { $match: { rows: { $size: 0 } } },
      { $count: "n" },
    ]),
  ]);
  const issues = [];
  if (!warehouses) issues.push("No warehouse exists");
  if (!activeDefault) issues.push("No active default warehouse");
  if (defaults > 1) issues.push(`${defaults} warehouses are marked default`);
  if (orphanRows) issues.push(`${orphanRows} stock record(s) reference a deleted warehouse`);
  const unmapped = unmappedProducts[0]?.n || 0;
  if (unmapped) issues.push(`${unmapped} product(s) have no stock record`);
  return { healthy: issues.length === 0, issues, defaultWarehouse: activeDefault, warehouses };
};

module.exports = { ensureDefaultWarehouse, setDefaultWarehouse, selfHeal, healthCheck, DEFAULT_WAREHOUSE };
