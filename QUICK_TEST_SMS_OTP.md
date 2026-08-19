# 🚀 Quick Test Guide - SMS OTP Feature

## ⚡ Quick Start (5 Minutes)

### Step 1: Start Redis (Required)

```bash
# Option 1: WSL/Linux
redis-server

# Option 2: Docker
docker run -d -p 6379:6379 redis:latest

# Test connection
redis-cli ping
# Should return: PONG
```

### Step 2: Start Backend

```bash
cd backend
npm start
```

**Expected logs:**
```
✅ MongoDB: Connected successfully
✅ Redis: Connected successfully
⚠️ Twilio credentials not configured. SMS features disabled.
📱 SMS OTP (Development Mode)
Server is running at http://localhost:3000
```

> **Note:** Development mode tự động in OTP ra console thay vì gửi SMS thật. Perfect cho testing!

### Step 3: Start Frontend

```bash
cd client
npm run dev
```

Open: http://localhost:5173

---

## 🧪 Test Flow

### Flow 1: Đăng Ký Bằng SMS (Full Flow)

#### 1.1. Vào Trang Đăng Ký SMS

```
Browser: http://localhost:5173/register

Click: "Đăng ký bằng SMS" button
→ Redirect to: /register-sms
```

#### 1.2. Nhập Số Điện Thoại

```
Input: 0901234567
Click: "Gửi mã OTP"
```

**Backend Console sẽ hiện:**
```
===========================================
📱 SMS OTP (Development Mode)
===========================================
Phone: +84901234567
OTP Code: 482910
===========================================
```

**Frontend:**
- Toast: "Mã OTP đã được gửi..."
- Auto redirect to: `/verify-sms-otp?phoneNumber=0901234567`

#### 1.3. Nhập OTP + Thông Tin

**Trang Verify SMS OTP:**

1. **Copy OTP từ backend console:** `482910`

2. **Nhập OTP vào 6 ô:** `4 8 2 9 1 0`
   - Auto-focus sang ô tiếp theo
   - Hoặc paste trực tiếp: Ctrl+V

3. **Điền thông tin:**
   - Họ và tên: `Nguyen Van A` ✅ Required
   - Email: `test@example.com` (optional)
   - Mật khẩu: `password123` ✅ Required
   - Xác nhận mật khẩu: `password123` ✅ Required

4. **Click:** "Hoàn tất đăng ký"

**Success:**
- ✅ User được tạo với status `active`
- ✅ JWT token được set vào cookie
- ✅ User info lưu vào localStorage
- ✅ Toast: "Đăng ký thành công!"
- ✅ Auto redirect to `/` (Homepage)
- ✅ User đã login sẵn

---

### Flow 2: Test Rate Limiting

#### 2.1. Gửi OTP Lần 1

```
Phone: 0901234567
Click: "Gửi mã OTP"
→ Success ✅
```

#### 2.2. Gửi Lại Ngay (trong vòng 60s)

```
Click: "Gửi mã OTP" again
→ Error: "Vui lòng chờ XX giây trước khi gửi lại OTP"
→ Button disabled with countdown
```

**Frontend hiển thị:**
```
[Chờ 45s để gửi lại]
```

**Wait 60 seconds → Button active again**

---

### Flow 3: Test Wrong OTP

#### 3.1. Nhập OTP Sai

```
Real OTP: 482910
Input: 000000
Click: "Hoàn tất đăng ký"
```

**Response:**
```
❌ Mã OTP không chính xác. Bạn còn 4 lần thử.
```

**Frontend:**
- Error message displayed
- OTP inputs cleared
- Auto-focus first input

#### 3.2. Nhập Sai 5 Lần

```
Try 1: 000000 → "Bạn còn 4 lần thử"
Try 2: 111111 → "Bạn còn 3 lần thử"
Try 3: 222222 → "Bạn còn 2 lần thử"
Try 4: 333333 → "Bạn còn 1 lần thử"
Try 5: 444444 → "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã OTP mới."
```

**Backend Action:**
- Redis OTP key deleted
- Must request new OTP

---

### Flow 4: Test OTP Expiration

#### 4.1. Wait 3 Minutes

```
Send OTP → Wait 3 minutes (180 seconds)
→ Timer shows: 00:00
→ "Mã OTP đã hết hạn"
→ Inputs disabled
```

#### 4.2. Try to Verify

```
Input OTP (after 3 minutes)
Click: "Hoàn tất đăng ký"
```

**Response:**
```
❌ Mã OTP đã hết hạn hoặc không tồn tại
```

**Solution:**
```
Click: "Gửi lại mã OTP"
→ New OTP sent
→ Timer reset to 03:00
```

---

### Flow 5: Test Resend OTP

#### 5.1. Wait 60 Seconds

```
Send OTP → Wait 60 seconds
→ "Gửi lại mã OTP" button active
```

#### 5.2. Click Resend

```
Click: "Gửi lại mã OTP"
```

**Backend Console:**
```
===========================================
📱 SMS OTP (Development Mode)
===========================================
Phone: +84901234567
OTP Code: 756321  ← New OTP!
===========================================
```

**Frontend:**
- Toast: "Mã OTP mới đã được gửi..."
- Timer reset: 03:00
- OTP inputs cleared
- Resend button disabled for 60s

---

## 🔍 Debug Tools

### Monitor Redis

```bash
# Open Redis CLI
redis-cli

# List all OTP keys
KEYS otp:*
# Output: 1) "otp:+84901234567"

# Get OTP value
GET otp:+84901234567
# Output: "482910"

# Check TTL (time remaining)
TTL otp:+84901234567
# Output: 156 (seconds left)

# Check rate limit
GET rate_limit:+84901234567
# Output: "true" (if exists)

TTL rate_limit:+84901234567
# Output: 45 (seconds left)

# Check retry count
GET retry:+84901234567
# Output: "3" (number of failed attempts)

# Real-time monitoring
MONITOR
# Shows all Redis commands in real-time
```

### Clear Test Data

```bash
# Redis CLI
redis-cli

# Delete specific user OTP
DEL otp:+84901234567
DEL rate_limit:+84901234567
DEL retry:+84901234567

# Or clear all test data
FLUSHDB
```

### Check MongoDB

```javascript
// MongoDB shell or Compass
db.users.find({ phone: "+84901234567" })

// Should show:
{
  _id: ObjectId("..."),
  fullname: "Nguyen Van A",
  email: "test@example.com",
  phone: "+84901234567",
  password: "$2a$10$...",
  status: "active",
  role: "user",
  isEmailVerified: false,
  address: {
    province: "Thành phố Hồ Chí Minh",
    ward: ""
  }
}
```

---

## 📊 Test Checklist

### ✅ Core Functionality

- [ ] **Send OTP**
  - [ ] Phone number validation
  - [ ] OTP generated (6 digits)
  - [ ] OTP saved to Redis (TTL 180s)
  - [ ] Rate limit key created (TTL 60s)
  - [ ] Console shows OTP (dev mode)
  - [ ] Redirect to verify page

- [ ] **Verify OTP**
  - [ ] OTP input (6 boxes)
  - [ ] Auto-focus next input
  - [ ] Paste support (Ctrl+V)
  - [ ] Form validation (fullname, password)
  - [ ] Correct OTP → Account created
  - [ ] Wrong OTP → Error + retry count
  - [ ] User created in MongoDB
  - [ ] JWT token set
  - [ ] Auto login + redirect home

### ✅ Security Features

- [ ] **Rate Limiting**
  - [ ] 1 OTP per 60 seconds
  - [ ] Cooldown timer displayed
  - [ ] Wait time shown in error

- [ ] **Brute Force Protection**
  - [ ] Max 5 wrong attempts
  - [ ] Retry counter works
  - [ ] OTP deleted after 5 fails

- [ ] **OTP Expiration**
  - [ ] 3 minutes (180 seconds)
  - [ ] Timer countdown works
  - [ ] Expired OTP rejected
  - [ ] Inputs disabled when expired

- [ ] **Replay Attack Prevention**
  - [ ] OTP deleted after success
  - [ ] Cannot reuse same OTP
  - [ ] Cannot verify after deletion

### ✅ UI/UX

- [ ] **Phone Input**
  - [ ] Auto-formatting (0901 234 567)
  - [ ] Only digits allowed
  - [ ] Max 10 digits
  - [ ] Validation on submit

- [ ] **OTP Input**
  - [ ] 6 separate boxes
  - [ ] Auto-focus next
  - [ ] Backspace to previous
  - [ ] Paste 6 digits works
  - [ ] Only numbers allowed
  - [ ] Visual feedback (focus state)

- [ ] **Timer**
  - [ ] Shows MM:SS format
  - [ ] Counts down smoothly
  - [ ] Red color when < 60s
  - [ ] Stops at 00:00

- [ ] **Resend Button**
  - [ ] Disabled initially
  - [ ] Enabled after 60s
  - [ ] Loading state when sending
  - [ ] Cooldown after resend

- [ ] **Form**
  - [ ] All inputs work
  - [ ] Validation messages clear
  - [ ] Password visibility toggle (if added)
  - [ ] Submit button states

### ✅ Error Handling

- [ ] Invalid phone format
- [ ] Phone already registered
- [ ] Rate limit exceeded
- [ ] OTP expired
- [ ] OTP incorrect
- [ ] Too many attempts
- [ ] Network errors
- [ ] Server errors

---

## 🐛 Common Test Issues

### Issue 1: Redis Not Running

**Symptom:**
```
⚠️ Running without Redis (OTP features will use fallback)
```

**Fix:**
```bash
redis-server
```

### Issue 2: OTP Not Showing

**Check:**
```bash
# Backend console should show:
📱 SMS OTP (Development Mode)
Phone: +84901234567
OTP Code: 482910
```

**If not showing:**
- Check backend is running
- Check request reaches backend (Network tab)
- Check phone number format

### Issue 3: Verify Always Fails

**Debug:**
```bash
# Redis CLI
redis-cli
GET otp:+84901234567
# Should return the OTP

# If NULL → OTP expired or not set
# Solution: Send new OTP
```

### Issue 4: Countdown Not Working

**Check:**
- useEffect hook dependencies
- timer cleanup on unmount
- setState updates

**Fix:** Refresh page or resend OTP

---

## 🎯 Quick Commands Summary

```bash
# Start Redis
redis-server

# Start Backend
cd backend && npm start

# Start Frontend
cd client && npm run dev

# Monitor Redis
redis-cli MONITOR

# Check OTP
redis-cli GET otp:+84901234567

# Clear test data
redis-cli FLUSHDB

# Check user in MongoDB
mongo
use donation_app
db.users.find({ phone: "+84901234567" })
```

---

## 📱 Test Phone Numbers

Use these for testing (Development mode):

```
0901234567
0912345678
0923456789
0934567890
0945678901
```

All will work in dev mode (no real SMS sent).

---

## ✅ Success Criteria

**Test passes when:**

1. ✅ Phone number validated correctly
2. ✅ OTP sent (console shows code)
3. ✅ Redirect to verify page
4. ✅ OTP input works (6 boxes, auto-focus, paste)
5. ✅ Timer counts down from 03:00
6. ✅ Wrong OTP shows retry count
7. ✅ Correct OTP creates account
8. ✅ JWT token set in cookie
9. ✅ User data in localStorage
10. ✅ Auto login successful
11. ✅ Redirect to homepage
12. ✅ Rate limiting works (60s cooldown)
13. ✅ Brute force protection (5 attempts max)
14. ✅ OTP expiration works (3 minutes)
15. ✅ Resend OTP works

---

## 🚀 Next: Production Testing

After local tests pass, test with real Twilio:

1. Add Twilio credentials to `.env`
2. Restart backend
3. Use real phone number (must be verified in Twilio)
4. Should receive actual SMS
5. Verify with SMS OTP

See `SMS_OTP_IMPLEMENTATION_GUIDE.md` for production setup.

---

## 📚 Related Files

- `SMS_OTP_IMPLEMENTATION_GUIDE.md` - Full documentation
- `LUONG_XAC_MINH_OTP_TWILIO.md` - Original design spec
- `backend/services/otpService.js` - OTP logic
- `backend/services/smsService.js` - Twilio integration
- `client/src/pages/RegisterSMSPage.jsx` - Phone input page
- `client/src/pages/VerifySMSOTPPage.jsx` - OTP verify page

---

**Happy Testing! 🎉**

Everything should work perfectly in development mode without any Twilio configuration needed.
