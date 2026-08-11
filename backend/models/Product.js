const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    giver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["giving", "processing", "given", "hidden"],
      default: "giving",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    interestCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    address: {
      province: {
        type: String,
        required: true,
      },

      district: {
        type: String,
        required: true,
      },
    },

    publishAt: {
      type: Date,
      default: Date.now,
    },

    lastInteractionAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
