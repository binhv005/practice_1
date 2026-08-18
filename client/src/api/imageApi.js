import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://practice-1-h6t5.onrender.com/api";

export const uploadProductImage = async (file) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await axios.post(
    `${API_URL}/products/upload-image`,
    formData,
  );

  // Return full response object so caller can access response.data.data.imageUrl
  return response;
};
