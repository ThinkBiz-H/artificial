const { body } = require('express-validator');

const categoryBannerValidator = [
  body('name').trim().notEmpty().withMessage('Banner name is required'),
  body('priority').optional().isInt().withMessage('Priority must be a number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
];

const categoryBannerUpdateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Banner name cannot be empty'),
  body('priority').optional().isInt().withMessage('Priority must be a number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
];

module.exports = {
  categoryBannerValidator,
  categoryBannerUpdateValidator,
};
