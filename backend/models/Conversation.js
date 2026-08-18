const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    /*
     * Sản phẩm mà cuộc trò chuyện này liên quan tới.
     *
     * Ví dụ:
     *
     * User A xem iPhone của User B
     *        ↓
     * Liên hệ người cho
     *        ↓
     * Conversation.product = iPhone._id
     */
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for faster queries
conversationSchema.index({ participants: 1, lastMessageAt: -1 }); // For getting user's conversations sorted by last message
conversationSchema.index({ product: 1, participants: 1 }); // For finding conversation by product and participants

module.exports = mongoose.model("Conversation", conversationSchema);
