const express = require("express");

const {
  getJobs,
  getJobById,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getJobApplications,
} = require("../controllers/jobController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Get all jobs
router.get("/", getJobs);

// ======================================================
// COMPANY ROUTES
// ======================================================

// Get logged-in company's jobs
router.get("/company/my-jobs", authMiddleware, getMyJobs);

// Create new job
router.post("/", authMiddleware, createJob);

// Get applications of a job
router.get(
  "/:id/applications",
  authMiddleware,
  getJobApplications
);

// Update job
router.put("/:id", authMiddleware, updateJob);

// Delete job
router.delete("/:id", authMiddleware, deleteJob);

// Get single job
router.get("/:id", getJobById);

module.exports = router;