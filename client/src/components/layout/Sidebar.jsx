import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Tổng quan",
    path: "/dashboard",
    icon: "⌂",
  },
  {
    label: "Sản phẩm",
    path: "admin/products",
    icon: "▣",
  },
  {
    label: "Chiến dịch",
    path: "/campaigns",
    icon: "◈",
  },
  {
    label: "Người dùng",
    path: "/users",
    icon: "♙",
  },
];

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* LOGO */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div
            className="
              w-10 h-10
              rounded-xl
              bg-[#F9C74F]
              flex items-center justify-center
              text-gray-900
              font-bold
              shadow-sm
            "
          >
            D
          </div>

          <div>
            <h1 className="text-base font-bold text-[#1F2937]">Donate Admin</h1>

            <p className="text-xs text-[#64748B] mt-0.5">Quản trị hệ thống</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4">
        <p className="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
          Quản lý
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center gap-3
                px-3 py-2.5
                rounded-xl
                text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? `
                      bg-[#FFF8E1]
                      text-[#1F2937]
                      font-semibold
                    `
                    : `
                      text-[#64748B]
                      hover:bg-[#F8FAFC]
                      hover:text-[#1F2937]
                    `
                }
                `
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`
                      w-8 h-8
                      rounded-lg
                      flex items-center justify-center
                      text-base
                      ${
                        isActive
                          ? "bg-[#F9C74F] text-[#1F2937]"
                          : "text-[#64748B]"
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* SYSTEM */}
        <div className="mt-8">
          <p className="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Hệ thống
          </p>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `
              flex items-center gap-3
              px-3 py-2.5
              rounded-xl
              text-sm font-medium
              transition
              ${
                isActive
                  ? "bg-[#FFF8E1] text-[#1F2937] font-semibold"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1F2937]"
              }
              `
            }
          >
            <span className="w-8 h-8 flex items-center justify-center">⚙</span>

            <span>Cài đặt</span>
          </NavLink>
        </div>
      </nav>

      {/* USER */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition">
          <div
            className="
              w-9 h-9
              rounded-full
              bg-[#FFF0C2]
              flex items-center justify-center
              text-sm font-bold
              text-[#1F2937]
            "
          >
            A
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1F2937] truncate">
              Administrator
            </p>

            <p className="text-xs text-[#64748B]">Quản trị viên</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
