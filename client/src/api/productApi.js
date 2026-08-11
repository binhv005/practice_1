import axios from "axios";

const API_URL = "http://localhost:3000/api";

// =========================
// GET PRODUCTS
// =========================

export const getProducts = (filters) => {
  return axios.get(`${API_URL}/products`, {
    params: {
      keyword: filters.keyword,
      category: filters.category,
      status: filters.status,
      ward: filters.ward,
    },
  });
};

// =========================
// CREATE PRODUCT
// =========================

export const createProduct = (productData) => {
  return axios.post(`${API_URL}/products`, productData);
};

// =========================
// UPLOAD MULTIPLE IMAGES
// =========================

export const uploadProductImages = (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  return axios.post(`${API_URL}/products/upload-images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// =========================
// GET PRODUCT BY ID
// =========================

export const getProductById = (id) => {
  return axios.get(`${API_URL}/products/${id}`);
};

// =========================
// UPDATE PRODUCT
// =========================

export const updateProduct = (id, data) => {
  return axios.put(`${API_URL}/products/${id}`, data);
};

export const hideProduct = (id) => {
  return axios.put(`${API_URL}/products/${id}`, {
    status: "hidden",
  });
};
