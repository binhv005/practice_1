import { User, Mail, Lock, Loader2 } from "lucide-react";

function SmsAccountForm({
  fullname,
  email,
  password,
  confirmPassword,
  loading,
  onChange,
  onSubmit,
}) {
  const canSubmit =
    fullname.trim() && password && confirmPassword && !loading;

  return (
    <>
      <div className="mb-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Thông tin tài khoản
        </h3>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <User size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={fullname}
              onChange={(e) => onChange("fullname", e.target.value)}
              placeholder="Nguyễn Văn A"
              disabled={loading}
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-gray-900 transition focus:border-[#ffba00] focus:outline-none focus:ring-2 focus:ring-[#ffba00]/20 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email (không bắt buộc)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="example@email.com"
              disabled={loading}
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-gray-900 transition focus:border-[#ffba00] focus:outline-none focus:ring-2 focus:ring-[#ffba00]/20 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              disabled={loading}
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-gray-900 transition focus:border-[#ffba00] focus:outline-none focus:ring-2 focus:ring-[#ffba00]/20 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
              placeholder="Nhập lại mật khẩu"
              disabled={loading}
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-gray-900 transition focus:border-[#ffba00] focus:outline-none focus:ring-2 focus:ring-[#ffba00]/20 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ffba00] font-semibold text-[#6c4d00] shadow-sm transition hover:bg-[#e6a800] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Đang tạo tài khoản...
          </>
        ) : (
          "Hoàn tất đăng ký"
        )}
      </button>

      <div className="mt-2 rounded-lg bg-blue-50 p-4 text-xs text-blue-800">
        <p className="mb-2 font-semibold">Lưu ý:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Số điện thoại đã được xác thực bằng OTP</li>
          <li>Email không bắt buộc nhưng giúp khôi phục tài khoản</li>
          <li>Mật khẩu phải có ít nhất 6 ký tự</li>
        </ul>
      </div>
    </>
  );
}

export default SmsAccountForm;
