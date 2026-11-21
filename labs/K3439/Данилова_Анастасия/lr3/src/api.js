import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

export function errorText(error) {
  const data = error.response?.data
  if (typeof data === 'string') return data
  if (error.response) return 'Ошибка API (' + error.response.status + ')'
  return 'Не удалось связаться с API. Проверьте, что запущен мок-сервер.'
}
