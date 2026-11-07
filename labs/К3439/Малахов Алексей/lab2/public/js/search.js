const form = document.getElementById('filtersPanel')
const results = document.getElementById('results')
const resultsCount = document.getElementById('resultsCount')
const sortSelect = document.getElementById('sort')

document.getElementById('dishType').insertAdjacentHTML(
  'beforeend',
  DISH_TYPES.map((type) => `<option value="${type}">${type}</option>`).join('')
)

function checkboxes(name, values) {
  return values
    .map(
      (value, index) => `
        <div class="form-check">
          <input class="form-check-input" type="checkbox" name="${name}" value="${value}" id="${name}${index}">
          <label class="form-check-label" for="${name}${index}">${value}</label>
        </div>
      `
    )
    .join('')
}

document.getElementById('difficultyList').innerHTML = checkboxes('difficulty', DIFFICULTIES)
document.getElementById('ingredientList').innerHTML = checkboxes('ingredient', INGREDIENTS)

const params = new URLSearchParams(location.search)
form.q.value = params.get('q') || ''
form.type.value = params.get('type') || ''

let requestNumber = 0

async function applyFilters() {
  const data = new FormData(form)
  const ingredients = data.getAll('ingredient')
  const current = ++requestNumber

  resultsCount.textContent = 'Загрузка...'
  try {
    const found = await api(
      '/recipes?' +
        query({
          title_like: data.get('q').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          type: data.get('type'),
          difficulty: data.getAll('difficulty'),
          time_lte: data.get('time'),
          _embed: 'likes',
        })
    )
    if (current !== requestNumber) return

    const filtered = found.filter((recipe) => ingredients.every((item) => recipe.tags.includes(item)))
    if (sortSelect.value === 'popular') filtered.sort((a, b) => b.likes.length - a.likes.length)
    if (sortSelect.value === 'fast') filtered.sort((a, b) => a.time - b.time)
    if (sortSelect.value === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'))

    remember(filtered)
    resultsCount.textContent = `Найдено: ${plural(filtered.length, ['рецепт', 'рецепта', 'рецептов'])}`
    renderRecipeGrid(results, filtered, 'Ничего не нашлось. Попробуйте убрать часть фильтров.')
  } catch (error) {
    if (current !== requestNumber) return
    resultsCount.textContent = ''
    showError(results, error)
  }
}

let timer
form.addEventListener('input', () => {
  clearTimeout(timer)
  timer = setTimeout(applyFilters, 300)
})
form.addEventListener('submit', (event) => {
  event.preventDefault()
  applyFilters()
})
form.addEventListener('reset', () => setTimeout(applyFilters))
sortSelect.addEventListener('change', applyFilters)

loadCommon()
  .then(applyFilters)
  .catch((error) => showError(results, error))
