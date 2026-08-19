# 🧪 Postman Testing Guide - OTP Verification

## 📋 Flow Tổng Quan

```
1. Register (Tạo user pending)
   ↓
2. Lấy OTP từ console/email
   ↓
3. Verify OTP (Active user)
   ↓
4. Login thành công
```

---

## 🚀 Test Step by Step

### ✅ Step 1: Register User (Tạo Pending User)

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "fullname": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "phone": "0123456789",
  "password": "password123",
  "confirmPassword": "password123",
  "address": {
    "province": "Thành phố Hồ Chí Minh",
    "ward": "Phường Bến Nghé"
  }
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Mã xác thực đã được gửi đến email của bạn",
  "userId": "677ab12345abcdef67890123",
  "email": "nguyenvana@example.com"
}
```

**⚠️ QUAN TRỌNG:**
- Lưu lại `userId` - Cần cho bước verify OTP
- Lưu lại `email` để kiểm tra

**📝 Check Backend Console:**

Bạn sẽ thấy OTP trong console:
```
==================================================
📧 MOCK EMAIL - OTP VERIFICATION (Development Mode)
==================================================
To:      nguyenvana@example.com
Subject: Mã xác thực đăng ký tài khoản
Name:    Nguyen Van A

🔐 OTP Code:

    123456

Valid for: 10 minutes
==================================================
```

**Copy OTP code:** `123456` (hoặc số bạn thấy)

---

### ✅ Step 2: Check User Status (Optional - Kiểm Tra Pending)

**Endpoint:** `GET http://localhost:3000/api/auth/me`

**Headers:**
```
Cookie: accessToken=<your-token-if-any>
```

**Hoặc check bằng MongoDB:**

MongoDB Compass:
```javascript
db.users.findOne({ email: "nguyenvana@example.com" })
```

**Expected Result:**
```json
{
  "_id": "677ab12345...",
  "email": "nguyenvana@example.com",
  "fullname": "Nguyen Van A",
  "status": "pending",           // ← Status là pending
  "isEmailVerified": false,       // ← Chưa verify
  "otpCode": "123456",            // ← OTP ở đây
  "otpExpires": "2025-01-18T..."
}
```

---

### ✅ Step 3: Verify OTP (Kích Hoạt User)

**Endpoint:** `POST http://localhost:3000/api/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "userId": "677ab12345abcdef67890123",
  "otpCode": "123456"
}
```

**⚠️ Lưu ý:**
- `userId`: Copy từ response Step 1
- `otpCode`: Copy từ console ở Step 1

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Xác thực thành công! Tài khoản của bạn đã được kích hoạt",
  "user": {
    "id": "677ab12345abcdef67890123",
    "fullname": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "phone": "0123456789",
    "avatar": "",
    "role": "user",
    "status": "active",           // ← Đã active!
    "address": {
      "province": "Thành phố Hồ Chí Minh",
      "ward": "Phường Bến Nghé"
    }
  }
}
```

**✅ Check Database Lại:**

MongoDB:
```javascript
db.users.findOne({ email: "nguyenvana@example.com" })
```

**Result:**
```json
{
  "_id": "677ab12345...",
  "email": "nguyenvana@example.com",
  "status": "active",           // ← Đã active!
  "isEmailVerified": true,      // ← Đã verify!
  "otpCode": null,              // ← OTP đã bị xóa
  "otpExpires": null            // ← Đã xóa
}
```

---

### ✅ Step 4: Login (Sau Khi Active)

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "identifier": "nguyenvana@example.com",
  "password": "password123",
  "remember": true
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "user": {
    "id": "677ab12345...",
    "fullname": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "phone": "0123456789",
    "avatar": "",
    "bio": "",
    "role": "user",
    "status": "active",
    "address": {
      "province": "Thành phố Hồ Chí Minh",
      "ward": "Phường Bến Nghé"
    }
  }
}
```

**✅ Success!** User đã active và có thể login!

---

## 🔄 Test Case 2: Resend OTP

### Scenario: User không nhận được email hoặc OTP hết hạn

**Endpoint:** `POST http://localhost:3000/api/auth/resend-otp`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "userId": "677ab12345abcdef67890123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Mã xác thực mới đã được gửi đến email của bạn"
}
```

**Check Console:** OTP mới sẽ hiện ra

```
==================================================
📧 MOCK EMAIL - OTP VERIFICATION
==================================================
To:      nguyenvana@example.com

🔐 OTP Code:

    789012    ← OTP mới

Valid for: 10 minutes
==================================================
```

**Verify với OTP mới:**

```json
{
  "userId": "677ab12345abcdef67890123",
  "otpCode": "789012"
}
```

---

## ❌ Test Error Cases

### Test 1: OTP Sai

**Request:**
```json
POST /api/auth/verify-otp
{
  "userId": "677ab12345...",
  "otpCode": "999999"    // ← Sai OTP
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Mã OTP không chính xác"
}
```

---

### Test 2: OTP Hết Hạn

**Steps:**
1. Register user
2. Đợi > 10 phút
3. Verify OTP

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới"
}
```

**Solution:** Gọi resend-otp

---

### Test 3: User ID Không Tồn Tại

**Request:**
```json
{
  "userId": "000000000000000000000000",  // ← Không tồn tại
  "otpCode": "123456"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Người dùng không tồn tại"
}
```

---

### Test 4: Email Đã Verify

**Scenario:** User đã verify rồi, try verify lại

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email đã được xác thực"
}
```

---

### Test 5: Login Trước Khi Verify (Pending User)

**Request:**
```json
POST /api/auth/login
{
  "identifier": "nguyenvana@example.com",
  "password": "password123"
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Tài khoản của bạn chưa được kích hoạt"
}
```

---

## 📊 Postman Collection Import

Tạo file `OTP_Tests.postman_collection.json`:

```json
{
  "info": {
    "name": "OTP Verification Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Register User (Get OTP)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fullname\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"phone\": \"0987654321\",\n  \"password\": \"password123\",\n  \"confirmPassword\": \"password123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "2. Verify OTP",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"{{userId}}\",\n  \"otpCode\": \"{{otpCode}}\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/verify-otp",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "verify-otp"]
        }
      }
    },
    {
      "name": "3. Resend OTP",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"{{userId}}\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/resend-otp",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "resend-otp"]
        }
      }
    },
    {
      "name": "4. Login After Verify",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"identifier\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"remember\": true\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "login"]
        }
      }
    }
  ]
}
```

**Import vào Postman:**
1. Postman → Import
2. Paste JSON trên
3. Click Import
4. Chạy từng request theo thứ tự

---

## 🎯 Quick Test Checklist

### Happy Path:
- [ ] Register → Status 201, có userId
- [ ] Console hiển thị OTP
- [ ] MongoDB: user status = "pending"
- [ ] Verify OTP đúng → Status 200
- [ ] MongoDB: user status = "active"
- [ ] OTP bị xóa (null)
- [ ] Login thành công

### Error Paths:
- [ ] OTP sai → Status 400
- [ ] OTP hết hạn → Status 400
- [ ] UserId không tồn tại → Status 404
- [ ] Login trước verify → Status 403
- [ ] Verify lại sau khi đã verify → Status 400

---

## 🔍 Debug Tips

### 1. Check Backend Console
Luôn xem console để lấy OTP:
```
✅ OTP sent to user@example.com: 123456
```

### 2. Check MongoDB
```javascript
// Find user by email
db.users.findOne({ email: "test@example.com" })

// Check all pending users
db.users.find({ status: "pending" })

// Check all active users
db.users.find({ status: "active" })
```

### 3. Check Logs
Backend sẽ log:
```
🔵 Register request received
✅ OTP sent to email: 123456
✅ User verified successfully
```

---

## 📝 Summary

**Workflow:**
1. ✅ Register → User "pending" + OTP trong DB
2. ✅ Verify OTP → User "active" + OTP xóa
3. ✅ Login → Success với active user

**Endpoints:**
- `POST /api/auth/register` → Tạo user pending
- `POST /api/auth/verify-otp` → Active user
- `POST /api/auth/resend-otp` → Gửi OTP mới
- `POST /api/auth/login` → Login sau verify

**Development Mode:**
- OTP hiển thị trong console
- Không cần config email
- Copy OTP từ terminal

**Production Mode:**
- Cần config EMAIL_* trong .env
- OTP gửi qua email thật
- User nhận email và nhập OTP

---

**✅ Test ngay!** Backend đã sẵn sàng, chỉ cần copy OTP từ console!
