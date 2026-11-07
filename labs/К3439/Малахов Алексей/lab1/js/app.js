const ICONS = {
  logo: '<path d="M7 17h10v4H7z"/><path d="M7 17v-4.5A4 4 0 0 1 8 4.6a5 5 0 0 1 8 0 4 4 0 0 1 1 7.9V17"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
  bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  servings: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6"/><path d="M18 14.5c1.8.8 3 2.9 3 5.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  comment: '<path d="M4 5h16v11H9l-5 4z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
}

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`
}

function getStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}

function toggleStored(key, id) {
  const list = getStored(key)
  const index = list.indexOf(id)
  if (index === -1) {
    list.push(id)
  } else {
    list.splice(index, 1)
  }
  localStorage.setItem(key, JSON.stringify(list))
  return index === -1
}

function findAuthor(id) {
  return AUTHORS.find((author) => author.id === id) || CURRENT_USER
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function plural(n, forms) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} ${forms[0]}`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${forms[1]}`
  return `${n} ${forms[2]}`
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const TEXT_FIELDS = 'input[type=text], input[type=password], textarea'

function checkBlank(field) {
  if (field.dataset.noTrim !== undefined) return
  const value = field.type === 'password' ? field.value : field.value.trim()
  const blank = field.required && !field.value.trim()
  field.setCustomValidity(blank || value.length < field.minLength ? 'empty' : '')
}

function validateForm(form) {
  form.querySelectorAll(TEXT_FIELDS).forEach(checkBlank)
  form.classList.add('was-validated')
  return form.checkValidity()
}

function likesCount(recipe) {
  return recipe.likes + (getStored('likedRecipes').includes(recipe.id) ? 1 : 0)
}

function recipeCard(recipe) {
  const author = findAuthor(recipe.authorId)
  const liked = getStored('likedRecipes').includes(recipe.id)
  const saved = getStored('savedRecipes').includes(recipe.id)

  return `
    <article class="recipe-card card">
      <img src="${recipe.image}" class="recipe-card__img" alt="${escapeHtml(recipe.title)}" loading="lazy">
      <div class="card-body d-flex flex-column gap-2">
        <div class="d-flex flex-wrap gap-2">
          <span class="badge badge-type">${recipe.type}</span>
          <span class="badge badge-difficulty">${recipe.difficulty}</span>
        </div>
        <h3 class="recipe-card__title mb-0">
          <a href="recipe.html?id=${recipe.id}">${escapeHtml(recipe.title)}</a>
        </h3>
        <p class="text-muted small mb-0">${escapeHtml(author.name)}</p>
        <div class="meta">
          <span>${icon('clock')} ${recipe.time} мин</span>
          <span>${icon('servings')} ${recipe.servings} порц.</span>
        </div>
        <div class="card-actions d-flex gap-2 mt-auto pt-2">
          <button type="button" class="btn btn-sm btn-outline-secondary btn-like ${liked ? 'active' : ''}" data-id="${recipe.id}">
            ${icon('heart')} <span class="like-count">${likesCount(recipe)}</span>
          </button>
          <button type="button" class="btn btn-sm btn-outline-secondary btn-save ${saved ? 'active' : ''}" data-id="${recipe.id}">
            ${icon('bookmark')} <span class="save-label">${saved ? 'Сохранён' : 'Сохранить'}</span>
          </button>
        </div>
      </div>
    </article>
  `
}

function renderRecipeGrid(container, recipes, emptyText) {
  if (recipes.length === 0) {
    container.innerHTML = `<div class="col-12"><p class="empty-state">${emptyText}</p></div>`
    return
  }
  container.innerHTML = recipes
    .map((recipe) => `<div class="col-12 col-sm-6 col-lg-4">${recipeCard(recipe)}</div>`)
    .join('')
}

function updateLikeButton(button, recipe) {
  button.classList.toggle('active', getStored('likedRecipes').includes(recipe.id))
  button.querySelector('.like-count').textContent = likesCount(recipe)
}

function updateSaveButton(button, id) {
  const saved = getStored('savedRecipes').includes(id)
  button.classList.toggle('active', saved)
  button.querySelector('.save-label').textContent = saved ? 'Сохранён' : 'Сохранить'
}

try {
  Object.assign(CURRENT_USER, JSON.parse(localStorage.getItem('profile')))
} catch {}

RECIPES.push(...getStored('userRecipes'))

document.addEventListener('input', (event) => {
  if (event.target.matches(TEXT_FIELDS)) checkBlank(event.target)
})

document.addEventListener('click', (event) => {
  const likeButton = event.target.closest('.btn-like')
  if (likeButton) {
    const recipe = RECIPES.find((item) => item.id === Number(likeButton.dataset.id))
    toggleStored('likedRecipes', recipe.id)
    updateLikeButton(likeButton, recipe)
    return
  }

  const saveButton = event.target.closest('.btn-save')
  if (saveButton) {
    const id = Number(saveButton.dataset.id)
    toggleStored('savedRecipes', id)
    updateSaveButton(saveButton, id)
    document.dispatchEvent(new CustomEvent('saved-changed'))
  }
})

document.querySelectorAll('[data-icon]').forEach((element) => {
  element.insertAdjacentHTML('afterbegin', icon(element.dataset.icon))
})
