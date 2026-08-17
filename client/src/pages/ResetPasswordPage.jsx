import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Gift, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { resetPasswordApi } from "../api/authApi";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Kiểm tra token có tồn tại không
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      general: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không trùng khớp";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({});

      const response = await resetPasswordApi({
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      if (response.data.success) {
        setSuccess(true);

        // Redirect sau 3 giây
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Reset password error:", err);

      setErrors({
        general:
          err.response?.data?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#f9f9f9]">
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12">
          {/* Background decoration */}
          <div className="pointer-events-none absolute left-[-5%] top-[-10%] h-[40%] w-[40%] rounded-full bg-[#ffba00]/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[50%] w-[30%] rounded-full bg-green-300/10 blur-3xl" />

          {/* Success card */}
          <div className="relative z-10 flex w-full max-w-[480px] flex-col rounded-xl bg-white p-8 shadow-md sm:p-12">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={40} className="text-green-600" />
              </div>
            </div>

            <h1 className="mb-3 text-center text-2xl font-bold text-gray-900">
              Đặt lại mật khẩu thành công!
            </h1>

            <p className="mb-6 text-center text-sm leading-6 text-gray-500">
              Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển đến trang
              đăng nhập sau 3 giây...
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ffba00] text-sm font-semibold text-[#6c4d00] shadow-sm transition-all hover:bg-[#ffbb0c] hover:shadow-md active:scale-[0.98]"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f9f9f9]">
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12">
        {/* Background decoration */}
        <div className="pointer-events-none absolute left-[-5%] top-[-10%] h-[40%] w-[40%] rounded-full bg-[#ffba00]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[50%] w-[30%] rounded-full bg-green-300/10 blur-3xl" />

        {/* Reset password card */}
        <div className="relative z-10 flex w-full max-w-[480px] flex-col rounded-xl bg-white p-8 shadow-md sm:p-12">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffba00] shadow-sm">
              <Gift size={32} strokeWidth={2} className="text-[#6c4d00]" />
            </div>

            <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900">
              Đặt lại mật khẩu
            </h1>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="newPassword"
                className={`text-xs font-medium ${errors.newPassword ? "text-red-500" : "text-gray-500"}`}
              >
                Mật khẩu mới
              </label>

              <div className="relative flex items-center">
                <Lock
                  size={19}
                  strokeWidth={1.8}
                  className={`absolute left-4 ${errors.newPassword ? "text-red-400" : "text-gray-400"}`}
                />

                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className={`h-12 w-full rounded-lg border bg-gray-50 pl-12 pr-12 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                    errors.newPassword
                      ? "border-red-400 bg-red-50/50 focus:border-red-500"
                      : "border-transparent focus:border-[#ffba00] focus:bg-white"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-4 flex items-center justify-center text-gray-400 transition hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              {errors.newPassword && (
                <p className="text-xs text-red-500">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className={`text-xs font-medium ${errors.confirmPassword ? "text-red-500" : "text-gray-500"}`}
              >
                Nhập lại mật khẩu mới
              </label>

              <div className="relative flex items-center">
                <Lock
                  size={19}
                  strokeWidth={1.8}
                  className={`absolute left-4 ${errors.confirmPassword ? "text-red-400" : "text-gray-400"}`}
                />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  placeholder="Nhập lại mật khẩu mới"
                  className={`h-12 w-full rounded-lg border bg-gray-50 pl-12 pr-12 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                    errors.confirmPassword
                      ? "border-red-400 bg-red-50/50 focus:border-red-500"
                      : "border-transparent focus:border-[#ffba00] focus:bg-white"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 flex items-center justify-center text-gray-400 transition hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Info */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
              <p className="mb-1 font-semibold">💡 Lưu ý:</p>
              <ul className="list-inside list-disc space-y-0.5">
                <li>Mật khẩu phải có ít nhất 6 ký tự</li>
                <li>Nên sử dụng kết hợp chữ hoa, chữ thường và số</li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ffba00] text-sm font-semibold text-[#6c4d00] shadow-sm transition-all hover:bg-[#ffbb0c] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#6c4d00] border-t-transparent" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Lock size={18} strokeWidth={2} />
                  Đặt lại mật khẩu
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ResetPasswordPage;
