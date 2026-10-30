const { Follow, User, Notification } = require("../models");

// ===============================
// FOLLOW / UNFOLLOW USER
// ===============================
const toggleFollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { followingId } = req.body;

    if (!followingId) {
      return res.status(400).json({
        success: false,
        message: "Following user ID is required",
      });
    }

    if (Number(followerId) === Number(followingId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Check target user exists
    const targetUser = await User.findByPk(followingId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check existing follow
    const existingFollow = await Follow.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    // ===============================
    // UNFOLLOW
    // ===============================
    if (existingFollow) {
      await existingFollow.destroy();

      const followersCount = await Follow.count({
        where: { followingId },
      });

      return res.status(200).json({
        success: true,
        following: false,
        followersCount,
        message: "Unfollowed successfully",
      });
    }

    // ===============================
    // FOLLOW
    // ===============================
    await Follow.create({
      followerId,
      followingId,
    });

    // Get follower information
    const followerUser = await User.findByPk(followerId, {
      attributes: ["id", "name"],
    });

    // ===============================
    // CREATE NOTIFICATION
    // ===============================
    await Notification.create({
      recipientId: followingId,
      senderId: followerId,
      type: "follow",
      message: `${followerUser.name} started following you`,
    });

    const followersCount = await Follow.count({
      where: { followingId },
    });

    return res.status(201).json({
      success: true,
      following: true,
      followersCount,
      message: "Followed successfully",
    });
  } catch (error) {
    console.error("Toggle Follow Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update follow status",
    });
  }
};


// ===============================
// GET FOLLOW STATUS
// ===============================
const getFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const following = await Follow.findOne({
      where: {
        followerId,
        followingId: userId,
      },
    });

    const followersCount = await Follow.count({
      where: {
        followingId: userId,
      },
    });

    const followingCount = await Follow.count({
      where: {
        followerId: userId,
      },
    });

    return res.status(200).json({
      success: true,
      following: !!following,
      followersCount,
      followingCount,
    });
  } catch (error) {
    console.error("Get Follow Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load follow status",
    });
  }
};


// ===============================
// GET FOLLOWERS
// ===============================
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const followers = await Follow.findAll({
      where: {
        followingId: userId,
      },
      include: [
        {
          model: User,
          as: "follower",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      followers,
      count: followers.length,
    });
  } catch (error) {
    console.error("Get Followers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load followers",
    });
  }
};


// ===============================
// GET FOLLOWING
// ===============================
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await Follow.findAll({
      where: {
        followerId: userId,
      },
      include: [
        {
          model: User,
          as: "followingUser",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      following,
      count: following.length,
    });
  } catch (error) {
    console.error("Get Following Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load following list",
    });
  }
};


module.exports = {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
};