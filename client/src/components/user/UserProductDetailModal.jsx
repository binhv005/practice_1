import { useEffect, useState } from "react";

function UserProductDetailModal({ product, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?._id]);

  if (!product) return null;

  const images = Array.isArray(product.images) ? product.images : [];

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev < images.length - 1 ? prev + 1 : prev,
    );
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
          max-w-4xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* =================================================
            HEADER
        ================================================= */}

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
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Chi tiết sản phẩm
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Thông tin công khai của sản phẩm
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-900
            "
          >
            ✕
          </button>
        </header>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="overflow-y-auto">
          <div className="p-5 sm:p-6">
            {/* =================================================
                IMAGE + SUMMARY
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                gap-6
                lg:grid-cols-[1.05fr_0.95fr]
              "
            >
              {/* IMAGE */}

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
                    <img
                      src={images[currentImageIndex]}
                      alt={product.title || "Sản phẩm"}
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
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
                      <span className="text-4xl">📦</span>

                      <span className="mt-2 text-sm">Chưa có hình ảnh</span>
                    </div>
                  )}

                  {/* PREVIOUS */}

                  {hasMultipleImages && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={currentImageIndex === 0}
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
                        text-2xl
                        text-gray-700
                        shadow-md
                        transition
                        hover:bg-white
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                      "
                    >
                      ‹
                    </button>
                  )}

                  {/* NEXT */}

                  {hasMultipleImages && (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={currentImageIndex === images.length - 1}
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
                        text-2xl
                        text-gray-700
                        shadow-md
                        transition
                        hover:bg-white
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                      "
                    >
                      ›
                    </button>
                  )}

                  {/* COUNTER */}

                  {hasMultipleImages && (
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
                  )}
                </div>

                {/* THUMBNAILS */}

                {hasMultipleImages && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setCurrentImageIndex(index)}
                        className={`
                          relative
                          aspect-square
                          overflow-hidden
                          rounded-xl
                          border-2
                          ${
                            currentImageIndex === index
                              ? "border-[#ffba00]"
                              : "border-gray-200"
                          }
                        `}
                      >
                        <img
                          src={image}
                          alt={`Ảnh ${index + 1}`}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SUMMARY */}

              <div>
                {product.featured && (
                  <span
                    className="
                      inline-flex
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

                <h1
                  className="
                    mt-3
                    text-2xl
                    font-bold
                    leading-tight
                    text-gray-900
                    sm:text-3xl
                  "
                >
                  {product.title || "Không có tên sản phẩm"}
                </h1>

                {/* CATEGORY */}

                <InfoRow label="Danh mục" value={categoryName || "Khác"} />

                {/* LOCATION */}

                <InfoRow
                  label="Khu vực"
                  value={
                    product.address?.ward
                      ? `${product.address.ward}${
                          product.address?.province
                            ? `, ${product.address.province}`
                            : ""
                        }`
                      : product.address?.province || "Không xác định"
                  }
                />

                {/* DATE */}

                <InfoRow
                  label="Ngày đăng"
                  value={
                    product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString("vi-VN")
                      : "-"
                  }
                />

                {/* FREE */}

                <div className="mt-6">
                  <span
                    className="
                      inline-flex
                      rounded-xl
                      bg-yellow-50
                      px-4
                      py-2
                      text-sm
                      font-bold
                      text-gray-800
                    "
                  >
                    Miễn phí
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

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
                {product.description || "Người đăng chưa cung cấp mô tả."}
              </p>
            </section>

            {/* =================================================
                PUBLIC INFORMATION
            ================================================= */}

            <section className="mt-6">
              <h3 className="mb-3 font-bold text-gray-900">
                Thông tin sản phẩm
              </h3>

              <div className="overflow-hidden rounded-xl border border-gray-200">
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
                        {categoryName || "Khác"}
                      </td>
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="bg-gray-50 px-4 py-3 font-medium text-gray-500">
                        Khu vực
                      </td>

                      <td className="px-4 py-3 text-gray-900">
                        {product.address?.ward ||
                          product.address?.province ||
                          "Không xác định"}
                      </td>
                    </tr>

                    <tr>
                      <td className="bg-gray-50 px-4 py-3 font-medium text-gray-500">
                        Lượt quan tâm
                      </td>

                      <td className="px-4 py-3 text-gray-900">
                        {product.interestCount ?? 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* =================================================
                CLOSE
            ================================================= */}

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

// =========================================================
// INFO ROW
// =========================================================

function InfoRow({ label, value }) {
  return (
    <div className="mt-5">
      <p className="text-xs text-gray-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

export default UserProductDetailModal;
