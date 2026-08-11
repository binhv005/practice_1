import HO_CHI_MINH_WARDS from "../../constants/hoChiMinhWards";

function ProductFilter({ filters, setFilters, categories }) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFilters({
      keyword: "",
      category: "",
      status: "",
      province: "",
    });
  };

  const hasFilter =
    filters.keyword || filters.category || filters.status || filters.province;

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      {/* SEARCH HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Tìm kiếm & lọc</h2>

          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Tìm nhanh sản phẩm theo tên, danh mục hoặc khu vực
          </p>
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={handleReset}
            className="
              self-start
              text-sm
              font-medium
              text-gray-500
              hover:text-gray-900
              transition
            "
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <span
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-400
            text-lg
          "
        >
          ⌕
        </span>

        <input
          type="text"
          name="keyword"
          value={filters.keyword}
          onChange={handleChange}
          placeholder="Tìm theo tên sản phẩm hoặc mô tả..."
          className="
            w-full
            h-11
            bg-gray-50
            border border-gray-200
            rounded-xl
            pl-11
            pr-4
            text-sm
            text-gray-900
            placeholder:text-gray-400
            outline-none
            transition
            focus:bg-white
            focus:border-[#ffba00]
            focus:ring-4
            focus:ring-[#ffba00]/10
          "
        />
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        {/* CATEGORY */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Danh mục
          </label>

          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="
              w-full
              h-10
              px-3
              bg-white
              border border-gray-200
              rounded-xl
              text-sm
              text-gray-700
              outline-none
              focus:border-[#ffba00]
              focus:ring-4
              focus:ring-[#ffba00]/10
            "
          >
            <option value="">Tất cả danh mục</option>

            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* STATUS */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Trạng thái
          </label>

          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="
              w-full
              h-10
              px-3
              bg-white
              border border-gray-200
              rounded-xl
              text-sm
              text-gray-700
              outline-none
              focus:border-[#ffba00]
              focus:ring-4
              focus:ring-[#ffba00]/10
            "
          >
            <option value="">Tất cả trạng thái</option>
            <option value="giving">Đang cho</option>
            <option value="processing">Đang giao dịch</option>
            <option value="given">Đã cho</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>

        {/* LOCATION */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Địa điểm
          </label>

          <select
            name="ward"
            value={filters.ward}
            onChange={handleChange}
            className="
      w-full
      h-10
      px-3
      bg-white
      border border-gray-200
      rounded-xl
      text-sm
      text-gray-700
      outline-none
      focus:border-[#ffba00]
      focus:ring-4
      focus:ring-[#ffba00]/10
    "
          >
            <option value="">Tất cả phường</option>

            {HO_CHI_MINH_WARDS.map((ward) => (
              <option key={ward} value={ward}>
                {ward}
              </option>
            ))}
          </select>
        </div>

        {/* RESET */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleReset}
            className="
              w-full
              h-10
              px-4
              rounded-xl
              border border-gray-200
              bg-gray-50
              text-gray-700
              text-sm
              font-semibold
              hover:bg-gray-100
              transition
            "
          >
            ↻ Đặt lại
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductFilter;
