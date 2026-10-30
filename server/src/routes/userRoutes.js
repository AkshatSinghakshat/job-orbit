const express = require("express");

const {
  getUserProfile,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const { Op } = require("sequelize");
const { User } = require("../models");


// GET /api/users/directory
router.get("/directory", authMiddleware, async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const currentRole = req.user.role;

    let targetRole;

    if (currentRole === "student") {
      targetRole = "company";
    } else if (currentRole === "company") {
      targetRole = "student";
    } else {
      return res.status(403).json({
        success: false,
        message: "Messaging is not available for this role",
      });
    }

    const users = await User.findAll({
      where: {
        role: targetRole,
        id: { [Op.ne]: currentUserId },
      },
      attributes: ["id", "name", "role"],
      order: [["name", "ASC"]],
    });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("User directory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
});
router.get(
  "/:userId",
  authMiddleware,
  getUserProfile
);

module.exports = router;