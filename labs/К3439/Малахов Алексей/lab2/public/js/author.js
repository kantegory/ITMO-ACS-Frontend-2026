const authorId = Number(new URLSearchParams(location.search).get('id'))
const followButton = document.getElementById('followButton')
let author
let recipes = []
let follows = []

function renderFollow() {
  const user = currentUser()
  const followed = user && follows.some((follow) => follow.userId === user.id)
  followButton.textContent = followed ? 'Вы подписаны' : 'Подписаться'
  followButton.classList.toggle('btn-primary', !followed)
  followButton.classList.toggle('btn-outline-primary', Boolean(followed))
  followButton.setAttribute('aria-pressed', String(Boolean(followed)))
  const city = author.city ? ` · ${author.city}` : ''
  document.getElementById('authorMeta').textContent = `@${author.username}${city} · ${plural(follows.length, ['подписчик', 'подписчика', 'подписчиков'])} · ${plural(recipes.length, ['рецепт', 'рецепта', 'рецептов'])}`
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
      follows.push(await api('/follows', { method: 'POST', body: { userId: user.id, authorId: author.id } }))
    }
    renderFollow()
  } catch (error) {
    showToast(error.message)
    if ([404, 409].includes(error.status)) {
      follows = await api(`/follows?${query({ authorId: author.id })}`)
      renderFollow()
    }
  } finally {
    followButton.disabled = false
  }
}

async function loadAuthor() {
  const user = currentUser()
  if (user && user.id === authorId) {
    location.replace('profile.html')
    return
  }
  try {
    await loadCommon()
    ;[author, recipes, follows] = await Promise.all([
      api(`/profiles/${authorId}`),
      api(`/recipes?${query({ userId: authorId, _embed: 'likes' })}`),
      api(`/follows?${query({ authorId })}`),
    ])
  } catch (error) {
    const notFound = document.getElementById('notFound')
    notFound.classList.remove('d-none')
    if (error.status !== 404) notFound.querySelector('h1').textContent = error.message
    return
  }

  document.title = `${author.name}: Вкусная лента`
  document.getElementById('authorPage').classList.remove('d-none')
  document.getElementById('authorAvatar').textContent = initials(author.name)
  document.getElementById('authorName').textContent = author.name
  document.getElementById('authorBio').textContent = author.bio
  renderFollow()
  followButton.addEventListener('click', toggleFollow)
  remember(recipes)
  renderRecipeGrid(document.getElementById('authorRecipes'), recipes, 'У автора пока нет рецептов')
}

loadAuthor()
