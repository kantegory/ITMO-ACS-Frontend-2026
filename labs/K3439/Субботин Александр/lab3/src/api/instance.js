import axios from 'axios'

import { getToken } from '@/api/session'

// Моковое API поднимает json-server с json-server-auth: npm run api.
// Адрес можно переопределить переменной окружения VITE_API_URL
const apiURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// json-server-auth отвечает строками на английском — переводим самые частые
const ERROR_MESSAGES = {
  'Email already exists': 'Пользователь с такой почтой уже зарегистрирован',
  'Cannot find user': 'Пользователь с такой почтой не найден',
  'Incorrect password': 'Неверный пароль',
  'Email format is invalid': 'Некорректный адрес почты',
  'Password is too short': 'Слишком короткий пароль',
  'jwt expired': 'Сессия истекла, войдите снова',
}
const NETWORK_ERROR = 'Сервер недоступен. Запущен ли json-server (npm run api)?'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Что делать, когда токен протух (401): разлогинить и отправить на вход. Задаётся в main.js,
// чтобы слой API не зависел от роутера
let unauthorizedHandler = () => {}

export function onUnauthorized(handler) {
  unauthorizedHandler = handler
}

const instance = axios.create({
  baseURL: apiURL,
  // json-server ждёт повторяющиеся параметры (?cuisineId=a&cuisineId=b), а не cuisineId[]=a
  paramsSerializer: { indexes: null },
})

instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) return Promise.reject(new ApiError(0, NETWORK_ERROR))

    const { status, data } = error.response
    // Токен json-server-auth живёт час: если он протух, разлогиниваем и просим войти снова
    if (status === 401 && getToken()) unauthorizedHandler()

    const message = typeof data === 'string' ? data : data?.message
    return Promise.reject(new ApiError(status, ERROR_MESSAGES[message] ?? message ?? `Ошибка ${status}`))
  },
)

// Правило 600 пропускает GET списка, только если в коллекции уже есть хотя бы одна запись
// пользователя, иначе отвечает 403. Для нового пользователя без броней и избранного это пустой список
export async function ownList(request) {
  try {
    return await request()
  } catch (error) {
    if (error.status === 403) return []
    throw error
  }
}

export default instance
