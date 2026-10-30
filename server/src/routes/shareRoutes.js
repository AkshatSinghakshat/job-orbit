const express = require("express");

const {
  createShare,
  getShareCount,
} = require("../controllers/shareController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Share post
router.post("/", authMiddleware, createShare);

// Get share count
router.get("/:postId", authMiddleware, getShareCount);

module.exports = router;