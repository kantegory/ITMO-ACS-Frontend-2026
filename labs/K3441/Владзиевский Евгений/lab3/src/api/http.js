// Один экземпляр axios на всё приложение.
//
// Перехватчики делают две вещи, которые иначе пришлось бы повторять
// в каждом запросе: подставляют токен и разбирают ошибки.

import axios from 'axios';

const TOKEN_KEY = 'klyuchi:token';

export const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

export function getToken() {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY));
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  else localStorage.removeItem(TOKEN_KEY);
}

// Запрос: добавляем Authorization, если токен есть
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Ошибка с понятным текстом вместо «Request failed with status code 401»
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Что делать с 401, решает не этот файл: он только сообщает наверх.
// Обработчик ставит useAuth, иначе получился бы круг импортов.
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new ApiError(0, 'Сервер не отвечает. Запустите его командой npm run api'));
    }

    const { status, data } = error.response;
    if (status === 401) onUnauthorized();

    const text = typeof data === 'string' ? data : data?.message;
    const messages = {
      401: 'Нужно войти заново',
      403: 'Нет доступа к этим данным',
      404: 'Не найдено'
    };
    return Promise.reject(new ApiError(status, text || messages[status] || `Ошибка ${status}`));
  }
);
