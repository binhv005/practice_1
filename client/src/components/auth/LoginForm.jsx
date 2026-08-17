import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginForm({ form, errors, loading, onChange, onSubmit }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      {/* Identifier */}
      <div className="group flex flex-col gap-1.5">
        <label
          htmlFor="identifier"
          className={`
            text-xs
            font-medium
            transition-colors
            ${errors.identifier ? "text-red-500" : "text-gray-500"}
          `}
        >
          Số điện thoại hoặc Email
        </label>

        <div className="relative flex items-center">
          <User
            size={19}
            strokeWidth={1.8}
            className={`
              absolute
              left-4
              transition-colors
              ${errors.identifier ? "text-red-400" : "text-gray-400"}
            `}
          />

          <input
            id="identifier"
            type="text"
            value={form.identifier}
            onChange={(e) => onChange("identifier", e.target.value)}
            placeholder="Nhập số điện thoại hoặc email"
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
                errors.identifier
                  ? "border-red-400 bg-red-50/50 focus:border-red-500"
                  : "border-transparent focus:border-[#ffba00] focus:bg-white"
              }
            `}
          />
        </div>

        {errors.identifier && (
          <p className="text-xs text-red-500">{errors.identifier}</p>
        )}
      </div>

      {/* Password */}
      <div className="group flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className={`
              text-xs
              font-medium
              ${errors.password ? "text-red-500" : "text-gray-500"}
            `}
          >
            Mật khẩu
          </label>

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="
              text-xs
              font-semibold
              text-[#b17b00]
              transition
              hover:text-[#7b5800]
            "
          >
            Quên mật khẩu?
          </button>
        </div>

        <div className="relative flex items-center">
          <Lock
            size={19}
            strokeWidth={1.8}
            className={`
              absolute
              left-4
              ${errors.password ? "text-red-400" : "text-gray-400"}
            `}
          />

          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="Nhập mật khẩu"
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
              flex
              items-center
              justify-center
              text-gray-400
              transition
              hover:text-gray-700
            "
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {errors.password && (
          <p className="text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={form.rememberMe}
            onChange={(e) => onChange("rememberMe", e.target.checked)}
            className="
              h-4
              w-4
              cursor-pointer
              rounded
              border-gray-300
              accent-[#ffba00]
            "
          />

          <span className="text-xs text-gray-500">Ghi nhớ đăng nhập</span>
        </label>
      </div>

      {/* Submit */}
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
          shadow-sm
          transition-all
          hover:bg-[#ffbb0c]
          hover:shadow-md
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
            Đang xử lý...
          </>
        ) : (
          <>
            Đăng nhập
            <ArrowRight size={18} strokeWidth={2} />
          </>
        )}
      </button>
    </form>
  );
}

export default LoginForm;
