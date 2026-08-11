function ProductCreateModal({
  productForm,
  categories,
  selectedImages,
  previewImages,
  uploading,
  creating,
  handleChange,
  handleAddressChange,
  handleImageChange,
  handleUploadImages,
  handleCreateProduct,
  handleCloseCreateForm,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/50
        backdrop-blur-[2px]
        flex
        items-center
        justify-center
        p-3
        sm:p-6
      "
      onClick={handleCloseCreateForm}
    >
      <div
        className="
          bg-white
          w-full
          max-w-3xl
          max-h-[94vh]
          rounded-2xl
          shadow-2xl
          overflow-hidden
          flex
          flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Đăng tin mới
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Thêm sản phẩm muốn chia sẻ vào hệ thống
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseCreateForm}
            disabled={creating || uploading}
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
              disabled:opacity-50
            "
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-6 space-y-7">
            {/* BASIC INFORMATION */}
            <section>
              <div className="mb-4">
                <h3 className="font-bold text-gray-900">Thông tin sản phẩm</h3>

                <p className="text-xs text-gray-500 mt-1">
                  Cung cấp thông tin cơ bản của sản phẩm.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* TITLE */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={productForm.title}
                    onChange={handleChange}
                    placeholder="Ví dụ: Bàn học gỗ còn mới"
                    required
                    className="
                      w-full
                      h-11
                      px-3.5
                      rounded-xl
                      border border-gray-200
                      text-sm
                      outline-none
                      focus:border-[#ffba00]
                      focus:ring-4
                      focus:ring-[#ffba00]/10
                    "
                  />
                </div>

                {/* CATEGORY */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Danh mục <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      h-11
                      px-3.5
                      rounded-xl
                      border border-gray-200
                      bg-white
                      text-sm
                      outline-none
                      focus:border-[#ffba00]
                      focus:ring-4
                      focus:ring-[#ffba00]/10
                    "
                  >
                    <option value="">Chọn danh mục</option>

                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PROVINCE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="province"
                    value={productForm.address.province}
                    onChange={handleAddressChange}
                    placeholder="TP. Hồ Chí Minh"
                    required
                    className="
                      w-full
                      h-11
                      px-3.5
                      rounded-xl
                      border border-gray-200
                      text-sm
                      outline-none
                      focus:border-[#ffba00]
                      focus:ring-4
                      focus:ring-[#ffba00]/10
                    "
                  />
                </div>

                {/* DISTRICT */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Quận / Huyện <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="district"
                    value={productForm.address.district}
                    onChange={handleAddressChange}
                    placeholder="Thủ Đức"
                    required
                    className="
                      w-full
                      h-11
                      px-3.5
                      rounded-xl
                      border border-gray-200
                      text-sm
                      outline-none
                      focus:border-[#ffba00]
                      focus:ring-4
                      focus:ring-[#ffba00]/10
                    "
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Mô tả sản phẩm <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleChange}
                    rows={5}
                    required
                    placeholder="Mô tả tình trạng, đặc điểm và thông tin cần thiết..."
                    className="
                      w-full
                      px-3.5
                      py-3
                      rounded-xl
                      border border-gray-200
                      text-sm
                      resize-none
                      outline-none
                      focus:border-[#ffba00]
                      focus:ring-4
                      focus:ring-[#ffba00]/10
                    "
                  />
                </div>
              </div>
            </section>

            {/* IMAGE */}
            <section className="border-t border-gray-100 pt-6">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900">Hình ảnh sản phẩm</h3>

                <p className="text-xs text-gray-500 mt-1">
                  Tối đa 10 ảnh · JPG, PNG hoặc WEBP · mỗi ảnh tối đa 5MB
                </p>
              </div>

              {/* UPLOAD AREA */}
              <label
                htmlFor="product-images"
                className="
                  group
                  block
                  border-2
                  border-dashed
                  border-gray-200
                  rounded-2xl
                  p-7
                  sm:p-9
                  text-center
                  cursor-pointer
                  bg-gray-50
                  hover:bg-[#fffaf0]
                  hover:border-[#ffba00]
                  transition
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    mx-auto
                    rounded-xl
                    bg-white
                    border
                    border-gray-200
                    flex
                    items-center
                    justify-center
                    text-xl
                    group-hover:border-[#ffba00]
                  "
                >
                  +
                </div>

                <p className="mt-3 font-semibold text-gray-800">
                  Chọn ảnh sản phẩm
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Nhấn để chọn nhiều ảnh cùng lúc
                </p>

                <input
                  id="product-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* PREVIEW */}
              {previewImages.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-800">
                      Ảnh đã chọn
                    </p>

                    <span className="text-xs text-gray-400">
                      {previewImages.length}/10
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="
                            w-full
                            h-full
                            object-cover
                            rounded-xl
                            border
                            border-gray-200
                          "
                        />

                        {index === 0 && (
                          <span
                            className="
                              absolute
                              left-1.5
                              bottom-1.5
                              px-1.5
                              py-1
                              rounded-md
                              bg-[#ffba00]
                              text-gray-900
                              text-[9px]
                              font-bold
                            "
                          >
                            Ảnh chính
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UPLOAD BUTTON */}
              <button
                type="button"
                onClick={handleUploadImages}
                disabled={selectedImages.length === 0 || uploading}
                className="
                  mt-4
                  w-full
                  sm:w-auto
                  px-5
                  h-10
                  rounded-xl
                  bg-gray-900
                  hover:bg-gray-800
                  text-white
                  text-sm
                  font-semibold
                  transition
                  disabled:bg-gray-200
                  disabled:text-gray-400
                  disabled:cursor-not-allowed
                "
              >
                {uploading
                  ? "Đang tải ảnh lên..."
                  : selectedImages.length > 0
                    ? `Tải lên ${selectedImages.length} ảnh`
                    : "Tải ảnh lên"}
              </button>

              {/* SUCCESS */}
              {productForm.images.length > 0 && (
                <div className="mt-4 flex items-center gap-3 p-3.5 rounded-xl bg-green-50 border border-green-100">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Upload thành công
                    </p>

                    <p className="text-xs text-green-700 mt-0.5">
                      {productForm.images.length} ảnh đã được lưu.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* FOOTER */}
          <div
            className="
              sticky
              bottom-0
              bg-white
              border-t
              border-gray-200
              px-5
              sm:px-6
              py-3.5
              flex
              flex-col-reverse
              sm:flex-row
              sm:justify-end
              gap-2.5
            "
          >
            <button
              type="button"
              onClick={handleCloseCreateForm}
              disabled={creating || uploading}
              className="
                h-10
                px-5
                rounded-xl
                border border-gray-200
                text-gray-700
                text-sm
                font-semibold
                hover:bg-gray-50
                transition
                disabled:opacity-50
              "
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={creating || productForm.images.length === 0}
              className="
                h-10
                px-6
                rounded-xl
                bg-[#ffba00]
                hover:bg-[#eaaa00]
                text-gray-900
                text-sm
                font-bold
                transition
                disabled:bg-gray-200
                disabled:text-gray-400
                disabled:cursor-not-allowed
              "
            >
              {creating ? "Đang đăng tin..." : "Đăng tin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductCreateModal;
