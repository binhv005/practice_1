import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

function VerifyOTPPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Redirect if no userId or email
  useEffect(() => {
    if (!userId || !email) {
      toast.error("Thông tin không hợp lệ. Vui lòng đăng ký lại.");
      navigate("/register");
    }
  }, [userId, email, navigate, toast]);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs[5].current?.focus();
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 số");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId, otpCode }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Xác thực thành công! Chuyển đến trang đăng nhập...");
        
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(data.message || "Mã OTP không chính xác");
        setOtp(["", "", "", "", "", ""]);
        inputRefs[0].current?.focus();
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setError("Không thể xác thực. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    try {
      setResending(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Mã OTP mới đã được gửi đến email của bạn");
        setOtp(["", "", "", "", "", ""]);
        setTimeLeft(600); // Reset timer to 10 minutes
        setCanResend(false);
        setResendCooldown(60); // 60 seconds cooldown
        inputRefs[0].current?.focus();
      } else {
        setError(data.message || "Không thể gửi lại mã OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Không thể gửi lại mã. Vui lòng thử lại.");
    } finally {
      setResending(false);
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
              <ShieldCheck size={32} strokeWidth={2} className="text-[#6c4d00]" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Xác thực email
            </h1>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail size={16} />
              <span>Mã OTP đã được gửi đến</span>
            </div>
            
            <p className="font-medium text-[#ffba00]">{email}</p>

            {/* Timer */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2">
              <span className="text-sm text-gray-600">Còn lại:</span>
              <span className={`font-mono text-lg font-bold ${
                timeLeft < 60 ? "text-red-600" : "text-gray-900"
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {timeLeft === 0 && (
              <p className="mt-2 text-sm text-red-600">
                Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <label className="mb-3 block text-center text-sm font-medium text-gray-700">
              Nhập mã OTP gồm 6 số
            </label>
            
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading || timeLeft === 0}
                  className="h-12 w-12 rounded-lg border-2 border-gray-200 text-center text-xl font-bold text-gray-900 transition focus:border-[#ffba00] focus:outline-none focus:ring-2 focus:ring-[#ffba00]/20 disabled:bg-gray-100 disabled:text-gray-400 sm:h-14 sm:w-14"
                />
              ))}
            </div>
          </div>

          {/* Verify button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || otp.join("").length !== 6 || timeLeft === 0}
            className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ffba00] font-semibold text-[#6c4d00] shadow-sm transition hover:bg-[#e6a800] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang xác thực...
              </>
            ) : (
              "Xác nhận"
            )}
          </button>

          {/* Resend OTP */}
          <div className="mt-6 border-t border-gray-200 pt-6 text-center">
            <p className="mb-3 text-sm text-gray-600">
              Không nhận được mã?
            </p>

            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-[#b17b00] transition hover:text-[#7b5800] hover:underline disabled:text-gray-400"
              >
                {resending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi lại mã OTP"
                )}
              </button>
            ) : (
              <p className="text-sm text-gray-400">
                Gửi lại sau {resendCooldown}s
              </p>
            )}
          </div>

          {/* Helper text */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-xs text-blue-800">
            <p className="mb-2 font-semibold">💡 Mẹo:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Kiểm tra hộp thư spam nếu không thấy email</li>
              <li>Mã OTP có hiệu lực trong 10 phút</li>
              <li>Bạn có thể dán (paste) mã OTP 6 số</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

export default VerifyOTPPage;
