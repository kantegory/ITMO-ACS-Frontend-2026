// Работа с API (json-server). Все запросы к серверу — только здесь.

const API_URL = "http://localhost:3000";

// общая функция запроса: добавляет токен, разбирает ошибки
async function request(path, method, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  let response;
  try {
    response = await fetch(API_URL + path, {
      method: method || "GET",
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error("Не удалось подключиться к серверу. Запущен ли json-server (npm start)?");
  }

  // 204 — успешный ответ без тела
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Ошибка " + response.status);
    error.status = response.status;
    throw error;
  }
  return data;
}

// ---------- каталог ----------
function getCategories() {
  return request("/categories");
}

// params — объект вида { shape: "CIRCLE", price_gte: 1000 }
function getCarpets(params) {
  const query = new URLSearchParams(params);
  query.set("_expand", "category");
  return request("/carpets?" + query.toString());
}

function getCarpet(id) {
  return request("/carpets/" + encodeURIComponent(id) + "?_expand=category");
}

// ---------- авторизация и профиль ----------
function registerRequest(data) {
  return request("/auth/register", "POST", data);
}

function loginRequest(data) {
  return request("/auth/login", "POST", data);
}

function logoutRequest() {
  return request("/auth/logout", "POST");
}

function getMe() {
  return request("/auth/me");
}

function updateMe(data) {
  return request("/auth/me", "PATCH", data);
}

function deleteMe() {
  return request("/auth/me", "DELETE");
}
