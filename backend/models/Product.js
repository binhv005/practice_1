const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.length <= 10,
        message: "Sản phẩm chỉ được tối đa 10 ảnh",
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    giver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["giving", "processing", "given", "hidden"],
      default: "giving",
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    interestCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    address: {
      province: {
        type: String,
        trim: true,
        default: "Thành phố Hồ Chí Minh",
      },

      ward: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
    },

    publishAt: {
      type: Date,
      default: Date.now,
      index: true,
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

// Lọc sản phẩm theo trạng thái + phường
productSchema.index({
  status: 1,
  "address.ward": 1,
});

// Lọc sản phẩm theo category + trạng thái
productSchema.index({
  category: 1,
  status: 1,
});

// Sắp xếp sản phẩm nổi bật và mới nhất
productSchema.index({
  featured: -1,
  publishAt: -1,
});

// Sắp xếp theo thời gian tương tác
productSchema.index({
  lastInteractionAt: -1,
});

module.exports = mongoose.model("Product", productSchema);
