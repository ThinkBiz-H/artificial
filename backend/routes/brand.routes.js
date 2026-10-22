const express = require('express');
const router = express.Router();

const { createBrand, updateBrand, deleteBrand, getBrands, getBrandBySlug } = require('../controllers/brand.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { brandValidator } = require('../validators/category.validator');

router.get('/', getBrands);
router.get('/:slug', getBrandBySlug);

router.post('/', protect, authorize('admin'), requirePermission('Brands', 'Create'), upload.single('logo'), brandValidator, validate, createBrand);
router.put('/:id', protect, authorize('admin'), requirePermission('Brands', 'Edit'), upload.single('logo'), updateBrand);
router.delete('/:id', protect, authorize('admin'), requirePermission('Brands', 'Delete'), deleteBrand);

module.exports = router;
