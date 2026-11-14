// Общий клиент Axios: адрес API, токен и обработка сетевых ошибок.
import { getToken } from "./session.js";

const API_ROOT = "http://127.0.0.1:3000/api";

// Общий Axios-клиент для запросов к локальному API.
export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const request = {
    url: `${API_ROOT}${path}`,
    method: options.method || "GET",
    headers,
  };
  if (options.body !== undefined) request.data = JSON.parse(options.body);

  try {
    const response = await axios.request(request);
    return response.data;
  } catch (error) {
    throw new Error(
      (typeof error.response?.data === "string" ? error.response.data : error.response?.data?.message) ||
        error.message ||
        "Не удалось выполнить запрос.",
    );
  }
}

export async function getCollection(name) {
  try {
    return await api(`/${name}`);
  } catch {
    return null;
  }
}

