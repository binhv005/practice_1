import axios from "axios";

const API_URL = "http://localhost:3000/api";

export const uploadProductImage = async (file) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await axios.post(
    `${API_URL}/products/upload-image`,
    formData,
  );

  return response.data.data.imageUrl;
};
