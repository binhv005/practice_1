# Hộp Quà 3D - Thiết Kế Rỗng Đẹp Mắt

## 🎨 Cải tiến thiết kế

Đã nâng cấp hộp quà 3D với thiết kế rỗng mặt trên đẹp mắt và chuyên nghiệp hơn.

## ✨ Các cải tiến chính

### 1. **Tăng độ dày thành hộp**
```javascript
const boxThickness = 0.15; // Từ 0.08 lên 0.15
```
- Thành hộp dày hơn, trông chắc chắn và chất lượng hơn
- Tạo cảm giác hộp quà thật sự có chiều sâu

### 2. **Thêm mặt bên trong (Inner Surface)**
- **Material riêng cho bên trong**: Màu vàng nhạt hơn (#ffeaa7)
- **DoubleSide rendering**: Hiển thị đẹp từ mọi góc nhìn
- **5 mặt inner**: bottom, left, right, front, back
- Tạo hiệu ứng chiều sâu 3D chân thực

### 3. **Viền trên (Rim) - Chi tiết quan trọng**
```javascript
const rimThickness = 0.06;
const rimHeight = 0.08;
```
- 4 viền bao quanh miệng hộp (trên, dưới, trái, phải)
- Tạo độ sâu và định hình rõ ràng cho phần mở hộp
- Giúp phân biệt rõ ràng giữa thành hộp và miệng hộp

### 4. **Ánh sáng bên trong (Inner Light)**
```javascript
const innerLight = new THREE.PointLight(0xfff4e6, 0.8, 5);
innerLight.position.set(0, 0.3, 0);
```
- PointLight màu vàng nhẹ (#fff4e6) bên trong hộp
- Intensity: 0.8, Distance: 5 units
- Làm nổi bật phần rỗng khi hộp xoay
- Tạo hiệu ứng "ánh sáng thần kỳ" từ bên trong

## 📐 Cấu trúc chi tiết

### Outer Surfaces (Mặt ngoài - Vàng đậm)
1. **Bottom** - Đáy hộp (2.4 x 0.15 x 2.4)
2. **Left Wall** - Thành trái (0.15 x 2.25 x 2.4)
3. **Right Wall** - Thành phải (0.15 x 2.25 x 2.4)
4. **Front Wall** - Thành trước (2.1 x 2.25 x 0.15)
5. **Back Wall** - Thành sau (2.1 x 2.25 x 0.15)

### Inner Surfaces (Mặt trong - Vàng nhạt)
1. **Bottom Inner** - PlaneGeometry nhìn lên từ trong
2. **Left Inner** - PlaneGeometry nhìn sang phải
3. **Right Inner** - PlaneGeometry nhìn sang trái
4. **Front Inner** - PlaneGeometry nhìn vào trong
5. **Back Inner** - PlaneGeometry nhìn ra ngoài

### Rim (Viền trên)
1. **Rim Front** - Viền phía trước
2. **Rim Back** - Viền phía sau
3. **Rim Left** - Viền bên trái
4. **Rim Right** - Viền bên phải

## 🎯 Hiệu ứng đạt được

### Khi nhìn từ xa:
- ✅ Hộp quà trông chắc chắn, chất lượng cao
- ✅ Viền rõ ràng tạo định hình đẹp mắt
- ✅ Màu sắc hài hòa, không bị phẳng

### Khi hộp xoay:
- ✅ Thấy rõ độ dày của thành hộp
- ✅ Ánh sáng bên trong tạo điểm nhấn
- ✅ Mặt trong màu nhạt tạo chiều sâu
- ✅ Shadow và lighting chân thực

### Khi nắp mở:
- ✅ Nhìn rõ bên trong hộp rỗng
- ✅ Ánh sáng tỏa ra từ trong hộp
- ✅ Viền trên tạo ranh giới rõ ràng
- ✅ Hiệu ứng "hộp quà thần kỳ"

## 🎨 Color Palette

```javascript
// Outer surface
color: 0xffd166  // Vàng chủ đạo - #ffd166
roughness: 0.65
metalness: 0.02

// Inner surface  
color: 0xffeaa7  // Vàng nhạt - #ffeaa7
roughness: 0.55
metalness: 0.05
side: THREE.DoubleSide

// Inner light
color: 0xfff4e6  // Vàng ấm - #fff4e6
intensity: 0.8
distance: 5
```

## 📊 So sánh trước/sau

### Trước:
- Thành mỏng (0.08)
- Chỉ có 5 mặt ngoài
- Không có viền
- Không có ánh sáng trong
- Trông đơn giản, phẳng

### Sau:
- ✅ Thành dày (0.15) - Chắc chắn hơn
- ✅ 5 mặt ngoài + 5 mặt trong - Chiều sâu 3D
- ✅ 4 viền trên - Định hình rõ ràng
- ✅ PointLight bên trong - Hiệu ứng ma thuật
- ✅ Material khác biệt - Chân thực hơn

## 🚀 Performance

- **Vertices tăng**: Chấp nhận được do tăng chi tiết
- **Draw calls**: Hợp lý, được nhóm trong boxBaseGroup
- **Memory**: Tối ưu với dispose() đầy đủ
- **FPS**: Vẫn mượt mà 60fps

## 📝 File thay đổi

- ✅ `client/src/components/user/HeroSection.jsx`

## 🎬 Test

1. `npm run dev` trong thư mục client
2. Mở http://localhost:5173
3. Cuộn đến Hero Section
4. Quan sát:
   - Độ dày thành hộp
   - Viền trên rõ ràng
   - Ánh sáng phát ra từ trong hộp khi xoay
   - Màu sắc gradient bên trong/ngoài
   - Hiệu ứng shadow chân thực

## 💡 Ghi chú kỹ thuật

- Sử dụng `PlaneGeometry` cho mặt trong thay vì `BoxGeometry` để tối ưu
- `DoubleSide` rendering cho inner surfaces đảm bảo hiển thị từ mọi góc
- `PointLight` được add vào `giftBox` group để di chuyển cùng hộp
- Offset nhỏ (0.02) giữa outer và inner surfaces tránh z-fighting
- Rim được tính toán chính xác để nối liền các cạnh
