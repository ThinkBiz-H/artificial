const { body } = require('express-validator');

const roleValidator = [
  body('name').trim().notEmpty().withMessage('Role name is required'),
  body('permissions').optional().isArray().withMessage('permissions must be an array'),
];

const roleUpdateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Role name cannot be empty'),
  body('permissions').optional().isArray().withMessage('permissions must be an array'),
];

module.exports = { roleValidator, roleUpdateValidator };
