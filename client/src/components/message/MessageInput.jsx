import { useEffect, useRef, useState } from "react";
import { ImagePlus, Smile, Send, Loader2 } from "lucide-react";
import { uploadProductImage } from "../../api/productApi";

const POPULAR_EMOJIS = [
  "😊", "😂", "🥰", "😍", "👍", "🙏", "❤️", "🔥",
  "🎉", "👏", "🙌", "✨", "💯", "😎", "🤩", "🤝",
  "🥳", "🥺", "💡", "📦", "🎁", "👋", "✌️", "👌",
];

function MessageInput({ onSend }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // Click outside to close emoji picker
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleOutsideClick = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !emojiButtonRef.current?.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showEmojiPicker]);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const newHeight = Math.min(textarea.scrollHeight, 120);

    textarea.style.height = `${newHeight}px`;

    textarea.style.overflowY = textarea.scrollHeight > 120 ? "auto" : "hidden";
  };

  const handleChange = (event) => {
    setMessage(event.target.value);

    requestAnimationFrame(() => {
      resizeTextarea();
    });
  };

  const handleSend = () => {
    const content = message.trim();

    if (!content) return;

    onSend(content);

    setMessage("");
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
        textareaRef.current.style.overflowY = "hidden";
      }
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setMessage((prev) => prev + emoji);
      return;
    }

    const start = textarea.selectionStart ?? message.length;
    const end = textarea.selectionEnd ?? message.length;
    const nextMessage = message.slice(0, start) + emoji + message.slice(end);

    setMessage(nextMessage);

    requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = start + emoji.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
      resizeTextarea();
    });
  };

  const handleImageButtonClick = () => {
    if (uploadingImage) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh (JPG, PNG, WebP...)");
      event.target.value = "";
      return;
    }

    // Limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 10MB");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      const response = await uploadProductImage(file);

      const imageUrl =
        response?.data?.data?.imageUrl ||
        response?.data?.imageUrl ||
        response?.data?.url;

      if (!imageUrl) {
        throw new Error("Không nhận được đường dẫn ảnh sau khi upload");
      }

      onSend({
        type: "image",
        image: imageUrl,
        content: "[Hình ảnh]",
      });
    } catch (error) {
      console.error("Upload image message error:", error);
      alert("Không thể gửi ảnh. Vui lòng thử lại!");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div
      className="
        relative
        bg-white
        p-3
        md:p-4
        shadow-[0_-4px_12px_rgba(0,0,0,0.03)]
        z-20
        shrink-0
        border-t
        border-[#eeeeee]
      "
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="
            absolute
            bottom-full
            left-4
            mb-3
            z-50
            grid
            grid-cols-8
            gap-1.5
            rounded-2xl
            border
            border-gray-100
            bg-white
            p-3
            shadow-2xl
            sm:left-6
          "
        >
          {POPULAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiSelect(emoji)}
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                text-lg
                transition
                hover:scale-125
                hover:bg-gray-100
                active:scale-95
              "
              aria-label={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div
        className="
          flex
          items-end
          gap-2
          bg-[#f3f3f3]
          rounded-3xl
          p-1
          pr-2
        "
      >
        {/* Actions */}
        <div className="flex items-center gap-1 pb-1 pl-1 shrink-0">
          <button
            type="button"
            onClick={handleImageButtonClick}
            disabled={uploadingImage}
            className="
              p-2
              rounded-full
              hover:bg-[#eeeeee]
              transition
              text-[#7b5800]
              disabled:opacity-60
            "
            aria-label="Đính kèm ảnh"
          >
            {uploadingImage ? (
              <Loader2 size={24} className="animate-spin text-[#ffba00]" />
            ) : (
              <ImagePlus size={24} />
            )}
          </button>

          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`
              p-2
              rounded-full
              hover:bg-[#eeeeee]
              transition
              ${showEmojiPicker ? "text-[#ffba00] bg-[#eeeeee]" : "text-[#837560]"}
            `}
            aria-label="Emoji"
          >
            <Smile size={24} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Nhập tin nhắn..."
          className="
            flex-1
            bg-transparent
            border-none
            outline-none
            resize-none
            py-3
            px-2
            text-[15px]
            text-[#1a1c1c]
            placeholder:text-[#837560]
            min-h-[44px]
            max-h-[120px]
            leading-tight
            overflow-hidden
          "
        />

        {/* Send */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() && !uploadingImage}
          aria-label="Gửi"
          className="
            bg-[#ffba00]
            text-[#271900]
            w-10
            h-10
            rounded-full
            flex
            items-center
            justify-center
            shrink-0
            mb-0.5
            ml-1
            transition
            hover:scale-105
            active:scale-95
            shadow-md
            disabled:opacity-50
            disabled:cursor-not-allowed
            disabled:hover:scale-100
          "
        >
          <Send size={20} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
}

export default MessageInput;
