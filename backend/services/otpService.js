const { getRedisClient } = require("../config/redis");
const { normalizePhoneNumber } = require("./smsService");

// Fallback in-memory storage khi không có Redis
const inMemoryOTP = new Map();
const inMemoryRateLimit = new Map();
const inMemoryRetry = new Map();

/**
 * Generate mã OTP 6 số ngẫu nhiên
 * @returns {string} - Mã OTP 6 số
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Lưu OTP vào Redis hoặc in-memory
 * @param {string} key - Redis key
 * @param {string} value - Giá trị lưu
 * @param {number} ttl - Thời gian sống (seconds)
 */
const setWithTTL = async (key, value, ttl) => {
  const redis = getRedisClient();

  if (redis && redis.isOpen) {
    try {
      await redis.setEx(key, ttl, value);
    } catch (error) {
      console.error("Redis setEx error:", error.message);
      // Fallback to in-memory
      inMemoryOTP.set(key, { value, expires: Date.now() + ttl * 1000 });
    }
  } else {
    // In-memory storage
    inMemoryOTP.set(key, { value, expires: Date.now() + ttl * 1000 });

    // Auto cleanup
    setTimeout(() => {
      inMemoryOTP.delete(key);
    }, ttl * 1000);
  }
};

/**
 * Lấy giá trị từ Redis hoặc in-memory
 * @param {string} key - Redis key
 * @returns {Promise<string|null>} - Giá trị hoặc null
 */
const get = async (key) => {
  const redis = getRedisClient();

  if (redis && redis.isOpen) {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error("Redis get error:", error.message);
      // Fallback to in-memory
      const data = inMemoryOTP.get(key);
      if (data && data.expires > Date.now()) {
        return data.value;
      }
      return null;
    }
  } else {
    // In-memory storage
    const data = inMemoryOTP.get(key);
    if (data && data.expires > Date.now()) {
      return data.value;
    }
    inMemoryOTP.delete(key);
    return null;
  }
};

/**
 * Xóa key từ Redis hoặc in-memory
 * @param {string} key - Redis key
 */
const del = async (key) => {
  const redis = getRedisClient();

  if (redis && redis.isOpen) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Redis del error:", error.message);
      inMemoryOTP.delete(key);
    }
  } else {
    inMemoryOTP.delete(key);
  }
};

/**
 * Tăng giá trị counter trong Redis hoặc in-memory
 * @param {string} key - Redis key
 * @returns {Promise<number>} - Giá trị sau khi tăng
 */
const incr = async (key) => {
  const redis = getRedisClient();

  if (redis && redis.isOpen) {
    try {
      return await redis.incr(key);
    } catch (error) {
      console.error("Redis incr error:", error.message);
      const current = inMemoryRetry.get(key) || 0;
      const newValue = current + 1;
      inMemoryRetry.set(key, newValue);
      return newValue;
    }
  } else {
    const current = inMemoryRetry.get(key) || 0;
    const newValue = current + 1;
    inMemoryRetry.set(key, newValue);
    return newValue;
  }
};

/**
 * Set expire cho key trong Redis
 * @param {string} key - Redis key
 * @param {number} seconds - Thời gian sống
 */
const expire = async (key, seconds) => {
  const redis = getRedisClient();

  if (redis && redis.isOpen) {
    try {
      await redis.expire(key, seconds);
    } catch (error) {
      console.error("Redis expire error:", error.message);
    }
  }
  // In-memory không cần expire riêng vì đã có trong setWithTTL
};

/**
 * Kiểm tra rate limit trước khi frontend gửi OTP qua Firebase
 * @param {string} phoneNumber - Số điện thoại
 * @returns {Promise<Object>} - Kết quả
 */
const sendOTP = async (phoneNumber) => {
  try {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const rateLimitKey = `rate_limit:${normalizedPhone}`;
    const rateLimitValue = await get(rateLimitKey);

    if (rateLimitValue) {
      const ttl = await getTTL(rateLimitKey);
      return {
        success: false,
        message: `Vui lòng chờ ${ttl} giây trước khi gửi lại OTP`,
        waitTime: ttl,
      };
    }

    await setWithTTL(rateLimitKey, "true", 60);

    console.log(`✅ SMS OTP allowed for ${normalizedPhone}`);

    return {
      success: true,
      message: "Có thể gửi OTP",
      phoneNumber: normalizedPhone,
      expiresIn: 180,
    };
  } catch (error) {
    console.error("❌ Send OTP Error:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi gửi OTP",
      error: error.message,
    };
  }
};

/**
 * Xác minh mã OTP
 * @param {string} phoneNumber - Số điện thoại
 * @param {string} otpCode - Mã OTP người dùng nhập
 * @returns {Promise<Object>} - Kết quả xác minh
 */
const verifyOTP = async (phoneNumber, otpCode) => {
  try {
    // Chuẩn hóa số điện thoại
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // 1. Lấy OTP từ Redis
    const otpKey = `otp:${normalizedPhone}`;
    const storedOTP = await get(otpKey);

    // 2. Kiểm tra OTP có tồn tại không (có thể đã hết hạn)
    if (!storedOTP) {
      return {
        success: false,
        message: "Mã OTP đã hết hạn hoặc không tồn tại",
      };
    }

    // 3. Kiểm tra số lần thử sai
    const retryKey = `retry:${normalizedPhone}`;
    const retryCount = parseInt((await get(retryKey)) || "0");

    if (retryCount >= 5) {
      // Quá 5 lần thử sai → Xóa OTP
      await del(otpKey);
      await del(retryKey);
      return {
        success: false,
        message: "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã OTP mới.",
      };
    }

    // 4. So sánh OTP
    if (storedOTP !== otpCode) {
      // Tăng số lần thử sai
      const newRetryCount = await incr(retryKey);
      await expire(retryKey, 180); // TTL: 3 phút

      return {
        success: false,
        message: `Mã OTP không chính xác. Bạn còn ${5 - newRetryCount} lần thử.`,
        retriesLeft: 5 - newRetryCount,
      };
    }

    // 5. Xác minh thành công → Xóa OTP để chống Replay Attack
    await del(otpKey);
    await del(retryKey);
    await del(`rate_limit:${normalizedPhone}`);

    console.log(`✅ OTP verified successfully for ${normalizedPhone}`);

    return {
      success: true,
      message: "Xác thực thành công",
      phoneNumber: normalizedPhone,
    };
  } catch (error) {
    console.error("❌ Verify OTP Error:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi xác minh OTP",
      error: error.message,
    };
  }
};

/**
 * Lấy TTL của key (thời gian còn lại)
 * @param {string} key - Redis key
 * @returns {Promise<number>} - Seconds còn lại
 */
const getTTL = async (key) => {
  const redis = getRedisClient();

  if (redis && redis.isOpen) {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error("Redis TTL error:", error.message);
      const data = inMemoryOTP.get(key);
      if (data && data.expires > Date.now()) {
        return Math.floor((data.expires - Date.now()) / 1000);
      }
      return -1;
    }
  } else {
    const data = inMemoryOTP.get(key);
    if (data && data.expires > Date.now()) {
      return Math.floor((data.expires - Date.now()) / 1000);
    }
    return -1;
  }
};

/**
 * Kiểm tra xem số điện thoại có thể gửi OTP không (check rate limit)
 * @param {string} phoneNumber - Số điện thoại
 * @returns {Promise<Object>} - Trạng thái
 */
const canSendOTP = async (phoneNumber) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const rateLimitKey = `rate_limit:${normalizedPhone}`;
  const rateLimitValue = await get(rateLimitKey);

  if (rateLimitValue) {
    const ttl = await getTTL(rateLimitKey);
    return {
      canSend: false,
      waitTime: ttl,
      message: `Vui lòng chờ ${ttl} giây`,
    };
  }

  return {
    canSend: true,
    message: "Có thể gửi OTP",
  };
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
  canSendOTP,
  normalizePhoneNumber,
};
