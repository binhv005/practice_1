const express = require("express");

const {
  getMessages,
  sendMessage,
  markMessageAsRead,
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /api/messages/:messageId/read
 * Mark a specific message as read
 */
router.patch("/:messageId/read", markMessageAsRead);

module.exports = router;
