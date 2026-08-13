function UserFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}

      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* =================================================
              BRAND
          ================================================= */}

          <div className="lg:col-span-1">
            {/* LOGO */}

            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#ffba00]
                  text-lg
                  font-bold
                  text-gray-950
                  shadow-sm
                "
              >
                C
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900">Donate</h2>

                <p className="text-xs text-gray-400">Chia sẻ để yêu thương</p>
              </div>
            </div>

            {/* DESCRIPTION */}

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-500">
              Nền tảng kết nối cộng đồng, nơi mọi người có thể chia sẻ những món
              đồ không còn sử dụng và trao chúng đến những người đang cần.
            </p>

            {/* SOCIAL */}

            <div className="mt-6 flex items-center gap-2">
              {/* FACEBOOK */}

              <a
                href="#"
                aria-label="Facebook"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-50
                  text-gray-500
                  transition
                  hover:bg-yellow-50
                  hover:text-gray-900
                "
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V11H7v3h2.8v8h3.7z" />
                </svg>
              </a>

              {/* INSTAGRAM */}

              <a
                href="#"
                aria-label="Instagram"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-50
                  text-gray-500
                  transition
                  hover:bg-yellow-50
                  hover:text-gray-900
                "
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />

                  <circle cx="12" cy="12" r="4" />

                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>

              {/* EMAIL */}

              <a
                href="mailto:support@community.vn"
                aria-label="Email"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-50
                  text-gray-500
                  transition
                  hover:bg-yellow-50
                  hover:text-gray-900
                "
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4 7 8 6 8-6"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* =================================================
              PLATFORM
          ================================================= */}

          <div>
            <h3 className="text-sm font-bold text-gray-900">Về Donate</h3>

            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="#"
                  className="
                    text-sm
                    text-gray-500
                    transition
                    hover:text-gray-900
                  "
                >
                  Giới thiệu
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="
                    text-sm
                    text-gray-500
                    transition
                    hover:text-gray-900
                  "
                >
                  Cách hoạt động
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="
                    text-sm
                    text-gray-500
                    transition
                    hover:text-gray-900
                  "
                >
                  Tin tức
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="
                    text-sm
                    text-gray-500
                    transition
                    hover:text-gray-900
                  "
                >
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* =================================================
              SUPPORT
          ================================================= */}

          <div>
            <h3 className="text-sm font-bold text-gray-900">Hỗ trợ</h3>

            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="#"
                  className="
                    text-sm
                    text-gray-500
                    transition
                    hover:text-gray-900
                  "
                >
                  Trung tâm trợ giúp
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="
                    text-sm
                    text-gray-500
                    transition
                    hover:text-gray-900
                  "
                >
                  Quy định đăng tin
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="
                    text-sm
                    text-gray-500
                    transition
                    hover:text-gray-900
                  "
                >
                  Báo cáo nội dung
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="
                    text-sm
                    text-gray-500
                    transition
                    hover:text-gray-900
                  "
                >
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* =================================================
              CONTACT
          ================================================= */}

          <div>
            <h3 className="text-sm font-bold text-gray-900">Liên hệ</h3>

            <div className="mt-5 space-y-4">
              {/* EMAIL */}

              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-yellow-50
                    text-gray-700
                  "
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4 7 8 6 8-6"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Email</p>

                  <p className="mt-0.5 text-sm font-medium text-gray-700">
                    support@donate.vn
                  </p>
                </div>
              </div>

              {/* PHONE */}

              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-yellow-50
                    text-gray-700
                  "
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.6 3.8 9 3.2c.6-.2 1.2.1 1.5.7l1.2 2.8c.2.5.1 1-.3 1.4L10 9.5a13.7 13.7 0 0 0 4.5 4.5l1.4-1.4c.4-.4.9-.5 1.4-.3l2.8 1.2c.6.3.9.9.7 1.5l-.6 2.4c-.2.8-.9 1.3-1.7 1.3C10.8 18.7 5.3 13.2 5.3 6.9c0-.8.5-1.5 1.3-1.7Z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Hotline</p>

                  <p className="mt-0.5 text-sm font-medium text-gray-700">
                    1900 1234
                  </p>
                </div>
              </div>

              {/* LOCATION */}

              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-yellow-50
                    text-gray-700
                  "
                >
                  <svg
                    className="h-4 w-4"
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
                </div>

                <div>
                  <p className="text-xs text-gray-400">Địa chỉ</p>

                  <p className="mt-0.5 text-sm font-medium text-gray-700">
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      <div className="border-t border-gray-100">
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1440px]
            flex-col
            gap-3
            px-4
            py-5
            sm:px-6
            md:flex-row
            md:items-center
            md:justify-between
            lg:px-8
          "
        >
          {/* COPYRIGHT */}

          <p className="text-xs text-gray-400">
            © 2026 Community. All rights reserved.
          </p>

          {/* LEGAL */}

          <div className="flex items-center gap-5">
            <a
              href="#"
              className="
                text-xs
                text-gray-400
                transition
                hover:text-gray-700
              "
            >
              Chính sách bảo mật
            </a>

            <a
              href="#"
              className="
                text-xs
                text-gray-400
                transition
                hover:text-gray-700
              "
            >
              Điều khoản sử dụng
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default UserFooter;
