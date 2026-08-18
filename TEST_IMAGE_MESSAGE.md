# 🔧 Fix: Vấn đề không hiển thị hình ảnh khi gửi message (304 Not Modified)

## 📋 Vấn đề

Khi gửi hình ảnh trong message, các ảnh không được hiển thị. Lỗi 304 Not Modified xuất hiện khi reload page vì:

1. **Backend không lưu các field `type`, `image`, `images`** vào database
2. **API `getMessages` trả về thiếu dữ liệu ảnh**
3. **Browser cache response cũ** (304 Not Modified) nên vẫn thiếu images

## ✅ Các thay đổi đã thực hiện

### 1. **Backend Socket (messageSocket.js)**

#### Trước:
```javascript
socket.on("message:send", async (payload, callback) => {
  const conversationId = payload?.conversationId;
  const content = payload?.content;
  // Chỉ xử lý content, không xử lý type, image, images
  
  const message = await Message.create({
    conversation: conversationId,
    sender: currentUserId,
    content: trimmedContent,
    readBy: [currentUserId],
  });
});
```

#### Sau:
```javascript
socket.on("message:send", async (payload, callback) => {
  const conversationId = payload?.conversationId;
  const content = payload?.content;
  const type = payload?.type || "text";
  const image = payload?.image || null;
  const images = payload?.images || [];
  
  // Validate images array
  if (images.length > 5) {
    // Return error
  }
  
  // Allow empty content if there are images
  if (!trimmedContent && images.length === 0 && !image) {
    // Return error
  }
  
  const messageData = {
    conversation: conversationId,
    sender: currentUserId,
    content: trimmedContent || `[${images.length} Hình ảnh]`,
    type,
    readBy: [currentUserId],
  };

  // Add image fields if present
  if (image) {
    messageData.image = image;
  }

  if (images.length > 0) {
    messageData.images = images;
  }

  const message = await Message.create(messageData);
});
```

### 2. **Backend REST API (messageController.js)**

#### Trước:
```javascript
const sendMessage = async (req, res) => {
  const { content } = req.body;
  
  if (!trimmedContent) {
    // Return error
  }
  
  const message = await Message.create({
    conversation: conversationId,
    sender: currentUserId,
    content: trimmedContent,
    readBy: [currentUserId],
  });
};
```

#### Sau:
```javascript
const sendMessage = async (req, res) => {
  const { content, type = "text", image = null, images = [] } = req.body;
  
  // Validate images array
  if (images.length > 5) {
    // Return error
  }
  
  // Allow empty content if there are images
  if (!trimmedContent && images.length === 0 && !image) {
    // Return error
  }
  
  const messageData = {
    conversation: conversationId,
    sender: currentUserId,
    content: trimmedContent || `[${images.length} Hình ảnh]`,
    type,
    readBy: [currentUserId],
  };

  // Add image fields if present
  if (image) {
    messageData.image = image;
  }

  if (images.length > 0) {
    messageData.images = images;
  }

  const message = await Message.create(messageData);
};
```

### 3. **Static Files Configuration (server.js)**

#### Trước:
```javascript
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
```

#### Sau:
```javascript
// Serve static files with proper cache headers
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set cache control headers for images
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || 
        filePath.endsWith('.png') || filePath.endsWith('.webp') || 
        filePath.endsWith('.gif')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    }
  }
}));
```

### 4. **Frontend MessageInput.jsx**

Cập nhật xử lý response từ upload API:

```javascript
const uploadPromises = selectedImages.map(async (img) => {
  const response = await uploadProductImage(img.file);
  console.log("Upload response:", response);
  return response?.imageUrl || response?.data?.imageUrl || response?.url;
});
```

## 🧪 Cách kiểm tra

### 1. Restart Backend Server

```powershell
cd backend
npm start
```

### 2. Clear Browser Cache

- Chrome: Ctrl + Shift + Delete → Clear cached images and files
- Hoặc: Hard reload (Ctrl + Shift + R)

### 3. Test gửi message với ảnh

1. Vào trang Message
2. Chọn một conversation
3. Click icon hình ảnh để chọn ảnh (tối đa 5 ảnh)
4. Gửi message
5. Kiểm tra:
   - ✅ Ảnh hiển thị ngay lập tức
   - ✅ Reload page → ảnh vẫn hiển thị
   - ✅ Người nhận thấy được ảnh realtime

### 4. Kiểm tra Database

```javascript
// MongoDB query
db.messages.findOne({ type: "image" })

// Expected result:
{
  _id: ObjectId("..."),
  conversation: ObjectId("..."),
  sender: ObjectId("..."),
  type: "image",
  content: "[3 Hình ảnh]",
  images: [
    "https://res.cloudinary.com/.../image1.jpg",
    "https://res.cloudinary.com/.../image2.jpg",
    "https://res.cloudinary.com/.../image3.jpg"
  ],
  readBy: [ObjectId("...")],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### 5. Kiểm tra Network Tab

- Mở DevTools → Network
- Gửi message với ảnh
- Kiểm tra API response:

```json
{
  "success": true,
  "message": {
    "_id": "...",
    "type": "image",
    "content": "[3 Hình ảnh]",
    "images": [
      "https://res.cloudinary.com/.../image1.jpg",
      "https://res.cloudinary.com/.../image2.jpg",
      "https://res.cloudinary.com/.../image3.jpg"
    ],
    "sender": { ... },
    "readBy": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## 📝 Ghi chú

1. **Cloudinary URLs**: Đảm bảo Cloudinary credentials được cấu hình đúng trong `.env`
2. **Images Limit**: Tối đa 5 ảnh mỗi tin nhắn (validated ở cả frontend và backend)
3. **Empty Content**: Cho phép content rỗng nếu có ảnh đính kèm
4. **Backward Compatibility**: Vẫn hỗ trợ field `image` (single image) cho tương thích ngược

## 🐛 Troubleshooting

### Vấn đề: Ảnh vẫn không hiển thị

1. Kiểm tra console logs
2. Verify images được lưu vào database
3. Kiểm tra Cloudinary URLs accessible
4. Clear browser cache hoàn toàn

### Vấn đề: Upload ảnh thất bại

1. Kiểm tra `.env` có `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
2. Kiểm tra file size < 10MB
3. Kiểm tra file format (JPG, PNG, WebP, GIF)

### Vấn đề: 304 Not Modified vẫn xuất hiện

1. Hard reload (Ctrl + Shift + R)
2. Disable cache in DevTools (Network tab)
3. Restart backend server
4. Clear all browser data

## ✨ Kết quả mong đợi

- ✅ Gửi được 1-5 ảnh trong một message
- ✅ Ảnh hiển thị dạng grid layout đẹp mắt
- ✅ Reload page vẫn thấy ảnh
- ✅ Người nhận thấy ảnh realtime qua Socket.IO
- ✅ Click ảnh để xem full size (open new tab)
- ✅ Response không bị cache lỗi (304 resolved)
