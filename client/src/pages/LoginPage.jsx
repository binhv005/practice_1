import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import LoginForm from "../components/auth/LoginForm";
import SocialLoginButtons from "../components/auth/SocialLoginButtons";
import { loginApi, googleLoginApi } from "../api/authApi";
import { loadCredentials, saveCredentials, clearCredentials } from "../utils/credentialsHelper";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load saved credentials khi component mount
  useEffect(() => {
    const credentials = loadCredentials();

    if (credentials) {
      setForm({
        identifier: credentials.identifier || "",
        password: credentials.password || "",
        rememberMe: credentials.rememberMe || false,
      });
    }
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Nếu user bỏ tick "Ghi nhớ", xóa saved credentials
    if (field === "rememberMe" && value === false) {
      clearCredentials();
    }

    // Khi user sửa field thì xóa lỗi field đó
    setErrors((prev) => ({
      ...prev,
      [field]: "",
      general: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.identifier.trim()) {
      newErrors.identifier = "Vui lòng nhập số điện thoại hoặc email";
    }

    if (!form.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (form.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
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

      // Gọi API đăng nhập
      const response = await loginApi({
        identifier: form.identifier,
        password: form.password,
        remember: form.rememberMe, // Gửi remember flag
      });

      if (response.data.success) {
        // Lưu thông tin user vào localStorage
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));

        // Lưu hoặc xóa credentials dựa vào checkbox "Ghi nhớ"
        if (form.rememberMe) {
          saveCredentials({
            identifier: form.identifier,
            password: form.password,
            rememberMe: true,
          });
        } else {
          clearCredentials();
        }

        // Redirect based on role
        if (user.role === "admin" || user.role === "moderator") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      setErrors({
        general: error.response?.data?.message || "Đăng nhập thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setErrors({});

      console.log("🔵 Google credential received:", credentialResponse);

      // Gọi API backend để verify và login với Google
      console.log("📡 Calling backend API /google-login...");
      const response = await googleLoginApi({
        credential: credentialResponse.credential,
      });

      console.log("✅ Backend response:", response.data);

      if (response.data.success) {
        const user = response.data.user;

        console.log("👤 User info:", user);
        console.log("📸 Avatar URL:", user.avatar);

        // Lưu user info
        localStorage.setItem("user", JSON.stringify(user));

        // Verify đã lưu
        const saved = JSON.parse(localStorage.getItem("user"));
        console.log("💾 Saved to localStorage:", saved);

        // Redirect based on role
        if (user.role === "admin" || user.role === "moderator") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("❌ Google login error:", error);
      console.error("Error response:", error.response?.data);

      setErrors({
        general: error.response?.data?.message || "Đăng nhập bằng Google thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login Error
  const handleGoogleError = () => {
    console.error("Google login failed");
    setErrors({
      general: "Đăng nhập bằng Google thất bại. Vui lòng thử lại.",
    });
  };

  return (
    <main className="min-h-screen bg-[#f9f9f9]">
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12">
        {/* Background decoration */}
        <div
          className="
            pointer-events-none
            absolute
            left-[-5%]
            top-[-10%]
            h-[40%]
            w-[40%]
            rounded-full
            bg-[#ffba00]/20
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-[-10%]
            right-[-5%]
            h-[50%]
            w-[30%]
            rounded-full
            bg-green-300/10
            blur-3xl
          "
        />

        {/* Login card */}
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
            p-8
            shadow-md
            sm:p-12
          "
        >
          {/* Header */}
          <div className="mb-8 flex flex-col items-center">
            <div
              className="
    mb-4
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
                text-center
                text-2xl
                font-bold
                tracking-tight
                text-gray-900
              "
            >
              Chào mừng bạn quay lại
            </h1>

            <p
              className="
                mt-2
                text-center
                text-sm
                leading-6
                text-gray-500
              "
            >
              Vui lòng đăng nhập để tiếp tục mua bán trên Mini Marketplace.
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

          {/* Form */}
          <LoginForm
            form={form}
            errors={errors}
            loading={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          {/* Divider */}
          <div className="my-6 flex w-full items-center">
            <div className="h-px flex-1 bg-gray-200" />

            <span
              className="
                px-4
                text-xs
                font-medium
                uppercase
                tracking-wider
                text-gray-400
              "
            >
              Hoặc đăng nhập bằng
            </span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Social */}
          <SocialLoginButtons
            onGoogleSuccess={handleGoogleSuccess}
            onGoogleError={handleGoogleError}
          />

          {/* Register */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="
                  font-semibold
                  text-[#b17b00]
                  transition
                  hover:text-[#7b5800]
                "
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
