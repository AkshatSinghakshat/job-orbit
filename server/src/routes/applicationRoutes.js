
const express = require("express");

const {
  createApplication,
  getMyApplications,
  getCompanyApplications,
  updateApplicationStatus,
  getApplicationById,
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  uploadResume.single("resume"),
  createApplication
);

router.get("/my", authMiddleware, getMyApplications);

router.get("/company", authMiddleware, getCompanyApplications);

router.patch(
  "/:id/status",
  authMiddleware,
  updateApplicationStatus
);

router.get("/:id", authMiddleware, getApplicationById);


module.exports = router;
