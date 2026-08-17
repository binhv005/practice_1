import { useState } from "react";

import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from "lucide-react";

function RegisterForm({ form, errors, loading, onChange, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      {/* =====================
          HỌ VÀ TÊN
      ====================== */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="fullName"
          className="text-sm font-semibold text-gray-800"
        >
          Họ và tên
        </label>

        <div className="relative">
          <User
            size={19}
            strokeWidth={1.8}
            className={`
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              ${errors.fullName ? "text-red-400" : "text-gray-400"}
            `}
          />

          <input
            id="fullName"
            type="text"
            value={form.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Nhập họ và tên của bạn"
            className={`
              h-12
              w-full
              rounded-lg
              border
              bg-gray-50
              pl-12
              pr-4
              text-sm
              text-gray-900
              outline-none
              transition-all
              placeholder:text-gray-400

              ${
                errors.fullName
                  ? "border-red-400 bg-red-50/50 focus:border-red-500"
                  : "border-transparent focus:border-[#ffba00] focus:bg-white"
              }
            `}
          />
        </div>

        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName}</p>
        )}
      </div>

      {/* =====================
          SỐ ĐIỆN THOẠI
      ====================== */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-semibold text-gray-800">
          Số điện thoại
        </label>

        <div className="relative">
          <Phone
            size={19}
            strokeWidth={1.8}
            className={`
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              ${errors.phone ? "text-red-400" : "text-gray-400"}
            `}
          />

          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Nhập số điện thoại"
            className={`
              h-12
              w-full
              rounded-lg
              border
              bg-gray-50
              pl-12
              pr-4
              text-sm
              text-gray-900
              outline-none
              transition-all
              placeholder:text-gray-400

              ${
                errors.phone
                  ? "border-red-400 bg-red-50/50 focus:border-red-500"
                  : "border-transparent focus:border-[#ffba00] focus:bg-white"
              }
            `}
          />
        </div>

        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
      </div>

      {/* =====================
          EMAIL
      ====================== */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-gray-800">
          Email
        </label>

        <div className="relative">
          <Mail
            size={19}
            strokeWidth={1.8}
            className={`
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              ${errors.email ? "text-red-400" : "text-gray-400"}
            `}
          />

          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="Nhập địa chỉ email"
            className={`
              h-12
              w-full
              rounded-lg
              border
              bg-gray-50
              pl-12
              pr-4
              text-sm
              text-gray-900
              outline-none
              transition-all
              placeholder:text-gray-400

              ${
                errors.email
                  ? "border-red-400 bg-red-50/50 focus:border-red-500"
                  : "border-transparent focus:border-[#ffba00] focus:bg-white"
              }
            `}
          />
        </div>

        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* =====================
          PASSWORD
      ====================== */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-gray-800"
        >
          Mật khẩu
        </label>

        <div className="relative">
          <Lock
            size={19}
            strokeWidth={1.8}
            className={`
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              ${errors.password ? "text-red-400" : "text-gray-400"}
            `}
          />

          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
            className={`
              h-12
              w-full
              rounded-lg
              border
              bg-gray-50
              pl-12
              pr-12
              text-sm
              text-gray-900
              outline-none
              transition-all
              placeholder:text-gray-400

              ${
                errors.password
                  ? "border-red-400 bg-red-50/50 focus:border-red-500"
                  : "border-transparent focus:border-[#ffba00] focus:bg-white"
              }
            `}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="
              absolute
              right-4
              top-1/2
              flex
              -translate-y-1/2
              items-center
              justify-center
              text-gray-400
              transition
              hover:text-gray-700
            "
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {errors.password && (
          <p className="text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {/* =====================
          CONFIRM PASSWORD
      ====================== */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-semibold text-gray-800"
        >
          Nhập lại mật khẩu
        </label>

        <div className="relative">
          <Lock
            size={19}
            strokeWidth={1.8}
            className={`
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              ${errors.confirmPassword ? "text-red-400" : "text-gray-400"}
            `}
          />

          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => onChange("confirmPassword", e.target.value)}
            placeholder="Xác nhận lại mật khẩu"
            className={`
              h-12
              w-full
              rounded-lg
              border
              bg-gray-50
              pl-12
              pr-12
              text-sm
              text-gray-900
              outline-none
              transition-all
              placeholder:text-gray-400

              ${
                errors.confirmPassword
                  ? "border-red-400 bg-red-50/50 focus:border-red-500"
                  : "border-transparent focus:border-[#ffba00] focus:bg-white"
              }
            `}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="
              absolute
              right-4
              top-1/2
              flex
              -translate-y-1/2
              items-center
              justify-center
              text-gray-400
              transition
              hover:text-gray-700
            "
          >
            {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      {/* =====================
          TERMS
      ====================== */}
      <div className="mt-1">
        <label className="flex cursor-pointer items-start gap-3">
          <div className="relative mt-0.5 flex h-5 w-5 shrink-0">
            <input
              type="checkbox"
              checked={form.agreeTerms}
              onChange={(e) => onChange("agreeTerms", e.target.checked)}
              className="
                peer
                h-5
                w-5
                cursor-pointer
                appearance-none
                rounded-md
                border
                border-gray-300
                bg-gray-100
                transition
                checked:border-[#ffba00]
                checked:bg-[#ffba00]
              "
            />

            <Check
              size={14}
              strokeWidth={3}
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                text-[#6c4d00]
                opacity-0
                transition-opacity
                peer-checked:opacity-100
              "
            />
          </div>

          <span className="text-xs leading-5 text-gray-500">
            Tôi đồng ý với các{" "}
            <button
              type="button"
              className="
                font-semibold
                text-[#b17b00]
                hover:underline
              "
            >
              Điều khoản
            </button>{" "}
            và{" "}
            <button
              type="button"
              className="
                font-semibold
                text-[#b17b00]
                hover:underline
              "
            >
              Chính sách
            </button>{" "}
            của hệ thống.
          </span>
        </label>

        {errors.agreeTerms && (
          <p className="mt-1.5 text-xs text-red-500">{errors.agreeTerms}</p>
        )}
      </div>

      {/* =====================
          SUBMIT
      ====================== */}
      <button
        type="submit"
        disabled={loading}
        className="
          mt-1
          flex
          h-12
          w-full
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-[#ffba00]
          text-sm
          font-semibold
          text-[#6c4d00]
          shadow-md
          transition-all
          hover:bg-[#7b5800]
          hover:text-white
          active:scale-[0.98]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading ? (
          <>
            <span
              className="
                h-5
                w-5
                animate-spin
                rounded-full
                border-2
                border-[#6c4d00]
                border-t-transparent
              "
            />
            Đang tạo tài khoản...
          </>
        ) : (
          <>
            Đăng ký
            <ArrowRight
              size={18}
              className="
                transition-transform
                group-hover:translate-x-1
              "
            />
          </>
        )}
      </button>
    </form>
  );
}

export default RegisterForm;
