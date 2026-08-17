const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Tìm kiếm conversations của user
 * 
 * @param {string} userId - ID của user hiện tại
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Promise<Array>} Danh sách conversations tìm được
 */
const searchConversations = async (userId, keyword) => {
  try {
    if (!keyword || typeof keyword !== "string") {
      return [];
    }

    const searchKeyword = keyword.trim();

    if (!searchKeyword) {
      return [];
    }

    // Tìm conversations của user
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "fullname avatar status email",
      })
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullname avatar",
        },
      })
      .lean();

    // Filter conversations dựa trên keyword
    const results = conversations.filter((conversation) => {
      // Lấy thông tin participant còn lại (người chat với mình)
      const otherParticipant = conversation.participants?.find(
        (p) => p._id.toString() !== userId.toString(),
      );

      if (!otherParticipant) {
        return false;
      }

      const fullname = otherParticipant.fullname || "";
      const email = otherParticipant.email || "";
      const lastMessageContent = conversation.lastMessage?.content || "";

      const lowerKeyword = searchKeyword.toLowerCase();

      // Tìm kiếm trong fullname, email, và nội dung tin nhắn cuối
      return (
        fullname.toLowerCase().includes(lowerKeyword) ||
        email.toLowerCase().includes(lowerKeyword) ||
        lastMessageContent.toLowerCase().includes(lowerKeyword)
      );
    });

    // Thêm unread count cho mỗi conversation
    const resultsWithUnread = await Promise.all(
      results.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: userId },
          readBy: { $ne: userId },
          deletedAt: null,
        });

        const otherParticipant = conversation.participants?.find(
          (p) => p._id.toString() !== userId.toString(),
        );

        return {
          ...conversation,
          otherParticipant,
          unreadCount,
        };
      }),
    );

    return resultsWithUnread;
  } catch (error) {
    console.error("Search conversations error:", error);
    throw error;
  }
};

/**
 * Tìm kiếm messages trong một conversation
 * 
 * @param {string} conversationId - ID của conversation
 * @param {string} userId - ID của user hiện tại
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng kết quả mỗi trang
 * @returns {Promise<Object>} Kết quả tìm kiếm với pagination
 */
const searchMessages = async (
  conversationId,
  userId,
  keyword,
  page = 1,
  limit = 30,
) => {
  try {
    // Kiểm tra user có quyền truy cập conversation không
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    if (!keyword || typeof keyword !== "string") {
      return {
        messages: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };
    }

    const searchKeyword = keyword.trim();

    if (!searchKeyword) {
      return {
        messages: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };
    }

    // Tạo regex để tìm kiếm không phân biệt hoa thường
    const searchRegex = new RegExp(searchKeyword, "i");

    const skip = (page - 1) * limit;

    // Tìm kiếm messages
    const [messages, total] = await Promise.all([
      Message.find({
        conversation: conversationId,
        content: searchRegex,
        deletedAt: null,
      })
        .populate({
          path: "sender",
          select: "fullname avatar status",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Message.countDocuments({
        conversation: conversationId,
        content: searchRegex,
        deletedAt: null,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: skip + messages.length < total,
      },
    };
  } catch (error) {
    console.error("Search messages error:", error);
    throw error;
  }
};

/**
 * Tìm kiếm users để bắt đầu conversation mới
 * 
 * @param {string} currentUserId - ID của user hiện tại
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {number} limit - Số lượng kết quả
 * @returns {Promise<Array>} Danh sách users tìm được
 */
const searchUsers = async (currentUserId, keyword, limit = 10) => {
  try {
    if (!keyword || typeof keyword !== "string") {
      return [];
    }

    const searchKeyword = keyword.trim();

    if (!searchKeyword) {
      return [];
    }

    // Tạo regex để tìm kiếm không phân biệt hoa thường
    const searchRegex = new RegExp(searchKeyword, "i");

    // Tìm users (không bao gồm bản thân và users bị banned)
    const users = await User.find({
      _id: { $ne: currentUserId },
      status: { $in: ["active", "pending"] },
      $or: [{ fullname: searchRegex }, { email: searchRegex }],
    })
      .select("fullname avatar status email")
      .limit(limit)
      .lean();

    return users;
  } catch (error) {
    console.error("Search users error:", error);
    throw error;
  }
};

module.exports = {
  searchConversations,
  searchMessages,
  searchUsers,
};
