
const express = require("express");

const router = express.Router();

const {
  getCompanies,
  getCompanyDashboard,
  updateApplicationStatus,
} = require("../controllers/companyController");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Get all companies
router.get("/", getCompanies);

// ======================================================
// COMPANY DASHBOARD
// ======================================================

// Get logged-in company's dashboard data
router.get("/dashboard", authMiddleware, getCompanyDashboard);

// ======================================================
// APPLICATION MANAGEMENT
// ======================================================

// Update application status
router.patch(
  "/applications/:id/status",
  authMiddleware,
  updateApplicationStatus
);

module.exports = router;
