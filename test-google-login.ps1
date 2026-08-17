# Test Google Login Script
# Chạy script này để test Google login với debug logs

Write-Host "🚀 Starting Google Login Test..." -ForegroundColor Green
Write-Host ""

# Check if backend is running
Write-Host "📍 Checking backend..." -ForegroundColor Yellow
$backendRunning = Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*backend*"}

if (-not $backendRunning) {
    Write-Host "❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Start it with: cd backend && npm run dev" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host ""
}

# Check if frontend is running
Write-Host "📍 Checking frontend..." -ForegroundColor Yellow
$frontendRunning = Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*client*"}

if (-not $frontendRunning) {
    Write-Host "❌ Frontend is NOT running!" -ForegroundColor Red
    Write-Host "   Start it with: cd client && npm run dev" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✅ Frontend is running" -ForegroundColor Green
    Write-Host ""
}

# Instructions
Write-Host "📝 Test Instructions:" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:5173/login" -ForegroundColor White
Write-Host "   2. Click 'Sign in with Google'" -ForegroundColor White
Write-Host "   3. Choose your Google account" -ForegroundColor White
Write-Host "   4. Watch BACKEND terminal for logs:" -ForegroundColor White
Write-Host "      🔵 Google login request received" -ForegroundColor Gray
Write-Host "      ✅ Token verified" -ForegroundColor Gray
Write-Host "      📸 Avatar URL" -ForegroundColor Gray
Write-Host "   5. Watch BROWSER console (F12) for logs:" -ForegroundColor White
Write-Host "      🔵 Google credential received" -ForegroundColor Gray
Write-Host "      📡 Calling backend API" -ForegroundColor Gray
Write-Host "      📸 Avatar URL" -ForegroundColor Gray
Write-Host "      💾 Saved to localStorage" -ForegroundColor Gray
Write-Host ""

# Check localStorage
Write-Host "📦 Check localStorage after login:" -ForegroundColor Cyan
Write-Host '   const user = JSON.parse(localStorage.getItem("user"));' -ForegroundColor White
Write-Host '   console.log("Avatar:", user.avatar);' -ForegroundColor White
Write-Host ""

# Test avatar URL
Write-Host "🖼️  Test avatar loads:" -ForegroundColor Cyan
Write-Host '   const img = new Image();' -ForegroundColor White
Write-Host '   img.src = user.avatar;' -ForegroundColor White
Write-Host '   img.onload = () => console.log("✅ Avatar loads!");' -ForegroundColor White
Write-Host '   img.onerror = () => console.log("❌ Avatar failed!");' -ForegroundColor White
Write-Host ""

Write-Host "🎯 Expected Result:" -ForegroundColor Green
Write-Host "   - Backend logs show avatar URL" -ForegroundColor White
Write-Host "   - Browser console shows avatar URL" -ForegroundColor White
Write-Host "   - localStorage has user.avatar" -ForegroundColor White
Write-Host "   - Header displays Google profile picture" -ForegroundColor White
Write-Host ""

Write-Host "🐛 If avatar doesn't show, share with me:" -ForegroundColor Yellow
Write-Host "   1. Backend terminal logs" -ForegroundColor White
Write-Host "   2. Browser console logs" -ForegroundColor White
Write-Host "   3. Network tab response of /google-login" -ForegroundColor White
Write-Host "   4. localStorage content" -ForegroundColor White
Write-Host ""

Write-Host "💡 Read DEBUG_GOOGLE_AVATAR.md for detailed guide!" -ForegroundColor Magenta
