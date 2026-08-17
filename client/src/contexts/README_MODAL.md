# Modal Context Usage

Modal Context cung cấp các popup/dialog đẹp mắt thay thế cho `window.confirm()` và `window.alert()`.

## Import

```jsx
import { useModal } from "../../contexts/ModalContext";
```

## Sử dụng

### 1. Confirm Dialog (Xác nhận)

```jsx
const modal = useModal();

const handleDelete = async () => {
  const confirmed = await modal.confirm({
    title: "Xác nhận xóa",
    message: "Bạn có chắc chắn muốn xóa mục này?",
    confirmText: "Xóa",
    cancelText: "Hủy",
    type: "danger", // default, danger, warning, info
  });

  if (confirmed) {
    // Thực hiện hành động
  }
};
```

### 2. Alert Dialog (Thông báo)

```jsx
const modal = useModal();

await modal.alert({
  title: "Thông báo",
  message: "Thao tác đã được thực hiện thành công!",
  buttonText: "OK",
  type: "info", // default, danger, warning, info
});
```

## Các loại Type

- **default**: Màu xám - Dùng cho các hành động thông thường
- **danger**: Màu đỏ - Dùng cho các hành động nguy hiểm (xóa, đăng xuất)
- **warning**: Màu vàng - Dùng cho cảnh báo
- **info**: Màu xanh - Dùng cho thông tin

## Ví dụ thực tế

### Đăng xuất

```jsx
const handleLogout = async () => {
  const confirmed = await modal.confirm({
    title: "Xác nhận đăng xuất",
    message: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
    confirmText: "Đăng xuất",
    cancelText: "Hủy",
    type: "danger",
  });

  if (confirmed) {
    await logoutApi();
    navigate("/login");
  }
};
```

### Xóa item

```jsx
const handleDelete = async (id) => {
  const confirmed = await modal.confirm({
    title: "Xóa sản phẩm",
    message: "Hành động này không thể hoàn tác. Bạn có chắc chắn?",
    confirmText: "Xóa",
    cancelText: "Hủy",
    type: "danger",
  });

  if (confirmed) {
    await deleteProduct(id);
    toast.success("Đã xóa sản phẩm!");
  }
};
```
