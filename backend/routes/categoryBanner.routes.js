const express = require('express');
const router = express.Router();

const {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannerByCategory,
} = require('../controllers/categoryBanner.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');
const { categoryBannerFields } = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { cacheMiddleware } = require('../services/cache.service');
const {
  categoryBannerValidator,
  categoryBannerUpdateValidator,
} = require('../validators/categoryBanner.validator');

// Public — must come before /:id so it isn't swallowed by the id param route
router.get('/by-category/:categoryId', cacheMiddleware('category-banners', 120), getBannerByCategory);

router.get('/', protect, authorize('admin'), getBanners);
router.get('/:id', protect, authorize('admin'), getBannerById);

router.post(
  '/',
  protect,
  authorize('admin'),
  categoryBannerFields,
  categoryBannerValidator,
  validate,
  createBanner,
);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  categoryBannerFields,
  categoryBannerUpdateValidator,
  validate,
  updateBanner,
);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;
