import { defineStore } from 'pinia'

import { authApi, usersApi } from '@/api'

// Хранилище авторизации: токен и данные вошедшего пользователя
const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.token && state.user)
  },

  actions: {
    async login(email, password) {
      const response = await authApi.login(email, password)
      this.token = response.data.accessToken
      this.user = response.data.user
      return response
    },

    async register(data) {
      const response = await authApi.register(data)
      this.token = response.data.accessToken
      this.user = response.data.user
      return response
    },

    async updateProfile(data) {
      const response = await usersApi.update(this.user.id, data)
      this.user = { ...this.user, ...data }
      return response
    },

    logout() {
      this.token = null
      this.user = null
    }
  }
})

export default useAuthStore
