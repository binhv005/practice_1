# 🐛 Debug: Ảnh chỉ hiển thị "Ảnh 1" không thấy hình ảnh

## 🔍 Các bước debug

### 1. Kiểm tra Console Logs

Mở DevTools (F12) → Console, sau đó gửi ảnh và quan sát logs:

#### ✅ Logs mong muốn:

```javascript
// Khi upload
Upload response: {data: {success: true, data: {imageUrl: "https://res.cloudinary.com/..."}}}
Extracted imageUrl: https://res.cloudinary.com/.../image.webp
All upload results: ["https://...", "https://..."]
Valid image URLs to send: ["https://...", "https://..."]

// Khi gửi message
========== SEND MESSAGE ==========
conversationId: 67xxx
type: image
content: [2 Hình ảnh]
images: ["https://res.cloudinary.com/...", "https://res.cloudinary.com/..."]

// Response từ API
sendMessage response: {
  data: {
    message: {
      _id: "...",
      type: "image",
      images: ["https://...", "https://..."],
      content: "[2 Hình ảnh]",
      ...
    }
  }
}
```

#### ❌ Nếu thấy lỗi:

```javascript
// Upload thất bại
Invalid upload response structure: undefined
// → Backend upload API không hoạt động

// Không có images trong response
sendMessage response: {
  data: {
    message: {
      _id: "...",
      type: "image",
      content: "[2 Hình ảnh]",
      // ← THIẾU field images!
    }
  }
}
// → Backend không lưu images vào database
```

### 2. Kiểm tra Network Tab

Mở DevTools → Network:

#### Upload Image Request:

```
POST /api/products/upload-image
Status: 200 OK

Response:
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "imageUrl": "https://res.cloudinary.com/...image.webp"
  }
}
```

#### Send Message Request:

```
POST /api/conversations/{id}/messages
Status: 201 Created

Request Payload:
{
  "content": "[2 Hình ảnh]",
  "type": "image",
  "images": [
    "https://res.cloudinary.com/.../image1.webp",
    "https://res.cloudinary.com/.../image2.webp"
  ]
}

Response:
{
  "success": true,
  "message": {
    "_id": "...",
    "type": "image",
    "images": ["https://...", "https://..."],  ← Phải có field này!
    "content": "[2 Hình ảnh]",
    "sender": {...},
    "readBy": [...],
    ...
  }
}
```

### 3. Kiểm tra Database

Kết nối MongoDB và query:

```javascript
// Tìm message vừa gửi
db.messages.findOne({ type: "image" }).sort({ createdAt: -1 })

// Expected result:
{
  "_id": ObjectId("..."),
  "conversation": ObjectId("..."),
  "sender": ObjectId("..."),
  "type": "image",
  "content": "[2 Hình ảnh]",
  "images": [  ← QUAN TRỌNG: Phải có array này!
    "https://res.cloudinary.com/.../image1.webp",
    "https://res.cloudinary.com/.../image2.webp"
  ],
  "readBy": [ObjectId("...")],
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### 4. Kiểm tra Component Render

Thêm console.log vào MessageBubble để debug:

```jsx
// Trong MessageBubble.jsx
function MessageBubble({ message, currentUserId }) {
  console.log("MessageBubble render:", {
    type: message.type,
    hasImages: Boolean(message.images),
    imagesLength: message.images?.length,
    images: message.images,
    content: message.content
  });
  
  const hasMultipleImages = message.images && Array.isArray(message.images) && message.images.length > 0;
  console.log("hasMultipleImages:", hasMultipleImages);
  
  const imageUrls = hasMultipleImages ? message.images : (imageUrl ? [imageUrl] : []);
  console.log("imageUrls to render:", imageUrls);
  
  // ...rest of component
}
```

Expected logs:
```javascript
MessageBubble render: {
  type: "image",
  hasImages: true,
  imagesLength: 2,
  images: ["https://...", "https://..."],
  content: "[2 Hình ảnh]"
}
hasMultipleImages: true
imageUrls to render: ["https://...", "https://..."]
```

## 🔧 Các fix phổ biến

### Fix 1: MessageInput upload response không đúng

✅ **Đã sửa** - Extract đúng path `response.data.data.imageUrl`

### Fix 2: Backend không lưu images vào database

Kiểm tra `messageController.js` và `messageSocket.js`:

```javascript
// Phải có code này:
const { content, type = "text", image = null, images = [] } = req.body;

const messageData = {
  conversation: conversationId,
  sender: currentUserId,
  content: trimmedContent || `[${images.length} Hình ảnh]`,
  type,
  readBy: [currentUserId],
};

if (image) {
  messageData.image = image;
}

if (images.length > 0) {
  messageData.images = images;  // ← QUAN TRỌNG!
}

const message = await Message.create(messageData);
```

### Fix 3: Model không có field images

Kiểm tra `Message.js` model:

```javascript
images: {
  type: [String],
  default: [],
  validate: {
    validator: function(v) {
      return v.length <= 5;
    },
    message: 'Tối đa 5 ảnh mỗi tin nhắn'
  }
}
```

### Fix 4: MessageBubble không render images

Kiểm tra logic trong `MessageBubble.jsx`:

```javascript
const hasMultipleImages = message.images && Array.isArray(message.images) && message.images.length > 0;
const imageUrls = hasMultipleImages ? message.images : (imageUrl ? [imageUrl] : []);

// Render
{isImageMessage && imageUrls.length > 0 ? (
  <div className="grid gap-1">
    {imageUrls.map((url, index) => (
      <img key={index} src={url} alt={`Ảnh ${index + 1}`} />
    ))}
  </div>
) : null}
```

## 📊 Checklist

- [ ] Upload API response có `data.data.imageUrl` ✅
- [ ] MessageInput extract đúng imageUrl ✅
- [ ] onSend được gọi với đúng payload `{type: "image", images: [...]}` ✅
- [ ] Backend REST API nhận và lưu field `images` vào DB
- [ ] Backend Socket nhận và lưu field `images` vào DB
- [ ] Database có field `images` array với URLs
- [ ] MessageBubble nhận message với field `images`
- [ ] MessageBubble render đúng img tags với src URLs

## 🧪 Quick Test

### Test trong Console:

```javascript
// Kiểm tra message structure
const testMessage = {
  type: "image",
  images: ["https://res.cloudinary.com/demo/image1.jpg"],
  content: "[1 Hình ảnh]"
};

// Kiểm tra MessageBubble logic
const hasMultipleImages = testMessage.images && Array.isArray(testMessage.images) && testMessage.images.length > 0;
console.log("hasMultipleImages:", hasMultipleImages); // Should be true

const imageUrls = hasMultipleImages ? testMessage.images : [];
console.log("imageUrls:", imageUrls); // Should be ["https://..."]
```

## 🎯 Expected Result

✅ Upload → See preview boxes  
✅ Click Send → See upload progress  
✅ Upload complete → See actual images in chat  
✅ Images clickable → Open in new tab  
✅ Reload page → Images still visible  
✅ Other user → See images realtime

## ⚠️ Common Issues

### Issue: "Ảnh 1" text instead of image

**Cause**: `alt` attribute shown because `src` URL invalid or empty

**Debug**:
```javascript
// Check img src in DevTools Elements tab
<img src="" alt="Ảnh 1" />  // ← src is empty!
```

**Fix**: Ensure `imageUrls` array contains valid URLs

### Issue: Broken image icon

**Cause**: URL not accessible (CORS, 404, expired)

**Debug**: Click image URL in console, check if it opens

**Fix**: 
- Check Cloudinary credentials
- Check URL format
- Check CORS settings

### Issue: Images flash then disappear

**Cause**: State update or re-render clears images

**Debug**: Check React DevTools → Components → Message → images prop

**Fix**: Ensure images persist in state/props
