// Работа с моковым API (json-server + json-server-auth).
// Все запросы идут через одну функцию request(), которая подставляет
// токен авторизации и разбирает ответ.

import { getToken, logout } from './auth.js'

export const API_URL = 'http://localhost:3000'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, params, auth = false } = {}) {
  const url = new URL(path, API_URL)

  // параметры вида { type: ['Супы', 'Завтраки'] } превращаются в ?type=Супы&type=Завтраки
  Object.entries(params ?? {}).forEach(([key, value]) => {
    ;[].concat(value).forEach((item) => {
      if (item !== undefined && item !== null && item !== '') url.searchParams.append(key, item)
    })
  })

  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (auth) headers.Authorization = `Bearer ${getToken()}`

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    // токен json-server-auth живёт час: после этого сессию нужно начать заново
    if (response.status === 401 && auth) {
      logout()
      throw new ApiError(401, 'Сессия истекла, войдите ещё раз')
    }
    throw new ApiError(response.status, typeof data === 'string' ? data : 'Ошибка запроса')
  }

  return data
}

/* ---------- авторизация ---------- */

export const login = (email, password) =>
  request('/login', { method: 'POST', body: { email, password } })

export const register = (user) =>
  request('/register', { method: 'POST', body: user })

/* ---------- пользователи ---------- */

export const getUser = (id) => request(`/users/${id}`)

export const getUsers = (params) => request('/users', { params })

export const updateUser = (id, data) =>
  request(`/users/${id}`, { method: 'PATCH', body: data, auth: true })

/* ---------- рецепты ---------- */

export const getRecipes = (params = {}) =>
  request('/recipes', { params: { _expand: 'user', _embed: 'likes', ...params } })

export const getRecipe = (id) => request(`/recipes/${id}`, { params: { _expand: 'user' } })

export const createRecipe = (data) =>
  request('/recipes', { method: 'POST', body: data, auth: true })

export const updateRecipe = (id, data) =>
  request(`/recipes/${id}`, { method: 'PATCH', body: data, auth: true })

export const deleteRecipe = (id) =>
  request(`/recipes/${id}`, { method: 'DELETE', auth: true })

/* ---------- комментарии ---------- */

export const getComments = (recipeId) =>
  request('/comments', {
    params: { recipeId, _expand: 'user', _sort: 'createdAt', _order: 'desc' }
  })

export const addComment = (data) =>
  request('/comments', { method: 'POST', body: data, auth: true })

export const deleteComment = (id) =>
  request(`/comments/${id}`, { method: 'DELETE', auth: true })

/* ---------- лайки, сохранённые, подписки ---------- */

export const getLikes = (params) => request('/likes', { params })

export const addLike = (userId, recipeId) =>
  request('/likes', { method: 'POST', body: { userId, recipeId }, auth: true })

export const removeLike = (id) => request(`/likes/${id}`, { method: 'DELETE', auth: true })

// /saves закрыт правилом 600: создавать, менять и удалять записи может
// только владелец. Список json-server-auth проверяет упрощённо: пускает,
// если в коллекции есть хоть одна запись текущего пользователя. Поэтому
// у пользователя без сохранений вместо [] приходит 403.
export const getSaves = (params) =>
  request('/saves', { params, auth: true }).catch((error) => {
    if (error.status === 403) return []
    throw error
  })

export const addSave = (userId, recipeId) =>
  request('/saves', { method: 'POST', body: { userId, recipeId }, auth: true })

export const removeSave = (id) => request(`/saves/${id}`, { method: 'DELETE', auth: true })

export const getSubscriptions = (params) => request('/subscriptions', { params })

export const subscribe = (userId, authorId) =>
  request('/subscriptions', { method: 'POST', body: { userId, authorId }, auth: true })

export const unsubscribe = (id) =>
  request(`/subscriptions/${id}`, { method: 'DELETE', auth: true })
