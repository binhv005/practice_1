function ProductTable({
  products,
  onProductClick,
  onToggleFeatured,
  onHideProduct,
  updatingFeaturedId,
  hidingId,
}) {
  const getStatusLabel = (status) => {
    switch (status) {
      case "giving":
        return "Đang cho";
      case "processing":
        return "Đang giao dịch";
      case "given":
        return "Đã cho";
      case "hidden":
        return "Đã ẩn";
      default:
        return status || "Không xác định";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "giving":
        return "bg-green-50 text-green-700 border-green-100";

      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "given":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "hidden":
        return "bg-gray-100 text-gray-500 border-gray-200";

      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {products.length > 0 ? (
        products.map((product) => {
          const isUpdatingFeatured = updatingFeaturedId === product._id;
          const isHiding = hidingId === product._id;

          return (
            <div
              key={product._id}
              onClick={() => onProductClick?.(product)}
              className="
                group
                relative
                bg-white
                border
                border-gray-200
                rounded-2xl
                overflow-hidden
                cursor-pointer
                transition-all
                duration-200
                hover:border-gray-300
                hover:shadow-md
              "
            >
              <div className="flex min-h-[210px]">
                {/* ================= IMAGE ================= */}
                <div className="w-[250px] flex-shrink-0 p-5">
                  <div className="relative w-full h-[170px]">
                    {product.images?.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="
                          w-full
                          h-full
                          object-cover
                          rounded-xl
                          border
                          border-gray-200
                          bg-gray-100
                        "
                      />
                    ) : (
                      <div
                        className="
                          w-full
                          h-full
                          rounded-xl
                          bg-gray-100
                          border
                          border-gray-200
                          flex
                          items-center
                          justify-center
                          text-gray-400
                          text-3xl
                        "
                      >
                        📦
                      </div>
                    )}

                    {/* FEATURED BADGE */}
                    {product.featured && (
                      <div
                        className="
                          absolute
                          top-2
                          left-2
                          inline-flex
                          items-center
                          gap-1
                          px-2.5
                          py-1
                          rounded-lg
                          bg-[#fff3d1]
                          text-[#9a6700]
                          text-xs
                          font-bold
                          shadow-sm
                        "
                      >
                        ★ Ưu tiên
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= CONTENT ================= */}
                <div className="flex-1 min-w-0 py-5 pr-5">
                  <div className="h-full flex flex-col">
                    {/* HEADER */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3
                          className="
                            text-[19px]
                            font-bold
                            text-red-600
                            leading-6
                            truncate
                          "
                        >
                          {product.title}
                        </h3>

                        <div className="mt-2">
                          <span
                            className={`
                              inline-flex
                              items-center
                              px-2.5
                              py-1.5
                              rounded-lg
                              border
                              text-xs
                              font-semibold
                              ${getStatusClass(product.status)}
                            `}
                          >
                            {getStatusLabel(product.status)}
                          </span>
                        </div>
                      </div>

                      {/* VIEW DETAIL */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProductClick?.(product);
                        }}
                        className="
                          flex-shrink-0
                          px-3.5
                          py-2
                          rounded-lg
                          border
                          border-gray-200
                          bg-white
                          text-sm
                          font-medium
                          text-gray-700
                          hover:bg-gray-50
                          hover:border-gray-300
                          transition
                        "
                      >
                        Xem chi tiết
                      </button>
                    </div>

                    {/* INFORMATION */}
                    <div
                      className="
                        mt-6
                        grid
                        grid-cols-4
                        gap-x-8
                        gap-y-4
                        max-w-[850px]
                      "
                    >
                      {/* CATEGORY */}
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">Danh mục</p>

                        <p className="text-sm font-medium text-gray-700 truncate">
                          {product.category?.name || "Không xác định"}
                        </p>
                      </div>

                      {/* LOCATION */}
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">Vị trí</p>

                        <p className="text-sm font-medium text-gray-700 truncate">
                          {product.address?.province || "-"}
                        </p>

                        {product.address?.district && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {product.address.district}
                          </p>
                        )}
                      </div>

                      {/* STATUS */}
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">
                          Trạng thái
                        </p>

                        <span
                          className={`
                            inline-flex
                            items-center
                            px-2.5
                            py-1.5
                            rounded-lg
                            border
                            text-xs
                            font-semibold
                            ${getStatusClass(product.status)}
                          `}
                        >
                          {getStatusLabel(product.status)}
                        </span>
                      </div>

                      {/* DATE */}
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">
                          Ngày đăng
                        </p>

                        <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* ================= ACTIONS ================= */}
                    <div
                      className="
                        mt-auto
                        pt-5
                        flex
                        justify-end
                        items-center
                        gap-2
                        border-t
                        border-gray-100
                      "
                    >
                      {/* ĐẶT NỔI BẬT */}
                      <button
                        type="button"
                        disabled={
                          isUpdatingFeatured || product.status === "hidden"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFeatured?.(product);
                        }}
                        className={`
                          min-w-[145px]
                          h-10
                          px-4
                          rounded-lg
                          text-sm
                          font-semibold
                          transition
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          ${
                            product.featured
                              ? "bg-[#ffba00] text-gray-900 hover:bg-[#eaaa00]"
                              : "bg-[#fff8e6] text-[#8a5c00] hover:bg-[#fff0c7]"
                          }
                        `}
                      >
                        {isUpdatingFeatured
                          ? "Đang cập nhật..."
                          : product.featured
                            ? "★ Bỏ nổi bật"
                            : "★ Đặt nổi bật"}
                      </button>

                      {/* ẨN BÀI VIẾT */}
                      {product.status !== "hidden" && (
                        <button
                          type="button"
                          disabled={isHiding || product.status === "processing"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onHideProduct?.(product);
                          }}
                          className="
                            min-w-[130px]
                            h-10
                            px-4
                            rounded-lg
                            bg-gray-100
                            text-gray-700
                            text-sm
                            font-semibold
                            hover:bg-red-50
                            hover:text-red-600
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                        >
                          {isHiding ? "Đang ẩn..." : "Ẩn bài viết"}
                        </button>
                      )}

                      {/* ĐÃ ẨN */}
                      {product.status === "hidden" && (
                        <span
                          className="
                            inline-flex
                            items-center
                            h-10
                            px-4
                            rounded-lg
                            bg-gray-100
                            text-gray-500
                            text-sm
                            font-medium
                          "
                        >
                          Bài viết đã ẩn
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div
          className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            px-5
            py-16
            text-center
          "
        >
          <div
            className="
              w-12
              h-12
              mx-auto
              rounded-xl
              bg-gray-100
              flex
              items-center
              justify-center
              text-xl
            "
          >
            📦
          </div>

          <p className="mt-3 font-semibold text-gray-900">
            Không tìm thấy sản phẩm
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Thử thay đổi từ khóa hoặc bộ lọc.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductTable;
