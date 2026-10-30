
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
} = require("../controllers/resumeController");

// All resume routes require authentication
router.use(authMiddleware);

// Create a new resume
router.post("/", createResume);

// Get all resumes of the logged-in user
router.get("/", getResumes);

// Get a single resume by ID
router.get("/:id", getResumeById);

// Update a resume
router.put("/:id", updateResume);

// Delete a resume
router.delete("/:id", deleteResume);

module.exports = router;
