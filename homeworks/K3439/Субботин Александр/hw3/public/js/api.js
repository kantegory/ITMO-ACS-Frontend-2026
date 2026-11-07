// Работа с моковым API: json-server + json-server-auth.
// Страницы и API раздаёт один и тот же json-server, поэтому хватает относительных путей.

const API_URL = '';
const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

// json-server-auth отвечает строками на английском — переводим самые частые
const ERROR_MESSAGES = {
  'Email already exists': 'Пользователь с такой почтой уже зарегистрирован',
  'Cannot find user': 'Пользователь с такой почтой не найден',
  'Incorrect password': 'Неверный пароль',
  'Email format is invalid': 'Некорректный адрес почты',
  'Password is too short': 'Слишком короткий пароль',
  'jwt expired': 'Сессия истекла, войдите снова',
  'Failed to fetch': 'Сервер недоступен. Запущен ли json-server (npm start)?',
};

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

// Пароль (даже хеш) в браузере не храним
function saveUser({ password, ...user }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function setAuth(accessToken, user) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  saveUser(user);
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isLoggedIn() {
  return Boolean(getToken() && getUser());
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(0, ERROR_MESSAGES[error.message] ?? ERROR_MESSAGES['Failed to fetch']);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Токен json-server-auth живёт час: если он протух, разлогиниваем и просим войти снова
    if (response.status === 401 && token) {
      clearAuth();
      redirectToLogin();
    }
    const message = typeof data === 'string' ? data : data?.message;
    throw new ApiError(response.status, ERROR_MESSAGES[message] ?? message ?? `Ошибка ${response.status}`);
  }

  return data;
}

// Правило 600 пропускает GET списка, только если в коллекции уже есть хотя бы одна запись
// пользователя, иначе отвечает 403. Для нового пользователя без броней и избранного это пустой список
async function getOwnList(path) {
  try {
    return await request(path);
  } catch (error) {
    if (error.status === 403) return [];
    throw error;
  }
}

function redirectToLogin() {
  const next = window.location.pathname.split('/').pop() + window.location.search;
  window.location.href = `login.html?next=${encodeURIComponent(next)}`;
}

const api = {
  get: (path) => request(path),
  getOwnList,
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),

  login: (email, password) => request('/login', { method: 'POST', body: { email, password } }),
  register: (data) => request('/register', { method: 'POST', body: data }),
};
