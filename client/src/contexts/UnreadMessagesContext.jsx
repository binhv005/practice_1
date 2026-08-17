import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { socket, connectSocket } from "../socket/socket";
import { getConversations } from "../services/messageApi";
import { getMeApi } from "../api/authApi";

const UnreadMessagesContext = createContext();

export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error("useUnreadMessages must be used within UnreadMessagesProvider");
  }
  return context;
};

export const UnreadMessagesProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);

          // Verify with server
          try {
            const response = await getMeApi();
            if (response.data.success) {
              setCurrentUser(response.data.user);
              localStorage.setItem("user", JSON.stringify(response.data.user));
            }
          } catch (error) {
            console.error("Token expired or invalid");
            localStorage.removeItem("user");
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error("Load user error:", error);
      }
    };

    loadUser();
  }, []);

  // Load unread count from conversations
  const loadUnreadCount = useCallback(async () => {
    if (!currentUser?._id && !currentUser?.id) {
      return;
    }

    try {
      const response = await getConversations();
      const conversations = response?.data?.conversations || response?.conversations || [];
      
      const total = conversations.reduce((sum, conv) => {
        return sum + (conv.unreadCount || 0);
      }, 0);

      console.log("[UnreadMessages] Total unread count:", total);
      setUnreadCount(total);
    } catch (error) {
      console.error("Load unread count error:", error);
    }
  }, [currentUser]);

  // Connect socket when user is logged in
  useEffect(() => {
    if (!currentUser?._id && !currentUser?.id) {
      return;
    }

    console.log("[UnreadMessages] Connecting socket for user:", currentUser._id || currentUser.id);
    connectSocket();
    loadUnreadCount();

    // Monitor socket connection status
    const handleConnect = () => {
      console.log("[UnreadMessages] Socket connected");
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log("[UnreadMessages] Socket disconnected");
      setSocketConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Check initial connection state
    if (socket.connected) {
      setSocketConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [currentUser, loadUnreadCount]);

  // Listen for socket events
  useEffect(() => {
    if (!currentUser?._id && !currentUser?.id) {
      return;
    }

    if (!socketConnected) {
      console.log("[UnreadMessages] Socket not connected yet, waiting...");
      return;
    }

    const userId = (currentUser?._id || currentUser?.id)?.toString();
    console.log("[UnreadMessages] Setting up message listeners for user:", userId);

    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log("[UnreadMessages] Received message:new event", message);
      
      const senderId = typeof message.sender === "object" 
        ? message.sender?._id?.toString() 
        : message.sender?.toString();

      console.log("[UnreadMessages] Sender ID:", senderId, "Current User ID:", userId);

      // Only increment if message is from someone else
      if (senderId && senderId !== userId) {
        console.log("[UnreadMessages] Message from another user, incrementing count");
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          console.log("[UnreadMessages] Unread count updated:", prev, "->", newCount);
          return newCount;
        });
      } else {
        console.log("[UnreadMessages] Message from current user, not incrementing");
      }
    };

    // Listen for conversation updated
    const handleConversationUpdated = (data) => {
      console.log("[UnreadMessages] Received conversation:updated event", data);
      
      if (data.unreadCountIncrement) {
        setUnreadCount((prev) => {
          const newCount = prev + data.unreadCountIncrement;
          console.log("[UnreadMessages] Unread count incremented by", data.unreadCountIncrement, ":", prev, "->", newCount);
          return newCount;
        });
      }
    };

    // Listen for message read
    const handleMessageRead = () => {
      console.log("[UnreadMessages] Received message:read:update event, reloading count");
      loadUnreadCount();
    };

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("message:read:update", handleMessageRead);

    console.log("[UnreadMessages] Message listeners attached");

    return () => {
      console.log("[UnreadMessages] Removing message listeners");
      socket.off("message:new", handleNewMessage);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("message:read:update", handleMessageRead);
    };
  }, [currentUser, socketConnected, loadUnreadCount]);

  // Function to manually update unread count (call this when marking messages as read)
  const updateUnreadCount = useCallback((newCount) => {
    console.log("[UnreadMessages] Manually updating unread count to:", newCount);
    setUnreadCount(newCount);
  }, []);

  // Function to decrease unread count
  const decreaseUnreadCount = useCallback((amount = 1) => {
    setUnreadCount((prev) => {
      const newCount = Math.max(0, prev - amount);
      console.log("[UnreadMessages] Decreasing unread count by", amount, ":", prev, "->", newCount);
      return newCount;
    });
  }, []);

  // Function to refresh unread count
  const refreshUnreadCount = useCallback(() => {
    console.log("[UnreadMessages] Refreshing unread count");
    loadUnreadCount();
  }, [loadUnreadCount]);

  const value = {
    unreadCount,
    updateUnreadCount,
    decreaseUnreadCount,
    refreshUnreadCount,
  };

  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export default UnreadMessagesContext;
