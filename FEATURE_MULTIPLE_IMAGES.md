# Chức năng Gửi Nhiều Ảnh trong Tin Nhắn

## 📋 Tổng quan

Hệ thống hỗ trợ gửi từ 1-5 ảnh trong một tin nhắn với:
- Upload song song để tăng tốc độ
- Preview trước khi gửi
- Hiển thị grid layout thông minh
- Hỗ trợ caption cho ảnh
- Lưu trữ trên Cloudinary

## 🏗️ Kiến trúc

### Backend

#### 1. Message Model (`backend/models/Message.js`)
```javascript
{
  type: { type: String, enum: ["text", "image", "system"] },
  image: String,           // Legacy: single image
  images: [String],        // New: multiple images (max 5)
  content: String,         // Text content or caption
  // ... other fields
}
```

**Validation:**
- Tối đa 5 ảnh mỗi tin nhắn
- Mỗi ảnh tối đa 10MB
- Hỗ trợ: JPG, PNG, WebP, GIF

#### 2. Message Controller (`backend/controllers/messageController.js`)

**REST API:**
```javascript
POST /api/conversations/:conversationId/messages
{
  type: "image",
  images: ["url1", "url2", "url3"],
  content: "Caption (optional)"
}
```

**Socket.IO:**
```javascript
socket.emit("message:send", {
  conversationId: "xxx",
  type: "image",
  images: ["url1", "url2"],
  content: "Caption"
})
```

**Response:**
```javascript
{
  success: true,
  message: {
    _id: "...",
    type: "image",
    images: ["url1", "url2"],
    content: "Caption",
    sender: { ... },
    createdAt: "...",
    // ...
  }
}
```

#### 3. Socket Events (`backend/sockets/messageSocket.js`)

**Validation Logic:**
- Kiểm tra `images` array không vượt quá 5 ảnh
- Cho phép content rỗng nếu có ảnh
- Tự động tạo content: `[${images.length} Hình ảnh]` nếu không có caption

**Realtime Flow:**
1. Client gửi message qua socket
2. Server validate và lưu vào database
3. Server emit `message:new` tới conversation room
4. Server emit trực tiếp cho receiver (nếu chưa join room)
5. Server emit `conversation:updated` để cập nhật sidebar

### Frontend

#### 1. MessageInput Component (`client/src/components/message/MessageInput.jsx`)

**Features:**
- ✅ Chọn nhiều ảnh cùng lúc (input multiple)
- ✅ Preview grid với thumbnail 20x20
- ✅ Xóa từng ảnh riêng lẻ
- ✅ Counter hiển thị x/5
- ✅ Validation size và type
- ✅ Upload song song với Promise.all
- ✅ Disable button khi đang upload
- ✅ Error handling với timeout

**Upload Flow:**
```
1. User chọn ảnh → handleFileChange()
2. Validate (type, size, count) → setSelectedImages()
3. User nhấn Send → handleSendImages()
4. Upload all images parallel → uploadProductImage()
5. Extract imageUrls from responses
6. Call onSend({ type: "image", images: [...], content: "..." })
7. Clear state và reset UI
```

**Error Messages:**
- "Tối đa 5 ảnh mỗi tin nhắn"
- "Chỉ có thể thêm X ảnh nữa"
- "Vui lòng chỉ chọn file hình ảnh"
- "Kích thước mỗi ảnh không được vượt quá 10MB"
- "Không thể gửi ảnh. Vui lòng thử lại!"

#### 2. MessageBubble Component (`client/src/components/message/MessageBubble.jsx`)

**Grid Layouts:**
- **1 ảnh**: Full width, max-height 256px, grid-cols-1
- **2 ảnh**: 2 cột bằng nhau, grid-cols-2
- **3 ảnh**: Ảnh đầu span 2 rows bên trái, 2 ảnh còn lại xếp dọc bên phải
- **4 ảnh**: Grid 2x2, grid-cols-2
- **5 ảnh**: Grid 3 cột (2-2-1), grid-cols-3

**Features:**
- ✅ Responsive grid với gap-1
- ✅ Click ảnh mở tab mới (target="_blank")
- ✅ Caption hiển thị ở footer (nếu có)
- ✅ Lazy loading với loading="lazy"
- ✅ Border màu khác nhau cho tin nhắn của mình vs người khác
- ✅ Fallback cho legacy single image field

**Caption Logic:**
- Hiển thị nếu content không bắt đầu bằng `[` (placeholder)
- Hiển thị nếu content không phải URL
- Style: bg-gray-50, border-top, padding

#### 3. MessageList Component (`client/src/components/message/MessageList.jsx`)

- Render danh sách MessageBubble
- Auto scroll to bottom khi có message mới
- Pass currentUserId để xác định message của mình

#### 4. MessagePage Component (`client/src/pages/MessagePage.jsx`)

**Integration:**
```javascript
const handleSendMessage = async (payload) => {
  // Handle string (text only)
  if (typeof payload === "string") {
    trimmedContent = payload.trim();
  }
  
  // Handle object (with images)
  else if (typeof payload === "object") {
    trimmedContent = payload.content || "";
    type = payload.type || "text";
    images = payload.images || null;
  }
  
  // Send via API
  await sendMessage({
    conversationId,
    content: trimmedContent || `[${images.length} Hình ảnh]`,
    type,
    images
  });
}
```

**Realtime Updates:**
- Lắng nghe `message:new` từ socket
- Tự động add message mới vào danh sách
- Cập nhật lastMessage trong sidebar
- Mark as read nếu đang xem conversation đó

## 🔄 Luồng hoạt động End-to-End

### Scenario: User A gửi 3 ảnh cho User B

```
1. [Frontend A] User A chọn 3 ảnh
   → MessageInput.handleFileChange()
   → setSelectedImages([img1, img2, img3])
   → Hiển thị preview grid

2. [Frontend A] User A nhấn Send
   → MessageInput.handleSendImages()
   → Upload 3 ảnh song song lên Cloudinary
   → Nhận [url1, url2, url3]

3. [Frontend A] Call API/Socket
   → onSend({ type: "image", images: [url1, url2, url3], content: "" })
   → MessagePage.handleSendMessage()
   → messageApi.sendMessage() hoặc socket.emit("message:send")

4. [Backend] Xử lý message
   → Validate: type, images array, content
   → Kiểm tra blockedUsers
   → Lưu Message vào MongoDB với images: [url1, url2, url3]
   → Update Conversation.lastMessage

5. [Backend] Emit realtime
   → io.to(room).emit("message:new", message)
   → emitToUser(userB, "message:new", message)
   → emitToUser(userB, "conversation:updated", {...})

6. [Frontend A] Nhận response
   → Add message vào state locally
   → Update sidebar
   → Clear selectedImages

7. [Frontend B] Nhận realtime
   → Socket listener handleNewMessage()
   → Add message vào state
   → Update sidebar với unread count
   → MessageBubble render 3 ảnh với grid layout
```

## 🎨 UI/UX Details

### MessageInput Preview Area

```
┌─────────────────────────────────────┐
│  🖼️   🖼️   🖼️   🖼️   📊 2/5      │
│ [img] [img] [img] [img] [counter]  │
│  (X)  (X)  (X)  (X)   (optional)   │
└─────────────────────────────────────┘
```

- Thumbnail: 80x80px, rounded-lg, border-2
- Remove button (X): Hiện khi hover, bg-red-500
- Counter: border-dashed, text-gray-400

### MessageBubble Grid Examples

**3 ảnh layout:**
```
┌─────────┬─────┐
│         │  2  │
│    1    ├─────┤
│         │  3  │
└─────────┴─────┘
```

**5 ảnh layout:**
```
┌────┬────┬────┐
│ 1  │ 2  │ 3  │
├────┴────┼────┤
│    4    │ 5  │
└─────────┴────┘
```

## 🔒 Security & Validation

### Backend Validation
- ✅ Max 5 images per message
- ✅ Check conversation authorization
- ✅ Check blocked users
- ✅ Check receiver status (not banned)
- ✅ Validate MongoDB ObjectId

### Frontend Validation
- ✅ File type: image/* only
- ✅ File size: max 10MB per image
- ✅ Total count: max 5 images
- ✅ Prevent multiple simultaneous uploads
- ✅ Graceful error handling

### Upload Security
- ✅ Cloudinary signed upload
- ✅ Auto format optimization
- ✅ Quality control
- ✅ File type restriction

## 🐛 Debugging

### Console Logs

**Frontend (MessageInput):**
```
🚀 handleSendImages START - NEW CODE VERSION 2.0
Selected images count: 3
Upload response: { data: { data: { imageUrl: "..." } } }
Extracted imageUrl: https://...
All upload results: ["url1", "url2", "url3"]
Valid image URLs to send: ["url1", "url2", "url3"]
```

**Frontend (MessageBubble):**
```
🖼️ Image Message Debug: {
  type: "image",
  hasImagesField: true,
  imagesArray: ["url1", "url2"],
  imagesLength: 2
}
🔍 Image Check: { hasMultipleImages: true, ... }
🎨 Render URLs: { imageUrls: ["url1", "url2"], willRenderImages: true }
```

**Backend (messageSocket):**
```
📨 Socket message:send received: {
  conversationId: "...",
  type: "image",
  images: ["url1", "url2"],
  imagesLength: 2
}
💾 Message created in DB: {
  _id: "...",
  type: "image",
  images: ["url1", "url2"]
}
[MessageSocket] Emitting message:new to room conversation:xxx
```

### Common Issues

**Issue 1: Ảnh không hiển thị**
- Check: `message.images` array có đúng không?
- Check: Console log trong MessageBubble
- Check: Network tab xem URL ảnh có load được không

**Issue 2: Upload lỗi "Invalid upload response structure"**
- Check: `imageApi.js` có return full response không?
- Check: Backend upload endpoint trả về đúng structure `{ data: { imageUrl: "..." } }`

**Issue 3: Message không realtime**
- Check: Socket connected (`socket.connected`)
- Check: User đã join room chưa (`conversation:join`)
- Check: Backend có emit `message:new` không

## 📝 API Reference

### REST API

#### Send Message with Images
```http
POST /api/conversations/:conversationId/messages
Content-Type: application/json
Cookie: token=...

{
  "type": "image",
  "images": ["url1", "url2", "url3"],
  "content": "Check out these photos!"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0",
    "conversation": "...",
    "sender": {
      "_id": "...",
      "fullname": "User A",
      "avatar": "..."
    },
    "type": "image",
    "images": ["url1", "url2", "url3"],
    "content": "Check out these photos!",
    "readBy": ["..."],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Upload Image
```http
POST /api/products/upload-image
Content-Type: multipart/form-data

image: [binary file]
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://res.cloudinary.com/..."
  }
}
```

### Socket.IO Events

#### Emit: message:send
```javascript
socket.emit("message:send", {
  conversationId: "67a...",
  type: "image",
  images: ["url1", "url2"],
  content: "Caption text"
}, (response) => {
  console.log(response.success);
  console.log(response.message);
});
```

#### Listen: message:new
```javascript
socket.on("message:new", (message) => {
  console.log("New message:", message);
  // message.type === "image"
  // message.images = ["url1", "url2"]
});
```

#### Listen: conversation:updated
```javascript
socket.on("conversation:updated", (data) => {
  console.log("Conversation updated:", data);
  // data.lastMessage
  // data.unreadCountIncrement
});
```

## 🚀 Future Enhancements

### Planned Features
- [ ] Image compression trước khi upload
- [ ] Progress bar cho từng ảnh
- [ ] Drag & drop để sắp xếp thứ tự
- [ ] Image gallery viewer với zoom/swipe
- [ ] Video support
- [ ] GIF animation support
- [ ] Copy/paste ảnh từ clipboard
- [ ] Image editing (crop, rotate, filter)

### Performance Optimizations
- [ ] WebP format tự động
- [ ] Responsive images với srcset
- [ ] CDN caching
- [ ] Lazy load ảnh khi scroll
- [ ] Thumbnail generation
- [ ] Progressive image loading

## 📚 References

- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [Socket.IO Emit Cheatsheet](https://socket.io/docs/v4/emit-cheatsheet/)
- [MongoDB Array Validation](https://www.mongodb.com/docs/manual/core/document-validation/)
- [React File Upload Best Practices](https://react.dev/reference/react-dom/components/input#reading-the-selected-files)

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Maintainer:** Development Team
