import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Lưu sản phẩm
 */
export const saveProduct = async (productId) => {
  const response = await api.post(`/saved-products/${productId}`);
  return response.data;
};

/**
 * Bỏ lưu sản phẩm
 */
export const unsaveProduct = async (productId) => {
  const response = await api.delete(`/saved-products/${productId}`);
  return response.data;
};

/**
 * Lấy danh sách sản phẩm đã lưu
 */
export const getSavedProducts = async (page = 1, limit = 12) => {
  const response = await api.get("/saved-products", {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Kiểm tra sản phẩm đã được lưu chưa
 */
export const checkProductSaved = async (productId) => {
  const response = await api.get(`/saved-products/${productId}/check`);
  return response.data;
};

export default api;
