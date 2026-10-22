const express = require('express');
const router = express.Router();

const {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCoupons,
  getCouponById,
  getCouponAnalytics,
  getCouponsOverview,
} = require('../controllers/coupon.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');
const { couponValidator } = require('../validators/coupon.validator');

router.use(protect, authorize('admin'));

router.get('/analytics/overview', requirePermission('Coupons', 'View'), getCouponsOverview);
router
  .route('/')
  .get(requirePermission('Coupons', 'View'), getCoupons)
  .post(requirePermission('Coupons', 'Create'), couponValidator, validate, createCoupon);
router.get('/:id/analytics', requirePermission('Coupons', 'View'), getCouponAnalytics);
router
  .route('/:id')
  .get(requirePermission('Coupons', 'View'), getCouponById)
  .put(requirePermission('Coupons', 'Edit'), updateCoupon)
  .delete(requirePermission('Coupons', 'Delete'), deleteCoupon);

module.exports = router;
