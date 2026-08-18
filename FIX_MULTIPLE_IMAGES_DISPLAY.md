# Fix: Nhiều ảnh không hiển thị sau khi gửi

## 🐛 Vấn đề
Khi gửi nhiều ảnh (2-5 ảnh), các ảnh được chọn và upload thành công, nhưng không hiển thị được trong MessageBubble sau khi gửi.

## 🔍 Nguyên nhân

### 1. **MessagePage.jsx** không xử lý `images` array
- `handleSendMessage()` chỉ xử lý `image` đơn lẻ
- Không truyền `images` array qua API

### 2. **Backend controllers** không select field `images`
- `messageController.js` chỉ select `image` (field cũ)
- `conversationController.js` populate lastMessage thiếu `images`
- Dẫn đến frontend không nhận được data

## ✅ Giải pháp

### 1. Cập nhật MessagePage.jsx

**File**: `client/src/pages/MessagePage.jsx`

```javascript
const handleSendMessage = async (payload) => {
  // ... existing code ...
  
  let images = null; // ✅ ADD: Variable for images array
  
  if (typeof payload === "object" && payload !== null) {
    trimmedContent = (payload.content || "").trim();
    type = payload.type || "text";
    image = payload.image || null;
    images = payload.images || null; // ✅ ADD: Extract images
  }
  
  // ✅ ADD: Log images
  console.log("images:", images);
  
  const response = await sendMessage({
    conversationId: selectedConversation._id,
    content: trimmedContent || (
      type === "image" 
        ? (images ? `[${images.length} Hình ảnh]` : "[Hình ảnh]") 
        : ""
    ),
    type,
    image,
    images, // ✅ ADD: Pass images to API
  });
  
  // ... rest of code ...
}
```

### 2. Cập nhật messageController.js

**File**: `backend/controllers/messageController.js`

```javascript
// In getMessages()
const [messages, totalMessages] = await Promise.all([
  Message.find({ conversation: conversationId })
    .select('sender content type image images readBy createdAt updatedAt') // ✅ ADD images
    .populate({ ... })
    // ...
]);

// In sendMessage() - populate response
const populatedMessage = await Message.findById(message._id)
  .select('sender content type image images readBy createdAt updatedAt') // ✅ ADD images
  .populate({ ... })
  .lean();
```

### 3. Cập nhật conversationController.js

**File**: `backend/controllers/conversationController.js`

```javascript
// In getConversations(), getConversation(), createConversation()
.populate({
  path: "lastMessage",
  select: 'sender content type image images createdAt', // ✅ ADD images
  populate: {
    path: "sender",
    select: "fullname avatar",
  },
})
```

## 🎯 Kết quả

### Trước fix:
```json
{
  "_id": "...",
  "type": "image",
  "content": "[3 Hình ảnh]",
  // ❌ images field missing!
}
```

### Sau fix:
```json
{
  "_id": "...",
  "type": "image",
  "image": "https://cloudinary.com/img1.jpg",
  "images": [
    "https://cloudinary.com/img1.jpg",
    "https://cloudinary.com/img2.jpg",
    "https://cloudinary.com/img3.jpg"
  ],
  "content": "[3 Hình ảnh]"
}
```

## 📋 Checklist

- [x] MessagePage.jsx xử lý images array
- [x] messageApi.js truyền images param
- [x] messageController.js select images field
- [x] conversationController.js select images trong lastMessage
- [x] MessageBubble.jsx đã sẵn sàng hiển thị (đã làm trước đó)

## 🧪 Test

1. ✅ Chọn 3 ảnh
2. ✅ Preview hiển thị 3 ảnh
3. ✅ Click Send
4. ✅ Upload thành công
5. ✅ **3 ảnh hiển thị trong MessageBubble dạng grid**
6. ✅ Socket realtime cũng nhận đủ data
7. ✅ Refresh page vẫn hiển thị đầy đủ

## 🔄 Data Flow

```
MessageInput (chọn ảnh)
    ↓
handleSendImages() - Upload parallel
    ↓
onSend({ images: [...] })
    ↓
handleSendMessage({ images })  ← ✅ FIX: Thêm images
    ↓
sendMessage API ({ images })   ← ✅ FIX: Truyền images
    ↓
Backend: Save with images[]
    ↓
Backend: Populate with images  ← ✅ FIX: Select images
    ↓
Frontend: Receive message.images
    ↓
MessageBubble: Render grid     ✅ Đã có sẵn
```

## 📝 Files Changed

- ✅ `client/src/pages/MessagePage.jsx`
- ✅ `backend/controllers/messageController.js`
- ✅ `backend/controllers/conversationController.js`

## 💡 Lưu ý

- Backward compatible: Tin nhắn cũ với `image` đơn vẫn hoạt động
- MessageBubble tự động detect `images` array hoặc `image` đơn
- Socket.IO broadcast đầy đủ data vì backend đã populate đúng
