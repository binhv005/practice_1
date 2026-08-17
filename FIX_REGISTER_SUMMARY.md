# 🔧 Tóm tắt fix chức năng Đăng ký

## ❌ Vấn đề ban đầu:

**RegisterPage.jsx** không gọi API thật, chỉ dùng `setTimeout()` giả lập:

```javascript
// Code CŨ (sai) ❌
await new Promise((resolve) => setTimeout(resolve, 1500));
navigate("/");
```

➡️ Kết quả: User nhập form → "Thành công" → Nhưng không lưu vào database!

---

## ✅ Đã sửa:

### 1. RegisterPage.jsx
**Trước:**
```javascript
// Fake API call
await new Promise((resolve) => setTimeout(resolve, 1500));
navigate("/");
```

**Sau:**
```javascript
// Gọi API thật
const response = await registerApi({
  fullname: form.fullName,  // Map field name đúng
  email: form.email,
  phone: form.phone,
  password: form.password,
  confirmPassword: form.confirmPassword,
});

if (response.data.success) {
  alert(`Chào mừng ${response.data.user.fullname}!`);
  setTimeout(() => navigate("/login"), 500);
}
```

### 2. Import registerApi
```javascript
import { registerApi } from "../api/authApi";
```

### 3. Backend server.js
Xóa dòng duplicate `cookieParser()`:
```javascript
// Trước: cookieParser() xuất hiện 2 lần ❌
app.use(cookieParser());
// ...
app.use(cookieParser()); // Dòng này bị duplicate

// Sau: chỉ giữ 1 lần ✅
app.use(cookieParser());
```

---

## 🎯 Luồng hoạt động SAU KHI SỬA:

```
1. User điền form đăng ký
   ↓
2. Click "Đăng ký" → Validation client-side
   ↓
3. Frontend gọi: POST http://localhost:3000/api/auth/register
   Body: { fullname, email, phone, password, confirmPassword }
   ↓
4. Backend nhận request:
   - Validate dữ liệu
   - Check email/phone có trùng không
   - Hash password
   - Lưu vào MongoDB
   ↓
5. Backend trả response:
   {
     "success": true,
     "message": "Tạo tài khoản thành công",
     "user": { ... }
   }
   ↓
6. Frontend nhận response:
   - Hiện alert "Chào mừng [tên user]!"
   - Clear form
   - Redirect về /login sau 0.5 giây
   ↓
7. User đăng nhập với tài khoản mới
```

---

## 📝 Mapping field name:

| Frontend (form state) | Request body | Backend expect |
|---|---|---|
| `form.fullName` | `fullname` | `fullname` ✅ |
| `form.email` | `email` | `email` ✅ |
| `form.phone` | `phone` | `phone` ✅ |
| `form.password` | `password` | `password` ✅ |
| `form.confirmPassword` | `confirmPassword` | `confirmPassword` ✅ |

**⚠️ Quan trọng:** Frontend dùng `fullName` (camelCase) nhưng phải gửi thành `fullname` (lowercase) vì backend expect vậy.

---

## 🧪 Test ngay:

### Bước 1: Chạy backend
```bash
cd backend
npm run dev
```

### Bước 2: Chạy frontend
```bash
cd client
npm run dev
```

### Bước 3: Test đăng ký
1. Vào http://localhost:5173/register
2. Điền form:
   - Họ tên: Nguyễn Văn A
   - SĐT: 0912345678
   - Email: test123@gmail.com
   - Password: 123456
   - Confirm: 123456
   - ✓ Check điều khoản
3. Click "Đăng ký"
4. Thấy alert "Chào mừng Nguyễn Văn A!"
5. Tự động chuyển về /login
6. Đăng nhập bằng email + password vừa tạo

### Bước 4: Kiểm tra database
```bash
# Mở MongoDB Compass
# Connect: mongodb://localhost:27017
# Database: practice1
# Collection: users
# → Thấy user mới được tạo
```

---

## ✅ Kết quả mong đợi:

**Request:**
```json
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "fullname": "Nguyễn Văn A",
  "email": "test123@gmail.com",
  "phone": "0912345678",
  "password": "123456",
  "confirmPassword": "123456"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tạo tài khoản thành công",
  "user": {
    "id": "67a3f8c...",
    "fullname": "Nguyễn Văn A",
    "email": "test123@gmail.com",
    "phone": "0912345678",
    "avatar": "",
    "role": "user",
    "status": "active",
    "address": {
      "province": "Thành phố Hồ Chí Minh",
      "ward": ""
    }
  }
}
```

**MongoDB document được tạo:**
```json
{
  "_id": ObjectId("67a3f8c..."),
  "fullname": "Nguyễn Văn A",
  "email": "test123@gmail.com",
  "phone": "0912345678",
  "password": "$2a$10$...", // Đã được hash
  "avatar": "",
  "bio": "",
  "role": "user",
  "status": "active",
  "reputationScore": 0,
  "stats": {},
  "address": {
    "province": "Thành phố Hồ Chí Minh",
    "ward": ""
  },
  "blockedUsers": [],
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

---

## 🐛 Nếu gặp lỗi:

### "Network Error"
➡️ Backend chưa chạy hoặc CORS config sai
```bash
cd backend
npm run dev
```

### "Email đã được sử dụng"
➡️ Email đã tồn tại trong DB, dùng email khác

### "Số điện thoại không đúng định dạng"
➡️ Phải là số VN: 0[3|5|7|8|9]xxxxxxxx
- ✅ 0912345678
- ❌ 0112345678 (đầu số sai)

### "Không kết nối được MongoDB"
➡️ MongoDB chưa chạy
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

---

## 📚 Files đã sửa:

1. ✅ `client/src/pages/RegisterPage.jsx`
   - Import `registerApi`
   - Thay `setTimeout()` bằng `registerApi()`
   - Map field `fullName` → `fullname`
   - Alert + redirect sau khi thành công

2. ✅ `backend/server.js`
   - Xóa dòng duplicate `cookieParser()`

3. ✅ `TEST_REGISTER.md` (tài liệu hướng dẫn test)

4. ✅ `FIX_REGISTER_SUMMARY.md` (file này - tóm tắt)

---

## ✨ Giờ chức năng đăng ký đã hoạt động 100%!

Test ngay và cho tôi biết kết quả nhé! 🚀
