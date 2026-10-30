
const express = require("express");
const router = express.Router();

const developerAuth = require("../middleware/developerAuth");
const developerController = require("../controllers/developerController");

// All routes below require a verified Developer account.
router.use(developerAuth);

// Dashboard
router.get("/stats", developerController.getDashboardStats);

// User management
router.get("/users", developerController.getUsers);
router.patch("/users/:id/status", developerController.updateUserStatus);
router.delete("/users/:id", developerController.deleteUser);

// Job management
router.get("/jobs", developerController.getJobs);
router.delete("/jobs/:id", developerController.deleteJob);

module.exports = router;
