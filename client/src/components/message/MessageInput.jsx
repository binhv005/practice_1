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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // Array of {file, preview, uploading}
  const [imageError, setImageError] = useState("");

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

    if (!content && selectedImages.length === 0) return;

    // No message length validation - allow unlimited characters

    // If has images, send them
    if (selectedImages.length > 0) {
      handleSendImages();
      return;
    }

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
    if (uploadingImages) return;
    if (selectedImages.length >= 5) {
      setImageError("Tối đa 5 ảnh mỗi tin nhắn");
      setTimeout(() => setImageError(""), 3000);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Check total count
    const remainingSlots = 5 - selectedImages.length;
    if (files.length > remainingSlots) {
      setImageError(`Chỉ có thể thêm ${remainingSlots} ảnh nữa (tối đa 5 ảnh)`);
      setTimeout(() => setImageError(""), 3000);
      event.target.value = "";
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setImageError("Vui lòng chỉ chọn file hình ảnh (JPG, PNG, WebP...)");
        setTimeout(() => setImageError(""), 3000);
        event.target.value = "";
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setImageError("Kích thước mỗi ảnh không được vượt quá 10MB");
        setTimeout(() => setImageError(""), 3000);
        event.target.value = "";
        return;
      }
    }

    // Add files to selected images with preview
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    event.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => {
      const updated = [...prev];
      // Revoke object URL to prevent memory leak
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
    setImageError("");
  };

  const handleSendImages = async () => {
    if (selectedImages.length === 0) {
      console.error("❌ handleSendImages: No images selected!");
      return;
    }

    // No message length validation - allow unlimited characters

    console.log("🚀 handleSendImages START - NEW CODE VERSION 3.0");
    console.log("Selected images count:", selectedImages.length);
    console.log("Selected images:", selectedImages);

    try {
      setUploadingImages(true);

      // Upload all images in parallel
      const uploadPromises = selectedImages.map(async (img) => {
        try {
          const response = await uploadProductImage(img.file);
          console.log("Upload response:", response);
          // Extract correct path: response.data.data.imageUrl
          const imageUrl = response?.data?.data?.imageUrl;
          if (!imageUrl) {
            console.error("Invalid upload response structure:", response);
            return null;
          }
          console.log("Extracted imageUrl:", imageUrl);
          return imageUrl;
        } catch (error) {
          console.error("Upload single image failed:", error);
          return null;
        }
      });

      const imageUrls = await Promise.all(uploadPromises);
      console.log("All upload results:", imageUrls);

      // Check if all uploads succeeded
      const validUrls = imageUrls.filter((url) => url && typeof url === 'string');
      if (validUrls.length === 0) {
        throw new Error("Không nhận được đường dẫn ảnh sau khi upload");
      }

      console.log("Valid image URLs to send:", validUrls);

      console.log("🔥 CALLING onSend WITH:", {
        type: "image",
        images: validUrls,
        content: content || `[${validUrls.length} Hình ảnh]`,
      });

      onSend({
        type: "image",
        images: validUrls,
        content: content || `[${validUrls.length} Hình ảnh]`,
      });

      // Clear selected images and message
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setSelectedImages([]);
      setMessage("");
      setImageError("");

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "44px";
          textareaRef.current.style.overflowY = "hidden";
        }
      });
    } catch (error) {
      console.error("Upload images error:", error);
      setImageError("Không thể gửi ảnh. Vui lòng thử lại!");
      setTimeout(() => setImageError(""), 3000);
    } finally {
      setUploadingImages(false);
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
      {/* Hidden File Input - Allow multiple */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Preview Area */}
      {selectedImages.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl">
          {selectedImages.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.preview}
                alt={`Preview ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="
                  absolute -top-2 -right-2
                  w-6 h-6
                  bg-red-500 text-white
                  rounded-full
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition
                  hover:bg-red-600
                "
                aria-label="Xóa ảnh"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-xs text-center">
            {selectedImages.length}/5
          </div>
        </div>
      )}

      {/* Error Message */}
      {imageError && (
        <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {imageError}
        </div>
      )}

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
            disabled={uploadingImages}
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
            {uploadingImages ? (
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
          disabled={!message.trim() && selectedImages.length === 0}
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
