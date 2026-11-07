const user = requireAuth()
const publishedList = document.getElementById('publishedList')
const savedList = document.getElementById('savedList')
const followingList = document.getElementById('followingList')
let profile
let published = []
let saved = []
let following = []

function renderProfile() {
  document.getElementById('profileAvatar').textContent = initials(profile.name)
  document.getElementById('profileName').textContent = profile.name
  document.getElementById('profileMeta').textContent = `@${profile.username} · ${profile.city || 'город не указан'} · ${user.email}`
  document.getElementById('profileBio').textContent = profile.bio
  document.getElementById('profileStats').innerHTML = `
    <span>${plural(published.length, ['публикация', 'публикации', 'публикаций'])}</span>
    <span>Сохранено: ${saved.length}</span>
    <span>${plural(following.length, ['подписка', 'подписки', 'подписок'])}</span>
  `
}

function renderPublished() {
  renderRecipeGrid(publishedList, published, 'Вы ещё ничего не опубликовали. Нажмите «Новый рецепт».')
  publishedList.querySelectorAll('.card-actions').forEach((actions, index) => {
    actions.insertAdjacentHTML(
      'beforeend',
      `<button type="button" class="btn btn-sm btn-outline-danger ms-auto btn-delete" data-id="${published[index].id}" aria-label="Удалить рецепт «${escapeHtml(published[index].title)}»">Удалить</button>`
    )
  })
}

function renderFollowing() {
  followingList.innerHTML = following.length
    ? following
        .map(
          (follow) => `
            <div class="col-12 col-md-6 col-lg-4">
              <div class="panel d-flex align-items-center gap-3 h-100">
                <span class="avatar" aria-hidden="true">${escapeHtml(initials(authorName(follow.authorId)))}</span>
                <a class="flex-grow-1 text-reset fw-medium" href="author.html?id=${follow.authorId}">${escapeHtml(authorName(follow.authorId))}</a>
                <button type="button" class="btn btn-sm btn-outline-secondary btn-unfollow" data-id="${follow.id}" aria-label="Отписаться от ${escapeHtml(authorName(follow.authorId))}">Отписаться</button>
              </div>
            </div>
          `
        )
        .join('')
    : '<div class="col-12"><p class="empty-state">Вы пока ни на кого не подписаны.</p></div>'
}

async function loadSaved() {
  const ids = [...state.saved.keys()]
  saved = ids.length ? await api(`/recipes?${query({ id: ids, _embed: 'likes' })}`) : []
  remember(saved)
  renderRecipeGrid(savedList, saved, 'Сохранённых рецептов нет. Нажмите «Сохранить» на карточке рецепта.')
}

async function loadProfile() {
  ;[publishedList, savedList, followingList].forEach(showLoading)
  try {
    await loadCommon()
    ;[profile, published, following] = await Promise.all([
      api(`/profiles/${user.id}`),
      api(`/recipes?${query({ userId: user.id, _embed: 'likes' })}`),
      api(`/follows?${query({ userId: user.id })}`),
    ])
    remember(published)
    await loadSaved()
    renderProfile()
    renderPublished()
    renderFollowing()
  } catch (error) {
    ;[publishedList, savedList, followingList].forEach((container) => showError(container, error))
  }
}

followingList.addEventListener('click', async (event) => {
  const button = event.target.closest('.btn-unfollow')
  if (!button) return
  button.disabled = true
  try {
    await api(`/follows/${button.dataset.id}`, { method: 'DELETE' })
    following = following.filter((follow) => follow.id !== Number(button.dataset.id))
    renderFollowing()
    renderProfile()
  } catch (error) {
    showToast(error.message)
    if (error.status === 404) {
      following = await api(`/follows?${query({ userId: user.id })}`)
      renderFollowing()
      renderProfile()
    }
    button.disabled = false
  }
})

publishedList.addEventListener('click', async (event) => {
  const button = event.target.closest('.btn-delete')
  if (!button) return
  button.disabled = true
  try {
    await api(`/recipes/${button.dataset.id}`, { method: 'DELETE' })
    published = published.filter((recipe) => recipe.id !== Number(button.dataset.id))
    state.saved.delete(Number(button.dataset.id))
    renderPublished()
    await loadSaved()
    renderProfile()
  } catch (error) {
    showToast(error.message)
    button.disabled = false
  }
})

document.addEventListener('saved-changed', async () => {
  await loadSaved()
  renderProfile()
})

const editForm = document.getElementById('editProfileForm')
document.getElementById('editProfileModal').addEventListener('show.bs.modal', () => {
  editForm.name.value = profile.name
  editForm.city.value = profile.city || ''
  editForm.bio.value = profile.bio || ''
  editForm.classList.remove('was-validated')
})

editForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!validateForm(editForm)) return
  const button = editForm.querySelector('button[type=submit]')
  button.disabled = true
  try {
    profile = await api(`/profiles/${user.id}`, {
      method: 'PATCH',
      body: { name: editForm.name.value.trim(), city: editForm.city.value.trim(), bio: editForm.bio.value.trim() },
    })
    state.profiles.set(profile.id, profile)
    saveSession({ accessToken: getToken(), user: { ...user, name: profile.name } })
    bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide()
    renderProfile()
    renderPublished()
    renderAuthNav()
  } catch (error) {
    showToast(error.message)
  } finally {
    button.disabled = false
  }
})

const recipeForm = document.getElementById('newRecipeForm')
recipeForm.type.insertAdjacentHTML('beforeend', DISH_TYPES.map((type) => `<option>${type}</option>`).join(''))
recipeForm.difficulty.insertAdjacentHTML('beforeend', DIFFICULTIES.map((item) => `<option>${item}</option>`).join(''))

function lines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function detectTags(ingredients) {
  return INGREDIENTS.filter((tag) =>
    ingredients.some((item) =>
      item.name
        .toLowerCase()
        .split(/[^а-яё]+/)
        .some((word) => INGREDIENT_PATTERNS[tag].test(word))
    )
  )
}

recipeForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!validateForm(recipeForm)) return

  const ingredients = lines(recipeForm.ingredients.value).map((line) => {
    const [name, amount = ''] = line.split(/\s+-\s+/)
    return { name, amount }
  })

  const button = recipeForm.querySelector('button[type=submit]')
  button.disabled = true
  try {
    const recipe = await api('/recipes', {
      method: 'POST',
      body: {
        title: recipeForm.title.value.trim(),
        image: 'assets/img/placeholder.svg',
        type: recipeForm.type.value,
        difficulty: recipeForm.difficulty.value,
        time: Number(recipeForm.time.value),
        servings: Number(recipeForm.servings.value),
        userId: user.id,
        description: recipeForm.description.value.trim(),
        tags: detectTags(ingredients),
        ingredients,
        steps: lines(recipeForm.steps.value),
        video: null,
        createdAt: new Date().toISOString(),
      },
    })
    recipe.likes = []
    published.push(remember([recipe])[0])
    recipeForm.reset()
    recipeForm.classList.remove('was-validated')
    bootstrap.Modal.getInstance(document.getElementById('newRecipeModal')).hide()
    renderPublished()
    renderProfile()
  } catch (error) {
    showToast(error.message)
  } finally {
    button.disabled = false
  }
})

if (user) loadProfile()
