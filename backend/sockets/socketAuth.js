const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Socket.IO authentication middleware.
 *
 * Socket.IO handshake sẽ gửi cookie accessToken
 * vì frontend và backend sử dụng authentication bằng HttpOnly Cookie.
 *
 * Flow:
 *
 * Client
 *   ↓
 * Socket.IO connection
 *   ↓
 * Cookie: accessToken
 *   ↓
 * JWT verify
 *   ↓
 * Find User
 *   ↓
 * socket.user = user
 */
const socketAuth = async (socket, next) => {
  try {
    console.log("[SocketAuth] Authenticating socket:", socket.id);
    
    /**
     * Socket.IO handshake headers.
     *
     * Browser sẽ gửi cookie trong:
     *
     * socket.handshake.headers.cookie
     */
    const cookieHeader = socket.handshake.headers?.cookie;

    if (!cookieHeader) {
      console.log("[SocketAuth] No cookie header found");
      return next(new Error("UNAUTHORIZED"));
    }

    /**
     * Parse cookie thủ công.
     *
     * Vì backend đang dùng:
     *
     * res.cookie("accessToken", token, ...)
     */
    const cookies = cookieHeader.split(";").reduce((acc, item) => {
      const separatorIndex = item.indexOf("=");

      if (separatorIndex === -1) {
        return acc;
      }

      const key = item.slice(0, separatorIndex).trim();
      const value = item.slice(separatorIndex + 1).trim();

      acc[key] = decodeURIComponent(value);

      return acc;
    }, {});

    const token = cookies.accessToken;

    if (!token) {
      console.log("[SocketAuth] No accessToken in cookies");
      return next(new Error("UNAUTHORIZED"));
    }

    /**
     * Verify JWT.
     */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.userId) {
      console.log("[SocketAuth] Invalid token payload");
      return next(new Error("UNAUTHORIZED"));
    }

    /**
     * Lấy user mới nhất từ database.
     *
     * Không lấy password.
     */
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("[SocketAuth] User not found:", decoded.userId);
      return next(new Error("USER_NOT_FOUND"));
    }

    /**
     * Không cho user bị banned kết nối socket.
     */
    if (user.status === "banned") {
      console.log("[SocketAuth] User is banned:", user._id);
      return next(new Error("ACCOUNT_BANNED"));
    }

    /**
     * pending cũng không được sử dụng chat.
     */
    if (user.status === "pending") {
      console.log("[SocketAuth] User is pending:", user._id);
      return next(new Error("ACCOUNT_PENDING"));
    }

    /**
     * Gắn user đã xác thực vào socket.
     *
     * Các socket handler phía sau KHÔNG được tin userId
     * do frontend gửi lên.
     *
     * Luôn sử dụng:
     *
     * socket.user._id
     */
    socket.user = user;

    /**
     * Chuẩn hóa userId để sử dụng dễ dàng.
     */
    socket.userId = user._id.toString();

    console.log("[SocketAuth] Socket authenticated for user:", socket.userId);

    next();
  } catch (error) {
    console.error("[SocketAuth] Authentication error:", error.message);

    return next(new Error("UNAUTHORIZED"));
  }
};

module.exports = socketAuth;
