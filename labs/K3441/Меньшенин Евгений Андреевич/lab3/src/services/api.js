import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("lozhka_token") ||
    sessionStorage.getItem("lozhka_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response)
      error.userMessage =
        "Не удалось связаться с сервисом. Попробуйте снова позже.";
    else
      error.userMessage =
        error.response.data?.message || `Ошибка сервера: ${error.response.status}`;
    return Promise.reject(error);
  },
);
