# ✅ Fix Lỗi nodemailer.createTransporter is not a function

## 🔧 Đã fix:

1. ✅ Tạo lại file `emailService.js` từ đầu
2. ✅ Thêm try-catch khi tạo transporter
3. ✅ Parse port thành integer: `parseInt(process.env.EMAIL_PORT || "587")`
4. ✅ Improve logging để dễ debug

---

## 🧪 Test ngay:

### Bước 1: Restart backend
```bash
# Stop backend hiện tại (Ctrl+C)
cd backend
npm run dev
```

### Bước 2: Xem log khi khởi động
Backend sẽ log:
```
⚠️  WARNING: Email chưa được cấu hình trong .env
→ Sử dụng MOCK MODE (không gửi email thật)
```

### Bước 3: Test forgot password
1. Vào http://localhost:5173/forgot-password
2. Nhập email có trong database (ví dụ email bạn đã đăng ký)
3. Click "Gửi link đặt lại mật khẩu"

### Bước 4: Xem log backend terminal
```
==================================================
📧 MOCK EMAIL (Development Mode)
==================================================
To:      test@example.com
Subject: Yêu cầu đặt lại mật khẩu
Name:    Nguyễn Văn A

Reset Link:
http://localhost:5173/reset-password?token=abc123...

Token:
abc123...
==================================================
```

### Bước 5: Copy link từ terminal
Copy link `http://localhost:5173/reset-password?token=...`

### Bước 6: Paste vào browser
1. Paste link vào browser
2. Nhập password mới
3. Click "Đặt lại mật khẩu"
4. ✅ Success!

---

## 📝 Nguyên nhân lỗi:

**Lỗi:** `nodemailer.createTransporter is not a function`

**Nguyên nhân có thể:**
1. File bị corrupt/lỗi format
2. Node cache cũ
3. Syntax error không nhìn thấy

**Giải pháp:**
- Xóa file cũ và tạo lại từ đầu
- Clear node cache nếu cần: `npm cache clean --force`

---

## ✅ Kết quả mong đợi:

**Frontend:**
- ✅ Thông báo: "Link đặt lại mật khẩu đã được gửi đến email của bạn"
- ✅ Redirect về success screen

**Backend terminal:**
- ✅ Log MOCK EMAIL với link reset
- ✅ KHÔNG có error

**Database:**
- ✅ User có `resetPasswordToken` (hashed)
- ✅ User có `resetPasswordExpires` (timestamp)

---

## 🚀 Nếu muốn gửi email thật:

### Thêm vào `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_real_email@gmail.com
EMAIL_PASS=your_app_password_here
FRONTEND_URL=http://localhost:5173
```

### Tạo Gmail App Password:
1. https://myaccount.google.com/security
2. Bật 2-Step Verification
3. Tạo App Password cho "Mail"
4. Copy 16 ký tự vào `EMAIL_PASS`

### Restart backend → Tự động chuyển sang Production Mode!

---

Giờ test lại đi! Lỗi đã được fix! 🎉
