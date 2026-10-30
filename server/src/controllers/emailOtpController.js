const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const {
  User,
  Student,
  College,
  Company,
  TrainingInstitute,
} = require("../models");

const EmailOtp = require("../models/EmailOtp");
const sendOtpEmail = require("../utils/sendOtpEmail");

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_WAIT_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const ALLOWED_ROLES = new Set([
  "student",
  "college",
  "company",
  "training",
]);

// ========================================
// HELPER FUNCTIONS
// ========================================

function normalizeEmail(email) {
  return typeof email === "string"
    ? email.trim().toLowerCase()
    : "";
}

function isValidEmail(email, maxLength = 150) {
  return (
    typeof email === "string" &&
    email.length <= maxLength &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function hashOtp(email, otp) {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error("OTP_SECRET is not configured");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${email}:${otp}`)
    .digest("hex");
}

function createOtp() {
  return crypto
    .randomInt(0, 10000)
    .toString()
    .padStart(4, "0");
}

function safeCompare(a, b) {
  if (
    typeof a !== "string" ||
    typeof b !== "string" ||
    !/^[a-f0-9]{64}$/i.test(a) ||
    !/^[a-f0-9]{64}$/i.test(b)
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(a, "hex"),
    Buffer.from(b, "hex")
  );
}

function cleanString(value, maxLength = 500) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

// ========================================
// ROLE-WISE PROFILE DATA
// ========================================

function getProfileData(role, data, userId) {
  switch (role) {
    case "student":
      return {
        model: Student,
        values: {
          userId,
          phone: cleanString(data.phone, 20) || null,
        },
      };

    case "college":
      return {
        model: College,
        values: {
          userId,
          phone: cleanString(data.phone, 20) || null,
          university:
            cleanString(data.university || data.name, 200) ||
            null,
          website: cleanString(data.website, 255) || null,
          address:
            cleanString(data.location || data.address, 200) ||
            null,
        },
      };

    case "company": {
      const companyName = cleanString(
        data.companyName || data.name,
        150
      );

      const officialEmail = normalizeEmail(
        data.officialEmail || data.email
      );

      if (!companyName) {
        throw new Error(
          "Company name is required for company registration"
        );
      }

      if (!isValidEmail(officialEmail, 255)) {
        throw new Error(
          "A valid company official email is required"
        );
      }

      return {
        model: Company,
        values: {
          userId,
          companyName,
          officialEmail,
          phone: cleanString(data.phone, 20) || null,
          website: cleanString(data.website, 255) || null,
          industry: cleanString(data.industry, 150) || null,
          companySize:
            cleanString(data.companySize, 50) || null,
          location: cleanString(data.location, 200) || null,
        },
      };
    }

    case "training":
      return {
        model: TrainingInstitute,
        values: {
          userId,
          phone: cleanString(data.phone, 20) || null,
          website: cleanString(data.website, 255) || null,
          address:
            cleanString(data.location || data.address, 200) ||
            null,
          categories:
            cleanString(data.categories, 500) || null,
        },
      };

    default:
      throw new Error("Unsupported registration role");
  }
}

// ========================================
// REGISTER — SEND OTP
// POST /api/auth/register
// ========================================

exports.register = async (req, res) => {
  try {
    const body = req.body || {};

    const role =
      typeof body.role === "string"
        ? body.role.trim().toLowerCase()
        : "";

    const email = normalizeEmail(body.email);
    const password = body.password;

    const companyName = cleanString(body.companyName, 150);
    const university = cleanString(body.university, 200);
    const suppliedName = cleanString(body.name, 100);

    const accountName =
      role === "company"
        ? companyName || suppliedName
        : role === "college"
          ? university || suppliedName
          : suppliedName;

    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration role.",
      });
    }

    if (!accountName) {
      return res.status(400).json({
        success: false,
        message:
          role === "company"
            ? "Company name is required."
            : role === "college"
              ? "College or university name is required."
              : "Name is required.",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const officialEmail = normalizeEmail(
      body.officialEmail || email
    );

    if (
      role === "company" &&
      !isValidEmail(officialEmail, 255)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid company official email.",
      });
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please log in.",
      });
    }

    const now = Date.now();

    const pending = await EmailOtp.findOne({
      where: { email },
    });

    if (pending) {
      const lastSent = new Date(
        pending.lastSentAt
      ).getTime();

      if (
        Number.isFinite(lastSent) &&
        now - lastSent < RESEND_WAIT_MS
      ) {
        return res.status(429).json({
          success: false,
          message: "Please wait before requesting another code.",
          retryAfterSeconds: Math.ceil(
            (RESEND_WAIT_MS - (now - lastSent)) / 1000
          ),
        });
      }
    }

    const otp = createOtp();

    const passwordHash = await bcrypt.hash(password, 12);

    const registrationData = {
      name: accountName,
      companyName:
        companyName || (role === "company" ? accountName : ""),
      officialEmail: role === "company" ? officialEmail : "",
      university,
      email,
      password: passwordHash,
      role,
      phone: cleanString(body.phone, 20),
      website: cleanString(body.website, 255),
      industry: cleanString(body.industry, 150),
      companySize: cleanString(body.companySize, 50),
      location: cleanString(body.location, 200),
      address: cleanString(body.address, 200),
      categories: cleanString(body.categories, 500),
    };

    const otpRecord = {
      otpHash: hashOtp(email, otp),
      registrationData,
      expiresAt: new Date(now + OTP_TTL_MS),
      lastSentAt: new Date(now),
      attempts: 0,
    };

    if (pending) {
      await pending.update(otpRecord);
    } else {
      await EmailOtp.create({
        email,
        ...otpRecord,
      });
    }

    try {
      await sendOtpEmail(email, otp);
    } catch (mailError) {
      await EmailOtp.destroy({
        where: { email },
      });

      console.error("OTP email delivery failed:", {
        code: mailError.code,
        responseCode: mailError.responseCode,
        message: mailError.message,
      });

      return res.status(503).json({
        success: false,
        message:
          "Could not send verification email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      requiresOtp: true,
      email,
      message: "Verification code sent. It expires in 5 minutes.",
    });
  } catch (error) {
    console.error(
      "Registration OTP error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Registration could not be started.",
    });
  }
};
// ========================================
// VERIFY EMAIL OTP
// POST /api/auth/verify-email
// ========================================

exports.verifyEmail = async (req, res) => {
  const email = normalizeEmail(req.body?.email);

  const otp =
    typeof req.body?.otp === "string"
      ? req.body.otp.trim()
      : "";

  if (!isValidEmail(email) || !/^\d{4}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email and the 4-digit code.",
    });
  }

  let transaction;

  try {
    transaction = await User.sequelize.transaction();

    const pending = await EmailOtp.findOne({
      where: { email },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!pending) {
      await transaction.rollback();
      transaction = null;

      return res.status(400).json({
        success: false,
        message:
          "No pending verification found. Please register again.",
      });
    }

    if (new Date(pending.expiresAt).getTime() <= Date.now()) {
      await pending.destroy({ transaction });
      await transaction.commit();
      transaction = null;

      return res.status(400).json({
        success: false,
        message: "Code expired. Please register again.",
      });
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      await pending.destroy({ transaction });
      await transaction.commit();
      transaction = null;

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please register again.",
      });
    }

    const submittedHash = hashOtp(email, otp);

    if (!safeCompare(submittedHash, pending.otpHash)) {
      await pending.increment("attempts", {
        by: 1,
        transaction,
      });

      await transaction.commit();
      transaction = null;

      return res.status(400).json({
        success: false,
        message: "Incorrect verification code.",
      });
    }

    const existingUser = await User.findOne({
      where: { email },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingUser) {
      await pending.destroy({ transaction });
      await transaction.commit();
      transaction = null;

      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please log in.",
      });
    }

    
let data = pending.registrationData;

try {
  if (typeof data === "string") {
    data = JSON.parse(data);
  }
} catch (parseError) {
  console.error("Pending registration JSON parse failed");
  return res.status(400).json({
    success: false,
    message: "Registration data is invalid. Please register again.",
  });
}

if (
  !data ||
  typeof data !== "object" ||
  !data.role ||
  !ALLOWED_ROLES.has(data.role)
) {
  console.error("Invalid pending registration data format");

  return res.status(400).json({
    success: false,
    message: "Registration data is invalid. Please register again.",
  });
}


    

    // Create verified user
    const user = await User.create(
      {
        name: cleanString(data.name, 100),
        email,
        password: data.password,
        role: data.role,
        isEmailVerified: true,
        isActive: true,
      },
      { transaction }
    );

    // Create role-specific profile
    const profile = getProfileData(
      data.role,
      data,
      user.id
    );

    await profile.model.create(profile.values, {
      transaction,
    });

    // Remove pending OTP after successful registration
    await pending.destroy({ transaction });

    await transaction.commit();
    transaction = null;

    return res.status(201).json({
      success: true,
      message:
        "Email verified and registration completed. You can now log in.",
    });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(
          "OTP transaction rollback failed:",
          rollbackError.message
        );
      }
    }

    console.error(
      "Email verification error:",
      error.message
    );

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please log in.",
      });
    }

    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Registration details are invalid. Please check the form and try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Could not verify the code. Please try again.",
    });
  }
};

// ========================================
// RESEND OTP
// POST /api/auth/resend-otp
// ========================================

exports.resendOtp = async (req, res) => {
  const email = normalizeEmail(req.body?.email);

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address.",
    });
  }

  try {
    const pending = await EmailOtp.findOne({
      where: { email },
    });

    if (!pending) {
      return res.status(400).json({
        success: false,
        message:
          "No pending registration found. Please register again.",
      });
    }

    const now = Date.now();

    const lastSent = new Date(
      pending.lastSentAt
    ).getTime();

    if (
      Number.isFinite(lastSent) &&
      now - lastSent < RESEND_WAIT_MS
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another code.",
        retryAfterSeconds: Math.ceil(
          (RESEND_WAIT_MS - (now - lastSent)) / 1000
        ),
      });
    }

    const otp = createOtp();

    await pending.update({
      otpHash: hashOtp(email, otp),
      expiresAt: new Date(now + OTP_TTL_MS),
      lastSentAt: new Date(now),
      attempts: 0,
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (mailError) {
      await pending.destroy();

      console.error("OTP resend failed:", {
        code: mailError.code,
        responseCode: mailError.responseCode,
        message: mailError.message,
      });

      return res.status(503).json({
        success: false,
        message:
          "Could not send a new code. Please register again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent.",
    });
  } catch (error) {
    console.error(
      "OTP resend error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Could not resend the code.",
    });
  }
};