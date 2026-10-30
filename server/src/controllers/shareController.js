const { Share, Post, User, Notification } = require("../models");

// ==========================================
// CREATE SHARE
// ==========================================

const createShare = async (req, res) => {
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

    // Save share
    await Share.create({
      postId,
      userId,
    });

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================

    // Don't notify user when sharing their own post
    if (Number(post.userId) !== Number(userId)) {
      const sharer = await User.findByPk(userId, {
        attributes: ["id", "name"],
      });

      if (sharer) {
        await Notification.create({
          recipientId: post.userId,
          senderId: userId,
          type: "share",
          message: `${sharer.name} shared your post`,
          postId: post.id,
        });
      }
    }

    // Get updated share count
    const shareCount = await Share.count({
      where: {
        postId,
      },
    });

    return res.status(201).json({
      success: true,
      shareCount,
      message: "Post shared successfully",
    });
  } catch (error) {
    console.error("Create Share Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to share post",
    });
  }
};


// ==========================================
// GET SHARE COUNT
// ==========================================

const getShareCount = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const shareCount = await Share.count({
      where: {
        postId,
      },
    });

    return res.status(200).json({
      success: true,
      shareCount,
    });
  } catch (error) {
    console.error("Get Share Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load share count",
    });
  }
};


module.exports = {
  createShare,
  getShareCount,
};