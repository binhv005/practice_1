import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://practice-1-h6t5.onrender.com/api";
const CONVERSATION_API_URL = `${BASE_URL}/conversations`;

export const getConversations = () => {
  return axios.get(CONVERSATION_API_URL, {
    withCredentials: true,
  });
};

export const createConversation = (userIdOrData, maybeProductId) => {
  const payload =
    typeof userIdOrData === "object" && userIdOrData !== null
      ? userIdOrData
      : {
          userId: userIdOrData,
          ...(maybeProductId ? { productId: maybeProductId } : {}),
        };

  return axios.post(CONVERSATION_API_URL, payload, {
    withCredentials: true,
  });
};

export const getConversation = (conversationId) => {
  return axios.get(`${CONVERSATION_API_URL}/${conversationId}`, {
    withCredentials: true,
  });
};

export const getMessages = (conversationId) => {
  return axios.get(`${CONVERSATION_API_URL}/${conversationId}/messages`, {
    withCredentials: true,
  });
};

export const sendMessage = ({
  conversationId,
  content,
  type = "text",
  image = null,
}) => {
  return axios.post(
    `${CONVERSATION_API_URL}/${conversationId}/messages`,
    {
      content,
      type,
      image,
    },
    {
      withCredentials: true,
    },
  );
};

export const markConversationAsRead = (conversationId) => {
  return axios.patch(
    `${CONVERSATION_API_URL}/${conversationId}/read`,
    {},
    {
      withCredentials: true,
    },
  );
};
