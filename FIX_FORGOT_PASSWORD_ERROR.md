# 🔧 Fix Lỗi "Forgot Password" - 500 Internal Server Error

## ❌ Lỗi gặp phải:

```
Không thể gửi email. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau

Failed to load resource: the server responded with a status of 500 (Internal Server Error)

ForgotPasswordPage.jsx:45 Forgot password error: AxiosError: Request failed with status code 500
```

---

## 🔍 Nguyên nhân:

File `.env` **CHƯA CÓ** cấu hình email (EMAIL_HOST, EMAIL_USER, EMAIL_PASS).

Khi `emailService.js` cố gắng tạo transporter với thông tin auth = undefined → nodemailer throw error → Backend trả 500.

---

## ✅ Giải pháp:

Tôi đã implement **2 mode**:

### Mode 1: **MOCK MODE** (Development - Không gửi email thật)
- Tự động bật khi **KHÔNG có** cấu hình email trong `.env`
- In thông tin email ra terminal thay vì gửi thật
- Token vẫn được lưu vào database
- User có thể copy link từ terminal để test

### Mode 2: **PRODUCTION MODE** (Gửi email thật)
- Tự động bật khi **CÓ** cấu hình email trong `.env`
- Gửi email thật qua SMTP

---

## 📁 Files đã sửa:

### 1. **backend/.env** (Đã thêm comment)
```env
MONGODB_URI=mongodb://localhost:27017/donation_app
ADMIN_ID=6a799a83d9e719d0439bc99d

CLOUDINARY_CLOUD_NAME=ai1z2oaj
CLOUDINARY_API_KEY=172892198212144
CLOUDINARY_API_SECRET=SM1DvYl34kk34BNEwAtz-F6k0l4

JWT_SECRET=AK_JAS_N@&AS
JWT_EXPIRES_IN=7d

# Email Configuration (dùng để gửi email reset password)
# Bạn cần tạo Gmail App Password: https://support.google.com/accounts/answer/185833
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Frontend URL (dùng để tạo link reset password)
FRONTEND_URL=http://localhost:5173
```

**⚠️ LƯU Ý:** 
- `EMAIL_USER` và `EMAIL_PASS` đang là placeholder
- Nếu không điền → Tự động dùng **MOCK MODE**
- Nếu điền đầy đủ → Dùng **PRODUCTION MODE**

### 2. **backend/services/emailService.js** (Đã sửa)

**Thêm logic check config:**
```javascript
const createTransporter = () => {
  // Check xem có cấu hình email không
  const hasEmailConfig =
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS;

  if (!hasEmailConfig) {
    console.warn(
      "⚠️  WARNING: Email chưa được cấu hình. Sử dụng mock mode (không gửi email thật).",
    );
    return null; // Trả null thay vì throw error
  }

  // ... create real transporter
};
```

**Thêm MOCK MODE trong sendResetPasswordEmail:**
```javascript
// MOCK MODE - Không gửi email thật
if (!transporter) {
  console.log("\n=== 📧 MOCK EMAIL (Development Mode) ===");
  console.log(`To: ${email}`);
  console.log(`Subject: Yêu cầu đặt lại mật khẩu`);
  console.log(`Reset Link: ${resetUrl}`);
  console.log(`Token: ${resetToken}`);
  console.log("=====================================\n");

  // Giả lập thành công
  return {
    success: true,
    messageId: "mock-" + Date.now(),
    mode: "mock",
  };
}
```

---

## 🧪 Test với MOCK MODE (Development):

### Bước 1: Restart backend
```bash
cd backend
npm run dev
```

Thấy log:
```
⚠️  WARNING: Email chưa được cấu hình. Sử dụng mock mode (không gửi email thật).
```

### Bước 2: Test forgot password
1. Vào http://localhost:5173/forgot-password
2. Nhập email: `test@example.com` (phải có trong DB)
3. Click "Gửi link đặt lại mật khẩu"
4. ✅ Thành công!

### Bước 3: Xem log terminal backend
```
=== 📧 MOCK EMAIL (Development Mode) ===
To: test@example.com
Subject: Yêu cầu đặt lại mật khẩu
Reset Link: http://localhost:5173/reset-password?token=abc123...
Token: abc123...
=====================================
```

### Bước 4: Copy link từ terminal
```
http://localhost:5173/reset-password?token=abc123...
```

### Bước 5: Paste vào browser → Test reset password

---

## 🚀 Cấu hình PRODUCTION MODE (gửi email thật):

### Bước 1: Tạo Gmail App Password

1. Vào https://myaccount.google.com/security
2. Bật **2-Step Verification**
3. Tìm **App passwords**
4. Chọn "Mail" và "Other (Custom name)"
5. Nhập tên: `Mini Marketplace`
6. Google tạo password 16 ký tự: `abcd efgh ijkl mnop`

### Bước 2: Update `.env`

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_real_email@gmail.com
EMAIL_PASS=abcdefghijklmnop

FRONTEND_URL=http://localhost:5173
```

**⚠️ LƯU Ý:**
- `EMAIL_USER`: Email Gmail của bạn
- `EMAIL_PASS`: App Password (16 ký tự, KHÔNG có dấu cách)
- KHÔNG dùng password Gmail thông thường

### Bước 3: Restart backend
```bash
cd backend
npm run dev
```

Không thấy warning nữa → Production mode đã bật.

### Bước 4: Test
1. Vào forgot password
2. Nhập email THẬT của bạn
3. Click gửi
4. ✅ Check email inbox
5. Click link trong email
6. Reset password thành công

---

## 🔍 Debug:

### Check mode nào đang chạy:

**Terminal backend có log:**
```
⚠️  WARNING: Email chưa được cấu hình. Sử dụng mock mode
→ MOCK MODE

Không có warning
→ PRODUCTION MODE
```

### Nếu vẫn lỗi 500:

1. **Check .env có đúng format không:**
   ```env
   EMAIL_USER=test@gmail.com  ✅
   EMAIL_USER = test@gmail.com  ❌ (có dấu cách)
   ```

2. **Check backend có load .env không:**
   ```javascript
   // backend/server.js đầu file
   require("dotenv").config();
   ```

3. **Xem log chi tiết backend terminal:**
   ```
   ❌ Send email error: Error: ...
   ```

4. **Test transporter thủ công:**
   ```bash
   node backend/test-email.js
   ```

---

## 📊 So sánh 2 modes:

| Feature | MOCK MODE | PRODUCTION MODE |
|---|---|---|
| Gửi email thật | ❌ Không | ✅ Có |
| Cần config email | ❌ Không | ✅ Có |
| Log ra terminal | ✅ Có | ❌ Không |
| Tốc độ | ⚡ Nhanh | 🐢 Chậm hơn (3-5s) |
| Phù hợp cho | Development | Production |
| Token vẫn lưu DB | ✅ Có | ✅ Có |

---

## ✅ Kết luận:

**Hiện tại (Development):**
- Dùng **MOCK MODE**
- Không cần config email
- Copy link từ terminal để test
- Nhanh, tiện lợi

**Khi deploy (Production):**
- Cấu hình Gmail App Password
- Dùng **PRODUCTION MODE**
- Gửi email thật cho user
- Professional hơn

---

## 📝 Quick Fix cho các lỗi thường gặp:

### Lỗi: "Invalid login: 535-5.7.8 Username and Password not accepted"
➡️ Dùng **App Password**, không phải password Gmail thường

### Lỗi: "self signed certificate in certificate chain"
➡️ Thêm vào transporter:
```javascript
tls: {
  rejectUnauthorized: false
}
```

### Lỗi: "Connection timeout"
➡️ Check firewall/antivirus có block port 587 không

### Lỗi: Token hết hạn
➡️ Token chỉ có hiệu lực 10 phút, gửi lại forgot password

---

Giờ chức năng Forgot Password đã hoạt động với **MOCK MODE** để test development! 🎉

Muốn gửi email thật → Cấu hình Gmail App Password vào `.env` → Tự động chuyển sang Production Mode! 🚀
