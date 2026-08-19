import { useState } from "react";
import { Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

import RegisterForm from "../components/auth/RegisterForm";
import SocialLoginButtons from "../components/auth/SocialLoginButtons";
import { registerApi, googleLoginApi } from "../api/authApi";
import { useToast } from "../contexts/ToastContext";

function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Xóa lỗi của field đang nhập lại
    setErrors((prev) => ({
      ...prev,
      [field]: "",
      general: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Họ tên
    if (!form.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    // Số điện thoại
    if (!form.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(form.phone.trim())) {
      newErrors.phone = "Số điện thoại không đúng định dạng";
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Email không đúng định dạng";
    }

    // Password
    if (!form.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (form.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Confirm password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    // Terms
    if (!form.agreeTerms) {
      newErrors.agreeTerms = "Bạn cần đồng ý với điều khoản của hệ thống";
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

      // Gọi API đăng ký thật
      const response = await registerApi({
        fullname: form.fullName, // Backend expect "fullname", frontend có "fullName"
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (response.data.success) {
        // Đăng ký thành công - Redirect đến trang verify OTP
        const { userId, email } = response.data;
        
        // Thông báo thành công
        toast.success("Mã OTP đã được gửi đến email của bạn");
        
        // Redirect đến trang verify OTP với userId và email
        setTimeout(() => {
          navigate(`/verify-otp?userId=${userId}&email=${encodeURIComponent(email)}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Register error:", error);

      setErrors({
        general: error.response?.data?.message || "Đăng ký tài khoản thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign Up Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setErrors({});

      console.log("🔵 Google credential received for sign up:", credentialResponse);

      // Gọi API backend để verify và đăng ký/đăng nhập với Google
      // Backend sẽ tự động tạo account nếu chưa tồn tại
      console.log("📡 Calling backend API /google-login...");
      const response = await googleLoginApi({
        credential: credentialResponse.credential,
      });

      console.log("✅ Google sign up response:", response.data);

      if (response.data.success) {
        const user = response.data.user;

        console.log("👤 User info:", user);
        console.log("📸 Avatar URL:", user.avatar);

        // Lưu user info vào localStorage (consistent với LoginPage)
        localStorage.setItem("user", JSON.stringify(user));

        // Verify đã lưu
        const saved = JSON.parse(localStorage.getItem("user"));
        console.log("💾 Saved to localStorage:", saved);

        // Hiển thị toast thành công
        toast.success(`Chào mừng ${user.fullname}! Đăng ký Google thành công.`);

        // Redirect based on role sau 1 giây
        setTimeout(() => {
          if (user.role === "admin" || user.role === "moderator") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Google sign up error:", error);
      console.error("Error response:", error.response?.data);

      setErrors({
        general: error.response?.data?.message || "Đăng ký bằng Google thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign Up Error
  const handleGoogleError = () => {
    console.error("Google sign up failed");
    setErrors({
      general: "Đăng ký bằng Google thất bại. Vui lòng thử lại.",
    });
  };

  return (
    <main className="min-h-screen bg-[#f9f9f9]">
      <div
        className="
          flex
          min-h-screen
          w-full
          items-center
          justify-center
          px-4
          py-8
          sm:px-6
        "
      >
        {/* Decorative background */}
        <div
          className="
            pointer-events-none
            fixed
            left-[-10%]
            top-[-10%]
            h-[40%]
            w-[40%]
            rounded-full
            bg-[#ffba00]/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            fixed
            bottom-[-10%]
            right-[-5%]
            h-[40%]
            w-[30%]
            rounded-full
            bg-green-300/10
            blur-3xl
          "
        />

        {/* Card */}
        <div
          className="
            relative
            z-10
            flex
            w-full
            max-w-[480px]
            flex-col
            rounded-xl
            bg-white
            p-6
            shadow-md
            sm:p-10
          "
        >
          {/* Header */}
          <div
            className="
              mb-7
              flex
              flex-col
              items-center
              gap-2
              text-center
            "
          >
            <div
              className="
                mb-3
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-[#ffba00]
                shadow-sm
              "
            >
              <Gift size={32} strokeWidth={2} className="text-[#6c4d00]" />
            </div>

            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-gray-900
              "
            >
              Đăng ký tài khoản mới
            </h1>

            <p
              className="
                text-sm
                leading-6
                text-gray-500
              "
            >
              Tham gia cộng đồng chia sẻ ngay hôm nay
            </p>
          </div>

          {/* General error */}
          {errors.general && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              {errors.general}
            </div>
          )}

          {/* Register form */}
          <RegisterForm
            form={form}
            errors={errors}
            loading={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">Hoặc</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Social Sign Up Buttons */}
          <SocialLoginButtons
            onGoogleSuccess={handleGoogleSuccess}
            onGoogleError={handleGoogleError}
          />

          {/* Login */}
          <div
            className="
              mt-6
              flex
              items-center
              justify-center
              gap-2
              border-t
              border-gray-200
              pt-6
            "
          >
            <span className="text-sm text-gray-500">Đã có tài khoản?</span>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                text-sm
                font-semibold
                text-[#b17b00]
                transition
                hover:text-[#7b5800]
                hover:underline
              "
            >
              Đăng nhập ngay
            </button>
          </div>

          {/* SMS Registration Option */}
          <div className="mt-4 text-center">
            <p className="mb-2 text-xs text-gray-500">Hoặc đăng ký bằng</p>
            <button
              type="button"
              onClick={() => navigate("/register-sms")}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                border-[#ffba00]
                bg-white
                px-4
                py-2
                text-sm
                font-semibold
                text-[#b17b00]
                transition
                hover:bg-[#ffba00]
                hover:text-[#6c4d00]
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Đăng ký bằng SMS
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
