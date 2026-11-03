const { body } = require('express-validator');

const CODE = /^[A-Za-z0-9-_]{2,20}$/;

/** Optional fields shared by create and update. */
const detailRules = [
  body('code').optional().trim().matches(CODE).withMessage('Code must be 2–20 letters, numbers, - or _ (e.g. MAIN, BLR-01)'),
  body('address.pincode').optional({ values: 'falsy' }).trim().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  body('contactPhone').optional({ values: 'falsy' }).trim().matches(/^[0-9+\-\s]{7,15}$/).withMessage('Enter a valid contact phone number'),
  body('contactEmail').optional({ values: 'falsy' }).trim().isEmail().withMessage('Enter a valid contact email'),
  body('capacity').optional({ values: 'null' }).isInt({ min: 0 }).withMessage('Capacity must be a whole number of units (0 = not tracked)').toInt(),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes can be at most 500 characters'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];

const warehouseValidator = [
  body('name').trim().notEmpty().withMessage('Warehouse name is required').isLength({ max: 80 }).withMessage('Name can be at most 80 characters'),
  body('code').trim().notEmpty().withMessage('Warehouse code is required'),
  ...detailRules,
];

const warehouseUpdateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Warehouse name cannot be empty').isLength({ max: 80 }).withMessage('Name can be at most 80 characters'),
  body('code').optional().trim().notEmpty().withMessage('Warehouse code cannot be empty'),
  ...detailRules,
];

module.exports = { warehouseValidator, warehouseUpdateValidator };
