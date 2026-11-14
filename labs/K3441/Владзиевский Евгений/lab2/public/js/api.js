// Слой работы с API. Все запросы к json-server идут отсюда.
//
// Сервер один: он же отдаёт статику, он же API по адресам /api/*.
// Поэтому запросы относительные и CORS не нужен.
//
// Авторизация — json-server-auth: POST /api/login возвращает accessToken,
// дальше токен уходит в заголовке Authorization: Bearer <token>.

const API_BASE = '/api';
const TOKEN_KEY = 'klyuchi:token';
const USER_KEY = 'klyuchi:user';

// Ошибка с кодом ответа, чтобы вызывающий код мог отличить 401 от 404
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const api = {
  get token() { return storage.get(TOKEN_KEY, null); },
  get user() { return storage.get(USER_KEY, null); },
  get isLogged() { return Boolean(this.token); },

  // Собирает строку запроса. Массив превращается в несколько одинаковых
  // параметров: ?type=flat&type=room — json-server понимает это как «или».
  query(params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) value.forEach(v => search.append(key, v));
      else search.append(key, value);
    }
    const s = search.toString();
    return s ? `?${s}` : '';
  },

  async request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth || this.isLogged) {
      const token = this.token;
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(API_BASE + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch (e) {
      // сюда попадаем, если сервер не запущен
      throw new ApiError(0, 'Сервер не отвечает. Запустите его командой npm start');
    }

    if (response.status === 401) {
      // токен протух или его нет — выкидываем на вход
      this.forgetSession();
      throw new ApiError(401, 'Нужно войти заново');
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new ApiError(response.status, typeof data === 'string' ? data : (data?.message || `Ошибка ${response.status}`));
    }

    // json-server кладёт общее число записей в заголовок
    const total = response.headers.get('X-Total-Count');
    if (total !== null && Array.isArray(data)) data.total = Number(total);

    return data;
  },

  getList(resource, params = {}) { return this.request(resource + this.query(params)); },

  // Список своих записей в приватной коллекции.
  //
  // Охранник json-server-auth на GET всей коллекции проверяет владельца
  // через Array.some() — то есть пропускает запрос, если хотя бы одна
  // запись твоя, и отдаёт коллекцию целиком (в исходниках это помечено
  // как «too relax»). Поэтому фильтр по userId добавляем сами: тогда
  // json-server вернёт ровно свои записи.
  //
  // Обратная сторона той же проверки: если своих записей нет ни одной,
  // some() даёт false и сервер отвечает 403. Для списка это просто
  // «пусто», так что 403 превращаем в пустой массив.
  async getMine(resource, params = {}) {
    try {
      return await this.getList(resource, { userId: this.user?.id, ...params });
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) return [];
      throw e;
    }
  },
  getOne(resource, id, params = {}) { return this.request(`${resource}/${id}` + this.query(params)); },
  create(resource, body) { return this.request(resource, { method: 'POST', body, auth: true }); },
  update(resource, id, body) { return this.request(`${resource}/${id}`, { method: 'PATCH', body, auth: true }); },
  remove(resource, id) { return this.request(`${resource}/${id}`, { method: 'DELETE', auth: true }); },

  // ---------- Авторизация ----------

  async login(email, password) {
    const data = await this.request('/login', { method: 'POST', body: { email, password } });
    this.startSession(data);
    return data.user;
  },

  async register(fields) {
    const data = await this.request('/register', { method: 'POST', body: fields });
    this.startSession(data);
    return data.user;
  },

  startSession({ accessToken, user }) {
    storage.set(TOKEN_KEY, accessToken);
    // пароль обратно приходить не должен, но на всякий случай не храним
    const { password, ...safe } = user;
    storage.set(USER_KEY, safe);
  },

  forgetSession() {
    storage.remove(TOKEN_KEY);
    storage.remove(USER_KEY);
  },

  logout() {
    this.forgetSession();
    window.location.href = 'index.html';
  },

  // Уводит на страницу входа, если страница доступна только своим
  requireLogin() {
    if (this.isLogged) return true;
    const back = encodeURIComponent(location.pathname.split('/').pop() + location.search + location.hash);
    window.location.replace(`login.html?next=${back}`);
    return false;
  }
};

// Показывает ошибку запроса пользователю, а не только в консоли
function reportError(e, where) {
  console.error(where, e);
  if (e instanceof ApiError && e.status === 401) return; // уже перекинули на вход
  showToast(e.message || 'Что-то пошло не так');
}
