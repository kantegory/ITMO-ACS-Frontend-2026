// Личный кабинет: мои рецепты (создание, изменение, удаление),
// сохранённые рецепты, подписки и редактирование профиля.

import * as api from '../api.js'
import { goToLogin, requireAuth, updateSessionUser } from '../auth.js'
import { bindSaveButtons } from '../saves.js'
import {
  avatar, escapeHtml, icon, plural, renderGrid, renderHeader, showError, toast, youtubeId
} from '../ui.js'

const me = requireAuth()
renderHeader()

const head = document.getElementById('profileHead')
const mineGrid = document.getElementById('mineGrid')
const savedGrid = document.getElementById('savedGrid')
const followingList = document.getElementById('followingList')

const recipeForm = document.getElementById('recipeForm')
const recipeModal = new bootstrap.Modal('#recipeModal')
const profileForm = document.getElementById('profileForm')
const profileModal = new bootstrap.Modal('#profileModal')
const deleteModal = new bootstrap.Modal('#deleteModal')

const state = {
  user: null,
  mine: [],
  saved: new Map(), // recipeId -> id записи в /saves
  savedRecipes: [],
  following: [],
  followers: 0,
  deleteId: null
}

function handleError(error) {
  if (error.status === 401) goToLogin()
  else toast(error.message)
}

/* ---------- отрисовка ---------- */

function renderHead() {
  const { user } = state
  head.innerHTML = `
    ${avatar(user, 'xl')}
    <div class="d-flex flex-wrap align-items-end justify-content-between gap-3">
      <div>
        <h1 class="profile-head__name">${escapeHtml(user.name)}</h1>
        <p class="text-muted-warm mb-2">${icon('pin')} ${escapeHtml(user.city || 'Город не указан')} · ${escapeHtml(user.email)}</p>
        <p class="mb-0">${escapeHtml(user.bio || 'Расскажите о себе в настройках профиля.')}</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-soft" type="button" data-open-profile>${icon('edit')} Редактировать</button>
        <button class="btn btn-accent" type="button" data-new-recipe>${icon('plus')} Новый рецепт</button>
      </div>
    </div>
    <ul class="profile-stats">
      <li><strong>${state.mine.length}</strong><span>${plural(state.mine.length, 'публикация', 'публикации', 'публикаций')}</span></li>
      <li><strong>${state.saved.size}</strong><span>сохранено</span></li>
      <li><strong>${state.following.length}</strong><span>${plural(state.following.length, 'подписка', 'подписки', 'подписок')}</span></li>
      <li><strong>${state.followers}</strong><span>${plural(state.followers, 'подписчик', 'подписчика', 'подписчиков')}</span></li>
    </ul>`
}

function renderMine() {
  renderGrid(mineGrid, state.mine, { actions: true, savedIds: new Set(state.saved.keys()) })
  mineGrid.insertAdjacentHTML('beforeend', `
    <div class="col">
      <button class="add-card w-100" type="button" data-new-recipe>${icon('plus')} Добавить рецепт</button>
    </div>`)
  document.getElementById('countMine').textContent = state.mine.length
}

function renderSaved() {
  if (state.savedRecipes.length) {
    renderGrid(savedGrid, state.savedRecipes, { savedIds: new Set(state.saved.keys()) })
  } else {
    savedGrid.innerHTML = '<div class="col-12"><div class="empty-state">Сохраняйте рецепты кнопкой с закладкой, и они появятся здесь.</div></div>'
  }
  document.getElementById('countSaved').textContent = state.savedRecipes.length
}

function renderFollowing() {
  followingList.innerHTML = state.following.length
    ? state.following.map(({ subscription, author }) => `
      <div class="col">
        <div class="cook-card">
          ${avatar(author, 'lg')}
          <div class="me-auto">
            <a class="cook-card__name" href="author.html?id=${author.id}">${escapeHtml(author.name)}</a>
            <p class="cook-card__meta">${escapeHtml(author.city)}</p>
          </div>
          <button class="btn btn-soft btn-sm" type="button" data-unsubscribe="${subscription.id}">Отписаться</button>
        </div>
      </div>`).join('')
    : '<div class="col-12"><div class="empty-state">Вы пока ни на кого не подписаны. <a href="author.html">Найти кулинаров</a></div></div>'
  document.getElementById('countFollowing').textContent = state.following.length
}

function renderAll() {
  renderHead()
  renderMine()
  renderSaved()
  renderFollowing()
}

/* ---------- загрузка ---------- */

async function loadSavedRecipes() {
  const saves = await api.getSaves({ userId: me.id })
  // Map не пересоздаём: на него уже ссылаются обработчики закладок
  state.saved.clear()
  saves.forEach((save) => state.saved.set(save.recipeId, save.id))
  // одним запросом получаем все сохранённые рецепты: /recipes?id=1&id=3...
  state.savedRecipes = saves.length ? await api.getRecipes({ id: [...state.saved.keys()] }) : []
}

async function loadFollowing() {
  const subscriptions = await api.getSubscriptions({ userId: me.id })
  const authors = subscriptions.length
    ? await api.getUsers({ id: subscriptions.map((sub) => sub.authorId) })
    : []
  state.following = subscriptions.map((subscription) => ({
    subscription,
    author: authors.find((author) => author.id === subscription.authorId)
  }))
}

async function load() {
  try {
    const [user, mine, followers] = await Promise.all([
      api.getUser(me.id),
      api.getRecipes({ userId: me.id, _sort: 'createdAt', _order: 'desc' }),
      api.getSubscriptions({ authorId: me.id })
    ])
    Object.assign(state, { user, mine, followers: followers.length })
    await Promise.all([loadSavedRecipes(), loadFollowing()])
    renderAll()
  } catch (error) {
    if (error.status === 401) return goToLogin()
    showError(head, error)
  }
}

/* ---------- рецепт: создание и изменение ---------- */

const TAG_RULES = {
  яйца: /яйц|желтк|белк/i,
  мука: /мук/i,
  молоко: /молок|сливк|сметан|кефир/i,
  сыр: /сыр|пармезан|пекорино|моцарел/i,
  мясо: /мяс|говяд|свин|баран|кур|фарш|бекон|гуанчиале|индейк/i,
  овощи: /картоф|морков|лук|помидор|томат|перец|капуст|тыкв|кабач|свёкл|свекл|огур/i,
  фрукты: /яблок|банан|груш|ягод|апельсин|лимон/i,
  макароны: /макарон|спагетти|паст|лапш|лазань/i,
  рис: /рис/i
}

// теги для фильтра «Ингредиенты» подбираем по названиям продуктов
function detectTags(ingredients) {
  return Object.keys(TAG_RULES).filter((tag) =>
    ingredients.some((item) => TAG_RULES[tag].test(item.name)))
}

function parseIngredients(text) {
  return text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name, amount = ''] = line.split(/\s+[—–-]\s+|:\s*/)
    return { name: name.trim(), amount: amount.trim() }
  })
}

function openRecipeForm(recipe = null) {
  recipeForm.reset()
  recipeForm.classList.remove('was-validated')
  document.getElementById('recipeModalTitle').textContent = recipe ? 'Изменить рецепт' : 'Новый рецепт'
  document.getElementById('recipeSubmit').textContent = recipe ? 'Сохранить' : 'Опубликовать'

  if (recipe) {
    const f = recipeForm.elements
    f.id.value = recipe.id
    f.title.value = recipe.title
    f.type.value = recipe.type
    f.difficulty.value = recipe.difficulty
    f.time.value = recipe.time
    f.servings.value = recipe.servings
    f.description.value = recipe.description
    f.ingredients.value = recipe.ingredients.map((item) => [item.name, item.amount].filter(Boolean).join(' — ')).join('\n')
    f.steps.value = recipe.steps.join('\n')
    f.image.value = recipe.image?.startsWith('http') ? recipe.image : ''
    f.video.value = recipe.video ? `https://youtu.be/${recipe.video}` : ''
  } else {
    recipeForm.elements.id.value = ''
  }
  recipeModal.show()
}

recipeForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  recipeForm.classList.add('was-validated')
  if (!recipeForm.checkValidity()) return

  const f = recipeForm.elements
  const ingredients = parseIngredients(f.ingredients.value)
  const data = {
    title: f.title.value.trim(),
    type: f.type.value,
    difficulty: f.difficulty.value,
    time: Number(f.time.value),
    servings: Number(f.servings.value),
    description: f.description.value.trim(),
    ingredients,
    tags: detectTags(ingredients),
    steps: f.steps.value.split('\n').map((line) => line.trim()).filter(Boolean),
    video: youtubeId(f.video.value.trim())
  }
  const id = Number(f.id.value)
  const oldRecipe = state.mine.find((recipe) => recipe.id === id)
  // своё фото по ссылке; если ссылку не дали — оставляем прежнее фото или заглушку
  data.image = f.image.value.trim() || oldRecipe?.image || 'img/recipes/placeholder.svg'

  try {
    if (id) {
      await api.updateRecipe(id, data)
      toast('Рецепт обновлён')
    } else {
      await api.createRecipe({ ...data, userId: me.id, createdAt: new Date().toISOString().slice(0, 10) })
      toast('Рецепт опубликован')
    }
    recipeModal.hide()
    state.mine = await api.getRecipes({ userId: me.id, _sort: 'createdAt', _order: 'desc' })
    renderHead()
    renderMine()
  } catch (error) {
    handleError(error)
  }
})

/* ---------- удаление рецепта ---------- */

document.getElementById('confirmDelete').addEventListener('click', async () => {
  try {
    // json-server сам удалит связанные лайки, комментарии и сохранения
    await api.deleteRecipe(state.deleteId)
    state.mine = state.mine.filter((recipe) => recipe.id !== state.deleteId)
    await loadSavedRecipes()
    deleteModal.hide()
    renderAll()
    toast('Рецепт удалён')
  } catch (error) {
    handleError(error)
  }
})

/* ---------- профиль ---------- */

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  profileForm.classList.add('was-validated')
  if (!profileForm.checkValidity()) return

  const data = {
    name: profileForm.elements.name.value.trim(),
    city: profileForm.elements.city.value.trim(),
    bio: profileForm.elements.bio.value.trim()
  }
  try {
    state.user = await api.updateUser(me.id, data)
    updateSessionUser(data)
    profileModal.hide()
    renderHead()
    renderHeader()
    toast('Профиль сохранён')
  } catch (error) {
    handleError(error)
  }
})

/* ---------- клики по кнопкам ---------- */

document.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-new-recipe], [data-edit], [data-delete], [data-open-profile], [data-unsubscribe]')
  if (!target) return

  if (target.matches('[data-new-recipe]')) openRecipeForm()

  if (target.matches('[data-edit]')) {
    openRecipeForm(state.mine.find((recipe) => recipe.id === Number(target.dataset.edit)))
  }

  if (target.matches('[data-delete]')) {
    state.deleteId = Number(target.dataset.delete)
    deleteModal.show()
  }

  if (target.matches('[data-open-profile]')) {
    profileForm.classList.remove('was-validated')
    profileForm.elements.name.value = state.user.name
    profileForm.elements.city.value = state.user.city ?? ''
    profileForm.elements.bio.value = state.user.bio ?? ''
    profileModal.show()
  }

  if (target.matches('[data-unsubscribe]')) {
    try {
      await api.unsubscribe(Number(target.dataset.unsubscribe))
      state.following = state.following.filter(({ subscription }) => subscription.id !== Number(target.dataset.unsubscribe))
      renderFollowing()
      renderHead()
      toast('Подписка отменена')
    } catch (error) {
      handleError(error)
    }
  }
})

// снятие закладки в «Сохранённых» сразу убирает карточку из списка
bindSaveButtons(savedGrid, state.saved, (recipeId, isSaved) => {
  if (!isSaved) state.savedRecipes = state.savedRecipes.filter((recipe) => recipe.id !== recipeId)
  renderSaved()
  renderMine()
  renderHead()
})

bindSaveButtons(mineGrid, state.saved, async () => {
  await loadSavedRecipes()
  renderSaved()
  renderHead()
})

if (me) load()
