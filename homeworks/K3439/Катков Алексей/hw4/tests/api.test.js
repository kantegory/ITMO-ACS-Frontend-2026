import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { once } from 'node:events'
import jwt from 'jsonwebtoken'
import { createApi } from '../server/app.js'

test('Recipe API: authentication, ownership and persistence', async (t) => {
  const runtime = resolve(import.meta.dirname, '../.runtime')
  mkdirSync(runtime, { recursive: true })
  const directory = mkdtempSync(join(runtime, 'api-test-'))
  const dbPath = join(directory, 'db.json')
  const secret = 'test-only-secret-for-isolated-api-checks-367275'
  const server = createApi({ dbPath, secret }).listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => new Promise((done) => server.close(done)))
  const base = `http://127.0.0.1:${server.address().port}/api`
  async function request(path, { method = 'GET', body, token } = {}) {
    const response = await fetch(base + path, { method, headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) })
    return { status: response.status, data: response.status === 204 ? null : await response.json() }
  }
  let token
  let userId
  let commentId
  await t.test('catalog filters combine and private user fields stay private', async () => {
    assert.equal((await request('/recipes')).data.length, 6)
    const filtered = await request(`/recipes?type=${encodeURIComponent('Салат')}&difficulty=${encodeURIComponent('Легко')}&ingredient=${encodeURIComponent('томаты')}`)
    assert.equal(filtered.status, 200)
    assert.equal(filtered.data.length, 1)
    assert.equal(filtered.data[0].id, 4)
    const authors = (await request('/authors')).data
    assert.ok(authors.every((user) => !('email' in user) && !('passwordHash' in user)))
    assert.equal((await request('/users')).status, 404)
    assert.equal((await request('/db')).status, 404)
  })
  await t.test('anonymous writes and private collections require authentication', async () => {
    for (const resource of ['recipes', 'comments', 'likes', 'saved', 'follows']) assert.equal((await request(`/${resource}`, { method: 'POST', body: {} })).status, 401)
    assert.equal((await request('/me')).status, 401)
    assert.equal((await request('/saved')).status, 401)
    assert.equal((await request('/follows')).status, 401)
  })
  await t.test('registration normalizes email and rejects duplicates and bcrypt truncation', async () => {
    const body = { name: 'Проверка API', email: 'API-CHECK@example.test', password: 'ExampleRecipe!2026', userId: 1 }
    const result = await request('/auth/register', { method: 'POST', body })
    assert.equal(result.status, 201)
    token = result.data.accessToken
    userId = result.data.user.id
    assert.equal(result.data.user.email, 'api-check@example.test')
    assert.equal('passwordHash' in result.data.user, false)
    assert.equal((await request('/auth/register', { method: 'POST', body: { ...body, email: 'api-check@example.test' } })).status, 409)
    assert.equal((await request('/auth/register', { method: 'POST', body: { ...body, email: 'long@example.test', password: 'я'.repeat(40) } })).status, 400)
    const users = JSON.parse(readFileSync(dbPath, 'utf8')).users
    assert.ok(users.every((user) => user.passwordHash.startsWith('$2')))
    assert.equal(JSON.stringify(users).includes('ExampleRecipe!2026'), false)
  })
  await t.test('login rejects wrong passwords and returns a working JWT', async () => {
    const body = { email: 'api-check@example.test', password: 'wrong-password' }
    assert.equal((await request('/auth/login', { method: 'POST', body })).status, 401)
    const result = await request('/auth/login', { method: 'POST', body: { ...body, password: 'ExampleRecipe!2026' } })
    assert.equal(result.status, 200)
    assert.equal((await request('/me', { token: result.data.accessToken })).data.id, userId)
    assert.equal((await request('/me', { token: token + 'changed' })).status, 401)
    const expired = jwt.sign({}, secret, { subject: String(userId), expiresIn: -1, issuer: 'shchepotka', audience: 'shchepotka-web' })
    assert.equal((await request('/me', { token: expired })).status, 401)
  })
  await t.test('comment owner is derived from JWT and other users cannot delete it', async () => {
    const comment = await request('/comments', { method: 'POST', token, body: { recipeId: 1, text: 'Комментарий для проверки прав.', userId: 1 } })
    assert.equal(comment.status, 201)
    assert.equal(comment.data.userId, userId)
    commentId = comment.data.id
    assert.equal((await request('/comments/1', { method: 'DELETE', token })).status, 404)
    const other = await request('/auth/login', { method: 'POST', body: { email: 'alexey@example.test', password: 'Recipe367275!' } })
    assert.equal((await request(`/comments/${commentId}`, { method: 'DELETE', token: other.data.accessToken })).status, 404)
    assert.ok((await request('/comments?recipeId=1')).data.some((comment) => comment.id === commentId))
    assert.equal((await request(`/comments/${commentId}`, { method: 'DELETE', token })).status, 204)
  })
  await t.test('saved recipes are isolated and duplicate social records are rejected', async () => {
    assert.deepEqual((await request('/saved?userId=1', { token })).data, [])
    const saved = await request('/saved', { method: 'POST', token, body: { recipeId: 1, userId: 1 } })
    assert.equal(saved.status, 201)
    assert.equal(saved.data.userId, userId)
    assert.equal((await request('/saved', { method: 'POST', token, body: { recipeId: 1 } })).status, 409)
    assert.equal((await request('/saved/1', { method: 'DELETE', token })).status, 404)
    assert.equal((await request('/follows', { method: 'POST', token, body: { authorId: userId } })).status, 400)
  })
  await t.test('profile updates cannot overwrite email or password hash', async () => {
    const result = await request('/me', { method: 'PATCH', token, body: { name: 'Кулинар API', bio: 'Проверка профиля.', email: 'hijack@example.test', passwordHash: 'unsafe', id: 1 } })
    assert.equal(result.status, 200)
    assert.equal(result.data.id, userId)
    assert.equal(result.data.email, 'api-check@example.test')
    assert.equal('passwordHash' in result.data, false)
  })
  await t.test('recipes validate input and bind publications to the authenticated user', async () => {
    const seed = (await request('/recipes/1')).data
    assert.equal((await request('/recipes', { method: 'POST', token, body: { ...seed, title: '' } })).status, 400)
    const result = await request('/recipes', { method: 'POST', token, body: { ...seed, title: 'Паста для проверки API', userId: 1, id: 1 } })
    assert.equal(result.status, 201)
    assert.equal(result.data.userId, userId)
    assert.notEqual(result.data.id, 1)
    assert.equal((await request(`/recipes?authorId=${userId}`)).data.length, 1)
  })
  await t.test('data and password hashes survive a server restart', async () => {
    const second = createApi({ dbPath, secret }).listen(0, '127.0.0.1')
    await once(second, 'listening')
    try {
      const response = await fetch(`http://127.0.0.1:${second.address().port}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'api-check@example.test', password: 'ExampleRecipe!2026' }) })
      assert.equal(response.status, 200)
      assert.equal((await response.json()).user.name, 'Кулинар API')
    } finally {
      await new Promise((done) => second.close(done))
    }
  })
})
