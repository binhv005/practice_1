import ProductCard from "../products/ProductCard";
function RecommendedProducts({ products = [], userAddress }) {
  if (!userAddress?.province && !userAddress?.ward) {
    return null;
  }

  // Lọc sản phẩm theo khu vực
  const recommendedProducts = products.filter((product) => {
    const productProvince = product.address?.province;
    const productWard = product.address?.ward;

    const sameProvince =
      userAddress.province && productProvince === userAddress.province;

    const sameWard = userAddress.ward && productWard === userAddress.ward;

    return sameWard || sameProvince;
  });

  return (
    <section className="mt-16">
      {/* HEADER */}
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold leading-7 text-gray-900">
              Dành cho bạn
            </h2>

            <span
              className="
                rounded-full
                bg-yellow-50
                px-2.5
                py-1
                text-[11px]
                font-semibold
                text-yellow-700
              "
            >
              Gần bạn
            </span>
          </div>

          <p className="mt-2 text-sm leading-5 text-gray-500">
            Sản phẩm được chia sẻ tại khu vực của bạn
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
            <svg
              className="h-3.5 w-3.5"
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

            <span>{userAddress.ward || userAddress.province}</span>
          </div>
        </div>

        <button
          type="button"
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
          Xem thêm
        </button>
      </div>

      {/* KHÔNG CÓ SẢN PHẨM */}
      {recommendedProducts.length === 0 ? (
        <div
          className="
            flex
            min-h-[220px]
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
          <div>
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-yellow-50
                text-2xl
              "
            >
              📍
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              Chưa có sản phẩm phù hợp
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Hiện chưa có tin đăng nào trong khu vực của bạn.
            </p>
          </div>
        </div>
      ) : (
        /* PRODUCT GRID */
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
          {recommendedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default RecommendedProducts;
