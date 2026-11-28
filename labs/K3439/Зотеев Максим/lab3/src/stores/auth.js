import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi, usersApi } from '@/api'
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  saveStoredSession,
  updateStoredUser,
} from '@/api/storage'

function stripPassword(userData) {
  const { password: _password, ...publicFields } = userData
  void _password
  return publicFields
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getStoredToken())
  const user = ref(getStoredUser())

  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`.trim()
  })

  const initials = computed(() => {
    if (!user.value) return ''
    const first = user.value.firstName?.[0] ?? ''
    const last = user.value.lastName?.[0] ?? ''
    return `${first}${last}`.toUpperCase()
  })

  function setSession(session, remember = true) {
    const publicUser = stripPassword(session.user)
    saveStoredSession({ accessToken: session.accessToken, user: publicUser }, remember)
    token.value = session.accessToken
    user.value = publicUser
  }

  function clearSession() {
    clearStoredSession()
    token.value = null
    user.value = null
  }

  async function login({ email, password }, remember = true) {
    const session = await authApi.login({ email, password })
    setSession(session, remember)
    return user.value
  }

  async function register(fields) {
    const payload = {
      ...fields,
      since: new Date().getFullYear(),
      notify: true,
    }
    const session = await authApi.register(payload)
    setSession(session, true)
    return user.value
  }

  async function refreshProfile() {
    if (!user.value) return null
    const fresh = stripPassword(await usersApi.getById(user.value.id))
    updateStoredUser(fresh)
    user.value = fresh
    return fresh
  }

  async function updateProfile(fields) {
    if (!user.value) return null
    const updated = stripPassword(await usersApi.update(user.value.id, fields))
    updateStoredUser(updated)
    user.value = updated
    return updated
  }

  function logout() {
    clearSession()
  }

  return {
    token,
    user,
    isAuthenticated,
    fullName,
    initials,
    login,
    register,
    refreshProfile,
    updateProfile,
    logout,
    clearSession,
  }
})
