const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Lấy token từ cookie
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
    }

    // 2. Kiểm tra JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Tìm user trong database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }

    // 4. Kiểm tra trạng thái tài khoản
    if (user.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa",
      });
    }

    // 5. Gắn user vào request
    req.user = user;

    // 6. Cho request đi tiếp
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      success: false,
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    });
  }
};

module.exports = authMiddleware;
