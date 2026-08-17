import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import headerBg from "../../assets/screen.png";
import HO_CHI_MINH_WARDS from "../../constants/hoChiMinhWards";
import {
  LayoutGrid,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Shirt,
  BookOpen,
  Pencil,
  MoreHorizontal,
  User,
  ClipboardList,
  Sparkles,
  LogOut,
  Settings,
  Shield,
  Menu,
  X,
  Bell,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import { logoutApi, getMeApi } from "../../api/authApi";
import { useUnreadMessages } from "../../contexts/UnreadMessagesContext";
import { useToast } from "../../contexts/ToastContext";

function UserHeader({
  keyword = "",
  setKeyword = () => {},
  selectedWard = "",
  setSelectedWard = () => {},
  onSearch = () => {},
  onCreatePost = () => {},
  onCategoryChange = () => {},
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Unread messages
  const { unreadCount } = useUnreadMessages();

  // Check user đăng nhập khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra localStorage trước
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          setIsLoggedIn(true);

          // Verify với server
          try {
            const response = await getMeApi();
            if (response.data.success) {
              setCurrentUser(response.data.user);
              localStorage.setItem("user", JSON.stringify(response.data.user));
            }
          } catch (error) {
            // Token hết hạn hoặc không hợp lệ
            console.error("Token expired or invalid");
            localStorage.removeItem("user");
            setCurrentUser(null);
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error("Check auth error:", error);
      }
    };

    checkAuth();
  }, []);

  const categories = [
    { name: "Tất cả", icon: LayoutGrid },
    { name: "Điện thoại", icon: Smartphone },
    { name: "Laptop", icon: Laptop },
    { name: "Đồ điện tử", icon: Headphones },
    { name: "Đồ gia dụng", icon: Home },
    { name: "Thời trang", icon: Shirt },
    { name: "Sách", icon: BookOpen },
    { name: "Đồ dùng học tập", icon: Pencil },
    { name: "Khác", icon: MoreHorizontal },
  ];

  const handleSearch = (e) => {
    e.preventDefault();

    onSearch({
      keyword: keyword.trim(),
      ward: selectedWard,
    });
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    const confirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất?");

    if (!confirmed) return;

    try {
      setLoggingOut(true);

      await logoutApi();

      // Xóa user info trong localStorage
      localStorage.removeItem("user");

      // Update state
      setCurrentUser(null);
      setIsLoggedIn(false);

      // Đóng dropdown
      setUserOpen(false);
      setMobileMenuOpen(false);

      // Redirect về trang chủ
      navigate("/");

      // Thông báo thành công
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Đăng xuất thất bại. Vui lòng thử lại!");
    } finally {
      setLoggingOut(false);
    }
  };

  // Hiển thị role tiếng Việt
  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "moderator":
        return "Điều hành viên";
      case "user":
        return "Người dùng";
      default:
        return "Người dùng";
    }
  };

  // Lấy màu badge theo role
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "moderator":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "user":
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <header
      className="
    relative
    z-50
    w-full
    overflow-visible
    bg-cover
    bg-center
    bg-no-repeat
  "
      style={{
        backgroundImage: `url(${headerBg})`,
      }}
    >
      <div className="hidden lg:block">
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
          {/* Hamburger Menu */}
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
                  z-50
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

                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => {
                          onCategoryChange(category.name);
                          setCategoryOpen(false);
                        }}
                        className="
                          group
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-left
                          transition-all
                          duration-150
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
                            text-gray-500
                            transition
                            group-hover:bg-yellow-100
                            group-hover:text-[#d99d00]
                          "
                        >
                          <Icon size={17} strokeWidth={1.8} />
                        </span>
                        <span
                          className="
                            text-sm
                            font-medium
                            text-gray-700
                            transition
                            group-hover:text-gray-950
                          "
                        >
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Logo */}
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

          {/* User Service */}
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
                  z-50
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
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    transition
                    hover:bg-yellow-200
                  "
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-gray-50
                      text-gray-500
                      transition
                      group-hover:bg-yellow-100
                    "
                  >
                    <User size={18} strokeWidth={1.8} />
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
                    group
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
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-gray-50
                      text-gray-500
                      transition
                      group-hover:bg-yellow-100
                      group-hover:text-[#d99d00]
                    "
                  >
                    <ClipboardList size={18} strokeWidth={1.8} />
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
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    text-gray-500
                    transition
                    hover:bg-yellow-50
                  "
                >
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      transition
                      group-hover:bg-yellow-100
                    "
                  >
                    <Sparkles size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Gói Pro
                    </p>
                    <p className="text-xs text-gray-400">
                      Nâng cấp trải nghiệm
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
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

          {/* Saved */}
          <button
            type="button"
            onClick={() => navigate("/saved-products")}
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
            <Bookmark size={20} strokeWidth={1.4} />
          </button>

          {/* Notification */}
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
            <Bell size={20} strokeWidth={1.4} />
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

          {/* Message */}
          <NavLink
            to="/messages"
            title="Tin nhắn"
            aria-label="Tin nhắn"
            className="
              relative
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
            <MessageSquare size={18} strokeWidth={1.6} className="mr-1.5" />
            Tin nhắn
            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-5
                  min-w-[20px]
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  px-1.5
                  text-xs
                  font-bold
                  text-white
                  ring-2
                  ring-white
                "
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>

          {/* Đăng tin */}
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

          {/* Đăng nhập - Chỉ hiện khi CHƯA đăng nhập */}
          {!isLoggedIn && (
            <NavLink
              to="/login"
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
            </NavLink>
          )}

          {/* User Info - Hiện khi ĐÃ đăng nhập */}
          {isLoggedIn && currentUser && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser.fullname}
                </p>
                <span
                  className={`
                    mt-0.5
                    rounded-full
                    border
                    px-2
                    py-0.5
                    text-xs
                    font-medium
                    ${getRoleBadgeColor(currentUser.role)}
                  `}
                >
                  {getRoleLabel(currentUser.role)}
                </span>
              </div>
            </div>
          )}

          {/* User Avatar */}
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
                hover:ring-2
                hover:ring-yellow-200
              "
            >
              {isLoggedIn && currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullname}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={20} strokeWidth={1.8} />
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
                {isLoggedIn && currentUser ? (
                  <>
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
                        {currentUser.fullname?.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {currentUser.fullname}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {currentUser.email}
                        </p>
                        <span
                          className={`
                            mt-1.5
                            inline-block
                            rounded-full
                            border
                            px-2
                            py-0.5
                            text-xs
                            font-medium
                            ${getRoleBadgeColor(currentUser.role)}
                          `}
                        >
                          {getRoleLabel(currentUser.role)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                 {/*    <button
                        type="button"
                        onClick={() => {
                          setUserOpen(false);
                          navigate("/my-products");
                        }}
                        className="
                          group
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-left
                          transition
                          hover:bg-gray-50
                        "
                      >
                        <ClipboardList
                          size={18}
                          strokeWidth={1.8}
                          className="text-gray-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Tin của bạn
                        </span>
                      </button>*/}

                      <button
                        type="button"
                        onClick={() => {
                          setUserOpen(false);
                          navigate("/saved-products");
                        }}
                        className="
                          group
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-left
                          transition
                          hover:bg-gray-50
                        "
                      >
                        <Bookmark
                          size={18}
                          strokeWidth={1.8}
                          className="text-gray-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Tin đã lưu
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserOpen(false);
                          navigate("/settings");
                        }}
                        className="
                          group
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-left
                          transition
                          hover:bg-gray-50
                        "
                      >
                        <Settings
                          size={18}
                          strokeWidth={1.8}
                          className="text-gray-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Cài đặt tài khoản
                        </span>
                      </button>

                      {(currentUser.role === "admin" ||
                        currentUser.role === "moderator") && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserOpen(false);
                            navigate("/admin/dashboard");
                          }}
                          className="
                            group
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
                          <Shield
                            size={18}
                            strokeWidth={1.8}
                            className="text-yellow-600"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Trang quản trị
                          </span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="
                        mt-3
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-red-200
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-red-600
                        transition
                        hover:border-red-300
                        hover:bg-red-50
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {loggingOut ? (
                        <>
                          <span
                            className="
                              h-4
                              w-4
                              animate-spin
                              rounded-full
                              border-2
                              border-red-600
                              border-t-transparent
                            "
                          />
                          Đang đăng xuất...
                        </>
                      ) : (
                        <>
                          <LogOut size={16} strokeWidth={2} />
                          Đăng xuất
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
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
                          bg-gray-100
                          text-gray-500
                        "
                      >
                        <User size={20} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          Khách
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          Chưa đăng nhập
                        </p>
                      </div>
                    </div>

                    <NavLink
                      to="/register"
                      onClick={() => setUserOpen(false)}
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
                    </NavLink>

                    <NavLink
                      to="/login"
                      onClick={() => setUserOpen(false)}
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
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SEARCH BAR - DESKTOP */}
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

                <span className="max-w-[120px] truncate">
                  {selectedWard || "Khu vực"}
                </span>

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
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-bold text-gray-900">
                      Chọn khu vực
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Tìm sản phẩm gần bạn
                    </p>
                  </div>

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

            <div className="mx-1 h-7 w-px bg-gray-200" />

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
      </div>

      {/* =====================================================
          MOBILE HEADER (below lg)
      ===================================================== */}

      <div className="lg:hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Hamburger Menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white
              text-gray-700
              shadow-sm
              transition
              hover:bg-gray-50
            "
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>

          {/* Logo */}
          <NavLink
            to="/"
            className="
              flex
              h-10
              items-center
              rounded-xl
              bg-white
              px-4
              font-sans
              text-lg
              font-extrabold
              tracking-[-0.04em]
              text-[#ffba00]
              shadow-sm
            "
          >
            Donate
          </NavLink>

          {/* User Avatar */}
          <button
            type="button"
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
            {isLoggedIn && currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.fullname}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={20} strokeWidth={1.8} />
            )}
          </button>
        </div>

        {/* Search Bar - Mobile */}
        <div className="px-4 pb-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div
              className="
                flex
                flex-1
                items-center
                gap-2
                rounded-xl
                bg-white
                px-3
                py-2.5
                shadow-sm
              "
            >
              <svg
                className="h-5 w-5 shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path strokeLinecap="round" d="M16 16l4 4" />
              </svg>

              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm..."
                className="
                  min-w-0
                  flex-1
                  border-none
                  bg-transparent
                  text-sm
                  text-gray-900
                  outline-none
                  placeholder:text-gray-400
                "
              />
            </div>

            <button
              type="submit"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-black
                text-white
                shadow-sm
                transition
                hover:bg-gray-800
              "
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path strokeLinecap="round" d="M16 16l4 4" />
              </svg>
            </button>
          </form>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-[60] bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div
              className="
                fixed
                inset-y-0
                left-0
                z-[70]
                w-[280px]
                bg-white
                shadow-2xl
              "
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                  <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      text-gray-500
                      transition
                      hover:bg-gray-100
                    "
                  >
                    <X size={20} strokeWidth={1.8} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* User Info */}
                  {isLoggedIn && currentUser ? (
                    <div className="mb-4 rounded-xl bg-yellow-50 p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-yellow-100
                            font-bold
                            text-gray-900
                          "
                        >
                          {currentUser.fullname?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {currentUser.fullname}
                          </p>
                          <span
                            className={`
                              mt-1
                              inline-block
                              rounded-full
                              border
                              px-2
                              py-0.5
                              text-xs
                              font-medium
                              ${getRoleBadgeColor(currentUser.role)}
                            `}
                          >
                            {getRoleLabel(currentUser.role)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 space-y-2">
                      <NavLink
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="
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
                      </NavLink>
                      <NavLink
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="
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
                          hover:bg-gray-50
                        "
                      >
                        Tạo tài khoản
                      </NavLink>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="space-y-1">
                    <NavLink
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-sm
                        font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <Home size={18} strokeWidth={1.8} />
                      Trang chủ
                    </NavLink>

                    <NavLink
                      to="/posts"
                      onClick={() => setMobileMenuOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-sm
                        font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <BookOpen size={18} strokeWidth={1.8} />
                      Bài viết
                    </NavLink>

                    <NavLink
                      to="/my-products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-sm
                        font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <ClipboardList size={18} strokeWidth={1.8} />
                      Quản lý tin
                    </NavLink>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onCreatePost();
                      }}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-left
                        text-sm
                        font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <svg
                        className="h-[18px] w-[18px]"
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

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/saved-products");
                      }}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-left
                        text-sm
                        font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <Bookmark size={18} strokeWidth={1.8} />
                      Tin đã lưu
                    </button>

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
                        text-sm
                        font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <Bell size={18} strokeWidth={1.8} />
                      Thông báo
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/messages");
                      }}
                      className="
                        relative
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-left
                        text-sm
                        font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <MessageSquare size={18} strokeWidth={1.8} />
                      Tin nhắn
                      {unreadCount > 0 && (
                        <span
                          className="
                            ml-auto
                            flex
                            h-5
                            min-w-[20px]
                            items-center
                            justify-center
                            rounded-full
                            bg-red-500
                            px-1.5
                            text-xs
                            font-bold
                            text-white
                          "
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Categories */}
                  <div className="mt-6">
                    <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Danh mục
                    </p>
                    <div className="space-y-1">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.name}
                            type="button"
                            onClick={() => {
                              onCategoryChange(category.name);
                              setMobileMenuOpen(false);
                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-xl
                              px-3
                              py-2.5
                              text-left
                              text-sm
                              font-medium
                              text-gray-700
                              transition
                              hover:bg-yellow-50
                            "
                          >
                            <Icon size={17} strokeWidth={1.8} />
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Settings */}
                  {isLoggedIn && currentUser && (
                    <div className="mt-6">
                      <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Cài đặt
                      </p>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/settings");
                          }}
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            font-medium
                            text-gray-700
                            transition
                            hover:bg-gray-50
                          "
                        >
                          <Settings size={18} strokeWidth={1.8} />
                          Cài đặt tài khoản
                        </button>

                        {(currentUser.role === "admin" ||
                          currentUser.role === "moderator") && (
                          <button
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              navigate("/admin/dashboard");
                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-xl
                              px-3
                              py-2.5
                              text-left
                              text-sm
                              font-medium
                              text-gray-700
                              transition
                              hover:bg-yellow-50
                            "
                          >
                            <Shield size={18} strokeWidth={1.8} />
                            Trang quản trị
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            font-medium
                            text-red-600
                            transition
                            hover:bg-red-50
                            disabled:opacity-60
                          "
                        >
                          <LogOut size={18} strokeWidth={1.8} />
                          {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* User Dropdown - Mobile */}
        {userOpen && !mobileMenuOpen && (
          <div
            className="
              fixed
              right-4
              top-16
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
            {isLoggedIn && currentUser ? (
              <>
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
                    {currentUser.fullname?.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {currentUser.fullname}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {currentUser.email}
                    </p>
                    <span
                      className={`
                        mt-1.5
                        inline-block
                        rounded-full
                        border
                        px-2
                        py-0.5
                        text-xs
                        font-medium
                        ${getRoleBadgeColor(currentUser.role)}
                      `}
                    >
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserOpen(false);
                      navigate("/settings");
                    }}
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
                      hover:bg-gray-50
                    "
                  >
                    <Settings
                      size={18}
                      strokeWidth={1.8}
                      className="text-gray-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Cài đặt tài khoản
                    </span>
                  </button>

                  {(currentUser.role === "admin" ||
                    currentUser.role === "moderator") && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserOpen(false);
                        navigate("/admin/dashboard");
                      }}
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
                      <Shield
                        size={18}
                        strokeWidth={1.8}
                        className="text-yellow-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Trang quản trị
                      </span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="
                    mt-3
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-red-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-red-600
                    transition
                    hover:border-red-300
                    hover:bg-red-50
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loggingOut ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-red-600
                          border-t-transparent
                        "
                      />
                      Đang đăng xuất...
                    </>
                  ) : (
                    <>
                      <LogOut size={16} strokeWidth={2} />
                      Đăng xuất
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
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
                      bg-gray-100
                      text-gray-500
                    "
                  >
                    <User size={20} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">
                      Khách
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      Chưa đăng nhập
                    </p>
                  </div>
                </div>

                <NavLink
                  to="/register"
                  onClick={() => setUserOpen(false)}
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
                </NavLink>

                <NavLink
                  to="/login"
                  onClick={() => setUserOpen(false)}
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
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default UserHeader;
