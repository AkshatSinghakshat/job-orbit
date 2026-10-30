
const express = require("express");
const rateLimit = require("express-rate-limit");
const emailOtpController = require("../controllers/emailOtpController");

const router = express.Router();

// Registration rate limiter: maximum 5 requests in 15 minutes
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration requests. Please try again later.",
  },
});

// Email verification rate limiter: maximum 10 attempts in 15 minutes
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later.",
  },
});

// Resend OTP rate limiter: maximum 5 requests in 15 minutes
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP resend requests. Please try again later.",
  },
});

// Registration: send OTP to the user's email
router.post("/register", registerLimiter, emailOtpController.register);

// Verify the email OTP
router.post(
  "/verify-email",
  verifyLimiter,
  emailOtpController.verifyEmail
);

// Resend OTP
router.post("/resend-otp", resendLimiter, emailOtpController.resendOtp);

module.exports = router;
