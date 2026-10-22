const express = require('express');
const router = express.Router();

const {
  purchaseStock,
  adjustStock,
  markDamaged,
  transferStock,
  reserveStock,
  releaseReservedStock,
  getStockByProduct,
  getLowStock,
  getMovements,
} = require('../controllers/inventory.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  purchaseValidator,
  adjustValidator,
  transferValidator,
  reserveValidator,
} = require('../validators/inventory.validator');

router.use(protect, authorize('admin')); // every inventory endpoint is admin-only

router.get('/low-stock', requirePermission('Inventory', 'View'), getLowStock);
router.get('/movements', requirePermission('Inventory', 'View'), getMovements);
router.get('/stock/:productId', requirePermission('Inventory', 'View'), getStockByProduct);

router.post('/purchase', requirePermission('Inventory', 'Create'), purchaseValidator, validate, purchaseStock);
router.post('/adjust', requirePermission('Inventory', 'Edit'), adjustValidator, validate, adjustStock);
router.post('/damaged', requirePermission('Inventory', 'Edit'), purchaseValidator, validate, markDamaged);
router.post('/transfer', requirePermission('Inventory', 'Edit'), transferValidator, validate, transferStock);
router.post('/reserve', requirePermission('Inventory', 'Edit'), reserveValidator, validate, reserveStock);
router.post('/release', requirePermission('Inventory', 'Edit'), reserveValidator, validate, releaseReservedStock);

module.exports = router;
