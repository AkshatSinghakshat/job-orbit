const { Like, Post, User, Notification } = require("../models");

// ==========================================
// TOGGLE LIKE
// ==========================================

const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    // Check post exists
    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const existingLike = await Like.findOne({
      where: {
        postId,
        userId,
      },
    });

    // ==========================================
    // UNLIKE
    // ==========================================

    if (existingLike) {
      await existingLike.destroy();

      const likeCount = await Like.count({
        where: {
          postId,
        },
      });

      return res.status(200).json({
        success: true,
        liked: false,
        likeCount,
        message: "Post unliked successfully",
      });
    }

    // ==========================================
    // LIKE
    // ==========================================

    await Like.create({
      postId,
      userId,
    });

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================

    // Don't notify user if they like their own post
    if (Number(post.userId) !== Number(userId)) {
      const liker = await User.findByPk(userId, {
        attributes: ["id", "name"],
      });

      if (liker) {
        await Notification.create({
          recipientId: post.userId,
          senderId: userId,
          type: "like",
          message: `${liker.name} liked your post`,
          postId: post.id,
        });
      }
    }

    const likeCount = await Like.count({
      where: {
        postId,
      },
    });

    return res.status(201).json({
      success: true,
      liked: true,
      likeCount,
      message: "Post liked successfully",
    });
  } catch (error) {
    console.error("Toggle Like Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update like",
    });
  }
};

// ==========================================
// GET LIKE STATUS
// ==========================================

const getLikeStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const liked = await Like.findOne({
      where: {
        postId,
        userId,
      },
    });

    const likeCount = await Like.count({
      where: {
        postId,
      },
    });

    return res.status(200).json({
      success: true,
      liked: !!liked,
      likeCount,
    });
  } catch (error) {
    console.error("Get Like Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load like status",
    });
  }
};

module.exports = {
  toggleLike,
  getLikeStatus,
};