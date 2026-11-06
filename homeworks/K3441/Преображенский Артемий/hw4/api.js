"use strict";

const SESSION_KEY = "bat-go-session-v1";

function getSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    return session?.token && session.user?.id ? session : null;
  } catch {
    return null;
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

// fetch отправляет JSON и JWT. server.cjs передает запрос нужному Go-сервису.
async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const session = getSession();
  if (auth && session) headers.Authorization = `Bearer ${session.token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    // DELETE возвращает 204 без тела, остальные ответы API содержат JSON.
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      const messages = {
        400: "Проверьте введенные данные.",
        401: auth ? "Войдите в аккаунт, чтобы продолжить." : "Неверная почта или пароль.",
        403: "Недостаточно прав для этого действия.",
        404: "Запись не найдена.",
        409: path === "/auth/register" ? "Пользователь с такой почтой или телефоном уже зарегистрирован." : "Столик уже занят на выбранное время.",
        502: "Бэкенд недоступен. Проверьте, что сервисы запущены.",
        503: "Сервис временно недоступен. Повторите запрос.",
      };
      if (response.status === 401 && auth) logout();
      const error = new Error(messages[response.status] || "Не удалось выполнить запрос.");
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Сервер не ответил вовремя. Повторите запрос.");
    if (error instanceof TypeError) throw new Error("Не удалось связаться с сервером. Повторите запрос.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function queryString(values = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== "" && value != null) params.set(key, value);
  }
  return `?${params}`;
}

async function signIn(path, values) {
  const session = await request(path, { method: "POST", body: values, auth: false });
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    throw new Error("Не удалось сохранить вход. Разрешите хранение данных для сайта.");
  }
  return session.user;
}

// Здесь видны реальные маршруты Go API и поля его ответов.
window.TD_API = {
  getSession,
  logout,
  login: (values) => signIn("/auth/login", values),
  register: (values) => signIn("/auth/register", values),
  me: () => request("/auth/me"),
  restaurants: async (filters) => (await request(`/restaurants/${queryString(filters)}`)).restaurants || [],
  restaurant: async (id) => (await request(`/restaurants/${encodeURIComponent(id)}/`)).restaurant,
  menu: async (id) => (await request(`/restaurants/${encodeURIComponent(id)}/menu`)).items || [],
  reviews: async (id) => (await request(`/restaurants/${encodeURIComponent(id)}/reviews`)).items || [],
  tables: async (id) => (await request(`/restaurants/${encodeURIComponent(id)}/tables`)).items || [],
  table: async (restaurantId, tableId) => (await request(`/restaurants/${encodeURIComponent(restaurantId)}/tables/${encodeURIComponent(tableId)}`)).table,
  availability: async (restaurantId, tableId, startTime, endTime) => {
    const params = queryString({ start_time: startTime, end_time: endTime });
    const data = await request(`/restaurants/${encodeURIComponent(restaurantId)}/tables/${encodeURIComponent(tableId)}/availability${params}`);
    return data.available;
  },
  bookings: async () => (await request("/me/bookings")).bookings || [],
  createBooking: async (body) => (await request("/bookings", { method: "POST", body })).booking,
  cancelBooking: (id) => request(`/me/bookings/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
