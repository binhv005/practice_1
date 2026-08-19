# 📱 SMS OTP Implementation Guide - Twilio + Redis

## ✅ Đã Hoàn Thành

Đã implement đầy đủ tính năng xác thực bằng SMS OTP theo thiết kế trong `LUONG_XAC_MINH_OTP_TWILIO.md`.

---

## 📋 Tổng Quan

### Luồng Hoạt Động

```
1. User nhập SĐT → Click "Gửi OTP"
   ↓
2. Backend kiểm tra:
   - Chuẩn hóa SĐT → E.164 format (+84...)
   - Check SĐT đã tồn tại chưa
   - Check Rate Limit (60s)
   ↓
3. Generate OTP 6 số → Lưu Redis (TTL 180s)
   ↓
4. Gửi SMS qua Twilio
   ↓
5. User nhập OTP → Click "Xác nhận"
   ↓
6. Backend verify OTP:
   - So sánh với Redis
   - Check số lần thử sai (max 5)
   - Check hết hạn chưa
   ↓
7. OTP đúng → Tạo tài khoản (status: active)
   ↓
8. Return JWT token → User đăng nhập ngay
```

---

## 🏗️ Architecture

### Backend Structure

```
backend/
├── config/
│   └── redis.js                 # Redis connection & client
├── services/
│   ├── smsService.js            # Twilio SMS integration
│   └── otpService.js            # OTP logic (send, verify, rate limit)
├── controllers/
│   └── authController.js        # sendSMSOTP(), verifySMSOTP()
├── routes/
│   └── authRoutes.js            # POST /send-sms-otp, /verify-sms-otp
└── server.js                    # Connect Redis + Init Twilio
```

---

## 🔧 Technical Implementation

### 1. **Redis Storage**

```javascript
// OTP Storage
Key: `otp:+84901234567`
Value: "482910"
TTL: 180 seconds (3 minutes)

// Rate Limit
Key: `rate_limit:+84901234567`
Value: "true"
TTL: 60 seconds (1 minute)

// Retry Counter
Key: `retry:+84901234567`
Value: "1", "2", "3"... (incremental)
TTL: 180 seconds
```

### 2. **Phone Number Normalization**

```javascript
// Input variations:
"0901234567"    → "+84901234567"
"84901234567"   → "+84901234567"
"+84901234567"  → "+84901234567"

// Regex validation:
/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
```

### 3. **Security Features**

#### Anti-Spam (Rate Limiting)
- **Rule:** 1 OTP per 60 seconds per phone number
- **Implementation:** Redis key `rate_limit:{phone}` with TTL 60s
- **Response:** Wait time remaining if blocked

#### Brute Force Protection
- **Rule:** Max 5 wrong attempts per OTP session
- **Implementation:** Redis counter `retry:{phone}`
- **Action:** Delete OTP after 5 failed attempts

#### Replay Attack Prevention
- **Rule:** OTP deleted immediately after successful verification
- **Implementation:** `redis.del(otp:{phone})` on success

#### OTP Expiration
- **Rule:** 3 minutes (180 seconds) validity
- **Implementation:** Redis TTL auto-expiration

---

## 📡 API Endpoints

### 1. Send SMS OTP

```http
POST /api/auth/send-sms-otp
Content-Type: application/json

{
  "phoneNumber": "0901234567"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mã OTP đã được gửi đến số điện thoại của bạn",
  "phoneNumber": "+84901234567",
  "expiresIn": 180
}
```

**Rate Limit Response (400):**
```json
{
  "success": false,
  "message": "Vui lòng chờ 45 giây trước khi gửi lại OTP",
  "waitTime": 45
}
```

**Errors:**
- `400`: Invalid phone format
- `409`: Phone already registered
- `500`: SMS send failed

---

### 2. Verify SMS OTP

```http
POST /api/auth/verify-sms-otp
Content-Type: application/json

{
  "phoneNumber": "0901234567",
  "otpCode": "482910",
  "fullname": "Nguyen Van A",
  "email": "optional@email.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "user": {
    "id": "677ab...",
    "fullname": "Nguyen Van A",
    "email": "optional@email.com",
    "phone": "+84901234567",
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

**OTP Wrong Response (400):**
```json
{
  "success": false,
  "message": "Mã OTP không chính xác. Bạn còn 3 lần thử.",
  "retriesLeft": 3
}
```

**OTP Expired Response (400):**
```json
{
  "success": false,
  "message": "Mã OTP đã hết hạn hoặc không tồn tại"
}
```

**Brute Force Block (400):**
```json
{
  "success": false,
  "message": "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã OTP mới."
}
```

**Errors:**
- `400`: Invalid input, OTP wrong/expired, too many attempts
- `409`: Phone/email already registered
- `500`: Server error

---

## 🔐 Environment Setup

### Required Environment Variables

```bash
# Redis
REDIS_URL=redis://localhost:6379

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Get Twilio Credentials

1. **Sign up:** https://www.twilio.com/try-twilio
2. **Get Free Trial:**
   - $15.50 credit
   - Can send to verified numbers only
   - Shows "Sent from your Twilio trial account" message

3. **Get Credentials:**
   - Go to Console: https://console.twilio.com
   - Copy `Account SID`
   - Copy `Auth Token`
   - Get a Twilio phone number

4. **Verify Test Numbers:**
   - Go to Phone Numbers → Verified Caller IDs
   - Add your test phone numbers
   - Verify via SMS

### Install Redis

#### Windows:
```bash
# Option 1: WSL (Recommended)
wsl --install
sudo apt update
sudo apt install redis-server
redis-server

# Option 2: Docker
docker run -d -p 6379:6379 redis:latest

# Option 3: Memurai (Windows native)
# Download from: https://www.memurai.com/
```

#### macOS:
```bash
brew install redis
redis-server
```

#### Linux:
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```

#### Test Redis:
```bash
redis-cli ping
# Should return: PONG
```

---

## 🧪 Testing Guide

### Step 1: Start Redis

```bash
# Terminal 1
redis-server

# Check connection
redis-cli ping
# → PONG
```

### Step 2: Configure .env

```bash
# backend/.env
REDIS_URL=redis://localhost:6379
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Start Backend

```bash
cd backend
npm start
```

**Expected logs:**
```
✅ MongoDB: Connected successfully
✅ Redis: Connected successfully
✅ Twilio client initialized
Server is running at http://localhost:3000
```

### Step 4: Test with Postman/cURL

#### A. Send OTP

```bash
curl -X POST http://localhost:3000/api/auth/send-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0901234567"}'
```

**Development Mode (No Twilio):**
```
===========================================
📱 SMS OTP (Development Mode)
===========================================
Phone: +84901234567
OTP Code: 482910
===========================================
```

**Production Mode (With Twilio):**
```
✅ SMS sent successfully to +84901234567
   Message SID: SMxxxxxxxxxxxxxxxxx
```

#### B. Verify OTP

```bash
curl -X POST http://localhost:3000/api/auth/verify-sms-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0901234567",
    "otpCode": "482910",
    "fullname": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Success:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "user": {...}
}
```

#### C. Test Rate Limit

```bash
# Gửi OTP lần 1
curl -X POST http://localhost:3000/api/auth/send-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0901234567"}'

# Gửi lại ngay (trong vòng 60s) → Should be blocked
curl -X POST http://localhost:3000/api/auth/send-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0901234567"}'
```

**Response:**
```json
{
  "success": false,
  "message": "Vui lòng chờ 45 giây trước khi gửi lại OTP",
  "waitTime": 45
}
```

#### D. Test Wrong OTP

```bash
# Try wrong OTP 5 times
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/verify-sms-otp \
    -H "Content-Type: application/json" \
    -d '{
      "phoneNumber": "0901234567",
      "otpCode": "000000",
      "fullname": "Test",
      "password": "test123"
    }'
done
```

**After 5 attempts:**
```json
{
  "success": false,
  "message": "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã OTP mới."
}
```

---

## 🎨 Frontend Integration (Coming Next)

### Future Frontend Components

```
client/src/pages/
├── RegisterSMSPage.jsx          # Đăng ký bằng SMS
└── VerifyOTPSMSPage.jsx         # Verify OTP SMS

Flow:
1. RegisterSMSPage
   - Input: Phone number
   - Button: "Gửi mã OTP"
   - API call: /send-sms-otp

2. Redirect to VerifyOTPSMSPage
   - 6 OTP input boxes
   - Countdown timer (3 minutes)
   - Resend button (after 60s)
   - Form: Fullname, Email (optional), Password
   - API call: /verify-sms-otp

3. Success → Auto login → Redirect home
```

---

## 📊 Redis Data Flow

### Send OTP Flow:

```
1. Check rate_limit:+84901234567
   ├─ Exists? → Return waitTime
   └─ Not exists? → Continue

2. Generate OTP: "482910"

3. Redis SET operations:
   ├─ SETEX otp:+84901234567 180 "482910"
   └─ SETEX rate_limit:+84901234567 60 "true"

4. Send SMS via Twilio

5. Return success
```

### Verify OTP Flow:

```
1. GET otp:+84901234567
   ├─ NULL? → OTP expired/not exists
   └─ Exists? → Continue

2. GET retry:+84901234567
   ├─ >= 5? → Block & delete OTP
   └─ < 5? → Continue

3. Compare OTP
   ├─ Wrong? → INCR retry:+84901234567
   └─ Correct? → Continue

4. Delete keys:
   ├─ DEL otp:+84901234567
   ├─ DEL retry:+84901234567
   └─ DEL rate_limit:+84901234567

5. Create user in MongoDB

6. Return JWT token
```

---

## 🔍 Debugging

### Check Redis Keys

```bash
# Connect to Redis CLI
redis-cli

# List all OTP keys
KEYS otp:*

# Get specific OTP
GET otp:+84901234567

# Check TTL (time remaining)
TTL otp:+84901234567

# Check rate limit
GET rate_limit:+84901234567
TTL rate_limit:+84901234567

# Check retry count
GET retry:+84901234567

# Delete all test data
FLUSHDB
```

### Monitor Redis Activity

```bash
# Real-time monitoring
redis-cli MONITOR

# Then in another terminal, trigger SMS OTP
# You'll see all Redis commands in real-time
```

### Backend Logs

```javascript
// Already implemented in code
console.log("✅ OTP sent to +84901234567");
console.log("✅ OTP verified successfully for +84901234567");
console.log("❌ Twilio SMS Error:", error.message);
console.log("⚠️ Running without Redis (OTP features will use fallback)");
```

---

## 💰 Cost Estimation (Twilio)

### Twilio Pricing

- **SMS Vietnam:** ~$0.05 per message
- **Free Trial:** $15.50 credit (~ 310 SMS)

### Cost Optimization

1. **Rate Limiting:** 1 OTP per 60s → Prevent spam
2. **OTP Expiry:** 3 minutes → Force timely verification
3. **Brute Force Protection:** Delete OTP after 5 fails
4. **Development Mode:** No Twilio calls when credentials missing

### Monthly Estimate

```
Assumptions:
- 1,000 new users/month
- 1.5 OTP per user (resends)
- Total: 1,500 SMS/month

Cost: 1,500 × $0.05 = $75/month
```

---

## 🚀 Production Checklist

- [ ] Redis production URL configured
- [ ] Twilio production account (not trial)
- [ ] Twilio phone number purchased
- [ ] `.env` not committed to Git
- [ ] Rate limiting tested
- [ ] Brute force protection tested
- [ ] OTP expiration tested
- [ ] Error handling tested
- [ ] Redis connection retry tested
- [ ] Fallback mode tested (no Redis)
- [ ] SMS delivery confirmed
- [ ] Logging properly configured
- [ ] Monitoring setup (Redis + Twilio)

---

## 🐛 Common Issues & Solutions

### Issue 1: Redis Connection Failed

**Error:**
```
❌ Redis Client Error: connect ECONNREFUSED
```

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# If not running, start it:
redis-server

# Or use Docker:
docker run -d -p 6379:6379 redis:latest
```

---

### Issue 2: Twilio Authentication Failed

**Error:**
```
❌ Twilio SMS Error: Authentication Error - invalid AccountSid or Auth Token
```

**Solution:**
- Check `TWILIO_ACCOUNT_SID` in .env (starts with `AC`)
- Check `TWILIO_AUTH_TOKEN` in .env
- Regenerate Auth Token from Twilio Console if needed

---

### Issue 3: SMS Not Received

**Possible Causes:**

1. **Trial Account Restrictions:**
   - Only sends to verified numbers
   - Add number at: https://console.twilio.com/phone-numbers/verified

2. **Wrong Phone Format:**
   - Must be E.164: `+84901234567`
   - Backend normalizes automatically

3. **Twilio Number Not Active:**
   - Check phone number status in Console
   - Verify it's capable of sending SMS

---

### Issue 4: OTP Already Expired

**Error:**
```json
{
  "success": false,
  "message": "Mã OTP đã hết hạn hoặc không tồn tại"
}
```

**Solution:**
- OTP valid for 3 minutes only
- Request new OTP
- Check Redis TTL: `redis-cli TTL otp:+84901234567`

---

### Issue 5: Development Mode (No SMS Sent)

**Behavior:**
```
⚠️ Twilio credentials not configured. SMS features disabled.
📱 SMS OTP (Development Mode)
Phone: +84901234567
OTP Code: 482910
```

**This is normal!** 
- When `TWILIO_ACCOUNT_SID` is missing, app uses dev mode
- OTP printed to console instead of sending SMS
- Good for testing without Twilio costs

**To enable real SMS:**
- Add Twilio credentials to `.env`
- Restart server

---

## 📚 Resources

### Twilio Documentation
- **Getting Started:** https://www.twilio.com/docs/sms/quickstart
- **SMS API:** https://www.twilio.com/docs/sms/api
- **Error Codes:** https://www.twilio.com/docs/api/errors

### Redis Documentation
- **Commands:** https://redis.io/commands
- **Node.js Client:** https://github.com/redis/node-redis
- **Best Practices:** https://redis.io/topics/best-practices

### Related Documents
- `LUONG_XAC_MINH_OTP_TWILIO.md` - Original design spec
- `OTP_UI_GUIDE.md` - Email OTP UI (reference for SMS UI)
- `POSTMAN_OTP_TESTING.md` - Testing guide

---

## 🎯 Next Steps

### Immediate:
1. ✅ Install Redis locally
2. ✅ Get Twilio trial account
3. ✅ Configure `.env` credentials
4. ✅ Test send OTP endpoint
5. ✅ Test verify OTP endpoint

### Short-term:
- [ ] Create frontend SMS registration page
- [ ] Create frontend SMS OTP verification page
- [ ] Add SMS OTP to existing RegisterPage as option
- [ ] Implement "Login with SMS OTP" (one-time password login)

### Long-term:
- [ ] Upgrade Twilio to production account
- [ ] Setup Redis Cloud (production)
- [ ] Add SMS notification for important events
- [ ] Implement 2FA with SMS OTP
- [ ] Add SMS marketing features (optional)

---

## ✅ Summary

**Đã implement thành công:**
- ✅ Redis integration với fallback to in-memory
- ✅ Twilio SMS service với development mode
- ✅ OTP service với full security (rate limit, brute force, replay attack)
- ✅ Phone normalization (E.164 format)
- ✅ API endpoints: `/send-sms-otp`, `/verify-sms-otp`
- ✅ Complete error handling
- ✅ Comprehensive logging
- ✅ Graceful shutdown

**Production-ready features:**
- ✅ Rate limiting (60s cooldown)
- ✅ Brute force protection (5 attempts max)
- ✅ OTP expiration (3 minutes)
- ✅ Replay attack prevention
- ✅ Phone normalization
- ✅ Development mode (no Twilio needed)

**Ready to use!** 🚀

Test locally, then deploy to production with real Redis + Twilio credentials.
