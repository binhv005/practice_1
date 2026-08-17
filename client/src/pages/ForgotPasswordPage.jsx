import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPasswordApi } from "../api/authApi";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Email không đúng định dạng");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setError("");

      const response = await forgotPasswordApi(email.trim());

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại sau",
      );
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
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={40} className="text-green-600" />
              </div>
            </div>

            {/* Header */}
            <h1 className="mb-3 text-center text-2xl font-bold text-gray-900">
              Email đã được gửi!
            </h1>

            <p className="mb-6 text-center text-sm leading-6 text-gray-500">
              Chúng tôi đã gửi link đặt lại mật khẩu đến email{" "}
              <strong>{email}</strong>
            </p>

            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <p className="mb-2 font-semibold">📧 Vui lòng kiểm tra email:</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Link chỉ có hiệu lực trong 10 phút</li>
                <li>Kiểm tra cả thư mục spam/junk</li>
                <li>Nếu không nhận được, vui lòng gửi lại</li>
              </ul>
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ffba00] text-sm font-semibold text-[#6c4d00] shadow-sm transition-all hover:bg-[#ffbb0c] hover:shadow-md active:scale-[0.98]"
            >
              <ArrowLeft size={18} />
              Quay lại đăng nhập
            </button>

            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
              className="mt-3 text-sm text-gray-500 transition hover:text-gray-700"
            >
              Gửi lại email
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

        {/* Forgot password card */}
        <div className="relative z-10 flex w-full max-w-[480px] flex-col rounded-xl bg-white p-8 shadow-md sm:p-12">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffba00] shadow-sm">
              <Gift size={32} strokeWidth={2} className="text-[#6c4d00]" />
            </div>

            <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900">
              Quên mật khẩu?
            </h1>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className={`text-xs font-medium ${error ? "text-red-500" : "text-gray-500"}`}
              >
                Email
              </label>

              <div className="relative flex items-center">
                <Mail
                  size={19}
                  strokeWidth={1.8}
                  className={`absolute left-4 ${error ? "text-red-400" : "text-gray-400"}`}
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Nhập email của bạn"
                  className={`h-12 w-full rounded-lg border bg-gray-50 pl-12 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                    error
                      ? "border-red-400 bg-red-50/50 focus:border-red-500"
                      : "border-transparent focus:border-[#ffba00] focus:bg-white"
                  }`}
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}
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
                  <Mail size={18} strokeWidth={2} />
                  Gửi link đặt lại mật khẩu
                </>
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 text-sm text-gray-500 transition hover:text-gray-700"
            >
              <ArrowLeft size={16} />
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
