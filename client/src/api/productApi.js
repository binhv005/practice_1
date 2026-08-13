import axios from "axios";

const API_URL = "http://localhost:3000/api";

// ======================================================
// GET PRODUCTS
// ======================================================

export const getProducts = (filters = {}) => {
  return axios.get(`${API_URL}/products`, {
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
  return axios.get(`${API_URL}/products/${id}`);
};

// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProduct = (productData) => {
  return axios.post(`${API_URL}/products`, productData);
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProduct = (id, data) => {
  return axios.put(`${API_URL}/products/${id}`, data);
};

// ======================================================
// HIDE PRODUCT
// ======================================================

export const hideProduct = (id) => {
  return axios.put(`${API_URL}/products/${id}`, {
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

  return axios.post(`${API_URL}/products/upload-images`, formData, {
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

  return axios.post(`${API_URL}/products/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
