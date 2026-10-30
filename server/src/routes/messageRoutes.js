
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/messageUpload");

const {
  getConversations,
  getMessages,
  sendMessage,
  sendAttachment,
} = require("../controllers/messageController");

// Get all conversations of logged-in user
router.get("/conversations", authMiddleware, getConversations);

// Upload attachment and send it to a specific user
router.post(
  "/:userId/attachment",
  authMiddleware,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message:
            err.code === "LIMIT_FILE_SIZE"
              ? "File size must be 10 MB or less"
              : err.message || "Invalid file",
        });
      }

      next();
    });
  },
  sendAttachment
);

// Get messages with a specific user
router.get("/:userId", authMiddleware, getMessages);

// Send a text message to a specific user
router.post("/:userId", authMiddleware, sendMessage);

module.exports = router;
