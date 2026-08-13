export default function ProductCard({
  product,
  isSaved = false,
  onSave,
  onClick,
}) {
  const image = product.images?.[0] || product.image || null;

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const productId = product._id || product.id;

  // =========================================================
  // SAVE
  // =========================================================

  const handleSaveClick = (event) => {
    // Không cho click nút lưu kích hoạt onClick của card
    event.stopPropagation();

    if (onSave && productId) {
      onSave(productId);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <article
      onClick={onClick}
      className="
        group
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={product.title || "Sản phẩm"}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-105
            "
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Chưa có hình ảnh
          </div>
        )}

        {/* =================================================
            FEATURED
        ================================================= */}

        {product.featured && (
          <span
            className="
              absolute
              left-2
              top-2
              rounded-lg
              bg-[#ffba00]
              px-2
              py-1
              text-[10px]
              font-bold
              text-gray-950
            "
          >
            NỔI BẬT
          </span>
        )}

        {/* =================================================
            SAVE BUTTON
        ================================================= */}

        <button
          type="button"
          aria-label={isSaved ? "Bỏ lưu" : "Lưu tin"}
          onClick={(event) => {
            event.stopPropagation();
            onSave(productId);
          }}
          className={`
    absolute
    right-2
    top-2
    flex
    items-center
    gap-1.5
    rounded-lg
    px-2
    py-1.5
    text-xs
    font-semibold
    shadow-sm
    backdrop-blur
    transition
    ${
      isSaved
        ? "bg-white/90 text-[#ffba00] hover:bg-white"
        : "bg-white/90 text-gray-600 hover:bg-white hover:text-gray-950"
    }
  `}
        >
          <svg
            className="h-4 w-4"
            fill={isSaved ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.5 4.5A2.5 2.5 0 019 2h6a2.5 2.5 0 012.5 2.5V21L12 18.2 6.5 21V4.5z"
            />
          </svg>

          <span>{isSaved ? "Đã lưu" : "Lưu"}</span>
        </button>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="p-3.5">
        {/* TITLE */}

        <h3
          className="
            line-clamp-2
            min-h-[40px]
            text-sm
            font-semibold
            leading-5
            text-gray-900
          "
        >
          {product.title || "Không có tên sản phẩm"}
        </h3>

        {/* CATEGORY */}

        <p className="mt-2 text-xs text-gray-400">{categoryName || "Khác"}</p>

        {/* LOCATION */}

        {(product.address?.province || product.address?.ward) && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"
              />

              <circle cx="12" cy="10" r="2.2" />
            </svg>

            <span className="truncate">
              {product.address?.ward || product.address?.province}
            </span>
          </div>
        )}

        {/* BOTTOM */}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className="
              shrink-0
              rounded-lg
              bg-yellow-50
              px-2
              py-1
              text-[11px]
              font-semibold
              text-gray-700
            "
          >
            Miễn phí
          </span>

          {product.interestCount !== undefined && (
            <span className="truncate text-[11px] text-gray-400">
              {product.interestCount} lượt quan tâm
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
