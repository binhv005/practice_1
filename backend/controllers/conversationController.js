const mongoose = require("mongoose");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const Product = require("../models/Product");
const {
  searchConversations,
  searchMessages,
  searchUsers,
} = require("../services/messageService");

// =========================================================
// GET CONVERSATIONS
// =========================================================

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "fullname avatar status",
      })
      .populate({
        path: "product",
        select: "title images category address status featured",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullname avatar",
        },
      })
      .sort({
        lastMessageAt: -1,
        updatedAt: -1,
      })
      .lean();

    const result = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: {
            $ne: userId,
          },
          readBy: {
            $ne: userId,
          },
          deletedAt: null,
        });

        const otherParticipant = conversation.participants.find(
          (participant) => participant._id.toString() !== userId.toString(),
        );

        return {
          ...conversation,
          otherParticipant: otherParticipant || null,
          unreadCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      conversations: result,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách cuộc trò chuyện",
    });
  }
};

// =========================================================
// CREATE CONVERSATION
// =========================================================

const createConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const { userId, productId } = req.body;

    // =====================================================
    // VALIDATE USER
    // =====================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId là bắt buộc",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "userId không hợp lệ",
      });
    }

    if (currentUserId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Không thể tạo cuộc trò chuyện với chính mình",
      });
    }

    // =====================================================
    // VALIDATE PRODUCT
    // =====================================================

    let product = null;

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: "productId không hợp lệ",
        });
      }

      product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Sản phẩm không tồn tại",
        });
      }
    }

    // =====================================================
    // FIND TARGET USER
    // =====================================================

    const targetUser = await User.findById(userId).select(
      "fullname avatar status blockedUsers",
    );

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    if (targetUser.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "Không thể trò chuyện với tài khoản đã bị khóa",
      });
    }

    if (targetUser.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản này chưa được kích hoạt",
      });
    }

    // =====================================================
    // CHECK BLOCK
    // =====================================================

    const currentUser =
      await User.findById(currentUserId).select("blockedUsers");

    const blockedByCurrentUser = currentUser?.blockedUsers?.some(
      (id) => id.toString() === userId.toString(),
    );

    const blockedByTargetUser = targetUser?.blockedUsers?.some(
      (id) => id.toString() === currentUserId.toString(),
    );

    if (blockedByCurrentUser || blockedByTargetUser) {
      return res.status(403).json({
        success: false,
        message: "Không thể tạo cuộc trò chuyện với người dùng này",
      });
    }

    // =====================================================
    // FIND EXISTING CONVERSATION
    // =====================================================

    /*
     * Nếu có productId:
     *
     * tìm conversation giữa 2 người
     * liên quan tới sản phẩm đó.
     *
     * Điều này cho phép:
     *
     * User A
     *   ├── chat về iPhone
     *   └── chat về Laptop
     *
     * trở thành 2 conversation khác nhau.
     */

    let conversation = null;

    if (productId) {
      conversation = await Conversation.findOne({
        participants: {
          $all: [currentUserId, userId],
        },

        product: productId,
      });
    } else {
      conversation = await Conversation.findOne({
        participants: {
          $all: [currentUserId, userId],
        },

        $or: [
          {
            product: null,
          },
          {
            product: {
              $exists: false,
            },
          },
        ],
      });
    }

    // =====================================================
    // CREATE
    // =====================================================

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, userId],

        product: productId || null,
      });
    }

    // =====================================================
    // POPULATE
    // =====================================================

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate({
        path: "participants",
        select: "fullname avatar status bio",
      })
      .populate({
        path: "product",
        select:
          "title description images category address status featured interestCount createdAt",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullname avatar",
        },
      })
      .lean();

    const otherParticipant = populatedConversation.participants?.find(
      (participant) =>
        participant._id?.toString() !== currentUserId.toString(),
    );

    return res.status(200).json({
      success: true,
      conversation: {
        ...populatedConversation,
        otherParticipant: otherParticipant || null,
        unreadCount: 0,
      },
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể tạo cuộc trò chuyện",
    });
  }
};

// =========================================================
// GET CONVERSATION
// =========================================================

const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "conversationId không hợp lệ",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "fullname avatar status bio",
      })
      .populate({
        path: "product",
        select:
          "title description images category address status featured interestCount createdAt",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullname avatar",
        },
      })
      .lean();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Cuộc trò chuyện không tồn tại",
      });
    }

    const otherParticipant = conversation.participants?.find(
      (participant) => participant._id?.toString() !== userId.toString(),
    );

    const unreadCount = await Message.countDocuments({
      conversation: conversation._id,
      sender: {
        $ne: userId,
      },
      readBy: {
        $ne: userId,
      },
      deletedAt: null,
    });

    return res.status(200).json({
      success: true,
      conversation: {
        ...conversation,
        otherParticipant: otherParticipant || null,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Get conversation error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy cuộc trò chuyện",
    });
  }
};

// =========================================================
// GET MESSAGES
// =========================================================

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "conversationId không hợp lệ",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Bạn không có quyền truy cập cuộc trò chuyện này",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({
        conversation: conversationId,

        deletedAt: null,
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

        deletedAt: null,
      }),
    ]);

    messages.reverse();

    return res.status(200).json({
      success: true,

      messages,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),

        hasMore: skip + messages.length < total,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy tin nhắn",
    });
  }
};

// =========================================================
// SEND MESSAGE
// =========================================================

const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const userId = req.user._id;

    const { content, type, image } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "conversationId không hợp lệ",
      });
    }

    const messageType = type === "image" ? "image" : "text";
    const messageContent = typeof content === "string" ? content.trim() : "";
    const messageImage =
      typeof image === "string" && image.trim()
        ? image.trim()
        : messageType === "image"
          ? messageContent
          : null;

    if (messageType === "text" && !messageContent) {
      return res.status(400).json({
        success: false,
        message: "Nội dung tin nhắn không được để trống",
      });
    }

    if (messageType === "image" && !messageImage) {
      return res.status(400).json({
        success: false,
        message: "Hình ảnh không hợp lệ",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Cuộc trò chuyện không tồn tại",
      });
    }

    // =====================================================
    // CREATE MESSAGE
    // =====================================================

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      type: messageType,
      image: messageImage,
      content: messageContent || (messageType === "image" ? "[Hình ảnh]" : ""),
      readBy: [userId],
    });

    // =====================================================
    // UPDATE CONVERSATION
    // =====================================================

    conversation.lastMessage = message._id;

    conversation.lastMessageAt = message.createdAt;

    await conversation.save();

    // =====================================================
    // POPULATE MESSAGE
    // =====================================================

    const populatedMessage = await Message.findById(message._id)
      .populate({
        path: "sender",
        select: "fullname avatar status",
      })
      .lean();

    // =====================================================
    // SOCKET
    // =====================================================

    const io = req.app.get("io");

    if (io) {
      io.to(`conversation:${conversationId}`).emit(
        "message:new",
        populatedMessage,
      );
    }

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

// =========================================================
// MARK AS READ
// =========================================================

const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "conversationId không hợp lệ",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Cuộc trò chuyện không tồn tại",
      });
    }

    const result = await Message.updateMany(
      {
        conversation: conversationId,

        sender: {
          $ne: userId,
        },

        readBy: {
          $ne: userId,
        },

        deletedAt: null,
      },

      {
        $addToSet: {
          readBy: userId,
        },
      },
    );

    return res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark conversation read error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể đánh dấu đã đọc",
    });
  }
};

// =========================================================
// SEARCH CONVERSATIONS
// =========================================================

const searchConversationsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Từ khóa tìm kiếm không hợp lệ",
      });
    }

    const results = await searchConversations(userId, keyword);

    return res.status(200).json({
      success: true,
      conversations: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Search conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể tìm kiếm cuộc trò chuyện",
    });
  }
};

// =========================================================
// SEARCH MESSAGES IN CONVERSATION
// =========================================================

const searchMessagesController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { keyword, page = 1, limit = 30 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "conversationId không hợp lệ",
      });
    }

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Từ khóa tìm kiếm không hợp lệ",
      });
    }

    const results = await searchMessages(
      conversationId,
      userId,
      keyword,
      Number(page),
      Number(limit),
    );

    return res.status(200).json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Search messages error:", error);

    if (error.message === "Conversation not found or access denied") {
      return res.status(404).json({
        success: false,
        message: "Cuộc trò chuyện không tồn tại hoặc bạn không có quyền truy cập",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Không thể tìm kiếm tin nhắn",
    });
  }
};

// =========================================================
// SEARCH USERS
// =========================================================

const searchUsersController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { keyword, limit = 10 } = req.query;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Từ khóa tìm kiếm không hợp lệ",
      });
    }

    const results = await searchUsers(userId, keyword, Number(limit));

    return res.status(200).json({
      success: true,
      users: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Search users error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể tìm kiếm người dùng",
    });
  }
};

module.exports = {
  getConversations,
  createConversation,
  getConversation,
  getMessages,
  sendMessage,
  markConversationAsRead,
  searchConversationsController,
  searchMessagesController,
  searchUsersController,
};
