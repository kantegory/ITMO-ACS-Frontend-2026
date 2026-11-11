// Общие шаблоны и мелкие помощники для всех страниц.

import { getCurrentUser, isLoggedIn, logout } from './auth.js'

const ICONS = {
  ladle: '<path d="M3 12h12a6 6 0 0 1-12 0z"/><path d="M15 12 21 3"/>',
  heart: '<path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z"/>',
  bookmark: '<path d="M6 4h12v16l-6-4-6 4z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  level: '<path d="M6 20v-4M12 20v-8M18 20V6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
  comment: '<path d="M4 5h16v11H9l-5 4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13"/>',
  pin: '<path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>'
}

export function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24">${ICONS[name]}</svg>`
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
  return `<span class="avatar${sizeClass}" style="--avatar-bg: ${color}">${escapeHtml(initials(user?.name))}</span>`
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

export function recipeCard(recipe, { saved = false, actions = false } = {}) {
  const likes = recipe.likes?.length ?? 0
  const image = escapeHtml(recipe.image || 'img/recipes/placeholder.svg')
  const author = recipe.user
    ? `<p class="recipe-card__author">${avatar(recipe.user, 'sm')} ${escapeHtml(recipe.user.name)}</p>`
    : ''
  const buttons = actions
    ? `<div class="recipe-card__actions">
        <button class="btn btn-soft btn-sm" type="button" data-edit="${recipe.id}">${icon('edit')} Изменить</button>
        <button class="btn btn-soft btn-sm" type="button" data-delete="${recipe.id}">${icon('trash')} Удалить</button>
      </div>`
    : ''

  return `
    <article class="recipe-card card h-100">
      <div class="recipe-card__media">
        <img src="${image}" alt="${escapeHtml(recipe.title)}" loading="lazy">
        <span class="badge recipe-card__type">${escapeHtml(recipe.type)}</span>
        <button class="recipe-card__save${saved ? ' is-active' : ''}" type="button"
                title="${saved ? 'Убрать из сохранённых' : 'Сохранить'}" data-save="${recipe.id}">
          ${icon('bookmark')}
        </button>
      </div>
      <div class="card-body">
        <h3 class="recipe-card__title"><a class="stretched-link" href="recipe.html?id=${recipe.id}">${escapeHtml(recipe.title)}</a></h3>
        ${author}
        <ul class="recipe-meta">
          <li>${icon('clock')} ${recipe.time} мин</li>
          <li>${icon('level')} ${escapeHtml(recipe.difficulty)}</li>
          <li>${icon('heart')} ${likes}</li>
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
      <div class="spinner-border" style="color: var(--color-accent)"></div>
    </div>`
}

export function showError(container, error) {
  const offline = error instanceof TypeError
  container.innerHTML = `
    <div class="col-12">
      <div class="alert alert-warning mb-0">
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
  element.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHtml(message)}</div>
      <button class="btn-close me-2 m-auto" type="button" data-bs-dismiss="toast"></button>
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
      <button class="btn btn-soft d-flex align-items-center gap-2 ps-1" type="button" data-bs-toggle="dropdown">
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
