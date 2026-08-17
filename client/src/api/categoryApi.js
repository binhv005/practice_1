import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "https://practice-1-h6t5.onrender.com"}/api`;

export const getCategories = () => {
  return axios.get(`${API_URL}/categories`);
};
