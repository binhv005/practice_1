const mongoose = require("mongoose");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

const { isUserOnline, getUserSockets } = require("./presence");

/**
 * Tạo room name từ conversation ID.
 *
 * Ví dụ:
 *
 * conversation:66abc123
 */
const getConversationRoom = (conversationId) => {
  return `conversation:${conversationId}`;
};

/**
 * Kiểm tra user có quyền truy cập conversation.
 * Tối ưu: Sử dụng lean() để tăng performance.
 */
const findAuthorizedConversation = async (conversationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return null;
  }

  return Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).lean();
};



/**
 * Emit event tới tất cả socket của một user.
 *
 * Không chỉ gửi tới một socket vì user có thể mở
 * nhiều tab/browser.
 */
const emitToUser = (io, userId, event, payload) => {
  const socketIds = getUserSockets(userId);

  if (socketIds.size === 0) {
    return;
  }

  for (const socketId of socketIds) {
    io.to(socketId).emit(event, payload);
  }
};

/**
 * Register toàn bộ message-related socket events.
 */
const registerMessageSocket = (io, socket) => {
  const currentUserId = socket.userId;

  /**
   * ======================================================
   * JOIN CONVERSATION
   * ======================================================
   *
   * Client:
   *
   * socket.emit("conversation:join", {
   *   conversationId
   * });
   */
  socket.on("conversation:join", async (payload, callback) => {
    try {
      const conversationId = payload?.conversationId;

      if (!conversationId) {
        const result = {
          success: false,
          message: "conversationId là bắt buộc",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      const conversation = await findAuthorizedConversation(
        conversationId,
        currentUserId,
      );

      if (!conversation) {
        const result = {
          success: false,
          message: "Bạn không có quyền truy cập cuộc trò chuyện này",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      const room = getConversationRoom(conversationId);

      await socket.join(room);

      const result = {
        success: true,
        conversationId,
      };

      if (typeof callback === "function") {
        callback(result);
      }
    } catch (error) {
      console.error("conversation:join error:", error);

      if (typeof callback === "function") {
        callback({
          success: false,
          message: "Không thể tham gia cuộc trò chuyện",
        });
      }
    }
  });

  /**
   * ======================================================
   * LEAVE CONVERSATION
   * ======================================================
   */
  socket.on("conversation:leave", async (payload, callback) => {
    try {
      const conversationId = payload?.conversationId;

      if (!conversationId) {
        if (typeof callback === "function") {
          callback({
            success: false,
            message: "conversationId là bắt buộc",
          });
        }

        return;
      }

      const room = getConversationRoom(conversationId);

      await socket.leave(room);

      if (typeof callback === "function") {
        callback({
          success: true,
          conversationId,
        });
      }
    } catch (error) {
      console.error("conversation:leave error:", error);

      if (typeof callback === "function") {
        callback({
          success: false,
          message: "Không thể rời cuộc trò chuyện",
        });
      }
    }
  });

  /**
   * ======================================================
   * SEND MESSAGE
   * ======================================================
   *
   * Client:
   *
   * socket.emit(
   *   "message:send",
   *   {
   *     conversationId,
   *     content
   *   },
   *   callback
   * );
   */
  socket.on("message:send", async (payload, callback) => {
    try {
      const conversationId = payload?.conversationId;
      const content = payload?.content;
      const type = payload?.type || "text";
      const image = payload?.image || null;
      const images = payload?.images || [];

      /**
       * Validate conversationId.
       */
      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        const result = {
          success: false,
          message: "conversationId không hợp lệ",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      /**
       * Validate content.
       */
      if (typeof content !== "string") {
        const result = {
          success: false,
          message: "Nội dung tin nhắn không hợp lệ",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      const trimmedContent = content.trim();

      // Allow empty content if there are images
      if (!trimmedContent && images.length === 0 && !image) {
        const result = {
          success: false,
          message: "Tin nhắn không được để trống",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      // No message length limit - allow unlimited characters

      /**
       * Validate images array.
       */
      if (images.length > 5) {
        const result = {
          success: false,
          message: "Tối đa 5 ảnh mỗi tin nhắn",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      /**
       * Kiểm tra conversation.
       */
      const conversation = await findAuthorizedConversation(
        conversationId,
        currentUserId,
      );

      if (!conversation) {
        const result = {
          success: false,
          message: "Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      /**
       * Lấy participant còn lại.
       */
      const receiverId = conversation.participants.find(
        (participantId) =>
          participantId.toString() !== currentUserId.toString(),
      );

      if (!receiverId) {
        const result = {
          success: false,
          message: "Conversation không hợp lệ",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      /**
       * Tối ưu: Thực hiện kiểm tra blockedUsers và status trong một Promise.all
       * để giảm thời gian chờ query.
       */
      const [currentUser, receiver] = await Promise.all([
        User.findById(currentUserId).select("blockedUsers").lean(),
        User.findById(receiverId).select("blockedUsers status").lean(),
      ]);

      if (!receiver) {
        const result = {
          success: false,
          message: "Người nhận không tồn tại",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      if (receiver.status === "banned") {
        const result = {
          success: false,
          message: "Không thể gửi tin nhắn tới tài khoản đã bị khóa",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      const currentUserBlockedReceiver = currentUser?.blockedUsers?.some(
        (id) => id.toString() === receiverId.toString(),
      );

      const receiverBlockedCurrentUser = receiver.blockedUsers?.some(
        (id) => id.toString() === currentUserId.toString(),
      );

      if (currentUserBlockedReceiver || receiverBlockedCurrentUser) {
        const result = {
          success: false,
          message: "Không thể gửi tin nhắn cho người dùng này",
        };

        if (typeof callback === "function") {
          callback(result);
        }

        return;
      }

      /**
       * ==================================================
       * SAVE DATABASE FIRST
       * ==================================================
       *
       * Database là source of truth.
       *
       * Không emit trước khi save.
       */
      const messageData = {
        conversation: conversationId,
        sender: currentUserId,
        content: trimmedContent || `[${images.length} Hình ảnh]`,
        type,
        readBy: [currentUserId],
      };

      // Add image fields if present
      if (image) {
        messageData.image = image;
      }

      if (images.length > 0) {
        messageData.images = images;
      }

      const message = await Message.create(messageData);

      // Debug: Check what was saved
      console.log("💾 Message created in DB:", {
        _id: message._id,
        type: message.type,
        image: message.image,
        images: message.images,
        content: message.content,
      });

      /**
       * Tối ưu: Thực hiện update Conversation và populate Message song song
       * thay vì tuần tự để giảm thời gian chờ.
       */
      const [, populatedMessage] = await Promise.all([
        Conversation.updateOne(
          { _id: conversationId },
          {
            $set: {
              lastMessage: message._id,
              lastMessageAt: message.createdAt,
            },
          }
        ),
        Message.findById(message._id)
          .select('sender content type image images readBy createdAt updatedAt')
          .populate({
            path: "sender",
            select: "fullname avatar status",
          })
          .lean(),
      ]);

      /**
       * Room conversation.
       */
      const room = getConversationRoom(conversationId);

      /**
       * Gửi realtime tới tất cả user đang join room.
       */
      io.to(room).emit("message:new", populatedMessage);

      /**
       * ==================================================
       * EMIT DIRECTLY TO RECEIVER
       * ==================================================
       * 
       * Gửi message:new trực tiếp cho receiver
       * kể cả khi receiver chưa join room.
       * 
       * Điều này đảm bảo receiver nhận được thông báo
       * và cập nhật unread count ngay lập tức.
       */
      emitToUser(io, receiverId.toString(), "message:new", populatedMessage);

      /**
       * Emit conversation update cho receiver
       * kể cả khi receiver chưa join room.
       *
       * Frontend dùng event này để cập nhật:
       *
       * - last message
       * - unread count
       * - conversation order
       */
      emitToUser(io, receiverId.toString(), "conversation:updated", {
        conversationId,
        lastMessage: populatedMessage,
        lastMessageAt: message.createdAt,
        unreadCountIncrement: 1,
      });

      /**
       * ACK cho sender.
       */
      if (typeof callback === "function") {
        callback({
          success: true,
          message: populatedMessage,
        });
      }
    } catch (error) {
      console.error("message:send error:", error);

      if (typeof callback === "function") {
        callback({
          success: false,
          message: "Không thể gửi tin nhắn",
        });
      }
    }
  });

  /**
   * ======================================================
   * TYPING START
   * ======================================================
   */
  socket.on("typing:start", async (payload) => {
    try {
      const conversationId = payload?.conversationId;

      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        return;
      }

      const conversation = await findAuthorizedConversation(
        conversationId,
        currentUserId,
      );

      if (!conversation) {
        return;
      }

      const room = getConversationRoom(conversationId);

      /**
       * Broadcast cho người khác trong room.
       *
       * socket.to() không gửi lại chính socket hiện tại.
       */
      socket.to(room).emit("typing:start", {
        conversationId,
        userId: currentUserId,
      });
    } catch (error) {
      console.error("typing:start error:", error);
    }
  });

  /**
   * ======================================================
   * TYPING STOP
   * ======================================================
   */
  socket.on("typing:stop", async (payload) => {
    try {
      const conversationId = payload?.conversationId;

      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        return;
      }

      const conversation = await findAuthorizedConversation(
        conversationId,
        currentUserId,
      );

      if (!conversation) {
        return;
      }

      const room = getConversationRoom(conversationId);

      socket.to(room).emit("typing:stop", {
        conversationId,
        userId: currentUserId,
      });
    } catch (error) {
      console.error("typing:stop error:", error);
    }
  });

  /**
   * ======================================================
   * MESSAGE READ
   * ======================================================
   */
  socket.on("message:read", async (payload, callback) => {
    try {
      const conversationId = payload?.conversationId;

      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        if (typeof callback === "function") {
          callback({
            success: false,
            message: "conversationId không hợp lệ",
          });
        }

        return;
      }

      const conversation = await findAuthorizedConversation(
        conversationId,
        currentUserId,
      );

      if (!conversation) {
        if (typeof callback === "function") {
          callback({
            success: false,
            message: "Bạn không có quyền truy cập conversation này",
          });
        }

        return;
      }

      /**
       * Chỉ mark message của người khác.
       */
      const result = await Message.updateMany(
        {
          conversation: conversationId,
          sender: {
            $ne: currentUserId,
          },
          readBy: {
            $ne: currentUserId,
          },
        },
        {
          $addToSet: {
            readBy: currentUserId,
          },
        },
      );

      /**
       * Tìm participant còn lại.
       */
      const receiverId = conversation.participants.find(
        (participantId) =>
          participantId.toString() !== currentUserId.toString(),
      );

      const room = getConversationRoom(conversationId);

      /**
       * Thông báo read receipt cho room.
       */
      io.to(room).emit("message:read:update", {
        conversationId,
        userId: currentUserId,
        modifiedCount: result.modifiedCount,
      });

      /**
       * ACK.
       */
      if (typeof callback === "function") {
        callback({
          success: true,
          modifiedCount: result.modifiedCount,
        });
      }

      /**
       * Nếu receiver online nhưng chưa join room,
       * gửi trực tiếp event cho receiver.
       */
      if (receiverId && isUserOnline(receiverId.toString())) {
        emitToUser(io, receiverId.toString(), "message:read:update", {
          conversationId,
          userId: currentUserId,
          modifiedCount: result.modifiedCount,
        });
      }
    } catch (error) {
      console.error("message:read error:", error);

      if (typeof callback === "function") {
        callback({
          success: false,
          message: "Không thể đánh dấu tin nhắn đã đọc",
        });
      }
    }
  });
};

module.exports = {
  registerMessageSocket,
  getConversationRoom,
};
