import { Check, CheckCheck } from "lucide-react";

function MessageBubble({ message, currentUserId }) {
  // Debug logging - ALWAYS log for image messages
  console.log("🔍 MessageBubble received message:", {
    _id: message._id,
    type: message.type,
    hasImagesField: Boolean(message.images),
    imagesArray: message.images,
    imagesLength: message.images?.length,
    hasImageField: Boolean(message.image),
    imageField: message.image,
    content: message.content,
    fullMessage: message
  });

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

  // Check for multiple images
  const hasMultipleImages = message.images && Array.isArray(message.images) && message.images.length > 0;
  
  console.log("🔍 Image Check:", {
    hasMultipleImages,
    imageField: message.image,
    imagesField: message.images,
    messageType: message.type
  });
  
  // Determine if message is a single image (legacy support)
  const isImageMessage =
    message.type === "image" ||
    Boolean(message.image) ||
    hasMultipleImages ||
    (typeof message.content === "string" &&
      (message.content.startsWith("http://") ||
        message.content.startsWith("https://")) &&
      (message.content.includes("cloudinary.com") ||
        message.content.includes("/uploads/") ||
        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(message.content)));

  const imageUrl = message.image || (isImageMessage && !hasMultipleImages ? message.content : null);
  const imageUrls = hasMultipleImages ? message.images : (imageUrl ? [imageUrl] : []);

  console.log("🎨 Final Render Decision:", {
    isImageMessage,
    imageUrl,
    imageUrls,
    imageUrlsLength: imageUrls.length,
    willRenderImages: isImageMessage && imageUrls.length > 0,
    firstImageUrl: imageUrls[0]
  });

  // Determine if message is read
  const isRead = message.readBy && Array.isArray(message.readBy) && message.readBy.length > 1;

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const displayTime = formatTime(message.createdAt || message.timestamp);

  // Grid layout based on number of images
  const getGridClass = (count) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2";
    if (count === 4) return "grid-cols-2";
    return "grid-cols-3"; // 5 images
  };

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
      {/* Images Grid */}
      {isImageMessage && imageUrls.length > 0 ? (
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
          <div className={`grid gap-1 p-1 ${getGridClass(imageUrls.length)}`}>
            {imageUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg hover:opacity-90 transition"
              >
                <img
                  src={url}
                  alt={`Ảnh ${index + 1}`}
                  className={`
                    w-full object-cover
                    ${imageUrls.length === 1 ? "max-h-64" : "h-32 sm:h-40"}
                    ${imageUrls.length === 3 && index === 0 ? "row-span-2 h-full" : ""}
                  `}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
          {/* Optional caption for images */}
          {message.content && 
           !message.content.startsWith("[") && 
           !message.content.startsWith("http") && (
            <div className="px-3 py-2 bg-gray-50 border-t">
              <p className="text-sm text-gray-700">{message.content}</p>
            </div>
          )}
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
