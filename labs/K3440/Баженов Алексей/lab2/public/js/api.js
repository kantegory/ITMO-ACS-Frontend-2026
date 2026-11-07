const API_URL = 'http://localhost:3000';

const Auth = {
  KEY: 'auth',
  read() {
    try { return JSON.parse(localStorage.getItem(this.KEY)); } catch (e) { return null; }
  },
  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify({ token: data.accessToken, user: data.user }));
  },
  clear() { localStorage.removeItem(this.KEY); },
  token() { const a = this.read(); return a ? a.token : null; },
  user() { const a = this.read(); return a ? a.user : null; },
  isLoggedIn() { return Boolean(this.token()); },
};

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const ERRORS = {
  'Incorrect password': 'Неверный пароль',
  'Cannot find user': 'Пользователь с таким email не найден',
  'Email already exists': 'Пользователь с таким email уже существует',
  'Email format is invalid': 'Некорректный email',
  'Password is too short': 'Слишком короткий пароль',
  'Email and password are required': 'Введите email и пароль',
  'jwt expired': 'Сессия истекла, войдите снова',
  'Missing authorization header': 'Требуется авторизация',
};

async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = Auth.token();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError('Сервер недоступен. Запустите его командой npm start.', 0);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const text = typeof data === 'string' ? data : (data && data.message) || response.statusText;
    if (response.status === 401 && token) Auth.clear(); // токен недействителен или истёк
    throw new ApiError(ERRORS[text] || text, response.status);
  }
  return data;
}

const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
};

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const formatDate = (iso) => iso.split('-').reverse().join('.'); // 2026-11-15 -> 15.11.2026

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function requireAuth() {
  if (Auth.isLoggedIn()) return true;
  const here = location.pathname.split('/').pop() + location.search;
  location.replace('login.html?next=' + encodeURIComponent(here));
  return false;
}

function safeNext() {
  const next = new URLSearchParams(location.search).get('next');
  return next && /^[\w-]+\.html(\?[\w=&%.-]*)?$/.test(next) ? next : null;
}
