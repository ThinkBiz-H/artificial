const { body, query } = require("express-validator");

const requestOtpValidator = [
  body("mobile")
    .isLength({ min: 10, max: 15 })
    .withMessage("Valid mobile number is required"),
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Valid email is required"),
];

const resendOtpValidator = [
  body("mobile")
    .isLength({ min: 10, max: 15 })
    .withMessage("Valid mobile number is required"),
];

const verifyOtpValidator = [
  body("mobile")
    .isLength({ min: 10, max: 15 })
    .withMessage("Valid mobile number is required"),
  body("otp")
    .isLength({ min: 4, max: 6 })
    .withMessage("Valid OTP is required"),
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Valid email is required"),
  body("shippingAddress.addressLine1")
    .optional({ checkFalsy: true })
    .notEmpty(),
  body("shippingAddress.city").optional({ checkFalsy: true }).notEmpty(),
  body("shippingAddress.state").optional({ checkFalsy: true }).notEmpty(),
  body("shippingAddress.pincode").optional({ checkFalsy: true }).notEmpty(),
];

const lookupCustomerValidator = [
  query("mobile")
    .optional({ checkFalsy: true })
    .isLength({ min: 10, max: 15 })
    .withMessage("Valid mobile number is required"),
  query("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Valid email is required"),
];

module.exports = {
  requestOtpValidator,
  resendOtpValidator,
  verifyOtpValidator,
  lookupCustomerValidator,
};
