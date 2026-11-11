// Хранение сессии в localStorage: токен и данные пользователя,
// которые возвращает json-server-auth после входа или регистрации.

export function saveSession({ accessToken, user }) {
  localStorage.accessToken = accessToken
  localStorage.user = JSON.stringify(user)
}

export function updateSessionUser(user) {
  const current = getCurrentUser()
  localStorage.user = JSON.stringify({ ...current, ...user })
}

export function getToken() {
  return localStorage.accessToken
}

export function getCurrentUser() {
  try {
    return localStorage.user ? JSON.parse(localStorage.user) : null
  } catch {
    return null
  }
}

export function isLoggedIn() {
  return Boolean(getToken() && getCurrentUser())
}

export function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
}

export function goToLogin() {
  window.location.href = `login.html?next=${encodeURIComponent(location.pathname + location.search)}`
}

// страница только для авторизованных: иначе отправляем на вход
export function requireAuth() {
  if (!isLoggedIn()) {
    goToLogin()
    return null
  }
  return getCurrentUser()
}
