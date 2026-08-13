import { useEffect, useState } from "react";

function ProductDetailModal({
  detailProduct,
  loadingDetail,
  updatingFeatured,
  hiding,
  getStatusLabel,
  getStatusClass,
  handleToggleFeatured,
  handleHideProduct,
  onClose,
}) {
  // IMAGE GALLERY

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Khi đổi sang sản phẩm khác -> quay về ảnh đầu tiên
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [detailProduct?._id]);

  const images = detailProduct?.images || [];

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => {
      if (prev === 0) {
        return 0;
      }

      return prev - 1;
    });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => {
      if (prev === images.length - 1) {
        return prev;
      }

      return prev + 1;
    });
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/60
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-3
        sm:p-6
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          rounded-2xl
          shadow-2xl
          w-full
          max-w-5xl
          max-h-[94vh]
          overflow-hidden
          flex
          flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <header className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Chi tiết sản phẩm
            </h2>

            {detailProduct?.featured && (
              <p className="text-xs text-[#9a6700] mt-1">
                ★ Sản phẩm đang được ưu tiên
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              w-9
              h-9
              rounded-xl
              flex
              items-center
              justify-center
              text-gray-400
              hover:text-gray-900
              hover:bg-gray-100
              transition
            "
          >
            ✕
          </button>
        </header>

        {/* BODY */}
        <div className="overflow-y-auto">
          {loadingDetail || !detailProduct ? (
            <div className="py-20 text-center">
              <div
                className="
                  w-8
                  h-8
                  border-[3px]
                  border-gray-200
                  border-t-[#ffba00]
                  rounded-full
                  animate-spin
                  mx-auto
                "
              />

              <p className="mt-4 text-sm text-gray-500">
                Đang tải thông tin sản phẩm...
              </p>
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              {/* TOP */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
                <div>
                  {/* MAIN IMAGE */}
                  <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
                    {hasImages ? (
                      <>
                        <img
                          src={images[currentImageIndex]}
                          alt={`${detailProduct.title} - Ảnh ${
                            currentImageIndex + 1
                          }`}
                          className="
                            w-full
                            h-full
                            object-cover
                            transition-opacity
                            duration-200
                          "
                        />

                        {/* PREVIOUS BUTTON */}
                        {hasMultipleImages && (
                          <button
                            type="button"
                            onClick={handlePreviousImage}
                            disabled={currentImageIndex === 0}
                            aria-label="Ảnh trước"
                            className="
                              absolute
                              left-3
                              top-1/2
                              -translate-y-1/2
                              w-10
                              h-10
                              rounded-full
                              bg-white/90
                              shadow-md
                              flex
                              items-center
                              justify-center
                              text-2xl
                              text-gray-700
                              transition
                              hover:bg-white
                              hover:scale-105
                              disabled:opacity-30
                              disabled:cursor-not-allowed
                              disabled:hover:scale-100
                            "
                          >
                            ‹
                          </button>
                        )}

                        {/* NEXT BUTTON */}
                        {hasMultipleImages && (
                          <button
                            type="button"
                            onClick={handleNextImage}
                            disabled={currentImageIndex === images.length - 1}
                            aria-label="Ảnh tiếp theo"
                            className="
                              absolute
                              right-3
                              top-1/2
                              -translate-y-1/2
                              w-10
                              h-10
                              rounded-full
                              bg-white/90
                              shadow-md
                              flex
                              items-center
                              justify-center
                              text-2xl
                              text-gray-700
                              transition
                              hover:bg-white
                              hover:scale-105
                              disabled:opacity-30
                              disabled:cursor-not-allowed
                              disabled:hover:scale-100
                            "
                          >
                            ›
                          </button>
                        )}

                        {/* IMAGE COUNTER */}
                        {hasMultipleImages && (
                          <div
                            className="
                              absolute
                              bottom-3
                              left-1/2
                              -translate-x-1/2
                              px-3
                              py-1
                              rounded-full
                              bg-black/60
                              text-white
                              text-xs
                              font-medium
                            "
                          >
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <span className="text-4xl">📦</span>

                        <span className="text-sm mt-2">Chưa có hình ảnh</span>
                      </div>
                    )}
                  </div>

                  {/* THUMBNAILS */}
                  {hasMultipleImages && (
                    <div className="mt-3">
                      <div className="grid grid-cols-5 gap-2">
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
                              className="
                                w-full
                                h-full
                                object-cover
                              "
                            />

                            {/* SELECTED OVERLAY */}
                            {currentImageIndex === index && (
                              <div className="absolute inset-0 bg-black/10" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/*SUMMARY*/}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`
                        inline-flex
                        px-2.5
                        py-1.5
                        rounded-lg
                        border
                        text-xs
                        font-semibold
                        ${getStatusClass(detailProduct.status)}
                      `}
                    >
                      {getStatusLabel(detailProduct.status)}
                    </span>

                    {detailProduct.featured && (
                      <span className="px-2.5 py-1.5 rounded-lg bg-[#fff3d1] text-[#9a6700] text-xs font-bold">
                        ★ Ưu tiên
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mt-4 leading-tight">
                    {detailProduct.title}
                  </h1>

                  <div className="mt-6 space-y-4">
                    <InfoRow
                      label="Danh mục"
                      value={detailProduct.category?.name || "Không xác định"}
                    />

                    <InfoRow
                      label="Vị trí"
                      value={
                        detailProduct.address?.ward
                          ? `${detailProduct.address.ward}, ${
                              detailProduct.address?.province || ""
                            }`
                          : detailProduct.address?.province || "Không xác định"
                      }
                    />

                    <InfoRow
                      label="Ngày đăng"
                      value={
                        detailProduct.createdAt
                          ? new Date(
                              detailProduct.createdAt,
                            ).toLocaleDateString("vi-VN")
                          : "-"
                      }
                    />
                  </div>

                  {/* ADMIN ACTIONS */}
                  <div className="mt-7 pt-6 border-t border-gray-100">
                    <p className="text-sm font-bold text-gray-900 mb-3">
                      Thao tác quản trị
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={handleToggleFeatured}
                        disabled={updatingFeatured}
                        className={`
                          h-10
                          rounded-xl
                          text-sm
                          font-semibold
                          transition
                          disabled:opacity-50
                          ${
                            detailProduct.featured
                              ? "bg-[#ffba00] text-gray-900 hover:bg-[#eaaa00]"
                              : "bg-[#fff8e6] text-[#8a5c00] hover:bg-[#fff0c7]"
                          }
                        `}
                      >
                        {updatingFeatured
                          ? "Đang cập nhật..."
                          : detailProduct.featured
                            ? "★ Bỏ ưu tiên"
                            : "★ Đánh dấu ưu tiên"}
                      </button>

                      {detailProduct.status !== "hidden" && (
                        <button
                          type="button"
                          onClick={handleHideProduct}
                          disabled={
                            hiding || detailProduct.status === "processing"
                          }
                          className="
                            h-10
                            rounded-xl
                            bg-gray-100
                            text-gray-700
                            hover:bg-red-50
                            hover:text-red-600
                            text-sm
                            font-semibold
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                        >
                          {hiding ? "Đang ẩn..." : "Ẩn bài viết"}
                        </button>
                      )}
                    </div>

                    {detailProduct.status === "processing" && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <p className="text-xs text-amber-700 leading-5">
                          Sản phẩm đang có giao dịch phát sinh nên không thể ẩn
                          trực tiếp.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* DESCRIPTION */}
              <section className="mt-6 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-gray-900">Mô tả sản phẩm</h3>

                <p className="mt-3 text-sm text-gray-600 leading-7 whitespace-pre-wrap">
                  {detailProduct.description ||
                    "Không có mô tả cho sản phẩm này."}
                </p>
              </section>
              {/* PRODUCT INFO */}
              <section className="mt-6">
                <h3 className="font-bold text-gray-900 mb-3">
                  Thông tin sản phẩm
                </h3>

                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="w-1/3 px-4 py-3 font-medium text-gray-500 bg-gray-50">
                          Tên sản phẩm
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {detailProduct.title || "Không xác định"}
                        </td>
                      </tr>

                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-500 bg-gray-50">
                          Danh mục
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {detailProduct.category?.name || "Không xác định"}
                        </td>
                      </tr>

                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-500 bg-gray-50">
                          Trạng thái
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {getStatusLabel(detailProduct.status)}
                        </td>
                      </tr>

                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-500 bg-gray-50">
                          Tỉnh / Thành phố
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {detailProduct.address?.province || "Không xác định"}
                        </td>
                      </tr>

                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-500 bg-gray-50">
                          Phường
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {detailProduct.address?.ward || "Không xác định"}
                        </td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-500 bg-gray-50">
                          Ưu tiên
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {detailProduct.featured
                            ? "Đang được ưu tiên"
                            : "Không"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
              {/* GIVER INFO */}
              <section className="mt-6 border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-900 mb-3">
                  Thông tin người cho
                </h3>

                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="w-1/3 px-4 py-3 font-medium text-gray-500 bg-gray-50">
                          Họ tên
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {detailProduct.giver?.fullname ||
                            detailProduct.giver?.name ||
                            "Không có thông tin"}
                        </td>
                      </tr>

                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-500 bg-gray-50">
                          Email
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {detailProduct.giver?.email || "Không có thông tin"}
                        </td>
                      </tr>

                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-500 bg-gray-50">
                          Số điện thoại
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {detailProduct.giver?.phone || "Không có thông tin"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
              {/* CLOSE */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    h-10
                    px-6
                    rounded-xl
                    bg-gray-900
                    hover:bg-gray-800
                    text-white
                    text-sm
                    font-semibold
                  "
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>

      <p className="text-sm font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
      <p className="text-xs text-gray-400">{label}</p>

      <p className="mt-1.5 text-sm font-semibold text-gray-800 break-words">
        {value}
      </p>
    </div>
  );
}

export default ProductDetailModal;
