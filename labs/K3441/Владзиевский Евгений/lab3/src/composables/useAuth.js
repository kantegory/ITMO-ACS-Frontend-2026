// Авторизация. Состояние общее для всего приложения, поэтому ref лежит
// вне функции: все, кто вызовет useAuth(), получат одни и те же ссылки.

import { computed, ref } from 'vue';
import { setToken, setUnauthorizedHandler } from '../api/http.js';
import * as api from '../api/resources.js';

const USER_KEY = 'klyuchi:user';

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

const user = ref(readUser());

function startSession({ accessToken, user: profile }) {
  // пароль в ответе приходить не должен, но хранить его точно незачем
  const { password, ...safe } = profile;
  setToken(accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(safe));
  user.value = safe;
}

function endSession() {
  setToken(null);
  localStorage.removeItem(USER_KEY);
  user.value = null;
}

// Если сервер ответил 401, сессия всё равно уже недействительна
setUnauthorizedHandler(endSession);

export function useAuth() {
  return {
    user,
    isLogged: computed(() => Boolean(user.value)),

    async login(email, password) {
      startSession(await api.login(email, password));
      return user.value;
    },

    async register(fields) {
      startSession(await api.register(fields));
      return user.value;
    },

    logout: endSession,

    // Профиль поменяли в настройках — обновляем и то, что лежит локально
    patchUser(fields) {
      const { password, ...safe } = fields;
      user.value = { ...user.value, ...safe };
      localStorage.setItem(USER_KEY, JSON.stringify(user.value));
    }
  };
}
