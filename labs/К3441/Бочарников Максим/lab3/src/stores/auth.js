import { defineStore } from 'pinia'
import { authApi } from '@/api'

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem(TOKEN_KEY) || null,
    user: readUser(),
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.accessToken && state.user),
  },

  actions: {
    saveSession({ accessToken, user }) {
      this.accessToken = accessToken
      this.user = user
      localStorage.setItem(TOKEN_KEY, accessToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },

    logout() {
      this.accessToken = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },

    async login(email, password) {
      const data = await authApi.login(email, password)
      this.saveSession(data)
      return data
    },

    async register(payload) {
      const data = await authApi.register(payload)
      this.saveSession(data)
      return data
    },
  },
})
