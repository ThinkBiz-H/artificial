const { body } = require('express-validator');

const couponValidator = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('discount').isFloat({ min: 0 }).withMessage('Discount must be a positive number'),
  body('type').isIn(['percentage', 'flat']).withMessage('Type must be percentage or flat'),
  body('expiry').isISO8601().withMessage('Valid expiry date is required'),
  body('minimumOrder').optional().isFloat({ min: 0 }).withMessage('Minimum order must be a positive number'),
  body('maximumDiscount').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Maximum discount must be a positive number'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),
  body('perUserLimit').optional().isInt({ min: 1 }).withMessage('Per-user limit must be a positive integer'),
];

module.exports = { couponValidator };
