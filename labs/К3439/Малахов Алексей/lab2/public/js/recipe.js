const recipeId = Number(new URLSearchParams(location.search).get('id')) || 1
const followButton = document.getElementById('followButton')
const commentForm = document.getElementById('commentForm')
let recipe
let follows = []

function showNotFound(error) {
  document.getElementById('notFound').classList.remove('d-none')
  document.getElementById('recipe').classList.add('d-none')
  document.getElementById('crumbTitle').textContent = 'Ошибка'
  if (error.status !== 404) {
    document.querySelector('#notFound h1').textContent = 'Не удалось загрузить рецепт'
    document.querySelector('#notFound p').textContent = error.message
  }
}

function renderFollow() {
  const user = currentUser()
  const followed = user && follows.some((follow) => follow.userId === user.id)
  followButton.textContent = followed ? 'Вы подписаны' : 'Подписаться'
  followButton.classList.toggle('active', Boolean(followed))
  followButton.setAttribute('aria-pressed', String(Boolean(followed)))
  document.getElementById('authorFollowers').textContent = plural(follows.length, ['подписчик', 'подписчика', 'подписчиков'])
}

async function toggleFollow() {
  const user = currentUser()
  if (!user) {
    location.href = loginUrl()
    return
  }
  followButton.disabled = true
  try {
    const mine = follows.find((follow) => follow.userId === user.id)
    if (mine) {
      await api(`/follows/${mine.id}`, { method: 'DELETE' })
      follows = follows.filter((follow) => follow.id !== mine.id)
    } else {
      follows.push(await api('/follows', { method: 'POST', body: { userId: user.id, authorId: recipe.userId } }))
    }
    renderFollow()
  } catch (error) {
    showToast(error.message)
    if ([404, 409].includes(error.status)) {
      follows = await api(`/follows?${query({ authorId: recipe.userId })}`)
      renderFollow()
    }
  } finally {
    followButton.disabled = false
  }
}

function renderComments() {
  const container = document.getElementById('comments')
  if (recipe.comments.length === 0) {
    container.innerHTML = '<li class="text-muted">Комментариев пока нет, будьте первым.</li>'
    return
  }
  container.innerHTML = recipe.comments
    .map((comment) => {
      const name = authorName(comment.userId)
      return `
        <li class="d-flex gap-3">
          <span class="avatar" aria-hidden="true">${escapeHtml(initials(name))}</span>
          <div>
            <div class="fw-medium">${escapeHtml(name)} <span class="text-muted small fw-normal">${new Date(comment.date).toLocaleDateString('ru-RU')}</span></div>
            <p class="mb-0">${escapeHtml(comment.text)}</p>
          </div>
        </li>
      `
    })
    .join('')
}

function renderRecipe() {
  const user = currentUser()
  const author = state.profiles.get(recipe.userId)
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

  const name = authorName(recipe.userId)
  const isMine = user && user.id === recipe.userId
  document.getElementById('authorAvatar').textContent = initials(name)
  document.getElementById('authorLink').textContent = name
  document.getElementById('authorLink').href = isMine ? 'profile.html' : `author.html?id=${recipe.userId}`
  if (isMine || !author) {
    followButton.remove()
    document.getElementById('authorFollowers').textContent = isMine ? 'Ваш рецепт' : ''
  } else {
    renderFollow()
    followButton.addEventListener('click', toggleFollow)
  }

  document.getElementById('recipeActions').innerHTML = likeButton(recipe, Boolean(myLike(recipe))) + saveButton(recipe.id, state.saved.has(recipe.id))

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
    ? `<video class="recipe-video" controls preload="metadata" poster="${escapeHtml(recipe.image)}" aria-label="Видео: ${escapeHtml(recipe.title)}">
        <source src="${escapeHtml(recipe.video)}" type="video/webm">
        Ваш браузер не поддерживает видео.
      </video>`
    : '<p class="text-muted mb-0">Автор пока не добавил видео к этому рецепту.</p>'

  renderComments()
  if (!user) {
    commentForm.outerHTML = `<p class="mb-0"><a href="${loginUrl()}">Войдите</a>, чтобы оставить комментарий.</p>`
  }
}

commentForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!validateForm(commentForm)) return
  const user = currentUser()
  if (!user) {
    location.href = loginUrl()
    return
  }
  const button = commentForm.querySelector('button[type=submit]')
  button.disabled = true
  try {
    const comment = await api('/comments', {
      method: 'POST',
      body: { recipeId: recipe.id, userId: user.id, text: commentForm.text.value.trim(), date: new Date().toISOString() },
    })
    recipe.comments.push(comment)
    commentForm.reset()
    commentForm.classList.remove('was-validated')
    renderComments()
  } catch (error) {
    showToast(error.message)
  } finally {
    button.disabled = false
  }
})

async function loadRecipe() {
  try {
    await loadCommon()
    recipe = await api(`/recipes/${recipeId}?_embed=likes&_embed=comments`)
    follows = await api(`/follows?${query({ authorId: recipe.userId })}`)
    remember([recipe])
    renderRecipe()
  } catch (error) {
    showNotFound(error)
  }
}

loadRecipe()
