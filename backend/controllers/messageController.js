const mongoose = require("mongoose");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

/**
 * Kiểm tra user hiện tại có thuộc conversation hay không.
 */
const getAuthorizedConversation = async (conversationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return null;
  }

  return Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });
};

/**
 * Lấy lịch sử message.
 *
 * GET /api/conversations/:conversationId/messages
 *
 * Query:
 * ?page=1&limit=30
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await getAuthorizedConversation(
      conversationId,
      currentUserId,
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message:
          "Cuộc trò chuyện không tồn tại hoặc bạn không có quyền truy cập",
      });
    }

    let page = Number.parseInt(req.query.page, 10) || 1;
    let limit = Number.parseInt(req.query.limit, 10) || 30;

    /**
     * Giới hạn để tránh client request quá nhiều message.
     */
    page = Math.max(page, 1);
    limit = Math.min(Math.max(limit, 1), 100);

    const skip = (page - 1) * limit;

    const [messages, totalMessages] = await Promise.all([
      Message.find({
        conversation: conversationId,
      })
        .populate({
          path: "sender",
          select: "fullname avatar status",
        })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Message.countDocuments({
        conversation: conversationId,
      }),
    ]);

    /**
     * API lấy từ mới -> cũ để pagination dễ xử lý.
     *
     * Frontend có thể reverse nếu muốn hiển thị
     * message cũ ở trên và message mới ở dưới.
     */
    const totalPages = Math.ceil(totalMessages / limit);

    return res.status(200).json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        totalMessages,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy lịch sử tin nhắn",
    });
  }
};

/**
 * Gửi message bằng REST API.
 *
 * Đây là fallback.
 *
 * Realtime chính sẽ được xử lý bằng Socket.IO ở phase tiếp theo.
 *
 * POST /api/conversations/:conversationId/messages
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;
    const { content } = req.body;

    const conversation = await getAuthorizedConversation(
      conversationId,
      currentUserId,
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message:
          "Cuộc trò chuyện không tồn tại hoặc bạn không có quyền truy cập",
      });
    }

    if (typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nội dung tin nhắn không hợp lệ",
      });
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return res.status(400).json({
        success: false,
        message: "Tin nhắn không được để trống",
      });
    }

    if (trimmedContent.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Tin nhắn không được vượt quá 5000 ký tự",
      });
    }

    /**
     * Kiểm tra user còn lại có block current user
     * hoặc current user block người còn lại hay không.
     *
     * Logic này sẽ được hoàn thiện thêm nếu project
     * có API block/unblock riêng.
     */
    const otherParticipantId = conversation.participants.find(
      (participantId) => participantId.toString() !== currentUserId.toString(),
    );

    if (!otherParticipantId) {
      return res.status(400).json({
        success: false,
        message: "Conversation không hợp lệ",
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: currentUserId,
      content: trimmedContent,
      readBy: [currentUserId],
    });

    /**
     * Update conversation preview.
     */
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;

    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate({
        path: "sender",
        select: "fullname avatar status",
      })
      .lean();

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể gửi tin nhắn",
    });
  }
};

/**
 * Đánh dấu một message cụ thể là đã đọc.
 *
 * PATCH /api/messages/:messageId/read
 */
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: "messageId không hợp lệ",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Tin nhắn không tồn tại",
      });
    }

    const conversation = await Conversation.findOne({
      _id: message.conversation,
      participants: currentUserId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập tin nhắn này",
      });
    }

    await Message.updateOne(
      {
        _id: messageId,
      },
      {
        $addToSet: {
          readBy: currentUserId,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Đã đánh dấu tin nhắn là đã đọc",
    });
  } catch (error) {
    console.error("Mark message as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể đánh dấu tin nhắn đã đọc",
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  markMessageAsRead,
};
