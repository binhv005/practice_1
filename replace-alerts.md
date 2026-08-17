# Hướng dẫn thay thế alert() bằng toast

## Các bước:

### 1. Import useToast ở đầu component
```javascript
import { useToast } from "../contexts/ToastContext";
```

### 2. Thêm hook trong component
```javascript
const toast = useToast();
```

### 3. Thay thế alert()

**Thông báo thành công:**
```javascript
// Cũ
alert("Đăng tin thành công");

// Mới
toast.success("Đăng tin thành công");
```

**Thông báo lỗi:**
```javascript
// Cũ
alert("Không thể thêm sản phẩm");

// Mới  
toast.error("Không thể thêm sản phẩm");
```

**Thông báo cảnh báo:**
```javascript
// Cũ
alert("Vui lòng nhập tên sản phẩm");

// Mới
toast.warning("Vui lòng nhập tên sản phẩm");
```

**Thông báo thông tin:**
```javascript
// Cũ
alert("Đang xử lý...");

// Mới
toast.info("Đang xử lý...");
```

## Danh sách file cần thay thế:

1. ✅ AdminProductPage.jsx (đang làm)
2. HomePage.jsx  
3. SavedProductsPage.jsx
4. RegisterPage.jsx
5. UserProductDetailModal.jsx
6. UserHeader.jsx
7. MessageInput.jsx
