const twilio = require("twilio");

// Khởi tạo Twilio client
let twilioClient = null;

const initTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.log("⚠️ Twilio credentials not configured. SMS features disabled.");
    return null;
  }

  try {
    twilioClient = twilio(accountSid, authToken);
    console.log("✅ Twilio client initialized");
    return twilioClient;
  } catch (error) {
    console.error("❌ Twilio initialization error:", error.message);
    return null;
  }
};

/**
 * Chuẩn hóa số điện thoại sang định dạng E.164
 * @param {string} phone - Số điện thoại đầu vào
 * @returns {string} - Số điện thoại chuẩn E.164
 */
const normalizePhoneNumber = (phone) => {
  // Loại bỏ tất cả ký tự không phải số
  let cleaned = phone.replace(/\D/g, "");

  // Nếu bắt đầu bằng 0 (số Việt Nam)
  if (cleaned.startsWith("0")) {
    cleaned = "84" + cleaned.substring(1);
  }

  // Nếu chưa có dấu +
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
};

const toLocalVietnamPhone = (phone) => {
  const e164 = normalizePhoneNumber(phone);

  if (e164.startsWith("+84")) {
    return `0${e164.slice(3)}`;
  }

  return phone;
};

/**
 * Gửi OTP qua SMS sử dụng Twilio
 * @param {string} phoneNumber - Số điện thoại nhận OTP (E.164 format)
 * @param {string} otpCode - Mã OTP 6 số
 * @returns {Promise<Object>} - Kết quả gửi SMS
 */
const sendOTPSMS = async (phoneNumber, otpCode) => {
  // Kiểm tra Twilio client
  if (!twilioClient) {
    twilioClient = initTwilioClient();
  }

  // Nếu không có Twilio client (development mode)
  if (!twilioClient) {
    console.log("\n===========================================");
    console.log("📱 SMS OTP (Development Mode)");
    console.log("===========================================");
    console.log(`Phone: ${phoneNumber}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log("===========================================\n");

    return {
      success: true,
      message: "OTP sent (development mode)",
      sid: "dev_" + Date.now(),
    };
  }

  try {
    // Chuẩn hóa số điện thoại
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Nội dung tin nhắn
    const messageBody = `Mã xác thực của bạn là: ${otpCode}. Mã có hiệu lực trong 3 phút. Không chia sẻ mã này với bất kỳ ai.`;

    // Gửi SMS qua Twilio
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER, // Số điện thoại Twilio của bạn
      to: normalizedPhone,
    });

    console.log(`✅ SMS sent successfully to ${normalizedPhone}`);
    console.log(`   Message SID: ${message.sid}`);

    return {
      success: true,
      message: "OTP sent successfully",
      sid: message.sid,
      status: message.status,
    };
  } catch (error) {
    console.error("❌ Twilio SMS Error:", error.message);

    // Log chi tiết error
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    if (error.moreInfo) {
      console.error(`   More Info: ${error.moreInfo}`);
    }

    return {
      success: false,
      message: "Failed to send SMS",
      error: error.message,
      code: error.code,
    };
  }
};

/**
 * Gửi tin nhắn SMS tùy chỉnh
 * @param {string} phoneNumber - Số điện thoại nhận
 * @param {string} message - Nội dung tin nhắn
 * @returns {Promise<Object>} - Kết quả gửi SMS
 */
const sendCustomSMS = async (phoneNumber, message) => {
  if (!twilioClient) {
    twilioClient = initTwilioClient();
  }

  if (!twilioClient) {
    console.log("\n===========================================");
    console.log("📱 Custom SMS (Development Mode)");
    console.log("===========================================");
    console.log(`Phone: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log("===========================================\n");

    return {
      success: true,
      message: "SMS sent (development mode)",
    };
  }

  try {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const smsMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone,
    });

    console.log(`✅ SMS sent successfully to ${normalizedPhone}`);

    return {
      success: true,
      message: "SMS sent successfully",
      sid: smsMessage.sid,
    };
  } catch (error) {
    console.error("❌ Twilio SMS Error:", error.message);
    return {
      success: false,
      message: "Failed to send SMS",
      error: error.message,
    };
  }
};

module.exports = {
  initTwilioClient,
  sendOTPSMS,
  sendCustomSMS,
  normalizePhoneNumber,
  toLocalVietnamPhone,
};
