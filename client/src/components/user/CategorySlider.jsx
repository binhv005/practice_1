import { useEffect, useRef, useState } from "react";

function CategorySlider({ categories, selectedCategory, onCategoryChange }) {
  /*
   * ========================================
   * MÀU ICON
   * ========================================
   */
  const iconColors = [
    {
      icon: "text-blue-500",
      bg: "bg-blue-50",
      hoverBg: "group-hover/category:bg-blue-100",
    },
    {
      icon: "text-violet-500",
      bg: "bg-violet-50",
      hoverBg: "group-hover/category:bg-violet-100",
    },
    {
      icon: "text-emerald-500",
      bg: "bg-emerald-50",
      hoverBg: "group-hover/category:bg-emerald-100",
    },
    {
      icon: "text-orange-500",
      bg: "bg-orange-50",
      hoverBg: "group-hover/category:bg-orange-100",
    },
    {
      icon: "text-pink-500",
      bg: "bg-pink-50",
      hoverBg: "group-hover/category:bg-pink-100",
    },
    {
      icon: "text-cyan-500",
      bg: "bg-cyan-50",
      hoverBg: "group-hover/category:bg-cyan-100",
    },
    {
      icon: "text-amber-500",
      bg: "bg-amber-50",
      hoverBg: "group-hover/category:bg-amber-100",
    },
    {
      icon: "text-indigo-500",
      bg: "bg-indigo-50",
      hoverBg: "group-hover/category:bg-indigo-100",
    },
    {
      icon: "text-rose-500",
      bg: "bg-rose-50",
      hoverBg: "group-hover/category:bg-rose-100",
    },
  ];

  /*
   * ========================================
   * REFS
   * ========================================
   */
  const sliderRef = useRef(null);
  const trackRef = useRef(null);
  const listRef = useRef(null);

  const animationRef = useRef(null);
  const positionRef = useRef(0);
  const lastTimeRef = useRef(null);
  const isPausedRef = useRef(false);
  const listWidthRef = useRef(0);

  const [listWidth, setListWidth] = useState(0);

  /*
   * ========================================
   * ĐO CHIỀU RỘNG LIST
   * ========================================
   */
  useEffect(() => {
    const updateWidth = () => {
      if (!listRef.current) return;

      const width = listRef.current.offsetWidth;

      listWidthRef.current = width;
      setListWidth(width);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);

    if (listRef.current) {
      resizeObserver.observe(listRef.current);
    }

    window.addEventListener("resize", updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [categories]);

  /*
   * ========================================
   * AUTO SLIDE
   * ========================================
   */
  useEffect(() => {
    if (!trackRef.current || !listWidth) return;

    const speed = 45;

    const animate = (currentTime) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;

      lastTimeRef.current = currentTime;

      if (!isPausedRef.current) {
        positionRef.current -= (speed * deltaTime) / 1000;

        if (Math.abs(positionRef.current) >= listWidthRef.current) {
          positionRef.current += listWidthRef.current;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(
            ${positionRef.current}px,
            0,
            0
          )`;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      lastTimeRef.current = null;
    };
  }, [listWidth]);

  /*
   * ========================================
   * HOVER
   * ========================================
   */
  const handleMouseEnter = () => {
    isPausedRef.current = true;
  };

  const handleMouseLeave = () => {
    isPausedRef.current = false;
    lastTimeRef.current = null;
  };

  /*
   * ========================================
   * RENDER CATEGORY
   * ========================================
   */
  const renderCategory = (category, index, clone = false) => {
    const isActive = selectedCategory === category.name;

    const Icon = category.icon;

    const color = iconColors[index % iconColors.length];

    return (
      <button
        key={`${clone ? "clone" : "main"}-${index}`}
        type="button"
        onClick={() => onCategoryChange(category.name)}
        aria-label={`Chọn danh mục ${category.name}`}
        aria-pressed={isActive}
        className={`
          group/category
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
          outline-none
          transition-all
          duration-300
          ease-out
          focus-visible:ring-2
          focus-visible:ring-[#ffba00]
          focus-visible:ring-offset-2

          ${
            isActive
              ? `
                border-[#ffba00]
                bg-yellow-50
                shadow-[0_4px_14px_rgba(255,186,0,0.15)]
                -translate-y-0.5
              `
              : `
                border-gray-100
                bg-white
                hover:-translate-y-1
                hover:border-yellow-200
                hover:bg-yellow-50/50
                hover:shadow-md
              `
          }
        `}
      >
        <span
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            transition-all
            duration-300
            ${color.bg}
            ${color.icon}

            ${
              isActive
                ? `
                  scale-105
                  ring-2
                  ring-[#ffba00]/20
                `
                : `
                  ${color.hoverBg}
                  group-hover/category:scale-105
                `
            }
          `}
        >
          <Icon size={24} strokeWidth={1.8} />
        </span>

        <span
          className={`
            mt-3
            whitespace-nowrap
            text-xs
            font-medium
            transition-colors
            duration-300

            ${
              isActive
                ? "text-gray-950"
                : "text-gray-600 group-hover/category:text-gray-950"
            }
          `}
        >
          {category.name}
        </span>

        <span
          className={`
            mt-2
            h-1
            rounded-full
            bg-[#ffba00]
            transition-all
            duration-300
            ${isActive ? "w-5 opacity-100" : "w-0 opacity-0"}
          `}
        />
      </button>
    );
  };

  return (
    <div
      ref={sliderRef}
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* LEFT FADE */}
      <div
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          z-10
          h-full
          w-8
          bg-gradient-to-r
          from-white
          to-transparent
          sm:w-12
        "
      />

      {/* VIEWPORT */}
      <div
        className="
          relative
          w-full
          overflow-hidden
          py-2
        "
      >
        {/* TRACK */}
        <div
          ref={trackRef}
          className="
            flex
            w-max
            select-none
          "
          style={{
            transform: "translate3d(0, 0, 0)",
          }}
        >
          {/* LIST 1 */}
          <div
            ref={listRef}
            className="
              flex
              shrink-0
              gap-4
              pr-4
            "
          >
            {categories.map((category, index) =>
              renderCategory(category, index, false),
            )}
          </div>

          {/* LIST 2 */}
          <div
            className="
              flex
              shrink-0
              gap-4
              pr-4
            "
            aria-hidden="true"
          >
            {categories.map((category, index) =>
              renderCategory(category, index, true),
            )}
          </div>
        </div>
      </div>

      {/* RIGHT FADE */}
      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          z-10
          h-full
          w-8
          bg-gradient-to-l
          from-white
          to-transparent
          sm:w-12
        "
      />
    </div>
  );
}

export default CategorySlider;
