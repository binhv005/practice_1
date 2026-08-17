import { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarDays,
} from "lucide-react";

function UserProductDetailModal({ product, isSaved = false, onSave, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?._id]);

  if (!product) {
    return null;
  }

  const images = Array.isArray(product.images)
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  const productId = product._id || product.id;

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleSave = () => {
    if (onSave && productId) {
      onSave(productId);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        p-3
        backdrop-blur-sm
        sm:p-6
      "
      onClick={onClose}
    >
      <div
        className="
          flex
          max-h-[94vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <header
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            px-5
            py-4
            sm:px-6
          "
        >
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Chi tiết sản phẩm
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Thông tin sản phẩm được chia sẻ
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-900
            "
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* BODY */}
        <div className="overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div
              className="
                grid
                grid-cols-1
                gap-6
                lg:grid-cols-[1.05fr_0.95fr]
              "
            >
              {/* ================= IMAGE ================= */}
              <div>
                <div
                  className="
                    relative
                    aspect-[4/3]
                    overflow-hidden
                    rounded-2xl
                    bg-gray-100
                  "
                >
                  {hasImages ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={`${product.title || "Sản phẩm"} - Ảnh ${
                          currentImageIndex + 1
                        }`}
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />

                      {hasMultipleImages && (
                        <>
                          {/* PREVIOUS */}
                          <button
                            type="button"
                            onClick={handlePreviousImage}
                            aria-label="Ảnh trước"
                            className="
                              absolute
                              left-3
                              top-1/2
                              flex
                              h-10
                              w-10
                              -translate-y-1/2
                              items-center
                              justify-center
                              rounded-full
                              bg-white/90
                              text-gray-700
                              shadow-md
                              transition
                              hover:scale-105
                              hover:bg-white
                            "
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          {/* NEXT */}
                          <button
                            type="button"
                            onClick={handleNextImage}
                            aria-label="Ảnh tiếp theo"
                            className="
                              absolute
                              right-3
                              top-1/2
                              flex
                              h-10
                              w-10
                              -translate-y-1/2
                              items-center
                              justify-center
                              rounded-full
                              bg-white/90
                              text-gray-700
                              shadow-md
                              transition
                              hover:scale-105
                              hover:bg-white
                            "
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>

                          {/* COUNTER */}
                          <div
                            className="
                              absolute
                              bottom-3
                              left-1/2
                              -translate-x-1/2
                              rounded-full
                              bg-black/60
                              px-3
                              py-1
                              text-xs
                              font-medium
                              text-white
                            "
                          >
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        flex-col
                        items-center
                        justify-center
                        text-gray-400
                      "
                    >
                      <span className="text-5xl">📦</span>

                      <span className="mt-2 text-sm">Chưa có hình ảnh</span>
                    </div>
                  )}
                </div>

                {/* THUMBNAILS */}
                {hasMultipleImages && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => handleThumbnailClick(index)}
                        className={`
                          relative
                          aspect-square
                          overflow-hidden
                          rounded-xl
                          border-2
                          transition
                          ${
                            currentImageIndex === index
                              ? "border-[#ffba00] ring-2 ring-[#ffba00]/20"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <img
                          src={image}
                          alt={`Ảnh ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ================= INFO ================= */}
              <div>
                {/* CATEGORY */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="
                      rounded-lg
                      bg-yellow-50
                      px-2.5
                      py-1.5
                      text-xs
                      font-semibold
                      text-[#9a6700]
                    "
                  >
                    {categoryName || "Khác"}
                  </span>

                  {product.featured && (
                    <span
                      className="
                        rounded-lg
                        bg-[#fff3d1]
                        px-2.5
                        py-1.5
                        text-xs
                        font-bold
                        text-[#9a6700]
                      "
                    >
                      ★ Nổi bật
                    </span>
                  )}
                </div>

                {/* TITLE */}
                <h1
                  className="
                    mt-4
                    text-2xl
                    font-bold
                    leading-tight
                    text-gray-900
                    sm:text-3xl
                  "
                >
                  {product.title || "Không có tên sản phẩm"}
                </h1>

                {/* LOCATION */}
                {(product.address?.ward || product.address?.province) && (
                  <div className="mt-5 flex items-start gap-2">
                    <MapPin
                      className="
                        mt-0.5
                        h-5
                        w-5
                        shrink-0
                        text-[#ffba00]
                      "
                    />

                    <div>
                      <p className="text-xs text-gray-400">Vị trí</p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {product.address?.ward
                          ? `${product.address.ward}${
                              product.address?.province
                                ? `, ${product.address.province}`
                                : ""
                            }`
                          : product.address?.province}
                      </p>
                    </div>
                  </div>
                )}

                {/* DATE */}
                {product.createdAt && (
                  <div className="mt-4 flex items-start gap-2">
                    <CalendarDays
                      className="
                        mt-0.5
                        h-5
                        w-5
                        shrink-0
                        text-gray-400
                      "
                    />

                    <div>
                      <p className="text-xs text-gray-400">Ngày đăng</p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {new Date(product.createdAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* SAVE */}
                <button
                  type="button"
                  onClick={handleSave}
                  className={`
                    mt-7
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    text-sm
                    font-semibold
                    transition
                    ${
                      isSaved
                        ? "bg-yellow-100 text-[#9a6700] hover:bg-yellow-200"
                        : "bg-[#ffba00] text-gray-950 hover:bg-[#eaaa00]"
                    }
                  `}
                >
                  <svg
                    className="h-5 w-5"
                    fill={isSaved ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.5 4.5A2.5 2.5 0 019 2h6a2.5 2.5 0 012.5 2.5V21L12 18.2 6.5 21V4.5z"
                    />
                  </svg>

                  {isSaved ? "Đã lưu sản phẩm" : "Lưu sản phẩm"}
                </button>
              </div>
            </div>

            {/* ================= DESCRIPTION ================= */}
            <section
              className="
                mt-6
                rounded-2xl
                border
                border-gray-100
                bg-gray-50
                p-5
              "
            >
              <h3 className="font-bold text-gray-900">Mô tả sản phẩm</h3>

              <p
                className="
                  mt-3
                  whitespace-pre-wrap
                  text-sm
                  leading-7
                  text-gray-600
                "
              >
                {product.description ||
                  "Người đăng chưa cung cấp mô tả cho sản phẩm này."}
              </p>
            </section>

            {/* ================= PRODUCT INFO ================= */}
            <section className="mt-6">
              <h3 className="mb-3 font-bold text-gray-900">
                Thông tin sản phẩm
              </h3>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="w-1/3 bg-gray-50 px-4 py-3 font-medium text-gray-500">
                        Tên sản phẩm
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-900">
                        {product.title || "Không xác định"}
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="bg-gray-50 px-4 py-3 font-medium text-gray-500">
                        Danh mục
                      </td>

                      <td className="px-4 py-3 text-gray-900">
                        {categoryName || "Không xác định"}
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="bg-gray-50 px-4 py-3 font-medium text-gray-500">
                        Trạng thái
                      </td>

                      <td className="px-4 py-3 text-gray-900">
                        {product.status === "giving"
                          ? "Đang cho"
                          : product.status === "processing"
                            ? "Đang xử lý"
                            : product.status === "given"
                              ? "Đã cho"
                              : product.status === "hidden"
                                ? "Đã ẩn"
                                : "Không xác định"}
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="bg-gray-50 px-4 py-3 font-medium text-gray-500">
                        Tỉnh / Thành phố
                      </td>

                      <td className="px-4 py-3 text-gray-900">
                        {product.address?.province || "Không xác định"}
                      </td>
                    </tr>

                    <tr>
                      <td className="bg-gray-50 px-4 py-3 font-medium text-gray-500">
                        Phường
                      </td>

                      <td className="px-4 py-3 text-gray-900">
                        {product.address?.ward || "Không xác định"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ================= GIVER ================= */}
            {(product.giver?.fullname || product.giver?.name) && (
              <section className="mt-6">
                <h3 className="mb-3 font-bold text-gray-900">Người cho</h3>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="font-semibold text-gray-900">
                    {product.giver?.fullname || product.giver?.name}
                  </p>

                  {product.giver?.email && (
                    <p className="mt-1 text-sm text-gray-500">
                      {product.giver.email}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* CLOSE */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="
                  h-10
                  rounded-xl
                  bg-gray-900
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProductDetailModal;
