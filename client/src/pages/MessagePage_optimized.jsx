import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MessageSidebar from "../components/message/MessageSidebar";
import ChatHeader from "../components/message/ChatHeader";
import ProductContext from "../components/message/ProductContext";
import MessageList from "../components/message/MessageList";
import MessageInput from "../components/message/MessageInput";
import SystemToast from "../components/message/SystemToast";
import MessageEmptyState from "../components/message/MessageEmptyState/MessageEmptyState";

import {
  getConversations,
  getConversation,
  getMessages,
  markConversationAsRead,
  sendMessage,
} from "../services/messageApi";

import { socket, connectSocket, disconnectSocket } from "../socket/socket";

import { getMeApi } from "../api/authApi";
import { useUnreadMessages } from "../contexts/UnreadMessagesContext";

function MessagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUnreadCount, decreaseUnreadCount } = useUnreadMessages();

  /*
   * =====================================================
   * ROUTE STATE
   * =====================================================
   */

  const incomingConversationId = location.state?.conversationId || null;

  const incomingProduct = location.state?.product || null;

  const incomingProductId = location.state?.productId || null;

  /*
   * =====================================================
   * USER
   * =====================================================
   */

  const [currentUser, setCurrentUser] = useState(null);

  const currentUserId = currentUser?._id || currentUser?.id || null;

  /*
   * =====================================================
   * CONVERSATIONS
   * =====================================================
   */

  const [conversations, setConversations] = useState([]);

  const [selectedConversation, setSelectedConversation] = useState(null);

  /*
   * =====================================================
   * MESSAGES
   * =====================================================
   */

  const [messages, setMessages] = useState([]);

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  const [loadingConversations, setLoadingConversations] = useState(true);

  const [loadingMessages, setLoadingMessages] = useState(false);

  const [showToast, setShowToast] = useState(false);

  /*
   * =====================================================
   * DEBUG ROUTE
   * =====================================================
   */

  useEffect(() => {
  }, [
    location.state,
    incomingConversationId,
    incomingProduct,
    incomingProductId,
  ]);

  /*
   * =====================================================
   * DEBUG USER
   * =====================================================
   */

  useEffect(() => {
  }, [currentUser, currentUserId]);

  /*
   * =====================================================
   * SELECTED USER
   * =====================================================
   */

  const selectedUser = useMemo(() => {
    if (!selectedConversation) {
      return null;
    }

    /*
     * Backend có thể trả sẵn otherParticipant
     */

    if (selectedConversation.otherParticipant) {
      return selectedConversation.otherParticipant;
    }

    /*
     * Fallback:
     * tìm participant khác current user
     */

    const participants = selectedConversation.participants || [];

    return (
      participants.find((participant) => {
        const pId = participant?._id
          ? participant._id.toString()
          : participant?.toString();
        return pId && pId !== currentUserId?.toString();
      }) || null
    );
  }, [selectedConversation, currentUserId]);

  /*
   * =====================================================
   * DEBUG SELECTED CONVERSATION
   * =====================================================
   */

  useEffect(() => {
  }, [selectedConversation, loadingConversations, conversations]);

  /*
   * =====================================================
   * LOAD CURRENT USER
   * =====================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      try {
        /*
         * ---------------------------------------------
         * Lấy user từ localStorage trước
         * ---------------------------------------------
         */

        const savedUser = localStorage.getItem("user");

        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);

            if (mounted) {
              setCurrentUser(parsedUser);
            }
          } catch (error) {
            console.error("Parse saved user error:", error);

            localStorage.removeItem("user");
          }
        }

        /*
         * ---------------------------------------------
         * Sau đó xác thực lại bằng API
         * ---------------------------------------------
         */

        const response = await getMeApi();

        if (response?.data?.success && response?.data?.user) {
          const user = response.data.user;

          if (mounted) {
            setCurrentUser(user);
          }

          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch (error) {
        console.error("Load current user error:", error);

        if (error?.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /*
   * =====================================================
   * CONNECT SOCKET
   * =====================================================
   */

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [currentUserId]);

  /*
   * =====================================================
   * LOAD CONVERSATIONS
   * =====================================================
   *
   * Flow:
   *
   * 1. GET conversations
   *
   * 2. Nếu có conversationId từ Product Detail:
   *      tìm trong danh sách
   *
   * 3. Nếu không tìm thấy:
   *      GET conversation/:id
   *
   * 4. Nếu tìm thấy:
   *      setSelectedConversation()
   *
   * 5. Nếu không có conversationId:
   *      chọn conversation đầu tiên
   *
   * =====================================================
   */

  const loadConversations = useCallback(async () => {

    try {
      setLoadingConversations(true);

      /*
       * ---------------------------------------------
       * GET ALL CONVERSATIONS
       * ---------------------------------------------
       */
...");

      const response = await getConversations();

      /*
       * ---------------------------------------------
       * Normalize response
       *
       * Hỗ trợ các dạng:
       *
       * response.data.conversations
       * response.data.data
       * response.data
       * ---------------------------------------------
       */

      let data = [];

      if (Array.isArray(response?.data?.conversations)) {
        data = response.data.conversations;
      } else if (Array.isArray(response?.data?.data)) {
        data = response.data.data;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.conversations)) {
        data = response.conversations;
      }

      /*
       * ---------------------------------------------
       * Update sidebar
       * ---------------------------------------------
       */

      setConversations(data);

      /*
       * ---------------------------------------------
       * Nếu có conversationId từ Product Detail
       * ---------------------------------------------
       */

      if (incomingConversationId) {

        /*
         * Tìm trong danh sách hiện tại
         */

        let targetConversation = data.find(
          (conversation) =>
            conversation?._id?.toString() ===
            incomingConversationId?.toString(),
        );

        /*
         * -------------------------------------------
         * Nếu không tìm thấy trong danh sách
         * → lấy trực tiếp bằng ID
         * -------------------------------------------
         */

        if (!targetConversation) {
:", incomingConversationId);

          try {
            const conversationResponse = await getConversation(
              incomingConversationId,
            );

            /*
             * Normalize conversation response
             */

            if (conversationResponse?.data?.conversation) {
              targetConversation = conversationResponse.data.conversation;
            } else if (conversationResponse?.data?.data) {
              targetConversation = conversationResponse.data.data;
            } else if (conversationResponse?.conversation) {
              targetConversation = conversationResponse.conversation;
            } else if (conversationResponse?.data?._id) {
              targetConversation = conversationResponse.data;
            }
          } catch (error) {
            console.error("Load target conversation error:", error);
          }
        }

        /*
         * -------------------------------------------
         * Nếu đã tìm được conversation
         * -------------------------------------------
         */

        if (targetConversation?._id) {
          /*
           * Product từ Product Detail
           * được ưu tiên.
           */

          const enrichedConversation = {
            ...targetConversation,

            ...(incomingProduct
              ? {
                  product: incomingProduct,
                }
              : {}),
          };

          /*
           * Set selected conversation
           */

          setSelectedConversation(enrichedConversation);

          /*
           * Add/update sidebar
           */

          setConversations((prev) => {
            const conversationId = enrichedConversation._id.toString();

            const exists = prev.some(
              (item) => item?._id?.toString() === conversationId,
            );

            /*
             * Nếu đã tồn tại
             */

            if (exists) {
              return prev.map((item) =>
                item?._id?.toString() === conversationId
                  ? enrichedConversation
                  : item,
              );
            }

            /*
             * Nếu chưa tồn tại
             */

            return [enrichedConversation, ...prev];
          });

          if (window.history?.replaceState) {
            window.history.replaceState({}, document.title);
          }

          return;
        }

        console.error(
          "Conversation could not be loaded:",
          incomingConversationId,
        );
      }

      /*
       * =================================================
       * KHÔNG CÓ CONVERSATION ID
       *
       * Chọn conversation đầu tiên
       * =================================================
       */

      setSelectedConversation((current) => {
        /*
         * Đã có conversation đang chọn
         */

        if (current?._id) {
          const updated = data.find(
            (conversation) =>
              conversation?._id?.toString() === current?._id?.toString(),
          );

          return updated || current;
        }

        /*
         * Chưa có conversation
         */

        return data[0] || null;
      });
    } catch (error) {
      console.error("========== LOAD CONVERSATIONS ERROR ==========");

      console.error(error);

      console.error("response:", error?.response);

      console.error("response.data:", error?.response?.data);

      console.error("==============================================");

      setConversations([]);

      /*
       * Chỉ reset selected conversation
       * nếu không có conversation từ route.
       *
       * Điều này tránh việc request danh sách lỗi
       * làm mất conversation vừa được truyền từ Product Detail.
       */

      if (!incomingConversationId) {
        setSelectedConversation(null);
      }
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUserId, incomingConversationId, incomingProduct]);

  /*
   * =====================================================
   * LOAD CONVERSATIONS AFTER USER READY
   * =====================================================
   */

  useEffect(() => {

    if (!currentUserId) {

      return;
    }
");

    loadConversations();
  }, [currentUserId, loadConversations]);

  /*
   * =====================================================
   * LOAD MESSAGES
   * =====================================================
   */

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);

      const response = await getMessages(conversationId);

      /*
       * Normalize messages response
       */

      let data = [];

      if (Array.isArray(response?.data?.messages)) {
        data = response.data.messages;
      } else if (Array.isArray(response?.data?.data)) {
        data = response.data.data;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.messages)) {
        data = response.messages;
      }

      setMessages(data);
    } catch (error) {
      console.error("Load messages error:", error);

      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  /*
   * =====================================================
   * SELECTED CONVERSATION EFFECT
   *
   * Khi conversation thay đổi:
   *
   * 1. Load messages
   * 2. Mark read
   * 3. Join socket room
   * =====================================================
   */

  useEffect(() => {
    if (!selectedConversation?._id) {
      setMessages([]);
      return;
    }

    const conversationId = selectedConversation._id.toString();

    /*
     * ---------------------------------------------
     * Load message history
     * ---------------------------------------------
     */

    loadMessages(conversationId);

    /*
     * ---------------------------------------------
     * Mark conversation as read
     * ---------------------------------------------
     */

    markConversationAsRead(conversationId).catch((error) => {
      console.error("Mark conversation read error:", error);
    });

    /*
     * ---------------------------------------------
     * Join socket room
     * ---------------------------------------------
     */

    const joinRoom = () => {
      if (!socket?.connected) {

        return;
      }

      socket.emit(
        "conversation:join",
        {
          conversationId,
        },
        (response) => {

          if (response?.success) {
          } else {
            console.error("Join conversation failed:", response?.message);
          }
        },
      );
    };

    /*
     * Socket đã connected
     */

    if (socket?.connected) {
      joinRoom();
    }

    /*
     * Socket chưa connected
     * → đợi connect
     */

    socket?.on("connect", joinRoom);

    /*
     * Cleanup
     */

    return () => {
      socket?.off("connect", joinRoom);

      if (socket?.connected) {

        socket.emit("conversation:leave", {
          conversationId,
        });
      }
    };
  }, [selectedConversation?._id, loadMessages]);

  /*
   * =====================================================
   * REALTIME MESSAGE
   * =====================================================
   */

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleNewMessage = (message) => {

      if (!message?._id) {
        return;
      }

      /*
       * ---------------------------------------------
       * Conversation ID
       * ---------------------------------------------
       */

      const messageConversationId =
        typeof message.conversation === "object"
          ? message.conversation?._id
          : message.conversation;

      const conversationId = messageConversationId?.toString();

      if (!conversationId) {
        return;
      }

      /*
       * ---------------------------------------------
       * Selected conversation ID
       * ---------------------------------------------
       */

      const selectedId = selectedConversation?._id?.toString();

      /*
       * ---------------------------------------------
       * Sender ID
       * ---------------------------------------------
       */

      const senderId =
        typeof message.sender === "object"
          ? message.sender?._id?.toString()
          : message.sender?.toString();

      const userId = currentUserId?.toString();

      /*
       * ---------------------------------------------
       * Flags
       * ---------------------------------------------
       */

      const isCurrentConversation = conversationId === selectedId;

      const isOwnMessage = senderId === userId;

      /*
       * ---------------------------------------------
       * CURRENT CHAT
       * ---------------------------------------------
       */

      if (isCurrentConversation) {
        setMessages((prev) => {
          const exists = prev.some(
            (item) => item?._id?.toString() === message?._id?.toString(),
          );

          if (exists) {
            return prev;
          }

          return [...prev, message];
        });

        /*
         * Nếu message từ người khác
         * → mark read
         */

        if (!isOwnMessage) {
          markConversationAsRead(conversationId).catch((error) => {
            console.error("Realtime mark read error:", error);
          });
        }
      }

      /*
       * ---------------------------------------------
       * SIDEBAR
       * ---------------------------------------------
       */

      setConversations((prev) => {
        const index = prev.findIndex(
          (conversation) => conversation?._id?.toString() === conversationId,
        );

        /*
         * Conversation chưa tồn tại
         * trong sidebar
         */

        if (index === -1) {
          return prev;
        }

        const current = prev[index];

        const unreadCount =
          isCurrentConversation || isOwnMessage
            ? 0
            : (current.unreadCount || 0) + 1;

        const updated = {
          ...current,
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unreadCount,
        };

        const next = [...prev];

        next.splice(index, 1);

        /*
         * Conversation mới nhất
         * lên đầu sidebar
         */

        next.unshift(updated);

        return next;
      });

      /*
       * ---------------------------------------------
       * SELECTED CONVERSATION
       * ---------------------------------------------
       */

      setSelectedConversation((current) => {
        if (!current || current?._id?.toString() !== conversationId) {
          return current;
        }

        return {
          ...current,
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unreadCount:
            isCurrentConversation || isOwnMessage
              ? 0
              : current.unreadCount || 0,
        };
      });
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [selectedConversation?._id, currentUserId]);

  /*
   * =====================================================
   * SELECT CONVERSATION
   * =====================================================
   */

  const handleSelectConversation = async (conversation) => {
    if (!conversation?._id) {
      return;
    }

    // Get current unread count before marking as read
    const currentUnreadCount = conversation.unreadCount || 0;

    /*
     * Set selected
     */

    setSelectedConversation(conversation);

    /*
     * Reset unread count
     */

    setConversations((prev) =>
      prev.map((item) =>
        item?._id?.toString() === conversation?._id?.toString()
          ? {
              ...item,
              unreadCount: 0,
            }
          : item,
      ),
    );

    /*
     * Mark read
     */

    try {
      await markConversationAsRead(conversation._id);
      
      // Decrease global unread count
      if (currentUnreadCount > 0) {
        decreaseUnreadCount(currentUnreadCount);
      }
    } catch (error) {
      console.error("Mark selected conversation read error:", error);
    }
  };

  /*
   * =====================================================
   * SEND MESSAGE
   * =====================================================
   */

  const handleSendMessage = async (payload) => {
    if (!selectedConversation?._id) {
      return;
    }

    let trimmedContent = "";
    let type = "text";
    let image = null;

    if (typeof payload === "string") {
      trimmedContent = payload.trim();
    } else if (typeof payload === "object" && payload !== null) {
      trimmedContent = (payload.content || "").trim();
      type = payload.type || "text";
      image = payload.image || null;
    }

    if (type === "text" && !trimmedContent) {
      return;
    }

    if (type === "image" && !image && !trimmedContent) {
      return;
    }

    try {

      const response = await sendMessage({
        conversationId: selectedConversation._id,
        content: trimmedContent || (type === "image" ? "[Hình ảnh]" : ""),
        type,
        image,
      });

      /*
       * ---------------------------------------------
       * Lấy message
       * ---------------------------------------------
       */

      let newMessage =
        response?.data?.message ||
        response?.data?.data ||
        response?.message ||
        null;

      if (!newMessage) {
        console.error("sendMessage không trả về message");

        return;
      }

      /*
       * ---------------------------------------------
       * Add local message
       *
       * Socket có thể gửi lại.
       * Duplicate sẽ được loại bỏ.
       * ---------------------------------------------
       */

      setMessages((prev) => {
        const exists = prev.some(
          (message) => message?._id?.toString() === newMessage?._id?.toString(),
        );

        if (exists) {
          return prev;
        }

        return [...prev, newMessage];
      });

      /*
       * ---------------------------------------------
       * Sidebar
       * ---------------------------------------------
       */

      setConversations((prev) => {
        const index = prev.findIndex(
          (conversation) =>
            conversation?._id?.toString() ===
            selectedConversation?._id?.toString(),
        );

        if (index === -1) {
          return prev;
        }

        const updated = {
          ...prev[index],
          lastMessage: newMessage,
          lastMessageAt: newMessage.createdAt,
          unreadCount: 0,
        };

        const next = [...prev];

        next.splice(index, 1);

        next.unshift(updated);

        return next;
      });

      /*
       * ---------------------------------------------
       * Selected conversation
       * ---------------------------------------------
       */

      setSelectedConversation((current) => {
        if (
          !current ||
          current?._id?.toString() !== selectedConversation?._id?.toString()
        ) {
          return current;
        }

        return {
          ...current,
          lastMessage: newMessage,
          lastMessageAt: newMessage.createdAt,
          unreadCount: 0,
        };
      });
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  /*
   * =====================================================
   * PRODUCT RECEIVED
   * =====================================================
   */

  const handleReceiveProduct = () => {
    handleSendMessage("Xin chào! Tôi quan tâm và muốn nhận sản phẩm này.");
  };

  /*
   * =====================================================
   * BACK
   * =====================================================
   */

  const handleBack = () => {
    navigate("/");
  };

  /*
   * =====================================================
   * PRODUCT
   * =====================================================
   *
   * Ưu tiên product truyền từ Product Detail.
   *
   * Nếu không có thì lấy conversation.product.
   *
   * =====================================================
   */

  const chatProduct = incomingProduct || selectedConversation?.product || null;

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <main className="h-screen w-full overflow-hidden bg-[#f9f9f9]">
      <div className="flex h-full w-full overflow-hidden bg-white">
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <div
          className={`
            h-full
            w-full
            md:w-[360px]
            md:min-w-[360px]
            ${selectedConversation ? "hidden md:block" : "block"}
          `}
        >
          <MessageSidebar
            conversations={conversations}
            selectedConversation={selectedConversation?._id}
            onSelectConversation={handleSelectConversation}
            onBack={handleBack}
            loading={loadingConversations}
            currentUserId={currentUserId}
          />
        </div>

        {/* =================================================
            CHAT
        ================================================= */}

        <div
          className={`
            relative
            h-full
            min-w-0
            flex-1
            overflow-hidden
            bg-[#f9f9f9]
            ${selectedConversation ? "flex" : "hidden md:flex"}
          `}
        >
          {/* =================================================
              LOADING CONVERSATIONS
          ================================================= */}

          {loadingConversations ? (
            <div className="flex h-full w-full items-center justify-center bg-[#f9f9f9]">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="
                    h-8
                    w-8
                    animate-spin
                    rounded-full
                    border-2
                    border-gray-200
                    border-t-[#ffba00]
                  "
                />

                <span className="text-sm text-gray-500">
                  Đang tải cuộc trò chuyện...
                </span>
              </div>
            </div>
          ) : !selectedConversation ? (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <MessageEmptyState />
          ) : (
            /* =================================================
               CHAT CONTENT
            ================================================= */

            <div className="flex h-full w-full flex-col bg-[#f9f9f9]">
              {/* =================================================
                  HEADER
              ================================================= */}

              <ChatHeader
                conversation={selectedUser}
                onBack={() => setSelectedConversation(null)}
              />

              {/* =================================================
                  PRODUCT CONTEXT
              ================================================= */}

              {chatProduct && (
                <ProductContext
                  product={chatProduct}
                  onReceive={handleReceiveProduct}
                />
              )}

              {/* =================================================
                  SYSTEM TOAST
              ================================================= */}

              <SystemToast
                show={showToast}
                message="Món đồ này đã tặng cho người khác"
              />

              {/* =================================================
                  MESSAGE LIST
              ================================================= */}

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <div
                      className="
                        h-7
                        w-7
                        animate-spin
                        rounded-full
                        border-2
                        border-gray-200
                        border-t-[#ffba00]
                      "
                    />
                  </div>
                ) : (
                  <MessageList
                    messages={messages}
                    currentUserId={currentUserId}
                  />
                )}
              </div>

              {/* =================================================
                  MESSAGE INPUT
              ================================================= */}

              <MessageInput onSend={handleSendMessage} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default MessagePage;

