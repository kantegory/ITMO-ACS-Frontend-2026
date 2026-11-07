import axios from 'axios'

import { toApiError } from '@/api/errors'
import router from '@/router'
import useAuthStore from '@/stores/auth'

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const instance = axios.create({
  baseURL: apiURL,
  paramsSerializer: { indexes: null },
})

instance.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.isAuthenticated) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const auth = useAuthStore()
    if (error.response?.status === 401 && auth.token) {
      auth.logout()
      const current = router.currentRoute.value
      if (current.meta.requiresAuth) {
        router.push({ name: 'login', query: { redirect: current.fullPath } })
      }
    }
    return Promise.reject(toApiError(error))
  },
)

export default instance
