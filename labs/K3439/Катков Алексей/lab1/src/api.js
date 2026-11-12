import initial from './seed.json'
import { session } from './session'
import { same, filterRecipes, validateRecipe } from './validation'

const KEY = 'shchepotka-lab1-data-v1'
const clone = (value) => JSON.parse(JSON.stringify(value))
const fail = (message, status = 400) => { const error = new Error(message); error.status = status; throw error }
const cleanUser = ({ passwordHash, ...user }) => user
const author = ({ id, name, bio }) => ({ id, name, bio })
const nextId = (items) => Math.max(0, ...items.map((item) => Number(item.id))) + 1
async function hash(password) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
async function load() {
  const saved = localStorage.getItem(KEY)
  if (saved) return JSON.parse(saved)
  const db = clone(initial)
  const passwordHash = await hash('Recipe367275!')
  db.users.forEach((user) => { user.passwordHash = passwordHash })
  localStorage.setItem(KEY, JSON.stringify(db))
  return db
}

export async function api(path, { method = 'GET', body = {} } = {}) {
  const url = new URL(path, 'http://local.test')
  const parts = url.pathname.split('/').filter(Boolean)
  const [resource, id] = parts
  const db = await load()
  let user = db.users.find((u) => session()?.accessToken === `local-${u.id}`)
  const requireUser = () => { if (!user) fail('Войдите в аккаунт, чтобы продолжить.', 401); return user }
  const save = (value) => { localStorage.setItem(KEY, JSON.stringify(db)); return clone(value) }
  if (resource === 'auth' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (id === 'register') {
      const name = String(body.name || '').trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) fail('Укажите корректный email.')
      if (name.length < 2 || name.length > 60) fail('Имя должно содержать от 2 до 60 символов.')
      if (password.length < 8 || new TextEncoder().encode(password).length > 72) fail('Пароль должен содержать от 8 до 72 байт.')
      if (db.users.some((u) => u.email === email)) fail('Этот email уже зарегистрирован.', 409)
      user = { id: nextId(db.users), name, email, bio: '', passwordHash: await hash(password) }
      db.users.push(user)
      return save({ user: cleanUser(user), accessToken: `local-${user.id}` })
    }
    if (id === 'login') {
      user = db.users.find((u) => u.email === email && u.passwordHash)
      if (!user || user.passwordHash !== await hash(password)) fail('Неверный email или пароль.', 401)
      return { user: cleanUser(user), accessToken: `local-${user.id}` }
    }
  }
  if (resource === 'me') {
    requireUser()
    if (method === 'PATCH') {
      const name = String(body.name || '').trim()
      const bio = String(body.bio || '').trim()
      if (name.length < 2 || name.length > 60 || bio.length > 500) fail('Проверьте имя (2-60 символов) и описание (до 500 символов).')
      Object.assign(user, { name, bio })
      return save(cleanUser(user))
    }
    return clone(cleanUser(user))
  }
  if (resource === 'authors' && method === 'GET') {
    const users = db.users.map(author)
    if (!id) return users
    return users.find((u) => same(u.id, id)) || fail('Автор не найден.', 404)
  }
  if (resource === 'recipes') {
    if (method === 'GET') {
      if (id) return clone(db.recipes.find((r) => same(r.id, id)) || fail('Рецепт не найден.', 404))
      return clone(filterRecipes(db.recipes, url.searchParams))
    }
    if (method === 'POST') {
      requireUser()
      const recipe = { ...validateRecipe(body), id: nextId(db.recipes), userId: user.id, createdAt: new Date().toISOString(), source: '' }
      db.recipes.push(recipe)
      return save(recipe)
    }
  }
  if (['comments', 'likes', 'saved', 'follows'].includes(resource)) {
    let items = db[resource]
    if (['saved', 'follows'].includes(resource)) {
      requireUser()
      items = items.filter((item) => same(item.userId, user.id))
    }
    if (method === 'GET') return clone(items.filter((item) => !url.searchParams.get('recipeId') || same(item.recipeId, url.searchParams.get('recipeId'))))
    requireUser()
    if (method === 'POST') {
      const targetKey = resource === 'follows' ? 'authorId' : 'recipeId'
      const targetId = Number(body[targetKey])
      if (targetKey === 'recipeId' && !db.recipes.some((r) => same(r.id, targetId))) fail('Рецепт не найден.', 404)
      if (targetKey === 'authorId' && (!db.users.some((u) => same(u.id, targetId)) || same(targetId, user.id))) fail('Нельзя подписаться на этого автора.')
      if (resource !== 'comments' && db[resource].some((item) => same(item.userId, user.id) && same(item[targetKey], targetId))) fail('Запись уже существует.', 409)
      const text = String(body.text || '').trim()
      if (resource === 'comments' && (!text || text.length > 1000)) fail('Комментарий должен содержать от 1 до 1000 символов.')
      const item = { id: nextId(db[resource]), userId: user.id, [targetKey]: targetId, ...(resource === 'comments' ? { text, createdAt: new Date().toISOString() } : {}) }
      db[resource].push(item)
      return save(item)
    }
    if (method === 'DELETE') {
      const index = db[resource].findIndex((item) => same(item.id, id) && same(item.userId, user.id))
      if (index === -1) fail('Запись не найдена.', 404)
      db[resource].splice(index, 1)
      return save({})
    }
  }
  fail('Страница API не найдена.', 404)
}
