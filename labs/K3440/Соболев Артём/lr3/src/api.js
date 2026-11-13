import axios from "axios";
export const TOKEN_KEY = "fitnessPlatformVueToken";
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 12000,
});
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data;
    const message = typeof data === "string" ? data : data?.message;
    const normalized = new Error(
      message ||
        (error.response
          ? "Не удалось выполнить запрос."
          : "Сервер недоступен. Проверьте запуск npm run server."),
    );
    normalized.status = error.response?.status;
    return Promise.reject(normalized);
  },
);
export default instance;
