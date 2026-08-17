const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendResetPasswordEmail } = require("../services/emailService");

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
  try {
    const { fullname, email, phone, password, confirmPassword, address } =
      req.body;

    if (!fullname || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone?.trim() || "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email không đúng định dạng",
      });
    }

    if (normalizedPhone) {
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

      if (!phoneRegex.test(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại không đúng định dạng",
        });
      }
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu nhập lại không trùng khớp",
      });
    }

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    if (normalizedPhone) {
      const existingPhone = await User.findOne({
        phone: normalizedPhone,
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Số điện thoại đã được sử dụng",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullname: fullname.trim(),
      email: normalizedEmail,
      phone: normalizedPhone || undefined,
      password: hashedPassword,

      address: {
        province: address?.province || "Thành phố Hồ Chí Minh",
        ward: address?.ward || "",
      },

      role: "user",
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Tạo tài khoản thành công",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // MongoDB duplicate key
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern || {})[0];

      if (duplicatedField === "email") {
        return res.status(409).json({
          success: false,
          message: "Email đã được sử dụng",
        });
      }

      if (duplicatedField === "phone") {
        return res.status(409).json({
          success: false,
          message: "Số điện thoại đã được sử dụng",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi tạo tài khoản",
    });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password, remember } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email/số điện thoại và mật khẩu",
      });
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        {
          email: normalizedIdentifier,
        },
        {
          phone: identifier.trim(),
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email/SĐT hoặc mật khẩu không đúng",
      });
    }

    if (user.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa",
      });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn chưa được kích hoạt",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Email/SĐT hoặc mật khẩu không đúng",
      });
    }

    const expiresIn = remember ? "30d" : "1d";

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn,
      },
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",

      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        bio: user.bio || "",
        role: user.role,
        status: user.status,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi đăng nhập",
    });
  }
};

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        fullname: req.user.fullname,
        email: req.user.email,
        phone: req.user.phone || "",
        avatar: req.user.avatar || "",
        bio: req.user.bio || "",
        role: req.user.role,
        status: req.user.status,
        address: req.user.address,
        reputationScore: req.user.reputationScore,
        stats: req.user.stats,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin người dùng",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể đăng xuất",
    });
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email không đúng định dạng",
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email: normalizedEmail });

    // SECURITY: Luôn trả về success dù user có tồn tại hay không
    // để tránh attacker biết được email nào có trong hệ thống
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu",
      });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa",
      });
    }

    // Tạo reset token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token trước khi lưu vào database (bảo mật)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Lưu token và thời gian hết hạn vào database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 phút

    await user.save();

    // Gửi email
    try {
      await sendResetPasswordEmail(user.email, resetToken, user.fullname);

      return res.status(200).json({
        success: true,
        message: "Link đặt lại mật khẩu đã được gửi đến email của bạn",
      });
    } catch (emailError) {
      // Nếu gửi email thất bại, xóa token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error("Send email failed:", emailError);

      return res.status(500).json({
        success: false,
        message:
          "Không thể gửi email. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi xử lý yêu cầu",
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validate
    if (!token || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu mới",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu nhập lại không trùng khớp",
      });
    }

    // Hash token để so sánh với database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Tìm user với token và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu và xóa token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi đặt lại mật khẩu",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
};


// ======================================================
// GOOGLE LOGIN
// ======================================================

const googleLogin = async (req, res) => {
  try {
    console.log("🔵 Google login request received");
    const { credential } = req.body;

    if (!credential) {
      console.log("❌ No credential provided");
      return res.status(400).json({
        success: false,
        message: "Credential không hợp lệ",
      });
    }

    console.log("✅ Credential received:", credential.substring(0, 50) + "...");

    // Verify Google token
    console.log("🔍 Verifying token with Google...");
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("✅ Token verified. User info:", {
      email: payload.email,
      name: payload.name,
      picture: payload.picture?.substring(0, 50) + "..."
    });

    // Extract user info từ Google
    const {
      email,
      name,
      picture,
      sub: googleId,
      email_verified,
    } = payload;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email chưa được xác thực bởi Google",
      });
    }

    // Check xem user đã tồn tại chưa
    console.log("🔍 Checking if user exists:", email);
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User đã tồn tại → Đăng nhập
      console.log("✅ User exists. Logging in...");
      
      // Check status
      if (user.status === "banned") {
        return res.status(403).json({
          success: false,
          message: "Tài khoản của bạn đã bị khóa",
        });
      }

      if (user.status === "pending") {
        return res.status(403).json({
          success: false,
          message: "Tài khoản của bạn chưa được kích hoạt",
        });
      }

      // Update avatar nếu chưa có
      if (!user.avatar && picture) {
        console.log("📸 Updating avatar from Google:", picture);
        user.avatar = picture;
        await user.save();
      } else if (user.avatar) {
        console.log("✅ User already has avatar:", user.avatar.substring(0, 50) + "...");
      }
    } else {
      // User chưa tồn tại → Tạo mới
      console.log("🆕 Creating new user with Google info...");
      
      // Generate random password (user sẽ không biết, chỉ dùng Google login)
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        fullname: name,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: picture || "",
        role: "user",
        status: "active",
        address: {
          province: "Thành phố Hồ Chí Minh",
          ward: "",
        },
      });

      console.log("✅ New user created:", {
        email: user.email,
        avatar: user.avatar?.substring(0, 50) + "..." || "no avatar"
      });
    }

    // Tạo JWT token (giống login thường)
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d", // Google login mặc định remember 30 ngày
      },
    );

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json({
      success: true,
      message: "Đăng nhập bằng Google thành công",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        bio: user.bio || "",
        role: user.role,
        status: user.status,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("❌ Google login error:", error);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Đăng nhập bằng Google thất bại",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
};
