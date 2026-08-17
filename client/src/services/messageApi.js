import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getConversations = async () => {
  const response = await api.get("/conversations");

  return response.data;
};

export const getConversation = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}`);

  return response.data;
};

export const getMessages = async (conversationId, params = {}) => {
  const response = await api.get(`/conversations/${conversationId}/messages`, {
    params,
  });

  return response.data;
};

export const createConversation = async (userIdOrData, maybeProductId) => {
  const payload =
    typeof userIdOrData === "object" && userIdOrData !== null
      ? userIdOrData
      : {
          userId: userIdOrData,
          ...(maybeProductId ? { productId: maybeProductId } : {}),
        };

  const response = await api.post("/conversations", payload);

  return response.data;
};

export const sendMessage = async ({
  conversationId,
  content,
  type = "text",
  image = null,
}) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, {
    content,
    type,
    image,
  });

  return response.data;
};

export const markConversationAsRead = async (conversationId) => {
  const response = await api.patch(`/conversations/${conversationId}/read`, {});

  return response.data;
};

export const sendImageMessage = async (data) => {
  const response = await api.post("/messages/image", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Tìm kiếm conversations
 */
export const searchConversations = async (keyword) => {
  const response = await api.get("/conversations/search", {
    params: { keyword },
  });

  return response.data;
};

/**
 * Tìm kiếm messages trong conversation
 */
export const searchMessages = async (conversationId, keyword, page = 1, limit = 30) => {
  const response = await api.get(`/conversations/${conversationId}/messages/search`, {
    params: { keyword, page, limit },
  });

  return response.data;
};

/**
 * Tìm kiếm users để tạo conversation mới
 */
export const searchUsers = async (keyword, limit = 10) => {
  const response = await api.get("/conversations/search-users", {
    params: { keyword, limit },
  });

  return response.data;
};

export default api;
