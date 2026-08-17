import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./components/layout/AdminLayout";

import AdminProductPage from "./pages/AdminProductPage";
import UserProductPage from "./pages/UserProductPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MessagePage from "./pages/MessagePage";
import SavedProductsPage from "./pages/SavedProductsPage";

function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <p className="mt-2 text-gray-500">Tổng quan hệ thống quản trị.</p>
    </div>
  );
}

function CategoryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
    </div>
  );
}

function CampaignPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý chiến dịch</h1>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/*ADMIN */}

      <Route element={<AdminLayout />}>
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route path="/admin/dashboard" element={<DashboardPage />} />

        <Route path="/admin/products" element={<AdminProductPage />} />

        <Route path="/admin/categories" element={<CategoryPage />} />

        <Route path="/admin/campaigns" element={<CampaignPage />} />
      </Route>

      {/*USER*/}

      <Route path="/" element={<HomePage />} />
      <Route path="/my-products" element={<UserProductPage />} />
      <Route path="/saved-products" element={<SavedProductsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/messages" element={<MessagePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
