const { body } = require('express-validator');

const variantValidator = [
  body('sku').trim().notEmpty().withMessage('Variant SKU is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('salePrice').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('color').optional().isString().isLength({ max: 60 }).withMessage('Color must be at most 60 characters'),
  body('size').optional().isString().isLength({ max: 30 }).withMessage('Size must be at most 30 characters'),
];

const variantUpdateValidator = [
  body('sku').optional().trim().notEmpty().withMessage('Variant SKU cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('salePrice').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('color').optional().isString().isLength({ max: 60 }).withMessage('Color must be at most 60 characters'),
  body('size').optional().isString().isLength({ max: 30 }).withMessage('Size must be at most 30 characters'),
];

module.exports = { variantValidator, variantUpdateValidator };
