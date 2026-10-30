const express = require("express");

const {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
} = require("../controllers/followController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Follow / Unfollow
router.post("/", authMiddleware, toggleFollow);

// Follow status
router.get(
  "/status/:userId",
  authMiddleware,
  getFollowStatus
);

// Followers list
router.get(
  "/followers/:userId",
  authMiddleware,
  getFollowers
);

// Following list
router.get(
  "/following/:userId",
  authMiddleware,
  getFollowing
);

module.exports = router;