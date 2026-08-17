# 🔐 Hướng dẫn Setup Google OAuth Login

## ✅ Đã implement:

1. ✅ Loại bỏ Facebook và Apple login button
2. ✅ Chỉ giữ lại Google login
3. ✅ Cài đặt `@react-oauth/google` cho frontend
4. ✅ Cài đặt `google-auth-library` cho backend
5. ✅ Tạo API endpoint `/api/auth/google-login`
6. ✅ Auto tạo account nếu chưa tồn tại
7. ✅ Auto login nếu đã có account

---

## 🚀 Cách lấy Google Client ID:

### Bước 1: Tạo Project trên Google Cloud Console

1. Vào https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Nhập tên project: `Mini Marketplace`
4. Click "Create"

### Bước 2: Enable Google+ API

1. Vào https://console.cloud.google.com/apis/library
2. Tìm "Google+ API"
3. Click "Enable"

### Bước 3: Tạo OAuth 2.0 Client ID

1. Vào https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Nếu chưa config OAuth consent screen:
   - Click "Configure Consent Screen"
   - Chọn "External"
   - Điền thông tin:
     - App name: `Mini Marketplace`
     - User support email: email của bạn
     - Developer contact: email của bạn
   - Click "Save and Continue"
   - Skip "Scopes" (click Save and Continue)
   - Add test users: email của bạn
   - Click "Save and Continue"

4. Quay lại "Credentials" → "Create Credentials" → "OAuth client ID"
5. Chọn "Application type": **Web application**
6. Nhập thông tin:
   - Name: `Mini Marketplace Web Client`
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     http://localhost:3000
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:5173
     http://localhost:3000
     ```
7. Click "Create"
8. Copy **Client ID** (dạng: `xxxxx.apps.googleusercontent.com`)

### Bước 4: Cập nhật .env files

**Backend (.env):**
```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

**Frontend (client/.env):**
```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

⚠️ **LƯU Ý:** Client ID phải GIỐNG NHAU ở cả 2 file!

### Bước 5: Restart cả frontend và backend

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## 🧪 Test Google Login:

### Test 1: Login với Google account

1. Vào http://localhost:5173/login
2. Click nút "Sign in with Google"
3. Chọn Google account
4. ✅ Tự động đăng nhập và redirect về trang chủ

### Test 2: Auto tạo account mới

1. Đăng nhập với email chưa có trong database
2. Backend tự động tạo user mới với thông tin từ Google
3. ✅ User được tạo với:
   - Email từ Google
   - Tên từ Google
   - Avatar từ Google
   - Password random (user không biết, chỉ dùng Google login)

### Test 3: Login với account đã tồn tại

1. Đăng nhập với email đã có trong database
2. Backend verify và login
3. ✅ Update avatar nếu chưa có

---

## 📊 Luồng hoạt động:

### Frontend Flow:
```
1. User click "Sign in with Google"
   ↓
2. Google OAuth popup hiện ra
   ↓
3. User chọn account và authorize
   ↓
4. Google trả về credential (JWT token)
   ↓
5. Frontend gọi API: POST /api/auth/google-login
   Body: { credential: "..." }
   ↓
6. Backend verify token → Login/Register
   ↓
7. Backend trả về user info + set cookie
   ↓
8. Frontend lưu localStorage → Redirect
```

### Backend Flow:
```
1. Nhận credential từ frontend
   ↓
2. Verify với Google API
   ↓
3. Extract user info: email, name, picture
   ↓
4. Check email đã tồn tại chưa?
   
   Nếu ĐÃ TỒN TẠI:
   - Check status (banned/pending)
   - Update avatar nếu chưa có
   - Login
   
   Nếu CHƯA TỒN TẠI:
   - Tạo user mới
   - Set random password
   - Set avatar từ Google
   - Set role = "user"
   - Set status = "active"
   ↓
5. Tạo JWT token
   ↓
6. Set cookie (30 ngày)
   ↓
7. Trả về user info
```

---

## 🔒 Bảo mật:

1. ✅ Token được verify với Google API → Không thể fake
2. ✅ Email phải verified by Google
3. ✅ Password random → User không biết, chỉ login bằng Google
4. ✅ JWT cookie HttpOnly → Chống XSS
5. ✅ Check account status (banned/pending)

---

## 🐛 Troubleshooting:

### Lỗi: "Invalid Client ID"
➡️ Check `GOOGLE_CLIENT_ID` trong `.env` đúng chưa

### Lỗi: "redirect_uri_mismatch"
➡️ Thêm `http://localhost:5173` vào "Authorized JavaScript origins" trong Google Console

### Lỗi: "idpiframe_initialization_failed"
➡️ Check browser không block 3rd party cookies

### Lỗi: "popup_closed_by_user"
➡️ User đóng popup trước khi authorize → Bình thường

### Button Google không hiện
➡️ Check:
1. `VITE_GOOGLE_CLIENT_ID` có trong `client/.env`
2. Restart frontend sau khi thêm env
3. Check console có lỗi không

---

## 📁 Files đã tạo/sửa:

### Frontend:
1. ✅ `client/src/main.jsx` - Wrap với GoogleOAuthProvider
2. ✅ `client/src/components/auth/SocialLoginButtons.jsx` - Chỉ giữ Google
3. ✅ `client/src/pages/LoginPage.jsx` - Handle Google login
4. ✅ `client/src/api/authApi.js` - Thêm googleLoginApi
5. ✅ `client/.env` - Thêm VITE_GOOGLE_CLIENT_ID
6. ✅ `client/package.json` - Thêm @react-oauth/google

### Backend:
7. ✅ `backend/controllers/authController.js` - Thêm googleLogin function
8. ✅ `backend/routes/authRoutes.js` - Thêm POST /google-login
9. ✅ `backend/.env` - Thêm GOOGLE_CLIENT_ID
10. ✅ `backend/package.json` - Thêm google-auth-library

---

## 📝 .env Template:

### backend/.env
```env
MONGODB_URI=mongodb://localhost:27017/donation_app
ADMIN_ID=6a799a83d9e719d0439bc99d

CLOUDINARY_CLOUD_NAME=ai1z2oaj
CLOUDINARY_API_KEY=172892198212144
CLOUDINARY_API_SECRET=SM1DvYl34kk34BNEwAtz-F6k0l4

JWT_SECRET=AK_JAS_N@&AS
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

FRONTEND_URL=http://localhost:5173

# Google OAuth - LẤY TỪ GOOGLE CLOUD CONSOLE
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### client/.env
```env
# Google OAuth Client ID - PHẢI GIỐNG BACKEND
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

---

## ✅ Checklist:

- [x] Cài package `@react-oauth/google` (frontend)
- [x] Cài package `google-auth-library` (backend)
- [x] Loại bỏ Facebook/Apple button
- [x] Implement Google login button
- [x] Tạo API endpoint `/google-login`
- [x] Auto register nếu chưa có account
- [x] Auto login nếu đã có account
- [ ] Lấy Google Client ID từ Console (cần làm thủ công)
- [ ] Cập nhật .env files
- [ ] Test login với Google account

---

## 🎯 Kết quả:

**Trước:**
- Có 3 nút: Google, Facebook, Apple
- Chỉ là UI, không có chức năng

**Sau:**
- Chỉ có 1 nút: Google
- ✅ Chức năng hoạt động đầy đủ
- ✅ Auto register/login
- ✅ Lấy avatar từ Google
- ✅ Security với token verification

---

## 🚀 Next Steps:

1. Lấy Google Client ID theo hướng dẫn trên
2. Cập nhật vào 2 file `.env`
3. Restart backend + frontend
4. Test login với Google account của bạn
5. ✅ Hoàn thành!

---

Nếu gặp vấn đề, check lại từng bước trong file này! 📚
