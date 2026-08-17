const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Họ và tên là bắt buộc"],
      trim: true,
      minlength: [2, "Họ và tên phải có ít nhất 2 ký tự"],
      maxlength: [100, "Họ và tên không được vượt quá 100 ký tự"],
    },

    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không đúng định dạng"],
    },

    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },

    phone: {
      type: String,
      trim: true,
      default: undefined,
      sparse: true,
      index: true,
      match: [
        /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
        "Số điện thoại không đúng định dạng",
      ],
    },

    avatar: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Tiểu sử không được vượt quá 500 ký tự"],
    },

    role: {
      type: String,
      enum: {
        values: ["user", "admin", "moderator"],
        message: "Role không hợp lệ",
      },
      default: "user",
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["active", "banned", "pending"],
        message: "Trạng thái tài khoản không hợp lệ",
      },
      default: "active",
      index: true,
    },

    reputationScore: {
      type: Number,
      default: 0,
      min: [0, "Điểm uy tín không được nhỏ hơn 0"],
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

    savedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // Forgot password fields
    resetPasswordToken: {
      type: String,
      default: undefined,
    },

    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

// Tìm user theo email
userSchema.index({
  email: 1,
});

// Tìm user theo phone
userSchema.index({
  phone: 1,
});

// Filter user theo role + status
userSchema.index({
  role: 1,
  status: 1,
});

module.exports = mongoose.model("User", userSchema);
