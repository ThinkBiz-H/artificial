const { body } = require('express-validator');

const workshopCardValidator = [
  body('heading').trim().notEmpty().withMessage('Heading is required'),
  body('order').optional().isInt().withMessage('Order must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const workshopCardUpdateValidator = [
  body('heading').optional().trim().notEmpty().withMessage('Heading cannot be empty'),
  body('order').optional().isInt().withMessage('Order must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

module.exports = { workshopCardValidator, workshopCardUpdateValidator };
