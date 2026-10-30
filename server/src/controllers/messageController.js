
const { Op } = require("sequelize");
const { User, Message } = require("../models");

// All supported user roles can message each other
const normalizeRole = (role) =>
  String(role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

const allowedRoles = new Set([
  "student",
  "college",
  "training",
  "training_institute",
  "company",
]);

const canMessage = (role1, role2) => {
  const senderRole = normalizeRole(role1);
  const recipientRole = normalizeRole(role2);

  return (
    allowedRoles.has(senderRole) &&
    allowedRoles.has(recipientRole)
  );
};

// Reusable sender and recipient details
const messageInclude = [
  {
    model: User,
    as: "sender",
    attributes: ["id", "name", "role"],
  },
  {
    model: User,
    as: "recipient",
    attributes: ["id", "name", "role"],
  },
];

const getRoleLabel = (role) => {
  const labels = {
    student: "Student",
    college: "College",
    training: "Training Institute",
    training_institute: "Training Institute",
    company: "Company",
  };

  return labels[normalizeRole(role)] || "User";
};

// GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const currentUserId = Number(req.user?.id);
    const currentRole = req.user?.role;

    if (
      !Number.isInteger(currentUserId) ||
      currentUserId <= 0
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.has(normalizeRole(currentRole))) {
      return res.status(403).json({
        success: false,
        message: "Messaging is not available for this account",
      });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId },
          { recipientId: currentUserId },
        ],
      },
      include: messageInclude,
      order: [["createdAt", "DESC"]],
    });

    const conversations = new Map();

    for (const message of messages) {
      const otherUser =
        Number(message.senderId) === currentUserId
          ? message.recipient
          : message.sender;

      if (
        !otherUser ||
        !canMessage(currentRole, otherUser.role)
      ) {
        continue;
      }

      const otherId = Number(otherUser.id);

      if (conversations.has(otherId)) {
        continue;
      }

      const unreadCount = await Message.count({
        where: {
          senderId: otherId,
          recipientId: currentUserId,
          readAt: null,
        },
      });

      conversations.set(otherId, {
        id: otherId,
        name: otherUser.name,
        role: otherUser.role,
        avatar: null,
        subtitle: getRoleLabel(otherUser.role),
        lastMessage:
          message.content ||
          message.attachmentName ||
          (message.attachmentUrl ? "📎 Attachment" : ""),
        lastMessageAt: message.createdAt,
        unreadCount,
      });
    }

    return res.status(200).json({
      success: true,
      conversations: Array.from(conversations.values()),
    });
  } catch (error) {
    console.error("Get conversations error:", error.message);
    if (error.sql) console.error("SQL:", error.sql);

    return res.status(500).json({
      success: false,
      message: "Failed to load conversations",
    });
  }
};

// GET /api/messages/:userId
const getMessages = async (req, res) => {
  try {
    const currentUserId = Number(req.user?.id);
    const otherUserId = Number(req.params.userId);

    if (
      !Number.isInteger(currentUserId) ||
      currentUserId <= 0 ||
      !Number.isInteger(otherUserId) ||
      otherUserId <= 0 ||
      otherUserId === currentUserId
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient",
      });
    }

    const otherUser = await User.findByPk(otherUserId);

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!canMessage(req.user?.role, otherUser.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to message this user",
      });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          {
            senderId: currentUserId,
            recipientId: otherUserId,
          },
          {
            senderId: otherUserId,
            recipientId: currentUserId,
          },
        ],
      },
      include: messageInclude,
      order: [["createdAt", "ASC"]],
    });

    await Message.update(
      { readAt: new Date() },
      {
        where: {
          senderId: otherUserId,
          recipientId: currentUserId,
          readAt: null,
        },
      }
    );

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error.message);
    if (error.sql) console.error("SQL:", error.sql);

    return res.status(500).json({
      success: false,
      message: "Failed to load messages",
    });
  }
};

// POST /api/messages/:userId
const sendMessage = async (req, res) => {
  try {
    const senderId = Number(req.user?.id);
    const recipientId = Number(req.params.userId);

    const content =
      typeof req.body?.content === "string"
        ? req.body.content.trim()
        : "";

    if (
      !Number.isInteger(senderId) ||
      senderId <= 0 ||
      !Number.isInteger(recipientId) ||
      recipientId <= 0 ||
      recipientId === senderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient",
      });
    }

    if (!content || content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message must contain 1–5000 characters",
      });
    }

    const recipient = await User.findByPk(recipientId);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!canMessage(req.user?.role, recipient.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to message this user",
      });
    }

    const message = await Message.create({
      senderId,
      recipientId,
      content,
    });

    const savedMessage = await Message.findByPk(message.id, {
      include: messageInclude,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    if (error.sql) console.error("SQL:", error.sql);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

// POST /api/messages/:userId/attachment
const sendAttachment = async (req, res) => {
  try {
    const senderId = Number(req.user?.id);
    const recipientId = Number(req.params.userId);

    if (
      !Number.isInteger(senderId) ||
      senderId <= 0 ||
      !Number.isInteger(recipientId) ||
      recipientId <= 0 ||
      recipientId === senderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient",
      });
    }

    const recipient = await User.findByPk(recipientId);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!canMessage(req.user?.role, recipient.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to message this user",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid file",
      });
    }

    const message = await Message.create({
      senderId,
      recipientId,
      content: "",
      attachmentUrl: `/uploads/messages/${req.file.filename}`,
      attachmentName: req.file.originalname,
      attachmentType: req.file.mimetype,
      attachmentSize: req.file.size,
    });

    const savedMessage = await Message.findByPk(message.id, {
      include: messageInclude,
    });

    return res.status(201).json({
      success: true,
      message: "File sent successfully",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Send attachment error:", error.message);
    if (error.sql) console.error("SQL:", error.sql);

    return res.status(500).json({
      success: false,
      message: "Failed to send file",
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  sendAttachment,
};
