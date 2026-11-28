import 'bootstrap/dist/css/bootstrap.min.css'
import { Modal } from 'bootstrap'
import './style.css'
import { syncThemeControl } from './theme'
import { api } from './api'
import { icon } from './icons'
import { session, saveSession } from './session'
import { TYPES, DIFFICULTIES, PHOTOS, same, validateRecipe } from './validation'

const main = document.querySelector('main')
const page = document.body.dataset.page
const params = () => new URLSearchParams(location.search)
const e = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const options = (values, selected = '', empty = 'Все') => `<option value="">${e(empty)}</option>${values.map((v) => `<option ${v === selected ? 'selected' : ''} value="${e(v)}">${e(v)}</option>`).join('')}`
const authorName = (id) => authors.find((u) => same(u.id, id))?.name || 'Автор'
const recipeLink = (id) => `recipe.html?id=${encodeURIComponent(id)}`
const authorLink = (id) => `author.html?id=${encodeURIComponent(id)}`
const date = (value) => new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
let user = null
let authors = []

function notice(text, error = false) {
  const target = document.querySelector(error ? '#error-notice' : '#notice')
  const other = document.querySelector(error ? '#notice' : '#error-notice')
  other.className = 'visually-hidden'
  other.textContent = ''
  target.className = `container notice ${error ? 'is-error' : ''}`
  target.textContent = text
  target.hidden = false
}

function header() {
  const active = (name) => page === name ? ' aria-current="page"' : ''
  document.querySelector('#site-header').innerHTML = `
    <nav class="container site-nav" aria-label="Основная навигация">
      <a href="index.html"${active('index')}>Рецепты</a>
      <a href="profile.html#saved">${icon('bookmark')}Сохранённое</a>
      <a href="publish.html"${active('publish')}>Добавить рецепт</a>
      ${user ? `<a href="profile.html"${active('profile')}>${icon('user')}Личный кабинет</a>
        <button class="btn btn-sm btn-outline-secondary" type="button" data-action="logout">Выйти</button>` :
        `<a href="login.html"${active('login')}>${icon('user')}Войти</a><a href="register.html"${active('register')}>Регистрация</a>`}

      <div class="theme-control">
        <label for="theme-select">Тема</label>
        <select id="theme-select" class="form-select form-select-sm w-auto">
          <option value="system">По системе</option>
          <option value="light">Светлая</option>
          <option value="dark">Тёмная</option>
        </select>
      </div>
    </nav>`
  syncThemeControl()
}

function requireLogin() {
  if (user) return true
  location.href = `login.html?next=${encodeURIComponent(location.pathname.split('/').pop() + location.search + location.hash)}`
  return false
}

function safeNext() {
  const next = new URL(params().get('next') || 'profile.html', location.href)
  return next.origin === location.origin && ['index.html', 'profile.html', 'publish.html', 'recipe.html', 'author.html'].includes(next.pathname.split('/').pop()) ? next.href : 'profile.html'
}

function recipeList(recipes, likes) {
  if (!recipes.length) return '<p>Рецептов нет.</p>'
  return `<ul class="recipe-list">${recipes.map((r) => `
    <li>
      <a href="${recipeLink(r.id)}">${e(r.title)}</a>
      <div class="small text-body-secondary">${e(r.type)}, ${e(r.difficulty.toLocaleLowerCase('ru'))}, ${icon('clock')}${r.minutes} мин. ${icon('heart')}Лайки: ${likes.filter((like) => same(like.recipeId, r.id)).length}</div>
      <div class="small">Автор: <a href="${authorLink(r.userId)}">${e(authorName(r.userId))}</a></div>
    </li>`).join('')}</ul>`
}

async function catalog() {
  const query = params()
  const [recipes, likes] = await Promise.all([api(`/recipes?${query}`), api('/likes')])
  main.innerHTML = `
    <section class="container page-space" id="catalog" aria-labelledby="catalog-title">
      <h1 id="catalog-title">Рецепты</h1>
      <form id="filters" class="mb-3" role="search" aria-label="Поиск рецептов">
        <div class="row g-2 mb-2">
          <div class="col-sm-6 col-md-4">
            <label for="search" class="form-label">Название или описание</label>
            <input class="form-control form-control-sm" type="search" id="search" name="search" maxlength="100" value="${e(query.get('search') || '')}">
          </div>
          <div class="col-sm-6 col-md-2">
            <label for="type" class="form-label">Тип блюда</label>
            <select id="type" name="type" class="form-select form-select-sm">${options(TYPES, query.get('type'))}</select>
          </div>
          <div class="col-sm-6 col-md-2">
            <label for="difficulty" class="form-label">Сложность</label>
            <select id="difficulty" name="difficulty" class="form-select form-select-sm">${options(DIFFICULTIES, query.get('difficulty'))}</select>
          </div>
          <div class="col-sm-6 col-md-4">
            <label for="ingredient" class="form-label">Ингредиент</label>
            <input id="ingredient" name="ingredient" maxlength="80" class="form-control form-control-sm" value="${e(query.get('ingredient') || '')}">
          </div>
        </div>
        <div class="actions">
          <label for="sort">Порядок</label>
          <select id="sort" name="sort" class="form-select form-select-sm w-auto">
            <option value="new">Сначала новые</option>
            <option value="quick" ${query.get('sort') === 'quick' ? 'selected' : ''}>Сначала быстрые</option>
          </select>
          <button class="btn btn-secondary btn-sm" type="submit">${icon('search')}Найти</button>
          <a href="index.html#catalog">Сбросить</a>
        </div>
      </form>
      <p id="results-count" class="mb-2">Найдено рецептов: ${recipes.length}</p>
      ${recipeList(recipes, likes)}
    </section>`
}

async function recipe() {
  const id = params().get('id') || '1'
  const [r, comments, likes, saved] = await Promise.all([
    api(`/recipes/${encodeURIComponent(id)}`),
    api(`/comments?recipeId=${encodeURIComponent(id)}`),
    api(`/likes?recipeId=${encodeURIComponent(id)}`),
    user ? api('/saved') : [],
  ])
  document.title = `${r.title} - Щепотка`
  const liked = likes.find((like) => same(like.userId, user?.id))
  const bookmark = saved.find((item) => same(item.recipeId, id))
  main.innerHTML = `
    <article class="container page-space">
      <p><a href="index.html#catalog">К списку рецептов</a></p>
      <h1>${e(r.title)}</h1>
      <p>${e(r.description)}</p>
      <p>${e(r.type)}, ${icon('clock')}${r.minutes} мин, порций: ${r.servings}. Сложность: ${e(r.difficulty)}.</p>
      <p>Автор: <a href="${authorLink(r.userId)}">${e(authorName(r.userId))}</a></p>
      <img class="detail-photo" src="${e(r.image)}" alt="${e(r.title)}" width="208" height="208">
      <div class="actions mt-3">
        <button class="btn btn-outline-secondary btn-sm" type="button" data-action="like" data-id="${e(liked?.id || '')}" data-recipe="${e(id)}" aria-pressed="${!!liked}">${icon('heart')}${liked ? 'Убрать лайк' : 'Нравится'} (${likes.length})</button>
        <button class="btn btn-outline-secondary btn-sm" type="button" data-action="save" data-id="${e(bookmark?.id || '')}" data-recipe="${e(id)}" aria-pressed="${!!bookmark}">${icon('bookmark')}${bookmark ? 'Убрать из сохранённых' : 'Сохранить рецепт'}</button>
      </div>
      <section class="section" aria-labelledby="ingredients-title">
        <h2 id="ingredients-title">Ингредиенты</h2>
        <ul>${r.ingredients.map((item) => `<li>${e(item.name)} - ${e(item.amount)}</li>`).join('')}</ul>
      </section>
      <section class="section" aria-labelledby="steps-title">
        <h2 id="steps-title">Приготовление</h2>
        <ol>${r.steps.map((step) => `<li>${e(step)}</li>`).join('')}</ol>
        ${r.video ? `<details class="recipe-video">
          <summary>Видео приготовления</summary>
          <iframe src="https://www.youtube-nocookie.com/embed/${e(r.video)}" title="Видео: ${e(r.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          <a href="https://www.youtube.com/watch?v=${e(r.video)}" target="_blank" rel="noopener noreferrer">Открыть на YouTube</a>
        </details>` : ''}
      </section>
      <section class="section" aria-labelledby="comments-title">
        <h2 id="comments-title" tabindex="-1">Комментарии (${comments.length})</h2>
        ${comments.length ? comments.map((c) => `
          <article class="comment">
            <div class="small"><a href="${authorLink(c.userId)}">${e(authorName(c.userId))}</a> <time datetime="${e(c.createdAt)}">${date(c.createdAt)}</time></div>
            <p class="mb-1">${e(c.text)}</p>
            ${same(c.userId, user?.id) ? `<button class="btn btn-sm btn-outline-secondary" type="button" data-action="delete-comment" data-id="${e(c.id)}">Удалить комментарий</button>` : ''}
          </article>`).join('') : '<p>Комментариев нет.</p>'}
        ${user ? `<form id="comment-form" class="short-form mt-3" data-recipe="${e(id)}">
          <label for="comment-text" class="form-label">Ваш комментарий</label>
          <textarea id="comment-text" name="text" class="form-control mb-2" maxlength="1000" rows="3" required></textarea>
          <button class="btn btn-secondary btn-sm" type="submit">Отправить комментарий</button>
        </form>` : `<p><a href="login.html?next=${encodeURIComponent(`recipe.html?id=${id}`)}">Войдите</a>, чтобы оставить комментарий.</p>`}
      </section>
    </article>`
}

async function profile() {
  if (!requireLogin()) return
  const [saved, follows, recipes, likes] = await Promise.all([api('/saved'), api('/follows'), api('/recipes'), api('/likes')])
  const own = recipes.filter((r) => same(r.userId, user.id))
  main.innerHTML = `
    <div class="container page-space">
      <h1>Личный кабинет</h1>
      <p class="mb-1"><strong>${e(user.name)}</strong> (${e(user.email)})</p>
      ${user.bio ? `<p>${e(user.bio)}</p>` : ''}
      <button class="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="modal" data-bs-target="#profile-modal">Редактировать профиль</button>
      <section id="saved" class="section" aria-labelledby="saved-title">
        <h2 id="saved-title">Сохранённые рецепты</h2>
        ${recipeList(recipes.filter((r) => saved.some((s) => same(s.recipeId, r.id))), likes)}
      </section>
      <section id="publications" class="section" aria-labelledby="publications-title">
        <h2 id="publications-title">Мои публикации</h2>
        <p><a href="publish.html">Добавить рецепт</a></p>
        ${recipeList(own, likes)}
      </section>
      <section id="following" class="section" aria-labelledby="following-title">
        <h2 id="following-title">Подписки</h2>
        ${follows.length ? `<ul>${follows.map((f) => `<li><a href="${authorLink(f.authorId)}">${e(authorName(f.authorId))}</a></li>`).join('')}</ul>` : '<p>Подписок нет.</p>'}
      </section>
    </div>
    <div class="modal" id="profile-modal" tabindex="-1" aria-labelledby="profile-modal-title" aria-hidden="true">
      <div class="modal-dialog"><div class="modal-content">
        <form id="profile-form">
          <div class="modal-header">
            <h2 class="modal-title" id="profile-modal-title">Редактировать профиль</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
          </div>
          <div class="modal-body">
            <label for="profile-name" class="form-label">Имя</label>
            <input id="profile-name" class="form-control mb-3" name="name" value="${e(user.name)}" minlength="2" maxlength="60" required autocomplete="name">
            <label for="profile-bio" class="form-label">О себе</label>
            <textarea id="profile-bio" name="bio" class="form-control" maxlength="500" rows="4">${e(user.bio)}</textarea>
            <p id="profile-error" class="form-error mt-2 mb-0" role="alert"></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary btn-sm" type="button" data-bs-dismiss="modal">Отмена</button>
            <button class="btn btn-secondary btn-sm" type="submit">Сохранить изменения</button>
          </div>
        </form>
      </div></div>
    </div>`
}

async function authorPage() {
  const id = params().get('id') || '2'
  const [author, recipes, likes, follows] = await Promise.all([api(`/authors/${encodeURIComponent(id)}`), api(`/recipes?authorId=${encodeURIComponent(id)}`), api('/likes'), user ? api('/follows') : []])
  const follow = follows.find((f) => same(f.authorId, id))
  document.title = `${author.name} - Щепотка`
  main.innerHTML = `
    <div class="container page-space">
      <h1>${e(author.name)}</h1>
      ${author.bio ? `<p>${e(author.bio)}</p>` : ''}
      ${same(user?.id, author.id) ? '<a href="profile.html">Мой профиль</a>' :
        `<button class="btn btn-outline-secondary btn-sm" type="button" data-action="follow" data-id="${e(follow?.id || '')}" data-author="${e(id)}" aria-pressed="${!!follow}">${follow ? 'Отписаться' : 'Подписаться'}</button>`}
      <section class="section" aria-labelledby="author-recipes">
        <h2 id="author-recipes">Рецепты автора</h2>
        ${recipeList(recipes, likes)}
      </section>
    </div>`
}

function authForm() {
  const register = page === 'register'
  const next = params().get('next')
  const suffix = next ? `?next=${encodeURIComponent(next)}` : ''
  main.innerHTML = `
    <div class="container page-space">
      <h1>${register ? 'Регистрация' : 'Вход'}</h1>
      <form id="auth-form" class="short-form">
        ${register ? `<label for="auth-name" class="form-label">Имя</label>
        <input id="auth-name" name="name" class="form-control mb-3" autocomplete="name" minlength="2" maxlength="60" required>` : ''}
        <label for="auth-email" class="form-label">Email</label>
        <input id="auth-email" type="email" name="email" class="form-control mb-3" autocomplete="email" maxlength="120" required>
        <label for="auth-password" class="form-label">Пароль</label>
        <input id="auth-password" type="password" name="password" class="form-control mb-3" autocomplete="${register ? 'new-password' : 'current-password'}" minlength="${register ? '8' : '1'}" maxlength="72" required${register ? ' aria-describedby="password-help"' : ''}>
        ${register ? `<p id="password-help" class="small">Минимум 8 символов.</p>
        <label for="auth-confirm" class="form-label">Повторите пароль</label>
        <input id="auth-confirm" type="password" name="confirm" class="form-control mb-3" autocomplete="new-password" required maxlength="72">` : ''}
        <p class="form-error" id="auth-error" role="alert"></p>
        <div class="actions">
          <button class="btn btn-secondary btn-sm" type="submit">${register ? 'Зарегистрироваться' : 'Войти'}</button>
          ${register ? `<a href="login.html${suffix}">Войти</a>` : `<button class="btn btn-outline-secondary btn-sm" type="button" data-action="demo">Заполнить данные</button><a href="register.html${suffix}">Регистрация</a>`}
        </div>
      </form>
    </div>`
}

function publish() {
  if (!requireLogin()) return
  main.innerHTML = `
    <div class="container page-space">
      <h1>Добавить рецепт</h1>
      <form id="publish-form" class="edit-form">
        <label class="form-label" for="recipe-title">Название</label>
        <input id="recipe-title" class="form-control mb-3" name="title" minlength="3" maxlength="100" required>
        <label class="form-label" for="recipe-description">Описание</label>
        <textarea id="recipe-description" name="description" class="form-control mb-3" rows="3" minlength="10" maxlength="500" required></textarea>
        <div class="row g-2 mb-3">
          <div class="col-sm-6"><label for="recipe-type" class="form-label">Тип блюда</label><select id="recipe-type" name="type" class="form-select" required>${options(TYPES, '', 'Выберите тип')}</select></div>
          <div class="col-sm-6"><label for="recipe-difficulty" class="form-label">Сложность</label><select id="recipe-difficulty" name="difficulty" class="form-select" required>${options(DIFFICULTIES, '', 'Выберите сложность')}</select></div>
          <div class="col-sm-6"><label for="recipe-minutes" class="form-label">Время, минут</label><input id="recipe-minutes" name="minutes" class="form-control" type="number" min="1" max="1440" required></div>
          <div class="col-sm-6"><label for="recipe-servings" class="form-label">Порций</label><input id="recipe-servings" name="servings" class="form-control" type="number" min="1" max="30" value="2" required></div>
        </div>
        <label for="recipe-ingredients" class="form-label">Ингредиенты</label>
        <p class="small mb-1" id="ingredients-help">Формат строки: название | количество.</p>
        <textarea id="recipe-ingredients" name="ingredients" class="form-control mb-3" rows="5" maxlength="5000" required aria-describedby="ingredients-help"></textarea>
        <label for="recipe-steps" class="form-label">Шаги приготовления</label>
        <p class="small mb-1" id="steps-help">Один шаг на строку.</p>
        <textarea id="recipe-steps" name="steps" class="form-control mb-3" rows="5" maxlength="20000" required aria-describedby="steps-help"></textarea>
        <label for="recipe-photo" class="form-label">Фото</label>
        <select id="recipe-photo" name="image" class="form-select mb-3">${PHOTOS.map((photo, i) => `<option value="photos/${photo}.jpg">${['Паста', 'Рататуй', 'Яблочный пирог', 'Салат', 'Курица', 'Блинчики'][i]}</option>`).join('')}</select>
        <label for="recipe-video" class="form-label">ID видео YouTube (необязательно)</label>
        <input id="recipe-video" name="video" class="form-control mb-3" pattern="[a-zA-Z0-9_\\-]{11}" aria-describedby="video-help">
        <p class="small" id="video-help">11 символов после v= в ссылке YouTube.</p>
        <p class="form-error" id="publish-error" role="alert"></p>
        <button class="btn btn-secondary btn-sm" type="submit">Опубликовать рецепт</button>
      </form>
    </div>`
}

const renderers = { index: catalog, recipe, profile, author: authorPage, login: authForm, register: authForm, publish }

document.addEventListener('submit', async (event) => {
  const form = event.target
  if (!(form instanceof HTMLFormElement)) return
  event.preventDefault()
  const data = Object.fromEntries(new FormData(form))
  const submit = form.querySelector('[type="submit"]')
  submit.disabled = true
  try {
    if (form.id === 'filters') {
      const query = new URLSearchParams(Object.entries(data).filter(([, value]) => value))
      history.replaceState(null, '', `index.html?${query}#catalog`)
      await catalog()
      document.querySelector('#filters [type="submit"]').focus()
      notice(document.querySelector('#results-count').textContent)
    } else if (form.id === 'auth-form') {
      if (page === 'register' && data.password !== data.confirm) {
        document.querySelector('#auth-confirm').setAttribute('aria-invalid', 'true')
        document.querySelector('#auth-confirm').setAttribute('aria-describedby', 'auth-error')
        throw new Error('Пароли не совпадают.')
      }
      const result = await api(`/auth/${page}`, { method: 'POST', body: data })
      saveSession(result)
      location.href = safeNext()
    } else if (form.id === 'comment-form') {
      await api('/comments', { method: 'POST', body: { text: data.text, recipeId: Number(form.dataset.recipe) } })
      await recipe()
      document.querySelector('#comment-text').focus()
      notice('Комментарий добавлен.')
    } else if (form.id === 'profile-form') {
      user = await api('/me', { method: 'PATCH', body: data })
      saveSession({ ...session(), user })
      const modal = document.querySelector('#profile-modal')
      modal.addEventListener('hidden.bs.modal', async () => { authors = await api("/authors"); header(); await profile(); document.querySelector('[data-bs-target="#profile-modal"]').focus(); notice('Профиль обновлён.') }, { once: true })
      Modal.getInstance(modal).hide()
    } else if (form.id === 'publish-form') {
      const body = validateRecipe({ ...data, ingredients: data.ingredients.split('\n').filter((line) => line.trim()).map((line) => { const [name, ...amount] = line.split('|'); return { name, amount: amount.join('|') } }), steps: data.steps.split('\n').filter((line) => line.trim()) })
      const result = await api('/recipes', { method: 'POST', body })
      location.href = recipeLink(result.id)
    }
  } catch (error) {
    if (error.status === 401 && user) { user = null; header() }
    const target = form.querySelector('.form-error, #profile-error')
    if (target) { target.textContent = error.message; target.tabIndex = -1; target.focus() }
    else notice(error.message, true)
  } finally {
    submit.disabled = false
  }
})

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]')
  if (!button) return
  const action = button.dataset.action
  if (action === 'logout') { saveSession(null); location.href = 'index.html'; return }
  if (action === 'demo') {
    document.querySelector('#auth-email').value = 'alexey@example.test'
    document.querySelector('#auth-password').value = 'Recipe367275!'
    return
  }
  if (action === 'retry') { await init(); return }
  if (!requireLogin()) return
  button.disabled = true
  try {
    if (['like', 'save', 'follow'].includes(action)) {
      const resource = { like: 'likes', save: 'saved', follow: 'follows' }[action]
      await api(button.dataset.id ? `/${resource}/${button.dataset.id}` : `/${resource}`, { method: button.dataset.id ? 'DELETE' : 'POST', body: action === 'follow' ? { authorId: Number(button.dataset.author) } : { recipeId: Number(button.dataset.recipe) } })
      await renderers[page]()
      document.querySelector(`[data-action="${action}"]`)?.focus()
      notice(action === 'follow' ? (button.dataset.id ? 'Подписка отменена.' : 'Вы подписались на автора.') : action === 'save' ? (button.dataset.id ? 'Рецепт убран из сохранённых.' : 'Рецепт сохранён.') : (button.dataset.id ? 'Отметка снята.' : 'Рецепт отмечен.'))
    } else if (action === 'delete-comment') {
      await api(`/comments/${button.dataset.id}`, { method: 'DELETE' })
      await recipe()
      document.querySelector('#comments-title').focus()
      notice('Комментарий удалён.')
    }
  } catch (error) {
    if (error.status === 401) { user = null; header() }
    notice(error.message, true)
  }
  finally { button.disabled = false }
})

async function init() {
  main.setAttribute('aria-busy', 'true')
  main.innerHTML = '<div class="container page-space"><p>Загружаем рецепты…</p></div>'
  try {
    if (session()?.accessToken) {
      try { user = await api('/me') } catch (error) { if (error.status !== 401) throw error; saveSession(null); user = null }
    }
    authors = await api('/authors')
    header()
    await (renderers[page] || catalog)()
    main.setAttribute('aria-busy', 'false')
  } catch (error) {
    main.setAttribute('aria-busy', 'false')
    header()
    main.innerHTML = `<div class="container page-space"><h1>${error.status === 404 ? 'Ничего не найдено' : 'Не удалось открыть страницу'}</h1><p>${e(error.message)}</p><button class="btn btn-secondary btn-sm" type="button" data-action="retry">Повторить</button><a class="ms-2" href="index.html">К рецептам</a></div>`
  }
}

init()

document.addEventListener('input', (event) => {
  const field = event.target
  if (!(field instanceof HTMLElement)) return
  field.removeAttribute('aria-invalid')
  const error = field.closest('form')?.querySelector('.form-error, #profile-error')
  if (error) error.textContent = ''
})

document.addEventListener('shown.bs.modal', (event) => {
  if (event.target.id === 'profile-modal') document.querySelector('#profile-name').focus()
})
