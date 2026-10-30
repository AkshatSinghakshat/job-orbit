
const {
  User,
  CodingPost,
  CodingProblem,
  CodingSubmission,
} = require("../models");

const { Op } = require("sequelize");

// GET ALL PUBLIC CODING POSTS
const getPosts = async (req, res) => {
  try {
    const posts = await CodingPost.findAll({
      where: { visibility: "public" },
      include: [{
        model: User,
        attributes: ["id", "name"],
      }],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, posts });
  } catch (error) {
    console.error("CodeArena getPosts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coding posts",
    });
  }
};

// CREATE CODING POST
const createPost = async (req, res) => {
  try {
    const {
      title,
      problemTitle,
      language,
      code,
      explanation,
      difficulty,
      visibility,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof language !== "string" ||
      !language.trim() ||
      typeof code !== "string" ||
      !code.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, language and code are required",
      });
    }

    const post = await CodingPost.create({
      userId: req.user.id,
      title: title.trim(),
      problemTitle: problemTitle?.trim() || null,
      language: language.trim(),
      code,
      explanation: explanation?.trim() || null,
      difficulty: ["Easy", "Medium", "Hard"].includes(difficulty)
        ? difficulty
        : null,
      visibility: visibility === "private" ? "private" : "public",
    });

    return res.status(201).json({
      success: true,
      message: "Coding post created",
      post,
    });
  } catch (error) {
    console.error("CodeArena createPost:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create coding post",
    });
  }
};

// GET PUBLISHED PROBLEMS
const getProblems = async (req, res) => {
  try {
    const { difficulty, topic, search } = req.query;
    const where = { isPublished: true };

    if (["Easy", "Medium", "Hard"].includes(difficulty)) {
      where.difficulty = difficulty;
    }

    if (topic) where.topic = topic;

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const problems = await CodingProblem.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, problems });
  } catch (error) {
    console.error("CodeArena getProblems:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
    });
  }
};

// GET ONE PROBLEM
const getProblemById = async (req, res) => {
  try {
    const problem = await CodingProblem.findOne({
      where: {
        id: req.params.id,
        isPublished: true,
      },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.json({ success: true, problem });
  } catch (error) {
    console.error("CodeArena getProblemById:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
    });
  }
};

// SAVE SUBMISSION AS PENDING
// Actual judging must be added before marking any submission Accepted.
const createSubmission = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;

    if (
      !problemId ||
      !Number.isInteger(Number(problemId)) ||
      typeof language !== "string" ||
      !language.trim() ||
      typeof code !== "string" ||
      !code.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Problem ID, language and code are required",
      });
    }

    const problem = await CodingProblem.findOne({
      where: {
        id: Number(problemId),
        isPublished: true,
      },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Published problem not found",
      });
    }

    const submission = await CodingSubmission.create({
      userId: req.user.id,
      problemId: problem.id,
      language: language.trim(),
      code,
      status: "Pending",
      passedTests: 0,
      totalTests: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Submission saved; judging is pending",
      submission,
    });
  } catch (error) {
    console.error("CodeArena createSubmission:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save submission",
    });
  }
};

// MY SUBMISSIONS
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await CodingSubmission.findAll({
      where: { userId: req.user.id },
      include: [{
        model: CodingProblem,
        attributes: ["id", "title", "difficulty"],
      }],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, submissions });
  } catch (error) {
    console.error("CodeArena getMySubmissions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
    });
  }
};

// LEADERBOARD: UNIQUE PROBLEMS WITH ACCEPTED STATUS
const getLeaderboard = async (req, res) => {
  try {
    const accepted = await CodingSubmission.findAll({
      attributes: ["userId", "problemId"],
      where: { status: "Accepted" },
      raw: true,
    });

    const solvedByUser = new Map();

    for (const item of accepted) {
      if (!solvedByUser.has(item.userId)) {
        solvedByUser.set(item.userId, new Set());
      }
      solvedByUser.get(item.userId).add(item.problemId);
    }

    const users = await User.findAll({
      attributes: ["id", "name"],
      where: {
        id: { [Op.in]: [...solvedByUser.keys()] },
      },
    });

    const leaderboard = users.map((user) => ({
      userId: user.id,
      name: user.name,
      solved: solvedByUser.get(user.id)?.size || 0,
    })).sort((a, b) => b.solved - a.solved);

    return res.json({ success: true, leaderboard });
  } catch (error) {
    console.error("CodeArena leaderboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
    });
  }
};

module.exports = {
  getPosts,
  createPost,
  getProblems,
  getProblemById,
  createSubmission,
  getMySubmissions,
  getLeaderboard,
};
