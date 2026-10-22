const { body } = require('express-validator');

const contactInquiryValidator = [
  body('name').trim().notEmpty().withMessage('Please enter your name'),
  body('email').trim().notEmpty().withMessage('Please enter your email').isEmail().withMessage('Enter a valid email address'),
  body('phone').trim().notEmpty().withMessage('Please enter your phone number'),
  body('subject').trim().notEmpty().withMessage('Please add a subject'),
  body('message').trim().notEmpty().withMessage('Please write your message').isLength({ min: 10 }).withMessage('Tell us a little more'),
  body('inquiryType').optional().trim().notEmpty().withMessage('Inquiry type cannot be empty'),
];

module.exports = { contactInquiryValidator };
