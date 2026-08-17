import { useState, useCallback } from "react";

/**
 * Custom hook để quản lý Toast notifications
 * @returns {Object} { toast, showToast, hideToast }
 */
function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (message, type = "info", duration = 3000, position = "top-right") => {
      setToast({
        message,
        type,
        duration,
        position,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}

export default useToast;
