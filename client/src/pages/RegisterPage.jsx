import { useState } from "react";
import { Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

import RegisterForm from "../components/auth/RegisterForm";
import { registerApi } from "../api/authApi";
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
        // Đăng ký thành công - hiển thị modal success
        setForm({
          fullName: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeTerms: false,
        });

        // Thông báo thành công bằng Toast
        const successMessage = `Chào mừng ${response.data.user.fullname}! Tài khoản của bạn đã được tạo thành công.`;
        toast.success(successMessage);
        
        // Redirect về login sau 1.5 giây
        setTimeout(() => {
          navigate("/login");
        }, 1500);
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
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
