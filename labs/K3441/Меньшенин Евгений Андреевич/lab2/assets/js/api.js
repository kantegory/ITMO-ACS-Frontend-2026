const API_URL = 'http://localhost:3000';
const TOKEN_KEY = 'lozhka_token';
const USER_KEY = 'lozhka_user';

const session = {
  get token() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },
  get user() {
    try {
      const value = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return value ? JSON.parse(value) : null;
    }
    catch { return null; }
  },
  save(data, persistent = true) {
    this.clear();
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, data.accessToken);
    storage.setItem(USER_KEY, JSON.stringify(data.user));
  },
  updateUser(user) {
    const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    [localStorage, sessionStorage].forEach((storage) => {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
    });
  }
};

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (session.token) headers.set('Authorization', `Bearer ${session.token}`);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Не удалось связаться с сервисом. Попробуйте снова позже.');
  }

  if (!response.ok) {
    let message = `Ошибка сервера: ${response.status}`;
    try { message = (await response.json()).message || message; } catch { /* empty body */ }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

window.LozhkaApi = { api, session, API_URL };
