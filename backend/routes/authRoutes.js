const express = require("express");

const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", register);

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
