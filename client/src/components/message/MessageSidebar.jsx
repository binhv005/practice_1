import { ArrowLeft, Search, X } from "lucide-react";
import { useMemo, useState, useCallback, useEffect } from "react";
import ConversationItem from "./ConversationItem";
import { searchConversations as searchConversationsAPI } from "../../services/messageApi";

function MessageSidebar({
  conversations = [],
  selectedConversation,
  onSelectConversation,
  onBack,
  currentUserId,
  loading = false,
}) {
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("local"); // 'local' or 'server'
  const [serverSearchResults, setServerSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Local search - tìm kiếm nhanh trong danh sách hiện tại
  const localFilteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const otherUser =
        conversation.otherParticipant ||
        conversation.participants?.find(
          (participant) =>
            participant._id?.toString() !== currentUserId?.toString(),
        );

      const fullname = otherUser?.fullname || "";
      const email = otherUser?.email || "";
      const lastMessage = conversation.lastMessage?.content || "";

      return (
        fullname.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        lastMessage.toLowerCase().includes(keyword)
      );
    });
  }, [conversations, search, currentUserId]);

  // Server search - tìm kiếm chính xác hơn trên server
  const handleServerSearch = useCallback(async (keyword) => {
    if (!keyword || !keyword.trim()) {
      setServerSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await searchConversationsAPI(keyword);
      
      if (response.success) {
        setServerSearchResults(response.conversations || []);
      }
    } catch (error) {
      console.error("Server search error:", error);
      setServerSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce server search
  useEffect(() => {
    if (searchMode !== "server" || !search.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      handleServerSearch(search);
    }, 500); // Đợi 500ms sau khi user ngừng gõ

    return () => clearTimeout(timer);
  }, [search, searchMode, handleServerSearch]);

  // Chọn kết quả hiển thị dựa trên mode
  const displayedConversations = searchMode === "server" && search.trim()
    ? serverSearchResults
    : localFilteredConversations;

  const clearSearch = () => {
    setSearch("");
    setServerSearchResults([]);
  };

  return (
    <aside className="flex w-full shrink-0 flex-col h-full border-r border-[#eeeeee] bg-white">
      <div className="p-4 border-b border-[#eeeeee]">
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={onBack}
            className="
              p-2
              -ml-2
              rounded-full
              hover:bg-[#f3f3f3]
              text-[#504532]
              transition
            "
            aria-label="Quay lại trang chủ"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-2xl font-bold text-[#1a1c1c]">Tin nhắn</h1>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#837560]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="
                w-full
                bg-[#f3f3f3]
                text-[#1a1c1c]
                rounded-full
                py-2
                pl-10
                pr-10
                text-sm
                outline-none
                focus:ring-2
                focus:ring-[#ffba00]/50
                transition
                placeholder:text-[#837560]
              "
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  p-1
                  rounded-full
                  hover:bg-[#e5e5e5]
                  text-[#837560]
                  transition
                "
                aria-label="Xóa tìm kiếm"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search mode toggle */}
          {search.trim() && (
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSearchMode("local")}
                className={`
                  px-3
                  py-1
                  rounded-full
                  transition
                  ${
                    searchMode === "local"
                      ? "bg-[#ffba00] text-[#271900] font-medium"
                      : "bg-[#f3f3f3] text-[#837560] hover:bg-[#e5e5e5]"
                  }
                `}
              >
                Tìm nhanh
              </button>
              <button
                type="button"
                onClick={() => setSearchMode("server")}
                className={`
                  px-3
                  py-1
                  rounded-full
                  transition
                  ${
                    searchMode === "server"
                      ? "bg-[#ffba00] text-[#271900] font-medium"
                      : "bg-[#f3f3f3] text-[#837560] hover:bg-[#e5e5e5]"
                  }
                `}
              >
                Tìm chính xác
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {loading || (searching && searchMode === "server") ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-[#ffba00] animate-spin" />
          </div>
        ) : displayedConversations.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-[#837560]">
            {search
              ? "Không tìm thấy cuộc trò chuyện"
              : "Chưa có cuộc trò chuyện"}
          </div>
        ) : (
          displayedConversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              active={
                selectedConversation?.toString() ===
                conversation._id?.toString()
              }
              currentUserId={currentUserId}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

export default MessageSidebar;
