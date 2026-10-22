const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/ApiResponse');
const ContactInquiry = require('../models/ContactInquiry');
const { sendContactInquiryNotification } = require('../services/emailService');

// @desc    Submit a Contact page inquiry — saves it, then emails the store inbox
// @route   POST /api/v1/contact
// @access  Public
const createInquiry = asyncHandler(async (req, res) => {
  const { inquiryType, name, email, phone, subject, message } = req.body;

  const inquiry = await ContactInquiry.create({
    inquiryType,
    name,
    email,
    phone,
    subject,
    message,
  });

  // sendContactInquiryNotification swallows its own errors — the inquiry
  // is already saved by this point, so an email failure never fails the
  // customer's submission.
  await sendContactInquiryNotification(inquiry);

  sendResponse(res, 201, { inquiry }, 'Inquiry submitted successfully');
});

module.exports = { createInquiry };
