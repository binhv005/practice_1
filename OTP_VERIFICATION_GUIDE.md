# 🔐 OTP Email Verification - Implementation Guide

## ✅ Đã Hoàn Thành

Đã thêm tính năng xác thực OTP qua email cho đăng ký tài khoản.

## 📋 Flow Đăng Ký Mới

### Trước (Old Flow):
```
1. User điền form đăng ký
2. Submit → Tạo account ngay
3. Account active luôn
4. Redirect về login
```

### Sau (New Flow with OTP):
```
1. User điền form đăng ký
2. Submit → Tạo account với status "pending"
3. Gửi OTP (6 số) qua email
4. User nhập OTP
5. Verify OTP thành công → Account active
6. Redirect về login hoặc tự động login
```

## 🔧 Backend Changes

### 1. User Model Updates

**File:** `backend/models/User.js`

**Thêm fields mới:**
```javascript
{
  // OTP verification fields
  otpCode: String,           // Mã OTP 6 số
  otpExpires: Date,          // Thời gian hết hạn (10 phút)
  isEmailVerified: Boolean,  // Đã verify email chưa
}
```

### 2. Email Service

**File:** `backend/services/emailService.js`

**Thêm function:**
```javascript
sendOTPEmail(email, otpCode, fullname)
```

**Features:**
- Gửi email đẹp với HTML template
- Hiển thị OTP code lớn, dễ nhìn
- Hướng dẫn sử dụng
- Warning về bảo mật
- Mock mode cho development (không cần config email thật)

### 3. Auth Controller

**File:** `backend/controllers/authController.js`

#### a) `register()` - Modified

**Changes:**
- Tạo user với `status: "pending"` thay vì "active"
- Generate OTP 6 số random
- Lưu OTP vào database
- Gửi OTP qua email
- Return `userId` để verify sau

**Response:**
```json
{
  "success": true,
  "message": "Mã xác thực đã được gửi đến email của bạn",
  "userId": "66abc123...",
  "email": "user@example.com"
}
```

#### b) `verifyOTP()` - New

**Endpoint:** `POST /api/auth/verify-otp`

**Request:**
```json
{
  "userId": "66abc123...",
  "otpCode": "123456"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Xác thực thành công! Tài khoản của bạn đã được kích hoạt",
  "user": { ... }
}
```

**Response Errors:**
- OTP không chính xác
- OTP hết hạn
- User không tồn tại
- Email đã được verify

**Logic:**
1. Tìm user theo `userId`
2. Check OTP có tồn tại không
3. Check OTP hết hạn chưa (10 phút)
4. So sánh OTP với input
5. Nếu đúng:
   - Set `status = "active"`
   - Set `isEmailVerified = true`
   - Clear OTP fields
   - Return user info

#### c) `resendOTP()` - New

**Endpoint:** `POST /api/auth/resend-otp`

**Request:**
```json
{
  "userId": "66abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mã xác thực mới đã được gửi đến email của bạn"
}
```

**Logic:**
1. Tìm user
2. Check đã verify chưa
3. Generate OTP mới
4. Update database
5. Gửi email mới

### 4. Routes

**File:** `backend/routes/authRoutes.js`

**New routes:**
```javascript
POST /api/auth/verify-otp   // Xác thực OTP
POST /api/auth/resend-otp   // Gửi lại OTP
```

## 📱 Frontend Implementation (TODO)

Frontend cần implement 2 trang mới:

### 1. OTP Verification Page

**Route:** `/verify-otp`

**URL Params:**
- `userId` - Từ register response
- `email` - Để hiển thị

**UI Components:**
- Input OTP (6 ô, mỗi ô 1 số)
- Timer đếm ngược 10 phút
- Button "Xác nhận"
- Button "Gửi lại mã" (sau 60s)
- Hiển thị email đã gửi

**Example:**
```jsx
┌────────────────────────────────┐
│  📧 Xác thực email             │
│                                │
│  Mã OTP đã được gửi đến        │
│  user@example.com              │
│                                │
│  ┌───┬───┬───┬───┬───┬───┐    │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │    │
│  └───┴───┴───┴───┴───┴───┘    │
│                                │
│  ⏱️ Còn lại: 09:42            │
│                                │
│  [    Xác nhận    ]            │
│                                │
│  Không nhận được mã?           │
│  Gửi lại sau 60s               │
└────────────────────────────────┘
```

### 2. Update RegisterPage

**After register success:**
```javascript
// Old
navigate("/login");

// New
navigate(`/verify-otp?userId=${userId}&email=${email}`);
```

## 🔌 API Usage

### Register Flow

```javascript
// 1. Register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullname: "John Doe",
    email: "john@example.com",
    phone: "0123456789",
    password: "password123",
    confirmPassword: "password123"
  })
});

const data = await response.json();
// { success: true, userId: "...", email: "..." }

// 2. Redirect to OTP page
navigate(`/verify-otp?userId=${data.userId}&email=${data.email}`);

// 3. User nhập OTP, verify
const verifyResponse = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: data.userId,
    otpCode: "123456"
  })
});

const verifyData = await verifyResponse.json();
// { success: true, user: {...} }

// 4. Login success, redirect
navigate("/login"); // hoặc auto login
```

### Resend OTP

```javascript
const resendResponse = await fetch('/api/auth/resend-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: userId
  })
});

// { success: true, message: "Mã xác thực mới đã được gửi..." }
```

## 🧪 Testing

### Development Mode (No Email Config)

Backend sẽ print OTP trong console:

```
==================================================
📧 MOCK EMAIL - OTP VERIFICATION (Development Mode)
==================================================
To:      user@example.com
Subject: Mã xác thực đăng ký tài khoản
Name:    John Doe

🔐 OTP Code:

    123456

Valid for: 10 minutes
==================================================
```

Copy OTP từ console và test!

### Production Mode (With Email Config)

1. Config email trong `.env`:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. Register account
3. Check email inbox
4. Copy OTP và verify

### Test Cases

✅ **Register → Verify thành công**
1. Register với email hợp lệ
2. Nhận OTP trong email/console
3. Nhập OTP đúng
4. Account active

✅ **OTP sai**
1. Register
2. Nhập OTP sai
3. Hiển thị lỗi "Mã OTP không chính xác"

✅ **OTP hết hạn**
1. Register
2. Đợi > 10 phút
3. Nhập OTP
4. Hiển thị lỗi "Mã OTP đã hết hạn"

✅ **Resend OTP**
1. Register
2. Click "Gửi lại mã"
3. Nhận OTP mới
4. Verify với OTP mới

✅ **Email đã verify**
1. User đã verify trước đó
2. Try verify lại
3. Hiển thị lỗi "Email đã được xác thực"

## 🔐 Security Features

### 1. OTP Expiration
- OTP hết hạn sau **10 phút**
- Không thể sử dụng OTP cũ

### 2. One-Time Use
- OTP bị clear sau khi verify thành công
- Không thể verify lại với cùng OTP

### 3. Pending Status
- User pending không thể login
- Phải verify email trước

### 4. Rate Limiting (Recommended)
```javascript
// Optional: Add to routes
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: "Quá nhiều yêu cầu, vui lòng thử lại sau"
});

router.post("/resend-otp", otpLimiter, resendOTP);
```

### 5. Email Validation
- Check email format
- Check email không duplicate

## 📧 Email Template

Email gửi đi bao gồm:
- ✅ Logo/Icon của app
- ✅ Tên người nhận
- ✅ OTP code lớn, dễ nhìn (42px font)
- ✅ Hướng dẫn sử dụng
- ✅ Cảnh báo bảo mật
- ✅ Thời gian hết hạn
- ✅ Footer với copyright

Preview:
```
┌────────────────────────────────┐
│   🎁 Xác thực tài khoản        │
├────────────────────────────────┤
│                                │
│ Xin chào John Doe,             │
│                                │
│ Để hoàn tất đăng ký, nhập mã:  │
│                                │
│ ╔═════════════════════════╗    │
│ ║    MÃ XÁC THỰC CỦA BẠN  ║    │
│ ║                         ║    │
│ ║      1  2  3  4  5  6   ║    │
│ ║                         ║    │
│ ║  Có hiệu lực 10 phút    ║    │
│ ╚═════════════════════════╝    │
│                                │
│ ⚠️ Không chia sẻ mã với ai     │
│ ⚠️ Mã chỉ dùng 1 lần           │
│                                │
└────────────────────────────────┘
```

## 🚀 Deployment

### Step 1: Setup Email Service

**Gmail (Recommended for development):**

1. Enable 2FA trong Google Account
2. Generate App Password:
   - Google Account → Security
   - 2-Step Verification
   - App passwords
   - Generate password
3. Copy password

**Add to `.env`:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Step 2: Deploy Backend

1. Add env vars to hosting platform (Render, Heroku, etc.)
2. Deploy code
3. Test OTP email

### Step 3: Deploy Frontend

1. Implement OTP verification page
2. Update register flow
3. Deploy

## 📊 Database Schema

```javascript
User {
  _id: ObjectId,
  fullname: String,
  email: String,
  password: String (hashed),
  
  // New fields
  status: String,           // "pending" | "active" | "banned"
  isEmailVerified: Boolean, // false → true sau verify
  otpCode: String,          // "123456"
  otpExpires: Date,         // Date.now() + 10 minutes
  
  // ... other fields
}
```

## 🔄 Migration

**Existing users không bị ảnh hưởng:**
- Users cũ: `isEmailVerified = undefined` → treated as `true`
- Users cũ: `status = "active"` → vẫn login bình thường
- Chỉ users mới phải verify OTP

**Optional: Migrate existing users:**
```javascript
// Run once
await User.updateMany(
  { isEmailVerified: { $exists: false } },
  { $set: { isEmailVerified: true } }
);
```

## 📝 Summary

✅ **Backend Complete:**
- User model updated
- OTP email service
- Register creates pending user
- Verify OTP endpoint
- Resend OTP endpoint
- Email templates

⏳ **Frontend TODO:**
- OTP verification page
- Update register flow
- Resend OTP button
- Timer countdown

🎯 **Benefits:**
- Email verification bắt buộc
- Giảm fake accounts
- Tăng security
- Better UX với clear feedback

🔒 **Security:**
- OTP hết hạn 10 phút
- One-time use only
- Pending users can't login
- Rate limiting ready

---

**Next Steps:**
1. ✅ Backend đã xong - Test với console OTP
2. ⏳ Implement frontend OTP page
3. ⏳ Connect frontend → backend
4. ⏳ Test full flow
5. ⏳ Setup production email
6. ⏳ Deploy

**Need Help?** Check logs trong development mode để xem OTP code!
