// Запросы к моковому API и хранение сессии пользователя
const API_URL = 'http://localhost:3000';

const ERROR_MESSAGES = {
  'Cannot find user': 'Неверный email или пароль',
  'Incorrect password': 'Неверный email или пароль',
  'Email already exists': 'Пользователь с таким email уже зарегистрирован',
  'Email format is invalid': 'Некорректный email',
  'Password is too short': 'Пароль слишком короткий',
};

// «Запомнить меня» кладёт сессию в localStorage, иначе она живёт до закрытия вкладки
function sessionStore() {
  return sessionStorage.getItem('accessToken') ? sessionStorage : localStorage;
}

export function saveSession({ accessToken, user }, remember = true) {
  clearSession();
  const store = remember ? localStorage : sessionStorage;
  store.setItem('accessToken', accessToken);
  store.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  [localStorage, sessionStorage].forEach((store) => {
    store.removeItem('accessToken');
    store.removeItem('user');
  });
}

export function getToken() {
  return sessionStore().getItem('accessToken');
}

export function getUser() {
  return JSON.parse(sessionStore().getItem('user'));
}

export function updateStoredUser(user) {
  sessionStore().setItem('user', JSON.stringify(user));
}

function redirectToLogin() {
  const page = location.pathname.split('/').pop() + location.search;
  location.replace(`login.html?next=${encodeURIComponent(page)}`);
}

// Закрытые страницы: гостя отправляем на вход, после него он вернётся обратно
export function requireAuth() {
  if (getToken()) return getUser();
  redirectToLogin();
  return null;
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getToken();
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new Error('Сервер недоступен. Проверьте, что API запущено командой npm start.');
  }

  const data = await response.json().catch(() => null);

  // Токен json-server-auth живёт час, после этого нужно войти заново
  if (response.status === 401 && token) {
    clearSession();
    redirectToLogin();
  }

  if (!response.ok) {
    const error = new Error(ERROR_MESSAGES[data] ?? 'Не удалось выполнить запрос. Попробуйте ещё раз.');
    error.status = response.status;
    throw error;
  }

  return data;
}
