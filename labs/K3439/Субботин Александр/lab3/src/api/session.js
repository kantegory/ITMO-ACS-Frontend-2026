// Токен json-server-auth и данные пользователя храним в localStorage, как и в ЛР2

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

export const SESSION_KEYS = [TOKEN_KEY, USER_KEY]

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

// Пароль (даже хеш) в браузере не храним
export function saveUser({ password: _password, ...user }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function saveSession(accessToken, user) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  return saveUser(user)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
