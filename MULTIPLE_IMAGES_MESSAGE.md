# Chức năng gửi nhiều ảnh trong Message

## 🎯 Mục tiêu
Cho phép người dùng gửi tối đa **5 ảnh** trong một tin nhắn thay vì chỉ 1 ảnh như trước.

## ✨ Tính năng mới

### Frontend (Client)

#### 1. **MessageInput Component** 
- ✅ Hỗ trợ chọn nhiều ảnh cùng lúc (multiple file selection)
- ✅ Preview các ảnh đã chọn trước khi gửi
- ✅ Nút xóa từng ảnh trong preview
- ✅ Giới hạn tối đa 5 ảnh
- ✅ Hiển thị số lượng ảnh đã chọn (x/5)
- ✅ Upload song song (parallel) để tăng tốc
- ✅ Thông báo lỗi rõ ràng khi vượt quá giới hạn
- ✅ Hỗ trợ thêm caption cho ảnh

#### 2. **MessageBubble Component**
- ✅ Hiển thị nhiều ảnh dưới dạng grid đẹp mắt
- ✅ Layout tự động theo số lượng ảnh:
  - 1 ảnh: Full width (max-h-64)
  - 2 ảnh: Grid 2 cột
  - 3 ảnh: Grid 2 cột, ảnh đầu span 2 rows
  - 4 ảnh: Grid 2x2
  - 5 ảnh: Grid 3 cột
- ✅ Click vào ảnh để xem full size (mở tab mới)
- ✅ Lazy loading cho ảnh
- ✅ Hiển thị caption nếu có

#### 3. **API Layer**
- ✅ Cập nhật `sendMessage()` để nhận array `images[]`
- ✅ Backward compatible với `image` đơn lẻ

### Backend (Server)

#### 1. **Message Model**
```javascript
{
  image: String,        // Giữ để backward compatible
  images: [String],     // Array mới cho nhiều ảnh
  validate: {
    max: 5 images       // Validate tối đa 5 ảnh
  }
}
```

#### 2. **conversationController**
- ✅ Xử lý cả `image` (legacy) và `images[]` (mới)
- ✅ Validate số lượng ảnh (max 5)
- ✅ Tự động chuyển đổi `image` đơn thành `images[]`
- ✅ Cập nhật content để hiển thị "[X Hình ảnh]"

## 📊 Luồng xử lý

### Gửi tin nhắn có nhiều ảnh:
```
1. User chọn nhiều ảnh (max 5)
   ↓
2. Preview hiển thị trong MessageInput
   ↓
3. User nhấn Send hoặc Enter
   ↓
4. Upload song song tất cả ảnh lên Cloudinary
   ↓
5. Nhận URLs của các ảnh
   ↓
6. Gửi array URLs qua API: { images: [...], content, type }
   ↓
7. Backend validate và lưu vào Message model
   ↓
8. Socket.IO broadcast tin nhắn mới
   ↓
9. MessageBubble hiển thị grid ảnh đẹp mắt
```

## 🎨 UI/UX Improvements

### Preview Area (trước khi gửi)
```
┌──────────────────────────────────┐
│ [img1] [img2] [img3] [img4] [5/5]│
│   ×      ×      ×      ×         │
└──────────────────────────────────┘
```
- Mỗi ảnh 80x80px
- Nút × hiện khi hover
- Counter hiển thị x/5

### Message Bubble (sau khi gửi)

**1 ảnh:**
```
┌────────────┐
│            │
│   Image 1  │
│            │
└────────────┘
```

**2-4 ảnh:**
```
┌──────┬──────┐
│ Img1 │ Img2 │
├──────┼──────┤
│ Img3 │ Img4 │
└──────┴──────┘
```

**5 ảnh:**
```
┌────┬────┬────┐
│Img1│Img2│Img3│
├────┴────┼────┤
│  Img4   │Img5│
└─────────┴────┘
```

## 🔧 Validation Rules

### Client-side:
- ✅ Mỗi ảnh ≤ 10MB
- ✅ Chỉ chấp nhận image/* (JPG, PNG, WebP...)
- ✅ Tối đa 5 ảnh/tin nhắn
- ✅ Hiển thị error message rõ ràng

### Server-side:
- ✅ Validate array length ≤ 5
- ✅ Validate từng URL hợp lệ
- ✅ Backward compatible với `image` field cũ

## 📝 API Changes

### Request Body (mới):
```json
{
  "conversationId": "...",
  "type": "image",
  "images": [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg",
    "https://cloudinary.com/image3.jpg"
  ],
  "content": "Caption cho ảnh (optional)"
}
```

### Response (Message object):
```json
{
  "_id": "...",
  "type": "image",
  "image": "https://cloudinary.com/image1.jpg",  // First image (backward compat)
  "images": [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg"
  ],
  "content": "Caption hoặc [2 Hình ảnh]",
  "sender": {...},
  "createdAt": "..."
}
```

## 🚀 Performance Optimizations

1. **Parallel Upload**: Upload tất cả ảnh đồng thời thay vì tuần tự
2. **Lazy Loading**: Ảnh chỉ load khi scroll vào viewport
3. **Object URL Cleanup**: Revoke URLs sau khi upload để tránh memory leak
4. **Grid Layout**: Sử dụng CSS Grid hiệu quả cho responsive

## 📦 Files Modified

### Backend:
- ✅ `backend/models/Message.js` - Thêm field `images[]`
- ✅ `backend/controllers/conversationController.js` - Xử lý nhiều ảnh

### Frontend:
- ✅ `client/src/components/message/MessageInput.jsx` - UI chọn nhiều ảnh
- ✅ `client/src/components/message/MessageBubble.jsx` - Hiển thị grid
- ✅ `client/src/api/messageApi.js` - API params mới

## 🧪 Testing Checklist

- [ ] Gửi 1 ảnh - OK
- [ ] Gửi 2 ảnh - OK
- [ ] Gửi 3 ảnh - OK
- [ ] Gửi 4 ảnh - OK
- [ ] Gửi 5 ảnh - OK
- [ ] Thử gửi 6 ảnh - Hiện lỗi
- [ ] Xóa ảnh trong preview - OK
- [ ] Thêm caption cho ảnh - OK
- [ ] Click ảnh mở tab mới - OK
- [ ] Responsive trên mobile - OK
- [ ] Backward compatibility với tin nhắn cũ - OK

## 💡 Future Enhancements

- [ ] Drag & drop để sắp xếp thứ tự ảnh
- [ ] Image compression trước khi upload
- [ ] Image cropping/editing
- [ ] Video support
- [ ] GIF support
- [ ] Image gallery lightbox view
