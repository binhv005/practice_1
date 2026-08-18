const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
    },

    image: {
      type: String,
      default: null,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 5; // Maximum 5 images
        },
        message: 'Tối đa 5 ảnh mỗi tin nhắn'
      }
    },

    content: {
      type: String,
      default: "",
      trim: true,
      // No maxlength limit - allow unlimited message length
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for faster queries
messageSchema.index({ conversation: 1, createdAt: -1 }); // For getting messages in a conversation sorted by time
messageSchema.index({ conversation: 1, sender: 1 }); // For filtering messages by conversation and sender
messageSchema.index({ conversation: 1, readBy: 1 }); // For unread count queries
messageSchema.index({ sender: 1, createdAt: -1 }); // For user's message history

module.exports =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
