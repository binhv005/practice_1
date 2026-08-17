import { X } from "lucide-react";
import { useEffect } from "react";

/**
 * Modal Component - Hiển thị popup modal
 * @param {Object} props
 * @param {boolean} props.isOpen - Trạng thái mở/đóng modal
 * @param {function} props.onClose - Callback khi đóng modal
 * @param {string} props.title - Tiêu đề modal
 * @param {React.ReactNode} props.children - Nội dung modal
 * @param {string} props.size - Kích thước: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} props.showCloseButton - Hiển thị nút đóng
 * @param {boolean} props.closeOnBackdropClick - Đóng khi click vào backdrop
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
}) {
  // Prevent body scroll khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/50
        backdrop-blur-sm
        animate-fadeIn
      "
      onClick={handleBackdropClick}
    >
      <div
        className={`
          relative
          w-full
          ${sizeClasses[size]}
          m-4
          rounded-xl
          bg-white
          shadow-2xl
          animate-scaleIn
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-gray-200
              px-6
              py-4
            "
          >
            {title && (
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                "
                aria-label="Đóng"
              >
                <X size={20} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
