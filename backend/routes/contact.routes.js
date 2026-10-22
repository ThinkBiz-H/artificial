const express = require('express');
const router = express.Router();

const { createInquiry } = require('../controllers/contact.controller');
const { contactInquiryValidator } = require('../validators/contact.validator');
const validate = require('../middlewares/validate.middleware');
const { contactLimiter } = require('../middlewares/rateLimiter.middleware');

router.post('/', contactLimiter, contactInquiryValidator, validate, createInquiry);

module.exports = router;
