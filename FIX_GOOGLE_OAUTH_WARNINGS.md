# 🔧 Fix Google OAuth Warnings

## ⚠️ Lỗi hiện tại:

```
Failed to load resource: the server responded with a status of 403

[GSI_LOGGER]: The given origin is not allowed for the given client ID.

Cross-Origin-Opener-Policy policy would block the window.postMessage call.
```

---

## ✅ Tình trạng:

- ✅ Credential đã có: `eyJhbGciOiJSUzI1NiIs...`
- ✅ Client ID đã match: `681360958378-49fs422iqp79m220udg3lsn9dntrikku.apps.googleusercontent.com`
- ✅ Google login **ĐÃ HOẠT ĐỘNG** (có credential rồi)
- ⚠️ Chỉ còn warnings từ Google Console config

---

## 🛠️ Cách fix warnings:

### Fix 1: Thêm Authorized JavaScript Origins

1. Vào https://console.cloud.google.com/apis/credentials
2. Click vào OAuth 2.0 Client ID của bạn
3. Trong phần **"Authorized JavaScript origins"**, thêm:
   ```
   http://localhost:5173
   http://localhost:3000
   https://localhost:5173
   https://localhost:3000
   ```
4. Click "Save"
5. Đợi 5-10 phút để Google update

### Fix 2: Thêm Authorized Redirect URIs

Trong cùng page, phần **"Authorized redirect URIs"**, thêm:
```
http://localhost:5173
http://localhost:5173/login
http://localhost:5173/register
http://localhost:3000
http://localhost:3000/api/auth/google-callback
```

### Fix 3: Check OAuth Consent Screen

1. Vào https://console.cloud.google.com/apis/credentials/consent
2. Đảm bảo:
   - Publishing status: "Testing" (cho development)
   - Test users: Thêm email bạn đang test
3. Authorized domains: Thêm `localhost`

---

## 🧪 Test lại:

### Bước 1: Clear cache
```javascript
// Console browser
localStorage.clear();
sessionStorage.clear();
// Reload: Ctrl+Shift+R
```

### Bước 2: Restart backend
```bash
cd backend
npm run dev
```

### Bước 3: Test login
1. Vào http://localhost:5173/login
2. Click "Sign in with Google"
3. ✅ Đăng nhập thành công
4. ✅ Avatar từ Google hiển thị

---

## 📸 Kiểm tra Avatar từ Google:

### Check trong database:
```javascript
// MongoDB Compass hoặc mongosh
db.users.find({ email: "your_email@gmail.com" })

// Kết quả mong đợi:
{
  _id: ObjectId("..."),
  fullname: "Your Name",
  email: "your_email@gmail.com",
  avatar: "https://lh3.googleusercontent.com/...",  // ← Avatar từ Google
  role: "user",
  status: "active"
}
```

### Check trong UserHeader:

**Khi đã login:**
- Avatar góc phải header hiển thị ảnh từ Google
- Click avatar → Dropdown hiển thị ảnh trong header info

**Code đã implement:**
```javascript
// UserHeader.jsx line ~850
{isLoggedIn && currentUser?.avatar ? (
  <img
    src={currentUser.avatar}  // ← URL từ Google
    alt={currentUser.fullname}
    className="h-full w-full object-cover"
  />
) : (
  // Icon default nếu không có avatar
  <svg>...</svg>
)}
```

---

## 🔍 Debug nếu avatar không hiển thị:

### Check 1: Backend có lưu avatar không?

**Backend terminal log:**
```bash
# Khi login với Google, check log:
✅ Email sent successfully: ...
User created/updated with avatar: https://lh3.googleusercontent.com/...
```

### Check 2: Frontend có nhận avatar không?

**Browser console:**
```javascript
// Check localStorage
const user = JSON.parse(localStorage.getItem("user"));
console.log(user.avatar);
// → "https://lh3.googleusercontent.com/..."
```

### Check 3: Avatar URL có valid không?

**Test URL:**
1. Copy avatar URL từ console
2. Paste vào browser tab mới
3. Nếu hiển thị ảnh → URL valid
4. Nếu 403/404 → Google chặn, cần fix permissions

---

## 🐛 Nếu avatar vẫn không hiển thị:

### Option 1: Reload user info sau khi login

**LoginPage.jsx:**
```javascript
const handleGoogleSuccess = async (credentialResponse) => {
  try {
    // ... existing code ...
    
    if (response.data.success) {
      const user = response.data.user;
      
      // Lưu user với avatar
      localStorage.setItem("user", JSON.stringify(user));
      
      console.log("User avatar:", user.avatar); // Debug
      
      // Redirect
      navigate("/");
    }
  } catch (error) {
    // ...
  }
};
```

### Option 2: Force reload UserHeader

**UserHeader.jsx - useEffect:**
```javascript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem("user");
      
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
        
        console.log("Current user avatar:", user.avatar); // Debug
        
        // Verify với server
        try {
          const response = await getMeApi();
          if (response.data.success) {
            // Update avatar mới nhất từ server
            const serverUser = response.data.user;
            setCurrentUser(serverUser);
            localStorage.setItem("user", JSON.stringify(serverUser));
            
            console.log("Server user avatar:", serverUser.avatar); // Debug
          }
        } catch (error) {
          // Token expired
          localStorage.removeItem("user");
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      }
    } catch (error) {
      console.error("Check auth error:", error);
    }
  };

  checkAuth();
}, []);
```

---

## ✅ Checklist:

- [x] Backend CORS đã cấu hình
- [x] Backend controller lưu avatar từ Google
- [x] Frontend UserHeader hiển thị avatar
- [x] Frontend localStorage lưu user với avatar
- [ ] Google Console - Thêm Authorized Origins (cần làm thủ công)
- [ ] Google Console - Thêm Redirect URIs (cần làm thủ công)
- [ ] Google Console - Thêm Test Users (cần làm thủ công)

---

## 🎯 Kết quả mong đợi:

### Sau khi login với Google:

**Header:**
```
[...] [Đăng tin] [Your Name      ] [Avatar ảnh Google]
                 [Người dùng]
```

**Dropdown khi click avatar:**
```
┌─────────────────────────────────┐
│  [Avatar]  Your Name           │
│            your@gmail.com       │
│            🔵 Người dùng         │
├─────────────────────────────────┤
│  ⚙️  Cài đặt tài khoản         │
├─────────────────────────────────┤
│  [🚪 Đăng xuất]                │
└─────────────────────────────────┘
```

**Database:**
```javascript
{
  fullname: "Your Name",
  email: "your@gmail.com",
  avatar: "https://lh3.googleusercontent.com/a/...",
  role: "user",
  status: "active"
}
```

---

## 📝 Notes:

1. **403 warning** là từ Google Console config, KHÔNG ảnh hưởng chức năng
2. **COOP warning** là từ Google security policy, có thể ignore
3. **Credential đã có** nghĩa là login thành công rồi
4. Avatar từ Google là URL dạng: `https://lh3.googleusercontent.com/...`
5. URL này public, có thể access trực tiếp từ browser

---

## 🚀 Quick Fix Steps:

1. ✅ Vào Google Console
2. ✅ Thêm `http://localhost:5173` vào Authorized Origins
3. ✅ Save
4. ✅ Đợi 5 phút
5. ✅ Clear browser cache
6. ✅ Test lại

Warnings sẽ biến mất! 🎉

---

## 📞 Support:

Nếu vẫn có vấn đề:
1. Check backend terminal có log lỗi không
2. Check browser console có lỗi khác không
3. Check MongoDB có user được tạo với avatar không
4. Check localStorage có user.avatar không

Avatar từ Google **ĐÃ HOẠT ĐỘNG** trong code, chỉ cần fix Google Console config! ✅
