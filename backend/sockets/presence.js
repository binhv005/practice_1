/**
 * Quản lý trạng thái online/offline của user.
 *
 * Một user có thể có nhiều socket:
 *
 * Chrome tab 1
 * Chrome tab 2
 * Mobile
 * Edge
 *
 * Vì vậy:
 *
 * userId -> Set(socketId)
 */

const onlineUsers = new Map();

/**
 * Thêm socket của user.
 *
 * @param {string} userId
 * @param {string} socketId
 */
const addUserSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  const sockets = onlineUsers.get(userId);

  const wasOffline = sockets.size === 0;

  sockets.add(socketId);

  return {
    isFirstConnection: wasOffline,
    socketCount: sockets.size,
  };
};

/**
 * Xóa socket của user.
 *
 * @param {string} userId
 * @param {string} socketId
 */
const removeUserSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);

  if (!sockets) {
    return {
      isOffline: true,
      socketCount: 0,
    };
  }

  sockets.delete(socketId);

  /**
   * Nếu user không còn socket nào,
   * user thực sự offline.
   */
  if (sockets.size === 0) {
    onlineUsers.delete(userId);

    return {
      isOffline: true,
      socketCount: 0,
    };
  }

  return {
    isOffline: false,
    socketCount: sockets.size,
  };
};

/**
 * Kiểm tra user có online hay không.
 *
 * @param {string} userId
 */
const isUserOnline = (userId) => {
  const sockets = onlineUsers.get(userId);

  return Boolean(sockets && sockets.size > 0);
};

/**
 * Lấy toàn bộ socketId của một user.
 *
 * @param {string} userId
 */
const getUserSockets = (userId) => {
  return onlineUsers.get(userId) || new Set();
};

/**
 * Lấy danh sách user đang online.
 */
const getOnlineUserIds = () => {
  return Array.from(onlineUsers.keys());
};

/**
 * Lấy số socket đang hoạt động.
 */
const getOnlineUserCount = () => {
  return onlineUsers.size;
};

module.exports = {
  addUserSocket,
  removeUserSocket,
  isUserOnline,
  getUserSockets,
  getOnlineUserIds,
  getOnlineUserCount,
};
