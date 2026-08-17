# Tính năng Lưu Sản Phẩm (Saved Products)

## Tổng quan
Tính năng cho phép người dùng lưu các sản phẩm yêu thích để xem lại sau.

## Các thay đổi đã thực hiện

### Backend

#### 1. **Model Update** (`backend/models/User.js`)
- Thêm field `savedProducts` vào User schema:
```javascript
savedProducts: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
]
```

#### 2. **Controller** (`backend/controllers/savedProductController.js`)
Các API endpoints:
- `POST /api/saved-products/:productId` - Lưu sản phẩm
- `DELETE /api/saved-products/:productId` - Bỏ lưu sản phẩm
- `GET /api/saved-products` - Lấy danh sách sản phẩm đã lưu (có pagination)
- `GET /api/saved-products/:productId/check` - Kiểm tra sản phẩm đã lưu chưa

#### 3. **Routes** (`backend/routes/savedProductRoutes.js`)
- Tất cả routes yêu cầu authentication

#### 4. **Server** (`backend/server.js`)
- Đã thêm route `/api/saved-products`

### Frontend

#### 1. **API Functions** (`client/src/api/savedProductApi.js`)
```javascript
- saveProduct(productId)
- unsaveProduct(productId)
- getSavedProducts(page, limit)
- checkProductSaved(productId)
```

#### 2. **Custom Hook** (`client/src/hooks/useSavedProducts.js`)
Hook để quản lý saved products state:
```javascript
const {
  savedProductIds,
  loading,
  checkSaved,
  toggleSave,
  saveProduct,
  unsaveProduct,
  isSaved,
} = useSavedProducts();
```

#### 3. **Saved Products Page** (`client/src/pages/SavedProductsPage.jsx`)
- Hiển thị danh sách sản phẩm đã lưu
- Grid layout responsive
- Pagination
- Unsave button trên mỗi sản phẩm
- Empty state khi chưa có sản phẩm nào

#### 4. **Header Update** (`client/src/components/user/UserHeader.jsx`)
Thêm 2 options mới trong dropdown avatar:
- **Tin của bạn** (`/my-products`) - Xem sản phẩm đã đăng
- **Tin đã lưu** (`/saved-products`) - Xem sản phẩm đã lưu

#### 5. **Routes** (`client/src/App.jsx`)
- Thêm route `/saved-products`

## Cách sử dụng

### 1. Lưu sản phẩm
```javascript
import { useSavedProducts } from "../hooks/useSavedProducts";

const { saveProduct } = useSavedProducts();

const handleSave = async (productId) => {
  try {
    await saveProduct(productId);
    alert("Đã lưu sản phẩm!");
  } catch (error) {
    alert("Không thể lưu sản phẩm");
  }
};
```

### 2. Toggle save/unsave
```javascript
const { toggleSave, isSaved } = useSavedProducts();

const handleToggle = async (productId) => {
  try {
    const saved = await toggleSave(productId);
    alert(saved ? "Đã lưu!" : "Đã bỏ lưu!");
  } catch (error) {
    alert("Có lỗi xảy ra");
  }
};

// Kiểm tra trạng thái
const saved = isSaved(productId);
```

### 3. Hiển thị Bookmark Button
```jsx
import { Bookmark } from "lucide-react";
import { useSavedProducts } from "../hooks/useSavedProducts";

function ProductCard({ product }) {
  const { toggleSave, isSaved, loading } = useSavedProducts();
  const saved = isSaved(product._id);

  return (
    <div className="product-card">
      <button
        onClick={() => toggleSave(product._id)}
        disabled={loading}
        className={saved ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
      >
        <Bookmark size={20} />
      </button>
      {/* ... */}
    </div>
  );
}
```

## UI/UX Features

### Saved Products Page (`/saved-products`)
1. **Header**
   - Nút back về trang chủ
   - Hiển thị tổng số sản phẩm đã lưu

2. **Product Grid**
   - Responsive: 1 col (mobile) → 4 cols (desktop)
   - Hiển thị ảnh, tiêu đề, địa chỉ, category
   - Bookmark button để unsave
   - Status badge (đã tặng, đang xử lý, etc.)
   - Hover effect

3. **Empty State**
   - Icon Bookmark
   - Text hướng dẫn
   - Button dẫn về trang chủ

4. **Pagination**
   - Nút Previous/Next
   - Hiển thị trang hiện tại
   - Disable khi không có trang trước/sau

### Header Dropdown
1. **Tin của bạn** (My Products)
   - Icon: ClipboardList
   - Link: `/my-products`

2. **Tin đã lưu** (Saved Products)
   - Icon: Bookmark
   - Link: `/saved-products`

3. **Cài đặt tài khoản** (Settings)
   - Icon: Settings
   - Link: `/settings`

4. **Trang quản trị** (Admin - nếu có quyền)
   - Icon: Shield
   - Link: `/admin/dashboard`

## API Endpoints

### POST /api/saved-products/:productId
Lưu sản phẩm vào danh sách

**Request:** Headers với authentication cookie

**Response:**
```json
{
  "success": true,
  "message": "Đã lưu sản phẩm",
  "savedProducts": ["productId1", "productId2", ...]
}
```

### DELETE /api/saved-products/:productId
Bỏ lưu sản phẩm

**Response:**
```json
{
  "success": true,
  "message": "Đã bỏ lưu sản phẩm",
  "savedProducts": ["productId1", ...]
}
```

### GET /api/saved-products?page=1&limit=12
Lấy danh sách sản phẩm đã lưu

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "title": "...",
      "images": [...],
      "category": {...},
      "address": {...},
      "status": "giving",
      "interestCount": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5,
    "hasMore": true
  }
}
```

### GET /api/saved-products/:productId/check
Kiểm tra sản phẩm đã lưu chưa

**Response:**
```json
{
  "success": true,
  "isSaved": true
}
```

## Database Schema

### User Model
```javascript
{
  // ... existing fields
  savedProducts: [ObjectId], // References to Product
}
```

## Cải tiến có thể làm thêm

1. **Notifications**
   - Thông báo khi sản phẩm đã lưu có cập nhật
   - Thông báo khi sản phẩm đã lưu được tặng

2. **Collections**
   - Tổ chức saved products thành các collections
   - VD: "Đồ điện tử", "Quần áo", etc.

3. **Sharing**
   - Chia sẻ danh sách saved products
   - Export danh sách

4. **Sync**
   - Real-time sync giữa các devices
   - Socket.IO để update instantly

5. **Analytics**
   - Thống kê sản phẩm được lưu nhiều nhất
   - Trending products

6. **Smart Recommendations**
   - Gợi ý sản phẩm tương tự với sản phẩm đã lưu
   - ML-based recommendations

## Testing

### Manual Testing Steps:

1. **Lưu sản phẩm:**
   - Đăng nhập
   - Vào trang chủ, click Bookmark icon trên sản phẩm
   - ✅ Icon chuyển từ outline → filled, màu vàng

2. **Xem saved products:**
   - Click avatar → chọn "Tin đã lưu"
   - ✅ Hiển thị sản phẩm vừa lưu

3. **Bỏ lưu sản phẩm:**
   - Trong trang Saved Products, click Bookmark icon
   - ✅ Sản phẩm biến mất khỏi danh sách

4. **Pagination:**
   - Lưu hơn 12 sản phẩm
   - ✅ Hiển thị pagination, click Next/Previous

5. **Empty state:**
   - Bỏ lưu tất cả sản phẩm
   - ✅ Hiển thị empty state với button về trang chủ

### API Testing:
```bash
# Save product
curl -X POST http://localhost:3000/api/saved-products/:productId \
  -H "Cookie: accessToken=..." \
  -H "Content-Type: application/json"

# Get saved products
curl http://localhost:3000/api/saved-products?page=1&limit=12 \
  -H "Cookie: accessToken=..."

# Check if saved
curl http://localhost:3000/api/saved-products/:productId/check \
  -H "Cookie: accessToken=..."

# Unsave product
curl -X DELETE http://localhost:3000/api/saved-products/:productId \
  -H "Cookie: accessToken=..."
```

## Troubleshooting

### Sản phẩm không lưu được
- Kiểm tra authentication cookie
- Kiểm tra productId có hợp lệ không
- Check console logs

### Trang saved products trống
- Kiểm tra network tab, xem API có lỗi không
- Kiểm tra user có savedProducts không
- Check browser console

### Bookmark icon không đổi màu
- Clear cache và reload
- Kiểm tra useSavedProducts hook
- Kiểm tra state management
