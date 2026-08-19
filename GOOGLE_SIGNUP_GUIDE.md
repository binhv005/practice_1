# 🔐 Google Sign Up Implementation

## ✅ Đã Hoàn Thành

Đã thêm tính năng **Đăng ký bằng Google** vào trang Register.

## Files Đã Sửa

### Frontend

#### 1. `client/src/pages/RegisterPage.jsx`

**Thêm:**
- Import `SocialLoginButtons` component
- Import `googleLoginApi` từ authApi
- Import `useAuth` hook
- Handler `handleGoogleSuccess()` để xử lý Google Sign Up
- Handler `handleGoogleError()` để xử lý lỗi
- Thêm divider "Hoặc"
- Thêm `<SocialLoginButtons />` component vào UI

**Code mới:**
```javascript
import SocialLoginButtons from "../components/auth/SocialLoginButtons";
import { registerApi, googleLoginApi } from "../api/authApi";
import { useAuth } from "../contexts/AuthContext";

// ... trong component

// Handle Google Sign Up Success
const handleGoogleSuccess = async (credentialResponse) => {
  try {
    setLoading(true);
    const response = await googleLoginApi({
      credential: credentialResponse.credential,
    });
    
    if (response.data.success) {
      setUser(response.data.user);
      toast.success(`Chào mừng ${user.fullname}! Đăng ký Google thành công.`);
      navigate("/"); // or "/admin" for admin
    }
  } catch (error) {
    setErrors({ general: error.response?.data?.message || "Đăng ký bằng Google thất bại" });
  } finally {
    setLoading(false);
  }
};
```

**UI mới:**
```jsx
{/* Divider */}
<div className="my-6 flex items-center gap-3">
  <div className="h-px flex-1 bg-gray-200" />
  <span className="text-sm text-gray-400">Hoặc</span>
  <div className="h-px flex-1 bg-gray-200" />
</div>

{/* Social Sign Up Buttons */}
<SocialLoginButtons
  onGoogleSuccess={handleGoogleSuccess}
  onGoogleError={handleGoogleError}
/>
```

### Backend (Đã Có Sẵn)

Backend đã có sẵn Google Login API tại:
- ✅ `POST /api/auth/google-login`
- ✅ Controller: `authController.googleLogin()`
- ✅ Tự động tạo user mới nếu chưa tồn tại
- ✅ Return JWT token và user info

## Cách Hoạt Động

### Flow Đăng Ký Bằng Google

1. **User clicks "Đăng ký với Google"**
   - Google OAuth popup mở ra
   - User chọn Google account

2. **Google trả về credential**
   - Frontend nhận được JWT token từ Google
   - Token chứa email, name, picture, v.v.

3. **Frontend gửi credential đến backend**
   - `POST /api/auth/google-login`
   - Body: `{ credential: "..." }`

4. **Backend verify và xử lý**
   - Verify token với Google API
   - Extract user info (email, name, picture)
   - Check xem user đã tồn tại chưa:
     - **Nếu ĐÃ có:** Đăng nhập (update avatar nếu cần)
     - **Nếu CHƯA có:** Tạo user mới với:
       - fullname từ Google
       - email từ Google
       - avatar từ Google
       - password random (user không biết, chỉ dùng Google login)
       - status: "active"
       - role: "user"

5. **Backend trả về JWT token**
   - Frontend lưu token vào cookie
   - Set user vào AuthContext
   - Navigate về home page

### Ưu Điểm

✅ **User không cần nhập form dài**
- Chỉ cần 1 click
- Không cần nhập email, password, phone, v.v.

✅ **Email verified tự động**
- Google đã verify email rồi
- Không cần confirm email

✅ **Avatar tự động**
- Lấy avatar từ Google
- Không cần upload

✅ **Bảo mật cao**
- Không cần quản lý password
- Google OAuth protocol standard

✅ **UX tốt**
- Fast sign up
- Familiar flow (users đã quen)

## Setup Google OAuth (Nếu Chưa Có)

### 1. Tạo Google OAuth Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới (hoặc chọn existing project)
3. Enable **Google+ API**
4. Vào **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Chọn **Web application**
6. Thêm **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://your-production-domain.com
   ```
7. Thêm **Authorized redirect URIs:**
   ```
   http://localhost:5173
   https://your-production-domain.com
   ```
8. Copy **Client ID**

### 2. Cấu Hình Backend

File: `backend/.env`

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### 3. Cấu Hình Frontend

File: `client/.env`

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

File: `client/.env.production`

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### 4. Verify Setup

1. Start backend: `npm run dev` (trong folder backend)
2. Start frontend: `npm run dev` (trong folder client)
3. Truy cập http://localhost:5173/register
4. Click "Đăng ký với Google"
5. Google popup should appear
6. Sign up thành công!

## Testing

### Test Cases

✅ **New user sign up with Google**
1. Click "Đăng ký với Google"
2. Choose Google account
3. Expected: Tạo account mới, đăng nhập thành công

✅ **Existing user sign up with Google** 
1. User đã có account với email `test@gmail.com`
2. Click "Đăng ký với Google" với cùng email
3. Expected: Đăng nhập vào account existing (không tạo duplicate)

✅ **Google email not verified**
1. Use Google account with unverified email
2. Expected: Show error "Email chưa được xác thực bởi Google"

✅ **Banned user**
1. User account status = "banned"
2. Try sign up/login with Google
3. Expected: Show error "Tài khoản của bạn đã bị khóa"

✅ **Network error**
1. Disconnect internet
2. Try sign up with Google
3. Expected: Show error message

## UI/UX

### Button Style

Button sử dụng Google's official `@react-oauth/google` component:
- ✅ Official Google branding
- ✅ Responsive design
- ✅ Accessibility compliant
- ✅ Multi-language support

### Layout

```
┌─────────────────────────────────┐
│   [Form fields]                 │
│   [Đăng ký button]              │
│                                 │
│   ─────── Hoặc ────────         │  ← Divider
│                                 │
│   [🔵 Đăng ký với Google]       │  ← Social button
│                                 │
│   Đã có tài khoản? Đăng nhập    │
└─────────────────────────────────┘
```

## Security Considerations

### ✅ Implemented

1. **Token Verification**
   - Backend verify token với Google API
   - Không tin tưởng frontend data

2. **Email Verification**
   - Check `email_verified` flag từ Google
   - Reject nếu email chưa verified

3. **Account Status Check**
   - Check banned/pending status
   - Prevent login nếu account bị khóa

4. **Random Password**
   - Generate secure random password cho Google users
   - User không biết password (chỉ dùng Google login)

5. **JWT Token**
   - Sign with SECRET
   - HttpOnly cookie
   - Secure flag in production

### ⚠️ Recommendations

1. **Rate Limiting** (optional)
   ```javascript
   // Limit Google login attempts
   const rateLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 10 // 10 attempts per 15 minutes
   });
   router.post("/google-login", rateLimiter, googleLogin);
   ```

2. **Logging** (optional)
   ```javascript
   // Log Google sign ups
   console.log(`New Google sign up: ${email}`);
   ```

3. **Email Notifications** (optional)
   - Send welcome email after Google sign up
   - Notify if login from new device

## Troubleshooting

### Error: "idpiframe_initialization_failed"

**Nguyên nhân:** Cookie bị block

**Giải pháp:**
1. Check browser cookie settings
2. Allow third-party cookies for Google
3. Try incognito mode

### Error: "Credential không hợp lệ"

**Nguyên nhân:** Google Client ID không đúng

**Giải pháp:**
1. Verify `VITE_GOOGLE_CLIENT_ID` trong `.env`
2. Check Google Cloud Console credentials
3. Verify authorized origins

### Error: "Đăng ký bằng Google thất bại"

**Nguyên nhân:** Backend error

**Giải pháp:**
1. Check backend logs
2. Verify `GOOGLE_CLIENT_ID` trong backend `.env`
3. Test backend API với Postman
4. Check network console for API errors

### Google Button không hiện

**Nguyên nhân:** Google script load failed

**Giải pháp:**
1. Check internet connection
2. Check browser console errors
3. Verify `@react-oauth/google` package installed
4. Clear browser cache

## Migration

Không cần migration! 

Lý do:
- Backend API đã có sẵn
- Chỉ thêm UI component vào frontend
- Không thay đổi database schema
- Backward compatible 100%

Simply deploy new frontend code và restart.

## Summary

✅ **Implemented:**
- Google Sign Up button trong Register page
- Handler functions cho success/error
- Divider "Hoặc" để separate form và social login
- Consistent với Login page (cùng flow)

✅ **Backend:**
- API đã có sẵn (`/api/auth/google-login`)
- Tự động tạo user mới hoặc đăng nhập existing user
- Verify Google token securely

✅ **UX:**
- One-click sign up
- Không cần fill form dài
- Auto avatar từ Google
- Email verified automatically

✅ **Security:**
- Token verification với Google
- Email verified check
- Account status check
- Secure password generation

🚀 **Ready to use!** Chỉ cần config `GOOGLE_CLIENT_ID` và deploy.

---

**Next Steps:**
1. Get Google OAuth credentials từ Google Cloud Console
2. Add `GOOGLE_CLIENT_ID` vào `.env` files (backend & frontend)
3. Test locally
4. Deploy to production
5. Update authorized origins trong Google Cloud Console với production domain

**Support:**
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Docs](https://www.npmjs.com/package/@react-oauth/google)
