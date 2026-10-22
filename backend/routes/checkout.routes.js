const express = require("express");
const router = express.Router();

const {
  requestOtp,
  resendOtp,
  verifyOtp,
  lookupCustomer,
  quote,
} = require("../controllers/checkout.controller");
const { optionalAuth } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { authLimiter, otpLimiter, lookupLimiter } = require("../middlewares/rateLimiter.middleware");
const {
  requestOtpValidator,
  resendOtpValidator,
  verifyOtpValidator,
  lookupCustomerValidator,
} = require("../validators/checkout.validator");

/**
 * @swagger
 * /checkout/request-otp:
 *   post:
 *     summary: Guest checkout — check mobile number and send an OTP (login OTP if it already exists, checkout OTP otherwise)
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobile]
 *             properties:
 *               mobile: { type: string }
 *               email: { type: string }
 *     responses:
 *       200: { description: OTP sent }
 */
router.post("/quote", optionalAuth, quote);
router.post("/request-otp", otpLimiter, requestOtpValidator, validate, requestOtp);
router.post("/resend-otp", otpLimiter, resendOtpValidator, validate, resendOtp);

/**
 * @swagger
 * /checkout/verify-otp:
 *   post:
 *     summary: Verify checkout OTP — logs in an existing account or creates one automatically, then issues tokens
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobile, otp]
 *             properties:
 *               mobile: { type: string }
 *               otp: { type: string }
 *               name: { type: string }
 *               email: { type: string }
 *               saveAddress: { type: boolean }
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   firstName: { type: string }
 *                   lastName: { type: string }
 *                   addressLine1: { type: string }
 *                   addressLine2: { type: string }
 *                   city: { type: string }
 *                   state: { type: string }
 *                   country: { type: string }
 *                   pincode: { type: string }
 *                   phone: { type: string }
 *     responses:
 *       200: { description: Logged in }
 *       201: { description: Account created and logged in }
 */
router.post("/verify-otp", authLimiter, verifyOtpValidator, validate, verifyOtp);

/**
 * @swagger
 * /checkout/lookup-customer:
 *   get:
 *     summary: Checkout autofill — look up a returning customer's saved name and address by mobile or email
 *     tags: [Checkout]
 *     parameters:
 *       - in: query
 *         name: mobile
 *         schema: { type: string }
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lookup result (found true/false) }
 */
router.get(
  "/lookup-customer",
  lookupLimiter,
  lookupCustomerValidator,
  validate,
  lookupCustomer,
);

module.exports = router;
