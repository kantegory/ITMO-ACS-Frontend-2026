// Страница рецепта: recipe.html?id=1

import * as api from '../api.js'
import { getCurrentUser, goToLogin, isLoggedIn } from '../auth.js'
import {
  avatar, escapeHtml, formatDate, getParam, icon, plural, renderHeader, toast, youtubeId
} from '../ui.js'

renderHeader()

const page = document.getElementById('recipePage')
const recipeId = Number(getParam('id'))
const me = getCurrentUser()

const state = {
  recipe: null,
  comments: [],
  likes: [],
  followers: [],
  authorRecipes: 0,
  save: null
}

const myLike = () => state.likes.find((like) => like.userId === me?.id)
const myFollow = () => state.followers.find((sub) => sub.userId === me?.id)

function notFound(text) {
  page.innerHTML = `
    <div class="empty-state my-5">
      <p class="h4">${text}</p>
      <a class="btn btn-accent mt-2" href="index.html">К рецептам</a>
    </div>`
}

function commentHtml(comment) {
  const own = comment.userId === me?.id
  return `
    <article class="comment">
      ${avatar(comment.user)}
      <div class="flex-grow-1">
        <div class="comment__head">
          <a class="comment__name text-reset text-decoration-none" href="author.html?id=${comment.userId}">${escapeHtml(comment.user?.name)}</a>
          <span class="comment__date">${formatDate(comment.createdAt)}</span>
          ${own ? `<button class="btn btn-link btn-sm p-0 ms-auto text-muted-warm" type="button" data-delete-comment="${comment.id}" aria-label="Удалить мой комментарий от ${formatDate(comment.createdAt)}">Удалить</button>` : ''}
        </div>
        <p>${escapeHtml(comment.text)}</p>
      </div>
    </article>`
}

function render() {
  const { recipe } = state
  const author = recipe.user
  const isMine = author.id === me?.id
  const video = youtubeId(recipe.video ?? '')
  const liked = Boolean(myLike())
  const followed = Boolean(myFollow())

  document.title = `${recipe.title} — Поварёшка`

  page.innerHTML = `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="index.html">Рецепты</a></li>
        <li class="breadcrumb-item"><a href="index.html?type=${encodeURIComponent(recipe.type)}">${escapeHtml(recipe.type)}</a></li>
        <li class="breadcrumb-item active">${escapeHtml(recipe.title)}</li>
      </ol>
    </nav>

    <div class="row g-4 g-lg-5 align-items-center">
      <div class="col-lg-6">
        <img class="recipe-photo" src="${escapeHtml(recipe.image || 'img/recipes/placeholder.svg')}" alt="Готовое блюдо: ${escapeHtml(recipe.title)}">
      </div>
      <div class="col-lg-6">
        <span class="badge badge-soft">${escapeHtml(recipe.type)}</span>
        <h1 class="recipe-title">${escapeHtml(recipe.title)}</h1>
        <p class="lead">${escapeHtml(recipe.description)}</p>

        <div class="author-line">
          ${avatar(author)}
          <div class="me-auto">
            <a class="author-line__name" href="author.html?id=${author.id}">${escapeHtml(author.name)}</a>
            <div class="author-line__meta">
              ${state.authorRecipes} ${plural(state.authorRecipes, 'рецепт', 'рецепта', 'рецептов')} ·
              <span data-followers>${state.followers.length}</span> ${plural(state.followers.length, 'подписчик', 'подписчика', 'подписчиков')}
            </div>
          </div>
          ${isMine
            ? '<a class="btn btn-soft btn-sm" href="profile.html">Это ваш рецепт</a>'
            : `<button class="btn btn-outline-accent btn-sm btn-toggle${followed ? ' is-active' : ''}" type="button" data-action="follow">${followed ? 'Вы подписаны' : 'Подписаться'}</button>`}
        </div>

        <ul class="recipe-facts" aria-label="Коротко о рецепте">
          <li>${icon('clock')}<span>Время</span><strong>${recipe.time} мин</strong></li>
          <li>${icon('users')}<span>Порции</span><strong>${recipe.servings}</strong></li>
          <li>${icon('level')}<span>Сложность</span><strong>${escapeHtml(recipe.difficulty)}</strong></li>
        </ul>

        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-soft btn-toggle${liked ? ' is-active' : ''}" type="button" data-action="like" aria-pressed="${liked}">
            ${icon('heart')} Нравится <span data-like-count>${state.likes.length}</span>
          </button>
          <button class="btn btn-soft btn-toggle${state.save ? ' is-active' : ''}" type="button" data-action="save">
            ${icon('bookmark')} <span data-save-label>${state.save ? 'В сохранённых' : 'Сохранить'}</span>
          </button>
          <a class="btn btn-soft" href="#comments">${icon('comment')} <span class="visually-hidden">Комментарии:</span> <span data-comments-count>${state.comments.length}</span></a>
        </div>
      </div>
    </div>

    <div class="row g-4 g-lg-5 mt-1">
      <div class="col-lg-4">
        <section class="panel">
          <h2 class="panel__title">Ингредиенты</h2>
          <p class="text-muted-warm small">Отмечайте то, что уже есть дома.</p>
          <ul class="ingredients">
            ${recipe.ingredients.map((item, index) => `
              <li>
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" id="ing${index}">
                  <label class="form-check-label" for="ing${index}">${escapeHtml(item.name)}</label>
                </div>
                <span class="ingredients__amount">${escapeHtml(item.amount)}</span>
              </li>`).join('')}
          </ul>
        </section>
      </div>

      <div class="col-lg-8">
        <section class="panel">
          <h2 class="panel__title">Приготовление</h2>
          <ol class="steps">
            ${recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
          </ol>
        </section>

        ${video ? `
        <section class="panel">
          <h2 class="panel__title">Видео-рецепт</h2>
          <div class="ratio ratio-16x9 video-frame">
            <iframe src="https://www.youtube-nocookie.com/embed/${video}" title="Видео-рецепт: ${escapeHtml(recipe.title)}" loading="lazy" allowfullscreen></iframe>
          </div>
        </section>` : ''}

        <section class="panel" id="comments">
          <h2 class="panel__title">Комментарии <span class="text-muted-warm" data-comments-count>${state.comments.length}</span></h2>
          ${isLoggedIn() ? `
          <form class="mb-3 needs-validation" id="commentForm" novalidate>
            <label class="form-label" for="commentText">Ваш комментарий</label>
            <textarea class="form-control" id="commentText" name="text" rows="3" placeholder="Как у вас получилось?" aria-describedby="commentError" required></textarea>
            <div class="invalid-feedback" id="commentError">Напишите хотя бы пару слов.</div>
            <button class="btn btn-accent mt-2" type="submit">Отправить</button>
          </form>` : `
          <p class="text-muted-warm"><a href="login.html?next=${encodeURIComponent(location.pathname + location.search)}">Войдите</a>, чтобы оставить комментарий.</p>`}
          <div id="commentsList">
            ${state.comments.map(commentHtml).join('') || '<p class="text-muted-warm mb-0" data-no-comments>Пока никто не написал. Будьте первым!</p>'}
          </div>
        </section>
      </div>
    </div>`
}

function updateCounters() {
  page.querySelectorAll('[data-comments-count]').forEach((el) => { el.textContent = state.comments.length })
}

async function toggleLike(button) {
  const like = myLike()
  if (like) {
    await api.removeLike(like.id)
    state.likes = state.likes.filter((item) => item.id !== like.id)
  } else {
    state.likes.push(await api.addLike(me.id, recipeId))
  }
  button.classList.toggle('is-active', !like)
  button.setAttribute('aria-pressed', !like)
  button.querySelector('[data-like-count]').textContent = state.likes.length
}

async function toggleSave(button) {
  if (state.save) {
    await api.removeSave(state.save.id)
    state.save = null
  } else {
    state.save = await api.addSave(me.id, recipeId)
  }
  button.classList.toggle('is-active', Boolean(state.save))
  button.querySelector('[data-save-label]').textContent = state.save ? 'В сохранённых' : 'Сохранить'
  toast(state.save ? 'Рецепт сохранён' : 'Рецепт убран из сохранённых')
}

async function toggleFollow(button) {
  const follow = myFollow()
  if (follow) {
    await api.unsubscribe(follow.id)
    state.followers = state.followers.filter((item) => item.id !== follow.id)
  } else {
    state.followers.push(await api.subscribe(me.id, state.recipe.userId))
  }
  button.classList.toggle('is-active', !follow)
  button.textContent = follow ? 'Подписаться' : 'Вы подписаны'
  page.querySelector('[data-followers]').textContent = state.followers.length
}

// обработчик на document, чтобы <main> не считался кликабельным элементом
document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action], [data-delete-comment]')
  if (!button || !page.contains(button)) return
  if (!isLoggedIn()) return goToLogin()

  button.disabled = true
  try {
    if (button.dataset.action === 'like') await toggleLike(button)
    if (button.dataset.action === 'save') await toggleSave(button)
    if (button.dataset.action === 'follow') await toggleFollow(button)
    if (button.dataset.deleteComment) {
      const id = Number(button.dataset.deleteComment)
      await api.deleteComment(id)
      state.comments = state.comments.filter((comment) => comment.id !== id)
      button.closest('.comment').remove()
      updateCounters()
    }
  } catch (error) {
    if (error.status === 401) goToLogin()
    else toast(error.message)
  } finally {
    button.disabled = false
  }
})

page.addEventListener('submit', async (event) => {
  if (event.target.id !== 'commentForm') return
  event.preventDefault()

  const form = event.target
  form.classList.add('was-validated')
  if (!form.checkValidity()) return

  try {
    const comment = await api.addComment({
      recipeId,
      userId: me.id,
      text: form.text.value.trim(),
      createdAt: new Date().toISOString()
    })
    comment.user = me
    state.comments.unshift(comment)

    page.querySelector('[data-no-comments]')?.remove()
    document.getElementById('commentsList').insertAdjacentHTML('afterbegin', commentHtml(comment))
    updateCounters()
    form.reset()
    form.classList.remove('was-validated')
    toast('Комментарий опубликован')
  } catch (error) {
    if (error.status === 401) goToLogin()
    else toast(error.message)
  }
})

async function load() {
  if (!recipeId) return notFound('Рецепт не найден')

  try {
    const [recipe, comments, likes] = await Promise.all([
      api.getRecipe(recipeId),
      api.getComments(recipeId),
      api.getLikes({ recipeId })
    ])
    const [authorRecipes, followers] = await Promise.all([
      api.getRecipes({ userId: recipe.userId }),
      api.getSubscriptions({ authorId: recipe.userId })
    ])

    Object.assign(state, { recipe, comments, likes, followers, authorRecipes: authorRecipes.length })

    if (isLoggedIn()) {
      const saves = await api.getSaves({ userId: me.id }).catch(() => [])
      state.save = saves.find((save) => save.recipeId === recipeId) ?? null
    }

    render()
  } catch (error) {
    if (error.status === 404) notFound('Рецепт не найден')
    else if (error instanceof TypeError) notFound('Сервер не отвечает. Запустите API командой npm start.')
    else notFound(escapeHtml(error.message))
  }
}

load()
