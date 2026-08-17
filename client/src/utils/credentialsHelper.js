/**
 * Helper functions để lưu/load credentials với encoding đơn giản
 * 
 * ⚠️ LƯU Ý BẢO MẬT:
 * - Base64 KHÔNG phải là encryption, chỉ là encoding
 * - Attacker vẫn có thể decode dễ dàng
 * - Đây chỉ là giải pháp tạm thời để tránh lưu plaintext
 * - Production nên dùng:
 *   + OAuth/SSO thay vì lưu password
 *   + Hoặc chỉ lưu identifier, không lưu password
 *   + Hoặc dùng encryption library như crypto-js
 */

const STORAGE_KEY = "savedCredentials";

/**
 * Encode string sang Base64
 */
const encode = (str) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error("Encode error:", error);
    return str;
  }
};

/**
 * Decode Base64 về string
 */
const decode = (str) => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (error) {
    console.error("Decode error:", error);
    return str;
  }
};

/**
 * Lưu credentials vào localStorage
 * @param {Object} credentials - { identifier, password, rememberMe }
 */
export const saveCredentials = (credentials) => {
  try {
    const encoded = {
      identifier: encode(credentials.identifier),
      password: encode(credentials.password),
      rememberMe: credentials.rememberMe,
      timestamp: Date.now(), // Để check expiry nếu cần
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(encoded));
    return true;
  } catch (error) {
    console.error("Save credentials error:", error);
    return false;
  }
};

/**
 * Load credentials từ localStorage
 * @returns {Object|null} - { identifier, password, rememberMe } hoặc null
 */
export const loadCredentials = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return null;

    const encoded = JSON.parse(saved);

    // Optional: Check expiry (ví dụ 30 ngày)
    const MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
    if (encoded.timestamp && Date.now() - encoded.timestamp > MAX_AGE) {
      // Credentials quá cũ, xóa đi
      clearCredentials();
      return null;
    }

    return {
      identifier: decode(encoded.identifier),
      password: decode(encoded.password),
      rememberMe: encoded.rememberMe,
    };
  } catch (error) {
    console.error("Load credentials error:", error);
    return null;
  }
};

/**
 * Xóa credentials khỏi localStorage
 */
export const clearCredentials = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Clear credentials error:", error);
    return false;
  }
};

/**
 * Check xem có credentials được lưu không
 * @returns {boolean}
 */
export const hasCredentials = () => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};
