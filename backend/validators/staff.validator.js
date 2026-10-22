const { body } = require('express-validator');

const staffValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('roleRef').optional({ nullable: true }).isMongoId().withMessage('Invalid roleRef'),
];

const staffUpdateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('roleRef').optional({ nullable: true }).isMongoId().withMessage('Invalid roleRef'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = { staffValidator, staffUpdateValidator };
