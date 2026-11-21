// Обёртка над fetch для работы с моковым API (json-server + json-server-auth)
const API_URL = "http://localhost:3001";

function getToken() {
  return localStorage.getItem("tablebook_token");
}

function currentUser() {
  const raw = localStorage.getItem("tablebook_user");
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem("tablebook_token", token);
  localStorage.setItem("tablebook_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("tablebook_token");
  localStorage.removeItem("tablebook_user");
}

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Ошибка запроса (${res.status})`;
    try {
      const data = await res.json();
      message = (typeof data === "string" ? data : data.message) || message;
    } catch (e) {}
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}
