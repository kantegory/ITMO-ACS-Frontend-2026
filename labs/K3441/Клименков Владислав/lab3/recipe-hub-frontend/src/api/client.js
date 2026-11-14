/**
 * client.js — единственное место, где выполняются HTTP-запросы.
 *
 * Axios-инстанс:
 *  - подставляет Bearer-токен во все запросы;
 *  - нормализует ошибки в ApiError с HTTP-статусом;
 *  - отмечает доступность API (для баннера в App.vue);
 *  - не считает отменённые запросы (AbortController) ошибками сети.
 */

import axios from 'axios';
import { ref } from 'vue';
import { getToken } from './token';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/** Доступен ли API. Используется баннером в App.vue. */
export const isApiOnline = ref(true);

/** Ошибка запроса к API с HTTP-статусом и телом ответа. */
export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractMessage(data, status) {
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (data && typeof data === 'object' && data.message) return data.message;

  switch (status) {
    case 400:
      return 'Проверьте корректность введённых данных.';
    case 401:
      return 'Требуется авторизация.';
    case 403:
      return 'Недостаточно прав для этого действия.';
    case 404:
      return 'Запись не найдена.';
    default:
      return `Ошибка запроса (HTTP ${status}).`;
  }
}

http.interceptors.response.use(
  (response) => {
    isApiOnline.value = true;
    return response;
  },
  (error) => {
    // Отмена устаревшего поискового запроса — это не ошибка.
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    if (!error.response) {
      isApiOnline.value = false;
      return Promise.reject(
        new ApiError(
          'Не удалось подключиться к API. Запустите npm run api и обновите страницу.',
          0,
        ),
      );
    }

    isApiOnline.value = true;
    const { status, data } = error.response;
    return Promise.reject(
      new ApiError(extractMessage(data, status), status, data),
    );
  },
);

/**
 * Собрать query-параметры. Массивы превращаются в повторяющиеся параметры:
 * `id=1&id=2` — так json-server понимает выборку нескольких записей.
 */
export function buildParams(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          search.append(key, String(item));
        }
      });
      return;
    }

    search.append(key, String(value));
  });

  return search;
}

export async function get(path, config = {}) {
  const { data } = await http.get(path, config);
  return data;
}

export async function post(path, body, config = {}) {
  const { data } = await http.post(path, body, config);
  return data;
}

export async function patch(path, body, config = {}) {
  const { data } = await http.patch(path, body, config);
  return data;
}

export async function del(path, config = {}) {
  const { data } = await http.delete(path, config);
  return data;
}

export { http };
