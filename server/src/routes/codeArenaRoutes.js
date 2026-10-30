
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getPosts,
  createPost,
  getProblems,
  getProblemById,
  createSubmission,
  getMySubmissions,
  getLeaderboard,
} = require("../controllers/codeArenaController");

router.get("/posts", getPosts);
router.post("/posts", authMiddleware, createPost);

router.get("/problems", getProblems);
router.get("/problems/:id", getProblemById);

router.post("/submissions", authMiddleware, createSubmission);
router.get("/submissions/my", authMiddleware, getMySubmissions);

router.get("/leaderboard", getLeaderboard);

module.exports = router;
