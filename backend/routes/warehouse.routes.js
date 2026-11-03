const express = require('express');
const router = express.Router();

const {
  createWarehouse,
  updateWarehouse,
  deactivateWarehouse,
  getWarehouses,
  getWarehouse,
  getOverview,
  getWarehouseSummary,
  getHealth,
  repair,
} = require('../controllers/warehouse.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const auditLog = require('../middlewares/auditLog.middleware');
const validate = require('../middlewares/validate.middleware');
const { warehouseValidator, warehouseUpdateValidator } = require('../validators/warehouse.validator');

router.use(protect, authorize('admin')); // every warehouse endpoint is admin-only
router.use(auditLog); // every change is recorded in the audit log

router.get('/', requirePermission('Warehouse', 'View'), getWarehouses);
router.get('/overview', requirePermission('Warehouse', 'View'), getOverview);
router.get('/health', requirePermission('Warehouse', 'View'), getHealth);
router.post('/repair', requirePermission('Warehouse', 'Edit'), repair);
router.get('/:id/summary', requirePermission('Warehouse', 'View'), getWarehouseSummary);
router.get('/:id', requirePermission('Warehouse', 'View'), getWarehouse);
router.post('/', requirePermission('Warehouse', 'Create'), warehouseValidator, validate, createWarehouse);
router.put('/:id', requirePermission('Warehouse', 'Edit'), warehouseUpdateValidator, validate, updateWarehouse);
router.delete('/:id', requirePermission('Warehouse', 'Delete'), deactivateWarehouse);

module.exports = router;
