const express = require("express");

const {
  getStudentDashboard,
  updateStudentProfile,
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  getStudentDashboard
);

router.put(
  "/profile",
  authMiddleware,
  uploadResume.single("resume"),
  updateStudentProfile
);

module.exports = router;