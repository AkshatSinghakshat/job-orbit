const {
  Post,
  User,
  SavedPost,
  PostReaction,
  Repost,
  PostReport,
  Comment,
} = require("../models");


// =====================================================
// CREATE POST
// =====================================================

const createPost = async (req, res) => {
  try {
    const userId = req.user.id;

    const { content, visibility } = req.body;

    if (
      (!content || !content.trim()) &&
      !req.file
    ) {
      return res.status(400).json({
        success: false,
        message: "Post content or media is required",
      });
    }

    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;

      if (req.file.mimetype.startsWith("image/")) {
        mediaType = "image";
      } else if (
        req.file.mimetype.startsWith("video/")
      ) {
        mediaType = "video";
      }
    }

    const post = await Post.create({
      userId,
      content: content?.trim() || null,
      mediaUrl,
      mediaType,
      visibility:
        visibility === "followers"
          ? "followers"
          : "public",
    });

    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "email",
            "role",
          ],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: createdPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create post",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// =====================================================
// GET FEED
// =====================================================

const getFeed = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "email",
            "role",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  
  } catch (error) {
    console.error("GET FEED ERROR:", error);
    console.error("GET FEED SQL:", error.sql);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch feed",
      error: error.message,
    });
  }

};


// =====================================================
// SAVE POST
// =====================================================

const savePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const existing = await SavedPost.findOne({
      where: {
        userId,
        postId,
      },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Post already saved",
        saved: true,
      });
    }

    await SavedPost.create({
      userId,
      postId,
    });

    return res.status(201).json({
      success: true,
      message: "Post saved successfully",
      saved: true,
    });
  } catch (error) {
    console.error("Save Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save post",
    });
  }
};


// =====================================================
// UNSAVE POST
// =====================================================

const unsavePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    await SavedPost.destroy({
      where: {
        userId,
        postId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Post removed from saved posts",
      saved: false,
    });
  } catch (error) {
    console.error("Unsave Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unsave post",
    });
  }
};


// =====================================================
// REACTION
// =====================================================

const reactToPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const { reaction = "like" } = req.body;

    const allowedReactions = [
      "like",
      "love",
      "haha",
      "wow",
      "sad",
      "angry",
    ];

    if (!allowedReactions.includes(reaction)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reaction",
      });
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const existing = await PostReaction.findOne({
      where: {
        userId,
        postId,
      },
    });

    if (existing) {
      existing.reaction = reaction;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Reaction updated",
        reaction,
      });
    }

    await PostReaction.create({
      userId,
      postId,
      reaction,
    });

    return res.status(201).json({
      success: true,
      message: "Reaction added",
      reaction,
    });
  } catch (error) {
    console.error("React Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to react to post",
    });
  }
};


// =====================================================
// REMOVE REACTION
// =====================================================

const removeReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    await PostReaction.destroy({
      where: {
        userId,
        postId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Reaction removed",
      reaction: null,
    });
  } catch (error) {
    console.error("Remove Reaction Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove reaction",
    });
  }
};


// =====================================================
// REPOST
// =====================================================

const repostPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const existing = await Repost.findOne({
      where: {
        userId,
        postId,
      },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Post already reposted",
        reposted: true,
      });
    }

    await Repost.create({
      userId,
      postId,
    });

    return res.status(201).json({
      success: true,
      message: "Post reposted successfully",
      reposted: true,
    });
  } catch (error) {
    console.error("Repost Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to repost post",
    });
  }
};


// =====================================================
// REMOVE REPOST
// =====================================================

const removeRepost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    await Repost.destroy({
      where: {
        userId,
        postId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Repost removed",
      reposted: false,
    });
  } catch (error) {
    console.error("Remove Repost Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove repost",
    });
  }
};


// =====================================================
// EDIT POST
// =====================================================

const updatePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const { content, visibility } = req.body;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own post",
      });
    }

    if (content !== undefined) {
      post.content = content?.trim() || null;
    }

    if (visibility !== undefined) {
      post.visibility =
        visibility === "followers"
          ? "followers"
          : "public";
    }

    await post.save();

    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "email",
            "role",
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update post",
    });
  }
};


// =====================================================
// DELETE POST
// =====================================================

const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own post",
      });
    }

    await post.destroy();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
};

// =====================================================
// GET COMMENTS
// =====================================================

const getComments = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

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
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get Comments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load comments",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// =====================================================
// REPORT POST
// =====================================================

const reportPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Report reason is required",
      });
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const existing = await PostReport.findOne({
      where: {
        userId,
        postId,
      },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "You already reported this post",
      });
    }

    await PostReport.create({
      userId,
      postId,
      reason: reason.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Post reported successfully",
    });
  } catch (error) {
    console.error("Report Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to report post",
    });
  }
};


// =====================================================
// ADD COMMENT
// =====================================================

const addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const { content, parentId = null } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (parentId) {
      const parentComment = await Comment.findOne({
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

    const comment = await Comment.create({
      postId,
      userId,
      content: content.trim(),
      parentId,
    });

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

    return res.status(201).json({
      success: true,
      message: parentId
        ? "Reply added successfully"
        : "Comment added successfully",
      comment: createdComment,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

module.exports = {
  createPost,
  getFeed,

  savePost,
  unsavePost,

  reactToPost,
  removeReaction,

  repostPost,
  removeRepost,

  updatePost,
  deletePost,

  reportPost,

  getComments,
  addComment,
};