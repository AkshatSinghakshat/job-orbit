const express = require("express");

const {
  toggleLike,
  getLikeStatus,
} = require("../controllers/likeController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Like / Unlike
router.post("/", authMiddleware, toggleLike);

// Get like status + count
router.get("/:postId", authMiddleware, getLikeStatus);

module.exports = router;