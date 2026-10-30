const {
  Comment,
  User,
  Post,
  Notification,
} = require("../models");

// ======================================================
// ADD COMMENT / REPLY
// ======================================================

const addComment = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      postId,
      content,
      parentId = null,
    } = req.body;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!postId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post ID and comment are required",
      });
    }

    // --------------------------------------------------
    // CHECK POST
    // --------------------------------------------------

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // --------------------------------------------------
    // CHECK PARENT COMMENT
    // --------------------------------------------------

    let parentComment = null;

    if (parentId) {
      parentComment = await Comment.findOne({
        where: {
          id: parentId,
          postId,
        },
      });

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }
    }

    // --------------------------------------------------
    // CREATE COMMENT / REPLY
    // --------------------------------------------------

    const comment = await Comment.create({
      postId,
      parentId: parentId || null,
      userId,
      content: content.trim(),
    });

    // --------------------------------------------------
    // GET USER
    // --------------------------------------------------

    const commenter = await User.findByPk(userId, {
      attributes: ["id", "name", "role"],
    });

    // ==================================================
    // NOTIFICATION
    // ==================================================

    // --------------------------------------------------
    // REPLY NOTIFICATION
    // --------------------------------------------------

    if (
      parentComment &&
      Number(parentComment.userId) !== Number(userId)
    ) {
      await Notification.create({
        recipientId: parentComment.userId,
        senderId: userId,
        type: "comment",
        message: `${commenter?.name || "Someone"} replied to your comment`,
        postId: post.id,
      });
    }

    // --------------------------------------------------
    // NORMAL COMMENT NOTIFICATION
    // --------------------------------------------------

    else if (
      !parentComment &&
      Number(post.userId) !== Number(userId)
    ) {
      await Notification.create({
        recipientId: post.userId,
        senderId: userId,
        type: "comment",
        message: `${commenter?.name || "Someone"} commented on your post`,
        postId: post.id,
      });
    }

    // --------------------------------------------------
    // GET COMPLETE COMMENT
    // --------------------------------------------------

    const createdComment = await Comment.findByPk(
      comment.id,
      {
        include: [
          {
            model: User,
            attributes: [
              "id",
              "name",
              "role",
            ],
          },
        ],
      }
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message: parentComment
        ? "Reply added successfully"
        : "Comment added successfully",
      comment: createdComment,
    });

  } catch (error) {

    console.error(
      "Add Comment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};


// ======================================================
// GET COMMENTS
// ======================================================

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // --------------------------------------------------
    // CHECK POST
    // --------------------------------------------------

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // --------------------------------------------------
    // GET ALL COMMENTS + REPLIES
    // --------------------------------------------------

    const comments = await Comment.findAll({
      where: {
        postId,
      },

      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "role",
          ],
        },
      ],

      order: [
        ["createdAt", "ASC"],
      ],
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });

  } catch (error) {

    console.error(
      "Get Comments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load comments",
      error: error.message,
    });
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  addComment,
  getComments,
};