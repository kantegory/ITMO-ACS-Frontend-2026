// Безопасное хранение сессии: localStorage при «Запомнить меня», иначе sessionStorage
const TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

const memoryFallback = new Map()

function safeGet(store, key) {
  try {
    return store.getItem(key)
  } catch {
    return memoryFallback.get(key) ?? null
  }
}

function safeSet(store, key, value) {
  try {
    store.setItem(key, value)
  } catch {
    memoryFallback.set(key, value)
  }
}

function safeRemove(store, key) {
  try {
    store.removeItem(key)
  } catch {
    // Игнорируем ограничения приватного режима браузера
  }
  memoryFallback.delete(key)
}

function activeStore() {
  return safeGet(window.sessionStorage, TOKEN_KEY) ? window.sessionStorage : window.localStorage
}

export function getStoredToken() {
  return safeGet(activeStore(), TOKEN_KEY)
}

export function getStoredUser() {
  const raw = safeGet(activeStore(), USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveStoredSession({ accessToken, user }, remember = true) {
  clearStoredSession()
  const store = remember ? window.localStorage : window.sessionStorage
  safeSet(store, TOKEN_KEY, accessToken)
  safeSet(store, USER_KEY, JSON.stringify(user))
}

export function updateStoredUser(user) {
  safeSet(activeStore(), USER_KEY, JSON.stringify(user))
}

export function clearStoredSession() {
  safeRemove(window.localStorage, TOKEN_KEY)
  safeRemove(window.localStorage, USER_KEY)
  safeRemove(window.sessionStorage, TOKEN_KEY)
  safeRemove(window.sessionStorage, USER_KEY)
}
