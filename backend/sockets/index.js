const { Server } = require("socket.io");

const socketAuth = require("./socketAuth");

const { addUserSocket, removeUserSocket } = require("./presence");

const { registerMessageSocket } = require("./messageSocket");

/**
 * Khởi tạo Socket.IO.
 *
 * @param {http.Server} httpServer
 */
const initializeSocket = (httpServer) => {
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigin,
      credentials: true,
      methods: ["GET", "POST"],
    },

    /**
     * Performance optimizations
     */
    pingTimeout: 60000, // How long to wait for ping response before disconnect
    pingInterval: 25000, // How often to ping clients (default: 25000)
    upgradeTimeout: 10000, // Time to wait for upgrade to WebSocket
    maxHttpBufferSize: 1e6, // 1MB max message size
    
    /**
     * Transports optimization - prefer WebSocket
     */
    transports: ['websocket', 'polling'],
    allowUpgrades: true,

    /**
     * Cho phép reconnect.
     */
    connectionStateRecovery: {
      /**
       * Server lưu packet trong một khoảng thời gian
       * để client có cơ hội recover khi mất connection ngắn.
       */
      maxDisconnectionDuration: 2 * 60 * 1000,

      /**
       * Không cần fetch auth session từ server
       * vì authentication vẫn được kiểm tra bằng JWT.
       */
      skipMiddlewares: false,
    },
  });

  /**
   * ======================================================
   * SOCKET AUTHENTICATION
   * ======================================================
   */
  io.use(socketAuth);

  /**
   * ======================================================
   * CONNECTION
   * ======================================================
   */
  io.on("connection", (socket) => {
    const userId = socket.userId;

    console.log(`[Socket] User connected: ${userId} | socket: ${socket.id}`);

    /**
     * Mỗi user có một private room.
     *
     * Ví dụ:
     *
     * user:66abc123
     *
     * Room này rất hữu ích để server gửi notification
     * trực tiếp tới một user.
     */
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    console.log(`[Socket] User ${userId} joined room: ${userRoom}`);

    /**
     * Presence.
     */
    const presenceResult = addUserSocket(userId, socket.id);

    console.log(`[Socket] Presence result for ${userId}:`, presenceResult);

    /**
     * Chỉ emit online khi đây là socket đầu tiên.
     *
     * Nếu user mở tab thứ 2:
     *
     * không emit online lần nữa.
     */
    if (presenceResult.isFirstConnection) {
      console.log(`[Socket] Emitting user:online for ${userId}`);
      io.emit("user:online", {
        userId,
      });
    }

    /**
     * Đăng ký message events.
     */
    registerMessageSocket(io, socket);

    /**
     * ====================================================
     * DISCONNECT
     * ====================================================
     */
    socket.on("disconnect", (reason) => {
      console.log(
        `[Socket] User disconnected: ${userId} | socket: ${socket.id} | reason: ${reason}`,
      );

      const result = removeUserSocket(userId, socket.id);

      console.log(`[Socket] Disconnect result for ${userId}:`, result);

      /**
       * Chỉ emit offline khi user thực sự không còn
       * socket nào hoạt động.
       */
      if (result.isOffline) {
        console.log(`[Socket] Emitting user:offline for ${userId}`);
        io.emit("user:offline", {
          userId,
        });
      }
    });

    /**
     * Error handler.
     */
    socket.on("error", (error) => {
      console.error(`[Socket] Error for user ${userId}:`, error);
    });
  });

  return io;
};

module.exports = initializeSocket;
