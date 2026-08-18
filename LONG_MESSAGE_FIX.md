# 🔧 Fix: Xử Lý Tin Nhắn Dài

## Vấn Đề

Khi gửi tin nhắn dài, server trả về lỗi 500 vì:
1. Express body parser có giới hạn mặc định (100KB)
2. Thiếu validation rõ ràng cho độ dài message
3. Không có feedback cho user khi message quá dài
4. Error handling không đủ chi tiết

## Giải Pháp Đã Thực Hiện

### 1. Backend Fixes

#### a) Tăng Body Size Limit (server.js)

**Trước:**
```javascript
app.use(express.json());
```

**Sau:**
```javascript
// Tăng limit lên 10MB cho tin nhắn dài và base64 images
app.use(express.json({ 
  limit: '10mb' 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));
```

**Lợi ích:**
- Hỗ trợ tin nhắn dài (lên đến 5000 ký tự)
- Hỗ trợ base64 encoded images
- Tránh lỗi 413 Payload Too Large

#### b) Cải Thiện Validation (messageController.js)

**Trước:**
```javascript
if (trimmedContent.length > 5000) {
  return res.status(400).json({
    success: false,
    message: "Tin nhắn không được vượt quá 5000 ký tự",
  });
}
```

**Sau:**
```javascript
const MAX_MESSAGE_LENGTH = 5000;
if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
  return res.status(400).json({
    success: false,
    message: `Tin nhắn quá dài. Giới hạn ${MAX_MESSAGE_LENGTH} ký tự (hiện tại: ${trimmedContent.length} ký tự)`,
    error: {
      code: 'MESSAGE_TOO_LONG',
      maxLength: MAX_MESSAGE_LENGTH,
      currentLength: trimmedContent.length,
    }
  });
}
```

**Lợi ích:**
- Message rõ ràng hơn với số ký tự cụ thể
- Có error code để frontend xử lý
- Có metadata để hiển thị progress

#### c) Better Error Handling (messageController.js)

```javascript
} catch (error) {
  console.error("Send message error:", error);

  // Handle specific MongoDB validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu tin nhắn không hợp lệ",
      error: error.message,
    });
  }

  // Handle payload too large error
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: "Tin nhắn quá lớn. Vui lòng giảm kích thước nội dung hoặc số lượng ảnh",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Không thể gửi tin nhắn",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}
```

**Lợi ích:**
- Xử lý từng loại lỗi cụ thể
- Message phù hợp với từng trường hợp
- Show error details trong development mode

#### d) Socket Handler Update (messageSocket.js)

Cập nhật tương tự cho Socket.IO handler:
```javascript
if (trimmedContent.length > 5000) {
  const result = {
    success: false,
    message: `Tin nhắn quá dài. Giới hạn 5000 ký tự (hiện tại: ${trimmedContent.length} ký tự)`,
    error: {
      code: 'MESSAGE_TOO_LONG',
      maxLength: 5000,
      currentLength: trimmedContent.length,
    }
  };
  // ...
}
```

### 2. Frontend Fixes

#### a) Client-Side Validation (MessageInput.jsx)

**Thêm validation trước khi gửi:**

```javascript
const MAX_MESSAGE_LENGTH = 5000; // Match backend

const handleSend = () => {
  const content = message.trim();

  // Validate message length
  if (content.length > MAX_MESSAGE_LENGTH) {
    setImageError(`Tin nhắn quá dài. Giới hạn ${MAX_MESSAGE_LENGTH} ký tự (hiện tại: ${content.length})`);
    setTimeout(() => setImageError(""), 5000);
    return;
  }
  
  // ... continue sending
};
```

**Lợi ích:**
- Ngăn chặn request không hợp lệ sớm
- Giảm tải cho server
- Feedback ngay lập tức cho user

#### b) Character Counter (MessageInput.jsx)

**Hiển thị counter khi gần đến giới hạn:**

```javascript
{/* Character Counter - Show when approaching limit */}
{message.length > MAX_MESSAGE_LENGTH * 0.8 && (
  <div className={`mb-2 px-3 py-1 text-xs text-right ${
    message.length > MAX_MESSAGE_LENGTH 
      ? 'text-red-600 font-semibold'      // Over limit
      : message.length > MAX_MESSAGE_LENGTH * 0.9
      ? 'text-orange-600'                 // Warning (90%)
      : 'text-gray-500'                   // Info (80%)
  }`}>
    {message.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()} ký tự
  </div>
)}
```

**Behavior:**
- Hiện khi đạt 80% giới hạn (4000 ký tự)
- Màu xám: 80-90% (4000-4500)
- Màu cam: 90-100% (4500-5000)
- Màu đỏ đậm: > 100% (> 5000)

**Lợi ích:**
- User biết còn bao nhiêu ký tự
- Visual warning khi gần giới hạn
- Không gây phiền nhiễu khi message ngắn

#### c) Validation for Images (MessageInput.jsx)

Cũng áp dụng validation cho message kèm ảnh:

```javascript
const handleSendImages = async () => {
  // Validate message length if there's text
  const content = message.trim();
  if (content.length > MAX_MESSAGE_LENGTH) {
    setImageError(`Tin nhắn quá dài. Giới hạn ${MAX_MESSAGE_LENGTH} ký tự (hiện tại: ${content.length})`);
    setTimeout(() => setImageError(""), 5000);
    return;
  }
  // ... continue
};
```

## Files Đã Sửa

### Backend
- ✅ `backend/server.js` - Tăng body size limit
- ✅ `backend/controllers/messageController.js` - Better validation & error handling
- ✅ `backend/sockets/messageSocket.js` - Consistent validation

### Frontend
- ✅ `client/src/components/message/MessageInput.jsx` - Validation & character counter

## Testing

### Test Cases

1. **Tin nhắn bình thường (< 5000 ký tự)**
   - ✅ Gửi thành công
   - ✅ Không hiển thị counter

2. **Tin nhắn dài (4000-4500 ký tự)**
   - ✅ Gửi thành công
   - ✅ Hiển thị counter màu xám

3. **Tin nhắn gần giới hạn (4500-5000 ký tự)**
   - ✅ Gửi thành công
   - ✅ Hiển thị counter màu cam (warning)

4. **Tin nhắn vượt giới hạn (> 5000 ký tự)**
   - ✅ Ngăn chặn ở client-side
   - ✅ Counter màu đỏ
   - ✅ Error message hiển thị
   - ✅ Server reject nếu bypass client

5. **Tin nhắn với ảnh**
   - ✅ Validation áp dụng cho cả text kèm ảnh
   - ✅ Error message rõ ràng

### Manual Testing

```bash
# 1. Test với tin nhắn dài
# Paste văn bản > 5000 ký tự vào message input
# Expected: Counter hiện màu đỏ, không gửi được

# 2. Test với tin nhắn vừa đủ
# Nhập đúng 5000 ký tự
# Expected: Gửi thành công, counter màu cam

# 3. Test với tin nhắn + ảnh
# Nhập text dài + thêm ảnh
# Expected: Validation vẫn hoạt động
```

## Configuration

### Giới Hạn Hiện Tại

```javascript
// Backend & Frontend
MAX_MESSAGE_LENGTH = 5000 // ký tự

// Express body limit
express.json({ limit: '10mb' })
express.urlencoded({ limit: '10mb' })
```

### Điều Chỉnh Giới Hạn (Nếu Cần)

**Để tăng giới hạn message:**

1. **Backend** - Sửa cả 2 files:
   ```javascript
   // messageController.js
   const MAX_MESSAGE_LENGTH = 10000; // Tăng lên 10k
   
   // messageSocket.js
   if (trimmedContent.length > 10000) { // Tăng lên 10k
   ```

2. **Frontend**:
   ```javascript
   // MessageInput.jsx
   const MAX_MESSAGE_LENGTH = 10000; // Match backend
   ```

3. **Database Model**:
   ```javascript
   // models/Message.js
   content: {
     type: String,
     maxlength: 10000, // Cập nhật constraint
   }
   ```

**Khuyến nghị:**
- Không nên quá 10,000 ký tự (user experience)
- Nếu cần text dài hơn, cân nhắc "note" hoặc attachment feature
- Body limit (10MB) đủ cho text rất dài + images

## Performance Impact

### Database
- Tin nhắn dài không ảnh hưởng performance đáng kể
- MongoDB hỗ trợ document lên đến 16MB
- Index vẫn hoạt động bình thường

### Network
- 5000 ký tự ≈ 5-10KB (UTF-8)
- Với compression (gzip), giảm 60-70%
- Network impact minimal

### UX
- Character counter giúp user tự kiểm soát
- Validation nhanh, không blocking
- Error messages rõ ràng

## Migration

Không cần migration vì:
- ✅ Không thay đổi schema
- ✅ Backward compatible
- ✅ Chỉ thêm validation

Simply deploy new code và restart server.

## Troubleshooting

### Nếu vẫn bị lỗi 413 (Payload Too Large)

1. Kiểm tra nginx/proxy config (nếu có):
   ```nginx
   client_max_body_size 10M;
   ```

2. Kiểm tra hosting platform limits (Vercel, Render, etc.)

3. Verify Express config đã load:
   ```javascript
   console.log('Body parser limit:', app.settings['json limit']);
   ```

### Nếu validation không hoạt động

1. Clear browser cache
2. Verify frontend bundle đã rebuild
3. Check console logs cho errors

## Summary

✅ **Backend:**
- Tăng body limit lên 10MB
- Better validation với thông tin chi tiết
- Improved error handling

✅ **Frontend:**
- Client-side validation
- Real-time character counter
- Better UX với visual feedback

✅ **Result:**
- Không còn lỗi 500 với tin nhắn dài
- User có feedback rõ ràng
- Better error messages
- Improved UX

---

**Deploy:** Chỉ cần deploy code mới, không cần migration hay database changes.
