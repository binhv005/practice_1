# Kiểm tra Database - Tin nhắn ảnh

## 🔍 Các bước kiểm tra

### 1. Mở MongoDB Compass hoặc mongosh

### 2. Chạy query kiểm tra tin nhắn ảnh gần nhất:

```javascript
// Tìm tin nhắn ảnh gần nhất
db.messages.find({ type: "image" }).sort({ createdAt: -1 }).limit(5).pretty()
```

### 3. Kiểm tra các trường quan trọng:

```javascript
{
  "_id": ObjectId("..."),
  "type": "image",        // ← Phải là "image"
  "content": "...",       // ← Có thể là "[2 Hình ảnh]" hoặc caption
  
  // ⚠️ KIỂM TRA CÁC TRƯỜNG SAU:
  "image": "https://...", // ← Field cũ (single image)
  "images": [             // ← Field mới (multiple images) - QUAN TRỌNG!
    "https://res.cloudinary.com/.../image1.webp",
    "https://res.cloudinary.com/.../image2.webp"
  ],
  
  "sender": ObjectId("..."),
  "conversation": ObjectId("..."),
  "readBy": [...],
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## ❓ Các trường hợp

### ✅ Trường hợp 1: Có field `images` với array URLs
```javascript
{
  "type": "image",
  "images": ["https://res.cloudinary.com/.../img1.webp"],
  "content": "[1 Hình ảnh]"
}
```
→ **OK**: Frontend sẽ hiển thị được ảnh

### ❌ Trường hợp 2: Không có field `images`, chỉ có `content`
```javascript
{
  "type": "image",
  "content": "[1 Hình ảnh]",
  // ← THIẾU field images!
}
```
→ **LỖI**: Chỉ hiển thị text "Ảnh 1" vì không có URL

### ❌ Trường hợp 3: `images` là array rỗng
```javascript
{
  "type": "image",
  "images": [],  // ← Array rỗng!
  "content": "[1 Hình ảnh]"
}
```
→ **LỖI**: Backend không lưu URL vào array

## 🔧 Cách fix

### Nếu database KHÔNG có field `images`:

**Backend không lưu đúng**. Kiểm tra:

1. `messageController.js` - REST API
2. `messageSocket.js` - Socket handler

Đảm bảo có code:
```javascript
if (images.length > 0) {
  messageData.images = images;
}
```

### Nếu database có `images` nhưng array rỗng:

**Frontend không gửi đúng**. Kiểm tra console logs:

```javascript
// Phải thấy log này:
Valid image URLs to send: ["https://...", "https://..."]

// Và log này:
sendMessage called with: {
  type: "image",
  images: ["https://...", "https://..."],
  content: "..."
}
```

### Nếu database đúng nhưng frontend không hiển thị:

**MessageBubble không render đúng**. Kiểm tra console logs:

```javascript
// Phải thấy:
🔍 MessageBubble received message: {
  type: "image",
  hasImagesField: true,
  imagesArray: ["https://..."],
  imagesLength: 1
}

🎨 Final Render Decision: {
  imageUrls: ["https://..."],
  willRenderImages: true
}
```

## 🧪 Test query

### Query 1: Đếm tin nhắn ảnh
```javascript
db.messages.countDocuments({ type: "image" })
```

### Query 2: Tìm tin nhắn có field images
```javascript
db.messages.find({ 
  type: "image",
  images: { $exists: true, $ne: [] }
}).sort({ createdAt: -1 }).limit(5)
```

### Query 3: Tìm tin nhắn KHÔNG có field images
```javascript
db.messages.find({ 
  type: "image",
  $or: [
    { images: { $exists: false } },
    { images: [] }
  ]
}).sort({ createdAt: -1 }).limit(5)
```

### Query 4: Update tin nhắn cũ (nếu cần migrate)
```javascript
// CHỈ chạy nếu cần migrate từ single image sang multiple
db.messages.updateMany(
  {
    type: "image",
    image: { $exists: true, $ne: null },
    images: { $exists: false }
  },
  [{
    $set: {
      images: ["$image"]  // Convert single image to array
    }
  }]
)
```

## 📋 Checklist

- [ ] Database có collection `messages`
- [ ] Có tin nhắn với `type: "image"`
- [ ] Tin nhắn có field `images` (array)
- [ ] Array `images` không rỗng
- [ ] URLs trong `images` hợp lệ (bắt đầu với https://)
- [ ] Click URL trong MongoDB → mở được ảnh trong browser

## 🎯 Kết quả mong đợi

```javascript
db.messages.findOne({ type: "image" }, { sort: { createdAt: -1 } })

// Output:
{
  "_id": ObjectId("67a1b2c3d4e5f6a7b8c9d0e1"),
  "conversation": ObjectId("..."),
  "sender": ObjectId("..."),
  "type": "image",
  "images": [  // ✅ QUAN TRỌNG
    "https://res.cloudinary.com/practice1/image/upload/v1234567890/products/abc123.webp"
  ],
  "content": "[1 Hình ảnh]",
  "readBy": [ObjectId("...")],
  "createdAt": ISODate("2025-01-15T10:30:45.123Z"),
  "updatedAt": ISODate("2025-01-15T10:30:45.123Z"),
  "__v": 0
}
```
