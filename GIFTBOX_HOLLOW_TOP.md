# Hộp Quà 3D - Rỗng Mặt Trên

## Mô tả
Đã thay đổi thiết kế hộp quà 3D trong Hero Section để **rỗng mặt trên**, cho phép nhìn vào bên trong hộp khi nắp mở.

## Thay đổi chi tiết

### Trước đây:
```javascript
// Hộp kín 6 mặt
const baseGeometry = new THREE.BoxGeometry(2.4, 2.4, 2.4);
const boxBase = new THREE.Mesh(baseGeometry, yellowMaterial);
```

### Bây giờ:
```javascript
// Hộp rỗng mặt trên - 5 mặt riêng biệt
const boxSize = 2.4;
const boxThickness = 0.08;

// Mặt dưới (bottom)
// Mặt trái (left) 
// Mặt phải (right)
// Mặt trước (front)
// Mặt sau (back)
// ❌ KHÔNG có mặt trên (top)
```

## Cấu trúc hộp mới:

### 5 mặt được tạo:
1. **Mặt dưới** - Đáy hộp (bottom)
2. **Mặt trái** - Thành bên trái (left)
3. **Mặt phải** - Thành bên phải (right)
4. **Mặt trước** - Thành phía trước (front)
5. **Mặt sau** - Thành phía sau (back)

### Không có mặt trên:
- Cho phép nhìn vào bên trong hộp từ góc nhìn từ trên xuống
- Khi nắp hộp mở ra, có thể thấy bên trong hộp trống
- Tạo hiệu ứng 3D chân thực hơn

## Thông số kỹ thuật:
- **Kích thước hộp**: 2.4 x 2.4 x 2.4 units
- **Độ dày thành**: 0.08 units
- **Màu sắc**: Vàng (#ffd166)
- **Material**: MeshStandardMaterial với roughness 0.65

## Hiệu ứng giữ nguyên:
✅ Xoay 360 độ liên tục (rotation.y)
✅ Nắp mở/đóng animation (lidGroup)
✅ Floating lên xuống (position.y)
✅ Dải ruy băng trắng (ribbons)
✅ Nơ trên nắp (bow)
✅ Ánh sáng và bóng đổ (shadows)

## Kết quả:
- Khi hộp xoay, có thể thấy bên trong hộp rỗng
- Khi nắp mở, có thể nhìn vào trong hộp từ trên xuống
- Tạo cảm giác hộp quà chân thực và hấp dẫn hơn
- Phù hợp với concept "tặng đồ" - hộp mở để đón nhận

## File thay đổi:
- `client/src/components/user/HeroSection.jsx`

## Preview:
```
     [====]  ← Nắp (có thể mở)
      |  |   
      |  |   ← Mặt trái & phải
   ┌──┘  └──┐
   │  ⬚⬚⬚  │  ← Rỗng mặt trên (nhìn vào được)
   │        │
   └────────┘  ← Mặt dưới
```

## Test:
1. Chạy: `npm run dev` trong thư mục client
2. Truy cập: http://localhost:5173
3. Xem Hero Section với hộp quà 3D
4. Quan sát khi hộp xoay và nắp mở/đóng
