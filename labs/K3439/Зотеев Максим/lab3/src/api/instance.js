import axios from 'axios'
import { getStoredToken } from './storage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const ERROR_MESSAGES = {
  'Cannot find user': 'Неверный email или пароль',
  'Incorrect password': 'Неверный email или пароль',
  'Email already exists': 'Пользователь с таким email уже зарегистрирован',
  'Email format is invalid': 'Некорректный email',
  'Password is too short': 'Пароль слишком короткий',
}

let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

const instance = axios.create({
  baseURL: API_URL,
})

instance.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new Error('Сервер недоступен. Проверьте, что API запущено командой npm run api.'),
      )
    }

    const { status, data } = error.response

    // Токен json-server-auth истёк или сессия была завершена в другой вкладке
    if (status === 401) {
      onUnauthorized?.()
    }

    const defaultMessage =
      status === 403
        ? 'Недостаточно прав для выполнения этого действия.'
        : 'Не удалось выполнить запрос. Попробуйте ещё раз.'

    const message = (typeof data === 'string' && ERROR_MESSAGES[data]) || defaultMessage
    const normalized = new Error(message)
    normalized.status = status
    return Promise.reject(normalized)
  },
)

export default instance
