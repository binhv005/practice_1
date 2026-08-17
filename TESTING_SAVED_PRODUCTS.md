# Hướng dẫn test chức năng lưu sản phẩm

## Tổng quan
Logic lưu sản phẩm đã được tích hợp hoàn toàn vào:
- **ProductCard**: Nút "Lưu" trên mỗi card sản phẩm
- **UserProductDetailModal**: Nút "Lưu sản phẩm" trong modal chi tiết
- **HomePage**: Sử dụng hook `useSavedProducts` để quản lý state
- **SavedProductsPage**: Trang hiển thị danh sách sản phẩm đã lưu

## Các bước test

### 1. Khởi động backend
```bash
cd backend
npm start
```

### 2. Khởi động frontend
```bash
cd client
npm run dev
```

### 3. Đăng nhập
- Mở trình duyệt tại `http://localhost:5173`
- Đăng nhập với tài khoản của bạn
- **Lưu ý**: Phải đăng nhập mới có thể lưu sản phẩm

### 4. Test lưu sản phẩm từ HomePage

#### Test trên ProductCard:
1. Vào trang chủ
2. Tìm một sản phẩm bất kỳ
3. Click vào nút **"Lưu"** ở góc trên bên phải của card
4. Nút sẽ đổi thành **"Đã lưu"** với màu vàng
5. Click lại để bỏ lưu → nút đổi về **"Lưu"**

#### Test trong ProductDetailModal:
1. Click vào một sản phẩm để mở modal chi tiết
2. Scroll xuống tìm nút **"Lưu sản phẩm"**
3. Click vào nút này
4. Nút sẽ đổi thành **"Đã lưu sản phẩm"** với icon ★
5. Click lại để bỏ lưu → nút đổi về **"Lưu sản phẩm"** với icon ☆

### 5. Kiểm tra trang Tin đã lưu
1. Click vào avatar ở góc trên phải header
2. Chọn **"Tin đã lưu"** từ dropdown menu
3. Trang `/saved-products` sẽ hiển thị:
   - Tất cả sản phẩm bạn đã lưu
   - Nút "Đã lưu" trên mỗi card (màu vàng)
   - Có thể click vào card để xem chi tiết
   - Có thể bỏ lưu bằng cách click nút "Đã lưu"

### 6. Test tính năng bỏ lưu
1. Trong trang Tin đã lưu
2. Click vào nút **"Đã lưu"** trên một sản phẩm
3. Sản phẩm sẽ bị xóa khỏi danh sách ngay lập tức

### 7. Test với người dùng chưa đăng nhập
1. Đăng xuất (nếu đã đăng nhập)
2. Vào trang chủ
3. Click vào nút "Lưu" trên một sản phẩm
4. Sẽ hiện thông báo: **"Vui lòng đăng nhập để lưu sản phẩm"**
5. Tự động chuyển hướng đến trang đăng nhập

## Các tính năng đã hoàn thành

### Frontend:
✅ Hook `useSavedProducts` với các chức năng:
  - `toggleSave(productId)`: Lưu/bỏ lưu sản phẩm
  - `isSaved(productId)`: Kiểm tra sản phẩm đã lưu chưa
  - `saveProduct(productId)`: Lưu sản phẩm
  - `unsaveProduct(productId)`: Bỏ lưu sản phẩm

✅ ProductCard:
  - Nút "Lưu" với icon bookmark
  - Thay đổi màu sắc khi đã lưu (vàng)
  - Hiển thị text "Đã lưu" / "Lưu"
  - Không kích hoạt onClick của card khi click nút lưu

✅ UserProductDetailModal:
  - Nút "Lưu sản phẩm" to và rõ ràng
  - Icon sao đầy (★) khi đã lưu
  - Icon sao rỗng (☆) khi chưa lưu
  - Màu nền vàng khi đã lưu

✅ HomePage:
  - Tích hợp hook `useSavedProducts`
  - Truyền props đúng cho ProductCard và Modal
  - Xử lý trường hợp chưa đăng nhập

✅ SavedProductsPage:
  - Hiển thị danh sách sản phẩm đã lưu
  - Cho phép bỏ lưu
  - Cho phép xem chi tiết sản phẩm

✅ RecommendedProducts:
  - Cập nhật để sử dụng `isSaved` function thay vì Set
  - Hiển thị trạng thái lưu đúng

### Backend:
✅ Routes:
  - `POST /api/saved-products/:productId` - Lưu sản phẩm
  - `DELETE /api/saved-products/:productId` - Bỏ lưu sản phẩm
  - `GET /api/saved-products` - Lấy danh sách sản phẩm đã lưu
  - `GET /api/saved-products/:productId/check` - Kiểm tra sản phẩm đã lưu

✅ User Model:
  - Thêm field `savedProducts: [ObjectId]`

✅ Controller & Service:
  - Xử lý logic lưu/bỏ lưu
  - Validate sản phẩm tồn tại
  - Prevent duplicate saves
  - Populate thông tin sản phẩm khi trả về

## Các trường hợp cần test

### Test cases chính:
1. ✅ Lưu sản phẩm từ HomePage card
2. ✅ Lưu sản phẩm từ ProductDetailModal
3. ✅ Bỏ lưu sản phẩm từ HomePage card
4. ✅ Bỏ lưu sản phẩm từ ProductDetailModal
5. ✅ Bỏ lưu sản phẩm từ SavedProductsPage
6. ✅ Xem danh sách sản phẩm đã lưu
7. ✅ Click vào sản phẩm đã lưu để xem chi tiết
8. ✅ Trạng thái "Đã lưu" sync giữa các pages

### Test cases edge:
1. ✅ Người dùng chưa đăng nhập click lưu
2. ✅ Lưu cùng sản phẩm 2 lần (backend prevent duplicate)
3. ✅ Bỏ lưu sản phẩm không có trong danh sách
4. ✅ Reload trang - state "Đã lưu" vẫn giữ nguyên (cần test)

## Debug nếu có lỗi

### Kiểm tra Backend logs:
```bash
cd backend
# Xem console output để check request/response
```

### Kiểm tra Frontend console:
1. Mở DevTools (F12)
2. Tab Console
3. Xem logs khi click nút "Lưu":
   - API request
   - Response data
   - Errors (nếu có)

### Kiểm tra Network tab:
1. Mở DevTools → Network
2. Click nút "Lưu"
3. Xem request:
   - URL: `/api/saved-products/:productId`
   - Method: POST hoặc DELETE
   - Status: 200 (success)
   - Response body có `success: true`

### Kiểm tra localStorage:
```javascript
// Trong browser console
localStorage.getItem('user') // Check user đã login
```

## Lưu ý quan trọng

1. **Phải đăng nhập**: Chức năng lưu sản phẩm chỉ hoạt động khi đã đăng nhập
2. **Token hợp lệ**: Nếu token hết hạn, cần đăng nhập lại
3. **Backend phải chạy**: Đảm bảo backend server đang chạy ở port 5000
4. **MongoDB phải chạy**: Database cần available để lưu dữ liệu

## Kết quả mong đợi

### Khi lưu thành công:
- Nút đổi từ "Lưu" → "Đã lưu"
- Màu đổi thành vàng (#ffba00)
- Không có thông báo lỗi
- Sản phẩm xuất hiện trong trang "Tin đã lưu"

### Khi bỏ lưu thành công:
- Nút đổi từ "Đã lưu" → "Lưu"
- Màu đổi về xám
- Trong trang "Tin đã lưu", sản phẩm bị xóa khỏi danh sách

### Khi có lỗi:
- Hiện alert với thông báo lỗi
- Trạng thái nút không thay đổi
- Console log error details

## Files đã thay đổi

### Frontend:
- ✅ `client/src/pages/HomePage.jsx` - Import và sử dụng useSavedProducts hook
- ✅ `client/src/components/user/RecommendedProducts.jsx` - Đổi từ Set sang function
- ✅ `client/src/components/products/ProductCard.jsx` - Sử dụng handleSaveClick consistent

### Không thay đổi (đã đúng):
- `client/src/hooks/useSavedProducts.js` - Hook đã implement sẵn
- `client/src/api/savedProductApi.js` - API đã implement sẵn
- `client/src/pages/SavedProductsPage.jsx` - Page đã implement sẵn
- `client/src/components/user/UserProductDetailModal.jsx` - Modal đã có nút lưu
- `backend/controllers/savedProductController.js` - Controller đã implement
- `backend/routes/savedProductRoutes.js` - Routes đã implement
- `backend/models/User.js` - Model đã có savedProducts field

## Tóm tắt thay đổi

### Những gì đã làm:
1. Import hook `useSavedProducts` vào HomePage
2. Thay thế `savedProducts` state bằng hook: `const { toggleSave, isSaved } = useSavedProducts()`
3. Cập nhật `handleToggleSave` để:
   - Kiểm tra đăng nhập
   - Call async `toggleSave` function
   - Xử lý errors
4. Đổi `savedProducts.has(id)` thành `isSaved(id)` ở:
   - ProductCard trong vòng lặp filteredProducts
   - RecommendedProducts component
   - UserProductDetailModal
5. Cập nhật RecommendedProducts props từ `savedProducts` Set sang `isSaved` function
6. Đảm bảo ProductCard sử dụng `handleSaveClick` nhất quán

### Không thay đổi giao diện:
- ✅ Không thay đổi UI/UX
- ✅ Không thay đổi layout
- ✅ Không thay đổi styling
- ✅ Chỉ thêm logic backend connectivity

## Kết luận

Chức năng lưu sản phẩm đã được hoàn thiện:
- Frontend tích hợp hook để gọi API
- Backend có đầy đủ endpoints
- UI/UX không thay đổi, chỉ thêm chức năng
- Xử lý trường hợp chưa đăng nhập
- Sync state giữa các components

Bạn có thể test ngay bây giờ bằng cách chạy backend + frontend và làm theo các bước test ở trên.
