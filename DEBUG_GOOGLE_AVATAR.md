# 🐛 Debug Google Avatar Issue

## ✅ Đã thêm logs để debug

### Backend logs:
- 🔵 Google login request received
- ✅ Credential received
- 🔍 Verifying token with Google
- ✅ Token verified. User info
- 🔍 Checking if user exists
- ✅ User exists / 🆕 Creating new user
- 📸 Updating avatar from Google
- ✅ Response sent

### Frontend logs:
- 🔵 Google credential received
- 📡 Calling backend API
- ✅ Backend response
- 👤 User info
- 📸 Avatar URL
- 💾 Saved to localStorage

---

## 🚀 Test ngay:

### Bước 1: Khởi động backend
```bash
cd backend
npm run dev
```

**Quan trọng:** Để terminal này mở, quan sát logs!

### Bước 2: Khởi động frontend (terminal mới)
```bash
cd client
npm run dev
```

### Bước 3: Test Google login
1. Vào http://localhost:5173/login
2. Click "Sign in with Google"
3. Chọn account

### Bước 4: Quan sát logs

**Backend terminal sẽ hiển thị:**
```
🔵 Google login request received
✅ Credential received: eyJhbGciOiJSUzI1NiIs...
🔍 Verifying token with Google...
✅ Token verified. User info: {
  email: 'your@gmail.com',
  name: 'Your Name',
  picture: 'https://lh3.googleusercontent.com/...'
}
🔍 Checking if user exists: your@gmail.com
✅ User exists. Logging in...
📸 Updating avatar from Google: https://lh3.googleusercontent.com/...
✅ Response sent
```

**Browser console sẽ hiển thị:**
```
🔵 Google credential received: {credential: '...', clientId: '...'}
📡 Calling backend API /google-login...
✅ Backend response: {success: true, message: '...', user: {...}}
👤 User info: {id: '...', fullname: '...', email: '...', avatar: '...'}
📸 Avatar URL: https://lh3.googleusercontent.com/...
💾 Saved to localStorage: {id: '...', avatar: '...'}
```

---

## 🔍 Kiểm tra từng bước:

### Check 1: Backend có nhận request không?

**Nếu KHÔNG thấy log "🔵 Google login request received":**
➡️ Frontend không gọi API, check Network tab

**Nếu CÓ log nhưng lỗi sau đó:**
➡️ Copy full error message và báo cho tôi

### Check 2: Token verification có thành công không?

**Nếu lỗi "Token used too early":**
➡️ Đồng hồ máy tính sai giờ, sync lại time

**Nếu lỗi "Invalid token":**
➡️ GOOGLE_CLIENT_ID không đúng, check .env

### Check 3: Avatar có được lưu không?

**Kiểm tra database:**
```javascript
// MongoDB Compass hoặc mongosh
db.users.find({ email: "your@gmail.com" })

// Xem field avatar
```

**Nếu avatar = "" hoặc null:**
➡️ Google không trả picture, có thể do account settings

### Check 4: localStorage có avatar không?

**Browser console:**
```javascript
const user = JSON.parse(localStorage.getItem("user"));
console.log("Avatar:", user.avatar);

// Test avatar URL
const img = new Image();
img.src = user.avatar;
img.onload = () => console.log("✅ Avatar loads!");
img.onerror = () => console.log("❌ Avatar failed!");
```

---

## 🎯 Các trường hợp có thể xảy ra:

### Case 1: Backend không nhận request
**Nguyên nhân:** CORS hoặc API URL sai

**Fix:**
```javascript
// client/src/api/authApi.js
const API_URL = "http://localhost:3000/api/auth";

// Đảm bảo port 3000 đúng với backend
```

### Case 2: Token verification failed
**Nguyên nhân:** GOOGLE_CLIENT_ID sai hoặc không match

**Fix:**
```env
# backend/.env và client/.env
# Phải GIỐNG NHAU:
GOOGLE_CLIENT_ID=681360958378-49fs422iqp79m220udg3lsn9dntrikku.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=681360958378-49fs422iqp79m220udg3lsn9dntrikku.apps.googleusercontent.com
```

### Case 3: Avatar không có trong payload
**Nguyên nhân:** Google account setting restrict profile picture

**Check:**
1. Vào https://myaccount.google.com/personal-info
2. Đảm bảo profile photo public
3. Test với account khác

**Workaround:**
```javascript
// Backend sẽ để avatar = ""
// Frontend sẽ hiển thị icon default
```

### Case 4: Avatar có nhưng không hiển thị
**Nguyên nhân:** UserHeader chưa reload state

**Fix:**
```javascript
// Sau khi login, force reload:
window.location.href = "/";

// Hoặc trong LoginPage.jsx:
navigate("/", { replace: true });
window.location.reload();
```

---

## 🛠️ Quick Fixes:

### Fix 1: Force reload sau login
```javascript
// client/src/pages/LoginPage.jsx
if (response.data.success) {
  const user = response.data.user;
  localStorage.setItem("user", JSON.stringify(user));
  
  // Force reload để UserHeader update
  window.location.href = "/";
}
```

### Fix 2: Đảm bảo UserHeader check localStorage đúng
```javascript
// client/src/components/user/UserHeader.jsx
useEffect(() => {
  const checkAuth = async () => {
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      
      console.log("🔍 UserHeader - Loaded user:", user);
      console.log("📸 UserHeader - Avatar:", user.avatar);
      
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  };

  checkAuth();
}, []); // Chỉ chạy 1 lần khi mount
```

### Fix 3: Test avatar URL directly
```javascript
// Browser console sau khi login
const user = JSON.parse(localStorage.getItem("user"));
window.open(user.avatar); // Mở tab mới với avatar URL
```

---

## 📸 Avatar URL format:

Google avatar URL có dạng:
```
https://lh3.googleusercontent.com/a/ACg8ocKxxx...
```

**Đặc điểm:**
- Public URL, không cần auth
- Có thể access trực tiếp
- Thường có size parameter: `?s=96` (96x96px)
- Google có thể restrict nếu account setting private

---

## ✅ Expected Result:

**Sau khi login thành công:**

1. **Backend terminal:**
```
🔵 Google login request received
✅ Token verified
📸 Avatar: https://lh3.googleusercontent.com/...
```

2. **Browser console:**
```
📸 Avatar URL: https://lh3.googleusercontent.com/...
💾 Saved to localStorage
```

3. **Header display:**
```
┌──────────────────────────────┐
│  Your Name     │ [Avatar img] │
│  Người dùng    │              │
└──────────────────────────────┘
```

4. **localStorage:**
```json
{
  "id": "...",
  "fullname": "Your Name",
  "email": "your@gmail.com",
  "avatar": "https://lh3.googleusercontent.com/...",
  "role": "user"
}
```

---

## 🚨 Nếu vẫn không được:

Paste cho tôi:

1. **Backend terminal log** (toàn bộ từ khi click Google login)
2. **Browser console log** (toàn bộ log có icon 🔵/✅/❌)
3. **Network tab** response của `/google-login`
4. **localStorage** content: `JSON.parse(localStorage.getItem("user"))`

Tôi sẽ phân tích chính xác vấn đề! 🎯

---

## 📝 Fix Google Console 403 (optional):

Lỗi 403 warning KHÔNG ảnh hưởng chức năng, nhưng muốn fix:

1. Vào https://console.cloud.google.com/apis/credentials
2. Click Client ID: `681360958378-49fs422iqp79m220udg3lsn9dntrikku`
3. Thêm vào **"Authorized JavaScript origins"**:
   ```
   http://localhost:5173
   ```
4. Click **Save**
5. Đợi 5 phút
6. Clear browser cache: Ctrl+Shift+Del
7. Test lại

Warning sẽ biến mất! ✅
