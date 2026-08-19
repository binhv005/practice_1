const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let initialized = false;

const initFirebaseAdmin = () => {
  if (initialized || admin.apps.length) {
    initialized = true;
    return admin;
  }

  try {
    let credential = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      credential = admin.credential.cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
      );
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const accountPath = path.resolve(
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      );
      const serviceAccount = JSON.parse(fs.readFileSync(accountPath, "utf8"));
      credential = admin.credential.cert(serviceAccount);
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      });
    }

    if (!credential) {
      console.log(
        "⚠️ Firebase Admin credentials not configured. SMS OTP verification disabled.",
      );
      return null;
    }

    admin.initializeApp({ credential });
    initialized = true;
    console.log("✅ Firebase Admin initialized");
    return admin;
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error.message);
    return null;
  }
};

const getFirebaseAdmin = () => admin;

module.exports = {
  initFirebaseAdmin,
  getFirebaseAdmin,
};
