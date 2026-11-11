// author.html — список кулинаров, author.html?id=1 — страница одного кулинара

import * as api from '../api.js'
import { getCurrentUser, goToLogin, isLoggedIn } from '../auth.js'
import { bindSaveButtons, loadSaved } from '../saves.js'
import { avatar, escapeHtml, getParam, icon, plural, renderGrid, renderHeader, toast } from '../ui.js'

renderHeader()

const page = document.getElementById('authorPage')
const authorId = Number(getParam('id'))
const me = getCurrentUser()

function showMessage(text) {
  page.innerHTML = `<div class="container"><div class="empty-state my-5"><p class="h5 mb-0">${text}</p></div></div>`
}

function countBy(items, key) {
  return items.reduce((acc, item) => acc.set(item[key], (acc.get(item[key]) ?? 0) + 1), new Map())
}

/* ---------- все кулинары ---------- */

async function renderCooks() {
  const [users, recipes, subscriptions] = await Promise.all([
    api.getUsers(),
    api.getRecipes(),
    api.getSubscriptions()
  ])
  const recipesCount = countBy(recipes, 'userId')
  const followersCount = countBy(subscriptions, 'authorId')

  // кулинары — те, у кого есть хотя бы один рецепт
  const cooks = users
    .filter((user) => recipesCount.has(user.id))
    .sort((a, b) => (followersCount.get(b.id) ?? 0) - (followersCount.get(a.id) ?? 0))

  page.innerHTML = `
    <section class="container py-5">
      <h1 class="mb-2">Кулинары</h1>
      <p class="text-muted-warm mb-4">Подписывайтесь на авторов, чтобы не пропустить их новые рецепты.</p>
      <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
        ${cooks.map((cook) => {
          const count = recipesCount.get(cook.id) ?? 0
          const followers = followersCount.get(cook.id) ?? 0
          return `
            <div class="col">
              <div class="cook-card h-100 position-relative">
                ${avatar(cook, 'lg')}
                <div>
                  <a class="cook-card__name stretched-link" href="author.html?id=${cook.id}">${escapeHtml(cook.name)}</a>
                  <p class="cook-card__meta">${escapeHtml(cook.city)}</p>
                  <p class="cook-card__meta">${count} ${plural(count, 'рецепт', 'рецепта', 'рецептов')} · ${followers} ${plural(followers, 'подписчик', 'подписчика', 'подписчиков')}</p>
                </div>
              </div>
            </div>`
        }).join('')}
      </div>
    </section>`
}

/* ---------- один кулинар ---------- */

async function renderAuthor() {
  const [author, recipes, followers, following, saved] = await Promise.all([
    api.getUser(authorId),
    api.getRecipes({ userId: authorId, _sort: 'createdAt', _order: 'desc' }),
    api.getSubscriptions({ authorId }),
    api.getSubscriptions({ userId: authorId }),
    loadSaved()
  ])

  const isMe = me?.id === author.id
  let myFollow = followers.find((sub) => sub.userId === me?.id)
  document.title = `${author.name} — Поварёшка`

  page.innerHTML = `
    <div class="profile-cover"></div>
    <section class="container">
      <div class="profile-head">
        ${avatar(author, 'xl')}
        <div class="d-flex flex-wrap align-items-end justify-content-between gap-3">
          <div>
            <h1 class="profile-head__name">${escapeHtml(author.name)}</h1>
            ${author.city ? `<p class="text-muted-warm mb-2">${icon('pin')} ${escapeHtml(author.city)}</p>` : ''}
            <p class="mb-0" style="max-width: 40rem">${escapeHtml(author.bio)}</p>
          </div>
          ${isMe
            ? '<a class="btn btn-soft" href="profile.html">Перейти в кабинет</a>'
            : `<button class="btn btn-accent btn-toggle${myFollow ? ' is-active' : ''}" type="button" id="followButton">${myFollow ? 'Вы подписаны' : 'Подписаться'}</button>`}
        </div>
        <ul class="profile-stats" aria-label="Статистика кулинара">
          <li><strong>${recipes.length}</strong><span>${plural(recipes.length, 'рецепт', 'рецепта', 'рецептов')}</span></li>
          <li><strong id="followersCount">${followers.length}</strong><span>${plural(followers.length, 'подписчик', 'подписчика', 'подписчиков')}</span></li>
          <li><strong>${following.length}</strong><span>${plural(following.length, 'подписка', 'подписки', 'подписок')}</span></li>
        </ul>
      </div>
    </section>

    <section class="container py-4">
      <h2 class="h3 mb-4">Рецепты автора</h2>
      <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4" id="authorRecipes"></div>
    </section>`

  const grid = document.getElementById('authorRecipes')
  if (recipes.length) {
    renderGrid(grid, recipes, { savedIds: new Set(saved.keys()) })
    bindSaveButtons(grid, saved)
  } else {
    grid.innerHTML = '<div class="col-12"><div class="empty-state">У автора пока нет рецептов.</div></div>'
  }

  document.getElementById('followButton')?.addEventListener('click', async (event) => {
    const button = event.currentTarget
    if (!isLoggedIn()) return goToLogin()

    button.disabled = true
    try {
      if (myFollow) {
        await api.unsubscribe(myFollow.id)
        followers.splice(followers.indexOf(myFollow), 1)
        myFollow = null
      } else {
        myFollow = await api.subscribe(me.id, author.id)
        followers.push(myFollow)
      }
      button.classList.toggle('is-active', Boolean(myFollow))
      button.textContent = myFollow ? 'Вы подписаны' : 'Подписаться'
      document.getElementById('followersCount').textContent = followers.length
      toast(myFollow ? `Вы подписались на ${author.name}` : 'Подписка отменена')
    } catch (error) {
      if (error.status === 401) goToLogin()
      else toast(error.message)
    } finally {
      button.disabled = false
    }
  })
}

try {
  if (authorId) await renderAuthor()
  else await renderCooks()
} catch (error) {
  if (error.status === 404) showMessage('Кулинар не найден')
  else if (error instanceof TypeError) showMessage('Сервер не отвечает. Запустите API командой npm start.')
  else showMessage(escapeHtml(error.message))
}
