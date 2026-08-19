# ⚡ Quick OTP Test - 3 Minutes

## 🚀 Test Nhanh (Copy & Paste)

### Step 1: Register (Copy vào Postman)

```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "fullname": "Test User",
  "email": "test@example.com",
  "phone": "0987654321",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:** Lưu `userId`

**Console:** Copy OTP (6 số)

---

### Step 2: Verify OTP

```
POST http://localhost:3000/api/auth/verify-otp
Content-Type: application/json

{
  "userId": "PASTE_USER_ID_HERE",
  "otpCode": "PASTE_OTP_HERE"
}
```

**Response:** User active!

---

### Step 3: Login

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "identifier": "test@example.com",
  "password": "password123"
}
```

**Response:** Success!

---

## 🎯 Expected Flow

```
1. Register
   ↓
   Console: ✅ OTP sent: 123456
   ↓
   Response: { userId: "677..." }

2. Copy OTP: 123456

3. Verify OTP
   ↓
   Response: { user: { status: "active" } }

4. Login
   ↓
   Response: { success: true }
```

---

## 🔍 Check Status

**MongoDB:**
```javascript
db.users.findOne({ email: "test@example.com" }, { status: 1, otpCode: 1 })
```

**Before Verify:**
```json
{ "status": "pending", "otpCode": "123456" }
```

**After Verify:**
```json
{ "status": "active", "otpCode": null }
```

---

## ❌ Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Mã OTP không chính xác" | OTP sai | Copy đúng từ console |
| "Người dùng không tồn tại" | userId sai | Check userId từ register |
| "Tài khoản chưa kích hoạt" | Chưa verify | Verify OTP trước |
| "Email đã được sử dụng" | Email trùng | Dùng email khác |

---

## 📋 Checklist

- [ ] Backend running: `npm run dev`
- [ ] MongoDB connected
- [ ] Console visible (để copy OTP)
- [ ] Postman ready

**✅ GO!** Test ngay thôi!
