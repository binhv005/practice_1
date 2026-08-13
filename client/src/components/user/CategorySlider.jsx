function CategorySlider({ categories, selectedCategory, onCategoryChange }) {
  const scroll = (direction) => {
    const container = document.getElementById("category-slider");

    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {/* LEFT */}

      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Danh mục trước"
        className="
          absolute
          left-0
          top-1/2
          z-10
          hidden
          h-9
          w-9
          -translate-x-1/2
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-gray-100
          bg-white
          text-gray-700
          shadow-md
          transition
          hover:bg-gray-50
          hover:text-gray-950
          lg:flex
        "
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 18l-6-6 6-6"
          />
        </svg>
      </button>

      {/* CATEGORY LIST */}

      <div
        id="category-slider"
        className="
          flex
          w-full
          gap-4
          overflow-x-auto
          scroll-smooth
          px-1
          pb-3
          scrollbar-hide
        "
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category.name;

          return (
            <button
              key={category.name}
              type="button"
              onClick={() => onCategoryChange(category.name)}
              className={`
                group
                flex
                min-h-[112px]
                min-w-[120px]
                shrink-0
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                px-4
                py-5
                transition-all
                duration-200

                ${
                  isActive
                    ? "border-[#ffba00] bg-yellow-50 shadow-sm"
                    : "border-gray-100 bg-white hover:-translate-y-0.5 hover:border-yellow-200 hover:bg-yellow-50/50 hover:shadow-sm"
                }
              `}
            >
              {/* ICON */}

              <span
                className={`
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  text-xl
                  transition

                  ${
                    isActive
                      ? "bg-[#ffba00]/20"
                      : "bg-gray-50 group-hover:bg-yellow-100"
                  }
                `}
              >
                {category.icon}
              </span>

              {/* NAME */}

              <span
                className={`
                  mt-3
                  whitespace-nowrap
                  text-xs
                  font-medium

                  ${isActive ? "text-gray-950" : "text-gray-600"}
                `}
              >
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* RIGHT */}

      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Danh mục tiếp theo"
        className="
          absolute
          right-0
          top-1/2
          z-10
          hidden
          h-9
          w-9
          translate-x-1/2
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-gray-100
          bg-white
          text-gray-700
          shadow-md
          transition
          hover:bg-gray-50
          hover:text-gray-950
          lg:flex
        "
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 18l6-6-6-6"
          />
        </svg>
      </button>
    </div>
  );
}

export default CategorySlider;
