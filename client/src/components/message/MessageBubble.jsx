import { Check, CheckCheck } from "lucide-react";

function MessageBubble({ message, currentUserId }) {
  if (message.type === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-[#837560] bg-[#eeeeee] px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  // Determine if message is sent by current user
  const senderId = typeof message.sender === "object" 
    ? message.sender?._id?.toString() 
    : message.sender?.toString();
  
  const isMe = senderId === currentUserId?.toString();

  // Determine if message is an image
  const isImageMessage =
    message.type === "image" ||
    Boolean(message.image) ||
    (typeof message.content === "string" &&
      (message.content.startsWith("http://") ||
        message.content.startsWith("https://")) &&
      (message.content.includes("cloudinary.com") ||
        message.content.includes("/uploads/") ||
        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(message.content)));

  const imageUrl = message.image || (isImageMessage ? message.content : null);

  // Determine if message is read
  const isRead = message.readBy && Array.isArray(message.readBy) && message.readBy.length > 1;

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const displayTime = formatTime(message.createdAt || message.timestamp);

  return (
    <div
      className={`
        flex
        flex-col
        gap-1
        max-w-[85%]
        md:max-w-[70%]
        ${isMe ? "items-end self-end" : "items-start self-start"}
      `}
    >
      {/* Image or Text */}
      {isImageMessage && imageUrl ? (
        <div
          className={`
            overflow-hidden
            rounded-2xl
            shadow-sm
            border-2
            bg-white
            ${
              isMe
                ? "rounded-tr-sm border-[#ffba00]/20"
                : "rounded-tl-sm border-[#eeeeee]"
            }
          `}
        >
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={imageUrl}
              alt="Ảnh tin nhắn"
              className="max-h-64 w-auto max-w-full rounded-xl object-contain block sm:max-w-xs"
              loading="lazy"
            />
          </a>
        </div>
      ) : (
        <div
          className={`
            px-4
            py-3
            rounded-2xl
            shadow-sm
            ${
              isMe
                ? "bg-[#ffba00] text-[#271900] rounded-tr-sm"
                : "bg-[#e8e8e8] text-[#1a1c1c] rounded-tl-sm"
            }
          `}
        >
          <p className="text-[15px] leading-relaxed break-words">
            {message.content}
          </p>
        </div>
      )}

      {/* Meta */}
      <div
        className={`
          flex
          items-center
          gap-1
          ${isMe ? "mr-1" : "ml-1"}
        `}
      >
        <span className="text-[11px] text-[#837560]">
          {message.seenText || displayTime}
        </span>

        {isMe && (
          <>
            {isRead ? (
              <CheckCheck size={14} className="text-[#7b5800]" />
            ) : (
              <Check size={14} className="text-[#837560]" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
