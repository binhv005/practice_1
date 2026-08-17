import { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    
    setToasts((prev) => [...prev, toast]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message) => addToast(message, "success"),
    error: (message) => addToast(message, "error"),
    warning: (message) => addToast(message, "warning"),
    info: (message) => addToast(message, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.array.isRequired,
  removeToast: PropTypes.func.isRequired,
};

const Toast = ({ toast, onClose }) => {
  const { type, message } = toast;

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`
        ${styles[type]}
        min-w-[320px] max-w-md
        px-4 py-3
        rounded-xl
        border-2
        shadow-lg
        flex items-start gap-3
        animate-slide-in
        pointer-events-auto
      `}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center font-bold">
        {icons[type]}
      </div>
      <div className="flex-1 text-sm font-medium leading-5">{message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center opacity-50 hover:opacity-100 transition"
      >
        ✕
      </button>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
