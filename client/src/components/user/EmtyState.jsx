function EmptyState() {
  return (
    <div
      className="
        flex
        min-h-[300px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-gray-200
        bg-white
        px-6
        text-center
      "
    >
      <div
        className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-yellow-50
          text-2xl
        "
      >
        🔍
      </div>

      <h3 className="mt-4 text-base font-bold text-gray-900">
        Không tìm thấy sản phẩm
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        Thử thay đổi từ khóa tìm kiếm hoặc chọn một danh mục khác.
      </p>
    </div>
  );
}

export default EmptyState;
