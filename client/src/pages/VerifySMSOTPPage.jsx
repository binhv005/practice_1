import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Phone, ArrowLeft, UserRound } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { sendSmsOtpApi, verifySmsOtpApi } from "../api/authApi";
import {
  sendFirebaseOTP,
  confirmFirebaseOTP,
  getFirebaseAuthErrorMessage,
} from "../services/firebasePhoneAuth";
import SmsOtpForm from "../components/auth/SmsOtpForm";
import SmsAccountForm from "../components/auth/SmsAccountForm";

function VerifySMSOTPPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const phoneNumber = searchParams.get("phoneNumber");

  const [step, setStep] = useState("otp");
  const [idToken, setIdToken] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  useEffect(() => {
    if (!phoneNumber) {
      toast.error("Thông tin không hợp lệ. Vui lòng thử lại.");
      navigate("/register-sms");
    }
  }, [phoneNumber, navigate, toast]);

  useEffect(() => {
    if (step !== "otp" || timeLeft <= 0) return;

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
  }, [timeLeft, step]);

  useEffect(() => {
    if (step !== "otp") return;

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
  }, [resendCooldown, step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPhoneDisplay = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      inputRefs[5].current?.focus();
    }
  };

  const handleConfirmOtp = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await confirmFirebaseOTP(otpCode);
      setIdToken(result.idToken);
      setStep("account");
      toast.success("Xác thực OTP thành công. Hãy điền thông tin tài khoản.");
    } catch (error) {
      console.error("Verify SMS OTP error:", error);
      setError(
        getFirebaseAuthErrorMessage(error) || "Không thể xác thực. Vui lòng thử lại."
      );

      if (
        error?.code === "auth/invalid-verification-code" ||
        error?.message === "SESSION_EXPIRED"
      ) {
        setOtp(["", "", "", "", "", ""]);
        inputRefs[0].current?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (field, value) => {
    setError("");

    if (field === "fullname") setFullname(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
  };

  const handleCreateAccount = async () => {
    if (!idToken) {
      setError("Phiên xác thực đã hết. Vui lòng nhập lại OTP.");
      setStep("otp");
      return;
    }

    if (!fullname.trim()) {
      setError("Vui lòng nhập họ và tên");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không trùng khớp");
      return;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Email không đúng định dạng");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      const response = await verifySmsOtpApi({
        phoneNumber,
        idToken,
        fullname: fullname.trim(),
        email: email.trim() || undefined,
        password,
      });

      const data = response.data;

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Đăng ký thành công! Chào mừng bạn đến với ứng dụng.");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError(data.message || "Không thể tạo tài khoản");
      }
    } catch (error) {
      console.error("Create account error:", error);
      setError(
        error.response?.data?.message ||
          getFirebaseAuthErrorMessage(error) ||
          "Không thể tạo tài khoản. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      setResending(true);
      setError("");

      const response = await sendSmsOtpApi(phoneNumber);
      const data = response.data;

      if (data.success) {
        await sendFirebaseOTP(phoneNumber);
        toast.success("Đã tạo lại phiên xác thực Firebase");
        setOtp(["", "", "", "", "", ""]);
        setTimeLeft(180);
        setCanResend(false);
        setResendCooldown(60);
        inputRefs[0].current?.focus();
      } else {
        if (data.waitTime) {
          setResendCooldown(data.waitTime);
          setCanResend(false);
        }
        setError(data.message || "Không thể gửi lại mã OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError(
        error.response?.data?.message ||
          getFirebaseAuthErrorMessage(error) ||
          "Không thể gửi lại mã. Vui lòng thử lại."
      );
      if (error.response?.data?.waitTime) {
        setResendCooldown(error.response.data.waitTime);
        setCanResend(false);
      }
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    if (step === "account") {
      setStep("otp");
      setIdToken("");
      setOtp(["", "", "", "", "", ""]);
      setCanResend(true);
      setResendCooldown(0);
      setError("Phiên OTP đã dùng. Hãy gửi lại mã rồi nhập OTP để xác thực lại.");
      return;
    }

    navigate("/register-sms");
  };

  return (
    <main className="min-h-screen bg-[#f9f9f9]">
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6">
        <div className="pointer-events-none fixed left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-[#ffba00]/10 blur-3xl" />
        <div className="pointer-events-none fixed bottom-[-10%] right-[-5%] h-[40%] w-[30%] rounded-full bg-green-300/10 blur-3xl" />

        <div className="relative z-10 flex w-full max-w-[520px] flex-col rounded-xl bg-white p-6 shadow-md sm:p-10">
          <button
            type="button"
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-700"
          >
            <ArrowLeft size={16} />
            {step === "account" ? "Quay lại bước OTP" : "Quay lại"}
          </button>

          <div className="mb-6 flex items-center justify-center gap-3 text-xs font-medium">
            <span
              className={`rounded-full px-3 py-1 ${
                step === "otp"
                  ? "bg-[#ffba00] text-[#6c4d00]"
                  : "bg-green-100 text-green-700"
              }`}
            >
              1. OTP
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`rounded-full px-3 py-1 ${
                step === "account"
                  ? "bg-[#ffba00] text-[#6c4d00]"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              2. Tài khoản
            </span>
          </div>

          <div className="mb-7 flex flex-col items-center gap-2 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffba00] shadow-sm">
              {step === "otp" ? (
                <ShieldCheck size={32} strokeWidth={2} className="text-[#6c4d00]" />
              ) : (
                <UserRound size={32} strokeWidth={2} className="text-[#6c4d00]" />
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {step === "otp" ? "Xác thực SMS" : "Thông tin tài khoản"}
            </h1>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone size={16} />
              <span>
                {step === "otp"
                  ? "Mã OTP đã được gửi đến"
                  : "Số điện thoại đã xác thực"}
              </span>
            </div>

            <p className="font-medium text-[#ffba00]">
              {formatPhoneDisplay(phoneNumber)}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === "otp" ? (
            <SmsOtpForm
              otp={otp}
              inputRefs={inputRefs}
              timeLeft={timeLeft}
              loading={loading}
              canResend={canResend}
              resending={resending}
              resendCooldown={resendCooldown}
              formatTime={formatTime}
              onChange={handleOtpChange}
              onKeyDown={handleOtpKeyDown}
              onPaste={handleOtpPaste}
              onSubmit={handleConfirmOtp}
              onResend={handleResend}
            />
          ) : (
            <SmsAccountForm
              fullname={fullname}
              email={email}
              password={password}
              confirmPassword={confirmPassword}
              loading={loading}
              onChange={handleAccountChange}
              onSubmit={handleCreateAccount}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default VerifySMSOTPPage;
