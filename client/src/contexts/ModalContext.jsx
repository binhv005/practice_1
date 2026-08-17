import { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { AlertCircle, X } from "lucide-react";

const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const confirm = useCallback(
    ({
      title = "Xác nhận",
      message,
      confirmText = "Xác nhận",
      cancelText = "Hủy",
      type = "default", // default, danger, warning
    }) => {
      return new Promise((resolve) => {
        setModal({
          title,
          message,
          confirmText,
          cancelText,
          type,
          onConfirm: () => {
            setModal(null);
            resolve(true);
          },
          onCancel: () => {
            setModal(null);
            resolve(false);
          },
        });
      });
    },
    []
  );

  const alert = useCallback(
    ({ title = "Thông báo", message, buttonText = "OK", type = "info" }) => {
      return new Promise((resolve) => {
        setModal({
          title,
          message,
          buttonText,
          type,
          isAlert: true,
          onConfirm: () => {
            setModal(null);
            resolve(true);
          },
        });
      });
    },
    []
  );

  const close = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{ confirm, alert, close }}>
      {children}
      {modal && <ConfirmModal {...modal} />}
    </ModalContext.Provider>
  );
};

ModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const ConfirmModal = ({
  title,
  message,
  confirmText,
  cancelText,
  buttonText,
  type,
  isAlert,
  onConfirm,
  onCancel,
}) => {
  // Xác định màu sắc dựa trên type
  const getButtonColors = () => {
    switch (type) {
      case "danger":
        return {
          confirm: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          icon: "text-red-600",
          iconBg: "bg-red-100",
        };
      case "warning":
        return {
          confirm: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
          icon: "text-amber-600",
          iconBg: "bg-amber-100",
        };
      case "info":
        return {
          confirm: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          icon: "text-blue-600",
          iconBg: "bg-blue-100",
        };
      default:
        return {
          confirm: "bg-gray-900 hover:bg-gray-800 focus:ring-gray-500",
          icon: "text-gray-600",
          iconBg: "bg-gray-100",
        };
    }
  };

  const colors = getButtonColors();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-fade-in"
        onClick={isAlert ? onConfirm : onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
          {/* Header */}
          <div className="flex items-start gap-4 p-6 pb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center`}>
              <AlertCircle className={`w-6 h-6 ${colors.icon}`} strokeWidth={2} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              {message && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {message}
                </p>
              )}
            </div>
            {!isAlert && (
              <button
                onClick={onCancel}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X size={20} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-2">
            {!isAlert && (
              <button
                onClick={onCancel}
                className="
                  flex-1 px-4 py-2.5 rounded-xl
                  bg-gray-100 hover:bg-gray-200
                  text-sm font-semibold text-gray-700
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                "
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`
                ${isAlert ? "w-full" : "flex-1"}
                px-4 py-2.5 rounded-xl
                ${colors.confirm}
                text-sm font-semibold text-white
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                shadow-sm hover:shadow
              `}
            >
              {isAlert ? buttonText : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

ConfirmModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  buttonText: PropTypes.string,
  type: PropTypes.oneOf(["default", "danger", "warning", "info"]),
  isAlert: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};
