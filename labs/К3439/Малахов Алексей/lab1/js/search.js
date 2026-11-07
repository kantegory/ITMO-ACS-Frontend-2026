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

function applyFilters() {
  const data = new FormData(form)
  const query = data.get('q').trim().toLowerCase()
  const type = data.get('type')
  const difficulties = data.getAll('difficulty')
  const ingredients = data.getAll('ingredient')
  const maxTime = Number(data.get('time'))

  const found = RECIPES.filter((recipe) => {
    if (query && !recipe.title.toLowerCase().includes(query)) return false
    if (type && recipe.type !== type) return false
    if (difficulties.length && !difficulties.includes(recipe.difficulty)) return false
    if (ingredients.some((item) => !recipe.tags.includes(item))) return false
    if (maxTime && recipe.time > maxTime) return false
    return true
  })

  if (sortSelect.value === 'popular') found.sort((a, b) => likesCount(b) - likesCount(a))
  if (sortSelect.value === 'fast') found.sort((a, b) => a.time - b.time)
  if (sortSelect.value === 'title') found.sort((a, b) => a.title.localeCompare(b.title, 'ru'))

  resultsCount.textContent = `Найдено: ${plural(found.length, ['рецепт', 'рецепта', 'рецептов'])}`
  renderRecipeGrid(results, found, 'Ничего не нашлось. Попробуйте убрать часть фильтров.')
}

form.addEventListener('input', applyFilters)
form.addEventListener('submit', (event) => {
  event.preventDefault()
  applyFilters()
})
form.addEventListener('reset', () => setTimeout(applyFilters))
sortSelect.addEventListener('change', applyFilters)

applyFilters()
