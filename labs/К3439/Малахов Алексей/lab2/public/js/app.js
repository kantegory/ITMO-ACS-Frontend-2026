const SPRITE_URL = 'assets/img/sprite.svg'

function icon(name) {
  return (
    '<svg class="icon" aria-hidden="true" focusable="false">' +
    `<use href="${SPRITE_URL}#icon-${name}"></use></svg>`
  )
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
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.setAttribute('aria-invalid', String(!field.checkValidity()))
  })
  const valid = form.checkValidity()
  if (!valid) form.querySelector(':invalid').focus()
  return valid
}

const state = {
  profiles: new Map(),
  recipes: new Map(),
  saved: new Map(),
}

async function loadCommon() {
  const user = currentUser()
  const [profiles, saved] = await Promise.all([
    api('/profiles'),
    user ? api(`/saved?${query({ userId: user.id })}`) : [],
  ])
  profiles.forEach((profile) => state.profiles.set(profile.id, profile))
  saved.forEach((item) => state.saved.set(item.recipeId, item.id))
}

function authorName(userId) {
  return state.profiles.get(userId)?.name || 'Неизвестный автор'
}

function myLike(recipe) {
  const user = currentUser()
  return user && recipe.likes.find((like) => like.userId === user.id)
}

function remember(recipes) {
  recipes.forEach((recipe) => state.recipes.set(recipe.id, recipe))
  return recipes
}

function recipeCard(recipe) {
  const liked = Boolean(myLike(recipe))
  const saved = state.saved.has(recipe.id)

  return `
    <article class="recipe-card card">
      <img src="${escapeHtml(recipe.image)}" class="recipe-card__img" alt="${escapeHtml(recipe.title)}" loading="lazy">
      <div class="card-body d-flex flex-column gap-2">
        <div class="d-flex flex-wrap gap-2">
          <span class="badge badge-type">${escapeHtml(recipe.type)}</span>
          <span class="badge badge-difficulty">${escapeHtml(recipe.difficulty)}</span>
        </div>
        <h3 class="recipe-card__title mb-0">
          <a href="recipe.html?id=${recipe.id}">${escapeHtml(recipe.title)}</a>
        </h3>
        <p class="text-muted small mb-0">${escapeHtml(authorName(recipe.userId))}</p>
        <div class="meta">
          <span>${icon('clock')} ${recipe.time} мин</span>
          <span>${icon('servings')} ${recipe.servings} порц.</span>
        </div>
        <div class="card-actions d-flex gap-2 mt-auto pt-2">
          ${likeButton(recipe, liked, 'btn-sm')}
          ${saveButton(recipe.id, saved, 'btn-sm')}
        </div>
      </div>
    </article>
  `
}

function likeButton(recipe, liked, size = '') {
  return `
    <button type="button" class="btn ${size} btn-outline-secondary btn-like ${liked ? 'active' : ''}" data-id="${recipe.id}" aria-pressed="${liked}" aria-label="Нравится «${escapeHtml(recipe.title)}», отметок: ${recipe.likes.length}">
      ${icon('heart')} <span class="like-count">${recipe.likes.length}</span>
    </button>
  `
}

function saveButton(id, saved, size = '') {
  return `
    <button type="button" class="btn ${size} btn-outline-secondary btn-save ${saved ? 'active' : ''}" data-id="${id}" aria-pressed="${saved}">
      ${icon('bookmark')} <span class="save-label">${saved ? 'Сохранён' : 'Сохранить'}</span>
    </button>
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

function showLoading(container) {
  container.innerHTML = '<div class="col-12 empty-state"><div class="spinner-border" role="status"><span class="visually-hidden">Загрузка...</span></div></div>'
}

function showError(container, error) {
  container.innerHTML = `<div class="col-12"><div class="alert alert-danger" role="alert">${escapeHtml(error.message)}</div></div>`
}

function showToast(text) {
  let toast = document.getElementById('appToast')
  if (!toast) {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div class="toast-container position-fixed bottom-0 end-0 p-3"><div id="appToast" class="toast text-bg-dark" role="alert" aria-live="assertive"><div class="toast-body"></div></div></div>'
    )
    toast = document.getElementById('appToast')
  }
  toast.querySelector('.toast-body').textContent = text
  bootstrap.Toast.getOrCreateInstance(toast).show()
}

function renderAuthNav() {
  const nav = document.getElementById('authNav')
  const user = currentUser()
  if (!nav || !user) return
  nav.innerHTML = `
    <a class="btn btn-link text-reset text-decoration-none" href="profile.html" data-icon="user"> ${escapeHtml(user.name || user.email)}</a>
    <button type="button" class="btn btn-outline-primary" id="logoutButton">Выйти</button>
  `
  document.getElementById('logoutButton').addEventListener('click', () => {
    logout()
    location.href = 'index.html'
  })
}

function updateLikeButtons(recipe) {
  document.querySelectorAll(`.btn-like[data-id="${recipe.id}"]`).forEach((item) => {
    item.classList.toggle('active', Boolean(myLike(recipe)))
    item.setAttribute('aria-pressed', String(Boolean(myLike(recipe))))
    item.setAttribute('aria-label', `Нравится «${recipe.title}», отметок: ${recipe.likes.length}`)
    item.querySelector('.like-count').textContent = recipe.likes.length
  })
}

function updateSaveButtons(id) {
  document.querySelectorAll(`.btn-save[data-id="${id}"]`).forEach((item) => {
    item.classList.toggle('active', state.saved.has(id))
    item.setAttribute('aria-pressed', String(state.saved.has(id)))
    item.querySelector('.save-label').textContent = state.saved.has(id) ? 'Сохранён' : 'Сохранить'
  })
}

async function toggleLike(button) {
  const recipe = state.recipes.get(Number(button.dataset.id))
  const user = currentUser()
  if (!user) {
    location.href = loginUrl()
    return
  }
  button.disabled = true
  try {
    const like = myLike(recipe)
    if (like) {
      await api(`/likes/${like.id}`, { method: 'DELETE' })
      recipe.likes = recipe.likes.filter((item) => item.id !== like.id)
    } else {
      recipe.likes.push(await api('/likes', { method: 'POST', body: { recipeId: recipe.id, userId: user.id } }))
    }
    updateLikeButtons(recipe)
  } catch (error) {
    showToast(error.message)
    if ([404, 409].includes(error.status)) {
      recipe.likes = await api(`/likes?${query({ recipeId: recipe.id })}`)
      updateLikeButtons(recipe)
    }
  } finally {
    button.disabled = false
  }
}

async function toggleSave(button) {
  const id = Number(button.dataset.id)
  const user = currentUser()
  if (!user) {
    location.href = loginUrl()
    return
  }
  button.disabled = true
  try {
    if (state.saved.has(id)) {
      await api(`/saved/${state.saved.get(id)}`, { method: 'DELETE' })
      state.saved.delete(id)
    } else {
      const item = await api('/saved', { method: 'POST', body: { recipeId: id, userId: user.id } })
      state.saved.set(id, item.id)
    }
    updateSaveButtons(id)
    document.dispatchEvent(new CustomEvent('saved-changed'))
  } catch (error) {
    showToast(error.message)
    if ([404, 409].includes(error.status)) {
      const [item] = await api(`/saved?${query({ userId: user.id, recipeId: id })}`)
      if (item) state.saved.set(id, item.id)
      else state.saved.delete(id)
      updateSaveButtons(id)
    }
  } finally {
    button.disabled = false
  }
}

document.addEventListener('input', (event) => {
  if (event.target.matches(TEXT_FIELDS)) checkBlank(event.target)
})

document.addEventListener('click', (event) => {
  const likeButton = event.target.closest('.btn-like')
  if (likeButton) toggleLike(likeButton)

  const saveButton = event.target.closest('.btn-save')
  if (saveButton) toggleSave(saveButton)
})

renderAuthNav()

document.querySelectorAll('[data-icon]').forEach((element) => {
  element.insertAdjacentHTML('afterbegin', icon(element.dataset.icon))
})
