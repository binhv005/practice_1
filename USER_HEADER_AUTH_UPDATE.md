# 🎨 Update UserHeader với Authentication

## ✅ Những gì đã thay đổi:

### 1. **State Management**
Thêm state để quản lý trạng thái đăng nhập:
```javascript
const [currentUser, setCurrentUser] = useState(null);
const [isLoggedIn, setIsLoggedIn] = useState(false);
```

### 2. **Auto Check Authentication**
Component tự động kiểm tra user đã đăng nhập khi mount:
```javascript
useEffect(() => {
  const checkAuth = async () => {
    // 1. Check localStorage
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      
      // 2. Verify với server
      try {
        const response = await getMeApi();
        // Update user info mới nhất từ server
        setCurrentUser(response.data.user);
      } catch (error) {
        // Token hết hạn → Logout
        localStorage.removeItem("user");
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    }
  };

  checkAuth();
}, []);
```

### 3. **Helper Functions**
Thêm 2 hàm helper:

**a) getRoleLabel(role)** - Hiển thị role bằng tiếng Việt:
```javascript
admin      → "Quản trị viên"
moderator  → "Điều hành viên"
user       → "Người dùng"
```

**b) getRoleBadgeColor(role)** - Màu badge theo role:
```javascript
admin      → bg-red-100 text-red-700 border-red-200
moderator  → bg-blue-100 text-blue-700 border-blue-200
user       → bg-gray-100 text-gray-700 border-gray-200
```

### 4. **Conditional Rendering - Header**

#### TRƯỚC (luôn hiện):
```jsx
<NavLink to="/login">Đăng nhập</NavLink>
<div>Avatar</div>
```

#### SAU (theo trạng thái):

**Khi CHƯA đăng nhập:**
```jsx
<NavLink to="/login">Đăng nhập</NavLink>
<div>Avatar (icon default)</div>
```

**Khi ĐÃ đăng nhập:**
```jsx
<div>
  <p>Nguyễn Văn A</p>
  <span class="badge">Quản trị viên</span>
</div>
<div>Avatar (ảnh user)</div>
```

### 5. **Conditional Rendering - Dropdown**

#### TRƯỚC (luôn hiện):
```
┌─────────────────────────┐
│ 👤 Mock User            │
│    mock@example.com     │
├─────────────────────────┤
│ [Tạo tài khoản]        │
│ [Đăng nhập]            │
│ [Đăng xuất]            │
└─────────────────────────┘
```

#### SAU - Khi CHƯA đăng nhập:
```
┌─────────────────────────┐
│ 👤 Khách                │
│    Chưa đăng nhập       │
├─────────────────────────┤
│ [Tạo tài khoản]        │
│ [Đăng nhập]            │
└─────────────────────────┘
```

#### SAU - Khi ĐÃ đăng nhập:
```
┌─────────────────────────────┐
│ 👤 Nguyễn Văn A            │
│    user@gmail.com          │
│    🔴 Quản trị viên         │ ← Badge role
├─────────────────────────────┤
│ ⚙️  Cài đặt tài khoản      │
│ 🛡️  Trang quản trị         │ ← Chỉ admin/mod
├─────────────────────────────┤
│ [🚪 Đăng xuất]             │
└─────────────────────────────┘
```

### 6. **Logout Logic Update**
```javascript
const handleLogout = async () => {
  // ... existing code ...
  
  // Update state sau khi logout
  setCurrentUser(null);
  setIsLoggedIn(false);
  
  // ... rest of code ...
};
```

---

## 🎨 UI Details:

### Badge Colors:

| Role | Background | Text | Border |
|---|---|---|---|
| Admin | Red 100 | Red 700 | Red 200 |
| Moderator | Blue 100 | Blue 700 | Blue 200 |
| User | Gray 100 | Gray 700 | Gray 200 |

### User Info Position:
```
[...] [Đăng tin] [Nguyễn Văn A] [Avatar]
                 [Quản trị viên]
                      ↑
                Badge role
```

---

## 🔄 Flow hoạt động:

### Flow 1: User chưa đăng nhập
```
1. Component mount
   ↓
2. useEffect check localStorage → null
   ↓
3. State: isLoggedIn = false
   ↓
4. UI hiển thị:
   - Header: Nút "Đăng nhập"
   - Avatar: Icon default
   - Dropdown: "Khách" + nút Tạo TK/Đăng nhập
```

### Flow 2: User đăng nhập thành công
```
1. User login → LoginPage gọi loginApi()
   ↓
2. Backend trả về user info
   ↓
3. LoginPage lưu: localStorage.setItem("user", JSON.stringify(user))
   ↓
4. Redirect về "/"
   ↓
5. HomePage mount → UserHeader mount
   ↓
6. useEffect detect localStorage có user
   ↓
7. Set: currentUser = user, isLoggedIn = true
   ↓
8. Gọi getMeApi() verify với server
   ↓
9. Update currentUser với data mới nhất
   ↓
10. UI update:
    - Header: Ẩn nút "Đăng nhập", hiện tên + role
    - Avatar: Hiện ảnh user (nếu có)
    - Dropdown: Info đầy đủ + menu + nút Đăng xuất
```

### Flow 3: User đăng xuất
```
1. Click "Đăng xuất" → Confirm
   ↓
2. Gọi logoutApi() → Backend xóa cookie
   ↓
3. localStorage.removeItem("user")
   ↓
4. Set: currentUser = null, isLoggedIn = false
   ↓
5. navigate("/")
   ↓
6. UI quay về trạng thái "Chưa đăng nhập"
```

### Flow 4: Token hết hạn
```
1. Component mount → Check localStorage có user
   ↓
2. Set state: isLoggedIn = true (tạm thời)
   ↓
3. Gọi getMeApi() verify token
   ↓
4. Backend trả về 401 Unauthorized
   ↓
5. Catch error:
   - localStorage.removeItem("user")
   - setCurrentUser(null)
   - setIsLoggedIn(false)
   ↓
6. UI quay về trạng thái "Chưa đăng nhập"
```

---

## 📝 API Calls:

### getMeApi()
```javascript
GET /api/auth/me
Headers: Cookie (accessToken)

Response (Success):
{
  "success": true,
  "user": {
    "id": "...",
    "fullname": "Nguyễn Văn A",
    "email": "user@gmail.com",
    "role": "admin",
    "status": "active",
    "avatar": "...",
    ...
  }
}

Response (Error - Token hết hạn):
{
  "success": false,
  "message": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
}
```

---

## 🧪 Test Scenarios:

### Test 1: User chưa đăng nhập
1. Xóa localStorage: `localStorage.clear()`
2. Reload trang
3. ✅ Thấy nút "Đăng nhập" ở header
4. ✅ Click avatar → Dropdown hiện "Khách"
5. ✅ Có nút "Tạo tài khoản" và "Đăng nhập"
6. ✅ KHÔNG có nút "Đăng xuất"

### Test 2: User đăng nhập thành công
1. Vào `/login`
2. Đăng nhập với tài khoản hợp lệ
3. ✅ Redirect về `/`
4. ✅ Header KHÔNG hiện nút "Đăng nhập"
5. ✅ Header hiện tên user + badge role
6. ✅ Click avatar → Dropdown hiện info đầy đủ
7. ✅ Có menu "Cài đặt tài khoản"
8. ✅ Nếu admin/mod: có menu "Trang quản trị"
9. ✅ Có nút "Đăng xuất"
10. ✅ KHÔNG có nút "Tạo tài khoản" và "Đăng nhập"

### Test 3: User đăng xuất
1. Đang đăng nhập
2. Click avatar → Click "Đăng xuất"
3. ✅ Confirm dialog hiện
4. ✅ Click OK
5. ✅ Alert "Đăng xuất thành công!"
6. ✅ UI quay về trạng thái chưa đăng nhập
7. ✅ localStorage.getItem("user") === null

### Test 4: Token hết hạn (Manual)
1. Đang đăng nhập
2. Dùng browser DevTools → Application → Cookies
3. Xóa cookie `accessToken`
4. Reload trang
5. ✅ getMeApi() fail → Auto logout
6. ✅ UI quay về trạng thái chưa đăng nhập

### Test 5: Remember Login
1. Đăng nhập với checkbox "Ghi nhớ" = ✓
2. Đóng browser
3. Mở lại sau 1 ngày
4. ✅ Vẫn đăng nhập (cookie còn 30 ngày)
5. ✅ Header hiện đúng tên user

### Test 6: Role Badge Colors
**Admin:**
```javascript
localStorage.setItem("user", JSON.stringify({
  fullname: "Admin User",
  email: "admin@example.com",
  role: "admin"
}));
```
Reload → ✅ Badge màu đỏ: "Quản trị viên"

**Moderator:**
```javascript
role: "moderator"
```
Reload → ✅ Badge màu xanh: "Điều hành viên"

**User:**
```javascript
role: "user"
```
Reload → ✅ Badge màu xám: "Người dùng"

---

## 🐛 Known Issues:

### Issue 1: Avatar không hiển thị
**Nguyên nhân:** User chưa có avatar (avatar = "" hoặc null)
**Giải pháp:** Hiện icon default SVG

### Issue 2: Role không có trong user object
**Nguyên nhân:** Backend chưa trả role
**Giải pháp:** Default role = "user"

### Issue 3: getMeApi() luôn fail
**Nguyên nhân:** Backend authMiddleware không nhận cookie
**Giải pháp:** Check CORS `credentials: true` và axios `withCredentials: true`

---

## 📚 Files đã sửa:

1. ✅ `client/src/components/user/UserHeader.jsx`
   - Thêm state: `currentUser`, `isLoggedIn`
   - Thêm useEffect check auth
   - Thêm helper: `getRoleLabel()`, `getRoleBadgeColor()`
   - Conditional rendering header
   - Conditional rendering dropdown
   - Update logout logic

2. ✅ `client/src/api/authApi.js`
   - Import `getMeApi` (đã có sẵn)

3. ✅ `USER_HEADER_AUTH_UPDATE.md` (file này)

---

## ✨ Kết quả cuối cùng:

**Chưa đăng nhập:**
- Header: Hiện nút "Đăng nhập"
- Dropdown: "Khách" + nút Tạo TK/Đăng nhập

**Đã đăng nhập:**
- Header: Ẩn nút "Đăng nhập", hiện tên + role
- Dropdown: Info đầy đủ + menu + nút Đăng xuất
- Avatar: Hiện ảnh user (nếu có)
- Badge role với màu phân biệt

🚀 **UX cải thiện**: User biết mình đã/chưa đăng nhập ngay từ header!
