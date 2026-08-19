const { getFirebaseAdmin } = require("../config/firebaseAdmin");
const {
  normalizePhoneNumber,
  toLocalVietnamPhone,
} = require("./smsService");

const verifyWithAdminSdk = async (idToken) => {
  const admin = getFirebaseAdmin();

  if (!admin.apps.length) {
    return null;
  }

  const decoded = await admin.auth().verifyIdToken(idToken);

  return {
    uid: decoded.uid,
    phoneNumber: decoded.phone_number || "",
  };
};

const verifyWithIdentityToolkit = async (idToken) => {
  const apiKey = process.env.FIREBASE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.users?.[0]) {
    throw new Error(data.error?.message || "Invalid Firebase ID token");
  }

  const firebaseUser = data.users[0];

  return {
    uid: firebaseUser.localId,
    phoneNumber: firebaseUser.phoneNumber || "",
  };
};

const verifyFirebasePhoneToken = async (idToken, phoneNumber) => {
  if (!idToken) {
    return {
      success: false,
      message: "Thiếu mã xác thực Firebase",
    };
  }

  try {
    let verified = null;

    try {
      verified = await verifyWithAdminSdk(idToken);
    } catch (adminError) {
      console.error("❌ Firebase Admin verify error:", adminError.message);
    }

    if (!verified) {
      verified = await verifyWithIdentityToolkit(idToken);
    }

    if (!verified) {
      return {
        success: false,
        message:
          "Firebase chưa được cấu hình. Thêm FIREBASE_API_KEY hoặc service account vào backend/.env",
      };
    }

    if (!verified.phoneNumber) {
      return {
        success: false,
        message: "Token không chứa số điện thoại đã xác thực",
      };
    }

    const expectedPhone = normalizePhoneNumber(phoneNumber);

    if (verified.phoneNumber !== expectedPhone) {
      return {
        success: false,
        message: "Số điện thoại không khớp với xác thực Firebase",
      };
    }

    return {
      success: true,
      message: "Xác thực thành công",
      phoneNumber: toLocalVietnamPhone(expectedPhone),
      firebaseUid: verified.uid,
    };
  } catch (error) {
    console.error("❌ Firebase token verify error:", error.message);

    return {
      success: false,
      message: "Mã xác thực không hợp lệ hoặc đã hết hạn",
    };
  }
};

module.exports = {
  verifyFirebasePhoneToken,
};
