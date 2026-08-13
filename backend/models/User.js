const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "banned", "pending"],
      default: "active",
    },

    reputationScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    stats: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    address: {
      province: {
        type: String,
        trim: true,
        default: "Thành phố Hồ Chí Minh",
      },

      ward: {
        type: String,
        trim: true,
        default: "",
      },
    },

    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
