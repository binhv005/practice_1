import { useCallback, useEffect, useState } from "react";

import useSocket from "./useSocket";
import { getMessages } from "../services/messageApi";

const useChat = (conversationId) => {
  const { socket, connected } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getMessages(conversationId);

      setMessages(response.messages || []);
    } catch (err) {
      console.error("Load messages error:", err);

      setError(err.response?.data?.message || "Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!socket || !connected || !conversationId) {
      return;
    }

    socket.emit(
      "conversation:join",
      {
        conversationId,
      },
      (response) => {
        if (!response?.success) {
          setError(response?.message || "Không thể tham gia cuộc trò chuyện");
        }
      },
    );

    const handleNewMessage = (message) => {
      if (message.conversation?.toString() !== conversationId.toString()) {
        return;
      }

      setMessages((prev) => {
        const exists = prev.some(
          (item) => item._id?.toString() === message._id?.toString(),
        );

        if (exists) {
          return prev;
        }

        return [...prev, message];
      });
    };

    const handleTypingStart = ({
      conversationId: eventConversationId,
      userId,
    }) => {
      if (eventConversationId?.toString() !== conversationId.toString()) {
        return;
      }

      setTypingUsers((prev) => {
        if (prev.includes(userId)) {
          return prev;
        }

        return [...prev, userId];
      });
    };

    const handleTypingStop = ({
      conversationId: eventConversationId,
      userId,
    }) => {
      if (eventConversationId?.toString() !== conversationId.toString()) {
        return;
      }

      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    };

    socket.on("message:new", handleNewMessage);

    socket.on("typing:start", handleTypingStart);

    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.emit("conversation:leave", {
        conversationId,
      });

      socket.off("message:new", handleNewMessage);

      socket.off("typing:start", handleTypingStart);

      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, connected, conversationId]);

  const sendMessage = useCallback(
    (content) => {
      return new Promise((resolve, reject) => {
        if (!socket || !connected) {
          reject(new Error("Socket chưa kết nối"));

          return;
        }

        if (!conversationId) {
          reject(new Error("Chưa chọn cuộc trò chuyện"));

          return;
        }

        if (!content?.trim()) {
          reject(new Error("Tin nhắn không được để trống"));

          return;
        }

        setSending(true);

        socket.emit(
          "message:send",
          {
            conversationId,
            content: content.trim(),
          },
          (response) => {
            setSending(false);

            if (!response?.success) {
              const message = response?.message || "Không thể gửi tin nhắn";

              setError(message);
              reject(new Error(message));

              return;
            }

            resolve(response.message);
          },
        );
      });
    },
    [socket, connected, conversationId],
  );

  const startTyping = useCallback(() => {
    if (!socket || !connected || !conversationId) {
      return;
    }

    socket.emit("typing:start", {
      conversationId,
    });
  }, [socket, connected, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket || !connected || !conversationId) {
      return;
    }

    socket.emit("typing:stop", {
      conversationId,
    });
  }, [socket, connected, conversationId]);

  const markAsRead = useCallback(() => {
    if (!socket || !connected || !conversationId) {
      return;
    }

    socket.emit("message:read", {
      conversationId,
    });
  }, [socket, connected, conversationId]);

  return {
    messages,
    loading,
    sending,
    typingUsers,
    connected,
    error,
    loadMessages,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
};

export default useChat;
