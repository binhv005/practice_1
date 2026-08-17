# Hướng dẫn sử dụng Forgot Password & Remember Login

## 📋 Tổng quan

Tôi đã implement 2 chức năng mới:

1. **Forgot Password** - Quên mật khẩu (gửi email reset)
2. **Remember Login** - Ghi nhớ đăng nhập (lưu cookie lâu hơn)

---

## 🔐 1. Forgot Password (Quên mật khẩu)

### Luồng hoạt động:

```
User quên password
    ↓
Vào trang /forgot-password
    ↓
Nhập email → Nhấn "Gửi link"
    ↓
Backend tạo token ngẫu nhiên (crypto)
    ↓
Lưu hashed token + thời gian hết hạn vào DB
    ↓
Gửi email chứa link reset (nodemailer)
    ↓
User click link trong email
    ↓
Mở trang /reset-password?token=xxx
    ↓
Nhập mật khẩu mới
    ↓
Backend verify token → Update password → Xóa token
    ↓
Success → Redirect về /login
```

### Files đã tạo/sửa:

**Backend:**
- ✅ `backend/models/User.js` - Thêm field `resetPasswordToken`, `resetPasswordExpires`
- ✅ `backend/services/emailService.js` - Service gửi email qua nodemailer
- ✅ `backend/controllers/authController.js` - Thêm `forgotPassword()`, `resetPassword()`
- ✅ `backend/routes/authRoutes.js` - Thêm route `POST /forgot-password`, `POST /reset-password`

**Frontend:**
- ✅ `client/src/api/authApi.js` - Thêm `forgotPasswordApi()`, `resetPasswordApi()`
- ✅ `client/src/pages/ForgotPasswordPage.jsx` - Trang nhập email
- ✅ `client/src/pages/ResetPasswordPage.jsx` - Trang nhập password mới
- ✅ `client/src/components/auth/LoginForm.jsx` - Link "Quên mật khẩu?"
- ✅ `client/src/App.jsx` - Thêm route `/forgot-password`, `/reset-password`

### API Endpoints mới:

#### 1. Forgot Password
```javascript
POST /api/auth/forgot-password
Body: { email: "user@example.com" }

Response (success):
{
  "success": true,
  "message": "Link đặt lại mật khẩu đã được gửi đến email của bạn"
}
```

#### 2. Reset Password
```javascript
POST /api/auth/reset-password
Body: {
  "token": "abc123...",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}

Response (success):
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại"
}
```

---

## 🔄 2. Remember Login (Ghi nhớ đăng nhập)

### Luồng hoạt động:

```
User đăng nhập
    ↓
Check checkbox "Ghi nhớ đăng nhập"
    ↓
Backend nhận flag remember=true
    ↓
Tạo JWT với thời gian hết hạn:
  - remember=true  → 30 ngày
  - remember=false → 1 ngày
    ↓
Set cookie với maxAge tương ứng
    ↓
User đóng trình duyệt
    ↓
Mở lại → Vẫn còn đăng nhập (nếu remember=true)
```

### Logic đã có sẵn trong backend:

**File:** `backend/controllers/authController.js`

```javascript
// Login controller đã support remember
const expiresIn = remember ? "30d" : "1d";

const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn });

res.cookie("accessToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
});
```

### Files đã sửa:

**Frontend:**
- ✅ `client/src/pages/LoginPage.jsx` - Update `handleSubmit()` để gọi API thật, truyền `remember` flag
- ✅ `client/src/components/auth/LoginForm.jsx` - Checkbox "Ghi nhớ đăng nhập" đã có sẵn

---

## ⚙️ Cấu hình Email (quan trọng!)

### Bước 1: Cài package (đã làm rồi)
```bash
npm install nodemailer
```

### Bước 2: Cấu hình `.env`

Thêm vào file `backend/.env`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Bước 3: Tạo App Password cho Gmail

**Lưu ý:** Không dùng password thường của Gmail được!

1. Vào [Google Account Security](https://myaccount.google.com/security)
2. Bật **2-Step Verification** (nếu chưa bật)
3. Tìm **App passwords**
4. Chọn "Mail" và "Other (Custom name)"
5. Nhập tên: `Mini Marketplace`
6. Google sẽ tạo password 16 ký tự → Copy vào `EMAIL_PASS`

### Bước 4: Test gửi email

Tạo file test:

```javascript
// backend/test-email.js
require("dotenv").config();
const { sendResetPasswordEmail } = require("./services/emailService");

const testEmail = async () => {
  try {
    await sendResetPasswordEmail(
      "test@example.com", // Email nhận
      "test-token-123",
      "Test User"
    );
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Failed:", error.message);
  }
};

testEmail();
```

Chạy: `node backend/test-email.js`

---

## 🧪 Test chức năng

### Test Forgot Password:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Vào http://localhost:5173/login
4. Click "Quên mật khẩu?"
5. Nhập email có trong database
6. Check email → Click link
7. Nhập password mới → Submit
8. Đăng nhập lại với password mới

### Test Remember Login:

1. Vào http://localhost:5173/login
2. **Không check** "Ghi nhớ đăng nhập"
3. Đăng nhập → Đóng trình duyệt → Mở lại → Phải đăng nhập lại
4. Lần này **check** "Ghi nhớ đăng nhập"
5. Đăng nhập → Đóng trình duyệt → Mở lại → Vẫn đăng nhập

---

## 🔒 Bảo mật

### Forgot Password:

- ✅ Token được hash trước khi lưu database (SHA-256)
- ✅ Token chỉ có hiệu lực 10 phút
- ✅ Token chỉ dùng được 1 lần (xóa sau khi reset)
- ✅ Không tiết lộ email có tồn tại hay không (chống enumerate)
- ✅ Email gửi qua SMTP có mã hóa (TLS)

### Remember Login:

- ✅ JWT được lưu trong HttpOnly cookie (không truy cập được từ JavaScript)
- ✅ Cookie secure trong production (chỉ gửi qua HTTPS)
- ✅ SameSite policy ngăn CSRF attack
- ✅ Token có thời gian hết hạn rõ ràng

---

## 📝 Lưu ý quan trọng

1. **Email không gửi được?**
   - Check `.env` đã config đúng chưa
   - Check Gmail App Password đã tạo chưa
   - Check firewall không block port 587
   - Xem log console backend có lỗi không

2. **Link reset không work?**
   - Check `FRONTEND_URL` trong `.env` đúng chưa
   - Check token có trong URL không
   - Token có thể đã hết hạn (10 phút)

3. **Remember không work?**
   - Check cookie có được set không (F12 > Application > Cookies)
   - Check backend trả về cookie đúng maxAge chưa
   - Clear cache/cookies trình duyệt và test lại

4. **Production deployment:**
   - Đổi `EMAIL_USER` và `EMAIL_PASS` sang email production
   - Đổi `FRONTEND_URL` sang domain thật
   - Set `NODE_ENV=production`
   - Dùng HTTPS (bắt buộc cho secure cookies)

---

## 🎯 Demo Flow

### Forgot Password Flow:
```
1. Login page → Click "Quên mật khẩu?"
2. Nhập email: user@example.com
3. Click "Gửi link đặt lại mật khẩu"
4. Thông báo: "Email đã được gửi!"
5. Check email → Click link
6. Nhập password mới: newpass123
7. Click "Đặt lại mật khẩu"
8. Success → Redirect về login
9. Login với password mới
```

### Remember Login Flow:
```
1. Login page
2. Nhập email + password
3. ✓ Check "Ghi nhớ đăng nhập"
4. Click "Đăng nhập"
5. Success → Vào trang chủ
6. Đóng tab/trình duyệt
7. Mở lại sau 1 ngày → Vẫn đăng nhập
8. Sau 30 ngày → Token hết hạn → Phải login lại
```

---

## 🐛 Troubleshooting

### Lỗi "Cannot send email"
```bash
# Check SMTP connection
telnet smtp.gmail.com 587
```

### Lỗi "Token invalid"
- Token đã hết hạn (>10 phút)
- Token đã được dùng rồi
- Token bị sai format

### Cookie không lưu
- Check `withCredentials: true` ở frontend
- Check CORS config backend allow credentials
- Check domain frontend/backend có khớp không

---

## ✅ Checklist triển khai

- [x] Cài nodemailer
- [x] Thêm field vào User model
- [x] Tạo emailService
- [x] Tạo forgotPassword controller
- [x] Tạo resetPassword controller
- [x] Thêm routes
- [x] Tạo ForgotPasswordPage
- [x] Tạo ResetPasswordPage
- [x] Update LoginForm link
- [x] Update LoginPage API call
- [x] Thêm routes vào App.jsx
- [ ] Config .env (cần làm thủ công)
- [ ] Test gửi email
- [ ] Test forgot password flow
- [ ] Test remember login flow

---

Nếu có vấn đề gì, check lại từng bước trong hướng dẫn này! 🚀
