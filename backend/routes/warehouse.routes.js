const express = require('express');
const router = express.Router();

const {
  createWarehouse,
  updateWarehouse,
  deactivateWarehouse,
  getWarehouses,
  getWarehouse,
} = require('../controllers/warehouse.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');
const { warehouseValidator, warehouseUpdateValidator } = require('../validators/warehouse.validator');

router.use(protect, authorize('admin')); // every warehouse endpoint is admin-only

router.get('/', requirePermission('Warehouse', 'View'), getWarehouses);
router.get('/:id', requirePermission('Warehouse', 'View'), getWarehouse);
router.post('/', requirePermission('Warehouse', 'Create'), warehouseValidator, validate, createWarehouse);
router.put('/:id', requirePermission('Warehouse', 'Edit'), warehouseUpdateValidator, validate, updateWarehouse);
router.delete('/:id', requirePermission('Warehouse', 'Delete'), deactivateWarehouse);

module.exports = router;
