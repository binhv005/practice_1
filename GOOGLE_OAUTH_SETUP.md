# 🔑 Google OAuth Setup - Quick Guide

## 📋 Checklist

- [ ] Tạo Google Cloud Project
- [ ] Enable Google+ API
- [ ] Tạo OAuth Client ID
- [ ] Configure Authorized Origins & Redirect URIs
- [ ] Copy Client ID
- [ ] Add to Backend `.env`
- [ ] Add to Frontend `.env`
- [ ] Test locally
- [ ] Deploy và update production domains

## 🚀 Quick Setup (5 phút)

### Bước 1: Google Cloud Console

1. Truy cập: https://console.cloud.google.com/
2. **Create Project** hoặc chọn existing project
3. Navigate: **APIs & Services** → **Library**
4. Search: **Google+ API** → Click **Enable**

### Bước 2: Create OAuth Credentials

1. Navigate: **APIs & Services** → **Credentials**
2. Click: **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Click: **CONFIGURE CONSENT SCREEN** (nếu chưa có)
   - User Type: **External**
   - App name: `Your App Name`
   - User support email: Your email
   - Developer contact: Your email
   - Click **SAVE AND CONTINUE** → Skip scopes → **SAVE AND CONTINUE**
4. Back to **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: `Web Client` (hoặc tên bất kỳ)

### Bước 3: Configure Origins

**Authorized JavaScript origins:**
```
http://localhost:5173
https://your-production-domain.com
https://your-production-domain.vercel.app
```

**Authorized redirect URIs:**
```
http://localhost:5173
https://your-production-domain.com
https://your-production-domain.vercel.app
```

⚠️ **Lưu ý:** Không có trailing slash `/`

### Bước 4: Copy Client ID

Click **CREATE** → Copy **Client ID**

Format: `123456789-abc123def456.apps.googleusercontent.com`

### Bước 5: Configure Backend

File: `backend/.env`

```env
# Existing vars...

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

### Bước 6: Configure Frontend

File: `client/.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

File: `client/.env.production`

```env
VITE_API_URL=https://your-backend-api.com/api
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

### Bước 7: Restart Servers

```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd client
npm run dev
```

### Bước 8: Test

1. Open: http://localhost:5173/register
2. Click: **"Đăng ký với Google"**
3. Select Google account
4. ✅ Should redirect to home page

## 🔍 Verify Setup

### Check Environment Variables

**Backend:**
```bash
cd backend
node -e "require('dotenv').config(); console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing')"
```

**Frontend:**
```bash
cd client
echo $VITE_GOOGLE_CLIENT_ID
# Should print your Client ID
```

### Check Console Logs

**Browser Console:**
- Should see: `🔵 Google credential received`
- Should see: `📡 Calling backend API /google-login...`
- Should see: `✅ Google sign up response: {...}`

**Backend Logs:**
- Should see: `🔵 Google login request received`
- Should see: `✅ Credential received: ...`
- Should see: `✅ Token verified. User info: ...`

## 🐛 Common Issues

### Issue 1: Button không hiện

**Triệu chứng:** Không thấy button "Đăng ký với Google"

**Nguyên nhân:**
- `VITE_GOOGLE_CLIENT_ID` chưa set hoặc sai
- Package `@react-oauth/google` chưa install

**Fix:**
```bash
cd client
npm install @react-oauth/google
echo $VITE_GOOGLE_CLIENT_ID  # Verify
npm run dev  # Restart
```

### Issue 2: "idpiframe_initialization_failed"

**Triệu chứng:** Error trong console khi load page

**Nguyên nhân:** Browser block third-party cookies

**Fix:**
1. Chrome: Settings → Privacy → Cookies → Allow all cookies
2. Or use Incognito mode
3. Or add exception for `accounts.google.com`

### Issue 3: "Credential không hợp lệ"

**Triệu chứng:** Error sau khi chọn Google account

**Nguyên nhân:**
- Client ID sai
- Origins không match

**Fix:**
1. Verify Client ID trong `.env` files
2. Check Google Cloud Console → Credentials:
   - Authorized JavaScript origins must include `http://localhost:5173`
   - Case-sensitive, no trailing slash
3. Clear browser cache
4. Restart dev server

### Issue 4: Backend error "Invalid token"

**Triệu chứng:** 500 error sau khi gửi credential

**Nguyên nhân:**
- Backend `GOOGLE_CLIENT_ID` sai hoặc chưa set
- Token expired
- Google API issue

**Fix:**
```bash
cd backend
cat .env | grep GOOGLE_CLIENT_ID  # Verify
npm run dev  # Restart
```

### Issue 5: "Origin mismatch"

**Triệu chứng:** Error: "redirect_uri_mismatch" hoặc origin not allowed

**Nguyên nhân:** Domain không có trong authorized origins

**Fix:**
1. Go to Google Cloud Console
2. Edit OAuth Client
3. Add origin: `http://localhost:5173` (exact match)
4. Save
5. Wait 5 minutes for propagation
6. Try again

## 📊 Testing Checklist

### Local Testing

- [ ] Start backend: `npm run dev`
- [ ] Start frontend: `npm run dev`
- [ ] Open: http://localhost:5173/register
- [ ] Click "Đăng ký với Google"
- [ ] Google popup appears
- [ ] Select account
- [ ] Redirect to home page
- [ ] User logged in (check header)
- [ ] Check backend logs - no errors
- [ ] Check browser console - no errors

### Production Testing

- [ ] Deploy backend with `GOOGLE_CLIENT_ID` env var
- [ ] Deploy frontend with `VITE_GOOGLE_CLIENT_ID` env var
- [ ] Add production domain to Google Cloud Console origins
- [ ] Wait 5-10 minutes for DNS propagation
- [ ] Test on production URL
- [ ] Verify in incognito mode
- [ ] Test on mobile device

## 🔐 Security Checklist

### Google Cloud Console

- [ ] OAuth Consent Screen configured
- [ ] App name meaningful
- [ ] Support email set
- [ ] Only necessary scopes requested
- [ ] Authorized origins restricted (not `*`)
- [ ] Client ID kept confidential (not in public repos)

### Backend

- [ ] `GOOGLE_CLIENT_ID` in `.env` (not hardcoded)
- [ ] `.env` in `.gitignore`
- [ ] Token verification implemented
- [ ] Email verified check implemented
- [ ] Account status check implemented

### Frontend

- [ ] `VITE_GOOGLE_CLIENT_ID` in `.env.local` (not committed)
- [ ] `.env.local` in `.gitignore`
- [ ] Production env vars set in hosting platform
- [ ] No sensitive data in frontend code

## 📦 Required Packages

### Backend

```json
{
  "dependencies": {
    "google-auth-library": "^9.0.0"
  }
}
```

Already installed! ✅

### Frontend

```json
{
  "dependencies": {
    "@react-oauth/google": "^0.11.0"
  }
}
```

Install if missing:
```bash
cd client
npm install @react-oauth/google
```

## 🌐 Production Deployment

### Vercel (Frontend)

1. Go to project settings
2. Environment Variables
3. Add: `VITE_GOOGLE_CLIENT_ID` = `your-client-id`
4. Redeploy

### Render/Railway/Heroku (Backend)

1. Go to project settings
2. Environment Variables
3. Add: `GOOGLE_CLIENT_ID` = `your-client-id`
4. Redeploy

### Update Google Console

1. Go to Google Cloud Console → Credentials
2. Edit OAuth Client ID
3. Add production origins:
   ```
   https://your-app.vercel.app
   https://your-api.render.com
   ```
4. Save
5. Wait 5-10 minutes

### Test Production

1. Open production URL
2. Navigate to /register
3. Click Google button
4. Should work!

## 📚 Reference

- **Google OAuth Guide:** https://developers.google.com/identity/protocols/oauth2
- **React OAuth Google:** https://www.npmjs.com/package/@react-oauth/google
- **Google Cloud Console:** https://console.cloud.google.com/

## ✅ Success Criteria

When everything is working:

1. ✅ Google button visible on /register and /login
2. ✅ Click button → Google popup appears
3. ✅ Select account → popup closes
4. ✅ User logged in → redirect to home
5. ✅ User info in header (name, avatar)
6. ✅ No errors in browser console
7. ✅ No errors in backend logs
8. ✅ Works in incognito mode
9. ✅ Works on mobile
10. ✅ Works in production

---

**Need Help?**

1. Check console logs (browser & backend)
2. Verify environment variables
3. Check Google Cloud Console settings
4. Try incognito mode
5. Clear cache and restart servers

**Still stuck?** Review `GOOGLE_SIGNUP_GUIDE.md` for detailed troubleshooting.
