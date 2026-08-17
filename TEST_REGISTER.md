# Test Chức năng Đăng ký

## ✅ Đã sửa:

1. **RegisterPage.jsx** - Đã kết nối API thật thay vì `setTimeout` giả lập
2. **authApi.js** - URL đã đúng port 3000
3. **server.js** - CORS đã bật `credentials: true`

---

## 🧪 Cách test:

### Bước 1: Start backend
```bash
cd backend
npm run dev
```

Đảm bảo thấy log:
```
Server is running at http://localhost:3000
MongoDB connected successfully
```

### Bước 2: Start frontend
```bash
cd client
npm run dev
```

Mở: http://localhost:5173

### Bước 3: Test đăng ký

1. Vào http://localhost:5173/register
2. Điền form:
   - Họ tên: `Nguyễn Văn A`
   - Số điện thoại: `0912345678`
   - Email: `test@example.com`
   - Mật khẩu: `123456`
   - Nhập lại mật khẩu: `123456`
   - ✓ Check "Tôi đồng ý với các Điều khoản..."
3. Click "Đăng ký"

### Bước 4: Kiểm tra kết quả

**Nếu thành công:**
- Alert hiện: "Đăng ký thành công! Vui lòng đăng nhập."
- Redirect về trang `/login`
- Mở MongoDB Compass → Database `practice1` → Collection `users` → Thấy user mới

**Nếu thất bại:**
- Mở F12 Console xem lỗi
- Check backend terminal có log lỗi không

---

## 🐛 Các lỗi thường gặp:

### Lỗi 1: "Network Error"
**Nguyên nhân:** Backend chưa chạy hoặc CORS chưa đúng

**Cách fix:**
```bash
cd backend
npm run dev
```

### Lỗi 2: "Email đã được sử dụng"
**Nguyên nhân:** Email đã có trong database

**Cách fix:** Dùng email khác hoặc xóa user cũ trong MongoDB

### Lỗi 3: "Cannot connect to MongoDB"
**Nguyên nhân:** MongoDB chưa chạy hoặc connection string sai

**Cách fix:**
```bash
# Check MongoDB đang chạy chưa
mongod --version

# Hoặc dùng MongoDB Compass để test kết nối
```

### Lỗi 4: "Số điện thoại không đúng định dạng"
**Nguyên nhân:** Regex backend yêu cầu số VN: 0[3|5|7|8|9]xxxxxxxx

**Ví dụ đúng:**
- ✅ `0912345678`
- ✅ `0987654321`
- ❌ `0112345678` (không đúng đầu số)
- ❌ `912345678` (thiếu số 0)

---

## 📋 Mapping giữa Frontend và Backend:

| Frontend (RegisterPage) | Backend (authController) | Required |
|---|---|---|
| `form.fullName` | `fullname` | ✅ Yes |
| `form.email` | `email` | ✅ Yes |
| `form.phone` | `phone` | ❌ No (optional) |
| `form.password` | `password` | ✅ Yes |
| `form.confirmPassword` | `confirmPassword` | ✅ Yes |
| - | `address` | ❌ No (default: HCM) |

**⚠️ Lưu ý:** Frontend dùng `fullName` (camelCase) nhưng backend expect `fullname` (lowercase). Tôi đã map đúng trong RegisterPage.

---

## 🔍 Debug checklist:

- [ ] Backend đang chạy ở port 3000
- [ ] Frontend đang chạy ở port 5173
- [ ] MongoDB đang chạy và kết nối thành công
- [ ] File `.env` có `MONGODB_URI` và `JWT_SECRET`
- [ ] CORS config có `credentials: true`
- [ ] authApi có `withCredentials: true`
- [ ] RegisterPage gọi `registerApi()` chứ không phải `setTimeout()`

---

## ✅ Sau khi đăng ký thành công:

1. User được lưu vào MongoDB collection `users`
2. Password được hash bằng bcryptjs
3. Role mặc định: `user`
4. Status mặc định: `active`
5. Address mặc định: `Thành phố Hồ Chí Minh`

Giờ có thể dùng email/password để đăng nhập!

---

## 📸 Screenshot debug (F12 Console):

**Request gửi đi:**
```javascript
POST http://localhost:3000/api/auth/register
{
  "fullname": "Nguyễn Văn A",
  "email": "test@example.com",
  "phone": "0912345678",
  "password": "123456",
  "confirmPassword": "123456"
}
```

**Response thành công (201):**
```json
{
  "success": true,
  "message": "Tạo tài khoản thành công",
  "user": {
    "id": "...",
    "fullname": "Nguyễn Văn A",
    "email": "test@example.com",
    "phone": "0912345678",
    "role": "user",
    "status": "active"
  }
}
```

**Response lỗi (409 - Email trùng):**
```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```
