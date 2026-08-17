# Hướng dẫn test tính năng Unread Messages Badge

## Tính năng
- Hiển thị số tin nhắn chưa đọc ở nút "Tin nhắn" trong header
- Badge màu đỏ với số tin nhắn chưa đọc
- Cập nhật realtime qua Socket.IO
- Tự động giảm khi đọc tin nhắn

## Cách test

### 1. Chuẩn bị
1. Chạy backend: `cd backend && npm run dev`
2. Chạy frontend: `cd client && npm run dev`
3. Mở 2 browser/tab khác nhau (hoặc 1 tab thường + 1 tab ẩn danh)
4. Đăng nhập 2 user khác nhau (User A và User B)

### 2. Test flow cơ bản
**User A gửi tin nhắn cho User B:**
1. User A: Mở trang Messages và chọn conversation với User B
2. User A: Gửi 1 tin nhắn
3. User B: **Không cần reload**, kiểm tra nút "Tin nhắn" ở header
4. ✅ **Expected**: Badge đỏ hiển thị số "1" ở nút Tin nhắn của User B

**User B đọc tin nhắn:**
1. User B: Click vào nút "Tin nhắn" để vào trang Messages
2. User B: Click vào conversation với User A
3. ✅ **Expected**: Badge biến mất (số tin nhắn chưa đọc = 0)

### 3. Test nhiều tin nhắn
**User A gửi nhiều tin nhắn:**
1. User A: Gửi 5 tin nhắn liên tiếp cho User B
2. User B: Kiểm tra header (không vào trang Messages)
3. ✅ **Expected**: Badge hiển thị số "5"

**User B đọc tin nhắn:**
1. User B: Vào trang Messages và click vào conversation
2. ✅ **Expected**: Badge giảm từ "5" xuống "0"

### 4. Test nhiều conversation
**User A và User C gửi tin nhắn cho User B:**
1. User A: Gửi 2 tin nhắn cho User B
2. User C: Gửi 3 tin nhắn cho User B
3. User B: Kiểm tra header
4. ✅ **Expected**: Badge hiển thị số "5" (tổng cộng)

**User B đọc conversation với User A:**
1. User B: Vào Messages, click conversation với User A
2. ✅ **Expected**: Badge giảm từ "5" xuống "3"

**User B đọc conversation với User C:**
1. User B: Click conversation với User C
2. ✅ **Expected**: Badge biến mất (số = 0)

### 5. Test edge cases

#### Test badge > 99
1. Tạo nhiều conversation và gửi nhiều tin nhắn (tổng > 99)
2. ✅ **Expected**: Badge hiển thị "99+"

#### Test reload trang
1. User B có 5 tin nhắn chưa đọc
2. User B reload trang
3. ✅ **Expected**: Badge vẫn hiển thị số "5" sau khi reload

#### Test đăng xuất / đăng nhập
1. User B có 5 tin nhắn chưa đọc
2. User B đăng xuất
3. ✅ **Expected**: Badge biến mất
4. User B đăng nhập lại
5. ✅ **Expected**: Badge hiển thị số "5"

#### Test socket disconnect/reconnect
1. Tắt internet
2. User A gửi tin nhắn
3. Bật lại internet
4. ✅ **Expected**: Badge cập nhật ngay khi reconnect

## Kiểm tra Console Logs

### Backend logs (khi User A gửi tin nhắn cho User B):
```
[MessageSocket] Emitting message:new to room conversation:xxx
[MessageSocket] Emitting message:new directly to receiver <User_B_ID>
[MessageSocket] emitToUser: userId=<User_B_ID>, event=message:new, sockets=1
[MessageSocket] Emitting message:new to socket <socket_id>
[MessageSocket] Emitting conversation:updated to receiver <User_B_ID>
```

### Frontend logs (User B - trong browser console):
```
[UnreadMessages] Received message:new event {sender: {...}, content: "..."}
[UnreadMessages] Sender ID: <User_A_ID> Current User ID: <User_B_ID>
[UnreadMessages] Message from another user, incrementing count
[UnreadMessages] Unread count updated: 0 -> 1
```

## Troubleshooting

### Badge không cập nhật realtime
1. Kiểm tra socket connection:
   - Browser console: `socket.connected` phải là `true`
   - Backend log: `[Socket] User connected: <userId>`

2. Kiểm tra authentication:
   - Backend log: `[SocketAuth] Socket authenticated for user: <userId>`
   - Nếu thấy `UNAUTHORIZED`: Kiểm tra cookie accessToken

3. Kiểm tra event listeners:
   - Frontend console: Xem log `[UnreadMessages] Setting up message listeners`
   - Backend: Xem log `[MessageSocket] Emitting message:new directly to receiver`

### Badge không giảm khi đọc tin nhắn
1. Kiểm tra API call:
   - Network tab: `PATCH /api/conversations/:id/read` phải thành công
   - Frontend console: Xem log `[UnreadMessages] Decreasing unread count`

2. Kiểm tra số tin nhắn chưa đọc:
   - API response: `unreadCount` phải giảm đúng

### Badge hiển thị sai số
1. Reload trang và kiểm tra API:
   - `GET /api/conversations` phải trả về đúng `unreadCount` cho mỗi conversation
2. Check database:
   - Message model: `readBy` array phải có userId của người đã đọc

## Các file đã thay đổi

### Frontend:
- `client/src/contexts/UnreadMessagesContext.jsx` - Context quản lý unread count
- `client/src/components/user/UserHeader.jsx` - Hiển thị badge
- `client/src/pages/MessagePage.jsx` - Giảm count khi đọc
- `client/src/main.jsx` - Wrap app với UnreadMessagesProvider
- `client/.env` - Thêm VITE_SOCKET_URL

### Backend:
- `backend/sockets/messageSocket.js` - Emit message:new trực tiếp cho receiver
- `backend/sockets/socketAuth.js` - Thêm logging
- `backend/sockets/index.js` - Thêm logging
- `backend/routes/conversationRoutes.js` - Thêm route sendMessage
- `backend/routes/messageRoutes.js` - Tạo file mới

## Notes
- Badge chỉ hiển thị khi có tin nhắn chưa đọc (> 0)
- Badge tự động ẩn khi số tin nhắn = 0
- Socket phải connected thì mới nhận được realtime update
- Nếu socket disconnect, badge sẽ cập nhật khi reconnect hoặc reload trang
