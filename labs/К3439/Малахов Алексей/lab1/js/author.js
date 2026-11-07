const authorId = Number(new URLSearchParams(location.search).get('id'))
const author = AUTHORS.find((item) => item.id === authorId)

function renderFollow() {
  const followed = getStored('following').includes(author.id)
  const followers = author.followers + (followed ? 1 : 0)
  const count = RECIPES.filter((recipe) => recipe.authorId === author.id).length
  const button = document.getElementById('followButton')

  button.textContent = followed ? 'Вы подписаны' : 'Подписаться'
  button.classList.toggle('btn-primary', !followed)
  button.classList.toggle('btn-outline-primary', followed)
  document.getElementById('authorMeta').textContent = `@${author.username} · ${author.city} · ${plural(followers, ['подписчик', 'подписчика', 'подписчиков'])} · ${plural(count, ['рецепт', 'рецепта', 'рецептов'])}`
}

if (!author) {
  document.getElementById('notFound').classList.remove('d-none')
} else {
  document.title = `${author.name}: Вкусная лента`
  document.getElementById('authorPage').classList.remove('d-none')
  document.getElementById('authorAvatar').textContent = initials(author.name)
  document.getElementById('authorName').textContent = author.name
  document.getElementById('authorBio').textContent = author.bio

  renderFollow()
  document.getElementById('followButton').addEventListener('click', () => {
    toggleStored('following', author.id)
    renderFollow()
  })

  renderRecipeGrid(
    document.getElementById('authorRecipes'),
    RECIPES.filter((recipe) => recipe.authorId === author.id),
    'У автора пока нет рецептов'
  )
}
