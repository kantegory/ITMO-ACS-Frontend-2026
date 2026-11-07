const publishedList = document.getElementById('publishedList')
const savedList = document.getElementById('savedList')
const followingList = document.getElementById('followingList')

function renderProfile() {
  document.getElementById('profileAvatar').textContent = initials(CURRENT_USER.name)
  document.getElementById('profileName').textContent = CURRENT_USER.name
  document.getElementById('profileMeta').textContent = `@${CURRENT_USER.username} · ${CURRENT_USER.city || 'город не указан'}`
  document.getElementById('profileBio').textContent = CURRENT_USER.bio

  const published = RECIPES.filter((recipe) => recipe.authorId === CURRENT_USER.id)
  const saved = RECIPES.filter((recipe) => getStored('savedRecipes').includes(recipe.id))
  const following = AUTHORS.filter((author) => getStored('following').includes(author.id))

  document.getElementById('profileStats').innerHTML = `
    <span>${plural(published.length, ['публикация', 'публикации', 'публикаций'])}</span>
    <span>Сохранено: ${saved.length}</span>
    <span>${plural(following.length, ['подписка', 'подписки', 'подписок'])}</span>
  `

  renderRecipeGrid(publishedList, published, 'Вы ещё ничего не опубликовали. Нажмите «Новый рецепт».')
  renderRecipeGrid(savedList, saved, 'Сохранённых рецептов нет. Нажмите «Сохранить» на карточке рецепта.')

  followingList.innerHTML = following.length
    ? following
        .map(
          (author) => `
            <div class="col-12 col-md-6 col-lg-4">
              <div class="panel d-flex align-items-center gap-3 h-100">
                <span class="avatar">${initials(author.name)}</span>
                <a class="flex-grow-1 text-reset fw-medium" href="author.html?id=${author.id}">${author.name}</a>
                <button type="button" class="btn btn-sm btn-outline-secondary btn-unfollow" data-id="${author.id}">Отписаться</button>
              </div>
            </div>
          `
        )
        .join('')
    : '<div class="col-12"><p class="empty-state">Вы пока ни на кого не подписаны.</p></div>'
}

followingList.addEventListener('click', (event) => {
  const button = event.target.closest('.btn-unfollow')
  if (!button) return
  toggleStored('following', Number(button.dataset.id))
  renderProfile()
})

document.addEventListener('saved-changed', renderProfile)

const editForm = document.getElementById('editProfileForm')
document.getElementById('editProfileModal').addEventListener('show.bs.modal', () => {
  editForm.name.value = CURRENT_USER.name
  editForm.city.value = CURRENT_USER.city || ''
  editForm.bio.value = CURRENT_USER.bio || ''
  editForm.classList.remove('was-validated')
})

editForm.addEventListener('submit', (event) => {
  event.preventDefault()
  if (!validateForm(editForm)) return

  const profile = {
    name: editForm.name.value.trim(),
    city: editForm.city.value.trim(),
    bio: editForm.bio.value.trim(),
  }
  Object.assign(CURRENT_USER, profile)
  localStorage.setItem('profile', JSON.stringify(profile))
  bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide()
  renderProfile()
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

recipeForm.addEventListener('submit', (event) => {
  event.preventDefault()
  if (!validateForm(recipeForm)) return

  const ingredients = lines(recipeForm.ingredients.value).map((line) => {
    const [name, amount = ''] = line.split(/\s+-\s+/)
    return { name, amount }
  })

  const recipe = {
    id: Date.now(),
    title: recipeForm.title.value.trim(),
    image: 'assets/img/placeholder.svg',
    type: recipeForm.type.value,
    difficulty: recipeForm.difficulty.value,
    time: Number(recipeForm.time.value),
    servings: Number(recipeForm.servings.value),
    authorId: CURRENT_USER.id,
    likes: 0,
    description: recipeForm.description.value.trim(),
    tags: INGREDIENTS.filter((tag) =>
      ingredients.some((item) =>
        item.name
          .toLowerCase()
          .split(/[^а-яё]+/)
          .some((word) => INGREDIENT_PATTERNS[tag].test(word))
      )
    ),
    ingredients,
    steps: lines(recipeForm.steps.value),
    video: null,
  }

  const userRecipes = getStored('userRecipes')
  userRecipes.push(recipe)
  localStorage.setItem('userRecipes', JSON.stringify(userRecipes))
  RECIPES.push(recipe)

  recipeForm.reset()
  recipeForm.classList.remove('was-validated')
  bootstrap.Modal.getInstance(document.getElementById('newRecipeModal')).hide()
  renderProfile()
})

renderProfile()
