import jsonServer from 'json-server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { filterRecipes, same, validateRecipe } from '../src/validation.js'

const cleanUser = ({ passwordHash, ...user }) => user
const publicUser = ({ id, name, bio }) => ({ id, name, bio })
const nextId = (items) => Math.max(0, ...items.map((item) => Number(item.id))) + 1
const error = (message, status = 400) => { const value = new Error(message); value.status = status; throw value }

export function createApi({ dbPath = resolve(import.meta.dirname, '../.runtime/db.json'), secret = process.env.JWT_SECRET } = {}) {
  mkdirSync(dirname(dbPath), { recursive: true })
  if (!existsSync(dbPath)) {
    const seed = JSON.parse(readFileSync(new URL('../src/seed.json', import.meta.url), 'utf8'))
    seed.users.forEach((user) => { user.passwordHash = bcrypt.hashSync('Recipe367275!', 10) })
    writeFileSync(dbPath, JSON.stringify(seed, null, 2))
  }
  const secretPath = resolve(dirname(dbPath), 'jwt-secret')
  if (!secret) {
    if (!existsSync(secretPath)) writeFileSync(secretPath, randomBytes(48).toString('base64url'), { mode: 0o600 })
    secret = readFileSync(secretPath, 'utf8').trim()
  }
  if (Buffer.byteLength(secret) < 32) throw new Error('JWT_SECRET must contain at least 32 bytes')
  const app = jsonServer.create()
  const router = jsonServer.router(dbPath)
  const db = router.db
  const list = (name) => db.get(name).value()
  const replace = (name, items) => db.set(name, items).write()
  const current = (req) => req.user || error('Войдите в аккаунт, чтобы продолжить.', 401)
  const authResult = (user) => ({ user: cleanUser(user), accessToken: jwt.sign({}, secret, { subject: String(user.id), expiresIn: '1d', algorithm: 'HS256', issuer: 'shchepotka', audience: 'shchepotka-web' }) })

  app.use(jsonServer.defaults({ static: resolve(import.meta.dirname, '../public'), logger: false }))
  app.use(jsonServer.bodyParser)
  app.use((req, res, next) => {
    if (['POST', 'PATCH'].includes(req.method) && (!req.is('application/json') || !req.body || typeof req.body !== 'object' || Array.isArray(req.body))) return res.status(400).json({ message: 'Ожидается JSON-объект.' })
    next()
  })
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))
  app.use('/api', (req, _res, next) => {
    if (req.path.startsWith('/auth/')) return next()
    const authorization = req.get('Authorization')
    if (!authorization) return next()
    try {
      if (!/^Bearer [^\s]+$/.test(authorization)) return next(Object.assign(new Error('Некорректный токен.'), { status: 401 }))
      const payload = jwt.verify(authorization.slice(7), secret, { algorithms: ['HS256'], issuer: 'shchepotka', audience: 'shchepotka-web' })
      req.user = list('users').find((user) => same(user.id, payload.sub))
      if (!req.user) return next(Object.assign(new Error('Пользователь не найден.'), { status: 401 }))
      next()
    } catch {
      next(Object.assign(new Error('Сеанс истёк или токен недействителен. Войдите снова.'), { status: 401 }))
    }
  })
  app.post('/api/auth/register', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const name = String(req.body.name || '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) error('Укажите корректный email.')
    if (name.length < 2 || name.length > 60) error('Имя должно содержать от 2 до 60 символов.')
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) error('Пароль должен содержать от 8 до 72 байт.')
    if (list('users').some((user) => user.email === email)) error('Этот email уже зарегистрирован.', 409)
    const user = { id: nextId(list('users')), email, name, bio: '', passwordHash: bcrypt.hashSync(password, 10) }
    replace('users', [...list('users'), user])
    res.status(201).json(authResult(user))
  })
  app.post('/api/auth/login', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const user = list('users').find((item) => item.email === email)
    if (Buffer.byteLength(password, 'utf8') > 72 || !user || !bcrypt.compareSync(password, user.passwordHash)) error('Неверный email или пароль.', 401)
    res.json(authResult(user))
  })
  app.get('/api/me', (req, res) => res.json(cleanUser(current(req))))
  app.patch('/api/me', (req, res) => {
    const user = current(req)
    const name = String(req.body.name || '').trim()
    const bio = String(req.body.bio || '').trim()
    if (name.length < 2 || name.length > 60 || bio.length > 500) error('Проверьте имя (2-60 символов) и описание (до 500 символов).')
    const updated = { ...user, name, bio }
    replace('users', list('users').map((item) => same(item.id, user.id) ? updated : item))
    res.json(cleanUser(updated))
  })
  app.get('/api/authors', (_req, res) => res.json(list('users').map(publicUser)))
  app.get('/api/authors/:id', (req, res) => {
    const user = list('users').find((item) => same(item.id, req.params.id))
    if (!user) error('Автор не найден.', 404)
    res.json(publicUser(user))
  })
  app.get('/api/recipes', (req, res) => {
    const query = new URL(req.originalUrl, 'http://localhost').searchParams
    res.json(filterRecipes([...list('recipes')], query))
  })
  app.get('/api/recipes/:id', (req, res) => {
    const recipe = list('recipes').find((item) => same(item.id, req.params.id))
    if (!recipe) error('Рецепт не найден.', 404)
    res.json(recipe)
  })
  app.post('/api/recipes', (req, res) => {
    const user = current(req)
    let input
    try { input = validateRecipe(req.body) } catch (err) { error(err.message) }
    const recipe = { ...input, id: nextId(list('recipes')), userId: user.id, createdAt: new Date().toISOString(), source: '' }
    replace('recipes', [...list('recipes'), recipe])
    res.status(201).json(recipe)
  })
  for (const resource of ['comments', 'likes', 'saved', 'follows']) {
    app.get(`/api/${resource}`, (req, res) => {
      let items = list(resource)
      if (['saved', 'follows'].includes(resource)) {
        const user = current(req)
        items = items.filter((item) => same(item.userId, user.id))
      }
      res.json(items.filter((item) => !req.query.recipeId || same(item.recipeId, req.query.recipeId)))
    })
    app.post(`/api/${resource}`, (req, res) => {
      const user = current(req)
      const targetKey = resource === 'follows' ? 'authorId' : 'recipeId'
      const targetId = Number(req.body[targetKey])
      if (targetKey === 'recipeId' && !list('recipes').some((item) => same(item.id, targetId))) error('Рецепт не найден.', 404)
      if (targetKey === 'authorId' && (!list('users').some((item) => same(item.id, targetId)) || same(user.id, targetId))) error('Нельзя подписаться на этого автора.')
      if (resource !== 'comments' && list(resource).some((item) => same(item.userId, user.id) && same(item[targetKey], targetId))) error('Запись уже существует.', 409)
      const text = String(req.body.text || '').trim()
      if (resource === 'comments' && (!text || text.length > 1000)) error('Комментарий должен содержать от 1 до 1000 символов.')
      const item = { id: nextId(list(resource)), userId: user.id, [targetKey]: targetId, ...(resource === 'comments' ? { text, createdAt: new Date().toISOString() } : {}) }
      replace(resource, [...list(resource), item])
      res.status(201).json(item)
    })
    app.delete(`/api/${resource}/:id`, (req, res) => {
      const user = current(req)
      const item = list(resource).find((value) => same(value.id, req.params.id) && same(value.userId, user.id))
      if (!item) error('Запись не найдена.', 404)
      replace(resource, list(resource).filter((value) => !same(value.id, item.id)))
      res.status(204).end()
    })
  }
  app.use((_req, res) => res.status(404).json({ message: 'Маршрут не найден.' }))
  app.use((err, _req, res, _next) => {
    const status = err.status || 500
    res.status(status).json({ message: status >= 500 ? 'Ошибка сервера. Повторите попытку позже.' : err.message })
  })
  return app
}
