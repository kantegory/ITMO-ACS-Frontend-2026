import axios from 'axios'

import useAuthStore from '@/stores/auth'

export const apiURL = 'http://localhost:3000'

// один общий экземпляр axios: базовый адрес, токен и ошибки настраиваются здесь
const instance = axios.create({
  baseURL: apiURL,
  // массивы как ?type=Супы&type=Завтраки — так их понимает json-server
  paramsSerializer: { indexes: null }
})

// к каждому запросу добавляем токен, если пользователь вошёл.
// synchronous: токен берётся в момент вызова, а не позже в цепочке промисов
instance.interceptors.request.use(
  (config) => {
    const auth = useAuthStore()
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }
    return config
  },
  null,
  { synchronous: true }
)

// токен json-server-auth живёт час: на 401 завершаем сессию,
// а куда перейти дальше, решает страница (через useApiError)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore().logout()
    }
    return Promise.reject(error)
  }
)

export default instance
