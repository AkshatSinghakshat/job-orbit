const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  createPost,
  getFeed,

  // Save / Unsave
  savePost,
  unsavePost,

  // Reaction
  reactToPost,
  removeReaction,

  // Repost
  repostPost,
  removeRepost,

  // Edit / Delete
  updatePost,
  deletePost,

  // Report
  reportPost,

  // Comments
  getComments,
  addComment,
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      `${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

// ======================================================
// FILE UPLOAD CONFIG
// ======================================================

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",

      // Videos
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image and video files are allowed"
        )
      );
    }
  },
});

// ======================================================
// CREATE POST
// POST /api/posts
// ======================================================

router.post(
  "/",
  authMiddleware,
  upload.single("media"),
  createPost
);

// ======================================================
// GET FEED
// GET /api/posts/feed
// ======================================================

router.get(
  "/feed",
  authMiddleware,
  getFeed
);

// ======================================================
// SAVE POST
// POST /api/posts/:id/save
// ======================================================

router.post(
  "/:id/save",
  authMiddleware,
  savePost
);

// ======================================================
// UNSAVE POST
// DELETE /api/posts/:id/save
// ======================================================

router.delete(
  "/:id/save",
  authMiddleware,
  unsavePost
);

// ======================================================
// REACTION
// POST /api/posts/:id/reaction
// ======================================================

router.post(
  "/:id/reaction",
  authMiddleware,
  reactToPost
);

// ======================================================
// REMOVE REACTION
// DELETE /api/posts/:id/reaction
// ======================================================

router.delete(
  "/:id/reaction",
  authMiddleware,
  removeReaction
);

// ======================================================
// REPOST
// POST /api/posts/:id/repost
// ======================================================

router.post(
  "/:id/repost",
  authMiddleware,
  repostPost
);

// ======================================================
// REMOVE REPOST
// DELETE /api/posts/:id/repost
// ======================================================

router.delete(
  "/:id/repost",
  authMiddleware,
  removeRepost
);

// ======================================================
// EDIT POST
// PUT /api/posts/:id
// ======================================================

router.put(
  "/:id",
  authMiddleware,
  updatePost
);

// ======================================================
// DELETE POST
// DELETE /api/posts/:id
// ======================================================

router.delete(
  "/:id",
  authMiddleware,
  deletePost
);

// ======================================================
// REPORT POST
// POST /api/posts/:id/report
// ======================================================

router.post(
  "/:id/report",
  authMiddleware,
  reportPost
);

// ======================================================
// GET COMMENTS
// GET /api/posts/:id/comments
// ======================================================

router.get(
  "/:id/comments",
  authMiddleware,
  getComments
);

// ======================================================
// ADD COMMENT / REPLY
// POST /api/posts/:id/comments
// ======================================================

router.post(
  "/:id/comments",
  authMiddleware,
  addComment
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;