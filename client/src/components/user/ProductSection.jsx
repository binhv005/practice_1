import ProductCard from "./ProductCard";

function ProductSection({
  title,
  subtitle,
  products,
  showViewAll = false,
  onViewAll,
}) {
  return (
    <section className="mt-14">
      {/* SECTION HEADER */}

      <div
        className="
          mb-7
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <h2 className="text-xl font-bold leading-7 text-gray-900">{title}</h2>

          <p className="mt-2 text-sm leading-5 text-gray-500">{subtitle}</p>
        </div>

        {showViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="
              self-start
              rounded-lg
              px-3
              py-2
              text-sm
              font-medium
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-900
              sm:self-auto
            "
          >
            Xem tất cả
          </button>
        )}
      </div>

      {/* PRODUCT GRID */}

      {products.length > 0 ? (
        <div
          className="
            grid
            grid-cols-2
            gap-x-4
            gap-y-6
            sm:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
          "
        >
          {products.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div
      className="
        flex
        min-h-[260px]
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

      <p className="mt-2 max-w-md text-sm leading-5 text-gray-500">
        Thử thay đổi từ khóa tìm kiếm hoặc chọn một danh mục khác.
      </p>
    </div>
  );
}

export default ProductSection;
