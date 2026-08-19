# Luồng chức năng gửi OTP qua SMS bằng Firebase

## 1. Mục tiêu

Chức năng này cho phép người dùng xác thực số điện thoại bằng OTP được gửi qua SMS.

Công nghệ sử dụng:

- Frontend: React + Vite
- Authentication OTP: Firebase Phone Authentication
- Backend: Node.js + Express
- Database: MongoDB
- Firebase Admin SDK: Xác thực Firebase ID Token
- Redis: Rate limit / cooldown (tùy chọn)
- JWT: Authentication của hệ thống sau khi đăng ký thành công

---

# 2. Kiến trúc tổng quan

```text
┌─────────────────────────────┐
│           USER              │
│                             │
│ Nhập số điện thoại          │
│ Nhập OTP                    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          FRONTEND           │
│       React + Vite          │
│                             │
│ - Nhập số điện thoại        │
│ - reCAPTCHA                 │
│ - Gửi OTP                  │
│ - Nhập OTP                  │
│ - Countdown                 │
└──────────────┬──────────────┘
               │
               │ Phone Number
               ▼
┌─────────────────────────────┐
│       FIREBASE AUTH         │
│                             │
│ Phone Authentication        │
│                             │
│ - reCAPTCHA                 │
│ - Tạo verification session  │
│ - Gửi SMS OTP               │
│ - Verify OTP                │
└──────────────┬──────────────┘
               │
               │ SMS
               ▼
┌─────────────────────────────┐
│       USER PHONE            │
│                             │
│ OTP: 123456                 │
└──────────────┬──────────────┘
               │
               │ OTP
               ▼
┌─────────────────────────────┐
│          FRONTEND           │
│                             │
│ confirmationResult.confirm()│
└──────────────┬──────────────┘
               │
               │ Firebase ID Token
               ▼
┌─────────────────────────────┐
│        NODE.JS API          │
│         Express             │
│                             │
│ Firebase Admin SDK          │
│ verifyIdToken()             │
└──────────────┬──────────────┘
               │
               │ Verified User
               ▼
┌─────────────────────────────┐
│          MONGODB            │
│                             │
│ phoneVerified = true        │
│ firebaseUid                 │
│ phone                       │
└─────────────────────────────┘