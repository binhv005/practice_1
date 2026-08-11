function ProductCard({ product, onClick, getStatusLabel, getStatusClass }) {
  return (
    <article
      onClick={onClick}
      className="
        group
        bg-white
        rounded-2xl
        border border-gray-200
        overflow-hidden
        cursor-pointer
        transition-all duration-200
        hover:border-gray-300
        hover:shadow-lg
        hover:-translate-y-0.5
      "
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {product.images?.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="
              w-full
              h-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-[1.03]
            "
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-3xl mb-2">📦</div>
            <span className="text-xs">Chưa có hình ảnh</span>
          </div>
        )}

        {/* FEATURED */}
        {product.featured && (
          <span
            className="
              absolute
              top-3
              left-3
              inline-flex
              items-center
              gap-1
              px-2.5
              py-1.5
              rounded-lg
              bg-[#ffba00]
              text-gray-900
              text-xs
              font-bold
              shadow-sm
            "
          >
            ★ Ưu tiên
          </span>
        )}

        {/* STATUS */}
        <span
          className={`
            absolute
            bottom-3
            left-3
            px-2.5
            py-1.5
            rounded-lg
            text-xs
            font-semibold
            backdrop-blur-sm
            ${getStatusClass(product.status)}
          `}
        >
          {getStatusLabel(product.status)}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h2
            className="
              min-w-0
              font-semibold
              text-[15px]
              leading-5
              text-red-600
              line-clamp-2
            "
          >
            {product.title}
          </h2>
        </div>

        <p
          className="
            mt-2
            text-sm
            leading-5
            text-gray-500
            line-clamp-2
            min-h-10
          "
        >
          {product.description || "Không có mô tả"}
        </p>

        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-400">▣</span>
            <span className="truncate">
              {product.category?.name || "Không xác định"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-400">⌖</span>
            <span className="truncate">
              {product.address?.ward ? `${product.address.ward}, ` : ""}
              {product.address?.province || "Không xác định"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Ngày đăng</span>
            <span>•</span>
            <span>
              {product.createdAt
                ? new Date(product.createdAt).toLocaleDateString("vi-VN")
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
