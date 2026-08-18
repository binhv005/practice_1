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

    // Use aggregation pipeline for better performance
    const conversations = await Conversation.find({
      participants: userId,
    })
      .select('participants product lastMessage lastMessageAt createdAt updatedAt') // Only select needed fields
      .populate({
        path: "participants",
        select: "fullname avatar status", // Remove bio to reduce payload
      })
      .populate({
        path: "product",
        select: "title images category status", // Reduced fields
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate({
        path: "lastMessage",
        select: 'sender content type image images createdAt', // Include images field
        populate: {
          path: "sender",
          select: "fullname avatar",
        },
      })
      .sort({
        lastMessageAt: -1,
      })
      .lean(); // Use lean() for better performance

    // Batch query for unread counts - more efficient than individual queries
    const conversationIds = conversations.map(c => c._id);
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          sender: { $ne: userId },
          readBy: { $ne: userId },
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$conversation',
          count: { $sum: 1 },
        },
      },
    ]);

    // Create a map for quick lookup
    const unreadMap = {};
    unreadCounts.forEach(item => {
      unreadMap[item._id.toString()] = item.count;
    });

    const result = conversations.map(conversation => {
      const otherParticipant = conversation.participants.find(
        (participant) => participant._id.toString() !== userId.toString(),
      );

      return {
        ...conversation,
        otherParticipant: otherParticipant || null,
        unreadCount: unreadMap[conversation._id.toString()] || 0,
      };
    });

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
    // VALIDATE PRODUCT (if provided)
    // =====================================================

    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "productId không hợp lệ",
      });
    }

    // Parallel validation for better performance
    const [targetUser, product] = await Promise.all([
      User.findById(userId).select("fullname avatar status blockedUsers").lean(),
      productId ? Product.findById(productId).select('_id').lean() : null,
    ]);

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

    if (productId && !product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
      });
    }

    // =====================================================
    // CHECK BLOCK
    // =====================================================

    const currentUser = await User.findById(currentUserId).select("blockedUsers").lean();

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

    let conversation = null;

    if (productId) {
      conversation = await Conversation.findOne({
        participants: { $all: [currentUserId, userId] },
        product: productId,
      }).lean();
    } else {
      conversation = await Conversation.findOne({
        participants: { $all: [currentUserId, userId] },
        $or: [{ product: null }, { product: { $exists: false } }],
      }).lean();
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
    // POPULATE - Reduced fields
    // =====================================================

    const populatedConversation = await Conversation.findById(conversation._id)
      .select('participants product lastMessage lastMessageAt createdAt updatedAt')
      .populate({
        path: "participants",
        select: "fullname avatar status",
      })
      .populate({
        path: "product",
        select: "title images category status",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate({
        path: "lastMessage",
        select: 'sender content type createdAt',
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
      .select('participants product lastMessage lastMessageAt createdAt updatedAt')
      .populate({
        path: "participants",
        select: "fullname avatar status", // Removed bio
      })
      .populate({
        path: "product",
        select: "title images category status", // Reduced fields
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate({
        path: "lastMessage",
        select: 'sender content type createdAt',
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
      sender: { $ne: userId },
      readBy: { $ne: userId },
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

    const { content, type, image, images } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "conversationId không hợp lệ",
      });
    }

    const messageType = type === "image" ? "image" : "text";
    const messageContent = typeof content === "string" ? content.trim() : "";
    
    // Handle single image (legacy) or multiple images
    let messageImages = [];
    if (images && Array.isArray(images)) {
      messageImages = images.filter(img => typeof img === 'string' && img.trim()).slice(0, 5);
    } else if (image && typeof image === 'string' && image.trim()) {
      messageImages = [image.trim()];
    } else if (messageType === "image" && messageContent) {
      messageImages = [messageContent];
    }

    if (messageType === "text" && !messageContent) {
      return res.status(400).json({
        success: false,
        message: "Nội dung tin nhắn không được để trống",
      });
    }

    if (messageType === "image" && messageImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Hình ảnh không hợp lệ",
      });
    }

    if (messageImages.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Tối đa 5 ảnh mỗi tin nhắn",
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
      image: messageImages[0] || null, // Keep backward compatibility
      images: messageImages,
      content: messageContent || (messageType === "image" ? `[${messageImages.length} Hình ảnh]` : ""),
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
