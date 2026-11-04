const express = require('express');
const router = express.Router();

const { getOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/offer.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');

// Offers are a marketing tool next to coupons, so they share its permission.
router.use(protect, authorize('admin'));

router
  .route('/')
  .get(requirePermission('Coupons', 'View'), getOffers)
  .post(requirePermission('Coupons', 'Create'), createOffer);
router
  .route('/:id')
  .put(requirePermission('Coupons', 'Edit'), updateOffer)
  .delete(requirePermission('Coupons', 'Delete'), deleteOffer);

module.exports = router;
