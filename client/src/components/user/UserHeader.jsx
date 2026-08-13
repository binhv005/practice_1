import { useState } from "react";
import { NavLink } from "react-router-dom";

import mockCurrentUser from "../../data/mockUsers";
import HO_CHI_MINH_WARDS from "../../constants/hoChiMinhWards";

function UserHeader({
  keyword = "",
  setKeyword = () => {},
  selectedWard = "",
  setSelectedWard = () => {},
  onSearch = () => {},
  onCreatePost = () => {},
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);

  const categories = [
    { name: "Tất cả danh mục", icon: "▦" },
    { name: "Điện thoại", icon: "📱" },
    { name: "Laptop", icon: "💻" },
    { name: "Đồ điện tử", icon: "🎧" },
    { name: "Đồ gia dụng", icon: "🏠" },
    { name: "Thời trang", icon: "👕" },
    { name: "Sách", icon: "📚" },
    { name: "Đồ dùng học tập", icon: "✏️" },
    { name: "Khác", icon: "•••" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();

    onSearch({
      keyword: keyword.trim(),
      ward: selectedWard,
    });
  };

  return (
    <header className="relative z-50 w-full overflow-visible bg-[#ffba00]">
      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <div
        className="
          relative
          z-20
          mx-auto
          flex
          min-h-[76px]
          w-full
          max-w-[1440px]
          items-center
          gap-2
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =====================================================
            HAMBURGER
        ===================================================== */}

        <div
          className="relative shrink-0"
          onMouseEnter={() => setCategoryOpen(true)}
          onMouseLeave={() => setCategoryOpen(false)}
        >
          <button
            type="button"
            aria-label="Danh mục"
            className="
              group
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white
              text-gray-700
              shadow-sm
              transition-all
              duration-200
              hover:bg-yellow-50
              hover:text-gray-950
              hover:shadow
            "
          >
            <svg
              className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path strokeLinecap="round" d="M4 6h16" />
              <path strokeLinecap="round" d="M4 12h16" />
              <path strokeLinecap="round" d="M4 18h16" />
            </svg>
          </button>

          {/* CATEGORY DROPDOWN */}

          {categoryOpen && (
            <div
              className="
                absolute
                left-0
                top-[46px]
                w-[270px]
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-2
                shadow-2xl
              "
            >
              <div className="px-3 pb-2 pt-2">
                <p className="text-sm font-bold text-gray-900">Danh mục</p>

                <p className="mt-1 text-xs text-gray-400">
                  Khám phá các món đồ được chia sẻ
                </p>
              </div>

              {categories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    transition
                    hover:bg-yellow-50
                  "
                >
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-gray-50
                      text-sm
                    "
                  >
                    {category.icon}
                  </span>

                  <span className="text-sm font-medium text-gray-700">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =====================================================
            LOGO
        ===================================================== */}

        <NavLink
          to="/"
          className="
            flex
            h-10
            shrink-0
            items-center
            rounded-xl
            bg-white
            px-4
            font-sans
            text-[21px]
            font-extrabold
            tracking-[-0.04em]
            text-[#ffba00]
            shadow-sm
            transition
            hover:bg-gray-50
          "
        >
          Donate
        </NavLink>

        {/* =====================================================
            USER SERVICE
        ===================================================== */}

        <div
          className="relative shrink-0"
          onMouseEnter={() => setServiceOpen(true)}
          onMouseLeave={() => setServiceOpen(false)}
        >
          <button
            type="button"
            className="
              flex
              h-10
              items-center
              gap-1.5
              whitespace-nowrap
              rounded-xl
              px-3
              text-sm
              font-medium
              text-gray-900
              transition
              hover:bg-black/5
            "
          >
            Dành cho người dùng
            <svg
              className={`
                h-5
                w-5
                transition-transform
                ${serviceOpen ? "rotate-180" : ""}
              `}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 9l6 6 6-6"
              />
            </svg>
          </button>

          {/* SERVICE MENU */}

          {serviceOpen && (
            <div
              className="
                absolute
                left-0
                top-[46px]
                w-[260px]
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-2
                shadow-2xl
              "
            >
              <NavLink
                to="/"
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  transition
                  hover:bg-yellow-50
                "
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50">
                  👤
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Dành cho người dùng
                  </p>

                  <p className="text-xs text-gray-400">Khám phá và chia sẻ</p>
                </div>
              </NavLink>

              <NavLink
                to="/my-products"
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  transition
                  hover:bg-yellow-50
                "
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                  📋
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Quản lý tin
                  </p>

                  <p className="text-xs text-gray-400">
                    Quản lý sản phẩm của bạn
                  </p>
                </div>
              </NavLink>

              <button
                type="button"
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  transition
                  hover:bg-yellow-50
                "
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50">
                  ⭐
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">Gói Pro</p>

                  <p className="text-xs text-gray-400">Nâng cấp trải nghiệm</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav className="flex flex-1 items-center justify-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) => `
              flex
              h-10
              items-center
              whitespace-nowrap
              px-2
              text-sm
              transition
              ${
                isActive
                  ? "font-semibold text-gray-950"
                  : "font-medium text-gray-800 hover:text-gray-950"
              }
            `}
          >
            Trang chủ
          </NavLink>

          <NavLink
            to="/posts"
            className={({ isActive }) => `
              flex
              h-10
              items-center
              whitespace-nowrap
              px-2
              text-sm
              transition
              ${
                isActive
                  ? "font-semibold text-gray-950"
                  : "font-medium text-gray-800 hover:text-gray-950"
              }
            `}
          >
            Bài viết
          </NavLink>
        </nav>

        {/* =====================================================
            SAVED
        ===================================================== */}

        <button
          type="button"
          title="Tin đã lưu"
          aria-label="Tin đã lưu"
          className="
            group
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-white
            text-gray-700
            shadow-sm
            transition-all
            duration-200
            hover:bg-yellow-50
            hover:text-gray-950
            hover:shadow
          "
        >
          <svg
            className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.5 4.5A2.5 2.5 0 019 2h6a2.5 2.5 0 012.5 2.5V21L12 18.2 6.5 21V4.5z"
            />
          </svg>
        </button>

        {/* =====================================================
            NOTIFICATION
        ===================================================== */}

        <button
          type="button"
          title="Thông báo"
          aria-label="Thông báo"
          className="
            group
            relative
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-white
            text-gray-700
            shadow-sm
            transition-all
            duration-200
            hover:bg-yellow-50
            hover:text-gray-950
            hover:shadow
          "
        >
          <svg
            className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 10a6 6 0 00-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8"
            />

            <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h4" />
          </svg>

          <span
            className="
              absolute
              right-1
              top-1
              h-1.5
              w-1.5
              rounded-full
              bg-red-500
              ring-2
              ring-white
            "
          />
        </button>

        {/* =====================================================
            MESSAGE
        ===================================================== */}

        <button
          type="button"
          title="Tin nhắn"
          aria-label="Tin nhắn"
          className="
            flex
            h-10
            min-w-[104px]
            shrink-0
            items-center
            justify-center
            whitespace-nowrap
            rounded-xl
            bg-white
            px-4
            text-sm
            font-medium
            text-gray-900
            shadow-sm
            transition
            hover:bg-gray-50
            hover:shadow
          "
        >
          <svg
            className="mr-1.5 h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 8h10M7 12h6"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 11.5a8 8 0 01-8 8 7.96 7.96 0 01-3.4-.76L4 20l1.26-3.48A8 8 0 1112 3.5a8 8 0 018 8z"
            />
          </svg>
          Tin nhắn
        </button>

        <button
          type="button"
          onClick={onCreatePost}
          className="
    flex
    h-10
    shrink-0
    items-center
    justify-center
    gap-1.5
    whitespace-nowrap
    rounded-xl
    bg-black
    px-4
    text-sm
    font-bold
    text-white
    shadow-sm
    transition
    hover:bg-gray-800
    hover:shadow
  "
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 5v14M5 12h14"
            />
          </svg>
          Đăng tin
        </button>

        {/* =====================================================
            LOGIN
        ===================================================== */}

        <button
          type="button"
          className="
            flex
            h-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-black
            px-4
            text-sm
            font-bold
            text-white
            transition
            hover:bg-gray-800
          "
        >
          Đăng nhập
        </button>

        {/* =====================================================
            USER
        ===================================================== */}

        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="Tài khoản"
            onClick={() => setUserOpen((prev) => !prev)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              overflow-hidden
              rounded-full
              bg-white
              text-gray-700
              shadow-sm
              transition
              hover:bg-gray-50
            "
          >
            {mockCurrentUser.avatar ? (
              <img
                src={mockCurrentUser.avatar}
                alt={mockCurrentUser.fullname}
                className="h-full w-full object-cover"
              />
            ) : (
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
                  d="M20 21a8 8 0 00-16 0"
                />

                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>

          {/* USER DROPDOWN */}

          {userOpen && (
            <div
              className="
                absolute
                right-0
                top-[46px]
                z-[100]
                w-[280px]
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-3
                shadow-2xl
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  border-b
                  border-gray-100
                  px-2
                  pb-3
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-yellow-100
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  {mockCurrentUser.fullname?.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {mockCurrentUser.fullname}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {mockCurrentUser.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="
                  mt-3
                  flex
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-900
                  transition
                  hover:border-gray-300
                  hover:bg-gray-50
                "
              >
                Tạo tài khoản
              </button>

              <button
                type="button"
                className="
                  mt-2
                  flex
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-black
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          SEARCH SECTION
      ===================================================== */}

      {/* =====================================================
    SEARCH SECTION
===================================================== */}

      <div
        className="
    relative
    z-10
    flex
    w-full
    justify-center
    px-4
    pb-8
    pt-5
    sm:px-6
  "
      >
        <form
          onSubmit={handleSearch}
          className="
      flex
      w-full
      max-w-[850px]
      items-center
      rounded-2xl
      bg-white
      p-1.5
      shadow-lg
      ring-1
      ring-black/5
    "
        >
          {/* SEARCH ICON */}

          <div className="flex h-12 w-12 shrink-0 items-center justify-center text-gray-400">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="6.5" />

              <path strokeLinecap="round" d="M16 16l4 4" />
            </svg>
          </div>

          {/* INPUT */}

          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="
        h-12
        min-w-0
        flex-1
        border-none
        bg-transparent
        px-1
        text-sm
        text-gray-900
        outline-none
        placeholder:text-gray-400
      "
          />

          {/* LOCATION */}

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setWardOpen((prev) => !prev)}
              className="
          flex
          h-11
          items-center
          gap-2
          rounded-xl
          px-3
          text-sm
          font-medium
          text-gray-700
          transition
          hover:bg-gray-50
        "
            >
              {/* LOCATION ICON */}

              <svg
                className="h-[18px] w-[18px] shrink-0 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"
                />

                <circle cx="12" cy="10" r="2.2" />
              </svg>

              {/* SELECTED WARD */}

              <span className="max-w-[120px] truncate">
                {selectedWard || "Khu vực"}
              </span>

              {/* ARROW */}

              <svg
                className={`h-4 w-4 transition-transform ${
                  wardOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </button>

            {/* WARD DROPDOWN */}

            {wardOpen && (
              <div
                className="
            absolute
            right-0
            top-[50px]
            z-[100]
            w-[260px]
            overflow-hidden
            rounded-2xl
            border
            border-gray-100
            bg-white
            shadow-2xl
          "
              >
                {/* HEADER */}

                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-bold text-gray-900">
                    Chọn khu vực
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Tìm sản phẩm gần bạn
                  </p>
                </div>

                {/* ALL */}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedWard("");
                    setWardOpen(false);
                  }}
                  className="
              flex
              w-full
              items-center
              justify-between
              px-4
              py-3
              text-left
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-yellow-50
            "
                >
                  <span>Tất cả khu vực</span>

                  {!selectedWard && (
                    <svg
                      className="h-4 w-4 text-[#ffba00]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {/* WARDS */}

                <div className="max-h-[300px] overflow-y-auto p-1">
                  {HO_CHI_MINH_WARDS.map((ward) => (
                    <button
                      key={ward}
                      type="button"
                      onClick={() => {
                        setSelectedWard(ward);
                        setWardOpen(false);
                      }}
                      className={`
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  transition
                  ${
                    selectedWard === ward
                      ? "bg-yellow-50 font-semibold text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
                    >
                      <span>{ward}</span>

                      {selectedWard === ward && (
                        <svg
                          className="h-4 w-4 text-[#ffba00]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DIVIDER */}

          <div className="mx-1 h-7 w-px bg-gray-200" />

          {/* SEARCH BUTTON */}

          <button
            type="submit"
            className="
        flex
        h-12
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-black
        px-7
        text-sm
        font-bold
        text-white
        transition
        hover:bg-gray-800
      "
          >
            Tìm kiếm
          </button>
        </form>
      </div>
    </header>
  );
}

export default UserHeader;
