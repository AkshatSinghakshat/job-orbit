const {
  Notification,
  User,
  Post,
  Job,
} = require("../models");

// ==========================================
// GET MY NOTIFICATIONS
// ==========================================
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: {
        recipientId: userId,
      },

      include: [
        // ==========================================
        // SENDER
        // ==========================================
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "role"],
          required: false,
        },

        // ==========================================
        // POST
        // ==========================================
        {
          model: Post,
          attributes: [
            "id",
            "content",
            "mediaUrl",
            "mediaType",
            "createdAt",
          ],
          required: false,
        },

        // ==========================================
        // JOB
        // ==========================================
        {
          model: Job,
          attributes: [
            "id",
            "title",
            "location",
            "jobType",
          ],
          required: false,
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      notifications,
    });

  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};


// ==========================================
// GET UNREAD COUNT
// ==========================================

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Unread count error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
    });
  }
};


// ==========================================
// MARK ONE AS READ
// ==========================================

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: {
        id,
        recipientId: userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};


// ==========================================
// MARK ALL AS READ
// ==========================================

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      {
        isRead: true,
      },
      {
        where: {
          recipientId: userId,
          isRead: false,
        },
      }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};


// ==========================================
// DELETE NOTIFICATION
// ==========================================

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await Notification.destroy({
      where: {
        id,
        recipientId: userId,
      },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};


module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};