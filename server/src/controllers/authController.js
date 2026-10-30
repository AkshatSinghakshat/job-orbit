
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  User,
  Student,
  College,
  Company,
  TrainingInstitute,
} = require("../models");

// ========================================
// CONSTANTS
// ========================================

const REGISTRATION_ROLES = [
  "student",
  "college",
  "company",
  "training",
];

const LOGIN_ROLES = [
  "student",
  "college",
  "company",
  "training",
  "admin",
  "developer",
];

// ========================================
// REGISTER
// Public registration: no admin/developer
// ========================================

const register = async (req, res) => {
  let transaction;

  try {
    transaction = await User.sequelize.transaction();

    const {
      name,
      email,
      password,
      role,
      phone,
      college,
      course,
      branch,
      passingYear,
      university,
      website,
      address,
      companyName,
      officialEmail,
      industry,
      companySize,
      location,
      description,
      logo,
      categories,
    } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string"
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const userRole = role.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (!REGISTRATION_ROLES.includes(userRole)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid registration role",
      });
    }

    if (cleanName.length < 2) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (userRole === "company") {
      if (
        typeof companyName !== "string" ||
        companyName.trim().length < 2
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "Company name is required",
        });
      }

      if (
        typeof officialEmail !== "string" ||
        !emailRegex.test(officialEmail.trim())
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "A valid official company email is required",
        });
      }
    }

    const existingUser = await User.findOne({
      where: { email: cleanEmail },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create(
      {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
        isActive: true,
      },
      { transaction }
    );

    if (userRole === "student") {
      await Student.create(
        {
          userId: user.id,
          name: cleanName,
          phone: phone?.trim() || null,
          college: college?.trim() || null,
          course: course?.trim() || null,
          branch: branch?.trim() || null,
          passingYear: passingYear
            ? Number(passingYear)
            : null,
        },
        { transaction }
      );
    }

    if (userRole === "college") {
      await College.create(
        {
          userId: user.id,
          phone: phone?.trim() || null,
          university: university?.trim() || null,
          website: website?.trim() || null,
          address: address?.trim() || null,
        },
        { transaction }
      );
    }

    if (userRole === "company") {
      await Company.create(
        {
          userId: user.id,
          companyName: companyName.trim(),
          officialEmail: officialEmail.trim().toLowerCase(),
          phone: phone?.trim() || null,
          website: website?.trim() || null,
          industry: industry?.trim() || null,
          companySize: companySize?.trim() || null,
          location: location?.trim() || null,
          description: description?.trim() || null,
          logo: logo?.trim() || null,
        },
        { transaction }
      );
    }

    if (userRole === "training") {
      await TrainingInstitute.create(
        {
          userId: user.id,
          phone: phone?.trim() || null,
          website: website?.trim() || null,
          address: address?.trim() || null,
          categories: categories?.trim() || null,
        },
        { transaction }
      );
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Rollback Error:", rollbackError.message);
      }
    }

    const statusCode =
      error.name === "SequelizeUniqueConstraintError"
        ? 409
        : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 409
          ? "This email or account is already registered"
          : "Registration failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ========================================
// LOGIN
// Supports existing admin/developer users
// ========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    if (
      typeof user.password !== "string" ||
      !user.password
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const userRole =
      typeof user.role === "string"
        ? user.role.trim().toLowerCase()
        : "";

    if (!LOGIN_ROLES.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Invalid user role received from server",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: userRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

module.exports = {
  register,
  login,
};
