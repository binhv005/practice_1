import { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Toast Component - Hiển thị thông báo popup
 * @param {Object} props
 * @param {string} props.message - Nội dung thông báo
 * @param {string} props.type - Loại: 'success', 'error', 'warning', 'info'
 * @param {number} props.duration - Thời gian tự động đóng (ms), 0 = không tự đóng
 * @param {function} props.onClose - Callback khi đóng toast
 * @param {string} props.position - Vị trí: 'top', 'bottom', 'top-right', 'top-left', 'bottom-right', 'bottom-left'
 */
function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
  position = "top-right",
}) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Icon theo type
  const icons = {
    success: <CheckCircle2 size={20} strokeWidth={2} />,
    error: <AlertCircle size={20} strokeWidth={2} />,
    warning: <AlertTriangle size={20} strokeWidth={2} />,
    info: <Info size={20} strokeWidth={2} />,
  };

  // Colors theo type
  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "text-green-500",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-500",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-500",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-500",
    },
  };

  // Position styles
  const positions = {
    "top": "top-4 left-1/2 -translate-x-1/2",
    "bottom": "bottom-4 left-1/2 -translate-x-1/2",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div
      className={`
        fixed
        z-[9999]
        ${positions[position]}
        animate-slideIn
      `}
    >
      <div
        className={`
          flex
          min-w-[320px]
          max-w-md
          items-start
          gap-3
          rounded-lg
          border
          ${currentStyle.border}
          ${currentStyle.bg}
          p-4
          shadow-lg
          backdrop-blur-sm
        `}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 ${currentStyle.icon}`}>
          {icons[type]}
        </div>

        {/* Message */}
        <div className={`flex-1 text-sm font-medium ${currentStyle.text}`}>
          {message}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className={`
            flex-shrink-0
            transition-opacity
            hover:opacity-70
            ${currentStyle.text}
          `}
          aria-label="Đóng"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default Toast;
