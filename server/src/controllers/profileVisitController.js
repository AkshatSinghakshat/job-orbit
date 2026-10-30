const { ProfileVisit, User } = require("../models");

// Record profile visit
const recordProfileVisit = async (req, res) => {
  try {
    const profileUserId = Number(req.params.userId);
    const visitorUserId = Number(req.user.id);

    if (!profileUserId || Number.isNaN(profileUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile user ID",
      });
    }

    // Own profile visit count nahi hoga
    if (profileUserId === visitorUserId) {
      return res.status(200).json({
        success: true,
        counted: false,
        message: "Own profile visit is not counted",
      });
    }

    const profileOwner = await User.findByPk(profileUserId);

    if (!profileOwner) {
      return res.status(404).json({
        success: false,
        message: "Profile user not found",
      });
    }

    const existingVisit = await ProfileVisit.findOne({
      where: {
        profileUserId,
        visitorUserId,
      },
    });

    if (existingVisit) {
      existingVisit.visitCount += 1;
      existingVisit.lastVisitedAt = new Date();
      await existingVisit.save();
    } else {
      await ProfileVisit.create({
        profileUserId,
        visitorUserId,
        visitCount: 1,
        lastVisitedAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      counted: true,
      message: "Profile visit recorded successfully",
    });
  } catch (error) {
    console.error("Record Profile Visit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record profile visit",
    });
  }
};

// Get profile visitors
const getProfileVisitors = async (req, res) => {
  try {
    const profileUserId = Number(req.params.userId);
    const loggedInUserId = Number(req.user.id);

    // Sirf profile owner apne visitors dekh sakta hai
    if (profileUserId !== loggedInUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own profile visitors",
      });
    }

    const visits = await ProfileVisit.findAll({
      where: {
        profileUserId,
      },
      include: [
        {
          model: User,
          as: "visitor",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["visitCount", "DESC"]],
    });

    const totalViews = visits.reduce(
      (total, visit) => total + visit.visitCount,
      0
    );

    return res.status(200).json({
      success: true,
      totalViews,
      visitors: visits,
    });
  } catch (error) {
    console.error("Get Profile Visitors Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get profile visitors",
    });
  }
};

module.exports = {
  recordProfileVisit,
  getProfileVisitors,
};