import 'bootstrap/dist/css/bootstrap.min.css'
import { Modal, Collapse } from 'bootstrap'
import './style.css'
import { syncThemeControl } from './theme'
import { api } from './api'
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
const readyDialogs = new WeakSet()

function notice(text, error = false) {
  const target = document.querySelector(error ? '#error-notice' : '#notice')
  const other = document.querySelector(error ? '#notice' : '#error-notice')
  other.className = 'visually-hidden'
  other.textContent = ''
  target.className = `notice ${error ? 'is-error' : ''}`
  target.textContent = text
  target.hidden = false
}

function header() {
  document.querySelector('#site-header').innerHTML = `<nav class="navbar navbar-expand-lg" aria-label="Основная навигация"><div class="container">
    <a class="brand" href="index.html">щепотка<span aria-hidden="true">.</span></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navigation" aria-controls="navigation" aria-expanded="false" aria-label="Открыть меню">Меню</button>
    <div class="collapse navbar-collapse" id="navigation"><ul class="navbar-nav me-auto ms-lg-5 gap-lg-3"><li class="nav-item"><a class="nav-link ${page === 'index' ? 'active' : ''}" ${page === 'index' ? 'aria-current="page"' : ''} href="index.html">Рецепты</a></li><li class="nav-item"><a class="nav-link" href="profile.html#saved">Сохранённое</a></li></ul>
    <div class="nav-actions"><div class="theme-control"><label class="visually-hidden" for="theme-select">Цветовая тема</label><select class="form-select form-select-sm" id="theme-select"><option value="system">По системе</option><option value="light">Светлая</option><option value="dark">Тёмная</option></select></div>${user ? `<a class="nav-link" href="profile.html">${e(user.name.split(' ')[0])}</a><button class="text-button" data-action="logout">Выйти</button>` : '<a class="nav-link" href="login.html">Войти</a>'}<a class="btn btn-primary btn-sm" href="publish.html">Добавить рецепт</a></div></div>
  </div></nav>`
  new Collapse(document.querySelector("#navigation"), { toggle: false })
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

function cards(recipes, likes = []) {
  if (!recipes.length) return '<div class="empty-state"><h3 class="h5">Здесь пока нет рецептов</h3><p>Попробуйте изменить фильтры или добавьте свой рецепт.</p><a class="btn btn-outline-primary" href="index.html#catalog">Все рецепты</a></div>'
  return `<div class="row g-4">${recipes.map((r) => `<div class="col-sm-6 col-xl-4"><article class="recipe-card h-100">
    <a class="card-image" tabindex="-1" aria-hidden="true" href="${recipeLink(r.id)}"><img src="${e(r.image)}" alt="${e(r.title)}" width="700" height="700" loading="lazy"></a>
    <div class="card-body"><div class="card-meta"><span>${e(r.type)}</span><span>${r.minutes} мин</span></div><h3><a href="${recipeLink(r.id)}">${e(r.title)}</a></h3><p>${e(r.description)}</p>
    <div class="card-bottom"><a href="${authorLink(r.userId)}">${e(authorName(r.userId))}</a><span class="card-likes" aria-label="Отметок нравится: ${likes.filter((l) => same(l.recipeId, r.id)).length}">♡ ${likes.filter((l) => same(l.recipeId, r.id)).length}</span></div></div>
  </article></div>`).join('')}</div>`
}

async function catalog() {
  const query = params()
  const [recipes, likes] = await Promise.all([api(`/recipes?${query}`), api('/likes')])
  main.innerHTML = `<section class="hero"><div class="container"><div class="row align-items-center g-5"><div class="col-lg-6"><p class="eyebrow">ГОТОВИМ ДОМА · ДЕЛИМСЯ ЛЮБИМЫМ</p><h1>Рецепты, которыми<br> хочется делиться.</h1><p class="hero-description">Простые завтраки, семейные ужины и маленькие открытия. Найдите то, что приготовите сегодня.</p><a class="btn btn-primary" href="#catalog">Выбрать рецепт <span aria-hidden="true">↓</span></a></div>
    <div class="col-lg-6"><a class="hero-feature" href="recipe.html?id=1"><img src="photos/pasta.jpg" alt="Пенне с томатным соусом и базиликом" width="700" height="700" fetchpriority="high"><div class="hero-caption"><span>Попробуйте сегодня</span><strong>Пенне аррабиата</strong><span>25 минут · Легко <span aria-hidden="true">↗</span></span></div></a></div></div></div></section>
    <section class="container catalog-section" id="catalog" aria-labelledby="catalog-title"><div class="section-heading"><div><p class="eyebrow">НА ВАШЕЙ КУХНЕ</p><h2 id="catalog-title">Что будем готовить?</h2></div><span class="quiet">Рецепты от домашних кулинаров</span></div>
    <form id="filters" class="filter-panel" role="search" aria-label="Поиск рецептов"><div class="row g-3"><div class="col-lg-4"><label for="search" class="form-label">Название или описание</label><input class="form-control" type="search" id="search" name="search" maxlength="100" placeholder="Паста, пирог, завтрак…" value="${e(query.get('search') || '')}"></div>
    <div class="col-sm-6 col-lg-2"><label for="type" class="form-label">Тип блюда</label><select id="type" name="type" class="form-select">${options(TYPES, query.get('type'))}</select></div>
    <div class="col-sm-6 col-lg-2"><label for="difficulty" class="form-label">Сложность</label><select id="difficulty" name="difficulty" class="form-select">${options(DIFFICULTIES, query.get('difficulty'))}</select></div>
    <div class="col-sm-8 col-lg-3"><label for="ingredient" class="form-label">Ингредиент</label><input id="ingredient" name="ingredient" maxlength="80" class="form-control" placeholder="Например, томаты" value="${e(query.get('ingredient') || '')}"></div><div class="col-sm-4 col-lg-1 d-flex align-items-end"><button type="submit" class="btn btn-primary w-100" aria-label="Найти рецепты">Найти</button></div></div>
    <div class="filter-bottom"><a href="index.html#catalog">Сбросить фильтры</a><div class="sort"><label for="sort">Порядок:</label><select id="sort" name="sort" class="form-select form-select-sm"><option value="new">Сначала новые</option><option value="quick" ${query.get('sort') === 'quick' ? 'selected' : ''}>Сначала быстрые</option></select></div></div></form>
    <div class="results-heading"><p id="results-count">Найдено рецептов: <strong>${recipes.length}</strong></p><div class="category-links">${['Завтрак', 'Салат', 'Выпечка'].map((t) => `<a href="index.html?type=${encodeURIComponent(t)}#catalog">${t}</a>`).join('')}</div></div>
    ${cards(recipes, likes)}</section>`
}

async function recipe() {
  const id = params().get('id') || '1'
  const [r, comments, likes, saved] = await Promise.all([api(`/recipes/${encodeURIComponent(id)}`), api(`/comments?recipeId=${encodeURIComponent(id)}`), api(`/likes?recipeId=${encodeURIComponent(id)}`), user ? api('/saved') : []])
  document.title = `${r.title} — Щепотка`
  const liked = likes.find((l) => same(l.userId, user?.id))
  const bookmark = saved.find((s) => same(s.recipeId, id))
  main.innerHTML = `<div class="container page-space"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="index.html#catalog">Все рецепты</a><span aria-hidden="true">/</span><span aria-current="page">${e(r.title)}</span></nav>
    <div class="row g-5 align-items-center recipe-intro"><div class="col-lg-6"><p class="eyebrow">${e(r.type)}</p><h1>${e(r.title)}</h1><p class="lead-text">${e(r.description)}</p><div class="recipe-stats"><span>${r.minutes} минут</span><span>${r.servings} порц.</span><span>${e(r.difficulty)}</span></div><p class="author-line">Рецепт от <a href="${authorLink(r.userId)}">${e(authorName(r.userId))}</a></p>
    <div class="action-row"><button class="btn ${liked ? 'btn-primary' : 'btn-outline-primary'}" data-action="like" data-id="${e(liked?.id || '')}" data-recipe="${e(id)}" aria-pressed="${!!liked}">Нравится · ${likes.length}</button><button class="btn ${bookmark ? 'btn-primary' : 'btn-outline-primary'}" data-action="save" data-id="${e(bookmark?.id || '')}" data-recipe="${e(id)}" aria-pressed="${!!bookmark}">${bookmark ? 'Сохранено' : 'Сохранить рецепт'}</button></div></div>
    <div class="col-lg-6"><img class="detail-photo" src="${e(r.image)}" alt="Готовое блюдо: ${e(r.title)}" width="700" height="700"></div></div>
    <div class="row g-5 recipe-body"><aside class="col-lg-4"><section class="ingredients" aria-labelledby="ingredients-title"><h2 id="ingredients-title">Ингредиенты</h2><p class="quiet">На ${r.servings} порц.</p><ul role="list">${r.ingredients.map((i) => `<li><span>${e(i.name)}</span><strong>${e(i.amount)}</strong></li>`).join('')}</ul></section></aside>
    <div class="col-lg-8"><section aria-labelledby="steps-title"><h2 id="steps-title">Как приготовить</h2><ol class="steps" role="list">${r.steps.map((s) => `<li><p>${e(s)}</p></li>`).join('')}</ol></section>
    <section class="video-section" aria-labelledby="video-title"><h2 id="video-title">Видео приготовления</h2>${r.video ? `<p class="quiet">Видеорецепт на английском языке.</p><iframe src="https://www.youtube-nocookie.com/embed/${e(r.video)}" title="Видео приготовления: ${e(r.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><a href="https://www.youtube.com/watch?v=${e(r.video)}" target="_blank" rel="noopener noreferrer">Открыть видео на YouTube</a>` : '<p class="quiet">Видео для этого рецепта пока не добавлено.</p>'}</section>
    <section class="comments-section" aria-labelledby="comments-title"><h2 id="comments-title" tabindex="-1">Обсуждение <span class="quiet">${comments.length}</span></h2>${comments.length ? comments.map((c) => `<article class="comment"><div class="comment-top"><a href="${authorLink(c.userId)}">${e(authorName(c.userId))}</a><time datetime="${e(c.createdAt)}">${date(c.createdAt)}</time></div><p>${e(c.text)}</p>${same(c.userId, user?.id) ? `<button class="text-button" data-action="delete-comment" data-id="${e(c.id)}">Удалить комментарий</button>` : ''}</article>`).join('') : '<p class="quiet">Поделитесь впечатлениями первым.</p>'}
    ${user ? `<form id="comment-form" data-recipe="${e(id)}"><label for="comment-text" class="form-label">Ваш комментарий</label><textarea id="comment-text" name="text" class="form-control" maxlength="1000" rows="3" required placeholder="Что получилось? Есть ли свой секрет?"></textarea><button type="submit" class="btn btn-primary mt-3">Отправить комментарий</button></form>` : `<p><a href="login.html?next=${encodeURIComponent(`recipe.html?id=${id}`)}">Войдите</a>, чтобы оставить комментарий, поставить лайк или сохранить рецепт.</p>`}</section></div></div></div>`
}

async function profile() {
  if (!requireLogin()) return
  const [saved, follows, recipes, likes] = await Promise.all([api('/saved'), api('/follows'), api('/recipes'), api('/likes')])
  const own = recipes.filter((r) => same(r.userId, user.id))
  main.innerHTML = `<div class="container page-space"><section class="profile-heading"><div class="avatar" aria-hidden="true">${e(user.name[0])}</div><div><p class="eyebrow">МОЯ КУХНЯ</p><h1>${e(user.name)}</h1><p class="quiet mb-2">${e(user.email)}</p><p class="mb-0">${e(user.bio || 'Расскажите о том, что любите готовить.')}</p></div><button class="btn btn-outline-primary ms-lg-auto" data-bs-toggle="modal" data-bs-target="#profile-modal">Редактировать профиль</button></section>
    <div class="profile-links"><a href="#saved">Сохранено · ${saved.length}</a><a href="#publications">Мои рецепты · ${own.length}</a><a href="#following">Подписки · ${follows.length}</a></div>
    <section id="saved" class="profile-section" aria-labelledby="saved-title"><div class="section-heading"><h2 id="saved-title">Сохранённые рецепты</h2><a href="index.html#catalog">Найти ещё</a></div>${cards(recipes.filter((r) => saved.some((s) => same(s.recipeId, r.id))), likes)}</section>
    <section id="publications" class="profile-section" aria-labelledby="publications-title"><div class="section-heading"><h2 id="publications-title">Мои публикации</h2><a class="btn btn-primary btn-sm" href="publish.html">Добавить рецепт</a></div>${cards(own, likes)}</section>
    <section id="following" class="profile-section" aria-labelledby="following-title"><h2 id="following-title">Подписки на кулинаров</h2>${follows.length ? `<div class="author-list">${follows.map((f) => `<a class="author-tile" href="${authorLink(f.authorId)}"><span class="avatar small-avatar" aria-hidden="true">${e(authorName(f.authorId)[0])}</span><span>${e(authorName(f.authorId))}</span><span aria-hidden="true">→</span></a>`).join('')}</div>` : '<p class="quiet">Подпишитесь на автора со страницы его рецепта.</p>'}</section></div>
    <div class="modal fade" id="profile-modal" tabindex="-1" aria-labelledby="profile-modal-title" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><form id="profile-form" aria-describedby="profile-error"><div class="modal-header"><h2 class="modal-title h5" id="profile-modal-title">Редактировать профиль</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button></div><div class="modal-body"><label for="profile-name" class="form-label">Имя</label><input id="profile-name" class="form-control mb-3" name="name" value="${e(user.name)}" minlength="2" maxlength="60" required autocomplete="name"><label for="profile-bio" class="form-label">О себе</label><textarea id="profile-bio" name="bio" class="form-control" maxlength="500" rows="4">${e(user.bio)}</textarea><p class="quiet small mt-2 mb-0">До 500 символов.</p><p id="profile-error" class="text-danger mt-2 mb-0" role="alert"></p></div><div class="modal-footer"><button class="btn btn-outline-primary" type="button" data-bs-dismiss="modal">Отмена</button><button class="btn btn-primary" type="submit">Сохранить изменения</button></div></form></div></div></div>`
}

async function authorPage() {
  const id = params().get('id') || '2'
  const [author, recipes, likes, follows] = await Promise.all([api(`/authors/${encodeURIComponent(id)}`), api(`/recipes?authorId=${encodeURIComponent(id)}`), api('/likes'), user ? api('/follows') : []])
  const follow = follows.find((f) => same(f.authorId, id))
  document.title = `${author.name} — Щепотка`
  main.innerHTML = `<div class="container page-space"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="index.html">Рецепты</a><span aria-hidden="true">/</span><span>Кулинары</span></nav><section class="profile-heading"><div class="avatar" aria-hidden="true">${e(author.name[0])}</div><div><p class="eyebrow">ДОМАШНЯЯ КУХНЯ</p><h1>${e(author.name)}</h1><p class="mb-0">${e(author.bio || 'Делится любимыми рецептами.')}</p></div>${same(user?.id, author.id) ? '<a class="btn btn-outline-primary ms-lg-auto" href="profile.html">Мой профиль</a>' : `<button class="btn ${follow ? 'btn-outline-primary' : 'btn-primary'} ms-lg-auto" data-action="follow" data-id="${e(follow?.id || '')}" data-author="${e(id)}" aria-pressed="${!!follow}">${follow ? 'Вы подписаны' : 'Подписаться'}</button>`}</section><section class="profile-section" aria-labelledby="author-recipes"><div class="section-heading"><h2 id="author-recipes">Рецепты автора</h2><span class="quiet">Всего: ${recipes.length}</span></div>${cards(recipes, likes)}</section></div>`
}

function authForm() {
  const register = page === 'register'
  const next = params().get('next')
  const suffix = next ? `?next=${encodeURIComponent(next)}` : ''
  main.innerHTML = `<div class="container auth-page"><div class="row g-5 align-items-start"><div class="col-lg-5 auth-copy"><p class="eyebrow">ВАША ЛИЧНАЯ КУЛИНАРНАЯ КНИГА</p><h1>${register ? 'На вашей кухне<br>есть чем поделиться.' : 'С возвращением<br>на кухню.'}</h1><p class="lead-text">Сохраняйте рецепты, подписывайтесь на любимых кулинаров и делитесь своими находками.</p><img src="photos/pancakes.jpg" alt="Домашние блинчики к завтраку" width="700" height="700"></div>
    <div class="col-lg-5 offset-lg-1"><form id="auth-form" class="auth-panel" aria-describedby="auth-error"><h2>${register ? 'Создать аккаунт' : 'Войти в аккаунт'}</h2>${register ? '<label for="auth-name" class="form-label">Ваше имя</label><input id="auth-name" name="name" class="form-control mb-4" autocomplete="name" minlength="2" maxlength="60" required>' : ''}
    <label for="auth-email" class="form-label">Email</label><input id="auth-email" type="email" name="email" class="form-control mb-4" autocomplete="email" maxlength="120" required>
    <label for="auth-password" class="form-label">Пароль</label><input id="auth-password" type="password" name="password" class="form-control" autocomplete="${register ? 'new-password' : 'current-password'}" minlength="${register ? '8' : '1'}" maxlength="72" required aria-describedby="password-help"><p id="password-help" class="quiet small mt-2">${register ? 'Не менее 8 символов; кириллица занимает больше одного байта.' : 'Для входа используйте email и пароль своего аккаунта.'}</p>
    ${register ? '<label for="auth-confirm" class="form-label mt-2">Повторите пароль</label><input id="auth-confirm" type="password" name="confirm" class="form-control mb-4" autocomplete="new-password" required maxlength="72">' : ''}<p class="form-error" id="auth-error" role="alert"></p><button class="btn btn-primary w-100" type="submit">${register ? 'Зарегистрироваться' : 'Войти'}</button><p class="auth-switch">${register ? `Уже есть аккаунт? <a href="login.html${suffix}">Войти</a>` : `Пока нет аккаунта? <a href="register.html${suffix}">Зарегистрироваться</a>`}</p>
    ${!register ? '<div class="demo-access"><h3 class="h6">Демо-доступ</h3><p>alexey@example.test<br>Пароль: Recipe367275!</p><button class="text-button" type="button" data-action="demo">Заполнить данные</button></div>' : ''}</form></div></div></div>`
}

function publish() {
  if (!requireLogin()) return
  main.innerHTML = `<div class="container narrow page-space"><p class="eyebrow">ИЗ ВАШЕЙ КУЛИНАРНОЙ КНИГИ</p><h1>Поделиться рецептом</h1><p class="lead-text mb-5">Расскажите о блюде так, чтобы его было легко повторить.</p><form id="publish-form" class="publish-panel" aria-describedby="publish-error"><label class="form-label" for="recipe-title">Название рецепта</label><input id="recipe-title" class="form-control mb-4" name="title" minlength="3" maxlength="100" required placeholder="Например, семейный яблочный пирог"><label class="form-label" for="recipe-description">Короткое описание</label><textarea id="recipe-description" name="description" class="form-control mb-4" rows="3" minlength="10" maxlength="500" required></textarea>
    <div class="row g-3 mb-4"><div class="col-sm-6"><label for="recipe-type" class="form-label">Тип блюда</label><select id="recipe-type" name="type" class="form-select" required>${options(TYPES, '', 'Выберите тип')}</select></div><div class="col-sm-6"><label for="recipe-difficulty" class="form-label">Сложность</label><select id="recipe-difficulty" name="difficulty" class="form-select" required>${options(DIFFICULTIES, '', 'Выберите сложность')}</select></div><div class="col-sm-6"><label for="recipe-minutes" class="form-label">Время, минут</label><input id="recipe-minutes" name="minutes" class="form-control" type="number" min="1" max="1440" required></div><div class="col-sm-6"><label for="recipe-servings" class="form-label">Порций</label><input id="recipe-servings" name="servings" class="form-control" type="number" min="1" max="30" value="2" required></div></div>
    <label for="recipe-ingredients" class="form-label">Ингредиенты</label><p class="quiet small" id="ingredients-help">Каждый с новой строки: название | количество. Не больше 30 строк.</p><textarea id="recipe-ingredients" name="ingredients" class="form-control mb-4" rows="6" maxlength="5000" required aria-describedby="ingredients-help" placeholder="Мука | 200 г&#10;Молоко | 300 мл"></textarea><label for="recipe-steps" class="form-label">Шаги приготовления</label><p class="quiet small" id="steps-help">Один шаг на строку, от 5 до 1000 символов. Не больше 20 шагов.</p><textarea id="recipe-steps" name="steps" class="form-control mb-4" rows="7" maxlength="20000" required aria-describedby="steps-help"></textarea>
    <label for="recipe-photo" class="form-label">Фото из учебной подборки</label><select id="recipe-photo" name="image" class="form-select mb-4">${PHOTOS.map((photo, i) => `<option value="photos/${photo}.jpg">${['Паста', 'Рататуй', 'Яблочный пирог', 'Салат', 'Курица', 'Блинчики'][i]}</option>`).join('')}</select><label for="recipe-video" class="form-label">ID видео YouTube <span class="quiet">(необязательно)</span></label><input id="recipe-video" name="video" class="form-control" pattern="[a-zA-Z0-9_-]{11}" aria-describedby="video-help"><p class="quiet small mt-2 mb-4" id="video-help">11 символов после v= в ссылке YouTube. Например, 1IszT_guI08.</p><p class="form-error" id="publish-error" role="alert"></p><button class="btn btn-primary" type="submit">Опубликовать рецепт</button></form></div>`
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
      const hide = () => Modal.getInstance(modal).hide()
      if (readyDialogs.has(modal)) hide()
      else modal.addEventListener('shown.bs.modal', hide, { once: true })
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
      notice(action === 'follow' ? (button.dataset.id ? 'Подписка отменена.' : 'Вы подписались на автора.') : action === 'save' ? (button.dataset.id ? 'Рецепт убран из сохранённых.' : 'Рецепт сохранён в вашей книге.') : (button.dataset.id ? 'Отметка снята.' : 'Рецепт отмечен.'))
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
    main.innerHTML = `<div class="container page-space"><h1>${error.status === 404 ? 'Ничего не найдено' : 'Не удалось открыть страницу'}</h1><p>${e(error.message)}</p><button class="btn btn-primary" data-action="retry">Повторить</button><a class="btn btn-outline-primary ms-2" href="index.html">К рецептам</a></div>`
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

document.addEventListener('show.bs.modal', (event) => readyDialogs.delete(event.target))
document.addEventListener('shown.bs.modal', (event) => readyDialogs.add(event.target))
