const API_URL = ''

const ERROR_TEXT = {
  'Incorrect password': 'Неверный email или пароль',
  'Cannot find user': 'Неверный email или пароль',
  'Email already exists': 'Пользователь с таким email уже зарегистрирован',
  'Email format is invalid': 'Некорректный email',
  'Password is too short': 'Пароль слишком короткий',
  'jwt expired': 'Сессия истекла, войдите снова',
  'Already exists': 'Уже добавлено',
}

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('session'))
  } catch {
    return null
  }
}

function tokenExpired(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload)).exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function getToken() {
  const session = getSession()
  if (!session) return null
  if (tokenExpired(session.accessToken)) {
    logout()
    return null
  }
  return session.accessToken
}

function currentUser() {
  return getToken() ? getSession().user : null
}

function saveSession({ accessToken, user }) {
  localStorage.setItem('session', JSON.stringify({ accessToken, user }))
}

function logout() {
  localStorage.removeItem('session')
}

function loginUrl() {
  const page = location.pathname.split('/').pop() + location.search
  return `login.html?next=${encodeURIComponent(page)}`
}

function requireAuth() {
  const user = currentUser()
  if (!user) location.replace(loginUrl())
  return user
}

async function api(path, { method = 'GET', body } = {}) {
  const headers = {}
  const token = getToken()
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body && JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Сервер недоступен. Запустите API командой npm start.')
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && token) {
      logout()
      location.href = loginUrl()
    }
    const text = typeof data === 'string' ? data : ''
    const message = ERROR_TEXT[text] || `Ошибка сервера (${response.status})`
    throw new ApiError(response.status, message)
  }
  return data
}

function query(params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    ;[].concat(value).forEach((item) => {
      if (item !== '' && item !== null && item !== undefined) search.append(key, item)
    })
  })
  return search.toString()
}
