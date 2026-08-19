import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";

let recaptchaVerifier = null;
let confirmationResult = null;

auth.languageCode = "vi";

// Chỉ bật khi development: Test Phone Number không gửi SMS, không cần Blaze.
// Không bypass OTP — vẫn phải confirm() mã đã khai báo trên Firebase Console.
if (import.meta.env.DEV) {
  auth.settings.appVerificationDisabledForTesting = true;
}

export const toE164 = (phone) => {
  const digits = String(phone).replace(/\D/g, "");

  if (digits.startsWith("84")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+84${digits.substring(1)}`;
  }

  return `+${digits}`;
};

const getRecaptchaContainer = () => {
  let el = document.getElementById("recaptcha-container");

  if (!el) {
    el = document.createElement("div");
    el.id = "recaptcha-container";
    document.body.appendChild(el);
  }

  return el;
};

export const resetRecaptcha = () => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Widget có thể đã bị gỡ
    }
  }

  recaptchaVerifier = null;

  const el = document.getElementById("recaptcha-container");
  if (el) {
    el.innerHTML = "";
  }
};

const ensureRecaptcha = () => {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  getRecaptchaContainer();
  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
  });

  return recaptchaVerifier;
};

export const sendFirebaseOTP = async (phoneNumber) => {
  try {
    const appVerifier = ensureRecaptcha();
    confirmationResult = await signInWithPhoneNumber(
      auth,
      toE164(phoneNumber),
      appVerifier,
    );
    return confirmationResult;
  } catch (error) {
    resetRecaptcha();
    throw error;
  }
};

export const confirmFirebaseOTP = async (otpCode) => {
  if (!confirmationResult) {
    throw new Error("SESSION_EXPIRED");
  }

  const result = await confirmationResult.confirm(otpCode);
  const idToken = await result.user.getIdToken();

  confirmationResult = null;

  try {
    await signOut(auth);
  } catch {
    // Session chính của app là JWT HttpOnly cookie
  }

  return {
    idToken,
    firebaseUid: result.user.uid,
    phoneNumber: result.user.phoneNumber,
  };
};

export const hasConfirmationSession = () => Boolean(confirmationResult);

export const getFirebaseAuthErrorMessage = (error) => {
  const code = error?.code || "";
  const raw = String(error?.message || "");

  if (code === "auth/billing-not-enabled" || raw.includes("billing-not-enabled")) {
    return "Firebase chưa bật Blaze. Khi development hãy dùng Test Phone Number trong Authentication → Phone → Phone numbers for testing.";
  }

  if (raw.toLowerCase().includes("region enabled")) {
    return "Firebase chưa cho phép gửi SMS tới khu vực này. Development: dùng Test Phone Number.";
  }

  switch (code) {
    case "auth/invalid-phone-number":
      return "Số điện thoại không hợp lệ hoặc chưa được thêm vào Test Phone Numbers";
    case "auth/too-many-requests":
      return "Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau";
    case "auth/quota-exceeded":
      return "Đã vượt hạn mức gửi SMS. Vui lòng dùng Test Phone Number khi development";
    case "auth/invalid-verification-code":
      return "Mã OTP không chính xác";
    case "auth/code-expired":
    case "auth/session-expired":
      return "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới";
    case "auth/captcha-check-failed":
      return "Xác minh reCAPTCHA thất bại. Vui lòng thử lại";
    case "auth/operation-not-allowed":
    case "auth/invalid-app-credential":
      return "Phone Authentication chưa được bật, hoặc số này chưa nằm trong Test Phone Numbers";
    default:
      if (error?.message === "SESSION_EXPIRED") {
        return "Phiên xác thực đã hết. Vui lòng gửi lại mã OTP";
      }
      return raw || "Không thể gửi OTP. Vui lòng thử lại";
  }
};
