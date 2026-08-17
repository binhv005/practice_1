import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, MessageCircle, X } from "lucide-react";

import { createConversation } from "../../services/messageApi";

function UserProductDetailModal({ product, onClose, isSaved = false, onSave }) {
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contacting, setContacting] = useState(false);

  /*
   * ==========================================
   * RESET IMAGE WHEN PRODUCT CHANGES
   * ==========================================
   */

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?._id]);

  /*
   * ==========================================
   * NO PRODUCT
   * ==========================================
   */

  if (!product) {
    return null;
  }

  /*
   * ==========================================
   * PRODUCT DATA
   * ==========================================
   */

  const images = Array.isArray(product.images)
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const productId = product._id || product.id;

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  /*
   * ==========================================
   * GIVER
   * ==========================================
   */

  const giver =
    product.giver ||
    product.seller ||
    product.user ||
    product.userId ||
    product.owner;

  const giverId = typeof giver === "object" ? giver?._id || giver?.id : giver;

  /*
   * ==========================================
   * CONTACT GIVER
   * ==========================================
   */

  const handleContactGiver = async () => {
    if (contacting) {
      return;
    }

    const savedUser = localStorage.getItem("user");
    let loggedInUserId = null;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        loggedInUserId = parsed?._id || parsed?.id;
      } catch (err) {
        console.error("Parse user error:", err);
      }
    }

    if (!loggedInUserId) {
      alert("Vui lòng đăng nhập để liên hệ với người đăng sản phẩm.");
      navigate("/login");
      return;
    }

    if (!giverId) {
      alert(
        "Không thể liên hệ người cho vì sản phẩm chưa xác định người đăng.",
      );
      return;
    }

    if (giverId.toString() === loggedInUserId.toString()) {
      alert("Bạn không thể gửi tin nhắn cho chính mình về sản phẩm này.");
      return;
    }

    try {
      setContacting(true);

      console.log("==========================================");
      console.log("Creating conversation with giver:", giverId);
      console.log("Product ID:", productId);

      /*
       * ======================================
       * CREATE / GET CONVERSATION
       * ======================================
       */

      const response = await createConversation(giverId, productId);

      console.log("CREATE CONVERSATION AXIOS RESPONSE:", response);

      const responseData = response?.data || response;

      console.log("CREATE CONVERSATION DATA:", responseData);

      const conversation = responseData?.conversation;

      console.log("CONVERSATION:", conversation);

      /*
       * ======================================
       * VALIDATE CONVERSATION
       * ======================================
       */

      if (!conversation?._id) {
        console.error("Invalid conversation response:", response);

        throw new Error("API tạo conversation không trả về conversation._id");
      }

      const conversationId = conversation._id;

      console.log("Conversation created successfully:", conversationId);

      /*
       * ======================================
       * CLOSE MODAL
       * ======================================
       */

      onClose?.();

      /*
       * ======================================
       * NAVIGATE TO MESSAGE PAGE
       * ======================================
       */

      navigate("/messages", {
        state: {
          conversationId,
          productId,
          product,
        },
      });
    } catch (error) {
      console.error("Contact giver error:", error);

      if (error?.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }

      const message =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Không thể mở cuộc trò chuyện. Vui lòng thử lại.";

      alert(message);
    } finally {
      setContacting(false);
    }
  };

  /*
   * ==========================================
   * IMAGE NAVIGATION
   * ==========================================
   */

  const handlePrevious = () => {
    if (!hasImages) {
      return;
    }

    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    if (!hasImages) {
      return;
    }

    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

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
        {/* ======================================
            HEADER
        ====================================== */}

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
            aria-label="Đóng"
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
            <X size={20} />
          </button>
        </header>

        {/* ======================================
            BODY
        ====================================== */}

        <div className="overflow-y-auto">
          <div className="p-5 sm:p-6">
            {/* ==================================
                IMAGE + SUMMARY
            ================================== */}

            <div
              className="
                grid
                grid-cols-1
                gap-6
                lg:grid-cols-[1.05fr_0.95fr]
              "
            >
              {/* =================================
                  IMAGE
              ================================= */}

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
                        hover:bg-white
                      "
                    >
                      <ChevronLeft size={22} />
                    </button>
                  )}

                  {/* NEXT */}

                  {hasMultipleImages && (
                    <button
                      type="button"
                      onClick={handleNext}
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
                        hover:bg-white
                      "
                    >
                      <ChevronRight size={22} />
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

                {/* =================================
                    THUMBNAILS
                ================================= */}

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
                            transition
                            ${
                              currentImageIndex === index
                                ? "border-[#ffba00]"
                                : "border-gray-200 hover:border-gray-300"
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

              {/* =================================
                  SUMMARY
              ================================= */}

              <div>
                {/* FEATURED */}

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

                {/* TITLE */}

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

                {/* =================================
                    CONTACT GIVER
                ================================= */}

                <button
                  type="button"
                  onClick={handleContactGiver}
                  disabled={contacting || !giverId}
                  className="
                    mt-5
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#ffba00]
                    px-5
                    text-sm
                    font-bold
                    text-gray-950
                    shadow-sm
                    transition
                    hover:bg-[#eaaa00]
                    hover:shadow-md
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <MessageCircle size={20} />

                  {contacting
                    ? "Đang mở cuộc trò chuyện..."
                    : "Liên hệ người cho"}
                </button>

                {!giverId && (
                  <p className="mt-2 text-center text-xs text-red-400">
                    Không xác định được người đăng sản phẩm.
                  </p>
                )}

                {/* =================================
                    SAVE
                ================================= */}

                {onSave && (
                  <button
                    type="button"
                    onClick={() => onSave(productId)}
                    className={`
                      mt-3
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
                          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <span className="text-lg">{isSaved ? "★" : "☆"}</span>

                    {isSaved ? "Đã lưu sản phẩm" : "Lưu sản phẩm"}
                  </button>
                )}
              </div>
            </div>

            {/* ==================================
                DESCRIPTION
            ================================== */}

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

            {/* ==================================
                PRODUCT INFORMATION
            ================================== */}

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

            {/* ==================================
                GIVER
            ================================== */}

            {giver && (
              <section className="mt-6">
                <h3 className="mb-3 font-bold text-gray-900">Người cho</h3>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    p-4
                  "
                >
                  {giver.avatar ? (
                    <img
                      src={giver.avatar}
                      alt={giver.fullname || "Người cho"}
                      className="
                        h-11
                        w-11
                        rounded-full
                        object-cover
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        bg-[#ffba00]
                        font-bold
                      "
                    >
                      {(giver.fullname || "N").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-gray-900">
                      {giver.fullname || "Người dùng"}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Người đăng sản phẩm
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================
                CLOSE
            ================================== */}

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

/*
 * ============================================
 * INFO ROW
 * ============================================
 */

function InfoRow({ label, value }) {
  return (
    <div className="mt-5">
      <p className="text-xs text-gray-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

export default UserProductDetailModal;
