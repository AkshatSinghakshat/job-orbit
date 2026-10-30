
const express = require("express");

const {
  login,
} = require("../controllers/authController");

const {
  register,
  verifyEmail,
  resendOtp,
} = require("../controllers/emailOtpController");

const router = express.Router();

// Register: OTP email पर भेजेगा
router.post("/register", register);

// Verify OTP: OTP सही होने पर account create होगा
router.post("/verify-email", verifyEmail);

// Resend OTP: नया OTP भेजेगा
router.post("/resend-otp", resendOtp);

// Login
router.post("/login", login);

module.exports = router;
