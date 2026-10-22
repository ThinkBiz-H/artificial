const { body } = require('express-validator');

const pageValidator = [
  body('title').trim().notEmpty().withMessage('Page title is required'),
  body('status').optional().isIn(['draft', 'published', 'unpublished']).withMessage('Invalid status'),
];

const pageUpdateValidator = [
  body('title').optional().trim().notEmpty().withMessage('Page title cannot be empty'),
  body('status').optional().isIn(['draft', 'published', 'unpublished']).withMessage('Invalid status'),
];

const sectionValidator = [
  body('type').trim().notEmpty().withMessage('Section type is required'),
];

const faqValidator = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
];

const faqUpdateValidator = [
  body('question').optional().trim().notEmpty().withMessage('Question cannot be empty'),
  body('answer').optional().trim().notEmpty().withMessage('Answer cannot be empty'),
];

const announcementValidator = [
  body('text').trim().notEmpty().withMessage('Announcement text is required'),
];

const announcementUpdateValidator = [
  body('text').optional().trim().notEmpty().withMessage('Announcement text cannot be empty'),
];

const slideValidator = [
  body('order').optional().isInt().withMessage('Order must be a number'),
  body('active').optional().isBoolean().withMessage('Active must be boolean'),
];

const reelValidator = [
  body('order').optional().isInt().withMessage('Order must be a number'),
  body('active').optional().isBoolean().withMessage('Active must be boolean'),
];

module.exports = {
  pageValidator,
  pageUpdateValidator,
  sectionValidator,
  faqValidator,
  faqUpdateValidator,
  announcementValidator,
  announcementUpdateValidator,
  slideValidator,
  reelValidator,
};
