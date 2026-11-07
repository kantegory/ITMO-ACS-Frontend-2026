import axios from "axios";
export const TOKEN_KEY = "tablely-vue-token";
const client = axios.create({ baseURL: "/api", timeout: 10000 });
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (
      error.response?.status === 401 &&
      !["/login", "/register"].includes(error.config?.url)
    )
      sessionStorage.removeItem(TOKEN_KEY);
    return Promise.reject(
      new Error(
        error.response?.data?.message ||
          "Не удалось подключиться к серверу. Попробуйте ещё раз.",
      ),
    );
  },
);
export default client;
