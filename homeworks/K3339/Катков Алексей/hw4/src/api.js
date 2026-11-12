import { session, saveSession } from './session'

const base = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api').replace(/\/$/, '')

export async function api(path, { method = 'GET', body } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  const headers = { Accept: 'application/json' }
  const token = session()?.accessToken
  if (token && !path.startsWith('/auth/')) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  try {
    const response = await fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal })
    if (response.status === 204) return {}
    const data = await response.json().catch(() => ({ message: 'Сервер вернул некорректный ответ.' }))
    if (!response.ok) {
      if (response.status === 401 && !path.startsWith('/auth/')) saveSession(null)
      const error = new Error(data.message || 'Не удалось выполнить запрос.')
      error.status = response.status
      throw error
    }
    return data
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Сервер не ответил вовремя. Повторите попытку.')
    if (error instanceof TypeError) throw new Error('Нет соединения с API. Проверьте, что сервер запущен, и повторите попытку.')
    throw error
  } finally {
    clearTimeout(timer)
  }
}
