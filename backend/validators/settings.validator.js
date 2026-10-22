const { body } = require('express-validator');

const settingsUpdateValidator = [
  body('currency.code').optional().isLength({ min: 3, max: 3 }).withMessage('currency.code must be a 3-letter ISO code'),
  body('currency.position').optional().isIn(['before', 'after']).withMessage('currency.position must be "before" or "after"'),
  body('tax.defaultTaxPercent').optional().isFloat({ min: 0, max: 100 }).withMessage('tax.defaultTaxPercent must be between 0 and 100'),
  body('general.supportEmail').optional({ checkFalsy: true }).isEmail().withMessage('general.supportEmail must be a valid email'),
  body('shipping.freeShippingEnabled').optional().isBoolean().withMessage('shipping.freeShippingEnabled must be a boolean'),
  body('shipping.freeShippingThreshold').optional().isFloat({ min: 0 }).withMessage('shipping.freeShippingThreshold cannot be negative'),
  body('shipping.defaultShippingCharge').optional().isFloat({ min: 0 }).withMessage('shipping.defaultShippingCharge cannot be negative'),
  body('shipping.expressShippingCharge').optional().isFloat({ min: 0 }).withMessage('shipping.expressShippingCharge cannot be negative'),
  body('shipping.codCharge').optional().isFloat({ min: 0 }).withMessage('shipping.codCharge cannot be negative'),
];

module.exports = { settingsUpdateValidator };
