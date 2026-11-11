// Главная: поиск рецептов с фильтрами. Тип, сложность, время и текст
// фильтрует json-server, а «все выбранные ингредиенты» проверяем на клиенте.

import { getRecipes } from '../api.js'
import { bindSaveButtons, loadSaved } from '../saves.js'
import { renderGrid, renderHeader, showError, showLoading } from '../ui.js'

renderHeader()

const grid = document.getElementById('recipesGrid')
const filtersForm = document.getElementById('filtersForm')
const searchForm = document.getElementById('searchForm')
const sortSelect = document.getElementById('sortSelect')
const counter = document.getElementById('resultsCount')
const emptyState = document.getElementById('emptyState')

let saved = new Map()
let lastRequest = 0
let searchTimer

function readFilters() {
  const data = new FormData(filtersForm)
  return {
    type: data.getAll('type'),
    difficulty: data.getAll('difficulty'),
    tags: data.getAll('tag'),
    time: data.get('time'),
    q: searchForm.q.value.trim(),
    sort: sortSelect.value
  }
}

async function loadRecipes() {
  const filters = readFilters()
  const requestId = ++lastRequest
  showLoading(grid)
  emptyState.classList.add('d-none')

  const params = {
    type: filters.type,
    difficulty: filters.difficulty,
    time_lte: filters.time,
    q: filters.q
  }
  if (filters.sort === 'date') Object.assign(params, { _sort: 'createdAt', _order: 'desc' })
  if (filters.sort === 'time') Object.assign(params, { _sort: 'time', _order: 'asc' })

  try {
    let recipes = await getRecipes(params)
    // пока ждали ответ, пользователь мог поменять фильтры: старый ответ не рисуем
    if (requestId !== lastRequest) return

    recipes = recipes.filter((recipe) => filters.tags.every((tag) => recipe.tags.includes(tag)))
    if (filters.sort === 'likes') recipes.sort((a, b) => b.likes.length - a.likes.length)

    renderGrid(grid, recipes, { savedIds: new Set(saved.keys()) })
    counter.textContent = recipes.length
    emptyState.classList.toggle('d-none', recipes.length > 0)
  } catch (error) {
    showError(grid, error)
    counter.textContent = 0
  }
}

// фильтры можно передать ссылкой: index.html?type=Супы или index.html?q=блины
function applyUrlParams() {
  const params = new URLSearchParams(location.search)
  params.getAll('type').forEach((type) => {
    const checkbox = filtersForm.querySelector(`[name="type"][value="${CSS.escape(type)}"]`)
    if (checkbox) checkbox.checked = true
  })
  if (params.get('q')) searchForm.q.value = params.get('q')
}

filtersForm.addEventListener('change', loadRecipes)
filtersForm.addEventListener('reset', () => setTimeout(loadRecipes))
sortSelect.addEventListener('change', loadRecipes)

searchForm.addEventListener('submit', (event) => {
  event.preventDefault()
  loadRecipes()
})

// не отправляем запрос на каждую букву: ждём паузу в 300 мс
searchForm.q.addEventListener('input', () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadRecipes, 300)
})

document.querySelectorAll('[data-chip]').forEach((chip) => {
  chip.addEventListener('click', () => {
    searchForm.q.value = chip.dataset.chip
    loadRecipes()
  })
})

applyUrlParams()
saved = await loadSaved()
bindSaveButtons(grid, saved)
loadRecipes()
