const express = require("express");

const {
  getConversations,
  createConversation,
  getConversation,
  getMessages,
  sendMessage,
  markConversationAsRead,
  searchConversationsController,
  searchMessagesController,
  searchUsersController,
} = require("../controllers/conversationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Search routes - Đặt trước các routes có params để tránh conflict
router.get("/search", searchConversationsController);
router.get("/search-users", searchUsersController);

router.get("/", getConversations);

router.post("/", createConversation);

router.get("/:conversationId", getConversation);

router.get("/:conversationId/messages", getMessages);

router.get("/:conversationId/messages/search", searchMessagesController);

router.post("/:conversationId/messages", sendMessage);

router.patch("/:conversationId/read", markConversationAsRead);

module.exports = router;
