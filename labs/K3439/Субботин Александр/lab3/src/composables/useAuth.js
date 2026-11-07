import { computed, readonly, ref } from 'vue'

import { authApi, usersApi } from '@/api'
import { clearSession, getStoredUser, getToken, saveSession, saveUser, SESSION_KEYS } from '@/api/session'

// Состояние сессии общее для всего приложения: refs объявлены вне функции,
// поэтому шапка, страницы и роутер видят одного и того же пользователя
const token = ref(getToken())
const user = ref(getStoredUser())
const isLoggedIn = computed(() => Boolean(token.value && user.value))

function setSession(accessToken, userData) {
  user.value = saveSession(accessToken, userData)
  token.value = accessToken
}

function setUser(userData) {
  user.value = saveUser(userData)
}

async function login(email, password) {
  const { accessToken, user: userData } = await authApi.login(email.trim().toLowerCase(), password)
  setSession(accessToken, userData)
}

async function register({ name, email, phone, password }) {
  const { accessToken, user: userData } = await authApi.register({
    email: email.trim().toLowerCase(),
    password,
    name: name.trim(),
    phone: phone.trim(),
    birthday: '',
    createdAt: new Date().toISOString().slice(0, 10),
    notifications: { email: true, sms: true, news: false, remindBefore: 2 },
  })
  setSession(accessToken, userData)
}

function logout() {
  clearSession()
  token.value = null
  user.value = null
}

// Свежие данные профиля с сервера (в localStorage они могли устареть)
async function refreshUser() {
  setUser(await usersApi.getById(user.value.id))
}

async function updateUser(changes) {
  setUser(await usersApi.update(user.value.id, changes))
}

// Вошли или вышли в другой вкладке — подхватываем
window.addEventListener('storage', (event) => {
  if (event.key !== null && !SESSION_KEYS.includes(event.key)) return
  token.value = getToken()
  user.value = getStoredUser()
})

export function useAuth() {
  return {
    user: readonly(user),
    isLoggedIn,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  }
}
