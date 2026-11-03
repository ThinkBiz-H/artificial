const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendResponse } = require('../utils/ApiResponse');
const Warehouse = require('../models/Warehouse');
const WarehouseStock = require('../models/WarehouseStock');
const StockMovement = require('../models/StockMovement');
const { setDefaultWarehouse, ensureDefaultWarehouse, selfHeal, healthCheck } = require('../services/warehouse.service');

const EDITABLE_FIELDS = ['name', 'code', 'address', 'contactPerson', 'contactPhone', 'contactEmail', 'capacity', 'notes'];
const isTrue = (v) => v === true || v === 'true';
const isFalse = (v) => v === false || v === 'false';

/** Oldest other active warehouse — the one promoted when the default goes away. */
const nextDefaultCandidate = (excludeId) => Warehouse.findOne({ _id: { $ne: excludeId }, status: 'active' }).sort({ createdAt: 1 });

// @desc    Create a warehouse. The first warehouse ever created is
//          automatically the default one (every stock operation needs a
//          default to fall back to when no warehouse is specified).
// @route   POST /api/v1/warehouses
// @access  Private/Admin
const createWarehouse = asyncHandler(async (req, res) => {
  const values = {};
  EDITABLE_FIELDS.forEach((f) => {
    if (req.body[f] !== undefined) values[f] = req.body[f];
  });
  values.status = req.body.status === 'inactive' ? 'inactive' : 'active';

  const existingCount = await Warehouse.countDocuments();
  const makeDefault = isTrue(req.body.isDefault) || existingCount === 0;
  if (makeDefault && values.status === 'inactive') throw new ApiError(400, 'The default warehouse must be active');

  const warehouse = await Warehouse.create({ ...values, isDefault: false });
  if (makeDefault) await setDefaultWarehouse(warehouse._id);
  sendResponse(res, 201, { warehouse: await Warehouse.findById(warehouse._id) }, 'Warehouse created successfully');
});

// @desc    Update a warehouse (setting isDefault:true unsets it on every other warehouse)
// @route   PUT /api/v1/warehouses/:id
// @access  Private/Admin
const updateWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) throw new ApiError(404, 'Warehouse not found');

  EDITABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) warehouse[field] = req.body[field];
  });

  const deactivating = req.body.status === 'inactive' && warehouse.status !== 'inactive';
  if (req.body.status === 'active' || req.body.status === 'inactive') warehouse.status = req.body.status;

  if (deactivating) {
    const stockRemaining = await WarehouseStock.exists({ warehouse: warehouse._id, available: { $gt: 0 } });
    if (stockRemaining) throw new ApiError(400, 'This warehouse still holds stock — transfer it to another warehouse before deactivating');
  }

  let promote = null;
  if (isTrue(req.body.isDefault)) {
    if (warehouse.status !== 'active') throw new ApiError(400, 'An inactive warehouse cannot be the default — activate it first');
  } else if ((isFalse(req.body.isDefault) || deactivating) && warehouse.isDefault) {
    // Hand the default to another active warehouse; never leave none.
    promote = await nextDefaultCandidate(warehouse._id);
    if (!promote) {
      throw new ApiError(400, deactivating
        ? 'This is the only active warehouse — add or activate another warehouse before deactivating it'
        : 'This is the only active warehouse, so it must stay the default — add another warehouse first');
    }
  }

  await warehouse.save();
  if (isTrue(req.body.isDefault)) await setDefaultWarehouse(warehouse._id);
  if (promote) await setDefaultWarehouse(promote._id);

  sendResponse(res, 200, { warehouse: await Warehouse.findById(warehouse._id), promoted: promote ? { _id: promote._id, name: promote.name, code: promote.code } : null }, promote ? `Warehouse updated — ${promote.name} is now the default` : 'Warehouse updated successfully');
});

// @desc    Deactivate a warehouse (soft — status flip, not deletion, since
//          historical StockMovement/WarehouseStock records must keep
//          referencing it). Deactivating the default promotes the oldest
//          other active warehouse.
// @route   DELETE /api/v1/warehouses/:id
// @access  Private/Admin
const deactivateWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) throw new ApiError(404, 'Warehouse not found');
  if (warehouse.status === 'inactive') return sendResponse(res, 200, { warehouse }, 'Warehouse is already inactive');

  const stockRemaining = await WarehouseStock.exists({ warehouse: warehouse._id, available: { $gt: 0 } });
  if (stockRemaining) {
    throw new ApiError(400, 'This warehouse still holds stock — transfer it to another warehouse before deactivating');
  }

  let promote = null;
  if (warehouse.isDefault) {
    promote = await nextDefaultCandidate(warehouse._id);
    if (!promote) throw new ApiError(400, 'This is the only active warehouse — add or activate another warehouse before deactivating it');
    await setDefaultWarehouse(promote._id);
  }

  warehouse.status = 'inactive';
  warehouse.isDefault = false;
  await warehouse.save();
  sendResponse(res, 200, { warehouse, promoted: promote ? { _id: promote._id, name: promote.name, code: promote.code } : null }, promote ? `Warehouse deactivated — ${promote.name} is now the default` : 'Warehouse deactivated successfully');
});

// @desc    List warehouses
// @route   GET /api/v1/warehouses
// @access  Private/Admin
const getWarehouses = asyncHandler(async (req, res) => {
  await ensureDefaultWarehouse(); // the list never shows a store without a default
  const filter = req.query.status ? { status: req.query.status } : {};
  const warehouses = await Warehouse.find(filter).sort({ isDefault: -1, name: 1 });
  sendResponse(res, 200, { warehouses, count: warehouses.length }, 'Warehouses fetched successfully');
});

// @desc    Get a single warehouse
// @route   GET /api/v1/warehouses/:id
// @access  Private/Admin
const getWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) throw new ApiError(404, 'Warehouse not found');
  sendResponse(res, 200, { warehouse }, 'Warehouse fetched successfully');
});

/** Per-warehouse stock totals keyed by warehouse id. */
const stockSummaries = async (match = {}) => {
  const rows = await WarehouseStock.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$warehouse',
        units: { $sum: '$available' },
        reserved: { $sum: '$reserved' },
        damaged: { $sum: '$damaged' },
        incoming: { $sum: '$incoming' },
        skus: { $sum: { $cond: [{ $gt: ['$available', 0] }, 1, 0] } },
        products: { $addToSet: { $cond: [{ $gt: ['$available', 0] }, '$product', '$$REMOVE'] } },
        lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$available', 0] }, { $lte: ['$available', '$lowStockThreshold'] }] }, 1, 0] } },
        outOfStock: { $sum: { $cond: [{ $lte: ['$available', 0] }, 1, 0] } },
      },
    },
  ]);
  return new Map(rows.map((r) => [String(r._id), { units: r.units, reserved: r.reserved, damaged: r.damaged, incoming: r.incoming, skus: r.skus, products: r.products.length, lowStock: r.lowStock, outOfStock: r.outOfStock }]));
};

const EMPTY_SUMMARY = { units: 0, reserved: 0, damaged: 0, incoming: 0, skus: 0, products: 0, lowStock: 0, outOfStock: 0 };

const recentMovements = (match, limit = 10) =>
  StockMovement.find(match)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('product', 'title slug')
    .populate('variant', 'sku')
    .populate('warehouse', 'name code')
    .populate('performedBy', 'name')
    .lean();

// @desc    Warehouse dashboard: every warehouse with its stock summary, totals, recent activity and health
// @route   GET /api/v1/warehouses/overview
// @access  Private/Admin
const getOverview = asyncHandler(async (req, res) => {
  await ensureDefaultWarehouse();
  const [warehouses, summaries, activity, health] = await Promise.all([
    Warehouse.find({}).sort({ isDefault: -1, status: 1, name: 1 }).lean(),
    stockSummaries(),
    recentMovements({}, 12),
    healthCheck(),
  ]);
  const items = warehouses.map((w) => {
    const summary = summaries.get(String(w._id)) || EMPTY_SUMMARY;
    return { ...w, summary, utilisation: w.capacity > 0 ? Math.min(100, Math.round((summary.units / w.capacity) * 100)) : null };
  });
  const totals = items.reduce(
    (t, w) => ({
      warehouses: t.warehouses + 1,
      active: t.active + (w.status === 'active' ? 1 : 0),
      units: t.units + w.summary.units,
      reserved: t.reserved + w.summary.reserved,
      lowStock: t.lowStock + w.summary.lowStock,
      outOfStock: t.outOfStock + w.summary.outOfStock,
    }),
    { warehouses: 0, active: 0, units: 0, reserved: 0, lowStock: 0, outOfStock: 0 },
  );
  sendResponse(res, 200, { warehouses: items, totals, recentActivity: activity, health }, 'Warehouse overview fetched successfully');
});

// @desc    One warehouse: summary, low-stock items and recent activity
// @route   GET /api/v1/warehouses/:id/summary
// @access  Private/Admin
const getWarehouseSummary = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid warehouse id');
  const warehouse = await Warehouse.findById(req.params.id).lean();
  if (!warehouse) throw new ApiError(404, 'Warehouse not found');
  const id = new mongoose.Types.ObjectId(req.params.id);
  const [summaries, lowStockItems, activity] = await Promise.all([
    stockSummaries({ warehouse: id }),
    WarehouseStock.find({ warehouse: id, $expr: { $lte: ['$available', '$lowStockThreshold'] } })
      .sort({ available: 1 })
      .limit(20)
      .populate('product', 'title slug thumbnail')
      .populate('variant', 'sku')
      .lean(),
    recentMovements({ warehouse: id }, 15),
  ]);
  const summary = summaries.get(String(id)) || EMPTY_SUMMARY;
  sendResponse(res, 200, {
    warehouse: { ...warehouse, summary, utilisation: warehouse.capacity > 0 ? Math.min(100, Math.round((summary.units / warehouse.capacity) * 100)) : null },
    lowStockItems,
    recentActivity: activity,
  }, 'Warehouse summary fetched successfully');
});

// @desc    Integrity check (default warehouse, unmapped products, orphan stock rows)
// @route   GET /api/v1/warehouses/health
const getHealth = asyncHandler(async (req, res) => {
  sendResponse(res, 200, await healthCheck(), 'Warehouse health fetched successfully');
});

// @desc    Run the self-heal now (also runs on every server start)
// @route   POST /api/v1/warehouses/repair
const repair = asyncHandler(async (req, res) => {
  const report = await selfHeal();
  sendResponse(res, 200, { report, health: await healthCheck() }, 'Warehouse data verified and repaired');
});

module.exports = {
  createWarehouse,
  updateWarehouse,
  deactivateWarehouse,
  getWarehouses,
  getWarehouse,
  getOverview,
  getWarehouseSummary,
  getHealth,
  repair,
};
