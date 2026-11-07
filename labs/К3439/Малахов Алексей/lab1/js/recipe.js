const recipeId = Number(new URLSearchParams(location.search).get('id')) || 1
const recipe = RECIPES.find((item) => item.id === recipeId)

function followersText(author) {
  const followed = getStored('following').includes(author.id)
  const count = (author.followers || 0) + (followed ? 1 : 0)
  return plural(count, ['подписчик', 'подписчика', 'подписчиков'])
}

function renderFollow(author) {
  const button = document.getElementById('followButton')
  const followed = getStored('following').includes(author.id)
  button.textContent = followed ? 'Вы подписаны' : 'Подписаться'
  button.classList.toggle('active', followed)
  document.getElementById('authorFollowers').textContent = followersText(author)
}

function renderComments() {
  const list = [...COMMENTS, ...getStored('comments')].filter((comment) => comment.recipeId === recipe.id)
  const container = document.getElementById('comments')

  if (list.length === 0) {
    container.innerHTML = '<li class="text-muted">Комментариев пока нет, будьте первым.</li>'
    return
  }

  container.innerHTML = list
    .map((comment) => {
      const author = findAuthor(comment.authorId)
      return `
        <li class="d-flex gap-3">
          <span class="avatar">${escapeHtml(initials(author.name))}</span>
          <div>
            <div class="fw-medium">${escapeHtml(author.name)} <span class="text-muted small fw-normal">${new Date(comment.date).toLocaleDateString('ru-RU')}</span></div>
            <p class="mb-0">${escapeHtml(comment.text)}</p>
          </div>
        </li>
      `
    })
    .join('')
}

if (!recipe) {
  document.getElementById('notFound').classList.remove('d-none')
  document.getElementById('crumbTitle').textContent = 'Не найден'
} else {
  const author = findAuthor(recipe.authorId)
  document.title = `${recipe.title}: Вкусная лента`
  document.getElementById('recipe').classList.remove('d-none')
  document.getElementById('crumbTitle').textContent = recipe.title
  document.getElementById('recipeImage').src = recipe.image
  document.getElementById('recipeImage').alt = recipe.title
  document.getElementById('recipeType').textContent = recipe.type
  document.getElementById('recipeDifficulty').textContent = recipe.difficulty
  document.getElementById('recipeTitle').textContent = recipe.title
  document.getElementById('recipeDescription').textContent = recipe.description
  document.getElementById('recipeMeta').innerHTML = `
    <span>${icon('clock')} ${recipe.time} мин</span>
    <span>${icon('servings')} ${recipe.servings} порц.</span>
  `

  document.getElementById('authorAvatar').textContent = initials(author.name)
  document.getElementById('authorLink').textContent = author.name
  document.getElementById('authorLink').href = author.id === CURRENT_USER.id ? 'profile.html' : `author.html?id=${author.id}`

  const followButton = document.getElementById('followButton')
  if (author.id === CURRENT_USER.id) {
    followButton.remove()
    document.getElementById('authorFollowers').textContent = 'Ваш рецепт'
  } else {
    renderFollow(author)
    followButton.addEventListener('click', () => {
      toggleStored('following', author.id)
      renderFollow(author)
    })
  }

  const liked = getStored('likedRecipes').includes(recipe.id)
  const saved = getStored('savedRecipes').includes(recipe.id)
  document.getElementById('recipeActions').innerHTML = `
    <button type="button" class="btn btn-outline-secondary btn-like ${liked ? 'active' : ''}" data-id="${recipe.id}">
      ${icon('heart')} <span class="like-count">${likesCount(recipe)}</span>
    </button>
    <button type="button" class="btn btn-outline-secondary btn-save ${saved ? 'active' : ''}" data-id="${recipe.id}">
      ${icon('bookmark')} <span class="save-label">${saved ? 'Сохранён' : 'Сохранить'}</span>
    </button>
  `

  document.getElementById('ingredients').innerHTML = recipe.ingredients
    .map(
      (item, index) => `
        <li class="form-check d-flex justify-content-between gap-2 py-2 border-bottom">
          <span>
            <input class="form-check-input" type="checkbox" id="ingredient${index}">
            <label class="form-check-label" for="ingredient${index}">${escapeHtml(item.name)}</label>
          </span>
          <span class="text-muted text-nowrap">${escapeHtml(item.amount)}</span>
        </li>
      `
    )
    .join('')

  document.getElementById('steps').innerHTML = recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')

  document.getElementById('videoBlock').innerHTML = recipe.video
    ? `<video class="recipe-video" controls preload="metadata" poster="${recipe.image}">
        <source src="${recipe.video}" type="video/webm">
        Ваш браузер не поддерживает видео.
      </video>`
    : '<p class="text-muted mb-0">Автор пока не добавил видео к этому рецепту.</p>'

  renderComments()

  const commentForm = document.getElementById('commentForm')
  commentForm.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!validateForm(commentForm)) return

    const comments = getStored('comments')
    comments.push({
      id: Date.now(),
      recipeId: recipe.id,
      authorId: CURRENT_USER.id,
      text: commentForm.text.value.trim(),
      date: new Date().toISOString(),
    })
    localStorage.setItem('comments', JSON.stringify(comments))
    commentForm.reset()
    commentForm.classList.remove('was-validated')
    renderComments()
  })
}
