const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const {
  sendResetPasswordEmail,
  sendOTPEmail,
} = require("../services/emailService");

const { verifyFirebasePhoneToken } = require("../services/firebaseAuthService");
const {
  normalizePhoneNumber,
  toLocalVietnamPhone,
} = require("../services/smsService");

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ======================================================
// REGISTER
// ======================================================

const register = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      password,
      confirmPassword,
      address,
    } = req.body;

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

    // Check email đã tồn tại chưa
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

    // Generate OTP code (6 digits)
    const otpCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user với status "pending" và lưu OTP
    const user = await User.create({
      fullname: fullname.trim(),
      email: normalizedEmail,
      phone: normalizedPhone || undefined,
      password: hashedPassword,

      address: {
        province:
          address?.province || "Thành phố Hồ Chí Minh",
        ward: address?.ward || "",
      },

      role: "user",
      status: "pending",
      isEmailVerified: false,
      otpCode: otpCode,
      otpExpires: Date.now() + 10 * 60 * 1000,
    });

    // Gửi OTP email
    try {
      await sendOTPEmail(
        normalizedEmail,
        otpCode,
        fullname.trim(),
      );

      console.log(
        `✅ OTP sent to ${normalizedEmail}: ${otpCode}`,
      );

      return res.status(201).json({
        success: true,
        message: "Mã xác thực đã được gửi đến email của bạn",
        userId: user._id,
        email: normalizedEmail,
      });
    } catch (emailError) {
      // Nếu gửi email thất bại, xóa user vừa tạo
      await User.deleteOne({ _id: user._id });

      console.error(
        "Send OTP email failed:",
        emailError,
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể gửi mã xác thực. Vui lòng thử lại sau",
      });
    }
  } catch (error) {
    console.error("Register error:", error);

    // MongoDB duplicate key
    if (error.code === 11000) {
      const duplicatedField =
        Object.keys(error.keyPattern || {})[0];

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

// ======================================================
// LOGIN
// ======================================================

const login = async (req, res) => {
  try {
    const { identifier, password, remember } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng nhập email/số điện thoại và mật khẩu",
      });
    }

    const trimmedIdentifier = identifier.trim();
    const compactIdentifier = trimmedIdentifier.replace(/\s/g, "");
    const normalizedIdentifier = trimmedIdentifier.toLowerCase();
    const phoneCandidates = [trimmedIdentifier, compactIdentifier];

    if (/^(\+84|0)\d{9,10}$/.test(compactIdentifier)) {
      phoneCandidates.push(normalizePhoneNumber(compactIdentifier));
      phoneCandidates.push(toLocalVietnamPhone(compactIdentifier));
    }

    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier },
        { phone: { $in: [...new Set(phoneCandidates)] } },
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

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password,
    );

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
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: remember
        ? 30 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000,
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

// ======================================================
// GET ME
// ======================================================

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

// ======================================================
// LOGOUT
// ======================================================

const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
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
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // SECURITY: Luôn trả về success dù user có tồn tại hay không
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
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Hash token trước khi lưu vào database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Lưu token và thời gian hết hạn vào database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    // Gửi email
    try {
      await sendResetPasswordEmail(
        user.email,
        resetToken,
        user.fullname,
      );

      return res.status(200).json({
        success: true,
        message:
          "Link đặt lại mật khẩu đã được gửi đến email của bạn",
      });
    } catch (emailError) {
      // Nếu gửi email thất bại, xóa token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      console.error(
        "Send email failed:",
        emailError,
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể gửi email. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau",
      });
    }
  } catch (error) {
    console.error(
      "Forgot password error:",
      error,
    );

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
    const {
      token,
      newPassword,
      confirmPassword,
    } = req.body;

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
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Tìm user với token và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10,
    );

    // Cập nhật mật khẩu và xóa token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi đặt lại mật khẩu",
    });
  }
};

// ======================================================
// GOOGLE LOGIN
// ======================================================

const googleLogin = async (req, res) => {
  try {
    console.log(
      "🔵 Google login request received",
    );

    const { credential } = req.body;

    if (!credential) {
      console.log(
        "❌ No credential provided",
      );

      return res.status(400).json({
        success: false,
        message: "Credential không hợp lệ",
      });
    }

    console.log(
      "✅ Credential received:",
      credential.substring(0, 50) + "...",
    );

    // Verify Google token
    console.log(
      "🔍 Verifying token with Google...",
    );

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload = ticket.getPayload();

    console.log(
      "✅ Token verified. User info:",
      {
        email: payload.email,
        name: payload.name,
        picture:
          payload.picture?.substring(
            0,
            50,
          ) + "...",
      },
    );

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
        message:
          "Email chưa được xác thực bởi Google",
      });
    }

    // Check xem user đã tồn tại chưa
    console.log(
      "🔍 Checking if user exists:",
      email,
    );

    let user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (user) {
      // User đã tồn tại → Đăng nhập
      console.log(
        "✅ User exists. Logging in...",
      );

      // Check status
      if (user.status === "banned") {
        return res.status(403).json({
          success: false,
          message:
            "Tài khoản của bạn đã bị khóa",
        });
      }

      if (user.status === "pending") {
        return res.status(403).json({
          success: false,
          message:
            "Tài khoản của bạn chưa được kích hoạt",
        });
      }

      // Update avatar nếu chưa có
      if (!user.avatar && picture) {
        console.log(
          "📸 Updating avatar from Google:",
          picture,
        );

        user.avatar = picture;
        await user.save();
      } else if (user.avatar) {
        console.log(
          "✅ User already has avatar:",
          user.avatar.substring(0, 50) + "...",
        );
      }
    } else {
      // User chưa tồn tại → Tạo mới
      console.log(
        "🆕 Creating new user with Google info...",
      );

      // Generate random password
      const randomPassword =
        crypto
          .randomBytes(32)
          .toString("hex");

      const hashedPassword =
        await bcrypt.hash(
          randomPassword,
          10,
        );

      user = await User.create({
        fullname: name,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: picture || "",
        role: "user",
        status: "active",
        address: {
          province:
            "Thành phố Hồ Chí Minh",
          ward: "",
        },
      });

      console.log(
        "✅ New user created:",
        {
          email: user.email,
          avatar:
            user.avatar?.substring(
              0,
              50,
            ) +
              "..." ||
            "no avatar",
        },
      );
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      },
    );

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",
      maxAge:
        30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message:
        "Đăng nhập bằng Google thành công",
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
    console.error(
      "❌ Google login error:",
      error,
    );

    console.error(
      "Error stack:",
      error.stack,
    );

    return res.status(500).json({
      success: false,
      message:
        "Đăng nhập bằng Google thất bại",
    });
  }
};

// ======================================================
// VERIFY EMAIL OTP
// ======================================================

const verifyOTP = async (req, res) => {
  try {
    const { userId, otpCode } = req.body;

    if (!userId || !otpCode) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng nhập đầy đủ thông tin",
      });
    }

    // Tìm user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Người dùng không tồn tại",
      });
    }

    // Check user đã verified chưa
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email đã được xác thực",
      });
    }

    // Check OTP có tồn tại không
    if (!user.otpCode) {
      return res.status(400).json({
        success: false,
        message:
          "Mã OTP không hợp lệ hoặc đã hết hạn",
      });
    }

    // Check OTP hết hạn chưa
    if (Date.now() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message:
          "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới",
      });
    }

    // Verify OTP
    if (
      user.otpCode !==
      otpCode.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Mã OTP không chính xác",
      });
    }

    // OTP đúng - Kích hoạt tài khoản
    user.status = "active";
    user.isEmailVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;

    await user.save();

    console.log(
      `✅ User ${user.email} verified successfully`,
    );

    return res.status(200).json({
      success: true,
      message:
        "Xác thực thành công! Tài khoản của bạn đã được kích hoạt",
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
    console.error(
      "Verify OTP error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Có lỗi xảy ra khi xác thực",
    });
  }
};

// ======================================================
// RESEND EMAIL OTP
// ======================================================

const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng cung cấp userId",
      });
    }

    // Tìm user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Người dùng không tồn tại",
      });
    }

    // Check user đã verified chưa
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email đã được xác thực",
      });
    }

    // Generate new OTP
    const otpCode = Math.floor(
      100000 +
        Math.random() * 900000,
    ).toString();

    // Update user với OTP mới
    user.otpCode = otpCode;
    user.otpExpires =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    // Gửi email
    try {
      await sendOTPEmail(
        user.email,
        otpCode,
        user.fullname,
      );

      console.log(
        `✅ OTP resent to ${user.email}: ${otpCode}`,
      );

      return res.status(200).json({
        success: true,
        message:
          "Mã xác thực mới đã được gửi đến email của bạn",
      });
    } catch (emailError) {
      console.error(
        "Resend OTP email failed:",
        emailError,
      );

      return res.status(500).json({
        success: false,
        message:
          "Không thể gửi mã xác thực. Vui lòng thử lại sau",
      });
    }
  } catch (error) {
    console.error(
      "Resend OTP error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Có lỗi xảy ra khi gửi lại mã xác thực",
    });
  }
};

// ======================================================
// SMS OTP - SEND OTP VIA SMS
// ======================================================

const sendSMSOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (
      !phoneNumber ||
      !phoneNumber.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng nhập số điện thoại",
      });
    }

    // Validate phone number format
    const phoneRegex =
      /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

    if (
      !phoneRegex.test(
        phoneNumber.trim(),
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Số điện thoại không đúng định dạng",
      });
    }

    const trimmedPhone = phoneNumber.trim();
    const e164Phone = normalizePhoneNumber(trimmedPhone);
    const localPhone = toLocalVietnamPhone(trimmedPhone);

    const existingUser = await User.findOne({
      $or: [
        { phone: trimmedPhone },
        { phone: e164Phone },
        { phone: localPhone },
      ],
      status: "active",
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "Số điện thoại đã được đăng ký và kích hoạt",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Số điện thoại hợp lệ, tiếp tục xác thực Firebase",
      phoneNumber: localPhone,
    });
  } catch (error) {
    console.error(
      "❌ Send SMS OTP error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Có lỗi xảy ra khi gửi OTP",
    });
  }
};

// ======================================================
// SMS OTP - VERIFY SMS OTP VÀ TẠO TÀI KHOẢN
// ======================================================

const verifySMSOTP = async (req, res) => {
  try {
    const {
      phoneNumber,
      idToken,
      fullname,
      email,
      password,
    } = req.body;

    // Validate required fields
    if (
      !phoneNumber ||
      !idToken ||
      !fullname ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng nhập đầy đủ thông tin",
      });
    }

    const verifyResult =
      await verifyFirebasePhoneToken(
        idToken,
        phoneNumber,
      );

    if (!verifyResult.success) {
      return res
        .status(400)
        .json(verifyResult);
    }

    // OTP đúng → Tạo tài khoản
    const normalizedPhone =
      verifyResult.phoneNumber;

    const normalizedEmail = email
      ? email.trim().toLowerCase()
      : "";

    // Check email nếu có
    if (normalizedEmail) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          normalizedEmail,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email không đúng định dạng",
        });
      }

      const existingEmail =
        await User.findOne({
          email: normalizedEmail,
        });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message:
            "Email đã được sử dụng",
        });
      }
    }

    // Check phone đã tồn tại chưa
    const existingPhone =
      await User.findOne({
        $or: [
          { phone: normalizedPhone },
          { phone: phoneNumber.trim() },
        ],
      });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message:
          "Số điện thoại đã được sử dụng",
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(
        password,
        10,
      );

    // Tạo user với status active
    const user = await User.create({
      fullname: fullname.trim(),
      email:
        normalizedEmail || undefined,
      phone: verifyResult.phoneNumber,
      password: hashedPassword,
      role: "user",
      status: "active",
      phoneVerified: true,
      firebaseUid: verifyResult.firebaseUid,
      isEmailVerified:
        normalizedEmail
          ? false
          : true,
      address: {
        province:
          "Thành phố Hồ Chí Minh",
        ward: "",
      },
    });

    // Tạo JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      },
    );

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",
      maxAge:
        30 * 24 * 60 * 60 * 1000,
    });

    console.log(
      `✅ User registered successfully via SMS: ${normalizedPhone}`,
    );

    return res.status(201).json({
      success: true,
      message:
        "Đăng ký thành công",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email || "",
        phone: user.phone,
        avatar: user.avatar || "",
        bio: user.bio || "",
        role: user.role,
        status: user.status,
        address: user.address,
      },
    });
  } catch (error) {
    console.error(
      "❌ Verify SMS OTP error:",
      error,
    );

    // Handle duplicate key error
    if (error.code === 11000) {
      const duplicatedField =
        Object.keys(
          error.keyPattern || {},
        )[0];

      if (
        duplicatedField === "email"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Email đã được sử dụng",
        });
      }

      if (
        duplicatedField === "phone" ||
        duplicatedField === "firebaseUid"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Số điện thoại đã được sử dụng",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Có lỗi xảy ra khi tạo tài khoản",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
  verifyOTP,
  resendOTP,
  sendSMSOTP,
  verifySMSOTP,
};