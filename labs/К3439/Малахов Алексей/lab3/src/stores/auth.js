import { defineStore } from 'pinia'

import { authApi, profilesApi } from '@/api'

function tokenExpired(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload)).exp * 1000 < Date.now()
  } catch {
    return true
  }
}

const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token) && !tokenExpired(state.token),
    userId: (state) => state.user?.id ?? null,
  },

  actions: {
    async login(email, password) {
      const { data } = await authApi.login({ email, password })
      this.token = data.accessToken
      this.user = data.user
    },

    async register({ name, email, password }) {
      const { data } = await authApi.register({ name, email, password })
      this.token = data.accessToken
      this.user = data.user
      await profilesApi.create({
        id: data.user.id,
        userId: data.user.id,
        name,
        username: email.split('@')[0],
        city: '',
        bio: '',
      })
    },

    setName(name) {
      if (this.user) this.user = { ...this.user, name }
    },

    logout() {
      this.token = null
      this.user = null
    },
  },
})

export default useAuthStore
