function ConversationItem({
  conversation,
  active,
  onClick,
  currentUserId,
  online,
}) {
  const otherUser =
    conversation.otherParticipant ||
    conversation.participants?.find(
      (participant) =>
        participant._id?.toString() !== currentUserId?.toString(),
    );

  const unread = conversation.unreadCount || 0;

  const lastMessage = conversation.lastMessage;

  const name = otherUser?.fullname || "Người dùng";

  const avatar = otherUser?.avatar || "";

  const avatarLetter = name.charAt(0).toUpperCase();

  const avatarClass = "bg-[#ffba00] text-[#1a1c1c]";

  const lastMessageText = lastMessage?.content || "Chưa có tin nhắn";

  const time =
    lastMessage?.createdAt || conversation.lastMessageAt
      ? new Date(
          lastMessage?.createdAt || conversation.lastMessageAt,
        ).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        flex
        items-center
        gap-3
        p-3
        px-4
        text-left
        transition-colors
        border-l-2
        ${
          active
            ? "bg-[#ffba00]/15 border-[#7b5800]"
            : "border-transparent hover:bg-[#f3f3f3]"
        }
      `}
    >
      <div className="relative w-12 h-12 shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-full h-full rounded-full object-cover bg-[#e8e8e8]"
          />
        ) : (
          <div
            className={`
              w-full
              h-full
              rounded-full
              flex
              items-center
              justify-center
              text-lg
              font-bold
              ${avatarClass}
            `}
          >
            {avatarLetter}
          </div>
        )}

        {online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <span
            className={`
              text-[15px]
              truncate
              ${unread > 0 || active ? "font-semibold" : "font-medium"}
            `}
          >
            {name}
          </span>

          <span
            className={`
              text-[12px]
              shrink-0
              ${unread > 0 ? "text-[#7b5800]" : "text-[#837560]"}
            `}
          >
            {time}
          </span>
        </div>

        <p
          className={`
            text-[13px]
            truncate
            ${unread > 0 ? "text-[#1a1c1c] font-medium" : "text-[#837560]"}
          `}
        >
          {lastMessageText}
        </p>
      </div>

      {unread > 0 && (
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffba00] shrink-0" />
      )}
    </button>
  );
}

export default ConversationItem;
