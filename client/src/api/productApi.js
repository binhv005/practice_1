import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "https://practice-1-h6t5.onrender.com"}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ======================================================
// GET PRODUCTS
// ======================================================

export const getProducts = (filters = {}) => {
  return api.get("/products", {
    params: {
      keyword: filters.keyword || undefined,
      category: filters.category || undefined,
      status: filters.status || undefined,
      ward: filters.ward || undefined,
    },
  });
};

// ======================================================
// GET PRODUCT BY ID
// ======================================================

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProduct = (productData) => {
  return api.post("/products", productData);
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProduct = (id, data) => {
  return api.put(`/products/${id}`, data);
};

// ======================================================
// HIDE PRODUCT
// ======================================================

export const hideProduct = (id) => {
  return api.put(`/products/${id}`, {
    status: "hidden",
  });
};

// ======================================================
// UPLOAD MULTIPLE IMAGES
// ======================================================

export const uploadProductImages = (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  return api.post("/products/upload-images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ======================================================
// UPLOAD SINGLE IMAGE
// ======================================================

export const uploadProductImage = (file) => {
  const formData = new FormData();

  formData.append("image", file);

  return api.post("/products/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default api;
