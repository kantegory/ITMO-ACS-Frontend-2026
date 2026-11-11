// Общие шаблоны и мелкие помощники для всех страниц.

import { getCurrentUser, isLoggedIn, logout } from './auth.js'

// все иконки лежат в общем спрайте img/sprite.svg, здесь только ссылка на нужную.
// Иконки декоративные: смысл всегда передаёт текст рядом или aria-label кнопки
const SPRITE = 'img/sprite.svg'

export function icon(name) {
  return `<svg class="icon" aria-hidden="true" focusable="false"><use href="${SPRITE}#icon-${name}"></use></svg>`
}

// всё, что пришло от пользователя, вставляем в разметку только экранированным
export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function avatar(user, size = '') {
  const sizeClass = size ? ` avatar--${size}` : ''
  const color = /^#[0-9a-f]{6}$/i.test(user?.avatarColor ?? '') ? user.avatarColor : '#b84a24'
  // имя всегда написано рядом, поэтому инициалы скрываем от скринридера
  return `<span class="avatar${sizeClass}" style="--avatar-bg: ${color}" aria-hidden="true">${escapeHtml(initials(user?.name))}</span>`
}

export function plural(n, one, few, many) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function getParam(name) {
  return new URLSearchParams(location.search).get(name)
}

// из ссылки вида youtube.com/watch?v=ID или youtu.be/ID достаём ID
export function youtubeId(value = '') {
  const match = value.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
  if (match) return match[1]
  return /^[\w-]{11}$/.test(value) ? value : null
}

// у кнопки-иконки постоянная подпись, а состояние передаёт aria-pressed
export function saveLabel(title) {
  return `Сохранить рецепт «${title}»`
}

export function recipeCard(recipe, { saved = false, actions = false } = {}) {
  const likes = recipe.likes?.length ?? 0
  const title = escapeHtml(recipe.title)
  const image = escapeHtml(recipe.image || 'img/recipes/placeholder.svg')
  const author = recipe.user
    ? `<p class="recipe-card__author">${avatar(recipe.user, 'sm')} ${escapeHtml(recipe.user.name)}</p>`
    : ''
  const buttons = actions
    ? `<div class="recipe-card__actions">
        <button class="btn btn-soft btn-sm" type="button" data-edit="${recipe.id}" aria-label="Изменить рецепт «${title}»">${icon('edit')} Изменить</button>
        <button class="btn btn-soft btn-sm" type="button" data-delete="${recipe.id}" aria-label="Удалить рецепт «${title}»">${icon('trash')} Удалить</button>
      </div>`
    : ''

  return `
    <article class="recipe-card card h-100">
      <div class="recipe-card__media">
        <img src="${image}" alt="" loading="lazy">
        <span class="badge recipe-card__type">${escapeHtml(recipe.type)}</span>
        <button class="recipe-card__save${saved ? ' is-active' : ''}" type="button" data-save="${recipe.id}"
                aria-pressed="${saved}" aria-label="${saveLabel(title)}" title="${saved ? 'Убрать из сохранённых' : 'Сохранить'}">
          ${icon('bookmark')}
        </button>
      </div>
      <div class="card-body">
        <h3 class="recipe-card__title"><a class="stretched-link" href="recipe.html?id=${recipe.id}">${title}</a></h3>
        ${author}
        <ul class="recipe-meta">
          <li>${icon('clock')} <span class="visually-hidden">Время приготовления:</span> ${recipe.time} мин</li>
          <li>${icon('level')} <span class="visually-hidden">Сложность:</span> ${escapeHtml(recipe.difficulty)}</li>
          <li>${icon('heart')} <span class="visually-hidden">Лайков:</span> ${likes}</li>
        </ul>
      </div>
      ${buttons}
    </article>`
}

export function renderGrid(container, recipes, options = {}) {
  container.innerHTML = recipes
    .map((recipe) => `<div class="col">${recipeCard(recipe, { ...options, saved: options.savedIds?.has(recipe.id) })}</div>`)
    .join('')
}

export function showLoading(container) {
  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border" style="color: var(--color-accent)" role="status">
        <span class="visually-hidden">Загрузка…</span>
      </div>
    </div>`
}

export function showError(container, error) {
  const offline = error instanceof TypeError
  container.innerHTML = `
    <div class="col-12">
      <div class="alert alert-warning mb-0" role="alert">
        ${offline ? 'Сервер не отвечает. Запустите API командой <code>npm start</code>.' : escapeHtml(error.message)}
      </div>
    </div>`
}

export function toast(message) {
  let holder = document.getElementById('toasts')
  if (!holder) {
    holder = document.createElement('div')
    holder.id = 'toasts'
    holder.className = 'toast-container position-fixed bottom-0 end-0 p-3'
    document.body.append(holder)
  }
  const element = document.createElement('div')
  element.className = 'toast align-items-center border-0'
  // уведомление зачитывается скринридером, но не перехватывает фокус
  element.setAttribute('role', 'status')
  element.setAttribute('aria-live', 'polite')
  element.setAttribute('aria-atomic', 'true')
  element.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHtml(message)}</div>
      <button class="btn-close me-2 m-auto" type="button" data-bs-dismiss="toast" aria-label="Закрыть уведомление"></button>
    </div>`
  holder.append(element)
  element.addEventListener('hidden.bs.toast', () => element.remove())
  new bootstrap.Toast(element, { delay: 2500 }).show()
}

// правая часть шапки: кнопки входа или меню пользователя
export function renderHeader() {
  const area = document.getElementById('authArea')
  if (!area) return

  if (!isLoggedIn()) {
    area.innerHTML = `
      <a class="btn btn-outline-accent" href="login.html">Войти</a>
      <a class="btn btn-accent" href="register.html">Регистрация</a>`
    return
  }

  const user = getCurrentUser()
  area.innerHTML = `
    <div class="dropdown">
      <button class="btn btn-soft d-flex align-items-center gap-2 ps-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        ${avatar(user, 'sm')} ${escapeHtml(user.name)}
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="profile.html">Мой кабинет</a></li>
        <li><a class="dropdown-item" href="author.html?id=${user.id}">Моя страница</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item" type="button" data-logout>${icon('logout')} Выйти</button></li>
      </ul>
    </div>`

  area.querySelector('[data-logout]').addEventListener('click', () => {
    logout()
    window.location.href = 'index.html'
  })
}
