const express = require("express");

const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
  verifyOTP,
  resendOTP,
  sendSMSOTP,
  verifySMSOTP,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", register);

// Email OTP Verification
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// SMS OTP (Firebase Phone Auth)
router.post("/send-sms-otp", sendSMSOTP);
router.post("/verify-sms-otp", verifySMSOTP);

router.post("/login", login);

router.get("/me", authMiddleware, getMe);

router.post("/logout", authMiddleware, logout);

// Forgot & Reset Password
router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

// Google Login
router.post("/google-login", googleLogin);

router.get(
  "/admin-test",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Bạn là admin",
    });
  },
);

module.exports = router;
