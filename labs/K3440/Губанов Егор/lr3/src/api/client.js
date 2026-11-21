import axios from 'axios'
import { session, clearSession } from '../state/session.js'

export const client = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: { Accept: 'application/json' }
})

const translations = {
    'Email already exists': 'Эта почта уже зарегистрирована.',
    'Cannot find user': 'Неверная почта или пароль.',
    'Incorrect password': 'Неверная почта или пароль.',
    'Email format is invalid': 'Проверь адрес почты.',
    'Password is too short': 'Пароль должен содержать минимум 6 символов.',
    'Email and password are required': 'Укажи почту и пароль.'
}

client.interceptors.request.use(config => {
    if (config.requiresAuth) {
        if (!session.value) {
            const error = new Error('Сначала войди в аккаунт.')
            error.status = 401
            throw error
        }
        config.headers.Authorization = `Bearer ${session.value.accessToken}`
    }
    return config
})

client.interceptors.response.use(response => response, error => {
    if (axios.isCancel(error)) return Promise.reject(error)
    const status = error.response?.status || error.status || 0
    if (status === 401 && error.config?.requiresAuth) clearSession()
    const data = error.response?.data
    const serverMessage = typeof data === 'string' ? data.trim() : data?.message
    const fallback = {
        401: 'Сначала войди в аккаунт.',
        403: 'Нет доступа к этим данным.',
        404: 'Данные не найдены.'
    }[status] || 'Не удалось выполнить запрос.'
    const message = translations[serverMessage] ||
        (typeof data?.message === 'string' ? data.message : '') ||
        (status ? fallback : 'Сервер недоступен. Проверь, запущен ли npm run api.')
    const result = new Error(message)
    result.status = status
    return Promise.reject(result)
})