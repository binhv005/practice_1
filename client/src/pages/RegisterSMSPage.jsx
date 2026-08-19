import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Phone, ArrowLeft, Loader2, Shield } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { sendSmsOtpApi } from "../api/authApi";
import {
  sendFirebaseOTP,
  getFirebaseAuthErrorMessage,
} from "../services/firebasePhoneAuth";

function RegisterSMSPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for rate limit
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);

    // Format: 0xxx xxx xxx
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 4)} ${limited.slice(4)}`;
    return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError("");
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    // Remove spaces for validation
    const cleanPhone = phoneNumber.replace(/\s/g, "");

    // Validate phone number
    const phoneRegex = /^(0)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError("Số điện thoại không đúng định dạng");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await sendSmsOtpApi(cleanPhone);
      const data = response.data;

      if (data.success) {
        await sendFirebaseOTP(cleanPhone);
        setCooldown(60);
        toast.success(
          "Đã tạo phiên xác thực. Nhập mã OTP đã khai báo trên Firebase Console."
        );

        setTimeout(() => {
          navigate(`/verify-sms-otp?phoneNumber=${encodeURIComponent(cleanPhone)}`);
        }, 800);
      } else {
        if (data.waitTime) {
          setCooldown(data.waitTime);
        }
        setError(data.message || "Không thể gửi OTP");
      }
    } catch (error) {
      console.error("Send SMS OTP error:", error);
      const apiMessage = error.response?.data?.message;
      setError(
        apiMessage ||
          getFirebaseAuthErrorMessage(error) ||
          "Không thể kết nối đến server. Vui lòng thử lại."
      );
      if (error.response?.data?.waitTime) {
        setCooldown(error.response.data.waitTime);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f9f9]">
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6">
        {/* Decorative background */}
        <div className="pointer-events-none fixed left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-[#ffba00]/10 blur-3xl" />
        <div className="pointer-events-none fixed bottom-[-10%] right-[-5%] h-[40%] w-[30%] rounded-full bg-green-300/10 blur-3xl" />

        {/* Card */}
        <div className="relative z-10 flex w-full max-w-[480px] flex-col rounded-xl bg-white p-6 shadow-md sm:p-10">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="mb-4 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-700"
          >
            <ArrowLeft size={16} />
            Quay lại đăng ký
          </button>

          {/* Header */}
          <div className="mb-7 flex flex-col items-center gap-2 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffba00] shadow-sm">
              <Phone size={32} strokeWidth={2} className="text-[#6c4d00]" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Đăng ký bằng SMS
            </h1>

            <p className="text-sm text-gray-500">
              Dùng số test đã thêm trên Firebase Console
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSendOTP} className="space-y-5">
            {/* Phone Number Input */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Số điện thoại <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Phone size={18} className="text-gray-400" />
                </div>

                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="0901 234 567"
                  disabled={loading || cooldown > 0}
                  className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-gray-900 transition focus:border-[#ffba00] focus:outline-none focus:ring-2 focus:ring-[#ffba00]/20 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Số điện thoại Việt Nam đã khai báo trong Phone numbers for testing
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || cooldown > 0 || !phoneNumber}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ffba00] font-semibold text-[#6c4d00] shadow-sm transition hover:bg-[#e6a800] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang gửi...
                </>
              ) : cooldown > 0 ? (
                <>Chờ {cooldown}s để gửi lại</>
              ) : (
                <>
                  <Phone size={20} />
                  Gửi mã OTP
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">HOẶC</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Alternative Registration */}
          <div className="text-center">
            <p className="mb-3 text-sm text-gray-600">
              Đăng ký bằng phương thức khác
            </p>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#b17b00] transition hover:text-[#7b5800] hover:underline"
            >
              Đăng ký bằng Email
            </Link>
          </div>

          {/* Security Notice */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-xs text-blue-800">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <Shield size={16} />
              <span>Bảo mật thông tin</span>
            </div>
            <ul className="list-inside list-disc space-y-1">
              <li>Development: không gửi SMS thật, dùng Test Phone Number</li>
              <li>Nhập đúng mã OTP đã khai báo trên Firebase Console</li>
              <li>Bạn chỉ có thể gửi lại sau 60 giây</li>
              <li>Backend chỉ tin Firebase ID Token, không tự tạo OTP</li>
            </ul>
          </div>

          {/* Login Link */}
          <div className="mt-6 border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#b17b00] transition hover:text-[#7b5800] hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RegisterSMSPage;
