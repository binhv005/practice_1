import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "https://practice-1-h6t5.onrender.com/api"}/auth`;

export const registerApi = (data) => {
  return axios.post(`${API_URL}/register`, data, {
    withCredentials: true,
  });
};

export const loginApi = (data) => {
  return axios.post(`${API_URL}/login`, data, {
    withCredentials: true,
  });
};

export const getMeApi = () => {
  return axios.get(`${API_URL}/me`, {
    withCredentials: true,
  });
};

export const logoutApi = () => {
  return axios.post(
    `${API_URL}/logout`,
    {},
    {
      withCredentials: true,
    },
  );
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPasswordApi = (email) => {
  return axios.post(
    `${API_URL}/forgot-password`,
    { email },
    {
      withCredentials: true,
    },
  );
};

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPasswordApi = (data) => {
  return axios.post(`${API_URL}/reset-password`, data, {
    withCredentials: true,
  });
};

// ======================================================
// GOOGLE LOGIN
// ======================================================

export const googleLoginApi = (data) => {
  return axios.post(`${API_URL}/google-login`, data, {
    withCredentials: true,
  });
};
